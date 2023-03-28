import {
  Component,
  Input,
  ChangeDetectionStrategy,
  AfterViewInit,
  OnInit,
  HostBinding,
  OnDestroy,
} from "@angular/core";
import {
  Router,
  ActivatedRoute,
  UrlTree,
  NavigationEnd,
} from "@angular/router";
import { NzMessageService } from "ng-zorro-antd";
import { AppService } from "app/app.service";
import { LayoutService } from "../layout.service";
import { HttpService } from "@core/services";
import { Subscription } from "rxjs";
import { SpecialApprovalService } from "@pages/special-approval/special-approval.service";
import { TaskCountService } from "@app/modern-themes/services/task-count.service";
import { TranslateService } from "@ngx-translate/core";
@Component({
  selector: "app-layout-sidenav",
  templateUrl: "./layout-sidenav.component.html",
  styles: [":host { display: block; }"],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class LayoutSidenavComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input() orientation = "vertical";

  @HostBinding("class.layout-sidenav") private hostClassVertical = false;
  @HostBinding("class.layout-sidenav-horizontal") private hostClassHorizontal =
    false;
  @HostBinding("class.flex-grow-0") private hostClassFlex = false;

  list: any;
  menuId = "";
  menuType = "";
  mydraft: any[];
  mytaks: any[]; //我的任务
  timer: any;
  lang = "zh-CN";

  constructor(
    private router: Router,
    private appService: AppService,
    private layoutService: LayoutService,
    private http: HttpService,
    private aRoute: ActivatedRoute,
    private taskCountService: TaskCountService,
    private translate: TranslateService
  ) {
    // Set host classes
    this.hostClassVertical = this.orientation !== "horizontal";
    this.hostClassHorizontal = !this.hostClassVertical;
    this.hostClassFlex = this.hostClassHorizontal;
    this.lang = this.translate.currentLang;
    this.translate.onLangChange.subscribe((params) => {
      if (params.lang) {
        this.lang = params.lang;
      }
    });
    this.router.events
      .filter((event) => event instanceof NavigationEnd)
      .subscribe((event) => {
        this.refreshCount();
      });
  }

  ngOnInit(): void {
    this.aRoute.queryParams.subscribe((params) => {
      this.menuId = params.id == null ? "" : params.id;
      this.menuType = params.type == null ? "" : params.type;
    });
    this.initLocalStorage();
    this.getPricePermissionsAll();
    this.getPriceAllPermissions();
    this.setPricePermission();
  }
  private initLocalStorage() {
    //左侧菜单
    this.http.post("/act/role/getDiigtUserInfo").subscribe((res) => {

      if (
        "0000" == res.code &&
        res.data &&
        res.data.jurisdictions &&
        res.data.jurisdictions.length > 0
      ) {
        let profiles = JSON.stringify(res.data.profiles);
        window.localStorage.setItem("profiles", profiles);
        window.localStorage.setItem("roleCode", res.data.roleCode);
        window.localStorage.setItem("roles", JSON.stringify(res.data.roles));
        window.localStorage.setItem(
          "roleAgents",
          JSON.stringify(res.data.roleAgents)
        );
        this.list = res.data.jurisdictions;
        window.localStorage.setItem("menuList", JSON.stringify(this.list));
      } else {
        this.router.navigate(["/anonymous"]);
        return;
      }
    });
  }
  public refreshCount() {
    this.taskCountService.refresh();
  }

  public getPricePermissionsAll() {
    const url = "/act/fieldPermissions/getPermissionsAll";
    this.http.get(url).subscribe((res) => {
      if (res && res.data) {
        window.localStorage.setItem("permissions", JSON.stringify(res.data));
      }
    });
  }

  public getPriceAllPermissions() {
    const url = "/act/fieldPermissions/getAllPermissions";
    this.http.get(url).subscribe((res) => {
      if (res && res.data) {
        window.localStorage.setItem("permissionsV3", JSON.stringify(res.data));
      }
    });
  }

  ngAfterViewInit() {
    // Safari bugfix
    this.layoutService._redrawLayoutSidenav();
  }

  setMenuRoute(event) {
    for (let i = 0; i < event.length; i++) {
      event[i]["router"] = this.whichRoute(event[i]["value"]["url"]);
      if (event[i]["childs"].length > 0) {
        this.setMenuRoute(event[i]["childs"]);
      }
    }
  }

  ngOnDestroy(): void {}

  whichRoute(str) {
    if (str.indexOf("masterdata") != -1) {
      return "/master-data-maintenance";
    } else if (str.indexOf("template") != -1) {
      return "/template-maintenance";
    } else if (str.indexOf("/relation/queryAll") != -1) {
      return "/role-authorization";
    } else if (str.indexOf("queryAllUser") != -1) {
      return "/personal-info";
    } else if (str.indexOf("model/list") != -1) {
      return "/new-approval";
    } else if (str.indexOf("/taskList/") != -1) {
      //TODO only for dev
      return "/my-task";
    } else if (str.indexOf("/listAllProcessInstance") != -1) {
      //TODO only for dev
      return "/my-approval";
    } else if (str.indexOf("/draft/listAll") != -1) {
      //TODO only for dev
      return "/my-draft";
    } else if (str.indexOf("/task/acceptTaskList") != -1) {
      //TODO only for dev
      return "/claim-task";
    } else if (str.indexOf("/quotation/queryAll") != -1) {
      //TODO only for dev
      return "/quotation-management";
    } else if (str.indexOf("/oabws/query") != -1) {
      return "/oa-bwsfile";
    } else if (str == "dimensiontree") {
      return "/dimension-tree";
    } else if (str == "rolemanager") {
      return "/role-list";
    } else if (str == "admintools") {
      return "/admin-tools";
    } else if (str == "usermanager") {
      return "/app-personnel-management";
    } else if (str == "groupmanager") {
      return "/app-group-management";
    } else if (str == "/report/pageQuery") {
      return "/report";
    }
  }

  getClasses() {
    let bg = this.appService.layoutSidenavBg;
    if (
      this.orientation === "horizontal" &&
      (bg.indexOf(" sidenav-dark") !== -1 ||
        bg.indexOf(" sidenav-light") !== -1)
    ) {
      bg = bg
        .replace(" sidenav-dark", "")
        .replace(" sidenav-light", "")
        .replace("-darker", "")
        .replace("-dark", "");
    }

    return `${
      this.orientation === "horizontal" ? "container-p-x " : ""
    } bg-${bg}`;
  }

  isActive(url) {
    return this.router.isActive(url, true);
  }

  isActiveLeaf(url, param?) {
    if (param) {
      const id: string = param.id;
      return this.menuId == id;
    } else {
      return this.isActive(url);
    }
  }

  isActiveParent(url, param?) {
    // console.log(param);
    if (param) {
      const type_: string = param.type + "_";
      return this.menuType.indexOf(type_) != -1;
    } else {
      return this.isActive(url);
    }
  }

  isParentActive(menuItem: any) {
    if (menuItem.children != undefined && menuItem.children != null) {
      return menuItem.children.some(
        (item) => item.route == this.router.routerState.snapshot.url
      );
    } else {
      return menuItem.route == this.router.routerState.snapshot.url;
    }
  }

  isMenuActive(url) {
    return this.router.isActive(url, false);
  }

  isMenuOpen(url) {
    return (
      this.router.isActive(url, false) && this.orientation !== "horizontal"
    );
  }

  isMenuOpenAlt(url, param?) {
    if (param) {
      const type_: string = param.type + "_";
      return (
        this.menuType.indexOf(type_) != -1 && this.orientation !== "horizontal"
      );
    } else {
      return (
        this.router.isActive(url, false) && this.orientation !== "horizontal"
      );
    }
  }

  toggleSidenav() {
    this.layoutService.toggleCollapsed();
  }

  clearStorage() {
    localStorage.removeItem("searchConditions");
    // this.ServesiceService.setSearch.emit(true)
  }
  setPricePermission() {
    const profiles = JSON.parse(localStorage.getItem("profiles"));
    const currRoles = JSON.parse(localStorage.getItem("roles"));
    const permission = JSON.parse(localStorage.getItem("permissions"));
    let modalityList = [];
    if (profiles && profiles.length > 0) {
      const modalityList = profiles.map((val) => {
        return val.modality;
      });
    } else {
      modalityList = [];
    }
    const userModality = Array.from(new Set(modalityList));
  }
}
