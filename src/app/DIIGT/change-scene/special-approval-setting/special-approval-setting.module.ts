import { NgModule } from "@angular/core";
import { SharedModule } from "../../../shared/shared.module";

import { SpecialApprovalSettingComponent } from './special-approval-setting.component'
import { BusinessProcListComponent } from './widgets/business-proc-list/business-proc-list.component'
import { ApproveProcListComponent } from './widgets/approve-proc-list/approve-proc-list.component'

@NgModule({
  declarations: [SpecialApprovalSettingComponent, BusinessProcListComponent, ApproveProcListComponent],
  imports: [SharedModule],
  exports: [SpecialApprovalSettingComponent],
  providers: [],
})
export class SpecialApprovalSettingModule {}
