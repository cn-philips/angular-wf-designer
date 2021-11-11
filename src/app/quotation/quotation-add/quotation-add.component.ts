import {Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {NgModel} from '@angular/forms';
import {FieldType} from '@ngx-formly/core';
import { FileService, GlobalService, HttpService, NgxDatatableService, AcceptTermService, PdfmakeService, UtilityService, QuotationCalcService } from '../../services';
import {ApprovalSimpleModalComponent} from '../../approval-simple-modal/approval-simple-modal.component';
import {QuotationLicenseModalComponent} from '../quotation-license-modal/quotation-license-modal.component';
import {ModalDismissReasons, NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {QuotationFormModel} from './QuotationForm.model';
import {concat, Observable, of, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, switchMap, tap} from 'rxjs/operators';
import {saveAs} from 'file-saver';
import {UUID} from 'angular2-uuid';
import 'url-search-params-polyfill';


@Component({
  selector: 'quotation-add',
  templateUrl: './quotation-add.component.html',
  styleUrls: ['./quotation-add.component.scss']
})
export class QuotationAddComponent extends FieldType implements OnInit {

  //upload progress related
  progressCount: number = 0;

  @ViewChild('qav') qav: ElementRef;
  @ViewChild('sofonFilesInput') sofonFilesInput: ElementRef;
  @ViewChildren('specialTag', {read: NgModel}) specialInputs: QueryList<NgModel>;
  disabled: boolean = false;
  customDisabled: object = {};
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
  //sprint 5 moded
  distributorDisableFlag: boolean = false;
  salesGroupSelect = [];
  purchaseTypeSelect = [];
  solutionTypeSelect = [];
  isZhitou: boolean = false; //是否直投
  isUsd: boolean = true;
  igmFields: boolean = false;
  sofonFilesFields: boolean = false;
  igmchangeFlag: boolean = false;

  //20200601 可以修改设备总价
  editingCell: any = {};
  unitTotalPriceEditable: boolean = false;

  constructor(private http: HttpService,
              private modalService: NgbModal,
              private ngxDatatableService: NgxDatatableService,
              private toastrService: ToastrService,
              private fileService: FileService,
              private globalService: GlobalService,
              private el: ElementRef,
              private acceptTermService: AcceptTermService,
              private utilityService: UtilityService,
              private quotationCalcService: QuotationCalcService,
              private pdfmakeService: PdfmakeService) {
    super();
    this.initMisc();
  }

  ngOnInit() {
    //file upload progress control
    this.fileService.progressSubject.subscribe(res => {
      this.progressCount = res as number;
    });

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
          this.acceptTermService.acceptTermsHiddenChange(false);
        }
      } else {

      }
      /** 兼容处理；更新单个quotation的总价, 手动修改预处理老数据 */
      if(!this.disabled) {
        if(this.quotationForm.quotationList && this.quotationForm.quotationList.length > 0) {
          this.quotationForm.quotationList.forEach((item) => {
            const rowId = item['rowid'];
            if(rowId && item['unitTotalPrice'] && !!item['sumPrice']) {
              this.updateSumPrice(rowId);
            }
          });
        }
      }
    } else {// version init here
      //version2 init start
      this.quotationForm.quotationBaseInfo.version = '2';
      this.quotationForm.quotationBaseInfo.isPrivate = 0;
      //version2 init end
    }

    // //勾选承诺 订阅更新
    this.acceptTermService.acceptTermChanged.subscribe(res=> {
      if(res && res.length > 0) {
        this.quotationForm.quotationBaseInfo.acceptTerm = res;
        this.elementsChanged();
      }
    });

    //initHiddenFields
    this.initHiddenUIFields();


    //初始化表单初始值
    this.initDefaultFormValue();

    //客户字典相关
    this.loadHospital();
    this.loadDistributor();

    //即时汇率相关
    // this.updateUsRate();

    //直投or非直投；美金or人民币
    this.initTwoBooleanFlag();
    this.purchaseTypeRefactor();

    if (this.igmFields) {
      this.updateDefaultIgm();
      console.log('igm init', this.quotationForm);
    }
  }

  //ngOnInit ends

  initCustomDisabled(flag?: boolean) {
    this.customDisabled = {
      ctp: true,
      ctpRatio: true,
      ctpall: true,
      ctpallRatio: true,
      sofonFiles: true
    };

    if(flag === true) return;//我的任务（已办）

    const formState = this.options.formState;

    if (formState) {
      this.customDisabled['ctpall'] = formState['ctptotal'] ? formState['ctptotal']['readonly'] : true;
      this.customDisabled['ctpallRatio'] = formState['ctptotal'] ? formState['ctptotal']['readonly'] : true;
      this.customDisabled['ctp'] = formState['ctpsingle'] ? formState['ctpsingle']['readonly'] : true;
      this.customDisabled['ctpRatio'] = formState['ctpsingle'] ? formState['ctpsingle']['readonly'] : true;
      this.customDisabled['sofonFiles'] = formState['sofonfiles'] ? formState['sofonfiles']['readonly'] : true;
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

    if (this.form.controls['igmflag']) { //igm显示
      this.igmFields = true;
    }

    if (this.form.controls['igmchangeflag']) { //igm可编辑
      this.igmchangeFlag = true;
    }

    if (this.form.controls['sofonfiles'] && formState['sofonfiles']['hidden'] != '1') { //sofon文件
      this.sofonFilesFields = true;
    }

    //勾选承诺 初始赋值
    if(!this.disabled && !this.quotationForm.quotationBaseInfo.acceptTerm && !isTaskCompleted && formState && formState['acceptterm']) {
      const terms = formState['acceptterm']['default'] || '';
      let termArr = terms.split(';;;;;');
      let acceptTermDefault = [];
      if(termArr[0] !== '') {
        termArr.forEach((item, index) => {
          acceptTermDefault.push({'accept': 0, 'term': item});
        });
      }
      if(acceptTermDefault.length > 0) {
        this.quotationForm.quotationBaseInfo.acceptTerm = acceptTermDefault;
        this.acceptTermService.acceptTermsChange(acceptTermDefault);
        this.acceptTermService.acceptTermsHiddenChange(false);
      }
    }

    //initCustomDisabled
    this.initCustomDisabled(isTaskCompleted);
    //manualUpdateUnitTotalPrice
    if (!this.disabled && formState && formState['editUnitTotalPrice'] ) { //报价单 单个ctp相关
      this.unitTotalPriceEditable = !formState['editUnitTotalPrice']['readonly'];
    }
  }

  initDefaultFormValue() {
    //业务类型默认为：US-区域分销 86000002
    // if (!this.quotationForm.quotationBaseInfo.businessType || '' == this.quotationForm.quotationBaseInfo.businessType) {
    //   this.quotationForm.quotationBaseInfo.businessType = '86000002';
    //   this.elementsChanged();
    // }
  }

  initQuotationSelectComponent() {
    const uri = '/act/masterdata/queryQuotAndprod';
    this.http.get(uri).subscribe(res => {
      console.log(res.data);
      if ('0000' == res.code) {
        const quotationList = res.data;
        console.log('initQuotationSelectComponent', quotationList);
        quotationList.forEach(({Clinical_Segmentation, Product_Name, subtype_name, subtype_ID, id, pub, ...others}) => {
          let pubStr = pub == '1' ? '公立' : pub == '0' ? '民营' : '其他';
          const _6nc = others['6NC'];
          this.clinicalSelectSet.add(Clinical_Segmentation);
          this.clinicalProductMap[Clinical_Segmentation] ?
            this.clinicalProductMap[Clinical_Segmentation].add(Product_Name) :
            this.clinicalProductMap[Clinical_Segmentation] = new Set([Product_Name]);
          this.clinicalProductQuotationMap[Clinical_Segmentation + '||' + Product_Name] ?
            this.clinicalProductQuotationMap[Clinical_Segmentation + '||' + Product_Name].push({
              text: subtype_name,
              value: subtype_ID,
              subValue: pubStr,
              subValueCode: pub
            }) :
            this.clinicalProductQuotationMap[Clinical_Segmentation + '||' + Product_Name] = ([{
              text: subtype_name,
              value: subtype_ID,
              subValue: pubStr,
              subValueCode: pub
            }]);
          this.clinicalProductQuotationIdMap[Clinical_Segmentation + '||' + Product_Name + '||' + subtype_ID + '||' + pub] = {
            id,
            _6nc,
            pub
          };
        });
      }
    });
    this.http.get('/act/masterdata/queryJson/hospitaldepartment').subscribe(res => {
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

  viewQuotationDetail({id, quotation, qdetail, quotationId, Clinical_Segmentation, _6nc}, event) {
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

    let hospitalType = '2'; // 1公立 0民营 2其他
    if (!this.quotationForm.quotationBaseInfo['enduserType'] || '' == this.quotationForm.quotationBaseInfo['enduserType']) {
      this.toastrService.warning('无最终用户类型，不能添加订单');
      return;
    } else {
      hospitalType = this.quotationForm.quotationBaseInfo['enduserType'].indexOf('公立') != -1 ? '1' : this.quotationForm.quotationBaseInfo['enduserType'].indexOf('民营') != -1 ? '0' : '2';
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
      isZhitou: this.isZhitou,
      igmFlag: this.igmFields,
      customParams: {'type': 'special'},
      quotationId: id,
      _6nc: _6nc,
      quotation,
      currencyType: currencyType,
      isPrivate: isPrivate,
      hospitalType: hospitalType,
      subTypeId: quotationId,
      clinical: Clinical_Segmentation,
      disabled: true,
      ...paramsToPass
    };
    if (qdetail) {
      (<ApprovalSimpleModalComponent>modal.componentInstance).paramsToPass = {
        distributorId: distributorId,
        philipsType: philipsType,
        philipsAuthList: philipsAuthList,
        isZhitou: this.isZhitou,
        igmFlag: this.igmFields,
        customParams: {'type': 'special'},
        quotationId: id,
        _6nc: _6nc,
        quotation,
        qdetail: qdetail,
        currencyType: currencyType,
        isPrivate: isPrivate,
        hospitalType: hospitalType,
        subTypeId: quotationId,
        clinical: Clinical_Segmentation,
        disabled: true,
        ...paramsToPass
      };
    }

  }

  editQuotationDetail({id, quotation, qdetail, quotationId, Clinical_Segmentation, _6nc, rowid}, event) {


    console.log(event);
    console.log(id);
    console.log(_6nc);

    console.log(this.quotationForm.quotationBaseInfo['currencyType']);

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

    const modal: NgbModalRef = this.modalService.open(ApprovalSimpleModalComponent, {
      size: 'lg',
      windowClass: 'quotation-modal',
      backdropClass: 'quotation-backdrop',
      backdrop: 'static',
      keyboard: false
    });
    let philipsType = this.quotationForm.quotationBaseInfo.philipsType ? this.quotationForm.quotationBaseInfo.philipsType : '';
    let philipsAuthList = this.quotationForm.quotationBaseInfo.philipsAuthList ? this.quotationForm.quotationBaseInfo.philipsAuthList : [];
    let distributorId = this.quotationForm.quotationBaseInfo.distributorId ? this.quotationForm.quotationBaseInfo.distributorId : '';
    (<ApprovalSimpleModalComponent>modal.componentInstance).pageType = 'quotation';
    const paramsToPass = (<ApprovalSimpleModalComponent>modal.componentInstance).paramsToPass;
    (<ApprovalSimpleModalComponent>modal.componentInstance).paramsToPass = {
      distributorId: distributorId,
      philipsType: philipsType,
      philipsAuthList: philipsAuthList,
      isZhitou: this.isZhitou,
      igmFlag: this.igmFields,
      customParams: {'type': 'special'},
      quotationId: id,
      _6nc: _6nc,
      quotation,
      currencyType: currencyType,
      isPrivate: isPrivate,
      hospitalType: hospitalType,
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
        igmFlag: this.igmFields,
        customParams: {'type': 'special'},
        quotationId: id,
        _6nc: _6nc,
        quotation,
        qdetail: qdetail,
        disabled: false,
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
        if (item['total_code'] === 'T8') {
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
    this.updateQuotationRowid()
    this.elementsChanged();
    this.updateTotalAll();
  }

  updateQuotationRowid() {
    if (this.quotationForm.quotationList.length > 0) {
      this.quotationForm.quotationList.forEach((item, index) => {
        item['rowid'] = index;
      });
    }
  }

  async addNewQuotation() {
    this.isAdding = true;

    if (!this.quotationForm.quotationBaseInfo.enduserName) {
      this.toastrService.warning('没有指定最终用户，不能添加！');
      this.isAdding = false;
      return;
    }

    if (!this.isZhitou && (!this.quotationForm.quotationBaseInfo.expectwinbidbz || '' == this.quotationForm.quotationBaseInfo.expectwinbidbz)) {
      this.toastrService.warning('请选择经销商利润币种');
      return;
    }

    //{id, _6nc, pub}
    const qParam = this.clinicalProductQuotationIdMap[this.selectClinicalValue + '||' + this.selectProductValue + '||' + this.selectQuotationIdValue];
    console.log('qParam', qParam);

    let nc6 = qParam['_6nc'];
    if (!nc6 || '' == nc6) {
      this.toastrService.warning('指定产品未查询到6NC号，不能添加，请联系管理员！');
      this.isAdding = false;
      return;
    }

    if (qParam['pub'] === '0') {//民营
      if (this.quotationForm.quotationBaseInfo.enduserType && this.quotationForm.quotationBaseInfo.enduserType.indexOf('民营') > -1) {
      } else {
        // below commented 20190627
        // this.toastrService.warning('医院类型和亚型订单模板类型不一致');
        // console.log(1);
        // this.isAdding = false;
        // return;
      }
    } else if (qParam['pub'] === '1') {//公立
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


    //TODO uncommment below before deploy!
    // let uri = '/act/product/checkDate?clinical=&nc6='+ qParam['_6nc'];
    // let res = await this.http.get(uri).toPromise();
    // if(res['code'] && res['code'] == '9998') {
    //   this.toastrService.error('指定产品（6NC: '+ nc6 +'）无有效证照，不能添加！');
    //   this.isAdding = false;
    //   return;
    // } else if (res['code'] && res['code'] == '0018') {
    //   this.toastrService.info('指定产品（6NC: '+ nc6 +'）有效期将终，请注意！');
    // } else if (res['code'] !== '0000') {
    //   this.toastrService.error(res.msg);
    //   this.isAdding = false;
    //   return
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

    let subTypeIdModed = this.selectQuotationIdValue.slice(0, this.selectQuotationIdValue.indexOf('||'));
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
    this.updateQuotationRowid();
    this.quotationForm.quotationList = [...this.quotationForm.quotationList];
    const quotationInputValue = JSON.stringify(this.quotationForm);

    console.log(this.quotationForm.quotationList);
    this.formControl.setValue(quotationInputValue);
    this.isAdding = false;
    this.clearClinicalAllSelected();
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
  }

  selectQuotation() {
    let quotationId = this.selectQuotationIdValue;

    if (!quotationId) {
      this.selectQuotationValue = undefined;
      return;
    }

    let selectedItem;
    this.quotationSelectSet.forEach(item => {
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
    if (item['unitTotalPrice']) {
      this.updateSumPrice(rowIndex);
      this.updateTotalAll();
    } else {
      this.updateTotalAll();
      this.elementsChanged();
    }
  }

  updateCtpSingle(event, rowIndex, key) {
    this.quotationForm.quotationList[rowIndex][key] = event.target.value;
    this.quotationForm.quotationList = [...this.quotationForm.quotationList];
    this.elementsChanged();
  }

  elementsChanged() {

    const quotationInputValue = JSON.stringify(this.quotationForm);
    console.log('elementsChanged', this.quotationForm);
    this.formControl.setValue(quotationInputValue);
  }

  changeCkb(event:any , key: string) {
    if(event && key) {
      this.quotationForm.quotationBaseInfo[key] = event.target.checked ? 1: 0;
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
      this.quotationForm.quotationBaseInfo.enduserCountry = event['Country'] || '';
      const uri = '/act/dms/api/CompanyLicense/';
      let params = {
        SearchTargetType: '2',
        CompanyName: event['CustomerName']
      };
      this.http.post(uri, params).subscribe(res => {
        if (res.SubmitResult == true && res.Object != [] && res.Object.length > 0) {
          let enduser = res.Object[0];
          if (res.Object.length > 1) {
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
      if (event) {
        this.toastrService.warning('未查询到最终用户信息');
      }
      this.elementsChanged();
    }
  }

  //获取即时汇率
  updateUsRate() {
    this.http.post('/act/masterdata/queryJsonByCondition/DistributorMarginRate', {
      status: '1',
      DistributorMarginRate: '即时汇率'
    }).subscribe(res => {
      if ('0000' === res.code) {
        let data = JSON.parse(res.data);
        if (data.length > 0) {
          let item = data[0];
          this.quotationForm.quotationBaseInfo.usRate = item['Rate'];
        } else {
          this.toastrService.warning('主数据中即时汇率不存在，请联系管理员');
        }

      } else {
        this.toastrService.error(res.msg);
      }

    });

  }

  async getDistributorInfo(event) {//经销商接口返回的对象没有地址信息
    console.log(event);
    if (event && event['NameCN'] && '' != event['NameCN']) {
      this.quotationForm.quotationBaseInfo.distributorId = event['ID'];
      this.quotationForm.quotationBaseInfo.distributorAddress = event['InvoiceAddress'];

      this.isAdding = true;
      await this.getAgreementNos(event['NameCN']);
      this.isAdding = false;
      console.log('distributorAgreementNos', this.quotationForm.quotationBaseInfo.distributorAgreementNos);
      this.elementsChanged();
    } else {
      this.quotationForm.quotationBaseInfo.distributorId = '';
      this.quotationForm.quotationBaseInfo.distributorName = '';
      this.quotationForm.quotationBaseInfo.distributorAddress = '';
      this.quotationForm.quotationBaseInfo.distributorAgreementNos = '';
      if (event) {
        this.toastrService.warning('未查询到经销商信息');
      }
      this.elementsChanged();
    }
  }

  //TODO
  async getAgreementNosNew(companyId) {
    let distributor;
    let agreementNos = '';
    if (companyId) {
      const uri = '/act/masterdata/queryJsonByCondition/dealerinfo';
      let params = {
        status: '1',
        DMSID: companyId
      };
      let res = await this.http.post(uri, params).toPromise();
      if (res['code'] === '0000') {
        let dealers = JSON.parse(res['data']);
        if (dealers.length > 0) {
          distributor = dealers[0];
          for (let item of dealers) {
            let agreementNo = item['DMSID'] ? item['DMSID'] : '';
            if ('' !== agreementNo) {
              agreementNos = agreementNos + agreementNo + ',';
            }
          }
          agreementNos = agreementNos.slice(0, -1);
        }

        // console.log(dealers);
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
    console.log('updateCurrencyType', this.currencyType);
  }

  updateTotalAll(silent?) {

    let currency;
    let vendorCurrency;
    let vendorMarginNeed = this.isZhitou ? '0' : '1';
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
    if (!this.isZhitou) {
      if (qList['quotationBaseInfo'] && qList['quotationBaseInfo']['expectwinbidbz'] == '1') {
        vendorCurrency = 'usd';
      } else if (qList['quotationBaseInfo'] && qList['quotationBaseInfo']['expectwinbidbz'] == '2') {
        vendorCurrency = 'rmb';
      } else {
        this.toastrService.warning('请选择经销商利润币种');
        return;
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
            if(!silent){
              this.toastrService.success('总价已更新');
            }
            this.quotationForm.totalAllList = [...newTotalAllList];
            console.log('updateTotalAll', newTotalAllList);
            console.log('updateTotalAll', this.quotationForm.totalAllList);
            this.updateExpectDealerMargin();
            this.elementsChanged();
          } else {
            if (!silent) {
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
    this.updateExpectDealerMargin();
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

  changeImeFlag(event) {
    this.imeFlag = event == '0' ? false : true;
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
    console.log(event);

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
      this.isZhitou = true;
      this.quotationForm.quotationBaseInfo.distributorName = '';
      this.quotationForm.quotationBaseInfo.distributorId = '';
      this.quotationForm.quotationBaseInfo.distributorAddress = '';
      this.quotationForm.quotationBaseInfo.expectwinbidbz = '';
      // this.quotationForm.quotationBaseInfo.distributorContactPhone = '';
      // this.quotationForm.quotationBaseInfo.distributorEmail = '';
      // this.quotationForm.quotationBaseInfo.distributorContact = '';
      // this.quotationForm.quotationBaseInfo.distributorTaxId = '';
      this.quotationForm.quotationBaseInfo.distributorAgreementNos = '';
      this.quotationForm.quotationBaseInfo.expectdistributerotherfee = '';
      this.quotationForm.quotationBaseInfo.expectwinbidprice = '';
      this.quotationForm.quotationBaseInfo.purchasePrice = '';
    } else {
      this.distributorDisableFlag = false;
      this.isZhitou = false;
      this.quotationForm.quotationBaseInfo.biddingCompany = '';
      this.quotationForm.quotationBaseInfo.commisionCompany = '';
    }

    this.elementsChanged;
  }

  uploadFile(flag) {
    let file: File;
    let elementRef: ElementRef;
    if (flag === 'sofonFiles') {
      file = this.sofonFilesInput.nativeElement.files[0];
      elementRef = this.sofonFilesInput;
    }


    const _validFileExtensions = [".xls", ".xlsx", ".doc", ".docx"];
    if (file) {

      if(flag === 'sofonFiles') {
        if (!this.fileService.fileExtensionValidator(file, _validFileExtensions)) {
          this.toastrService.warning('请上传指定类型的文件！');
          elementRef.nativeElement.value = '';
          return;
        }
      }

      const owner = localStorage.getItem('ng_philips_code1');
      this.fileService.uploadFile('/act/file/upload', {file, filename: file.name, location: flag, owner}
        , res => {
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
          this.toastrService.error(res && res.msg ? res.msg : '上传错误！');
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
          this.quotationForm.quotationBaseInfo[listName] = this.quotationForm.quotationBaseInfo[listName].filter((obj) => {
            if (obj) {
              return obj['id'] !== id;
            }
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

  // 特价简单非空校验
  validateSpecial() {
    this.globalService.theValidator = '0';
    this.forceTouch();
    this.validateRequiredNameElements();
  }

  //手动触发校验效果
  forceTouch() {
    this.specialInputs.forEach((item) => {
      // console.log(item);
      item.control.markAsTouched();
    });
  }

  //validation
  validateRequiredNameElements() {
    let formType = ['ng-select', 'input', 'select', 'textarea'];
    let nameList = [];
    let validateStatus = '1';
    formType.forEach(v => {
      let formElements = this.el.nativeElement.getElementsByTagName(v);
      // console.log('kk', formElements);
      if (v === 'ng-select') {
        for (let i = 0; i < formElements.length; i++) {
          let item = formElements[i];
          if (item.hasAttribute('required') && item.getAttribute('name')) {
            nameList.push(item.getAttribute('name'));
          }
        }
      } else {
        for (let i = 0; i < formElements.length; i++) {
          if (formElements[i].name && formElements[i].required) {
            nameList.push(formElements[i].name);
          }
        }
      }
    });

    console.log('need to be validated input name', nameList);
    this.globalService.theValidator = '1';
    for (const item of nameList) {
      if ((!this.quotationForm.quotationBaseInfo[item] && 0 !== this.quotationForm.quotationBaseInfo[item]) || '' === this.quotationForm.quotationBaseInfo[item]) {
        this.globalService.theValidator = '0';
        console.log('required valid failed: ', item);
        break;
      }
    }

    this.quotationListValidation();
    this.sofonFilesValidation();
  }

  //亚型订单必须添加校验
  quotationListValidation() {
    if (this.quotationForm.quotationList.length < 1 || this.quotationForm.totalAllList.length < 1) {
      this.toastrService.warning('请添加至少一个亚型订单');
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

  //sofon file文件校验
  sofonFilesValidation() {
    if (!this.customDisabled['sofonFiles']) {
      if (!this.quotationForm.quotationBaseInfo['sofonFiles']
        || this.quotationForm.quotationBaseInfo['sofonFiles'].length < 1) {
        this.toastrService.warning('请至少上传一个sofon文件');
        this.globalService.theValidator = '0';
      }
    }
  }

  initTwoBooleanFlag() {
    this.isZhitou = '非直投' === this.quotationForm.quotationBaseInfo.purchaseTypeName ? false : true;
    this.isUsd = this.quotationForm.quotationBaseInfo.currencyType === '1' ? true : false;
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

  //

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
  updateDefaultIgm(rowid?) {
    if (rowid != null) {
      let newList = [];
      this.quotationForm.quotationList.map((item) => {
        if (item['qdetail'] && item['qdetail']['totalRows']) {
          let igm = undefined;
          if (item['rowid'] === rowid) {
            for (const el of item['qdetail']['totalRows']) {
              if (el['total_code'] == 'T14') {
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
  updateIgmInT14(event, rowIndex) {
    const v = Number(event.target.value) || 0;
    this.quotationForm.quotationList[rowIndex]['igm'] = v;

    if (this.quotationForm.quotationList[rowIndex]['qdetail'] && this.quotationForm.quotationList[rowIndex]['qdetail']['totalRows']) {
      for (let obj of this.quotationForm.quotationList[rowIndex]['qdetail']['totalRows']) {
        if (obj['total_code'] == 'T14') {
          this.quotationForm.quotationList[rowIndex]['qdetail']['igmEdited'] = true;
          obj['money'] = v / 100;
          break;
        }
      }
    }

    this.quotationForm.quotationList = [...this.quotationForm.quotationList];
    this.elementsChanged();
  }

  viewPrimaryPdf(row: any) {
    if (!row.qdetail) {
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

  formatNumber(event, key: string) {
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

    this.pdfmakeService.getSimpleXlsx(row, this.quotationForm.quotationBaseInfo, true);
  }

  /** manualUpdated addition start */


  /**below method used for update sumPrice for special */
  updateSumPrice(rowid?, force?) {
    if (rowid != null) {
      let newList = [];
      this.quotationForm.quotationList.map((item) => {
        if (item['unitTotalPrice']) {
          if (item['rowid'] === rowid) {
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
            if (force) {
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
      this.quotationForm.quotationList.map((item) => {
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

  updateUnitTotalPriceByHand(event, cell, rowIndex) {
    const prefix = this.utilityService.getCurrencyPrefix(this.currencyType);
    const rawPrice = '';
    console.log('updateUnitTotalPriceByHand => ', event, cell, rowIndex);
    this.editingCell[rowIndex + '-' + cell] = false;
    const item = this.quotationForm.quotationList[rowIndex];
    console.log(item);
    if (item && item['unitTotalPrice']) {
      if (!item['rawUnitTotalPrice']) {//兼容现有数据
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
    if (row && row['qdetail']) {
      const params = this.generateParams(row);
      console.log('manullyUpdate params => ', params);
      this.quotationCalcService.getResFromAmountSum(params).subscribe(res => {
        console.log('res.data => ', res.data);
        if ('0000' == res.code) {
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
      customParams: { 'type': 'special' },
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

  changeEditingCell(rowId, flag) {
    if(this.unitTotalPriceEditable && flag) {
      this.editingCell[rowId + flag] = true;
    }
  }

  /** manualUpdated addition end */
}
