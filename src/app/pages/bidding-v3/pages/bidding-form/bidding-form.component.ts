import { Component, OnInit, ViewChild } from "@angular/core";
import { DictService, HttpService } from "@core/services";
import { NzMessageService, NzModalService } from "ng-zorro-antd";
import { Router, ActivatedRoute } from "@angular/router";
import { FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { ImportOppComponent } from "../../components/import-opp/import-opp.component";
import { BiddingV3Service } from "../../bidding-v3.service";
import { BIDDING_COMPANIES, BUSINESS_MODEL_DIRECT } from "../../bidding-v3.constants";
import { logisticTermsDescValidator, dealerDdpStatusValidator, bidderDdpStatusValidator, segmentValidator } from '../../bidding-v3.util'
import { ProgressTabsComponent } from "@app/modern-themes/components/progress-tabs/progress-tabs.component";
import { RouterExtendService } from "@app/modern-themes/services/router-extend.service";
import { Subject } from "rxjs";

// 投标金额相关校验
// 投标保证金金额和投标保证金百分比必填一项
// 履约保证金金额和履约保证金百分比必填一项
// const biddingAmountValidator = (control: FormGroup): ValidationErrors | null => {
//   const { bidderBondAmount, bidderBondPercent, performanceBondAmount, performanceBondPercent } = control.getRawValue()
// }

const isEmpty = (val) => val === null || val === '' || val === undefined

// 投标保证金及履约保证金校验: 金额和百分比必填一项
const biddingAmountValidator = (control: FormGroup): ValidationErrors | null => {
  const { bidderBondPercent, bidderBondAmount, performanceBondPercent, performanceBondAmount } = control.getRawValue()
  const error = {
    bidderBondError: false,
    performanceBondError: false
  }
  if (isEmpty(bidderBondPercent) && isEmpty(bidderBondAmount)) {
    error.bidderBondError = true
  }
  if (isEmpty(performanceBondPercent) && isEmpty(performanceBondAmount))  {
    error.performanceBondError = true
  }
  return (error.bidderBondError || error.performanceBondError) ? error : null
}

@Component({
  templateUrl: "./bidding-form.component.html",
  styleUrls: ["./bidding-form.component.scss"],
})
export class BiddingFormComponent implements OnInit {
  @ViewChild("importOpp") importOpp: ImportOppComponent;

  @ViewChild("tabs") tabs: ProgressTabsComponent;

  tabNames = ["basic-info", "product-info", "supplement-info"];

  public processInstanceTaskId: any = null;

  public activedTabId: any = "basic-info";
  activeTabIndex = 0;
  public pageLoading: boolean = false; // 加载转圈
  public taskStatus: any = '';

  subTierSubject = new Subject()

  agreementList = [] // 经销商协议列表

  paymentTerms = []

  biddingForm: FormGroup = this.fb.group({
    dataSource: [null], // 数据来源, CP Deal Form/CP Simulation
    accountName: [null],
    basicInfo: this.fb.group({
      // 基础信息
      baseInfo: this.fb.group({
        // 基本信息
        referenceId: [{ value: null, disabled: true }],
        biddingModel: [{ value: null, disabled: true }], // 招标授权模式
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
        customerCity: [{ value: null, disabled: true }], // 客户所属城市, 仅用于合同模板
        groupPurchase: [ false,  [Validators.required] ], // 是否为集采项目
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
          bidderAmount: [null, [Validators.required]], // 预计投标金额
          bidderCurrency: [null, [Validators.required]], // 预计投标币种
          bidderBondAmount: [null], // 投标保证金金额
          bidderBondCurrency: [null, [Validators.required]], // 投标保证金币种
          bidderBondPercent: [null], // 投标保证金百分比
          performanceBondAmount: [null], // 履约保证金金额
          performanceBondCurrency: [null, [Validators.required]], // 履约保证金币种
          performanceBondPercent: [null], // 履约保证金百分比
        }, { validators: [biddingAmountValidator] }),
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
        dealerPhone: [null], // 经销商联系方式, 仅用于合同模板
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
  });

  get marketBundles(): FormArray {
    return this.biddingForm.get("marketBundles") as FormArray;
  }

  get allAgreementNoMap(): Map<string, any> {
    const map = new Map()
    this.agreementList.forEach((agreement) => {
      map.set(agreement.value, agreement)
    })
    return map
  }

  originData = {
    dataSource: null,
    businessModel: null,
    id: null,
    applyId: null,
    nonStandard: {
      id: null,
      logisticTerms: null,
      logisticTermsDesc: null,
      afterSaleTermsDesc: null,
      paymentTerms: null,
      paymentTermsDesc: null,
      specificationTermsDesc: null,
      legalTermsDesc: null,
    },
    authorizationRequired: null,
    bidderName: null,
    bidderRegistAddress: null,
    bidderRegistLocation: null,
    participationTenderLetterFiles: null,
    biddingDocumentFiles: null,
    bidderAmount: null,
    bidderCurrency: null,
    bidderBondAmount: null,
    bidderBondCurrency: null,
    bidderBondPercent: null,
    performanceBondAmount: null,
    performanceBondCurrency: null,
    performanceBondPercent: null,
    marketBundles: [],
    subTiers: [],
  };

  referenceId;

  constructor(
    private message: NzMessageService,
    private router: Router,
    private fb: FormBuilder,
    public activatedRouter: ActivatedRoute,
    private biddingV3Service: BiddingV3Service,
    private http: HttpService,
    private dictService: DictService,
    private routerExtend: RouterExtendService,
    private modalService: NzModalService,
  ) {}

  ngOnInit() {
    const { id, referenceId, taskStatus } = this.activatedRouter.snapshot.queryParams;
    this.referenceId = referenceId;
    this.taskStatus = taskStatus;
    if (id) {
      this.getApplyDetail(id);
    } else {
      // 主页导入
      this.handleImport();
      // 初始化申请人信息
      this.initApplicant();
    }
  }

  // 计算是否需要招标授权
  // 1. modality是US和CC时, 是否招标授权强制为是, 不可修改
  // 2. 业务模式=直投, 医院=公立医院, 招标类型=公开投标, 强制为是, 不可修改
  onCalcAuthorizationRequired() {
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
    if (
      (modality && modality !== 'PD&IGT') ||
      (businessModel === BUSINESS_MODEL_DIRECT && customerType === '公立医院' && biddingType !== '其他类型')
    ) {
      authorizationRequired.patchValue(1)
      authorizationRequired.disable()
      indirectAuthorizationRequired.patchValue(1)
      indirectAuthorizationRequired.disable()
    } else {
      authorizationRequired.reset(authorizationRequired.value)
      authorizationRequired.enable()
      indirectAuthorizationRequired.reset(indirectAuthorizationRequired.value)
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
    marketBundles.forEach(item => {
      const { products } = item
      const marketBundle = this.createMarketBundle()
      marketBundle.patchValue(item)
      const marketBundleProducts = marketBundle.get("products") as FormArray;
      products.forEach((product) => {
        const marketBundleProduct = this.createMarketBundleProduct();
        marketBundleProduct.patchValue(product);
        marketBundleProducts.push(marketBundleProduct)
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
    })
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
          this.subTierSubject.next({ type: 'add', data: subTiers })
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

    this.onCalcAuthorizationRequired()
  }

  getApplyDetail(applyId) {
    this.pageLoading = true;
    this.biddingV3Service.detail(applyId).subscribe(({ data }) => {
      this.originData = data;
      this.initBasicInfo()
      this.initProductInfo()
      this.initSupplementInfo()
      this.pageLoading = false;
    });
  }

  createAgreement(dealerAgreement, authorizedProduct, authorizedArea) {
    return this.fb.group({
      dealerAgreement: [dealerAgreement],
      authorizedProduct: [authorizedProduct],
      authorizedArea: [authorizedArea],
    })
  }

  initApplicant() {
    const loginUserName = localStorage.getItem("ng_philips_username");
    const loginUserEmail = localStorage.getItem("ecom_ng_philips_code1");
    this.biddingForm.get("basicInfo").get("applicant").patchValue({
      applicant: loginUserEmail,
      biddingOwner: loginUserName,
    });
  }

  public handleToggleTab(val): void {
    if (typeof val === "number") {
      const tabName = this.tabNames[val];
      this.activedTabId = tabName;
      this.activeTabIndex = val;
    } else if (typeof val === "string") {
      const index = this.tabNames.findIndex((tabName) => tabName === val);
      if (index >= 0) {
        this.activedTabId = this.tabNames[index];
        this.activeTabIndex = index;
      }
    }
  }

  goNextStep() {
    this.handleToggleTab(this.activeTabIndex + 1);
  }

  goPreStep() {
    this.handleToggleTab(this.activeTabIndex - 1);
  }

  onClickTab({ nextTab, activeIndex }) {
    this.activedTabId = nextTab;
    this.activeTabIndex = activeIndex;
  }

  public onCancel(): void {
    // this.router.navigate(["/ecos/my-started"]);
    this.routerExtend.back();
  }

  // 保存草稿
  public onSave(): void {
    this.pageLoading = true;
    const data = this.getFormData();
    this.biddingV3Service.save(data).subscribe(({ code, msg }) => {
      if (code === '0000') {
        this.message.success("保存成功");
        // this.router.navigate(["/ecos/my-draft"]);
        this.routerExtend.back();
      } else {
        this.message.error(msg);
      }
      this.pageLoading = false;
    }, ({ message }) => {
      this.message.error(message);
      this.pageLoading = false;
    });
  }

  //删除草稿
  deleteDraft() {
    const  { applyId } = this.originData;
    this.biddingV3Service.deleteDraft(applyId).subscribe(({ code, msg }) => {
      if( code === '0000' ){
        this.message.create('success', '操作成功!');
        // this.router.navigate(['/ecos/my-draft']);
        this.routerExtend.back();
      } else {
        this.message.create('error', msg);
        return;
      }
    }, error => {
      this.message.create('error', `错误`);
    });
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
    } = this.biddingForm.getRawValue();

    const newMarketBundles = [];
    marketBundles.forEach((marketBundle) => {
      const products = marketBundle.products;
      products.forEach((product) => {
        const item = { ...marketBundle, ...product, products: product.options };
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
      if (this.referenceId) {
        data.referenceId = this.referenceId;
      }
    }

    // 直投
    if (baseInfo.businessModel === BUSINESS_MODEL_DIRECT) {
      const nonStandard = {
        ...this.originData.nonStandard,
        ...logisticTerm,
        afterSaleTermsDesc,
        ...paymentTerm,
        specificationTermsDesc,
        legalTermsDesc,
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

  validateForm() {
    // 基础信息
    const basicInfo = this.biddingForm.get('basicInfo') as FormGroup
    const baseInfo = basicInfo.get('baseInfo') as FormGroup
    for(let i in baseInfo.controls) {
      baseInfo.controls[i].markAsDirty()
      baseInfo.controls[i].updateValueAndValidity()
    }
    const finalUser = basicInfo.get('finalUser') as FormGroup
    for(let i in finalUser.controls) {
      finalUser.controls[i].markAsDirty()
      finalUser.controls[i].updateValueAndValidity()
    }
    const applicant = basicInfo.get('applicant') as FormGroup
    for(let i in applicant.controls) {
      applicant.controls[i].markAsDirty()
      applicant.controls[i].updateValueAndValidity()
    }
    if (basicInfo.valid) {
      this.tabs.clearError('basic-info')
    } else {
      this.tabs.error('basic-info')
    }

    // 补充信息
    let supplementInfoValid = true
    const businessModel = baseInfo.get('businessModel').value
    const supplementInfo = this.biddingForm.get('supplementInfo') as FormGroup
    if (businessModel === BUSINESS_MODEL_DIRECT) {
      const biddingInfo = supplementInfo.get('biddingInfo') as FormGroup
      for(let i in biddingInfo.controls) {
        biddingInfo.controls[i].markAsDirty()
        biddingInfo.controls[i].updateValueAndValidity()
      }
      const biddingTerm = supplementInfo.get('biddingTerm') as FormGroup
      for(let i in biddingTerm.controls) {
        biddingTerm.controls[i].markAsDirty()
        biddingTerm.controls[i].updateValueAndValidity()
      }
      const biddingAmount = biddingTerm.get('biddingAmount') as FormGroup
      for(let i in biddingAmount.controls) {
        biddingAmount.controls[i].markAsDirty()
        biddingAmount.controls[i].updateValueAndValidity()
      }
      const logisticTerm = biddingTerm.get('logisticTerm') as FormGroup
      for(let i in logisticTerm.controls) {
        logisticTerm.controls[i].markAsDirty()
        logisticTerm.controls[i].updateValueAndValidity()
      }
      const paymentTerm = biddingTerm.get('paymentTerm') as FormGroup
      for(let i in paymentTerm.controls) {
        paymentTerm.controls[i].markAsDirty()
        paymentTerm.controls[i].updateValueAndValidity()
      }
      supplementInfoValid = biddingInfo.valid && biddingTerm.valid
    } else {
      const authorizationRequired = supplementInfo.get('indirectBiddingInfo').get('authorizationRequired') as FormControl
      authorizationRequired.markAsDirty()
      authorizationRequired.updateValueAndValidity()

      const biddingCompany = supplementInfo.get('biddingCompany') as FormGroup
      for(let i in biddingCompany.controls) {
        biddingCompany.controls[i].markAsDirty()
        biddingCompany.controls[i].updateValueAndValidity()
      }

      const dealerInfo = supplementInfo.get('dealerInfo') as FormGroup
      for(let i in dealerInfo.controls) {
        dealerInfo.controls[i].markAsDirty()
        dealerInfo.controls[i].updateValueAndValidity()
      }

      const subTiers = dealerInfo.get('subTiers') as FormArray
      if (subTiers.invalid) {
        this.modalService.error({
          nzTitle: '提示',
          nzContent: '经销商黑名单校验不通过，请上传必要的支持文件和备注后，再作提交'
        }).afterClose.subscribe(() => {
          this.handleToggleTab('supplement-info')
          setTimeout(() => {
            document.querySelector('.dealer-info').scrollIntoView()
          }, 0);
        })
      }

      const biddingFile = supplementInfo.get('biddingFile') as FormGroup
      for(let i in biddingFile.controls) {
        biddingFile.controls[i].markAsDirty()
        biddingFile.controls[i].updateValueAndValidity()
      }
      supplementInfoValid = !authorizationRequired.invalid && biddingCompany.valid && dealerInfo.valid && biddingFile.valid
    }

    if (supplementInfoValid) {
      this.tabs.clearError('supplement-info')
    } else {
      this.tabs.error('supplement-info')
    }

    return basicInfo.valid && supplementInfoValid
  }

  // 提交表单
  public onSubmit(): void {
    const dataSource = this.biddingForm.get('dataSource').value
    if (!dataSource) {
      this.message.error('请先导入Opportunity信息')
      return
    }
    const valid = this.validateForm()
    if (!valid) {
      this.message.error('请按要求填写表单信息')
      return
    }
    this.pageLoading = true;
    const data = this.getFormData();
    this.biddingV3Service.submit(data).subscribe(({ code, msg }) => {
      if (code === '0000') {
        this.message.success("提交成功");
        // this.router.navigate(["/ecos/my-started"]);
        this.routerExtend.back();
      } else {
        this.message.error(msg);
      }
      this.pageLoading = false;
    }, ({ message }) => {
      this.message.error(message);
      this.pageLoading = false;
    });
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
      simulationId: [null],
      modality: [null], // Modality
      bmc: [null], // 产品线
      configName: [null],
      createdDate: [null],
      productModel: [null], // 产品型号
      medicalDeviceName: [null], // 医疗器械名称
      marketBundleId: [null], // Market Bundle Id
      marketBundleName: [null], // Market Bundle Name
      quantity: [null], // 台数
      dtcDealerAgreement: [null], // DTC经销商协议
      dtcAuthorizedProduct: [null], // DTC经销商协议-授权产品
      dtcAuthorizedArea: [null], // DTC经销商协议-授权区域
      latestDealerAgreement: [null], // 最新经销商协议
      authorizedProduct: [null], // 授权产品
      authorizedArea: [null], // 授权区域
      options: this.fb.array([]), // CC Option列表
    });
  }

  createMarketBundle() {
    return this.fb.group({
      opportunityId: [null], // Opportunity Id
      dealFormId: [null], // Deal Form Id
      simulationId: [null], // Simulation Id
      opportunityHierachyLink: [null], // 商业层级关系链接
      products: this.fb.array([]), // 产品列表
      commercialProductName: [null]
    });
  }

  getAgreementList(dealerName) {
    const params = {
      dealerName,
      invalid: false
    }
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
      centralizedOrNot,
      cityName,
      opportunityId,
    } = data[0];

    setTimeout(() => {
      const validData = data.filter(({ subTierDealers }) => Array.isArray(subTierDealers))
      validData.forEach((item) => {
        this.subTierSubject.next({
          type: 'add',
          data: {
            crmOpId: item.opportunityId,
            dealerSubTiers: item.subTierDealers.map((dealer) => ({ ...dealer, crmOpId: item.opportunityId }))
          }
        })
      })
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

    const biddingNumber = this.biddingForm.get('basicInfo').get('baseInfo').get('biddingNumber').value

    this.biddingForm.patchValue({
      basicInfo: {
        baseInfo: {
          biddingProgramName: opportunityName,
          biddingNumber: tenderNo || biddingNumber,
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
          groupPurchase: !!centralizedOrNot, //true or false, 数据库存1或0
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

  // 处理首页导入的操作
  public handleImport() {
    this.activatedRouter.queryParams.subscribe((queryParams) => {
      let dealFormId = queryParams["_DEALFORMID"];
      let simulationId = queryParams["_SIMULATIONID"];
      if (simulationId) {
        this.handleImportBySimulationId(simulationId);
      } else if (dealFormId) {
        this.handleImportByDealFormId(dealFormId);
      }
    });
  }
  handleImportByDealFormId(dealFormId) {
    console.log("CP2 Import By DealForm ID");
    this.http
      .post("/act/ecos/bidding/apply/opportunity/dealForm", {
        dealFormId: dealFormId,
      })
      .subscribe(
        ({ code, msg, data }) => {
          if (code === "0000") {
            if (data) {
              let result = data.rows.filter((i) => i.dealFormId === dealFormId);
              if (result) {
                //  Handle Import
                this.onSelectOpp({
                  dataSource: "CP Deal Form",
                  data: result,
                });
              } else {
                this.message.create("error", "导入失败！");
              }
            } else {
              this.message.create("error", "导入失败！");
            }
          } else {
            this.message.create("error", msg);
          }
        },
        (err) => {
          this.message.create("error", err);
        }
      );
  }
  handleImportBySimulationId(simulationId) {
    this.http
      .post("/act/ecos/bidding/apply/opportunity/simulation", {
        simulationId: simulationId,
      })
      .subscribe(({ code, msg, data }) => {
        if (code === "0000") {
          if (data) {
            let result = data.rows.filter((i) => i.simulationId === simulationId);
            if (result) {
              this.onSelectOpp({
                dataSource: "CP Simulation",
                data:result
              });
              //  Handle Import
              // this.http
              //   .post("/act/ecos/bidding/apply/opportunity/simulation", {
              //     opportunityId: result.opportunityId,
              //   })
              //   .subscribe((res) => {
              //     if (res.code === "0000") {
              //       this.onSelectOpp({
              //         dataSource: "CP Simulation",
              //         data: res.data.rows,
              //       });
              //     } else {
              //       this.message.create("error", "导入失败！");
              //     }
              //   });
            } else {
              this.message.create("error", "导入失败！");
            }
          } else {
            this.message.create("error", "导入失败！");
          }
        } else {
          this.message.create("error", msg);
        }
      });
  }
}
