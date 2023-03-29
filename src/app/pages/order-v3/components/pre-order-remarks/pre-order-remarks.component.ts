import { Component, OnInit,Input} from '@angular/core';
import{FormBuilder,FormGroup,FormControl}from'@angular/forms'
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'pre-order-remarks',
  templateUrl: './pre-order-remarks.component.html',
  styleUrls: ['./pre-order-remarks.component.scss']
})
export class ApplyRemarksComponent implements OnInit {

  constructor(private fb:FormBuilder,private activatedRouter: ActivatedRoute) { }
  public status
  public isNzRequired=false;
  public dealDDpstatusTitle:any="";
  public foreignFromDDpstatusTitle:any="";
  ngOnInit() {    
    this.status = this.activatedRouter.queryParams['value'].taskStatus;
    if(this.status=='ecos_oit_deal_resubmit')
    {
      this.isNzRequired=true
    }
  }
  @Input() remarkFrom:FormGroup;
  @Input() formValue:FormGroup;
  get baseInfoFrom(): FormGroup {
    return this.formValue.get("baseInfoFrom") as FormGroup;
  }
  get dealerFrom(): FormGroup {
    return this.formValue.get("dealerFrom") as FormGroup;
  }
  get accountFrom(): FormGroup {
    return this.formValue.get("accountFrom") as FormGroup;
  }
  get contractBuyerFrom(): FormGroup {
    return this.formValue.get("contractBuyerFrom") as FormGroup;
  }
  get foreignFrom(): FormGroup {
    return this.formValue.get("foreignFrom") as FormGroup;
  }
  get endUserFrom(): FormGroup {
    return this.formValue.get("endUserFrom") as FormGroup;
  }
  get priceApproval(): FormGroup {
    return this.formValue.get("priceApproval") as FormGroup;
  }
  isDealerDdpStatus()
  { //经销商提示
    const {businessModel}=this.baseInfoFrom.getRawValue();
    const {dealerDdpStatus,dealerDdpValidityDate}=this.dealerFrom.getRawValue();  
    if ( businessModel== 'DISTRIBUTOR'&&dealerDdpStatus!= "通过")
    {
      this.dealDDpstatusTitle=`当前经销商DDP已过有效期${dealerDdpValidityDate}`;
      return true;
    }
    else{
      return false;
    }     
  }
  isforeignDdpStatus()
  {
    //外贸公司提示
    const {currencySystem}=this.priceApproval.getRawValue();
    const {foreignTradeCorpDdpStatus,foreignTradeCorpDdpValidityDate}=this.foreignFrom.getRawValue();    
    if(currencySystem=="USD"&&foreignTradeCorpDdpStatus!="通过")
    {
      this.foreignFromDDpstatusTitle=`当前外贸公司DDP已过有效期${foreignTradeCorpDdpValidityDate}`;
      return true;
    }
    else
    {
      return false;
    }
  }
    
}
