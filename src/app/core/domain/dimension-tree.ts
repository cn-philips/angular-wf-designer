import { Role } from './role-info';

export interface DimensionTree {
  id?: number,
  dimensionName?: string,
  roleId?: number,
  dimensionCode?: string,
  dimensionType?: string,
  parent?: DimensionTree,
  key?: string,
  expand: boolean,
  children: DimensionTree[],
  role: Role,
  level?: number,
  parentId?: number
}


