import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, UrlTree } from '@angular/router';
import { HttpService } from '@core/services';


@Component({
  selector: 'auth-callback',
  template: `<p>auth-callback initiating...</p>`
})
export class AuthCallbackComponent implements OnInit {

  constructor(private aRoute: ActivatedRoute,
    private http: HttpService,
    private router: Router) {

  }

  ngOnInit() {  
      
    this.aRoute.queryParams.subscribe(async params => {
      // this.menuId = params.id == null ? '' : params.id;
      // this.menuType = params.type == null ? '' : params.type;
      console.log('callback-params->', params);
      let res = await this.goBackendCallback(params);            
      if (res['code'] === '0000') {
        //TODO need to redirect to previous url
        console.log('sso ok!', res['data']);        
        let data = res['data'];
        
        if(data.name=='Anonymous')
        {
          this.router.navigate(['/anonymous']);
          return
        }
        localStorage.setItem('ecom_ng_philips_code1', data.code1);
        localStorage.setItem('ng_philips_email', data.email);
        localStorage.setItem('ng_philips_username', data.name);
        this.router.navigate(['/']);
      } else {
        //TODO 
        console.log('after sso and failed', res);
        this.router.navigate(['/logout']);
      }

    });
  }

  async goBackendCallback(params) {
    let code = params['code'] ? params['code'] : '';
    let state = params['state'] ? params['state'] : '';
    const uri = '/act/callback?code=' + code + '&state=' + state;
    let res = await this.http.get(uri).toPromise();
    console.log('goBackendCallback', res);
    return res;
  }
}
