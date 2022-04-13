import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd'
import { Router } from '@angular/router'
import * as moment from 'moment'

import { SpecialApprovalService } from '../special-approval.service'
import { SearchParams, RequestItem } from '../special-approval'
import { APPLY_TYPES, BG_LIST, DEFAULT_ERROR_MESSAGE, PROCESS_STATUS } from '../special-approval.constants'

@Component({
  selector: 'special-approval-approved',
  templateUrl: './approved.component.html',
  styleUrls: ['./approved.component.scss']
})
export class ApprovedComponent implements OnInit {
  formValues: FormGroup = this.fb.group({
    applyType: [null],
    bg: [null],
    keyword: [null],
    processStatus: [null],
    submitDate: [[]],
  })

  searchParams: SearchParams = {
    pageNo: 1,
    pageSize: 10
  }

  selectOptions = {
    applyTypes: APPLY_TYPES,
    statuses: [
      { label: '已通过', value: PROCESS_STATUS.COMPLETED },
      { label: '已拒绝', value: PROCESS_STATUS.REJECTED },
    ],
    bgList: BG_LIST,
  }

  tableData = {
    count: 0,
    loading: false,
    list: [] as RequestItem[]
  }

  constructor(
    private fb: FormBuilder,
    private spService: SpecialApprovalService,
    private router: Router,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.getTableData()
  }

  async getTableData(isResetPageNo = false) {
    try {
      this.tableData.loading = true
      if (isResetPageNo) { this.searchParams.pageNo = 1 }
      const params = { ...this.searchParams }
      const { applyType, bg, keyword, submitDate, processStatus } = this.formValues.getRawValue()
      if (submitDate.length > 0) {
        const [ startDate, endDate ] = submitDate
        params.submitStartTime = moment(startDate).format('YYYY-MM-DD')
        params.submitEndTime = moment(endDate).format('YYYY-MM-DD')
      }
      keyword && (params.keyword = keyword)
      applyType && (params.applyType = applyType)
      bg && (params.bg = bg)
      processStatus && (params.processStatus = processStatus)
      const { rows, total } = await this.spService.getApprovedList(params)
      this.tableData.count = total
      this.tableData.list = rows
    } catch ({ message }) {
      this.message.error(DEFAULT_ERROR_MESSAGE)
      console.error(`获取我的已办列表失败, ${message}`);
    } finally {
      this.tableData.loading = false
    }
    
  }

  onNavigateToRequestDetail({ applyId }) {
    this.router.navigate(['/special-approval/request', applyId])
  }
}
