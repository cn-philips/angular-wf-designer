import { Component, Input, ChangeDetectionStrategy, AfterViewInit, OnInit, HostBinding, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute,UrlTree } from '@angular/router';
import { AppService } from '../../app.service';
import { LayoutService } from '../layout.service';
import { HttpService } from '../../services';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-layout-sidenav',
  templateUrl: './layout-sidenav.component.html',
  styles: [':host { display: block; }'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class LayoutSidenavComponent implements OnInit, AfterViewInit {
  @Input() orientation = 'vertical';

  @HostBinding('class.layout-sidenav') private hostClassVertical = false;
  @HostBinding('class.layout-sidenav-horizontal') private hostClassHorizontal = false;
  @HostBinding('class.flex-grow-0') private hostClassFlex = false;

  list:any;
  menuId = '';
  menuType = '';

  constructor(private router: Router,
    private appService: AppService,
    private layoutService: LayoutService,
    private http: HttpService,
    private aRoute: ActivatedRoute) {
    // Set host classes
    this.hostClassVertical = this.orientation !== 'horizontal';
    this.hostClassHorizontal = !this.hostClassVertical;
    this.hostClassFlex = this.hostClassHorizontal;

    // this.menuId = this.aRoute.snapshot.queryParams['id'];
    // this.menuId = this.aRoute.params.subscribe(params =>{
    // });

    //TODO only for dev
    // if (!localStorage.getItem('ng_philips_code1')) {
    //   console.log('init user...')
    //   localStorage.setItem('ng_philips_code1', 'sysadmin');
    //   localStorage.setItem('ng_philips_username', 'Admin');
    // }
    // localStorage.setItem('ng_philips_code1', 'sysadmin'
  }

  ngOnInit(): void {

    // //TODO only for dev
    // if (!localStorage.getItem('ng_philips_code1')) {
    //   console.log('init user...')
    //   localStorage.setItem('ng_philips_code1', 'sysadmin');
    //   localStorage.setItem('ng_philips_username', 'Admin');
    // }
    // // localStorage.setItem('ng_philips_code1', 'sysadmin')


    this.aRoute.queryParams.subscribe(params => {      
      this.menuId = params.id==null?'':params.id;
      this.menuType = params.type==null?'':params.type;
    });

    // console.log('start getting sidenav')
    //caution below line url
    let code1 = localStorage.getItem('ng_philips_code1');
    // this.http.get('/act/login?code1='+code1).subscribe(res =>{
    // this.http.get('/act/queryUserMenu?code1=' + code1).subscribe(res =>{
    //   // console.log(res.data);
    //   if('0000' == res.code) {
    //     // console.log(res.data);
    //     let menusRaw = res.data;
    //     if(menusRaw.length > 0) {
    //       this.setMenuRoute(menusRaw);
                  
    //       this.list=menusRaw;
    //     }
    //   }
    // });
    //左侧菜单
    this.http.post('/act/role/getDiigtUserInfo').subscribe(res=>{
      if("0000"==res.code&&res.data&&res.data.jurisdictions&&res.data.jurisdictions.length>0)
      {
        let profiles=JSON.stringify(res.data.profiles) ;
        window.localStorage.setItem("profiles",profiles)
        window.localStorage.setItem("roleCode",res.data.roleCode);        
        window.localStorage.setItem("roles",JSON.stringify(res.data.roles));
        this.list=res.data.jurisdictions;
        window.localStorage.setItem("menuList",JSON.stringify(this.list));
      }
      else
      {
          this.router.navigate(['/anonymous']);
          return       
      }
    })
  }

  ngAfterViewInit() {
    // Safari bugfix
    this.layoutService._redrawLayoutSidenav();
  }

  setMenuRoute(event){
    for(let i=0;i<event.length;i++){
      event[i]['router'] = this.whichRoute(event[i]['value']['url']);
      if(event[i]['childs'].length >0) {
        this.setMenuRoute(event[i]['childs']);
      }
    }
  }

  whichRoute(str){
    if(str.indexOf('masterdata') != -1) {
      return '/master-data-maintenance';
    } else if (str.indexOf('template') != -1) {
      return '/template-maintenance';
    } else if (str.indexOf('/relation/queryAll') != -1) {
      return '/role-authorization';
    } else if (str.indexOf('queryAllUser') != -1) {
      return '/personal-info';
    } else if (str.indexOf('model/list') != -1) {
      return '/new-approval';
    } else if (str.indexOf('/taskList/') != -1) { //TODO only for dev
      return '/my-task';
    } else if (str.indexOf('/listAllProcessInstance') != -1) { //TODO only for dev
      return '/my-approval';
    } else if (str.indexOf('/draft/listAll') != -1) { //TODO only for dev
      return '/my-draft';
    } else if (str.indexOf('/task/acceptTaskList') != -1) { //TODO only for dev
      return '/claim-task';
    } else if (str.indexOf('/quotation/queryAll') != -1) { //TODO only for dev
      return '/quotation-management';
    } else if (str.indexOf('/oabws/query') != -1) {
      return '/oa-bwsfile';
    }else if (str == 'dimensiontree') {
      return '/dimension-tree';
    }else if (str ==  'rolemanager') {
      return '/role-list';
    }else if (str == 'admintools'){
      return '/admin-tools';
    }else if (str == 'usermanager'){
      return '/app-personnel-management';
    }else if (str == 'groupmanager'){
      return '/app-group-management';
    } else if (str == '/report/pageQuery') {
      return '/report';
    }
  }

  getClasses() {
    let bg = this.appService.layoutSidenavBg;
    if (this.orientation === 'horizontal' && (bg.indexOf(' sidenav-dark') !== -1 || bg.indexOf(' sidenav-light') !== -1)) {
      bg = bg
        .replace(' sidenav-dark', '')
        .replace(' sidenav-light', '')
        .replace('-darker', '')
        .replace('-dark', '');
    }

    return `${this.orientation === 'horizontal' ? 'container-p-x ' : ''} bg-${bg}`;
  }

  isActive(url) {    
    return this.router.isActive(url, true);
  }

  isActiveLeaf(url, param?) {
    if(param) {
      const id: string = param.id;
      return this.menuId == id;
    } else {
      return this.isActive(url);
    }
  }

  isActiveParent(url, param?) {
// console.log(param);
    if(param) {
      
      const type_: string = param.type + '_';
      return this.menuType.indexOf(type_) != -1;
    } else {
      return this.isActive(url);
    }
  }

  isMenuActive(url) {
    return this.router.isActive(url, false);
  }

  isMenuOpen(url) {
    return this.router.isActive(url, false) && this.orientation !== 'horizontal';
  }

  isMenuOpenAlt(url, param?) {    
    if(param){
      const type_: string = param.type + '_';
      return this.menuType.indexOf(type_) != -1 && this.orientation !== 'horizontal';
    }else {
      return this.router.isActive(url, false) && this.orientation !== 'horizontal';
    }
  }

  toggleSidenav() {
    this.layoutService.toggleCollapsed();
  }
}
