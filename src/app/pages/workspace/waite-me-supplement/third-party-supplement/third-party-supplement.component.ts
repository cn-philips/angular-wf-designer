import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FileService, HttpService, ServesiceService } from '@core/services';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'page-third-party-supplement',
  templateUrl: './third-party-supplement.component.html',
  styleUrls: ['./third-party-supplement.component.scss']
})
export class ThirdPartySupplementComponent implements OnInit {
  //第三方自采核查
  @ViewChild('table') table;

  formValues:any = {
  }

  public pageParams = {
    pageNo: 1,
    pageSize: 10,
  };
  public total = 0;
  public loading = true;
  public tableData = [];
  public userList = [];
  public isHandle = 0;
  public type = 'third'; // 补充文件类型-第三方自采核查

  constructor(
    private http: HttpService,
    private message: NzMessageService,
    private fileService: FileService,
    private servesiceService: ServesiceService
  ) {
    this.userList = JSON.parse(localStorage.getItem("roleAgents"));
  }

  get isLegancy(): Boolean {
    return [2,3].includes(this.isHandle)
  }
  updateParams(values: any) {
    this.formValues = values;
    this.isHandle = values.isHandle;
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

  debounce(func, delay) {
    let timer;
    return function() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this);
      }, delay);
    };
  }

  getTableData() {
    return this.debounce(() => {
      this.loading = true;
      if (this.isLegancy) {
        this.getLegancyTask();
      } else {
        this.getMordenTask();
      }
    }, 500)();
  }

  getMordenTask() {
    console.log('this.formValues',this.formValues)
    this.formValues = {
      ...this.formValues,
      thirdPartyTodoTaskStatus: this.isHandle ? 'COMPLETED' : 'IN_PROGRESS', // 待处理-IN_PROGRESS  已处理-COMPLETED
      orderByClause: 'createTime desc',
    }

    const params = {
      ...this.formValues,
      ...this.pageParams
    }
    this.http.post(`/act/ecos/thirdParty/task`, params).subscribe((rest => {
      if (rest.code === '0000') {
        const data = rest.data.rows;
        this.tableData = data;
        this.tableData.forEach(item => {
          item.taskStatus = item.processStatus
        })
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
  getLegancyTask() {
    this.formValues = {
      ...this.formValues,
      oaSupplementProductVerification: (this.isHandle-2),
      orderByClause: 'createTime desc',
    }

    // 待我补充
    const params = {
      ...this.formValues,
      ...this.pageParams
    }

    this.http.post(`/act/ecos/apply/todoSupplement`, params).subscribe((rest => {
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

}
