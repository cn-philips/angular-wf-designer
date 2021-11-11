export class QutationDetail {
  //Qutation Title
  title: string;
  currencyType: string;
  hospitalType: string;
  subTypeId: string;
  clinical: string;
  _6nc: string;
  vendorIds: string;
  //Qlab
  qlabList: [];
  percunavList: [];
  discountList: [];
  promotionList: [];
  vendorprocuctsList: [];
  //培训费
  trainingcostList: [];
  //特价
  specialList: [];
  shippingCostList: [];
  //其它费用
  otherfeeList: [];
  //阶梯价
  ladderpriceList: [];
  //安装费
  installationfeeList: [];
  // 保修费
  maintenanceList: [];

  totalRows: [];
}

class Title {
  key: string;
  display: string;
  template: string;

  constructor(key: string, display: string, template?: string) {
    this.key = key;
    this.display = display;
    this.template = template;
  }
}


class Qlab {
  qlabList: [];
  qlabTitles: Title[];

  constructor() {
    this.qlabTitles = [
      new Title('qlab_10_option', 'System Option'),
      new Title('qlab_10_option_chinese', '系统选项'),
      new Title('rmb_list_price', '人民币'),
      new Title('usd_list_price', '美元'),
      new Title('article_number', '产品号')
    ];


  }
}
