import { Component, OnInit, Input, Output, ViewChild, AfterViewInit, EventEmitter } from '@angular/core';
import { FileService, HttpService } from '../../../services';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { formatDatesNow, cheakDate } from '../../../../assets/js/tools';
import { en_US, zh_CN, NzI18nService, NzMessageService } from 'ng-zorro-antd';
import { Router, ActivatedRoute } from '@angular/router';
import { TimeFormatePipeNow } from '../../../pipes/tiem-formatenow.pipe';
import {
  ServesiceService,
} from '../servesice.service';

@Component({
  selector: 'app-applybase',
  templateUrl: './applybase.component.html',
  styleUrls: ['./applybase.component.scss', '../apply-tender.component.scss'],
  providers: [
    TimeFormatePipeNow
  ]
})
export class ApplybaseComponent implements OnInit {
  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private message: NzMessageService,
    public activatedRouter: ActivatedRoute,
    public ServesiceService:ServesiceService
  ) { }
  validateForm: FormGroup;
  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.validateForm.controls.password.value) {
      return { confirm: true, error: true };
    }
    return {};
  };

  OpLoad: any = false;
  // opp查询参数
  public oppSeach: any = {
    opportunityId: '',
    opportunityName: '',
    accountName: '',
    dealFormId: ''
  };

  // @Input() firstopp: any = true;
  // 产品信息
  @Input() productData: any = [];

  // @Input() CkOppo: any = {};
  @Input() arr: any = {
    tabList: [],
    crmData: [],
    firstopp: false,
    //全局选中Opp
    CkOppo: {}
  };

  // Oppo选中参数
  Ckdata: any = {};
  flag: any;
  public param: any = {
    total: 0,
    pageNo: 1,
    pageSize: 5,
    dealerName: ""
  }
  CpOrCrm: any = 'CP';
  public agentData: any = [{
    "radio": true,
    "nameEn": "Foxconn",
    "nameCn": "中国富士康",
    "address": "中国民生大道",
    "authoAddress": "中国民生大道",
    "authoProduct": "ct",
    "authoStart": "2021/04/05",
    "authoOver": "2022/08/09",
  },
  {
    "radio": false,
    "nameEn": "Foxconn",
    "nameCn": "中国富士康",
    "address": "中国民生大道",
    "authoAddress": "中国民生大道",
    "authoProduct": "ct",
    "authoStart": "2021/04/05",
    "authoOver": "2022/08/09",
  },
  {
    "radio": false,
    "nameEn": "Foxconn",
    "nameCn": "中国富士康",
    "address": "中国民生大道",
    "authoAddress": "中国民生大道",
    "authoProduct": "ct",
    "authoStart": "2021/04/05",
    "authoOver": "2022/08/09",
  }
  ];

  public BaseCount=0;
  // @Input()tabList: any = [];
  // @Input()crmData: any = [];
  public selectedValue: any = null;
  agentScend: any = false;
  public agentval: any = "";
  public isshow: any = false; //弹出选择代理商
  public secondLevel: any = 'bidding' //二级招投标;
  public empowerCode: any = 1; //招标授权模式
  public showoff: any = false;//弹出窗口值;
  public startDate: any = "";
  public style: any = { width: '100%' };
  empowerList: any = [{ name: "Bidding 授权", value: "bidding" },
  { name: "Stock  补授权", value: "stock" },
  { name: "Pre-OIT 补授权", value: "preoit" },];
  public biddingAuthorizationModeList: any = [];
  public businessModelList: any = [];
  public provincesSelect: any = 2;
  public provinces: any = [{ name: "北京市", value: "北京市" },
  { name: "上海市", value: "上海市" },
  { name: "河北省", value: "河北省" },
  { name: "天津市", value: "天津市" },
  { name: "山西省", value: "山西省" },
  { name: "内蒙古自治区", value: "内蒙古自治区" },
  { name: "辽宁省", value: "辽宁省" },
  { name: "吉林省", value: "吉林省" },
  { name: "黑龙江省", value: "黑龙江省" },
  { name: "江苏省", value: "江苏省" },
  { name: "浙江省", value: "浙江省" },
  { name: "安徽省", value: "安徽省" },
  { name: "福建省", value: "福建省" },
  { name: "江西省", value: "江西省" },
  { name: "山东省", value: "山东省" },
  { name: "河南省", value: "河南省" },
  { name: "湖北省", value: "湖北省" },
  { name: "湖南省", value: "湖南省" },
  { name: "广东省", value: "广东省" },
  { name: "广西壮族自治区", value: "广西壮族自治区" },
  { name: "海南省", value: "海南省" },
  { name: "重庆市", value: "重庆市" },
  { name: "四川省", value: "四川省" },
  { name: "贵州省", value: "贵州省" },
  { name: "云南省", value: "云南省" },
  { name: "西藏自治区", value: "西藏自治区" },
  { name: "陕西省", value: "陕西省" },
  { name: "甘肃省", value: "甘肃省" },
  { name: "青海省", value: "青海省" },
  { name: "宁夏回族自治区", value: "宁夏回族自治区" },
  { name: "新疆维吾尔自治区", value: "新疆维吾尔自治区" },
  { name: "香港特别行政区", value: "香港特别行政区" },
  { name: "澳门特别行政区", value: "澳门特别行政区" },
  { name: "台湾省", value: "台湾省" },
  ]
  @Input() public name:any=false;
  @Input() public isDisable: any = false;
  @Input() public dataBase: any = {};
  public nextId: string = "complete-tab";
  @Output() myEvent = new EventEmitter()
  ngOnChanges() {
    this.paymentMethod();
    console.log(this.dataBase)
    //清空数据
    // this.ServesiceService.bookEventer.subscribe(res => {
    //      this.validateForm.reset();
    // });
  }
  ngOnInit() {
    this.getBiddingAuthorizationModeList();
    this.getBusinessModelList();
    this.dataBase.biddingManager=this.dataBase.biddingManager?this.dataBase.biddingManager:localStorage.getItem("ng_philips_username");
    this.dataBase.biddingManagerTitle=this.dataBase.biddingManagerTitle?this.dataBase.biddingManagerTitle:localStorage.getItem("roleCode");
    let flag = this.activatedRouter.queryParams['_value'].flag;
    if (flag != undefined && flag != null && flag != '') {
      this.flag = flag;
    }
    else {
      this.flag = 0;
    }

    this.validateForm = this.fb.group({
      applyType: [null, [Validators.required]],
      biddingName: [null, [Validators.required]],
      businessType: [null, [Validators.required]],
      biddingNo: [null, [Validators.required]],
      biddinOrgName: [null, [Validators.required]],
      openBiddingDate: [null, [Validators.required, this.cheakDate]],
      biddingValidDay: [null, [Validators.required, this.cheakNumber]],
      hospitalName: [null, [Validators.required]],
      clientType: [null, [Validators.required]],
      purchaseGroup: [null, null],
      hospitalProvinceCode: [null, [Validators.required]],
      biddingManager: [{ value: '', disabled: true}, [Validators.required]],
      biddingManagerTitle: [{ value: '', disabled: true}, [Validators.required]],
    });
    this.paymentMethod();
  }
  //招标授权模式选择框
  public selectApplyType() {
    this.paymentMethod();
  }
  //支付方式的组合模式
  public paymentMethod() {
    const params = {
      dictGroup: '',
    };
    let applyType = this.dataBase.applyType;
    let clientType = this.dataBase.clientType;
    let tenderPriceCurrencys = this.dataBase.tenderPriceCurrencys;
    let businessType = this.dataBase.businessType;
    if (applyType && clientType && tenderPriceCurrencys && businessType) {
      if (applyType == "BIDDING" && businessType == "DIRECT" && tenderPriceCurrencys == "CNY" && clientType == "公立医院") {
        params.dictGroup = 'BDCG';
        // this.dataBase.paymentDescription="";
      }
      else if (applyType == 'BIDDING' && businessType == 'DIRECT' && tenderPriceCurrencys == 'USD' && clientType == '公立医院') {
        params.dictGroup = 'BDUG';
        // this.dataBase.paymentDescription="";
      }
      else if (applyType == 'BIDDING' && businessType == 'DIRECT' && tenderPriceCurrencys == 'CNY' && clientType == '民营医院') {
        params.dictGroup = 'BDCM';
        // this.dataBase.paymentDescription="";
      }
      else if (applyType == 'BIDDING' && businessType == 'DIRECT' && tenderPriceCurrencys == 'USD' && clientType == '民营医院') {
        params.dictGroup = 'BDUM';
        // this.dataBase.paymentDescription="";
      }
      else if (applyType == 'BIDDING' && businessType == 'DISTRIBUTOR' && tenderPriceCurrencys == 'USD' && clientType == '民营医院') {
        params.dictGroup = 'BDisUM';
        // this.dataBase.paymentDescription="";
      }
      else if (applyType == 'BIDDING' && businessType == 'DISTRIBUTOR' && tenderPriceCurrencys == 'CNY' && clientType == '民营医院') {
        params.dictGroup = 'BDisCM';
        // this.dataBase.paymentDescription="";
      }
      else if (applyType == 'BIDDING' && businessType == 'DISTRIBUTOR' && tenderPriceCurrencys == 'USD' && clientType == '公立医院') {
        params.dictGroup = 'BDisUG';
        // this.dataBase.paymentDescription="";
      }
      else if (applyType == 'BIDDING' && businessType == 'DISTRIBUTOR' && tenderPriceCurrencys == 'CNY' && clientType == '公立医院') {
        params.dictGroup = 'BDisCG';
        // this.dataBase.paymentDescription="";
      }
      else if(applyType == 'BIDDING' && businessType == 'DIRECT' && tenderPriceCurrencys == 'CNY' && clientType == '其他') {
        params.dictGroup = 'BDCQ';
        // this.dataBase.paymentDescription="";
      }
      else if (applyType == 'BIDDING' && businessType == 'DIRECT' && tenderPriceCurrencys == 'USD' && clientType == '其他') {
        params.dictGroup = 'BDUQ';
        // this.dataBase.paymentDescription="";
      }
      else if (applyType == 'BIDDING' && businessType == 'DISTRIBUTOR' && tenderPriceCurrencys == 'CNY' && clientType == '其他') {
        params.dictGroup = 'BDisCQ';
        // this.dataBase.paymentDescription="";
      }
      else if(applyType == 'BIDDING' && businessType == 'DISTRIBUTOR' && tenderPriceCurrencys == 'USD' && clientType == '其他') {
        params.dictGroup = 'BDisUQ';
        // this.dataBase.paymentDescription="";
      }
    }
    if (params.dictGroup != '') {
      this.http.post(`/act/ecom/dictData/queryGroupDictData`, params).subscribe(rest => {
        if (rest.code === '0000') {
          this.dataBase.paymentList = rest.data;
          let result=this.dataBase.paymentList.find(val=>val.dictValue==this.dataBase.paymentDescription);
          if(!result)
          {
            this.dataBase.paymentDescriptions=this.dataBase.paymentDescription;
             this.dataBase.paymentDescription="其他";
          }
        } else {
          this.message.create('error', `${rest.msg}`);
        }
      });
    }
  }

  // 招标授权模式
  public getBiddingAuthorizationModeList() {
    const params = {
      dictGroup: 'AUTHORIZATION_MODE',
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
      if (rest.code === '0000') {
        this.biddingAuthorizationModeList = rest.data;
        if(this.dataBase.applyType == null || this.dataBase.applyType == ''){
          this.dataBase.applyType = 'BIDDING'   //设置默认选中Bidding 授权
        }
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }
  // 业务模式
  public getBusinessModelList() {
    const params = {
      dictGroup: 'BUSINESS_MODEL',
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
      if (rest.code === '0000') {
        this.businessModelList = rest.data;
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }
  // 产品选择框crm
  changModelcrm(index, data) {
    this.Ckdata = data;
    this.CpOrCrm = 'CRM';
    this.arr.tabList.map(res => {
      res.radio = false;
    });
    this.arr.crmData.map(res => {
      res.radio = false;
    });
    // this.crmData[index].radio = true;
    data.radio = true;

  }
  // 产品选择框cp
  changModel(index, data) {
    this.Ckdata = data;
    this.CpOrCrm = 'CP';
    this.arr.tabList.map(res => {
      res.radio = false;
    });
    this.arr.crmData.map(res => {
      res.radio = false;
    });
    // this.tabList[index].radio = true;
    data.radio = true;
  }
  //客户类型
  selectClientType($event) {
    this.paymentMethod();
  }
  //业务模式
  selectModel(state) {
    //this.name=true是修改的状态，BaseCount两次累加后才能进行判断
    // if(this.name&&this.BaseCount>1)
    // {
    //   if(this.dataBase.businessType=='DISTRIBUTOR')
    //   {
    //     this.dataBase.tenderAuthorization="nonprivate";
    //   }
    //   else if(this.dataBase.businessType=='DIRECT')
    //   {
    //     this.dataBase.tenderAuthorization="private";
    //   }
    // }
    // else if(!this.name&&this.BaseCount>0)
    // {
    //     if(this.dataBase.businessType=='DISTRIBUTOR')
    //     {
    //       this.dataBase.tenderAuthorization="nonprivate";
    //     }
    //     else if(this.dataBase.businessType=='DIRECT')
    //     {
    //       this.dataBase.tenderAuthorization="private";
    //     }
    // }
    // this.BaseCount++;
    this.dataBase.businessType = state;
    this.paymentMethod();
  }
  cheakNumber(control: FormControl) { //数字的验证
    let res = /^[0-9]*$/
    const valid = res.test(control.value);
    return valid ? null : { number: true };
  };
  cheakDate(control: FormControl) //验证日期
  {
    if (control.value) {
      let nowData = formatDatesNow(control.value);
      let res = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/
      const valid = res.test(nowData)
      return valid ? null : { dataform: true };
    }
  }
  checkFormData = () => {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    return this.validateForm.valid;
  };
  //上一步
  prev() {
    this.myEvent.emit("pending-tab"); //传参给父组件;
  }
  //下一步
  next() {
    this.myEvent.emit(this.nextId); // 传参给父组件;
  }

  //代理商单选事件
  agentChange(index) {
    this.agentData.map((res, i) => {
      res.radio = index == i ? true : false;
    })
  }
  //弹出窗口id
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
  //弹出选择代理商
  showAgent() {
    this.isshow = true;

  }
  //取消弹窗口
  handleCancel() {
    this.showoff = false;
  }

  //加载代理商数据
  agentInit() {
    const url = `/act/ecom/bidding/selAgent`;
    this.http.post(url, this.param).subscribe((res => {
      if (res.code == '0000') {
        if (res.data.rows.length > 0) {
          this.dataBase.biddingComRegAddress = res.data.rows[0].registeredAddress; // 投标公司地址
          //res.data.rows[0].registeredAddress; // 投标公司所在地
          this.dataBase.productModels = res.data.rows[0].authorizedProduct;
        }
      }
    }),
      ((error) => {
        this.message.create("error", "请求异常!")
      }))
  }
  // 弹出窗口
  // 确认按钮
  handleOk() {
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
        this.message.create('error', `数据来源不一致`);
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
      createdDate: this.Ckdata.createdDate,
      baseDataFrom: this.CpOrCrm,
      dealFormId: this.Ckdata.dealFormId,
      listOfMapData: [],
      productInformations: [
      ],
      productnamelist: [],
      businessOpportunityHierarchyLink : businessOpportunityHierarchyLink_let
    };
    if (this.productData.length > 0) {
      const check = this.productData.some(res => obj.opportunityId === res.opportunityId);
      if (check) {
        this.message.create('warning', '已经存在相同Opportunity ID');
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
    if (this.dataBase.baseDataFrom === 'CRM') {
      let url = '/act/ecom/tender/application/tenderQueryOpportunityProduct' + '?opportunityId=' + this.Ckdata.opportunityId;
      this.http.get(url).subscribe(e => {
        obj.productnamelist = e.data;
      });
    }
    this.productData.push(obj);

    this.arr.CkOppo = this.Ckdata;

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
    // this.dataBase.businessOpportunityHierarchyLink = this.Ckdata.opportunityHierachyLink; // 商家层级链接22
    this.dataBase.tenderPriceCurrency = this.toDecimal2(this.Ckdata.estimatedTenderPrice) ; // 中标金额 ,需判断是否保留两位小数
    this.dataBase.estimatedBidPrice = this.dataBase.tenderPriceCurrency; // 中标金额，保留两位小数
    this.param.dealerName = this.Ckdata.dealerName; // 协议经销商名称
    if (this.param.dealerName != '' && this.param.dealerName != undefined && this.param.dealerName != null) {
      this.agentInit();
      this.ServesiceService.bookEventer.emit(true);
    }
    else{
      this.ServesiceService.bookEventer.emit(false);
    }
    this.dataBase.biddingName = this.Ckdata.opportunityName;
    this.dataBase.biddingNo = this.Ckdata.tenderNo;
    this.dataBase.clientType = this.Ckdata.customerType;
    this.dataBase.businessType = this.Ckdata.businessModel;
    console.log(this.dataBase.baseDataFrom);
    if (this.dataBase.baseDataFrom === 'CRM') {
      this.dataBase.openBiddingDate = this.Ckdata.publicBiddingDate;
      this.dataBase.businessOpportunityHierarchyLink = this.Ckdata.opportunityHierachyLink; // 商家层级链接
      this.dataBase.hospitalName = this.Ckdata.accountName; // 医院名称
    }
    if (this.dataBase.baseDataFrom === 'CP') {
      this.dataBase.openBiddingDate = this.Ckdata.bidDate;
      this.dataBase.businessOpportunityHierarchyLink = this.Ckdata.businessOpportunityHierarchyLink; // 商家层级链接
      this.dataBase.hospitalName = this.Ckdata.hospitalName; // 医院名称
    }
    // if (this.Ckdata.bidFlag == 0) {
    //   this.dataBase.tenderAuthorization = 'private';
    // }
    // if (this.Ckdata.bidFlag == 1) {
    //   this.dataBase.tenderAuthorization = 'nonprivate';
    // }
    this.dataBase.change=false; // 控制投标公司是否清空
    this.showoff = false;
    // 如果投标公司和代理商名称相同  补充页是否二级代理商为否 不相同为是
    this.dataBase.agentBidding = this.dataBase.agreementAgenName == this.dataBase.biddingNames ? "nonagency" : "agency";
    if (this.dataBase.biddingNames == '飞利浦(中国)投资有限公司') {
      this.dataBase.biddingComRegCode = '中国';
      this.dataBase.biddingComRegAddress = '地址1';
    }
    else if (this.dataBase.biddingNames == '飞利浦电子香港有限公司') {
      this.dataBase.biddingComRegCode = '中国香港';
      this.dataBase.biddingComRegAddress = '地址2';
    }
    this.paymentMethod();
    this.Ckdata = {};

  }
  //代理商确认弹出窗口
  agentOk() {
    this.isshow = false;
    let obj = this.agentData.filter(res => {
      if (res.radio) {
        let obj = { name: "", id: "" }
        obj.name = res.opportunityName;
        obj.id = res.opportunityID;
        return obj;
      }
    })
    let len = Object.keys(obj);
    len.length > 0 && (this.agentval = obj[0].nameCn);
  }
  //代理商取消弹出窗口
  agentanyCancel() {
    this.isshow = false;
  }
  private _childTitle: string = '子组件标题';

  //日期转换
  todata(a) {
    // return a !== '' ? a.split('.')[0].replace('T', ' ').replace('-', '/').replace('-', '/') : '';
    return "";
  }


  // 获取Opp数据
  getDataFormOpp() {
    const url = '/act/ecom/tender/application/tenderQueryOpportunityIds';
    const data = {};
    this.OpLoad = true;
    this.http.post(url, data).subscribe(res => {
      if (res.code === '0000') {
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
      }
      this.OpLoad = false;
    }, error => {
      this.message.create('error', '请求异常');
      this.OpLoad = false;
    });
  }

  // 搜索框查询
  SeachOpp() {
    console.log(this.oppSeach);
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
    this.http.post(url, this.oppSeach).subscribe(res => {
      this.OpLoad = false;
      if (res.code === '0000') {
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
    }, error => {
      this.message.create('error', '请求异常');
      this.OpLoad = false;
    });
  }

  // 获取Mk数据
  getDataFromMk() {
    // /act/ecom/bidding/biddingQueryMarketBundle
    const url = '/act/ecom/tender/application/tenderQueryMarketBundles';
    const data = {};
    this.http.post(url, data).subscribe((res => {
      if (res.code === '0000') {
        console.log(res.data);
      } else {
      }
    }),(error=>{
      this.message.create("error","请求异常!");
    }));
  }

  // 数组排序
  arrSort(arr) {
    if (arr) {
      arr.sort(function (a, b) {
        if (a.label < b.label) {
          return -1;
        }
        if (a.label > b.label) {
          return 1;
        }
        return 0;
      });
    }
    return arr;
  }

  // 价格保留两位小数
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
}
