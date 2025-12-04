import { Injectable } from "@angular/core";
import { HttpService } from "@core/services";
import { timeout } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class PermissionService {
  private timer = null;
  private period = 61; //minutes
  private REFRESH_KEY = "perm_last_refresh_time"
  private lastActivityTime: number = new Date().getTime();
  constructor(private http: HttpService) { }

  public updateUserActivity() {
    this.lastActivityTime = new Date().getTime();
  }

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
   * @param immediate 是否立刻刷新，如果为否，则每period分钟刷新一次
   * @param period 每period分钟刷新一次
   * @param expiredTime 权限有效时间，默认61分钟
   */
  public async refreshPermission(
    immediate: boolean = false,
    period: number = 61,
    expiredTime: number = 61
  ) {
    let _period = period > 0 ? period : this.period;
    if (!immediate) {
      if (this.timer) {
        clearTimeout(this.timer);
      } else {
        this.refreshPermission(true);
      }
      this.timer = setTimeout(async () => {
        console.log("Checking user activity before refreshing permissions.");
        const now = new Date().getTime();
        // 检查用户是否在过去一小时内处于活动状态
        if (now - this.lastActivityTime < 60 * 60 * 1000) {
          console.log("User is active. Refreshing permissions per " + _period + " minutes.");
          await this.doRefresh();
          await this.updateRefreshTime();
        } else {
          console.log("User is inactive. Skipping permission refresh to allow session to expire.");
        }
        // 无论用户是否活跃，都安排下一次检查
        await this.refreshPermission(false, _period);
      }, _period * 60 * 1000);
    } else {
      if (new Date().getTime() - this.getLastRefreshTime() < expiredTime * 60 * 1000) {
        console.log("Refreshed recently, no need to refresh.");
        return
      }
      console.log("Refresh Permissions Immediately.");
      await this.doRefresh();
      await this.updateRefreshTime();
    }
  }
  private async doRefresh(){
    await this.getPricePermissionsAll();
    await this.getPriceAllPermissions();
  }
  private async updateRefreshTime(){
    window.localStorage.setItem(this.REFRESH_KEY, new Date().getTime().toString())
  }
  private getLastRefreshTime(){
    if(!window.localStorage.getItem(this.REFRESH_KEY)){
      return 0
    }
    return Number(window.localStorage.getItem(this.REFRESH_KEY))
  }
}
