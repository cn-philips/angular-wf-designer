import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MobileSharedModule} from '../mobile-shared.module';
import { MobileCommonModule} from '../common/common.module';
import { MyTaskPendingComponent } from './my-task-pending.component';
import { DetailComponent } from './detail/detail.component';

const routes: Routes = [
  { path: '', component: MyTaskPendingComponent },
  { path: 'detail', component: DetailComponent }
  // { path: 'listDetail', component: ProcessComponent }
];
@NgModule({
  declarations: [MyTaskPendingComponent, DetailComponent],
  imports: [
    CommonModule,
    MobileSharedModule,
    MobileCommonModule,
    RouterModule.forChild(routes)
  ]
})
export class MyTaskPendingModule { }
