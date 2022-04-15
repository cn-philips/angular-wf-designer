import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SpecialApprovalSettingService } from '../../special-approval-setting.service'

@Component({
  selector: 'sp-setting-approve-proc-list',
  templateUrl: './approve-proc-list.component.html',
})
export class ApproveProcListComponent implements OnInit {

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

  expandedRowMap: { [key: string]: boolean } = {}

  constructor(
    private fb: FormBuilder,
    private spSettingService: SpecialApprovalSettingService,
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
      code: null, // 审批流名称
      status: null, // 状态
      name: null, // bg
    })
    this.getTableData()
  }
}
