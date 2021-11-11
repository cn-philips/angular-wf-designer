import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-inorder-acc',
  templateUrl: './inorder-acc.component.html',
  styleUrls: ['./inorder-acc.component.scss']
})
export class InorderAccComponent implements OnInit {

  row = [{id:1,name:'进单准备表',taker:'喻昌云',end:'提交',ts:'提交进单准备表',time:'2021/11/1 14：22：46'},
    {id:1,name:'合同概要表',taker:'xxx',end:'已批准',ts:'提交合同概要表',time:'2022/11/2 9：45：11'},
    {id:1,name:'OA商务专员',taker:'xxx',end:'已批准',ts:'合同概要表预审',time:'2020/11/2 16：02：55'},
    {id:1,name:'销售部销售经理',taker:'xxx',end:'已批准',ts:'合同概要表销售部门审核',time:'2020/11/5 13：02：55'},
    {id:1,name:'供应链运营部',taker:'xx',end:'已批准',ts:'合同概要表非标准条款二级部门审核',time:'2020/11/8 15：56：15'},
    {id:1,name:'市场部',taker:'xxx',end:'已批准',ts:'合同概要表非标准条款二级部门审核',time:'N/A'},
    {id:1,name:'OA商务专员',taker:'xxx',end:'已批准',ts:'进单确认',time:'N/A'},
    {id:1,name:'OA商务专员',taker:'xxx',end:'待提交',ts:'Order Summary',time:'N/A'},
    {id:1,name:'OA商务专员',taker:'xxx',end:'待提交',ts:'合同签署',time:'N/A'},
    {id:1,name:'OA商务专员',taker:'xxx',end:'待提交',ts:'OIT完成',time:'N/A'}];


  constructor() { }

  ngOnInit() {
  }

}
