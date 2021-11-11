export class QuotationBaseInfoModel {
  businessType: string;
  salesGroupName: string; //销售团队
  salesGroupCode: string;
  purchaseTypeName: string; //订单类型
  purchaseTypeCode: string;
  solutionTypeName: string; //solution
  solutionTypeCode: string;
  currencyType: string;
  enduserName: string;
  enduserId: string; //客户字典中的CustomerSysID
  enduserProvince: string; //客户字典中的省市区信息
  enduserCity: string; //客户字典中的省市区信息
  enduserCountry: string; //客户字典中的省市区信息
  enduserType: string;
  customerDirAddress: string;
  enduserAddress: string;
  enduserZipcode: string; //最终用户邮编
  enduserContact: string; //最终用户联系人
  enduserContactPhone: string; //最终用户联系电话
  philipsType: string;//e.g. 公立HTA
  philipsAuthList: any[] = []; //e.g.["HTAUS","LTAUS"]
  distributorAddress: string;
  distributorName: string;
  distributorId: string; //客户字典中的CustomerSysID
  distributorAgreementNos: string; //经销商协议号(多个)
  distributorContact: string; //经销商联系人
  distributorContactPhone: string; //经销商联系电话
  distributorEmail: string; //经销商邮箱
  distributorTaxId: string; //经销商税号
  purchaseDate: string;
  purchasePrice: string;
  deliveryAddress: string;
  expectdistributerotherfee: string; //预计经销商其他费用
  expectwinbidprice: string; //预计经销商利润?
  expectDealerMargin: string; //预计经销商利润
  expectwinbidbz: string; //经销商利润币种
  opportunityId: string; //CRM商机号
  crmEnduserName: string; //CRM最终用户名称
  buyerName: string; //合同买方名称
  buyerTaxId: string; //合同买方税号
  buyerAddress: string; //合同买方地址
  buyerContact: string; //合同买方联系人
  buyerContactPhone: string; //合同买方联系电话
  buyerEmail: string; //合同买方邮箱
  receiver: string; //收货人1
  receiverAlt: string; //收货人2
  receiveDate: string; //要求到货日期
  installDate: string; //预计安装日期
  finalPurchasePrice: string; //最终中标价格
  finalApplyPrice: string; //最终申请金额
  applyReason: string; //申请理由
  applyPrice: string; //预计申请金额
  biddingCompany: string; //招标公司全称
  commisionCompany: string;//佣金公司全称
  paymentType: string; //支付方式
  paymentTypeId: string; //支付方式id
  paymentTypeOthers: string; //其他支付方式
  otherSupportFiles: any[] = []; //其他支持文件
  sofon: string; //SOFON号
  oaAttachedFiles: any[] = []; //oa上传附件文件
  importAgreementFiles: any[] = []; //进口协议文件
  purchaseOrderFiles: any[] = []; //采购订单文件
  paymentProofFiles: any[] = []; //付款凭证文件
  exportVerificationFiles: any[] = []; //出口管制核查文件
  sofonPdfFiles: any[] = [];
  sofonWordFiles: any[] = [];
  otherFiles: any[] = []; //其他文件：格式为Outlook Item (.msg)
  soNumber: string; //SO号
  otherFeesName: any[] = ["", "", "", "", ""]; //财务填写的其他费用名称, 共五条
  otherFees: any[] = ["", "", "", "", ""]; //财务填写的其他费用, 共五条
  dealerMargin: string = ""; //实际经销商利润
  agreementNo: string; //协议号
  tradeTerm: string;//贸易术语
  usRate: string;//汇率
  oitDate: any; //预计安装日期
  contractNumber: string;//P2 added 合同号
  customerSapCode: string;//P2 added 合同买方 SAP ID
  enduserSapCode: string;//P2 added 最终用户 SAP ID
  distributorSapCode: string;//P2 added 经销商 SAP ID
  salesSapCode: string;//P2 added 销售 SAP ID
  tips: string;//P2 added
  importProtocolNumber: string;//P2 added 进口协议编号
  purchaseOrderNumber: string;//P2 added 采购订单编号
  isPrivate: number; //手选是否民营医院
  version: string;
  acceptTerm: any[]; //P2 added
  funnel: string; //d2c funnel id /商机编号
  distributorFax: string; //d2c 商机号
  buyerFax: string; //d2c 商机号
  remark: string; //P2 added 销售提交备注
  opportunityIdAlt: string; //P2 added 销售填写, OA可以改
  dmsOrderType: string; // 普通订单 库存订单
  inType: string;
  bgregion: string;
  orderRegion: string;
  sales: Sales;
  crossRegionEmailFiles: any[] = []; //跨区协议特批文件
  constructor() {
  }
}

export class Sales {
  code: string;
  name: string;
}
