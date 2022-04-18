import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd'

import { BG_LIST, APPLY_TYPES, APPLY_TYPE_MAP } from '../../../../../special-approval/special-approval.constants'
import { SpecialApprovalSettingService } from '../../special-approval-setting.service'
import { BusinessProc } from '../../special-approval-setting.d'
import { BusinessProcFormComponent, FORM_MODE } from '../business-proc-form/business-proc-form.component'

@Component({
  selector: 'sp-setting-business-proc-list',
  templateUrl: './business-proc-list.component.html',
  styleUrls: ['business-proc-list.component.scss'],
})
export class BusinessProcListComponent implements OnInit {

  @ViewChild('businessProcForm') businessProcForm: BusinessProcFormComponent

  formValues: FormGroup = this.fb.group({
    processId: [null], // 审批流名称
    status: [null], // 状态
    bg: [null], // bg
    applyType: [null], // 审批类型
    applyItem: [null], // 申请原因
  })

  selectOptions = {
    processList: [],
    statuses: [{ label: '已启用', value: 1 }, { label: '已禁用', value: 0 }],
    bgList: BG_LIST,
    applyTypes: APPLY_TYPES,
    applyItems: [],
  }

  tableData = {
    loading: false,
    list: []
  }
  
  selectedProc: BusinessProc = null

  expandedRowMap: { [key: string]: boolean } = {}

  constructor(
    private fb: FormBuilder,
    private spSettingService: SpecialApprovalSettingService,
    private message: NzMessageService,
  ) { }

  ngOnInit(): void {
    this.getAllApproveProcList()
  }

  onSelectRow(item) {
    this.selectedProc = item
  }
  async getAllApproveProcList() {
    const data = await this.spSettingService.getAllApproveProcList()
    this.selectOptions.processList = data.map(({ id, name }) => ({ label: name, value: id }))
    this.getTableData()
  }

  formatApplyItem({ applyType, applyItem }) {
    const type = APPLY_TYPE_MAP[applyType]
    if (!type) { return applyItem }
    const item = type.items.find(({ value }) => value === applyItem)
    return item ? item.label : item
  }

  formatApproveProcName(approveProcId) {
    const approveProc = this.selectOptions.processList.find(({ value }) => value === approveProcId)
    return approveProc ? approveProc.label : approveProcId
  }

  async getTableData(renew = false) {
    this.tableData.loading = true
    let data = await this.spSettingService.getAllBusinessProcList(renew)
    const { processId, status, bg, applyType, applyItem } = this.formValues.getRawValue()
    data = data.filter((item: any) => 
      (processId === null || processId === item.processId) &&
      (status === null || status === item.status) &&
      (bg === null || bg === item.bg ) &&
      (applyType === null || applyType === item.applyType ) &&
      (applyItem === null || applyItem === item.applyItem )
    ) as []

    // 数组转obj
    data = data.reduce((calc: any, cur) => {
      const { applyType } = cur
      if (calc[applyType]) {
        calc[applyType].push(cur)
      } else {
        calc[applyType] = [cur]
      }
      return calc
    }, {})

    // obj转数组
    data = Object.keys(data).map((applyType) => ({
      applyType,
      applyTypeName: APPLY_TYPE_MAP[applyType] ? APPLY_TYPE_MAP[applyType].label : applyType,
      children: data[applyType]
    })) as []

    this.tableData.list = data
    this.tableData.loading = false
  }

  async onToggleProcStatus(item) {
    try {
      this.tableData.loading = true
      const { status, id } = item
      if (status) {
        await this.spSettingService.enableBusinessProc(id)
      } else {
        await this.spSettingService.disableBusinessProc(id)
      }
      this.message.success('操作成功')
    } catch ({ message }) {
      this.message.error('操作失败, 请稍候重试')
      console.log(item);
      item.status = !item.status
    } finally {
      this.tableData.loading = false
    }
  }

  onShowEditForm(item) {
    this.businessProcForm.showModal(FORM_MODE.EDIT, item)
  }

  onShowAddForm() {
    this.businessProcForm.showModal(FORM_MODE.NEW)
  }

  onShowCloneForm() {
    this.businessProcForm.showModal(FORM_MODE.CLONE, this.selectedProc)
  }

  async onDeleteProc(item) {
    try {
      this.tableData.loading = true
      await this.spSettingService.deleteBusinessProc(item.id)
      this.message.success('删除成功')
      this.getTableData(true)
    } catch ({ message }) {
      this.message.error('删除失败')
      console.log(`删除业务流程失败, ${message}`);
      console.log(item);
    } finally {
      this.tableData.loading = false
    }
  }

  // 重置查询表单
  onReset() {
    this.formValues.setValue({
      processId: null, // 审批流名称
      status: null, // 状态
      bg: null, // bg
      applyType: null, // 审批类型
      applyItem: null, // 申请原因
    })
    this.getTableData()
  }
}
