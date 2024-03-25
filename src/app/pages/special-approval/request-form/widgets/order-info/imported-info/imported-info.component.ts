import { Component, Input, OnInit, ViewChild } from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { DictService } from "@core/services";
import { SpecialApprovalService } from "@pages/special-approval/special-approval.service";
import { NzMessageService, NzModalService } from "ng-zorro-antd";

import {
  APPLY_TYPE,
  BUSINESS_MODEL,
  BG_LIST,
  ORDER_TYPES,
  BUSINESS_MODEL_LIST,
  CURRENCIES,
} from "../../../../special-approval.constants";
import * as moment from 'moment'

@Component({
  selector: "app-imported-info",
  templateUrl: "./imported-info.component.html",
  styleUrls: ["./imported-info.component.scss"],
})
export class ImportedInfoComponent implements OnInit {
  @Input() editable = true;
  @Input() formValues: FormGroup;
  @Input() baseInfo: FormGroup;
  @Input() applicantEmail;

  @ViewChild("selectDealer") selectDealer;
  @ViewChild("selectImportedProduct") selectImportedProduct;
  @ViewChild("selectHospital") selectHospital;

  constructor(
    private fb: FormBuilder,
    public spService: SpecialApprovalService,
    private modal: NzModalService,
    private message: NzMessageService,
    private dictService: DictService
  ) {}

  get bigAreas() {
    const cycleGroup = this.formValues.get("cycleGroup") as FormControl;
    const cycleGroupBigAreaMap = this.spService.cycleGroupBigAreaMap;
    if (cycleGroup && cycleGroupBigAreaMap[cycleGroup.value]) {
      return cycleGroupBigAreaMap[cycleGroup.value];
    } else {
      return [];
    }
  }
  get products() {
    return this.formValues.get("oitProducts") as FormArray;
  }

  get modality() {
    return this.baseInfo.get("bg").value;
  }
  selectOptions = {
    orderTypes: ORDER_TYPES,
    bgList: BG_LIST,
    businessModels: BUSINESS_MODEL_LIST,
    currencies: CURRENCIES,
  };
  ngOnInit() {
    this.init();
  }

  onProductChange(val) {
    this.formValues.patchValue({bmcs:this.getBMCsString(val)})
  }
  onExpectedOitDateChange(val){
    if(!val) return
    let expectedOpenBiddingDate = this.formValues.get('expectedOpenBiddingDate').value
    if(expectedOpenBiddingDate&&moment(expectedOpenBiddingDate).isAfter(moment(val))){
      this.formValues.patchValue({expectedOpenBiddingDate:null})
    }
  }
  public getBMCsString(products){
    // console.log('products',products)
    if(!products) return "";
    let arr = products.map((item) => item.bmc).filter((item) => item);
    arr = arr.filter((i,index)=>arr.indexOf(i)===index);
    return arr.join(";");
  }

  init() {
    this.products.valueChanges.subscribe((val)=>this.onProductChange(val))
    this.formValues.get('expectedOitDate').valueChanges.subscribe((val)=>this.onExpectedOitDateChange(val))
    if (this.products.length === 0) {
      this.addProductRow();
    }
  }
  public getData(){
    return this.formValues.value;
  }
  validate(){
    this.baseInfo.get('reason').clearValidators();
    this.baseInfo.get('reason').markAsDirty();
    this.baseInfo.get('reason').updateValueAndValidity();
    if(this.formValues.get('businessModel').value=='distributor'){
      this.formValues.get('dealerCode').setValidators([Validators.required]);
      this.formValues.get('dealerName').setValidators([Validators.required]);
    }else{
      this.formValues.get('dealerCode').clearValidators();
      this.formValues.get('dealerName').clearValidators();
    }

    this.formValues.get('dealerCode').updateValueAndValidity();
    this.formValues.get('dealerName').updateValueAndValidity();
    for(const i in this.formValues.controls){
      this.formValues.controls[i].markAsDirty();
      this.formValues.controls[i].updateValueAndValidity();
    }
    return this.formValues.disabled || this.formValues.valid
  }
  onClearDealer() {
    this.formValues.patchValue({ dealName: null,dealCode: null });
  }

  onShowSelectDealerModal() {
    this.selectDealer.show({ invalid: true }, true);
  }

  onCycleGroupChange() {
    this.formValues.patchValue({ bigArea: null });
  }

  onShowSelectHospitalModal() {
    this.selectHospital.show({}, true);
  }
  onShowSelectImportedProductModal(index: number) {
    this.selectImportedProduct.show({}, true, index);
  }

  onDealSelect(val) {
    //经销商选择回显
    const { dealercode, mdtdealername } = val;
    this.formValues.patchValue({
      dealerCode: dealercode,
      dealerName: mdtdealername,
    });
  }
  onHospitalselect(val) {
    const { customerName, no } = val;
    this.formValues.patchValue({
      hospitalName: customerName,
      hospitalNo: no,
    });
  }
  onImportedProductselect(val) {
    this.products.at(val.index).patchValue({
      model: val.name,
      bmc: val.bmc,
      modality: val.modality,
      quantity: null
    });
  }
  addProductRow() {
    this.products.push(
      this.fb.group({
        model: [null, [Validators.required]], // 产品型号
        bmc: [null, [Validators.required]], // 产品线
        modality:[null,[Validators.required]], // Modality
        quantity: [null, [Validators.required]], // 数量
      })
    );
  }
  removeProductRow(index) {
    this.products.removeAt(index);
  }
  disabledExpectedBiddingDate=(selectingDate:Date):boolean=>{
    return  moment(selectingDate).toDate().setHours(0,0,0,0) > moment(this.formValues.get('expectedOitDate').value).toDate().setHours(0,0,0,0);
  }
}
