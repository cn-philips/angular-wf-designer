import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'special-approval-flow-info',
  templateUrl: './flow-info.component.html',
  styleUrls: ['./flow-info.component.scss']
})
export class FlowInfoComponent implements OnInit {
  constructor() { }

  @Input() approveNodeList = []

  ngOnInit(): void { }
}
