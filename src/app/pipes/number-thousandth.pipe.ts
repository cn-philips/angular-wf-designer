import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name:'NumberThousandth'
})
export class NumberThousandth implements PipeTransform {

  transform(value: any): any { 
    
    if(value!=null&&value!=undefined&&value!="") 
    {   
      value=value.toString();  
      const index=value.indexOf(".")
      if(index!=-1)
      {
        value=value.replace(/(\d)(?=(\d{3})+\.)/g, '$1,')        
        return value;
      }
      else{
        value=value.replace(/(?=(?!(\b))(\d{3})+$)/g, '$1,')      
        return value;
      }   
        
    }
    else{
      return ""
    }
  }
}

