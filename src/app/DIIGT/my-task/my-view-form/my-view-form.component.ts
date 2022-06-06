import {Component, EventEmitter, Input, OnInit, Output, SimpleChanges} from '@angular/core';
import {ProcessStatusPipe} from '../../../pipes/process-status.pipe';
import {ProcessBtn} from '../../../pipes/process-btns.pipe';
import {ProcessModel} from '../../../pipes/process-model.pipe';
import {proceessAuthor} from '../../../pipes/proceess-author.pipe';
import {TimeFormatePipe} from '../../../pipes/time-formate.pipe';
import {TreeNodeInterface} from '../myTaskTable/MyTaskTable.component';
import {Router} from '@angular/router';
import {HttpService} from '../../../services';
import {NzMessageService} from 'ng-zorro-antd';
import {codeString} from '../../../../assets/js/tools';
import {FormBuilder, FormControl, FormGroup, ValidationErrors} from '@angular/forms';
import {Observable, Observer} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {
  ServesiceService,
} from '../../preOrder/servesice.service';

@Component({
  selector: 'app-my-view-form',
  templateUrl: './my-view-form.component.html',
  styleUrls: ['./my-view-form.component.scss']
})
export class MyViewFormComponent implements OnInit {

  @Output() public passFormValues = new EventEmitter<any>();
  @Output() public exportEvent = new EventEmitter<any>();
  @Output() public projectReportEvent = new EventEmitter<any>();
  @Output() public biddingReportEvent = new EventEmitter<any>();
  @Output() public POSReportEvent = new EventEmitter<any>();
  @Output() public opportunityReportEvent = new EventEmitter<any>();
  @Output() public BundleReportEvent = new EventEmitter<any>();
  @Output() public prebookReportEvent = new EventEmitter<any>();

  @Input() public loadingButton = {
    resetForm: false,
    exportExcel: false,
    projectReport: false,
    opportunityReport: false,
    BundleReport: false,
    biddingReport: false,
    POSReport: false,
    preBookReport: false
  };
  public nzLoading=false;
  // public isOA = false;
  // public isOALeader = false;
  value: string;
  selectedValue = null;
  validateForm: FormGroup;
  dateFormat = 'yyyy/MM/dd';

  date = null; // new Date();
  dateRange = []; // [ new Date(), addDays(new Date(), 3) ];
  isEnglish = false;
  searchOtherList=[];
  controlArray: any[] = [];
  isCollapse = false;

  orderTypeList = [
    {code: 'JDZB-DTJ', label: '进单准备-待提交'},
    {code: 'JDZB-DOACS', label: '进单准备-待OA初审'},
    {code: 'JDZB-DZLCSH', label: '进单准备-合同子流程审核'},
    {code: 'JDZB-JDEND', label: '进单准备-进单流程完成'},
    {code: 'JDZB-CANCELLED', label: '进单准备-项目终止-取消进单'}
  ];
  prebookList=[
    {code: 'PREBOOK-prebook_sales_apply', label: '修改Pre-Book'},
    {code: 'PREBOOK-prebook_zpm_approval', label: 'ZPM核查场地状态'},
    {code: 'PREBOOK-prebook_dsi_approval', label: 'DSI审核'},
    {code: 'PREBOOK-prebook_oa_approval', label: 'PREBOOK-OA审核'},
    {code: 'PREBOOK-prebook_district_leader_approval', label:'District Leader审核'},
    {code: 'PREBOOK-prebook_sales_leader_approval', label:'Sales Leader审核'},
    {code: 'PREBOOK-prebook_oa_supplement', label:'OA补充信息'},
    {code: 'PREBOOK-prebook_om_backfill', label:'OM回填SO#'},
    {code: 'PREBOOK-prebook_end', label:'OM回填SO#结束'},
    {code: 'PREBOOK-prebook_dtj', label:'待提交'},
    {code: 'PREBOOK-PREBOOKCANCELLED', label:'PREBOOK-自动终止'},
  ]

  taskStatusList = [
    {code: 'ZBSQ-DTJ', label: '招标授权-待提交'},
    {code: 'ZBSQ-DSWYSH', label: '招标授权-待商务专员审核'},
    {code: 'ZBSQ-XSBMDMSH', label: '招标授权-待销售主管审核'},
    {code: 'ZBSQ-2JSH', label: '招标授权-待二级审核'},
    {code: 'ZBSQ-DSWZYSQ', label: '招标授权-授权发放'},
    {code: 'ZBSQ-2CKB', label: '招标授权-二次开标'},
    {code: 'ZBBA-DBA', label: '中标备案-待备案'},
    {code: 'ZBQR-DSWZYQR', label: '中标确认-待商务专员确认'},
    {code: 'ZBQR-YZBQRDBCWJ', label: '中标确认-已中标确认-待补充文件上传'},
    {code: 'ZBQR-YZBQRYBCWJ', label: '中标确认-已中标确认-已补充文件'},
    {code: 'XMZZ-WZB', label: '项目终止-未中标'},
    {code: 'XMZZ-2CKBZZ', label: '项目终止-二次开标'},
    {code: 'ZBQR-BIDCANCELLED', label: '中标确认-取消投标申请'}
  ];
  businessModelList = [];
  entryModeList = [];
  thirdVerificationModeList=[];
  fileSupportStatusModeList=[];
  biddingAuthorizationModeList = [];
  isAuthorizedList = [
    {
      code: 'nonprivate',
      label: '是',
      value: '是',
    },
    {
      code: 'private',
      label: '否',
      value: '否',
    },
  ];
  bigRegionList = [];
  bmcList = [];
  teamsList = [];
  searchConditions: any = {
    sale:  null,
    hospital: null,
    referenceNo: null,
    productName: null,
    projectName: null,
    biddingNo: null,
    biddingCompany: null,
    businessPattern: null,
    subDate: null,
    orderPattern: null,
    orderType: null,
    process_status: null,
    task_status: null,
    authorize: null,
    bigRegion: null,//销售区域大区
    smallRegion: null, //销售区域小区
    bmc: null,
    sap: null,
    agreementAgenName: null, // 代理商名称
    applyType: null,
    taskStatus: null,
    thirdPartySelfProcurementVerification: null,
    oitDateStart: null,
    oitDateEnd: null,
    teams: null,
    productType:null, //产品型号
    opportunityId:null, //opportunityId
    dealFormId:null, //dealFormId
    fileSupportStatus:null,// 文件补充状态
    isContract:null, //正本合同是否已上传 1是 0否
    thirdVerification:null, //第三方产品核查
    preBookStatus:null,
    other:null
  };
  ngOnInit(): void {
   // this.getOrderTypeList();
    const isExit = JSON.parse(localStorage.getItem('searchConditions'));
    if (isExit != null) {
      this.searchConditions = JSON.parse(localStorage.getItem('searchConditions'));
    }
    this.getSearchOther();
    this.getTaskStatusList();
    this.getBusinessModelList();
    this.getEntryModeList();
    this.getThirdVerificationModeList();
    this.getFileSupportStatusModeList();
    this.getBiddingAuthorizationModeList();
    this.getBigRegionList();
    this.getBmcList();
    this.getTeamsList();
    this.validateForm = this.fb.group({
      other:this.searchConditions.other,
      preBookStatus:this.searchConditions.preBookStatus,
      productType:this.searchConditions.productType,
      opportunityId:this.searchConditions.opportunityId,
      dealFormId:this.searchConditions.dealFormId,
      fileSupportStatus:this.searchConditions.fileSupportStatus,
      isContract:this.searchConditions.isContract,
      thirdVerification:this.searchConditions.thirdVerification,
      sale:  this.searchConditions.sale,
      hospital: this.searchConditions.hospital,
      referenceNo: this.searchConditions.referenceNo,
      productName: this.searchConditions.productName,
      projectName: this.searchConditions.projectName,
      biddingNo: this.searchConditions.biddingNo,
      biddingCompany: this.searchConditions.biddingCompany,
      businessPattern: this.searchConditions.businessPattern,
      subDate: this.searchConditions.subDate,
      orderPattern: this.searchConditions.orderPattern,
      orderType: this.searchConditions.orderType,
      process_status: this.searchConditions.process_status,
      task_status: this.searchConditions.task_status,
      authorize: this.searchConditions.authorize,
      bigRegion: this.searchConditions.bigRegion,//销售区域大区
      smallRegion: this.searchConditions.smallRegion, //销售区域小区
      bmc: this.searchConditions.bmc,
      sap: this.searchConditions.sap,
      agreementAgenName: this.searchConditions.agreementAgenName, // 代理商名称
      applyType: this.searchConditions.applyType,
      taskStatus: this.searchConditions.taskStatus,
      thirdPartySelfProcurementVerification: this.searchConditions.thirdPartySelfProcurementVerification,
      oitDateStart: this.searchConditions.oitDateStart,
      oitDateEnd: this.searchConditions.oitDateEnd,
      teams: this.searchConditions.teams,
    });
    // const roleCode = JSON.parse(localStorage.getItem('roles'));
    // if (roleCode) {
    //   roleCode.map(e => {
    //     if (e === 'OA' || e === 'OA Leader') {
    //       this.isOA = true;
    //     }
    //     if (e === 'OA Leader') {
    //       this.isOALeader = true;
    //     }
    //   });
    // }
    // if (roleCode === 'OA' || roleCode === 'OA Leader') {
    //   this.isOA = true;
    // }
  }
  //其他列表
  public getSearchOther()
  {
    const params = {
      dictGroup: 'searchOther',
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
      if (rest.code === '0000') {
        this.searchOtherList = rest.data;
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });

  }
  public getOrderTypeList () {
    // 进单状态
    // 进单状态 JD, 招标授权 ZBSQ，只有这2个才有listClass
    const params = {
      dictGroup: 'PROCESS_STATUS',
      listClass: 'JD', // 进单状态 JD, 招标授权 ZBSQ
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}&listClass=${params.listClass}`).subscribe(rest => {
      if (rest.code === '0000') {
        // 暂时不用数据字典
        this.orderTypeList = rest.data;
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }
  // 招标授权状态
  public getTaskStatusList () {
    const params = {
      dictGroup: 'PROCESS_STATUS',
      listClass: 'ZBSQ', // 进单状态 JD, 招标授权 ZBSQ
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}&listClass=${params.listClass}`).subscribe(rest => {
      if (rest.code === '0000') {
        // 暂时不用数据字典
        // this.taskStatusList = rest.data;
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }

  // 业务模式
  public getBusinessModelList () {
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
    // 文件补充状态
    public getFileSupportStatusModeList () {
      const params = {
        dictGroup:'fileSupportStatus',
      };
      this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
        if (rest.code === '0000') {
          this.fileSupportStatusModeList = rest.data;
        } else {
          this.message.create('error', `${rest.msg}`);
        }
      });
    }
  // 第三方产品核查
  public getThirdVerificationModeList () {

    const params = {
      dictGroup:'thirdVerification',
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
      if (rest.code === '0000') {

        this.thirdVerificationModeList = rest.data;
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }
  // 进单模式
  public getEntryModeList () {
    const params = {
      dictGroup: 'ENTRY_MODEL',
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
      if (rest.code === '0000') {
        this.entryModeList = rest.data;
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }

  // 招标授权模式
  public getBiddingAuthorizationModeList () {
    const params = {
      dictGroup: 'AUTHORIZATION_MODE',
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
      if (rest.code === '0000') {
        this.biddingAuthorizationModeList = rest.data;
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }

  // 销售区域（大区）
  public getBigRegionList() {
    const params = {
      dictGroup: 'region',
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
      if (rest.code === '0000') {
        this.bigRegionList = rest.data;
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }


  // bmc
  public getBmcList(){
    const params = {
      dictGroup: 'bmc',
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
      if (rest.code === '0000') {
        this.bmcList = rest.data;
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }

  // teams
  public getTeamsList() {
    this.http.get(`/act/ecom/homepage/getAllTeams`).subscribe(rest => {
      if (rest && rest.data) {
        this.teamsList = rest.data;
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }

  onChange(result: Date): void {
    console.log('Selected Time: ', result);
  }

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
    this.controlArray.forEach((c, index) => {
      c.show = this.isCollapse ? index < 6 : true;
    });
  }

  searchForm(): void {
    console.log('searchForm');
  }

  exportExcel(e: MouseEvent): void {
    e.preventDefault();
    this.exportEvent.emit();
    console.log('exportExcel');
  }

  projectReport(e: MouseEvent, value): void {
    e.preventDefault();
    this.projectReportEvent.emit(value);
    console.log('projectReport');
  }

  biddingReport(e: MouseEvent): void {
    e.preventDefault();
    this.biddingReportEvent.emit();
  }
  prebookReport(e: MouseEvent): void {
    e.preventDefault();
    this.prebookReportEvent.emit();
  }

  POSReport(e: MouseEvent): void {
    e.preventDefault();
    this.POSReportEvent.emit();
  }

  public BundleReport(e: MouseEvent): void {
    e.preventDefault();
    this.BundleReportEvent.emit();
  }

  public opportunityReportShow = false;
  public opportunityText = null;
  public showModeal() {
    this.opportunityReportShow = true;
  }
  public cancelModeal () {
    this.opportunityReportShow = false;
  }
  public opportunityReport () {
    if (this.opportunityText == null || this.opportunityText === '') {
      this.message.create('error', '请输入opportunity');
      return;
    }
    const arr = this.opportunityText.replace(/[,，\s]+/gmi, ',').split(',').filter(_ => _);
    this.opportunityReportEvent.emit(arr);
    this.opportunityReportShow = false;
  }

  updateConfirmValidator(): void {
    /** wait for refresh value */
    Promise.resolve().then(() => this.validateForm.controls.checkPassword.updateValueAndValidity());
  }

  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.validateForm.controls.password.value) {
      return { confirm: true, error: true };
    }
    return {};
  };

  getCaptcha(e: MouseEvent): void {
    e.preventDefault();
  }


  submitForm = ($event: any, value: any) => {
    $event.preventDefault();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
      this.validateForm.controls[key].updateValueAndValidity();
    }
    window.localStorage.setItem('searchConditions', JSON.stringify(value));
    this.searchConditions = value;
    this.nzLoading=true;
    this.passFormValues.emit(value);
  }
  // 清空表单选项
  resetForm () {
    this.validateForm.reset();
    // this.passFormValues.emit({});
  }

  validateConfirmPassword(): void {
    setTimeout(() => this.validateForm.controls.confirm.updateValueAndValidity());
  }

  userNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      setTimeout(() => {
        if (control.value === 'JasonWood') {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      }, 1000);
    });

  confirmValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.validateForm.controls.password.value) {
      return { confirm: true, error: true };
    }
    return {};
  };


  public startDate = null;
  public endDate = null;
  public disabledStartDate = (startValue: Date): boolean => {
    if (!this.endDate) {
      return false;
    }
    return startValue.getTime() > this.endDate.getTime();
  }
  public disabledEndDate = (endValue: Date): boolean => {
    if (!this.startDate) {
      return false;
    }
    return endValue.getTime() < this.startDate.getTime();
  }

  public changeStartMonth (data) {
    this.startDate = data.oitDateStart;
  }
  public changeEndMonth (data) {
    this.endDate = data.oitDateEnd;
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private toastrService: ToastrService,
    private message: NzMessageService,
    private ServesiceService:ServesiceService
  ) {
    this.ServesiceService.setSearch.subscribe(val=>{

      this.searchConditions = {
        sale:  null,
        hospital: null,
        referenceNo: null,
        productName: null,
        projectName: null,
        biddingNo: null,
        biddingCompany: null,
        businessPattern: null,
        subDate: null,
        orderPattern: null,
        orderType: null,
        process_status: null,
        task_status: null,
        authorize: null,
        bigRegion: null,//销售区域大区
        smallRegion: null, //销售区域小区
        bmc: null,
        sap: null,
        agreementAgenName: null, // 代理商名称
        applyType: null,
        taskStatus: null,
        thirdPartySelfProcurementVerification: null,
        oitDateStart: null,
        oitDateEnd: null,
        teams: null,
        preBookStatus:null,
        other:null,
      };
    })
    this.ServesiceService.myFormLoad.subscribe(val=>{
          this.nzLoading=val;
    })
  }

}
