import { Component, OnInit } from "@angular/core";
import { getNzScrollXByColumns } from "../../util/table.utils";
import { FORM_ACTION_TYPE } from "../role-management/components/role-management-form/role-management-form.component";

@Component({
  selector: "app-user-management",
  templateUrl: "./user-management.component.html",
  styleUrls: ["./user-management.component.scss"],
})
export class UserManagementComponent implements OnInit {
  constructor() {}
  pageSize: number = 10;
  currentPage: number = 1;
  keyword: string = null;
  userTable: any[] = [];
  scrollX:string='0px'
  type:FORM_ACTION_TYPE=FORM_ACTION_TYPE.CREATE
  activeId:any=null
  drawerTitle:string='编辑用户'
  showDrawer:boolean = false
  fullDraw:boolean=false
  tableHeader: any[] = [
    {
      name: "ID",
      width: "50px",
    },
    {
      name: "Name",
      width: "150px",
    },
    {
      name: "Email",
      width: "180px",
    },
    {
      name: "Line Manager",
      width: "150px",
    },
    {
      name: "是否含有申请角色",
      width: "150px",
    },
    {
      name: "是否含有审核角色",
      width: "150px",
    },
    {
      name: "Created Date",
      width: "100px",
    },
    {
      name: "Created By",
      width: "100px",
    },
    {
      name: "Updated Date",
      width: "100px",
    },
    {
      name: "Updated By",
      width: "100px",
    },
  ];
  async fetchData() {
    // API Here
    return new Promise((res, rej) => {
      this.userTable = [
        {
          id: 773,
          name: "Ada Zhang",
          email: "ada.zhang1@philips.com",
          isRequestor: null,
          isApprover: true,
          createdDate: "2022-02-10",
          createdBy: "Joe Doe",
          updatedDate: "2022-02-10",
          updatedBy: "Joe Doe",
        },
        {
          id: 123,
          name: "Andy Cui",
          email: "huibin.cui@philips.com",
          isRequestor: null,
          isApprover: true,
          createdDate: "2022-02-10",
          createdBy: "Joe Doe",
          updatedDate: "2022-02-10",
          updatedBy: "Joe Doe",
        },
        {
          id: 421,
          name: "Annie Wang",
          email: "annie.wang@philips.com",
          isRequestor: null,
          isApprover: false,
          createdDate: "2022-02-10",
          createdBy: "Joe Doe",
          updatedDate: "2022-02-10",
          updatedBy: "Joe Doe",
        },
        {
          id: 532,
          name: "Bao, Hongsheng",
          email: "hongsheng.bao@philips.com",
          isRequestor: null,
          isApprover: true,
          createdDate: "2022-02-10",
          createdBy: "Joe Doe",
          updatedDate: "2022-02-10",
          updatedBy: "Joe Doe",
        },
        {
          id: 133,
          name: "Cai, Amy",
          email: "Amy.CAI@philips.com",
          isRequestor: null,
          isApprover: false,
          createdDate: "2022-02-10",
          createdBy: "Joe Doe",
          updatedDate: "2022-02-10",
          updatedBy: "Joe Doe",
        },
        {
          id: 4658,
          name: "Cao, Felicia",
          email: "felicia.cao@philips.com",
          isRequestor: null,
          isApprover: false,
          createdDate: "2022-02-10",
          createdBy: "Joe Doe",
          updatedDate: "2022-02-10",
          updatedBy: "Joe Doe",
        },
        {
          id: 765,
          name: "Cao, Qiankun",
          email: "qian.kun.cao@philips.com",
          isRequestor: null,
          isApprover: false,
          createdDate: "2022-02-10",
          createdBy: "Joe Doe",
          updatedDate: "2022-02-10",
          updatedBy: "Joe Doe",
        },
        {
          id: 4351,
          name: "Chen Qiusi",
          email: "qiusi.chen@philips.com",
          isRequestor: null,
          isApprover: false,
          createdDate: "2022-02-10",
          createdBy: "Joe Doe",
          updatedDate: "2022-02-10",
          updatedBy: "Joe Doe",
        },
        {
          id: 4659,
          name: "Chen Yi Xuan",
          email: "yixuan.chen@philips.com",
          isRequestor: null,
          isApprover: true,
          createdDate: "2022-02-10",
          createdBy: "Joe Doe",
          updatedDate: "2022-02-10",
          updatedBy: "Joe Doe",
        },
        {
          id: 1245,
          name: "Chen, Alice",
          email: "alice.chen@philips.com",
          isRequestor: null,
          isApprover: true,
          createdDate: "2022-02-10",
          createdBy: "Joe Doe",
          updatedDate: "2022-02-10",
          updatedBy: "Joe Doe",
        },
      ];
      res(true);
    });
  }
  ngOnInit() {
    this.scrollX = getNzScrollXByColumns(this.tableHeader)
    this.fetchData()
  }
  handleEdit(id) { 
    this.activeId = id
    this.type = FORM_ACTION_TYPE.EDIT
    this.drawerTitle = '编辑用户'
    this.showDrawer=true
  }
  handleCreate() {
    this.activeId = null
    this.type = FORM_ACTION_TYPE.CREATE
    this.drawerTitle = '新增用户'
    this.showDrawer=true
  }
  handleClose(){
    this.showDrawer = false 
    this.fullDraw = false
    this.activeId = null
  }
  toggleDrawerSize(){
    this.fullDraw = !this.fullDraw
  }
  handleDelete(id) {}
  handleSearch() {}
}
