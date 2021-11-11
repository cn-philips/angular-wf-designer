import {Inject, Injectable} from '@angular/core';

@Injectable()
export class UtilityService {
  constructor() {
    
  }

  getNgbdatepickerFormatDate(delay: number, dateStr?: string) {

    const formatDate = (time: any) => {
      const Dates = new Date(time);
      const year: number = Dates.getFullYear();
      const month: any = Dates.getMonth() + 1;
      const day: any = Dates.getDate();
      return {year: year, month: month, day: day};
    };

    let today = new Date();
    if(dateStr) { //取当前日期的
      today = new Date(dateStr);
    }

    return formatDate(today.getTime() + (1000 * 3600 * 24 * delay));
  }

  formatPositiveIntNumber(event, item: any, key:string, min: string) {
    const minNum = Number(min) || 0;
    const tmpStr = event.target.value ? event.target.value.toString().replace(/[^a-zA-Z0-9*?:^"_ ]+/g, '') : (Number(min) || 0);
    let tmp = Number(tmpStr) > minNum ? Number(tmpStr) : minNum;
    console.log('formatPositiveIntNumber', tmp);
    if(item) {
      event.target.value = tmp;
      if('' != key) {
        item[key] = tmp;
      }
    } else {
      return tmp;
    }
  }

  getCurrencyPrefix(value: any): string{
    const simpleMap: any = {
      "1": "$",
      "usd": "$",
      "2": "￥",
      "rmb": "￥",
      "cby": "￥"
    };
    let re: string = '';
    if(value) {
      const valueStr: string = value.toString().toLowerCase();
      if (simpleMap[valueStr]) {
        re = simpleMap[valueStr];
      }
    }
    return re;
  }

  simpleDivision2Decimal(value: any, divisor: number): number {
    let re: number = null;
    if(value && Number(value.toString()) && 0 != divisor && !!Number(divisor)) {
      const rawNumber: number = Number(value.toString());
      re = Math.round((rawNumber * 100)/divisor)/100;
    }
    return re;
  }

  isMobile(){
    var ua = window['navigator']['userAgent'] || window['navigator']['vendor'] || window['opera'];
    return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
  }
}