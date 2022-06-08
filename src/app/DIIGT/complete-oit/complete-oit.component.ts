import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { HttpService, FileService } from '../../services';
import { decodeString, formatDatesNowMth, formatDatesNow, standardTime } from '../../../assets/js/tools';
import { Router, ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import { ServesiceService } from '../preOrder/servesice.service';

@Component({
  selector: 'app-complete-oit',
  templateUrl: './complete-oit.component.html',
  styleUrls: ['./complete-oit.component.scss']
})
export class CompleteOitComponent implements OnInit {
  @ViewChild('child') child;
  @ViewChild('childbase') public childbase;
  isAgres: any = false;
  status:any;
  //弹窗的数据
  public showData = {
    refuseReason: "",
    remarks: "",
    file: "",
    title: "",
    code: "",
  }
  // tab标签
  activedId: any = "pending-tab";
  thirdOff: any = false; //第三方自采核查是否显示;
  realTimeOff: any = false; //realTimeoff是否显示;
  disa: any = false //是否禁用子菜单
  mergeData: any = {} //合并后的数据
  flag: any;
  load: any = false; //加载
  infor: any = {   //合同概要表数据
    productList: [], // 产品列表
    detail: {
      id: '',
      flag: '',
      status: 'examine',
    },
  };
  signingData: any = {
    fileFileList: [] //上传的文件
  } //合同签署页
  dataBase: any = {   //orderSummary数据
  }
  oitData: any = {
    mainId: "",
    remark: "", //备注
    supportFileMissingFileName: "",//特批支持文件名称
    specialApprovalSupporting: "0",//需要后补特批支持文件
    specialSupportCompleted: "0",//特批支持文件已补齐
    productVerification: "0",//是否经销商第三方产品核查
    //specialSupportName: "",//特批支持文件名称
    logistician: "", //物流人员id
    oMlist: [],//下拉列表
    expertList: [], //选中的人员
    name: "",//物流人员姓名
    email: "",//物流人员邮件
    logisticsTime: formatDatesNowMth(new Date),//日期选择
    file: "",//进出口凭证
    other: "", //其它
    otherFiles: "", //其它多文件
    exportControl: "",//进出口管制
    check: 0, //1同意 0拒绝
    isCancel:"0", //是否取消
    cancelTime:'', //取消时间
    supportFile:'', //支持文件
    deBook: "0",
    deBookDate: "",
    reBook: "0",
    reBookDate: "",
  };
  isDisable: any = false;
  constructor(
    private http: HttpService,
    private router: Router,
    public activatedRouter: ActivatedRoute,
    private message: NzMessageService,
    private ServesiceService: ServesiceService,
  ) { }
  public ngOnInit() {
    this.init();
    const ASYNS = async () => {
      this.load = true;
      const detailData = await this.getDataDetail();
      const contractData = await this.getDataBase();
      const cpData = await this.getCpdata();
      const orderData: any = await this.getOrderSummary(contractData, cpData);
      await this.getBaseOrder();
      this.mergeData = Object.assign(detailData, orderData, contractData);
      const getTemplates = await this.getTemplate();
      const getFormDetailsd = await this.getFormDetails();
      const getUsers = this.getUser();
    }
    ASYNS()
  }
  init() {

    const param = this.activatedRouter.queryParams['_value'].param;
    this.flag = this.activatedRouter.queryParams['_value'].flag;
    this.status = this.activatedRouter.queryParams['_value'].status;
    switch (param) {
      case "third":
        this.thirdOff = true;
        this.disa = true
        break;
      case "realTime":
        this.realTimeOff = true;
        this.disa = true;
        break;
      default:
        this.thirdOff = false;
        this.realTimeOff = false;
        this.disa = false;

    }

  }

  getTitle()
  {
    if(this.status=='change_oit')
    {
      return '<div>Request Order Change <br> 发起改单</div>';
    }
    else{
      return '<div>Order Change Review <br> 审核改单</div>';
    }
  }
  getDataBase() {   //来至于合同概要表信息
    // 获取mainid
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const url = `/act/preparation/queryContractSummary?mainId=${mainId}`;
    // 获取基础信息数据
    return new Promise((resolve, reject) => {
      this.http.post(url, {}).subscribe(res => {
        if (res.data) {
          this.infor = res.data;
          this.infor.sameFlag = this.infor.sameFlag.toString();
          this.infor.detail = {
            id: '',
            flag: '',
            status: '',
          }
          this.infor.detail.flag = this.activatedRouter.queryParams['_value'].flag;
          this.infor.detail.status = this.activatedRouter.queryParams['_value'].status;
          this.infor.referenceId = res.data.referenceId;
          this.oitData.productVerification = this.dataBase.dealerAudit;
          resolve(res.data)
          //this.oitData.productVerification = this.dataBase.dealerAudit ? '1' : '0';
        } else {
          this.message.create('error', '获取数据失败');
        }
      });
    })
  }
  getOrderSummary(param, params) {
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    let url = `/act/preparation/queryOrderSummary?mainId=${mainId}`;
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe(res => {
        if (res.data) {
          this.dataBase = res.data
          this.dataBase.customerRequestLetter = formatDatesNow(this.dataBase.customerRequestLetter);
          this.dataBase.contractConfirmationDate = formatDatesNow(this.dataBase.contractConfirmationDate);
          resolve(res.data);
          this.dataBase.entryMode = param.entryMode //进单模式
          this.dataBase.team = param.team;//team
          this.dataBase.region = param.region;//大区域
          this.dataBase.smallArea = param.smallArea;//小区域
          this.dataBase.endUserId = param.endUserId; //最终用户id
          this.dataBase.poolEndDate = standardTime(param.poolEndDate);//外贸易公司日期
          this.dataBase.contractEndDate = standardTime(param.contractEndDate);//经销商日期
          this.dataBase.businessModel = param.businessModel; //业务模式
          this.dataBase.bidWinningNotice = param.bidWinningNotice;//中标通知书
          this.dataBase.distributor = param.tenderingCompany; //投标公司
          this.dataBase.endUserContract = param.contractBuyer;//合同买方
          this.dataBase.ddpStatus = param.ddpStatus //经销商的ddpStatus
          this.dataBase.endUser = param.endUser; //最终用户
          this.dataBase.agent = param.distributor//经销商
          this.dataBase.hospitalNature = param.hospitalNature //医院性质
          this.dataBase.productModel = param.productModel; //产品型号
          this.dataBase.nmpaName = param.nmpaName //nmpaName
          this.dataBase.contractPrice = param.contractPrice //合同价格
          this.dataBase.paymentProvision = param.paymentProvision //付款条款
          this.dataBase.referenceId = param.referenceId; //添加referenceId
          this.dataBase.dealFormId = param.dealFormId;//dealFromid
          this.dataBase.contractDdpStatus = param.contractDdpStatus; //合同买方的ddpstatus
          this.dataBase.foreignTradeCompany = param.foreignTradeCompany; //外贸易公司
          this.dataBase.invoiceInformation = param.invoiceInformation;   //币制
          this.dataBase.bidWinningPrice = res.data.bidWinningPrice ? res.data.bidWinningPrice : "";//中标价格
          this.dataBase.relationshipLink = params.businessOpportunityHierarchyLink // 商机层级关系链接
          this.dataBase.priceRange = params.samplingInspection // 是否抽样审核
          this.dataBase.sofonFile = params.sofonFile;
          this.dataBase.countryOrigin = params.countryOrigin // 原产地中文
          this.dataBase.countryOriginEn = params.countryOriginEn ? params.countryOriginEn : ""; // 原产地英文

          this.dataBase.medicalDeviceName = params.medicalDeviceName;//医疗器械名称
          this.dataBase.nmpaRegistrationExpried = params.nmpaRegistrationExpried;//NMPA证有效期截止日期
          this.dataBase.financialProgramme = params.financialProgramme; //金融方案价格
          this.dataBase.financialProgrammeTxt = params.financialProgrammeTxt; //金融方案文本框的值
          this.dataBase.tradeInCost = params.tradeInCost;//tradeIn总额
          this.dataBase.financialProgrammeCost = params.financialProgrammeCost; //金融方案总金额
          this.dataBase.agreementNo=param.agreementNo; //经销商协议号;
          this.dataBase.dealerCode=param.dealerCode; //经销商code;
          this.dataBase.centralized = param.centralized; //集采
          this.dataBase.actualSales = param.actualSales; //实际销售人
          this.dataBase.finalSofonQuotation = params.sofonNo //finalSofonQuotation
          this.dataBase.tradeList = params.cosOppTradeIns != null && params.cosOppTradeIns != "" && params.cosOppTradeIns.length > 0 ? params.cosOppTradeIns : [{ name: "", costs1: "" }]; // tradeIn
          this.dataBase.warrantyList = params.cosOppExtendedWarranties != null && params.cosOppExtendedWarranties != "" && params.cosOppExtendedWarranties.length > 0 ? params.cosOppExtendedWarranties:[] // 延长保修
          this.dataBase.otherList=params.otherList!=null&&params.otherList!=""&&params.otherList.length>0?params.otherList:[] //其他预留
          this.dataBase.productList = params.cosOppThirdParties != null && params.cosOppThirdParties != "" && params.cosOppThirdParties.length > 0 ? params.cosOppThirdParties : [{ thirdPartyName: "", total: "" }] // 第三方
          this.dataBase.application = params.applications != null && params.applications != "" && params.applications.length > 0 ? params.applications : [{ productName: "", localCtp1: "" }];
          this.dataBase.applicationPrice = params.applicationPrice;
          this.dataBase.applications = params.applications != null && params.applications != "" && params.applications.length > 0 ? params.applications : [{ productName: "", localCtp1: "" }]

          this.dataBase.isPrebookApply=param.isPrebookApply!=null?param.isPrebookApply.toString():"0"; //是否关联prebook
          this.dataBase.contractCancelReferenceId= param.contractCancelReferenceId;
          this.dataBase.contractCancelMainId= param.contractCancelMainId;
          this.infor.isPrebookApply=this.dataBase.isPrebookApply;
          this.dataBase.prebookReferenceId=param.prebookReferenceId; //prebookid
          this.dataBase.prebookProductId=param.prebookProductId; //prebookProductId
          this.dataBase.prebookMainId=param.prebookMainId; //prebookMainId
          this.dataBase.priceDifferent=param.priceDifferent //合cp价格是否一至
          this.dataBase.isVerify=param.isVerify; //是否一样
          this.dataBase.supportingFile=param.supportingFile; //上传支持文件
          this.dataBase.supportingFileNames=param.supportingFileNames //支持文件名称


          if (this.dataBase.productList && this.dataBase.productList.length > 0) {
            this.dataBase.productList.map(res => {
              res.name = res.thirdPartyName;
              res.price = res.total ? res.total : "";
              delete res.thirdPartyName;
              delete res.total;
            })
          }
        }
        else {
          this.message.create('error', '获取数据失败');
        }
      })
    })
  }
  //来自cp的
  getCpdata() {

    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    let url = `/act/preparation/queryInfoForOrderSummaryFromCP?mainId=${mainId}`
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe(rest => {
        if (rest.data) {
          resolve(rest.data)
        }
      })
    })
  }

  //查询order summary的
  getBaseOrder() {
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    let url = `/act/preparation/queryInfoForOrderSummary?mainId=${mainId}`;
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe(res => {
        this.dataBase.isUsdOrRmb = (res.data.isUsdOrRmb != null && res.data.isUsdOrRmb != "" && res.data.isUsdOrRmb != undefined) ? res.data.isUsdOrRmb : "";
        resolve(res);
      })
    })
  }
  public myskip(val): void { //外部触发tab选项卡的事件
    this.activedId = val;
  }
  tabclick(val) //tab选项卡的点击事件
  {
    this.activedId = val.nextId;
  }
  //oit完成查询接口
  public getFormDetails() {
    return new Promise((reslove, reject) => {
      this.http.get(`/act/preparation/oitCheck?mainId=` + decodeString(this.activatedRouter.queryParams['_value'].id)).subscribe(res => {

        if (res.code === '0000') {
          let oMlist = [];
          if (this.oitData.oMlist) {
            oMlist = this.oitData.oMlist;
          }
          this.oitData = res.data;
          this.oitData.oMlist = oMlist;
          this.oitData.deBook = this.oitData.deBook ? this.oitData.deBook : "0";
          this.oitData.reBook = this.oitData.reBook ? this.oitData.reBook : "0";
          this.oitData.isCancel=this.oitData.isCancel?this.oitData.isCancel:"0";
          this.oitData.exportControl = this.oitData.exportControl ? this.oitData.exportControl : "";
          this.oitData.other = this.oitData.other ? this.oitData.other : "";
          this.oitData.expertList = this.oitData.expertList ? this.oitData.expertList : [];
          !this.oitData.logisticsTime && (this.oitData.logisticsTime = formatDatesNowMth(new Date()))
          this.oitData.specialApprovalSupporting = this.oitData.specialApprovalSupporting != null ? this.oitData.specialApprovalSupporting : "0";
          this.oitData.remark = this.oitData.remark != null ? this.oitData.remark : "";
          reslove(res.data)
        } else {
          this.message.create('error', res.msg);
        }
      });
    })
  }

  //获取人员下拉列表
  getUser() {

    let marinId = decodeString(this.activatedRouter.queryParams['_value'].id);
    let url = `/act/preparation/getOitExpert?mainId=${marinId}`;
    return new Promise((reslove, reject) => {
      this.http.get(url).subscribe((res => {
        this.load = false;
        if (res.code == "0000") {
          this.oitData.oMlist = res.data;
          if (this.oitData.oMlist.length == 1) {
            this.oitData.logistician = this.oitData.oMlist[0].email;
          }
          reslove(res.data)
        }
        else {
          this.message.create("error", res.msg)
        }
      }), (error => {
        this.load = false;
        this.message.create("error", "请求异常")
      }))
    })
  }
  //合同修改
  public getTemplate() {
    const url = `/act/ecom/bidding/getTemplate`;
    let additionalCondition = this.infor.businessModel == 'DISTRIBUTOR' && this.infor.invoiceInformation == 'USD' ? this.infor.sameFlag : null;
    const param = {
      dealModel: this.infor.businessModel,
      currencySystem: this.infor.invoiceInformation,
      additionalCondition: additionalCondition,
    }
    return new Promise((resolve, reject) => {
      this.http.post(url, param).subscribe((res => {
        if (res.code == '0000') {

          this.signingData.tmpList = res.data;
        }
        else {
          this.message.create("error", res.msg)
        }
        resolve(this.signingData);
      }),
        (error => {
          this.message.create("error", "请求异常!")
        }))
    })
  }
  //合同签署页
  public getDataDetail() {
    const url = `/act/preparation/queryContractSigned?mainId=${decodeString(this.activatedRouter.queryParams['_value'].id)}`;
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe(res => {
        if (res.code === '0000') {
          if (res.data) {
            this.signingData = res.data;
            this.signingData.fileFileList = [];
            this.signingData.isContract = res.data.isContract != null ? res.data.isContract : '0';
            const { contractSignedAttachmentDTOList } = res.data;
            contractSignedAttachmentDTOList.map(vals => {
              let obj = {
                uid: "", name: "", fileId: ""
              }
              obj.uid = vals.attachmentId;
              obj.name = vals.attachmentName;
              obj.fileId = vals.attachmentId;
              this.signingData.fileFileList = this.signingData.fileFileList.concat(obj);
            })
            resolve(this.signingData)
          }
        }
        else{
          this.message.create('error', res.msg);
        }
      });
    })
  }

  public paymentProvision = [
    // DI&IGT-10% TT before OIT, 80% TT before FP, 10% TT against AC
    '36b8911e-1864-11ec-9074-54ee75a9b10b',
    '36b8aa28-1864-11ec-9074-54ee75a9b10b',
    '36b8b0e2-1864-11ec-9074-54ee75a9b10b',
    '36b9bd6c-1864-11ec-9074-54ee75a9b10b',

    // DI&IGT-10% TT before OIT, 90% TT before FP
    '36b891ec-1864-11ec-9074-54ee75a9b10b',
    '36b8aabd-1864-11ec-9074-54ee75a9b10b',
    '36b8b186-1864-11ec-9074-54ee75a9b10b',
    '36b9c3c7-1864-11ec-9074-54ee75a9b10b',

    // DI&IGT-15% before OIT, 85% before FP
    '36b77667-1a64-11ec-ac74-54ee75sss10z',
    '36b8a048-1864-11ec-9074-54ee75a9b10b',
    '36b8b3c2-1864-11ec-9074-54ee75a9b10b',
    '36b8b61a-1864-11ec-9074-54ee75a9b10b',

    // DI&IGT-30% TT before OIT, 60% TT before FP, 10% TT against ICF
    '36b88971-1864-11ec-9074-54ee75a9b10b',
    '36b8a15a-1864-11ec-9074-54ee75a9b10b',
    '36b8a731-1864-11ec-9074-54ee75a9b10b',
    '36b8ab53-1864-11ec-9074-54ee75a9b10b',
    '36b8b4e8-1864-11ec-9074-54ee75a9b10b',
    '36b9b6d6-1864-11ec-9074-54ee75a9b10b',

    // DI&IGT-100% TT before OIT
    '36b89318-1864-11ec-9074-54ee75a9b10b',
    '36b8947c-1864-11ec-9074-54ee75a9b10b',
    '36b895ce-1864-11ec-9074-54ee75a9b10b',
    '36b89656-1864-11ec-9074-54ee75a9b10b',
    '36b8a219-1864-11ec-9074-54ee75a9b10b',
    '36b8a460-1864-11ec-9074-54ee75a9b10b',
    '36b8a8e0-1864-11ec-9074-54ee75a9b10b',
    '36b8abe8-1864-11ec-9074-54ee75a9b10b',
    '36b8add5-1864-11ec-9074-54ee75a9b10b',
    '36b8b221-1864-11ec-9074-54ee75a9b10b',
    '36b9baf4-1864-11ec-9074-54ee75a9b10b',
    '36b9bea4-1864-11ec-9074-54ee75a9b10b',
    '36b9c2d8-1864-11ec-9074-54ee75a9b10b',

    // DI&IGT-100% LC before OIT
    '36b9c23b-1864-11ec-9074-54ee75a9b10b',

    // DI&IGT-30%TT before OIT, 70% TT before FP
    '36b9c0da-1864-11ec-9074-54ee75a9b10b'
  ];

  submit(number: number, flag?: any) {
    this.oitData.check = number;
    this.oitData.mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    this.oitData.logisticsTime && (this.oitData.logisticsTime = formatDatesNowMth(this.oitData.logisticsTime))
    const processInstanceTaskId=this.activatedRouter.queryParams['_value'].processInstanceTaskId;
    this.oitData.processInstanceTaskId=processInstanceTaskId;
    let url = "/act/preparation/oitUpload";
    if (number == 0) {
      this.childbase.cheakData(number);
      const cheak = this.childbase.checkFormData();
      if (!cheak) {
        this.message.create("error", "请填写退回理由");
        this.myskip("complete-padd");
        return;
      }
    }
    if (number == 1) {
      this.childbase.cheakData(number);
      const cheak = this.childbase.checkFormData();
      if (!cheak) {
        this.myskip("complete-padd");
        return;
      }

      if (this.oitData.exportControl == "" || this.oitData.exportControl == null || this.oitData.exportControl == null) {
        this.myskip("complete-padd");
        this.message.create("error", "请上传出口管制文件");
        return;
      }
      if (this.dataBase && this.dataBase.paymentProvision && this.paymentProvision.indexOf(this.dataBase.paymentProvision) !== -1) {
        if (this.oitData.file === '' || this.oitData.file === null) {
          this.message.create('error', '请上传OIT完成凭证文件');
          return;
        }
      }
    }
    //提交下拉人员
    if (this.oitData.logistician) {
      let usrArr = this.oitData.oMlist.find(res => this.oitData.logistician == res.email);
      let obj = {
        name: usrArr.name,
        userId: usrArr.id,
        email: usrArr.email
      }
      this.oitData.expertList.push(obj);
    }
    this.load = true;
    this.http.post(url, this.oitData).subscribe((res => {
      this.load = false;
      if (res.code == '0000') {
        this.message.create('success', res.msg);
        if (number === 1) {
          this.router.navigate(['/igt/my-task']);
        }
      }
      else {
        this.message.create('error', res.msg);
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "请求异常!");
    }));
  }
  //弹出退回合同概要表
  backContract() {
    this.isAgres = true;
    let obj = {
      title: "Return to Contract Summary 退回合同概要表",
      code: "backContract",
      refuseReason: null,
      remarks:this.oitData.remark,
      file:this.oitData.file,
      fileName:this.oitData.fileName
    }
    this.ServesiceService.confirmTime.emit(obj);
  }
  //弹出关闭合同概要表
  closeContract() {
    this.isAgres = true;
    let obj = {
      title: "Close Contract Summary 关闭合同概要表",
      code: "colseContract",
      refuseReason: null,
      remarks:this.oitData.remark,
      file:this.oitData.file,
      fileName:this.oitData.fileName
    }
    this.ServesiceService.confirmTime.emit(obj);
  }
  //确定
  isAgregentOk() {

    const cheakData = this.child.checkFormData();
    if (!cheakData) {
      this.message.create('error', `有必填项没有填写`);
      return;
    }
    const processInstanceTaskId=this.activatedRouter.queryParams['_value'].processInstanceTaskId;
    this.oitData.mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    this.oitData.processInstanceTaskId=processInstanceTaskId;
    this.oitData.check = this.child.infor.code == 'backContract' ? '0' : '5';
    this.oitData.remark = this.child.infor.remarks;
    this.oitData.reason = this.child.infor.refuseReason;
    this.oitData.file = this.child.infor.file;
    let url = "/act/preparation/oitUpload";
    this.load=true;
    this.http.post(url, this.oitData).subscribe((rest => {
      if (rest.code === '0000') {
        this.load = false;
        this.message.create('success', rest.msg);
        this.router.navigate(['/igt/my-task']);
        this.child.infor.file = "";
        this.child.infor.refuseReason = null;
        this.child.validateForm.reset();
        this.isAgres = false;
      }
      else{
        this.message.create('error', rest.msg);
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "请求异常")
    }));

  }
  //取消
  isAgreCancels() {
    this.isAgres = false;
    this.child.validateForm.reset();
  }

  toReturn() {
    window.history.back();
  }

  cancelFn() {
    this.router.navigate(['/igt/my-task']);
  }
}
