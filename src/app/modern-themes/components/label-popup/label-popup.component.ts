import {
  Component,
  ContentChildren,
  ElementRef,
  Input,
  OnInit,
  QueryList,
} from "@angular/core";
import { UtilityService } from "app/core/services";
import { LabelPopupContentDirective } from "app/modern-themes/directives/label-popup-content.directive";

@Component({
  selector: "Label-popup",
  templateUrl: "./label-popup.component.html",
  styleUrls: ["./label-popup.component.scss"],
})
export class LabelPopupComponent implements OnInit {
  @ContentChildren(LabelPopupContentDirective, { descendants: false })
  private contentTpls: QueryList<LabelPopupContentDirective>;

  contentTpl: LabelPopupContentDirective;
  @Input()
  public maxWidth: String;
  @Input()
  public width: String;
  constructor(private elementRef: ElementRef, public utils: UtilityService) {}

  ngOnInit() {
    this.elementRef.nativeElement.parentElement.style =
      "display: inline-block;width: 100%;";
  }
  ngAfterContentChecked() {
    this.contentTpl = this.contentTpls.first;
  }
}
