import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'yn'
})
export class YnPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return value==='Y' ? '是' : '否';
  }

}
