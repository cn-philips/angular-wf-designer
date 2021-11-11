import { Component, OnInit, Input } from '@angular/core';
import { FileService, PdfmakeService, HttpService } from '../../services';

@Component({
  selector: 'multi-simple-pdf-viewer',
  templateUrl: './multi-simple-pdf-viewer.component.html',
  styleUrls: ['./multi-simple-pdf-viewer.component.scss']
})
export class MultiSimplePdfViewerComponent implements OnInit {

  public showSidebarButton = true;
  public showFindButton = true;
  public showPagingButtons = true;
  public showZoomButtons = true;
  public showPresentationModeButton = false;
  public showOpenFileButton = false;
  public showPrintButton = false;
  public showDownloadButton = true;
  public showBookmarkButton = false;
  public showSecondaryToolbarButton = true;
  public showRotateButton = false;
  public showHandToolButton = false;
  public showScrollingButton = true;
  public showSpreadButton = false;
  public showPropertiesButton = false;

  @Input()
  pdfFileIds: any[] = [];

  hideSelect: boolean = true;

  fileList: any[] = [];

  src: Uint8Array;

  disableFlag: boolean = false;

  item: any;

  constructor(private http: HttpService, private fileService: FileService) { }

  ngOnInit() {
    if(this.pdfFileIds && this.pdfFileIds.length > 0) {
      console.log('==> pdfFileIds', this.pdfFileIds)

      const fileId = this.pdfFileIds[0];
      this.item = this.pdfFileIds[0];
      this.getPdfFile(fileId);

      this.pdfFileIds.forEach((item, idx) => {
        this.fileList.push({
          text: '文件' + (idx+1),
          value: item
        });
        
      });
      if(this.pdfFileIds.length > 1) {
        this.hideSelect = false;
      }
    }
  }

  getPdfFile(id: string) {
    if(!id) return;
    this.disableFlag = true;
    let uri = `/act/file/download/${id}`;
    this.http.get(uri).subscribe(res => {
      if (res.code === '0000') {
        let { data, name } = res.data;
        let arr = this.fileService.base64ToArrayBuffer(data);
        let u8a = new Uint8Array(arr);
        this.src = u8a;
        this.disableFlag = false;;
      } else {
        console.log('==> file/download error', res)
        this.disableFlag = false;
      }
    });
  }

  changeSrc(event) {
    console.log(this.item);
    if(event) {
      this.getPdfFile(this.item);
    }
  }

}
