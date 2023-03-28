import { Component, OnInit, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HttpService } from "@core/services";
import { Router } from "@angular/router";
import { NzMessageService } from "ng-zorro-antd";
import { ProcessStatusPipe } from "@shared/pipes/process-status.pipe";
import { TimeFormatMsPipe } from "@shared/pipes/time-format-ms.pipe";

import { decodeString, formatDates } from "@core/util/tools";

@Component({
  selector: "app-emp-acc",
  templateUrl: "./emp-acc.component.html",
  styleUrls: ["./emp-acc.component.scss"],
  providers: [ProcessStatusPipe, TimeFormatMsPipe],
})
export class EmpAccComponent implements OnInit {
  id = "";
  listOfData = [];
  nzAlign = "center";
  constructor(
    public activatedRouter: ActivatedRoute,
    private router: Router,
    private http: HttpService,
    private message: NzMessageService
  ) {}
  @Input() public disa = false;
  ngOnInit() {
    this.getTableData();
  }

  checkHtml(htmlStr) {
    if (htmlStr && htmlStr != "null") {
      var reg = /<[^>]+>/g;
      return reg.test(htmlStr);
    }
  }
  // 文件下载
  public fileDwon(id) {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf("#");
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${id}`;
    window.open(url, "_blank");
  }

  getTableData() {
    // 审批记录
    let status = this.activatedRouter.queryParams["_value"].status;
    let mainBusinessID =
      (status == "change_oit_approval" || status == "change_oit") && this.disa
        ? decodeString(this.activatedRouter.queryParams["_value"].mainId)
        : decodeString(this.activatedRouter.queryParams["_value"].id);

    const params = {
      mainBusinessID: mainBusinessID,
    };
    this.http
      .post(`/act/process/getProcessWorkHisInfo`, params)
      .subscribe((rest) => {
        if (rest.code === "0000") {
          this.listOfData = rest.data.reverse();
          const HTGYB = this.listOfData.find((vals) => vals.name == "HTGYB");
          let HTGYBS = { ...HTGYB };
          this.listOfData.map((res) => {
            res.createTime = formatDates(res.createTime);
            res.endTime = formatDates(res.endTime);
            /**
             * 区分修改合同概要表还是提交合同概要表
             */
            if (res.name == HTGYBS.name) {
              if (res.id == HTGYBS.id) {
                res.name = "XJDHTGYBTX";
              } else {
                res.name = "DHTGYBTX";
              }
            }
          });
        } else {
          this.message.create("error", `${rest.msg}`);
        }
      });
  }

  // 流程记录更改cancel转译状态
  public changCancel(e) {
    if (e === "项目终止-取消进单") {
      return "已取消";
    }
    if (e === "项目终止-关闭进单") {
      return "已关闭";
    }
    return e;
  }

  // 非标提示
  public isNonStandardTitle(e) {
    switch (e) {
      case "paymentProvision":
      case "paymentProvision2":
        return "付款条款审核";
      case "installationWarranty":
      case "installationWarranty2":
        return "安装，验收及保修审核";
      case "shipmentDelivery":
        return "装运及交货审核";
      case "amountDifference":
        return "直投订单合同金额和中标金额有价差审核";
      case "sitePreparation":
        return "场地准备审核";
      case "performanceBond":
        return "履约保函审核";
      case "TPWJJDSH":
      case "TPWJJDCS":
      case "TPWJJDZS":
        return "特批进单审核";
      case "CWBM":
        return "付款方式审核";
      case "ZLFGB":
        return "投标保证金及履约保证金额审核";
      case "GYLYYB":
        return "物流条款审核";
      case "FAFWB":
        return "售后维修条款审核";
      case "SCB":
        return "技术条款审核";
    }
    return null;
  }
}
