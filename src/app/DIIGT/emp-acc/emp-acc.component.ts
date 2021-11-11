import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {HttpService} from '../../services';
import {Router} from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import { ProcessStatusPipe } from '../../pipes/process-status.pipe';
import { TimeFormatePipe } from '../../pipes/time-formate.pipe';

import {
  decodeString,
  formatDates,
} from '../../../assets/js/tools';
import { resetComponentState } from '@angular/core/src/render3/instructions';

@Component({
  selector: 'app-emp-acc',
  templateUrl: './emp-acc.component.html',
  styleUrls: ['./emp-acc.component.scss'],
  providers: [ProcessStatusPipe,TimeFormatePipe],
})
export class EmpAccComponent implements OnInit {
  id = '';
  listOfData = [];
  nzAlign = 'center';
  constructor(
    public activatedRouter: ActivatedRoute,
    private router: Router,
    private http: HttpService,
    private message: NzMessageService,
  ) { }

  ngOnInit() {
    this.getTableData();
  }
  
  checkHtml(htmlStr) {
    if(htmlStr)
    {
      var  reg = /<[^>]+>/g;
      return reg.test(htmlStr);

    }
   
}
  // 文件下载
  public fileDwon(id) {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf('#');
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${id}`;
    window.open(url, '_blank');
  }

  getTableData() {
    // 审批记录
    const params = {
      mainBusinessID: decodeString(this.activatedRouter.queryParams['_value'].id),
    };
    this.http.post(`/act/process/getProcessWorkHisInfo`, params).subscribe(rest => {
      if (rest.code === '0000') {
        this.listOfData =  rest.data.reverse();
        const HTGYB=this.listOfData.find(vals=>vals.name=='HTGYB');
        let HTGYBS={...HTGYB};
        this.listOfData.map(res=>{
         res.createTime=formatDates(res.createTime);
         res.endTime=formatDates(res.endTime); 
         /**
          * 区分修改合同概要表还是提交合同概要表
          */        
         if(res.name==HTGYBS.name)
         {
           if(res.id==HTGYBS.id)
           {
             res.name='XJDHTGYBTX'
           }
           else
           {
             res.name='DHTGYBTX'
           }
         }        
        })        
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }

}
