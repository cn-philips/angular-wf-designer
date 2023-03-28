import {
  PdfPreviewComponent,
  ImportOppComponent,
  BasicInfoComponent,
  ProductInfoComponent,
  SupplementInfoComponent,
  BiddingApprovalComponent,
  AuthApprovalComponent,
  BiddingRecordComponent,
  CpVerifyComponent,
  BiddingConfirmComponent,
  SupplementFileComponent,
  AddProductComponent,
  BiddingReferenceComponent,
  OitRelatedLinkComponent,
} from "./components";

import { BiddingFormComponent, BiddingDetailComponent } from "./pages";
export * from './components'
export * from "./pages";

export const PAGES = [BiddingFormComponent, BiddingDetailComponent];

export const COMPONENTS = [
  PdfPreviewComponent,
  ImportOppComponent,
  BasicInfoComponent,
  ProductInfoComponent,
  SupplementInfoComponent,
  BiddingApprovalComponent,
  AuthApprovalComponent,
  BiddingRecordComponent,
  CpVerifyComponent,
  BiddingConfirmComponent,
  SupplementFileComponent,
  AddProductComponent,
  BiddingReferenceComponent,
  OitRelatedLinkComponent,
];
