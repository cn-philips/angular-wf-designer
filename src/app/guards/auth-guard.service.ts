import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route } from '@angular/router';
import { HttpService } from '../services';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { debug } from 'util';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {

  public loader: boolean = false;

  constructor(
    private router: Router,
    private http: HttpService,
    private cookieService: CookieService,
    private deviceService: DeviceDetectorService) { }

  // canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    // if (this._authService.isAuthenticated()) {
    //   return true;
    // }

    // navigate to login page
    // this.router.navigate(['/logout']);
    // you can save redirect url so after authing we can move them back to the page they requested
    // console.log('state-url',state.url==='/');


    // console.log('Philips_TOKEN', this.cookieService.get('Philips_TOKEN'));
   
    this.loader = true;
    if (this.cookieService.check('Philips_TOKEN') && '' !== this.cookieService.get('Philips_TOKEN')) {
      // console.log('state.url', state.url);      
      if('/' === state.url) {
        
        console.log('deviceInfo',this.deviceService.getDeviceInfo());
        const devInfo = this.deviceService.getDeviceInfo();
        const userAgent = devInfo.userAgent.toLowerCase();
        if(this.deviceService.isMobile() || userAgent.indexOf('wechat') > -1) {
          this.loader = false;
          this.router.navigate(['m']);
          return false;
        } else {
          this.loader = false;
          return true;
        }
      }
      this.loader = false;
      return true;
    } else {
      this.http.post('act/relation/isAuthorized', { 'key1': '/relation/isAuthorized' }).subscribe(res => {
        console.log('res->', res);

        if ('0000' == res.code) {
          // this.loader = false;
          this.router.navigateByUrl(state.url)
        } else {
          //重定向到错误页
          // return false;
        }
      });
    }
  }

  canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    // if (this._authService.isAuthenticated()) {
    //   return true;
    // }

    // navigate to login page
    // this.router.navigate(['/logout']);
    // you can save redirect url so after authing we can move them back to the page they requested
    return false;
  }
}
