import {
  Component,
  ElementRef,
  ContentChildren,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { QueryList } from "@angular/core/src/render3";

@Component({
  selector: "app-dialog-panel-tab",
  templateUrl: "./dialog-panel-tab.component.html",
  styleUrls: ["./dialog-panel-tab.component.scss"],
})
export class DialogPanelTabComponent implements OnInit {
  @Input("title")
  title: string = "";
  @ViewChild("tpl")
  tplRef: TemplateRef<any>;

  constructor() {}
  ngAfterContentChecked() {}
  ngOnInit() {}
}
