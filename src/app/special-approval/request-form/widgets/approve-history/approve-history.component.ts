import { Component, OnInit, Input } from '@angular/core';

const taskStatusMap = {
  APPROVED: '已通过',
  REJECTED: '已拒绝',
  WITHDRAW: '已撤回',
  START: '进行中',
}

@Component({
  selector: 'special-approval-approve-history',
  templateUrl: './approve-history.component.html',
  styleUrls: ['./approve-history.component.scss']
})
export class ApproveHistoryComponent implements OnInit {
  @Input() approveHistory = []

  constructor() { }

  ngOnInit(): void { }

  formatTaskStatus({ taskStatus, isDeleted }) {
    if (isDeleted && taskStatus === 'START') {
      return '进行中(已终止)'
    } else {
      return taskStatusMap[taskStatus]
    }
  }
}
