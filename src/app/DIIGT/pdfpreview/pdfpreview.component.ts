import { Component, OnInit,Output,Input} from '@angular/core';
import {HttpService} from '../../services';
import {NzMessageService} from 'ng-zorro-antd';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-pdfpreview',
  templateUrl: './pdfpreview.component.html',
  styleUrls: ['./pdfpreview.component.scss']
})
export class PdfpreviewComponent implements OnInit {
  public str = '';
 @Input() padData:any;
  constructor(
    private http: HttpService,
    private message: NzMessageService,
    private activeRoute: ActivatedRoute,
    private router: Router,
  ) {}
  pdfSRC:any;
  ngOnChanges()
  {
   //this.pdfSRC=this.padData;
  }
  ngOnInit() {
    //const params = this.activeRoute.queryParams['_value'];    
    const params=this.padData;    
    this.str = '';
    for (var i in params) {
      params[i]=encodeURIComponent(params[i]);
      this.str += i + '=' + params[i] + '&';
    }
    //let url="https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf"
    //let url='http://13.67.94.5:8099/act/template/pdf/preview?templateCode=CYTBSMH';
    var urlPath = window.document.location.href;
    var docPath = window.document.location.pathname;
    var index = urlPath.indexOf('#');
    var serverPath = urlPath.substring(0, index);
    // pdfPreview
    const url = `${serverPath}act/template/pdf/preview?${this.str}`;
   // let url='http://localhost:4200/act/template/pdf/preview?templateCode=CYTBSMH';
    this.pdfSRC =url;
  }
  dwonLoad()
  {
    var urlPath = window.document.location.href;
    var docPath = window.document.location.pathname;
    var index = urlPath.indexOf("#");
    var serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/template/doc/download?${this.str}`;
    window.open(url, '_self');
  }

}
