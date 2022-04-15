import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BG_LIST, APPLY_TYPES, APPLY_TYPE_MAP } from '../../../../../special-approval/special-approval.constants'
import { SpecialApprovalSettingService } from '../../special-approval-setting.service'

@Component({
  selector: 'sp-setting-business-proc-list',
  templateUrl: './business-proc-list.component.html',
})
export class BusinessProcListComponent implements OnInit {

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

  expandedRowMap: { [key: string]: boolean } = {}

  constructor(
    private fb: FormBuilder,
    private spSettingService: SpecialApprovalSettingService,
  ) { }

  ngOnInit(): void {
    this.getAllApproveProcList()
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

  onToggleProcStatus(item) {
    console.log(item);
  }

  onShowEditForm(item) {
    console.log(item);
  }


  onDeleteProc(item) {

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
