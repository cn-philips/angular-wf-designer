import {Component, Input, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {HttpService} from '../../../services';
import {
  decodeString,
} from '../../../../assets/js/tools';


@Component({
  selector: 'igt-approval-flowline',
  templateUrl: './approval-flowline.component.html',
  styleUrls: ['./approval-flowline.component.scss']
})
export class IGTApprovalFlowlineComponent implements OnInit {

  listStep: any[];
  constructor(
    private http: HttpService,
    public activatedRouter: ActivatedRoute,
  ) {
    this.getSteps();
  }

  // 查询工作流进度接口
  getSteps() {
    const params = {
      mainBusinessID: decodeString(this.activatedRouter.queryParams['_value'].id),
    };
    this.http.post(`/act/process/getProcessWorkFlowInfo`, params).subscribe(res => {
      if (res.code === '0000') {        
        this.listStep = res.data;
      }
    });
  }

  ngOnInit() {
  }

}
