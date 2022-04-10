import { Component, OnInit } from '@angular/core';
import { MyTaskService } from '../../my-task/my-task.service';
import { HttpService } from '../../../services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
//my-task-pending-detail
export class DetailComponent implements OnInit {

  taskObj: any;
  taskData: any;
  routerList: any = [];
  processInstanceId: string;
  disabled: boolean = false;
  isComment: boolean = true;
  commentable: boolean = true;
  processType: string; // '0'特价备案，'1'特价，'2'通用
  uncommentaleList = ['Sales (备案)','Sales','Pricing Analyst','Finance Controller','Finance Control','OA','SOFON','OA File'];
  parentUrl: string = '/m/my-task-pending';
  constructor(
    private http: HttpService,
    private router: Router,
    private myTaskService: MyTaskService) { }

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
    } else if (processName.indexOf('特价') > -1 && taskName.indexOf('备案')> -1) {
      this.processType = '0';
    } else if (processName.indexOf('特价') > -1 ) {
      this.processType = '1';
    }


    this.getRouterMap();
    // this.taskSimpleRouterMap = this.taskData['taskSimpleRouterMap'];
    this.processInstanceId = this.taskObj['processInstanceId'] || '';

    console.log('final taskObj', this.taskObj);
    console.log('final taskData', this.myTaskService.taskData);

  }

  getRouterMap() {
    let taskSimpleRouter = this.taskData['taskSimpleRouterMap'];
    this.isComment = !!taskSimpleRouter;
    this.commentable = !!taskSimpleRouter;

    //由于uncommentaleList的中的task需要录入额外数据，所以不能在手机端操作
    const taskName = this.taskData['activitiTask']['name'] || '';
    if(this.uncommentaleList.indexOf(taskName) > -1) {
      this.commentable = false;
    }

    if(taskSimpleRouter) {
      for(let key in taskSimpleRouter) {
        this.routerList.push({
          value : key,
          label : taskSimpleRouter[key]
        })
      }
    }
  }

}
