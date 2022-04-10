import { Component, Input, OnInit } from '@angular/core';
import { NzTreeNode } from 'ng-zorro-antd';
import { FORM_ACTION_TYPE } from '../role-management-form/role-management-form.component';

@Component({
  selector: 'app-role-management-table',
  templateUrl: './role-management-table.component.html',
  styleUrls: ['./role-management-table.component.scss']
})
export class RoleManagementTableComponent implements OnInit {

  constructor() { }
  pageSize:number=10
  currentPage:number=1
  isShowDraw:boolean=false
  fullDraw:boolean=false
  focusRoleId:string=null
  FormType:FORM_ACTION_TYPE=FORM_ACTION_TYPE.CREATE
  title:string=null
  @Input() roleNode: NzTreeNode;
  userTable: any[] = [
    {
      id:1,
      cycle_group: "PD&IGT(Public)",
      big_area: 'North',
      small_area: "BJ&TJ",
      province: "",
    },
    {
      id:2,
      cycle_group: "PD&IGT(Public)",
      big_area: 'North',
      small_area: "HEB",
      province: "",
    },
    {
      id:3,
      cycle_group: "PD&IGT(Public)",
      big_area: 'North',
      small_area: "HEN",
      province: "",
    },
    {
      id:4,
      cycle_group: "PD&IGT(Public)",
      big_area: 'North',
      small_area: "SX",
      province: "",
    },
  ];
  tableHeader: any[] = [
    {
      name: "Cycle Group",
    },
    {
      name: "Big Area 大区",
    },
    {
      name: "Smaill Area 小区",
    },
    {
      name: "Province 省份",
    },
  ];
  filterTable: any[] = [ 
  ];
  handleEdit(id){
    this.FormType = FORM_ACTION_TYPE.EDIT
    this.setTitle()
    this.isShowDraw=true
    this.focusRoleId=id  
  }
  handleCreate(){
    this.FormType = FORM_ACTION_TYPE.CREATE
    this.setTitle()
    this.isShowDraw=true
    this.focusRoleId=null
    
  }
  handleClose(){
    this.isShowDraw=false
    this.fullDraw = false
  }
  toggleDrawerSize(){
    this.fullDraw = !this.fullDraw
  }
  setTitle(){
    let action = ''
    switch(this.FormType){
      case FORM_ACTION_TYPE.CREATE:
        action='新增'
        break
        case FORM_ACTION_TYPE.EDIT:
          action='编辑'
          break
    }
    this.title='人员管理-'+action
  }
  loadUsersByRole(){
    
  }
  ngOnInit() {
  }
  ngOnChanges(){ 
  }

}
