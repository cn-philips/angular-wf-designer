import {
  Component,
  OnInit,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  SimpleChange,
} from "@angular/core";
import { NzTreeNode } from "ng-zorro-antd";
import { TreeBoxComponent } from './tree-box/tree-box.component';

@Component({
  selector: "app-transferbox",
  templateUrl: "./transfer-box.component.html",
  styleUrls: ["./transfer-box.component.scss"],
})
export class TransferBoxComponent implements OnInit {
  @ViewChild("leftBox") leftBox: TreeBoxComponent;
  @ViewChild("rightBox") rightBox: TreeBoxComponent;

  @Input() dataList: any = [];
  @Input() value: any = [];
  @Output() onTransToLeft = new EventEmitter();
  hasLoaded: boolean = false;
  isLoading: boolean = true;
  /**
   * 左侧树状图数据
   *
   * @type {NzTreeNode[]}
   * @memberof TransferboxComponent
   */
  public nodes: NzTreeNode[] = [];
  /**
   * 右侧树状图数据
   *
   * @type {NzTreeNode[]}
   * @memberof TransferboxComponent
   */
  public checkOptionsOne: NzTreeNode[] = [];
  constructor() { }
  ngOnChanges(changes: SimpleChange) {
    // 初始化数据集
    if (this.dataList && this.dataList.length > 0) {
      this.isLoading = true;
      this.nodes = [...this.dataList];
      this.reset();
      this.isLoading = false;
    }
    if (changes["dataList"] && this.value && this.value.length > 0) {
      this.isLoading = true;
      setTimeout(() => {
        this.alignSelected();
        this.isLoading = false;
      }, 100);
    }
  }
  private equal(NodeA: NzTreeNode | any, NodeB: NzTreeNode | any) {
    // let idA = NodeA.key + (NodeA.id || NodeA.origin.id);
    // let idB = NodeB.key + (NodeB.id || NodeB.origin.id);
    let idA = NodeA.origin.key;
    let idB = NodeB.origin.key;
    return idA === idB;
  }
  convertToOriginNode(rawObject: any): NzTreeNode {
    // HACK
    let body: any = {};
    for (var key in rawObject) {
      body[key] = rawObject[key];
    }
    if (rawObject.mkey) {
      body.originNode = rawObject;
      body.children = rawObject["productInformations"];
      if (body.children) {
        body.children = body.children.map((cnode) =>
          this.convertToOriginNode(cnode)
        );
      } else {
        body.children = [];
      }
      body.id = rawObject.mkey;
      body.key = rawObject.mkey;
    }
    if (body.id) {
      let arr = body.id.split("-");
      if (arr.length === 6) {
        body.originNode = rawObject;
        arr = arr.splice(0, arr.length - 1);
        body.id = arr.join("-");
        body.key = body.id;
      }
    }
    return new NzTreeNode(body);
  }
  alignSelected() {
    this.value.map((record: any) => {
      let arr = record.productInformations || record.productList;
      if (arr) {
        arr.map((rawNodeOrigin) => {
          rawNodeOrigin.children =
            rawNodeOrigin.children || rawNodeOrigin.productList;
          let targetNode = this.leftBox.getChain(
            this.convertToOriginNode(rawNodeOrigin)
          );
          if (
            this.dataList.find((node) =>
              this.equal(new NzTreeNode(node), targetNode)
            )
          ) {
            targetNode.origin.originNode = rawNodeOrigin;
            this.rightBox.insertNode(targetNode);
            this.leftBox.removeNode(targetNode);
          }
        });
      }
    });
  }
  setDefaultHost() {
    if (!this.hasHost() && this.rightBox.filteredArr.length > 0) {
      let enabledNodesInRight = this.rightBox.filteredArr.filter((cnode: NzTreeNode) => !cnode.isDisableCheckbox)
      if (enabledNodesInRight.length > 0) {
        this.setHost(enabledNodesInRight[0]);
      }
    }
  }
  setHost(node: NzTreeNode) {
    node.origin.checked = true;
    if (node.children.length > 0) {
      node.children.map((cnode) => this.setHost(cnode));
    }
  }
  removeHost(node: NzTreeNode) {
    node.origin.checked = false;
    if (node.children.length > 0) {
      node.children.map((cnode) => this.removeHost(cnode));
    }
  }
  hasHost() {
    return this.rightBox.filteredArr.some((node: NzTreeNode) => {
      var flatNodes = [];
      this.rightBox.flatNode(node, flatNodes);
      return flatNodes.filter((cnode: NzTreeNode) => !cnode.isDisableCheckbox).some((cnode: NzTreeNode) => cnode.origin.checked);
    });
  }
  init() {
    //debugger
    // this.rightBox.filteredArr.map(vals=>{
    //   vals.origin.checked=false;
    //   vals.children.map(val=>{
    //      val.origin.checked=false;
    //   })
    // })
    // this.revert()
  }
  revert() {
    this.isLoading = true;
    this.checkOptionsOne = [];
    this.nodes = [...this.dataList];
    setTimeout(() => {
      this.alignSelected();
      this.isLoading = false;
    }, 100);
  }
  reset() {

    this.isLoading = true;
    this.checkOptionsOne = [];
    this.checkOptionsOne = [...this.checkOptionsOne];
    this.rightBox.updateView();
  }
  /**
   * 从左边删除右边已存在的节点
   *
   * @memberof TransferboxComponent
   */
  removeDuplicateNodesFromRight() {
    this.checkOptionsOne.map((rightNode: NzTreeNode) => {
      this.leftBox.removeNode(this.leftBox.getChain(new NzTreeNode(rightNode)));
    });
  }
  ngOnInit() { }

  /**
   * 向右穿梭
   *
   * @memberof TransferboxComponent
   */
  tranRight() {
    this.leftBox.getCheckedChain().map((node: NzTreeNode) => {
      this.rightBox.insertNode(node);
      this.leftBox.removeNode(node);
    });
  }
  /**
   * 所有节点向右穿梭
   *
   * @memberof TransferboxComponent
   */
  tranAllRight() {
    this.leftBox.filteredArr.map((node: NzTreeNode) => {
      this.rightBox.insertNode(node);
      this.setHost(node);
      this.leftBox.removeNode(node);
    });
  }
  /**
   * 向左穿梭
   *
   * @memberof TransferboxComponent
   */
  tranLeft() {
    this.rightBox.getCheckedChain().map((node: NzTreeNode) => {
      this.leftBox.insertNode(node);
      this.removeHost(node);
      this.rightBox.removeNode(node);
    });
  }
  /**
   * 所有节点向左穿梭
   *
   * @memberof TransferboxComponent
   */
  tranAllLeft() {
    this.rightBox.filteredArr.map((node: NzTreeNode) => {
      if (!node.isDisableCheckbox) {
        this.enableNode(node);
        this.leftBox.insertNode(node);
        this.rightBox.removeNode(node);
      }
    });
  }
  /**
   * 获取结果值
   *
   * @return {*}
   * @memberof TransferboxComponent
   */
  getValue() {
    var result = [];
    this.setDefaultHost();
    this.rightBox.filteredArr.map((PNode) => {
      if (PNode.origin.level === 1) {
        result = result.concat(
          PNode.origin.children.map((cnode) => this.deepCopy(cnode))
        );
      } else {
        result.push(this.deepCopy(PNode.origin));
      }
    });
    return result;
  }
  /** 对象深拷贝
   *
   * @private
   * @param {*} obj
   * @return {*}
   * @memberof TreeboxComponent
   */
  private deepCopy(obj: NzTreeNode | any) {
    var copy = Object.create(Object.getPrototypeOf(obj));
    var propNames = Object.getOwnPropertyNames(obj);
    propNames.forEach(function (name) {
      var desc = Object.getOwnPropertyDescriptor(obj, name);
      Object.defineProperty(copy, name, desc);
    });
    return copy;
  }
  /**
   *  树形禁用与否,@parm 需要禁用的id  @off 传入禁用与否
   */
  isDisabled(parm, off) {
    if (this.leftBox.treeComponent.getTreeNodeByKey(parm)) {
      this.leftBox.treeComponent.getTreeNodeByKey(parm).isDisabled = off;
    }
    const treeData = this.leftBox.treeComponent.getTreeNodes();
    treeData.map((res) => {
      const isDisabled = res.children.every((item) => item.isDisabled == true);
      if (isDisabled) {
        res.isDisabled = true;
      } else {
        res.isDisabled = false;
      }
    });
  }
  /** 双击树节点移到对面树
   * @param {*} node
   * @param {*} arr
   * @memberof TransferboxComponent
   */
  handleDoubleClick(node, arr) {
    if (arr === this.nodes) {
      this.transSpecificNodeToRight(node);
    } else if (arr === this.checkOptionsOne) {
      this.transSpecificNodeToLeft(node);
    }
  }

  transSpecificNodeToLeft(node: NzTreeNode) {
    node = new NzTreeNode(node);
    let targetNodeChain = null;
    this.removeHost(node);
    targetNodeChain = this.rightBox.getChain(node);
    this.leftBox.insertNode(targetNodeChain);
    targetNodeChain = this.rightBox.getChain(node);
    this.enableNode(targetNodeChain);
    this.rightBox.removeNode(targetNodeChain);
  }

  transSpecificNodesToLeft(nodes: NzTreeNode[]) {
    nodes.map((node) => {
      this.transSpecificNodeToLeft(node);
    });
    setTimeout(() => {
      this.alignSelected();
    }, 0);
  }
  transSpecificNodeToRight(node: NzTreeNode) {
    node = new NzTreeNode(node);
    if (!this.hasHost()) {
      this.setHost(node);
    }
    let targetNodeChain = null;
    targetNodeChain = this.leftBox.getChain(node);
    this.rightBox.insertNode(targetNodeChain);
    targetNodeChain = this.leftBox.getChain(node);
    this.leftBox.removeNode(targetNodeChain);
  }
  enableNode(node: NzTreeNode) {
    let rootNode = this.rightBox.getChain(new NzTreeNode(node));
    if (rootNode) {
      this._enableNodeChain(rootNode);
    }
  }
  private _enableNodeChain(node: NzTreeNode, enableLeafNode?: boolean) {
    if (!node.isLeaf || (node.isLeaf && enableLeafNode)) {
      node.isDisableCheckbox = false;
      if (node.children) {
        node.children.map((cnode: NzTreeNode) =>
          this._enableNodeChain(cnode, enableLeafNode)
        );
      }
    }
  }
  disableNode(node: NzTreeNode) {
    // debugger
    let rootNode = this.rightBox.getChain(new NzTreeNode(node));
    if (rootNode) {
      this._disableChain(rootNode);
    }
  }
  private _disableChain(node: NzTreeNode) {
    node.isDisableCheckbox = true;
    if (node.children) {
      node.children.map((cnode: NzTreeNode) => this._disableChain(cnode));
    }
  }
}
