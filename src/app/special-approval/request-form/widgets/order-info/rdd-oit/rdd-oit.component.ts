import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { read, utils } from "xlsx";
import { NzMessageService } from 'ng-zorro-antd'

import { SpecialApprovalService } from '../../../../special-approval.service'
import { environment } from "../../../../../../environments/environment";

import {
  ORDER_TYPES,
  BUSINESS_MODEL_LIST,
  BUSINESS_MODEL,
  CURRENCIES,
} from "../../../../special-approval.constants";
import { Hospital, SelectHospitalComponent } from "../../select-hospital/select-hospital.component";
import { Dealer, SelectDealerComponent } from "../../select-dealer/select-dealer.component";

import { HttpService } from '../../../../../services/http.service'

const excelKeyMap = {
  订单类型: "orderType",
  "订单Reference ID": "referenceId",
  产品型号: "subProductType",
  产品线: "bmc",
  销售区域: "cycleGroup",
  销售区域_1: "bigArea",
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
  "WBS#": "wbsNo",
  进单日期: "orderDate",
  原RDD: "originalRdd",
  推迟货期原因: "deliveryDelayReason",
  新RDD: "newRdd",
  是否有可换货期订单: "exchangeableOrder",
  可换货期订单销售: "exchangeableOrderSale",
  可换货期订单销售区域: "exchangeableOrderSaleCycleGroup",
  可换货期订单销售区域_1: "exchangeableOrderSaleBigArea",
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
  @ViewChild('selectHospital') selectHospital: SelectHospitalComponent
  @ViewChild('selectDealer') selectDealer: SelectDealerComponent

  BUSINESS_MODEL = BUSINESS_MODEL

  activeOrder = null
  isExchange = false

  templateUrl = `${environment.base_href}/assets/template/RDD-OIT-180-Template.xlsx`

  selectOptions = {
    orderTypes: ORDER_TYPES,
    businessModels: BUSINESS_MODEL_LIST,
    currencies: CURRENCIES,
    oms: [],
  };

  constructor(
    public spService: SpecialApprovalService,
    private message: NzMessageService,
    private http: HttpService,
  ) {}

  ngOnInit(): void {
    this.initOMUsers()
  }

  get bmcList() {
    return this.spService.bmcList.filter(({ bg }) => bg === 'US')
  }

  checkImportedHospital(order, isExchange = false) {
    if (isExchange) {
      order.exchangeHospitalLoading = true
      order.exchangeHospitalError = false
    } else {
      order.hospitalLoading = true
      order.hospitalError = false
    }
    const customerName = isExchange ? order.exchangeableHospitalName : order.hospitalName
    this.http.post(`/act/preparation/getEndUser`, { customerName })
      .subscribe(({ code, data }) => {
        if (code === '0000') {
          const { rows } = data
          if (rows.length === 1) {
            const { customerName, no } = rows[0]
            if (isExchange) {
              order.exchangeableHospitalName = customerName
              order.exchangeableHospitalNo = no
            } else {
              order.hospitalName = customerName
              order.hospitalNo = no
            }
          } else {
            if (isExchange) {
              order.exchangeHospitalError = true
              order.exchangeableHospitalNo = ''
              order.exchangeableHospitalName = ''
            } else {
              order.hospitalError = true
              order.hospitalNo = ''
              order.hospitalName = ''
            }
          }
        }
        if (isExchange) {
          order.exchangeHospitalLoading = false
        } else {
          order.hospitalLoading = false
        }
    })
  }

  checkImportedDealer(order) {
    order.dealerLoading = true
    order.dealerError = false
    this.http.post(`/act/preparation/getDealersOnlyWithRegFlag`, { dealerName: order.dealerName })
      .subscribe(({ code, data }) => {
        if (code === '0000') {
          const { rows } = data
          if (rows.length === 1) {
            order.dealerCode = rows[0].dealerCode
          } else {
            order.dealerError = true
            order.dealerCode = ''
            order.dealerName = ''
          }
        } 
        order.dealerLoading = false
    })
  }

  isTableValid() {
    let hasError = false
    this.formValues.value.forEach((order) => {
      const { 
        isMain, orderType, bmc, businessModel,
        dealerCode, hospitalNo,
        projectName, sapOrderNo, orderAmount, currency,
        subProductType, wbsNo, orderDate, originalRdd, deliveryDelayReason, newRdd,
        exchangeableOrder
      } = order
      if (isMain) {
        if (!(orderType && bmc &&
          businessModel && projectName && sapOrderNo &&
          orderAmount && currency && (dealerCode || hospitalNo)
        )) {
          hasError = true
        }
      }
      if (!(
        subProductType && wbsNo && orderDate && originalRdd &&
        deliveryDelayReason && newRdd &&
        exchangeableOrder !== null && exchangeableOrder !== undefined
      )) {
        hasError = true
      }
    })
    return !hasError
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
      let mainOrder = null
      let subProductTypes = []
      const data = results.map((order, index) => {
        const orderInfo = Object.keys(order).reduce((calc, cur) => {
          calc[excelKeyMap[cur.trim()]] = order[cur]
          return calc
        }, {}) as any
        const { 
          applyArrivalTime, bg, bmc, businessModel, currency, cycleGroup, dealerCode, dealerName, expectedPaymentDate, expectedSaleDate,
          hospitalName, hospitalNo, om, orderAmount, orderType, productType, projectName, referenceId, sapOrderNo, exchangeableOrder,
          subProductType, exchangeableHospitalName,
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
          referenceId || sapOrderNo || index === 0
        ) {
          orderInfo.isMain = true
          if (mainOrder) {
            mainOrder.productType = subProductTypes.join(';')
          }
          subProductTypes = []
          mainOrder = orderInfo
        } else {
          orderInfo.parent = mainOrder
        }
        if (subProductType && subProductType.trim()) {
          subProductTypes.push(subProductType)
        }
        if (exchangeableOrder === '是') {
          orderInfo.exchangeableOrder = 1
        } else if(exchangeableOrder === '否') {
          orderInfo.exchangeableOrder = 0
        }

        if (hospitalName) {
          this.checkImportedHospital(orderInfo)
        }
        if (dealerName) {
          this.checkImportedDealer(orderInfo)
        }
        if (exchangeableHospitalName) {
          this.checkImportedHospital(orderInfo, true)
        }
        return orderInfo
      })
      if (subProductTypes.length > 0) {
        mainOrder.productType = subProductTypes.join(';')
      }
      this.formValues.patchValue(data)
      this.isTableValid()
      this.message.success('导入成功')
    };
    reader.readAsArrayBuffer(file);
    return false;
  }

  onCycleGroupChange(order) {
    order.bigArea = null
  }

  onSaleCycleGroupChange(order) {
    order.exchangeableOrderSaleBigArea = null
  }

  onBusinessModelChange(order) {
    order.dealerName = null
    order.dealerCode = null
  }

  onBmcChange(order) {
    const bmc = this.spService.bmcList.find(({ value }) => value === order.bmc);
    if (bmc) {
      order.bg = bmc.bg;
    }
  }

  // 初始化OM列表
  async initOMUsers() {
    const users = await this.spService.getOMUsers()
    this.selectOptions.oms = users.map(({ name, email }) => ({ label: name, value: email }))
  }

  onShowSelectHospitalModal(order, isExchange = false) {
    this.isExchange = isExchange
    this.activeOrder = order
    this.selectHospital.showModal()
  }

  onSelectHospital(hospital: Hospital) {
    const { no, customerName } = hospital
    if (this.isExchange) {
      this.activeOrder.exchangeHospitalError = false
      this.activeOrder.exchangeableHospitalNo = no
      this.activeOrder.exchangeableHospitalName = customerName
    } else {
      this.activeOrder.hospitalError = false
      this.activeOrder.hospitalNo = no
      this.activeOrder.hospitalName = customerName
    }
  }

  onClearHospital(order, isExchange = false) {
    if (isExchange) {
      order.exchangeableHospitalName = null
      order.exchangeableHospitalNo = null
    } else {
      order.hospitalName = null
      order.hospitalNo = null
    }
  }

  onShowSelectDealerModal(order) {
    this.activeOrder = order
    this.selectDealer.showModal()
  }

  onSelectDealer(dealer: Dealer) {
    this.activeOrder.dealerError = false
    const { dealerCode, dealerName } = dealer
    this.activeOrder.dealerCode = dealerCode
    this.activeOrder.dealerName = dealerName
  }

  onClearDealer(order) {
    order.dealerName = null
    order.dealerCode = null
  }

  onProductChange(order) {
    const parentOrder = order.isMain ? order : order.parent
    const orders = this.formValues.value.filter((order) => order === parentOrder || order.parent === parentOrder)
    // 计算 productType
    const productType = orders
      .filter(({ subProductType }) => subProductType && subProductType.trim())
      .map(({ subProductType }) => subProductType)
      .join(';')
    parentOrder.productType = productType
  }
}
