import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'special-approval-approver-info',
  templateUrl: './approver-info.component.html',
  styleUrls: ['./approver-info.component.scss']
})
export class ApproverInfoComponent implements OnInit {
  constructor() { }

  selectOptions = {
    approvers: [
      { label: 'approver1', value: 'approver1' },
      { label: 'approver2', value: 'approver2' },
      { label: 'approver3', value: 'approver3' },
    ]
  }

  ngOnInit(): void { }
}
