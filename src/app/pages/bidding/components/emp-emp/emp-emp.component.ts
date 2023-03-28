import { Component, Input, OnInit } from "@angular/core";
import { HttpService } from "@core/services";
import { NzMessageService, UploadFile } from "ng-zorro-antd";
import { ActivatedRoute, Router } from "@angular/router";
import { getType, decodeString } from "assets/js/tools";
import { RouterExtendService } from "@app/modern-themes/services/router-extend.service";

@Component({
  selector: "app-emp-emp",
  templateUrl: "./emp-emp.component.html",
  styleUrls: ["./emp-emp.component.scss"],
})
export class EmpEmpComponent implements OnInit {
  rem_mess = false;
  authorization_file = false;
  @Input() data: any = {};
  public mainid: any;
  bidData: any = [];
  public textLen: any = 255; //文本输入限制长度
  pvtextLen: any = 100; //PV付款文件文本输入限制长度
  @Input() param: any = {
    authorizationDocumentId: "", //授权文件
    //businessType: "string",
    //createUser: "string",
    fileNo: "", //PV付款文件编号
    //id: "string",
    isCheck: "1", //是否需要校验CP审批结果
    //isDeleted: 0,
    mainId: "",
    remarks: "", //备注
    status: 0, //status
    supplementaryDocumentId: "", //补充授权文件
    exportControlFileId: "", // 出口管制文件
    authorizationDocumentName: "",
    supplementaryDocumentName: "",
    exportControlFileName: "",
  };
  @Input() public fileList: any = {
    fileAuthorizatioList: [], // 授权文件列表
    exportControlFileList: [], // 出口管制文件
    fileSupplementList: [], // 补充文件列表
  };

  load: any = false;
  public load2: any = false;
  showCP = false; //cp效验的弹出窗口;
  showBtnCp = false; //cpbtn效验的按钮;
  business = "Direct Deal";
  flag: any;
  verifiOff = true; //效验按钮禁用与否
  pdfSRC: any; //pdf传参数
  public isPdf: any = false; //打开pdf查看器

  row = [
    {
      name: "Opportunity 1",
      Market: "Market Bundle1",
      duc: [{ name: "主产品1" }, { name: "主产品2" }],
      take: "CP结果校验",
      end: "CP结果已完成",
    },
    {
      name: "Opportunity 1",
      Market: "Market Bundle2",
      duc: [{ name: "主产品1" }],
      take: "CP结果校验",
      end: "CP结果已完成",
    },
    {
      name: "Opportunity 2",
      Market: "Market Bundle1",
      duc: [{ name: "主产品1" }],
      take: "CP结果校验",
      end: "CP结果已完成",
    },
  ];

  constructor(
    private http: HttpService,
    private message: NzMessageService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private routerExtend: RouterExtendService
  ) {}
  //取消pdf查看器
  isPdfCancel() {
    this.isPdf = false;
  }
  ngOnChanges() {
    // this.viewData('authorizationDocumentId', 'fileAuthorizatioList', 'authorizationDocumentName');
    // this.viewData('supplementaryDocumentId', 'fileSupplementList', 'supplementaryDocumentName');
    // this.viewData('exportControlFileId', 'exportControlFileList', 'exportControlFileName');
  }
  viewData(data, fileList, name) {
    const bidWinningNotice = this.param[data];
    if (
      bidWinningNotice != "" &&
      bidWinningNotice != undefined &&
      bidWinningNotice != null
    ) {
      this.fileList[fileList] = [];
      let obj = { uid: "", name: "", fileId: "" };
      obj.uid = this.param[data];
      obj.fileId = this.param[data];
      if (this.param[name] != null && this.param[name] !== "") {
        obj.name = this.param[name];
      } else {
        obj.name = "下载文件";
      }
      this.fileList[fileList].push(obj);
    }
  }
  ngOnInit() {
    this.mainid = decodeString(this.activeRoute.queryParams["_value"].id);
    this.flag = this.activeRoute.queryParams["_value"].flag;
    this.changeCp();
    if (this.flag == 1) {
      this.getData();
    }
  }
  //授权补充文件
  beforeSupplementUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; //文件大小不超过100M
    const fileType = getType(file);
    if (fileType === "exe" || fileType === "bat") {
      this.message.create("error", "上传文件格式错误!");
      return false;
    }
    if (!isLt2M) {
      this.message.create("error", "文件大小不超过100M");
      return false;
    }
    this.upload("fileSupplementList", file, "supplementaryDocumentId");
    return false;
  };
  //授权文件
  beforeAuthorizationUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; //文件大小不超过100M
    const fileType = getType(file);
    if (fileType === "exe" || fileType === "bat") {
      this.message.create("error", "上传文件格式错误!");
      return false;
    }
    if (!isLt2M) {
      this.message.create("error", "文件大小不超过100M");
      return false;
    }
    this.upload("fileAuthorizatioList", file, "authorizationDocumentId");
    return false;
  };
  // 出口管制文件
  public beforeExportControlFileUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType === "exe" || fileType === "bat") {
      this.message.create("error", "上传文件格式错误!");
      return false;
    }
    if (!isLt2M) {
      this.message.create("error", "文件大小不超过100M");
      return false;
    }
    this.upload("exportControlFileList", file, "exportControlFileId");
    return false;
  };
  //上传文件下载
  dwonLoad = (file: UploadFile): void => {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf("#");
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${file.fileId}`;
    window.open(url, "_blank");
  };
  //文件下载
  fileDwon(id) {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf("#");
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${id}`;
    window.open(url, "_blank");
  }
  /**
   * filist 在线显示的文件 file上传的文件 fileId绑定的上传文件的id
   */
  upload(fileList, file, fileId) {
    this.fileList[fileList] = [];
    let type = getType(file);
    this.fileList[fileList].push(file);
    const formData = new FormData();
    this.fileList[fileList].forEach((file: any) => {
      formData.append("file", file);
      formData.append("fileType", type);
      formData.append("filename", file.name);
    });
    this.load = true;
    const url = "/act/system/upload";
    this.http.posts(url, formData).subscribe(
      (res) => {
        if (res.code === "0000") {
          this.load = false;
          this.fileList[fileList][0].fileId = res.data;
          this.param[fileId] = res.data;
          this.message.create("success", res.msg);
        } else {
          this.message.create("error", res.msg);
          this.load = false;
        }
      },
      (error) => {
        this.fileList[fileList] = [];
        this.message.create("error", "上传失败请重新上传!");
        this.load = false;
      }
    );
  }
  myVerifi(
    val //验证按钮是否可以点击
  ) {
    this.verifiOff = val;
  }
  public manufacturerAuthorizationLetter(code) {
    // SQSQH  9-4制造商出具的授权函-苏州格式-05281300
    const today = new Date();
    const params: any = {};
    params.templateCode = code;
    params.agentReceiver = localStorage.getItem("ecom_ng_philips_code1");
    params.biddingComRegAddress = this.data.biddingComRegAddress; // 投标公司地址
    params.biddingCompany = this.data.biddinOrgName; // 招标公司名称
    params.tenderingCompany = this.data.biddingNames; // 投标公司名称
    params.tenderingCompand = this.data.biddingNames; // 投标公司名称
    params.HospitalName = this.data.hospitalName;
    params.tenderNo = this.data.biddingNo;
    params.opportunityDate =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    params.date1 =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    Object.assign(params, this.data);

    params.biddingCompany = this.data.biddingNames;
    params.dataList = "";
    params.paymentList = "";
    params.productInformations = "";
    params.paymentDescription = "";
    params.region = "";
    params.BMClist = "";
    params.BMCExpert = "";
    params.AppExpert = "";
    params.distributorAgreement = "";
    params.distributorAgreementList = "";
    this.pdfSRC = params;
    this.isPdf = true;
  }
  CP(e) {
    let arr = [];
    let obj = {
      mainId: "",
      opportunityId: "",
      marketBundleName: "", //marketBundleName
      productModel: "", // marketBundleName
      productName: "", //子产品名称
      isCheak: false,
      productList: [], //数组
      orderByCustomerName: "", // 投标客户名称
      orderByCustomerNameCp: "", //cp客户名称
      appPerson: "", // 投标申请人
      winPerson: "", //cp申请人
      select: "",
      referenceId: "",
      searchResult: [],
      checkResult: "", // 校验结果
      checkResultReasons: "", // 校验失败原因
    };
    if (this.data.productInformations.length > 0) {
      this.data.productInformations.map((res) => {
        obj.mainId = this.mainid;
        obj.opportunityId = res.opportunityId;
        obj.appPerson = this.activeRoute.queryParams["_value"].sale;
        obj.orderByCustomerName = this.data.hospitalName;
        res.productInformations.map((vals) => {
          let objs = JSON.parse(JSON.stringify(obj));
          objs.key = vals.id;
          objs.productModel = vals.productModel;
          objs.marketBundleName = vals.marketBundleName;
          // objs.marketBundleName=vals.productName;
          objs.referenceId = vals.referenceId;
          if (vals.productInformations && vals.productInformations.length > 0) {
            // 是否有第三层
            objs.productList = [...vals.productInformations];
            vals.productInformations.map((val, index) => {
              let objss = JSON.parse(JSON.stringify(objs));
              objss.productName = val.productName;
              objss.isCheak = index == 0 ? true : false;
              arr.push(objss);
            });
          } else {
            arr.push(objs);
          }
        });
      });
      let arrIscheak = [];
      arr.map((res) => {
        res.isCheak && arrIscheak.push(res);
      });
      this.load2 = true;
      let url = "/act/ecom/tender/application/getTenderApplicationVeri";
      let paramArr = arrIscheak.length > 0 ? arrIscheak : arr;
      this.http.post(url, paramArr).subscribe(
        (res) => {
          if (res.code === "0000") {
            this.load2 = false;
            this.bidData = [...arr];
            if (arrIscheak.length == 0) {
              // 是否有子产品
              this.bidData.map((item, index) => {
                item.isCheak = true;
                item.searchResult = [...res.data[index].searchResult];
              });
            } else {
              arrIscheak.map((vals, index) => {
                vals.orderByCustomerNameCp = res.data[index].hospitalName;
                vals.winPerson = res.data[index].bidApplicant;
                vals.searchResult = [...res.data[index].searchResult];
              });
              arr.map((item) => {
                arrIscheak.map((vals) => {
                  if (item.key == vals.key) {
                    vals.winningByCustomerName = vals.orderByApplicant;
                    vals.winPerson = vals.winningByApplicant;
                    vals.searchResult = [...vals.searchResult];
                  }
                });
              });
              this.bidData = [...arr];
            }
            this.bidData.map((item) => {
              // 添加dealFormId的标题
              let len = item.productList.length;
              item.rowspan = len > 0 ? len : 1;
              if (item.searchResult.length > 0) {
                item.searchResult.map((vals) => {
                  vals.temUser = false;
                  vals.title = `dealFormId:${vals.dealFormId},makertBundleId:${
                    vals.makertBundleId ? vals.makertBundleId : ""
                  }`;
                });
              }
            });
          } else {
            this.load2 = false;
            this.message.create("error", res.msg);
          }
        },
        (error) => {
          this.load2 = false;
          this.message.create("error", "请求错误");
        }
      );
    }

    this.showCP = e;
  }
  modelChang() {
    //console.log(this.bidData)
  }
  selectClick(index, i) {
    let oppResult = false;
    let market = false;
    let hospitat = false; // 客户
    let person = false; // 申请人
    let checkArr = []; // 用于验证的数组
    let search = this.bidData[index].searchResult[i]; // 当前选中search;
    let id = search.id;
    this.bidData.map((res) => {
      res.isCheak && checkArr.push(res);
    });

    // 取消其他选中
    for (let i = 0; i < this.bidData.length; i++) {
      if (this.bidData[i]) {
        this.bidData[i].searchResult.map((e) => {
          // e.isDisable = false;
          if (id == this.bidData[i].select && i != index) {
            this.bidData[i].select = null;
          }
        });
      }
    }
    search.temUser = true; // 表明当前选中
    this.InitDisableAll();
    const opportunityId = this.bidData[index].opportunityId;
    const opportunityIdNow = search.opportunityId;
    const marketBundleName = this.bidData[index].marketBundleName;
    const marketBundleNameNow = search.marketBundleName;
    const hospitalName = search.hospitalName; // 中标客户
    let bidApplicant = search.bidApplicant; // 中标申请人
    this.bidData[index].orderByCustomerNameCp = hospitalName;
    this.bidData[index].winPerson = bidApplicant;
    const orderByCustomerName = this.bidData[index].orderByCustomerName; // 投标客户
    let appPerson = this.bidData[index].appPerson; // 投标申请人
    oppResult = opportunityId == opportunityIdNow ? true : false;
    market = marketBundleName == marketBundleNameNow ? true : false;
    // hospitat = orderByCustomerName == hospitalName ? true : false;
    // hospitat = search.hospitalId == search.no ? true : false;
    hospitat = this.data.hospitalId == search.hospitalId ? true : false;
    if (bidApplicant) {
      bidApplicant = bidApplicant.toLowerCase();
    }
    if (appPerson) {
      appPerson = appPerson.toLowerCase();
    }
    person = bidApplicant == appPerson ? true : false;
    if (oppResult && market && hospitat && person) {
      this.bidData[index].checkResult = true;
      this.bidData[index].checkResultReasons = "";
      let check = checkArr.every((x) => x.checkResult); // 验证是否全部通过
      if (check) {
        this.verifiOff = false;
      }
    } else {
      this.bidData[index].checkResult = false;
      this.verifiOff = true;
    }
    if (!oppResult) {
      this.bidData[index].checkResultReasons = "opportunityId不匹配";
      return;
    }
    if (!market) {
      this.bidData[index].checkResultReasons = "marketBundleName不匹配";
      return;
    }
    if (!hospitat) {
      this.bidData[index].checkResultReasons = "客户名称不一致";
      return;
    }
    if (!person) {
      this.bidData[index].checkResultReasons = "申请人名称不一致";
      return;
    }
  }

  public selectUnClick(index, i) {
    const search = this.bidData[index].searchResult[i]; // 当前选中search;
    search.temUser = false;
    this.bidData[index].checkResult = false;

    this.InitDisableAll();
    // this.trunResultDisableAll(index, false);
  }
  public CkVerifiOff() {
    if (this.bidData && this.bidData.length > 0) {
      let ck = true;
      for (let i = 0; i < this.bidData.length; i++) {
        if (this.bidData[i].checkResult != true) {
          ck = false;
          break;
        }
      }
      return ck;
    }
    return false;
  }

  public trunResultDisableAll(index, value) {
    if (this.bidData && this.bidData.length > 0 && this.bidData[index]) {
      this.bidData[index].searchResult.map((e) => {
        e.isDisable = value;
        if (value == false) {
          e.temUser = value;
        }
      });
    }
  }
  public InitDisableAll() {
    let ckid = [];
    // this.bidData.map(res => {
    //   res.isCheak && checkArr.push(res);
    // });
    // this.bidData[index].searchResult.map(res => {
    //   res.temUser = false;
    // });
    this.bidData.map((res) => {
      if (res.searchResult) {
        res.searchResult.map((e) => {
          e.isDisable = false;
        });
      }
    });
    // 筛选出选中
    for (let i = 0; i < this.bidData.length; i++) {
      if (this.bidData[i]) {
        this.bidData[i].searchResult.map((e) => {
          // e.isDisable = false;
          if (e.temUser) {
            ckid.push(e.id);
            this.trunResultDisableAll(i, true);
          }
        });
      }
    }
    this.bidData.map((res) => {
      // res.isCheak && checkArr.push(res);
      // 禁用已选中
      if (res.searchResult) {
        res.searchResult.map((e) => {
          if (ckid.indexOf(e.id) != -1) {
            e.isDisable = true;
          }
        });
      }
    });
  }

  handleCancelWinCheck() {
    this.showCP = false;
    this.verifiOff = true;
  }
  handleOkWinCheck() {
    this.save(1);
    this.showCP = false;
    /**
     * start 以下注释暂时不要删除cp效验的时候用
     */
    // let cheak=this.bidData.every(res=>res.checkResult==true);
    // if(cheak)
    // {
    //   this.save(1)
    //   this.showCP=false;
    // }
    // else
    // {
    //   this.message.create('error', `效验未通过`)
    // }
    /**
     * end
     */
  }
  // 单选框判断是否显示cp的结果
  changeCp() {
    console.log(this.data.businessType);
    if (
      this.param.isCheck == 1 &&
      this.data.businessType === "DIRECT" &&
      (this.data.baseDataFrom === "CRM" ||
        this.data.baseDataFrom === "CP Simulation")
    ) {
      this.showBtnCp = true;
    } else {
      this.showBtnCp = false;
    }
  }
  // 提交确认
  save(e) {
    this.rem_mess = false;
    this.authorization_file = false;
    if (e == 0) {
      /*拒绝备注信息非空验证*/
      if (this.param.remarks == null || this.param.remarks === "") {
        // this.message.create('error', '请填写拒绝理由!');
        this.rem_mess = true;
        return;
      }
    }
    // 授权文件验证, 确认授权时校验
    if (e == 1) {
      if (!this.param.authorizationDocumentId) {
        this.authorization_file = true;
        return;
      }
    }
    this.param.status = e;
    this.param.mainId = this.mainid;
    this.load = true;
    const url = "/act/ecom/tender/application/approvalSubmit";
    const processInstanceTaskId =
      this.activeRoute.queryParams["_value"].processInstanceTaskId;
    if (
      processInstanceTaskId != null &&
      processInstanceTaskId !== undefined &&
      processInstanceTaskId !== ""
    ) {
      this.param.processInstanceTaskId = processInstanceTaskId;
    }
    this.http.post(url, this.param).subscribe((res) => {
      if (res.code === "0000") {
        this.load = false;
        this.message.create("success", res.msg);
        this.routerExtend.back();
        // this.router.navigate(["/ecos/my-done"]);
      } else {
        this.load = false;
        this.message.create("error", res.msg);
      }
    });
  }
  getData() {
    const url =
      "/act/ecom/tender/application/getApprovalSubmit?mainId=" + this.mainid;
    this.http.get(url).subscribe((e) => {
      if (e.data) {
        this.param.isCheck = e.data.isCheck;
        this.param.fileNo = e.data.fileNo;
        this.param.remarks = e.data.remarks;
        this.param.supplementaryDocumentId = e.data.supplementaryDocumentId;
        this.param.supplementaryDocumentName = e.data.supplementaryDocumentName;
        this.param.authorizationDocumentId = e.data.authorizationDocumentId;
        this.param.authorizationDocumentName = e.data.authorizationDocumentName;
        this.param.exportControlFileId = e.data.exportControlFileId;
        this.param.exportControlFileName = e.data.exportControlFileName;
      }
      this.viewData(
        "supplementaryDocumentId",
        "fileSupplementList",
        "supplementaryDocumentName"
      );
      this.viewData(
        "authorizationDocumentId",
        "fileAuthorizatioList",
        "authorizationDocumentName"
      );
      this.viewData(
        "exportControlFileId",
        "exportControlFileList",
        "exportControlFileName"
      );
    });
  }
}
