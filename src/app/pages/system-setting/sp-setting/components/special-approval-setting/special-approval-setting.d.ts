import { CC_PERSON_TYPE } from './special-approval-setting.constants'

interface BusinessProc {
  id?: string;
  bg: string;
  applyType: string;
  applyItem: string;
  status: string;
  processId: string;
  minWarrantyMonths?: number;
  minWarrantyMonthsComparator?: string;
  maxWarrantyMonths?: number;
  maxWarrantyMonthsComparator?: string;
  remark?: string;
  admin?: string[];
  owner?: string[];
}

export interface ApproveProc {
  id?: string;
  code: string;
  name: string;
  remark: string;
  status: string;
  nodeList: ApproveNode[];
}

interface CcPerson {
  id?: number;
  processId?: string;
  processNodeId?: string;
  personType: CC_PERSON_TYPE;
  person: string;
  triggerType: string;
}

interface ApproveNode {
  id?: string;
  processId?: string;
  taskId?: string;
  name: string;
  mode: string;
  action: string;
  approveRole: string;
  approver: string;
  approverCustom: number;
  approverInitiator: number;
  remark?: string;
  status: number | boolean;
  cc: number;
  ccPersonList: CcPerson[];
}

export {
  BusinessProc,
  CcPerson,
  ApproveNode,
}
