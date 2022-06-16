import { Component, OnInit, Input, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms'
import { BG_LIST, BUSINESS_MODEL, BUSINESS_MODEL_LIST, CURRENCIES, FIELD_STATUS_LIST, FIELD_STATUS_OTHER, PAYMENT_METHOD_LIST, PROCESS_STATUS } from '../../../../special-approval.constants'
import { SpecialApprovalService } from '../../../../special-approval.service'
import { Dealer, SelectDealerComponent } from '../../select-dealer/select-dealer.component';
import { PdfPreviewComponent } from '../../../../../shared/components'
import * as moment from 'moment'

const disableSubmitValidtorFn = (disableValue) => (control: AbstractControl): ValidationErrors | null => {
  return control.value === disableValue ? { disableSubmit: true } : null
}

@Component({
  selector: 'special-approval-coo-us-order-info',
  templateUrl: 'coo-us.component.html',
  styleUrls: ['./cos-us.component.scss']
})
export class CooUsOrderInfoComponent implements OnInit, OnChanges {

  originOrderInfo = {}
  originCooInfo = {}
  
  @ViewChild('selectDealer') selectDealer: SelectDealerComponent
  @ViewChild('appPdfPreview') appPdfPreview: PdfPreviewComponent
  @Input() editable = true
  @Input() fromTask = false

  loginUserCode1 = localStorage.getItem('ng_philips_code1')

  FIELD_STATUS_OTHER = FIELD_STATUS_OTHER
  BUSINESS_MODEL = BUSINESS_MODEL

  showScPlanningField = false
  showOmField = false
  showOaField = false
  showSalesFeedbackField = false
  showScPlanningFeedbackField = false
  showSelectDealerBtn = false

  orderInfo = this.fb.group({
    productType: [{ value: null, disabled: true }], // 产品型号
    bmc: [null, [Validators.required]], // 产品线
    bg: [{ value: 'US', disabled: true }], // BG
    cycleGroup: [null], // Cycle Group
    bigArea: [null], // 大区
    businessModel: [null, [Validators.required]], // 业务模式
    sapOrderNo: [null, [Validators.required]], // SAP订单号
    om: [null], // OM
    products: this.fb.array([], [Validators.required]),
    contractNo: [null], // 合同号
    currency: [null], // 币制
    shipToName: [null], // ship-to name
    paymentMethod: [null], // 付款方式
    paymentReceived: [null], // 全款是否已经收到
    cooProduct: this.fb.group({
      cipPort: [null], // 是否为CIP港口
      airTransportNo: [null], // POD扫描件/空运单
      addressType: [null], // 送达地址类型
      deliveryAddress: [null], // 货物送达地址中文
      deliveryAddressEn: [null], // 货物送达地址英文
      customsClearancePort: [null], // 清关口岸中文
      customsClearancePortEn: [null], // 清关口岸英文
    }),
    dealerName: [{ value: null, disabled: true }], // 经销商名称
    dealerCode: [{ value: null, disabled: true }], // 经销商编号
    purchaseOrderNo: [null], // 采购订单
  })

  cooInfo = this.fb.group({
    isBid: [null, [Validators.required]], // 是否中标
    pending: [null], // 目前pending环节
    expectedBiddingDate: [null], // 预计招标月份
    losingOrders: [null], // 丢单风险
    expectedNewUserDate: [null], // 如丢单，预计寻得新用户月份
    fieldStatus: [null, [Validators.required]], // 场地状态
    fieldStatusExplain: [null], // 场地状态-补充说明
    newOrOldHospital: [null, [Validators.required]], // 新建医院还是老医院新院区
    expectedFieldDate: [null, [Validators.required]], // 预计场地就位日期
    planIcfDate: [null, [Validators.required]], // 计划ICF时间
    installationOrDispatch: [null, [Validators.required, disableSubmitValidtorFn('1')]], // 是否已装机或派单
    threeMonthsAfterArrival: [null, [Validators.required, disableSubmitValidtorFn('0')]], // 是否到货>3个月
    cooSignedNotIcf: [null, [Validators.required]], // 经销商是否为COO签署12个月内未签回ICF
    specialApproval: [{ value: null, disabled: true }, [Validators.required]], // 是否需要特批
    applySignedDate: [null], // 预计签署日期
    cooConfirmationLetterDraft: [null], // COO确认函草稿
    airTransportNoDealer: [null], // 经销商盖章后的空运单
    cooConfirmationLetterDealer: [null], // 经销商盖章后的COO确认函
    cooConfirmationLetterSign: [null], // 双签后的COO确认函
  })

  selectOptions = {
    bgList: BG_LIST,
    businessModels: BUSINESS_MODEL_LIST,
    oms: [],
    currencies: CURRENCIES,
    fieldStatusList: FIELD_STATUS_LIST,
    paymentMethodList: PAYMENT_METHOD_LIST,
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
    return this.spService.bmcList.filter((bmc) => bmc.bg === 'US')
  }

  constructor(
    private fb: FormBuilder,
    public spService: SpecialApprovalService
  ) { }

  ngOnInit() {
    this.initOMUsers()
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

  // node1: SC Planning补充信息
  // node3: OM 补充信息
  // node4: OA 补充信息
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
        this.showScPlanningField = true
        this.showOmField = true
        this.showOaField = true
        this.showSalesFeedbackField = true
        this.showScPlanningFeedbackField = true
        break
      case PROCESS_STATUS.START:
        if (nodeCode > 'node0') {
          this.showScPlanningField = true
        }
    
        if (nodeCode > 'node2') {
          this.showOmField = true
        }
    
        if(nodeCode > 'node3') {
          this.showOaField = true
        }
    
        if(nodeCode > 'node6') {
          this.showSalesFeedbackField = true
        }
    
        if (nodeCode > 'node7') {
          this.showScPlanningFeedbackField = true
        }

        if (this.fromTask) {
          switch (nodeCode) {
            case 'node1': // SC Planning补充信息
              // orderInfo
              orderInfoRequiredFields.push('contractNo', 'currency', 'shipToName')
              orderInfoEnabledFields.push('contractNo', 'currency', 'shipToName')
              // products
              productsRequiredFields.push('productType', 'orderDate', 'productionDate', 'arrivalDate')
              productsEnabledFields.push('productType', 'orderDate', 'productionDate', 'arrivalDate')
              break
            case 'node3': // OM补充信息 
              // orderInfo
              orderInfoEnabledFields.push('paymentMethod', 'paymentReceived')
              orderInfoRequiredFields.push('paymentMethod', 'paymentReceived')
              // products
              productsRequiredFields.push('goodsDeliveryDate', 'equipmentSn')
              productsEnabledFields.push('goodsDeliveryDate', 'equipmentSn')
              // cooProduct
              cooProductEnabledFields.push(
                'cipPort', 'airTransportNo', 'addressType',
                'deliveryAddress', 'deliveryAddressEn',
                'customsClearancePort', 'customsClearancePortEn'
              )
              cooProductRequiredFields.push('airTransportNo', 'addressType', 'customsClearancePort', 'customsClearancePortEn')
              if (this.cooProduct.get('cipPort').value === '0') {
                cooProductRequiredFields.push('deliveryAddress', 'deliveryAddressEn')
              }
              break
            case 'node4': // OA补充信息
              // orderInfo
              orderInfoRequiredFields.push('purchaseOrderNo')
              orderInfoEnabledFields.push('purchaseOrderNo')
              // products
              productsRequiredFields.push('equipmentDescription', 'equipmentDescriptionEn', 'guaranteeMonth')
              productsEnabledFields.push('equipmentDescription', 'equipmentDescriptionEn', 'guaranteeMonth')
              if (this.orderInfo.get('businessModel').value === BUSINESS_MODEL.DISTRIBUTOR_DEAL) {
                orderInfoRequiredFields.push('dealerName', 'dealerCode')
                orderInfoEnabledFields.push('dealerName', 'dealerCode')
                this.showSelectDealerBtn = true
              }
              break
            case 'node7': // 申请人反馈
              // cooInfo
              cooInfoRequiredFields.push('applySignedDate', 'cooConfirmationLetterDraft', 'airTransportNoDealer', 'cooConfirmationLetterDealer')
              cooInfoEnabledFields.push('applySignedDate', 'cooConfirmationLetterDraft', 'airTransportNoDealer', 'cooConfirmationLetterDealer')
              break
            case 'node8': // SC Planning反馈
              // cooInfo
              cooInfoRequiredFields.push('cooConfirmationLetterSign')
              cooInfoEnabledFields.push('cooConfirmationLetterSign')
              break
          }
        }
        break
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

  onFieldStatusChange(status) {
    if(status === FIELD_STATUS_OTHER) {
      this.cooInfo.get('fieldStatusExplain').setValidators(Validators.required)
    } else {
      this.cooInfo.get('fieldStatusExplain').clearValidators()
    }
  }

  onCipPortChange(cipPort) {
    if (cipPort === '0') {
      this.cooProduct.get('deliveryAddress').setValidators(Validators.required)
      this.cooProduct.get('deliveryAddressEn').setValidators(Validators.required)
    } else {
      this.cooProduct.get('deliveryAddress').clearValidators()
      this.cooProduct.get('deliveryAddressEn').clearValidators()
    }
  }

  onIsBidChange(isBid) {
    const fields = ['pending', 'expectedBiddingDate', 'losingOrders', 'expectedNewUserDate']
    if (isBid === '0') {
      fields.forEach((fieldName) => this.cooInfo.get(fieldName).setValidators(Validators.required))
    } else {
      fields.forEach((fieldName) => this.cooInfo.get(fieldName).clearValidators())
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
    const products = orderInfo.products
    this.originOrderInfo = orderInfo
    this.originCooInfo = cooInfo
    this.orderInfo.patchValue({
      ...orderInfo,
      products: products ? products : []
    })

    if (products) {
      this.cooProduct.patchValue(products[0])
      // formArray不能直接patchValue
      products.forEach((product, index) => {
        const newProduct = this.createProduct()
        if (!this.editable) {
          newProduct.disable()
        }
        this.products.push(newProduct)
        this.products.at(index).patchValue(product)
      })
    }
    this.cooInfo.patchValue(cooInfo)
    if (!this.editable) {
      this.disableForm()
    }
    this.setFormValidators(data)
  }

  createProduct() {
    return this.fb.group({
      wbsNo: [null, [Validators.required]], // 订单WBS#
      itemNo: [null, [Validators.required]], // Item#
      quantity: [null, [Validators.required]], // 数量
      productType: [null], // 产品型号
      orderDate: [null], // 进单日期
      productionDate: [null], // 出厂日期
      arrivalDate: [null], // 到货日期
      goodsDeliveryDate: [null], // 货物送达日期
      equipmentSn: [null], // 设备SN号
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

  onAddProduct() {
    this.products.push(this.createProduct())
  }

  onDeleteProduct(index) {
    this.products.removeAt(index)
    this.onCalcOrderProductType()
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

  onShowSelectDealerModal() {
    this.selectDealer.showModal()
  }

  onCalcOrderProductType() {
    const products = this.products.value as any[]
    const orderProductType = products
      .filter(({ productType }) => productType)
      .map(({ productType }) => productType)
      .join(';')
    this.orderInfo.patchValue({
      productType: orderProductType
    })
  }

  // 初始化OM列表
  async initOMUsers() {
    const users = await this.spService.getOMUsers()
    this.selectOptions.oms = users.map(({ name, email }) => ({ label: name, value: email }))
  }

  showTemplate() {
    // COO US根据币制的不同, 分为2个模板
    const templateCodeMap = {
      USD: 'SpUsUSDCoo',
      CNY: 'SpUsCNYCoo'
    }
    // 其他需要的字段
    const { 
      contractNo, // 合同号
      sapOrderNo, // SAP订单号
      dealerName, // 经销商名称
      dealerCode, // 经销商编号
      currency, // 币制
      products, // 产品列表
      cooProduct: { 
        addressType, // 货物送达地址类型
        deliveryAddress, // 货物送达地址
        deliveryAddressEn, // 货物送达地址英文
        customsClearancePort, // 清关口岸
        customsClearancePortEn, // 清关口岸英文
      }
    } = this.orderInfo.getRawValue()
    const { applySignedDate } = this.cooInfo.getRawValue()
    // 一台设备：【出厂日期】 +【保修期】-1天，如出厂日期为2022/6/1日，保修期为15个月，则显示“2023/05/30”；
    // 多台设备按同一日期合并：【设备SN号1】&【设备SN号2】：【出厂日期1】 +【保修期】-1天；【设备SN号3】：【出厂日期3】 +【保修期】-1天；……
    // 如US1001 & US1002出厂日期为2022/06/01，保修期为27，US1003出厂日期为2022/05/30，保修期为15，则显示为“US1001 & US1002:2024/08/30;US1003:2023/08/29”
    // 表格字段 tableParamsList
    // 计算productDateMerge
    const dateProductMap = {}
    products.forEach(({ equipmentSn, productionDate, guaranteeMonth }) => {
      const endDate = moment(productionDate).add(guaranteeMonth, 'months').subtract(1, 'days').format('YYYY-MM-DD')
      dateProductMap[endDate] = dateProductMap[endDate] ? [...dateProductMap[endDate], equipmentSn] : [equipmentSn]
    })

    let deliveryAddressEnHospital, customsClearancePortEnHospital, customsClearancePortHospital, deliveryAddressHospital
    let customsClearancePortEnAgent, deliveryAddressEnAgent, customsClearancePortAgent, deliveryAddressAgent

    if (addressType === '医院地址') {
      deliveryAddressHospital = deliveryAddress
      deliveryAddressEnHospital = deliveryAddressEn
      customsClearancePortHospital = customsClearancePort
      customsClearancePortEnHospital = customsClearancePortEn
      customsClearancePortEnAgent = deliveryAddressEnAgent = customsClearancePortAgent = deliveryAddressAgent = '/'
    } else if (addressType === '代理商仓库地址') {
      deliveryAddressAgent = deliveryAddress
      deliveryAddressEnAgent = deliveryAddressEn
      customsClearancePortAgent = customsClearancePort
      customsClearancePortEnAgent = customsClearancePortEn
      deliveryAddressEnHospital = customsClearancePortEnHospital = customsClearancePortHospital = deliveryAddressHospital = '/'
    }
    
    const params = {
      templateCode: templateCodeMap[currency],
      contractNo,
      sapOrderNo,
      wbsNo: products.length > 0 ? products.map(({ wbsNo }) => wbsNo).join(',') : null,
      dealerCode,
      dealerName,
      deliveryAddressEnHospital, customsClearancePortEnHospital, customsClearancePortHospital, deliveryAddressHospital,
      customsClearancePortEnAgent, deliveryAddressEnAgent, customsClearancePortAgent, deliveryAddressAgent,
      applySignedDateUpdate: applySignedDate ? moment(applySignedDate).add(1, 'years').endOf('month').format('YYYY-MM-DD') : null,
      productDateMerge: Object.keys(dateProductMap).map((date) => `${dateProductMap[date].join(' & ')}:${date}`).join(';'),
      tableParamsList: products.length > 0 ? JSON.stringify(products.map(({ quantity, equipmentDescription, goodsDeliveryDate, equipmentSn }) => ({ quantity: String(quantity), equipmentDescription, goodsDeliveryDate, equipmentSn }))) : null,
    }
    this.appPdfPreview.show(params)
  }
}