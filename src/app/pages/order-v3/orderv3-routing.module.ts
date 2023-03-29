import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import {
  PreOrderComponent,
  PreorderexamineComponent,
  PreOrderoaComponent,
  ContractComponent,
  ContractExamineComponent,
  OrdersummaryBaseInfoComponent,
  OitcompleteComponent,
  ContractSignComponent,
} from "./index";
const routes: Routes = [
  {
    path: "",
    component: PreOrderComponent,
    data: { breadcrumb: "新建进单准备表" },
  },
  {
    path: "orderExamine",
    component: PreorderexamineComponent,
  },
  {
    path: "orderOa",
    component: PreOrderoaComponent,
    data: { breadcrumb: "OA审核" },
  },
  {
    path: "contract",
    component: ContractComponent,
    data: { breadcrumb: "合同概要表" },
  },
  {
    path: "contractExamine",
    component: ContractExamineComponent,
    data: { breadcrumb: "合同概要表审核" },
  },
  {
    path: "oitcomplete",
    component: OitcompleteComponent,
    data: { breadcrumb: "OIT文件上传" },
  },
  {
    path: "ordersummary",
    component: OrdersummaryBaseInfoComponent,
    data: { breadcrumb: "Order Summary" },
  },
  {
    path: "contractSign",
    component: ContractSignComponent,
    data: { breadcrumb: "合同签署" },
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [],
  declarations: [],
  providers: [],
})
export class OrderV3RoutingModule {}
