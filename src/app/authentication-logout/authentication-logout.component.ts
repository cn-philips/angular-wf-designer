import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-authentication-logout',
  templateUrl: './authentication-logout.component.html',
  styleUrls: ['./authentication-logout.component.scss']
})
export class AuthenticationLogoutComponent implements OnInit {

  constructor(private cookieService: CookieService, private router: Router) {
    this.clearLocalData();
  }

  ngOnInit() {
    this.backToHome();
  }

  clearLocalData() {
    var ex = new Date();
    ex.setTime(ex.getTime() - 1);
    document.cookie = "Philips_TOKEN" + "=; expires=" + ex.toUTCString() + ";path=/";
    this.cookieService.delete('Philips_TOKEN','../');
    this.cookieService.delete('Philips_TOKEN','/');
    // this.cookieService.set('Philips_TOKEN','');
    localStorage.removeItem('ng_philips_code1');
    localStorage.removeItem('ng_philips_username');
    localStorage.removeItem('routerInfo');
    localStorage.removeItem('ng_philips_email');
    sessionStorage.removeItem('ng_philips_code1');
    sessionStorage.removeItem('ng_philips_roles');
    sessionStorage.removeItem('ng_philips_groups');
  }

  backToHome() {
    this.router.navigate(['/'])
  }
}
