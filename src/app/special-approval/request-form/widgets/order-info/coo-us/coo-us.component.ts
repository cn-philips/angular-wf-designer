import { Component, OnInit, Input, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms'
import { BG_LIST, BUSINESS_MODEL, BUSINESS_MODEL_LIST, CURRENCIES, FIELD_STATUS_LIST, FIELD_STATUS_OTHER, PAYMENT_METHOD_LIST, PROCESS_STATUS } from '../../../../special-approval.constants'
import { SpecialApprovalService } from '../../../../special-approval.service'
import { Dealer, SelectDealerComponent } from '../../select-dealer/select-dealer.component';
import { PdfPreviewComponent } from '../../../../../shared/components'
import * as moment from 'moment'
import { NzMessageService } from 'ng-zorro-antd'

const disableSubmitValidtorFn = (disableValue) => (control: AbstractControl): ValidationErrors | null => {
  return control.value === disableValue ? { disableSubmit: true } : null
}

const productsValidator = (control: AbstractControl): ValidationErrors | null => {
  // today - max(最大货物送达日期) > 3个月
  const products = control.value || []
  if (products.length > 0) {
    const goodsDeliveryDates = products
      .map(({ goodsDeliveryDate }) => goodsDeliveryDate)
      .filter((goodsDeliveryDate) => goodsDeliveryDate)
      .sort()
    const maxGoodsDeliveryDate = goodsDeliveryDates[goodsDeliveryDates.length - 1]
    const targetDate = moment().subtract(3, 'months').format('YYYY-MM-DD')
    if (maxGoodsDeliveryDate && targetDate <= maxGoodsDeliveryDate) {
      return { goodsDelivery: true }
    } else {
      return null
    }
  }
  return null
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

  showDeliveryAddress = false
  showExpectedFieldDate = true

  orderInfo = this.fb.group({
    productType: [{ value: null, disabled: true }], // 产品型号
    bmc: [null, [Validators.required]], // 产品线
    bg: [{ value: 'US', disabled: true }], // BG
    cycleGroup: [null], // Cycle Group
    bigArea: [null], // 大区
    businessModel: [null, [Validators.required]], // 业务模式
    sapOrderNo: [null, [Validators.required]], // SAP订单号
    om: [null], // OM
    products: this.fb.array([], [Validators.required, productsValidator]),
    contractNo: [null], // 合同号
    currency: [null], // 币制
    shipToName: [null, [Validators.required]], // ship-to name
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
    expectedFieldDate: [null], // 预计场地就位日期
    expectedInstallationDate: [null, [Validators.required]], // 预计装机日期
    expectedSaleDate: [null, [Validators.required]], // 预计记认销售日期
    installationOrDispatch: [null, [Validators.required, disableSubmitValidtorFn('1')]], // 是否已装机或派单
    threeMonthsAfterArrival: [null, [disableSubmitValidtorFn('0')]], // 是否到货>3个月
    cooSignedNotIcf: [null, [Validators.required]], // 经销商是否存在之前签署过COO的订单12个月内未签回安装报告的情况
    specialApproval: [{ value: null, disabled: true }], // 是否需要特批
    applySignedDate: [null], // 预计签署日期
    cooConfirmationLetterDraft: [null], // COO确认函草稿（word版）
    airTransportNoDealer: [null], // 经销商盖章后的空运单
    cooConfirmationLetterDealer: [null], // 经销商盖章后的COO确认函
    cooConfirmationLetterSign: [null], // 双签后的COO确认函
  })

  selectOptions = {
    productList: [],
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
    public spService: SpecialApprovalService,
    private message: NzMessageService,
  ) { }

  ngOnInit() {
    this.initOMUsers()
    this.initPorductList()
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
  setFormValidators({ nodeCode, processStatus }) {
    const orderInfoRequiredFields = []
    const orderInfoEnabledFields = []
    const productsRequiredFields = []
    const productsEnabledFields = []
    const cooProductRequiredFields = []
    const cooProductEnabledFields = []
    const cooInfoRequiredFields = []
    const cooInfoEnabledFields = []
    if (this.cooProduct.get('cipPort').value === '0') {
      this.showDeliveryAddress = true
    }

    switch(processStatus) {
      case PROCESS_STATUS.COMPLETED:
        this.showScPlanningField = true
        this.showOmField = true
        this.showOaField = true
        this.showSalesFeedbackField = true
        this.showScPlanningFeedbackField = true
        this.showDeliveryAddress = true
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
          this.showDeliveryAddress = true
        }

        if (nodeCode > 'node7') {
          this.showScPlanningFeedbackField = true
        }

        if (this.fromTask) {
          switch (nodeCode) {
            case 'node1': // SC Planning补充信息
              // orderInfo
              orderInfoRequiredFields.push('contractNo', 'currency')
              orderInfoEnabledFields.push('contractNo', 'currency')
              // products
              productsRequiredFields.push('productionDate')
              productsEnabledFields.push('productionDate')
              break
            case 'node3': // OM补充信息
              // orderInfo
              orderInfoEnabledFields.push('paymentMethod', 'paymentReceived')
              orderInfoRequiredFields.push('paymentMethod', 'paymentReceived')
              // products
              productsRequiredFields.push('equipmentSn')
              productsEnabledFields.push('equipmentSn', 'goodsDeliveryDate')
              // cooProduct
              cooProductEnabledFields.push(
                'cipPort', 'airTransportNo', 'addressType',
                'deliveryAddress', 'deliveryAddressEn',
                'customsClearancePort', 'customsClearancePortEn'
              )
              cooProductRequiredFields.push('cipPort', 'airTransportNo', 'customsClearancePort', 'customsClearancePortEn')
              if (this.cooProduct.get('cipPort').value === '0') {
                cooProductRequiredFields.push('deliveryAddress', 'deliveryAddressEn', 'addressType')
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
              cooInfoRequiredFields.push('applySignedDate', 'cooConfirmationLetterDraft', 'cooConfirmationLetterDealer')
              cooInfoEnabledFields.push('applySignedDate', 'cooConfirmationLetterDraft', 'cooConfirmationLetterDealer')

              if (this.cooProduct.get('cipPort').value === '1') {
                this.products.clearValidators()
                cooInfoRequiredFields.push('airTransportNoDealer')
                cooInfoEnabledFields.push('airTransportNoDealer')
                productsRequiredFields.push('goodsDeliveryDate')
                productsEnabledFields.push('goodsDeliveryDate')
                cooProductRequiredFields.push('deliveryAddress', 'deliveryAddressEn', 'addressType')
                cooProductEnabledFields.push('deliveryAddress', 'deliveryAddressEn', 'addressType')
              }
              break
            case 'node8': // SC Planning反馈
              // cooInfo
              // cooInfoRequiredFields.push('cooConfirmationLetterSign')
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
    const fieldStatusExplain = this.cooInfo.get('fieldStatusExplain')
    const expectedFieldDate = this.cooInfo.get('expectedFieldDate')
    this.showExpectedFieldDate = true;
    if(status === FIELD_STATUS_OTHER) {
      fieldStatusExplain.setValidators(Validators.required)
      expectedFieldDate.setValidators(Validators.required)
    } else if(status === '场地OK') {
      expectedFieldDate.clearValidators()
      fieldStatusExplain.clearValidators()
      this.cooInfo.patchValue({
        expectedFieldDate: null
      })
      this.showExpectedFieldDate = false;
    } else {
      expectedFieldDate.setValidators(Validators.required)
      fieldStatusExplain.clearValidators()
    }
    fieldStatusExplain.patchValue(null)
  }

  onCipPortChange(cipPort) {
    this.cooProduct.patchValue({
      deliveryAddress: null,
      deliveryAddressEn: null,
      addressType: null
    })
    if (cipPort === '0') {
      this.products.controls.forEach((product) => {
        product.get('goodsDeliveryDate').setValidators(Validators.required)
      })
      this.cooProduct.get('deliveryAddress').setValidators(Validators.required)
      this.cooProduct.get('deliveryAddressEn').setValidators(Validators.required)
      this.cooProduct.get('addressType').setValidators(Validators.required)
      this.showDeliveryAddress = true
    } else {
      this.products.controls.forEach((product) => {
        product.patchValue({ goodsDeliveryDate: null })
        product.get('goodsDeliveryDate').clearValidators()
        product.get('goodsDeliveryDate').setErrors(null)
      })
      this.cooProduct.get('deliveryAddress').clearValidators()
      this.cooProduct.get('deliveryAddressEn').clearValidators()
      this.cooProduct.get('addressType').clearValidators()
      this.showDeliveryAddress = false
    }
  }

  onIsBidChange(isBid) {
    this.cooInfo.patchValue({
      pending: null,
      expectedBiddingDate: null,
      losingOrders: null,
      expectedNewUserDate: null,
    })
    const allFields = ['pending', 'expectedBiddingDate', 'losingOrders', 'expectedNewUserDate']
    allFields.forEach((fieldName) => this.cooInfo.get(fieldName).clearValidators())
    let requiredFields = []
    switch(isBid) {
      case '0':
        requiredFields = ['losingOrders', 'expectedNewUserDate', 'pending', 'expectedBiddingDate']
        break
      case '2':
        requiredFields = ['losingOrders', 'expectedNewUserDate']
        break
    }
    requiredFields.forEach((fieldName) => this.cooInfo.get(fieldName).setValidators(Validators.required))
  }

  public validate(feedbackAction = null) {
    // 未按审批结果执行, 不需要校验货物送达日期
    if (feedbackAction === 0) {
      this.products.clearValidators()
    } else if (feedbackAction === 1) {
      this.products.setValidators(productsValidator)
    }
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
    const cooInfo = {
      ...this.originCooInfo,
      ...this.cooInfo.getRawValue(),
    }
    let orderInfo = {
      ...this.originOrderInfo,
      ...this.orderInfo.getRawValue(),
      expectedSaleDate: cooInfo.expectedSaleDate,
    }
    let { products, cooProduct } = orderInfo
    products = products.map((product, index) => index === 0 ? { ...product, ...cooProduct } : product)
    orderInfo.products = products
    delete orderInfo.cooProduct
    delete cooInfo.expectedSaleDate
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
    this.cooInfo.patchValue({ ...cooInfo, expectedSaleDate: orderInfo.expectedSaleDate })
    if (!this.editable) {
      this.disableForm()
    }
    this.setFormValidators(data)
  }

  createProduct() {
    return this.fb.group({
      wbsNo: [null, [Validators.required]], // 订单WBS#
      itemNo: [null, [Validators.required]], // Item#
      quantity: [{ value: 1, disabled: true }, [Validators.required]], // 数量
      productType: [null, [Validators.required]], // 产品型号
      orderDate: [null, [Validators.required]], // 进单日期
      productionDate: [null], // 出厂日期
      arrivalDate: [null, [Validators.required]], // 到货日期
      goodsDeliveryDate: [null], // 货物送达日期
      equipmentSn: [null], // 设备SN号
      equipmentDescription: [null], // 设备名称和描述中文
      equipmentDescriptionEn: [null], // 设备名称和描述英文
      guaranteeMonth: [null], // 保修期
    })
  }

  // 计算是否到货>3个月
  onArrivalDateChange() {
    const products = this.products.getRawValue()
    const arrivalDates = products
      .map(({ arrivalDate }) => arrivalDate)
      .filter((arrivalDate) => arrivalDate)
      .sort()
    let threeMonthsAfterArrival
    const maxArrivalDate = arrivalDates[arrivalDates.length - 1]
    if (maxArrivalDate) {
      const targetDate = moment().subtract(3, 'months').format('YYYY-MM-DD')
      if (targetDate > maxArrivalDate) {
        threeMonthsAfterArrival = '1'
      } else {
        threeMonthsAfterArrival = '0'
      }
    } else {
      threeMonthsAfterArrival = null
    }
    this.cooInfo.patchValue({ threeMonthsAfterArrival })
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
    this.calcOrderProductType()
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

  onProductTypeChange(productType, product: FormGroup) {
    const productIns = this.selectOptions.productList.find(({ productModel }) => productModel === productType)
    if (productIns) {
      const { equipmentDescription, equipmentDescriptionEn } = productIns
      product.patchValue({
        equipmentDescription,
        equipmentDescriptionEn,
      })
    } else {
      product.patchValue({
        equipmentDescription: null,
        equipmentDescriptionEn: null,
      })
    }
    this.calcOrderProductType()
  }

  calcOrderProductType() {
    const products = this.products.value as any[]
    const orderProductType = products
      .filter(({ productType }) => productType)
      .map(({ productType }) => productType)
      .filter((productType) => productType)
      .join(';')
    this.orderInfo.patchValue({
      productType: orderProductType
    })
  }

  // 初始化OM列表
  async initOMUsers() {
    this.spService.getOMUsers().then((users) => this.selectOptions.oms = users.map(({ name, email }) => ({ label: name, value: email })))
  }

  showTemplate() {
    const isValid = this.validate()
    if (!isValid) {
      this.message.warning('请先补充表单信息')
      return
    }
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

    const docNameMap = {
      USD: `[US]USD COO  indirect deal_${sapOrderNo}.doc`,
      CNY: `[US]CNY COO  indirect deal_${sapOrderNo}.doc`
    }

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
      docName: docNameMap[currency],
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

  initPorductList() {
    this.spService.getUSProductDescList().then((data) => {
      this.selectOptions.productList = data
    })
  }
}
