import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { NzCarouselComponent } from "ng-zorro-antd";

export interface carouselItem {
  title: string;
  content: string;
  icon?: string;
  img: string;
  link?: string;
}
@Component({
  selector: "app-carousel",
  templateUrl: "./carousel.component.html",
  styleUrls: ["./carousel.component.scss"],
})
export class CarouselComponent implements OnInit {
  constructor(private router: Router) {}
  @ViewChild("carousel")
  carousel: NzCarouselComponent;
  @Input()
  items: carouselItem[];
  @Input()
  height: string = "50%";
  ngOnInit() {}
  public handleClick(e) {
    try {
      new URL(e);
      window.open(e, "_blank");
    } catch (ex) {
      this.router.navigate([e]);
    }
  }
  handleContentClick(e) {
    e.stopPropagation();
    // e.preventDefault();
  }
}
