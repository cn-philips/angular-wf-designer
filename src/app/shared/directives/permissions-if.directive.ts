import {Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[appPermissionsIf]'
})
export class PermissionsIfDirective {

  constructor(private templatef: TemplateRef<any>, private viewContainerRef: ViewContainerRef) { }


  /*
  * key 权限的group
  * */
  @Input('appPermissionsIf')
  set key(key: string) {
    /*判断dom是否显示*/
    let isPermission = false;
    const roles = JSON.parse(localStorage.getItem('roles'));
    const permissions = JSON.parse(localStorage.getItem('permissions'));
    if (roles && permissions && permissions[key]) {
      permissionsFor: for (let i = 0; i < roles.length; i++) {
        if (permissions[key].indexOf(roles[i]) !== -1) {
          isPermission = true;
          break permissionsFor;
        }
      }
    }
    if (isPermission) {
      this.viewContainerRef.createEmbeddedView(this.templatef);
    } else {
      this.viewContainerRef.clear();
    }
  }
}
