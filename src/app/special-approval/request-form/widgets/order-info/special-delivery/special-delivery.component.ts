import { Component, OnInit, Input, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { Hospital, SelectHospitalComponent, } from '../../select-hospital/select-hospital.component'
import { Dealer, SelectDealerComponent } from '../../select-dealer/select-dealer.component'
import { Reference, SelectReferenceComponent } from '../../select-reference/select-reference.component'
import { SpecialApprovalService } from '../../../../special-approval.service'
import {
  APPLY_TYPE,
  BUSINESS_MODEL,
  BG_LIST,
  ORDER_TYPES,
  BUSINESS_MODEL_LIST,
  CURRENCIES,
} from '../../../../special-approval.constants'

@Component({
  selector: "special-approval-specialdelivery-order-info",
  templateUrl: "./special-delivery.component.html",
  styleUrls: ["./special-delivery.component.scss"],
})
export class SpecialDeliveryOrderInfoComponent implements OnInit, OnChanges {
  constructor(public spService: SpecialApprovalService) { }


  @ViewChild('selectHospital') selectHospital: SelectHospitalComponent

  @ViewChild('selectDealer') selectDealer: SelectDealerComponent

  @ViewChild('selectReference') selectReference: SelectReferenceComponent
  @Input() basicInfo: FormGroup;
  @Input() formValues: FormGroup;
  @Input() editable = true;
  @Input() applyItem: string;
  @Input() showFeedbackTab = false;

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
    } = reference
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
      products: [{
        productType: productModel,
        wbs: "",
        itemNo: "",
        quantity: "",
      }],
    })
  }

  ngOnInit(): void {
    this.initOMUsers()
    this.editProjectName()
    if (this.editable) {
      this.formValues.get('hospitalName').valueChanges.subscribe(() => {
        this.onCalcProjectName()
      })

      this.formValues.get('productType').valueChanges.subscribe(() => {
        this.onCalcProjectName()
      })
    }
  }

  // 初始化OM列表
  async initOMUsers() {
    const users = await this.spService.getOMUsers()
    this.selectOptions.oms = users.map(({ name, email }) => ({ label: name, value: email }))
  }
  //当 bg !=== PD&IGT 特定条件下:项目名称不可编辑
  async editProjectName(){
    if (this.formValues.get('bg').value !== 'PD&IGT'){
      this.formValues.get('projectName').disable();
    }
  }

   //监测 @Input值的变化
   ngOnChanges(changes: SimpleChanges): void {
    //是否是反馈信息节点
    if (changes.showFeedbackTab && changes.showFeedbackTab.currentValue) {
      let clearedFields = [];
      if(this.applyItem === 'sp_delivery_apply_item_1') {
        clearedFields = ['actualPaymentDate', 'actualSaleDate'];
      } else {
        clearedFields = ['actualSitePlaceDate', 'actualSaleDate'];
      }
      clearedFields.forEach((fieldName) => this.formValues.controls[fieldName].enable());
      clearedFields.forEach((fieldName) => this.formValues.controls[fieldName].setValidators([Validators.required]));
    }
  }

}
