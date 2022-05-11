import { Component, OnInit, Input } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";

import { BG_LIST } from "../../../../special-approval.constants";
import { SpecialApprovalService } from "../../../../special-approval.service";
@Component({
  selector: "special-approval-lcamendment-order-info",
  templateUrl: "./lc-amendment.component.html",
  styleUrls: ["./lc-amendment.component.scss"],
})
export class LcAmendmentOrderInfoComponent implements OnInit {
  constructor(public spService: SpecialApprovalService) {}

  @Input() basicInfo: FormGroup;
  @Input() formValues: FormGroup;
  @Input() editable = true;

  selectOptions = {
    bgList: BG_LIST,
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

  get bmcList() {
    const bg = this.formValues.get('bg') as FormControl
    return this.spService.bmcList.filter((bmc) => bmc.bg === bg.value)
  }

  onCancelReasonChange(reasons: string[]) {
    const cancelReasonDesc = this.lcInfo.get('cancelReasonDesc')
    cancelReasonDesc.clearValidators()
    if (reasons.includes('sp_lc_other')) {
      cancelReasonDesc.setValidators(Validators.required)
    }
  }

  onModifyEntryChange(entries: string[]) {
    const modifyEntryDesc = this.lcInfo.get('modifyEntryDesc')
    modifyEntryDesc.clearValidators()
    if (entries.includes('sp_lc_other')) {
      modifyEntryDesc.setValidators(Validators.required)
    }
  }

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
