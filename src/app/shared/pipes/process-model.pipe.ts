import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ProcessModel'
})
export class ProcessModelPipe implements PipeTransform {



  transform(value: any, args?: any): any {

    if (value != null && value !== undefined && value !== '') {
        switch (value.toString()) {
            case 'direct':
             return 'Direct Deal';
            case 'distributor':
             return 'Distributor Deal';
          case 'DIRECT':
            return 'Direct Deal';
          case 'DISTRIBUTOR':
            return 'Distributor Deal';
            default:
             return value.toString();
        }
    }
  }
}
