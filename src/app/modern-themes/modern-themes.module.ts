import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ImageCropperModule } from "ngx-image-cropper";
import { ProgressTabsComponent } from "./components/progress-tabs/progress-tabs.component";
import { ProgressTabComponent } from "./components/progress-tabs/components/progress-tab/progress-tab.component";
import { ProgressTabTitleDirective } from "./directives/progress-tab-title.directive";
import { ProgressTabContentDirective } from "./directives/progress-tab-content.directive";
import { ProgressTabIconDirective } from "./directives/progress-tab-icon.directive";
import { LabelPopupComponent } from "./components/label-popup/label-popup.component";
import { LabelPopupContentDirective } from "./directives/label-popup-content.directive";
import { NgZorroAntdModule } from "ng-zorro-antd";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { UtilityService } from "../core/services";
import { DialogPanelComponent } from "./components/dialog-panel/dialog-panel.component";
import { DialogPanelTabComponent } from "./components/dialog-panel/components/dialog-panel-tab/dialog-panel-tab.component";
import { SystemSettingsComponent } from "./components/system-settings/system-settings.component";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { QAListComponent } from "./components/qalist/qalist.component";
import { PaginationButtonComponent } from "./components/pagination-button/pagination-button.component";
import { ApprovalDialogComponent } from "./components/approval-dialog/approval-dialog.component";
import { ProgressTabContentComponent } from "./components/progress-tabs/components/progress-tab-content/progress-tab-content.component";
import { ApprovalCardComponent } from "./components/approval-dialog/components/approval-card/approval-card.component";
import { FormSectionComponent } from "./components/form-section/form-section.component";
import { TabsComponent } from "./components/tabs/tabs.component";
import { TabComponent } from "./components/tabs/components/tab/tab.component";
import { UserProfileComponent } from "./components/user-profile/user-profile.component";
import { AlertComponent } from "./components/alert/alert.component";
import { SignatureComponent } from "./components/signature/signature.component";
import { CarouselComponent } from "./components/carousel/carousel.component";
import { ApprovalProgressComponent } from "./components/approval-progress/approval-progress.component";
import { HtmlPipe } from "./pipes/html.pipe";
import { SpecialApprovalEntriesComponent } from "./components/approval-dialog/components/special-approval-entries/special-approval-entries.component";
import { BiddingApprovalEntriesComponent } from "./components/approval-dialog/components/bidding-approval-entries/bidding-approval-entries.component";
import { OrderApprovalEntriesComponent } from "./components/approval-dialog/components/order-approval-entries/order-approval-entries.component";
import { BreadcrumbComponent } from "./components/breadcrumb/breadcrumb.component";
import { RouterModule } from "@angular/router";
import { ImageEditorComponent } from "./components/image-editor/image-editor.component";
import { ImageControlComponent } from "./components/image-control/image-control.component";
import { ImageStorageComponent } from "./components/image-editor/components/image-storage/image-storage.component";
import { BreadcrumbService } from "./services/breadcrumb.service";
import { PrebookApprovalEntriesComponent } from './components/approval-dialog/components/prebook-approval-entries/prebook-approval-entries.component';
@NgModule({
  declarations: [
    ProgressTabsComponent,
    ProgressTabComponent,
    ProgressTabContentComponent,
    ProgressTabTitleDirective,
    ProgressTabContentDirective,
    ProgressTabIconDirective,
    LabelPopupComponent,
    LabelPopupContentDirective,
    DialogPanelComponent,
    DialogPanelTabComponent,
    SystemSettingsComponent,
    QAListComponent,
    PaginationButtonComponent,
    ApprovalDialogComponent,
    ApprovalCardComponent,
    FormSectionComponent,
    TabsComponent,
    TabComponent,
    UserProfileComponent,
    AlertComponent,
    SignatureComponent,
    CarouselComponent,
    ApprovalProgressComponent,
    HtmlPipe,
    SpecialApprovalEntriesComponent,
    BiddingApprovalEntriesComponent,
    OrderApprovalEntriesComponent,
    BreadcrumbComponent,
    ImageEditorComponent,
    ImageControlComponent,
    ImageStorageComponent,
    PrebookApprovalEntriesComponent,
  ],
  imports: [
    ImageCropperModule,
    CommonModule,
    FormsModule,
    NgZorroAntdModule,
    NgbModule,
    ReactiveFormsModule,
    TranslateModule,
    RouterModule,
  ],
  exports: [
    ProgressTabsComponent,
    ProgressTabComponent,
    ProgressTabContentComponent,
    ProgressTabTitleDirective,
    ProgressTabContentDirective,
    ProgressTabIconDirective,
    LabelPopupComponent,
    LabelPopupContentDirective,
    DialogPanelComponent,
    DialogPanelTabComponent,
    SystemSettingsComponent,
    TranslateModule,
    QAListComponent,
    PaginationButtonComponent,
    ApprovalDialogComponent,
    FormSectionComponent,
    TabsComponent,
    TabComponent,
    UserProfileComponent,
    AlertComponent,
    SignatureComponent,
    CarouselComponent,
    ApprovalProgressComponent,
    BreadcrumbComponent,
    ImageControlComponent,
    HtmlPipe,
  ],
  providers: [UtilityService],
})
export class ModernThemesModule {}
