import { NgModule } from '@angular/core';

// 引入shared module
import { SharedModule } from '@shared/shared.module'
import { ModernThemesModule } from '@app/modern-themes/modern-themes.module'

import { BiddingV3RoutingModule } from './bidding-v3-routing.module'

import { PAGES, COMPONENTS } from './index'
import { BiddingV3Service } from './bidding-v3.service'

@NgModule({
  imports: [SharedModule, BiddingV3RoutingModule, ModernThemesModule],
  exports: [],
  declarations: [...PAGES, ...COMPONENTS],
  providers: [BiddingV3Service],
})
export class BiddingV3Module { }
