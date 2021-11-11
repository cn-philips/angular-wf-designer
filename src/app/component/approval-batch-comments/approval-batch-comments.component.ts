import {Component, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {HttpService, RegexService, ApprovalService} from '../../services';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, map, switchMap, filter } from 'rxjs/operators';

@Component({
  selector: 'approval-batch-comments',
  templateUrl: './approval-batch-comments.component.html',
  styleUrls: ['./approval-batch-comments.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ApprovalBatchCommentsComponent implements OnInit {

  @Input()
  tasks: any[] = [];

  taskRouter: any;

  @Input()
  disabled: boolean;

  inputComment: string = '';
  inputCc: string = '';
  selectRouterValue: string;
  selectRouterText: string = '';
  reasonFromMasterdata = [];

  selectedUser: any;
  searchChange$ = new BehaviorSubject('');
  userList: any[] = [];

  constructor(private http: HttpService, private regexService: RegexService, private approvalService: ApprovalService) {
  }

  async ngOnInit() {
    this.approvalService.approvalParams = null;
    this.http.get('/act/masterdata/queryJson/rejectreason').subscribe(res => {
      if ('0000' == res.code) {
        this.reasonFromMasterdata = JSON.parse(res.data);
      } else {
        console.log('查询拒绝理由列表时出错', res.msg);
      }
    });

    const getUserList = (keyword: string) => this.http.get(`/act/queryUserByKeyword/${keyword}`).pipe(map((res: any) => res.data));

    const userList$: Observable<string[]> = this.searchChange$
      .asObservable()
      .pipe(debounceTime(500), filter(term => term && term.length > 1))
      .pipe(switchMap(getUserList));

    userList$.subscribe(data => {
      this.userList = data.map(item => {
            return {
              text: item['email'] + ' (' + item['name'] + ')',
              value: item
            };
          });
    });
    console.log('tasks', this.tasks);
    if(this.tasks && this.tasks.length > 0) {
      let taskRouterMap = await this.approvalService.getTaskRouter(this.tasks[0]); 
      console.log('taskRouterMap', taskRouterMap);
      if(taskRouterMap) {
        this.taskRouter = taskRouterMap;
      }
    }
  }

  searchEmail(value: string): void {
    this.searchChange$.next(value);
  }

  addComment(event) {
    this.inputComment = event.target.innerText;
    this.commentChange(this.inputComment);
  }

  addEmail(obj) {
    // console.log('addEmail', obj);
    if (obj && obj['value'] && obj['value']['email'] && '' != obj['value']['email']) {
      const event = obj['value'];
      this.inputCc = this.inputCc || '';
      this.inputCc = this.inputCc.trim().replace(/；/g, ';');
      this.inputCc = this.inputCc.trim().replace(/;/g, ';');
      if('' === this.inputCc.slice(-1) || ';' === this.inputCc.slice(-1)) {
        this.inputCc = this.inputCc + event['email'];
      } else {
        let cleanInputCc = this.inputCc.trim().replace(/ /g, '');
        let tempArr = cleanInputCc.split(';');
        if(tempArr.indexOf(event['email'])  < 0) {
          this.inputCc =  cleanInputCc + ';' + event['email'];
        }
      }

      let finalInputCc = '';
      for(const item of this.inputCc.split(';')){
        if(this.regexService.validateEmail(item)) {
          if('' == finalInputCc) {
            finalInputCc += item;
          } else {
            finalInputCc += ';' + item;
          }
        }
      }
      this.inputCc = finalInputCc;
    }
  }

  changeSelectRouterValue() {
    if (this.taskRouter && this.selectRouterValue) {
      this.selectRouterText = this.taskRouter[this.selectRouterValue] || '';
    } else {
      this.selectRouterText = '';
    }
    // console.log('==> changeSelectRouterValue:', this.selectRouterValue);
    this.updateBatchCompleteTaskParams('taskInput_result', this.selectRouterValue)
  }

  commentChange(event) {
    // console.log('==> commentChange:', this.inputComment);
    this.inputComment = event.trim();
    this.updateBatchCompleteTaskParams('taskInput_comment', this.inputComment || '');
  }

  updateBatchCompleteTaskParams(key: string, value: any) {
    let params = this.approvalService.approvalParams;

    if(!params) {
      params = {};
    }
    params[key] = value;

    let selectTaskId = [];
    this.tasks.forEach((item, idx) => {
      selectTaskId.push(item['id']);
    });
    params['selectTaskId'] = selectTaskId;
    // params['draftData'] = {};

    this.approvalService.approvalParams = params;
  }
}
