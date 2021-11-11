import { Component, OnInit } from '@angular/core';
import {HttpService, NgxDatatableService} from '../../services';

@Component({
  selector: 'app-bid-record',
  templateUrl: './bid-record.component.html',
  styleUrls: ['./bid-record.component.scss']
})
export class BidRecordComponent implements OnInit {
  getCellClass = this.ngxDatatableService.getCellClass;
  getHeaderClass = this.ngxDatatableService.getHeaderClass;

  row2 = [{id: '123', name: '提交投标申请', taker: '喻昌云', end: '提交', ts: '授权申请', time: '2020/11/1 14：22：46'},
    {id:'123',name:'商务专员',taker:'xxx',end:'已批准',ts:'包含非标准条款；物流条款审批；投标保证金及履约保证金额批准；技术条款审批',time: '2020/11/1 14：22：46'},
    {id:'123',name:'销售部销售主管',taker:'xxx',end:'已批准',ts:'',time:'2020/11/1 14：22：46'},
    {id:'123',name:'销售部销售经理',taker:'xxx',end:'已批准',ts:'',time:'2020/11/1 14：22：46'},
    {id:'123',name:'供应链运营部',taker:'xxx',end:'已批准',ts:'',time:'2020/11/1 14：22：46'},
    {id:'123',name:'第三方产品清单及价格审批',taker:'system',end:'已批准',ts:'Deal Form已审批通过',time:'2020/11/1 14：22：46'},
    {id:'123',name:'商务专员',taker:'xxx',end:'已批准',ts:'待授权发放',time:'2020/11/1 14：22：46'},
    {id:'123',name:'中标备案',taker:'喻昌云',end:'待提交',ts:'',time:'N/A'},
    {id:'123',name:'商务专员',taker:'xxx',end:'待审批',ts:'',time:'N/A'}];

  loadingIndicator = true;
  selected = [];

  constructor(private http: HttpService,
              private ngxDatatableService: NgxDatatableService) { }

  ngOnInit() {
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
