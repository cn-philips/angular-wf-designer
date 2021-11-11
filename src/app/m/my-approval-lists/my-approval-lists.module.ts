import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MobileSharedModule} from '../mobile-shared.module';
import { MobileCommonModule} from '../common/common.module';
import { MyApprovalListsComponent } from './my-approval-lists.component';

const routes: Routes = [
  { path: '', component: MyApprovalListsComponent }
  // { path: 'listDetail', component: ProcessComponent }
];
@NgModule({
  declarations: [MyApprovalListsComponent],
  imports: [
    CommonModule,
    MobileSharedModule,
    MobileCommonModule,
    RouterModule.forChild(routes)
  ]
})
export class MyApprovalListsModule { }
