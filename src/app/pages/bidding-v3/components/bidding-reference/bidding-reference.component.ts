import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RouterExtendService } from "@app/modern-themes/services/router-extend.service";
import { codeString } from "assets/js/tools";

type Data = {
  version: string;
  applyId: string;
  processInstanceId: string;
  processStatus: string;
  referenceId: string;
};

@Component({
  selector: "bidding-v3-bidding-reference",
  templateUrl: "bidding-reference.component.html",
  styleUrls: ["bidding-reference.component.scss"],
})
export class BiddingReferenceComponent implements OnInit {
  @Input() data: Data[] = [];
  constructor(
    private routerExt: RouterExtendService,
    private activatedRoute: ActivatedRoute
  ) {}

  referenceId

  ngOnInit() {
    const {
      queryParams: { referenceId },
    } = this.activatedRoute.snapshot;
    this.referenceId = referenceId
  }

  // 跳转到其他投标页面
  goBiddingPage(data: Data) {
    const { applyId, processInstanceId, processStatus, referenceId, version } = data;

    if (version === 'v3') {
      this.routerExt.navigateWithNewWindow(["/bidding-v3", applyId], {
        queryParams: {
          referenceId,
          procInstId: processInstanceId,
          processStatus,
        },
      });
    } else if (version === 'v1'){
      this.routerExt.navigateWithNewWindow(["/bidding/bid"], {
        queryParams: {
          id: codeString(applyId),
          status: processStatus,
          procInstId: processInstanceId,
        },
      })
    }
  }
}
