import { NgModule } from "@angular/core";

import { SharedModule } from "@shared/shared.module";
import { WorkspaceRoutingModule } from "./workspace-routing.module";
import {
  ReportComponent,
  SpecialApprovalModule,
} from "../special-approval/special-approval.module";

import { COMPONENTS, PAGES } from "./index";
import { ModernThemesModule } from "@app/modern-themes/modern-themes.module";
import { DashboardModule } from "@pages/dashboard/dashboard.module";
import { WorkspaceListService } from "./services/workspace-list.service";
import { ListFunctionCollectionsService } from "./services/list-function-collections.service";
// import {CardListComponent, TaskListComponent} from '@pages/workspace/home/components';

@NgModule({
  imports: [
    SharedModule,
    WorkspaceRoutingModule,
    SpecialApprovalModule,
    ModernThemesModule,
    DashboardModule,
  ],
  declarations: [...COMPONENTS, ...PAGES],
  providers: [WorkspaceListService, ListFunctionCollectionsService],
})
export class WorkspaceModule {}
