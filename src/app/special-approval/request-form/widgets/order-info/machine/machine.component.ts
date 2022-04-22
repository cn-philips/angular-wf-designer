import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {
  APPLY_TYPE,
  BUSINESS_MODEL,
  BG_LIST,
  ORDER_TYPES,
  BUSINESS_MODEL_LIST,
  BIG_SMALL_AREA_LIST,
  CURRENCIES,
  STAND_WARRANTY_MONTH,
} from '../../../../special-approval.constants';
import {SpecialApprovalService} from '../../../../special-approval.service';
import {Hospital, SelectHospitalComponent} from '../../select-hospital/select-hospital.component';
import {Dealer, SelectDealerComponent} from '../../select-dealer/select-dealer.component';
import {Reference, SelectReferenceComponent} from '../../select-reference/select-reference.component';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
@Component({
  selector: 'special-approval-machineexcange-order-info',
  templateUrl: './machine.component.html',
  styleUrls: ['./machine.component.scss']
})
export class MachineComponent implements OnInit {


  selectIndex: number;

  showDealerArea: boolean = false

  salesList: any = [];

  constructor(
    private spService: SpecialApprovalService,
    private fb: FormBuilder,
  ) { }


  @ViewChild('selectHospital') selectHospital: SelectHospitalComponent

  @ViewChild('selectDealer') selectDealer: SelectDealerComponent

  @ViewChild('selectReference') selectReference: SelectReferenceComponent

  @Input() formValues: FormGroup
  @Input() editable = true
  @Input() applyType: string
  @Input() applyItem: string

  APPLY_TYPE = APPLY_TYPE

  @Input() bmcs = []

    selectOptions = {
    orderTypes: ORDER_TYPES,
    bgList: BG_LIST,
    bigAreas: BIG_SMALL_AREA_LIST,
    smallAreas: [],
    businessModels: BUSINESS_MODEL_LIST,
    currencies: CURRENCIES,
    oms: []
  }

  onBusinessModelChange(businessModel) {
    if (businessModel === BUSINESS_MODEL.DISTRIBUTOR_DEAL) {
      this.showDealerArea = true
    } else {
      this.showDealerArea = false
    }
  }

  onProductTypeChange(value) {
    console.log('产品型号');
    console.log(value);
  }

  onCalcProjectName() {
    const { hospitalName, productType, bg } = this.orders.at(this.selectIndex).value;
    if (bg === 'PD&IGT') {
      return
    }
    const res = []
    if (this.orders.at(this.selectIndex).get('hospitalName').value) {
      res.push(this.orders.at(this.selectIndex).get('hospitalName').value)
    }

    if (productType) {
      res.push(productType)
    }

    this.orders.at(this.selectIndex).patchValue({
      projectName: res.join('-')
    })
  }

  onBigAreaChange(bigArea, index) {
    this.selectIndex = index
    const area = this.selectOptions.bigAreas.find(({ value }) => value === bigArea)
    this.selectOptions.smallAreas = area ? area.children : []
    this.orders.at(this.selectIndex).patchValue({ bigArea: null })
  }

  onShowSelectHospitalModal(index) {
    this.selectIndex = index;
    this.selectHospital.showModal()
  }

  onSelectHospital(hospital: Hospital) {
    const { no, customerName } = hospital
    this.orders.at(this.selectIndex).patchValue({
      hospitalNo: no,
      hospitalName: customerName,
    })
    this.onCalcProjectName()
  }

  onClearHospital() {
    this.orders.at(this.selectIndex).patchValue({
      hospitalNo: null,
      hospitalName: null,
    })
  }

  onShowSelectDealerModal(index) {
    this.selectIndex = index
    this.selectDealer.showModal()
  }

  onSelectDealer(dealer: Dealer) {

    const { dealerCode, dealerName } = dealer
    this.orders.at(this.selectIndex).patchValue({
      dealerCode: dealerCode,
      dealerName: dealerName,
    })

  }

  onClearDealer() {
    // this.orders.controls.forEach(val => {
    //   val.patchValue({
    //     dealerCode: null,
    //     dealerName: null,
    //   });
    // });
  }

  onShowReferenceModal() {
    this.selectReference.showModal()
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
    } = reference
    if (distributor) {
      this.showDealerArea = true
    }
    this.orders.at(this.selectIndex).patchValue({
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
        quantity: "",
        stdWarrantyMonths: STAND_WARRANTY_MONTH[this.orders.at(this.selectIndex).get('bg').value] }],
    })
  }

  get orders() {
    return this.formValues.get('orders') as FormArray
  }

  ngOnInit(): void {
    this.initOMUsers()
    this.initSales()
    this.getLeaderEmail()
    this.orders.at(0).patchValue({
      saleEmail: localStorage.getItem('ng_philips_code1')
    })
    this.orders.at(1).patchValue({
      saleEmail: localStorage.getItem('ng_philips_code1')
    })
    if (this.editable) {
      this.orders.at(this.selectIndex).get('hospitalName').valueChanges.subscribe(() => {
        this.onCalcProjectName()
      })

      this.orders.at(this.selectIndex).get('productType').valueChanges.subscribe(() => {
        this.onCalcProjectName()
      })
    }
    console.log(this.orders);
  }

  // 初始化OM列表
  async initOMUsers() {
    const users = await this.spService.getOMUsers()
    this.selectOptions.oms = users.map(({ name, email }) => ({ label: name, value: email }))
  }
  // 初始化销售列表
  async initSales() {
    let list = await this.spService.getSaleEmail();
    for (let i = 0; i < list.length; i++) {
      this.salesList[i] = list[i].email
    }
  }

  districtList: any = []
  salesLeaderList: any = []

  async salesChange() {
  this.getLeaderEmail()
  }
  async getLeaderEmail(){
    this.orders.controls.forEach(value => {
      value.patchValue({
        districtLeader: null,
        salesLeader: null
      })
    })
    const params = {
      initiatorEmail: localStorage.ng_philips_code1,
      initiatorRole: localStorage.roleCode,
      approverRole: 'District Leader'
    }
    const params1 = {
      initiatorEmail: localStorage.ng_philips_code1,
      initiatorRole: localStorage.roleCode,
      approverRole: 'Sales Leader'
    }
    this.districtList = await this.spService.getCustomizeEmail(params);
    this.salesLeaderList = await this.spService.getCustomizeEmail(params1);

  }

}
