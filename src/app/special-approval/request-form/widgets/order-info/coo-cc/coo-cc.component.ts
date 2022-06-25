import { Component, OnInit, Input, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms'
import { BG_LIST, BUSINESS_MODEL, BUSINESS_MODEL_LIST, CURRENCIES, FIELD_STATUS_LIST, FIELD_STATUS_OTHER, PAYMENT_METHOD_LIST, PROCESS_STATUS } from '../../../../special-approval.constants'
import { SpecialApprovalService } from '../../../../special-approval.service'
import { Dealer, SelectDealerComponent } from '../../select-dealer/select-dealer.component';
import { NzMessageService, UploadXHRArgs } from 'ng-zorro-antd'
import { getType } from '../../../../../../assets/js/tools';
import { environment } from "../../../../../../environments/environment";
import { read, utils } from "xlsx";
import { PdfPreviewComponent } from '../../../../../shared/components'
import * as moment from 'moment'
import { saveAs } from 'file-saver';

import { HttpService } from '../../../../../services';

const disableSubmitValidtorFn = (disableValue) => (control: AbstractControl): ValidationErrors | null => {
  return control.value === disableValue ? { disableSubmit: true } : null
}

// 订单列表里的业务模式, 经销商, 飞利浦实体名称需要保持一致
const orderInfosValidator = (control: FormArray): ValidationErrors | null => {
  const orderInfos = control.getRawValue()
  let dealerName
  let philipsName
  let businessModel
  const error = {
    dealerNameDiff: false,
    philipsNameDiff: false,
    businessModelDiff: false,
  }
  for(let orderInfo of orderInfos) {
    if (orderInfo.dealerName) {
      if (dealerName && orderInfo.dealerName !== dealerName) {
        error.dealerNameDiff = true
      } else {
        dealerName = orderInfo.dealerName
      }
    }

    if (orderInfo.philipsName) {
      if (philipsName && orderInfo.philipsName !== philipsName) {
        error.philipsNameDiff = true
      } else {
        philipsName = orderInfo.philipsName
      }
    }

    if (orderInfo.businessModel) {
      if (businessModel && orderInfo.businessModel !== businessModel) {
        error.businessModelDiff = true
      } else {
        businessModel = orderInfo.businessModel
      }
    }
  }
  return (error.dealerNameDiff || error.philipsNameDiff || error.businessModelDiff) ? error : null
}

let loadingId

const excelKeyMap = {
  产品线: "bmc",
  "BG(Modality)": "bg",
  '销售区域-Cycle Group': "cycleGroup",
  '销售区域-Region': "bigArea",
  业务模式: "businessModel",
  经销商编号: "dealerCode",
  经销商名称: "dealerName",
  飞利浦实体名称: "philipsName",
  "SAP 订单号（SO#）": "sapOrderNo",
  币制: "currency",
  OM: "om",
  合同号: 'contractNo',
  'Ship-To Name': 'shipToName',
  产品型号: 'productType',
  设备SN号: 'equipmentSn',
  数量: 'quantity',
  进单日期: 'orderDate',
  出厂日期: 'productionDate',
  货物送达日期: 'goodsDeliveryDate',
  '保修期（月）': 'guaranteeMonth',
  是否为CIP港口: 'cipPort',
  送达地址类型: 'addressType',
  货物送达地址CN: 'deliveryAddress',
  货物送达地址EN: 'deliveryAddressEn',
  清关口岸CN: 'customsClearancePort',
  清关口岸EN: 'customsClearancePortEn',
};

const productInfo = {
  productId: [null],
  productType: [null, [Validators.required]], // 产品型号
  quantity: [null, [Validators.required]], // 数量
  equipmentSn: [null, [Validators.required]], // 设备SN号
  orderDate: [null, [Validators.required]], // 进单日期
  productionDate: [null, [Validators.required]], // 出厂日期
  goodsDeliveryDate: [null, [Validators.required]], // 货物送达日期
  guaranteeMonth: [null, [Validators.required]], // 保修期
  cipPort: [null, [Validators.required]], // 是否为CIP港口
  airTransportNo: [null], // POD扫描件/空运单
  addressType: [null, [Validators.required]], // 送达地址类型
  deliveryAddress: [null, [Validators.required]], // 货物送达地址中文
  deliveryAddressEn: [null, [Validators.required]], // 货物送达地址英文
  customsClearancePort: [null, [Validators.required]], // 清关口岸中文
  customsClearancePortEn: [null, [Validators.required]], // 清关口岸英文
}

const orderInfo = {
  id: [null],
  bmc: [null, [Validators.required]], // 产品线
  bg: [{ value: 'CC', disabled: true }], // BG(Modality)
  cycleGroup: [null], // 销售区域-Cycle Group
  bigArea: [null], // 销售区域-Region
  businessModel: [null, [Validators.required]], // 业务模式
  dealerName: [null], // 经销商名称
  dealerCode: [null], // 经销商编号
  philipsName: [null, [Validators.required]], // 飞利浦实体名称
  sapOrderNo: [null, [Validators.required]], // SAP订单号(SO#)
  currency: [null, [Validators.required]], // 币制
  om: [null], // OM
  contractNo: [null, [Validators.required]], // 合同号
  purchaseOrderNo: [null], // 采购订单
  shipToName: [null, Validators.required], // ship-to name
  // 产品信息
  ...productInfo,
}

@Component({
  selector: 'special-approval-coo-cc-order-info',
  templateUrl: 'coo-cc.component.html',
  styleUrls: ['./cos-cc.component.scss']
})
export class CooCcOrderInfoComponent implements OnInit, OnChanges {

  originOrderInfos = {}
  originCooInfo = {}
  
  @ViewChild('selectDealer') selectDealer: SelectDealerComponent
  @ViewChild('appPdfPreview') appPdfPreview: PdfPreviewComponent
  @Input() editable = true
  @Input() fromTask = false
  @Input() approveHistory = []

  loginUserCode1 = localStorage.getItem('ng_philips_code1')

  FIELD_STATUS_OTHER = FIELD_STATUS_OTHER
  BUSINESS_MODEL = BUSINESS_MODEL

  showCooFile = false
  showCooLetter = false

  showUploadFileList = false
  showAirTransportNoDealer = false

  activeOrderIndex = 0

  fileList = []
  fileIdSet = new Set()

  templateUrl = `${environment.base_href}/assets/template/COO-CC-Template.xlsx`

  formValues = this.fb.group({
    orderInfos: this.fb.array([], [Validators.required, orderInfosValidator]),
    cooInfo: this.fb.group({
      installationOrDispatch: [null, [Validators.required, disableSubmitValidtorFn('1')]], // 是否已装机或派单
      threeMonthsAfterArrival: [null, [disableSubmitValidtorFn('0')]], // 是否到货>3个月
      paymentNinetyPercent: [null, [Validators.required, disableSubmitValidtorFn('0')]], // 是否已付90%以上订单金额
      applySignedDate: [null], // 预计签署日期
      cooConfirmationLetterDraft: [null], // COO确认函草稿
      airTransportNoDealer: [null], // 经销商盖章后的空运单
      cooConfirmationLetterDealer: [null], // 经销商盖章后的COO确认函
      cooConfirmationLetterSign: [null], // 双签后的COO确认函
    })
  })

  createOrder() {
    return this.fb.group({
      ...orderInfo,
      isOrder: [true],
    })
  }

  onAddProduct(index) {
    const orderInfosValue = this.orderInfos.getRawValue()
    let insertedIndex = orderInfosValue.length
    for(let i = index + 1; i < orderInfosValue.length; i++) {
      if (orderInfosValue[i].isOrder) {
        insertedIndex = i
        break
      }
    }
    this.orderInfos.insert(insertedIndex, this.createProduct())
  }

  createProduct() {
    return this.fb.group({
      ...productInfo,
      isOrder: [false],
    })
  }

  onAddOrder() {
    const order = this.createOrder()
    this.orderInfos.push(order)
  }

  onDeleteOrder(index) {
    const orderInfo = this.orderInfos.at(index)
    const orderInfosValue = this.orderInfos.getRawValue()
    const isOrder = orderInfo.get('isOrder').value
    if (isOrder) {
      let lastDeletedOrderIndex = orderInfosValue.length - 1
      for(let i = index + 1; i < orderInfosValue.length; i++) {
        if (orderInfosValue[i].isOrder) {
          lastDeletedOrderIndex = i - 1
          break
        }
      }
      for(let i = lastDeletedOrderIndex; i >= index; i--) {
        this.orderInfos.removeAt(i)
      }
    } else {
      this.orderInfos.removeAt(index)
    }
    this.onGoodsDeliveryDateChange()
  }

  selectOptions = {
    bgList: BG_LIST,
    businessModels: BUSINESS_MODEL_LIST,
    oms: [],
    currencies: CURRENCIES,
    fieldStatusList: FIELD_STATUS_LIST,
    paymentMethodList: PAYMENT_METHOD_LIST,
  }

  get cooInfo(): FormGroup {
    return this.formValues.get('cooInfo') as FormGroup
  }

  get bmcList() {
    return this.spService.bmcList.filter((bmc) => bmc.bg === 'CC')
  }

  get orderInfos(): FormArray {
    return this.formValues.get('orderInfos') as FormArray
  }

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    public spService: SpecialApprovalService,
    private http: HttpService,
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
    this.orderInfos.controls.forEach((orderInfo: FormGroup) => orderInfo.disable())
    this.formValues.disable()
  }

  checkImportOrderData(orderInfos) {
    let isValid = true
    let dealerName
    let philipsName
    let businessModel
    for(let orderInfo of orderInfos) {
      if (orderInfo.dealerName) {
        if (dealerName && orderInfo.dealerName !== dealerName) {
          isValid = false
          this.message.remove(loadingId)
          this.message.error('导入失败, 导入的数据需为同一经销商!')
          break
        } else {
          dealerName = orderInfo.dealerName
        }
      }

      if (orderInfo.philipsName) {
        if (philipsName && orderInfo.philipsName !== philipsName) {
          isValid = false
          this.message.remove(loadingId)
          this.message.error('导入失败, 导入的数据需为同一飞利浦实体!')
          break
        } else {
          philipsName = orderInfo.philipsName
        }
      }

      if (orderInfo.businessModel) {
        if (businessModel && orderInfo.businessModel !== businessModel) {
          isValid = false
          this.message.remove(loadingId)
          this.message.error('导入失败, 导入的数据需为同一业务模式!')
          break
        } else {
          businessModel = orderInfo.businessModel
        }
      }
    }
    return isValid
  }

  onGoodsDeliveryDateChange() {
    const orderInfos = this.orderInfos.getRawValue()
    const goodsDeliveryDates = orderInfos
      .map(({ goodsDeliveryDate }) => goodsDeliveryDate)
      .filter((goodsDeliveryDate) => goodsDeliveryDate)
      .sort()
    let threeMonthsAfterArrival
    const maxDeliveryDate = goodsDeliveryDates[goodsDeliveryDates.length - 1]
    if (maxDeliveryDate) {
      const targetDate = moment().subtract(3, 'months').format('YYYY-MM-DD')
      if (targetDate > maxDeliveryDate) {
        threeMonthsAfterArrival = '1'
      } else {
        threeMonthsAfterArrival = '0'
      }
    } else {
      threeMonthsAfterArrival = null
    }
    this.cooInfo.patchValue({ threeMonthsAfterArrival })
  }

  resetOrderInfos() {
    while(this.orderInfos.length !== 0) {
      this.orderInfos.removeAt(0)
    }
  }

  onImportOrderInfo = (file) => {
    loadingId = this.message.loading('正在导入, 请稍候...', { nzDuration: 0 }).messageId
    this.resetOrderInfos()
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const workbook = read(e.target.result, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const results = utils.sheet_to_json(worksheet);
      const orderInfoFields = [
        'bmc', 'bg', 'cycleGroup', 'bigArea', 'businessModel',
        'dealerName', 'philipsName', 'sapOrderNo',
        'currency', 'om', 'contractNo', 'shipToName'
      ]
         
      const orderInfos = results.map((order, index) => {
        const orderInfo = Object.keys(order).reduce((calc, cur) => {
          const key = excelKeyMap[cur.trim()]
          const value = order[cur]
          switch(key) {
            case 'cipPort':
              calc[key] = value === '是' ? '1' : (value === '否' ? '0' : null)
              break
            default:
              calc[key] = value
          }
          return calc
        }, {}) as any
        if (orderInfo.businessModel) {
          const model = BUSINESS_MODEL_LIST.find(({ label }) => label === orderInfo.businessModel)
          orderInfo.businessModel = model.value
        }
        orderInfo.isOrder = false
        if (index === 0) {
          orderInfo.isOrder = true
        } else {
          for(let fieldName of orderInfoFields) {
            if (orderInfo[fieldName] !== undefined) {
              orderInfo.isOrder = true
              break
            }
          }
        }
        return orderInfo
      })
      const isValidData = this.checkImportOrderData(orderInfos)
      if (isValidData) {
        let orderInfoIndex = 0
        orderInfos.forEach((orderInfo) => {
          if (orderInfo.isOrder) {
            this.orderInfos.push(this.createOrder())
          } else {
            this.orderInfos.push(this.createProduct())
          }
          this.orderInfos.at(orderInfoIndex).patchValue(orderInfo)
          if (orderInfo.businessModel) {
            this.onBusinessModelChange(orderInfo.businessModel, orderInfoIndex)
          }
          this.checkDealerName(this.orderInfos.at(orderInfoIndex) as FormGroup)
          orderInfoIndex++
        })
        this.message.remove(loadingId)
        this.message.success('导入成功')
        this.onGoodsDeliveryDateChange()
      }
    };
    reader.readAsArrayBuffer(file);
    return false;
  }

  checkDealerName(orderInfo: FormGroup) {
    const dealerName = orderInfo.get('dealerName')
    if (dealerName) {
      const resetDealer = () => {
        orderInfo.patchValue({ dealerName: null, dealerCode: null })
      }
      this.http.post(`/act/preparation/getDealersOnlyWithRegFlag`, { dealerName: dealerName.value })
      .subscribe(({ code, data }) => {
        if (code === '0000') {
          const { rows } = data
          if (rows.length === 1) {
            const { dealerName, dealerCode } = rows[0]
            orderInfo.patchValue({ dealerName, dealerCode })
          } else {
            resetDealer()
          }
        } else {
          resetDealer()
        }
      }, () => resetDealer())
    }
  }

  isCipPort() {
    const orderInfos = this.orderInfos.getRawValue()
    for(let orderInfo of orderInfos) {
      const { cipPort } = orderInfo
      if (cipPort === '1') {
        return true
      }
    }
    return false
  }

  // node4: 申请人补充信息-经销商已盖章的COO授权函
  // node6: 申请人反馈-双签的COO授权函
  setFormValidators({ nodeCode, nodeInfoList, processStatus }) {
    const cooInfoRequiredFields = []
    const cooInfoEnabledFields = []

    const isCipPort = this.isCipPort()
    if (isCipPort) {
      this.showAirTransportNoDealer = true
    }

    switch(processStatus) {
      case PROCESS_STATUS.COMPLETED:
        this.showCooFile = true
        this.showCooLetter = true
        break
      case PROCESS_STATUS.START:
        if (nodeCode > 'node3') {
          this.showCooFile = true
        }
        if(nodeCode > 'node5') {
          this.showCooLetter = true
        }
        if (this.fromTask) {
          switch (nodeCode) {
            case 'node4': // 申请人补充信息
              // cooInfo
              cooInfoEnabledFields.push('applySignedDate', 'cooConfirmationLetterDraft', 'cooConfirmationLetterDealer')
              cooInfoRequiredFields.push('applySignedDate', 'cooConfirmationLetterDraft', 'cooConfirmationLetterDealer')
              if (isCipPort) {
                cooInfoEnabledFields.push('airTransportNoDealer')
                cooInfoRequiredFields.push('airTransportNoDealer')
              }
              break
            case 'node6': // 申请人反馈
              // cooInfo
              cooInfoEnabledFields.push('cooConfirmationLetterSign')
              // cooInfoRequiredFields.push('cooConfirmationLetterSign')
              break
          }
        }
        break
    }
    cooInfoRequiredFields.forEach((fieldName) => this.cooInfo.get(fieldName).setValidators(Validators.required))
    cooInfoEnabledFields.forEach((fieldName) => this.cooInfo.get(fieldName).enable())
  }

  public validate() {
    // orderInfos
    const orderInfos = this.orderInfos
    orderInfos.controls.forEach((orderInfo: FormGroup) => {
      for(const i in orderInfo.controls) {
        if ((i === 'dealerName' && !orderInfo.controls[i].value) || i !== 'dealerName') {
          orderInfo.controls[i].markAsDirty()
          orderInfo.controls[i].updateValueAndValidity()
        }
      }
    })
    const isOrderInfosValid = orderInfos.disabled || orderInfos.valid

    // cooInfo
    const cooInfo = this.cooInfo
    for(const i in cooInfo.controls) {
      cooInfo.controls[i].markAsDirty()
      cooInfo.controls[i].updateValueAndValidity()
    }
    const isCooInfoValid = cooInfo.disabled || cooInfo.valid
    return isOrderInfosValid && isCooInfoValid
  }

  public getData() {
    const orderInfosValue = this.orderInfos.getRawValue()
    let products = []
    let orderInfos = []
    let activeOrder = null
    orderInfosValue.forEach((orderInfo) => {
      const {
        isOrder,
        productId,
        // order info
        bmc, bg, cycleGroup, bigArea, businessModel, dealerName, dealerCode,
        philipsName, sapOrderNo, currency, om, contractNo, purchaseOrderNo, shipToName,
        // product info
        productType, quantity, equipmentSn, orderDate, productionDate,
        goodsDeliveryDate, guaranteeMonth, cipPort, airTransportNo, addressType,
        deliveryAddress, deliveryAddressEn, customsClearancePort, customsClearancePortEn,
      } = orderInfo
      orderInfo.purchaseOrderNo = purchaseOrderNo ? [{ fileId: purchaseOrderNo }] : []
      const productInfo = {
        id: productId,
        productType, quantity, equipmentSn, orderDate, productionDate,
        goodsDeliveryDate, guaranteeMonth, cipPort, 
        airTransportNo: airTransportNo ? [{ fileId: airTransportNo }] : [], 
        addressType, deliveryAddress, deliveryAddressEn, customsClearancePort, customsClearancePortEn,
      }
      delete orderInfo.isOrder
      if (isOrder) {
        if (activeOrder) {
          activeOrder.products = products
          orderInfos.push(activeOrder)
        }
        products = [productInfo]
        activeOrder = orderInfo
      } else {
        products.push(productInfo)
      }
    })
    if (activeOrder) {
      activeOrder.products = products
      orderInfos.push(activeOrder)
    }
    const cooInfo = {
      ...this.originCooInfo,
      ...this.cooInfo.getRawValue(),
    }
    console.log({
      cooInfo,
      orderInfos
    });
    
    return {
      cooInfo,
      orderInfos
    }
  }

  public initData(data) {
    const { orderInfos, cooInfo } = data
    this.originOrderInfos = orderInfos
    this.originCooInfo = cooInfo
    this.cooInfo.patchValue(cooInfo)
    this.initOrderInfos(orderInfos)
    if (!this.editable) {
      this.disableForm()
    }
    this.setFormValidators(data)
  }

  addFileListItem(fileItem) {
    if (fileItem && !this.fileIdSet.has(fileItem.fileId)) {
      const { fileId, name } = fileItem
      const newFile = { fileId, name, status: 'success' }
      this.fileList = [...this.fileList, newFile]
      this.fileIdSet.add(fileId)
    }
  }

  initOrderInfos(orderInfos) {
    let index = 0
    orderInfos.forEach((orderInfo) => {
      const { products } = orderInfo
      delete orderInfo.products
      // 初始化fileList
      const purchaseOrderNo = orderInfo.purchaseOrderNo ? orderInfo.purchaseOrderNo[0] : null
      this.addFileListItem(purchaseOrderNo)
      this.orderInfos.push(this.createOrder())
      if (orderInfo.businessModel) {
        this.onBusinessModelChange(orderInfo.businessModel, index)
      }
      this.orderInfos.at(index).patchValue({ 
        ...orderInfo,
        purchaseOrderNo: purchaseOrderNo ? purchaseOrderNo.fileId : null,
      })
      index++
      for(let i = 0; i < products.length; i++) {
        const airTransportNo = products[i].airTransportNo ? products[i].airTransportNo[0] : null
        this.addFileListItem(airTransportNo)
        const productValue = {
          ...products[i],
          airTransportNo: airTransportNo ? airTransportNo.fileId : null,
          productId: products[i].id,
        }
        delete productValue.id
        if (i === 0) {
          this.orderInfos.at(index - 1).patchValue(productValue)
        } else {
          this.orderInfos.push(this.createProduct())
          this.orderInfos.at(index).patchValue(productValue)
          index++
        }
      }
    })

    console.log('fileList', this.fileList);
    
  }

  onCycleGroupChange(index) {
    const orderInfo = this.orderInfos.at(index)
    orderInfo.patchValue({ bigArea: null })
  }

  getBigAreas(index) {
    const orderInfo = this.orderInfos.at(index)
    const cycleGroup = orderInfo.get('cycleGroup').value
    const cycleGroupBigAreaMap = this.spService.cycleGroupBigAreaMap
    if (cycleGroup && cycleGroupBigAreaMap[cycleGroup]) {
      return cycleGroupBigAreaMap[cycleGroup]
    } else {
      return []
    }
  }

  showDealerField(index) {
    const orderInfo = this.orderInfos.at(index)
    return orderInfo.get('businessModel').value === BUSINESS_MODEL.DISTRIBUTOR_DEAL
  }

  onSelectDealer(dealer: Dealer) {
    const { dealerCode, dealerName } = dealer
    const orderInfo = this.orderInfos.at(this.activeOrderIndex)
    orderInfo.patchValue({
      dealerCode,
      dealerName,
    })
  }

  onClearDealer(orderInfo: FormGroup) {
    orderInfo.patchValue({
      dealerCode: null,
      dealerName: null,
    })
  }

  onShowSelectDealerModal(index) {
    this.activeOrderIndex = index
    this.selectDealer.showModal()
  }

  onBusinessModelChange(businessModel, index) {
    const orderInfo = this.orderInfos.at(index) as FormGroup
    orderInfo.patchValue({
      dealerName: null,
      dealerCode: null,
    })
    if (businessModel === BUSINESS_MODEL.DISTRIBUTOR_DEAL) {
      orderInfo.get('dealerName').setValidators(Validators.required)
      orderInfo.get('dealerCode').setValidators(Validators.required)
    } else {
      orderInfo.get('dealerName').clearValidators()
      orderInfo.get('dealerCode').clearValidators()
    }
  }

  // 初始化OM列表
  async initOMUsers() {
    const users = await this.spService.getOMUsers()
    this.selectOptions.oms = users.map(({ name, email }) => ({ label: name, value: email }))
  }

  onClearFileList() {
    this.fileList = []
  }

  onDeleteFile(targetFile) {
    this.fileList = this.fileList.filter((file) => targetFile !== file)
  }

  onUploadFile = (item: UploadXHRArgs) => {
    const formData = new FormData()
    const file = item.file as any
    formData.append('file', file)
    formData.append('fileType', getType(file))
    formData.append('filename', file.name)
    const newFile = { name: file.name, status: 'uploading', fileId: null }
    this.fileList = [...this.fileList, newFile]

    return this.spService.uploadFile(formData).subscribe(
      (response) => {
        const { data, code } = response
        if ('0000' === code) {
          newFile.status = 'success'
          newFile.fileId = data
          item.onSuccess({ fileId: data }, file, response)
        } else {
          item.onError({}, file)
        }
      },
      err => {
        item.onError!(err, item.file!)
      }
    )
  }

  onDownloadFile(orderInfo: FormGroup) {
    const { purchaseOrderNo } = orderInfo.getRawValue()
    const file = this.fileList.find(({ fileId }) => fileId === purchaseOrderNo)
    if (file) {
      const id = this.message.loading('正在下载..', { nzDuration: 0 }).messageId
      const { name, fileId } = file
      let uri = `/act/system/download/${fileId}`
      this.http.get(uri, {
        responseType: 'blob'
      }).subscribe(data => {
        saveAs(data, name)
        this.message.remove(id)
      })
    }
  }

  showTemplate() {
    const philipsNameMap = {
      '飞利浦电子香港有限公司': 'Philips Electronics Hong Kong Limited',
      '飞利浦（中国）投资有限公司': 'Philips (China) Investment Co.,Ltd .'
    }

    const orderInfos = this.orderInfos.getRawValue()
    const { applySignedDate } = this.cooInfo.getRawValue()
    const contractNos = []
    const sapOrderNos = []
    const productionDates = []

    const applySignedDateUpdate = applySignedDate ? moment(applySignedDate).add(1, 'years').subtract(1, 'days') : null
    const params = {
      templateCode: 'SpAcceptance',
      contractNo: null,
      sapOrderNo: null,
      applySignedDate,
      applySignedDateUpdate: applySignedDateUpdate ? applySignedDateUpdate.format('YYYY-MM-DD') : null,
      dealerCode: null,
      dealerName: null,
      applySignedDateYear: applySignedDateUpdate ? applySignedDateUpdate.format('YYYY') : null,
      applySignedDateMonth: applySignedDateUpdate ? applySignedDateUpdate.format('MM') : null,
      applySignedDateDay: applySignedDateUpdate ? applySignedDateUpdate.format('DD') : null,
      productionDate: null,
      philipsName: null,
      philipsNameEn: null,
      saleEmail: null,
      tableParamsList: null,
    }
    let activeContractNo
    let activeSapOrderNo

    orderInfos.forEach(({ 
      contractNo, sapOrderNo, philipsName, productionDate, dealerName, dealerCode,
      quantity, goodsDeliveryDate, deliveryAddress, productType, equipmentSn
    }) => {
      if (contractNo) {
        contractNos.push(contractNo)
        activeContractNo = contractNo
      }
      if (sapOrderNo) {
        sapOrderNos.push(sapOrderNo)
        activeSapOrderNo = sapOrderNo
      }
      if (productionDate) {
        productionDates.push(productionDate)
      }
      if (philipsName) {
        params.philipsName = philipsName
        params.philipsNameEn = philipsNameMap[philipsName]
      }
      if(dealerName && dealerCode) {
        params.dealerName = dealerName
        params.dealerCode = dealerCode
      }
      const productInfo = {
        contractNo: contractNo || activeContractNo,
        sapOrderNo: sapOrderNo || activeSapOrderNo,
        quantity: String(quantity || ''),
        goodsDeliveryDate,
        deliveryAddress,
        equipmentDescription: productType,
        equipmentSn
      }
      params.tableParamsList = params.tableParamsList || []
      params.tableParamsList.push(productInfo)
    })
    if (contractNos.length > 0) {
      params.contractNo = contractNos.join('/')
    }
    if (sapOrderNos.length > 0) {
      params.sapOrderNo = sapOrderNos.join('/')
    }
    // 计算最大出厂日期
    if (productionDates.length > 0) {
      const sortedProductionDates = productionDates.sort()
      const maxProductionDate = sortedProductionDates[sortedProductionDates.length - 1]
      params.productionDate = moment(maxProductionDate).add(15, 'months').subtract(1, 'days').format('YYYY-MM-DD')
    }
    // 获取NationSalesLeader的Email
    const approver = this.approveHistory.find(({ taskName }) => taskName === 'node2')
    if (approver) {
      params.saleEmail = approver.owner
    }
    params.tableParamsList = JSON.stringify(params.tableParamsList)
    this.appPdfPreview.show(params)
  }
}