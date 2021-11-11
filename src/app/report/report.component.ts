import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {HttpService, ReportExportService} from '../services';
import {of} from 'rxjs';
import {ToastrService} from 'ngx-toastr';


@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

  validateForm: FormGroup;
  controlArray: any[] = [];
  searchControlArray: any[] = [];
  isCollapse: boolean = true;
  collapseText: string = '展开';
  reportRows: any[] = [];
  currentTotal: number = 0;
  isProcessing: boolean = false;
  queryParams: any = {
    pageIndex: 0,
    pageSize: 0
  };

  //on page data for select options
  oitStatusList: any[] = [];
  solutionList: any[] = [];
  bigAreaList: any[] = [];
  smallAreaList: any[] = [];
  oitMonthList: any[] = [];
  clinicList: any[] = [];
  channelTypeList: any[] = [
    {
      name: 'd2c',
      code: 'd2c'
    },
    {
      name: 'ecom',
      code: 'ecom'
    }
  ];


  //用于：1 字段汉子名称mapping;2 xlsx中column顺序
  keyRemap = {
    omLabel: 'OA标签',
    oitStatus: 'Status',
    systemNumber: '系统参考号',
    oruCurrency: 'ORU（币种）',
    soNumber: 'SO Number', // P2 add
    sapNumberWbsNumber: 'SAP#/WBS#',
    giDate: 'GI Date', //P2 added
    sn: 'SN#', //P2 added
    // omUser: 'OM', //P2 Remove
    orderType: '订单类型',
    sofonNumber: 'SOFON号',
    pricingLabel: 'SOFON标签',
    finalUserName: '最终用户名称',
    philipsType: '飞利浦类型',
    // P2 Exchange province and city order
    province: '省份',
    city: '城市',
    customerSysId: 'Customer SysID',
    opportunityId: '商机号',
    opportunityIdAlt: '商机号（手动）',
    clinicalSegments: '临床细分',
    productName: '产品名称',
    subtypeName: '亚型名称',
    oneLevelDepartmentCategory: '一级科室分类',
    twoLevelDepartmentCategory: '二级科室分类',
    subtypeCount: '数量',
    rddDate: '要求到货日期（RDD）',
    sidDate: '预计安装日期 （SID）',
    sales: '销售',
    smallAreaName: '小区',
    bigArea: '大区',
    bigAreaMg: '大区经理',
    distributorName: '经销商名称',
    contractBuyer: '合同买方名称',
    importProtocolNumber: '进口协议编号',
    purchaseOrderNumber: '采购订单编号',
    contractAmount: '合同金额',
    delayPremiums: '其中延保金额',
    delayGuaranteeYear: '延保年限', //重复？
    contractPrice: '合同净价',
    systemAmountUsd: '系统金额 (USD)',
    delayPremiumsUsd: '其中延保金额 (USD)',
    delayGuaranteeYear2: '延保年限 ',
    systemPriceUsd: '系统净利润',
    // P2 Move
    qSystemNumber: '特价参考号',
    gapVsStandardQuotation: '特价金额',
    paymentType: '支付方式',
    oitMonth: 'OIT Month',
    oa: 'OA',
    gbs: 'GBS',
    onSiteTrainingFee: '现场培训',
    onSiteTrainingCount: '现场培训份数（必选）', //last added
    onSiteTrainingExtraCount: '现场培训份数（可选）', //last added
    productApplicationClassFee: '产品&应用课程',
    productApplicationCount: '产品&应用课程份数（必选）', //last added
    productApplicationExtraCount: '产品&应用课程份数（可选）', //last added
    clinicalScientificClassFee: '临床科研培训费',
    otherTrainingGroupOptionalCount: '临床科研培训费份数', //last added
    biddingFee: '招标费',
    testFee: '检测费',
    localdealerCommission: 'Local dealer commission (佣金费）',
    centralCommission: 'Central Commission',
    promotionPlan1: '促销方案一',
    promotionPlan2: '促销方案二',
    promotionPlan3: '促销方案三',
    promotionPlan4: '促销方案四',
    promotionPlan5: '促销方案五',
    saleFirstSubmitDate: '销售第一次提交日期',
    saleSecondSubmitDate: '销售最后一次提交日期/最后一次驳回后完成提交日期',
    configConfirmDate: '配置确认日期/SOFON最后一次提交日期',
    oitDate: 'OIT日期',
    oitCycleTime: 'OIT Cycle Time',
    solutionName: '是否包含solution',
    qlabSelectName: 'QLAB选件名称',
    productCode: '第三方产品名称（12NC代码）',
    ctp: 'CTP',
    ctpPercent: 'CTP百分比',
    distributorAgreementNo: '经销商协议号',
    contractNumber: '合同号',
    salesSapCode: '销售 Sap Code',
    enduserSapCode: '最终用户 Sap Code',
    customerSapCode: '合同买方 Sap Code',
    distributorSapCode: '经销商 Sap Code',
    tips: '备注信息',
    ladderPrice: '阶梯价', //P2 added
    privateHosp: '是否民营医院', //P2 added
    htaus: '是否HTAUS',
    channelType: '渠道类型',
    distributorType: 'd2c订单类型',
    saleEmail: '销售邮箱'
  };


  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private reportExportService: ReportExportService,
    private toastrService: ToastrService) {
  }

  ngOnInit() {

    this.initSelectList();
    this.initSearchControlArray();
    this.validateForm = this.fb.group({});

    for (let i = 0; i < this.searchControlArray.length; i++) {
      // this.controlArray.push({ index: i, show: i < 6 });

      this.validateForm.addControl(this.searchControlArray[i]['col'], new FormControl());
    }

    this.queryParams.pageIndex = 1;
    this.queryParams.pageSize = 10;
    // do not query data for slow backend load, comment below line on 2020-03
    // this.refreshTable();

  }

  //init ends

  //初始化搜索控制
  initSearchControlArray() {
    this.searchControlArray = [
      {
        index: 0,
        show: true,
        type: 'in',
        listValue: 'dimensionCode',
        listText: 'dimensionName',
        label: '大区',
        col: 'big_area',
        list: 'bigAreaList'
      },
      {
        index: 1,
        show: true,
        type: 'in',
        listValue: 'dimensionCode',
        listText: 'dimensionName',
        label: '小区',
        col: 'small_area',
        list: 'smallAreaList'
      },
      {
        index: 2,
        show: true,
        type: 'in',
        listValue: 'name',
        listText: 'name',
        label: 'Status',
        col: 'oit_status',
        list: 'oitStatusList'
      },
      {
        index: 3,
        show: true,
        type: 'in',
        listValue: 'code',
        listText: 'name',
        label: 'OIT Month',
        col: 'oit_month',
        list: 'oitMonthList'
      },
      {
        index: 4,
        show: true,
        type: 'in',
        listValue: 'name',
        listText: 'name',
        label: '临床细分',
        col: 'clinical_segments',
        list: 'clinicList'
      },
      {
        index: 5,
        show: true,
        type: 'in',
        listValue: 'name',
        listText: 'name',
        label: '是否包含Solution',
        col: 'solution_name',
        list: 'solutionList'
      },
      {
        index: 6,
        show: false,
        type: 'like',
        label: '最终用户名称',
        col: 'final_user_name'
      },
      {
        index: 7,
        show: false,
        type: 'like',
        label: '经销商名称',
        col: 'distributor_name'
      },
      {
        index: 8,
        show: false,
        type: 'like',
        label: '销售',
        col: 'sales'
      },
      {
        index: 9,
        show: false,
        type: 'like',
        label: '系统参考号',
        col: 'system_number'
      },
      {
        index: 10,
        show: false,
        type: 'like',
        label: '特价参考号',
        col: 'q_system_number'
      },
      {
        index: 11,
        show: false,
        type: 'like',
        label: 'WBS号',
        col: 'sap_number_wbs_number'
      },
      {
        index: 12,
        show: false,
        type: 'like',
        label: 'SOFON号',
        col: 'sofon_number'
      },
      {
        index: 13,
        show: false,
        type: 'like',
        label: '最终用户飞利浦类型',
        col: 'philips_type'
      },
      {
        index: 14,
        show: false,
        type: 'isnull',
        label: '是否有WBS号',
        col: 'sap_number_wbs_number__PLACEHOLDER1'
      },
      {
        index: 15,
        show: false,
        type: 'in',
        listValue: 'code',
        listText: 'name',
        label: '渠道类型',
        col: 'channel_type',
        list: 'channelTypeList'
      }
    ];
  }

  filterData() {
    // console.log(this.validateForm);
    // console.log(this.validateForm.value);
    // console.log(this.queryParams);
    this.queryParams.pageIndex = 1;
    const formValues = this.validateForm.value;
    this.queryParams = {
      pageIndex: this.queryParams.pageIndex,
      pageSize: this.queryParams.pageSize
    };
    for (let key in formValues) {
      if (formValues[key] && formValues[key].toString() !== '') {
        let item = this.searchControlArray.find(i => i.col === key);
        let queryItem = {
          'type': item['type'],
          'value': formValues[key]
        };

        this.queryParams[key] = queryItem;


      }
    }
    console.log('queryParams', this.queryParams);
    // return;
    this.refreshTable();

  }

  resetForm() {
    this.validateForm.reset();
  }

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
    this.collapseText = this.isCollapse ? '展开' : '收起';
    this.searchControlArray.forEach((c, index) => {
      c.show = this.isCollapse ? index < 6 : true;
    });
  }


  refreshTable(flag?: string) {

    this.isProcessing = true;
    this.http.post('/act/report/pageQuery', this.queryParams).subscribe(res => {
      if (res.code === '0000') {
        const {total, rows} = res.data;

        if ('page' === flag && total === 0 && this.queryParams.pageIndex !== 1) {
          console.log('enterToPage');
          this.queryParams.pageIndex = 1;
          this.refreshTable();
          return;
        }

        this.reportRows = [...rows];
        this.currentTotal = total;
      } else {
        this.toastrService.error(res.msg);
      }
      this.isProcessing = false;
    });
  }

  getNoPagingDataExport() {
    this.isProcessing = true;
    let newQueryParam = {...this.queryParams};
    newQueryParam.pageSize = -1;
    console.log('exporting', newQueryParam);
    this.http.post('/act/report/pageQuery', newQueryParam).subscribe(res => {
      if (res.code === '0000') {

        const {total, rows} = res.data;

        // this.exportReport(rows); // 导出所有列
        this.exportReport(rows, true); // 只导出keyMap中的列
      } else {
        this.toastrService.error(res.msg);
      }
      this.isProcessing = false;
    });

  }

  exportReport(dataArray: any[], onlyKeyCols?: boolean): void {
    dataArray.forEach(item => {
      return item['delayGuaranteeYear2'] = item['delayGuaranteeYear'];
    });

    let orderedHeader = Object.keys(this.keyRemap).map(item => this.keyRemap[item]);
    let param = {
      header: orderedHeader
    };
    let newRow: any[] = [];
    if (onlyKeyCols) {
      dataArray.forEach(item => {
        let newItem = {};
        Object.keys(this.keyRemap).forEach(key => {
          newItem[key] = this.formatData(key,item);
        });
        newRow.push(newItem);
      });
      newRow = this.replaceKeyInObjectArray(newRow, this.keyRemap);
    } else {
      newRow = this.replaceKeyInObjectArray(dataArray, this.keyRemap);
    }
    this.reportExportService.exportAsExcelFile(newRow, 'Realtime_Report', param);
  }


  formatData(key: string, item: object) {
    if (typeof item[key] == 'boolean') {
      return item[key] ? '是' : '否';
    }else{
      return item[key] || '';
    }
  }


  replaceKeyInObjectArray(a, replaceMap) {
    return a.map(o => Object.keys(o).map((key) => ({[replaceMap[key] || key]: o[key]})
    ).reduce((a, b) => Object.assign({}, a, b)));
  }


  getSelectArray(arrayName: string) {
    switch (arrayName) {
      case 'oitStatusList':
        return of(this.oitStatusList);
      case 'solutionList':
        return of(this.solutionList);
      case 'bigAreaList':
        return of(this.bigAreaList);
      case 'smallAreaList':
        return of(this.smallAreaList);
      case 'clinicList':
        return of(this.clinicList);
      case 'oitMonthList':
        return of(this.oitMonthList);
      case 'channelTypeList':
          return of(this.channelTypeList);
      default:
        return of([]);
    }
  }

  initSelectList() {

    //oit month list
    let oitMonthTmpList = [];
    for (let i = 2019; i < 2039; i++) {
      for (let j = 1; j < 13; j++) {
        let monthStr = j < 10 ? ('0' + j) : j.toString();
        let name = i + '年' + monthStr + '月';
        let code = i + monthStr;
        oitMonthTmpList.push({
          name: name,
          code: code
        });
      }
    }
    this.oitMonthList = [...oitMonthTmpList];

    this.getBigSmallAreaList('bigArea');
    this.getBigSmallAreaList('smallArea');

    //临床细分list
    this.http.post('/act/masterdata/queryJsonByCondition/productclass', {status: '1'}).subscribe(res => {
      if ('0000' == res.code) {
        let rawList = JSON.parse(res.data);
        let clinicalSet = new Set();
        for (let item of rawList) {
          if (item['Clinical_Segmentation'] && '' != item['Clinical_Segmentation']) {
            clinicalSet.add(item['Clinical_Segmentation']);
          }
        }

        clinicalSet.forEach(item => {
          this.clinicList.push({
            name: item,
            code: item
          });
        });
      } else {
        this.toastrService.error(res.msg);
      }
    });


    this.fetchMisc((data) => {
      //console.log(data);
      //oit 状态 list
      this.oitStatusList = [...data['oitStatus']];

      //是否有solution list
      this.solutionList = [...data['solutionType']];

      //大区 list from front
      // this.bigAreaList = [...data['bigArea']];

      //小区 list from front
      // this.smallAreaList = [...data['smallArea']];
    });
  }

  fetchMisc(cb) {
    const req = new XMLHttpRequest();
    req.open('GET', `assets/json/report-filter-misc.json`);

    req.onload = () => {
      const data = JSON.parse(req.response);
      cb(data);
    };

    req.send();
  }

  //DM小区；RSM大区
  getBigSmallAreaList(flag?: string) {
    let keyWord = 'smallArea' == flag ? 'DM' : 'RSM';
    const uri = '/act/dimension/queryDimensionTreeByGroupCodeAndType';
    const params = {
      type: 'Region',
      groupCode: keyWord,
      keyword: ''
    };
    this.http.post(uri, params).subscribe(res => {
      if ('0000' == res.code) {
        console.log(flag, res.data);
        let data = res.data;
        if ('RSM' === keyWord) {
          this.bigAreaList = [...data];
        }
        if ('DM' === keyWord) {
          this.smallAreaList = [...data];
        }
      } else {
        this.toastrService.error(res.msg);
      }
    });
  }

  changeIndex = (pageIndex) => {
    this.queryParams.pageIndex = pageIndex;
    this.refreshTable('page');
  };

  changeSize = (pageSize) => {
    this.queryParams.pageIndex = 1;
    this.queryParams.pageSize = pageSize;
    this.refreshTable();
  };

}
