import { NgModule } from '@angular/core';
import { PrebookV3Service } from './prebook-v3.service'

import { SharedModule } from '@shared/shared.module'
import { ModernThemesModule } from '@app/modern-themes/modern-themes.module'
import { PrebookV3RoutingModule } from './prebook-v3-routing.module'

import { PAGES, COMPONENTS } from './index'

@NgModule({
  imports: [SharedModule, PrebookV3RoutingModule, ModernThemesModule],
  exports: [],
  declarations: [...PAGES, ...COMPONENTS],
  providers: [PrebookV3Service],
})
export class PrebookV3Module { }
