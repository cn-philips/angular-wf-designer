import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ProcessThird'
})
export class ProcessThirdPipe implements PipeTransform {



  transform(value: any, args?: any): any {
  
    if(value!=null&&value!=undefined&&value!="") 
    {   
        switch(value.toString())
        {        
            case "wjfwyq":
             return "未交付未逾期"
             break
             case "wjfyyq":
             return "未交付已逾期"
             break
             case "jfwyq":
             return "交付未逾期"
             break
             case "jfyyq":
             return "交付已逾期"
             break
            default:
             return ""
        } 
    }
  }
}