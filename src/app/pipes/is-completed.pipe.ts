import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isCompleted'
})
export class IsCompletedPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return 'true'==value ? '已完成':'未完成';
  }

}
