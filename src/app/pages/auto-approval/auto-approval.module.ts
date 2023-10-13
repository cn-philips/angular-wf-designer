import { NgModule } from "@angular/core";
import { RouterModule, Route } from "@angular/router";
import { AutoApprovalComponent } from "./auto-approval.component";
import { SharedModule } from "@shared/shared.module";

const routes: Route[] = [{ path: "plaintext", component: AutoApprovalComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule],
  declarations: [AutoApprovalComponent],
})
export class AutoApprovalModule {}
