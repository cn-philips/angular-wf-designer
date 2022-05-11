import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd";
import { BehaviorSubject, Observable } from "rxjs";
import { debounceTime, map, switchMap } from "rxjs/operators";

import { HttpService } from "../../../../../services/http.service";
import { SpecialApprovalSettingService } from "../../special-approval-setting.service";
import { ApproveNode, CcPerson } from "../../special-approval-setting.d";
import {
  APPROVE_NODE_ACTION_LIST,
  APPROVE_NODE_MODE_LIST,
  APPROVE_NODE_MODE,
  CC_PERSON_TYPE,
  CC_PERSON_TYPES,
  APPROVE_USER_TYPE,
  CC_TRIGGER_TYPE,
  APPROVE_USER_TYPES,
  APPROVE_NODE_ACTION,
  CC_TRIGGER_TYPE_MAP,
} from "../../special-approval-setting.constants";

interface User {
  id?: number;
  code?: string;
  email: string;
  name?: string;
  displayName?: string;
}

export enum FORM_MODE {
  NEW = "new",
  EDIT = "edit",
}

const FORM_MODE_MAP = {
  [FORM_MODE.NEW]: "新建",
  [FORM_MODE.EDIT]: "编辑",
};

interface CC_USER {
  loading: boolean;
  userList: User[]
}
@Component({
  selector: "sp-setting-approve-node-form",
  templateUrl: "./approve-node-form.component.html",
  styleUrls: ["./approve-node-form.component.scss"],
})
export class ApproveNodeFormComponent implements OnInit {
  @Output() success = new EventEmitter<ApproveNode>();

  visible = false;

  fetchUserUrl = "/act/role/getUsersByEmail";
  searchChange$ = new BehaviorSubject("");
  isSearchLoading = false;
  userList: User[] = [];

  ccUserMap: { [key: number]: CC_USER } = {}
  isSearchCcPerson = false
  activeCcId = null

  modalTitle: string;
  formMode: FORM_MODE;

  formValues = this.fb.group({
    id: [null],
    status: [null], // 状态
    name: [null, [Validators.required]], // 节点显示名称
    action: [null, [Validators.required]], // 动作
    mode: [null, [Validators.required]], // 模式
    approveUserType: [null, [Validators.required]],
    approver: [null],
    approveRole: [null],
    cc: [null, [Validators.required]],
  });

  APPROVE_USER_TYPE = APPROVE_USER_TYPE;
  APPROVE_NODE_MODE = APPROVE_NODE_MODE;
  CC_TRIGGER_TYPE = CC_TRIGGER_TYPE;
  CC_TRIGGER_TYPE_MAP = CC_TRIGGER_TYPE_MAP;
  APPROVE_NODE_ACTION = APPROVE_NODE_ACTION;

  CC_PERSON_TYPE = CC_PERSON_TYPE;

  ccPersonList: CcPerson[] = [];

  selectOptions = {
    modeList: APPROVE_NODE_MODE_LIST,
    actionList: APPROVE_NODE_ACTION_LIST,
    roleList: [],
    ccPersonTypes: CC_PERSON_TYPES,
    approveUserTypes: APPROVE_USER_TYPES,
  };

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private spSettingService: SpecialApprovalSettingService,
    private http: HttpService
  ) {}

  get isApplyNode(): boolean {
    const action =  this.formValues.get('action') as FormControl
    return action ? action.value === APPROVE_NODE_ACTION.APPLY : false
  }

  async ngOnInit() {
    this.spSettingService
      .getAllSystemRoleList()
      .then(
        (roleList) =>
          (this.selectOptions.roleList = roleList.map(
            ({ roleCode }) => roleCode
          ))
      );

    const getUserList = (keyword: string) => {
      if (!keyword) {
        if (this.activeCcId) {
          this.ccUserMap[this.activeCcId].loading = false
        } else {
          this.isSearchLoading = false;
        }
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
      if (this.activeCcId) {
        this.ccUserMap[this.activeCcId].loading = false
        this.ccUserMap[this.activeCcId].userList = data
      } else {
        this.userList = data;
        this.isSearchLoading = false;
      }
    });
  }

  setFormValidators() {
    const approveUserType = this.formValues.get("approveUserType").value;
    this.formValues.controls.approveRole.clearValidators();
    this.formValues.controls.approver.clearValidators();
    switch (approveUserType) {
      case APPROVE_USER_TYPE.SYSTEM_ROLE:
        this.formValues.controls.approveRole.setValidators([
          Validators.required,
        ]);
        break;
      case APPROVE_USER_TYPE.ASSIGN_USER:
        this.formValues.controls.approver.setValidators([Validators.required]);
        break;
    }
  }

  showModal(formMode: FORM_MODE, data: ApproveNode = null) {
    this.formMode = formMode;
    this.modalTitle = FORM_MODE_MAP[formMode] + "审批节点";
    if (formMode === FORM_MODE.EDIT) {
      const {
        id,
        status,
        name,
        action,
        mode,
        approver,
        approveRole,
        approverCustom,
        cc,
        ccPersonList = [],
      } = data;
      this.formValues.patchValue({
        id,
        status,
        name,
        action,
        mode: (mode === null && action === APPROVE_NODE_ACTION.APPLY) ? APPROVE_NODE_MODE.NONE : mode,
        cc,
      });

      ccPersonList.forEach(({ id, personType, person }) => {
        if (personType === CC_PERSON_TYPE.ASSIGN_USER) {
          this.ccUserMap[id] = {
            loading: false,
            userList: [{ email: person }]
          }
        }
      })
      this.ccPersonList = ccPersonList;

      if (approver) {
        this.formValues.patchValue({
          approveUserType: APPROVE_USER_TYPE.ASSIGN_USER,
        });
      } else if (approveRole) {
        this.formValues.patchValue({
          approveUserType: APPROVE_USER_TYPE.SYSTEM_ROLE,
        });
      } else if (approverCustom === 1) {
        this.formValues.patchValue({
          approveUserType: APPROVE_USER_TYPE.USER_SELECT,
        });
      }

      if (mode === APPROVE_NODE_MODE.PARALLEL) {
        const approvers = approver ? approver.split(",") : []
        this.userList = approvers.map((email) => ({ email }))
        this.formValues.patchValue({
          approver: approvers,
          approveRole: approveRole ? approveRole.split(",") : approveRole,
        });
      } else {
        this.userList = [{ email: approver }]
        this.formValues.patchValue({
          approver,
          approveRole,
        });
      }
    }
    if (this.isApplyNode) {
      this.selectOptions.approveUserTypes = APPROVE_USER_TYPES.filter(({ value }) => value !== APPROVE_USER_TYPE.USER_SELECT)
    } else {
      this.selectOptions.approveUserTypes = APPROVE_USER_TYPES
    }
    this.visible = true;
  }

  onHideModal() {
    // 隐藏模态框
    this.visible = false;
  }

  // 表单是否有效
  isValid() {
    this.setFormValidators();
    for (const i in this.formValues.controls) {
      this.formValues.controls[i].markAsDirty();
      this.formValues.controls[i].updateValueAndValidity();
    }
    if (this.formValues.invalid) {
      this.message.error("请按要求填写表单信息");
      return false;
    }
    const { cc } = this.formValues.getRawValue();
    if (cc === 1 && this.ccPersonList.length === 0) {
      this.message.error("请选择抄送人");
      return false;
    }

    for(let i = 0; i < this.ccPersonList.length; i++) {
      const { personType, person, triggerType } = this.ccPersonList[i]
      let hasError = false
      if (!personType) {
        hasError = true
      } else if (personType === CC_PERSON_TYPE.SP_APPLICANT) {
        hasError = !triggerType
      } else {
        hasError = !(person && triggerType)
      }
      if (hasError) {
        this.message.error("请补充抄送人信息");
        return false
      }
    }

    return true;
  }

  // 保存
  onSubmit() {
    if (this.isValid()) {
      const {
        id,
        status,
        name,
        action,
        mode,
        approveUserType,
        approver,
        approveRole,
        cc,
      } = this.formValues.getRawValue();
      const approveNode = {
        id,
        status,
        name: name.trim(),
        action,
        mode: mode === APPROVE_NODE_MODE.NONE ? null : mode,
        cc,
        approver,
        approveRole,
        approverCustom: 0,
        ccPersonList: this.ccPersonList,
      };
      if (approveUserType === APPROVE_USER_TYPE.USER_SELECT) {
        approveNode.approver = null;
        approveNode.approveRole = null;
        approveNode.approverCustom = 1;
      } else if (approveUserType === APPROVE_USER_TYPE.SYSTEM_ROLE) {
        approveNode.approver = null;
        if (Array.isArray(approveRole)) {
          approveNode.approveRole = approveRole.join(",");
        }
      } else {
        approveNode.approveRole = null;
        if (Array.isArray(approver)) {
          approveNode.approver = approver.join(",");
        }
      }
      this.onHideModal();
      this.success.emit(approveNode);
    }
  }

  // 模糊查询用户
  onSearchUser(keyword: string, isSearchCcPerson = false, ccId = null) {
    this.isSearchCcPerson = isSearchCcPerson
    this.activeCcId = ccId
    if (ccId) {
      this.ccUserMap[ccId] = { loading: true, userList: [] }
    } else {
      this.isSearchLoading = true;
    }
    this.searchChange$.next(keyword);
  }

  onAddCcPerson() {
    this.ccPersonList = this.ccPersonList.concat([{ id: Date.now() } as CcPerson]);
  }

  onDeleteCcPerson({ id }) {
    this.ccPersonList = this.ccPersonList.filter((person) => person.id !== id);
  }
}
