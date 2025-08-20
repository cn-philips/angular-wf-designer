import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common'
import { PrebookV3Service } from '@pages/prebook-v3/prebook-v3.service';
import { prebookForm, createOrder, initBasicInfo, validateForm, getFormData } from "@pages/prebook-v3/prebook-v3.utils"
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { BUSINESS_MODEL_DIRECT } from '@pages/bidding-v3/bidding-v3.constants'
import { TabsComponent } from '@app/modern-themes/components/tabs/tabs.component';
import { RouterExtendService } from '@app/modern-themes/services/router-extend.service';
import { Subject } from 'rxjs';

const processStatusMap = {
  ecos_prebook_zpm: '场地审核',
  ecos_prebook_dsi: 'DSI审核',
  ecos_prebook_oa: 'OA审核',
  ecos_prebook_dm: 'DM审核',
  ecos_prebook_zsl: 'ZSL审核',
  ecos_prebook_oa_supplemental: 'OA补充信息',
  ecos_prebook_om: 'OM上传SO#',
  ecos_prebook_resubmit: '修改备注',
}

const soValidators = (control: FormGroup): ValidationErrors | null => {
  if (control.value) {
    const reg = /^([\d;\s]{0,1000}$)$/;
    const valid = reg.test(control.value); // true
    return valid ? null : { soValue: true };
  }
  return null
}

@Component({
  templateUrl: './prebook-detail.component.html',
  styleUrls: ['./prebook-detail.component.scss']
})
export class PrebookDetailComponent implements OnInit {

  @ViewChild('tabs') tabs: TabsComponent

  subTierSubject = new Subject()

  pageLoading = false;
  prebookForm = prebookForm()

  disabled = true

  // query params
  applyId
  processStatus
  processInstanceId
  processInstanceTaskId
  fromTask = false
  fromSupplement = false

  originData = {
    applyId: null,
    modality: null,
    team: null,
    bigArea: null,
    smallArea: null,
    cycleGroup: null,
    role: null,
    prebook: {
      orderInfo: [],
      dealFormSales: null,
    }
  }

  remarkMsgVisible = false
  cancelMsgVisible = false

  approvalForm = this.fb.group({
    zpmApproval: this.fb.group({
      estimatedSiteReadyTime: [null, [Validators.required]],
    }),
    oaApproval: this.fb.group({
      exportControl: [null, [Validators.required]],
      stockingAgreementDraft: [null, [Validators.required]],
    }),
    oaSupplement: this.fb.group({
      sofonFileSource: [true],
      exportControl: [null, [Validators.required]],
      stockingAgreementDraft: [null, [Validators.required]],
      stockingAgreementBody: [null, [Validators.required]],
      sofonFile: [null, [Validators.required]],
      sofonNo: [null, [Validators.required]],
      paymentVoucher: [null, [Validators.required]],
      needsLogisticSpecialist: [null, [Validators.required]],
    }),
    commonApproval: this.fb.group({
      comments: [null],
      attachmentIds: [null]
    })
  })

  get zpmApproval(): FormGroup {
    return this.approvalForm.get('zpmApproval') as FormGroup
  }

  get oaApproval(): FormGroup {
    return this.approvalForm.get('oaApproval') as FormGroup
  }

  get oaSupplement(): FormGroup {
    return this.approvalForm.get('oaSupplement') as FormGroup
  }

  get commonApproval(): FormGroup {
    return this.approvalForm.get('commonApproval') as FormGroup
  }

  get basicInfo(): FormGroup {
    return this.prebookForm.get('basicInfo') as FormGroup
  }

  get orderInfo(): FormArray {
    return this.prebookForm.get('orderInfo') as FormArray
  }

  get approvalTitle(): string {
    return processStatusMap[this.processStatus]
  }

  get showZpmApprovalTab(): boolean {
    return !['ecos_prebook_resubmit', 'ecos_prebook_zpm'].includes(this.processStatus) && !this.isUsProcess
  }
  get isUsProcess(): boolean {
    return this.originData.modality && this.originData.modality.toLowerCase() === 'us'
  }
  get showOaApprovalTab(): boolean {
    return ['ecos_prebook_dm', 'ecos_prebook_zsl'].includes(this.processStatus)
  }

  get showOaSupplementTab(): boolean {
    return ![
      'ecos_prebook_resubmit', 'ecos_prebook_zpm', 'ecos_prebook_dsi',
      'ecos_prebook_oa', 'ecos_prebook_dm', 'ecos_prebook_zsl',
      'ecos_prebook_oa_supplemental'
    ].includes(this.processStatus)
  }

  get showSubmitBtn(): boolean {
    return ['ecos_prebook_zpm', 'ecos_prebook_oa_supplemental', 'ecos_prebook_om', 'ecos_prebook_resubmit'].includes(this.processStatus)
  }

  get popconfirmTitle(): string {
    if (
      this.processStatus === 'ecos_prebook_oa_supplemental' ||
      this.processStatus === 'ecos_prebook_om'
    ) {
      return '提交之前，请在产品信息tab仔细确认Slot Reservation Order的所关联的OIT状态，以确保不会重复提交SO申请'
    } else if (this.processStatus === 'ecos_prebook_zpm') {
      return '你确定要执行提交的操作?'
    } else {
      return '你确定要执行批准的操作?'
    }
  }

  get showLinkBtn(): boolean {
    return (this.fromTask || this.fromSupplement) && (
      this.processStatus === 'ecos_prebook_oa_supplemental' ||
      this.processStatus === 'ecos_prebook_om' ||
      this.processStatus === 'ecos_prebook_resubmit'
    )
  }

  get isOAPorcessNode(): boolean {
    return this.fromTask && ['ecos_prebook_oa', 'ecos_prebook_oa_supplemental', ].includes(this.processStatus)
  }
  get allSelectedOrderIsInSameModality(): boolean {
    let modalityArr = this.orderInfo.controls.filter((order) => order.enabled&&!order.get('isDeleted').value).map(order=>order.get('orderModality').value);
    return new Set(modalityArr).size === 1;
  }
  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private prebookV3Service: PrebookV3Service,
    private router: Router,
    private location: Location,
    private message: NzMessageService,
    private routerExtend: RouterExtendService,
    private modalService: NzModalService,
  ) { }

  ngOnInit() {
    this.pageLoading = true;
    this.prebookV3Service.pageLoading$.subscribe(loading => this.pageLoading = loading)

    const {
      params: { id: applyId },
      queryParams: { processStatus, procInstId, processInstanceTaskId, fromTask, fromSupplement }
    } = this.activatedRoute.snapshot
    this.applyId = applyId
    this.processStatus = processStatus
    this.processInstanceId = procInstId
    this.processInstanceTaskId = processInstanceTaskId
    this.fromTask = (fromTask === 'true')
    this.fromSupplement = (fromSupplement === '0')
    this.getApplyDetail(applyId)
  }

  clearOrderInfo() {
    while (this.orderInfo.length !== 0) {
      this.orderInfo.removeAt(0)
    }
  }

  initOrderInfo(disabled) {
    this.clearOrderInfo()
    const { prebook: {
      orderInfo
    } } = this.originData as any
    if (Array.isArray(orderInfo)) {

      orderInfo.forEach((item) => {
        const order = createOrder(item, disabled)
        this.orderInfo.push(order)
      })
    }
  }

  initOaSupplementOM() {
    const { modality, bigArea, smallArea, cycleGroup, role, team, prebook: { dealFormSales } } = this.originData
    this.prebookV3Service.findUser({
      initiatorCycleGroup: cycleGroup,
      initiatorBigArea: bigArea,
      initiatorSmallArea: smallArea,
      initiatorModality: modality,
      initiatorRole: role,
      initiatorEmail: dealFormSales,
      approverTeam: team,
      approverRole: 'OM',
    }).subscribe(({ code, data }) => {
      if (code === '0000' && data && data.length > 0) {
        const [{ approverEmail }] = data
        this.oaSupplement.patchValue({
          needsLogisticSpecialist: approverEmail
        })
      }
    })
  }

  initApprovalForm() {
    const {
      prebook: {
        estimatedSiteReadyTime,
        exportControl,
        stockingAgreementDraft,
        stockingAgreementBody,
        sofonFile,
        sofonNo,
        paymentVoucher,
        needsLogisticSpecialist,
      }
    } = this.originData as any
    if (this.processStatus !== 'ecos_prebook_zpm') {
      this.zpmApproval.patchValue({
        estimatedSiteReadyTime
      })
    }
    if (this.processStatus !== 'ecos_prebook_oa') {
      this.oaApproval.patchValue({
        exportControl,
        stockingAgreementDraft
      })
    }

    if (this.processStatus === 'ecos_prebook_oa_supplemental') {
      this.oaSupplement.patchValue({
        sofonNo,
        exportControl,
        stockingAgreementDraft
      })
      if (this.fromTask || this.fromSupplement) {
        this.initOaSupplementOM()
      }
    } else {
      this.oaSupplement.patchValue({
        exportControl,
        stockingAgreementDraft,
        stockingAgreementBody,
        sofonFile,
        sofonNo,
        paymentVoucher,
        needsLogisticSpecialist,
      })
    }

    this.approvalForm.disable()
    this.commonApproval.enable()

    if (this.processStatus === 'ecos_prebook_resubmit') {
      this.commonApproval.get('comments').setValidators([Validators.required])
    }
    switch(this.processStatus) {
      case 'ecos_prebook_zpm':
        this.zpmApproval.enable()
        break
      case 'ecos_prebook_oa':
        this.oaApproval.enable()
        if(this.isUsProcess){
          // 备货协议草稿
          this.oaApproval.get('stockingAgreementDraft')!.clearValidators();
          this.oaApproval.get('stockingAgreementDraft')!.markAsPristine();
        }
        break
      case 'ecos_prebook_oa_supplemental':
        this.oaSupplement.enable()
        if(this.isUsProcess){
          // 备货协议草稿
          this.oaSupplement.get('stockingAgreementDraft')!.clearValidators();
          this.oaSupplement.get('stockingAgreementDraft')!.markAsPristine();
          this.oaSupplement.get('stockingAgreementBody')!.clearValidators();
          this.oaSupplement.get('stockingAgreementBody')!.markAsPristine();
          this.oaSupplement.get('paymentVoucher')!.clearValidators();
          this.oaSupplement.get('paymentVoucher')!.markAsPristine();
        }
        break
      case 'ecos_prebook_om':
        if (this.fromTask || this.fromSupplement) {
          this.orderInfo.controls.forEach((item: FormGroup) => {
            item.get('isDeleted').disable()
            const { isDeleted, orderModality } = item.getRawValue()
            if (isDeleted === 0 && (orderModality === 'PD&IGT'|| orderModality === 'US')) {
              const so = item.get('so')
              so.enable()
              so.setValidators([Validators.required, soValidators])
              item.get('omFiles').enable()
              item.get('remark').enable()
            }
            const marketBundleInfo = item.get('marketBundleInfo') as FormArray
            marketBundleInfo.controls.forEach(bundle => bundle.disable())
            marketBundleInfo.controls.forEach(bundle => {
              bundle.get('wbsNo').enable()
              bundle.get('wbsNo').setValidators([Validators.required, Validators.maxLength(100)])
              bundle.get('wbsNo').clearValidators()
              bundle.get('wbsNo').markAsPristine()
            })
          })
        }
        break
      case 'ecos_prebook_resubmit':
        this.commonApproval.get('comments').setValidators([Validators.required])
        break
    }
  }

  disableForm() {
    this.prebookForm.disable()
  }

  getApplyDetail(applyId) {
    this.prebookV3Service.detail(applyId).subscribe(({ data }) => {
      this.originData = data
      const isResubmit = this.processStatus === 'ecos_prebook_resubmit'
      if (isResubmit) {
        this.disabled = false
        this.initOrderInfo(false)
      } else {
        this.disableForm()
        this.initOrderInfo(true)
      }
      const subTierDisabled = !(this.fromTask && (isResubmit || this.processStatus === 'ecos_prebook_oa_supplemental')) // resumbit || fromTask &
      initBasicInfo(this.prebookForm, data, this.subTierSubject, subTierDisabled)
      this.initApprovalForm()
      this.pageLoading = false;
      if (this.fromTask || this.fromSupplement) {
        setTimeout(() => {
          this.tabs.activeId('approval')
        }, 0);
      }
    })
  }

  goBack() {
    this.location.back()
  }

  resetRemarkMsg(){
    this.remarkMsgVisible = false
    this.cancelMsgVisible = false
  }

  handleAction(action) {
    const {
      zpmApproval,
      oaApproval,
      oaSupplement,
      commonApproval: {
        comments,
        attachmentIds
      }
    } = this.approvalForm.getRawValue()

    const data: any = {
      applyId: this.applyId,
      processInstanceId: this.processInstanceId,
      processInstanceTaskId: this.processInstanceTaskId,
      processStatus: this.processStatus,
      status: action,
      comments,
      attachmentIds: attachmentIds ? attachmentIds.map(({ fileId }) => fileId) : [],
      prebook: {
        ...this.originData.prebook,
      }
    }

    this.remarkMsgVisible = false
    this.cancelMsgVisible = false
    if (action === 'rejected' && (!comments || !comments.trim())) {
      if (this.processStatus === 'ecos_prebook_resubmit') {
        this.message.warning('请填写取消原因')
        this.cancelMsgVisible = true
      } else {
        this.message.warning('请填写拒绝理由')
        this.remarkMsgVisible = true
      }
      return
    }

    switch (this.processStatus) {
      case 'ecos_prebook_zpm':
        for(let i in this.zpmApproval.controls) {
          this.zpmApproval.controls[i].markAsDirty()
          this.zpmApproval.controls[i].updateValueAndValidity()
        }
        if (this.zpmApproval.invalid) {
          this.message.error('请按要求填写表单信息')
          return
        }
        const { estimatedSiteReadyTime } = zpmApproval
        Object.assign(data.prebook, { estimatedSiteReadyTime })
        break
      case 'ecos_prebook_oa':
        if (action === 'approved') {
          for(let i in this.oaApproval.controls) {
            this.oaApproval.controls[i].markAsDirty()
            this.oaApproval.controls[i].updateValueAndValidity()
          }
          if (this.oaApproval.invalid) {
            this.message.error('请按要求填写表单信息')
            return
          }
          const { exportControl: oaExportControl, stockingAgreementDraft: oaStockingAgreementDraft } = oaApproval
          Object.assign(data.prebook, {
            exportControl: oaExportControl,
            stockingAgreementDraft: oaStockingAgreementDraft,
          })
        }
        break
      case 'ecos_prebook_oa_supplemental':
        // 判断次级经销商黑名单
        if (data.prebook.businessModel !== BUSINESS_MODEL_DIRECT) {
          const subTierInfo = this.prebookForm.get('basicInfo').get('dealerInfo').get('subTierInfo') as FormArray
          if (subTierInfo.invalid) {
            this.modalService.error({
              nzTitle: '提示',
              nzContent: '经销商黑名单校验不通过，请上传必要的支持文件和备注后，再作提交'
            }).afterClose.subscribe(() => {
              this.tabs.activeId('basic-info')
              setTimeout(() => {
                document.querySelector('.dealer-info').scrollIntoView()
              }, 0);
            })
          }
        }
        for (let i in this.oaSupplement.controls) {
          this.oaSupplement.controls[i].markAsDirty()
          this.oaSupplement.controls[i].updateValueAndValidity()
        }

        if (this.oaSupplement.invalid) {
          this.message.error('请按要求填写表单信息')
          return
        }


        const {
          sofonFileSource,
          exportControl,
          stockingAgreementDraft,
          stockingAgreementBody,
          sofonFile,
          sofonNo,
          paymentVoucher,
          needsLogisticSpecialist,
        } = oaSupplement
        Object.assign(data.prebook, {
          sofonFileSource: sofonFileSource ? 1 : 0,
          exportControl,
          stockingAgreementDraft,
          stockingAgreementBody,
          sofonFile,
          sofonNo,
          paymentVoucher,
          needsLogisticSpecialist,
          subTierInfo: (this.basicInfo.get('dealerInfo').get('subTierInfo') as FormArray).getRawValue()
        })
        break
      case 'ecos_prebook_om':
        // 校验orderInfo
        this.orderInfo.controls.forEach((order: FormGroup) => {
          for (let i in order.controls) {
            order.controls[i].markAsDirty()
            order.controls[i].updateValueAndValidity()
          }
        })
        if (this.orderInfo.invalid) {
          this.message.error('请按要求填写表单信息')
          return
        }

        Object.assign(data.prebook, {
          orderInfo: this.orderInfo.getRawValue()
        })
        break
      case 'ecos_prebook_resubmit':
        // 校验表单
        const valid = validateForm(this.prebookForm, this.tabs)
        // 判断次级经销商黑名单
        if (data.prebook.businessModel !== BUSINESS_MODEL_DIRECT) {
          const subTierInfo = this.prebookForm.get('basicInfo').get('dealerInfo').get('subTierInfo') as FormArray
          if (subTierInfo.invalid) {
            this.modalService.error({
              nzTitle: '提示',
              nzContent: '经销商黑名单校验不通过，请上传必要的支持文件和备注后，再作提交'
            }).afterClose.subscribe(() => {
              this.tabs.activeId('basic-info')
              setTimeout(() => {
                document.querySelector('.dealer-info').scrollIntoView()
              }, 0);
            })
          }
        }
        if (!valid) {
          this.message.error('请按要求填写表单信息')
          return
        }
        // 校验修改备注
        for (let i in this.commonApproval.controls) {
          this.commonApproval.controls[i].markAsDirty()
          this.commonApproval.controls[i].updateValueAndValidity()
        }
        if (this.commonApproval.invalid) {
          this.tabs.activeId('approval')
          this.message.error('请填写修改备注')
          return
        }
        Object.assign(data, getFormData(this.prebookForm, this.originData))
        data.applyId = this.applyId
        data.processInstanceId = this.processInstanceId
        data.processInstanceTaskId = this.processInstanceTaskId
        data.processStatus = this.processStatus
        data.status = action
        data.comments = comments
        data.attachmentIds = attachmentIds ? attachmentIds.map(({ fileId }) => fileId) : []
        break
    }

    const optionPrefix = this.showSubmitBtn ? '提交' : '审批'
    this.pageLoading = true
    this.prebookV3Service.approve(data).subscribe(({ code }) => {
      if (code === '0000') {
        this.message.success(`${optionPrefix}成功!`);
        this.routerExtend.back();
        // this.router.navigate(["/ecos/my-todo"]);
      } else {
        this.message.error(`${optionPrefix}失败!`);
      }
      this.pageLoading = false
    }, () => {
      this.message.error(`${optionPrefix}失败!`);
      this.pageLoading = false
    });
  }
}
