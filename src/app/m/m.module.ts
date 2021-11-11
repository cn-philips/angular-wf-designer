import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Layout1Component } from '../layout/layout-1/layout-1.component';
import { LayoutBlankComponent } from '../layout/layout-blank/layout-blank.component';
import {LayoutModule} from '../layout/layout.module';
import { IndexComponent } from './index/index.component';
import { MobileCommonModule} from './common/common.module';
import { MobileSharedModule} from './mobile-shared.module';
// const COMPONENTS = [
//   Layout1Component
// ];

const mobileRoutes: Routes = [
  {
    path: '', component: LayoutBlankComponent,
    children: [
      { path: '', redirectTo: 'index', pathMatch: 'full' },
      { path: 'index', component: IndexComponent},
      { path: 'my-approval-lists', loadChildren: './my-approval-lists/my-approval-lists.module#MyApprovalListsModule' },
      { path: 'my-approval', loadChildren: './my-approval/my-approval.module#MyApprovalModule' },
      { path: 'my-approval-details', loadChildren: './my-approval-details/my-approval-details.module#MyApprovalAwaitModule' },
      { path: 'my-approval-await', loadChildren: './my-approval-await/my-approval-await.module#MyApprovalAwaitModule' },
      { path: 'my-approval-await-details', loadChildren: './my-approval-await-details/my-approval-await-details.module#MyApprovalAwaitDetailsModule' },
      { path: 'claim-task', loadChildren: './claim-task/claim-task.module#ClaimTaskModule' },
      { path: 'my-task', loadChildren: './my-task/my-task.module#MyTaskModule' },
      { path: 'my-task-complete', loadChildren: './my-task-complete/my-task-complete.module#MyTaskCompleteModule' },
      { path: 'my-task-pending', loadChildren: './my-task-pending/my-task-pending.module#MyTaskPendingModule' }

      
      //below 4 path format for dev reference from other ui proj
      // { path: 'index', loadChildren: './index/index.module#IndexModule', canActivateChild: [LoginGuard] }
      // { path: 'application', loadChildren: './m/etravel/application/application.module#ApplicationModule' },
      // { path: 'process', loadChildren: './m/etravel/process/process.module#ProcessModule' },
      // { path: 'setting', loadChildren: './m/etravel/personal-setting/personal-setting.module#PersonalSettingModule' }
    ]
  }
];
@NgModule({
  declarations: [
    IndexComponent
  ],
  imports: [
    CommonModule,
    MobileSharedModule,
    MobileCommonModule,
    LayoutModule,
    RouterModule.forChild(mobileRoutes)
  ]
  // exports: [RouterModule]
})
export class MobileModule { }
