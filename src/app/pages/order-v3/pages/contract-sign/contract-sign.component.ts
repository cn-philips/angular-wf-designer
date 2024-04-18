import { Component, OnInit, ViewChild } from '@angular/core';
import { OrderV3Service } from '@pages/order-v3/order-v3.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import * as moment from 'moment';
import { Location } from '@angular/common';
import { BreadcrumbService } from "@app/modern-themes/services/breadcrumb.service";
import { ProcessTaskStatusPipe } from "@app/shared/pipes/process-task-status.pipe"
import { HttpService } from '@core/services';
import { RouterExtendService } from '@app/modern-themes/services/router-extend.service';
import { isadopt, standardTime } from "@core/util/tools"
import { Subject } from 'rxjs';
import { compareIgnoreSensitiveCase } from '@app/utils/StringUtils';
@Component({
  selector: 'app-contract-sign',
  templateUrl: './contract-sign.component.html',
  styleUrls: ['./contract-sign.component.scss']
})
export class ContractSignComponent implements OnInit {

  subTierSubject = new Subject()

  editable: boolean = false
  public tabIndex: any = 0;
  public completionInfo: any //oit完成
  public contractSignInfo: any  //合同签署
  public orderSummaryInfo: any //order summary层级
  public contractInfo: any;
  public applyId;
  public status;
  public editBase: boolean = false
  public processInstanceTaskId;
  public pageLoading: boolean = false;
  public allowPass: boolean = false;
  public procInstId;
  public flag;
  public changeItem: any = false;
  public isdealerDdpStatus = false; //经销商日期弹窗口
  public isforeignTradeCorpDdpStatus = false; //外贸公司日期弹窗口
  public tabList = ['contract-tab', 'summary-tab', 'complete-tab', 'approval-record'];
  public signatureStatus: string;
  public applySignatureBtn: boolean = false; //签章发起
  public approvalSigatureBtn: boolean = false;//签章审核
  public confirmSigatureBtn: boolean = false; //oa确认;
  public zslSignSupplement: any;
  public attachmentOff: any = true; //是否显示附件;
  public signaturePageOff: any = false; //是否是签章邮件
  constructor(
    private serveice: OrderV3Service,
    private activatedRouter: ActivatedRoute,
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router,
    private location: Location,
    private modalService: NzModalService,
    private ProcessTaskStatusPipe: ProcessTaskStatusPipe,
    private breadCrumbService: BreadcrumbService,
    private http: HttpService,
    private routerExtendService: RouterExtendService


  ) { }

  public activedId: any = "complete-tab";

  @ViewChild('tabs') tabs
  @ViewChild("baseInfoFromChild") baseInfoFromChild;

  ngOnInit() {
    this.init()
    this.priceApprovalData.get('recycle').valueChanges.subscribe(val => {
      this.priceData.recycle = val
    })
  }

  priceData: any = {}
  contractFile: any

  productModelInfo = {
    orderProductModel: [{ value: null, disabled: !this.editBase }],
  }
  baseInfoFrom = {
    dealFormId: [{ value: null, disabled: true }, [Validators.required]],
    referenceId: [{ value: null, disabled: true }],
    contractCancelDisabled: [{ value: true, disabled: true }],


    dealFormModality: [{ value: null, disabled: true }, [Validators.required]],//dealFormModality
    businessModel: [{ value: null, disabled: true }, [Validators.required]], //业务模式

    dealFormSalesName: [{ value: null, disabled: true }],//创建人姓名
    dealFormSalesCycleGroup: [{ value: null, disabled: true }],//Cycle Group
    oitMode: [{ value: null, disabled: !this.editBase }, [Validators.required]], //进单模式
    //prebookApply:[{value:"0",disabled:!this.editBase},[Validators.required]], //关联prebook
    dealFormSales: [{ value: null, disabled: true }], //dealfrom创建人
    dealFormSalesModality: [{ value: null, disabled: true }], // deal form 创建人 modality
    modalitySales: [{ value: null, disabled: true }], //modalitySales创建人
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
    marketBundleInfo: [{ value: [], disabled: !this.editBase }, [Validators.required]], //招标编号
    requiredArrivalDate: [{ value: null, disabled: true }], //要求到货日期
    estimateInstallationDate: [{ value: null, disabled: true }], //预计安装日期
    id: [],
    ka: [{ value: null, disabled: !this.editBase }],
    contractCancelSo: [{ value: null, disabled: true }],//原合同概要表So
    //actuallyDeliveryAddress:[{value:"",disabled:!this.editBase}],//实际发货地址
    endUserActuallyDeliveryAddress: [{ value: null, disabled: !this.editBase }], //最终用户实际发货地址
    includeSolution: [{ value: '0', disabled: true }], //是否包含Solution
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


    templateList: [[], []],

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
    isRequired: [{ value: false, disabled: true }],
    orderRequired: [{ value: false, disabled: true }], //order summary 原产地是否必填
    optionDisabled: [{ value: true, disabled: true }],
    currencySystem: [{ value: true, disabled: true }],
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
    purchaseOrderSignatory: [{ value: null, disabled: !this.editBase }, [Validators.required]], //采购订单签署人
    purchaseOrderSignatoryPosition: [{ value: null, disabled: !this.editBase }, [Validators.required]],//采购订单签署人职务
    subTierInfo: this.fb.array([]), // 次级经销商信息
  }

  contractBuyerFrom = {
    contractBuyer: [{ value: null, disabled: true }, [Validators.required]],//合同买方
    contractBuyerSapCode: [{ value: null, disabled: true }, [Validators.required]], //合同买方spcode
    contractBuyerTaxNum: [{ value: null, disabled: true }, [Validators.required]],//合同买房税号
    contractBuyerAddress: [{ value: null, disabled: true }, [Validators.required]],//合同买方地址
    contractBuyerPhone: [{ value: null, disabled: true }, [Validators.required]], //合同买方电话
    contractBuyerContact: [{ value: null, disabled: true }, [Validators.required]],//合同买方联系人
    contractBuyerEmail: [{ value: null, disabled: true }, [Validators.required]],//合同买方邮箱
    contractBuyerSignatory: [{ value: null, disabled: true }, [Validators.required]],//合同签署人
    contractBuyerSignatoryPosition: [{ value: null, disabled: true }, [Validators.required]],//合同签署人职务
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
    foreignTradeCorpName: [{ value: null, disabled: true }, [Validators.required]], //外贸公司
    foreignTradeCorpPhone: [{ value: null, disabled: !this.editBase }, [Validators.required]],//外贸公司电话
    foreignTradeCorpContact: [{ value: null, disabled: !this.editBase }, [Validators.required]],//外贸公司联系人
    foreignTradeCorpEmail: [{ value: null, disabled: !this.editBase }, [Validators.required]],//外贸公司邮箱
    importAgreementSignName: [{ value: null, disabled: !this.editBase }, [Validators.required]],//进口协议签署人
    importAgreementSignPosition: [{ value: null, disabled: !this.editBase }, [Validators.required]], //进口协议签署人职务
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
    tradeInInfo: [{ value: [], disabled: true }], // trade In 信息
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
    bidWinningFile: [{ value: [], disabled: !this.editBase }, []], //中标通知书/最终用户合同
    requestLetter: [{ value: [], disabled: !this.editBase }, []], //要货函/场地报告
    solutionSupportReport: [{ value: [], disabled: !this.editBase }, []],//项目解决方案售前支持报告
    biddingFile: [{ value: [], disabled: !this.editBase }, []],//招标文件
    tenderFile: [{ value: [], disabled: !this.editBase }, []],//投标文件
    endUserContract: [{ value: [], disabled: !this.editBase }, []],//最终用户合同
    projectAnalysisTable: [{ value: [], disabled: !this.editBase }, []], //项目分析表模板
    paymentProvision: [{ value: null, disabled: !this.editBase }],//付款条款
    paymentProvisionFile: [{ value: [], disabled: !this.editBase }],//付款条款文件
    paymentProvisionRemarks: [{ value: null, disabled: !this.editBase }],//付款条款备注
    qualityGuarantee: [{ value: null, disabled: !this.editBase }], //质量保函
    qualityGuaranteeRemarks: [{ value: null, disabled: !this.editBase }], //质量保函备注
    qualityGuaranteeFile: [[]], //质量保函文件
    performanceBond: [{ value: null, disabled: !this.editBase }], //履约保函
    performanceBondFile: [{ value: [], disabled: !this.editBase }],//履约保函文件
    performanceBondRemarks: [{ value: null, disabled: !this.editBase }],//履约保函备注
    afterSalePrice: [{ value: null, disabled: !this.editBase }],  //是否有售后限价
    afterSalePriceFile: [{ value: [], disabled: !this.editBase }],//是否有售后限价文件
    afterSalePriceRemarks: [{ value: null, disabled: !this.editBase }],//是否有售后限价备注
    shipmentDelivery: [{ value: null, disabled: !this.editBase }],  //装运及交货
    shipmentDeliveryFile: [{ value: [], disabled: !this.editBase }], //装运及交货附件
    shipmentDeliveryRemarks: [{ value: null, disabled: !this.editBase }], //装运及交货备注
    supportFileMissing: [{ value: null, disabled: !this.editBase }], //支持文件缺失需特批进单
    supportFileMissingRemarks: [{ value: null, disabled: !this.editBase }], //支持文件缺失需特批进单备注
    supportFileMissingFile: [{ value: [], disabled: !this.editBase }], //支持文件缺失需特批进单文件
    amountDifference: [{ value: null, disabled: !this.editBase }], //直投订单合同金额和中标金额有价差
    amountDifferenceRemarks: [{ value: null, disabled: !this.editBase }], //直投订单合同金额和中标金额有价差备注
    amountDifferenceFile: [{ value: [], disabled: !this.editBase }], //直投订单合同金额和中标金额有价差文件
    installationWarranty: [{ value: null, disabled: !this.editBase }],//安装及保修
    installationWarrantyRemarks: [{ value: null, disabled: !this.editBase }],//安装及保修备注
    installationWarrantyFile: [{ value: [], disabled: !this.editBase }],//安装及保修文件
    installationWarrantySecondaryApproval: [{ value: null, disabled: !this.editBase }],//安装下一级审核 //无
    sitePreparation: [{ value: null, disabled: !this.editBase }], //场地准备
    sitePreparationFile: [{ value: [], disabled: !this.editBase }],//场地准备文件
    sitePreparationRemarks: [{ value: null, disabled: !this.editBase }],//场地准备备注
    otherTrain: [{ value: null, disabled: !this.editBase }],//合同中培训相关条款
    otherFine: [{ value: null, disabled: !this.editBase }],//罚则及违约责任(不含售后)
    otherIp: [{ value: null, disabled: !this.editBase }],//IP条款
    otherContractTemplate: [{ value: null, disabled: !this.editBase }],//非标合同模板
    otherOcap: [{ value: null, disabled: !this.editBase }],//OCAP
    other: [{ value: null, disabled: !this.editBase }],//其它
    otherLabel: [{ value: null, disabled: !this.editBase }],//其它文本框
    otherRemarks: [{ value: null, disabled: !this.editBase }],//其它备注
    otherTermsFile: [{ value: [], disabled: !this.editBase }],//其他文件
    magneticResonanceShieldingFile: [{ value: [], disabled: !this.editBase }],//磁共振屏蔽文件
    id: [{ value: null, disabled: true }],
    shipmentDeliveryCheckFlag: ['0'],//装运及交货是否已查
    otherSupportFileFlag: ['0'],//其它文件已查
    bidWinningNoticeCheckFlag: ['0'],//中标通知书是否已查
    siteReportCheckFlag: ['0'],//场地报告是否已查
    projectSolutionsCheckFlag: ['0'],//项目解决方案售前支持报告是否已查
    biddingDocumentsCheckFlag: ['0'],//招标文件是否已查
    tenderDocumentsCheckFlag: ['0'],//投标文件是否已查
    enduserContractCheckFlag: ['0'],//最终用户合同是否已查
    projectAnalysisTableCheckFlag: ['0'],//项目分析表是否已查
    paymentProvisionCheckFlag: ['0'],//付款条款是否已查
    installationWarrantyCheckFlag: ['0'],//安装及保修是否已查
    sitePreparationCheckFlag: ['0'],//场地准备是否已查
    supportFileMissingCheckFlag: ['0'],//支持文件缺失需特批进单是否已查
    otherCheckFlag: ['0'],//其他是否已查
    amountDifferenceCheckFlag: ['0'],//直投订单合同金额和中标金额有价差是否已查
    performanceBondCheckFlag: ['0'],//履约保函是否已查
    mrshieldingCompanyCheckflag: ['0'],//磁屏蔽是否已查
    qualityGuaranteeCheckFlag: [null],//质量保函
    confirmationFileCheckFlag: ['0'],//igt是否已查
    afterSalesCheckFlag: ['0'],//是否有售后限价是否已查
    dealerRequestLetterFileFlag: ['0'],//经销商要货函文件已查
    cpclFile: [{ value: [], disabled: !this.editBase }],//cpcl文件
    dealerRequestLetterFile: [{ value: [], disabled: !this.editBase }],//cpcl文件
    cpclFileFlag: [null], //CPCL文件是否已查
    igtThirdPartyFile: [{ value: [], disabled: !this.editBase }],//IGT第三方吊塔确认文件
    otherSupportFile: [{ value: [], disabled: !this.editBase }],//其它支持文件
  }

  remarkFrom = {
    comments: [{ value: null, disabled: false }, [Validators.required]],
    attachmentIds: [],
  }
  remarkFromsignature = {
    comments: [{ value: null, disabled: false }, [Validators.required]],
    attachmentIds: [],
  }
  oaAddInfo = {
    customerRequestLetterDate: [{ value: null, disabled: true }], // 客户要货函日期
    contractVersion: [{ value: null, disabled: true }], // 合同版本
    ocap: [{ value: null, disabled: true }], // 合同是否有OCAP条款
    purchaseVerification: [{ value: null, disabled: true }], // 经销商自采第三方核查
    oaSupportFile: [{ value: [], disabled: true }], // 附件
    remark: [{ value: null, disabled: true }], // 备注
    id: [{ value: null, disabled: true }],
    preConcludedItem: [{ value: null, disabled: true }], //经销商自采第三方核查信息
  }
  contractSignForm = {
    salesAgreementNo: [{ value: null, disabled: this.editable }],//买卖协议号
    importAgreementNo: [{ value: null, disabled: this.editable }],// 进口协议号
    purchaseOrderNumber: [{ value: null, disabled: this.editable }],//采购订单号
    purchaseOrderSignatory: [{ value: null, disabled: this.editable }],//采购订单签署人
    purchaseOrderSignatoryPosition: [{ value: null, disabled: this.editable }],//采购订单签署人职务
    contractBuyerSignatory: [{ value: null, disabled: this.editable }],//合同签署人
    contractBuyerSignatoryPosition: [{ value: null, disabled: this.editable }],//合同签署人职务
    importAgreementSignName: [{ value: null, disabled: this.editable }],//进口协议签署人
    importAgreementSignPosition: [{ value: null, disabled: this.editable }],//进口协议签署人职务
    priceTerms: [{ value: null, disabled: this.editable }],//价格术语
    addressee: [{ value: null, disabled: this.editable }],//收件人
    addresseeTel: [{ value: null, disabled: this.editable }],//收件人电话
    portDestination: [{ value: null, disabled: this.editable }],//目的港中文名称
    portDestinationEn: [{ value: null, disabled: this.editable }],//目的港英文名称
    transportMode: [{ value: null, disabled: this.editable }],//运输方式
    invoiceMailingInformation: [{ value: null, disabled: this.editable }],//发票邮寄信息
    id: [],
    accountName: [{ value: null, disabled: this.editable }],//开户行名称
    bankName: [{ value: null, disabled: this.editable }],//开户行
    accountNo: [{ value: null, disabled: this.editable }],//账号
    registrationAddress: [{ value: null, disabled: this.editable }],//注册地址
    accountPhoneFax: [{ value: null, disabled: this.editable }],//电话/传真
    taxNum: [{ value: null, disabled: this.editable }],//税号
  }
  signFileForm = {
    zslNotSignedFile: [[]],// 未ZSL签署的合同文件
    zslSignedFile: [[]],// 已ZSL签署的合同文件
    contractConfirmedDate: [{ value: null, disabled: this.editable }, [Validators.required]],// 合同确认日期
    contractUploaded: [null, [Validators.required]],//正本合同已上传
    contractFile: [[], [Validators.required, this.contractFileValidators]],//合同文件
    supportFile: [[]],//补充文件
    remark: [null],//备注
    signedFileRelationList: [], // 待签章文件与已签章文件关系数组
    zslEmail: [{ value: null, disalbed: true }],
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

  //改单的备注信息
  changOrderFrom = {
    cancelApplyId: [{ value: "", disabled: true }], //取消改单的id
    reason: [{ value: "", disabled: true }, [Validators.required]], //改单原因
    describes: [{ value: "", disabled: true }, []],//改单原因描述
    changeOrderFile: [[]],//附件
    supportRemark: [{ value: "", disabled: true }], //备注
    changeDealForm: [{ value: null, disabled: true }],//需要更改Deal Form进单
    orderChangeId: [{ value: "", disabled: true }], //审批id
  }

  //改单的审核
  examineFrom = {
    comments: [{ value: "", disabled: true }], //备注
    attachmentIds: [[]],//附件
  }
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
    oaAddInfo: this.fb.group({
      ...this.oaAddInfo
    }),
    marketBundleInfo: this.fb.array([]),
    endUserFrom: this.fb.group({
      ...this.endUserFrom
    }),
    orderInfo: this.fb.array([]),
    baseInfoTable: this.fb.group({
      ...this.baseInfoTable
    }),
    contractSignForm: this.fb.group({
      ...this.contractSignForm,
    }),
    signFileForm: this.fb.group({
      ...this.signFileForm,
      signedFileRelationList: this.fb.array([])
    }),
    remarkFrom: this.fb.group({
      ...this.remarkFrom
    }),
    changOrderFrom: this.fb.group({
      ...this.changOrderFrom
    }),
    examineFrom: this.fb.group({
      ...this.examineFrom
    }),
    remarkFromsignature: this.fb.group({
      ...this.remarkFromsignature
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
  get changOrderFromData() {
    return this.formValue.get("changOrderFrom") as FormGroup;
  }

  get contractSignFormData(): FormGroup {
    return this.formValue.get('contractSignForm') as FormGroup
  }

  get signFileFormData(): FormGroup {
    return this.formValue.get('signFileForm') as FormGroup
  }

  get remarkFromData(): FormGroup {
    return this.formValue.get("remarkFrom") as FormGroup;
  }
  get remarkFromsignatureData(): FormGroup {
    return this.formValue.get("remarkFromsignature") as FormGroup;
  }
  get productModelInfoData(): FormGroup {
    return this.formValue.get('productModelInfo') as FormGroup;
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
  get foreignFromData(): FormGroup {
    return this.formValue.get("foreignFrom") as FormGroup;
  }
  get endUserFromData(): FormGroup {
    return this.formValue.get("endUserFrom") as FormGroup;
  }
  get baseInfoTableData(): FormGroup {
    return this.formValue.get("baseInfoTable") as FormGroup;
  }
  get marketBundleInfo(): FormArray {
    return this.formValue.get("marketBundleInfo") as FormArray;
  }
  get oaAddInfoData(): FormGroup {
    return this.formValue.get("oaAddInfo") as FormGroup
  }
  get accountFromData(): FormGroup {
    return this.formValue.get("accountFrom") as FormGroup

  }
  get contractBuyerFromData(): FormGroup {
    return this.formValue.get("contractBuyerFrom") as FormGroup
  }

  init() {
    this.applyId = this.activatedRouter.queryParams['_value'].id;
    this.status = this.activatedRouter.queryParams['value'].taskStatus;
    this.processInstanceTaskId = this.activatedRouter.queryParams['value'].processInstanceTaskId;
    this.flag = this.activatedRouter.queryParams['value'].flag;
    this.procInstId = this.activatedRouter.queryParams['value'].procInstId;
    this.signatureStatus = this.activatedRouter.queryParams['value'].signatureStatus;
    this.zslSignSupplement = this.activatedRouter.queryParams['value'].zslSignSupplement;
    if (this.zslSignSupplement) {
      this.attachmentOff = false;
      this.signaturePageOff = true;
      this.tabList.push("approval-history")
    }
    else {
      this.signFileFormData.get("zslNotSignedFile").disable();
      this.signFileFormData.get("zslSignedFile").disable()
    }
    this.ProcessTaskStatusPipe.transform(this.status).subscribe(val => {
      if (this.signatureStatus == 'signatureStatus') {
        this.breadCrumbService.replace("合同电子水印签章")
      }
      else {
        this.breadCrumbService.replace(val)
      }
    })
    if (this.applyId) {
      this.pageLoading = true
      this.serveice.queryContact(this.applyId).then(res => {
        const { data } = res;
        this.pageLoading = false;
        const { contractSignInfo } = data;
        this.contractSignInfo = contractSignInfo;
        this.getData(data);
        if (this.flag === '1') {
          this.formValue.disable();
          this.contractSignFormData.disable()
          this.signFileFormData.disable()
          this.signFileFormData.get('contractUploaded').disable();
          const roleList = JSON.parse(localStorage.getItem("roles"));
          const applySignatureBtn = roleList.includes("OA"); //如果是oa可以发起签名申请
          const approvalSigatureBtn = roleList.includes("Contract Signatory"); //如果zsl可以发起
          if (this.zslSignSupplement == '1') {
            if (applySignatureBtn) {
              this.applySignatureBtn = true;
              this.remarkFromsignatureData.get("comments").enable();
              this.signFileFormData.get('zslNotSignedFile').enable();
              this.setFieldRequired('zslNotSignedFile');
            }
            else {
              this.applySignatureBtn = false;
              this.clearRequired('zslNotSignedFile')
            }
          }
          else if (this.zslSignSupplement == '2') {
            this.signFileFormData.get('zslNotSignedFile').disable();
            if (approvalSigatureBtn) {
              this.approvalSigatureBtn = true;
              this.remarkFromsignatureData.get("comments").enable();
              this.signFileFormData.get('zslSignedFile').enable();
              this.setFieldRequired('zslSignedFile')
            }
            else {
              this.applySignatureBtn = false;
              this.clearRequired('zslSignedFile')
            }
          }
          else if (this.zslSignSupplement == '3') {
            const zslAdminEmail = localStorage.getItem("ecom_ng_philips_code1");
            if (compareIgnoreSensitiveCase(zslAdminEmail, contractSignInfo.zslAdminEmail)) {
              this.approvalSigatureBtn = true;
              this.remarkFromsignatureData.get("comments").enable();
              this.signFileFormData.get('zslSignedFile').enable();
              this.setFieldRequired('zslSignedFile');
            }
            else {
              this.applySignatureBtn = false;
              this.clearRequired('zslSignedFile')
            }
          }
          else if (this.zslSignSupplement == '4' || this.zslSignSupplement == '5') {
            if (applySignatureBtn) {
              this.applySignatureBtn = true;
              this.signFileFormData.get('zslNotSignedFile').enable();
              this.remarkFromsignatureData.get("comments").enable();
              this.confirmSigatureBtn = true;
              this.setFieldRequired('zslNotSignedFile');
            }
            else {
              this.confirmSigatureBtn = false;
              this.clearRequired('zslNotSignedFile');
            }
          }
        }
        else {
          const dealerform = this.dealerFromData.getRawValue()
          const foreignFrom = this.foreignFromData.getRawValue()
          const contractBuyerFrom = this.contractBuyerFromData.getRawValue()
          const accountFrom = this.accountFromData.getRawValue()
          const contractSignForm = this.contractSignFormData.getRawValue();
        }
      })
    }
    //判断是不是改单的发起
    this.serveice.changeOrder(this.applyId).then(res => {
      if (res.code == '0000' && res.data != null && Object.keys(res.data).length > 0) {
        this.changeItem = true;
        this.tabList.push('approve-change');
      }
      this.changOrderFromData.get('changeOrderFile').disable();
    })

    setTimeout(() => {
      this.tabIndex = 2
      this.myskip(this.tabList[this.tabIndex])
    }, 200);

  }
  handleCancel() {
    //this.location.back();
    // this.router.navigate(['/ecos/my-started'])
    this.routerExtendService.back();
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
  setFieldRequired(field) {  //设置字段必填
    this.signFileFormData.get(field).setValidators(Validators.required);
    this.signFileFormData.get(field).updateValueAndValidity();
    this.signFileFormData.get(field).markAsDirty();
  }
  clearRequired(field) { //清除必填
    this.signFileFormData.get(field).disable();
    this.signFileFormData.get(field).clearValidators();
    this.signFileFormData.get(field).updateValueAndValidity();
  }
  getData(param) {

    const permission = localStorage.getItem('priceAuthority')
    const { contractInfo, contractSignInfo, completionInfo, orderSummaryInfo, termsCheckInfo } = param;
    const { marketBundleInfo, currencySystem } = contractInfo
    this.contractInfo = contractInfo;
    this.orderSummaryInfo = orderSummaryInfo;
    this.completionInfo = completionInfo;
    let contractSignInfoNow: any = JSON.parse(JSON.stringify(contractSignInfo));
    this.formValue.patchValue({
      applyId: param.applyId ? param.applyId : this.applyId,
      processInstanceTaskId: param.processInstanceTaskId ? param.processInstanceTaskId : this.processInstanceTaskId,
      processStatus: param.processStatus ? param.processStatus : this.status,
    })
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
      biddingCurrency
    } = contractInfo;
    this.zslSignSupplement = contractSignInfo.zslSignSupplement;
    this.contractSignFormData.patchValue({
      ...contractSignInfo,
      // ...contractInfo,
      id: contractSignInfo.id,
    })
    this.oaAddInfoData.patchValue({
      ...orderSummaryInfo,
      customerRequestLetterDate: orderSummaryInfo.customerRequestLetterDate ? orderSummaryInfo.customerRequestLetterDate.slice(0, 10) : null,
    })
    this.signFileFormData.patchValue({
      ...contractSignInfo,
      zslEmail: contractSignInfo.zslEmail
    })

    const signedFileRelationList = this.signFileFormData.get('signedFileRelationList') as FormArray
    if (Array.isArray(contractSignInfo.signedFileRelationList)) {
      contractSignInfo.signedFileRelationList.forEach(({ signedFileId, unsignedFileId }) => {
        signedFileRelationList.push(this.fb.group({ signedFileId, unsignedFileId }))
      })
    }

    this.productModelInfoData.patchValue({
      ...contractInfo
    }),

      this.baseInfoFromData.patchValue({
        solutionSalesNameModel: contractInfo.solutionSalesEmail ? `${contractInfo.solutionSalesName}(${contractInfo.solutionSalesEmail})` : "",
        actualSalesNameModel: contractInfo.actualSalesEmail ? `${contractInfo.actualSalesName}(${contractInfo.actualSalesEmail})` : "",
        biddingAwardPrice: orderSummaryInfo.biddingAwardPrice,
        biddingAwardCurrency: orderSummaryInfo.biddingAwardCurrency,
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
        biddingCurrency
      })

    this.dealerFromData.patchValue({
      ...contractInfo,
      subTierInfo: contractInfo.subTierInfo || []
    })
    this.dealerFromData.disable();
    this.foreignFromData.patchValue({
      ...contractInfo
    })
    this.foreignFromData.disable();
    this.endUserFromData.patchValue({
      ...contractInfo
    })
    this.accountFromData.patchValue({
      ...contractInfo
    })
    this.priceApprovalData.patchValue({
      ...orderSummaryInfo,
      ...contractInfo,
    })
    this.baseInfoTableData.patchValue({
      ...termsCheckInfo
    })
    this.contractBuyerFromData.patchValue({
      ...contractInfo
    })

    this.remarkFromData.patchValue({
      comments: param.comments,
      attachmentIds: param.attachmentIds
    })
    this.baseInfoTableData.disable();
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
      this.marketBundleInfo.disable();
    }
    if (this.flag == '0') {
      if (this.status == 'ecos_oit_order_sign') {
        const cpDealOrderId = this.priceApprovalData.getRawValue().cpDealOrderId;
        if (!cpDealOrderId) {
          this.serveice.getCpDealOrderId(contractInfo.oitOrderId).subscribe(item => {
            if (item.code == '0000') {
              this.priceApprovalData.patchValue({
                cpDealOrderId: item.data.cpDealOrderId
              })
            }
          })
        }
      }

      setTimeout(() => {
        const dealerform = this.dealerFromData.getRawValue()
        const foreignFrom = this.foreignFromData.getRawValue()
        const contractBuyerFrom = this.contractBuyerFromData.getRawValue()
        const accountFrom = this.accountFromData.getRawValue()
        const contractSignForm = this.contractSignFormData.getRawValue()
        this.contractSignFormData.patchValue({
          accountName: contractSignInfoNow.accountName ? contractSignInfoNow.accountName : accountFrom.accountName,
          bankName: contractSignInfoNow.bankName ? contractSignInfoNow.bankName : accountFrom.bankName,
          accountNo: contractSignInfoNow.accountNo ? contractSignInfoNow.accountNo : accountFrom.accountNo,
          registrationAddress: contractSignInfoNow.registrationAddress ? contractSignInfoNow.registrationAddress : accountFrom.registrationAddress,
          accountPhoneFax: contractSignInfoNow.accountPhoneFax ? contractSignInfoNow.accountPhoneFax : accountFrom.accountPhoneFax,
          taxNum: contractSignInfoNow.taxNum ? contractSignInfoNow.taxNum : accountFrom.taxNum,
          purchaseOrderSignatory: contractSignForm.purchaseOrderSignatory ? contractSignForm.purchaseOrderSignatory : dealerform.purchaseOrderSignatory,
          purchaseOrderSignatoryPosition: contractSignForm.purchaseOrderSignatoryPosition ? contractSignForm.purchaseOrderSignatoryPosition : dealerform.purchaseOrderSignatoryPosition,
          importAgreementSignName: contractSignForm.importAgreementSignName ? contractSignForm.importAgreementSignName : foreignFrom.importAgreementSignName,
          importAgreementSignPosition: contractSignForm.importAgreementSignPosition ? contractSignForm.importAgreementSignPosition : foreignFrom.importAgreementSignPosition,
          contractBuyerSignatory: contractSignForm.contractBuyerSignatory ? contractSignForm.contractBuyerSignatory : contractBuyerFrom.contractBuyerSignatory,
          contractBuyerSignatoryPosition: contractSignForm.contractBuyerSignatoryPosition ? contractSignForm.contractBuyerSignatoryPosition : contractBuyerFrom.contractBuyerSignatoryPosition,
          addressee: contractSignForm.addressee ? contractSignForm.addressee : accountFrom.recipient,
          addresseeTel: contractSignForm.addresseeTel ? contractSignForm.addresseeTel : accountFrom.recipientPhone,
          invoiceMailingInformation: contractSignForm.invoiceMailingInformation ? contractSignForm.invoiceMailingInformation : accountFrom.invoicesDeliverAddress,
        })
        if (this.status == 'ecos_oit_order_sign') {
          this.baseInfoFromData.controls.orderSalesSapCode.enable();
          this.dealerFromData.controls.dealerSapCode.enable();
          this.endUserFromData.controls.endUserSapCode.enable();
          this.foreignFromData.controls.foreignTradeCorpSapCode.enable();
          this.baseInfoFromData.patchValue({
            contractCancelDisabled: false,
          })
        }
      }, 0);
    }
    this.priceApprovalData.patchValue({
      tradeInTotal: contractInfo.currencySystem == 'CNY' ? (contractInfo.orderTradeInCnyNet != null && contractInfo.orderTradeInCnyNet != "" ? contractInfo.orderTradeInCnyNet : 0) : (contractInfo.orderTradeInUsd != null && contractInfo.orderTradeInUsd != "" ? contractInfo.orderTradeInUsd : 0),
      rebateTotal: contractInfo.currencySystem == 'CNY' ? (contractInfo.orderRebateCnyNet != null && contractInfo.orderRebateCnyNet != "" ? contractInfo.ordeRerbateCnyNet : 0) : (contractInfo.orderRebateUsd != null && contractInfo.orderRebateUsd != "" ? contractInfo.orderRebateUsd : 0),
      financialSolutionName: contractInfo.financialSolutionOther ? (contractInfo.financialSolutionOther == 'null' ? '' : contractInfo.financialSolutionOther) : "",
      tradeInTotalOS: contractInfo.currencySystem == 'CNY' ? (contractInfo.orderChapterTradeInNetCny != null && contractInfo.orderChapterTradeInNetCny != "" ? contractInfo.orderChapterTradeInNetCny : 0) : (contractInfo.orderTradeInUsd != null && contractInfo.orderChapterTradeInUsd != "" ? contractInfo.orderChapterTradeInUsd : 0),
      rebateTotalOS: contractInfo.currencySystem == 'CNY' ? (contractInfo.orderChapterRebateNetCny != null && contractInfo.orderChapterRebateNetCny != "" ? contractInfo.orderChapterRebateNetCny : 0) : (contractInfo.orderChapterRebateUsd != null && contractInfo.orderChapterRebateUsd != "" ? contractInfo.orderChapterRebateUsd : 0),
    })
    this.priceData = {
      ...this.priceApprovalData.getRawValue()
    }
    if (localStorage.getItem('contractPriceAuthority') == 'false') {
      this.priceApprovalData.patchValue({
        tradeInTotal: '',
        rebateTotal: '',
        tradeInTotalOS: '',
        rebateTotalOS: '',
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
    if (this.baseInfoFromData.getRawValue().businessModel == 'DISTRIBUTOR') {
      this.getdistributorDate(); //更新经销商日期
      setTimeout(() => {
        const subTierDisbaled = !(this.flag == '0' && ['ecos_oit_order_os_input', 'ecos_oit_order_sign'].includes(this.status))
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
    this.priceApprovalData.get('sofonFile').setValidators(Validators.required);
    this.priceApprovalData.get('sofonFile').updateValueAndValidity();
    if (this.baseInfoFromData.getRawValue().oitMode == 'BIDDING') {
      this.getBiddingIsSpecial();
    }
  }
  getBiddingIsSpecial() {//bidding模式是否是特批
    let { biddingApplyList } = this.baseInfoFromData.getRawValue();
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
  dealerDdpStatusCancel() {
    this.isdealerDdpStatus = false;
  }
  foreignTradeCorpDdpStatusCancels() {
    this.isforeignTradeCorpDdpStatus = false;
  }
  dealerDdpStatusOk() {
    this.isdealerDdpStatus = false;
    this.isforeignTradeCorpDdpStatus = false;
    this.allowPass = true;
    this.orderSubmit('approved')
  }
  foreignTradeCorpDdpStatusOk() {
    this.isdealerDdpStatus = false;
    this.isforeignTradeCorpDdpStatus = false;
    this.allowPass = true;
    this.orderSubmit('approved')
  }
  //效验经销商日期
  getdistributorDate() {

    const { dealerName } = this.dealerFromData.getRawValue();
    console.log(this.dealerFromData.getRawValue())
    this.serveice.findDealersByPageValid({ dealerName: dealerName }).then((item) => {
      if (item.code == '0000') {
        const { rows } = item.data;
        if (rows.length > 0) {
          moment(rows[0].mdtdealerddpexpiredate).format('YYYY-MM-DD')
          const ddpValidUntil = standardTime(rows[0].mdtdealerddpexpiredate)
          const ddpStatus = isadopt(ddpValidUntil);
          if (ddpStatus != "通过") {
            setTimeout(() => {
              this.dealerFromData.patchValue({
                dealerDdpStatus: "不通过",
                dealerDdpValidityDate: moment(rows[0].mdtdealerddpexpiredate).format('YYYY-MM-DD')
              })
            }, 1000);

          }
          else {
            setTimeout(() => {
              this.dealerFromData.patchValue({
                dealerDdpStatus: "通过",
                dealerDdpValidityDate: moment(rows[0].mdtdealerddpexpiredate).format('YYYY-MM-DD')
              })
            }, 1000)
          }
        }
        else {
          this.message.create("error", '经销商未在经销商列表里边');
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
        else {
          this.message.create("error", '外贸公司不存在IEPOOL列表');
        }
      }
    }
  }
  async orderSubmit(parm, isApprovalReject: boolean = false) {
    let data = this.formValue.getRawValue();
    const {
      applyId,
      processInstanceTaskId,
      processStatus,
      modality,
      cycleGroup,
      bigArea,
      smallArea,
      contractSignForm,
      signFileForm,
      remarkFrom,
      baseInfoFrom,
      dealerFrom,
      priceApproval,
      foreignFrom,
      accountFrom,
      contractBuyerFrom,
      marketBundleInfo,
      endUserFrom,
      oaAddInfo,
    } = data;
    signFileForm.contractConfirmedDate = signFileForm.contractConfirmedDate != null && signFileForm.contractConfirmedDate != '' ? moment(signFileForm.contractConfirmedDate).format('YYYY-MM-DD hh:mm:ss') : null;
    dealerFrom.dealerDdpValidityDate = dealerFrom.dealerDdpValidityDate != null && dealerFrom.dealerDdpValidityDate != '' ? moment(dealerFrom.dealerDdpValidityDate).format('YYYY-MM-DD hh:mm:ss') : null;
    foreignFrom.foreignTradeCorpDdpValidityDate = (foreignFrom.foreignTradeCorpDdpValidityDate != null && foreignFrom.foreignTradeCorpDdpValidityDate != "") ? moment(foreignFrom.foreignTradeCorpDdpValidityDate).format('YYYY-MM-DD hh:mm:ss') : null;
    oaAddInfo.customerRequestLetterDate = oaAddInfo.customerRequestLetterDate != null && oaAddInfo.customerRequestLetterDate != '' ? moment(oaAddInfo.customerRequestLetterDate).format('YYYY-MM-DD hh:mm:ss') : null;
    baseInfoFrom.requiredArrivalDate = (baseInfoFrom.requiredArrivalDate != null && baseInfoFrom.requiredArrivalDate != "") ? moment(baseInfoFrom.requiredArrivalDate).format('YYYY-MM-DD hh:mm:ss') : null;
    baseInfoFrom.estimateInstallationDate = (baseInfoFrom.estimateInstallationDate != null && baseInfoFrom.estimateInstallationDate != "") ? moment(baseInfoFrom.estimateInstallationDate).format('YYYY-MM-DD hh:mm:ss') : null;
    this.accountFromData.patchValue({
      accountName: contractSignForm.accountName,
      bankName: contractSignForm.bankName,
      accountNo: contractSignForm.accountNo,
      registrationAddress: contractSignForm.registrationAddress,
      accountPhoneFax: contractSignForm.accountPhoneFax,
    })

    const contractSignInfo = {
      id: contractSignForm.id,
      ...contractSignForm,
      ...signFileForm
    }
    const contractInfo = {
      ...accountFrom,
      ...baseInfoFrom,
      ...contractBuyerFrom,
      ...dealerFrom,
      ...endUserFrom,
      ...this.priceData,
      ...foreignFrom,
      marketBundleInfo: marketBundleInfo
    }

    if (remarkFrom.attachmentIds && remarkFrom.attachmentIds.length > 0) {
      remarkFrom.attachmentIds = remarkFrom.attachmentIds.map(val => val.fileId)
    }

    const orderSummaryInfo = {
      ...priceApproval,
      ...oaAddInfo,
    }

    const param = {
      ...remarkFrom,
      applyId,
      status: parm,
      processInstanceTaskId,
      processStatus,
      modality,
      cycleGroup,
      bigArea,
      smallArea,
      contractSignInfo: contractSignInfo,
      orderSummaryInfo: orderSummaryInfo,
      completionInfo: this.completionInfo,
      contractInfo: contractInfo
    }

    if (parm == 'approved') {
      if (param.processStatus === 'ecos_oit_order_sign' && this.baseInfoFromData.getRawValue().businessModel == 'DISTRIBUTOR') {
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

      this.setSignRequired()
      for (const i in this.contractSignFormData.controls) {
        this.contractSignFormData.controls[i].markAsDirty();
        this.contractSignFormData.controls[i].updateValueAndValidity();
      }
      for (const i in this.signFileFormData.controls) {
        this.signFileFormData.controls[i].markAsDirty();
        this.signFileFormData.controls[i].updateValueAndValidity();
      }
      const valid = this.checkFormData(this.priceApprovalData);
      if (!valid) {
        this.message.error('有必填项未填写')
        this.myskip("summary-tab");
        return
      }
      if (!this.contractSignFormData.valid || !this.signFileFormData.valid) {

        this.message.error('有必填项未填写')
        this.myskip("complete-tab");
        return
      }
      //合同签署补充文件
      const signFileForm = this.signFileFormData.getRawValue()
      if (param.processStatus === 'ecos_oit_order_sign') {
        let contractSignInfoExtra = {}
        if (signFileForm.contractUploaded) {
          contractSignInfoExtra = {
            oaSupplementContract: signFileForm.contractUploaded
          }
        } else {
          contractSignInfoExtra = {
            oaSupplementContract: '0'
          }
        }
        Object.assign(param.contractSignInfo, contractSignInfoExtra)
      }
      this.pageLoading = true;
      if (baseInfoFrom.businessModel == 'DISTRIBUTOR') {
        //const dateAndValid=await this.serveice.getDdpDateAndValid(dealerFrom.dealerName);
        //console.log(dateAndValid)
        if (!this.allowPass) {
          const dateAndValid = await this.serveice.findDealersByPageValid({ dealerName: dealerFrom.dealerName })
          if (dateAndValid.code == '0000') {
            const rows = dateAndValid.data.rows
            if (rows.length > 0) {
              const ddpValidUntil = standardTime(rows[0].mdtdealerddpexpiredate)
              const ddpStatus = isadopt(ddpValidUntil);
              if (ddpStatus != "通过") {
                this.dealerFromData.patchValue({
                  dealerDdpStatus: "不通过",
                  dealerDdpValidityDate: rows[0].mdtdealerddpexpiredate
                })
                this.isdealerDdpStatus = true;
                this.pageLoading = false;
                return
              }
            }
            else {
              this.message.create("error", "经销商未在经销商列表里边");
              this.pageLoading = false;
              return
            }

          }

        }
      }
      if (priceApproval.currencySystem == 'USD') {
        if (!this.allowPass) {
          if (foreignFrom.companyNotInIePool) {
            const ddpValidUntil = standardTime(foreignFrom.foreignTradeCorpDdpValidityDate)
            const ddpStatus = isadopt(ddpValidUntil);
            if (ddpStatus != "通过") {
              this.foreignFromData.patchValue({
                foreignTradeCorpDdpStatus: ddpStatus
              })
              this.isforeignTradeCorpDdpStatus = true;
              this.pageLoading = false;
              return
            }
          }
          else {
            const dateAndValid = await this.serveice.findEcosiepool({ corporateName: foreignFrom.foreignTradeCorpName })

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
                  this.isforeignTradeCorpDdpStatus = true;
                  this.pageLoading = false;
                  return
                }
              }
              else{
                this.message.create("error", "外贸公司未在外贸列表里边");
                this.pageLoading = false;
                return
              }

            }

          }
        }
      }
      this.serveice.contractApproval(param).then(res => {
        if (res.code == '0000') {
          this.pageLoading = false;
          const { data } = res;
          this.getData(data)
          this.message.create('success', res.msg);
          this.routerExtendService.back();
        }
        else {
          this.message.error(res.msg);
          this.pageLoading = false;
        }
      })
    } else if (parm === 'apply_save') {
      this.setSignRequired()
      // for (const i in this.contractSignFormData.controls) {
      //   this.contractSignFormData.controls[i].markAsDirty();
      //   this.contractSignFormData.controls[i].updateValueAndValidity();
      // }
      // if (!this.contractSignFormData.valid) {
      //   return
      // }
      this.pageLoading = true;
      this.serveice.contractSave(param).then(res => {
        if (res.code == '0000') {
          this.pageLoading = false;
          const { data } = res;
          this.getData(data)
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
        this.message.error('备注未填')
        return
      }
      this.pageLoading = true;
      this.serveice.contractApproval(param).then(res => {
        if (res.code == '0000') {
          this.pageLoading = false;
          const { data } = res;
          this.getData(data)
          this.message.create('success', res.msg);
          // this.router.navigate(['/ecos']);
          this.routerExtendService.back();
        }
        else {
          this.message.error(res.msg);
          this.pageLoading = false;
        }
      })
    }
  }
  applySignatureSubmit(status, zslSignSupplement, backParam: any = false) {
    const { signFileForm, remarkFrom, contractSignForm, applyId, remarkFromsignature } = this.formValue.getRawValue();
    signFileForm.contractConfirmedDate = signFileForm.contractConfirmedDate != null && signFileForm.contractConfirmedDate != '' ? moment(signFileForm.contractConfirmedDate).format('YYYY-MM-DD hh:mm:ss') : null;
    if (signFileForm.zslNotSignedFile && signFileForm.zslNotSignedFile.constructor == FormArray) {
      signFileForm.zslNotSignedFile = signFileForm.zslNotSignedFile.getRawValue();
    }
    const contractSignInfo = {
      id: contractSignForm.id,
      ...contractSignForm,
      ...signFileForm
    }
    //const zslAdminEmail = localStorage.getItem("ecom_ng_philips_code1");
    const param = {
      remark: remarkFromsignature.comments,
      //zslAdminEmail,
      applyId,
      status,
      zslSignSupplement,
      contractSignInfo,
    }
    if (status == 'submit' && zslSignSupplement != 1 && !backParam) {
      const valid = this.cheakSignaturForm(this.signFileFormData);
      if (!valid) {
        this.message.create("error", "有必填项没有填写");
        this.myskip("complete-tab");
        return
      }
    }
    if (backParam) {
      this.remarkFromsignatureData.get("comments").setValidators(Validators.required);
      this.remarkFromsignatureData.get("comments").markAsDirty();
      this.remarkFromsignatureData.updateValueAndValidity();
      const valid = this.cheakSignaturForm(this.remarkFromsignatureData);
      if (!valid) {
        this.message.create("error", "有必填项没有填写");
        this.myskip("approval-history")
        return
      }
    }
    this.pageLoading = true;
    this.serveice.signatureSubmit(param).subscribe(res => {
      this.pageLoading = false;
      if (res.code == '0000') {
        if (status == 'submit') {
          this.message.create('success', res.msg);
          this.routerExtendService.back();
        }
        else {
          this.message.create('success', res.msg);
        }
      }
    })
  }
  tabclick(i) {
    //tab选项卡的点击事件
    if (typeof i === 'number') {
      this.tabIndex = i;
    }
  }


  setSignRequired() {
    const baseInfo = this.baseInfoFromData.getRawValue();
    const priceInfo = this.priceApprovalData.getRawValue();

    if (baseInfo.businessModel === 'DIRECT') {
      this.contractSignFormData.get('salesAgreementNo').setValidators([Validators.required]);
    } else if (baseInfo.businessModel === 'DISTRIBUTOR') {
      this.contractSignFormData.get('purchaseOrderNumber').setValidators([Validators.required]);
    }

    if (priceInfo.currencySystem === 'CNY') {
      //this.contractSignFormData.get('invoiceMailingInformation').setValidators([Validators.required]);
      //this.contractSignFormData.get('addressee').setValidators([Validators.required]);
      //this.contractSignFormData.get('addresseeTel').setValidators([Validators.required]);

    } else if (priceInfo.currencySystem === 'USD') {
      this.contractSignFormData.get('portDestination').setValidators([Validators.required]);
      this.contractSignFormData.get('portDestinationEn').setValidators([Validators.required]);
      this.contractSignFormData.get('transportMode').setValidators([Validators.required]);
      this.contractSignFormData.get('priceTerms').setValidators([Validators.required]);
      this.contractSignFormData.get('importAgreementNo').setValidators([Validators.required]);
    }
  }

  cheakSignaturForm(param) { //检查是否必填
    for (const i in param.controls) {
      param.controls[i].markAsDirty();
      param.controls[i].updateValueAndValidity();
    }
    return param.valid;
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
  checkFormData = (paramForm) => {
    for (const i in paramForm.controls) {
      paramForm.controls[i].markAsDirty();
      paramForm.controls[i].updateValueAndValidity();
    }
    return paramForm.valid;
  };
  public myskip(val): void {
    //外部触发tab选项卡的事件
    this.tabs.activeId(val)
  }
  goPreStep() {
    this.tabIndex--;
    this.myskip(this.tabList[this.tabIndex])
  }
  goNextStep() {
    this.tabIndex++;
    this.myskip(this.tabList[this.tabIndex]);
  }

}
