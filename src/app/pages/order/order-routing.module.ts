import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
  PreOrderComponent,
  PreordermodifComponent,
  PreorderauditComponent,
  ViewsubprocesseComponent,
  ExamineOrderComponent,
  InconmodifComponent,
  InorderComponent,
  InorderExamineComponent,
  ConsignComponent,
  SuppfileComponent,
  CompleteOitComponent
} from './index'


const routes: Routes = [
  {
    path: 'modifs',
    component: PreordermodifComponent
  },
  {
    path: 'audit',
    component: PreorderauditComponent
  },
  {
    path: 'view-subp',
    component: ViewsubprocesseComponent
  },
  {
    path: 'examine-order',
    component: ExamineOrderComponent
  },
  {
    path: 'in-con-modif',
    component: InconmodifComponent
  },
  {
    path: 'in-order',
    component: InorderComponent
  },
  {
    path: 'in-order-exam',
    component: InorderExamineComponent
  },
  {
    path: 'con-sign',
    component: ConsignComponent
  },
  {
    path: 'supp-file',
    component: SuppfileComponent
  },
  {
    path: 'complete-oit',
    component: CompleteOitComponent
  },
  {
    path: '',
    component: PreOrderComponent,
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderRoutingModule { }