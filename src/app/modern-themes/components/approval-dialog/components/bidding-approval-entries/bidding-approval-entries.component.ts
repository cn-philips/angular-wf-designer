import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { HttpService } from "@core/services";
import { NzMessageService } from "ng-zorro-antd";

@Component({
  selector: "app-bidding-approval-entries",
  templateUrl: "./bidding-approval-entries.component.html",
  styleUrls: ["./bidding-approval-entries.component.scss"],
})
export class BiddingApprovalEntriesComponent implements OnInit {
  @Input("backgroundColor")
  backgroundColor: string = "#FF7F97";

  isLoading: boolean = false;
  dealForm: FormGroup;
  simulationForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private message: NzMessageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.dealForm = this.fb.group({
      dealFormId: ["", [Validators.required]],
    });
    this.simulationForm = this.fb.group({
      simulationId: ["", [Validators.required]],
    });
  }

  handleImportBySimulationId() {
    this.isLoading = true;
    this.http
      .get(
        `/act/ecos/home/biddingApplyCheckBySimulationId?simulationId=${this.simulationForm.controls.simulationId.value}`
      )
      .subscribe(
        ({ data, code, msg }) => {
          if (code === "0000") {
            if (data.valid) {
              switch (data.phase) {
                case "CP1":
                  this.router.navigate(["/bidding"], {
                    skipLocationChange: false,
                    queryParams: { _SIMULATIONID: data.simulationFormId },
                  });
                  break;
                case "CP2":
                  this.router.navigate(["/bidding-v3"], {
                    skipLocationChange: false,
                    queryParams: { _SIMULATIONID: data.simulationFormId },
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
    console.log("click handleImportBySimulationId");
  }
  handleImportByDealFormId() {
    this.isLoading = true;
    this.http
      .get(
        `/act/ecos/home/biddingApplyCheckByDealFormId?dealFormId=${this.dealForm.controls.dealFormId.value}`
      )
      .subscribe(
        ({ data, code, msg }) => {
          if (code === "0000") {
            if (data.valid) {
              switch (data.phase) {
                case "CP1":
                  this.router.navigate(["/bidding"], {
                    skipLocationChange: false,
                    queryParams: { _DEALFORMID: data.dealFormId },
                  });
                  break;
                case "CP2":
                  this.router.navigate(["/bidding-v3"], {
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
    console.log("click handleImportByDealFormId");
  }
  public reset() {
    this.dealForm.reset();
    this.simulationForm.reset();
  }
}
