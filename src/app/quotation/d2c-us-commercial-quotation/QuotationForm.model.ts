import {QuotationBaseInfoModel} from './QuotationBaseInfo.model';

export class QuotationFormModel{
  quotationList: any[];
  wbsList: any;
  quotationBaseInfo: QuotationBaseInfoModel;
  totalAllList: any[];

  constructor(){
    this.quotationList = [];
    this.totalAllList = [];
    this.wbsList = {};
    this.quotationBaseInfo = new QuotationBaseInfoModel();
  }

}
