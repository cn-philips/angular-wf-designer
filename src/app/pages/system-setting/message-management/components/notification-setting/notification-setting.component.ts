import { Component, OnInit, ViewChild } from "@angular/core";
import { MessageService } from "../../services/message.service";
import { messageTypeEnum } from "../interfaces/iMessage";
import { notification } from "../interfaces/iNotification";
import { NotificationFormDialogComponent } from "./form/notification-form-dialog/notification-form-dialog.component";

@Component({
  selector: "app-notification-setting",
  templateUrl: "./notification-setting.component.html",
  styleUrls: ["./notification-setting.component.scss"],
})
export class NotificationSettingComponent implements OnInit {
  constructor(private messageService: MessageService) {}
  data: notification[];
  messageType: messageTypeEnum = messageTypeEnum.Notification;
  pageIndex: number = 1;
  pageSize: number = 20;
  @ViewChild("dialog")
  dialog: NotificationFormDialogComponent;
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
  handleDelete(item: notification) {
    this.messageService.deleteMessage(item).subscribe((res) => {
      this.searchData();
    });
  }
  toggleEnable(item: notification) {
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
