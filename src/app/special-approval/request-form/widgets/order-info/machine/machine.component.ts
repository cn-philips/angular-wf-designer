import { Component, Input, OnInit, ViewChild } from "@angular/core";
import {
  APPLY_TYPE,
  BUSINESS_MODEL,
  BG_LIST,
  ORDER_TYPES,
  BUSINESS_MODEL_LIST,
  CYCLEGROUP_BIGAREA_LIST,
  CYCLEGROUP_BIGAREA_MAP,
  CURRENCIES,
  STAND_WARRANTY_MONTH,
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
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";
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
export class MachineComponent implements OnInit {
  @Input() salesLeaders: string[];
  @Input() districtLeaders: string[];

  selectIndex: number;

  searchChange$ = new BehaviorSubject("");

  showDealerArea: boolean = false;

  salesList: Sales[] = [
    {
      name: localStorage.getItem("ng_philips_username"),
      email: localStorage.getItem("ng_philips_code1"),
    },
  ];
  isSearchLoading: boolean = false;

  constructor(
    private spService: SpecialApprovalService,
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

  APPLY_TYPE = APPLY_TYPE;

  @Input() bmcs = [];

  selectOptions = {
    orderTypes: ORDER_TYPES,
    bgList: BG_LIST,
    cycleGroups: CYCLEGROUP_BIGAREA_LIST,
    cycleGroupBigAreaMap: CYCLEGROUP_BIGAREA_MAP,
    bigAreas: [],
    businessModels: BUSINESS_MODEL_LIST,
    currencies: CURRENCIES,
    oms: [],
  };

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
    if (bg === "PD&IGT") {
      return;
    }
    const res = [];
    if (this.orders.at(this.selectIndex).get("hospitalName").value) {
      res.push(this.orders.at(this.selectIndex).get("hospitalName").value);
    }

    if (productType) {
      res.push(productType);
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

  onClearHospital() {
    this.orders.at(this.selectIndex).patchValue({
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
    } = reference;
    if (distributor) {
      this.showDealerArea = true;
    }
    this.orders.at(this.selectIndex).patchValue({
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
      products: [
        {
          id: Date.now(),
          productType: productModel,
          wbs: "",
          itemNo: "",
          quantity: "",
          stdWarrantyMonths:
            STAND_WARRANTY_MONTH[
              this.orders.at(this.selectIndex).get("bg").value
            ],
        },
      ],
    });
  }

  get orders() {
    return this.formValues.get("orders") as FormArray;
  }

  ngOnInit(): void {
    this.initOMUsers();
    // this.initSales()
    this.getLeaderEmail();
    this.formValues.get("exchangeMethod").valueChanges.subscribe(() => {
      console.log(this.formValues);
    });
    if (!this.editable) {
      this.orders.at(0).patchValue({
        salesLeader: this.salesLeaders[0],
        districtLeader: this.districtLeaders[0],
      });
      this.orders.at(1).patchValue({
        salesLeader: this.salesLeaders[1],
        districtLeader: this.districtLeaders[1],
      });
    }
    this.orders.at(0).patchValue({
      saleEmail: localStorage.getItem("ng_philips_code1"),
    });
    this.orders.at(1).patchValue({
      saleEmail: localStorage.getItem("ng_philips_code1"),
    });
    if (this.editable) {
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
          this.onCalcProjectName();
        });
      this.orders
        .at(1)
        .get("productType")
        .valueChanges.subscribe(() => {
          this.onCalcProjectName();
        });
    }
    console.log(this.orders);

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
      this.salesList = data;
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

  async salesChange() {
    this.getLeaderEmail();
  }
  async getLeaderEmail() {
    this.orders.controls.forEach((value) => {
      value.patchValue({
        districtLeader: null,
        salesLeader: null,
      });
    });
    const params = {
      initiatorEmail: localStorage.ng_philips_code1,
      initiatorRole: localStorage.roleCode,
      approverRole: "District Leader",
    };
    const params1 = {
      initiatorEmail: localStorage.ng_philips_code1,
      initiatorRole: localStorage.roleCode,
      approverRole: "Sales Leader",
    };
    this.districtList = await this.spService.getCustomizeEmail(params);
    this.salesLeaderList = await this.spService.getCustomizeEmail(params1);
  }

  onSearchSales(keyword: string) {
    this.isSearchLoading = true;
    this.searchChange$.next(keyword);
  }
}
