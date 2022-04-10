import { Component, OnInit } from '@angular/core';
import { MyTaskService } from '../../my-task/my-task.service';
import { HttpService } from '../../../services';
import { Router } from '@angular/router';
import { ToastService } from 'ng-zorro-antd-mobile';
import { ThemeSettingsModule } from '../../../../vendor/libs/theme-settings/theme-settings.module';

@Component({
  selector: 'app-claim-task-detail',
  templateUrl: './claim-task-detail.component.html',
  styleUrls: ['./claim-task-detail.component.scss']
})
export class ClaimTaskDetailComponent implements OnInit {

  taskObj: any;
  taskData: any;
  routerList: any = [];
  processInstanceId: string;
  disabled: boolean = false;
  processType: string; // '0'特价备案，'1'特价，'2'通用
  loadingIndicator: boolean = false;
  parentUrl: string = '/m/claim-task';
  constructor(
    private http: HttpService,
    private router: Router,
    private _toast: ToastService,
    private myTaskService: MyTaskService
  ) { }

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
  }

  //cancel button
  cancelBtnClick() {
    this.router.navigateByUrl('/m/claim-task')
  }

  mobileClaim() {
    this.loadingIndicator = true;
    const taskId = this.taskObj['id'];
    if(!taskId) return;
    const uri = '/act/task/claimTask/' + taskId + '/' + localStorage.getItem('ng_philips_code1');
    this.http.post(uri).subscribe(res => {
      // console.log(res);
      if ('0000' == res.code) {
        const toast = ToastService.success(res['msg'], 1000, () => {
          this.loadingIndicator = false;
          this.cancelBtnClick();
        });
      } else {
        const toast = ToastService.fail(res['msg'], 3000);
        this.loadingIndicator = false;
      }
    });
  }

}
