import {BrowserModule, Title} from '@angular/platform-browser';
import {LOCALE_ID, NgModule} from '@angular/core';
import localeCn from '@angular/common/locales/zh-Hans';
import zh from '@angular/common/locales/zh';
import localeCnExtra from '@angular/common/locales/extra/zh-Hans';
import {DatePipe, HashLocationStrategy, LocationStrategy, registerLocaleData} from '@angular/common';
import {NumeralModule} from 'ngx-numeral';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormlyModule} from '@ngx-formly/core';
import {FormlyBootstrapModule} from '@ngx-formly/bootstrap';
// import {DynamicFormsCoreModule} from '@ng-dynamic-forms/core';
// import {DynamicFormsBootstrapUIModule} from '@ng-dynamic-forms/ui-bootstrap';
// import {DynamicFormsNGBootstrapUIModule} from '@ng-dynamic-forms/ui-ng-bootstrap';
import {CookieService} from 'ngx-cookie-service';
import {ServicesModule} from './services';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AppService} from './app.service';
import {LayoutModule} from './layout/layout.module';
import {HomeComponent} from './home/home.component';
import {HomepageComponent} from './DIIGT/homepage/homepage.component';
import {Page2Component} from './page-2/page-2.component';
import { CustomersModule } from './DIIGT/apply-tender/apply-tender.module';
import {MasterDataMaintenanceComponent} from './master-data-maintenance/master-data-maintenance.component';
import {
  MasterDataMaintenanceEditComponent,
} from './master-data-maintenance/master-data-maintenance-edit/master-data-maintenance-edit.component';
import {TemplateMaintenanceComponent} from './template-maintenance/template-maintenance.component';
import {DimensiontreeComponent} from './configure/dimensiontree.component';
import {ApprovalFlowlineComponent} from './approval-flowline/approval-flowline.component';
import {OaBwsfileComponent} from './oa-bwsfile/oa-bwsfile.component';
import {AdmintoolsComponent} from './configure/admintools.component';
import {TaskmanagerComponent} from './configure/task-manager/taskmanager.component';
import {ProcessmanagerComponent} from './configure/process-manager/processmanager.component';
// *******************************************************************************
// Libs
import {LaddaModule} from 'angular2-ladda';
import {ToastrModule} from 'ngx-toastr';
import {TreeModule} from 'angular-tree-component';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {NgSelectModule} from '@ng-select/ng-select';
import {ConfirmationPopoverModule} from 'angular-confirmation-popover';
import {PersonInfoComponent} from './person-info/person-info.component';
import {AuthenticationLogoutComponent} from './authentication-logout/authentication-logout.component';
import {RoleAuthorizationComponent} from './role-authorization/role-authorization.component';
import {PersonManagementComponent} from './person-management/person-management.component';
import {NewApprovalComponent} from './new-approval/new-approval.component';
import {MyApprovalComponent} from './my-approval/my-approval.component';
import {MyTaskComponent} from './my-task/my-task.component';
import {ApprovalMainModalComponent} from './approval-main-modal/approval-main-modal.component';
import {ApprovalMainFormComponent} from './approval-main-form/approval-main-form.component';
import {ApprovalMainCommentsComponent} from './approval-main-comments/approval-main-comments.component';
import {ApprovalDiagramComponent} from './approval-diagram/approval-diagram.component';
import {ApprovalSimpleModalComponent} from './approval-simple-modal/approval-simple-modal.component';
import {MyDraftComponent} from './my-draft/my-draft.component';
import {IsCompletedPipe} from './pipes/is-completed.pipe';
import {MyApprovalStatePipe} from './pipes/my-approval-state.pipe';
import {LicenseTypePipe} from './pipes/license-type.pipe';
import {YnPipe} from './pipes/yn.pipe';
import {ProcessStatusPipe} from './pipes/process-status.pipe';
import {TimeFormatePipe} from './pipes/time-formate.pipe';
import {TimeFormatePipeMs} from './pipes/process-time-ms.pipe';
import {TimeFormatePipeNow}from './pipes/tiem-formatenow.pipe';
import {ApprovalHistoryInfoComponent} from './approval-history-info/approval-history-info.component';
import {ClaimTaskComponent} from './claim-task/claim-task.component';
import {QuotationAddComponent} from './quotation/quotation-add/quotation-add.component';
import {QuotationMainComponent} from './quotation/quotation-main/quotation-main.component';
import {MyTaskPendingComponent} from './my-task-pending/my-task-pending.component';
import {MyTaskCompleteComponent} from './my-task-complete/my-task-complete.component';
import {ContractExportModalComponent} from './my-task/contract-export-modal/contract-export-modal.component';
import {QuotationManagementComponent} from './quotation-management/quotation-management.component';
import {HospitalTypePipe} from './pipes/hospital-type.pipe';
import {NgbdatepickComponentComponent} from './quotation/ngbdatepick-component/ngbdatepick-component.component';
import {QuotationLicenseModalComponent} from './quotation/quotation-license-modal/quotation-license-modal.component';
import {Ng5SliderModule} from 'ng5-slider';
import {QuotationHiddenComponent} from './quotation/quotation-hidden/quotation-hidden.component';
import {SelectOrderTypeComponent} from './quotation/select-order-type/select-order-type.component';
import {CommercialQuotationAddComponent} from './quotation/commercial-quotation-add/commercial-quotation-add.component';
import {AuthCallbackComponent} from './auth-callback/auth-callback.component';
import {RolelistComponent} from './configure/rolelist.component';
import {DmsngselectComponent} from './quotation/dmsngselect/dmsngselect.component';
import {ErrorpageComponent} from './expage/errorpage/errorpage.component';
import {UploadFileComponent} from './component/upload-file/upload-file.component';
import {SimpleTableComponent} from './component/simple-table/simple-table.component';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { UploadProgressbarComponent } from './component/upload-progressbar/upload-progressbar.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
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

import{ProcessCompany} from './pipes/process-company.pipe';
import{proceessAuthor}from'./pipes/proceess-author.pipe';
import{MyDraftComponents} from './DIIGT/my-draft/my-draft.component';
import {StatusProject} from './pipes/status-project.pipe';
// *******************************************************************************
// Guards
import {AuthGuard} from './guards/auth-guard.service';
// Interceptor
import {GlobalInterceptor} from './class/global-interceptor';
// @ts-ignore
import {
  NgZorroAntdModule,
  NZ_I18N,
  zh_CN,
} from 'ng-zorro-antd';
import {HomeMentionComponent} from './home-mention/home-mention.component';
import {PersonnelManagementComponent} from './personnel-management/personnel-management.component';
import {GroupManagementComponent} from './group-management/group-management.component';
import {RolesGroupComponent} from './roles-group/roles-group.component';
import {ReportComponent} from './report/report.component';
import {EmitterService} from './services/emitter.service';
import {DevloginComponent} from './devlogin/devlogin.component';
import {ProcesstemplatemanagerComponent} from './configure/processtemplate-manager/processtemplatemanager.component';
import { QuotationPreviewComponent } from './quotation-management/quotation-preview/quotation-preview.component';
import { TrainingcostModalComponent } from './component/trainingcost-modal/trainingcost-modal.component';
import { ApprovalAcceptTermComponent } from './approval-accept-term/approval-accept-term.component';
// public
import { IGTApprovalFlowlineComponent } from './DIIGT/components/approval-flowline/approval-flowline.component';
// d2c realted
import { D2cUsCommercialQuotationComponent } from './quotation/d2c-us-commercial-quotation/d2c-us-commercial-quotation.component';
import { FunnelInfoComponent } from './quotation/funnel-info/funnel-info.component';

import { ShomeComponent } from './DIIGT/shome/shome.component';
import { CktakeComponent } from './DIIGT/cktake/cktake.component';
import { MyComponent } from './DIIGT/my/my.component';
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

import { InconComponent } from './DIIGT/incon/incon.component';
import { InconInComponent } from './DIIGT/incon-in/incon-in.component';
import { InconFileComponent } from './DIIGT/incon-file/incon-file.component';
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
import { ApploadingComponent } from './DIIGT/components/apploading/apploading.component';
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
    // Pages
    HomeComponent,

    HomepageComponent,

    Page2Component,
    MasterDataMaintenanceComponent,
    MasterDataMaintenanceEditComponent,
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
    PersonInfoComponent,
    TemplateMaintenanceComponent,
    AuthenticationLogoutComponent,
    RoleAuthorizationComponent,
    PersonManagementComponent,
    IGTPersonManagementComponent,
    ExamineOrderIGTComponent,
    StatisticsIGTComponent,
    ExamineFormIGTComponent,
    NewApprovalComponent,
    MyApprovalComponent,
    MyTaskComponent,
    MyTaskPendingComponent,
    MyTaskCompleteComponent,
    ApprovalMainModalComponent,
    ApprovalMainFormComponent,
    ApprovalMainCommentsComponent,
    ApprovalDiagramComponent,
    ApprovalSimpleModalComponent,
    MyDraftComponent,
    IsCompletedPipe,
    MyApprovalStatePipe,
    YnPipe,
    ApprovalHistoryInfoComponent,
    ClaimTaskComponent,
    QuotationAddComponent,
    QuotationMainComponent,
    QuotationManagementComponent,
    HospitalTypePipe,
    NgbdatepickComponentComponent,
    QuotationLicenseModalComponent,
    LicenseTypePipe,
    ProcessStatusPipe,
    TimeFormatePipe,
    TimeFormatePipeMs,
    TimeFormatePipeNow,
    QuotationHiddenComponent,
    SelectOrderTypeComponent,
    CommercialQuotationAddComponent,
    ContractExportModalComponent,
    AuthCallbackComponent,
    RolelistComponent,
    DimensiontreeComponent,
    DmsngselectComponent,
    ApprovalFlowlineComponent,
    OaBwsfileComponent,
    ErrorpageComponent,
    AdmintoolsComponent,
    UploadFileComponent,
    SimpleTableComponent,
    HomeMentionComponent,
    PersonnelManagementComponent,
    GroupManagementComponent,
    RolesGroupComponent,
    ReportComponent,
    DevloginComponent,
    UploadProgressbarComponent,
    SimplePdfViewerComponent,
    MultiSimplePdfViewerComponent,
    SysUserSelectComponent,
    TaskmanagerComponent,
    ProcessmanagerComponent,
    ProcesstemplatemanagerComponent,
    QuotationPreviewComponent,
    SmallSimpleModalComponent,
    ApprovalBatchCommentsComponent,
    CustomTooltipComponent,
    TrainingcostModalComponent,
    ApprovalAcceptTermComponent,
    D2cUsCommercialQuotationComponent,  // d2c
    ShomeComponent,
    CktakeComponent,
    MyComponent,
    MyPpendingComponent,
    MyCompleteComponent,
    BidComponent,
    BidIndexComponent,
    BidDucComponent,
    BidSuppComponent,
    BidRecordComponent,
    BidCkComponent, // d2c
    FunnelInfoComponent, ApplyTenderComponent, ApplybaseComponent, NewproductComponent,
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
    InconComponent,
    InconInComponent,
    InconFileComponent,
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
    ApploadingComponent,
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
    StatusProject
  ],

  imports: [
    CustomersModule,
    BrowserModule,
    NgbModule.forRoot(),
    ServicesModule.forRoot(),
    NumeralModule.forRoot(),
    DeviceDetectorModule.forRoot(),
    HttpClientModule,
    FormsModule,
    Ng5SliderModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    NgxExtendedPdfViewerModule,
    FormlyModule.forRoot({
      types: [
        {name: 'quotationadd', component: QuotationAddComponent},
        {name: 'quotationhidden', component: QuotationHiddenComponent},
        {name: 'datepicker', component: NgbdatepickComponentComponent},
        {name: 'dmsngselect', component: DmsngselectComponent},
        {name: 'selectordertype', component: SelectOrderTypeComponent},
        {name: 'commercialquotationadd', component: CommercialQuotationAddComponent},
        { name: 'd2c-us-commercial-quotation', component: D2cUsCommercialQuotationComponent}
      ],
      validationMessages: [
        {name: 'required', message: '该信息为必填项'}
      ],
    }),
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
    /** 导入 ng-zorro-antd 模块 **/
    NgZorroAntdModule,
  ],

  entryComponents: [
    ApprovalMainModalComponent,
    ApprovalSimpleModalComponent,
    QuotationLicenseModalComponent,
    ContractExportModalComponent,
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
