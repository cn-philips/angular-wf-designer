import { BrowserModule, Title } from "@angular/platform-browser";
import { LOCALE_ID, NgModule } from "@angular/core";
import zh from "@angular/common/locales/zh";
import {
  DatePipe,
  HashLocationStrategy,
  LocationStrategy,
  registerLocaleData,
} from "@angular/common";
import { CoreModule } from "@core/core.module";
import { SharedModule } from "@shared/shared.module";

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { CookieService } from "ngx-cookie-service";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AppService } from "./app.service";
import { LayoutModule } from "./layout/layout.module";

// *******************************************************************************
// Libs
import { ToastrModule } from "ngx-toastr";
import { QuillModule } from 'ngx-quill';
// @ts-ignore
import { NZ_I18N, zh_CN } from "ng-zorro-antd";

import { HomepageComponent } from "@pages/homepage/homepage.component";
import { Autosize } from "ng-autosize";
import { ModernThemesModule } from "./modern-themes/modern-themes.module";
import {
  TranslateModule,
  TranslateLoader,
  TranslateService,
} from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { HttpClient } from "@angular/common/http";
import { GlobalService } from "@core/services";
// registerLocaleData(localeCn, localeCnExtra);
registerLocaleData(zh);
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}
@NgModule({
  declarations: [AppComponent, HomepageComponent, Autosize],

  imports: [
    CoreModule,
    SharedModule,
    BrowserModule,
    BrowserAnimationsModule,
    // App
    AppRoutingModule,
    LayoutModule,
    ToastrModule.forRoot(),
    QuillModule,
    ModernThemesModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    DatePipe,
    Title,
    AppService,
    {
      provide: LOCALE_ID,
      useValue: "zh-Hans",
    },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    CookieService,
    {
      provide: NZ_I18N,
      useValue: zh_CN,
    },
    GlobalService
  ],

  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {}
}
