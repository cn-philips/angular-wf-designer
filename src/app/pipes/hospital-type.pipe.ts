import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hospitalType'
})
export class HospitalTypePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return '0' == value ? '民营' : '1' == value ? '公立' : '其他';
  }

}
