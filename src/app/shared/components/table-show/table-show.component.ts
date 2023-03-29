import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ServesiceService } from '@core/services';
@Component({
  selector: 'app-table-show',
  templateUrl: './table-show.component.html',
  styleUrls: ['./table-show.component.scss']
})
export class TableShowComponent implements OnInit {

  constructor(private ServesiceService: ServesiceService) { }

  ngOnInit() {
  }
  public ngOnChanges() {
    this.ServesiceService.dealTable.subscribe(val => {

      this.data = val;
    })
  }
  @ViewChild('child') child;
  @Input() data: any = {};
  @Input() headData: any = [];

}
