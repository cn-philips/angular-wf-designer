import { NgModule } from "@angular/core";
import { RouterModule, Route } from "@angular/router";

import {
  BusinessConfigComponent,
  DataDictionaryComponent,
  MyDelegationComponent,
  RegionUserComponent,
  RoleComponent,
  RolePermissionComponent,
  ChangeOwnerComponent,
  MessageManagementComponent,
  ScheduleComponent,
  TaskAssignComponent,
  spSettingComponent,
} from "./index";

const routes: Route[] = [
  { path: "role", component: RoleComponent },
  { path: "role-permission", component: RolePermissionComponent },
  { path: "data-dictionary", component: DataDictionaryComponent },
  { path: "business-config", component: BusinessConfigComponent },
  { path: "region-user", component: RegionUserComponent },
  { path: "my-delegation", component: MyDelegationComponent },
  { path: "change-owner", component: ChangeOwnerComponent },
  { path: "message", component: MessageManagementComponent },
  { path: "schedule", component: ScheduleComponent },
  { path: 'task-assign', component: TaskAssignComponent },
  { path: 'sp-setting', component: spSettingComponent },
  { path: "", redirectTo: "role", pathMatch: "full" },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SystemSettingRoutingModule {}
