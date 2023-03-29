import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module';
import { BiddingRoutingModule } from './bidding-routing.module';

import { COMPONENTS, PAGES } from './index'

@NgModule({
  imports: [BiddingRoutingModule, SharedModule],
  exports: [],
  declarations: [...COMPONENTS, ...PAGES],
  providers: [],
})
export class BiddingModule { }
