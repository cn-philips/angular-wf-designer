import { Component, Input } from '@angular/core';
import { UploadFile } from 'ng-zorro-antd'
import { saveAs } from 'file-saver';

import { HttpService } from '@core/services/http.service';

@Component({
  selector: 'app-upload-file-list',
  templateUrl: './upload-file-list.component.html',
  styleUrls: ['./upload-file-list.component.scss']
})
export class UploadFileListComponent {

  @Input() fileList: UploadFile[] = []

  constructor(
    private http: HttpService, 
  ) { }

  onDownloadFile({ fileId, name }) {
    let uri = `/act/system/download/${fileId}`;
    this.http.get(uri, {
      responseType: 'blob'
    }).subscribe(data => {
      saveAs(data, name);
    });
  }
}
