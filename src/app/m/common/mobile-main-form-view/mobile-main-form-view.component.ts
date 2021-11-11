import { Component, OnInit, Input } from '@angular/core';
import { ResultComponent } from 'ng-zorro-antd-mobile';
import { ignoreElements } from 'rxjs/operators';
import { HttpService, FileService, PdfmakeService } from '../../../services';
import { HttpParameterCodec } from '@angular/common/http';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { QutationDetail } from '../../../quotation/quotation-main/QutationDetail';

@Component({
  selector: 'app-mobile-main-form-view',
  templateUrl: './mobile-main-form-view.component.html',
  styleUrls: ['./mobile-main-form-view.component.scss']
})


export class MobileMainFormViewComponent implements OnInit {

  processTypeMap = {
    '0': '特价-备案',
    '1': '特价',
    '2': '进单',
  };

  processStatusMap = {
    '0':'进行中',
    '1':'已完成'
  };

  @Input()
  taskData: any;

  @Input()
  processType: string; //'0'特价备案 '1'特价 '2'进单

  @Input()
  processStatus: string = '0';// '1'已完成  '0'进行中

  @Input()
  display: boolean = true;// 当特价结束时第一个sale节点为 false

  @Input()
  displayType: string = 'task';// 'task'待办任务or待接收任务展示 'approval'我的申请展示

  processStatusStr: string;
  draftDataObj: any;
  processTypeStr: string;

  formDataObj: any = {};
  quotationadd: any = {};
  commercialquotationadd: any = {};
  qBaseInfo: any = {};
  isZhitou: boolean = false;
  quotationList = [];
  quotationList4Accordion = [];
  receiveDateStr: string = '';
  installDateStr: string = '';

  constructor(private http: HttpService, private modalService: NzModalService, private pdfmakeService:PdfmakeService) { }

  ngOnInit() {
    this.processStatusStr = this.processStatusMap[this.processStatus];

    if(this.processType) {
      this.processTypeStr = this.processTypeMap[this.processType];
      console.log('processTypeStr', this.processTypeStr);
    }
    this.prepareViewData();

  }

  async prepareViewData() {
    let result = undefined;
    if(this.taskData) {
      console.log('prepareViewData - taskData', this.taskData);
      // if()
      const draftDataTmp = this.taskData['taskFormComponentList']['globalVariables']['draftData'];
      console.log('prepareViewData - draftData', draftDataTmp);

      if (typeof (draftDataTmp) === 'object') {
        this.draftDataObj = draftDataTmp;
      } else {
        this.draftDataObj = JSON.parse(draftDataTmp);
      }

      //特价备案 or 特价 or 进单
      this.formDataObj = JSON.parse(this.draftDataObj['formData']);

      //是否有igmflag
      let igmFlag = false;
      const uiList = this.taskData['taskFormComponentList']['taskForm']['tblUiList'];
      if(uiList) {
        for(const item of uiList) {
          if(item['name'] === 'igmflag') {
            igmFlag = true;
            break;
          }
        }
      }
      console.log('igmflag', igmFlag);

      if ('1' === this.processType && this.display) { //特价
        this.quotationadd = JSON.parse(this.formDataObj['quotationadd']);
        console.log('quotationadd', this.quotationadd);
        this.qBaseInfo = this.quotationadd['quotationBaseInfo'];
        if ('1' === this.qBaseInfo['purchaseTypeCode']) {
          this.isZhitou = true;
        }
        this.quotationList = this.genSpecialQList(this.displayType,this.quotationadd['quotationList']);
        this.quotationList4Accordion = this.genQuotationList4Accordion(this.displayType, this.quotationList, igmFlag);



      } else if ('2' === this.processType && this.display) { //进单
        this.commercialquotationadd = JSON.parse(this.formDataObj['commercialquotationadd']);
        console.log('commercialquotationadd', this.commercialquotationadd);
        this.qBaseInfo = this.commercialquotationadd['quotationBaseInfo'];
        console.log('qBaseInfo', this.qBaseInfo);
        this.installDateStr = this.genDateStr(this.qBaseInfo['installDate']);
        this.receiveDateStr = this.genDateStr(this.qBaseInfo['receiveDate']);
        if ('1' === this.qBaseInfo['purchaseTypeCode']) {
          this.isZhitou = true;
        }
        let orderType = '0'; //是否特价进单
        const selectordertype = JSON.parse(this.formDataObj['selectordertype']);
        console.log('selectordertype', selectordertype);
        if (selectordertype && selectordertype['orderType']) {
          orderType = selectordertype['orderType'];
        }
        if('1' === orderType && igmFlag) {
          igmFlag = true;
        } else {
          igmFlag = false;
        }

        // this.quotationList = this.genSpecialQList(this.displayType, this.commercialquotationadd['quotationList']);
        // this.quotationList = this.commercialquotationadd['quotationList'];
        //WBS addtion procrss in if clause
        this.quotationList = this.commercialquotationadd['quotationList'];
        if (this.displayType == 'approval' && this.processType == '2' && this.processStatus == '1') {
          // console.log('wbsInit', this.commercialquotationadd);

          if (this.commercialquotationadd['wbsList'] && !this.isObjEmpty(this.commercialquotationadd['wbsList'])) {
            let wbsSet = this.getWbsSet();
            if (wbsSet.size > 0) {
              console.log('wbsData', this.commercialquotationadd['wbsList']);//for maintenance

              await this.getGiDataByWbsSet(wbsSet);
            }
          }
        }
        // console.log('dds', this.quotationList);

        this.quotationList = this.genSpecialQList(this.displayType, this.quotationList);

        // this.quotationList = this.genSpecialQList(this.displayType, this.commercialquotationadd['quotationList']);
        this.quotationList4Accordion = this.genQuotationList4Accordion(this.displayType, this.quotationList, igmFlag);
      }

      // console.log('formDataObj', this.formDataObj);

    }
    return result;

  }

  //aaaaa
  genSpecialQList(displayType,qlist) {
    let result = [];
    // let rowidCount = 0;
    for(let item of qlist) {
      let count = 0;
      if(item['counts']) {
        count = Number(item['counts']) || 0;
      }
      for(let i=0; i< count; i++){
        item['counts'] = 1;
        // item['rowid'] = rowidCount;
        result.push(item);
        // rowidCount += 1;
      }
    }
    return result;
  }

  genQuotationList4Accordion(displayType,qlist, showIgm: boolean=false) {
    let result = [];
    for(let item of qlist) {
      let accordion = {
        title: item['Product_Name']
      };
      let children = [];

      //todo for wbs
      if (displayType == 'approval' && this.processType == '2' && this.processStatus=='1') {
        children.push('序列号：' + (item['seriesNo'] || ''));
        children.push('Actual GI Date：' + (item['giDate'] || ''));
      }
      children.push('临床细分：' + item['Clinical_Segmentation']);
      children.push('二级科室：' + item['levelTwo']);

      const totalRows = item['qdetail']['totalRows'];
      let hetongjingjia = '';
      let hetongzongjia = '';
      let cuxiao = '无';
      let tejiajine = '';
      let jietijia = '';
      let igm = '';
      if(totalRows) {
        for(let i of totalRows) {
          if (i['total_code'] === 'T13') {
            hetongjingjia = i['money'];
          } else if (i['total_code'] === 'T8') {
            hetongzongjia = i['money'];
          } else if (i['total_code'] === 'T3') {
            jietijia = i['money'];
          } else if (i['total_code'] === 'T14') {
            igm = i['money'];
          }
        }
      }

      //促销 Promotion_name
      let promotionRows = item['qdetail']['promotionRows'];
      promotionRows.forEach((item, index) => {
        if(0 == index) {
          cuxiao = item['Promotion_name'];
        } else {
          cuxiao += ' ,' + item['Promotion_name'];
        }

      });


      //特价金额
      let prefix = item['unitTotalPrice'].toString().indexOf('$') > -1 ? '$' : '￥';
      const specialRow = item['qdetail']['specialRows'][0];
      if(prefix === '$') {
        tejiajine = specialRow['usd'] == '' ? (prefix + ' 0') : (prefix + ' ' + specialRow['usd']);
      } else {
        tejiajine = specialRow['rmb'] == '' ? (prefix + ' 0') : (prefix + ' ' + specialRow['rmb']);

      }
      children.push('合同净价：' + hetongjingjia);
      children.push('合同总价：' + hetongzongjia);
      children.push('阶梯价：' + jietijia);
      children.push('促销：' + cuxiao);
      children.push('特价金额：' + tejiajine);
      if(showIgm) {
        children.push('IGM：' + igm);
      }

      accordion['children'] = children;

      accordion['qdetail'] = item['qdetail'];

      result.push(accordion);

    }


    // console.log('newRows', result);
    return result;

  }

  //e.g. {year: 2019, month: 6, day: 30}
  genDateStr(obj:any) {
    let result = '';
    if(obj) {
      result = obj.year + '年' + obj.month + '月' + obj.day + '日';
    }
    return result;
  }


  initQuotationListWBS(gidataList?: Array<any>) {

    let tmpWbsList = [];
    let realWbsList = this.commercialquotationadd['wbsList'];

    if (this.quotationList.length > 0) {
      for (let item of this.quotationList) {

        let count = Number.parseInt(item['counts']);
        let wbsArr;
        if (!this.isObjEmpty(realWbsList) && realWbsList[item['rowid']]) {
          wbsArr = realWbsList[item['rowid']];
        }
        for (let i = 0; i < count; i++) {
          let wbsValue = '';
          let giDateValue = '';
          let shipToNameValue = '';
          let seriesNoValue = '';
          if (wbsArr && wbsArr[i]) {
            let wbsSample = wbsArr[i];
            wbsValue = wbsSample['wbs'] ? wbsSample['wbs'] : '';
            giDateValue = '';
            shipToNameValue = '';
            seriesNoValue = '';
            if (gidataList) {
              for (let item of gidataList) {
                if (item['WBS_Element'] === wbsValue) {
                  giDateValue = item['Actual_GI_date'] || '';
                  shipToNameValue = item['Ship_To_Name'] || '';
                  seriesNoValue = item['SN'] || ''; // TODO confirm what exactly col name for 产品序列号, current is SN
                  break;
                }
              }
            }
            // giDateValue = wbsSample['giDate'] ? wbsSample['giDate'] : '';
            // shipToNameValue = wbsSample['shipToName'] ? wbsSample['shipToName'] : '';
          }
          tmpWbsList.push({ wbs: wbsValue, giDate: giDateValue, seriesNo: seriesNoValue, shipToName: shipToNameValue, ...item }); //TODO  add产品序列号
        }
      }
    }
    for(let item of tmpWbsList) {
      item['counts'] = 1;
    }
    console.log('finalWBSList', tmpWbsList);
    this.quotationList = [...tmpWbsList];
    // return tmpWbsList;
  }



  async getGiDataByWbsSet(wbsSet: Set<any>) {
    console.log('commercialquotationadd.wblList', this.commercialquotationadd.wblList);
    if (wbsSet && wbsSet.size > 0) {
      let inStr = '';
      for (var item of Array.from(wbsSet.values())) {
        if (item.toString().trim() !== '') {
          inStr += `'` + item + `',`;
        }
      }
      inStr = inStr.slice(0, -1);
      const queryCondition = `WBS_Element in (` + inStr + `) and status='1'`;
      // console.log('getGIDATA', queryCondition);

      let res = await this.http.post('/act/masterdata/queryByWhere/gidata', { condition: queryCondition }).toPromise();

      if('0000' == res.code) {
        let wbsArr = res.data as Array<any>;
        if (wbsArr.length > 0) {
          this.initQuotationListWBS(wbsArr);
        }
      }
    }
  }


  getWbsSet() {
    let wbsSet = new Set([]);
    let realWbsList = this.commercialquotationadd['wbsList'];
    if (!this.isObjEmpty(realWbsList)) {
      for (let [key, value] of Object.entries(realWbsList)) {
        let arr = value as Array<any>;
        for (let item of arr) {
          if (item['wbs'] && '' !== item['wbs']) {
            wbsSet.add(item['wbs']);
          }
        }
      }
    }

    console.log('getWbsSet', wbsSet);
    console.log('getWbsSet', wbsSet.size);
    return wbsSet;
  }

  isObjEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }

  // 导出已选择亚型配置单的excel xlsx文件
  exportExcel(row: any, special:boolean) {
    // console.log('exportExcel,', row);
    if (!row.qdetail) {
      console.log("请填写完整的报价单信息!", row);
      return;
    }

    this.pdfmakeService.getSimpleXlsx(row, this.qBaseInfo, special);
  }

  pdfViewerModalOpen(event): void {
    // console.log('pdfViewerModalOpen init...', event);
    const modal = this.modalService.create({
      nzTitle: event.title || '',
      nzContent: MobilePdfViewerModalComponent,
      nzMaskClosable: false,
      nzClosable: false,
      nzComponentParams: {
        qdetail: event.qdetail
      },
      nzStyle: { top: '0px' },
      nzFooter: [{
        label: '返回',
        shape: 'primary',
        onClick: () => modal.destroy()
      }]
    });
    // modal.afterOpen.subscribe(() => console.log('[afterOpen] emitted!'));
  }
}

@Component({
  selector: 'mobile-pdf-viewer-modal-component',
  template: `
    <div class="pdf-container">
      <ngx-extended-pdf-viewer [src]="src" useBrowserLocale="true" height="80vh" [mobileFriendlyZoom]="'150%'" [zoom]="'100%'"></ngx-extended-pdf-viewer>
    </div>
  `
})
export class MobilePdfViewerModalComponent implements OnInit {

  @Input()
  qdetail: any;

  src: Uint8Array;

  constructor(
    private modal: NzModalRef,
    private pdfmakeService: PdfmakeService,
    private fileService: FileService) {}

  ngOnInit() {
    if (this.qdetail) {
      // console.log('qdetail', this.qdetail);
      this.pdfmakeService.getSimplePdf(this.qdetail).subscribe(res => {
        if (res.code === '0000') {
          let arr = this.fileService.base64ToArrayBuffer(res.data);
          let u8a = new Uint8Array(arr);
          this.src = u8a;
        }
      });
    }
  }
}
