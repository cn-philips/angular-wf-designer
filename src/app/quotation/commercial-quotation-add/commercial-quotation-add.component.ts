import { Component, OnInit, ViewChild, ViewChildren, ElementRef, QueryList, ViewEncapsulation} from '@angular/core';
import { FormControl, FormGroup, Validators, NgModel } from "@angular/forms";
import {FieldType} from '@ngx-formly/core';
import { CommercialOrderService, GlobalService, HttpService, NgxDatatableService, FileService, PdfmakeService, TooltipService, AcceptTermService, UtilityService, QuotationCalcService } from '../../services';
import {ApprovalSimpleModalComponent} from '../../approval-simple-modal/approval-simple-modal.component';
import {QuotationLicenseModalComponent} from '../quotation-license-modal/quotation-license-modal.component';
import {NgbModal, NgbModalRef, ModalDismissReasons, NgbDate} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {QuotationFormModel} from './QuotationForm.model';
import {instantiateDefaultStyleNormalizer} from '@angular/platform-browser/animations/src/providers';
import {Subject, Observable, of, concat} from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, tap, catchError, filter, takeUntil} from 'rxjs/operators';
import {HttpClient, HttpEvent, HttpRequest, HttpResponse} from '@angular/common/http';
import {saveAs} from 'file-saver';
import {UUID} from 'angular2-uuid';
import { ContractExportModalComponent } from '../..//my-task/contract-export-modal/contract-export-modal.component';
import 'url-search-params-polyfill';
import { getRenderedText } from '@angular/core/src/render3';
import { readdir, truncate } from 'fs';
import { SmallSimpleModalComponent } from '../../component/small-simple-modal/small-simple-modal.component';

import * as JSZip from 'jszip';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-commercial-quotation-add',
  templateUrl: './commercial-quotation-add.component.html',
  styleUrls: ['./commercial-quotation-add.component.scss']
})
export class CommercialQuotationAddComponent extends FieldType implements OnInit {

  //upload progress related
  progressCount: number = 0;

  /** new code starts */
  isHidden: boolean = true;
  orderType: string = '0';
  isStandard:boolean = true; //是否标准进单
  isZhitou: boolean = false; //是否直投
  isUsd: boolean = true;
  // matchOrderType: boolean = false;

  paymentTypeSelect: any = []; //支付方式
  isOtherPaymentType: boolean = false; //是否支付方式为其他
  quotationListWBS: any = [];
  wbstableFields: boolean = false; //是否显示wbs表单
  sofonFields: boolean = false; //是否显示sofon号
  otherFeesFields: boolean = false; //是否显示经销商其他费用计算实际利润相关
  oaAttachedFilesFields: boolean = false; //是否显示OA上传附件文件
  oaAppendedFilesFields: boolean = false; //是否显示OA补充附件文件
  distributorDisableFlag: boolean = false; //经销商信息是否可编辑
  soNumberFields: boolean = false; //是否显示SO Number
  agreementNoSelectFields: boolean = false; //是否显示协议号多选选择框
  agreementNoSelect: any = []; //商机号选择
  selectedAgreemenNo: any = [];
  tradeTermSelect: any = []; //贸易术语选择
  tradeTermSelectFields: boolean = false;
  oitDateFields: boolean = false;
  igmFields:boolean = false;
  igmchangeFlag:boolean = false;
  redoInitCount: number = 0;

  @ViewChild('otherSupportFilesInput') otherSupportFilesInput: ElementRef;
  @ViewChild('oaAttachedFilesInput') oaAttachedFilesInput: ElementRef;
  @ViewChild('importAgreementFilesInput') importAgreementFilesInput: ElementRef;
  @ViewChild('purchaseOrderFilesInput') purchaseOrderFilesInput: ElementRef;
  @ViewChild('paymentProofFilesInput') paymentProofFilesInput: ElementRef;
  @ViewChild('sofonWordFilesInput') sofonWordFilesInput: ElementRef;
  @ViewChild('sofonPdfFilesInput') sofonPdfFilesInput: ElementRef;
  @ViewChild('exportVerificationFilesInput') exportVerificationFilesInput: ElementRef;
  @ViewChild('otherFilesInput') otherFilesInput: ElementRef;
  @ViewChildren('commercialTag', { read: NgModel }) commercialInputs: QueryList<NgModel>;

  /** new code ends */

  /** from special quotation add starts */
  salesGroupSelect = [];
  purchaseTypeSelect = [];
  solutionTypeSelect = [];
  disabled: boolean = false;
  customDisabled: object = {};
  customRequired: object = {};
  quotationSelected = [];
  quotationForm: QuotationFormModel = new QuotationFormModel();
  clinicalSelectSet = new Set();
  productSelectSet = new Set();
  quotationSelectSet = new Set();
  hospitaldepartmentList: any;
  selectLevelOther: boolean;
  clinicalProductMap: object = {};
  clinicalProductQuotationMap: object = {};
  clinicalProductQuotationIdMap = {};
  selectLevelOneValue = new Set();
  selectLevelTwoValue = new Set();
  selectClinicalValue: string;
  selectProductValue: string;
  selectQuotationValue: string;
  selectQuotationIdValue: string;
  selectQuotationId: string;
  selectLevelOneClassificationValue: string;
  selectLevelTwoClassificationValue: string;
  levelTwoResult: string;
  selectLevelOtherClassificationValue: string;
  getCellClass = this.ngxDatatableService.getCellClass;
  getHeaderClass = this.ngxDatatableService.getHeaderClass;
  getAlignToRightClass = this.ngxDatatableService.getAlignToRightClass;
  pub: string = '';
  enduserList = [];
  distributorList = [];//TODO del
  currencyType: string = '';
  ctpFields: boolean = false;
  ctpSingleFields: boolean = false;
  //crm商机号模糊查询相关
  oppoIdSelect$: Observable<any[]>; //商机号列表
  oppoIdSelectLoading = false;
  oppoIdSelectInput$ = new Subject<string>();

  //最终用户名称模糊查询相关
  hospital$: Observable<any[]>;
  hospitalLoading = false;
  hospitalInput$ = new Subject<string>();
  //经销商名称模糊查询相关
  distributor$: Observable<any[]>;
  distributorLoading = false;
  distributorInput$ = new Subject<string>();
  imeFlag: boolean = true;
  isAdding: boolean = false;
  usdRate: string = '6.6';
  testbb:boolean = true;

  /** from special quotation add ends */

  /** P2 added */
  version: string = '';
  contractNumberFields: boolean = false;
  salesSapCodeFields: boolean = false;
  enduserSapCodeFields: boolean = false;
  customerSapCodeFields: boolean = false;
  distributorSapCodeFields: boolean = false;
  tipsFields: boolean = false;
  importProtocolNumberFields: boolean = false;
  purchaseOrderNumberFields: boolean = false;
  //sales名称模糊查询相关
  salesCode1: string;
  sales$: Observable<any[]>;
  salesLoading = false;
  salesInput$ = new Subject<string>();
  salesTmpList = [];
  //tooltips json
  ttRaw: any = {};
  otherSupportFilesTooltip: string = 'otherSupportFiles';
  rddMaxDate: any;
  pricingLabelFields: boolean = false;
  omLabelFields: boolean = false;

  //20200601 可以修改设备总价
  editingCell: any = {};
  unitTotalPriceEditable: boolean = false;

  constructor(private commercialOrderService: CommercialOrderService,
              private http: HttpService,
              private modalService: NgbModal,
              private ngxDatatableService: NgxDatatableService,
              private toastrService: ToastrService,
              private el:ElementRef,
              private fileService: FileService,
              private globalService: GlobalService,
              private pdfmakeService: PdfmakeService,
              private tooltipService: TooltipService,
              private acceptTermService: AcceptTermService,
              private utilityService: UtilityService,
              private quotationCalcService: QuotationCalcService) {

    super();
    this.initMisc();
    this.initTooltips();
    this.acceptTermService.acceptTermsHiddenChange(true);
  }


  ngOnInit() {
    //file upload progress control
    this.fileService.progressSubject.subscribe(res => {
      this.progressCount = res as number;
    });

    this.acceptTermService.acceptTermsHiddenChange(this.isHidden);
    console.log(this.formControl.value);
    /** new code starts */
    if (this.isHidden){
      this.commercialOrderService.isOrderTypeCompletedChange.subscribe(res => {
        this.isHidden = !res;
        this.acceptTermService.acceptTermsHiddenChange(this.isHidden);
        this.initThreeBooleanFlag();
        //todo
        if (!this.isHidden){
          this.redoInitCount += 1;
          this.updateMyself();
          return;
        }
      });


      this.commercialOrderService.specialOrderDataChange.subscribe(res => {

        let rawDraft;
        if (typeof (res) === 'object') {
          rawDraft = res;
        } else {
        rawDraft = JSON.parse(res);
        }

        const rawFormData = JSON.parse(rawDraft['formData']);
        const rawQuotationadd = JSON.parse(rawFormData['quotationadd']);
        const rawQuotationBaseInfo = rawQuotationadd['quotationBaseInfo'];
        const rawQuotationList = rawQuotationadd['quotationList'];
        const rawTotalAllList = rawQuotationadd['totalAllList'];
        // let rawQuotationadd = JSON.parse(rawFormData['quotationBaseInfo']);
        this.quotationForm.quotationBaseInfo = {...this.quotationForm.quotationBaseInfo, ...rawQuotationBaseInfo};
        this.quotationForm.quotationList = [...this.quotationForm.quotationList, ...rawQuotationList];
        this.quotationForm.totalAllList = [...this.quotationForm.totalAllList, ...rawTotalAllList];
        // 承诺勾选 从特价审批带出的承诺文本需要清空
        if(this.quotationForm.quotationBaseInfo && this.quotationForm.quotationBaseInfo.acceptTerm) {
          this.quotationForm.quotationBaseInfo.acceptTerm = undefined;
        }
        this.elementsChanged();
        // console.log('quotationForm',this.quotationForm);
      });
    }


    if (this.model && this.model['selectordertype']) {
      let selectordertype = JSON.parse(this.model['selectordertype']);
      if (selectordertype['isCompleted']) {
        this.isHidden = !selectordertype['isCompleted'];
        this.acceptTermService.acceptTermsHiddenChange(this.isHidden);
      }

      if (selectordertype['orderType']) {
        this.orderType = selectordertype['orderType'];
      }
    }

    // console.log('commercial-quotataion-add', this.formState);
    /** new code ends */

    /** from special quotation add starts */
    this.disabled = this.formControl.disabled;
    console.log('ngOnInit', this.disabled);
    //Init Quotation Select Page
    this.initQuotationSelectComponent();
    if (this.formControl.value) {
      const values = JSON.parse(this.formControl.value);

      this.quotationForm = {
        ...this.quotationForm,
        ...values
      };
      this.currencyType = this.quotationForm['quotationBaseInfo']['currencyType'] == null ? '' : this.quotationForm['quotationBaseInfo']['currencyType'];

      //勾选承诺 初始化
      if (this.quotationForm.quotationBaseInfo && this.quotationForm.quotationBaseInfo.acceptTerm) {
        const acceptTermDefault = this.quotationForm.quotationBaseInfo.acceptTerm;
        if (acceptTermDefault.length > 0) {
          this.acceptTermService.acceptTermsChange(acceptTermDefault);
        }
      } else {
        this.acceptTermService.acceptTermsChange([]);
      }

    } else {// version init here
      //version2 init start
      this.quotationForm.quotationBaseInfo.version = '2';
      this.quotationForm.quotationBaseInfo.isPrivate = 0;
      //version2 init end
    }

    //set version for page use
    this.version = this.quotationForm.quotationBaseInfo.version ? this.quotationForm.quotationBaseInfo.version : '';

    //勾选承诺 订阅更新
    this.acceptTermService.acceptTermChanged.subscribe(res => {
      if (res && res.length > 0) {
        this.quotationForm.quotationBaseInfo.acceptTerm = res;
        this.elementsChanged();
      }
    });

    console.log('quotationForm',this.quotationForm);
    //initHiddenFields
    this.initHiddenUIFields();

    //客户字典相关
    this.loadHospital();
    this.loadDistributor();

    /** from special quotation add ends */

    /** new code starts */
    this.purchaseTypeRefactor();

    this.loadOppoIdSelect();
    this.loadPaymentTypeSelect();

    //标准or特价；直投or非直投；美金or人民币
    this.initThreeBooleanFlag();

    //要求安装日期设置不能选大于当天之后180天自然日的时间
    this.rddMaxDate = this.utilityService.getNgbdatepickerFormatDate(180);

    //协议号多选框相关
    //直投时没有协议号
    if (this.agreementNoSelectFields) {
      this.selectedAgreemenNo = [];

      if (this.quotationForm.quotationBaseInfo.agreementNo && '' !== this.quotationForm.quotationBaseInfo.agreementNo) {
        let agreementNoArr = this.quotationForm.quotationBaseInfo.agreementNo.split(',');
        for (let item of agreementNoArr) {
          this.selectedAgreemenNo.push({ 'AgreementNo': item });
        }
      }

      if (!this.isZhitou && this.quotationForm.quotationBaseInfo.distributorId && '' !== this.quotationForm.quotationBaseInfo.distributorId) {
        //主数据中的DMSID都为大写英文字母
        let dmsid = this.quotationForm.quotationBaseInfo.distributorId.toUpperCase();
        this.http.post('/act/masterdata/queryJsonByCondition/dealerinfo', {
          'status': '1',
          'DMSID': dmsid
        }).subscribe(res => {
          if('0000' == res.code) {
            this.agreementNoSelect = JSON.parse(res['data']);
          }
        });
      }
    }

    if(this.wbstableFields) {
      this.initQuotationListWBS();//wbs表单
      let wbsSet = this.getWbsSet();
      if(wbsSet.size > 0) {
        this.getGiDataByWbsSet(wbsSet);
      }
    }
    // this.initQuotationListWBS();//wbs表单

    // console.log(this.formControl);
    // console.log(this.model);


    //初始化特价带出进单时进行部分数据自动获取
    if (!this.isStandard && !this.isHidden) {
      //经销商信息
      if (this.quotationForm.quotationBaseInfo.distributorName &&
        null == this.quotationForm.quotationBaseInfo.distributorAddress) {
        let event = {
          NameCN: this.quotationForm.quotationBaseInfo.distributorName,
          ID: this.quotationForm.quotationBaseInfo.distributorId
        };
        this.getDistributorInfo(event);
        //预计经销商利润单格显示
        this.updateExpectDealerMargin();
      }

      //单quotation合计价格
      this.updateSumPrice();

      //quotation列表显示igm
      this.updateDefaultIgm();
    }

    if (this.igmFields) {
      this.updateDefaultIgm();
      console.log('igm init', this.quotationForm);
    }


    /** new code ends */

    // console.log('ll', this.quotationForm.quotationBaseInfo.oitDate);
  }
  //ngOnInit ends

  /** from special quotation add starts */
  initCustomDisabled(flag?: boolean) {
    // console.log('initCustomDisabled', '');
    this.customDisabled = {
      ctp: true,
      ctpRatio: true,
      ctpall: true,
      ctpallRatio: true,
      sofon: true,
      oaAttachedFiles: true,
      oaAppendedFiles: true,
      otherFees: true,
      soNumber: true,
      agreementNo: true,
      tradeTerm: true,
      wbstable: true,
      oitDate: true,
      contractNumber: true, //P2 added
      salesSapCode: true, //P2 added
      enduserSapCode: true, //P2 added
      customerSapCode: true, //P2 added
      distributorSapCode: true, //P2 added
      tips: true, //P2 added
      importProtocolNumber: true, //P2 added
      purchaseOrderNumber: true, //P2 added
      opportunityIdAlt: true, //P2 added
      pricingLabel: true, //P2 added
      omLabel: true, //P2 added
    };

    this.customRequired = { // P2 added
      salesSapCode: false, //P2 added
      enduserSapCode: false,
      customerSapCode: false,
      distributorSapCode: false,
      tips: false,
      importProtocolNumber: false,
      purchaseOrderNumber: false,
    };

    if(flag === true) return;//我的任务（已办）

    const formState = this.options.formState;
    if (formState) {
      this.customDisabled['ctpall'] = formState['ctptotal'] ? formState['ctptotal']['readonly'] : true;
      this.customDisabled['ctpallRatio'] = formState['ctptotal'] ? formState['ctptotal']['readonly'] : true;
      this.customDisabled['ctp'] = formState['ctpsingle'] ? formState['ctpsingle']['readonly'] : true;
      this.customDisabled['ctpRatio'] = formState['ctpsingle'] ? formState['ctpsingle']['readonly'] : true;
      this.customDisabled['sofon'] = formState['sofon'] ? formState['sofon']['readonly'] : true;
      this.customDisabled['oaAttachedFiles'] = formState['oaattachedfiles'] ? formState['oaattachedfiles']['readonly'] : true;
      this.customDisabled['oaAppendedFiles'] = formState['oaappendedfiles'] ? formState['oaappendedfiles']['readonly'] : true;
      this.customDisabled['otherFees'] = formState['otherfees'] ? formState['otherfees']['readonly'] : true;
      this.customDisabled['soNumber'] = formState['sonumber'] ? formState['sonumber']['readonly'] : true;
      this.customDisabled['agreementNo'] = formState['agreementnoselect'] ? formState['agreementnoselect']['readonly'] : true;
      this.customDisabled['tradeTerm'] = formState['tradetermselect'] ? formState['tradetermselect']['readonly'] : true;
      this.customDisabled['wbstable'] = formState['wbstable'] ? formState['wbstable']['readonly'] : true;
      this.customDisabled['oitDate'] = formState['oitdate'] ? formState['oitdate']['readonly'] : true;
      this.customDisabled['opportunityIdAlt'] = formState['opportunityidalt'] ? formState['opportunityidalt']['readonly'] : (this.disabled); //隐藏ui: 仅用于控制是否在后续审批节点是否可编辑
      //设置oit date 默认值为当前日期
      if (this.oitDateFields && !this.quotationForm.quotationBaseInfo.oitDate && !this.customDisabled['oitDate']) {
        let date = new Date();
        this.quotationForm.quotationBaseInfo.oitDate = {
          year : date.getFullYear(),
          month: (date.getMonth() + 1),
          day: date.getDate()
        };
      }
      this.customDisabled['contractNumber'] = formState['contractnumber'] ? formState['contractnumber']['readonly'] : true;
      this.customDisabled['salesSapCode'] = formState['salessapcode'] ? formState['salessapcode']['readonly'] : true;
      if (this.form.controls['salessapcode'] && formState['salessapcode']['required'] != '0') { //P2 added
        this.customRequired['salesSapCode'] = true;
      }
      this.customDisabled['enduserSapCode'] = formState['endusersapcode'] ? formState['endusersapcode']['readonly'] : true;
      if (this.form.controls['endusersapcode'] && formState['endusersapcode']['required'] != '0') { //P2 added
        this.customRequired['enduserSapCode'] = true;
      }
      this.customDisabled['customerSapCode'] = formState['customersapcode'] ? formState['customersapcode']['readonly'] : true;
      if (this.form.controls['customersapcode'] && formState['customersapcode']['required'] != '0') { //P2 added
        this.customRequired['customerSapCode'] = true;
      }
      this.customDisabled['distributorSapCode'] = formState['distributorsapcode'] ? formState['distributorsapcode']['readonly'] : true;
      if (this.form.controls['distributorsapcode'] && formState['distributorsapcode']['required'] != '0') { //P2 added
        this.customRequired['distributorSapCode'] = true;
      }
      this.customDisabled['tips'] = formState['tips'] ? formState['tips']['readonly'] : true;
      if (this.form.controls['tips'] && formState['tips']['required'] != '0') { //P2 added
        this.customRequired['tips'] = true;
      }
      this.customDisabled['importProtocolNumber'] = formState['importprotocolnumber'] ? formState['importprotocolnumber']['readonly'] : true;
      if (this.form.controls['importprotocolnumber'] && formState['importprotocolnumber']['required'] != '0') { //P2 added
        this.customRequired['importProtocolNumber'] = true;
      }
      this.customDisabled['purchaseOrderNumber'] = formState['purchaseordernumber'] ? formState['purchaseordernumber']['readonly'] : true;
      if (this.form.controls['purchaseordernumber'] && formState['purchaseordernumber']['required'] != '0') { //P2 added
        this.customRequired['purchaseOrderNumber'] = true;
      }
      this.customDisabled['pricingLabel'] = formState['pricinglabel'] ? formState['pricinglabel']['readonly'] : true;
      this.customDisabled['omLabel'] = formState['omlabel'] ? formState['omlabel']['readonly'] : true;
    }
  }

  initHiddenUIFields() {
    console.log('initHiddenFields-model', this.model);
    console.log('initHiddenFields-form', this.form);
    console.log('initHiddenFields-options', this.options);
    let isTaskCompleted: boolean = this.options['isTaskCompleted'] ? this.options['isTaskCompleted'] : false;
    if (this.form.controls['ctptotal']) { //报价单 总ctp相关
      this.ctpFields = true;
    }

    const formState = this.options.formState;
    if (this.form.controls['ctpsingle'] && formState['ctpsingle']['hidden'] != '1') { //报价单 单个ctp相关
      this.ctpSingleFields = true;
    }

    if (this.form.controls['wbstable'] && formState['wbstable']['hidden'] != '1') { //oa填写wbs
      this.wbstableFields = true;
    }

    if (this.form.controls['sofon'] && formState['sofon']['hidden'] != '1') { //sofon号
      this.sofonFields = true;
    }

    if (this.form.controls['oaattachedfiles'] && formState['oaattachedfiles']['hidden'] != '1') { //OA上传附件文件
      this.oaAttachedFilesFields = true;
    }

    if (this.form.controls['oaappendedfiles'] && formState['oaappendedfiles']['hidden'] != '1') { //OA补充附件文件
      this.oaAppendedFilesFields = true;
    }

    if (this.form.controls['otherfees'] && formState['otherfees']['hidden'] != '1') { //经销商其他费用计算实际利润相关
      this.otherFeesFields = true;
    }

    if (this.form.controls['sonumber'] && formState['sonumber']['hidden'] != '1') { //SO Number
      this.soNumberFields = true;
    }

    if (this.form.controls['agreementnoselect'] && formState['agreementnoselect']['hidden'] != '1') { //OA阶段多选协议号
      this.agreementNoSelectFields = true;
    }

    if (this.form.controls['tradetermselect'] && formState['tradetermselect']['hidden'] != '1') { //贸易术语
      this.tradeTermSelectFields = true;
    }

    if (this.form.controls['igmflag']) { //igm显示
      this.igmFields = true;
    }

    if (this.form.controls['igmchangeflag']) { //igm可编辑
      this.igmchangeFlag = true;
    }

    if (this.form.controls['oitdate'] && formState['oitdate']['hidden'] != '1') { //OA阶段多选协议号
      this.oitDateFields = true;
    }

    if (this.form.controls['contractnumber'] && formState['contractnumber']['hidden'] != '1') { //P2 added OA File阶段 输入合同号
      this.contractNumberFields = true;
    }

    if (this.form.controls['salessapcode'] && formState['salessapcode']['hidden'] != '1') { //P2 added OA 输入销售SapCode
      this.salesSapCodeFields = true;
      //模糊查询select初始化
      this.loadSales();
      this.salesCode1 = this.options['ownerCode'] ? this.options['ownerCode'] : undefined;
      if(this.salesCode1) {
        setTimeout(()=>{
          this.salesInput$.next(this.salesCode1);
        }, 100);
      }
    }

    if (this.form.controls['endusersapcode'] && formState['endusersapcode']['hidden'] != '1') { //P2 added OA阶段 输入最终用户SapCode
      this.enduserSapCodeFields = true;
    }

    if (this.form.controls['customersapcode'] && formState['customersapcode']['hidden'] != '1') { //P2 added OA阶段 输入合同买方SapCode
      this.customerSapCodeFields = true;
    }

    if (this.form.controls['distributorsapcode'] && formState['distributorsapcode']['hidden'] != '1') { //P2 added OA阶段 带出或输入 经销商SapCode
      this.distributorSapCodeFields = true;
    }

    if (this.form.controls['tips'] && formState['tips']['hidden'] != '1') { //P2 added OA Files阶段 输入 tips
      this.tipsFields = true;
    }

    if (this.form.controls['importprotocolnumber'] && formState['importprotocolnumber']['hidden'] != '1') { //P2 added OA 阶段 输入 进口协议编号
      this.importProtocolNumberFields = true;
    }

    if (this.form.controls['purchaseordernumber'] && formState['purchaseordernumber']['hidden'] != '1') { //P2 added OA 阶段 输入 采购订单编号
      this.purchaseOrderNumberFields = true;
    }

    if (this.form.controls['pricinglabel'] && formState['pricinglabel']['hidden'] != '1') { //P2 added sofon阶段 输入
      this.pricingLabelFields = true;
    }

    if (this.form.controls['omlabel'] && formState['omlabel']['hidden'] != '1') { //P2 added om阶段 输入
      this.omLabelFields = true;
    }

    //勾选承诺 初始赋值
    if (!this.isHidden && !this.disabled && !this.quotationForm.quotationBaseInfo.acceptTerm && !isTaskCompleted && formState && formState['acceptterm']) {
      const terms = formState['acceptterm']['default'] || '';
      let termArr = terms.split(';;;;;');
      let acceptTermDefault = [];
      if (termArr[0] !== '') {
        termArr.forEach((item, index) => {
          //如果是特价进单，则默认勾选
          acceptTermDefault.push({ 'accept': '0'===this.orderType ? 0 : 1, 'term': item });
        });
      }
      if (acceptTermDefault.length > 0) {
        this.quotationForm.quotationBaseInfo.acceptTerm = acceptTermDefault;
        this.acceptTermService.acceptTermsChange(acceptTermDefault);
      }
    }

    //initCustomDisabled
    this.initCustomDisabled(isTaskCompleted);
    //manualUpdateUnitTotalPrice
    if (!this.disabled && formState && formState['editUnitTotalPrice']) { //报价单 单个ctp相关
      this.unitTotalPriceEditable = !formState['editUnitTotalPrice']['readonly'];
    }
  }


  initQuotationSelectComponent() {
    if(this.redoInitCount > 0) {
      return;
    }

    const uri = '/act/masterdata/queryQuotAndprod';
    this.http.get(uri).subscribe(res => {
      console.log(res.data);
      if ('0000' == res.code) {
        const quotationList = res.data;
        console.log('initQuotationSelectComponent', quotationList);
        quotationList.forEach(({Clinical_Segmentation, Product_Name, subtype_name, subtype_ID, id, pub, ...others}) => {
          let pubStr = pub === '1' ? '公立' : pub === '0' ? '民营' : '其他';
          const _6nc = others['6NC'];
          this.clinicalSelectSet.add(Clinical_Segmentation);
          this.clinicalProductMap[Clinical_Segmentation] ?
            this.clinicalProductMap[Clinical_Segmentation].add(Product_Name) :
            this.clinicalProductMap[Clinical_Segmentation] = new Set([Product_Name]);
          this.clinicalProductQuotationMap[Clinical_Segmentation + '||' + Product_Name] ?
            this.clinicalProductQuotationMap[Clinical_Segmentation + '||' + Product_Name].push({text: subtype_name, value: subtype_ID, subValue: pubStr, subValueCode: pub}) :
            this.clinicalProductQuotationMap[Clinical_Segmentation + '||' + Product_Name] = ([{text: subtype_name, value: subtype_ID, subValue: pubStr, subValueCode: pub}]);
          this.clinicalProductQuotationIdMap[Clinical_Segmentation + '||' + Product_Name + '||' + subtype_ID + '||' + pub] = {id, _6nc, pub};
        });
        // console.log('dada', this.clinicalProductQuotationIdMap);
      }
    });
    this.http.post('/act/masterdata/queryJsonByCondition/hospitaldepartment', {status: '1'}).subscribe(res => {
      if ('0000' == res.code) {
        this.hospitaldepartmentList = JSON.parse(res.data);
        console.log(this.hospitaldepartmentList);
        for (let i = 0; i < this.hospitaldepartmentList.length; i++) {
          const element = this.hospitaldepartmentList[i];
          if (!this.selectLevelOneValue.has(element['1_Department'])) {
            this.selectLevelOneValue.add(element['1_Department']);
          }
        }
      } else {
        this.toastrService.error(res.msg);
      }
    });
  }

  selectLevelOneValueFun() {
    this.selectLevelTwoValue.clear();
    console.log(this.selectLevelOneClassificationValue);
    for (let i = 0; i < this.hospitaldepartmentList.length; i++) {
      const element = this.hospitaldepartmentList[i];
      // console.log("this.selectLevelOneClassificationValue = "+this.selectLevelOneClassificationValue);
      // console.log("element['1_Department'] = "+element["1_Department"]);
      if (this.selectLevelOneClassificationValue == element['1_Department']) {
        this.selectLevelTwoValue.add(element);
      }
    }
  }

  selectLevelTwoValueFun() {
    console.log(this.selectLevelTwoClassificationValue);
    this.selectLevelOther = false;
    for (let i = 0; i < this.hospitaldepartmentList.length; i++) {
      const element = this.hospitaldepartmentList[i];
      if (this.selectLevelTwoClassificationValue == element['id'] && element['2_Department'] == '其他') {
        // console.log("true");
        this.selectLevelOther = true;
      }
    }
  }

  viewQuotationDetail({id, quotation, qdetail, _6nc}) {
    const modal: NgbModalRef = this.modalService.open(ApprovalSimpleModalComponent, {
      size: 'lg',
      windowClass: 'quotation-modal',
      backdropClass: 'quotation-backdrop',
      backdrop: 'static',
      keyboard: false
    });

    let currencyType = '';
    if (!this.quotationForm.quotationBaseInfo['currencyType'] || '' == this.quotationForm.quotationBaseInfo['currencyType']) {
      return;
    } else {
      currencyType = this.quotationForm.quotationBaseInfo['currencyType'] == '1' ? 'usd' : 'rmb';
    }

    let isPrivate: number;
    if (this.quotationForm.quotationBaseInfo['version'] && '2' === this.quotationForm.quotationBaseInfo['version']) {
      isPrivate = this.quotationForm.quotationBaseInfo.isPrivate ? this.quotationForm.quotationBaseInfo.isPrivate : 0;
    }

    let philipsType = this.quotationForm.quotationBaseInfo.philipsType ? this.quotationForm.quotationBaseInfo.philipsType : '';
    let philipsAuthList = this.quotationForm.quotationBaseInfo.philipsAuthList ? this.quotationForm.quotationBaseInfo.philipsAuthList : [];
    let distributorId = this.quotationForm.quotationBaseInfo.distributorId ? this.quotationForm.quotationBaseInfo.distributorId : '';
    (<ApprovalSimpleModalComponent>modal.componentInstance).pageType = 'quotation';
    const paramsToPass = (<ApprovalSimpleModalComponent>modal.componentInstance).paramsToPass;
    (<ApprovalSimpleModalComponent>modal.componentInstance).paramsToPass = {
      distributorId: distributorId,
      philipsType: philipsType,
      philipsAuthList: philipsAuthList,
      orderType: this.orderType,
      isZhitou: this.isZhitou,
      igmFlag:this.igmFields,
      customParams: {'type': 'commercial'},
      quotationId: id,
      _6nc: _6nc,
      currencyType: currencyType,
      isPrivate: isPrivate,
      quotation,
      disabled: true,
      ...paramsToPass
    };
    if (qdetail) {
      (<ApprovalSimpleModalComponent>modal.componentInstance).paramsToPass = {
        distributorId: distributorId,
        philipsType: philipsType,
        philipsAuthList: philipsAuthList,
        orderType: this.orderType,
        isZhitou: this.isZhitou,
        igmFlag:this.igmFields,
        customParams: {'type': 'commercial'},
        quotationId: id,
        _6nc: _6nc,
        currencyType: currencyType,
        isPrivate: isPrivate,
        quotation,
        qdetail: qdetail,
        disabled: true,
        ...paramsToPass
      };
    }

  }

  editQuotationDetail({id, quotation, qdetail, quotationId, Clinical_Segmentation, _6nc, rowid}, event) {

    // console.log(event);
    // console.log(id);
    // console.log(_6nc);
    // console.log(this.quotationForm.quotationBaseInfo['currencyType']);


    let philipsType = this.quotationForm.quotationBaseInfo.philipsType ? this.quotationForm.quotationBaseInfo.philipsType : '';
    let philipsAuthList = this.quotationForm.quotationBaseInfo.philipsAuthList ? this.quotationForm.quotationBaseInfo.philipsAuthList : [];
    let distributorId = this.quotationForm.quotationBaseInfo.distributorId ? this.quotationForm.quotationBaseInfo.distributorId : '';
    let currencyType = '';
    if (!this.quotationForm.quotationBaseInfo['currencyType'] || '' == this.quotationForm.quotationBaseInfo['currencyType']) {
      return;
    } else {
      currencyType = this.quotationForm.quotationBaseInfo['currencyType'] == '1' ? 'usd' : 'rmb';
    }

    let isPrivate: number;
    if (this.quotationForm.quotationBaseInfo['version'] && '2' === this.quotationForm.quotationBaseInfo['version']) {
      isPrivate = this.quotationForm.quotationBaseInfo.isPrivate ? this.quotationForm.quotationBaseInfo.isPrivate : 0;
    }

    let hospitalType = '2'; // 1公立 0民营 2其他
    if (!this.quotationForm.quotationBaseInfo['enduserType'] || '' == this.quotationForm.quotationBaseInfo['enduserType']) {
      this.toastrService.warning('无最终用户类型，不能添加订单');
      return;
    } else {
      hospitalType = this.quotationForm.quotationBaseInfo['enduserType'].indexOf('公立') != -1 ? '1' : this.quotationForm.quotationBaseInfo['enduserType'].indexOf('民营') != -1 ? '0' : '2';
    }

    let specialEdit = false;
    if(!this.isStandard) {
      specialEdit = true;
    }

    const modal: NgbModalRef = this.modalService.open(ApprovalSimpleModalComponent, {
      size: 'lg',
      windowClass: 'quotation-modal',
      backdropClass: 'quotation-backdrop',
      backdrop: 'static',
      keyboard: false
    });
    (<ApprovalSimpleModalComponent>modal.componentInstance).pageType = 'quotation';
    const paramsToPass = (<ApprovalSimpleModalComponent>modal.componentInstance).paramsToPass;
    (<ApprovalSimpleModalComponent>modal.componentInstance).paramsToPass = {
      distributorId: distributorId,
      philipsType: philipsType,
      philipsAuthList: philipsAuthList,
      isZhitou: this.isZhitou,
      igmFlag:this.igmFields,
      orderType: this.orderType,
      customParams: {'type': 'commercial'},
      quotationId: id,
      _6nc: _6nc,
      quotation,
      currencyType: currencyType,
      isPrivate: isPrivate,
      hospitalType: hospitalType,
      specialEdit: specialEdit,
      subTypeId: quotationId,
      clinical: Clinical_Segmentation,
      ...paramsToPass
    };
    if (qdetail) {
      (<ApprovalSimpleModalComponent>modal.componentInstance).paramsToPass = {
        distributorId: distributorId,
        philipsType: philipsType,
        philipsAuthList: philipsAuthList,
        isZhitou: this.isZhitou,
        igmFlag:this.igmFields,
        orderType: this.orderType,
        customParams: {'type': 'commercial'},
        quotationId: id,
        _6nc: _6nc,
        quotation,
        qdetail: qdetail,
        disabled: false,
        specialEdit: specialEdit,
        currencyType: currencyType,
        isPrivate: isPrivate,
        hospitalType: hospitalType,
        subTypeId: quotationId,
        clinical: Clinical_Segmentation,
        ...paramsToPass
      };

    }
    modal.result.then((result) => {
      // console.log(`Closed with: ${result}`);
      // console.log('modalclosing!!',result);
      if ('simple' == result) {
        console.log('modal simply closed');
      } else if (this.quotationForm.quotationList && this.quotationForm.quotationList.length > 0) {

        for (let i = 0; i < this.quotationForm.quotationList.length; i++) {
          if (this.quotationForm.quotationList[i]['rowid'] == rowid) {
            this.quotationForm.quotationList[i]['qdetail'] = result;
            this.quotationForm.quotationList[i]['unitTotalPrice'] = this.getTotalPriceFromQdetail(result);
            this.updateSumPrice(rowid, true);
            this.updateDefaultIgm(rowid);
          }
        }
        this.updateTotalAll();
        this.elementsChanged();

      }

      console.log(this.quotationForm.quotationList);


    }, (reason) => {
      console.log(`Dismissed ${this.getDismissReason(reason)}`);
      this.updateTotalAll();
      this.elementsChanged();
    });
  }

  getTotalPriceFromQdetail(qdetail) {
    let result = '';
    // console.log('getTotalPriceFromQdetail', qdetail);

    let totalRows = qdetail['totalRows'];
    if (qdetail && totalRows) {
      for (let item of totalRows) {
        if (item['total_code'] === 'T7') {
          result = item['money'];
          break;
        }
      }
    }
    return result;
  }

  removeQuotation({rowid}, rowIndex) {
    // @ts-ignore
    this.quotationForm.quotationList = this.quotationForm.quotationList.filter(({rowid: itemId}, index) => {
      return rowIndex !== index;
    });
    this.updateQuotationRowid();
    this.elementsChanged();
    this.updateTotalAll();
  }

  updateQuotationRowid(){
    if(this.quotationForm.quotationList.length > 0){
      this.quotationForm.quotationList.forEach((item,index) => {
        item['rowid'] = index;
      });
    }
  }

  getPub() {
    let result = '2';
    if (this.quotationForm.quotationBaseInfo.enduserType && this.quotationForm.quotationBaseInfo.enduserType.indexOf('公立' ) > -1) {
      result = '1';
    } else if (this.quotationForm.quotationBaseInfo.enduserType && this.quotationForm.quotationBaseInfo.enduserType.indexOf('民营') > -1) {
      result = '0';
    }
    return result;
  }

  async addNewQuotation() {
    this.isAdding = true;

    if (!this.quotationForm.quotationBaseInfo.enduserName) {
      this.toastrService.warning('没有指定最终用户，不能添加！');
      this.isAdding = false;
      return;
    }

    //{id, _6nc, pub}
    // console.log(this.clinicalProductQuotationIdMap);
    const qParam = this.clinicalProductQuotationIdMap[this.selectClinicalValue + '||' + this.selectProductValue + '||' + this.selectQuotationIdValue];
    console.log('qParam', qParam);

    if (!qParam) {
      this.toastrService.warning('请选择亚型订单相关信息添加！');
      this.isAdding = false;
      return;
    }


    if(qParam['pub']==='0') {//民营
      if (this.quotationForm.quotationBaseInfo.enduserType && this.quotationForm.quotationBaseInfo.enduserType.indexOf('民营') > -1) {
      } else {
        // below commented 20190627
        // this.toastrService.warning('医院类型和亚型订单模板类型不一致');
        // console.log(1);
        // this.isAdding = false;
        // return;
      }
    } else if(qParam['pub']==='1') {//公立
      if (this.quotationForm.quotationBaseInfo.enduserType && this.quotationForm.quotationBaseInfo.enduserType.indexOf('公立') > -1) {
      } else {
        // below commented 20190627
        // this.toastrService.warning('医院类型和亚型订单模板类型不一致');
        // console.log(2);
        // this.isAdding = false;
        // return;
      }
    } else {//其他
      if ((!this.quotationForm.quotationBaseInfo.enduserType) || (this.quotationForm.quotationBaseInfo.enduserType && this.quotationForm.quotationBaseInfo.enduserType.indexOf('公立') < 0 && this.quotationForm.quotationBaseInfo.enduserType.indexOf('民营') < 0)) {
      } else {
        // below commented 20190627
        // this.toastrService.warning('医院类型和亚型订单模板类型不一致');
        // console.log(3);
        // this.isAdding = false;
        // return;
      }
    }

    let nc6 = qParam['_6nc'];
    if (!nc6 || '' == nc6) {
      this.toastrService.warning('指定产品未查询到6NC号，不能添加，请联系管理员！');
      this.isAdding = false;
      return;
    }

    if (this.orderType == '1') {
      let qList = JSON.parse(this.formControl.value);
      // console.log('qList', qList);
      if (qList['quotationBaseInfo'] && qList['quotationBaseInfo']['expectwinbidbz']) {
      } else {
        this.toastrService.warning('请选择经销商利润币种');
        return;
      }
    }

    //TODO uncommment below before deploy!
    // let uri = '/act/product/checkDate?clinical=&nc6=' + qParam['_6nc'];
    // let res = await this.http.get(uri).toPromise();
    // if (res['code'] && res['code'] == '9998') {
    //   this.toastrService.error('指定产品（6NC: ' + nc6 + '）无有效证照，不能添加！');
    //   this.isAdding = false;
    //   return;
    // } else if (res['code'] && res['code'] == '0018') {
    //   this.toastrService.info('指定产品（6NC: ' + nc6 + '）有效期将终，请注意！');
    // } else if (res['code'] !== '0000') {
    //   console.log('/product/checkDate');
    //   this.toastrService.error(res.msg);
    //   this.isAdding = false;
    //   return;
    // }

    let regionRes = await this.http.post('/act/masterdata/queryJsonByCondition/productclass', {
      status: '1',
      '6NC': qParam['_6nc']
    }).toPromise();
    let regioncn = '';
    let regionen = '';
    let describecn = '';
    let describeen = '';
    if (regionRes['code'] == '0000') {
      if (regionRes['data'] && JSON.parse(regionRes['data']).length > 0) {
        let item = JSON.parse(regionRes['data'])[0];
        regioncn = item['region_cn'] || '';
        regionen = item['region_en'] || '';
        describecn = item['product_describe_cn'] || '';
        describeen = item['product_describe_en'] || '';
        this.isAdding = false;
      } else {
        this.toastrService.error('指定产品（6NC: ' + nc6 + '）未查询到原产地，不能添加，请联系管理员！');
        this.isAdding = false;
        return;
      }
    } else {
      console.log('/masterdata/queryJsonByCondition/productclass');
      this.toastrService.error(regionRes['msg']);
      this.isAdding = false;
      return;
    }

    if (!qParam || !qParam['id']) {
      this.toastrService.warning('没有指定亚型，不能添加！');
      this.isAdding = false;
      return;
    }

    if (!this.quotationForm.quotationBaseInfo.currencyType || ['1', '2'].indexOf(this.quotationForm.quotationBaseInfo.currencyType) == -1) {
      this.toastrService.warning('没有指定报价单币种，不能添加！');
      this.isAdding = false;
      return;
    }


    for (let i = 0; i < this.hospitaldepartmentList.length; i++) {
      const element = this.hospitaldepartmentList[i];
      if (this.selectLevelTwoClassificationValue == element['id']) {
        this.selectLevelOther = false;
        console.log('this.selectLevelOtherClassificationValue = ' + this.selectLevelOtherClassificationValue);
        if (!this.selectLevelOtherClassificationValue) {
          this.levelTwoResult = element['2_Department'];
        } else {
          this.levelTwoResult = element['2_Department'] + '_' + this.selectLevelOtherClassificationValue;
        }
      }
    }
    let subTypeIdModed = this.selectQuotationIdValue.slice(0, this.selectQuotationIdValue.indexOf('||'))
    // @ts-ignore
    this.quotationForm.quotationList.push({
      ...this.clinicalProductQuotationIdMap[this.selectClinicalValue + '||' + this.selectProductValue + '||' + this.selectQuotationIdValue],
      rowid: this.quotationForm.quotationList.length,
      Clinical_Segmentation: this.selectClinicalValue,
      Product_Name: this.selectProductValue,
      quotation: this.selectQuotationValue,
      quotationId: subTypeIdModed,
      levelOne: this.selectLevelOneClassificationValue,
      levelTwo: this.levelTwoResult,
      regioncn: regioncn,
      regionen: regionen,
      describecn: describecn,
      describeen: describeen,
      ctp: '',
      ctpRatio: '',
      uuid: UUID.UUID(),
      counts: 1
    });
    // @ts-ignore
    this.updateQuotationRowid()
    this.quotationForm.quotationList = [...this.quotationForm.quotationList];
    const quotationInputValue = JSON.stringify(this.quotationForm);

    console.log(this.quotationForm.quotationList);
    this.formControl.setValue(quotationInputValue);
    this.isAdding = false;
    this.clearClinicalAllSelected()
  }

  clearClinicalAllSelected() {
    // this.selectLevelOneValue.clear();
    this.selectLevelTwoValue.clear();
    this.selectLevelOneClassificationValue = '';
    this.selectLevelTwoClassificationValue = '';
    this.selectLevelOtherClassificationValue = '';
    this.selectLevelOther = false;
    this.levelTwoResult = null;
  }

  selectClinic() {
    this.productSelectSet = new Set([]);
    this.quotationSelectSet = new Set([]);
    this.selectProductValue = null;
    this.selectQuotationValue = null;
    this.selectQuotationIdValue = null;
    this.selectQuotationId = null;
    this.productSelectSet = this.clinicalProductMap[this.selectClinicalValue];
  }

  selectProduct() {
    this.quotationSelectSet = new Set([]);
    this.selectQuotationValue = null;
    this.selectQuotationIdValue = null;
    this.selectQuotationId = null;
    this.quotationSelectSet = this.clinicalProductQuotationMap[this.selectClinicalValue + '||' + this.selectProductValue];
    // console.log('kdash', this.quotationSelectSet);

  }

  selectQuotation() {
    let quotationId = this.selectQuotationIdValue;

    if (!quotationId) {
      this.selectQuotationValue = undefined;
      return;
    }

    let selectedItem;
    this.quotationSelectSet.forEach(item =>{
      if (item['value'] + '||' + item['subValueCode'] === quotationId) {
        selectedItem = item;
      }
    });

    this.selectQuotationValue = selectedItem['text'];
  }

  updateCounts(event, rowIndex) {
    this.quotationForm.quotationList[rowIndex]['counts'] = event.target.value;
    this.quotationForm.quotationList = [...this.quotationForm.quotationList];
    let item = this.quotationForm.quotationList[rowIndex];
    if(item['unitTotalPrice']) {
      this.updateSumPrice(rowIndex);
      this.updateTotalAll();
    }else {
      this.elementsChanged();
    }
  }

  updateCtpSingle(event, rowIndex, key) {
    this.quotationForm.quotationList[rowIndex][key] = event.target.value;
    this.quotationForm.quotationList = [...this.quotationForm.quotationList];
    this.elementsChanged();
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  elementsChanged() {

    const quotationInputValue = JSON.stringify(this.quotationForm);
    console.log('elementsChanged', this.quotationForm);
    this.formControl.setValue(quotationInputValue);
  }

  changeCkb(event: any, key: string) {
    if (event && key) {
      this.quotationForm.quotationBaseInfo[key] = event.target.checked ? 1 : 0;
      this.elementsChanged();
    }
  }

  //联动
  simpleFiledLink(event, label) {
    this.quotationForm.quotationBaseInfo[label] = event.target.value;
  }

  viewLicense(type) {
    const warningMsg = type == '2' ? '请先选择最终用户名称' : '请先选择经销商名称';
    const companyName = type == '2' ? this.quotationForm.quotationBaseInfo.enduserName : this.quotationForm.quotationBaseInfo.distributorName;
    if (type == '2') {
      if (!this.quotationForm.quotationBaseInfo.enduserName || '' == this.quotationForm.quotationBaseInfo.enduserName) {
        this.toastrService.warning(warningMsg);
        return;
      }
    } else if (type == '1') {
      if (!this.quotationForm.quotationBaseInfo.distributorName || '' == this.quotationForm.quotationBaseInfo.distributorName) {
        this.toastrService.warning(warningMsg);
        return;
      }
    }

    const uri = '/act/dms/api/CompanyLicense/';
    // const uri = '/mock/CompanyLicense/' + type;//for dev mock
    let params = {
      'CompanyName': companyName,
      'SearchTargetType': type
    };

    this.http.post(uri, params).subscribe(res => {
      console.log(res);
      if (res.SubmitResult == true && res.Object != [] && res.Object[0]) {
        const modal: NgbModalRef = this.modalService.open(QuotationLicenseModalComponent, {
          size: 'lg',
          backdrop: 'static',
          keyboard: false
        });
        (<QuotationLicenseModalComponent>modal.componentInstance).licenseType = type;
        (<QuotationLicenseModalComponent>modal.componentInstance).pageMainObject = res.Object[0];

        modal.result.then((result) => {
          if ('simple' == result) {
            console.log('modal simply closed');
          }
        }, (reason) => {
          console.log(`Dismissed ${this.getDismissReason(reason)}`);
        });
      } else {
        console.log('viewLicense-res', res);
        this.toastrService.warning('未查询到指定医院或经销商');
        return;

      }
    });
  }

  getEnduserInfo(event) {
    console.log('getEnduserInfo', event);
    if (event && event['CustomerName'] && '' != event['CustomerName']) {
      this.quotationForm.quotationBaseInfo.enduserId = event['CustomerSysID'];
      this.quotationForm.quotationBaseInfo.enduserProvince = event['Province'] || '';
      this.quotationForm.quotationBaseInfo.enduserCity = event['City'] || '';
      this.quotationForm.quotationBaseInfo.enduserCountry = event['Country'] ||'';
      const uri = '/act/dms/api/CompanyLicense/';
      let params = {
        SearchTargetType: '2',
        CompanyName: event['CustomerName']
      };
      this.http.post(uri, params).subscribe(res => {
        if (res.SubmitResult == true && res.Object != [] && res.Object.length > 0) {
          let enduser = res.Object[0];
          if(res.Object.length > 1) {
            const customerName = event['CustomerName'];
            for (const rawEndUser of res.Object) {
              if (customerName == rawEndUser['HospitalName']) {
                enduser = rawEndUser;
                break;
              }
            }
          }
          console.log('getEnduserInfoLicense', enduser);
          this.quotationForm.quotationBaseInfo.enduserType = enduser['HospitalType'];
          this.quotationForm.quotationBaseInfo.customerDirAddress = enduser['HospitalAddress'];
          this.quotationForm.quotationBaseInfo.enduserAddress = enduser['HospitalAddress'];
          this.quotationForm.quotationBaseInfo.deliveryAddress = enduser['HospitalAddress'];
          this.quotationForm.quotationBaseInfo.philipsType = enduser['AuthorityTypeName'];
          this.quotationForm.quotationBaseInfo.philipsAuthList = enduser['AuthorityList'] || [];
          this.setBuyerInfoWhenZhitouRMB(enduser);
          this.elementsChanged();

        } else {
          console.log('SubmitResult', res.SubmitResult);
          console.log('Object', res.Object);
          this.toastrService.error('客户字典API返回数据错误');
          this.quotationForm.quotationBaseInfo.enduserType = '';
          this.quotationForm.quotationBaseInfo.customerDirAddress = '';
          this.quotationForm.quotationBaseInfo.enduserAddress = '';
          this.quotationForm.quotationBaseInfo.deliveryAddress = '';
          this.quotationForm.quotationBaseInfo.philipsType = '';
          this.quotationForm.quotationBaseInfo.philipsAuthList = [];
          this.setBuyerInfoWhenZhitouRMB();
          this.elementsChanged();
        }
      });
    } else {
      this.quotationForm.quotationBaseInfo.enduserId = '';
      this.quotationForm.quotationBaseInfo.enduserProvince = '';
      this.quotationForm.quotationBaseInfo.enduserCity = '';
      this.quotationForm.quotationBaseInfo.enduserCountry = '';
      this.quotationForm.quotationBaseInfo.enduserName = '';
      this.quotationForm.quotationBaseInfo.enduserType = '';
      this.quotationForm.quotationBaseInfo.customerDirAddress = '';
      this.quotationForm.quotationBaseInfo.enduserAddress = '';
      this.quotationForm.quotationBaseInfo.deliveryAddress = '';
      this.quotationForm.quotationBaseInfo.philipsType = '';
      this.quotationForm.quotationBaseInfo.philipsAuthList = [];
      this.setBuyerInfoWhenZhitouRMB();
      if (event) {
        this.toastrService.warning('未查询到最终用户信息');
      }
      this.elementsChanged();
    }
  }

  //当直投且币种为人民币时，合同买方信息取最终用户信息。这个时候合同买方税号为非必填。
  //如果直投且币种为美金，则销售手填信息，且合同买方税号为必填。
  setBuyerInfoWhenZhitouRMB(enduser?) {
    if(this.isZhitou && this.currencyType == '2') {
      if(enduser) { //最终用户名 带出的信息只有医院名和地址，（联系人，联系电话等，没有）
        this.quotationForm.quotationBaseInfo.buyerName = enduser['HospitalName'];
        this.quotationForm.quotationBaseInfo.buyerAddress = enduser['HospitalAddress'];
      } else {
        this.quotationForm.quotationBaseInfo.buyerName = '';
        this.quotationForm.quotationBaseInfo.buyerAddress = '';
      }
    }
  }

  async getDistributorInfo(event) {//经销商接口返回的对象没有地址信息
    console.log(event);
    //标准进单：人民币的进单，且为非直投，则合同买方信息由经销商信息带出，如果是美金的非直投进单，则合同买方信息由销售手动填写
    //特价带出进单和标准进单的买房信息带出逻辑相同
    let buyerFlag = false;
    buyerFlag = this.currencyType === '2' && '非直投' === this.quotationForm.quotationBaseInfo.purchaseTypeName;
    if (event && event['NameCN'] && '' != event['NameCN']) {
      this.quotationForm.quotationBaseInfo.distributorId = event['ID'];
      // this.quotationForm.quotationBaseInfo.distributorAddress = event['InvoiceAddress'];
      this.isAdding = true;
      // await this.getAgreementNos(event['NameCN']);
      let distributor =  await this.getAgreementNosNew(event['ID']);
      // console.log('经销商信息', distributor);
      if(distributor) {
        this.quotationForm.quotationBaseInfo.distributorAddress = distributor['ContactAddress'] || '';
        this.quotationForm.quotationBaseInfo.distributorContactPhone = distributor['Contact'] || '';
        this.quotationForm.quotationBaseInfo.distributorEmail = distributor['ContactEmail'] || '';
        this.quotationForm.quotationBaseInfo.distributorContact = distributor['ContactPerson'] || '';
        this.quotationForm.quotationBaseInfo.distributorTaxId = distributor['BusinessLicence'] || '';
        this.quotationForm.quotationBaseInfo.distributorSapCode = distributor['DistributorSapCode'] || ''; //P2 added

        if (buyerFlag) {
          this.quotationForm.quotationBaseInfo.buyerName = event['NameCN'];
          this.quotationForm.quotationBaseInfo.buyerTaxId = distributor['BusinessLicence'];
          this.quotationForm.quotationBaseInfo.buyerAddress = distributor['ContactAddress'];
          this.quotationForm.quotationBaseInfo.buyerContact = distributor['ContactPerson'];
          this.quotationForm.quotationBaseInfo.buyerContactPhone = distributor['Contact'];
          this.quotationForm.quotationBaseInfo.buyerEmail = distributor['ContactEmail'];
          this.quotationForm.quotationBaseInfo.distributorSapCode = distributor['DistributorSapCode'] || ''; //P2 added
        }
      } else {
        this.quotationForm.quotationBaseInfo.distributorAddress = '';
        this.quotationForm.quotationBaseInfo.distributorAddress = '';
        this.quotationForm.quotationBaseInfo.distributorContactPhone = '';
        this.quotationForm.quotationBaseInfo.distributorEmail = '';
        this.quotationForm.quotationBaseInfo.distributorContact = '';
        this.quotationForm.quotationBaseInfo.distributorTaxId =  '';
        this.quotationForm.quotationBaseInfo.distributorSapCode = ''; //P2 added
        if (buyerFlag) {
          this.quotationForm.quotationBaseInfo.buyerName = '';
          this.quotationForm.quotationBaseInfo.buyerTaxId = '';
          this.quotationForm.quotationBaseInfo.buyerAddress = '';
          this.quotationForm.quotationBaseInfo.buyerContact = '';
          this.quotationForm.quotationBaseInfo.buyerContactPhone = '';
          this.quotationForm.quotationBaseInfo.buyerEmail = '';
          this.quotationForm.quotationBaseInfo.distributorSapCode = ''; //P2 added
        }
        this.toastrService.warning('主数据中未查询到经销商信息');
      }

      this.isAdding = false;
      console.log('distributorAgreementNos', this.quotationForm.quotationBaseInfo.distributorAgreementNos);
      this.elementsChanged();
    } else {
      this.quotationForm.quotationBaseInfo.distributorId = '';
      this.quotationForm.quotationBaseInfo.distributorName = '';
      this.quotationForm.quotationBaseInfo.distributorAddress = '';
      this.quotationForm.quotationBaseInfo.distributorAgreementNos = '';
      this.quotationForm.quotationBaseInfo.distributorAddress = '';
      this.quotationForm.quotationBaseInfo.distributorContactPhone = '';
      this.quotationForm.quotationBaseInfo.distributorEmail = '';
      this.quotationForm.quotationBaseInfo.distributorContact = '';
      this.quotationForm.quotationBaseInfo.distributorTaxId = '';
      this.quotationForm.quotationBaseInfo.distributorSapCode = ''; //P2 added
      if (event) {
        this.toastrService.warning('未查询到经销商信息');
      }
      this.elementsChanged();
    }
  }

  async getAgreementNosNew(companyId) {
    let distributor;
    let agreementNos = '';
    if(companyId) {
      const uri = '/act/masterdata/queryJsonByCondition/dealerinfo';
      let params = {
        status: '1',
        DMSID: companyId
      }
      let res = await this.http.post(uri, params).toPromise();
      if(res['code'] === '0000') {
        let dealers = JSON.parse(res['data']);
        if(dealers.length > 0) {
          distributor = dealers[0];
          for(let item of dealers) {
            let agreementNo = item['DMSID'] ? item['DMSID'] : '';
            if ('' !== agreementNo) {
              agreementNos = agreementNos + agreementNo + ',';
            }
          }
          agreementNos = agreementNos.slice(0, -1);
        }

        console.log(dealers);
      }
    }

    this.quotationForm.quotationBaseInfo.distributorAgreementNos = agreementNos;
    return distributor;
  }

  async getAgreementNos(companyName) {
    if (companyName) {
      const uri = '/act/dms/api/CompanyLicense/';
      let params = {
        SearchTargetType: '1',
        CompanyName: companyName
      };
      let res = await this.http.post(uri, params).toPromise();

      if (res.SubmitResult == true && res.Object != [] && res.Object[0]) {
        let distributor = res.Object[0];
        if (distributor['AuthorityAreaList'] && distributor['AuthorityAreaList'].length > 0) {
          let agreementNos = '';
          for (const item of distributor['AuthorityAreaList']) {
            let agreementNo = item['AgreementNo'] ? item['AgreementNo'] : '';
            if ('' !== agreementNo) {
              agreementNos = agreementNos + agreementNo + ',';
            }
          }
          agreementNos = agreementNos.slice(0, -1);
          this.quotationForm.quotationBaseInfo.distributorAgreementNos = agreementNos;
        } else {
          this.quotationForm.quotationBaseInfo.distributorAgreementNos = '';
        }
      } else {
        console.log('SubmitResult', res.SubmitResult);
        console.log('Object', res.Object);
        this.toastrService.error('客户字典API返回数据错误');
        this.quotationForm.quotationBaseInfo.distributorAgreementNos = '';
      }
    }

  }

  updateCurrencyType(event) {
    this.currencyType = event.target.value;
    // console.log('updateCurrencyType', this.currencyType);
  }

  updateTotalAll(silent?) {

    let currency;
    let vendorCurrency;
    let vendorMarginNeed = this.isZhitou ? "0" : "1";
    console.log(this.currencyType);
    if (this.currencyType == '1') {
      currency = 'usd';
    } else if (this.currencyType == '2') {
      currency = 'rmb';
    } else {
      this.toastrService.warning('请选择币种');
      return;
    }

    let qList = JSON.parse(this.formControl.value);
    if (this.orderType == '1') {
      if (!this.isZhitou) {
        if (qList['quotationBaseInfo'] && qList['quotationBaseInfo']['expectwinbidbz'] == '1') {
          vendorCurrency = 'usd';
        } else if (qList['quotationBaseInfo'] && qList['quotationBaseInfo']['expectwinbidbz'] == '2') {
          vendorCurrency = 'rmb';
        } else {
          // this.toastrService.warning('请选择经销商利润币种');
          // return;
        }
      }
    } else {
      if (!this.isZhitou) {
        if (qList['quotationBaseInfo'] && qList['quotationBaseInfo']['expectwinbidbz'] == '1') {
          vendorCurrency = 'usd';
        } else if (qList['quotationBaseInfo'] && qList['quotationBaseInfo']['expectwinbidbz'] == '2') {
          vendorCurrency = 'rmb';
        } else {
          // this.toastrService.warning('请选择经销商利润币种');
          // return;
        }
      }
    }

    let paramsToBack = {
      'quotation_total': [],
      'distributermargin_param': [
        {
          'need': vendorMarginNeed,
          'currency': '',
          'expectwinbidbz': '',
          'expectwinbidprice': '',
          'expectdistributerotherfee': ''
        }
      ]
    };

    paramsToBack['distributermargin_param'][0]['currency'] = currency;
    paramsToBack['distributermargin_param'][0]['expectwinbidbz'] = vendorCurrency;
    paramsToBack['distributermargin_param'][0]['expectwinbidprice'] = qList['quotationBaseInfo']['purchasePrice'] ? qList['quotationBaseInfo']['purchasePrice'] : '';
    paramsToBack['distributermargin_param'][0]['expectdistributerotherfee'] = qList['quotationBaseInfo']['expectdistributerotherfee'] ? qList['quotationBaseInfo']['expectdistributerotherfee'] : '';

    this.elementsChanged();
    if (qList['quotationList'].length > 0) {
      //todo
      qList = JSON.parse(this.formControl.value);
      for (let i = 0; i < qList['quotationList'].length; i++) {
        let quotation = qList['quotationList'][i];
        if (quotation['qdetail'] && quotation['qdetail']['totalRows']) {
          let qdetail = quotation['qdetail'];
          let qt = {};
          let trs = qdetail['totalRows'];
          if (trs.length > 0) {
            for (let j = 0; j < trs.length; j++) {
              let tr = trs[j];
              // qt[tr['total_code']] = tr['money'] ? tr['money'].toString().replace(/[\$|\￥| ]/g, '') : '';
              qt[tr['total_code']] = tr['money'] ? tr['money'].toString().replace(/[^0-9.-]/g, '') : '';
            }
          } else {
            continue;
          }
          let specialamount = '0';
          specialamount = qdetail['specialRows'] ? qdetail['specialRows'][0][currency] : '0';
          specialamount = specialamount == '' ? '0' : specialamount;
          qt['specialamount'] = specialamount;
          qt['qty'] = quotation['counts'];
          paramsToBack['quotation_total'].push(qt);
          console.log('updateTotalAll', paramsToBack);
        }
      }
      if (paramsToBack['quotation_total'].length > 0) {

        const uri = '/act/calculate/getTotalAmount';
        this.http.post(uri, paramsToBack).subscribe(res => {
          if ('0000' == res.code) {
            let newTotalAllList = this.getDefaultTotallAll();
            // let newTotalAllList = this.quotationForm['totalAllList'];
            if (newTotalAllList && newTotalAllList.length == 0) {
              this.setDefaultValueForTotalAll();
              newTotalAllList = this.quotationForm['totalAllList'];
            }
            let callbackData = res.data;
            console.log('updateTotalAll', callbackData);
            const prefix = currency == 'usd' ? '$ ' : currency == 'rmb' ? '￥ ' : ''; //总的报价单币种
            for (let key of Object.keys(callbackData)) {
              for (let j = 0; j < newTotalAllList.length; j++) {
                if ('distributermargin' == newTotalAllList[j]['totalall_name']) {

                  // console.log(newTotalAllList[j]);
                  newTotalAllList[j]['money'] = callbackData[key];
                  break;
                } else if (newTotalAllList[j]['totalall_name'] == key) {
                  newTotalAllList[j]['money'] = prefix + callbackData[key];
                  break;
                }
              }
            }


            newTotalAllList =  this.filterTotalAllList(newTotalAllList);
            // if (this.orderType === '0') {//此时没有经销商利润计算
            //   let newTotalAllListModed = [];
            //   for (let item of newTotalAllList) {
            //     if (item['totalall_name'] == "distributermargin") {
            //       continue;
            //     } else {
            //       newTotalAllListModed.push(item);
            //     }
            //   }
            //   newTotalAllList = [...newTotalAllListModed];
            // }

            if(!silent){
              this.toastrService.success('总价已更新');
            }
            this.quotationForm.totalAllList = [...newTotalAllList];
            console.log('updateTotalAll', newTotalAllList);
            console.log('updateTotalAll', this.quotationForm.totalAllList);
            this.updateExpectDealerMargin();
            this.elementsChanged();
          } else {
            if(!silent){
              this.toastrService.warning('总价更新失败：' + res.msg);
            }
          }
        });
      } else {
        this.setDefaultValueForTotalAll();
        this.updateExpectDealerMargin();
        this.elementsChanged();
      }

    } else {
      this.setDefaultValueForTotalAll();
      this.updateExpectDealerMargin();
      this.elementsChanged();
    }
  }

  //用于预计经销商利润单格显示
  updateExpectDealerMargin() {
    for (let item of this.quotationForm.totalAllList) {
      if (item['totalall_name'] === 'distributermargin') {
        this.quotationForm.quotationBaseInfo.expectDealerMargin = item['money'] || '';
      }
    }
  }

  setDefaultValueForTotalAll() {
    let defaultTotallAll = this.getDefaultTotallAll();
    this.quotationForm['totalAllList'] = [...defaultTotallAll];
    this.elementsChanged();
  }

  getDefaultTotallAll() {
    const result = [
      {
        'totalall_name': 'deviceprice',
        'totalall': '设备净价',
        'money': ''
      },
      {
        'totalall_name': 'nodiscountitem',
        'totalall': '无折扣项目',
        'money': ''
      },
      {
        'totalall_name': 'specialamountall',
        'totalall': '特价申请总价',
        'money': ''
      },
      {
        'totalall_name': 'devicepriceall',
        'totalall': '设备总价',
        'money': ''
      },
      {
        'totalall_name': 'contractprice',
        'totalall': '合同净价',
        'money': ''
      },
      {
        'totalall_name': 'contractpriceall',
        'totalall': '合同总价',
        'money': ''
      },
      {
        'totalall_name': 'distributermargin',
        'totalall': '预计经销商利润',
        'money': ''
      }
    ];
    return result;
  }

  filterTotalAllList(newTotalAllList){
    if (this.orderType === '0') {//此时没有经销商利润计算
      let newTotalAllListModed = [];
      for (let item of newTotalAllList) {
        if (item['totalall_name'] == "distributermargin") {

          continue;
        } else {
          newTotalAllListModed.push(item);
        }
      }
      newTotalAllList = [...newTotalAllListModed];
    }
    return newTotalAllList;
  }

  private loadOppoIdSelect() {
    this.oppoIdSelect$ = concat(
      of([]), // default items, empty
      this.oppoIdSelectInput$.pipe(
        debounceTime(500),
        filter(term => this.imeFlag && term && term.length > 1),
        distinctUntilChanged(),
        tap(() => this.oppoIdSelectLoading = true),
        switchMap(term => this.getUsfcstFromMasterdata(term).pipe(
          tap(() => this.oppoIdSelectLoading = false)
        ))
      )
    );
  }

  private getUsfcstFromMasterdata(term: string = null): Observable<any[]> {
    // console.log('getHostpitalFromApi-term', term);
    let subj = new Subject<any[]>();
    if (term && '' != term) {

      let uri = '/act/masterdata/queryMasterdataByKeyword/usfcst';
      const params = {
        columns: ['AccountName','OpportunityID'],
        keyword: term,
        status: true
      };
      this.http.post(uri, params).subscribe(res => {
        console.log('getUsfcstFromMasterdata-res', res);
        subj.next(res['data']);
      });
      return subj.asObservable();
    }
    return of([]);
  }

  private loadHospital() {
    this.hospital$ = concat(
      of([]), // default items, empty
      this.hospitalInput$.pipe(
        debounceTime(500),
        filter(term => this.imeFlag && term && term.length > 1),
        distinctUntilChanged(),
        tap(() => this.hospitalLoading = true),
        switchMap(term => this.getHostpitalFromApi(term).pipe(
          tap(() => this.hospitalLoading = false)
        ))
      )
    );
  }

  private getHostpitalFromApi(term: string = null): Observable<any[]> {
    // console.log('getHostpitalFromApi-term', term);
    let subj = new Subject<any[]>();
    if (term && '' != term) {
      let params: URLSearchParams = new URLSearchParams();
      params.set('Province', '');
      params.set('City', '');
      params.set('Country', '');
      params.set('ProType', '');
      params.set('ReturnCount', '15');
      params.set('CustomerName', term);

      let uri = '/act/dms/api/QueryCustomer?' + params.toString();
      // console.log('getHostpitalFromApi-uri',uri);
      this.http.get(uri).subscribe(res => {
        console.log('getHostpitalFromApi-res', res);
        subj.next(res['Object']);
      });
      return subj.asObservable();
    }
    return of([]);
  }

  private loadDistributor() {
    this.distributor$ = concat(
      of([]), // default items, empty
      this.distributorInput$.pipe(
        debounceTime(500),
        filter(term => this.imeFlag && term && term.length > 1),
        distinctUntilChanged(),
        tap(() => this.distributorLoading = true),
        switchMap(term => this.getDistributorFromApi(term).pipe(
          tap(() => this.distributorLoading = false)
        ))
      )
    );
  }

  private getDistributorFromApi(term: string = null): Observable<any[]> {
    // console.log('getHostpitalFromApi-term', term);
    let subj = new Subject<any[]>();
    if (term && '' != term) {
      let params: URLSearchParams = new URLSearchParams();
      params.set('CompanyName', term);
      params.set('PageSize', '15');

      let uri = '/act/dms/api/CompanyLicense?' + params.toString();
      // console.log('getHostpitalFromApi-uri',uri);
      this.http.get(uri).subscribe(res => {
        console.log('getDistributorFromApi-res', res);
        subj.next(res['Object']);
      });
      return subj.asObservable();
    }
    return of([]);
  }

  changeImeFlag(event) {
    this.imeFlag = event == '0' ? false : true;
  }

  /** from special quotation add ends */

  /** new code starts */
  // loadOppoIdSelect() {
  //   this.oppoIdSelect = [];
  //   this.http.post('/act/masterdata/queryJsonByCondition/usfcst', {status: '1'}).subscribe(res => {
  //     if ('0000' == res.code) {
  //       this.oppoIdSelect = JSON.parse(res.data);
  //       // console.log('oppoIdSelect',this.oppoIdSelect);
  //     } else {
  //       this.toastrService.error(res.msg);
  //     }
  //   });
  // }

  // oppoCustomSearchFn(term: string, item) {
  //   term = term.toLocaleLowerCase();
  //   return (item['AccountName'] ? item['AccountName'].toLocaleLowerCase().indexOf(term) > -1 : false)
  //     || (item['OpportunityID'] ? item['OpportunityID'].toLocaleLowerCase().indexOf(term) > -1 : false);
  // }

  getOppoIdInfo(event) {
    console.log(event);
    if(this.isStandard){//标准进单
      this.quotationForm.quotationBaseInfo.enduserType = '';
      this.quotationForm.quotationBaseInfo.customerDirAddress = '';
      this.quotationForm.quotationBaseInfo.enduserAddress = '';
      this.quotationForm.quotationBaseInfo.deliveryAddress = '';
      this.quotationForm.quotationBaseInfo.philipsType = '';
      this.quotationForm.quotationBaseInfo.philipsAuthList = [];
      if (event) {
        this.quotationForm.quotationBaseInfo.crmEnduserName = event['AccountName'];
        this.quotationForm.quotationBaseInfo.enduserName = event['AccountName'];
        // this.hospitalInput$ = event['AccountName'];

        this.getEnduserItem(event['AccountName']);

      } else {
        this.quotationForm.quotationBaseInfo.crmEnduserName = '';
        this.getEnduserInfo(undefined);
      }
    } else {//特价带出进单
      if(event) {
        this.quotationForm.quotationBaseInfo.crmEnduserName = event['AccountName'];
      } else {
        this.quotationForm.quotationBaseInfo.crmEnduserName = '';
      }
      this.elementsChanged();
    }
  }

  getEnduserItem(term) {
    if (term) {
      let params: URLSearchParams = new URLSearchParams();
      params.set('Province', '');
      params.set('City', '');
      params.set('Country', '');
      params.set('ProType', '');
      params.set('ReturnCount', '15');
      params.set('CustomerName', term);

      let item = undefined;
      let uri = '/act/dms/api/QueryCustomer?' + params.toString();

      // console.log('getHostpitalFromApi-uri',uri);
      this.http.get(uri).subscribe(res => {
        // console.log('getEnduserItem-res', res);
        if (res['Object'] && res['Object'].length > 0) {
          if (res['Object'].length == 1) {
            item = res['Object'][0];
          } else {
            const customerName = term.toString();
            let fullMatch = false;
            for (const rawEndUser of res['Object']) {
              if(customerName == rawEndUser['CustomerName']) {
                fullMatch = true;
                item = rawEndUser;
                break;
              }
            }
            if(!fullMatch) {
              item = res['Object'][0];
            }
          }
        }

        if (item) {
          this.getEnduserInfo(item);
        }

        this.elementsChanged();
      });
    }
  }

  loadPaymentTypeSelect() {
    this.paymentTypeSelect = [];
    this.http.post('/act/masterdata/queryJsonByCondition/paymenttype', {status: '1'}).subscribe(res => {
      if ('0000' == res.code) {
        // console.log('loadPaymentTypeSelect', res.data);
        this.paymentTypeSelect = JSON.parse(res.data);
      } else {
        this.toastrService.error(res.msg);
      }
    });
  }

  getPaymentType(event) {
    if (event) {
      this.quotationForm.quotationBaseInfo.paymentTypeId = event['id'];
      if (event['Payment_Type'] === '其他') {
        this.isOtherPaymentType = true;
      } else {
        this.isOtherPaymentType = false;
        this.quotationForm.quotationBaseInfo.paymentTypeOthers = '';
      }
    } else {
      this.isOtherPaymentType = false;
      this.quotationForm.quotationBaseInfo.paymentTypeOthers = '';
      this.quotationForm.quotationBaseInfo.paymentType = '';
      this.quotationForm.quotationBaseInfo.paymentTypeId = '';
    }

    this.elementsChanged();
  }

  // 计算经销商实际利润
  updateActualDistributorProfit() {
    this.isAdding = true;
    let params = {};
    //经销商币种 1表示美金，2表示人民币
    params['expectwinbidbz'] = this.quotationForm.quotationBaseInfo.expectwinbidbz || '';
    //订单币种 1表示美金，2表示人民币
    params['currencyType'] = this.quotationForm.quotationBaseInfo.currencyType || '';
    //预计中标价格
    // params['purchasePrice'] = this.quotationForm.quotationBaseInfo.purchasePrice || '';
    //最终中标价格
    params['finalPurchasePrice'] = this.quotationForm.quotationBaseInfo.finalPurchasePrice || '';
    //订单价格
    params['contractpriceall'] = this.getContractpriceall();
    //其他费用
    params['otherFees'] = this.quotationForm.quotationBaseInfo.otherFees.map(String);

    let uri = '/act/otherFee/otherFeeCalculation';
    // console.log('updateActualDistributorProfit', params);
    this.http.post(uri, params).subscribe(res => {
      if ('0000' === res.code) {
        //console.log(res.data);
        this.quotationForm.quotationBaseInfo.dealerMargin = res.data;
      } else {
        this.toastrService.error(res.msg);
      }
      this.isAdding = false;
      this.elementsChanged();
    });
  }

  getContractpriceall() {
    let result = '';
    if (this.quotationForm.totalAllList && this.quotationForm.totalAllList.length > 0) {
      for (let item of this.quotationForm.totalAllList) {
        if (item['totalall_name'] == 'contractpriceall') {
          result = item['money'].replace(/[^0-9.]/g, '');
          break;
        }
      }
    }
    return result;
  }

  uploadFile(flag) {
    let file: File;
    let elementRef: ElementRef;
    if (flag === 'otherSupportFiles') {
      file = this.otherSupportFilesInput.nativeElement.files[0];
      elementRef = this.otherSupportFilesInput;
    } else if (flag === 'oaAttachedFiles') {
      file = this.oaAttachedFilesInput.nativeElement.files[0];
      elementRef = this.oaAttachedFilesInput;
    } else if (flag === 'importAgreementFiles') {
      file = this.importAgreementFilesInput.nativeElement.files[0];
      elementRef = this.importAgreementFilesInput;
    } else if (flag === 'purchaseOrderFiles') {
      file = this.purchaseOrderFilesInput.nativeElement.files[0];
      elementRef = this.purchaseOrderFilesInput;
    } else if (flag === 'paymentProofFiles') {
      file = this.paymentProofFilesInput.nativeElement.files[0];
      elementRef = this.paymentProofFilesInput;
    } else if (flag === 'sofonWordFiles') {
      file = this.sofonWordFilesInput.nativeElement.files[0];
      elementRef = this.sofonWordFilesInput;
    } else if (flag === 'sofonPdfFiles') {
      file = this.sofonPdfFilesInput.nativeElement.files[0];
      elementRef = this.sofonPdfFilesInput;
    } else if (flag === 'exportVerificationFiles') {
      file = this.exportVerificationFilesInput.nativeElement.files[0];
      elementRef = this.exportVerificationFilesInput;
    } else if (flag === 'otherFiles') {
      file = this.otherFilesInput.nativeElement.files[0];
      elementRef = this.otherFilesInput;
    }

    const _validFileExtensions = [".xls", ".xlsx", ".doc", ".docx", ".msg"];
    if (file) {

      if (flag === "oaAttachedFiles") {
        if(!this.fileService.fileExtensionValidator(file, _validFileExtensions)) {
          this.toastrService.warning('请上传指定类型的文件！');
          elementRef.nativeElement.value = '';
          return;
        }
      }

      const owner = localStorage.getItem('ng_philips_code1');
      this.fileService.uploadFile('/act/file/upload',{file,filename:file.name,location:flag,owner}, res => {
        let newItem = {
          id: res.data,
          name: file.name,
          owner: owner
        };
        this.toastrService.success('上传成功');
        elementRef.nativeElement.value = '';
        // this.quotationForm.quotationBaseInfo.otherSupportFiles.push(newItem);
        this.quotationForm.quotationBaseInfo[flag] = [newItem, ...this.quotationForm.quotationBaseInfo[flag]];
        this.elementsChanged();
      }, res => {
        this.toastrService.error(res && res.msg ? res.msg : '上传错误');
        elementRef.nativeElement.value = '';
      });
      elementRef.nativeElement.value = '';
    }
  }

  removeFile(row, listName) {
    let id = row['id'];
    let uri = '/act/file/remove/' + id;
    this.http.get(uri).subscribe(res => {
      if ('0000' === res.code || '0028' === res.code) {
        this.toastrService.success('删除成功');
        console.log(this.quotationForm.quotationBaseInfo);

        if (listName) {
          this.quotationForm.quotationBaseInfo[listName] = this.quotationForm.quotationBaseInfo[listName].filter(({id: itemId}) => {
            return itemId !== id;
          });
        }
        this.elementsChanged();
      } else {
        this.toastrService.error(res.msg);
      }
    });
  }

  downloadFile(row) {
    let id = row['id'];
    let name = row['name'];
    let uri = '/act/file/download/' + id;
    this.http.get(uri).subscribe(res => {
      if (res.code === '0000') {
        let {data} = res.data;
        let arr = this.fileService.base64ToArrayBuffer(data);
        let blob = new Blob([arr]);
        saveAs(blob, name);
      } else {
        this.toastrService.error(res.msg);
      }
    });
  }

  downloadFiles(type?: string) {
    const zip = new JSZip();
    const nameZip = '一键下载.zip';
    let files = [];
    Object.keys(this.quotationForm.quotationBaseInfo).forEach((item: string) => {
      if (item.endsWith('Files')) {
        files = [...files, ...this.quotationForm.quotationBaseInfo[item]];
      }
    });
    console.log(files);
    const PromiseAll = [];
    files.forEach((item) => {
      const id = item['id'];
      const uri = '/act/file/download/' + id;
      PromiseAll.push(this.http.get(uri).toPromise());
    });
    Promise.all(PromiseAll).then((values) => {
      let nameArr = [];
      values.forEach((res, index) => {
        if (res.code === '0000') {
          const { data, name } = res.data;
          const arr = this.fileService.base64ToArrayBuffer(data);
          const blob = new Blob([arr]);
          console.log(blob);
          if (type === 'ZIP') {
            let nameFixed = name;
            while (nameArr.indexOf(nameFixed) > -1) {
              nameFixed = getNewFileName(nameFixed);
            }
            nameArr.push(nameFixed);
            // zip.file(`${name}(${index + 1})`, blob);
            zip.file(`${nameFixed}`, blob);
          } else {
            saveAs(blob, name);
          }
        } else {
          this.toastrService.error(res.msg);
        }
      });
      if (type === 'ZIP') {
        zip.generateAsync({ type: 'blob' }).then((content) => {
          console.log(content);
          if (content) {
            FileSaver.saveAs(content, nameZip);
          }
        });
      }
    });

    function getNewFileName(name: string) {
      const lastDotIdx = name.lastIndexOf('.');
      let result = name;
      if (lastDotIdx > -1) {
        let prefix = name.substring(0, lastDotIdx);
        let suffix = name.substring(lastDotIdx);
        result = prefix + ' - Copy' + suffix;
      } else {
        result = name + ' - Copy';
      }
      return result;
    }
  }

  getWbsSet() {
    let wbsSet = new Set([]);
    let realWbsList = this.quotationForm.wbsList;
    if(!this.isObjEmpty(realWbsList)) {
      for (let [key, value] of Object.entries(realWbsList)) {
        let arr = value as Array<any>;
        for(let item of arr) {
          if(item['wbs'] && '' !== item['wbs']){
            wbsSet.add(item['wbs']);
          }
        }
      }
    }

    console.log('getWbsSet', wbsSet);
    console.log('getWbsSet', wbsSet.size);
    return wbsSet;
  }

  getGiDataByWbsSet(wbsSet: Set<any>) {
    if(wbsSet && wbsSet.size >0) {
      let inStr = '';
      for (var item of Array.from(wbsSet.values())) {
        if(item.toString().trim() !=='') {
          inStr += `'`+ item + `',`;
        }
      }
      inStr = inStr.slice(0,-1);
      const queryCondition = `WBS_Element in (`+ inStr + `) and status='1'`;
      // console.log('getGIDATA', queryCondition);

      this.http.post('/act/masterdata/queryByWhere/gidata', {condition: queryCondition}).subscribe(res => {
        if('0000' == res.code) {
          console.log('getGIDATA',res.data);
          let wbsArr = res.data as Array<any>;
          if(wbsArr.length >0){
            this.initQuotationListWBS(wbsArr);
          }
        }
      });
    }
  }

  initQuotationListWBS(gidataList?:Array<any>) {

    let tmpWbsList = [];
    let realWbsList = this.quotationForm.wbsList;
    if (this.quotationForm.quotationList.length > 0) {
      for (let item of this.quotationForm.quotationList) {
        let count = Number.parseInt(item['counts']);
        let wbsArr;
        if (!this.isObjEmpty(realWbsList) && realWbsList[item['rowid']]) {
          wbsArr = realWbsList[item['rowid']];
        }
        for (let i = 0; i < count; i++) {
          let wbsValue = '';
          let omLabelValue = []; //P2 added
          let giDateValue = '';
          let shipToNameValue = '';
          let seriesNoValue = '';
          if (wbsArr && wbsArr[i]) {
            let wbsSample = wbsArr[i];
            wbsValue = wbsSample['wbs'] ? wbsSample['wbs'] : '';
            omLabelValue = wbsSample['omLabel'] ? wbsSample['omLabel'] : [];
            giDateValue = '';
            shipToNameValue = '';
            seriesNoValue = '';
            if(gidataList) {

              for(let item of gidataList) {
                if (item['WBS_Element'] === wbsValue) {
                  giDateValue = item['Actual_GI_date'] || '';
                  shipToNameValue = item['Ship_To_Name'] || '';
                  seriesNoValue = item['SN'] || ''; // 产品序列号
                  break;
                }
              }
            }
            // giDateValue = wbsSample['giDate'] ? wbsSample['giDate'] : '';
            // shipToNameValue = wbsSample['shipToName'] ? wbsSample['shipToName'] : '';
          }
          tmpWbsList.push({ wbs: wbsValue, giDate: giDateValue, shipToName: shipToNameValue, seriesNo: seriesNoValue, omLabel: omLabelValue,  ...item }); //TODO  add产品序列号
        }
      }
    }
    console.log('initQuotationListWBS', tmpWbsList);
    this.quotationListWBS = [...tmpWbsList];
  }

  updateWbsSingle(event, rowIndex, key) {
    this.quotationListWBS[rowIndex][key] = event.target.value;
    this.quotationListWBS = [...this.quotationListWBS];
    this.updateWbsListInQuotationForm();
    this.elementsChanged();
  }

  updateWbsInfoSingle(row, rowIndex) {
    if (!row['wbs'] || '' == row['wbs']) {
      this.toastrService.warning('请输入对应亚型订单的WBS号！');
      return;
    }
    let wbsNo = row['wbs'];

    this.http.post('/act/masterdata/queryJsonByCondition/gidata', {status: '1', 'WBS_Element': wbsNo}).subscribe(res => {
      if ('0000' == res.code) {
        const data = JSON.parse(res.data);
        // console.log(res.data);
        if (data.length > 0) {
          let newItem = data[0];
          this.updateQuotationListWBSByGIData(wbsNo, newItem);
        } else {
          this.toastrService.info('未查询到对应WBS号的GI Date和Ship to Name信息！');
          this.updateQuotationListWBSByGIData(wbsNo, null);
        }

      } else {
        this.toastrService.error(res.msg);
        this.updateQuotationListWBSByGIData(wbsNo, null);
      }
      console.log('updateWbsInfoSingle', this.quotationListWBS);
      //update form value;
      this.updateWbsListInQuotationForm();
    });
  }

  updateWbsListInQuotationForm() {
    let wbsList = {};
    for (let item of this.quotationListWBS) {
      if (!wbsList[item['rowid']]) {
        wbsList[item['rowid']] = [];
      }
      wbsList[item['rowid']].push({
        wbs: item['wbs'],
        omLabel: item['omLabel']
        // giDate: item['giDate'],
        // shipToName: item['shipToName']
      });
    }

    this.quotationForm.wbsList = wbsList;
    this.elementsChanged();
  }

  updateQuotationListWBSByGIData(wbsNo: string, giData: any) {
    if(!giData) {
      giData = {};
    }

    for (let wbsItem of this.quotationListWBS) {
      if (wbsItem['wbs'] && wbsNo === wbsItem['wbs']) {
        wbsItem['giDate'] = giData['Actual_GI_date'] || '';
        wbsItem['shipToName'] = giData['Ship_To_Name'] || '';
        wbsItem['seriesNo'] = giData['SN'] || '';
      }
    }
    this.quotationListWBS = [...this.quotationListWBS];

  }


  //初始化部分表单控件
  initMisc() {
    this.fetchMisc((data) => {
      //console.log(data);
      //销售团队selects
      this.salesGroupSelect = [...data['salesGroup']];

      //订单类型selects
      this.purchaseTypeSelect = [...data['purchaseType']];
      if (!this.quotationForm.quotationBaseInfo.purchaseTypeCode) {
        this.quotationForm.quotationBaseInfo.purchaseTypeCode = '0';
        this.quotationForm.quotationBaseInfo.purchaseTypeName = '非直投';
      }

      //solution
      this.solutionTypeSelect = [...data['solutionType']];
      if (!this.quotationForm.quotationBaseInfo.solutionTypeCode) {
        this.quotationForm.quotationBaseInfo.solutionTypeName = '不含Solution';
        this.quotationForm.quotationBaseInfo.solutionTypeCode = '0';
      }

      //贸易术语
      this.tradeTermSelect = [...data['tradeTermType']];
    });
  }

  fetchMisc(cb) {
    const req = new XMLHttpRequest();
    req.open('GET', `assets/json/quotation-misc.json`);

    req.onload = () => {
      const data = JSON.parse(req.response);
      cb(data);
    };

    req.send();
  }

  changeMiscSelect(event, item) {
    // console.log(event);

    let itemName = item + 'Name';
    let itemCode = item + 'Code';
    if (event) {
      let codeValue = event['code'];
      this.quotationForm.quotationBaseInfo[itemCode] = codeValue;
    } else {
      this.quotationForm.quotationBaseInfo[itemName] = '';
      this.quotationForm.quotationBaseInfo[itemCode] = '';
    }
    this.elementsChanged();
  }

  //是否直投的表单控制
  purchaseTypeRefactor() {
    if (this.quotationForm.quotationBaseInfo['purchaseTypeCode'] && '1' === this.quotationForm.quotationBaseInfo['purchaseTypeCode']) {
      //所有的直投都不需要选择经销商，填写经销商信息
      this.distributorDisableFlag = true;
      this.quotationForm.quotationBaseInfo.distributorName = '';
      this.quotationForm.quotationBaseInfo.distributorId = '';
      this.quotationForm.quotationBaseInfo.distributorAddress = '';
      this.quotationForm.quotationBaseInfo.distributorContactPhone = '';
      this.quotationForm.quotationBaseInfo.distributorEmail = '';
      this.quotationForm.quotationBaseInfo.distributorContact = '';
      this.quotationForm.quotationBaseInfo.distributorTaxId = '';
      this.quotationForm.quotationBaseInfo.distributorAgreementNos = '';

    } else {
      this.distributorDisableFlag = false;

    }

    this.elementsChanged;
  }

  changeAgreementNo(event) {
    let agreementNos = '';
    this.quotationForm.quotationBaseInfo.agreementNo = '';
    if (event) {
      console.log(this.selectedAgreemenNo);
      for (let item of event) {
        // this.quotati]onForm.quotationBaseInfo.agreementNo.push(item['Agreement_No']);
        agreementNos += item['AgreementNo'] + ',';
      }
      agreementNos = agreementNos.slice(0, -1);
    }
    this.quotationForm.quotationBaseInfo.agreementNo = agreementNos;
    this.elementsChanged();
  }


  initThreeBooleanFlag() {
    this.isStandard = this.orderType === '0' ?  true:false;
    this.isZhitou = '非直投' === this.quotationForm.quotationBaseInfo.purchaseTypeName ? false : true;
    this.isUsd = this.quotationForm.quotationBaseInfo.currencyType === '1' ? true: false;
    this.initTooltipsKey();
  }

  initTooltipsKey() {
    this.otherSupportFilesTooltip = this.isStandard ? 'otherSupportFiles' : 'otherSupportFilesSpecial';
  }

  //For test
  fetchMockList(mockFileName, listName, cb) {
    const req = new XMLHttpRequest();
    let uri = 'assets/json/' + mockFileName;
    // req.open('GET', `assets/json/quotation-misc.json`);
    req.open('GET', uri);

    req.onload = () => {
      const data = JSON.parse(req.response);
      cb(data[listName]);
    };

    req.send();
  }

  /** new code ends */

  //打开合同模板下载modal
  openContractModal() {
    // let pId = this.processInstanceId;
    let pId = localStorage.getItem('processInstanceId');

    if(!pId) {
      console.log('localStorage获取pId失败...');
      return;
    }

    if (!this.isZhitou && (!this.quotationForm.quotationBaseInfo.agreementNo || '' === this.quotationForm.quotationBaseInfo.agreementNo)) {
      this.toastrService.warning('请选择协议号后导出合同');
      return;
    }

    if (!this.customDisabled['tradeTerm'] || !(this.customDisabled['agreementNo'] || this.isZhitou)) {
      this.triggerSaveTask();
    }

    if (!this.quotationForm.quotationBaseInfo.tradeTerm || '' === this.quotationForm.quotationBaseInfo.tradeTerm) {
      this.toastrService.warning('请选择贸易术语后导出合同');
      return;
    }

    if (true) {
      const modal: NgbModalRef = this.modalService.open(ContractExportModalComponent, {
        size: 'lg',
        backdrop: 'static',
        keyboard: false
      });
      (<ContractExportModalComponent>modal.componentInstance).processInstanceId = pId;

      modal.result.then((result) => {
        if ('simple' == result) {
          console.log('modal simply closed');
        }
      }, (reason) => {
        console.log(`Dismissed ${this.getDismissReason(reason)}`);
      });
    } else {
      this.toastrService.warning('');
      return;

    }
  }

  //validation
  validateRequiredNameElements() {
    let formType = ['ng-select','input','select','textarea']
    let nameList=[]
    let validateStatus = '1';
    formType.forEach(v=>{
      let formElements = this.el.nativeElement.getElementsByTagName(v);
      // console.log('kk', formElements);
      if (v==='ng-select') {
        for (let i = 0; i < formElements.length; i++) {
          let item = formElements[i];
          if (item.hasAttribute('required') && item.getAttribute('name')) {
            nameList.push(item.getAttribute('name'))
          }
        }
      } else{
        for (let i = 0; i < formElements.length; i++) {
          if (formElements[i].name && formElements[i].required) {
            nameList.push(formElements[i].name)
          }
        }
      }
    })

    console.log('need to be validated input name',nameList);
    this.globalService.theValidator = '1';
    for(const item of nameList){
      if ((!this.quotationForm.quotationBaseInfo[item] && 0 !== this.quotationForm.quotationBaseInfo[item]) || '' === this.quotationForm.quotationBaseInfo[item]) {
        this.globalService.theValidator = '0';
        console.log('required valid failed: ', item);
        break;
      }
    }

    this.quotationListValidation();
    this.exportVerificationFilesValidation();
  }

  //亚型订单必须添加校验
  quotationListValidation() {
    if(this.quotationForm.quotationList.length < 1 || this.quotationForm.totalAllList.length < 1) {
      this.toastrService.warning("请添加至少一个亚型订单");
      this.globalService.theValidator = '0';
      return;
    }

    this.quotationListDetailValidation();
  }

  //校验有无完整编辑过所有的订单信息
  quotationListDetailValidation() {
    for (let item of this.quotationForm.quotationList) {
      if (!item['qdetail']) {
        let productInfo = '临床分类：' + item['Clinical_Segmentation'] + ', 亚型名称：' + item['quotation'];
        this.toastrService.warning('请编辑完整的亚型定单信息：' + productInfo);
        this.globalService.theValidator = '0';
        break;
      }
    }
  }

  //出口管制文件校验
  exportVerificationFilesValidation() {
    if (!this.customDisabled['oaAppendedFiles']) {
      let allChinese = true;
      for(let item of this.quotationForm.quotationList){
        if(item['regioncn'] !== '中国'){
          allChinese = false;
          break;
        }
      }

      if (!this.quotationForm.quotationBaseInfo['exportVerificationFiles']
        || this.quotationForm.quotationBaseInfo['exportVerificationFiles'].length < 1) {

        if(allChinese) {
          this.toastrService.warning("请至少上传一个出口管制文件");
          this.globalService.theValidator = '0';
        } else {
          this.toastrService.warning("亚型原产地非中国，出口管制文件必须上传");
          this.globalService.theValidator = '0';
        }
      }
    }
  }

  //for dev
  testB: boolean = true;
  changeBoolean(){
    if(this.testB) {
      this.testB = false;
    } else {
      this.testB = true;
    }
  }

  //手动触发校验效果
  forceTouch() {
    this.commercialInputs.forEach((item) => {
      // console.log(item);
      item.control.markAsTouched();
    });
  }

  //非空校验
  validateCommercial(){
    this.globalService.theValidator = '0';
    this.forceTouch();
    this.validateRequiredNameElements();
  }
  //validation end

  updateMyself() {
    console.log('updateMyself');
    // console.log('updateMyself',this.clinicalSelectSet)
    // console.log('updateMyself', this.isStandard);
    this.ngOnInit();
  }

  updateSumPrice(rowid?, force?) {

    if(rowid != null) {
      let newList = [];
      this.quotationForm.quotationList.map((item)=> {
        if (item['unitTotalPrice']) {
          if(item['rowid'] === rowid) {
            let prefix = item['unitTotalPrice'].toString().indexOf('$') > -1 ? '$ ' : '￥ ';
            let unitP = Number(item['unitTotalPrice'].replace(/[^0-9\.]/g, '')) || 0;
            let counts = Number(item['counts']) || 0;
            item['sumPrice'] = prefix + (unitP * counts);
          }
        }
        /** manualUpdate sumPrice related */
        if (item['rawUnitTotalPrice']) {
          if (item['rowid'] === rowid) {
            let prefix = item['rawUnitTotalPrice'].toString().indexOf('$') > -1 ? '$ ' : '￥ ';
            let unitP = Number(item['rawUnitTotalPrice'].replace(/[^0-9\.]/g, '')) || 0;
            let counts = Number(item['counts']) || 0;
            item['rawSumPrice'] = prefix + (unitP * counts);
            if(force) {
              unitP = Number(item['unitTotalPrice'].replace(/[^0-9\.]/g, '')) || 0;
              item['rawUnitTotalPrice'] = prefix + unitP;
              item['rawSumPrice'] = prefix + (unitP * counts);
            }
          }
        }
        /** manualUpdate sumPrice related */
        newList.push(item);
      });
      this.quotationForm.quotationList = [...newList];
    } else {
      let newList = [];
      this.quotationForm.quotationList.map((item)=> {
        if (item['unitTotalPrice']) {
          let prefix = item['unitTotalPrice'].toString().indexOf('$') > -1 ? '$ ' : '￥ ';
          let unitP = Number(item['unitTotalPrice'].replace(/[^0-9\.]/g, '')) || 0;
          let counts = Number(item['counts']) || 0;
          item['sumPrice'] = prefix + (unitP * counts);
        }
        /** manualUpdate sumPrice related */
        if (item['rawUnitTotalPrice']) {
          let prefix = item['rawUnitTotalPrice'].toString().indexOf('$') > -1 ? '$ ' : '￥ ';
          let unitP = Number(item['rawUnitTotalPrice'].replace(/[^0-9\.]/g, '')) || 0;
          let counts = Number(item['counts']) || 0;
          item['rawSumPrice'] = prefix + (unitP * counts);
        /** manualUpdate sumPrice related */
        }
        newList.push(item);
      });
      this.quotationForm.quotationList = [...newList];
    }
  }

  updateDefaultIgm(rowid?) {
    if (rowid != null) {
      let newList = [];
      this.quotationForm.quotationList.map((item) => {
        if (item['qdetail'] && item['qdetail']['totalRows']) {
          let igm = undefined;
          if (item['rowid'] === rowid) {
            for(const el of item['qdetail']['totalRows']){
              if(el['total_code'] == 'T14') {
                igm = (Number(el['money']) * 100).toFixed(2) || undefined;
                break;
              }
            }
            item['igm'] = igm;
          }
        }
        newList.push(item);
      });
      this.quotationForm.quotationList = [...newList];
    } else {
      let newList = [];
      this.quotationForm.quotationList.map((item) => {
        if (item['qdetail'] && item['qdetail']['totalRows']) {
          let igm = undefined;
          for (const el of item['qdetail']['totalRows']) {
            if (el['total_code'] == 'T14') {
              igm = (Number(el['money']) * 100).toFixed(2) || undefined;
              break;
            }
          }
          item['igm'] = igm;
        }
        newList.push(item);
      });
      this.quotationForm.quotationList = [...newList];
    }
  }

  //手动修改igm
  updateIgmInT14(event, rowIndex){
    const v = Number(event.target.value) || 0;
    this.quotationForm.quotationList[rowIndex]['igm'] = v;

    if (this.quotationForm.quotationList[rowIndex]['qdetail'] && this.quotationForm.quotationList[rowIndex]['qdetail']['totalRows']) {
      // let igmObj = { total_code: 'T14', total: 'IGM', money: (v/100) };
      for (let obj of this.quotationForm.quotationList[rowIndex]['qdetail']['totalRows']) {
        if(obj['total_code'] == 'T14') {
          // if(obj['money'] != v/100) {
          this.quotationForm.quotationList[rowIndex]['qdetail']['igmEdited'] =true;
          obj['money'] = v/100;
          // }
          break;
        }
      }
    }

    this.quotationForm.quotationList = [...this.quotationForm.quotationList];
    this.elementsChanged();
  }

  triggerSaveTask() {
    let saveTaskBtnAlt = document.getElementById('saveTaskBtnAlt') as HTMLElement;
    // console.log(saveTaskBtn);
    if (saveTaskBtnAlt) {
      saveTaskBtnAlt.click();
    }
  }

  isObjEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }

  viewPrimaryPdf(row: any) {
    if(!row.qdetail) {
      this.toastrService.warning("请填写完整的报价单信息!");
      return;
    }

    const modal: NgbModalRef = this.modalService.open(ApprovalSimpleModalComponent, {
      size: 'lg',
      windowClass: 'quotation-modal',
      backdropClass: 'quotation-backdrop',
      backdrop: 'static',
      keyboard: false
    });

    (<ApprovalSimpleModalComponent>modal.componentInstance).pageType = 'quotationSimplePdf';
    (<ApprovalSimpleModalComponent>modal.componentInstance).paramsToPass = row.qdetail;
  }

  private loadSales() {
    this.sales$ = concat(
      of([]), // default items, empty
      this.salesInput$.pipe(
        debounceTime(500),
        filter(term => this.imeFlag && term && term.length > 1),
        distinctUntilChanged(),
        tap(() => this.salesLoading = true),
        switchMap(term => this.getsales(term).pipe(
          tap(() => this.salesLoading = false)
        ))
      )
    );
  }

  private getsales(term: string = null): Observable<any[]> {
    let subj = new Subject<any[]>();
    this.salesTmpList = [];
    if (term && '' != term.trim()) {
      let uri = '/act/queryUserByKeyword/' + term;
      this.http.get(uri).subscribe(res => {
        console.log('getsales-res', res);
        if('0000' == res['code']) {
          let list = [];
          res['data'].forEach(item => {
            item['label'] = item['name'] + '(' + item['email'] + ')';
            list.push(item);
          });
          this.salesTmpList = list;
          subj.next(list);
        } else {
          return of([]);
        }
      });
      return subj.asObservable();
    }
    return of([]);
  }

  compareWithSales(a: any, b: any): boolean {
    return a && b && a.code === b;
  }

  getSalesInfo(event) {
    console.log('==> getSalesInfo:', event, this.salesCode1);
    if(event){
      this.quotationForm.quotationBaseInfo['salesSapCode'] = event['sapCode'] || '';
      if(!event['sapCode'] || '' === event['sapCode']) {
        this.toastrService.warning('该用户在系统中未找到SapCode，请联系管理员！');
      }
      this.elementsChanged();
    } else {
      this.quotationForm.quotationBaseInfo['salesSapCode'] = '';
      this.elementsChanged();
    }
  }

  updateDistributorSapCode() {
    if (this.quotationForm.quotationBaseInfo.distributorId && '' !== this.quotationForm.quotationBaseInfo.distributorId) {
      //主数据中的DMSID都为大写英文字母
      let dmsid = this.quotationForm.quotationBaseInfo.distributorId.toUpperCase();
      this.http.post('/act/masterdata/queryJsonByCondition/dealerinfo', {
        'status': '1',
        'DMSID': dmsid
      }).subscribe(res => {
        if ('0000' == res.code) {
          let dealers = JSON.parse(res['data']);
          console.log('dealerinfo', dealers);
          if (dealers.length > 0) {
            const dealer = dealers[0];
            this.quotationForm.quotationBaseInfo.distributorSapCode = dealer['DistributorSapCode'] || '';
          }
        } else {
          console.log(res.msg);
        }
      });
    } else {
      this.toastrService.warning('未选择经销商或该经销商的DMSID为空，请联系管理员！');
    }
  }

  updateSalesSapCode() {
    if(this.salesCode1) {
      for(const sale of this.salesTmpList) {
        if(this.salesCode1 == sale['code']) {
          this.quotationForm.quotationBaseInfo['salesSapCode'] = sale['sapCode'] || '';
          this.elementsChanged();
          if (!sale['sapCode'] || '' === sale['sapCode']) {
            this.toastrService.warning('该用户在系统中未找到SapCode，请联系管理员！');
          }
          break;
        }
      }
    }
  }

  getTooltipInfo(key: string): string {
    return this.ttRaw[key];
  }

  initTooltips() {
    this.ttRaw = this.tooltipService.getTooltipJson();
  }

  formatNumber(event, key:string) {
    let tmp = event.target.value ? event.target.value.toString().replace(/[^-?\d*\.?\d+$]/g, '') : 0;
    tmp = Number(tmp) || null;
    event.target.value = tmp;
    this.quotationForm.quotationBaseInfo[key] = tmp;
  }

  // 导出已选择亚型配置单的excel xlsx文件
  exportExcel(row: any) {
    // console.log('exportExcel,', row);
    if (!row.qdetail) {
      this.toastrService.warning("请填写完整的报价单信息!");
      return;
    }

    this.pdfmakeService.getSimpleXlsx(row, this.quotationForm.quotationBaseInfo, false);
  }

  validateRdd() {
    this.globalService.theValidator = '0';
    if(this.quotationForm.quotationBaseInfo.version) {
      const rrdInput = this.quotationForm.quotationBaseInfo.receiveDate as any;
      console.log('rrdInput', rrdInput);
      const rddMax: NgbDate = NgbDate.from(this.rddMaxDate);
      const re = rddMax.after(rrdInput) || rddMax.equals(rrdInput);
      if(re) {
        this.globalService.theValidator = '1';
      }
    } else { //兼容老数据
      this.globalService.theValidator = '1';
    }
  }

  openPricingLabelModal(row) {
    let modalSize: 'lg' | 'sm' = 'sm';
    const modal: NgbModalRef = this.modalService.open(SmallSimpleModalComponent, {
      size: modalSize,
      backdrop: 'static',
      // backdrop: true,
      keyboard: false
    });


    let tagMode = this.customDisabled['pricingLabel'] ? 'default' : 'closeable' ;
    const params = {
      tags: row['pricingLabel'] || [],
      tagMode: tagMode
    };

    (<SmallSimpleModalComponent>modal.componentInstance).pageType = 'pricingLabel';
    (<SmallSimpleModalComponent>modal.componentInstance).title = 'Pricing标签';
    (<SmallSimpleModalComponent>modal.componentInstance).params = params;

    modal.result.then((result) => {
      if ('simple' == result) {
        console.log('modal simply closed');
      } else {
        row['pricingLabel'] = result;
        this.elementsChanged();
      }
    }, (reason) => {
      console.log(`Dismissed ${this.getDismissReason(reason)}`);
    });
  }

  openOmLabelModal(row, rowIndex:number) {

    console.log('row', row);
    let modalSize: 'lg' | 'sm' = 'sm';
    const modal: NgbModalRef = this.modalService.open(SmallSimpleModalComponent, {
      size: modalSize,
      backdrop: 'static',
      // backdrop: true,
      keyboard: false
    });

    const tags = row['omLabel'] || [];

    let tagMode = this.customDisabled['omLabel'] ? 'default' : 'closeable';
    const params = {
      tags:tags,
      tagMode: tagMode
    };

    (<SmallSimpleModalComponent>modal.componentInstance).pageType = 'omLabel';
    (<SmallSimpleModalComponent>modal.componentInstance).title = 'OA标签';
    (<SmallSimpleModalComponent>modal.componentInstance).params = params;

    modal.result.then((result) => {
      if ('simple' == result) {
        console.log('modal simply closed');
      } else {
        const event = {target:{value: result}};
        this.updateWbsSingle(event, rowIndex, 'omLabel')
        this.elementsChanged();
      }
    }, (reason) => {
      console.log(`Dismissed ${this.getDismissReason(reason)}`);
    });
  }

  /* manullyChangeSumPrice begins */
  generateParams({ id, quotation, qdetail, quotationId, Clinical_Segmentation, _6nc, rowid, unitTotalPrice, rawUnitTotalPrice }): any {
    // if
    let distributorId = this.quotationForm.quotationBaseInfo.distributorId ? this.quotationForm.quotationBaseInfo.distributorId : '';
    let philipsType = this.quotationForm.quotationBaseInfo.philipsType ? this.quotationForm.quotationBaseInfo.philipsType : '';
    let currencyType = '';
    if (!this.quotationForm.quotationBaseInfo['currencyType'] || '' == this.quotationForm.quotationBaseInfo['currencyType']) {
      return;
    } else {
      currencyType = this.quotationForm.quotationBaseInfo['currencyType'] == '1' ? 'usd' : 'rmb';
    }
    const params = {
      distributorId: distributorId,
      philipsType: philipsType,
      // philipsAuthList: philipsAuthList,
      isZhitou: this.isZhitou,
      igmFlag: this.igmFields,
      orderType: this.orderType,
      customParams: { 'type': 'commercial' },
      quotationId: id,
      _6nc: _6nc,
      quotation,
      qdetail: qdetail,
      disabled: false,
      currencyType: currencyType,
      // isPrivate: isPrivate,
      // hospitalType: hospitalType,
      subTypeId: quotationId,
      clinical: Clinical_Segmentation,
      unitTotalPrice: unitTotalPrice,
      rawUnitTotalPrice: rawUnitTotalPrice
    }
    return params;
  }

  /* manullyChangeSumPrice ends */

  updateUnitTotalPriceByHand(event, cell, rowIndex) {
    const prefix = this.utilityService.getCurrencyPrefix(this.currencyType);
    const rawPrice = '';
    console.log('updateUnitTotalPriceByHand => ', event, cell, rowIndex);
    this.editingCell[rowIndex + '-' + cell] = false;
    const item = this.quotationForm.quotationList[rowIndex];
    console.log(item);
    if(item && item['unitTotalPrice']){
      if(!item['rawUnitTotalPrice']) {//兼容现有数据
        item['rawUnitTotalPrice'] = item['unitTotalPrice'];
        item['rawSumPrice'] = item['sumPrice'];
      }
      const counts: number = Number(item['counts']) || 1;
      const sumPriceChangedStr: string = event.target.value ? event.target.value.toString().replace(/[^0-9.-]/g, '') : '';
      const unitTotalPriceChangedStr = this.utilityService.simpleDivision2Decimal(sumPriceChangedStr, counts);
      console.log(counts, ' ==> ', sumPriceChangedStr, " ==> ", unitTotalPriceChangedStr);
      if (Number(unitTotalPriceChangedStr) <= 0) {
        //no change for unitTotalPrice and sumPrice
      } else {
        item["unitTotalPrice"] = prefix + ' ' + unitTotalPriceChangedStr;
        item["sumPrice"] = prefix + ' ' + sumPriceChangedStr;
      }
      this.quotationForm.quotationList = [...this.quotationForm.quotationList];
      this.manualUpdate(item, rowIndex);
      this.elementsChanged();
    } else {
      return;
    }
    // console.log('after change =>', this.totalListCommercial[rowIndex][cell]);
  }

  manualUpdate(row, rowIndex) {
    console.log('manullyUpdate row => ', row);
    console.log('manullyUpdate rowIndex => ', rowIndex);
    if(row && row['qdetail']){
      const params = this.generateParams(row);
      console.log('manullyUpdate params => ', params);
      this.quotationCalcService.getResFromAmountSum(params).subscribe(res => {
        console.log('res.data => ', res.data);
        if('0000' == res.code) {
          const data = res.data;
          const unitTotalList = this.quotationCalcService.generateTotalList(data);
          console.log('total List => ', unitTotalList);
          this.quotationForm.quotationList[rowIndex]['qdetail']['totalRows'] = unitTotalList;
          this.updateTotalAll(true);
          this.elementsChanged();
        }
      });
    }
  }

  changeEditingCell(rowId, flag) {
    if (this.unitTotalPriceEditable && flag) {
      this.editingCell[rowId + flag] = true;
    }
  }
  /* manullyChangeSumPrice ends */
}
