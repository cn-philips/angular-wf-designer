import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router'
import { LogoutComponent } from './logout.component';

const routes: Route[] = [
  { path: '', component: LogoutComponent }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  declarations: [LogoutComponent],
})
export class LogoutModule { }
