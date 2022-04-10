import {Component, Input, HostBinding, ViewEncapsulation} from '@angular/core';
import {Router, ActivatedRoute, RouterModule, Routes} from '@angular/router';
import {AppService} from '../../app.service';
import {LayoutService} from '../../layout/layout.service';
import {ToastrService} from 'ngx-toastr';
import {HttpService} from '../../services';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment'
import { NgZorroAntdModule,NzMessageService, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import * as jwt_decode from 'jwt-decode';

import {
  NgbModal,
  ModalDismissReasons,
  NgbModalRef,
  NgbDateStruct,
  NgbDateParserFormatter,
} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-layout-navbar',
  templateUrl: './layout-navbar.component.html',
  styles: ['./layout-navbar.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LayoutNavbarComponent {
  isExpanded = false;
  isRTL: boolean;
  isProduction: boolean;

  @Input() sidenavToggle = true;

  @HostBinding('class.layout-navbar') private hostClassMain = true;

  username: string = localStorage.getItem('ng_philips_username');
  applicationName:any;

  constructor(private appService: AppService,
              private aRoute: ActivatedRoute,
              private layoutService: LayoutService,
              private router: Router,
              private modalService: NgbModal,
              private toastrService: ToastrService,
              private http: HttpService,
              private message: NzMessageService,
              private cookieService: CookieService) {

    // console.log('env', environment);
    this.isProduction = environment['isProduction'] || false;
    this.isRTL = appService.isRTL;
    if ((!localStorage.ng_philips_username || '' === localStorage.ng_philips_username) 
      && this.cookieService.check('Philips_TOKEN') && '' != this.cookieService.get('Philips_TOKEN')) {
      const userBaseInfo = jwt_decode(this.cookieService.get('Philips_TOKEN'));
      localStorage.setItem('ng_philips_code1', userBaseInfo['code1']||'');
      localStorage.setItem('ng_philips_username', userBaseInfo['username']||'');
      this.username = localStorage.getItem('ng_philips_username');
    } else if (this.cookieService.check('Philips_TOKEN') && '' != this.cookieService.get('Philips_TOKEN')) {
      const userBaseInfo = jwt_decode(this.cookieService.get('Philips_TOKEN'));
      localStorage.setItem('ng_philips_code1', userBaseInfo['code1'] || '');
      localStorage.setItem('ng_philips_username', userBaseInfo['username'] || '');
      this.username = localStorage.getItem('ng_philips_username')
    }
     this.getItopName();
  }

  currentBg() {
    return `bg-${this.appService.layoutNavbarBg}`;
  }

  toggleSidenav() {
    this.layoutService.toggleCollapsed();
  }
  //ITOP取字典表里边的参数
  getItopName()
  {
    const params = {
      dictGroup: 'ITOP',
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
      if (rest.code === '0000') {
        if(rest.data.length>0)
        {
          this.applicationName=rest.data[0].label;
        }
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }
  logout() {
    this.http.logout();
    //window.localStorage.clear();
  }
  iconClick()
  {
     let userName=localStorage.getItem('ng_philips_code1');
     let info={
       userName:userName,
       applicationName:this.applicationName,
     }
     let jsonString=JSON.stringify(info);
     let encodeInfo=window.btoa(jsonString);
     let url=`${location.origin}${environment.itop_href}?info=${encodeInfo}`;
     window.open(url);

  }
  switchUser(code,name){
    this.resetToken();    
    this.http.get('/act/login?code1=' + code).subscribe(res => {
      if (res.code === '0000') {
        
        localStorage.setItem('ng_philips_code1', code);
        localStorage.setItem('ng_philips_username', name);
        window.location.reload();
      } else {
        this.router.navigate(['/logout']);
      }
    });
    // this.http.get()
    // localStorage.setItem('ng_philips_code1', code);
    //localStorage.setItem('ng_philips_username', name);
    // window.location.reload()
  }

  switchUserManual(content) {
    this.modalService.open(content, {
      size: 'lg',
      windowClass: 'modal-l',
      backdrop: 'static',
      keyboard: false
    }).result.then((result) => {
      console.log(`Closed with: ${result}`);
    }, (reason) => {
      console.log(`Dismissed ${this.getDismissReason(reason)}`);
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  saveTestUserInfo(code1, name) {
    if (code1.value !== '' && name.value !== '') {
      this.http.get('/act/login?code1=' + code1.value).subscribe(res => {
        if (res.code === '0000') {
          localStorage.setItem('ng_philips_code1', code1.value);
          localStorage.setItem('ng_philips_username', name.value);
          window.location.reload();
        } else {
          this.router.navigate(['/logout']);
        }
      });

    } else {
      this.toastrService.warning('请输入Code1和用户名');
      return;
    }
  }

  //for dev/debug
  resetToken() {
    var ex = new Date();
    ex.setTime(ex.getTime() - 1);    
    document.cookie = 'Philips_TOKEN' + '=; expires=' + ex.toUTCString() + ';path=/';
    this.cookieService.delete('Philips_TOKEN', '../');
    this.cookieService.delete('Philips_TOKEN', '/');
    this.cookieService.delete('Philips_TOKEN', '');
    localStorage.removeItem('ng_philips_code1');
    localStorage.removeItem('ng_philips_username');
    localStorage.removeItem('ng_philips_email');
    localStorage.removeItem('routerInfo');
  }
}
