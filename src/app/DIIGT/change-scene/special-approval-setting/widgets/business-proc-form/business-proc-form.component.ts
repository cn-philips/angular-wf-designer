import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { NzMessageService } from 'ng-zorro-antd'

import { SpecialApprovalSettingService } from '../../special-approval-setting.service'
import { BusinessProc } from '../../special-approval-setting.d'
import { BG_LIST, APPLY_TYPES, APPLY_TYPE } from '../../../../../special-approval/special-approval.constants'
import { SpecialApprovalService } from '../../../../../special-approval/special-approval.service';

export enum FORM_MODE {
  NEW = 'new',
  EDIT = 'edit',
  CLONE = 'clone',
}

const FORM_MODE_MAP = {
  [FORM_MODE.NEW]: '新建',
  [FORM_MODE.EDIT]: '编辑',
  [FORM_MODE.CLONE]: '克隆',
}

@Component({
  selector: 'sp-setting-business-proc-form',
  templateUrl: './business-proc-form.component.html',
  styleUrls: ['./business-proc-form.component.scss'],
})
export class BusinessProcFormComponent implements OnInit {
  @Output() success = new EventEmitter()

  modalTitle: string
  visible = false
  previewLoading = false
  submitLoading = false
  formMode: FORM_MODE

  businessProcId: string

  APPLY_TYPE = APPLY_TYPE
  approveProcNodeList = []

  selectOptions = {
    bgList: BG_LIST,
    applyTypes: APPLY_TYPES,
    applyItems: [],
    approveProcList: [],
  }

  formValues: FormGroup = this.fb.group({
    status: [true], // 状态
    bg: [null, [Validators.required]], // BG
    applyType: [null, [Validators.required]], // 审批类型
    applyItem: [null, [Validators.required]], // 申请原因
    processId: [null, [Validators.required]], // 审批流
    minWarrantyMonths: [null],
    minWarrantyMonthsComparator: [null],
    maxWarrantyMonths: [null],
    maxWarrantyMonthsComparator: [null],
    remark: [null], // 说明
  })

  constructor(
    private fb: FormBuilder,
    private spSettingService: SpecialApprovalSettingService,
    private message: NzMessageService,
    private spService: SpecialApprovalService,
  ) {}

  async ngOnInit() {
    const data = await this.spSettingService.getAllApproveProcList()
    this.selectOptions.approveProcList = data.map(({ id, code, name, status }) => ({ label: `${code} ${name}`, value: id, disabled: !status }))
  }

  onApplyTypeChange(applyType) {
    this.selectOptions.applyItems = this.spService.getApplyItems(applyType)
    this.formValues.patchValue({
      applyItem: null
    })
  }

  async onProcessChange(processId) {
    this.previewLoading = true
    const nodeList = await this.spSettingService.getApproveProcNodeList(processId)
    this.approveProcNodeList = nodeList.sort((left, right) => left.code < right.code ? -1 : 1 )
    this.previewLoading = false
  }

  showModal(mode: FORM_MODE, data: BusinessProc = null) {
    this.modalTitle = FORM_MODE_MAP[mode]
    this.formMode = mode
    if (mode === FORM_MODE.EDIT || mode === FORM_MODE.CLONE) {
      const { id, status, bg, applyType, applyItem, processId, minWarrantyMonths, minWarrantyMonthsComparator, maxWarrantyMonths, maxWarrantyMonthsComparator, remark } = data
      // this.onApplyTypeChange(applyType)
      this.formValues.patchValue({
        status,
        bg,
        applyType,
        applyItem,
        processId,
        minWarrantyMonths,
        minWarrantyMonthsComparator,
        maxWarrantyMonths,
        maxWarrantyMonthsComparator,
        remark,
      })
      if (mode === FORM_MODE.EDIT) {
        this.businessProcId = id
      }
    }
    this.visible = true
  }

  async onSubmit() {
    for(const i in this.formValues.controls) {
      this.formValues.controls[i].markAsDirty()
      this.formValues.controls[i].updateValueAndValidity()
    }
    if (this.formValues.invalid) {
      this.message.error('请按要求填写表单信息')
      return
    }
    const { messageId } = this.message.loading('提交中...', { nzDuration: 0 })
    try {
      this.submitLoading = true
      const data = this.formValues.getRawValue()
      data.status = data.status ? 1 : 0
      if (this.formMode === FORM_MODE.EDIT) {
        data.id = this.businessProcId
        await this.spSettingService.updateBusinessProc(data)
      } else {
        await this.spSettingService.addBusinessProc(data)
      }
      this.message.success(`${FORM_MODE_MAP[this.formMode]}成功`)
      this.success.emit()
      this.onHideModal()
    } catch ({ message }) {
      this.message.error(`${FORM_MODE_MAP[this.formMode]}失败, 请稍候重试`)
      console.log(`${FORM_MODE_MAP[this.formMode]}失败, ${message}`);
    } finally {
      this.submitLoading = false
      this.message.remove(messageId)
    }
  }

  onHideModal() {
    this.visible = false
    this.businessProcId = null
    // 重置表单
    this.formValues.patchValue({
      status: true,
      bg: null,
      applyType: null,
      applyItem: null,
      processId: null,
      minWarrantyMonths: null,
      minWarrantyMonthsComparator: null,
      maxWarrantyMonths: null,
      maxWarrantyMonthsComparator: null,
      remark: null,
    })
    this.approveProcNodeList = []
  }
}
