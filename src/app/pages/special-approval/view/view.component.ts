import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router'
import { NzMessageService } from 'ng-zorro-antd'
import * as moment from 'moment'

import { SpecialApprovalService } from '../special-approval.service'
import { SearchParams, RequestItem } from '../special-approval'
import { DEFAULT_ERROR_MESSAGE, APPLY_TYPES, BG_LIST, PROCESS_STATUS } from '../special-approval.constants'
import { APPROVE_NODE_ACTION } from '../special-approval-setting.constants'
import { RouterExtendService } from "@app/modern-themes/services/router-extend.service";

@Component({
  selector: "special-approval-view",
  templateUrl: "./view.component.html",
  styleUrls: ["./view.component.scss"],
})
export class ViewComponent implements OnInit {
  formValues = this.fb.group({
    applyType: [null],
    processStatus: [null],
    orderBg: [null],
    keyword: [null],
    submitDate: [[]],
  });

  public isCollapse = false;
  isFirstLoad = true


  searchParams: SearchParams = {
    pageNo: 1,
    pageSize: 10,
  };

  selectOptions = {
    applyTypes: APPLY_TYPES,
    statuses: [
      { label: "待审批", value: PROCESS_STATUS.START },
      { label: "待反馈", value: APPROVE_NODE_ACTION.FEEDBACK },
      { label: "已完成", value: PROCESS_STATUS.COMPLETED },
      { label: "已退回", value: PROCESS_STATUS.REJECTED },
      { label: "已撤回", value: PROCESS_STATUS.WITHDRAW },
      { label: "已取消", value: PROCESS_STATUS.CANCELLED },
    ],
    bgList: BG_LIST,
  };

  tableData = {
    count: 0,
    loading: false,
    list: [] as RequestItem[],
  };

  constructor(
    private fb: FormBuilder,
    protected spService: SpecialApprovalService,
    private router: Router,
    private message: NzMessageService,
    private routerExt: RouterExtendService,
  ) {}

  ngOnInit(): void {
    // this.getTableData();
  }

  async getTableData(isResetPageNo = false) {
    try {
      this.tableData.loading = true;
      if (isResetPageNo) {
        this.searchParams.pageNo = 1;
      }
      const params = { ...this.searchParams };
      const { applyType, processStatus, orderBg, keyword, submitDate } =
        this.formValues.getRawValue();
      if (submitDate.length > 0) {
        const [startDate, endDate] = submitDate;
        params.submitStartTime = moment(startDate).format("YYYY-MM-DD");
        params.submitEndTime = moment(endDate).format("YYYY-MM-DD");
      }
      keyword && (params.keyword = keyword);
      applyType && (params.applyType = applyType);
      orderBg && (params.orderBg = orderBg);
      if (processStatus) {
        if (processStatus === PROCESS_STATUS.CANCELLED) {
          params.status = 0;
        } else if (processStatus === APPROVE_NODE_ACTION.FEEDBACK) {
          params.nodeAction = APPROVE_NODE_ACTION.FEEDBACK;
          params.status = 1;
        } else {
          params.processStatus = processStatus;
          params.status = 1;
        }
      }
      const { rows, total } = await this.spService.getViewList(params);
      this.tableData.count = total;
      this.tableData.list = rows;
    } catch ({ message }) {
      this.message.error(DEFAULT_ERROR_MESSAGE);
      console.error(`获取我可查看列表数据失败, ${message}`);
    } finally {
      this.tableData.loading = false;
      this.isFirstLoad = false
    }
  }

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  // 跳转到申请详情
  onNavigateToRequestDetail({ id }) {
    this.routerExt.navigateWithNewWindow(["/special-approval/request", id]);
  }
}
