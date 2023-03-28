import { Component, OnInit } from '@angular/core';
import { HttpService, ServesiceService } from '@core/services';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
    templateUrl: './schedule.component.html',
    styleUrls: ['./schedule.component.scss']
})

export class ScheduleComponent implements OnInit{

  formValues: {
  }

  public total = 0;
  public loading = true;
  public tableData = [];

  constructor( 
      private http: HttpService,
      private message: NzMessageService,
      private servesiceService: ServesiceService
  ) {}

  ngOnInit() {
      this.getTableData();
  }
  
  updateParams(values: any) {
    if(values != 'refresh'){
      this.formValues = values;
    }
    this.getTableData();
  }

  getLoading(loading: boolean) {
    this.loading = loading;
  }

  getTableData(){
    const params = {
        ...this.formValues,
    }
    this.http.post(`/act/scheduler/list`, params).subscribe((rest => {
      if (rest.code === '0000') {
        const data = rest.data;
        this.tableData = data;
        this.total = rest.data.length;
        this.loading = false;
      } else {
        this.message.create('error', `${rest.msg}`);
        this.servesiceService.myFormLoad.emit(false);
      }
    }), (error => {
      this.loading = false;
      this.servesiceService.myFormLoad.emit(false);
      this.message.create("error", "服务器异常")
    }));
  }

}
