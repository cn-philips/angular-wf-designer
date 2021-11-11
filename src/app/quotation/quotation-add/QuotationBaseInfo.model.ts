export class QuotationBaseInfoModel {
  businessType: string;
  salesGroupName: string; //销售团队
  salesGroupCode: string;
  purchaseTypeName: string; //订单类型
  purchaseTypeCode: string;
  solutionTypeName: string; //solution
  solutionTypeCode: string;
  currencyType:string;
  enduserName:string;
  enduserId: string; //客户字典中的CustomerSysID
  enduserProvince: string; //客户字典中的省市区信息
  enduserCity: string; //客户字典中的省市区信息
  enduserCountry: string; //客户字典中的省市区信息
  enduserType:string;
  customerDirAddress:string;
  enduserAddress:string;
  philipsType:string;//e.g. 公立HTA
  philipsAuthList: any[] = []; //e.g.["HTAUS","LTAUS"]
  distributorAddress:string;
  distributorName:string;
  distributorId: string; //客户字典中的CustomerSysID
  distributorAgreementNos: string; //经销商协议号
  purchaseDate:string;
  purchasePrice:string;
  deliveryAddress:string;
  expectdistributerotherfee:string; //预计经销商其他费用
  expectwinbidprice:string; //预计经销商利润
  expectDealerMargin:string; //预计经销商利润
  expectwinbidbz:string; //经销商利润币种
  applyPrice:string; //预计申请金额
  applyReason:string; //申请理由
  biddingCompany:string; //招标公司全称
  commisionCompany:string;//佣金公司全称
  usRate:string;//汇率
  sofonFiles: any[] = []; //sofon文件
  isPrivate: number; //手选是否民营医院
  version:string;
  acceptTerm: any[];
  constructor(){
  }
}
