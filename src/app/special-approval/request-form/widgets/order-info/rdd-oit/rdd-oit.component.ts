import { Component, Input, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { read, utils } from "xlsx";
import { NzMessageService } from 'ng-zorro-antd'

import { SpecialApprovalService } from '../../../../special-approval.service'

import {
  ORDER_TYPES,
  BMC_LIST,
  CYCLEGROUP_BIGAREA_LIST,
  BUSINESS_MODEL_LIST,
  CURRENCIES,
  US_PRODUCT_LIST,
  CYCLEGROUP_BIGAREA_MAP,
} from "../../../../special-approval.constants";

const excelKeyMap = {
  订单类型: "orderType",
  "订单Reference ID": "referenceId",
  产品型号: "productType",
  产品线: "bmc",
  销售区域: "cycleGroup",
  业务模式: "businessModel",
  经销商编号: "dealerCode",
  经销商: "dealerName",
  医院编号: "hospitalNo",
  医院名称: "hospitalName",
  项目名称: "projectName",
  "SAP 订单号（SO#）": "sapOrderNo",
  合同金额: "orderAmount",
  币制: "currency",
  预计记认销售日期: "expectedSaleDate",
  "预计付款（或场地就位）日期": "expectedPaymentDate",
  申请到货日期: "applyArrivalTime",
  OM: "om",
  产品型号_1: "subProductType",
  "WBS#": "wbsNo",
  进单日期: "orderDate",
  原RDD: "originalRdd",
  推迟货期原因: "deliveryDelayReason",
  新RDD: "newRdd",
  是否有可换货期订单: "exchangeableOrder",
  可换货期订单销售: "exchangeableOrderSale",
  可换货期订单销售区域: "exchangeableOrderSaleCycleGroup",
  可换货期医院编号: "exchangeableHospitalNo",
  可换货期医院名称: "exchangeableHospitalName",
  可换货期订单型号: "exchangeableOrderModel",
  "可换货期订单SO#": "exchangeableSoNo",
  "可换货期订单WBS#": "exchangeableWbsNo",
  可换货期订单记认销售日期: "exchangeableOrderSaleDate",
};

@Component({
  selector: "special-approval-rdd-oit-order-info",
  templateUrl: "./rdd-oit.component.html",
  styleUrls: ["./rdd-oit.component.scss"],
})
export class RddOitOrderInfoComponent implements OnInit {
  @Input() formValues: FormGroup;

  @Input() editable: boolean

  selectOptions = {
    orderTypes: ORDER_TYPES,
    bmcList: BMC_LIST,
    cycleGroups: CYCLEGROUP_BIGAREA_LIST,
    cycleGroupBigAreaMap: CYCLEGROUP_BIGAREA_MAP,
    businessModels: BUSINESS_MODEL_LIST,
    currencies: CURRENCIES,
    oms: [],
    usProductList: US_PRODUCT_LIST,
  };

  constructor(
    private spService: SpecialApprovalService,
    private message: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.initOMUsers()
  }

  // 导入数据
  onImportOrderInfo = (file) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const workbook = read(e.target.result, { type: "array" });
      console.log("workbook", workbook);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      // const header = this.get
      const results = utils.sheet_to_json(worksheet);
      console.log(results);
      const data = results.map((order) => {
        const orderInfo = Object.keys(order).reduce((calc, cur) => {
          calc[excelKeyMap[cur]] = order[cur]
          return calc
        }, {}) as any
        const { 
          applyArrivalTime, bg, bmc, businessModel, currency, cycleGroup, dealerCode, dealerName, expectedPaymentDate, expectedSaleDate,
          hospitalName, hospitalNo, om, orderAmount, orderType, productType, projectName, referenceId, sapOrderNo, exchangeableOrder, exchangeableOrderSaleCycleGroup,
        } = orderInfo
        if (bmc) { this.onBmcChange(orderInfo) }
        if (businessModel) {
          const model = BUSINESS_MODEL_LIST.find(({ label }) => label === businessModel)
          orderInfo.businessModel = model.value
        }
        if (
          applyArrivalTime || bg || bmc || businessModel || currency || cycleGroup ||
          dealerCode || dealerName || expectedPaymentDate || expectedSaleDate || hospitalName ||
          hospitalNo || om || orderAmount || orderType || productType || projectName ||
          referenceId || sapOrderNo
        ) {
          orderInfo.isMain = true
        }
        if (cycleGroup) { this.onCycleGroupChange(orderInfo) }
        if (exchangeableOrderSaleCycleGroup) { this.onSaleCycleGroupChange(orderInfo) }
        if (exchangeableOrder === '是') {
          orderInfo.exchangeableOrder = 1
        } else if(exchangeableOrder === '否') {
          orderInfo.exchangeableOrder = 0
        }
        return orderInfo
      })
      this.formValues.patchValue(data)
      this.message.success('导入成功')
    };
    reader.readAsArrayBuffer(file);
    return false;
  }

  onCycleGroupChange(order) {
    const bigAreas = CYCLEGROUP_BIGAREA_MAP[order.cycleGroup]
    order.bigArea = bigAreas ? bigAreas[0].value : null
  }

  onSaleCycleGroupChange(order) {
    const bigAreas = CYCLEGROUP_BIGAREA_MAP[order.exchangeableOrderSaleCycleGroup]
    order.exchangeableOrderSaleBigArea = bigAreas ? bigAreas[0].value : null
  }

  onBmcChange(order) {
    const bmc = BMC_LIST.find(({ value }) => value === order.bmc);
    if (bmc) {
      order.bg = bmc.bg;
    }
  }

   // 初始化OM列表
   async initOMUsers() {
    const users = await this.spService.getOMUsers()
    this.selectOptions.oms = users.map(({ name, email }) => ({ label: name, value: email }))
  }

  onProductChange(order) {

  }
}
