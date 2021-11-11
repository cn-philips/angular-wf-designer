import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MobileCommonModule} from '../common/common.module';
import { MobileSharedModule} from '../mobile-shared.module';
import { ClaimTaskComponent } from './claim-task.component';
import { ClaimTaskDetailComponent } from './claim-task-detail/claim-task-detail.component';

const routes: Routes = [
  { path: '', component: ClaimTaskComponent },
  { path: 'detail', component: ClaimTaskDetailComponent }
];
@NgModule({
  declarations: [ClaimTaskComponent, ClaimTaskDetailComponent],
  imports: [
    CommonModule,
    MobileSharedModule,
    MobileCommonModule,
    RouterModule.forChild(routes)
  ]
})
export class ClaimTaskModule { }
