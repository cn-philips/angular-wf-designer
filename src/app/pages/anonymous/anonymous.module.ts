import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router'
import { AnonymousComponent } from './anonymous.component';

const routes: Route[] = [
  { path: '', component: AnonymousComponent }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  declarations: [AnonymousComponent],
})
export class AnonymousModule { }
