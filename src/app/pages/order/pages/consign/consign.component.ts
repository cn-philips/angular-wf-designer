import { Component, OnInit, ViewChild } from '@angular/core';
import { decodeString, formatDatesNow, standardTime, isadopt } from '@core/util/tools';
import { HttpService, ServesiceService } from '@core/services';
import { NzMessageService } from 'ng-zorro-antd';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterExtendService } from '@app/modern-themes/services/router-extend.service';


@Component({
  selector: "app-consign",
  templateUrl: "./consign.component.html",
  styleUrls: ["./consign.component.scss"],
})
export class ConsignComponent implements OnInit {
  // tab标签
  isAgres: any = false;
  //弹窗的数据
  public showData = {
    refuseReason: "",
    remarks: "",
    file: "",
    title: "",
    code: "",
  };
  activedId: any = "tab3";
  @ViewChild("child") child;
  @ViewChild("childbase") public childbase;
  param = {
    mainId: "",
    remark: "",
    file: "",
    check: "",
  };
  public isShowDate: any = false;
  public isShowDates: any = false;
  public isOpen: any = false;
  public load: any = false;
  public mergeData: any = {};
  public fileFileList: any = []; //文件列表
  public productConfFileList: any = []; //
  public file2FileList = []; //
  public file3FileList = []; //
  public params: any = {
    mainId: "",
    remark: "",
    file: "",
    file2: "",
    file3: "",
    check: "",
    attachmentIds: [],
    salesAgreementNo: "", // 买卖协议号
    importAgreementNo: "", // 进口协议号
    purchaseOrderNumber: "", // 采购订单号
    solution: "", // 是否含有solution
    productConf: "", // 产品配置
    productConfFile: "", // 产品配置文件
    invoiceMailingInformation: "", // 发票邮寄信息
    portShipment: "", // 发货港
    typeShipping: "", // 运输方式
    portDestination: "", // 目的港
    contractDate: null, // 合同确认日期
    isContract: "", // 正式合同已上传
    contractFile: "", // 合同文件
    fileList: [], //合同文件多文件上传
    contractFileNames: "", //
    priceTerms: "", // 价格术语
    tmpList: [], //合同模版
    addressee: "", //收件人
    addresseeTel: "", //收件人电话
    reason: "", //退回理由
  };
  public dataBase: any = {
    detail: {
      id: "",
      flag: "",
      status: "",
    },
  };
  public signingData: any = {
    productList: [], // 产品列表
    detail: {
      id: "",
      flag: "",
      status: "",
    },
    salesAgreementNo: "", // 买卖协议号
    importAgreementNo: "", // 进口协议号
    purchaseOrderNumber: "", // 采购订单号
    solution: "", // 是否含有solution
    productConf: "", // 产品配置
    productConfFile: "", // 产品配置文件
    invoiceMailingInformation: "", // 发票邮寄信息
    portShipment: "", // 发货港
    typeShipping: "", // 运输方式
    portDestination: "", // 目的港
    contractDate: null, // 合同确认日期
    isContract: "0", // 正式合同已上传
    contractFile: "", // 合同文件
    priceTerms: "", // 价格术语
    fileFileList: [], //文件列表
    tmpList: [], //合同列表
    addressee: "", //收件人
    addresseeTel: "", //收件人电话
  };

  public osData: any = {};

  constructor(
    private http: HttpService,
    private message: NzMessageService,
    public activatedRouter: ActivatedRoute,
    private ServesiceService: ServesiceService,
    private router: Router,
    private routerExtendService: RouterExtendService
  ) {}

  ngOnInit() {
    // 获取mainId
    const mainId = decodeString(this.activatedRouter.queryParams["_value"].id);
    this.dataBase.detail.flag = this.activatedRouter.queryParams["_value"].flag;
    const parm = {
      // mainId: mainId
    };

    const ASYNS = async () => {
      var contractData,
        orderData,
        signingData,
        cpData = {};
      this.load = true;
      contractData = await this.getContract();
      cpData = await this.getCpdata();
      orderData = await this.getOrderSummary(contractData, cpData);

      if (this.dataBase.businessModel == "DISTRIBUTOR") {
        await this.getdistributorDate();
      }
      if (this.dataBase.invoiceInformation === "USD") {
        await this.getIepoolDate();
      }
      signingData = await this.getDataDetail();
      //await this.getBase();
      this.mergeData = Object.assign(contractData, orderData, signingData);
      await this.getTemplate();
      await this.getBaseOrder();
    };
    ASYNS();
  }
  //取消
  isshowDateCancel() {
    this.isShowDate = false;
  }
  //取消
  isshowDateCancels() {
    this.isShowDates = false;
  }
  //合并ordersummary对像
  public getOrderSummary(param, params) {
    const mainId = decodeString(this.activatedRouter.queryParams["_value"].id);
    // 获取orderSummary数据
    const url2 = "/act/preparation/queryOrderSummary?mainId=" + mainId;
    return new Promise((resolve, reject) => {
      this.http.get(url2).subscribe(
        (rest) => {
          // console.log('ordersum');
          // console.log(rest);
          if (rest.data) {
            this.osData = rest.data;
            this.osData.entryMode = param.entryMode; //进单模式
            this.osData.team = param.team; //team
            this.osData.region = param.region; //大区域
            this.osData.smallArea = param.smallArea; //小区域
            this.osData.endUserId = param.endUserId; //最终用户id
            this.osData.poolEndDate = standardTime(param.poolEndDate); //外贸易公司日期
            this.osData.contractEndDate = standardTime(param.contractEndDate); //经销商日期
            this.osData.businessModel = param.businessModel; //业务模式
            this.osData.bidWinningNotice = param.bidWinningNotice; //中标通知书
            this.osData.distributor = param.tenderingCompany; //投标公司
            this.osData.endUserContract = param.contractBuyer; //合同买方
            this.osData.ddpStatus = param.ddpStatus; //经销商的ddpStatus
            this.osData.endUser = param.endUser; //最终用户
            this.osData.agent = param.distributor; //经销商
            this.osData.hospitalNature = param.hospitalNature; //医院性质
            this.osData.productModel = param.productModel; //产品型号
            this.osData.nmpaName = param.nmpaName; //nmpaName
            this.osData.contractPrice = param.contractPrice; //合同价格
            this.osData.paymentProvision = param.paymentProvision; //付款条款
            this.osData.referenceId = param.referenceId; //添加referenceId
            this.osData.dealFormId = param.dealFormId; //dealFromid
            this.osData.contractDdpStatus = param.contractDdpStatus; //合同买方的ddpstatus
            this.osData.foreignTradeCompany = param.foreignTradeCompany; //外贸易公司
            this.osData.invoiceInformation = param.invoiceInformation; //币制
            this.osData.bidWinningPrice = rest.data.bidWinningPrice
              ? rest.data.bidWinningPrice
              : ""; //中标价格
            this.osData.relationshipLink =
              params.businessOpportunityHierarchyLink; // 商机层级关系链接
            this.osData.priceRange = params.samplingInspection; // 是否抽样审核
            this.osData.sofonFile = params.sofonFile;
            this.osData.countryOrigin = params.countryOrigin; // 原产地中文
            this.osData.countryOriginEn = params.countryOriginEn; //原产地英文
            this.osData.medicalDeviceName = params.medicalDeviceName; //医疗器械名称
            this.osData.nmpaRegistrationExpried =
              params.nmpaRegistrationExpried; //NMPA证有效期截止日期
            this.osData.financialProgramme = param.financialProgramme; //金融方案价格
            this.osData.financialProgrammeTxt = param.financialProgrammeTxt; //金融方案文本框的值
            this.osData.tradeInCost = param.tradeInCost; //tradeIn总额
            this.osData.financialProgrammeCost = param.financialProgrammeCost; //金融方案总金额
            this.osData.agreementNo = param.agreementNo; //经销商协议号;
            this.osData.dealerCode = param.dealerCode; //经销商code;
            this.osData.centralized = param.centralized; //集采
            this.osData.actualSales = param.actualSales; //实际销售人
            this.osData.finalSofonQuotation = params.sofonNo; //finalSofonQuotation
            this.osData.tradeList =
              params.cosOppTradeIns != null &&
              params.cosOppTradeIns != "" &&
              params.cosOppTradeIns.length > 0
                ? params.cosOppTradeIns
                : [{ name: "", costs1: "" }]; // tradeIn
            this.osData.warrantyList =
              params.cosOppExtendedWarranties != null &&
              params.cosOppExtendedWarranties != "" &&
              params.cosOppExtendedWarranties.length > 0
                ? params.cosOppExtendedWarranties
                : []; // 延长保修
            this.osData.otherList =
              params.otherList != null &&
              params.otherList != "" &&
              params.otherList.length > 0
                ? params.otherList
                : []; //其他预留
            this.osData.productList =
              params.cosOppThirdParties != null &&
              params.cosOppThirdParties != "" &&
              params.cosOppThirdParties.length > 0
                ? params.cosOppThirdParties
                : []; // 第三方
            this.osData.application =
              params.applications != null &&
              params.applications != "" &&
              params.applications.length > 0
                ? params.applications
                : [{ productName: "", localCtp1: "" }];
            this.osData.applicationPrice = params.applicationPrice;
            this.osData.applications =
              params.applications != null &&
              params.applications != "" &&
              params.applications.length > 0
                ? params.applications
                : [{ productName: "", localCtp1: "" }];
            this.osData.applications =
              params.applications != null &&
              params.applications != "" &&
              params.applications.length > 0
                ? params.applications
                : [{ productName: "", localCtp: "" }];
            this.osData.isPrebookApply =
              param.isPrebookApply != null
                ? param.isPrebookApply.toString()
                : "0";
            this.dataBase.isPrebookApply = this.osData.isPrebookApply;
            this.osData.prebookReferenceId = param.prebookReferenceId;
            this.osData.prebookProductId = param.prebookProductId;
            this.osData.prebookMainId = param.prebookMainId;
            this.osData.contractCancelReferenceId =
              param.contractCancelReferenceId;
            this.osData.contractCancelMainId = param.contractCancelMainId;
            this.osData.priceDifferent = param.priceDifferent; //合cp价格是否一至
            this.osData.isVerify = param.isVerify; //是否一样
            this.osData.supportingFile = param.supportingFile; //上传支持文件
            this.osData.supportingFileNames = param.supportingFileNames; //支持文件名称
            if (this.osData.productList && this.osData.productList.length > 0) {
              this.osData.productList.map((res) => {
                res.name = res.thirdPartyName;
                res.price = res.total ? res.total : "";
                delete res.thirdPartyName;
                delete res.total;
              });
            }
            resolve(this.osData);
          }
        },
        (error) => {
          this.message.create("error", "请求异常!");
        }
      );
    });
  }
  //合同概要表查询
  public getContract() {
    return new Promise((resolve, reject) => {
      const mainId = decodeString(
        this.activatedRouter.queryParams["_value"].id
      );
      const url = "/act/preparation/queryContractSummary" + "?mainId=" + mainId;
      // 获取基础数据
      this.http.post(url).subscribe(
        (rest) => {
          if (rest.code === "0000") {
            if (rest.data) {
              //this.dataBase = Object.assign(this.dataBase, rest.data);
              this.dataBase = JSON.parse(JSON.stringify(rest.data));
              this.dataBase.detail = {
                id: "",
                flag: "",
                status: "",
              };
              this.dataBase.detail.flag =
                this.activatedRouter.queryParams["_value"].flag;
              this.dataBase.detail.status =
                this.activatedRouter.queryParams["_value"].status;
              this.dataBase.sameFlag = this.dataBase.sameFlag.toString();
              if (this.dataBase.invoiceInformation == "CNY") {
                this.signingData.invoiceMailingInformation =
                  this.dataBase.billingInfor;
                this.signingData.addressee = this.dataBase.addressee;
                this.signingData.addresseeTel = this.dataBase.addresseeTel;
              }
              this.signingData;
              resolve(rest.data);
            } else {
              this.message.create("error", "获取数据失败");
            }
          }
        },
        (error) => {
          this.message.create("error", "请求异常!");
        }
      );
    });
  }
  //查询order suammry基础数据
  getBase() {
    //查询基础数据
    const mainId = decodeString(this.activatedRouter.queryParams["_value"].id);
    let url = `/act/preparation/queryInfoForOrderSummary?mainId=${mainId}`;
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe((res) => {
        this.osData.specialApprovalDocuments = res.data.supportFileMissing; //特批文件后补
        this.osData.specialApprovalDocumentsName =
          res.data.supportFileMissingFileName; //特批文件名称
      });
    });
  }
  //查询order summary的
  getBaseOrder() {
    const mainId = decodeString(this.activatedRouter.queryParams["_value"].id);
    let url = `/act/preparation/queryInfoForOrderSummary?mainId=${mainId}`;
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe((res) => {
        this.osData.isUsdOrRmb =
          res.data.isUsdOrRmb != null &&
          res.data.isUsdOrRmb != "" &&
          res.data.isUsdOrRmb != undefined
            ? res.data.isUsdOrRmb
            : "";
      });
    });
  }
  //合同模版
  public getTemplate() {
    const url = `/act/ecom/bidding/getTemplate`;
    //业务模式DISTRIBUTOR非直投币制等于usd的时候传this.dataBase.sameFlag;

    let additionalCondition =
      this.dataBase.businessModel == "DISTRIBUTOR" &&
      this.dataBase.invoiceInformation == "USD"
        ? this.dataBase.sameFlag
        : null;
    const param = {
      dealModel: this.dataBase.businessModel,
      currencySystem: this.dataBase.invoiceInformation,
      additionalCondition: additionalCondition,
    };
    // const param={
    //   dealModel:"",
    //   currencySystem:"",
    // }
    return new Promise((resolve, reject) => {
      this.http.post(url, param).subscribe(
        (res) => {
          if (res.code == "0000") {
            this.signingData.tmpList = res.data;
            resolve(this.signingData.tmpList);
          } else {
            this.message.create("error", res.msg);
          }
        },
        (error) => {
          this.message.create("error", "请求异常!");
        }
      );
    });
  }
  //查询待合同签署页
  public getDataDetail() {
    const url = `/act/preparation/queryContractSigned?mainId=${decodeString(
      this.activatedRouter.queryParams["_value"].id
    )}`;
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe(
        (res) => {
          this.load = false;
          if (res.code === "0000") {
            if (res.data) {
              this.signingData = res.data;
              this.signingData.isContract =
                res.data.isContract != null ? res.data.isContract : "0";
              resolve(this.signingData);
              if (
                res.data.productConfFile &&
                res.data.productConfFile !== "" &&
                res.data.productConfFile != null
              ) {
                const obj = {
                  uid: res.data.productConfFile,
                  name: res.data.productConfFile,
                  fileId: res.data.productConfFile,
                };
                this.productConfFileList = [];
                this.productConfFileList.push(obj);
              }
            } else {
              if (this.dataBase.invoiceInformation == "USD") {
                const url = `/act/preparation/queryInfoForNmpa?registrationNumber=${this.dataBase.nmpaName}`;
                this.http.get(url).subscribe((rest) => {
                  console.log(rest);
                  //this.signingData.portShipment=rest.data.loadingPort;  //目的港英文
                  //this.signingData.portDestination=rest.data.dispatching;  //目的港中文
                  this.signingData.typeShipping = rest.data.modeShipment; //运输方式
                });
              }
            }
            resolve({});
          }
        },
        (error) => {
          this.load = false;
        }
      );
    });
  }
  //来自cp的
  getCpdata() {
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
  //上一步下一步
  public myskip(val): void {
    this.activedId = val;
  }

  //是否通过
  isshowDateOk() {
    this.isShowDates = false;
    this.isShowDate = false;
    this.isOpen = true;
    this.save(1);
  }
  //是否通过
  isshowDatesOk() {
    this.isShowDates = false;
    this.isShowDate = false;
    this.isOpen = true;
    this.save(1);
  }

  // 退回、保存、提交
  public save(e: any) {
    this.params.check = e;
    if (e == 0) {
      this.childbase.cheakData(e);
      const cheak = this.childbase.checkFormData();
      if (!cheak) {
        this.myskip("tab3");
        this.message.create("error", "请填写退回理由!");
        return;
      }
    }
    let fileList = [];
    this.childbase.fileFileList.map((files) => {
      let obj = {
        fileId: "",
      };
      obj.fileId = files.fileId;
      fileList.push(obj);
    });
    this.params.fileList = [...fileList];
    const ASYNS = async () => {
      if (e == 1) {
        this.childbase.cheakData(e);
        const cheak = this.childbase.checkFormData();
        if (!cheak) {
          this.myskip("tab3");
          this.message.create("error", "有必填项没有填写!");
          return;
        }
        if (
          this.params.fileList == null ||
          this.params.fileList == undefined ||
          this.params.fileList.length < 1
        ) {
          this.message.create("error", "请上传合同文件");
          return false;
        }
        if (this.dataBase.businessModel == "DISTRIBUTOR") {
          if (!this.isOpen) {
            let distributorDate = await this.getdistributorDate();
            if (this.dataBase.ddpStatus !== "通过") {
              this.isShowDate = true;
              return false;
            }
          }
        }
        if (this.dataBase.invoiceInformation === "USD") {
          if (!this.isOpen) {
            let iepoolDate = await this.getIepoolDate();
            if (
              this.dataBase.invoiceInformation === "USD" &&
              this.dataBase.contractDdpStatus !== "通过"
            ) {
              this.isShowDates = true;
              return;
            }
          }
        }
      }
      this.params.mainId = decodeString(
        this.activatedRouter.queryParams["_value"].id
      );
      this.params.remark = this.signingData.remark;
      this.params.salesAgreementNo = this.signingData.salesAgreementNo;
      this.params.importAgreementNo = this.signingData.importAgreementNo;
      this.params.purchaseOrderNumber = this.signingData.purchaseOrderNumber;
      this.params.solution = this.signingData.solution;
      this.params.productConf = this.signingData.productConf;
      this.params.productConfFile = this.signingData.productConfFile;
      this.params.invoiceMailingInformation =
        this.signingData.invoiceMailingInformation;
      this.params.portShipment = this.signingData.portShipment;
      this.params.typeShipping = this.signingData.typeShipping;
      this.params.portDestination = this.signingData.portDestination;
      this.params.addressee = this.signingData.addressee;
      this.params.addresseeTel = this.signingData.addresseeTel;
      if (this.signingData.tmpList.length > 0) {
        this.signingData.tmpList.map((res) => {
          let obj = {
            tempaleId: res.id,
          };
          this.params.tmpList.push(obj);
        });
      }

      if (
        this.signingData.contractDate !== null &&
        this.signingData.contractDate !== undefined &&
        this.signingData.contractDate !== ""
      ) {
        this.signingData.contractDate = formatDatesNow(
          this.signingData.contractDate
        );
      }
      this.params.contractDate = this.signingData.contractDate;
      this.params.isContract = this.signingData.isContract;
      this.params.priceTerms = this.signingData.priceTerms;
      const processInstanceTaskId =
        this.activatedRouter.queryParams["_value"].processInstanceTaskId;
      this.params.processInstanceTaskId = processInstanceTaskId;
      this.load = true;
      const url = "/act/preparation/contractSigned";
      this.http.post(url, this.params).subscribe(
        (res) => {
          if (res.code === "0000") {
            this.load = false;
            this.message.create("success", res.msg);
            if (e === 1) {
              this.routerExtendService.back();
              // this.router.navigate(['/ecos/my-done']);
            }
          } else {
            this.message.create("error", `${res.msg}`);
          }
        },
        (error) => {
          this.message.create("error", "请求异常!");
          this.load = false;
        }
      );
    };
    ASYNS();
  }

  //弹出退回合同概要表
  backContract() {
    this.isAgres = true;
    let obj = {
      title: "Return to Contract Summary 退回合同概要表",
      code: "backContract",
      refuseReason: null,
      remarks: this.signingData.remark,
      file: "",
    };
    this.ServesiceService.confirmTime.emit(obj);
  }
  //弹出关闭合同概要表
  closeContract() {
    this.isAgres = true;
    let obj = {
      title: "关闭合同概要表",
      code: "colseContract",
      refuseReason: null,
      remarks: this.signingData.remark,
      file: "",
    };
    this.ServesiceService.confirmTime.emit(obj);
  }
  //确定
  isAgregentOk() {
    const cheakData = this.child.checkFormData();
    if (!cheakData) {
      this.message.create("error", `有必填项没有填写`);
      return;
    }
    const processInstanceTaskId =
      this.activatedRouter.queryParams["_value"].processInstanceTaskId;
    this.params.check = this.child.infor.code == "backContract" ? "0" : "5"; //0退回合同概要表，5为关闭合同概要表
    this.params.mainId = decodeString(
      this.activatedRouter.queryParams["_value"].id
    );
    this.params.remark = this.child.infor.remarks;
    this.params.reason = this.child.infor.refuseReason;
    this.params.productConfFile = this.child.infor.file;
    this.params.processInstanceTaskId = processInstanceTaskId;
    const url = "/act/preparation/contractSigned";
    this.http.post(url, this.params).subscribe(
      (rest) => {
        if (rest.code === "0000") {
          this.load = false;
          this.message.create("success", rest.msg);
          // this.router.navigate(['/ecos/my-done']);
          this.child.infor.file = "";
          this.child.infor.refuseReason = null;
          this.child.validateForm.reset();
          this.isAgres = false;
          this.routerExtendService.back();
        } else {
          this.message.create("error", rest.msg);
        }
      },
      (error) => {
        this.load = false;
        this.message.create("error", "请求异常");
      }
    );
  }
  //取消
  isAgreCancels() {
    this.isAgres = false;
    this.child.validateForm.reset();
  }

  toReturn() {
    window.history.back();
  }
  //提交效验经销商日期
  getdistributorDate() {
    let param = {
      pageNo: 1,
      pageSize: 5,
      agreementNo: "", //协议号
      dealerCode: "", //经销code
      dealerName: this.osData.agent, //经销商名称
      selectName: "", //当前选中
    };
    let url = `/act/preparation/getDealersOnlyWithRegFlag`;
    return new Promise((resolve, reject) => {
      this.http.post(url, param).subscribe(
        (res) => {
          if (res.code == "0000" && res.data) {
            let data = res.data.rows;
            if (data.length > 0) {
              let time = standardTime(data[0].ddpValidUntil);
              this.osData.ddpStatus = isadopt(time);
              this.dataBase.ddpStatus = isadopt(time);
              this.dataBase.contractEndDate = formatDatesNow(time);
              this.osData.contractEndDate = formatDatesNow(time);
              this.mergeData.ddpStatus = isadopt(time);
              this.mergeData.contractEndDate = formatDatesNow(time);
              if (this.mergeData.ddpStatus != "通过") {
                this.mergeData.isVisibleDate = true;
              }
            }
            resolve(data);
          }
        },
        (error) => {
          this.message.create("error", "请求失败!");
        }
      );
    });
  }
  //提交获取外贸易
  getIepoolDate() {
    let param = {
      corporateName: this.osData.foreignTradeCompany,
    };
    let url = `/act/preparation/getIePool`;
    return new Promise((resolve, reject) => {
      this.http.post(url, param).subscribe(
        (res) => {
          if (res.code == "0000" && res.data) {
            let { data } = res;
            if (data.length > 0) {
              let time = standardTime(data[0].ddpValidUntil);
              this.osData.poolEndDate = formatDatesNow(time);
              this.dataBase.poolEndDate = formatDatesNow(time);
              this.osData.contractDdpStatus = isadopt(time);
              this.dataBase.contractDdpStatus = isadopt(time);
              this.mergeData.poolEndDate = formatDatesNow(time);
              this.mergeData.contractDdpStatus = isadopt(time);
              if (this.mergeData.contractDdpStatus != "通过") {
                this.mergeData.isVisibleDateIepool = true;
              }
            }
            resolve(data);
          }
        },
        (error) => {
          this.message.create("error", "请求失败!");
        }
      );
    });
  }

  cancelFn() {
    this.router.navigate(["/ecos/my-done"]);
  }
}
