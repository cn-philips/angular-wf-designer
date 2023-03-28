import { Component, OnInit } from "@angular/core";
import { HttpService } from "@core/services";
import { ActivatedRoute } from "@angular/router";
import { decodeString, formatDatesNow } from "assets/js/tools";

@Component({
  selector: "app-app-terms",
  templateUrl: "./app-terms.component.html",
  styleUrls: ["./app-terms.component.scss"],
})
export class AppTermsComponent implements OnInit {
  dataBase: any = {
    nonStandardTerms: false, // 包含非标准条款
    logisticsTermsApproval: false, // 物流审批条款
    approvalAfterSales: false, // 售后维修条款审批
    approvalBidSecurity: false, // 保证金
    paymentMethod: false, // 付款方式
    technicalTerms: false, // 技术条框
    provisionsInvolved: false, // 涉及法律条款说明
    remarks: "", // 备注
  };
  // 产品信息  主要获取便利 BMC
  infor: any = {};
  mainid: any = "";

  constructor(
    private http: HttpService,
    public activatedRouter: ActivatedRoute
  ) {
    this.mainid = decodeString(this.activatedRouter.queryParams["_value"].id);
    this.getData();
  }

  ngOnInit() {
    const mainId = decodeString(this.activatedRouter.queryParams["_value"].id);
    const url = `/act/ecom/tender/application/getTenderApplicationDto?mainId=${mainId}`;
    this.http.get(url).subscribe((res) => {
      if (res.data) {
        this.infor = res.data;
        this.infor.openBiddingDate = formatDatesNow(this.infor.openBiddingDate);
        // this.BMCList();
      }
    });
  }

  getData() {
    const url = `/act/ecom/tender/application/getTenderApp?mainId=${this.mainid}`;
    this.http.get(url).subscribe((res) => {
      if (res.data) {
        this.dataBase.BMClist = res.data.bmclist;
        this.dataBase.approvallist2 = res.data.approvallist;
        this.dataBase.approvalAfterSales =
          res.data.approvalAfterSales == 1 ? true : false;
        this.dataBase.nonStandardTerms =
          res.data.nonStandardTerms == 1 ? true : false;
        this.dataBase.logisticsTermsApproval =
          res.data.logisticsTermsApproval == 1 ? true : false;
        this.dataBase.approvalBidSecurity =
          res.data.approvalBidSecurity == 1 ? true : false;
        this.dataBase.paymentMethod =
          res.data.paymentMethod == 1 ? true : false;
        this.dataBase.technicalTerms =
          res.data.technicalTerms == 1 ? true : false;
        this.dataBase.provisionsInvolved =
          res.data.provisionsInvolved == 1 ? true : false;
        this.dataBase.remarks = res.data.remarks;
      } else {
        this.dataBase.approvalAfterSales = false;
        this.dataBase.nonStandardTerms = false;
        this.dataBase.logisticsTermsApproval = false;
        this.dataBase.approvalBidSecurity = false;
        this.dataBase.paymentMethod = false;
        this.dataBase.technicalTerms = false;
        this.dataBase.provisionsInvolved = false;
      }
    });
  }

  /* 便利BMC集合 */
  // BMCList () {
  //   console.log('dataBase');
  //   console.log(this.infor);
  //   // 记录重复
  //   let bmclistarr = [];
  //   // 便利BMC list
  //   let BMClist = [];
  //   // bmc 专家
  //   let BMCExpert = {};
  //   // 投标保证金 专家
  //   let AppExpert = [];
  //   if (this.infor.productInformations[0] && this.infor.productInformations[0].productInformations) {
  //     for (let i = 0; i < this.infor.productInformations[0].productInformations.length; i++) {
  //       // 第二层   mk
  //       if (this.infor.productInformations[0].productInformations[i].bmc && bmclistarr.indexOf(this.infor.productInformations[0].productInformations[i].bmc) == -1) {
  //         const bmc = this.infor.productInformations[0].productInformations[i].bmc;
  //         bmclistarr.push(bmc);
  //         BMClist.push({
  //           bmc: bmc,
  //           name: null
  //         });
  //         // 根据BMC获取对应专家
  //         const url = '/act/preparation/getProductExpert?bmc=' + bmc;
  //         this.http.get(url).subscribe(e => {
  //           BMCExpert[bmc] = e.data;
  //         });
  //
  //         const url2 = '/act/preparation/getProductExpert?bmc=' + bmc + '&role=Cluster BP';
  //         this.http.get(url2).subscribe(e => {
  //           if (e.data) {
  //             for (let d = 0; d < e.data.length; d++) {
  //               AppExpert.push({
  //                 bmc: bmc,
  //                 name: e.data[d].name,
  //                 email: e.data[d].email
  //               });
  //             }
  //           }
  //         });
  //       }
  //       if (this.infor.productInformations[0].productInformations[i].productInformations) {
  //         for (let j = 0; j < this.infor.productInformations[0].productInformations[i].productInformations.length; j++) {
  //           // 第三层   产品
  //           // this.dataBase.productInformations[0].productInformations[i].bmc = i;
  //           if (this.infor.productInformations[0].productInformations[i].productInformations[j].bmc && bmclistarr.indexOf(this.infor.productInformations[0].productInformations[i].productInformations[j].bmc) == -1) {
  //             const bmc = this.infor.productInformations[0].productInformations[i].productInformations[j].bmc;
  //             bmclistarr.push(bmc);
  //             BMClist.push({
  //               bmc: bmc,
  //               name: null
  //             });
  //             // 根据BMC 获取对应专家
  //             const url = '/act/preparation/getProductExpert?bmc=' + bmc;
  //             this.http.get(url).subscribe(e => {
  //               BMCExpert[bmc] = e.data;
  //             });
  //             const url2 = '/act/preparation/getProductExpert?bmc=' + bmc + '&role=Cluster BP';
  //             this.http.get(url2).subscribe(e => {
  //               if (e.data) {
  //                 for (let d = 0; d < e.data.length; d++) {
  //                   AppExpert.push({
  //                     bmc: bmc,
  //                     name: e.data[d].name,
  //                     email: e.data[d].email
  //                   });
  //                 }
  //               }
  //             });
  //           }
  //         }
  //       }
  //     }
  //   }
  //   this.infor.BMClist = BMClist;
  //   this.infor.BMCExpert = BMCExpert;
  //   this.infor.AppExpert = AppExpert;
  //   console.log(this.infor);
  // }

  // 数组排序
  arrSort(arr) {
    if (arr) {
      arr.sort(function (a, b) {
        if (a.bmc < b.bmc) {
          return -1;
        }
        if (a.bmc > b.bmc) {
          return 1;
        }
        return 0;
      });
    }
    console.log(arr);
    return arr;
  }
}
