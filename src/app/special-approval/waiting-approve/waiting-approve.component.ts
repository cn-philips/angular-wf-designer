import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'
import { Router } from '@angular/router'
import * as moment from 'moment'
import { NzMessageService } from 'ng-zorro-antd'

import { SpecialApprovalService } from '../special-approval.service'
import { SearchParams, RequestItem } from '../special-approval'
import { DEFAULT_ERROR_MESSAGE } from '../special-approval.constants'
import { APPLY_TYPE } from '../request-form/request-form.component'

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
    bg: [null],
    keyword: [null],
    submitDate: [[]],
  })

  selectOptions = {
    types: [
      { label: '特批开始生产', value: APPLY_TYPE.PRODUCTION },
      { label: '特批发货', value: APPLY_TYPE.DELIVERY },
      { label: '延长保修', value: APPLY_TYPE.EXT_WARRANTY },
      { label: '额外安装费用及其他', value: APPLY_TYPE.EXT_INSTALL_COST }
    ],
    bgs: [
      { label: 'PD&IGT(excl. US)', value: 'PD&IGT' },
      { label: 'US', value: 'US' },
      { label: 'CC', value: 'CC' }
    ]
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
    private spService: SpecialApprovalService,
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
      const { applyType, bg, keyword, submitDate } = this.formValues.getRawValue()
      if (submitDate.length > 0) {
        const [ startDate, endDate ] = submitDate
        params.submitStartTime = moment(startDate).format('YYYY-MM-DD')
        params.submitEndTime = moment(endDate).format('YYYY-MM-DD')
      }
      keyword && (params.keyword = keyword)
      applyType && (params.applyType = applyType)
      bg && (params.bg = bg)
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
