import { Component, OnInit,Input} from '@angular/core';

@Component({
  selector: 'app-apploading',
  templateUrl: './app-loading.component.html',
  styleUrls: ['./app-loading.component.scss']
})
export class ApploadingComponent implements OnInit {
  @Input() load: boolean=false;

  @Input() isInner: boolean = false;
  constructor() { }

  ngOnInit() {
  }
}
