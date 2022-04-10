import {Group} from './groupInfo';

export interface Role {
  id?: string,
  name?: string,
  roleCode?: string,
  group?:string,
  description?: string
}

export interface Personals {
  id?: number,
  code?: string,
  name?: string,
  email?: string,
  phone?: number,
  sapCode?: string
}

export interface Groups {
  id?: number,
  code?: string,
  name?: string,
  roleList?: Role[]
}
export interface Roles {
  id?: number,
  roleName?: string,
  roleCode?: string,
  describe?: string
}