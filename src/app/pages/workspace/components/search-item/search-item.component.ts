import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { DictService, HttpService } from '@core/services';
import * as moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd';
import { first } from 'rxjs/operators';

@Component({
  selector: 'cos-search-item',
  templateUrl: 'search-item.component.html',
  styleUrls: ['search-item.component.scss']
})

export class SearchItemComponent implements OnInit {


  @Output() public search = new EventEmitter<any>();
  @Output() public setLoading = new EventEmitter<boolean>();
  @Output() public exportEvent = new EventEmitter<any>();

  @Input() loading: any = false;
  @Input() formData: [];
  @Input() isDraft = false;
  @Input() exportLoading: any = false;

  public controlArray: any[] = [];
  public isCollapse = false;
  public businessModelList = [];
  public bigAreaList = [];
  public bmcList = [];
  public teamsList = [];
  public entryModeList = [];
  public taskStatusList = [];
  public modalityList = [];

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
    oitStartMonth: [null], // Oit开始月份
    oitEndMonth: [null], // Oit结束月份
    modality: [null], // modality
    submitTime: [null],
    taskStatus: [null], //流程状态
    contractNo: [null], //合同订单号 子流程
    sofonNo: [null],
  })

  constructor(private fb: FormBuilder,private http: HttpService,private message: NzMessageService,private dictService: DictService) {
  }

  ngOnInit() {
    if (this.isDraft){
      let userName = localStorage.getItem("ecom_ng_philips_code1");
      this.formValues.patchValue({
        ...this.formValues,
        applicant: userName,
      })
      this.formValues.get('applicant').disable();
    }
    
    this.getBusinessModelList();
    this.getBigAreaList();
    this.getBmcList();
    this.getTeamsList();
    this.getEntryModeList();
    this.getTaskStatusList();
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
    const removeList = [
      'ecos_oit_deal_countersign','ecos_oit_deal_sub_process',
      'ecos_oit_order_nstd_countersign','ecos_oit_order_sp_countersign',
      'ecos_oit_deal_order_change','ecos_oit_order_change_approval',
      'ecos_oit_order_change_first_approval','ecos_oit_order_change_second_approval',
      'ecos_oit_order_os_pm','ecos_bid_failure','ecos_bid_2bid','ecos_bid_nstd_countersign'
    ];
    this.dictService.dictData('NODE_ECOS').subscribe((dictData) => {
      this.taskStatusList = dictData.map(({ code, label }) => ({ code, label: this.translateStatus( code, label) })).filter(item => 
        !item.code.includes('submit') && !item.code.includes('cancel') && !item.code.includes('done') && !item.code.includes('draft') 
        && !removeList.includes(item.code)
      )
      this.taskStatusList.sort((a,b) => a.label.localeCompare(b.label));
    });
  } 
  // 标记对应进单、投标、prebook的状态
  public translateStatus( code,  label) {
    const isNull = [null, "", undefined];
    if (isNull.includes(code) || isNull.includes(label)) {
      return "";
    } else if (code.includes('ecos_oit')) {
      return "OIT-"+label;
    } else if (code.includes('ecos_bid')) {
      return "Bidding-"+label;
    } else if (code.includes('ecos_prebook')) {
      return "Pre-book-"+label;
    }
    return "";
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
    this.loading = true;
    this.setLoading.emit(this.loading);
    this.search.emit(value);
  }

  // 清空表单选项
  resetForm(value: any) {
    value.submitTime = null;
    this.formValues.reset();
    this.loading = true;
    this.setLoading.emit(this.loading);
    this.search.emit({});
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

  //导出报表
  exportExcel(e: MouseEvent): void {
    e.preventDefault();
    this.exportEvent.emit();
  }

}
