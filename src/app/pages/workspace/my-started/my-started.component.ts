import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FileService, HttpService, ServesiceService } from '@core/services';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'page-my-started',
  templateUrl: './my-started.component.html',
  styleUrls: ['./my-started.component.scss']
})
export class MyStartedComponent implements OnInit {

  title: string = '我的申请';
  @ViewChild('table') table;

  tabIndex = 0;

  formValues: {
  }

  public pageParams = {
    pageNo: 1,
    pageSize: 10,
  };
  public total = 0;
  public loading = true;
  public tableData = [];
  public userList = [];

  constructor(
    private http: HttpService,
    private message: NzMessageService,
    private changeDetectorRef: ChangeDetectorRef,
    private fileService: FileService,
    private servesiceService: ServesiceService
  ) {
    this.userList = JSON.parse(localStorage.getItem("roleAgents"));
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

  getLoading(loading: boolean) {
    this.loading = loading;
  }

  ngOnInit() {
    this.getTableData();
  }

  getTableData() {
    
    this.formValues = {
      ...this.formValues,
      applicant: localStorage.getItem('ecom_ng_philips_code1'),
      processStatusNotIn: ['ecos_status_draft'],
      orderByClause: 'updateTime desc',
    }
   
    // 我的申请
    const params = {
      ...this.formValues,
      ...this.pageParams
    }
  
    this.http.post(`/act/ecos/apply/findApply`, params).subscribe((rest => {
      if (rest.code === '0000') {
        const data = rest.data.rows;
        data.map((item, index) => {
          item.processor = item.processor ? item.processor.toLowerCase() : "";
          item.processor = item.processor.split(",");
          const userList = this.userList.filter((val) => { return item.processor.indexOf(val.toLowerCase()) > -1 });
          item.operation = userList.length > 0 ? true : false;
          if (item.children && item.children.length === 0) {
            delete data[index].children;
          } else if (item.children && item.children.length > 0) {
            item.children.map((ite, inde) => {
              ite.processor = ite.processor ? ite.processor.toLowerCase() : "";
              ite.processor = ite.processor.split(",");
              const userList = this.userList.filter((val) => { return ite.processor.indexOf(val.toLowerCase()) > -1 });
              ite.operation = userList.length > 0 ? true : false;
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

  //导出报表
  public exportLoading = false;
  exportData() {
    this.formValues = {
      ...this.formValues,
      applicant: localStorage.getItem('ecom_ng_philips_code1'),
      processStatusNotIn: ['ecos_status_draft'],
      orderByClause: 'updateTime desc',
    }
   
    // 我的申请
    const params = {
      ...this.formValues,
      pageNo: 1,
    }
    this.exportLoading = true;
    this.http.postDownload(`/act/ecos/report/export/findApply`, this.pageParams).subscribe(rest => {
      this.fileService.downloadResponse('Tasks', rest);
      this.exportLoading = false;
    }, error => {
      this.message.create('error', '请求错误');
      this.exportLoading = false;
    });
}


}
