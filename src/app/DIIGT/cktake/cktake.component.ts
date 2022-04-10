import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpService, NgxDatatableService} from '../../services';
import { Router, ActivatedRoute, UrlTree } from '@angular/router';
import {DatatableComponent} from '@swimlane/ngx-datatable';
import {NgForm} from '@angular/forms';
import {Page} from '../../domian';

@Component({
  selector: 'app-cktake',
  templateUrl: './cktake.component.html',
  styleUrls: ['./cktake.component.scss']
})
export class CktakeComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('searchForm') searchForm: NgForm;

  getCellClass = this.ngxDatatableService.getCellClass;
  getHeaderClass = this.ngxDatatableService.getHeaderClass;


  // ****  ngdatabase 数据
  rows = [
    {
      businessNumber: '我的任务-我的待办',
      businessName: '我的待办',
      value: '12321312313',
      createTime: '2021-03-08',
      processCreateTime: '2021-03-08',
      owner: '我的待办',
      to: '/igt/my-task',
    },
    {
      businessNumber: 'oIT完成',
      businessName: 'XX任务转发',
      value: '12321312313',
      createTime: '2021-03-08',
      processCreateTime: '2021-03-08',
      owner: 'oIT完成',
      to: '/completeOit',
    },
    {businessNumber: '2020HENS-1015_2', businessName: 'XX角色短期代理', value: '12321312313', createTime: '2021-03-08', processCreateTime: '2021-03-08', owner: '中标备案', to: '/bid'},
    {businessNumber: '2020NB-GroupS-555', businessName: 'XX任务转发', value: '12321312313', createTime: '2021-03-08', processCreateTime: '2021-03-08', owner: '填写合同概要表', to: '/incon'},
    {businessNumber: '2020NB-GroupS-555', businessName: 'XX任务转发', value: '12321312313', createTime: '2021-03-08', processCreateTime: '2021-03-08', owner: '填写Order Summary', to: '/inorder'},
    {businessNumber: '2020NB-GroupS-555', businessName: 'XX任务转发', value: '12321312313', createTime: '2021-03-08', processCreateTime: '2021-03-08', owner: '授权发放', to: '/emp'},
    {businessNumber: '2020NB-GroupS-555', businessName: 'XX任务转发', value: '12321312313', createTime: '2021-03-08', processCreateTime: '2021-03-08', owner: '', to: '/consign'},
    {businessNumber: '2020NB-GroupS-555', businessName: 'XX任务转发', value: '12321312313', createTime: '2021-03-08', processCreateTime: '2021-03-08', owner: '中标确认', to: '/winning'},
    {businessNumber: '2020NB-GroupS-555', businessName: 'XX任务转发', value: '12321312313', createTime: '2021-03-08', processCreateTime: '2021-03-08', owner: '投标申请表审核', to: '/tenderreview'},
    {businessNumber: '2020NB-GroupS-555', businessName: 'XX任务转发', value: '12321312313', createTime: '2021-03-08', processCreateTime: '2021-03-08', owner: '审核进单准备表', to: '/preorderaudit'},
    {businessNumber: '2020NB-GroupS-555', businessName: 'XX任务转发', value: '12321312313', createTime: '2021-03-08', processCreateTime: '2021-03-08', owner: '修改投标申请表', to: '/applytendermodif'},
    {businessNumber: '2020NB-GroupS-555', businessName: 'XX任务转发', value: '12321312313', createTime: '2021-03-08', processCreateTime: '2021-03-08', owner: '修改进单准备表', to: '/preordermodifs'},
    {businessNumber: '2020NB-GroupS-555', businessName: 'XX任务转发', value: '12321312313', createTime: '2021-03-08', processCreateTime: '2021-03-08', owner: '修改合同概要表', to: '/inconmodif'},
  ];
  loadingIndicator = false;
  selected = [];
  page = new Page();
  /********************************/

  constructor(private http: HttpService,
              private ngxDatatableService: NgxDatatableService,
              private router: Router,
              private aRoute: ActivatedRoute,
              ) {

              }

  ngOnInit() {
    // console.log(this.rows);
  }
  routerGo(parm)  //查看路由
  {
    let url=parm.url?`/${parm.url}/`:"/"
    this.router.navigate([url]);
  }
  /*    ngdatabase 函数*/
  pageCallback(pageInfo: { count?: number, pageSize?: number, limit?: number, offset?: number }) {
    //this.page.pageNumber = pageInfo.offset;
    // this.reloadTable();
  }

  /*    ngdatabase 函数*/
  sortCallback(sortInfo: { sorts: { dir: string, prop: string }[], column: {}, prevValue: string, newValue: string }) {
    // there will always be one "sort" object if "sortType" is set to "single"
    //this.page.sortOrder = sortInfo.sorts[0].dir;
    //this.page.sortName = sortInfo.sorts[0].prop;
    // this.reloadTable();
  }

}
