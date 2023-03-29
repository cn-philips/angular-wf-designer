import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router'
import { ErrorpageComponent } from './errorpage.component';

const routes: Route[] = [
  { path: '', component: ErrorpageComponent }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  declarations: [ErrorpageComponent],
})
export class ErrorpageModule { }
