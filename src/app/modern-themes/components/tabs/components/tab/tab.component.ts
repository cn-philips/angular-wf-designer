import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
@Component({
  selector: "app-tab",
  templateUrl: "./tab.component.html",
  styleUrls: ["./tab.component.scss"],
})
export class TabComponent implements OnInit {
  @ViewChild("content")
  tpl: TemplateRef<any>;
  constructor() {}
  @Input()
  title: String;
  @Input()
  id: String;
  @Output("select")
  select: EventEmitter<any> = new EventEmitter();
  @Input()
  count:any = 0
  isActive: boolean = false;
  ngOnInit() {}
  active() {
    this.isActive = true;
    this.select.emit(true);
  }
  inactive() {
    this.isActive = false;
  }
  ngAfterContentChecked() {}
}
