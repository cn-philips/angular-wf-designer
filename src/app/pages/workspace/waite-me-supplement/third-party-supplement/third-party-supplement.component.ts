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

  getTableData() {
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

}
