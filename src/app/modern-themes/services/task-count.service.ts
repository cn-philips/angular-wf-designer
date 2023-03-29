import { Injectable } from "@angular/core";
import { HttpService } from "@core/services";
import { SpecialApprovalService } from "@pages/special-approval/special-approval.service";
import { WorkspaceListService } from "@pages/workspace/services/workspace-list.service";
import { NzMessageService } from "ng-zorro-antd";
import { Subject } from "rxjs";
enum menusEnum {
  PENDING_TASK,
  DONE_TASK,
  APPLY_REQUEST,
  DRAFT_REQUEST,
  VIEW_REQUEST,
}
@Injectable({
  providedIn: "root",
})
export class TaskCountService {
  constructor(private message: NzMessageService, private http: HttpService) {}
  public subscription = new Subject();
  private isRefreshing: boolean = false;
  public sub = this.subscription.asObservable();
  public async refresh(menu?: menusEnum) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      setTimeout(() => {
        this.getCount();
        this.isRefreshing = false;
      }, 1000);
    }

    this.subscription.next({
      myPending: this.myPending,
      myDone: this.myDone,
      myDraft: this.myDraft,
      myApply: this.myApply,
      myView: this.myView,
    });
  }
  myPending = 0;
  myDone = 0;
  myDraft = 0;
  myApply = 0;
  myView = 0;
  winningbidTask = 0;
  contractSupplementTask = 0;
  thirdSupplementTask = 0;
  omSupplementTask = 0;
  contractSignatureTask = 0;
  private getCount() {
    this.http
      .get(`/act/ecos/home/taskCounts`)
      .subscribe(({ data, code, msg }) => {
        if (code === "0000") {
          {
            let pendingTaskRes = data.find((i) => i.taskName == "todo");
            if (pendingTaskRes) {
              this.myPending = pendingTaskRes.taskCount;
            }
            let doneTaskRes = data.find((i) => i.taskName == "done");
            if (doneTaskRes) {
              this.myDone = doneTaskRes.taskCount;
            }
            let applyTaskRes = data.find((i) => i.taskName == "request");
            if (applyTaskRes) {
              this.myApply = applyTaskRes.taskCount;
            }
            let draftTaskRes = data.find((i) => i.taskName == "draft");
            if (draftTaskRes) {
              this.myDraft = draftTaskRes.taskCount;
            }
          }
          {
            let winningbidTaskRes = data.find(
              (i) => i.taskName == "Winningbid Supplement"
            );
            if (winningbidTaskRes) {
              this.winningbidTask = winningbidTaskRes.taskCount;
            }
            let contractSupplementTaskRes = data.find(
              (i) => i.taskName == "Contract Supplement"
            );
            if (contractSupplementTaskRes) {
              this.contractSupplementTask = contractSupplementTaskRes.taskCount;
            }
            let thirdSupplementTaskRes = data.find(
              (i) => i.taskName == "Third Supplement"
            );
            if (thirdSupplementTaskRes) {
              this.thirdSupplementTask = thirdSupplementTaskRes.taskCount;
            }
            let omSupplementTaskRes = data.find(
              (i) => i.taskName == "OM Supplement"
            );
            if (omSupplementTaskRes) {
              this.omSupplementTask = omSupplementTaskRes.taskCount;
            }
            let contractSignatureTaskRes = data.find(
              (i) => i.taskName == "Contract Signature"
            );
            if (contractSignatureTaskRes) {
              this.contractSignatureTask = contractSignatureTaskRes.taskCount;
            }
          }
        }
      });
  }
}
