import {
  Component,
  OnInit,
  NgZone,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";

import { TransferChange } from "ng-zorro-antd/transfer";
import { NzTreeComponent } from "ng-zorro-antd/tree";
import { ThemeSettingsModule } from "../../../../vendor/libs/theme-settings/theme-settings.module";
import { HttpService, UtilityService } from "../../../services";
import { NzMessageService } from "ng-zorro-antd";
import { Router, ActivatedRoute } from "@angular/router";
import {decodeString, disreduce} from '../../../../assets/js/tools';
import { TimeFormatePipeNow } from "../../../pipes/tiem-formatenow.pipe";
import { ServesiceService } from "../servesice.service";
export interface TreeNodeInterface {
  //数据类型接口
  id: string;
  key?: string;
  productType?: string; //产品类型
  productTypeChild?: string; //子产品名称
  productName?: string; //产品名称
  productModel?: string; //产品型号
  productLine?: string; //产品线
  costCenter?: string; //CostCenter
  number?: number; //台数
  mag?: string; //mag
  level?: number;
  expand?: boolean;
  price?: any; //产品价格
  localName?: string; //本地名称
  dealFromId?: string; //dealFromId
  makertBundleId?: string; //makerBundId
  productInformations?: TreeNodeInterface[];
  parent?: TreeNodeInterface;
  opportunityId?: string;
  baseDateFrom?: string;
  mainId?: string;
  oppRelaId?: string;
  createUser?: string;
  updateUser?: string;
  createTime?: any;
  updateTime?: any;
  status?: any;
  isDeleted?: any;
}
@Component({
  selector: "app-newproduct",
  templateUrl: "./newproduct.component.html",
  styleUrls: ["./newproduct.component.scss", "../apply-tender.component.scss"],
  providers: [UtilityService],
})
export class NewproductComponent implements OnInit {
  constructor(
    private http: HttpService,
    private message: NzMessageService,
    public activatedRouter: ActivatedRoute,
    public ServesiceService: ServesiceService,
    private utils: UtilityService,
    private activeRoute: ActivatedRoute
  ) {}
  // 产品信息
  @Input() productData: any = [];
  @Input() isDisable: any = false;
  @Output() myEvent = new EventEmitter();
  @Output() upData = new EventEmitter();
  @Input() dataBase: any = {};

  @Input() file_arr: any = {
    fileList: [], // 上传招标文件列表
    fileSealList: [], // 上传盖章后的文件列表
    fileAgentList: [], // 协议代理商出具投标委托函
  };
  @Input() arr: any = {
    tabList: [],
    crmData: [],
    firstopp: false,
    //全局选中Opp
    CkOppo: {},
  };
  @ViewChild("tranf") tranf; // 调用树形穿梭框
  mapOfCheckedId: { [id: string]: boolean } = {};
  shuttleList: any[] = []; //穿梭框的数据
  showCurr: any;
  isAllDisplayDataChecked = false;
  isIndeterminate = false;
  flag: any;
  public param: any = {
    total: 0,
    pageNo: 1,
    pageSize: 5,
    dealerName: "",
  };
  public changes_t = true;
  // firstcp: any = false;
  // @Input() firstopp: any = true;
  OpLoad: any = false;
  MkLoad: any = false;

  // 弹出框时选中 oppid
  public ckopportunityId: any = "";
  // opp查询参数
  public oppSeach: any = {
    opportunityId: '',
    opportunityName: '',
    accountName: '',
    dealFormId: ''
  };
  // mk查询参数
  public mkSeach: any = {
    localName: "",
    marketBundleCluster: "",
    modalityBmc: "",
    mag: "",
  };

  // 记录不同opp对应的穿梭框的选择mk
  OppCkMk: any = {};
  // Oppo选中参数
  Ckdata: any = {};

  CpOrCrm: any = "CP";
  // @Input()tabList: any = [
  //   {
  //   'radio': false,
  //   'opportunityID': "006d000000BDrIm",
  //   'DealFormID': "",
  //   'opportunityName': "1-YZBPDK",
  //   "accountName": "Infraredx Inc",
  //   "biddingDate": "",
  //   "opportinityHierarchyLink": "",
  //   "source": "",
  // },
  //   {
  //     'radio': false,
  //     'opportunityID': "006d000000BDrIm2",
  //     'DealFormID': "",
  //     'opportunityName': "1-YZBPDK",
  //     "accountName": "Infraredx Inc",
  //     "biddingDate": "",
  //     "opportinityHierarchyLink": "",
  //     "source": "",
  //   }
  // ];
  // @Input()crmData: any = [
  // {
  //   'radio': false,
  //   'opportunityID': "006d000000BDrIm",
  //   'opportunityName': "1-YZBPDK",
  //   "accountName": "Infraredx Inc",
  //   "biddingDate": "",
  //   "opportinityHierarchyLink": "",
  //   "source": "",
  // },
  //   {
  //     'radio': false,
  //     'opportunityID': "006d000000BDrIm2",
  //     'opportunityName': "1-YZBPDK",
  //     "accountName": "Infraredx Inc",
  //     "biddingDate": "",
  //     "opportinityHierarchyLink": "",
  //     "source": "",
  //   }
  // ];
  //crm搜索数据
  public agentData: any = [
    //   {
    //   "id": 13,
    //   "nameEn": "PD",
    //   "nameCn": "AMI",
    //   "address": "Y77",
    //   "authoAddress": "Ingenuity TF Standard",
    //   "authoProduct": "2021-04-29 12:42:11",
    //   "authoStart": "",
    //   "authoOver": "有效",
    //     'productType': 'Market Bundle3名称',
    //     'productTypeChild': "",
    //     'productName': "产品名称2",
    //     'productModel': "Market Bundle1型号",
    //     'costCenter': "23",
    //     'localName': '',
    //     'number': 10,
    //     'mag': "",
    //     'price': "20",
    //     'dealFromId': "11",
    //     'makertBundleId': "2",
    //     'productLine': "",
    //
    // },
    // {
    //   "id": 14,
    //   "nameEn": "PD",
    //   "nameCn": "AMI",
    //   "address": "Y77",
    //   "authoAddress": "Ingenuity TF Standard",
    //   "authoProduct": "2021-04-29 12:42:11",
    //   "authoStart": "",
    //   "authoOver": "有效",
    //     productType: 'Market Bundle4',
    //     productTypeChild: "",
    //     productName: "Market Bundle4名称",
    //     productModel: "Market Bundle4型号",
    //     costCenter: "23",
    //     localName: '',
    //     number: 10,
    //     mag: "",
    //     price: "20",
    //     dealFromId: "11",
    //     makertBundleId: "1",
    //     productLine: "",
    //     productInformations: [
    //       {
    //         id: `11-1`,
    //         productType: '',
    //         productTypeChild: "子产品",
    //         productName: "子产品名称1",
    //         productModel: "Market Bundle1型号",
    //         costCenter: "23",
    //         localName: '',
    //         number: 10,
    //         mag: "",
    //         price: "20",
    //         dealFromId: "11",
    //         makertBundleId: "1-1",
    //         productLine: "",
    //       },
    //       {
    //         id: `11-2`,
    //         productType: '',
    //         productTypeChild: "子产品",
    //         productName: "子产品名称2",
    //         productModel: "Market Bundle1型号",
    //         costCenter: "23",
    //         localName: '',
    //         number: 10,
    //         mag: "",
    //         price: "20",
    //         dealFromId: "11",
    //         makertBundleId: "1-2",
    //         productLine: "",
    //       },
    //       {
    //         id: `11-3`,
    //         productType: '',
    //         productTypeChild: "子产品",
    //         productName: "子产品名称2",
    //         productModel: "Market Bundle1型号",
    //         costCenter: "23",
    //         localName: '',
    //         number: 10,
    //         mag: "",
    //         price: "20",
    //         dealFromId: "11",
    //         makertBundleId: "1-2",
    //         productLine: "",
    //       }
    //     ]
    // },
  ];

  listOfMapData: TreeNodeInterface[] = [];
  ishowBundlecrm: boolean = false; //crm添加弹出窗口
  ishowBundlecp: boolean = false; //cp弹出窗口
  showoff: boolean = false; //添加o
  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.agentData.every(
      (item) => this.mapOfCheckedId[item.id]
    );
    this.isIndeterminate =
      this.agentData.some((item) => this.mapOfCheckedId[item.id]) &&
      !this.isAllDisplayDataChecked;
  }
  checkAll(val) {
    this.agentData.map((res) => {
      this.mapOfCheckedId[res.id] = val;
    });
    this.refreshStatus();
  }
  //
  // changCpAdd() {
  //   const a = [];
  //   this.tabList.map(item => {
  //     if (this.CkCpId[item.opportunityID]) {
  //       a.push(item);
  //     }
  //   });
  //   this.CkCp = a;
  //
  // }
  // changCrmAdd() {
  //   const a = [];
  //   this.crmData.map(item => {
  //     if (this.CkCrmId[item.opportunityID]) {
  //       a.push(item);
  //     }
  //   });
  //   this.CkCrm = a;
  //
  // }
  // 产品选择框crm
  changModelcrm(index, data) {
    this.CpOrCrm = "CRM";
    this.Ckdata = data;
    this.arr.tabList.map((res) => {
      res.radio = false;
    });
    this.arr.crmData.map((res) => {
      res.radio = false;
    });
    // this.crmData[index].radio = true;
    data.radio = true;
  }
  // 产品选择框cp
  changModel(index, data) {
    this.Ckdata = data;
    this.CpOrCrm = "CP";
    this.arr.tabList.map((res) => {
      res.radio = false;
    });
    this.arr.crmData.map((res) => {
      res.radio = false;
    });
    // this.tabList[index].radio = true;
    data.radio = true;
  }
  // 选择CP或CRM
  changCpOrCrm() {
    console.log(this.CpOrCrm);
  }

  //上一步
  prev() {
    this.myEvent.emit("pending-tab"); //传参给父组件;
  }
  //下一步
  next() {
    this.myEvent.emit("complete-pad"); //传参给父组件;
  }
  handleCancel() {
    this.showoff = false;
  }
  // 添加Opp
  // 确定按钮
  handleOk() {
    this.changes_t = false;
    // this.showoff = false;
    // 判断
    /*
    * 判断之前是否有添加过数据
    * 如果有
    * 判断医院名称和数据来源是否一样
    * */
    if (!(this.Ckdata && this.Ckdata.opportunityId)) {
      this.message.create('error', `请选择opportunity`);
      return;
    }
    if (this.productData && this.productData.length > 0) {
      // const ho = this.dataBase.hospitalName;
      const cporcrm = this.dataBase.baseDataFrom;
      if (cporcrm === 'CP') {
        const ho = this.dataBase.hospitalId;
        if (ho !== this.Ckdata.hospitalId) {
          this.message.create('error', `客户名称不一致`);
          return;
        }
      }
      if (cporcrm === 'CRM') {
        const ho = this.dataBase.accountNo;
        if (ho !== this.Ckdata.accountNo) {
          this.message.create('error', `客户名称不一致`);
          return;
        }
      }
      if (cporcrm !== this.CpOrCrm) {
        // 数据来源不一样
        this.message.create("error", `数据来源不一致`);
        return;
      }
    }
    // tslint:disable-next-line:variable-name
    let businessOpportunityHierarchyLink_let = '';
    if (this.CpOrCrm === 'CRM') {
      businessOpportunityHierarchyLink_let = this.Ckdata.opportunityHierachyLink; // 商家层级链接
    }
    if (this.CpOrCrm === 'CP') {
      businessOpportunityHierarchyLink_let = this.Ckdata.businessOpportunityHierarchyLink; // 商家层级链接
    }
    const obj = {
      opportunityId: this.Ckdata.opportunityId,
      opportunityName: this.Ckdata.opportunityName,
      marketBundleName: this.Ckdata.marketBundleName,
      createdDate: this.Ckdata.createdDate,
      baseDataFrom: this.CpOrCrm,
      dealFormId: this.Ckdata.dealFormId,
      listOfMapData: [],
      productInformations: [],
      productnamelist: [],
      businessOpportunityHierarchyLink : businessOpportunityHierarchyLink_let
    };
    if (this.productData.length > 0) {
      const check = this.productData.some(
        (res) => obj.opportunityId === res.opportunityId
      );
      if (check) {
        this.message.create("warning", "已经存在相同Opportunity ID");
        return;
      }
    }
    // 模板字段
    this.dataBase.city = this.Ckdata.city;
    // const today = new Date(this.Ckdata.createdDate);
    // if (today) {
    //   this.dataBase.opportunityDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    // }

    this.dataBase.baseDataFrom = this.CpOrCrm;
    if (this.dataBase.baseDataFrom === "CRM") {
      let url =
        "/act/ecom/tender/application/tenderQueryOpportunityProduct" +
        "?opportunityId=" +
        this.Ckdata.opportunityId;
      this.http.get(url).subscribe((e) => {
        obj.productnamelist = e.data;
      });
    }
    this.productData.push(obj);
    this.arr.CkOppo = this.Ckdata;

    // this.productData = disreduce(this.productData, "opportunityId");
    this.productData = Object.assign(this.productData, disreduce(this.productData, 'opportunityId'));
    this.upData.emit(this.productData);

    this.dataBase.hospitalId = this.Ckdata.hospitalId;
    this.dataBase.accountNo = this.Ckdata.accountNo;
    this.dataBase.accountId = this.Ckdata.accountId;
    this.dataBase.biddingNames = this.Ckdata.biddingCompanyName; // 投标公司
    this.dataBase.clientType = this.Ckdata.customerType; // 客户类型
    this.param.dealerName = this.dataBase.biddingNames; // 代理商名称
    this.dataBase.agreementAgenName = this.Ckdata.dealerName; // 协议代理商名称
    this.dataBase.tenderPriceCurrencys = this.Ckdata.currencySystem; // 币制
    this.dataBase.estimatedBidPriceCurrency = this.Ckdata.currencySystem; // 币制
    this.dataBase.purchaseGroup = this.Ckdata.groupName; // 集团名称
    this.dataBase.hospitalProvinceCode = this.Ckdata.provinceName; // 省份
    this.dataBase.paymentDescription = this.Ckdata.paymentMethodDescription; // 付款方式说明
    this.dataBase.category = this.Ckdata.category; // 客户分类
    // this.dataBase.businessOpportunityHierarchyLink=this.Ckdata.businessOpportunityHierarchyLink; // 商家层级链接
    this.dataBase.businessOpportunityHierarchyLink =
      this.Ckdata.opportunityHierachyLink; // 商家层级链接22
    this.dataBase.tenderPriceCurrency = this.toDecimal2(
      this.Ckdata.estimatedTenderPrice
    ); // 中标金额
    this.dataBase.estimatedBidPrice = this.dataBase.tenderPriceCurrency;//this.dataBase.estimatedBidPrice = this.Ckdata.estimatedTenderPrice; // 中标金额
    this.param.dealerName = this.Ckdata.dealerName; // 协议经销商名称
    if (
      this.param.dealerName != "" &&
      this.param.dealerName != undefined &&
      this.param.dealerName != null
    ) {
      this.agentInit();
      this.ServesiceService.bookEventer.emit(true);
    }
    else
    {
      this.ServesiceService.bookEventer.emit(false);
    }
    this.dataBase.biddingName = this.Ckdata.opportunityName;
    this.dataBase.biddingNo = this.Ckdata.tenderNo;
    this.dataBase.clientType = this.Ckdata.customerType;
    this.dataBase.businessType = this.Ckdata.businessModel;
    if (this.dataBase.baseDataFrom === "CRM") {
      this.dataBase.openBiddingDate = this.Ckdata.publicBiddingDate;
      this.dataBase.businessOpportunityHierarchyLink =
        this.Ckdata.opportunityHierachyLink; // 商家层级链接
      this.dataBase.hospitalName = this.Ckdata.accountName; // 医院名称
    }
    if (this.dataBase.baseDataFrom === "CP") {
      this.dataBase.openBiddingDate = this.Ckdata.bidDate;
      this.dataBase.businessOpportunityHierarchyLink =
        this.Ckdata.businessOpportunityHierarchyLink; // 商家层级链接
      this.dataBase.hospitalName = this.Ckdata.hospitalName; // 医院名称
    }
    // if (this.Ckdata.bidFlag == 0) {
    //   this.dataBase.tenderAuthorization = 'private';
    // }
    // if (this.Ckdata.bidFlag == 1) {
    //   this.dataBase.tenderAuthorization = 'nonprivate';
    // }
    this.dataBase.change = false; //控制投标公司是否清空
    this.showoff = false;
    //如果投标公司和代理商名称相同  补充页是否二级代理商为否 不相同为是
    this.dataBase.agentBidding =
      this.dataBase.agreementAgenName == this.dataBase.biddingNames
        ? "nonagency"
        : "agency";
    this.ngOnInit();
    this.Ckdata = {};
  }
  //加载代理商数据
  agentInit() {
    const url = `/act/ecom/bidding/selAgent`;
    this.http.post(url, this.param).subscribe(
      (res) => {
        if (res.code == '0000') {
          if (res.data.rows.length > 0) {
            this.dataBase.biddingComRegAddress = res.data.rows[0].registeredAddress; // 投标公司地址
            this.dataBase.biddingComRegCode = res.data.rows[0].registeredAddress; // 投标公司所在地
            this.dataBase.productModels = res.data.rows[0].authorizedProduct;
          }
        }
      },
        ((error) => {
          this.message.create('error', '请求异常!');
        })
      );
    }
  confirm(index) {
    this.Ckdata = {};
    if (this.OppCkMk[index]) {
      this.OppCkMk[index].map(mk => {
        this.tranf.isDisabled(mk.key, false);
      });
    }
    this.OppCkMk[index] = [];
    this.productData.splice(index, 1);
    if (this.dataBase.productInformations) {
      this.dataBase.productInformations.splice(index, 1);
    }
    if (this.productData.length < 1) {
      this.dataBase.baseDataFrom = '';
      // 清空基础信息
      this.ClearApply();
      // 清空补充信息
      this.ClearSupp();
      // 清空全局选中Opp
      this.arr.CkOppo = {};
      this.arr.firstopp = false;
    }
    // this.ServesiceService.bookEventer.emit();清空数据
  }

  // 清空补充信息
  public ClearSupp () {
    this.dataBase.tenderAuthorization = 'nonprivate';
    this.dataBase.biddingNames = '';
    this.dataBase.biddingComRegAddress = '';
    this.dataBase.biddingComRegCode = '';
    this.dataBase.logisticsTermsExplain = '';
    this.dataBase.logisticsDescription = '';
    this.dataBase.afterSalesInstructions = '';
    this.dataBase.tenderPriceCurrencys = null;
    this.dataBase.tenderPriceCurrency = '';
    this.dataBase.estimatedBidPriceCurrency = '';
    this.dataBase.estimatedBidPrice = '';
    this.dataBase.percentageTotalPrice = '';
    this.dataBase.totalPrice = '';
    this.dataBase.marginLevel = '';
    this.dataBase.performanceBonds = '';
    this.dataBase.paymentDescription = null;
    this.dataBase.paymentDescriptions = '';
    this.dataBase.technicalTerms = '';
    this.dataBase.legalProvisions = '';
    this.dataBase.agentBidding = 'agency';
    this.dataBase.biddingDdpState = '';
    this.dataBase.agreementAgenName = '';
    this.dataBase.contractorTenderEntrustmentFileId = '';
    this.dataBase.sealedFileId = '';
    this.dataBase.fileId = '';
    this.file_arr.fileList = []; // 上传招标文件列表
    this.file_arr.fileSealList = []; // 上传盖章后的文件列表
    this.file_arr.fileAgentList = []; // 协议代理商出具投标委托函
  }
  // 清空基础信息
  ClearApply() {
    this.dataBase.applyType = null;
    this.dataBase.biddingName = '';
    this.dataBase.businessType = null;
    this.dataBase.biddingNo = '';
    this.dataBase.biddinOrgName = '';
    this.dataBase.openBiddingDate = '';
    this.dataBase.biddingValidDay = 90;
    this.dataBase.hospitalName = '';
    this.dataBase.clientType = null;
    this.dataBase.purchaseGroup = '';
    this.dataBase.hospitalProvinceCode = null;
    // this.dataBase.biddingManager = '';
    // this.dataBase.biddingManagerTitle = '';
    this.dataBase.biddingComRegAddress = null;
    this.dataBase.category = null;
    this.dataBase.accountNo = '';
    this.dataBase.accountId = '';
    this.dataBase.hospitalId = '';
  }

  // 弹出窗口id
  showDiag() {
    this.showoff = true;
    if (this.dataBase.baseDataFrom === 'CP') {
      // this.changModel(0, this.arr.CkOppo);
    }
    if (this.dataBase.baseDataFrom === 'CRM') {
      // this.changModelcrm(0, this.arr.CkOppo);
    }
    this.Ckdata = {};
    // 将已经添加的opportunityId禁用
    if (this.arr && this.arr.tabList) {
      for (let i = 0; i < this.arr.tabList.length; i++) {
        this.arr.tabList[i].is = false;
        this.arr.tabList[i].radio = false;
      }
    }
    if (this.productData) {
      this.productData.map( e => {
        if (this.arr && this.arr.tabList) {
          this.arr.tabList.map( arr => {
            arr.radio = false;
            if (e.opportunityId == arr.opportunityId) {
              arr.is = true;
            }
          });
        }
      });
    }
    // 第一次才加载
    if (this.arr.firstopp) {
      return;
    }
    this.arr.firstopp = true;
    // 获取数据
    this.getDataFormOpp();
  }
  delProduct(i, m, item) {
    this.productData[i].listOfMapData.splice(m, 1);
    this.productData[i].productInformations.splice(m, 1);
    // this.tranf.checkOptionsOne.splice(m, 1);
    if (this.OppCkMk[i]) {
      this.OppCkMk[i].splice(m, 1);
      this.tranf.transSpecificNodeToLeft(item);
    }
    // if (this.dataBase.baseDataFrom == "CP") {
      // this.tranf.isDisabled(item.key, false); // 取消选择框禁用
    // }
    this.ngOnInit();
  }
  cancel() {}
  showBundle(index) {
    // 打开弹出窗口
    this.tranf.reset()
    if (this.dataBase.baseDataFrom == "CRM") {
      this.ishowBundlecrm = true;
      this.ishowBundlecp = false;
      this.showCurr = index;
      const opportunityId = this.productData[index].opportunityId;
      this.ckopportunityId = opportunityId;
      this.getDataFromMk(opportunityId);
    } else {
      this.ishowBundlecrm = false;
      this.ishowBundlecp = true;
      this.showCurr = index;
      const opportunityId = this.productData[index].opportunityId;
      const productName = this.productData[index].marketBundleName;
      // if (this.OppCkMk && this.OppCkMk[this.showCurr])
      //   this.tranf.checkOptionsOne = [...this.OppCkMk[this.showCurr]];
      // else this.tranf.checkOptionsOne = [];
      this.getProduct(opportunityId, productName);
    }
    // 获取数据
    // console.log(this.productData[index].opportunityId)
    // const opportunityId=this.productData[index].opportunityId;
    // this.getDataFromMk(opportunityId);
    // this.ishowBundlecrm = true;
    // this.ishowBundlecp = false;
    // this.showCurr = index;
  }
  // crm状态下的确认
  bundlecrmOk() {
    const arr = [];
    this.agentData.map((res) => {
      for (let key in this.mapOfCheckedId) {
        if (this.mapOfCheckedId[key] && res.id === key) {
          arr.push(res);
        }
      }
    });
    if (arr) {
      arr.map((a) => {
        a.bmc = a.modalityBmc;
        a.cluster = a.marketBundleCluster;
        a.number = a.productAmount;
        a.baseDataFrom = this.dataBase.baseDataFrom;
      });
    }
    this.ishowBundlecrm = false;
    this.productData[this.showCurr].productInformations = this.productData[
      this.showCurr
    ].productInformations
      ? this.productData[this.showCurr].productInformations
      : [];
    this.productData[this.showCurr].productInformations = [
      ...this.productData[this.showCurr].productInformations,
      ...arr,
    ];
    this.mapOfCheckedId = {};
    // if (this.productData) {
    //   this.productData.map(val => {
    //     if (val.productInformations) {
    //       val.productInformations.map(vals => {
    //         val.mag = vals.mag;
    //       });
    //     }
    //   });
    // }

    /*
     * 清空搜索框
     * */
    this.mkSeach.localName = "";
    this.mkSeach.marketBundleCluster = "";
    this.mkSeach.modalityBmc = "";
    this.mkSeach.mag = "";
    this.ngOnInit();
  }
  // crm状态下的取消
  bundlecrmCancel() {
    this.ishowBundlecrm = false;
  }
  // cp状态下的确认
  bundleOk() {
    const arr = [...this.tranf.getValue()];
    this.ishowBundlecp = false;
    this.OppCkMk[this.showCurr] = [...this.tranf.getValue()];
    this.recursion(arr, "children", "productInformations");
    // simulationId  dealFormMarketBundleId  dealFormId
    if (arr) {
      arr.map((mk) => {
        if (mk.productInformations) {
          mk.productInformations.map((pro) => {
            pro.marketBundleId = mk.dealFormMarketBundleId;
            pro.baseDataFrom = this.dataBase.baseDataFrom;
            mk.mag = pro.mag;
            pro.bmc = pro.modalityBmc;
            mk.bmc = pro.modalityBmc;
            pro.number = parseInt(mk.marketBundleQuantity);
            // if (mk.cluster) {
            //   pro.cluster = mk.cluster;
            // }
          });
        }
        mk.marketBundleId = mk.dealFormMarketBundleId;
        mk.baseDataFrom = this.dataBase.baseDataFrom;
        mk.number = parseInt(mk.marketBundleQuantity);
      });
    }
    this.productData[this.showCurr].productInformations = this.productData[
      this.showCurr
    ].productInformations
      ? this.productData[this.showCurr].productInformations
      : [];
    this.productData[this.showCurr].productInformations = [
      ...arr,
    ];
    this.ngOnInit();
    this.tranf.checkOptionsOne = [];
    // 更新数据，穿梭框已选项右移动
    let index = this.dataBase.productInformations.findIndex(item=>item.opportunityId===this.productData[this.showCurr].opportunityId)
    if(index>=0){
      this.dataBase.productInformations[index] = this.productData[this.showCurr]
    }else{
      this.dataBase.productInformations.push(this.productData[this.showCurr])
    }
  }

  //cp状态下的取消
  bundleCancel() {
    this.ishowBundlecp = false;
    // this.tranf.checkOptionsOne = [];
  }
  //递归调用
  /*
   * //parm 当前数组名称 parms 转换成的数组名称， level分出层级
   */
  recursion(val, parm?: any, parms?: any, level?: any) {
    level = level || 0;
    level++;
    val.map((res) => {
      if (res[parm] && res[parm].length > 0) {
        let value = [...res[parm]];
        res[parms] = value;
        res.id = res.id || res.key;
        this.recursion(res[parm], parm, parms);
      }
    });
  }
  addProduct() {
    const url = '/act/ecom/tender/application/getTenderApplicationDto?mainId=';
    const mainid = decodeString(this.activeRoute.queryParams['_value'].id);
    if (mainid && mainid !== '') {
      this.http.get(url + mainid).subscribe(res => {
        if (
          res.data &&
          res.data.productInformations &&
          res.data.productInformations.length > 0
        ) {
          // this.productData = this.dataBase.productInformations;
          this.productData = Object.assign(this.productData, res.data.productInformations);
          if (this.productData) {
            for (let i = 0; i < this.productData.length; i++) {
              /*CRM链接获取Commercial Product Name*/
              if (res.data.baseDataFrom === 'CRM') {
                const url = '/act/ecom/tender/application/tenderQueryOpportunityProduct?opportunityId=' + this.productData[i].opportunityId;
                this.http.get(url).subscribe((e) => {
                  this.productData[i].productnamelist = e.data;
                });
              }
              /***结束***/
              if (this.productData[i].productInformations && this.productData[i].productInformations.length > 0) {
                this.listOfMapData = JSON.parse(
                  JSON.stringify(this.productData[i].productInformations)
                );
                if (this.listOfMapData) {
                  this.listOfMapData.forEach((item) => {
                    this.mapOfExpandedData[item.id] = this.convertTreeToList(item);
                  });
                }
                this.productData[i].listOfMapData = JSON.parse(JSON.stringify(this.listOfMapData));
              }
            }
          }
        }
      });
    }
  }
  ngOnChanges() {
    /*添加oppo 禁用*/
    if (!this.changes_t) {
      return;
    }
    return;
      setTimeout(() => {
        console.log('执行第一次chang');
        try {
          if (
            this.dataBase &&
            this.dataBase.productInformations &&
            this.dataBase.productInformations.length > 0
          ) {
            // this.productData = this.dataBase.productInformations;
            this.productData = Object.assign(this.productData, this.dataBase.productInformations);
            if (this.productData) {
              for (let i = 0; i < this.productData.length; i++) {
                /*CRM链接获取Commercial Product Name*/
                if (this.dataBase.baseDataFrom === 'CRM') {
                  const url = '/act/ecom/tender/application/tenderQueryOpportunityProduct?opportunityId=' + this.productData[i].opportunityId;
                  this.http.get(url).subscribe((e) => {
                    this.productData[i].productnamelist = e.data;
                  });
                }
                /***结束***/
                if (this.productData[i].productInformations && this.productData[i].productInformations.length > 0) {
                  this.listOfMapData = JSON.parse(
                    JSON.stringify(this.productData[i].productInformations)
                  );
                  if (this.listOfMapData) {
                    this.listOfMapData.forEach((item) => {
                      this.mapOfExpandedData[item.id] = this.convertTreeToList(item);
                    });
                  }
                  this.productData[i].listOfMapData = JSON.parse(JSON.stringify(this.listOfMapData));
                }
              }
            }
            // this.productData.map((res) => {
            //   try {
            //     if (res.productInformations && res.productInformations.length > 0) {
            //       this.listOfMapData = JSON.parse(
            //           JSON.stringify(res.productInformations)
            //       );
            //       if (this.listOfMapData) {
            //         this.listOfMapData.forEach((item) => {
            //           this.mapOfExpandedData[item.id] = this.convertTreeToList(item);
            //         });
            //       }
            //       res.listOfMapData = JSON.parse(JSON.stringify(this.listOfMapData));
            //     }
            //   } catch (e) {
            //     console.log('第二级');
            //     console.log('产品错误眼');
            //   }
            // });
          }
        } catch (e) {
          console.log('第一级');
          console.log('产品错误眼');
        }
      }, 500);
  }
  ngOnInit() {
    let flag = this.activatedRouter.queryParams["_value"].flag;
    if (flag != undefined && flag != null && flag != "") {
      this.flag = flag;
    } else {
      this.flag = 0;
    }
    this.productData.map((res) => {
      // if(res.productInformations&&res.productInformations.length>0)
      // {
      this.listOfMapData = JSON.parse(JSON.stringify(res.productInformations));
      this.listOfMapData.forEach((item) => {
        this.mapOfExpandedData[item.id] = this.convertTreeToList(item);
      });
      res.listOfMapData = JSON.parse(JSON.stringify(this.listOfMapData));
      // }
    });
    if (!this.changes_t) {
      return;
    }
    this.addProduct();
    this.changes_t = false;
  }
  //穿梭框选择
  select(ret: {}): void {
    console.log("nzSelectChange", ret);
  }

  change(ret: {}): void {
    console.log("nzChange", ret);
  }
  //添加Market Bundle
  addBundle() {}

  mapOfExpandedData: { [id: string]: TreeNodeInterface[] } = {};

  collapse(
    array: TreeNodeInterface[],
    data: TreeNodeInterface,
    $event: boolean
  ): void {
    if (!$event) {
      if (data.productInformations) {
        data.productInformations.forEach((d) => {
          const target = array.find((a) => a.id === d.id)!;
          target.expand = false;
          this.collapse(array, target, false);
        });
      } else {
        return;
      }
    }
  }

  convertTreeToList(root: TreeNodeInterface): TreeNodeInterface[] {
    const stack: TreeNodeInterface[] = [];
    const array: TreeNodeInterface[] = [];
    const hashMap = {};
    stack.push({ ...root, level: 0, expand: false });
    while (stack.length !== 0) {
      const node = stack.pop()!;
      this.visitNode(node, hashMap, array);
      if (node.productInformations) {
        for (let i = node.productInformations.length - 1; i >= 0; i--) {
          stack.push({
            ...node.productInformations[i],
            level: node.level! + 1,
            expand: false,
            parent: node,
          });
        }
      }
    }

    return array;
  }

  visitNode(
    node: TreeNodeInterface,
    hashMap: { [id: string]: boolean },
    array: TreeNodeInterface[]
  ): void {
    if (!hashMap[node.id]) {
      hashMap[node.id] = true;
      array.push(node);
    }
  }

  // 获取Opp数据
  getDataFormOpp() {
    // /act/ecom/bidding/biddingQueryOpportunityId
    // /act/ecom/tender/application/tenderQueryOpportunityIds
    const url = "/act/ecom/tender/application/tenderQueryOpportunityIds";
    const data = {};
    this.OpLoad = true;
    this.http.post(url, data).subscribe(res => {
      if (res.code === '0000') {
        console.log(res.data);
        this.OpLoad = false;
        // dealFormDtoSimulations     dealFormDtos
        if (res.data) {
          this.arr.tabList = res.data.dealFormDtoSimulations;
          this.arr.crmData = res.data.dealFormDtos;
        } else {
          this.arr.tabList = [];
          this.arr.crmData = [];
        }
        // 将已经添加的opportunityId禁用
        if (this.arr && this.arr.tabList) {
          for (let i = 0; i < this.arr.tabList.length; i++) {
            this.arr.tabList[i].is = false;
            this.arr.tabList[i].radio = false;
          }
        }
        if (this.productData) {
          this.productData.map( e => {
            if (this.arr && this.arr.tabList) {
              this.arr.tabList.map( arr => {
                arr.radio = false;
                if (e.opportunityId == arr.opportunityId) {
                  arr.is = true;
                }
              });
            }
          });
        }
      } else {
        this.message.create('error', res.msg);
      }
    });
  }

  // 搜索框查询
  SeachOpp() {
    // console.log(this.oppSeach);
    const url = '/act/ecom/tender/application/tenderQueryOpportunityIds';
    const data = {};
    if (this.oppSeach.accountName === '')
      this.oppSeach.accountName = null;
    if (this.oppSeach.opportunityId === '')
      this.oppSeach.opportunityId = null;
    if (this.oppSeach.opportunityName === '')
      this.oppSeach.opportunityName = null;
    if (this.oppSeach.dealFormId === '')
      this.oppSeach.dealFormId = null;
    this.OpLoad = true;
    this.http.post(url, this.oppSeach).subscribe(
      (res) => {
        this.OpLoad = false;
        if (res.code === "0000") {
          console.log(res.data);
          // dealFormDtoSimulations     dealFormDtos
          if (res.data) {
            this.arr.tabList = res.data.dealFormDtoSimulations;
            this.arr.crmData = res.data.dealFormDtos;
          } else {
            this.arr.tabList = [];
            this.arr.crmData = [];
          }
        } else {
        }
      },
      (error) => {
        this.message.create("error", "请求异常");
        this.OpLoad = false;
      }
    );
  }

  // 获取Mk数据
  getDataFromMk(parm) {
    // /act/ecom/bidding/biddingQueryMarketBundle
    const url = "/act/ecom/tender/application/tenderQueryMarketBundleAll";
    const data = {
      opportunityId: parm,
    };
    this.MkLoad = true;
    this.http.post(url, data).subscribe(
      (res) => {
        if (res.code === "0000") {
          for (let i = 0; i < res.data.marketBundles.length; i++) {
            res.data.marketBundles[i].marketBundleName =
              res.data.marketBundles[i].localName;
            res.data.marketBundles[i].productType = "";
          }
          this.agentData = res.data.marketBundles;
          this.refreshStatus();
        } else {
        }
        this.MkLoad = false;
      },
      (error) => {
        this.message.create("error", "请求异常!");
        this.MkLoad = false;
      }
    );
  }

  // 搜索框查询
  SeachMk() {
    const url = "/act/ecom/tender/application/tenderQueryMarketBundleAll";
    const data = {
      opportunityId: this.ckopportunityId,
    };
    // this.mkSeach.mag = this.mkSeach.mag == null ? '' : this.mkSeach.mag;
    // this.mkSeach.modalityBmc = this.mkSeach.modalityBmc == null ? '' : this.mkSeach.modalityBmc;
    // this.mkSeach.marketBundleCluster = this.mkSeach.marketBundleCluster == null ? '' : this.mkSeach.marketBundleCluster;
    // this.mkSeach.localName = this.mkSeach.localName == null ? '' : this.mkSeach.localName;
    this.mkSeach.opportunityId = this.ckopportunityId;
    this.MkLoad = true;
    this.http.post(url, this.mkSeach).subscribe(
      (res) => {
        if (res.code === "0000") {
          for (let i = 0; i < res.data.marketBundles.length; i++) {
            res.data.marketBundles[i].marketBundleName =
              res.data.marketBundles[i].localName;
            res.data.marketBundles[i].productType = "";
          }
          this.agentData = res.data.marketBundles;
          this.refreshStatus();
        } else {
        }
        this.MkLoad = false;
      },
      (error) => {
        this.message.create("error", "请求异常!");
        this.MkLoad = false;
      }
    );
  }

  // 获取cp产品信息
  getProduct(param, productName) {
    // if (this.firstcp) {
    //   return;
    // }
    // this.firstcp = true;
    // /act/preparation/queryMarketBundle
    const url = `/act/ecom/tender/application/tenderQueryMarketBundles?opportunityId=${param}&productName=${productName}`;
    const params = {
      opportunityId: param,
      productName: productName,
    };
    this.http.post(url, params).subscribe(
      (res) => {
        if (res.code == "0000") {
          this.dataBase.dataList = this.setTitleAndKey(res.data);
          // console.log('this.dataBase.dataList',this.dataBase.dataList);
        } else {
          this.message.create("error", res.msg);
        }
      },
      (error) => {
        // this.firstcp = false;
        this.message.create("error", "请求异常!");
      }
    );
  }

  // 判断数据来源  分辨产品信息为cp的时候第一行显示 mk 字段
  CkPro(e) {
    if (this.dataBase.baseDataFrom == "CRM") {
      return true;
    }
    if (this.dataBase.baseDataFrom == "CP" && e == 0) {
      return true;
    }
    return false;
  }

  setTitleAndKey(data) {
    let mk = this.getCkMkPro();
    for (let i = 0; i < data.length; i++) {
      data[i].title = "Simulation Id:" + data[i].simulationId;
      data[i].key = data[i].simulationId;
      data[i].level = 1;
      for (let i2 = 0; i2 < data[i].children.length; i2++) {
        data[i].children[i2].title = data[i].children[i2].marketBundleName;
        data[i].children[i2].key = data[i].children[i2].id;
        data[i].children[i2].level = 2;
        data[i].children[i2].mkey = data[i].children[i2].id;

        // 判断是否已经添加，已添加则禁用
        // if (mk) {
        //   mk.map(m => {
        //     if (m.marketBundleName ===  data[i].children[i2].title) {
        //       data[i].children[i2].disableCheckbox = true;
        //       data[i].disableCheckbox = true;
        //     }
        //   });
        // }

        for (let i3 = 0; i3 < data[i].children[i2].children.length; i3++) {
          data[i].children[i2].children[i3].title =
            data[i].children[i2].children[i3].productName;
          // data[i].children[i2].children[i3].key = data[i].children[i2].children[i3].id;
          data[i].children[i2].children[i3].level = 3;
          // 节点禁用
          // data[i].children[i2].children[i3].disableCheckbox = true;
          // 叶子节点
          data[i].children[i2].children[i3].isLeaf = true;
          delete data[i].children[i2].children[i3].children;
        }
      }
    }
    return data;
  }

  toDecimal2(x) {
    const fc = parseFloat(x);
    if (isNaN(fc)) {
      return x;
    }
    const f = Math.round(x * 100) / 100;
    let s = f.toString();
    let rs = s.indexOf('.');
    if (rs < 0) {
      rs = s.length;
      s += '.';
    }
    while (s.length <= rs + 2) {
      s += '0';
    }
    return s;
  }

  // 获取已添加的Mk
  getCkMkPro() {
    const mk = [];
    if (this.productData) {
      for (let i = 0; i < this.productData.length; i++) {
        if (this.productData[i].listOfMapData) {
          this.productData[i].listOfMapData.map((data) => {
            mk.push(data);
            // if (!this.OppCkMk[i]) {
            //   this.OppCkMk[i] = [];
            // }
            // this.OppCkMk[i].push(data);
          });
        }
      }
    }
    return mk;
  }
}
