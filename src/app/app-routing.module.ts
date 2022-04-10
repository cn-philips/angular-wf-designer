import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PreloadAllModules } from "@angular/router";
import {environment} from '../environments/environment';

// *******************************************************************************
// Layouts

import { Layout1Component } from "./layout/layout-1/layout-1.component";
import {Layout2Component} from "./layout/layout-2/layout-2.component";
// import { LayoutWithoutSidenavComponent } from './layout/layout-without-sidenav/layout-without-sidenav.component';
import { Layout1FlexComponent } from "./layout/layout-1-flex/layout-1-flex.component";
import { LayoutBlankComponent } from "./layout/layout-blank/layout-blank.component";
import { DevloginComponent } from "./devlogin/devlogin.component";

// *******************************************************************************
// Pages

import { HomepageComponent } from "./DIIGT/homepage/homepage.component";
import { AuthCallbackComponent } from "./auth-callback/auth-callback.component";

import { IGTMasterDataMaintenanceComponent } from "./DIIGT/master-data-maintenance/master-data-maintenance.component";
import { IGTMasterDataMaintenanceEditComponent } from "./DIIGT/master-data-maintenance/master-data-maintenance-edit/master-data-maintenance-edit.component";
import { IGTPersonManagementComponent } from "./DIIGT/person-management/person-management.component";

import { AuthenticationLogoutComponent } from "./authentication-logout/authentication-logout.component";
import { AuthGuard } from "./guards/auth-guard.service";
import { ReportComponent } from "./report/report.component";
import { ErrorpageComponent } from "./expage/errorpage/errorpage.component";
import { ShomeComponent } from "./DIIGT/shome/shome.component";
import { CktakeComponent } from "./DIIGT/cktake/cktake.component";

import { BidComponent } from "./DIIGT/bid/bid.component";
import { ApplyTenderComponent } from "./../app/DIIGT/apply-tender/apply-tender.component";
import { PreOrderComponent } from "./DIIGT/preOrder/preOrder.component";
import {PreBookComponent} from"./DIIGT/pre-book/pre-book.component";

import { InorderComponent } from "./DIIGT/inorder/inorder.component";

import { IGTMyTaskComponent } from "./DIIGT/my-task/MyTask.component";
import { DataDictionaryComponent } from "./DIIGT/data-dictionary/DataDictionary.component";
import { ExamineOrderIGTComponent } from "./DIIGT/examine-order/examine-order.component";
import { StatisticsIGTComponent } from "./DIIGT/dashboard/statistics/statistics.component";
import { CompleteOitComponent } from "./DIIGT/complete-oit/complete-oit.component";
import { EmpComponent } from "./DIIGT/emp/emp.component";
import { WinningbidComponent } from "./DIIGT/winningbid/winningbid.component";
import { TenderreviewComponent } from "./DIIGT/tenderreview/tenderreview.component";
import { TenderreviewSaleComponent } from "./DIIGT/tenderreview-sale/tenderreview-sale.component";
import { ConsignComponent } from "./DIIGT/consign/consign.component";
import { Report2Component } from "./DIIGT/report2/report2.component";
import { ContemplateComponent } from "./DIIGT/contemplate/contemplate.component";
import { RolemanagementComponent } from "./DIIGT/rolemanagement/rolemanagement.component";
import { DimensionsTreeComponent } from "./DIIGT/dimensions-tree/dimensions-tree.component";
import { RoleslistComponent } from "./DIIGT/roleslist/roleslist.component";
import { PersonnelmanagementsComponent } from "./DIIGT/personnelmanagements/personnelmanagements.component";
import { GroupManagementComponents } from "./DIIGT/group-management/group-management.component";
import { PreorderauditComponent } from "./DIIGT/preorderaudit/preorderaudit.component";
import { ApplyTenderModifComponent } from "./DIIGT/apply-tender-modif/apply-tender-modif.component";
import { PreordermodifComponent } from "./DIIGT/preordermodif/preordermodif.component";
import { InconmodifComponent } from "./DIIGT/inconmodif/inconmodif.component";
import { InorderExamineComponent } from "./DIIGT/inorder-examine/inorder-examine.component";
import { SuppfileComponent } from "./DIIGT/suppfile/suppfile.component";
import { ViewsubprocesseComponent } from "./DIIGT/viewsubprocesse/viewsubprocesse.component";
import { PdfpreviewComponent } from "./DIIGT/pdfpreview/pdfpreview.component";
import { MyStartedComponent } from "./DIIGT/my-started/my-started.component";
import { MyDraftComponents } from "./DIIGT/my-draft/my-draft.component";
import { AnonymousComponent } from "./DIIGT/anonymous/anonymous.component";
import {MyViewComponent} from './DIIGT/my-view/my-view.component';
import { SupportFileUpComponent } from './DIIGT/support-file-up/support-file-up.component';
import {EntrustComponent} from './DIIGT/entrust/entrust.component';
import {ChangeOnwerComponent} from './DIIGT/change-onwer/change-onwer.component';
import {ChangeSceneComponent} from './DIIGT/change-scene/change-scene.component';
import { OitRealtimeComponent } from './dashboard/oit-realtime/oit-realtime.component'
import { OitSummaryComponent } from './dashboard/oit-summary/oit-summary.component'
import { LeadTimeComponent } from './dashboard/lead-time/lead-time.component'

import {PrebookReviewComponent} from './DIIGT/prebook-review/prebook-review.component';
import {ProbookOareviewComponent} from './DIIGT/probook-oareview/probook-oareview.component'
import{SupplementOaComponent}from'./DIIGT/supplement-oa/supplement-oa.component';
import{ProbookSoComponent}from'./DIIGT/probook-so/probook-so.component';
import {MyEntrustComponent} from './DIIGT/my-entrust/my-entrust.component';
import { RoleManagementComponent } from "./DIIGT/role-management/role-management.component";
import { RegionManagementComponent } from "./DIIGT/region-management/region-management.component";
import { UserManagementComponent } from "./DIIGT/user-management/user-management.component";
import { MailApprovalComponent } from "./DIIGT/mail-approval/mail-approval.component";
import {AutoApprovalComponent} from "./DIIGT/auto-approval/auto-approval.component";


import { ApprovedComponent } from './special-approval/approved/approved.component'
import { DraftComponent } from './special-approval/draft/draft.component'
import { HomeComponent as SpHomeComponent } from './special-approval/home/home.component'
import { RequestComponent } from './special-approval/request/request.component'
import { ViewComponent } from './special-approval/view/view.component'
import { WaitingApproveComponent } from './special-approval/waiting-approve/waiting-approve.component'
import { RequestFormComponent } from './special-approval/request-form/request-form.component'
// *******************************************************************************
// Routes



const routes: Routes = [
  {
    path: "anonymous",
    component: AnonymousComponent,
  },
  {
    path: "preOrder",
    component: Layout1Component,
    children: [{ path: "", component: PreOrderComponent }],
  },
  {
    path: "prebook",
    component: Layout1Component,
    children: [{ path: "", component: PreBookComponent}],
  },
  {
    path: "prereview",
    component: Layout1Component,
    children: [{ path: "", component: PrebookReviewComponent}],
  },
  {
    path: "prereoaview",
    component: Layout1Component,
    children: [{ path: "", component: ProbookOareviewComponent}],
  },
  {
    path:"prebookso",
    component:Layout1Component,
    children:[{path:"",component:ProbookSoComponent}]
  },
  {
    path:"supplementoa",
    component:Layout1Component,
    children:[{path:"",component:SupplementOaComponent}]
  },
  {
    path: "inorderexam",
    component: Layout1Component,
    children: [
      {
        path: "",
        component: InorderExamineComponent,
      },
    ],
  },
  {
    path: "igt",
    component: Layout1Component,
    children: [
      // {path: '', canActivate: [AuthGuard], component: IGTPersonManagementComponent},
      {
        path: "examine-order",
        component: ExamineOrderIGTComponent,
      },
      {
        path: "statistics",
        component: StatisticsIGTComponent,
      },
      {
        path: "personal-info",
        component: IGTPersonManagementComponent,
      },
      {
        path: "master-data-maintenance",
        component: IGTMasterDataMaintenanceComponent,
        children: [
          {
            path: "edit",
            // tslint:disable-next-line:object-literal-sort-keys
            component: IGTMasterDataMaintenanceEditComponent,
          },
        ],
      },
      {
        path: "my-task",
        component: IGTMyTaskComponent,
      },
      {
        path: "data-dictionary",
        component: DataDictionaryComponent,
      },
      {
        path: "pdfpreview",
        component: PdfpreviewComponent,
      },
      {
        path: "my-started",
        component: MyStartedComponent,
      },
      {
        path: "view",
        component: MyViewComponent
      },
      {
        path: "my-draft",
        component: MyDraftComponents,
      },
      {
        path: "entrust",
        component: MyEntrustComponent
      },
      {
        path: "oit-realtime",
        component: OitRealtimeComponent
      },
      {
        path: "oit-summary",
        component: OitSummaryComponent
      },
      {
        path: "leadtime",
        component: LeadTimeComponent
      }
    ],
  },
  {
    path: "",
    component: Layout1Component,
    pathMatch: "full",
    children: [
      {
        path: "",
        component: HomepageComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
  {
    path: "completeOit",
    component: Layout1Component,
    children: [{ path: "", component: CompleteOitComponent }],
  },
  {
    path: "tenderreview",
    component: Layout1Component,
    children: [{ path: "", component: TenderreviewComponent }],
  },
  {
    path: "tenderreview_sale",
    component: Layout1Component,
    children: [{ path: "", component: TenderreviewSaleComponent }],
  },
  {
    path: "winning",
    component: Layout1Component,
    children: [{ path: "", component: WinningbidComponent }],
  },
  {
    path: "support-up",
    component: Layout1Component,
    children: [{ path: "", component: SupportFileUpComponent }],
  },
  {
    path: "logout",
    component: LayoutBlankComponent,
    children: [{ path: "", component: AuthenticationLogoutComponent }],
  },
  {
    path: "callback",
    component: LayoutBlankComponent,
    children: [{ path: "", component: AuthCallbackComponent }],
  },
  {
    path: "report",
    component: Layout1Component,
    children: [{ path: "", component: ReportComponent }],
  },

  {
    path: "errorpage",
    component: LayoutBlankComponent,
    children: [{ path: "", component: ErrorpageComponent }],
  },

  {
    path: "devlogin",
    component: LayoutBlankComponent,
    children: [{ path: "", component: DevloginComponent }],
  },

  {
    path: "homepage",
    component: Layout1Component,
    children: [
      {
        path: "",
        //canActivate: [AuthGuard],
        component: ShomeComponent,
      },
    ],
  },
  {
    path: "cktake",
    component: Layout1Component,
    children: [
      {
        path: "",
        // canActivate: [AuthGuard],
        component: CktakeComponent,
      },
    ],
  },
  
  {
    path: "applyTender",
    component: Layout1Component,
    children: [{ path: "", component: ApplyTenderComponent }],
  },
  {
    path: "bid",
    component: Layout1Component,
    children: [{ path: "", component: BidComponent }],
  },  
  {
    path: "inorder",
    component: Layout1Component,
    children: [{ path: "", component: InorderComponent }],
  },
  {
    path: "emp",
    component: Layout1Component,
    children: [{ path: "", component: EmpComponent }],
  },
  {
    path: "consign",
    component: Layout1Component,
    children: [{ path: "", component: ConsignComponent }],
  },
  {
    path: "report2",
    component: Layout1Component,
    children: [{ path: "", component: Report2Component }],
  },
  {
    path: "contemplate",
    component: Layout1Component,
    children: [{ path: "", component: ContemplateComponent }],
  },
  {
    path: "rolemanage",
    component: Layout1Component,
    children: [{ path: "", component: RolemanagementComponent }],
  },
  {
    path: "dimensionsTree",
    component: Layout1Component,
    children: [{ path: "", component: DimensionsTreeComponent }],
  },
  {
    path: "roleslist",
    component: Layout1Component,
    children: [{ path: "", component: RoleslistComponent }],
  },
  {
    path: "personnelmanagements",
    component: Layout1Component,
    children: [{ path: "", component: PersonnelmanagementsComponent }],
  },
  {
    path: "dllgt-group-management",
    component: Layout1Component,
    children: [{ path: "", component: GroupManagementComponents }],
  },
  {
    path: "preorderaudit",
    component: Layout1Component,
    children: [{ path: "", component: PreorderauditComponent }],
  },
  {
    path: "applytendermodif",
    component: Layout1Component,
    children: [{ path: "", component: ApplyTenderModifComponent }],
  },
  {
    path: "preordermodifs",
    component: Layout1Component,
    children: [{ path: "", component: PreordermodifComponent }],
  },
  {
    path: "inconmodif",
    component: Layout1Component,
    children: [{ path: "", component: InconmodifComponent }],
  },
  {
    path: "suppfile",
    component: Layout1Component,
    children: [{ path: "", component: SuppfileComponent }],
  },
  {
    path: "viewsubp",
    component: Layout1Component,
    children: [{ path: "", component: ViewsubprocesseComponent }],
  },
  {
    path: "changeonwer",
    component: Layout1Component,
    children: [{ path: "", component: ChangeOnwerComponent }],
  },
  {
    path:"changescene",
    component: Layout1Component,
    children: [{ path: "", component: ChangeSceneComponent}],
  },
  {
    path: 'special-approval',
    component: Layout1Component,
    // loadChildren: () => import('./special-approval/special-approval.module').then(module => module.SpecialApprovalModule)
    // loadChildren: './special-approval/special-approval.module#SpecialApprovalModule'
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: SpHomeComponent },
      { path: 'waiting-approve', component: WaitingApproveComponent },
      { path: 'approved', component: ApprovedComponent },
      { path: 'request', component: RequestComponent },
      { path: 'draft', component: DraftComponent },
      { path: 'view', component: ViewComponent },
      { path: 'report', component: ReportComponent },
      { path: 'new-request', component: RequestFormComponent },
      { path: 'request/:requestId', component: RequestFormComponent },
    ]
  },
  // New Admin settings
  {
    path: "rolesmanagementv2",
    component: Layout1Component,
    children: [{ path: "", component: RoleManagementComponent }],
  },
  {
    path: "regionmanagementv2",
    component: Layout1Component,
    children: [{ path: "", component: RegionManagementComponent }],
  },
  {
    path: "usermanagementv2",
    component: Layout1Component,
    children: [{ path: "", component: UserManagementComponent }],
  },
  {
    path:'mailApproval',
    component:Layout2Component,
    children:[{path:"",component:MailApprovalComponent}]
  },
  {
    path:'autoapproval',
    component:Layout2Component,
    canActivate: [AuthGuard],
    children:[{path:"plaintext",component:AutoApprovalComponent}]
  }
];

// *******************************************************************************
//

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
