import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import {
  ApplyTenderComponent,
  ApplyTenderModifComponent,
  TenderReviewComponent,
  TenderReviewSaleComponent,
  EmpComponent,
  BidComponent,
  WinningBidComponent,
  SupportFileUpComponent,
} from './index'

const routes: Route[] = [
  { path: 'apply-tender', component: ApplyTenderComponent },
  { path: 'apply-tender-modif', component: ApplyTenderModifComponent },
  { path: 'tender-review', component: TenderReviewComponent },
  { path: 'tender-review-sale', component: TenderReviewSaleComponent },
  { path: 'emp', component: EmpComponent },
  { path: 'bid', component: BidComponent },
  { path: 'winning', component: WinningBidComponent },
  { path: 'support-up', component: SupportFileUpComponent },
  { path: '', redirectTo: 'apply-tender', pathMatch: 'full' },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [],
})
export class BiddingRoutingModule { }
