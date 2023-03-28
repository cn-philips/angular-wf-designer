import { Component, Input, OnInit } from "@angular/core";
import { HttpService } from "@core/services";
import { saveAs } from "file-saver";

@Component({
  selector: 'approval-history-signature',
  templateUrl: './approval-history-signature.component.html',
  styleUrls: ['./approval-history-signature.component.scss']
})
export class ApprovalHistorySignatureComponent implements OnInit {
  loaded = false;

  @Input() applyId: string; // 流程实例ID

  nzAlign = "center";
  tableLoading = false;
  tableData = [];
  constructor(private http: HttpService) { }

  ngOnInit() {
    this.getApprovalHistory();
  }

  getApprovalHistory() {
    this.tableLoading = true;
    const url = `/act/ecos/signature/history/${this.applyId}`;
    this.http.get(url).subscribe(({ data }) => {      
      this.tableData = data;      
      this.tableLoading = false;
    });
  }

}
