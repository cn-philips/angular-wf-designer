export interface Role {
  id?: string,
  name?: string,
  describe?: string,
  roleName?: string,
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

export interface RoleUser {
  id: any;
  dataSource: string;
  modality: string;
  bmc: string;
  team: string;
  email: string;
  role: string;
  name: string;
  lineManager: string;
  userNumber: string;
  cluster: string;
  funcTeamType: string;
  bmcMags: [],
  serveTeams: [],
}

export enum FORM_ACTION_TYPE {
  EDIT = "EDIT",
  CREATE = "CREATE",
  CHECK = "CHECK",
}