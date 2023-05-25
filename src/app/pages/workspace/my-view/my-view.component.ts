import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FileService, HttpService, ServesiceService } from '@core/services';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'page-workspace-my-view',
  templateUrl: './my-view.component.html',
  styleUrls: ['./my-view.component.scss']
})
export class MyViewComponent implements OnInit {
  @ViewChild('table') table;
  @ViewChild('subTable') subTable;

  constructor(
    private http: HttpService,
    private message: NzMessageService,
    private changeDetectorRef: ChangeDetectorRef,
    private fileService: FileService,
    private servesiceService: ServesiceService
  ) {
    this.userList = JSON.parse(localStorage.getItem("roleAgents"));
  }

  tabIndex = 0;

  formValues: {
  }

  public isFirstLoad :boolean= true
  public pageParams = {
    pageNo: 1,
    pageSize: 10,
  };
  public total = 0;
  public loading = false;
  public tableData = [];
  public userList = [];

  //子流程参数
  public subPageParams = {
    pageNo: 1,
    pageSize: 10,
  };
  public subTotal = 0;
  public subOitTotal = 0; //子流程OIT完成的数据条数
  public subTableData = [];

  ngOnInit() {
    // this.userList = JSON.parse(localStorage.getItem("roleAgents"));
    // this.getTableData();
  }

  updateParams(values: any) {
    this.formValues = values;
    this.pageParams = {
      pageNo: 1,
      pageSize: 10,
    };
    this.getTableData();
    this.table.resetPage();
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

  //子流程参数更新
  updateSubParams(values: any) {
    if (!values) {
      this.subTableData = [];
    } else {
      this.formValues = values;
      this.subPageParams = {
        pageNo: 1,
        pageSize: 10,
      };
      this.getSubTableData();
      //查询OIT完成条数
      this.getSubOitTotal();
      this.subTable.resetPage();
    }
  }

  //子流程页数更新
  updateSubDataList(pagination: any) {
    if (pagination.reload) {
      this.subPageParams = {
        pageNo: 1,
        pageSize: 10,
      };
    }
    this.subPageParams['pageNo'] = pagination.pageNo;
    this.subPageParams['pageSize'] = pagination.pageSize;
    this.getSubTableData();
  }

  getLoading(loading: boolean) {
    this.loading = loading;
  }

  getTableData() {
    if(this.isFirstLoad){
      this.isFirstLoad = false
    }
    // 我可查看
    const params = {
      ...this.formValues,
      ...this.pageParams
    }

    this.http.post(`/act/ecos/apply/viewable`, params).subscribe((rest => {
      if (rest.code === '0000') {
        const data = rest.data.rows;
        data.map((item, index) => {
          item.processor = item.processor ? item.processor.toLowerCase() : "";
          item.processor = item.processor.split(",");
          const userList = this.userList.filter((val) => { return item.processor.indexOf(val.toLowerCase()) > -1 });
          item.operation = userList.length > 0 ? true : false;
          item.key = item.id;
          if (item.children && item.children.length === 0) {
            delete data[index].children;
          } else if (item.children && item.children.length > 0) {
            item.children.map((ite, inde) => {
              ite.processor = ite.processor ? ite.processor.toLowerCase() : "";
              ite.processor = ite.processor.split(",");
              const userList = this.userList.filter((val) => { return ite.processor.indexOf(val.toLowerCase()) > -1 });
              ite.operation = userList.length > 0 ? true : false;
              ite.key = ite.id;
              if (ite.children && ite.children.length === 0) {
                delete data[index].children[inde].children;
              }
            });
          }
        });
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

  //获取子流程数据
  getSubTableData() {
    // 我可查看
    const params = {
      ...this.formValues,
      orderByClause:'referenceId desc',
      ...this.subPageParams
    }

    this.http.post(`/act/ecos/apply/subviewable`, params).subscribe((rest => {
      if (rest.code === '0000') {
        const data = rest.data.rows;
        data.map((item, index) => {
          item.processor = item.processor ? item.processor.toLowerCase() : "";
          item.processor = item.processor.split(",");
          const userList = this.userList.filter((val) => { return item.processor.indexOf(val.toLowerCase()) > -1 });
          item.operation = userList.length > 0 ? true : false;
        });
        this.subTableData = data;
        this.subTotal = rest.data.total;
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

  //获取子流程OIT完成状态的total条数
  getSubOitTotal() {
    const params = {
      ...this.formValues,
      subTaskStatusIn: ["DBCWJSC","OITENDDBCWJSC","OITEND","ecos_oit_order_done"],
      pageNo: 1,
      pageSize: 10,
    }
    this.http.post(`/act/ecos/apply/subviewable`, params).subscribe((rest => {
      if (rest.code === '0000') {
        this.subOitTotal = rest.data.total;
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

  //清空操作
  reset(e) {
    this.formValues = {};
    this.pageParams = {
      pageNo: 1,
      pageSize: 10,
    };
    this.subPageParams = {
      pageNo: 1,
      pageSize: 10,
    };
    this.subTotal = 0;
    this.subOitTotal = 0;
    this.loading = false;
    this.subTable.resetPage();
    this.tableData = [];
    this.subTableData = [];
  }

  //导出报表 oitType: "MAIN"-主流程, "SUB"-子流程
  public loadingButton = {
    exportExcel: false,
    exportMore: false,
  };
  exportData() {
    // 获取时间
    const params = {
      ...this.formValues,
      pageNo: 1,
      oitType: "MAIN",
    }
    this.loadingButton.exportExcel = true;
    this.http.postDownload(`/act/ecos/report/export/viewable`, params).subscribe(rest => {
      this.fileService.downloadResponse('Tasks', rest);
      this.loadingButton.exportExcel = false;
    }, error => {
      this.message.create('error', '请求错误');
      this.loadingButton.exportExcel = false;
    });
  }
  projectReport(value) {
    // 获取时间
    const params = {
      ...this.formValues,
      pageNo: 1,
      oitType: "SUB",
      subDate: value.submitTime,
    }
    // Object.assign(this.pageParams, subDate)
    this.loadingButton.exportMore = true;
    this.http.postDownload(`/act/ecos/report/oit`, params).subscribe(rest => {
      this.fileService.downloadResponse('OIT Report(DIIGT)', rest);
      this.loadingButton.exportMore = false;
    }, error => {
      this.message.create('error', '请求错误');
      this.loadingButton.exportMore = false;
    });
  }
  //OIT Report US
  projectReportUs(value) {
    // 获取时间
    const params = {
      ...this.formValues,
      pageNo: 1,
      oitType: "SUB",
      subDate: value.submitTime,
    }
    // Object.assign(this.pageParams, subDate)
    this.loadingButton.exportMore = true;
    this.http.postDownload(`/act/ecos/report/oit/us`, params).subscribe(rest => {
      this.fileService.downloadResponse('OIT Report(US)', rest);
      this.loadingButton.exportMore = false;
    }, error => {
      this.message.create('error', '请求错误');
      this.loadingButton.exportMore = false;
    });
  }
   //OIT Report CC-HPM
   projectReportCcHpm(value) {
    // 获取时间
    const params = {
      ...this.formValues,
      pageNo: 1,
      oitType: "SUB",
      subDate: value.submitTime,
    }
    // Object.assign(this.pageParams, subDate)
    this.loadingButton.exportMore = true;
    this.http.postDownload(`/act/ecos/report/oit/cc/hpm`, params).subscribe(rest => {
      this.fileService.downloadResponse('OIT Report(CC-HPM&EC)', rest);
      this.loadingButton.exportMore = false;
    }, error => {
      this.message.create('error', '请求错误');
      this.loadingButton.exportMore = false;
    });
  }
  //OIT Report CC-HRC
  projectReportCcHrc(value) {
    // 获取时间
    const params = {
      ...this.formValues,
      pageNo: 1,
      oitType: "SUB",
      subDate: value.submitTime,
    }
    // Object.assign(this.pageParams, subDate)
    this.loadingButton.exportMore = true;
    this.http.postDownload(`/act/ecos/report/oit/cc/hrc`, params).subscribe(rest => {
      this.fileService.downloadResponse('OIT Report(CC-HRC)', rest);
      this.loadingButton.exportMore = false;
    }, error => {
      this.message.create('error', '请求错误');
      this.loadingButton.exportMore = false;
    });
  }

  biddingReport() {
    const params = {
      ...this.formValues,
      pageNo: 1,
      oitType: "MAIN",
    }
    this.loadingButton.exportMore = true;
    this.http.postDownload(`/act/ecos/report/bidding`, params).subscribe(rest => {
      this.fileService.downloadResponse('Bidding Report', rest);
      this.loadingButton.exportMore = false;
    }, error => {
      this.message.create('error', '请求错误');
      this.loadingButton.exportMore = false;
    });
  }
  preBookReport() {
    const params = {
      ...this.formValues,
      pageNo: 1,
      oitType: "MAIN",
    }
    this.loadingButton.exportMore = true;
    this.http.postDownload(`/act/ecos/report/prebook`, params).subscribe(rest => {
      this.fileService.downloadResponse('Pre-book Report', rest);
      this.loadingButton.exportMore = false;
    }, error => {
      this.message.create('error', '请求错误');
      this.loadingButton.exportMore = false;
    });
  }
  POSReport() {
    const params = {
      ...this.formValues,
      pageNo: 1,
      oitType: "SUB",
    }
    this.loadingButton.exportMore = true;
    this.http.postDownload(`/act/ecos/report/pos`, params).subscribe(rest => {
      this.fileService.downloadResponse('POS Report', rest);
      this.loadingButton.exportMore = false;
    }, error => {
      this.message.create('error', '请求错误');
      this.loadingButton.exportMore = false;
    });
  }
  public opportunityReportEvent(e) {
    this.loadingButton.exportMore = true;
    this.http.postDownload(`/act/ecom/homepage/myViews/reportByOpportunity`, e).subscribe(rest => {
      this.fileService.downloadResponse('进单状态-按Opportunity查询', rest);
      this.loadingButton.exportMore = false;
    }, error => {
      this.message.create('error', '请求错误');
      this.loadingButton.exportMore = false;
    });
  }
  public BundleReportEvent() {
    const params = {
      ...this.formValues,
      pageNo: 1,
      oitType: "MAIN",
    }
    this.loadingButton.exportMore = true;
    this.http.postDownload(`/act/ecos/report/bundle`, params).subscribe(rest => {
      this.fileService.downloadResponse('进单状态-按进单准备表查询', rest);
      this.loadingButton.exportMore = false;
    }, error => {
      this.message.create('error', '请求错误');
      this.loadingButton.exportMore = false;
    });
  }

  //金融方案报表
  financePlanReport(value) {
    // 获取时间
    const params = {
      ...this.formValues,
      pageNo: 1,
      oitType: "SUB",
      subDate: value.submitTime,
    }
    this.loadingButton.exportMore = true;
    this.http.postDownload(`/act/ecos/report/financialScheme`, params).subscribe(rest => {
      this.fileService.downloadResponse('OIT Report(金融方案)', rest);
      this.loadingButton.exportMore = false;
    }, error => {
      this.message.create('error', '请求错误');
      this.loadingButton.exportMore = false;
    });
  }
  //改单报表
  orderChangeReport(value) {
    const params = {
      pageNo: 1,
    }
    this.loadingButton.exportMore = true;
    var url =`/act/ecos/report/changeOrderReport`;
    var fileName = "改单DIIGT";
    if(value === 'us'){
      url =`/act/ecos/report/changeOrderReportUs`;
      fileName = "Report-改单US";
    } else if(value === 'cc'){
      url =`/act/ecos/report/changeOrderReportCc`;
      fileName = "Report-改单CC";
    }
    this.http.postDownload(url, params).subscribe(rest => {
      this.fileService.downloadResponse(fileName, rest);
      this.loadingButton.exportMore = false;
    }, error => {
      this.message.create('error', '请求错误');
      this.loadingButton.exportMore = false;
    });
  }


}
