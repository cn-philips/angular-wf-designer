import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router'
import { NzMessageService } from 'ng-zorro-antd'
import * as moment from 'moment'

import { SpecialApprovalService } from '../special-approval.service'
import { SearchParams, RequestItem } from '../special-approval'
import { DEFAULT_ERROR_MESSAGE, SUCCESS_MESSAGE, ERROR_MESSAGE } from '../special-approval.constants'
import { APPLY_TYPES, BG_LIST } from '../special-approval.constants'

@Component({
  selector: 'special-approval-draft',
  templateUrl: './draft.component.html',
  styleUrls: ['./draft.component.scss']
})
export class DraftComponent implements OnInit {
  formValues = this.fb.group({
    type: [null],
    bg: [null],
    keyword: [null],
    submitDate: [[]]
  });

  searchParams: SearchParams = {
    pageNo: 1,
    pageSize: 10
  }

  selectOptions = {
    applyTypes: APPLY_TYPES,
    bgList: BG_LIST,
  };

  tableData = {
    count: 0,
    loading: false,
    list: [] as RequestItem[]
  }

  constructor(
    private fb: FormBuilder,
    private spService: SpecialApprovalService,
    private router: Router,
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
      const { applyType, bg, keyword, submitDate } = this.formValues.getRawValue()
      if (submitDate.length > 0) {
        const [ startDate, endDate ] = submitDate
        params.submitStartTime = moment(startDate).format('YYYY-MM-DD')
        params.submitEndTime = moment(endDate).format('YYYY-MM-DD')
      }
      keyword && (params.keyword = keyword)
      applyType && (params.applyType = applyType)
      bg && (params.bg = bg)
      const { rows, total } = await this.spService.getDraftList(params)
      this.tableData.count = total
      this.tableData.list = rows
    } catch({ message }) {
      this.message.error(DEFAULT_ERROR_MESSAGE)
      console.error(`获取草稿列表失败, ${message}`);
    } finally {
      this.tableData.loading = false
    }
  }

  // 跳转到申请详情
  onNavigateToRequestDetail(requestId) {
    this.router.navigate(['/special-approval/request', requestId])
  }

  async onDeleteRequest({ id }) {
    try {
      this.tableData.loading = true
      await this.spService.deleteRequest(id)
      this.message.success(SUCCESS_MESSAGE.DELETE_DRAFT)
      this.getTableData()
    } catch({ message }) {
      this.message.error(ERROR_MESSAGE.DELETE_DRAFT)
      console.error(`删除草稿失败, ${message} [${id}]`);
    } finally {
      this.tableData.loading = false
    }
  }
}
