import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MessageService } from "@pages/system-setting/message-management/services/message.service";
import { CookieService } from "ngx-cookie-service";

interface message {
  id: string;
  content: string;
  title: string;
  forceRead: boolean;
  countDown: number;
  alwaysShow: boolean
}
@Component({
  selector: "app-alert",
  templateUrl: "./alert.component.html",
  styleUrls: ["./alert.component.scss"],
})
export class AlertComponent implements OnInit {
  constructor(private messageService: MessageService,private cookiesService:CookieService) {}

  @Input()
  countDown: number; //秒
  currentCountDown: number = null; //秒
  @Input()
  confirmText: string;
  @Input()
  countDownText: string;
  visible: boolean = false;
  timer: any;
  buttonText: string = "确认";
  messages: message[] = [];
  activeMessage: message;
  @Output()
  onConfirmed: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit() {
    // this.show();
  }
  show() {
    if (this.messages.length === 0) return;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.visible = true;
    this.setButtonText(this.countDownText);

    this.activeMessage = this.messages.shift();
    if (this.activeMessage.forceRead) {
      this.currentCountDown = this.activeMessage.countDown || this.countDown;
      if (this.currentCountDown !== null) {
        this.setButtonText(this.getCountDownText());
        this.timer = setTimeout(() => this.countDownCalc(), 1000);
      }
    } else {
      this.currentCountDown = 0;
      this.countDownCalc();
    }
  }
  hide() {
    this.visible = false;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.activeMessage = null;
  }
  countDownCalc() {
    if (this.currentCountDown > 0) {
      this.currentCountDown -= 1;
      this.setButtonText(this.getCountDownText());
    }
    if (this.currentCountDown === 0) {
      this.setButtonText(this.countDownText);
    } else {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => this.countDownCalc(), 1000);
    }
  }
  setButtonText(text) {
    this.buttonText = text || this.buttonText;
  }
  getCountDownText() {
    return this.confirmText.replace(/\{.*\}/, this.currentCountDown.toString());
  }
  handleConfirm() {
    if (this.currentCountDown === 0) {
      if (this.activeMessage.alwaysShow) {
        this.messageService.removeRead(this.activeMessage.id);
        // 长期显示的，通过cookies保存此次登录后的阅读记录，登陆的时候由后端将该记录清理
        let longTermMessageReadRecords = this.cookiesService.get(
          "longTermMessageReadRecords"
        );
        if(longTermMessageReadRecords.indexOf(this.activeMessage.id)<0){
          longTermMessageReadRecords = [
            longTermMessageReadRecords,
            this.activeMessage.id,
          ].filter(i=>i).join(",");
          this.cookiesService.set(
            "longTermMessageReadRecords",
            longTermMessageReadRecords
          );
        }
        this.hide();
      } else {
        this.onConfirmed.emit(this.activeMessage);
        this.hide();
      }
    }
    if (this.messages.length > 0) {
      this.show();
    }
  }
  push(message: message) {
    this.messages.push(message);
  }
}
