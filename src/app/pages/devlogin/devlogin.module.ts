import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router'
import { DevloginComponent } from './devlogin.component';

const routes: Route[] = [
  { path: '', component: DevloginComponent }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  declarations: [DevloginComponent],
})
export class DevloginModule { }
