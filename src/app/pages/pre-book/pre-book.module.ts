import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module'
import { PreBookRoutingModule } from './pre-book-routing.module'

import { PAGES, COMPONENTS } from './index'

@NgModule({
  declarations: [...PAGES, COMPONENTS],
  imports: [SharedModule, PreBookRoutingModule]
})
export class PreBookModule { }
