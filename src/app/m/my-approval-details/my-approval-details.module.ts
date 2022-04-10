import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MobileSharedModule} from '../mobile-shared.module';
import { MobileCommonModule} from '../common/common.module';
import { MyApprovalDetailsComponent } from './my-approval-details.component';

const routes: Routes = [
  { path: '', component: MyApprovalDetailsComponent }
  // { path: 'listDetail', component: ProcessComponent }
];
@NgModule({
  declarations: [MyApprovalDetailsComponent],
  imports: [
    CommonModule,
    MobileSharedModule,
    MobileCommonModule,
    RouterModule.forChild(routes)
  ]
})
export class MyApprovalAwaitModule { }
