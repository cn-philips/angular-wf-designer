import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pricePermissions'
})
export class PricePermissionsPipe implements PipeTransform {

  /*
  * 价格查看权限
  * 没有权限隐藏
  * */

  transform(value: any, email: string): any {
    const roles = JSON.parse(localStorage.getItem('roles'));
    if (email !== null && email !== undefined && email !== '' && email === roles) {
      return value;
    }
    const permissions = JSON.parse(localStorage.getItem('permissions'));
    if (roles && permissions && permissions.price) {
      for (let i = 0; i < roles.length; i++) {
        if (permissions.price.indexOf(roles[i]) !== -1) {
          return value;
        }
      }
    }
    return '';
  }

}
