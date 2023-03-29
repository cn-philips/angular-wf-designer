import {
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  QueryList,
  ViewChild,
} from "@angular/core";
import { TabComponent } from "./components/tab/tab.component";

@Component({
  selector: "app-tabs",
  templateUrl: "./tabs.component.html",
  styleUrls: ["./tabs.component.scss"],
})
export class TabsComponent implements OnInit {
  @ContentChildren(TabComponent, { descendants: false })
  tabs: QueryList<TabComponent>;
  @ViewChild("tabInnerWrapper")
  tabInnerWrapper: ElementRef;
  tabDOMs: any;
  containerWidth: number = 0;
  totalWidth: number = 0;

  activeIndex: number = 0;
  leavingIndex: number = -1;
  previousIndex: number = -1;
  hasScroll: boolean = true;
  left: number = 0;
  constructor() {}
  @Output("select")
  select: EventEmitter<any> = new EventEmitter();
  ngOnInit() {}
  public active(index, $event?) {
    if ($event) {
      $event.preventDefault();
      $event.stopPropagation();
    }
    this.previousIndex = this.activeIndex;
    this.leavingIndex = this.previousIndex;
    this.activeIndex = index;
    this.tabs.map((tab) => {
      tab.inactive();
    });
    this.tabs.find((item, i) => i === index).active();
    this.select.emit(index);
    if (index > this.tabs.length / 2) {
      this.scrollFocus(index + 1);
    } else if (index <= this.tabs.length / 2) {
      this.scrollFocus(index - 1);
    }
    setTimeout(() => {
      this.leavingIndex = -1;
    }, 500);
  }
  public activeId(childId){
    let tab = this.tabs.find(i=>i.id===childId)
    let index = this.tabs.toArray().indexOf(tab);
    if (index>=0) this.active(index);
  }
  scrollFocus(index) {
    if (!this.hasScroll) return;
    if (index <= 0) {
      index = 0;
    }
    let tabs = this.tabInnerWrapper.nativeElement.querySelectorAll(".tab");
    if (index >= tabs.length) {
      index = tabs.length - 1;
    }
    let width = tabs[index].offsetWidth;
    let left = tabs[index].offsetLeft;
    let containerWidth = this.tabInnerWrapper.nativeElement.offsetWidth;
    let containerLeft = this.tabInnerWrapper.nativeElement.offsetLeft;
    if (left + containerLeft > 0) {
      if (left + width < containerWidth) {
        this.left = 0;
      } else {
        this.left = (left + width) / 2;
      }
    } else if (left + containerLeft === 0) {
      this.left = 0;
    } else {
      this.left = left;
    }
  }
  scrollPre() {
    let containerWidth = this.tabInnerWrapper.nativeElement.offsetWidth;
    this.left -= containerWidth;
    if (this.left <= 0) {
      this.left = 0;
    }
  }
  scrollNext() {
    let containerWidth = this.tabInnerWrapper.nativeElement.offsetWidth;
    let containerLeft = this.tabInnerWrapper.nativeElement.offsetLeft;
    this.left += containerWidth;
    if (containerLeft + containerWidth <= containerWidth) {
      this.left = containerWidth;
    }
  }

  ngAfterContentChecked() {
    let containerOffsetWidth = this.tabInnerWrapper.nativeElement.offsetWidth;
    let containerScrollWidth = this.tabInnerWrapper.nativeElement.scrollWidth;
    if (containerOffsetWidth > 0 && containerScrollWidth > 0) {
      this.hasScroll = containerScrollWidth > containerOffsetWidth;
    } else {
      this.hasScroll = false;
    }
  }
}
