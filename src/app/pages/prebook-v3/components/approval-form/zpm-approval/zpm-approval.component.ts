import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'prebook-v3-zpm-approval',
  templateUrl: './zpm-approval.component.html'
})

export class ZpmApprovalComponent implements OnInit {

  @Input() zpmApproval: FormGroup

  constructor() { }

  ngOnInit() { }
}