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
  NODE_ACTION,
  PROCESS_STATUS,
} from '../special-approval.constants';
import { SelectApproverComponent } from './widgets/select-approver/select-approver.component';

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
  DIFFERENCE_AND_COST_INFO = 'difference-and-cost-info'
}

@Component({
  selector: 'special-approval-request-form',
  templateUrl: './request-form.component.html',
  styleUrls: ['./request-form.component.scss']
})
export class RequestFormComponent implements OnInit {

  @ViewChild('selectApprover') public selectApprover: SelectApproverComponent;

  public pageTitle: string;
  public requestId;
  public requestInfo = {
    orderInfos: [{}]
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

  public supportFileList = [];

  public userList = [];

  public taskId: string;

  public approveNodeList = [];
  public approveHistory = [];

  public pageLoading = true;

  isApplicant = false

  districtLeader: string[] = []
  salesLeader: string[] = []

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
    referenceId: [null, [Validators.required]], // Reference Id
    productType: [null], // 产品型号
    bmc: [null, [Validators.required]], // 产品线
    bg: [{ value: null, disabled: true }], // BG
    bigArea: [null, [Validators.required]], // 产品区域-大区
    smallArea: [null, [Validators.required]], // 产品区域-小区
    businessModel: [null, [Validators.required]], // 业务模式
    hospitalName: [{ value: null, disabled: true }], // 医院名称
    hospitalNo: [{ value: null, disabled: true }], // 医院编号
    projectName: [null, [Validators.required]], // 项目名称
    sapOrderNo: [null, [Validators.required]], // SAP订单号
    orderAmount: [null, [Validators.required]], // 合同金额-数额
    currency: [null, [Validators.required]], // 合同金额-货币
    expectedSaleDate: [null, [Validators.required]], // 预计记认销售日期
    expectedPaymentDate: [null, [Validators.required]], // 预计付款(或场地就位)日期
    om: [null, [Validators.required]], // OM
    exchangeRole: [{ value: null, disabled: true }, [Validators.required]], // 换货角色
    exchangeProcessing: [null], // 换货方式
    saleEmail: [null, [Validators.required]], // 销售邮箱
    districtLeader: [null, [Validators.required]], // District Leader邮箱
    salesLeader: [null, [Validators.required]], // sales Leader 邮箱
    productSalesMgr: [null], // product sales manager邮箱
    products: [[]],
    arrivalDate: [null, [Validators.required]], // 到货日期
  }
  public formValues = this.fb.group({
    basicInfo: this.fb.group({
      applyCode: [null],
      applicant: [null], // 申请人邮箱
      applicantName: [{ value: null, disabled: true }, [Validators.required]], // 申请人
      applyType: [null, [Validators.required]], // 申请类型
      applyItem: [{ value: null, disabled: true }, [Validators.required]], // 申请原因
      applyItemDesc: [null], // 其他原因说明
      reason: [null, [Validators.required]], // 申请原因
      applyFileIds: [[]], // 申请附件
      systemRegion: [null, [Validators.required]],
      bg: [null],
      cycleGroup: [null],
      bigArea: [null],
      smallArea: [null],
    }),
    orderInfo: this.fb.group({
      orderType: [null, [Validators.required]], // 订单类型
      referenceId: [null], // Reference Id
      productType: [null], // 产品型号
      bmc: [null, [Validators.required]], // 产品线
      bg: [{ value: null, disabled: true }, [Validators.required]], // BG
      cycleGroup: [null, [Validators.required]], // 产品区域-team
      bigArea: [null, [Validators.required]], // 产品区域-大区
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
      expectedPaymentDate: [null, [Validators.required]], // 预计付款(或场地就位)日期
      om: [null], // OM
      exchangeRole: [null], // 换货角色
      exchangeProcessing: [null], // 换货方式
      saleEmail: [null], // 销售邮箱
      districtLeader: [null], // District Leader邮箱
      salesLeader: [null], // sales Leader 邮箱
      productSalesMgr: [null], // product sales manager邮箱
      products: [[]],
      orderStatus: [null, [Validators.required]], // 订单状态
      arrivalDate: [null], // 到货日期
    }),
    rddOitOrderInfos: [[]],
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
          productType: [null], // 产品型号
          bmc: [null, [Validators.required]], // 产品线
          bg: [{ value: null, disabled: true }, [Validators.required]], // BG
          cycleGroup: [null, [Validators.required]], // 产品区域-大区
          bigArea: [null, [Validators.required]], // 产品区域-小区
          businessModel: [null, [Validators.required]], // 业务模式
          dealerName: [{ value: null, disabled: true }], // 经销商名称
          dealerCode: [{ value: null, disabled: true }], // 经销商编号
          hospitalName: [{ value: null, disabled: true }], // 医院名称
          hospitalNo: [{ value: null, disabled: true }], // 医院编号
          projectName: [null, [Validators.required]], // 项目名称
          sapOrderNo: [null, [Validators.required]], // SAP订单号
          currency: [null, [Validators.required]], // 合同金额-货币
          om: [null], // OM
          orderDate: [null, [Validators.required]], // 进单日期
          exchangeRole: [null, [Validators.required]], // 换货角色
          saleEmail: [{ value: null, disabled: true }], // 销售邮箱
          districtLeader: [{ value: null, disabled: true }], // District Leader邮箱
          salesLeader: [{ value: null, disabled: true }], // sales Leader 邮箱
          products: [[], [Validators.required]],
        }),
        this.fb.group({
          orderType: [null, [Validators.required]], // 订单类型
          referenceId: [null], // Reference Id
          productType: [null], // 产品型号
          bmc: [null, [Validators.required]], // 产品线
          bg: [{ value: null, disabled: true }, [Validators.required]], // BG
          cycleGroup: [null, [Validators.required]], // 产品区域-大区
          bigArea: [null, [Validators.required]], // 产品区域-小区
          businessModel: [null, [Validators.required]], // 业务模式
          dealerName: [{ value: null, disabled: true }], // 经销商名称
          dealerCode: [{ value: null, disabled: true }], // 经销商编号
          hospitalName: [{ value: null, disabled: true }], // 医院名称
          hospitalNo: [{ value: null, disabled: true }], // 医院编号
          projectName: [null, [Validators.required]], // 项目名称
          sapOrderNo: [null, [Validators.required]], // SAP订单号
          currency: [null, [Validators.required]], // 合同金额-货币
          om: [null], // OM
          orderDate: [null, [Validators.required]], // 进单日期
          exchangeRole: [null, [Validators.required]], // 换货角色
          saleEmail: [null], // 销售邮箱
          districtLeader: [{ value: null, disabled: true }], // District Leader邮箱
          salesLeader: [{ value: null, disabled: true }], // sales Leader 邮箱
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
        this.fb.group({...this.transferLibOrderInit}),
        this.fb.group({...this.transferLibOrderInit})
      ])
    })
  });

  public ngOnInit(): void {
    const { params: { requestId }, queryParams: { type, item, taskId,  bg } } = this.route.snapshot;
    // detail page
    if (requestId) {
      this.taskId = taskId;
      this.requestId = requestId;
      this.getRequestDetail(requestId);
    } else {
      // new page
      this.basicInfo.patchValue({
        applicant: localStorage.getItem('ng_philips_code1'),
        applicantName: localStorage.getItem('ng_philips_username')
      });
      this.showSubmitBtn = true;
      this.showSaveBtn = true;
      if (!type || !APPLY_TYPE_MAP[type]) {
        this.navigateToHomePage();
        return;
      }
      if (item) {
        this.applyItem = item;
        this.basicInfo.patchValue({ applyItem: item });
      }
      this.applyType = type;

      this.basicInfo.patchValue({ applyType: type });

      this.setPageTitle({ applyType: type, applyItem: item });

      if (bg) {
        switch(type) {
          case APPLY_TYPE.MACHINE_EXCHANGE:
            let orders = this.changeOrderInfos.get('orders') as FormArray
            orders.at(0).patchValue({ bg })
            orders.at(1).patchValue({ bg })
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
          default:
            this.orderInfo.patchValue({ bg });
        }
      }
      this.pageLoading = false;
      this.setFormValidators(type, item, bg);
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
      }
    }

    this.pageTitle =  isNew ? `新建特批-${title}` : title
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

  public setFormValidators(type, item, bg) {
    if (type === APPLY_TYPE.EXT_WARRANTY) {
      this.orderInfo.controls.applyArrivalTime.clearValidators();
      this.orderInfo.controls.expectedPaymentDate.clearValidators();
      if (item === 'sp_warranty_apply_item_5') {
        this.basicInfo.controls.applyItemDesc.setValidators([Validators.required]);
      }
    } else if (type === APPLY_TYPE.PRODUCTION) {
      this.basicInfo.controls.applyItem.disable();
    } else if (type === APPLY_TYPE.LC_AMENDMENT) {
      if (item === 'sp_lcamendment_apply_item_5') {
        this.basicInfo.controls.applyItemDesc.setValidators([Validators.required]);
      }
    } else if (type === APPLY_TYPE.TRANSFER_LIB) { //如果是转库，禁用相关form表单内容。
      //该功能已取消
      // let disabledFieldsList = ['referenceId','productType', 'bmc', 'bigArea', 'businessModel', 'projectName', 'sapOrderNo', 'orderAmount', 'currency', 'saleEmail', 'om']
      // disabledFieldsList.forEach(item => {
      //   this.orderInfo.controls[item].disable()
      // })
    }

    if (type !== APPLY_TYPE.LC_AMENDMENT) {
      this.orderInfo.controls.orderStatus.clearValidators();
    }

    if (bg === 'PD&IGT') {
      this.orderInfo.controls.referenceId.disable();
      if (type !== APPLY_TYPE.LC_AMENDMENT) {
        this.orderInfo.controls.productType.disable();
      }
    } else {
      this.orderInfo.controls.projectName.disable();
    }
  }

  public getFormData() {
    const { basicInfo, orderInfo, ccInfo, rddOitOrderInfos, changeOrderInfos, lcAmendmentOrderInfo,transferLibOrders, exchangeInfo, orderDifferences  } = this.formValues.getRawValue()
    const { applyArrivalTime, expectedPaymentDate, expectedSaleDate, products } = orderInfo
    const extInfo = {
      exchangeMethod: changeOrderInfos.exchangeMethod
    }
    const data = {
      ...this.requestInfo,
      ...basicInfo,
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
            expectedSaleDate: expectedSaleDate ? moment(expectedSaleDate).format('YYYY-MM-DD') : null,
            products: products.map(({ productType, wbsNo, itemNo, quantity }) => ({ productType, wbsNo, itemNo, quantity }))
          }
        ];
        break;
      case APPLY_TYPE.EXT_WARRANTY: // 延长保修
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
            ...this.requestInfo.orderInfos[0],
            ...changeOrderInfos.orders.at(0),
            applyArrivalTime: applyArrivalTime ? moment(applyArrivalTime).format('YYYY-MM-DD') : null,
            expectedPaymentDate: expectedPaymentDate ? moment(expectedPaymentDate).format('YYYY-MM-DD') : null,
            expectedSaleDate: expectedSaleDate ? moment(expectedSaleDate).format('YYYY-MM-DD') : null,
            products: changeOrderInfos.orders.at(0).products.map(({ productType, wbsNo, itemNo, quantity, equipmentSn, logisticsStatus }) => ({ productType, wbsNo, itemNo, quantity, equipmentSn, logisticsStatus }))
          },
          {
            ...this.requestInfo.orderInfos[1],
            ...changeOrderInfos.orders.at(1),
            applyArrivalTime: applyArrivalTime ? moment(applyArrivalTime).format('YYYY-MM-DD') : null,
            expectedPaymentDate: expectedPaymentDate ? moment(expectedPaymentDate).format('YYYY-MM-DD') : null,
            expectedSaleDate: expectedSaleDate ? moment(expectedSaleDate).format('YYYY-MM-DD') : null,
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
          },
          {
            ...transferLibOrders.orders.at(1),
          }
        ]
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
            exchangeableSoNo, exchangeableWbsNo, newRdd, originalRdd, productType: subProductType, wbsNo,
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
      this.formValues.controls.changeOrderInfos.disable()
      //添加转库disabled
      this.formValues.controls.exchangeInfo.disable()
      this.formValues.controls.orderDifferences.disable()
      this.formValues.controls.transferLibOrders.disable()
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
        if (modifyEntry === 'sp_lc_other') {
          lcInfoControls.modifyEntryDesc.setValidators([Validators.required])
        }
        break
      case 'sp_lcamendment_apply_item_4':
        lcInfoControls.cancelReason.setValidators([Validators.required])
        lcInfoControls.newLcIssued.setValidators([Validators.required])
        if (cancelReason === 'sp_lc_other') {
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
    let hasError = false
    switch(this.applyType) {
      case APPLY_TYPE.RDD_OIT:
        if (orderInfos.length === 0) {
          this.message.error('请导入订单信息')
          return
        } else {
          hasError = this.basicInfo.invalid
        }
        break
      case APPLY_TYPE.MACHINE_EXCHANGE:
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
        transferLibOrder.controls.forEach((item, index) => {
          let formGroupItem = item as FormGroup
          this.checkForm(formGroupItem)
          if (formGroupItem.invalid) {
            formValidError = true
          }
        })
        hasError = this.basicInfo.invalid || formValidError
        break
      default:
        for (const i in this.orderInfo.controls) {
          this.orderInfo.controls[i].markAsDirty();
          this.orderInfo.controls[i].updateValueAndValidity();
        }
        // 医院和经销商必填一项
        const { businessModel, hospitalNo, dealerCode } = orderInfos[0]
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
      this.message.error('请按要求填写表单信息')
      return
    }
    this.selectApprover.showModal(data)
  }

  public async onSaveDraft() {
    const id = this.message.loading(LOADING_MESSAGE.SAVE_DRAFT, { nzDuration: 0 }).messageId;

    try {
      this.submitLoading = true;
      const data = this.getFormData();
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
      this.message.error(ERROR_MESSAGE.SAVE_DRAFT);
      console.error(`保存失败, ${message}`);
    } finally {
      this.submitLoading = false;
      this.message.remove(id);
    }
  }

  public async getRequestDetail(requestId) {
    try {
      this.pageLoading = true
      const data = await this.spService.getRequestDetail(requestId)
      this.requestInfo = data
      const {
        createUser, applicant, applicantName,
        status, applyCode, applyType, applyItem,
        applyItemDesc, executed, processStatus,
        reason, ccType, ccPerson, orderInfos, attachments,
        taskList, nodeInfoList, nodeCode, nodeAction,
        extInfo, orderDifferences,
        bg, cycleGroup, bigArea, smallArea,
      } = data
      this.setPageTitle({ applyType, applyItem }, false)
      this.applyItem = applyItem
      this.applyType = applyType
      this.executed = executed
      this.formValues.patchValue({
        basicInfo: {
          applyCode,
          applicant,
          applicantName: applicantName || applicant,
          applyType,
          applyItem,
          applyItemDesc,
          systemRegion: (bg && cycleGroup) ? [bg, cycleGroup, bigArea, smallArea].join('-') : null,
          bg, cycleGroup, bigArea, smallArea,
          reason,
          applyFileIds: attachments.map(({ fileId }) => fileId)
        },
        ccInfo: {
          ccType,
          ccPerson: ccPerson ? ccPerson.split(',') : [],
        },
      })
      this.requestInfo.orderInfos = orderInfos
      if (applyType === APPLY_TYPE.PRODUCTION || applyType === APPLY_TYPE.EXT_WARRANTY || applyType === APPLY_TYPE.LOGISTICSCOST || applyType === APPLY_TYPE.EXT_INSTALL_COST) {
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
        this.formValues.patchValue({
          lcAmendmentOrderInfo: {
            ...orderInfo,
            lcInfo: {
              ...orderInfo.lcInfo,
              cancelReason: cancelReason ? cancelReason.split(',') : null,
              modifyEntry: modifyEntry ? modifyEntry.split(',') : null,
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
        this.formValues.patchValue({
          changeOrderInfos: {
            exchangeMethod: extInfo ? extInfo.exchangeMethod : null,
            orders: [
              {
                ...orderInfos[0],
                products: orderInfos[0].products || []
              },
              {
                ...orderInfos[1],
                products: orderInfos[1].products || []
              }
            ]
          }
        })
        this.setFormValidators(applyType, applyItem, orderInfos[0].bg)
      } else if(applyType === APPLY_TYPE.TRANSFER_LIB) { // 设置查看详情时代入数据
        this.formValues.patchValue({
          transferLibOrders: {
            orders: [
              {
                ...orderInfos[0],
                products: orderInfos[0].products || []
              },
              {
                ...orderInfos[1],
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

      this.showApproveTab = nodeAction !== NODE_ACTION.FEEDBACK && !!this.taskId && nodeInfoList.find(({ code, action, approverList }) => {
        if (code === nodeCode && action === nodeAction) {
          return approverList.find(({ user }) => user === localStorage.getItem('ng_philips_code1'));
        } else {
          return false;
        }
      });

      this.showFeedbackTab = nodeAction === NODE_ACTION.FEEDBACK && this.isApplicant && !!this.taskId;
      this.showWithdrawBtn = processStatus === PROCESS_STATUS.START && this.isApplicant && nodeAction !== NODE_ACTION.FEEDBACK;
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
      product1.itemNo == null || product1.itemNo == '' ||
      product1.logisticsStatus == null ||
      product1.productType == null ||
      product1.quantity == null || product1.quantity == '' ||
      product1.wbsNo == null || product1.wbsNo == ''
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
      product2.itemNo == null || product2.itemNo == '' ||
      product2.logisticsStatus == null ||
      product2.productType == null ||
      product2.quantity == null || product2.quantity == '' ||
      product2.wbsNo == null || product2.wbsNo == ''
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

}
