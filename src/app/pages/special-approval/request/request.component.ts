import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router'
import { NzMessageService } from 'ng-zorro-antd'
import * as moment from 'moment'

import { SpecialApprovalService } from '../special-approval.service'
import { SearchParams, RequestItem } from '../special-approval'
import { DEFAULT_ERROR_MESSAGE, ERROR_MESSAGE, SUCCESS_MESSAGE, APPLY_TYPES, BG_LIST, PROCESS_STATUS } from '../special-approval.constants'
import { APPROVE_NODE_ACTION } from '../special-approval-setting.constants'

@Component({
  selector: 'special-approval-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss']
})
export class RequestComponent implements OnInit {
  formValues = this.fb.group({
    applyType: [null],
    processStatus: [null],
    orderBg: [null],
    keyword: [null],
    submitDate: [[]]
  });

  searchParams: SearchParams = {
    pageNo: 1,
    pageSize: 10
  }

  selectOptions = {
    applyTypes: APPLY_TYPES,
    statuses: [
      { label: '待审批', value: PROCESS_STATUS.START },
      { label: '待反馈', value: APPROVE_NODE_ACTION.FEEDBACK },
      { label: '已完成', value: PROCESS_STATUS.COMPLETED },
      { label: '已退回', value: PROCESS_STATUS.REJECTED },
      { label: '已撤回', value: PROCESS_STATUS.WITHDRAW },
      { label: '已取消', value: PROCESS_STATUS.CANCELLED },
    ],
    bgList: BG_LIST,
  };

  countData = {
    total: 0,
    apply: 0,
    pending: 0,
    approved: 0,
    reject: 0,
    withdraw: 0,
    cancel: 0,
    feedback: 0,
  }

  tableData = {
    count: 0,
    loading: false,
    list: [] as RequestItem[]
  }

  constructor(
    private fb: FormBuilder, 
    protected spService: SpecialApprovalService,
    private router: Router,
    private message: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.getTableData()
    this.getCountData()
  }

  async getTableData(isResetPageNo = false) {
    try {
      this.tableData.loading = true
      if (isResetPageNo) { this.searchParams.pageNo = 1 }
      const params = { ...this.searchParams }
      const { applyType, processStatus, orderBg, keyword, submitDate } = this.formValues.getRawValue()
      if (submitDate.length > 0) {
        const [ startDate, endDate ] = submitDate
        params.submitStartTime = moment(startDate).format('YYYY-MM-DD')
        params.submitEndTime = moment(endDate).format('YYYY-MM-DD')
      }
      keyword && (params.keyword = keyword)
      applyType && (params.applyType = applyType)
      orderBg && (params.orderBg = orderBg)
      if (processStatus) {
        if (processStatus === PROCESS_STATUS.CANCELLED) {
          params.status = 0
        } else if (processStatus === APPROVE_NODE_ACTION.FEEDBACK){
          params.nodeAction = APPROVE_NODE_ACTION.FEEDBACK
          params.status = 1
        } else {
          params.processStatus = processStatus
          params.status = 1
        }
      }
      const { rows, total } = await this.spService.getRequestList(params)
      this.tableData.count = total
      this.tableData.list = rows
    } catch({ message }) {
      this.message.error(DEFAULT_ERROR_MESSAGE)
      console.error(`获取我的申请数据失败, ${message}`);
    } finally {
      this.tableData.loading = false
    }
  }

  async getCountData() {
    try {
      const data = await this.spService.getRequestCount()
      this.countData = data
    } catch({ message }){
      this.message.error(DEFAULT_ERROR_MESSAGE)
      console.error(`获取我的申请统计数据失败, ${message}`);
    }
  }

  getEditBtnTitle({ processStatus, status }) {
    if ([PROCESS_STATUS.WITHDRAW, PROCESS_STATUS.REJECTED].includes(processStatus) && status == 1) {
      return '编辑'
    } else {
      return '查看'
    }
  }

  async onDeleteRequest({ id }) {
    try {
      this.tableData.loading = true
      await this.spService.deleteRequest(id)
      this.message.success(SUCCESS_MESSAGE.DELETE_DRAFT)
      this.getTableData()
    } catch({ message }) {
      this.message.error(ERROR_MESSAGE.DELETE_DRAFT)
      console.error(`删除草稿失败, ${message}, [${id}]`);
    } finally {
      this.tableData.loading = false
    }
  }

  // 取消申请
  async onCancelRequest({ id }) {
    try {
      this.tableData.loading = true
      await this.spService.cancelRequest(id)
      this.message.success(SUCCESS_MESSAGE.CANCEL_REQUEST)
      this.getTableData()
    } catch({ message }) {
      this.message.error(ERROR_MESSAGE.CANCEL_REQUEST)
      console.error(`取消申请失败, ${message}, [${id}]`);
    } finally {
      this.tableData.loading = false
    }
  }

  // 撤回申请
  async onWithdrawRequest({ id }) {
    try {
      this.tableData.loading = true
      await this.spService.withdrawRequest(id)
      this.message.success(SUCCESS_MESSAGE.WITHDRAW_REQUEST)
      this.getTableData()
    } catch({ message }) {
      this.message.error(ERROR_MESSAGE.WITHDRAW_REQUEST)
      console.error(`撤回申请失败, ${message}, [${id}]`);
    } finally {
      this.tableData.loading = false
    }
  }

  // 跳转到申请详情
  onNavigateToRequestDetail({ id }) {
    this.router.navigate(['/special-approval/request', id])
  }
}
