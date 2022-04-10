import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ProcessProject'
})
export class ProcessProject implements PipeTransform {



  transform(value: any, bindname: any,stockname:any): any {
        
        switch(value)
        {
            case "STOCK":
             return  stockname
             break;  
            case "BIDDING":
              return  bindname;
              break;
            default:
                return bindname;    
        }
    }
  
}