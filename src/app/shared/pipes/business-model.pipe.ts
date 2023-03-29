import { Pipe, PipeTransform } from "@angular/core";


const map = {
  'DIRECT': 'Direct Deal',
  'DISTRIBUTOR': 'Distributor Deal',
}

@Pipe({
  name: "BusinessModelPipe",
})
export class BusinessModelPipe implements PipeTransform {

  constructor() { }

  transform(value: any): string {
    console.log({
      value,
      mapVal: map[value]
    });
    
    return map[value] || ''
  }
}
