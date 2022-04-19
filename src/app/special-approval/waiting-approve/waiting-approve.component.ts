import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'
import { Router } from '@angular/router'
import * as moment from 'moment'
import { NzMessageService } from 'ng-zorro-antd'

import { SpecialApprovalService } from '../special-approval.service'
import { SearchParams, RequestItem } from '../special-approval'
import { DEFAULT_ERROR_MESSAGE, APPLY_TYPES, BG_LIST } from '../special-approval.constants'

@Component({
  selector: 'special-approval-waiting-approve',
  templateUrl: './waiting-approve.component.html',
  styleUrls: ['./waiting-approve.component.scss']
})
export class WaitingApproveComponent implements OnInit {

  searchParams: SearchParams = {
    pageNo: 1,
    pageSize: 10,
  }

  formValues: FormGroup = this.fb.group({
    applyType: [null],
    orderBg: [null],
    keyword: [null],
    submitDate: [[]],
  })

  selectOptions = {
    applyTypes: APPLY_TYPES,
    bgList: BG_LIST,
  };

  countData = {
    total: 0,
    pending: 0,
    approved: 0,
    reject: 0,
  }

  tableData = {
    count: 0,
    loading: false,
    list: [] as RequestItem[]
  }

  constructor(
    protected spService: SpecialApprovalService,
    private router: Router,
    private fb: FormBuilder,
    private message: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.getTableData()
  }

  async getTableData(isResetPageNo = false) {
    try {
      this.tableData.loading = true
      if (isResetPageNo) { this.searchParams.pageNo = 1 }
      const params = { ...this.searchParams }
      const { applyType, orderBg, keyword, submitDate } = this.formValues.getRawValue()
      if (submitDate.length > 0) {
        const [ startDate, endDate ] = submitDate
        params.submitStartTime = moment(startDate).format('YYYY-MM-DD')
        params.submitEndTime = moment(endDate).format('YYYY-MM-DD')
      }
      keyword && (params.keyword = keyword)
      applyType && (params.applyType = applyType)
      orderBg && (params.orderBg = orderBg)
      const { rows, total } = await this.spService.getWaitingApproveList(params)
      this.tableData.count = total
      this.tableData.list = rows
    } catch({ message }) {
      this.message.error(DEFAULT_ERROR_MESSAGE)
      console.error(`获取我的待办列表失败, ${message}`);
    } finally {
      this.tableData.loading = false
    }
  }

  // 跳转到申请详情
  onNavigateToRequestDetail({ applyId, taskInstId }) {
    this.router.navigate(['/special-approval/request', applyId], {
      queryParams: { taskId: taskInstId }
    })
  }
}
