import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from '../services';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-devlogin',
  templateUrl: './devlogin.component.html',
  styleUrls: ['./devlogin.component.scss']
})
export class DevloginComponent implements OnInit {

  constructor(private http: HttpService, private router: Router, private aRoute: ActivatedRoute) { }

  ngOnInit() {    
    this.aRoute.queryParams.subscribe(async res => {
      if (res['code']) {        
        if(!environment.isProduction)
        {
          const out = await this.http.silentLogout();
          const uri = '/act/role/login?code1=' + res['code'];
          this.http.get(uri).subscribe(res => {
            if ('0000' === res.code) {
              console.log('Devlogin success!')
              this.router.navigateByUrl('/');
            } else {
              this.http.logout();
            }
          })
        }
        else
        {
          this.router.navigateByUrl('/logout');    
        }       
      } else {
        this.http.logout();
      }
    });
    
  }

}
