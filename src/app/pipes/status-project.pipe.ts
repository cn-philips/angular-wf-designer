import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'StatusProject'
})
export class StatusProject implements PipeTransform {



  transform(value: any, args?: any): any {
      if(value!=null)
      {
        switch(value.toString())
          {        
              case "1":
              return "成功"
              break
              case "2":
              return "失败"
              break
              case "0":
              return "审批中"            
              break            
          }
      }          
    }
  
}