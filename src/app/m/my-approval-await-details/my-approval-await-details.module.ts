import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MobileCommonModule} from '../common/common.module';
import { MobileSharedModule} from '../mobile-shared.module';
import { MyApprovalAwaitDetailsComponent } from './my-approval-await-details.component';

const routes: Routes = [
  { path: '', component: MyApprovalAwaitDetailsComponent }
  // { path: 'listDetail', component: ProcessComponent }
];
@NgModule({
  declarations: [MyApprovalAwaitDetailsComponent],
  imports: [
    CommonModule,
    MobileSharedModule,
    MobileCommonModule,
    RouterModule.forChild(routes)
  ]
})
export class MyApprovalAwaitDetailsModule { }
