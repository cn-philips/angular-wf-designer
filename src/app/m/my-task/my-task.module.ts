import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobileSharedModule} from '../mobile-shared.module';
import { MobileCommonModule} from '../common/common.module';
import { Routes, RouterModule } from '@angular/router';
import { MyTaskComponent } from "./my-task.component";

const routes: Routes = [
  { path: '', component: MyTaskComponent }
  // { path: 'listDetail', component: ProcessComponent }
];

@NgModule({
  declarations: [MyTaskComponent],
  imports: [
    CommonModule,
    MobileCommonModule,
    MobileSharedModule,
    RouterModule.forChild(routes)
  ]
})
export class MyTaskModule { }
