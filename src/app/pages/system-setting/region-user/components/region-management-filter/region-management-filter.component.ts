import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from "@angular/forms";
import { NzMessageService, NzTreeBase, NzTreeNode } from 'ng-zorro-antd';
import { FileService, HttpService } from '@core/services';
import { RegionManagementTreeComponent } from '../region-management-tree/region-management-tree.component';
import { RegionUserTableComponent } from '../region-user-table/region-user-table.component';
import { url } from 'inspector';

@Component({
  selector: "app-region-management-filter",
  templateUrl: "./region-management-filter.component.html",
  styleUrls: ["./region-management-filter.component.scss"],
})
export class RegionManagementFilterComponent implements OnInit {
  regionForm!: FormGroup;
  @Input() isDeleteable: boolean = false;
  @Input() isEditable: number = null;
  @Input() regionNode: NzTreeNode;
  @Input() treeComponent: RegionManagementTreeComponent;
  @Input() userTableComponent: RegionUserTableComponent;
  // @Output() nodeExpand = new EventEmitter<NzTreeNode>();
  levelOptions: any[] = [];
  groupOptions: any[] = [];
  bigAreaOptions: any[] = [];
  smallAreaOptions: any[] = [];
  provinceOptions: any[] = [];
  level: any = null;
  groupType:any = null;
  group: any = null;
  bigArea: any = null;
  smallArea: any = null;
  province: any = null;
  isSysteamAdmin: any = false;
  exportLoading: any = false;
  expandPoint: any[] = [];
  constructor(
    private http: HttpService,
    private message: NzMessageService,
    private fileService: FileService,
  ) {
  }
  areaUpdate: any[] = [];
  mode: boolean = false;
  areaName: any = null;
  parentId: any = null;
  area: any = {
    id: '',
    parentId: '',
    levelName: '',
    areaName: '',
    description: '',
    createUser: '',
    updateUser: '',
    createTime: '',
    updateTime: '',
    cdId: ''
  }


  async ngOnInit() {

  }

  getNodeInfo() {
    this.level = this.regionNode == undefined ? null : this.regionNode.level;
    if (this.level > 1) {
      this.areaUpdate = this.regionNode.parentNode.parentNode.children;
    } else if (this.level == 1) {
      this.areaUpdate = this.regionNode.parentNode.children;
    }

    switch (this.level) {
      case 0: {
        this.groupType = this.regionNode.origin.title;
        this.group = null
        this.bigArea = null;
        this.smallArea = null;
        this.province = null;
        break;
      }
      case 1: {
        this.groupType = this.regionNode.parentNode.origin.title;
        this.group = this.regionNode.origin.title;
        this.bigArea = null;
        this.smallArea = null;
        this.province = null;
        break;
      }
      case 2: {
        this.groupType = this.regionNode.parentNode.parentNode.origin.title;
        this.group = this.regionNode.parentNode.origin.title;
        this.bigArea = this.regionNode.origin.title;
        this.smallArea = null;
        this.province = null;
        break;
      }
      case 3: {
        this.groupType = this.regionNode.parentNode.parentNode.parentNode.origin.title;
        this.group = this.regionNode.parentNode.parentNode.origin.title;
        this.bigArea = this.regionNode.parentNode.origin.title;
        this.smallArea = this.regionNode.origin.title;
        this.province = null;
        break;
      }
      case 4: {
        this.groupType = this.regionNode.parentNode.parentNode.parentNode.parentNode.origin.title;
        this.group = this.regionNode.parentNode.parentNode.parentNode.origin.title;
        this.bigArea = this.regionNode.parentNode.parentNode.origin.title;
        this.smallArea = this.regionNode.parentNode.origin.title;
        this.province = this.regionNode.origin.title;
        break;
      }

    }
  }


  async ngOnChanges(changes: SimpleChanges) {
    this.cancel();
    this.getNodeInfo();
    this.getSysteamAdmin();
  }


  // 删除结点
  async deleteArea() {
    if (this.regionNode.children.length > 0) {
      this.message.error('必须没有子节点才可以删除');
      return;
    }
    if (this.userTableComponent.userTable.length > 0) {
      this.message.error('区域存在角色时无法删除！');
      return;
    }
    const url = '/act/ecom/homepage/deleteAreaInfo?id=' + this.regionNode.origin.id;
    this.http.get(url).subscribe(res => {
      if (res.code == '0000') {
        this.message.success('删除成功');
        const base = new NzTreeBase(this.regionNode.treeService);
        let key = this.regionNode.parentNode.key;
        this.regionNode = base.getTreeNodeByKey('1');
        this.resetFilter();
        this.treeComponent.initRoleList();
        setTimeout(() => {
          this.nodeExpand(base.getTreeNodeByKey(key));
        }, 1000);
      }
    }, error => {

    })
  }

  editArea() {
    this.isEditable = this.regionNode.level;
    this.mode = true;
    if (this.regionNode.level != 0) {
      this.parentId = this.regionNode.parentNode.origin.id;
    } else {
      this.parentId = 0;
    }
  }

  resetFilter() {
    this.groupType = null;
    this.group = null;
    this.smallArea = null;
    this.bigArea = null;
    this.province = null;
    this.parentId = null;
  }

  saveArea() {

    switch (this.isEditable) {
      case 0: {
        this.area.areaName = this.groupType;
        break;
      }
      case 1: {
        this.area.areaName = this.group;
        break;
      }
      case 2: {
        this.area.areaName = this.bigArea;
        break;
      }
      case 3: {
        this.area.areaName = this.smallArea;
        break;
      }
      case 4: {
        this.area.areaName = this.province;
        break;
      }
    }
    this.area.id = this.regionNode.origin.id;
    this.area.parentId = this.parentId;
    //判断是否是根节点
    if (this.regionNode.level != 0) {
      if (this.regionNode.parentNode.origin.children.find(x => x.title == this.area.areaName)) {
        console.log("节点已存在名称：",this.regionNode.parentNode.origin.children.find(x => x.title == this.area.areaName));
        this.message.error('已存在该名称的区域');
        return;
      }
    } else {
      if (this.regionNode.origin.children.find(x => x.title == this.area.areaName)) {
        console.log("根节点已存在名称：",this.regionNode.parentNode.origin.children.find(x => x.title == this.area.areaName));
        this.message.error('已存在该名称的区域');
        return;
      }
    }
    
    const url = '/act/ecom/homepage/updateAreaInfo';
    this.http.post(url, this.area).subscribe(res => {
      if (res.code == '0000') {
        this.message.success('更新成功');
        this.treeComponent.initRoleList();
        const base = new NzTreeBase(this.regionNode.treeService);
        setTimeout(() => {
          this.nodeExpand(base.getTreeNodeByKey(this.regionNode.parentNode.key));
        }, 1000);
      }
      this.isEditable = null;
      this.mode = false;
    }, error => {
      this.message.error('更新失败');
      this.isEditable = null;
      this.mode = false;
    });
  }

  cancel() {
    this.isEditable = null;
    this.mode = false;
    this.getNodeInfo();
  }

  cancels() {

  }

  getSysteamAdmin() {
    var userRoleList = JSON.parse(window.localStorage.getItem("roles"));
    if(userRoleList.includes('SYSTEMADMIN')) {
      this.isSysteamAdmin = true;
    }
  }

  exportUserData($event) {
    if (this.groupType == null || this.groupType == "" || this.groupType == undefined) {
      this.message.error('请选择Group Type后操作！');
      return;
    }
    this.exportLoading = true;
    var param = {
      groupType: this.groupType,
      cycleGroup: this.group,
      bigArea: this.bigArea,
      smallArea: this.smallArea,
      province: this.province
    }
    const url = '/act/ecom/homepage/exportUserInfo';
    this.http.postDownload(url, param).subscribe(rest => {
      this.fileService.downloadResponse('Tasks', rest);
      this.message.success('导出成功');
      this.exportLoading = false;
    }, error => {
      this.message.error('导出失败');
      this.exportLoading = false;
    });
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

}
