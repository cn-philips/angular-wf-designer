import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {read, utils} from 'xlsx';
import { BUSINESS_MODEL_LIST,
         CURRENCIES,
         ORDER_TYPES,
         BUSINESS_MODEL,
         BG_LIST } from '../../../../special-approval.constants';
import {environment} from '../../../../../../environments/environment';
import {SpecialApprovalService} from '../../../../special-approval.service';
import {NzMessageService} from 'ng-zorro-antd';
import {HttpService} from '../../../../../services';
import {FormGroup} from '@angular/forms';
import {Hospital, SelectHospitalComponent} from '../../select-hospital/select-hospital.component';
import * as moment from 'moment'

const excelKeyMap = {
  项目名称: "productType",
  产品线: "bmc",
  'BG(Modality)': "bg",
  '销售区域-team': "cycleGroup",
  '销售区域-大区': "bigArea",
  产品型号: "productType1",
  医院编号: "hospitalNo",
  医院名称: "hospitalName",
  "SAP 订单号（SO#）": "sapOrderNo",
  '订单WBS#': "wbsNo",
  进单日期: "orderDate",
  合同金额: "orderAmount",
  币制: "currency",
  'De-Book原因': "deBookReason",
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
  @Input() applicantEmail

  BUSINESS_MODEL = BUSINESS_MODEL

  @ViewChild('selectHospital') selectHospital: SelectHospitalComponent

  BG_LIST=BG_LIST

  templateUrl = `${environment.base_href}/assets/template/De-Book Template.xlsx`
  isExchange: boolean;
  activeOrder = null
  currBg: string;


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
    bmcs: []
  };

  get bmcList() {
    return this.spService.bmcList
  }

  get usProductList(){
    return this.spService.usProductList
  }

  debookReasonList = [
    { label: '资金问题', value: '资金问题' },
    { label: '在建新大楼', value: '在建新大楼' },
    { label: '经销商问题', value: '经销商问题' },
    { label: '项目变更', value: '项目变更' },
    { label: '招商问题', value: '招商问题' },
    { label: '其它场地问题', value: '其它场地问题' },
    { label: '其它', value: '其它' }
   ]

  ngOnInit() {
    console.log(JSON.parse(localStorage.getItem('profiles')))
    this.currBg = JSON.parse(localStorage.getItem('profiles'))[0].modality
    if (this.formValues.value.length === 0) {
      this.createOrder()
    }
  }

  onCycleGroupChange(order) {
    order.bigArea = null
  }

  onImportOrderInfo = (file) => {
    this.selectOptions.bmcs = this.bmcList
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const workbook = read(e.target.result, { type: "array" });
      console.log("workbook", workbook);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      // const header = this.get
      const results = utils.sheet_to_json(worksheet);
      console.log(results);
      const data = results.map((order, index) => {
        const orderInfo = Object.keys(order).reduce((calc, cur) => {
          calc[excelKeyMap[cur.trim()]] = order[cur]
          return calc
        }, {}) as any
        console.log(orderInfo)
        const {
          productType, bg, bmc, cycleGroup, bigArea, productType1,
         hospitalName, hospitalNo, sapOrderNo, wbsNo, orderDate, orderAmount, currency, deBookReason, remark
        } = orderInfo
        if (bmc) { this.onBmcChange(orderInfo) }

        if (orderDate) {
          orderInfo.orderDate = moment(orderDate).utc().format('YYYY-MM-DD')
        }

      if ( productType1.length > 0) {
        orderInfo.productType = productType1.join(';')
      }
        return orderInfo
      })

      this.formValues.patchValue(data)
      for (let i = 0; i < this.selectOptions.bmcs.length; i++) {
        this.selectOptions.bmcs[i] = this.bmcList
      }
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
        productType: null,
        bmc: null,
        bg: this.currBg,
        cycleGroup: null,
        bigArea: null,
        productType1: null,
        sapOrderNo: null,
        wbsNo: null,
        item: null,
        orderDate: null,
        orderAmount: null,
        currency: null,
        debookReason: null,
      }
    ])
    this.selectOptions.bmcs.push(this.bmcList.filter(value => value.bg === this.currBg))

  }

  deleteOrder(order, index) {
    const orders = this.formValues.value.filter(data => data !== order);
    this.selectOptions.bmcs = this.selectOptions.bmcs.filter((value, index1) => index1 !== index)
    this.formValues.patchValue(orders);
  }

  isTableValid() {
    let hasError = false
    let checkbg = null
    let errorCode = 0

    this.formValues.value.some((order) => {
      if (errorCode === 0) {
        const {
          productType, bg, bmc, productType1,
          hospitalName, hospitalNo, sapOrderNo, wbsNo, orderDate, orderAmount, currency, deBookReason, remark
        } = order
        if (checkbg) {
          if (checkbg !== bg){
            errorCode = 1
            hasError = true
            return
          }
        } else {
          checkbg = bg
        }

          if (!(bg && bmc &&
            productType1 && sapOrderNo && wbsNo && orderDate &&
            orderAmount && currency && hospitalNo && hospitalName && deBookReason && productType
          )) {
            errorCode = 2
            hasError = true
            return;
          }
      }

    })

    switch (errorCode) {
      case 1:
        this.message.error('存在BG不一致的记录')
        return hasError
      case 2:
        this.message.error('请按要求填写订单信息')
        console.log('order')
        return hasError
    }
    return hasError
  }

  onProductChange(vals: [], order) {
    order.productType1 = vals.join(';');
  }

  onBgChange(val: string, order, index) {
    order.bmc = null
    this.selectOptions.bmcs[index] = this.bmcList.filter(value => value.bg === val);
  }
}
