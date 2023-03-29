import { Validators, FormGroup, FormControl, FormArray, ValidationErrors } from '@angular/forms'
import { BUSINESS_MODEL_DIRECT } from '@pages/bidding-v3/bidding-v3.constants'

// 产品信息里至少选择一个order
const orderInfoValidators = (control: FormArray): ValidationErrors | null => {
  const orders = control.getRawValue()
  if (orders.length === 0) {
    return { asLeasetOneUsedOrder: true }
  }
  let hasUsedOrder = false
  orders.forEach(({ isDeleted }) => {
    if (isDeleted === 0) {
      hasUsedOrder = true
    }
  })
  if (!hasUsedOrder) {
    return { asLeasetOneUsedOrder: true }
  }
  return null
}

// 必须选择一条主机
const orderValidators = (control: FormGroup): ValidationErrors | null => {
  const { isDeleted, marketBundleInfo, orderModality } = control.getRawValue()
  if (isDeleted === 0 && orderModality === 'PD&IGT') {
    let hasPrimaryOpp = false
    marketBundleInfo.forEach(({ primaryOpportunity }) => {
      if (primaryOpportunity === 'true') {
        hasPrimaryOpp = true
      }
    })
    if (!hasPrimaryOpp) {
      return { noPrimaryOpp: true }
    }
  }
  return null
}

const segmentValidator = (control: FormGroup): ValidationErrors | null => {
  const { hospitalType, segment } = control.getRawValue()
  if ((hospitalType === '公立医院' || hospitalType === '民营医院') && !segment) {
    return {
      segmentError: true
    }
  }
  return null
}

export const prebookForm = () => new FormGroup({
  basicInfo: new FormGroup({
    // 基础信息
    baseInfo: new FormGroup({
      // 基本信息
      dealFormId: new FormControl({ value: null, disabled: true }),
      referenceId: new FormControl({ value: null, disabled: true }),
      dealFormModality: new FormControl({ value: null, disabled: true }),
      businessModel: new FormControl({ value: null, disabled: true }),
      approvalAreaConfiguration: new FormControl(null, [Validators.required]), // 审批区域配置
      team: new FormControl({ value: null, disabled: true }),
      bmc: new FormControl({ value: null, disabled: true }),
      cluster: new FormControl({ value: null, disabled: true }),
      bigArea: new FormControl({ value: null, disabled: true }),
      smallArea: new FormControl({ value: null, disabled: true }),
      role: new FormControl({ value: null, disabled: true }),
      cycleGroup: new FormControl({ value: null, disabled: true }),
      modality: new FormControl({ value: null, disabled: true }),
      province: new FormControl({ value: null, disabled: true }),
      centralizedPurchasing: new FormControl({ value: '0', disabled: true }), // 是否集采项目
      dealFormSales: new FormControl({ value: null, disabled: true }), // Deal Form创建人
      dealFormSalesName: new FormControl({ value: null, disabled: true }), // Deal Form创建人姓名
      dealFormSalesTeam: new FormControl({ value: null, disabled: true }), // Deal Form创建人Team
      dealFormSalesModality: new FormControl({ value: null, disabled: true }), // Deal Form创建人Modality
      dealFormSalesBigArea: new FormControl({ value: null, disabled: true }), // Deal Form创建人大区
      dealFormSalesSmallArea: new FormControl({ value: null, disabled: true }), // Deal Form创建人小区
      dealFormSalesProvince: new FormControl(null), // 省份
    }),
    dealerInfo: new FormGroup({     
      // 经销商信息
      dealerName: new FormControl(null, [Validators.required]), // 经销商名称
      dealerCode: new FormControl(null), // 经销商编号
      dealerSapCode: new FormControl({ value: null, disabled: true }), // 经销商SAP Code
      dealerTaxNum: new FormControl(null, [Validators.required]), // 经销商税号
      dealerDdpStatus: new FormControl({ value: null, disabled: true }), // 经销商DDP Status
      dealerDdpValidityDate: new FormControl({ value: null, disabled: true }), // 经销商DDP有效期截止日期
      dealerAddress: new FormControl(null, [Validators.required]), // 经销商地址
      dealerPhone: new FormControl(null, [Validators.required]), // 经销商电话
      dealerEmail: new FormControl(null, [Validators.required]), // 经销商邮箱
      dealerContact: new FormControl(null, [Validators.required]), // 经销商联系人
      purchaseOrderSignatory: new FormControl(null, [Validators.required]), // 采购订单签署人
      purchaseOrderSignatoryPosition: new FormControl(null, [Validators.required]), // 采购订单签署人职务
    }),
    contractBuyer: new FormGroup({
      // 合同买方
      contractBuyer: new FormControl(null, [Validators.required]), // 合同买方
      contractBuyerSapCode: new FormControl(null, [Validators.required]), // 合同买方SAP Code
      contractBuyerTaxNum: new FormControl(null, [Validators.required]), // 合同买方税号
      contractBuyerAddress: new FormControl(null, [Validators.required]), // 合同买方地址
      contractBuyerPhone: new FormControl(null, [Validators.required]), // 合同买方电话
      contractBuyerContact: new FormControl(null, [Validators.required]), // 合同买方联系人
      contractBuyerEmail: new FormControl(null, [Validators.required]), // 合同买方邮箱
      contractBuyerSignatory: new FormControl(null, [Validators.required]), // 合同买方签署人
      contractBuyerSignatoryPosition: new FormControl(null, [Validators.required]), // 合同买方签署人职务
    }),
    foreignCompany: new FormGroup({
      // 外贸公司
      foreignTradeCorpSameDealer: new FormControl(null), // 外贸公司与经销商相同
      foreignTradeCorpName: new FormControl(null, [Validators.required]), // 外贸公司
      companyNotInIePool: new FormControl({ value: null, disabled: true }), // 进出口公司选择 不在IE pool
      foreignTradeCorpSapCode: new FormControl(null, [Validators.required]), // 外贸公司SAP Code
      foreignTradeCorpDdpStatus: new FormControl({ value: null, disabled: true }), // 外贸公司DDP Status
      foreignTradeCorpDdpValidityDate: new FormControl({ value: null, disabled: true }), // DDP Status有效日期
      foreignTradeCorpTaxNum: new FormControl(null, [Validators.required]), // 外贸公司税号
      foreignTradeCorpAddress: new FormControl(null, [Validators.required]), // 外贸公司地址
      foreignTradeCorpPhone: new FormControl(null, [Validators.required]), // 外贸公司电话
      foreignTradeCorpContact: new FormControl(null, [Validators.required]), // 外贸公司联系人
      foreignTradeCorpEmail: new FormControl(null, [Validators.required]), // 外贸公司邮箱
      importAgreementSignName: new FormControl(null, [Validators.required]), // 进口协议签署人
      importAgreementSignPosition: new FormControl(null, [Validators.required]), // 进口协议签署人职务
    }),
    finalUser: new FormGroup({
      // 最终用户
      endUser: new FormControl(null, [Validators.required]), // 最终用户
      endUserId: new FormControl({ value: null, disabled: true }), // 最终用户编号
      endUserSapCode: new FormControl({ value: null, disabled: true }), // 最终用户SAP Code
      endUserTaxNum: new FormControl(null, [Validators.required]), // 最终用户税号
      hospitalType: new FormControl({ value: null, disabled: true }), // 医院性质
      segment: new FormControl({ value: null, disabled: true }), // Segment
      endUserAddress: new FormControl(null, [Validators.required]), // 最终用户地址
      endUserPhone: new FormControl(null, [Validators.required]), // 最终用户电话
      endUserEmail: new FormControl(null, [Validators.required]), // 最终用户邮箱
      endUserContact: new FormControl(null, [Validators.required]), // 最终用户联系人
    }, {
      validators: [segmentValidator]
    }),
    priceApprovaInfo: new FormGroup({
      // 价格审批相关信息
      currencySystem: new FormControl({ value: null, disabled: true }), // 币制
      vatRate: new FormControl({ value: null, disabled: true }), // 税率
      dealPriceCny: new FormControl({ value: null, disabled: true }), // Deal Form总价人民币
      dealPriceUsd: new FormControl({ value: null, disabled: true }), // Deal Form总价美元
      financialSolutionName: new FormControl({ value: null, disabled: true }), // 金融方案
      financialSolutionCny: new FormControl({ value: null, disabled: true }), // 金融方案金额人民币
      financialSolutionUsd: new FormControl({ value: null, disabled: true }), // 金融方案金额美元
      tradeInTotal: new FormControl({ value: null, disabled: true }), // Trade In总金额
      rebateTotal: new FormControl({ value: null, disabled: true }), // Rebate总额
      sampleCheck: new FormControl({ value: '0', disabled: true }), // 是否抽样审核
    }),
    prebookInfo: new FormGroup({
      // PreBook信息
      prebookReason: new FormControl(null, [Validators.required]), // Pre-Book原因
      prebookRemark: new FormControl(null), // 详细说明
      expectedOitMonth: new FormControl(null, [Validators.required]), // 预计OIT月份
      transportationMode: new FormControl(null, [Validators.required]), // 运输方式
      requestedArrivalDate: new FormControl(null), // 客户要求到货日期(RDD)
      expectedIcfMonth: new FormControl(null, [Validators.required]), // 预计ICF月份
      downpaymentDate: new FormControl(null, [Validators.required]), // Downpayment(5%)支付日期
      finalPaymentDate: new FormControl(null, [Validators.required]), // 尾款支付日期
      latePaymentFines: new FormControl(null), // 是否有晚交罚款
      supportFiles: new FormControl(null), // 支持文件
    }),
  }),
  orderInfo: new FormArray([], orderInfoValidators),
  sofonNo: new FormControl(null)
})

export const validBmcList = ['CT', 'MR', 'DXR', 'AMI', 'IGT-S', 'PDS-RadOnc']

export function createMarketBundle({
  id,
  primaryOpportunity, productConfig, configName, marketBundleName,
  marketBundleBmc, marketBundleAmount, qty, productModel,
  medicalDeviceName, medicalDevice, dtcDealerAgreementNo, agreementNum, newDealerAgreementNo,
  nmpaNum, nmpaValidityDate, simulationId, marketBundleId,
  opportunityId, crmOpId, businessOpportunityHierarchyLink, opportunityHierarchyLink,
  authorizedProduct, authorizedArea,
}, disabled = false) {
  const primaryOpportunityDisabled = disabled ? disabled : validBmcList.includes(marketBundleBmc)
  return new FormGroup({
    id: new FormControl(id),
    primaryOpportunity: new FormControl(
      { value: (primaryOpportunity === 'true' || primaryOpportunity === true) ? 'true' : 'false', disabled: primaryOpportunityDisabled }
    ),
    productConfig: new FormControl(configName || productConfig),
    marketBundleName: new FormControl(marketBundleName),
    marketBundleBmc: new FormControl(marketBundleBmc),
    marketBundleAmount: new FormControl(qty || marketBundleAmount),
    productModel: new FormControl(productModel),
    medicalDeviceName: new FormControl(medicalDevice || medicalDeviceName),
    dtcDealerAgreementNo: new FormControl(agreementNum || dtcDealerAgreementNo),
    newDealerAgreementNo: new FormControl({ value: newDealerAgreementNo, disabled }),
    nmpaNum: new FormControl(nmpaNum),
    nmpaValidityDate: new FormControl(nmpaValidityDate),
    simulationId: new FormControl(simulationId),
    marketBundleId: new FormControl(marketBundleId),
    opportunityId: new FormControl(crmOpId || opportunityId),
    businessOpportunityHierarchyLink: new FormControl(opportunityHierarchyLink || businessOpportunityHierarchyLink),
    authorizedProduct: new FormControl(authorizedProduct),
    authorizedArea: new FormControl(authorizedArea),
  })
}

export function createOrder({
  id, so, omFiles, remark, orderModality,
  marketBundleInfo, oitOrderProcessStatus,
  oitOrderId, oitReferenceId, oitOrderSo,
  cpDealOrderId, isDeleted, oitApplyId,
  oitProcInstId, oitContractSummaryApplyId,
}, disabled = false) {
  const marketBundleInfoArray = new FormArray([])
  if (Array.isArray(marketBundleInfo)) {
    marketBundleInfo.forEach((item) => marketBundleInfoArray.push(createMarketBundle(item, disabled)))
  }
  return new FormGroup({
    id: new FormControl(id),
    isUsed: new FormControl(false),
    hasLinkedOitOrder: new FormControl(0),
    cpDealOrderId: new FormControl(cpDealOrderId),
    orderModality: new FormControl(orderModality),
    oitApplyId: new FormControl({ value: oitApplyId, disabled: true }),
    oitOrderId: new FormControl({ value: oitOrderId, disabled: true }),
    oitContractSummaryApplyId: new FormControl({ value: oitContractSummaryApplyId, disabled: true }),
    oitReferenceId: new FormControl({ value: oitReferenceId, disabled: true }),
    oitOrderProcessStatus: new FormControl({ value: oitOrderProcessStatus, disabled: true }),
    oitOrderSo: new FormControl({ value: oitOrderSo, disabled: true }),
    oitProcInstId: new FormControl({ value: oitProcInstId, disabled: true }),
    isDeleted: new FormControl({ value: isDeleted, disabled }),
    so: new FormControl({ value: so, disabled }),
    omFiles: new FormControl({ value: omFiles, disabled }),
    remark: new FormControl({ value: remark, disabled }),
    marketBundleInfo: marketBundleInfoArray
  }, { validators: [orderValidators] })
}

export function initBasicInfo(formGroup: FormGroup, data) {
  const basicInfo = formGroup.get('basicInfo') as FormGroup
  const {
    team,
    bmc,
    cluster,
    bigArea,
    smallArea,
    role,
    cycleGroup,
    modality,
    province,
    prebook: {
      sofonNo,
      dealFormId,
      referenceId,
      dealFormModality,
      businessModel,
      approvalAreaConfiguration,
      centralizedPurchasing,
      dealFormSales,
      dealFormSalesName,
      dealFormSalesTeam,
      dealFormSalesModality,
      dealFormSalesBigArea,
      dealFormSalesSmallArea,
      dealFormSalesProvince,
      dealerName,
      dealerCode,
      dealerSapCode,
      dealerTaxNum,
      dealerDdpStatus,
      dealerDdpValidityDate,
      dealerAddress,
      dealerPhone,
      dealerEmail,
      dealerContact,
      purchaseOrderSignatory,
      purchaseOrderSignatoryPosition,
      contractBuyer,
      contractBuyerSapCode,
      contractBuyerTaxNum,
      contractBuyerAddress,
      contractBuyerPhone,
      contractBuyerContact,
      contractBuyerEmail,
      contractBuyerSignatory,
      contractBuyerSignatoryPosition,
      foreignTradeCorpSameDealer,
      foreignTradeCorpName,
      companyNotInIePool,
      foreignTradeCorpSapCode,
      foreignTradeCorpDdpStatus,
      foreignTradeCorpDdpValidityDate,
      foreignTradeCorpTaxNum,
      foreignTradeCorpAddress,
      foreignTradeCorpPhone,
      foreignTradeCorpContact,
      foreignTradeCorpEmail,
      importAgreementSignName,
      importAgreementSignPosition,
      endUser,
      endUserId,
      endUserSapCode,
      endUserTaxNum,
      hospitalType,
      segment,
      endUserAddress,
      endUserPhone,
      endUserEmail,
      endUserContact,
      currencySystem,
      vatRate,
      dealPriceCny,
      dealPriceUsd,
      financialSolutionName,
      financialSolutionCny,
      financialSolutionUsd,
      tradeInTotal,
      rebateTotal,
      sampleCheck,
      prebookReason,
      prebookRemark,
      expectedOitMonth,
      transportationMode,
      requestedArrivalDate,
      expectedIcfMonth,
      downpaymentDate,
      finalPaymentDate,
      latePaymentFines,
      supportFiles,
    }
  } = data

  formGroup.patchValue({
    sofonNo
  })
  basicInfo.patchValue({
    baseInfo: {
      team,
      bmc,
      cluster,
      bigArea,
      smallArea,
      role,
      cycleGroup,
      modality,
      province,
      dealFormId,
      referenceId,
      dealFormModality,
      businessModel,
      approvalAreaConfiguration,
      centralizedPurchasing,
      dealFormSales,
      dealFormSalesName,
      dealFormSalesTeam,
      dealFormSalesModality,
      dealFormSalesBigArea,
      dealFormSalesSmallArea,
      dealFormSalesProvince,
    },
    dealerInfo: {
      dealerName,
      dealerCode,
      dealerSapCode,
      dealerTaxNum,
      dealerDdpStatus,
      dealerDdpValidityDate,
      dealerAddress,
      dealerPhone,
      dealerEmail,
      dealerContact,
      purchaseOrderSignatory,
      purchaseOrderSignatoryPosition,
    },
    contractBuyer: {
      contractBuyer,
      contractBuyerSapCode,
      contractBuyerTaxNum,
      contractBuyerAddress,
      contractBuyerPhone,
      contractBuyerContact,
      contractBuyerEmail,
      contractBuyerSignatory,
      contractBuyerSignatoryPosition,
    },
    foreignCompany: {
      foreignTradeCorpSameDealer,
      foreignTradeCorpName,
      companyNotInIePool,
      foreignTradeCorpSapCode,
      foreignTradeCorpDdpStatus,
      foreignTradeCorpDdpValidityDate,
      foreignTradeCorpTaxNum,
      foreignTradeCorpAddress,
      foreignTradeCorpPhone,
      foreignTradeCorpContact,
      foreignTradeCorpEmail,
      importAgreementSignName,
      importAgreementSignPosition,
    },
    finalUser: {
      endUser,
      endUserId,
      endUserSapCode,
      endUserTaxNum,
      hospitalType,
      segment,
      endUserAddress,
      endUserPhone,
      endUserEmail,
      endUserContact,
    },
    priceApprovaInfo: {
      currencySystem,
      vatRate,
      dealPriceCny,
      dealPriceUsd,
      financialSolutionName,
      financialSolutionCny,
      financialSolutionUsd,
      tradeInTotal,
      rebateTotal,
      sampleCheck,
    },
    prebookInfo: {
      prebookReason,
      prebookRemark,
      expectedOitMonth,
      transportationMode,
      requestedArrivalDate,
      expectedIcfMonth,
      downpaymentDate,
      finalPaymentDate,
      latePaymentFines,
      supportFiles,
    }
  })
}

export function initOrderInfo(formGroup: FormGroup, data, disabled = false) {
  const orderInfoArray = formGroup.get('orderInfo') as FormArray
  const { prebook: { orderInfo } } = data
  if (Array.isArray(orderInfo)) {
    orderInfo.forEach((item) => orderInfoArray.push(createOrder(item, disabled)))
  }
}

// 动态设置表单的必填项
// 外贸公司模块必须在currency = 'USD'时才去做校验, 
// 经销商模块在非直投时才显示
// 合同买方在直投时显示
const foreignCompanyControlNames = [
  'foreignTradeCorpName', 'foreignTradeCorpSapCode', 'foreignTradeCorpTaxNum',
  'foreignTradeCorpAddress', 'foreignTradeCorpPhone', 'foreignTradeCorpContact',
  'foreignTradeCorpEmail', 'importAgreementSignName', 'importAgreementSignPosition',
]

const dealerInfoControlNames = [
  'dealerName', 'dealerTaxNum', 'dealerAddress',
  'dealerPhone', 'dealerEmail', 'dealerContact',
  'purchaseOrderSignatory', 'purchaseOrderSignatoryPosition',
]

const contractBuyerControlNames = [
  'contractBuyer', 'contractBuyerSapCode', 'contractBuyerTaxNum',
  'contractBuyerAddress', 'contractBuyerPhone', 'contractBuyerContact',
  'contractBuyerEmail', 'contractBuyerSignatory', 'contractBuyerSignatoryPosition',
]
export function setBasicInfoValidators(basicInfo: FormGroup, { currency, businessModel }) {
  const foreignCompany = basicInfo.get('foreignCompany') as FormGroup
  if (currency === 'USD') {
    setRequiredValidators(foreignCompany, foreignCompanyControlNames)
  } else {
    clearValidators(foreignCompany, foreignCompanyControlNames)
  }
  
  const dealerInfo = basicInfo.get('dealerInfo') as FormGroup
  const contractBuyer = basicInfo.get('contractBuyer') as FormGroup
  if (businessModel === 'DIRECT') {
    setRequiredValidators(contractBuyer, contractBuyerControlNames)
    clearValidators(dealerInfo, dealerInfoControlNames)
  } else {
    setRequiredValidators(dealerInfo, dealerInfoControlNames)
    clearValidators(contractBuyer, contractBuyerControlNames)
  }
}

function clearValidators(formGroup: FormGroup, clearedControls: string[]) {
  clearedControls.forEach((controlName) => formGroup.get(controlName).clearValidators())
}

function setRequiredValidators(formGroup: FormGroup, requiredControls: string[]) {
  requiredControls.forEach((controlName) => formGroup.get(controlName).setValidators([Validators.required]))
}


export function validateForm(form, tabs) {
  const {
    basicInfo: {
      baseInfo: {
        businessModel
      },
      priceApprovaInfo: {
        currencySystem
      },
      prebookInfo: {
        latePaymentFines
      }
    }
  } = form.getRawValue()

  const basicInfo = form.get('basicInfo') as FormGroup

  // 基础信息start
  // 基本信息start
  const baseInfo = basicInfo.get('baseInfo') as FormGroup
  for(let i in baseInfo.controls) {
    baseInfo.controls[i].markAsDirty()
    baseInfo.controls[i].updateValueAndValidity()
  }
  const baseInfoValid = baseInfo.valid
  // 基本信息end

  // 经销商信息start, 经销商信息只有在非直投的情况下才校验
  let dealerInfoValid = true
  if (businessModel != BUSINESS_MODEL_DIRECT) {
    const dealerInfo = basicInfo.get('dealerInfo') as FormGroup
    for (let i in dealerInfo.controls) {
      dealerInfo.controls[i].markAsDirty()
      dealerInfo.controls[i].updateValueAndValidity()
    }
    dealerInfoValid = dealerInfo.valid
  }
  // 经销商信息end

  // 合同买方start, 合同买方只有在直投的情况下校验
  let contractBuyerValid = true
  if (businessModel == BUSINESS_MODEL_DIRECT) {
    const contractBuyer = basicInfo.get('contractBuyer') as FormGroup
    for (let i in contractBuyer.controls) {
      contractBuyer.controls[i].markAsDirty()
      contractBuyer.controls[i].updateValueAndValidity()
    }
    contractBuyerValid = contractBuyer.valid
  }
  // 合同买方end

  // 外贸公司start, 外贸公司只有在币制=USD的情况下校验
  let foreignCompanyValid = true
  if (currencySystem == 'USD') {
    const foreignCompany = basicInfo.get('foreignCompany') as FormGroup
    for (let i in foreignCompany.controls) {
      foreignCompany.controls[i].markAsDirty()
      foreignCompany.controls[i].updateValueAndValidity()
    }
    foreignCompanyValid = foreignCompany.valid
  }
  // 外贸公司end

  // 最终用户start
  const finalUser = basicInfo.get('finalUser') as FormGroup
  for(let i in finalUser.controls) {
    finalUser.controls[i].markAsDirty()
    finalUser.controls[i].updateValueAndValidity()
  }
  const finalUserValid = finalUser.valid
  // 最终用户end

  // PreBook信息start
  // 直投设置是否晚交罚款为必填
  const prebookInfo = basicInfo.get('prebookInfo') as FormGroup
  const latePaymentFinesControl = prebookInfo.get('latePaymentFines') as FormControl
  if (businessModel === BUSINESS_MODEL_DIRECT) {
    latePaymentFinesControl.setValidators([Validators.required])
  } else {
    latePaymentFinesControl.clearValidators()
  }
  for(let i in prebookInfo.controls) {
    prebookInfo.controls[i].markAsDirty()
    prebookInfo.controls[i].updateValueAndValidity()
  }
  const prebookInfoValid = prebookInfo.valid
  // PreBook信息end

  const basicInfoValid =
    baseInfoValid && dealerInfoValid && contractBuyerValid &&
    foreignCompanyValid && finalUserValid && prebookInfoValid
  if (basicInfoValid) {
    if (tabs.clearError) {
      tabs.clearError('basic-info')
    }
  } else {
    if (tabs.error) {
      tabs.error('basic-info')
    } else if (tabs.activeId) {
      tabs.activeId('basic-info')
    }
  }
  // 基础信息end

  // 产品信息 start
  // 1. 至少选择一个order
  // 2. 至少选择一个主机
  const orderInfoValid = form.get('orderInfo').valid
  if (orderInfoValid) {
    if (tabs.clearError) {
      tabs.clearError('product-info')
    }
  } else {
    if (tabs.error) {
      tabs.error('product-info')
    } else if (tabs.activeId) {
      tabs.activeId('product-info')
    }
  }
  // 产品信息 end
  return basicInfoValid && orderInfoValid
}

// 整合表单数据
export function getFormData(form, originData = { prebook: null }) {
  const {
    basicInfo: {
      baseInfo,
      dealerInfo,
      contractBuyer,
      foreignCompany,
      finalUser,
      priceApprovaInfo,
      prebookInfo
    },
    orderInfo,
    sofonNo,
  } = form.getRawValue()
  return {
    ...originData,
    ...baseInfo,
    prebook: {
      ...originData.prebook,
      ...baseInfo,
      ...dealerInfo,
      ...contractBuyer,
      ...foreignCompany,
      ...finalUser,
      ...priceApprovaInfo,
      ...prebookInfo,
      orderInfo,
      sofonNo,
    }
  }
}