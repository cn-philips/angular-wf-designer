import { Component, Input, OnInit } from "@angular/core";
import { FORM_ACTION_TYPE } from "../role-management-form/role-management-form.component";
export interface roleUsersData {
  id: any;
  dataSource: string;
  modality: string;
  bmc: string;
  team: string;
  email: string;
  role: string;
  name: string;
  lineManager: string;
  userNumber: string;
  cluster: string;
}
@Component({
  selector: "app-role-management-form-user-table",
  templateUrl: "./role-management-form-user-table.component.html",
  styleUrls: ["./role-management-form-user-table.component.scss"],
})
export class RoleManagementFormUserTableComponent implements OnInit {
  constructor() {}
  @Input() userTable: roleUsersData[] = [];
  // Role表单的类型
  @Input() type: FORM_ACTION_TYPE = FORM_ACTION_TYPE.CREATE;
  // User表单类型
  userFormType: FORM_ACTION_TYPE = FORM_ACTION_TYPE.CREATE;
  ifShowDialog: boolean = false;
  userId: any = null;
  userInform = {
    id: null,
    dataSource: null,
    modality: null,
    bmc: null,
    team: null,
    email: null,
    role: null,
    name: null,
    lineManager: null,
    userNumber: null,
    cluster: null,
  };
  title: string = "人员管理-详情";
  tableHeader: any[] = [
    {
      name: "数据来源",
    },
    {
      name: "Modality",
    },
    {
      name: "BMC",
    },
    {
      name: "Team",
    },
    {
      name: "Email",
    },
  ];
  fetchUserDetailInformation(id) {
    // Replace API Here
    let user = this.userTable.find((i) => i.id === id);
    this.userInform = {
      id: user.id,
      dataSource: user.dataSource,
      modality: user.modality,
      bmc: user.bmc,
      team: user.team,
      email: user.email,
      role: user.role,
      name: user.name,
      lineManager: user.lineManager,
      userNumber: user.userNumber,
      cluster: user.cluster,
    };
    //End Replace API Here
  }
  // 重置user
  resetUserDetailInformation() {
    this.userInform = {
      id: null,
      dataSource: null,
      modality: null,
      bmc: null,
      team: null,
      email: null,
      role: null,
      name: null,
      lineManager: null,
      userNumber: null,
      cluster: null,
    };
  }
  handleCreate() {
    this.setUserFormType(FORM_ACTION_TYPE.CREATE);
    this.setTitle();
    this.resetUserDetailInformation();
    this.showDialog();
  }
  handleEdit(id) {
    this.setUserFormType(FORM_ACTION_TYPE.EDIT);
    this.setTitle();
    this.fetchUserDetailInformation(id);
    this.showDialog();
  }
  handleDialogOK() {
    if (this.userFormType === FORM_ACTION_TYPE.CREATE) {
      // API Here
    } else if (this.userFormType === FORM_ACTION_TYPE.EDIT) {
      // API Here
    }
    this.hideDialog();
  }
  handleDialogCancel() {
    this.hideDialog();
  }
  showDialog() {
    this.ifShowDialog = true;
  }
  hideDialog() {
    this.ifShowDialog = false;
  }

  handleDelete(id) {
    console.log(id);
  }
  /**
   * 根据Role表单类型[type](“新增”，“编辑”)与User表单类型[actionType](“新增”，“编辑”)确定User表单后续操作类型
   *
   * @memberof RoleManagementFormComponent
   */
  async setUserFormType(actionType: FORM_ACTION_TYPE) {
    if (this.type === FORM_ACTION_TYPE.CREATE) {
      this.userFormType = FORM_ACTION_TYPE.CREATE;
    } else if (this.type === FORM_ACTION_TYPE.EDIT) {
      if (actionType === FORM_ACTION_TYPE.CREATE) {
        this.userFormType = FORM_ACTION_TYPE.CREATE;
      } else {
        this.userFormType = FORM_ACTION_TYPE.EDIT;
      }
    }
  }
  setTitle() {
    let action = "";
    switch (this.userFormType) {
      case FORM_ACTION_TYPE.CREATE:
        action = "新增";
        break;
      case FORM_ACTION_TYPE.EDIT:
        action = "编辑";
        break;
    }
    this.title = "人员管理-" + action;
  }

  ngOnInit() {
    console.log(this.userTable);
  }
}
