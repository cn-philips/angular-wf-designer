import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priceAuthority'
})
export class PriceAuthorityPipe implements PipeTransform {
  transform(value: any, type: string, itemModality: any = null): any {
    //获取角色信息与权限配置信息以及当前用户的roles列表
    const permissions = JSON.parse(localStorage.getItem('permissionsV3'))
    const currRoles = JSON.parse(localStorage.getItem('roles'))
    const profiles = JSON.parse(localStorage.getItem('profiles'))
    let modalityList=[];
    if(profiles&&profiles.length>0)
    {
       modalityList = Array.from(new Set(profiles.map(val => val.modality)))
    }
    else{
      modalityList=[];
    }
    
    //过滤
    const permissionList = profiles.map(val => {
        return {
          modality: val.modality,
          role: val.role
        }
    })
    //分别取出三种价格权限的配置信息
    let dealPricePermissions = permissions.price_deal
    let detailsPricePermissions = permissions.price_details
    let contractPricePermissions = permissions.price_contract
    let endPermission = []
    if (itemModality != null) {
      //过滤出对应modality的权限  传入的modality应为当前orderModality
      dealPricePermissions = dealPricePermissions.filter(val => val.fieModality == itemModality)
      detailsPricePermissions = detailsPricePermissions.filter(val => val.fieModality == itemModality)
      contractPricePermissions = contractPricePermissions.filter(val => val.fieModality == itemModality)
      switch (type) {
        case 'deal':
          for (let i = 0; i < permissionList.length; i++) {
            endPermission = dealPricePermissions.filter(val => (val.fieModality == permissionList[i].modality && val.fieRoles == permissionList[i].role))
            if (endPermission && endPermission.length > 0) {
              return value
            }
          }
          if (endPermission && endPermission.length > 0) {
            return value;
          } else {
            return '-'
          }
        case 'details':
          for (let i = 0; i < permissionList.length; i++) {
            endPermission = detailsPricePermissions.filter(val => val.fieModality == permissionList[i].modality && val.fieRoles == permissionList[i].role )
          
            if (endPermission && endPermission.length > 0) {
              return value
            }
          }
          return '-'
        case 'contract':
          
          for (let i = 0; i < permissionList.length; i++) {
            endPermission = contractPricePermissions.filter(val => val.fieModality == permissionList[i].modality && val.fieRoles == permissionList[i].role )
           
            if (endPermission && endPermission.length > 0) {
              return value
            }
          }
      return '-'
        default:
          return '-'
      }
    } else if (itemModality == null){
      switch (type) {
        case 'deal':
          endPermission = dealPricePermissions.filter(val => modalityList.includes(val.fieModality) && currRoles.includes(val.fieRoles))
          if (endPermission && endPermission.length > 0) {
            return value;
          } else {
            return '-'
          }
        case 'details':
          endPermission = detailsPricePermissions.filter(val => modalityList.includes(val.fieModality) && currRoles.includes(val.fieRoles))
          if (endPermission && endPermission.length > 0) {
            return value;
          } else {
            return '-'
          }
        case 'contract':
          endPermission = contractPricePermissions.filter(val => modalityList.includes(val.fieModality) && currRoles.includes(val.fieRoles))
        
          if (endPermission && endPermission.length > 0) {
            return value;
          } else {
            return '-'
          }
        default:
          return '-'
      }
    } else {
      return '-'
    }

  }
}
