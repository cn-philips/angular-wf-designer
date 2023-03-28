import { Component, Input, OnInit } from "@angular/core";
import { HttpService } from "@core/services";
import { NzMessageService, UploadFile } from "ng-zorro-antd";
import { ActivatedRoute, Router } from "@angular/router";
import { decodeString, getType } from "assets/js/tools";

@Component({
  selector: "app-emp-emp-app",
  templateUrl: "./emp-emp-app.component.html",
  styleUrls: ["./emp-emp-app.component.scss"],
})
export class EmpEmpAppComponent implements OnInit {
  @Input() data: any = {};
  public mainid: any;
  bidData: any = [];
  public textLen: any = 255; // 文本输入限制长度
  public pvtextLen: any = 100; // PV付款文件文本输入限制长度
  // param: any = {
  //   authorizationDocumentId: '', // 授权文件
  //   //businessType: "string",
  //   //createUser: "string",
  //   fileNo: "",   //PV付款文件编号
  //   //id: "string",
  //   isCheck: "1", //是否需要校验CP审批结果
  //   //isDeleted: 0,
  //   mainId: "",
  //   remarks: "",  //备注
  //   status: 0, //status
  //   supplementaryDocumentId: '', // 补充授权文件
  // };
  public param: any = null;
  fileAuthorizatioList: []; // 授权文件列表
  public exportControlFileList: []; // 出口管制文件
  fileSupplementList: []; // 补充文件列表
  load: any = false;
  business = "Direct Deal";
  flag: any;
  pdfSRC: any; // pdf传参数
  public isPdf: any = false; // 打开pdf查看器

  constructor(
    private http: HttpService,
    private message: NzMessageService,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnChanges() {
    // this.viewData('authorizationDocumentId', 'fileAuthorizatioList', 'authorizationDocumentName');
    // this.viewData('supplementaryDocumentId', 'fileSupplementList', 'supplementaryDocumentName');
  }
  viewData(data, fileList, name) {
    if (this.param) {
      const bidWinningNotice = this.param[data];
      if (
        bidWinningNotice != "" &&
        bidWinningNotice != undefined &&
        bidWinningNotice != null
      ) {
        this[fileList] = [];
        let obj = { uid: "", name: "", fileId: "" };
        obj.uid = this.param[data];
        obj.fileId = this.param[data];
        if (this.param[name]) {
          obj.name = this.param[name];
        } else {
          obj.name = "下载文件";
        }
        this[fileList].push(obj);
      }
    }
  }
  ngOnInit() {
    this.mainid = decodeString(this.activeRoute.queryParams["_value"].id);
    this.flag = 1;
    this.getData();
  }
  //授权补充文件
  beforeSupplementUpload = (file: UploadFile): boolean => {
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
    this.upload("fileSupplementList", file, "supplementaryDocumentId");
    return false;
  };
  // 授权文件
  beforeAuthorizationUpload = (file: UploadFile): boolean => {
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

  // 上传文件下载
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
    this[fileList] = [];
    let type = getType(file);
    this[fileList].push(file);
    const formData = new FormData();
    this[fileList].forEach((file: any) => {
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
          this[fileList][0].fileId = res.data;
          this.param[fileId] = res.data;
          this.message.create("success", res.msg);
        } else {
          this.message.create("error", res.msg);
          this.load = false;
        }
      },
      (error) => {
        this[fileList] = [];
        this.message.create("error", "上传失败请重新上传!");
        this.load = false;
      }
    );
  }

  // 取消pdf查看器
  isPdfCancel() {
    this.isPdf = false;
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

  getData() {
    const url =
      "/act/ecom/tender/application/getApprovalSubmit?mainId=" + this.mainid;
    this.http.get(url).subscribe((e) => {
      if (e.data) {
        const param = {
          isCheck: e.data.isCheck,
          fileNo: e.data.fileNo,
          remarks: e.data.remarks,
          supplementaryDocumentId: e.data.supplementaryDocumentId,
          supplementaryDocumentName: e.data.supplementaryDocumentName,
          authorizationDocumentId: e.data.authorizationDocumentId,
          authorizationDocumentName: e.data.authorizationDocumentName,
          exportControlFileId: e.data.exportControlFileId,
          exportControlFileName: e.data.exportControlFileName,
        };
        this.param = param;
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
