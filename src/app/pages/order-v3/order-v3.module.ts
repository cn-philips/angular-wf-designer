import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module'
import{ModernThemesModule}from'@app/modern-themes/modern-themes.module'
import{OrderV3RoutingModule}from'./orderv3-routing.module'
import{COMPONENTS,PAGES}from'./index';
import{OrderV3Service}from'./order-v3.service'

@NgModule({
  imports: [OrderV3RoutingModule,SharedModule,ModernThemesModule],
  declarations: [...PAGES, ...COMPONENTS],
  providers:[OrderV3Service]
})
export class orderv3Module { }

