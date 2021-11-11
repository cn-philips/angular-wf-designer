import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { HttpService } from '../../../services';


@Component({
  selector: 'app-mobile-history',
  templateUrl: './mobile-history.component.html',
  styleUrls: ['./mobile-history.component.scss']
})
export class MobileHistoryComponent implements OnInit {

  @Input() processInstanceId: string = '';

  @ViewChild("dotTemplate") dotTemplate: TemplateRef<any>;

  historyRows = [];
  constructor(private http: HttpService) { }

  ngOnInit() {

    // console.log('test histroy list', this.processInstanceId);

    if ('' !== this.processInstanceId ) {
      this.getApprovalHistory();

    }
  }

  async getApprovalHistory() {
     
    const approvalFlowUri = `/act/task/getTaskFlowInfo/${this.processInstanceId}`;

    let flowRes = await this.http.get(approvalFlowUri).toPromise();
    let notLast = false;
    let currentItem = {
      'nzDot': this.dotTemplate
    };
    if( '0000' === flowRes.code) {
      // console.log(flowRes.data);
      const flowList = flowRes.data;
      for(let i of flowList) {
        if(i['running'] === true) {
          let htmlStr = '<p><b>' + i.name + '</b></p>';
          currentItem['htmlStr'] = htmlStr;
          notLast = true;
          break;
        }
      }
    }


    const approvalHistoryUri = `/act/task/listTaskInfo/${this.processInstanceId}`;
    this.http.post(approvalHistoryUri, {}).subscribe(res => {
      console.log('history all', res['data']);
      let tmpData = res['data'] || [];
      tmpData = tmpData.filter(i => {
        return i['completed'] === true;
      });
      tmpData.forEach(item => {
        let ownerDisplay = '审批人';
        if (item.name === 'Sales (备案)' || item.name === 'Sales') {
          ownerDisplay = '提交人';
        }
        let htmlStr = '<p><b>' + item.name + '</b></p>';
        htmlStr += '<p>'+ ownerDisplay +'：' + item.owner + '</p>';
        if(ownerDisplay === '审批人') {
          htmlStr += '<p>操作：' + (item.simpleRouter || '') + '</p>';
        }
        htmlStr += '<p>备注：' + (item.comment || '') + '</p>';
        item['htmlStr'] = htmlStr;
      });
      tmpData = tmpData.reverse();

      if(notLast) {
        tmpData.push(currentItem);
      }

      this.historyRows = [...tmpData];
    })
  }

}
