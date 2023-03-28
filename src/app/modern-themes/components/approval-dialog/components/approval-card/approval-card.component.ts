import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
@Component({
  selector: "app-approval-card",
  templateUrl: "./approval-card.component.html",
  styleUrls: ["./approval-card.component.scss"],
})
export class ApprovalCardComponent implements OnInit {
  @Input("disabled")
  disabled: boolean = false;
  @Input("backgroundColor")
  backgroundColor: string = "#FF7F97";
  bgColor: string = "#fff";
  className: any = {
    "approval-card-wrapper": true,
    active: false,
    disabled: this.disabled,
  };
  constructor() {}

  @Output("click") click = new EventEmitter<any>();

  ngOnInit() {}
  handleHover() {
    if (!this.disabled) {
      this.className.active = true;
      this.bgColor = this.backgroundColor;
    }
  }
  handleBlur() {
    if (!this.disabled) {
      this.className.active = false;
      this.bgColor = "#fff";
    }
  }
  handleClick() {
    if (!this.disabled) {
      this.click.emit();
    }
  }
}
