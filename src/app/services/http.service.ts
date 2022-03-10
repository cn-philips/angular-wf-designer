import {Inject, Injectable} from '@angular/core';
import {Observable, of, throwError} from 'rxjs';
import { timeout } from 'rxjs/operators/timeout'
import {catchError, map, tap} from 'rxjs/operators';
import {Router} from '@angular/router';
import {environment} from '../../environments/environment';
import {
  HttpHeaders,
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';

// 请求类型
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  })
};

const httpOptionsDownload = {
  responseType: 'blob' as 'blob',
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  })
};

//请求类型上传
const httpOptionsNoCaches = {
  headers: new HttpHeaders({
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': 'Sat, 01 Jan 2000 00:00:00 GMT'
  })
};
// 请求类型 no-cache
const httpOptionsNoCache = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': 'Sat, 01 Jan 2000 00:00:00 GMT'
  })
};

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  base_href = environment.base_href;

  baseUrl: string; //基础接口url
  constructor(@Inject('BASE_CONFIG') private config, private http: HttpClient, private router: Router) {
    this.baseUrl = this.config.uri;
  }

  /**
   *  GET请求处理（一般用于获取数据）
   * @param url 后台接口api 例如：/api/test/6
   */
  public get(url: string): Observable<any> {
    return this.http.get(this.getFullHref(url), httpOptionsNoCache).pipe(
      timeout(300000),
      map(this.extractData),
      catchError(this.handleError)
    )
  }

  /**
   * 获取最终url
   * @param url 后台接口api
   * @param data 参数
   */
  getFullHref(path: string): string {
    let fullhref: string;
    if (path.startsWith('/')) {
      fullhref = this.base_href + path;
    } else {
      fullhref = this.base_href + '/' + path;
    }
    return fullhref;
  }

  /**
   * POST请求处理（一般用于保存数据）
   * @param url 后台接口api
   * @param data 参数
   */
  public post(url: string,data:any={}): Observable<any> {
    return this.http.post(this.getFullHref(url), data, httpOptions).pipe(
      timeout(300000),
      map(this.extractData),
      catchError(this.handleError),

    )
  }

  public postDownload(url: string,data:any={}): Observable<any> {
    return this.http.post(this.getFullHref(url), data, httpOptionsDownload);
  }

/**
   * POST请求处理（一般用于保存数据）
   * @param url 后台接口api
   * @param data 参数
 */

  public posts(url: string, data = {}): Observable<any> {
    return this.http.post(this.getFullHref(url), data, httpOptionsNoCaches).pipe(
      timeout(1200000),
      map(this.extractData),
      catchError(this.handleError)
    )
  }

  /**
   * PUT请求处理（一般用于更新数据）
   * @param url 后台接口api 例如：/api/test/6
   * @param data 参数
   */
  public put(url: string, data = {}): Observable<any> {
    return this.http.put(this.getFullHref(url), data, httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  /**
   * DELETE请求处理（一般用于删除数据）
   * @param url 后台接口api 例如：/api/test/6
   */
  public delete(url: string): Observable<any> {
    return this.http.delete(this.getFullHref(url), httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  /**
   *  提取数据
   * @param res 返回结果
   */
  private extractData(res) {
    let body = res;
    return body || {};
  }

  public logout() {
    let ex = new Date();
    ex.setTime(ex.getTime() - 1);
    localStorage.removeItem('ng_philips_code1');
    localStorage.removeItem('ng_philips_username');
    sessionStorage.removeItem('ng_philips_code1');
    sessionStorage.removeItem('ng_philips_roles');
    sessionStorage.removeItem('ng_philips_groups');
    localStorage.removeItem('profiles');
    this.get('/act/logout').subscribe(rest => {
      if (rest.code == '0000') {
        const logoutUrl = rest.data.logoutUrl;
        console.log('logout redirect uri:', logoutUrl);
        window.open(logoutUrl, '_self');
      } else {
        console.log('error:' + rest.msg);
      }
    });
  }

  async silentLogout() {
    let ex = new Date();
    ex.setTime(ex.getTime() - 1);
    localStorage.removeItem('ng_philips_code1');
    localStorage.removeItem('ng_philips_username');
    sessionStorage.removeItem('ng_philips_code1');
    sessionStorage.removeItem('ng_philips_roles');
    sessionStorage.removeItem('ng_philips_groups');
    localStorage.removeItem('profiles');
    localStorage.removeItem('');
    const res = await this.get('/act/logout').toPromise();
  }

  /**
   * 错误消息类
   * @param error
   */
  private handleError(error: HttpErrorResponse) {

    if (error.error instanceof ErrorEvent) {

      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    return throwError('Something bad happened; please try again later.');
  }

  public getImage(url: string): Observable<Blob> {
    return this.http.get(this.getFullHref(url), {responseType: 'blob'});
  }

  public getFile(url: string): Observable<Blob> {
    return this.http.get(this.getFullHref(url), {responseType: 'blob'});
  }

}
