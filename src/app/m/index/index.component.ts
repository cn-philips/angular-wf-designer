import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService, GlobalService } from '../../services';
import { ToastService } from 'ng-zorro-antd-mobile';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {

  @ViewChild("myApprovalIcon") icon1: TemplateRef<any>;
  @ViewChild("claimTaskIcon") icon2: TemplateRef<any>;
  @ViewChild("myTaskIcon") icon3: TemplateRef<any>;
  @ViewChild("claimTaskCountAppend") claimTaskCountAppend: TemplateRef<any>;
  @ViewChild("pendingTaskCountAppend") pendingTaskCountAppend: TemplateRef<any>;
  @ViewChild("approvalAwaitCountAppend") approvalAwaitCountAppend: TemplateRef<any>;
  menuBtnList = [];
  realMenuBtnList = [];
  viewMenuBtnList = [];
  onlySale: boolean = false;
  approvalAwaitCount: number = 0;
  claimTaskCount: number = 0;
  pendingTaskCount: number = 0;
  
  constructor(private router: Router, private http: HttpService, private _toast: ToastService,) { }

  ngOnInit() {
    this.getMenuBtns();
  }

  jumpToUrl(url) {
    this.router.navigateByUrl(url);
  }

  getMenuBtns() {
    let code1 = localStorage.getItem('ng_philips_code1');
    this.http.get('/act/queryUserMenu?code1='+ code1).subscribe(async res => {
      //console.log(res);
      if ('0000' == res.code) {
        // console.log(res.data);
        let menusRaw = res.data;
        if (menusRaw.length > 0) {
          let tmpSet = new Set();
          this.recurMenus(menusRaw, tmpSet);
          this.menuBtnList = Array.from(tmpSet);
        }

        if(true) {

          let res = await this.http.get('/act/getUserInfo').toPromise();
          if('0000' == res.code) {
            const data = res.data;
            let hasSale = false;
            let hasOtherRole = false;
            const tblGroupList = data['tblGroupList'] || [];
            console.log('userInfo', data);
            localStorage.setItem('ng_philips_code1', data['code']);
            // console.log('rowCodes', data['roleCodes']);
            if ((data['disabled'] === false) && tblGroupList.length > 0) {
              for(let item of tblGroupList) {
                if(item['code'].toString().toUpperCase() == 'SALES' ) {
                  hasSale = true;
                } else {
                  hasOtherRole = true;
                }
              }
            }

            if(hasSale && !hasOtherRole) {//判断当前登录人只有销售角色
              if(this.menuBtnList.indexOf('my-approval')) {
                this.realMenuBtnList = ['my-approval']; 
              } else {
                this.realMenuBtnList = [...this.menuBtnList];
              }
            } else {
              this.realMenuBtnList = [...this.menuBtnList];
            }

            this.realMenuBtnList.forEach(item => {
              if(item === 'my-task') {
                this.viewMenuBtnList.push({
                  order: 2,
                  url: '/m/my-task',
                  display: '我的任务',
                  icon: this.icon3,
                  append: this.pendingTaskCountAppend
                });
              } else if (item === 'claim-task') {
                this.viewMenuBtnList.push({
                  order: 1,
                  url: '/m/claim-task',
                  display: '待接收',
                  icon: this.icon2,
                  append: this.claimTaskCountAppend
                });
              } else if (item === 'my-approval') {
                this.viewMenuBtnList.push({
                  order: 0,
                  url: '/m/my-approval-lists',
                  display: '我的申请',
                  icon: this.icon1,
                  append: this.approvalAwaitCountAppend
                });
              }
            });

            console.log('viewMenuBtnList', this.viewMenuBtnList);
            if(this.viewMenuBtnList.length > 0){//按order排序
              this.viewMenuBtnList.sort(function (a, b) {
                return a.order - b.order;
              });
            }

            if (this.realMenuBtnList.indexOf('my-approval') > -1) {//获取我的任务（进行中）数量
              this.getApprovalAwaitCount();
            }
            if (this.realMenuBtnList.indexOf('claim-task') > -1) {//获取待接收任务数量
              this.getClaimTaskCount();
            }
            if (this.realMenuBtnList.indexOf('my-task') > -1) {//获取待办任务数量
              this.getPendingTaskCount();
            }
            

          } else {
            const toast = ToastService.fail(res['msg'], 3000);

          }
        }
      } else {
        const toast = ToastService.fail(res['msg'], 3000);
      }
    });
  }

  recurMenus(event, tmpSet) {
    for (let i = 0; i < event.length; i++) {
      this.checkUrl(event[i]['value']['url'], tmpSet);
      if (event[i]['childs'].length > 0) {
        this.recurMenus(event[i]['childs'], tmpSet);
      }
    }
  }

  checkUrl(str, tmpSet) {
  if(str.indexOf('/listAllProcessInstance') != -1) { //我的申请
    tmpSet.add('my-approval');
    return;
  } else if(str.indexOf('/task/acceptTaskList') != -1) { //待接收
    tmpSet.add('claim-task');
    return;
  } else if (str.indexOf('/taskList/') != -1) { //我的任务
    tmpSet.add('my-task');
    return;
  }
  //below for dev reference
  // if (str.indexOf('masterdata') != -1) {
  //   return '/master-data-maintenance';
  // } else if (str.indexOf('template') != -1) {
  //   return '/template-maintenance';
  // } else if (str.indexOf('/relation/queryAll') != -1) {
  //   return '/role-authorization';
  // } else if (str.indexOf('queryAllUser') != -1) {
  //   return '/personal-info';
  // } else if (str.indexOf('model/list') != -1) {
  //   return '/new-approval';
  // } else if (str.indexOf('/taskList/') != -1) { //TODO only for dev
  //   return '/my-task';
  // } else if (str.indexOf('/listAllProcessInstance') != -1) { //TODO only for dev
  //   return '/my-approval';
  // } else if (str.indexOf('/draft/listAll') != -1) { //TODO only for dev
  //   return '/my-draft';
  // } else if (str.indexOf('/task/acceptTaskList') != -1) { //TODO only for dev
  //   return '/claim-task';
  // } else if (str.indexOf('/quotation/queryAll') != -1) { //TODO only for dev
  //   return '/quotation-management';
  // } else if (str.indexOf('/oabws/query') != -1) {
  //   return '/oa-bwsfile';
  // } else if (str == 'dimensiontree') {
  //   return '/dimension-tree';
  // } else if (str == 'rolemanager') {
  //   return '/role-list';
  // } else if (str == 'admintools') {
  //   return '/admin-tools';
  // } else if (str == 'usermanager') {
  //   return '/app-personnel-management';
  // } else if (str == 'groupmanager') {
  //   return '/app-group-management';
  // } else if (str == '/report/pageQuery') {
  //   return '/report';
  // }
  }

  getApprovalAwaitCount() {
    const uri = '/act/task/listAllProcessInstance';
    const params = {
      'pageSize': 1,
      'pageNumber': 0,
      'owner': localStorage.getItem('ng_philips_code1'),
      'states': 'unfinished'
    };
    this.http.post(uri, params).subscribe(res => {
      if ('0000' === res.code) {
        this.approvalAwaitCount = Number(res['data']['total']) || 0;
      } else {
        const toast = ToastService.fail(res['msg'], 3000);
      }
    });
  }

  getClaimTaskCount() {
    const uri = '/act/task/acceptTaskList/' + localStorage.getItem('ng_philips_code1');
    const params = {
      'pageSize': 1,
      'pageNumber': 0
    };
    this.http.post(uri, params).subscribe(res => {
      if('0000' === res.code) {
        this.claimTaskCount = Number(res['data']['total']) || 0;
      } else {
        const toast = ToastService.fail(res['msg'], 3000);
      }
    });
  }

  getPendingTaskCount() {
    const uri = '/act/task/taskList/' + localStorage.getItem('ng_philips_code1');
    const params = {
      'pageSize': 1,
      'pageNumber': 0
    };
    this.http.post(uri, params).subscribe(res => {
      if ('0000' === res.code) {
        this.pendingTaskCount = Number(res['data']['total']) || 0;
      } else {
        const toast = ToastService.fail(res['msg'], 3000);
      }
    });
  }


}
