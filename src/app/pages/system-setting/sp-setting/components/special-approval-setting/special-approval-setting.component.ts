import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'special-approval-setting',
  templateUrl: './special-approval-setting.component.html',
  styleUrls: ['./special-approval-setting.component.scss'],
})
export class SpecialApprovalSettingComponent implements OnInit {
  activeMode = 'business'

  constructor() { }

  ngOnInit(): void { }
}
