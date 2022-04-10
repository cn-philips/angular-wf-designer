import { Component, OnInit } from '@angular/core';
import {HttpService, NgxDatatableService} from '../../services';

@Component({
  selector: 'app-emp-puc',
  templateUrl: './emp-puc.component.html',
  styleUrls: ['./emp-puc.component.scss']
})
export class EmpPucComponent implements OnInit {

  getCellClass = this.ngxDatatableService.getCellClass;
  getHeaderClass = this.ngxDatatableService.getHeaderClass;

  rows2 = [{cplx:'Market Bundle',cpxh:'Market Bundle1型号',cpmc:'Market Bundle1名称',bdmc:'xx',cpx:'xx',mag:'xx',costcenter:'xx',ts:'xx',cher:[
      {cplx:'子产品',cpxh:'子产品型号1',cpmc:'子产品1型号',bdmc:'xx',cpx:'xx',mag:'xx',costcenter:'xx',ts:'xx'},
      {cplx:'子产品',cpxh:'子产品型号2',cpmc:'子产品2号',bdmc:'xx',cpx:'xx',mag:'xx',costcenter:'xx',ts:'xx'}
    ]},
    {cplx:'Market Bundle',cpxh:'Market Bundle1型号',cpmc:'Market Bundle1名称',bdmc:'xx',cpx:'xx',mag:'xx',costcenter:'xx',ts:'xx',cher:[
        {cplx:'子产品',cpxh:'子产品型号1',cpmc:'子产品1型号',bdmc:'xx',cpx:'xx',mag:'xx',costcenter:'xx',ts:'xx'},
        {cplx:'子产品',cpxh:'子产品型号2',cpmc:'子产品2号',bdmc:'xx',cpx:'xx',mag:'xx',costcenter:'xx',ts:'xx'}
      ]}
  ];


  // ****  ngdatabase 数据
  rows = [{cplx:'Market Bundle',cpxh:'Market Bundle1型号',cpmc:'Market Bundle1名称',bdmc:'xx',cpx:'xx',mag:'xx',costcenter:'xx',ts:'xx'},
    {cplx:'子产品',cpxh:'子产品型号1',cpmc:'子产品1型号',bdmc:'xx',cpx:'xx',mag:'xx',costcenter:'xx',ts:'xx'},
    {cplx:'子产品',cpxh:'子产品型号2',cpmc:'子产品2号',bdmc:'xx',cpx:'xx',mag:'xx',costcenter:'xx',ts:'xx'}];
  loadingIndicator = false;
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

  /*展开*/
  openchen(e, index, cd) {
    const dom = e.target;
    //table-ch-add
    const chen = cd;
    if (dom.getAttribute('data-i') == '0') {
      dom.setAttribute('data-i', '1');
      dom.innerText='隐藏子产品';
      chen.classList.add('table-ch-add');
    }else{
      dom.setAttribute('data-i', '0');
      dom.innerText='显示子产品';
      chen.classList.remove('table-ch-add');
    }
  }


}
