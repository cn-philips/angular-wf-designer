import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { ApprovalDialogComponent } from "@app/modern-themes/components/approval-dialog/approval-dialog.component";
import { AlertComponent } from "@app/modern-themes/components/alert/alert.component";
import {
  CarouselComponent,
  carouselItem,
} from "@app/modern-themes/components/carousel/carousel.component";
import { MessageService } from "@pages/system-setting/message-management/services/message.service";
import { messageTypeEnum } from "@pages/system-setting/message-management/components/interfaces/iMessage";
import { announcement } from "@pages/system-setting/message-management/components/interfaces/iAnnouncement";
import {
  notification,
  notificationTypeEnum,
} from "@pages/system-setting/message-management/components/interfaces/iNotification";
import { carousel } from "@pages/system-setting/message-management/components/interfaces/iCarousel";
import * as Driver from "driver.js";
import { DictService, GlobalService, HttpService } from "@core/services";
import { environment } from "@env";
export enum menuType {
  bidding,
  order,
  prebook,
  specialApproval,
}
@Component({
  selector: "app-homepage",
  templateUrl: "./homepage.component.html",
  styleUrls: ["./homepage.component.scss"],
})
export class HomepageComponent implements OnInit {
  constructor(
    private messageService: MessageService,
    private router: Router,
    private http: HttpService,
    private dictService: DictService,
    private globalService:GlobalService
  ) {}
  MenuType = menuType;
  @ViewChild("dialog")
  dialog: ApprovalDialogComponent;
  @ViewChild("orderDialog")
  orderDialog: ApprovalDialogComponent;
  @ViewChild("biddingDialog")
  biddingDialog: ApprovalDialogComponent;
  @ViewChild("prebookDialog")
  prebookDialog: ApprovalDialogComponent;
  @ViewChild("alert")
  alert: AlertComponent;
  @ViewChild("carousel")
  carousel: CarouselComponent;
  public carouselItems: carouselItem[] = [];
  entriesMenusList: any[] = [];
  async ngOnInit() {
    this.getMessage();
    this.getMessageModal();
    this.getCarousels();
    // this.startGuide();
    this.getEntriesMenusList();
  }
  hasPermission(type: menuType): boolean {
    let biddingId = "0e3dcce1-21b2-42d6-abeb-c24228f05f4c";
    let orderId = "5ba74962-a4e4-4408-9973-25380f12ea79";
    let perbookId = "2fb52c37-3f19-89b8-5e38-afd390cb2020";
    let hasPermission = false;
    switch (type) {
      case menuType.bidding:
        hasPermission =
          this.entriesMenusList.filter((i) => {
            return i.id === biddingId;
          }).length > 0;

        break;
      case menuType.order:
        hasPermission =
          this.entriesMenusList.filter((i) => {
            return i.id === orderId;
          }).length > 0;
        break;
      case menuType.prebook:
        hasPermission =
          this.entriesMenusList.filter((i) => {
            return i.id === perbookId;
          }).length > 0;
        break;
      case menuType.specialApproval:
        hasPermission = this.dialog.hasMenus;
        break;
    }
    return hasPermission;
  }
  async getEntriesMenusList() {
    // let menusRaw = window.localStorage.getItem("menuList");
    let menusRaw = await this.globalService.getMenus()
    if (menusRaw) {
      let menuList = menusRaw;
      menuList.map((vals) => {
        if (
          vals.id == "621997df-0501-40a3-bd7e-9062291dd4c3" &&
          vals.children &&
          vals.children.length > 0
        ) {
          this.entriesMenusList = [...vals.children];
        }
      });
    } else {
      //获取菜单
      this.http.post("/act/role/getDiigtUserInfo").subscribe((res) => {
        if ("0000" == res.code) {
          let menuList = res.data.jurisdictions;
          if (menuList.length > 0) {
            menuList.map((vals) => {
              if (
                vals.id == "621997df-0501-40a3-bd7e-9062291dd4c3" &&
                vals.children &&
                vals.children.length > 0
              ) {
                this.entriesMenusList = [...vals.children];
              }
            });
          }
        }
      });
    }
  }
  public message_error: any = [];
  public message_info: any = [];
  public message_warning: any = [];
  public getMessage() {
    this.messageService
      .retrieveMessage(messageTypeEnum.Notification)
      .subscribe((res: notification[]) => {
        this.message_error = res.filter(
          (notification) => notification.type === notificationTypeEnum.danger
        );
        this.message_info = res.filter(
          (notification) => notification.type === notificationTypeEnum.info
        );
        this.message_warning = res.filter(
          (notification) => notification.type === notificationTypeEnum.warning
        );
      });
  }
  public closeMessage(msgArr: any, index: any) {
    msgArr.splice(index, 1);
  }

  // public message_modal_show: boolean = false;
  // public message_modal: any = [];
  public getMessageModal() {
    this.messageService
      .retrieveMessage(messageTypeEnum.Announcement)
      .subscribe((newsList: announcement[]) => {
        newsList.map((news) => {
          if (news.alwaysShow) {
            this.messageService.removeRead(news.id);
          }
          if (!this.messageService.hasRead(news.id)) {
            this.alert.push({
              id: news.id.toString(),
              title: news.title.toString(),
              content: news.content.toString(),
              forceRead: news.isForceRead,
              countDown: news.readTime,
              alwaysShow: news.alwaysShow,
            });
          }
        });
        if (newsList.length > 0) {
          this.alert.show();
        }
      });
  }
  getCarousels() {
    this.messageService
      .retrieveMessage(messageTypeEnum.Carousel)
      .subscribe((carouselsList: carousel[]) => {
        carouselsList.map((carousel) => {
          this.carouselItems.push({
            content: carousel.content.toString(),
            img: carousel.image.toString(),
            title: carousel.title.toString(),
            link: carousel.link ? carousel.link.toString() : null,
          });
        });
      });
  }
  handleDialogClick(dialog) {
    switch (dialog) {
      case "bid":
        if (environment.showPopupEntries) {
          this.biddingDialog.show(dialog);
        } else {
          this.router.navigate(["/bidding"]);
        }
        break;
      case "order":
        if (environment.showPopupEntries) {
          this.orderDialog.show(dialog);
        } else {
          this.router.navigate(["/pre-order"]);
        }
        break;
      case "prebook":
        if (environment.showPopupEntries) {
          this.prebookDialog.show(dialog);
        } else {
          this.router.navigate(["/pre-book"]);
        }
        break;
      case "sp":
        this.dialog.show(dialog);
        break;
    }
  }
  handleConfirmed($event) {
    this.messageService.setRead($event.id);
  }
  startGuide() {
    this.dictService.dictData("UserGuide").subscribe((res) => {
      let guideDone = localStorage.getItem("GuideDone");
      if ((guideDone === "false" || !guideDone) && res.length > 0) {
        let enabled = res[0].label;
        if ("true" == enabled) {
          const driver = new Driver({
            allowClose: false,
            overlayClickNext: true,
            showButtons: true,
            keyboardControl: false,
            onNext: (Element: any) => {
              guideDone = localStorage.getItem("GuideDone");
              // 避免第二次触发
              if (
                Element.node.id === "entriesBox" &&
                (guideDone === "false" || !guideDone)
              ) {
                driver.reset();
                setTimeout(() => {
                  if (document.querySelector("#nav_FA")) {
                    driver.highlight({
                      element: "#nav_FA",
                      popover: {
                        title: "工作台首页也有更新！",
                        description: "",
                        position: "right", // can be `top`, `left`, `right`, `bottom`     // Text on the last button
                        closeBtnText: "好的",
                      },
                    });
                  }
                }, 0);
              }
            },
            onDeselected: (Element: any) => {
              if (
                document.querySelector("#nav_FA") &&
                Element.node.id === "nav_FA"
              ) {
                this.router.navigate(["/ecos/home", { isGuide: true }]);
              }
            },
          });
          driver.defineSteps([
            {
              element: "#linksBox",
              popover: {
                className: "navbar-nav-popover", // fixed的需要设置class Name 并在theme/guide/index.scss中添加position:fixed
                title: "新版手册与快速链接",
                description: "用户手册及快速链接搬家到这里了！",
                position: "left",
                nextBtnText: "下一步", // Next button text
              },
            },
            {
              element: "#entriesBox",
              popover: {
                title: "新版入口",
                description: "申请入口在这里！",
                position: "top",
                nextBtnText: "下一步", // Next button text
                doneBtnText: "好的",
              },
            },
          ]);
          setTimeout(() => {
            driver.start();
          }, 500);
        }
      }
    });
  }
}
