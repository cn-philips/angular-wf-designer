import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { HttpService } from "@core/services";
import { NzMessageService } from "ng-zorro-antd";
@Component({
  selector: "app-prebook-approval-entries",
  templateUrl: "./prebook-approval-entries.component.html",
  styleUrls: ["./prebook-approval-entries.component.scss"],
})
export class PrebookApprovalEntriesComponent implements OnInit {
  @Input("backgroundColor")
  backgroundColor: string = "#FF7F97";
  form: FormGroup;
  isLoading: boolean = false;
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private message: NzMessageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      dealFormId: ["", [Validators.required]],
    });
  }
  handleImport() {
    this.isLoading = true;
    this.http
      .get(
        `/act/ecos/home/prebookApplyCheckByDealFormId?dealFormId=${this.form.controls.dealFormId.value}`
      )
      .subscribe(
        ({ data, code, msg }) => {
          if (code === "0000") {
            if (data.valid) {
              switch (data.phase) {
                case "CP1":
                  this.router.navigate(["/pre-book"], {
                    skipLocationChange: false,
                    queryParams: { _DEALFORMID: data.dealFormId },
                  });
                  break;
                case "CP2":
                  this.router.navigate(["/prebook-v3"], {
                    skipLocationChange: false,
                    queryParams: { _DEALFORMID: data.dealFormId },
                  });
                  break;
              }
            } else {
              this.message.create("error", data.errorMessage);
              this.isLoading = false;
            }
          } else {
            this.message.create("error", msg);
            this.isLoading = false;
          }
        },
        (err) => {
          this.message.create("error", err);
          this.isLoading = false;
        }
      );
  }
  public reset() {
    this.form.reset();
  }
}
