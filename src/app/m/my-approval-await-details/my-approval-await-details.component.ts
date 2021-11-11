import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { EmitterService } from "./../../services/emitter.service";
import { HttpService } from '../../services';
import { MyTaskService } from '../my-task/my-task.service';
import { Router } from '@angular/router';
import { ToastService } from 'ng-zorro-antd-mobile';
export interface Query {
  descendants: boolean;
  first: boolean;
  read: any;
  isViewQuery: boolean;
  selector: any;
}

@Component({
  selector: 'app-my-approval-await-details',
  templateUrl: './my-approval-await-details.component.html',
  styleUrls: ['./my-approval-await-details.component.scss']
})
  
export class MyApprovalAwaitDetailsComponent implements OnInit {
  
    listDetails = [];
    taskData: any;
    processInstanceId: string;
    approveType: string;
    draftData: object;
    disabled: boolean = true;
    isComment: boolean = true;
    processType: string; // '0'特价备案，'1'特价，'2'通用
    parentUrl: string = '/m/my-approval-await';

    constructor(
      public emitService: EmitterService, 
      private http: HttpService,
      private router: Router,
      private _toast: ToastService,
      private myTaskService: MyTaskService) {

    }
  
    onChange(event) {
      console.log(event);
    }
  
     // two parts
    choose(event) {
      console.log('index: ', event.selectedIndex, 'value: ', event.value);
    }
  
    ngOnInit() {
      // receive the father router processInstanceId
      // this.processInstanceId = this.myTaskService.;

      this.taskData = this.myTaskService.taskData;

      this.taskData = this.myTaskService.taskData;

      if (!this.taskData['taskFormComponentList']) {
        this.router.navigateByUrl(this.parentUrl);
        return;
      }
      // const taskName = this.taskData['activitiTask']['name'] || '';
      // const processName = this.taskData['activitiTask']['processDefinitionName'] || '';
      const draftDataTmp = this.taskData['taskFormComponentList']['globalVariables']['draftData'];
      if (typeof (draftDataTmp) === 'object') {
        this.draftData = draftDataTmp;
      } else {
        this.draftData = JSON.parse(draftDataTmp);
      }

      console.log('draftDataObj', this.draftData);
      const processName = this.draftData['name'];
      const taskName = '';

      if (processName.indexOf('通用') > -1) {
        this.processType = '2';
      } else if (processName.indexOf('特价') > -1) {
        const formData = JSON.parse(this.draftData['formData']);
        if (!formData['quotationadd'] || !JSON.parse(formData['quotationadd'])['quotationList'] ) {
          this.processType = '0'; //特价备案
        } else {
          const quotationList = JSON.parse(formData['quotationadd'])['quotationList'];
          this.processType = quotationList.length == 0 ? '0' : '1'; //特价备案 or 特价
          for(let item of quotationList) {
            if (!item['unitTotalPrice'] || '' === item['unitTotalPrice']) {
              this.processType = '0'; //特价备案
              break;
            }
          }
        }
      } 

      console.log('processType', this.processType);

      console.log('taskData', this.taskData);
      this.processInstanceId = this.taskData['taskFormComponentList']['processInstanceId'];

      // this.getOAWbsProcess();
  
    }
  
    // nav
    onLeftClick() {
      window.history.go(-1);
    }
  
  }
  




