import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { DictService, FileService, HttpService } from "@core/services";
import { environment } from "@env";
import * as moment from "moment";
import { NzMessageService } from "ng-zorro-antd";
import { WorkspaceListService } from "../../../services/workspace-list.service";
interface SearchParams {
  area?: string;
  bg?: string;
  bigArea?: string;
  bmc?: string;
  bu?: string;
  city?: string;
  cluster?: string;
  cycleGroup?: string;
  email?: string;
  importFlag?: string;
  modality?: string;
  name?: string;
  orderByClause?: string;
  pageNo?: number;
  pageSize?: number;
  province?: string;
  roleIn?: string[];
  smallArea?: string;
  team?: string;
  modalityIn?: any[];
  cycleGroupIn?: any[];
}
@Component({
  selector: "electronic-signature-search-item",
  templateUrl: "./electronic-signature-search-item.component.html",
  styleUrls: ["./electronic-signature-search-item.component.scss"],
})
export class ElectronicSignatureSearchItemComponent implements OnInit {
  @Output() public search = new EventEmitter<any>();
  @Output() public setLoading = new EventEmitter<boolean>();
  @Output() public batchSign = new EventEmitter();

  @Input() loading: any = false;
  @Input() formData: any;
  @Input() totalOne: number = 0;
  @Input() totalTwo: number = 0;
  @Input() totalThree: number = 0;
  @Input() totalFour: number = 0;
  @Input() queryType: any = "todo";
  @Input() isWatermark: any = false;
  @Input() from: any;
  @Input() contractType: any = 'COMMON';

  public showSign: boolean = false;
  public authorizationload: boolean = false;
  public watermarkload: boolean = false;
  public controlArray: any[] = [];
  public isCollapse = false;
  public businessModelList = [];
  public bigAreaList = [];
  public bmcList = [];
  public teamsList = [];
  public entryModeList = [];
  public taskStatusList = [];
  public modalityList = [];
  public isHandle = 0; // 待我补充是否处理
  public authorization = false;
  public isAuthorizationMail = false; //zsl admin邮箱维护
  public DEFAULT_SEARCH_PARAMS: SearchParams = {
    pageNo: 1,
    pageSize: 9999,
    name: null,
    email: null,
    roleIn: ["Sales Support", "COP Operation"],
    modalityIn: [],
    cycleGroupIn: [],
  };
  public userList = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private message: NzMessageService,
    private dictService: DictService,
    private activeRoute: ActivatedRoute,
    private service: WorkspaceListService,
    private router: Router,
    private fileService: FileService
  ) {}
  get isPodContract() {
    return this.contractType === 'POD';
  }
  public formValues = this.fb.group({
    referenceId: [null], //Reference No
    applicant: [null], // 销售邮箱
    hospitalName: [null], //医院
    authorizationRequired: [null], //是否授权
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
    queryType: [{ value: this.queryType, disabled: true }],
  });
  public watermarkForm = this.fb.group({
    fileId: [[], []], //图片fileId
  });

  public authorizationForm = this.fb.group({
    userListId: [{ value: [], disabled: false }, [Validators.required]],
  });

  ngOnInit() {
    this.getBusinessModelList();
    this.getBigAreaList();
    this.getBmcList();
    this.getTeamsList();
    this.getEntryModeList();
    // this.getTaskStatusList();
    this.getModalityList();
    this.init();
  }
  ngOnDestroy() {}
  init() {
    const role = JSON.parse(localStorage.getItem("roles"));
    if (role.includes("Contract Signatory")) {
      this.authorization = true;
      this.getUserModalityCycleGroup();
    }
    if (this.contractType ==='COMMON' && role.includes("OA")) {
      this.showSign = true;
    }
    if (this.contractType ==='POD' && role.includes("OM")) {
      this.showSign = true;
    }
    this.queryType = this.from === "my-done" ? "done" : "todo";
  }

  //获取合同签署人登录用户modality cycleGroup
  public getUserModalityCycleGroup() {
    var profiles = JSON.parse(localStorage.getItem("profiles"));
    profiles = profiles.filter((val) => val.role === "Contract Signatory");
    const modalitySet = new Set();
    const cycleGroupSet = new Set();
    profiles.forEach((val) => {
      modalitySet.add(val.modality);
      cycleGroupSet.add(val.cycleGroup);
    });
    this.DEFAULT_SEARCH_PARAMS.modalityIn = Array.from(modalitySet);
    this.DEFAULT_SEARCH_PARAMS.cycleGroupIn = Array.from(cycleGroupSet);
  }

  // 业务模式
  public getBusinessModelList() {
    this.dictService.dictData("BUSINESS_MODEL").subscribe((dictData) => {
      this.businessModelList = dictData.map(({ code, label }) => ({
        code,
        label,
      }));
    });
  }

  // 进单模式
  public getEntryModeList() {
    this.dictService.dictData("ENTRY_MODEL").subscribe((dictData) => {
      this.entryModeList = dictData.map(({ code, label }) => ({ code, label }));
    });
  }

  //流程状态
  public getTaskStatusList() {
    this.dictService.dictData("NODE_ECOS").subscribe((dictData) => {
      this.taskStatusList = dictData.map(({ code, label }) => ({
        code,
        label,
      }));
    });
  }

  // 销售区域（大区）
  public getBigAreaList() {
    // 数据字典全量查询
    const param = { dictGroup: "region", pageSize: 200 };
    this.http
      .post(`/act/ecom/dictData/queryDictData`, param)
      .subscribe((rest) => {
        if (rest.code === "0000") {
          const data = rest.data.rows;
          this.bigAreaList = data.map(({ dictValue, dictLabel }) => ({
            code: dictValue,
            label: dictLabel,
          }));
          this.bigAreaList.sort((a, b) => a.code.localeCompare(b.code));
        } else {
          this.message.create("error", `${rest.msg}`);
        }
      });
  }

  // bmc
  public getBmcList() {
    // 数据字典全量查询
    const param = { dictGroup: "bmc", pageSize: 200 };
    this.http
      .post(`/act/ecom/dictData/queryDictData`, param)
      .subscribe((rest) => {
        if (rest.code === "0000") {
          const data = rest.data.rows;
          this.bmcList = data.map(({ dictValue, dictLabel }) => ({
            code: dictValue,
            label: dictLabel,
          }));
          this.bmcList.sort((a, b) => a.code.localeCompare(b.code));
        } else {
          this.message.create("error", `${rest.msg}`);
        }
      });
  }

  // teams
  public getTeamsList() {
    // 数据字典全量查询
    const param = { dictGroup: "ECOS_TEAMS", pageSize: 200 };
    this.http
      .post(`/act/ecom/dictData/queryDictData`, param)
      .subscribe((rest) => {
        if (rest.code === "0000") {
          const data = rest.data.rows;
          this.teamsList = data.map(({ dictValue, dictLabel }) => ({
            code: dictValue,
            label: dictLabel,
          }));
          this.teamsList.sort((a, b) => a.code.localeCompare(b.code));
        } else {
          this.message.create("error", `${rest.msg}`);
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

  submitForm($event: any, value: any) {
    if (value.oitStartMonth) {
      value.oitStartMonth = moment(value.oitStartMonth).format("YYYY-MM");
    }
    if (value.oitEndMonth) {
      value.oitEndMonth = moment(value.oitEndMonth).format("YYYY-MM");
    }
    if ($event) {
      this.formValues.patchValue({
        queryType: $event,
      });
      this.queryType = $event;
    }
    this.loading = true;
    this.setLoading.emit(this.loading);
    //value.isHandle = this.isHandle;
    this.search.emit(this.formValues.getRawValue());
  }

  // 清空表单选项
  resetForm(value: any) {
    value.submitTime = null;
    this.formValues.reset();
    this.formValues.patchValue({
      queryType: this.queryType,
    });
    this.loading = true;
    this.setLoading.emit(this.loading);
    this.search.emit(this.formValues.getRawValue());
  }

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
    this.controlArray.forEach((c, index) => {
      c.show = this.isCollapse ? index < 6 : true;
    });
  }

  //提交时间拆分
  public timeChange(data) {
    if (data.submitTime && data.submitTime.length != 0) {
      this.formValues.patchValue({
        ...this.formValues,
        submitStartTime: moment(data.submitTime[0]).format("YYYY-MM-DD"),
        submitEndTime: moment(data.submitTime[1]).format("YYYY-MM-DD"),
      });
    } else {
      this.formValues.patchValue({
        ...this.formValues,
        submitStartTime: null,
        submitEndTime: null,
      });
    }
  }

  public startDate = null;
  public endDate = null;
  public disabledStartDate = (startValue: Date): boolean => {
    if (!this.endDate) {
      return false;
    }
    return startValue.getTime() > this.endDate.getTime();
  };
  public disabledEndDate = (endValue: Date): boolean => {
    if (!this.startDate) {
      return false;
    }
    return endValue.getTime() < this.startDate.getTime();
  };

  public changeStartMonth(data) {
    this.startDate = data.oitStartMonth;
  }
  public changeEndMonth(data) {
    this.endDate = data.oitEndMonth;
  }
  authorizationCancels() {
    this.isAuthorizationMail = false;
  }
  async handleBatchSignContract() {
    this.batchSign.emit();
  }

  handleDownloadExcel() {
    const url = this.isPodContract ? "/act/contractSign/flow/pod/export" : "/act/contractSign/flow/export" ;
    this.http.postDownload(url, null).subscribe(
      (rest) => {
        this.fileService.downloadResponse("Tasks", rest);
        this.message.success("导出成功");
      },
      (error) => {
        this.message.error("导出失败" + error);
      }
    );
    // console.log("下载报表");
  }

  async getImage() {
    //查询图片列表
    return new Promise((resolve) => {
      this.service.getImage().then((res) => {
        this.watermarkload = false;
        resolve(res);
        if (res.code == "0000") {
          const { data } = res;
          if (data.length > 0) {
            const fileList = data.map((val) => {
              return {
                fileId: val.fileId,
                uid: val.fileId,
                url: `${location.origin}${environment.base_href}/act/ecos/signature/get/image/${val.fileId}`,
                fileName: val.fileName,
              };
            });
            this.watermarkForm.patchValue({
              fileId: fileList,
            });
          }
        }
      });
    });
  }
}
