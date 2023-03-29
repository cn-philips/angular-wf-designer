import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
  PreBookComponent,
  PrebookReviewComponent,
  ProbookOareviewComponent,
  SupplementOaComponent,
  ProbookSoComponent
} from './index'

const routes: Routes = [
  {
    path: "review",
    component: PrebookReviewComponent
  },
  {
    path: "oa-review",
    component: ProbookOareviewComponent
  },
  {
    path: "supplement-oa",
    component: SupplementOaComponent
  },
  {
    path: "prebook-so",
    component: ProbookSoComponent
  },
  {
    path: '',
    component: PreBookComponent
  },
]
@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreBookRoutingModule { }
