import {Component, OnInit, ChangeDetectorRef, Input} from '@angular/core';
import {FileService, HttpService} from '../../../services';
import {Router} from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import {
  ServesiceService,
} from '../../../DIIGT/preOrder/servesice.service';
@Component({
  selector: 'igt-MyDoneTask',
  templateUrl: './MyDoneTask.component.html',
  styleUrls: ['./MyDoneTask.component.scss']
})
export class MyDoneTaskComponent implements OnInit {
  @Input() myDoneTask : any = 'myDoneTask';
  params = {
    pageNo: 1,
    pageSize: 10,
  };
  total = 0;
  loading = true;
  listOfMapData = [];
  public userList=[];

  constructor(
    private router: Router,
    private http: HttpService,
    private message: NzMessageService,
    private  changeDetectorRef: ChangeDetectorRef,
    private fileService: FileService,
    private ServesiceService:ServesiceService
    ) {
    this.userList=JSON.parse(localStorage.getItem("roleAgents"));
    const searchConditions = JSON.parse(localStorage.getItem('searchConditions'));
    if (searchConditions === null || searchConditions === 'null') {
    } else {
      if (this.myDoneTask === JSON.parse(localStorage.getItem('currentTab'))) {
        this.params = JSON.parse(localStorage.getItem('searchConditions'));
      }
    }
    this.getTableData();
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

  ngOnInit() {
  }

  getTableData() {
    // 我的任务——我的已办
    this.params['flag'] = 1;
    this.http.post(`/act/ecom/homepage/showMoreMyToDoTask`, this.params).subscribe((rest => {
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
        this.ServesiceService.myFormLoad.emit(false);
        this.changeDetectorRef.markForCheck(); // 数据更新检查
        this.changeDetectorRef.detectChanges();
      } else {
        this.message.create('error', `${rest.msg}`);
        this.ServesiceService.myFormLoad.emit(false);
      }
    }),(error=>{
      this.loading=false;
      this.ServesiceService.myFormLoad.emit(false);
      this.message.create("error","服务器异常！")
    }));
  }

  exportData() {
    this.params['flag'] = 1;
    this.http.postDownload(`/act/ecom/homepage/showMoreMyToDoTask/export`, this.params).subscribe(rest => {
      this.fileService.downloadResponse('Tasks', rest);
    });
  }

}
