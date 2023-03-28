import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BiddingV3Service } from '../../../bidding-v3.service';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { BUSINESS_MODEL_DIRECT } from "../../../bidding-v3.constants";

interface Approver {
  bmc: string;
  name: string;
  email: string;
}

@Component({
  selector: 'bidding-v3-bidding-approval',
  templateUrl: './bidding-approval.component.html',
  styleUrls: ['./bidding-approval.component.scss']
})
export class BiddingApprovalComponent implements OnChanges {
  @Input() disabled = false
  @Input() taskId
  @Input() biddingForm: FormGroup
  @Input() biddingApprovalInfo: FormGroup
  @Input() applyDetail = {
    applicant: null,
    cycleGroup: null,
    bigArea: null,
    modality: null,
    smallArea: null,
    dataSource: null,
    businessModel: null,
    id: null,
    applyId: null,
    nonStandard: {
      id: null, paymentTermsApproval: null, specificationTermsApproval: null,
      logisticTermsApproval: null, legalTermsApproval: null, isNonStandard: null,
      afterSaleTermsApproval: null, bondAmountTermsApproval: null
    },
    marketBundles: [],
    technicalApprovers: [],
    depositApprovers: [],
    distributorDdpDate: null,
  }

  @Input() ddpDateExpired = false

  @Output() activeTab = new EventEmitter<string>()

  bondAmountApprovers = {} // 投标保证金审批人

  specTermApprovers = {} // 技术条款审批人

  remarkMsgVisible = false

  BUSINESS_MODEL_DIRECT = BUSINESS_MODEL_DIRECT

  bmcRoleMap = new Map()

  constructor(
    public biddingV3Service: BiddingV3Service,
    private fb: FormBuilder,
    private message: NzMessageService,
    private modalService: NzModalService,
  ) { }

  get technicalApprovers(): FormArray {
    return this.biddingApprovalInfo.get('technicalApprovers') as FormArray
  }

  get depositApprovers(): FormArray {
    return this.biddingApprovalInfo.get('depositApprovers') as FormArray
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.applyDetail) {
      const { previousValue, currentValue } = changes.applyDetail
      if ((!previousValue || !previousValue.id) && currentValue.id) {
        this.init()
      }
    }
  }

  createApprover(bmc = null, name = null, email = null) {
    return this.fb.group({
      name: [name],
      email: [email, [Validators.required]],
      bmc: [bmc],
    })
  }
  
  init() {
    if (this.applyDetail.businessModel === BUSINESS_MODEL_DIRECT) {
      this.initBiddingApprovalInfo()
      this.initApproverList()
    }
  }

  resetApprovers() {
    for (let i = this.technicalApprovers.length - 1; i >= 0; i--) {
      this.technicalApprovers.removeAt(i)
    }
    for (let i = this.depositApprovers.length - 1; i >= 0; i--) {
      this.depositApprovers.removeAt(i)
    }
  }

  initBiddingApprovalInfo() {
    this.resetApprovers()
    const { nonStandard, technicalApprovers, depositApprovers } = this.applyDetail
    const {
      paymentTermsApproval, specificationTermsApproval, logisticTermsApproval,
      legalTermsApproval, isNonStandard, afterSaleTermsApproval, bondAmountTermsApproval
    } = nonStandard
    this.biddingApprovalInfo.patchValue({
      paymentTermsApproval: paymentTermsApproval === 1,
      specificationTermsApproval: specificationTermsApproval === 1,
      logisticTermsApproval: logisticTermsApproval === 1,
      legalTermsApproval: legalTermsApproval === 1,
      isNonStandard: isNonStandard === 1,
      afterSaleTermsApproval: afterSaleTermsApproval === 1,
      bondAmountTermsApproval: bondAmountTermsApproval === 1,
    })
    if (technicalApprovers && technicalApprovers.length > 0) {
      technicalApprovers.forEach(({ bmc, name, email }: Approver) => {
        const technicalApprover = this.createApprover(bmc, name, email)
        if (this.disabled) {
          technicalApprover.disable()
        }
        this.technicalApprovers.push(technicalApprover)
      })
    }
    if (depositApprovers && depositApprovers.length > 0) {
      depositApprovers.forEach(({ bmc, name, email }: Approver) => {
        const depositApprover = this.createApprover(bmc, name, email)
        if (this.disabled) {
          depositApprover.disable()
        }
        this.depositApprovers.push(depositApprover)
      })
    }
    
    if (this.disabled) {
      this.biddingApprovalInfo.disable()
    }
  }

  initApproverList() {
    this.resetApprovers()
    const { applicant, cycleGroup, bigArea, smallArea, marketBundles } = this.applyDetail
    const baseParams = {
      initiatorEmail: applicant,
      initiatorRole: 'Sales Rep/Mgr',
      initiatorCycleGroup: cycleGroup,
      initiatorBigArea: bigArea,
      initiatorModality: 'PD&IGT',
      initiatorSmallArea: smallArea,
    }
    marketBundles.forEach(({ bmc, modality }) => {
      // 投标保证金审批人 => Cluster BP
      if (!this.bondAmountApprovers[bmc]) {
        this.bondAmountApprovers[bmc] = []
        this.biddingV3Service.findApprover({
          ...baseParams,
          approverRole: 'Cluster BP',
          productBmc: bmc
        }).subscribe(({ data }) => {
          this.bondAmountApprovers[bmc] = data
          const depositApprover = this.createApprover(bmc)
          if (data.length === 1) {
            const [{ approverEmail, approverName }] = data
            depositApprover.patchValue({
              name: approverName,
              email: approverEmail
            })
          }
          if (this.disabled) {
            depositApprover.disable()
          }
          this.depositApprovers.push(depositApprover)
        })
      }

      // 技术条款审批人 => Product Sales
      if (!this.specTermApprovers[bmc]) {
        this.specTermApprovers[bmc] = []
        const data = {
          ...baseParams,
          approverRole: modality === 'PD&IGT' ? 'Product Sales' : 'Product Manager',
          productBmc: bmc
        }
        this.bmcRoleMap.set(bmc, data.approverRole)
        this.biddingV3Service.findApprover(data).subscribe(({ data }) => {
          this.specTermApprovers[bmc] = data
          const technicalApprover = this.createApprover(bmc)
          if (data.length === 1) {
            const [{ approverEmail, approverName }] = data
            technicalApprover.patchValue({
              name: approverName,
              email: approverEmail
            })
          }
          if (this.disabled) {
            technicalApprover.disable()
          }
          this.technicalApprovers.push(technicalApprover)
        })
      }
    })
  }

  onApproverChange(type, bmc, approverGroup, email) {
    const approvers = type === 'bondAmount' ? this.bondAmountApprovers[bmc] : this.specTermApprovers[bmc] 
    if (approvers) {
      const approver = approvers.find(({ approverEmail }) => approverEmail === email)
      if (approver) {
        const { approverName } = approver
        approverGroup.patchValue({
          name: approverName,
        })
      }
    }
  }

  handleAction(action) {
    this.remarkMsgVisible = false
    const { processComments } = this.biddingApprovalInfo.getRawValue();
    if (action === 'rejected' && (!processComments || !processComments.trim())) {
      this.message.warning('请填写拒绝理由')
      this.remarkMsgVisible = true
      return
    }

    if (this.ddpDateExpired) {
      this.modalService.confirm({
        nzTitle: "<h4>提醒</h4>",
        nzContent: `经销商DDP有效日期为${this.applyDetail.distributorDdpDate}，当前已过有效期，是否确认审批通过？`,
        nzOnOk: () => {
          this.onSubmit(action);
        },
      });
    } else {
      this.onSubmit(action)
    }
  }

  onSubmit(action) {
    const { 
      isNonStandard,
      paymentTermsApproval, // 付款方式审批
      specificationTermsApproval, // 技术条款审批
      logisticTermsApproval, // 物流条款
      legalTermsApproval,
      afterSaleTermsApproval, // 售后维修条款审批
      bondAmountTermsApproval, // 投标保证金及履约保证金额审批
      technicalApprovers,
      depositApprovers,
      processComments,
      processAttachmentIds,
    } = this.biddingApprovalInfo.getRawValue();
    this.remarkMsgVisible = false

    const { id, applyId, businessModel, nonStandard } = this.applyDetail;
    const data: any = {
      id,
      applyId,
      processInstanceTaskId: this.taskId,
      businessModel,
      processComments,
      processAttachmentIds: processAttachmentIds
        ? processAttachmentIds.map(({ fileId }) => fileId)
        : [],
      nonStandard,
      action,
    };
    if (businessModel === BUSINESS_MODEL_DIRECT && action === 'approved') {
      data.nonStandard = {
        ...nonStandard,
        isNonStandard: isNonStandard ? 1 : 0,
        paymentTermsApproval: paymentTermsApproval ? 1 : 0,
        specificationTermsApproval: specificationTermsApproval ? 1 : 0,
        logisticTermsApproval: logisticTermsApproval ? 1 : 0,
        legalTermsApproval: legalTermsApproval ? 1 : 0,
        afterSaleTermsApproval: afterSaleTermsApproval ? 1 : 0,
        bondAmountTermsApproval: bondAmountTermsApproval ? 1 : 0,
      };
      if (bondAmountTermsApproval) {
        this.depositApprovers.controls.forEach((depositApprover) => {
          depositApprover.markAsDirty()
          depositApprover.updateValueAndValidity()
        })
        if (this.depositApprovers.invalid) {
          this.message.error('请补充投标保证金及履约保证金额审批人')
          return
        }
        data.depositApprovers = depositApprovers
      }
      if (specificationTermsApproval) {
        this.technicalApprovers.controls.forEach((technicalApprover) => {
          technicalApprover.markAsDirty()
          technicalApprover.updateValueAndValidity()
        })
        if (this.technicalApprovers.invalid) {
          this.message.error('请补充技术条款审批人')
          return
        }
        data.technicalApprovers = technicalApprovers
      }
    }

    if (action === 'approved') {
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

      if (businessModel !== BUSINESS_MODEL_DIRECT) {
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
    }

    this.biddingV3Service.setPageLoading(true)
    this.biddingV3Service.approve(data).subscribe(({ code }) => {
      if (code === '0000') {
        this.message.success("审批成功!");
        this.biddingV3Service.goTodoPage()
      } else {
        this.message.error("审批失败!");
      }
      this.biddingV3Service.setPageLoading(false)
    }, () => {
      this.message.error("审批失败!");
      this.biddingV3Service.setPageLoading(false)
    });
  }
}
