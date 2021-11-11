import { Injectable } from '@angular/core';
import { FileService } from './file.service';
import { HttpService } from './http.service';
import {NumeralPipe} from 'ngx-numeral';
import { saveAs } from 'file-saver';
import { Observable } from 'rxjs';

const EXCEL_EXTENSION = '.xlsx'
@Injectable({
  providedIn: 'root'
})
export class PdfmakeService {

  constructor(private http: HttpService, private fileService: FileService) {
  }

  getSimplePdf(qdetail: any): Observable<any> {
    let param = this.formatPrimaryPdfRawData(qdetail);
    const uri = '/act/simplePdfMaker/getSimplePdf';
    console.log('param', param);
    return this.http.post(uri, param);
    // this.http.post(uri, param).subscribe(res=> {
    //   if (res.code === '0000') {
    //     let arr = this.fileService.base64ToArrayBuffer(res.data);
    //     let blob = new Blob([arr]);
    //     saveAs(blob, 'asdasd.pdf');
    //   }
    // });

  }

  getSimpleXlsx(row: any, baseInfo: any, special: boolean = false) {
    if(!row.qdetail) {
      return;
    }
    let param = this.formatPrimaryPdfRawData(row.qdetail, 'all');

    if(baseInfo) {
      this.setExtraData(param, baseInfo);
      this.setPriceSumTable(param, row.qdetail, baseInfo, special);
    }
    // return;
    const uri = '/act/simpleXlsxMaker/getSimpleXlsx';
    console.log('param', param);
    const additionalFileName = row['quotation'] ? (row['quotation'] + '_') : '';
    const pubStr = row['pub'] === '1' ? '公立' : (row['pub'] === '0' ?  '民营' : '其他');
    // return this.http.post(uri, param);
    this.http.post(uri, param).subscribe(res=> {
      if (res.code === '0000') {
        let arr = this.fileService.base64ToArrayBuffer(res.data);
        let blob = new Blob([arr]);
        saveAs(blob, '产品报价单' + '_' + additionalFileName + pubStr + '_' + new Date().getTime() + EXCEL_EXTENSION);
      }
    });
  }

  formatPrimaryPdfRawData(qdetail: any, opt?: string): any {
    // console.log('qdetail', qdetail);
    let result = {};
    if(qdetail) {
      const primaryRaw = qdetail['rows'];
      const qlabRows = qdetail['qlabRows'];
      const percunavRows = qdetail['percunavRows'];
      const maintenanceRows = qdetail['maintenanceRows'];
      const installationfeeRows = qdetail['installationfeeRows'];
      const trainingcostVer = qdetail['trainingcostVer'] || '0';

      result['title'] = qdetail['qTitle'] || '';
      result['comments'] = qdetail['qComments'] || '';
      let primaryRows = [];
      if(!opt) {
        primaryRows = primaryRaw.filter(item => {
          return item['_qty'] && '' !== item['_qty'] && 0 != item['_qty']
        });
      } else if ('all' === opt) { // 当all时，主配置展示所有的配置项（除了描述行）
        primaryRows = primaryRaw;
      }

      result['primary'] = primaryRows;
      result['qlab'] = qlabRows;
      result['percunav'] = percunavRows;
      result['maintenance'] = maintenanceRows;
      result['installation'] = installationfeeRows;
      /**培训费 start */
      result['trainingcostVer'] = trainingcostVer;
      if('2' === trainingcostVer) {
        result['trainingOnsite'] = qdetail['newTrainingcostOnsite'] || {};
        result['trainingGroupMust'] = qdetail['newTrainingcostGroup'] || {};
        result['trainingGroupOpt'] = qdetail['newTrainingcostGroupOpt'] || [];
        result['trainingOther'] = qdetail['newTrainingcostOther'] || [];
      }
      /**培训费 end */
    }
    return result;
  }

  setExtraData(param: any, baseInfo: any) {
    param['customerName'] = baseInfo['crmEnduserName'] || (baseInfo['enduserName'] || ' ');
    param['distributorName'] = baseInfo['distributorName'] || ' ';
    param['purchaseTypeCode'] = baseInfo['purchaseTypeCode'] || '0';
    param['version'] = baseInfo['version'] || '0';
  }

  //setPriceSumTable
  setPriceSumTable(param: any, qdetail: any, baseInfo: any, special:boolean) {
    const totalList = qdetail['totalRows'] || [];
    const discountList = qdetail['discountRows'] || [];
    const ladderpriceList = qdetail['ladderpriceRows'] || [];
    const promotionList = qdetail['promotionRows'] || [];
    const specialList = qdetail['specialRows'] || [];
    const trainingcostVer = qdetail['trainingcostVer'];
    const trainingcostList = qdetail['trainingcostRows'] || [];
    const newTrainingcostOnsite = qdetail['newTrainingcostOnsite'] || [];
    const newTrainingcostGroup = qdetail['newTrainingcostGroup'] || [];
    const otherTrainingList = qdetail['otherTrainingRows'] || [];
    const newTrainingcostOtherSum = qdetail['newTrainingcostOtherSum'] || [];
    const maintenanceVer = qdetail['maintenanceVer'];
    const maintenanceSum = qdetail['maintenanceSum'];
    const maintenanceList = qdetail['maintenanceRows'];
    const shippingCostList = qdetail['shippingCostRows'] || [];
    const installationfeeList = qdetail['installationfeeRows'] || [];
    const otherfeeList = qdetail['otherfeeRows'] || [];
    let currencyType = 'usd';
    let prefix = '$'; 
    if (baseInfo && baseInfo['currencyType'] && baseInfo['currencyType'] === '2') {
      prefix = '￥';
      currencyType = 'rmb';
    }
    if(totalList.length < 1) {
      console.log('totalList.length < 1 !');
      return;
    }
    getTotalListCommercial(param, special);


    function getSingleTotalMoney(totalCode, totalList) {
      let result = '';
      if (totalList && totalList.length > 0) {
        for (let item of totalList) {
          if (item['total_code'] == totalCode) {
            result = item['money'].toString().replace(/[^0-9.-]/g, '');
            break;
          }
        }
      }
      return result;
    }


    function getTotalListCommercial(param: any, special:boolean) {

      let totalListCommercial = [];
      let preprefix = '';

      // row 1 标准折扣价
      let row1Detail = discountList.length > 0 ? (discountList[0]['discount'] ? discountList[0]['discount'] : '') : '';
      if (row1Detail && '' != row1Detail) {
        let row1Numeral = new NumeralPipe(row1Detail);
        row1Detail = row1Numeral.format('0.00%');
      }

      let row1 = {
        name: '标准折扣价',
        detail: row1Detail,
        money: getSingleTotalMoney('T2', totalList),
        prefix: prefix + ' '
      };
      totalListCommercial.push(row1);
      

      // row 2 经销商阶梯价
      let row2Detail = ladderpriceList.length > 0 ? (ladderpriceList[0]['type'] ? ladderpriceList[0]['type'] : '') : '';
      if (row2Detail && '' != row2Detail) {
        // let row2Numeral = new NumeralPipe(row2Detail);
        // row2Detail = row2Numeral.format('0.00%');
      } else {
        row2Detail = '无';
      }
      let row2 = {
        name: '经销商阶梯价',
        detail: row2Detail,
        money: getSingleTotalMoney('T3', totalList),
        prefix: prefix + ' '
      };
      totalListCommercial.push(row2);

      //row 3 促销折扣
      let moneyKey = currencyType; //rmb or usd
      promotionList.forEach((item, index) => {
        let row = {};
        if (index == 0) {
          row = {
            name: '促销折扣',
            detail: item['Promotion_name'] ? item['Promotion_name'] : '',
            money: item[moneyKey],
            prefix: '-' + prefix + ' '
          };
        } else {
          row = {
            name: '促销折扣' + (index + 1),
            detail: item['Promotion_name'] ? item['Promotion_name'] : '',
            money: item[moneyKey],
            prefix: '-' + prefix + ' '
          };
        }

        totalListCommercial.push(row);
      });

      // row 4 特价折扣
      moneyKey = currencyType; //rmb or usd
      let row4 = {
        name: '特价折扣',
        detail: '',
        money: specialList.length > 0 ? (specialList[0][moneyKey] ? specialList[0][moneyKey] : '0') : '0',
        prefix: '-' + prefix + ' '
      };
      totalListCommercial.push(row4);

      // row 5 设备净价  == 特价后价格
      let row5 = {
        name: '设备净价',
        detail: '',
        money: getSingleTotalMoney('T5', totalList),
        prefix: prefix + ' '
      };
      totalListCommercial.push(row5);

      // row 6 无折扣项目 培训费
      let row6 = {
        name: '无折扣项目',
        detail: '培训费',
        money: 0,
        prefix: prefix + ' '
      };
      let gtKey = 'gt_' + currencyType;
      let osKey = 'os_' + currencyType;
      if (!trainingcostVer || '' === trainingcostVer) { //老版培训费
        if (trainingcostList.length > 0) {
          const item = trainingcostList[0];
          let osMoney = Number(item[osKey]) || 0;
          let gtMoney = Number(item[gtKey]) || 0;
          let totalTrainingMoney = osMoney + gtMoney;
          if (0 != totalTrainingMoney) {
            row6 = {
              name: '无折扣项目',
              detail: '培训费',
              money: totalTrainingMoney,
              prefix: prefix + ' '
            };
          }
        }
      } else if ('2' === trainingcostVer) {// 新版培训费
        let totalTrainingMoney = 0;
        preprefix = '';
        totalTrainingMoney += newTrainingcostOnsite['total'] ? (Number(newTrainingcostOnsite['total']) || 0) : 0; //现场培训总金额
        totalTrainingMoney += newTrainingcostGroup['total'] ? (Number(newTrainingcostGroup['total']) || 0) : 0; //课程培训总金额
        if (totalTrainingMoney < 0) {
          preprefix = '-'
          totalTrainingMoney = Math.abs(totalTrainingMoney);
        }
        if (0 != totalTrainingMoney) {
          row6 = {
            name: '无折扣项目',
            detail: '培训费',
            money: totalTrainingMoney,
            prefix: preprefix + prefix + ' '
          };
        }
      }
      totalListCommercial.push(row6);

      // row 7 无折扣项目 其他培训费
      let row7 = {
        name: '',
        detail: '其他培训费',
        money: 0,
        prefix: prefix + ' '
      };
      gtKey = 'gt_' + currencyType + '_total';
      osKey = 'os_' + currencyType + '_total';
      let row7Money = 0;
      preprefix = '';
      if (!trainingcostVer || '' === trainingcostVer) { //老版培训费
        for (let item of otherTrainingList) {
          let osMoney = Number(item[osKey]) || 0;
          let gtMoney = Number(item[gtKey]) || 0;
          row7Money = row7Money + osMoney + gtMoney;
        }
      } else if ('2' === trainingcostVer) { //新版培训费
        row7Money = newTrainingcostOtherSum['total'] ? (Number(newTrainingcostOtherSum['total']) || 0) : 0; //其他培训总金额
        if (row7Money < 0) {
          preprefix = '-';
          row7Money = Math.abs(row7Money);
        }
      }
      if (0 != row7Money) {
        row7 = {
          name: '',
          detail: '其他培训费',
          money: row7Money,
          prefix: preprefix + prefix + ' '
        };
      }
      totalListCommercial.push(row7);

      // row 8 无折扣项目 保修费
      let row8 = {
        name: '',
        detail: '保修费',
        money: 0,
        prefix: prefix + ' '
      };

      let row8Money = 0;
      preprefix = '';
      if (!maintenanceVer || '' === maintenanceVer) { //老版保修费
        for (let item of maintenanceList) {
          let total = Number(item['total']) || 0;
          row8Money = row8Money + total;
        }
      } else if ('2' === maintenanceVer) { //新版保修费
        row8Money = maintenanceSum['total'] || 0;
        if (row8Money < 0) {
          preprefix = '-';
          row8Money = Math.abs(row8Money);
        }
      }
      if (0 != row8Money) {
        row8 = {
          name: '',
          detail: '保修费',
          money: row8Money,
          prefix: preprefix + prefix + ' '
        };
      }
      totalListCommercial.push(row8);

      // row 9 无折扣项目 运费
      let row9 = {
        name: '',
        detail: '运费',
        money: 0,
        prefix: prefix + ' '
      };

      let row9Money = 0;
      preprefix = '';
      for (let item of shippingCostList) {
        let cost = Number(item['cost']) || 0;
        row9Money = row9Money + cost;
      }
      if (0 != row9Money) {
        if(row9Money < 0) {
          preprefix = '-';
          row9Money = Math.abs(row9Money);
        }
        row9 = {
          name: '',
          detail: '运费',
          money: row9Money,
          prefix: preprefix + prefix + ' '
        };
      }
      totalListCommercial.push(row9);

      // row 10 无折扣项目 运费
      moneyKey = currencyType; //rmb or usd
      let row10 = {
        name: '',
        detail: '预留安装费',
        money: 0,
        prefix: prefix + ' '
      };

      let row10Money = 0;
      preprefix = '';
      for (let item of installationfeeList) {
        let money = Number(item[moneyKey]) || 0;
        row10Money = row10Money + money;
      }
      if (0 != row10Money) {
        if(row10Money < 0) {
          preprefix = '-';
          row10Money = Math.abs(row10Money);
        }
        row10 = {
          name: '',
          detail: '预留安装费',
          money: row10Money,
          prefix: preprefix + prefix + ' '
        };
      }
      totalListCommercial.push(row10);

      //row otherfee 其他费用
      moneyKey = currencyType; ///rmb or usd/
      let rowOther = {
        name: "其他费用",
        detail: "无",
        money: 0,
        prefix: prefix + ' '
      };

      if (otherfeeList.length > 0) {
        otherfeeList.forEach((item, idx) => {
          let detail = item['name'];
          if (item['ifCustom'] && '1' == item['ifCustom']) {
          } else {
            detail += ' （不计入总价）';
          }

          let fixedMoney = Number(item[moneyKey]) || 0;
          preprefix = '';
          if (0 > fixedMoney) {
            preprefix = '-';
            fixedMoney = Math.abs(fixedMoney);
          }

          if (0 == idx) {
            totalListCommercial.push({
              name: '其他费用',
              detail: detail,
              money: fixedMoney,
              prefix: preprefix + prefix + ' '
            });
          } else {
            totalListCommercial.push({
              name: '',
              detail: detail,
              money: fixedMoney,
              prefix: preprefix + prefix + ' '
            });
          }
        });
      } else {
        totalListCommercial.push(rowOther);
      }

      // row 11 设备总价
      let row11 = {
        name: '设备总价',
        detail: '',
        money: getSingleTotalMoney('T7', totalList),
        prefix: prefix + ' '
      };
      totalListCommercial.push(row11);


      //row 12 原igm
      // if (this.orderType === '1') {
      //   let row12 = {
      //     name: '原IGM',
      //     detail: '',
      //     money: this.oldIGM,
      //     prefix: ''
      //   };
      //   this.totalListCommercial.push(row12);
      // }

      //row 13 IGM
      // let row13 = {
      //   name: 'IGM',
      //   detail: '',
      //   money: this.getSingleTotalMoney('T14'),
      //   prefix: ''
      // };
      // this.totalListCommercial.push(row13);
      // console.log('totalListCommercial', totalListCommercial); return;
      param['totalTableList'] = totalListCommercial;
      if(special) {
        let totalListSpecial = [];
        if (totalListCommercial.length < 1) {
          console.log('totalListCommercial < -1 ');
          return;
        }

        //特价申请 net
        totalListSpecial.push({
          name: '特价申请（net）',
          detial: '',
          money: getSingleTotalMoney('T11', totalList),
          prefix: prefix + ' '
        });

        //折扣率
        totalListSpecial.push({
          name: '折扣率',
          detial: '',
          money: getSingleTotalMoney('T12', totalList),
          prefix: ''
        });

        //原始价格
        totalListSpecial.push({
          name: '原始价格',
          detial: '',
          money: getSingleTotalMoney('T9', totalList),
          prefix: prefix + ' '
        });

        totalListSpecial = [...totalListSpecial, ...totalListCommercial];
        param['totalTableList'] = totalListSpecial;
      }
    }
  }
}
