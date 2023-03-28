import { Component, OnInit } from '@angular/core';
import { decodeString, chNumber, NumberThousandth } from '@core/util/tools';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from '@core/services';
import { NzMessageService } from 'ng-zorro-antd';
import { RouterExtendService } from '@app/modern-themes/services/router-extend.service';

@Component({
  selector: "app-winningbid",
  templateUrl: "./winning-bid.component.html",
  styleUrls: ["./winning-bid.component.scss"],
})
export class WinningBidComponent implements OnInit {
  mainId: any = "";
  public showoff: any = false;
  public rem_mess: any = false;
  public take: any = true;
  public remarks: any = "";
  // 基础信息
  public dataBase: any = {};
  public isVisibleDate: boolean;
  public contractEndDate: any;
  // 绑定其他复选框
  othercheck: any = false;
  odata: any = {
    // 中标通知书
    bidWinningNotice: false,
    // 中标公告
    bidWinningAnnouncement: false,
    // 缺要货函，用场地报告代替
    demandLetter: false,
    // 公立医院，招标编号-其他类型
    otherTypes: false,
    // 其他
    other: "",
    // 中标公告价格
    bidAnnouncementPrice: "",
    // 中标公告币种
    bidAnnouncementCurrency: null,
    // 中标公告发布时间
    announcementTime: "",
    // 公示期结束时间
    publicityEndTime: "",
    // 特批完成时间
    speciallyExaminedTime: "",
    // 后补中标通知书的签订时间
    biddingNotificationSignTime: "",
  };
  fileList: any = {
    bidAnnouncementList: [], // 中标公告文件
    fileSpecialList: [], // 特批文件
    filesupplementList: [], // 补充文件
    filesupplementsList: [], // 补充文件2
    filesupplementssList: [], // 补充文件3
  };
  data = {
    remarks: "",
  };
  public bidding_flag: any = false;
  public isBidding: any = false;
  public isAauthorization: any = false;

  constructor(
    private router: Router,
    private http: HttpService,
    public activatedRouter: ActivatedRoute,
    private message: NzMessageService,
    private routerExtend: RouterExtendService
  ) {
    const mainId = decodeString(this.activatedRouter.queryParams["_value"].id);
    this.mainId = mainId;
    this.flag = this.activatedRouter.queryParams["_value"].flag;
    const url = `/act/ecom/tender/application/getTenderApplicationDto?mainId=${mainId}`;
    this.http.get(url).subscribe((res) => {
      if (res.code === "0000") {
        this.dataBase = res.data;
        if (
          this.dataBase.tenderPriceCurrency != null &&
          this.dataBase.tenderPriceCurrency != ""
        ) {
          this.dataBase.tenderPriceCurrency = chNumber(
            this.dataBase.tenderPriceCurrency
          );
          this.dataBase.tenderPriceCurrency = NumberThousandth(
            this.dataBase.tenderPriceCurrency
          );
        }
        if (
          this.dataBase &&
          this.dataBase.totalPrice != "" &&
          this.dataBase.totalPrice != null
        ) {
          this.dataBase.totalPrice = chNumber(this.dataBase.totalPrice);
          this.dataBase.totalPrice = NumberThousandth(this.dataBase.totalPrice);
        }
        if (
          this.dataBase &&
          this.dataBase.performanceBonds != "" &&
          this.dataBase.performanceBonds != null
        ) {
          this.dataBase.performanceBonds = chNumber(
            this.dataBase.performanceBonds
          );
          this.dataBase.performanceBonds = NumberThousandth(
            this.dataBase.performanceBonds
          );
        }
        if (this.dataBase.businessType === "DISTRIBUTOR") {
          this.ddpJudge(
            this.dataBase.dealerNo,
            this.dataBase.agreementAgenName
          );
        }
      }
    });
  }

  // 获取流程是否可以终止
  public getBiddingFlag() {
    const mainId = decodeString(this.activatedRouter.queryParams["_value"].id);
    const url = "/act/ecom/tender/application/getBiddingFlag?mainId=" + mainId;
    this.http.get(url).subscribe((res) => {
      if (res && res.data) {
        if (res.data.biddingFlag == true || res.data.biddingFlag === "true") {
          this.bidding_flag = true;
        }
        // true 被进单使用过
        if (res.data.isBidding == true || res.data.isBidding === "true") {
          this.isBidding = true;
        }
        if (
          res.data.isAauthorization == true ||
          res.data.isAauthorization === "true"
        ) {
          this.isAauthorization = true;
        }
      }
    });
  }

  // 流程终止
  public biddingBreak() {
    if (!this.take) {
      return;
    }
    this.take = false;
    if (this.remarks === "" || this.remarks == null) {
      this.rem_mess = true;
      this.take = true;
      return;
    }
    this.rem_mess = false;
    const mainId = decodeString(this.activatedRouter.queryParams["_value"].id);
    const data = {
      mainId: mainId,
      cancleReason: this.remarks,
    };
    const url = "/act/ecom/tender/application/biddingTermination";
    this.http.post(url, data).subscribe(
      (res) => {
        this.message.create("success", res.msg);
        // this.router.navigate(['/ecos/my-done']);
        this.routerExtend.back();
        this.showoff = false;
        this.take = true;
      },
      (error) => {
        this.message.create("error", `错误`);
        this.take = true;
      }
    );
  }

  public flag: any = 0;

  ngOnInit() {
    this.getBiddingFlag();
  }

  public openBiddingBreak() {
    if (this.isBidding) {
      this.message.create(
        "error",
        `当前投标授权项目已发起进单，不可取消！如需取消，请先取消所有相关进单项目。`
      );
      return;
    }
    if (this.isAauthorization) {
      this.message.create("error", `当前是否需要投标授权为是，不可取消！`);
      return;
    }
    this.showoff = true;
  }

  public handleCancel() {
    this.showoff = false;
    this.rem_mess = false;
  }

  public ddpJudge(leaderNo, leaderName) {
    if (this.flag == 1) {
      return;
    }
    const url =
      "/act/ecom/bidding/getDdpDateAndValid?dealerCode=" +
      leaderNo +
      "&dealerName=" +
      leaderName;
    this.http.get(url).subscribe(
      (res) => {
        if (res.data.isValid != null && res.data.isValid) {
          return;
        } else {
          this.isVisibleDate = true;
          if (res.data.isValid != null) {
            this.contractEndDate = res.data.ddpDate;
          }
        }
      },
      (error) => {
        this.message.error("请求失败!");
      }
    );
  }

  toReturn() {
    window.history.back();
  }
}
