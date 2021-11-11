import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FileService, HttpService} from '../../services';
import {NzMessageService} from 'ng-zorro-antd';

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
    private fileService: FileService
  ) {
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

  ngOnInit() {
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
    this.http.post(`/act/ecom/homepage/myViews`, this.params).subscribe(rest => {
      if (rest.code === '0000') {
        const data = rest.data.rows;
        data.map((item, index) => {
          if (item.children && item.children.length === 0) {
            delete data[index].children;
          } else if (item.children && item.children.length > 0) {
            item.children.map((ite, inde) => {
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
    // this.params['flag'] = 0;
    this.http.postDownload(`/act/ecom/homepage/myViews/export`, this.params).subscribe(rest => {
      this.fileService.downloadResponse('Tasks', rest);
    });
  }
  projectReport() {
    // this.params['flag'] = 0;
    this.http.postDownload(`/act/ecom/homepage/myViews/report`, this.params).subscribe(rest => {
      this.fileService.downloadResponse('Tasks', rest);
    });
  }

}
