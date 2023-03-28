import { Component, OnInit, ViewChild } from "@angular/core";
import { Location } from '@angular/common'
import { FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { BiddingV3Service } from "../../bidding-v3.service";
import { NzMessageService, NzModalService } from "ng-zorro-antd";
import { BIDDING_COMPANIES, BUSINESS_MODEL_DIRECT, CURRENCIES } from "../../bidding-v3.constants";
import { logisticTermsDescValidator, dealerDdpStatusValidator, bidderDdpStatusValidator, segmentValidator } from '../../bidding-v3.util'
import { BreadcrumbService } from "@app/modern-themes/services/breadcrumb.service";
import { ProcessTaskStatusPipe } from "@shared/pipes/process-task-status.pipe";
import { ImportOppComponent } from "../../components/import-opp/import-opp.component";
import { TabsComponent } from "@app/modern-themes/components/tabs/tabs.component";
import { RouterExtendService } from "@app/modern-themes/services/router-extend.service";
import { Subject } from "rxjs";

// 中标价格不能低于产品中标价格总和
const biddingAmountValidator = (control: FormGroup): ValidationErrors | null => {
  const { biddingAwardPrice, marketBundles } = control.getRawValue()
  if (biddingAwardPrice === null || biddingAwardPrice === '') { return null }
  let totalAmount = 0
  marketBundles.forEach(({ products }) => {
    products.forEach(({ awardPrice }) => totalAmount += (awardPrice || 0))
  })
  if (biddingAwardPrice < totalAmount) {
    return { biddingAmountError: true }
  }
}

// 至少选择一条中标产品
const awardOrNotValidator = (control: FormArray): ValidationErrors | null => {
  const marketBundles = control.getRawValue()
  for(let bundle of marketBundles) {
    for(let product of bundle.products) {
      if (product.awardOrNot) {
        return null
      }
    }
  }
  return { awardOrNotError: true }
}

@Component({
  templateUrl: "./bidding-detail.component.html",
  styleUrls: ["./bidding-detail.component.scss"],
})
export class BiddingDetailComponent implements OnInit {

  @ViewChild("importOpp") importOpp: ImportOppComponent;
  @ViewChild('tabs') tabs: TabsComponent

  subTierSubject = new Subject()

  taskId;

  originData = {
    applicant: null,
    cycleGroup: null,
    bigArea: null,
    modality: null,
    smallArea: null,
    dataSource: null,
    businessModel: null,
    distributorAgreement: [],
    id: null,
    dealerName: null,
    applyId: null,
    hospitalName: null,
    nonStandard: { id: null, isNonStandard: 0, logisticTerms: null },
    marketBundles: [],
    technicalApprovers: [],
    depositApprovers: [],
    cpVerifyRequired: null,
    biddingAwardCurrency: null,
    lackingFilesAdded: null,
    authorizationRequired: null,
    distributorDdpDate: null,
    subTiers: [],
  };
  pageLoading = false;

  fromTask = false
  fromSupplement = false

  taskStatus;

  processStatus;

  procInstId

  isResubmit = false

  paymentTerms = []

  agreementList = []

  referenceId

  showReopenButton = false

  remarkMsgVisible = false

  selectOption = {
    currency: CURRENCIES,
  };

  productEditable = false

  ddpDateExpiredVisible = false

  disabled = true

  isHandle = false
  public showoff: any = false;
  public rem_mess: any = false;
  public take: any = true;
  public remarks: any = '';
  public cancelFlag: any = false;
  public isBidding: any = false;
  public isAauthorization: any = false;

  biddingForm: FormGroup = this.fb.group({
    dataSource: [null], // 数据来源, CP Deal Form/CP Simulation
    accountName: [null],
    basicInfo: this.fb.group({
      // 基础信息
      baseInfo: this.fb.group({
        // 基本信息
        referenceId: [{ value: null, disabled: true }],
        biddingModel: [null, [Validators.required]], // 招标授权模式
        biddingProgramName: [null, [Validators.required]], // 招标项目
        businessModel: [{ value: null, disabled: true }], // 业务模式
        biddingType: [null, [Validators.required]], // 招标类型
        biddingNumber: [null, [Validators.required]], // 招标编号
        biddingOrgName: [null, [Validators.required]], // 招标机构名称
        biddingOpenDate: [null, [Validators.required]], // 开标日期
        biddingValidDate: [90, [Validators.required]], // 开标日期
      }),
      finalUser: this.fb.group({
        // 最终用户
        hospitalName: [null, [Validators.required]], // 医院名称
        customerCode: [{ value: null, disabled: true }], // 客户编号
        customerType: [{ value: null, disabled: true }], // 客户类型
        groupPurchaseCompany: [{ value: null, disabled: true }], // 采购集团名称
        customerCategory: [{ value: null, disabled: true }], // 客户分类
        customerProvince: [{ value: null, disabled: true }], // 客户所属省份
        groupPurchase: [{ value: false, disabled: true }], // 是否为集采项目
      }, {
        validators: [segmentValidator]
      }),
      applicant: this.fb.group({
        // 申请人
        applicant: [null], // 申请人邮箱
        biddingOwner: [{ value: null, disabled: true }], // 投标负责人(申请人)
        biddingOwnerPosition: [{ value: "Sales Rep/Mgr", disabled: true }], // 投标负责人职务(申请人职务)
        systemRegion: [null, [Validators.required]], // 系统区域
        team: [{ value: null, disabled: true }], // 申请人的 Team
        modality: [{ value: null, disabled: true }], // 申请人的 Modality
        cycleGroup: [{ value: null, disabled: true }], // 申请人的Cycle Group
        bigArea: [{ value: null, disabled: true }], // 申请人的 Big Area
        smallArea: [{ value: null, disabled: true }], // 申请人的 Small Area
      }),
    }),
    marketBundles: this.fb.array([], [Validators.required]), // Market Bundle信息
    supplementInfo: this.fb.group({
      // 补充信息
      biddingInfo: this.fb.group({
        // 投标信息 [直投]
        authorizationRequired: [null, [Validators.required]], // 是否需要投标授权
        bidderName: [null, [Validators.required]], // 投标公司名称
        bidderRegistAddress: [{ value: null, disabled: true }], // 投标公司注册地址
        bidderRegistLocation: [{ value: null, disabled: true }], // 投标公司注册所在地
        participationTenderLetterFiles: [null], // 投标声明函
        salesManagerAuthorizationLetter: [null], // 销售经理投标委托函
        biddingDocumentFiles: [null, [Validators.required]], // 招标文件
      }),
      indirectBiddingInfo: this.fb.group({ // 投标信息 [非直投]
        authorizationRequired: [null, [Validators.required]], // 是否需要投标授权
      }),
      biddingTerm: this.fb.group({
        // 投标条款 [直投]
        logisticTerm: this.fb.group({
          // 物流条款
          logisticTerms: [null, [Validators.required]], // 物流条款-下拉框
          logisticTermsDesc: [null, [Validators.required]], // 物流条款-说明
        }, { validators: [logisticTermsDescValidator]}),
        afterSaleTermsDesc: [null, [Validators.required]], // 售后维修条款说明
        biddingAmount: this.fb.group({
          // 投标保证金及履约保证金额说明
          bidderAmount: [null], // 预计投标金额
          bidderCurrency: [null], // 预计投标币种
          bidderBondAmount: [null], // 投标保证金金额
          bidderBondCurrency: [null], // 投标保证金币种
          bidderBondPercent: [null], // 投标保证金百分比
          performanceBondAmount: [null], // 履约保证金金额
          performanceBondCurrency: [null], // 履约保证金币种
          performanceBondPercent: [null], // 履约保证金百分比
        }),
        paymentTerm: this.fb.group({
          // 付款方式说明
          paymentTerms: [null, [Validators.required]], // 付款方式条款
          paymentTermsDesc: [null, [Validators.required]], // 付款方式条款说明
        }),
        specificationTermsDesc: [null, [Validators.required]], // 技术条款说明
        legalTermsDesc: [null, [Validators.required]], // 涉及法律条款说明
      }),
      biddingCompany: this.fb.group({
        // 投标公司信息 [非直投]
        secondaryDistributor: [null], // 是否为二级经销商投标
        bidderName: [null, [Validators.required]], // 投标公司名称
        bidderRegistAddress: [null, [Validators.required]], // 投标公司注册地址
        bidderDdpStatus: [{ value: null, disabled: true }], // 投标公司DDP状态
        bidderDdpDate: [{ value: null, disabled: true }], // 投标公司DDP有效期截止日期
      }),
      dealerInfo: this.fb.group({
        // 经销商信息 [非直投]
        dealerName: [null, [Validators.required]], // 协议经销商名称
        dealerRegistAddress: [null],
        distributorAgreementNo: [null], // 经销商协议
        distributorAgreement: this.fb.array([]), // 经销商协议
        distributorType: [null, [Validators.required]], // 协议经销商类型
        distributorDdpStatus: [{ value: null, disabled: true }], // 协议经销商DDP状态
        distributorDdpDate: [{ value: null, disabled: true }], // 协议经销商DDP有效期截止日期
        subTiers: this.fb.array([]),
      }),
      biddingFile: this.fb.group({
        // 投标相关文件 [非直投]
        sealedLetterFiles: [null], // 盖章后的投标申请函
        letterOfAuthorizationFiles: [null], // 协议经销商出具投标委托函文件
      }),
    }),
    approvalInfo: this.fb.group({
      commonInfo: this.fb.group({
        // 审批通用字段
        processComments: [null], // 流程备注
        processAttachmentIds: [null], // 流程附件ID列表
      }),
      biddingApprovalInfo: this.fb.group({
        paymentTermsApproval: [false],
        specificationTermsApproval: [false],
        logisticTermsApproval: [false],
        legalTermsApproval: [{ value: false, disabled: true }],
        isNonStandard: [false],
        afterSaleTermsApproval: [false],
        bondAmountTermsApproval: [false],
        technicalApprovers: this.fb.array([]),
        depositApprovers: this.fb.array([]),
        processComments: [null],
        processAttachmentIds: [null],
      }),
      biddingApprovalStatus: this.fb.group({
        logisticTermsApprovalStatus: [null],
        afterSaleTermsApprovalStatus: [null],
        paymentTermsApprovalStatus: [null],
        specificationTermsApprovalStatus: [null],
        bondAmountTermsApprovalStatus: [null]
      }),
      grantAuthApprovalInfo: this.fb.group({
        // 发放授权审批信息
        cpVerifyRequired: [null], // 是否需要检验CP审批结果
        authorizationFiles: [null, [Validators.required]], // 授权文件
        exportControlFiles: [null], // 出口管制文件
        pvPaymentCode: [null], // PV付款文件编号
        processComments: [null], // 备注
        authorizationOtherFiles: [null], // 其他文件
      }),
      biddingFilling: this.fb.group({
        // 中标备案审批信息
        action: [null, [Validators.required]], // 中标情况, 已中标/未中标/二次开标
        processComments: [null], // 备注
        approvedForm: this.fb.group({
          specialApprovalItems: this.fb.array([]), // 需特批会签事项
          endUserContractFiles: [null, [Validators.required]], // 中标通知书
          winningNoticeFiles: [null], // 中标公告
          tenderAndOtherCommitmentFiles: [null], // 投标及其他承诺文件
          participationTenderLetterFiles: [null], // 参与投标声明函
          siteSurveyReportFiles: [null, [Validators.required]], // 场地勘验报告/要货函
          projectSolutionSupportReportFiles: [null], // 项目解决方案售前支持报告
          fullDocumentFields: [null], // 全套投标文件, 直投时显示
          biddingAwardPrice: [null, [Validators.required]], // 中标金额
          biddingAwardCurrency: [null, [Validators.required]], // 中标币种
          biddingAwardDate: [null, [Validators.required]], // 中标日期
          lackingInfo: [null], // 文件缺失或需特批说明
          specialProject: [null, [Validators.required]], // 是否特价项目
          marketBundles: this.fb.array([], { validators: [awardOrNotValidator] }), // 中标产品信息
        }, {
          validators: [biddingAmountValidator]
        }),
        failureForm: this.fb.group({
          biddingAwardPrice: [null, [Validators.required]], // 中标金额
          biddingAwardCurrency: [null, [Validators.required]], // 中标币种
          biddingAwardCompany: [null, [Validators.required]], // 中标公司
        }),
      }),
      biddingConfirm: this.fb.group({ // 中标确认审批信息
        specialApprovalItems: this.fb.array([]), // 需特批会签事项
        lackingAwardNotice: [false], // 缺失中标通知书
        lackingWinningNotice: [false], // 缺失中标公告
        lackingGoodsLetter: [false], // 缺少要货函
        lackingOther: [false], // 其他特批事项
        lackingOtherDesc: [null], // 其他特批事项描述
        specialApprovalSupportFiles: [null], // 特批支持文件
        processComments: [null], // 备注
        winningNoticeFiles: [null, [Validators.required]], // 中标公告
        biddingAnnouncePrice: [null], // 中标公告价格
        biddingAnnounceCurrency: [null], // 中标公告币种
        biddingAnnounceDate: [null], // 中标公告发布时间
        endTimeDate: [null], // 公示期结束日期
        specialApprovalDate: [null], // 特批完成日期
        biddingNoticeSignDate: [null], // 后补中标通知书的签订日期
        confirmSupplementFiles: [null], // 中标确认补充文件
        lackingFilesAdded: [{ value: 0, disabled: true }], // 缺失文件已补齐
      }),
      supplementFile: this.fb.group({
        endUserContractFiles: [null], // 中标通知书
        winningNoticeFiles: [null], // 中标公告
        siteSurveyReportFiles: [null], // 场地勘验报告/要货函
        confirmSupplementFiles: [null], // 中标确认补充文件
        biddingAnnouncePrice: [null], // 中标公告价格
        biddingAnnounceCurrency: [null], // 中标公告币种
        biddingAnnounceDate: [null], // 中标公告发布时间
        endTimeDate: [null], // 公示期结束日期
        specialApprovalDate: [{ value: null, disabled: true }], // 特批完成日期
        biddingNoticeSignDate: [null], // 后补中标通知书的签订日期
        lackingFilesAdded: [0], // 缺失文件已补齐
      })
    }),
  });

  get marketBundles(): FormArray {
    return this.biddingForm.get("marketBundles") as FormArray;
  }

  get approvalInfo(): FormGroup {
    return this.biddingForm.get("approvalInfo") as FormGroup;
  }

  get biddingApprovalInfo(): FormGroup {
    return this.approvalInfo.get("biddingApprovalInfo") as FormGroup;
  }

  get grantAuthApprovalInfo(): FormGroup {
    return this.approvalInfo.get("grantAuthApprovalInfo") as FormGroup;
  }

  get depositApprovers(): FormArray {
    return this.biddingApprovalInfo.get('depositApprovers') as FormArray
  }

  get technicalApprovers(): FormArray {
    return this.biddingApprovalInfo.get('technicalApprovers') as FormArray
  }

  get biddingFilling(): FormGroup {
    return this.approvalInfo.get("biddingFilling") as FormGroup;
  }

  get fillingMarketBundles(): FormArray {
    return this.biddingFilling.get("marketBundles") as FormArray;
  }

  get biddingConfirm(): FormGroup {
    return this.approvalInfo.get("biddingConfirm") as FormGroup;
  }

  get supplementFile(): FormGroup {
    return this.approvalInfo.get("supplementFile") as FormGroup;
  }

  get isCommomApproval() {
    if (this.fromSupplement) {
      return false
    }
    const specialApprovalNodes = ["ecos_bid_auth", "ecos_bid_filing", 'ecos_bid_confirm', 'ecos_bid_bidding_approval', 'ecos_bid_confirm2'];
    return !specialApprovalNodes.includes(this.taskStatus);
  }

  get showBiddingApprovalTab() {
    return this.processStatus !== 'ecos_bid_bidding_approval' && this.originData.businessModel === BUSINESS_MODEL_DIRECT && this.originData.nonStandard.isNonStandard === 1 && !this.isResubmit
  }

  get showAuthApprovalTab() {
    return (this.originData.cpVerifyRequired === 1 || this.originData.cpVerifyRequired === 0) && (this.processStatus !== 'ecos_bid_auth' || !this.fromTask) && !this.isResubmit
  }

  // 判断中标备案tab的显示, 这里用中标价格币种是否有值进行判断
  get showBidFillingTab() {
    return !!this.originData.biddingAwardCurrency && (this.processStatus !== 'ecos_bid_filing' || !this.fromTask) && !this.isResubmit
  }

  // 判断中标确认tab的显示, 这里用缺失文件已补齐来判断
  get showBidConfirmTab() {
    const show = 
      (this.originData.lackingFilesAdded === 1 || this.originData.lackingFilesAdded === 0) &&
      ((this.processStatus !== 'ecos_bid_confirm' && this.processStatus !== 'ecos_bid_confirm2') || !this.fromTask) &&
      !this.isResubmit &&
      this.processStatus !== 'ecos_bid_filing'
    return show
  }

  get allAgreementNoMap(): Map<string, any> {
    const map = new Map()
    this.agreementList.forEach((agreement) => {
      map.set(agreement.value, agreement)
    })
    return map
  }

  get approveTabTitle() {
    if (this.fromSupplement) {
      return '待补充文件'
    }
    const titleMap = {
      ecos_bid_auth: '发放授权',
      ecos_bid_bidding_approval: '非标条款审批',
      ecos_bid_filing: '中标备案',
      ecos_bid_confirm: '中标确认',
    }
    if (this.processStatus === 'ecos_bid_bidding_approval' && this.originData.businessModel !== BUSINESS_MODEL_DIRECT) {
      return '审批'
    }
    return titleMap[this.processStatus] || '审批'
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private message: NzMessageService,
    public biddingV3Service: BiddingV3Service,
    private location: Location,
    private breadcrumbService: BreadcrumbService,
    private processTaskStatusPipe: ProcessTaskStatusPipe,
    private routerExtend: RouterExtendService,
    private modalService: NzModalService,
  ) {}

  ngOnInit(): void {
    this.pageLoading = true;
    const {
      params: { id: applyId },
      queryParams: { processInstanceTaskId, procInstId, fromTask, taskStatus, referenceId, processStatus, fromSupplement, isHandle },
    } = this.activatedRoute.snapshot;
    this.fromTask = fromTask === 'true'
    this.isResubmit = taskStatus === 'ecos_bid_resubmit' && this.fromTask
    this.referenceId = referenceId;
    this.fromSupplement = fromSupplement === 'true'
    this.isHandle = isHandle == 1
    this.taskId = processInstanceTaskId;
    this.taskStatus = taskStatus;
    this.processStatus = processStatus
    this.procInstId = procInstId
    this.getApplyDetail(applyId);
    this.setPageBreadCrumb()
    this.biddingV3Service.pageLoading$.subscribe(loading => this.pageLoading = loading)
  }

  createMarketBundleProductOption() {
    return this.fb.group({
      productName: [null],
      id: [null],
      cpProductId: [null],
      biddingMarketBundleId: [null],
    })
  }

  createMarketBundleProduct() {
    return this.fb.group({
      id: [null],
      simulationId: [null],
      modality: [null], // Modality
      bmc: [null], // 产品线
      configName: [null],
      createdDate: [null],
      productModel: [null], // 产品型号
      medicalDeviceName: [null], // 医疗器械名称
      marketBundleName: [null], // Market Bundle Name
      quantity: [null], // 台数
      dtcDealerAgreement: [null], // DTC经销商协议
      dtcAuthorizedProduct: [null], // DTC经销商协议-授权产品
      dtcAuthorizedArea: [null], // DTC经销商协议-授权区域
      latestDealerAgreement: [{ value: null, disabled: true }], // 最新经销商协议
      authorizedProduct: [null], // 授权产品
      authorizedArea: [null], // 授权区域
      options: this.fb.array([]), // CC Option列表
      awardOrNot: [false], // 是否中标产品
      awardPrice: [null], // 中标价格
      awardCurrency: [null], // 中标价格币制
      createTime: [null], // 创建时间
      createUser: [null], // 创建人
    });
  }

  createMarketBundle() {
    return this.fb.group({
      opportunityId: [null], // Opportunity Id
      dealFormId: [null], // Deal Form Id
      simulationId: [null], // Simulation Id
      opportunityHierachyLink: [{ value: null, disabled: this.disabled }], // 商业层级关系链接
      products: this.fb.array([]), // 产品列表
      commercialProductName: [null]
    });
  }

  createAgreement(dealerAgreement, authorizedProduct, authorizedArea) {
    return this.fb.group({
      dealerAgreement: [dealerAgreement],
      authorizedProduct: [authorizedProduct],
      authorizedArea: [authorizedArea],
    })
  }

  showImportOppDialog() {
    const dataSource = this.biddingForm.get('dataSource').value
    const marketBundles = this.biddingForm.get('marketBundles').value
    const businessModel = this.biddingForm.get('basicInfo').get('baseInfo').get('businessModel').value
    const dealerName = this.biddingForm.get('supplementInfo').get('dealerInfo').get('dealerName').value
    const accountName = this.biddingForm.get('accountName').value
    this.importOpp.show(
      dataSource,
      { accountName },
      marketBundles,
      dealerName,
      businessModel,
    );
  }

  initBasicInfo() {
    const {
      dataSource, accountName, biddingModel, biddingProgramName, businessModel, biddingType,
      biddingNumber, biddingOrgName, biddingOpenDate, biddingValidDate, hospitalName,
      customerCode, customerType, groupPurchaseCompany, customerCategory, customerProvince,
      groupPurchase, applicant, biddingOwner, biddingOwnerPosition,
      systemRegion, modality, team, cycleGroup, bigArea, smallArea, referenceId,
    } = this.originData as any
    this.biddingForm.patchValue({
      dataSource,
      accountName,
      basicInfo: {
        baseInfo: {
          referenceId,
          biddingModel,
          biddingProgramName,
          businessModel,
          biddingType,
          biddingNumber,
          biddingOrgName,
          biddingOpenDate,
          biddingValidDate,
        },
        finalUser: {
          hospitalName,
          customerCode,
          customerType,
          groupPurchaseCompany,
          customerCategory,
          customerProvince,
          groupPurchase: groupPurchase === 1 ? true : false,
        },
        applicant: {
          applicant,
          biddingOwner,
          biddingOwnerPosition,
          systemRegion,
          team,
          modality,
          cycleGroup,
          bigArea,
          smallArea,
        },
      },
    });
  }

  initProductInfo() {
    const billingMarketBundles = this.biddingFilling.get('approvedForm').get("marketBundles") as FormArray;
    const { marketBundles: originMarketBundles, dataSource } = this.originData
    // 聚合数据
    const marketBundles = []
    const idMap = new Map()
    originMarketBundles.forEach((marketBundle) => {
      const { opportunityId, dealFormId } = marketBundle
      const id = dataSource === 'CP Deal Form' ? `${opportunityId}-${dealFormId}` : opportunityId
      if (idMap.has(id)) {
        const index = idMap.get(id)
        marketBundles[index].products.push(marketBundle)
      } else {
        idMap.set(id, marketBundles.length)
        marketBundles.push({ ...marketBundle, products: [marketBundle] })
      }
    })
    // 排序
    marketBundles.sort((l, r) => {
      if (l.opportunityId !== r.opportunityId) {
        return l.opportunityId.localeCompare(r.opportunityId)
      } else {
        return l.dealFormId.localeCompare(r.dealFormId)
      }
    })
    console.log(marketBundles);
    marketBundles.forEach(item => {
      const { products } = item
      const marketBundle = this.createMarketBundle()
      const billingMarketBundle = this.createMarketBundle()
      marketBundle.patchValue(item)
      billingMarketBundle.patchValue(item)
      const marketBundleProducts = marketBundle.get("products") as FormArray;
      const billingMarketBundleProducts = billingMarketBundle.get("products") as FormArray;
      products.forEach((product) => {
        const marketBundleProduct = this.createMarketBundleProduct();
        const billingMarketBundleProduct = this.createMarketBundleProduct();
        marketBundleProduct.patchValue({ ...product, awardOrNot: product.awardOrNot === 1 ? true : false });
        billingMarketBundleProduct.patchValue({ ...product, awardOrNot: product.awardOrNot === 1 ? true : false });
        marketBundleProducts.push(marketBundleProduct)
        billingMarketBundleProducts.push(billingMarketBundleProduct)
        const { products } = product
        if (products && products.length > 0) {
          const marketBundleProductOptions = marketBundleProduct.get('options') as FormArray
          products.forEach((option) => {
            const marketBundleProductOption = this.createMarketBundleProductOption()
            marketBundleProductOption.patchValue(option)
            marketBundleProductOptions.push(marketBundleProductOption)
          })
        }
      })
      this.marketBundles.push(marketBundle)
      billingMarketBundles.push(billingMarketBundle)
    })
    // originMarketBundles.forEach((item) => {
    //   const marketBundle = this.createMarketBundle();
    //   delete item.products;
    //   marketBundle.patchValue(item);
    //   const marketBundleProduct = this.createMarketBundleProduct();
    //   marketBundleProduct.patchValue(item);
    //   const products = marketBundle.get("products") as FormArray;
    //   products.push(marketBundleProduct);
    //   this.marketBundles.push(marketBundle);
    //   billingMarketBundles.push(marketBundle);
    // });
  }

  initSupplementInfo() {
    const {
      modality,
      businessModel,
      authorizationRequired,
      bidderName,
      bidderRegistAddress,
      bidderRegistLocation,
      participationTenderLetterFiles,
      biddingDocumentFiles,
      nonStandard,
      bidderAmount,
      bidderCurrency,
      bidderBondAmount,
      bidderBondCurrency,
      bidderBondPercent,
      performanceBondAmount,
      performanceBondCurrency,
      performanceBondPercent,
      secondaryDistributor,
      bidderDdpStatus,
      bidderDdpDate,
      dealerName,
      distributorAgreement,
      distributorType,
      distributorDdpStatus,
      distributorDdpDate,
      sealedLetterFiles,
      letterOfAuthorizationFiles,
      salesManagerAuthorizationLetter,
      subTiers,
    } = this.originData as any
    const supplementInfo = this.biddingForm.get('supplementInfo') as FormGroup
    const dealerInfo = supplementInfo.get('dealerInfo') as FormGroup
    const biddingCompany = supplementInfo.get('biddingCompany') as FormGroup
    switch(businessModel) {
      case BUSINESS_MODEL_DIRECT:
        supplementInfo.patchValue({
          biddingInfo: {
            authorizationRequired,
            bidderName,
            bidderRegistAddress,
            bidderRegistLocation,
            participationTenderLetterFiles,
            biddingDocumentFiles,
            salesManagerAuthorizationLetter,
          },
          biddingTerm: {
            biddingAmount: {
              bidderAmount,
              bidderCurrency,
              bidderBondAmount,
              bidderBondCurrency,
              bidderBondPercent,
              performanceBondAmount,
              performanceBondCurrency,
              performanceBondPercent,
            },
          }
        })
        if (nonStandard) {
          const {
            logisticTerms,
            logisticTermsDesc,
            afterSaleTermsDesc,
            paymentTerms,
            paymentTermsDesc,
            specificationTermsDesc,
            legalTermsDesc,
            logisticTermsApprovalStatus,
            afterSaleTermsApprovalStatus,
            paymentTermsApprovalStatus,
            specificationTermsApprovalStatus,
            bondAmountTermsApprovalStatus,
          } = nonStandard
          supplementInfo.patchValue({
            biddingTerm: {
              logisticTerm: {
                logisticTerms,
                logisticTermsDesc,
              },
              afterSaleTermsDesc,
              paymentTerm: {
                paymentTerms,
                paymentTermsDesc,
              },
              specificationTermsDesc,
              legalTermsDesc,
            }
          })

          if (logisticTerms === 'WLTKSMBZ') {
            this.biddingForm.get('supplementInfo').get('biddingTerm').get('logisticTerm').get('logisticTermsDesc').disable()
          }

          this.approvalInfo.get('biddingApprovalStatus').patchValue({
            logisticTermsApprovalStatus,
            afterSaleTermsApprovalStatus,
            paymentTermsApprovalStatus,
            specificationTermsApprovalStatus,
            bondAmountTermsApprovalStatus,
          })

          if (logisticTerms === 'WLTKSMBZ') {
            supplementInfo.get('biddingTerm').get('logisticTerm').get('logisticTermsDesc').disable()
          }
        }
        this.onCalcPaymentTerms()
        break
      default: // Indirect Stock
        dealerInfo.setValidators(dealerDdpStatusValidator)
        biddingCompany.setValidators(bidderDdpStatusValidator)
        supplementInfo.patchValue({
          indirectBiddingInfo: {
            authorizationRequired,
          },
          biddingCompany: {
            secondaryDistributor,
            bidderName,
            bidderRegistAddress,
            bidderDdpStatus,
            bidderDdpDate,
          },
          dealerInfo: {
            dealerName,
            distributorAgreementNo: distributorAgreement ? distributorAgreement.map(({ dealerAgreement }) => dealerAgreement) : [],
            distributorType,
            distributorDdpStatus,
            distributorDdpDate,
          },
          biddingFile: {
            sealedLetterFiles,
            letterOfAuthorizationFiles,
          },
        })
        setTimeout(() => {
          const subTiersDisabled = !(this.fromTask && [ 'ecos_bid_resubmit', 'ecos_bid_bidding_approval', 'ecos_bid_auth', 'ecos_bid_filing', 'ecos_bid_confirm', 'ecos_bid_confirm2'].includes(this.processStatus))
          this.subTierSubject.next({ type: 'add', data: subTiers, disabled: subTiersDisabled })
        }, 0);
        if (distributorAgreement) {
          const formArray = this.biddingForm.get('supplementInfo').get('dealerInfo').get('distributorAgreement') as FormArray
          distributorAgreement.forEach(({ dealerAgreement, authorizedProduct, authorizedArea }) => {
            const agreement = this.createAgreement(dealerAgreement, authorizedProduct, authorizedArea)
            formArray.push(agreement)
          })
        }
        if (dealerName) {
          this.getAgreementList(dealerName)
        }
    }
  }

  disableForm() {
    this.biddingForm.disable();
    for (let i = 0; i < this.marketBundles.length; i++) {
      this.marketBundles.at(i).disable()
    }
  }

  initCancelFlag() {
    //能否发起取消项目 角色='Win Confirm' bg=PD&IGT
    var userRoleList = JSON.parse(window.localStorage.getItem("roles"));
    if(userRoleList.includes('Win Confirm') && this.originData.modality === 'PD&IGT' && this.processStatus === 'ecos_bid_done') {
      this.cancelFlag = true;
    }
    this.getBiddingFlag();
  }

  // 判断ddp status
  checkDealerDdpStatus() {
    const { businessModel, dealerName } = this.originData
    if (businessModel !== BUSINESS_MODEL_DIRECT && !this.fromSupplement && dealerName) {
      this.biddingV3Service.checkDdpStatus(dealerName).subscribe(({ data }) => {
        if (data.isValid === false ) {
          this.ddpDateExpiredVisible = true
        }
      })
    }
  }

  getApplyDetail(applyId) {
    this.biddingV3Service.detail(applyId).subscribe(({ data }) => {
      this.originData = {
        ...data,
        otherBiddingNumber: data.otherBiddingNumber ? data.otherBiddingNumber.filter(({ referenceId }) => referenceId !== this.referenceId && referenceId)  : []
      };
      const hasNonStandardInfo = data.businessModel === BUSINESS_MODEL_DIRECT && data.nonStandard.isNonStandard === 1

      // 重新提交
      if (this.isResubmit) {
        if (hasNonStandardInfo) {
          // 有非标审核的重新提交, 表单不可修改, 提供重新编辑的按钮, 可以编辑指定条款
          this.showReopenButton = true
          this.disableForm()
        } else {
          this.disabled = false
        }
      } else {
        // 非重新提交, disable所有字段
        this.disableForm()
        this.approvalInfo.enable();
      }
      this.initBasicInfo()
      this.initProductInfo()
      this.initSupplementInfo()
      this.initCancelFlag();
      this.pageLoading = false;
      if (this.fromTask || this.fromSupplement) {
        
        if (this.taskStatus === 'ecos_bid_special_approval') {
          setTimeout(() => {
            this.tabs.activeId('bidding-confirm')
          }, 0);
        } else {
          setTimeout(() => {
            this.tabs.activeId('approval')
          }, 0);
        }
      }

      this.checkDealerDdpStatus()
      this.enableProductField()
    });
  }

  // 这两个节点开放编辑产品信息里的产品型号和医疗器械名称
  enableProductField() {
    if (this.fromTask && ['ecos_bid_bidding_approval', 'ecos_bid_confirm'].includes(this.processStatus)) {
      this.productEditable = true
      if (this.processStatus === 'ecos_bid_bidding_approval') {
        this.marketBundles.controls.forEach((marketBundle: FormGroup) => {
          const products = marketBundle.get('products') as FormArray
          products.controls.forEach((product: FormGroup) => {
            product.get('productModel').setValidators([Validators.required])
            product.get('medicalDeviceName').setValidators([Validators.required])
          })
        })
      }
    }
  }

  // 计算是否需要招标授权
  // 1. modality是US和CC时, 是否招标授权强制为是, 不可修改
  // 2. 业务模式=直投, 医院=公立医院, 招标类型=公开投标, 强制为是, 不可修改
  onCalcAuthorizationRequired() {
    if (this.disabled) {
      return
    }
    const {
      basicInfo: {
        baseInfo: {
          businessModel,
          biddingType,
        },
        finalUser: {
          customerType,
        },
        applicant: {
          modality,
        },
      },
    } = this.biddingForm.getRawValue()

    const authorizationRequired = this.biddingForm.get('supplementInfo').get('biddingInfo').get('authorizationRequired')
    const indirectAuthorizationRequired = this.biddingForm.get('supplementInfo').get('indirectBiddingInfo').get('authorizationRequired')
    if (modality !== 'PD&IGT' ||
      (businessModel === BUSINESS_MODEL_DIRECT && customerType === '公立医院' && biddingType !== '其他类型')
    ) {
      authorizationRequired.patchValue(1)
      authorizationRequired.disable()
      indirectAuthorizationRequired.patchValue(1)
      indirectAuthorizationRequired.disable()
    } else {
      authorizationRequired.reset()
      authorizationRequired.enable()
      indirectAuthorizationRequired.reset()
      indirectAuthorizationRequired.enable()
    }
  }

  onCalcPaymentTerms(callback = null) {
    const {
      basicInfo: {
        baseInfo: { businessModel },
        finalUser: { customerType },
        applicant: { modality }
      },
      supplementInfo: {
        biddingTerm: {
          biddingAmount: { bidderCurrency },
        },
      },
    } = this.biddingForm.getRawValue();
    if (businessModel && customerType && modality && bidderCurrency) {
      this.biddingV3Service.getPaymentList({
        modality,
        currency: bidderCurrency,
        businessModel,
        hospitalType: customerType
      }).subscribe(({ data }) => {
        this.paymentTerms = data
        if (typeof callback === 'function') {
          callback()
        }
      })
    } else {
      this.paymentTerms = []
    }
  }

  handleAction(action) {
    const {
      commonInfo: { processComments, processAttachmentIds },
      grantAuthApprovalInfo,
      biddingConfirm,
    } = this.approvalInfo.getRawValue();
    this.remarkMsgVisible = false
    if (action === 'rejected' && (!processComments || !processComments.trim())) {
      this.message.warning('请填写拒绝理由')
      this.remarkMsgVisible = true
      return
    }
    const { id, applyId, businessModel, nonStandard, depositApprovers, technicalApprovers } = this.originData;
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
    switch(this.taskStatus) {
      case 'ecos_bid_dm_approval':
        data.depositApprovers = depositApprovers || []
        data.technicalApprovers = technicalApprovers || []
        break
      case 'ecos_bid_auth':
        if (action !== 'rejected') {
          Object.assign(data, grantAuthApprovalInfo)
        }
        break
      case 'ecos_bid_confirm':
        const {
          lackingAwardNotice,
          lackingWinningNotice,
          lackingGoodsLetter,
          lackingOther,
        } = biddingConfirm
        const biddingConfirmData = {
          ...biddingConfirm,
          lackingAwardNotice: lackingAwardNotice ? 1 : 0,
          lackingWinningNotice: lackingWinningNotice ? 1 : 0,
          lackingGoodsLetter: lackingGoodsLetter ? 1 : 0,
          lackingOther: lackingOther ? 1 : 0,
        }
        Object.assign(data, biddingConfirmData)
        break
    }
    this.pageLoading = true
    this.biddingV3Service.approve(data).subscribe(({ code, msg }) => {
      this.pageLoading = false;
      if (code === '0000') {
        this.message.success("审批成功!");
        this.routerExtend.back();
      } else {
        this.message.error(msg)
      }
      // this.router.navigate(["/ecos/my-todo"]);
    }, ({ message }) => {
      this.pageLoading = false;
      this.message.error(message)
    });
  }

  // 重新提交
  handleResubmit() {
    this.pageLoading = true;
    const data = this.getFormData();
    this.biddingV3Service.submit(data).subscribe(({ code, msg }) => {
      this.pageLoading = false;
      if (code === '0000') {
        this.message.success("提交成功");
        this.routerExtend.back();
      } else {
        this.message.error(msg)
      }
      // this.router.navigate(["/ecos/my-started"]);
    });
  }

  getAgreementList(dealerName) {
    const params = {
      dealerName,
      invalid: false
    }
    // this.biddingV3Service.getAgreementList(params).subscribe(({ data: { rows } }) => {
    //   this.agreementList = rows.map((item) => ({ ...item, label: item.agreementno, value: item.agreementno }))
    //   this.originData.distributorAgreement.forEach(({ dealerAgreement }) => {
    //     if (!this.allAgreementNoMap.has(dealerAgreement)) {
    //       this.agreementList.push({ label: dealerAgreement, value: dealerAgreement })
    //     }
    //   })
    // })
    this.biddingV3Service.getAgreementList(params).subscribe(({ data: { rows } }) => {
      // 去重
      const agreementnoSet = new Set()
      this.agreementList = []
      rows.forEach((item) => {
        const { agreementno } = item
        if (!agreementnoSet.has(agreementno)) {
          this.agreementList.push({ ...item, label: item.agreementno, value: item.agreementno })
        }
        agreementnoSet.add(agreementno)
      })
      this.calcDistributorAgreement()
    })
  }

  // 整合表单数据
  getFormData() {
    const {
      dataSource,
      accountName,
      basicInfo: { baseInfo, finalUser, applicant },
      marketBundles,
      supplementInfo: {
        biddingInfo,
        indirectBiddingInfo,
        biddingTerm: {
          logisticTerm,
          afterSaleTermsDesc,
          biddingAmount,
          paymentTerm,
          specificationTermsDesc,
          legalTermsDesc,
        },
        biddingCompany,
        dealerInfo,
        biddingFile,
      },
      approvalInfo: {
        biddingApprovalStatus: {
          logisticTermsApprovalStatus,
          afterSaleTermsApprovalStatus,
          paymentTermsApprovalStatus,
          specificationTermsApprovalStatus,
          bondAmountTermsApprovalStatus,
        }
      }
    } = this.biddingForm.getRawValue();

    const newMarketBundles = [];
    marketBundles.forEach((marketBundle) => {
      const products = marketBundle.products;
      products.forEach((product) => {
        const item = { ...marketBundle, ...product, awardOrNot: product.awardOrNot ? 1 : 0, products: product.options };
        delete item.options;
        newMarketBundles.push(item);
      });
    });

    const data: any = {
      dataSource,
      accountName,
      ...baseInfo,
      ...finalUser,
      groupPurchase: finalUser.groupPurchase ? 1 : 0,
      ...applicant,
      marketBundles: newMarketBundles,
      nonStandard: {},
    };

    if (this.originData.id) {
      const { id, applyId } = this.originData;
      data.id = id;
      data.applyId = applyId;
      if (this.taskId) {
        data.processInstanceTaskId = this.taskId
      }
      if (this.referenceId) {
        data.referenceId = this.referenceId;
      }
    }

    // 直投
    if (baseInfo.businessModel === BUSINESS_MODEL_DIRECT) {
      const nonStandard: any = {
        ...this.originData.nonStandard,
        ...logisticTerm,
        afterSaleTermsDesc,
        ...paymentTerm,
        specificationTermsDesc,
        legalTermsDesc,
        logisticTermsApprovalStatus,
        afterSaleTermsApprovalStatus,
        paymentTermsApprovalStatus,
        specificationTermsApprovalStatus,
        bondAmountTermsApprovalStatus,
      };
      Object.assign(data, { nonStandard, ...biddingAmount, ...biddingInfo });
    } else {
      Object.assign(data, {
        ...biddingCompany,
        ...dealerInfo,
        ...biddingFile,
        ...indirectBiddingInfo,
      });
    }
    return data;
  }

  goBack() {
    this.location.back()
  }

  setPageBreadCrumb() {
    if (this.isResubmit) {
      this.breadcrumbService.replace('重新提交')
    } else if (this.fromSupplement) {
      this.breadcrumbService.replace('中标确认文件待补充')
    } else if (this.fromTask) {
      this.processTaskStatusPipe.transform(this.taskStatus).subscribe(val => this.breadcrumbService.replace(val))
    }
  }

  // 计算协议经销商DDP状态
  calcDistributorDdpStatus() {
    const { supplementInfo: { dealerInfo } } =this.biddingForm.getRawValue()
    let distributorDdpStatus = null
    const { distributorDdpDate } = dealerInfo
    if (distributorDdpDate) {
      const date1 = new Date(distributorDdpDate)
      const date2 = new Date()
      const duration = Math.ceil((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24))
      distributorDdpStatus = duration > 0 ? '通过' : '未通过'
    } else {
      distributorDdpStatus = '未通过'
    }
    this.biddingForm.get('supplementInfo').get('dealerInfo').patchValue({
      distributorDdpStatus
    })
  }

  getBidderCompanyInfo(bidderName) {
    return BIDDING_COMPANIES.find(({ value }) => value === bidderName);
  }

  // 计算投标公司DDP状态
  calcBidderDdpStatus() {
    const { supplementInfo: { biddingCompany } } =this.biddingForm.getRawValue()
    const { secondaryDistributor, bidderDdpDate } = biddingCompany
    let bidderDdpStatus = null
    if (secondaryDistributor === 1) {
      bidderDdpStatus = '非飞利浦授权二级经销商'
    } else if (bidderDdpDate) {
      const date1 = new Date(bidderDdpDate)
      const date2 = new Date()
      const duration = Math.ceil((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24))
      bidderDdpStatus = duration > 0 ? '通过' : '未通过'
    } else {
      bidderDdpStatus = '未通过'
    }
    this.biddingForm.get('supplementInfo').get('biddingCompany').patchValue({
      bidderDdpStatus
    })
  }

  onSelectOpp({ dataSource, data }) {
    const {
      accountName,
      hospitalId,
      biddingCompanyName,
      customerType,
      dealerName,
      groupName,
      provinceName,
      category,
      opportunityName,
      tenderNo,
      businessModel,
      bidDate,
      hospitalName,
      predictBiddingCurrency,
      paymentDescription,
      predictBiddingPrice,
      groupPurchase,
      cityName,
      opportunityId,
    } = data[0];

    setTimeout(() => {
      const validData = data.filter(({ subTierDealers }) => Array.isArray(subTierDealers))
      if (validData.length > 0) {
        this.subTierSubject.next({
          type: 'add',
          data: {
            crmOpId: opportunityId,
            dealerSubTiers: validData[0].subTierDealers.map((item) => ({ ...item, crmOpId: opportunityId }))
          }
        })
      }
    }, 0);

    const marketBundlesArray = this.biddingForm.get("marketBundles") as FormArray;
    this.biddingForm.patchValue({
      dataSource,
      accountName,
    });

    const marketBundles = []
    if (dataSource === 'CP Deal Form') {
      const oppDealMap = new Map()
      data.forEach((item) => {
        const { opportunityId, dealFormId, opportunityHierarchyLink } = item
        if (oppDealMap.get(opportunityId) && oppDealMap.get(opportunityId).get(dealFormId) !== undefined) {
          const index = oppDealMap.get(opportunityId).get(dealFormId)
          marketBundles[index].products.push(item)
        } else {
          oppDealMap.set(opportunityId, new Map().set(dealFormId, marketBundles.length))
          marketBundles.push({ opportunityId, dealFormId, opportunityHierarchyLink, products: [item] })
        }
      })
    } else if (dataSource === 'CP Simulation') {
      const oppMap = new Map()
      data.forEach((item) => {
        const { opportunityId, dealFormId, opportunityHierarchyLink } = item
        if (oppMap.get(opportunityId) !== undefined) {
          const index = oppMap.get(opportunityId)
          marketBundles[index].products.push(item)
        } else {
          oppMap.set(opportunityId, marketBundles.length)
          marketBundles.push({ opportunityId, dealFormId, opportunityHierarchyLink, products: [item] })
        }
      })
    }

    const supplementInfo = this.biddingForm.get('supplementInfo') as FormGroup
    const dealerInfo = supplementInfo.get('dealerInfo') as FormGroup
    const biddingCompany = supplementInfo.get('biddingCompany') as FormGroup
    if (businessModel !== BUSINESS_MODEL_DIRECT) {
      dealerInfo.setValidators([dealerDdpStatusValidator])
      biddingCompany.setValidators([bidderDdpStatusValidator])
      supplementInfo.patchValue({
        dealerInfo: {
          dealerName,
        },
        biddingCompany: {
          secondaryDistributor: biddingCompanyName === dealerName ? 0 : 1,
          bidderName: biddingCompanyName,
          bidderDdpStatus: biddingCompanyName !== dealerName ? '非飞利浦授权二级经销商' : null,
        },
      })
    } else {
      dealerInfo.clearValidators()
      biddingCompany.clearValidators()
    }

    if (dealerName && businessModel !== BUSINESS_MODEL_DIRECT) {
      this.getAgreementList(dealerName)
      this.biddingV3Service.searchDealer(dealerName).subscribe(({ data: { rows } }) => {
        if (rows && rows.length === 1) {
          const [{ mdtdealerddpexpiredate, regaddress, dealeradmincellphone }] = rows
          this.biddingForm.get('supplementInfo').get('dealerInfo').patchValue({
            dealerRegistAddress: regaddress,
            distributorDdpDate: mdtdealerddpexpiredate,
            dealerPhone: dealeradmincellphone
          })
        }
        this.calcDistributorDdpStatus()
      })
    }

    if (biddingCompanyName) { // 投标公司
      const bidderCompany = this.getBidderCompanyInfo(biddingCompanyName)
      if (bidderCompany) {
        const { bidderRegistAddress, bidderRegistLocation } = bidderCompany
        if (businessModel === BUSINESS_MODEL_DIRECT) {
          this.biddingForm.get('supplementInfo').get('biddingInfo').patchValue({
            bidderName: biddingCompanyName,
            bidderRegistAddress,
            bidderRegistLocation,
          });
        } else {
          this.biddingForm.get('supplementInfo').get('biddingCompany').patchValue({
            bidderRegistAddress,
          });
        }
      }
      if (businessModel !== BUSINESS_MODEL_DIRECT) {
        this.biddingV3Service.searchDealer(biddingCompanyName).subscribe(({ data: { rows } }) => {
          if (rows && rows.length === 1) {
            const [{ mdtdealerddpexpiredate, regaddress }] = rows
            this.biddingForm.get('supplementInfo').get('biddingCompany').patchValue({
              bidderRegistAddress: regaddress,
              bidderDdpDate: mdtdealerddpexpiredate
            })
          }
          this.calcBidderDdpStatus()
        })
      }
    }

    this.biddingForm.patchValue({
      basicInfo: {
        baseInfo: {
          biddingProgramName: opportunityName,
          biddingNumber: tenderNo,
          businessModel,
          biddingOpenDate: bidDate,
        },
        finalUser: {
          customerCode: hospitalId, // 客户编号
          customerType, // 客户类型
          groupPurchaseCompany: groupName, // 采购集团名称
          customerProvince: provinceName, // 省份
          customerCity: cityName,
          customerCategory: category, // 客户分类
          hospitalName, // 医院名称
          groupPurchase: groupPurchase == 1,
        },
      },
    });

    marketBundles.forEach((item) => {
      const { opportunityId, dealFormId, opportunityHierarchyLink, products } = item
      const marketBundleGroup = this.createMarketBundle();

      if (dataSource === 'CP Simulation') {
        this.biddingV3Service.commercialProducts([opportunityId]).subscribe(({ code, data }) => {
          if (code === '0000' && Array.isArray(data) && data.length > 0) {
            const [{ commercialProductName }] = data
            marketBundleGroup.patchValue({ commercialProductName })
          }
        })
      }

      marketBundleGroup.patchValue({
        opportunityId,
        dealFormId,
        opportunityHierachyLink: opportunityHierarchyLink,
      })
      const marketBudleProductsArray = marketBundleGroup.get("products") as FormArray;
      products.forEach(({
        modality,
        bmc,
        productModel,
        medicalDeviceName,
        marketBundleId,
        marketBundleName,
        marketBundleQuantity,
        dtcDealerAgreement,
        products,
        simulationId,
        configName,
        createdDate,
      }) => {
        const marketBudleProductGroup = this.createMarketBundleProduct();
        marketBudleProductGroup.patchValue({
          simulationId,
          marketBundleId,
          modality,
          bmc,
          productModel,
          medicalDeviceName,
          marketBundleName,
          quantity: marketBundleQuantity,
          dtcDealerAgreement,
          configName,
          createdDate,
        });
        if (dtcDealerAgreement) {
          this.biddingV3Service.getAgreementList({ agreementNo: dtcDealerAgreement }).subscribe(({ data }) => {
            if (Array.isArray(data.rows) && data.rows.length > 0) {
              const [{ currentproduct, currentterritory }] = data.rows
              marketBudleProductGroup.patchValue({
                dtcAuthorizedProduct: currentproduct,
                dtcAuthorizedArea: currentterritory
              })
              this.calcDistributorAgreement()
            }
          })
        }
        const marketBudleProductOptionsArray = marketBudleProductGroup.get('options') as FormArray
        if (products && products.length > 0) {
          products.forEach(({ id: cpProductId, productName }) => {
            const marketBudleProductOptionGroup = this.createMarketBundleProductOption()
            marketBudleProductOptionGroup.patchValue({ cpProductId, productName })
            marketBudleProductOptionsArray.push(marketBudleProductOptionGroup)
          })
        }
        marketBudleProductsArray.push(marketBudleProductGroup)
      })
      marketBundlesArray.push(marketBundleGroup)
    })

    const paymentTermGroup = this.biddingForm.get('supplementInfo').get('biddingTerm').get('paymentTerm') as FormGroup
    if (businessModel === BUSINESS_MODEL_DIRECT) {
      const biddingAmountGroup = this.biddingForm.get('supplementInfo').get('biddingTerm').get('biddingAmount') as FormGroup
      if (!biddingAmountGroup.get('bidderCurrency').value) {
        biddingAmountGroup.patchValue({
          bidderCurrency: predictBiddingCurrency,
          bidderAmount: predictBiddingPrice ? Number(predictBiddingPrice).toFixed(2) : null
        })

        if (predictBiddingCurrency) {
          const company = BIDDING_COMPANIES.find((item) => item.currency === predictBiddingCurrency.toUpperCase())
          if (company) {
            const { value, bidderRegistAddress, bidderRegistLocation } = company
            const biddingInfoGroup = this.biddingForm.get('supplementInfo').get('biddingInfo')
            biddingInfoGroup.patchValue({
              bidderName: value,
              bidderRegistAddress,
              bidderRegistLocation,
            })
          }
        }

        paymentTermGroup.patchValue({
          paymentTermsDesc: paymentDescription
        })
      }
    }

    this.onCalcPaymentTerms(
      () => {
        if (businessModel === BUSINESS_MODEL_DIRECT && paymentDescription) {
          const paymentTerm = this.paymentTerms.find((item) => item === paymentDescription)
          if (paymentTerm) {
            paymentTermGroup.patchValue({
              paymentTerms: paymentTerm
            })
          } else {
            const otherPayment = this.paymentTerms.find((item) => item.indexOf('其他') > -1)
            if (otherPayment) {
              paymentTermGroup.patchValue({
                paymentTerms: otherPayment
              })
            }
          }
        }
      }
    )
  }

  calcDistributorAgreement() {
    const marketBundles = this.marketBundles.getRawValue()
    const agreementNoMap = new Map()
    const distributorAgreementArray = this.biddingForm
      .get('supplementInfo').get('dealerInfo').get('distributorAgreement') as FormArray
    // 清空formArray
    const arrLen = distributorAgreementArray.length
    for(let i = arrLen - 1; i >= 0; i--) {
      distributorAgreementArray.removeAt(i)
    }

    const distributorAgreementNo = []

    marketBundles.forEach(({ products }) => {
      products.forEach(({ dtcDealerAgreement, dtcAuthorizedProduct, dtcAuthorizedArea, latestDealerAgreement }) => {
        if (latestDealerAgreement) {
          if (!agreementNoMap.has(latestDealerAgreement)) {
            distributorAgreementNo.push(latestDealerAgreement)
            const agreement = this.allAgreementNoMap.get(latestDealerAgreement)
            agreementNoMap.set(latestDealerAgreement, agreement)
            const agreementGroup = this.createAgreement(
              latestDealerAgreement,
              agreement ? agreement.currentproduct : null,
              agreement ? agreement.currentterritory : null
            )
            distributorAgreementArray.push(agreementGroup)
          }
        } else if (dtcDealerAgreement && !agreementNoMap.has(dtcDealerAgreement)) {
          distributorAgreementNo.push(dtcDealerAgreement)
          const agreement = {
            currentproduct: dtcAuthorizedProduct,
            currentterritory: dtcAuthorizedArea
          }
          if (!this.allAgreementNoMap.has(dtcDealerAgreement)) {
            this.agreementList.push({ label: dtcDealerAgreement, value: dtcDealerAgreement, isDtc: true })
          }
          agreementNoMap.set(dtcDealerAgreement, agreement)
          const agreementGroup = this.createAgreement(
            dtcDealerAgreement,
            agreement.currentproduct,
            agreement.currentterritory
          )
          distributorAgreementArray.push(agreementGroup)
        }
      })
    })
    this.biddingForm
      .get('supplementInfo').get('dealerInfo').patchValue({
        distributorAgreementNo
      })
  }

  onReopenForm() {
    // 基础信息
    const baseInfo = this.biddingForm.get('basicInfo').get('baseInfo')
    baseInfo.enable()
    baseInfo.get('businessModel').disable()

    const finalUser = this.biddingForm.get('basicInfo').get('finalUser')
    finalUser.get('hospitalName').enable()
    finalUser.get('groupPurchase').enable()

    const applicant = this.biddingForm.get('basicInfo').get('applicant')
    applicant.get('systemRegion').enable()

    // 产品信息
    for (let i = 0; i < this.marketBundles.length; i++) {
      this.marketBundles.at(i).enable()
    }
    // 补充信息
    const { businessModel, modality, nonStandard } = this.originData
    const supplementInfo = this.biddingForm.get('supplementInfo')
    if (businessModel === BUSINESS_MODEL_DIRECT) {
      // 直投
      const biddingInfo = supplementInfo.get('biddingInfo')
      biddingInfo.enable()
      biddingInfo.get('bidderRegistAddress').disable()
      biddingInfo.get('bidderRegistLocation').disable()
      if (modality === 'PD&IGT') {
        // 组件库bug, 需要先reset, 再enable, 直接enable不生效
        biddingInfo.get('authorizationRequired').reset(this.originData.authorizationRequired)
        biddingInfo.get('authorizationRequired').enable()
      }
      supplementInfo.get('biddingTerm').enable()
      if (nonStandard.logisticTerms === 'WLTKSMBZ') {
        supplementInfo.get('biddingTerm').get('logisticTerm').get('logisticTermsDesc').disable()
      }
    } else {
      // 非直投
      if (modality === 'PD&IGT') {
        supplementInfo.get('indirectBiddingInfo').get('authorizationRequired').reset(this.originData.authorizationRequired)
        supplementInfo.get('indirectBiddingInfo').get('authorizationRequired').enable()
      }
      const biddingCompany = supplementInfo.get('biddingCompany')
      biddingCompany.enable()
      biddingCompany.get('bidderDdpStatus').disable()
      biddingCompany.get('bidderDdpDate').disable()

      const dealerInfo = supplementInfo.get('dealerInfo')
      dealerInfo.enable()
      dealerInfo.get('distributorDdpStatus').disable()
      dealerInfo.get('distributorDdpDate').disable()

      const biddingFile = supplementInfo.get('biddingFile')
      biddingFile.enable()
    }

    this.onCalcAuthorizationRequired()

    this.showReopenButton = false
    this.disabled = false
  }

  // 检查流程是否可以取消
  public getBiddingFlag() {
    const  { applyId } = this.originData;
    this.biddingV3Service.biddingCancelCheck(applyId).subscribe(res => {
      if (res && res.data) {
        // true 被进单使用过
        if (res.data.isBidding == true || res.data.isBidding === 'true') {
          this.isBidding = true;
        }
        if (res.data.isAauthorization == true || res.data.isAauthorization === 'true') {
          this.isAauthorization = true;
        }
      }
    });
  }

  // 取消项目
  public biddingCancel() {
    if (!this.take) {
      return;
    }
    this.take = false;
    if (this.remarks === '' || this.remarks == null) {
      this.rem_mess = true;
      this.take = true;
      return;
    }
    this.rem_mess = false;
    const  { applyId } = this.originData;
    const data = {
      "applyId": applyId,
      "processComments": this.remarks,
      "processInstanceTaskId": this.taskId,
    }
    this.biddingV3Service.biddingCancel(data).subscribe(({ code, msg }) => {
      this.take = true;
      if( code === '0000' ){
        this.message.create('success', '操作成功!');
        // this.router.navigate(['/ecos/my-done']);
        this.routerExtend.back();
        this.showoff = false;
      } else {
        this.message.create('error', msg);
        this.showoff = false;
        return;
      }
    }, error => {
      this.message.create('error', `错误`);
      this.take = true;
    });
  }

  public openCancel(val){
    if (val != 'isResubmit'){
      if (this.isAauthorization) {
        this.message.create('error', `当前是否需要投标授权为是，不可取消！`);
        return;
      }
      if (this.isBidding) {
        this.message.create('error', `当前投标授权项目已发起进单，不可取消！如需取消，请先取消所有相关进单项目。`);
        return;
      }
    }
    this.showoff = true;
  }

  public handleCancel() {
    this.showoff = false;
    this.rem_mess = false;
  }

  handleActiveTab(tabName) {
    this.tabs.activeId(tabName)
  }
}
