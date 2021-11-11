

import { Component, OnInit, ElementRef, Renderer,Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../services';
import { NzMessageService } from 'ng-zorro-antd';
import { MyTaskService } from '../my-task/my-task.service';
import { ToastService } from 'ng-zorro-antd-mobile';

const count = 2;

@Component({
  selector: 'app-my-approval-await',
  templateUrl: './my-approval-await.component.html',
  styleUrls: ['./my-approval-await.component.scss']
})
export class MyApprovalAwaitComponent implements OnInit {

  pageNumber : number = 0;
  loadState : boolean = false;
  disabledState : boolean = false;
  businessDetailNumber : string;
  finishedState: string = "unfinished";
  keyword: string = '';
  realKeyword: string = '';
  searchCount: number = undefined;
  parentUrl = "/m/my-approval-lists";

  constructor(
    private http: HttpService, 
    private msg: NzMessageService, 
    private router: Router, 
    private _toast: ToastService,
    private myTaskService: MyTaskService
    ) {
  
  }

  init() {

  }

  // nav
  onLeftClick() {
    window.history.go(-1);
  }
  
  //route jump function
  jumpToUrl(url) {
    this.router.navigateByUrl(url);
  }

  // ng zorro list component
  data: any[] = [];
  list: Array<{ loading: boolean; name: any }> = [];

  ngOnInit(): void {
    this.getData((res: any) => {
      if('0000' == res['code']) {
        // console.log('dataInfo',res);
        this.data = res['data'].rows;
        this.list = res['data'].rows;
        console.log(this.data);
        console.log(this.list);
        this.searchCount = Number(res['data']['total']);
      } else {
        const toast = ToastService.fail(res['msg'], 3000);
      }
    }, 'init');
  }

  getData(callback: (res: any) => void, flag?:string): void {
    if(flag === 'init') {
      this.pageNumber = 0;
      this.data = [];
      this.list =[];
    }
    let page: {
      pageNumber?: number;
      pageSize?: number;
      states?: string;
      owner?: string;
      keyword?: string;
    } = {
      pageNumber: this.pageNumber,
      pageSize: 5,
      states: this.finishedState,
      keyword: this.realKeyword,
      owner: localStorage.getItem('ng_philips_code1')
    };

      this.http.post(`/act/task/listAllProcessInstance`, {
        ...page,
        pageNumber: page.pageNumber,
        states: page.states
        // owner: localStorage.get('ng_philips_code1')
      }).subscribe(res => {
        callback(res);
      });
    };

  onLoadMore(): void {
    this.loadState = true;
    this.disabledState = true;
    this.pageNumber += 1;
    let page: {
      pageNumber?: number;
      pageSize?: number;
      states?: string;
      owner?: string;
      keyword?: string;
    } = {
      pageNumber: this.pageNumber,
      pageSize: 5,
      states: this.finishedState,
      keyword: this.realKeyword,
      owner: localStorage.getItem('ng_philips_code1')
    };

    this.list = this.data.concat([...Array(count)].fill({}).map(() => ({ loading: true, name: {} })));
     this.http.post(`/act/task/listAllProcessInstance`, {
        ...page,
        pageNumber: page.pageNumber,
        states : page.states
      }).subscribe((res: any) => {
        if(res.code == "0000"){
          this.data = this.data.concat(res['data'].rows);
          this.list = [...this.data];
          console.log("data", this.data);
          console.log("list", this.list);
          this.searchCount = Number(res['data']['total']);
          this.loadState = false;
          this.disabledState = false;
        } else {
          const toast = ToastService.fail(res['msg'], 3000);
        }
    });
  }

  async onClick(item) {
    console.log(item);
    const processInstanceId = item['processInstanceId'];
    const uri = `/act/task/genericFinishedProcessMainForm/` + processInstanceId +`/finished`;
    let res = await this.http.get(uri).toPromise();

    if ('0000' === res['code']) {
      console.log('resdata', res.data)
      this.myTaskService.taskData = res.data;
    //   console.log('todo', res.data);
      this.router.navigateByUrl('/m/my-approval-await-details');
    } else {
      const toast = ToastService.fail(res['msg'], 3000);
    }
  }

  searchBar(value) {
    // console.log('searchbar!',value);
    this.realKeyword = value;
    // this.reloadData('init');
    this.getData((res: any) => {
      if('0000' === res['code']){
      this.data = res['data'].rows;
      this.list = res['data'].rows;
      console.log(this.data);
      console.log(this.list);
      this.searchCount = Number(res['data']['total']);
      } else {
        const toast = ToastService.fail(res['msg'], 3000);
      }
    }, 'init');
  }

  searchBarBlur() {
    console.log('searchBarBlur');
    if (this.keyword !== this.realKeyword) {
      this.realKeyword = this.keyword;
      // this.reloadData('init');
      this.getData((res: any) => {
        if('0000'==res['code']){
          this.data = res['data'].rows;
          this.list = res['data'].rows;
          console.log(this.data);
          console.log(this.list);
          this.searchCount = Number(res['data']['total']);
        } else {
          const toast = ToastService.fail(res['msg'], 3000);
        }
      }, 'init');
    }

  }

  searchBarCancel() {
    console.log('searchbar! cancel', this.keyword);
    this.realKeyword = '';
    if ('' !== this.keyword) {
      console.log('cancel123', this.keyword);
      this.keyword = '';
      // this.reloadData('init');
      this.getData((res: any) => {
        if('0000'==res['code']) {
        this.data = res['data'].rows;
        this.list = res['data'].rows;
        console.log(this.data);
        console.log(this.list);
        this.searchCount = Number(res['data']['total']);
        } else {
          const toast = ToastService.fail(res['msg'], 3000);
        }
      }, 'init');
    }
  }
  
}
