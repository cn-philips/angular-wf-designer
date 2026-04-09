import { Component, HostListener } from "@angular/core";
import {
  Router,
  Event as RouterEvent,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from "@angular/router";
import { AppService } from "./app.service";
import { AuthGuard } from "@core/guards/auth-guard.service";
import { LayoutService } from "./layout/layout.service";
import { TranslateService } from "@ngx-translate/core";
import { environment } from "environments/environment";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styles: [":host { display: block; }"],
})
export class AppComponent {
  constructor(
    private router: Router,
    private appService: AppService,
    private layoutService: LayoutService,
    public authGuard: AuthGuard,
    public translate: TranslateService
  ) {
    // Subscribe to router events to handle page transition
    this.router.events.subscribe(this.navigationInterceptor.bind(this));

    // Disable animations and transitions in IE10 to increase performance
    if (
      typeof document["documentMode"] === "number" &&
      document["documentMode"] < 11
    ) {
      const style = document.createElement("style");
      style.textContent = `
        * {
          -ms-animation: none !important;
          animation: none !important;
          -ms-transition: none !important;
          transition: none !important;
        }`;
      document.head.appendChild(style);
    }
  }
  public async ngOnInit() {
    // 语言初始化(若未设置语言, 则取浏览器语言)
    let currentLanguage = (await localStorage.getItem("locals")) || "zh-CN";
    // this.translate.getBrowserCultureLang();
    // 当在assets/i18n中找不到对应的语言翻译时，使用'zh-CN'作为默认语言
    this.translate.setDefaultLang("zh-CN");
    this.translate.use(currentLanguage);
    // 记录当前设置的语言
    localStorage.setItem("locals", currentLanguage);
  }

  private navigationInterceptor(e: RouterEvent) {
    if (e instanceof NavigationStart) {
      // Set loading state
      document.body.classList.add("app-loading");
    }

    if (e instanceof NavigationEnd) {
      // Scroll to top of the page
      this.appService.scrollTop(0, 0);
    }

    if (
      e instanceof NavigationEnd ||
      e instanceof NavigationCancel ||
      e instanceof NavigationError
    ) {
      // On small screens collapse sidenav
      if (
        this.layoutService.isSmallScreen() &&
        !this.layoutService.isCollapsed()
      ) {
        setTimeout(() => this.layoutService.setCollapsed(true, true), 10);
      }

      // Remove loading state
      document.body.classList.remove("app-loading");
    }
  }
}
