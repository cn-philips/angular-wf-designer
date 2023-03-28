import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms'
import * as FileSaver from 'file-saver';

import { DashboardService } from '@core/services'

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
    this.months = []
    if (year) {
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
    modalityList: [[
      { label: 'PD&IGT', value: 'PD&IGT', checked: true },
      { label: 'US', value: 'US', checked: true },
      { label: 'CC', value: 'CC', checked: true },
    ]],
    year: [null],
    month: [null]
  })

  getExportFileName() {
    const BASIC_FILE_NAME = 'Lead Time'
    const BASIC_FILE_EXT = '.xlsx'
    const { year, month, modalityList } = this.formValues.value
    const modalitys = modalityList.filter(({ checked }) => checked).map(({ value }) => value)

    let fileName = BASIC_FILE_NAME
    if (year) {
      const formattedYear = new Date(year).getFullYear()
      fileName += `${formattedYear}年`
      if (month) {
        fileName += `${month}月`
      }
    }
    if (modalitys.length > 0) {
      fileName += ('-' + modalitys.join('-') + '-')
    }
    fileName += `分析数据${BASIC_FILE_EXT}`
    return fileName
  }

  onExportData() {
    this.exportBtnLoading = true
    const { year, month, modalityList } = this.formValues.value
    this.dashboardService.exportLeadTime({
      modalityList: modalityList.filter(({ checked }) => checked).map(({ value }) => value),
      month,
      year: year ? new Date(year).getFullYear() : ''
    }).subscribe((data) => {
      const fileName = this.getExportFileName()
      FileSaver.saveAs(data, fileName)
      this.exportBtnLoading = false
    })
  }
}
