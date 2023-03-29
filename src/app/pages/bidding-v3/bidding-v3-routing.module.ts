import { NgModule } from "@angular/core";
import { RouterModule, Route } from "@angular/router";

import { BiddingFormComponent, BiddingDetailComponent } from "./index";

const routes: Route[] = [
  {
    path: "",
    component: BiddingFormComponent,
    data: { breadcrumb: "新建投标申请" },
  },
  {
    path: ":id",
    component: BiddingDetailComponent,
    data: { breadcrumb: "投标申请详情页" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class BiddingV3RoutingModule {}
