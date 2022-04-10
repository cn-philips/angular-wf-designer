import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {FileService, HttpService} from '../../../services';
import {Router} from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
@Component({
  selector: 'ig-myDraftTask',
  templateUrl: './my-draft-task.component.html',
  styleUrls: ['./my-draft-task.component.scss']
})
export class MyDraftTaskComponent implements OnInit {


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
    private fileService: FileService
    ) {
    this.userList=JSON.parse(localStorage.getItem("roleAgents"));
    const searchConditions = JSON.parse(localStorage.getItem('searchConditions'));
    if (searchConditions === null || searchConditions === 'null') {
    } else {
      this.params = searchConditions;
      console.log(this.params);
      console.log('this.params');
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
    //我的草稿
    this.params['flag']=""
    this.http.post(`/act/ecom/homepage/showMoreMyDraft`,this.params).subscribe(rest => {
      if (rest.code === '0000') {
        debugger
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
        this.changeDetectorRef.markForCheck(); // 数据更新检查
        this.changeDetectorRef.detectChanges();
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }

  exportData() {
    this.params['flag'] = 0;
    this.http.postDownload(`/act/ecom/homepage/showMoreMyDraft/export`, this.params).subscribe(rest => {
      this.fileService.downloadResponse('Tasks', rest);
    });
  }
}
