import { Component, OnInit, Input } from '@angular/core';
import { HttpService } from '../../../services';
import { MyTaskService } from '../../my-task/my-task.service';
import { ToastService } from 'ng-zorro-antd-mobile';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mobile-task-comments',
  templateUrl: './mobile-task-comments.component.html',
  styleUrls: ['./mobile-task-comments.component.scss']
})
export class MobileTaskCommentsComponent implements OnInit {

  @Input()
  routerList: any;

  @Input()
  disabled: any = false;

  @Input()
  isComment: any = true;//特价备案完成用

  @Input()
  commentable: any = true;//是否可在手机端操作，e.g. 如需输入sofon等，则为false

  currentComment = [];
  reasonFromMasterdata = [];

  @Input()
  inputComment: string = '';

  @Input()
  simpleRouter: string = '';

  selectRouterValue = [];
  selectRouterText: string = '';

  loadingIndicator: boolean = false;

  constructor(
    private http: HttpService, 
    private myTaskService: MyTaskService,
    private router: Router,
    private _toast: ToastService) { }

  ngOnInit() {
    this.http.get('/act/masterdata/queryJson/rejectreason').subscribe(res => {
      if ('0000' == res.code) {
        let tmpData = JSON.parse(res.data);
        let tmpList = ['同意'];
        tmpData.forEach(item =>{
          if (item['Reject_Reason'] && '' !== item['Reject_Reason'] && '1' == item['status']) {
            tmpList.push(item['Reject_Reason']);
          }
        });
        this.reasonFromMasterdata = [...tmpList];
        
      } else {
        console.log('查询拒绝理由列表时出错', res.msg);
      }
    });

    if(this.simpleRouter !== '') {
      this.selectRouterText = this.simpleRouter;
    }
    console.log('isComment', this.isComment);
  }

  addComment(event){
    this.inputComment = event.toString();
  }

  changeSelectRouterValue(event) {
    console.log('selectRouterValue',this.selectRouterValue);
    if (this.routerList && this.routerList.length > 0 && this.selectRouterValue.length > 0 && event[0]) {
      this.selectRouterText = event[0]['label'];
    } else {
      this.selectRouterText = '';
    }
  }

  async mobilePassTask() {

    this.loadingIndicator = true;

    if (this.routerList && this.routerList.length > 0) {
      if (this.selectRouterValue.length < 1) {
        const toast = ToastService.fail('审批操作未选择！', 2000, null, true);
        this.loadingIndicator = false;
        return;
      }

      if (!this.inputComment || '' === this.inputComment.trim()) {
        const toast = ToastService.fail('审批意见未填写！', 2000, null, true);
        this.loadingIndicator = false;
        return;
      }
    }

    const tmpTaskData = this.myTaskService.taskData;
    // console.log('tmpData', tmpTaskData);
    if(tmpTaskData) {
      const draftDataParam = tmpTaskData['taskFormComponentList']['globalVariables']['draftData'];
      const formHandelListParam = tmpTaskData['taskFormComponentList']['taskForm']['formHandles'] || null;
      const taskInput_comment = this.inputComment;
      const taskInput_result = this.selectRouterValue[0]['value'];
      const taskId = tmpTaskData['activitiTask']['id'];

      const params = {
        formHandelList: formHandelListParam,
        taskInput_comment: taskInput_comment,
        taskInput_result: taskInput_result,
        draftData: draftDataParam
      }
      const uri = '/act/task/completeTask/' + taskId;
      // console.log('mobilePassTaskParams', params);
      // console.log('mobilePassTaskUri', uri);

      this.http.post(uri, params).subscribe(res => {
        if ('0000' == res.code) {
          const data = res.data == null ? [] : res.data;
          // this.draftFormId = data['id'];
          // this.toastrService.success('操作成功');
          const toast = ToastService.success(res.msg, 3000, () =>{
            this.router.navigateByUrl('/m/my-task-pending');
          }, true);
        } else {
          const toast = ToastService.fail(res.msg, 3000, null, true);
          this.loadingIndicator = false;
        }
      });

    }
  }
}
