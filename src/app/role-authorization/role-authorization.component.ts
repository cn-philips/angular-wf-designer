import { Component, OnInit, ViewChild } from '@angular/core';
import { AppService } from '../app.service';
import { HttpService } from '../services';
import { Router, ActivatedRoute } from '@angular/router';
import { TblRole, TblRelationRolefunc } from '../domian';
import { TreeComponent, TreeNode, TreeModel, ITreeOptions, ITreeState, IActionMapping  } from 'angular-tree-component';
import { DataTableColumnCellTreeToggle } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { DebugRenderer2 } from '@angular/core/src/view/services';

@Component({
  selector: 'role-authorization',
  templateUrl: './role-authorization.component.html',
  styleUrls: [
    './role-authorization.component.scss',
    '../../vendor/libs/ng-select/ng-select.scss'
  ]
  // styles: [`.ace {}`]
})
export class RoleAuthorizationComponent implements OnInit {
  @ViewChild('tree') treeComponent: TreeComponent;

  mainFunctionUrl: string;
  roleList: TblRole[] = [];
  selectedRole: TblRole = new Object() as TblRole;
  selectedRelation: TblRelationRolefunc = new Object() as TblRelationRolefunc;
  menuList: any =[];
  menuNodeList: any =[];
  allTreeNodeIds =[];
  selectedTreeNodeIds =[];

  treeOptions: ITreeOptions = {
    useCheckbox: true,
    useTriState: false
  };
  state: ITreeState;
  tempSelectedLeafNodeIds;

  constructor(private http: HttpService,
    private aRoute: ActivatedRoute,
    private toastrService: ToastrService) {

      this.mainFunctionUrl = "/act" + "/role/queryRole";
      // this.mainFunctionUrl = "/act" + "/relation/queryAll";
      this.getRoleList();
      this.getMenuNodeList();
  }

  getRoleList(){
    const uri = this.mainFunctionUrl;
    this.http.get(uri).subscribe(res =>{
      if('0000'==res.code){
        // console.log('getRoleList', res.data)
        this.roleList = res.data==null?[]:res.data;
      } else {
        this.toastrService.error(res.msg);

      }
    });
  }

  onInitialized(tree) {
    setTimeout(() => {
      tree.treeModel.expandAll();
    },1000);
  }

  selectCheckboxInTree(nodes, treeModel, funcIds){
    for(let i=0;i<funcIds.length;i++){
      for(let node of nodes) {
        if(funcIds[i] == node.id) {
          treeModel.getNodeById(node.id).setIsSelected(true);
        }
        if(node.children != null && node.children.length > 0) {
          this.selectCheckboxInTree(node.children, treeModel, funcIds);
        }
      }
    }
  }

  deselectAllCheckboxInTree(nodes, treeModel){
    for(const node of nodes) {
      treeModel.getNodeById(node.id).setIsSelected(false);
      if(node.children != null && node.children.length > 0) {
        this.deselectAllCheckboxInTree(node.children, treeModel);
      }
    }
  }

  onClearRole(){
    this.selectedRole = new Object() as TblRole;
  }

  onChangeRole(event){
    console.log(event);
    const treeModel: TreeModel = this.treeComponent.treeModel;
    const nodes = treeModel.nodes;
    this.deselectAllCheckboxInTree(nodes, treeModel);
    if(null != event){
      const thisRoleFuncIds = JSON.parse(event['func_id'])
      // this.selectCheckboxInTree(nodes, treeModel, thisRoleFuncIds);
      this.updateState(thisRoleFuncIds);
    }
  }

  updateState (funcIds) {
    // console.log(funcIds);
    this.state = {};
    const selectedLeafNodeIds = {};

    for(let id of funcIds) {
      selectedLeafNodeIds [id] = true;
    }
    this.state = {
      selectedLeafNodeIds 
    }
    this.tempSelectedLeafNodeIds = selectedLeafNodeIds;
    setTimeout(() => {
      this.treeComponent.treeModel.expandAll();
    }, 50)
  }

  getMenuNodeList(){
    this.http.get('/act/queryMenu').subscribe(res =>{
      if('0000' == res.code) {
        const menusRaw = res.data==null?[]:res.data;
        this.menuNodeList = this.genTreeNodesFromMenuList(menusRaw);
        // console.log(this.genTreeNodesFromMenuList(menusRaw));
        console.log('getMenuNodeList', this.menuNodeList);
      }
    });
  }

  genTreeNodesFromMenuList (event, pid?) : any[]{
    let treeNodes = [];
    if(event != []) {
      for(let i=0;i<event.length;i++){
        let node = {};
        node['id'] = event[i]['value']['id'];
        if(pid) {
          node['pid'] = pid;
        }
        // node['checked'] = false;
        this.allTreeNodeIds.push(event[i]['value']['id']);
        node['name'] = event[i]['value']['name'];
        if(event[i]['childs'].length >0){
          node['children'] = this.genTreeNodesFromMenuList(event[i]['childs'], event[i]['value']['id']);
        }
        treeNodes.push(node);
      }
    }
    return treeNodes;
  }

  ngOnInit() {
  }

  onSelectNode(event, checked:boolean) {
    console.log(event.node);
    // console.log(this.menuNodeList);
    this.tempSelectedLeafNodeIds = this.state.selectedLeafNodeIds;
    this.updateChildNodeCheckbox(event.node, checked);
    this.updateParentNodeCheckbox(event.node.realParent);
    setTimeout(()=>{
      this.state = {
        ...this.state,
        selectedLeafNodeIds: this.tempSelectedLeafNodeIds
      };
      console.log('onSelectNode',this.state.selectedLeafNodeIds);
    },50);
  }


  public updateChildNodeCheckbox(node, checked) {
    this.tempSelectedLeafNodeIds[node.data.id] = checked;
    if (node.children) {
      node.children.forEach((child) => this.updateChildNodeCheckbox(child, checked));
    }
  }

  public updateParentNodeCheckbox(node) {
    if (!node) {
      return;
    }

    let allChildrenChecked = true;
    let noChildChecked = true;

    for (const child of node.children) {
      if (!this.tempSelectedLeafNodeIds[child.data.id]) {
        allChildrenChecked = false;
      }
      if (this.tempSelectedLeafNodeIds[child.data.id]) {
        noChildChecked = false;
      }
    }

    if (allChildrenChecked) {
      this.tempSelectedLeafNodeIds[node.data.id] = true;
    } else if (noChildChecked) {
      this.tempSelectedLeafNodeIds[node.data.id] = false;
    } else {
      this.tempSelectedLeafNodeIds[node.data.id] = true;
    }

    if(node.realParent != null){//如果是根node，不再循环
      this.updateParentNodeCheckbox(node.parent);
    }
  }


  updateSelectedLeafNodeIds({id,pid,children}, checkded){
    let selectedLeafNodeIds = this.state['selectedLeafNodeIds'] == null ? {} : this.state['selectedLeafNodeIds'];
    selectedLeafNodeIds[id] = checkded;
    


  }

  updateRole(){
    if(null != this.selectedRelation.role_code) {
      // console.log(this.selectedRole);

      let data = {};
      data['tableName'] = 'tbl_relation_rolefunc';
      data['rolecode'] = this.selectedRelation.role_code;

      // console.log('updateRole',this.state);
      // console.log('updateRole', this.menuNodeList);

      let funcIdArr = [];
      if (this.state && Object.keys(this.state['selectedLeafNodeIds']).length >0){
        for (let key in this.state['selectedLeafNodeIds']) {
          if (this.state['selectedLeafNodeIds'][key]){
            funcIdArr.push(key)
          }
        }
      }
      const funcIdFinalStr = '[' + funcIdArr.toString() + ']';
      data['funcId'] = funcIdFinalStr;
      this.selectedRelation['funcId'] = funcIdFinalStr;
      let newData = {};
      for(var camel in this.selectedRelation) {
        newData[this.camelToUnderscore(camel)] = this.selectedRelation[camel];
      }
      // data['data'] = JSON.stringify(newData,this.replacer);

      let url = '/act/relation/updateRelation?'; 
      url += Object.keys(data).map(function(k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
      }).join('&');
      console.log(url);

      this.http.get(url).subscribe(res=>{
        if('0000'==res.code){
          this.toastrService.success('保存成功');
          location.reload();
        }

      });
    }else {// 未选择角色时提示
      this.toastrService.warning('请选择 Role');
    }
  }

  replacer(key,value){
    if (key=='id') return undefined;
    else return value;
  }

  //camelCase to snake_case
  camelToUnderscore(key) {
    return key.replace( /([A-Z])/g, "_$1" ).toLowerCase();
  }
  
}
