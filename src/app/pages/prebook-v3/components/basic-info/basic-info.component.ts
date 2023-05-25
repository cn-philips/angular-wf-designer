import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PROVINCES, BUSINESS_MODEL_DIRECT } from '@pages/bidding-v3/bidding-v3.constants'
import { setBasicInfoValidators } from '@pages/prebook-v3/prebook-v3.utils'

import { isadopt, standardTime } from "@core/util/tools";
import { DictService } from '@core/services';
import { PrebookV3Service } from '@pages/prebook-v3/prebook-v3.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'prebook-v3-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.scss']
})

export class BasicInfoComponent implements OnInit {
  @Input() prebookForm: FormGroup
  @Input() disabled: boolean
  @Input() importBtnVisible: boolean = true
  @Input() subTierSubject: Subject<{ type: string, data?: any, disabled?: boolean }>

  @Output() setOrderInfo = new EventEmitter()
  @Output() dealerChange = new EventEmitter()

  @ViewChild("selectDeal") selectDeal;
  @ViewChild("selectDealer") selectDealer;
  @ViewChild("selectHospital") selectHospital;
  @ViewChild("selectForeignCompany") selectForeignCompany;


  get basicInfo(): FormGroup {
    return this.prebookForm.get('basicInfo') as FormGroup
  }

  get baseInfo(): FormGroup {
    return this.basicInfo.get('baseInfo') as FormGroup
  }

  get businessModel(): String {
    return this.baseInfo.get('businessModel').value
  }

  get dealerInfo(): FormGroup {
    return this.basicInfo.get('dealerInfo') as FormGroup
  }

  get contractBuyer(): FormGroup {
    return this.basicInfo.get('contractBuyer') as FormGroup
  }

  get foreignCompany(): FormGroup {
    return this.basicInfo.get('foreignCompany') as FormGroup
  }

  get finalUser(): FormGroup {
    return this.basicInfo.get('finalUser') as FormGroup
  }

  get priceApprovaInfo(): FormGroup {
    return this.basicInfo.get('priceApprovaInfo') as FormGroup
  }

  get currencySystem(): string {
    return this.priceApprovaInfo.get('currencySystem').value
  }

  get prebookInfo(): FormGroup {
    return this.basicInfo.get('prebookInfo') as FormGroup
  }

  get dealerSales(): string {
    const { dealFormSales, dealFormSalesName } = this.baseInfo.getRawValue()
    return dealFormSales ? `${dealFormSalesName}(${dealFormSales})` : ''
  }

  get modalityList(): string[] {
    const { modality, dealFormSalesModality } = this.baseInfo.getRawValue()
    const modalityList = []
    if (modality) {
      modalityList.push(modality)
    }

    if (dealFormSalesModality && dealFormSalesModality !== modality) {
      modalityList.push(dealFormSalesModality)
    }

    return modalityList.length > 0 ? modalityList : ['PD&IGT']
  }

  BUSINESS_MODEL_DIRECT = BUSINESS_MODEL_DIRECT

  selectOption = {
    customerProvince: PROVINCES, // 客户省份
    systemRegion: [], // 系统区域
    prebookReason: [], // prebook原因
    transportationMode: [
      { label: '海运或空运 By sea or by air', value: '海运或空运 By sea or by air' },
      { label: '空运 By air', value: '空运 By air' },
      { label: '陆运 Truck', value: '陆运 Truck' },
    ]
  }

  constructor(
    private dictService: DictService,
    private prebookV3Service: PrebookV3Service,
  ) { }

  ngOnInit() {
    this.initSystemRegion()
    this.initSelectOption()
  }

  initSelectOption() {
    this.dictService.dictDatas(['preReason']).subscribe(([preReasons]) => {
      this.selectOption.prebookReason = preReasons.map(({ label, code }) => ({ label, value: code }))
    })
  }

  initSystemRegion() {
    if (this.disabled) { return }
    const role = 'Sales Rep/Mgr'
    const regions = []
    const profiles = (JSON.parse(window.localStorage.getItem("profiles")) || []).filter(({ role: roleName }) => (role && role === roleName) || !role)
    const labelSet = new Set()
    profiles.forEach((region) => {
      const labelValue = [
        region.team,
        region.modality,
        region.cycleGroup,
        region.bigArea,
        region.smallArea,
      ]
        .filter((str) => str && str.trim())
        .join("-")
      if (!labelSet.has(labelValue)) {
        labelSet.add(labelValue)
        regions.push({ ...region, label: labelValue, value: labelValue })
      }
    })
    this.selectOption.systemRegion = regions;
    if (regions.length === 1) {
      const { team, bmc, cluster, role, province, modality, cycleGroup, bigArea, smallArea } = regions[0];
      this.baseInfo.patchValue({
        approvalAreaConfiguration: [team, modality, cycleGroup, bigArea, smallArea]
          .filter((str) => str && str.trim())
          .join("-"),
        team,
        bmc,
        cluster,
        bigArea,
        smallArea,
        role,
        cycleGroup,
        modality,
        province,
      })
    }
  }

  handleSystemRegionChange(systemRegion) {
    if (!systemRegion || this.disabled) { return }
    const region = this.selectOption.systemRegion.find((region) => systemRegion === region.value)
    if (region) {
      const { team, bmc, cluster, role, province, modality, cycleGroup, bigArea, smallArea } = region
      this.baseInfo.patchValue({
        team,
        bmc,
        cluster,
        bigArea,
        smallArea,
        role,
        cycleGroup,
        modality,
        province,
      })
    }
  }

  onShowSelectDealForm() {
    this.selectDeal.show({}, true)
  }

  onSelectDealForm(dealFormInfo) {
    const {
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
      dealerDMSData,
      endUserAddress,
      endUserContact,
      endUserPhone,
      endUserSapCode,
      endUserTaxNum,
      foreignTradeCorpContact,
      foreignTradeCorpName,
      hospitalId,
      hospitalName,
      hospitalType,
      financialSolutionName,
      financialSolutionCny,
      financialSolutionUsd,
      samplingAudit,
      vatRate,
      dealPriceCny,
      dealPriceUsd,
      equipmentPriceCny,
      equipmentPriceUsd,
      tradeInCnyNet,
      tradeInUsd,
      segment,
      rebateCnyNet,
      rebateUsd,
      orderInfo,
      dealFormSalesName,
      subTierInfo,
    } = dealFormInfo

    if (currencySystem === 'USD') {
      this.foreignCompany.patchValue({
        foreignTradeCorpName,
        foreignTradeCorpContact,
      })
    }

    if (businessModel == "DIRECT") {
      this.contractBuyer.patchValue({
        contractBuyer: hospitalName,
        contractBuyerAddress: endUserAddress,
        contractBuyerPhone: endUserPhone,
        contractBuyerContact: endUserContact,
      });
    } else if(dealerDMSData) { // 非直投, 加载经销商信息
      let mdtdealerddpexpiredate, dealerDdpStatus
      if (dealerDMSData.mdtdealerddpexpiredate) {
        mdtdealerddpexpiredate = standardTime(
          dealerDMSData.mdtdealerddpexpiredate
        );
        dealerDdpStatus = isadopt(mdtdealerddpexpiredate)
      }
      const dealerCode = dealerDMSData.dealeroldcode || dealerDMSData.dealercode
      this.dealerInfo.patchValue({
        dealerName: dealerDMSData.mdtdealername,
        dealerCode,
        dealerSapCode: dealerDMSData.sapcode,
        dealerTaxNum: dealerDMSData.socialcreditcode,
        dealerDdpStatus: dealerDdpStatus || "未通过",
        dealerDdpValidityDate: dealerDMSData.mdtdealerddpexpiredate,
        dealerAddress: dealerDMSData.regaddress,
        dealerPhone: dealerDMSData.dealeradmincellphone,
        dealerEmail: dealerDMSData.mailingaddress,
        dealerContact: dealerDMSData.companylegalrep,
      })

      if (dealerCode) {
        this.dealerChange.emit(dealerCode)
      }
    }

    this.baseInfo.patchValue({
      dealFormId,
      dealFormModality: Array.from(new Set(orderInfo.map((val) => val.orderModality))).join("+"),
      businessModel,
      centralizedPurchasing: (centralizedPurchasing != null && centralizedPurchasing != "") ? String(centralizedPurchasing) : '0',
      dealFormSales: dealFormSalesEmail.toLowerCase(),
      dealFormSalesName,
      dealFormSalesTeam,
      dealFormSalesModality,
      dealFormSalesSmallArea,
      dealFormSalesBigArea,
      dealFormSalesProvince,
    })

    // 价格审批相关字段
    this.priceApprovaInfo.patchValue({
      currencySystem,
      vatRate,
      dealPriceCny: equipmentPriceCny != null && equipmentPriceCny != "" ? equipmentPriceCny : 0,
      dealPriceUsd: equipmentPriceUsd != null && equipmentPriceUsd != "" ? equipmentPriceUsd : 0,
      financialSolutionName: financialSolutionName && financialSolutionName != "null" ? financialSolutionName : '',
      financialSolutionCny: financialSolutionCny || 0,
      financialSolutionUsd: financialSolutionUsd || 0,
      tradeInTotal: currencySystem == "USD" ? (tradeInUsd != null && tradeInUsd != "" ? tradeInUsd : 0) : (tradeInCnyNet != null && tradeInCnyNet != "" ? tradeInCnyNet : 0),
      rebateTotal: currencySystem == "USD" ? (rebateUsd != null && rebateUsd != "" ? rebateUsd : 0) : (rebateCnyNet != null ? rebateCnyNet : 0),
      sampleCheck: samplingAudit ? samplingAudit.toString() : "0",
    })

    this.finalUser.patchValue({
      endUser: hospitalName,
      endUserId: hospitalId,
      endUserSapCode,
      endUserTaxNum,
      hospitalType,
      segment,
      endUserAddress,
      endUserPhone,
      endUserContact,
    })

    setBasicInfoValidators(this.basicInfo, { currency: currencySystem, businessModel })

    this.contractBuyer.markAsDirty()

    this.setOrderInfo.emit(orderInfo)

    setTimeout(() => {
      this.subTierSubject.next({ type: 'add', data: subTierInfo })
    }, 0);
  }

  // 点击外贸公司与经销商相同checkbox, 用经销商数据同步外贸公司
  syncForeignCompanyWithDealer(val) {
    if (val) {
      const {
        dealerName,
        dealerSapCode,
        dealerDdpValidityDate,
        dealerContact,
        dealerPhone,
        dealerEmail,
        dealerAddress,
        dealerDdpStatus,
        dealerTaxNum,
        purchaseOrderSignatory,
        purchaseOrderSignatoryPosition,
      } = this.dealerInfo.getRawValue();

      this.foreignCompany.patchValue({
        foreignTradeCorpName: dealerName,
        foreignTradeCorpSapCode: dealerSapCode,
        foreignTradeCorpDdpValidityDate: dealerDdpValidityDate,
        foreignTradeCorpTaxNum: dealerTaxNum,
        foreignTradeCorpAddress: dealerAddress,
        foreignTradeCorpPhone: dealerPhone,
        foreignTradeCorpContact: dealerContact,
        foreignTradeCorpEmail: dealerEmail,
        importAgreementSignName: purchaseOrderSignatory,
        importAgreementSignPosition: purchaseOrderSignatoryPosition,
        foreignTradeCorpDdpStatus: dealerDdpStatus,
      });
      this.foreignCompany.get("foreignTradeCorpSapCode").disable();
      this.foreignCompany.get("foreignTradeCorpDdpValidityDate").disable();
      this.foreignCompany.get("foreignTradeCorpTaxNum").disable();
      const inIePool = this.prebookV3Service.iePoolList.find(
        (val) => val.corporateName == dealerName
      );
      this.foreignCompany.patchValue({
        companyNotInIePool: inIePool ? 0 : 1,
      });
    }
  }

  // 外贸公司值发生变化
  onForeignCompanyBlur() {

  }

  // 清除外贸公司
  onClearForeignCompany() {
    this.foreignCompany.reset()
  }

  // 弹出IE Pool选择弹框
  onShowIEPool() {
    this.selectForeignCompany.show({}, true);
  }

  // 弹出选择医院弹窗
  onShowSelectHospitalModal() {
    this.selectHospital.show(
      {
        modality: [this.baseInfo.get("dealFormModality").value],
      },
      true
    );
  }

  // 弹出选择经销商弹窗
  onShowSelectDealerModal() {
    this.selectDealer.show({ invalid: true }, true);
  }

  onSelectDealer(val) {
    let mdtdealerddpexpiredate, dealerDdpStatus;
    if (val.mdtdealerddpexpiredate) {
      mdtdealerddpexpiredate = standardTime(val.mdtdealerddpexpiredate);
      dealerDdpStatus = isadopt(mdtdealerddpexpiredate);
    }
    this.dealerInfo.patchValue({
      dealerName: val.mdtdealername,
      dealerCode: val.dealercode,
      dealerSapCode: val.sapcode,
      dealerTaxNum: val.socialcreditcode,
      dealerDdpStatus: dealerDdpStatus,
      dealerDdpValidityDate: val.mdtdealerddpexpiredate,
      dealerAddress: val.agreementaddress,
      dealerPhone: val.dealeradmincellphone,
      dealerEmail: val.mailingaddress,
      dealerContact: val.companylegalrep,
    });
    this.dealerChange.emit(val.dealercode)
  }

  onSelectHospital(val) {
    this.finalUser.patchValue({
      endUser: val.customerName,
      endUserAddress: val.address,
      endUserActuallyDeliveryAddress: val.address,
      hospitalType: val.customerType,
      endUserPhone: val.contactPhone,
      endUserContact: val.customerContact,
      endUserId: val.no,
      segment: val.category
    });
  }

  onSelectForeignCompany(val) {
    this.foreignCompany.reset()
    let ddpValidUntil, ddpStatus;
    if (val.ddpValidUntil) {
      ddpValidUntil = standardTime(val.ddpValidUntil);
      ddpStatus = isadopt(ddpValidUntil);
    }
    this.foreignCompany.patchValue({
      foreignTradeCorpName: val.corporateName,
      foreignTradeCorpAddress: val.corporateAddress,
      foreignTradeCorpDdpValidityDate: val.ddpValidUntil,
      foreignTradeCorpDdpStatus: ddpStatus ? ddpStatus : "未通过",
    });
    this.foreignCompany.get("foreignTradeCorpDdpValidityDate").disable();
  }
}
