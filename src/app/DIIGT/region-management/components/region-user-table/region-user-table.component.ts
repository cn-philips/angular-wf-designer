import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {NzMessageService, NzTreeNode} from 'ng-zorro-antd';
import {FORM_ACTION_TYPE} from '../../../role-management/components/role-management-form/role-management-form.component';
import {HttpService} from '../../../../services';
import {RegionUserFormComponent} from '../region-user-form/region-user-form.component';
import {RegionManagementTreeComponent} from '../region-management-tree/region-management-tree.component';

@Component({
  selector: "app-region-user-table",
  templateUrl: "./region-user-table.component.html",
  styleUrls: ["./region-user-table.component.scss"],
})
export class RegionUserTableComponent implements OnInit {
   selectedRoleId: any;
  constructor(
    private http: HttpService,
    private nzMessageService: NzMessageService,
    private message: NzMessageService,
  ) {}
  @ViewChild('userFormComponent') userFormCompent: RegionUserFormComponent;
  public paramsOnwer = {
    pageNo: 1,
    pageSize: 10,
    total: 0
  };
  // pageSize: number = 20;
  // currentPage: number = 1;
  isShowDraw: boolean = false;
  fullDraw: boolean = false;
  focusRoleId: number;
  FormType: FORM_ACTION_TYPE = FORM_ACTION_TYPE.CREATE;
  title: string = null;
  @Input() regionNode: NzTreeNode;
  @Input() treeComponent: RegionManagementTreeComponent;
  userTable: any[] = null;
  filterTable: any[] = [];
  isShowChildDraw: boolean = false;
  isadd: boolean = false;
  selectedRole: any = null;
  level: string[] = [];
  tableHeader: any[] = [
    {
      Ename: "Title/Role",
    },
    {
      Ename: "Is Applicant",
      Cname: "是否申请角色",
    },
    {
      Ename: "Is Approver",
      Cname:"是否审核角色",
    },
  ];
  isloading: boolean = false;

  handleSubmit() {
    if (this.userFormCompent.roleUsersData.length == 0){
      this.message.error('请至少添加一名角色后再保存');
      return;
    }

      const level = this.getlevel();
      console.log('===========');
      console.log(level);
      const url = '/act/ecom/homepage/addUserInfo';
      const arr = {
        level: level,
        userNumber: this.userFormCompent.userInform.id,
        dataSource: 'COS',
        modality: this.userFormCompent.userInform.modality,
        bmc: this.userFormCompent.userInform.bmc,
        team: this.userFormCompent.userInform.team,
        email: this.userFormCompent.userInform.email,
        role: this.userFormCompent.role,
        name: this.userFormCompent.userInform.name,
        lineManager: this.userFormCompent.userInform.lineManager,
      }
      console.log(arr);
      this.http.post(url, arr).subscribe( res=>{
            if (res.code == '0000'){
              this.message.success('添加成功');
            }
            // this.treeComponent.initRoleList();
            this.getArea();
      },error => {

      })

    this.handleClose();
  }
  handleCancel() {
    this.handleClose();
  }
  handleEdit(data: any) {
    this.isadd = false;
    this.FormType = FORM_ACTION_TYPE.EDIT;
    this.setTitle();
    this.selectedRole = this.userTable[data].role;
    this.selectedRoleId = this.userTable[data].id;
    this.isShowDraw = true;
    this.focusRoleId = data;
  }
  handleCreate() {
    this.isadd = true;
    this.FormType = FORM_ACTION_TYPE.CREATE;
    this.setTitle();
    this.isShowDraw = true;
    this.focusRoleId = null;
  }
  handleClose() {
    this.isShowDraw = false;
    this.fullDraw = false;
  }
  toggleDrawerSize() {
    this.fullDraw = !this.fullDraw;
  }
  setTitle() {
    let action = "";
    switch (this.FormType) {
      case FORM_ACTION_TYPE.CREATE:
        action = "新增 User Management-New";
        break;
      case FORM_ACTION_TYPE.EDIT:
        action = "编辑 UserManagement-Edit";
        break;
    }
    this.title = "人员管理-" + action;
  }
  async loadRolesByRegionID(id) {

  }
  public changePageIndexOnwer(e) {
    this.paramsOnwer.pageNo = e;
    this.getArea();
  }
  public changePageSizeOnwer(e) {
    this.paramsOnwer.pageSize = e;
    this.getArea();
  }

  ngOnInit() {}
  ngOnChanges() {
    this.userTable = [];
if (this.regionNode.level >0){
  this.getArea();
  this.getlevel();
}
  }



  getArea() {
    this.isloading = true;
    const url = '/act/ecom/homepage/getNodeAreaRole';
    const arr = {
      id:  this.regionNode == undefined || this.regionNode == null? null: this.regionNode.origin.id,
    }
    console.log(Object.assign(this.paramsOnwer, arr));
      this.http.post(url, Object.assign(this.paramsOnwer, arr)).subscribe(res =>{
        this.userTable = res.data.rows;
        this.paramsOnwer.total = res.data.total;
        this.isloading = false;
      },error => {
        this.isloading = false;
      })


  }
  getlevel(): any[]{
    if (this.regionNode == null || this.regionNode == undefined){
      this.message.error('请先选择需要添加角色的节点');
    }
    const level = [];
    switch (this.regionNode.level) {
      case 0:{
       level.push(this.regionNode.title);
       this.level = level;
        return level;
      }
      case 1:{
        level.push(this.regionNode.title);
        level.push(this.regionNode.parentNode.title);
        this.level = level;
        return level;
      }
      case 2:{
        level.push(this.regionNode.title);
        level.push(this.regionNode.parentNode.title);
        level.push(this.regionNode.parentNode.parentNode.title);
        this.level = level;
        return level;
      }
      case 3:{
        level.push(this.regionNode.title);
        level.push(this.regionNode.parentNode.title);
        level.push(this.regionNode.parentNode.parentNode.title);
        level.push(this.regionNode.parentNode.parentNode.parentNode.title);
        this.level = level;
        return level;
      }
      case 4:{
        level.push(this.regionNode.title);
        level.push(this.regionNode.parentNode.title);
        level.push(this.regionNode.parentNode.parentNode.title);
        level.push(this.regionNode.parentNode.parentNode.parentNode.title);
        level.push(this.regionNode.parentNode.parentNode.parentNode.parentNode.title);
        this.level = level;
        return level;
      }
    }
  }
}
