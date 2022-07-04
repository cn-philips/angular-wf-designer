import { Component, OnInit, ViewChild } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router'
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms'
import * as moment from 'moment'
import { NzMessageService } from 'ng-zorro-antd'

import { SpecialApprovalService } from '../special-approval.service'
import {
  LOADING_MESSAGE,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
  DEFAULT_ERROR_MESSAGE,
  BUSINESS_MODEL,
  APPLY_TYPE,
  APPLY_TYPE_MAP,
  PROCESS_STATUS,
} from '../special-approval.constants';
import { APPROVE_NODE_ACTION } from '../../DIIGT/change-scene/special-approval-setting/special-approval-setting.constants'
import { SelectApproverComponent } from './widgets/select-approver/select-approver.component';
import { RddOitOrderInfoComponent } from './widgets/order-info/rdd-oit/rdd-oit.component';
import { MachineComponent } from './widgets/order-info/machine/machine.component';
import { DeBookComponent } from './widgets/order-info/de-book/de-book.component';
import { LastbuyComponent } from './widgets/order-info/lastbuy/lastbuy.component'
import { CooUsOrderInfoComponent } from './widgets/order-info/coo-us/coo-us.component'
import { CooPdIgtOrderInfoComponent } from './widgets/order-info/coo-pdigt/coo-pdigt.component'
import { CooCcOrderInfoComponent } from './widgets/order-info/coo-cc/coo-cc.component'

enum TAB_TYPE {
  BASIC_INFO = 'basic-info',
  ORDER_INFO = 'order-info',
  WARRANTY_INFO = 'warranty-info',
  APPROVER_INFO = 'approver-info',
  CC_INFO = 'cc-info',
  FLOW_INFO = 'flow-info',
  APPROVE = 'approve',
  APPROVE_HISTORY = 'approve-history',
  FEEDBACK = 'feedback',
  EXCHANGE_INFO = 'exchange-info',
  DIFFERENCE_AND_COST_INFO = 'difference-and-cost-info',
  SUPPLEMENT_INFO = 'supplement-info',
}

@Component({
  selector: 'special-approval-request-form',
  templateUrl: './request-form.component.html',
  styleUrls: ['./request-form.component.scss']
})
export class RequestFormComponent implements OnInit {

  @ViewChild('selectApprover') public selectApprover: SelectApproverComponent;
  @ViewChild('rddOitOrderInfo') public rddOitOrderInfo: RddOitOrderInfoComponent;
  @ViewChild('machineExchange') public machineExchange: MachineComponent;
  @ViewChild('deBookOrderInfo') public deBookInfo: DeBookComponent;
  @ViewChild('cooUsOrderInfo') public cooUsOrderInfo: CooUsOrderInfoComponent;
  @ViewChild('cooPdIgtOrderInfo') public cooPdIgtOrderInfo: CooPdIgtOrderInfoComponent;
  @ViewChild('cooCcOrderInfo') public cooCcOrderInfo: CooCcOrderInfoComponent;

  @ViewChild('lastBuyOrderInfo') public lastBuyOrderInfo: LastbuyComponent;

  isSupplementNode = false

  public pageTitle: string;
  public requestId;
  public requestInfo = {
    orderInfos: [{} as any]
  };

  public APPLY_TYPE = APPLY_TYPE;

  public applyType: string;
  public applyItem: string;

  public submitLoading = false;
  public editable = true;

  public showSaveBtn = false; // 是否显示保存按钮, 申请状态是草稿, 并且登录用户是申请人或者新的申请单子
  public showDeleteBtn = false; // 是否显示删除按钮, 申请状态是草稿, 并且登录用户是申请人
  public showSubmitBtn = false; // 是否显示提交按钮, 申请状态是草稿、退回、撤回并且登录用户是申请人或者新的申请单子
  public showApproveTab = false;
  public showFeedbackTab = false;
  public showWithdrawBtn = false;
  public showCancelBtn = false;

  public processAdminList = [];
  public processExpertList = [];

  public supportFileList = [];

  public cancelOrderFileList = [];

  public userList = [];

  public taskId: string;

  public pageType: string;

  public approveNodeList = [];
  public approveHistory = [];

  public pageLoading = true;

  isApplicant = false

  districtLeader: string[] = []
  salesLeader: string[] = []

  saleRegions = []

  public processUsers: string[] = []; // 流程中所有的人
  public applicantEmail: string;
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private spService: SpecialApprovalService,
    private message: NzMessageService,
  ) {}

  public acitveTabId: string = TAB_TYPE.BASIC_INFO;

  public TAB_TYPES = TAB_TYPE;

  public executed = null;

  // 转库 form表单字段，单独提取出来
  private transferLibOrderInit = {
    orderType: [null, [Validators.required]], // 订单类型
    referenceId: [{ value: null, disabled: true }], // Reference Id
    cosMainId:[null], // cosMainId
    productType: [null], // 产品型号
    bmc: [null, [Validators.required]], // 产品线
    bg: [{ value: null, disabled: true }], // BG
    cycleGroup: [null], // 产品区域-小区
    bigArea: [null], // 产品区域-大区
    businessModel: [null, [Validators.required]], // 业务模式
    hospitalName: [{ value: null, disabled: true }], // 医院名称
    hospitalNo: [{ value: null, disabled: true }], // 医院编号
    projectName: [null, [Validators.required]], // 项目名称
    sapOrderNo: [null, [Validators.required]], // SAP订单号
    orderAmount: [null, [Validators.required]], // 合同金额-数额
    currency: [null, [Validators.required]], // 合同金额-货币
    expectedSaleDate: [null, [Validators.required]], // 预计记认销售日期
    expectedPaymentDate: [null, [Validators.required]], // 预计付款(或场地就位)日期
    om: [null], // OM
    exchangeRole: [{ value: null, disabled: true }, [Validators.required]], // 换货角色
    exchangeProcessing: [null], // 换货方式
    saleEmail: [null, [Validators.required]], // 销售邮箱
    districtLeader: [null, [Validators.required]], // District Leader邮箱
    salesLeader: [null, [Validators.required]], // sales Leader 邮箱
    productSalesMgr: [null], // product sales manager邮箱
    products: [[]],
    arrivalDate: [null, [Validators.required]], // 到货日期
    actualSaleDate: [{ value: null, disabled: true }], // 实际记认销售日期
  }

  //cancel order 订单信息字段单独配置
  public cancelOrderInit = {
    orderType: [null, [Validators.required]], // 订单类型
    referenceId: [null], // Reference Id
    cosMainId:[null], // cosMainId
    productType: [null ], // 产品型号
    bmc: [null, [Validators.required]], // 产品线
    bg: [{ value: null, disabled: true }, [Validators.required]], // BG
    cycleGroup: [null], // 产品区域-team
    bigArea: [null], // 产品区域-大区
    businessModel: [null, [Validators.required]], // 业务模式
    dealerName: [{ value: null, disabled: true }], // 经销商名称
    dealerCode: [{ value: null, disabled: true }], // 经销商编号
    hospitalName: [{ value: null, disabled: true }], // 医院名称
    hospitalNo: [{ value: null, disabled: true }], // 医院编号
    projectName: [null, [Validators.required]], // 项目名称
    sapOrderNo: [null, [Validators.required]], // SAP订单号
    orderAmount: [null, [Validators.required]], // 合同金额-数额
    currency: [null, [Validators.required]], // 合同金额-货币
    om: [null], // OM
    orderDate: [null, [Validators.required]], // 进单日期
    deBook: [null, [Validators.required]], // 是否De-book
    orderInfoStatus: this.fb.group({   // 订单状态信息
      id: [null],
      spApplyOrderId: [{ value: null, disabled: true }], // (关联的字段)
      startProduction: [{ value: null, disabled: true }], //是否开始生产 required
      orderCancelAmountProduction: [{ value: null, disabled: true }], // 订单取消的额外费用-生产
      shipped: [{ value: null, disabled: true }], // 是否已发货 required
      orderCancelAmountShipped: [{ value: null, disabled: true }], // 订单取消的额外费用-国际国内段运输仓储费用
      thirdPartyProcurement: [{ value: null, disabled: true }], // 是否有第三方采购 required
      orderCancelAmountPurchase: [{ value: null, disabled: true }], // 订单取消的额外费用-第三方采购
      seenSite: [{ value: null, disabled: true }], // 是否看过场地 required
      orderCancelAmountSite: [{ value: null, disabled: true }], // 订单取消的额外费用-场地相关
      advanceChargeStatus: [{ value: null, disabled: true }], // 预付款状态 required
      advanceChargeAmount: [{ value: null, disabled: true }], // 预付款金额
      orderActualAmount: [{ value: null, disabled: true }], // 订单实际发生费用
      refundAmount: [{ value: null, disabled: true }], // 退款金额
      remark: [{ value: null, disabled: true }], // 备注
      attachment: [[]], // 附件
      cancleOrderAttachment: [[]] // 附件List 显示
    })
  };

  // 补充信息节点form数据单独配置
  public supplementFormValues: FormGroup = this.fb.group({
    remark: [''], // 备注
    attachments: [[]], // 支持文件
    notify: [0], // 是否通知用户
    notifier: [null], // 通知用户邮箱列表, 字符串, 逗号隔开
    chatUsers: [[]],
  })

  //反馈节点tab数据配置
  public feedBackFormValues: FormGroup = this.fb.group({
    remark: [null], // 备注
    attachments: [[]], // 支持文件
    notify: [0], // 是否通知用户
    notifier: [null], // 通知用户邮箱列表, 字符串, 逗号隔开
  })

  // 订单替换form表单信息单独配置
  orderReplacementInit = {
    orderType: [null, [Validators.required]], // 订单类型
    referenceId: [null], // Reference Id
    cosMainId:[null], // cosMainId
    bmc: [null, [Validators.required]], // 产品线
    bg: [{ value: null, disabled: true }, [Validators.required]], // BG
    cycleGroup: [null, [Validators.required]], // 产品区域-team
    bigArea: [null, [Validators.required]], // 产品区域-大区
    projectName: [null, [Validators.required]], // 项目名称
    sapOrderNo: [null, [Validators.required]], // SAP订单号
    newSapOrderNo: [{ value: null, disabled: true }], // 新SAP订单号 适用于订单替换
    newSapCreateTime: [{ value: null, disabled: true }], // 新SAP订单号创建日期 适用于订单替换
    sapCreateTime: [null, [Validators.required]], //创建日期
  }

  public formValues = this.fb.group({
    basicInfo: this.fb.group({
      applyCode: [null],
      applicant: [{ value: null, disabled: true }], // 申请人邮箱
      applyType: [null, [Validators.required]], // 申请类型
      applyItem: [{ value: null, disabled: true }, [Validators.required]], // 申请原因
      applyItemDesc: [null], // 其他原因说明
      lastBuyPlan: [null], // Last Buy计划说明
      reason: [null, [Validators.required]], // 申请原因
      applyFileIds: [[]], // 申请附件
      systemRegion: [{ value: null, disabled: true }, [Validators.required]],
      bg: [null],
      cycleGroup: [null],
      bigArea: [null],
      smallArea: [null],
    }),
    orderInfo: this.fb.group({
      orderType: [null, [Validators.required]], // 订单类型
      referenceId: [null], // Reference Id
      cosMainId:[null], // cosMainId
      productType: [{ value: null, disabled: true }], // 产品型号
      bmc: [null, [Validators.required]], // 产品线
      bg: [{ value: null, disabled: true }, [Validators.required]], // BG
      cycleGroup: [null], // 产品区域-team
      bigArea: [null], // 产品区域-大区
      businessModel: [null, [Validators.required]], // 业务模式
      dealerName: [{ value: null, disabled: true }], // 经销商名称
      dealerCode: [{ value: null, disabled: true }], // 经销商编号
      hospitalName: [{ value: null, disabled: true }], // 医院名称
      hospitalNo: [{ value: null, disabled: true }], // 医院编号
      projectName: [null, [Validators.required]], // 项目名称
      sapOrderNo: [null, [Validators.required]], // SAP订单号
      orderAmount: [null, [Validators.required]], // 合同金额-数额
      currency: [null, [Validators.required]], // 合同金额-货币
      expectedSaleDate: [null, [Validators.required]], // 预计记认销售日期
      applyArrivalTime: [null, [Validators.required]], // 申请到货时间
      expectedPaymentDate: [null], // 预计付款日期
      expectedSitePlaceDate: [null], // 预计场地就位日期
      om: [null], // OM
      exchangeRole: [null], // 换货角色
      exchangeProcessing: [null], // 换货方式
      saleEmail: [null], // 销售邮箱
      districtLeader: [null], // District Leader邮箱
      salesLeader: [null], // sales Leader 邮箱
      productSalesMgr: [null], // product sales manager邮箱
      products: [[]],
      arrivalDate: [null], // 到货日期
      actualPaymentDate: [{ value: null, disabled: true }], // 实际付款日期（未付款）
      actualSitePlaceDate: [{ value: null, disabled: true }], // 实际场地就位日期（场地未好）
      actualSaleDate: [{ value: null, disabled: true }], // 实际记认销售日期
    }),
    rddOitOrderInfos: [[{ isMain: true }]],
    ccInfo: this.fb.group({
      ccType: [null], // 抄送类型
      ccPerson: [[]] // 抄送人
    }),
    lcAmendmentOrderInfo: this.fb.group({
      productType: [null], // 产品型号
      bmc: [null, [Validators.required]], // 产品线
      bg: [{ value: null, disabled: true }, [Validators.required]], // BG
      sapOrderNo: [null, [Validators.required]], // SAP订单号
      orderStatus: [null, [Validators.required]], // 订单状态
      lcInfo: this.fb.group({
        foreignCompanyId: [null], // 外贸公司
        foreignCompanyName: [null, [Validators.required]], // 外贸公司名称
        lcNo: [null, [Validators.required]], // L/C号码
        lcAmount: [null, [Validators.required]], // L/C金额
        nonStandardTerms: [null], // Non Standard Terms
        lcDiscrepancy: [null], // L/C discrepancy描述
        acceptLcDiscrepancy: [null], // 是否接受L/C discrepancy
        lcDiscrepancyPaymentMethod: [null], // L/C discrepancy费用支付方
        modifyEntry: [[]], // 修改条目
        modifyEntryDesc: [null], // 修改条目说明
        cancelReason: [[]], // 取消原因
        cancelReasonDesc: [null], // 取消原因说明
        newLcIssued: [null], // 新的L/C是否已经开具
      }),
    }),
    changeOrderInfos: this.fb.group({
      exchangeMethod: [null, [Validators.required]], // 换货方式
      orders: this.fb.array([
        this.fb.group({
          orderType: [null, [Validators.required]], // 订单类型
          referenceId: [null], // Reference Id
          cosMainId:[null], // cosMainId
          productType: [{ value: null, disabled: true }], // 产品型号
          bmc: [null, [Validators.required]], // 产品线
          bg: [{ value: null, disabled: true }, [Validators.required]], // BG
          cycleGroup: [null], // 产品区域-大区
          bigArea: [null], // 产品区域-小区
          businessModel: [null, [Validators.required]], // 业务模式
          dealerName: [{ value: null, disabled: true }], // 经销商名称
          dealerCode: [{ value: null, disabled: true }], // 经销商编号
          hospitalName: [{ value: null, disabled: true }], // 医院名称
          hospitalNo: [{ value: null, disabled: true }], // 医院编号
          projectName: [{ value: null, disabled: true }, [Validators.required]], // 项目名称
          sapOrderNo: [null, [Validators.required]], // SAP订单号
          currency: [null, [Validators.required]], // 合同金额-货币
          om: [null], // OM
          orderDate: [null, [Validators.required]], // 进单日期
          exchangeRole: [null, [Validators.required]], // 换货角色
          saleEmail: [{ value: null, disabled: true }, [Validators.required]], // 销售邮箱
          districtLeader: [{ value: null, disabled: true }], // District Leader邮箱
          salesLeader: [{ value: null, disabled: true }], // sales Leader 邮箱
          expectedSaleDate: [null, [Validators.required]], // 预计记认销售日期
          actualSaleDate: [{ value: null, disabled: true }], // 实际记认销售日期
          products: [[], [Validators.required]],
        }),
        this.fb.group({
          orderType: [null, [Validators.required]], // 订单类型
          referenceId: [null], // Reference Id
          cosMainId:[null], // cosMainId
          productType: [{ value: null, disabled: true }], // 产品型号
          bmc: [null, [Validators.required]], // 产品线
          bg: [{ value: null, disabled: true }, [Validators.required]], // BG
          cycleGroup: [null], // 产品区域-大区
          bigArea: [null], // 产品区域-小区
          businessModel: [null, [Validators.required]], // 业务模式
          dealerName: [{ value: null, disabled: true }], // 经销商名称
          dealerCode: [{ value: null, disabled: true }], // 经销商编号
          hospitalName: [{ value: null, disabled: true }], // 医院名称
          hospitalNo: [{ value: null, disabled: true }], // 医院编号
          projectName: [{ value: null, disabled: true }, [Validators.required]], // 项目名称
          sapOrderNo: [null, [Validators.required]], // SAP订单号
          currency: [null, [Validators.required]], // 合同金额-货币
          om: [null], // OM
          orderDate: [null, [Validators.required]], // 进单日期
          exchangeRole: [null, [Validators.required]], // 换货角色
          saleEmail: [null, [Validators.required]], // 销售邮箱
          districtLeader: [{ value: null, disabled: true }], // District Leader邮箱
          salesLeader: [{ value: null, disabled: true }], // sales Leader 邮箱
          expectedSaleDate: [null, [Validators.required]], // 预计记认销售日期
          products: [[], [Validators.required]],
        })
      ])
    }),
    exchangeInfo: this.fb.group({
      exchangeType: [{value: null, disabled: true}], // 换货类型
      exchangeMethod: [null], // 换货方式
      cost: [{value: null, disabled: true}],
      currency: [{value: null, disabled: true}]
    }),
    orderDifferences: this.fb.group({
      orderDifferences: [[]]
    }),
    transferLibOrders: this.fb.group({
      orders: this.fb.array([ // 转库订单详情
        this.fb.group({...this.transferLibOrderInit, applyId: null, id: null}),
        this.fb.group({...this.transferLibOrderInit, applyId: null, id: null})
      ])
    }),
    deBookOrderInfos: [[]],
    lastBuyInfos: [[]],
    cancelorderInfo: this.fb.group({...this.cancelOrderInit, applyId: null, id: null, isDeleted: 0}),
    orderReplacementInfo: this.fb.group({...this.orderReplacementInit, applyId: null, id: null}),
    noneDirectOrderInfo: this.fb.group({
      orderType: [null, [Validators.required]], // 订单类型
      referenceId: [null], // Reference Id
      cosMainId:[null], // cosMainId
      productType: [{ value: null, disabled: true }], // 产品型号
      bmc: [null, [Validators.required]], // 产品线
      bg: [{ value: null, disabled: true }, [Validators.required]], // BG
      cycleGroup: [null], // 产品区域-team
      bigArea: [null], // 产品区域-大区
      businessModel: [null, [Validators.required]], // 业务模式
      dealerName: [{ value: null, disabled: true }], // 经销商名称
      dealerCode: [{ value: null, disabled: true }], // 经销商编号
      hospitalName: [{ value: null, disabled: true }], // 医院名称
      hospitalNo: [{ value: null, disabled: true }], // 医院编号
      projectName: [null, [Validators.required]], // 项目名称
      sapOrderNo: [null, [Validators.required]], // SAP订单号
      orderAmount: [null, [Validators.required]], // 合同金额-数额
      currency: [null, [Validators.required]], // 合同金额-货币
      expectedSaleDate: [null,[Validators.required]], // 预计记认销售日期
      om: [null], // OM
      exchangeRole: [null], // 换货角色
      exchangeProcessing: [null], // 换货方式
      saleEmail: [null], // 销售邮箱
      districtLeader: [null], // District Leader邮箱
      salesLeader: [null], // sales Leader 邮箱
      productSalesMgr: [null], // product sales manager邮箱
      products: [[]],
      arrivalDate: [null], // 到货日期
      actualSaleDate: [{ value: null, disabled: true }], // 实际记认销售日期
    }),
  });

  initSaleRegions(role, isNewRequest = false) {
    const regions =
      (JSON.parse(window.localStorage.getItem('profiles')) || [])
        .filter(({ role: roleName }) => (role && role === roleName) || !role)
        .map((region) => ({
          ...region,
          label: [region.modality, region.cycleGroup, region.bigArea, region.smallArea].filter((str) => str && str.trim()).join('-'),
          value: [region.modality, region.cycleGroup, region.bigArea, region.smallArea].filter((str) => str && str.trim()).join('-'),
        }))
    this.saleRegions = regions
    if (isNewRequest && regions.length === 1) {
      const { modality, cycleGroup, bigArea, smallArea } = regions[0]
      this.basicInfo.patchValue({
        systemRegion: [modality, cycleGroup, bigArea, smallArea].filter((str) => str && str.trim()).join('-'),
        bg: modality,
        cycleGroup,
        bigArea,
        smallArea
      })
    }
  }

  initProductList(applyType) {
    if (
      applyType === APPLY_TYPE.PRODUCTION ||
      applyType === APPLY_TYPE.LOGISTICSCOST ||
      applyType === APPLY_TYPE.EXT_INSTALL_COST ||
      applyType === APPLY_TYPE.SPECIAL_DELIVERY
    ) {
      this.orderInfo.patchValue({
        products: [{}]
      })
    } else if (applyType === APPLY_TYPE.EXT_WARRANTY) {
      this.orderInfo.patchValue({
        products: [{ warranty: { stdWarrantyMonths: this.spService.standWarrantyMonth['PD&IGT'] } }]
      })
    } else if (applyType === APPLY_TYPE.MACHINE_EXCHANGE) {
      const orders = this.changeOrderInfos.get('orders') as FormArray
      orders.at(0).patchValue({ products: [{}] })
      orders.at(1).patchValue({ products: [{}] })
    } else if (applyType === APPLY_TYPE.TRANSFER_LIB) {
      const orders = this.transferLibInfos.get('orders') as FormArray
      orders.at(0).patchValue({ products: [{}] })
      orders.at(1).patchValue({ products: [{}] })
    }else if(applyType===APPLY_TYPE.NONE_DIRECT_ORDER){
      this.noneDirectOrderInfo.patchValue(
        {
          products: [{}]
        })
    }
  }

  public ngOnInit(): void {
    const { params: { requestId }, queryParams: { type, item, taskId, bg, role } } = this.route.snapshot;
    // detail page
    if (requestId) {
      this.taskId = taskId;
      this.requestId = requestId;
      this.getRequestDetail(requestId);
      this.initSaleRegions(role)
    } else {
      // new page
      this.basicInfo.patchValue({
        applicant: localStorage.getItem('ng_philips_code1'),
      });
      this.basicInfo.get('systemRegion').enable()
      this.showSubmitBtn = true;
      this.showSaveBtn = true;
      this.applicantEmail = localStorage.getItem('ng_philips_code1');
      if (!type || !APPLY_TYPE_MAP[type]) {
        this.navigateToHomePage();
        return;
      }
      if (item) {
        this.applyItem = item;
        this.basicInfo.patchValue({ applyItem: item });
      }
      this.applyType = type;

      switch (this.applyType) {
        case APPLY_TYPE.MACHINE_EXCHANGE:
          this.setMachineDefaultInfo()
      break;
      }

      this.basicInfo.patchValue({ applyType: type });

      this.setPageTitle({ applyType: type, applyItem: item });

      this.setProcessOwnerAdmin({ applyType: type})

      if (bg) {
        switch(type) {
          case APPLY_TYPE.MACHINE_EXCHANGE:
            let orders = this.changeOrderInfos.get('orders') as FormArray
            orders.at(0).patchValue({ bg: 'US' })
            orders.at(1).patchValue({ bg: 'US' })
            break
          case APPLY_TYPE.LC_AMENDMENT:
            this.lcAmendmentOrderInfo.patchValue({ bg });
            break
          case APPLY_TYPE.TRANSFER_LIB: // 给转库添加默认BG
            let transferOrder = this.transferLibInfos.get('orders') as FormArray
            transferOrder.controls.forEach((item, index) => {
              item.patchValue({
                bg
              })
            })
            break;
          case APPLY_TYPE.CANCEL_ORDER: //cancel order 默认BG
            this.cancelorderInfo.patchValue({ bg });
            break
          case APPLY_TYPE.ORDER_REPLACEMENT: //订单替换 默认BG
            this.orderReplacementInfo.patchValue({ bg });
            break
          case APPLY_TYPE.NONE_DIRECT_ORDER: //非直销订单
            this.noneDirectOrderInfo.patchValue({bg});
            break
          default:
            this.orderInfo.patchValue({ bg });
        }
        if (bg === 'PD&IGT') {
          this.initProductList(type)
        }
      }
      this.pageLoading = false;
      this.setFormValidators(type, item, bg);
      this.initSaleRegions(role, true)
    }
  }

  /*
  * @description: 公共判断表单方法
  * @params {FormGroup} formGroupItem: 表单对象
  * */
  checkForm(formGroupItem : FormGroup) {
    for (const i in formGroupItem.controls) {
      formGroupItem.controls[i].markAsDirty();
      formGroupItem.controls[i].updateValueAndValidity();
    }
  }

  public setPageTitle({ applyType = '', applyItem = '' }, isNew = true) {
    let title = ''
    if (applyType && APPLY_TYPE_MAP[applyType]) {
      const { label: applyTypeName } = APPLY_TYPE_MAP[applyType]
      const applyItems = this.spService.getApplyItems(applyType)
      title += applyTypeName
      const item = applyItems.find(({ value }) => value == applyItem);
      if (item && item.label) {
        title += `-${item.label}`
        this.pageType = item.label
      }
    }

    this.pageTitle =  isNew ? `新建特批-${title}` : title
  }

  public setProcessOwnerAdmin({ applyType = ''}) {
    if (applyType ) {
      let processOwnerAdmin = this.spService.getProcessOwnerAdmin(applyType);
      let processOwner = [{name: null, email: null}];
      let processAdmin = [{name: null, email: null}];
      processOwner = processOwnerAdmin.processOwner;
      processAdmin = processOwnerAdmin.processAdmin;
      if (processAdmin && processAdmin.length > 0) {
        this.processAdminList = processAdmin.map(({ email }) =>  email );
      }
      if (processOwner && processOwner.length > 0) {
        this.processExpertList = processOwner.map(({ email }) =>  email )
      }
    }
  }

  get orderInfo(): FormGroup {
    return this.formValues.get('orderInfo') as FormGroup;
  }

  get basicInfo(): FormGroup {
    return this.formValues.get('basicInfo') as FormGroup;
  }

  get ccInfo(): FormGroup {
    return this.formValues.get('ccInfo') as FormGroup;
  }

  get rddOitOrderInfos(): FormGroup {
    return this.formValues.get('rddOitOrderInfos') as FormGroup
  }

  get changeOrderInfos(): FormGroup {
    return this.formValues.get('changeOrderInfos') as FormGroup
  }

  get lcAmendmentOrderInfo(): FormGroup {
    return this.formValues.get('lcAmendmentOrderInfo') as FormGroup
  }

  get exchangeInfo(): FormGroup {
    return this.formValues.get('exchangeInfo') as FormGroup
  }

  get orderDifferencesInfo(): FormGroup {
    return this.formValues.get('orderDifferences') as FormGroup
  }

  get transferLibInfos() :FormGroup {
    return this.formValues.get('transferLibOrders') as FormGroup
  }

  get cancelorderInfo() : FormGroup {
    return this.formValues.get('cancelorderInfo') as FormGroup
  }

  get noneDirectOrderInfo() : FormGroup {
    return this.formValues.get('noneDirectOrderInfo') as FormGroup
  }

  get deBookOrderInfos(): FormGroup {
    return this.formValues.get('deBookOrderInfos') as FormGroup
  }

  get orderReplacementInfo(): FormGroup {
    return this.formValues.get('orderReplacementInfo') as FormGroup
  }

  get lastBuyInfos(): FormGroup {
    return this.formValues.get('lastBuyInfos') as FormGroup
  }

  public setFormValidators(type, item, bg) {
    let clearedFields
    switch(type) {
      case APPLY_TYPE.EXT_WARRANTY:
        clearedFields = ['applyArrivalTime', 'expectedPaymentDate']
        if (bg === 'CC') {
          clearedFields.push('expectedSaleDate')
        }
        clearedFields.forEach((fieldName) => this.orderInfo.controls[fieldName].clearValidators())
        if (item === 'sp_warranty_apply_item_5') {
          this.basicInfo.controls.applyItemDesc.setValidators([Validators.required]);
        }
        break
      case APPLY_TYPE.LC_AMENDMENT:
        if (item === 'sp_lcamendment_apply_item_5') {
          this.basicInfo.controls.applyItemDesc.setValidators([Validators.required]);
        }
        break
      case APPLY_TYPE.EXT_INSTALL_COST:
        clearedFields = ['expectedPaymentDate', 'applyArrivalTime', 'expectedSaleDate']
        clearedFields.forEach((fieldName) => this.orderInfo.controls[fieldName].clearValidators())
        break
      case APPLY_TYPE.LOGISTICSCOST:
        clearedFields = ['expectedPaymentDate', 'applyArrivalTime', 'expectedSaleDate']
        clearedFields.forEach((fieldName) => this.orderInfo.controls[fieldName].clearValidators())
        break
      case APPLY_TYPE.PRE_BOOK_LASTBUY:
        this.basicInfo.controls.lastBuyPlan.setValidators([Validators.required]);
        break
      case APPLY_TYPE.CANCEL_ORDER:
        if (bg == 'CC') {
          //销售区域和OM非必填
          clearedFields = ['productType'];
          clearedFields.forEach((fieldName) => this.cancelorderInfo.controls[fieldName].clearValidators());
        } else {
          this.cancelorderInfo.controls.productType.setValidators([Validators.required]);
        }
        if (bg == 'PD&IGT') {
          this.cancelorderInfo.controls.referenceId.disable();
        } else {
          this.cancelorderInfo.controls.projectName.disable();
        }
        break
      case APPLY_TYPE.ORDER_REPLACEMENT:
        if (bg == 'PD&IGT') {
          this.orderReplacementInfo.controls.referenceId.disable();
        }
        if (item === 'sp_orderreplacement_apply_item_5') {
          this.basicInfo.controls.applyItemDesc.setValidators([Validators.required]);
        }
        break
      case APPLY_TYPE.PRODUCTION:
        if (item === 'sp_production_apply_item_1') {
          this.orderInfo.get('expectedPaymentDate').setValidators(Validators.required)
        } else if (item === 'sp_production_apply_item_2') {
          this.orderInfo.get('expectedSitePlaceDate').setValidators(Validators.required)
        }
        break
      case APPLY_TYPE.SPECIAL_DELIVERY:
        if (item === 'sp_delivery_apply_item_1') {
          this.orderInfo.get('expectedPaymentDate').setValidators(Validators.required)
        } else if (item === 'sp_delivery_apply_item_2') {
          this.orderInfo.get('expectedSitePlaceDate').setValidators(Validators.required)
        }
        break
    }

    if (bg === 'PD&IGT') {
      this.orderInfo.controls.referenceId.disable();
      if (type !== APPLY_TYPE.LC_AMENDMENT && type !== APPLY_TYPE.TRANSFER_LIB) {
        this.orderInfo.controls.productType.disable();
      }
    } else {
      this.orderInfo.controls.projectName.disable();
    }
  }

  public getFormData() {
    const { basicInfo, orderInfo, ccInfo, rddOitOrderInfos, changeOrderInfos, lcAmendmentOrderInfo, transferLibOrders, exchangeInfo, orderDifferences, cancelorderInfo, deBookOrderInfos, orderReplacementInfo, noneDirectOrderInfo, lastBuyInfos  } = this.formValues.getRawValue()
    const { applyArrivalTime, expectedPaymentDate, expectedSitePlaceDate, expectedSaleDate, products } = orderInfo
    const extInfo = {
      exchangeMethod: changeOrderInfos.exchangeMethod
    }
    const data = {
      ...this.requestInfo,
      ...basicInfo,
      applyFileIds: basicInfo.applyFileIds.map(({ fileId }) => fileId),
      ...ccInfo,
      ccPerson: ccInfo.ccPerson.join(','),
      extInfo,
    };
    switch(this.applyType) {
      case APPLY_TYPE.PRODUCTION: // 特批生产
        data.orderInfos = [
          {
            ...this.requestInfo.orderInfos[0],
            ...orderInfo,
            applyArrivalTime: applyArrivalTime ? moment(applyArrivalTime).format('YYYY-MM-DD') : null,
            expectedPaymentDate: expectedPaymentDate ? moment(expectedPaymentDate).format('YYYY-MM-DD') : null,
            expectedSitePlaceDate: expectedSitePlaceDate ? moment(expectedSitePlaceDate).format('YYYY-MM-DD') : null,
            expectedSaleDate: expectedSaleDate ? moment(expectedSaleDate).format('YYYY-MM-DD') : null,
            products: products.map(({ productType, wbsNo, itemNo, quantity }) => ({ productType, wbsNo, itemNo, quantity }))
          }
        ];
        break;
      case APPLY_TYPE.EXT_WARRANTY: // 免费延长保修
        data.orderInfos = [
          {
            ...this.requestInfo.orderInfos[0],
            ...orderInfo,
            expectedSaleDate: expectedSaleDate ? moment(expectedSaleDate).format('YYYY-MM-DD') : null,
            products: products.map((product) => ({
              ...product,
              warranty: {
                ...product.warranty,
                applyStdWarrantyEnddate: moment(product.warranty.applyStdWarrantyEnddate).format('YYYY-MM-DD'),
                expectedStdWarrantyStartdate: moment(product.warranty.expectedStdWarrantyStartdate).format('YYYY-MM-DD'),
                applyExtWarrantyMonths: Number(product.warranty.applyExtWarrantyMonths),
              }
            }))
          }
        ];
        break;
      case APPLY_TYPE.LC_AMENDMENT:  // LC_AMENDMENT申请
        let originOrderInfo = this.requestInfo.orderInfos[0] as any
        const { lcInfo: { modifyEntry, cancelReason } } = lcAmendmentOrderInfo
        data.orderInfos = [
          {
            ...originOrderInfo,
            ...lcAmendmentOrderInfo,
            productType: Array.isArray(lcAmendmentOrderInfo.productType) ? lcAmendmentOrderInfo.productType.join(',') : lcAmendmentOrderInfo.productType,
            lcInfo: {
              ...originOrderInfo.lcInfo, ...lcAmendmentOrderInfo.lcInfo,
              modifyEntry: modifyEntry ? modifyEntry.join(',') : null,
              cancelReason: cancelReason ? cancelReason.join(',') : null,
            },
          },
        ];
        break;
      case APPLY_TYPE.LOGISTICSCOST:
        data.orderInfos = [
          {
            ...this.requestInfo.orderInfos[0],
            ...orderInfo,
            applyArrivalTime: applyArrivalTime ? moment(applyArrivalTime).format('YYYY-MM-DD') : null,
            expectedPaymentDate: expectedPaymentDate ? moment(expectedPaymentDate).format('YYYY-MM-DD') : null,
            expectedSaleDate: expectedSaleDate ? moment(expectedSaleDate).format('YYYY-MM-DD') : null,
            products: products.map(({ productType, wbsNo, itemNo, quantity }) => ({ productType, wbsNo, itemNo, quantity }))
          }
        ];
        break;
      case APPLY_TYPE.MACHINE_EXCHANGE:
        data.orderInfos = [
          {
            transferCargo: 'sp_machineexchange_order_type_item_1',
            ...this.requestInfo.orderInfos[0],
            ...changeOrderInfos.orders.at(0),
            expectedSaleDate: changeOrderInfos.orders.at(0).expectedSaleDate ? moment(changeOrderInfos.orders.at(0).expectedSaleDate).format('YYYY-MM-DD') : null,
            products: changeOrderInfos.orders.at(0).products.map(({ productType, wbsNo, itemNo, quantity, equipmentSn, logisticsStatus }) => ({ productType, wbsNo, itemNo, quantity, equipmentSn, logisticsStatus }))
          },
          {
            transferCargo: 'sp_machineexchange_order_type_item_2',
            ...this.requestInfo.orderInfos[1],
            ...changeOrderInfos.orders.at(1),
            expectedSaleDate: changeOrderInfos.orders.at(1).expectedSaleDate ? moment(changeOrderInfos.orders.at(1).expectedSaleDate).format('YYYY-MM-DD') : null,
            products: changeOrderInfos.orders.at(1).products.map(({ productType, wbsNo, itemNo, quantity, equipmentSn, logisticsStatus }) => ({ productType, wbsNo, itemNo, quantity, equipmentSn, logisticsStatus }))
          }
        ]
        break;
      case APPLY_TYPE.EXT_INSTALL_COST: // Additional cost
        data.orderInfos = [
          {
            ...this.requestInfo.orderInfos[0],
            ...orderInfo,
            applyArrivalTime: applyArrivalTime ? moment(applyArrivalTime).format('YYYY-MM-DD') : null,
            expectedPaymentDate: expectedPaymentDate ? moment(expectedPaymentDate).format('YYYY-MM-DD') : null,
            expectedSaleDate: expectedSaleDate ? moment(expectedSaleDate).format('YYYY-MM-DD') : null,
            products: products.map(({ productType, wbsNo, itemNo, quantity }) => ({ productType, wbsNo, itemNo, quantity }))
          }
        ];
        break;
      case APPLY_TYPE.TRANSFER_LIB: // Additional cost
        data.orderInfos = [
          {
            ...transferLibOrders.orders.at(0),
            transferCargo: 'sp_transferlib_order_type_item_1'
          },
          {
            ...transferLibOrders.orders.at(1),
            transferCargo: 'sp_transferlib_order_type_item_2'
          }
        ]
        this.requestInfo.orderInfos.forEach((order) => {
          if (order.transferCargo === 'sp_transferlib_order_type_item_1') {
            data.orderInfos[0] = {
              ...order,
              ...data.orderInfos[0]
            }
          } else if (order.transferCargo === 'sp_transferlib_order_type_item_2') {
            data.orderInfos[1] = {
              ...order,
              ...data.orderInfos[1]
            }
          }
        })
        data.extInfo = {
          ...exchangeInfo
        }
        data.orderDifferences = orderDifferences.orderDifferences
        break;
      case APPLY_TYPE.RDD_OIT:
        // 合并product
        data.orderInfos = []
        let order: any = null
        rddOitOrderInfos.forEach((rddOitOrderInfo) => {
          const {
            // orderInfo
            applyArrivalTime, expectedPaymentDate, expectedSaleDate, orderDate,
            // productInfo
            deliveryDelayReason, exchangeableHospitalName, exchangeableHospitalNo, exchangeableOrder, exchangeableOrderModel,
            exchangeableOrderSale, exchangeableOrderSaleBigArea, exchangeableOrderSaleCycleGroup, exchangeableOrderSaleDate, exchangeableSoNo,
            exchangeableWbsNo, newRdd, originalRdd, subProductType, wbsNo,
            isMain,
          } = rddOitOrderInfo
          const product = {
            deliveryDelayReason, exchangeableHospitalName, exchangeableHospitalNo, exchangeableOrder, exchangeableOrderModel,
            exchangeableOrderSale, exchangeableOrderSaleBigArea, exchangeableOrderSaleCycleGroup,
            exchangeableOrderSaleDate: exchangeableOrderSaleDate ? moment(exchangeableOrderSaleDate).format('YYYY-MM-DD') : null,
            originalRdd: originalRdd ? moment(originalRdd).format('YYYY-MM-DD') : null,
            newRdd: newRdd ? moment(newRdd).format('YYYY-MM-DD') : null,
            exchangeableSoNo, exchangeableWbsNo, productType: subProductType, wbsNo,
          }
          if (isMain) {
            if (order) {
              data.orderInfos.push(order)
            }
            order = {
              ...rddOitOrderInfo,
              applyArrivalTime: applyArrivalTime ? moment(applyArrivalTime).format('YYYY-MM-DD') : null,
              expectedPaymentDate: expectedPaymentDate ? moment(expectedPaymentDate).format('YYYY-MM-DD') : null,
              expectedSaleDate: expectedSaleDate ? moment(expectedSaleDate).format('YYYY-MM-DD') : null,
              orderDate: orderDate ? moment(orderDate).format('YYYY-MM-DD') : null,
              products: [product]
            }
          } else {
            order.products.push(product)
          }
        })
        if (order) { data.orderInfos.push(order) }
        break;
      case APPLY_TYPE.CANCEL_ORDER: //cancel order
        data.orderInfos = [
          {
            ...cancelorderInfo,
            productType: Array.isArray(cancelorderInfo.productType) ? cancelorderInfo.productType.join(',') : cancelorderInfo.productType,
            orderInfoStatus: {
              ...cancelorderInfo.orderInfoStatus,
              attachment: cancelorderInfo.orderInfoStatus.attachment || []
            }
          }
        ];
        break;
      case APPLY_TYPE.SPECIAL_DELIVERY: // 特批发货
        data.orderInfos = [
          {
            ...this.requestInfo.orderInfos[0],
            ...orderInfo,
            applyArrivalTime: applyArrivalTime ? moment(applyArrivalTime).format('YYYY-MM-DD') : null,
            expectedPaymentDate: expectedPaymentDate ? moment(expectedPaymentDate).format('YYYY-MM-DD') : null,
            expectedSitePlaceDate: expectedSitePlaceDate ? moment(expectedSitePlaceDate).format('YYYY-MM-DD') : null,
            expectedSaleDate: expectedSaleDate ? moment(expectedSaleDate).format('YYYY-MM-DD') : null,
            products: products.map(({ productType, wbsNo, itemNo, quantity }) => ({ productType, wbsNo, itemNo, quantity }))
          }
        ];
        break;
      case APPLY_TYPE.NONE_DIRECT_ORDER:   //非直销订单
        data.orderInfos=
          [{
            ...this.requestInfo.orderInfos[0],
            ...noneDirectOrderInfo,
            expectedSaleDate: noneDirectOrderInfo.expectedSaleDate ? moment(noneDirectOrderInfo.expectedSaleDate).format('YYYY-MM-DD') : null,
            products: noneDirectOrderInfo.products.map(({ productType, wbsNo, itemNo, equipmentSn, quantity }) => ({ productType, wbsNo, itemNo, equipmentSn, quantity }))
          }]
        ;
        break;

      case APPLY_TYPE.DE_BOOK:
        data.orderInfos = []
        let saps = []
        deBookOrderInfos.forEach((debookOrderInfo) => {
          const {
            productType, bg, bmc, cycleGroup, bigArea, businessModel, productType1,
            hospitalName, hospitalNo, sapOrderNo, wbsNo, orderDate, orderAmount, currency, deBookReason, remark
          } = debookOrderInfo;
          if (!debookOrderInfo.productType) {
            debookOrderInfo.productType = productType1
          }
          const product = {
            productType: productType1,
            wbsNo: wbsNo,
            deBookReason,
            remark,
            orderDate
          }
          const order = {
            ...debookOrderInfo,
            products: []
          }
          if (!saps.includes(sapOrderNo)) {
            saps.push(sapOrderNo)
            order.products.push(product)
            data.orderInfos.push(order)
          } else {
          const debookorder = data.orderInfos.filter(value => value.sapOrderNo === sapOrderNo)
            debookorder[0].products.push(product)
          }
        })
        break
      case APPLY_TYPE.ORDER_REPLACEMENT: // 订单替换
        data.orderInfos = [
          {
            ...orderReplacementInfo,
          }
        ];
        break
      case APPLY_TYPE.COO_US:
        const { cooInfo, orderInfos } = this.cooUsOrderInfo.getData()
        data.cooInfo = cooInfo
        data.orderInfos = orderInfos
        break
      case APPLY_TYPE.COO_PDIGT:
        const cooPdIgtData = this.cooPdIgtOrderInfo.getData()
        data.cooInfo = cooPdIgtData.cooInfo
        data.orderInfos = cooPdIgtData.orderInfos
        break
      case APPLY_TYPE.COO_CC:
        const cooCcData = this.cooCcOrderInfo.getData()
        data.cooInfo = cooCcData.cooInfo
        data.orderInfos = cooCcData.orderInfos
        break
      case APPLY_TYPE.PRE_BOOK_LASTBUY:
        data.orderInfos = []
        let lastBuySaps = []
        lastBuyInfos.forEach(lastBuyInfo => {
          const { productType, quantity, sapOrderNo } = lastBuyInfo
              const lastBuyProduct = {
                  productType: productType,
                  quantity: quantity
              }

              const lastBuyOrder = {
                ...lastBuyInfo,
                products: []
              }
          if (!lastBuySaps.includes(sapOrderNo)) {
            lastBuySaps.push(sapOrderNo)
            lastBuyOrder.products.push(lastBuyProduct)
            data.orderInfos.push(lastBuyOrder)
          } else {
            const lastbuyorder = data.orderInfos.filter(value => value.sapOrderNo === sapOrderNo)
            lastbuyorder[0].products.push(lastBuyProduct)
          }
        })
        break
      default:
        break
    }
    return data;
  }

  // 设置页面是否可编辑, 满足以下情况可编辑
  // 1. 登录用户是申请人
  // 2. 申请状态是草稿、已拒绝(退回)、已撤销
  public setEditable(status, processStatus) {
    const editable = this.isApplicant && [PROCESS_STATUS.DRAFT, PROCESS_STATUS.REJECTED, PROCESS_STATUS.WITHDRAW].includes(processStatus) && status === 1;
    if (!editable) {
      // 设置表单字段disabled
      this.formValues.controls.basicInfo.disable();
      this.formValues.controls.orderInfo.disable();
      this.formValues.controls.ccInfo.disable();
      this.formValues.controls.lcAmendmentOrderInfo.disable();
      this.lcAmendmentOrderInfo.get('lcInfo').disable()
      this.formValues.controls.changeOrderInfos.disable()
      this.formValues.controls.noneDirectOrderInfo.disable();
      //添加转库disabled
      this.formValues.controls.exchangeInfo.disable()
      this.formValues.controls.orderDifferences.disable()
      this.formValues.controls.transferLibOrders.disable()
      // 添加cancel order disabbled
      this.formValues.controls.cancelorderInfo.disable()
      // 添加订单替换 orderReplacement disabbled
      this.formValues.controls.orderReplacementInfo.disable()
    }
    this.editable = editable;
  }

  setLcAmendmentOrderInfoFormValidators(orderInfo) {
    const lcInfo = this.lcAmendmentOrderInfo.get('lcInfo') as FormGroup
    const lcInfoControls = lcInfo.controls
    lcInfoControls.nonStandardTerms.clearValidators()
    lcInfoControls.lcDiscrepancy.clearValidators()
    lcInfoControls.acceptLcDiscrepancy.clearValidators()
    lcInfoControls.lcDiscrepancyPaymentMethod.clearValidators()
    lcInfoControls.modifyEntry.clearValidators()
    lcInfoControls.modifyEntryDesc.clearValidators()
    lcInfoControls.cancelReason.clearValidators()
    lcInfoControls.cancelReasonDesc.clearValidators()
    lcInfoControls.newLcIssued.clearValidators()
    const { applyItem } = this.basicInfo.getRawValue()
    const { lcInfo: { acceptLcDiscrepancy, modifyEntry, cancelReason } } = orderInfo
    switch(applyItem) {
      case 'sp_lcamendment_apply_item_1':
        lcInfoControls.nonStandardTerms.setValidators([Validators.required])
        break
      case 'sp_lcamendment_apply_item_2':
        lcInfoControls.lcDiscrepancy.setValidators([Validators.required])
        lcInfoControls.acceptLcDiscrepancy.setValidators([Validators.required])
        if (acceptLcDiscrepancy === 1) {
          lcInfoControls.lcDiscrepancyPaymentMethod.setValidators([Validators.required])
        }
        break
      case 'sp_lcamendment_apply_item_3':
        lcInfoControls.modifyEntry.setValidators([Validators.required])
        if (modifyEntry.indexOf('sp_lc_other_modify') > -1) {
          lcInfoControls.modifyEntryDesc.setValidators([Validators.required])
        }
        break
      case 'sp_lcamendment_apply_item_4':
        lcInfoControls.cancelReason.setValidators([Validators.required])
        lcInfoControls.newLcIssued.setValidators([Validators.required])
        if (cancelReason.indexOf('sp_lc_other_cancel') > -1) {
          lcInfoControls.cancelReasonDesc.setValidators([Validators.required])
        }
        break
    }
  }

  public async onSubmit() {
    for (const i in this.basicInfo.controls) {
      this.basicInfo.controls[i].markAsDirty();
      this.basicInfo.controls[i].updateValueAndValidity();
    }
    const data = this.getFormData()
    const { ccType, ccPerson, orderInfos } = data
    const { businessModel, hospitalNo, dealerCode } = orderInfos[0]
    let hasError = false
    switch(this.applyType) {
      case APPLY_TYPE.RDD_OIT:
        if (!this.rddOitOrderInfo.isTableValid()) {
          this.message.error('请按要求填写订单信息')
          return
        } else {
          hasError = this.basicInfo.invalid
        }
        break
      case APPLY_TYPE.MACHINE_EXCHANGE:
        const orders = this.changeOrderInfos.get('orders') as FormArray
        const product0 = orders.at(0).get('products')
        const product1 = orders.at(1).get('products')

        if (product0.value[0].logisticsStatus !== 1 && product1.value[0].logisticsStatus !== 1){
          this.message.error('请至少提交一条已到货产品')
          return
        }
        if ((product0.value[0].logisticsStatus === 0 || product0.value[0].logisticsStatus === 1) && !product0.value[0].equipmentSn) {
          this.message.error('请按要求填写设备SN')
          return
        }
        if ((product1.value[0].logisticsStatus === 0 || product1.value[0].logisticsStatus === 1) && !product1.value[0].equipmentSn) {
          this.message.error('请按要求填写设备SN')
          return
        }
        if (!orderInfos[0].hospitalName || !orderInfos[1].hospitalName) {
          this.message.error('请选择医院再提交')
          return
        }

        const check = this.checkMachineExchange();
        if (!check){
          return
        }
        hasError = this.basicInfo.invalid || this.changeOrderInfos.invalid
        break
      case APPLY_TYPE.LC_AMENDMENT:
        this.setLcAmendmentOrderInfoFormValidators(orderInfos[0])
        const lcInfo = this.lcAmendmentOrderInfo.get('lcInfo') as FormGroup
        for (const i in this.lcAmendmentOrderInfo.controls) {
          this.lcAmendmentOrderInfo.controls[i].markAsDirty();
          this.lcAmendmentOrderInfo.controls[i].updateValueAndValidity();
        }
        for (const i in lcInfo.controls) {
          lcInfo.controls[i].markAsDirty();
          lcInfo.controls[i].updateValueAndValidity();
        }
        hasError = this.basicInfo.invalid || this.lcAmendmentOrderInfo.invalid
        break
      case APPLY_TYPE.TRANSFER_LIB:
        const transferLibOrder = this.transferLibInfos.get('orders') as FormArray
        let formValidError = false
        if (transferLibOrder.at(0).get('bmc').value !== transferLibOrder.at(1).get('bmc').value) {
          this.message.error('转入转出bmc不一致，请重新选择')
          return
        }
        if (!transferLibOrder.at(0).get('hospitalName').value || !transferLibOrder.at(1).get('hospitalName').value) {
          this.message.error('请选择医院再提交')
          return
        }
        transferLibOrder.controls.forEach((item, index) => {
          let formGroupItem = item as FormGroup
          this.checkForm(formGroupItem)
          if (formGroupItem.invalid) {
            formValidError = true
          }
        })
        const difference = this.orderDifferencesInfo.get('orderDifferences').value
        if (!difference || difference.length === 0){
          this.message.error('请填写差异信息')
          return
        } else {
          for (let i = 0; i < difference.length; i++) {
            if (!difference[i].configDetail || !difference[i].transferOut || !difference[i].transferIn || !difference[i].handlePlan || difference[i].cost == null) {
              this.message.error('请完整填写差异信息')
              return
            }
          }
        }
        console.log(difference)
        // for (let i = 0; i < difference.length; i++) {
        //   if (difference[i].)
        // }
        hasError = this.basicInfo.invalid || formValidError
        break
      case APPLY_TYPE.DE_BOOK:
        hasError = this.deBookInfo.isTableValid();
        if (hasError) {
          return
        } else {
          hasError = this.basicInfo.invalid
        }
        break
      case APPLY_TYPE.CANCEL_ORDER:
        for (const i in this.cancelorderInfo.controls) {
          this.cancelorderInfo.controls[i].markAsDirty();
          this.cancelorderInfo.controls[i].updateValueAndValidity();
        }
        const orderInfoStatus =  this.cancelorderInfo.get('orderInfoStatus') as FormGroup;
        for (const i in orderInfoStatus.controls) {
          orderInfoStatus.controls[i].markAsDirty();
          orderInfoStatus.controls[i].updateValueAndValidity();
        }
        // 医院和经销商必填一项
        if (businessModel === BUSINESS_MODEL.DISTRIBUTOR_DEAL) {
          if (!hospitalNo && !dealerCode) {
            this.message.error('请选择医院或者经销商')
            return
          }
        } else if(!hospitalNo){
          this.message.error('请选择医院')
          return
        }
        hasError = this.basicInfo.invalid || this.cancelorderInfo.invalid;
        break
      case APPLY_TYPE.ORDER_REPLACEMENT: //订单替换
        for (const i in this.orderReplacementInfo.controls) {
          this.orderReplacementInfo.controls[i].markAsDirty();
          this.orderReplacementInfo.controls[i].updateValueAndValidity();
        }
        hasError = this.basicInfo.invalid || this.orderReplacementInfo.invalid
        break
      case APPLY_TYPE.COO_US:
        const isValid = this.cooUsOrderInfo.validate()
        hasError = this.basicInfo.invalid || !isValid
        break
      case APPLY_TYPE.PRE_BOOK_LASTBUY:
        if (this.lastBuyOrderInfo.isTableValid()) {
          return
        } else {
          hasError = this.basicInfo.invalid
        }
        break
      case APPLY_TYPE.NONE_DIRECT_ORDER: //非直销
        for (const i in this.noneDirectOrderInfo.controls) {
          this.noneDirectOrderInfo.controls[i].markAsDirty();
          this.noneDirectOrderInfo.controls[i].updateValueAndValidity();
        }
        if (businessModel === BUSINESS_MODEL.DISTRIBUTOR_DEAL) {
          if (!hospitalNo && !dealerCode) {
            this.message.error('请选择医院或者经销商')
            return
          }
        } else if(!hospitalNo){
          this.message.error('请选择医院')
          return
        }
        hasError = this.basicInfo.invalid || this.noneDirectOrderInfo.invalid
        break
      case APPLY_TYPE.COO_PDIGT:
        const isCooPdIgtValid = this.cooPdIgtOrderInfo.validate()
        hasError = this.basicInfo.invalid || !isCooPdIgtValid
        break
      case APPLY_TYPE.COO_CC:
        const isCooCcValid = this.cooCcOrderInfo.validate()
        hasError = this.basicInfo.invalid || !isCooCcValid
        break
      default:
        for (const i in this.orderInfo.controls) {
          this.orderInfo.controls[i].markAsDirty();
          this.orderInfo.controls[i].updateValueAndValidity();
        }
        // 医院和经销商必填一项
        // const { businessModel, hospitalNo, dealerCode } = orderInfos[0]
        if (businessModel === BUSINESS_MODEL.DISTRIBUTOR_DEAL) {
          if (!hospitalNo && !dealerCode) {
            this.message.error('请选择医院或者经销商')
            return
          }
        } else if(!hospitalNo){
          this.message.error('请选择医院')
          return
        }
        hasError = this.basicInfo.invalid || this.orderInfo.invalid
        break
    }

    if (this.applyType === APPLY_TYPE.EXT_WARRANTY) {
      if (orderInfos[0] && orderInfos[0].products && orderInfos[0].products.length === 0) {
        this.message.error('请填写延保信息');
        return
      } else {
        let hasError = false
        let errorMsg = ''
        orderInfos[0].products.forEach(({ warranty: { applyExtWarrantyMonths } }) => {
          if (!applyExtWarrantyMonths) {
            hasError = true
            errorMsg = '请填补充完整延保信息'
          } else if (Number(applyExtWarrantyMonths) <= 0) {
            hasError = true
            errorMsg = '申请延保月数必须大于0'
          }
        })
        if (hasError) {
          this.message.error(errorMsg);
          return
        }
      }
    }
    // 抄送人和抄送节点必须同时选择或者同时不选择
    if (ccType && !ccPerson) {
      this.message.error('请选择抄送人');
      return;
    } else if (!ccType && ccPerson) {
      this.message.error('请选择抄送节点');
      return;
    }

    if (hasError) {
      this.message.error('请按要求填写表单信息');
      return;
    }
    if (!this.verifyProduct()) {
      return;
    }
    this.selectApprover.showModal(data);
  }

  public async onSaveDraft() {
    const id = this.message.loading(LOADING_MESSAGE.SAVE_DRAFT, { nzDuration: 0 }).messageId;

    try {
      this.submitLoading = true;
      const data = this.getFormData();

      if (!data.systemRegion) {
        this.message.error('请选择系统区域配置!')
        return
      }
      if (this.applyType === APPLY_TYPE.MACHINE_EXCHANGE) {
        if (data.extInfo.exchangeMethod == null || data.extInfo.exchangeMethod == ''){
          this.message.error('请填写换货方式后再保存')
          return
        }
      }
      await this.spService.saveRequest(data);
      this.message.success(SUCCESS_MESSAGE.SAVE_DRAFT);
      this.navigateToHomePage();
    } catch ({ message }) {
      if (this.applyType === APPLY_TYPE.MACHINE_EXCHANGE) {
        this.message.error(`保存失败, ${message}`);
      } else {
        this.message.error(ERROR_MESSAGE.SAVE_DRAFT);
      }
      console.error(`保存失败, ${message}`);
    } finally {
      this.submitLoading = false;
      this.message.remove(id);
    }
  }

  //补充信息，反馈节点保存
  public async onApproveSave() {
    const id = this.message.loading(LOADING_MESSAGE.SAVE_DRAFT, { nzDuration: 0 }).messageId;
    try {
      this.submitLoading = true;
      const formData = this.getFormData();
      const { remark, attachments, notify, notifier } = this.supplementFormValues.getRawValue()
      // supplementFormValues
      const data = {
        applyId: this.requestId,
        attachments: attachments,
        notify,
        notifier: notify ? notifier.join(','): '',
        remark,
        taskInstId: this.taskId,
        applyInfos: formData,
      }
      await this.spService.approveSubmitRequest(data);
      this.message.success(SUCCESS_MESSAGE.SAVE_DRAFT);
      this.navigateToHomePage();
    } catch ({ message }) {
      this.message.error(ERROR_MESSAGE.SAVE_DRAFT);
      console.error(`保存失败, ${message}`);
    } finally {
      this.submitLoading = false;
      this.message.remove(id);
    }
  }

  //补充信息审批操作
  public async onApproveSubmit(action: string){
    let hasError  = false;
    //判断 拒绝还是通过 action === 'REJECTED'
    if (action != 'REJECTED') {
      //数据校验,检查补充信息必填字段
      hasError  = this.checkRequiredFormValidators();
    }
    if(!hasError) {
      try {
        const { remark, attachments, notify, notifier } = this.supplementFormValues.getRawValue()
        const id = this.message.loading(LOADING_MESSAGE.APPROVE, { nzDuration: 0 }).messageId
        this.submitLoading = true;
        const formData = this.getFormData();
        const data = {
          applyId: this.requestId,
          attachments: attachments,
          result: action,
          notify,
          notifier: notify ? notifier.join(','): '',
          remark,
          taskInstId: this.taskId,
          applyInfos: formData,
        }
        await this.spService.approveRequest(data);
        this.message.remove(id)
        this.message.success(SUCCESS_MESSAGE.APPROVE)
        this.router.navigate(['/special-approval/home'])
      } catch ({ message }) {
        this.message.error(ERROR_MESSAGE.APPROVE)
        console.error(`审批失败, ${message}`);
      } finally {
        this.submitLoading = false
      }
    } else {
      return;
    }
  }

  //反馈节点审批
  public async onFeedBackSubmit(action: number) {
    //数据校验,检查反馈节点信息必填字段
    let hasError  = this.checkRequiredFormValidators(action);
    if(!hasError) {
      try {
        const { remark, attachments, notify, notifier } = this.feedBackFormValues.getRawValue();
        const formData = this.getFormData();
        const data = {
          applyId: this.requestId,
          attachments: attachments,
          executed: action,
          notify,
          notifier: notify ? notifier.join(','): '',
          remark,
          taskInstId: this.taskId,
          result: 'APPROVED',
          applyInfos: formData,
        }
        const id = this.message.loading(LOADING_MESSAGE.FEEDBACK, { nzDuration: 0 }).messageId
        this.submitLoading = true
        await this.spService.approveRequest(data)
        this.message.remove(id)
        this.message.success(SUCCESS_MESSAGE.FEEDBACK)
        this.router.navigate(['/special-approval/home'])
      } catch ({ message }) {
        this.message.error(ERROR_MESSAGE.FEEDBACK)
        console.error(`反馈失败, ${message}`);
      } finally {
        this.submitLoading = false
      }
    }
  }

  //验证补充信息、反馈 等节点提交时的必填字段
  public checkRequiredFormValidators(feedbackAction = null){
    let hasError = false;
    if (this.isSupplementNode) { //补充信息
      switch(this.applyType) {
        case APPLY_TYPE.CANCEL_ORDER:  //cancel order 补充信息必填
          const orderInfoStatus =  this.cancelorderInfo.get('orderInfoStatus') as FormGroup;
          for (const i in orderInfoStatus.controls) {
            orderInfoStatus.controls[i].markAsDirty();
            orderInfoStatus.controls[i].updateValueAndValidity();
          }
          hasError =  this.cancelorderInfo.invalid;
          break
        case APPLY_TYPE.PRE_BOOK_LASTBUY:  //cancel order 补充信息必填
          for (let i = 0; i < this.lastBuyInfos.value.length; i++) {
            if (!this.lastBuyInfos.value[i].actualOitDate || !this.lastBuyInfos.value[i].warehouseArrangement) {
              hasError = true
              return
            }
          }
          break
        case APPLY_TYPE.COO_US:
          hasError = !this.cooUsOrderInfo.validate()
          break
        case APPLY_TYPE.COO_PDIGT:
          hasError = !this.cooPdIgtOrderInfo.validate()
          break
        case APPLY_TYPE.COO_CC:
          hasError = !this.cooCcOrderInfo.validate()
          break
        default:
          break
      }

    } else if(this.showFeedbackTab) { //反馈
      switch(this.applyType) {
        case APPLY_TYPE.PRODUCTION: // 特批开始生产
          for (const i in this.orderInfo.controls) {
            this.orderInfo.controls[i].markAsDirty();
            this.orderInfo.controls[i].updateValueAndValidity();
          }
          hasError = this.orderInfo.invalid;
          break
        case APPLY_TYPE.EXT_WARRANTY: // 免费延长保修
          for (const i in this.orderInfo.controls) {
            this.orderInfo.controls[i].markAsDirty();
            this.orderInfo.controls[i].updateValueAndValidity();
          }
          hasError = this.orderInfo.invalid;
          break
        case APPLY_TYPE.MACHINE_EXCHANGE:  // 机器互换
          const orders = this.changeOrderInfos.get('orders') as FormArray
          orders.at(0).get('actualSaleDate').markAsDirty();
          orders.at(0).get('actualSaleDate').updateValueAndValidity();
          hasError =  orders.at(0).get('actualSaleDate').invalid;
          break
        case APPLY_TYPE.TRANSFER_LIB:  //转库
          const transferLibOrder = this.transferLibInfos.get('orders') as FormArray
          transferLibOrder.at(1).get('actualSaleDate').markAsDirty();
          transferLibOrder.at(1).get('actualSaleDate').updateValueAndValidity();
          hasError =  transferLibOrder.at(1).get('actualSaleDate').invalid;
          break
        case APPLY_TYPE.SPECIAL_DELIVERY: // 特批发货
          for (const i in this.orderInfo.controls) {
            this.orderInfo.controls[i].markAsDirty();
            this.orderInfo.controls[i].updateValueAndValidity();
          }
          hasError = this.orderInfo.invalid;
          break
        case APPLY_TYPE.NONE_DIRECT_ORDER: // 非直销订单按直销方式确认收入
          for (const i in this.noneDirectOrderInfo.controls) {
            this.noneDirectOrderInfo.controls[i].markAsDirty();
            this.noneDirectOrderInfo.controls[i].updateValueAndValidity();
          }
          hasError = this.noneDirectOrderInfo.invalid;
          break
        case APPLY_TYPE.ORDER_REPLACEMENT:  //订单替换必填字段验证
          const orderReplacementInfo =  this.orderReplacementInfo as FormGroup;
          for (const i in orderReplacementInfo.controls) {
            orderReplacementInfo.controls[i].markAsDirty();
            orderReplacementInfo.controls[i].updateValueAndValidity();
          }
          hasError =  this.orderReplacementInfo.invalid;
          break
        case APPLY_TYPE.COO_US:
          hasError = !this.cooUsOrderInfo.validate(feedbackAction)
          break
        case APPLY_TYPE.COO_PDIGT:
          hasError = !this.cooPdIgtOrderInfo.validate()
          break
        case APPLY_TYPE.COO_CC:
          hasError = !this.cooCcOrderInfo.validate()
          break
        default:
          break
      }
    }
    if (hasError) {
      this.message.error('请按要求填写表单信息');
    }
    return hasError;
  }


  public async getRequestDetail(requestId) {
    try {
      this.pageLoading = true
      const data = await this.spService.getRequestDetail(requestId)
      this.requestInfo = data
      const {
        createUser, applicant,
        status, applyCode, applyType, applyItem,
        applyItemDesc, executed, processStatus,
        reason, ccType, ccPerson, orderInfos, attachments,
        taskList, nodeInfoList, nodeCode, nodeAction,
        extInfo, orderDifferences,
        bg, cycleGroup, bigArea, smallArea, isDeleted, lastBuyPlan,
      } = data
      this.setPageTitle({ applyType, applyItem }, false)
      this.setProcessOwnerAdmin({ applyType});
      this.applyItem = applyItem
      this.applyType = applyType
      this.executed = executed
      this.formValues.patchValue({
        basicInfo: {
          applyCode,
          applicant,
          applyType,
          applyItem,
          applyItemDesc,
          systemRegion: (bg && cycleGroup) ? [bg, cycleGroup, bigArea, smallArea].filter((str) => str && str.trim()).join('-') : null,
          bg, cycleGroup, bigArea, smallArea,
          reason,
          applyFileIds: attachments,
          lastBuyPlan
        },
        ccInfo: {
          ccType,
          ccPerson: ccPerson ? ccPerson.split(',') : [],
        },
      })
      this.requestInfo.orderInfos = orderInfos
      if (applyType === APPLY_TYPE.PRODUCTION || applyType === APPLY_TYPE.EXT_WARRANTY || applyType === APPLY_TYPE.LOGISTICSCOST || applyType === APPLY_TYPE.EXT_INSTALL_COST || applyType === APPLY_TYPE.SPECIAL_DELIVERY) {
        this.formValues.patchValue({
          orderInfo: {
            ...orderInfos[0],
            products: orderInfos[0].products || []
          }
        });
        this.setFormValidators(applyType, applyItem, orderInfos[0].bg)
      } else if (applyType === APPLY_TYPE.LC_AMENDMENT) {
        const orderInfo = orderInfos[0]
        const { lcInfo: { cancelReason, modifyEntry } } = orderInfo
        const cancelReasons = cancelReason ? cancelReason.split(',') : null
        const modifyEntries = modifyEntry ? modifyEntry.split(',') : null
        if (Array.isArray(cancelReasons) && cancelReasons.includes('sp_lc_other_cancel')) {
          this.lcAmendmentOrderInfo.get('lcInfo').get('cancelReasonDesc').setValidators(Validators.required)
        }
        if (Array.isArray(modifyEntries) && modifyEntries.includes('sp_lc_other_modify')) {
          this.lcAmendmentOrderInfo.get('lcInfo').get('modifyEntryDesc').setValidators(Validators.required)
        }
        this.formValues.patchValue({
          lcAmendmentOrderInfo: {
            ...orderInfo,
            lcInfo: {
              ...orderInfo.lcInfo,
              cancelReason: cancelReasons,
              modifyEntry: modifyEntries,
            },
            productType: (orderInfo.bg === 'US' && orderInfo.productType) ? orderInfo.productType.split(',') : orderInfo.productType
          }
        });
        this.setFormValidators(applyType, applyItem, orderInfos[0].bg)
      } else if (applyType === APPLY_TYPE.RDD_OIT) {
        this.formValues.patchValue({
          rddOitOrderInfos: orderInfos.reduce((calc, cur) => {
            const { products } = cur
            products.forEach((product, index) => {
              product = {
                ...product,
                ...cur,
                subProductType: product.productType
              }
              if (index === 0) {
                product.isMain = true
              }
              calc.push(product)
            })
            return calc
          }, [])
        })
      } else if(applyType === APPLY_TYPE.MACHINE_EXCHANGE) {
        this.districtLeader[0] = orderInfos[0].districtLeader
        this.salesLeader[0] = orderInfos[0].salesLeader
        this.districtLeader[1] = orderInfos[1].districtLeader
        this.salesLeader[1] = orderInfos[1].salesLeader
        let orders0 = null
        let orders1 = null
        if (orderInfos[0].transferCargo === 'sp_machineexchange_order_type_item_1') {
          orders0 = orderInfos[0]
          orders1 = orderInfos[1]
        } else {
          orders0 = orderInfos[1]
          orders1 = orderInfos[0]
        }
        this.formValues.patchValue({
          changeOrderInfos: {
            exchangeMethod: extInfo ? extInfo.exchangeMethod : null,
            orders: [
              {
                ...orders0,
                products: orders0.products || []
              },
              {
                ...orders1,
                products: orders1.products || []
              }
            ]
          }
        })
        this.setFormValidators(applyType, applyItem, orderInfos[0].bg)
      } else if(applyType === APPLY_TYPE.TRANSFER_LIB) { // 设置查看详情时代入数据
        let order0 = null
        let order1 = null
        if (orderInfos[0].transferCargo === 'sp_transferlib_order_type_item_1') {
          order0 = orderInfos[0]
          order1 = orderInfos[1]
        } else {
          order0 = orderInfos[1]
          order1 = orderInfos[0]
        }

        this.formValues.patchValue({
          transferLibOrders: {
            orders: [
              {
                ...order0,
                products: orderInfos[0].products || [],
              },
              {
                ...order1,
                products: orderInfos[1].products || []
              }
            ]
          },
          exchangeInfo: {
            ...extInfo
          },
          orderDifferences: {
            orderDifferences: orderDifferences
          }
        })
        this.setFormValidators(applyType, applyItem, orderInfos[0].bg)
      } else if(applyType === APPLY_TYPE.CANCEL_ORDER) {
        //初始化文件列表
        const attachmentList = orderInfos[0].orderInfoStatus.cancleOrderAttachment || [];
        this.cancelOrderFileList = attachmentList.map(({ fileId, name, size, type }) => ({
          uid: fileId,
          fileId,
          name,
          size,
          type,
          filename: name,
          response: { fileId }
        }));
        const fileIdList = attachmentList.map(({ fileId }) => (fileId));
        this.formValues.patchValue({
          cancelorderInfo: {
            ...orderInfos[0],
            productType: (orderInfos[0].bg === 'US' && orderInfos[0].productType) ? orderInfos[0].productType.split(',') : orderInfos[0].productType,
            orderInfoStatus: {
              ...orderInfos[0].orderInfoStatus,
              attachment: fileIdList || []
            }
          }
        });
        this.setFormValidators(applyType, applyItem, orderInfos[0].bg)
      } else if (applyType === APPLY_TYPE.DE_BOOK) {
        let debooks = []
        orderInfos.map( (order) => {
          order.products.map( ({ wbsNo, productType, deBookReason, remark, orderDate }) => {
              debooks.push({
                ...order,
                wbsNo: wbsNo,
                productType1: productType,
                deBookReason: deBookReason,
                remark: remark,
                orderDate: orderDate
              })
          })
        })
        this.formValues.patchValue({
            deBookOrderInfos:[
              ...debooks
            ]
        })
        console.log(this.deBookOrderInfos.value)
      } else if (applyType === APPLY_TYPE.ORDER_REPLACEMENT) {
        this.formValues.patchValue({
          orderReplacementInfo: {
            ...orderInfos[0],
          }
        });
        this.setFormValidators(applyType, applyItem, orderInfos[0].bg)
      } else if (applyType === APPLY_TYPE.COO_US) {
         const intervalId = setInterval(() => {
          if(this.cooUsOrderInfo) {
            this.cooUsOrderInfo.initData(data)
            clearInterval(intervalId)
          }
        }, 1000)
      } else if (applyType === APPLY_TYPE.COO_PDIGT) {
        const intervalId = setInterval(() => {
          if(this.cooPdIgtOrderInfo) {
            this.cooPdIgtOrderInfo.initData(data)
            clearInterval(intervalId)
          }
        }, 1000)
      } else if (applyType === APPLY_TYPE.COO_CC) {
        const intervalId = setInterval(() => {
          if(this.cooCcOrderInfo) {
            this.cooCcOrderInfo.initData(data)
            clearInterval(intervalId)
          }
        }, 1000)
      } else if (this.applyType === APPLY_TYPE.PRE_BOOK_LASTBUY) {
        let lastBuys = []
        orderInfos.map( (order) => {
          if (order.stockingAgreementFile && order.stockingAgreementFile.length > 0) {
            order.stockingAgreementFileList = order.stockingAgreementFile.map(({ fileId, name, size, type }) => ({
              uid: fileId,
              fileId,
              name,
              size,
              type,
              filename: name,
              response: { fileId }
            }))
          }
          order.products.map( ({ quantity, productType, }) => {
            lastBuys.push({
              ...order,
              quantity: quantity,
              productType: productType
            })
          })
        })
        this.formValues.patchValue({
          lastBuyInfos:[
            ...lastBuys
          ]
        })
      }else if(this.applyType === APPLY_TYPE.NONE_DIRECT_ORDER){
        this.formValues.patchValue({
          noneDirectOrderInfo: {
            ...orderInfos[0],
            products: orderInfos[0].products || []
          }
        })

      }

      const userSet = new Set<string>();
      nodeInfoList.forEach(({ approverList }) => approverList.forEach(({ user }) => {
        if (!userSet.has(user)) {
          userSet.add(user);
          this.processUsers.push(user);
        }
      }));
      this.applicantEmail = createUser;
      this.supportFileList = attachments.map(({ fileId, name, size, type }) => ({
        uid: fileId,
        fileId,
        name,
        size,
        type,
        filename: name,
        response: { fileId }
      }));

      this.userList = ccPerson ? ccPerson.split(',').map(email => ({ email })) : [];

      this.isApplicant = applicant === localStorage.getItem('ng_philips_code1');

      const isDraft = processStatus === PROCESS_STATUS.DRAFT && this.isApplicant;
      if (isDraft) {
        this.showSubmitBtn = true;
        this.showSaveBtn = true;
        this.showDeleteBtn = true;
      }

      if ([PROCESS_STATUS.REJECTED, PROCESS_STATUS.WITHDRAW].includes(processStatus) && this.isApplicant && status !== 0) {
        this.showSubmitBtn = true;
        this.showCancelBtn = true;
      }

      // this.showApproveTab = nodeAction !== NODE_ACTION.FEEDBACK && !!this.taskId && nodeInfoList.find(({ code, action, approverList }) => {
      //   if (code === nodeCode && action === nodeAction) {
      //     return approverList.find(({ user }) => user === localStorage.getItem('ng_philips_code1'));
      //   } else {
      //     return false;
      //   }
      // });
      if (!!this.taskId) {
        switch(nodeAction) {
          case APPROVE_NODE_ACTION.SUPPLEMENT:
            this.isSupplementNode = true;
            break
          case APPROVE_NODE_ACTION.FEEDBACK:
            this.showFeedbackTab = true
            break
          default:
            this.showApproveTab = true
        }
      }

      this.showWithdrawBtn = processStatus === PROCESS_STATUS.START && this.isApplicant && nodeAction !== APPROVE_NODE_ACTION.FEEDBACK;
      this.approveNodeList = nodeInfoList;
      this.approveHistory = taskList;
      this.setEditable(status, processStatus);
    } catch ({ message }) {
      this.message.error(DEFAULT_ERROR_MESSAGE);
      console.error(`初始化失败, ${message}`);
    } finally {
      this.pageLoading = false;
    }
  }

  public async onDeleteRequest() {
    const id = this.message.loading(LOADING_MESSAGE.DELETE_DRAFT, { nzDuration: 0 }).messageId;
    try {
      this.submitLoading = true;
      await this.spService.deleteRequest(this.requestId);
      this.message.success(SUCCESS_MESSAGE.DELETE_DRAFT);
      this.navigateToHomePage();
    } catch ({ message }) {
      this.message.error(ERROR_MESSAGE.DELETE_DRAFT);
      console.error(`删除失败, ${message}`);
    } finally {
      this.submitLoading = false;
      this.message.remove(id);
    }
  }

  // 取消申请
  public async onCancelRequest() {
    const id = this.message.loading(LOADING_MESSAGE.CANCEL_REQUEST, { nzDuration: 0 }).messageId;
    try {
      this.submitLoading = true;
      await this.spService.cancelRequest(this.requestId);
      this.message.success(SUCCESS_MESSAGE.CANCEL_REQUEST);
      this.navigateToHomePage();
    } catch ({ message }) {
      this.message.error(ERROR_MESSAGE.CANCEL_REQUEST);
      console.error(`取消失败, ${message}`);
    } finally {
      this.submitLoading = false;
      this.message.remove(id);
    }
  }

  // 撤回申请
  public async onWithdrawRequest() {
    const id = this.message.loading(LOADING_MESSAGE.WITHDRAW_REQUEST, { nzDuration: 0 }).messageId;
    try {
      this.submitLoading = true;
      await this.spService.withdrawRequest(this.requestId);
      this.message.success(SUCCESS_MESSAGE.WITHDRAW_REQUEST);
      this.navigateToHomePage();
    } catch ({ message }) {
      this.message.error(ERROR_MESSAGE.WITHDRAW_REQUEST);
      console.error(`撤回失败, ${message}`);
    } finally {
      this.submitLoading = false;
      this.message.remove(id);
    }
  }

  public navigateToHomePage() {
    this.router.navigate(['/special-approval/home']);
  }

  checkMachineExchange(){
    this.changeOrderInfos.get('exchangeMethod').markAsDirty()
    this.changeOrderInfos.get('exchangeMethod').updateValueAndValidity()
    const orders = this.changeOrderInfos.get('orders') as FormArray
    const order1 = orders.at(0) as FormGroup
    const order2 = orders.at(1) as FormGroup
    for (const i in order1.controls) {
      order1.controls[i].markAsDirty();
      order1.controls[i].updateValueAndValidity();
    }
    for (const i in order2.controls) {
      order2.controls[i].markAsDirty();
      order2.controls[i].updateValueAndValidity();
    }
    const product1 = order1.get('products').value[0]
    const product2 = order2.get('products').value[0]
    if (
      ((product1.itemNo == null || product1.itemNo == '') && order1.get('bg').value !== 'CC') ||
      product1.logisticsStatus == null ||
      product1.productType == null ||
      product1.quantity == null || product1.quantity == '' ||
      ((product1.wbsNo == null || product1.wbsNo == '') && order1.get('bg').value !== 'CC')
    ){
        this.message.error('订单1: 产品信息未填写完整')
      return false;
    }else if (product1.logisticsStatus == 1) {
      if (product1.equipmentSn == '' || product1.equipmentSn == null){
        this.message.error('订单1: 产品状态为到货时需要填写设备SN！')
        return false
      }
    }

    if (
      ((product2.itemNo == null || product2.itemNo == '') && order2.get('bg').value !== 'CC') ||
      product2.logisticsStatus == null ||
      product2.productType == null ||
      product2.quantity == null || product2.quantity == '' ||
      ((product2.wbsNo == null || product2.wbsNo == '') && order2.get('bg').value !== 'CC')
    ){
      this.message.error('订单2: 产品信息未填写完整')
      return false;
    }else if (product2.logisticsStatus == 1) {
      if (product2.equipmentSn == '' || product2.equipmentSn == null){
        this.message.error('订单2: 产品状态为到货时需要填写设备SN！')
        return false
      }
    }


    return true
  }

  // 校验产品列表
  // 特批开始生产、飞利浦承担额外清关、仓储、物流费用、特批发货、用户自定义审批  验证产品列表不能为空
  public verifyProduct() {
    if (
      this.applyType === APPLY_TYPE.PRODUCTION ||
      this.applyType === APPLY_TYPE.EXT_INSTALL_COST ||
      this.applyType === APPLY_TYPE.LOGISTICSCOST ||
      this.applyType === APPLY_TYPE.SPECIAL_DELIVERY ||
      this.applyType === APPLY_TYPE.EXT_WARRANTY
    ) {
      const errorMsg = this.applyType === APPLY_TYPE.EXT_WARRANTY ? '请完善延保信息' : '请完善产品列表信息'
      const orderInfo = this.formValues.getRawValue().orderInfo;
      if (orderInfo && orderInfo.bg && orderInfo.bg.toLowerCase() === 'cc') {
        return true;
      }
      if (orderInfo && orderInfo.products && orderInfo.products.length > 0) {
        for (let i = 0; i < orderInfo.products.length; i++) {
          if (this.isEmpty(orderInfo.products[i].productType) || this.isEmpty(orderInfo.products[i].wbsNo) || this.isEmpty(orderInfo.products[i].itemNo) || this.isEmpty(orderInfo.products[i].quantity)) {
            this.message.error(errorMsg);
            return false;
          }
        }
      } else {
        this.message.error(errorMsg);
        return false;
      }
    } else if (this.applyType === APPLY_TYPE.NONE_DIRECT_ORDER){    //非直销订单 验证产品列表不能为空
      const orderInfo = this.formValues.getRawValue().noneDirectOrderInfo;
      if (orderInfo && orderInfo.bg && orderInfo.bg.toLowerCase() === 'cc') {
        return true;
      }
      if (orderInfo && orderInfo.products && orderInfo.products.length > 0) {
        for (let i = 0; i < orderInfo.products.length; i++) {
          if (this.isEmpty(orderInfo.products[i].productType) || this.isEmpty(orderInfo.products[i].wbsNo) || this.isEmpty(orderInfo.products[i].itemNo) || this.isEmpty(orderInfo.products[i].quantity)) {
            this.message.error('请完善产品列表信息');
            return false;
          }
        }
      }
      else {
        this.message.error('请完善产品列表信息');
        return false;
      }
    }
    return true;
  }
  public isEmpty(e) {
    return e === '' || e === null || e === undefined;
  }

  public setMachineDefaultInfo() {
    if (this.editable) {
      const orders = this.changeOrderInfos.get('orders') as FormArray
      orders.at(0).patchValue({
        saleEmail: localStorage.getItem('ng_philips_code1')
      })
      this.changeOrderInfos.patchValue({
        exchangeMethod: '互换',
        orders: [
          {
            exchangeRole: '互换'
          },
          {
            exchangeRole: '互换'
          }]
      })
    }
  }

  onItemChange(val: string) {
    if (this.editable) {
      if (this.requestId) {
        this.setPageTitle({ applyType: this.applyType, applyItem: val },false)
      } else {
        this.setPageTitle({ applyType: this.applyType, applyItem: val })
      }
    }
  }
}
