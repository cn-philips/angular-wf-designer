import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {HttpService} from '../../services';
import {Router} from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'igt-DataDictionary',
  templateUrl: './DataDictionary.component.html',
  styleUrls: ['./DataDictionary.component.scss']
})
export class DataDictionaryComponent implements OnInit {
  public params = {
    pageNo: 1,
    pageSize: 10,
  };
  public total = 0;
  public loading = true;
  public listOfMapData = [];
  public isVisible = false;
  public formData = {};
  public isCreate = true;
  constructor(
    private router: Router,
    private http: HttpService,
    private message: NzMessageService,
    private  changeDetectorRef: ChangeDetectorRef,
  ) {
    this.getTableData();
  }

  public updateParams(values: any) {
    values.pageNo = this.params.pageNo;
    values.pageSize = this.params.pageSize;
    this.params = values;
    // this.params.pageNo = 1;
    // this.params.pageSize = 10;
    this.getTableData();
  }

  public reloadTable(swit: boolean) {
    if (swit) {
      this.params.pageNo = 1;
      this.params.pageSize = 10;
      this.getTableData();
    }
  }

  public controlModel(value: any) {
    this.isVisible = value;
    console.log('+++++', this.isCreate);
  }

  public updateIsCreate(value: any) {
    this.isCreate = value;
    console.log('+++++9999999', this.isCreate);
  }

  public updateFormData(values: any) {
    this.formData = values;
  }

  public updateDataList(pagination: any) {
    console.log('pagination', pagination);
    if (pagination.reload) {
      this.params = {
        pageNo: 1,
        pageSize: 10,
      };
    }
    this.params.pageNo = pagination.pageNo;
    this.params.pageSize = pagination.pageSize;
    this.getTableData();
  }

  public getLoading(loading: boolean) {
    this.loading = loading;
  }

  public ngOnInit() {
    // // 数据字典对象查询
    // this.http.post(`/act/ecom/dictData/queryOneDictData`, params).subscribe(rest => {
    //   if (rest.code === '0000') {
    //     console.log(rest);
    //   } else {
    //     this.message.create('error', `${rest.msg}`);
    //   }
    // });
  }

  public getTableData() {
    // 数据字典查询
    // this.params.dictGroup = '';
    // dictGroup: '',
    //   dictKey: '',
    this.http.post(`/act/ecom/dictData/queryDictData`, this.params).subscribe(rest => {
      if (rest.code === '0000') {
        console.log(rest.data);
        const data = rest.data.rows;
        this.listOfMapData = data;
        this.total = rest.data.total;
        this.loading = false;
        this.changeDetectorRef.markForCheck();  // 数据更新检测
        this.changeDetectorRef.detectChanges();
        console.log('listOfMapData', this.listOfMapData);
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }

}
