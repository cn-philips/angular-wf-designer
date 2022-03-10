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

  listStep: any[]; //全部流程
  oitChangeProcess:any[]; //改单
  oitChangeProcessFlag:any=false;//是否显示改单进度条
  oitCancelProcess:any[]; //取消进单
  oitCancelProcessFlag:any=false; //是否显示取消进度条
  oitCloseProcess:any[];  //关闭合同概要表
  oitCloseProcessFlag:any=false; //是否显示关闭合同概要表的进度条
  oitRejectProcess:any[]; //退回到合同概要表
  oitRejectProcessFlag:any=false; //退回到合同概要表的进度条
  constructor(
    private http: HttpService,
    public activatedRouter: ActivatedRoute,
  ) {
    this.getSteps();
  }

  // 查询工作流进度接口
  getSteps() {
    let status=this.activatedRouter.queryParams['_value'].status;
    let mainBusinessID=(status=='change_oit_approval'||status=='change_oit')?decodeString(this.activatedRouter.queryParams['_value'].mainId):decodeString(this.activatedRouter.queryParams['_value'].id);
    const params = {
      mainBusinessID:mainBusinessID,
    };
    this.http.post(`/act/process/getProcessWorkFlowInfo`, params).subscribe(res => {      
      if (res.code === '0000') {        
        this.listStep = res.data.mainProcess;
        this.oitCancelProcess=res.data.oitCancelProcess;
        this.oitCancelProcessFlag=this.oitCancelProcess.some(vals=>vals.running==true)
        this.oitCloseProcess=res.data.oitCloseProcess;
        this.oitCloseProcessFlag=this.oitCloseProcess.some(vals=>vals.running==true);
        this.oitRejectProcess=res.data.oitRejectProcess;
        this.oitRejectProcessFlag=this.oitRejectProcess.some(vals=>vals.running==true);
        this.oitChangeProcess=res.data.oitChangeProcess;
        this.oitChangeProcessFlag=this.oitChangeProcess.some(vals=>vals.running==true);
       
      }
    });
  }

  ngOnInit() {
  }

}
