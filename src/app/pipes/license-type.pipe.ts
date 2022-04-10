import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'licenseType'
})
export class LicenseTypePipe implements PipeTransform {

  licenseTypeMap = {
    '1' : '医疗机构执业许可证', 
    '2' : '营业执照', 
    '3' : '民办非企业单位等级证书', 
    '4' : '医疗器械经营许可证', 
    '5' : '第二类医疗器械经营备案凭证', 
    '6' : '医疗器械经营许可证（第三类）', 
  };
  transform(value: any, args?: any): any {
    if(this.licenseTypeMap[value.toString()]) {
      return this.licenseTypeMap[value.toString()];
    } else return '';
  }

}
