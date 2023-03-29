import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from '@angular/forms'

@Component({
  templateUrl: "task-assign.component.html",
  styleUrls: ["./task-assign.component.scss"],
})
export class TaskAssignComponent implements OnInit {
  oitDataTable = {
    list: [],
    total: 0,
    loading: false,
  };

  oitSearchForm: FormGroup = this.createSearchForm()

  spDataTable = {
    list: [],
    total: 0,
    loading: false,
  };

  spSearchForm: FormGroup = this.createSearchForm()

  constructor(private fb: FormBuilder) {}

  ngOnInit() {}

  createSearchForm(): FormGroup {
    return this.fb.group({
      referenceId: [null], // Reference No
      hospitalName: [null], // 医院
      applicant: [null], // 销售邮箱
      opportunityId: [null], // Opportunity ID
      so: [null], // SO#/合同订单号
      oitMode: [null], // 进单模式 
      dealFormId: [null], //deal Form Id
      bmc: [null], // BMC
      productModel: [null], // 产品型号
      dealerName: [null], // 经销商名称
      bigArea: [null], // 大区
      biddingNumber: [null], // 招标编号
      bidderName: [null], // 投标公司
      smallArea: [null], // 小区
      authorizationRequired: [null], // 是否授权 1是 0否
      businessModel: [null], //业务模式
      team: [null], // team
      modality: [null], // modality
      submitStartTime: [null], // 提交开始时间
      submitEndTime: [null], // 提交结束时间
      oitStartMonth: [null], // Oit开始月份
      oitEndMonth: [null], // Oit结束月份
      taskOwner: [null], // 待办所有人
      taskOwnerStatus: [null], // 待办所有人状态
    })
  }
}
