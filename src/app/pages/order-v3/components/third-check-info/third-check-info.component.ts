import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileService, HttpService } from '@core/services';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
import * as moment from 'moment'
import { saveAs } from "file-saver";
import { fomatFloat } from '@core/util/tools';

@Component({
  selector: 'ecos-thirdcheck-info',
  templateUrl: './third-check-info.component.html',
  styleUrls: ['./third-check-info.component.scss']
})
export class ThirdCheckInfoComponent implements OnInit {

  constructor(public activatedRouter: ActivatedRoute, private message: NzMessageService, private fb: FormBuilder, private http: HttpService,
    private fileService: FileService,) { }
  @Input() applyId:string;
  @Input() cpDealId:any="";
  @Input() dealFormId:any="";
  @Input() formValue: FormGroup;
  dateFormat = 'yyyy-MM-dd HH:mm:ss';
  thirdPartyList: any = [];
  load: any = false;
  saveRequired = true
  noticeRequired = false
  auditFileRequired = false
  isVisible = false
  noticeType = 'upload' // 通知经销商上传核查材料-upload 通知经销商补充核查材料-replenish
  noticeTitle = ''
  partyStatus = 'none'
  esCnyStr = "";
  noticeForms = {
    orderCode: null, // 经销商下单ID(订单需求编号)
    dealFormId: null,
    dealerEmail:  null,
    salesEmail: null,
    dmEmail:  null,
    comments: null,
  }
  CPSummary = {
    //CP Deal ID
    id:null,
    //三方风险等级
    thirdPartyRisk:null,
    //三方风险等级变化
    thirdPartyChange:null,
    /* S&S三方风险等级(从CP来) */
    ssPriceRisk:null,
    /* S&S三方风险等级变化 */
    ssPriceRiskChange:null,
    /* Sales三方风险等级(从CP来) */
    salesPriceRisk:null,
    /* Sales三方风险等级变化 */
    salesPriceRiskChange:null,
    /* 待经销商补充申请材料(pending_delaer)/待经销商补充核查材料(pending_delaer_audit)/待销售补充申请材料(pending_sales)/无更新(none) */
    thirdPartyStatus:null,
    /* 是否需要核查（从COS来） */
    requireVerification:null,
    /* 核查材料提交时间（从COS来） */
    materialSubmissionTime:null,
    /* 核查要求（从COS来） */
    verificationRequirements:null,
    cpDealPurchaseList:[]
  }

  get baseInfoFrom(): FormGroup {
    return this.formValue.get("baseInfoFrom") as FormGroup;
  }
  get biddingAwardPriceModel()
  {
      const {biddingAwardPrice,biddingAwardCurrency}=this.baseInfoFrom.getRawValue();
      let biddingPrice=fomatFloat(biddingAwardPrice,2)
      if(biddingAwardPrice!=null&&biddingAwardPrice!=""&&biddingAwardPrice!=undefined)
      {
        return `${biddingPrice}`
      }
      else{
        return ""
      }
  }
  get rate(){
    let esCny = this.esCny || 0
    if(esCny == 0) return 0
    if(!this.CPSummary) return 0
    let sum = this.CPSummary.cpDealPurchaseList.reduce((pre,next)=>{
      return pre+(next.verifyCny*next.quantity)
    },0)
    return sum/esCny
  }
  public formData: FormGroup = this.fb.group({
    id: [],
    detailId:[],
    tpcId: [],
    needThirdPartyAudit: [{ value: false, disabled: true }], // 是否需要三方核查
    checkDurationId: [{ value: null, disabled: true }], // 抽查周期
    dealFormId: [{ value: null, disabled: true }], // Deal Form ID
    orderCode: [{ value: null, disabled: true }], // 订单需求编号
    icfRegistrationTime: [{ value: null, disabled: true }], // ICF登记时间
    icfSignTime: [{ value: null, disabled: true }], // ICF签署时间
    dealerProvideMaterialDeadline: [{ value: null, disabled: true }], // 需要经销商提供核查的材料截止时间（签署时间+3个月）
    isOverdue: [{ value: false, disabled: true }], // 经销商是否超期提供核查材料
    auditReport: [{ value: [], disabled: false }], // 核查报告
    auditReportUploadTime: [{ value: null, disabled: false }], // 核查报告上传时间
    dealerProvideMaterialRealtime: [{ value: null, disabled: true }], // 经销商提供核查的材料实际时间
    auditStartTime: [{ value: null, disabled: true }], // 开始三方核查时间
    auditComments: [{ value: null, disabled: false }], // 三方核查要求备注
    auditAttachment: [{ value: null, disabled: false }], // 三方核查要求附件
    dealerDelayTime: [{ value: null, disabled: false }], // dealer_delay_time
    oaAuditEndTime: [{ value: null, disabled: true }], // OA完成核查时间
    cpAuditTotalPrice: [{ value: null, disabled: true }], // CP系统审核完成的三方审核总价
    cosAuditTotalPriceExclude: [{ value: null, disabled: false }], // COS实际核查总三方价格含税（不含未评估三方）
    // Deviation Percentage（不含未评估三方）：系统计算= 【COS实际核查总三方价格含税（不含未评估三方）- CP评估三方总价】(结果取绝对值）/ CP评估三方总价
    deviationPercentageExclude: [{ value: null, disabled: true }],
    cosAuditTotalPriceInclude: [{ value: null, disabled: false }], // COS实际核查总三方价格含税（含未评估三方）
    // Deviation Percentage （含未评估三方）：系统计算= 【COS实际核查总三方价格含税（含未评估三方）- CP评估三方总价】(如差值为负数-结果取绝对值，如差异为正数-结果为0）/ CP评估三方总价​
    deviationPercentageInclude: [{ value: null, disabled: true }],
    deviationTypeExclude: [{ value: null, disabled: false }], // Deviation 类型（不含未评估三方）
    deviationTypeInclude: [{ value: null, disabled: false }], // Deviation 类型（含未评估三方）
    auditStatus: [{ value: null, disabled: false }], // 三方核查状态
    oaAuditComments: [{ value: null, disabled: false }], // OA三方核查备注
    oaAuditAttachments: [{ value: null, disabled: false }], // OA三方核查备注附件
    processStatus: [{ value: null, disabled: true }],
    auditFiles: [{ value: [], disabled: false }], // 核查报告
    esCny: [{ value: null, disabled: true }], // ES CNY
    esCnyNet: [{ value: null, disabled: true }], // ES CNY Net
    esUsd: [{ value: null, disabled: true }], // ES USD
  })

  public partyStatusOpt = [
    {label: '待经销商补充申请材料', value: "pending_dealer"},
    {label: '待经销商补充核查材料', value: "pending_dealer_audit"},
    {label: '待销售补充申请材料', value: "pending_sales"},
    {label: '无更新', value: "none"},
  ]

  public deviationTypes = [
    "Non Significant differences", "Significant differences", "Serious circumstances"
  ]

  public checkStatus = [
    "按时完成核查（无差异）",
    "按时完成核查（有差异）",
    "超期未提供文件[系统判断，可人工修改]",
    "期限内跟催中[系统判断，可人工修改]",
    "延期完成核查（无差异）",
    "延期完成核查（有差异）",
    "暂未签署ICF[系统判断，可人工修改]",
  ]
  get esCny(){
    if(this.esCnyStr == null || this.esCnyStr == '') return 0
    else{
      return Number(this.esCnyStr.replace(/,/g, ''))
    }
  }
  ngOnInit() {
    this.queryDetails(this.applyId)
  }

  queryDetails(applyId) {
    this.load = true
    this.http.post(`/act/ecos/thirdParty/detail/${applyId}`).subscribe((res => {
      if (res.code === '0000') {
        const data = res.data;
        this.formData.patchValue({
          ...data,
          icfRegistrationTime: data.icfRegistrationTime?moment(new Date(data.icfRegistrationTime)).format('YYYY-MM-DD'):null,
          dealerProvideMaterialDeadline: data.dealerProvideMaterialDeadline?moment(new Date(data.dealerProvideMaterialDeadline)).format('YYYY-MM-DD'):null,
          dealerProvideMaterialRealtime: data.dealerProvideMaterialRealtime?moment(new Date(data.dealerProvideMaterialRealtime)).format('YYYY-MM-DD'):null,
          icfSignTime: data.icfSignTime?moment(new Date(data.icfSignTime)).format('YYYY-MM-DD'):null,
          auditAttachment: data.auditAttachment ? JSON.parse(data.auditAttachment) : [],
          oaAuditAttachments: data.oaAuditAttachments ? JSON.parse(data.oaAuditAttachments) : [],
        })

        this.load = false;
        this.queryCPSummary(res.data.dealFormId)
      } else {
        this.message.create('error', `${res.msg}`);
        this.load = false;
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "服务器异常")
    }));
  }

  queryCPSummary(dealFormId) {
    this.load = true
    this.http.post(`/act/ecos/thirdParty/cp2/queryThirdParty/${dealFormId}`).subscribe((res => {
      if (res.code === '0000') {
        let data = res.data
        let riskArr = [data.salesPriceRisk,data.ssPriceRisk,data.thirdPartyRisk]
        console.log('data',data)
        console.log('riskArr',riskArr)
        riskArr = riskArr.filter(item => item)
        let risk = null;
        if(riskArr.length>0)
          risk = riskArr[riskArr.length-1]
        console.log('risk',risk)

        const {esCny,esCnyNet,esUsd} = data
        this.formData.patchValue({
          esCny: esCny?esCny:null,
          esCnyNet: esCnyNet?esCnyNet:null,
          esUsd: esUsd?esUsd:null,
        })
        this.esCnyStr = esCny?esCny:null

        this.CPSummary = data;
        this.CPSummary.thirdPartyRisk = risk
        this.CPSummary = {
          ...this.CPSummary,
          materialSubmissionTime: res.data.materialSubmissionTime?moment(new Date(res.data.materialSubmissionTime)).format('YYYY-MM-DD'):null,
        }
        this.partyStatus = res.data.thirdPartyStatus? res.data.thirdPartyStatus: 'none'
        if (this.partyStatus != 'none') {
          this.formData.get('auditComments').disable()
          this.formData.get('auditAttachment').disable()
        }
        this.load = false;
      } else {
        this.message.create('error', `${res.msg}`);
        this.load = false;
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "服务器异常")
    }));
  }

  setNoticeValid() {
    this.clearFormVaild()
    this.saveRequired = false
    this.noticeRequired = true
    this.auditFileRequired = false
    this.formData.get('auditComments')!.setValidators(Validators.required);
    this.formData.get('auditAttachment')!.setValidators(Validators.required);
  }

  clearFormVaild() {
    for (let i in this.formData.controls) {
      this.formData.controls[i].clearValidators()
      this.formData.controls[i].markAsPristine()
    }
  }

  resetRequired() {
    this.saveRequired = true
    this.noticeRequired = false
    this.auditFileRequired = false
  }

  resetNotice() {
    const { orderCode, dealFormId } = this.formData.getRawValue()
    this.noticeForms = {
      orderCode: orderCode,
      dealFormId: dealFormId,
      dealerEmail:  null,
      salesEmail: null,
      dmEmail:  null,
      comments: null,
    }
  }

  handleCancel() {
    this.resetNotice()
    this.isVisible = false
  }

  async showNoticeModel(val) {
    this.resetNotice()
    const { orderCode, dealFormId } = this.formData.getRawValue()
    await this.queryOperator(dealFormId)

    if(val == 1) {
      this.setNoticeValid()
      const valid = this.checkFormData(this.formData);
      if (!valid) {
        return
      }
      this.noticeType = 'upload'
      this.noticeTitle = '通知经销商上传核查材料'
      this.isVisible = true
    } else if(val == 2){
      this.noticeType = 'replenish'
      this.noticeTitle = '通知经销商补充自采三方核查材料'
      this.isVisible = true
    } else if(val == 3){
      this.noticeType = 'locked'
      this.noticeTitle = '通知经销商需要被核查'
      this.isVisible = true
    }
  }

  queryOperator(dealFormId) {
    this.load = true;
    this.http.get(`/act/ecos/thirdParty/cp2/queryOperator?dealFormId=${dealFormId}`).subscribe((res => {
      this.load = false;
      if (res.code === '0000') {
        const operator = res.data
        this.noticeForms.dealerEmail = operator ? operator.operatorEmail : null
        this.noticeForms.salesEmail = operator ? operator.salesEmail : null
        this.noticeForms.dmEmail = operator ? operator.dmEmail : null
      } else {
        this.message.create('error', `${res.msg}`);
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "服务器异常")
    }));
  }

  noticeFormsVaild() {
    if (!this.noticeForms.dealerEmail || !this.noticeForms.salesEmail || !this.noticeForms.dmEmail) {
      return true
    }
    if (this.noticeType === 'replenish' && !this.noticeForms.comments) {
      return true
    }
    return false
  }

  handleOk = async() => {
    const vaild = this.noticeFormsVaild()
    if (vaild) {
      this.message.create("error", "请填写必填字段！")
      return
    }

    if (this.noticeType === 'upload') {
      await this.noticeDealerUploadFile()
    } else if (this.noticeType === 'replenish') {
      await this.noticeDealerReplenishFile()
    } else if (this.noticeType === 'locked') {
      await this.noticeDealerLocked()
    }
    this.isVisible = false
  }

  // 通知经销商上传核查材料
  noticeDealerUploadFile() {
    this.load = true
    let data = this.formData.getRawValue()
    const { tpcId, dealFormId, auditComments, auditAttachment } = data

    const files = auditAttachment.map(file => ({
      fileId: file.fileId,
      name: file.name
    }));

    const jsonString = JSON.stringify(files)
    const parmas = {
      ...this.noticeForms,
      auditComments: auditComments,
      auditAttachment: jsonString,
    }

    this.http.post(`/act/ecos/thirdParty/oaApproval/detail/notify/${tpcId}/${dealFormId}`, parmas).subscribe((res => {
      if (res.code === '0000') {
        this.resetRequired()
        this.message.create("success", "操作成功！")
        this.load = false;
        this.queryDetails(this.applyId)
      } else {
        this.message.create('error', `${res.data}`);
        this.load = false;
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "服务器异常")
    }));

  }
  // 通知经销商需要被核查
  noticeDealerLocked(){
    this.load = true
    let data = this.formData.getRawValue()
    const { detailId, tpcId, dealFormId, auditComments, auditAttachment } = data
    const parmas = {
      ...this.noticeForms,
      id: detailId
    }
    console.log('detailId',detailId)
    console.log('parmas',parmas)
    this.http.post(`/act/ecos/thirdParty/randomPick/detail/notify/${tpcId}`, [parmas]).subscribe((res => {
      if (res.code === '0000') {
        this.resetRequired()
        this.message.create("success", "操作成功！")
        this.load = false;
        this.queryDetails(this.applyId)
      } else {
        this.message.create('error', `${res.data}`);
        this.load = false;
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "服务器异常")
    }));

  }

  // 通知经销商补充核查材料
  noticeDealerReplenishFile() {
    this.load = true
    let data = this.formData.getRawValue()
    const { tpcId, dealFormId } = data

    const parmas = {
      ...this.noticeForms,
    }

    this.http.post(`/act/ecos/thirdParty/oaApproval/detail/notifySupply/${tpcId}/${dealFormId}`, parmas).subscribe((res => {
      if (res.code === '0000') {
        this.resetRequired()
        this.message.create("success", "操作成功！")
        this.load = false;
        this.queryDetails(this.applyId)
      } else {
        this.message.create('error', `${res.data}`);
        this.load = false;
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "服务器异常")
    }));

  }

  checkFormData = (paramForm) => {
    for (const i in paramForm.controls) {
      paramForm.controls[i].markAsDirty();
      paramForm.controls[i].updateValueAndValidity();
    }
    return paramForm.valid;
  };

  setAuditFileValid() {
    this.clearFormVaild()
    this.saveRequired = false
    this.noticeRequired = false
    this.auditFileRequired = true
    this.formData.get('auditFiles')!.setValidators(Validators.required);
  }

  syncAuditFileThirdParty() {
    this.setAuditFileValid()
    const valid = this.checkFormData(this.formData);
    if (!valid) {
      this.message.create('error', `请先上传核查报告！`);
      return
    }

    this.load = true
    this.http.post(`/act/ecos/thirdParty/auditReport/sync/${this.applyId}`).subscribe((res => {
      if (res.code === '0000') {
        this.resetRequired()
        this.message.create("success", "操作成功！")
        this.load = false;
        this.queryDetails(this.applyId)
      } else {
        this.message.create('error', `${res.msg}`);
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "服务器异常")
    }));
  }
  downloadAuditTemplate(){

    let data = this.formData.getRawValue()
    const { tpcId, dealFormId } = data
    this.http.postDownload(`/act/push/cp/thirdparty/exportThirdpartyOaCheckReport?dealFormId=${dealFormId}`).subscribe(res => {
          this.fileService.downloadResponse('OA三方核查模板', res);
    })
  }
  downloadDealerAuditTemplate(){

    let data = this.formData.getRawValue()
    const { tpcId, dealFormId } = data
    this.http.postDownload(`/act/push/cp/thirdparty/exportThirdpartyDealerCheckReport?dealFormId=${dealFormId}`).subscribe(res => {
          this.fileService.downloadResponse('经销商自查表', res);
    })
  }

  setSaveValid() {
    this.clearFormVaild()
    this.saveRequired = true
    this.noticeRequired = false
    this.auditFileRequired = false
    this.formData.get('cosAuditTotalPriceExclude')!.setValidators(Validators.required);
    this.formData.get('cosAuditTotalPriceInclude')!.setValidators(Validators.required);
  }

  public saveFormData() {
    this.setSaveValid()
    const valid = this.checkFormData(this.formData);
    if (valid) {
      console.log("提交保存");

      const data = this.formData.getRawValue()
      const { auditAttachment, oaAuditAttachments } = data

      let auditAttachStr = ""
      let oaAuditAttachStr = ""
      // 文件转为json存贮
      if (auditAttachment && auditAttachment.length > 0) {
        const auditAtts = auditAttachment.map(file => ({
          fileId: file.fileId,
          name: file.name
        }));
        auditAttachStr = JSON.stringify(auditAtts)
      }
      if (oaAuditAttachments && oaAuditAttachments.length > 0) {
        const oaAuditAtts = oaAuditAttachments.map(file => ({
          fileId: file.fileId,
          name: file.name
        }));
        oaAuditAttachStr = JSON.stringify(oaAuditAtts)
      }

      const parmas = {
        ...data,
        auditAttachment: auditAttachStr ? auditAttachStr : null,
        oaAuditAttachments: oaAuditAttachStr ? oaAuditAttachStr : null,
        auditFiles: null,
      }

      this.load = true
      this.http.post(`/act/ecos/thirdParty/doOaApprovalSave`, parmas).subscribe((res => {
        if (res.code === '0000') {
          this.message.create('success', `保存成功！`);
          this.load = false;
          this.queryDetails(this.applyId)
        } else {
          this.message.create('error', `${res.msg}`);
          this.load = false;
        }
      }), (error => {
        this.load = false;
        this.message.create("error", "服务器异常")
      }));
    }
  }

  getFileNames(jsonString) {
    if (!jsonString) {
      return ''
    }
    const fileList = JSON.parse(jsonString)
    if (Array.isArray(fileList)) {
      const nameString = fileList.map(file => file.name).join(', ')
      return nameString ? nameString : ''
    }
    return ''
  }
  getJsonArr(jsonString) {
    if (!jsonString) {
      return []
    }
    return JSON.parse(jsonString)
  }
}
