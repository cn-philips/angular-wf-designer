import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {read, utils} from 'xlsx';
import { BUSINESS_MODEL_LIST,
         CURRENCIES,
         ORDER_TYPES,
         BUSINESS_MODEL } from '../../../../special-approval.constants';
import {environment} from '../../../../../../environments/environment';
import {SpecialApprovalService} from '../../../../special-approval.service';
import {NzMessageService} from 'ng-zorro-antd';
import {HttpService} from '../../../../../services';
import {FormGroup} from '@angular/forms';
import {Hospital, SelectHospitalComponent} from '../../select-hospital/select-hospital.component';


const excelKeyMap = {
  项目名称: "projectName",
  产品线: "bmc",
  'BG(Modality)': "bg",
  '销售区域-team': "cycleGroup",
  '销售区域-大区': "bigArea",
  业务模式: "businessModel",
  产品型号: "productType",
  医院编号: "hospitalNo",
  医院名称: "hospitalName",
  "SAP 订单号（SO#）": "sapOrderNo",
  '订单WBS#': "wbsNo",
  进单日期: "orderDate",
  合同金额: "orderAmount",
  币制: "currency",
  'De-Book原因': "debookReason",
  'Remark': "remark",
};
@Component({
  selector: 'special-approval-debook-info',
  templateUrl: './de-book.component.html',
  styleUrls: ['./de-book.component.scss']
})
export class DeBookComponent implements OnInit {


  @Input() editable = true
  @Input() formValues: FormGroup;

  BUSINESS_MODEL = BUSINESS_MODEL

  @ViewChild('selectHospital') selectHospital: SelectHospitalComponent


  templateUrl = `${environment.base_href}/assets/template/de-book.xlsx`
  isExchange: boolean;
  activeOrder = null


  constructor(
    public spService: SpecialApprovalService,
    private message: NzMessageService,
    private http: HttpService,
  ) { }

  selectOptions = {
    orderTypes: ORDER_TYPES,
    businessModels: BUSINESS_MODEL_LIST,
    currencies: CURRENCIES,
    oms: [],
  };

  get bmcList() {
    return this.spService.bmcList
  }

  debookReasonList = [
    { label: '资金问题', value: '资金问题' },
    { label: '在建新大楼', value: '在建新大楼' },
    { label: '经销商问题', value: '经销商问题' },
    { label: '项目变更', value: '项目变更' },
    { label: '招商问题', value: '招商问题' }
   ]

  ngOnInit() {
    if (this.formValues.value.length === 0) {
      this.createOrder()
    }
  }

  onCycleGroupChange(order) {
    order.bigArea = null
  }

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
        console.log(orderInfo)
        const {
          productName, bg, bmc, cycleGroup, bigArea, businessModel, productType,
         hospitalName, hospitalNo, sapOrderNo, wbsNo, orderDate, orderAmount, currency, deBookReason, remark
        } = orderInfo
        // if (bmc) { this.onBmcChange(orderInfo) }
        if (businessModel) {
          const model = BUSINESS_MODEL_LIST.find(({ label }) => label === businessModel)
          orderInfo.businessModel = model.value
        }
        if (
          productName || bg || bmc || businessModel || currency || cycleGroup ||
           hospitalName || hospitalNo || bigArea || orderAmount || wbsNo || productType || deBookReason ||
          orderDate || sapOrderNo || index === 0
        ) {
          // if (mainOrder) {
          //   mainOrder.productType = subProductTypes.join(';')
          // }
          subProductTypes = []
          mainOrder = orderInfo
        } else {
          orderInfo.parent = mainOrder
        }
        // if (subProductType && subProductType.trim()) {
        //   subProductTypes.push(subProductType)
        // }
        // if (exchangeableOrder === '是') {
        //   orderInfo.exchangeableOrder = 1
        // } else if(exchangeableOrder === '否') {
        //   orderInfo.exchangeableOrder = 0
        // }
        //
        // if (hospitalName) {
        //   this.checkImportedHospital(orderInfo)
        // }
        // if (dealerName) {
        //   this.checkImportedDealer(orderInfo)
        // }
        // if (exchangeableHospitalName) {
        //   this.checkImportedHospital(orderInfo, true)
        // }
        return orderInfo
      })
      if (subProductTypes.length > 0) {
        mainOrder.productType = subProductTypes.join(';')
      }
      this.formValues.patchValue(data)
      // this.isTableValid()
      this.message.success('导入成功')
    };
    reader.readAsArrayBuffer(file);
    return false;
  }

  onBmcChange(order) {
    const bmc = this.spService.bmcList.find(({ value }) => value === order.bmc);
    if (bmc) {
      order.bg = bmc.bg;
    }
  }

  onShowSelectHospitalModal(order) {
    this.activeOrder = order
    this.selectHospital.showModal()
  }

  onSelectHospital(hospital: Hospital) {
    const { no, customerName } = hospital
    this.activeOrder.hospitalName = customerName
    this.activeOrder.hospitalNo = no
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

  createOrder() {
    this.formValues.patchValue([
      ...this.formValues.value,
      {
        productName: null,
        bmc: null,
        bg: null,
        cycleGroup: null,
        bigArea: null,
        businessModel: null,
        productType: null,
        sapOrderNo: null,
        wbsNo: null,
        item: null,
        orderDate: null,
        orderAmount: null,
        currency: null,
        debookReason: null,
      }
    ])
  }

  deleteOrder(order) {
    const orders = this.formValues.value.filter(data => data !== order);
    this.formValues.patchValue(orders);
  }

  isTableValid() {
    let hasError = false
    this.formValues.value.forEach((order) => {
      const {
        productName, bg, bmc, cycleGroup, bigArea, businessModel, productType,
        hospitalName, hospitalNo, sapOrderNo, wbsNo, orderDate, orderAmount, currency, deBookReason, remark
      } = order

      console.log(order)
        if (!(bg && bmc && cycleGroup && bigArea &&
          businessModel && productType && sapOrderNo && wbsNo && orderDate &&
          orderAmount && currency && hospitalNo && hospitalName && deBookReason && productName
        )) {
          hasError = true
        }

    })
    return !hasError
  }

}
