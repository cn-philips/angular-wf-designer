import { Component, OnInit, Input } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

import {
  BG_LIST,
  US_PRODUCT_LIST,
  BG_BMC_MAP,
} from "../../../../special-approval.constants";
import { SpecialApprovalService } from "../../../../special-approval.service";
@Component({
  selector: "special-approval-lcamendment-order-info",
  templateUrl: "./lc-amendment.component.html",
  styleUrls: ["./lc-amendment.component.scss"],
})
export class LcAmendmentOrderInfoComponent implements OnInit {
  constructor(private spService: SpecialApprovalService) {}

  @Input() basicInfo: FormGroup;
  @Input() formValues: FormGroup;
  @Input() editable = true;

  bgBmcMap = BG_BMC_MAP

  selectOptions = {
    bgList: BG_LIST,
    usProductList: US_PRODUCT_LIST,
    orderStatusList: [],
    paymentList: [],
    modifyEntryList: [],
    cancelReasonList: [],
    iePoolList: [],
  };

  ngOnInit(): void {
    this.initSelectOptions()
  }

  get lcInfo(): FormGroup { return this.formValues.get('lcInfo') as FormGroup }
  get bg(): FormControl { return this.formValues.get('bg') as FormControl }
  get applyItem(): FormControl { return this.basicInfo.get('applyItem') as FormControl }

  initSelectOptions() {
    const promises = [
      this.spService.getOrderStatusList(),
      this.spService.getPaymentList(),
      this.spService.getModifyEntryList(),
      this.spService.getCancelReason(),
      this.spService.getIePoolList(),
    ]
    Promise.all(promises).then(
      ([orderStatusList, paymentList, modifyEntryList, cancelReasonList, iePoolList]) => {
        this.selectOptions.orderStatusList = orderStatusList
        this.selectOptions.paymentList = paymentList
        this.selectOptions.modifyEntryList = modifyEntryList
        this.selectOptions.cancelReasonList = cancelReasonList
        this.selectOptions.iePoolList = iePoolList
      }
    )
  }

  onIePoolChange(companyId) {
    if (!companyId) { return }
    const company = this.selectOptions.iePoolList.find(({ id }) => id === companyId)
    this.lcInfo.patchValue({ foreignCompanyName: company.corporateName })
  }

  //是否接受L/C discrepancy
  lcDiscrepancyModel($event) {}

  SelectItem() {}
}
