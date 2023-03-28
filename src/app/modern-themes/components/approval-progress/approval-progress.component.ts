import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Route, Router } from "@angular/router";
import { HttpService } from "@core/services";

@Component({
  selector: "app-approval-progress",
  templateUrl: "./approval-progress.component.html",
  styleUrls: ["./approval-progress.component.scss"],
})
export class ApprovalProgressComponent implements OnInit {
  constructor(
    private http: HttpService,
    private activatedRouter: ActivatedRoute
  ) {}
  doneNodes: String[] = ["submit", "approved", "done"];
  pendingNodes: String[] = ["pending"];
  nodeList: any[] = [];
  nodeRawList: any[] = [];
  procInstId: number = 0;
  isShow: boolean = true;
  ngOnInit() {
    this.activatedRouter.queryParams.subscribe((queryParams) => {
      let procInstId = queryParams["procInstId"];
      if (procInstId) {
        this.procInstId = procInstId;
        this.http
          .get(`/act/ecos/processflow/query?procInstId=${this.procInstId}`)
          .subscribe(({ code, data, msg }) => {
            if (code === "0000") {
              this.nodeRawList = data;
              this.nodeList =  this.passedNodeTreeShake(this.nodeRawList);
            } else {
              this.isShow = false;
            }
          });
      }
    });
  }
  // 清理当前步骤之前未启用的
  passedNodeTreeShake(nodeList) {
    let index = this.getLatestStartedNodeIndex(nodeList);
    let result = [];
    if (index >= 0) {
      let arr1 = nodeList.slice(0, index);
      let arr2 = nodeList.slice(index);
      arr1 = arr1.filter((i) => i.state != "not_start");
      result = arr1.concat(arr2);
    }
    return result;
  }
  // 获取最新启用节点的Index
  getLatestStartedNodeIndex(nodeList) {
    let index = -1;
    for (let i = 0; i < nodeList.length; i++) {
      if (nodeList[i].state !== "not_start") {
        index = i;
      }
    }
    return index;
  }
  handleMultipleNodeClick(node) {
    if (node.childNode && node.childNode.length > 0) {
    }
  }
}
