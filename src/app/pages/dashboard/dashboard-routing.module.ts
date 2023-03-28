import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router'

import { LeadTimeComponent, OitRealtimeComponent, OitSummaryComponent } from './index'

const routes: Route[] = [
  { path: "oit-realtime", component: OitRealtimeComponent },
  { path: "oit-summary", component: OitSummaryComponent },
  { path: "leadtime", component: LeadTimeComponent },
  { path: '', redirectTo: 'leadtime', pathMatch: 'full' }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule { }
