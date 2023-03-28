import { NgModule } from "@angular/core";

import { RouterModule, Route } from "@angular/router";

import { ApprovedComponent } from "./approved/approved.component";
import { DraftComponent } from "./draft/draft.component";
import { HomeComponent } from "./home/home.component";
import { RequestComponent } from "./request/request.component";
import { ViewComponent } from "./view/view.component";
import { WaitingApproveComponent } from "./waiting-approve/waiting-approve.component";
import { RequestFormComponent } from "./request-form/request-form.component";
import { ReportComponent } from "./report/report.component";

const routes: Route[] = [
  { path: "home", component: HomeComponent },
  { path: "waiting-approve", component: WaitingApproveComponent },
  { path: "approved", component: ApprovedComponent },
  { path: "request", component: RequestComponent },
  { path: "draft", component: DraftComponent },
  { path: "view", component: ViewComponent },
  { path: "new-request", component: RequestFormComponent },
  { path: "request/:requestId", component: RequestFormComponent },
  { path: "report", component: ReportComponent },
  { path: "", redirectTo: "home", pathMatch: "full" },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class SpecialApprovalRoutingModule {}
