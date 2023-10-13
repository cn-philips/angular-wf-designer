import { NgModule } from "@angular/core";
import { RouterModule, Route } from "@angular/router";
import {
  HomeComponent,
  MyStartedComponent,
  MyDraftComponent,
  MyViewComponent,
  MyReportComponent,
} from "./index";
import {} from "@pages/workspace/my-todo/my-todo.component";
// import {ListComponent, SearchItemComponent} from '@pages/workspace/my-todo';
import { MyDoneComponent } from "@pages/workspace/my-done/my-done.component";
import { NgZorroAntdModule } from "ng-zorro-antd";
import { CommonModule } from "@angular/common";
import { SharedModule } from "@shared/shared.module";
import { MyTodoComponent } from "@pages/workspace/my-todo/my-todo.component";
import {
  WinningbidSupplementComponent,
  OitSupplementComponent,
  OmSupplementComponent,
  ThirdPartySupplementComponent,
  ContractSupplementComponent,
  ContractSignatureWatermarkComponent,
} from "@pages/workspace/waite-me-supplement";

const routes: Route[] = [
  {
    path: "home",
    component: HomeComponent,
    data: { breadcrumb: "工作台首页" },
  },
  {
    path: "my-started",
    component: MyStartedComponent,
    data: { breadcrumb: "我的申请" },
  },
  {
    path: "my-draft",
    component: MyDraftComponent,
    data: { breadcrumb: "我的草稿" },
  },
  {
    path: "my-view",
    component: MyViewComponent,
    data: { breadcrumb: "我可查看" },
  },
  {
    path: "my-todo",
    component: MyTodoComponent,
    data: { breadcrumb: "我的待办" },
  },
  {
    path: "my-done",
    component: MyDoneComponent,
    data: { breadcrumb: "我的已办" },
  },
  {
    path: "my-report",
    component: MyReportComponent,
    data: { breadcrumb: "我的报表" },
  },
  {
    path: "winningbid-supplement",
    component: WinningbidSupplementComponent,
    data: { breadcrumb: "中标确认文件待补充" },
  },
  {
    path: "oit-supplement",
    component: OitSupplementComponent,
    data: { breadcrumb: "OIT完成文件待补充" },
  },
  {
    path: "om-supplement",
    component: OmSupplementComponent,
    data: { breadcrumb: "待上传SO#" },
  },
  {
    path: "third-supplement",
    component: ThirdPartySupplementComponent,
    data: { breadcrumb: "第三方自采核检" },
  },
  {
    path: "contract-supplement",
    component: ContractSupplementComponent,
    data: { breadcrumb: "待上传正本合同" },
  },
  {
    path:"contract-signature",
    component:ContractSignatureWatermarkComponent,
    data:{breadcrumb:"合同电子水印签章"}
  },
  { path: "", redirectTo: "home", pathMatch: "full" },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    NgZorroAntdModule,
    CommonModule,
    SharedModule,
  ],
  exports: [RouterModule],
  declarations: [],
})
export class WorkspaceRoutingModule {}
