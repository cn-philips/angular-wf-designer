import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MobileSharedModule} from '../mobile-shared.module';
import { MobileCommonModule} from '../common/common.module';
import { MyTaskCompleteComponent } from './my-task-complete.component';
import { DetailComponent } from './detail/detail.component';

const routes: Routes = [
  { path: '', component: MyTaskCompleteComponent },
  { path: 'detail', component: DetailComponent }
];
@NgModule({
  declarations: [MyTaskCompleteComponent, DetailComponent],
  imports: [
    CommonModule,
    MobileSharedModule,
    MobileCommonModule,
    RouterModule.forChild(routes)
  ]
})
export class MyTaskCompleteModule { }
