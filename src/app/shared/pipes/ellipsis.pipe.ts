import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'ellipsis'
})
export class EllipsisPipe implements PipeTransform {

  public transform(value: any, max: number): any {
    const arr = [null, undefined, ''];
    if(arr.includes(value) || [null, undefined].includes(max) || max < 1){
        return value;
    }
    value = value.toString();
    if (value.length > max) {
        return value.substring(0,50).concat('...');
    }
    return value;
  }
}