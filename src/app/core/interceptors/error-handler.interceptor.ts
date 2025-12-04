import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
  HttpInterceptor,
} from '@angular/common/http';
import { HttpService } from '../services';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs/Observable';
import { tap } from 'rxjs/operators';
import { PermissionService } from '@app/modern-themes/services/permission.service';

@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private toastrService: ToastrService,
    private http: HttpService,
    private permissionService: PermissionService
  ) {}

  private queryParams = {
    queryParams: {
      code: '404',
      msg: "Oops! We can't seem to find the page you are looking for.",
    },
  };
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          if (event.body && event.body.code) {
            switch (event.body.code) {
              case '0001': {
                //用户不存在
                this.queryParams.queryParams.code = event.body.code;
                this.queryParams.queryParams.msg = event.body.msg;
                this.router.navigate(['/errorpage'], this.queryParams);
                break;
              }
              case '0002': {
                // 未登录
                console.log('intercepted router', this.router.url);
                console.log('intercepted body', event.body);
                setTimeout(() => {
                  let url = event.body.data.toString();
                  location.href = event.body.data.toString();
                }, 500);
                break;
              }
              case '0003': {
                // cookie超时
                console.log('intercepted router', this.router.url);
                console.log('intercepted body', event.body);
                this.toastrService.error(event.body.msg);
                // location.href = event.body.data.toString();
                this.http.logout();
                // window.localStorage.clear();
                break;
              }
              case '0004': {
                // 没有足够权限
                console.log('intercepted router', this.router.url);
                console.log('intercepted body', event.body);
                if ('/' === this.router.url) {
                  //访问首页时仍可能存在无操作权限的url访问，因为已经在首页了所以不做跳转处理
                } else {
                  this.toastrService.error('无操作权限');
                  this.router.navigate(['/']);
                }
                break;
              }
              default: {
                //放行
                // this.router.navigate(['/errorpage']);
                // 刷新用户活动时间
                this.permissionService.updateUserActivity();
                break;
              }
            }
          }
        }
      })
    );
    // }, (err: any) => {
    //     if (err instanceof HttpErrorResponse {
    //         if (err.status === 401) {
    //         }
    //     }
    // });
  }
  // summay()
  // {
  //   debugger
  //   var count=0;
  //   return (event)=>{
  //      if(count==0)
  //      {
  //       setTimeout(()=>{
  //         let url=event.body.data.toString();
  //         location.href = event.body.data.toString();
  //       },500)
  //      }
  //      count++;
  //   }
  // }
}
