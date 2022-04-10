import { Component, OnInit, Input } from '@angular/core';
import { FileService, PdfmakeService } from '../../services';

@Component({
  selector: 'simple-pdf-viewer',
  templateUrl: './simple-pdf-viewer.component.html',
  styleUrls: ['./simple-pdf-viewer.component.scss']
})
export class SimplePdfViewerComponent implements OnInit {

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
  public showHandToolButton = true;
  public showScrollingButton = true;
  public showSpreadButton = false;
  public showPropertiesButton = false;

  @Input()
  qdetail: any;

  src: Uint8Array;

  constructor(private pdfmakeService: PdfmakeService, private fileService: FileService) { }

  ngOnInit() {
    if(this.qdetail) {
      // console.log('qdetail', this.qdetail);
      this.pdfmakeService.getSimplePdf(this.qdetail).subscribe(res=> {
        if (res.code === '0000') {
        let arr = this.fileService.base64ToArrayBuffer(res.data);
          let u8a =  new Uint8Array(arr);
          this.src = u8a;
        }
      });
    }
  }

}
