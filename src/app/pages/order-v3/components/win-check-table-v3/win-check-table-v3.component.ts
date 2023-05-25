import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { environment } from '@env';

import {
  codeString,
  clearSpaces,
  NumberThousandth
} from '@core/util/tools';

@Component({
  selector: 'preOrder-WinCheckTable',
  templateUrl: './win-check-table-v3.component.html',
  styleUrls: ['./win-check-table-v3.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
  ],
})
export class WinCheckTableComponent implements OnInit {
  radioValue = '';
  style = {
    display: 'block',
    height: '30px',
    lineHeight: '30px'
  };
  @Output() myVerifi = new EventEmitter();
  @Input() dataBase: any;
  @Input() bidData: any;
  @Input() tableLoad: any = true;
  listOfData = [];
  ngOnChanges() {
    
      this.bidData.map(res => {
        res.searchResult.map(val => {
          const price = val.price != null && val.price != '' && val.price != '0.00' ?val.price: "N/A";
          const useStatus = val.useStatus == '1' ? '(已使用)' : "(未使用)";
          val.title = `${val.marketBundleName} ${val.number}台 中标价格: ${price} ${useStatus}`;
        })
      })
      
  }
  selectClick(index, i) {    
    let search = this.bidData[index].searchResult[i]; //当前选中search;
    let bidSelect = this.bidData[index].select;
    const selectId = search.id;
    let useState = search.useStatus; //中标产品是否使用   
    let checkArr = []; //用于验证的数组
    this.bidData.map(res => {
      res.isCheak && checkArr.push(res);
    });

    //表明当前选中
    if (!search.temUser) //选项为真的时候
    {
      this.bidData[index].searchResult.map(res => {
        res.temUser = false;
      })
      search.temUser = true;
    }
    else {
      search.temUser = !search.temUser //取消此进单还是选此进单
    }
    //筛选出所有已选中的id
    let selectIdArr = [];
    this.bidData.map(res => {
      res.searchResult.map(val => {
        val.temUser == true && selectIdArr.push(val.id);
      })
    })
    this.bidData.map(res => {
      res.select == selectId && (res.select = "");
      res.searchResult.map(val => {
        let select = selectIdArr.some((vals) => vals == val.id);//取出已被选取的项

        val.isDisable = select || val.useStatus == '1' ? true : false;

      })
    })
    this.bidData[index].select = bidSelect;

    if (search.temUser) {
      let oppResult = false; //oppid
      let market = false;   //market
      let hospitat = false; //客户id
      let person = false; //申请人
      let tenderingCompanyFlag = false; //投标公司
      let tenderNoFlag = false; //招标编号
      let distributorFlag = false; //经销商
      let numberResult=false; //台数 
      let orderRsult: any = false;
      let checkResultReasons = []; //失败原因      
      const opportunityId = this.bidData[index].opportunityId; //进单opportunityId18位
      let opportunityIdOrder
      if(opportunityId.length>=18)
      {
        opportunityIdOrder=opportunityId.slice(0,15);
      }
      
      const opportunityIdNow = search.opportunityId;
      const makertBundleName = this.bidData[index].marketBundleName;
      const makertBundleNameNow = search.marketBundleName;
      const orderByCustomerName = this.bidData[index].orderByCustomerName //进单客户名称
      const hospitalName = search.hospitalName; //中标客户名称;
      const bidApplicant = search.bidApplicant; //中标申请人
      this.bidData[index].agreementAgenName = search.agreementAgenName //中标经销商名称
      this.bidData[index].winningByCustomerName = search.hospitalName; //中标客户名称
      this.bidData[index].winPerson = search.bidApplicant;//中标申请人
      this.bidData[index].biddingName = search.biddingName; //中标投标公司
      this.bidData[index].biddingNo = search.biddingNo; //中标招标编号 
      this.bidData[index].biddingAwardPrice=search.biddingAwardPrice; //中标价格
      this.bidData[index].biddingAwardCurrency=search.biddingAwardCurrency; //中标币制

      const orderByCustomerNameid = this.bidData[index].orderByApplicant//进单客户id
      const appPerson = this.bidData[index].appPerson//进单申请人
      const tenderingCompany = clearSpaces(this.bidData[index].tenderingCompany); //进单投标公司
      const biddingName = search.biddingName ? clearSpaces(search.biddingName) : ""; //中标投标公司
      const tenderNo = clearSpaces(this.bidData[index].tenderNo); //进单招标编号
      const biddingNo = clearSpaces(search.biddingNo); //中标招标编号
      const distributor = this.bidData[index].distributor; //进单经销商
      const agreementAgenName = search.agreementAgenName; //中标经销商
      const orderNumber=this.bidData[index].number//进单台数
      const bidddingNumber=search.number//进单台数
     
      numberResult=orderNumber==bidddingNumber?true:false;
      oppResult = (opportunityId == opportunityIdNow)||(opportunityIdOrder==opportunityIdNow) ? true : false;
      market = makertBundleName == makertBundleName ? true : false;
      hospitat = (orderByCustomerNameid == search.accountId) || (hospitalName.replace(/\s+/g, "") == orderByCustomerName.replace(/\s+/g, "")) ? true : false;
      person = bidApplicant == appPerson ? true : false;
      tenderingCompanyFlag = tenderingCompany == biddingName ? true : false;
      tenderNoFlag = tenderNo == biddingNo ? true : false;
      distributorFlag = distributor == agreementAgenName ? true : false;
      //orderRsult=this.dataBase.businessModel=='DISTRIBUTOR'?(oppResult && market && hospitat && person&&distributorFlag&&tenderingCompanyFlag&&tenderNoFlag&&(useState == "0")):(oppResult && market && hospitat && person&&tenderingCompanyFlag&&tenderNoFlag&&(useState == "0"))
      if (this.dataBase.businessModel == 'DISTRIBUTOR') {
        if (this.dataBase.centralized == '1') {
          orderRsult = (oppResult && market && distributorFlag && tenderingCompanyFlag && tenderNoFlag && (useState == "0")&&numberResult)

        }
        else {
          orderRsult = (oppResult && market && hospitat && person && distributorFlag && tenderingCompanyFlag && tenderNoFlag && (useState == "0")&&numberResult)
        }
      }
      else {
        if (this.dataBase.centralized == '1') {
          orderRsult = (oppResult && market && tenderingCompanyFlag && tenderNoFlag && (useState == "0")&&numberResult)
        }
        else {
          orderRsult = (oppResult && market && hospitat && person && tenderingCompanyFlag && tenderNoFlag && (useState == "0")&&numberResult)
        }
      }
      
      if (orderRsult) {
        this.bidData[index].checkResult = true;     
        this.bidData[index].biddingMarketBundleId = this.bidData[index].searchResult[i].id; //把选中的id赋值给biddingMarketBundleId
        this.bidData[index].checkResultReasons = [];
        let check = checkArr.every(x => x.checkResult)  //验证是否全部通过
        if (check) {         
          
          this.myVerifi.emit(false);
        }
      }
      else {
        this.bidData[index].checkResult = false;
        this.myVerifi.emit(true);
      }
      if (useState == "1") {
        checkResultReasons.push("中标产品已经使用");
      }
      if(!numberResult)
      {
        checkResultReasons.push("台数不匹配"); 
      }
      if (!oppResult) {

        checkResultReasons.push("opportunityId不匹配");
      }
      if (!market) {

        checkResultReasons.push("makertBundleName不匹配");
      }
      if (this.dataBase.centralized == '0' && !hospitat ) {

        checkResultReasons.push("进单客户与投标客户不匹配");
      }
      if (this.dataBase.centralized == '0') {
        if (!person) {
          checkResultReasons.push("进单申请人与投标人不匹配");
        }
      }
      if (!tenderingCompanyFlag) {

        checkResultReasons.push("进单投标公司与中标投标公司不匹配");
      }
      if (!tenderNoFlag) {
        checkResultReasons.push("进单招标编号与中标招标编号不匹配");
      }
      if (this.dataBase.businessModel == 'DISTRIBUTOR') {
        if (!distributorFlag) {
          // this.bidData[index].checkResultReasons = "进单经销商名称与中标经销商名称不匹配"
          // return
          checkResultReasons.push("进单经销商名称与中标经销商名称不匹配");
        }
      }
      this.bidData[index].checkResultReasons = checkResultReasons;
    }
    else {
      this.bidData[index].checkResultReasons = [];
      this.bidData[index].checkResult = "";
      this.bidData[index].select = "";
    }

  }
  modelChang() {
    // console.log(this.bidData)
  }
  ngOnInit(): void {

  }
  public gotoWin(item) {
    const url=`${location.origin}${environment.base_href}/#/bidding-v3/${item.applyId}?procInstId=${item.biddingProcInstId}&processStatus=ecos_bid_done&taskStatus=ecos_bid_done`
    window.open(url);
  }

}
