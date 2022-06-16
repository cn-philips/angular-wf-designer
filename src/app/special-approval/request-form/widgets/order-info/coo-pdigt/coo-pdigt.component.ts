import { Component, OnInit, Input, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms'
import { 
  ORDER_TYPES,
  BUSINESS_MODEL,
  BUSINESS_MODEL_LIST,
  CURRENCIES,
  PAYMENT_METHOD_PDIGT_LIST,
  PAYMENT_METHOD_PDIGT_OTHER,
  PROCESS_STATUS,
} from '../../../../special-approval.constants'
import { SpecialApprovalService } from '../../../../special-approval.service'
import { Dealer, SelectDealerComponent } from '../../select-dealer/select-dealer.component';
import { Hospital, SelectHospitalComponent } from '../../select-hospital/select-hospital.component';
import { Reference, SelectReferenceComponent } from '../../select-reference/select-reference.component'
import { PdfPreviewComponent } from '../../../../../shared/components'
import * as moment from 'moment'

const hospitalDealerValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const businessModel = control.get('businessModel').value
  const hospitalName = control.get('hospitalName').value
  const dealerName = control.get('dealerName').value
  if (businessModel === BUSINESS_MODEL.DISTRIBUTOR_DEAL) {
    if (!hospitalName && !dealerName) {
      return { hospitalDealerRequired: true }
    }
  } else if(!hospitalName) {
    return { hospitalRequired: true  }
  }
  return null
}

const disableSubmitValidtorFn = (disableValue) => (control: AbstractControl): ValidationErrors | null => {
  return control.value === disableValue ? { disableSubmit: true } : null
}

@Component({
  selector: 'special-approval-coo-pdigt-order-info',
  templateUrl: 'coo-pdigt.component.html',
  styleUrls: ['./cos-pdigt.component.scss']
})
export class CooPdIgtOrderInfoComponent implements OnInit, OnChanges {

  originOrderInfo = {}
  originCooInfo = {}
  
  @ViewChild('selectHospital') selectHospital: SelectHospitalComponent
  @ViewChild('selectDealer') selectDealer: SelectDealerComponent
  @ViewChild('selectReference') selectReference: SelectReferenceComponent
  @ViewChild('appPdfPreview') appPdfPreview: PdfPreviewComponent
  @Input() editable = true
  @Input() fromTask = false

  loginUserCode1 = localStorage.getItem('ng_philips_code1')

  BUSINESS_MODEL = BUSINESS_MODEL
  PAYMENT_METHOD_PDIGT_OTHER = PAYMENT_METHOD_PDIGT_OTHER

  showOmField = false
  showPmField = false
  showPmFeedbackField = false
  isPurchaseAgreementRequired = false

  orderInfo = this.fb.group({
    orderType: [null, [Validators.required]], // 订单类型
    referenceId: [{ value: null, disabled: true }], // Reference Id
    productType: [{ value: null, disabled: true }], // 产品型号
    bmc: [null, [Validators.required]], // 产品线
    bg: [{ value: 'PD&IGT', disabled: true }], // BG
    cycleGroup: [null], // Cycle Group
    bigArea: [null], // 大区
    businessModel: [null, [Validators.required]], // 业务模式
    dealerName: [{ value: null, disabled: true }], // 经销商名称
    dealerCode: [{ value: null, disabled: true }], // 经销商编号
    hospitalName: [{ value: null, disabled: true }], // 医院名称
    hospitalNo: [{ value: null, disabled: true }], // 医院编号
    foreignCompany: [null], // 外贸公司
    foreignCompanyNo: [{ value: null, disabled: true }], // 外贸公司编号
    sapOrderNo: [null, [Validators.required]], // SAP订单号
    orderAmount: [null, [Validators.required]], // 合同金额-数额
    currency: [null, [Validators.required]], // 合同金额-货币
    om: [null], // OM
    cooSign: [null, [Validators.required]], // COO签署方
    contractBuyer: [null, [Validators.required]], // 合同买方
    philipsName: [null, [Validators.required]], // 飞利浦实体名称
    contractNo: [null, [Validators.required]], // 合同号
    paymentMethod: [null, [Validators.required]], // 付款方式
    paymentMethodOther: [null], // 付款方式-其他
    products: this.fb.array([this.createProduct()], [Validators.required]), // 产品列表
    cooProduct: this.fb.group({
      cipPort: [null], // 是否为CIP港口
      airTransportNo: [null], // POD扫描件
      addressType: [null], // 送达地址类型
      deliveryAddress: [null], // 货物送达地址中文
      deliveryAddressEn: [null], // 货物送达地址英文
      customsClearancePort: [null], // 清关口岸中文
      customsClearancePortEn: [null], // 清关口岸英文
    }),
    shipToName: [null], // ship-to name
    paymentReceived: [null], // 全款是否已经收到
    receivedAmount: [null], // 已收金额
    purchaseOrderNo: [null], // 采购订单
    purchaseAgreement: [null], // 买卖协议
  }, { validators: hospitalDealerValidator })

  cooInfo = this.fb.group({
    installationOrDispatch: [null, [Validators.required, disableSubmitValidtorFn('1')]], // 是否已装机或派单
    threeMonthsAfterArrival: [null, [Validators.required, disableSubmitValidtorFn('0')]], // 是否到货>3个月
    cooSignedNotIcf: [null, [Validators.required]], // 经销商是否为COO签署12个月内未签回ICF
    specialApproval: [{ value: null, disabled: true }, [Validators.required]], // 是否需要特批
    applySignedDate: [null], // 预计签署日期
    cooConfirmationLetterDraft: [null], // COO确认函草稿
    cooConfirmationLetterDealer: [null], // 经销商盖章后的COO确认函
    cooConfirmationLetterSign: [null], // 双签后的COO确认函
  })

  selectOptions = {
    orderTypes: ORDER_TYPES,
    businessModels: BUSINESS_MODEL_LIST,
    oms: [],
    currencies: CURRENCIES,
    paymentMethodList: PAYMENT_METHOD_PDIGT_LIST,
    foreignCompanies: []
  } 

  // 已收金额/合同金额
  get amountPercent() {
    let { orderAmount, receivedAmount } = this.orderInfo.getRawValue()
    receivedAmount = Number(receivedAmount || 0)
    orderAmount = Number(orderAmount)
    const percent = Number(receivedAmount / orderAmount * 100).toFixed(2)
    return `${percent}%`
  }

  get products(): FormArray {
    return this.orderInfo.get('products') as FormArray
  }

  get cooProduct(): FormGroup {
    return this.orderInfo.get('cooProduct') as FormGroup
  }

  get bigAreas() {
    const cycleGroup = this.orderInfo.get('cycleGroup') as FormControl
    const cycleGroupBigAreaMap = this.spService.cycleGroupBigAreaMap
    if (cycleGroup && cycleGroupBigAreaMap[cycleGroup.value]) {
      return cycleGroupBigAreaMap[cycleGroup.value]
    } else {
      return []
    }
  }

  get bmcList() {
    return this.spService.bmcList.filter((bmc) => bmc.bg === 'PD&IGT')
  }

  constructor(
    private fb: FormBuilder,
    public spService: SpecialApprovalService
  ) { }

  ngOnInit() {
    this.initOMUsers()
    this.initForeignCompanies()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.editable.currentValue) {
      this.disableForm()
    }
  }

  disableForm() {
    this.orderInfo.disable()
    this.products.controls.forEach((product: FormGroup) => product.disable())
    this.cooInfo.disable()
  }

  // node1: OM 补充信息
  // node2: 上传经销商盖章后的COO确认函
  // node6: 上传双签后的COO确认函
  setFormValidators({ nodeCode, nodeInfoList, processStatus }) {
    const orderInfoRequiredFields = []
    const orderInfoEnabledFields = []
    const productsRequiredFields = []
    const productsEnabledFields = []
    const cooProductRequiredFields = []
    const cooProductEnabledFields = []
    const cooInfoRequiredFields = []
    const cooInfoEnabledFields = []

    switch(processStatus) {
      case PROCESS_STATUS.COMPLETED:
        this.showOmField = true
        this.showPmField = true
        this.showPmFeedbackField = true
        break
      case PROCESS_STATUS.START:
        if (nodeCode > 'node0') {
          this.showOmField = true
        }
    
        if (nodeCode > 'node1') {
          this.showPmField = true
        }
    
        if(nodeCode > 'node5') {
          this.showPmFeedbackField = true
        }
        if (this.fromTask) {
          switch (nodeCode) {
            case 'node1': // OM补充信息
              // orderInfo
              orderInfoRequiredFields.push('shipToName', 'paymentReceived', 'receivedAmount', 'purchaseOrderNo')
              orderInfoEnabledFields.push('shipToName', 'paymentReceived', 'receivedAmount', 'purchaseOrderNo', 'purchaseAgreement')
              if (this.orderInfo.get('currency').value === 'USD') {
                orderInfoRequiredFields.push('purchaseAgreement')
                this.isPurchaseAgreementRequired = true
              }
              // products
              productsRequiredFields.push('equipmentSn', 'orderDate', 'productionDate', 'arrivalDate', 'goodsDeliveryDate', 'equipmentDescription', 'equipmentDescriptionEn', 'guaranteeMonth')
              productsEnabledFields.push('wbsNo', 'itemNo', 'equipmentSn', 'orderDate', 'productionDate', 'arrivalDate', 'goodsDeliveryDate', 'equipmentDescription', 'equipmentDescriptionEn', 'guaranteeMonth')
              // cooProduct
              cooProductEnabledFields.push(
                'cipPort', 'airTransportNo', 'addressType',
                'deliveryAddress', 'deliveryAddressEn',
                'customsClearancePort', 'customsClearancePortEn'
              )
              cooProductRequiredFields.push(
                'cipPort', 'airTransportNo', 'addressType',
                'deliveryAddress', 'deliveryAddressEn',
                'customsClearancePort', 'customsClearancePortEn'
              )
              break
            case 'node2': // PM补充信息
              // cooInfo
              cooInfoRequiredFields.push('applySignedDate', 'cooConfirmationLetterDraft', 'cooConfirmationLetterDealer')
              cooInfoEnabledFields.push('applySignedDate', 'cooConfirmationLetterDraft', 'cooConfirmationLetterDealer')
              break
            case 'node6':
              cooInfoRequiredFields.push('cooConfirmationLetterSign')
              cooInfoEnabledFields.push('cooConfirmationLetterSign')
              break
          }
        }
    }

    orderInfoRequiredFields.forEach((fieldName) => this.orderInfo.get(fieldName).setValidators(Validators.required))
    orderInfoEnabledFields.forEach((fieldName) => this.orderInfo.get(fieldName).enable())
    cooProductRequiredFields.forEach((fieldName) => this.cooProduct.get(fieldName).setValidators(Validators.required))
    cooProductEnabledFields.forEach((fieldName) => this.cooProduct.get(fieldName).enable())
    cooInfoRequiredFields.forEach((fieldName) => this.cooInfo.get(fieldName).setValidators(Validators.required))
    cooInfoEnabledFields.forEach((fieldName) => this.cooInfo.get(fieldName).enable())
    this.products.controls.forEach((product: FormGroup) => {
      productsRequiredFields.forEach((fieldName) => {
        product.get(fieldName).setValidators(Validators.required)
      })
      productsEnabledFields.forEach((fieldName) => {
        product.get(fieldName).enable()
      })
    })
  }

  onForeignCompanyChange(companyName) {
    const control = this.orderInfo.get('foreignCompanyNo')
    if (companyName) {
      const company = this.selectOptions.foreignCompanies.find(({ corporateName }) => corporateName === companyName)
      control.setValue(company.serialNumber)
    } else {
      control.setValue(null)
    }
  }

  onPaymentMethodChange(method) {
    const paymentMethodOther = this.orderInfo.get('paymentMethodOther')
    paymentMethodOther.patchValue(null)
    if (method === PAYMENT_METHOD_PDIGT_OTHER) {
      paymentMethodOther.setValidators(Validators.required)
    } else {
      paymentMethodOther.clearValidators()
    }
  }

  public validate() {
    // orderInfo
    const orderInfo = this.orderInfo
    for(const i in orderInfo.controls) {
      orderInfo.controls[i].markAsDirty()
      orderInfo.controls[i].updateValueAndValidity()
    }
    const isOrderInfoValid = orderInfo.disabled || orderInfo.valid
    // cooProduct
    const cooProduct = this.cooProduct
    for(const i in cooProduct.controls) {
      cooProduct.controls[i].markAsDirty()
      cooProduct.controls[i].updateValueAndValidity()
    }
    const isCooProductValid = cooProduct.disabled || cooProduct.valid
    // products
    this.products.controls.forEach((product: FormGroup) => {
      for(const i in product.controls) {
        product.controls[i].markAsDirty()
        product.controls[i].updateValueAndValidity()
      }
    })
    const isProductsValid = this.products.disabled || this.products.valid
    // cooInfo
    const cooInfo = this.cooInfo
    for(const i in cooInfo.controls) {
      cooInfo.controls[i].markAsDirty()
      cooInfo.controls[i].updateValueAndValidity()
    }
    const isCooInfoValid = cooInfo.disabled || cooInfo.valid
    return isOrderInfoValid && isCooProductValid && isProductsValid && isCooInfoValid
  }

  public getData() {
    let orderInfo = {
      ...this.originOrderInfo,
      ...this.orderInfo.getRawValue(),
    }
    let { products, cooProduct } = orderInfo
    products = products.map((product, index) => index === 0 ? { ...product, ...cooProduct } : product)
    orderInfo.products = products
    delete orderInfo.cooProduct
    const cooInfo = {
      ...this.originCooInfo,
      ...this.cooInfo.getRawValue(),
    }
    return {
      cooInfo,
      orderInfos: [orderInfo]
    }
  }

  public initData(data) {
    const { orderInfos, cooInfo } = data
    const orderInfo = orderInfos[0]
    const product = orderInfo.products[0]
    this.originOrderInfo = orderInfo
    this.originCooInfo = cooInfo
    this.orderInfo.patchValue(orderInfo)

    this.cooProduct.patchValue(product)
    const productGroup = this.products.at(0)
    productGroup.patchValue(product)
    if (!this.editable) {
      this.disableForm()
    }
    this.cooInfo.patchValue(cooInfo)
    this.setFormValidators(data)
  }

  createProduct() {
    return this.fb.group({
      productType: [null], // 产品型号
      quantity: [null, [Validators.required]], // 数量
      wbsNo: [null], // 订单WBS#
      itemNo: [null], // Item#
      equipmentSn: [null], // 设备SN号
      orderDate: [null], // 进单日期
      productionDate: [null], // 出厂日期
      arrivalDate: [null], // 到货日期
      goodsDeliveryDate: [null], // 货物送达日期
      equipmentDescription: [null], // 设备名称和描述中文
      equipmentDescriptionEn: [null], // 设备名称和描述英文
      guaranteeMonth: [null], // 保修期
    })
  }

  onCooSignedNotIcf(cooSignedNotIcf) {
    this.cooInfo.patchValue({
      specialApproval: cooSignedNotIcf
    })
  }

  onCycleGroupChange() {
    this.orderInfo.patchValue({ bigArea: null })
  }

  onCalcOrderProductType(productType) {
    this.orderInfo.patchValue({
      productType
    })
  }

  // 初始化OM列表
  async initOMUsers() {
    this.spService.getOMUsers().then((users) => {
      this.selectOptions.oms = users.map(({ name, email }) => ({ label: name, value: email }))
    })
  }

  async initForeignCompanies() {
    this.spService.getForeignCompany().then((foreignCompanies) => {
      this.selectOptions.foreignCompanies = foreignCompanies
    })
  }

  onShowSelectDealerModal() {
    this.selectDealer.showModal()
  }

  onSelectDealer(dealer: Dealer) {
    const { dealerCode, dealerName } = dealer
    this.orderInfo.patchValue({
      dealerCode: dealerCode,
      dealerName: dealerName,
    })
  }

  onClearDealer() {
    this.orderInfo.patchValue({
      dealerCode: null,
      dealerName: null,
    })
  }

  onShowReferenceModal() {
    this.selectReference.showModal(false)
  }

  onSelectReference(reference: Reference) {
    const {
      referenceId,
      orderType,
      productModel,
      sap,
      team,
      region,
      bmc,
      businessModel,
      distributor,
      dealerCode,
      endUser,
      endUserId,
      contractPrice,
      invoiceInformation,
      logistician,
      marketBundleQuantity,
    } = reference
    this.orderInfo.patchValue({
      referenceId,
      orderType,
      productModel,
      sapOrderNo: sap,
      cycleGroup: team,
      bigArea: region,
      bmc,
      businessModel: businessModel ? businessModel.toLowerCase() : null,
      dealerName: distributor,
      dealerCode,
      hospitalName: endUser,
      hospitalNo: endUserId,
      orderAmount: contractPrice,
      currency: invoiceInformation,
      om: logistician,
    })
    this.products.at(0).patchValue({
      productType: productModel,
      quantity: marketBundleQuantity,
    })
  }

  onShowSelectHospitalModal() {
    this.selectHospital.showModal()
  }

  onSelectHospital(hospital: Hospital) {
    const { no, customerName } = hospital
    this.orderInfo.patchValue({
      hospitalNo: no,
      hospitalName: customerName,
    })
  }

  onClearHospital() {
    this.orderInfo.patchValue({
      hospitalNo: null,
      hospitalName: null,
    })
  }
  
  showTemplate() {
    // COO PD&IGT根据业务模式的不同, 分为2个模板
    const templateCodeMap = {
      direct: 'SpDirectCoo',
      distributor: 'SpDistributorCoo'
    }
    const philipsNameMap = {
      '飞利浦电子香港有限公司': 'Philips Electronics Hong Kong Limited',
      '飞利浦（中国）投资有限公司': 'Philips (China) Investment Co.,Ltd .'
    }

    const { 
      currency, receivedAmount, orderAmount, businessModel,
      sapOrderNo, contractNo, hospitalNo, hospitalName,
      philipsName, products,
    } = this.orderInfo.getRawValue()

    const { applySignedDate } = this.cooInfo.getRawValue()
    const { guaranteeMonth } = products[0]
    const { customsClearancePort, customsClearancePortEn, deliveryAddress, deliveryAddressEn } = this.cooProduct.getRawValue()
    const params = {
      templateCode: templateCodeMap[businessModel],
      applySignedDate,
      applySignedDateUpdate: applySignedDate ? moment(applySignedDate).add(1, 'years').subtract(1, 'days').format('YYYY-MM-DD') : null,
      currency,
      receivedAmount,
      contractAmount: orderAmount,
      sapOrderNo,
      contractNo,
      hospitalNo,
      hospitalName,
      philipsName,
      philipsNameEn: philipsNameMap[philipsName],
      customsClearancePort,
      customsClearancePortEn,
      deliveryAddress,
      deliveryAddressEn,
      guaranteeMonth,
      applySignedDateUpdateAndguaranteeMonth: (applySignedDate && guaranteeMonth) ? moment(applySignedDate).add(1, 'years').subtract(1, 'days').add(guaranteeMonth, 'months').format('YYYY-MM-DD') : null,
      tableParamsList: JSON.stringify(products.map(({ quantity, equipmentDescription, arrivalDate, equipmentSn }) => ({ quantity: String(quantity), equipmentDescription, arrivalDate, equipmentSn })))
    }

    this.appPdfPreview.show(params)
  }
}