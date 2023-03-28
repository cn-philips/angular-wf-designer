import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ScheduleComponent, } from "./index";

const routes: Routes = [
    {
      path: "",
      component: ScheduleComponent,
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [],
    declarations: [],
    providers: [],
})
export class ScheduleRoutingModule {}