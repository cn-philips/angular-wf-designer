import { Component, OnInit } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { Router } from "@angular/router";

@Component({
  selector: "page-logout",
  templateUrl: "./logout.component.html",
  styleUrls: ["./logout.component.scss"],
})
export class LogoutComponent implements OnInit {
  constructor(private cookieService: CookieService, private router: Router) {
    this.clearLocalData();
  }

  ngOnInit() {
    this.backToHome();
  }

  clearLocalData() {
    var ex = new Date();
    ex.setTime(ex.getTime() - 1);
    document.cookie =
      "Philips_TOKEN_COS" + "=; expires=" + ex.toUTCString() + ";path=/";
    this.removeCache();
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
  backToHome() {
    this.router.navigate(["/"]);
  }
}
