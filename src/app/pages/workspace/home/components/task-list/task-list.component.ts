import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  animate,
  animation,
  group,
  sequence,
  state,
  style,
  transition,
  trigger,
  useAnimation,
} from "@angular/animations";
import { Router } from "@angular/router";

export function myInlineMatcherFn(
  fromState: string,
  toState: string,
  element: any,
  params: { [key: string]: any }
): boolean {
  // notice that `element` and `params` are also available here
  return toState == "yes-please-animate";
}

@Component({
  selector: "cos-task-list",
  templateUrl: "task-list.component.html",
  styleUrls: ["task-list.component.scss"],
  animations: [
    trigger("openClose", [
      // ...
      state("row1", style({})),
      state("row2", style({})),
      state("row3", style({})),
      state("row4", style({})),
      state(
        "out",
        style({
          opacity: 0,
          transform: "translateX(1000px)",
        })
      ),
      // transition('in => out', [
      //   animate('0.1s', style({ opacity: 0 }))
      // ]),
      transition("* => row1" || myInlineMatcherFn, [
        animate(
          "0.3s ease-out",
          style({ opacity: 1, transform: "translateX(0px)" })
        ),
      ]),
      transition("* => row2" || myInlineMatcherFn, [
        animate(
          "0.6s ease-out",
          style({ opacity: 1, transform: "translateX(0px)" })
        ),
      ]),
      transition("* => row3" || myInlineMatcherFn, [
        animate(
          "0.9s ease-out",
          style({ opacity: 1, transform: "translateX(0px)" })
        ),
      ]),
      transition("* => row4" || myInlineMatcherFn, [
        animate(
          "1.2s ease-out",
          style({ opacity: 1, transform: "translateX(0px)" })
        ),
      ]),

      transition("row1 => *", [animate("0s ease-in", style({ opacity: 0 }))]),
      transition("row2 => *", [animate("0s ease-in", style({ opacity: 0 }))]),
      transition("row3 => *", [animate("0s ease-in", style({ opacity: 0 }))]),
      transition("row4 => *", [animate("0s ease-in", style({ opacity: 0 }))]),
    ]),
  ],
})
export class TaskListComponent implements OnInit {
  @Input() list = [];
  @Input() isLoading = false;

  @Input() listTitle: string;

  @Output() changeTab: EventEmitter<any> = new EventEmitter<any>();

  @Output() cardClick: EventEmitter<any> = new EventEmitter<any>();

  constructor(private router: Router) {}

  ngOnInit() {}

  isIn = true;
  spin: any = false;

  handleShowMore(name: string) {
    switch (name) {
      case "我的待办":
        this.router.navigate(["ecos/my-todo"]);
        break;
      case "我的已办":
        this.router.navigate(["ecos/my-done"]);
        break;
      case "我的申请":
        this.router.navigate(["ecos/my-started"]);
        break;
      case "我的草稿":
        this.router.navigate(["ecos/my-draft"]);
        break;
      case "我可查看":
        this.router.navigate(["ecos/my-view"]);
        break;
    }
  }

  currentAnimate(index: number) {
    if (index >= 0 && index < 3) {
      return "row1";
    }
    if (index >= 3 && index < 6) {
      return "row2";
    }
    if (index >= 6 && index < 9) {
      return "row3";
    }
    if (index >= 9 && index < 12) {
      return "row4";
    }
  }

  getType(item){
    let result = ''
    switch (item.type.toUpperCase()) {
      case "JDZB":
      case "OIT_MAIN":
        result = "新建进单";
        break;
      case "OIT_SUB":
        result = "新建进单";
        break;
      case "ZBSQ":
      case "BIDDING":
        result = "新建投标";
        break;
      case "PREBOOK":
        result = "新建PreBook";
        break;
      case "SPECIAL_APPROVAL":
        result = "新建特批";
        break;
    }
    return result;
  }

  viewItem(e, item) {
    e.preventDefault();
    e.stopPropagation();
    this.cardClick.emit(item);
  }

  playAnimate() {
    this.spin = true;
    this.isIn = !this.isIn;
    setTimeout(() => {
      this.spin = false;
      this.isIn = !this.isIn;
    }, 200);
  }
}
