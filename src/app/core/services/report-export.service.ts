import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root',
})
export class ReportExportService {
  constructor() {}

  public exportAsExcelFile(
    json: any[],
    excelFileName: string,
    header?: any
  ): void {
    const worksheet: XLSX.WorkSheet = header
      ? XLSX.utils.json_to_sheet(json, header)
      : XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(
      data,
      fileName + '_' + new Date().getTime() + EXCEL_EXTENSION
    );
  }

  public exportAsExcelFileFromWBS(rows: any[], excelFileName: string): void {
    if (rows.length > 0) {
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(rows);
      const workbook: XLSX.WorkBook = {
        Sheets: { Sheet1: worksheet },
        SheetNames: ['Sheet1'],
      };
      const excelBuffer: any = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      this.saveAsExcelFile2(excelBuffer, excelFileName);
    } else {
      // this.notifService.message('Aucune ligne à exporter...');
      console.log('error happens');
    }
  }

  private saveAsExcelFile2(buffer: any, baseFileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, baseFileName + '_' + '001' + EXCEL_EXTENSION);
  }

  // private getDateFormat(date: Date): string {
  //   return formatDate(date, 'yyyyMMdd_HHmmss', 'en-US');
  // }
}
