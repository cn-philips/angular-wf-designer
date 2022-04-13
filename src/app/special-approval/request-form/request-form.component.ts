import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import * as moment from 'moment'
import { NzMessageService } from 'ng-zorro-antd'

import { SpecialApprovalService } from '../special-approval.service'
import { 
  LOADING_MESSAGE,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
  DEFAULT_ERROR_MESSAGE,
  BUSINESS_MODEL,
  APPLY_TYPE,
  APPLY_TYPE_MAP,
  STAND_WARRANTY_MONTH,
  BG_BMC_MAP,
  NODE_ACTION,
  PROCESS_STATUS,
} from '../special-approval.constants'

enum TAB_TYPE {
  BASIC_INFO = 'basic-info',
  ORDER_INFO = 'order-info',
  WARRANTY_INFO = 'warranty-info',
  APPROVER_INFO = 'approver-info',
  CC_INFO = 'cc-info',
  FLOW_INFO = 'flow-info',
  APPROVE = 'approve',
  APPROVE_HISTORY = 'approve-history',
  FEEDBACK = 'feedback',
}

@Component({
  selector: 'special-approval-request-form',
  templateUrl: './request-form.component.html',
  styleUrls: ['./request-form.component.scss']
})
export class RequestFormComponent implements OnInit {

  pageTitle: string = '新建特批'
  requestId
  requestInfo = {
    orderInfo: {},
    warrantyInfo: {}
  }

  APPLY_TYPE = APPLY_TYPE

  applyType: string
  applyItem: string

  submitLoading = false
  editable = true

  showSaveBtn = false // 是否显示保存按钮, 申请状态是草稿, 并且登录用户是申请人或者新的申请单子
  showDeleteBtn = false // 是否显示删除按钮, 申请状态是草稿, 并且登录用户是申请人
  showSubmitBtn = false // 是否显示提交按钮, 申请状态是草稿、退回、撤回并且登录用户是申请人或者新的申请单子
  showApproveTab = false
  showFeedbackTab = false
  showWithdrawBtn = false
  showCancelBtn = false

  supportFileList = []

  userList = []

  taskId: string

  approveNodeList = []
  approveHistory = []

  pageLoading = true

  isApplicant = false

  processUsers: string[] = [] // 流程中所有的人
  applicantEmail: string
  referenceId: string

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private spService: SpecialApprovalService,
    private message: NzMessageService,
  ) {}

  acitveTabId: string = TAB_TYPE.BASIC_INFO

  TAB_TYPES = TAB_TYPE

  applyItems = []
  bmcs = []

  executed = null

  minMon
  maxMon

  formValues = this.fb.group({
    basicInfo: this.fb.group({
      applyCode: [null],
      applicant: [null], // 申请人邮箱
      applicantName: [{ value: null, disabled: true }, [Validators.required]], // 申请人
      applyType: [null, [Validators.required]], // 申请类型
      applyItem: [null, [Validators.required]], // 申请原因
      applyItemDesc: [null], // 其他原因说明
      reason: [null, [Validators.required]], // 申请原因
      applyFileIds: [[]], // 申请附件
    }),
    orderInfo: this.fb.group({
      orderType: [null, [Validators.required]], // 订单类型
      referenceId: [null], // Reference Id
      productType: [null], // 产品型号
      bmc: [null, [Validators.required]], // 产品线
      bg: [{ value: null, disabled: true }, [Validators.required]], // BG
      bigArea: [null, [Validators.required]], // 产品区域-大区
      smallArea: [null, [Validators.required]], // 产品区域-小区
      businessModel: [null, [Validators.required]], // 业务模式
      dealerName: [{ value: null, disabled: true }], // 经销商名称
      dealerCode: [{ value: null, disabled: true }], // 经销商编号
      hospitalName: [{ value: null, disabled: true }], // 医院名称
      hospitalNo: [{ value: null, disabled: true }], // 医院编号
      projectName: [null, [Validators.required]], // 项目名称
      sapOrderNo: [null, [Validators.required]], //SAP订单号
      orderAmount: [null, [Validators.required]], // 合同金额-数额
      currency: [null, [Validators.required]], // 合同金额-货币
      expectedSaleDate: [null, [Validators.required]], // 预计记认销售日期
      applyArrivalTime: [null, [Validators.required]], // 申请到货时间
      expectedPaymentDate: [null, [Validators.required]], // 预计付款(或场地就位)日期
      om: [null], // OM
    }),
    warrantyInfo: this.fb.group({
      equipmentDesc: [null, [Validators.required]], // 设备SN
      expectedStdWarrantyStartdate: [null, [Validators.required]], // 预计标准保修开始日期
      stdWarrantyMonths: [null, [Validators.required]], // 标准保修月数
      expectedStdWarrantyEnddate: [{ value: null, disabled: true }, [Validators.required]], // 预计标准保修结束日期
      applyExtWarrantyMonths: [null, [Validators.required]], // 申请延保月数
      applyStdWarrantyEnddate: [{ value: null, disabled: true }, [Validators.required]], // 申请标准保修结束日期
    }),
    ccInfo: this.fb.group({
      ccType: [null], // 抄送类型
      ccPerson: [[]] // 抄送人
    })
  })

  ngOnInit(): void {
    const { params: { requestId }, queryParams: { type, item, taskId, minMon, maxMon, bg } } = this.route.snapshot
    // detail page
    if (requestId) {
      this.taskId = taskId
      this.requestId = requestId
      this.getRequestDetail(requestId)
    } else {
      // new page
      this.basicInfo.patchValue({
        applicant: localStorage.getItem('ng_philips_code1'),
        applicantName: localStorage.getItem('ng_philips_username')
      })
      this.showSubmitBtn = true
      this.showSaveBtn = true
      if (!type || !APPLY_TYPE_MAP[type]) {
        this.navigateToHomePage()
        return
      }
      if (item) {
        this.applyItem = item
        this.basicInfo.patchValue({ applyItem: item })
      }
      this.applyType = type
      
      this.basicInfo.patchValue({ applyType: type })

      if (minMon || maxMon) {
        const month = maxMon ? Number(maxMon) : Number(minMon)
        this.warrantyInfo.patchValue({ applyExtWarrantyMonths: month })
        this.minMon = Number(minMon || 0)
        this.maxMon = Number(maxMon || 999)
      }

      this.setPageTitle({ applyType: type, applyItem: item, minMon, maxMon })

      if (bg) {
        this.orderInfo.patchValue({
          bg
        })

        if (type === APPLY_TYPE.EXT_WARRANTY) {
          this.warrantyInfo.patchValue({
            stdWarrantyMonths: STAND_WARRANTY_MONTH[bg]
          })
        }
      }
      this.pageLoading = false
      this.setFormValidators(type, item, bg)
    }
  }

  setPageTitle({ applyType, applyItem, minMon, maxMon }, isNew = true) {
    let pageTitle = isNew ? '新建特批-' : ''
    const { label: applyTypeName, items } = APPLY_TYPE_MAP[applyType]
    if (applyType === APPLY_TYPE.PRODUCTION) {
      const item = items.find(({ value }) => value == applyItem) || { } as { label: string }
      const applyItemName = item.label
      pageTitle += `${applyTypeName}-${applyItemName}`
    } else if (applyType === APPLY_TYPE.EXT_WARRANTY) {
      let warrantyInfo: string
      if (minMon > 0 && maxMon > 0) {
        warrantyInfo = `>${minMon - 1} month&≤${maxMon} month`
      } else if (minMon > 0) {
        warrantyInfo = `>${minMon - 1} month`
      } else {
        warrantyInfo = `≤${maxMon} month`
      }
      pageTitle += `${applyTypeName}${warrantyInfo}`
    }
    this.pageTitle = pageTitle
    
    this.applyItems = items
  }

  get orderInfo(): FormGroup {
    return this.formValues.get('orderInfo') as FormGroup
  }

  get basicInfo(): FormGroup {
    return this.formValues.get('basicInfo') as FormGroup
  }

  get warrantyInfo(): FormGroup {
    return this.formValues.get('warrantyInfo') as FormGroup
  }

  get ccInfo(): FormGroup {
    return this.formValues.get('ccInfo') as FormGroup
  }

  setFormValidators(type, item, bg) {
    if (type === APPLY_TYPE.EXT_WARRANTY) {
      this.orderInfo.controls.applyArrivalTime.clearValidators()
      this.orderInfo.controls.expectedPaymentDate.clearValidators()
      if (item == 'sp_warranty_apply_item_5') {
        this.basicInfo.controls.applyItemDesc.setValidators([Validators.required])
      }
    } else {
      this.basicInfo.controls.applyItem.disable()
      this.warrantyInfo.controls.equipmentDesc.clearValidators()
      this.warrantyInfo.controls.expectedStdWarrantyStartdate.clearValidators()
      this.warrantyInfo.controls.stdWarrantyMonths.clearValidators()
      this.warrantyInfo.controls.expectedStdWarrantyEnddate.clearValidators()
      this.warrantyInfo.controls.applyExtWarrantyMonths.clearValidators()
      this.warrantyInfo.controls.applyStdWarrantyEnddate.clearValidators()
    }

    if (bg === 'PD&IGT') {
      this.orderInfo.controls.referenceId.disable()
      this.orderInfo.controls.productType.disable()
    } else {
      this.orderInfo.controls.projectName.disable()
    }

    this.bmcs = BG_BMC_MAP[bg]
  }

  getFormData() {
    const { basicInfo, orderInfo, ccInfo, warrantyInfo } = this.formValues.getRawValue()
    const { productType, applyArrivalTime, expectedPaymentDate, expectedSaleDate } = orderInfo
    const { expectedStdWarrantyStartdate, expectedStdWarrantyEnddate, applyStdWarrantyEnddate } = warrantyInfo
    const data = {
      ...this.requestInfo,
      ...basicInfo,
      orderInfo: {
        ...this.requestInfo.orderInfo,
        ...orderInfo,
        productType: Array.isArray(productType) ? productType.join(',') : productType,
        applyArrivalTime: applyArrivalTime ? moment(applyArrivalTime).format('YYYY-MM-DD') : null,
        expectedPaymentDate: expectedPaymentDate ? moment(expectedPaymentDate).format('YYYY-MM-DD') : null,
        expectedSaleDate: expectedSaleDate ? moment(expectedSaleDate).format('YYYY-MM-DD') : null,
      },
      ...ccInfo,
      ccPerson: ccInfo.ccPerson.join(','),
    }

    if (this.applyType === APPLY_TYPE.EXT_WARRANTY) {
      data.warrantyInfo = {
        ...(this.requestInfo.warrantyInfo || {}),
        ...warrantyInfo,
        expectedStdWarrantyStartdate: expectedStdWarrantyStartdate ? moment(expectedStdWarrantyStartdate).format('YYYY-MM-DD') : null,
      }
    }
    return data
  }

  // 设置页面是否可编辑, 满足以下情况可编辑
  // 1. 登录用户是申请人
  // 2. 申请状态是草稿、已拒绝(退回)、已撤销
  setEditable(processStatus) {
    const editable = this.isApplicant && [PROCESS_STATUS.DRAFT, PROCESS_STATUS.REJECTED, PROCESS_STATUS.WITHDRAW].includes(processStatus)
    if (!editable) {
      // 设置表单字段disabled
      this.formValues.controls.basicInfo.disable()
      this.formValues.controls.orderInfo.disable()
      this.formValues.controls.warrantyInfo.disable()
      this.formValues.controls.ccInfo.disable()
    }
    this.editable = editable
  }

  async onSubmit() {
    for (const i in this.warrantyInfo.controls) {
      this.warrantyInfo.controls[i].markAsDirty();
      this.warrantyInfo.controls[i].updateValueAndValidity();
    }
    for (const i in this.basicInfo.controls) {
      this.basicInfo.controls[i].markAsDirty();
      this.basicInfo.controls[i].updateValueAndValidity();
    }
    for (const i in this.orderInfo.controls) {
      this.orderInfo.controls[i].markAsDirty();
      this.orderInfo.controls[i].updateValueAndValidity();
    }
    if (
      this.basicInfo.invalid ||
      this.orderInfo.invalid ||
      (this.applyType === APPLY_TYPE.EXT_WARRANTY && this.warrantyInfo.invalid)
    ) {
      this.message.error('请按要求填写表单信息')
      return
    }
    try {
      const data = this.getFormData()
      const { orderInfo: { businessModel, hospitalNo, dealerCode }, ccType, ccPerson } = data
      // 医院和经销商必填一项
      if (businessModel === BUSINESS_MODEL.DISTRIBUTOR_DEAL) {
        if (!hospitalNo && !dealerCode) {
          this.message.error('请选择医院或者经销商')
          return
        }
      } else if(!hospitalNo){
        this.message.error('请选择医院')
        return
      }

      // 抄送人和抄送节点必须同时选择或者同时不选择
      if (ccType && !ccPerson) {
        this.message.error('请选择抄送人')
        return
      } else if(!ccType && ccPerson) {
        this.message.error('请选择抄送节点')
        return
      }
      const id = this.message.loading(LOADING_MESSAGE.SUBMIT, { nzDuration: 0 }).messageId
      this.submitLoading = true
      await this.spService.submitRequest(data)
      this.message.remove(id)
      this.message.success(SUCCESS_MESSAGE.SUBMIT)
      this.navigateToHomePage() // 提交成功跳转到首页
    } catch ({ message }) {
      this.message.error(ERROR_MESSAGE.SUBMIT)
      console.error(`提交失败, ${message}`)
    } finally {
      this.submitLoading = false
    }
  }

  async onSaveDraft() {
    try {
      const id = this.message.loading(LOADING_MESSAGE.SAVE_DRAFT, { nzDuration: 0 }).messageId
      this.submitLoading = true
      const data = this.getFormData()
      await this.spService.saveRequest(data)
      this.message.remove(id)
      this.message.success(SUCCESS_MESSAGE.SAVE_DRAFT)
      this.navigateToHomePage()
    } catch({ message }) {
      this.message.error(ERROR_MESSAGE.SAVE_DRAFT)
      console.error(`保存失败, ${message}`)
    } finally {
      this.submitLoading = false
    }
  }

  async getRequestDetail(requestId) {
    try {
      this.pageLoading = true
      const data = await this.spService.getRequestDetail(requestId)
      this.requestInfo = data
      const { 
        createUser, applicant, applicantName,
        status, applyCode, applyType, applyItem,
        applyItemDesc, executed, processStatus,
        reason, ccType, ccPerson, orderInfo, attachments,
        taskList, nodeInfoList, nodeCode, nodeAction, warrantyInfo,
      } = data
      const { label, items } = APPLY_TYPE_MAP[applyType]
      const { productType, bg } = orderInfo
      this.pageTitle = label
      this.applyItem = applyItem
      this.applyItems = items
      this.applyType = applyType
      this.executed = executed
      this.formValues.patchValue({ 
        basicInfo: {
          applyCode,
          applicant,
          applicantName,
          applyType,
          applyItem,
          applyItemDesc,
          reason,
          applyFileIds: attachments.map(({ fileId }) => fileId)
        },
        orderInfo: {
          ...orderInfo,
          productType: (bg === 'US' && productType) ? productType.split(',') : productType, // US产品可多选
        },
        ccInfo: {
          ccType,
          ccPerson: ccPerson ? ccPerson.split(',') : [],
        },
      })

      if (warrantyInfo) {
        this.formValues.patchValue({
          warrantyInfo
        })
      }

      const userSet = new Set<string>()
      nodeInfoList.forEach(({ approverList }) => approverList.forEach(({ user }) => { 
        if (!userSet.has(user)) {
          userSet.add(user)
          this.processUsers.push(user)
        }
      }))
      this.applicantEmail = createUser
      this.referenceId = orderInfo.referenceId
      this.supportFileList = attachments.map(({ fileId, name, size, type }) => ({
        uid: fileId,
        fileId,
        name,
        size,
        type,
        filename: name,
        response: { fileId }
      }))

      this.userList = ccPerson ? ccPerson.split(',').map(email => ({ email })) : []

      this.isApplicant = applicant === localStorage.getItem('ng_philips_code1')
      
      const isDraft = processStatus === PROCESS_STATUS.DRAFT && this.isApplicant
      if (isDraft) {
        this.showSubmitBtn = true
        this.showSaveBtn = true
        this.showDeleteBtn = true
      }

      if ([PROCESS_STATUS.REJECTED, PROCESS_STATUS.WITHDRAW].includes(processStatus) && this.isApplicant && status !== 0) {
        this.showSubmitBtn = true
        this.showCancelBtn = true
      }

      this.showApproveTab = nodeAction !== NODE_ACTION.FEEDBACK && !!this.taskId && nodeInfoList.find(({ code, action, approverList }) => {
        if (code === nodeCode && action === nodeAction) {
          return approverList.find(({ user }) => user === localStorage.getItem('ng_philips_code1'))
        } else {
          return false
        }
      })

      this.showFeedbackTab = nodeAction === NODE_ACTION.FEEDBACK && this.isApplicant && !!this.taskId
      this.showWithdrawBtn = processStatus === PROCESS_STATUS.START && this.isApplicant && nodeAction !== NODE_ACTION.FEEDBACK

      this.approveNodeList = nodeInfoList
      this.approveHistory = taskList
      this.setEditable(processStatus)
      this.setFormValidators(applyType, applyItem, orderInfo.bg)
    } catch ({ message }) {
      this.message.error(DEFAULT_ERROR_MESSAGE)
      console.error(`初始化失败, ${message}`)
    } finally {
      this.pageLoading = false
    }
  }

  async onDeleteRequest() {
    try {
      this.submitLoading = true
      const id = this.message.loading(LOADING_MESSAGE.DELETE_DRAFT, { nzDuration: 0 }).messageId
      await this.spService.deleteRequest(this.requestId)
      this.message.remove(id)
      this.message.success(SUCCESS_MESSAGE.DELETE_DRAFT)
      this.navigateToHomePage()
    } catch({ message }) {
      this.message.error(ERROR_MESSAGE.DELETE_DRAFT)
      console.error(`删除失败, ${message}`)
    } finally {
      this.submitLoading = false
    }
  }

  // 取消申请
  async onCancelRequest() {
    try {
      this.submitLoading = true
      const id = this.message.loading(LOADING_MESSAGE.CANCEL_REQUEST, { nzDuration: 0 }).messageId
      await this.spService.cancelRequest(this.requestId)
      this.message.remove(id)
      this.message.success(SUCCESS_MESSAGE.CANCEL_REQUEST)
      this.navigateToHomePage()
    } catch({ message }) {
      this.message.error(ERROR_MESSAGE.CANCEL_REQUEST)
      console.error(`取消失败, ${message}`)
    } finally {
      this.submitLoading = false
    }
  }

  // 撤回申请
  async onWithdrawRequest() {
    try {
      this.submitLoading = true
      const id = this.message.loading(LOADING_MESSAGE.WITHDRAW_REQUEST, { nzDuration: 0 }).messageId
      await this.spService.withdrawRequest(this.requestId)
      this.message.remove(id)
      this.message.success(SUCCESS_MESSAGE.WITHDRAW_REQUEST)
      this.navigateToHomePage()
    } catch({ message }) {
      this.message.error(ERROR_MESSAGE.WITHDRAW_REQUEST)
      console.error(`撤回失败, ${message}`)
    } finally {
      this.submitLoading = false
    }
  }

  navigateToHomePage() {
    this.router.navigate(['/special-approval/home'])
  }
}
