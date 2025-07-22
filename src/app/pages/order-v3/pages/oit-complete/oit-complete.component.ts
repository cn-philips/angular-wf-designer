import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { OrderV3Service } from "../../order-v3.service";
import { Router, ActivatedRoute } from '@angular/router';
import { stringIndexof, delcommafy, clearSpaces, standardTime, isadopt } from "@core/util/tools"
import {
  FormBuilder,
  FormGroup,
  FormControl,
  FormArray,
  Validators,
} from "@angular/forms";
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import * as moment from 'moment'
import { Location } from '@angular/common';
import { BreadcrumbService } from "@app/modern-themes/services/breadcrumb.service";
import { ProcessTaskStatusPipe } from "@app/shared/pipes/process-task-status.pipe"
import { HttpService } from '@core/services';
import { RouterExtendService } from "@app/modern-themes/services/router-extend.service";
import { Subject } from "rxjs";
@Component({
  selector: "oit-complete",
  templateUrl: "./oit-complete.component.html",
  styleUrls: ["./oit-complete.component.scss"],
})
export class OitcompleteComponent implements OnInit {
  constructor(private serveice: OrderV3Service,
    private location: Location,
    private activatedRouter: ActivatedRoute,
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router,
    private modalService: NzModalService,
    private ProcessTaskStatusPipe: ProcessTaskStatusPipe,
    private breadCrumbService: BreadcrumbService,
    private http: HttpService,
    private routerExtend: RouterExtendService
  ) { }
  subTierSubject = new Subject()
  public changeItem: any = false;
  public activedId: any = "pending-oit";
  public tabIndex: any = 0;
  public editBase: any = false; //基础信息是否编辑
  public editable: any = false; //基础信息是否编辑
  public editPreTable: any = false; //基础信息的产品是否可以编辑
  public editCurr: any = true; //当前选是否可编辑
  public completionInfo: any //oit完成
  public contractSignInfo: any  //合同签署
  public orderSummaryInfo: any //order summary层级
  public applyId;
  public status;
  public processInstanceTaskId;
  public procInstId;
  public pageLoading: boolean = false;
  public flag;
  public allowChangOrder: any;
  public needFileType; // 待补充文件类型 'contract'-待上传正本合同 ，'oit'-OIT文件待补充，'om'-待OM上传SO#，'third'-第三方自采核查，'winningbid'-中标确认文件待补充
  public needFileTypeOff: boolean = false;
  public thirdSave: boolean = false;
  public changeOrderOff: boolean = false;
  public needFileTypeShowOff: boolean = false; //是否可以查看om文件
  public changeName;
  public tabList = ['contract-tab', 'summary-tab', 'complete-tab', 'oit-tab', 'approval-record'];
  public isHandle: any;
  public isThirdParty : boolean;
  public isLegancy: boolean;
  public paymentProvisionList = [
    // "10% TT before OIT, 80% TT before FP, 10% TT against AC",
    // "10% TT before OIT, 90% TT before FP",
    // "15% TT before OIT, 85% before FP",
    // "30% TT before OIT, 60% TT before FP, 10% TT against ICF",
    // "100% TT before OIT",
    // "100% LC before OIT",
    // "30%TT before OIT, 70% TT before FP",
    "30% TT before OIT, 70% before shipment",
    "100% TT before OIT",
    "100% LC before OIT",
    "(non-stock)15% TT before OIT, 85% before FP",
    "(Stock)15% TT before OIT, 85% TT within 90 days after contract signed",
    "10% TT before OIT, 80% TT/LC before FP, 10% TT against AC(民营)",
    "15% TT before OIT, 85% before FP",
    "10% TT before OIT, 90% before FP(超千万PO)",
    "30% TT before OIT, 60% TT before FP, 10% TT against ICF(CVI)",
    "100% LC before OIT(MOS)",
    "30%TT before OIT, 70% TT before FP(MOS)",
  ];

  public isRaisedFlow:boolean = false; //是否是raised flow
  //改单申请上一次的so
  lastSo: any = {
    isExist: false,
    lastSo: null
  };

  remarkFrom = {
    comments: [{ value: null, disabled: false }, [Validators.required]],
    attachmentIds: [],
  }
  //改单的备注信息
  changOrderFrom = {
    cancelApplyId: [{ value: "", disabled: false }], //取消改单的id
    reason: [{ value: "", disabled: false }, [Validators.required]], //改单原因
    describes: [{ value: "", disabled: true }, []],//改单原因描述
    changeOrderFile: [[]],//附件
    supportRemark: [{ value: "", disabled: false }], //备注
    changeDealForm: [{ value: null, disabled: false }],//需要更改Deal Form进单
    orderChangeId: [{ value: "", disabled: false }], //审批id
  }

  priceData: any = {}
  contractFile: any
  //改单的审核
  examineFrom = {
    comments: [{ value: "", disabled: false }], //备注
    attachmentIds: [[]],//附件
  }
  /**
   * oit完成
   */
  oitInform = {
    id: [{ value: null, disabled: true }],
    applyId: [{ value: null, disabled: true }],
    actualSalesEmail: [{ value: null, disabled: true }],
    orderDiscount: [{ value: null, disabled: !this.editCurr }],
    isSpecialOfferOrder: [{ value: null, disabled: !this.editCurr }],//否已特价单
    isSpecialOfferDocument: [{ value: null, disabled: !this.editCurr }],//否已提供特价文件
    downPaymentTime: [{ value: null, disabled: !this.editCurr }],
    downPaymentAmount: [{ value: null, disabled: !this.editCurr }],
    parentApplyId: [{ value: null, disabled: true }],
    specialApprovalSupporting: [{ value: null, disabled: true }],//需要后补特批支持文件
    productVerification: [{ value: null, disabled: true }],//是否经销商第三方产品核查
    omEmail: [{ value: null, disabled: !this.editCurr }, [Validators.required]], //需发送邮件的物流专员
    omName: [{ value: null, disabled: true }, [Validators.required]],//需发送邮件的物流专员名称
    oitDate: [{ value: null, disabled: !this.editCurr }, [Validators.required]], //进单时间
    remark: [{ value: null, disabled: !this.editCurr }],//备注
    speciallySupportingFileName: [{ value: null, disabled: false }], //特批缺失支持文件名称
    exportControlFile: [[], [Validators.required]], //出口管制文件
    otherFile: [[]], //其他文件
    oitInformationFile: [[]], //附件
    credentialFile: [[], [Validators.required]],   //oit完成凭证文件
    credentialFileRequired: [{ value: false, disabled: true }],//oit完成凭证文件是否必填
    oaSupplementFile: [{ value: null, disabled: !this.editCurr }],   //缺失文件是否已经补齐
    oitEndSupplementRemark: [{ value: null, disabled: !this.editCurr }], //oit完成后补充备注
    oitEndSupplementFile: [{ value: null, disabled: !this.editCurr }],//oit完成后补充附件
  }
  financialInform = {
    financialScheme: [{ value: '1', disabled: !this.editCurr }], //是否使用金融方案
    financialSchemeName: [{ value: null, disabled: !this.editCurr }], //金融方案名称
    financialSchemeRemark: [{ value: "", disabled: !this.editCurr }],//金融方案备注
    financialSchemeOtherRemark: [{ value: "", disabled: !this.editCurr }],//金融方案其它备注
    lendingBank: [{ value: null, disabled: !this.editCurr }],//贷款行/融资公司名称
    oitFinancialSchemeFile: [[]], //附件
  }
  deBookInform = {
    deBook: [null],
    deBookDate: [null],
    reBook: [null],
    reBookDate: [null],
    cancel: [null], //是否取消
    cancelTime: [null],
    cancelFile: [[]]
  }
  supportingListform = {
    biddingFile: [[]],
    tenderFile: [[]],
    projectAnalysisTable: [[]],
  }

  /**
   * oit完成
   *
   */

  productModelInfo = {
    orderProductModel: [{ value: null, disabled: !this.editBase }],
  }

  baseInfoFrom = {
    dealFormId: [{ value: null, disabled: true }, [Validators.required]],
    referenceId: [{ value: null, disabled: true }],
    contractCancelDisabled: [{ value: null, disabled: true }],

    dealFormModality: [{ value: null, disabled: true }, [Validators.required]],//dealFormModality
    businessModel: [{ value: null, disabled: true }, [Validators.required]], //业务模式
    oitMode: [{ value: null, disabled: !this.editBase }, [Validators.required]], //进单模式
    //prebookApply: [{ value: "0", disabled: !this.editBase }, [Validators.required]], //关联prebook
    dealFormSales: [{ value: null, disabled: true }], //dealfrom创建人
    dealFormSalesName: [{ value: null, disabled: true }],//创建人姓名
    dealFormSalesCycleGroup: [{ value: null, disabled: true }],//Cycle Group
    dealFormSalesModality: [{ value: null, disabled: true }], //dealFormSalesModality创建人
    dealFormSalesBigArea: [{ value: null, disabled: true }, [Validators.required]],//大区
    dealFormSalesSmallArea: [{ value: null, disabled: true }, [Validators.required]], //小区
    dealFormSalesProvince: [{ value: null, disabled: !this.editBase }], //省份
    oldSalesProvince: [{ value: null, disabled: true }],//旧的省份
    dealFormSalesCity: [{ value: null, disabled: !this.editBase }],//城市
    dealFormSalesTeam: [{ value: null, disabled: true }],//deal From team
    approvalAreaConfiguration: [{ value: null, disabled: !this.editBase }, [Validators.required]],//审批区域配置

    biddingType: [{ value: null, disabled: !this.editBase }],//招标类型

    dealFormSalesPerformanceProvince: [{ value: null, disabled: !this.editBase }], //业绩省份
    centralizedPurchasing: [{ value: '0', disabled: !this.editBase }, []],//是否集采项目
    biddingCompany: [{ value: null, disabled: !this.editBase }, [Validators.required]], //投标公司
    tenderNum: [{ value: null, disabled: !this.editBase }, [Validators.required]], //招标编号
    requiredArrivalDate: [{ value: null, disabled: true }],//要求到货日期
    estimateInstallationDate: [{ value: null, disabled: true }], //预计安装日期
    id: [{ value: null, disabled: true }],


    marketBundleInfo: [{ value: [], disabled: !this.editBase }, [Validators.required]], //招标编号
    contractCancelSo: [{ value: null, disabled: true }],//原合同概要表So
    //actuallyDeliveryAddress: [{ value: "", disabled: !this.editBase }],//实际发货地址
    endUserActuallyDeliveryAddress: [{ value: "", disabled: !this.editBase }],//实际发货地址
    includeSolution: [{ value: null, disabled: true }], //是否包含Solution
    orderChapterTradeInNetCny: [{ value: null, disabled: true }],
    orderChapterTradeInCny: [{ value: null, disabled: true }],
    orderChapterTradeInUsd: [{ value: null, disabled: true }],
    orderChapterRebateNetCny: [{ value: null, disabled: true }],
    orderChapterRebateCny: [{ value: null, disabled: true }],
    orderChapterRebateUsd: [{ value: null, disabled: true }],
    estimBiddingPrice: [], //预计投标价
    biddingAwardPrice: [{ value: null, disabled: true }],//中标价格
    biddingAwardCurrency: [{ value: null, disabled: true }],//中标币制
    prebookReferenceId: [{ value: null, disabled: true }, []], //prebook申请号
    prebookApplyId: [{ value: null, disabled: true }],//prebook产品id
    prebookMainId: [],//prebook mainId,
    prebookOrderId: [{ value: null, disabled: true }], //prebookorderid
    prebookStatus: [{ value: null, disabled: true }], //prebook状态
    prebookSo: [{ value: null, disabled: true }],//prebookSo
    prebookQuantity: [{ value: null, disabled: true }], //prebook数量
    ka: [{ value: null, disabled: !this.editBase }],

    orderModality: [{ value: null, disabled: true }],
    orderApprovalAreaConfiguration: [{ value: null, disabled: true }],//order 审批区域配置
    orderSalesTeam: [{ value: null, disabled: true }], //team
    orderSalesBigArea: [{ value: null, disabled: true }], //大区
    orderSalesSmallArea: [{ value: null, disabled: true }], //小区
    orderSalesModality: [{ value: null, disabled: true }],  //modality
    orderSalesProvince: [{ value: null, disabled: true }], //省
    orderSalesPerformanceProvince: [{ value: null, disabled: true }], //业绩省份
    orderSalesCity: [{ value: null, disabled: true }], //市
    orderSales: [{ value: null, disabled: true }],
    orderSalesName: [{ value: null, disabled: true }],
    orderSalesCycleGroup: [{ value: null, disabled: true }], //CycleGroup
    biddingApplyList: [[], []],
    referenceIdList: [[], []],

    solutionSalesEmail: [{ value: null, disabled: true }, []],//solusionSale
    solutionSalesName: [{ value: null, disabled: true }], //solution名称
    solutionSalesNameModel: [{ value: null, disabled: true }],

    actualSalesEmail: [{ value: null, disabled: true }], //实际销售
    actualSalesName: [{ value: null, disabled: true }],//实际销售
    actualSalesNameModel: [{ value: null, disabled: true }],//实际销售名字

    contractCancelApplyId: [{ value: null, disabled: true }], //contractCancelApplyId
    contractCancelReferenceId: [{ value: null, disabled: true }], //原合同概要表id
    contractCancelSoNo: [{ value: null, disabled: true }], //原合同概要表So
    templateList: [[], []],
    isRequired: [{ value: false, disabled: true }],
    orderRequired: [{ value: false, disabled: true }], //order summary 原产地是否必填
    optionDisabled: [{ value: true, disabled: true }],
    currencySystem: [{ value: null, disabled: true }],
    orderSalesSapCode: [{ value: null, disabled: true }], //orderSalesSapCode
    dealIsDisabled: [{ value: false, disabled: true }],//是否显示经销商的按钮
    profitNetRate: [{ value: null, disabled: true }],//经销商净利润
    profitGrossRate: [{ value: null, disabled: true }],//经销商毛利率
    profitGross: [{ value: null, disabled: true }],//经销商毛利润
    dealerProfit: [{ value: null, disabled: true }],//经销商利润
    biddingCurrency: [{ value: null, disabled: true }],//投标币种
  };
  dealerFrom = {
    dealerName: [{ value: null, disabled: true }, [Validators.required]], //经销商名称
    dealerSapCode: [{ value: null, disabled: true },],//经销商sapcode
    dealerCode: [{ value: null }],//经销商dealerCode
    dealerDdpStatus: [{ value: null, disabled: true }], //经销商Status
    dealerDdpValidityDate: [{ value: null, disabled: true }],//经销商ddp有效日期
    dealerContact: [{ value: null, disabled: !this.editBase }, [Validators.required]],//经销商联系人
    dealerPhone: [{ value: null, disabled: !this.editBase }, [Validators.required]],//经销商电话
    dealerEmail: [{ value: null, disabled: !this.editBase }, [Validators.required]],//经销商邮箱
    dealerAddress: [{ value: null, disabled: !this.editBase }, [Validators.required]],//经销商地址
    dealerTaxNum: [{ value: null, disabled: !this.editBase }, [Validators.required]],//经销商纳税号
    purchaseOrderSignatory: [{ value: null, disabled: !this.editBase }], //采购订单签署人
    purchaseOrderSignatoryPosition: [{ value: null, disabled: !this.editBase }],//采购订单签署人职务
    subTierInfo: this.fb.array([]), // 次级经销商信息
    dealerBestSignSignerAccount: [{ value: null, disabled: !this.editBase }, [Validators.required]], // 经销商上上签账号
  }
  accountFrom = {
    accountName: [{ value: null, disabled: !this.editBase }, [Validators.required]],//开户行名称
    bankName: [{ value: null, disabled: !this.editBase }, [Validators.required]],//开户行
    accountNo: [{ value: null, disabled: !this.editBase }, [Validators.required]],//账号
    registrationAddress: [{ value: null, disabled: !this.editBase }, [Validators.required]],//注册地址
    accountPhoneFax: [{ value: null, disabled: !this.editBase }],//电话/传真
    recipient: [{ value: null, disabled: !this.editBase }],//收件人
    recipientPhone: [{ value: null, disabled: !this.editBase }],//收件电话
    taxNum: [{ value: null, disabled: !this.editBase }, [Validators.required]],//税号
    invoicesDeliverAddress: [{ value: null, disabled: !this.editBase }, [Validators.required]], //发票邮寄地址
  }
  contractBuyerFrom = {
    contractBuyer: [{ value: null, disabled: !this.editBase }, [Validators.required]],//合同买方
    contractBuyerSapCode: [{ value: null, disabled: !this.editBase }, [Validators.required]], //合同买方spcode
    contractBuyerTaxNum: [{ value: null, disabled: !this.editBase }, [Validators.required]],//合同买房税号
    contractBuyerAddress: [{ value: null, disabled: !this.editBase }, [Validators.required]],//合同买方地址
    contractBuyerPhone: [{ value: null, disabled: !this.editBase }, [Validators.required]], //合同买方电话
    contractBuyerContact: [{ value: null, disabled: !this.editBase }, [Validators.required]],//合同买方联系人
    contractBuyerEmail: [{ value: null, disabled: !this.editBase }, [Validators.required]],//合同买方邮箱
    contractBuyerSignatory: [{ value: null, disabled: !this.editBase }, [Validators.required]],//合同签署人
    contractBuyerSignatoryPosition: [{ value: null, disabled: !this.editBase }, [Validators.required]],//合同签署人职务
  }
  foreignFrom = {
    foreignTradeCorpSameDealer: [{ value: null, disabled: !this.editBase }],//外贸公司与经销商相同
    foreignTradeCorpSameRelatedDealer: [{ value: null, disabled: !this.editBase }],//外贸公司与经销商关联公司相同
    foreignTradeCorpSapCode: [{ value: null, disabled: !this.editBase },],//外贸公司SAP Code
    foreignTradeCorpDdpStatus: [{ value: null, disabled: true }, [Validators.required]],//外贸公司DDP Status
    foreignTradeCorpDdpValidityDate: [{ value: null, disabled: true }, [Validators.required]],//DDP Status有效日期
    foreignTradeCorpTaxNum: [{ value: null, disabled: !this.editBase }, [Validators.required]],//外贸公司税号
    foreignTradeCorpAddress: [{ value: null, disabled: !this.editBase }, [Validators.required]], //外贸公司地址
    companyNotInIePool: [{ value: null, disabled: true }],//进出口公司选择 不在IE pool
    foreignTradeCorpName: [{ value: null, disabled: !this.editBase }, [Validators.required]], //外贸公司
    foreignTradeCorpPhone: [{ value: null, disabled: !this.editBase }, [Validators.required]],//外贸公司电话
    foreignTradeCorpContact: [{ value: null, disabled: !this.editBase }, [Validators.required]],//外贸公司联系人
    foreignTradeCorpEmail: [{ value: null, disabled: !this.editBase }, [Validators.required]],//外贸公司邮箱
    importAgreementSignName: [{ value: null, disabled: !this.editBase }, [Validators.required]],//进口协议签署人
    importAgreementSignPosition: [{ value: null, disabled: !this.editBase }, [Validators.required]], //进口协议签署人职务
    foreignBestSignSignerAccount: [{ value: null, disabled: !this.editBase }, [Validators.required]], // 外贸公司签字人上上签账号
  }
  endUserFrom = {
    endUser: [{ value: null, disabled: true }, []],//最终终用户
    endUserId: [{ value: null, disabled: true }, []],//最终用户编号
    endUserSapCode: [{ value: null, disabled: true }, []],//最终用户SAP Code
    endUserTaxNum: [{ value: null, disabled: !this.editBase }, [Validators.required]],//最终用户税号
    hospitalType: [{ value: null, disabled: true }],//医院性质
    segment: [{ value: null, disabled: true }],//segment
    endUserActuallyDeliveryAddress: [{ value: null, disabled: !this.editBase }], //最终用户实际发货地址
    endUserAddress: [{ value: null, disabled: !this.editBase }],//最终用户地址
    endUserPhone: [{ value: null, disabled: !this.editBase }, [Validators.required]],//最终用户电话
    endUserEmail: [{ value: null, disabled: !this.editBase }, [Validators.required]],//最终用户邮箱
    endUserContact: [{ value: null, disabled: !this.editBase }, [Validators.required]],//最终用户联系人
    usHta: [{ value: null, disabled: true }], //是否HTA US
  }
  priceApproval = {
    currencySystem: [{ value: null, disabled: true }], //币制
    financialSolution: [{ value: '0', disabled: true }],//是否使用金融方案
    lendingBankCompany: [{ value: null, disabled: true }],//贷款行/融资公司名称
    financialSolutionName: [{ value: null, disabled: true }],//金融方案
    financialSolutionCny: [{ value: null, disabled: true }],//金融方案金额含税
    financialSolutionCnyNet: [{ value: null, disabled: true }],//金融方案金额不含税
    financialSolutionUsd: [{ value: null, disabled: true }],//金融方案美元
    tradeInTotal: [{ value: null, disabled: true }],//tradeInTotal总金额
    rebateTotal: [{ value: null, disabled: true }], //Rebate总额
    totalContractPrice: [{ value: null, disabled: true }], //进单单位合同价
    orderCtpRatio: [{ value: null, disabled: true }], //CTP总价%
    orderCtpPrice: [{ value: null, disabled: true }], //CTP总价
    promotionPlan: [{ value: null, disabled: true }], //促销计划
    warrantyInfo: [{ value: [], disabled: true }], //延长保修
    otherInfo: [{ value: [], disabled: true }], //其它预留
    applicationInfo: [{ value: [], disabled: true }], //其它预留
    sofonNo: [{ value: null, disabled: true }], //final Sofon Quotation
    price: [{ value: null, disabled: true }], //final Sofon Quotation
    paymentCny: [{ value: null, disabled: true }], //其它付款方式不含税费用
    paymentNetCny: [{ value: null, disabled: true }],//其它付款方式含税费用
    paymentUsd: [{ value: null, disabled: true }],//其它付款方式美元费用
    creditCny: [{ value: null, disabled: true }], //远期信用证利息含税价
    creditCnyNet: [{ value: null, disabled: true }],//远期信用证利息不含税价
    creditUsd: [{ value: null, disabled: true }],//远期信用证利息美元
    sofonFile: [{ value: null, disabled: true }], //Sofon Final Quotation and supporting files
    sampleCheck: [{ value: '0', disabled: true }, [Validators.required]], //是否抽样审核
    recycle: [{ value: '0', disabled: true }, [Validators.required]], //是否旧机回收
    vatRate: [{ value: null, disabled: true }], //税率
    dealPriceCny: [{ value: null, disabled: true }], //dealForm总价含税价
    dealPriceCnyNet: [{ value: null, disabled: true }], //dealForm总价不含税价
    dealPriceUsd: [{ value: null, disabled: true }], //dealForm总价美元
    orderChapterTradeInNetCny: [{ value: null, disabled: true }],
    orderChapterTradeInCny: [{ value: null, disabled: true }],
    orderChapterTradeInUsd: [{ value: null, disabled: true }],
    orderChapterRebateNetCny: [{ value: null, disabled: true }],
    orderChapterRebateCny: [{ value: null, disabled: true }],
    orderChapterRebateUsd: [{ value: null, disabled: true }],
    tradeInTotalOS: [{ value: null, disabled: true }],//tradeInTotal总金额
    rebateTotalOS: [{ value: null, disabled: true }], //Rebate总额
    switchValid: [{ value: true, disalbed: true }], //是否禁用sofon文件
    cpDealOrderId: [{ value: "", disabled: true }], //cpDealOrderId
  }

  baseInfoTable = {
    bidWinningFile: [[], []], //中标通知书/最终用户合同
    requestLetter: [[], []], //要货函/场地报告
    solutionSupportReport: [[], []],//项目解决方案售前支持报告
    biddingFile: [[], []],//招标文件
    tenderFile: [[], []],//投标文件
    endUserContract: [[], []],//最终用户合同
    projectAnalysisTable: [[], []], //项目分析表模板
    paymentProvision: [{ value: null, disabled: !this.editBase }],//付款条款
    paymentProvisionFile: [[]],//付款条款文件
    paymentProvisionRemarks: [[]],//付款条款备注
    qualityGuarantee: [{ value: null, disabled: !this.editBase }], //质量保函
    qualityGuaranteeRemarks: [{ value: null, disabled: !this.editBase }], //质量保函备注
    qualityGuaranteeFile: [[]], //质量保函文件
    performanceBond: [{ value: null, disabled: !this.editBase }], //履约保函
    performanceBondFile: [[]],//履约保函文件
    performanceBondRemarks: [[]],//履约保函备注
    afterSalePrice: [{ value: null, disabled: !this.editBase }],  //是否有售后限价
    afterSalePriceFile: [[]],//是否有售后限价文件
    afterSalePriceRemarks: [{ value: null, disabled: !this.editBase }],//是否有售后限价备注
    shipmentDelivery: [{ value: null, disabled: !this.editBase }],  //装运及交货
    shipmentDeliveryFile: [[]], //装运及交货附件
    shipmentDeliveryRemarks: [{ value: null, disabled: !this.editBase }], //装运及交货备注
    installationWarranty: [{ value: null, disabled: !this.editBase }],//安装及保修
    installationWarrantyRemarks: [{ value: null, disabled: !this.editBase }],//安装及保修备注
    installationWarrantyFile: [[]],//安装及保修文件
    installationWarrantySecondaryApproval: [{ value: null, disabled: !this.editBase }],//安装下一级审核 //无
    sitePreparation: [{ value: null, disabled: !this.editBase }], //场地准备
    sitePreparationFile: [[]],//场地准备文件
    sitePreparationRemarks: [{ value: null, disabled: !this.editBase }],//场地准备备注
    otherTrain: [{ value: null, disabled: !this.editBase }],//合同中培训相关条款
    otherFine: [{ value: null, disabled: !this.editBase }],//罚则及违约责任(不含售后)
    otherIp: [{ value: null, disabled: !this.editBase }],//IP条款
    otherContractTemplate: [{ value: null, disabled: !this.editBase }],//非标合同模板
    otherOcap: [{ value: null, disabled: !this.editBase }],//OCAP
    other: [{ value: null, disabled: !this.editBase }],//其它
    otherLabel: [{ value: null, disabled: !this.editBase }],//其它文本框
    otherRemarks: [{ value: null, disabled: !this.editBase }],//其它备注
    supportFileMissing: [{ value: null, disabled: true }], //支持文件缺失需特批进单
    supportFileMissingFile: [[]],//持文件缺失需特批进单文件
    supportFileMissingRemarks: [{ value: "", disabled: true }],//持文件缺失需特批进单文件
    amountDifference: [{ value: null, disabled: true }], //直投合同订单合同金额和中标金额有价差
    amountDifferenceFile: [],//直投合同订单合同金额和中标金额有价差文件
    amountDifferenceRemarks: [{ value: "", disabled: true }], //直投合同订单合同金额和中标金额有价差
    magneticResonanceShieldingFile: [{ value: [], disabled: !this.editBase }],//磁共振屏蔽文件
    otherTermsFile: [[]],//其他文件
    otherSupportFile: [[]],//其他支持文件
    cpclFile: [[]],//CPCL文件
    dealerRequestLetterFile: [[]],//要货函
    id: [{ value: null, disabled: true }],
    shipmentDeliveryCheckFlag: [null],//装运及交货是否已查
    otherSupportFileFlag: [null],//其它文件已查
    bidWinningNoticeCheckFlag: [null],//中标通知书是否已查
    siteReportCheckFlag: [null],//场地报告是否已查
    projectSolutionsCheckFlag: [null],//项目解决方案售前支持报告是否已查
    biddingDocumentsCheckFlag: [null],//招标文件是否已查
    tenderDocumentsCheckFlag: [null],//投标文件是否已查
    enduserContractCheckFlag: [null],//最终用户合同是否已查
    projectAnalysisTableCheckFlag: [null],//项目分析表是否已查
    paymentProvisionCheckFlag: [null],//付款条款是否已查
    installationWarrantyCheckFlag: [null],//安装及保修是否已查
    sitePreparationCheckFlag: [null],//场地准备是否已查
    supportFileMissingCheckFlag: [null],//支持文件缺失需特批进单是否已查
    otherCheckFlag: [null],//其他是否已查
    amountDifferenceCheckFlag: [null],//直投订单合同金额和中标金额有价差是否已查
    performanceBondCheckFlag: [null],//履约保函是否已查
    qualityGuaranteeCheckFlag: [null],//质量保函
    mrshieldingCompanyCheckflag: [null],//磁屏蔽是否已查
    confirmationFileCheckFlag: [null],//igt是否已查
    afterSalesCheckFlag: [null],//是否有售后限价是否已查
    dealerRequestLetterFileFlag: [null],//经销商要货函是否已查
    cpclFileFlag: [null] //CPCL文件是否已查
  }
  contractSignForm = {
    salesAgreementNo: [{ value: null, disabled: !this.editable }],//买卖协议号
    importAgreementNo: [{ value: null, disabled: !this.editable }],// 进口协议号
    purchaseOrderNumber: [{ value: null, disabled: !this.editable }],//采购订单号
    purchaseOrderSignatory: [{ value: null, disabled: !this.editable }],//采购订单签署人
    purchaseOrderSignatoryPosition: [{ value: null, disabled: !this.editable }],//采购订单签署人职务
    contractBuyerSignatory: [{ value: null, disabled: !this.editable }],//合同签署人
    contractBuyerSignatoryPosition: [{ value: null, disabled: !this.editable }],//合同签署人职务
    importAgreementSignName: [{ value: null, disabled: !this.editable }],//进口协议签署人
    importAgreementSignPosition: [{ value: null, disabled: !this.editable }],//进口协议签署人职务
    priceTerms: [{ value: null, disabled: !this.editable }],//价格术语
    addressee: [{ value: null, disabled: !this.editable }],//收件人
    addresseeTel: [{ value: null, disabled: !this.editable }],//收件人电话
    portDestination: [{ value: null, disabled: !this.editable }],//目的港中文名称
    portDestinationEn: [{ value: null, disabled: !this.editable }],//目的港英文名称
    transportMode: [{ value: null, disabled: !this.editable }],//运输方式
    invoiceMailingInformation: [{ value: null, disabled: !this.editable }],//发票邮寄信息
    id: [],
    accountName: [{ value: null, disabled: !this.editable }],//开户行名称
    bankName: [{ value: null, disabled: !this.editable }],//开户行
    accountNo: [{ value: null, disabled: !this.editable }],//账号
    registrationAddress: [{ value: null, disabled: !this.editable }],//注册地址
    accountPhoneFax: [{ value: null, disabled: !this.editable }],//电话/传真
    taxNum: [{ value: null, disabled: !this.editable }],//税号
  }
  oaAddInfo = {
    customerRequestLetterDate: [null], // 客户要货函日期
    contractVersion: [null], // 合同版本
    ocap: [null], // 合同是否有OCAP条款
    purchaseVerification: [null], // 经销商自采第三方核查
    oaSupportFile: [[]], // 附件
    remark: [null], // 备注
    id: [null],
    preConcludedItem: [{ value: null, disabled: true }], //经销商自采第三方核查信息
  }

  signFileForm = {
    zslNotSignedFile: [{ value: [], disabled: !this.editable }],// 未ZSL签署的合同文件
    zslSignedFile: [{ value: [], disabled: !this.editable }],// 已ZSL签署的合同文件
    contractConfirmedDate: [{ value: null, disabled: !this.editable }, [Validators.required]],// 合同确认日期
    contractUploaded: [null, [Validators.required]],//正本合同已上传
    contractFile: [[], [Validators.required, this.contractFileValidators]],//合同文件
    supportFile: [{ value: [], disabled: !this.editable }],//补充文件
    remark: [{ value: null, disabled: !this.editable }],//备注
    // signedFileRelationList: [], // 待签章文件与已签章文件关系数组
  }

  thirdCheckForm = {
    productVerificationInformation: [{ value: null, disabled: !this.editable }, [Validators.required]],
    productVerificationFile: [[]],
  }

  soNoCheckForm = {
    soNo: [{ value: null, disabled: !this.editable }, [Validators.required, this.cheakSo]], //om 回填so号
    soRemark: [{ value: null, disabled: !this.editable }], //回填so号备注
    fillSoFile: [[]], //回填so号附件
  }

  @ViewChild("baseInfoFromChild") baseInfoFromChild;
  @ViewChild("productChild") productChild;
  @ViewChild("baseInfoTableChild") baseInfoTableChild;
  @ViewChild("tabs") tabs;
  @ViewChild('changeOrderwin') changeOrderwin
  @ViewChild('approveChanges') approveChanges;
  @ViewChild('contractSign') contractSign;
  @ViewChild('thirdCheck') thirdCheck;
  public formValue: FormGroup = this.fb.group({
    productModelInfo: this.fb.group({
      ...this.productModelInfo,
    }),
    baseInfoFrom: this.fb.group({
      ...this.baseInfoFrom,
    }
    ),
    dealerFrom: this.fb.group({
      ...this.dealerFrom,
    }),
    accountFrom: this.fb.group({
      ...this.accountFrom
    }),
    contractBuyerFrom: this.fb.group({
      ...this.contractBuyerFrom
    }),
    foreignFrom: this.fb.group({
      ...this.foreignFrom
    }),
    endUserFrom: this.fb.group({
      ...this.endUserFrom
    }),
    baseInfoTable: this.fb.group({
      ...this.baseInfoTable
    }),
    remarkFrom: this.fb.group({
      ...this.remarkFrom
    }),
    oaAddInfo: this.fb.group({
      ...this.oaAddInfo
    }),
    marketBundleInfo: this.fb.array([]),
    oitInform: this.fb.group({
      ...this.oitInform
    }),
    financialInform: this.fb.group({
      ...this.financialInform
    }),
    contractSignForm: this.fb.group({
      ...this.contractSignForm,
    }),
    signFileForm: this.fb.group({
      ...this.signFileForm,

    }),
    deBookInform: this.fb.group({
      ...this.deBookInform
    }),
    supportingListform: this.fb.group({
      ...this.supportingListform
    }),
    thirdCheckForm: this.fb.group({
      ...this.thirdCheckForm
    }),
    soNoCheckForm: this.fb.group({
      ...this.soNoCheckForm
    }),
    changOrderFrom: this.fb.group({
      ...this.changOrderFrom
    }),
    examineFrom: this.fb.group({
      ...this.examineFrom
    }),
    priceApproval: this.fb.group({ ...this.priceApproval }),
    applyId: [],
    processInstanceTaskId: [],
    processStatus: [],
    modality: [],
    cycleGroup: [],
    bigArea: [],
    smallArea: [],
    isFirstLoad: [false],
  });

  async getPricePermissions() {
    let data = null
    const uri = `/act/fieldPermissions/getPermissions?fieGroup=price`;
    const res = await this.http.get(uri).toPromise();
    if ("0000" === res["code"]) {
      data = res.data;
    } else {
      throw new Error(res.msg);
    }
    return data
  }
  oaSupplementFile(control: FormGroup) {
    const sample = control.value;
    return (sample != '1') ? { 'sampleCheck': true } : null;
  }

  ngOnInit() {
    // await console.log(this.getPricePermissions())
    this.init();
    const roleList = JSON.parse(localStorage.getItem("roles"));
    this.needFileTypeShowOff = roleList.includes("OA")
    if (this.needFileType === 'oit') {
      this.oitInformData.get('oaSupplementFile').setValidators([this.oaSupplementFile, Validators.required])
    }

    if (this.needFileType === 'contract') {
      this.oitInformData.disable()
      this.financialInformata.disable()
      this.deBookInformmata.disable()

    }

    if (this.needFileType === 'third') {
      this.tabList.push('complete-third')
      this.oitInformData.disable()
      this.financialInformata.disable()
      this.deBookInformmata.disable()
      this.signFileFormData.disable()
    }

    if (this.needFileType === 'om') {

      this.oitInformData.disable()
      this.financialInformata.disable()
      this.deBookInformmata.disable()
      this.signFileFormData.disable()
    }
    if (this.needFileType === 'oit') {
      this.oitInformData.disable()
      this.oitInformData.get("oitEndSupplementRemark").enable();
      this.oitInformData.get("oitEndSupplementFile").enable()
    }

    if (this.needFileType === 'om' || this.needFileTypeShowOff) {
      this.tabList.push('complete-real')
    }
    this.priceApprovalData.get('recycle').valueChanges.subscribe(val => {
      this.priceData.recycle = val
    })

       // FETR1576537-增加CC报表内容 开放OA在“合同签署”和“待OIT完成”可以填修改“PRODUCT_MODEL”和“实际发货地址”
    if(['ecos_oit_order_done','ecos_oit_order_upload'].includes(this.status)){
      // this.baseInfoFromData.get('endUserActuallyDeliveryAddress').enable();
      this.endUserFromData.get('endUserActuallyDeliveryAddress').enable();
      this.productModelInfoData.get("orderProductModel").enable();
    }
  }
  handleCancel() {
    //this.location.back();
    this.routerExtend.back();
    // this.router.navigate(['/ecos/my-started'])
  }
  async init() {

    let applyId: any
    this.applyId = this.activatedRouter.queryParams['_value'].id;
    applyId = this.applyId;
    this.status = this.activatedRouter.queryParams['value'].taskStatus;
    this.processInstanceTaskId = this.activatedRouter.queryParams['value'].processInstanceTaskId;
    this.flag = this.activatedRouter.queryParams['value'].flag;
    this.procInstId = this.activatedRouter.queryParams['value'].procInstId;
    this.needFileType = this.activatedRouter.queryParams['value'].needFileType;
    this.isHandle = this.activatedRouter.queryParams['value'].isHandle;

    this.isThirdParty = this.activatedRouter.queryParams['value'].isThirdParty;
    this.isLegancy = this.activatedRouter.queryParams['value'].isLegancy;


    this.pageLoading = true;
    if (this.status == 'ecos_oit_order_done' || this.status == 'ecos_oit_order_upload') {
      this.serveice.changeOrder(this.applyId).then(res => {
        if (res.code == '0000' && res.data != null && Object.keys(res.data).length > 0) {
          this.changeItem = true;
          this.lastSo = {
            isExsit: true,
            lastSo: res.data.lastSo ? res.data.lastSo : null,
          }
        }
      })
    }

    this.ProcessTaskStatusPipe.transform(this.status).subscribe(val => {
      this.changeName = val;
      if (!this.needFileType) {
        this.breadCrumbService.replace(val)
      }
      else {
        switch (this.needFileType) {
          case 'oit':
            this.breadCrumbService.replace('OIT完成文件待补充');
            break
          case 'om':
            this.breadCrumbService.replace('待上传SO#');
            break;
          case 'contract':
            this.breadCrumbService.replace('待上传正本合同');
            break;
          case 'third':
            this.breadCrumbService.replace('第三方自采核查');
            break
        }
      }

    })
    this.priceApprovalData.disable()
    if (this.flag == '1' || (this.status == 'ecos_oit_order_change_approval' || this.status == 'ecos_oit_order_change_submit' || this.status == 'ecos_oit_order_change_resubmit')) {
      this.formValue.disable();
      this.editCurr = false;
    } else {
      this.baseInfoTableData.disable()
      this.oaAddInfoData.disable()
    }


    // 待补充文件类型 'contract'-待上传正本合同 ，'oit'-OIT文件待补充，'om'-待OM上传SO#，'third'-第三方自采核查
    let needFileTypes = ['contract', 'oit', 'om'];
    if (needFileTypes.includes(this.needFileType)) {
      this.needFileTypeOff = true;
    }
    if (this.needFileType === 'third') {
      this.thirdSave = true
    }
    //判断进入的页面是否可以进行改单
    this.allowChangOrder = this.activatedRouter.queryParams['value'].allowChangOrder

    if (this.flag == 0 && (this.status == 'ecos_oit_order_change_submit' || this.status == 'ecos_oit_order_change_resubmit')) {
      this.changOrderFromData.enable();
      this.changOrderFromData.get("describes").disable();
      this.examineFromData.disable();
    }
    //改单审核页
    if (this.flag == 0 && (this.status == 'ecos_oit_order_change_approval'
      || this.status == 'ecos_oit_order_change_first_approval'
      || this.status == 'ecos_oit_order_change_second_approval'||this.status=='ecos_oit_order_upload')) {
      this.changOrderFromData.disable();
      this.examineFromData.enable();
    }


    if (this.applyId && this.allowChangOrder) {
      this.serveice.isChangOrder(this.applyId).then(res => {

        if (res.code == '0000') {
          this.changeOrderOff = res.data;
        }
        else {
          this.changeOrderOff = false;
        }
      })
    }
    if (this.status == 'ecos_oit_order_change_submit'
      || this.status == 'ecos_oit_order_change_resubmit'
      || this.status == 'ecos_oit_order_change_approval'
      || this.status == 'ecos_oit_order_change_first_approval'
      || this.status == 'ecos_oit_order_change_second_approval'
    ) {
      const detailData = await this.serveice.changeOrder(this.applyId)

      const { lastApplyId, changeOrderFile, lastInstanceId, changeDealForm, reason, describes, supportRemark, orderChangeId } = detailData.data
      this.changOrderFromData.patchValue({
        applyId: detailData.data.applyId,
        orderChangeId,
        changeOrderFile,
        changeDealForm,
        reason,
        supportRemark,
        describes,
      })
      applyId = lastApplyId;
      this.procInstId = lastInstanceId;
    }
    const oitData = await this.serveice.queryContact(applyId).then(res => {
      this.pageLoading = false;
      const { data } = res;
      const { completionInfo, orderSummaryInfo, contractSignInfo } = data;
      this.completionInfo = completionInfo;
      this.orderSummaryInfo = orderSummaryInfo;
      this.contractSignInfo = contractSignInfo;
      this.getData(data);
      this.contractSign.init();

    })
    if (this.needFileType === 'om') {
      if (this.baseInfoFromData.getRawValue().orderModality === 'US') {
        this.marketBundleInfo.controls.forEach((item, index) => {
          this.marketBundleInfo.at(index).get('wbsNo').setValidators([Validators.required])
        })
      }
    }
    //调用默认的om
    let name = this.oitInformData.getRawValue().omName
    if (this.status === 'ecos_oit_order_upload' && this.flag == '0' && !name) {
      this.getApproval()
    }
    if (this.status == 'ecos_oit_order_upload' && this.flag == '0' && this.needFileTypeShowOff) {
      this.baseInfoFromData.controls.orderSalesSapCode.enable();
      this.dealerFromData.controls.dealerSapCode.enable();
      this.foreignFromData.controls.foreignTradeCorpSapCode.enable();
      this.endUserFromData.controls.endUserSapCode.enable();
      this.baseInfoFromData.patchValue({
        contractCancelDisabled: false,
      })
    }

    //页面跳转
    if (this.status == "ecos_oit_order_change_approval"
      || this.status == "ecos_oit_order_change_resubmit"
      || this.status == "ecos_oit_order_change_submit"
      || this.status == 'ecos_oit_order_change_first_approval'
      || this.status == 'ecos_oit_order_change_second_approval'
    ) {
      this.myskip("approve-change")
      this.tabList.push('approve-change');
    }
    else if (this.needFileType === 'third') {
      this.myskip('complete-third')
    }
    else if (this.needFileType === 'om') {
      this.myskip('complete-real')
    }
    else {
      this.myskip('oit-tab')
    }

    // 合同签署节点，如果已经合同电子签署完成，不能退回之前的节点
    let result = await this.serveice.ifRaisedFlow(this.applyId)
    console.log('this.serveice.ifRaisedFlow',result)
    if (result.code == '0000' && result.data) {
      this.isRaisedFlow = true;
    } else {
      this.isRaisedFlow = false;
    }
  }
  reName() {
    if (this.status == 'ecos_oit_order_submit') {
      return "合同概要表"
    }
    else {
      return "修改合同概要表"
    }
  }
  getData(param) {

    this.changOrderFromData.patchValue({
      cancelApplyId: this.applyId,
    })

    const { contractInfo, termsCheckInfo, completionInfo, contractSignInfo, orderSummaryInfo } = param;
    const { marketBundleInfo } = contractInfo;
    const {
      oitMode,
      centralizedPurchasing,
      dealFormId,
      referenceId,
      dealFormModality,
      businessModel,
      dealFormSales,
      dealFormSalesName,
      dealFormSalesModality,
      dealFormSalesBigArea,
      dealFormSalesSmallArea,
      dealFormSalesProvince,
      dealFormSalesCity,
      dealFormSalesTeam,
      dealFormSalesCycleGroup,
      approvalAreaConfiguration,
      biddingType,
      dealFormSalesPerformanceProvince,
      biddingCompany,
      tenderNum,
      requiredArrivalDate,
      estimateInstallationDate,
      ka,
      estimBiddingPrice,
      prebookReferenceId,
      prebookApplyId,
      prebookMainId,
      prebookOrderId,
      prebookStatus,
      prebookSo,
      prebookQuantity,
      biddingAwardPrice,
      id,
      orderModality,
      orderApprovalAreaConfiguration,
      orderSalesTeam,
      orderSalesBigArea,
      orderSalesSmallArea,
      orderSalesModality,
      orderSalesProvince,
      orderSalesPerformanceProvince,
      orderSalesCity,
      orderSales,
      orderSalesName,
      orderSalesCycleGroup,
      biddingApplyList,
      referenceIdList,
      solutionSalesEmail,
      solutionSalesName,
      actualSalesEmail,
      actualSalesName,
      contractCancelReferenceId,
      contractCancelApplyId,
      contractCancelSoNo,
      orderSalesSapCode,
      subTierInfo,
      profitNetRate,
      profitGrossRate,
      profitGross,
      dealerProfit,
      biddingCurrency,
      endUserActuallyDeliveryAddress
    } = contractInfo
    this.formValue.patchValue({
      applyId: contractInfo.applyId ? contractInfo.applyId : this.applyId,
      processInstanceTaskId: contractInfo.processInstanceTaskId ? contractInfo.processInstanceTaskId : this.processInstanceTaskId,
      processStatus: contractInfo.processStatus ? contractInfo.processStatus : this.status,
    })
    this.financialInformata.patchValue({
      ...completionInfo
    })
    this.deBookInformmata.patchValue({
      ...completionInfo
    })

    this.oaAddInfoData.patchValue({
      ...orderSummaryInfo
    })
    this.baseInfoFromData.patchValue({
      oldSalesProvince: contractInfo.dealFormSalesProvince,
      solutionSalesNameModel: contractInfo.solutionSalesEmail ? `${contractInfo.solutionSalesName}(${contractInfo.solutionSalesEmail})` : "",
      actualSalesNameModel: contractInfo.actualSalesEmail ? `${contractInfo.actualSalesName}(${contractInfo.actualSalesEmail})` : "",
      biddingAwardPrice: orderSummaryInfo.biddingAwardPrice,
      biddingAwardCurrency: orderSummaryInfo.biddingAwardCurrency,
      marketBundleInfo: marketBundleInfo,
      oitMode,
      centralizedPurchasing,
      dealFormId,
      referenceId,
      dealFormModality,
      businessModel,
      dealFormSales,
      dealFormSalesName,
      dealFormSalesModality,
      dealFormSalesBigArea,
      dealFormSalesSmallArea,
      dealFormSalesProvince,
      dealFormSalesCity,
      dealFormSalesTeam,
      dealFormSalesCycleGroup,
      approvalAreaConfiguration,
      biddingType,
      dealFormSalesPerformanceProvince,
      biddingCompany,
      tenderNum,
      requiredArrivalDate,
      estimateInstallationDate,
      ka,
      estimBiddingPrice,
      prebookReferenceId,
      prebookApplyId,
      prebookMainId,
      prebookOrderId,
      prebookStatus,
      prebookSo,
      prebookQuantity,
      id,
      orderModality,
      orderApprovalAreaConfiguration,
      orderSalesTeam,
      orderSalesBigArea,
      orderSalesSmallArea,
      orderSalesModality,
      orderSalesProvince,
      orderSalesPerformanceProvince,
      orderSalesCity,
      orderSales,
      orderSalesName,
      orderSalesCycleGroup,
      biddingApplyList,
      referenceIdList,
      solutionSalesEmail,
      solutionSalesName,
      actualSalesEmail,
      actualSalesName,
      contractCancelReferenceId,
      contractCancelApplyId,
      contractCancelSoNo,
      orderSalesSapCode,
      profitNetRate,
      profitGrossRate,
      profitGross,
      dealerProfit,
      biddingCurrency,
      endUserActuallyDeliveryAddress
    })
    this.productModelInfoData.patchValue({
      ...contractInfo
    })
    this.dealerFromData.patchValue({
      ...contractInfo,
      subTierInfo: contractInfo.subTierInfo || []
    })
    this.accountFromData.patchValue({
      ...contractInfo
    })
    this.foreignFromData.patchValue({
      ...contractInfo
    })
    this.endUserFromData.patchValue({
      ...contractInfo
    })
    this.contractBuyerFromData.patchValue({
      ...contractInfo
    })
    this.baseInfoTableData.patchValue({
      ...termsCheckInfo
    })
    this.priceApprovalData.patchValue({
      ...orderSummaryInfo,
      ...contractInfo,
    })
    this.contractSignFormData.patchValue({
      ...contractInfo,
      ...contractSignInfo,
    })

    this.signFileFormData.patchValue({
      ...contractSignInfo
    })

    this.thirdCheckFormData.patchValue({
      ...completionInfo
    })

    this.soNoCheckFormData.patchValue({
      ...completionInfo
    })
    this.oitInformData.patchValue({
      ...completionInfo,
      productVerification: this.oaAddInfoData.getRawValue().purchaseVerification,
      specialApprovalSupporting: this.baseInfoTableData.getRawValue().supportFileMissing,
      oitDate: completionInfo.oitDate ? completionInfo.oitDate : new Date()
    })


    const currencySystem = contractInfo.currencySystem
    const { dealerName } = this.dealerFromData.getRawValue();
    const { foreignTradeCorpName } = this.foreignFromData.getRawValue();

    this.serveice
      .getContractTemplate({
        modality: orderModality,
        businessModel,
        dealerName,
        currency: currencySystem,
        foreignTradeCorpName
      })
      .subscribe((res) => {
        if (res.code === "0000") {
          this.baseInfoFromData.patchValue({
            templateList: res.data,
          })
        } else {
          console.log(res.msg);
          //this.message.error(res.msg)
        }
      });

    if (this.marketBundleInfo.length === 0) {
      marketBundleInfo.map((val, index) => {
        this.marketBundleInfo.push(this.createProdut(val, index, currencySystem))
      })
      const { orderModality } = this.baseInfoFromData.getRawValue();

      if ((orderModality == 'PD&IGT') && (this.status == 'ecos_oit_order_upload' || this.needFileType == 'om')) {
        const marketBundelhost = marketBundleInfo.filter(val => val.primaryOpportunity == 'true' || val.primaryOpportunity == true);
        const { marketBundleName, opportunityId, marketBundleAmount } = marketBundelhost[0];
        const SearchParams = {
          pageNo: 1,
          pageSize: 10,
          opportunityId: opportunityId,
          marketBundleName: clearSpaces(marketBundleName),
          marketBundleAmount: marketBundleAmount,
        }
        this.serveice.searchPrebook(SearchParams).subscribe(res => {
          if (res.code == '0000') {

            this.baseInfoFromData.patchValue({
              prebookQuantity: res.data.rows.length,
            })
            if (res.data.rows.length == 1) {
              const { rows } = res.data;
              this.baseInfoFromData.patchValue({
                prebookReferenceId: rows[0].referenceId,
                prebookApplyId: rows[0].applyId,
                prebookOrderId: rows[0].orderId,
                prebookStatus: rows[0].processStatus,
                prebookSo: rows[0].so,
              })
            }
            if (res.data.rows.length > 0) {
              this.baseInfoFromData.get("prebookReferenceId").enable();
              this.baseInfoFromData.get("prebookReferenceId").setValidators(Validators.required);
              this.baseInfoFromData.get("prebookReferenceId").updateValueAndValidity();
            }
          }
        })
      }
      if ((orderModality == 'US') && (this.status == 'ecos_oit_order_upload' || this.needFileType == 'om')) {
        const SearchParams = {
          pageNo: 1,
          pageSize: 10,
          marketBundleList: marketBundleInfo.getRawValue()
        }
        this.serveice.searchPrebookByMarketBundle(SearchParams).subscribe(res => {
          if (res.code == '0000') {
            this.baseInfoFromData.patchValue({
              prebookQuantity: res.data.rows.length,
            })
            if (res.data.rows.length == 1) {
              const { rows } = res.data;
              this.baseInfoFromData.patchValue({
                prebookReferenceId: rows[0].referenceId,
                prebookApplyId: rows[0].applyId,
                prebookOrderId: rows[0].orderId,
                prebookStatus: rows[0].processStatus,
                prebookSo: rows[0].so,
              })
            }
            if (res.data.rows.length > 0) {
              this.baseInfoFromData.get("prebookReferenceId").enable();
              this.baseInfoFromData.get("prebookReferenceId").setValidators(Validators.required);
              this.baseInfoFromData.get("prebookReferenceId").updateValueAndValidity();
            }
          }
        })
      }
      if (orderModality == 'CC' && this.status == 'ecos_oit_order_upload' && this.flag == '0' && this.needFileTypeShowOff) {
        this.baseInfoFromData.get("requiredArrivalDate").enable();
        this.baseInfoFromData.get("estimateInstallationDate").enable();
        this.baseInfoTableData.get("cpclFile").enable();
        this.baseInfoTableData.get("dealerRequestLetterFile").enable();
        this.baseInfoTableData.get("otherSupportFile").enable();
      }

    }
    this.priceApprovalData.patchValue({
      tradeInTotal: contractInfo.currencySystem == 'CNY' ? (contractInfo.orderTradeInCnyNet != null && contractInfo.orderTradeInCnyNet != "" ? contractInfo.orderTradeInCnyNet : 0) : (contractInfo.orderTradeInUsd != null && contractInfo.orderTradeInUsd != "" ? contractInfo.orderTradeInUsd : 0),
      rebateTotal: contractInfo.currencySystem == 'CNY' ? (contractInfo.orderRebateCnyNet != null && contractInfo.orderRebateCnyNet != "" ? contractInfo.ordeRerbateCnyNet : 0) : (contractInfo.orderRebateUsd != null && contractInfo.orderRebateUsd != "" ? contractInfo.orderRebateUsd : 0),
      financialSolutionName: contractInfo.financialSolutionOther ? (contractInfo.financialSolutionOther == 'null' ? '' : contractInfo.financialSolutionOther) : "",
      tradeInTotalOS: contractInfo.currencySystem == 'CNY' ? (contractInfo.orderChapterTradeInNetCny != null && contractInfo.orderChapterTradeInNetCny != "" ? contractInfo.orderChapterTradeInNetCny : 0) : (contractInfo.orderTradeInUsd != null && contractInfo.orderChapterTradeInUsd != "" ? contractInfo.orderChapterTradeInUsd : 0),
      rebateTotalOS: contractInfo.currencySystem == 'CNY' ? (contractInfo.orderChapterRebateNetCny != null && contractInfo.orderChapterRebateNetCny != "" ? contractInfo.orderChapterRebateNetCny : 0) : (contractInfo.orderChapterRebateUsd != null && contractInfo.orderChapterRebateUsd != "" ? contractInfo.orderChapterRebateUsd : 0),
    })
    if (localStorage.getItem('contractPriceAuthority') == 'false') {
      this.priceApprovalData.patchValue({
        tradeInTotal: '',
        rebateTotal: '',
        financialSolutionName: '',
        tradeInTotalOS: '',
        rebateTotalOS: '',
        totalContractPrice: '',
        financialSolutionCny: '',
        financialSolutionCnyNet: '',
        financialSolutionUsd: '',
        vatRate: '',
        promotionPlan: '',
      })
    }
    this.priceData = {
      ...this.priceApprovalData.getRawValue()
    }
    if (localStorage.getItem('contractPriceAuthority') == 'false') {
      this.priceApprovalData.patchValue({
        tradeInTotal: '',
        rebateTotal: '',
        financialSolutionName: '',
        tradeInTotalOS: '',
        rebateTotalOS: '',
        totalContractPrice: '',
        financialSolutionCny: '',
        financialSolutionCnyNet: '',
        financialSolutionUsd: '',
        vatRate: '',
        promotionPlan: '',
      })
    }

    if (localStorage.getItem('contractPriceAuthority') == 'false') {
      this.priceApprovalData.patchValue({
        tradeInTotal: '',
        rebateTotal: '',
        financialSolutionCny: '',
        financialSolutionCnyNet: '',
        financialSolutionUsd: '',
        vatRate: '',
      })
    }

    if (localStorage.getItem('dealPriceAuthority') == 'false') {
      this.priceApprovalData.patchValue({
        dealPriceCny: '',
        dealPriceCnyNet: '',
        dealPriceUsd: '',
      })
    }

    if (localStorage.getItem('dealPriceAuthority') == 'false') {
      this.priceApprovalData.patchValue({
        totalContractPrice: '',
      })
    }
    // this.serveice.getUserInfo(contractInfo.orderSales).then(res => {
    //   let infos = res.data
    //   if (infos[0].name) {
    //     this.baseInfoFromData.patchValue({
    //       orderSalesName: infos[0].name + '(' + contractInfo.orderSales + ')'
    //     })
    //   }
    // })

    if (this.oitInformData.getRawValue().specialApprovalSupporting == '1' && !this.oitInformData.getRawValue().speciallySupportingFileName) {
      this.getSpeciallySupportingFileName()
    }
    if (this.isHandle == 0 && this.oitInformData.getRawValue().specialApprovalSupporting == '1') {
      //未处理
      this.getSpeciallySupportingFile();
    }
    if (this.needFileType == 'contract') {
      const { contractUploaded } = this.signFileFormData.getRawValue();
      if (contractUploaded == '1') {
        this.signFileFormData.get("contractUploaded").disable();
      }
    }


    if (this.deBookInformmata.getRawValue().deBookDate) {
      this.deBookInformmata.get('deBook').disable()
      this.deBookInformmata.get('deBookDate').disable()
    }
    if (this.deBookInformmata.getRawValue().reBookDate) {
      this.deBookInformmata.get('reBook').disable()
      this.deBookInformmata.get('reBookDate').disable()
    }
    const { cancel } = this.deBookInformmata.getRawValue()
    if (cancel == '1') {
      this.deBookInformmata.disable();
    }
    if (this.oitInformData.getRawValue().oaSupplementFile == '1') {
      this.oitInformData.get("oaSupplementFile").disable();
    }

    if (this.baseInfoFromData.getRawValue().businessModel == 'DISTRIBUTOR') {
      this.getdistributorDate(); //更新经销商日期
      setTimeout(() => {
        const subTierDisbaled = !((this.flag == '0' && ['ecos_oit_order_upload','ecos_oit_order_change_submit','ecos_oit_order_change_resubmit'].includes(this.status))
        || (this.allowChangOrder&&['ecos_oit_order_done'].includes(this.status)) )
        this.subTierSubject.next({
          type: 'add',
          data: subTierInfo,
          disabled: subTierDisbaled
        })
        this.baseInfoFromChild.checkBiddingEqualDealer();
      }, 0);
    }
    if (this.priceApprovalData.getRawValue().currencySystem == "USD") {
      this.getIepoolDate(); //更新经销商日期
    }

    const { paymentProvision } = this.baseInfoTableData.getRawValue();
    if (this.paymentProvisionList.includes(paymentProvision)) {
      this.oitInformData.get("credentialFile").setValidators(Validators.required);
      this.oitInformData.get("credentialFile").updateValueAndValidity();
      this.oitInformData.patchValue({
        credentialFileRequired: true,
      })

    }
    else {
      this.oitInformData.get("credentialFile").clearValidators();
      this.oitInformData.get("credentialFile").updateValueAndValidity();
      this.oitInformData.patchValue({
        credentialFileRequired: false,
      })
    }
    // this.contractFile = this.signFileFormData.getRawValue().contractFile
    // if (localStorage.getItem('contractFileAuthority') == 'false') {
    //   this.signFileFormData.patchValue({
    //     contractFile: null
    //   })
    // }
    if (this.flag == 0 && this.status == 'ecos_oit_order_upload') {
      const cpDealOrderId = this.priceApprovalData.getRawValue().cpDealOrderId;
      {
        this.serveice.getCpDealOrderId(contractInfo.oitOrderId).subscribe(item => {
          if (item.code == '0000') {
            this.priceApprovalData.patchValue({
              cpDealOrderId: item.data.cpDealOrderId
            })
          }
        })
      }
    }
    this.priceApprovalData.get('sofonFile').setValidators(Validators.required);
    this.priceApprovalData.get('sofonFile').updateValueAndValidity();
    if (this.baseInfoFromData.getRawValue().oitMode == 'BIDDING') {
      this.getBiddingIsSpecial();
    }
  }
  getBiddingIsSpecial() {//bidding模式是否是特批
    let { biddingApplyList } = this.baseInfoFromData.getRawValue();
    if(biddingApplyList && biddingApplyList.length > 0){
      biddingApplyList.map(val => {
        this.serveice.getBiddingIsSpecial(val.id).subscribe(item => {
          if (item.code == '0000' && item.data == true) {
            val.biddingIsSpecial = true;
          }
          else {
            val.biddingIsSpecial = false;
          }
        })
      })
      this.baseInfoFromData.patchValue({
        biddingApplyList: biddingApplyList
      })
    }
  }
  get productModelInfoData(): FormGroup {
    return this.formValue.get('productModelInfo') as FormGroup
  }
  get examineFromData(): FormGroup {
    return this.formValue.get('examineFrom') as FormGroup
  }
  get changOrderFromData(): FormGroup {
    return this.formValue.get('changOrderFrom') as FormGroup;
  }
  get oitInformData(): FormGroup {
    return this.formValue.get('oitInform') as FormGroup
  }
  get financialInformata(): FormGroup {
    return this.formValue.get('financialInform') as FormGroup
  }
  get deBookInformmata(): FormGroup {
    return this.formValue.get('deBookInform') as FormGroup
  }

  get marketBundleInfo(): FormArray {
    return this.formValue.get("marketBundleInfo") as FormArray;
  }
  get remarkFromData(): FormGroup {
    return this.formValue.get("remarkFrom") as FormGroup;
  }
  get baseInfoFromData(): FormGroup {
    return this.formValue.get("baseInfoFrom") as FormGroup
  }
  get priceApprovalData(): FormGroup {
    return this.formValue.get("priceApproval") as FormGroup
  }
  get dealerFromData(): FormGroup {
    return this.formValue.get("dealerFrom") as FormGroup;
  }
  get oaAddInfoData(): FormGroup {
    return this.formValue.get("oaAddInfo") as FormGroup
  }
  get accountFromData(): FormGroup {
    return this.formValue.get("accountFrom") as FormGroup;
  }
  get foreignFromData(): FormGroup {
    return this.formValue.get("foreignFrom") as FormGroup;
  }
  get endUserFromData(): FormGroup {
    return this.formValue.get("endUserFrom") as FormGroup;
  }
  get baseInfoTableData(): FormGroup {
    return this.formValue.get("baseInfoTable") as FormGroup;
  }

  get contractBuyerFromData(): FormGroup {
    return this.formValue.get("contractBuyerFrom") as FormGroup
  }

  get contractSignFormData() {
    return this.formValue.get('contractSignForm')
  }

  get signFileFormData(): FormGroup {
    return this.formValue.get('signFileForm') as FormGroup
  }

  get orderInfo(): FormArray {
    return this.formValue.get("orderInfo") as FormArray;
  }

  get thirdCheckFormData(): FormGroup {
    return this.formValue.get('thirdCheckForm') as FormGroup
  }

  get soNoCheckFormData(): FormGroup {
    return this.formValue.get('soNoCheckForm') as FormGroup
  }



  public myskip(val): void {
    //外部触发tab选项卡的事件
    this.activedId = val;
    this.tabs.activeId(val);
  }

  //效验经销商日期
  getdistributorDate() {
    const { dealerName } = this.dealerFromData.getRawValue();
    this.serveice.findDealersByPageValid({ dealerName: dealerName }).then((item) => {
      if (item.code == '0000') {
        const { rows } = item.data;
        if (rows.length > 0) {
          const ddpValidUntil = standardTime(rows[0].mdtdealerddpexpiredate)
          const ddpStatus = isadopt(ddpValidUntil);
          if (ddpStatus != "通过") {
            this.dealerFromData.patchValue({
              dealerDdpStatus: "不通过",
              dealerDdpValidityDate: rows[0].mdtdealerddpexpiredate
            })
          }
          else {
            this.dealerFromData.patchValue({
              dealerDdpStatus: "通过",
              dealerDdpValidityDate: rows[0].mdtdealerddpexpiredate
            })
          }
        }
      }
    })


  }
  //加载外贸公司日期
  async getIepoolDate() {
    const { companyNotInIePool, foreignTradeCorpDdpValidityDate, foreignTradeCorpName } = this.foreignFromData.getRawValue()
    if (companyNotInIePool) {
      const ddpValidUntil = standardTime(foreignTradeCorpDdpValidityDate)
      const ddpStatus = isadopt(ddpValidUntil);
      if (ddpStatus != "通过") {
        this.foreignFromData.patchValue({
          foreignTradeCorpDdpStatus: ddpStatus
        })
      }
    }
    else {
      const dateAndValid = await this.serveice.findEcosiepool({ corporateName: foreignTradeCorpName })
      if (dateAndValid.code == '0000') {
        const rows = dateAndValid.data.rows;
        if (rows.length > 0) {
          const ddpValidUntil = standardTime(rows[0].ddpValidUntil)
          const ddpStatus = isadopt(ddpValidUntil);
          if (ddpStatus != "通过") {
            this.foreignFromData.patchValue({
              foreignTradeCorpDdpStatus: "不通过",
              foreignTradeCorpDdpValidityDate: rows[0].ddpValidUntil
            })
          }
          else {
            this.foreignFromData.patchValue({
              foreignTradeCorpDdpStatus: "通过",
              foreignTradeCorpDdpValidityDate: rows[0].ddpValidUntil
            })
          }
        }
      }
    }
  }

  preSubmit(parm, isApprovalReject: boolean = false) {
    let data = this.formValue.getRawValue();
    const { applyId, oaAddInfo, contractSignForm, oitInform, signFileForm, financialInform, deBookInform, marketBundleInfo, processInstanceTaskId, processStatus, modality, cycleGroup, bigArea, smallArea, accountFrom, baseInfoFrom, baseInfoTable, contractBuyerFrom, dealerFrom, endUserFrom, foreignFrom, orderInfo, priceApproval, remarkFrom, thirdCheckForm, soNoCheckForm, productModelInfo } = data;
    dealerFrom.dealerDdpValidityDate = dealerFrom.dealerDdpValidityDate != null && dealerFrom.dealerDdpValidityDate != '' ? moment(dealerFrom.dealerDdpValidityDate).format('YYYY-MM-DD hh:mm:ss') : null;
    foreignFrom.foreignTradeCorpDdpValidityDate = (foreignFrom.foreignTradeCorpDdpValidityDate != null && foreignFrom.foreignTradeCorpDdpValidityDate != "") ? moment(foreignFrom.foreignTradeCorpDdpValidityDate).format('YYYY-MM-DD hh:mm:ss') : null;
    oitInform.oitDate = (oitInform.oitDate != null && oitInform.oitDate != undefined && oitInform.oitDate != "") ? moment(oitInform.oitDate).format('YYYY-MM-DD hh:mm:ss') : null;
    deBookInform.deBookDate = (deBookInform.deBookDate != null && deBookInform.deBookDate != undefined && deBookInform.deBookDate != "") ? moment(deBookInform.deBookDate).format('YYYY-MM-DD hh:mm:ss') : null;
    deBookInform.reBookDate = (deBookInform.reBookDate != null && deBookInform.reBookDate != undefined && deBookInform.reBookDate != "") ? moment(deBookInform.reBookDate).format('YYYY-MM-DD hh:mm:ss') : null;
    deBookInform.cancelTime = (deBookInform.cancelTime != null && deBookInform.cancelTime != undefined && deBookInform.cancelTime != "") ? moment(deBookInform.cancelTime).format('YYYY-MM-DD hh:mm:ss') : null;
    baseInfoFrom.requiredArrivalDate = (baseInfoFrom.requiredArrivalDate != null && baseInfoFrom.requiredArrivalDate != "") ? moment(baseInfoFrom.requiredArrivalDate).format('YYYY-MM-DD hh:mm:ss') : null;
    baseInfoFrom.estimateInstallationDate = (baseInfoFrom.estimateInstallationDate != null && baseInfoFrom.estimateInstallationDate != "") ? moment(baseInfoFrom.estimateInstallationDate).format('YYYY-MM-DD hh:mm:ss') : null;
    dealerFrom.dealerDdpValidityDate = dealerFrom.dealerDdpValidityDate != null && dealerFrom.dealerDdpValidityDate != '' ? moment(dealerFrom.dealerDdpValidityDate).format('YYYY-MM-DD hh:mm:ss') : null;
    foreignFrom.foreignTradeCorpDdpValidityDate = (foreignFrom.foreignTradeCorpDdpValidityDate != null && foreignFrom.foreignTradeCorpDdpValidityDate != "") ? moment(foreignFrom.foreignTradeCorpDdpValidityDate).format('YYYY-MM-DD hh:mm:ss') : null;
    oaAddInfo.customerRequestLetterDate = oaAddInfo.customerRequestLetterDate != null && oaAddInfo.customerRequestLetterDate != '' ? moment(oaAddInfo.customerRequestLetterDate).format('YYYY-MM-DD hh:mm:ss') : null;
    baseInfoFrom.requiredArrivalDate = (baseInfoFrom.requiredArrivalDate != null && baseInfoFrom.requiredArrivalDate != "") ? moment(baseInfoFrom.requiredArrivalDate).format('YYYY-MM-DD hh:mm:ss') : null;
    baseInfoFrom.estimateInstallationDate = (baseInfoFrom.estimateInstallationDate != null && baseInfoFrom.estimateInstallationDate != "") ? moment(baseInfoFrom.estimateInstallationDate).format('YYYY-MM-DD hh:mm:ss') : null;
    const completionInfo = {
      ...oitInform,
      ...financialInform,
      ...deBookInform,
      ...thirdCheckForm,
      ...soNoCheckForm,
    }

    if (remarkFrom.attachmentIds && remarkFrom.attachmentIds.length > 0) {
      remarkFrom.attachmentIds = remarkFrom.attachmentIds.map(val => val.fileId)
    }
    priceApproval.dealPriceUsd = Number(delcommafy(priceApproval.dealPriceUsd));
    priceApproval.dealPriceCny = Number(delcommafy(priceApproval.dealPriceCny));
    const contractInfo = {
      ...accountFrom,
      ...baseInfoFrom,
      ...contractBuyerFrom,
      ...dealerFrom,
      ...endUserFrom,
      ...this.priceData,
      ...foreignFrom,
      marketBundleInfo: marketBundleInfo,
      endUserActuallyDeliveryAddress: endUserFrom.endUserActuallyDeliveryAddress,
      orderSalesPerformanceProvince: baseInfoFrom.orderSalesPerformanceProvince,
      orderProductModel: productModelInfo.orderProductModel,

    }
    const orderSummaryInfo = {
      ...priceApproval,
      ...oaAddInfo,
    }

    const contractSignInfo = {
      id: contractSignForm.id,
      ...contractSignForm,
      ...signFileForm
    }
    const param = {
      ...remarkFrom,
      applyId,
      contractInfo: contractInfo,
      termsCheckInfo: baseInfoTable,
      completionInfo: completionInfo,
      orderSummaryInfo: orderSummaryInfo,
      contractSignInfo: contractSignInfo,
      status: parm,
      processInstanceTaskId,
      processStatus,
      modality,
      cycleGroup,
      bigArea,
      smallArea,
    }

    if (this.baseInfoFromData.getRawValue().businessModel == 'DISTRIBUTOR') {
      const subTierInfo = this.formValue.get('dealerFrom').get('subTierInfo') as FormArray
        if (subTierInfo.invalid) {
          this.modalService.error({
            nzTitle: '提示',
            nzContent: '经销商黑名单校验不通过，请上传必要的支持文件和备注后，再作提交'
          }).afterClose.subscribe(() => {
            // this.handleToggleTab('basic-info')
            this.tabs.activeId('contract-tab')
            setTimeout(() => {
              document.querySelector('.dealer-info').scrollIntoView()
            }, 0);
          })
          return
        }
    }

    // if (this.needFileType === 'third') {
    //   for (let i in this.thirdCheckFormData.controls) {
    //     this.thirdCheckFormData.controls[i].markAsDirty()
    //     this.thirdCheckFormData.controls[i].updateValueAndValidity()
    //   }
    //   if (!this.thirdCheckFormData.valid) {
    //     this.message.error('请填写第三方自采核查状态后再提交')
    //     return
    //   }
    // }
    // const valid = this.baseInfoFromChild.checkbaseInfoFromData()
    // if (!valid) {
    //   this.tabIndex == 0
    //   this.myskip('contract-tab')
    //   this.message.error('Pre-book没有关联')
    //   return
    // }

    if (this.needFileType === 'oit') {
      for (let i in this.deBookInformmata.controls) {
        this.deBookInformmata.controls[i].markAsDirty()
        this.deBookInformmata.controls[i].updateValueAndValidity()
      }
      for (let i in this.oitInformData.controls) {
        this.oitInformData.controls[i].markAsDirty()
        this.oitInformData.controls[i].updateValueAndValidity()
      }
      for (let i in this.financialInformata.controls) {
        this.financialInformata.controls[i].markAsDirty()
        this.financialInformata.controls[i].updateValueAndValidity()
      }

      for (let i in this.baseInfoTableData.controls) {
        this.baseInfoTableData.controls[i].markAsDirty()
        this.baseInfoTableData.controls[i].updateValueAndValidity()
      }
      if (this.isHandle == '0' && !this.baseInfoTableData.disabled) {
        if (!this.baseInfoTableData.valid) {
          this.message.error('缺失文件未补齐')
          this.myskip('contract-tab')
          return
        }
      }

      if (!this.deBookInformmata.disabled) {

        if (!this.deBookInformmata.valid || !this.oitInformData.valid || !this.financialInformata.valid) {
          this.myskip('oit-tab')
          this.message.error('有必填项未填写')
          return
        }
      }
      else {
        if (!this.oitInformData.valid || !this.financialInformata.valid) {
          this.message.error('有必填项未填写')
          return
        }
      }

    }




    if (parm === 'approved') {

      //OIT完成补充文件-审批
      if (param.processStatus === 'ecos_oit_order_upload' || param.processStatus === 'ecos_oit_order_done') {
        //OIT完成补充文件
        if (completionInfo.specialApprovalSupporting == '1') {
          completionInfo.oaSupplementFile = '0';
        } else {
          completionInfo.oaSupplementFile = '1';
        }

        //第三方自采核查
        if (completionInfo.productVerification == '1') {
          completionInfo.oaSupplementProductVerification = '0';
        } else {
          completionInfo.oaSupplementProductVerification = null;
        }

        //om上传SO#
        if (completionInfo.omEmail) {
          completionInfo.omFillSo = '0';
        }
      }

      for (let i in this.oitInformData.controls) {
        this.oitInformData.controls[i].markAsDirty()
        this.oitInformData.controls[i].updateValueAndValidity()
      }
      for (let i in this.financialInformata.controls) {
        this.financialInformata.controls[i].markAsDirty()
        this.financialInformata.controls[i].updateValueAndValidity()
      }

      if (!this.oitInformData.valid || !this.financialInformata.valid) {
        this.message.error('有必填项未填写')
        return
      }
      const priceApprovalDataVaild = this.checkFormData(this.priceApprovalData)
      if (!priceApprovalDataVaild) {
        this.message.error('有必填项未填写')
        this.myskip("summary-tab");
        return
      }
      this.pageLoading = true;
      this.serveice.contractApproval(param).then(res => {
        if (res.code == '0000') {
          this.pageLoading = false;
          this.message.create('success', res.msg);
          this.router.navigate(['/ecos']);
        }
        else {
          this.message.error(res.msg);
          this.pageLoading = false;
        }
      })
    } else if (parm === 'apply_save') {
      //待我补充
      if (this.needFileTypeOff) {
        //OIT完成补充文件-关联是否补齐字段
        //正本合同
        if (this.needFileType == 'contract') {

          for (const i in this.contractSign.controls) {
            this.contractSign.controls[i].markAsDirty();
            this.contractSign.controls[i].updateValueAndValidity();
          }
          for (const i in this.signFileFormData.controls) {
            this.signFileFormData.controls[i].markAsDirty();
            this.signFileFormData.controls[i].updateValueAndValidity();
          }
          if (!this.signFileFormData.valid) {
            this.message.error('有必填项未填写')
            this.myskip("complete-tab");
            return
          }
          const signFileForm = this.signFileFormData.getRawValue()
          let contractSignInfoExtra = {}
          contractSignInfoExtra = {
            oaSupplementContract: signFileForm.contractUploaded
          }
          Object.assign(param.contractSignInfo, contractSignInfoExtra)
        }

        //第三方自采核查
        if (this.needFileType == 'third') {
          completionInfo.oaSupplementProductVerification = '1';
        }

        //om上传SO#
        if (this.needFileType == 'om') {
          completionInfo.omFillSo = '1';
          this.marketBundleInfo.controls.forEach((item, index) => {
            item.get('wbsNo').markAsDirty()
            item.get('wbsNo').updateValueAndValidity()
          })
          for (let item in this.soNoCheckFormData.controls) {
            this.soNoCheckFormData.controls[item].markAsDirty()
            this.soNoCheckFormData.controls[item].updateValueAndValidity()
          }
          if (!this.marketBundleInfo.valid || !this.soNoCheckFormData.valid) {
            this.message.error('有必填项未填写')
            return;
          }
        }

        if (this.needFileType == 'oit') {

          for (let item in this.oitInformData.controls) {
            this.oitInformData.controls[item].markAsDirty()
            this.oitInformData.controls[item].updateValueAndValidity()
          }

          if (!this.oitInformData.valid || !this.oitInformData.getRawValue().omName) {
            return;
          }
        }
      }

      this.pageLoading = true;
      this.serveice.contractSave(param).then(res => {
        if (res.code == '0000') {
          this.pageLoading = false;
          const { data } = res;
          this.getData(data)
          // if (this.deBookInformmata.getRawValue().deBookDate) {
          //    this.deBookInformmata.get('deBook').disable()
          //    this.deBookInformmata.get('deBookDate').disable()
          // }
          // if (this.deBookInformmata.getRawValue().reBookDate) {
          //   this.deBookInformmata.get('reBook').disable()
          //   this.deBookInformmata.get('reBookDate').disable()
          // }
          // const {cancel}=this.deBookInformmata.getRawValue()
          // console.log(cancel)
          // if (cancel=='1') {
          //  this.deBookInformmata.disable();
          // }
          this.message.create('success', res.msg);
        }
        else {
          this.message.error(res.msg);
          this.pageLoading = false;
        }
      })
    } else if (parm === 'rejected') {

      for (let i in this.remarkFromData.controls) {
        this.remarkFromData.controls[i].markAsDirty()
        this.remarkFromData.controls[i].updateValueAndValidity()
      }
      if (!this.remarkFromData.valid) {
        this.myskip("approval-record");
        this.message.error('备注未填')
        return
      }
      param.completionInfo.remark = "";
      this.pageLoading = true;
      this.serveice.contractApproval(param).then(res => {
        if (res.code == '0000') {
          this.pageLoading = false;
          const { data } = res;
          this.getData(data)
          this.message.create('success', res.msg);
          this.router.navigate(['/ecos']);
        }
        else {
          this.message.error(res.msg);
          this.pageLoading = false;
        }
      })

    }

  }

  // 三方自采核查保存
  thirdCheckSubmit() {
    if(this.isLegancy){
      this.preSubmit('apply_save');
    }else{
      this.thirdCheck.saveFormData()
    }

  }

  checkFormData = (paramForm) => {
    for (const i in paramForm.controls) {
      paramForm.controls[i].markAsDirty();
      paramForm.controls[i].updateValueAndValidity();
    }
    return paramForm.valid;
  };
  clearFormArray = (formArray: FormArray) => {
    //清除fromarray
    while (formArray.length !== 0) {
      formArray.removeAt(0)
    }
  }

  tabclick(i) {
    //tab选项卡的点击事件
    if (typeof i === 'number') {
      this.tabIndex = i;
    }
  }
  changeOrder() {
    //发起改单
    if (this.baseInfoFromData.getRawValue().businessModel == 'DISTRIBUTOR') {
      const subTierInfo = this.formValue.get('dealerFrom').get('subTierInfo') as FormArray
        if (subTierInfo.invalid) {
          this.modalService.error({
            nzTitle: '提示',
            nzContent: '经销商黑名单校验不通过，请上传必要的支持文件和备注后，再作提交'
          }).afterClose.subscribe(() => {
            this.tabs.activeId('contract-tab')
            setTimeout(() => {
              document.querySelector('.dealer-info').scrollIntoView()
            }, 0);
          })
          return
        } else {
          this.preSubmit('apply_save');
        }
    }
    this.changOrderFromData.enable();
    this.changOrderFromData.get("describes").disable();
    this.changeOrderwin.show()
  }

  createProdut(val: any, index, currencySystem) {
    //创建产品
    const netPrice = val.netPrice ? val.netPrice : (currencySystem == 'CNY' ? val.priceCnyNet : val.priceUsd);

    const group = {
      cpOrderConfigId: [val.cpOrderConfigId],
      cpProductId: [val.cpProductId],
      cpMarketBundleId: [val.cpMarketBundleId],
      biddingMarketBundleId: [val.biddingMarketBundleId],
      primaryOpportunity: [{ value: val.primaryOpportunity, disabled: !this.editBase }], //是否主机
      productConfig: [{ value: val.productConfig, disabled: false }], //产品配置
      marketBundleName: [{ value: val.marketBundleName, disabled: false }],//marketBundleName
      marketBundleBmc: [{ value: val.marketBundleBmc, disabled: false }],//BMC
      optionInfo: [{ value: val.optionInfo, disabled: false }],//option
      productInfo: [{ value: val.productInfo, disabled: false }],//标准配置
      clinicalClassification: [{ value: val.clinicalClassification, disabled: false }],//临床分类
      firstLevelDepartment: [{ value: val.firstLevelDepartment, disabled: !this.editBase }],//一级科室
      secondaryDepartment: [{ value: val.secondaryDepartment, disabled: !this.editBase }],//二级科室
      marketBundleAmount: [{ value: val.marketBundleAmount, disabled: false }],//数量
      productModel: [{ value: val.productModel, disabled: true }],//产品型号
      medicalDeviceName: [{ value: val.medicalDeviceName, disabled: true }],//医疗器械名称
      nmpaNum: [{ value: val.nmpaNum, disabled: true }],//nmpaNum证号
      nmpaValidityDate: [{ value: val.nmpaValidityDate, disabled: true },],//NMPA证书有效期
      dtcDealerAgreementNo: [{ value: val.dtcDealerAgreementNo, disabled: !this.editBase },],//Dtc经销商协议号
      newDealerAgreementNo: [{ value: val.newDealerAgreementNo, disabled: !this.editBase },],//最新经销商协议号newDealerAgreementNo
      simulationId: [{ value: val.simulationId, disabled: false },],//simulationId
      marketBundleId: [{ value: val.marketBundleId, disabled: false }],//marketBundleId
      opportunityId: [{ value: val.opportunityId, disabled: false }],//opportunityId
      businessOpportunityHierarchyLink: [{ value: val.businessOpportunityHierarchyLink, disabled: true }],//商机层级链接
      businessOpportunityHierarchyTitle: [{ value: "", disabled: true }], //商机链接提示
      psm: [{ value: val.psm, disabled: false },], //psm
      netPrice: [{ value: val.priceCnyNet, disabled: false },],//Net Price审批价
      promotions: [{ value: val.promotions, disabled: false },],//Promotion 促销号
      rebate: [{ value: val.rebate, disabled: false },], //Rebate 经销商奖励金
      tradeIn: [{ value: val.tradeIn, disabled: false },],//Trade In
      configFile: [{ value: val.configFile, disabled: false },],//配置文件(盖章)
      wbsNo: [{ value: val.wbsNo, disabled: !this.editBase },],//WBS号
      authorizedProduct: [{ value: val.authorizedProduct, disabled: true }], //经销商产品信息
      authorizedArea: [{ value: val.authorizedArea, disabled: true }],//经销商区域
      id: [{ value: val.id, disabled: true }],
      departmentList: [],//科室列表
      departmentListFirst: [],//一级科室
      departmentListSecond: [], //二级科室列表
      dealerCodeList: [], //经销商列表
      originCountry: [{ value: val.originCountry, disabled: true }], //原产地
      originCountryEn: [{ value: val.originCountryEn, disabled: true }] //原产地中文

    }
    return this.fb.group({
      ...group,
    });

  }

  processChangeOrder(parm, start: any = false) {
    //发起改单
    const changOrderdata = this.changOrderFromData.getRawValue();
    const examineData = this.examineFromData.getRawValue();
    if (examineData.attachmentIds && examineData.attachmentIds.length > 0) {
      examineData.attachmentIds = examineData.attachmentIds.map(val => val.fileId)
    }
    if (!start) {
      if (parm == 'rejected') {
        this.examineFromData.get('comments').setValidators(Validators.required);
        this.examineFromData.get('comments').updateValueAndValidity();
      }
      else {
        this.examineFromData.get("comments").clearValidators();
        this.examineFromData.get('comments').updateValueAndValidity();
        if (this.baseInfoFromData.getRawValue().businessModel == 'DISTRIBUTOR') {
          const ddpValidUntil = standardTime(this.dealerFromData.getRawValue().dealerDdpValidityDate)
          const ddpStatus = isadopt(ddpValidUntil);
          if (ddpStatus != "通过") {
            this.dealerFromData.patchValue({
              dealerDdpStatus: ddpStatus
            })
            this.message.error("当前经销商DDP已过有效期")
            return
          }
        }
        if (this.priceApprovalData.getRawValue().currencySystem == 'USD') {
          const ddpValidUntil = standardTime(this.foreignFromData.getRawValue().foreignTradeCorpDdpValidityDate)
          const ddpStatus = isadopt(ddpValidUntil);
          if (ddpStatus != "通过") {
            this.foreignFromData.patchValue({
              foreignTradeCorpDdpStatus: ddpStatus
            })
            this.message.error("当前外贸公司DDP已过有效期")
            return
          }
        }
      }
      const valid = this.checkFromData();
      if (!valid) {
        this.message.error("请填写拒绝理由")
        return
      }
    } else {
      if(parm == 'approved'){
        if (this.baseInfoFromData.getRawValue().businessModel == 'DISTRIBUTOR') {
          const ddpValidUntil = standardTime(this.dealerFromData.getRawValue().dealerDdpValidityDate)
          const ddpStatus = isadopt(ddpValidUntil);
          if (ddpStatus != "通过") {
            this.dealerFromData.patchValue({
              dealerDdpStatus: ddpStatus
            })
            this.message.error("当前经销商DDP已过有效期")
            return
          }
        }
        if (this.priceApprovalData.getRawValue().currencySystem == 'USD') {
          const ddpValidUntil = standardTime(this.foreignFromData.getRawValue().foreignTradeCorpDdpValidityDate)
          const ddpStatus = isadopt(ddpValidUntil);
          if (ddpStatus != "通过") {
            this.foreignFromData.patchValue({
              foreignTradeCorpDdpStatus: ddpStatus
            })
            this.message.error("当前外贸公司DDP已过有效期")
            return
          }
        }

        //经销商校验
        if (this.baseInfoFromData.getRawValue().businessModel == 'DISTRIBUTOR') {
          const subTierInfo = this.formValue.get('dealerFrom').get('subTierInfo') as FormArray
          if (subTierInfo.invalid) {
            this.modalService.error({
              nzTitle: '提示',
              nzContent: '经销商黑名单校验不通过，请上传必要的支持文件和备注后，再作提交'
            }).afterClose.subscribe(() => {
              this.tabs.activeId('contract-tab')
              setTimeout(() => {
                document.querySelector('.dealer-info').scrollIntoView()
              }, 0);
            })
            return
          } else {
            this.preSubmit('apply_save');
          }
        }
      }
      const valid = this.startFromData();
      if (!valid) {
        this.message.error("请填写拒绝理由")
        return
      }
    }
    let param = {
      applyId: this.applyId,
      processInstanceTaskId: this.processInstanceTaskId,
      status: parm,
      processStatus: this.status,
      ...changOrderdata,
      ...examineData
    }
    this.pageLoading = true;
    this.serveice.changeOrderApproval(param).subscribe((res => {
      this.pageLoading = false;
      if (res.code == '0000') {
        this.message.create('success', res.msg);
        this.router.navigate(['/ecos']);
      }
      else {
        this.message.create('error', res.msg);
      }
    }), (error) => {
      this.message.create('error', "请求异常!");
    })
  }

  //发起审核验证
  startFromData = () => {
    for (const i in this.changOrderFromData.controls) {
      this.changOrderFromData.controls[i].markAsDirty();
      this.changOrderFromData.controls[i].updateValueAndValidity();
    }
    return this.changOrderFromData.valid;
  };

  //审核验证
  checkFromData = () => {
    for (const i in this.examineFromData.controls) {
      this.examineFromData.controls[i].markAsDirty();
      this.examineFromData.controls[i].updateValueAndValidity();
    }
    return this.examineFromData.valid;
  };
  getSpeciallySupportingFile() {
    //待文件补充放开文件上传必填
    this.oitInformData.get("oaSupplementFile").setValidators([this.oaSupplementFile, Validators.required])
    const orderModality = this.baseInfoFromData.getRawValue().orderModality
    const biddingType = this.baseInfoFromData.getRawValue().biddingType
    const businessModel = this.baseInfoFromData.getRawValue().businessModel
    const { hospitalType } = this.endUserFromData.getRawValue();
    let biddingFile = this.baseInfoTableData.getRawValue().biddingFile
    let tenderFile = this.baseInfoTableData.getRawValue().tenderFile
    let endUserContract = this.baseInfoTableData.getRawValue().endUserContract
    let projectAnalysisTable = this.baseInfoTableData.getRawValue().projectAnalysisTable
    let bidWinningFile = this.baseInfoTableData.getRawValue().bidWinningFile;

    if (orderModality === 'PD&IGT') {
      if (biddingType == '国内公开标' || biddingType == '国际公开标') {
        if (!biddingFile || biddingFile.length == 0) {
          this.baseInfoTableData.get("biddingFile").enable();
          this.baseInfoTableData.get("biddingFile").setValidators(Validators.required);
          this.baseInfoTableData.get("biddingFile").markAsDirty();
        }
        if (!tenderFile || tenderFile.length == 0) {
          this.baseInfoTableData.get("tenderFile").enable();
          this.baseInfoTableData.get("tenderFile").setValidators(Validators.required);
          this.baseInfoTableData.get("tenderFile").markAsDirty();
        }
        if (!endUserContract || endUserContract.length == 0) {
          this.baseInfoTableData.controls.endUserContract.enable();
          this.baseInfoTableData.get("endUserContract").setValidators(Validators.required);
          this.baseInfoTableData.get("endUserContract").markAsDirty();
        }
      }
      if (businessModel == 'DISTRIBUTOR') {
        if (!projectAnalysisTable || projectAnalysisTable.length == 0) {
          this.baseInfoTableData.controls.projectAnalysisTable.enable();
          this.baseInfoTableData.get("projectAnalysisTable").setValidators(Validators.required);
          this.baseInfoTableData.get("projectAnalysisTable").markAsDirty();
        }
      }
    }
    if (orderModality !== 'PD&IGT') {
      if (businessModel == 'DIRECT') {
        if (!biddingFile || biddingFile.length == 0) {
          this.baseInfoTableData.controls.biddingFile.enable();
          this.baseInfoTableData.get("biddingFile").setValidators(Validators.required);
          this.baseInfoTableData.get("biddingFile").markAsDirty();
        }
        else {
          this.baseInfoTableData.get("biddingFile").clearValidators();
          this.baseInfoTableData.get("biddingFile").markAsDirty();
        }
        if (!tenderFile || tenderFile.length == 0) {
          this.baseInfoTableData.controls.tenderFile.enable();
          this.baseInfoTableData.get("tenderFile").setValidators(Validators.required);
          this.baseInfoTableData.get("tenderFile").markAsDirty();
        }
        else {
          this.baseInfoTableData.get("tenderFile").clearValidators();
          this.baseInfoTableData.get("tenderFile").markAsDirty();
        }
      }
      if (hospitalType == '公立医院') {
        if (!bidWinningFile || bidWinningFile.length == 0) {
          this.baseInfoTableData.controls.bidWinningFile.enable();
          this.baseInfoTableData.get("bidWinningFile").setValidators(Validators.required);
          this.baseInfoTableData.get("bidWinningFile").markAsDirty();
        }
        else {
          this.baseInfoTableData.get("bidWinningFile").clearValidators();
          this.baseInfoTableData.get("bidWinningFile").markAsDirty();
        }
      }
      if (!endUserContract || endUserContract.length == 0) {
        this.baseInfoTableData.controls.endUserContract.enable();
        this.baseInfoTableData.get("endUserContract").setValidators(Validators.required);
        this.baseInfoTableData.get("endUserContract").markAsDirty();
      }
      else {
        this.baseInfoTableData.get("endUserContract").clearValidators();
        this.baseInfoTableData.get("endUserContract").markAsDirty();
      }
    }
  }
  getSpeciallySupportingFileName() {
    const orderModality = this.baseInfoFromData.getRawValue().orderModality
    const biddingType = this.baseInfoFromData.getRawValue().biddingType
    const businessModel = this.baseInfoFromData.getRawValue().businessModel
    const hospitalType = this.endUserFromData.getRawValue().businessModel

    let fileList = []
    let biddingFile = this.baseInfoTableData.getRawValue().biddingFile
    let tenderFile = this.baseInfoTableData.getRawValue().tenderFile
    let endUserContract = this.baseInfoTableData.getRawValue().endUserContract
    let projectAnalysisTable = this.baseInfoTableData.getRawValue().projectAnalysisTable
    let bidWinningFile = this.baseInfoTableData.getRawValue().bidWinningFile

    if (orderModality === 'PD&IGT') {
      if (biddingType == '国内公开标' || biddingType == '国际公开标') {
        if (!biddingFile || biddingFile.length == 0) {
          fileList.push('招标文件')
        }
        if (!tenderFile || tenderFile.length == 0) {
          fileList.push('投标文件')
        }
        if (!endUserContract || endUserContract.length == 0) {
          fileList.push('最终用户合同')
        }
      }
      if (businessModel == 'DISTRIBUTOR') {
        if (!projectAnalysisTable || projectAnalysisTable.length == 0) {
          fileList.push('项目分析表')
        }
      }
    }
    if (orderModality !== 'PD&IGT') {
      if (businessModel == 'DIRECT') {
        if (!biddingFile || biddingFile.length == 0) {
          fileList.push('招标文件')
        }
        if (!tenderFile || tenderFile.length == 0) {
          fileList.push('投标文件')
        }
        if (!endUserContract || endUserContract.length == 0) {
          fileList.push('最终用户合同')
        }
        if (!bidWinningFile || bidWinningFile.length == 0) {
          fileList.push('中标通知书')
        }
      }
    }

    const speciallySupportingFileName = fileList.join(',')
    this.oitInformData.patchValue({
      speciallySupportingFileName: speciallySupportingFileName
    })
  }
  getApproval(resetPageNo = false) {
    // let dealFormSales = this.baseInfoFromData.getRawValue().dealFormSales
    // let orderModality = this.baseInfoFromData.getRawValue().orderModality
    // let dealFormSalesBigArea = this.baseInfoFromData.getRawValue().dealFormSalesBigArea
    // let dealFormSalesSmallArea = this.baseInfoFromData.getRawValue().dealFormSalesSmallArea
    // let dealFormSalesCycleGroup = this.baseInfoFromData.getRawValue().dealFormSalesCycleGroup
    // let orderFormSalesTeam = this.baseInfoFromData.getRawValue().orderSalesTeam


    let orderSalesTeam = this.baseInfoFromData.getRawValue().orderSalesTeam;
    let orderSalesBigArea = this.baseInfoFromData.getRawValue().orderSalesBigArea;
    let orderSalesSmallArea = this.baseInfoFromData.getRawValue().orderSalesSmallArea;
    let orderSalesModality = this.baseInfoFromData.getRawValue().orderSalesModality;
    // let orderSalesProvince = this.baseInfoFromData.getRawValue().orderSalesProvince;
    // let orderSalesPerformanceProvince = this.baseInfoFromData.getRawValue().orderSalesPerformanceProvince;
    // let orderSalesCity = this.baseInfoFromData.getRawValue().orderSalesCity;
    let orderSales = this.baseInfoFromData.getRawValue().orderSales;
    // let orderSalesName = this.baseInfoFromData.getRawValue().orderSalesName;
    let orderSalesCycleGroup = this.baseInfoFromData.getRawValue().orderSalesCycleGroup;
    const searchParams = {
      initiatorEmail: orderSales,
      initiatorBigArea: orderSalesBigArea,
      initiatorSmallArea: orderSalesSmallArea,
      initiatorCycleGroup: orderSalesCycleGroup,
      initiatorModality: orderSalesModality,
      initiatorTeam: orderSalesTeam,
      approverRole: "OM",
      pageSize: 5,
      pageNo: 1,
    };

    this.http.post('/act/ecoscdcustomer/findCdUsers', searchParams)
      .subscribe((res) => {
        if (res.data && res.data.length > 0) {
          const val = res.data[0]
          this.oitInformData.patchValue({
            omName: `${val.approverName}(${val.approverEmail})`,
            omEmail: val.approverEmail,
          })
        }
      })
  }
  omDisable(): boolean {
    if (this.status === 'ecos_oit_order_upload' && this.flag == '0') {
      return true
    } else {
      return false
    }
  }
  goPreStep() {
    this.tabIndex--;
    this.myskip(this.tabList[this.tabIndex])
  }
  goNextStep() {
    this.tabIndex++;
    this.myskip(this.tabList[this.tabIndex]);
  }
  cheakSo(control: FormControl) {
    if (control.value) {
      const reg = /^([\d;\s]{0,1000}$)$/;
      //const reg=/^[0-9a-zA-Z_\@\.\s\-]*$/g;
      //const reg = /^(?!\@)+(?!\_)+[0-9a-zA-Z_\@\.\s\-]*$/g;
      const valid = reg.test(control.value); // true
      return valid ? null : { soform: true };
    }
  }
  contractFileValidators(control: FormControl) {

    if (control.value && control.value.length > 0) {
      const valid = control.value.every(val => {
        if (val.status == 'success' || val.fileName) {
          return true;
        }
      })

      return !valid ? { contractFileform: true } : null
    }
  }
}
