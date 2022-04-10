import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MobileSharedModule} from '../mobile-shared.module';
import { MobileCommonModule} from '../common/common.module';
import { MyApprovalComponent } from './my-approval.component';

const routes: Routes = [
  { path: '', component: MyApprovalComponent }
  // { path: 'listDetail', component: ProcessComponent }
];
@NgModule({
  declarations: [MyApprovalComponent],
  imports: [
    CommonModule,
    MobileSharedModule,
    MobileCommonModule,
    RouterModule.forChild(routes)
  ]
})
export class MyApprovalModule { }
