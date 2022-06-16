import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-pdf-preview",
  templateUrl: "./pdf-preview.component.html",
  styleUrls: ["./pdf-preview.component.scss"],
})
export class PdfPreviewComponent implements OnInit {
  visible = false
  pdfBaseUrl = null
  docBaseUrl = null
  pdfUrl = null
  pdfData = null
  constructor() {}

  ngOnInit() {
    this.initPdfBaseUrl()
  }

  initPdfBaseUrl() {
    const { href } = location
    const hashIndex = href.indexOf('#')
    const serverPath = href.slice(0, hashIndex)
    this.pdfBaseUrl = `${serverPath}act/template/pdf/preview?`
    this.docBaseUrl = `${serverPath}act/template/doc/download?`
  }

  calcPdfUrl(data, isDoc = false) {
    const paramsArr = []
    for(let key in data) {
      if (data[key]) {
        const params = encodeURIComponent(data[key])
        paramsArr.push(`${key}=${params}`)
      }
    }
    const paramsStr = paramsArr.join('&')
    const baseUrl = isDoc ? this.docBaseUrl : this.pdfBaseUrl
    return baseUrl + paramsStr
  }

  show(data) {
    if (!data) { return }
    this.pdfData = data
    this.pdfUrl = this.calcPdfUrl(data)
    this.visible = true
  }

  onHide() {
    this.visible = false
  }

  onDownLoad() {
    const pdfUrl = this.calcPdfUrl(this.pdfData, true)
    window.open(pdfUrl, "_self");
  }
}
