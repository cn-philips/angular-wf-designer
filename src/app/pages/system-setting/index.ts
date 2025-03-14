import {
  BusinessConfigComponent,
  // SpecialApprovalSettingComponent,
  // ApproveNodeFormComponent,
  // ApproveProcFormComponent,
  // ApproveProcListComponent,
  // BusinessProcFormComponent,
  // BusinessProcListComponent,
  SpecialApprovalItemComponent,
} from "./business-config";
import { ChangeOwnerComponent } from "./change-owner/change-owner.component";
import {
  DataDictionaryComponent,
  DictionaryFormComponent,
  DictionaryModalComponent,
  DictionaryTableComponent,
} from "./data-dictionary";
import {
  AnnouncementFormDialogComponent,
  AnnouncementSettingComponent,
  CarouselFormDialogComponent,
  CarouselSettingComponent,
  NotificationFormDialogComponent,
  NotificationSettingComponent,
} from "./message-management";
import { MessageManagementComponent } from "./message-management/message-management.component";
import { MyDelegationComponent, ShortAgencyComponent } from "./my-delegation";
import {
  BusinessInfoAreaComponent,
  RegionManagementFilterComponent,
  RegionManagementTreeComponent,
  RegionUserComponent,
  RegionUserFormComponent,
  RegionUserTableComponent,
  RoleModalityBMCFormComponent,
  UserBasicInfoFormComponent,
} from "./region-user";
import { RoleComponent } from "./role";
import { RolePermissionComponent } from "./role-permission";
import {
  ScheduleComponent,
  ScheduleListComponent,
  ScheduleSearchComponent,
} from "./schedule";
import {
  DealerManageComponent,
  SignComponent,
  TemplateManageComponent,
  SignerManageComponent,
} from "./sign";
import {
  ApproveNodeFormComponent,
  ApproveProcFormComponent,
  ApproveProcListComponent,
  BusinessProcFormComponent,
  BusinessProcListComponent,
  SpecialApprovalSettingComponent,
  spSettingComponent,
} from "./sp-setting";
import {
  AssignDialogComponent,
  OitComponent,
  SpecialApprovalComponent,
  TaskAssignComponent,
} from "./task-assign";

export * from "./business-config";
export * from "./change-owner/change-owner.component";
export * from "./data-dictionary";
export * from "./message-management";
export * from "./my-delegation";
export * from "./region-user";
export * from "./role";
export * from "./role-permission";
export * from "./schedule";
export * from "./sign";
export * from "./sp-setting";
export * from "./task-assign";

export const PAGES = [
  BusinessConfigComponent,
  DataDictionaryComponent,
  MyDelegationComponent,
  RegionUserComponent,
  RoleComponent,
  RolePermissionComponent,
  SignComponent,
  ChangeOwnerComponent,
  MessageManagementComponent,
  AnnouncementSettingComponent,
  CarouselSettingComponent,
  NotificationSettingComponent,
  ScheduleComponent,
  TaskAssignComponent,
  spSettingComponent,
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
  DealerManageComponent,
  TemplateManageComponent,
  SignerManageComponent,
];
