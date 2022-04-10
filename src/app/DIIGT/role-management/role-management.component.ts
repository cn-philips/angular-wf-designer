import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzTreeNode } from "ng-zorro-antd";
@Component({
  selector: "app-role-management",
  templateUrl: "./role-management.component.html",
  styleUrls: ["./role-management.component.scss"],
})
export class RoleManagementComponent implements OnInit {

  constructor( ) {}
  activeNode:NzTreeNode

  ngOnInit()  { 
  }
  handleTreeChange(node){
    this.activeNode = node
    console.log(node)
  }
}
