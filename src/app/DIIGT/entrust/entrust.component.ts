import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {HttpService} from '../../services';
import {codeString} from '../../../assets/js/tools';
import {Router} from '@angular/router';

@Component({
  selector: 'app-entrust',
  templateUrl: './entrust.component.html',
  styleUrls: ['./entrust.component.scss']
})
export class EntrustComponent implements OnInit {

  public tabIndex = 0;
  public validateForm: FormGroup;
  // 短期角色代理
  public paramsShort = {
    pageNo: 1,
    pageSize: 10,
    total: 0
  };
  public tabListShort = {
  };
  public loadingShort = false;

  public subDateOnwer = [];

  // 项目所有人变更
  public paramsOnwer = {
    pageNo: 1,
    pageSize: 10,
    total: 0
  };
  public tabListOnwer = {
  };
  public loadingOnwer = false;


  constructor(private fb: FormBuilder, private http: HttpService, private router: Router) { }

  ngOnInit() {
    this.validateForm = this.fb.group({
      subDateShort: [null],
      subDateOnwer: [null]
    });
    // this.getTabListShortData();
  }

  public getTabListShortData() {
    this.loadingOnwer = true;
    const url = '/act/ecom/homepage/getMyEntrust';
    let pardate = {
      startTime: null,
      endTime: null
    };
    if (this.subDateOnwer[0]) {
      pardate.startTime = this.subDateOnwer[0];
    }
    if (this.subDateOnwer[1]) {
      pardate.endTime = this.subDateOnwer[1];
    }
    const par = Object.assign(this.paramsOnwer, pardate);
    this.http.post(url, par).subscribe(res => {
      if (res.data) {
        this.tabListShort = res.data.rows;
        this.paramsOnwer.total = res.data.total;
      }
      this.loadingOnwer = false;
    }, error => {
      this.loadingOnwer = false;
    });
  }
  // 查看跳转
  public toEntrust(id) {
    this.router.navigate(['/changeonwer'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(id),
        flag: 1
      },
    });
  }

  // 短期角色代理
  public sub_Short(e) {
    console.log(e);
  }
  public changePageIndexShort(e) {
    this.paramsShort.pageNo = e;
    // this.getDataCRM();
  }
  public changePageSizeShort(e) {
    this.paramsShort.pageSize = e;
    // this.getDataCRM();
  }
  // 项目所有人变更
  public sub_Onwer(e) {
    console.log(e);
    this.getTabListShortData();
  }
  public changePageIndexOnwer(e) {
    this.paramsOnwer.pageNo = e;
    // this.getDataCRM();
  }
  public changePageSizeOnwer(e) {
    this.paramsOnwer.pageSize = e;
    // this.getDataCRM();
  }

}
