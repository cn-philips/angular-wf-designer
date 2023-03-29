import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChange,
  ViewChild
} from "@angular/core";
import { NzFormatEmitEvent, NzTreeComponent, NzTreeNode } from "ng-zorro-antd";

@Component({
  selector: "app-treebox",
  templateUrl: "./tree-box.component.html",
  styleUrls: ["./tree-box.component.scss"],
})
export class TreeBoxComponent implements OnInit {
  constructor() { }
  @ViewChild("nzTreeComponent") treeComponent: NzTreeComponent;

  @Input() data: NzTreeNode[];
  @Input() dataSet: NzTreeNode[];
  @Output() onInsert = new EventEmitter<NzTreeNode>();
  @Output() onRemove = new EventEmitter<NzTreeNode>();
  @Output() onUpdate = new EventEmitter<NzTreeNode>();
  @Output() onDBClick = new EventEmitter<NzTreeNode>();
  /**
   * 源数据数组
   *
   * @type {NzTreeNode[]}
   * @memberof TreeboxComponent
   */
  originArr: NzTreeNode[] = [];
  /**
   * 树状图内数节点据数组
   *
   * @type {NzTreeNode[]}
   * @memberof TreeboxComponent
   */
  filteredArr: NzTreeNode[] = [];
  defaultCheckedKeys = ["1001", "1002"];
  ngOnInit() { }

  ngOnChanges(change: SimpleChange) {
    if (change["data"]) {
      this.filteredArr = this.data.map((node) => new NzTreeNode(node));
      this.filteredArr.map((cnode: NzTreeNode) => this.removeLeafNode(cnode));
    }
    if (change["dataSet"]) {
      this.originArr = [
        ...this.originArr,
        ...this.dataSet.map((node) => new NzTreeNode(node)),
      ];
      // 去重
      this.originArr = this.originArr.filter(
        (node: NzTreeNode, index: number) =>
          index ===
          this.originArr.findIndex(
            (cnode: NzTreeNode) => cnode.origin.key === node.origin.key
          )
      );
      this.originArr.map((cnode: NzTreeNode) => this.removeLeafNode(cnode));
    }
    this.updateView();
  }
  removeLeafNode(node: NzTreeNode) {
    if (node.children.length > 0 && !node.isLeaf) {
      node.children.map((cnode: NzTreeNode) => this.removeLeafNode(cnode));
    } else {
      if (node.parentNode) {
        if (node.level > 1) {
          node.parentNode.clearChildren();
          node.parentNode.isLeaf = false;
        }
      }
    }
  }
  /** 点击条目名字时触发选择
   *
   * @param {NzFormatEmitEvent} event
   * @memberof TreeboxComponent
   */
  nzClick(event: NzFormatEmitEvent): void {
    let isChecked = !event.node.isChecked;
    this.checkAllChild(isChecked, event.node);
    this.checkAllParent(isChecked, event.node);
  }
  /** 同步点击节点的子节点
   *
   * @param isChecked
   * @param node
   */
  checkAllChild(isChecked: boolean, node: NzTreeNode) {
    if (!node.isDisableCheckbox) {
      node.isChecked = isChecked;
      node.children.map((cnode: NzTreeNode) => {
        this.checkAllChild(isChecked, cnode);
      });
    }
  }
  /** 同步点击节点的父节点，如果该父节点下所有子节点为已选，则父节点checked
   *
   * @param isChecked
   * @param node
   */
  checkAllParent(isChecked: boolean, node: NzTreeNode) {
    if (node.parentNode) {
      if (
        node.parentNode.children.every(
          (cnode: NzTreeNode) => cnode.isChecked === isChecked
        )
      ) {
        node.parentNode.isChecked = isChecked;
        this.checkAllParent(node.parentNode.isChecked, node.parentNode);
      } else if (
        node.parentNode.children.some(
          (cnode: NzTreeNode) => cnode.isChecked === true
        )
      ) {
        node.parentNode.isHalfChecked = true;
        this.checkAllParent(node.parentNode.isChecked, node.parentNode);
      }
    } else {
      if (node.children.some((cnode: NzTreeNode) => cnode.isChecked === true)) {
        node.isHalfChecked = true;
        node.isChecked = false;
      }
      if (
        node.children.every((cnode: NzTreeNode) => cnode.isChecked === true)
      ) {
        node.isHalfChecked = false;
        node.isChecked = true;
      }
      if (
        node.children.every((cnode: NzTreeNode) => cnode.isChecked === false)
      ) {
        node.isHalfChecked = false;
        node.isChecked = false;
      }
    }
  }
  /** 插入指定节点链
   *
   * @param {NzTreeNode} node
   * @memberof TreeboxComponent
   */
  public insertNode(node: NzTreeNode) {
    this.cancelAllCheck(node);
    let existedNode = this.filteredArr.find((cnode: NzTreeNode) =>
      this.equal(cnode, node)
    );
    if (existedNode) {
      this.mergeNodeChain(existedNode, node);
    } else {
      let foundFlag = false;
      // HACK 兼容无Simulation层
      this.originArr.map((topNode) => {
        topNode.children.map((cnode) => {
          if (!foundFlag) {
            if (this.equal(cnode, node)) {
              foundFlag = true;
              let top = this.deepCopy(topNode);

              //console.group('insertNode')
              top.children = [this.deepCopy(node)];
              //console.log(top.children)
              //console.groupEnd()
              node = top;
            }
          }
        });
      });
      if (foundFlag) {
        this.insertNode(node);
      } else {
        this.filteredArr.push(node);
      }
    }
    this.updateView();
  }
  /** 合并两节点的子节点链
   * @out {NzTreeNode} NodeNeedToMerge
   * @param {NzTreeNode} NodeNeedToMerge 根节点
   * @param {NzTreeNode} NodeWillBeMerged 根节点
   * @memberof TreeboxComponent
   */
  public mergeNodeChain(
    NodeNeedToMerge: NzTreeNode,
    NodeWillBeMerged: NzTreeNode
  ) {
    NodeWillBeMerged.children.map((cnode: NzTreeNode) => {
      let targetNode = NodeNeedToMerge.children.find((tcnode: NzTreeNode) =>
        this.equal(tcnode, cnode)
      );
      if (targetNode) {
        this.mergeNodeChain(targetNode, cnode);
      } else {
        NodeNeedToMerge.children.push(cnode);
      }
    });
  }
  /** 递归取消所有选择（用于切换方向后）
   * @private
   * @param {NzTreeNode} node
   * @memberof TreeboxComponent
   */
  public cancelAllCheck(node: NzTreeNode) {

    if (node.children && node.children.length > 0) {
      node.children.map((cnode: NzTreeNode) => {
        this.cancelAllCheck(cnode);
      });
    }
    node.isChecked = false;
    node.isHalfChecked = false;
    node.isSelected = false;

  }
  /** 移除节点链
   *
   * @param {NzTreeNode} node 根节点
   * @memberof TreeboxComponent
   */
  public removeNode(node: NzTreeNode) {
    this.cancelAllCheck(node);
    let rootNode = this.filteredArr.find((cnode: NzTreeNode) =>
      this.equal(cnode, node)
    );
    if (rootNode) {
      this.removeNodeChain(node, rootNode);
      if (rootNode.children.length === 0) {
        this.filteredArr = this.filteredArr.filter(
          (rnode) => !this.equal(rnode, rootNode)
        );
      }
    }
    this.updateView();
  }
  /** 是否有兄弟节点
   * @param {NzTreeNode} node
   * @return {*}
   * @memberof TreeboxComponent
   */
  public hasSiblingNode(node: NzTreeNode) {
    return (
      node.parentNode.children.filter((cnode) => !this.equal(cnode, node))
        .length > 0
    );
  }
  /** 删除目标链
   * @param {NzTreeNode} RemovingNodeChain
   * @param {NzTreeNode} FromNodeTree
   * @memberof TreeboxComponent
   */
  public removeNodeChain(
    RemovingNodeChain: NzTreeNode,
    FromNodeTree: NzTreeNode
  ) {
    // 待删除节点数组
    let removingTempArr = [];
    this.flatNode(RemovingNodeChain, removingTempArr);
    // 目标节点数组
    let targetTempArr = [];
    this.flatNode(FromNodeTree, targetTempArr);
    targetTempArr.map((cnode: NzTreeNode) => {
      if (removingTempArr.some((tcnode) => this.equal(cnode, tcnode))) {
        cnode.origin.isDeleting = true;
      }
      // 叶节点不删除
      if (cnode.isLeaf) {
        cnode.origin.isDeleting = false;
      }
    });
    //标记是否需要删除
    targetTempArr.map((cnode: NzTreeNode) => {
      if (cnode.parentNode) {
        // 非根节点, 如果有兄弟节点，则不删除 // BUG
        if (this.hasSiblingNode(cnode)) {
          // if(cnode.isLeaf){

          // }
          // 如果是次节点，父节点是根节点，不删除
          if (!cnode.parentNode.parentNode) {
            cnode.parentNode.origin.isDeleting = false;
          }
        }
      }
    });
    targetTempArr
      .sort((pre, next) => next.level - pre.level)
      .map((cnode: NzTreeNode) => {
        if (cnode.origin.isDeleting || !cnode.parentNode) {
          if (cnode.parentNode) {
            if (!cnode.parentNode.origin.isDeleting) {
              //console.group('removeNodeChain')
              cnode.parentNode.children = cnode.parentNode.children.filter(
                (tcnode: NzTreeNode) => !this.equal(cnode, tcnode)
              );
              //console.log(cnode.parentNode.children)
              //console.groupEnd()
            }
          } else {
            this.filteredArr = this.filteredArr.filter(
              (rnode) => !this.equal(cnode, rnode)
            );
          }
        }
      });

    targetTempArr.map((cnode: NzTreeNode) => {
      delete cnode.origin.isDeleting;
    });
  }
  /** 深搜索
   * @private
   * @param {NzTreeNode} node
   * @param {NzTreeNode} InNode
   * @param {NzTreeNode} [PNode]
   * @return {*}  {NzTreeNode}
   * @memberof TreeboxComponent
   */
  private searchDeepNode(
    node: NzTreeNode,
    InNode: NzTreeNode,
    PNode?: NzTreeNode
  ): NzTreeNode {
    let result = null;
    if (this.equal(node, InNode)) {
      result = InNode;
    } else {
      let hasFound = false;
      if (InNode.children)
        InNode.children.map((cnode: NzTreeNode) => {
          if (!hasFound) {
            result = this.searchDeepNode(node, cnode, node);
            if (result) hasFound = true;
          }
        });
    }
    if (result) {
      if (PNode) {
        if (!this.equal(result, PNode)) {
          result.parentNode = PNode;
        }
      }
      if (!result.children) {
        result.children = [];
      }
    }
    return result;
  }

  /** 更新视图
   * @private
   * @memberof TreeboxComponent
   */
  public updateView() {
    this.filteredArr = [...this.filteredArr];
  }
  /** 两个Node是否一致
   * @private
   * @param {(NzTreeNode | any)} NodeA
   * @param {(NzTreeNode | any)} NodeB
   * @return {*}
   * @memberof TreeboxComponent
   */
  private equal(NodeA: NzTreeNode | any, NodeB: NzTreeNode | any) {
    // let idA = NodeA.key + (NodeA.id || NodeA.origin.id);
    // let idB = NodeB.key + (NodeB.id || NodeB.origin.id);
    let idA = NodeA.origin.key;
    let idB = NodeB.origin.key;
    return idA === idB;
  }
  /** 判断两节点是否不同
   * @private
   * @param {(NzTreeNode | any)} NodeA
   * @param {(NzTreeNode | any)} NodeB
   * @return {*}
   * @memberof TreeboxComponent
   */
  private notEqual(NodeA: NzTreeNode | any, NodeB: NzTreeNode | any) {
    // let idA = NodeA.key + (NodeA.id || NodeA.origin.id);
    // let idB = NodeB.key + (NodeB.id || NodeB.origin.id);
    let idA = NodeA.origin.key;
    let idB = NodeB.origin.key;
    return idA !== idB;
  }
  /** 展开树
   * @private
   * @param {NzTreeNode} Node
   * @param {NzTreeNode[]} arr
   * @memberof TreeboxComponent
   */
  public flatNode(Node: NzTreeNode, arr: NzTreeNode[]) {
    arr.push(Node);
    if (Node.children)
      Node.children.map((cnode: NzTreeNode) => {
        this.flatNode(cnode, arr);
      });
  }

  /** 获取完整选择链
   * @returns {NzTreeNode} 返回的为根节点
   */
  public getCheckedChain(): NzTreeNode[] {
    var rootNodes = [
      ...this.treeComponent.getCheckedNodeList().filter((i) => i.level === 0),
      ...this.treeComponent
        .getHalfCheckedNodeList()
        .filter((i) => i.level === 0),
    ];
    rootNodes = rootNodes.map((node: NzTreeNode) => {
      return this.removeUncheckedNode(node);
    });
    return rootNodes;
  }
  /** 获取节点链条
   * @param {NzTreeNode} node
   * @return {*}  {NzTreeNode}
   * @memberof TreeboxComponent
   */
  public getChain(node: NzTreeNode): NzTreeNode {
    let tempNode = this.deepCopy(node);
    if (tempNode.parentNode) {
      let parentNode = this.deepCopy(tempNode.parentNode);
      //console.group('getChain')
      parentNode.children = parentNode.children.filter((cnode: NzTreeNode) =>
        this.equal(cnode, node)
      );
      //console.log(parentNode.children)
      //console.groupEnd()
      return this.getChain(parentNode);
    } else {
      let originNode = null;
      let hasFound = false;
      this.filteredArr.map((onode) => {
        if (!hasFound) {
          originNode = this.searchDeepNode(node, onode);
          if (originNode) {
            hasFound = true;
          }
        }
      });
      if (originNode) {
        if (!originNode.parentNode) {
          return originNode;
        } else {
          return this.getChain(originNode);
        }
      } else {
        return tempNode;
      }
    }
  }
  /** 获取移除所有未选择的非叶子节点的深拷贝
   *
   * @private
   * @param {NzTreeNode} node
   * @return {*}  {NzTreeNode}
   * @memberof TreeboxComponent
   */
  private removeUncheckedNode(node: NzTreeNode): NzTreeNode {
    let tempNode = this.deepCopy(node);
    if (tempNode.children.length > 0) {
      //console.group('removeUncheckedNode 1')
      tempNode.children = tempNode.children.filter(
        (cnode: NzTreeNode) => cnode.isLeaf || cnode.isChecked
      );
      //console.log(tempNode.children)
      tempNode.children = tempNode.children.map((cnode: NzTreeNode) => {
        return this.removeUncheckedNode(cnode);
      });
      //console.log(tempNode.children)
      //console.groupEnd()
    }
    return tempNode;
  }
  /** 对象深拷贝
   *
   * @private
   * @param {*} obj
   * @return {*}
   * @memberof TreeboxComponent
   */
  public deepCopy(obj: NzTreeNode) {
    var copy = Object.create(Object.getPrototypeOf(obj));
    var propNames = Object.getOwnPropertyNames(obj);
    propNames.forEach(function (name) {
      var desc = Object.getOwnPropertyDescriptor(obj, name);
      Object.defineProperty(copy, name, desc);
    });
    return copy;
  }
  /** 双击事件
   * @private
   * @param {*} event
   * @memberof TreeboxComponent
   */
  public nzDbClick(event) {
    !event.node.isDisableCheckbox &&
      !event.node.isDisabled &&
      this.onDBClick.emit(event.node);
  }
  //清除树形选择
  cancelACheck() {
    let getTreeNodes = this.treeComponent.getTreeNodes();
    getTreeNodes.map(vals => {
      vals.isChecked = false;
      vals.children.map(val => {
        val.isChecked = false;
      })
    })
  }
}
