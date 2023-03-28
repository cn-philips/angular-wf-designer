import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validator, ValidatorFn, Validators } from '@angular/forms';
import { OrderV3Service } from '@pages/order-v3/order-v3.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import * as moment from 'moment';
import { stringIndexof, isadopt, standardTime, delcommafy } from '@core/util/tools';
import { Location } from '@angular/common';
import { PreBaseInfoTableComponent } from '@pages/order-v3';
import { BreadcrumbService } from "@app/modern-themes/services/breadcrumb.service";
import { ProcessTaskStatusPipe } from "@app/shared/pipes/process-task-status.pipe"
import { RouterExtendService } from '@app/modern-themes/services/router-extend.service';
import { Subject } from 'rxjs';

export function sampleCheckValidator(control: FormGroup) {
  const sample = control.value;
  return (sample != '1') ? { 'sampleCheck': true } : null;
}

@Component({
  selector: 'app-ordersummary-base-info',
  templateUrl: './ordersummary-base-info.component.html',
  styleUrls: ['./ordersummary-base-info.component.scss']
})
export class OrdersummaryBaseInfoComponent implements OnInit {

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
    private routerExtendService: RouterExtendService

  ) { }
  
  subTierSubject = new Subject()
  public activedId: any = "pending-tab";
  public editBase: any = true; //基础信息是否编辑
  public editable: any = true; //order层级是否编辑
  public editOther: any = false; //order下的产品是否可以编辑
  public applyId //applyId
  public processInstanceTaskId//processInstanceTaskId
  public status; //流程装态
  public pageLoading: boolean = false;
  public procInstId;
  public editPreTable: any = false;
  public flag: any;
  public changeItem
  public tabIndex: any = 1
  public tabList = ['contract-tab', 'pending-tab', 'complete-tab'];
  priceData: any = {}
  productModelInfo = {
    orderProductModel: [{ value: null, disabled: !this.editBase }],
  }
  baseInfoFrom = {
    dealFormId: [{ value: null, disabled: true }, [Validators.required]],
    contractCancelDisabled: [{ value: true, disabled: true }],
    referenceId: [{ value: null, disabled: true }],

    dealFormModality: [{ value: null, disabled: true }, [Validators.required]],//dealFormModality
    businessModel: [{ value: null, disabled: true }, [Validators.required]], //业务模式
    dealFormSalesName: [{ value: null, disabled: true }],//创建人姓名
    dealFormSalesCycleGroup: [{ value: null, disabled: true }],//Cycle Group

    oitMode: [{ value: null, disabled: !this.editOther }, [Validators.required]], //进单模式
    //prebookApply: [{ value: "0", disabled: !this.editOther }, [Validators.required]], //关联prebook
    dealFormSales: [{ value: null, disabled: true }], //dealfrom创建人
    dealFormSalesModality: [{ value: null, disabled: true }], //dealFormSalesModality创建人
    dealFormSalesBigArea: [{ value: null, disabled: true }, [Validators.required]],//大区
    dealFormSalesSmallArea: [{ value: null, disabled: true }, [Validators.required]], //小区
    dealFormSalesProvince: [{ value: null, disabled: !this.editOther }], //省份
    oldSalesProvince: [{ value: null, disabled: true }],//旧的省份
    dealFormSalesCity: [{ value: null, disabled: !this.editOther }],//城市
    contractCancelSo: [{ value: null, disabled: true }],//原合同概要表So
    requiredArrivalDate: [{ value: null, disabled: true }],//要求到货日期
    estimateInstallationDate: [{ value: null, disabled: true }], //预计安装日期
    actuallyDeliveryAddress: [{ value: "", disabled: true }],//实际发货地址
    endUserActuallyDeliveryAddress: [{ value: null, disabled: !this.editOther }], //最终用户实际发货地址
    dealFormSalesTeam: [{ value: null, disabled: true }],//deal From team
    approvalAreaConfiguration: [{ value: null, disabled: !this.editOther }, [Validators.required]],//审批区域配置

    biddingType: [{ value: null, disabled: !this.editOther }],//招标类型

    dealFormSalesPerformanceProvince: [{ value: null, disabled: !this.editOther }], //业绩省份
    centralizedPurchasing: [{ value: '0', disabled: !this.editOther }, []],//是否集采项目
    biddingCompany: [{ value: null, disabled: !this.editOther }, [Validators.required]], //投标公司
    tenderNum: [{ value: null, disabled: !this.editOther }, [Validators.required]], //招标编号
    marketBundleInfo: [{ value: [], disabled: !this.editOther }, [Validators.required]], //招标编号
    id: [],
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
    contractCancelSoNo: [{ value: null, disabled: true}], //原合同概要表So
    orderRequired: [{ value: false, disabled: true }], //order summary 原产地是否必填
    optionDisabled: [{ value: true, disabled: true }],
    currencySystem: [{ value: null, disabled: true }],//币制
    orderSalesSapCode: [{ value: null, disabled: true }], //orderSalesSapCode
    dealIsDisabled: [{ value: false, disabled: true }],//是否显示经销商的按钮  
    profitNetRate: [{ value: null, disabled: true }],//经销商净利润
    profitGrossRate: [{ value: null, disabled: true }],//经销商毛利率
    profitGross: [{ value: null, disabled: true }],//经销商毛利润
    dealerProfit: [{ value: null, disabled: true }],//经销商利润  
  };
  dealerFrom = {
    dealerName: [{ value: null, disabled: true }, [Validators.required]], //经销商名称
    dealerSapCode: [{ value: null, disabled: true },],//经销商sapcode
    dealerCode: [{ value: null }],//经销商dealerCode
    dealerDdpStatus: [{ value: null, disabled: true }], //经销商Status
    dealerDdpValidityDate: [{ value: null, disabled: true }],//经销商ddp有效日期
    dealerContact: [{ value: null, disabled: !this.editOther }, [Validators.required]],//经销商联系人
    dealerPhone: [{ value: null, disabled: !this.editOther }, [Validators.required]],//经销商电话
    dealerEmail: [{ value: null, disabled: !this.editOther }, [Validators.required]],//经销商邮箱
    dealerAddress: [{ value: null, disabled: !this.editOther }, [Validators.required]],//经销商地址
    dealerTaxNum: [{ value: null, disabled: !this.editOther }, [Validators.required]],//经销商纳税号
    purchaseOrderSignatory: [{ value: null, disabled: !this.editOther }, [Validators.required]], //采购订单签署人
    purchaseOrderSignatoryPosition: [{ value: null, disabled: !this.editOther }, [Validators.required]],//采购订单签署人职务
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
    foreignTradeCorpSameDealer: [{ value: null, disabled: true }],//外贸公司与经销商相同
    foreignTradeCorpSameRelatedDealer: [{ value: null, disabled: true }],//外贸公司与经销商关联公司相同
    foreignTradeCorpSapCode: [{ value: null, disabled: true },],//外贸公司SAP Code
    foreignTradeCorpDdpStatus: [{ value: null, disabled: true }, [Validators.required]],//外贸公司DDP Status
    foreignTradeCorpDdpValidityDate: [{ value: null, disabled: true }, [Validators.required]],//DDP Status有效日期
    foreignTradeCorpTaxNum: [{ value: null, disabled: true }, [Validators.required]],//外贸公司税号
    foreignTradeCorpAddress: [{ value: null, disabled: true }, [Validators.required]], //外贸公司地址
    companyNotInIePool: [{ value: null, disabled: true }],//进出口公司选择 不在IE pool
    foreignTradeCorpName: [{ value: null, disabled: true }, [Validators.required]], //外贸公司
    foreignTradeCorpPhone: [{ value: null, disabled: true }, [Validators.required]],//外贸公司电话
    foreignTradeCorpContact: [{ value: null, disabled: true }, [Validators.required]],//外贸公司联系人
    foreignTradeCorpEmail: [{ value: null, disabled: true }, [Validators.required]],//外贸公司邮箱
    importAgreementSignName: [{ value: null, disabled: true }, [Validators.required]],//进口协议签署人
    importAgreementSignPosition: [{ value: null, disabled: true }, [Validators.required]], //进口协议签署人职务
  }
  endUserFrom = {
    endUser: [{ value: null, disabled: true }, []],//最终终用户
    endUserId: [{ value: null, disabled: true }, []],//最终用户编号
    endUserSapCode: [{ value: null, disabled: true }, []],//最终用户SAP Code
    endUserTaxNum: [{ value: null, disabled: !this.editOther }, [Validators.required]],//最终用户税号
    hospitalType: [{ value: null, disabled: true }],//医院性质
    segment: [{ value: null, disabled: true }],//segment
    endUserActuallyDeliveryAddress: [{ value: null, disabled: !this.editOther }], //最终用户实际发货地址
    endUserAddress: [{ value: null, disabled: !this.editOther }],//最终用户地址
    endUserPhone: [{ value: null, disabled: !this.editOther }, [Validators.required]],//最终用户电话
    endUserEmail: [{ value: null, disabled: !this.editOther }, [Validators.required]],//最终用户邮箱
    endUserContact: [{ value: null, disabled: !this.editOther }, [Validators.required]],//最终用户联系人
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
    tradeInTotalOS: [{ value: null, disabled: true }],//tradeInTotal总金额
    rebateTotalOS: [{ value: null, disabled: true }], //Rebate总额
    totalContractPrice: [{ value: null, disabled: true }], //进单单位合同价
    orderCtpRatio: [{ value: null, disabled: true }], //CTP总价%
    orderCtpPrice: [{ value: null, disabled: true }], //CTP总价
    promotionPlan: [{ value: null, disabled: true }], //促销计划
    warrantyInfo: [{ value: [], disabled: true }], //延长保修
    otherInfo: [{ value: [], disabled: true }], //其它预留
    applicationInfo: [{ value: [], disabled: true }], //Application
    tradeInInfo: [{ value: [], disabled: true }], // trade In 信息
    sofonNo: [{ value: null, disabled: true }], //final Sofon Quotation
    price: [{ value: null, disabled: true }], //final Sofon Quotation
    paymentCny: [{ value: null, disabled: true }], //其它付款方式不含税费用
    paymentNetCny: [{ value: null, disabled: true }],//其它付款方式含税费用
    paymentUsd: [{ value: null, disabled: true }],//其它付款方式美元费用
    creditCny: [{ value: null, disabled: true }], //远期信用证利息含税价
    creditCnyNet: [{ value: null, disabled: true }],//远期信用证利息不含税价
    creditUsd: [{ value: null, disabled: true }],//远期信用证利息美元
    sofonFile: [[], []], //Sofon Final Quotation and supporting files
    sampleCheck: [{ value: '0', disabled: true }, [Validators.required]], //是否抽样审核
    recycle: [null], //是否旧机回收
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
    switchValid: [{ value: true, disalbed: true }], //是否禁用sofon文件
    cpDealOrderId: [{ value: "", disabled: true }], //cpDealOrderId
  }

  baseInfoTable = {
    bidWinningFile: [{ value: [], disabled: !this.editOther }, []], //中标通知书/最终用户合同
    requestLetter: [{ value: [], disabled: !this.editOther }, []], //要货函/场地报告
    solutionSupportReport: [{ value: [], disabled: !this.editOther }, []],//项目解决方案售前支持报告
    biddingFile: [{ value: [], disabled: !this.editOther }, []],//招标文件
    tenderFile: [{ value: [], disabled: !this.editOther }, []],//投标文件
    endUserContract: [{ value: [], disabled: !this.editOther }, []],//最终用户合同
    projectAnalysisTable: [{ value: [], disabled: !this.editOther }, []], //项目分析表模板
    paymentProvision: [{ value: null, disabled: !this.editOther }],//付款条款
    paymentProvisionFile: [{ value: [], disabled: !this.editOther }],//付款条款文件
    paymentProvisionRemarks: [{ value: null, disabled: !this.editOther }],//付款条款备注
    qualityGuarantee: [{ value: null, disabled: !this.editOther }], //质量保函
    qualityGuaranteeRemarks: [{ value: null, disabled: !this.editOther }], //质量保函备注
    qualityGuaranteeFile: [{ value: [], disabled: !this.editOther }], //质量保函文件
    performanceBond: [{ value: null, disabled: !this.editOther }], //履约保函
    performanceBondFile: [{ value: [], disabled: !this.editOther }],//履约保函文件
    performanceBondRemarks: [{ value: null, disabled: !this.editOther }],//履约保函备注
    afterSalePrice: [{ value: null, disabled: !this.editOther }],  //是否有售后限价
    afterSalePriceFile: [{ value: [], disabled: !this.editOther }],//是否有售后限价文件
    afterSalePriceRemarks: [{ value: null, disabled: !this.editOther }],//是否有售后限价备注
    shipmentDelivery: [{ value: null, disabled: !this.editOther }],  //装运及交货
    shipmentDeliveryFile: [{ value: [], disabled: !this.editOther }], //装运及交货附件
    shipmentDeliveryRemarks: [{ value: null, disabled: !this.editOther }], //装运及交货备注
    supportFileMissing: [{ value: null, disabled: !this.editOther }], //支持文件缺失需特批进单
    supportFileMissingRemarks: [{ value: null, disabled: !this.editOther }], //支持文件缺失需特批进单备注
    supportFileMissingFile: [{ value: [], disabled: !this.editOther }], //支持文件缺失需特批进单文件
    amountDifference: [{ value: null, disabled: !this.editOther }], //直投订单合同金额和中标金额有价差
    amountDifferenceRemarks: [{ value: null, disabled: !this.editOther }], //直投订单合同金额和中标金额有价差备注
    amountDifferenceFile: [{ value: [], disabled: !this.editOther }], //直投订单合同金额和中标金额有价差文件
    installationWarranty: [{ value: null, disabled: !this.editOther }],//安装及保修
    installationWarrantyRemarks: [{ value: null, disabled: !this.editOther }],//安装及保修备注
    installationWarrantyFile: [{ value: [], disabled: !this.editOther }],//安装及保修文件
    installationWarrantySecondaryApproval: [{ value: null, disabled: !this.editOther }],//安装下一级审核 //无
    sitePreparation: [{ value: null, disabled: !this.editOther }], //场地准备
    sitePreparationFile: [{ value: [], disabled: !this.editOther }],//场地准备文件
    sitePreparationRemarks: [{ value: null, disabled: !this.editOther }],//场地准备备注
    otherTrain: [{ value: null, disabled: !this.editOther }],//合同中培训相关条款
    otherFine: [{ value: null, disabled: !this.editOther }],//罚则及违约责任(不含售后)
    otherIp: [{ value: null, disabled: !this.editOther }],//IP条款
    otherContractTemplate: [{ value: null, disabled: !this.editOther }],//非标合同模板
    otherOcap: [{ value: null, disabled: !this.editOther }],//OCAP
    other: [{ value: null, disabled: !this.editOther }],//其它
    otherLabel: [{ value: null, disabled: !this.editOther }],//其它文本框
    otherRemarks: [{ value: null, disabled: !this.editOther }],//其它备注
    otherTermsFile: [{ value: [], disabled: !this.editOther }],//其他文件
    magneticResonanceShieldingFile: [{ value: [], disabled: !this.editOther }],//磁共振屏蔽文件
    igtThirdPartyFile: [{ value: [], disabled: !this.editOther }],//IGT第三方吊塔确认文件
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
    dealerRequestLetterFile: [{ value: [], disabled: !this.editOther }],//cpcl文件
    otherSupportFile: [{ value: [], disabled: !this.editOther }],// 其它支持文件
    cpclFile: [{ value: [], disabled: !this.editOther }],//cpcl文件
    cpclFileFlag: [null] //CPCL文件是否已查
  }
  oaAddInfo = {
    customerRequestLetterDate: [null], // 客户要货函日期
    contractVersion: [null, [Validators.required]], // 合同版本
    ocap: [null], // 合同是否有OCAP条款
    purchaseVerification: [null], // 经销商自采第三方核查
    oaSupportFile: [[]], // 附件
    remark: [null], // 备注
    id: [null],
    preConcludedItem: [{ value: null, disabled: true }], //经销商自采第三方核查信息
  }
  accountFrom = {
    accountName: [{ value: null, disabled: !this.editOther }, [Validators.required]],//开户行名称
    bankName: [{ value: null, disabled: !this.editOther }, [Validators.required]],//开户行
    accountNo: [{ value: null, disabled: !this.editOther }, [Validators.required]],//账号
    registrationAddress: [{ value: null, disabled: !this.editOther }, [Validators.required]],//注册地址
    accountPhoneFax: [{ value: null, disabled: !this.editOther }],//电话/传真
    recipient: [{ value: null, disabled: !this.editOther }],//收件人
    recipientPhone: [{ value: null, disabled: !this.editOther }],//收件电话
    taxNum: [{ value: null, disabled: !this.editOther }, [Validators.required]],//税号
    invoicesDeliverAddress: [{ value: null, disabled: !this.editOther }, [Validators.required]], //发票邮寄地址
  }
  remarkFrom = {
    comments: [{ value: null, disabled: false }, [Validators.required]],
    attachmentIds: [{ value: [], disabled: false }],
  }

  contractSignForm = {
    salesAgreementNo: [{ value: null, disabled: !this.editBase }],//买卖协议号
    importAgreementNo: [{ value: null, disabled: !this.editBase }],// 进口协议号
    purchaseOrderNumber: [{ value: null, disabled: !this.editBase }],//采购订单号
    purchaseOrderSignatory: [{ value: null, disabled: !this.editBase }],//采购订单签署人
    purchaseOrderSignatoryPosition: [{ value: null, disabled: !this.editBase }],//采购订单签署人职务
    contractBuyerSignatory: [{ value: null, disabled: !this.editBase }],//合同签署人
    contractBuyerSignatoryPosition: [{ value: null, disabled: !this.editBase }],//合同签署人职务
    importAgreementSignName: [{ value: null, disabled: !this.editBase }],//进口协议签署人
    importAgreementSignPosition: [{ value: null, disabled: !this.editBase }],//进口协议签署人职务
    priceTerms: [{ value: null, disabled: !this.editBase }],//价格术语
    addressee: [{ value: null, disabled: !this.editBase }],//收件人
    addresseeTel: [{ value: null, disabled: !this.editBase }],//收件人电话
    portDestination: [{ value: null, disabled: !this.editBase }],//目的港中文名称
    portDestinationEn: [{ value: null, disabled: !this.editBase }],//目的港英文名称
    transportMode: [{ value: null, disabled: !this.editBase }],//运输方式
    invoiceMailingInformation: [{ value: null, disabled: !this.editBase }],//发票邮寄信息
    id: []
  }
  signFileForm = {
    zslNotSignedFile: [{ value: [], disabled: !this.editBase }],// 未ZSL签署的合同文件
    zslSignedFile: [{ value: [], disabled: !this.editBase }],// 已ZSL签署的合同文件
    contractConfirmedDate: [{ value: null, disabled: !this.editBase }],// 合同确认日期
    contractUploaded: [{ value: null, disabled: !this.editBase }],//正本合同已上传
    contractFile: [{ value: [], disabled: !this.editBase }],//合同文件
    supportFile: [{ value: [], disabled: !this.editBase }],//补充文件
    remark: [{ value: null, disabled: !this.editBase }],//备注

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



  @ViewChild("tabs") tabs;
  @ViewChild("baseInfoFromChild") baseInfoFromChild;
  @ViewChild("oaAddInfoChild") oaAddInfoChild;
  @ViewChild("preFileTable") preFileTable;
  public formValue: FormGroup = this.fb.group({
    productModelInfo: this.fb.group({
      ...this.productModelInfo
    }),
    baseInfoFrom: this.fb.group({
      ...this.baseInfoFrom,
    }
    ),
    dealerFrom: this.fb.group({
      ...this.dealerFrom,
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
    marketBundleInfo: this.fb.array([]),

    orderInfo: this.fb.array([]),
    baseInfoTable: this.fb.group({
      ...this.baseInfoTable
    }),
    oaAddInfo: this.fb.group({
      ...this.oaAddInfo
    }),
    remarkFrom: this.fb.group({
      ...this.remarkFrom
    }),
    signFileForm: this.fb.group({
      ...this.signFileForm,
    }),
    contractSignForm: this.fb.group({
      ...this.contractSignForm
    }),
    accountFrom: this.fb.group({
      ...this.accountFrom
    }),
    changOrderFrom: this.fb.group({
      ...this.changOrderFrom
    }),
    examineFrom: this.fb.group({
      ...this.examineFrom
    }),
    optionDisabled: [{ value: true, disabled: true }],
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

  ngOnInit() {
    this.init();
    setTimeout(() => {
      this.tabIndex = 1;
      this.myskip(this.tabList[this.tabIndex])
    }, 200);
    this.priceApprovalData.get('recycle').valueChanges.subscribe(val => {
      this.priceData.recycle = val
    })
  }
  async init() {

    this.applyId = this.activatedRouter.queryParams['_value'].id;
    this.status = this.activatedRouter.queryParams['value'].taskStatus;
    this.processInstanceTaskId = this.activatedRouter.queryParams['_value'].processInstanceTaskId;
    this.procInstId = this.activatedRouter.queryParams['value'].procInstId;
    this.flag = this.activatedRouter.queryParams['value'].flag;
    this.ProcessTaskStatusPipe.transform(this.status).subscribe(val => {
      this.breadCrumbService.replace(val)
    })
    if (this.applyId) {
      this.pageLoading = true;
      this.serveice.queryContact(this.applyId).then(res => {
        this.pageLoading = false;
        const data = res.data;
        this.getData(data)
      })
    }

    //判断是不是改单的发起
    this.serveice.changeOrder(this.applyId).then(res => {
      if (res.code == '0000' && res.data != null && Object.keys(res.data).length > 0) {
        this.changeItem = true;
        this.tabList.push('approve-change')
      }
    })
    this.changOrderFromData.get('changeOrderFile').disable();

    let processThis = this.formValue.getRawValue().processStatus ? this.formValue.getRawValue().processStatus : this.status
    let list = [
      'ecos_oit_order_os_finance',
      'ecos_oit_order_os_finance_bp',
      'ecos_oit_order_os_pm',
    ]
    if (this.flag === '1' || processThis !== 'ecos_oit_order_os_input') {
      this.formValue.disable();
      this.oaAddInfoData.disable()
      this.priceApprovalData.get('recycle').disable()
    }
    if (list.includes(processThis) && this.flag !== '1') {
      this.remarkFromData.enable()
    }
    if (!list.includes(processThis) && (this.baseInfoFromData.getRawValue().orderModality === 'US' || this.baseInfoFromData.getRawValue().orderModality === 'CC') && this.flag == '0') {
      this.priceApprovalData.get('recycle').enable()
    }

  }
  handleCancel() {
    // this.location.back();
    //  this.router.navigate(['/ecos/my-started'])
    this.routerExtendService.back();
  }
  getData(data) {

    const { contractInfo, termsCheckInfo, orderSummaryInfo } = data
    const { marketBundleInfo, currencySystem } = contractInfo
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
    } = contractInfo
    this.formValue.patchValue({
      applyId: data.applyId ? data.applyId : this.applyId,
      bigArea: data.bigArea,
      smallArea: data.smallArea,
      processInstanceTaskId: data.processInstanceTaskId ? data.processInstanceTaskId : this.processInstanceTaskId,
      cycleGroup: data.cycleGroup,
      processStatus: data.processStatus ? data.processStatus : this.status,
      modality: data.modality
    })
    this.baseInfoFromData.patchValue({
      includeSolution: contractInfo.includeSolution ? contractInfo.includeSolution : '0',
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
    })

    this.dealerFromData.patchValue({
      ...contractInfo,
      subTierInfo: contractInfo.subTierInfo || []
    })
    this.accountFromData.patchValue({
      ...contractInfo
    })
    this.productModelInfoData.patchValue({
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
    this.priceApprovalData.patchValue({
      ...data.orderSummaryInfo,
      ...contractInfo,
      warrantyInfo: data.orderSummaryInfo.warrantyInfo,
      //sofonNo: data.orderSummaryInfo.sofonNo,
      recycle: orderSummaryInfo.recycle ? orderSummaryInfo.recycle : '0'
    })
    this.baseInfoTableData.patchValue({
      ...termsCheckInfo,
      magneticResonanceShieldingFile: termsCheckInfo.magneticResonanceShieldingFile,
      igtThirdPartyFile: termsCheckInfo.igtThirdPartyFile,
    })

    this.oaAddInfoData.patchValue({
      ...data.orderSummaryInfo,
      ocap: orderSummaryInfo.ocap ? orderSummaryInfo.ocap : '0',
    })

    if (orderSummaryInfo.preConcludedItem == true) {
      this.oaAddInfoData.patchValue({
        purchaseVerification: '1'
      })
      this.oaAddInfoData.get("purchaseVerification").disable();
    }
    this.remarkFromData.patchValue({
      comments: data.comments,
      attachmentIds: data.attachmentIds
    })
    this.contractSignFormData.patchValue({
      ...data.contractSignInfo
    })

    this.signFileFormData.patchValue({
      ...data.contractSignInfo
    })


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

    if (this.marketBundleInfo.length === 0) {
      marketBundleInfo.map((val, index) => {
        this.marketBundleInfo.push(this.createProdut(val, index, currencySystem))
      })
      this.marketBundleInfo.disable();
    }
    if (this.flag == '0' && this.status == 'ecos_oit_order_os_input') {
      this.baseInfoFromData.patchValue({
        orderRequired: true,
        contractCancelDisabled: false
      })
      this.marketBundleInfo.controls.forEach((item, j) => {
        this.marketBundleInfo.at(j).get("originCountry").enable();
        this.marketBundleInfo.at(j).get("originCountryEn").enable();
        this.marketBundleInfo.at(j).get("originCountry").setValidators(Validators.required);
        this.marketBundleInfo.at(j).get("originCountryEn").setValidators(Validators.required);
        this.marketBundleInfo.at(j).get("originCountry").updateValueAndValidity();
        this.marketBundleInfo.at(j).get("originCountryEn").updateValueAndValidity();
      })

    }
    else {
      this.marketBundleInfo.disable();
      this.marketBundleInfo.controls.forEach((item, j) => {
        this.marketBundleInfo.at(j).get("originCountry").disable();
        this.marketBundleInfo.at(j).get("originCountryEn").disable();
        this.marketBundleInfo.at(j).get("originCountry").clearValidators();
        this.marketBundleInfo.at(j).get("originCountryEn").clearValidators();
        this.marketBundleInfo.at(j).get("originCountry").updateValueAndValidity();
        this.marketBundleInfo.at(j).get("originCountryEn").updateValueAndValidity();
      })
    }

    if (this.baseInfoFromData.getRawValue().businessModel == 'DISTRIBUTOR') {
      this.getdistributorDate(); //更新经销商日期    
      setTimeout(() => {
        this.subTierSubject.next({ type: 'add', data: subTierInfo, disabled: !(this.flag == '0' && this.status == 'ecos_oit_order_os_input') })
        this.baseInfoFromChild.checkBiddingEqualDealer();
      }, 0);
    }
    if (this.priceApprovalData.getRawValue().currencySystem == "USD") {
      this.getIepoolDate(); //更新经销商日期
    }
    if (this.status == 'ecos_oit_order_os_input' && this.flag == '0') {
      this.baseInfoFromData.controls.orderSalesSapCode.enable();
      this.dealerFromData.controls.dealerSapCode.enable();
      this.endUserFromData.controls.endUserSapCode.enable();
      this.foreignFromData.controls.foreignTradeCorpSapCode.enable();
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
  get productModelInfoData() {
    return this.formValue.get('productModelInfo') as FormGroup;
  }
  get changOrderFromData() {
    return this.formValue.get("changOrderFrom") as FormGroup;
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
  get accountFromData(): FormGroup {
    return this.formValue.get("accountFrom") as FormGroup;
  }
  get endUserFromData(): FormGroup {
    return this.formValue.get("endUserFrom") as FormGroup;
  }
  get baseInfoTableData(): FormGroup {
    return this.formValue.get("baseInfoTable") as FormGroup;
  }
  get oaAddInfoData(): FormGroup {
    return this.formValue.get("oaAddInfo") as FormGroup
  }
  get contractBuyerFromData(): FormGroup {
    return this.formValue.get("contractBuyerFrom") as FormGroup
  }
  get remarkFromData(): FormGroup {
    return this.formValue.get("remarkFrom") as FormGroup;
  }

  get orderInfo(): FormArray {
    return this.formValue.get("orderInfo") as FormArray;
  }

  get contractSignFormData() {
    return this.formValue.get('contractSignForm')
  }

  get signFileFormData() {
    return this.formValue.get('signFileForm')
  }

  get marketBundleInfo(): FormArray {
    return this.formValue.get("marketBundleInfo") as FormArray;
  }




  public myskip(val): void {
    //外部触发tab选项卡的事件
    this.tabs.activeId(val)
  }

  goPreStep() {
    if (this.tabIndex > 0) {
      this.tabIndex--;
      this.myskip(this.tabList[this.tabIndex])
    }

  }
  goNextStep() {
    if (this.tabIndex < this.tabList.length - 1) {
      this.tabIndex++;
      this.myskip(this.tabList[this.tabIndex]);
    }
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
        const rows = dateAndValid.data.rows
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

  async orderSubmit(parm, isApprovalReject: boolean = false) {

    let data = this.formValue.getRawValue();
    const { applyId, processInstanceTaskId, processStatus, marketBundleInfo, modality, cycleGroup, bigArea, smallArea, accountFrom, baseInfoFrom, baseInfoTable, contractBuyerFrom, dealerFrom, endUserFrom, foreignFrom, orderInfo, priceApproval, oaAddInfo, remarkFrom } = data;
    dealerFrom.dealerDdpValidityDate = dealerFrom.dealerDdpValidityDate != null && dealerFrom.dealerDdpValidityDate != '' ? moment(dealerFrom.dealerDdpValidityDate).format('YYYY-MM-DD hh:mm:ss') : null;
    foreignFrom.foreignTradeCorpDdpValidityDate = (foreignFrom.foreignTradeCorpDdpValidityDate != null && foreignFrom.foreignTradeCorpDdpValidityDate != "") ? moment(foreignFrom.foreignTradeCorpDdpValidityDate).format('YYYY-MM-DD hh:mm:ss') : null;
    oaAddInfo.customerRequestLetterDate = oaAddInfo.customerRequestLetterDate != null && oaAddInfo.customerRequestLetterDate != '' ? moment(oaAddInfo.customerRequestLetterDate).format('YYYY-MM-DD hh:mm:ss') : null;
    baseInfoFrom.requiredArrivalDate = (baseInfoFrom.requiredArrivalDate != null && baseInfoFrom.requiredArrivalDate != "") ? moment(baseInfoFrom.requiredArrivalDate).format('YYYY-MM-DD hh:mm:ss') : null;
    baseInfoFrom.estimateInstallationDate = (baseInfoFrom.estimateInstallationDate != null && baseInfoFrom.estimateInstallationDate != "") ? moment(baseInfoFrom.estimateInstallationDate).format('YYYY-MM-DD hh:mm:ss') : null;
    if (remarkFrom.attachmentIds && remarkFrom.attachmentIds.length > 0) {
      remarkFrom.attachmentIds = remarkFrom.attachmentIds.map(val => val.fileId)
    }
    priceApproval.dealPriceUsd = Number(delcommafy(priceApproval.dealPriceUsd));
    priceApproval.dealPriceCny = Number(delcommafy(priceApproval.dealPriceCny));
    const contractInfo = {
      ...baseInfoFrom,
      ...priceApproval,
      ...foreignFrom,
      ...endUserFrom,
      ...contractBuyerFrom,
      ...accountFrom,
      ...dealerFrom,
      marketBundleInfo: marketBundleInfo
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
      contractInfo: contractInfo,
      termsCheckInfo: baseInfoTable,
      orderSummaryInfo: orderSummaryInfo,
    }

    if (parm == 'approved') {
      if (processStatus === 'ecos_oit_order_os_input') {
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

        this.checkRequired()
        const { orderModality } = this.baseInfoFromData.getRawValue();
        const valid = this.checkFormData(this.priceApprovalData);
        if (!valid) {
          this.myskip("pending-tab");
          this.message.error('基础信息有必填项未填写')
          return
        }
        // if(orderModality!="CC")
        // {
        this.marketBundleInfo.controls.forEach((val, index) => {
          const group = val as FormGroup;
          this.updataControls(group)
        })
        if (!this.marketBundleInfo.valid) {
          this.myskip("pending-tab");
          this.message.error('产品信息有必填项未填写')
          return
        }
        //}

        if (!this.baseInfoTableData.valid) {
          this.myskip("pending-tab");
          this.message.error('Order Summary "tab/项目支持文件/是否已查" 未完成')
          return
        }
      }
      if (this.status === 'ecos_oit_order_os_input') {
        if (this.baseInfoFromData.getRawValue().orderModality == 'PD&IGT') {
          this.oaAddInfoData.get('customerRequestLetterDate').setValidators([Validators.required])
        }
        for (let item in this.oaAddInfoData.controls) {
          this.oaAddInfoData.controls[item].markAsDirty()
          this.oaAddInfoData.controls[item].updateValueAndValidity()
        }
        if (!this.oaAddInfoData.valid) {
          this.myskip("pending-tab");
          this.message.error('OA补充信息有必填项未填写')
          return;
        }
      }
      if (processStatus === 'ecos_oit_order_os_input') {
        this.checkRequired()
        if (!this.baseInfoTableData.valid) {
          this.message.error('Order Summary "tab/项目支持文件/是否已查" 未完成')
          return
        }
      }
      this.pageLoading = true;
      if (baseInfoFrom.businessModel == 'DISTRIBUTOR') {
        //const dateAndValid=await this.serveice.getDdpDateAndValid(dealerFrom.dealerName); 
        //console.log(dateAndValid)            
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
              this.tabIndex = 0;
              this.myskip(this.tabList[this.tabIndex])
              this.message.create("error", `经销商DDP Status未通过`);
              this.pageLoading = false;
              return
            }
          }
          else{
            this.pageLoading = false;
            this.message.create("error", `未在经销商库找到经销商信息`);
            return
          }
        }
        else {
          this.message.create("error", `未在经销商库找到经销商信息`);
          return
        }
      }
      if (priceApproval.currencySystem == 'USD') {
        if (foreignFrom.companyNotInIePool) {
          const ddpValidUntil = standardTime(foreignFrom.foreignTradeCorpDdpValidityDate)
          const ddpStatus = isadopt(ddpValidUntil);
          if (ddpStatus != "通过") {
            this.foreignFromData.patchValue({
              foreignTradeCorpDdpStatus: ddpStatus
            })
            this.tabIndex = 0;
            this.myskip(this.tabList[this.tabIndex])
            this.message.create("error", `外贸易公司DDP Status未通过`);
            this.pageLoading = false;
            return
          }
        }
        else {
          const dateAndValid = await this.serveice.findEcosiepool({ corporateName: foreignFrom.foreignTradeCorpName })
          if (dateAndValid.code == '0000') {
            const rows = dateAndValid.data.rows;
            if(rows.length>0)
            {
              const ddpValidUntil = standardTime(rows[0].ddpValidUntil)
              const ddpStatus = isadopt(ddpValidUntil);
              if (ddpStatus != "通过") {
                this.foreignFromData.patchValue({
                  foreignTradeCorpDdpStatus: "不通过",
                  foreignTradeCorpDdpValidityDate: rows[0].ddpValidUntil
                })
                this.tabIndex = 0;
                this.myskip(this.tabList[this.tabIndex])
                this.message.create("error", `外贸易公司DDP Status未通过`);
                this.pageLoading = false;
                return
              }
            }
            else{
              this.pageLoading=false;
              this.message.create("error", `未在IEPOOL找到经销商信息`);
              return
            }           
          }
          else {
            this.pageLoading=false;
            this.message.create("error", `未在IEPOOL找到经销商信息`);
            return
          }
        }
      }

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
    } else if (parm === 'apply_save') {
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
        this.myskip("complete-tab");
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
  updataControls(param: FormGroup) {
    for (const j in param.controls) {
      param.controls[j].markAsDirty()
      param.controls[j].updateValueAndValidity();
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
  addProduct(val) {
    this.clearFormArray(this.orderInfo)
    val.map((vals, index) => {
      this.orderInfo.push(this.createOrder(vals, index));
      let marketBundleInfo = this.orderInfo.at(index).get("marketBundleInfo") as FormArray;
      const hostoff = vals.marketBundleInfo.some(a => a.primaryOpportunity == 'true');
      const currencySystem = vals.currencySystem
      vals.marketBundleInfo.map((a, index) => {
        marketBundleInfo.push(this.createProdut(a, index, currencySystem));
      });
    });
    setTimeout(() => {
      this.serveice.productAction(this.formValue);
    }, 0);


  }
  tabclick(i) {
    //tab选项卡的点击事件
    if (typeof i === 'number') {
      this.tabIndex = i
    }
  }
  createOrder(val: any, index) {
    //创建
    //Order Sales信息
    const orderSalesinfo = {
      orderSales: [{ value: val.orderSales ? val.orderSales : "", disabled: false }, [Validators.required]], //销售人
      orderSalesName: [{ value: val.orderSalesName ? val.orderSalesName + '(' + val.orderSales + ')' : "", disabled: true }],//销售人名
      orderSalesModel: [{ value: val.orderSales && val.orderSalesName ? `${val.orderSalesName}(${val.orderSales})` : "", disabled: true }],//销售人名+邮箱
      orderSalesModality: [{ value: val.orderSalesModality ? val.orderSalesModality : null, disabled: true }],// Modality
      orderSalesTeam: [{ value: val.orderSalesTeam ? val.orderSalesTeam : null, disabled: true },],//Team
      orderSalesSapCode: [{ value: val.orderSalesSapCode ? val.orderSalesSapCode : null, disabled: true },],//spaCode
      approvalAreaConfiguration: [{ value: val.approvalAreaConfiguration ? val.approvalAreaConfiguration : null, disabled: true }, [Validators.required]],//审批区域配置
      orderSalesPerformanceProvince: [{ value: val.orderSalesPerformanceProvince ? val.orderSalesPerformanceProvince : null, disabled: true }],//业绩省份
      actualSalesEmail: [{ value: val.actualSalesEmail ? val.actualSalesEmail : null, disabled: true },], //实际销售
      actualSalesName: [{ value: val.actualSalesName ? val.actualSalesName : null, disabled: true }],//实际销售
      actualSalesNameModel: [{ value: val.actualSalesEmail && val.actualSalesName ? `${val.actualSalesName}(${val.actualSalesEmail})` : "", disabled: true }],//实际销售名字
      orderSalesBigArea: [{ value: val.orderSalesBigArea ? val.orderSalesBigArea : null, disabled: true }],//大区
      orderSalesSmallArea: [{ value: val.orderSalesSmallArea ? val.orderSalesSmallArea : null, disabled: true }],//小区
      orderSalesProvince: [{ value: val.orderSalesProvince ? val.orderSalesProvince : null, disabled: true }],//省份
      orderSalesCycleGroup: [{ value: val.orderSalesCycleGroup ? val.orderSalesCycleGroup : null, disabled: true }],
      modality: [{ value: val.modality ? val.modality : null, disabled: true }],
      orderOa: [{ value: val.orderOa ? val.orderOa : null, disabled: true }],
      cycleGroup: [],
      bigArea: [],
      smallArea: [],
      isDisabled: [true],
      isDisabledMain: [true],
      id: [{ value: val.id, disabled: true }],
    }
    //order 基本信息
    const orderBaseinfo = {
      cpDealOrderId: [val.cpDealOrderId],
      orderModality: [val.orderModality],
      marketBundleId: [val.marketBundleId],
      totalContractPrice: [{ value: val.totalContractPrice ? val.totalContractPrice : null, disabled: true }, []],//进单单位合同价
      sofonNum: [{ value: val.sofonNum ? val.sofonNum : null, disabled: true }, , []],//sononNo
      sofonFile: [{ value: val.sofonFile ? val.sofonFile : null, disabled: true }, , []],//sofonFile
      currencySystem: [{ value: val.currencySystem ? val.currencySystem : null, disabled: true }],//币制
      centralizedPurchasing: [{ value: val.centralizedPurchasing ? val.centralizedPurchasing : '0', disabled: true }],//是否集采项目
      contractCancelReferenceId: [{ value: val.contractCancelReferenceId ? val.contractCancelReferenceId : null, disabled: true }],//原合同概要表referenceId
      contractCancelSoNo: [{ value: val.contractCancelSoNo ? val.contractCancelSoNo : null, disabled: true }],//原合同概要表So
      contractCancelMainId: [null],//原合同概要表mainId
      contractCancelSo: [null],//原合同概要表So
      //dealerAgreementNo:[{value:null,disabled:false}],//经销商协议号
      dealerSapCode: [{ value: val.dealerSapCode ? val.dealerSapCode : null, disabled: true }],//经销商spacode
      requiredArrivalDate: [{ value: val.requiredArrivalDate ? val.requiredArrivalDate : null, disabled: true }],//要求到货日期
      estimateInstallationDate: [{ value: val.estimateInstallationDate ? val.estimateInstallationDate : null, disabled: true }],//预计安装日期
      //actuallyDeliveryAddress:[{value:"",disabled:true}],//实际发货地址
      dealerRequestLetter: [[]], //要货函文件
      cpclFile: [[]],//cpcl文件
      otherSupportFile: [[]],//其他支持文件
      magneticResonanceShieldingFile: [[]],//磁共振屏蔽公司
      igtThirdPartySingle: [{ value: '0', disabled: false }], //IGT选项框选项框
      igtThirdPartyFile: [[], []],//IGT第三方吊塔确认文件
      //prebookApply: [{ value: '0', disabled: true }, []],//已申请prebook
      prebookReferenceId: [{ value: null, disabled: true }, []], //prebook申请号
      prebookProductId: [],//prebook产品id
      prebookMainId: [],//prebook mainId,
      solutionSalesEmail: [{ value: val.solutionSalesEmail, disabled: true }, []],//solusionSale
      solutionSalesName: [{ value: val.solutionSalesName, disabled: true }], //solution名称
      solutionSalesNameModel: [{ value: val.solutionSalesEmail && val.solutionSalesName ? `${val.solutionSalesEmail}(val.solutionSalesName)` : "", disabled: true }],


    }
    //Order 最终用户信息
    const endUserinfo = {
      orderSameEndUser: [{ value: val.orderSameEndUser ? val.orderSameEndUser : '1', disabled: true }, []],// 此order是否设置与"基础信息"相同的最终用户
      endUser: [{ value: val.endUser ? val.endUser : null, disabled: true }, []],//最终终用户
      endUserId: [{ value: val.endUserId ? val.endUserId : null, disabled: true }, []],//最终用户编号
      endUserSapCode: [{ value: val.endUserSapCode ? val.endUserSapCode : null, disabled: true }, []],//最终用户SAP Code
      endUserTaxNum: [{ value: val.endUserTaxNum ? val.endUserTaxNum : null, disabled: true }, []],//最终用户税号
      hospitalType: [{ value: val.hospitalType ? val.hospitalType : null, disabled: true }],//医院性质
      segment: [{ value: val.segment ? val.segment : null, disabled: true }],//segment
      endUserAddress: [{ value: val.endUserAddress ? val.endUserAddress : null, disabled: true }],//最终用户地址
      endUserPhone: [{ value: val.endUserPhone ? val.endUserPhone : null, disabled: true }, []],//最终用户电话
      endUserEmail: [{ value: val.endUserEmail ? val.endUserEmail : null, disabled: true }, , []],//最终用户邮箱
      endUserContact: [{ value: val.endUserContact ? val.endUserContact : null, disabled: true }, []],//最终用户联系人
    }
    //Order 外贸公司
    const foreignInfo = {
      orderSameForeignTradeCorp: [{ value: val.orderSameForeignTradeCorp ? val.orderSameForeignTradeCorp : '1', disabled: true }, , []], // 此order是否设置与"基础信息"相同的外贸易公司
      foreignTradeCorpSameDealer: [{ value: val.foreignTradeCorpSameDealer ? val.foreignTradeCorpSameDealer : null, disabled: true }, []],//与外贸易公司相同
      foreignTradeCorpSapCode: [{ value: val.foreignTradeCorpSapCode ? val.foreignTradeCorpSapCode : null, disabled: true }, []],//外贸公司SAP Code
      foreignTradeCorpDdpStatus: [{ value: val.foreignTradeCorpDdpStatus ? val.foreignTradeCorpDdpStatus : null, disabled: true }, []],//外贸公司DDP Status
      foreignTradeCorpDdpValidityDate: [{ value: val.foreignTradeCorpDdpValidityDate ? val.foreignTradeCorpDdpValidityDate : null, disabled: true }, []],//DDP Status有效日期
      foreignTradeCorpTaxNum: [{ value: val.foreignTradeCorpTaxNum ? val.foreignTradeCorpTaxNum : null, disabled: true }, []],//外贸公司税号
      foreignTradeCorpAddress: [{ value: val.foreignTradeCorpAddress ? val.foreignTradeCorpAddress : null, disabled: true }, []], //外贸公司地址
      companyNotInIePool: [{ value: val.companyNotInIePool ? val.companyNotInIePool : null, disabled: true }],//进出口公司选择 不在IE pool
      foreignTradeCorpName: [{ value: val.foreignTradeCorpName ? val.foreignTradeCorpName : null, disabled: true }, []], //外贸公司
      foreignTradeCorpPhone: [{ value: val.foreignTradeCorpPhone ? val.foreignTradeCorpPhone : null, disabled: true }, []],//外贸公司电话
      foreignTradeCorpContact: [{ value: val.foreignTradeCorpContact ? val.foreignTradeCorpContact : null, disabled: true }, []],//外贸公司联系人
      foreignTradeCorpEmail: [{ value: val.foreignTradeCorpEmail ? val.foreignTradeCorpEmail : null, disabled: true }, []],//外贸公司邮箱
      importAgreementSignName: [{ value: val.importAgreementSignName ? val.importAgreementSignName : null, disabled: true }, , []],//进口协议签署人
      importAgreementSignPosition: [{ value: val.importAgreementSignPosition ? val.importAgreementSignPosition : null, disabled: true }, []], //进口协议签署人职务
    }
    //Order 主要合同条款
    const mainTrems = {
      paymentProvision: [{ value: val.paymentProvision ? val.paymentProvision : '0', disabled: this.editBase }],//付款条款
      paymentProvisionFile: val.paymentProvisionFile ? [[...val.paymentProvisionFile]] : [],//付款条款文件
      paymentProvisionRemarks: [{ value: val.paymentProvisionRemarks ? val.paymentProvisionRemarks : null, disabled: true }],//付款条款备注
      performanceBond: [{ value: val.performanceBond ? val.performanceBond : '0', disabled: true }], //履约保函
      performanceBondFile: val.performanceBondFile ? [[...val.performanceBondFile]] : [],//履约保函文件
      performanceBondRemarks: [{ value: val.performanceBondRemarks ? val.performanceBondRemarks : null, disabled: true }],//履约保函备注
      afterSalePrice: [{ value: val.afterSalePrice ? val.afterSalePrice : '0', disabled: true }],  //是否有售后限价
      afterSalePriceFile: val.afterSalePriceFile ? [[...val.afterSalePriceFile]] : [],//是否有售后限价文件
      afterSalePriceRemarks: [{ value: val.afterSalePriceRemarks ? val.afterSalePriceRemarks : null, disabled: true }],//是否有售后限价备注
    }
    //Order 其他合同条款
    const otherTerms = {
      shipmentDelivery: [{ value: val.shipmentDelivery ? val.shipmentDelivery : '0', disabled: true }],  //装运及交货
      shipmentDeliveryFile: val.shipmentDeliveryFile ? [[...val.shipmentDeliveryFile]] : [], //装运及交货附件
      shipmentDeliveryRemarks: [{ value: val.shipmentDeliveryRemarks ? val.shipmentDeliveryRemarks : null, disabled: true }], //装运及交货备注
      sitePreparation: [{ value: val.sitePreparation ? val.sitePreparation : '0', disabled: true }], //场地准备
      sitePreparationFile: val.sitePreparationFile ? [[...val.sitePreparationFile]] : [],//场地准备文件
      sitePreparationRemarks: [{ value: val.sitePreparationRemarks ? val.sitePreparationRemarks : null, disabled: true }],//场地准备备注
      installationWarranty: [{ value: val.installationWarranty ? val.installationWarranty : '0', disabled: true }],//安装及保修
      installationWarrantyRemarks: [{ value: null, disabled: true }],//安装及保修备注
      installationWarrantyFile: val.installationWarrantyFile ? [[...val.installationWarrantyFile]] : [],//安装及保修文件
      installationWarrantySecondaryApproval: [{ value: val.installationWarrantySecondaryApproval ? val.installationWarrantySecondaryApproval : '0', disabled: true }],//安装下一级审核 //无
      otherTrain: [{ value: val.otherTrain ? val.otherTrain : false, disabled: true }],//合同中培训相关条款
      otherFine: [{ value: val.otherFine ? val.otherFine : false, disabled: true }],//罚则及违约责任(不含售后)
      otherIp: [{ value: val.otherIp ? val.otherIp : false, disabled: true }],//IP条款
      otherContractTemplate: [{ value: val.otherContractTemplate ? val.otherContractTemplate : false, disabled: true }],//非标合同模板
      otherOcap: [{ value: val.otherOcap ? val.otherOcap : false, disabled: true }],//OCAP
      other: [{ value: val.other ? val.other : false, disabled: true }],//其它
      otherLabel: [{ value: val.otherLabel ? val.otherLabel : "", disabled: true }],//其它文本框
      otherRemarks: [{ value: val.otherRemarks ? val.otherRemarks : "", disabled: true }],//其它备注
      otherTermsFile: val.otherTermsFile ? [[...val.otherTermsFile]] : [],//其他文件
    }
    //Order 特批合同条款
    const speciallyTerms = {
      supportFileMissing: [{ value: val.supportFileMissing ? val.supportFileMissing : '0', disabled: true }], //支持文件缺失需特批进单
      supportFileMissingFile: val.supportFileMissingFile ? [[...val.supportFileMissingFile]] : [],//持文件缺失需特批进单文件
      supportFileMissingRemarks: [{ value: val.supportFileMissingRemarks ? val.supportFileMissingRemarks : "", disabled: true }],//持文件缺失需特批进单文件
      biddingFile: val.biddingFile ? [[...val.biddingFile]] : [],//招标文件
      tenderFile: val.tenderFile ? [[...val.tenderFile]] : [],//投标文件
      bidWinningFile: val.bidWinningFile ? [[...val.bidWinningFile]] : [], //中标通知书
      endUserContract: val.endUserContract ? [[...val.endUserContract]] : [],//最终用户合同
      projectAnalysisTable: val.projectAnalysisTable ? [[...val.projectAnalysisTable]] : [], //项目分析表模板
      amountDifference: [{ value: val.amountDifference ? val.amountDifference : '0', disabled: true }], //直投合同订单合同金额和中标金额有价差
      amountDifferenceFile: val.amountDifferenceFile ? [[...val.amountDifferenceFile]] : [],//直投合同订单合同金额和中标金额有价差文件
      amountDifferenceRemarks: [{ value: val.amountDifferenceRemarks ? val.amountDifferenceRemarks : "", disabled: true }], //直投合同订单合同金额和中标金额有价差
    }
    const group = {
      marketBundleInfo: this.fb.array([]),
    };
    return this.fb.group({
      ...group,
      orderSalesinfo: this.fb.group({
        ...orderSalesinfo
      }),
      orderBaseinfo: this.fb.group({
        ...orderBaseinfo
      }),
      endUserinfo: this.fb.group({
        ...endUserinfo
      }),
      foreignInfo: this.fb.group({
        ...foreignInfo
      }),
      mainTrems: this.fb.group({
        ...mainTrems
      }),
      otherTerms: this.fb.group({
        ...otherTerms
      }),
      speciallyTerms: this.fb.group({
        ...speciallyTerms
      })
    });
  }
  createProdut(val: any, index, currencySystem) {
    //创建产品
    const netPrice = val.netPrice ? val.netPrice : (currencySystem == 'CNY' ? val.priceCnyNet : val.priceUsd);
    const group = {
      cpOrderConfigId: [val.cpOrderConfigId],
      cpProductId: [val.cpProductId],
      cpMarketBundleId: [val.cpMarketBundleId],
      biddingMarketBundleId: [val.biddingMarketBundleId],
      primaryOpportunity: [{ value: val.primaryOpportunity, disabled: true }], //是否主机
      productConfig: [{ value: val.productConfig, disabled: true }], //产品配置
      marketBundleName: [{ value: val.marketBundleName, disabled: true }],//marketBundleName
      marketBundleBmc: [{ value: val.marketBundleBmc, disabled: true }],//BMC
      optionInfo: [{ value: val.optionInfo, disabled: true }],//option
      productInfo: [{ value: val.productInfo, disabled: true }],//标准配置
      clinicalClassification: [{ value: val.clinicalClassification, disabled: true }],//临床分类
      firstLevelDepartment: [{ value: val.firstLevelDepartment, disabled: true }],//一级科室
      secondaryDepartment: [{ value: val.secondaryDepartment, disabled: true }],//二级科室
      marketBundleAmount: [{ value: val.marketBundleAmount, disabled: true }],//数量
      productModel: [{ value: val.productModel, disabled: true }],//产品型号
      medicalDeviceName: [{ value: val.medicalDeviceName, disabled: true }],//医疗器械名称
      nmpaNum: [{ value: val.nmpaNum, disabled: true }],//nmpaNum证号
      nmpaValidityDate: [{ value: val.nmpaValidityDate, disabled: true },],//NMPA证书有效期
      dtcDealerAgreementNo: [{ value: val.dtcDealerAgreementNo, disabled: !this.editBase },],//Dtc经销商协议号
      newDealerAgreementNo: [{ value: val.newDealerAgreementNo, disabled: !this.editBase },],//最新经销商协议号newDealerAgreementNo
      simulationId: [{ value: val.simulationId, disabled: false },],//simulationId
      marketBundleId: [{ value: val.marketBundleId, disabled: false }],//marketBundleId
      opportunityId: [{ value: val.opportunityId, disabled: false }],//opportunityId
      businessOpportunityHierarchyLink: [{ value: val.opportunityHierachyLink, disabled: true }],//商机层级链接
      businessOpportunityHierarchyTitle: [{ value: "", disabled: true }], //商机链接提示
      psm: [{ value: val.psm, disabled: false },], //psm
      netPrice: [{ value: netPrice, disabled: false },],//Net Price审批价
      promotions: [{ value: val.promotions, disabled: false },],//Promotion 促销号
      rebate: [{ value: val.rebate, disabled: false },], //Rebate 经销商奖励金
      tradeIn: [{ value: val.tradeIn, disabled: false },],//Trade In
      configFile: [{ value: val.configFile, disabled: false },],//配置文件(盖章)
      wbsNo: [{ value: val.wbsNo, disabled: !this.editBase },],//WBS号
      id: [{ value: val.id, disabled: true }],
      authorizedProduct: [{ value: val.authorizedProduct, disabled: true }], //经销商产品信息
      authorizedArea: [{ value: val.authorizedArea, disabled: true }],//经销商区域
      departmentList: [],//科室列表
      departmentListFirst: [],//一级科室
      departmentListSecond: [], //二级科室列表
      dealerCodeList: [], //经销商列表
      originCountry: [{ value: val.originCountry, disabled: true }], //原产地
      originCountryEn: [{ value: val.originCountryEn, disabled: true }] //原产地英文
    }
    return this.fb.group({
      ...group,
    });

  }


  checkRequired() {
    let checkStatus = null
    let checkList = [
      'shipmentDeliveryCheckFlag', // 装运及交货是否已查
      'bidWinningNoticeCheckFlag', // 中标通知书是否已查
      'projectSolutionsCheckFlag', // 项目解决方案售前支持报告是否已查
      'biddingDocumentsCheckFlag', // 招标文件是否已查
      'tenderDocumentsCheckFlag',  // 投标文件是否已查
      'enduserContractCheckFlag',  // 最终用户合同是否已查
      'projectAnalysisTableCheckFlag', // 项目分析表是否已查
      'paymentProvisionCheckFlag', // 付款条款是否已查
      'installationWarrantyCheckFlag', // 安装及保修是否已查
      'sitePreparationCheckFlag', // 场地准备是否已查
      'supportFileMissingCheckFlag', // 支持文件缺失需特批进单是否已查
      'otherCheckFlag', // 其他是否已查
      'amountDifferenceCheckFlag', // 直投订单合同金额和中标金额有价差是否已查
      'performanceBondCheckFlag', // 履约保函是否已查
      'mrshieldingCompanyCheckflag', // 磁屏蔽是否已查
      'confirmationFileCheckFlag', // igt是否已查
      'afterSalesCheckFlag', // 是否有售后限价是否已查
      'qualityGuaranteeCheckFlag', // 质量保函
      'otherSupportFileFlag', // 其它文件已查
      'dealerRequestLetterFileFlag', // 经销商要货函是否已查
      'cpclFileFlag', // CPCL文件是否已查
      'siteReportCheckFlag', // 场地报告是否已
    ]


    const { biddingType, tenderNum, businessModel, dealFormSalesModality, orderModality } = this.baseInfoFromData.getRawValue()
    const { sampleCheck } = this.priceApprovalData.getRawValue()
    const { hospitalType } = this.endUserFromData.getRawValue()

    console.log(dealFormSalesModality)
    if (!this.preFileTable.isShowmainClause()) {
      checkList = checkList.filter(value => {
        if (
          !['shipmentDeliveryCheckFlag',
            'installationWarrantyCheckFlag',
            'amountDifferenceCheckFlag',
            'sitePreparationCheckFlag',
            'performanceBondCheckFlag',
            'afterSalesCheckFlag',
            'otherCheckFlag',
            'qualityGuaranteeCheckFlag',
          ].includes(value)
        ) {
          return value
        }
      })
    }
    if (sampleCheck === '0') {
      checkList = checkList.filter(value => {
        if (
          ![
            'biddingDocumentsCheckFlag',
            'tenderDocumentsCheckFlag',
            'enduserContractCheckFlag',
            'projectAnalysisTableCheckFlag',
          ].includes(value)
        ) {
          return value
        }
      })
    }
    if (!this.preFileTable.isSupporting()) {
      checkList = checkList.filter(value => {
        if (
          !['supportFileMissingCheckFlag',
          ].includes(value)
        ) {
          return value
        }
      })
    }
    if (!this.preFileTable.isDiffer()) {
      checkList = checkList.filter(value => {
        if (
          !['amountDifferenceCheckFlag',
          ].includes(value)
        ) {
          return value
        }
      })
    }
    if (!(this.baseInfoTableData.getRawValue().magneticResonanceShieldingFile && this.baseInfoTableData.getRawValue().magneticResonanceShieldingFile.length > 0)) {
      checkList = checkList.filter(value => {
        if (
          !['mrshieldingCompanyCheckflag',
          ].includes(value)
        ) {
          return value
        }
      })
    }
    if (!(this.baseInfoTableData.getRawValue().igtThirdPartyFile && this.baseInfoTableData.getRawValue().igtThirdPartyFile.length > 0)) {
      checkList = checkList.filter(value => {
        if (
          !['confirmationFileCheckFlag',
          ].includes(value)
        ) {
          return value
        }
      })
    }
    if (orderModality === 'PD&IGT') {
      checkList = checkList.filter(value => {
        if (
          ![
            'dealerRequestLetterFileFlag',
            'otherSupportFileFlag',
          ].includes(value)
        ) {
          return value
        }
      })
      if (biddingType === '其他类型') {
        checkList = checkList.filter(value => {
          if (
            !['biddingDocumentsCheckFlag',
              'tenderDocumentsCheckFlag',
              'enduserContractCheckFlag',
            ].includes(value)
          ) {
            return value
          }
        })
      }
      if (!this.preFileTable.bidwinningFileShow()) {
        checkList = checkList.filter(value => {
          if (
            ![
              'bidWinningNoticeCheckFlag',
            ].includes(value)
          ) {
            return value
          }
        })
      }
      if (sampleCheck == '1' && !this.preFileTable.showSampling()) {
        checkList = checkList.filter(value => {
          if (
            ![
              'biddingDocumentsCheckFlag',
              'tenderDocumentsCheckFlag',
              'enduserContractCheckFlag'
            ].includes(value)
          ) {
            return value
          }
        })
      }
      if (sampleCheck == '1' && !this.preFileTable.showProject()) {
        checkList = checkList.filter(value => {
          if (
            ![
              'projectAnalysisTableCheckFlag',
            ].includes(value)
          ) {
            return value
          }
        })
      }
      // console.log(hospitalType)
      //       if (hospitalType === '公立医院') {
      //         checkList = checkList.filter(value => {
      //           if (
      //             ![
      //               'dealerRequestLetterFileFlag',
      //             ].includes(value)
      //           ) {
      //             return value
      //           }
      //         })
      //       } else if (hospitalType === '私立医院') {
      //         checkList = checkList.filter(value => {
      //           if (
      //             ![
      //               'siteReportCheckFlag',
      //             ].includes(value)
      //           ) {
      //             return value
      //           }
      //
      //         })
      //       }

      if (businessModel === 'DIRECT') {
        checkList = checkList.filter(value => {
          if (
            ![
              'projectAnalysisTableCheckFlag',
              'enduserContractCheckFlag',
            ].includes(value)
          ) {
            return value
          }

        })
      }
    }

    if (orderModality === 'US' || orderModality === 'CC') {
      if (sampleCheck === '0') {
        checkList = checkList.filter(value => {
          if (
            ![
              'bidWinningNoticeCheckFlag',
              'tenderDocumentsCheckFlag',
              'biddingDocumentsCheckFlag',
              'enduserContractCheckFlag',
            ].includes(value)
          ) {
            return value
          }
        })
      }
      checkList = checkList.filter(value => {
        if (
          ![
            'projectSolutionsCheckFlag',
            'mrshieldingCompanyCheckflag',
            'confirmationFileCheckFlag',
            'projectAnalysisTableCheckFlag',
            'sitePreparationCheckFlag',
            'siteReportCheckFlag',
            'biddingDocumentsCheckFlag',
          ].includes(value)
        ) {
          return value
        }
      })
      if (businessModel === 'DISTRIBUTOR') {
        checkList = checkList.filter(value => {
          if (
            ![
              'biddingDocumentsCheckFlag',
              'tenderDocumentsCheckFlag',
            ].includes(value)
          ) {
            return value
          }
        })
      }
      if (!this.preFileTable.showUsbidWinningFile()) {
        checkList = checkList.filter(value => {
          if (
            ![
              'bidWinningNoticeCheckFlag',
            ].includes(value)
          ) {
            return value
          }
        })
      }
    }
    for (let item of checkList) {
      this.baseInfoTableData.controls[item].setValidators([sampleCheckValidator, Validators.required])
      this.baseInfoTableData.controls[item].markAsDirty()
      this.baseInfoTableData.controls[item].updateValueAndValidity()
      // checkStatus = this.baseInfoTableData.controls[item].value
      // if (checkStatus === '0' || checkStatus === null) {
      //   break
      // }
    }
    // return checkStatus

  }



}
