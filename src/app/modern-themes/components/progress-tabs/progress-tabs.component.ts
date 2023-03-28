import {
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
} from "@angular/core";
import { ProgressTabComponent } from "./components/progress-tab/progress-tab.component";

@Component({
  selector: "app-progress-tabs",
  templateUrl: "./progress-tabs.component.html",
  styleUrls: ["./progress-tabs.component.scss"],
})
export class ProgressTabsComponent implements OnInit {
  @ContentChildren(ProgressTabComponent) tabs: QueryList<ProgressTabComponent>;
  constructor() {}

  @Input() activeId: String = "";
  @Output() tabChange = new EventEmitter<any>();
  public preActiveId: String = "";
  public activingId: String = "";
  public errorIds: String[] = [];
  @ViewChild("wrapper")
  wrapper: ElementRef;
  @ViewChild("container")
  container: ElementRef;
  hasScroll: boolean = false;
  ngOnInit() {
    this.preActiveId = this.activeId;
  }

  ngAfterContentChecked() {
    // if (!this.activeId) this.activeId = this.tabs.first.id;
    if (!this.hasScroll) this.oversize();
  }
  select(tabId, index) {
    this.preActiveId = this.activeId;
    this.activeId = tabId;
    this.tabChange.emit({ preTab: this.preActiveId, nextTab: this.activeId, activeIndex: index });
  }
  error(tabId) {
    this.errorIds.push(tabId);
    this.errorIds = this.errorIds.filter(
      (id, index) => index === this.errorIds.indexOf(id)
    );
  }
  clearError(tabId) {
    this.errorIds = this.errorIds.filter((id) => id !== tabId);
  }
  hasError(tabId) {
    return !!this.errorIds.find((id) => id !== tabId);
  }
  oversize() {
    this.hasScroll =
      this.container.nativeElement.scrollWidth >
      this.wrapper.nativeElement.clientWidth;
  }
}
