import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NzMessageService } from "ng-zorro-antd";
import { BehaviorSubject, Observable } from "rxjs";
import { debounceTime, map, switchMap } from "rxjs/operators";

import { HttpService } from "../../../../services/http.service";

import { SpecialApprovalService } from "../../../special-approval.service";
import {
  APPROVE_NODE_ACTION,
  APPROVE_NODE_MODE,
} from "../../../../DIIGT/change-scene/special-approval-setting/special-approval-setting.constants";
import { ERROR_MESSAGE, LOADING_MESSAGE, SUCCESS_MESSAGE } from "../../../special-approval.constants";

interface Approver {
  role: string;
  user: string;
}

interface ApproveNode {
  code: string;
  name: string;
  action: APPROVE_NODE_ACTION;
  mode: APPROVE_NODE_MODE;
  custom: boolean;
  customApproveList: string[];
  approverList: Approver[];
}

interface RequestInfo {
  applicant?: string;
  activeNodeInfoList: ApproveNode[];
}

interface User {
  id: number;
  code: string;
  email: string;
  name: string;
  displayName: string;
}

@Component({
  selector: "special-approval-select-approver",
  templateUrl: "select-approver.component.html",
  styleUrls: ["./select-approver.component.scss"],
})
export class SelectApproverComponent implements OnInit {
  @Output() success = new EventEmitter()

  visible = false;
  modalLoading = false;
  submitLoading = false;

  fetchUserUrl = "/act/role/getUsersByEmail";
  searchChange$ = new BehaviorSubject("");

  customUser = {}

  activeNodeCode = null

  APPROVE_NODE_MODE = APPROVE_NODE_MODE;

  requestInfo: RequestInfo = {
    activeNodeInfoList: [],
  };

  constructor(
    private message: NzMessageService,
    private spService: SpecialApprovalService,
    private http: HttpService
  ) {}

  ngOnInit() {
    const getUserList = (keyword: string) => {
      if (!keyword) {
        if (this.activeNodeCode) { 
          this.customUser[this.activeNodeCode].loading = false
          this.customUser[this.activeNodeCode].userList = []
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
      this.customUser[this.activeNodeCode] = {
        loading: false,
        userList: data,
      }
    });
  }

  async showModal(request) {
    try {
      this.visible = true;
      this.modalLoading = true;
      const data = await this.spService.submitCheckRequest(request);
      this.requestInfo = data;
      data.activeNodeInfoList.forEach(({ code, custom }) => {
        if (custom) {
          this.customUser[code] = {
            loading: false,
            userList: []
          }
        }
      })
    } catch ({ message }) {
      this.message.error(`获取审批人失败, 请稍候重试`);
      this.onHideModal();
      console.log(`获取预审节点列表失败, ${message}`);
    } finally {
      this.modalLoading = false;
    }
  }

  onHideModal() {
    this.visible = false;
  }

  async onSubmit() {
    // 校验
    let { activeNodeInfoList } = this.requestInfo;
    for (let node of activeNodeInfoList) {
      const { custom, customApproveList } = node;
      if (custom && (!customApproveList || customApproveList.length === 0)) {
        this.message.error("请补充操作人信息");
        return;
      }
    }
    activeNodeInfoList = activeNodeInfoList.map((node) =>
      node.custom
        ? {
            ...node,
            customApproveList: Array.isArray(node.customApproveList)
              ? node.customApproveList
              : [node.customApproveList],
          }
        : node
    );
    const id = this.message.loading(LOADING_MESSAGE.SUBMIT, { nzDuration: 0 }).messageId
    try {
      this.submitLoading = true
      const data = {
        ...this.requestInfo,
        activeNodeInfoList,
      }
      await this.spService.submitRequest(data)
      this.message.success(SUCCESS_MESSAGE.SUBMIT)
      this.success.emit()
    } catch ({ message }) {
      this.message.error(ERROR_MESSAGE.SUBMIT)
      console.error(`提交失败, ${message}`)
    } finally {
      this.submitLoading = false
      this.message.remove(id)
    }
  }

  formatApprover(approverList: Approver[], initiator) {
    const approvers = approverList.map(({ user, role }) => {
      if (initiator) {
        return `申请人-${user}`;
      } else {
        if (role) {
          if (user) {
            return `系统角色-${role}(${user})`;
          } else {
            return `系统角色-${role}`;
          }
        } else {
          return `指定用户-${user}`;
        }
      }
    });
    return approvers;
  }

  onSearchUser(keyword: string, nodeCode) {
    this.activeNodeCode = nodeCode
    this.customUser[nodeCode].loading = true
    this.searchChange$.next(keyword);
  }
}
