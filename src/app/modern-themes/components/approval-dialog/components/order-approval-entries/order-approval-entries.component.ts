import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { HttpService } from "@core/services";
import { NzMessageService } from "ng-zorro-antd";

@Component({
  selector: "app-order-approval-entries",
  templateUrl: "./order-approval-entries.component.html",
  styleUrls: ["./order-approval-entries.component.scss"],
})
export class OrderApprovalEntriesComponent implements OnInit {
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
        `/act/ecos/home/orderApplyCheck?dealFormId=${this.form.controls.dealFormId.value}`
      )
      .subscribe(
        ({ data, code, msg }) => {
          if (code === "0000") {
            if (data.valid) {
              switch (data.phase) {
                case "CP1":
                  this.router.navigate(["/pre-order"], {
                    skipLocationChange: false,
                    queryParams: { _DEALFORMID: data.dealFormId },
                  });
                  break;
                case "CP2":
                  this.router.navigate(["/order-v3"], {
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
