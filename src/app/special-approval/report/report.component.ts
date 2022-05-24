import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { FileService, HttpService, ReportExportService } from "../../services";
import { NzMessageService } from "ng-zorro-antd";
import { SpecialApprovalService } from "../special-approval.service";

@Component({
  selector: "special-approval-report",
  templateUrl: "./report.component.html",
  styleUrls: ["./report.component.scss"],
})
export class ReportComponent implements OnInit {
  formValues = this.fb.group({
    applyStatusIn: [null, [Validators.required]],
    bgIn: [null, [Validators.required]],
    submitDate: [null],
  });

  userPermission = [];

  searchBtnLoading: boolean = false;

  selectOptions = {
    statuses: [
      { label: "待审批", value: "start" },
      { label: "待反馈", value: "feedback" },
      { label: "已完成", value: "approved" },
      { label: "已退回", value: "rejected" },
      { label: "已撤回", value: "withdraw" },
      { label: "已取消", value: "canceled" },
    ],
    bgs: [],
  };

  reportList = [
    {
      label: "特批生产发货",
      items: [
        { value: "特批开始生产报表", type: "production" },
        // {value: '特批发货报表', type: ''},
        { value: "飞利浦承担额外清关、仓储、物流费用", type: "logisticscost" },
        // {value: 'Last Buy特批生产发货', type: ''},
      ],
    },
    {
      label: "安装及验收",
      items: [
        { value: "免费延长保修", type: "warranty" },
        { value: "用户自定义审批", type: "installcost" },
        { value: "转库", type: "transferlib" },
        { value: "商务条款不变，机器互换", type: "machineexchange" },
        // {value: '非直销订单按直销方式确认收入', type: ''},
        // {value: 'COO US', type: ''},
        // {value: 'COO CC', type: ''},
        // {value: 'COO PD&IGT', type: ''},
        // {value: '经销商签署安装报告的特批', type: ''},
      ],
    },

    {
      label: "订单质量管理",
      items: [
        { value: "RDD-OIT > 180 days订单保留", type: "rddoit180reserv" },
        //     {value: 'Cancel Order', type: ''},
        //     {value: 'De-book', type: ''},
        //     {value: 'Order Replace/Aging', type: ''},
        //     {value: 'COO US', type: ''},
        //     {value: 'COO CC', type: ''},
        //     {value: 'COO PD&IGT', type: ''},
        //     {value: '经销商签署安装报告的特批', type: ''},
      ],
    },
    {
      label: "信用证管理",
      items: [{ value: "L/C amendment", type: "lcamendment" }],
    },
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private reportExportService: ReportExportService,
    private fileService: FileService,
    private message: NzMessageService,
    private spService: SpecialApprovalService
  ) {}

  ngOnInit(): void {
    const profile = localStorage.getItem("profiles") as string;
    let currentUser = JSON.parse(profile);
    let bgs = [];
    for (let i = 0; i < currentUser.length; i++) {
      bgs[i] = currentUser[i].modality;
    }
    this.selectOptions.bgs = Array.from(new Set(bgs));
    const date = new Date();
    this.formValues.patchValue({
      applyStatusIn: [
        "start",
        "feedback",
        "approved",
        "rejected",
        "withdraw",
        "canceled",
      ],
      bgIn: Array.from(new Set(bgs)),
      submitDate: [this.getFirstDay(), date],
    });
    this.initPermission(this.formValues.get("bgIn").value);
  }

  onExport(type: string, name: string): void {
    this.formValues.markAsDirty();
    if (this.formValues.invalid) {
      this.message.error("请选择申请状态或BG");
      return;
    }
    const dates = this.formValues.get("submitDate").value;
    let param = {
      applyType: type,
      bgIn: this.formValues.get("bgIn").value,
      applyStatusIn: this.formValues.get("applyStatusIn").value,
      submitStartTime: dates ? dates[0] : null,
      submitEndTime: dates ? dates[1] : null,
    };
    console.log(param);
    if (type !== "" && type !== null && type !== undefined) {
      this.http
        .postDownload("/act/specialapprove/report/export", param)
        .subscribe((rest) => {
          this.fileService.downloadResponse(name, rest);
        });
    } else {
      this.message.error("当前项暂无报表");
    }
  }

  async initPermission(bgInList) {
    this.userPermission = await this.spService.getReportPermission(bgInList);
  }

  //获取当月第一天日期
  getFirstDay() {
    const date = new Date();
    var tYear = date.getFullYear();
    var tMonth = date.getMonth();
    tMonth = this.doHandleZero(tMonth + 1);
    return new Date(tYear + "-" + tMonth + "-01");
  }
  // 补零函数
  doHandleZero(zero) {
    var date = zero;
    if (zero.toString().length == 1) {
      date = "0" + zero;
    }
    return date;
  }

  //BG change后刷新
  refuseBgChang(e) {
    let bgInList = this.formValues.get("bgIn").value;
    if (bgInList.length > 0) {
      this.initPermission(this.formValues.get("bgIn").value);
    } else {
      this.message.error("请选择BG");
      this.userPermission = [];
    }
  }
}
