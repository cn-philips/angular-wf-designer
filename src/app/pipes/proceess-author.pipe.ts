import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'proceessAuthor'
})
export class proceessAuthor implements PipeTransform {
  transform(value: any, args?: any): any {
    if (value !== null && value !== undefined && value !== '') {
      switch (value.toString()) {
        case 'private':
          return '否';
          break;
        case 'nonprivate':
          return '是';
          break;
        default:
          return '';
      }
    }
  }
}
