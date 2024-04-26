import { Component, Input, OnInit, ViewChild, ElementRef } from "@angular/core";
import { OrderV3Service } from "../../order-v3.service";
import { Router, ActivatedRoute } from '@angular/router';
import { stringIndexof, delcommafy, floatSub, floatAdd, floatMultiply, fomatFloat,disreduce } from "@core/util/tools"
import {
  FormBuilder,
  FormGroup,
  FormControl,
  FormArray,
  Validators,
} from "@angular/forms";
import { NzMessageService, NzModalService } from "ng-zorro-antd";
import * as moment from 'moment'
import { isadopt, standardTime } from "@core/util/tools"
import { Location } from '@angular/common';
import { BreadcrumbService } from "@app/modern-themes/services/breadcrumb.service";
import { ProcessTaskStatusPipe } from "@app/shared/pipes/process-task-status.pipe"
import { Group } from "@core/domain";
import { RouterExtendService } from "@app/modern-themes/services/router-extend.service";
import { AppService } from '../../../../app.service';
import { Subject } from "rxjs";

@Component({
  selector: "app-pre-order",
  templateUrl: "./pre-order.component.html",
  styleUrls: ["./pre-order.component.scss"],
})
export class PreOrderComponent implements OnInit {
  constructor(private serveice: OrderV3Service,
    private breadCrumbService: BreadcrumbService,
    private ProcessTaskStatusPipe: ProcessTaskStatusPipe,
    private location: Location,
    private activatedRouter: ActivatedRoute,
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router,
    private AppService: AppService,
    private routerExtendService: RouterExtendService,
    private modalService: NzModalService,
  ) {
    this.serveice.pageLoadReceiv.subscribe(res => {
      this.pageLoading = res;
    })
  }

  subTierSubject = new Subject()
  public submitStatus: any = "apply_submit";
  public tabIndex: any = 0;
  public editBase: any = true; //基础信息是否编辑
  public editable: any = true; //order层级是否编辑
  public editPreTable: any = true; //order下的产品是否可以编辑
  public applyId //applyId
  public processInstanceTaskId//processInstanceTaskId
  public status; //流程状态
  public pageLoading: boolean = false;
  public verifiOff = true; //效验按钮禁用与否
  public isVisibleWinCheck = false; // 中标校验弹出框
  public procInstId;
  public tabList = ['pending-tab', 'complete-tab'];
  public dataBase: any = {
    //bidding进单数据
    businessModel: "",
    centralized: "",
    sampleAuditFlag: ""
  }
  tableLoad: any = false; //中标效验loadding
  public flag;
  remarkFrom = {
    comments: [{ value: null, disabled: false }, [Validators.required]],
    attachmentIds: [],
  }
  productModelInfo = {
    orderProductModel: [{ value: null, disabled: !this.editBase }],
  }
  baseInfoFrom = {
    dealFormId: [{ value: null, disabled: true }, [Validators.required]],
    referenceId: [{ value: null, disabled: true }],
    dealFormModality: [{ value: null, disabled: true }, [Validators.required]],//dealFormModality
    businessModel: [{ value: null, disabled: true }, [Validators.required]], //业务模式
    oitMode: [{ value: null, disabled: !this.editBase }, [Validators.required]], //进单模式
    // prebookApply: [{ value: "0", disabled: true }, [Validators.required]], //关联prebook
    dealFormSales: [{ value: null, disabled: true }], //dealfrom创建人
    dealFormSalesName: [{ value: null, disabled: true }],//创建人姓名
    dealFormSalesModality: [{ value: null, disabled: true }], //dealFormSalesModality创建人
    dealFormSalesBigArea: [{ value: null, disabled: true }],//大区
    dealFormSalesSmallArea: [{ value: null, disabled: true }], //小区
    dealFormSalesProvince: [{ value: null, disabled: !this.editBase }], //省份
    oldSalesProvince: [{ value: null, disabled: true }],//旧的省份
    dealFormSalesCity: [{ value: null, disabled: !this.editBase }],//城市
    dealFormSalesTeam: [{ value: null, disabled: true }],//deal From team
    dealFormSalesCycleGroup: [{ value: null, disabled: true }], //Cycle Group
    approvalAreaConfiguration: [{ value: null, disabled: !this.editBase }, [Validators.required]],//审批区域配置
    biddingType: [{ value: null, disabled: !this.editBase }, [Validators.required]],//招标类型
    dealFormSalesPerformanceProvince: [{ value: null, disabled: !this.editBase }],//业绩省份
    centralizedPurchasing: [{ value: '0', disabled: !this.editBase }, []],//是否集采项目
    biddingCompany: [{ value: null, disabled: !this.editBase }, [Validators.required]], //投标公司
    tenderNum: [{ value: null, disabled: !this.editBase }, [Validators.required]], //招标编号
    requiredArrivalDate: [{ value: null, disabled: !this.editBase }], //客户要货函日期
    estimateInstallationDate: [{ value: null, disabled: !this.editBase }], //预计安装日期
    ka: [{ value: null, disabled: !this.editBase }],
    estimBiddingPrice: [], //预计投标价
    prebookReferenceId: [{ value: null, disabled: true }, []], //prebook申请号
    prebookApplyId: [{ value: null, disabled: true }],//prebook产品id
    prebookMainId: [],//prebook mainId,
    prebookOrderId: [{ value: null, disabled: true }], //prebookorderid
    prebookStatus: [{ value: null, disabled: true }], //prebook状态
    prebookSo: [{ value: null, disabled: true }],//prebookSo
    prebookQuantity: [{ value: null, disabled: true }], //prebook数量
    biddingAwardPrice: [{ value: null, disabled: true }],//中标价格
    id: [],
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

    actualSalesEmail: [{ value: null, disabled: !this.editBase }], //实际销售
    actualSalesName: [{ value: null, disabled: true }],//实际销售
    actualSalesNameModel: [{ value: null, disabled: true }],//实际销售名字

    contractCancelReferenceId: [{ value: null, disabled: true }], //原合同概要表id
    contractCancelApplyId: [{ value: null, disabled: true }], //contractCancelApplyId
    contractCancelSoNo: [{ value: null, disabled: true }], //原so
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
    dealerSapCode: [{ value: null, disabled: true }, [Validators.required]],//经销商sapcode
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
    foreignTradeCorpSapCode: [{ value: null, disabled: !this.editBase }],//外贸公司SAP Code
    foreignTradeCorpDdpStatus: [{ value: null, disabled: false }, []],//外贸公司DDP Status
    foreignTradeCorpDdpValidityDate: [{ value: null, disabled: true }],//DDP Status有效日期
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
    endUserTaxNum: [{ value: null, disabled: true },],//最终用户税号
    hospitalType: [{ value: null, disabled: true }],//医院性质
    endUserActuallyDeliveryAddress: [{ value: null, disabled: !this.editBase }], //最终用户实际发货地址
    segment: [{ value: null, disabled: false }],//segment
    endUserAddress: [{ value: null, disabled: !this.editBase }, [Validators.required]],//最终用户地址
    endUserPhone: [{ value: null, disabled: !this.editBase }, [Validators.required]],//最终用户电话
    endUserEmail: [{ value: null, disabled: !this.editBase },],//最终用户邮箱
    endUserContact: [{ value: null, disabled: !this.editBase }, [Validators.required]],//最终用户联系人
    usHta: [{ value: null, disabled: true }], //是否HTA US
  }
  priceApproval = {
    currencySystem: [{ value: null, disabled: true }], //币制
    financialSolution: [{ value: '0', disabled: true }],//是否使用金融方案
    lendingBankCompany: [{ value: null, disabled: true }],//贷款行/融资公司名称
    financialSolutionName: [{ value: null, disabled: true }],//金融方案
    financialSolutionOther: [{ value: null, disabled: true }], //其他金融方案
    financialSolutionCny: [{ value: null, disabled: true }],//金融方案金额含税
    financialSolutionCnyNet: [{ value: null, disabled: true }], //金融方案不含税
    financialSolutionUsd: [{ value: null, disabled: true }],//金融方案美元
    tradeInTotal: [{ value: null, disabled: true }],//tradeInTotal总金额
    rebateTotal: [{ value: null, disabled: true }], //Rebate总额
    sampleCheck: [{ value: '0', disabled: true }], //是否抽样审核
    vatRate: [{ value: null, disabled: true }], //税率
    dealPriceCny: [{ value: null, disabled: true }], //dealForm总价含税价
    dealPriceCnyNet: [{ value: null, disabled: true }],//dealForm总价不含税价
    dealPriceUsd: [{ value: null, disabled: true }], //dealForm总价美元
    totalContractPrice: [{ value: null, disabled: true }], //进单单位合同价
    equipmentPriceNetCny: [{ value: null, disabled: true }], //净设备不含税价
    equipmentPriceCny: [{ value: null, disabled: true }],//净设备总价含税价
    equipmentPriceUsd: [{ value: null, disabled: true }],
    dealerSelfPurchasePriceNetCny: [{ value: null, disabled: true }], //第三方自采价格
    dealerSelfPurchasePriceCny: [{ value: null, disabled: true }],
    dealerSelfPurchasePriceUsd: [{ value: null, disabled: true }],
    otherPaymentCnyNet: [{ value: null, disabled: true }], //其他付款方式金额
    otherPaymentCny: [{ value: null, disabled: true }],
    otherPaymentUsd: [{ value: null, disabled: true }],
  }

  baseInfoTable = {
    bidWinningFile: [[], []], //中标通知书/最终用户合同
    requestLetter: [[], []], //要货函/场地报告
    solutionSupportReport: [[], []],//项目解决方案售前支持报告
    biddingFile: [[], []],//招标文件
    tenderFile: [[], []],//投标文件
    endUserContract: [[], []],//最终用户合同
    projectAnalysisTable: [[], []], //项目分析表模板
    magneticResonanceShieldingFile: [[]],
    igtThirdPartyFile: [[]],
  }
  public bidData = [];

  @ViewChild("baseInfoFromChild") baseInfoFromChild;
  @ViewChild("productChild") productChild;
  @ViewChild("baseInfoTableChild") baseInfoTableChild;
  @ViewChild("tabs") tabs;
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
    orderInfo: this.fb.array([]),
    baseInfoTable: this.fb.group({
      ...this.baseInfoTable
    }),
    remarkFrom: this.fb.group({
      ...this.remarkFrom
    }),
    priceApproval: this.fb.group({ ...this.priceApproval }),
    applyId: [],
    processInstanceTaskId: [],
    processStatus: [],
    modality: [],
    cycleGroup: [],
    bigArea: [],
    smallArea: [],
    isload: [false],
    isFirstLoad: [false],
    StockOff: [true],
    team: [],
    province: [],
    role: [],
    cluster: [],
    bmc: []
  });
  ngOnInit() {
    this.init();
  }

  async departMent(marketBundleInfo, departmentListFirst) {
    //科室列表
    let departmentList = departmentListFirst.data;
    departmentListFirst = departmentList.map(item => {
      let obj = {
        department: item.department,
        departmentLable: item.department
      }
      return obj
    })
    if (departmentListFirst.length > 0) {
      marketBundleInfo.controls.forEach((items, index) => {
        const group = marketBundleInfo.at(index) as FormGroup
        const firstLevelDepartment = group.getRawValue().firstLevelDepartment;
        const select = departmentList.find(items => items.department == firstLevelDepartment);
        group.get('firstLevelDepartment').setValidators(Validators.required)
        group.get('secondaryDepartment').setValidators(Validators.required)
        group.get('firstLevelDepartment').updateValueAndValidity()
        group.get('secondaryDepartment').updateValueAndValidity();
        group.patchValue({
          departmentListFirst: departmentListFirst,
          departmentList: departmentList,
          departUsRequired: true,
        })
        if (select) {
          const group = marketBundleInfo.at(index) as FormGroup;
          group.patchValue({
            departmentListFirst: departmentListFirst,
            departmentListSecond: select.children
          })
        }
      })
    }

  }
  init() {
    this.tabIndex = 0;
    this.applyId = this.activatedRouter.queryParams['_value'].id;
    this.status = this.activatedRouter.queryParams['value'].taskStatus;
    if (this.status == 'ecos_oit_deal_resubmit') {
      this.submitStatus = 'approved'
    }
    else {
      this.submitStatus = 'apply_submit'
    }
    if (this.status) {
      this.ProcessTaskStatusPipe.transform(this.status).subscribe(val => {
        this.breadCrumbService.replace(val);
      })
    }
    else {
      this.breadCrumbService.replace("新建进单准备表");
    }
    if (this.status == "ecos_oit_deal_resubmit" || this.status == "ecos_oit_deal_submit") {
      this.tabList.push('approval-record')
    }
    if (this.status == 'ecos_oit_deal_resubmit') {
      this.tabList.push('approval-remarks')
    }

    this.processInstanceTaskId = this.activatedRouter.queryParams['_value'].processInstanceTaskId;
    this.flag = this.activatedRouter.queryParams['_value'].flag;
    this.procInstId = this.activatedRouter.queryParams['value'].procInstId;
    if (this.flag == "1") {
      this.formValue.disable()
      this.editPreTable = false;
    }
    if (this.applyId) {
      this.pageLoading = true;
      this.serveice.queryOrder(this.applyId).then(res => {
        this.pageLoading = false;
        const data = res.data;
        this.getData(data)
      })
    }
  }
  getData(data) {

    const { orderInfo } = data.preparationInfo;
    this.formValue.patchValue({
      applyId: data.applyId ? data.applyId : this.applyId,
      bigArea: data.bigArea,
      smallArea: data.smallArea,
      processInstanceTaskId: data.processInstanceTaskId ? data.processInstanceTaskId : this.processInstanceTaskId,
      cycleGroup: data.cycleGroup,
      processStatus: data.processStatus ? data.processStatus : this.status,
      modality: data.modality,
      team: data.team,
      province: data.province,
      role: data.role,
      cluster: data.cluster,
      bmc: data.bmc
    })
    const {
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
      contractCancelSoNo,
      contractCancelApplyId,
      orderSalesSapCode,
      subTierInfo,
      profitNetRate,
      profitGrossRate,
      profitGross,
      dealerProfit,
      biddingCurrency
    } = data.preparationInfo

    this.baseInfoFromData.patchValue({
      oldSalesProvince: data.preparationInfo.dealFormSalesProvince,
      centralizedPurchasing: data.preparationInfo.centralizedPurchasing,
      oitMode: data.preparationInfo.oitMode,
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
      contractCancelSoNo,
      contractCancelApplyId,
      orderSalesSapCode,
      profitNetRate,
      profitGrossRate,
      profitGross,
      dealerProfit,
      biddingCurrency
    })
    this.dealerFromData.patchValue({
      ...data.preparationInfo,
      subTierInfo: data.preparationInfo.subTierInfo || []
    })
    this.accountFromData.patchValue({
      ...data.preparationInfo
    })
    this.foreignFromData.patchValue({
      ...data.preparationInfo
    })
    this.endUserFromData.patchValue({
      ...data.preparationInfo
    })
    this.contractBuyerFromData.patchValue({
      ...data.preparationInfo
    })
    this.baseInfoTableData.patchValue({
      ...data.preparationInfo
    })
    this.priceApprovalData.patchValue({
      ...data.preparationInfo
    })
    if (this.baseInfoFromData.getRawValue().businessModel == 'DISTRIBUTOR') {
      this.getdistributorDate(); //更新经销商日期
    }
    if (this.priceApprovalData.getRawValue().currencySystem == "USD") {
      this.getIepoolDate(); //更新经销商日期
    }

    if (businessModel == 'DISTRIBUTOR') {
      setTimeout(() => {
        this.subTierSubject.next({ type: 'add', data: subTierInfo })
        this.baseInfoFromChild.checkBiddingEqualDealer();
      }, 0);
    }
    let modalityLists = orderInfo.map((val) => val.orderModality);
    modalityLists = Array.from(new Set(modalityLists));
    this.baseInfoFromData.patchValue({
      dealIsDisabled: modalityLists.includes("PD&IGT") ? true : false,
    })
    this.addProduct(orderInfo, false)

    this.baseInfoFromChild.paymentMethods();
    const { oitMode, centralizedPurchasing } = this.baseInfoFromData.getRawValue();
    const { endUser } = this.endUserFromData.getRawValue();
    const StockOff = ((oitMode == 'BIDDING' && endUser == 'Stock') || oitMode == 'STOCK' || centralizedPurchasing == 1) ? false : true;
    this.formValue.patchValue({
      StockOff: StockOff,
    })
    //禁用经销商协议
    if (this.flag == 1) {
      this.orderInfo.controls.forEach((item, index) => {
        let marketBundleInfo = this.orderInfo.at(index).get("marketBundleInfo") as FormArray;
        marketBundleInfo.controls.forEach((itl, i) => {
          marketBundleInfo.at(i).disable();
        });
      });
    }
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

  private errorOrderLabelsList: String[] = [];
  get checkDealBiddingAndForeignValidation(): boolean {
    // 1. 如果是单Order，且Order Sales和Deal Sales一致的情况下，在提交Deal时执行校验
    // 2. 如果是多Order，且存在Order Sales和Deal Sales不一致的情况下，在提交Deal时校验相同Sales的Order（若没有，则不校验），在其余Sales补充Order信息时二次校验
    if(this.orderInfo.getRawValue().length==0){
      return true
    }
    this.errorOrderLabelsList = [];

    // 投标公司和外贸公司一样的情况下，如果和年度协议经销商不一致，不让提交baseInfoFrom
    const { biddingCompany } = this.baseInfoFromData.getRawValue();
    const { dealerName } = this.dealerFromData.getRawValue();
    let resultArr= this.getOrderListByDealSales().map(order => {
      const {currencySystem,} = order.orderBaseinfo
      let {foreignTradeCorpSameDealer,foreignTradeCorpName,orderSameForeignTradeCorp} = order.foreignInfo
      // 是否和deal的外贸公司一样
      if(orderSameForeignTradeCorp=='1'){
        const {
          foreignTradeCorpName:dealForeignTradeCorpName,
          foreignTradeCorpSameDealer:dealForeignTradeCorpSameDealer, //外贸公司与经销商相同CheckBox
        } = this.foreignFromData.getRawValue();

        foreignTradeCorpName = dealForeignTradeCorpName
        foreignTradeCorpSameDealer = dealForeignTradeCorpSameDealer
      }
      let result =  this.validateDealBiddingForeign(biddingCompany,dealerName,foreignTradeCorpName,foreignTradeCorpSameDealer,currencySystem)
      if(!result){
        this.errorOrderLabelsList.push(order.orderBaseinfo.orderName)
        this.errorOrderLabelsList=this.errorOrderLabelsList.filter((item,index,self)=>{
          return self.indexOf(item) === index
        })
      }
      return result
    })
    return resultArr.every(item=>item)
  }
   // 获取当前Deal Sales名下的Order
  public getOrderListByDealSales(sales?: string): any[] {
    sales = sales||this.baseInfoFromData.getRawValue().dealFormSales;
    const orderList = this.orderInfo.getRawValue();
    return orderList.filter(item => item.orderSalesinfo.orderSales === sales);
  }
  // 校验 投标公司和外贸公司一样的情况下，如果和年度协议经销商不一致，不让提交baseInfoFrom
  public validateDealBiddingForeign(biddingCompany,dealerName,foreignTradeCorpName,foreignTradeCorpSameDealer,currencySystem): boolean {
    biddingCompany=biddingCompany||""
    dealerName=dealerName||""
    foreignTradeCorpName=foreignTradeCorpName||""
    foreignTradeCorpSameDealer=foreignTradeCorpSameDealer||false
    currencySystem=currencySystem||""
    let result = true;
    if(currencySystem == "USD" ){
      if(biddingCompany.trim()==foreignTradeCorpName.trim()&&(foreignTradeCorpName.trim()==dealerName.trim()||foreignTradeCorpSameDealer)||biddingCompany.trim()!=foreignTradeCorpName.trim()){
        result = true
      }else{
        result = false
      }
    }else{
      result = true
    }
    return result
  }

  public myskip(val): void {
    //外部触发tab选项卡的事件
    this.tabs.activeId(val)
    // this.tabs.error(val);
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
          const ddpValidUntil = standardTime(rows[0].ddpValidUntil) ? standardTime(rows[0].ddpValidUntil) : null;
          const ddpStatus = isadopt(ddpValidUntil);
          if (ddpStatus != "通过") {
            this.foreignFromData.patchValue({
              foreignTradeCorpDdpStatus: "不通过",
              foreignTradeCorpDdpValidityDate: rows[0].ddpValidUntil ? rows[0].ddpValidUntil : null,
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
  myVerifi(val) {
    //验证按钮是否可以点击
    this.verifiOff = val;
  }
  public handleCancelWinCheck(): void {
    this.isVisibleWinCheck = false;
    this.verifiOff = true;
  }
  deleteOrder() { //删除草稿
    const { applyId } = this.formValue.getRawValue();
    this.pageLoading = true
    this.serveice.deletOrder(applyId).subscribe(val => {
      this.pageLoading = false;
      if (val.code == '0000') {
        this.message.create('success', val.msg);
        // this.router.navigate(['/ecos/my-draft'])
        this.routerExtendService.back();
      }
      else {
        this.message.create('error', val.msg);
      }
    })
  }
  async preSubmit(parm) {
    this.computContral();
    let data = this.formValue.getRawValue();
    const { applyId, processInstanceTaskId, productModelInfo, processStatus, modality, province, role, cluster, bmc, team, cycleGroup, bigArea, smallArea, accountFrom, baseInfoFrom, baseInfoTable, contractBuyerFrom, dealerFrom, endUserFrom, foreignFrom, orderInfo, priceApproval, remarkFrom, id } = data;
    dealerFrom.dealerDdpValidityDate = dealerFrom.dealerDdpValidityDate != null && dealerFrom.dealerDdpValidityDate != '' ? moment(dealerFrom.dealerDdpValidityDate).format('YYYY-MM-DD hh:mm:ss') : null;
    foreignFrom.foreignTradeCorpDdpValidityDate = (foreignFrom.foreignTradeCorpDdpValidityDate != null && foreignFrom.foreignTradeCorpDdpValidityDate != "") ? moment(foreignFrom.foreignTradeCorpDdpValidityDate).format('YYYY-MM-DD hh:mm:ss') : null;

    let orderInfos = orderInfo.map((val => {
      const { endUserinfo, foreignInfo, productModelInfo, mainTrems, otherTerms, orderBaseinfo, speciallyTerms, orderSalesinfo, marketBundleInfo, accountFrom, } = val
      orderBaseinfo.requiredArrivalDate = (orderBaseinfo.requiredArrivalDate != null && orderBaseinfo.requiredArrivalDate != "") ? moment(orderBaseinfo.requiredArrivalDate).format('YYYY-MM-DD hh:mm:ss') : null;
      orderBaseinfo.estimateInstallationDate = (orderBaseinfo.estimateInstallationDate != null && orderBaseinfo.estimateInstallationDate != "") ? moment(orderBaseinfo.estimateInstallationDate).format('YYYY-MM-DD hh:mm:ss') : null;
      //orderSalesinfo.orderSales = orderSalesinfo.orderSales != null && orderSalesinfo.orderSales != "" ? stringIndexof(orderSalesinfo.orderSales) : "";
      //orderSalesinfo.actualSalesEmail = orderSalesinfo.actualSalesEmail != null && orderSalesinfo.actualSalesEmail != "" ? stringIndexof(orderSalesinfo.actualSalesEmail) : "";
      foreignInfo.foreignTradeCorpDdpValidityDate = foreignInfo.foreignTradeCorpDdpValidityDate != null && foreignInfo.foreignTradeCorpDdpValidityDate != "" ? moment(foreignInfo.foreignTradeCorpDdpValidityDate).format('YYYY-MM-DD hh:mm:ss') : null;
      marketBundleInfo.map(vals => {
        //  vals.nmpaValidityDate=(vals.nmpaValidityDate!=null&&vals.nmpaValidityDate!="")?moment(vals.nmpaValidityDate).format('YYYY-MM-DD'):null;
        if (vals.productInfo && vals.productInfo.length > 0) {
          vals.productInfo.map(ite => {
            ite.nmpaValidityDate = (ite.nmpaValidityDate != null && ite.nmpaValidityDate != "") ? moment(ite.nmpaValidityDate).format('YYYY-MM-DD hh:mm:ss') : null;
          })
        }

      })

      const orderInfos = {
        ...productModelInfo,
        ...endUserinfo,
        ...foreignInfo,
        ...mainTrems,
        ...orderBaseinfo,
        ...speciallyTerms,
        ...orderSalesinfo,
        ...otherTerms,
        ...accountFrom,
        marketBundleInfo: marketBundleInfo
      }
      return orderInfos
    }));

    priceApproval.dealPriceUsd = Number(delcommafy(priceApproval.dealPriceUsd));
    priceApproval.dealPriceCny = Number(delcommafy(priceApproval.dealPriceCny));
    if (remarkFrom.attachmentIds && remarkFrom.attachmentIds.length > 0) {
      remarkFrom.attachmentIds = remarkFrom.attachmentIds.map(val => val.fileId)
    }
    const preparationInfo = {
      ...productModelInfo,
      ...accountFrom,
      ...baseInfoFrom,
      ...contractBuyerFrom,
      ...dealerFrom,
      ...endUserFrom,
      orderInfo: orderInfos,
      ...priceApproval,
      ...baseInfoTable,
      ...foreignFrom,
    }

    let param = {
      ...remarkFrom,
      applyId,
      preparationInfo: preparationInfo,
      status: parm,
      processInstanceTaskId,
      processStatus,
      modality,
      cycleGroup,
      bigArea,
      smallArea,
      team,
      province,
      role,
      cluster,
      bmc
    }
    if (parm == 'apply_save') {
      if (this.status == 'ecos_oit_deal_resubmit') {
        //已经有applyId的保存
        this.pageLoading = true;
        this.serveice.orderSave(param).then(res => {
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
      else {  //新建和草稿的保存
        this.pageLoading = true;
        this.serveice.orderSubmit(param).then(res => {
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
    }
    else {

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

      const checkbaseInfoFrom = this.baseInfoFromChild.checkbaseInfoFromData();
      const checkdealerFrom = this.baseInfoFromChild.checkdealerFromFromData();
      const checkaccountFrom = this.baseInfoFromChild.checkaccountFromFromData();
      const checkContractBuyer = this.baseInfoFromChild.checkContractBuyerFromFromData();
      const checkforeignFrom = this.baseInfoFromChild.checkforeignFromFromData();
      const checkendUserFrom = this.baseInfoFromChild.checkendUserFromFromData();
      const baseInfoTableChild = this.baseInfoTableChild.checkFormData();
      const productChild = this.productChild.checkFormData();

      if (!checkbaseInfoFrom || !checkdealerFrom || !checkaccountFrom || !baseInfoTableChild || !checkContractBuyer || !checkforeignFrom || !checkendUserFrom) {
        this.tabIndex = 0;
        this.myskip(this.tabList[this.tabIndex])
        this.message.create("error", `基础信息有必填项没有填写`);
        return;
      }

      if (!productChild) {
        this.tabIndex = 1;
        this.myskip(this.tabList[this.tabIndex])
        this.message.create("error", `order层级有必填项没有填写`);
        return
      }
      if (this.status == 'ecos_oit_deal_resubmit') {
        this.remarkFromData.get('comments')!.setValidators(Validators.required);
        this.remarkFromData.get('comments')!.markAsDirty();
        this.remarkFromData.get('comments')!.updateValueAndValidity();
        if (!this.remarkFromData.valid) {
          this.tabIndex = 3;
          this.myskip(this.tabList[this.tabIndex])
          this.message.warning("未填写备注")
          return;
        }
      }
      else {
        this.remarkFromData.get('comments')!.clearValidators();
        this.remarkFromData.get('comments')!.markAsPristine();
        this.remarkFromData.get('comments')!.updateValueAndValidity();
      }
      orderInfo.map(val => {
        val.marketBundleInfo.map(vals => {
          vals.primaryOpportunity = vals.primaryOpportunity.toString();
        })
      })
      //至少选中一个主机
      for (let i = 0; i < orderInfo.length; i++) {
        let host = orderInfo[i].marketBundleInfo.some(val => val.primaryOpportunity == 'true')
        if (!host) {
          this.message.error("至少选中一个主机");
          return
        }
      }

      if (baseInfoFrom.dealFormSalesModality == 'PD&IGT' && this.bidData.length > 0 && !this.verifiOff) {
        const marketBundleInfo = this.filterhosts(orderInfo)  //选出主机
        param.preparationInfo.orderInfo.forEach(vals => {    //biddingMarketBundleId绑定给对应产品
          if (vals.orderModality == 'PD&IGT') {

            vals.marketBundleInfo.forEach(val => {

              this.bidData.forEach(ite => {
                if ((val.cpMarketBundleId == ite.cpMarketBundleId) && val.primaryOpportunity == "true") {
                  val.biddingMarketBundleId = ite.biddingMarketBundleId;
                  vals.biddingAwardPrice = ite.biddingAwardPrice
                  vals.biddingAwardCurrency = ite.biddingAwardCurrency;
                }
              })
            })
          }
        })
      }


      if (baseInfoFrom.oitMode == 'BIDDING' && this.verifiOff && baseInfoFrom.dealFormSalesModality == 'PD&IGT' && parm != 'cancel_deal') {

        const marketBundleInfo = this.filterhosts(orderInfo)  //选出主机
        const { centralizedPurchasing, biddingCompany, dealFormSales, tenderNum, businessModel, estimBiddingPrice } = baseInfoFrom
        const { dealerName } = dealerFrom;
        const { endUser, endUserId } = endUserFrom;
        const { currencySystem, sampleCheck } = priceApproval;
        this.dataBase = {
          businessModel,
          centralized: centralizedPurchasing,
          sampleAuditFlag: sampleCheck
        }

        this.bidData = marketBundleInfo.map((vals, index) => ({
          centralized: centralizedPurchasing,
          cpMarketBundleId: vals.cpMarketBundleId,
          modelNumber: `进单单位${index + 1}`, // 进单单位名称
          opportunityId: vals.opportunityId,
          marketBundleId: vals.marketBundleId,
          number: vals.marketBundleAmount,
          distributor: dealerName, // 进单经销商
          agreementAgenName: "", //中标经销商
          simulationId: vals.simulationId,
          marketBundleName: vals.marketBundleName, // marketBundleName
          orderByCustomerName:  endUser , // 进单客户名称,非集采项目时校验
          orderByApplicant: endUserId, // 进单客户id,非集采项目时校验
          winningByCustomerName: "", // 中标客户名称
          winningByApplicant: "", // 中标客户id
          tenderingCompany: biddingCompany, //进单投标公司
          biddingName: "", //中标投标公司
          tenderNo: tenderNum, //进单招标编号
          biddingNo: "", //投标的biddingNo
          businessModel: businessModel, //业务模式
          rowspan: "",
          appPerson: dealFormSales, // 进单申请人
          winPerson: "", // 中标申请人
          isCheak: true,
          showCheak: false, //预计投标价格和中标价格单元格的显示
          estimBiddingPrice: estimBiddingPrice, //预计投标价
          biddingAwardPrice: "", //中标价格
          select: "",
          invoiceInformation: currencySystem, //cp币制
          biddingAwardCurrency: "", //中标币制
          searchResult: [],
          checkResult: "", // 校验结果
          checkResultReasons: [], // 校验失败原因

        }))
        this.tableLoad = true;
        this.isVisibleWinCheck = true;
        this.serveice.biddingVerification(this.bidData).then(res => {
          if (res.code == '0000') {
            this.tableLoad = false;
            this.bidData.map((val, index) => {
              res.data.map(vals => {
                if (val.cpMarketBundleId == vals.cpMarketBundleId) {
                  let len = this.bidData.length;
                  val.rowspan = len > 0 ? len : 1;
                  val.showCheak = index == 0 ? true : false;
                  // let biddingAward=vals.searchResult.find(ite=>ite.biddingAwardPrice!=null);
                  // val.biddingAwardPrice =biddingAward?biddingAward.biddingAwardPrice:"";
                  let searchResult = vals.searchResult.map(item => ({
                    biddingName: item.bidderName, //投标公司
                    marketBundleId: item.marketBundleId,
                    opportunityId: item.opportunityId,
                    marketBundleName: item.marketBundleName,
                    hospitalName: item.hospitalName, //客户名称
                    agreementAgenName: item.dealerName, //经销商名称
                    biddingNo: item.biddingNumber, //中标招标编号
                    bidApplicant: item.applicant, //中标申请人
                    biddingAwardCurrency: item.biddingAwardCurrency, //投标币制
                    temUser: false,
                    number: item.quantity,
                    useStatus: item.oitStatus,
                    isDisable: item.oitStatus == '0' ? false : true,
                    price: item.awardPrice,
                    biddingAwardPrice: item.biddingAwardPrice,
                    accountId: item.customerCode,
                    id: item.id,
                    applyId: item.applyId,
                    biddingProcInstId: item.biddingProcInstId,
                  }))
                  val.searchResult = JSON.parse(JSON.stringify(searchResult))
                }
              })
            })
          }
        })
        return;
      }
      this.pageLoading = true;
      this.isVisibleWinCheck = false;
      if (parm != 'cancel_deal') {
        if (baseInfoFrom.businessModel == 'DISTRIBUTOR') {
          //const dateAndValid=await this.serveice.getDdpDateAndValid(dealerFrom.dealerName);
          //console.log(dateAndValid)
          const dateAndValid = await this.serveice.findDealersByPageValid({ dealerName: dealerFrom.dealerName })
          if (dateAndValid.code == '0000') {
            const rows = dateAndValid.data.rows;
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
              this.message.create("error", `未在经销商库找到经销商信息`);
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
              else {
                this.pageLoading = false;
                this.message.create("error", `未在IEPOOL找到经销商信息`);
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
      // FETR1572757-OIT不需要校验Contract-signatory角色是否缺失
      console.log(`DealForm Sales:${baseInfoFrom.dealFormSales}`)
      this.serveice.checkContractSignatory({
        sales:baseInfoFrom.dealFormSales,
        salesCycleGroup:cycleGroup,
        salesModality:modality,
        salesTeam:team,
        salesBigArea:bigArea,
        salesSmallArea:smallArea
      }).subscribe(res=>{
        if (res.code == '0000') {
          if(res.data){
            this.doSubmit(param,parm)
          }else{
            this.pageLoading = false;
            this.modalService.error({
              nzTitle: '提示',
              nzContent: '此流程中的Contract Signatory角色缺失人员信息，请及时联系管理员进行补充，以免影响合同签署',
              nzOnOk: ()=>{
                this.pageLoading = true;
                this.doSubmit(param,parm)
                return true
              },
              nzOkText:"继续提交",
              nzCancelText:"暂不提交"
            })
          }
        } else {
          this.message.error(res.msg);
          this.pageLoading = false;
        }
      })
    }
  }
  doSubmit(param,parm){
    if (this.status == 'ecos_oit_deal_resubmit') { //重新提交
      param.status = parm;
      // param.id=id;
      this.serveice.orderApproval(param).then(res => {
        if (res.code == '0000') {
          this.pageLoading = false;
          this.message.create('success', res.msg);
          // this.router.navigate(['/ecos']);
          this.routerExtendService.back();
        }
        else {
          this.message.error(res.msg);
          this.pageLoading = false;
        }
      }).catch(error => {
        this.message.error("请求失败");
        this.pageLoading = false;
      })
    }
    else {
      this.serveice.orderSubmit(param).then(res => {
        if (res.code == '0000') {
          this.pageLoading = false;
          this.message.create('success', res.msg);
          // this.router.navigate(['/ecos']);
          this.routerExtendService.back();
        }
        else {
          this.message.error(res.msg);
          this.pageLoading = false;
        }
      }).catch(error => {
        this.message.error("请求失败");
        this.pageLoading = false;
      })
    }
  }
  handleCancel() {
    //this.location.back();
    // this.router.navigate(['/ecos/my-started'])
    this.routerExtendService.back();
  }
  handleOkWinCheck(param) {
    this.isVisibleWinCheck = false;
    this.preSubmit(param)
  }
  filterhosts(order) {//筛选主机
    let marketBundleInfo = []
    order.map(val => {
      if (val.orderBaseinfo.orderModality == 'PD&IGT') {
        val.marketBundleInfo.map(vals => {
          if (vals.primaryOpportunity == 'true') {
            marketBundleInfo.push(vals)
          }
        })
      }
    })
    return marketBundleInfo
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

  addProduct(val, param: any = true) {
    this.pageLoading = false;
    this.clearFormArray(this.orderInfo);
    const { businessModel } = this.baseInfoFromData.getRawValue();
    const { dealerCode } = this.dealerFromData.getRawValue();
    val.map((vals, index) => {
      const orderSalesProvince = vals.orderSalesProvince;
      //加载城市列表
      this.serveice.provinceLists.forEach((ite) => {
        if (ite.value == orderSalesProvince) {
          vals.cityList = ite.children.map((a) => ({
            value: a.value,
          }));
        }
      });
      this.orderInfo.push(this.createOrder(vals, index));
      let marketBundleInfo = this.orderInfo.at(index).get("marketBundleInfo") as FormArray;
      const orderBaseinfo = this.orderInfo.at(index).get('orderBaseinfo') as FormGroup;
      const orderSalesinfo = this.orderInfo.at(index).get('orderSalesinfo') as FormGroup;

      const { orderModality } = orderBaseinfo.getRawValue()
      const { financialSolutionOther } = this.priceApprovalData.getRawValue();
      const { orderSales } = orderSalesinfo.getRawValue();
      orderBaseinfo.patchValue({
        financialSolutionOther: financialSolutionOther
      })
      const currencySystem = vals.currencySystem
      vals.marketBundleInfo.map((a, h) => {
        marketBundleInfo.push(this.createProdut(a, h, currencySystem));
        if (a.cpConfigDocuments && a.cpConfigDocuments.length > 0) {
          const cpConfigIds = a.cpConfigDocuments.map(ite => ite.id).join(",")
          this.serveice.sonFonUpload(cpConfigIds).subscribe(res => {
            if (res.code == '0000') {
              let data = res.data;
              const fileList = data.map(ites => ({
                fileName: ites.FileName,
                fileId: ites.FileId,
                FileName: ites.FileName,
                FileId: ites.FileId,
              }))
              const group = marketBundleInfo.at(h) as FormGroup
              group.patchValue({
                configFile: fileList
              })
            }
          })
          // this.serveice.cpDocumentsConfig(cpConfigIds).subscribe(res => {
          //   if (res.code == '0000') {
          //     let data = res.data;
          //     data.fileName = data.FileName;
          //     data.fileId = data.FileId;
          //     a.configFile = [res.data]
          //     const group = marketBundleInfo.at(h) as FormGroup
          //     group.patchValue({
          //       configFile: a.configFile
          //     })
          //   }
          // })
        }
      });

      if (businessModel == 'DISTRIBUTOR') {
        if (dealerCode) {
          this.serveice.dealAgreement(dealerCode).then(deals => {
            const rows=disreduce(deals.rows,"agreementno");
            const dealerCodeList = rows.map((item) => ({ ...item, label: item.agreementno, value: item.agreementno }))
            marketBundleInfo.controls.forEach((info, k) => {
              const group = marketBundleInfo.at(k) as FormGroup
              group.patchValue({
                dealerCodeList: dealerCodeList
              })
            })
          })
        }
      }
      if (orderModality == 'US') {
        this.serveice.departmentItemList().then(rest => {
          const departmentListFirst = rest
          this.departMent(marketBundleInfo, departmentListFirst)
        })
      }
      if (orderModality == 'PD&IGT') {

        const marketBundleInfoArr = marketBundleInfo.getRawValue();
        const primaryOpportunityList = marketBundleInfoArr.filter(val => val.primaryOpportunity == 'true');
        if (primaryOpportunityList.length > 1) {
          marketBundleInfoArr.map((val, j) => {
            const group = marketBundleInfo.at(j) as FormGroup;
            if (j == 0) {
              group.patchValue({
                primaryOpportunity: 'true'
              })
            }
            else {
              group.patchValue({
                primaryOpportunity: 'false'
              })
            }
          })
        }
        else if (primaryOpportunityList.length == 0) {
          marketBundleInfoArr.map((val, j) => {
            const group = marketBundleInfo.at(j) as FormGroup;
            if (j == 0) {
              group.patchValue({
                primaryOpportunity: 'true'
              })
            }
            else {
              group.patchValue({
                primaryOpportunity: 'false'
              })
            }
          })
        }
        const marketBundelhost = marketBundleInfoArr.filter(val => val.primaryOpportunity == 'true' || val.primaryOpportunity == true);
        if (marketBundelhost && marketBundelhost.length == 1) {
          const { marketBundleName, opportunityId, marketBundleAmount } = marketBundelhost[0];
          const SearchParams = {
            pageNo: 1,
            pageSize: 10,
            opportunityId: opportunityId,
            marketBundleName: marketBundleName,
            marketBundleAmount: marketBundleAmount,
          }

          this.serveice.searchPrebook(SearchParams).subscribe(res => {

            if (res.code == '0000') {
              orderBaseinfo.patchValue({
                prebookQuantity: res.data.rows.length,
              })

              if (res.data.rows.length == 1) {
                const { rows } = res.data;
                orderBaseinfo.patchValue({
                  prebookReferenceId: rows[0].referenceId,
                  prebookApplyId: rows[0].applyId,
                  prebookOrderId: rows[0].orderId,
                  prebookStatus: rows[0].processStatus,
                  prebookSo: rows[0].so,
                })
              }
              else if (res.data.rows.length > 0) {
                orderBaseinfo.get('prebookReferenceId').setValidators(Validators.required);
                orderBaseinfo.get('prebookReferenceId').updateValueAndValidity();
              }

            }
          })
        }

      }
    });

    setTimeout(() => {
      this.formValue.patchValue({
        isload: param
      })
      this.serveice.productAction(this.formValue);
      this.serveice.supportFileChangAction(this.formValue);
    }, 0);


  }
  tabclick(i) {
    //tab选项卡的点击事件
    if (typeof i === 'number') {
      this.tabIndex = i
      if (i == 1) {
        this.pageLoading = true;
        setTimeout(() => {
          this.pageLoading = false;
        }, 2000);
      }
    }


  }
  createOrder(val: any, index) {
    //创建
    const productModelInfo = {
      orderProductModel: [{ value: val.orderProductModel ? val.orderProductModel : null, disabled: true }],
    }
    //Order Sales信息
    const orderSalesinfo = {
      orderSales: [{ value: val.orderSales ? val.orderSales : "", disabled: false }, [Validators.required]], //销售人
      orderSalesName: [{ value: val.orderSalesName ? val.orderSalesName : "", disabled: true }],//销售人名
      orderSalesModel: [{ value: val.orderSales && val.orderSalesName ? `${val.orderSalesName}(${val.orderSales})` : "", disabled: true }],//销售人名+邮箱
      orderSalesModality: [{ value: val.orderSalesModality ? val.orderSalesModality : null, disabled: true }],// Modality
      orderSalesTeam: [{ value: val.orderSalesTeam ? val.orderSalesTeam : null, disabled: true },],//Team
      orderSalesSapCode: [{ value: val.orderSalesSapCode ? val.orderSalesSapCode : null, disabled: true }],//spaCode
      orderSalesSapCodeRequired: [{ value: false, disabled: true }], //sales spacode是否必填
      orderApprovalAreaConfiguration: [{ value: val.orderApprovalAreaConfiguration ? val.orderApprovalAreaConfiguration : null, disabled: true }, [Validators.required]],//审批区域配置
      orderSalesPerformanceProvince: [{ value: val.orderSalesPerformanceProvince ? val.orderSalesPerformanceProvince : null, disabled: true }],//业绩省份
      actualSalesEmail: [{ value: val.actualSalesEmail ? val.actualSalesEmail : null, disabled: true },], //实际销售
      ka: [{ value: val.ka ? val.ka : null, disabled: true }], //ka
      actualSalesName: [{ value: val.actualSalesName ? val.actualSalesName : null, disabled: true }],//实际销售名字
      actualSalesRequired: [{ value: false, disabled: true }], //实际销售是否必填
      actualSalesNameModel: [{ value: val.actualSalesEmail && val.actualSalesName ? `${val.actualSalesName}(${val.actualSalesEmail})` : "", disabled: true }],//实际销售名字
      orderSalesBigArea: [{ value: val.orderSalesBigArea ? val.orderSalesBigArea : null, disabled: true }],//大区
      orderSalesSmallArea: [{ value: val.orderSalesSmallArea ? val.orderSalesSmallArea : null, disabled: true }],//小区
      orderSalesProvince: [{ value: val.orderSalesProvince ? val.orderSalesProvince : null, disabled: true }],//省份
      orderSalesCity: [{ value: val.orderSalesCity ? val.orderSalesCity : null, disabled: true }],//城市
      cityList: [{ value: val.cityList, disabled: true }],//城市列表
      orderSalesCycleGroup: [{ value: val.orderSalesCycleGroup ? val.orderSalesCycleGroup : null, disabled: true }],
      modality: [{ value: val.modality ? val.modality : null, disabled: true }],
      orderOa: [{ value: val.orderOa ? val.orderOa : null, disabled: true }],
      orderOaAgent: [{ value: val.orderOaAgent ? val.orderOaAgent : null, disabled: true }],
      cycleGroup: [],
      bigArea: [],
      smallArea: [],
      orderDisbled: [true],
      prebookDisabled: [true],
      isDisabled: [true],
      isDisabledForeign: [false], //外贸公司禁用
      isDisabledMain: [true],
      id: [{ value: val.id, disabled: true }],
    }

    const accountFrom = {
      accountName: [{ value: val.accountName, disabled: true }],//开户行名称
      bankName: [{ value: val.bankName, disabled: true }],//开户行
      accountNo: [{ value: val.accountNo, disabled: true }],//账号
      registrationAddress: [{ value: val.registrationAddress, disabled: true }],//注册地址
      accountPhoneFax: [{ value: val.accountPhoneFax, disabled: true }],//电话/传真
      recipient: [{ value: val.recipient, disabled: true }],//收件人
      recipientPhone: [{ value: val.recipientPhone, disabled: true }],//收件电话
      taxNum: [{ value: val.taxNum, disabled: true }],//税号
      invoicesDeliverAddress: [{ value: val.invoicesDeliverAddress, disabled: true }], //发票邮寄地址
    }

    const totalContractPrice = val.totalContractPrice ? val.totalContractPrice : (val.currencySystem == 'CNY' ? val.orderPriceCny : val.orderPriceUsd)

    const financialSolutionName = val.financialSolutionName != null && val.financialSolutionName != 'null' ? val.financialSolutionName : "";
    //order 基本信息
    const orderBaseinfo = {
      actualHospitalId: [val.actualHospitalId],
      cpDealOrderId: [val.cpDealOrderId],
      orderModality: [val.orderModality],
      marketBundleId: [val.marketBundleId],
      totalContractPrice: [{ value: totalContractPrice, disabled: true }],//进单单位合同价(提交)

      orderPriceCny: [val.orderPriceCny],//进单单位合同价(cp)
      orderPriceUsd: [val.orderPriceUsd],//进单单位合同价(cp)
      orderPriceCnyNet: [val.orderPriceCnyNet],//进单单位合同价(cp)

      orderPriceCnyCp: [{ value: val.orderPriceCnyCp ? val.orderPriceCnyCp : val.orderPriceCny, disabled: true }], //进单单位合同价(cp原始)
      orderPriceCnyNetCp: [{ value: val.orderPriceCnyNetCp ? val.orderPriceCnyNetCp : val.orderPriceCnyNet, disabled: true }],//进单单位合同价(cp原始)
      orderPriceUsdCp: [{ value: val.orderPriceUsdCp ? val.orderPriceUsdCp : val.orderPriceUsd, disabled: true }],//进单单位合同价(cp原始)

      orderName: [{ value: val.orderName, disabled: true }],

      switchValid: [{ value: true, disabled: true }],
      financialSolutionName: [{ value: financialSolutionName, disabled: true }],//金融方案名称
      financialSolutionOther: [{ value: val.financialSolutionOther, disabled: true }],//其他金融方案
      financialSolutionNameModel: [{ value: financialSolutionName == '其他金融方案' ? `${financialSolutionName}(${val.financialSolutionOther})` : (financialSolutionName ? financialSolutionName : ""), disabled: true }],

      financialSolutionCny: [{ value: val.financialSolutionCny, disabled: true }],//金融方案金额含税
      financialSolutionCnyNet: [{ value: val.financialSolutionCnyNet, disabled: true }], //金融方案不含税
      financialSolutionUsd: [{ value: val.financialSolutionUsd, disabled: true }],//金融方案美元
      financialSolutionDisabled: [{ value: true, disabled: true }], //金融方案金额是否禁止编辑
      paymentDisabled: [{ value: true, disabled: true }], //其它付款方式和远期信用证利息是否禁止编辑

      financialSolutionCnyCp: [{ value: val.financialSolutionCnyCp ? val.financialSolutionCnyCp : val.financialSolutionCny, disabled: true }],//金融方案含税(原始)
      financialSolutionCnyNetCp: [{ value: val.financialSolutionCnyNetCp ? val.financialSolutionCnyNetCp : val.financialSolutionCnyNet, disabled: true }], //金融方案金额不含税(原始)
      financialSolutionUsdCp: [{ value: val.financialSolutionUsdCp ? val.financialSolutionUsdCp : val.financialSolutionUsd, disabled: true }],//金融方案美元(原始)

      creditCny: [{ value: val.creditCny, disabled: true }], //远期信用证利息含税价
      creditCnyNet: [{ value: val.creditCnyNet, disabled: true }],//远期信用证利息不含税价
      creditUsd: [{ value: val.creditUsd, disabled: true }],//远期信用证利息美元

      creditCnyCp: [{ value: val.creditCnyCp ? val.creditCnyCp : val.creditCny, disabled: true }],//远期信用证利息含税价(原始)
      creditCnyNetCp: [{ value: val.creditCnyNetCp ? val.creditCnyNetCp : val.creditCnyNet, disabled: true }],//远期信用证利息不含税价(原始)
      creditUsdCp: [{ value: val.creditUsdCp ? val.creditUsdCp : val.creditUsd, disabled: true }],//远期信用证利息美元(原始)

      paymentCny: [{ value: val.paymentCny, disabled: true }],//其他付款方式费用含税价
      paymentNetCny: [{ value: val.paymentNetCny, disabled: true }],//其他付款方式费用不含税价
      paymentUsd: [{ value: val.paymentUsd, disabled: true }],//其他付款方式费用美元

      paymentCnyCp: [{ value: val.paymentCnyCp ? val.paymentCnyCp : val.paymentCny, disabled: true }],//其他付款方式费用含税价(原始)
      paymentNetCnyCp: [{ value: val.paymentNetCnyCp ? val.paymentNetCnyCp : val.paymentNetCny, disabled: true }], //其他付款条款费用不含税价(原始)
      paymentUsdCp: [{ value: val.paymentUsdCp ? val.paymentUsdCp : val.paymentUsd, disabled: true }],//其他付款条款费用美元(原始)

      orderRebateCny: [{ value: val.orderRebateCny ? val.orderRebateCny : val.rebateCny, disabled: true }], //RebateCny
      orderRebateCnyNet: [{ value: val.orderRebateCnyNet ? val.orderRebateCnyNet : val.rebateCnyNet, disabled: true }],//RebateCnynet
      orderRebateUsd: [{ value: val.orderRebateUsd ? val.orderRebateUsd : val.rebateUsd, disabled: true }],//RebateUsd

      orderTradeInCny: [{ value: val.orderTradeInCny ? val.orderTradeInCny : val.tradeInCny, disabled: true }],//tradeInCny
      orderTradeInCnyNet: [{ value: val.orderTradeInCnyNet ? val.orderTradeInCnyNet : val.tradeInCnyNet, disabled: true }],//tradeInCnyNet
      orderTradeInUsd: [{ value: val.orderTradeInUsd ? val.orderTradeInUsd : val.tradeInUsd, disabled: true }],//tradeInUsd

      orderChapterTradeInNetCny: [{ value: val.orderChapterTradeInNetCny, disabled: true }],
      orderChapterTradeInCny: [{ value: val.orderChapterTradeInCny, disabled: true }],
      orderChapterTradeInUsd: [{ value: val.orderChapterTradeInUsd, disabled: true }],
      orderChapterRebateNetCny: [{ value: val.orderChapterRebateNetCny, disabled: true }],
      orderChapterRebateCny: [{ value: val.orderChapterRebateCny, disabled: true }],
      orderChapterRebateUsd: [{ value: val.orderChapterRebateUsd, disabled: true }],

      sofonNum: [{ value: val.sofonNum ? val.sofonNum : null, disabled: true }],//sononNo
      sofonFile: [{ value: val.sofonFile ? val.sofonFile : null, disabled: true }],//sofonFile
      sofonNumRequired: [{ value: false, disabled: true }], //sofon是否必填
      currencySystem: [{ value: val.currencySystem ? val.currencySystem : null, disabled: true }],//币制
      centralizedPurchasing: [{ value: val.centralizedPurchasing ? val.centralizedPurchasing : '0', disabled: true }],//是否集采项目
      contractCancelReferenceId: [{ value: val.contractCancelReferenceId ? val.contractCancelReferenceId : null, disabled: true }],//原合同概要表referenceId
      contractCancelApplyId: [{ value: val.contractCancelApplyId ? val.contractCancelApplyId : null, disabled: true }],
      contractCancelSoNo: [{ value: val.contractCancelSoNo ? val.contractCancelSoNo : null, disabled: true }],//原So
      contractCancelSo: [null],//原合同概要表So
      //dealerAgreementNo:[{value:null,disabled:false}],//经销商协议号
      dealerSapCode: [{ value: val.dealerSapCode ? val.dealerSapCode : null, disabled: true }],//经销商spacode
      dealerSapCodeRequired: [{ value: false, disabled: true }],//经销商是否必填
      requiredArrivalDate: [{ value: val.requiredArrivalDate ? val.requiredArrivalDate : null, disabled: true }],//客户要货函日期
      requiredArrivalDateRequired: [{ value: null, disabled: true }],
      estimateInstallationDate: [{ value: val.estimateInstallationDate ? val.estimateInstallationDate : val.estimInstallationDate, disabled: true }],//预计安装日期
      estimateInstallationRequired: [{ value: false, disabled: true }],

      dealerRequestLetterFile: val.dealerRequestLetterFile ? [[...val.dealerRequestLetterFile]] : [], //要货函文件
      dealerRequestLetterRequired: [{ value: null, disabled: true }],
      cpclFile: val.cpclFile ? [[...val.cpclFile]] : [],//cpcl文件
      otherSupportFile: val.otherSupportFile ? [[...val.otherSupportFile]] : [],//其他支持文件
      magneticResonanceShieldingFile: val.magneticResonanceShieldingFile ? [[...val.magneticResonanceShieldingFile]] : [],//磁共振屏蔽公司
      magneticResonanceShieldingShow: [{ value: false, disabled: false }], //是否显示
      igtThirdPartySingle: [{ value: val.igtThirdPartySingle ? val.igtThirdPartySingle : '0', disabled: false }], //IGT选项框选项框
      igtThirdPartyFile: val.igtThirdPartyFile ? [[...val.igtThirdPartyFile]] : [],//IGT第三方吊塔确认文件
      igtThirdPartyFileShow: [{ value: false, disabled: false }],//是否显示
      prebookReferenceId: [{ value: val.prebookReferenceId, disabled: true }, []], //prebook申请号
      prebookApplyId: [{ value: val.prebookApplyId, disabled: true }],//prebook产品id
      prebookMainId: [],//prebook mainId,
      prebookOrderId: [{ value: val.prebookOrderId, disabled: true }], //prebookorderid
      prebookStatus: [{ value: val.prebookStatus, disabled: true }], //prebook状态
      prebookSo: [{ value: val.prebookSo, disabled: true }],//prebookSo
      prebookQuantity: [{ value: 0, disabled: true }], //是否显示prebook提示框
      solutionSalesEmail: [{ value: val.solutionSalesEmail, disabled: true }, []],//solusionSale
      solutionSalesName: [{ value: val.solutionSalesName, disabled: true }], //solution名称
      solutionSalesNameModel: [{ value: val.solutionSalesEmail && val.solutionSalesName ? `${val.solutionSalesEmail}(${val.solutionSalesName})` : "", disabled: true }],
      includeSolution: [{ value: val.includeSolution ? val.includeSolution : null, disabled: true }], //是否包含Solution
      biddingAwardPrice: [{ value: val.biddingAwardPrice ? val.biddingAwardPrice : "", disabled: true }], //中标价格
      isRequired: [{ value: false, disabled: true }],
      optionDisabled: [{ value: true, disabled: true }],
      businessOpportunityRequired: [{ value: true, disabled: true }], //商机是否必填
      isFold: [false],
      isDisabled: [false],
      contractCancelDisabled: [true],
    }
    //Order 最终用户信息
    const endUserinfo = {
      orderSameEndUser: [{ value: val.orderSameEndUser ? val.orderSameEndUser : '1', disabled: !this.editable }, []],// 此order是否设置与"基础信息"相同的最终用户
      endUser: [{ value: val.endUser ? val.endUser : null, disabled: true }, []],//最终终用户
      endUserId: [{ value: val.endUserId ? val.endUserId : null, disabled: true }, []],//最终用户编号
      endUserActuallyDeliveryAddress: [{ value: val.endUserActuallyDeliveryAddress ? val.endUserActuallyDeliveryAddress : null, disabled: true }],//实际发货地址
      endUserSapCode: [{ value: val.endUserSapCode ? val.endUserSapCode : null, disabled: true }, []],//最终用户SAP Code
      endUserTaxNum: [{ value: val.endUserTaxNum ? val.endUserTaxNum : null, disabled: true }, []],//最终用户税号
      hospitalType: [{ value: val.hospitalType ? val.hospitalType : null, disabled: true }],//医院性质
      segment: [{ value: val.segment ? val.segment : null, disabled: true }],//segment
      endUserAddress: [{ value: val.endUserAddress ? val.endUserAddress : null, disabled: !this.editable }],//最终用户地址
      endUserPhone: [{ value: val.endUserPhone ? val.endUserPhone : null, disabled: !this.editable }, []],//最终用户电话
      endUserEmail: [{ value: val.endUserEmail ? val.endUserEmail : null, disabled: !this.editable }, []],//最终用户邮箱
      endUserContact: [{ value: val.endUserContact ? val.endUserContact : null, disabled: !this.editable }, []],//最终用户联系人
      usHta: [{ value: val.usHta ? val.usHta : null, disabled: true }], //是否HTA US
    }
    //Order 外贸公司
    const foreignInfo = {

      orderSameForeignTradeCorp: [{ value: val.orderSameForeignTradeCorp ? val.orderSameForeignTradeCorp : '1', disabled: !this.editable }, , []], // 此order是否设置与"基础信息"相同的外贸易公司
      foreignTradeCorpSameDealer: [{ value: val.foreignTradeCorpSameDealer ? val.foreignTradeCorpSameDealer : null, disabled: !this.editable }, []],//经销商与外贸易公司相同
      foreignTradeCorpSapCode: [{ value: val.foreignTradeCorpSapCode ? val.foreignTradeCorpSapCode : null, disabled: !this.editable }, []],//外贸公司SAP Code
      foreignTradeCorpDdpStatus: [{ value: val.foreignTradeCorpDdpStatus ? val.foreignTradeCorpDdpStatus : null, disabled: true }, []],//外贸公司DDP Status
      foreignTradeCorpDdpValidityDate: [{ value: val.foreignTradeCorpDdpValidityDate ? val.foreignTradeCorpDdpValidityDate : null, disabled: true }, []],//DDP Status有效日期
      foreignTradeCorpTaxNum: [{ value: val.foreignTradeCorpTaxNum ? val.foreignTradeCorpTaxNum : null, disabled: !this.editable }, []],//外贸公司税号
      foreignTradeCorpAddress: [{ value: val.foreignTradeCorpAddress ? val.foreignTradeCorpAddress : null, disabled: !this.editable }, []], //外贸公司地址
      companyNotInIePool: [{ value: val.companyNotInIePool ? val.companyNotInIePool : null, disabled: true }],//进出口公司选择 不在IE pool
      foreignTradeCorpName: [{ value: val.foreignTradeCorpName ? val.foreignTradeCorpName : null, disabled: true }, []], //外贸公司
      foreignTradeCorpPhone: [{ value: val.foreignTradeCorpPhone ? val.foreignTradeCorpPhone : null, disabled: !this.editable }, []],//外贸公司电话
      foreignTradeCorpContact: [{ value: val.foreignTradeCorpContact ? val.foreignTradeCorpContact : null, disabled: !this.editable }, []],//外贸公司联系人
      foreignTradeCorpEmail: [{ value: val.foreignTradeCorpEmail ? val.foreignTradeCorpEmail : null, disabled: !this.editable }, []],//外贸公司邮箱
      importAgreementSignName: [{ value: val.importAgreementSignName ? val.importAgreementSignName : null, disabled: !this.editable }, , []],//进口协议签署人
      importAgreementSignPosition: [{ value: val.importAgreementSignPosition ? val.importAgreementSignPosition : null, disabled: !this.editable }, []], //进口协议签署人职务
    }
    //Order 主要合同条款
    const mainTrems = {
      paymentProvision: [{ value: val.paymentProvision, disabled: this.editable }, [Validators.required]],//付款条款
      paymentProvisionList: [{ value: val.paymentProvisionList, disabled: true }], //付款条款下拉列表
      paymentProvisionSecondaryApproval: [{ value: val.paymentProvisionSecondaryApproval, disabled: this.editable }], //付款条款二级审核
      paymentProvisionFile: val.paymentProvisionFile ? [[...val.paymentProvisionFile]] : [],//付款条款文件
      paymentProvisionRemarks: [{ value: val.paymentProvisionRemarks ? val.paymentProvisionRemarks : null, disabled: true }],//付款条款备注
      performanceBond: [{ value: val.performanceBond ? val.performanceBond : '0', disabled: true }], //履约保函
      performanceBondisRequired: [{ value: false, disabled: true }],
      performanceBondFile: val.performanceBondFile ? [[...val.performanceBondFile]] : [],//履约保函文件
      performanceBondRemarks: [{ value: val.performanceBondRemarks ? val.performanceBondRemarks : null, disabled: true }],//履约保函备注
      afterSalePrice: [{ value: val.afterSalePrice ? val.afterSalePrice : '0', disabled: true }],  //是否有售后限价
      afterSalePriceRequired: [{ value: false, disabled: true }],
      afterSalePriceFile: val.afterSalePriceFile ? [[...val.afterSalePriceFile]] : [],//是否有售后限价文件
      afterSalePriceRemarks: [{ value: val.afterSalePriceRemarks ? val.afterSalePriceRemarks : null, disabled: true }],//是否有售后限价备注
      qualityGuarantee: [{ value: val.qualityGuarantee ? val.qualityGuarantee : '0', disabled: true }], //质量保函
      qualityGuaranteeRequired: [{ value: false, disabled: true }],
      qualityGuaranteeRemarks: [{ value: val.qualityGuaranteeRemarks ? val.qualityGuaranteeRemarks : null, disabled: true }], //质量保函备注
      qualityGuaranteeFile: val.qualityGuaranteeFile ? [[...val.qualityGuaranteeFile]] : [], //质量保函文件
    }
    //Order 其他合同条款
    const otherTerms = {
      shipmentDelivery: [{ value: val.shipmentDelivery ? val.shipmentDelivery : '0', disabled: true }],  //装运及交货
      shipmentDeliveryRequired: [{ value: false, disabled: true }],
      shipmentDeliveryFile: val.shipmentDeliveryFile ? [[...val.shipmentDeliveryFile]] : [], //装运及交货附件
      shipmentDeliveryRemarks: [{ value: val.shipmentDeliveryRemarks ? val.shipmentDeliveryRemarks : null, disabled: false }], //装运及交货备注
      sitePreparation: [{ value: val.sitePreparation ? val.sitePreparation : '0', disabled: true }], //场地准备
      sitePreparationRequired: [{ value: false, disabled: true }],
      sitePreparationFile: val.sitePreparationFile ? [[...val.sitePreparationFile]] : [],//场地准备文件
      sitePreparationRemarks: [{ value: val.sitePreparationRemarks ? val.sitePreparationRemarks : null, disabled: true }],//场地准备备注

      installationWarranty: [{ value: val.installationWarranty ? val.installationWarranty : '0', disabled: true }],//安装及保修
      installationWarrantyRequired: [{ value: false, disabled: true }],
      installationWarrantyRemarks: [{ value: val.installationWarrantyRemarks ? val.installationWarrantyRemarks : "", disabled: true }],//安装及保修备注
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
      amountDifferenceRequired: [{ value: false, disabled: true }],
      amountDifferenceFile: val.amountDifferenceFile ? [[...val.amountDifferenceFile]] : [],//直投合同订单合同金额和中标金额有价差文件
      amountDifferenceRemarks: [{ value: val.amountDifferenceRemarks ? val.amountDifferenceRemarks : "", disabled: true }], //直投合同订单合同金额和中标金额有价差
      isUsRequired: [true],
    }
    const group = {

      marketBundleInfo: this.fb.array([]),
    };
    return this.fb.group({
      ...group,
      productModelInfo: this.fb.group({
        ...productModelInfo
      }),
      accountFrom: this.fb.group({
        ...accountFrom
      }),
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
    const netPrice = val.netPrice ? val.netPrice : (currencySystem == 'CNY' ? val.sofonNetCny : val.sofonUsd);
    const rebate = val.rebate ? val.rebate : (currencySystem == 'CNY' ? val.chapterRebateNetCny : val.chapterRebateUsd);
    const tradeIn = val.tradeIn ? val.tradeIn : (currencySystem == 'CNY' ? val.chapterTradinNetCny : val.chapterTradeUsd);
    if (val.mainOrNot != undefined && val.mainOrNot != null && val.mainOrNot != "") {
      val.mainOrNot = val.mainOrNot == '1' ? 'true' : 'false';
    }
    const group = {
      cpOrderConfigId: [val.cpOrderConfigId],
      cpProductId: [val.cpProductId],
      cpMarketBundleId: [val.cpMarketBundleId],
      biddingMarketBundleId: [val.biddingMarketBundleId],
      primaryOpportunity: [{ value: val.mainOrNot ? val.mainOrNot : val.primaryOpportunity, disabled: true }], //是否主机
      productConfig: [{ value: val.configName ? val.configName : val.productConfig, disabled: false }], //产品配置
      marketBundleName: [{ value: val.marketBundleName, disabled: false }],//marketBundleName
      marketBundleBmc: [{ value: val.marketBundleBmc, disabled: false }],//BMC
      optionInfo: [{ value: val.optionInfo, disabled: false }],//option
      productInfo: [{ value: val.productInfo, disabled: false }],//标准配置
      clinicalClassification: [{ value: val.positioning ? val.positioning : val.clinicalClassification, disabled: true }],//临床分类
      firstLevelDepartment: [{ value: val.firstLevelDepartment, disabled: true }],//一级科室
      secondaryDepartment: [{ value: val.secondaryDepartment, disabled: true }],//二级科室
      marketBundleAmount: [{ value: val.qty ? val.qty : val.marketBundleAmount, disabled: false }],//数量
      productModel: [{ value: val.productModel, disabled: true }],//产品型号
      medicalDeviceName: [{ value: val.medicalDevice ? val.medicalDevice : val.medicalDeviceName, disabled: true }],//医疗器械名称
      nmpaNum: [{ value: val.nmpaNum, disabled: true }],//nmpaNum证号
      nmpaValidityDate: [{ value: val.nmpaValidityDate, disabled: true },],//NMPA证书有效期
      dtcDealerAgreementNo: [{ value: val.agreementNum ? val.agreementNum : val.dtcDealerAgreementNo, disabled: true },],//Dtc经销商协议号
      newDealerAgreementNo: [{ value: val.newDealerAgreementNo, disabled: true },],//最新经销商协议号newDealerAgreementNo
      simulationId: [{ value: val.simulationId, disabled: true },],//simulationId
      marketBundleId: [{ value: val.marketBundleId, disabled: true }],//marketBundleId
      opportunityId: [{ value: val.crmOpId ? val.crmOpId : val.opportunityId, disabled: true }],//opportunityId
      businessOpportunityHierarchyLink: [{ value: val.opportunityHierarchyLink ? val.opportunityHierarchyLink : val.businessOpportunityHierarchyLink, disabled: true }, [Validators.required]],//商机层级链接
      businessOpportunityHierarchyTitle: [{ value: "如果没有,可填写N/A", disabled: true }], //商机链接提示
      psm: [{ value: val.ps ? val.ps : val.psm, disabled: false },], //产品专家
      netPrice: [{ value: (netPrice != null && netPrice != null) ? netPrice : '0', disabled: false },],//Net Price审批价
      promotions: [{ value: val.promotionName ? val.promotionName : val.promotions, disabled: false },],//Promotion 促销号
      rebate: [{ value: rebate != null && rebate != "" ? rebate : '0', disabled: false },], //Rebate 经销商奖励金
      tradeIn: [{ value: tradeIn != null && tradeIn != "" ? tradeIn : '0', disabled: false },],//Trade In
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
  isRecend() {
    //是否显示审批记录
    if (this.status == "ecos_oit_deal_resubmit" || this.status == "ecos_oit_deal_submit") {

      return true;
    }
    else {
      return false;
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
  ngAfterViewChecked() {
    //console.log(11111)
  }
  ngDoCheck() {
    // console.log(2222)
  }
  ngAfterContentChecked() {
    //console.log(3333)
  }
  ngAfterViewInit() {
    //console.log(4444)
  }
  ngOnDestroy() {
    //console.log(6666)
  }

  computContral() {
    this.orderInfo.controls.forEach((element, index) => {
      const mainTrems = this.orderInfo.at(index).get('mainTrems') as FormGroup;
      const orderBaseinfo = this.orderInfo.at(index).get('orderBaseinfo') as FormGroup;
      const { paymentProvision } = mainTrems.getRawValue();
      if (paymentProvision == '远期信用证（请在备注处注明信用证期限及开证行）') {
        orderBaseinfo.patchValue({
          paymentCny: 0,
          paymentNetCny: 0,
          paymentUsd: 0,
        })
      }
      if (paymentProvision == '其他（请在备注处描述实际付款方式）') {
        orderBaseinfo.patchValue({
          creditCny: 0,
          creditCnyNet: 0,
          creditUsd: 0,
        })
      }
      if (paymentProvision != '其他（请在备注处描述实际付款方式）' && paymentProvision != '远期信用证（请在备注处注明信用证期限及开证行）') {
        orderBaseinfo.patchValue({
          creditCny: 0,
          creditCnyNet: 0,
          creditUsd: 0,
          paymentCny: 0,
          paymentNetCny: 0,
          paymentUsd: 0,
        })
      }
    })
    this.orderInfo.controls.forEach((item, index) => {
      let summary: any = 0;
      const orderBaseinfo = this.orderInfo.at(index).get("orderBaseinfo") as FormGroup;
      const { currencySystem,
        financialSolutionCnyNet,
        financialSolutionUsd,
        financialSolutionCnyNetCp,
        financialSolutionUsdCp,
        creditCnyNet,
        creditUsd,
        creditCnyNetCp,
        creditUsdCp,
        paymentNetCny,
        paymentUsd,
        paymentNetCnyCp,
        paymentUsdCp,
        orderPriceCny,
        orderPriceCnyNet,
        orderPriceUsd,
        orderPriceCnyNetCp,
        orderPriceCnyCp,
        orderPriceUsdCp,
      } = orderBaseinfo.getRawValue()
      if (currencySystem == 'CNY') {
        const financialSolutionCnyNow = -floatSub(Number(financialSolutionCnyNet), Number(financialSolutionCnyNetCp))
        const creditCnyNow = floatSub(Number(creditCnyNet), Number(creditCnyNetCp))
        const paymentNetCnyNow = floatSub(Number(paymentNetCny), Number(paymentNetCnyCp))
        summary = floatAdd(orderPriceCnyNet, financialSolutionCnyNow);
        summary = floatAdd(summary, creditCnyNow);
        summary = floatAdd(summary, paymentNetCnyNow);
        summary = floatMultiply(summary, 1.13);
        summary = fomatFloat(summary, 2)
        orderBaseinfo.patchValue({
          totalContractPrice: summary,
        })
      }
      else {

        const financialSolutionCnyNow = -floatSub(Number(financialSolutionUsd), Number(financialSolutionUsdCp))
        const creditCnyNow = floatSub(Number(creditUsd), Number(creditUsdCp))
        const paymentNetCnyNow = floatSub(Number(paymentUsd), Number(paymentUsdCp))
        summary = floatAdd(orderPriceUsd, financialSolutionCnyNow);
        summary = floatAdd(summary, creditCnyNow);
        summary = floatAdd(summary, paymentNetCnyNow);
        orderBaseinfo.patchValue({
          totalContractPrice: summary,
        })
      }

    })
  }


}
