import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router'
import { AuthCallbackComponent } from './auth-callback.component';

const routes: Route[] = [
  { path: '', component: AuthCallbackComponent }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  declarations: [AuthCallbackComponent],
})
export class AuthCallbackModule { }
