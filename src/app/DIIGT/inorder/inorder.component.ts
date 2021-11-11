import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService, FileService } from '../../services';
import { decodeString, formatDatesNow,NumberThousandth} from '../../../assets/js/tools';
import { Router, ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import { PreOrderBaseInfoComponent } from '../preOrder/baseInfo/baseInfo.component';


@Component({
  selector: 'app-inorder',
  templateUrl: './inorder.component.html',
  styleUrls: ['./inorder.component.scss']
})
export class InorderComponent implements OnInit {

  constructor(private http: HttpService, private router: Router, public activatedRouter: ActivatedRoute, private message: NzMessageService,) { }
  infor: any = {
    productList: [], // 产品列表
    detail: {
      id: '',
      flag: '',
      status: 'examine',
    },
  };
  @ViewChild('childbase') public childbase;
  public load: any = false;
  public activedId: any = 'pending-tab';
  flag: any;
  addoff: any = true; //判断是新增还是修改
  public dataBase: any = {
    isRecycle:"0", //是否旧机回收
    contractSummaryId: "",
    entryMode: "", //进单模式
    businessModel: "", //业务模式
    region: "", //区域
    bidWinningNotice: "", //中标通知书
    bidWinningPrice: "", //中标价格
    isUsdOrRmb: "",//中标价格币制
    distributor: "",//投标商
    agent: "",//代理商
    endUserContract: "",//合同买方
    ddpStatus: "", //ddp状态
    endUser: "",//最终用户
    hospitalNature: "",//医院性质
    productModel: "", //产品型号
    nmpaName: "", //nmpaName
    relationshipLink: "", //商机层级链接
    opportunityId: "", //opportunityId
    contractPrice: "",//合同价格
    priceRange: "", //价格区间
    paymentProvision: "", //付款条款
    promotionPlan: "",//促销计划
    tradeList: "",
    incentiveScheme: "", //经销商奖励计划
    dealerAudit: "0", //经销商自采第三方核查
    countryOrigin: "", //原产地
    finalSofonQuotation: "",
    financialProgramme: "",//飞利浦金融方案
    sofonFile: "",
    enclosure: "", //附件
    customerRequestLetter:"", //客户要货函日期
    contractConfirmationDate: new Date(), //合同确认日期
    remarks: "", //
    contractVersion: "",//合同版本
    isOCAP: "0", //合同是否有ocap条款
    specialApprovalDocuments: "", //特批文件后补
    specialApprovalDocumentsName: "", //特批文件名称
    flag: "APPROVED",   //退回还是通过 APPROVED 通过 REJECTED 拒绝
    status: 0,
    bidWinningNoticeCheckFlag: "0",//中标通知书是否已查
    siteReportCheckFlag: "0",//场地报告是否已查
    projectSolutionsCheckFlag: "0",//项目解决方案售前支持报告是否已查
    biddingDocumentsCheckFlag: "0",//招标文件是否已查
    tenderDocumentsCheckFlag: "0",//投标文件是否已查
    endUserContractCheckFlag: "0",//最终用户合同是否已查
    projectAnalysisTableCheckFlag: "0",//项目分析表是否已查
    paymentProvisionCheckFlag: "0",//付款条款是否已查
    shipmentDeliveryCheckFlag: "0",//装运及交货是否已查
    installationWarrantyCheckFlag: "0",//安装及保修是否已查
    sitePreparationCheckFlag: "0",//场地准备是否已查
    otherCheckFlag: "0",//其他是否已查
    supportFileMissingCheckFlag: "0",//支持文件缺失特批进单是否已查
    amountDifferenceCheckFlag: "0",//直投订单合同金额和中标金额有价差是否已查
    performanceBondCheckFlag: "0", //履约保函是否已查
    mrShieldingCompanyCheckFlag: "0", //磁屏蔽是否已查
    confirmationFileCheckFlag: "0",//igt是否已查
    warrantyList: [],
    productList: []
  };
  @ViewChild('baseInfo')
  baseInfo: PreOrderBaseInfoComponent
  ngOnInit() {
    this.flag = this.activatedRouter.queryParams['_value'].flag;
    this.load=true;
    const ASYNS = async () => {
      let rezult = await this.getQuery();//查询order summary 
      this.getCpdata();
      let dealData = await this.getContractBase();  //查询合同概要表
      this.baseInfo.setColSpanOfConfirmTable(this.infor);
      let baseData = await this.getBase();  //查询基础数据  
      this.load=false;
    };
    ASYNS();
  }

  getContractBase() {   //来至于合同概要表信息
    // 获取mainid
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const url = `/act/preparation/queryContractSummary?mainId=${mainId}`;
    // 获取基础信息数据
    return new Promise((resolve, reject) => {
      this.http.post(url).subscribe(res => {
        if (res.data) {
          this.infor = res.data;
          this.infor.sameFlag = this.infor.sameFlag.toString();
          this.dataBase.entryMode = res.data.entryMode //进单模式
          this.dataBase.region = res.data.region;//区域
          this.dataBase.businessModel = res.data.businessModel; //业务模式
          this.dataBase.bidWinningNotice = res.data.bidWinningNotice;//中标通知书
          this.dataBase.bidWinningNoticeNames = res.data.bidWinningNoticeNames; //中标通知书名称
          this.dataBase.distributor = res.data.tenderingCompany; //投标公司
          this.dataBase.endUserContract = res.data.contractBuyer;//合同买方
          this.dataBase.ddpStatus = res.data.ddpStatus //经销商的ddpStatus
          this.dataBase.endUser = res.data.endUser; //最终用户
          this.dataBase.agent = res.data.distributor//经销商
          this.dataBase.hospitalNature = res.data.hospitalNature //医院性质
          this.dataBase.productModel = res.data.productModel; //产品型号
          this.dataBase.nmpaName = res.data.nmpaName //nmpaName
          this.dataBase.contractPrice = res.data.contractPrice //合同价格
          this.dataBase.paymentProvision = res.data.paymentProvision //付款条款
          this.dataBase.referenceId = res.data.referenceId; //添加referenceId
          this.dataBase.contractDdpStatus = res.data.contractDdpStatus; //合同买方的ddpstatus
          this.dataBase.foreignTradeCompany = res.data.foreignTradeCompany; //外贸易公司
          this.dataBase.invoiceInformation = res.data.invoiceInformation;   //币制
          this.dataBase.priceRange = res.data.sampleAuditFlag // 是否抽样审核         
          this.infor.detail = {
            id: '',
            flag: '',
            status: '',
          }
          this.infor.detail.status = this.activatedRouter.queryParams['_value'].state;
          this.dataBase = Object.assign({}, this.dataBase);
          resolve(res.data)
        } else {
          this.message.create('error', '获取数据失败');
        }
      });
    })
  }
  getQuery() //查询order summary
  {
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    let url = `/act/preparation/queryOrderSummary?mainId=${mainId}`;
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe(res => {        
        this.addoff = res.data ? false : true;
        this.addoff === false && (this.dataBase = Object.assign(this.dataBase, res.data));               
        this.dataBase.isRecycle=this.dataBase.isRecycle!=null?this.dataBase.isRecycle:'0';
        resolve(this.addoff);
      })
    })


  }
  getBase() //查询基础数据
  {
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    let url = `/act/preparation/queryInfoForOrderSummary?mainId=${mainId}`;
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe(res => {
        this.dataBase.opportunityId = res.data.opportunityId; //oppid;
        //this.dataBase.bidWinningPrice = (res.data.biddingPrice!=null)&&(res.data.biddingPrice!="")?res.data.biddingPrice:""//中标价格 
        this.dataBase.bidWinningPrice = res.data.biddingPrice ? res.data.biddingPrice : "";
        this.dataBase.isUsdOrRmb = (res.data.isUsdOrRmb!=null&&res.data.isUsdOrRmb!=""&&res.data.isUsdOrRmb!=undefined)? res.data.isUsdOrRmb : "";
        this.dataBase.promotionPlan = res.data.promotions != "" ? res.data.promotions : ""; //促销计划
        this.dataBase.incentiveScheme = res.data.rebates != "" ? res.data.rebates : ""; //经销商奖励计划
        this.dataBase.specialApprovalDocuments = res.data.supportFileMissing; //特批文件后补
        this.dataBase.specialApprovalDocumentsName = res.data.supportFileMissingFileName; //特批文件名称
        resolve(this.dataBase)
      })
    })


  }
  getCpdata() //来自cp的
  {

    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    let url = `/act/preparation/queryInfoForOrderSummaryFromCP?mainId=${mainId}`
    this.http.get(url).subscribe(rest => {
      if (rest.data) {
        this.dataBase.relationshipLink = rest.data.businessOpportunityHierarchyLink // 商机层级关系链接

        this.dataBase.sofonFile = rest.data.sofonFile;//sofonFile
        this.dataBase.sofonFileNames = rest.data.sofonFileNames;//名字
        this.dataBase.countryOrigin = rest.data.countryOrigin?rest.data.countryOrigin:"" // 原产地
       this.dataBase.finalSofonQuotation=rest.data.sofonNo //finalSofonQuotation
       
        this.dataBase.tradeList = rest.data.cosOppTradeIns!=null&&rest.data.cosOppTradeIns.length>0?rest.data.cosOppTradeIns:[{name:"",costs1:""}]; // tradeIn
        this.dataBase.warrantyList = rest.data.cosOppExtendedWarranties!=null&&rest.data.cosOppExtendedWarranties!=""&&rest.data.cosOppExtendedWarranties.length>0?rest.data.cosOppExtendedWarranties:[{posIdName:"",posLocalCtp:""}] // 延长保修
        this.dataBase.productList = rest.data.cosOppThirdParties!=null&&rest.data.cosOppThirdParties!=""&&rest.data.cosOppThirdParties.length>0?rest.data.cosOppThirdParties:[{thirdPartyName:"",total:""}] // 第三方
        //  this.dataBase.incentiveScheme=rest.data.OrderRebateDTOList //经销商奖励
        //  this.dataBase.finalSofonQuotation=rest.data.oaSofonNumber //finalSofonQuotation
        //  this.dataBase.productList=rest.data.thirdProductsDTOList //第三方
        //  this.dataBase.priceRange=rest.data.isSamplingInspection //价格区间;
        //  this.dataBase.dealerAudit=rest.data.selfThirdPartyDTOList //经销商自采第三方核查        
        // this.dataBase.application = rest.data.application;
        // this.dataBase.applicationPrice = rest.data.applicationPrice;
        this.dataBase.applications=rest.data.applications!=null&&rest.data.applications!=""&&rest.data.applications.length>0?rest.data.applications:[{productName:"",localCtp1:""}]
      }


      if (this.dataBase.warrantyList && this.dataBase.warrantyList.length > 0) {
        this.dataBase.warrantyList.map(res => {
          res.name = res.posIdName ? res.posIdName : "";
          res.price = res.posLocalCtp ? res.posLocalCtp : "";
          delete res.posIdName;
          delete res.posLocalCtp;
        });
      }
      if (this.dataBase.productList && this.dataBase.productList.length > 0) {
        this.dataBase.productList.map(res => {
          res.name = res.thirdPartyName ? res.thirdPartyName : "";
          res.price = res.total ? res.total : "";
          delete res.thirdPartyName;
          delete res.total;
        })
      }
    })

  }
  submit(number: number, flag?: any) {
    this.dataBase.flag = flag;
    this.dataBase.status = number;
    let customerDate = this.dataBase.customerRequestLetter;
    let contractDate = this.dataBase.contractConfirmationDate;
    this.dataBase.customerRequestLetter = customerDate ? formatDatesNow(customerDate) : "";
    this.dataBase.contractConfirmationDate = contractDate ? formatDatesNow(contractDate) : "";
    this.dataBase.contractSummaryId = decodeString(this.activatedRouter.queryParams['_value'].id);
    this.childbase.cheakData(flag);
    if(number==1&&flag=='REJECTED')
    {
      const cheak = this.childbase.checkFormData();
      if (!cheak) {
        this.myskip("complete-duc");
        this.message.create("error","请填写退回理由");
        return;
      }
    }    
    if (number == 1 && flag == 'APPROVED') {
      const cheak = this.childbase.checkFormData();
      if (!cheak) {
        this.myskip("complete-duc");
        this.message.create("error","有必填项没有填写!");
        return;
      }
      if (this.dataBase.bidWinningNoticeCheckFlag != '1') {
        this.message.create("error", "请核查中标通知书")
        return;
      }
      if (this.dataBase.siteReportCheckFlag != '1') {
        this.message.create("error", "请核查场地报告")
        return;
      }
      if (this.dataBase.projectSolutionsCheckFlag != '1') {
        this.message.create("error", "请核查项目解决方案售前支持报告")
        return;
      }
      if (this.infor.sampleAuditFlag == '1') {
        if (this.infor.tenderNo!='其他类型') {
          if (this.dataBase.biddingDocumentsCheckFlag != '1') {
            this.message.create("error", "请核查招标文件")
            return;
          }
        }
        if (this.infor.tenderNo!='其他类型') {
          if (this.dataBase.tenderDocumentsCheckFlag != '1') {
            this.message.create("error", "请核查投标文件")
            return;
          }
        }
        if (this.dataBase.endUserContractCheckFlag != '1') {
          this.message.create("error", "请核查最终用户合同")
          return;
        }
        if (this.infor.businessModel == 'DISTRIBUTOR') {
          if (this.dataBase.projectAnalysisTableCheckFlag != '1') {
            this.message.create("error", "请核查项目分析表")
            return;
          }
        }
      }
      if (this.dataBase.paymentProvisionCheckFlag != '1') {
        this.message.create("error", "请核查付款条款")
        return;
      }
      if (this.dataBase.shipmentDeliveryCheckFlag != '1') {
        this.message.create("error", "请核查装运及交货")
        return;
      }
      if (this.dataBase.installationWarrantyCheckFlag != '1') {
        this.message.create("error", "请核查安装及保修")
        return;
      }
      if (this.dataBase.businessModel == 'DIRECT') {
        if (this.dataBase.amountDifferenceCheckFlag != '1') {
          this.message.create("error", "请核查直投订单合同金额和中标金额有价差")
          return;
        }
      }
      if (this.dataBase.sitePreparationCheckFlag != '1') {
        this.message.create("error", "请核查场地准备")
        return;
      }

      if (this.dataBase.performanceBondCheckFlag != '1') {
        this.message.create("error", "请核查履约保函")
        return;
      }
      if (this.infor.sampleAuditFlag == '1') {
        if (this.dataBase.supportFileMissingCheckFlag != '1') {
          this.message.create("error", "请核查支持文件缺失特批进单")
          return;
        }
      }
      if (this.infor.mrShieldingCompany != null && this.infor.mrShieldingCompany != undefined && this.infor.mrShieldingCompany != "") {
        if (this.dataBase.mrShieldingCompanyCheckFlag != '1') {
          this.message.create("error", "请核查磁共振屏蔽公司")
          return;
        }
      }
      if (this.infor.confirmationFile != null && this.infor.confirmationFile != undefined && this.infor.confirmationFile != "") {
        if (this.dataBase.confirmationFileCheckFlag != '1') {
          this.message.create("error", "请核查磁共振屏蔽公司")
          return;
        }
      }
      if (this.dataBase.otherCheckFlag != '1') {
        this.message.create("error", "请核查其他")
        return;
      }
    }   
    let url = "/act/preparation/saveOrderSummur";    
    this.load = true;
    this.http.post(url, this.dataBase).subscribe((res => {
      if (res.code == '0000') {
        this.message.create('success', `操作成功`);
        this.router.navigate(['/igt/my-task']);
        this.load = false;
      }
      else {
        this.message.create('error', res.msg);
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "请求异常!");
    }));
  }

  public myskip(val): void { // 外部触发tab选项卡的事件
    this.activedId = val;
  }
  public tabclick(val) {
    this.activedId = val.nextId;
  }


}
