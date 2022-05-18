import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";

// component
import { ApprovedComponent } from "./approved/approved.component";
import { DraftComponent } from "./draft/draft.component";
import { HomeComponent } from "./home/home.component";
import { RequestComponent } from "./request/request.component";
import { ViewComponent } from "./view/view.component";
import { WaitingApproveComponent } from "./waiting-approve/waiting-approve.component";
import { RequestFormComponent } from "./request-form/request-form.component";
import { ReportComponent } from "./report/report.component";

// widget
import { BasicInfoComponent } from "./request-form/widgets/basic-info/basic-info.component";
import { SelectApproverComponent } from "./request-form/widgets/select-approver/select-approver.component";
import { CcInfoComponent } from "./request-form/widgets/cc-info/cc-info.component";
import { WarrantyInfoComponent } from "./request-form/widgets/warranty-info/warranty-info.component";
import { FlowInfoComponent } from "./request-form/widgets/flow-info/flow-info.component";
import { SelectHospitalComponent } from "./request-form/widgets/select-hospital/select-hospital.component";
import { SelectDealerComponent } from "./request-form/widgets/select-dealer/select-dealer.component";
import { ApproveFormComponent } from "./request-form/widgets/approve-form/approve-form.component";
import { FeedbackComponent } from "./request-form/widgets/feedback/feedback.component";
import { ApproveHistoryComponent } from "./request-form/widgets/approve-history/approve-history.component";
import { SelectReferenceComponent } from "./request-form/widgets/select-reference/select-reference.component";
import { UploadFileListComponent } from "./request-form/widgets/upload-file-list/upload-file-list.component";
import { ProductListComponent } from "./request-form/widgets/product-list/product-list.component";
import { ProductionOrderInfoComponent } from "./request-form/widgets/order-info/production/production.component";
import { WarrantyOrderInfoComponent } from "./request-form/widgets/order-info/warranty/warranty.component";
import { TransportationOrderInfoComponent } from "./request-form/widgets/order-info/transportation/transportation.component";
import { MachineComponent } from "./request-form/widgets/order-info/machine/machine.component";
import { AdditionalInstallationCostComponent } from "./request-form/widgets/order-info/additional-installation-cost/additional-installation-cost.component";
import { TransferLibComponent } from './request-form/widgets/order-info/transfer-lib/transfer-lib.component'
import { ExchangeInfoComponent } from './request-form/widgets/exchange-info/exchange-info.component'
import { DifferenceAndCostInfoComponent } from './request-form/widgets/difference-and-cost-info/difference-and-cost-info.component'
import { LcAmendmentOrderInfoComponent } from "./request-form/widgets/order-info/lc-amendment/lc-amendment.component";
import { RddOitOrderInfoComponent } from "./request-form/widgets/order-info/rdd-oit/rdd-oit.component";
import { DeBookComponent } from './request-form/widgets/order-info/de-book/de-book.component';

const COMPONENTS = [
  ApprovedComponent,
  DraftComponent,
  HomeComponent,
  RequestComponent,
  ViewComponent,
  WaitingApproveComponent,
  RequestFormComponent,
  ReportComponent,
];
const WIDGETS = [
  ApproveHistoryComponent,
  ApproveFormComponent,
  BasicInfoComponent,
  SelectApproverComponent,
  CcInfoComponent,
  FeedbackComponent,
  WarrantyInfoComponent,
  FlowInfoComponent,
  SelectHospitalComponent,
  SelectDealerComponent,
  SelectReferenceComponent,
  UploadFileListComponent,
  ProductListComponent,
  ProductionOrderInfoComponent,
  WarrantyOrderInfoComponent,
  TransportationOrderInfoComponent,
  AdditionalInstallationCostComponent,
  LcAmendmentOrderInfoComponent,
  RddOitOrderInfoComponent,
  MachineComponent,
  AdditionalInstallationCostComponent,
  TransferLibComponent,
  ExchangeInfoComponent,
  DifferenceAndCostInfoComponent,
  DeBookComponent,
];

export {
  ApprovedComponent,
  DraftComponent,
  HomeComponent,
  RequestComponent,
  ViewComponent,
  WaitingApproveComponent,
  RequestFormComponent,
  ReportComponent,
};

@NgModule({
  declarations: [...COMPONENTS, ...WIDGETS],
  imports: [SharedModule],
  exports: [],
})
export class SpecialApprovalModule {}
