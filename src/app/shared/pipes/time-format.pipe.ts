import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';


@Pipe({
  name: 'TimeFormatePipe'
})
export class TimeFormatPipe implements PipeTransform {


  transform(value: any, args?: any): any {

    let currentZoneTime = new Date(value);
    let currentZoneHours = currentZoneTime.getHours();

    if (value && value.toString().indexOf('-') != -1) {
      currentZoneTime.setHours(currentZoneHours + 8);
    }


    return  moment(currentZoneTime).format('YYYY-MM-DD HH:mm:ss');

  }


}
