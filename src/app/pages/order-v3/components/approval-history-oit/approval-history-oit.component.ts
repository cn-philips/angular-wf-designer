import { Component, Input, OnInit } from "@angular/core";
import { HttpService } from "@core/services";
import { saveAs } from "file-saver";

@Component({
  selector: "approval-history-oit",
  templateUrl: "./approval-history-oit.component.html",
  styleUrls: ["./approval-history-oit.component.scss"],
})
export class ApprovalHistoryComponentOit implements OnInit {
  loaded = false;

  @Input() applyId: string; // 流程实例ID

  nzAlign = "center";
  tableLoading = false;
  tableData = [];
  historyParent = [];
  historyChild = [];

  constructor(private http: HttpService) { }

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
    const url = `/act/ecos/oit/historyParentOrChild?applyId=${this.applyId}`;
    this.http.get(url).subscribe((res) => {
      
      this.tableLoading = false;
      if (res.code == "0000") {
        const {data} = res;
        this.tableLoading = false;
        this.historyParent = data.historyParent;
        this.historyChild = data.historyChild;
        if (this.historyChild && this.historyChild.length > 0) {
          this.historyChild.forEach(val => val.title = "子流程" + val.referenceId)
        }
        if (this.historyParent && this.historyParent.length > 0) {
          this.historyParent.forEach(val => val.title = "主流程" + val.referenceId)
        }
      }
      //historyList=data
      // this.tableData = data;
      // this.loaded = true;
      // this.tableLoading = false;
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
