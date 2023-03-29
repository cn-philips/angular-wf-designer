import {
  QueryList,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  OnInit,
  TemplateRef,
} from "@angular/core";
import { ProgressTabContentDirective } from "@app/modern-themes/directives/progress-tab-content.directive";
import { ProgressTabIconDirective } from "@app/modern-themes/directives/progress-tab-icon.directive";
import { ProgressTabTitleDirective } from "@app/modern-themes/directives/progress-tab-title.directive";

@Component({
  selector: "app-progress-tab",
  templateUrl: "./progress-tab.component.html",
  styleUrls: ["./progress-tab.component.scss"],
})
export class ProgressTabComponent implements OnInit {
  @ContentChildren(ProgressTabTitleDirective, { descendants: false })
  private titleTpls: QueryList<ProgressTabTitleDirective>;
  @ContentChildren(ProgressTabContentDirective, { descendants: false })
  private contentTpls: QueryList<ProgressTabContentDirective>;
  @ContentChildren(ProgressTabIconDirective, { descendants: false })
  private iconTpls: QueryList<ProgressTabIconDirective>;
  titleTpl: ProgressTabTitleDirective;
  contentTpl: ProgressTabContentDirective;
  iconTpl: ProgressTabIconDirective;
  id: String;
  constructor(private elementRef: ElementRef) {
    this.id = elementRef.nativeElement.getAttribute("id");
  }

  ngOnInit() {}
  ngAfterContentChecked() {
    this.titleTpl = this.titleTpls.first;
    this.contentTpl = this.contentTpls.first;
    this.iconTpl = this.iconTpls.first;
  }
}
