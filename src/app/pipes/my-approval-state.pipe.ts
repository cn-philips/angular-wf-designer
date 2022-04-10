import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'myApprovalState'
})
export class MyApprovalStatePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return 'finished'==value ? '已完成': 'running'==value ? '进行中' : value;
  }

}
