import {BrowserModule, Title} from '@angular/platform-browser';
import {LOCALE_ID, NgModule} from '@angular/core';
import zh from '@angular/common/locales/zh';
import {DatePipe, HashLocationStrategy, LocationStrategy, registerLocaleData} from '@angular/common';
import {NumeralModule} from 'ngx-numeral';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormlyBootstrapModule} from '@ngx-formly/bootstrap';
import {CookieService} from 'ngx-cookie-service';
import {ServicesModule} from './services';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AppService} from './app.service';
import {LayoutModule} from './layout/layout.module';
import {HomepageComponent} from './DIIGT/homepage/homepage.component';
import { CustomersModule } from './DIIGT/apply-tender/apply-tender.module';
// *******************************************************************************
// Libs
import {LaddaModule} from 'angular2-ladda';
import {ToastrModule} from 'ngx-toastr';
import {TreeModule} from 'angular-tree-component';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {NgSelectModule} from '@ng-select/ng-select';
import {ConfirmationPopoverModule} from 'angular-confirmation-popover';
import {AuthenticationLogoutComponent} from './authentication-logout/authentication-logout.component';
import {IsCompletedPipe} from './pipes/is-completed.pipe';
import {MyApprovalStatePipe} from './pipes/my-approval-state.pipe';
import {LicenseTypePipe} from './pipes/license-type.pipe';
import {YnPipe} from './pipes/yn.pipe';
import {ProcessStatusPipe} from './pipes/process-status.pipe';
import {TimeFormatePipe} from './pipes/time-formate.pipe';
import {TimeFormatePipeMs} from './pipes/process-time-ms.pipe';
import {TimeFormatePipeNow}from './pipes/tiem-formatenow.pipe';
import {HospitalTypePipe} from './pipes/hospital-type.pipe';
import {Ng5SliderModule} from 'ng5-slider';
import {AuthCallbackComponent} from './auth-callback/auth-callback.component';
import {ErrorpageComponent} from './expage/errorpage/errorpage.component';
import {UploadFileComponent} from './component/upload-file/upload-file.component';
import {SimpleTableComponent} from './component/simple-table/simple-table.component';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { UploadProgressbarComponent } from './component/upload-progressbar/upload-progressbar.component';
import { SimplePdfViewerComponent } from './component/simple-pdf-viewer/simple-pdf-viewer.component';
import { SysUserSelectComponent } from './component/sys-user-select/sys-user-select.component';
import { MultiSimplePdfViewerComponent } from './component/multi-simple-pdf-viewer/multi-simple-pdf-viewer.component';
import { SmallSimpleModalComponent } from './component/small-simple-modal/small-simple-modal.component';
import { ApprovalBatchCommentsComponent } from './component/approval-batch-comments/approval-batch-comments.component';
import { CustomTooltipComponent } from './component/custom-tooltip/custom-tooltip.component';
import {ProcessBtn} from './pipes/process-btns.pipe';
import {ProcessModel} from './pipes/process-model.pipe';
import {ProcessProject} from './pipes/process-project.pipe';
import {ProcessThird} from './pipes/process-third.pipe';
import {NumberThousandth} from './pipes/number-thousandth.pipe';
import {ProcessCompany} from './pipes/process-company.pipe';
import {proceessAuthor} from'./pipes/proceess-author.pipe';
import {MyDraftComponents} from './DIIGT/my-draft/my-draft.component';
import {StatusProject} from './pipes/status-project.pipe';


import { SharedModule } from './shared/shared.module'
// *******************************************************************************
// Guards
import {AuthGuard} from './guards/auth-guard.service';
// Interceptor
import {GlobalInterceptor} from './class/global-interceptor';
// @ts-ignore
import {
  NZ_I18N,
  zh_CN,
} from 'ng-zorro-antd';
import {ReportComponent} from './report/report.component';
import {EmitterService} from './services/emitter.service';
import {DevloginComponent} from './devlogin/devlogin.component';
import { TrainingcostModalComponent } from './component/trainingcost-modal/trainingcost-modal.component';
// public
import { IGTApprovalFlowlineComponent } from './DIIGT/components/approval-flowline/approval-flowline.component';
// d2c realted
import { ShomeComponent } from './DIIGT/shome/shome.component';
import { CktakeComponent } from './DIIGT/cktake/cktake.component';

import { MyPpendingComponent } from './DIIGT/my-ppending/my-ppending.component';
import { MyCompleteComponent } from './DIIGT/my-complete/my-complete.component';
import { BidComponent } from './DIIGT/bid/bid.component';
import { ApplyTenderComponent } from './DIIGT/apply-tender/apply-tender.component';
import { ApplybaseComponent } from './DIIGT/apply-tender/applybase/applybase.component';
import { NewproductComponent } from './DIIGT/apply-tender/newproduct/newproduct.component';
import { SupplementComponent } from './DIIGT/apply-tender/supplement/supplement';

import { BidIndexComponent } from './DIIGT/bid-index/bid-index.component';
import { BidDucComponent } from './DIIGT/bid-duc/bid-duc.component';
import { BidSuppComponent } from './DIIGT/bid-supp/bid-supp.component';
import { BidRecordComponent } from './DIIGT/bid-record/bid-record.component';
import { BidCkComponent } from './DIIGT/bid-ck/bid-ck.component';
import {
  IGTPersonManagementComponent,
} from './DIIGT/person-management/person-management.component';
import {
  IGTMasterDataMaintenanceComponent,
} from './DIIGT/master-data-maintenance/master-data-maintenance.component';
import {
  IGTMasterDataMaintenanceEditComponent,
} from './DIIGT/master-data-maintenance/master-data-maintenance-edit/master-data-maintenance-edit.component';
import {
  IGTMyTaskComponent,
} from './DIIGT/my-task/MyTask.component';
import {
  DataDictionaryComponent,
} from './DIIGT/data-dictionary/DataDictionary.component';
import {
  DictionaryFormComponent,
} from './DIIGT/data-dictionary/dictionaryForm/DictionaryForm.component';
import {
  DictionaryTableComponent,
} from './DIIGT/data-dictionary/dictionaryTable/DictionaryTable.component';
import {
  DictionaryModelComponent,
} from './DIIGT/data-dictionary/dictionaryModel/DictionaryModel.component';
import {
  MyToDoTaskComponent,
} from './DIIGT/my-task/myToDoTask/MyToDoTask.component';
import {
  MyDoneTaskComponent,
} from './DIIGT/my-task/myDoneTask/MyDoneTask.component';
import {
  MyTaskFormComponent,
} from './DIIGT/my-task/myTaskForm/MyTaskForm.component';
import {
  MyTaskTableComponent,
} from './DIIGT/my-task/myTaskTable/MyTaskTable.component';

// d2c realted
import { PreOrderComponent } from './DIIGT/preOrder/preOrder.component';
import { PreOrderBaseInfoComponent } from './DIIGT/preOrder/baseInfo/baseInfo.component';
import { PreOrderProductInfoComponent } from './DIIGT/preOrder/productInfo/productInfo.component';
import { PreOrderProductTransferComponent } from './DIIGT/preOrder/productTransfer/productTransfer.component';
import { PreOrderSofonTransferComponent } from './DIIGT/preOrder/sofonTransfer/sofonTransfer.component';
import { PreOrderWinCheckTableComponent } from './DIIGT/preOrder/winCheckTable/winCheckTable.component';

import { InorderComponent } from './DIIGT/inorder/inorder.component';
import { AgentshowComponent } from './DIIGT/apply-tender/agentshow/agentShow';
import { PreOrderProductFormComponent } from './DIIGT/preOrder/productForm/productForm.component';
import { InorderInComponent } from './DIIGT/inorder-in/inorder-in.component';
import { InorderExComponent } from './DIIGT/inorder-ex/inorder-ex.component';
import { InorderOrComponent } from './DIIGT/inorder-or/inorder-or.component';
import { InorderAccComponent } from './DIIGT/inorder-acc/inorder-acc.component';
import { CompleteOitComponent } from './DIIGT/complete-oit/complete-oit.component';
import { ContractsummaryComponent } from './DIIGT/complete-oit/contractsummary/contractsummary.component';
import { OrdersummaryComponent } from './DIIGT/complete-oit/ordersummary/ordersummary.component';
import { ContractsigningComponent } from './DIIGT/complete-oit/contractsigning/contractsigning.component';
import { ApprovalrecordComponent } from './DIIGT/complete-oit/approvalrecord/approvalrecord.component';
import { OitcompleteComponent } from './DIIGT/complete-oit/oitcomplete/oitcomplete.component';
import { WinningbidComponent } from './DIIGT/winningbid/winningbid.component';
import { WinningbaseComponent } from './DIIGT/winningbid/winningbase/winningbase.component';
import { WinningproductComponent } from './DIIGT/winningbid/winningproduct/winningproduct.component';
import { WinningsuppleComponent } from './DIIGT/winningbid/winningsupple/winningsupple.component';
import { WinningapprovalComponent } from './DIIGT/winningbid/winningapproval/winningapproval.component';
import { WinningrecordComponent } from './DIIGT/winningbid/winningrecord/winningrecord.component';
import { WinningconfirmComponent } from './DIIGT/winningbid/winningconfirm/winningconfirm.component';
import { TenderreviewComponent } from './DIIGT/tenderreview/tenderreview.component';
import { ReviewComponent } from './DIIGT/tenderreview/review/review.component';
import { EmpComponent } from './DIIGT/emp/emp.component';
import { EmpInComponent } from './DIIGT/emp-in/emp-in.component';
import { EmpPucComponent } from './DIIGT/emp-puc/emp-puc.component';
import { EmpSupComponent } from './DIIGT/emp-sup/emp-sup.component';
import { EmpAccComponent } from './DIIGT/emp-acc/emp-acc.component';
import { EmpEmpComponent } from './DIIGT/emp-emp/emp-emp.component';
import { ConsignComponent } from './DIIGT/consign/consign.component';
import { ConsignTabComponent } from './DIIGT/consign/consign-tab/consign-tab.component';
import { ConsignOrderComponent } from './DIIGT/consign/consign-order/consign-order.component';
import { ConsignAccComponent } from './DIIGT/consign/consign-acc/consign-acc.component';
import { ConsignConsignComponent } from './DIIGT/consign/consign-consign/consign-consign.component';
import { Report2Component } from './DIIGT/report2/report2.component';
import { ContemplateComponent } from './DIIGT/contemplate/contemplate.component';
import { RolemanagementComponent } from './DIIGT/rolemanagement/rolemanagement.component';
import { DimensionsTreeComponent } from './DIIGT/dimensions-tree/dimensions-tree.component';
import { RoleslistComponent } from './DIIGT/roleslist/roleslist.component';
import { PersonnelmanagementsComponent } from './DIIGT/personnelmanagements/personnelmanagements.component';
import { GroupManagementComponents } from './DIIGT/group-management/group-management.component';
import { BidinforComponent } from './DIIGT/components/bidinfor/bidinfor.component';
import { PreorderauditComponent } from './DIIGT/preorderaudit/preorderaudit.component';
import { AuditrecordComponent } from './DIIGT/preorderaudit/auditrecord/auditrecord.component';
import { ApplyTenderModifComponent } from './DIIGT/apply-tender-modif/apply-tender-modif.component';
import { ApprovalrecordaccComponent } from './DIIGT/components/approvalrecord/approvalrecord.component';
import { ApplyRemarksComponent } from './DIIGT/apply-tender-modif/apply-remarks/apply-remarks.component';
import { PreordermodifComponent } from './DIIGT/preordermodif/preordermodif.component';
import { InconmodifComponent } from './DIIGT/inconmodif/inconmodif.component';
import {TransferboxComponent} from'./DIIGT/components/transferbox/transferbox.component';
import { TenderreviewSaleComponent } from './DIIGT/tenderreview-sale/tenderreview-sale.component';
import { ExamineOrderIGTComponent } from './DIIGT/examine-order/examine-order.component';
import { StatisticsIGTComponent } from './DIIGT/dashboard/statistics/statistics.component';
import {ExamineFormIGTComponent} from './DIIGT/examine-order/examine-form/examine-form.component';
import { TransferboxSingleComponent } from './DIIGT/components/transferboxSingle/transferbox-single/transferbox-single.component';
import { InorderExamineComponent } from './DIIGT/inorder-examine/inorder-examine.component';
import { InoderfromComponent } from './DIIGT/inorder-examine/inoderfrom/inoderfrom.component';
import{ServesiceService}from'./DIIGT/preOrder/servesice.service';
import { SuppfileComponent } from './DIIGT/suppfile/suppfile.component';
import { ViewsubprocesseComponent } from './DIIGT/viewsubprocesse/viewsubprocesse.component';
import { PdfpreviewComponent } from './DIIGT/pdfpreview/pdfpreview.component';
import { ThirdcheckComponent } from './DIIGT/complete-oit/thirdcheck/thirdcheck.component';
import { RealTimeComponent } from './DIIGT/complete-oit/real-time/real-time.component';
import { MyStartedComponent } from './DIIGT/my-started/my-started.component';
import { MyStartTaskComponent } from './DIIGT/my-started/my-start-task/my-start-task.component';
import { MyDraftTaskComponent } from './DIIGT/my-draft/my-draft-task/my-draft-task.component';
import { AppTermsComponent } from './DIIGT/app-terms/app-terms.component';
import { AnonymousComponent } from './DIIGT/anonymous/anonymous.component';
import { LoadingComponent } from './DIIGT/components/loading/loading.component';
import { MyViewComponent } from './DIIGT/my-view/my-view.component';
import { MyViewFormComponent } from './DIIGT/my-task/my-view-form/my-view-form.component';
import { MyViewTableComponent } from './DIIGT/my-task/my-view-table/my-view-table.component';
import { SupportFileUpComponent } from './DIIGT/support-file-up/support-file-up.component';
import { TreeboxComponent } from './DIIGT/components/treebox/treebox.component';
import { EndUserListComponent } from './DIIGT/preOrder/end-user-list/end-user-list.component';
import { VerMessComponent } from './DIIGT/components/ver-mess/ver-mess.component';
import { EmpEmpAppComponent } from './DIIGT/emp-emp-app/emp-emp-app.component';
import { TableShowComponent } from './DIIGT/components/table-show/table-show.component';
import { ConfirmComponent } from './DIIGT/components/confirm/confirm.component';
import { EntrustComponent } from './DIIGT/entrust/entrust.component';
import { ChangeOnwerComponent } from './DIIGT/change-onwer/change-onwer.component';
import { ConfirmVersionComponent } from './DIIGT/components/confirm-version/confirm-version.component';
import { ChangeSceneComponent } from './DIIGT/change-scene/change-scene.component';
import { ApproveChangeComponent } from './DIIGT/complete-oit/approve-change/approve-change.component';
import { ChangeRecordComponent } from './DIIGT/components/change-record/change-record.component';
import { PreBookComponent } from './DIIGT/pre-book/pre-book.component';
import { PrebaseInfoComponent } from './DIIGT/pre-book/prebase-info/prebase-info.component';
import { PreproductInfoComponent } from './DIIGT/pre-book/preproduct-info/preproduct-info.component';
import { PrebookReviewComponent } from './DIIGT/prebook-review/prebook-review.component';
import { ReivewFormComponent } from './DIIGT/prebook-review/reivew-form/reivew-form.component';
import { ProbookOareviewComponent } from './DIIGT/probook-oareview/probook-oareview.component';
import { OareviewFormComponent } from './DIIGT/probook-oareview/oareview-form/oareview-form.component';
import { SupplementOaComponent } from './DIIGT/supplement-oa/supplement-oa.component';
import { SupplyFormComponent } from './DIIGT/supplement-oa/supply-form/supply-form.component';
import { ProbookSoComponent } from './DIIGT/probook-so/probook-so.component';
import { SoformComponent } from './DIIGT/probook-so/soform/soform.component';
import { MyEntrustComponent } from './DIIGT/my-entrust/my-entrust.component';
import { ShortAgencyComponent } from './DIIGT/my-entrust/short-agency/short-agency.component';

// dashboard
import { OitSummaryComponent } from './dashboard/oit-summary/oit-summary.component';
import { OitRealtimeComponent } from './dashboard/oit-realtime/oit-realtime.component';
import { LeadTimeComponent } from './dashboard/lead-time/lead-time.component';
import { PrebookNoComponent } from './DIIGT/preOrder/prebook-no/prebook-no.component';
import { RoleManagementComponent } from './DIIGT/role-management/role-management.component';
import { RoleManagementTreeComponent } from './DIIGT/role-management/components/tree/tree.component';
import { RoleManagementFilterComponent } from './DIIGT/role-management/components/role-management-filter/role-management-filter.component';
import { RoleManagementTableComponent } from './DIIGT/role-management/components/role-management-table/role-management-table.component';
import { RoleManagementFormComponent } from './DIIGT/role-management/components/role-management-form/role-management-form.component';
import { RoleManagementFormUserTableComponent } from './DIIGT/role-management/components/role-management-form-user-table/role-management-form-user-table.component';
import { RoleModalityBMCFormComponent } from './DIIGT/role-management/components/role-modality-bmc-form/role-modality-bmc-form.component';
import { UserBasicInfoFormComponent } from './DIIGT/role-management/components/user-basic-info-form/user-basic-info-form.component';
import { RegionManagementComponent } from './DIIGT/region-management/region-management.component';
import { RegionManagementTreeComponent } from './DIIGT/region-management/components/region-management-tree/region-management-tree.component';
import { RegionManagementFilterComponent } from './DIIGT/region-management/components/region-management-filter/region-management-filter.component';
import { RegionUserTableComponent } from './DIIGT/region-management/components/region-user-table/region-user-table.component';
import { RegionUserFormComponent } from './DIIGT/region-management/components/region-user-form/region-user-form.component';
import { UserManagementComponent } from './DIIGT/user-management/user-management.component';
import { UserManagementFormComponent } from './DIIGT/user-management/user-management-form/user-management-form.component';
import { BusinessInfoAreaComponent } from './DIIGT/user-management/user-management-form/business-info-area/business-info-area.component';
import { DistributorListComponent } from './DIIGT/preOrder/distributor-list/distributor-list.component';
import { MailApprovalComponent } from './DIIGT/mail-approval/mail-approval.component';
import { AutoApprovalComponent } from './DIIGT/auto-approval/auto-approval.component';

import { SpecialApprovalModule } from './special-approval/special-approval.module'
import { SpecialApprovalSettingModule } from './DIIGT/change-scene/special-approval-setting/special-approval-setting.module';
import { PermissionsIfDirective } from './directive/permissions-if.directive';

// registerLocaleData(localeCn, localeCnExtra);
registerLocaleData(zh);

// *******************************************************************************
// NgBootstrap

// *******************************************************************************
// App

// *******************************************************************************
// Pages


@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    IGTMasterDataMaintenanceComponent,
    IGTMasterDataMaintenanceEditComponent,
    DataDictionaryComponent,
    DictionaryFormComponent,
    DictionaryTableComponent,
    DictionaryModelComponent,
    IGTMyTaskComponent,
    MyToDoTaskComponent,
    MyDoneTaskComponent,
    MyTaskFormComponent,
    MyTaskTableComponent,
    AuthenticationLogoutComponent,
    IGTPersonManagementComponent,
    ExamineOrderIGTComponent,
    StatisticsIGTComponent,
    ExamineFormIGTComponent,
    IsCompletedPipe,
    MyApprovalStatePipe,
    YnPipe,
    HospitalTypePipe,
    LicenseTypePipe,
    ProcessStatusPipe,
    TimeFormatePipe,
    TimeFormatePipeMs,
    TimeFormatePipeNow,
    AuthCallbackComponent,
    ErrorpageComponent,
    UploadFileComponent,
    SimpleTableComponent,
    ReportComponent,
    DevloginComponent,
    UploadProgressbarComponent,
    SimplePdfViewerComponent,
    MultiSimplePdfViewerComponent,
    SysUserSelectComponent,
    SmallSimpleModalComponent,
    ApprovalBatchCommentsComponent,
    CustomTooltipComponent,
    TrainingcostModalComponent,
    ShomeComponent,
    CktakeComponent,

    MyPpendingComponent,
    MyCompleteComponent,
    BidComponent,
    BidIndexComponent,
    BidDucComponent,
    BidSuppComponent,
    BidRecordComponent,
    BidCkComponent, // d2c
    ApplyTenderComponent, ApplybaseComponent, NewproductComponent,
    SupplementComponent,  // d2c
    PreOrderComponent,
    PreOrderBaseInfoComponent,
    PreOrderProductInfoComponent,
    PreOrderProductTransferComponent,
    PreOrderSofonTransferComponent,
    PreOrderWinCheckTableComponent,
    AgentshowComponent,
    PreOrderProductFormComponent,
    AgentshowComponent,
    CompleteOitComponent,
    ContractsummaryComponent,
    OrdersummaryComponent,
    ContractsigningComponent,
    ApprovalrecordComponent,
    OitcompleteComponent,

    InorderComponent,
    InorderInComponent,
    InorderExComponent,
    InorderOrComponent,
    InorderAccComponent,


    WinningbidComponent,
    WinningbaseComponent,
    WinningproductComponent,
    WinningsuppleComponent,
    WinningapprovalComponent,
    WinningrecordComponent,
    WinningconfirmComponent,
    TenderreviewComponent,
    ReviewComponent,
    EmpComponent,
    EmpInComponent ,
    EmpPucComponent ,
    EmpSupComponent,
    EmpAccComponent,
    EmpEmpComponent,
    ConsignComponent,
    ConsignTabComponent,
    ConsignOrderComponent,
    ConsignAccComponent,
    ConsignConsignComponent,
    Report2Component,
    ContemplateComponent,
    RolemanagementComponent,
    DimensionsTreeComponent,
    RoleslistComponent,
    PersonnelmanagementsComponent ,
    GroupManagementComponents,
    AgentshowComponent,
    BidinforComponent,
    PreorderauditComponent,
    AuditrecordComponent,
    ApplyTenderModifComponent,
    ApprovalrecordaccComponent,
    ApplyRemarksComponent,
    PreordermodifComponent,
    InconmodifComponent,
    TransferboxComponent,
    IGTApprovalFlowlineComponent,
    ProcessBtn,
    ProcessModel,
    ProcessCompany,
    proceessAuthor,
    ProcessProject,
    NumberThousandth,
    TenderreviewSaleComponent,
    TransferboxSingleComponent,
    InorderExamineComponent,
    InoderfromComponent,
    ViewsubprocesseComponent,
    SuppfileComponent,
    PdfpreviewComponent,
    ThirdcheckComponent,
    RealTimeComponent,
    MyStartedComponent,
    MyStartTaskComponent,
    MyDraftComponents,
    MyDraftTaskComponent,
    AppTermsComponent,
    AnonymousComponent,
    LoadingComponent,
    MyViewComponent,
    MyViewFormComponent,
    MyViewTableComponent,
    ProcessThird,
    SupportFileUpComponent,
    TreeboxComponent,
    EndUserListComponent,
    VerMessComponent,
    EmpEmpAppComponent,
    TableShowComponent,
    ConfirmComponent,
    EntrustComponent,
    ChangeOnwerComponent,
    ConfirmVersionComponent,
    ChangeSceneComponent,
    ApproveChangeComponent,
    ChangeRecordComponent,
    StatusProject,
    OitSummaryComponent,
    OitRealtimeComponent,
    LeadTimeComponent,
    PreBookComponent,
    PrebaseInfoComponent,
    PreproductInfoComponent,
    PrebookReviewComponent,
    ReivewFormComponent,
    ProbookOareviewComponent,
    OareviewFormComponent,
    SupplementOaComponent,
    SupplyFormComponent,
    ProbookSoComponent,
    SoformComponent,
    StatusProject,
    MyEntrustComponent,
    ShortAgencyComponent,
    PrebookNoComponent,
    ShortAgencyComponent,
    RoleManagementComponent,
    RoleManagementTreeComponent,
    RoleManagementFilterComponent,
    RoleManagementTableComponent,
    RoleManagementFormComponent,
    RoleManagementFormUserTableComponent,
    RoleModalityBMCFormComponent,
    UserBasicInfoFormComponent,
    RegionManagementComponent,
    RegionManagementTreeComponent,
    RegionManagementFilterComponent,
    RegionUserTableComponent,
    RegionUserFormComponent,
    UserManagementComponent,
    UserManagementFormComponent,
    BusinessInfoAreaComponent,
    DistributorListComponent,
    MailApprovalComponent,
    AutoApprovalComponent,
    PermissionsIfDirective,
   ],

  imports: [
    SharedModule,
    SpecialApprovalModule,
    SpecialApprovalSettingModule,
    CustomersModule,
    BrowserModule,
    ServicesModule.forRoot(),
    NumeralModule.forRoot(),
    DeviceDetectorModule.forRoot(),
    HttpClientModule,
    Ng5SliderModule,
    BrowserAnimationsModule,
    FormlyBootstrapModule,
    // DynamicFormsCoreModule.forRoot(),
    // DynamicFormsBootstrapUIModule,
    // DynamicFormsNGBootstrapUIModule,

    // App
    AppRoutingModule,
    LayoutModule,

    //
    TreeModule.forRoot(),
    ToastrModule.forRoot(),
    LaddaModule,
    NgxDatatableModule,
    NgSelectModule,
    ConfirmationPopoverModule.forRoot({
      cancelButtonType: 'default btn-sm',
      confirmButtonType: 'primary btn-sm'
    }),
  ],

  entryComponents: [
    SmallSimpleModalComponent,
    TrainingcostModalComponent
  ],

  providers: [
    DatePipe,
    ServesiceService,
    EmitterService,
    Title,
    AppService,
    {
      provide: 'BASE_CONFIG',
      useValue: {
        uri: 'https://localhost:8080'
      }
    },
    {
      provide: LOCALE_ID,
      useValue: 'zh-Hans'
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: GlobalInterceptor,
      multi: true
    },
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    AuthGuard,
    CookieService,
    {
      provide: NZ_I18N,
      useValue: zh_CN,
    }
  ],

  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
}
