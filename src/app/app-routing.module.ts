import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PreloadAllModules } from "@angular/router";
import {environment} from '../environments/environment';

// *******************************************************************************
// Layouts

import { Layout1Component } from "./layout/layout-1/layout-1.component";
// import { LayoutWithoutSidenavComponent } from './layout/layout-without-sidenav/layout-without-sidenav.component';
import { Layout1FlexComponent } from "./layout/layout-1-flex/layout-1-flex.component";
import { LayoutBlankComponent } from "./layout/layout-blank/layout-blank.component";
import { DevloginComponent } from "./devlogin/devlogin.component";

// *******************************************************************************
// Pages

import { HomepageComponent } from "./DIIGT/homepage/homepage.component";
import { HomeComponent } from "./home/home.component";
import { AuthCallbackComponent } from "./auth-callback/auth-callback.component";
import { Page2Component } from "./page-2/page-2.component";
import { MasterDataMaintenanceComponent } from "./master-data-maintenance/master-data-maintenance.component";
import { MasterDataMaintenanceEditComponent } from "./master-data-maintenance/master-data-maintenance-edit/master-data-maintenance-edit.component";
import { PersonInfoComponent } from "./person-info/person-info.component";
import { PersonManagementComponent } from "./person-management/person-management.component";

import { IGTMasterDataMaintenanceComponent } from "./DIIGT/master-data-maintenance/master-data-maintenance.component";
import { IGTMasterDataMaintenanceEditComponent } from "./DIIGT/master-data-maintenance/master-data-maintenance-edit/master-data-maintenance-edit.component";
import { IGTPersonManagementComponent } from "./DIIGT/person-management/person-management.component";

import { TemplateMaintenanceComponent } from "./template-maintenance/template-maintenance.component";
import { RoleAuthorizationComponent } from "./role-authorization/role-authorization.component";
import { NewApprovalComponent } from "./new-approval/new-approval.component";
import { MyTaskComponent } from "./my-task/my-task.component";
import { ClaimTaskComponent } from "./claim-task/claim-task.component";
import { MyDraftComponent } from "./my-draft/my-draft.component";
import { MyApprovalComponent } from "./my-approval/my-approval.component";
import { QuotationManagementComponent } from "./quotation-management/quotation-management.component";
import { AuthenticationLogoutComponent } from "./authentication-logout/authentication-logout.component";
import { AuthGuard } from "./guards/auth-guard.service";
import { RolelistComponent } from "./configure/rolelist.component";
import { DimensiontreeComponent } from "./configure/dimensiontree.component";
import { OaBwsfileComponent } from "./oa-bwsfile/oa-bwsfile.component";
import { ReportComponent } from "./report/report.component";
import { ErrorpageComponent } from "./expage/errorpage/errorpage.component";
import { AdmintoolsComponent } from "./configure/admintools.component";
import { PersonnelManagementComponent } from "./../app/personnel-management/personnel-management.component";
import { GroupManagementComponent } from "./../app/group-management/group-management.component";
import { ShomeComponent } from "./DIIGT/shome/shome.component";
import { CktakeComponent } from "./DIIGT/cktake/cktake.component";
import { MyComponent } from "./DIIGT/my/my.component";
import { BidComponent } from "./DIIGT/bid/bid.component";
import { ApplyTenderComponent } from "./../app/DIIGT/apply-tender/apply-tender.component";
import { PreOrderComponent } from "./DIIGT/preOrder/preOrder.component";

import { InconComponent } from "./DIIGT/incon/incon.component";

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
      },
    ],
  },
  {
    path: "home2",
    component: Layout1Component,
    pathMatch: "full",
    children: [
      {
        path: "",
        // canActivate: [AuthGuard],  // ���ز�������������Ŀ
        component: HomeComponent,
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
    path: "page-2",
    component: Layout1FlexComponent,
    children: [{ path: "", component: Page2Component }],
  },

  {
    path: "master-data-maintenance",
    component: Layout1Component,
    children: [
      { path: "", component: MasterDataMaintenanceComponent },
      { path: "edit", component: MasterDataMaintenanceEditComponent },
    ],
  },

  {
    path: "person-info",
    component: Layout1Component,
    children: [{ path: "", component: PersonInfoComponent }],
  },

  {
    path: "personal-info",
    component: Layout1Component,
    children: [
      // {path: '', canActivate: [AuthGuard], component: PersonManagementComponent},
      { path: "", component: PersonManagementComponent },
    ],
  },

  {
    path: "template-maintenance",
    component: Layout1Component,
    children: [{ path: "", component: TemplateMaintenanceComponent }],
  },

  {
    path: "role-authorization",
    component: Layout1Component,
    children: [{ path: "", component: RoleAuthorizationComponent }],
  },

  {
    path: "new-approval",
    component: Layout1Component,
    children: [{ path: "", component: NewApprovalComponent }],
  },

  {
    path: "my-task",
    component: Layout1Component,
    children: [{ path: "", component: MyTaskComponent }],
  },

  {
    path: "my-approval",
    component: Layout1Component,
    children: [{ path: "", component: MyApprovalComponent }],
  },

  {
    path: "my-draft",
    component: Layout1Component,
    children: [{ path: "", component: MyDraftComponent }],
  },

  {
    path: "logout",
    component: LayoutBlankComponent,
    children: [{ path: "", component: AuthenticationLogoutComponent }],
  },

  {
    path: "claim-task",
    component: Layout1Component,
    children: [{ path: "", component: ClaimTaskComponent }],
  },

  {
    path: "quotation-management",
    component: Layout1Component,
    children: [{ path: "", component: QuotationManagementComponent }],
  },

  {
    path: "callback",
    component: LayoutBlankComponent,
    children: [{ path: "", component: AuthCallbackComponent }],
  },

  {
    path: "role-list",
    component: Layout1Component,
    children: [{ path: "", component: RolelistComponent }],
  },

  {
    path: "dimension-tree",
    component: Layout1Component,
    children: [{ path: "", component: DimensiontreeComponent }],
  },
  // {
  //   path:"**",
  //   redirectTo: '/',    
  // },
  // {
  //   path: "admin-tools",
  //   component: Layout1Component,
  //   children: [{ path: "", component: AdmintoolsComponent }],
  // },

  {
    path: "app-personnel-management",
    component: Layout1Component,
    children: [{ path: "", component: PersonnelManagementComponent }],
  },

  {
    path: "app-group-management",
    component: Layout1Component,
    children: [{ path: "", component: GroupManagementComponent }],
  },

  {
    path: "oa-bwsfile",
    component: Layout1Component,
    children: [{ path: "", component: OaBwsfileComponent }],
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
        // canActivate: [AuthGuard],
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
    path: "my",
    component: Layout1Component,
    children: [{ path: "", component: MyComponent }],
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
    path: "incon",
    component: Layout1Component,
    children: [{ path: "", component: InconComponent }],
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
