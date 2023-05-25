import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { HttpService } from "@core/services/http.service";
import { environment } from "@env";
import { CookieService } from "ngx-cookie-service";

@Component({
  selector: "page-devlogin",
  template: `<p>devlogin works!</p>`,
})
export class DevloginComponent implements OnInit {
  constructor(
    private http: HttpService,
    private router: Router,
    private aRoute: ActivatedRoute,
    private cookieService: CookieService
  ) {}

  ngOnInit() {
    this.aRoute.queryParams.subscribe(async (res) => {
      this.removeCache();
      if (res["code"]) {
        if (!environment.isProduction) {
          const out = await this.http.silentLogout();
          const uri = "/act/role/login?code1=" + res["code"];
          this.http.get(uri).subscribe((res) => {
            if ("0000" === res.code) {
              console.log("Devlogin success!");
              this.router.navigateByUrl("/");
            } else {
              this.http.logout();
            }
          });
        } else {
          this.router.navigateByUrl("/logout");
        }
      } else {
        this.http.logout();
      }
    });
  }
  removeCache() {
    localStorage.removeItem("ecom_ng_philips_code1");
    localStorage.removeItem("profiles");
    localStorage.removeItem("roles");
    localStorage.removeItem("permissions");
    localStorage.removeItem("ng_philips_username");
    localStorage.removeItem("menuList")
    localStorage.removeItem("permissions")
    localStorage.removeItem("permissionsV3")
    localStorage.removeItem("routerInfo");
    localStorage.removeItem("ng_philips_email");
    localStorage.removeItem("roleAgents");
    sessionStorage.removeItem("ecom_ng_philips_code1");
    sessionStorage.removeItem("ng_philips_roles");
    sessionStorage.removeItem("ng_philips_groups");
  }
}
