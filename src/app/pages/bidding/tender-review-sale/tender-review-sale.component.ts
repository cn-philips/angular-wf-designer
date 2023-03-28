import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { HttpService } from '@core/services';
import { decodeString, formatDatesNow, NumberThousandth, chNumber } from '@core/util/tools';

@Component({
  selector: 'app-tenderreview-sale',
  templateUrl: './tender-review-sale.component.html',
  styleUrls: ['./tender-review-sale.component.scss']
})
export class TenderReviewSaleComponent implements OnInit {

  // tab标签
  tab: any = '0';
  /*所有基础信息*/
  infor: any = {};
  mainid: any;
  flag: number = 0;
  taskId: any = "";
  public urls: any = "/act/ecom/tender/application/departmentSubmit";
  labarr: any = {
    nonStandardTerms: false, //包含非标准条款
    logisticsTermsApproval: false,//物流审批条款
    remarks: "",//备注
    approvalAfterSales: false,//售后维修条款审批
    approvalBidSecurity: false,//保证金
    paymentMethod: false,//付款方式
    technicalTerms: false,//技术条框
    provisionsInvolved: false,//涉及法律条款说明
    status: 0,//0拒绝 1通过
  };
  public fileList: any = {
    fileList: []// 审批文件
  };
  public load: any = 0;

  /*可否操作*/
  take: boolean = true;
  constructor(private http: HttpService, private activeRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe((params: Params) => {
      this.mainid = decodeString(params['id']);
      if (this.mainid != null && this.mainid != '') {
        this.getData();
      }
    });

  }
  /*
  * 获取数据
  * */
  getData() {
    const url = '/act/ecom/tender/application/getTenderApplicationDto?mainId=';
    this.load++;
    this.http.get(url + this.mainid).subscribe(res => {
      this.infor = res.data;
      this.infor.openBiddingDate = formatDatesNow(this.infor.openBiddingDate);
      if (this.infor.tenderPriceCurrency != null && this.infor.tenderPriceCurrency != '') {
        this.infor.tenderPriceCurrency = chNumber(this.infor.tenderPriceCurrency);
        this.infor.tenderPriceCurrency = NumberThousandth(this.infor.tenderPriceCurrency);
      }
      if (this.infor && this.infor.totalPrice != '' && this.infor.totalPrice != null) {
        this.infor.totalPrice = chNumber(this.infor.totalPrice);
        this.infor.totalPrice = NumberThousandth(this.infor.totalPrice);
      }
      if (this.infor && this.infor.performanceBonds != '' && this.infor.performanceBonds != null) {
        this.infor.performanceBonds = chNumber(this.infor.performanceBonds);
        this.infor.performanceBonds = NumberThousandth(this.infor.performanceBonds);
      }
      this.BMCList();
      this.load--;
    }, error => {
      this.load--;
    });
  }


  BMCList() {
    console.log('dataBase');
    console.log(this.infor);
    // 记录重复
    let bmclistarr = [];
    // 便利BMC list
    let BMClist = [];
    // bmc 专家
    let BMCExpert = {};
    // 投标保证金 专家
    let AppExpert = [];
    if (this.infor.productInformations) {
      for (let f = 0; f < this.infor.productInformations.length; f++) {
        if (this.infor.productInformations[f] && this.infor.productInformations[f].productInformations) {
          for (let i = 0; i < this.infor.productInformations[f].productInformations.length; i++) {
            // 第二层   mk
            if (this.infor.productInformations[f].productInformations[i].bmc && bmclistarr.indexOf(this.infor.productInformations[f].productInformations[i].bmc) == -1) {
              const bmc = this.infor.productInformations[f].productInformations[i].bmc;
              let cluster = this.infor.productInformations[f].productInformations[i].cluster;
              if (cluster != null) {
                cluster = cluster.replaceAll('&', '%26');
              }
              bmclistarr.push(bmc);
              BMClist.push({
                bmc: bmc,
                name: null
              });
              // 根据BMC获取对应专家
              let url = '/act/preparation/getProductExpert?bmc=' + bmc + '&mainId=' + this.mainid + '&role=Product Sales';
              if (cluster != null) {
                url = url + '&cluster=' + cluster;
              }
              this.load++;
              this.http.get(url).subscribe(e => {
                BMCExpert[bmc] = e.data;
                this.load--;
              }, error => {
                this.load--;
              });

              let url2 = '/act/preparation/getProductExpert?bmc=' + bmc + '&mainId=' + this.mainid + '&role=Cluster BP';
              if (cluster != null) {
                url2 = url2 + '&cluster=' + cluster;
              }
              this.load++;
              this.http.get(url2).subscribe(e => {
                if (e.data) {
                  for (let d = 0; d < e.data.length; d++) {
                    AppExpert.push({
                      bmc: bmc,
                      name: e.data[d].name,
                      email: e.data[d].email
                    });
                  }
                }
                this.load--;
              }, error => {
                this.load--;
              });
            }
            // if (this.infor.productInformations[0].productInformations[i].productInformations) {
            //   for (let j = 0; j < this.infor.productInformations[0].productInformations[i].productInformations.length; j++) {
            //     // 第三层   产品
            //     // this.dataBase.productInformations[0].productInformations[i].bmc = i;
            //     if (this.infor.productInformations[0].productInformations[i].productInformations[j].bmc && bmclistarr.indexOf(this.infor.productInformations[0].productInformations[i].productInformations[j].bmc) == -1) {
            //       const bmc = this.infor.productInformations[0].productInformations[i].productInformations[j].bmc;
            //       let cluster = this.infor.productInformations[0].productInformations[i].productInformations[j].cluster;
            //       cluster = cluster.replaceAll('&', '%26');
            //       bmclistarr.push(bmc);
            //       BMClist.push({
            //         bmc: bmc,
            //         name: null
            //       });
            //       // 根据BMC 获取对应专家
            //       const url = '/act/preparation/getProductExpert?bmc=' + bmc + '&mainId=' + this.mainid + '&cluster=' + cluster + '&role=Product Sales';
            //       this.http.get(url).subscribe(e => {
            //         BMCExpert[bmc] = e.data;
            //       });
            //       const url2 = '/act/preparation/getProductExpert?bmc=' + bmc +  '&mainId=' + this.mainid + '&cluster=' + cluster + '&role=Cluster BP';
            //       this.http.get(url2).subscribe(e => {
            //         if (e.data) {
            //           for (let d = 0; d < e.data.length; d++) {
            //             AppExpert.push({
            //               bmc: bmc,
            //               name: e.data[d].name,
            //               email: e.data[d].email
            //             });
            //           }
            //         }
            //       });
            //     }
            //   }
            // }
          }
        }
      }
    }
    this.infor.BMClist = BMClist;
    this.infor.BMCExpert = BMCExpert;
    this.infor.AppExpert = AppExpert;
    console.log(this.infor);
  }
  /*上一步，下一步*/
  upTab(e) {
    // 下一步
    if (e === 'n') {
      // tslint:disable-next-line:radix
      const n = parseInt(this.tab) + 1;
      this.tab = n.toString();
    }
    // 上一步
    if (e === 'l') {
      // tslint:disable-next-line:radix
      const n = parseInt(this.tab) - 1;
      this.tab = n.toString();
    }
  }

  toReturn() {
    window.history.back();
  }
}
