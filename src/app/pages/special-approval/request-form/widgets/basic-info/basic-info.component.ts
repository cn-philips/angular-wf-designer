import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormArray, FormGroup } from "@angular/forms";
import { NzModalService, NzMessageService } from "ng-zorro-antd";

import { APPLY_TYPE } from "../../../special-approval.constants";
import { SpecialApprovalService } from "../../../special-approval.service";

@Component({
  selector: "special-approval-basic-info",
  templateUrl: "./basic-info.component.html",
  styleUrls: ["./basic-info.component.scss"],
})
export class BasicInfoComponent implements OnInit {
  @Input() formValues: FormGroup;
  @Input() formValue: FormGroup;
  @Input() editable: boolean;
  @Input() executed: number = null;
  @Input() saleRegions = [];

  @Output() itemChange: EventEmitter<string> = new EventEmitter<string>();

  APPLY_TYPE = APPLY_TYPE;

  constructor(
    private spService: SpecialApprovalService,
    private modal: NzModalService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {}

  onSelectSystemRegion(region) {
    if (!region) {
      return;
    }
    const systemRegion = this.saleRegions.find(
      (systemRegion) => systemRegion.value === region
    );
    if (systemRegion) {
      const { modality, cycleGroup, bigArea, smallArea, team, serveTeam, funcTeamType } = systemRegion;
      this.formValues.patchValue({
        bg: modality,
        cycleGroup,
        bigArea,
        smallArea,
        team: (funcTeamType=='0'||!!!funcTeamType) ? team : serveTeam
      });
      switch (this.applyType) {
        case APPLY_TYPE.MACHINE_EXCHANGE:
          let orders = this.formValue.get('changeOrderInfos').get('orders') as FormArray
          orders.at(0).patchValue({
            approvalConfigSecond: region
          })
          break;
        case APPLY_TYPE.TRANSFER_LIB:
          const transOrder = this.formValue.get('transferLibOrders').get('orders') as FormArray
          transOrder.at(1).patchValue({
            approvalConfigSecond: region
          })
          break;
      }
    }
  }

  get applyType() {
    return this.formValues.get("applyType").value as string;
  }

  get applyItem() {
    return this.formValues.get("applyItem").value;
  }

  get applyItems() {
    return this.spService.getApplyItems(this.applyType);
  }

  get showApplyItemDesc(): boolean {
    return (
      (this.applyType === APPLY_TYPE.EXT_WARRANTY &&
        this.applyItem == "sp_warranty_apply_item_5") ||
      (this.applyType === APPLY_TYPE.LC_AMENDMENT &&
        this.applyItem == "sp_lcamendment_apply_item_5") ||
      (this.applyType === APPLY_TYPE.NONE_DIRECT_ORDER &&
        this.applyItem == "sp_nonedirectorder_apply_item_2") ||
      (this.applyType === APPLY_TYPE.ORDER_REPLACEMENT &&
        this.applyItem == "sp_orderreplacement_apply_item_5")
    );
  }

  applyItemChange(val: string) {
    this.itemChange.emit(val);
  }
} 