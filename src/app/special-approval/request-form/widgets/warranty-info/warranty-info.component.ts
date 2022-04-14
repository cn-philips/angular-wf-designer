import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";

@Component({
  selector: "special-approval-warranty-info",
  templateUrl: "./warranty-info.component.html",
  styleUrls: ["./warranty-info.component.scss"],
})
export class WarrantyInfoComponent {
  @Input() orderInfo: FormGroup;
  @Input() editable: boolean;
  @Input() minMon: number;
  @Input() maxMon: number;
  constructor() {}
}
