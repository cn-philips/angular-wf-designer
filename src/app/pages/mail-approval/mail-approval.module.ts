import { NgModule } from "@angular/core";
import { Route, RouterModule } from "@angular/router";
import { SharedModule } from "@shared/shared.module";
import { MailApprovalComponent } from "./mail-approval.component";

const routes: Route[] = [{ path: "", component: MailApprovalComponent  }];

@NgModule({
  declarations: [MailApprovalComponent],
  imports: [RouterModule.forChild(routes),SharedModule],
})
export class MailApprovalModule {}
