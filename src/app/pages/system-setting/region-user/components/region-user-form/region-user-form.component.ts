import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FORM_ACTION_TYPE } from '@core/domain';
import { RoleUser } from '@core/domain';
import { HttpService } from '@core/services';
import { NzMessageService } from 'ng-zorro-antd';
import { RoleModalityBMCFormComponent } from '../role-modality-bmc-form/role-modality-bmc-form.component';
import { UserBasicInfoFormComponent } from '../user-basic-info-form/user-basic-info-form.component';
import { BusinessInfoArea, BusinessInfoAreaComponent } from '../business-info-area/business-info-area.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { PermissionService } from '@app/modern-themes/services/permission.service';

@Component({
  selector: "app-region-user-form",
  templateUrl: "./region-user-form.component.html",
  styleUrls: ["./region-user-form.component.scss"],
})
export class RegionUserFormComponent implements OnInit {
  @Input() type: FORM_ACTION_TYPE = FORM_ACTION_TYPE.CREATE;
  @Input() id: number = null;
  @Input() usertable: any[] = [];
  @ViewChild('userinform') userformModality: RoleModalityBMCFormComponent;
  @ViewChild('basicInfoFormComponent') userformBase: UserBasicInfoFormComponent;
  @ViewChild('areaComponent') areaComponent: BusinessInfoAreaComponent;
  roleUsersData: RoleUser[] = [];
  @Input() isAdd: boolean = false;
  @Output() getArea = new EventEmitter();
  @Output() getLevel = new EventEmitter();
  @Output() edit = new EventEmitter();
  @Input() level: string[] = [];
  islook: boolean = false;
  @Input() isShowDraw: boolean = false;
  @Output() isShowDrawChange = new EventEmitter<boolean>(true);
  @Input() roleId: any = null;
  businessinfo: BusinessInfoArea[] = [];
  email: any;
  constructor(
    private http: HttpService,
    private message: NzMessageService,
    private modal: NzModalService,
    public permission:PermissionService
  ) {
  }
  get isUserAdmin(): Boolean {
    return this.permission.hasRole('Admin User');
  }
  get isUserViewer(): Boolean {
    return this.permission.hasRole('Business super user');
  }
  rolelist: any[] = null;
  @Input() role: any = null;
  isRequestor: any = null;
  isApprover: any = null;
  isloading: boolean = false;
  public paramsOnwer = {
    pageNo: 1,
    pageSize: 10,
    total: 0
  };
  public userInfoPage = {
    pageNo: 1,
    pageSize: 10,
    total: 0
  };
  ngOnInit() {
  }

  fetchRegionDetail() {
    this.resetRoleForm();
    if (this.usertable[this.id] != undefined) {
      this.role = this.usertable[this.id].role;
      this.isRequestor = this.usertable[this.id].ifApply;
      this.isApprover = this.usertable[this.id].ifReview;
    }
  }
  fetchUserTable() {
    if (this.usertable[this.id] === undefined) {
      return;
    }
    this.isloading = true;
    // API Here
    const url = '/act/ecom/homepage/getCdUserInfo';
    const arr = {
      level: this.usertable[this.id].level,
      role: this.role
    }
    this.http.post(url, Object.assign(this.paramsOnwer, arr)).subscribe(res => {
      this.roleUsersData = res.data.rows;
      this.paramsOnwer.total = res.data.total;
      this.isloading = false;
    }, error => {
      this.isloading = false;
    })

  }
  async resetRoleForm() {
    this.role = null,
      this.isRequestor = null,
      this.isApprover = null,
      this.roleUsersData = [];
  }
  ngOnChanges() {
    this.initRoleOptions();
    if (this.id != undefined && this.id != null && this.type === FORM_ACTION_TYPE.EDIT) {
      // init Edit Form Data
      this.fetchRegionDetail();
      this.fetchUserTable();
    } else {
      this.resetRoleForm();
    }
  }

  //

  userFormType: FORM_ACTION_TYPE = FORM_ACTION_TYPE.CREATE;
  ifShowDrawer: boolean = false;
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
    funcTeamType: null,
    bmcMags: [],
    serveTeams: [],
  };
  title: string = "人员管理-详情";
  tableHeader: any[] = [
    {
      Ename: "DataSource",
      Cname: " 数据来源",
    },
    {
      Ename: "Modality",
    },
    {
      Ename: 'Cluster'
    },
    {
      Ename: "BMC",
    },
    {
      Ename: "Team",
    },
    {
      Cname: "是否服务团队",
    },
    {
      Ename: "Email",
    },
  ];
  readonly: boolean = false;

  fetchUserDetailInformation(id) {
    // Replace API Here
    let user = this.roleUsersData.find((i) => i.id === id);
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
      funcTeamType: user.funcTeamType,
      bmcMags: user.bmcMags,
      serveTeams: user.serveTeams,
    };
  }

  public changePageIndexOnwer(e) {
    this.paramsOnwer.pageNo = e;
    this.fetchUserTable();
  }
  public changePageSizeOnwer(e) {
    this.paramsOnwer.pageSize = e;
    this.fetchUserTable();
  }


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
      funcTeamType: null,
      bmcMags: [],
      serveTeams: [],
    };
  }
  handleCreate() {

    this.setUserFormType(FORM_ACTION_TYPE.CREATE);
    this.setTitle();
    this.readonly = false;
    this.resetUserDetailInformation();
    this.showDialog();
  }
  handleEdit(id) {
    this.setUserFormType(FORM_ACTION_TYPE.EDIT);
    this.setTitle();
    this.fetchUserDetailInformation(id);
    this.readonly = true;
    this.showDialog();
    this.userformBase.validateForm.get('email').disable();
  }
  showDialog() {
    this.ifShowDrawer = true;
  }
  hideDialog() {
    this.ifShowDrawer = false;
  }

  handleDelete(id, email) {
    const checkUrl = '/act/ecom/homepage/deleteRoleCheck?email=' + email;
    this.http.get(checkUrl).subscribe(res => {
      if (res.data) {
        this.handleDoDelete(id);
      }
      if (!res.data) {
        this.modal.confirm({
          nzTitle: '确定删除?',
          nzContent: '<b>该角色有待办任务，确认删除？</b>',
          nzOkText: '确定',
          nzOkType: 'danger',
          nzOnOk: () => this.handleDoDelete(id),
          nzCancelText: '取消',
          nzOnCancel: () => console.log('Cancel')
        });
      }
    }, error1 => {

    });
  }
  handleDoDelete(id){
    const url = '/act/ecom/homepage/deleteUserInfo?id=' + id;
    this.http.get(url).subscribe(res1 => {
      this.fetchUserTable();
      this.message.success('请求成功');
    }, error => {
      this.message.error('请求错误');
    })
  }

  checkEmailNumber(str: string): number {
    const split = str.split('@');
    if (split.length > 2) {
      return 5; // 大于1的任意数字都可以
    }
    if (split[1] != 'philips.com') {
      return 5;
    }
    return 0;
  }
  handleSubmit() {

    this.userformBase.validateForm.get('email').enable();
    let error = false;
    const baseInfo = this.userformBase.validateForm
    const modality = this.userformModality.validateForm
    for (const i in baseInfo.controls) {
      baseInfo.controls[i].markAsDirty()
      baseInfo.controls[i].updateValueAndValidity()
    }
    for (const i in modality.controls) {
      modality.controls[i].markAsDirty()
      modality.controls[i].updateValueAndValidity()
    }

    error = baseInfo.invalid || modality.invalid
    if (error) {
      this.message.error('请按要求填写')
      return;
    }
    if (this.checkEmailNumber(this.userformBase.validateForm.get('email').value) > 1) {
      this.message.error('Email不合法');
      return;
    }
    if (this.userformBase.validateForm.get('lineManager').value != null && this.userformBase.validateForm.get('lineManager').value != '' && this.checkEmailNumber(this.userformBase.validateForm.get('lineManager').value) > 1) {
      this.message.error('LineManager不合法');
      return;
    }

    this.userformModality.validateForm.get('cluster').enable();
    var arr = Object.assign(this.userformModality.validateForm.value, this.userformBase.validateForm.value);
    //过滤空值对象
    if(arr.bmcMags){
      arr.bmcMags = arr.bmcMags.filter((val) => val.dictValue !== null || val.mag !== null)
    }
    if(arr.serveTeams){
      arr.serveTeams = arr.serveTeams.filter((val) => val.dictValue !== null)
    }
    const id = this.userInform.id;
    this.userInform = arr;
    this.userInform.dataSource = 'COS';
    this.userformModality.validateForm.get('cluster').disable();

    if (this.userFormType === FORM_ACTION_TYPE.CREATE) {
      if (this.roleUsersData.find(x => x.bmc == arr.bmc) != undefined && this.isApprover == 1) {
        this.message.error('当前角色BMC重复，请重新选择');
        return;
      }
      // API Here
      const url = '/act/ecom/homepage/addUserInfo';
      this.getLevel.emit();
      const arr1 = {
        level: this.level,
        userNumber: this.userInform.id,
        dataSource: 'COS',
        modality: this.userInform.modality,
        bmc: this.userInform.bmc,
        team: this.userInform.team,
        email: this.userInform.email,
        role: this.role,
        name: this.userInform.name,
        lineManager: this.userInform.lineManager,
        cluster: this.userInform.cluster,
        funcTeamType: this.userInform.funcTeamType,
        bmcMags: this.userInform.bmcMags,
        serveTeams: this.userInform.serveTeams,
        id: id
      }

      this.http.post(url, arr1).subscribe(res => {
        if (res.code == '0000') {
          this.message.success('添加成功');
        }
        // this.treeComponent.initRoleList();

        new Promise(() => {
          this.getArea.emit();
        })
        setTimeout(() => {
          this.id = this.usertable.findIndex((x) => x.role == arr1.role);
          this.role = arr1.role;
          this.fetchUserTable();
          this.edit.emit(this.id);
        }, 500)
      }, error => {
        this.message.error('请求异常');
      })
    }
    if (this.userFormType === FORM_ACTION_TYPE.EDIT) {
      // API Here
      const arr1 = {
        level: this.level,
        userNumber: this.userInform.id,
        dataSource: 'COS',
        modality: this.userInform.modality,
        bmc: this.userInform.bmc,
        team: this.userInform.team,
        email: this.userInform.email,
        role: this.role,
        name: this.userInform.name,
        lineManager: this.userInform.lineManager,
        cluster: this.userInform.cluster,
        funcTeamType: this.userInform.funcTeamType,
        bmcMags: this.userInform.bmcMags,
        serveTeams: this.userInform.serveTeams,
        id: id
      }

      const url = '/act/ecom/homepage/updateUserInfo';
      this.http.post(url, arr1).subscribe(res => {
        this.message.success('更新成功');
        this.getArea.emit();
        this.fetchUserTable();
      }, error => {
        this.message.error('更新失败');
      })
    }
    this.hideDialog();
  }
  handleCancel() {
    this.userformBase.validateForm.enable();
    this.islook = false;
    this.readonly = false;
    this.hideDialog();
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
        action = "用户详情-新增 User Management-User Details-New";
        break;
      case FORM_ACTION_TYPE.EDIT:
        action = "用户详情-编辑 UserManagement-User Details-Edit";
        break;
      case FORM_ACTION_TYPE.CHECK:
        action = "查看 View User";
        break;
    }
    this.title = "人员管理-" + action;
  }

  initRoleOptions() {
    const url = 'act/ecom/homepage/getRole';
    this.http.get(url).subscribe(res => {
      this.rolelist = [];
      for (let i = 0; i < res.data.length; i++) {
        this.rolelist.push({ label: res.data[i], value: res.data[i] });
      }
      this.deletelist(this.rolelist, this.usertable);
    }, error => {

    })
  }

  deletelist(curlist: any[], otherlist: any[]) {
    let i = curlist.length;
    while (i--) {
      if (otherlist.some((x) => {
        return curlist[i].value === x.role;
      })) curlist.splice(i, 1);

    }

  }

  rolechanges(role: any) {
    this.userformModality.validateForm.get('role').patchValue(role);

    const url = 'act/ecom/homepage/getInfoByRole?role=' + role;
    this.http.get(url).subscribe(res => {
      this.isApprover = res.data.ifReview;
      this.isRequestor = res.data.ifApply;
    }, error => {

    })
  }

  handlelook(id: any, email: any) {
    this.userFormType = FORM_ACTION_TYPE.CHECK;
    this.setTitle();
    this.fetchUserDetailInformation(id);
    this.email = email;
    this.islook = true;
    this.userformModality.validateForm.disable();
    this.userformBase.validateForm.disable();
    this.getuserInfo(email);
    this.showDialog();
  }

  getuserInfo(email: any) {
    const url = 'act/ecom/homepage/getUserInfoByEmail';
    const arr = {
      email: email,
    }
    this.http.post(url, Object.assign(this.userInfoPage, arr)).subscribe(res => {

      for (let i = 0; i < res.data.rows.length; i++) {
        this.businessinfo = res.data.rows;
      }
      this.areaComponent.userInfoPage.total = res.data.total;
    })
  }

  cancel() {

  }
}
