
import {Injectable, EventEmitter, OnInit} from "@angular/core";
import { HttpService } from './http.service';
  @Injectable({
    providedIn: 'root'
  })
  
  export class QuotationCalcService implements OnInit {

  
    totalNameMap: any = {
      'T1': 'Total PMG Price',
      'T2': '标准折扣后价格',
      'T3': '经销商阶梯价',
      'T4': '促销后价格',
      'T5': '特价后价格',
      'T6': '无折扣价格',
      'T7': '设备总价',
      'T8': '合同总价',
      'T9': '原始价格',
      'T10': '特价申请',
      'T11': {
        'rmb': '特价申请（net）RMB',
        'usd': '特价申请（net）USD'
      },
      'T12': '折扣率',
      'T13': '合同净价',
      'T14': 'IGM'
    };

    constructor(private http: HttpService) {
    }
  
    ngOnInit() {
    }

    getResFromAmountSum(params: any) {

      const currencyType = params['currencyType'];
      const qdetail: any = params['qdetail'];
      const rows: any[] = qdetail['rows'] || [];
      const qlabRows: any[] = qdetail['qlabRows'] || [];
      const percunavRows: any[] = qdetail['percunavRows'] || [];
      const discountRows: any[] = qdetail['discountRows'] || [];
      const ladderpriceRows: any[] = qdetail['ladderpriceRows'] || [];
      const promotionRows: any[] = qdetail['promotionRows'] || [];
      const specialRows: any[] = qdetail['specialRows'] || [];
      const shippingCostRows: any[] = qdetail['shippingCostRows'] || [];
      const installationfeeRows: any[] = qdetail['installationfeeRows'] || [];
      const otherfeeRows: any[] = qdetail['otherfeeRows'] || [];
      /*保修费相关 start */
      const maintenanceParams: any = {
        maintenanceVer: qdetail['maintenanceVer'],
        maintenanceSum: qdetail['maintenanceSum'],
        maintenanceList: qdetail['maintenanceRows'] || []
      };
      /*保修费相关 end */
      /*培训费相关 start */
      const trainingcostParams: any = {
        currencyType: currencyType,
        trainingcostVer: qdetail['trainingcostVer'] || '2',
        trainingcostList: qdetail['trainingcostRows'] || [],
        otherTrainingList: qdetail['otherTrainingRows'] || [],
        newTrainingcostOnsite: qdetail['newTrainingcostOnsite'] || [],
        newTrainingcostGroup: qdetail['newTrainingcostGroup'] || [],
        newTrainingcostOtherSum: qdetail['newTrainingcostOtherSum'] || [],
      };
      /*培训费相关 end */

      let calcParams = {
        'currency': '',//币种
        'quotations': [],//
        'qlabs': [],//
        'percunavs': [],//
        'discount': '0',//折扣率
        'distributorprice': '1',//经销商阶梯
        'promotions': [],//优惠活动
        'specialamount': '0',//特价金额
        'trainingfee': '0',//培训费
        'guaranteefee': '0',//保修费
        'expressfee': '0',//运费
        'installfee': '0',//安装费
        'otherfees': []//其他费用
      };

      calcParams['currency'] = currencyType == 'usd' ? 'usd' : 'rmb';
      calcParams['quotations'] = this.formatQuotations(rows);
      calcParams['qlabs'] = this.formatQlabs(qlabRows);
      calcParams['percunavs'] = this.formatPercunavs(percunavRows);
      calcParams['discount'] = this.formatDiscount(discountRows);
      calcParams['distributorprice'] = this.formatDistributorprice(ladderpriceRows);
      calcParams['promotions'] = this.formatPromotions(promotionRows);
      calcParams['specialamount'] = this.formatSpecialamount(currencyType, specialRows);
      calcParams['guaranteefee'] = this.formatGuaranteefee(maintenanceParams);
      calcParams['expressfee'] = this.formatExpressfee(shippingCostRows);
      calcParams['installfee'] = this.formatInstallfee(currencyType, installationfeeRows);
      calcParams['otherfees'] = this.formatOtherfee(currencyType, otherfeeRows);
      calcParams['trainingfee'] = this.formatTrainingfee(trainingcostParams);
      if(params['unitTotalPrice'] && params['rawUnitTotalPrice']) {
        calcParams['currentUnitTotalPrice'] = params['unitTotalPrice'].toString().replace(/[^0-9.-]/g, '');
      }
      // console.log('updateTotal----->', calcParams);

      return this.http.post('/act/calculate/amountSum', calcParams);
    }

    // 前台数据处理
    // quotation数据
    formatQuotations(rows: any[]) {
      let result = [];

      for (let i = 0; i < rows.length; i++) {
        let item = rows[i];
        let newItem = {};
        let qty = item['_qty'] == null ? '' : item['_qty'];
        let pn = item['PN'] == null ? '' : item['PN'];
        let cny = item['CNY'] == null ? '' : item['CNY'];
        let usd = item['USD'] == null ? '' : item['USD'];
        newItem['pn'] = pn;
        newItem['cny'] = cny;
        newItem['usd'] = usd;
        newItem['qty'] = qty;
        result.push(newItem);
      }

      console.log('formatQuotations', result);
      return result;
    }

    // qlabs参数处理
    formatQlabs(qlabList: any[]) {
      let result = [];
      for (let i = 0; i < qlabList.length; i++) {
        let item = qlabList[i];
        item['qty'] = item['counts'];
      }
      result = qlabList;
      return result;
    }

    // percunavs参数处理
    formatPercunavs(percunavList: any[]) {
      let result = [];
      for (let i = 0; i < percunavList.length; i++) {
        let item = percunavList[i];
        item['qty'] = item['counts'];
        item['usd_dealer_price'] = item['usd_list_price'];
        item['rmb_dealer_price'] = item['rmb_list_price'];
      }
      result = percunavList;
      return result;
    }

    // discount参数处理
    formatDiscount(discountList: any[]) {
      let result = '0';
      if (discountList.length > 0) {
        result = discountList[0]['discount'];
      }
      return result == null ? '0' : result;
    }

    // distributorprice参数处理
    formatDistributorprice(ladderpriceList: any[]) {
      let result = '1';
      if (ladderpriceList.length > 0) {
        result = ladderpriceList[0]['percent'];
      }
      return result == null ? '1' : result;
    }

    // promotions参数处理
    formatPromotions(promotionList: any[]) {
      let result = [];
      for (let i = 0; i < promotionList.length; i++) {
        let item = promotionList[i];
        item['qty'] = item['counts'];
      }
      result = promotionList;
      return result;
    }

    // specialamount参数处理
    formatSpecialamount(currencyType, specialList: any[]) {
      let result = '0';
      let sKey = currencyType == 'usd' ? 'usd' : 'rmb';
      if (specialList.length > 0) {
        result = specialList[0][sKey];
      }
      return result == null ? '0' : result == '' ? '0' : result;
    }

    // trainingfee参数处理
    formatTrainingfee({ currencyType, trainingcostVer, 
      trainingcostList, otherTrainingList, newTrainingcostOnsite,
      newTrainingcostGroup, newTrainingcostOtherSum}) {
      let result = 0;
      //开始计算一般培训费
      let sKey = currencyType == 'usd' ? 'usd' : 'rmb';
      if (!trainingcostVer || '' === trainingcostVer) { //老版培训费
        if (trainingcostList && trainingcostList.length > 0) {
          const sample = trainingcostList[0];
          let gruopfee = sample['gt_' + sKey];
          let onsitefee = sample['os_' + sKey];

          if (gruopfee && !Number.isNaN(Number(gruopfee))) {
            result = result + Number(gruopfee);
          }
          if (onsitefee && !Number.isNaN(Number(onsitefee))) {
            result = result + Number(onsitefee);
          }
        }

        //开始计算其他培训费
        for (let i = 0; i < otherTrainingList.length; i++) {
          const sample = otherTrainingList[i];
          let othergroupfee = Number(sample['gt_' + sKey + '_total']);
          let otheronsitefee = Number(sample['os_' + sKey + '_total']);

          if (othergroupfee && !Number.isNaN(Number(othergroupfee))) {
            result = result + Number(othergroupfee);
          }
          if (otheronsitefee && !Number.isNaN(Number(otheronsitefee))) {
            result = result + Number(otheronsitefee);
          }
        }
      } else if ('2' === trainingcostVer) { //新版培训费
        result += newTrainingcostOnsite['total'] ? (Number(newTrainingcostOnsite['total']) || 0) : 0; //现场培训总金额
        result += newTrainingcostGroup['total'] ? (Number(newTrainingcostGroup['total']) || 0) : 0; //课程培训总金额
        result += newTrainingcostOtherSum['total'] ? (Number(newTrainingcostOtherSum['total']) || 0) : 0; //其他培训总金额
      }
      return result.toString();
    }

    //guaranteefee参数处理
    formatGuaranteefee({ maintenanceVer, maintenanceList, maintenanceSum}) {
      let result = 0;
      if (!maintenanceVer || '' === maintenanceVer) { //老版保修费
        for (let i = 0; i < maintenanceList.length; i++) {
          let item = maintenanceList[i];
          if (item['total'] && !Number.isNaN(Number(item['total']))) {
            result = result + Number(item['total']);
          }
        }
      } else if ('2' === maintenanceVer) { //新版保修费
        result = maintenanceSum.total || 0;
      }
      return result.toString();
    }

    //送货费参数处理
    formatExpressfee(shippingCostList: any[]) {
      let result = '0';
      if (shippingCostList.length > 0) {
        result = shippingCostList[0]['cost'];
      }
      return result;
    }

    //installfee参数处理
    formatInstallfee(currencyType, installationfeeList: any[]) {
      let result = '0';
      let iKey = currencyType == 'usd' ? 'usd' : 'rmb';
      if (installationfeeList.length > 0) {
        result = installationfeeList[0][iKey];
      }
      return result == null ? '0' : result == '' ? '0' : result;
    }

    // otherFee参数处理
    formatOtherfee(currencyType, otherfeeList: any[]) {
      let result = [];
      let iKey = currencyType == 'usd' ? 'usd' : 'rmb';

      for (const item of otherfeeList) {
        if (item['ifCustom'] && '1' === item['ifCustom']) {
          let amount = Number(item[iKey]) || 0;
          let newItem = {
            name: item['name'] || '',
            amount: amount
          }
          result.push(newItem);
        }
      }
      return result;
    }

    generateTotalList(dataFromBackend: any): any[] {
      
      let list: any[] = [];
      if(!this.isObjEmpty(dataFromBackend)) {
        const data = dataFromBackend == null ? [] : dataFromBackend;
        const currency = data['currency'];
        const prefix = currency == 'usd' ? '$ ' : '￥ ';
        for (let i = 1; i <= 14; i++) {
          let tKey = 'T' + i;
          if (i < 11) {
            list.push({
              'total_code': tKey,
              'total': this.totalNameMap[tKey],
              'money': prefix + data[tKey]
            });
          } else if (i == 11) {
            list.push({
              'total_code': tKey,
              'total': this.totalNameMap[tKey][currency],
              'money': prefix + data[tKey]
            });
          } else if (i == 12) { //折扣率
            list.push({
              'total_code': tKey,
              'total': this.totalNameMap[tKey],
              'money': data[tKey]
            });
          } else if (i > 12 && i < 14) {
            list.push({
              'total_code': tKey,
              'total': this.totalNameMap[tKey],
              'money': prefix + data[tKey]
            });
          } else if (i == 14) { //因为改变总价时只是sales，所以不考虑igm被调整的情况
            list.push({
              'total_code': tKey,
              'total': this.totalNameMap[tKey],
              'money': data[tKey]
            });
          }
        }

        if(data['T70']){ //存在T70则说明价格被sales调整过
        list.push({
          'total_code': 'T70',
          // 'total': this.totalNameMap[tKey],
          'total': '原始设备总价',
          'money': prefix + data['T70']
        });
        }
      }
      return list;
    }

    isObjEmpty(obj) {
      return Object.keys(obj).length === 0 && obj.constructor === Object;
    }

  }