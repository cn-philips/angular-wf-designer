import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {
  APPLY_TYPE,
  BUSINESS_MODEL,
  BG_LIST,
  ORDER_TYPES,
  BUSINESS_MODEL_LIST,
  CURRENCIES,
} from "../../../../special-approval.constants";
import { SpecialApprovalService } from "../../../../special-approval.service";
import {
  Hospital,
  SelectHospitalComponent,
} from "../../select-hospital/select-hospital.component";
import {
  Dealer,
  SelectDealerComponent,
} from "../../select-dealer/select-dealer.component";
import {
  Reference,
  SelectReferenceComponent,
} from "../../select-reference/select-reference.component";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { BehaviorSubject, Observable } from "rxjs";
import { debounceTime, map, switchMap } from "rxjs/operators";
import { HttpService } from "../../../../../services";

interface Sales {
  email: string;
  name: string;
}

@Component({
  selector: "special-approval-machineexcange-order-info",
  templateUrl: "./machine.component.html",
  styleUrls: ["./machine.component.scss"],
})
export class MachineComponent implements OnInit, OnChanges {
  @Input() salesLeaders: string[];
  @Input() districtLeaders: string[];

  selectIndex: number = 0;

  searchChange$ = new BehaviorSubject("");

  salesList: Sales[] = [
    {
      name: localStorage.getItem("ng_philips_username"),
      email: localStorage.getItem("ng_philips_code1"),
    },
  ];
  salesList1: Sales[] = [];
  isSearchLoading: boolean = false;

  constructor(
    public spService: SpecialApprovalService,
    private fb: FormBuilder,
    private http: HttpService
  ) {}

  @ViewChild("selectHospital") selectHospital: SelectHospitalComponent;

  @ViewChild("selectDealer") selectDealer: SelectDealerComponent;

  @ViewChild("selectReference") selectReference: SelectReferenceComponent;

  @Input() formValues: FormGroup;
  @Input() editable = true;
  @Input() applyType: string;
  @Input() applyItem: string;
  @Input() showFeedbackTab = false;

  APPLY_TYPE = APPLY_TYPE;

  selectOptions = {
    orderTypes: ORDER_TYPES,
    bgList: BG_LIST,
    bigAreas: [],
    businessModels: BUSINESS_MODEL_LIST,
    currencies: CURRENCIES,
    oms: [],
  };

  get bmcList() {
    const bg = this.orders.at(0).get('bg') as FormControl
    return this.spService.bmcList.filter((bmc) => bmc.bg === bg.value)
  }

  get showOrder1DealerArea(): boolean {
    const businessModel = this.orders.at(0).get('businessModel')
    if (businessModel && businessModel.value === BUSINESS_MODEL.DISTRIBUTOR_DEAL) {
      return true
    } else {
      return false
    }
  }

  get showOrder2DealerArea(): boolean {
    const businessModel = this.orders.at(1).get('businessModel')
    if (businessModel && businessModel.value === BUSINESS_MODEL.DISTRIBUTOR_DEAL) {
      return true
    } else {
      return false
    }
  }

  onCalcProjectName() {
    const { hospitalName, productType, bg } = this.orders.at(
      this.selectIndex
    ).value;
    // if (bg === "PD&IGT") {
    //   return;
    // }
    const res = [];
    if (this.orders.at(this.selectIndex).get("hospitalName").value) {
      res.push(this.orders.at(this.selectIndex).get("hospitalName").value);
    }

    if (this.orders.at(this.selectIndex).get('productType').value) {
      res.push(this.orders.at(this.selectIndex).get('productType').value)
    }

    this.orders.at(this.selectIndex).patchValue({
      projectName: res.join("-"),
    });
  }

  onCycleGroupChange(index) {
    this.selectIndex = index;
    this.orders.at(this.selectIndex).patchValue({ bigArea: null });
  }

  onShowSelectHospitalModal(index) {
    this.selectIndex = index;
    this.selectHospital.showModal();
  }

  onSelectHospital(hospital: Hospital) {
    const { no, customerName } = hospital;
    this.orders.at(this.selectIndex).patchValue({
      hospitalNo: no,
      hospitalName: customerName,
    });
    this.onCalcProjectName();
  }

  onClearHospital(index) {
    this.orders.at(index).patchValue({
      hospitalNo: null,
      hospitalName: null,
    });
  }

  onShowSelectDealerModal(index) {
    this.selectIndex = index;
    this.selectDealer.showModal();
  }

  onSelectDealer(dealer: Dealer) {
    const { dealerCode, dealerName } = dealer;
    this.orders.at(this.selectIndex).patchValue({
      dealerCode: dealerCode,
      dealerName: dealerName,
    });
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
    this.selectReference.showModal();
  }

  onSelectReference(reference: Reference) {
    const {
      referenceId,
      cosMainId,
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
      logistician,
      marketBundleQuantity
    } = reference;
    this.orders.at(this.selectIndex).patchValue({
      orderType,
      referenceId,
      cosMainId,
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
      om: logistician,
      products: [
        {
          id: Date.now(),
          productType: productModel,
          wbs: "",
          itemNo: "",
          quantity: marketBundleQuantity,
        },
      ],
    });
  }

  get orders() {
    return this.formValues.get("orders") as FormArray;
  }

  get exchangeMethod() {
    return this.formValues.get('exchangeMethod')
  }

  ngOnInit(): void {
    this.initOMUsers()

    if (this.editable && this.orders.at(1).get('saleEmail').value) {
      this.salesList1.push({
        name: this.orders.at(1).get('saleEmail').value,
        email: this.orders.at(1).get('saleEmail').value
      })
    }
    if (this.editable) {
      this.getLeaderEmail(localStorage.getItem('ng_philips_code1'), 0);

      this.orders
        .at(0)
        .get("hospitalName")
        .valueChanges.subscribe(() => {
          this.onCalcProjectName();
        });
      this.orders
        .at(1)
        .get("hospitalName")
        .valueChanges.subscribe(() => {
          this.onCalcProjectName();
        });

      this.orders
        .at(0)
        .get("productType")
        .valueChanges.subscribe(() => {
          this.selectIndex = 0
          this.onCalcProjectName();
        });
      this.orders
        .at(1)
        .get("productType")
        .valueChanges.subscribe(() => {
          this.selectIndex = 1
          this.onCalcProjectName();
        });
    }

    const getSaleList = (keyword: string) => {
      if (!keyword) {
        this.isSearchLoading = false;
        return [];
      }
      let data = this.http
        .get(
          `/act/role/getUsersByRoleAndEmail?role=` +
            "Sales Rep/Mgr" +
            "&email=" +
            keyword
        )
        .pipe(map((res: any) => res.data as Sales[]));
      return data;
    };

    const optionList$: Observable<Sales[]> = this.searchChange$
      .asObservable()
      .pipe(debounceTime(500))
      .pipe(switchMap(getSaleList));
    optionList$.subscribe((data) => {
      this.salesList1 = data;
      this.isSearchLoading = false;
    });
  }

  // 初始化OM列表
  async initOMUsers() {
    const users = await this.spService.getOMUsers();
    this.selectOptions.oms = users.map(({ name, email }) => ({
      label: name,
      value: email,
    }));
  }

  districtList: any = [];
  salesLeaderList: any = [];

  async salesChange(email, index) {
  this.getLeaderEmail(email, index)
  }

  async getLeaderEmail(email: string, index: number){
    // this.orders.controls.forEach(value => {
    //   value.patchValue({
    //     districtLeader: null,
    //     salesLeader: null
    //   })
    // })
    const district = {
      initiatorRole: 'Sales Rep/Mgr',
      approverRole: "District Leader",
    };
    const sales = {
      initiatorRole: 'Sales Rep/Mgr',
      approverRole: 'Sales Leader'
    }
    const user = {
      initiatorEmail: localStorage.ng_philips_code1,
    }
    const user1 = {
      initiatorEmail: email,
    }
    switch (index) {
      case 0:
        const districtLeader = await this.spService.getCustomizeEmail(Object.assign(user, district));
        const salesLeader = await this.spService.getCustomizeEmail(Object.assign(user, sales));
        this.orders.at(0).patchValue({
          districtLeader: districtLeader[0].approverEmail,
          salesLeader: salesLeader[0].approverEmail
        })
        break;
      case 1:
        const districtLeader1 = await this.spService.getCustomizeEmail(Object.assign(user1, district));
        const salesLeader1 = await this.spService.getCustomizeEmail(Object.assign(user1, sales));
        this.orders.at(1).patchValue({
          districtLeader: districtLeader1[0].approverEmail,
          salesLeader: salesLeader1[0].approverEmail
        })
        break;
    }


  }

  onSearchSales(keyword: string, index: number) {
    this.isSearchLoading = true
    this.searchChange$.next(keyword)
  }

  //监测 @Input值的变化
  ngOnChanges(changes: SimpleChanges): void {
    //是否是反馈信息节点
    if (changes.showFeedbackTab && changes.showFeedbackTab.currentValue) {
      this.orders.at(0).get('actualSaleDate').enable();
      this.orders.at(0).get('actualSaleDate').setValidators([Validators.required]);
    }
  }

}
