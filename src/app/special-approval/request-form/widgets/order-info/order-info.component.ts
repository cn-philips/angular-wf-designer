import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms'

import { Hospital, SelectHospitalComponent, } from '../select-hospital/select-hospital.component'
import { Dealer, SelectDealerComponent } from '../select-dealer/select-dealer.component'
import { Reference, SelectReferenceComponent } from '../select-reference/select-reference.component'
import { SpecialApprovalService } from '../../../special-approval.service'
import { 
  APPLY_TYPE,
  BUSINESS_MODEL,
  BG_LIST,
  US_PRODUCT_LIST,
  ORDER_TYPES,
  BUSINESS_MODEL_LIST,
  BIG_SMALL_AREA_LIST,
  CURRENCIES,
} from '../../../special-approval.constants'

@Component({
  selector: 'special-approval-order-info',
  templateUrl: './order-info.component.html',
  styleUrls: ['./order-info.component.scss']
})
export class OrderInfoComponent implements OnInit {

  showDealerArea: boolean = false

  constructor(private spService: SpecialApprovalService) { }


  @ViewChild('selectHospital') selectHospital: SelectHospitalComponent

  @ViewChild('selectDealer') selectDealer: SelectDealerComponent

  @ViewChild('selectReference') selectReference: SelectReferenceComponent

  @Input() formValues: FormGroup
  @Input() editable = true
  @Input() applyType: string
  @Input() applyItem: string

  APPLY_TYPE = APPLY_TYPE

  @Input() bmcs = []

  selectOptions = {
    orderTypes: ORDER_TYPES,
    bgList: BG_LIST,
    usProductList: US_PRODUCT_LIST,
    bigAreas: BIG_SMALL_AREA_LIST,
    smallAreas: [],
    businessModels: BUSINESS_MODEL_LIST,
    currencies: CURRENCIES,
    oms: []
  }

  onBusinessModelChange(businessModel) {
    if (businessModel === BUSINESS_MODEL.DISTRIBUTOR_DEAL) {
      this.showDealerArea = true
    } else {
      this.showDealerArea = false
    }
  }

  onProductTypeChange(value) {
    console.log('产品型号');
    console.log(value);
  }

  onCalcProjectName() {
    const { hospitalName, productType, bg } = this.formValues.getRawValue()
    if (bg === 'PD&IGT') {
      return
    }
    const res = []
    if (hospitalName) {
      res.push(hospitalName)
    }
    if (Array.isArray(productType)) {
      if (productType.length > 0) {
        res.push(productType.join(','))
      }
    } else if (productType) {
      res.push(productType)
    }
    this.formValues.patchValue({
      projectName: res.join('-')
    })
  }

  onBigAreaChange(bigArea) {
    const area = this.selectOptions.bigAreas.find(({ value }) => value === bigArea) 
    this.selectOptions.smallAreas = area ? area.children : []
    this.formValues.patchValue({ smallArea: null })
  }

  onShowSelectHospitalModal() {
    this.selectHospital.showModal()
  }

  onSelectHospital(hospital: Hospital) {
    const { no, customerName } = hospital
    this.formValues.patchValue({
      hospitalNo: no,
      hospitalName: customerName,
    })
    this.onCalcProjectName()
  }

  onClearHospital() {
    this.formValues.patchValue({
      hospitalNo: null,
      hospitalName: null,
    })
  }

  onShowSelectDealerModal() {
    this.selectDealer.showModal()
  }

  onSelectDealer(dealer: Dealer) {
    const { dealerCode, dealerName } = dealer
    this.formValues.patchValue({
      dealerCode: dealerCode,
      dealerName: dealerName,
    })
  }

  onClearDealer() {
    this.formValues.patchValue({
      dealerCode: null,
      dealerName: null,
    })
  }

  onShowReferenceModal() {
    this.selectReference.showModal()
  }

  onSelectReference(reference: Reference) {
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
    } = reference
    if (distributor) {
      this.showDealerArea = true
    }
    this.formValues.patchValue({
      orderType,
      referenceId,
      projectName,
      productType: productModel,
      sapOrderNo: sap,
      bigArea: team,
      smallArea: region,
      bmc,
      businessModel: businessModel ? businessModel.toLowerCase() : null,
      dealerName: distributor,
      dealerCode,
      hospitalName: endUser,
      hospitalNo: endUserId,
      orderAmount: contractPrice,
      currency: invoiceInformation,
    })
  }

  ngOnInit(): void {
    this.initOMUsers()
  }

   // 初始化OM列表
  async initOMUsers() {
    const users = await this.spService.getOMUsers()
    this.selectOptions.oms = users.map(({ name, email }) => ({ label: name, value: email }))
  }
}
