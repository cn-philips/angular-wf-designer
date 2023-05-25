import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { HttpService } from "@core/services";
import { NzModalService, NzMessageService } from "ng-zorro-antd";
import { BehaviorSubject, Observable } from "rxjs";
import { debounceTime, switchMap } from "rxjs/operators";

@Component({
  selector: "task-assign-dialog",
  templateUrl: "assign-dialog.component.html",
  styleUrls: ["./assign-dialog.component.scss"],
})
export class AssignDialogComponent implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() isOit = false;
  @Input() checkedRows = [];
  @Output() close = new EventEmitter<null>();
  @Output() success = new EventEmitter<null>();

  searchLoading = false;
  searchChange$ = new BehaviorSubject("");
  submitLoading = false;

  formValues = this.fb.group({
    role: [null], // 角色
    receiver: [null, [Validators.required]], // 接收人
    continue: [null], // 始终持续, 只适用于OIT
    transferReason: [null], // 转派原因, 只适用于特批
  });

  selectOptions = {
    role: [],
    receiver: [],
  };

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private modalService: NzModalService,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    this.initRoleList();

    if (!this.isOit) {
      this.formValues.get("transferReason").setValidators(Validators.required);
    }

    this.searchChange$
      .asObservable()
      .pipe(debounceTime(500))
      .pipe(
        switchMap((searchString: string) => {
          if (!searchString) {
            return Observable.create();
          }
          const { role } = this.formValues.getRawValue();
          const params: any = {
            email: searchString,
          };
          if (role) {
            params.role = role;
          }
          const url = `/act/ecos/oit/cdUser`;
          return this.http.post(url, {
            role: this.formValues.getRawValue().role,
            email: searchString,
          });
        })
      )
      .subscribe(({ data: { rows } }) => {
        this.selectOptions.receiver = [];
        const emailSet = new Set();
        rows.forEach(({ name, email }) => {
          if (!emailSet.has(email)) {
            emailSet.add(email);
            this.selectOptions.receiver.push({
              label: `${name}(${email})`,
              value: email,
            });
          }
        });
        this.searchLoading = false;
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.visible && !changes.visible.currentValue) {
      this.resetForm();
    }
  }

  // 获取所有角色
  initRoleList() {
    const url = `/act/role/getRole`;
    this.http
      .post(url, { pageNo: 1, pageSize: 100 })
      .subscribe(({ data: { rows } }) => {
        this.selectOptions.role = rows.map(({ roleName, roleCode }) => ({
          label: roleName,
          value: roleCode,
        }));
      });
  }

  handleSearchUser(searchString) {
    if (!searchString) {
      return;
    }
    this.searchLoading = true;
    this.searchChange$.next(searchString);
  }

  handleRoleChange() {
    this.selectOptions.receiver = [];
    this.formValues.patchValue({ receiver: null });
  }

  handleCloseModel() {
    this.close.emit();
  }

  handleSubmit() {
    for (const i in this.formValues.controls) {
      this.formValues.controls[i].markAsDirty();
      this.formValues.controls[i].updateValueAndValidity();
    }

    if (this.formValues.invalid) {
      this.message.error("请按要求填写表单信息");
      return;
    }

    if (this.isOit && this.formValues.get("continue").value) {
      this.modalService.create({
        nzTitle: "请确认",
        nzContent: "是否确定持续将任务转派给接收人?",
        nzOkText: "确定",
        nzCancelText: "取消",
        nzOnOk: () => this.submitForm(),
      });
    } else {
      this.submitForm();
    }
  }

  submitForm() {
    this.submitLoading = true;
    const formValues = this.formValues.getRawValue();

    const data = this.checkedRows.map(
      ({ id, applyId, taskInstId, procInstId,processInstanceTaskId }) => ({
        mainId: id,
        role: formValues.role,
        receiver: formValues.receiver,
        flag: formValues.continue ? 1 : 0,
        transferReason: formValues.transferReason,
        applyId,
        taskInstId,
        procInstId,
        procTaskId:processInstanceTaskId
      })
    );

    const url = this.isOit
      ? "/act/ecom/homepage/transferOrderRecord"
      : "/act/spTransferOrderRecord/transferOrderRecord";
    this.http.post(url, data).subscribe(() => {
      this.submitLoading = false;
      this.success.emit();
    });
  }

  resetForm() {
    this.formValues.reset();
    this.selectOptions.receiver = [];
  }
}
