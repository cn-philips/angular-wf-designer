import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import {
  UploadXHRArgs,
  UploadFile,
  NzModalService,
  NzMessageService,
} from "ng-zorro-antd";
import { Observable, Observer, BehaviorSubject } from "rxjs";
import { debounceTime, map, switchMap } from "rxjs/operators";

import { HttpService } from "@core/services/http.service";

import { SpecialApprovalService } from "../../../special-approval.service";
import { getType } from "assets/js/tools";
import {
  LOADING_MESSAGE,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "../../../special-approval.constants";
import { RouterExtendService } from "@app/modern-themes/services/router-extend.service";

interface CommonResponse {
  code: string;
  data: any;
  msg: string;
}

interface User {
  id: number;
  code: string;
  email: string;
  name: string;
  displayName: string;
}

const TEAMS_LINK_PREFIX = `https://teams.microsoft.com/l/chat/0/0?users=`;

@Component({
  selector: "special-approval-approve-form",
  templateUrl: "./approve-form.component.html",
  styleUrls: ["./approve-form.component.scss"],
})
export class ApproveFormComponent implements OnInit, OnChanges {
  @Input() requestId;
  @Input() taskId;
  @Input() processUsers;
  @Input() applicantEmail;
  @Input() basicInfo: FormGroup;

  formValues: FormGroup = this.fb.group({
    remark: [""], // 备注
    attachments: [[]], // 支持文件
    notify: [0], // 是否通知用户
    notifier: [null], // 通知用户邮箱列表, 字符串, 逗号隔开
    chatUsers: [[]],
  });

  supportFileList: UploadFile[] = [];

  fetchUserUrl = "/act/role/getUsersByEmail";
  searchChange$ = new BehaviorSubject("");
  isSearchLoading = false;
  userList: User[] = [];
  submitLoading = false;
  showWarnMsg = false;

  constructor(
    private spService: SpecialApprovalService,
    private modal: NzModalService,
    private http: HttpService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router,
    private routerExtendService:RouterExtendService
  ) {}

  get applyCode() {
    return this.basicInfo.get("applyCode");
  }

  ngOnInit(): void {
    const getUserList = (keyword: string) => {
      if (!keyword) {
        this.isSearchLoading = false;
        return [];
      }
      return this.http
        .get(`${this.fetchUserUrl}`, {
          params: { email: keyword },
        })
        .pipe(map((res: any) => res.data as User[]))
        .pipe(
          map((users) =>
            users.map((user) => ({
              ...user,
              displayName: `${user.name}(${user.email})`,
            }))
          )
        );
    };

    const optionList$: Observable<User[]> = this.searchChange$
      .asObservable()
      .pipe(debounceTime(500))
      .pipe(switchMap(getUserList));
    optionList$.subscribe((data) => {
      this.userList = data;
      this.isSearchLoading = false;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.processUsers) {
      this.formValues.patchValue({
        chatUsers: this.processUsers,
      });
    }
  }

  // 上传之前的校验(文件类型, 文件大小), 校验不通过, return false, 会阻止自动上传
  onBeforeUpload = (file) => {
    console.log("before upload", file);
    return true;
  };

  onUploadFile = (item: UploadXHRArgs) => {
    const formData = new FormData();
    const file = item.file as any;
    formData.append("file", file);
    formData.append("fileType", getType(file));
    formData.append("filename", file.name);

    return this.spService.uploadFile(formData).subscribe(
      (response: CommonResponse) => {
        const { data, code } = response;
        if ("0000" === code) {
          const curFileIds = this.formValues.get("attachments")
            .value as String[];
          this.formValues.patchValue({ attachments: curFileIds.concat(data) });
          item.onSuccess({ fileId: data }, file, response);
        } else {
          item.onError({}, file);
        }
      },
      (err) => {
        item.onError!(err, item.file!);
      }
    );
  };

  onRemoveFile = (file: UploadFile) => {
    const { response, name } = file;
    return new Observable((observer: Observer<boolean>) => {
      this.modal.confirm({
        nzTitle: `确定移除文件${name}?`,
        nzOnOk: () => {
          const curFileIds = this.formValues.get("attachments")
            .value as String[];
          this.formValues.patchValue({
            attachments: curFileIds.filter(
              (fileId) => fileId !== response.fileId
            ),
          });
          observer.next(true);
        },
        nzOnCancel: () => {
          observer.next(false);
        },
      });
    });
  };

  onSearchUser(keyword: string) {
    this.isSearchLoading = true;
    this.searchChange$.next(keyword);
  }

  async onSubmit(action) {
    try {
      const { remark, attachments, notify, notifier } =
        this.formValues.getRawValue();
      if (action === "REJECTED" && (!remark || !remark.trim())) {
        this.message.error("请填写备注");
        this.showWarnMsg = true;
        return;
      }
      if (notify == 1 && !notifier) {
        this.message.error("请选择指定用户");
        return;
      }
      const id = this.message.loading(LOADING_MESSAGE.APPROVE, {
        nzDuration: 0,
      }).messageId;
      this.submitLoading = true;
      const data = {
        applyId: this.requestId,
        attachments: attachments,
        result: action,
        notify,
        notifier: notify ? notifier.join(",") : "",
        remark,
        taskInstId: this.taskId,
      };
      await this.spService.approveRequest(data);
      this.message.remove(id);
      this.message.success(SUCCESS_MESSAGE.APPROVE);
      // this.router.navigate(["/ecos/my-done"]);
      this.routerExtendService.back();
    } catch ({ message }) {
      this.message.error(ERROR_MESSAGE.APPROVE);
      console.error(`审批失败, ${message}`);
    } finally {
      this.submitLoading = false;
    }
  }

  onStartChat() {
    const teamsLink = TEAMS_LINK_PREFIX + this.applicantEmail;
    window.open(teamsLink, "_blank");
  }

  onStartGroupChat() {
    const chatUsers = this.formValues.controls.chatUsers.value;
    if (chatUsers.length > 0) {
      let teamsLink = TEAMS_LINK_PREFIX + chatUsers.join(",");
      if (this.applyCode && this.applyCode.value) {
        teamsLink += `&topicName=${encodeURIComponent(this.applyCode.value)}`;
      }
      window.open(teamsLink, "_blank");
    } else {
      this.message.warning("请先选择发起群聊的用户");
    }
  }
}
