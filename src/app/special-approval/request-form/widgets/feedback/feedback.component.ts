import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms'
import { Router } from '@angular/router'
import { UploadXHRArgs, UploadFile, NzModalService, NzMessageService } from 'ng-zorro-antd'
import { Observable, Observer, BehaviorSubject } from 'rxjs'
import { debounceTime, map, switchMap } from 'rxjs/operators';

import { HttpService } from '../../../../services/http.service'


import { SpecialApprovalService } from '../../../special-approval.service'
import { getType } from '../../../../../assets/js/tools'
import { LOADING_MESSAGE, SUCCESS_MESSAGE, ERROR_MESSAGE } from '../../../special-approval.constants'

interface CommonResponse {
  code: string;
  data: any;
  msg: string
}

interface User {
  id: number;
  code: string;
  email: string;
  name: string;
  displayName: string;
}

@Component({
  selector: 'special-approval-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {

  @Input() requestId
  @Input() taskId

  formValues: FormGroup = this.fb.group({
    remark: [null], // 备注
    attachments: [[]], // 支持文件
    notify: [0], // 是否通知用户
    notifier: [null], // 通知用户邮箱列表, 字符串, 逗号隔开
  })

  supportFileList: UploadFile[] = []
  
  fetchUserUrl = '/act/role/getUsersByEmail'
  searchChange$ = new BehaviorSubject('');
  isSearchLoading = false
  userList: User[] = []
  submitLoading = false

  constructor(
    private spService: SpecialApprovalService,
    private modal: NzModalService,
    private http: HttpService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    const getUserList = (keyword: string) => {
      if (!keyword) { 
        this.isSearchLoading = false;
        return []
      }
      return this.http.get(`${this.fetchUserUrl}`, { 
        params: { email: keyword }
      })
        .pipe(map((res: any) => res.data as User[]))
        .pipe(
          map((users) => users.map((user) => ({ ...user, displayName: `${user.name}(${user.email})` })))
        );
    }
      
    const optionList$: Observable<User[]> = this.searchChange$
      .asObservable()
      .pipe(debounceTime(500))
      .pipe(switchMap(getUserList));
    optionList$.subscribe(data => {
      this.userList = data;
      this.isSearchLoading = false;
    });
  }

  // 上传之前的校验(文件类型, 文件大小), 校验不通过, return false, 会阻止自动上传
  onBeforeUpload = (file) => {
    console.log('before upload', file);
    return true
  }

  onUploadFile = (item: UploadXHRArgs) => {
    const formData = new FormData()
    const file = item.file as any
    formData.append('file', file)
    formData.append('fileType', getType(file))
    formData.append('filename', file.name)

    return this.spService.uploadFile(formData).subscribe(
      (response: CommonResponse) => {
        const { data, code } = response
        if ('0000' === code) {
          const curFileIds = this.formValues.get('attachments').value as String[]
          this.formValues.patchValue({ attachments: curFileIds.concat(data) })
          item.onSuccess({ fileId: data }, file, response)
        } else {
          item.onError({}, file)
        }
      },
      err => {
        item.onError!(err, item.file!)
      }
    )
  }

  onRemoveFile = (file: UploadFile) => {
    const { response, name } = file
    return new Observable((observer: Observer<boolean>) => {
      this.modal.confirm({
        nzTitle: `确定移除文件${name}?`,
        nzOnOk: () => {
          const curFileIds = this.formValues.get('attachments').value as String[]
          this.formValues.patchValue({ attachments: curFileIds.filter((fileId) => fileId !== response.fileId) })
          observer.next(true)
        },
        nzOnCancel: () => {
          observer.next(false)
        }
      })
    })
  }

  onSearchUser(keyword: string) {
    this.isSearchLoading = true
    this.searchChange$.next(keyword)
  }

  async onSubmit(action) {
    try {
      const { remark, attachments, notify, notifier } = this.formValues.getRawValue()
      if (notify == 1 && !notifier) {
        this.message.error('请选择指定用户')
        return
      }
      const data = {
        applyId: this.requestId,
        attachments: attachments,
        executed: action,
        notify,
        notifier: notify ? notifier.join(','): '',
        remark,
        taskInstId: this.taskId,
        result: 'APPROVED',
      }

      const id = this.message.loading(LOADING_MESSAGE.FEEDBACK, { nzDuration: 0 }).messageId
      this.submitLoading = true
      await this.spService.approveRequest(data)
      this.message.remove(id)
      this.message.success(SUCCESS_MESSAGE.FEEDBACK)
      this.router.navigate(['/special-approval/home'])
    } catch ({ message }) {
      this.message.error(ERROR_MESSAGE.FEEDBACK)
      console.error(`反馈失败, ${message}`);
    } finally {
      this.submitLoading = false
    }
    
  }
}
