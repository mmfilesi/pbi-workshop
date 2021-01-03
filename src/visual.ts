/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ''Software''), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
'use strict';

console.log('v. 2.0.0.')

/* ==================================================================================
    Imports
 ================================================================================== */

/* Colección de polyfills y utilidades varias
para trabajar con javaScript */
import 'core-js/stable';

/* Estilos propios. ¿Less? */
import './../style/visual.less';

/* powerbi */
import powerbi from 'powerbi-visuals-api';

/* para tipar el constructor */
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;

/* para tipar el update */
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;

/* La clase madre */
import IVisual = powerbi.extensibility.visual.IVisual;

/* Definiciones de la visualización del editor */
import { VisualSettings } from './settings';
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;

/* Utilidades PBI */
import { dataRoleHelper } from 'powerbi-visuals-utils-dataviewutils';

/* ==================================================================================
    Clase principal
 ================================================================================== */
/*
 La clase del objeto visual, del widget, implementa los siguientes métodos:
    constructor, un constructor estándar para inicializar el estado del objeto visual
    update, para actualizar los datos del objeto visual.
    enumerateObjectInstances, para devolver los objetos para rellenar el panel de propiedades (opciones de formato), donde puede modificarlos según sea necesario
    destroy, un destructor estándar para la limpieza.
*/


export class Visual implements IVisual {

  /* Aquí setearemos el contenedor principal del objeto visual*/
  private target: HTMLElement;

  /* Aquí tendremos los datos mapeados como los necesitamos */
  private viewModel = {
    headersName: '',
    headersValue: [],
    rows: []
  };

  /* Preferencias de formato del editor */
  private visualSettings: VisualSettings;

  /* ==========================================================
      Métodos de la clase
  ========================================================== */

  /*
      Options:
          1. elementelement: HTMLElement, una referencia al elemento DOM que contendrá el objeto visual.
          2. featurSwitches
          3. host: IVisualHost, una colección de propiedades y servicios que se pueden usar para interactuar con el host del objeto visual (Power BI).
          4. module 
  */
  constructor(options: VisualConstructorOptions) {
    /* Seteamos el nodo contendor */
    this.target = options.element;
    /* Enganchamos un hola mundo */
    if (document) {
      /* Creamos el elemento, una cabecera */
      const newHeader: HTMLElement = document.createElement('h3');
      /* Insertamos un nodo de texto en la cabecera anterior */
      newHeader.appendChild(document.createTextNode('Práctica pbiviz: Hola Mundo'));
      /* Insertamos la cabecera en el target */
      this.target.appendChild(newHeader);
    }
  }

  public update(options: VisualUpdateOptions) {
    console.log(options)
    this.updateTableSettings(options);
    this.reset();
    this.vmGetHeaders(options);
    this.vmGetRows(options);
    this.renderTable();
  }

  public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
    const settings: VisualSettings = this.visualSettings || <VisualSettings>VisualSettings.getDefault();
    return VisualSettings.enumerateObjectInstances(settings, options);
  }

  /* ==========================================================
      Métodos propios
  ========================================================== */

  private updateTableSettings(options: VisualUpdateOptions) {
    this.visualSettings = VisualSettings.parse<VisualSettings>(options.dataViews[0]);
  }

  private vmGetHeaders(options: VisualUpdateOptions) {
    const indexHeader = dataRoleHelper.getCategoryIndexOfRole(options.dataViews[0].categorical.categories, 'category');
    this.viewModel.headersName = options.dataViews[0].categorical.categories[indexHeader].source.displayName
    this.viewModel.headersValue = options.dataViews[0].categorical.categories[indexHeader].values;
  }

  private vmGetRows(options: VisualUpdateOptions) {
    const len = options.dataViews[0].categorical.values.length;
    let i = 0;

    for (; i < len; i++) {
      let objTemp = {
        categoryName: options.dataViews[0].categorical.values[i].source.displayName,
        categoryValues: options.dataViews[0].categorical.values[i].values
      }
      this.viewModel.rows.push(objTemp);
    }
  }

  /* En la vida real, este método kilométrico habría que separarlo al menos en dos,
  uno para pintar la cabecera y otro las filas. Lo dejo junto sin embargo para que quede
  más claro */
  private renderTable() {
    const len = this.viewModel.headersValue.length;
    const table = document.createElement('table');
    table.classList.add('tresponsive-table');

    if (this.visualSettings && this.visualSettings.table && this.visualSettings.table.alternate) {
      table.classList.add('tresponsive-table--alternate')
    }

    table.id = 'js-main-table';

    const headerTable = document.createElement('thead');
    const rowHeader = document.createElement('tr');

    /* Añadimos una celda vacía para la columna con las categorías */
    let cellHeader = document.createElement('th');
    rowHeader.appendChild(cellHeader);

    for (let i = 0; i < len; i++) {
      cellHeader = document.createElement('th');
      cellHeader.appendChild(document.createTextNode(this.viewModel.headersValue[i]));
      rowHeader.appendChild(cellHeader);
    }

    headerTable.appendChild(rowHeader);
    table.appendChild(headerTable);

    /* En target recordemos que habíamos seteado en el constructor el contenedor principal del objeto visual*/
    this.target.appendChild(table);

    /* Vamos ahora con las filas de cada categoría */
    const bodyTable = document.createElement('tbody');
    const lem = this.viewModel.rows.length;

    for (let i = 0; i < lem; i++) {
      const rowCategory = document.createElement('tr');
      const lec = this.viewModel.rows[i].categoryValues.length;
      const cellCategorName = document.createElement('td');
      cellCategorName.appendChild(document.createTextNode(this.viewModel.rows[i].categoryName));
      rowCategory.appendChild(cellCategorName);

      for (let c = 0; c < lec; c++) {
        const cellCategory = document.createElement('td');
        cellCategory.appendChild(document.createTextNode(this.viewModel.rows[i].categoryValues[c]));
        rowCategory.appendChild(cellCategory);
      }
      bodyTable.appendChild(rowCategory);
    }
    table.appendChild(bodyTable);
  }

  private reset() {
    /* Reseteamos el viewModel */
    this.viewModel.headersValue = [];
    this.viewModel.rows = [];

    /* Reseteamos el DOM */
    /* Lo eliminamos a la antigua, sin el remove, para que sea compatible
    con los pleistoExplorers */
    const table = document.getElementById('js-main-table');
    if (table) {
      table.parentNode.removeChild(table);
    }
  }
}


