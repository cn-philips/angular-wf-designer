import { NgModule } from "@angular/core";

import { SharedModule } from "@shared/shared.module";
import { SystemSettingRoutingModule } from "./system-setting-routing.module";

import { PAGES, COMPONENTS } from "./index";
import { ModernThemesModule } from "@app/modern-themes/modern-themes.module";
import { MessageService } from "./message-management/services/message.service";
import {CommonModule} from '@angular/common'
@NgModule({
  providers: [MessageService],
  imports: [SystemSettingRoutingModule, SharedModule, ModernThemesModule,CommonModule],
  declarations: [...PAGES, ...COMPONENTS],
})
export class SystemSettingModule {}
