import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FileService, HttpService} from '../../services';
import {NzMessageService} from 'ng-zorro-antd';
import {HttpRequest} from '@angular/common/http';
import {
  ServesiceService,
} from '../../DIIGT/preOrder/servesice.service';
@Component({
  selector: 'app-my-view',
  templateUrl: './my-view.component.html',
  styleUrls: ['./my-view.component.scss']
})
export class MyViewComponent implements OnInit {

  constructor(
    private router: Router,
    private http: HttpService,
    private message: NzMessageService,
    private  changeDetectorRef: ChangeDetectorRef,
    private fileService: FileService,
    private ServesiceService:ServesiceService
  ) {
    const searchConditions = JSON.parse(localStorage.getItem('searchConditions'));
    if (searchConditions === null || searchConditions === 'null') {
    } else {
      this.params = searchConditions;
    }
    this.getTableData();
  }

  tabIndex = 0;
  params = {
    pageNo: 1,
    pageSize: 10,
  };
  total = 0;
  loading = true;
  listOfMapData = [];
  public userList=[];

  ngOnInit() {
    this.userList=JSON.parse(localStorage.getItem("roleAgents"));
  }

  updateParams(values: any) {
    values.pageNo = this.params.pageNo;
    values.pageSize = this.params.pageSize;
    this.params = values;
    // this.params['pageNo'] = 1;
    this.getTableData();
  }

  updateDataList(pagination: any) {
    // console.log('pagination', pagination);
    this.params['pageNo'] = pagination.pageNo;
    this.params['pageSize'] = pagination.pageSize;
    this.getTableData();
  }

  getLoading(loading: boolean) {
    this.loading = loading;
  }

  getTableData() {
    // 我可查看
    this.params['flag'] = '';
    this.http.post(`/act/ecom/homepage/myViews`, this.params).subscribe((rest => {
      if (rest.code === '0000') {
        const data = rest.data.rows;
        data.map((item, index) => {
          item.processor=item.processor?item.processor.toLowerCase():"";
          item.processor=item.processor.split(",");
          const userList = this.userList.filter((val)=> { return item.processor.indexOf(val) > -1 });
          item.operation=userList.length>0?true:false;
          if (item.children && item.children.length === 0) {
            delete data[index].children;
          } else if (item.children && item.children.length > 0) {
            item.children.map((ite, inde) => {
              ite.processor=ite.processor?ite.processor.toLowerCase():"";
              ite.processor=ite.processor.split(",");
              const userList = this.userList.filter((val)=> { return ite.processor.indexOf(val) > -1 });
              ite.operation=userList.length>0?true:false;
              if (ite.children && ite.children.length === 0) {
                delete data[index].children[inde].children;
              }
            });
          }
        });
        this.listOfMapData = data;
        this.total = rest.data.total;
        this.loading = false;
        this.ServesiceService.myFormLoad.emit(false)
        this.changeDetectorRef.markForCheck(); // 数据更新检查
        this.changeDetectorRef.detectChanges();
      } else {
        this.message.create('error', `${rest.msg}`);
        this.ServesiceService.myFormLoad.emit(false)
      }
    }),(error)=>{
      this.message.create('error','请求异常!');
      this.ServesiceService.myFormLoad.emit(false)
    });
  }

  public loadingButton = {
    resetForm: false,
    exportExcel: false,
    projectReport: false,
    opportunityReport: false,
    BundleReport: false,
    biddingReport: false,
    POSReport: false,
    preBookReport: false
  };
  exportData() {
    // this.params['flag'] = 0;
    this.loadingButton.exportExcel = true;
    this.http.postDownload(`/act/ecom/homepage/myViews/export`, this.params).subscribe(rest => {
      this.fileService.downloadResponse('Tasks', rest);
      this.loadingButton.exportExcel = false;
    }, error => {
      this.message.create('error', '请求错误');
      this.loadingButton.exportExcel = false;
    });
  }
  projectReport(value) {
    // this.params['flag'] = 0;
    // 获取时间
    this.loadingButton.projectReport = true;
    const subDate = {subDate: value.subDate};
    this.http.postDownload(`/act/ecom/homepage/myViews/report`, Object.assign(this.params, subDate)).subscribe(rest => {
      this.fileService.downloadResponse('Tasks', rest);
      this.loadingButton.projectReport = false;
    }, error => {
      this.message.create('error', '请求错误');
      this.loadingButton.projectReport = false;
    });
  }
  biddingReport() {
    this.loadingButton.biddingReport = true;
    this.http.postDownload(`/act/ecom/homepage/myViews/biddingReport`, this.params).subscribe(rest => {
      this.fileService.downloadResponse('Tasks', rest);
      this.loadingButton.biddingReport = false;
    }, error => {
      this.message.create('error', '请求错误');
      this.loadingButton.biddingReport = false;
    });
  }
  preBookReport() {
    this.loadingButton.preBookReport = true;
    this.http.postDownload(`/act/ecom/homepage/myViews/prebookReport`, this.params).subscribe(rest => {
      this.fileService.downloadResponse('Tasks', rest);
      this.loadingButton.preBookReport = false;
    }, error => {
      this.message.create('error', '请求错误');
      this.loadingButton.preBookReport = false;
    });
  }
  POSReport() {
    this.loadingButton.POSReport = true;
    this.http.postDownload(`/act/ecom/homepage/myViews/posReport`, this.params).subscribe(rest => {
      this.fileService.downloadResponse('Tasks', rest);
      this.loadingButton.POSReport = false;
    }, error => {
      this.message.create('error', '请求错误');
      this.loadingButton.POSReport = false;
    });
  }
  public opportunityReportEvent(e) {
    this.loadingButton.opportunityReport = true;
    this.http.postDownload(`/act/ecom/homepage/myViews/reportByOpportunity`, e).subscribe(rest => {
      this.fileService.downloadResponse('Tasks', rest);
      this.loadingButton.opportunityReport = false;
    }, error => {
      this.message.create('error', '请求错误');
      this.loadingButton.opportunityReport = false;
    });
  }
  public BundleReportEvent() {
    this.loadingButton.BundleReport = true;
    this.http.postDownload(`/act/ecom/homepage/myViews/reportBundle`, this.params).subscribe(rest => {
      this.fileService.downloadResponse('Tasks', rest);
      this.loadingButton.BundleReport = false;
    }, error => {
      this.message.create('error', '请求错误');
      this.loadingButton.BundleReport = false;
    });
  }

}
