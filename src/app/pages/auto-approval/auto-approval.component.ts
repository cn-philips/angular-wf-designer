import { Component, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd";
import { Router, ActivatedRoute } from "@angular/router";
import { HttpService } from "../../core/services";
import { isTrue } from "@app/utils/StringUtils";

@Component({
  selector: "app-auto-approval",
  templateUrl: "./auto-approval.component.html",
  styleUrls: ["./auto-approval.component.scss"],
})
export class AutoApprovalComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private http: HttpService,
    private router: Router,
    public activatedRouter: ActivatedRoute
  ) {}
  public successOff: any = false;
  public lossOff: any = false;
  public load: any = false;
  public param: any = {
    processInstanceTaskId: "",
    approvalResult: "",
    approvalComments: "",
    phaseTwo: "",
  };
  ngOnInit() {
    this.getInit();
  }
  goHome() {
    localStorage.removeItem("routerInfo");
    this.router.navigate(["/"]);
  }
  getInit() {
    let url = this.activatedRouter.snapshot["_routerState"].url;
    url = url.split("?");
    url = url[0];
    const processInstanceTaskId =
      this.activatedRouter.queryParams["_value"].processInstanceTaskId;
    const approvalResult =
      this.activatedRouter.queryParams["_value"].approvalResult;
    let routerObj: any = {
      url: url,
      processInstanceTaskId: processInstanceTaskId,
      approvalResult: approvalResult,
    };
    //localStorage.setItem("routerInfo", JSON.stringify(routerObj))
    this.param.processInstanceTaskId =
      this.activatedRouter.queryParams["_value"].processInstanceTaskId;
    this.param.approvalResult =
      this.activatedRouter.queryParams["_value"].approvalResult;
    this.param.phaseTwo = this.activatedRouter.snapshot.queryParams.phaseTwo;
      this.activatedRouter.queryParams["_value"].approvalResult;
    this.param.phaseThree =
      this.activatedRouter.snapshot.queryParams.phaseThree;
    this.param.bestSign = this.activatedRouter.snapshot.queryParams.bestSign;
    this.param.flowId = this.activatedRouter.snapshot.queryParams.flowId;
    this.param.roleName = this.activatedRouter.snapshot.queryParams.roleName;
    if (this.param.approvalResult == "REJECTED") {
      const { processInstanceTaskId, approvalResult, phaseTwo, phaseThree,bestSign,roleName ,flowId} =
        this.param;
        let queryParams = {
          queryParams: {
            processInstanceTaskId,
            approvalResult,
            phaseTwo,
            phaseThree,
            bestSign,
            roleName,
            flowId
          },
        }
        if(bestSign){
          queryParams.queryParams['idemKey'] = this.activatedRouter.snapshot.queryParams.idemKey
        }
      this.router.navigate(["/mailApproval"], queryParams);
    } else {
      let url = "";
      if (isTrue(this.param.phaseThree)) {
        url = "/act/ecos/processflow/rapidApproval";
      } else if (isTrue(this.param.phaseTwo)) {
        url = "/act/specialapprove/workflow/rapidApproval";
      } else if(isTrue(this.param.bestSign)){
        this.param.idemKey = this.activatedRouter.snapshot.queryParams.idemKey;
        url = `act/contractSign/${this.param.flowId}/${this.param.roleName}/sign`;
      } else {
        url = `/act/process/rapidApproval`;
      }
      this.http.post(url, this.param).subscribe(
        (res) => {
          if (res.code == "0000") {
            this.successOff = true;
            this.load = false;
            localStorage.removeItem("routerInfo");
          } else {
            this.load = false;
            this.lossOff = true;
            localStorage.removeItem("routerInfo");
            this.message.create("error", `${res.msg} ${res.data}`);
            return;
          }
        },
        (error) => {
          this.message.create("error", "请求失败!");
          // localStorage.removeItem("routerInfo")
        }
      );
    }
  }

}
