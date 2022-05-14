import { Component, OnInit, Input, ViewChild } from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms'

import { Hospital, SelectHospitalComponent, } from '../../select-hospital/select-hospital.component'
import { Reference, SelectReferenceComponent } from '../../select-reference/select-reference.component'
import { SpecialApprovalService } from '../../../../special-approval.service'
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import {
  APPLY_TYPE,
  BUSINESS_MODEL,
  BG_LIST,
  ORDER_TYPES,
  BUSINESS_MODEL_LIST,
  CURRENCIES,
  EXCHANGE_IMPORT_ROLES,
  EXCHANGE_EXPORT_ROLES,
} from '../../../../special-approval.constants'
import {debounceTime, map, switchMap} from "rxjs/operators";
import {BehaviorSubject, Observable} from "rxjs";
import {HttpService} from '../../../../../services';
import {NzMessageService} from 'ng-zorro-antd';

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
  styleUrls: ['./transfer-lib.component.scss'],
  animations: [
    trigger('openClose', [
      state('close', style({
        display: 'none',
        opacity: 0
      })),
      state('open', style({
        opacity: 1
      })),
      transition('close => open', animate('200ms ease-in')),
      transition('open => close', animate('200ms ease-out'))
    ])
  ]
})
export class TransferLibComponent implements OnInit {

  constructor(
    private spService: SpecialApprovalService,
    private http: HttpService,
    private message: NzMessageService,

  ) { }


  @ViewChild('selectHospital') selectHospital: SelectHospitalComponent
  @ViewChild('selectReference') selectReference: SelectReferenceComponent

  @Input() formValues: FormGroup
  @Input() exchangeInfo: FormGroup
  @Input() baseInfo: FormGroup
  @Input() editable = true
  @Input() applyType: string
  @Input() applyItem: string
  @Input() bmcs = []

  APPLY_TYPE = APPLY_TYPE
  searchChange$ = new BehaviorSubject('');
  showDealerArea: Array<boolean> = [false, false] //是否展示经销商名称字段
  currentImportIndex: number = 0 //当前导入数据的tab(转出项目/转入项目)
  isCreateUser = {
    0: true,
    1: true,
  }

  selectOptions = {
    orderTypes: ORDER_TYPES,
    bgList: BG_LIST,
    bigArea0: [],
    bigArea1: [],
    businessModels: BUSINESS_MODEL_LIST,
    currencies: CURRENCIES,
    oms: [],
    exchangeImportRoles: EXCHANGE_IMPORT_ROLES(),
    exchangeExportRoles: EXCHANGE_EXPORT_ROLES()
  }

  salesList1: Sales[] = [{
    name: localStorage.getItem('ng_philips_username'),
    email: localStorage.getItem('ng_philips_code1')
  }];
  salesList0: Sales[] = [];
  isSearchLoading: boolean = false

  isExpand: boolean = true; // 控制元素展开收起


  getbigAreas(index) {
    const cycleGroup = this.orders.at(index).get('cycleGroup') as FormControl
    const cycleGroupBigAreaMap = this.spService.cycleGroupBigAreaMap
    if (cycleGroup && cycleGroupBigAreaMap[cycleGroup.value]) {
      return cycleGroupBigAreaMap[cycleGroup.value]
    } else {
      return []
    }
  }

  /*
  * 获取产品线列表
  * */
  get bmcList() {
    const bg = this.orders.at(0).get('bg') as FormControl
    return this.spService.bmcList.filter((bmc) => bmc.bg === bg.value)
  }
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
    this.currentImportIndex = index
    if (index === 0) {
     this.selectOptions.bigArea0 = this.getbigAreas(0)
    }
    if (index === 1) {
      this.selectOptions.bigArea1 = this.getbigAreas(1)
    }
  }

  onShowSelectHospitalModal(index) {
    this.currentImportIndex = index
    this.selectHospital.showModal()
  }

  onSelectHospital(hospital: Hospital) {
    const { no, customerName } = hospital
    this.orders.at(this.currentImportIndex).patchValue({
      hospitalNo: no,
      hospitalName: customerName,
    })
    this.onCalcProjectName(0)
  }

  onClearHospital(index) {
    this.orders.at(index).patchValue({
      hospitalNo: null,
      hospitalName: null,
    })
  }

  onShowReferenceModal(index, needCreateUser = true) {
    this.currentImportIndex = index
    this.selectReference.showModal(needCreateUser)
  }
  onHideReferenceModal() {
    this.selectReference.onHideModal()
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
      createUser,
      logistician,
      marketBundleQuantity
    } = reference
    this.salesList0 = [];
    this.salesList0.push({
      name: createUser,
      email: createUser
    })
    if (distributor) {
      this.showDealerArea[this.currentImportIndex] = true
    }
    if (this.currentImportIndex === 0) {
      this.isCreateUser[1] = createUser === getLoginUserCode1();
      this.referenceImport0 = true
    } else {
      this.referenceImport1 = true
    }
    switch (this.currentImportIndex) {
      case 0:
        if (this.orders.at(1).get('bmc').value && (this.orders.at(1).get('bmc').value !== bmc)) {
          this.message.error('bmc不一致,请重新选择')
          return
        }
        break
      case 1:
        if (this.orders.at(0).get('bmc').value && (this.orders.at(0).get('bmc').value !== bmc)) {
          this.message.error('bmc不一致,请重新选择')
          return
        }
        break
    }


    this.disableField(this.currentImportIndex)
    this.orders.at(this.currentImportIndex).patchValue({
      orderType,
      referenceId,
      projectName,
      productType: productModel,
      sapOrderNo: sap,
      cycleGroup: team,
      bigArea: region,
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
        quantity: marketBundleQuantity}],
      om: logistician,
      saleEmail: createUser
    })
    this.onCheckExchangeType();

  }

  ngOnInit(): void {
    if (this.editable && this.orders.at(0).value.saleEmail) {
      this.salesList0.push({
        name: this.orders.at(0).value.saleEmail,
        email: this.orders.at(0).value.saleEmail
      })
    }
    if (this.editable && this.orders.at(0).value.bigArea) {
      this.onBigAreaChange(this.orders.at(0).value.cycleGroup,0)
    }
    if (this.editable && this.orders.at(1).value.bigArea) {
      this.onBigAreaChange(this.orders.at(1).value.cycleGroup,1)
    }
    // 自动带入销售和leader邮箱
    this.orders.at(1).patchValue({
      saleEmail: getLoginUserCode1()
    })
    this.salesChange(1)
    this.orders.at(1).get('saleEmail').disable();

    // 是否显示合同金额
    this.checkMoney(0)
    this.checkMoney(1)
    console.log(this.isCreateUser)
    this.exchangeMapping(this.exchangeInfo.value.exchangeMethod);
    this.exchangeInfo.get('exchangeMethod').valueChanges.subscribe(next => {
      this.exchangeMapping(next);
    })
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
      this.salesList0 = data;
      this.isSearchLoading = false;
    });
    // 放前面会影响数据填充
    if (this.editable){
      this.setLeaderEmailList(0)
      this.setLeaderEmailList(1)
      if (this.orders.at(0).get('referenceId').value) {
        this.referenceImport0 = true
        this.disableField(0)
      }
      if (this.orders.at(1).get('referenceId').value) {
        this.referenceImport1 = true
        this.disableField(1)
      }
    }
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
    this.checkMoney(index)
  }
  async getLeaderEmail(index){
    this.orders.controls.forEach((value , groupIndex) => {
      if (index === groupIndex) {
        value.patchValue({
          districtLeader: null,
          salesLeader: null
        })
      }
    })

    const districtLeaders = await this.spService.getCustomizeEmail(this.getDistrictList('District Leader', undefined, index));
    const salesLeaderLists = await this.spService.getCustomizeEmail(this.getDistrictList('Sales Leader', undefined, index));
    const productSalesLists = await this.spService.getCustomizeEmail(this.getDistrictList('Product Sales Manager', this.orders.at(index).get('bmc').value, index))

    await this.orders.at(index).patchValue({
      districtLeader: districtLeaders[0].approverEmail,
      salesLeader: salesLeaderLists[0].approverEmail,
      productSalesMgr: productSalesLists[0].approverEmail,
    })
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
    let outputCurrency = this.orders.at(0).get('currency').value
    let inputCurrency = this.orders.at(1).get('currency').value
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

  onBMCChange(index) {
    this.bmcCheck(index)
  }

  /*
  * @description 获取email
  * @params {String} approverRole
  * @params {String} productBmc : 只有 Product Sales Manager 邮箱 需要该参数
  * */
  getDistrictList(approverRole, productBmc = undefined, index) {
    switch (index) {
      case 0:
        return {
          initiatorEmail: this.orders.at(0).get('saleEmail').value,
          initiatorRole: 'Sales Rep/Mgr',
          approverRole,
          productBmc
        }
      case 1:
        return  {
          initiatorEmail: localStorage.ng_philips_code1,
          initiatorRole: localStorage.roleCode,
          approverRole,
          productBmc
        };
      default:
        return [];
    }
  }
  get orders() {
    return this.formValues.get('orders') as FormArray
  }

  /*
  * @description: 销售邮箱变化
  * */
  referenceImport0: boolean = false;
  referenceImport1: boolean = false;
  onSearchSales(keyword: string) {
    this.isSearchLoading = true
    this.searchChange$.next(keyword)
  }

  expand() {
    this.isExpand = !this.isExpand
  }

  exchangeMapping(value){
    switch (value) {
      case '互换':
        this.orders.at(0).patchValue({
          exchangeRole: '转出/转入'
        });
        this.orders.at(1).patchValue({
          exchangeRole: '转出/转入'
        });
        break;
      case '单向':
        this.orders.at(0).patchValue({
          exchangeRole: '转出'
        });
        this.orders.at(1).patchValue({
          exchangeRole: '转入'
        });
        break;
    }
  }

   async setLeaderEmailList(index){
    this.districtList[index] = await this.spService.getUserByRole('District Leader')
    this.salesLeaderList[index] = await this.spService.getUserByRole('Sales Leader')
    this.productSalesList[index] = await this.spService.getUserByRole('Product Sales Manager')
  }

  async checkMoney(index) {
    const code = localStorage.getItem('roleCode')
    const currEmail = getLoginUserCode1() as string
    const transSale = this.orders.at(index).get('saleEmail').value as string;
    const transDistrict = this.orders.at(index).get('districtLeader').value as string;
    const transSalesLeader = this.orders.at(index).get('salesLeader').value as string;
    if (
      (code === 'Sales Rep/Mgr' || code === 'District Leader' || code === 'Sales Support' || code === 'Sales Leader') &&
      currEmail != transSale && currEmail !== transSalesLeader && currEmail !== transDistrict
    ) {
      this.isCreateUser[index] = false
    } else {
      this.isCreateUser[index] = true
    }
  }

  disableField(index) {
    let disabledFieldsList = [
      'orderType',
      'productType',
      'bmc',
      'bg',
      'cycleGroup',
      'bigArea',
      'businessModel',
      'hospitalName',
      'hospitalNo',
      'projectName',
      'sapOrderNo',
      'orderAmount',
      'currency',
      'saleEmail',
      'om']
    disabledFieldsList.forEach(item => {
      this.orders.at(index).get(item).disable()
    })
  }

  bmcCheck(index) {
    switch (index) {
      case 0:
        if (this.orders.at(1).get('bmc').value && (this.orders.at(1).get('bmc').value !== this.orders.at(0).get('bmc').value)) {
          this.message.error('bmc不一致,请重新选择')
          return true
        };
        return false
      case 1:
        if (this.orders.at(0).get('bmc').value && (this.orders.at(0).get('bmc').value !== this.orders.at(1).get('bmc').value)) {
          this.message.error('bmc不一致,请重新选择')
          return true
        }
        return false
    }
  }

}
