import { Component, Input, OnChanges, SimpleChanges, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CURRENCIES, BUSINESS_MODEL_DIRECT } from '../../../bidding-v3.constants';
import { BiddingV3Service } from '../../../bidding-v3.service';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { CpVerifyComponent } from '../../cp-verify/cp-verify.component';
import { EXCLUDE_REFERENCE_NO } from '../../../bidding-v3.util'

@Component({
  selector: 'bidding-v3-bidding-confirm',
  templateUrl: './bidding-confirm.component.html',
  styleUrls: ['./bidding-confirm.component.scss']
})
export class BiddingConfirmComponent implements OnChanges {
  @Input() taskId
  @Input() disabled = false
  @Input() processStatus
  @Input() fromSupplement = false
  @Input() applyDetail = {
    id: null,
    applyId: null,
    applicant: null,
    dataSource: null,
    businessModel: null,
    hospitalName: null,
    hospitalId: null,
    specialProject: null,
    lackingAwardNotice: null,
    lackingWinningNotice: null,
    lackingGoodsLetter: null,
    lackingOther: null,
    lackingOtherDesc: null,
    processComments: null,
    winningNoticeFiles: null,
    biddingAnnouncePrice: null,
    biddingAnnounceCurrency: null,
    biddingAnnounceDate: null,
    endTimeDate: null,
    specialApprovalDate: null,
    biddingNoticeSignDate: null,
    confirmSupplementFiles: null,
    lackingFilesAdded: null,
    authorizationRequired: null,
    biddingType: null,
    specialApprovalSupportFiles: null,
    distributorDdpDate: null,
    specialApprovalItems: null,
    otherBiddingNumber: [],
    referenceId: null,
  }
  @Input() biddingForm: FormGroup
  @Input() biddingConfirm: FormGroup
  @Input() ddpDateExpired = false

  @Output() activeTab = new EventEmitter<string>()

  @ViewChild('cpVerify') cpVerify: CpVerifyComponent

  selectOption = {
    currency: CURRENCIES,
  };

  remarkMsgVisible = false
  remarkMsg = '请填写拒绝理由'

  get spItemsVisible(): boolean {
    return !EXCLUDE_REFERENCE_NO.includes(this.applyDetail.referenceId)
  }

  get showVerifyCpBtn() {
    const { dataSource, businessModel, specialProject } = this.applyDetail
    return !this.disabled &&
      businessModel !== BUSINESS_MODEL_DIRECT &&
      specialProject == 1 &&
      dataSource === 'CP Simulation' &&
      this.processStatus !== 'ecos_bid_confirm2'
  }

  get lackingOtherDescRequired() {
    return !!this.biddingConfirm.get('lackingOther').value
  }

  // get specialApprovalSupportFilesRequired() {
  //   const { lackingAwardNotice, lackingWinningNotice, lackingGoodsLetter, lackingOther } = this.biddingConfirm.getRawValue()
  //   const isRequired = lackingAwardNotice || lackingWinningNotice || lackingGoodsLetter || lackingOther

  //   const specialApprovalSupportFiles = this.biddingConfirm.get('specialApprovalSupportFiles')
  //   if (isRequired) {
  //     specialApprovalSupportFiles.setValidators([Validators.required])
  //   } else {
  //     specialApprovalSupportFiles.clearValidators()
  //   }
  //   return isRequired
  // }

  get specialApprovalItems(): FormArray {
    return this.biddingConfirm.get('specialApprovalItems') as FormArray
  }

  get isSpApprovalNode(): boolean {
    return !!this.taskId && this.processStatus === 'ecos_bid_special_approval'
  }

  get saveFileBtnVisible() {
    return this.fromSupplement && this.processStatus === 'ecos_bid_done'
  }

  constructor(
    private message: NzMessageService,
    public biddingV3Service: BiddingV3Service,
    private router: Router,
    private modalService: NzModalService,
    private fb: FormBuilder,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.applyDetail) {
      const { previousValue, currentValue } = changes.applyDetail
      if ((!previousValue || !previousValue.id) && currentValue.id) {
        this.initBiddingConfirm()
        this.initSpecialApprovalItems()

        if (this.fromSupplement && this.processStatus === 'ecos_bid_done') {
          this.biddingConfirm.get('confirmSupplementFiles').enable()
        }
      }
    }
  }

  winningNoticeFilesRequired = true

  handleSpItemStatusChange(item) {
    const spItems = this.specialApprovalItems.getRawValue().filter(({ status, nonRequiredFields }) => status === 1 && nonRequiredFields)
    const winningNoticeFiles = this.biddingConfirm.get('winningNoticeFiles')
    const { biddingType } = this.applyDetail
    var isIncludes = false
    
    for (let item of spItems) {
      if (item.nonRequiredFields.includes('winningNoticeFiles')) {
        isIncludes = true;
      }
    }

    if(biddingType === '其他类型' || isIncludes){
      this.winningNoticeFilesRequired = false
      winningNoticeFiles.clearValidators()
      winningNoticeFiles.updateValueAndValidity()
    } else {
      this.winningNoticeFilesRequired = true
      winningNoticeFiles.setValidators([Validators.required])
    }
  }

  activeItem(spItem: FormGroup) {
    const { roleList, status } = spItem.getRawValue()
    if (status !== 1) { return false }
    const roleSet = new Set(roleList.split(','))
    const userRoles = JSON.parse(localStorage.getItem('roles'))
    for (let userRole of userRoles) {
      if (roleSet.has(userRole)) {
        return true
      }
    }
    return false
  }


  createSpItemGroup() {
    return this.fb.group({
      id: [null],
      biddingApplyId: [null],
      specialApprovalProgramId: [null],
      name: [null],
      description: [null],
      roleList: [null],
      comment: [null],
      attachments: [null],
      status: [null],
      nonRequiredFields: [null],
    });
  }

  async initSpecialApprovalItems() {
    if (this.applyDetail.specialApprovalItems) {
      this.applyDetail.specialApprovalItems.forEach((item) => {
        const { specialApprovalProgramId, name, description, roleList, comment, status, attachments, nonRequiredFields } = item
        const specialApprovalItem = this.createSpItemGroup()
        specialApprovalItem.patchValue({
          specialApprovalProgramId,
          name,
          description,
          roleList,
          status,
          comment,
          attachments,
          nonRequiredFields,
        })
        if (this.disabled || this.processStatus === 'ecos_bid_confirm2') { specialApprovalItem.disable() }
        this.specialApprovalItems.push(specialApprovalItem)
      })
    }
  }


  initBiddingConfirm() {
    const {
      lackingAwardNotice, lackingWinningNotice, lackingGoodsLetter, lackingOther, lackingOtherDesc,
      processComments, winningNoticeFiles, biddingAnnouncePrice, biddingAnnounceCurrency, biddingAnnounceDate,
      endTimeDate, specialApprovalDate, biddingNoticeSignDate, confirmSupplementFiles, lackingFilesAdded, specialApprovalSupportFiles,
      biddingType,
    } = this.applyDetail
    this.biddingConfirm.patchValue({
      lackingOtherDesc,
      processComments, winningNoticeFiles, biddingAnnouncePrice, biddingAnnounceCurrency, biddingAnnounceDate,
      endTimeDate, specialApprovalDate, biddingNoticeSignDate, confirmSupplementFiles, lackingFilesAdded,
      lackingAwardNotice: !!lackingAwardNotice,
      lackingWinningNotice: !!lackingWinningNotice,
      lackingGoodsLetter: !!lackingGoodsLetter,
      lackingOther: !!lackingOther,
      specialApprovalSupportFiles,
    })
    const winningNoticeFile = this.biddingConfirm.get('winningNoticeFiles')
    if (biddingType === '其他类型') {
        this.winningNoticeFilesRequired = false
        winningNoticeFile.clearValidators()
        winningNoticeFile.updateValueAndValidity()
    }
    if (this.disabled) {
      this.biddingConfirm.disable()
    }
  }

  onLackingAwardNoticeChange(lackingOther) {
    const lackingOtherDesc = this.biddingConfirm.get('lackingOtherDesc') as FormControl
    lackingOtherDesc.patchValue(null)
    if (lackingOther) {
      lackingOtherDesc.setValidators([Validators.required])
    } else {
      lackingOtherDesc.clearValidators()
    }
    console.log(lackingOtherDesc);
    this.calcLackingFilesAdded()
  }

  getFormData(action) {
    const biddingConfirm = this.biddingConfirm.getRawValue()
    const { lackingAwardNotice, lackingWinningNotice, lackingGoodsLetter, lackingOther } = biddingConfirm
    const { id, applyId, businessModel } = this.applyDetail
    const data = {
      id,
      applyId,
      processInstanceTaskId: this.taskId,
      businessModel,
      ...biddingConfirm,
      lackingAwardNotice: lackingAwardNotice ? 1 : 0,
      lackingWinningNotice: lackingWinningNotice ? 1 : 0,
      lackingGoodsLetter: lackingGoodsLetter ? 1 : 0,
      lackingOther: lackingOther ? 1 : 0,
      action
    }
    return data
  }

  // action: unconfirmed => 退回至中标备案
  // action: rejected => 退回至投标申请表
  onReject(action) {
    this.remarkMsgVisible = false
    const biddingConfirm = this.biddingConfirm.getRawValue()
    if (!biddingConfirm.processComments || !biddingConfirm.processComments.trim()) {
      this.remarkMsg = action === 'unconfirmed' ? '请填写拒绝理由' : '请填写退回理由'
      this.message.warning(this.remarkMsg)
      this.remarkMsgVisible = true
      return
    }
    const data = this.getFormData(action)
    this.biddingV3Service.setPageLoading(true)
    this.biddingV3Service.approve(data).subscribe(({ code, msg }) => {
      if (code === '0000') {
        this.message.success("审批成功!");
        this.biddingV3Service.goTodoPage()
      } else {
        this.message.error(msg);
      }
      this.biddingV3Service.setPageLoading(false)
    }, ({ message }) => {
      this.message.error(message);
      this.biddingV3Service.setPageLoading(false)
    })
  }

  onSubmit(data) {
    this.biddingV3Service.setPageLoading(true)
    this.biddingV3Service.approve(data).subscribe(({ code, msg }) => {
      if (code === '0000') {
        this.message.success("审批成功!");
        this.biddingV3Service.goTodoPage()
      } else {
        this.message.error(msg);
      }
      this.biddingV3Service.setPageLoading(false)
    }, ({ message }) => {
      this.message.error(message);
      this.biddingV3Service.setPageLoading(false)
    })
  }

  onApprove() {
    this.remarkMsgVisible = false
    const data = this.getFormData('approved')
    if (this.applyDetail.businessModel !== BUSINESS_MODEL_DIRECT) {
      const subTiers = this.biddingForm.get('supplementInfo').get('dealerInfo').get('subTiers') as FormArray
      if (subTiers.invalid) {
        this.modalService.error({
          nzTitle: '提示',
          nzContent: '经销商黑名单校验不通过，请上传必要的支持文件和备注后，再作提交'
        }).afterClose.subscribe(() => {
          this.activeTab.emit('supplement-info')
          setTimeout(() => {
            document.querySelector('.dealer-info').scrollIntoView()
          }, 0);
        })
        return
      }
      data.subTiers = subTiers.getRawValue()
    }

    const biddingConfirm = this.biddingConfirm
    for (let i in biddingConfirm.controls) {
      biddingConfirm.controls[i].markAsDirty()
      biddingConfirm.controls[i].updateValueAndValidity()
    }
    if (biddingConfirm.invalid) {
      this.message.error('请按要求填写表单信息')
      return
    }

    // 校验产品信息
    const marketBundles = this.biddingForm.get('marketBundles') as FormArray
    marketBundles.markAsDirty()
    marketBundles.updateValueAndValidity()
    marketBundles.controls.forEach((marketBundle) => {
      const products = marketBundle.get('products') as FormArray
      products.controls.forEach((product: FormGroup) => {
        for(let i in product.controls) {
          product.controls[i].markAsDirty()
          product.controls[i].updateValueAndValidity()
        }
      })
    })
    if (marketBundles.invalid) {
      this.activeTab.emit('product-info')
      this.message.error('请补充产品信息')
      return
    }
    const newMarketBundles = [];
    marketBundles.getRawValue().forEach((marketBundle) => {
      const products = marketBundle.products;
      products.forEach((product) => {
        const item = { ...marketBundle, ...product, awardOrNot: product.awardOrNot ? 1 : 0, products: product.options };
        delete item.options;
        newMarketBundles.push(item);
      });
    });
    data.marketBundles = newMarketBundles

    if (this.ddpDateExpired) {
      this.modalService.confirm({
        nzTitle: "<h4>提醒</h4>",
        nzContent: `经销商DDP有效日期为${this.applyDetail.distributorDdpDate}，当前已过有效期，是否确认审批通过？`,
        nzOnOk: () => {
          this.onSubmit(data);
        },
      });
    } else {
      this.onSubmit(data)
    }
  }

  showCpVerifyDialog() {
    this.remarkMsgVisible = false
    this.cpVerify.show(this.applyDetail)
  }

  onCpConfirmSuccess() {}

  calcLackingFilesAdded() {
    const { lackingAwardNotice, lackingWinningNotice, lackingGoodsLetter, lackingOther } = this.biddingConfirm.getRawValue()
    const isLackingFilesAdded = !lackingAwardNotice && !lackingWinningNotice && !lackingGoodsLetter && !lackingOther
    this.biddingConfirm.patchValue({
      lackingFilesAdded: isLackingFilesAdded ? 1 : 0
    })
  }

  onSave() {
    const { id, applyId } = this.applyDetail
    const { confirmSupplementFiles } = this.biddingConfirm.getRawValue()
    const data = {
      id,
      applyId,
      confirmSupplementFiles,
    }
    this.biddingV3Service.setPageLoading(true)
    this.biddingV3Service.submitSupplementFile(data).subscribe(({ code, msg }) => {
      if (code === '0000') {
        this.message.success("保存成功!");
      } else {
        this.message.error('保存失败!');
      }
      this.biddingV3Service.setPageLoading(false)
    }, ({  }) => {
      this.message.error("保存失败!");
      this.biddingV3Service.setPageLoading(false)
    })
  }
}
