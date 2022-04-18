import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '../../services';
import {NzMessageService, NzModalService} from 'ng-zorro-antd';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {
  formatDates,
  decodeString,
  formatDatesNow,
  formatDate,
  NumberThousandth,
  chNumber
} from '../../../assets/js/tools';

@Component({
  selector: 'app-bid',
  templateUrl: './bid.component.html',
  styleUrls: ['./bid.component.scss']
})
export class BidComponent implements OnInit {

  @ViewChild('bidck') bidck;
  public activedId: any = 'pending-tab';
  public load: any = false;
  public isVisibleDate: boolean;
  public contractEndDate: any;

  constructor(
    private http: HttpService,
    private message: NzMessageService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private modalService: NzModalService,
  ) {
  }

  mainid: any = '';
  /*
  * 信息
  * */
  public infor: any = {};
  baseData: any = {};
  flag: number = 0;
  /*
  * 保存提交数据
  * */
  public data: any = {

    id: '', //

    biddingId: '', //中标信息id

    bidWinningNotice: '',//上传中标通知书

    commitmentDocument: '',//投标及其他承诺文件

    siteInspectionReport: '',//场地勘验报告
    statement: '', //参与投标声明函
    support: '', //项目解决方案售前支持报告
    demandLetter: '',//要货函
    biddingPrice: '',//中标价格

    isUsdOrRmb: null,//USD或者rmb

    winningCompany: '',//中标公司

    bidWinningNotices: '',//需要补齐中标通知书

    bidWinningAnnouncement: '',//中标公告

    otherDocument: '',//其他文件

    others: '',//其他

    bidWinningTime: '',//中标时间

    remarks: '',//备注

    bidWinningbidExplain: '',//文件缺失或需特批说明

    mainId: '',
    status: 0,//0保存 1提交

    process: 'approved',//中标结果

    biddingProductlist: [
      // {opportunityId:"ss",opportunityName:'',makertBundleId:'',marketBundleName:''}
    ],
    productInformation: [],
    isSpecial: null // 是否特价项目

  };

  public tabclick(val) {
    this.activedId = val.nextId;
  }

  // 外部触发tab选项卡的事件
  public myskip(val): void {
    this.activedId = val;
  }

  ngOnChanges() {
    this.getInit();
  }

  ngOnInit() {
    this.getInit();
  }

  getInit() {
    this.flag = this.activeRoute.queryParams['_value'].flag;
    this.mainid = decodeString(this.activeRoute.queryParams['_value'].id);
    const ASYNS = async () => {
      this.getData();
    };
    ASYNS();
  }

  //获取数据
  getData() {
    let url = '/act/ecom/tender/application/getTenderApplicationDto?mainId=';
    this.http.get(url + this.mainid).subscribe(res => {
      this.infor = res.data;
      console.log('infor', this.infor);
      this.baseData = res.data;
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
      this.getBudidingData();
      if (this.baseData.businessType === 'DISTRIBUTOR') {
        this.ddpJudge(this.baseData.dealerNo, this.baseData.agreementAgenName);
        this.dealerNo1 = this.baseData.dealerNo;
        this.agreementAgenName1 = this.baseData.agreementAgenName;
      } else {
        this.dealerNo1 = '1';
      }
      // resolve(res.data)
    });
  }

  /*
//   * 1.	业务模式=Direct Deal，且“是否投标授权”选“否，民营医院直接进单”，则在“中标备案”页面仅显示“上传场地勘验报告”这个字段和“中标产品信息”
//   *     false  仅显示“上传场地勘验报告”这个字段和“中标产品信息”
//   *     true   显示完整的中标备案页面
//   * */
  isChan() {
    if (this.infor && this.infor.tenderAuthorization == 'private' && this.infor.businessType == 'DIRECT') {
      return false;
    }
    return true;
  }

  // 保存提交
  save(e) {
    // 获取子组件提交数据 中标
    // if (this.data.process === 'approved') {
    //   this.data = this.bidck.bidinfor.data;
    // }
    // // 获取子组件提交数据 未中标
    // if (this.data.process === 'rejected') {
    //   this.data = this.bidck.data;
    // }

    // console.log(this.data);
    this.data.status = e;
    this.data.mainId = this.mainid;
    const url = '/act/ecom/bidding/saveAndSubmit';

    /*
    * 验证产品中标价格小于等于总中标价格
    * */
    if (this.data.process === 'approved' && e == 1) {
      let price = 0;
      let sum = 0;
      // tslint:disable-next-line:radix
      price = parseFloat(this.data.biddingPrice);
      // 中标价格有值的时候验证
      if (price != null && !isNaN(price) && this.data.biddingProductlist) {
        for (let li = 0; li < this.data.biddingProductlist.length; li++) {
          for (let li2 = 0; li2 < this.data.biddingProductlist[li].biddingProductlist.length; li2++) {
            // tslint:disable-next-line:radix
            let price_i = parseFloat(this.data.biddingProductlist[li].biddingProductlist[li2].biddingPrice);
            if (price_i != null && !isNaN(price_i)) {
              sum += price_i;
            }
          }
        }
        if (sum > price) {
          this.message.create('error', '产品中标价格总和要不大于总中标价格');
          return;
        }
      }
    }

    /*
    * 验证中标模式下至少选择一个Market Bundle
    * */
    if (this.data.process === 'approved') {
      let ckli = false;
      // 便利 biddingProductlist
      if (this.data.biddingProductlist) {
        for (let li = 0; li < this.data.biddingProductlist.length; li++) {
          for (let li2 = 0; li2 < this.data.biddingProductlist[li].biddingProductlist.length; li2++) {
            // 价格保留两位小数
            this.data.biddingProductlist[li].biddingProductlist[li2].biddingPrice = this.chNumber(this.data.biddingProductlist[li].biddingProductlist[li2].biddingPrice);
            if (this.data.biddingProductlist[li].biddingProductlist[li2].checked) {
              ckli = true;
              break;
            }
          }
        }
      }
      if (!ckli && e == 1) {
        this.message.create('error', '至少选择一个Market Bundle');
        return;
      }
    }

    let ver = true;
    /*
    * 非空验证
    * 已中标
    * */
    // 中标类型
    if (this.data.process == 'approved' && (this.data.isUsdOrRmb == '' || this.data.isUsdOrRmb == null) && e !== 0) {
      this.bidck.bidinfor.checkFormData('pricetype');
      ver = false;
    }
    // 中标日期
    if (this.isChan() && this.data.process == 'approved' && (this.data.bidWinningTime == '' || this.data.bidWinningTime == null) && e !== 0) {
      this.bidck.bidinfor.checkFormData('time');
      ver = false;
    }
    // 中标价格
    if (this.data.process == 'approved' && (this.data.biddingPrice == '' || this.data.biddingPrice == null) && e !== 0) {
      this.bidck.bidinfor.checkFormData('price');
      ver = false;
    }
    // 是否特价项目
    if (this.data.process == 'approved' && (this.data.isSpecial == '' || this.data.isSpecial == null) && e !== 0) {
      this.bidck.bidinfor.checkFormData('isSpecial');
      ver = false;
    }
    // opp productInformation biddingProductlist
    if (this.data.process == 'approved') {
      const businessType = this.infor.businessType;
      const bidWinningNotice = this.data.bidWinningNotice;
      const commitmentDocument = this.data.commitmentDocument;
      const demandLetter = this.data.demandLetter;
      const statement = this.data.statement;
      const support = this.data.support;
      const isSpecial = this.data.isSpecial;
      console.log(this.data.biddingProductlist);
      /*
       * 1.	业务模式=Direct Deal，且“是否投标授权”选“否，民营医院直接进单”，则在“中标备案”页面仅显示“上传场地勘验报告”这个字段和“中标产品信息”
       *
       * */
      let cheakedArr = []; //中标产品判读数组
      let isCheak; //产品最终结果
      if (e == 1) {
        // 业务模式=Direct Deal，且“是否投标授权”选“否，民营医院直接进单”  只验证  场地勘验报告 或 要货函
        if (this.infor && this.infor.tenderAuthorization === 'private' && this.infor.businessType === 'DIRECT') {
          if (demandLetter == '' || demandLetter == null || demandLetter == undefined) {
            let word = '';
            // this.infor.biddingNo == "其他类型" ? "场地勘验报告" : "要货函";
            if (this.infor.clientType === '民营医院') {
              word = '场地勘验报告';
            } else {
              if (this.infor.biddingNo === '其他类型') {
                word = '场地勘验报告';
              } else {
                word = '要货函';
              }
            }
            this.message.create('error', word);
            return;
          }
        } else {
          if (businessType == 'DIRECT') {
            // 取消验证中标通知书
            // if (bidWinningNotice == "" || bidWinningNotice == null || bidWinningNotice == undefined) {
            //   this.message.create('error', `中标通知书没有上传`);
            //   return;
            // }
            if (commitmentDocument == '' || commitmentDocument == null || commitmentDocument == undefined) {
              this.message.create('error', `投标及其他承诺文件`);
              return;
            }
            if (statement == '' || statement == null || statement == undefined) {
              this.message.create('error', `参与投标声明函`);
              return;
            }
            if (demandLetter == '' || demandLetter == null || demandLetter == undefined) {
              let word = '';
              // this.infor.biddingNo == "其他类型" ? "场地勘验报告" : "要货函";
              if (this.infor.clientType === '民营医院') {
                word = '场地勘验报告';
              } else {
                if (this.infor.biddingNo === '其他类型') {
                  word = '场地勘验报告';
                } else {
                  word = '要货函';
                }
              }
              this.message.create('error', word);
              return;
            }
            // if (support == "" || support == null || support == undefined) {
            //   this.message.create('error', "项目解决方案售前支持报告");
            //   return;
            // }
          } else {
            // 取消验证中标通知书
            // if (bidWinningNotice == "" || bidWinningNotice == null || bidWinningNotice == undefined) {
            //   this.message.create('error', `中标通知书没有上传`);
            //   return;
            // }
            if (demandLetter == '' || demandLetter == null || demandLetter == undefined) {
              let word = '';
              // this.infor.biddingNo == "其他类型" ? "场地勘验报告" : "要货函";
              if (this.infor.clientType === '民营医院') {
                word = '场地勘验报告';
              } else {
                if (this.infor.biddingNo === '其他类型') {
                  word = '场地勘验报告';
                } else {
                  word = '要货函';
                }
              }
              this.message.create('error', word);
              return;
            }
            // if (support == "" || support == null || support == undefined) {
            //   this.message.create('error', "项目解决方案售前支持报告");
            //   return;
            // }
          }
        }
      }
      this.data.biddingProductlist.map(res => {
        const checkd = res.biddingProductlist.some(vals => {
          if (vals.checked == true && vals.biddingPrice != '') {
            return true;
          }
        });
        cheakedArr.push(checkd);
      });
      isCheak = cheakedArr.some(res => res === true);
      // 价格非必选   注释
      // if (!isCheak) {
      //   this.message.create('error', "至少选择一种产品并填写价格");
      //   return;
      // }

      // ver = false;
    }
    /*
    * 非空验证
    * 未中标
    * */
    if (this.data.process === 'rejected' && e !== 0) {
      ver = this.bidck.checkFormData();
    }
    if (!ver && e == 1) {
      this.message.create('error', `有必须项没有填写`);
      return;
    }

    /*已中标
    * bidWinningbidExplain文件缺失或需特批说明
    * 赋值给remarks
    * */
    if (this.data.process == 'approved') {
      this.data.remarks = this.data.bidWinningbidExplain;
    }
    //  this.data.status = 0;
    if (this.data.bidWinningTime != null && this.data.bidWinningTime != '') {
      // let datas = `${this.data.bidWinningTime.year}-${this.data.bidWinningTime.month}-${this.data.bidWinningTime.day}`;
      // this.data.bidWinningTime = this.formatDate(datas);
      this.data.bidWinningTime = formatDatesNow(this.data.bidWinningTime).toString();
    } else {
      this.data.bidWinningTime = null;
    }
    if (this.data.bidWinningTime == 'NaN-NaN-NaN') {
      this.data.bidWinningTime = null;
    }
    this.data.biddingId = this.mainid;
    this.load = true;
    console.log(this.data);
    // return;
    const processInstanceTaskId = this.activeRoute.queryParams['_value'].processInstanceTaskId;
    if (processInstanceTaskId != null && processInstanceTaskId !== undefined && processInstanceTaskId !== '') {
      this.data.processInstanceTaskId = processInstanceTaskId;
    }
    this.http.post(url, this.data).subscribe((res => {
      if (res.code == '0000') {
        this.load = false;
        this.message.create('success', res.msg);
        if (e === 1){
          this.router.navigate(['/igt/my-task']);
        }
        //this.router.navigate(['/igt/my-task']);
      } else {
        this.load = false;
        this.message.create('error', res.msg);
      }
    }), (error => {
      this.load = false;
      this.message.create('error', '请求异常');
    }));
  }

  // 获取之前已保存的备案信息数据
  getBudidingData() {
    // debugger;
    const mainId = decodeString(this.activeRoute.queryParams['_value'].id);
    const url = '/act/ecom/bidding/getBudiding?mainId=';
    this.http.get(url + mainId).subscribe(res => {
      // 如果请求有数据赋值
      if (!res.data) {
        if (this.baseData.productInformations) {
          this.baseData.productInformations.map(v => {
            if (v.productInformations) {
              v.productInformations.map(va => {
                va.createdDate = v.createdDate;
                if (va.productInformations) {
                  va.productInformations.map(val => {
                    if (val.bmc) {
                      v.bmc = val.bmc;
                      va.bmc = val.bmc;
                    }
                    if (val.cluster) {
                      v.cluster = val.cluster;
                      va.cluster = val.cluster;
                    }
                  });
                }
              });
            }
          });
        }
        this.data.biddingProductlist = [...this.baseData.productInformations];
        this.data.process = 'approved';
        console.log('list');
        console.log(this.data.biddingProductlist);
      } else {
        if (res.data.biddingPrice) {
          // 价格保留两位小数
          res.data.biddingPrice = this.chNumber(res.data.biddingPrice);
          const status = this.activeRoute.queryParams['_value'].status;
          status == 'WZB' && (res.data.biddingPrice = NumberThousandth(res.data.biddingPrice));
        }
        if (res.data.biddingProductlist) {
          for (let p1 = 0; p1 < res.data.biddingProductlist.length; p1++) {
            if (res.data.biddingProductlist[p1].biddingProductlist) {
              for (let p2 = 0; p2 < res.data.biddingProductlist[p1].biddingProductlist.length; p2++) {
                if (res.data.biddingProductlist[p1].biddingProductlist[p2].biddingPrice) {
                  res.data.biddingProductlist[p1].biddingProductlist[p2].biddingPrice = this.chNumber(res.data.biddingProductlist[p1].biddingProductlist[p2].biddingPrice);
                  //res.data.biddingProductlist[p1].biddingProductlist[p2].biddingPrice = NumberThousandth(res.data.biddingProductlist[p1].biddingProductlist[p2].biddingPrice);
                }
              }
            }
          }
        }
        this.data = res.data;
        if (this.baseData && this.baseData.bidWinningTime) {
          this.baseData.bidWinningTime = formatDate(this.data.bidWinningTime);
        }
        // this.bidck.bidinfor.isResp = true;
      }


      // if (res.data) {
      //   this.data =JSON.parse(JSON.stringify(res.data));
      //   // 修改日期格式
      //   if (this.data && this.data.bidWinningTime) {
      //     this.data.bidWinningTime = formatDate(this.data.bidWinningTime);
      //   }
      // }
    });

  }

  formatDate(date) {
    date = new Date(Date.parse(date.replace(/-/g, '/'))); //转换成Data();
    console.log(date);
    var y = date.getFullYear();
    console.log(y);
    var m = date.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    return y + '-' + m + '-' + d;
  }

  // 截取数字保留两位小数
  chNumber(e) {
    if (e) {
      e = e.toString();
      let i = e.indexOf('.');
      if (i != -1 && i + 2 <= e.length) {
        return e.substring(0, i + 3);
      }
      return e;
    }
    return e;
  }

  public ddpJudge(leaderNo, leaderName) {
    if (this.activeRoute.queryParams['_value'].flag == 1) {
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

  dealerNo1: any;
  agreementAgenName1: any;

  isSave() {
    this.ddpJudge1(this.dealerNo1, this.agreementAgenName1);
  }

  public ddpJudge1(leaderNo, leaderName) {
    if (this.flag == 1) {
      return;
    }
    if (leaderNo === '1') {
      this.save(1);
      return;
    }
    const url = '/act/ecom/bidding/getDdpDateAndValid?dealerCode=' + leaderNo + '&dealerName=' + leaderName;
    this.http.get(url).subscribe(
      res => {
        if (res.data.isValid != null && res.data.isValid) {
          this.save(1);
          return;
        } else {
          let alertMsg = '';
          if (res.data.isValid != null) {
            alertMsg = '经销商DDP有效日期为' + res.data.ddpDate + ' ,当前已过有效期，是否确认审批通过？';
          } else {
            alertMsg = res.msg + ' 是否确认审批通过？';
          }
          this.modalService.confirm({
            nzTitle: '<h4>提醒</h4>',
            nzContent: alertMsg,
            nzOnOk: () => {
              this.save(1);
            }
          });
        }
      }, error => {
        this.message.error('请求失败!');
      }
    );
  }

  public cancelFn() {
    this.router.navigate(['/igt/my-task']);
  }

  toReturn() {
    window.history.back();
  }
}
