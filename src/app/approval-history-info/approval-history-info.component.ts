import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {HttpService, NgxDatatableService} from '../services';
import {AppService} from '../app.service';


@Component({
  selector: 'approval-history-info',
  templateUrl: './approval-history-info.component.html',
  styleUrls: ['./approval-history-info.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ApprovalHistoryInfoComponent implements OnInit {

  @Input()
  processInstanceId: string;
  loadingIndicator = true;
  rows = [];
  temp = [];
  selected = [];
  editing = [];
  tablename: string = '';
  mainFunctionUrl: string;
  //set the table column and cell style according to your requirement
  getCellClass = this.ngxDatatableService.getCellClass;
  getHeaderClass = this.ngxDatatableService.getHeaderClass;

  constructor(private appService: AppService,
              private http: HttpService,
              private ngxDatatableService: NgxDatatableService
  ) {


  }


  showStatue(row){
    let statue = ''
    const completed:boolean = row['completed'];
    const manual:boolean = row['simpleRouter'];
    const jumped:boolean = row['deleteReason'] === 'jump';
    if(completed){
      statue =  'default';
      if(jumped && !manual) {
        statue = 'error';
      }
    }else{
      statue = 'processing';
    }
    return statue;
  }

  showStatueDisplay(row){
    // console.log(row);
    let statue = ''
    const completed:boolean = row['completed'];
    const manual:boolean = row['simpleRouter'];
    const jumped:boolean = row['deleteReason'] === 'jump';
    if(completed){
      statue =  '已完成';
      if(jumped && !manual) {
        statue = '终止';
      }
    }else{
      statue = '处理中';
    }
    return statue;
  }

  ngOnInit() {
    this.mainFunctionUrl = '/act/task/listTaskInfo/' + this.processInstanceId;
    this.updateRowList();
  }

  updateRowList() {
    this.fetch((data) => {
      this.temp = [...data];
      this.rows = [...data];
      setTimeout(() => {
        this.loadingIndicator = false;
      }, 1500);
    });
  }

  fetch(cb) {
    const uri = this.mainFunctionUrl;
    this.http.post(uri, {}).subscribe(res => {
      if ('0000' == res.code) {
        const data = res.data == null ? [] : res.data;
        cb(data);
      }
    });
  }

  getRowClass(row){
    return {
      'on-going': !row.completed
    }
  }

}
