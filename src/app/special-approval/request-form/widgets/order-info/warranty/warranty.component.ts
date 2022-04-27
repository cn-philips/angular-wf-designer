import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

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
import {
  BUSINESS_MODEL,
  BG_LIST,
  ORDER_TYPES,
  BUSINESS_MODEL_LIST,
  CYCLEGROUP_BIGAREA_LIST,
  CYCLEGROUP_BIGAREA_MAP,
  CURRENCIES,
  STAND_WARRANTY_MONTH,
} from "../../../../special-approval.constants";

@Component({
  selector: "special-approval-warranty-order-info",
  templateUrl: "./warranty.component.html",
  styleUrls: ["./warranty.component.scss"],
})
export class WarrantyOrderInfoComponent implements OnInit {
  constructor() {}

  @ViewChild("selectHospital") selectHospital: SelectHospitalComponent;

  @ViewChild("selectDealer") selectDealer: SelectDealerComponent;

  @ViewChild("selectReference") selectReference: SelectReferenceComponent;

  @Input() formValues: FormGroup;
  @Input() editable = true;
  @Input() bmcs = [];

  selectOptions = {
    orderTypes: ORDER_TYPES,
    bgList: BG_LIST,
    cycleGroups: CYCLEGROUP_BIGAREA_LIST,
    bigAreas: [],
    businessModels: BUSINESS_MODEL_LIST,
    currencies: CURRENCIES,
  };

  get bigAreas() {
    const cycleGroup = this.formValues.get('cycleGroup') as FormControl
    if (cycleGroup && CYCLEGROUP_BIGAREA_MAP[cycleGroup.value]) {
      return CYCLEGROUP_BIGAREA_MAP[cycleGroup.value]
    } else {
      return []
    }
  }

  get showDealerArea(): boolean {
    const businessModel = this.formValues.get('businessModel') as FormControl
    if (businessModel && businessModel.value === BUSINESS_MODEL.DISTRIBUTOR_DEAL) {
      return true
    } else {
      return false
    }
  }

  onCalcProjectName() {
    const { hospitalName, productType, bg } = this.formValues.getRawValue();
    if (bg === "PD&IGT") {
      return;
    }
    const res = [];
    if (hospitalName) {
      res.push(hospitalName);
    }

    if (productType) {
      res.push(productType);
    }
    this.formValues.patchValue({
      projectName: res.join("-"),
    });
  }

  onCycleGroupChange() {
    this.formValues.patchValue({ bigArea: null });
  }

  onShowSelectHospitalModal() {
    this.selectHospital.showModal();
  }

  onSelectHospital(hospital: Hospital) {
    const { no, customerName } = hospital;
    this.formValues.patchValue({
      hospitalNo: no,
      hospitalName: customerName,
    });
    this.onCalcProjectName();
  }

  onClearHospital() {
    this.formValues.patchValue({
      hospitalNo: null,
      hospitalName: null,
    });
  }

  onShowSelectDealerModal() {
    this.selectDealer.showModal();
  }

  onSelectDealer(dealer: Dealer) {
    const { dealerCode, dealerName } = dealer;
    this.formValues.patchValue({
      dealerCode: dealerCode,
      dealerName: dealerName,
    });
  }

  onClearDealer() {
    this.formValues.patchValue({
      dealerCode: null,
      dealerName: null,
    });
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
    this.formValues.patchValue({
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
          productType: productModel,
          wbs: "",
          itemNo: "",
          quantity: "",
          warranty: {
            stdWarrantyMonths:
              STAND_WARRANTY_MONTH[this.formValues.get("bg").value],
          },
        },
      ],
    });
  }

  ngOnInit(): void {
    if (this.editable) {
      this.formValues.get("hospitalName").valueChanges.subscribe(() => {
        this.onCalcProjectName();
      });

      this.formValues.get("productType").valueChanges.subscribe(() => {
        this.onCalcProjectName();
      });
    }
  }
}
