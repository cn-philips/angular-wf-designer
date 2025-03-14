import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import {
  ContractComponent,
  ContractExamineComponent,
  ContractSignComponent,
  ContractSignDetailComponent,
  OitcompleteComponent,
  OrdersummaryBaseInfoComponent,
  PreOrderComponent,
  PreOrderoaComponent,
  PreorderexamineComponent
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
  {
    path: "contractSignDetail",
    component: ContractSignDetailComponent,
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
