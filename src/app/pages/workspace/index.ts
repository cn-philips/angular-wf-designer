import { HomeComponent } from "./home";
import {
  MyStartedComponent,
  MyStartedListComponent,
  MyStartedSearchItemComponent,
} from "./my-started";
import { MyDraftComponent } from "./my-draft";
import {
  MyViewComponent,
  myViewListComponent,
  MyViewSubListComponent,
  myViewSearchItemComponent,
} from "@pages/workspace/my-view";
import {
  ListComponent,
  SearchItemComponent,
} from "./components";
import {
  CardListComponent,
  TaskListComponent,
} from "@pages/workspace/home/components";
import { MyTodoComponent } from "./my-todo";
import {
  MyDoneComponent,
  MyDoneListComponent,
  MyDoneSearchItemComponent,
} from "@pages/workspace/my-done";

import {
  SignatureListComponent,
  SignatureSearchItemComponent,
  UploadFileImgComponent,
  WaiteMeSupplementListComponent,
  WaiteMeSupplementSearchItemComponent,
  WinningbidSupplementComponent,
  OitSupplementComponent,
  OmSupplementComponent,
  ThirdPartySupplementComponent,
  ContractSupplementComponent,
  ContractSignatureWatermarkComponent
} from "./waite-me-supplement";
import { MyReportComponent } from "./my-report";

export * from "./home";
export * from "./my-started";
export * from "./my-draft";
export * from "./my-view";
export * from "./my-report";
export * from "./components";
export * from "./waite-me-supplement";

export const COMPONENTS = [
  ListComponent,
  SearchItemComponent,
  CardListComponent,
  TaskListComponent,
  WaiteMeSupplementListComponent,
  WaiteMeSupplementSearchItemComponent,
  ContractSignatureWatermarkComponent,
  SignatureListComponent,
  SignatureSearchItemComponent,
  UploadFileImgComponent
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
  ContractSupplementComponent,
  MyReportComponent,
];
