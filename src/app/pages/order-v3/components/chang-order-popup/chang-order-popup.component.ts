import { Component, OnInit, Input, ViewChild, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService, ServesiceService } from '@core/services';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
import { upLoadFileNew } from '@core/util/tools';
import { OrderV3Service } from "../../order-v3.service";


@Component({
  selector: 'chang-order',
  templateUrl: './chang-order-popup.component.html',
  styleUrls: ['./chang-order-popup.component.scss']
})

export class ChangOrderPopupComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private message: NzMessageService,
    public activatedRouter: ActivatedRoute,
    private router: Router,
    private ServesiceService: ServesiceService,
    private serveice: OrderV3Service,
  ) { }

  @Output() select: EventEmitter<any> = new EventEmitter()  
  isAgres: any = false;
  @ViewChild('child') child;
  public load: any = true;
  public dealerNameDdpstatusOff;
  public foreignDdpstatusOff;
  public dealDDpstatusTitle;
  public foreignFromDDpstatusTitle;
  public messageGroup;
  @Input() remarkFrom: FormGroup;
  @Input() formValue: FormGroup;
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
  show(val) {
    this.isAgres = true;
    this.getResonList();
    this.serveice.getMessageGroup().subscribe(res=>{
      if (res.code === '0000') {
        this.messageGroup=res.data;
      }
    })
  }
  public titleName: any;
  ngOnChanges() {
  }

  ngOnInit() {
  }
  public textLen: any = 255;
  public fileFileList: any = [];
  public reasonList: any = []




  //验证必填项
  public checkFormData = () => {
    for (const i in this.remarkFrom.controls) {
      this.remarkFrom.controls[i].markAsDirty();
      this.remarkFrom.controls[i].updateValueAndValidity();
    }
    return this.remarkFrom.valid;
  }
  //原因下拉框
  public getResonList() {
    let url = `act/ecom/order/application/getOrderChange`;
    this.load = true;
    this.http.post(url, { pageSize: 1000, pageNo: 1, status: 1 }).subscribe((rest => {

      if (rest.code === '0000') {
        this.reasonList = rest.data.rows;
        this.load = false;
      }
      else {
        this.message.create('error', `${rest.msg}`);
        this.load = false;
      }
    }),
      (error => {
        this.message.create("error", "请求异常");
        this.load = false;
      }));
  }
  refuseReasonChang(e) {
    let select = this.reasonList.find(val => {
      if (val.orderChange == e) {
        return val
      }
    });
    if (select) {
      this.remarkFrom.patchValue({
        orderChangeId: select.id,
        describes:select.describes
      })
      
    }
  }
  //取消
  isAgreCancels() {
    this.isAgres = false;
  }
  //确定
  isAgregentOk() {
    if(this.isDealerDdpStatus() || this.isforeignDdpStatus()){
      this.message.error("当前经销商或外贸公司DDP已过有效期");
      return;
    }

    const valid = this.checkFormData();
    if (valid) {
      this.load = true;
      const url = `/act/ecos/oit/changeOrder/initiate`;
      const param = this.remarkFrom.getRawValue();
      this.http.post(url, param).subscribe((res => {
        if (res.code == '0000') {
          this.load = false;
          this.isAgres = false;
          this.message.create('success', res.msg);
          this.router.navigate(['/ecos']);
        }
        else {
          this.message.create('error', res.msg);
          this.isAgres = false;
        }
      }), (error) => {
        this.isAgres = false;
        this.message.create('error', '请求失败');
      })
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
