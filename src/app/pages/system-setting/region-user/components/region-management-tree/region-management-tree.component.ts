import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NzTreeNode, NzFormatEmitEvent, NzMessageService, NzTreeBase } from 'ng-zorro-antd';
import { HttpService } from '@core/services';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: "app-region-management-tree",
  templateUrl: "./region-management-tree.component.html",
  styleUrls: ["./region-management-tree.component.scss"],
})
export class RegionManagementTreeComponent implements OnInit {
  constructor(
    private http: HttpService,
    private message: NzMessageService,
    public activatedRouter: ActivatedRoute,
  ) { }
  expandKey: string[] = ['0'];
  nodes = [];
  groupDisabled: boolean = false;
  bigAreaDisabled: boolean = false;
  smallAreaDisabled: boolean = false;
  provinceDisabled: boolean = false;
  @Input() regionNode: NzTreeNode;
  @ViewChild('tree') tree: NzTreeBase;
  activeNode: NzTreeNode;
  @Output() onChange: EventEmitter<NzTreeNode> = new EventEmitter<NzTreeNode>();

  nzEvent(event: NzFormatEmitEvent): void {
    this.onChange.emit(event.node);
    this.activeNode = event.node;
  }
  areaInfo: any = {
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
  /**
   * 初始化Role List
   *
   * @memberof RoleManagementTreeComponent
   */
  private setTree(val): any {

    if (val.childrenList != null && val.childrenList != undefined && val.childrenList != '') {
      const s = {
        id: val.id,
        title: val.areaName,
        key: val.id,
        levelName: val.levelName,
        importFlag: val.importFlag,
        children: []
      };
      val.childrenList.map(row => {
        s.children.push(this.setTree(row));
      })
      return s;
    } else {
      const s = {
        id: val.id,
        title: val.areaName,
        key: val.id,
        isLeaf: true,
        levelName: val.levelName,
        importFlag: val.importFlag,
        children: []
      };
      return s;
    }
  }



  initRoleList() {
    this.treeloading = true;
    const url = '/act/ecom/homepage/getAllAreaInfo';
    this.http.get(url).subscribe(res => {
      res.data.map(val => {
        this.nodes = [this.setTree(val)];
        this.treeloading = false;
      });
    }, error => {
      this.treeloading = false;
    })

  }
  async ngOnInit() {
    this.initRoleList();
  }

  ifShowDrawer: boolean = false;

  showDialog() {
    this.groupTypes = this.nodes;
    // this.groups = this.getopt(this.nodes, 1);
    this.ifShowDrawer = true;
  }
  hideDialog() {
    this.groupTypeOptions = null;
    this.groupOptions = null;
    this.bigAreaOptions = null;
    this.smallAreaOptions = null;
    this.provinceOptions = null;
    this.ifShowDrawer = false;
  }
  groupTypeOptions: any = '';
  groupOptions: any = '';
  bigAreaOptions: any = '';
  smallAreaOptions: any = '';
  provinceOptions: any = '';
  groupTypes: any[] = [];
  groups: any[] = [];
  bigAreas: any[] = [];
  smallAreas: any[] = [];
  province: any[] = [];

  changeGroup(opt: any){
    this.groups = this.getopt(this.nodes, 1);
  }

  // 返回选择节点的所有下一级节点
  getopt(val: any, id: any): any {
    for (let i = 0; i < val.length; i++) {
      if (val[i].id == id) {
        return val[i].children;
      } else {
        this.getopt(val[i].children, id);
      }
    }

  }
  changebig(opt: any) {
    this.bigAreas = this.nodes[0].children.filter(item => item.id == opt)[0].children;
    for (let i = 0; i < this.nodes.length; i++) {
      const m: any = this.nodes[i].children.filter(item => item.id == opt)[0].children;
      if (m != null && m != undefined && m != '') {
        this.bigAreas = this.nodes[i].children.filter(item => item.id == opt)[0].children;
      }
    }
    // this.getopt(this.nodes, opt, this.bigAreas);
    console.log(this.bigAreas);
    this.smallAreaOptions = null;
    this.provinceOptions = null;

  }
  changesmall(opt: any) {
    this.smallAreas = this.bigAreas.filter(item => item.id == opt)[0].children;
    //  this.smallAreas = this.getopt(this.groups, opt, this.smallAreas);
    this.provinceOptions = null;
  }
  changeprovince(opt: any) {
    this.province = this.smallAreas.filter(item => item.id == opt)[0].children;
    // this.province = this.getopt(this.smallAreas, opt, this.province);
    console.log(this.province)
    console.log(opt)
  }
  lastid: any = null;
  syncid: any = null;
  treeloading: boolean = false;


  log(data: any, opt: any): void {
    switch (opt) {
      case 0: {
        this.groupTypeOptions = data.title;
        if (data.id != null && data.id != undefined) {
          this.syncid = 0;
          this.lastid = 0;
          this.changeGroup(data.id);
        }
        this.areaInfo.levelName = 'GC';
        this.areaInfo.areaName = data.title;
        this.groupDisabled = true;
        break;
      }
      case 1: {
        this.groupOptions = data.title;
        if (data.id != null && data.id != undefined) {
          this.syncid = data.id;
          this.lastid = data.id;
          this.changebig(data.id);
        }
        this.areaInfo.levelName = 'Cycle Group';
        this.areaInfo.areaName = data.title;
        this.bigAreaDisabled = true;
        break;
      }
      case 2: {
        this.bigAreaOptions = data.title;
        if (data.id != null && data.id != undefined) {
          this.lastid = data.id;
          this.changesmall(data.id);
        }
        this.areaInfo.levelName = 'Sales Area';
        this.areaInfo.areaName = data.title;
        this.smallAreaDisabled = true;
        break;
      }
      case 3: {
        if (data.id != null && data.id != undefined) {
          this.syncid = this.lastid;
          this.lastid = data.id;
          this.changeprovince(data.id);
        }

        this.smallAreaOptions = data.title;
        this.areaInfo.levelName = 'Sales District';
        this.areaInfo.areaName = data.title;
        this.provinceDisabled = true;
        break;
      }
      case 4: {
        this.provinceOptions = data.title;
        break;
      }
    }

  }

  saveArea() {
    if (this.provinceOptions != null && this.provinceOptions != undefined && this.provinceOptions != '') {
      this.areaInfo.parentId = this.lastid;
      this.areaInfo.levelName = 'Province';
      this.areaInfo.areaName = this.provinceOptions;
      if (this.province.find(x => x.title == this.areaInfo.areaName)) {
        this.message.error('已存在该名称的区域');
        return;
      }
    } else
      if (this.smallAreaOptions != null && this.smallAreaOptions != undefined && this.smallAreaOptions != '') {
        this.areaInfo.parentId = this.lastid;
        this.areaInfo.levelName = 'Sales District';
        this.areaInfo.areaName = this.smallAreaOptions;
        if (this.smallAreas.find(x => x.title == this.areaInfo.areaName)) {
          this.message.error('已存在该名称的区域');
          return;
        }
      } else
        if (this.bigAreaOptions != null && this.bigAreaOptions != undefined && this.bigAreaOptions != '') {
          this.areaInfo.parentId = this.lastid;
          this.areaInfo.levelName = 'Sales Area';
          this.areaInfo.areaName = this.bigAreaOptions;
          if (this.bigAreas.find(x => x.title == this.areaInfo.areaName)) {
            this.message.error('已存在该名称的区域');
            return;
          }
        } else
          if (this.groupOptions != null && this.groupOptions != undefined && this.groupOptions != '') {
            this.areaInfo.parentId = 1;
            this.areaInfo.levelName = 'Cycle Group';
            this.areaInfo.areaName = this.groupOptions;
            if (this.groups.find(x => x.title == this.areaInfo.areaName)) {
              this.message.error('已存在该名称的区域');
              return;
            }
          }
    const url = '/act/ecom/homepage/addAreaInfo';
    this.http.post(url, this.areaInfo).subscribe(res => {
      if (res.code == '0000') {
        this.message.success('添加成功');
      }
      this.hideDialog();
      this.initRoleList();
      setTimeout(() => {
        this.nodeExpand(this.tree.getTreeNodeByKey(this.lastid));
      }, 1000);
    }, error => {
      this.message.error('请求失败');
    })
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
