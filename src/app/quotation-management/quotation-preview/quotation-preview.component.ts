import { Component, OnInit, Input, ViewChild } from '@angular/core';
import {FileService, HttpService, NgxDatatableService} from '../../services';
import {DatatableComponent} from '@swimlane/ngx-datatable';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'quotation-preview',
  templateUrl: './quotation-preview.component.html',
  styleUrls: ['./quotation-preview.component.scss']
})
export class QuotationPreviewComponent implements OnInit {

  @Input()
  params: any;

  @ViewChild('primary_table')
  table: DatatableComponent;

  loadingIndicator: boolean = false;
  quotationTitle: string = '';
  comments: string = '';
  rows: any[] = [];
  rowsOptRows = [];
  disabled: boolean = true;

  getCellClass = this.ngxDatatableService.getCellClass;
  getCellClassAlt = this.ngxDatatableService.getCellClassAlt;
  getHeaderClass = this.ngxDatatableService.getHeaderClass;

  constructor(private http: HttpService,
    private ngxDatatableService: NgxDatatableService, private toastrService: ToastrService) { }

  ngOnInit() {
    console.log('params', this.params)
    if(this.params && this.params.quotationId) {
      const qid = this.params.quotationId;
      console.log('qid', qid);

      this.initPrimaryList(qid);
    }
  }

  initPrimaryList(qid) {
    this.loadingIndicator = true;
    this.http.get('/act/quotation/queryById/'+ qid).subscribe(res =>{
      if ('0000' == res.code) {


        const { content } = res.data;
        console.log('data123', res.data);

        const { items, title, comments } = content[0];
        this.quotationTitle = title;
        this.comments = '';
        if (comments && comments.length > 0) {
          this.comments = comments.join(' ');
        }
        let primaryList = [];
        let optList = [];
        let optCount = 0;
        let optLeft = 0;
        let optNames = [];
        let optRaw = undefined;

        let primaryData = undefined;
        for (let index = 0; index < items.length; index++) {
          const { QTY, header, row, options, ...others } = items[index];
          if(others['fontColor'] && '0000' === others['fontColor']) {
            others['fontColor'] = '000000';
          }
          const _qty = QTY === '_' ? '' : QTY;
          let optFlag = undefined;
          // if(options) {

          // }
          //生成N选M规则参数 starts
          if (options && optLeft == 0) {
            optCount += 1;
            optNames = [];
            optLeft = Number(options.split('-')[0]) || 0;
            optRaw = options;
          }

          console.log(others['PN']);

          if (optLeft > 0 && (others['PN'])) {
            optNames.push(others['chinese'] || '');
            optFlag = 'option' + optCount;


            optLeft = optLeft - 1;

            if (optLeft == 0) {
              let optItem = {
                optFlag: optFlag,
                raw: optRaw,
                optNames: optNames
              };
              this.rowsOptRows.push(optItem);
            }
          }
          //生成N选M规则参数 ends

          if (!!QTY || header === 'Y') {
            if (primaryData) {
              primaryList.push({ ...primaryData });
            }
            primaryData = {
              maxqty: 999,
              _qty,
              'QTY': QTY,
              row: row,
              optFlag: optFlag,
              details: [],
              ...others,
            };
            if (index === (items.length - 1)) {
              primaryList.push({ ...primaryData });
            }
          } else {
            if (primaryData && primaryData['QTY'] && (!!QTY || header === 'Y')) {
              primaryList.push({ ...primaryData });
              primaryData = undefined;
            } else
              if (primaryData) {
                primaryData['details'].push({
                  row: row,
                  ...others
                });
                if (index === (items.length - 1)) {
                  primaryList.push({ ...primaryData });
                }
              } else {
                primaryData = {
                  ...items[index],
                  details: [],
                };
              }
          }
        }
        console.log('primaryList', primaryList);
        for (let j = 0; j < primaryList.length; j++) {
          if (primaryList[j]['PN'] && '' != primaryList[j]['PN'] && primaryList[j]['QTY']) {
            if ('_' == primaryList[j]['QTY']) {
              primaryList[j]['maxqty'] = 1;
            }
            break;
          }
        }
        this.rows = [...primaryList];
        setTimeout(()=>{
          this.table.recalculate();
          this.loadingIndicator = false;
        }, 50);

        try {
          for (const item of this.rows) {
            if ((item['CNY'] && isNaN(item['CNY'])) || (item['USD'] && isNaN(item['USD']))) {
              console.log('error row', item);
              throw new Error('金额列出现非数字字符。');
            }
          }
        } catch (e) {
          this.loadingIndicator = false;
          console.log(e);
          this.toastrService.error('该亚型模板主数据不规范，请联系管理员。')
        }
      }
    });
  }
  togglePrimaryTableExpandRow(row) {
    if (row.details.length > 0) {
      this.table.rowDetail.toggleExpandRow(row);
    }
  }

  updateValue(event, cell, rowIndex) {
    // console.log('==> updateValue: ');
  }

}
