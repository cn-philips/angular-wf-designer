import { Component, OnInit, ViewChild } from '@angular/core';
import {  HttpService, ServesiceService } from '@core/services';
import { FormBuilder } from '@angular/forms';
import { Router } from "@angular/router";
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'page-dealer-third-party-supplement',
  templateUrl: './dealer-third-party-supplement.component.html',
  styleUrls: ['./dealer-third-party-supplement.component.scss']
})
export class DealerThirdPartySupplementComponent implements OnInit {
  //经销商自采三方核查
  @ViewChild('table') table;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private message: NzMessageService,
    private router: Router,
    private servesiceService: ServesiceService
  ) {}

  public total = 0;
  public loading = true;
  public tableData = [];
  public type = 'third'; // 补充文件类型-第三方自采核查

  formValues = this.fb.group({
    status: null, // 抽查周期状态
    checkDuration: [], // 抽查时间
  })

  public pageParams = {
    pageNo: 1,
    pageSize: 10,
  };

  public randomPickStatus = [
    {label: '未锁定', value: 'UNLOCKED'},
    {label: '已锁定,未全部提交核查报告', value: 'UNCOMMITTED'},
    {label: '已锁定,全部提交核查报告', value: 'COMMITTED'},
  ]


  updateParams() {
    this.pageParams = {
      pageNo: 1,
      pageSize: 10,
    };
    this.getTableData();
    this.table.resetPage();
  }

  // 清空表单选项
  resetForm() {
    this.formValues.reset();
    this.updateParams()
  }

  updateDataList(pagination: any) {
    if (pagination.reload) {
      this.pageParams = {
        pageNo: 1,
        pageSize: 10,
      };
    }
    this.pageParams['pageNo'] = pagination.pageNo;
    this.pageParams['pageSize'] = pagination.pageSize;
    this.getTableData();
  }

  getLoading(loading: boolean) {
    this.loading = loading;
  }

  ngOnInit() {
    this.getTableData();
  }

  getTableData() {
    this.loading = true;
    const { status, checkDuration } = this.formValues.getRawValue();
    let startTime = null
    let endTime = null
    if (checkDuration && checkDuration.length > 0) {
      startTime = checkDuration[0]
      endTime = checkDuration[1]
    }
    const params = {   
      ...this.pageParams,
      status: status,
      checkDurationStartTime: startTime, // 抽查开始时间
      checkDurationEndTime: endTime, // 抽查结束时间
      orderByClause: 'createTime desc',
    }
  
    this.http.post(`/act/ecos/thirdParty/randomPick/query`, params).subscribe((rest => {
      if (rest.code === '0000') {
        const data = rest.data.rows;
        this.tableData = data;
        this.total = rest.data.total;
        this.loading = false;
      } else {
        this.message.create('error', `${rest.msg}`);
        this.servesiceService.myFormLoad.emit(false);
      }
    }), (error => {
      this.loading = false;
      this.servesiceService.myFormLoad.emit(false);
      this.message.create("error", "服务器异常")
    }));
  }

  toNewRandomCycle() {
    const url = "/order-v3/newRandomCycle";
    this.router.navigate([url], {
      queryParams: {
        type: 'add',
      },
    });
  }

}
