import { Component, OnInit } from '@angular/core';
import { HttpService, GlobalService } from '../../services';
import { Page } from '../../domian';
import { Router } from '@angular/router';
import { MyTaskService } from '../my-task/my-task.service';
import { ToastService } from 'ng-zorro-antd-mobile';

@Component({
  selector: 'app-claim-task',
  templateUrl: './claim-task.component.html',
  styleUrls: ['./claim-task.component.scss']
})
export class ClaimTaskComponent implements OnInit {

  keyword: string = '';
  realKeyword: string = '';
  searchCount: number = undefined;
  loadState: boolean = false;
  disabledState: boolean = false;
  page = new Page();
  rows = [];
  parentUrl="/m";

  constructor(
    private http: HttpService,
    private globalService: GlobalService,
    private myTaskService: MyTaskService,
    private router: Router,
    private _toast: ToastService
  ) {
    this.page.pageNumber = 0;
    this.page.pageSize = 5; //TODO
    this.page.sortName = 'createTime';
    this.page.sortOrder = 'desc';
  }

  ngOnInit() {
    this.reloadData('init');
  }

  async reloadData(flag?: string) {
    this.loadState = true;
    this.disabledState = true;

    if ('init' === flag) {
      this.page.pageNumber = 0;
      this.rows = [];
    } else {
      this.page.pageNumber = this.page.pageNumber + 1;
    }

    // this.keyword = 'UST20190617093519';
    let params = {
      'pageSize': this.page.pageSize,
      'pageNumber': this.page.pageNumber,
      'sortName': this.page.sortName,
      'sortOrder': this.page.sortOrder,
      'keyword' : this.realKeyword
    };

    // const formData = this.searchForm ? this.searchForm.value : {};
    const formData = {};

    // const { createTimeStart, createTimeEnd, finishedTimeStart, finishedTimeEnd } = formData;

    const formValue = {
      ...params
    };

    if (!localStorage.getItem('ng_philips_code1') || '' === localStorage.getItem('ng_philips_code1')) {
      await this.globalService.setLocalStorageUsercode();
    }
    const uri = '/act/task/acceptTaskList/' + localStorage.getItem('ng_philips_code1');


    this.http.post(uri, formValue).subscribe(res => { //TODO only for dev, need to change to post method
      if ('0000' == res.code) {
        // this.searchCount = res.data['total'] || 0;
        this.searchCount = Number(res['data']['total'])
        const data = res.data['rows'] == null ? [] : res.data['rows'];
        // if ('page' === flag && data.length == 0 && this.page.pageNumber != 0) {
        //   this.page.pageNumber = 0;
        //   this.reloadData();
        //   return;
        // }

        if (data.length > 0) {
          this.rows = this.rows.concat(data);
        } else {
          this.page.pageNumber = this.page.pageNumber == 0 ? 0 : (this.page.pageNumber - 1);
        }
        console.log('rows', this.rows);

        this.loadState = false;
        this.disabledState = false;
      } else {
        const toast = ToastService.fail(res['msg'], 3000);
      }
    });
  }

  async onClick(item) {
    // console.log(item);
    // return;
    this.myTaskService.taskObj = item;
    const uri = '/act/task/genericTaskPage';
    const params = item;
    let res = await this.http.post(uri, params).toPromise();

    if ('0000' === res.code) {
      this.myTaskService.taskData = res.data;
      console.log('todo', res.data);
      this.router.navigateByUrl('/m/claim-task/detail');
    } else {
        const toast = ToastService.fail(res['msg'], 3000);
    }
  }

  searchBar(value) {
    // console.log('searchbar!',value);
    this.realKeyword = value;
    this.reloadData('init');
  }

  searchBarBlur() {
    console.log('searchBarBlur');
    if (this.keyword !== this.realKeyword) {
      this.realKeyword = this.keyword;
      this.reloadData('init');
    }

  }

  searchBarCancel() {
    console.log('searchbar! cancel', this.keyword);
    this.realKeyword = '';
    if ('' !== this.keyword) {
      console.log('cancel123', this.keyword);
      this.keyword = '';
      this.reloadData('init');
    }
  }

}
