import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ProcessBtn'
})
export class ProcessBtn implements PipeTransform {

  processTypeMap = {
    '': '',
    'null': '',
    'ZBSQ': '招标授权',
    'ZBBA': '中标备案',
    'DBA': '待备案',
    'DSWZYQR' : '待商务专员确认',
    'DTJ': '待提交',
    'WZB': '未中标',
    '2CKB' : '二次开标',
    'XMZZ' : '项目终止',
    'ZBQR': '中标确认',
    'YZBQR': '已中标确认',
    'SUBMIT': '已提交',
    'APPROVED': '已批准',

  };

  transform(value: any, args?: any): any {
    // if(value!=null&&value!=undefined&&value!="")
    // {
    //   if (this.processTypeMap[value.toString()]) {
    //     return this.processTypeMap[value.toString()];
    //   } else return '';
    // }  
    if(value!=null&&value!=undefined&&value!="") 
    {
        switch(value.toString())
        {        
            case "YZBQR":
             return "查看"
             break
            default:
             return "查看"
        } 
    }
  }
}