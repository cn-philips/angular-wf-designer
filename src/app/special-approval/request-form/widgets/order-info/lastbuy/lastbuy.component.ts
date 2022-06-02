import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Hospital, SelectHospitalComponent} from '../../select-hospital/select-hospital.component';
import {environment} from '../../../../../../environments/environment';
import {SpecialApprovalService} from '../../../../special-approval.service';
import {NzMessageService, NzModalService, UploadFile, UploadXHRArgs} from 'ng-zorro-antd';
import {HttpService} from '../../../../../services';
import {BUSINESS_MODEL_LIST, CURRENCIES, ORDER_TYPES, BUSINESS_MODEL, BG_LIST} from '../../../../special-approval.constants';
import {read, utils} from 'xlsx';
import {Dealer, SelectDealerComponent} from '../../select-dealer/select-dealer.component';
import {getType} from '../../../../../../assets/js/tools';
import { saveAs } from 'file-saver';
import {Reference, SelectReferenceComponent} from '../../select-reference/select-reference.component';


interface CommonResponse {
  code: string;
  data: any;
  msg: string
}

@Component({
  selector: 'special-approval-lastbuy-info',
  templateUrl: './lastbuy.component.html',
  styleUrls: ['./lastbuy.component.scss']
})
export class LastbuyComponent implements OnInit {

  @Input() editable = true
  @Input() formValues: FormGroup;
  @Input() showFeedbackTab: boolean = false;

  BUSINESS_MODEL = BUSINESS_MODEL

  @ViewChild('selectHospital') selectHospital: SelectHospitalComponent

  @ViewChild('selectDealer') selectDealer: SelectDealerComponent

  @ViewChild('selectReference') selectReference: SelectReferenceComponent


  templateUrl = `${environment.base_href}/assets/template/Pre-Book Last Buy 特批生产发货Templete.xlsx`
  isExchange: boolean;
  activeOrder = null
  private upIndex: number;


  constructor(
    public spService: SpecialApprovalService,
    private message: NzMessageService,
    private http: HttpService,
    private modal: NzModalService,
  ) { }

  selectOptions = {
    orderTypes: ORDER_TYPES,
    businessModels: BUSINESS_MODEL_LIST,
    currencies: CURRENCIES,
    oms: [],
    wareHouse: [{label:'W/H', value: 'W/H'},
      {label:'FTZ', value: 'FTZ'},
      {label:'医院', value: '医院'},
      {label:'代理商仓库', value: '代理商仓库'},
      ]
  };

  get bmcList() {
    return this.spService.bmcList
  }

  get usProductList(){
    return this.spService.usProductList
  }

  ngOnInit() {
    if (this.formValues.value.length === 0) {
      this.createOrder()
    }
    this.initOMUsers()
  }

  async initOMUsers() {
    const users = await this.spService.getOMUsers()
    this.selectOptions.oms = users.map(({ name, email }) => ({ label: name, value: email }))
  }

  onCycleGroupChange(order) {
    order.bigArea = null
  }

  onClearDealer(order) {
    order.dealerName = null
    order.dealerCode = null
  }

  onShowSelectDealerModal(order) {
    this.activeOrder = order
    this.selectDealer.showModal()
  }

  onBusinessModelChange(order) {
    order.dealerName = null
    order.dealerCode = null
  }


  onBmcChange(order) {
    const bmc = this.spService.bmcList.find(({ value }) => value === order.bmc);
    if (bmc) {
      order.bg = bmc.bg;
    }
  }

  onShowSelectHospitalModal(order) {
    this.activeOrder = order
    this.selectHospital.showModal()
  }

  onSelectHospital(hospital: Hospital) {
    const { no, customerName } = hospital
    this.activeOrder.hospitalName = customerName
    this.activeOrder.hospitalNo = no
  }

  onSelectDealer(dealer: Dealer) {
    this.activeOrder.dealerError = false
    const { dealerCode, dealerName } = dealer
    this.activeOrder.dealerCode = dealerCode
    this.activeOrder.dealerName = dealerName
  }

  onClearHospital(order, isExchange = false) {
    if (isExchange) {
      order.exchangeableHospitalName = null
      order.exchangeableHospitalNo = null
    } else {
      order.hospitalName = null
      order.hospitalNo = null
    }
  }

  createOrder() {
    this.formValues.patchValue([
      ...this.formValues.value,
      {
        orderType: null,
        referenceId: null,
        subProductType: null,
        bmc: null,
        bg: null,
        cycleGroup: null,
        bigArea: null,
        businessModel: null,
        dealerCode: null,
        dealerName: null,
        hospitalNo: null,
        hospitalName: null,
        projectName: null,
        sapOrderNo: null,
        orderAmount: null,
        currency: null,
        om: null,
        stockingAgreementFile: [],
        stockingAgreementFileList: [],
        expectedPaymentDate: null,
        expectedSitePlaceDate: null,
        applyArrivalTime: null,
        expectedSaleDate: null,
        productType: null,
        quantity: null,
        actualOitDate: null,
        warehouseArrangement: null,
      }
    ])
  }

  deleteOrder(order) {
    const orders = this.formValues.value.filter(data => data !== order);
    this.formValues.patchValue(orders);
  }

  isTableValid() {
    let hasError = false
    this.formValues.value.forEach((order) => {
      const {
        orderType, referenceId, subProductType, bg, bmc, cycleGroup, bigArea, businessModel, dealerCode, dealerName,
        hospitalName, hospitalNo, projectName, sapOrderNo,  orderAmount, currency, om, stockingAgreementFileId, expectedPaymentDate,
        expectedSitePlaceDate, expectedSaleDate, productType, quantity
      } = order

      console.log(order)
      if (!(orderType && bmc &&
        businessModel && projectName && sapOrderNo &&
        orderAmount && currency && (dealerCode || hospitalNo)
      )) {
        hasError = true
      }

    })
    return !hasError
  }

  onProductChange(vals: [], order) {
    order.projectName = vals.join(';');
  }


  onUploadFile = (item: UploadXHRArgs) => {
    const formData = new FormData()
    const file = item.file as any
    formData.append('file', file)
    formData.append('fileType', getType(file))
    formData.append('filename', file.name)

    return this.spService.uploadFile(formData).subscribe(
      (response: CommonResponse) => {
        const { data, code } = response
        if ('0000' === code) {
          console.log( this.formValues.value)
          console.log( this.formValues.value[this.upIndex])
          if (!this.formValues.value[this.upIndex].stockingAgreementFile) {
            this.formValues.value[this.upIndex].stockingAgreementFile = []
          }
          this.formValues.value[this.upIndex].stockingAgreementFile.push({fileId: data})
          console.log( this.formValues.value[this.upIndex].stockingAgreementFile)

          item.onSuccess({ fileId: data }, file, response)
        } else {
          item.onError({}, file)
          console.log( this.formValues.value[this.upIndex].stockingAgreementFile)
        }
      },
      err => {
        item.onError!(err, item.file!)
      }
    )
  }

  uploadIndex(i: number) {
    this.upIndex = i
  }

  onSelectMultipleReference(references: Reference[]) {

    const data = references.map(reference => {
      const {
        referenceId,
        orderType,
        projectName,
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
        createUser,
        logistician,
        marketBundleQuantity
      } = reference

      const orderInfo = {
        orderType: orderType,
        referenceId: referenceId,
        subProductType: productModel,
        bmc: bmc,
        bg: this.spService.bmcList.find(({ value }) => value === bmc).bg,
        cycleGroup: team,
        bigArea: region,
        businessModel:  businessModel ? businessModel.toLowerCase() : null,
        dealerCode: dealerCode,
        dealerName: distributor,
        hospitalNo: endUserId,
        hospitalName: endUser,
        projectName: projectName,
        sapOrderNo: sap,
        orderAmount: contractPrice,
        currency: invoiceInformation,
        om: logistician,
        stockingAgreementFile: [],
        stockingAgreementFileList: [],
        expectedPaymentDate: null,
        expectedSitePlaceDate: null,
        applyArrivalTime: null,
        expectedSaleDate: null,
        productType: productModel,
        quantity: null,
        actualOitDate: null,
        warehouseArrangement: null,
      }
      return orderInfo
    })
    console.log(data)
    this.formValues.patchValue(data)

  }
  onShowReferenceModal(needCreateUser = false) {
    this.selectReference.showModal(needCreateUser)
  }
  onHideReferenceModal() {
    this.selectReference.onHideModal()
  }
}
