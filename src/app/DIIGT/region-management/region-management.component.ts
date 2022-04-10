import {Component, OnInit, ViewChild} from '@angular/core';
import {NzMessageService, NzTreeBase, NzTreeNode} from 'ng-zorro-antd';
import {HttpService} from '../../services';
import {Tree} from '@angular/router/src/utils/tree';
import {RegionManagementTreeComponent} from './components/region-management-tree/region-management-tree.component';

@Component({
  selector: 'app-region-management',
  templateUrl: './region-management.component.html',
  styleUrls: ['./region-management.component.scss']
})
export class RegionManagementComponent implements OnInit {
  constructor(
    private http: HttpService,
    private nzMessageService: NzMessageService,
    private message: NzMessageService,
  ) {}
  @ViewChild('treeComponent') treeCompinent: RegionManagementTreeComponent;
  activeNode:NzTreeNode;

  ngOnInit()  {

  }
  handleTreeChange(node){
    this.activeNode = node
    const tree = new NzTreeBase(this.activeNode.treeService);
    console.log(tree.getTreeNodeByKey('1'));
    // this.getArea();
  }


  nodeExpand(nodes: NzTreeNode){
    switch (nodes.level){
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
      case 2:{
        nodes.parentNode.parentNode.isExpanded = true;
        nodes.parentNode.isExpanded = true;
        nodes.isExpanded = true;
        break;
      }
      case 3:{
        nodes.parentNode.parentNode.parentNode.isExpanded = true;
        nodes.parentNode.parentNode.isExpanded = true;
        nodes.parentNode.isExpanded = true;
        nodes.isExpanded = true;
        break;
      }
      case 4:{
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
}
