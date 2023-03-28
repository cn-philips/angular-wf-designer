import {Component, Input, OnInit} from '@angular/core';
import {FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-oa-add-info',
  templateUrl: './oa-add-info.component.html',
  styleUrls: ['./oa-add-info.component.scss']
})
export class OaAddInfoComponent implements OnInit {

  @Input() formValue: FormGroup;

  get baseInfoTable(): FormGroup
  {
    return this.formValue.get('baseInfoTable') as FormGroup;
  }
  get baseInfoFrom(): FormGroup
  {
    return this.formValue.get('baseInfoFrom') as FormGroup;
  }
  get priceApproval(): FormGroup
  {
    return this.formValue.get('priceApproval') as FormGroup;
  }
  get oaAddInfo(): FormGroup
  {
    return this.formValue.get('oaAddInfo') as FormGroup;
  }

  contractVersionList = [
    {
      label: '飞利浦版本',
      value: 'philipsVersion'
    },
    {
      label: '客户版本',
      value: 'customerVersion'
    },
  ]

  checkOaAddInfoData = () => {
    for (const i in this.oaAddInfo.controls) {
      this.oaAddInfo.controls[i].markAsDirty();
      this.oaAddInfo.controls[i].updateValueAndValidity();
    }
    return this.oaAddInfo.valid;
  };

  constructor() { }

  ngOnInit() {
  }

  isThirdShow() {
    const businessModel = this.baseInfoFrom.getRawValue().businessModel
    const modality = this.baseInfoFrom.getRawValue().orderModality
    const oitMode = this.baseInfoFrom.getRawValue().oitMode
    const sampleCheck = this.priceApproval.getRawValue().sampleCheck
    if ((businessModel === 'DISTRIBUTOR') && (modality === 'PD&IGT' ? oitMode === 'BIDDING' : true) && sampleCheck === '1') {
      this.oaAddInfo.get('purchaseVerification').setValidators([Validators.required])
      return true
    } else {
      return false
    }
  }
}
