import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  ActivatedRoute,
} from '@angular/router';
import { HttpService } from '../services';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  public loader: boolean = false;

  constructor(
    private router: Router,
    private http: HttpService,
    private cookieService: CookieService,
    public activatedRouter: ActivatedRoute
  ) {}

  // async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Observable<boolean> | Promise<boolean> | boolean> {
  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const Philips_TOKEN = this.cookieService.get("Philips_TOKEN_COS");
    if (
      Philips_TOKEN != '' &&
      Philips_TOKEN != null &&
      Philips_TOKEN != undefined
    ) {
      let routerInfo: any = JSON.parse(localStorage.getItem('routerInfo'));
      if ((routerInfo != null && routerInfo != '') || routerInfo != undefined) {
        let keyValue = Object.keys(routerInfo);
        if (keyValue.length > 1) {
          let routerInfoParam = JSON.parse(JSON.stringify(routerInfo));
          delete routerInfoParam.url;
          localStorage.removeItem('routerInfo');
          this.router.navigate([routerInfo.url], {
            queryParams: routerInfoParam,
          });
          // window.open(url,"_self");
          return true;
        } else {
          localStorage.removeItem('routerInfo');
          this.router.navigate([routerInfo.url]);
          // window.open(url,"_self");
          return true;
        }
      } else {
        return true;
      }
    } else {
      let result: any = await this.getuseInfo();
      if (result.code == '0000') {
        let routerInfo = JSON.parse(localStorage.getItem('routerInfo'));
        if (
          (routerInfo != null && routerInfo != '') ||
          routerInfo != undefined
        ) {
          let keyValue = Object.keys(routerInfo);
          if (keyValue.length > 1) {
            localStorage.removeItem('routerInfo');
            this.router.navigate([routerInfo.url], {
              queryParams: routerInfo,
            });
            // window.open(url,"_self");
            return true;
          } else {
            localStorage.removeItem('routerInfo');
            this.router.navigate([routerInfo.url]);
            // window.open(url,"_self");
            return true;
          }
        } else {
          return true;
        }
      } else if (result.code == '0002') {
        if (state.url != '/') {
          if (state.url.indexOf('?') != -1) {
            let stateUrl: any = state.url.split('?');
            let url = stateUrl[0];
            let routerInfo: any = {};
            let urlArr = stateUrl[1].split('&');
            for (let i = 0; i < urlArr.length; i++) {
              let arg = urlArr[i];
              let arr1 = arg.split('=');
              let key = arr1[0];
              let value = arr1[1];
              routerInfo[key] = value;
            }
            routerInfo.url = stateUrl[0];
            routerInfo = JSON.stringify(routerInfo);
            localStorage.setItem('routerInfo', routerInfo);
          } else {
            let routerInfo: any = {};
            routerInfo.url = state.url;
            routerInfo = JSON.stringify(routerInfo);
            localStorage.setItem('routerInfo', routerInfo);
          }
        }
        location.href = result.data;
      }
    }
  }

  async getuseInfo() {
    return new Promise((resolve, reject) => {
      this.http.post('/act/role/getDiigtUserInfo').subscribe((val) => {
        resolve(val);
      });
    });
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // if (this._authService.isAuthenticated()) {
    //   return true;
    // }

    // navigate to login page
    // this.router.navigate(['/logout']);
    // you can save redirect url so after authing we can move them back to the page they requested
    return false;
  }
}
