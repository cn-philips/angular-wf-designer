import {
  CardListComponent,
  TaskListComponent,
} from "@pages/workspace/home/components";
import {
  MyDoneComponent,
  MyDoneListComponent,
  MyDoneSearchItemComponent,
} from "@pages/workspace/my-done";
import {
  MyViewComponent,
  MyViewSubListComponent,
  myViewListComponent,
  myViewSearchItemComponent,
} from "@pages/workspace/my-view";
import {
  ListComponent,
  SearchItemComponent,
} from "./components";
import { HomeComponent } from "./home";
import { MyDraftComponent } from "./my-draft";
import {
  MyStartedComponent,
  MyStartedListComponent,
  MyStartedSearchItemComponent,
} from "./my-started";
import { MyTodoComponent } from "./my-todo";

import { MyReportComponent } from "./my-report";
import {
  ContractElectronicSignatureComponent,
  ContractSignatureWatermarkComponent,
  ContractSupplementComponent,
  ElectronicSignatureSearchItemComponent,
  OitSupplementComponent,
  OmSupplementComponent,
  SignatureListComponent,
  ElectronicSignatureListComponent,
  SignatureSearchItemComponent,
  ThirdPartySupplementComponent,
  DealerThirdPartySupplementComponent,
  NewRandomCycleComponent,
  SelectThirdDealerComponent,
  DealerThirdPartyListComponent,
  UploadFileImgComponent,
  WaiteMeSupplementListComponent,
  WaiteMeSupplementSearchItemComponent,
  WinningbidSupplementComponent,
  RegisterICFComponent,
  RegisterICFListComponent
} from "./waite-me-supplement";

export * from "./components";
export * from "./home";
export * from "./my-draft";
export * from "./my-report";
export * from "./my-started";
export * from "./my-view";
export * from "./waite-me-supplement";

export const COMPONENTS = [
  ListComponent,
  SearchItemComponent,
  CardListComponent,
  TaskListComponent,
  WaiteMeSupplementListComponent,
  WaiteMeSupplementSearchItemComponent,
  ContractSignatureWatermarkComponent,
  ContractElectronicSignatureComponent,
  SignatureListComponent,
  ElectronicSignatureListComponent,
  SignatureSearchItemComponent,
  ElectronicSignatureSearchItemComponent,
  UploadFileImgComponent,
  DealerThirdPartyListComponent,
  RegisterICFListComponent,
  SelectThirdDealerComponent,
];

export const PAGES = [
  HomeComponent,
  MyDraftComponent,
  MyStartedComponent,
  MyViewComponent,
  MyTodoComponent,
  MyDoneComponent,
  MyDoneListComponent,
  MyDoneSearchItemComponent,
  MyStartedListComponent,
  MyStartedSearchItemComponent,
  myViewListComponent,
  MyViewSubListComponent,
  myViewSearchItemComponent,
  WinningbidSupplementComponent,
  OitSupplementComponent,
  OmSupplementComponent,
  ThirdPartySupplementComponent,
  DealerThirdPartySupplementComponent,
  NewRandomCycleComponent,
  ContractSupplementComponent,
  MyReportComponent,
  RegisterICFComponent,
];
