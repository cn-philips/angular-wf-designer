import { Injectable } from "@angular/core";
import {
  ActivatedRoute,
  NavigationEnd,
  Params,
  PRIMARY_OUTLET,
  Router,
} from "@angular/router";
import { Subject } from "rxjs";

interface IBreadcrumb {
  label: string;
  params: Params;
  isDisabled: boolean;
  url: string;
}
@Injectable({
  providedIn: "root",
})
export class BreadcrumbService {
  public breadcrumbs: IBreadcrumb[];
  public breadCrumbs = new Subject<IBreadcrumb[]>();
  public breadCrumbsChange = this.breadCrumbs.asObservable();
  constructor(private activatedRoute: ActivatedRoute, private router: Router) {
    this.breadcrumbs = [];
  }
  public getBreadCrumbs() {
    return this.breadcrumbs;
  }
  refreshRoute() {
    let root: ActivatedRoute = this.activatedRoute.root;
    this.breadcrumbs = this.getBreadcrumbs(root);
    this.breadCrumbs.next(this.breadcrumbs);
  }
  /**
   * Returns array of IBreadcrumb objects that represent the breadcrumb
   *
   * @class DetailComponent
   * @method getBreadcrumbs
   * @param {ActivateRoute} route
   * @param {string} url
   * @param {IBreadcrumb[]} breadcrumbs
   */
  private getBreadcrumbs(
    route: ActivatedRoute,
    url: string = "",
    breadcrumbs: IBreadcrumb[] = []
  ): IBreadcrumb[] {
    const ROUTE_DATA_BREADCRUMB: string = "breadcrumb";

    //get the child routes
    let children: ActivatedRoute[] = route.children;

    //return if there are no more children
    if (children.length === 0) {
      return breadcrumbs;
    }

    //iterate over each children
    for (let child of children) {
      //verify primary route
      if (child.outlet !== PRIMARY_OUTLET) {
        continue;
      }

      //verify the custom data property "breadcrumb" is specified on the route
      if (!child.snapshot.data.hasOwnProperty(ROUTE_DATA_BREADCRUMB)) {
        return this.getBreadcrumbs(child, url, breadcrumbs);
      }

      //get the route's URL segment
      let routeURL: string = child.snapshot.url
        .map((segment) => segment.path)
        .join("/");

      //append route URL to URL
      url += `/${routeURL}`;

      //add breadcrumb
      let breadcrumb: IBreadcrumb = {
        label: child.snapshot.data[ROUTE_DATA_BREADCRUMB],
        params: child.snapshot.params,
        isDisabled: child.snapshot.data["breadcrumbDisabled"],
        url: url,
      };
      breadcrumbs.push(breadcrumb);

      //recursive
      return this.getBreadcrumbs(child, url, breadcrumbs);
    }
  }

  public replace(label: string) {
    let root: ActivatedRoute = this.activatedRoute.root;
    this.breadcrumbs = this.getBreadcrumbs(root);
    if (label && this.breadcrumbs.length > 0) {
      let lastNode = this.breadcrumbs[this.breadcrumbs.length - 1];
      lastNode.label = label;
    }
    this.breadCrumbs.next(this.breadcrumbs);
  }
}
