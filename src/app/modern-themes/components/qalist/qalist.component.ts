import { Component, Input, OnInit } from "@angular/core";
import { HttpService } from "../../../core/services";

@Component({
  selector: "app-qalist",
  templateUrl: "./qalist.component.html",
  styleUrls: ["./qalist.component.scss"],
})
export class QAListComponent implements OnInit {
  constructor(private http: HttpService) {}

  @Input("type")
  public qsType: any = "cos";

  manualList: Array<any> = [];
  ngOnInit() {
    this.initManuals();
  }
  initManuals() {
    this.manualList = [];
    this.getQa();
  }
  //Q&A的链接
  getQa() {
    switch (this.qsType) {
      case "cos":
        this.http
          .get(`/act/ecom/dictData/queryDrop?dictGroup=LINK_QA_PDF`)
          .subscribe((rest) => {
            if (rest.code === "0000") {
              let manualList = [...rest.data];
              manualList.map((val) => {
                val.type = "pdf";
              });
              this.http
                .get(`/act/ecom/dictData/queryDrop?dictGroup=LINK_QA_LINK`)
                .subscribe((res) => {
                  let videoData = [...res.data];
                  videoData.map((val) => {
                    val.type = "video";
                  });
                  this.manualList = [...videoData, ...manualList];
                });
            }
          });
        break;
      case "sp":
        // special approval
        this.http
          .get(`/act/ecom/dictData/queryDrop?dictGroup=LINK_QA_PDF_SP`)
          .subscribe((res) => {
            const sp_pdf = [...res.data];
            if (sp_pdf) {
              sp_pdf.map((e) => {
                e.type = "pdf";
              });
            }
            this.http
              .get(`/act/ecom/dictData/queryDrop?dictGroup=LINK_QA_LINK_SP`)
              .subscribe((rest) => {
                const sp_video = [...rest.data];
                if (sp_video) {
                  sp_video.map((e) => {
                    e.type = "video";
                  });
                }
                this.manualList = [...sp_pdf, ...sp_video];
              });
          });
        break;
      case "snow":
        this.http
          .get(`/act/ecom/dictData/queryDrop?dictGroup=LINK_SNOW_PDF`)
          .subscribe((res) => {
            if (res.code === "0000") {
              let manualList = [...res.data];
              manualList.map((val) => {
                val.type = "pdf";
              });
              this.manualList = [...manualList];
            }
          });
        break;
    }
  }
  //打开pdf
  openPdf(item) {
    var urlPath = window.document.location.href;
    var docPath = window.document.location.pathname;
    var index = urlPath.indexOf("#");
    var serverPath = urlPath.substring(0, index);
    // pdfPreview
    let url;
    url =
      item.type == "pdf"
        ? `${serverPath}act/system/preview/pdf/dict/${item.value}/${item.tag}`
        : item.label;
    window.open(url);
  }
}
