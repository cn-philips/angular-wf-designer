import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { CpVerifyComponent } from "../../cp-verify/cp-verify.component";
import { BiddingV3Service } from '../../../bidding-v3.service';
import { BUSINESS_MODEL_DIRECT } from "../../../bidding-v3.constants";

@Component({
  selector: 'bidding-v3-auth-approval',
  templateUrl: './auth-approval.component.html',
  styleUrls: ['./auth-approval.component.scss']
})
export class AuthApprovalComponent implements OnChanges {
  @Input() disabled = false
  @Input() taskId
  @Input() grantAuthApprovalInfo: FormGroup
  @Input() biddingForm: FormGroup
  @Input() applyDetail = {
    id: null,
    applyId: null,
    applicant: null,
    dataSource: null,
    businessModel: null,
    biddingNumber: null,
    hospitalName: null,
    hospitalId: null,
    bidderName: null,
    bidderRegistAddress: null,
    cpVerifyRequired: null,
    authorizationFiles: null,
    exportControlFiles: null,
    pvPaymentCode: null,
    authorizationOtherFiles: null,
    distributorDdpDate: null,
    otherBiddingNumber: [],
  }
  @Input() ddpDateExpired = false
  @Output() activeTab = new EventEmitter<string>()
  @ViewChild('cpVerify') cpVerify: CpVerifyComponent

  templatePreviewerVisible = false
  templateParams = {}

  remarkMsgVisible = false

  BUSINESS_MODEL_DIRECT = BUSINESS_MODEL_DIRECT

  constructor(
    private message: NzMessageService,
    public biddingV3Service: BiddingV3Service,
    private modalService: NzModalService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.applyDetail) {
      const { previousValue, currentValue } = changes.applyDetail
      if ((!previousValue || !previousValue.id) && currentValue.id) {
        this.init()
        console.log(changes.applyDetail);
      }
    }
  }

  init() {
    if (this.disabled) {
      this.initGrantAuthApprovalInfo()
    } else {
      const { dataSource, businessModel } = this.applyDetail
      const cpVerifyRequired = this.grantAuthApprovalInfo.get('cpVerifyRequired') as FormControl
      cpVerifyRequired.patchValue(0)
      if (!(dataSource === 'CP Simulation' && businessModel === BUSINESS_MODEL_DIRECT)) {
        cpVerifyRequired.disable()
      }
    }
  }

  initGrantAuthApprovalInfo() {
    const { cpVerifyRequired, authorizationFiles, exportControlFiles, pvPaymentCode, authorizationOtherFiles } = this.applyDetail
    this.grantAuthApprovalInfo.patchValue({
      cpVerifyRequired,
      authorizationFiles,
      exportControlFiles,
      pvPaymentCode,
      authorizationOtherFiles,
    })
    this.grantAuthApprovalInfo.disable()
  }

  onShowTemplatePreviewer(code) {
    const {
      biddingNumber,
      hospitalName,
      bidderName,
      bidderRegistAddress,
    } = this.applyDetail
    // SQSQH  9-4制造商出具的授权函-苏州格式-05281300
    const today = new Date();
    const params: any = {};
    params.templateCode = code;
    params.agentReceiver = localStorage.getItem("ecom_ng_philips_code1");
    params.biddingComRegAddress = bidderRegistAddress; // 投标公司地址
    params.biddingCompany = bidderName; // 招标公司名称
    params.tenderingCompany = bidderName; // 投标公司名称
    params.tenderingCompand = bidderName; // 投标公司名称
    params.HospitalName = hospitalName;
    params.tenderNo = biddingNumber;
    params.opportunityDate =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    params.date1 =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();

    params.biddingCompany = bidderName;
    params.dataList = "";
    params.paymentList = "";
    params.productInformations = "";
    params.paymentDescription = "";
    params.region = "";
    params.BMClist = "";
    params.BMCExpert = "";
    params.AppExpert = "";
    params.distributorAgreement = "";
    params.distributorAgreementList = "";
    this.templateParams = params;
    this.templatePreviewerVisible = true;
  }

  showCpVerifyDialog() {
    this.cpVerify.show(this.applyDetail)
  }

  handleAction(action) {
    this.remarkMsgVisible = false
    const { processComments } = this.grantAuthApprovalInfo.getRawValue()
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
    const { id, applyId, businessModel } = this.applyDetail;

    const grantAuthApprovalInfo = this.grantAuthApprovalInfo.getRawValue()
    const data = {
      id,
      applyId,
      businessModel,
      processComments: grantAuthApprovalInfo.processComments,
      processInstanceTaskId: this.taskId,
      action,
      ...grantAuthApprovalInfo
    }
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

    for(const i in this.grantAuthApprovalInfo.controls) {
      this.grantAuthApprovalInfo.controls[i].markAsDirty()
      this.grantAuthApprovalInfo.controls[i].updateValueAndValidity()
    }
    if (this.grantAuthApprovalInfo.invalid) {
      this.message.error('请按要求填写表单信息')
      return
    }


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
    });
  }
}
