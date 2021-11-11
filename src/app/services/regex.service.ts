
import {Injectable, EventEmitter, OnInit} from "@angular/core";
  @Injectable({
    providedIn: 'root'
  })
  
  export class RegexService {

  emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  constructor() {
  }

  validateEmail(email: string): boolean {
    let result = false;
    if(email) {
      result = this.emailRegex.test(email);
    }
    return result;
  }

  cleanEmailListString(str: string): string {
    let result = '';
    if(!str || '' == str.trim()) {
      return result;
    } else {
      str = str.replace(/；/g, ';').replace(/;/g, ';');
      let rawArr = str.split(';');
      let cleanArr = rawArr.filter((el, i, a) => i === a.indexOf(el));
      for(const item of cleanArr) {
        if(this.validateEmail(item)) {
          if('' == result) {
            result += item;
          } else {
            result += ';' + item;
          }
        }
      }
      return result;
    }
  }
  

  }