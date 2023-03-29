import { Component, OnInit,Input} from '@angular/core';
import{FormBuilder,FormGroup}from'@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'contract-remarks',
  templateUrl: './contract-remarks.component.html',
  styleUrls: ['./contract-remarks.component.scss']
})
export class ContractRemarksComponent implements OnInit {

  constructor(private activatedRouter: ActivatedRoute) { }

  ngOnInit() {
    this.init();
  }
  public status; 
  public flag;
  public isNzRequired=false;
  public dealDDpstatusTitle:any="";
  public foreignFromDDpstatusTitle:any="";
  @Input() remarkFrom:FormGroup
  @Input() formValue:FormGroup;
  @Input() attachmentOff:any=true;
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
  init()
  {
    this.status=this.activatedRouter.queryParams['value'].taskStatus;
    this.flag=this.activatedRouter.queryParams['value'].flag;
    if(this.status=='ecos_oit_order_resubmit')
    {
      this.isNzRequired=true
    }
    else{
      this.isNzRequired=false;
    }
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
