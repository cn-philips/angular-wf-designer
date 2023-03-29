import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { RouterExtendService } from "@app/modern-themes/services/router-extend.service";
import { HttpService } from "@core/services";
import {
  formatDates,
  formatDate,
  decodeString,
  formatDatesNow,
  chNumber,
} from "assets/js/tools";
import { NzMessageService, NzModalService } from "ng-zorro-antd";

@Component({
  selector: "app-apply-tender-modif",
  templateUrl: "./apply-tender-modif.component.html",
  styleUrls: ["./apply-tender-modif.component.scss"],
})
export class ApplyTenderModifComponent implements OnInit {
  @Input() dealerName1: any;
  @Input() dealerCode1: any;
  @ViewChild("childbase") childbase;
  @ViewChild("supplement") supplement;
  @ViewChild("product") product;
  @ViewChild("remarks") remarks;
  processList: any = [
    { name: "默认cp或者CRM链接带入" },
    { name: "Distribute Deal" },
    { name: "Direct Deal" },
  ];
  public name: any = { name: "张三", age: 14 };
  public test: string = "";
  public activedId: any = "pending-tab";
  public completed: boolean = false; // 判读是保存 false,拒绝的true;
  public load: boolean = false;
  flag: any = 0;
  isDisable: boolean = false;
  public dataBase: any = {
    applyType: null, // 招标授权模式
    baseDataFrom: "CRM", // 当前数据来源
    referenceId: "", // Reference_id;
    dealFormId: "", // dealFormId,
    biddingName: "", // 招标项目
    biddinOrgName: "", // 招标机构
    businessType: null, // 业务模式，
    biddingNo: "", // 招标编号，
    openBiddingDate: "", // 开标日期，
    biddingComId: "", // 开标公司
    biddingComRegAddress: "", // 投标公司注册地址
    biddingValidDay: 90, // 投标有效期
    purchaseGroup: "", // 采购集团名称
    secondaryAgentBidding: "", // 是否二级代理商
    biddingComRegCode: "", // 投标公司注册所在地
    hospitalName: "", // 医院名称
    hospitalProvinceCode: "", // 省份
    clientType: "", // 客户类型
    biddingManager: "", // 投标负责人
    biddingManagerTitle: "", // 投标负责人职务
    status: 0, // 0保存 1提交
    fileId: "", // 上传文件Id
    file: "", // 修改上传的文件
    tenderDeclarationLetter: "", // 在线提交参与投标声明函
    logisticsDescription: "", // 物流条款说明
    afterSalesInstructions: "", // 售后维修条款说明
    tenderPriceCurrencys: null, // 预计投标价格币种
    bidPriceCurrency: null, // 预计投标价格币种
    performanceBondsCurrency: null, // 预计投标价格币种
    tenderPriceCurrency: "", // 预计投标价格金额
    percentageTotalPrice: "", // 总价百分比
    totalPrice: "", // 总金额
    marginLevel: "", // 合同保证金比例
    paymentDescription: "", // 付款方式说明
    paymentDescriptions: "", // 付款方式说明长文本框
    technicalTerms: "", // 技术条款说明
    legalProvisions: "", // 涉及法律条款说明
    tenderAuthorization: "private", // 是否需要投标授权
    agentBidding: "agency", // 是否为二级代理商投标
    biddingDdpState: "3", // 投标公司DDP状态,
    biddingNames: "", // 投标公司名称
    agreementAgenName: "", // 协议代理商名称
    tenderApplicationLetter: "12", // 打印投标申请函
    tenderEntrustmentLetter: "12", // 打印投标委托函
    agreementAgentTenderEntrustmentLetter: "", // 协议代理商出具投标委托函,
    remarks: "", // 修改时候上传备注
    logisticsTermsExplain: "", // 物流条款说明
    performanceBonds: "", // 履约保证金金额
    productInformations: [], // 产品信息
    distributorAgreement: [],
    distributorAgreementList: [],
  };

  public arr: any = {
    tabList: [],
    crmData: [],
    firstopp: false,
    // 全局选中Opp
    CkOppo: {},
  };

  public paramsCP = {
    pageNo: 1,
    pageSize: 10,
    total: 0,
  };
  public paramsCRM = {
    pageNo: 1,
    pageSize: 10,
    total: 0,
  };

  public file_arr: any = {
    fileList: [], // 上传招标文件列表
    fileSealList: [], // 上传盖章后的文件列表
    fileAgentList: [], // 协议代理商出具投标委托函
  };

  // 经销商协议下拉选项
  public agreementSelect: any = [];
  // 所有经销商  *** 作废
  public selAgent_all: any = [];
  public selAgent_all_loading: any = false;

  // 二次禁用
  public approved: any = {
    supResult: false,
    qaResult: false,
    marResult: false,
    finResult: false,
    proResult: false,
    lawResult: false,
    isdRejected: false,
  };

  // 产品信息
  public productData: any = [];

  constructor(
    private router: Router,
    private http: HttpService,
    public activatedRouter: ActivatedRoute,
    private message: NzMessageService,
    private modalService: NzModalService,
    private routerExtend: RouterExtendService
  ) {}
  ngOnChanges() {
    console.log(this.name);
  }
  ngDoCheck() {
    //  console.log(this.name)
  }
  ngOnInit() {
    const mainId = decodeString(this.activatedRouter.queryParams["_value"].id);
    this.flag = this.activatedRouter.queryParams["_value"].flag;
    this.isDisable = this.flag == "1" ? true : false;
    const url = `/act/ecom/tender/application/getTenderApplicationDto?mainId=${mainId}`;
    this.load = true;
    this.http.get(url).subscribe(
      async (res) => {
        if (res.code == "0000") {
          if (res.data && res.data.distributorAgreementList) {
            this.initAgreetitleList(res.data.distributorAgreementList);
          }
          if (
            res.data.agreementAgenName != null &&
            res.data.agreementAgenName !== ""
          ) {
            const dealer = await this.selAgent(res.data.agreementAgenName);
            this.InitSelAgentAll(dealer);
          }
          this.dataBase = res.data;
          if (this.flag == "0") {
            // 不显示备注和文件
            // this.dataBase.remarks = '';
            // this.dataBase.file = '';
          }
          //判断预计投标价是否是保留两位
          if (
            this.dataBase.tenderPriceCurrency != null &&
            this.dataBase.tenderPriceCurrency != ""
          ) {
            this.dataBase.tenderPriceCurrency = chNumber(
              this.dataBase.tenderPriceCurrency
            );
          }
          if (
            this.dataBase &&
            this.dataBase.totalPrice != "" &&
            this.dataBase.totalPrice != null
          ) {
            this.dataBase.totalPrice = chNumber(this.dataBase.totalPrice);
          }
          if (
            this.dataBase &&
            this.dataBase.performanceBonds != "" &&
            this.dataBase.performanceBonds != null
          ) {
            this.dataBase.performanceBonds = chNumber(
              this.dataBase.performanceBonds
            );
          }
        } else {
          this.message.create("error", `${res.msg}`);
        }
        this.childbase.DisableValidateForm();
        this.load = false;
      },
      (error) => {
        this.load = false;
        this.message.create("error", "服务器异常!");
        this.childbase.DisableValidateForm();
      }
    );
    const params = {
      mainBusinessID: decodeString(
        this.activatedRouter.queryParams["_value"].id
      ),
    };
    this.http
      .post(`/act/process/getProcessWorkHisInfo`, params)
      .subscribe((rest) => {
        if (rest.code === "0000") {
          if (rest.data.length == 1) {
            this.completed = rest.data[0].completed;
          } else {
            this.completed = true;
          }
        } else {
          this.load = false;
          this.message.create("error", `${rest.msg}`);
        }
      });

    this.getApproved(mainId);
    // this.getAllselAgent();
  }
  public getApproved(mainId) {
    return;
    this.http
      .post(`/act/ecom/tender/application/getTenderApproved?mainId=${mainId}`)
      .subscribe((rest) => {
        if (rest && rest.data) {
          if (rest.data.isdRejected === "rejected") {
            this.approved.isdRejected = true;
            if (
              rest.data.qaResult &&
              rest.data.qaResult.toLowerCase() === "approved"
            ) {
              this.approved.qaResult = true;
            }
            if (
              rest.data.marResult &&
              rest.data.marResult.toLowerCase() === "approved"
            ) {
              this.approved.marResult = true;
            }
            if (
              rest.data.finResult &&
              rest.data.finResult.toLowerCase() === "approved"
            ) {
              this.approved.finResult = true;
            }
            if (
              rest.data.proResult &&
              rest.data.proResult.toLowerCase() === "approved"
            ) {
              this.approved.proResult = true;
            }
            if (
              rest.data.lawResult &&
              rest.data.lawResult.toLowerCase() === "approved"
            ) {
              this.approved.lawResult = true;
            }
            if (
              rest.data.supResult &&
              rest.data.supResult.toLowerCase() === "approved"
            ) {
              this.approved.supResult = true;
            }
          }
        }
      });
  }
  public disableValidateForm(val) {
    this.childbase.DisableValidateForm();
  }
  upData(val) {
    this.productData = Object.assign([], val);
  }
  public myskip(val): void {
    this.activedId = val;
  }
  public ddpData1(val): void {
    this.dealerCode1 = val.dealerCode1;
    this.dealerName1 = val.dealerName1;
  }
  public addProduct(val) {
    this.product.getProductInsert(
      val.opportunityId,
      val.dealFormId,
      val.CpOrCrm
    );
  }
  public toReturn() {
    window.history.back();
  }
  public cancel(): void {
    // this.router.navigate(["/ecos/my-done"]);

    this.routerExtend.back();
  }
  public save(): void {
    let url = "/act/ecom/tender/application/modify";
    this.dataBase.status = 0;
    this.dataBase.mainId = decodeString(
      this.activatedRouter.queryParams["_value"].id
    );
    let productInformations = JSON.parse(
      JSON.stringify(this.product.productData)
    );
    productInformations.map((res) => {
      delete res.listOfMapData;
    });
    if (productInformations && productInformations.length) {
      productInformations.map((vals) => {
        if (vals.productInformations && vals.productInformations.length > 0) {
          vals.productInformations.map((item) => {
            item.checked = false;
          });
        }
      });
    }
    this.dataBase.productInformations = JSON.parse(
      JSON.stringify(productInformations)
    );
    if (
      this.dataBase.openBiddingDate !== null &&
      this.dataBase.openBiddingDate !== undefined &&
      this.dataBase.openBiddingDate !== ""
    ) {
      this.dataBase.openBiddingDate = formatDatesNow(
        this.dataBase.openBiddingDate
      );
    }
    // 暂时前端添加限制
    if (this.dataBase.productInformations.length < 1) {
      // 判断是否选择了Opportunity
      this.myskip("complete-tab");
      this.message.create("error", `请添加Opportunity`);
      return;
    }

    // 将crm accountid 存入
    if (this.dataBase.baseDataFrom === "CRM") {
      if (
        this.dataBase.productInformations &&
        this.dataBase.productInformations.length > 0
      ) {
        for (let i = 0; i < this.dataBase.productInformations.length; i++) {
          if (
            this.dataBase.productInformations[i].productInformations &&
            this.dataBase.productInformations[i].productInformations.length > 0
          ) {
            for (
              let j = 0;
              j <
              this.dataBase.productInformations[i].productInformations.length;
              j++
            ) {
              this.dataBase.productInformations[i].productInformations[
                j
              ].accountId = this.dataBase.accountId;
            }
          }
        }
      }
    }

    this.load = true;
    const processInstanceTaskId =
      this.activatedRouter.queryParams["_value"].processInstanceTaskId;
    if (
      processInstanceTaskId != null &&
      processInstanceTaskId !== undefined &&
      processInstanceTaskId !== ""
    ) {
      this.dataBase.processInstanceTaskId = processInstanceTaskId;
    }
    this.initDistributorAgreementList();
    this.http.post(url, this.dataBase).subscribe(
      (res) => {
        if (res.code == "0000") {
          this.message.create("success", res.msg);
          this.load = false;
        } else {
          this.message.create("error", res.msg);
          this.load = false;
        }
      },
      (error) => {
        this.load = false;
        this.message.create("error", "服务器异常!");
      }
    );
  }
  public submit() {
    let url = "/act/ecom/tender/application/modify";
    this.dataBase.status = 1;
    this.dataBase.mainId = decodeString(
      this.activatedRouter.queryParams["_value"].id
    );
    let cheakbase = this.childbase.checkFormData(); // 基础信息验证
    let cheaksuppl = this.supplement.checkFormData(); // 补充信息的验证
    let productInformations = JSON.parse(
      JSON.stringify(this.product.productData)
    );
    productInformations.map((res) => {
      delete res.listOfMapData;
    });
    this.dataBase.productInformations = JSON.parse(
      JSON.stringify(productInformations)
    );
    if (!cheakbase) {
      this.myskip("pending-tab");
      this.message.create("error", `有必须项没有填写`);
      return;
    }
    // this.dataBase.tenderAuthorization === 'nonprivate'
    // 选择否不验证
    if (!cheaksuppl && this.dataBase.tenderAuthorization === "nonprivate") {
      this.myskip("complete-pad");
      this.message.create("error", `有必须项没有填写`);
      return;
    }
    if (
      this.dataBase.businessType === "DISTRIBUTOR" &&
      this.dataBase.biddingDdpState === "未通过"
    ) {
      this.message.create("error", "投标公司DDP状态未通过");
      return;
    }
    if (
      this.dataBase.businessType === "DISTRIBUTOR" &&
      this.dataBase.agreementDealerDdpState === "未通过"
    ) {
      this.message.create("error", "协议经销商DDP状态未通过");
      return;
    }
    //物流条款说明 非标准条款验证
    if (
      this.dataBase.logisticsTermsExplain != "WLTKSMBZ" &&
      this.dataBase.logisticsDescription === "收到信用证/货款90天内装运"
    ) {
      this.message.create("error", "物流条款说明需修改");
      return;
    }

    if (
      this.dataBase.tenderAuthorization === "nonprivate" &&
      this.dataBase.businessType === "DIRECT"
    ) {
      // 投标保证金验证
      // percentageTotalPrice totalPrice
      const percentageTotalPrice = this.dataBase.percentageTotalPrice;
      const totalPrice = this.dataBase.totalPrice;
      if (
        (percentageTotalPrice == null || percentageTotalPrice === "") &&
        (totalPrice == null || totalPrice === "")
      ) {
        this.message.create("error", `投标保证金请至少填写一项`);
        return;
      }
      // 履约保证金
      // marginLevel performanceBonds
      const marginLevel = this.dataBase.marginLevel;
      const performanceBonds = this.dataBase.performanceBonds;
      if (
        (marginLevel == null || marginLevel === "") &&
        (performanceBonds == null || performanceBonds === "")
      ) {
        this.message.create("error", `履约保证金请至少填写一项`);
        return;
      }
    }

    if (this.dataBase.businessType === "DIRECT") {
      // 验证 投标保证金 履约保证金 小于 预计投标价格
      const totalPrice = parseFloat(this.dataBase.totalPrice);
      const performanceBonds = parseFloat(this.dataBase.performanceBonds);
      let tenderPriceCurrency = parseFloat(this.dataBase.tenderPriceCurrency);
      if (isNaN(tenderPriceCurrency)) {
        tenderPriceCurrency = 0;
      }
      if (
        (totalPrice != null &&
          !isNaN(totalPrice) &&
          totalPrice > tenderPriceCurrency) ||
        (performanceBonds != null &&
          !isNaN(performanceBonds) &&
          performanceBonds > tenderPriceCurrency)
      ) {
        this.message.create(
          "error",
          `投标保证金和履约保证金要不大于预计投标价格`
        );
        return;
      }
    }

    // 验证 协议代理商出具投标委托函
    if (
      this.dataBase.agentBidding === "agency" &&
      this.dataBase.tenderAuthorization === "nonprivate" &&
      this.dataBase.businessType === "DISTRIBUTOR"
    ) {
      if (
        this.dataBase.contractorTenderEntrustmentFileId == null ||
        this.dataBase.contractorTenderEntrustmentFileId === ""
      ) {
        this.message.create("error", `请上传协议代理商出具投标委托函`);
        return;
      }
    }
    // 验证 招标文件
    if (
      this.dataBase.businessType === "DIRECT" &&
      this.dataBase.tenderAuthorization === "nonprivate"
    ) {
      if (this.dataBase.fileId == null || this.dataBase.fileId === "") {
        this.message.create("error", `请上传招标文件`);
        return;
      }
    }

    if (
      this.dataBase.businessType === "DISTRIBUTOR" &&
      this.dataBase.tenderAuthorization === "nonprivate"
    ) {
      const sealedFileId = this.dataBase.sealedFileId;
      if (
        sealedFileId === "" ||
        sealedFileId == null ||
        sealedFileId == undefined
      ) {
        this.myskip("complete-pad");
        this.message.create("error", `请上传投标申请函`);
        return;
      }
    }

    if (this.dataBase.productInformations.length < 1) {
      //判断是否选择了Opportunity
      this.myskip("complete-tab");
      this.message.create("error", `没有选择Opportunity`);
      return;
    }
    const prodcutLenth = this.dataBase.productInformations.every(
      (res) =>
        res && res.productInformations && res.productInformations.length > 0
    ); // 判断是否选择了产品
    if (!prodcutLenth) {
      this.myskip("complete-tab");
      this.message.create("error", `有Opportunity没有选择产品`);
      return;
    }
    if (this.completed) {
      let isremarks = this.remarks.checkFormData(); //备注信息
      if (!isremarks) {
        this.myskip("complete-remarks");
        this.message.create("error", `有必须项没有填写`);
        return;
      }
    }
    this.dataBase.productInformations.map((res) => {
      //产品绑定上opportunityid
      res.productInformations.map((vals) => {
        vals.opportunityId = res.opportunityId;
        vals.referenceId = this.dataBase.referenceId;
      });
    });

    // 将crm accountid 存入
    if (this.dataBase.baseDataFrom === "CRM") {
      if (
        this.dataBase.productInformations &&
        this.dataBase.productInformations.length > 0
      ) {
        for (let i = 0; i < this.dataBase.productInformations.length; i++) {
          if (
            this.dataBase.productInformations[i].productInformations &&
            this.dataBase.productInformations[i].productInformations.length > 0
          ) {
            for (
              let j = 0;
              j <
              this.dataBase.productInformations[i].productInformations.length;
              j++
            ) {
              this.dataBase.productInformations[i].productInformations[
                j
              ].accountId = this.dataBase.accountId;
            }
          }
        }
      }
    }
    // if (cheakbase && cheaksuppl) {

    this.dataBase.openBiddingDate = formatDatesNow(
      this.dataBase.openBiddingDate
    );

    const processInstanceTaskId =
      this.activatedRouter.queryParams["_value"].processInstanceTaskId;
    if (
      processInstanceTaskId != null &&
      processInstanceTaskId !== undefined &&
      processInstanceTaskId !== ""
    ) {
      this.dataBase.processInstanceTaskId = processInstanceTaskId;
    }
    const ASYNS = async () => {
      if (this.dataBase.businessType === "DISTRIBUTOR") {
        if (
          this.dataBase.dealerNo === null ||
          this.dataBase.dealerNo === "null"
        ) {
          let i = await this.ddpJudge1(this.dealerCode1, this.dealerName1);
          console.log(i);
          if (i === 1) {
            return;
          }
        } else {
          let i = await this.ddpJudge1(
            this.dataBase.dealerNo,
            this.dataBase.agreementAgenName
          );
          console.log(i);
          if (i === 1) {
            return;
          }
        }
      }
      this.initDistributorAgreementList();
      this.load = true;
      this.http.post(url, this.dataBase).subscribe(
        (res) => {
          if (res.code == "0000") {
            this.message.create("success", res.msg);
            // this.router.navigate(["/ecos/my-done"]);
            this.routerExtend.back();
            this.load = false;
          } else {
            this.message.create("error", res.msg);
            this.load = false;
          }
        },
        (error) => {
          this.load = false;
          this.message.create("error", "服务器异常!");
        }
      );
    };
    ASYNS();
    // }
    // else {
    //   this.message.create('error', `有必须项没有填写`);
    // }
  }

  //价格保留两位小数
  public toDecimal2(e) {
    if (e) {
      e = e.toString();
      let i = e.indexOf(".");
      if (i != -1 && i + 2 <= e.length) {
        return e.substring(0, i + 3);
      }
      if (i == -1 && e && e.length > 0) {
        return e + ".00";
      }
      return e;
    }
    return e;
  }

  public ddpJudge1(leaderNo, leaderName) {
    const url =
      "/act/ecom/bidding/getDdpDateAndValid?dealerCode=" +
      leaderNo +
      "&dealerName=" +
      leaderName;
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe(
        (res) => {
          if (res.data.isValid != null && res.data.isValid) {
            resolve(0);
          } else {
            let alertMsg = "";
            if (res.data.isValid != null) {
              alertMsg =
                "经销商DDP有效日期为" +
                res.data.ddpDate +
                " ,当前已过有效期，请重新选择经销商！";
            } else {
              alertMsg = res.msg + " 请重新选择经销商！";
            }
            this.message.create("error", alertMsg);
            resolve(1);
          }
        },
        (error) => {
          this.message.error("请求失败!");
        }
      );
    });
  }

  public agreetitleList: any = {};
  // dataBase 提交装载 经销商协议 数据结构
  // 添加 授权产品 授权区域
  public initDistributorAgreementList() {
    this.dataBase.distributorAgreementList = [];
    if (this.dataBase && this.dataBase.distributorAgreement) {
      for (let i = 0; i < this.dataBase.distributorAgreement.length; i++) {
        this.dataBase.distributorAgreementList.push({
          dealerAgreement: this.dataBase.distributorAgreement[i],
          authorizedProduct: this.agreetitleList[
            this.dataBase.distributorAgreement[i]
          ]
            ? this.agreetitleList[this.dataBase.distributorAgreement[i]]
                .authorizedProduct
            : "",
          authorizedArea: this.agreetitleList[
            this.dataBase.distributorAgreement[i]
          ]
            ? this.agreetitleList[this.dataBase.distributorAgreement[i]]
                .authorizedArea
            : "",
        });
      }
    }
  }

  // 读取装载 将读取的 distributorAgreement 便利到 agreetitleList
  public initAgreetitleList(distributorAgreementList) {
    if (distributorAgreementList) {
      for (let i = 0; i < distributorAgreementList.length; i++) {
        this.agreetitleList[distributorAgreementList[i].dealerAgreement] = {
          authorizedProduct: distributorAgreementList[i].authorizedProduct,
          authorizedArea: distributorAgreementList[i].authorizedArea,
        };
      }
    }
  }

  // 获取经销商信息
  public async selAgent(dealerName) {
    const url = `/act/ecom/bidding/selAgentList`;
    const params = {
      dealerName: dealerName,
    };
    const res = await this.http.post(url, params).toPromise();
    if (res) {
      return res.data;
    } else {
      return null;
    }
  }

  // 构建经销商下拉框数据
  public InitSelAgentAll(dealList) {
    this.agreementSelect.length = 0;
    if (dealList) {
      for (let i = 0; i < dealList.length; i++) {
        if (dealList[i]) {
          const obj = {
            agreementNo: dealList[i].agreementNo,
            authorizedProduct: dealList[i].authorizedProduct,
            authorizedArea: dealList[i].authorizedArea,
          };
          this.agreementSelect.push(obj);
        }
      }
    }
  }
}
