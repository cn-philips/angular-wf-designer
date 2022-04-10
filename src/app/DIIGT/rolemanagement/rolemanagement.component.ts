import { Component, OnInit, ViewChild } from '@angular/core';
import { AppService } from '../../app.service';
import { HttpService } from '../../services';
import { Router, ActivatedRoute } from '@angular/router';
import { TblRole, TblRelationRolefunc } from '../../domian';
import { TreeComponent, TreeNode, TreeModel, ITreeOptions, ITreeState, IActionMapping  } from 'angular-tree-component';
import { DataTableColumnCellTreeToggle } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { DebugRenderer2 } from '@angular/core/src/view/services';
import { NzFormatEmitEvent, NzTreeComponent, NzTreeNodeOptions } from 'ng-zorro-antd';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-rolemanagement',
  templateUrl: './rolemanagement.component.html',
  styleUrls: ['./rolemanagement.component.scss']
})
export class RolemanagementComponent implements OnInit {
  @ViewChild('nzTreeComponent') nzTreeComponent: NzTreeComponent;
  //@ViewChild('tree') treeComponent: TreeComponent;
  radioValue:any='true'; //树形是否联动
  listOfRole:any; //角色列表
  selectArr:any=[]; //选中的数组
  selectedValue:any; //选中的角色id
  load:any=false; //加载项
  constructor(private http: HttpService,
    private aRoute: ActivatedRoute,
    private message: NzMessageService,
    private toastrService: ToastrService) {
     this.initList()
  }
  defaultCheckedKeys:any=[];
  //defaultSelectedKeys = ['10012'];
  defaultExpandedKeys:any = [];
  nodes: NzTreeNodeOptions[] = [
    {
      title:'主页',
      key: '110',
      children:[]
    },
    {
      title:'系统管理',
      key: '100',
      children: [
            { title:'角色管理',key:'10010', isLeaf: true },
            { title:'角色权限管理',key:'10011', isLeaf:true},
            { title:'维度树',key:'10012', isLeaf: true },
            { title:'数据字典',key:'10013', isLeaf: true }
      ]
    }
  ];
initList()
{

  this.http.post('/act/role/getRole', {
    pageSize:100,
    pageNo:1,
  }).subscribe(rest => {
    if (rest.code === '0000') {

         if(rest.data)
         {
          const { total, rows } = rest.data;
          this.listOfRole = rows
         }
    }
  });
  let url=`/act/role/getCosJurisdiction`;
  this.load=true;
  this.http.post(url).subscribe(rest=>{
    if(rest.code==="0000")
    {
      this.load=false;
      this.nodes=rest.data;
      this.treeDate(this.nodes)
    }
  })
}
changes()
{
  this.defaultCheckedKeys=[];
  let url=`/act/role/getRelation?id=${this.selectedValue}`;
  this.load=true;
  this.http.get(url).subscribe(rest=>{
    if(rest.code==="0000")
    {
      this.load=false;
      let arr=rest.data.map(val=>{
        return val.jurisdictionId;
      })
      this.defaultCheckedKeys=Object.assign([],arr);
    }
  })
}
  /*
    *  树形递归调用
    */
  treeDate(data) {
    if (data) {
      data.map(res => {
        res.title=res.jurisdictionName;
        res.key=res.id;
        !res.children&&(res.isLeaf=true);
        this.treeDate(res.children)
      })
    }
}
/**
 *  查询的时候的递归;
*/
seachTreeDate(data) {
  if (data.length)
  {
    data.map(res => {
      res.isChecked===true&&this.selectArr.push(res.key);
      this.seachTreeDate(res.children);
    })
  }
}
updateRole()
{
    this.selectArr=[];
    const checked=this.nzTreeComponent.getCheckedNodeList();
    this.seachTreeDate(checked);
    this.selectArr = this.getRedArr(this.selectArr);
    let url=`/act/role/saveRelation`;
    let parm={
      roleid:this.selectedValue, //角色id
      menu:this.selectArr  //菜单id
    }
    if(parm.roleid==""||parm.roleid==undefined||parm.roleid==null)
    {
      this.message.create("warning","请选择角色");
      return;
    }
    this.load=true;
    this.http.post(url,parm).subscribe(rest=>{
      if(rest.code==="0000")
      {
        this.load=false;
        this.message.create("success",rest.msg);
      }
    })
}
getRedArr(arr) {
  let arr1 = arr.reduce((ar, cur) => {
      if (!ar.includes(cur)) {
          ar.push(cur)
      }
      return ar
  }, [])
  return arr1
}

  ngOnInit() {
  }












}
