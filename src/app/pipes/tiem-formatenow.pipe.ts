import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';


@Pipe({
  name: 'TimeFormatePipeNow'
})
export class TimeFormatePipeNow implements PipeTransform {


  transform(value: any, args?: any): any {
    if (value == null) {
      return '';
    }
    let currentZoneTime = new Date(value);
    let currentZoneHours = currentZoneTime.getHours();

    if (value && value.toString().indexOf('-') != -1) {
      currentZoneTime.setHours(currentZoneHours);
    }


    return  moment(currentZoneTime).format('YYYY-MM-DD');

  }


}
