import { Component, OnInit, Input, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms'

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
  selector: 'special-approval-order-replacement-info',
  templateUrl: './order-replacement.component.html',
  styleUrls: ['./order-replacement.component.scss']
})
export class OrderReplacementComponent implements OnInit, OnChanges {
  constructor(public spService: SpecialApprovalService,) {}


  @ViewChild('selectReference') selectReference: SelectReferenceComponent

  @Input() formValues: FormGroup
  @Input() editable = true
  @Input() baseInfo: FormGroup
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


  onCycleGroupChange() {
    this.formValues.patchValue({ bigArea: null })
  }

  //false 所有 true 不显示金额
  onShowReferenceModal() {
    this.selectReference.showModal(false,true);
  }

  onSelectReference(reference: Reference) {
    const {
      referenceId,
      cosMainId,
      orderType,
      projectName,
      sap,
      team,
      region,
      bmc,

    } = reference;
    this.formValues.patchValue({
      orderType,
      referenceId,
      cosMainId,
      projectName,
      sapOrderNo: sap,
      cycleGroup: team,
      bigArea: region,
      bmc,
    });
  }

  ngOnInit(): void {
    this.initOMUsers()
  }

  //监测 @Input值的变化
  ngOnChanges(changes: SimpleChanges): void {
    //是否是反馈信息节点
    if (changes.showFeedbackTab && changes.showFeedbackTab.currentValue) {
      let clearedFields = ['newSapOrderNo', 'newSapCreateTime'];
      clearedFields.forEach((fieldName) => this.formValues.controls[fieldName].enable());
      //必填暂时取消
      // clearedFields.forEach((fieldName) => this.formValues.controls[fieldName].setValidators([Validators.required]));
    }
  }

   // 初始化OM列表
  async initOMUsers() {
    const users = await this.spService.getOMUsers()
    this.selectOptions.oms = users.map(({ name, email }) => ({ label: name, value: email }))
  }


}
