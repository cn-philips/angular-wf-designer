import { Component, Input, OnInit, ViewChild, Output, EventEmitter } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import * as moment from 'moment'
import { DictService } from "@core/services";
import { BUSINESS_MODEL_DIRECT } from "../../bidding-v3.constants";

import {
  BIDDING_COMPANIES,
  CURRENCIES,
  DISTRIBUTOR_TYPES,
  DISTRIBUTOR_DDP_STATUS_LIST,
  BIDDER_DDP_STATUS_LIST,
} from "@pages/bidding-v3/bidding-v3.constants";
import { SelectDealerComponent } from "@shared/components";
import { Subject } from "rxjs";

@Component({
  selector: "bidding-v3-supplement-info",
  templateUrl: "./supplement-info.component.html",
  styleUrls: ["./supplement-info.component.scss"],
})
export class SupplementInfoComponent implements OnInit {
  @Input() biddingForm: FormGroup;
  @Input() showReopenButton = false
  @Input() agreementList = []
  @Input() paymentTerms = []
  @Input() disabled = false
  @Input() fromTask = false
  @Input() taskStatus = null
  @Input() subTierSubject: Subject<{ type: string, data: any }>

  @Output() calcPaymentTerms = new EventEmitter()
  @Output() dealerChange = new EventEmitter()
  @Output() reopenForm = new EventEmitter()
  @ViewChild('selectDealer') selectDealer: SelectDealerComponent

  dialogMode // 页面有2个选择经销商弹窗, 用该变量来区分是投标公司还是协议经销商

  templatePreviewerVisible = false;
  templateParams = {};

  reopenTitle = '确认后，此非标条款将重新审核'

  selectOption = {
    bidderName: BIDDING_COMPANIES,
    currency: CURRENCIES,
    logisticTerms: [], // 物流条款
    paymentTerms: [], // 支付方式
    distributorType: DISTRIBUTOR_TYPES, // 协议经销商类型
    distributorDdpStatus: DISTRIBUTOR_DDP_STATUS_LIST, // 协议经销商DDP状态
    bidderDdpStatus: BIDDER_DDP_STATUS_LIST, // 投标公司DDP状态
  };

  BUSINESS_MODEL_DIRECT = BUSINESS_MODEL_DIRECT

  get agreementNoMap(): Map<string, any> {
    const map = new Map()
    this.agreementList.forEach((agreement) => {
      map.set(agreement.value, agreement)
    })
    return map
  }

  get supplementInfo(): FormGroup {
    return this.biddingForm
      ? (this.biddingForm.get("supplementInfo") as FormGroup)
      : null;
  }

  get biddingInfo(): FormGroup {
    return this.supplementInfo
      ? (this.supplementInfo.get("biddingInfo") as FormGroup)
      : null;
  }

  get indirectBiddingInfo(): FormGroup {
    return this.supplementInfo
      ? (this.supplementInfo.get("indirectBiddingInfo") as FormGroup)
      : null;
  }

  get biddingCompany(): FormGroup {
    return this.supplementInfo
      ? (this.supplementInfo.get("biddingCompany") as FormGroup)
      : null;
  }

  get dealerInfo(): FormGroup {
    return this.supplementInfo
      ? (this.supplementInfo.get("dealerInfo") as FormGroup)
      : null;
  }

  get biddingTerm(): FormGroup {
    return this.supplementInfo
      ? (this.supplementInfo.get("biddingTerm") as FormGroup)
      : null;
  }

  get logisticTerm(): FormGroup {
    return this.biddingTerm
      ? (this.biddingTerm.get("logisticTerm") as FormGroup)
      : null;
  }

  get afterSaleTermsDesc(): FormControl {
    return this.biddingTerm
      ? (this.biddingTerm.get("afterSaleTermsDesc") as FormControl)
      : null; 
  }

  get biddingAmount(): FormGroup {
    return this.biddingTerm
      ? (this.biddingTerm.get("biddingAmount") as FormGroup)
      : null;
  }

  get paymentTerm(): FormGroup {
    return this.biddingTerm
      ? (this.biddingTerm.get("paymentTerm") as FormGroup)
      : null;
  }

  get specificationTermsDesc(): FormControl {
    return this.biddingTerm
      ? (this.biddingTerm.get("specificationTermsDesc") as FormControl)
      : null; 
  } 

  get biddingFile(): FormGroup {
    return this.supplementInfo
      ? (this.supplementInfo.get("biddingFile") as FormGroup)
      : null;
  }

  get businessModel() {
    if (!this.biddingForm) {
      return null;
    }
    const businessModel = this.biddingForm
      .get("basicInfo")
      .get("baseInfo")
      .get("businessModel") as FormControl;
    return businessModel.value || '';
  }

  constructor(private dictService: DictService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.dictService.dictDatas(["WLTKSM"]).subscribe(([logisticTerms]) => {
      this.selectOption.logisticTerms = logisticTerms.map(
        ({ label, code }) => ({ label, value: code })
      );
    });
  }

  onAuthorizationChange(authorization) {
    const secondaryDistributor = this.biddingCompany.get('secondaryDistributor') as FormControl
    const sealedLetterFiles = this.biddingFile.get('sealedLetterFiles') as FormControl
    const letterOfAuthorizationFiles = this.biddingFile.get('letterOfAuthorizationFiles') as FormControl
    if (authorization === 1) {
      secondaryDistributor.setValidators([Validators.required])
      sealedLetterFiles.setValidators([Validators.required])
      if (secondaryDistributor.value === 1) {
        letterOfAuthorizationFiles.setValidators([Validators.required])
      } else {
        letterOfAuthorizationFiles.clearValidators()
      }
    } else {
      secondaryDistributor.clearValidators()
      secondaryDistributor.markAsPristine()
      sealedLetterFiles.clearValidators()
      sealedLetterFiles.markAsPristine()
      letterOfAuthorizationFiles.clearValidators()
      letterOfAuthorizationFiles.markAsPristine()
    }
  }

  onBidderNameChange(bidderName) {
    const bidder = BIDDING_COMPANIES.find(({ value }) => value === bidderName);
    if (bidder) {
      const { bidderRegistAddress, bidderRegistLocation } = bidder
      this.biddingInfo.patchValue({
        bidderRegistAddress,
        bidderRegistLocation,
      });
    }
  }

  onSecondaryDistributorChange(secondaryDistributor) {
    const letterOfAuthorizationFiles = this.biddingFile.get('letterOfAuthorizationFiles') as FormControl
    if (secondaryDistributor === 0) {
      const { dealerName, dealerRegistAddress, distributorDdpDate } = this.dealerInfo.getRawValue()
      this.biddingCompany.patchValue({
        bidderName: dealerName,
        bidderRegistAddress: dealerRegistAddress,
        bidderDdpDate: distributorDdpDate
      })
      letterOfAuthorizationFiles.clearValidators()
    } else {
      const { authorizationRequired } = this.indirectBiddingInfo.getRawValue()
      if (authorizationRequired === 1) {
        letterOfAuthorizationFiles.setValidators([Validators.required])
      } else {
        letterOfAuthorizationFiles.clearValidators()
      }
    }
    this.calcBidderDdpStatus()
  }

  // 计算投标公司DDP状态
  calcBidderDdpStatus() {
    const { secondaryDistributor, bidderDdpDate } = this.biddingCompany.getRawValue()
    let bidderDdpStatus = null
    if (secondaryDistributor === 1) {
      bidderDdpStatus = '非飞利浦授权二级经销商'
    } else if (bidderDdpDate) {
      const date1 = new Date(bidderDdpDate)
      const date2 = new Date()
      const duration = Math.ceil((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24))
      bidderDdpStatus = duration > 0 ? '通过' : '未通过'
    } else {
      bidderDdpStatus = '未通过'
    }
    this.biddingCompany.patchValue({
      bidderDdpStatus
    })
  }

  // 计算协议经销商DDP状态
  calcDistributorDdpStatus() {
    const { distributorDdpDate } = this.dealerInfo.getRawValue()
    let distributorDdpStatus = null
    if (distributorDdpDate) {
      const date1 = new Date(distributorDdpDate)
      const date2 = new Date()
      const duration = Math.ceil((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24))
      distributorDdpStatus = duration > 0 ? '通过' : '未通过'
    } else {
      distributorDdpStatus = '未通过'
    }
    this.dealerInfo.patchValue({
      distributorDdpStatus
    })
  }

  // 物流条款发生变化
  onLogisticTermsChange(logisticTerms) {
    if (logisticTerms === 'WLTKSMBZ') {
      this.logisticTerm.patchValue({
        logisticTermsDesc: '收到信用证/货款90天内装运'
      })
      this.logisticTerm.get('logisticTermsDesc').disable()
    } else {
      this.logisticTerm.get('logisticTermsDesc').enable()
    }
  }

  onBidderCurrencyChange(currency: string) {
    this.paymentTerm.patchValue({
      paymentTerms: null
    })
    this.calcPaymentTerms.emit(null)

    if (!this.disabled && currency) {
      const company = BIDDING_COMPANIES.find((item) => item.currency === currency.toUpperCase())
      if (company) {
        const { value, bidderRegistAddress, bidderRegistLocation } = company
        this.biddingInfo.patchValue({
          bidderName: value,
          bidderRegistAddress,
          bidderRegistLocation,
        })
      }
    }
  }

  showTemplatePreviewer(templateCode) {
    // CYTBSMH  YCV-M2O-001a1参与投标声明函05271625
    const today = new Date();
    const params: any = {};
    params.templateCode = templateCode;
    const {
      basicInfo: {
        baseInfo: { biddingProgramName, biddingOpenDate, biddingValidDate, biddingNumber },
        applicant: { biddingOwner },
        finalUser: { hospitalName, customerCity }
      },
      supplementInfo: {
        biddingInfo: { bidderName },
        biddingCompany: { bidderName: biddingCompany, bidderRegistAddress },
        dealerInfo: { dealerName, dealerPhone, dealerRegistAddress },
      },
    } = this.biddingForm.getRawValue();

     // 销售经理投标委托函模板
     if (templateCode === 'XSJLTBWT') {
      params.saleManagerName = ''
      params.saleManagerNo = ''
      params.saleNo = ''
      params.saleName = biddingOwner
      params.biddingProName = biddingProgramName
      params.tenderNo = biddingNumber
      params.date = moment().format('YYYY-MM-DD')
    }

    params.biddingNo = biddingNumber

    params.city = customerCity
    params.phone = dealerPhone

    params.projectLeader = biddingOwner;
    params.biddingName = bidderName || biddingCompany;

    params.biddingNames = biddingCompany
    params.biddingComRegAddress = bidderRegistAddress

    params.biddinOrgName = biddingCompany

    params.HospitalName = hospitalName

    params.opportunityDate = moment().format('YYYY-MM-DD')


    const marketBundles = this.biddingForm.get('marketBundles').value

    const dateSet = new Set()
    const oppIdSet = new Set()
    const productModelSet = new Set()
    marketBundles.forEach(({ opportunityId, products }) => {
      oppIdSet.add(opportunityId)
      if (products) {
        products.forEach(({ productModel, createdDate }) => {
          productModelSet.add(productModel)
          dateSet.add(createdDate)
        })
      }
    })

    params.productModel = Array.from(productModelSet).join(' %7C ')

    params.opportunityURL = Array.from(oppIdSet).join(' %7C ')
    params.opportunityDate = Array.from(dateSet).join(' %7C ')

    params.biddingProgramName = biddingProgramName;
    params.date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    params.dateYear = today.getFullYear();
    params.dateMonth = today.getMonth() + 1;
    params.dateDay = today.getDate();

    // Object.assign(params, this.dataBase);

    if (params.biddingName) {
      params.biddingName = params.biddingName.replace(/\+/g, "%2B");
    }
    if (params.biddingProgramName) {
      params.biddingProgramName = params.biddingProgramName.replace(
        /\+/g,
        "%2B"
      );
      params.biddingN = params.biddingProgramName.replace(/\+/g, "%2B");
    }
    params.dataList = "";
    params.paymentList = "";
    params.productInformations = "";
    params.paymentTerms = "";
    params.region = "";
    params.BMClist = "";
    params.BMCExpert = "";
    params.AppExpert = "";
    params.distributorAgreement = "";
    params.distributorAgreementList = "";

    // 开标日期和开标有效期
    if (biddingOpenDate) {
      params.biddingDate = biddingOpenDate
      if (biddingValidDate) {
        params.biddingDates = moment(biddingOpenDate).add(Number(biddingValidDate), 'days').format('YYYY-MM-DD')
      }
    }

    this.templateParams = params;
    this.templatePreviewerVisible = true;
  }

  getProductModels() {
    const productModels = []
    const marketBundles = this.biddingForm.get('marketBundles').value as Array<any>
    marketBundles.forEach(({ products }) => {
      products.forEach(({ productModel }) => {
        productModels.push(productModel)
      })
    })
    return productModels.join(',')
  }

  public joinPdfUrl(code, ano) {
    // TBWT YCV-M2O-001a3投标委托函（飞利浦）（二级经销商）
    // XSJLTBWT YCV-M2O-001a4销售经理投标委托函
    // TBWT2  YCV-M2O-001a7投标委托函（不出具授权）（二级经销商）
    const { basicInfo: { baseInfo: { biddingNumber, biddingProgramName } }, supplementInfo: { dealerInfo: { dealerName }, biddingCompany: { bidderName } } } = this.biddingForm.getRawValue()
    const today = new Date();
    const params: any = {};
    params.templateCode = code;
    params.agreementAgenName = dealerName;
    params.productModel = this.getProductModels()
    params.biddingName = bidderName;
    params.biddingNames = bidderName;
    params.tenderNo = biddingNumber;
    params.biddingProName = biddingProgramName;
    params.dateYear = today.getFullYear();
    params.dateMonth = today.getMonth() + 1;
    params.dateDay = today.getDate();

    Object.assign(params);
    if (params.biddingName) {
      params.biddingName = params.biddingName.replace(/\+/g, '%2B');
    }
    if (params.biddingProName) {
      params.biddingProName = params.biddingProName.replace(/\+/g, '%2B');
    }
    if (params.biddingProName) {
      params.biddingN = params.biddingProName.replace(/\+/g, '%2B');
    }
   
    params.productModels = '';
    if (ano != null && ano !== '') {
      params.agreementNo = ano;
    }
    params.dataList = '';
    params.paymentList = '';
    params.productInformations = '';
    params.paymentDescription = '';
    params.region = '';
    params.BMClist = '';
    params.BMCExpert = '';
    params.AppExpert = '';
    params.distributorAgreement = '';
    params.distributorAgreementList = '';
    this.templateParams = params;
    this.templatePreviewerVisible = true;
  }

  showSelectDealerDialog(mode) {
    this.dialogMode = mode
    this.selectDealer.show({}, true)
  }

  onSelectDealer({ mdtdealername, regaddress, mdtdealerddpexpiredate, dealeradmincellphone}) {
    switch(this.dialogMode) {
      case 'company':
        this.biddingCompany.patchValue({
          bidderName: mdtdealername,
          bidderRegistAddress: regaddress,
          bidderDdpDate: mdtdealerddpexpiredate,
        })
        break
      case 'dealer':
        const secondaryDistributor = this.biddingCompany.get('secondaryDistributor').value
        this.dealerInfo.patchValue({
          dealerName: mdtdealername,
          dealerPhone: dealeradmincellphone,
          dealerRegistAddress: regaddress,
          distributorDdpDate: mdtdealerddpexpiredate,
        })
        if (secondaryDistributor === 0) {
          this.biddingCompany.patchValue({
            bidderName: mdtdealername,
            bidderRegistAddress: regaddress,
            bidderDdpDate: mdtdealerddpexpiredate,
          })
        }
        this.dealerChange.emit(mdtdealername)
        break
    }
    this.calcSecondaryDistributor()
    this.calcBidderDdpStatus()
    this.calcDistributorDdpStatus()
  }

  // 计算是否为二级经销商投标
  calcSecondaryDistributor() {
    const { bidderName } = this.biddingCompany.value
    const { dealerName } = this.dealerInfo.value
    this.biddingCompany.patchValue({
      secondaryDistributor: bidderName === dealerName ? 0 : 1
    })
  }

  createAgreement(dealerAgreement, authorizedProduct, authorizedArea) {
    return this.fb.group({
      dealerAgreement: [dealerAgreement],
      authorizedProduct: [authorizedProduct],
      authorizedArea: [authorizedArea],
    })
  }

  onAgreementChange(agreementNoList) {
    const distributorAgreement = this.dealerInfo.get('distributorAgreement') as FormArray
    // 清空formArray
    const arrLen = distributorAgreement.length
    for(let i = arrLen - 1; i >= 0; i--) {
      distributorAgreement.removeAt(i)
    }
    agreementNoList.forEach((agreementNo) => {
      const { currentproduct, currentterritory } = this.agreementNoMap.get(agreementNo)
      const agreement = this.createAgreement(agreementNo, currentproduct, currentterritory)
      distributorAgreement.push(agreement)
    })
  }

  onReopenTerm(formControl: FormControl, fieldName) {
    formControl.enable()
    const biddingApprovalStatus = this.biddingForm.get('approvalInfo').get('biddingApprovalStatus') as FormGroup
    biddingApprovalStatus.get(fieldName).patchValue(0)
    if (fieldName === 'logisticTermsApprovalStatus' && this.logisticTerm.get('logisticTerms').value === 'WLTKSMBZ') {
      this.logisticTerm.get('logisticTermsDesc').disable()
    }
  }

  onReopenForm() {
    this.reopenForm.emit()
  }
}
