import {Component, Input, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {HttpService} from '../../services';
import {NzMessageService} from 'ng-zorro-antd';
import {
  formatDates,
  // formatDate,
  decodeString,
  formatDatesNow,
  NumberThousandth,
  chNumber
} from '../../../assets/js/tools';

@Component({
  selector: 'app-tenderreview',
  templateUrl: './tenderreview.component.html',
  styleUrls: ['./tenderreview.component.scss']
})
export class TenderreviewComponent implements OnInit {
  // tab标签
  tab: any = '0';
  public dataBase: any = {};
  public isVisibleDate: boolean;
  public contractEndDate: any;
  public mainId: any = '';
  labarr: any = {
    nonStandardTerms: false, //包含非标准条款
    logisticsTermsApproval: false,//物流审批条款
    remarks: '',//备注
    file: '', // 审批支持文件
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

  constructor(
    private router: Router,
    private http: HttpService,
    public activatedRouter: ActivatedRoute,
    private message: NzMessageService) {
  }

  public urls: any = '/act/ecom/tender/application/saveOrSubmit';


  ngOnInit() {
    this.mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const url = `/act/ecom/tender/application/getTenderApplicationDto?mainId=${this.mainId}`;
    this.load++;
    this.http.get(url).subscribe(res => {
      console.log(res);
      if (res.code === '0000') {
        if (res.data) {
          this.dataBase = res.data;
          this.dataBase.openBiddingDate = formatDatesNow(this.dataBase.openBiddingDate);
          if (this.dataBase.tenderPriceCurrency != null && this.dataBase.tenderPriceCurrency != '') {
            this.dataBase.tenderPriceCurrency = chNumber(this.dataBase.tenderPriceCurrency);
            this.dataBase.tenderPriceCurrency = NumberThousandth(this.dataBase.tenderPriceCurrency);
          }
          if (this.dataBase && this.dataBase.totalPrice != '' && this.dataBase.totalPrice != null) {
            this.dataBase.totalPrice = chNumber(this.dataBase.totalPrice);
            this.dataBase.totalPrice = NumberThousandth(this.dataBase.totalPrice);
          }
          if (this.dataBase && this.dataBase.performanceBonds != '' && this.dataBase.performanceBonds != null) {
            this.dataBase.performanceBonds = chNumber(this.dataBase.performanceBonds);
            this.dataBase.performanceBonds = NumberThousandth(this.dataBase.performanceBonds);
          }
          this.BMCList();
          if (this.dataBase.businessType === 'DISTRIBUTOR') {
            this.ddpJudge(this.dataBase.dealerNo, this.dataBase.agreementAgenName);
          }
        }
      }
      this.load--;
    }, error => {
      this.load--;
    });
  }

  /* 便利BMC集合 */
  BMCList() {
    console.log('dataBase');
    console.log(this.dataBase);
    // 记录重复
    let bmclistarr = [];
    // 便利BMC list
    let BMClist = [];
    // bmc 专家
    let BMCExpert = {};
    // 投标保证金 专家
    let AppExpert = [];
    if (this.dataBase.productInformations) {
      for (let f = 0; f < this.dataBase.productInformations.length; f++) {
        if (this.dataBase.productInformations[f] && this.dataBase.productInformations[f].productInformations) {
          for (let i = 0; i < this.dataBase.productInformations[f].productInformations.length; i++) {
            // 第二层   mk
            if (this.dataBase.productInformations[f].productInformations[i].bmc && bmclistarr.indexOf(this.dataBase.productInformations[f].productInformations[i].bmc) == -1) {
              const bmc = this.dataBase.productInformations[f].productInformations[i].bmc;
              let cluster = this.dataBase.productInformations[f].productInformations[i].cluster;
              if (cluster != null) {
                cluster = cluster.replaceAll('&', '%26');
              }
              bmclistarr.push(bmc);
              BMClist.push({
                bmc: bmc,
                name: null
              });
              // 根据BMC获取对应专家
              let url = '/act/preparation/getProductExpert?bmc=' + bmc + '&mainId=' + this.mainId + '&role=Product Sales';
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

              let url2 = '/act/preparation/getProductExpert?bmc=' + bmc + '&mainId=' + this.mainId + '&role=Cluster BP';
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
            // if (this.dataBase.productInformations[0].productInformations[i].productInformations) {
            //   for (let j = 0; j < this.dataBase.productInformations[0].productInformations[i].productInformations.length; j++) {
            //     // 第三层   产品
            //     // this.dataBase.productInformations[0].productInformations[i].bmc = i;
            //     if (this.dataBase.productInformations[0].productInformations[i].productInformations[j].bmc && bmclistarr.indexOf(this.dataBase.productInformations[0].productInformations[i].productInformations[j].bmc) == -1) {
            //       const bmc = this.dataBase.productInformations[0].productInformations[i].productInformations[j].bmc;
            //       let cluster = this.dataBase.productInformations[0].productInformations[i].productInformations[j].cluster;
            //       cluster = cluster.replaceAll('&', '%26');
            //       bmclistarr.push(bmc);
            //       BMClist.push({
            //         bmc: bmc,
            //         name: null
            //       });
            //       // 根据BMC 获取对应专家
            //       const url = '/act/preparation/getProductExpert?bmc=' + bmc + '&mainId=' + this.mainId + '&cluster=' + cluster + '&role=Product Sales';
            //       this.http.get(url).subscribe(e => {
            //         BMCExpert[bmc] = e.data;
            //       });
            //       const url2 = '/act/preparation/getProductExpert?bmc=' + bmc + '&mainId=' + this.mainId + '&cluster=' + cluster + '&role=Cluster BP';
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
    this.dataBase.BMClist = BMClist;
    this.dataBase.BMCExpert = BMCExpert;
    this.dataBase.AppExpert = AppExpert;
    console.log(this.dataBase);
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


  public ddpJudge(leaderNo, leaderName) {
    if (this.activatedRouter.queryParams['_value'].flag == 1) {
      return;
    }
    const url = '/act/ecom/bidding/getDdpDateAndValid?dealerCode=' + leaderNo + '&dealerName=' + leaderName;
    this.http.get(url).subscribe(
      res => {
        if (res.data.isValid != null && res.data.isValid) {
          return;
        } else {
          this.isVisibleDate = true;
          if (res.data.isValid != null) {
            this.contractEndDate = res.data.ddpDate;
          }
        }
      }, error => {
        this.message.error('请求失败!');
      }
    );
  }

  public toReturn() {
    window.history.back();
  }
}
