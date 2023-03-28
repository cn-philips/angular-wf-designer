import { NgModule } from "@angular/core";

import { SharedModule } from "@shared/shared.module";
import { DashboardRoutingModule } from "./dashboard-routing.module";
import { LeadTimeComponent } from "./lead-time/lead-time.component";
import { OitRealtimeComponent } from "./oit-realtime/oit-realtime.component";
import { OitSummaryComponent } from "./oit-summary/oit-summary.component";

import { PAGES } from "./index";

@NgModule({
  imports: [SharedModule, DashboardRoutingModule],
  declarations: [...PAGES],
  providers: [],
  exports: [LeadTimeComponent, OitRealtimeComponent, OitSummaryComponent],
})
export class DashboardModule {}
