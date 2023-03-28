import { Component, OnInit, Input,ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validator, Validators } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router';
import { OrderV3Service } from '../../order-v3.service';
import { disreduce, removeRepeat, floatSub, floatDivide, returnFloat } from '@core/util/tools'
import { environment } from '@env';
@Component({
  selector: 'pre-base-info-table',
  templateUrl: './pre-base-info-table.component.html',
  styleUrls: ['./pre-base-info-table.component.scss']
})
export class PreBaseInfoTableComponent implements OnInit {

  constructor(private fb: FormBuilder,
              private service: OrderV3Service,
              public changeDetectorRef: ChangeDetectorRef,
              private activatedRouter: ActivatedRoute) {
    this.service.tenderNumkeyup.subscribe(val => {
      this.bidwinningFileShow();
      this.showTileName();
      this.showSampling();
      this.showRequestLetter();
    })

    this.service.supportFileChangReceive.subscribe((val) => {
      setTimeout(() => {
        const { orderInfo } = val.getRawValue();
        const {dealFormSalesModality,orderModality} = this.baseInfoFrom.getRawValue();
        if (!this.isContract) {
          if (dealFormSalesModality == 'PD&IGT') {
            this.isPDIGTRequired = this.isRequired(orderInfo, 'PD&IGT');
          }
          else if (dealFormSalesModality == 'US') {
            this.isUsRequired = this.isRequired(orderInfo, 'US');
          }
          else if (dealFormSalesModality == 'CC') {
            this.isUsRequired = this.isRequired(orderInfo, 'CC');
          }
        }
        else {
          if (orderModality == 'PD&IGT') {

            this.isPDIGTRequired = this.isRequiredContract();

          }
          else {
            this.isUsRequired = this.isRequiredContract();
          }
          this.isRequiredmagnet("magneticResonanceShieldingFile")
          this.isRequiredmagnet("igtThirdPartyFile")
        }
      }, 100);


    });
  }

  ngOnInit() {
    this.init();
  }
  ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  
  flag: any
  @Input() formValue: FormGroup;
  @Input() isContract: any = false;
  @Input() isResultVerify: any = false;
  @Input() editable: any = true;
  public pdfSRC: any;
  public isPdf: any = false;

  bidWinningFileTitle: any = '中标通知书' // 中标通知书/最终用户合同
  requestLetterTitle: any = '要货函' //要货函/最终用户
  isUsRequired = true;
  isPDIGTRequired = true;
  rowspan: any = 4;
  magneticResonanceShieldingFileoff: boolean = false;
  igtThirdPartyFileoff: boolean = false;
  status: any = "";
  rowspanClause: any = 7;
  speciallyRow: any = 2;
  usRowspan: any = 4;


  get baseInfoTable(): FormGroup {
    return this.formValue.get('baseInfoTable') as FormGroup;
  }
  get baseInfoFrom(): FormGroup {
    return this.formValue.get('baseInfoFrom') as FormGroup;
  }
  get priceApproval(): FormGroup {
    return this.formValue.get('priceApproval') as FormGroup;
  }
  get endUserFrom(): FormGroup {
    return this.formValue.get("endUserFrom") as FormGroup;
  }
  get orderInfo(): FormArray {
    return this.formValue.get("orderInfo") as FormArray
  }
  get otherTerms(): FormGroup {
    return this.formValue.get("otherTerms") as FormGroup
  }
 

 
  init() {
    this.flag = this.activatedRouter.queryParams['_value'].flag;
    this.flag == "1" && this.baseInfoTable.disable();
    this.status = this.activatedRouter.queryParams['value'].taskStatus;
    if (this.status == 'ecos_oit_order_oa' && this.flag == '0') {
      this.baseInfoTable.get('paymentProvisionFile').enable();
      this.baseInfoTable.get('paymentProvisionRemarks').enable();
      this.baseInfoTable.get('performanceBondFile').enable();
      this.baseInfoTable.get('performanceBondRemarks').enable();
      this.baseInfoTable.get('qualityGuaranteeRemarks').enable();
      this.baseInfoTable.get('qualityGuaranteeFile').enable();
      this.baseInfoTable.get('afterSalePriceFile').enable();
      this.baseInfoTable.get('afterSalePriceRemarks').enable();
      this.baseInfoTable.get('shipmentDeliveryFile').enable();
      this.baseInfoTable.get('shipmentDeliveryRemarks').enable();
      this.baseInfoTable.get('installationWarrantyRemarks').enable();
      this.baseInfoTable.get('installationWarrantyFile').enable();
      this.baseInfoTable.get('sitePreparationFile').enable();
      this.baseInfoTable.get('sitePreparationRemarks').enable();
      this.baseInfoTable.get('otherLabel').enable();
      this.baseInfoTable.get('otherRemarks').enable();
      this.baseInfoTable.get('otherTermsFile').enable();
    }
  }
  showRedTitle(param) {//招标文件审核 bidding模式下的提示
    const requestLetterLength = this.baseInfoTable.getRawValue()[param]
    if (!requestLetterLength && this.baseInfoFrom.getRawValue().oitMode == 'BIDDING' && (this.status == '' || this.status == undefined || this.status == null)) {
      return true;
    }
    else {
      return false;
    }
  }
  isShowmainClause() {
    //是否显示 主要合同条款    
    const sampleCheck = this.priceApproval.getRawValue().sampleCheck;
    const {dealFormSalesModality,orderModality,businessModel,oitMode} = this.baseInfoFrom.getRawValue();
    if ((!this.isContract&&dealFormSalesModality == "PD&IGT")||(this.isContract&&orderModality=="PD&IGT")) {
      if ((oitMode == 'BIDDING') || (sampleCheck == '1' && oitMode == 'STOCK')) {
        // if (oitMode == 'BIDDING' && businessModel == 'DIRECT') {
        // this.rowspanClause =8;
        // }
        // else{
        //   this.rowspanClause = 8;
        // }
        this.rowspanClause = 8
        return true;
      }
      else {
        this.rowspanClause = 1;
        return false;
      }
    }
    else {
      // if(businessModel=='DIRECT')
      // {
      //   this.rowspanClause = 8;
      // }
      // else
      // {
      //   this.rowspanClause = 7;
      // }
      this.rowspanClause = 7
      return true;
    }

  }

  isOtherRequired() {
    //其他条款是否必填*
    const { otherTrain, otherFine, otherIp, otherContractTemplate, otherOcap, other } = this.baseInfoTable.getRawValue();
    if (otherTrain == true || otherFine == true || otherIp == true || otherContractTemplate == true || otherOcap == true || other == true) {
      this.baseInfoTable.get('otherRemarks').setValidators(Validators.required);
      this.baseInfoTable.get('otherRemarks').markAsDirty();
      this.baseInfoTable.get('otherRemarks').updateValueAndValidity();
      return true
    }
    else {
      this.baseInfoTable.get('otherRemarks').clearValidators();
      this.baseInfoTable.get('otherRemarks').updateValueAndValidity();
      return false
    }

  }
  performanceBondChange(event, param) {
    //主要条款和其它条款必填验证
    const events = this.baseInfoTable.getRawValue()[event]
    if (events == '1') {
      this.baseInfoTable.get(param).setValidators(Validators.required);
      this.baseInfoTable.get(param).markAsDirty();
      this.baseInfoTable.get(param).updateValueAndValidity();
      return true;
    }
    else {
      this.baseInfoTable.get(param).clearValidators();
      this.baseInfoTable.get(param).updateValueAndValidity();
      return false;
    }

  }

  isSupporting() {
    //支持文件缺失
    const sampleCheck = this.priceApproval.getRawValue().sampleCheck;
    if (sampleCheck == '1') {
      return true;
    }
    else {
      return false;
    }
  }
  isDiffer() {
    //直投合同有价差
    const {dealFormSalesModality,orderModality} = this.baseInfoFrom.getRawValue()
    const { oitMode, businessModel } = this.baseInfoFrom.getRawValue();    
    if ((!this.isContract&&(dealFormSalesModality == "PD&IGT"))||(this.isContract&&(orderModality == "PD&IGT"))) {
      if (oitMode == 'BIDDING' && businessModel == 'DIRECT') {
        return true;
      }
      else {
        return false;
      }
    }
    else {      
      if (businessModel == 'DIRECT') {
        return true;
      }
      else {
        return false;
      }
    }

  }
  speciallyRows() {    
    const isSupport = this.isSupporting();
    const isDiffes = this.isDiffer()
    if (isSupport && isDiffes) {
      return 2
    }
    else {
      return 1
    }
  }
  isRequiredAll() {
    //验证进单抽样审核是否必填
    const { businessModel, dealFormSalesModality, biddingType,orderModality } = this.baseInfoFrom.getRawValue();
    const { sampleCheck } = this.priceApproval.getRawValue()
    const hospitalType = this.endUserFrom.getRawValue().hospitalType
    if ((!this.isContract&&(dealFormSalesModality == 'US' || dealFormSalesModality == 'CC'))||(this.isContract&&(orderModality == 'US' || orderModality == 'CC'))) {
      if (businessModel == 'DIRECT' && sampleCheck == '1') {
        this.baseInfoTable.get('biddingFile')!.setValidators(Validators.required);
        this.baseInfoTable.get("tenderFile")!.setValidators(Validators.required);
      }
      else {
        this.baseInfoTable.get("biddingFile")!.clearValidators();
        this.baseInfoTable.get("tenderFile")!.clearValidators();
      }
      if (hospitalType == '公立医院' && sampleCheck == '1') {
        this.baseInfoTable.get("bidWinningFile")!.setValidators(Validators.required);
      }
      else {
        this.baseInfoTable.get('bidWinningFile')!.clearValidators();
      }
      if (sampleCheck == '1') {
        this.baseInfoTable.get("endUserContract")!.setValidators(Validators.required);
      }
      else {
        this.baseInfoTable.get("endUserContract")!.clearValidators()
      }

    }
    else if ((!this.isContract&&dealFormSalesModality == 'PD&IGT')||(this.isContract&&orderModality == 'PD&IGT')) {
      if ((businessModel == 'DISTRIBUTOR') && sampleCheck == '1') {
        this.baseInfoTable.get("projectAnalysisTable")!.setValidators(Validators.required);
      }
      else {
        this.baseInfoTable.get("projectAnalysisTable")!.clearValidators();
      }
      if ((biddingType == '国内公开标' || biddingType == '国际公开标') && sampleCheck == '1') {
        //this.baseInfoTable.get('biddingFile')!.setValidators(Validators.required);
        this.baseInfoTable.get("tenderFile")!.setValidators(Validators.required);
        if ( businessModel == 'DISTRIBUTOR' ) {
          this.baseInfoTable.get('endUserContract')!.setValidators(Validators.required);
        } else {
          this.baseInfoTable.get("endUserContract")!.clearValidators();
        }
      }
      else {
        this.baseInfoTable.get('biddingFile').clearValidators();
        this.baseInfoTable.get("tenderFile").clearValidators();
        this.baseInfoTable.get('endUserContract').clearValidators();
      }
    }
  }

  isRequiredContract() {
    //合同概要表支持文缺失进单

    const supportFileMissing = this.baseInfoTable.getRawValue().supportFileMissing;
    const Required = supportFileMissing == '0' ? true : false
    if (supportFileMissing == '1') {
      this.baseInfoTable.get("biddingFile")!.clearValidators();
      this.baseInfoTable.get("tenderFile")!.clearValidators();
      this.baseInfoTable.get('endUserContract')!.clearValidators();
      this.baseInfoTable.get("bidWinningFile")!.clearValidators();
      this.baseInfoTable.get("projectAnalysisTable")!.clearValidators();

    }
    else {
      this.isRequiredAll();

    }
    this.updatedTableFile()
    return Required
  }


  isRequired(order, modality) {
    //是否支持文件缺失进单
    let Required
    if (order && order.length > 0) {
      Required = !(order.filter(val => val.orderBaseinfo.orderModality == modality).every(val => val.speciallyTerms.supportFileMissing == '1'))
    }
    if (!Required) {
      this.baseInfoTable.get("biddingFile")!.clearValidators();
      this.baseInfoTable.get("tenderFile")!.clearValidators();
      this.baseInfoTable.get('endUserContract')!.clearValidators();
      this.baseInfoTable.get("bidWinningFile")!.clearValidators();
      this.baseInfoTable.get("projectAnalysisTable")!.clearValidators();
    }
    else {
      const { businessModel, dealFormSalesModality,orderModality, biddingType } = this.baseInfoFrom.getRawValue();
      const hospitalType = this.endUserFrom.getRawValue().hospitalType
      const { sampleCheck } = this.priceApproval.getRawValue()
      if ((!this.isContract&&(dealFormSalesModality == 'US' || dealFormSalesModality == 'CC'))||(this.isContract&&(orderModality == 'US' || orderModality == 'CC'))) {
        if (businessModel == 'DIRECT' && sampleCheck == '1') {
          this.baseInfoTable.get('biddingFile')!.setValidators(Validators.required);
          this.baseInfoTable.get("tenderFile")!.setValidators(Validators.required);
        }
        else {
          this.baseInfoTable.get("biddingFile")!.clearValidators();
          this.baseInfoTable.get("tenderFile")!.clearValidators();
        }
        if (hospitalType == '公立医院' && sampleCheck == '1') {
          this.baseInfoTable.get("bidWinningFile")!.setValidators(Validators.required);
        }
        else {
          this.baseInfoTable.get('bidWinningFile')!.clearValidators();
        }
        if (sampleCheck == '1') {
          this.baseInfoTable.get("endUserContract")!.setValidators(Validators.required);
        }
        else {
          this.baseInfoTable.get("endUserContract")!.clearValidators();
        }

      }
      else if ((!this.isContract&&dealFormSalesModality == 'PD&IGT')||(this.isContract&&orderModality == 'PD&IGT')) {

        if (businessModel == 'DISTRIBUTOR' && sampleCheck == '1') {
          this.baseInfoTable.get("projectAnalysisTable")!.setValidators(Validators.required);
        }
        else {
          this.baseInfoTable.get("projectAnalysisTable")!.clearValidators();
        }
        if ((biddingType == '国内公开标' || biddingType == '国际公开标') && sampleCheck == '1') {
          //this.baseInfoTable.get('biddingFile')!.setValidators(Validators.required);
          this.baseInfoTable.get("tenderFile")!.setValidators(Validators.required);
          if ( businessModel == 'DISTRIBUTOR' ) {
            this.baseInfoTable.get('endUserContract')!.setValidators(Validators.required);
          } else {
            this.baseInfoTable.get("endUserContract")!.clearValidators();
          }
        }
        else {
          this.baseInfoTable.get('biddingFile').clearValidators();
          this.baseInfoTable.get("tenderFile").clearValidators();
          this.baseInfoTable.get('endUserContract').clearValidators();
        }
      }
    }
    this.updatedTableFile()
    return Required

  }
  bidwinningFileShow() { //是否显示中标通知书/最终用户合同
    const baseInfo = this.baseInfoFrom.getRawValue()   
    if (baseInfo.businessModel != 'DIRECT' || (baseInfo.businessModel == 'DIRECT' && baseInfo.biddingType != '其他类型')) {
      return true
    }
    else {
      return false;
    }
  }
  showTileName() {
    //招标文件审核文件
    const baseInfo = this.baseInfoFrom.getRawValue()
    if (baseInfo.biddingType == '其他类型') {
      this.bidWinningFileTitle = '最终用户合同';
    }
    else {
      this.bidWinningFileTitle = '中标通知书';
    }
  }

  showRequestLetter() {
    //要货函           
    const baseInfo = this.baseInfoFrom.getRawValue();
    const {hospitalType}=this.endUserFrom.getRawValue();
    if (hospitalType == '民营医院') {
      this.requestLetterTitle = '场地报告';
    }
    else {
      if (baseInfo.biddingType == '其他类型') {
        this.requestLetterTitle = '场地报告';
      }
      else {
        this.requestLetterTitle = '要货函';
      }
    }
  }
  showSampling() { //抽样审核支持文件 是否必填 PDIGT建显示与否，
    const baseInfo = this.baseInfoFrom.getRawValue()
    if (baseInfo.biddingType == '国内公开标' || baseInfo.biddingType == '国际公开标') {
      this.updatedTableFile();
      return true
    }
    else {
      this.updatedTableFile();
      return false
    }
    
  }
  showUsSampling() { //抽样审核支持文件 是否必填 US和CC显示与否
    const baseInfo = this.baseInfoFrom.getRawValue();
    if (baseInfo.businessModel == 'DIRECT') {
      if (this.showUsbidWinningFile()) {
        //如果是公立医院合并4行
        this.usRowspan = 4
      }
      else {
        //如果是公立医院合并3行
        this.usRowspan = 3
      }
      this.updatedTableFile()
      return true
    }
    else {
      this.updatedTableFile()
      return false
    }
    
  }
  showUsbidWinningFile() {
    //中标通知书 是否必填 US和CC显示与否
    const baseInfo = this.endUserFrom.getRawValue();
    if (baseInfo.hospitalType == '公立医院') {
      this.updatedTableFile()
      return true
    }
    else {
      this.updatedTableFile()
      return false
    }
    
  }
  showProject() {
    //项目分析表 是否显示
    const businessModel = this.baseInfoFrom.getRawValue().businessModel;
    const baseInfo = this.baseInfoFrom.getRawValue()
    if (businessModel == 'DISTRIBUTOR') {
      this.rowspan = 4;
      this.updatedTableFile();
      return true
    }
    else {
      this.rowspan = 2;
      this.updatedTableFile();
      return false;
    }
    
  }
  // bidRequiredRequestLetter()
  // {
  //   //要货函是否必填
  //   const baseInfo = this.baseInfoFrom.getRawValue()
  //   if (baseInfo.dealFormSalesModality == 'PD&IGT') {
  //     if (baseInfo.oitMode == 'STOCK') {
  //       this.baseInfoTable.get('requestLetter').setValidators(Validators.required);
  //       this.baseInfoTable.get('requestLetter').updateValueAndValidity();
  //       return true
  //     }
  //     else {
  //       this.baseInfoTable.get('requestLetter')!.clearValidators();
  //       this.baseInfoTable.get('requestLetter').updateValueAndValidity();
  //       return false;
  //     }
  //   }
  // }
  bidRequired() {
    //中标通知书 是否必填
    const baseInfo = this.baseInfoFrom.getRawValue()
    this.showRequestLetter();
    this.showTileName();  
    if(!this.isContract)
    {
      if ((!this.isContract&&baseInfo.dealFormSalesModality == 'PD&IGT')||(this.isContract&&baseInfo.orderModality == 'PD&IGT')) {
        if ((baseInfo.dealFormSalesTeam == 'VAD' || baseInfo.dealFormSalesTeam == 'CT VAD' || baseInfo.dealFormSalesTeam == 'CTVAD') && (baseInfo.oitMode == 'STOCK')) {
          this.baseInfoTable.get("bidWinningFile")!.setValidators(Validators.required);
          this.baseInfoTable.get('requestLetter').setValidators(Validators.required);
          this.baseInfoTable.get('requestLetter').updateValueAndValidity();
          this.baseInfoTable.get("bidWinningFile").updateValueAndValidity();
          return true
        }
        else {
          this.baseInfoTable.get("bidWinningFile")!.clearValidators();
          this.baseInfoTable.get('requestLetter')!.clearValidators();
          this.baseInfoTable.get('requestLetter').updateValueAndValidity();
          this.baseInfoTable.get("bidWinningFile").updateValueAndValidity();
          return false;
        }
      }
    }
    else{
      if (baseInfo.orderModality == 'PD&IGT') {
        if ((baseInfo.orderSalesTeam == 'VAD' || baseInfo.orderSalesTeam == 'CT VAD' || baseInfo.orderSalesTeam == 'CTVAD') && (baseInfo.oitMode == 'STOCK')) {
          this.baseInfoTable.get("bidWinningFile")!.setValidators(Validators.required);
          this.baseInfoTable.get('requestLetter').setValidators(Validators.required);
          this.baseInfoTable.get('requestLetter').updateValueAndValidity();
          this.baseInfoTable.get("bidWinningFile").updateValueAndValidity();
          return true
        }
        else {
          this.baseInfoTable.get("bidWinningFile")!.clearValidators();
          this.baseInfoTable.get('requestLetter')!.clearValidators();
          this.baseInfoTable.get('requestLetter').updateValueAndValidity();
          this.baseInfoTable.get("bidWinningFile").updateValueAndValidity();
          return false;
        }
      }
    }    
  }
  isRequiredLetter() {
    const {dealFormSalesModality,orderModality}= this.baseInfoFrom.getRawValue();
    if (this.isContract && orderModality == 'US') {
      this.baseInfoTable.get("dealerRequestLetterFile").setValidators(Validators.required);
      this.baseInfoTable.get("cpclFile").setValidators(Validators.required);
      this.baseInfoTable.get("dealerRequestLetterFile").updateValueAndValidity();
      this.baseInfoTable.get("cpclFile").updateValueAndValidity();
      return true;
    }
    else {
      this.baseInfoTable.get("dealerRequestLetterFile").clearValidators();
      this.baseInfoTable.get("cpclFile").clearValidators();
      this.baseInfoTable.get("dealerRequestLetterFile").updateValueAndValidity();
      this.baseInfoTable.get("cpclFile").updateValueAndValidity();
      return false;
    }
  }
  updatedTableFile() { //更新验证
    for (const i in this.baseInfoTable.controls) {
      this.baseInfoTable.controls[i].updateValueAndValidity();
    }
  }
  checkFormData = () => {
    for (const i in this.baseInfoTable.controls) {
      this.baseInfoTable.controls[i].markAsDirty();
      this.baseInfoTable.controls[i].updateValueAndValidity();
    }
    return this.baseInfoTable.valid;
  };
  rowSpanLetter()
  {
    const {orderModality}=this.baseInfoFrom.getRawValue();
    const {magneticResonanceShieldingFile,igtThirdPartyFile} = this.baseInfoTable.getRawValue();   
    if (this.isContract&&orderModality=='PD&IGT')
    {
      if(!magneticResonanceShieldingFile&&!igtThirdPartyFile)
      {
        return 1;
      }
      else if(igtThirdPartyFile&&igtThirdPartyFile.length>0)
      {
        return 2
      }
      else if(magneticResonanceShieldingFile&&magneticResonanceShieldingFile.length>0)
      {
        return 2
      }
      else if(magneticResonanceShieldingFile&&magneticResonanceShieldingFile.length>0&&igtThirdPartyFile&&igtThirdPartyFile.length>0)
      {
        return 3;
      }
    }
  }
  isShowigtAndmagnetic() { //是否显示igt和合同概要表文件
      const {orderModality}=this.baseInfoFrom.getRawValue()
    // const magneticResonanceShieldingFile = this.baseInfoTable.getRawValue().magneticResonanceShieldingFile;
    // const igtThirdPartyFile = this.baseInfoTable.getRawValue().igtThirdPartyFile;
    // if (this.isContract && ((magneticResonanceShieldingFile && magneticResonanceShieldingFile.length > 0) || (igtThirdPartyFile && igtThirdPartyFile.length > 0))) {
    //   return true;
    // }
    // else {
    //   return false;
    // }
    if (this.isContract&&orderModality=='PD&IGT')
    {
      return true;
    }
    else{
      return false;
    }
  }
  supportChang(event) { //支持文件缺失特批进单
    const {dealFormSalesModality,orderModality} = this.baseInfoFrom.getRawValue();
    if ((!this.isContract&&dealFormSalesModality == 'PD&IGT')||(this.isContract&&orderModality == 'PD&IGT')) {
      this.isPDIGTRequired = this.isRequiredContract();
    }
    else {
      this.isUsRequired = this.isRequiredContract();
    }
  }


  isRequiredmagnet(param) {
    const magneticAndigtFile = this.baseInfoTable.getRawValue()[param];
    if (magneticAndigtFile && magneticAndigtFile.length > 0) {
      this.baseInfoTable.get(param).setValidators(Validators.required);
      this.baseInfoTable.get(param).updateValueAndValidity();
      switch (param) {
        case "magneticResonanceShieldingFile":
          this.magneticResonanceShieldingFileoff = true;
          break;
        case "igtThirdPartyFile":
          this.igtThirdPartyFileoff = true;
          break;
      }
    }
    else {
      //this.baseInfoTable.get(param).clearValidators();
      this.isUsRequired = this.isRequiredContract();
    }
  }
  fileUpload(fileList, param) {
    if (fileList && fileList.length > 0) {
      const newfileList = fileList.map(item => {

        let obj = {
          fileId: item.fileId,
          fileName: item.name,
          status: item.name
        }
        return obj;
      })
      const Modality = this.baseInfoFrom.getRawValue().dealFormSalesModality;
      if(this.orderInfo&&this.orderInfo.controls.length>0)
      {
        this.orderInfo.controls.forEach((val, index) => {
          const speciallyTerms = this.orderInfo.at(index).get("speciallyTerms") as FormGroup;
          const orderBaseinfo = this.orderInfo.at(index).get("orderBaseinfo") as FormGroup;
          const orderModality = orderBaseinfo.getRawValue().orderModality;
          if (Modality == orderModality) {
            let obj = {}
            obj[param] = newfileList;
            speciallyTerms.patchValue(obj)
          }
        })
      }
    }
  }
  provisionChang() {
    const { paymentProvision } = this.baseInfoTable.getRawValue();
    if (paymentProvision == '其他（请在备注处描述实际付款方式）') {
      this.baseInfoTable.get('paymentProvisionRemarks').setValidators(Validators.required);
      this.baseInfoTable.get('paymentProvisionRemarks').markAsDirty();
      this.baseInfoTable.get('paymentProvisionRemarks').updateValueAndValidity();
    }
    else {
      this.baseInfoTable.get('paymentProvisionRemarks').clearValidators();
    }
    this.baseInfoTable.get('paymentProvisionRemarks').updateValueAndValidity();
    return true
  }

  isShowUsandCC()
  {
    const {dealFormSalesModality,orderModality}=this.baseInfoFrom.getRawValue();
    const {sampleCheck}=this.priceApproval.getRawValue();
    if(sampleCheck=='1'&&(!this.isContract&&(dealFormSalesModality=='US'||dealFormSalesModality=='CC')||(this.isContract&&(orderModality=='US'||orderModality=='CC'))))
    {
      return true;
    }
    else
    {
       return false;
    }
  }

  changeOter() {

    if (this.baseInfoTable.getRawValue().other == true) {
      this.baseInfoTable.get("otherLabel").setValidators(Validators.required);
      this.baseInfoTable.get("otherLabel").markAsDirty()
      this.baseInfoTable.get("otherLabel").updateValueAndValidity();
      return true;
    }
    else {
      this.baseInfoTable.get("otherLabel").clearValidators();
      this.baseInfoTable.get("otherLabel").markAsDirty()
      this.baseInfoTable.get("otherLabel").updateValueAndValidity();
      return false;
    }
  }
  generateAnalysisTemplate(code) {
    //打开项目分析表     
    let orderInfo = this.orderInfo.getRawValue();
    let MarketBundleImges = "";
    let marketProduct = [];
    let cpOrderConfigId:any=[];
    let cpProductId:any=[];
    const { 
      tenderNum, biddingCompany, dealFormId, estimBiddingPrice,biddingApplyList, 
      dealerProfit,profitNetRate,profitGrossRate,profitGross
    } = this.baseInfoFrom.getRawValue();
    /**
     * profitNetRate 经销商净利润, 
     * dealerProfit 经销商净利润率,
     * profitGrossRate 经销商毛利率
     * profitGross 经销商毛利润,
     * 更改为cp带入，不再在此计算
     */
    const { currencySystem,
      dealPriceCny,
      dealPriceUsd,
      equipmentPriceCny,
      equipmentPriceUsd,
      dealerSelfPurchasePriceCny,
      dealerSelfPurchasePriceUsd
    } = this.priceApproval.getRawValue();

    /** //改为cp带入，此处计算过程注销
    const equipmentPrice = currencySystem == 'CNY' ? equipmentPriceCny : equipmentPriceUsd;
    const dealerSelfPurchase = currencySystem == 'CNY' ? dealerSelfPurchasePriceCny : dealerSelfPurchasePriceUsd;
    let agentGrossProfitMargin: any;
    let agentGrossProfit: any = floatSub(equipmentPrice, estimBiddingPrice); //毛利润
    agentGrossProfit=Number(agentGrossProfit).toFixed(2);
    agentGrossProfit=returnFloat(agentGrossProfit, 2)
    let agentProfit:any= floatSub(agentGrossProfit, dealerSelfPurchase); //净利润   
    agentProfit=Number(agentProfit).toFixed(2);
    agentProfit=returnFloat(agentProfit, 2)
    agentProfit = returnFloat(agentProfit, 2)
    let agentNetInterestRate: any;
    const isNullList = [0 ,'0',null,undefined, ""];
    if ( !isNullList.includes(estimBiddingPrice) ) {
      agentGrossProfitMargin = floatDivide(agentGrossProfit, estimBiddingPrice); //毛利率
      agentGrossProfitMargin = returnFloat(agentGrossProfitMargin, 2)      
      agentGrossProfitMargin = `${agentGrossProfitMargin}%`;

      agentNetInterestRate = floatDivide(agentProfit, estimBiddingPrice); //净利润率
      agentNetInterestRate = returnFloat(agentNetInterestRate, 2)
      agentNetInterestRate = `${agentNetInterestRate}%`;
    }
    else {
      agentGrossProfitMargin = 0
      agentGrossProfitMargin = returnFloat(agentGrossProfitMargin, 2);
      agentGrossProfitMargin = `${agentGrossProfitMargin}%`;
      agentNetInterestRate = 0; //净利润率
      agentNetInterestRate = returnFloat(agentNetInterestRate, 2)
      agentNetInterestRate = `${agentNetInterestRate}%`;
    }
    */
    const isNullList = [0 ,'0',null,undefined, ""];
    let agentGrossProfit: any = (!isNullList.includes(profitGross)) ? Number(profitGross).toFixed(2) : 0; //经销商毛利润
    agentGrossProfit=returnFloat(agentGrossProfit, 2);

    let agentGrossProfitMargin: any; //经销商毛利率
    agentGrossProfitMargin = returnFloat(( (!isNullList.includes(profitGrossRate)) ? Number(profitGrossRate).toFixed(2) : 0), 2);
    agentGrossProfitMargin = `${agentGrossProfitMargin}%`;

    let agentProfit:any = (!isNullList.includes(profitNetRate)) ? Number(profitNetRate).toFixed(2) : 0; //经销商净利润 
    agentProfit=returnFloat(agentProfit, 2);

    let agentNetInterestRate: any; //经销商净利润率
    agentNetInterestRate = returnFloat(( (!isNullList.includes(dealerProfit)) ? Number(dealerProfit).toFixed(2) : 0), 2)
    agentNetInterestRate = `${agentNetInterestRate}%`;

    orderInfo.map(val => {
  
      let arr = val.marketBundleInfo.map(vals => {
        cpOrderConfigId.push(vals.cpOrderConfigId)
        cpProductId.push(vals.cpProductId)
        return `${vals.marketBundleName}${vals.marketBundleAmount}套`;
      }
      )
      marketProduct = [...marketProduct, ...arr]
    })
    marketProduct = removeRepeat(marketProduct);
    MarketBundleImges = marketProduct.join('、');
    cpOrderConfigId=cpOrderConfigId.join(',');
    cpProductId=cpProductId.join(',');
    const { endUser } = this.endUserFrom.getRawValue();
    const today = new Date();
    const params = {
      templateCode: code,
      dateYear: today.getFullYear(),
      dateMonth: today.getMonth() + 1,
      dateDay: today.getDate(),
      date:
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate(),
      data1:
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate(),
      endUser: endUser,
      MarketBundleImges: MarketBundleImges,
      tenderNo: tenderNum,
      tenderingCompany: biddingCompany,
      agentGrossProfit: agentGrossProfit,
      agentGrossProfitMargin: agentGrossProfitMargin,
      agentProfit: agentProfit,
      agentNetInterestRate: agentNetInterestRate,
      currencySystem,      
      dealFormId: dealFormId,
      estimatedTenderPrice: estimBiddingPrice,
      equipmentTotal: currencySystem == 'CNY' ? dealPriceCny : dealPriceUsd,
      cpOrderConfigId,//markbundelInfo,
      cpProductId,
      biddingId:biddingApplyList&&biddingApplyList.length>0?biddingApplyList[0].id:"", //显示项目名称
    };
    this.pdfSRC = params;
    this.isPdf = true;
  }

  public isPdfCancel() {
    this.isPdf = false;
  }

  hasNonStandardApprove() {
    const list = [
      'ecos_oit_order_payment_terms',
      'ecos_oit_order_payment_sup',
      'ecos_oit_order_install_terms',
      'ecos_oit_order_install_sup',
      'ecos_oit_order_logistics_terms',
      'ecos_oit_order_site_terms'
    ]
    if (list.includes(this.status) && this.flag == 0) {
      return true
    } else {
      return false
    }
  }
  projectSupporting()
  { 
    //是否显示项目分析文件
    const {dealFormSalesModality,orderModality}=this.baseInfoFrom.getRawValue();
    const {sampleCheck}=this.priceApproval.getRawValue();
    if(!this.isContract)
    { 
      if((dealFormSalesModality=='US'||dealFormSalesModality=='CC')&&sampleCheck=='0')
      {
        return false;
      }
      else{
        return true
      }  
    }
    else{
     return true
    }
  }
  biddingShow()
  {
    const {biddingApplyList,oitMode}=this.baseInfoFrom.getRawValue();
    if(oitMode=='BIDDING'&&biddingApplyList&&biddingApplyList.length>0)
    {
      const biddingIsSpecial=biddingApplyList.some(item=>item.biddingIsSpecial==true);
      if(biddingIsSpecial)
      {
        return true;
      }
      else{
        return false;
      }
    }
    else{
      return false;
    } 
  }
  toWinbidding(item) {
    const url = `${location.origin}${environment.base_href}/#/bidding-v3/${item.id}?procInstId=${item.procInstId}&processStatus=${item.processStatus}&taskStatus=${item.processStatus}`
    window.open(url);
  }

}
