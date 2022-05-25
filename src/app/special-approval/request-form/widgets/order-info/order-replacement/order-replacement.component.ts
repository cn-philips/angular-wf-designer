import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms'

import { Hospital, SelectHospitalComponent, } from '../../select-hospital/select-hospital.component'
import { Dealer, SelectDealerComponent } from '../../select-dealer/select-dealer.component'
import { Reference, SelectReferenceComponent } from '../../select-reference/select-reference.component'
import { SpecialApprovalService } from '../../../../special-approval.service'
import { getType } from '../../../../../../assets/js/tools'

import {
  APPLY_TYPE,
  BUSINESS_MODEL,
  BG_LIST,
  ORDER_TYPES,
  BUSINESS_MODEL_LIST,
  CURRENCIES,
} from '../../../../special-approval.constants'

interface CommonResponse {
  code: string;
  data: any;
  msg: string
}

@Component({
  selector: 'special-approval-order-replacement-info',
  templateUrl: './order-replacement.component.html',
  styleUrls: ['./order-replacement.component.scss']
})
export class OrderReplacementComponent implements OnInit {
  constructor(public spService: SpecialApprovalService,) {}


  @ViewChild('selectHospital') selectHospital: SelectHospitalComponent

  @ViewChild('selectDealer') selectDealer: SelectDealerComponent

  @ViewChild('selectReference') selectReference: SelectReferenceComponent

  @Input() formValues: FormGroup
  @Input() editable = true
  @Input() baseInfo: FormGroup

  cancelContractLink: any = [];

  APPLY_TYPE = APPLY_TYPE

  selectOptions = {
    orderTypes: ORDER_TYPES,
    bgList: BG_LIST,
    businessModels: BUSINESS_MODEL_LIST,
    currencies: CURRENCIES,
    oms: []
  }

  get bigAreas() {
    const cycleGroup = this.formValues.get('cycleGroup') as FormControl
    const cycleGroupBigAreaMap = this.spService.cycleGroupBigAreaMap
    if (cycleGroup && cycleGroupBigAreaMap[cycleGroup.value]) {
      return cycleGroupBigAreaMap[cycleGroup.value]
    } else {
      return []
    }
  }

  get bmcList() {
    const bg = this.formValues.get('bg') as FormControl
    return this.spService.bmcList.filter((bmc) => bmc.bg === bg.value)
  }

  get showDealerArea(): boolean {
    const businessModel = this.formValues.get('businessModel') as FormControl
    if (businessModel && businessModel.value === BUSINESS_MODEL.DISTRIBUTOR_DEAL) {
      return true
    } else {
      return false
    }
  }

  get orderInfoStatus(): FormGroup { return this.formValues.get('orderInfoStatus') as FormGroup }


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

    if (productType) {
      res.push(productType)
    }
    this.formValues.patchValue({
      projectName: res.join('-')
    })
  }

  onCycleGroupChange() {
    this.formValues.patchValue({ bigArea: null })
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
      logistician
    } = reference;
    this.formValues.patchValue({
      orderType,
      referenceId,
      projectName,
      productType: productModel,
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
    });
  }

  ngOnInit(): void {
    this.initOMUsers()
    if (this.editable) {
      this.formValues.get('hospitalName').valueChanges.subscribe(() => {
        this.onCalcProjectName()
      })

      this.formValues.get('productType').valueChanges.subscribe(() => {
        this.onCalcProjectName()
      })
    }

    console.log("cancelContractLink:",this.cancelContractLink);
    // console.log("editable",this.editable);
    // this.disableField();
  }

   // 初始化OM列表
  async initOMUsers() {
    const users = await this.spService.getOMUsers()
    this.selectOptions.oms = users.map(({ name, email }) => ({ label: name, value: email }))
  }

  disableField() {
    let disabledFieldsList = [
      "spApplyOrderId",
      "startProduction",
      "orderCancelAmountProduction",
      "shipped",
      "orderCancelAmountShipped",
      "thirdPartyProcurement",
      "orderCancelAmountPurchase",
      "seenSite",
      "orderCancelAmountSite",
      "advanceChargeStatus",
      "advanceChargeAmount",
      "orderActualAmount",
      "refundAmount",
      "remark",
      "attachment"
    ]
    disabledFieldsList.forEach(item => {
      this.orderInfoStatus.get(item).disable();
    })
  }



}
