import { Component, OnInit } from '@angular/core';
import { HttpService } from '@core/services';
import { decodeString } from '@core/util/tools';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  templateUrl: './change-owner.component.html',
  styleUrls: ['./change-owner.component.scss']
})
export class ChangeOwnerComponent implements OnInit {
  public changeDescription = '';
  public changeReason = '离职';
  public changeReasonList = [
    { name: '离职', value: '离职' },
    { name: '区域变更', value: '区域变更' }
  ];
  public applicant = '';
  public originalOwner = null;
  public receiver = null;
  public originalOwnerList = [];
  public receiverList = [];

  public textLen = 255;
  public cosList = [];
  public dealFormList = [];
  public cosListSeach = [];
  public dealFormListSeach = [];
  public refSeach = {
    referenceId: '',
    accountName: '',
    subDate: [],
    bidding: false,
    order: false,
    preBook: false,
    pageNo: 1,
    pageSize: 10,
    total: 0,
    loading: false
  };
  public dealSeach = {
    dealFormId: '',
    simulationId: '',
    accountName: '',
    pageNo: 1,
    pageSize: 10,
    total: 0,
    loading: false
  };
  public referenaceShowoff = false;
  public dealformShowoff = false;
  // true 为编辑页
  // false 为查看页
  public flag = true;
  public mainId = null;
  public showOriginalOwner = false;
  public originalOwnerAdd = '';

  public dataBase = {
    entrustDescription: '',
    changeReason: '',
    applicant: '',
    originalOwner: '',
    receiver: '',
    cosProjectsDTOS: [],
    dealFormAndSimulationsDTOS: []
  };

  constructor(private http: HttpService, public activatedRouter: ActivatedRoute, private message: NzMessageService, private router: Router) { }

  ngOnInit() {
    this.applicant = localStorage.getItem('ecom_ng_philips_code1');
    this.mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const flag = decodeString(this.activatedRouter.queryParams['_value'].flag);
    if (flag === '1' || flag == 1) {
      this.flag = false;
    }
    if (!this.flag && this.mainId != null) {
      this.getData();
    }
    this.addSales();
  }
  public getData() {
    const url = '/act/ecom/homepage/getMyOwnerChange' + '?id=' + this.mainId;
    this.http.get(url).subscribe(res => {
      if (res && res.data) {
        this.dataBase = res.data;
      }
    }, error => {

    });
  }

  public referenceSeachOpp() {
    this.referenaceShowoff = true;
    this.addReferenceData();
  }
  public dealSeachOpp() {
    this.dealformShowoff = true;
    this.addDealFormData();
  }
  public confirm() {

    // 非空验证
    if (this.changeDescription == null || this.changeDescription === '') {
      this.message.create('error', '请填写变更描述');
      return;
    }
    if (this.changeReason == null || this.changeReason === '') {
      this.message.create('error', '请填写变更原因');
      return;
    }
    // if (this.applicant == null || this.applicant === '') {
    //   this.message.create('error', '请填写变更描述');
    // }
    if (this.originalOwner == null || this.originalOwner === '') {
      this.message.create('error', '请选择原所有人');
      return;
    }
    if (this.receiver == null || this.receiver === '') {
      this.message.create('error', '请选择接收人');
      return;
    }
    if (!(this.cosList && this.cosList.length > 0) && !(this.dealFormList && this.dealFormList.length > 0)) {
      this.message.create('error', '请至少选择cos项目或Deal Form ID/Simulation ID');
      return;
    }

    const url = '/act/ecom/homepage/myOwnerChange';
    const dealList = this.dealFormList;
    if (dealList) {
      dealList.map(d => {
        d.projectStatus = d.status;
        d.status = null;
      });
    }
    // 转义状态
    const cosListMap = this.cosList;
    if (cosListMap) {
      cosListMap.map(c => {
        const processStatus = this.processTypeMap[c.processStatus];
        const taskStatus = this.processTypeMap[c.taskStatus];
        let p = '';
        if (processStatus != null && processStatus !== '') {
          p = processStatus;
        }
        if (processStatus != null && processStatus !== '' && taskStatus != null && taskStatus !== '') {
          p += '-';
        }
        if (taskStatus != null && taskStatus !== '') {
          p += taskStatus;
        }
        c.projectStatus = p;
      });
    }
    const par = {
      entrustDescription: this.changeDescription,
      changeReason: this.changeReason,
      applicant: this.applicant,
      originalOwner: this.originalOwner,
      receiver: this.receiver,
      cosProjectsDTOS: cosListMap,
      dealFormAndSimulationsDTOS: dealList
    };
    this.http.post(url, par).subscribe(res => {
      if (res && res.data == '0000') {
        this.message.create('success', res.msg);
        this.router.navigate(['/system-setting/business-config'], {
          queryParams: {
            activedId: 'entrust-tab'
          }
        });
      } else {
        this.message.create('error', res.msg);
      }
    }, error => {
      this.message.create('error', '提交失败');
    });
  }
  public cancel() {

  }
  public cancelModeal() {
    this.referenaceShowoff = false;
    this.dealformShowoff = false;
  }
  public addRef() {
    // 遍历选中的对象
    const arr = this.cosList;
    for (let i = 0; i < this.cosListSeach.length; i++) {
      if (this.cosListSeach[i].isCheck && !this.ckReferenceId(this.cosListSeach[i])) {
        arr.push(this.cosListSeach[i]);
      }
    }
    this.cosList = [...arr];
    this.referenaceShowoff = false;
  }
  public emailMessage = false;
  public openOriginalOwner() {
    this.showOriginalOwner = true;
  }
  public cancelShowOriginalOwner() {
    this.showOriginalOwner = false;
  }
  public addOriginalOwner() {
    if (this.originalOwnerAdd != null && this.originalOwnerAdd !== '' && this.originalOwnerAdd.trim() !== '') {
      const reg = /^([a-zA-Z0-9_\.\-])+\@(philips.com)+$/;
      if (reg.test(this.originalOwnerAdd)) {
        if (!this.checkOriginalOwnerList(this.originalOwnerAdd)) {
          const arr = { name: this.originalOwnerAdd, value: this.originalOwnerAdd, email: this.originalOwnerAdd };
          this.originalOwnerList.push(arr);
        }
        this.originalOwner = this.originalOwnerAdd;

        this.showOriginalOwner = false;
        this.emailMessage = false;
        this.originalOwnerAdd = '';
      } else {
        this.emailMessage = true;
      }
    } else {
      this.showOriginalOwner = false;
      this.emailMessage = false;
      this.originalOwnerAdd = '';
    }
  }
  public checkOriginalOwnerList(email) {
    if (this.originalOwnerList) {
      for (let i = 0; i < this.originalOwnerList.length; i++) {
        if (this.originalOwnerList[i].email === email) {
          return true;
        }
      }
    }
    return false;
  }

  public remRef(i) {
    const arr = this.cosList;
    arr.splice(i, 1);
    this.cosList = [...arr];
  }
  public addDeal() {
    // 遍历选中的对象
    const arr = this.dealFormList;
    for (let i = 0; i < this.dealFormListSeach.length; i++) {
      if (this.dealFormListSeach[i].isCheck && !this.ckDealForm(this.dealFormListSeach[i])) {
        arr.push(this.dealFormListSeach[i]);
      }
    }
    this.dealFormList = [...arr];
    this.dealformShowoff = false;
  }
  public remDeal(i) {
    const arr = this.dealFormList;
    arr.splice(i, 1);
    this.dealFormList = [...arr];
  }

  // 判断referenceid是否已添加
  public ckReferenceId(a) {
    if (this.cosList) {
      for (let i = 0; i < this.cosList.length; i++) {
        if (a.referenceId == this.cosList[i].referenceId && a.projectType == this.cosList[i].projectType) {
          return true;
        }
      }
    }
    return false;
  }
  // 判断DealForm是否已添加
  public ckDealForm(a) {
    if (this.dealFormList) {
      for (let i = 0; i < this.dealFormList.length; i++) {
        if (a.dealFormId == this.dealFormList[i].dealFormId && a.simulationId == this.dealFormList[i].simulationId) {
          return true;
        }
      }
    }
    return false;
  }

  public addSales() {
    // const url = '/act/ecom/homepage/querySales';
    // this.http.get(url).subscribe(res => {
    //   if (res && res.data) {
    //     this.originalOwnerList = res.data;
    //     this.receiverList = res.data;
    //   }
    // });
    const url = '/act/ecom/homepage/querySalesByRole';
    const par = [
      'Sales Rep/Mgr'
    ];
    this.http.post(url, par).subscribe(res => {
      if (res && res.data) {
        this.originalOwnerList = res.data;
        this.receiverList = res.data;
      }
    });
  }

  // 查询cos数据
  public addReferenceData() {
    this.refSeach.loading = true;
    const url = '/act/ecom/homepage/addReferenceId';
    let pardate = {
      startTime: null,
      endTime: null,
      processOwner: this.originalOwner
    };
    if (this.refSeach.subDate[0]) {
      pardate.startTime = this.refSeach.subDate[0];
    }
    if (this.refSeach.subDate[1]) {
      pardate.endTime = this.refSeach.subDate[1];
    }
    const par = Object.assign(pardate, this.refSeach);
    this.http.post(url, par).subscribe(res => {
      if (res.data) {
        this.cosListSeach = res.data.rows;
        this.cosListDisabled();
        this.refSeach.total = res.data.total;
      }
      this.refSeach.loading = false;
    }, error => {
      this.refSeach.loading = false;
    });
  }

  // 查询dealform数据
  public addDealFormData() {
    this.dealSeach.loading = true;
    const url = '/act/ecom/homepage/addDealFormIdandSimulationId';
    // let pardate = {
    //   startTime: null,
    //   endTime: null
    // };
    // if (this.dealSeach.subDate[0]) {
    //   pardate.startTime = this.dealSeach.subDate[0];
    // }
    // if (this.dealSeach.subDate[1]) {
    //   pardate.endTime = this.dealSeach.subDate[1];
    // }
    const par = {
      salesEmail: this.originalOwner
    };
    this.http.post(url, Object.assign(par, this.dealSeach)).subscribe(res => {
      if (res.data) {
        this.dealFormListSeach = res.data.rows;
        this.dealFormListDisabled();
        this.dealSeach.total = res.data.total;
      }
      this.dealSeach.loading = false;
    }, error => {
      this.dealSeach.loading = false;
    });
  }

  // 禁用已经添加的cos
  public cosListDisabled() {
    if (this.cosListSeach) {
      this.cosListSeach.map(seach => {
        if (this.cosList) {
          this.cosList.map(cos => {
            if (seach.referenceId == cos.referenceId && seach.projectType == cos.projectType) {
              seach.disabled = true;
              seach.isCheck = true;
            }
          });
        }
      });
    }
  }

  // 禁用已经添加的dealform
  public dealFormListDisabled() {
    if (this.dealFormListSeach) {
      this.dealFormListSeach.map(seach => {
        if (this.dealFormList) {
          this.dealFormList.map(cos => {
            if (seach.dealFormId == cos.dealFormId && seach.simulationId == cos.simulationId) {
              seach.disabled = true;
              seach.isCheck = true;
            }
          });
        }
      });
    }
  }

  public onChange(result: Date): void {
    console.log('onChange: ', result);
  }
  public changePageIndexReference(e) {
    this.refSeach.pageNo = e;
    this.addReferenceData();
  }
  public changePageSizeReference(e) {
    this.refSeach.pageSize = e;
    this.addReferenceData();
  }
  public changePageIndexDeal(e) {
    this.dealSeach.pageNo = e;
    this.addDealFormData();
  }
  public changePageSizeDeal(e) {
    this.dealSeach.pageSize = e;
    this.addDealFormData();
  }

  // 判断是否添加cos或dealform
  public ckAddCosOrDealForm() {
    if (this.cosList && this.cosList.length > 0) {
      return true;
    }
    if (this.dealFormList && this.dealFormList.length > 0) {
      return true;
    }
    return false;
  }

  public processTypeMap = {
    '': '',
    'null': '',
    'ZLCSH': "子流程审核",
    'ZBSQ': '招标授权', // 二次开标btn, 待备案btn
    'ZBBA': '中标备案',
    'DBA': '待备案',
    'DSWZYQR': '待商务专员确认',
    'DTJ': '待提交',
    // 'ABC': '待提交',
    'WZB': '未中标',
    '2CKB': '二次开标', // 二次开标btn, 待备案btn
    '2CKBZZ': '二次开标',  // 项目终止
    'XMZZ': '项目终止',
    'ZBQR': '中标确认',
    'YZBQR': '已中标确认',
    'SUBMIT': '已提交',
    'APPROVED': '已批准',
    'uploaded': '已上传',
    'DSWYSH': '待商务专员审核',
    'DZBQR': '待商务专员确认',
    'SWZYCS': '待商务专员审核',
    'XSBMDMSH': '待销售经理审核',
    'XSBMZSLSH': '待销售总监审核',
    '2JSH': '待非标准条款审核',
    'CWBM': '财务部',
    'ZLFGB': '质量法规部',
    'GYLYYB': '供应链运营部',
    'FLB': '法律部',
    'FAFWB': '方案服务部',
    'SCB': '市场部',
    'DSWZYSQ': '授权发放',
    'FFSQ': '授权发放',
    'REJECTED': '已拒绝',
    'back': '已退回',
    'JDZB': '进单准备',
    'DCDSH': '待场地审核',
    'DOACS': '进单准备表待OA审核',
    'HTQS': '合同签署',
    'DXSBMSH': '待销售经理审核',
    'DXSBM2JSH': '待销售总监审核',
    'TP': '特批',
    'DHTGYBTX': '修改合同概要表',
    'XJDHTGYBTX': '提交合同概要表',
    'DHTOASH': '合同概要表OA审核',
    'DTPJDSH': '特批进单审核',
    'DTXHT': '待填写OrderSummary',
    'DODSH': '待OrderSummary审核',
    'DHTQS': '待合同签署',
    'DOITWJSC': '待OIT文件上传',
    'DBCWJSC': 'OIT完成-待补充文件上传',
    'DBCWJ': '已中标确认-待补充文件上传',
    'YZBQRYBCWJ': '已中标确认-已补充文件',
    'CDSH': '场地审核',
    'DZLCSH': '合同子流程审核',
    'DOAJDQR': '待进单确认',
    'XS1JBMSH': '销售经理审核',
    'XS2JBMSH': '销售总监审核',
    'JDEND': '进单流程完成',
    'OITEND': 'OIT完成',
    'OITENDDBCWJSC': 'OIT补充文件完成',
    'JDQR': '进单确认',
    'ORDERCG': 'OrderSummary填写',
    'OASH': '合同概要表待OA审核',
    'HTGYB': '查看并提交合同概要表',
    'CANCELLEDSUB': '项目终止-取消进单',
    'CANCELLED': '项目终止-取消进单',
    'BIDCANCELLED': '取消投标申请',
    'ORDERSH': 'Order Summary审核 On Behalf Of Cluster BP',
    'rejected': '已拒绝',
    'approved': '已批准',
    'DFBSH': '待合同非标准条款审核',
    'paymentProvision': '待C&C Leader审核',
    'paymentProvision2': '待Cluster BP审核',

    'installationWarranty': '待S&SD Marketing Leader审核',
    'installationWarranty2': '待S&SD BP审核',

    'shipmentDelivery': '待CFC Distributor leader审核',
    'amountDifference': '待OIT committee审核',
    'sitePreparation': '待CFC PM Leader审核',
    'performanceBond': '待Cluster BP审核',
    'TPWJJDCS': '待Cluster BP审核',
    'TPWJJDSH': '待CFC Leader审核',
    'TPWJJDZS': '待COP Leader审核',
    'OACS': '进单准备表OA审核',
    'YZBQRDBCWJ': '已中标确认-待补充文件上传',
    'COMPLETE': '已完成',
  };

  // 全选逻辑
  public AllCheckDeal() {
    if (this.dealFormListSeach) {
      for (let i = 0; i < this.dealFormListSeach.length; i++) {
        if (this.dealFormListSeach[i].isCheck == false || this.dealFormListSeach[i].isCheck === 'false' || this.dealFormListSeach[i].isCheck == null) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
  public CheckAllDeal(eve) {
    if (this.dealFormListSeach) {
      for (let i = 0; i < this.dealFormListSeach.length; i++) {
        this.dealFormListSeach[i].isCheck = eve;
      }
    }
  }

  public AllCheckRef() {
    if (this.cosListSeach) {
      for (let i = 0; i < this.cosListSeach.length; i++) {
        if (this.cosListSeach[i].isCheck == false || this.cosListSeach[i].isCheck === 'false' || this.cosListSeach[i].isCheck == null) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
  public CheckAllRef(eve) {
    if (this.cosListSeach) {
      for (let i = 0; i < this.cosListSeach.length; i++) {
        this.cosListSeach[i].isCheck = eve;
      }
    }
  }

}
