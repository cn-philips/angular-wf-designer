import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../services';
import { decodeString, codeString, formatDatesNow,upLoadFileNew} from '../../../../assets/js/tools';
import { Router, ActivatedRoute } from '@angular/router';
import { NzMessageService} from 'ng-zorro-antd';
import {StatusProject} from '../../../pipes/status-project.pipe';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-change-record',
  templateUrl: './change-record.component.html',
  styleUrls: ['./change-record.component.scss'],
  providers: [
    StatusProject
  ],
})
export class ChangeRecordComponent implements OnInit {

  constructor(private router: Router,
              public activatedRouter: ActivatedRoute,
              private http: HttpService,
              private message: NzMessageService,
              ) { 
                this.getRecordData();
              }

  ngOnInit() {
  }
  public recordData: any = [];
  //改单记录
  getRecordData()
  {
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].mainId);
    let url=`/act/preparation/getChangeRecord?mainId=${mainId}`;
    this.http.get(url).subscribe((rest => {      
      if (rest.code === '0000') { 
          let {data}=rest;          
          let index=data[0].refId.indexOf("(");
          let nowRefId=data[0].refId.substr(0,index);
          let obj={
            lastMainId:data[0].hmainId,
            refId:nowRefId,
            orderChange:"",
            remark:"",
            fileNames:"",
            file:"",
            status:"",
            createTime:"",
          }
           this.recordData=[...rest.data];
           this.recordData.unshift(obj);
      }    
    }),(error)=>{
      this.message.create("error","请求异常!");
    }); 

  }

  public gotoOit(item) {   
    console.log(location.origin + environment.base_href + '/#/' + 'completeOit?id=' + codeString(item.lastMainId) + '&flag=1'+'&status=OITEND');
    window.open(location.origin + environment.base_href + '/#/' + 'completeOit?id=' + codeString(item.lastMainId) + '&flag=1'+'&status=OITEND');
  }

}
