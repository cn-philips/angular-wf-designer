import { Injectable } from '@angular/core';
import { isMoneyColumn } from '../util/money.util';

// const getCellStyle = ({ row, column, value }) => {
//   if(column.prop && column.prop == 'type') {
//     console.log(column.prop);
//     return {'datatable-column-header-01': isMoneyColumn(column.prop.toLowerCase())};
//   }
// };

const rejectedFormIds = [
  'sid-CCDD3E5F-BED0-43CD-8EED-EAA6C11F1E45',
  'sid-E58541D9-F5E8-4190-9D3E-040B582A58F4',
  'sid-0B61B920-F60A-4969-A292-AFE79168208F',
  'sid-BED46E2A-3367-4D9F-B829-245A28B6158F',
];

@Injectable({
  providedIn: 'root',
})
export class NgxDatatableService {
  constructor() {}

  getHeaderClass({ row, column, value }) {
    return { 'datatable-column-header-01': true };
  }

  getCellClass({ row, column, value }) {
    if (column.prop && isMoneyColumn(column.prop.toLowerCase())) {
      return { 'datatable-column-money': true };
    } else {
      return { 'datatable-column-normal': true };
    }
  }

  getCellClassAlt({ row, column, value }) {
    if (column.prop && isMoneyColumn(column.prop.toLowerCase())) {
      if (row && row.bold && row.bold == 'true') {
        return { 'datatable-column-money-bold': true };
      } else return { 'datatable-column-money': true };
    } else {
      if (row && row.bold && row.bold == 'true') {
        return { 'datatable-column-normal-bold': true };
      } else return { 'datatable-column-normal': true };
    }
  }

  getAlignToRightClass() {
    return { 'datatable-column-money': true };
  }

  getRejectCellClass({ row, column, value }) {
    // console.log('getRejectCellClass', {row, column, value});
    let result;
    if (
      row &&
      row.taskDefinitionKey &&
      rejectedFormIds.indexOf(row.taskDefinitionKey) > -1
    ) {
      // if (row && row.taskDefinitionKey) {
      result = { 'datatable-column-rejected': true };
    } else {
      result = { 'datatable-column-normal': true };
    }
    return result;
  }
}
