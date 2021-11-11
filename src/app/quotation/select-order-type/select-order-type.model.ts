export class SelectOrderTypeModel {
  orderType: string;//0.全新申请;1.来自special order price审批
  specialOrderId: string;
  specialOrderDispalyName: string;
  isCompleted:boolean;
  constructor(){
  }
}
