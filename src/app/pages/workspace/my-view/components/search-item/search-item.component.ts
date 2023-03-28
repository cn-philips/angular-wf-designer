import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import {DictService, HttpService } from '@core/services';
import * as moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'cos-my-view-search-item',
  templateUrl: 'search-item.component.html',
  styleUrls: ['search-item.component.scss']
})

export class myViewSearchItemComponent implements OnInit {


  @Output() public search = new EventEmitter<any>();
  @Output() public setLoading = new EventEmitter<boolean>();
  @Output() public subSearch = new EventEmitter<any>();
  @Output() public reset = new EventEmitter<any>();

  @Output() public passFormValues = new EventEmitter<any>();
  @Output() public exportEvent = new EventEmitter<any>();
  @Output() public projectReportEvent = new EventEmitter<any>();
  @Output() public projectUSReportEvent = new EventEmitter<any>();
  @Output() public projectCCHpmReportEvent = new EventEmitter<any>();
  @Output() public projectCCHrcReportEvent = new EventEmitter<any>();
  @Output() public biddingReportEvent = new EventEmitter<any>();
  @Output() public POSReportEvent = new EventEmitter<any>();
  @Output() public opportunityReportEvent = new EventEmitter<any>();
  @Output() public BundleReportEvent = new EventEmitter<any>();
  @Output() public prebookReportEvent = new EventEmitter<any>();
  @Output() public financePlanReportEvent = new EventEmitter<any>();
  @Output() public orderChangeReportEvent = new EventEmitter<any>();

  @Input() loading: any = false;
  @Input() formData: [];
  @Input() public loadingButton = {
    exportExcel: false,
    exportMore: false,
  };

  public controlArray: any[] = [];
  public isCollapse = false;
  public isOA = false;
  public businessModelList = [];
  public bigAreaList = [];
  public bmcList = [];
  public teamsList = [];
  public entryModeList = [];
  public taskStatusList = [];
  public modalityList = [];
  public needAttentionList = [
    { code: "undone", label: "未OIT完成"},
    { code: "done", label: "已OIT完成"}
  ];

  public formValues = this.fb.group({
    referenceId: [null], //Reference No
    applicant: [null], // 销售邮箱
    hospitalName: [null], //医院
    authorizationRequired: [null], //是否授权 1是 0否
    businessModel: [null], //业务模式
    dealerName: [null], // 经销商名称
    dealFormId: [null], //deal Form Id
    so: [null], // so
    productModel: [null], // 产品型号
    bmc: [null], // bmc
    opportunityId: [null], // opportunityId
    biddingNumber: [null], //招标编号
    bidderName: [null], //投标公司
    oitMode: [null], //进单模式
    processStatus: [null], //进单状态
    team: [null], // team
    bigArea: [null], // 大区
    smallArea: [null], // 小区
    submitStartTime: [null], // 提交开始时间
    submitEndTime: [null], // 提交结束时间
    submitTime: [null],
    modality: [null], // modality
    oitStartMonth: [null], // Oit开始月份
    oitEndMonth: [null], // Oit结束月份
    sofonNo: [null],
    contractNo: [null], //合同订单号
    needAttention: [null], //需我关注
  })
  @Input() isFirstLoad:boolean = false
  constructor(private fb: FormBuilder,
    private http: HttpService,
    private message: NzMessageService,
    private dictService: DictService,) {
  }

  ngOnInit() {
    var roles = JSON.parse(window.localStorage.getItem("roles"));
    this.isOA = roles.includes('OA') ? true : false;
    this.getBusinessModelList();
    this.getBigAreaList();
    this.getBmcList();
    this.getTeamsList();
    this.getEntryModeList();
    // this.getTaskStatusList();
    this.getModalityList();
  }

  // 业务模式
  public getBusinessModelList() {
    this.dictService.dictData('BUSINESS_MODEL').subscribe((dictData) => {
      this.businessModelList = dictData.map(({ code, label }) => ({ code, label }))
    });
  }

  // 进单模式
  public getEntryModeList() {
    this.dictService.dictData('ENTRY_MODEL').subscribe((dictData) => {
      this.entryModeList = dictData.map(({ code, label }) => ({ code, label }))
    });
  }

   //流程状态
   public getTaskStatusList() {
    this.dictService.dictData('NODE_ECOS').subscribe((dictData) => {
      this.taskStatusList = dictData.map(({ code, label }) => ({ code, label }))
    });
  }

  // 销售区域（大区）
  public getBigAreaList() {
    // 数据字典全量查询
    const param = { dictGroup:'region', pageSize: 200, };
    this.http.post(`/act/ecom/dictData/queryDictData`, param).subscribe(rest => {
      if (rest.code === '0000') {
        const data = rest.data.rows;
        this.bigAreaList = data.map(
          ({ dictValue, dictLabel }) => ({ code: dictValue, label:  dictLabel})
        );
        this.bigAreaList.sort((a,b) => a.code.localeCompare(b.code))
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }

  // bmc
  public getBmcList() {
    // 数据字典全量查询
    const param = { dictGroup:'bmc', pageSize: 200, };
    this.http.post(`/act/ecom/dictData/queryDictData`, param).subscribe(rest => {
      if (rest.code === '0000') {
        const data = rest.data.rows;
        this.bmcList = data.map(
          ({ dictValue, dictLabel }) => ({ code: dictValue, label:  dictLabel})
        );
        this.bmcList.sort((a,b) => a.code.localeCompare(b.code))
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }

  // teams
  public getTeamsList() {
    // 数据字典全量查询
    const param = { dictGroup:'ECOS_TEAMS', pageSize: 200, };
    this.http.post(`/act/ecom/dictData/queryDictData`, param).subscribe(rest => {
      if (rest.code === '0000') {
        const data = rest.data.rows;
        this.teamsList = data.map(
          ({ dictValue, dictLabel }) => ({ code: dictValue, label:  dictLabel})
        );
        this.teamsList.sort((a,b) => a.code.localeCompare(b.code))
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }

  //modality
  public getModalityList() {
    const uri = `/act/specialapprove/bmcclusterbg/modality`;
    this.http.get(uri).subscribe((res) => {
      if ("0000" == res.code) {
        this.modalityList = res.data;
      }
    });
  }

  submitForm ($event: any, value: any) {
    $event.preventDefault();
    if(value.oitStartMonth){
      value.oitStartMonth = moment(value.oitStartMonth).format('YYYY-MM')
    }
    if(value.oitEndMonth){
      value.oitEndMonth = moment(value.oitEndMonth).format('YYYY-MM')
    }
    //同步过滤子流程modality
    if(value.modality) {
      value.oitEndModality = value.modality;
    }
    //查询主流程，子流程，oit
    // let mainParam = Object.assign({},value);
    // mainParam.subOitStartMonth = value.oitStartMonth;
    // mainParam.subOitEndMonth = value.oitEndMonth;
    // mainParam.subSo =  value.so;
    // mainParam.oitStartMonth = null;
    // mainParam.oitEndMonth = null;
    // mainParam.so = null;

    this.loading = true;
    this.setLoading.emit(this.loading);
    //反查主流程
    this.search.emit(value);
    //查询子流程
    this.subSearch.emit(value);
  }

  // 清空表单选项
  resetForm(value: any) {
    value.submitTime = null;
    this.formValues.reset();
    this.loading = true;
    this.setLoading.emit(this.loading);
    // this.search.emit({});
    // this.subSearch.emit(null);
    //清空form和table数据
    this.reset.emit();
  }

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
    this.controlArray.forEach((c, index) => {
      c.show = this.isCollapse ? index < 6 : true;
    });
  }

  //提交时间拆分
  public timeChange(data){
    if(data.submitTime && data.submitTime.length != 0){
      this.formValues.patchValue({
        ...this.formValues,
        submitStartTime: moment(data.submitTime[0]).format('YYYY-MM-DD'),
        submitEndTime: moment(data.submitTime[1]).format('YYYY-MM-DD'),
      })
    } else {
      this.formValues.patchValue({
        ...this.formValues,
        submitStartTime: null,
        submitEndTime: null,
      })
    }
  }

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

  public changeStartMonth(data) {
    this.startDate = data.oitStartMonth;
  }
  public changeEndMonth(data) {
    this.endDate = data.oitEndMonth;
  }

  //检查是否加载数据
  checkFirstLoad(){
    if (this.isFirstLoad) {
      this.message.create('error', `请输入查询条件，点击“搜索”按钮查询后操作`);
      return true;
    }
    return false;
  }

  //导出报表
  exportExcel(e: MouseEvent): void {
    e.preventDefault();
    if (!this.checkFirstLoad()){
      this.exportEvent.emit();
    }
  }

  projectReport(e: MouseEvent, value, type): void {
    e.preventDefault();
    if (!this.checkFirstLoad()){
      if(type === 'us') {
        this.projectUSReportEvent.emit(value);
      } else if(type === 'cc-hpm') {
        this.projectCCHpmReportEvent.emit(value);
      } else if(type === 'cc-hrc') {
        this.projectCCHrcReportEvent.emit(value);
      } else {
        this.projectReportEvent.emit(value);
      }
    }
  }

  biddingReport(e: MouseEvent): void {
    e.preventDefault();
    if (!this.checkFirstLoad()){
      this.biddingReportEvent.emit();
    }
  }
  prebookReport(e: MouseEvent): void {
    e.preventDefault();
    if (!this.checkFirstLoad()){
      this.prebookReportEvent.emit();
    }
  }

  POSReport(e: MouseEvent): void {
    e.preventDefault();
    if (!this.checkFirstLoad()){
      this.POSReportEvent.emit();
    }
  }

  public BundleReport(e: MouseEvent): void {
    e.preventDefault();
    if (!this.checkFirstLoad()){
      this.BundleReportEvent.emit();
    }
  }

  public opportunityReportShow = false;
  public opportunityText = null;
  public showModeal() {
    if (!this.checkFirstLoad()){
      this.opportunityReportShow = true;
    }
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

  //金融方案报表（OIT一致）
  FPReport(e: MouseEvent, value, type): void {
    e.preventDefault();
    if (!this.checkFirstLoad()){
      this.financePlanReportEvent.emit(value);
    }
  }
  //改单表报（无参数）
  orderChangeReport(e: MouseEvent,type = null): void {
    e.preventDefault();
    this.orderChangeReportEvent.emit(type);
  }

}
