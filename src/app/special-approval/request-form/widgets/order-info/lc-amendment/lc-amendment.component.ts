import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { FormGroup } from "@angular/forms";

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
  BIG_SMALL_AREA_LIST,
  CURRENCIES,
  STAND_WARRANTY_MONTH,
} from "../../../../special-approval.constants";
import {SpecialApprovalService} from '../../../../special-approval.service';
@Component({
  selector: "special-approval-lcamendment-order-info",
  templateUrl: "./lc-amendment.component.html",
  styleUrls: ["./lc-amendment.component.scss"],
})
export class LcAmendmentOrderInfoComponent implements OnInit {
  showDealerArea: boolean = false;

  private http: any;
  private orderstatuslist: any;//订单状态
  private paymentlist: any;  //支付方式
  private modfyentrylist: any;//修改条目
  private cancelreasonlist: any;  //取消原因
  constructor(
    private spService: SpecialApprovalService,
  ) {
  }

  @ViewChild("selectHospital") selectHospital: SelectHospitalComponent;

  @ViewChild("selectDealer") selectDealer: SelectDealerComponent;

  @ViewChild("selectReference") selectReference: SelectReferenceComponent;

  @Input() formValues: FormGroup;
  @Input() editable = true;
  @Input() bmcs = [];
  @Input() iepoollist: any=[{}];
  @Input() lcinfo: FormGroup;
  selectOptions = {
    orderTypes: ORDER_TYPES,
    bgList: BG_LIST,
    bigAreas: BIG_SMALL_AREA_LIST,
    smallAreas: [],
    businessModels: BUSINESS_MODEL_LIST,
    currencies: CURRENCIES,
  };

  onBusinessModelChange(businessModel) {
    if (businessModel === BUSINESS_MODEL.DISTRIBUTOR_DEAL) {
      this.showDealerArea = true;
    } else {
      this.showDealerArea = false;
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

  onBigAreaChange(bigArea) {
    const area = this.selectOptions.bigAreas.find(
      ({ value }) => value === bigArea
    );
    this.selectOptions.smallAreas = area ? area.children : [];
    this.formValues.patchValue({ smallArea: null });
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
    if (distributor) {
      this.showDealerArea = true;
    }
    this.formValues.patchValue({
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
      products: [
        {
          id: Date.now(),
          productType: productModel,
          wbs: "",
          itemNo: "",
          quantity: "",
          warranty: {
            stdWarrantyMonths: STAND_WARRANTY_MONTH[this.formValues.get("bg").value],
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
     this.getOrderStatusList();//订单状态列表
     this.getPaymentList();//调用支付方式列表
     this.getModifyEntryList();//修改条目
     this.getcancelReasonList();//取消原因
  }

// 获取订单状态列表
  async getOrderStatusList(){
    this.orderstatuslist = await this.spService.getOrderStatusList();
  }

  // 获取费用支付方式
  async getPaymentList(){
   this.paymentlist = await this.spService.getPaymentList();
  }

  // 获取修改条目
  async getModifyEntryList(){
    this.modfyentrylist = await this.spService.getPaymentList();
  }
  // 获取取消原因
  async getcancelReasonList() {
    this.cancelreasonlist = await this.spService.getPaymentList();
  }
}
