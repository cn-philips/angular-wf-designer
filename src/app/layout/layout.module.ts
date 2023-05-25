import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { NgZorroAntdModule } from "ng-zorro-antd";

// *******************************************************************************
// Layouts

import { LayoutBasicComponent } from "./layout-basic/layout-basic.component";
import { LayoutMobileComponent } from "./layout-mobile/layout-mobile.component";
import { LayoutBlankComponent } from "./layout-blank/layout-blank.component";

// *******************************************************************************
// Components

import { LayoutNavbarComponent } from "./layout-navbar/layout-navbar.component";
import { LayoutSidenavComponent } from "./layout-sidenav/layout-sidenav.component";
import { LayoutFooterComponent } from "./layout-footer/layout-footer.component";

// *******************************************************************************
// Libs

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { SidenavModule } from "vendor/libs/sidenav/sidenav.module";

// *******************************************************************************
// Services

import { LayoutService } from "./layout.service";
import { TranslateModule } from "@ngx-translate/core";
import { ModernThemesModule } from "app/modern-themes/modern-themes.module";
import { TaskCountService } from "@app/modern-themes/services/task-count.service";
import { GlobalService } from "@core/services";

// *******************************************************************************
//

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    NgbModule,
    SidenavModule,
    NgZorroAntdModule,
    TranslateModule,
    ModernThemesModule,
  ],
  declarations: [
    LayoutBasicComponent,
    LayoutMobileComponent,
    LayoutBlankComponent,
    LayoutNavbarComponent,
    LayoutSidenavComponent,
    LayoutFooterComponent,
  ],
  exports: [LayoutNavbarComponent, LayoutSidenavComponent, TranslateModule],
  providers: [LayoutService,TaskCountService,GlobalService],
})
export class LayoutModule {}
