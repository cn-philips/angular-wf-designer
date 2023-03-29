import { Component, Input, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { getNzScrollXByColumns } from '@core/util/table.utils';
import { HttpService } from '@core/services';
import {FORM_ACTION_TYPE } from '@core/domain'

export interface BusinessInfoArea {
  dataSource: string,
  role: string,
  team: string,
  ifApply: boolean,
  ifReview: boolean,
  modality: string,
  bmc: string,
  area: string[],
}
@Component({
  selector: 'app-business-info-area',
  templateUrl: './business-info-area.component.html',
  styleUrls: ['./business-info-area.component.scss']
})
export class BusinessInfoAreaComponent implements OnInit {
  @Input() readonly: boolean = false
  @Input() dataSource: BusinessInfoArea[];
  @Input() email: any = null;
  scrollX: string = '0px'
  pageSize: number = 10;
  currentPage: number = 1;
  FormType: FORM_ACTION_TYPE = FORM_ACTION_TYPE.CREATE;
  public userInfoPage = {
    pageNo: 1,
    pageSize: 10,
    total: 0
  };
  tableHeader: any[] = [
    {
      name: "DataSource 数据来源",
      width: "100px",
    },
    {
      name: "Role/Title",
      width: "100px",
    },
    {
      name: "Team",
      width: "100px",
    },
    {
      name: "是否服务团队",
      width: "100px",
    },
    {
      name: "Serve Team",
      width: "100px",
    },
    {
      name: "Is Applicant 是否申请角色",
      width: "100px",
    },
    {
      name: "Is Approver 是否审核角色",
      width: "100px",
    },
    {
      name: "Modality",
      width: "100px",
    },
    {
      name: "BMC/MAG",
      width: "100px",
    },
    {
      name: "Area",
      width: "250px",
    },
  ];
  isloading: boolean = false;


  constructor(
    private http: HttpService,
    private modal: NzModalService
  ) { }

  ngOnInit() {
    this.scrollX = getNzScrollXByColumns(this.tableHeader)
  }
  handleDetail(user) {
  }
  handleEdit(id) {
    this.FormType = FORM_ACTION_TYPE.EDIT;
  }
  handleCreate() {
    this.FormType = FORM_ACTION_TYPE.CREATE;
  }
  handleDelete(user) {
    if (this.ifApproverHasProjectAsOwner(user)) {
      // 该角色为onwer的项目已完成，提示“存在完成项目，确认删除？”点击确认则删除该用户该角色该Modality/Cluster/信息；
      this.modal.confirm({
        nzTitle: '确定删除?',
        nzContent: '<b>存在完成项目，确认删除？</b>',
        nzOkText: '确定',
        nzOkType: 'danger',
        nzOnOk: () => this.handleDoDelete(user.id),
        nzCancelText: '取消',
        nzOnCancel: () => console.log('Cancel')
      });
    } else if (!this.ifIsRequestor(user)) {
      // 角色不为申请人角色，点击删除则删除该用户该角色该该Modality/Cluster/BMC所有记录（更新删除标记）
      this.handleDoDelete(user.id)
    }
  }
  handleDoDelete(userId) {
    // Delete API Here
  }
  ifIsApprover(user) {
    return user.ifApply
  }
  ifIsRequestor(user) {
    return user.ifReview
  }
  ifSourceFrom(user, dataSource: string[]) {
    return dataSource.includes(user.dataSource)
  }
  ifApproverHasUnfinishedProjectAsOwner(user) {
    return false
  }
  ifApproverHasProjectAsOwner(user) {
    return true
  }

  getuserInfo(email: any) {
    this.isloading = true;
    const url = 'act/ecom/homepage/getUserInfoByEmail';
    const arr = {
      email: email,
    }
    this.http.post(url, Object.assign(this.userInfoPage, arr)).subscribe(res => {
      console.log(res.data);
      for (let i = 0; i < res.data.rows.length; i++) {
        this.dataSource = res.data.rows;
      }
      console.log(this.dataSource)
      this.userInfoPage.total = res.data.total;
    }, error => {

    })
    this.isloading = false;
  }
  public changePageIndexOnwer(e) {
    this.userInfoPage.pageNo = e;
    this.getuserInfo(this.email);
  }
  public changePageSizeOnwer(e) {
    this.userInfoPage.pageSize = e;
    this.getuserInfo(this.email);
  }
  replaceArea(area: any): string {
    return area.replaceAll('|', '<br>');
  }
}
