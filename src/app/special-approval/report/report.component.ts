import { Component, OnInit } from "@angular/core";
import {FormBuilder, Validators} from '@angular/forms';
import {
  BG_LIST,
  PROCESS_STATUS,
  NODE_ACTION,
} from "../special-approval.constants";
import {FileService, HttpService, ReportExportService} from '../../services';
import {NzMessageService} from 'ng-zorro-antd';

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

  searchBtnLoading: boolean = false;

  selectOptions = {
    statuses: [
      { label: "待审批", value: 'start' },
      { label: "待反馈", value: 'feedback' },
      { label: "已完成", value: 'approved' },
      { label: "已退回", value: 'rejected' },
      { label: "已撤回", value: 'withdraw' },
      { label: "已取消", value: 'canceled' },
    ],
    bgs: BG_LIST,
  };

  reportList = [
    {
      label: '特批生产发货',
      items: [
        {value: '特批生产报表', type: 'production'},
        {value: '特批发货报表', type: ''},
        {value: '物流运输-特别仓储费用', type: 'logisticscost'},
        {value: 'Last Buy特批生产发货', type: ''},
      ]
    },
    {
      label: '安装及验收',
      items: [
        {value: '特批延长保修', type: 'warranty'},
        {value: '额外安装费用及其它售后费用', type: ''},
        {value: '转库', type: ''},
        {value: '机器互换', type: ''},
        {value: '非直销订单按直销方式确认收入', type: ''},
        {value: 'COO US', type: ''},
        {value: 'COO CC', type: ''},
        {value: 'COO PD&IGT', type: ''},
        {value: '经销商签署安装报告的特批', type: ''},
      ],
    },
    {
      label: '订单质量管理',
      items: [
        {value: 'RDD-OIT>180天订单保留', type: ''},
        {value: 'Cancel Order', type: ''},
        {value: 'De-book', type: ''},
        {value: 'Order Replace/Aging', type: ''},
        {value: 'COO US', type: ''},
        {value: 'COO CC', type: ''},
        {value: 'COO PD&IGT', type: ''},
        {value: '经销商签署安装报告的特批', type: ''},
      ]
    },
    {
      label: '信用证管理',
      items: [
        {value: 'L/C amendment', type: 'lcamendment'},
      ]
    }




  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private reportExportService: ReportExportService,
    private fileService: FileService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {}

  onExport(type: string, name: string): void {
    this.formValues.markAsDirty();
    if (this.formValues.invalid){
      this.message.error('请选择申请状态或BG')
      return
    }
    const dates = this.formValues.get('submitDate').value;
    let param = {
      applyType: type,
      bgIn: this.formValues.get('bgIn').value,
      applyStatusIn: this.formValues.get('applyStatusIn').value,
      submitStartTime: dates ? dates[0] : null,
      submitEndTime: dates ? dates[1] : null,
    }
    console.log(param)
    if (type !== '' && type !== null && type !== undefined){
      this.http.postDownload('/act/specialapprove/report/export', param).subscribe(rest => {
        this.fileService.downloadResponse(name, rest);
      });
    } else {
        this.message.error('当前项暂无报表')
    }
  }
}
