import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-approvalrecord',
  templateUrl: './approvalrecord.component.html',
  styleUrls: ['./approvalrecord.component.scss']
})
export class ApprovalrecordComponent implements OnInit {
  listOfData = [
    {
      step: '进单准备表',
      operator: '喻昌云',
      approvalResults: '提交',
      remarks: '提交进单准备表',
      operation: '2020/11/1 14:22:46',
    },
    {
      step: '合同概要表',
      operator: 'XXX',
      approvalResults: '已批准',
      remarks: '提交合同概要表',
      operation: '2020/11/2 9:45:11',
    },
    {
      step: 'OA商务专员',
      operator: 'XXX',
      approvalResults: '已批准',
      remarks: '合同概要表预审',
      operation: '2020/11/2 16:02:55',
    }
  ];
  constructor() { }
  ngOnInit() {
  }

}
