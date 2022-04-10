import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { NzFormatEmitEvent, NzTreeNode } from "ng-zorro-antd";
import { BehaviorSubject } from "rxjs";
@Component({
  selector: "app-role-management-tree",
  templateUrl: "./tree.component.html",
  styleUrls: ["./tree.component.scss"],
})
export class RoleManagementTreeComponent implements OnInit {
  constructor() {}
  nodes = []; 
  @Output() onChange: EventEmitter<NzTreeNode> = new EventEmitter<NzTreeNode>();
  nzEvent(event: NzFormatEmitEvent): void {
    this.onChange.emit(event.node);
  }
  /**
   * 初始化Role List
   *
   * @memberof RoleManagementTreeComponent
   */
  async initRoleList() {
    this.nodes = this.nodes.concat([
      { title: "Sales Leader", key: 0, isLeaf: true },
      { title: "Professional Service Operation", key: 1, isLeaf: true },
      { title: "Professional Service", key: 2, isLeaf: true },
      { title: "IB", key: 3, isLeaf: true },
      { title: "S&SD Marketing Leader", key: 4, isLeaf: true },
      { title: "S&SD BP", key: 5, isLeaf: true },
      { title: "Bidding", key: 6, isLeaf: true },
      { title: "COP Operation", key: 7, isLeaf: true },
      { title: "Win Confirm", key: 8, isLeaf: true },
      { title: "COP Operation Leader", key: 9, isLeaf: true },
      { title: "COP Leader", key: 10, isLeaf: true },
      { title: "OM Leader", key: 11, isLeaf: true },
      { title: "OM", key: 12, isLeaf: true },
      { title: "OA", key: 13, isLeaf: true },
      { title: "Admin", key: 14, isLeaf: true },
      { title: "OA Leader", key: 15, isLeaf: true },
      { title: "CFC Leader", key: 16, isLeaf: true },
      { title: "ZPM", key: 17, isLeaf: true },
      { title: "DPM", key: 18, isLeaf: true },
      { title: "PM Leader", key: 19, isLeaf: true },
      { title: "Distributor Leader", key: 20, isLeaf: true },
      { title: "Zone Solution Sales Leader", key: 21, isLeaf: true },
      { title: "Solution Sales", key: 22, isLeaf: true },
      { title: "Product Sales", key: 23, isLeaf: true },
      { title: "BMM Leader", key: 24, isLeaf: true },
      { title: "Cluster BP", key: 25, isLeaf: true },
      { title: "C&C Functional Account", key: 26, isLeaf: true },
      { title: "C&C Leader", key: 27, isLeaf: true },
      { title: "C&C Specialist", key: 28, isLeaf: true },
      { title: "Accounting Controller", key: 29, isLeaf: true },
      { title: "Finance Controller", key: 30, isLeaf: true },
    ]);
  }
  async ngOnInit() {
    await this.initRoleList();
  }
}
