import { Injectable } from "@angular/core";
import { HttpService } from "@core/services";
import { timeout } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class PermissionService {
  private timer = null;
  private period = 30; //minutes
  constructor(private http: HttpService) {}
  public hasRole(role: String): Boolean {
    const roles = JSON.parse(localStorage.getItem("roles"));
    return roles.map((i) => i.toLowerCase()).includes(role.toLowerCase());
  }
  public async getPricePermissionsAll() {
    const url = "/act/fieldPermissions/getPermissionsAll";
    return this.http
      .get(url)
      .toPromise()
      .then((res) => {
        if (res && res.data) {
          window.localStorage.setItem("permissions", JSON.stringify(res.data));
        }
      });
  }

  public async getPriceAllPermissions() {
    const url = "/act/fieldPermissions/getAllPermissions";
    return this.http
      .get(url)
      .toPromise()
      .then((res) => {
        if (res && res.data) {
          window.localStorage.setItem(
            "permissionsV3",
            JSON.stringify(res.data)
          );
        }
      });
  }
  /**
   * 刷新权限
   * @param immediate 是否立刻刷新，如果为否，则每30分钟刷新一次
   */
  public async refreshPermission(
    immediate: boolean = false,
    period: number = 0
  ) {
    let _period = period > 0 ? period : this.period;
    if (!immediate) {
      if (this.timer) {
        clearTimeout(this.timer);
      }else{
        this.refreshPermission(true);
      }
      this.timer = setTimeout(async () => {
        console.log("Refresh Permissions per "+ _period + " minus.");
        window.localStorage.removeItem("permissions");
        window.localStorage.removeItem("permissionsV3");
        await this.getPricePermissionsAll();
        await this.getPriceAllPermissions();
        this.refreshPermission(false, _period);
      }, _period * 60 * 1000);
    } else {
      console.log("Refresh Permissions Immediately.");
      window.localStorage.removeItem("permissions");
      window.localStorage.removeItem("permissionsV3");
      await this.getPricePermissionsAll();
      await this.getPriceAllPermissions();
    }
  }
}
