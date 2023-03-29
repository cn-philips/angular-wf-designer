import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { HttpService } from '@core/services';
import { MessageService } from '@pages/system-setting/message-management/services/message.service';


@Component({
  selector: 'app-image-storage',
  templateUrl: './image-storage.component.html',
  styleUrls: ['./image-storage.component.scss']
})
export class ImageStorageComponent implements OnInit {

  constructor(private messageService:MessageService) { }
  images:Array<any> = []
  @Output("replace")
  replace:EventEmitter<any> = new EventEmitter();
  ngOnInit() {
    this.messageService.retrieveImages().subscribe(res=>{
      this.images = res;
    })
  }
  handleClick(img){
    this.replace.emit(img.url);
  }

}
