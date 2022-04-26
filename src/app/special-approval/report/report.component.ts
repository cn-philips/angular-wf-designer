import { Component, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import {
  BG_LIST,
  PROCESS_STATUS,
  NODE_ACTION,
} from "../special-approval.constants";

@Component({
  selector: "special-approval-report",
  templateUrl: "./report.component.html",
  styleUrls: ["./report.component.scss"],
})
export class ReportComponent implements OnInit {
  formValues = this.fb.group({
    status: [null],
    bg: [null],
    submitDate: [null],
  });

  searchBtnLoading: boolean = false;

  selectOptions = {
    statuses: [
      { label: "待审批", value: PROCESS_STATUS.START },
      { label: "待反馈", value: NODE_ACTION.FEEDBACK },
      { label: "已完成", value: PROCESS_STATUS.COMPLETED },
      { label: "已退回", value: PROCESS_STATUS.REJECTED },
      { label: "已撤回", value: PROCESS_STATUS.WITHDRAW },
      { label: "已取消", value: PROCESS_STATUS.CANCELLED },
    ],
    bgs: BG_LIST,
  };
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {}

  onExport(type: string): void {
    alert(`导出${type}, 待实现`);
  }
}
