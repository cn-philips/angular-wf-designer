import { Component, Input, OnInit } from "@angular/core";
import { HttpService } from "@core/services";
import { saveAs } from "file-saver";

@Component({
  selector: "shared-approval-history",
  templateUrl: "./approval-history.component.html",
  styleUrls: ["./approval-history.component.scss"],
})
export class ApprovalHistoryComponent implements OnInit {
  loaded = false;

  @Input() procInstId: string; // 流程实例ID

  nzAlign = "center";
  tableLoading = false;
  tableData = [];

  constructor(private http: HttpService) {}

  ngOnInit(): void {
    this.getApprovalHistory()
  }

  // ngOnChanges(): void {
  //   if (!this.loaded && this.procInstId) {
  //     this.getApprovalHistory();
  //   }
  // }

  getApprovalHistory() {
    this.tableLoading = true;
    const url = `/act/ecos/apply/history?processInstanceId=${this.procInstId}`;
    this.http.get(url).subscribe(({ data }) => {
      this.tableData = data;
      this.loaded = true;
      this.tableLoading = false;
    });
  }

  onDownloadFile({ taskAttachmentId, taskAttachmentName }) {
    const url = `/act/system/download/${taskAttachmentId}`;
    this.http
      .get(url, {
        responseType: "blob",
      })
      .subscribe((data) => {
        saveAs(data, taskAttachmentName);
      });
  }
}
