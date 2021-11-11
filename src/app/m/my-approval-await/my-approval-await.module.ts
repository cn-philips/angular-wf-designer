import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MobileCommonModule} from '../common/common.module';
import { MobileSharedModule} from '../mobile-shared.module';
import { MyApprovalAwaitComponent } from './my-approval-await.component';

const routes: Routes = [
  { path: '', component: MyApprovalAwaitComponent }
  // { path: 'listDetail', component: ProcessComponent }
];
@NgModule({
  declarations: [MyApprovalAwaitComponent],
  imports: [
    CommonModule,
    MobileSharedModule,
    MobileCommonModule,
    RouterModule.forChild(routes)
  ]
})
export class MyApprovalAwaitModule { }
