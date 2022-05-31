import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Hospital, SelectHospitalComponent} from '../../select-hospital/select-hospital.component';
import {environment} from '../../../../../../environments/environment';
import {SpecialApprovalService} from '../../../../special-approval.service';
import {NzMessageService, NzModalService, UploadFile, UploadXHRArgs} from 'ng-zorro-antd';
import {HttpService} from '../../../../../services';
import {BUSINESS_MODEL_LIST, CURRENCIES, ORDER_TYPES, BUSINESS_MODEL, BG_LIST} from '../../../../special-approval.constants';
import {read, utils} from 'xlsx';
import {Dealer, SelectDealerComponent} from '../../select-dealer/select-dealer.component';
import {getType} from '../../../../../../assets/js/tools';
import { saveAs } from 'file-saver';


interface CommonResponse {
  code: string;
  data: any;
  msg: string
}

const excelKeyMap = {
  订单类型: "orderType",
  "订单Reference ID": "referenceId",
  产品型号: "subProductType",
  产品线: "bmc",
  'BG(Modality)': "bg",
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
  OM: 'om',
  备货协议附件: 'stockingAgreementFileId',
  '预计付款(场地就位)日期': 'expectedPaymentDate',
  申请到货日期: 'expectedSitePlaceDate',
  预计记认销售日期: 'expectedSaleDate',
  产品型号_1: 'productType',
  数量: 'quantity',
};
@Component({
  selector: 'special-approval-lastbuy-info',
  templateUrl: './lastbuy.component.html',
  styleUrls: ['./lastbuy.component.scss']
})
export class LastbuyComponent implements OnInit {

  @Input() editable = true
  @Input() formValues: FormGroup;
  @Input() showFeedbackTab: boolean = false;

  BUSINESS_MODEL = BUSINESS_MODEL

  @ViewChild('selectHospital') selectHospital: SelectHospitalComponent

  @ViewChild('selectDealer') selectDealer: SelectDealerComponent


  templateUrl = `${environment.base_href}/assets/template/Pre-Book Last Buy 特批生产发货Templete.xlsx`
  isExchange: boolean;
  activeOrder = null
  private upIndex: number;


  constructor(
    public spService: SpecialApprovalService,
    private message: NzMessageService,
    private http: HttpService,
    private modal: NzModalService,
  ) { }

  selectOptions = {
    orderTypes: ORDER_TYPES,
    businessModels: BUSINESS_MODEL_LIST,
    currencies: CURRENCIES,
    oms: [],
    wareHouse: [{label:'W/H', value: 'W/H'},
      {label:'FTZ', value: 'FTZ'},
      {label:'医院', value: '医院'},
      {label:'代理商仓库', value: '代理商仓库'},
      ]
  };

  get bmcList() {
    return this.spService.bmcList
  }

  get usProductList(){
    return this.spService.usProductList
  }

  ngOnInit() {
    if (this.formValues.value.length === 0) {
      this.createOrder()
    }
    this.initOMUsers()
  }

  async initOMUsers() {
    const users = await this.spService.getOMUsers()
    this.selectOptions.oms = users.map(({ name, email }) => ({ label: name, value: email }))
  }

  onCycleGroupChange(order) {
    order.bigArea = null
  }

  onClearDealer(order) {
    order.dealerName = null
    order.dealerCode = null
  }

  onShowSelectDealerModal(order) {
    this.activeOrder = order
    this.selectDealer.showModal()
  }

  onBusinessModelChange(order) {
    order.dealerName = null
    order.dealerCode = null
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
      const data = results.map((order, index) => {
        const orderInfo = Object.keys(order).reduce((calc, cur) => {
          calc[excelKeyMap[cur.trim()]] = order[cur]
          return calc
        }, {}) as any
        console.log(orderInfo)
        const {
          orderType, referenceId, subProductType, bg, bmc, cycleGroup, bigArea, businessModel, dealerCode, dealerName,
          hospitalName, hospitalNo, projectName, sapOrderNo,  orderAmount, currency, om, stockingAgreementFileId, expectedPaymentDate,
          expectedSitePlaceDate, expectedSaleDate, productType, quantity
        } = orderInfo
        if (bmc) { this.onBmcChange(orderInfo) }
        if (businessModel) {
          const model = BUSINESS_MODEL_LIST.find(({ label }) => label === businessModel)
          orderInfo.businessModel = model.value
        }

        if (hospitalName) {
          this.checkImportedHospital(orderInfo)
        }
        if (dealerName) {
          this.checkImportedDealer(orderInfo)
        }

        // if ( productType.length > 0) {
        //   orderInfo.subProductType = productType.join(';')
        // }
        return orderInfo
      })

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

  onSelectDealer(dealer: Dealer) {
    this.activeOrder.dealerError = false
    const { dealerCode, dealerName } = dealer
    this.activeOrder.dealerCode = dealerCode
    this.activeOrder.dealerName = dealerName
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
        orderType: null,
        referenceId: null,
        subProductType: null,
        bmc: null,
        bg: null,
        cycleGroup: null,
        bigArea: null,
        businessModel: null,
        dealerCode: null,
        dealerName: null,
        hospitalNo: null,
        hospitalName: null,
        projectName: null,
        sapOrderNo: null,
        orderAmount: null,
        currency: null,
        om: null,
        stockingAgreementFile: [],
        stockingAgreementFileList: [],
        expectedPaymentDate: null,
        expectedSitePlaceDate: null,
        expectedSaleDate: null,
        productType: null,
        quantity: null,
        actualOitDate: null,
        warehouseArrangement: null,
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
        orderType, referenceId, subProductType, bg, bmc, cycleGroup, bigArea, businessModel, dealerCode, dealerName,
        hospitalName, hospitalNo, projectName, sapOrderNo,  orderAmount, currency, om, stockingAgreementFileId, expectedPaymentDate,
        expectedSitePlaceDate, expectedSaleDate, productType, quantity
      } = order

      console.log(order)
      if (!(orderType && bmc &&
        businessModel && projectName && sapOrderNo &&
        orderAmount && currency && (dealerCode || hospitalNo)
      )) {
        hasError = true
      }

    })
    return !hasError
  }

  onProductChange(vals: [], order) {
    order.projectName = vals.join(';');
  }


  onUploadFile = (item: UploadXHRArgs) => {
    const formData = new FormData()
    const file = item.file as any
    formData.append('file', file)
    formData.append('fileType', getType(file))
    formData.append('filename', file.name)

    return this.spService.uploadFile(formData).subscribe(
      (response: CommonResponse) => {
        const { data, code } = response
        if ('0000' === code) {
          console.log( this.formValues.value)
          console.log( this.formValues.value[this.upIndex])
          if (!this.formValues.value[this.upIndex].stockingAgreementFile) {
            this.formValues.value[this.upIndex].stockingAgreementFile = []
          }
          const fileids = this.formValues.value[this.upIndex].stockingAgreementFile as string[]
          this.formValues.value[this.upIndex].stockingAgreementFile = fileids.concat(data)
          console.log( this.formValues.value[this.upIndex].stockingAgreementFile)

          item.onSuccess({ fileId: data }, file, response)
        } else {
          item.onError({}, file)
          console.log( this.formValues.value[this.upIndex].stockingAgreementFile)
        }
      },
      err => {
        item.onError!(err, item.file!)
      }
    )
  }

  onDownloadFile( fileId, name ) {
    let uri = `/act/system/download/${fileId}`;
    this.http.get(uri, {
      responseType: 'blob'
    }).subscribe(data => {
      saveAs(data, name);
    });
  }

  uploadIndex(i: number) {
    this.upIndex = i
  }
}
