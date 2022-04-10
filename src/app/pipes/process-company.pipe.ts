import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ProcessCompany'
})
export class ProcessCompany implements PipeTransform {



  transform(value: any, args?: any): any {
  
    if(value!=null&&value!=undefined&&value!="") 
    {   
        switch(value.toString())
        {        
            case "1":
             return "飞利浦（中国）投资有限公司"
             break
             case "2":
             return "飞利浦电子香港有限公司"
             break
            default:
             return ""
        } 
    }
  }
}