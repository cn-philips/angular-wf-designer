import { Component, OnInit, Input, ViewChild } from '@angular/core';
import {FormArray, FormGroup} from '@angular/forms'

import { Hospital, SelectHospitalComponent, } from '../../select-hospital/select-hospital.component'
import { Reference, SelectReferenceComponent } from '../../select-reference/select-reference.component'
import { SpecialApprovalService } from '../../../../special-approval.service'
import {
  APPLY_TYPE,
  BUSINESS_MODEL,
  BG_LIST,
  ORDER_TYPES,
  BUSINESS_MODEL_LIST,
  BIG_SMALL_AREA_LIST,
  CURRENCIES,
  EXCHANGE_IMPORT_ROLES,
  EXCHANGE_EXPORT_ROLES,
} from '../../../../special-approval.constants'
import {debounceTime, map, switchMap} from "rxjs/operators";
import {BehaviorSubject, Observable} from "rxjs";
import {HttpService} from '../../../../../services';

/*
* @description: 获取当前账户邮箱
* */
function getLoginUserCode1() {
  return localStorage.getItem('ng_philips_code1')
}

interface Sales {
  email: string,
  name: string
}

@Component({
  selector: 'special-approval-transfer-lib-info',
  templateUrl: './transfer-lib.component.html',
  styleUrls: ['./transfer-lib.component.scss']
})
export class TransferLibComponent implements OnInit {

  constructor(
    private spService: SpecialApprovalService,
    private http: HttpService,
  ) { }


  @ViewChild('selectHospital') selectHospital: SelectHospitalComponent
  @ViewChild('selectReference') selectReference: SelectReferenceComponent

  @Input() formValues: FormGroup
  @Input() exchangeInfo: FormGroup
  @Input() editable = true
  @Input() applyType: string
  @Input() applyItem: string
  @Input() bmcs = []

  APPLY_TYPE = APPLY_TYPE
  searchChange$ = new BehaviorSubject('');
  showDealerArea: Array<boolean> = [false, false] //是否展示经销商名称字段
  currentImportIndex: 0 //当前导入数据的tab(转出项目/转入项目)
  isCreateUser: boolean = true //转出reference createUser 是否和当前账户一致

  selectOptions = {
    orderTypes: ORDER_TYPES,
    bgList: BG_LIST,
    bigAreas: BIG_SMALL_AREA_LIST,
    smallAreas: [],
    businessModels: BUSINESS_MODEL_LIST,
    currencies: CURRENCIES,
    oms: [],
    exchangeImportRoles: EXCHANGE_IMPORT_ROLES(),
    exchangeExportRoles: EXCHANGE_EXPORT_ROLES()
  }

  salesList: Sales[] = [{
    name: localStorage.getItem('ng_philips_username'),
    email: localStorage.getItem('ng_philips_code1')
  }];
  isSearchLoading: boolean = false
  /*
  * @description 选择业务模式触发
  * */
  onBusinessModelChange(businessModel, index) {
    this.showDealerArea[index] = businessModel === BUSINESS_MODEL.DISTRIBUTOR_DEAL;
  }

  onCalcProjectName(index) {
    const { hospitalName, productType, bg } = this.orders.at(index).value
    if (bg === 'PD&IGT') {
      return
    }
    const res = []
    if (hospitalName) {
      res.push(hospitalName)
    }

    if (productType) {
      res.push(productType)
    }
    this.formValues.patchValue({
      projectName: res.join('-')
    })
  }

  onBigAreaChange(bigArea, index) {
    const area = this.selectOptions.bigAreas.find(({ value }) => value === bigArea)
    this.selectOptions.smallAreas = area ? area.children : []
    this.orders.at(index).patchValue({ smallArea: null })
  }

  onShowSelectHospitalModal() {
    this.selectHospital.showModal()
  }

  onSelectHospital(hospital: Hospital) {
    const { no, customerName } = hospital
    this.formValues.patchValue({
      hospitalNo: no,
      hospitalName: customerName,
    })
    this.onCalcProjectName(0)
  }

  onClearHospital() {
    this.formValues.patchValue({
      hospitalNo: null,
      hospitalName: null,
    })
  }

  onShowReferenceModal(index, needCreateUser = true) {
    this.currentImportIndex = index
    this.selectReference.showModal(needCreateUser)
  }

  onSelectReference(reference: Reference) {
    const {
      referenceId,
      orderType,
      projectName,
      productModel,
      sap,
      team,
      region,
      bmc,
      businessModel,
      distributor,
      dealerCode,
      endUser,
      endUserId,
      contractPrice,
      invoiceInformation,
      createUser
    } = reference
    if (distributor) {
      this.showDealerArea[this.currentImportIndex] = true
    }
    if (this.currentImportIndex === 0) {
      this.isCreateUser = createUser === getLoginUserCode1();
    }
    this.orders.at(this.currentImportIndex).patchValue({
      orderType,
      referenceId,
      projectName,
      productType: productModel,
      sapOrderNo: sap,
      bigArea: team,
      smallArea: region,
      bmc,
      businessModel: businessModel ? businessModel.toLowerCase() : null,
      dealerName: distributor,
      dealerCode,
      hospitalName: endUser,
      hospitalNo: endUserId,
      orderAmount: contractPrice,
      currency: invoiceInformation,
      products: [{
        id: Date.now(),
        productType: productModel,
        wbs: "",
        itemNo: "",
        quantity: ""}],
    })
  }

  ngOnInit(): void {
    this.initOMUsers()
    if (this.editable) {
      let valueChangedSubscribeList = ['hospitalName', 'productType']
      this.orders.controls.forEach((item, index) => {
        valueChangedSubscribeList.forEach(item => {
          this.orders.at(index).get(item).valueChanges.subscribe(() => {
            this.onCalcProjectName(index)
          })
        })
      })
    }

    /*
    * @description 请求销售邮箱api？ copy过来，等待配置到api service中去
    * */
    const getSaleList = (keyword: string) => {
      if (!keyword) {
        this.isSearchLoading = false;
        return []
      }
      let data = this.http.get(`/act/role/getUsersByRoleAndEmail?role=` + 'Sales Rep/Mgr' + '&email=' + keyword)
        .pipe(map((res: any) => res.data as Sales[]))
      return data
    }

    const optionList$: Observable<Sales[]> = this.searchChange$
      .asObservable()
      .pipe(debounceTime(500))
      .pipe(switchMap(getSaleList));
    optionList$.subscribe(data => {
      this.salesList = data;
      this.isSearchLoading = false;
    });
  }

   // 初始化OM列表
  async initOMUsers() {
    const users = await this.spService.getOMUsers()
    this.selectOptions.oms = users.map(({ name, email }) => ({ label: name, value: email }))
  }

  districtList: any = [[],[]] // District Leader邮箱
  productSalesList: any = [[],[]] // Product Sales Manager 邮箱
  salesLeaderList: any = [[],[]] // Sales Leader邮箱

  /*
  * @description 邮箱变化
  * */
  async salesChange(index) {
    await this.getLeaderEmail(index)
  }
  async getLeaderEmail(index){
    this.orders.controls.forEach(value => {
      value.patchValue({
        districtLeader: null,
        salesLeader: null
      })
    })
    this.districtList[index] = await this.spService.getCustomizeEmail(this.getDistrictList('District Leader'));
    this.salesLeaderList[index] = await this.spService.getCustomizeEmail(this.getDistrictList('Sales Leader'));
    this.productSalesList[index] = await this.spService.getCustomizeEmail(this.getDistrictList('Sales Rep/Mgr', this.orders.at(index).value.bmc))
  }

  /*
  * @description: 1. 币制的变化，如果转入项目币制变化，则修改成本汇总币制。 2. 币制变化，根据转入转出币制判断换货类型
  * */
  onCurrencyChanged(val, index) {
    if (index === 1) { // 转入项目
      this.exchangeInfo.patchValue({
        ...this.exchangeInfo.value,
        currency: val
      })
    } else {
      // this.orders.at(index).value
    }
    this.onCheckExchangeType()
  }

  /*
  * @description: 判断换货类型
  * */
  onCheckExchangeType() {
    let exchangeType = ''
    let outputCurrency = this.orders.at(0).value.currency
    let inputCurrency = this.orders.at(1).value.currency
    if (inputCurrency === outputCurrency) {
      exchangeType = 'within ORU'
    } else if (inputCurrency === 'CNY' && outputCurrency === 'USD') {
      exchangeType = 'HK90-CN90'
    } else if (inputCurrency === 'USD' && outputCurrency === 'CNY') {
      exchangeType = 'CN90-HK90'
    }
    if (exchangeType) {
      this.exchangeInfo.patchValue({
        ...this.exchangeInfo.value,
        exchangeType
      })
    }
  }

  /*
  * @description 获取email
  * @params {String} approverRole
  * @params {String} productBmc : 只有 Product Sales Manager 邮箱 需要该参数
  * */
  getDistrictList(approverRole, productBmc = undefined) {
    return {
      initiatorEmail: localStorage.ng_philips_code1,
      initiatorRole: localStorage.roleCode,
      approverRole,
      productBmc
    }
  }
  get orders() {
    return this.formValues.get('orders') as FormArray
  }

  /*
  * @description: 销售邮箱变化
  * */
  onSearchSales(keyword: string) {
    this.isSearchLoading = true
    this.searchChange$.next(keyword)
  }
}
