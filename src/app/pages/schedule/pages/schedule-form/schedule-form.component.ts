import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, FormArray, Validators } from "@angular/forms";
import { BehaviorSubject, Observable, range } from "rxjs";
import { debounceTime, map, switchMap } from "rxjs/operators";
import { NzMessageService } from "ng-zorro-antd";
import { HttpService } from "@core/services/http.service";
import { ScheduleService } from "../../schedule.service";
import { Router, ActivatedRoute } from "@angular/router";
import * as moment from "moment";
import { RouterExtendService } from "@app/modern-themes/services/router-extend.service";

interface User {
  id: number;
  code: string;
  email: string;
  name: string;
  displayName: string;
}

@Component({
  templateUrl: "./schedule-form.component.html",
  styleUrls: ["./schedule-form.component.scss"],
})
export class ScheduleComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private serveice: ScheduleService,
    private activatedRouter: ActivatedRoute,
    private message: NzMessageService,
    private routerExtendService: RouterExtendService
  ) {}

  public pageLoading: boolean = false;
  fetchUserUrl = "/act/role/getUsersByEmail";
  searchChange$ = new BehaviorSubject("");
  isSearchLoading = false;
  isCcSearchLoading = false;
  flag: any = null; // flag=0 新增  flag=1 编辑
  dateTime: any = null; //绑定执行时间年月日
  day: any = null; //几号
  week: any = null; //周几
  time: any = null; //时间
  tips: any = "提示：本次报表数据导出的时间范围是从";
  showScope: any = null;

  userList: User[] = [];
  scriptTypeList = [];
  reportFormTypeList = [];

  config = {
    toolbar: [
    ['bold', 'italic', 'underline', 'strike'],        // 加粗，斜体，下划线，删除线
    ['blockquote', 'code-block'],                     // 引用，代码块
    [{ 'header': 1 }, { 'header': 2 }],               // 标题，键值对的形式；1、2表示字体大小
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],     // 列表
    [{ 'script': 'sub'}, { 'script': 'super' }],      // 上下标
    [{ 'indent': '-1'}, { 'indent': '+1' }],          // 缩进
    [{ 'direction': 'rtl' }],                         // 文本方向
    [{ 'size': ['small', false, 'large', 'huge'] }],  // 字体大小
    [{ 'header': [1, 2, 3, 4, false] }],              //几级标题 1 ~ 6
    [{ 'color': [] }, { 'background': [] }],          // 字体颜色，字体背景颜色
    [{ 'font': [] }],                                 //字体
    [{ 'align': [] }],                                //对齐方式
    ['clean'],                                        //清除字体样式
    ['link']
    ]
  }

  public formValue: FormGroup = this.fb.group({
    taskNumber: [{ value: null, disabled: false }],
    taskType: [{ value: null, disabled: false }, [Validators.required]], //任务类型
    taskName: [{ value: null, disabled: false }, [Validators.required]], //任务名称
    taskFrequency: [{ value: null, disabled: false }, [Validators.required]], //任务执行频率
    beganTime: [{ value: null, disabled: false }, [Validators.required]], //执行时间
    isEnabled: [{ value: true, disabled: false }, [Validators.required]], //是否启用
    scriptType: [{ value: null, disabled: false }], //脚本类型
    taskDescription: [{ value: null, disabled: false }, [Validators.required]], //任务描述
    mainPersons: [[], [Validators.required]], //主送人
    ccPersons: [[], []], // 抄送人
    emailType: [{ value: null, disabled: false }], //邮件类型
    emailTitle: [{ value: null, disabled: false }], //邮件标题
    bg: [[]], //BG
    reportFormType: [{ value: null }], //报表类型
    dataScope: [{ value: null, disabled: false }], //报表时间范围
    dataScopeTime: [{ value: null, disabled: false }], //报表范围时间
    isCustomRange: [{ value: false, disabled: false }], // 是否自定义时间范围
    customTime: [[], []], //自定义时间范围
    emailText: [{ value: null, disabled: false }], //邮件正文
    fileName: [{ value: null, disabled: true }], //导出报表文件名
    attachments: [[], []], //附件
  });

  get taskNumber(): any {
    return this.formValue.get("taskNumber").value as any;
  }

  get taskType(): any {
    return this.formValue.get("taskType").value as any;
  }

  get taskFrequency(): any {
    return this.formValue.get("taskFrequency").value as any;
  }

  get emailType(): any {
    return this.formValue.get("emailType").value as any;
  }

  get emailTitle(): any {
    return this.formValue.get("emailTitle").value as any;
  }

  get bg(): any {
    return this.formValue.get("bg").value as any;
  }

  get reportFormType(): any {
    return this.formValue.get("reportFormType").value as any;
  }

  get dataScope(): any {
    return this.formValue.get("dataScope").value as any;
  }

  get isCustomRange(): any {
    return this.formValue.get("isCustomRange").value as any;
  }

  get customTime(): any {
    return this.formValue.get("customTime").value as any;
  }

  taskTypeList = [
    { code: "email", label: "发送邮件" },
    { code: "script", label: "执行脚本" },
  ];
  enabledList = [
    { code: true, label: "启用" },
    { code: false, label: "禁用" },
  ];
  frequencyList = [
    { code: "month", label: "每月" },
    { code: "week", label: "每周" },
    { code: "day", label: "每天" },
    { code: "once", label: "一次" },
  ];
  emailTypeList = [
    { code: "reportForm", label: "报表邮件" },
    { code: "normal", label: "普通邮件" },
  ];
  bgList = [
    { code: "PD&IGT", label: "PD&IGT" },
    { code: "US", label: "US" },
    { code: "CC", label: "CC" },
  ];

  dataScopeList = [
    { code: "week", label: "任务执行当前周" },
    { code: "lastWeek", label: "任务执行上一周" },
    { code: "month", label: "任务执行当前月" },
    { code: "lastMonth", label: "任务执行上一月" },
    { code: "quarter", label: "任务执行当前季度" },
    { code: "lastQuarter", label: "任务执行上一季度" },
    { code: "year", label: "任务执行当前年" },
    { code: "lastYear", label: "任务执行上一年" },
  ];

  monthValues = [];
  weekValues = [
    { code: 1, label: "Mon(周一)" },
    { code: 2, label: "Tue(周二)" },
    { code: 3, label: "Wed(周三)" },
    { code: 4, label: "Thu(周四)" },
    { code: 5, label: "Fri(周五)" },
    { code: 6, label: "Sat(周六)" },
    { code: 7, label: "Sun(周天)" },
  ];

  //确认展示信息
  showData = {
    taskTypeLabel: null,
    taskName: null,
    frequencyLabel: null,
    beganTime: null,
    reportFormTypeLab: null,
    dataScopeLab: null,
    timeScope: null,
  };

  scopeParam = {
    count: 0,
    isFull: true,
    unit: null,
    when: null,
    customRange: false,
    customTime: [],
  }

  ngOnInit(): void {
    this.init();
  }

  init() {
    const getUserList = (keyword: string) => {
      if (!keyword) {
        this.isSearchLoading = false;
        this.isCcSearchLoading = false;
        return [];
      }
      return this.http
        .get(`${this.fetchUserUrl}`, {
          params: { email: keyword },
        })
        .pipe(map((res: any) => res.data as User[]))
        .pipe(
          map((users) =>
            users.map((user) => ({
              ...user,
              displayName: `${user.name}(${user.email})`,
            }))
          )
        );
    };

    const optionList$: Observable<User[]> = this.searchChange$
      .asObservable()
      .pipe(debounceTime(500))
      .pipe(switchMap(getUserList));
    optionList$.subscribe((data) => {
      this.userList = data;
      this.isSearchLoading = false;
      this.isCcSearchLoading = false;
    });

    this.initMonthValues();
    this.getScriptTypeList();

    this.flag = this.activatedRouter.queryParams["value"].flag;
    const taskNumber = this.activatedRouter.queryParams["value"].taskNumber;
    if (this.flag == 1) {
      this.getFormData(taskNumber);
      setTimeout(() => {this.initFormValidity()}, 3000);
    }
  }

  initMonthValues() {
    for (var i = 1; i <= 31; i++) {
      if (i < 10) {
        this.monthValues.push({ code: "0" + i, label: "0" + i });
      } else {
        this.monthValues.push({ code: i + "", label: i });
      }
    }
    this.monthValues.push({ code: "lastDay", label: "月末" });
  }

  initFormValidity() {
    this.clearValidators();
    if (this.taskType == "email") {
      this.formValue.get("mainPersons").setValidators([Validators.required]);
      this.formValue.get("emailType").setValidators([Validators.required]);
      this.formValue.get("emailTitle").setValidators([Validators.required]);
      this.formValue.get("emailText").setValidators([Validators.required]);

      if (this.emailType == "reportForm") {
        this.formValue.get("bg").setValidators([Validators.required]);
        this.formValue.get("reportFormType").setValidators([Validators.required]);
        this.formValue.get("fileName").setValidators([Validators.required]);
        if(this.isCustomRange){
          this.formValue.get("customTime").setValidators([Validators.required]);
        } else {
          this.formValue.get("dataScope").setValidators([Validators.required]);
        }
      }
    } else if (this.taskType == "script") {
      this.formValue.get("scriptType").setValidators([Validators.required]);
    }
  }

  clearValidators() {
    this.formValue.get("scriptType").clearValidators();
    this.formValue.get("mainPersons").clearValidators();
    this.formValue.get("emailType").clearValidators();
    this.formValue.get("emailTitle").clearValidators();
    this.formValue.get("bg").clearValidators();
    this.formValue.get("reportFormType").clearValidators();
    this.formValue.get("dataScope").clearValidators();
    this.formValue.get("customTime").clearValidators();
    this.formValue.get("emailText").clearValidators();
    this.formValue.get("fileName").clearValidators();
  }

  //获取任务信息
  getFormData(taskNumber: any) {
    this.pageLoading = true;
    if (taskNumber) {
      this.serveice
        .getData(taskNumber)
        .then((res) => {
          if (res.code == "0000") {
            var data = {
              ...res.data,
              taskNumber: taskNumber,
            };
            this.setData(data);
            this.pageLoading = false;
          } else {
            this.message.error(res.msg);
            this.pageLoading = false;
          }
        })
        .catch((error) => {
          this.message.error("请求失败");
          this.pageLoading = false;
        });
    } else {
      this.message.error("参数错误！");
    }
  }

  setData(data) {
    this.formValue.patchValue({
      taskNumber: data.taskNumber,
      taskType: data.taskType, //任务类型
      taskName: data.taskName, //任务名称
      taskFrequency: data.taskFrequency, //任务执行频率
      beganTime: data.params.beganTime, //执行时间
      isEnabled: data.isEnabled, //是否启用
      scriptType: data.params.scriptType, //脚本类型
      taskDescription: data.taskDescription, //任务描述
      mainPersons: [...data.params.mainPersons], //主送人
      ccPersons: [...data.params.ccPersons], // 抄送人
      emailType: data.params.emailType, //邮件类型
      emailTitle: data.params.emailTitle, //邮件标题
      bg: data.params.bg, //BG
      reportFormType: data.params.reportFormType, //报表类型
      dataScope: data.params.dataScope, //报表时间范围
      isCustomRange: data.params.isCustomRange,
      customTime: data.params.customTime,
      emailText: data.params.emailText, //邮件正文
      fileName: data.params.fileName, //导出报表文件名
      attachments: data.params.attachments, //附件
    });

    //设置执行时间展示
    var time = data.params.beganTime;
    const fre = this.taskFrequency;
    this.dateTime = time;
    var now = moment().format("YYYY-MM-DD HH:mm").split(" ")[0];
    if(fre == 'month' && time){
        if(time.includes(',')){
            var timeArr = time.split(',');
            this.day = timeArr[0];
            this.time = new Date( now + " " + timeArr[1] );
        } else {
            var timeArr = time.split('-')[2].split(' ');
            this.day = timeArr[0];
            this.time = new Date(now + " " + timeArr[1]);
        }
    } else if(fre == 'week' && time){
       this.week = moment(time).weekday() != 0 ? moment(time).weekday() : 7;
       this.time = new Date(time);
    } else if(fre == 'day' && time){
        const today = now + " " + time.split(' ')[1];
        this.time = new Date(today);
    }

    //初始化主送抄送人
    if (data.taskType == 'email'){
        const arr = [...data.params.mainPersons, ...data.params.ccPersons];
        arr.forEach(item =>{
            this.userList.push({
                id: null,
                code: null,
                email: item,
                name: item,
                displayName: null,
            })
        })
    }

    //初始化报表类型列表
    if (this.emailType == "reportForm" && this.bg && this.bg.length > 0) {
        this.getReportFormTypeList(this.bg);
        //初始化报表范围提示
        this.setScopeAndFileName(data.params.dataScopeTime);
        this.scopeEnable = true;
    }
  }

  //获取脚本类型
  getScriptTypeList() {
    this.serveice.getScriptTypeList().then((res) => {
      if (res.code == "0000") {
        this.scriptTypeList = res.data.map((item) => ({
          code: item.value,
          label: item.name,
        }));
      } else {
        this.message.error(res.msg);
      }
    });
  }

  taskTypeChange() {
    this.formValue.patchValue({
      scriptType: null,
      mainPersons: [], //主送人
      ccPersons: [], // 抄送人
      emailType: null,
      emailTitle: null,
      bg: [],
      reportFormType: null,
      dataScope: null,
      dataScopeTime: null,
      isCustomRange: false,
      customTime: [],
      emailText: null,
      fileName: null,
      attachments: [],
    });
  }

  emailTypeChange() {
    this.resetBg();
    if (this.emailType == "reportForm") {
      var title = "可在信息填写完整后自动生成或自行编辑";
      this.formValue.controls.emailTitle.setValue(title);
    }
  }

  resetBg() {
    this.formValue.patchValue({
      bg: [],
      emailTitle: null,
      reportFormType: null,
      dataScope: null,
      dataScopeTime: null,
      isCustomRange: false,
      customTime: [],
      emailText: null,
      fileName: null,
      attachments: [],
    });
  }

  bgChange() {
    if (this.emailType == "reportForm") {
      this.formValue.patchValue({
        reportFormType: null,
      });
      var title = "信息填写完整后自动生成";
      this.formValue.controls.emailTitle.setValue(title);
      this.reportFormTypeList = [];
      if (this.bg && this.bg.length > 0) {
        this.getReportFormTypeList(this.bg);
      }
    }
  }

  //获取导出报表类型
  getReportFormTypeList(bg) {
    this.serveice.getReportFormType(bg).then((res) => {
      if (res.code == "0000") {
        this.reportFormTypeList = res.data.map((item) => ({
          code: item.value,
          label: item.label,
        }));
      } else {
        this.message.error(res.msg);
      }
    });
  }

  reportFormTypeChange() {
    if (this.emailType == "reportForm") {
      //设置邮件标题
      this.setEmailTitle();
      //判断数据范围能否编辑
      this.isEnable();
    }
  }

  //设置邮件标题
  setEmailTitle() {
    const bgs = this.bg;
    const reportType = this.reportFormType;
    const fre = this.taskFrequency;
    if (fre && bgs && bgs.length > 0 && reportType) {
      //数据处理
      var frequency = "";
      var type = "";
      const arrFre = this.frequencyList.filter((val) => val.code == fre);
      if (arrFre && arrFre.length > 0) {
        frequency = arrFre[0].label;
      }
      const arrType = this.reportFormTypeList.filter(
        (val) => val.code == reportType
      );
      if (arrType && arrType.length > 0) {
        type = arrType[0].label;
      }
      //标题 = BG+报表类型
      var bg = "";
      for (var i = 0; i < bgs.length; i++) {
        if (i == 0) {
          bg = bgs[i];
        } else {
          bg = bg + "|" + bgs[i];
        }
      }
      var title = "COS定时任务：" + frequency + "/" + bg + "/" + type + "报表";
      this.formValue.controls.emailTitle.setValue(title);
    }
  }

  //处理执行时间
  frequencyChange() {
    this.resetTimes();

    //设置邮件标题
    this.setEmailTitle();
  }
  dayChange() {
    if (this.day) {
      if (this.day == "lastDay") {
        this.dateTime = null;
      } else {
        this.dateTime = moment().format("YYYY-MM").toString() + "-" + this.day;
      }
    }

    if (this.emailType == "reportForm") {
      //判断数据范围能否编辑
      this.isEnable();
    }
  }
  weekChange() {
    if (this.week) {
      var now = moment();
      this.dateTime = now.clone().weekday(this.week).format("YYYY-MM-DD");
    }

    if (this.emailType == "reportForm") {
      //判断数据范围能否编辑
      this.isEnable();
    }
  }
  timeChange() {
    //检查是否选择了任务执行频率
    if (!this.taskFrequency) {
      setTimeout(() => {
        this.resetTimes();
      }, 2);
    } else {
      if (this.emailType == "reportForm") {
        //判断数据范围能否编辑
        this.isEnable();
      }
    }
  }
  dateChange() {
    if (this.dateTime) {
      this.dateTime = moment(this.dateTime).format("YYYY-MM-DD HH:mm");
    }

    if (this.emailType == "reportForm") {
      //判断数据范围能否编辑
      this.isEnable();
    }
  }
  resetTimes() {
    this.dateTime = null;
    this.day = null;
    this.week = null;
    this.time = null;
  }

  // 搜索主送人
  onSearchUser(keyword: string) {
    this.isSearchLoading = true;
    this.searchChange$.next(keyword);
  }
  // 搜索抄送人
  onSearchCcUser(keyword: string) {
    this.isCcSearchLoading = true;
    this.searchChange$.next(keyword);
  }

  //返回
  handleCancel() {
    this.routerExtendService.back();
  }

  getDateTime() {
    //获取执行时间
    var fre = this.taskFrequency;
    if (!fre) {
      this.dateTime = null;
      return;
    }
    if (fre != "once" && this.dateTime && this.dateTime.includes(" ")) {
      //防止多次拼接
      this.dateTime = this.dateTime.split(" ")[0];
    }
    if (fre == "month") {
      if (this.day && this.time) {
        if (this.day == "lastDay") {
          this.dateTime = this.day + "," + moment(this.time).format("HH:mm");
        } else {
          if (this.dateTime) {
            this.dateTime += " " + moment(this.time).format("HH:mm");
          }
        }
      } else {
        this.dateTime = null;
      }
    } else if (fre == "week") {
      if (this.week && this.time && this.dateTime) {
        this.dateTime += " " + moment(this.time).format("HH:mm");
      } else {
        this.dateTime = null;
      }
    } else if (fre == "day") {
      if (!this.time) {
        this.dateTime = null;
      } else {
        this.dateTime = moment(this.time).format("YYYY-MM-DD HH:mm");
      }
    } else if (fre == "once" && this.dateTime) {
    } else {
      this.dateTime = null;
    }
  }

  //提交保存弹出确认框
  showInfo = false;
  cancelModeal() {
    this.showInfo = false;
    this.showData = {
      taskTypeLabel: null, // 任务类型
      taskName: null,      // 任务名称
      frequencyLabel: null, // 任务执行频率
      beganTime: null,     // 执行时间
      reportFormTypeLab: null, //报表类型
      dataScopeLab: null,  // 数据期限
      timeScope: null,  // 时间范围
    };
  }
  openShowModal() {
    this.initFormValidity();
    //获取执行时间
    this.getDateTime();
    this.formValue.patchValue({ beganTime: this.dateTime });
    //验证必填项
    for (let i in this.formValue.controls) {
      this.formValue.controls[i].markAsDirty();
      this.formValue.controls[i].updateValueAndValidity();
    }
    if (!this.formValue.valid) {
      this.message.error("有必填项未填写");
      return;
    }
    //获取展示信息
    this.getShowData();
    this.showInfo = true;
  }

  getShowData() {
    this.showData.taskName = this.formValue.get("taskName").value;
    var beganTime = this.formValue.get("beganTime").value;
    if(beganTime.includes("lastDay")) {
        this.showData.beganTime = beganTime.replace("lastDay","月末");
    } else {
        this.showData.beganTime = beganTime;
    }

    const arrTask = this.taskTypeList.filter(
      (val) => val.code == this.taskType
    );
    if (arrTask && arrTask.length > 0) {
      this.showData.taskTypeLabel = arrTask[0].label;
    }

    const arrFre = this.frequencyList.filter(
      (val) => val.code == this.taskFrequency
    );
    if (arrFre && arrFre.length > 0) {
      this.showData.frequencyLabel = arrFre[0].label;
    }

    if (this.reportFormType) {
      const arrType = this.reportFormTypeList.filter(
        (val) => val.code == this.reportFormType
      );
      if (arrType && arrType.length > 0) {
        this.showData.reportFormTypeLab = arrType[0].label;
      }
    }

    if (this.isCustomRange) {
      this.showData.dataScopeLab = "自定义";
      if(this.customTime && this.customTime.length > 0){
        var star = moment(this.customTime[0]).format("YYYY-MM-DD");
        var end = moment(this.customTime[1]).format("YYYY-MM-DD");
        this.showData.timeScope = star + "至" + end;
      }
    } else {
      if (this.dataScope) {
        const arrScop = this.dataScopeList.filter(
          (val) => val.code == this.dataScope
        );
        if (arrScop && arrScop.length > 0) {
          this.showData.dataScopeLab = arrScop[0].label;
        }
        this.showData.timeScope = this.showScope.split("从")[1];
      }
    }
  }

  //保存提交
  handleSubmit() {
    let data = this.formValue.getRawValue();
    const {
      taskNumber,
      taskType,
      taskName,
      taskFrequency,
      beganTime,
      isEnabled,
      scriptType,
      taskDescription,
      mainPersons,
      ccPersons,
      emailType,
      emailTitle,
      bg,
      reportFormType,
      dataScope,
      dataScopeTime,
      isCustomRange,
      customTime,
      emailText,
      fileName,
      attachments,
    } = data;

    const params = {
      beganTime,
      taskDescription,
      scriptType,
      mainPersons,
      ccPersons,
      emailType,
      emailTitle,
      bg,
      reportFormType,
      dataScope,
      dataScopeTime,
      isCustomRange,
      customTime,
      emailText,
      fileName,
      attachments,
      ...this.scopeParam,
    };
    let param = {
      taskNumber,
      taskType,
      taskName,
      taskFrequency,
      isEnabled,
      executeClassPath: scriptType,
      params: params,
    };
    this.pageLoading = true;
    if (this.flag == 0) {
      //新建提交
      this.serveice.Submit(param).then((res) => {
        if (res.code == "0000") {
          this.showInfo = false;
          this.message.create("success", res.msg);
          this.pageLoading = false;
          this.handleCancel();
        } else {
          this.showInfo = false;
          this.message.error(res.msg);
          this.pageLoading = false;
        }
      });
    } else if (this.flag == 1) {
      //保存更新
      if (this.taskNumber) {
        this.serveice
          .Update(param, this.taskNumber)
          .then((res) => {
            if (res.code == "0000") {
              this.showInfo = false;
              this.message.create("success", res.msg);
              this.pageLoading = false;
              this.handleCancel();
            } else {
              this.showInfo = false;
              this.message.error(res.msg);
              this.pageLoading = false;
            }
          })
          .catch((error) => {
            this.showInfo = false;
            this.message.error("请求失败");
            this.pageLoading = false;
          });
      }
    } else {
      this.message.error("参数错误");
      this.pageLoading = false;
    }
  }

  handleDelete() {
    if (this.taskNumber) {
      this.pageLoading = true;
      this.serveice.Delete(this.taskNumber).then((res) => {
        if (res.code == "0000") {
          this.pageLoading = false;
          this.message.create("success", res.msg);
          setTimeout(() => {
            this.handleCancel();
          }, 1);
        } else {
          this.message.error(res.msg);
          this.pageLoading = false;
        }
      });
    }
  }

  isAutoChange: any = false;
  scopeChange() {
    //创建数据范围提示信息
    if (!this.isAutoChange) {
      this.getDateTime();
      var dateTime = this.dateTime;  
      this.setScopeAndFileName(dateTime);
    }
    this.isAutoChange = false;
  }

  customRangeChange(){
    this.isAutoChange = true;
    this.showScope = null;
    this.formValue.patchValue({
      dataScope: null,
      dataScopeTime: null,
      customTime: [],
      fileName: null,
    });
  }

  scopeEnable: any = false;
  isEnable() {
    //判断数据范围是否启用
    this.isAutoChange = true;
    this.formValue.patchValue({
      dataScope: null,
      dataScopeTime: null,
      isCustomRange: false,
      customTime: [],
      fileName: null,
    });
    this.showScope = null;
    this.scopeEnable = false;
    const fre = this.taskFrequency;
    const type = this.reportFormType;
    if (this.emailType == "reportForm" && fre && type) {
      if (fre == "month") {
        if (this.day && this.time) {
          this.scopeEnable = true;
        }
      } else if (fre == "week") {
        if (this.week && this.time) {
          this.scopeEnable = true;
        }
      } else if (fre == "day") {
        if (this.time) {
          this.scopeEnable = true;
        }
      } else if (fre == "once") {
        if (this.dateTime) {
          this.scopeEnable = true;
        }
      }
    }
  }

  //获取时间范围和文件名
  setScopeAndFileName(dateTime) {
    this.showScope = null;
    const fre = this.taskFrequency;
    const scop = this.dataScope;
    const type = this.reportFormType;
    const customRange = this.isCustomRange;
    const customTime = customRange ? this.customTime : [];

    if (fre && dateTime && type && ((!customRange && scop) || (customRange && customTime && customTime.length > 0))) {
      var count = 0;
      var unit = null;
      var when = null;
      if (!customRange && scop) {
        if (scop.includes("last")) {
          count = 1;
          unit = scop.split("last")[1].toUpperCase();
          when = "LAST";
        } else {
          count = 0;
          unit = scop.toUpperCase();
          when = "CURRENT";
        }
      }
      
      if (dateTime.includes("last")) {
        var h = dateTime.split(",")[1];
        dateTime = moment().endOf("month").format("YYYY-MM-DD") + " " + h;
      }
      //判断日期是否有效,否则取下一个月
      dateTime = this.getValidDate(dateTime);
      this.formValue.patchValue({ dataScopeTime: dateTime });
      //保存参数，传递到接口
      this.scopeParam = {
        count: count,
        isFull: true,
        unit: unit,
        when: when,
        customRange: customRange,
        customTime: customTime,
      }

      //获取时间范围
      this.getTimeScope(count, dateTime, unit, when, customRange, customTime);
      const reportType = this.reportFormType;
      //获取文件名
      var typeLabel = null;
      const arr = this.reportFormTypeList.filter((val) => val.code == type);
      if (arr && arr.length > 0) {
        typeLabel = arr[0].label;
      }
      this.getFileName(count, dateTime, unit, when, typeLabel, customRange, customTime);
    }
  }

  //判断日期是否有效,否则取下一个月
  getValidDate(date) {
    if (date) {
      var isValid = moment(date).isValid();
      if (!isValid) {
        var a = date.split("-");
        var y = a[0];
        var m = a[1];
        var d = a[2];
        date =
          moment(y + "-" + m).add(1, "M").format("YYYY-MM") + "-" + d;
      }
    }
    return date;
  }

  //获取时间范围
  getTimeScope(count, dateTime, unit, when, customRange, customTime) {
    if (dateTime) {
      const param = {
        count: count,
        full: true,
        startDate: moment(dateTime),
        unit: unit,
        when: when,
        customRange: customRange,
        customTime: customTime,
      };
      this.serveice.getDuration(param).then((res) => {
        if (res.code == "0000") {
          this.showScope = this.tips + res.data;
        } else {
          this.message.error(res.msg);
        }
      });
    }
  }

  //获取文件名
  getFileName(count, dateTime, unit, when, typeLabel,  customRange, customTime) {
    if (dateTime && typeLabel) {
      const param = {
        fileName: typeLabel,
        count: count,
        full: true,
        startDate: moment(dateTime),
        unit: unit,
        when: when,
        customRange: customRange,
        customTime: customTime,
      };
      this.serveice.generateFileName(param).then((res) => {
        if (res.code == "0000") {
          this.formValue.controls.fileName.setValue(res.data);
        } else {
          this.message.error(res.msg);
        }
      });
    }
  }

  //克隆
  cloneTask(){
    this.pageLoading = true;
    setTimeout(() =>{
      this.formValue.patchValue({
        taskNumber: null,
      })
      this.flag = 0;
      this.pageLoading = false;
    },2000);
  }

}
