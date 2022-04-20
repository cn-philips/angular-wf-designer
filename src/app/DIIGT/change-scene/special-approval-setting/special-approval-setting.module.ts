import { NgModule } from "@angular/core";
import { SharedModule } from "../../../shared/shared.module";

import { SpecialApprovalSettingComponent } from "./special-approval-setting.component";
import { BusinessProcListComponent } from "./widgets/business-proc-list/business-proc-list.component";
import { BusinessProcFormComponent } from "./widgets/business-proc-form/business-proc-form.component";
import { ApproveProcListComponent } from "./widgets/approve-proc-list/approve-proc-list.component";
import { ApproveProcFormComponent } from "./widgets/approve-proc-form/approve-proc-form.component";
import { ApproveNodeFormComponent } from "./widgets/approve-node-form/approve-node-form.component";

@NgModule({
  declarations: [
    SpecialApprovalSettingComponent,
    BusinessProcListComponent,
    ApproveProcListComponent,
    BusinessProcFormComponent,
    ApproveProcFormComponent,
    ApproveNodeFormComponent,
  ],
  imports: [SharedModule],
  exports: [SpecialApprovalSettingComponent],
  providers: [],
})
export class SpecialApprovalSettingModule {}
