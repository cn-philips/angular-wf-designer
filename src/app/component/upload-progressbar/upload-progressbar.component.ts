import { Component, OnInit, Input } from '@angular/core';
import { FileService } from '../../services';

@Component({
  selector: 'app-upload-progressbar',
  templateUrl: './upload-progressbar.component.html',
  styleUrls: ['./upload-progressbar.component.scss']
})
export class UploadProgressbarComponent implements OnInit {

  @Input()
  progressCount: number = 0;

  constructor(private fileService: FileService) { }

  ngOnInit() {
  }

  cancelUploading() {
    this.fileService.cancelUploading();
  }

}
