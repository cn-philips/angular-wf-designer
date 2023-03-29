import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'prebook-v3-oa-approval',
  templateUrl: './oa-approval.component.html'
})

export class OaApprovalComponent implements OnInit {

  @Input() oaApproval: FormGroup

  constructor() { }

  ngOnInit() { }
}