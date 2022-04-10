import { Component, OnInit } from '@angular/core';
import { MyTaskService } from '../../my-task/my-task.service';
import { HttpService } from '../../../services'
import { Router } from '@angular/router';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  taskObj: any;
  taskData: any;
  routerList: any = [];
  processInstanceId: string;
  disabled: boolean = true;
  isComment: boolean = true;
  commentable: boolean = true;
  processType: string; // '0'特价备案，'1'特价，'2'通用
  inputComment: string = '';
  simpleRouter: string = '';
  parentUrl: string = '/m/my-task-complete';

  constructor(private myTaskService: MyTaskService, private router: Router) { }

  ngOnInit() {
    this.taskObj = this.myTaskService.taskObj;

    this.taskData = this.myTaskService.taskData;

    if (!this.taskData['activitiTask']) {
      this.router.navigateByUrl(this.parentUrl);
      return;
    }

    const taskName = this.taskData['activitiTask']['name'] || '';
    const processName = this.taskData['activitiTask']['processDefinitionName'] || '';
    if (processName.indexOf('通用') > -1) {
      this.processType = '2';
    } else if (processName.indexOf('特价') > -1 && taskName.indexOf('备案') > -1) {
      this.processType = '0';
    } else if (processName.indexOf('特价') > -1) {
      this.processType = '1';
    }


    this.getRouterMap();
    // this.taskSimpleRouterMap = this.taskData['taskSimpleRouterMap'];
    this.processInstanceId = this.taskObj['processInstanceId'] || '';

    console.log('final taskObj', this.taskObj);
    console.log('final taskData', this.myTaskService.taskData);
    this.inputComment = this.taskData['activitiTask']['comment'] || '';
    this.simpleRouter = this.taskData['activitiTask']['simpleRouter'] || '';
  }

  getRouterMap() {
    let taskSimpleRouter = this.taskData['taskSimpleRouterMap'];
    this.isComment = !!taskSimpleRouter;
    this.commentable = true;
    // this.isComment = true;
    if (taskSimpleRouter) {
      for (let key in taskSimpleRouter) {
        this.routerList.push({
          value: key,
          label: taskSimpleRouter[key]
        })
      }
    }
  }

}
