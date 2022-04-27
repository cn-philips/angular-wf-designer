import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd'

import { SpecialApprovalSettingService } from '../../special-approval-setting.service'
import { ApproveProc } from '../../special-approval-setting.d'
import { ApproveProcFormComponent, FORM_MODE } from '../approve-proc-form/approve-proc-form.component';

@Component({
  selector: 'sp-setting-approve-proc-list',
  templateUrl: './approve-proc-list.component.html',
  styleUrls: ['./approve-proc-list.component.scss'],
})
export class ApproveProcListComponent implements OnInit {

  @ViewChild('approveProcForm') approveProcForm: ApproveProcFormComponent

  cloneBtnLoading = false

  formValues: FormGroup = this.fb.group({
    code: [null], // 审批编号
    status: [null], // 状态
    name: [null], // 审批流名称
  })

  selectOptions = {
    processList: [],
    statuses: [{ label: '已启用', value: 1 }, { label: '已禁用', value: 0 }],
  }

  tableData = {
    loading: false,
    list: []
  }

  selectedProc: ApproveProc = null

  expandedRowMap: { [key: string]: boolean } = {}

  constructor(
    private fb: FormBuilder,
    private spSettingService: SpecialApprovalSettingService,
    private message: NzMessageService,
  ) { }

  ngOnInit(): void {
    this.getTableData()
  }

  async getTableData(renew = false) {
    this.tableData.loading = true
    let data = await this.spSettingService.getAllApproveProcList(renew)
    this.selectOptions.processList = data.map(({ code, id, name }) => ({ code, name, value: id }))
    const { code, status, name } = this.formValues.getRawValue()
    data = data.filter((item: any) => 
      (code === null || code === item.id) &&
      (status === null || status === item.status) &&
      (name === null || name === item.id )
    )
    this.tableData.list = data
    this.tableData.loading = false
  }

  async onToggleProcStatus(item) {
    try {
      this.tableData.loading = true
      const { status, id } = item
      if (status) {
        await this.spSettingService.enableApproveProc(id)
      } else {
        await this.spSettingService.disableApproveProc(id)
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
    this.approveProcForm.showModal(FORM_MODE.EDIT, item)
  }


  async onDeleteProc(item) {
    try {
      this.tableData.loading = true
      await this.spSettingService.deleteApproveProc(item.id)
      this.message.success('删除成功')
      this.getTableData(true)
      this.selectedProc = null
    } catch ({ message }) {
      this.message.error('该流程使用中，请先进入业务流程配置移除后再删除')
      console.log(`删除审批流程失败, ${message}`);
      console.log(item);
    } finally {
      this.tableData.loading = false
    }
  }

  onShowAddForm() {
    this.approveProcForm.showModal(FORM_MODE.NEW)
  }

  // 克隆审批流程
  async onCloneProc() {
    try {
      this.tableData.loading = true
      this.cloneBtnLoading = true
      const { id } = this.selectedProc
      await this.spSettingService.cloneApproveProc(id)
      this.message.success('克隆成功')
      this.getTableData(true)
    } catch ({ message }) {
      this.message.error('克隆失败, 请稍候重试')
      console.log(`克隆失败, ${message}`);
    } finally {
      this.tableData.loading = false
      this.cloneBtnLoading = false
    }
    this.selectedProc.id
  }

  onSelectRow(item) {
    this.selectedProc = item
  }

  // 重置查询表单
  onReset() {
    this.formValues.setValue({
      code: null, // 审批流名称
      status: null, // 状态
      name: null, // bg
    })
    this.getTableData()
  }
}
