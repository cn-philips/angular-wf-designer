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
  styles: [`
    :host { display: block; }

    .debug-panel {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 400px;
      background: #fff;
      border: 2px solid #1890ff;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      font-family: monospace;
      font-size: 12px;
    }

    .debug-panel-header {
      background: #1890ff;
      color: #fff;
      padding: 10px 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 6px 6px 0 0;
    }

    .debug-panel-title {
      font-weight: bold;
      font-size: 14px;
    }

    .debug-panel-close {
      background: transparent;
      border: none;
      color: #fff;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      width: 24px;
      height: 24px;
    }

    .debug-panel-close:hover {
      opacity: 0.8;
    }

    .debug-panel-content {
      padding: 15px;
      max-height: 500px;
      overflow-y: auto;
    }

    .debug-info-item {
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f0f0f0;
    }

    .debug-info-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .debug-info-item strong {
      display: block;
      color: #666;
      margin-bottom: 5px;
      font-size: 11px;
    }

    .debug-value {
      color: #333;
      word-break: break-all;
      padding: 5px 8px;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .debug-value.highlight {
      background: #e6f7ff;
      color: #1890ff;
      font-weight: bold;
      font-size: 13px;
    }

    .debug-value.module {
      background: #fff7e6;
      color: #fa8c16;
      font-weight: bold;
    }

    .debug-value.small {
      font-size: 10px;
      color: #666;
    }

    .debug-panel-footer {
      padding: 8px 15px;
      background: #fafafa;
      border-top: 1px solid #f0f0f0;
      text-align: center;
      color: #999;
      border-radius: 0 0 6px 6px;
    }
  `],
})
export class AppComponent {
  // 调试面板相关
  showDebugPanel = false;
  isProduction = environment.production;
  debugInfo: any = {};

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

  // 快捷键监听：Ctrl+Shift+D 切换调试面板
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // 仅在非生产环境下启用
    if (!this.isProduction && event.ctrlKey && event.shiftKey && event.key === 'D') {
      event.preventDefault();
      this.toggleDebugPanel();
    }
  }

  // 切换调试面板显示/隐藏
  toggleDebugPanel() {
    this.showDebugPanel = !this.showDebugPanel;
    if (this.showDebugPanel) {
      this.updateDebugInfo();
    }
  }

  // 更新调试信息
  updateDebugInfo() {
    const currentUrl = this.router.url;
    let componentName = '未知组件';
    let routePath = currentUrl;
    let moduleName = '';
    let componentFile = '';

    // 方法1: 优先从当前激活的路由快照中获取组件（支持懒加载模块）
    let route = this.router.routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }

    if (route.component) {
      componentName = route.component['name'] || route.component.toString();

      // 尝试从路由快照获取更多信息
      if (route.snapshot) {
        routePath = (route.snapshot.routeConfig && route.snapshot.routeConfig.path) || currentUrl;

        // 构建完整路径
        let fullPath = '';
        let tempRoute = route.snapshot;
        while (tempRoute) {
          if (tempRoute.routeConfig && tempRoute.routeConfig.path) {
            fullPath = tempRoute.routeConfig.path + (fullPath ? '/' + fullPath : '');
          }
          tempRoute = tempRoute.parent;
        }
        if (fullPath) {
          routePath = fullPath;
        }
      }
    } else {
      // 方法2: 如果激活路由没有组件，从路由配置中查找
      const findComponent = (routes: any[], url: string, parentPath = ''): any => {
        for (const route of routes) {
          const fullPath = parentPath ? `${parentPath}/${route.path || ''}` : (route.path || '');

          if (route.component) {
            const routePattern = fullPath.replace(/:[^/]+/g, '[^/]+').replace(/\//g, '\\/');
            const regex = new RegExp(`^${routePattern}$`);
            if (regex.test(url.replace(/^#?\//, '').replace(/\?.*$/, ''))) {
              return {
                component: route.component.name,
                path: fullPath,
                data: route.data
              };
            }
          }

          if (route.children) {
            const found = findComponent(route.children, url, fullPath);
            if (found) return found;
          }

          if (route.loadChildren) {
            // 懒加载模块 - 检查URL是否匹配
            const routePattern = fullPath.replace(/:[^/]+/g, '[^/]+').replace(/\//g, '\\/');
            const regex = new RegExp(`^${routePattern}`);
            if (regex.test(url.replace(/^#?\//, '').replace(/\?.*$/, ''))) {
              const modulePathMatch = route.loadChildren.match(/\.\/pages\/([^#]+)#(\w+)/);
              return {
                component: '懒加载模块 (请刷新调试面板)',
                path: fullPath,
                module: modulePathMatch ? modulePathMatch[2] : 'Unknown',
                modulePath: modulePathMatch ? modulePathMatch[1] : ''
              };
            }
          }
        }
        return null;
      };

      const routeInfo = findComponent(this.router.config, currentUrl);

      if (routeInfo) {
        componentName = routeInfo.component;
        routePath = routeInfo.path;
        if (routeInfo.module) {
          moduleName = routeInfo.module;
        }
        if (routeInfo.modulePath) {
          componentFile = routeInfo.modulePath;
        }
      }
    }

    this.debugInfo = {
      currentUrl: currentUrl,
      routePath: routePath,
      componentName: componentName,
      moduleName: moduleName,
      componentFile: componentFile,
      timestamp: new Date().toLocaleTimeString('zh-CN')
    };
  }

  // 关闭调试面板
  closeDebugPanel() {
    this.showDebugPanel = false;
  }
}
