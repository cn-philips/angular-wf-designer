import {
  BusinessConfigComponent,
  SpecialApprovalSettingComponent,
  ApproveNodeFormComponent,
  ApproveProcFormComponent,
  ApproveProcListComponent,
  BusinessProcFormComponent,
  BusinessProcListComponent,
  SpecialApprovalItemComponent,
} from "./business-config";
import {
  DataDictionaryComponent,
  DictionaryFormComponent,
  DictionaryModalComponent,
  DictionaryTableComponent,
} from "./data-dictionary";
import { MyDelegationComponent, ShortAgencyComponent } from "./my-delegation";
import {
  RegionUserComponent,
  BusinessInfoAreaComponent,
  RegionManagementFilterComponent,
  RegionManagementTreeComponent,
  RegionUserFormComponent,
  RegionUserTableComponent,
  RoleModalityBMCFormComponent,
  UserBasicInfoFormComponent,
} from "./region-user";
import { RoleComponent } from "./role";
import { RolePermissionComponent } from "./role-permission";
import { ChangeOwnerComponent } from "./change-owner/change-owner.component";

import { MessageManagementComponent } from "./message-management/message-management.component";
import {
  AnnouncementFormDialogComponent,
  AnnouncementSettingComponent,
  CarouselFormDialogComponent,
  CarouselSettingComponent,
  NotificationFormDialogComponent,
  NotificationSettingComponent,
} from "./message-management";
import {
  TaskAssignComponent,
  OitComponent,
  SpecialApprovalComponent,
  AssignDialogComponent,
} from "./task-assign";
import { ScheduleComponent,ScheduleListComponent,ScheduleSearchComponent } from './schedule';

export * from "./business-config";
export * from "./data-dictionary";
export * from "./my-delegation";
export * from "./region-user";
export * from "./role";
export * from "./role-permission";
export * from "./message-management";
export * from "./change-owner/change-owner.component";
export * from "./message-management";
export * from "./schedule";
export * from "./task-assign";

export const PAGES = [
  BusinessConfigComponent,
  DataDictionaryComponent,
  MyDelegationComponent,
  RegionUserComponent,
  RoleComponent,
  RolePermissionComponent,
  ChangeOwnerComponent,
  MessageManagementComponent,
  AnnouncementSettingComponent,
  CarouselSettingComponent,
  NotificationSettingComponent,
  ScheduleComponent,
  TaskAssignComponent,
];

export const COMPONENTS = [
  SpecialApprovalSettingComponent,
  ApproveNodeFormComponent,
  ApproveProcFormComponent,
  ApproveProcListComponent,
  BusinessProcFormComponent,
  BusinessProcListComponent,
  DictionaryFormComponent,
  DictionaryModalComponent,
  DictionaryTableComponent,
  ShortAgencyComponent,
  BusinessInfoAreaComponent,
  RegionManagementFilterComponent,
  RegionManagementTreeComponent,
  RegionUserFormComponent,
  RegionUserTableComponent,
  RoleModalityBMCFormComponent,
  UserBasicInfoFormComponent,
  AnnouncementFormDialogComponent,
  CarouselFormDialogComponent,
  NotificationFormDialogComponent,
  SpecialApprovalItemComponent,
  OitComponent,
  SpecialApprovalComponent,
  AssignDialogComponent,
  ScheduleListComponent,
  ScheduleSearchComponent,
];
