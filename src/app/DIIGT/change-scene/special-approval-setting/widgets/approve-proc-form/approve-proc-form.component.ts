import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd";

import { SpecialApprovalSettingService } from "../../special-approval-setting.service";
import { ApproveNode, ApproveProc } from "../../special-approval-setting.d";
import {
  APPROVE_NODE_ACTION_MAP,
  APPROVE_NODE_MODE_MAP,
  APPROVE_NODE_MODE,
  APPROVE_NODE_ACTION,
} from "../../special-approval-setting.constants";
import {
  ApproveNodeFormComponent,
  FORM_MODE as NODE_FORM_MODE,
} from "../approve-node-form/approve-node-form.component";

export enum FORM_MODE {
  NEW = "new",
  EDIT = "edit",
}

const FORM_MODE_MAP = {
  [FORM_MODE.NEW]: "新建",
  [FORM_MODE.EDIT]: "编辑",
};

const APPROVE_NODE_NUMBER = 10;

@Component({
  selector: "sp-setting-approve-proc-form",
  templateUrl: "./approve-proc-form.component.html",
  styleUrls: ["./approve-proc-form.component.scss"],
})
export class ApproveProcFormComponent implements OnInit {
  @Output() success = new EventEmitter();
  @ViewChild("approveNodeForm") approveNodeForm: ApproveNodeFormComponent;

  modalTitle: string;
  visible = false;
  previewLoading = false;
  submitLoading = false;
  formMode: FORM_MODE;

  APPROVE_NODE_ACTION = APPROVE_NODE_ACTION;
  APPROVE_NODE_ACTION_MAP = APPROVE_NODE_ACTION_MAP;
  APPROVE_NODE_MODE_MAP = APPROVE_NODE_MODE_MAP;

  approveProcId: string;

  approveProcIns = {}

  nodeList = {
    list: [] as ApproveNode[],
    loading: false,
  };

  formValues: FormGroup = this.fb.group({
    status: [true], // 状态
    code: [null], // 审批编号
    name: [null, [Validators.required]], // 审批流名称
    remark: [null], // 说明
  });

  constructor(
    private fb: FormBuilder,
    private spSettingService: SpecialApprovalSettingService,
    private message: NzMessageService
  ) {}

  async ngOnInit() {}

  async showModal(mode: FORM_MODE, data: ApproveProc = null) {
    this.modalTitle = FORM_MODE_MAP[mode];
    this.formMode = mode;
    if (mode === FORM_MODE.EDIT) {
      this.nodeList.loading = true;
      const { id, status, code, name, remark } = data;
      this.formValues.patchValue({
        status,
        code,
        name,
        remark,
      });
      this.spSettingService.getApproveProcDetail(id).then((approveProc) => {
        this.approveProcIns = approveProc
        const { nodeList } = approveProc
        this.nodeList.loading = false;
        this.nodeList.list = nodeList.map((node) => ({
          ...node,
          mode: node.action === APPROVE_NODE_ACTION.APPLY ? APPROVE_NODE_MODE.NONE : node.mode,
        }));
      });
      this.approveProcId = id;
    } else {
      this.initNodeList();
    }
    this.visible = true;
  }

  initNodeList() {
    const nodeList: ApproveNode[] = [];
    for (let i = 0; i < APPROVE_NODE_NUMBER; i++) {
      const node = {
        id: `${i}`,
        status: i === 0 ? true : false,
        action: i === 0 ? APPROVE_NODE_ACTION.APPLY : null,
        mode: i === 0 ? APPROVE_NODE_MODE.NONE : null,
        name: i === 0 ? "申请人提交申请" : `step${i}`,
        approver: null,
        approveRole: null,
        cc: 0,
        ccPersonList: [],
        approverCustom: 0,
        approverInitiator: 0,
      };
      nodeList.push(node);
    }
    this.nodeList.list = nodeList;
  }

  async onSubmit() {
    for (const i in this.formValues.controls) {
      this.formValues.controls[i].markAsDirty();
      this.formValues.controls[i].updateValueAndValidity();
    }
    if (this.formValues.invalid) {
      this.message.error("请按要求填写表单信息");
      return;
    }
    const { messageId } = this.message.loading("提交中...", { nzDuration: 0 });
    try {
      this.submitLoading = true;
      const data = {
        ...this.approveProcIns,
        ...this.formValues.getRawValue(),
      };
      data.status = data.status ? 1 : 0;
      data.nodeList = this.nodeList.list.map((node) => ({
        ...node,
        status: node.status ? 1 : 0,
        cc: (node.ccPersonList && node.ccPersonList.length) > 0 ? 1 : 0,
        ccPersonList: node.ccPersonList || []
      }));
      if (this.formMode === FORM_MODE.EDIT) {
        await this.spSettingService.updateApproveProc(data);
      } else {
        data.processKey = 'SpecialApprove'
        await this.spSettingService.addApproveProc(data);
      }
      this.message.success(`${FORM_MODE_MAP[this.formMode]}成功`);
      this.success.emit();
      this.onHideModal();
    } catch ({ message }) {
      this.message.error(`${FORM_MODE_MAP[this.formMode]}失败, 请稍候重试`);
      console.log(`${FORM_MODE_MAP[this.formMode]}失败, ${message}`);
    } finally {
      this.submitLoading = false;
      this.message.remove(messageId);
    }
  }

  onHideModal() {
    this.visible = false;
    this.approveProcId = null;
    // 重置表单
    this.formValues.patchValue({
      status: true,
      code: null,
      name: null,
      remark: null,
    })
    this.formValues.markAsUntouched()
  }

  onShowNodeEditForm(node) {
    this.approveNodeForm.showModal(NODE_FORM_MODE.EDIT, node);
  }

  onSubmitNodeForm(approveNode: ApproveNode) {
    const { id } = approveNode;
    this.nodeList.list = this.nodeList.list.map((node) =>
      node.id === id ? { ...node, ...approveNode } : node
    );
  }

  formatNodeMode(approveNode: ApproveNode) {
    const { action, mode } = approveNode
    if (action === APPROVE_NODE_ACTION.APPLY) { return '无' }
    return APPROVE_NODE_MODE_MAP[mode] || '未设置'
  }

  formatNodeApprover(approveNode: ApproveNode) {
    const { approver, approveRole, approverCustom, approverInitiator } = approveNode
    if (approverCustom) { return '用户选择' }
    if (approverInitiator) { return '申请人' }
    if (approver) {
      const approvers = approver.split(',').map((approver) => `指定用户-${approver}`)
      return approvers.join(',')
    } else if (approveRole) {
      const approveRoles = approveRole.split(',').map((role) => `系统角色-${role}`)
      return approveRoles.join(',')
    } else {
      return '未设置'
    }
  }
}
