import { NgModule } from '@angular/core';
import { RouterModule, Route } from "@angular/router";

import { PrebookFormComponent, PrebookDetailComponent } from './index';

const routes: Route[] = [
  {
    path: '',
    component: PrebookFormComponent,
    data: { breadcrumb: "新建Slot Reservation申请" },
  },
  {
    path: ":id",
    component: PrebookDetailComponent,
    data: { breadcrumb: "Slot Reservation申请详情页" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [],
  declarations: [],
  providers: [],
})
export class PrebookV3RoutingModule { }
