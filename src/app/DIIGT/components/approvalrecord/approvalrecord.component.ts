import { Component, OnInit,Input,Output,EventEmitter} from '@angular/core';

@Component({
  selector: 'app-approvalrecord-acc',
  templateUrl: './approvalrecord.component.html',
  styleUrls: ['./approvalrecord.component.scss']
})
export class ApprovalrecordaccComponent implements OnInit {

  
  row2 = [{id: '123', name: '提交投标申请', taker: '喻昌云', end: '提交', ts: '授权申请', time: '2020/11/1 14：22：46'},
    {id:'123',name:'商务专员',taker:'xxx',end:'已批准',ts:'包含非标准条款；物流条款审批；投标保证金及履约保证金额批准；技术条款审批',time: '2020/11/1 14：22：46'},
    {id:'123',name:'销售部销售主管',taker:'xxx',end:'已批准',ts:'',time:'2020/11/1 14：22：46'},
    {id:'123',name:'销售部销售经理',taker:'xxx',end:'已批准',ts:'',time:'2020/11/1 14：22：46'},
    {id:'123',name:'供应链运营部',taker:'xxx',end:'已批准',ts:'',time:'2020/11/1 14：22：46'},
    {id:'123',name:'第三方产品清单及价格审批',taker:'system',end:'已批准',ts:'Deal Form已审批通过',time:'2020/11/1 14：22：46'},
    {id:'123',name:'商务专员',taker:'xxx',end:'待提交',ts:'待授权发放',time:'2020/11/1 14：22：46'},
    {id:'123',name:'中标备案',taker:'喻昌云',end:'待提交',ts:'',time:'N/A'},
    {id:'123',name:'商务专员',taker:'xxx',end:'待审批',ts:'',time:'N/A'}];

  constructor() { }
  @Input() isDisable:any=false;
  @Output() myEvent = new EventEmitter() 
  ngOnInit() {
  }
  next(){
    this.myEvent.emit("complete-remarks"); //传参给父组件;
  }

}
