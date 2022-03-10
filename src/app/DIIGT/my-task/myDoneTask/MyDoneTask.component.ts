import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {FileService, HttpService} from '../../../services';
import {Router} from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'igt-MyDoneTask',
  templateUrl: './MyDoneTask.component.html',
  styleUrls: ['./MyDoneTask.component.scss']
})
export class MyDoneTaskComponent implements OnInit {
  params = {
    pageNo: 1,
    pageSize: 10,
  };
  total = 0;
  loading = true;
  listOfMapData = [];

  constructor(
    private router: Router,
    private http: HttpService,
    private message: NzMessageService,
    private  changeDetectorRef: ChangeDetectorRef,
    private fileService: FileService
    ) {
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
          if (item.children && item.children.length === 0) {
            delete data[index].children;
          } else if (item.children && item.children.length > 0) {
            item.children.map((ite, inde) => {
              ite.processor=ite.processor?ite.processor.toLowerCase():"";
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
    }),(error=>{
      this.loading=false;
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
