import { Component, OnInit, ViewChild } from "@angular/core";
import { HttpService, FileService } from "../../services";
import {
  decodeString,
  formatDatesNow,
  getType,
  standardTime,
  isadopt
} from "../../../assets/js/tools";
import { Router, ActivatedRoute } from "@angular/router";
import { NzMessageService, UploadFile } from "ng-zorro-antd";
import { PreOrderBaseInfoComponent } from "../preOrder/baseInfo/baseInfo.component";

@Component({
  selector: "app-inorder-examine",
  templateUrl: "./inorder-examine.component.html",
  styleUrls: ["./inorder-examine.component.scss"],
})
export class InorderExamineComponent implements OnInit {
  constructor(
    private http: HttpService,
    private router: Router,
    public activatedRouter: ActivatedRoute,
    private message: NzMessageService
  ) { }
  public activedId: any = "pending-tab";
  infor: any = {
    productList: [], // 产品列表
    detail: {
      id: "",
      flag: "",
      status: "examine",
    },
  };
  dataBase: any = {};
  @ViewChild("baseInfo")
  baseInfo: PreOrderBaseInfoComponent;
  ngOnInit() {

    const ASYNS = async () => {

      const result = await this.getDataBase();
      this.baseInfo.setColSpanOfConfirmTable(this.infor);
      const params = await this.getCpdata();
      const results = await this.getQuery(result, params);
      if (this.dataBase.businessModel == 'DISTRIBUTOR') {
        await this.getdistributorDate();
      }
      if (this.dataBase.invoiceInformation === 'USD') {
        await this.getIepoolDate();
      }
      const baseInfos = await this.getBase();

    };
    ASYNS();
  }
  getDataBase() {
    //来至于合同概要表信息
    // 获取mainid
    const mainId = decodeString(this.activatedRouter.queryParams["_value"].id);
    const url = `/act/preparation/queryContractSummary?mainId=${mainId}`;
    // 获取基础信息数据
    return new Promise((resolve, reject) => {
      this.http.post(url).subscribe((res) => {
        if (res.data) {
          this.infor = JSON.parse(JSON.stringify(res.data));
          this.infor.referenceId = res.data.referenceId; //添加referenceId
          resolve(res.data);
          if (this.infor.sameFlag != null) {
            this.infor.sameFlag = this.infor.sameFlag.toString();
          }
          this.infor.detail = {
            id: "",
            flag: "",
            status: "",
          };
          this.infor.detail.status = this.activatedRouter.queryParams['_value'].state;
          this.infor.isPrebookApply = res.data.isPrebookApply != null ? res.data.isPrebookApply.toString() : "0";
        } else {
          this.message.create("error", "获取数据失败");
        }
      });
    });
  }
  getQuery(
    param,
    params //查询order summary
  ) {
    const mainId = decodeString(this.activatedRouter.queryParams["_value"].id);
    let url = `/act/preparation/queryOrderSummary?mainId=${mainId}`;
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe((res) => {
        if (res.code === "0000" && res.data) {
          this.dataBase = res.data
          this.dataBase.entryMode = param.entryMode; //进单模式
          this.dataBase.team = param.team;//team
          this.dataBase.region = param.region;//大区域
          this.dataBase.smallArea = param.smallArea;//小区域
          this.dataBase.endUserId = param.endUserId; //最终用户id
          this.dataBase.poolEndDate = standardTime(this.infor.poolEndDate);//外贸易公司日期
          this.dataBase.contractEndDate = standardTime(param.contractEndDate);//经销商日期
          this.dataBase.businessModel = param.businessModel; //业务模式
          this.dataBase.bidWinningNotice = param.bidWinningNotice; //中标通知书
          this.dataBase.distributor = param.tenderingCompany; //投标公司
          this.dataBase.endUserContract = param.contractBuyer; //合同买方
          this.dataBase.ddpStatus = param.ddpStatus; //经销商的ddpStatus
          this.dataBase.endUser = param.endUser; //最终用户
          this.dataBase.agent = param.distributor; //经销商
          this.dataBase.hospitalNature = param.hospitalNature; //医院性质
          this.dataBase.productModel = param.productModel; //产品型号
          this.dataBase.nmpaName = param.nmpaName; //nmpaName
          this.dataBase.contractPrice = param.contractPrice; //合同价格
          this.dataBase.paymentProvision = param.paymentProvision; //付款条款
          this.dataBase.referenceId = param.referenceId; //添加referenceId
          this.dataBase.dealFormId = param.dealFormId;//dealFromid
          this.dataBase.contractDdpStatus = param.contractDdpStatus; //合同买方的ddpstatus
          this.dataBase.foreignTradeCompany = param.foreignTradeCompany; //外贸易公司
          this.dataBase.invoiceInformation = param.invoiceInformation; //币制

          this.dataBase.bidWinningPrice = res.data.bidWinningPrice ? res.data.bidWinningPrice : "";//中标价格
          this.dataBase.relationshipLink = params.businessOpportunityHierarchyLink; // 商机层级关系链接
          this.dataBase.priceRange = params.samplingInspection; // 是否抽样审核
          this.dataBase.sofonFile = params.sofonFile;
          this.dataBase.countryOrigin = params.countryOrigin; // 原产地
          this.dataBase.countryOriginEn = params.countryOriginEn ? params.countryOriginEn : ""; // 原产地
          this.dataBase.medicalDeviceName = params.medicalDeviceName;//医疗器械名称
          this.dataBase.nmpaRegistrationExpried = params.nmpaRegistrationExpried;//NMPA证有效期截止日期
          this.dataBase.financialProgramme = params.financialProgramme; //金融方案价格
          this.dataBase.financialProgrammeTxt = params.financialProgrammeTxt; //金融方案文本框的值
          this.dataBase.tradeInCost = params.tradeInCost;//tradeIn总额
          this.dataBase.financialProgrammeCost = params.financialProgrammeCost; //金融方案总金额
          this.dataBase.agreementNo = param.agreementNo; //经销商协议号;
          this.dataBase.dealerCode = param.dealerCode; //经销商code;
          this.dataBase.centralized = param.centralized; //集采
          this.dataBase.actualSales = param.actualSales; //实际销售人
          // this.dataBase.finalSofonQuotation = params.finalSofonQuotation; //finalSofonQuotation
          this.dataBase.tradeList = params.cosOppTradeIns != null && params.cosOppTradeIns.length > 0 ? params.cosOppTradeIns : [{ name: "", costs1: "" }]; // tradeIn
          this.dataBase.otherList = params.otherList != null && params.otherList != "" && params.otherList.length > 0 ? params.otherList : [] //其他预留
          this.dataBase.warrantyList = params.cosOppExtendedWarranties != null && params.cosOppExtendedWarranties != "" && params.cosOppExtendedWarranties.length > 0 ? params.cosOppExtendedWarranties : []; // 延长保修
          this.dataBase.productList = params.cosOppThirdParties != null && params.cosOppThirdParties != "" && params.cosOppThirdParties.length > 0 ? params.cosOppThirdParties : [{ thirdPartyName: "", total: "" }] // 第三方
          this.dataBase.application = params.applications != null && params.applications != "" && params.applications.length > 0 ? params.applications : [{ productName: "", localCtp1: "" }]
          this.dataBase.applicationPrice = params.applicationPrice;
          this.dataBase.applications = params.applications != null && params.applications != "" && params.applications.length > 0 ? params.applications : [{ productName: "", localCtp: "" }]
          this.dataBase.isPrebookApply = param.isPrebookApply != null ? param.isPrebookApply.toString() : '0';
          this.dataBase.contractCancelReferenceId = param.contractCancelReferenceId;
          this.dataBase.contractCancelMainId = param.contractCancelMainId;
          this.dataBase.prebookReferenceId = param.prebookReferenceId;
          this.dataBase.prebookProductId = param.prebookProductId;
          this.dataBase.prebookMainId = param.prebookMainId;
          this.dataBase.priceDifferent = param.priceDifferent //合cp价格是否一至
          this.dataBase.isVerify = param.isVerify; //是否一样
          this.dataBase.supportingFile = param.supportingFile; //上传支持文件
          this.dataBase.supportingFileNames = param.supportingFileNames //支持文件名称
          if (
            this.dataBase.productList &&
            this.dataBase.productList.length > 0
          ) {
            this.dataBase.productList.map((res) => {
              res.name = res.thirdPartyName;
              res.price = res.thirdPartyPrice;
              delete res.thirdPartyName;
              delete res.thirdPartyPrice;
            });
          }
          resolve(this.dataBase)
        }
      });
    });
  }

  getCpdata() { //来自cp的
    const mainId = decodeString(this.activatedRouter.queryParams["_value"].id);
    let url = `/act/preparation/queryInfoForOrderSummaryFromCP?mainId=${mainId}`;
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe((rest) => {
        if (rest.data) {

          resolve(rest.data);

        }
      });
    });
  }

  getBase() //查询基础数据
  {
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    let url = `/act/preparation/queryInfoForOrderSummary?mainId=${mainId}`;
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe(res => {
        this.dataBase.isUsdOrRmb = (res.data.isUsdOrRmb != null && res.data.isUsdOrRmb != "" && res.data.isUsdOrRmb != undefined) ? res.data.isUsdOrRmb : "";


      })
    })
  }
  //提交效验经销商日期
  getdistributorDate() {
    let param = {
      pageNo: 1,
      pageSize: 5,
      agreementNo: "", //协议号
      dealerCode: "", //经销code
      dealerName: this.dataBase.agent, //经销商名称
      selectName: "", //当前选中
    }
    let url = `/act/preparation/getDealersOnlyWithRegFlag`
    return new Promise((resolve, reject) => {
      this.http.post(url, param).subscribe((res => {

        if (res.code == '0000' && res.data) {
          let data = res.data.rows;
          if (data.length > 0) {
            let time = standardTime(data[0].ddpValidUntil);
            this.dataBase.ddpStatus = isadopt(time);
            this.infor.ddpStatus = isadopt(time);
            this.dataBase.contractEndDate = formatDatesNow(time);
            this.infor.contractEndDate = formatDatesNow(time);
          }
          resolve(data)
        }
      }), (error) => {
        this.message.create("error", "请求失败!");

      })
    })
  }
  //提交获取外贸易
  getIepoolDate() {
    let param = {
      corporateName: this.dataBase.foreignTradeCompany,
    }
    let url = `/act/preparation/getIePool`
    return new Promise((resolve, reject) => {
      this.http.post(url, param).subscribe((res => {
        if (res.code == '0000' && res.data) {
          let { data } = res;
          if (data.length > 0) {
            let time = standardTime(data[0].ddpValidUntil);
            this.dataBase.poolEndDate = formatDatesNow(time);
            this.infor.poolEndDate = formatDatesNow(time);
            this.dataBase.contractDdpStatus = isadopt(time);
            this.infor.contractDdpStatus = isadopt(time);
          }
          resolve(data)
        }
      }), (error) => {
        this.message.create("error", "请求失败!");
      })
    })
  }
  public myskip(val): void {
    // 外部触发tab选项卡的事件
    this.activedId = val;
  }
  public tabclick(val) {
    this.activedId = val.nextId;
  }

  toReturn() {
    window.history.back();
  }
}
