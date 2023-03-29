import { Component, OnInit, ViewChild } from "@angular/core";
import { MessageService } from "../../services/message.service";
import { announcement } from "../interfaces/iAnnouncement";
import { messageTypeEnum } from "../interfaces/iMessage";
import { notificationTypeEnum } from "../interfaces/iNotification";
import { AnnouncementFormDialogComponent } from "./form/announcement-form-dialog/announcement-form-dialog.component";

@Component({
  selector: "app-announcement-setting",
  templateUrl: "./announcement-setting.component.html",
  styleUrls: ["./announcement-setting.component.scss"],
})
export class AnnouncementSettingComponent implements OnInit {
  constructor(private messageService: MessageService) {}
  messageType: messageTypeEnum = messageTypeEnum.Announcement;
  data: announcement[];
  pageIndex: number = 1;
  pageSize: number = 20;
  @ViewChild("dialog")
  dialog: AnnouncementFormDialogComponent;
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

  handleDelete(item: announcement) {
    this.messageService.deleteMessage(item).subscribe((res) => {
      this.searchData();
    });
  }
  toggleEnable(item: announcement) {
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
