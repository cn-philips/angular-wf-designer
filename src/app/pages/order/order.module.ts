import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module'
import { OrderRoutingModule } from './order-routing.module'

import { PAGES, COMPONENTS } from './index'

@NgModule({
  declarations: [...PAGES, ...COMPONENTS],
  imports: [SharedModule, OrderRoutingModule]
})
export class OrderModule { }