import { Component, EventEmitter, ChangeDetectorRef, Input, OnInit, Output, ViewEncapsulation, SimpleChange, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable, Observer } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../app.service';
import { HttpService } from '../../../services';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
import { getType, upLoadFile, checkPhone, decodeString, standardTime, formatDatesNow, formatDate } from '../../../../assets/js/tools';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { environment } from '../../../../environments/environment';
import {
  codeString, isadopt
} from '../../../../assets/js/tools';
import { differenceInCalendarDays, setHours } from 'date-fns';
import { ServesiceService } from '../servesice.service';
@Component({
  selector: 'app-preOrderBaseInfo',
  templateUrl: './baseInfo.component.html',
  styleUrls: ['./baseInfo.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PreOrderBaseInfoComponent implements OnInit {
  mainid_winList: any = [];
  mainId: any = '';
  /*
  * true禁用
  * */
  public dealList: any = [];//经销商协议号列表
  public bidwinningNotice = "中标通知书/最终用户合同";
  public demandLetter = "场地勘验报告/要货函";
  public otherFile = false; //控制其实备注和复制按钮的显示与否
  public oaDisa = false; //控制div还是长文本框的显示
  public style: any = { width: '100%' };//控制日期控件样式
  public financiaWidth: any = "14";
  @ViewChild('child') child;
  @ViewChild('childs') childs;
  @ViewChild('childDis') childDis;
  @Input() public disa = false;
  // 是否为合同概要表
  @Input() public conTable = false;
  /*
  * 是否显示 合同条款确认
  * */
  @Input() public showChek = false;
  @Input() public edit = false;
  @Input() public defect = [
    { name: "招标文件", show: false },
    { name: "投标文件", show: false },
    { name: "最终用户合同", show: false },
    { name: "项目分析表", show: false },
  ]

  public isPdf: any = false; //打开pdf查看器
  pdfSRC: any;
  public isPrebook: any = false;
  @Input() public dataBase: any = {
    productList: [], // 产品列表
    detail: {
      id: '',
      flag: '0',
      status: '',
    },
    // projectAnalysisTable: [], // 盖章后的项目分析表/上传
  };
  public taskId: any; //获取当前节点的taskid
  dealFormIdinput: any = '';
  // dealform展示列表
  dealformlist: any = [
    // {dealformid: 1, dealformname: '44'},
    // {dealformid: 2, dealformname: '33'}
  ];
  radioValue: any = '';
  // 选中dealform
  ckdealformlist: any = {};

  // 查询框加载
  deal_load: any = false;

  box: any = false;

  @Output() myVerifi = new EventEmitter();
  @Output() public myEvent = new EventEmitter();
  @Output() public updateDataBaseInfo = new EventEmitter<any>();
  @Output() public updateData = new EventEmitter<any>();
  @Output() public updateBase = new EventEmitter<any>();
  public distrbutorOff: any = false; //经销商弹出框
  public isAgre: any = false; //最终用户弹出窗口控制
  public isAgres: any = false; //经销商协议号弹窗口控制
  public prebookOff: any = true;
  public pageParam: any = {    //最终用户的弹出窗口
    total: 0,
    pageNo: 1,
    pageSize: 5,
    customerName: "",
    endUserId: ""
  }
  public pageParamdis: any = {
    total: 0,
    pageNo: 1,
    pageSize: 5,
    agreementNo: "", //协议号
    dealerCode: "", //经销code
    dealerName: "", //经销商名称
    selectName: "", //当前选中
  }
  public pageParams: any = {
    total: 0,
    pageNo: 1,
    pageSize: 5,
    dealFormId: "",
    endUser: "",
    distributor: "",
    marketBundleName: "",
    prebookProductId: "",
    invoiceInformation:"",
    businessModel:"",
  }
  public dealshow: any = { tablehead: [{ name: "授权地区", width: "300px" }, { name: "授权产品", width: "300px" }], data: [] };
  public StockOff: any = true;//最终用户安扭是否禁用
  public distributorOff: any = false; //经销商是否在经销商列表
  public distributorOffPrebook: any = false; //经销商是否与prebook经销商相等
  public foreignTradeOff: any = false;//外贸公司是否在iepool
  public foreignTradeOffPrebook: any = false;//提示外贸易公司不在prebook里边

  public pricevalue: any = { id: "" };
  public paymentOff: any = false;//控制付款条款备注和附件的显示与否
  public today = new Date();
  public laterDay: any;  //经销商
  public lateDays: any; //外贸
  public redFlagList: any //控制redflag的经销商内容
  public redFlagListPool: any //控制redflag的外贸公司内容
  public lateDayOff: any = false; //控制经销商过期显示
  public lateDateOff: any = false; //控制外贸公司过期显示
  public userTeme: any = false; //显示招标文件审核是否必填
  public currId: any;
  public entryMode: any;
  public rowspanht: any = 1;
  public rowspans: any = 2;
  public sampleRow: any = 4;
  public modelTalbe: any = false;
  public load: any = false;
  public selectedValue = '';
  public validateForm: FormGroup;
  public dateFormat = 'yyyy/MM/dd';
  public financialList: any = []; //下拉列表
  public dealFormId = '';
  public distributorList = [];
  public poolList = [];
  public projectAnalysisTableFileList = []; // 盖章后的项目分析表/上传
  public bidWinningNoticeFileList = [];//中标通知书
  public siteReportFileList = []; //场地报告/要货函
  public projectSolutionsFileList = []; //项目解决方案售前支持报告
  public biddingDocumentsFileList = []; //投标文件
  public endUserContractFileList = []; //最终用户
  public paymentProvisionFileNameList = []; //付款条款文件
  public shipmentDeliveryList = [];//装运及交货文件
  public installationWarrantyList = [];//安装，验收及保修文件
  public amountDifferenceList = [];//直投订单合同金额和中标金额有价差
  public sitePreparatList = [];//场地准备
  public performanceBondList = [];//履约保函
  public afterSalesList = [];//是否售后
  public supportFileMissingList = [];//支持文件缺失需特批进单
  public otherFilNameList = [];//其它上传
  public mrShieldingCompanyList = [];//磁共振屏蔽公司
  public confirmationFileFileList = [];//IGT第三方吊塔确认文件
  public tenderDocumentsList = [];//招标文件
  public contractCancelList = []; //原合同概要表列表
  public fileList = [
    // {
    //   uid: 1,
    //   name: 'xxx.png',
    //   status: 'done',
    //   response: 'Server Error 500', // custom error message to show
    //   url: 'http://www.baidu.com/xxx.png'
    // },
  ];

  public condition = false;

  public value: string;

  public alignType = 'center';
  public colSpanOfConfirmTable = 1;//合同条款确认 部分竖跨表格拦数
  public isVisibleCPResult = false;
  public entryModeList = [];
  public entryModeLists = []; //零时存一下
  public businessModelList = [];
  public listOfData = [];
  public other = 'false,false,false,false,false,false,false';
  constructor(
    private appService: AppService,
    private http: HttpService,
    private toastrService: ToastrService,
    private router: Router,
    private modalService: NgbModal,
    private aRoute: ActivatedRoute,
    private message: NzMessageService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    public activatedRouter: ActivatedRoute,
    private ServesiceService: ServesiceService,
    private el: ElementRef
  ) {
    this.mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    this.appService.pageTitle = '主页';
    //this.getDistributorList();
    this.getRateList();
    this.getPoolList();
    //关联支持文件缺失进单
    this.ServesiceService.supportFileMissing.subscribe(res => {
      if (this.dataBase && this.dataBase.productList && this.dataBase.productList.length > 0) {
        const miss = this.dataBase.productList.every(vals => vals.supportFileMissing == '1')
        this.dataBase.supportFileMissing = miss ? '1' : '0';
      }
    })
    //关联进单单位的prebook
    this.ServesiceService.prebook.subscribe(res => {

        if (this.dataBase && this.dataBase.productList && this.dataBase.productList.length > 0) {
          let  prebookMainId= this.dataBase.productList.find(val=>(val.prebookMainId!=null&&val.prebookMainId!=""&&val.prebookMainId!=undefined))
          if (prebookMainId) {
            const prebook = this.dataBase.productList.some(val => val.isPrebookApply == '1')
            this.dataBase.isPrebookApply = prebook ? "1" : "0";
            if (this.dataBase.isPrebookApply == '1') {

              this.setPrebook()

            }
          }
          else{
            this.dataBase.isPrebookApply="0";
          }
        }
        else
        {
          this.dataBase.isPrebookApply="0";
        }
    })
  }
  //经销用户列表
  distributorLoad(val) {
    let params: any = {
      pageNo: 1,
      pageSize: 5,
      dealerName: val, //经销商名称
    }
    return new Promise((resolve, reject) => {
      this.http.post(`/act/preparation/getDealersOnlyWithRegFlag`, params).subscribe((rest => {
        if (rest.code === '0000') {
          let select = rest.data.rows;
          this.distributorOff = select.length > 0 ? false : true;
          if (select.length > 0) {
            this.redFlagList = select[0].reminderMessage != null ? select[0].reminderMessage : "";
            let time = standardTime(select[0].ddpValidUntil);
            this.dataBase.contractEndDate = formatDatesNow(time);
            this.dataBase.ddpStatus = isadopt(time);
          }
          resolve(rest.data)
        }
      }), (error => {
        this.message.create("error", "请求异常")
      }));
    })
  }
  //失去焦点
  distributoBlur() {
    const ASYNS = async () => {
      let distributor = this.dataBase.distributor ? this.dataBase.distributor.replace(/\s+/g, "") : "";
      let select: any = await this.distributorLoad(distributor);
    }
    ASYNS()
    if (this.dataBase.productList && this.dataBase.productList.length > 0) {
      let productList = this.dataBase.productList.find(val=>(val.prebookMainId!=null&&val.prebookMainId!=""&&val.prebookMainId!=undefined))
      if (productList&&productList.prebookMainId) {
        const ASYNS = async () => {
          let data: any = await this.getBase(productList.prebookMainId);
          this.isDistributor(data);
        }
        ASYNS()
      }
    }
    else if (this.dataBase.prebookMainId) {
      const ASYNS = async () => {
        let data = await this.getBase(this.dataBase.prebookMainId)
        this.isDistributor(data);
      }
      ASYNS()
    }
  }

  //弹出经销商
  showDistributor() {
    this.distrbutorOff = true;
    this.childDis.pageParam.selectName = this.dataBase.distributor;
    this.childDis.agentInit();
  }
  //经销商取消按钮
  isDistributorCancel() {
    this.distrbutorOff = false;
  }
  //经销商确定按钮
  isDistributorOk() {
    this.distrbutorOff = false;
    this.dataBase.distributorAddress = ""; //清除经销商地址;
    this.dataBase.distributorContacts = ""; //经销商联系人;
    this.dataBase.distributorPhone = ""; //经销商电话;
    this.dataBase.distributorEmail = "";//经销商邮箱
    this.dataBase.contractEndDate = "";
    let arr = this.childDis.selectFind();
    this.dataBase.distributor = arr[0].dealerName;
    this.dataBase.contractEndDate = standardTime(arr[0].ddpValidUntil);
    this.dataBase.ddpStatus = this.isadopt(this.dataBase.contractEndDate, 1);
    this.dataBase.distributorAddress = arr[0].registeredAddress;
    this.dataBase.distributorContacts = arr[0].conscientiousName;
    this.dataBase.distributorEmail = arr[0].dealerEmail;
    this.dataBase.distributorPhone = arr[0].dealerTelephone;
    this.redFlagList = arr[0].reminderMessage != null ? arr[0].reminderMessage : "";
    this.dataBase.dealerCode = arr[0].dealerCode;
    this.ServesiceService.dealerCode.emit(this.dataBase.dealerCode);
    this.distributorLoad(this.dataBase.distributor)
    if (this.dataBase.productList && this.dataBase.productList.length > 0) {
      let productList = this.dataBase.productList.find(val=>(val.prebookMainId!=null&&val.prebookMainId!=""&&val.prebookMainId!=undefined))
      if (productList&&productList.prebookMainId) {
        const ASYNS = async () => {
          let data: any = await this.getBase(productList.prebookMainId);
          this.isDistributor(data);
        }
        ASYNS()
      }
    }
    else if (this.dataBase.prebookMainId) {
      const ASYNS = async () => {
        let data = await this.getBase(this.dataBase.prebookMainId)
        this.isDistributor(data);
      }
      ASYNS()
    }
  }
  //prebook申请选中事件
  public prebookChange(e) {
    if ((e == '1' && this.dataBase.detail.status == 'DHTGYBTX') || (e == '1' && this.dataBase.detail.status == 'XJDHTGYBTX') || (e == '1' && this.dataBase.detail.status == 'XJDHTGYBTX')) {
      this.validateForm.get('prebookReferenceId')!.setValidators(Validators.required);
    }
    else {
      this.validateForm.get('prebookReferenceId')!.clearValidators();
    }
    this.validateForm.get('prebookReferenceId')!.updateValueAndValidity();
  }
  //弹出选择prebook号
  public showPrebook() {
    this.pageParams.dealformOff = this.dataBase.preBook ? true : false;
    let marketBundleName = this.dataBase.preparationProduct.marketBundleName
    this.pageParams.dealFormId = this.dataBase.dealFormId;
    this.pageParams.endUser = this.dataBase.endUser;
    this.pageParams.distributor = this.dataBase.distributor;
    this.pageParams.marketBundleName = marketBundleName;
    this.pageParams.foreignTradeCompany = this.dataBase.foreignTradeCompany;
    this.pageParam.invoiceInformation=this.dataBase.invoiceInformation;
    this.pageParam.businessModel=this.dataBase.businessModel;
    this.isPrebook = true;
    this.childs.agentInit();
  }
  //取消prebook号
  public isPrebookCancel() {
    this.isPrebook = false;
  }
  //确定选中prebook
  public isPrebookOk() {
    this.isPrebook = false;
    let finds = this.childs.selectFind();
    if (finds.length > 0) {
      this.dataBase.prebookProductId = finds[0].id;
      this.dataBase.prebookReferenceId = finds[0].referenceId;
      this.dataBase.prebookMainId = finds[0].prebookMainId;
      this.setPrebook()
    }
  }
  //集采
  centralizedChange(param) {

    const status = this.dataBase.detail.status;
    if (param && (status == '' || status == 'DHTGYBTX' || status == 'XJDHTGYBTX')) {
      this.validateForm.controls.region.enable();
      this.validateForm.controls.team.enable();
      this.validateForm.controls.smallArea.enable();
      this.validateForm.controls.agreementNo.enable();
      this.validateForm.controls.distributor.enable();
      this.validateForm.controls.ddpStatus.enable();
      this.validateForm.controls.contractEndDate.enable();
    }
    else {
      this.validateForm.controls.region.disable();
      this.validateForm.controls.team.disable();
      this.validateForm.controls.smallArea.disable();
      this.validateForm.controls.agreementNo.disable();
      this.validateForm.controls.distributor.disable();
      this.validateForm.controls.ddpStatus.disable();
      this.validateForm.controls.contractEndDate.disable();
      this.ServesiceService.centralizeds.emit()
    }
  }
  //税率列表
  public getRateList() {
    const params = {
      dictGroup: 'tax_rate',
      listClass: 'rmb',
    };
    return new Promise((resolve, reject) => {
      this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
        if (rest.code === '0000') {
          this.dataBase.rateList = rest.data;
          resolve(rest.data)
          if (this.dataBase.taxrate) {
            let select = this.dataBase.rateList.find(val => val.label == this.dataBase.taxrate)
            !select && this.dataBase.rateList.push({ label: this.dataBase.taxrate });
          }
        } else {
          this.message.create('error', `${rest.msg}`);
        }
      });
    })
  }

  //选择支持条款选择框
  changePayment(state) {

    let applyType = this.dataBase.entryMode;
    let clientType = this.dataBase.hospitalNature;
    let tenderPriceCurrencys = this.dataBase.invoiceInformation;
    let businessType = this.dataBase.businessModel;
    if (applyType == null || applyType == undefined || applyType == '') {
      this.dataBase.paymentList = [];
      this.message.create('error', '请选择进单模式');
      return;
    }
    if (businessType == null || businessType == undefined || businessType == '') {
      this.dataBase.paymentList = [];
      this.message.create('error', '请选择业务模式');
      return;
    }
    if (clientType == null || clientType == undefined || clientType == '') {
      this.dataBase.paymentList = [];
      this.message.create('error', '请选择医院类型');
      return;
    }
    if (tenderPriceCurrencys == null || tenderPriceCurrencys == undefined || tenderPriceCurrencys == '') {
      this.dataBase.paymentList = [];
      this.message.create('error', '请选择币种');
      return;
    }
    if (this.dataBase.paymentList && this.dataBase.paymentList.length > 0) {
      let selectId = this.dataBase.paymentList.find(val => val.dictId == this.dataBase.paymentProvision)
      selectId && (this.paymentOff = selectId.remark == '1' ? true : false);
    }
    else {
      this.paymentOff = false;
    }
  }


  //付款条款列表的组合模式
  public paymentMethod() {

    const params = {
      dictGroup: '',
    };
    let applyTypeoff = false;
    applyTypeoff = this.dataBase.entryMode == 'BIDDING' || this.dataBase.entryMode == 'STOCK' ? true : false;
    let applyType = this.dataBase.entryMode;
    let clientType = this.dataBase.hospitalNature;
    let tenderPriceCurrencys = this.dataBase.invoiceInformation;
    let businessType = this.dataBase.businessModel;
    if (applyTypeoff && clientType && tenderPriceCurrencys && businessType) {
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
      else if (applyType == 'BIDDING' && businessType == 'DIRECT' && tenderPriceCurrencys == 'CNY' && clientType == '其他') {
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
      else if (applyType == 'BIDDING' && businessType == 'DISTRIBUTOR' && tenderPriceCurrencys == 'USD' && clientType == '其他') {
        params.dictGroup = 'BDisUQ';
        // this.dataBase.paymentDescription="";
      }
      else if (applyType == 'STOCK' && businessType == 'DISTRIBUTOR' && tenderPriceCurrencys == 'CNY') {
        params.dictGroup = 'SDisC';
        // this.dataBase.paymentDescription="";
      }
      else if (applyType == 'STOCK' && businessType == 'DISTRIBUTOR' && tenderPriceCurrencys == 'USD') {
        params.dictGroup = 'SDisU';
        // this.dataBase.paymentDescription="";
      }
    }

    if (params.dictGroup != '') {
      this.http.post(`/act/ecom/dictData/queryGroupDictData`, params).subscribe((rest => {

        if (rest.code === '0000') {
          this.dataBase.paymentList = rest.data;
          if (this.dataBase.paymentProvision == '0' || this.dataBase.paymentProvision == '1') {
            let selectId = this.dataBase.paymentList.find(val => val.remark == this.dataBase.paymentProvision);
            this.dataBase.paymentProvision = selectId.dictId
          }
          const ASYNS = async () => {

            if (this.dataBase.paymentmethod) {
              let paymentmethod = this.dataBase.paymentList.find(val => val.dictLabel == this.dataBase.paymentmethod)
              if (paymentmethod) {
                this.dataBase.paymentmethods = paymentmethod.dictId;
              }
            }
            else {
              if (this.edit && this.dataBase.dealFormId) {
                let dealFrom: any;
                dealFrom = await this.GetDealLists(this.dataBase.dealFormId);
                this.dataBase.paymentmethod = dealFrom.paymentMethodDescription;
                let paymentmethod = this.dataBase.paymentList.find(val => val.dictLabel == this.dataBase.paymentmethod)
                if (paymentmethod) {
                  this.dataBase.paymentmethods = paymentmethod.dictId;
                }
              }
            }
            this.ServesiceService.payment.emit(this.dataBase.paymentList)
          }
          ASYNS();

          this.dataBase.paymentOff = true;
          let selectId = this.dataBase.paymentList.find(val => val.dictId == this.dataBase.paymentProvision);
          if (selectId) {
            const status = this.dataBase.detail.status;
            const flag = this.dataBase.detail.flag;
            this.paymentOff = selectId.remark == '1' ? true : false;
            (this.paymentOff && status === 'DHTOASH' && flag == '0') && this.validateForm.controls.paymentProvision.enable();
          }
          else {
            this.paymentOff = false;
            this.dataBase.paymentProvision = "";
          }
        }
      }), (error => {
        this.message.create("error", "请求异常");
      }));
    }
    else {
      this.dataBase.paymentList = null;
      this.dataBase.paymentOff = true;
      this.ServesiceService.payment.emit(this.dataBase.paymentList)
    }
  }
  //打开最终用户选择弹出窗口
  showAgent() {
    this.isAgre = true;
    this.child.pageParam.endUserId = this.dataBase.endUserId;
    this.child.agentInit();
  }
  //取消弹窗
  isAgreCancel() {
    this.isAgre = false;
  }
  //最终用户选择确定
  isAgregentOk() {
    this.isAgre = false;
    let arr = this.child.selectFind();
    this.dataBase.endUser = arr[0].customerName
    this.dataBase.hospitalNature = arr[0].customerType;
    this.dataBase.endUserAddress = arr[0].address;
    this.dataBase.endUserId = arr[0].no;
    this.pageParam.endUserId = arr[0].no;
  }
  // 打开pdf查看器
  public isPdfCancel() {
    this.isPdf = false;
  }
  public changeOthers(value: boolean, num: number): void {
    const arr = this.other.split(',');
    arr.map((item, index) => {
      if (item === 'true') {
        arr[index] = String(true);
      }
      if (item === 'false') {
        arr[index] = String(false);
      }
    });

    arr[num] = String(value);
    this.other = arr.toString();
    this.dataBase.other = arr.toString();
    this.otherFile = arr.some(res => res === 'true') //控制备注、复制按钮的显示与否;

    // if(value==false&&num==6)
    // {
    //     this.dataBase.otherRemarks="";
    //     this.dataBase.otherFilName="";
    //     this.dataBase.freeText="";
    //     this.otherFilNameList=[];
    // }
  }


  //非标提示"审核按钮"
  Tips() {

    if (this.taskId == 'paymentProvision' && this.paymentOff && this.dataBase.detail.flag == '0') {
      return true;
    }
    else if (this.taskId == 'performanceBond' && this.dataBase.performanceBond == '1' && this.dataBase.detail.flag == '0') {
      return true;
    }
    else if (this.taskId == 'sitePreparation' && this.dataBase.sitePreparation == '1' && this.dataBase.detail.flag == '0') {
      return true;
    }
    else if (this.taskId == 'installationWarranty' && this.dataBase.installationWarranty == '1' && this.dataBase.detail.flag == '0') {
      return true;
    }
    else if (this.taskId == 'shipmentDelivery' && this.dataBase.shipmentDelivery == '1' && this.dataBase.detail.flag == '0') {
      return true;
    }
    else {
      return false;
    }

  }
  //特批提示"审核按钮"
  Tipsecond() {
    if (((this.taskId == 'TPWJJDCS' || this.taskId == 'TPWJJDSH' || this.taskId == 'TPWJJDZS') && this.dataBase.supportFileMissing == 1) || ((this.taskId == 'TPWJJDCS' || this.taskId == 'TPWJJDSH' || this.taskId == 'TPWJJDZS') && this.dataBase.amountDifference == 1) && this.dataBase.detail.flag == '0') {
      return true;
    }
    else {
      return false;
    }
  }
  //金融方案
  selectFinacial() {
    if (this.dataBase.financialProgramme == "2") {
      this.financiaWidth = "7"
    }
    else {
      this.financiaWidth = "14"
    }
    if (this.financialList.length > 0) {
      let select = this.financialList.find(val => val.code == this.dataBase.financialProgramme);
      this.dataBase.financialProgrammeTitle = select ? select.label : "无";
    }
    else {
      this.dataBase.financialProgrammeTitle = "无";
    }
  }
  public generateAnalysisTemplate(code) {
    const today = new Date();
    const params = {
      templateCode: code,
      dateYear: today.getFullYear(),
      dateMonth: (today.getMonth() + 1),
      dateDay: today.getDate(),
      date: today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate(),
      data1: today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate(),
      endUser: this.dataBase.endUser ? this.dataBase.endUser : "",
      tenderNo: this.dataBase.tenderNo ? this.dataBase.tenderNo : "",
      tenderingCompany: this.dataBase.tenderingCompany ? this.dataBase.tenderingCompany : "",
      dealFormId: this.dataBase.dealFormId
    };
    this.pdfSRC = params;
    if (this.dataBase.dealFormId == "" || this.dataBase.dealFormId == null || this.dataBase.dealFormId == undefined) {
      this.message.create("error", "请先查询dealFormId")
      return
    }
    if (this.dataBase.tenderNo == "" || this.dataBase.tenderNo == undefined || this.dataBase.tenderNo == null) {
      this.message.create("error", "招标编号为空");
      return
    }
    if (this.dataBase.tenderingCompany == "" || this.dataBase.tenderingCompany == undefined || this.dataBase.tenderingCompany == null) {
      this.message.create("warning", "投标公司为空");

    }
    this.isPdf = true;

  }

  /**
   * filist 在线显示的文件 file上传的文件 fileId绑定的上传文件的id
   */
  public upload(fileList, file, fileId) {

    this[fileList] = [];
    const type = getType(file);
    this[fileList].push(file);
    const formData = new FormData();
    // tslint:disable-next-line:no-shadowed-variable
    this[fileList].forEach((file: any) => {
      formData.append('file', file);
      formData.append('fileType', type);
      formData.append('filename', file.name);
    });
    this.load = true;
    // var urlPath = window.document.location.href;
    // var docPath = window.document.location.pathname;
    // var index = urlPath.indexOf('#');
    // var serverPath = urlPath.substring(0, index);
    // // pdfPreview
    // const url = `${serverPath}act/system/upload`;
    // let xhr=new XMLHttpRequest();
    // let upload=xhr.upload;
    // upload.onprogress=function(ev)
    // {

    //   console.log('总进度:'+ev.total,"当前进度:"+ev.loaded)
    // }
    // xhr.open("post",url,true);
    // xhr.send(formData);
    //   xhr.onload=()=> {
    //     alert("上传完成!");
    //     this.load=false;
    // };
    const url = '/act/system/upload';
    this.http.posts(url, formData).subscribe((res => {
      if (res.code === '0000') {
        this.load = false;
        this[fileList][0].fileId = res.data;
        this.dataBase[fileId] = res.data;
        this.message.create('success', res.msg);
      } else {
        this.message.create('error', res.msg);
      }
    }), (error => {
      this.load = false;
      this[fileList] = [];
      this.message.create("error", "上传失败请重新上传!")
    }));
  }
  //表格行
  public setColSpanOfConfirmTable(database?: any): void {
    try {
      this.colSpanOfConfirmTable = 1
      let NewDatabase = database ? database : this.dataBase;
      if (NewDatabase.sampleAuditFlag && NewDatabase.sampleAuditFlag.toString() == '1') {
        this.colSpanOfConfirmTable++
      }
    } catch (e) { }
    this.selectModelFile();
  }
  // 文件下载
  public fileDwon(id) {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf('#');
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${id}`;
    window.open(url, '_blank');
  }
  // 上传文件下载
  public dwonLoad = (file: UploadFile): void => {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf('#');
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${file.fileId}`;
    window.open(url, '_blank');
  }
  //其它附件上传
  public otherFilNameBeforeUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    this.upload('otherFilNameList', file, 'otherFilName');
    return false;
  }
  //支持文件缺失需特批进单
  public supportFileMissingBeforeUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    this.upload('supportFileMissingList', file, 'supportFileMissingFileName');
    return false;
  }
  //是否售后
  public afterSalesBeforeUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    this.upload('afterSalesList', file, 'afterSalesFileName');
    return false;
  }
  //履约保函
  public performanceBondBeforeUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    this.upload('performanceBondList', file, 'performanceBondFileName');
    return false;
  }

  //场地准备
  public sitePreparationBeforeUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    this.upload('sitePreparatList', file, 'sitePreparationFileName');
    return false;
  }
  //直投订单合同金额和中标金额有价差
  public amountDifferenceBeforeUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    this.upload('amountDifferenceList', file, 'amountDifferenceFileName');
    return false;
  }
  //安装及验收保修文件
  public installationWarrantyBeforeUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    this.upload('installationWarrantyList', file, 'installationWarrantyFileName');
    return false;
  }
  //装运及交货上传
  public shipmentDeliveryBeforeUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    this.upload('shipmentDeliveryList', file, 'shipmentDeliveryFileName');
    return false;
  }
  //付款条款文件上传
  public paymentProvisionBeforeUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    this.upload('paymentProvisionFileNameList', file, 'paymentProvisionFileName');
    return false;
  }
  // 上传盖章后的投标申请函
  public projectAnalysisTableBeforeUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    this.upload('projectAnalysisTableFileList', file, 'projectAnalysisTable');
    return false;
  }
  //上传中标通知书
  public bidWinningNoticeBeforeUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    this.upload('bidWinningNoticeFileList', file, 'bidWinningNotice');
    return false;
  }
  //上传场地报告/要货函
  public siteReportNoticeBeforeUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    this.upload('siteReportFileList', file, 'siteReport');
    return false;
  }
  //上传项目解决方案售前支持报告
  public projectSolutionsBeforeUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    this.upload('projectSolutionsFileList', file, 'projectSolutions');
    return false;
  }
  //磁共振文件上传
  public mrShieldingCompanyUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    const upLoadFiles = upLoadFile.bind(this);
    upLoadFiles('mrShieldingCompanyList', file, 'mrShieldingCompany');
    return false;
  }
  //IGT塔吊上传
  public confirmationFileUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    const upLoadFiles = upLoadFile.bind(this);
    upLoadFiles('confirmationFileFileList', file, 'confirmationFile');
    return false;
  }
  //投标文件上传
  public tenderDocumentsBeforeUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    this.upload('tenderDocumentsList', file, 'tenderDocuments');
    return false;
  }
  //招标文件上传
  public biddingDocumentsBeforeUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    this.upload('biddingDocumentsFileList', file, 'biddingDocuments');
    return false;
  }
  //最终用户上传
  public endUserContractBeforeUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    this.upload('endUserContractFileList', file, 'endUserContract');
    return false;
  }
  /**
   * @param   data 回显数据
   * @param   fileList 回显数组
   */
  viewData(data, fileList, name?: any) {
    const bidWinningNotice = this.dataBase[data];
    if (bidWinningNotice != "" && bidWinningNotice != undefined && bidWinningNotice != null) {

      this[fileList] = [];
      let obj = { uid: "", name: "", fileId: "" }
      obj.uid = this.dataBase[data];
      obj.fileId = this.dataBase[data];
      obj.name = name ? name : "下载文件"
      this[fileList].push(obj);
    }
  }

  //获取产品信息
  getProduct(e) {
    const url = `/act/preparation/queryMarketBundle?dealFormID=` + e;
    const params = {
      dealFormID: e,
    };
    if (params.dealFormID !== "" && params.dealFormID !== null && params.dealFormID !== undefined) {
      return new Promise((resolve, reject) => {
        this.http.get(url).subscribe((res => {
          if (res.code == '0000') {
            resolve(true);
            // this.dataBase.dataList=res.data.children;
            let { children } = res.data;
            this.dataBase.productList = [];
            this.dataBase.count = 0;
            this.myVerifi.emit(true);
            // simulation id
            //let simulationIdSList = [];
            children.map(vals => {
              vals.title = vals.simulationId;
              vals.key = vals.id;
              vals.level = 1;
              vals.children.map(val => {
                this.dataBase.count++;
                val.title = val.marketBundleName;
                val.key = val.id;
                val.level = 2;
                // simulationIdSList.push(val.dealFormMarketBundleId);
                // simulationIdSList.push(val.simulationIdS);
                val.children.map(item => {
                  item.title = item.productName;
                  item.key = item.id;
                  item.level = 3;
                  item.disableCheckbox = true; //第三层禁用
                  item.isLeaf = true;
                });
              });
            });
            this.dataBase.dataList = children;
            // this.dataBase=Object.assign({},this.dataBase)
            this.updateData.emit(this.dataBase);
            this.isVisibleCPResult = false;
          }
          else {
            this.message.create("error", res.msg);
          }
        }), (error => {
          this.message.create("error", "请求异常")
        }));
      })
    }
    else {
      this.message.create("error", "请填写dealFormId");
    }

  }
  //根据dealFromId查询新的数据
  public getPrebook(id) {
    let url = `/act/prebook/queryPreBook?dealFormId=${id}`
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe(res => {
        if (res.code == '0000' && res.data) {
          let { data } = res;
          if (data.length > 0) {
            let preBook = data.find(val => val.taskStatus == "prebook_end");
            if (preBook) {
              this.dataBase.preBook = { ...preBook };
            }
            else {
              this.dataBase.preBook = null;
            }
          }
          else {
            this.dataBase.preBook = null;
          }
          resolve(data);
        }
      })
    })
  }
  //将prebook值赋给进单
  public setPrebook() {

    if (this.dataBase.productList && this.dataBase.productList.length > 0) {
      let productList = this.dataBase.productList.find(val=>(val.prebookMainId!=null&&val.prebookMainId!=""&&val.prebookMainId!=undefined))
      if (productList&&productList.prebookMainId) {
        const ASYNS = async () => {
          let data: any = await this.getBase(productList.prebookMainId);
          this.setDatabase(data)
          this.isDistributor(data);
          this.isForeign(data);
          await this.getPoolList();
        }
        ASYNS()
      }
    }
    else if (this.dataBase.prebookMainId) {
      const ASYNS = async () => {
        let data = await this.getBase(this.dataBase.prebookMainId);
        this.setDatabase(data);
        this.isDistributor(data);
        this.isForeign(data);
        await this.getPoolList();
      }
      ASYNS()
    }
  }

  setDatabase(data) {

    if (this.dataBase.businessModel == 'DISTRIBUTOR') {
      this.dataBase.distributor = data.distributor;
      this.dataBase.ddpStatus = data.ddpStatus;
      this.dataBase.contractEndDate = data.contractEndDate;
      this.dataBase.distributorAddress = data.distributorAddress;
      this.dataBase.distributorContacts = data.distributorContacts;
      this.dataBase.distributorPhone = data.distributorPhone;
      this.dataBase.distributorEmail = data.distributorEmail;
      this.dataBase.orderSignName = data.orderSignName;
      this.dataBase.orderSignPost = data.orderSignPost;
    }
    if (this.dataBase.invoiceInformation === 'USD') {
      this.dataBase.foreignTradeCompany = data.foreignTradeCompany
      this.dataBase.foreignTradeCompanyAddress = data.foreignTradeCompanyAddress //外贸公司
      this.dataBase.foreignTradeCompanyContacts = data.foreignTradeCompanyContacts; //外贸公司联系人
      this.dataBase.contractDdpStatus = data.contractDdpStatus;
      this.dataBase.poolEndDate = data.poolEndDate;
      this.dataBase.importAgreementSignName = data.importAgreementSignName;
      this.dataBase.importAgreementSignPost = data.importAgreementSignPost;
      this.dataBase.foreignTradeCompanyPhone = data.foreignTradeCompanyPhone;
      this.dataBase.foreignTradeCompanyEmail = data.foreignTradeCompanyEmail;
    }
    this.dataBase.endUser = data.endUser;
    this.dataBase.endUserId = data.endUserId;
    this.dataBase.hospitalNature = data.hospitalNature;
    this.dataBase.endUserAddress = data.endUserAddress;
    this.dataBase.endUserContacts = data.endUserContacts;
    this.dataBase.endUserPhone = data.endUserPhone;
    this.dataBase.endUserEmail = data.endUserEmail;
  }

  public getCPDetails() {
    // 进单准备表-查询CP审核结果
    return new Promise((resolve, reject) => {
      this.http.post(`/act/preparation/queryCpReview`, {
        dealFormID: this.dataBase.dealFormId,
      }).subscribe(rest => {
        if (rest.code === '0000') {
          resolve(true)
          let { cosOppDealForm } = rest.data;
          const { dealer } = rest.data;
          if (cosOppDealForm != null && cosOppDealForm != undefined && cosOppDealForm != "") {
            this.dataBase.businessModel = cosOppDealForm.businessModel; //业务模式;
            this.dataBase.region = cosOppDealForm.region; //大区区域
            this.dataBase.smallArea = cosOppDealForm.residentialQuarters;//小区区域
            this.dataBase.tenderNo = cosOppDealForm.tenderNo;//招标编号
            this.dataBase.tenderingCompany = cosOppDealForm.biddingCompanyName; //投标公司
            this.dataBase.distributor = cosOppDealForm.dealerName; //经销商
            if (dealer) {
              this.dataBase.ddpStatus = dealer.ddpStatus //ddp状态
              this.dataBase.distributorAddress = dealer.registeredAddress; //经销商地址
              this.dataBase.distributorPhone = dealer.dealerTelephone; //经销商电话
              this.dataBase.distributorEmail = dealer.dealerEmail; //邮箱地址
              this.dataBase.billingInfor = dealer.vatBillingInfo; //开票信息
            }
            this.dataBase.contractBuyerAddress = cosOppDealForm.registeredAddress; //合同买方地址
            this.dataBase.contractBuyerEmail = cosOppDealForm.dealerEmail; //合同邮箱
            this.dataBase.endUser = cosOppDealForm.hospitalName; //最终用户
            this.dataBase.endUsers = cosOppDealForm.hospitalNames; //最终用户原名
            this.dataBase.hospitalNature = cosOppDealForm.customerType; //医院性质
            this.dataBase.endUserAddress = cosOppDealForm.endUserAddress; //最终用户地址
            this.dataBase.endUserPhone = cosOppDealForm.endUserPhone; //最终用户电话
            this.dataBase.invoiceInformation = cosOppDealForm.currencySystem //币制
            this.dataBase.sampleAuditFlag = cosOppDealForm.samplingInspection //是否抽样审核
            this.dataBase.sonfonFile = rest.data.sonfonFile;
            //this.dataBase = Object.assign(this.dataBase, rest.data);
            if (this.dataBase.businessModel === 'DIRECT' && this.dataBase.invoiceInformation == 'CNY') {
              this.dataBase.contractBuyer = this.dataBase.endUser;
              this.dataBase.contractBuyerAddress = this.dataBase.endUserAddress;
              this.dataBase.contractBuyerContacts = this.dataBase.endUserContacts;
              this.dataBase.contractBuyerPhone = this.dataBase.endUserPhone;
              this.dataBase.contractBuyerEmail = this.dataBase.endUserEmail;

              this.validateForm.controls.contractBuyer2.disable();
            }
            else if (this.dataBase.businessModel === 'DISTRIBUTOR' && this.dataBase.invoiceInformation == 'CNY') {
              this.dataBase.contractBuyer = this.dataBase.distributor;
              this.dataBase.contractBuyerAddress = this.dataBase.distributorAddress;
              this.dataBase.contractBuyerContacts = this.dataBase.distributorContacts;
              this.dataBase.contractBuyerPhone = this.dataBase.distributorPhone;
              this.dataBase.contractBuyerEmail = this.dataBase.distributorEmail;

              this.validateForm.controls.contractBuyer2.disable();
            }
            this.updateData.emit(this.dataBase)
            this.setColSpanOfConfirmTable();
          }
          else {
            this.message.create("warning", "没有数据")
          }
        } else {
          this.message.create('error', `${rest.msg}`);
        }
      });
    });
  }
  //币值的选择
  selectInvoice($event) {
    this.ifForeignTradeCompany();
    if (this.dataBase.invoiceInformation == 'CNY') {

      this.validateForm.controls.contractBuyer2.disable();
    }
    else {

      this.validateForm.controls.contractBuyer2.enable();
    }
  }
  //外贸公司联动
  foreignup() {

    const foreignTradeCompany = this.dataBase.foreignTradeCompany ? this.dataBase.foreignTradeCompany.replace(/\s+/g, "") : "";
    const distributors = this.dataBase.distributor ? this.dataBase.distributor.replace(/\s+/g, "") : "";
    const contractBuyer2 = this.poolList.find(val => val.corporateName.replace(/\s+/g, "") == foreignTradeCompany);
    let select = this.poolList.find(vals => vals.corporateName.replace(/\s+/g, "") == foreignTradeCompany);
    let data: any
    const ASYNS = async () => {
      if (this.dataBase.productList && this.dataBase.productList.length > 0) {
        let productList = this.dataBase.productList.find(val=>(val.prebookMainId!=null&&val.prebookMainId!=""&&val.prebookMainId!=undefined))
        if(productList&&productList.prebookMainId)
        {
          data = await this.getBase(productList.prebookMainId);
        }
      }
      else if (this.dataBase.prebookMainId) {
        data = await this.getBase(this.dataBase.prebookMainId);
      }
      this.isForeign(data);
    }
    ASYNS()
    if (!contractBuyer2) {
      this.dataBase.contractBuyer2 = null;
      //如果外贸易公司与经销商相等
      if(this.dataBase.contractBuyer2==null&&this.dataBase.sameFlag=='1')
      {
        this.dataBase.foreignTradeCompany = this.dataBase.distributor;
        this.dataBase.contractDdpStatus = this.dataBase.ddpStatus;
        this.dataBase.poolEndDate = this.dataBase.contractEndDate;
        this.dataBase.foreignTradeCompanyAddress = this.dataBase.distributorAddress;
        this.dataBase.foreignTradeCompanyContacts = this.dataBase.distributorContacts;
        this.dataBase.foreignTradeCompanyPhone = this.dataBase.distributorPhone;
        this.dataBase.foreignTradeCompanyEmail = this.dataBase.distributorEmail;
        this.dataBase.importAgreementSignName = this.dataBase.orderSignName;
        this.dataBase.importAgreementSignPost = this.dataBase.orderSignPost;
      }
      this.validateForm.controls.contractBuyer2.clearAsyncValidators();
      if ((this.dataBase.detail.status == '' || this.dataBase.detail.status == 'XJDHTGYBTX' || this.dataBase.detail.status == 'DHTGYBTX') && this.dataBase.detail.flag == '0') {
        // this.validateForm.controls.contractDdpStatus.enable();
        this.validateForm.controls.poolEndDate.enable();
      }
    }
    else {
     // this.dataBase.contractBuyer2 = contractBuyer2.corporateName;
      this.dataBase.poolEndDate = standardTime(contractBuyer2.ddpValidUntil);

      this.dataBase.contractDdpStatus = this.isadopt(this.dataBase.poolEndDate, 2);
      // this.validateForm.controls.contractDdpStatus.disable();
      this.validateForm.controls.poolEndDate.disable();
    }
    this.foreignTradeOff = foreignTradeCompany != distributors ? (select ? false : true) : false;
  }

  //经销商协议号列表
  public dealerCodeList() {
    let dealerCode = this.dataBase.dealerCode;
    if (dealerCode && this.dataBase.businessModel == 'DISTRIBUTOR') {
      let url = `/act/preparation/chooseDealer?dealerCode=${dealerCode}`;
      this.http.get(url).subscribe(rest => {
        this.dealList = rest.data;
        let dealerAgreementNo = this.dataBase.agreementNo;
        let select = this.dealList.find(val => dealerAgreementNo == val.agreementNo);
        // !select && (this.dataBase.agreementNo = null);
      })
    }
  }
  //选择经销商1
  // public changeDistributor() {
  //   //this.getDistributorList();
  //   this.dataBase.distributor = this.dataBase.distributor1 ? this.dataBase.distributor1 : this.dataBase.distributor;
  //   if (this.distributorList && this.distributorList.length > 0) {
  //     let select = this.distributorList.find((val) => this.dataBase.distributor1 == val.dealerName);
  //     if (select) {
  //       this.dataBase.distributorAddress = ""; //清除经销商地址;
  //       this.dataBase.distributorContacts = ""; //经销商联系人;
  //       this.dataBase.distributorPhone = ""; //经销商电话;
  //       this.dataBase.distributorEmail = "";//经销商邮箱
  //       this.dataBase.contractEndDate = "";
  //       this.dataBase.distributorEmail = select.dealerEmail;
  //       this.dataBase.distributorPhone = select.dealerTelephone;
  //       this.dataBase.distributorAddress = select.registeredAddress;
  //       this.dataBase.contractEndDate = standardTime(select.ddpValidUntil);
  //       this.dataBase.ddpStatus = this.isadopt(this.dataBase.contractEndDate, 1);
  //       this.dataBase.dealerCode = select.dealerCode; //经销商code;
  //       this.ServesiceService.dealerCode.emit(this.dataBase.dealerCode)
  //     }
  //   }
  //   this.cd.detectChanges();
  //   if (this.dataBase.businessModel === 'DISTRIBUTOR' && this.dataBase.invoiceInformation === 'CNY') {
  //     this.validateForm.controls.contractBuyer2.disable();
  //   }
  //   const ASYNS = async () => {
  //     let data;
  //     if (this.dataBase.productList && this.dataBase.productList.length > 0) {
  //       let productList = this.dataBase.productList.find(val=>(val.prebookMainId!=null&&val.prebookMainId!=""&&val.prebookMainId!=undefined))
  //       if (productList.prebookMainId) {
  //         data = await this.getBase(productList.prebookMainId);
  //       }
  //     }
  //     else if (this.dataBase.prebookMainId) {
  //       data = await this.getBase(this.dataBase.prebookMainId);
  //     }
  //     this.isDistributor(data);
  //     this.dealerCodeList();
  //   }
  //   ASYNS()
  // }
  //经销商与prebook是否相等
  isDistributor(data) {

    if (this.dataBase.isPrebookApply == '1') {
      const distributor = this.dataBase.distributor;
      const distributorPrebook = data.distributor;
      this.distributorOffPrebook = distributor == distributorPrebook ? false : true;
    }
  }

  //查询prebook
  getBase(mainId) {
    const url = `/act/prebook/getPreBookInformation?mainId=${mainId}`;
    // 获取基础信息数据
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe(res => {
        if (res.code === '0000') {
          if (res.data) {

            resolve(res.data);
          }
        }
      });
    })
  }
  //限制今天之前的日期不能选中
  disabledDate = (current: Date): boolean => differenceInCalendarDays(current, this.today) < 0;
  changeDate() {
    this.dataBase.contractDdpStatus = this.isadopt(this.dataBase.poolEndDate, 2);
  }

  //判断ddpstatus是否通过
  isadopt(param, number) {

    if (param) {
      let endDates = new Date(param);
      let year = endDates.getFullYear();
      let month = endDates.getMonth() + 1;
      let day = endDates.getDate();
      let overdue = `${year}-${month}-${day}`;
      let overDate = new Date(overdue).setHours(0, 0, 0, 0);
      let endDate = new Date(overDate).getTime();
      let nowDate = new Date(new Date().setHours(0, 0, 0, 0)).getTime()
      let iRemain: any = (endDate - nowDate) / 1000;
      iRemain = iRemain / 86400;
      iRemain = parseInt(iRemain) + 1;
      number == 1 && (this.lateDayOff = iRemain <= 7 ? true : false);
      number == 2 && (this.lateDateOff = iRemain <= 7 ? true : false);
      number == 1 && (this.laterDay = iRemain);
      number == 2 && (this.lateDays = iRemain);
      if (iRemain >= 1) {
        return "通过";
      }
      else {
        return "不通过";
      }
    }
    else {
      return null
    }
  }
  //选择经销商1
  // public changeAgentCnName1(value) {
  //   this.dataBase.contractBuyer1 = value;
  //   this.dataBase.contractBuyer = this.dataBase.contractBuyer1;
  //   if (this.distributorList && this.distributorList.length > 0) {
  //     let select = this.distributorList.find((val) => value == val.dealerName);
  //     this.dataBase.contractBuyerEmail = select.dealerEmail;
  //     this.dataBase.contractBuyerPhone = select.dealerTelephone;
  //     this.dataBase.contractBuyerAddress = select.registeredAddress;
  //     this.dataBase.contractDdpStatus = select.ddpStatus;
  //   }
  // }
  //选择iepool
  public changeAgentCnName(event) {
    //this.dataBase.contractBuyer2=event;
    this.getPoolList();
    if (this.poolList && this.poolList.length > 0) {
      let select = this.poolList.find((val) => this.dataBase.contractBuyer2 == val.corporateName);
      if (select&&event!=this.dataBase.foreignTradeCompany) {
        this.dataBase.foreignTradeCompanyAddress = "";
        this.dataBase.foreignTradeCompanyContacts = "";
        this.dataBase.foreignTradeCompanyPhone = "";
        this.dataBase.foreignTradeCompanyEmail = "";
        this.dataBase.poolEndDate = "";
      }
      this.dataBase.foreignTradeCompany = this.dataBase.contractBuyer2 ? this.dataBase.contractBuyer2 : this.dataBase.foreignTradeCompany;
      !this.dataBase.foreignTradeCompanyAddress&&(this.dataBase.foreignTradeCompanyAddress = select && select.corporateAddress ? select.corporateAddress : "");
      !this.dataBase.poolEndDate&&(this.dataBase.poolEndDate = select && select.ddpValidUntil ? standardTime(select.ddpValidUntil) : "");
      !this.dataBase.contractDdpStatus&&(this.dataBase.contractDdpStatus = this.isadopt(this.dataBase.poolEndDate, 2));
      //外贸公司与prebook申请的外贸公司是否相等
      let data: any;
      const ASYNS = async () => {
        if (this.dataBase.productList && this.dataBase.productList.length > 0) {
          let productList = this.dataBase.productList.find(val=>(val.prebookMainId!=null&&val.prebookMainId!=""&&val.prebookMainId!=undefined))
         if(productList&&productList.prebookMainId)
         {
          data = await this.getBase(productList.prebookMainId);
          this.isForeign(data);
          this.foreignup();//是否禁用ddp-status
         }
        }
        else if (this.dataBase.prebookMainId) {
          data = await this.getBase(this.dataBase.prebookMainId);
          this.isForeign(data);
          this.foreignup();//是否禁用ddp-status
        }
      }
      ASYNS()
    }
  }
  //外贸公司与prebook申请的外贸公司是否相等
  public isForeign(data) {

    if (this.dataBase.isPrebookApply == '1') {
      const foreignTradeCompany = this.dataBase.foreignTradeCompany;
      const foreignTradeCompanyprebook = data.foreignTradeCompany;
      this.foreignTradeOffPrebook = foreignTradeCompany == foreignTradeCompanyprebook ? false : true;
    }
  }

  public getPoolList() {
    // 进单准备表-IE Pool选择
    return new Promise((resolve, reject) => {
      this.http.get(`/act/preparation/chooseIePool`).subscribe((rest => {
        if (rest.code === '0000') {

          this.poolList = rest.data;
          if (this.dataBase.invoiceInformation == 'USD') {
            const foreignTradeCompany = this.dataBase.foreignTradeCompany ? this.dataBase.foreignTradeCompany.replace(/\s+/g, "") : "";
            const distributors = this.dataBase.distributor ? this.dataBase.distributor.replace(/\s+/g, "") : "";
            let select = this.poolList.find(vals => vals.corporateName.replace(/\s+/g, "") == foreignTradeCompany);
            if (this.dataBase.foreignTradeCompany) {
              this.foreignTradeOff = foreignTradeCompany != distributors ? (select ? false : true) : false;
            }
            else {
              this.foreignTradeOff = false;
            }
            if (select && select.reminderMessage) {
              this.redFlagListPool = select.reminderMessage;
            }
            else {
              this.redFlagListPool = "";
            }
            this.foreignup();
          }
        } else {
          //this.message.create('error', `${rest.msg}`);
        }
        resolve(rest.data)
      }), (error => {
        this.message.create("error", "请求异常")
      }));
    })
  }

  public checkFormData = () => {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    return this.validateForm.valid;
  }
  // 业务模式
  public ngModelChang() {

    this.selectModelFile();
    this.ifBusinessModel();

    if (this.dataBase.businessModel === 'DIRECT' && (this.dataBase.entryMode == 'STOCK')) {
      this.dataBase.entryMode = null;
    }
    if (this.dataBase.businessModel === 'DIRECT') {
      this.dataBase.contractBuyer = this.dataBase.endUser;
      this.dataBase.contractBuyerAddress = this.dataBase.endUserAddress;
      this.dataBase.contractBuyerContacts = this.dataBase.endUserContacts;
      this.dataBase.contractBuyerPhone = this.dataBase.endUserPhone;
      this.dataBase.contractBuyerEmail = this.dataBase.endUserEmail;
    }
    if (this.dataBase.businessModel === 'DIRECT' && this.dataBase.invoiceInformation === 'CNY') {
      // this.dataBase.contractBuyer = this.dataBase.endUser;
      // this.dataBase.contractBuyerAddress = this.dataBase.endUserAddress;
      // this.dataBase.contractBuyerContacts = this.dataBase.endUserContacts;
      // this.dataBase.contractBuyerPhone = this.dataBase.endUserPhone;
      // this.dataBase.contractBuyerEmail = this.dataBase.endUserEmail;

      this.validateForm.controls.contractBuyer2.disable();
    } else if (this.dataBase.businessModel === 'DISTRIBUTOR' && this.dataBase.invoiceInformation === 'CNY') {
      // this.dataBase.contractBuyer = this.dataBase.distributor;
      // this.dataBase.contractBuyerAddress = this.dataBase.distributorAddress;
      // this.dataBase.contractBuyerContacts = this.dataBase.distributorContacts;
      // this.dataBase.contractBuyerPhone = this.dataBase.distributorPhone;
      // this.dataBase.contractBuyerEmail = this.dataBase.distributorEmail;
      this.validateForm.controls.contractBuyer2.disable();
    }
    else if (this.dataBase.businessModel === 'DISTRIBUTOR') {
      this.entryModeList = JSON.parse(JSON.stringify(this.entryModeLists));
    }
    this.paymentMethod();
    this.setType();
  }
  // 进单模式
  public getEntryModeList() {
    const params = {
      dictGroup: 'ENTRY_MODEL',
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
      if (rest.code === '0000') {
        this.entryModeList = rest.data;
        this.entryModeLists = JSON.parse(JSON.stringify(this.entryModeList));
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

  // 进单模式
  public changeEntryMode(value: any) {

    if (this.dataBase.businessModel == 'DIRECT') {
      this.entryModeList.map((val, index) => {
        val.code == 'STOCK' && (this.entryModeList.splice(index, 1));
      });
      //this.el.nativeElement.querySelector('#entryMode').value = "BIDDING";
    }
    else {
      this.entryModeList = JSON.parse(JSON.stringify(this.entryModeLists));;
    }

    this.entryMode = this.dataBase.entryMode;
    this.StockOff = ((this.dataBase.entryMode == 'BIDDING' && this.dataBase.endUsers == 'Stock') || this.dataBase.entryMode == 'STOCK' || this.dataBase.centralized) ? false : true;
    this.selectModelFile();
    this.ifBusinessModel();
    if (this.dataBase.entryMode === 'STOCK') {
      /*业务模式 插眼*/


      /* 业务模式为stock时 以下字段为非必选项目 */
      // 投标公司               tenderingCompany
      // 招标编号               tenderNo
      // 进口协议签署人职务      importAgreementSignPost
      // 最终用户                endUser
      // 医院性质                hospitalNature
      // 最终用户地址            endUserAddress
      // 最终用户联系人           endUserContacts
      // 最终用户电话             endUserPhone
      /*end*/
      this.validateForm.get('tenderingCompany')!.clearValidators();
      this.validateForm.get('tenderingCompany')!.markAsPristine();
      this.validateForm.get('tenderNo')!.clearValidators();
      this.validateForm.get('tenderNo')!.markAsPristine();
      this.validateForm.get('endUser')!.clearValidators();
      this.validateForm.get('endUser')!.markAsPristine();
      this.validateForm.get('hospitalNature')!.clearValidators();
      this.validateForm.get('hospitalNature')!.markAsPristine();
      this.validateForm.get('endUserAddress')!.clearValidators();
      this.validateForm.get('endUserAddress')!.markAsPristine();
      this.validateForm.get('endUserContacts')!.clearValidators();
      this.validateForm.get('endUserContacts')!.markAsPristine();
      this.validateForm.get('endUserPhone')!.clearValidators();
      this.validateForm.get('endUserPhone')!.markAsPristine();
      this.validateForm.get('endUserPhone')!.setValidators([this.checkPhone]);
      this.validateForm.get('importAgreementSignPost')!.clearValidators();
      this.validateForm.get('importAgreementSignPost')!.markAsPristine();
      this.validateForm.get('endUserEmail')!.clearValidators();
      this.validateForm.get('endUserEmail')!.markAsPristine();
      this.validateForm.get('endUserEmail')!.setValidators([this.cheakMail]);
      this.conTable && this.validateForm.get('actualSales')!.clearValidators();// 实际销售人
      this.dataBase.centralized = false;
      this.dataBase.actualSales = "";
      this.ServesiceService.centralizeds.emit()
    } else {
      this.conTable && this.validateForm.get('actualSales')!.setValidators([Validators.required, this.cheakMail]); // 实际销售人
      this.validateForm.get('tenderingCompany')!.setValidators(Validators.required);
      // this.validateForm.get('tenderingCompany')!.markAsDirty();
      this.validateForm.get('tenderNo')!.setValidators(Validators.required);
      // this.validateForm.get('tenderNo')!.markAsDirty();
      this.validateForm.get('endUser')!.setValidators(Validators.required);
      // this.validateForm.get('endUser')!.markAsDirty();
      this.validateForm.get('hospitalNature')!.setValidators(Validators.required);
      // this.validateForm.get('hospitalNature')!.markAsDirty();
      this.validateForm.get('endUserAddress')!.setValidators(Validators.required);
      // this.validateForm.get('endUserAddress')!.markAsDirty();
      this.validateForm.get('endUserContacts')!.setValidators(Validators.required);
      // this.validateForm.get('endUserContacts')!.markAsDirty();
      this.validateForm.get('endUserPhone')!.setValidators([Validators.required, this.checkPhone]);
      // this.validateForm.get('endUserPhone')!.markAsDirty();
      this.validateForm.get('importAgreementSignPost')!.setValidators(Validators.required);
      // this.validateForm.get('importAgreementSignPost')!.markAsDirty();
      this.validateForm.get('endUserEmail')!.setValidators([Validators.required, this.cheakMail]);
    }
    this.validateForm.get('tenderingCompany')!.updateValueAndValidity();
    this.validateForm.get('tenderNo')!.updateValueAndValidity();
    this.validateForm.get('endUser')!.updateValueAndValidity();
    this.validateForm.get('hospitalNature')!.updateValueAndValidity();
    this.validateForm.get('endUserAddress')!.updateValueAndValidity();
    this.validateForm.get('endUserContacts')!.updateValueAndValidity();
    this.validateForm.get('endUserPhone')!.updateValueAndValidity();
    this.validateForm.get('importAgreementSignPost')!.updateValueAndValidity();
    this.validateForm.get('endUserEmail')!.updateValueAndValidity();
    this.validateForm.get('actualSales')!.updateValueAndValidity();
    this.paymentMethod() //付款条款列表
    this.setType();
    this.updateDataBaseInfo.emit(value);
  }
  ngAfterViewInit() {
    this.cd.detectChanges();
  }
  ngOnChanges(changes: SimpleChange) {

    this.setType();
    if (this.dataBase) {


      this.setBaseInfor();
      if (this.dataBase.invoiceInformation == 'USD') {

        this.dataBase.ddpStatus = this.isadopt(this.dataBase.contractEndDate, 1);
        this.dataBase.contractDdpStatus = this.isadopt(this.dataBase.poolEndDate, 2);
      }
      if (this.dataBase.hospitalNature) {
        this.load = true;
        const flag = this.dataBase.detail.flag;
        const status = this.dataBase.detail.status;
        if ((flag == "0" && status == 'DHTGYBTX') || (flag == "0" && status == 'XJDHTGYBTX')) {
          this.prebookOff = false;
        }
        const ASYNS = async () => {
          let getPool:any = await this.getPoolList();
          const contractBuyer2 = getPool.find(val => val.corporateName == this.dataBase.foreignTradeCompany);
            contractBuyer2 && (this.dataBase.contractBuyer2 = contractBuyer2.corporateName);
          if (this.dataBase.distributor) {
            let distributor = this.dataBase.distributor ? this.dataBase.distributor.replace(/\s+/g, "") : "";
            let getDistributor = await this.distributorLoad(distributor);
          }
          let getRateLists = await this.getRateList();
          let getData = await this.getPrebook(this.dataBase.dealFormId);
          this.load = false;
          let data: any;
          if (this.dataBase.productList && this.dataBase.productList.length > 0) {
            let productList = this.dataBase.productList.find(val=>(val.prebookMainId!=null&&val.prebookMainId!=""&&val.prebookMainId!=undefined))
            if(productList&&productList.prebookMainId)
            {
              data = await this.getBase(productList.prebookMainId);
            }

          }
          else if (this.dataBase.prebookMainId) {
            data = await this.getBase(this.dataBase.prebookMainId);
          }
          this.isDistributor(data);
          this.isForeign(data);
          this.paymentMethod(); //付款条款的列表
          this.dataBase.afterSales = this.dataBase.afterSales != null ? this.dataBase.afterSales : "0";

          await this.GetDealLists(this.dataBase.dealFormId);
          this.selectModelFile();
          this.ifBusinessModel();
          this.setType();
          this.dataBase.ddpStatus = this.isadopt(this.dataBase.contractEndDate, 1);
          if (this.dataBase.businessModel == 'DISTRIBUTOR' && this.dataBase.dealerCode) {
            this.ServesiceService.dealerCode.emit(this.dataBase.dealerCode)
          }
        }
        ASYNS();
        if (this.dataBase.cteam) {
          this.dataBase.userTeme = this.dataBase.cteam;
        }
        else {
          let teamList = JSON.parse(window.localStorage.getItem("profiles"));
          let teamRole = teamList.find(val => val.role == "Sales Rep/Mgr");
          teamRole && (this.dataBase.userTeme = teamRole.team);
        }
        this.StockOff = ((this.dataBase.entryMode == 'BIDDING' && this.dataBase.endUsers == 'Stock') || this.dataBase.entryMode == 'STOCK' || this.dataBase.centralized) ? false : true;

        if (this.dataBase.businessModel == 'DISTRIBUTOR' && this.conTable) {
          this.dealerCodeList()
        }
        if (status === 'DHTOASH' && flag == '0')  //如果是oa审核节点放开备注的禁用
        {
          this.dataBase.shipmentDelivery == '1' && this.validateForm.controls.shipmentDelivery.enable();
          this.dataBase.performanceBond == '1' && this.validateForm.controls.performanceBond.enable();
          this.dataBase.installationWarranty == '1' && this.validateForm.controls.installationWarranty.enable();
          this.dataBase.sitePreparation == '1' && this.validateForm.controls.sitePreparation.enable();
          this.dataBase.afterSales == '1' && this.validateForm.controls.afterSales.enable();
          this.supportFileMissingFlag();
          this.dataBase.amountDifference == '1' && this.validateForm.controls.amountDifference.enable();
          if (this.dataBase.other7) {
            //this.validateForm.controls.other1.enable();
            this.validateForm.controls.other2.enable();
            this.validateForm.controls.other3.enable();
            this.validateForm.controls.other4.enable();
            this.validateForm.controls.other5.enable();
            this.validateForm.controls.other6.enable();
            this.validateForm.controls.other7.enable();
            this.validateForm.controls.freeText.enable();
          }
        }
      }
      this.entryMode = this.dataBase.entryMode;
      if (this.dataBase.entryMode == '' || this.dataBase.entryMode == 'BIDDING' || (this.dataBase.sampleAuditFlag == '1' && this.dataBase.entryMode == 'STOCK')) {
        this.rowspanht = 7;
      }
      else {
        this.rowspanht = 1;
      }
    }
    if (this.dataBase && this.dataBase.entryMode) {
      if (this.dataBase.entryMode === 'STOCK') {
        /*业务模式 插眼*/

        /* 业务模式为stock时 以下字段为非必选项目 */
        // 投标公司               tenderingCompany
        // 招标编号               tenderNo
        // 进口协议签署人职务      importAgreementSignPost
        // 最终用户                endUser
        // 医院性质                hospitalNature
        // 最终用户地址            endUserAddress
        // 最终用户联系人           endUserContacts
        // 最终用户电话             endUserPhone
        /*end*/
        this.validateForm.get('tenderingCompany')!.clearValidators();
        this.validateForm.get('tenderingCompany')!.markAsPristine();
        this.validateForm.get('tenderNo')!.clearValidators();
        this.validateForm.get('tenderNo')!.markAsPristine();
        this.validateForm.get('endUser')!.clearValidators();
        this.validateForm.get('endUser')!.markAsPristine();
        this.validateForm.get('hospitalNature')!.clearValidators();
        this.validateForm.get('hospitalNature')!.markAsPristine();
        this.validateForm.get('endUserAddress')!.clearValidators();
        this.validateForm.get('endUserAddress')!.markAsPristine();
        this.validateForm.get('endUserContacts')!.clearValidators();
        this.validateForm.get('endUserContacts')!.markAsPristine();
        this.validateForm.get('endUserPhone')!.clearValidators();
        this.validateForm.get('endUserPhone')!.markAsPristine();
        this.validateForm.get('endUserPhone')!.setValidators([this.checkPhone]);
        this.validateForm.get('importAgreementSignPost')!.clearValidators();
        this.validateForm.get('importAgreementSignPost')!.markAsPristine();
        this.validateForm.get('endUserEmail')!.clearValidators();
        this.validateForm.get('endUserEmail')!.markAsPristine();
        this.validateForm.get('endUserEmail')!.setValidators([this.cheakMail]);
        this.conTable && this.validateForm.get('actualSales')!.clearValidators();// 实际销售人

      } else {
        this.conTable && this.validateForm.get('actualSales')!.setValidators([Validators.required, this.cheakMail]); // 实际销售人
        this.validateForm.get('tenderingCompany')!.setValidators(Validators.required);
        // this.validateForm.get('tenderingCompany')!.markAsDirty();
        this.validateForm.get('tenderNo')!.setValidators(Validators.required);
        // this.validateForm.get('tenderNo')!.markAsDirty();
        this.validateForm.get('endUser')!.setValidators(Validators.required);
        // this.validateForm.get('endUser')!.markAsDirty();
        this.validateForm.get('hospitalNature')!.setValidators(Validators.required);
        // this.validateForm.get('hospitalNature')!.markAsDirty();
        this.validateForm.get('endUserAddress')!.setValidators(Validators.required);
        // this.validateForm.get('endUserAddress')!.markAsDirty();
        this.validateForm.get('endUserContacts')!.setValidators(Validators.required);
        // this.validateForm.get('endUserContacts')!.markAsDirty();
        this.validateForm.get('endUserPhone')!.setValidators([Validators.required, this.checkPhone]);
        // this.validateForm.get('endUserPhone')!.markAsDirty();
        this.validateForm.get('importAgreementSignPost')!.setValidators(Validators.required);
        // this.validateForm.get('importAgreementSignPost')!.markAsDirty();
        this.validateForm.get('endUserEmail')!.setValidators([Validators.required, this.cheakMail]);
      }
      this.validateForm.get('tenderingCompany')!.updateValueAndValidity();
      this.validateForm.get('tenderNo')!.updateValueAndValidity();
      this.validateForm.get('endUser')!.updateValueAndValidity();
      this.validateForm.get('hospitalNature')!.updateValueAndValidity();
      this.validateForm.get('endUserAddress')!.updateValueAndValidity();
      this.validateForm.get('endUserContacts')!.updateValueAndValidity();
      this.validateForm.get('endUserPhone')!.updateValueAndValidity();
      this.validateForm.get('importAgreementSignPost')!.updateValueAndValidity();
      this.validateForm.get('endUserEmail')!.updateValueAndValidity();
      this.validateForm.get('actualSales')!.updateValueAndValidity();

      if (this.dataBase.entryMode && this.dataBase.entryMode == 'BIDDING') {
        this.getWinUrl();
      }
    }
    if (this.dataBase && this.dataBase.financialProgramme == "2") {
      this.financiaWidth = "7"
    }
    else {
      this.financiaWidth = "14"
    }

    this.viewData("bidWinningNotice", "bidWinningNoticeFileList", this.dataBase.bidWinningNoticeNames);
    this.viewData("siteReport", "siteReportFileList", this.dataBase.siteReportNames);
    this.viewData("projectSolutions", "projectSolutionsFileList", this.dataBase.projectSolutionsNames);
    this.viewData("biddingDocuments", "biddingDocumentsFileList", this.dataBase.biddingDocumentsNames);
    this.viewData("endUserContract", "endUserContractFileList", this.dataBase.endUserContractNames);
    this.viewData("paymentProvisionFileName", "paymentProvisionFileNameList", this.dataBase.paymentProvisionFileNames);
    this.viewData("shipmentDeliveryFileName", "shipmentDeliveryList", this.dataBase.shipmentDeliveryFileNames);
    this.viewData("installationWarrantyFileName", "installationWarrantyList", this.dataBase.installationWarrantyFileNames);
    this.viewData("amountDifferenceFileName", "amountDifferenceList", this.dataBase.amountDifferenceFileNames);
    this.viewData("sitePreparationFileName", "sitePreparatList", this.dataBase.sitePreparationFileNames);

    this.viewData("performanceBondFileName", "performanceBondList", this.dataBase.performanceBondFileNames);

    this.viewData("afterSalesFileName", "afterSalesList", this.dataBase.afterSalesFileNames);
    this.viewData("supportFileMissingFileName", "supportFileMissingList", this.dataBase.supportFileMissingFileNames);
    this.viewData("otherFilName", "otherFilNameList", this.dataBase.otherFilNames);
    this.viewData("projectAnalysisTable", "projectAnalysisTableFileList", this.dataBase.projectAnalysisTableNames);
    this.viewData("tenderDocuments", "tenderDocumentsList", this.dataBase.tenderDocumentsNames);
    this.viewData("confirmationFile", "confirmationFileFileList", this.dataBase.confirmationFileNames);
    this.viewData("mrShieldingCompany", "mrShieldingCompanyList", this.dataBase.mrShieldingCompanyNames);
    this.setColSpanOfConfirmTable();

  }
  //招标编号
  keyupNo() {
    this.setType();
    this.selectModelFile();
  }
  //招标文件的编辑类型
  setType() {
    if (this.dataBase.entryMode == 'STOCK' && (this.dataBase.userTeme == 'BV' || this.dataBase.userTeme == 'DXR')) {
      this.demandLetter = "要货函";
    }
    else {
      if (this.dataBase.hospitalNature == '民营医院') {
        this.demandLetter = "场地勘验报告";
      }
      else {
        if (this.dataBase.tenderNo != '其他类型') {
          this.demandLetter = "要货函";
        }
        else {
          this.demandLetter = "场地勘验报告";
        }
      }
    }
  }
  keyTaxNumber(e, params) {
    if (e) {
      if (/^[\d\s]*$/.test(e)) {
        if (/\S{5}/.test(e)) {
          this.pricevalue.id = e.replace(/\s/g, '').replace(/(.{4})/g, "$1 ");
        }
        else {
          this.pricevalue.id = e;
        }
      }
      this.el.nativeElement.querySelector("#tax").value = this.pricevalue.id;
      params = this.pricevalue.id;
    }
    ///\S{5}/.test(params) && $this.val(v.replace(/\s/g, '').replace(/(.{4})/g, "$1 "));
  }
  //项目分析表
  nzRemovprojectAnalysisTable = (file: UploadFile): any => {
    this.dataBase.projectAnalysisTable = "";
    return true;
  }
  //最终用户合同
  nzRemovendUserContract = (file: UploadFile): any => {
    this.dataBase.endUserContract = "";
    return true;
  }
  //投标文件
  nzRemovtenderDocuments = (file: UploadFile): any => {
    this.dataBase.tenderDocuments = "";
    return true;
  }
  //招标文件
  nzRemovbiddingDocuments = (file: UploadFile): any => {
    this.dataBase.biddingDocuments = "";
    return true;
  }
  //项目解决方案售前支持报告
  nzRemovprojectSolutions = (file: UploadFile): any => {
    this.dataBase.projectSolutions = "";
    return true;
  }
  //场地报告要货函
  nzRemovsiteReport = (file: UploadFile): any => {
    this.dataBase.siteReport = "";
    return true;
  }
  //中标通知书
  nzRemovbidWinningNotice = (file: UploadFile): any => {
    this.dataBase.bidWinningNotice = "";
    return true;
  }
  //支持文件缺失需特批进单
  nzRemovsupportFileMissing = (file: UploadFile): any => {
    this.dataBase.supportFileMissingFileName = "";
    return true;
  }
  //直投订单合同金额和中标金额有价差
  nzRemovamountDifference = (file: UploadFile): any => {
    this.dataBase.amountDifferenceFileName = "";
    return true;
  }
  //其它
  nzRemovother = (file: UploadFile): any => {
    this.dataBase.otherFilName = "";
    return true;
  }
  //是否售后
  nzRemovafterSales = (file: UploadFile): any => {
    this.dataBase.afterSalesFileName = "";
    return true;
  }
  //履约保函
  nzRemovperformanceBond = (file: UploadFile): any => {
    this.dataBase.performanceBondFileName = "";
    return true;
  }
  //安装及保修
  nzRemovinstallationWarranty = (file: UploadFile): any => {
    this.dataBase.installationWarrantyFileName = "";
    return true;
  }
  //删除场地报告
  nzRemovsitePreparation = (file: UploadFile): any => {
    this.dataBase.sitePreparationFileName = "";
    return true;
  }
  //删除装运及交货
  nzRemovshipmentDelivery = (file: UploadFile): any => {
    this.dataBase.shipmentDeliveryFileName = "";
    return true;
  }
  //删除付款条款附件
  nzRemovpaymentProvision = (file: UploadFile): any => {
    this.dataBase.paymentProvisionFileName = "";
    return true;
  }
  //删除磁屏蔽
  nzRemovmrShieldingCompany = (file: UploadFile): any => {
    this.dataBase.mrShieldingCompany = "";
    return true;
  }
  //删除塔吊文件
  nzRemovconfirmationFile = (file: UploadFile,): any => {
    this.dataBase.confirmationFile = "";
    return true;
  }
  //直投或非直投的需要上传和显示的文件
  selectModelFile() {
    if (this.dataBase.detail.status == "" || this.dataBase.detail.status == "DHTGYBTX" || this.dataBase.detail.status == "XJDHTGYBTX" || this.dataBase.detail.status == "DBCWJSC") {
      this.rowspans = 2;
      this.modelTalbe = true;
      if (this.dataBase.businessModel != 'DIRECT') {
        if (this.dataBase.tenderNo != '其他类型') {
          this.sampleRow = 5;
        }
        else {
          this.sampleRow = 3;
        }
      }
      else {
        if (this.dataBase.tenderNo != '其他类型') {
          this.sampleRow = 2;
        }
        else {
          this.sampleRow = 1;
        }

      }

    }
    else {
      this.rowspans = 1;
      this.modelTalbe = false;
      if (this.dataBase.businessModel != 'DIRECT') {
        if (this.dataBase.tenderNo != '其他类型') {
          this.sampleRow = 4;
        }
        else {
          this.sampleRow = 2;
        }
      }
      else {
        if (this.dataBase.tenderNo != '其他类型') {
          this.sampleRow = 2;
        }
        else {
          this.sampleRow = 1;
        }

      }
    }
  }

  setBaseInfor()  //设置合同概要表其它信息
  {
    if (this.dataBase.detail.status && this.dataBase.detail.status !== 'DOACS' || this.showChek) {
      if (this.dataBase.other === undefined) {
        this.dataBase.other = 'false,false,false,false,false,false,false';
      }
      if (!this.dataBase.other1) {
        this.dataBase.other1 = false;
      }
      if (!this.dataBase.other2) {
        this.dataBase.other2 = false;
      }
      if (!this.dataBase.other3) {
        this.dataBase.other3 = false;
      }
      if (!this.dataBase.other4) {
        this.dataBase.other4 = false;
      }
      if (!this.dataBase.other5) {
        this.dataBase.other5 = false;
      }
      if (!this.dataBase.other6) {
        this.dataBase.other6 = false;
      }
      if (!this.dataBase.other7) {
        this.dataBase.other7 = false;
      }
      const arr = this.dataBase.other.split(',');
      arr.map((item, index) => {
        if (item === 'true') {
          arr[index] = true;
        }
        if (item === 'false') {
          arr[index] = false;
        }
      });
      this.otherFile = arr.some(res => res === 'true') //控制备注、复制按钮的显示与否;
      this.dataBase.other1 = arr[0];
      this.dataBase.other2 = arr[1];
      this.dataBase.other3 = arr[2];
      this.dataBase.other4 = arr[3];
      this.dataBase.other5 = arr[4];
      this.dataBase.other6 = arr[5];
      this.dataBase.other7 = arr[6];
    }
  }
  //跳转到prebook链接
  public gotoWin(item) {
    console.log(location.origin + environment.base_href + '/#/' + 'prebookso?id=' + codeString(item) + '&flag=1');
    window.open(location.origin + environment.base_href + '/#/' + 'prebookso?id=' + codeString(item) + '&flag=1&status=prebook_end');
  }
  //跳转到合同概要表
  public gotoWinIncon(item) {
    window.open(location.origin + environment.base_href + '/#/' + 'inconmodif?id=' + codeString(item) + '&flag=1');
  }
  //合同概要表ID列表
  public getContractCancel() {
    const existsChange=!this.disa;
    let url = `/act/preparation/getContractCancel?existsChange=${existsChange}`;
    this.http.get(url).subscribe(rest => {
      this.contractCancelList = rest.data;
    })
  }
  //合同概要表选择
  public changeContract(event) {
    const select = this.contractCancelList.find(val => val.contractCancelReferenceId == event)
    if (select) {
      this.dataBase.contractCancelMainId = select.contractCancelMainId;
    }
  }
  public ngOnInit(): void {
    this.getEntryModeList();
    this.getBusinessModelList();
    this.getfinancialList();
    this.getContractCancel();
    this.oaDisa = this.disa;
    this.taskId = this.activatedRouter.queryParams['_value'].taskID;
    this.dataBase.centralized = false;
    this.dataBase.isPrebookApply = '0';
    this.validateForm = this.fb.group({
      contractCancelReferenceId: new FormControl({ value: 'Nancy', disabled: true }),
      priceDifferent: new FormControl({ value: 'Nancy', disabled: true }),
      prebookReferenceId: new FormControl({ value: 'Nancy' }),
      isPrebookApply: new FormControl({ value: 'Nancy', disabled: true }, Validators.required),
      agreementNo: new FormControl({ value: 'Nancy',disabled: this.disa}),
      centralized: new FormControl({ value: 'Nancy', disabled: this.disa }), //集采项目
      afterSales: new FormControl({ value: 'Nancy', disabled: this.disa }), //是否售后
      actualSales: new FormControl({ value: 'Nancy', disabled: this.disa }), //实际销售人
      afterSalesRemarks: new FormControl({ value: 'Nancy', disabled: this.disa }), //是否售后文本框
      addresseeTel: new FormControl({ value: 'Nancy', disabled: this.disa }, [this.checkPhone]), //收件人电话
      addressee: new FormControl({ value: 'Nancy', disabled: this.disa }), //收件人
      telTax: new FormControl({ value: 'Nancy', disabled: this.disa }, [this.checkPhone]), //tel/tax
      accountAddress: new FormControl({ value: 'Nancy', disabled: this.disa }), //开户地址
      taxNumber: new FormControl({ value: 'Nancy', disabled: this.disa }, [Validators.required, this.taxNumberCheck]), //税号
      accountNo: new FormControl({ value: 'Nancy', disabled: this.disa }), //账号
      bankName: new FormControl({ value: 'Nancy', disabled: this.disa }),   //开户行
      accountName: new FormControl({ value: 'Nancy', disabled: this.disa }), //开户名称
      freeText: new FormControl({ value: 'Nancy', disabled: this.disa }),
      contractEndDate: new FormControl({ value: 'Nancy', disabled: true }, Validators.required), //经销商ddp结束日期
      poolEndDate: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required), //外贸公司ddp结束日期
      financialProgrammeCost: new FormControl({ value: 'Nancy', disabled: true }), //金融金额
      financialProgramme: new FormControl({ value: 'Nancy', disabled: true }), //金融方案
      financialProgrammeTxt: new FormControl({ value: 'Nancy', disabled: true }), //金融文本框
      tradeInCost: new FormControl({ value: 'Nancy', disabled: true }), //tradeIn金额
      rebateCost: new FormControl({ value: 'Nancy', disabled: true }),//rebate金额
      ddpStatus: new FormControl({ value: 'Nancy', disabled: true }, Validators.required),
      billingInfor: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      contractBuyer: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),

      contractBuyer2: new FormControl({ value: 'Nancy', disabled: this.disa }),
      businessModel: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      team: new FormControl({ value: 'Nancy', disabled: true }, Validators.required), //team
      region: new FormControl({ value: 'Nancy', disabled: true }, Validators.required), //大区
      smallArea: new FormControl({ value: 'Nancy', disabled: true }, Validators.required), //小区
      distributorAddress: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      distributorContacts: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      distributorPhone: new FormControl({ value: '', disabled: this.disa }, [Validators.required, this.checkPhone]),
      distributorEmail: new FormControl({ value: 'Nancy', disabled: this.disa }, [Validators.required, this.cheakMail]),
      orderSignName: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      orderSignPost: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      contractDdpStatus: new FormControl({ value: 'Nancy', disabled:true }, Validators.required),
      contractBuyerAddress: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      contractBuyerContacts: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      contractBuyerPhone: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      contractBuyerEmail: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      importAgreementSignName: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      importAgreementSignPost: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      endUserId: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      endUserEmail: new FormControl({ value: 'Nancy', disabled: this.disa }, [Validators.required, this.cheakMail]),
      endUser: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      endUserContacts: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      endUserPhone: new FormControl({ value: 'Nancy', disabled: this.disa }, [Validators.required]),
      endUserAddress: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      sampleAuditFlag: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      hospitalNature: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      invoiceInformation: new FormControl({ value: 'Nancy', disabled: true }, Validators.required),
      distributor: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      distributor1: new FormControl({ value: 'Nancy', disabled: this.disa }),
      tenderingCompany: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      tenderNo: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      entryMode: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      paymentProvision: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),//合同概要表和进单装备表的基础验证差别
      shipmentDelivery: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      installationWarranty: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      // installationWarrantyRadio: new FormControl({value: 'Nancy', disabled: this.disa}, null), // 下一级是否审核
      amountDifference: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      train: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      sitePreparation: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      performanceBond: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      supportFileMissing: new FormControl({ value: 'Nancy', disabled: this.disa },),
      supportFileMissingRemarks: new FormControl({ value: 'Nancy', disabled: this.disa },),
      punishment: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      other: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      other1: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      other2: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      other3: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      other4: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      other5: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      other6: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      other7: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      paymentProvisionRemarks: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      shipmentDeliveryRemarks: new FormControl({ value: '', disabled: this.disa }, Validators.required),
      installationWarrantyRemarks: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      amountDifferenceRemarks: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      sitePreparationRemarks: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      performanceBondRemarks: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      otherRemarks: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      contractPrice: new FormControl({ value: 'Nancy', disabled: true }, Validators.required),
      productModel: new FormControl({ value: 'Nancy', disabled: true }, Validators.required),
      nmpaName: new FormControl({ value: 'Nancy', disabled: true }, Validators.required),
      installationWarrantyRadio: new FormControl({ value: 'Nancy', disabled: this.disa || this.dataBase.detail.status == 'DHTGYBTX' || this.dataBase.detail.status == 'XJDHTGYBTX' }, Validators.required),

      foreignTradeCompany: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required), // 外贸公司
      foreignTradeCompanyAddress: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required), // 外贸地址
      foreignTradeCompanyContacts: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required), // 外贸联系人
      foreignTradeCompanyPhone: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required), // 外贸公司电话
      foreignTradeCompanyEmail: new FormControl({ value: 'Nancy', disabled: this.disa }, [Validators.required, this.cheakMail]), // 外贸公司邮箱
      sameFlag: new FormControl({ value: 'Nancy', disabled: this.disa }, null), // 外贸公司是否与经销商相同
      contractSignatory: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required), // 合同签署人
      contractSignatoryPost: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required), // 合同签署人职务
      marketBundleQuantity: new FormControl({ value: 'Nancy', disabled: true }, null),
      sofonNo: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      switchValid:new FormControl({value:''})
    });
    if (!this.conTable) {
      this.validateForm.get('sofonNo')!.clearValidators();
    }
    //this.dataBase.sameFlag = '0';
    // if (this.dataBase.detail.status === '' || this.showChek === false) {
    this.validateForm.get('paymentProvision')!.clearValidators();
    // this.validateForm.get('paymentProvision')!.markAsPristine();
    this.validateForm.get('installationWarrantyRadio')!.clearValidators();
    // this.validateForm.get('installationWarrantyRadio')!.markAsPristine();
    this.validateForm.get('shipmentDelivery')!.clearValidators();
    // this.validateForm.get('shipmentDelivery')!.markAsPristine();
    this.validateForm.get('installationWarranty')!.clearValidators();
    // this.validateForm.get('installationWarranty')!.markAsPristine();
    this.validateForm.get('amountDifference')!.clearValidators();
    // this.validateForm.get('amountDifference')!.markAsPristine();
    this.validateForm.get('train')!.clearValidators();
    // this.validateForm.get('train')!.markAsPristine();
    this.validateForm.get('sitePreparation')!.clearValidators();
    // this.validateForm.get('sitePreparation')!.markAsPristine();
    this.validateForm.get('performanceBond')!.clearValidators();
    // this.validateForm.get('performanceBond')!.markAsPristine();
    this.validateForm.get('punishment')!.clearValidators();
    // this.validateForm.get('punishment')!.markAsPristine();
    this.validateForm.get('other')!.clearValidators();
    // this.validateForm.get('other')!.markAsPristine();
    this.validateForm.get('paymentProvisionRemarks')!.clearValidators();
    // this.validateForm.get('paymentProvisionRemarks')!.markAsPristine();
    this.validateForm.get('shipmentDeliveryRemarks')!.clearValidators();
    // this.validateForm.get('shipmentDeliveryRemarks')!.markAsPristine();
    this.validateForm.get('installationWarrantyRemarks')!.clearValidators();
    // this.validateForm.get('installationWarrantyRemarks')!.markAsPristine();
    this.validateForm.get('amountDifferenceRemarks')!.clearValidators();
    // this.validateForm.get('amountDifferenceRemarks')!.markAsPristine();
    this.validateForm.get('sitePreparationRemarks')!.clearValidators();
    // this.validateForm.get('sitePreparationRemarks')!.markAsPristine();
    this.validateForm.get('performanceBondRemarks')!.clearValidators();
    // this.validateForm.get('performanceBondRemarks')!.markAsPristine();
    this.validateForm.get('otherRemarks')!.clearValidators();
    // this.validateForm.get('otherRemarks')!.markAsPristine();
    this.validateForm.get('contractPrice')!.clearValidators();
    // this.validateForm.get('contractPrice')!.markAsPristine();
    this.validateForm.get('productModel')!.clearValidators();
    // this.validateForm.get('productModel')!.markAsPristine();
    this.validateForm.get('nmpaName')!.clearValidators();
    // this.validateForm.get('nmpaName')!.markAsPristine();
    //}

    this.validateForm.get('installationWarrantyRadio')!.updateValueAndValidity();
    this.validateForm.get('paymentProvision')!.updateValueAndValidity();
    this.validateForm.get('shipmentDelivery')!.updateValueAndValidity();
    this.validateForm.get('installationWarranty')!.updateValueAndValidity();
    this.validateForm.get('amountDifference')!.updateValueAndValidity();
    this.validateForm.get('train')!.updateValueAndValidity();
    this.validateForm.get('sitePreparation')!.updateValueAndValidity();
    this.validateForm.get('performanceBond')!.updateValueAndValidity();
    this.validateForm.get('punishment')!.updateValueAndValidity();
    this.validateForm.get('other')!.updateValueAndValidity();
    this.validateForm.get('paymentProvisionRemarks')!.updateValueAndValidity();
    this.validateForm.get('shipmentDeliveryRemarks')!.updateValueAndValidity();
    // this.validateForm.get('installationWarrantyRemarks')!.markAsPristine();
    // this.validateForm.get('amountDifferenceRemarks')!.markAsPristine();
    // this.validateForm.get('sitePreparationRemarks')!.markAsPristine();
    // this.validateForm.get('performanceBondRemarks')!.markAsPristine();
    // this.validateForm.get('otherRemarks')!.markAsPristine();
    // this.validateForm.get('contractPrice')!.markAsPristine();
    // this.validateForm.get('productModel')!.markAsPristine();
    // this.validateForm.get('nmpaName')!.markAsPristine();

    const status = this.dataBase.detail.status;
    const flag = this.dataBase.detail.flag;
    this.setType();
    if (status == 'XJDHTGYBTX' || status == 'DHTGYBTX') {
      this.validateForm.controls.tenderNo.disable();
      this.validateForm.controls.businessModel.disable();
      this.validateForm.controls.region.disable();
      this.validateForm.controls.team.disable();
      this.validateForm.controls.smallArea.disable();
      this.validateForm.controls.tenderingCompany.disable();
      this.validateForm.controls.entryMode.disable();
      this.validateForm.controls.centralized.disable();
      this.validateForm.controls.agreementNo.disable();
      flag == '0' && this.validateForm.controls.isPrebookApply.enable();
    }
    if (status === 'DHTOASH' && flag == '0')  //如果是oa审核节点放开备注的禁用
    {
      this.validateForm.controls.paymentProvisionRemarks.enable();
      this.validateForm.controls.afterSalesRemarks.enable();
      this.validateForm.controls.shipmentDeliveryRemarks.enable();
      this.validateForm.controls.installationWarrantyRemarks.enable();
      this.validateForm.controls.amountDifferenceRemarks.enable();
      this.validateForm.controls.sitePreparationRemarks.enable();
      this.validateForm.controls.otherRemarks.enable();
      this.validateForm.controls.performanceBondRemarks.enable();
      this.validateForm.controls.supportFileMissingRemarks.enable();
      this.validateForm.controls.installationWarrantyRadio.enable();
     // this.validateForm.controls.isPrebookApply.enable();
      this.oaDisa = false;
    }
  }

  // 飞利浦金融方案
  public getfinancialList() {
    const params = {
      dictGroup: 'OABC',
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
      if (rest.code === '0000') {
        this.financialList = rest.data;
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }
  public searchCPResult(): void {
    // 清空
    this.dealFormIdinput = '';
    this.dealformlist = [];
    //this.ckdealformlist = {};
    this.box = false;
    this.isVisibleCPResult = true;
  }
  taxNumberCheck(control: FormControl) {

    if (control.value) {
      const reg = /^([\da-zA-z]{0,18}$)$/;
      const valid = reg.test(control.value); // true
      return valid ? null : { taxform: true };
    }
  }
  // 电话号码正则表达式的验证
  checkPhone(control: FormControl) {
    if (control.value) {
      //const reg = /^1[3|4|5|7|8][0-9]{9}$/; // 验证规则
      // const reg = /^([\d\+\-\*\/x]\d{0,15}$)*$/
      //const reg=/^([\d +()-\s]{0,20}$)$/;
      const reg = /^([\d +()-\s]{0,1000}$)$/;
      //const reg = /^[0-9]*$/g;
      //const phoneNum = '15507621999'; // 手机号码
      const valid = reg.test(control.value); // true
      return valid ? null : { phoneform: true };
    }
  }
  //邮箱的正则表大式
  cheakMail(control: FormControl) {
    if (control.value) {
      //const reg=/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      //const reg=/^[0-9a-zA-Z_\@\.\s\-]*$/g;
      const reg = /^(?!\@)+(?!\_)+[0-9a-zA-Z_\@\.\s\-]*$/g;
      const valid = reg.test(control.value); // true
      return valid ? null : { mailform: true };
    }
  }
  // public handleOkCPResult(): void {

  //   // 清空原有数据
  //   // this.validateForm.reset();

  //   const ASYNS = async () => {
  //     let dealFormId = this.dataBase.dealFormId;
  //     if (dealFormId != null && dealFormId != undefined && dealFormId != "") {
  //       let getcp = await this.getCPDetails();
  //       await this.getProduct(dealFormId);
  //     }
  //     else {
  //       this.message.create("warning", "请输入dealFormId")
  //     }
  //   }
  //   ASYNS()
  // }
  public clearFrom() {

    // this.dataBase = {
    //   productList: [], // 产品列表
    //   detail: {
    //     id: '',
    //     flag: '0',
    //     status: '',
    //   },
    //   dataList: [],
    //   count: 0,
    //   sameFlag: "0",
    // };
    this.dataBase.productList = [];
    this.dataBase.detail = {
      id: '',
      flag: '0',
      status: '',
    }
    this.dataBase.dataList = [];
    this.dataBase.count = 0;
    this.dataBase.sameFlag = "0";
    this.dataBase.siteReport = "";
    this.dataBase.confirmationFile = "";
    this.dataBase.mrShieldingCompany = "";
    this.dataBase.paymentProvisionFileName = "";
    this.dataBase.shipmentDeliveryFileName = "";
    this.dataBase.sitePreparationFileName = "";
    this.dataBase.installationWarrantyFileName = "";
    this.dataBase.performanceBondFileName = "";
    this.dataBase.amountDifferenceFileName = "";
    this.dataBase.supportFileMissingFileName = "";
    this.dataBase.bidWinningNotice = "";
    this.dataBase.projectSolutions = "";
    this.dataBase.tenderDocuments = "";
    this.dataBase.endUserContract = "";
    this.dataBase.projectAnalysisTable = "";
    this.dataBase.otherFilName = "";
    this.bidWinningNoticeFileList = [];
    this.siteReportFileList = [];
    this.projectAnalysisTableFileList = [];
    this.confirmationFileFileList = [];
    this.paymentProvisionFileNameList = [];
    this.projectSolutionsFileList = [];
    this.biddingDocumentsFileList = [];
    this.endUserContractFileList = [];
    this.paymentProvisionFileNameList = [];
    this.shipmentDeliveryList = [];
    this.installationWarrantyList = [];
    this.amountDifferenceList = [];
    this.sitePreparatList = [];
    this.performanceBondList = [];
    this.supportFileMissingList = [];
    this.otherFilNameList = [];
    this.mrShieldingCompanyList = [];
    this.tenderDocumentsList = [];
    this.afterSalesList = [];
    this.dataBase.tableColOff = false;
    this.dataBase.financialProgramme = "";
  }
  public handleOkCPResult2() {
    if (this.dealformlist.length < 1) {
      this.message.create('error', '请先点击查询');
      return;
    }
    if (!this.ckdealformlist.radio) {
      this.message.create('error', '未选择Deal Form ID');
      return;
    }
    this.validateForm.reset();
    this.clearFrom();

    this.dataBase.dealFormId = this.ckdealformlist.dealFormId;
    // for (const key in this.validateForm.controls) {
    //   this.validateForm.controls[key].markAsPristine()
    //   this.validateForm.controls[key].updateValueAndValidity()
    // }
    if (this.ckdealformlist) {
      setTimeout(() => {
        this.dataBase.isPrebookApply = '0';
        this.dataBase.entryMode = this.entryMode ? this.entryMode : "";
        this.dataBase.entryUnitPrice = "";//所有进单单总价;
        this.dataBase.dealContractPrice = this.ckdealformlist.dealPrice; //deal总价
        this.dataBase.businessModel = this.ckdealformlist.businessModel; //业务模式;
        this.dataBase.estimatedBidPrice = this.ckdealformlist.estimatedTenderPrice ? this.ckdealformlist.estimatedTenderPrice : 0; //预计投标价格
        this.dataBase.region = this.ckdealformlist.region;//大区域
        this.dataBase.smallArea = this.ckdealformlist.residentialQuarters; //小区域
        this.dataBase.team = this.ckdealformlist.team; //team
        this.dataBase.tenderNo = this.ckdealformlist.tenderNo;//招标编号
        this.dataBase.tenderingCompany = this.ckdealformlist.biddingCompanyName; //投标公司
        this.dataBase.distributor = this.ckdealformlist.dealerName; //经销商
        this.dataBase.dealerCode = this.ckdealformlist.dealerId;//经销商code
        if (this.dataBase.businessModel != 'DIRECT') {
          // let distributor = this.dataBase.distributor ? this.dataBase.distributor.replace(/\s+/g, "") : "";
          // let select = this.distributorList.find(vals => vals.dealerName.replace(/\s+/g, "") == distributor);
          // select && (this.dataBase.distributor1 = select.dealerName);
          // this.distributorOff = select ? false : true;  //经销商没在列表时提示框显示
          if (this.dataBase.distributor) {
            let distributor = this.dataBase.distributor ? this.dataBase.distributor.replace(/\s+/g, "") : "";
            this.distributorLoad(distributor);
          }
        }
        // this.dataBase.ddpStatus = this.ckdealformlist.ddpStatus //ddp状态 经销商
        this.dataBase.distributorAddress = this.ckdealformlist.registeredAddress; //经销商地址
        this.dataBase.distributorPhone = this.ckdealformlist.dealerTelephone; //经销商电话
        this.dataBase.distributorEmail = this.ckdealformlist.dealerEmail; //邮箱地址
        this.dataBase.billingInfor = this.ckdealformlist.vatBillingInfo; //开票信息
        // this.dataBase.contractDdpStatus = this.ckdealformlist.ddpStatus1; //外贸公司的ddp状态
        this.dataBase.contractBuyerAddress = this.ckdealformlist.registeredAddress; //合同买方地址
        this.dataBase.contractBuyerEmail = this.ckdealformlist.dealerEmail; //合同邮箱
        this.dataBase.endUser = this.ckdealformlist.hospitalName; //最终用户
        this.dataBase.endUsers = this.ckdealformlist.hospitalNames; //最终用户
        this.dataBase.endUserId = this.ckdealformlist.hospitalId;//用户id
        this.pageParam.endUserId = this.ckdealformlist.hospitalId;//弹窗口的选中的值
        this.dataBase.hospitalNature = this.ckdealformlist.customerType; //医院性质
        this.dataBase.endUserAddress = this.ckdealformlist.endUserAddress; //最终用户地址
        this.dataBase.endUserPhone = this.ckdealformlist.endUserPhone; //最终用户电话
        this.dataBase.invoiceInformation = this.ckdealformlist.currencySystem //币制
        this.dataBase.sampleAuditFlag = this.ckdealformlist.samplingInspection //是否抽样审核
        this.dataBase.foreignTradeCompany = this.ckdealformlist.foreignCompanyName ? this.ckdealformlist.foreignCompanyName.replace(/\s+/g, "") : ""; //外贸公司

        this.dataBase.foreignTradeCompanyAddress = this.ckdealformlist.foreignTradeCompanyAddress //外贸公司
        this.dataBase.foreignTradeCompanyContacts = this.ckdealformlist.foreignCompanyContact; //外贸公司联系人
        let foreignCompanyContactInformation = this.ckdealformlist.foreignCompanyContactInformation;
        this.ServesiceService.sofonNosend.emit(this.ckdealformlist.finaSofonQuoation);
        this.dataBase.finaSofonQuoation = this.ckdealformlist.finaSofonQuoation; //sonfon编号
        if (this.dataBase.businessModel == 'DISTRIBUTOR' && this.dataBase.dealerCode) {
          this.ServesiceService.dealerCode.emit(this.dataBase.dealerCode)
        }

        if (foreignCompanyContactInformation) {
          if ((foreignCompanyContactInformation.indexOf(' ') == -1 || foreignCompanyContactInformation.indexOf('-') == -1 || foreignCompanyContactInformation.indexOf('(') == -1) || foreignCompanyContactInformation.indexOf(')') == -1) {
            this.dataBase.foreignTradeCompanyPhone = parseInt(this.ckdealformlist.foreignCompanyContactInformation).toString()//外贸公司电话
          }
          else {
            this.dataBase.foreignTradeCompanyPhone = foreignCompanyContactInformation;
          }
        }
        else {
          this.dataBase.foreignTradeCompanyPhone = foreignCompanyContactInformation;
        }
        this.dataBase.sonfonFile = this.ckdealformlist.sonfonFile;
        this.dataBase.financialProgramme = (this.ckdealformlist.financialSchemeId != "" && this.ckdealformlist.financialSchemeId != null) ? this.ckdealformlist.financialSchemeId : '0'; //金融方案
        this.dataBase.financialProgrammeTxt = this.ckdealformlist.otherFinancialSolutions;//金融方案文本框
        this.dataBase.financialProgrammeCost = this.ckdealformlist.financialProgrammePrice;//金融方案总价格
        this.dataBase.rebateCost = this.ckdealformlist.rebateCost; //rebate金额
        this.dataBase.tradeInCost = this.ckdealformlist.tradeInCost; //tradeIn金额
        this.dataBase.taxrate = this.ckdealformlist.vatRate; //税率
        this.getRateList()
        this.dataBase.paymentmethod = this.ckdealformlist.paymentMethodDescription;//支付方式
        //financialProgrammeCost
        this.dataBase.contractEndDate = standardTime(this.ckdealformlist.ddpValidUntil);
        this.dataBase.ddpStatus = this.isadopt(this.dataBase.contractEndDate, 1);

        this.dataBase.poolEndDate = standardTime(this.ckdealformlist.ddpValidUntil1);
        this.dataBase.contractDdpStatus = this.isadopt(this.dataBase.poolEndDate, 2);
        if (this.dataBase.invoiceInformation == 'USD') {
          const contractBuyer2 = this.poolList.find(val => val.corporateName == this.dataBase.foreignTradeCompany);
          contractBuyer2 && (this.dataBase.contractBuyer2 = contractBuyer2.corporateName);
          this.foreignup();
        }
        this.paymentMethod();
        this.entryModeList = JSON.parse(JSON.stringify(this.entryModeLists));
        if (this.dataBase.businessModel == 'DIRECT') {
          this.dataBase.entryMode = null;
        }
        this.StockOff = ((this.dataBase.entryMode == 'BIDDING' && this.dataBase.endUsers == 'Stock') || this.dataBase.entryMode == 'STOCK') ? false : true;
        if (this.dataBase.businessModel === 'DIRECT') {
          this.dataBase.contractBuyer = this.dataBase.endUser;
          this.dataBase.contractBuyerAddress = this.dataBase.endUserAddress;
          this.dataBase.contractBuyerContacts = this.dataBase.endUserContacts;
          this.dataBase.contractBuyerPhone = this.dataBase.endUserPhone;
          this.dataBase.contractBuyerEmail = this.dataBase.endUserEmail;
          this.validateForm.controls.contractBuyer2.disable();
        } else if (this.dataBase.businessModel === 'DISTRIBUTOR' && this.dataBase.invoiceInformation == 'CNY') {
          // this.dataBase.contractBuyer = this.dataBase.distributor;
          // this.dataBase.contractBuyerAddress = this.dataBase.distributorAddress;
          // this.dataBase.contractBuyerContacts = this.dataBase.distributorContacts;
          // this.dataBase.contractBuyerPhone = this.dataBase.distributorPhone;
          // this.dataBase.contractBuyerEmail = this.dataBase.distributorEmail;
          this.validateForm.controls.contractBuyer2.disable();
        }
        this.getPrebook(this.dataBase.dealFormId);
      }, 0);


      //this.dataBase = Object.assign(this.dataBase, rest.data);

      // this.updateData.emit(this.dataBase);
      this.setColSpanOfConfirmTable();
      this.ngModelChang();
    }
    this.getProduct(this.ckdealformlist.dealFormId);
  }

  public changeDealFormID(): void {
    this.updateDataBaseInfo.emit(this.dataBase);
  }

  public handleCancelCPResult(): void {
    this.isVisibleCPResult = false;
  }

  public jump(result, url, name) {
    this.router.navigate([result], {
      queryParams: {
        url, name
      }
    });
  }
  public next() {
    this.myEvent.emit('complete-tab'); // 传参给父组件;
  }
  // public submitForm = ($event: any, value: any) => {
  //   $event.preventDefault();
  //   for (const key in this.validateForm.controls) {
  //     this.validateForm.controls[key].markAsDirty();
  //     this.validateForm.controls[key].updateValueAndValidity();
  //   }
  //   this.updateDataBaseInfo.emit(value);
  // }

  // public resetForm(e: MouseEvent): void {
  //   e.preventDefault();
  //   this.validateForm.reset();
  //   for (const key in this.validateForm.controls) {
  //     this.validateForm.controls[key].markAsPristine();
  //     this.validateForm.controls[key].updateValueAndValidity();
  //   }
  // }

  public validateConfirmPassword(): void {
    setTimeout(() => this.validateForm.controls.confirm.updateValueAndValidity());
  }
  public userNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      setTimeout(() => {
        if (control.value === 'JasonWood') {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      }, 1000);
    })

  public confirmValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.validateForm.controls.password.value) {
      return { confirm: true, error: true };
    }
    return {};
  }


  // 判断业务模式 移除指定控制器
  ifBusinessModel() {
    /*业务模式为 Direct Deal  删除经销商*/
    if (this.dataBase && this.dataBase.businessModel === 'DIRECT') {
      this.validateForm.get('distributor')!.clearValidators(); // 经销商
      this.validateForm.get('ddpStatus')!.clearValidators(); // DDP-Status

      this.validateForm.get('poolEndDate')!.clearValidators(); //外贸公司DDP-Status截止日期
      this.validateForm.get('distributorAddress')!.clearValidators(); // 经销商地址
      this.validateForm.get('distributorContacts')!.clearValidators(); // 经销商联系人
      this.validateForm.get('distributorPhone')!.clearValidators(); // 经销商电话
      this.validateForm.get('distributorEmail')!.clearValidators(); // 经销商邮箱
      this.validateForm.get('orderSignName')!.clearValidators(); // 采购订单签署人
      this.validateForm.get('orderSignPost')!.clearValidators(); // 采购订单签署人职务
      /*添加合同买方*/
      this.validateForm.get('contractBuyer')!.setValidators(Validators.required); // 合同买方
      this.validateForm.get('contractBuyerAddress')!.setValidators(Validators.required); // 合同买方地址
      this.validateForm.get('contractSignatory')!.setValidators(Validators.required); // 合同签署人
      this.validateForm.get('contractSignatoryPost')!.setValidators(Validators.required); // 采购订单签署人职务
      this.validateForm.get('agreementNo')!.clearValidators(); //经销商协议号


    } else {
      /*业务模式为 DISTRIBUTOR  添加经销商*/
      this.validateForm.get('distributor')!.setValidators(Validators.required);
      this.validateForm.get('ddpStatus')!.setValidators(Validators.required);
      this.validateForm.get('contractEndDate')!.setValidators(Validators.required);
      this.validateForm.get('poolEndDate')!.setValidators(Validators.required);
      this.validateForm.get('distributorAddress')!.setValidators(Validators.required);
      this.validateForm.get('distributorContacts')!.setValidators(Validators.required);
      this.validateForm.get('distributorPhone')!.setValidators([Validators.required, this.checkPhone]);
      this.validateForm.get('distributorEmail')!.setValidators([Validators.required, this.cheakMail]);
      this.validateForm.get('orderSignName')!.setValidators(Validators.required);
      this.validateForm.get('orderSignPost')!.setValidators(Validators.required);
      /*删除合同买方*/
      this.conTable && this.validateForm.get('agreementNo')!.setValidators(Validators.required); //经销商协议号
      this.validateForm.get('contractBuyer')!.clearValidators(); // 合同买方
      this.validateForm.get('contractBuyerAddress')!.clearValidators(); // 合同买方地址
      this.validateForm.get('contractSignatory')!.clearValidators(); // 合同签署人
      this.validateForm.get('contractSignatoryPost')!.clearValidators(); // 采购订单签署人职务

    }
    if (this.dataBase && this.dataBase.businessModel === 'DIRECT' && this.dataBase.invoiceInformation === 'USD') {
      this.validateForm.get('contractEndDate')!.clearValidators(); //经销商DDP-Status截止日期
      this.validateForm.get('poolEndDate')!.setValidators(Validators.required);
    }
    else if (this.dataBase && this.dataBase.businessModel === 'DIRECT' && this.dataBase.invoiceInformation === 'CNY') {
      this.validateForm.get('contractEndDate')!.clearValidators();
      this.validateForm.get('poolEndDate')!.clearValidators();
    }
    else if (this.dataBase && this.dataBase.businessModel === 'DISTRIBUTOR' && this.dataBase.invoiceInformation === 'USD') {
      this.validateForm.get('contractEndDate')!.setValidators(Validators.required);
      this.validateForm.get('poolEndDate')!.setValidators(Validators.required);
    }
    else if (this.dataBase && this.dataBase.businessModel === 'DISTRIBUTOR' && this.dataBase.invoiceInformation === 'CNY') {
      this.validateForm.get('contractEndDate')!.setValidators(Validators.required);
      this.validateForm.get('poolEndDate')!.clearValidators();
    }
    this.validateForm.get('poolEndDate')!.updateValueAndValidity();
    this.validateForm.get('contractEndDate')!.updateValueAndValidity();
    this.validateForm.get('agreementNo')!.updateValueAndValidity();
  }

  // 判断业务模式和币制
  ifInvoiceInformation() {
    /*业务模式为 Direct Deal*/
    if (this.dataBase && this.dataBase.businessModel === 'DIRECT') {
      if (this.dataBase && this.dataBase.invoiceInformation === 'CNY') {
        /*人民币*/
      } else if (this.dataBase && this.dataBase.invoiceInformation === 'USD') {
        /*美元*/
      }
    } else if (this.dataBase && this.dataBase.businessModel === 'DISTRIBUTOR') {
      /*业务模式为 Distributor Deal*/
      /*人民币*/
      if (this.dataBase && this.dataBase.invoiceInformation === 'CNY') {

      } else if (this.dataBase && this.dataBase.invoiceInformation === 'USD') {
        /*美元*/

      }
    }
  }
  ifForeignTradeCompany() {
    /* 币制 为 人民币 */
    /* 外贸公司不显示 */
    if (this.dataBase && this.dataBase.invoiceInformation === 'CNY') {
      /* 删除外贸公司验证 */
      this.validateForm.get('poolEndDate')!.clearValidators(); // 外贸公司
      this.validateForm.get('foreignTradeCompany')!.clearValidators(); // 外贸公司
      this.validateForm.get('foreignTradeCompanyAddress')!.clearValidators(); // 外贸公司地址
      this.validateForm.get('foreignTradeCompanyContacts')!.clearValidators(); // 外贸公司联系人
      this.validateForm.get('foreignTradeCompanyPhone')!.clearValidators(); // 外贸公司电话
      this.validateForm.get('foreignTradeCompanyEmail')!.clearValidators(); // 外贸公司邮箱
      this.validateForm.get('importAgreementSignName')!.clearValidators(); // 合同签署人
      this.validateForm.get('importAgreementSignPost')!.clearValidators(); // 合同签署人职务
      this.validateForm.get('contractDdpStatus')!.clearValidators(); // DDP-Status //contractDdpStatus
      this.validateForm.get('billingInfor')!.setValidators(Validators.required);
      this.validateForm.get('accountName')!.setValidators(Validators.required);
      this.validateForm.get('bankName')!.setValidators(Validators.required);
      this.validateForm.get('accountNo')!.setValidators(Validators.required);
      this.validateForm.get('taxNumber')!.setValidators([Validators.required, this.taxNumberCheck]);
      this.validateForm.get('accountAddress')!.setValidators(Validators.required);
      this.validateForm.get('addressee')!.setValidators(Validators.required);
      this.validateForm.get('addresseeTel')!.setValidators([Validators.required, this.checkPhone]);
      return false;
    } else {
      /* 添加外贸公司验证 */
      this.validateForm.get('foreignTradeCompany')!.setValidators(Validators.required); // 外贸公司
      this.validateForm.get('foreignTradeCompanyAddress')!.setValidators(Validators.required); // 外贸公司地址
      this.validateForm.get('foreignTradeCompanyContacts')!.setValidators(Validators.required); // 外贸公司联系人
      this.validateForm.get('foreignTradeCompanyPhone')!.setValidators([Validators.required, this.checkPhone]); // 外贸公司电话
      this.validateForm.get('foreignTradeCompanyEmail')!.setValidators([Validators.required, this.cheakMail]); // 外贸公司邮箱
      this.validateForm.get('importAgreementSignName')!.setValidators(Validators.required); // 合同签署人
      this.validateForm.get('importAgreementSignPost')!.setValidators(Validators.required); // 合同签署人职务
      this.validateForm.get('contractDdpStatus')!.setValidators(Validators.required); // DDP-Status
      this.validateForm.get('billingInfor')!.clearValidators();
      this.validateForm.get('accountName')!.clearValidators();
      this.validateForm.get('bankName')!.clearValidators();
      this.validateForm.get('accountNo')!.clearValidators();
      this.validateForm.get('taxNumber')!.clearValidators();
      this.validateForm.get('accountAddress')!.clearValidators();
      this.validateForm.get('addressee')!.clearValidators();
      this.validateForm.get('addresseeTel')!.clearValidators();
    }
    if (this.dataBase.entryMode == 'STOCK') {
      this.validateForm.get('importAgreementSignPost')!.clearValidators(); // 合同签署人职务
    }
    this.validateForm.get('poolEndDate')!.updateValueAndValidity();
    this.validateForm.get('foreignTradeCompany')!.updateValueAndValidity();
    this.validateForm.get('foreignTradeCompanyAddress')!.updateValueAndValidity(); // 外贸公司地址
    this.validateForm.get('foreignTradeCompanyContacts')!.updateValueAndValidity();
    this.validateForm.get('foreignTradeCompanyPhone')!.updateValueAndValidity();
    this.validateForm.get('foreignTradeCompanyEmail')!.updateValueAndValidity();
    this.validateForm.get('importAgreementSignName')!.updateValueAndValidity();
    this.validateForm.get('importAgreementSignPost')!.updateValueAndValidity();
    this.validateForm.get('contractDdpStatus')!.updateValueAndValidity();
    this.validateForm.get('billingInfor')!.updateValueAndValidity();
    this.validateForm.get('accountName')!.updateValueAndValidity();
    this.validateForm.get('bankName')!.updateValueAndValidity();
    this.validateForm.get('accountNo')!.updateValueAndValidity();
    this.validateForm.get('taxNumber')!.updateValueAndValidity();
    this.validateForm.get('accountAddress')!.updateValueAndValidity();
    this.validateForm.get('addressee')!.updateValueAndValidity();
    this.validateForm.get('addresseeTel')!.updateValueAndValidity();
    return true;
  }

  // 外贸公司是否与经销商相同
  ChangForeign() {

    if (this.dataBase.sameFlag === '1') {
      // 将经销商信息赋值给外贸公司
      const ASYNS = async () => {

        this.dataBase.foreignTradeCompany = this.dataBase.distributor;
        this.dataBase.contractDdpStatus = this.dataBase.ddpStatus;
        this.dataBase.poolEndDate = this.dataBase.contractEndDate;
        this.dataBase.foreignTradeCompanyAddress = this.dataBase.distributorAddress;
        this.dataBase.foreignTradeCompanyContacts = this.dataBase.distributorContacts;
        this.dataBase.foreignTradeCompanyPhone = this.dataBase.distributorPhone;
        this.dataBase.foreignTradeCompanyEmail = this.dataBase.distributorEmail;
        this.dataBase.importAgreementSignName = this.dataBase.orderSignName;
        this.dataBase.importAgreementSignPost = this.dataBase.orderSignPost;

      await this.getPoolList();
      this.foreignup()
      }
      ASYNS()

    }
  }

  // 选中dealform
  changDealForm(index, data) {

    this.dealformlist.map(res => {
      res.radio = false;
    });
    data.radio = true;
    this.currId = data.id;
    this.ckdealformlist = data;
    // console.log(this.ckdealformlist);

  }
  //查询dealfromid
  GetDealLists(param) {
    return new Promise((resolve, reject) => {
      this.http.get(`/act/preparation/queryCp?dealFormId=` + param).subscribe(e => {
        resolve(e.data[0]);
        if (e.data && e.data.length > 0) {
          this.currId = e.data[0].id;
        }
      })
    })
  }
  // 查询
  GetDealList() {
    this.deal_load = true;
    this.box = true;
    this.http.get(`/act/preparation/queryCp?dealFormId=` + this.dealFormIdinput).subscribe(e => {
      this.deal_load = false;
      if (e.data) {
        this.dealformlist = e.data;
        if (this.dealformlist.length > 0) {
          this.dealformlist.find(vals => {
            if (vals.id == this.currId) {
              vals.radio = true;
              //  vals.isDisable=true;
            }
          })
          if (this.dealformlist.length == 1) {
            this.ckdealformlist = this.dealformlist[0];
            this.ckdealformlist.radio = true;
          }
        }
        //if (e.data.length === 0) {
        // this.message.create('warning', 'dealFormId不存在');
        //}
      }
    }, error => {
      this.deal_load = false;
    });
  }

  /*投标申请表链接眼*/
  getWinUrl() {
    const url = '/act/preparation/getMainId';
    let par = {
      jdChildMainId: this.mainId
    };
    this.http.post(url, par).subscribe(e => {
      if (e.data) {
        this.mainid_winList = e.data;
      }
    });
  }
  toWin(item) {
    if (item.taskStatus && item.taskStatus === 'YZBQRDBCWJ') {
      window.open(location.origin + environment.base_href + '/#/' + 'support-up?id=' + codeString(item.zbMainId) + '&flag=1' + '&status=' + item.taskStatus);
    } else {
      window.open(location.origin + environment.base_href + '/#/' + 'winning?id=' + codeString(item.zbMainId) + '&flag=1' + '&status=' + item.taskStatus);
    }
  }
  //装运及交货
  public shipmentDeliverySelect(event) {
    if (event == '0') {
      this.dataBase.shipmentDeliveryRemarks = "";
      this.dataBase.shipmentDeliveryFileName = "";
      this.shipmentDeliveryList = [];
    }
  }
  //安装，验收及保修
  public installationWarrantySelect(event) {
    if (event == '0') {
      this.dataBase.installationWarrantyRemarks = "";
      this.dataBase.installationWarrantyFileName = "";
      this.installationWarrantyList = [];
    }

  }
  //场地准备
  public sitePreparationSelect(event) {
    if (event == '0') {
      this.dataBase.sitePreparationRemarks = "";
      this.dataBase.sitePreparationFileName = "";
      this.sitePreparatList = [];
    }
  }
  //履约保函
  public performanceBondSelect(event) {
    if (event == '0') {
      this.dataBase.performanceBondRemarks = "";
      this.dataBase.performanceBondFileName = "";
      this.performanceBondList = [];
    }
  }
  //是否有售后限价
  public afterSalesSelect(event) {
    if (event == '0') {
      this.dataBase.afterSalesRemarks = "";
      this.dataBase.afterSalesFileName = "";
      this.afterSalesList = [];
    }
  }
  //直投订单合同金额和中标金额有价差
  public amountDifferenceSelect(event) {
    if (event == '0') {
      this.dataBase.amountDifferenceRemarks = "";
      this.dataBase.amountDifferenceFileName = "";
      this.amountDifferenceList = [];
    }
  }
  //支持文件缺失需特批进单
  public supportFileMissingSelect(event) {
    if (event == '0') {
      this.dataBase.supportFileMissingRemarks = "";
      this.dataBase.supportFileMissingFileName = "";
      this.supportFileMissingList = [];
    }
  }
  // 查看最终用户编号
  public showDiag () {
    this.dealshow.data = [];
    const dealerAgreementNo = this.dataBase.agreementNo;
    this.isAgres = true;
    // 经销商协议号 可以操作查询实时ie pool数据
    if (!this.disa) {
      const select = this.dealList.find(val => dealerAgreementNo === val.agreementNo);
      if (select) {
        const obj = {
          authorizedArea: select.authorizedArea,
          authorizedProduct: select.authorizedProduct
        };
        this.dealshow.data.push(obj);
        this.ServesiceService.dealTable.emit(this.dealshow);
      }
    } else if (this.dataBase && this.dataBase.preparationProductCompany) {
      // 经销商协议号 禁用查询数据库保存值
      const obj = {
        authorizedArea: this.dataBase.preparationProductCompany.authorizedArea,
        authorizedProduct: this.dataBase.preparationProductCompany.authorizedProduct
      };
      this.dealshow.data.push(obj);
      this.ServesiceService.dealTable.emit(this.dealshow);
    }

  }
  //取消弹出窗口
  public isAgreCancels() {
    this.isAgres = false;
  }
  //支持文件缺失按钮是否禁用问题
  public supportFileMissingFlag() {

    const state = this.activatedRouter.queryParams['_value'].status;
    let flag = false;
    if (state === 'DHTOASH') {
      if ((this.dataBase.biddingDocuments == '' || this.dataBase.biddingDocuments == null || this.dataBase.biddingDocuments == undefined) && this.dataBase.tenderNo != '其他类型') {
        flag = true;
      }
      if ((this.dataBase.tenderDocuments == '' || this.dataBase.tenderDocuments == null || this.dataBase.tenderDocuments == undefined) && this.dataBase.tenderNo != '其他类型') {
        flag = true;
      }
      if ((this.dataBase.endUserContract == '' || this.dataBase.endUserContract == null || this.dataBase.endUserContract == undefined) && this.dataBase.businessModel != 'DIRECT') {
        flag = true;
      }
      if ((this.dataBase.projectAnalysisTable == '' || this.dataBase.projectAnalysisTable == null || this.dataBase.projectAnalysisTable == undefined) && this.dataBase.businessModel == 'DISTRIBUTOR') {
        flag = true;
      }
      (this.dataBase.supportFileMissing == '1' && !flag) && this.validateForm.controls.supportFileMissing.enable();
    }
  }
  public upmode = true;

  public switchValid = true;

  //   sofon文件选择框
  public isVisible = false;
  public isVisibleSofon: boolean = false;

  // tslint:disable-next-line:variable-name
  public configFile_ClassType: String = '/simulationConf';
  // tslint:disable-next-line:variable-name
  public sofonFile_ClassType: String = '/SofonOAReturnDoc,SofonOAReturnXml';
  public sonfonFile:any=[];

  public files: any = {
    thelist: []
  };
  public fileChecked: String[]; // 选中的文件数组
  public changeupmode(mode): void {
    this.upmode = !mode;
    this.dataBase.sofonName = '';
    this.dataBase.sofonNames = '';
    this.dataBase.sofonNameFileList = [];
  }
  @ViewChild('tranfSingle')tranfSingle; //调用Sofon
  // 对话框事件方法
  public showModal(): void {
    this.isVisible = true;
    this.getfilelist();
  }
  log(value: string[]): void {
    this.fileChecked = value;
  }
  public getfilelist() {
    const dealFormId = this.dataBase.dealFormId;
    if (dealFormId != '' && dealFormId != undefined && dealFormId != null) {
      this.http.get(`/act/preparation/getAttachmentFromCP/` + dealFormId + this.sofonFile_ClassType).subscribe((res => {
        for (let i = 0; i < res.data.length; i++) {
          this.files.thelist[i] = res.data[i];
        }
      }), error => {

      });
    } else {
      this.message.create('error', '请先查询dealFormId');
    }
  }
  // 上传sofon文件
  public sofonNameBeforeUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    this.upload('sofonNameFileList', file, 'sofonFile');
    return false;
  }
  // 删除sofon文件
  public nzRemovsofonName = (file: UploadFile): any => {
    this.dataBase.sofonFile = '';
    return true;
  }
  public handleCancelSofon(): void {
    this.isVisibleSofon = false;
  }
  public handleOkSofon(): void {

    if(this.tranfSingle.checkOptionsOne.length<1)
    {
      this.message.create('warning', '请选择Sofon文件');
      return;
    }
    this.dataBase.sofonName = this.tranfSingle.checkOptionsOne[0].sofonFile;
    this.dataBase.sofonNameurl = this.tranfSingle.checkOptionsOne[0].sofonFileUrl;
    this.tranfSingle.radioValue = '1';
    this.tranfSingle.checkOptionsOne = [];
    this.isVisibleSofon = false;
  }
  handleCancel(): void {
    this.isVisible = false;
  }
  handleOk(): void {
    // 只选一个文件时不打包
    if (this.fileChecked != null && this.fileChecked.length == 1){
      this.http.get('/act/system/upload/cp/' + this.fileChecked[0]).subscribe((res1 => {
        if (res1.code == '0000') {
          // this.uploadZipFileName = res1.data.FileName;
          this.dataBase.sofonFileName = res1.data.FileName;
          this.dataBase.sofonFile = res1.data.FileId;
          this.message.create('success', '文件上传成功！');
        }
      }), error => {
        this.message.create('error', '文件上传失败！');
      });

      this.isVisible = false;
    }// 多选文件打包
    else if (this.fileChecked != null && this.fileChecked.length > 1) {
      // ======================================  上传sofon文件
      this.http.post('/act/system/upload/cp', this.fileChecked).subscribe((res1 => {
        if (res1.code == '0000') {
          // this.uploadZipFileName = res1.data.FileName;
          this.dataBase.sofonFileName = res1.data.FileName;
          this.dataBase.sofonFile = res1.data.FileId;
          this.message.create('success', '文件上传成功！');
        }
      }), error => {
        this.message.create('error', '文件上传失败！');
      });


      this.isVisible = false;
    }else {
      this.message.create('error', '请选择文件！');
    }

  }
}
