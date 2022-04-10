import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms'
import * as FileSaver from 'file-saver';

import { DashboardService } from '../../services'

@Component({
  selector: 'app-leadtime',
  templateUrl: './lead-time.component.html',
  styleUrls: ['./lead-time.component.scss']
})
export class LeadTimeComponent implements OnInit {

  months = []

  years = []

  exportBtnLoading = false

  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardService
  ) { }

  ngOnInit() {
  }

  onYearChange(year) {
    if (!year) {
      this.months = []
    } else {
      this.initMonths()
    }
    this.formValues.patchValue({
      month: null
    })
  }

  initMonths() {
    for(let i = 1; i <= 12; i++) {
      this.months.push({ label: `${i}月`, value: i })
    }
  }

  formValues = this.fb.group({
    year: [null],
    month: [null]
  })

  getExportFileName() {
    const BASIC_FILE_NAME = 'Lead Time'
    const BASIC_FILE_EXT = '.xlsx'
    const { year, month } = this.formValues.value
    let fileName = BASIC_FILE_NAME
    if (year) {
      const formattedYear = new Date(year).getFullYear()
      fileName += `${formattedYear}年`
      if (month) {
        fileName += `${month}月`
      }
    }
    fileName += `分析数据${BASIC_FILE_EXT}`
    return fileName
  }

  onExportData() {
    this.exportBtnLoading = true
    const { year } = this.formValues.value
    this.dashboardService.exportLeadTime({
      ...this.formValues.value,
      year: year ? new Date(year).getFullYear() : ''
    }).subscribe((data) => {
      const fileName = this.getExportFileName()
      FileSaver.saveAs(data, fileName)
      this.exportBtnLoading = false
    })
  }
}
