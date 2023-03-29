import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router'
import { ReportComponent } from './report.component';

import { SharedModule } from '@shared/shared.module'

const routes: Route[] = [
  { path: '', component: ReportComponent }
]

@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule],
  declarations: [ReportComponent],
})
export class ReportModule { }
