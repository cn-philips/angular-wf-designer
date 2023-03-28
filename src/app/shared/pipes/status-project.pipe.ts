import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'StatusProject'
})
export class StatusProject implements PipeTransform {



  transform(value: any, args?: any): any {    
    if (value != null) {
     if(value)
     {
      return '完成';
     }
     else{
      return '改单中';
     }
    }
  }

}