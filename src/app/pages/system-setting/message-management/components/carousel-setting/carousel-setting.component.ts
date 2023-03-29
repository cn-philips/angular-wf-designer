import { Component, OnInit, ViewChild } from "@angular/core";
import { MessageService } from "../../services/message.service";
import { carousel } from "../interfaces/iCarousel";
import { messageTypeEnum } from "../interfaces/iMessage";
import { notificationTypeEnum } from "../interfaces/iNotification";
import { CarouselFormDialogComponent } from "./form/carousel-form-dialog/carousel-form-dialog.component";

@Component({
  selector: "app-carousel-setting",
  templateUrl: "./carousel-setting.component.html",
  styleUrls: ["./carousel-setting.component.scss"],
})
export class CarouselSettingComponent implements OnInit {
  constructor(private messageService: MessageService) {}
  messageType: messageTypeEnum = messageTypeEnum.Carousel;
  data: carousel[];
  pageIndex: number = 1;
  pageSize: number = 20;
  @ViewChild("dialog")
  dialog: CarouselFormDialogComponent;
  ngOnInit() {
    this.searchData(true);
  }
  searchData(isReset: boolean = false) {
    if (isReset) this.reset();

    this.messageService
      .queryMessage(this.pageIndex, this.pageSize, this.messageType)
      .subscribe(({ total, rows, page, pages }) => {
        this.data = rows;
      });
  }
  handleDelete(item: carousel) {
    this.messageService.deleteMessage(item).subscribe((res) => {
      this.searchData();
    });
  }
  toggleEnable(item: carousel) {
    this.messageService.toggleEnable(item).subscribe((res) => {
      this.searchData();
    });
  }
  reset() {
    this.pageIndex = 1;
    this.pageSize = 20;
    this.data = [];
  }
}
