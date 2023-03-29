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
    const loginUserEmail = localStorage.getItem('ecom_ng_philips_code1');
    // value null undefined ''直接return
    if (email === loginUserEmail || [null, undefined, ''].includes(value)) {
      return value;
    }
    
    const roles = JSON.parse(localStorage.getItem('roles'));
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
