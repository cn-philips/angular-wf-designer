import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {OrderV3Service} from '@pages/order-v3/order-v3.service';
import {areaList} from '@core/util/areajson';
import {ActivatedRoute, Router} from '@angular/router';
import { HttpService } from "@core/services/http.service";
import { saveAs } from 'file-saver';
import{fomatFloat} from '@core/util/tools'

@Component({
  selector: 'ecos-ordersummary-info',
  templateUrl: './ordersummary-info.component.html',
  styleUrls: ['./ordersummary-info.component.scss']
})
export class OrdersummaryVerificationComponent implements OnInit {

  @Input() formValue: FormGroup;

  @Input() bg: string;
  
  flag:any;
  orderModeList: any;
  orderModeLists: any;
  currOptionInfo: any=[];
  provinceList: any = [];
  cityList: any = [];
  status: any = null; //流程状态
  isShowOptionModal:any=false;

  bidTypeModeList: any = [
    { code: "国内公开标", label: "国内公开标" },
    { code: "国际公开标", label: "国际公开标" },
    { code: "其他类型", label: "其他类型" },
  ];
  public style: any = { width: "100%" }; //控制日期控件样式
  public switchValid:any=false;
  @Input() editable: boolean = true;
  @Input() editPreTable:boolean=true;
  @Output() addProduct = new EventEmitter();
  @ViewChild("selectDealer") selectDealer;
  @ViewChild("selectHospital") selectHospital;
  @ViewChild("selectForign") selectForign;
  @ViewChild("selectDeal") selectDeal;
  @Input() isContract:any=false;

  public saleRegions;

  public promotionPlanName: string

  get baseInfoTable(): FormGroup
  {
    return this.formValue.get('baseInfoTable') as FormGroup;
  }
  get baseInfoFrom(): FormGroup
  {
    return this.formValue.get('baseInfoFrom') as FormGroup;
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
  get marketBundleInfo():FormGroup{
    return this.formValue.get("marketBundleInfo") as FormGroup;
  }
  get businessModelName()
  {
     const {businessModel}= this.baseInfoFrom.getRawValue();    
     if(businessModel=='DIRECT')
     {
       return "Direct Deal"
     }
     else if(businessModel=="DISTRIBUTOR")
     {
      return "Distributor Deal"
     }
  }

  get biddingAwardPriceModel()
  {    
      const {biddingAwardPrice,biddingAwardCurrency}=this.baseInfoFrom.getRawValue();
      let biddingPrice=fomatFloat(biddingAwardPrice,2)
      if(biddingAwardPrice!=null&&biddingAwardPrice!=""&&biddingAwardPrice!=undefined)
      {
         return `${biddingPrice}(${biddingAwardCurrency})`
      }
      else{
        return ""
      }
  }

  get orderSalesModel() {
    const { orderSales, orderSalesName } =
      this.baseInfoFrom.getRawValue();    
    if (orderSales) {
      return `${orderSalesName}(${orderSales})`;
    }
    else {
      return ""
    }

  }
  
  get dealerSapCode()
  {
    return this.dealerFrom.getRawValue().dealerSapCode
  }


  constructor(
    public serveic: OrderV3Service,
    private fb: FormBuilder,
    private activatedRouter: ActivatedRoute,
    private router: Router,
    private http: HttpService
  ) {
    this.provinceList = areaList.map((val) => ({
      code: val.code,
      value: val.value,
    }));
  }

  ngOnInit() {
    this.status = this.activatedRouter.queryParams["value"].taskStatus;
    this.flag=this.activatedRouter.queryParams["value"].flag;
    this.serveic.orderEntryMode().then(res=>{
      if(res.code=='0000')
      {

        this.orderModeList=res.data;
        if(res.data&&res.data.length>0)
        {
          this.orderModeLists=JSON.parse(JSON.stringify(res.data));
        }
      }
    })
    this.getPromPlan()   
    const sofonFileReOpen=['ecos_oit_order_os_input','ecos_oit_order_sign','ecos_oit_order_upload'];
    const roleoff=JSON.parse(localStorage.getItem('roles')).includes('OA')
    if(this.flag=='0'&&sofonFileReOpen.includes(this.status)&&roleoff)
    {
      this.switchValid=true;
      this.priceApproval.patchValue({
        switchValid:false
      })
      this.priceApproval.get('sofonFile').enable();
      this.priceApproval.get('sofonNo').enable();
    }
    else
    {
      this.switchValid=false;
      this.priceApproval.get('sofonFile').disable();
      this.priceApproval.get('sofonNo').disable();
      this.priceApproval.patchValue({
        switchValid:true
      })
    }
  }

  checkFormData = () => {
    for (const i in this.baseInfoTable.controls) {
      this.baseInfoTable.controls[i].markAsDirty();
      this.baseInfoTable.controls[i].updateValueAndValidity();
    }
    return this.baseInfoTable.valid;
  };

  showDealBtn() {
    const status = this.activatedRouter.queryParams["value"].taskStatus;
    if (!status) {
      return true;
    } else {
      return false;
    }
  }

  ifForeignTradeCompany() {
    const currencySystem = this.priceApproval.getRawValue().currencySystem;
    if (currencySystem != "USD") {
      this.foreignFrom.get("foreignTradeCorpSapCode")!.clearValidators();
      this.foreignFrom.get("foreignTradeCorpDdpStatus")!.clearValidators();
      this.foreignFrom.get("foreignTradeCorpDdpValidityDate")!.clearValidators();
      this.foreignFrom.get("foreignTradeCorpTaxNum")!.clearValidators();
      this.foreignFrom.get("foreignTradeCorpAddress")!.clearValidators();
      this.foreignFrom.get("foreignTradeCorpName")!.clearValidators();
      this.foreignFrom.get("foreignTradeCorpPhone")!.clearValidators();
      this.foreignFrom.get("foreignTradeCorpContact")!.clearValidators();
      this.foreignFrom.get("foreignTradeCorpEmail")!.clearValidators();
      this.foreignFrom.get("importAgreementSignName")!.clearValidators();
      this.foreignFrom.get("importAgreementSignPosition")!.clearValidators();
    } else {
      this.foreignFrom
        .get("foreignTradeCorpSapCode")!
        .setValidators(Validators.required);
      this.foreignFrom
        .get("foreignTradeCorpDdpStatus")!
        .setValidators(Validators.required);
      this.foreignFrom
        .get("foreignTradeCorpDdpValidityDate")!
        .setValidators(Validators.required);
      this.foreignFrom
        .get("foreignTradeCorpTaxNum")!
        .setValidators(Validators.required);
      this.foreignFrom
        .get("foreignTradeCorpAddress")!
        .setValidators(Validators.required);
      this.foreignFrom
        .get("foreignTradeCorpName")!
        .setValidators(Validators.required);
      this.foreignFrom
        .get("foreignTradeCorpPhone")!
        .setValidators(Validators.required);
      this.foreignFrom
        .get("foreignTradeCorpContact")!
        .setValidators(Validators.required);
      this.foreignFrom
        .get("importAgreementSignName")!
        .setValidators(Validators.required);
      this.foreignFrom
        .get("importAgreementSignPosition")!
        .setValidators(Validators.required);
    }
  }
  iscontractBuyer() {
    const businessModel = this.baseInfoFrom.getRawValue().businessModel;
    if (businessModel != "DIRECT") {
      this.contractBuyerFrom.get("contractBuyer")!.clearValidators();
      this.contractBuyerFrom.get("contractBuyerSapCode")!.clearValidators();
      this.contractBuyerFrom.get("contractBuyerTaxNum")!.clearValidators();
      this.contractBuyerFrom.get("contractBuyerAddress")!.clearValidators();
      this.contractBuyerFrom.get("contractBuyerPhone")!.clearValidators();
      this.contractBuyerFrom.get("contractBuyerContact")!.clearValidators();
      this.contractBuyerFrom.get("contractBuyerEmail")!.clearValidators();
      this.contractBuyerFrom.get("contractBuyerSignatory")!.clearValidators();
      this.contractBuyerFrom
        .get("contractBuyerSignatoryPosition")!
        .clearValidators();
    } else {
      this.contractBuyerFrom
        .get("contractBuyer")!
        .setValidators(Validators.required);
      this.contractBuyerFrom
        .get("contractBuyerSapCode")!
        .setValidators(Validators.required);
      this.contractBuyerFrom
        .get("contractBuyerTaxNum")!
        .setValidators(Validators.required);
      this.contractBuyerFrom
        .get("contractBuyerAddress")!
        .setValidators(Validators.required);
      this.contractBuyerFrom
        .get("contractBuyerPhone")!
        .setValidators(Validators.required);
      this.contractBuyerFrom
        .get("contractBuyerContact")!
        .setValidators(Validators.required);
      this.contractBuyerFrom
        .get("contractBuyerEmail")!
        .setValidators(Validators.required);
      this.contractBuyerFrom
        .get("contractBuyerSignatory")!
        .setValidators(Validators.required);
      this.contractBuyerFrom
        .get("contractBuyerSignatoryPosition")!
        .setValidators(Validators.required);
    }
    this.contractBuyerFrom.get("contractBuyer")!.updateValueAndValidity();
    this.contractBuyerFrom
      .get("contractBuyerSapCode")!
      .updateValueAndValidity();
    this.contractBuyerFrom.get("contractBuyerTaxNum")!.updateValueAndValidity();
    this.contractBuyerFrom
      .get("contractBuyerAddress")!
      .updateValueAndValidity();
    this.contractBuyerFrom.get("contractBuyerPhone")!.updateValueAndValidity();
    this.contractBuyerFrom
      .get("contractBuyerContact")!
      .updateValueAndValidity();
    this.contractBuyerFrom.get("contractBuyerEmail")!.updateValueAndValidity();
    this.contractBuyerFrom
      .get("contractBuyerSignatory")!
      .updateValueAndValidity();
    this.contractBuyerFrom
      .get("contractBuyerSignatoryPosition")!
      .updateValueAndValidity();
  }

  onClearForeignCompany() {
    this.foreignFrom.reset();
  }
  onshowForeignCompanyDialog() {
    this.selectForign.show({}, true);
  }
  onForignselect(val) {
    this.baseInfoFrom.patchValue({
      foreignTradeCorpName: val.corporateName,
      foreignTradeCorpAddress: val.corporateAddress,
      foreignTradeCorpDdpValidityDate: val.ddpValidUntil,
      foreignTradeCorpDdpStatus: val.ddpStatus,
    });
  }
  onShowSelectDealerModal() {
    this.selectDealer.show({}, true);
  }
  onShowSelectHospitalModal() {
    this.selectHospital.show({}, true);
  }
  onHospitalselect(val) {
    //最终用户
    this.endUserFrom.patchValue({
      endUser: val.customerName,
      endUserAddress: val.address,
      hospitalType: val.customerType,
      endUserPhone: val.contactPhone,
      endUserContact: val.customerContact,
      endUserId: val.no,
    });
    //最终用户回显
  }
  onDealSelect(val) {
    //经销商选择回显
    this.dealerFrom.patchValue({
      dealerName: val.mdtdealername,
      dealerPhone: val.dealeradmincellphone,
      dealercode: val.dealercode,
      dealerEmail: val.mailingaddress,
      dealerAddress: val.agreementaddress,
      dealerContact: val.companylegalrep,
      dealerDdpValidityDate: val.mdtdealerddpexpiredate,
      dealerSapCode: val.sapcode,
      dealerCode: val.dealercode,
      dealerDdpStatus: val.mdtdealerddpstatus,
      dealerTaxNum: val.socialcreditcode,
    });
    this.serveic.productAction(this.formValue);
  }
  selectCity(param) {

    this.baseInfoFrom.patchValue({
      oldSalesProvince: param,
    });
    areaList.forEach((val) => {
      if (val.code == param) {
        this.cityList = val.children.map((a) => ({
          code: a.code,
          value: a.value,
        }));
      }
    });
  }
  selectProvince(vals: any) {
    //选择省
    const oldSalesProvince = this.baseInfoFrom.getRawValue().oldSalesProvince;
    if (vals != oldSalesProvince) {
      this.baseInfoFrom.patchValue({
        dealFormSalesCity: null,
      });

      this.selectCity(vals);
    }
  }

  async selectDealFrom() {
    this.selectDeal.show({ dealFormId: null }, true);
  }

  //基本信息
  checkbaseInfoFromData = () => {
    for (const i in this.baseInfoFrom.controls) {
      this.baseInfoFrom.controls[i].markAsDirty();
      this.baseInfoFrom.controls[i].updateValueAndValidity();
    }
    return this.baseInfoFrom.valid;
  };
  //经销商
  checkdealerFromFromData = () => {
    for (const i in this.dealerFrom.controls) {
      this.dealerFrom.controls[i].markAsDirty();
      this.dealerFrom.controls[i].updateValueAndValidity();
    }
    return this.dealerFrom.valid;
  };
  //账号管理
  checkaccountFromFromData = () => {
    for (const i in this.accountFrom.controls) {
      this.accountFrom.controls[i].markAsDirty();
      this.accountFrom.controls[i].updateValueAndValidity();
    }
    return this.accountFrom.valid;
  };
  //合同买方
  checkContractBuyerFromFromData = () => {
    for (const i in this.contractBuyerFrom.controls) {
      this.contractBuyerFrom.controls[i].markAsDirty();
      this.contractBuyerFrom.controls[i].updateValueAndValidity();
    }
    return this.contractBuyerFrom.valid;
  };
  //外贸易公司
  checkforeignFromFromData = () => {
    for (const i in this.foreignFrom.controls) {
      this.foreignFrom.controls[i].markAsDirty();
      this.foreignFrom.controls[i].updateValueAndValidity();
    }
    return this.foreignFrom.valid;
  };
  //最终用户
  checkendUserFromFromData = () => {
    for (const i in this.endUserFrom.controls) {
      this.endUserFrom.controls[i].markAsDirty();
      this.endUserFrom.controls[i].updateValueAndValidity();
    }
    return this.endUserFrom.valid;
  };
  //价格审批
  checkpriceApprovalFromData = () => {
    for (const i in this.priceApproval.controls) {
      this.priceApproval.controls[i].markAsDirty();
      this.priceApproval.controls[i].updateValueAndValidity();
    }
    return this.priceApproval.valid;
  };
  approvalArea()
  { //审批区域是列表还是文本框展示
    if(this.status==''||this.status=='ecos_oit_order_submit'||this.status=='ecos_oit_order_resubmit')
    {
      return true;
    }
    else{
      return false;
    }
  }
  initSaleRegions(role) {
    
    if (this.status==""||this.status=="ecos_oit_order_submit"||this.status=="ecos_oit_order_resubmit") {
      const regions = (JSON.parse(window.localStorage.getItem("profiles")) || [])
        .filter(({ role: roleName }) => (role && role === roleName) || !role)
        .map((region) => ({
          label: [
            region.modality,
            region.cycleGroup,
            region.bigArea,
            region.smallArea,
          ]
            .filter((str) => str && str.trim())
            .join("-"),
          value: [
            region.modality,
            region.cycleGroup,
            region.bigArea,
            region.smallArea,
          ]
            .filter((str) => str && str.trim())
            .join("-"),
        }));
      this.saleRegions = regions;
      const { modality, cycleGroup, bigArea, smallArea } = regions[0];
      this.baseInfoFrom.patchValue({
        approvalAreaConfiguration: regions[0].value,
      });
      this.formValue.patchValue({
        modality,
        cycleGroup,
        bigArea,
        smallArea,
      });
    }
  }

  selectConfig(region) {
    if (!region) {
      return;
    }
    const regions = region.split("-");
    const [modality, cycleGroup, bigArea, smallArea] = regions;
    this.formValue.patchValue({
      modality,
      cycleGroup,
      bigArea,
      smallArea,
    });
  }
  onClearDealer() {
    this.dealerFrom.reset();
  }

  async onDealFormelect(val) {
    this.formValue.reset();
    this.baseInfoFrom.patchValue({
      prebookApply: "0",
      centralizedPurchasing: "0",
    });
    this.priceApproval.patchValue({
      sampleCheck: "0",
    });
    const {
      biddingCompany,
      businessModel,
      centralizedPurchasing,
      currencySystem,
      dealFormId,
      dealFormSalesBigArea,
      dealFormSalesEmail,
      dealFormSalesModality,
      dealFormSalesProvince,
      dealFormSalesSmallArea,
      dealFormSalesTeam,
      dealFormStatus,
      dealerCode,
      dealerName,
      dealerSapCode,
      endUserAddress,
      endUserContact,
      endUserPhone,
      foreignTradeCorpContact,
      foreignTradeCorpName,
      hospitalId,
      hospitalName,
      hospitalSegment,
      hospitalType,
      financialSolutionName,
      financialSolutionCny,
      financialSolutionCnyNet,
      financialSolutionUsd,
      samplingAudit,
      payment,
      paymentTerm,
      orderInfo,
    } = await this.serveic.cpDealFormInfo(val.dealFormId);

    this.baseInfoFrom.patchValue({
      dealFormId,
      dealFormSalesTeam,
      dealFormSalesProvince,
      dealFormSalesSmallArea,
      dealFormSalesModality,
      dealFormSalesBigArea,
      centralizedPurchasing: centralizedPurchasing
        ? centralizedPurchasing
        : "0",
      businessModel,
      dealFormSales: dealFormSalesEmail,
    });
    this.dealerFrom.patchValue({
      dealerName,
      dealerDdpStatus: dealFormStatus,
      dealerSapCode,
      dealerCode,
    });
    this.endUserFrom.patchValue({
      endUserAddress,
      endUserContact,
      endUserPhone,
      endUserId: hospitalId,
      segment: hospitalSegment,
      hospitalType: hospitalType,
    });
    this.foreignFrom.patchValue({
      foreignTradeCorpContact,
      foreignTradeCorpName,
    });
    this.priceApproval.patchValue({
      financialSolutionName,
      currencySystem,
      financialSolutionCny:
        currencySystem == "USD" ? financialSolutionUsd : financialSolutionCny,
      sampleCheck: samplingAudit ? samplingAudit.toString() : "0",
    });
    this.addProduct.emit(orderInfo);
    //this.serveic.productAction(data);
  }

  showOptionInfo(optionInfo: any) {    
    this.currOptionInfo = optionInfo
    console.log(this.currOptionInfo)
    this.isShowOptionModal = true
  }


  handleOk(): void {
    this.isShowOptionModal = false;
  }

  handleCancel(): void {
    this.isShowOptionModal = false;
  }

  getPromPlan(){
    const currencySystem = this.priceApproval.getRawValue().currencySystem
    const promotionPlan = this.priceApproval.getRawValue().promotionPlan
    if (currencySystem === 'CNY') {
      let cny = this.priceApproval.getRawValue().dealPriceCnyNet
      return  promotionPlan ? promotionPlan + ' | '  + cny : cny
    }
    if (currencySystem === 'USD') {
      let usd = this.priceApproval.getRawValue().dealPriceUsd
      return  promotionPlan ? promotionPlan + ' | '  + usd : usd
    }
    return null
  }

  fileDown({ fileId, fileName }) {
    let uri = `/act/system/download/${fileId}`;
    this.http.get(uri, {
      responseType: 'blob'
    }).subscribe(data => {
      saveAs(data, fileName);
    });
  }
}
