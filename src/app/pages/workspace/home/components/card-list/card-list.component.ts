import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "cos-card-list",
  templateUrl: "card-list.component.html",
  styleUrls: ["card-list.component.scss"],
})
export class CardListComponent implements OnInit {
  @Output() clickTab: EventEmitter<string> = new EventEmitter<string>();

  @Input() listTitle: string;

  constructor() {}

  @Input() list: any[];

  ngOnInit() {}

  changeItem(name) {
    // 点击后修改list页面title
    this.clickTab.emit(name);
  }
}
