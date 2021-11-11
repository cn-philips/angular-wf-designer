import { Component, OnInit, ViewChild } from "@angular/core";
import { HttpService, FileService } from "../../services";
import {
  decodeString,
  formatDatesNow,
  getType,
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
  ) {}
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
      const baseInfo=await this.getBase();
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
         // this.infor = Object.assign(this.infor, res.data);
         this.infor=res.data;
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
          this.infor.detail.status=this.activatedRouter.queryParams['_value'].state;
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
          this.dataBase = Object.assign({}, res.data);
          this.dataBase.entryMode = param.entryMode; //进单模式
          this.dataBase.region = param.region; //区域
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
          this.dataBase.contractDdpStatus = param.contractDdpStatus; //合同买方的ddpstatus
          this.dataBase.foreignTradeCompany = param.foreignTradeCompany; //外贸易公司
          this.dataBase.invoiceInformation = param.invoiceInformation; //币制
         
          this.dataBase.bidWinningPrice=res.data.bidWinningPrice?res.data.bidWinningPrice:"";//中标价格
          this.dataBase.relationshipLink=params.businessOpportunityHierarchyLink; // 商机层级关系链接
          this.dataBase.priceRange = params.samplingInspection; // 是否抽样审核
          this.dataBase.sofonFile = params.sofonFile;
          this.dataBase.countryOrigin = params.countryOrigin; // 原产地
          this.dataBase.finalSofonQuotation = params.sofonNo; //finalSofonQuotation
          this.dataBase.tradeList = params.cosOppTradeIns!=null&&params.cosOppTradeIns.length>0?params.cosOppTradeIns:[{name:"",costs1:""}]; // tradeIn
          this.dataBase.warrantyList = params.cosOppExtendedWarranties!=null&&params.cosOppExtendedWarranties!=""&&params.cosOppExtendedWarranties.length>0?params.cosOppExtendedWarranties:[{posIdName:"",posLocalCtp:""}] // 延长保修
          this.dataBase.productList = params.cosOppThirdParties!=null&&params.cosOppThirdParties!=""&&params.cosOppThirdParties.length>0?params.cosOppThirdParties:[{thirdPartyName:"",total:""}] // 第三方
          this.dataBase.application = params.applications!=null&&params.applications!=""&&params.applications.length>0?params.applications:[{productName:"",localCtp1:""}]
          this.dataBase.applicationPrice = params.applicationPrice;          
          this.dataBase.applications=params.applications!=null&&params.applications!=""&&params.applications.length>0?params.applications:[{productName:"",localCtp:""}]      
          if (
            this.dataBase.warrantyList &&
            this.dataBase.warrantyList.length > 0
          ) {
            this.dataBase.warrantyList.map((res) => {
              res.name = res.posIdName;
              res.price = res.posLocalCtp;
              delete res.posIdName;
              delete res.posLocalCtp;
            });
          }
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
        this.dataBase.isUsdOrRmb=(res.data.isUsdOrRmb!=null&&res.data.isUsdOrRmb!=""&&res.data.isUsdOrRmb!=undefined)?res.data.isUsdOrRmb:""; 
        
         
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
}
