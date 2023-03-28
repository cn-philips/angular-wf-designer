import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from "@angular/forms";

import { NzMessageService, UploadFile } from "ng-zorro-antd";
import { environment } from "../../../environments/environment";
import { Router, ActivatedRoute } from "@angular/router";
import { HttpService } from "@core/services";
@Component({
  selector: "app-mail-approval",
  templateUrl: "./mail-approval.component.html",
  styleUrls: ["./mail-approval.component.scss"],
})
export class MailApprovalComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private http: HttpService,
    private router: Router,
    public activatedRouter: ActivatedRoute
  ) {}

  public validateForm: FormGroup;
  public load: any = false;
  public nzLoading: any = false;
  public successOff: any = false;
  public lossOff: any = false;
  public messageInfo: any;
  public param: any = {
    processInstanceTaskId: "",
    approvalResult: "",
    approvalComments: "",
    phaseTwo: "",
    phaseThree: "",
  };

  ngOnInit() {
    this.validateForm = this.fb.group({
      approvalComments: new FormControl({ value: "" }, Validators.required),
    });
    this.getInit();
  }
  getInit() {
    this.param.processInstanceTaskId =
      this.activatedRouter.queryParams["_value"].processInstanceTaskId;
    this.param.approvalResult =
      this.activatedRouter.queryParams["_value"].approvalResult;
    this.param.phaseTwo = this.activatedRouter.queryParams["_value"].phaseTwo;
    this.param.phaseThree =
      this.activatedRouter.queryParams["_value"].phaseThree;
  }
  goHome() {
    localStorage.removeItem("routerInfo");
    this.router.navigate(["/"]);
  }
  public checkFormData = () => {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    return this.validateForm.valid;
  };
  handleOkWinCheck() {
    const valid = this.checkFormData();
    if (!valid) {
      return;
    }
    this.nzLoading = true;
    let url = "";
    if (this.param.phaseThree === "true") {
      url = "/act/ecos/processflow/rapidApproval";
    } else if (this.param.phaseTwo === "true") {
        url = "/act/specialapprove/workflow/rapidApproval";
    } else {
      url = `/act/process/rapidApproval`;
    }
    this.http.post(url, this.param).subscribe(
      (res) => {
        if (res.code == "0000") {
          this.nzLoading = false;
          this.successOff = true;
          localStorage.removeItem("routerInfo");
          return;
        } else {
          this.nzLoading = false;
          this.lossOff = true;
          this.messageInfo = res.msg;
          this.message.create("error", `${res.msg} ${res.data}`);
          localStorage.removeItem("routerInfo");
          return;
        }
      },
      (error) => {
        this.nzLoading = false;
        this.message.create("error", "请求失败!");
        localStorage.removeItem("routerInfo");
        return;
      }
    );
  }
}
