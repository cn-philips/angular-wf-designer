import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DictService } from '@core/services';

import { PROVINCES, BIDDING_TYPES, CUSTOMER_TYPES } from '@pages/bidding-v3/bidding-v3.constants'
import { SelectHospitalComponent } from '@shared/components';

@Component({
  selector: 'bidding-v3-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.scss']
})
export class BasicInfoComponent implements OnInit {

  @Input() applyDetail = {}
  @Input() disabled = false
  @Input() showReopenButton = false
  @Input() biddingForm: FormGroup
  @Output() showImportOpp = new EventEmitter()
  @Output() calcPaymentTerms = new EventEmitter()
  @Output() reopenForm = new EventEmitter()
  @Output() calcAuthRequired = new EventEmitter()
  @ViewChild('selectHospital') selectHospital: SelectHospitalComponent

  get basicInfo(): FormGroup {
    return this.biddingForm ? this.biddingForm.get('basicInfo') as FormGroup : null
  }

  get baseInfo(): FormGroup {
    return this.basicInfo ? this.basicInfo.get('baseInfo') as FormGroup : null
  }

  get finalUser(): FormGroup {
    return this.basicInfo ? this.basicInfo.get('finalUser') as FormGroup : null
  }

  get applicant(): FormGroup {
    return this.basicInfo ? this.basicInfo.get('applicant') as FormGroup : null
  }

  get dataSource(): string {
    return this.biddingForm ? this.biddingForm.get('dataSource').value : null
  }

  get hospitalSelectBtnDisabled(): boolean {
    if (!this.finalUser) {
      return true
    }
    const hospitalName = this.finalUser.get('hospitalName').value
    if (['', 'Stock', 'STOCK', 'stock', null].includes(hospitalName)) {
      return false
    }
    return true
  }

  get requestor(): string {
    if (!this.applicant) {
      return ''
    }
    const { applicant, biddingOwner } = this.applicant.getRawValue()
    return `${biddingOwner}(${applicant})`
  }

  get modalityList(): string[] {
    const { modality } = this.applicant.getRawValue()
    if (modality) {
      return [modality]
    } else {
      return ['PD&IGT']
    }
  }

  // 表单中的下拉选项
  selectOption = {
    biddingModel: [], // 招标授权模式
    businessModel: [], // 业务模式
    biddingType: BIDDING_TYPES, // 招标类型
    customerType: CUSTOMER_TYPES, // 客户类型
    customerProvince: PROVINCES, // 客户省份
    systemRegion: [], // 系统区域
  }

  constructor(private dictService: DictService) { }

  ngOnInit(): void {
    this.dictService.dictDatas(['AUTHORIZATION_MODE', 'BUSINESS_MODEL']).subscribe(([biddingModels, businessModels]) => {
      this.selectOption.biddingModel = biddingModels.map(({ label, code }) => ({ label, value: code }))
      const biddingModel = this.selectOption.biddingModel[0] && this.selectOption.biddingModel[0].value
      this.baseInfo.get('biddingModel').patchValue(biddingModel, {
        onlySelf: true
      })
      this.selectOption.businessModel = businessModels.map(({ label, code }) => ({ label, value: code }))
    })
    this.initSystemRegion()
  }

  handleModalityChange() {
    this.calcAuthRequired.emit()
    this.calcPaymentTerms.emit()
  }

  initSystemRegion() {
    const role = 'Sales Rep/Mgr'
    const regions = []
    const profiles = (JSON.parse(window.localStorage.getItem("profiles")) || []).filter(({ role: roleName }) => (role && role === roleName) || !role)
    const labelSet = new Set()
    profiles.forEach((region) => {
      const labelValue = [
        region.team,
        region.modality,
        region.cycleGroup,
        region.bigArea,
        region.smallArea,
      ]
        .filter((str) => str && str.trim())
        .join("-")
      if (!labelSet.has(labelValue)) {
        labelSet.add(labelValue)
        regions.push({ ...region, label: labelValue, value: labelValue })
      }
    })
    this.selectOption.systemRegion = regions;
    if (regions.length === 1) {
      const { team, modality, cycleGroup, bigArea, smallArea } = regions[0];
      this.applicant.patchValue({
        systemRegion: [team, modality, cycleGroup, bigArea, smallArea]
          .filter((str) => str && str.trim())
          .join("-"),
        team,
        modality,
        cycleGroup,
        bigArea,
        smallArea,
      })
      this.handleModalityChange()
    }
  }

  handleBiddingModelChange(biddingModel) {
    // __TODO__
    console.log('biddingModel change', biddingModel)
  }

  handleBiddingTypeChange(biddingType) {
    this.calcAuthRequired.emit()
    if (biddingType === '其他类型') {
      this.baseInfo.patchValue({
        biddingNumber: '其他类型'
      })
    }
  }

  handleSystemRegionChange(systemRegion) {
    if (!systemRegion) { return }
    const region = this.selectOption.systemRegion.find((region) => systemRegion === region.value)
    if (region) {
      const { team, modality, cycleGroup, bigArea, smallArea } = region
      this.applicant.patchValue({
        team,
        modality,
        cycleGroup,
        bigArea,
        smallArea,
      })
      this.handleModalityChange()
    }
  }

  showImportOppDialog() {
    this.showImportOpp.emit()
  }

  showSelectHospitalDialog() {
    this.selectHospital.show({}, true)
  }

  onSelectHospital({ customerName, customerType, no, category, province, groupName, city }) {
    this.finalUser.patchValue({
      hospitalName: customerName,
      customerCode: no,
      customerType,
      customerCategory: category,
      customerProvince: province,
      customerCity: city,
      groupPurchaseCompany: groupName,
    })
    this.calcPaymentTerms.emit()
  }

  onReopenForm() {
    this.reopenForm.emit()
  }
}
