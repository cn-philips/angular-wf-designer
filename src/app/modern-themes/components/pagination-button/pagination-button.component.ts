import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { EventEmitter } from "@angular/core";

@Component({
  selector: "app-pagination-button",
  templateUrl: "./pagination-button.component.html",
  styleUrls: ["./pagination-button.component.scss"],
})
export class PaginationButtonComponent implements OnInit {
  constructor(el: ElementRef) {
    if (this.targetDOM) {
      // 挂载
    } else {
      // 父级
      this.targetDOM = new ElementRef(el.nativeElement.parentElement);
    }
  }

  @Input("type")
  type: string = "absolute";
  @Input("direction")
  direction: string = "next";
  @Input("disabled")
  disabled: boolean = false;
  @Input("target")
  targetDOM?: ElementRef;
  @Input("gutter")
  gutter?: number = 16;
  @Input("padding")
  padding?: number = 20;

  @Output() click = new EventEmitter();

  style = {
    margin: this.gutter + "px",
    height: `calc(100% - ${2 * this.gutter}px )`,
    padding: this.padding + "px",
  };
  ngOnInit() {}
  ngAfterViewInit() {
    if (this.type === "absolute") {
      this.targetDOM.nativeElement.style.position = "relative";
    }
  }

  handleClick($event) {
    $event.stopPropagation();
    $event.preventDefault();
    console.log("click", !this.disabled);
    if (!this.disabled) {
      this.click.emit(this.direction);
    }
  }
}
