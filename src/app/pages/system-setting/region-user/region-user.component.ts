import { Component, OnInit, ViewChild } from '@angular/core';
import { NzTreeBase, NzTreeNode } from 'ng-zorro-antd';
import { HttpService } from '@core/services';
import { RegionManagementTreeComponent } from './components/region-management-tree/region-management-tree.component';
import { BusinessInfoArea, BusinessInfoAreaComponent } from './components/business-info-area/business-info-area.component';
import { UserBasicInfoFormComponent } from './components/user-basic-info-form/user-basic-info-form.component';
import { RoleUser } from '@core/domain';
import { NzMessageService } from 'ng-zorro-antd';
import { PermissionService } from '@app/modern-themes/services/permission.service';

@Component({
  templateUrl: './region-user.component.html',
  styleUrls: ['./region-user.component.scss']
})
export class RegionUserComponent implements OnInit {
  constructor(private http: HttpService,private message: NzMessageService,public permission:PermissionService) { }
  @ViewChild('treeComponent') treeCompinent: RegionManagementTreeComponent;
  activeNode: NzTreeNode;
  email: any = null;

  get isUserAdmin(): Boolean {
    return this.permission.hasRole('Admin User');
  }
  get isUserViewer(): Boolean {
    return this.permission.hasRole('Business super user');
  }
  ngOnInit() {

  }
  handleTreeChange(node) {
    this.activeNode = node
    const tree = new NzTreeBase(this.activeNode.treeService);
    console.log(tree.getTreeNodeByKey('1'));
  }

  searchUser(){
    if (this.checkEmailNumber(this.email) > 1) {
      this.message.error('Email不合法');
      return;
    }
    this.handlelook();
  }

  nodeExpand(nodes: NzTreeNode) {
    switch (nodes.level) {
      case 0: {
        nodes.isExpanded = true;
        nodes.isSelected = true;
        break;
      }
      case 1: {
        nodes.parentNode.isExpanded = true;
        nodes.isExpanded = true;
        break;
      }
      case 2: {
        nodes.parentNode.parentNode.isExpanded = true;
        nodes.parentNode.isExpanded = true;
        nodes.isExpanded = true;
        break;
      }
      case 3: {
        nodes.parentNode.parentNode.parentNode.isExpanded = true;
        nodes.parentNode.parentNode.isExpanded = true;
        nodes.parentNode.isExpanded = true;
        nodes.isExpanded = true;
        break;
      }
      case 4: {
        nodes.parentNode.parentNode.parentNode.parentNode.isExpanded = true;
        nodes.parentNode.parentNode.parentNode.isExpanded = true;
        nodes.parentNode.parentNode.isExpanded = true;
        nodes.parentNode.isExpanded = true;
        break;
      }
    }
  }
  // public paramsOnwer = {
  //   pageNo: 1,
  //   pageSize: 10,
  //   total: 0
  // };
  //
  //
  // getArea() {
  //   const url = '/act/ecom/homepage/getNodeAreaRole';
  //   const arr = {
  //       id: this.activeNode.origin.id
  //   };
  //   const par = Object.assign(this.paramsOnwer, arr);
  //   this.http.post(url, par).subscribe(res =>{
  //       console.log(res.data)
  //   },error => {
  //       this.message.error('失败')
  //   })
  // }

  @ViewChild('areaComponent') areaComponent: BusinessInfoAreaComponent;
  @ViewChild('basicInfoFormComponent') userformBase: UserBasicInfoFormComponent;
  title = "人员管理-查看 View User";
  ifShowDrawer: boolean = false;
  islook: boolean = true;
  readonly: boolean = true;
  userFormType: any = '';
  businessinfo: BusinessInfoArea[] = [];
  roleUsersData: RoleUser = null;
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

  public userInfoPage = {
    pageNo: 1,
    pageSize: 10,
    total: 0
  };

  showDialog() {
    this.ifShowDrawer = true;
  }
  hideDialog() {
    this.ifShowDrawer = false;
  }

  handlelook() {
    this.userFormType = "CHECK";
    this.fetchUserDetailInformation();
    this.userformBase.validateForm.disable();
    this.getuserInfo(this.email);
    this.showDialog();
  }

  handleCancel() {
    this.hideDialog();
  }

  fetchUserDetailInformation() {
    // API Here
    const url = '/act/ecom/homepage/getCdUserInfoByEmail?email=' + this.email;
    this.http.get(url).subscribe(res => {
      this.roleUsersData = res.data;
      if (this.roleUsersData) {
        let user = this.roleUsersData;
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
    }, error => {

    })
  }

  getuserInfo(email: any) {
    this.businessinfo = [];
    this.areaComponent.userInfoPage.total = 0;
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

  checkEmailNumber(str: string): number {
    str += "";
    const split = str.split('@');
    if (split.length > 2) {
      return 5; // 大于1的任意数字都可以
    }
    if (split[1] != 'philips.com') {
      return 5;
    }
    return 0;
  }

}
