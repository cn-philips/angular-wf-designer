import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { OrderV3Service } from "../../order-v3.service";
import { Router, ActivatedRoute } from '@angular/router';
import { stringIndexof, delcommafy } from "@core/util/tools"
import {
  FormBuilder,
  FormGroup,
  FormControl,
  FormArray,
  Validators,
} from "@angular/forms";
import { NzMessageService, NzModalService } from "ng-zorro-antd";
import { isadopt, standardTime } from "@core/util/tools"
import { Location } from '@angular/common';
import * as moment from 'moment'
import { BreadcrumbService } from "@app/modern-themes/services/breadcrumb.service";

import { ProcessTaskStatusPipe } from "@app/shared/pipes/process-task-status.pipe"
import { RouterExtendService } from "@app/modern-themes/services/router-extend.service";
import { Subject } from "rxjs";
@Component({
  selector: "app-contract",
  templateUrl: "./contract.component.html",
  styleUrls: ["./contract.component.scss"],
})
export class ContractComponent implements OnInit {
  constructor(
    private serveice: OrderV3Service,
    private ProcessTaskStatusPipe: ProcessTaskStatusPipe,
    private location: Location,
    private breadCrumbService: BreadcrumbService,
    private activatedRouter: ActivatedRoute,
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router,
    private routerExtendService: RouterExtendService,
    private modalService: NzModalService,
  ) { }
  public activedId: any = "pending-tab";
  public tabIndex: any = 0;
  public editBase: any = true; //基础信息是否编辑
  public editPreTable: any = false; //基础信息的产品是否可以编辑
  public completionInfo: any //oit完成
  public contractSignInfo: any  //合同签署
  public orderSummaryInfo: any //order summary层级
  public applyId;
  public status;
  public processInstanceTaskId;
  public pageLoading: boolean = false;
  public procInstId;
  public isVisible: any = false;
  public changeItem: any = false;
  public tabList = ['pending-tab', 'approval-record'];
  public popupLoad: any = false;
  public flag;
  public cancelOrderMenu: any = false;
  remarkFrom = { //取消改单的备注
    cancelReason: [{ value: null, disabled: false }, [Validators.required]],
    cancelRemark: [{ value: null, disabled: false }],
    comments: [{ value: null, disabled: false }],
    attachmentIds: [],
    title: [{ value: '取消合同概要表', disabled: true }],
  }
  contractRemarkFrom = { //合同概要表的备注
    comments: [{ value: null, disabled: false }],
    attachmentIds: [],
  }

  priceData: any = {}
  subTierSubject = new Subject()

  productModelInfo = {
    orderProductModel: [{ value: null, disabled: !this.editBase }],
  }
  baseInfoFrom = {
    dealFormId: [{ value: null, disabled: true }, [Validators.required]],
    referenceId: [{ value: null, disabled: true }],
    dealFormModality: [{ value: null, disabled: true }, [Validators.required]],//dealFormModality
    businessModel: [{ value: null, disabled: true }, [Validators.required]], //业务模式
    oitMode: [{ value: null, disabled: true }, [Validators.required]], //进单模式
    //prebookApply: [{ value: "0", disabled: !this.editBase }, [Validators.required]], //关联prebook
    dealFormSales: [{ value: null, disabled: true }], //dealfrom创建人
    dealFormSalesName: [{ value: null, disabled: true }],//创建人姓名
    dealFormSalesModality: [{ value: null, disabled: true }], //dealFormSalesModality创建人
    dealFormSalesBigArea: [{ value: null, disabled: true }, [Validators.required]],//大区
    dealFormSalesSmallArea: [{ value: null, disabled: true }, [Validators.required]], //小区
    dealFormSalesProvince: [{ value: null, disabled: !this.editBase }], //省份
    oldSalesProvince: [{ value: null, disabled: true }],//旧的省份
    dealFormSalesCity: [{ value: null, disabled: !this.editBase }],//城市
    dealFormSalesTeam: [{ value: null, disabled: true }],//deal From team
    dealFormSalesCycleGroup: [{ value: null, disabled: true }], //Cycle Group
    approvalAreaConfiguration: [{ value: null, disabled: true }],//审批区域配置

    biddingType: [{ value: null, disabled: !this.editBase }],//招标类型
    dealFormSalesPerformanceProvince: [{ value: null, disabled: !this.editBase }],//业绩省份
    centralizedPurchasing: [{ value: '0', disabled: true }, []],//是否集采项目
    biddingCompany: [{ value: null, disabled: !this.editBase }, [Validators.required]], //投标公司
    tenderNum: [{ value: null, disabled: !this.editBase }, [Validators.required]], //招标编号
    requiredArrivalDate: [{ value: null, disabled: !this.editBase }], //要求到货日期
    estimateInstallationDate: [{ value: null, disabled: !this.editBase }], //预计安装日期
    id: [{ value: null, disabled: true }],
    ka: [{ value: null, disabled: !this.editBase }],

    orderChapterTradeInNetCny: [{ value: null, disabled: true }],
    orderChapterTradeInCny: [{ value: null, disabled: true }],
    orderChapterTradeInUsd: [{ value: null, disabled: true }],
    orderChapterRebateNetCny: [{ value: null, disabled: true }],
    orderChapterRebateCny: [{ value: null, disabled: true }],
    orderChapterRebateUsd: [{ value: null, disabled: true }],
    estimBiddingPrice: [], //预计投标价
    biddingAwardPrice: [{ value: null, disabled: true }],//中标价格
    prebookReferenceId: [{ value: null, disabled: true }, []], //prebook申请号
    prebookApplyId: [{ value: null, disabled: true }],//prebook产品id
    prebookMainId: [],//prebook mainId,
    prebookOrderId: [{ value: null, disabled: true }], //prebookorderid
    prebookStatus: [{ value: null, disabled: true }], //prebook状态
    prebookSo: [{ value: null, disabled: true }],//prebookSo
    prebookQuantity: [{ value: null, disabled: true }], //prebook数量

    orderModality: [{ value: null, disabled: true }],
    orderApprovalAreaConfiguration: [{ value: null, disabled: true }, [Validators.required]],//order 审批区域配置
    orderSalesTeam: [{ value: null, disabled: true }], //team
    orderSalesBigArea: [{ value: null, disabled: true }], //大区
    orderSalesSmallArea: [{ value: null, disabled: true }], //小区
    orderSalesModality: [{ value: null, disabled: true }],  //modality
    orderSalesProvince: [{ value: null, disabled: !this.editBase }], //省
    orderSalesPerformanceProvince: [{ value: null, disabled: !this.editBase }], //业绩省份
    orderSalesCity: [{ value: null, disabled: !this.editBase }], //市
    orderSales: [{ value: null, disabled: true }],
    orderSalesName: [{ value: null, disabled: true }],
    orderSalesCycleGroup: [{ value: null, disabled: true }], //CycleGroup
    biddingApplyList: [[], []],
    referenceIdList: [[], []],

    solutionSalesEmail: [{ value: null, disabled: true }, []],//solusionSale
    solutionSalesName: [{ value: null, disabled: true }], //solution名称
    solutionSalesNameModel: [{ value: null, disabled: true }],


    actualSalesEmail: [{ value: null, disabled: !this.editBase }], //实际销售
    actualSalesName: [{ value: null, disabled: true }],//实际销售 
    actualSalesNameModel: [{ value: null, disabled: true }],//实际销售名字

    contractCancelReferenceId: [{ value: null, disabled: !this.editBase }], //原合同概要表id
    contractCancelApplyId: [{ value: null, disabled: true }], //contractCancelApplyId
    contractCancelSoNo: [{ value: null, disabled: !this.editBase }], //原合同概要表so
    contractCancelDisabled: [{ value: true, disabled: true }], //是否禁用选择原合同概要表id
    isRequired: [{ value: false, disabled: true }],
    optionDisabled: [{ value: true, disabled: true }],
    currencySystem: [{ value: true, disabled: true }],
    orderSalesSapCode: [{ value: null, disabled: !this.editBase }], //orderSalesSapCode  
    dealIsDisabled: [{ value: false, disabled: true }],//是否显示经销商的按钮
    profitNetRate: [{ value: null, disabled: true }],//经销商净利润
    profitGrossRate: [{ value: null, disabled: true }],//经销商毛利率
    profitGross: [{ value: null, disabled: true }],//经销商毛利润
    dealerProfit: [{ value: null, disabled: true }],//经销商利润
  };
  dealerFrom = {
    dealerName: [{ value: null, disabled: true }, [Validators.required]], //经销商名称
    dealerSapCode: [{ value: null, disabled: true },],//经销商sapcode
    dealerCode: [{ value: null, disabled: true }],//经销商dealerCode
    dealerDdpStatus: [{ value: null, disabled: true }], //经销商Status
    dealerDdpValidityDate: [{ value: null, disabled: true }],//经销商ddp有效日期
    dealerContact: [{ value: null, disabled: !this.editBase }, [Validators.required]],//经销商联系人
    dealerPhone: [{ value: null, disabled: !this.editBase }, [Validators.required]],//经销商电话
    dealerEmail: [{ value: null, disabled: !this.editBase }, [Validators.required]],//经销商邮箱
    dealerAddress: [{ value: null, disabled: !this.editBase }, [Validators.required]],//经销商地址
    dealerTaxNum: [{ value: null, disabled: true }],//经销商纳税号
    purchaseOrderSignatory: [{ value: null, disabled: !this.editBase }, [Validators.required]], //采购订单签署人
    purchaseOrderSignatoryPosition: [{ value: null, disabled: !this.editBase }, [Validators.required]],//采购订单签署人职务
    subTierInfo: this.fb.array([]), // 次级经销商信息
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
  }
  endUserFrom = {
    endUser: [{ value: null, disabled: true }, []],//最终终用户
    endUserId: [{ value: null, disabled: true }, []],//最终用户编号
    endUserSapCode: [{ value: null, disabled: true }, []],//最终用户SAP Code
    endUserTaxNum: [{ value: null, disabled: true }],//最终用户税号
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
    lendingBankCompany: [{ value: null, disabled: true }],//贷款行/融资公司名称
    currencySystem: [{ value: null, disabled: true }], //币制
    financialSolution: [{ value: '0', disabled: true }],//是否使用金融方案
    financialSolutionCny: [{ value: null, disabled: true }],//金融方案金额含税
    financialSolutionCnyNet: [{ value: null, disabled: true }], //金融方案不含税
    financialSolutionUsd: [{ value: null, disabled: true }],//金融方案美元
    tradeInTotal: [{ value: null, disabled: true }],//tradeInTotal总金额
    rebateTotal: [{ value: null, disabled: true }], //Rebate总额
    sampleCheck: [{ value: '0', disabled: true }, [Validators.required]], //是否抽样审核
    vatRate: [{ value: null, disabled: true }], //税率
    dealPriceCny: [{ value: null, disabled: true }], //dealForm总价含税价
    dealPriceCnyNet: [{ value: null, disabled: true }],//dealForm总价不含税价
    dealPriceUsd: [{ value: null, disabled: true }], //dealForm总价美元
    totalContractPrice: [{ value: null, disabled: true }], //进单单位合同价
    paymentCny: [{ value: null, disabled: true }], //其它付款方式不含税费用
    paymentNetCny: [{ value: null, disabled: true }],//其它付款方式含税费用
    paymentUsd: [{ value: null, disabled: true }],//其它付款方式美元费用
    creditCny: [{ value: null, disabled: true }], //远期信用证利息含税价
    creditCnyNet: [{ value: null, disabled: true }],//远期信用证利息不含税价
    creditUsd: [{ value: null, disabled: true }],//远期信用证利息美元
    sofonFile: [[], []]
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
    paymentProvisionSecondaryApproval: [{ value: null, disabled: !this.editBase }], //付款条款二级
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
    installationWarrantySecondaryApproval: [{ value: null, disabled: true }],//安装下一级审核 //无
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
    otherTermsFile: [[]],//其他文件
    supportFileMissing: [{ value: null, disabled: !this.editBase }], //支持文件缺失需特批进单
    supportFileMissingFile: [[]],//持文件缺失需特批进单文件
    supportFileMissingRemarks: [{ value: "", disabled: !this.editBase }],//持文件缺失需特批进单文件
    amountDifference: [{ value: null, disabled: !this.editBase }], //直投合同订单合同金额和中标金额有价差
    amountDifferenceFile: [],//直投合同订单合同金额和中标金额有价差文件
    amountDifferenceRemarks: [{ value: "", disabled: !this.editBase }], //直投合同订单合同金额和中标金额有价差
    magneticResonanceShieldingFile: [{ value: [], disabled: !this.editBase }],//磁共振屏蔽文件
    igtThirdPartyFile: [{ value: [], disabled: !this.editBase }],//IGT第三方吊塔确认文件
    dealerRequestLetterFile: [{ value: [], disabled: !this.editBase }], //要货函文件
    cpclFile: [{ value: [], disabled: !this.editBase }],//cpcl文件
    otherSupportFile: [{ value: [], disabled: !this.editBase }],//其他支持文件
    id: [{ value: null, disabled: true }]
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

  @ViewChild("baseInfoFromChild") baseInfoFromChild;
  @ViewChild("productChild") productChild;
  @ViewChild("baseInfoTableChild") baseInfoTableChild;
  @ViewChild("tabs") tabs;
  @ViewChild('confim') confim;
  public formValue: FormGroup = this.fb.group({
    contractRemarkFrom: this.fb.group({
      ...this.contractRemarkFrom
    }),
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
    changOrderFrom: this.fb.group({
      ...this.changOrderFrom
    }),
    examineFrom: this.fb.group({
      ...this.examineFrom
    }),
    marketBundleInfo: this.fb.array([]),
    priceApproval: this.fb.group({ ...this.priceApproval }),
    applyId: [],
    processInstanceTaskId: [],
    processStatus: [],
    modality: [],
    cycleGroup: [],
    bigArea: [],
    smallArea: [],
    StockOff: [true],
    isFirstLoad: [false],
  });
  ngOnInit() {
    this.init();
    // this.priceApprovalData.get('recycle').valueChanges.subscribe(val => {
    //   this.priceData.recycle = val
    // })
  }
  init() {
    this.applyId = this.activatedRouter.queryParams['_value'].id;
    this.status = this.activatedRouter.queryParams['value'].taskStatus;
    this.ProcessTaskStatusPipe.transform(this.status).subscribe(val => {
      this.breadCrumbService.replace(val)
    })
    this.ProcessTaskStatusPipe.transform(this.status).subscribe(val => {
      this.breadCrumbService.replace(val)
    })
    this.processInstanceTaskId = this.activatedRouter.queryParams['value'].processInstanceTaskId
    this.flag = this.activatedRouter.queryParams['value'].flag;
    this.procInstId = this.activatedRouter.queryParams['value'].procInstId;
    this.flag == '1' && this.formValue.disable();
    this.pageLoading = true;
    if (this.applyId) {
      this.serveice.queryContact(this.applyId).then(res => {
        this.pageLoading = false;
        const { data } = res;
        if (res.code == '0000') {
          const { completionInfo, orderSummaryInfo, contractSignInfo } = data;
          this.completionInfo = completionInfo;
          this.orderSummaryInfo = orderSummaryInfo;
          this.contractSignInfo = contractSignInfo;
          this.getData(data);
        }
        else {
          this.message.error(res.msg);
        }
      })
    }
    //判断是不是改单的发起
    this.serveice.changeOrder(this.applyId).then(res => {
      if (res.code == '0000' && res.data != null && Object.keys(res.data).length > 0) {
        this.changeItem = true;
        this.dealerFromData.disable();
        this.tabList.push("approve-change");
      }
    })

    this.changOrderFromData.get('changeOrderFile').disable();
    this.serveice.changeOrderMenu(this.applyId).subscribe(res => {

      if (res.code == '0000') {
        this.cancelOrderMenu = res.data
      }
    })
  }
  handleCancel() {
    //this.location.back();
    // this.router.navigate(['/ecos/my-started'])
    this.routerExtendService.back();
  }
  getData(param) {
    const { contractInfo, termsCheckInfo } = param;
    const { marketBundleInfo } = contractInfo;
    this.formValue.patchValue({
      applyId: contractInfo.applyId ? contractInfo.applyId : this.applyId,
      processInstanceTaskId: contractInfo.processInstanceTaskId ? contractInfo.processInstanceTaskId : this.processInstanceTaskId,
      processStatus: contractInfo.processStatus ? contractInfo.processStatus : this.status,
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
      contractCancelSoNo,
      contractCancelApplyId,
      orderSalesSapCode,
      subTierInfo,
      profitNetRate,
      profitGrossRate,
      profitGross,
      dealerProfit,
    } = contractInfo
    this.productModelInfoData.patchValue({
      ...contractInfo
    })

    this.baseInfoFromData.patchValue({
      oldSalesProvince: contractInfo.dealFormSalesProvince,
      centralizedPurchasing: contractInfo.centralizedPurchasing != null ? contractInfo.centralizedPurchasing : '0',
      solutionSalesNameModel: contractInfo.solutionSalesEmail ? `${contractInfo.solutionSalesName}(${contractInfo.solutionSalesEmail})` : "",
      actualSalesNameModel: contractInfo.actualSalesEmail ? `${contractInfo.actualSalesName}(${contractInfo.actualSalesEmail})` : "",
      dealFormId,
      oitMode,
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
      ...contractInfo
    })


    const currencySystem = contractInfo.currencySystem
    marketBundleInfo.map((val, index) => {
      this.marketBundleInfo.push(this.createProdut(val, index, currencySystem))
    })

    const { endUser } = this.endUserFromData.getRawValue();
    const StockOff = ((oitMode == 'BIDDING' && endUser == 'Stock') || oitMode == 'STOCK' || centralizedPurchasing == 1) ? false : true;
    this.formValue.patchValue({
      StockOff: StockOff,
    })
    this.priceApprovalData.patchValue({
      tradeInTotal: contractInfo.currencySystem == 'CNY' ? (contractInfo.orderTradeInCnyNet != null && contractInfo.orderTradeInCnyNet != "" ? contractInfo.orderTradeInCnyNet : 0) : (contractInfo.orderTradeInUsd != null && contractInfo.orderTradeInUsd != "" ? contractInfo.orderTradeInUsd : 0),
      rebateTotal: contractInfo.currencySystem == 'CNY' ? (contractInfo.orderRebateCnyNet != null && contractInfo.orderRebateCnyNet != "" ? contractInfo.ordeRerbateCnyNet : 0) : (contractInfo.orderRebateUsd != null && contractInfo.orderRebateUsd != "" ? contractInfo.orderRebateUsd : 0),
      financialSolutionName: contractInfo.financialSolutionOther ? contractInfo.financialSolutionOther : "",
      totalContractPrice: contractInfo.totalContractPrice != null && contractInfo.totalContractPrice != "" ? contractInfo.totalContractPrice : 0,
    })
    this.priceData = {
      ...this.priceApprovalData.getRawValue()
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
    if (this.baseInfoFromData.getRawValue().businessModel == 'DISTRIBUTOR') {
      this.getdistributorDate(); //更新经销商日期    
      setTimeout(() => {
        const subTierDisbaled = !(this.flag == '0' && ['ecos_oit_order_resubmit'].includes(this.status))
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
    if (this.flag == '0') {
      this.baseInfoFromData.patchValue({
        contractCancelDisabled: contractInfo.contractCancelReferenceId ? true : false,
      })
    }
    this.marketBundleInfo.disable();
    this.serveice.productAction(this.formValue);
    this.serveice.supportFileChangAction(this.formValue);
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
  get contractRemarkFromData() {
    return this.formValue.get("contractRemarkFrom") as FormGroup;
  }
  get productModelInfoData() {
    return this.formValue.get("productModelInfo") as FormGroup;
  }
  get examineFromData() {
    return this.formValue.get("examineFrom") as FormGroup;
  }
  get changOrderFromData() {
    return this.formValue.get("changOrderFrom") as FormGroup;
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


  get orderInfo(): FormArray {
    return this.formValue.get("orderInfo") as FormArray;
  }

  public myskip(val): void {
    //外部触发tab选项卡的事件
    this.tabs.activeId(val)
    //this.tabs.error(val);
  }

  async preSubmit(parm) {
    let data = this.formValue.getRawValue();
    const { applyId, marketBundleInfo, productModelInfo, processInstanceTaskId, processStatus, modality, cycleGroup, bigArea, smallArea, accountFrom, baseInfoFrom, baseInfoTable, contractBuyerFrom, dealerFrom, endUserFrom, foreignFrom, orderInfo, priceApproval, contractRemarkFrom, remarkFrom } = data;
    dealerFrom.dealerDdpValidityDate = dealerFrom.dealerDdpValidityDate != null && dealerFrom.dealerDdpValidityDate != '' ? moment(dealerFrom.dealerDdpValidityDate).format('YYYY-MM-DD hh:mm:ss') : null;
    foreignFrom.foreignTradeCorpDdpValidityDate = (foreignFrom.foreignTradeCorpDdpValidityDate != null && foreignFrom.foreignTradeCorpDdpValidityDate != "") ? moment(foreignFrom.foreignTradeCorpDdpValidityDate).format('YYYY-MM-DD hh:mm:ss') : null;
    baseInfoFrom.requiredArrivalDate = (baseInfoFrom.requiredArrivalDate != null && baseInfoFrom.requiredArrivalDate != "") ? moment(baseInfoFrom.requiredArrivalDate).format('YYYY-MM-DD hh:mm:ss') : null;
    baseInfoFrom.estimateInstallationDate = (baseInfoFrom.estimateInstallationDate != null && baseInfoFrom.estimateInstallationDate != "") ? moment(baseInfoFrom.estimateInstallationDate).format('YYYY-MM-DD hh:mm:ss') : null;
    if (remarkFrom.attachmentIds && remarkFrom.attachmentIds.length > 0) {
      remarkFrom.attachmentIds = remarkFrom.attachmentIds.map(val => val.fileId)
    }
    if (contractRemarkFrom.attachmentIds && contractRemarkFrom.attachmentIds.length > 0) {
      contractRemarkFrom.attachmentIds = contractRemarkFrom.attachmentIds.map(val => val.fileId)
    }
    priceApproval.dealPriceUsd = Number(delcommafy(priceApproval.dealPriceUsd));
    priceApproval.dealPriceCny = Number(delcommafy(priceApproval.dealPriceCny));
    const contractInfo = {
      ...productModelInfo,
      ...accountFrom,
      ...baseInfoFrom,
      ...contractBuyerFrom,
      ...dealerFrom,
      ...endUserFrom,
      ...this.priceData,
      ...foreignFrom,
      marketBundleInfo: marketBundleInfo
    }
    let param = {}
    if (parm == 'cancel_order') {
      this.pageLoading = true;
      param = {
        ...remarkFrom,
        applyId,
        contractInfo: contractInfo,
        termsCheckInfo: baseInfoTable,
        completionInfo: this.completionInfo,
        orderSummaryInfo: this.orderSummaryInfo,
        contractSignInfo: this.contractSignInfo,
        status: parm,
        processInstanceTaskId,
        processStatus,
        modality,
        cycleGroup,
        bigArea,
        smallArea,
      }
    }
    else {
      param = {
        ...contractRemarkFrom,
        applyId,
        contractInfo: contractInfo,
        termsCheckInfo: baseInfoTable,
        completionInfo: this.completionInfo,
        orderSummaryInfo: this.orderSummaryInfo,
        contractSignInfo: this.contractSignInfo,
        status: parm,
        processInstanceTaskId,
        processStatus,
        modality,
        cycleGroup,
        bigArea,
        smallArea,
      }
    }


    if (parm == 'apply_save') {
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
    }
    else {

      if (parm == 'approved') {
        if (baseInfoFrom.businessModel == 'DISTRIBUTOR') {
          const subTierInfo = this.formValue.get('dealerFrom').get('subTierInfo') as FormArray
          if (subTierInfo.invalid) {
            this.modalService.error({
              nzTitle: '提示',
              nzContent: '经销商黑名单校验不通过，请上传必要的支持文件和备注后，再作提交'
            }).afterClose.subscribe(() => {
              // this.handleToggleTab('basic-info')
              this.tabs.activeId('pending-tab')
              setTimeout(() => {
                document.querySelector('.dealer-info').scrollIntoView()
              }, 0);
            })
            return
          }
        }
        this.pageLoading = true;
        const checkbaseInfoFrom = this.baseInfoFromChild.checkbaseInfoFromData();
        const checkdealerFrom = this.baseInfoFromChild.checkdealerFromFromData();
        const checkaccountFrom = this.baseInfoFromChild.checkaccountFromFromData();
        const checkContractBuyer = this.baseInfoFromChild.checkContractBuyerFromFromData();
        const checkforeignFrom = this.baseInfoFromChild.checkforeignFromFromData();
        const checkendUserFrom = this.baseInfoFromChild.checkendUserFromFromData();
        const baseInfoTableChild = this.baseInfoTableChild.checkFormData();
        if (!this.changeItem) {
          if (!checkbaseInfoFrom || !checkdealerFrom || !checkaccountFrom || !baseInfoTableChild || !checkforeignFrom || !checkendUserFrom) {
            this.tabIndex = 0;
            this.myskip(this.tabList[this.tabIndex]);
            this.pageLoading = false;
            this.message.create("error", `基础信息有必填项没有填写`);
            return;
          }
        }
        else {
          if (!checkbaseInfoFrom || !checkaccountFrom || !baseInfoTableChild || !checkforeignFrom || !checkendUserFrom) {
            this.tabIndex = 0;
            this.myskip(this.tabList[this.tabIndex]);
            this.pageLoading = false;
            this.message.create("error", `基础信息有必填项没有填写`);
            return;
          }
        }
        if (this.status == 'ecos_oit_order_resubmit') {

          this.contractRemarkFromData.get('comments')!.setValidators(Validators.required);
          this.contractRemarkFromData.get('comments')!.markAsDirty();
          this.contractRemarkFromData.get('comments')!.updateValueAndValidity();
          if (!this.contractRemarkFromData.valid) {
            this.tabIndex = 1;
            this.myskip(this.tabList[this.tabIndex]);
            this.message.warning("未填写备注");
            this.pageLoading = false;
            return;
          }
        }
        else {
          this.contractRemarkFromData.get('comments')!.clearValidators();
          this.contractRemarkFromData.get('comments')!.markAsPristine();
          this.contractRemarkFromData.get('comments')!.updateValueAndValidity();
        }
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
            else {
              this.message.create("error", "未在经销商库找到经销商信息");
              this.pageLoading = false;
              return
            }
          }
          else {
            this.message.create("error", `未在经销商库找到经销商信息`);
            this.pageLoading = false;
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
              const rows = dateAndValid.data.rows
              if (rows.length > 0) {
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
              else
              {
                this.message.create("error", `未在IEPOOL找到经销商信息`);
                this.pageLoading = false;
                return
              }

            }
            else {
              this.pageLoading = false;
              this.message.create("error", `未在IEPOOL找到经销商信息`);
              return
            }
          }
        }
      }


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
      }).catch((error) => {
        this.message.create("error", "请求异常")
        this.pageLoading = false;
      })
    }

  }

  //效验经销商日期
  getdistributorDate() {
    const { dealerName } = this.dealerFromData.getRawValue();
    this.serveice.findDealersByPageValid({ dealerName: dealerName }).then((item) => {
      if (item.code == '0000') {
        const { rows } = item.data;
        if(rows.length>0)
        {
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
        if(rows.length>0)
        {
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
  checkFormData = () => {
    for (const i in this.formValue.controls) {
      this.formValue.controls[i].markAsDirty();
      this.formValue.controls[i].updateValueAndValidity();
    }
    return this.formValue.valid;
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

  createProdut(val: any, index, currencySystem) {
    //创建产品
    const netPrice = val.netPrice ? val.netPrice : (currencySystem == 'CNY' ? val.priceCnyNet : val.priceUsd);
    const group = {
      cpOrderConfigId: [val.cpOrderConfigId],
      cpProductId: [val.cpProductId],
      cpMarketBundleId: [val.cpMarketBundleId],
      biddingMarketBundleId: [val.biddingMarketBundleId],
      primaryOpportunity: [{ value: val.primaryOpportunity, disabled: !this.editPreTable }], //是否主机
      productConfig: [{ value: val.productConfig, disabled: false }], //产品配置
      marketBundleName: [{ value: val.marketBundleName, disabled: false }],//marketBundleName
      marketBundleBmc: [{ value: val.marketBundleBmc, disabled: false }],//BMC
      optionInfo: [{ value: val.optionInfo, disabled: false }],//option
      productInfo: [{ value: val.productInfo, disabled: false }],//标准配置
      clinicalClassification: [{ value: val.clinicalClassification, disabled: !this.editBase }],//临床分类
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
      netPrice: [{ value: netPrice, disabled: false },],//Net Price审批价
      promotions: [{ value: val.promotions, disabled: false },],//Promotion 促销号
      rebate: [{ value: val.rebate, disabled: false },], //Rebate 经销商奖励金
      tradeIn: [{ value: val.tradeIn, disabled: false },],//Trade In
      configFile: [{ value: val.configFile, disabled: false },],//配置文件(盖章)
      wbsNo: [{ value: null, disabled: !this.editBase },],//WBS号
      authorizedProduct: [{ value: val.authorizedProduct, disabled: true }], //经销商产品信息
      authorizedArea: [{ value: val.authorizedArea, disabled: true }],//经销商区域
      id: [{ value: val.id, disabled: true }],
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
  cancelOrder() {
    //取消合同概要表
    this.confim.show("colseContract")
  }
  canChangeCelOrder() {
    //取消改单
    this.isVisible = true;
  }
  changeHandleOk() {
    //确认取消进单
    let data = this.formValue.getRawValue();
    const { applyId, marketBundleInfo, processInstanceTaskId, processStatus, modality, cycleGroup, bigArea, smallArea, accountFrom, baseInfoFrom, baseInfoTable, contractBuyerFrom, dealerFrom, endUserFrom, foreignFrom, orderInfo, priceApproval, remarkFrom } = data;
    dealerFrom.dealerDdpValidityDate = dealerFrom.dealerDdpValidityDate != null && dealerFrom.dealerDdpValidityDate != '' ? moment(dealerFrom.dealerDdpValidityDate).format('YYYY-MM-DD hh:mm:ss') : null;
    foreignFrom.foreignTradeCorpDdpValidityDate = (foreignFrom.foreignTradeCorpDdpValidityDate != null && foreignFrom.foreignTradeCorpDdpValidityDate != "") ? moment(foreignFrom.dealerDdpValidityDate).format('YYYY-MM-DD hh:mm:ss') : null;

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
      ...priceApproval,
      ...foreignFrom,
      marketBundleInfo: marketBundleInfo
    }
    const param = {
      ...remarkFrom,
      applyId: this.applyId,
      contractInfo: contractInfo,
      termsCheckInfo: baseInfoTable,
      completionInfo: this.completionInfo,
      orderSummaryInfo: this.orderSummaryInfo,
      contractSignInfo: this.contractSignInfo,
      status: 'cancel_change_order',
      processInstanceTaskId: this.processInstanceTaskId,
      processStatus: this.status,
      modality,
      cycleGroup,
      bigArea,
      smallArea,
    }
    this.popupLoad = true
    this.serveice.contractApproval(param).then(res => {
      this.popupLoad = false;
      if (res.code == '0000') {
        this.message.create('success', res.msg);
        this.router.navigate(['/ecos']);
      }
    })
  }
  changeHandleCancel() {
    this.isVisible = false;
  }
  selectConfim(val) {

    const { cancelReason, cancelRemark, comments, attachmentIds } = val.getRawValue();
    this.remarkFromData.patchValue({
      cancelReason,
      cancelRemark,
      comments: cancelRemark + (cancelReason ? cancelReason : ''),
      attachmentIds,
    })
    this.preSubmit("cancel_order")
  }

  goPreStep() {
    this.tabIndex--;
    this.myskip(this.tabList[this.tabIndex])
  }
  goNextStep() {
    this.tabIndex++;
    this.myskip(this.tabList[this.tabIndex])
  }
}
