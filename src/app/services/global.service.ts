import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';   
import {HttpService} from './http.service';
import { HttpBackend } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor(private http: HttpService) { }

  validatorValue = new Subject();

  mainBtnStr: Subject<string> = new Subject<string>();

  set theValidator(value) {
    this.validatorValue.next(value); // this will make sure to tell every subscriber about the change.
    localStorage.setItem('theValidator', value);
  }

  get theValidator() {
    return localStorage.getItem('theValidator');
  }

  async setLocalStorageUsercode () {
    const uri = '/act/getUserInfo';
    let res = await this.http.get(uri).toPromise();
    if('0000' === res.code) {
      let code1 = res.data['code'];
      localStorage.setItem('ng_philips_code1', code1);
    }
  }

  async setSessionStorageUserInfo() {
    const uri = '/act/getUserInfo';
    let res = await this.http.get(uri).toPromise();
    if ('0000' === res.code) {
      let code1 = res.data['code'];
      sessionStorage.setItem('ng_philips_code1', code1);
      sessionStorage.setItem('ng_philips_roles', '');
      sessionStorage.setItem('ng_philips_groups', '');
      if (res.data['tblRoleList'] && res.data['tblRoleList'].length > 0) {
        let roles = '';
        for (const item of res.data['tblRoleList']) {
          if(item['roleCode']) {
            roles += (item['roleCode'] + ';');
          }
        }
        if('' !== roles) {
          roles = roles.slice(0, -1);
        }
        sessionStorage.setItem('ng_philips_roles', roles);
      }
      if (res.data['tblGroupList'] && res.data['tblGroupList'].length > 0) {
        let groups = '';
        for (const item of res.data['tblGroupList']) {
          if (item['code']) {
            groups += (item['code'] + ';');
          }
        }
        if ('' !== groups) {
          groups = groups.slice(0, -1);
        }
        sessionStorage.setItem('ng_philips_groups', groups);
      }
    }
  }

  getLocalCode1(): string {
    return localStorage.getItem('ng_philips_code1') || '';
  }

  getSessionCode1(): string {
    return sessionStorage.getItem('ng_philips_code1') || '';
  }

  private getSessionRoles(): string {
    return sessionStorage.getItem('ng_philips_roles') || '';
  }

  private getSessionGroups(): string {
    return sessionStorage.getItem('ng_philips_groups') || '';
  }

  getRoles(): any[] {
    let result = [];
    if('' !== this.getSessionRoles()) {
      result = this.getSessionRoles().split(';');
    }
    return result;
  }

  getGroups(): any[] {
    let result = [];
    if ('' !== this.getSessionGroups()) {
      result = this.getSessionGroups().split(';');
    }
    return result;
  }

  async getRolesAsync() {
    let roles = this.getRoles();
    if (roles.length < 1 || !sessionStorage.getItem('ng_philips_code1') || sessionStorage.getItem('ng_philips_code1') !== localStorage.getItem('ng_philips_code1')) {
      await this.setSessionStorageUserInfo();
      roles = this.getRoles();
    }
    return roles;
  }

  async getGroupsAsync() {
    let groups = this.getGroups();
    if (groups.length < 1 || !sessionStorage.getItem('ng_philips_code1') || sessionStorage.getItem('ng_philips_code1') !== localStorage.getItem('ng_philips_code1')) {
      await this.setSessionStorageUserInfo();
      groups = this.getGroups();
    }
    return groups;
  }

  mainBtnStrChange(data: string) {
    this.mainBtnStr.next(data);
  }

}
