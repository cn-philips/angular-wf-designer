import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router'
import { NzMessageService } from 'ng-zorro-antd'
import * as moment from 'moment'

import { SpecialApprovalService } from '../special-approval.service'
import { SearchParams, RequestItem } from '../special-approval'
import { DEFAULT_ERROR_MESSAGE } from '../special-approval.constants'
import { APPLY_TYPE } from '../request-form/request-form.component'

@Component({
  selector: 'special-approval-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {
  formValues = this.fb.group({
    type: [null],
    processStatus: [null],
    bg: [null],
    keyword: [null],
    submitDate: [[]]
  });

  searchParams: SearchParams = {
    pageNo: 1,
    pageSize: 10
  }

  selectOptions = {
    types: [
      { label: '特批开始生产', value: APPLY_TYPE.PRODUCTION },
      { label: '特批发货', value: APPLY_TYPE.DELIVERY },
      { label: '延长保修', value: APPLY_TYPE.EXT_WARRANTY },
      { label: '额外安装费用及其他', value: APPLY_TYPE.EXT_INSTALL_COST }
    ],
    statuses: [
      { label: '待审批', value: 'START' },
      { label: '待反馈', value: 'feedback' },
      { label: '已完成', value: 'APPROVED' },
      { label: '已退回', value: 'REJECTED' },
      { label: '已撤回', value: 'WITHDRAW' },
      { label: '已取消', value: 'CANCEL' },
    ],
    bgs: [
      { label: 'PD&IGT(excl. US)', value: 'PD&IGT' },
      { label: 'US', value: 'US' },
      { label: 'CC', value: 'CC' }
    ]
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
      const { applyType, processStatus, bg, keyword, submitDate } = this.formValues.getRawValue()
      if (submitDate.length > 0) {
        const [ startDate, endDate ] = submitDate
        params.submitStartTime = moment(startDate).format('YYYY-MM-DD')
        params.submitEndTime = moment(endDate).format('YYYY-MM-DD')
      }
      keyword && (params.keyword = keyword)
      applyType && (params.applyType = applyType)
      bg && (params.bg = bg)
      if (processStatus) {
        if (processStatus === 'CANCEL') {
          params.status = 0
        } else {
          params.processStatus = processStatus
          params.status = 1
        }
      }
      const { rows, total } = await this.spService.getViewList(params)
      this.tableData.count = total
      this.tableData.list = rows
    } catch({ message }) {
      this.message.error(DEFAULT_ERROR_MESSAGE)
      console.error(`获取我可查看列表数据失败, ${message}`);
    } finally {
      this.tableData.loading = false
    }
  }

  // 跳转到申请详情
  onNavigateToRequestDetail({ id }) {
    this.router.navigate(['/special-approval/request', id])
  }
}
