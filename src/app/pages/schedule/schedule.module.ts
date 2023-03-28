import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module'
import {ModernThemesModule} from '@app/modern-themes/modern-themes.module'
import {ScheduleRoutingModule} from './schedule-routing.module'
import {COMPONENTS,PAGES} from './index';
import {ScheduleService} from './schedule.service';
import { QuillModule } from 'ngx-quill';

@NgModule({
  imports: [ScheduleRoutingModule, SharedModule, ModernThemesModule, QuillModule],
  declarations: [...PAGES, ...COMPONENTS],
  providers:[ScheduleService]
})
export class ScheduleModule { }