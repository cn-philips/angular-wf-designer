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

  @Input() agreementSelect: any = [];
  @Input() selAgent_all: any = [];
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
  public loadObj: any = {
    opportunity: false,
    simulation: false
  };
  MkLoad: any = false;

  // 弹出框时选中 oppid
  public ckopportunityId: any = "";
  // opp查询参数
  public oppSeach: any = {
    opportunityId: '',
    opportunityName: '',
    accountName: '',
    dealFormId: '',
    simulationId: ''
  };
  // mk查询参数
  public mkSeach: any = {
    localName: "",
    marketBundleCluster: "",
    modalityBmc: "",
    mag: "",
  };

  @Input() public paramsCP = {
    pageNo: 1,
    pageSize: 10,
    total: 0
  };
  @Input() public paramsCRM = {
    pageNo: 1,
    pageSize: 10,
    total: 0
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

  @Output() disableValidateForm = new EventEmitter<any>();

  listOfMapData: TreeNodeInterface[] = [];
  ishowBundlecrm: boolean = false; //crm添加弹出窗口
  ishowBundlecp: boolean = false; //cp弹出窗口
  showoff: boolean = false; //添加o
  public showoff_loading: any = false;
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
    // this.CpOrCrm = "CRM";
    this.CpOrCrm = 'CP Simulation';
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
    // this.CpOrCrm = "CP";
    this.CpOrCrm = 'CP Deal Form';
    this.arr.tabList.map((res) => {
      res.radio = false;
    });
    this.arr.crmData.map((res) => {
      res.radio = false;
    });
    // this.tabList[index].radio = true;
    data.radio = true;
  }
  // 上一步
  prev() {
    this.myEvent.emit('pending-tab'); // 传参给父组件;
  }
  // 下一步
  next() {
    this.myEvent.emit('complete-pad'); // 传参给父组件;
  }
  handleCancel() {
    this.showoff = false;
  }

  public changePageIndexCP(e) {
    this.paramsCP.pageNo = e;
    this.getDataCP();
  }
  public changePageSizeCP(e) {
    this.paramsCP.pageSize = e;
    this.getDataCP();
  }
  public changePageIndexCRM(e) {
    this.paramsCRM.pageNo = e;
    this.getDataCRM();
  }
  public changePageSizeCRM(e) {
    this.paramsCRM.pageSize = e;
    this.getDataCRM();
  }

  public getDataCP() {
    const urlCP = '/act/ecom/tender/application/tenderQueryOpportunityCP';
    if (this.oppSeach.accountName === '')
      this.oppSeach.accountName = null;
    if (this.oppSeach.opportunityId === '')
      this.oppSeach.opportunityId = null;
    if (this.oppSeach.opportunityName === '')
      this.oppSeach.opportunityName = null;
    if (this.oppSeach.dealFormId === '')
      this.oppSeach.dealFormId = null;
    if (this.oppSeach.simulationId === '')
      this.oppSeach.simulationId = null;
    const dataCP = {
      pageNo: this.paramsCP.pageNo,
      pageSize: this.paramsCP.pageSize
    };
    Object.assign(dataCP, this.oppSeach);
    this.loadObj.opportunity = true;
    this.http.post(urlCP, dataCP).subscribe(res => {
      this.loadObj.opportunity = false;
      // dealFormDtoSimulations     dealFormDtos
      if (res.data) {
        this.arr.tabList = res.data.rows;
        this.paramsCP.total = res.data.total;
        this.paramsCP.pageNo = res.data.page;
        // this.arr.crmData = res.data.dealFormDtos;
      } else {
        this.arr.tabList = [];
        this.paramsCP.total = 0;
        // this.arr.crmData = [];
      }
      // 将已经添加的opportunityId禁用 CP
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
              if (e.opportunityId == arr.opportunityId && e.dealFormId == arr.dealFormId) {
                arr.is = true;
              }
            });
          }
        });
      } else {
      }
    }, error => {
      this.loadObj.opportunity = false;
      this.message.create('error', '请求异常');
    });
  }
  public getDataCRM() {
    const urlCRM = '/act/ecom/tender/application/tenderQueryOpportunitySimulation';
    if (this.oppSeach.accountName === '')
      this.oppSeach.accountName = null;
    if (this.oppSeach.opportunityId === '')
      this.oppSeach.opportunityId = null;
    if (this.oppSeach.opportunityName === '')
      this.oppSeach.opportunityName = null;
    if (this.oppSeach.dealFormId === '')
      this.oppSeach.dealFormId = null;
    if (this.oppSeach.simulationId === '')
      this.oppSeach.simulationId = null;
    const dataCRM = {
      pageNo: this.paramsCRM.pageNo,
      pageSize: this.paramsCRM.pageSize,
      dealFormId: null
    };
    Object.assign(dataCRM, this.oppSeach);
    // Simulation 不加 dealFormId 条件
    // dataCRM.dealFormId = null;
    this.loadObj.simulation = true;
    this.http.post(urlCRM, dataCRM).subscribe(res => {
      this.loadObj.simulation = false;
      // dealFormDtoSimulations     dealFormDtos
      if (res.data) {
        // this.arr.tabList = res.data.dealFormDtoSimulations;
        this.arr.crmData = res.data.rows;
        this.paramsCRM.total = res.data.total;
        this.paramsCRM.pageNo = res.data.page;
      } else {
        // this.arr.tabList = [];
        this.arr.crmData = [];
        this.paramsCRM.total = 0;
      }
      // 将已经添加的opportunityId禁用 CRM
      if (this.arr && this.arr.crmData) {
        for (let i = 0; i < this.arr.crmData.length; i++) {
          this.arr.crmData[i].is = false;
          this.arr.crmData[i].radio = false;
        }
      }
      if (this.productData) {
        this.productData.map( e => {
          if (this.arr && this.arr.crmData) {
            this.arr.crmData.map( arr => {
              arr.radio = false;
              if (e.opportunityId == arr.opportunityId) {
                arr.is = true;
              }
            });
          }
        });
      } else {
      }
    }, error => {
      this.loadObj.simulation = false;
      this.message.create('error', '请求异常');
    });
  }

  // 校验 opportunityId 和 dealFormId 是否已添加
  public CkOpportunityIdAndDealFormId(opportunity) {
    for (let i = 0; i < this.productData.length; i++) {
      if (this.CpOrCrm === 'CP Deal Form') {
        if (this.productData[i].opportunityId == opportunity.opportunityId && this.productData[i].dealFormId == opportunity.dealFormId) {
          return false;
        }
        // 判断是否重复simulationId
        if (this.productData[i].simulationId == opportunity.simulationId) {
          this.message.create('error', 'simulationId:' + opportunity.simulationId + '已存在，' + opportunity.opportunityId + '添加失败！');
          return false;
        }
      } else {
        if (this.productData[i].opportunityId == opportunity.opportunityId) {
          return false;
        }
      }
    }
    return true;
  }

  // 校验Oppo是否可以添加
  public CkOpportunity (opportunity) {
    if (this.productData && this.productData.length > 0) {
      // 校验opportunityId 和 dealFormId 是否存在
      if (!this.CkOpportunityIdAndDealFormId(opportunity)) {
        return false;
      }
      const ho = this.dataBase.hospitalId;
      if (ho !== opportunity.hospitalId) {
        this.message.create('error', `客户名称不一致`);
        return false;
      }
    }
    return true;
  }

  // 添加Oppo
  public AddOpportunity(opportunity) {
    const obj = {
      opportunityId: opportunity.opportunityId,
      opportunityName: opportunity.opportunityName,
      simulationId: opportunity.simulationId,
      createdDate: opportunity.createdDate,
      baseDataFrom: this.CpOrCrm,
      dealFormId: opportunity.dealFormId,
      listOfMapData: [],
      productInformations: [
      ],
      productnamelist: [],
      businessOpportunityHierarchyLink : opportunity.opportunityHierachyLink
    };
    this.dataBase.baseDataFrom = this.CpOrCrm;
    if (this.dataBase.baseDataFrom === 'CRM' || this.dataBase.baseDataFrom === 'CP Simulation') {
      let url = '/act/ecom/tender/application/tenderQueryOpportunityProduct' + '?opportunityId=' + opportunity.opportunityId;
      this.http.get(url).subscribe(e => {
        obj.productnamelist = e.data;
      });
    }
    this.productData.push(obj);
    // 自动带入产品
    this.getProductInsert(opportunity.opportunityId, opportunity.dealFormId, this.dataBase.baseDataFrom);
  }
  // 导入Oppo数据
  public AddOpportunityData(opportunity) {

    // this.arr.CkOppo = this.Ckdata;

    // 模板字段
    this.dataBase.city = this.Ckdata.city;
    this.dataBase.hospitalId = this.Ckdata.hospitalId;
    this.dataBase.clientNo = this.Ckdata.hospitalId;
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
    // this.dataBase.businessOpportunityHierarchyLink = this.Ckdata.opportunityHierachyLink; // 商家层级链接22
    this.dataBase.tenderPriceCurrency = this.toDecimal2(this.Ckdata.estimatedTenderPrice) ; // 中标金额 ,需判断是否保留两位小数
    this.dataBase.estimatedBidPrice = this.dataBase.tenderPriceCurrency; // 中标金额，保留两位小数
    // this.param.dealerName = this.Ckdata.dealerName; // 协议经销商名称
    this.dataBase.biddingName = this.Ckdata.opportunityName;
    this.dataBase.biddingNo = this.Ckdata.tenderNo;
    this.dataBase.clientType = this.Ckdata.customerType;
    this.dataBase.businessType = this.Ckdata.businessModel;
    console.log(this.dataBase.baseDataFrom);
    if (this.dataBase.baseDataFrom === 'CRM' || this.dataBase.baseDataFrom === 'CP Simulation') {
      this.dataBase.openBiddingDate = this.Ckdata.publicBiddingDate;
      this.dataBase.businessOpportunityHierarchyLink = this.Ckdata.opportunityHierachyLink; // 商家层级链接
      // oppo 表
      this.dataBase.hospitalName = this.Ckdata.hospitalName; // 医院名称
    }
    if (this.dataBase.baseDataFrom === 'CP' || this.dataBase.baseDataFrom === 'CP Deal Form') {
      this.dataBase.openBiddingDate = this.Ckdata.bidDate;
      this.dataBase.businessOpportunityHierarchyLink = this.Ckdata.opportunityHierachyLink; // 商家层级链接
      // dealfrom 表
      this.dataBase.hospitalName = this.Ckdata.hospitalName; // 医院名称
    }
    this.dataBase.change = false; // 控制投标公司是否清空
    // 如果投标公司和代理商名称相同  补充页是否二级代理商为否 不相同为是
    this.dataBase.agentBidding = this.dataBase.agreementAgenName == this.dataBase.biddingNames ? 'nonagency' : 'agency';
    if (this.dataBase.biddingNames == '飞利浦(中国)投资有限公司') {
      this.dataBase.biddingComRegCode = '中国';
      this.dataBase.biddingComRegAddress = '地址1';
    }
    else if (this.dataBase.biddingNames == '飞利浦电子香港有限公司') {
      this.dataBase.biddingComRegCode = '中国香港';
      this.dataBase.biddingComRegAddress = '地址2';
    }
  }

  // 添加Opp
  // 确定按钮
  public async handleOk() {
    this.changes_t = false;
    this.showoff_loading = true;
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
      if (cporcrm !== this.CpOrCrm) {
        // 数据来源不一样
        this.message.create('error', `数据来源不一致`);
        return;
      }
    }
    // 获取oppor包含所有dealfrom的oppor
    const urlCP = '/act/ecom/tender/application/tenderQueryOpportunityCP';

    if (this.CpOrCrm !== 'CP Deal Form') {

      if (this.CkOpportunity(this.Ckdata)) {
        if (!(this.productData && this.productData.length > 0)) {
          this.AddOpportunity(this.Ckdata);
          this.AddOpportunityData(this.Ckdata);
        } else {
          this.AddOpportunity(this.Ckdata);
        }

        if (this.dataBase.biddingNames != '' && this.dataBase.biddingNames != undefined && this.dataBase.biddingNames != null) {
          await this.agentInit_Bidding();
          // this.ServesiceService.bookEventer.emit(true);
        } else {
          // this.ServesiceService.bookEventer.emit(false);
        }
        if (this.dataBase.agreementAgenName != '' && this.dataBase.agreementAgenName != undefined && this.dataBase.agreementAgenName != null) {
          await this.agentInit_Agregent();
          // this.ServesiceService.bookEventer.emit(true);
        } else {
          // this.ServesiceService.bookEventer.emit(false);
        }

        this.showoff = false;
        this.Ckdata = {};
        this.showoff_loading = false;
        this.ngOnInit();
        this.disableValidateForm.emit();
      }
    } else {
      const dataCP = {
        pageNo: 1,
        pageSize: 0x7fffffff,
        opportunityId: this.Ckdata.opportunityId
      };
      this.http.post(urlCP, dataCP).subscribe(async res => {
        console.log(res.data);
        // dealFormDtoSimulations     dealFormDtos
        if (res.data) {
          const opporList = res.data.rows;
          if (!(this.productData && this.productData.length > 0)) {
            // 第一条Oppo数据添加
            if (this.CkOpportunity(this.Ckdata)) {
              this.AddOpportunity(this.Ckdata);
              // 带入第一次选中的数据
              this.AddOpportunityData(this.Ckdata);
            }
          }
          for (let i = 0; i < opporList.length; i++) {
            if (this.CkOpportunity(opporList[i])) {
              this.AddOpportunity(opporList[i]);
            }
          }

          if (this.dataBase.biddingNames != '' && this.dataBase.biddingNames != undefined && this.dataBase.biddingNames != null) {
            await this.agentInit_Bidding();
            // this.ServesiceService.bookEventer.emit(true);
          } else {
            // this.ServesiceService.bookEventer.emit(false);
          }
          if (this.dataBase.agreementAgenName != '' && this.dataBase.agreementAgenName != undefined && this.dataBase.agreementAgenName != null) {
            await this.agentInit_Agregent();
            // this.ServesiceService.bookEventer.emit(true);
          } else {
            // this.ServesiceService.bookEventer.emit(false);
          }

          this.showoff = false;
          this.Ckdata = {};
          this.showoff_loading = false;
          this.ngOnInit();
          this.disableValidateForm.emit();
        }

      }, error => {
        this.message.create('error', '请求异常');
      });
    }

  }

  // 加载投标公司数据
  public async agentInit_Bidding() {
    if (this.dataBase.biddingNames != null && this.dataBase.biddingNames !== undefined && this.dataBase.biddingNames !== '') {
      const dealer = await this.selAgent(this.dataBase.biddingNames);
      if (dealer && dealer.length > 0) {
        this.dataBase.biddingComRegAddress = dealer[0].registeredAddress; // 投标公司地址
        if (dealer[0].registeredAddress === '中国' || dealer[0].registeredAddress === '中国香港') {
          this.dataBase.biddingComRegCode = dealer[0].registeredAddress; // 投标公司所在地
        }
        this.dataBase.biddingDdpDate = dealer[0].ddpValidUntil;
      }
    }
  }

  // 加载代理商数据
  public async agentInit_Agregent() {
    if (this.dataBase.agreementAgenName != null && this.dataBase.agreementAgenName !== undefined && this.dataBase.agreementAgenName !== '') {
      const dealer = await this.selAgent(this.dataBase.agreementAgenName);
      if (dealer && dealer.length > 0) {
        this.dataBase.productModels = dealer[0].authorizedProduct;
        this.dataBase.dealerNo = dealer[0].dealerCode;
        this.dataBase.agreementDealerDdpDate = dealer[0].ddpValidUntil;
      }
      this.InitSelAgentAll(dealer);
    }
  }

  // 加载代理商数据
  // agentInit() {
  //   const url = `/act/ecom/bidding/selAgent`;
  //   this.http.post(url, this.param).subscribe(
  //     (res) => {
  //       if (res.code == '0000') {
  //         if (res.data.rows.length > 0) {
  //           this.dataBase.biddingComRegAddress = res.data.rows[0].registeredAddress; // 投标公司地址
  //           if (res.data.rows[0].registeredAddress === '中国' || res.data.rows[0].registeredAddress === '中国香港') {
  //             this.dataBase.biddingComRegCode = res.data.rows[0].registeredAddress; // 投标公司所在地
  //           }
  //           this.dataBase.productModels = res.data.rows[0].authorizedProduct;
  //           this.dataBase.dealerNo = res.data.rows[0].dealerCode;
  //           this.dataBase.biddingDdpDate = res.data.rows[0].ddpValidUntil;
  //         }
  //       }
  //     },
  //       ((error) => {
  //         this.message.create('error', '请求异常!');
  //       })
  //     );
  //   }

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
    }
    this.arr.firstopp = false;
    // this.ServesiceService.bookEventer.emit();清空数据
    this.disableValidateForm.emit();
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
    this.dataBase.dealerNo = null; // 经销商编号
    this.dataBase.distributorAgreement = []; // 经销商协议
    this.dataBase.distributorType = ''; // 协议经销商类型
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
    this.dataBase.clientNo = '';
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
    // 将已经添加的opportunityId禁用 CP
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
            if (e.opportunityId == arr.opportunityId && e.dealFormId == arr.dealFormId) {
              arr.is = true;
            }
          });
        }
      });
    }
    // 将已经添加的opportunityId禁用 CRM
    if (this.arr && this.arr.crmData) {
      for (let i = 0; i < this.arr.crmData.length; i++) {
        this.arr.crmData[i].is = false;
        this.arr.crmData[i].radio = false;
      }
    }
    if (this.productData) {
      this.productData.map( e => {
        if (this.arr && this.arr.crmData) {
          this.arr.crmData.map( arr => {
            arr.radio = false;
            if (e.opportunityId == arr.opportunityId) {
              arr.is = true;
            }
          });
        }
      });
    } else {
    }

    // 第一次才加载
    // if (this.arr.firstopp) {
    //   return;
    // }
    this.arr.firstopp = true;
    this.oppSeach.accountName = this.dataBase.hospitalName;
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
    this.tranf.reset();
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
      const dealFormId = this.productData[index].dealFormId;
      // if (this.OppCkMk && this.OppCkMk[this.showCurr])
      //   this.tranf.checkOptionsOne = [...this.OppCkMk[this.showCurr]];
      // else this.tranf.checkOptionsOne = [];
      this.getProduct(opportunityId, productName, dealFormId);
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
    this.recursion(arr, 'children', 'productInformations');
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
    let index = this.dataBase.productInformations.findIndex(item => (item.opportunityId === this.productData[this.showCurr].opportunityId && item.dealFormId === this.productData[this.showCurr].dealFormId));
    if (index >= 0) {
      this.dataBase.productInformations[index] = this.productData[this.showCurr];
    } else {
      this.dataBase.productInformations.push(this.productData[this.showCurr]);
    }
  }


  // 自动带入产品
  public getProductInsert(opportunityId, dealFormId, CpOrCrm) {
    let url;
    let showCurr;
    // 获取所在下标
    for (let i = 0; i < this.productData.length; i++) {
      if (CpOrCrm === 'CP Deal Form') {
        if (this.productData[i].opportunityId == opportunityId && this.productData[i].dealFormId == dealFormId) {
          showCurr = i;
          break;
        }
      } else {
        if (this.productData[i].opportunityId == opportunityId) {
          showCurr = i;
          break;
        }
      }
    }
    if (CpOrCrm === 'CP Deal Form') {
      url = `/act/ecom/tender/application/tenderQueryMarketBundles`;
    } else {
      url = `/act/ecom/tender/application/tenderQuerySimulation`;
    }
    const params = {
      opportunityId: opportunityId,
      dealFormId: dealFormId
    };
    this.http.post(url, params).subscribe((res) => {
        if (res && res.data) {
          res.data = this.initSimulationData(res.data);
          this.dataBase.dataList = this.setTitleAndKey(res.data);
          // 带入
          // const arr = [...this.tranf.getValue()];
          const arr = [];
          if (this.dataBase.dataList) {
            this.dataBase.dataList.map(r1 => {
              if (r1.children) {
                r1.children.map(r2 => {
                  arr.push(r2);
                });
              }
            });
          }
          this.ishowBundlecp = false;
          this.OppCkMk[showCurr] = arr;
          this.recursion(arr, 'children', 'productInformations');
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
          if (this.productData[showCurr] && this.productData[showCurr].productInformations) {
            this.productData[showCurr].productInformations = this.productData[showCurr].productInformations ? this.productData[showCurr].productInformations : [];
            this.productData[showCurr].productInformations = [...arr, ];
          }
          this.ngOnInit();

          this.tranf.checkOptionsOne = [];
          // 更新数据，穿梭框已选项右移动
          let index = this.dataBase.productInformations.findIndex(item => (item.opportunityId === this.productData[showCurr].opportunityId && item.dealFormId === this.productData[showCurr].dealFormId));
          if (index >= 0) {
            this.dataBase.productInformations[index] = this.productData[showCurr];
          } else {
            this.dataBase.productInformations.push(this.productData[showCurr]);
          }
        } else {
          this.message.create('error', res.msg);
        }
      },
      (error) => {
        // this.firstcp = false;
        this.message.create('error', '请求异常!');
      }
    );
  }
  // 处理Simulation来源数据 id
  // 添加id长度防止穿梭框报错
  public initSimulationData(data) {
    if (data && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        if (data[i].id && data[i].id.length < 7) {
          data[i].id = data[i].id + '-4cb0-413e-a46d-abc4c8ffa473';
        }
        if (data[i].children && data[i].children.length > 0) {
          for (let j = 0; j < data[i].children.length; j++) {
            if (data[i].children[j].id && data[i].children[j].id.length < 7) {
              data[i].children[j].id = data[i].children[j].id + '-4cb0-413e-a46d-abc4c8ffa473';
            }
          }
        }
      }
    }
    return data;
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
    this.getDataCP();
    this.getDataCRM();
  }

  // 搜索框查询
  SeachOpp() {
    this.getDataCP();
    this.getDataCRM();
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
  getProduct(param, productName, dealFormId) {
    // if (this.firstcp) {
    //   return;
    // }
    // this.firstcp = true;
    // /act/preparation/queryMarketBundle
    let url;
    if (this.dataBase.baseDataFrom === 'CP Deal Form') {
      url = `/act/ecom/tender/application/tenderQueryMarketBundles`;
    } else {
      url = `/act/ecom/tender/application/tenderQuerySimulation`;
    }
    const params = {
      opportunityId: param,
      productName: productName,
      dealFormId: dealFormId
    };
    this.http.post(url, params).subscribe(
      (res) => {
        if (res.code == '0000') {
          res.data = this.initSimulationData(res.data);
          this.dataBase.dataList = this.setTitleAndKey(res.data);
          console.log(this.dataBase.dataList);
          console.log(this.dataBase.productInformations);
          // console.log('this.dataBase.dataList',this.dataBase.dataList);
        } else {
          this.message.create('error', res.msg);
        }
      },
      (error) => {
        // this.firstcp = false;
        this.message.create('error', '请求异常!');
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
      data[i].title = 'Simulation Id:' + data[i].simulationId;
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

        if (data[i].children[i2].children) {
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

  // 获取经销商信息
  public async selAgent(dealerName) {
    const url = `/act/ecom/bidding/selAgentList`;
    const params = {
      dealerName: dealerName
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
            authorizedArea: dealList[i].authorizedArea
          };
          this.agreementSelect.push(obj);
        }
      }
    }
  }

}
