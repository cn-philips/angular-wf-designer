import {Component, Input, OnInit} from '@angular/core';
import {ImportFiles} from '../../domian/fileUpload';

@Component({
  selector: 'app-upload-file',
  template:`
    <nz-upload [(nzFileList)]="uploadManager.fileList" [nzBeforeUpload]="uploadManager.beforeUpload"  [nzLimit]="uploadManager.limit">
      <button nz-button><i nz-icon nzType="upload"></i><span>{{uploadManager.uploadButtonText}}</span></button>
    </nz-upload>
    <button
      nz-button
      nz-popconfirm
      nzTitle="确定上传?"
      [nzType]="'primary'"
      [nzLoading]="uploadManager.uploading"
      [disabled]="uploadManager.fileList.length == 0"
      style="margin-top: 16px"
      (nzOnConfirm)="uploadManager.handleUpload()"
    >
      {{ uploadManager.uploading ? '上传中' : '上传' }}
    </button>
  `
})
export class UploadFileComponent implements OnInit {


  @Input()
  uploadManager: ImportFiles;

  constructor() {

  }

  ngOnInit() {
  }

}
