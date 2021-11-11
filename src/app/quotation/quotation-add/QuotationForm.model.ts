import {QuotationBaseInfoModel} from './QuotationBaseInfo.model';

export class QuotationFormModel{
  quotationList: any[];
  quotationBaseInfo: QuotationBaseInfoModel;
  totalAllList: any[];

  constructor(){
    this.quotationList = [];
    this.totalAllList = [];
    this.quotationBaseInfo = new QuotationBaseInfoModel();
  }

}
