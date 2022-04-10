import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../../services';


@Component({
  selector: 'app-mobile-header-navbar',
  templateUrl: './mobile-header-navbar.component.html',
  styleUrls: ['./mobile-header-navbar.component.scss']
})
export class MobileHeaderNavbarComponent implements OnInit {

  @Input()
  parentUrl: string;

  @Input()
  title: string = 'Commercial Operation';

  @Input()
  hideLeft: boolean = false;

  @ViewChild("icon") leftIconTemplate: TemplateRef<any>;
  @ViewChild("noIcon") noIconTemplate: TemplateRef<any>;

  leftIcon: TemplateRef<any>;


  name: string = '';

  constructor(private router: Router, private http: HttpService) { }

  ngOnInit() {

    if(!this.hideLeft) {
      this.leftIcon = this.leftIconTemplate;
    } else {
      this.leftIcon = this.noIconTemplate;
    }

    this.http.get('/act/getUserInfo').subscribe(res=>{
      if('0000'=== res.code) {
        console.log(res.data);
        this.name = res.data['name'] || '';
      }
    });
  
  }

  // nav
  onLeftClick() {
    if(!this.parentUrl) {
      window.history.go(-1);
    } else {
      this.router.navigateByUrl(this.parentUrl);
    }
  }

  goHome() {
    this.router.navigateByUrl('/m');
  }
}
