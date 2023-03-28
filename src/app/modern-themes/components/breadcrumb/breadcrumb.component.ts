import { Component, OnInit } from "@angular/core";
import {
  ActivatedRoute,
  NavigationEnd,
  Params,
  PRIMARY_OUTLET,
  Router,
} from "@angular/router";
import { BreadcrumbService } from "@app/modern-themes/services/breadcrumb.service";
import "rxjs/add/operator/filter";
interface IBreadcrumb {
  label: string;
  params: Params;
  url: string;
}
@Component({
  selector: "app-breadcrumb",
  templateUrl: "./breadcrumb.component.html",
  styleUrls: ["./breadcrumb.component.scss"],
})
export class BreadcrumbComponent implements OnInit {
  public breadcrumbs: IBreadcrumb[];
  constructor(
    private breadCrumbService: BreadcrumbService,
    private router: Router
  ) {
    this.breadcrumbs = [];
  }

  ngOnInit() {
    this.setBreadCrumbs();
    this.router.events
      .filter((event) => event instanceof NavigationEnd)
      .subscribe((event) => {
        //set breadcrumbs
        this.setBreadCrumbs();
      });
    this.breadCrumbService.breadCrumbsChange.subscribe((res) => {
      this.breadcrumbs = this.breadCrumbService.getBreadCrumbs();
    });
  }
  setBreadCrumbs() {
    this.breadCrumbService.refreshRoute();
    this.breadcrumbs = this.breadCrumbService.getBreadCrumbs();
  }
}
