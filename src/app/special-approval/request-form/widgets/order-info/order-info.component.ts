import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms'

import { Hospital, SelectHospitalComponent, } from '../select-hospital/select-hospital.component'
import { Dealer, SelectDealerComponent } from '../select-dealer/select-dealer.component'
import { Reference, SelectReferenceComponent } from '../select-reference/select-reference.component'
import { SpecialApprovalService } from '../../../special-approval.service'
import { APPLY_TYPE } from '../../request-form.component'
import { BUSINESS_MODEL } from '../../../special-approval.constants'

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
  @Input() applyType: APPLY_TYPE
  @Input() applyItem: string

  APPLY_TYPE = APPLY_TYPE

  @Input() bmcs = []

  selectOptions = {
    orderTypes: [
      { label: 'OIT', value: 'OIT' },
      { label: 'Pre-Book', value: '	Pre-Book' }
    ],
    bgs: [
      { label: 'PD&IGT(excl. US)', value: 'PD&IGT' },
      { label: 'US', value: 'US' },
      { label: 'CC', value: 'CC' }
    ],
    usProductList: [
      { label: 'Affiniti30', value: 'Affiniti30' },
      { label: 'Affiniti50', value: 'Affiniti50' },
      { label: 'Affiniti70', value: 'Affiniti70' },
      { label: 'AI', value: 'AI' },
      { label: 'ClearVue350', value: 'ClearVue350' },
      { label: 'ClearVue550', value: 'ClearVue550' },
      { label: 'ClearVue650', value: 'ClearVue650' },
      { label: 'ClearVue850', value: 'ClearVue850' },
      { label: 'CX50', value: 'CX50' },
      { label: 'EPIQ CVx', value: 'EPIQ CVx' },
      { label: 'EPIQ Elite', value: 'EPIQ Elite' },
      { label: 'EPIQ EliteW', value: 'EPIQ EliteW' },
      { label: 'EPIQ5', value: 'EPIQ5' },
      { label: 'EPIQ5C', value: 'EPIQ5C' },
      { label: 'EPIQ7', value: 'EPIQ7' },
      { label: 'EPIQ7C', value: 'EPIQ7C' },
      { label: 'HD8', value: 'HD8' },
      { label: 'Innosight', value: 'Innosight' },
      { label: 'ISCV', value: 'ISCV' },
      { label: 'Lumify', value: 'Lumify' },
      { label: 'Lumify报告', value: 'Lumify报告' },
      { label: 'Off-Cart Qlab', value: 'Off-Cart Qlab' },
      { label: 'PS', value: 'PS' },
      { label: 'SPARQ', value: 'SPARQ' },
      { label: 'Tomtec', value: 'Tomtec' },
      { label: '远程', value: '远程' },
    ],
    bigAreas: [
      { label: 'West', value: 'West', children: [{ label: 'West', value: 'West' }] },
      { label: 'South', value: 'South', children: [{ label: 'South', value: 'South' }] },
      { label: 'East', value: 'East', children: [{ label: 'East', value: 'East' }] },
      { label: 'North2', value: 'North2', children: [{ label: 'North2', value: 'North2' }] },
      { label: 'North1', value: 'North1', children: [{ label: 'North1', value: 'North1' }] },
      { label: 'Solution', value: 'Solution', children: [
          { label: 'East', value: 'East' },
          { label: 'North', value: 'North' },
          { label: 'South', value: 'South' },
          { label: 'West', value: 'West' },
        ]
      },
      {
        label: 'RadOnc', value: 'RadOnc', children: [
          { label: 'East', value: 'East' },
          { label: 'North', value: 'North' },
          { label: 'South', value: 'South' },
          { label: 'West', value: 'West' },
        ]
      },
      {
        label: 'Private', value: 'Private', children: [
          { label: 'East', value: 'East' },
          { label: 'North', value: 'North' },
          { label: 'South', value: 'South' },
          { label: 'West', value: 'West' },
        ]
      },
      {
        label: 'Primary Business', value: 'Primary Business', children: [
          { label: 'China', value: 'China' },
          { label: 'East', value: 'East' },
          { label: 'North', value: 'North' },
          { label: 'South', value: 'South' },
          { label: 'West', value: 'West' },
        ]
      },
      { label: 'GBA', value: 'GBA', children: [{ label: 'GBA', value: 'GBA' }] },
      { label: 'Fighter Team', value: 'Fighter Team', children: [{ label: 'China', value: 'China' }] },
      {
        label: 'DXR', value: 'DXR', children: [
          { label: 'China', value: 'China' },
          { label: 'East', value: 'East' },
          { label: 'North', value: 'North' },
          { label: 'South', value: 'South' },
          { label: 'West', value: 'West' },
        ]
      },
      {
        label: 'CTVAD', value: 'CTVAD', children: [
          { label: 'China', value: 'China' },
          { label: 'East', value: 'East' },
          { label: 'North', value: 'North' },
          { label: 'South', value: 'South' },
          { label: 'West', value: 'West' },
        ]
      },
      { label: 'BV', value: 'BV', children: [{ label: 'China', value: 'China' }] },
      {
        label: 'US', value: 'US', children: [
          { label: 'East', value: 'East' },
          { label: 'North', value: 'North' },
          { label: 'South', value: 'South' },
          { label: 'West', value: 'West' },
          { label: 'US-Private', value: 'US-Private' },
          { label: 'US-VAD', value: 'US-VAD' },
        ]
      },
      {
        label: 'HPM', value: 'HPM', children: [
          { label: 'North', value: 'North' },
          { label: 'West', value: 'West' },
          { label: 'East2', value: 'East2' },
          { label: 'East1', value: 'East1' },
          { label: 'South', value: 'South' },
        ]
      },
      { label: 'VAD', value: 'VAD', children: [{ label: 'GCN', value: 'GCN' }] },
      { label: 'DFM', value: 'DFM', children: [{ label: 'DFM', value: 'DFM' }] },
      { label: 'DECG', value: 'DECG', children: [{ label: 'DECG', value: 'DECG' }] },
      { label: 'AED', value: 'AED', children: [{ label: 'AED', value: 'AED' }] },
    ],
    smallAreas: [],
    businessModels: [
      { label: 'Direct Deal', value: BUSINESS_MODEL.DIRECT_DEAL },
      { label: 'Distributor Deal', value: BUSINESS_MODEL.DISTRIBUTOR_DEAL }
    ],
    currencies: [
      { label: 'CNY', value: 'CNY' },
      { label: 'USD', value: 'USD' }
    ],
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
