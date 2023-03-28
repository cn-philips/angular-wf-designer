import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileAuthority'
})
export class FileAuthorityPipe implements PipeTransform {
  transform(value: any, type: string): any {
    let permission = null
    switch (type) {
      case 'sofon':
        permission = localStorage.getItem('sofonFileAuthority')
        if (permission == 'true') {
          return value
        } else {
          return ''
        }
      case 'contract':
        permission = localStorage.getItem('contractFileAuthority')
        if (permission == 'true') {
          return value
        } else {
          return ''
        }
      case 'config':
        permission = localStorage.getItem('configtFileAuthority')
        if (permission == 'true') {
          return value
        } else {
          return ''
        }
      default:
        return value
    }
  }
}
