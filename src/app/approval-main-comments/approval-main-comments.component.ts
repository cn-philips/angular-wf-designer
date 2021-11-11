import {Component, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {HttpService, RegexService, GlobalService} from '../services';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, map, switchMap, filter } from 'rxjs/operators';

@Component({
  selector: 'approval-main-comments',
  templateUrl: './approval-main-comments.component.html',
  styleUrls: ['./approval-main-comments.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ApprovalMainCommentsComponent implements OnInit {

  @Input()
  needComment: boolean;

  @Input()
  mustRemark: boolean = false;

  @Input()
  taskRouter: object;

  @Input()
  disabled: boolean;

  @Input()
  taskId: string;

  defaultBtnStr: string = '完成';

  inputComment: string = '';
  inputCc: string = '';
  selectRouterValue: string;
  selectRouterText: string = '';
  reasonFromMasterdata = [];

  selectedUser: any;
  searchChange$ = new BehaviorSubject('');
  userList: any[] = [];

  constructor(private http: HttpService, private regexService: RegexService, private globalService: GlobalService) {
  }

  ngOnInit() {
    console.log(this.disabled)

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
  }

  searchEmail(value: string): void {
    this.searchChange$.next(value);
  }

  addComment(event) {
    this.inputComment = event.target.innerText;
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

    //OA File时的按钮显示控制
    if ('sid-8525DCD2-D3ED-440C-B8E1-1F45CB51D0A0' === this.taskId) {
      const mainBtn = document.getElementById('pass-task-btn') as HTMLElement;
      if(mainBtn) {
        const btnStr = mainBtn.innerText || '完成';
        if('完成' != btnStr) {
          this.defaultBtnStr = btnStr;
        }
      }
      if('approve' !== this.selectRouterValue || !this.selectRouterValue) {
        this.globalService.mainBtnStrChange('完成');
      } else {
        this.globalService.mainBtnStrChange(this.defaultBtnStr);
      }
    }
  }
}
