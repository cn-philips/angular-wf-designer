import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contractsummary',
  templateUrl: './contractsummary.component.html',
  styleUrls: ['./contractsummary.component.scss']
})
export class ContractsummaryComponent implements OnInit {
  disabled = true;
  readonly = true;

  constructor() { }

  ngOnInit() {
  }
  stockCode:any=1;
  empowerList: any = [{ name: "合同概要表信息", value: 1 }];
  itemList:any=[{name:"条目一",value:1},{name:"条目二",value:1},{name:"条目三",value:1}]

}
