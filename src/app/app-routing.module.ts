import { NgModule } from "@angular/core";
import { Routes, RouterModule, PreloadAllModules } from "@angular/router";
// *******************************************************************************
// Layouts

import { LayoutBasicComponent } from "./layout/layout-basic/layout-basic.component";
// import { LayoutWithoutSidenavComponent } from './layout/layout-without-sidenav/layout-without-sidenav.component';
import { LayoutBlankComponent } from "./layout/layout-blank/layout-blank.component";
// *******************************************************************************
// Pages

import { HomepageComponent } from "./pages/homepage/homepage.component";

import { AuthGuard } from "@core/guards/auth-guard.service";
import { AutoApprovalComponent } from "./pages/auto-approval/auto-approval.component";
import { MailApprovalComponent } from "@pages/mail-approval/mail-approval.component";

// *******************************************************************************
// Routes

const routes: Routes = [
  {
    path: "devlogin",
    component: LayoutBlankComponent,
    loadChildren: "./pages/devlogin/devlogin.module#DevloginModule",
  },
  {
    path: "anonymous",
    component: LayoutBlankComponent,
    loadChildren: "./pages/anonymous/anonymous.module#AnonymousModule",
  },
  {
    path: "errorpage",
    component: LayoutBlankComponent,
    loadChildren: "./pages/errorpage/errorpage.module#ErrorpageModule",
  },
  {
    path: "callback",
    component: LayoutBlankComponent,
    loadChildren:
      "./pages/auth-callback/auth-callback.module#AuthCallbackModule",
  },
  {
    path: "logout",
    component: LayoutBlankComponent,
    loadChildren: "./pages/logout/logout.module#LogoutModule",
  },
  {
    path: "autoapproval",
    component: LayoutBlankComponent,
    loadChildren:
      "./pages/auto-approval/auto-approval.module#AutoApprovalModule",
  },
  {
    path: "mailApproval",
    component: LayoutBlankComponent,
    loadChildren:
      "./pages/mail-approval/mail-approval.module#MailApprovalModule",
  },
  {
    path: "",
    component: LayoutBasicComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "home",
        component: HomepageComponent,
        data: { breadcrumb: "首页" },
      },
      {
        path: "ecos",
        loadChildren: "./pages/workspace/workspace.module#WorkspaceModule",
        data: { breadcrumb: "工作台" },
      },
      {
        path: "special-approval",
        loadChildren:
          "./pages/special-approval/special-approval.module#SpecialApprovalModule",
      },
      {
        path: "bidding",
        loadChildren: "./pages/bidding/bidding.module#BiddingModule",
        data: { breadcrumb: "投标", breadcrumbDisabled: true },
      },
      {
        path: "bidding-v3",
        loadChildren: "./pages/bidding-v3/bidding-v3.module#BiddingV3Module",
        data: { breadcrumb: "投标", breadcrumbDisabled: true },
      },
      {
        path: "report",
        loadChildren: "./pages/report/report.module#ReportModule",
      },
      {
        path: "workplace",
        loadChildren: "./pages/workspace/workspace.module#WorkspaceModule",
      },
      {
        path: "dashboard",
        loadChildren: "./pages/dashboard/dashboard.module#DashboardModule",
        data: { breadcrumb: "报表" },
      },
      {
        path: "system-setting",
        loadChildren:
          "./pages/system-setting/system-setting.module#SystemSettingModule",
      },
      {
        path: "system-setting/schedule-task",
        loadChildren:
          "./pages/schedule/schedule.module#ScheduleModule",
        data: { breadcrumb: "定时任务", breadcrumbDisabled: true },
      },
      {
        path: "pre-order",
        loadChildren: "./pages/order/order.module#OrderModule",
        data: { breadcrumb: "进单", breadcrumbDisabled: true },
      },
      {
        path: "pre-book",
        loadChildren: "./pages/pre-book/pre-book.module#PreBookModule",
        data: { breadcrumb: "Slot Reservation", breadcrumbDisabled: true },
      },
      {
        path: "order-v3",
        loadChildren: "./pages/order-v3/order-v3.module#orderv3Module",
        data: { breadcrumb: "进单", breadcrumbDisabled: true },
      },
      {
        path: "prebook-v3",
        loadChildren: "./pages/prebook-v3/prebook-v3.module#PrebookV3Module",
        data: { breadcrumb: "Slot Reservation" },
      },
      // {
      //  path:'order-v3',
      //  loadChildren:'./pages/order-v3/order-v3.module#orderv3Module'
      // },
      {
        path: "",
        redirectTo: "home",
        pathMatch: "full",
      },
    ],
  },
];

// *******************************************************************************
//

@NgModule({
  imports: [
    // RouterModule.forRoot(routes),
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
