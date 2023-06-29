import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '@core/services';
import { decodeString, getType, codeString } from '@core/util/tools';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
import { environment } from '@env';


@Component({
  selector: 'app-inorder-ex',
  templateUrl: './inorder-ex.component.html',
  styleUrls: ['./inorder-ex.component.scss']
})
export class InorderExComponent implements OnInit {

  constructor(public activatedRouter: ActivatedRoute, private http: HttpService, private message: NzMessageService, private fb: FormBuilder) {
    this.mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
  }
  mainid_winList: any = [];
  mainId: any = '';
  @Input() dataBase: any = {
    remarks: "",
  };
  @Input() disa: any = false;
  @Input() public showChek = true;
  public demandLetter = "场地勘验报告/要货函";
  public other = 'false,false,false,false,false,false,false';
  public otherFile = false; //控制其实备注和复制按钮的显示与否
  public textLen = 255;
  public infor: any = {
    detail: {
      id: '',
      flag: '',
      status: '',
    }
  }; //表格的基础信息
  public rowspanht = 1;
  public sampleRow = 4;
  public paymentOff: any = false;
  public enclosurFileList = []
  public load = false;
  public widthConfig = ['100px', '100px', '100px', '100px']
  public alignType = 'center';
  public style: any = { width: '100%' };
  public oaDisa = true; //控制div还是长文本框的显示
  public disas = true; //长文本框
  public validateForm: FormGroup;
  public validateForms: FormGroup;
  public bidWinningNoticeFileList = [];//中标通知书
  public siteReportFileList = []; //场地报告/要货函
  public projectSolutionsFileList = []; //项目解决方案售前支持报告
  public biddingDocumentsFileList = []; //投标文件
  public endUserContractFileList = []; //最终用户
  public paymentProvisionFileNameList = []; //付款条款文件
  public shipmentDeliveryList = [];//装运及交货文件
  public installationWarrantyList = [];//安装，验收及保修文件
  public amountDifferenceList = [];//直投订单合同金额和中标金额有价差
  public sitePreparatList = [];//场地准备
  public performanceBondList = [];//履约保函
  public supportFileMissingList = [];//支持文件缺失需特批进单
  public otherFilNameList = [];//其它上传
  public financialList = []; //金融方案列表
  public colSpanOfConfirmTable = 1;//合同条款确认 部分竖跨表格栏数
  flag: any;
  ngOnChanges() {

    this.getDataBase();
    this.viewData("enclosure", "enclosurFileList", this.dataBase.enclosureNames);
    if (this.dataBase) {
      this.paymentMethod();
      if (this.dataBase.entryMode && this.dataBase.entryMode == 'BIDDING') {
        this.getWinUrl();
      }
      if (this.infor.entryMode == '' || this.infor.entryMode == 'BIDDING' || (this.infor.sampleAuditFlag == '1' && this.infor.entryMode == 'STOCK')) {
        this.rowspanht = 7;
      }
      else {
        this.rowspanht = 1;
      }

    }

  }
  ngOnInit() {
    this.flag = this.activatedRouter.queryParams['_value'].flag;


    this.init();
    this.getDataBase();
    this.getfinancialList();
  }

  //付款条款列表的组合模式
  public paymentMethod() {
    const params = {
      dictGroup: '',
    };
    let applyTypeoff = false;
    applyTypeoff = (this.infor.entryMode == 'BIDDING'||this.infor.entryMode == 'bidding_authorization') || this.infor.entryMode == 'STOCK' ? true : false;
    let applyType = this.infor.entryMode;
    let clientType = this.infor.hospitalNature;
    let tenderPriceCurrencys = this.infor.invoiceInformation;
    let businessType = this.infor.businessModel;
    if (applyTypeoff && clientType && tenderPriceCurrencys && businessType) {
      if ((applyType == "BIDDING"|| applyType == 'bidding_authorization') && businessType == "DIRECT" && tenderPriceCurrencys == "CNY" && clientType == "公立医院") {
        params.dictGroup = 'BDCG';
      }
      else if ((applyType == 'BIDDING'|| applyType == 'bidding_authorization') && businessType == 'DIRECT' && tenderPriceCurrencys == 'USD' && clientType == '公立医院') {
        params.dictGroup = 'BDUG';

      }
      else if ((applyType == 'BIDDING'|| applyType == 'bidding_authorization') && businessType == 'DIRECT' && tenderPriceCurrencys == 'CNY' && clientType == '民营医院') {
        params.dictGroup = 'BDCM';

      }
      else if ((applyType == 'BIDDING'|| applyType == 'bidding_authorization') && businessType == 'DIRECT' && tenderPriceCurrencys == 'USD' && clientType == '民营医院') {
        params.dictGroup = 'BDUM';

      }
      else if ((applyType == 'BIDDING'|| applyType == 'bidding_authorization') && businessType == 'DISTRIBUTOR' && tenderPriceCurrencys == 'USD' && clientType == '民营医院') {
        params.dictGroup = 'BDisUM';

      }
      else if ((applyType == 'BIDDING'|| applyType == 'bidding_authorization') && businessType == 'DISTRIBUTOR' && tenderPriceCurrencys == 'CNY' && clientType == '民营医院') {
        params.dictGroup = 'BDisCM';

      }
      else if ((applyType == 'BIDDING'|| applyType == 'bidding_authorization') && businessType == 'DISTRIBUTOR' && tenderPriceCurrencys == 'USD' && clientType == '公立医院') {
        params.dictGroup = 'BDisUG';
      }
      else if ((applyType == 'BIDDING'|| applyType == 'bidding_authorization') && businessType == 'DISTRIBUTOR' && tenderPriceCurrencys == 'CNY' && clientType == '公立医院') {
        params.dictGroup = 'BDisCG';
      }
      else if ((applyType == 'BIDDING'|| applyType == 'bidding_authorization') && businessType == 'DIRECT' && tenderPriceCurrencys == 'CNY' && clientType == '其他') {
        params.dictGroup = 'BDCQ';
      }
      else if ((applyType == 'BIDDING'|| applyType == 'bidding_authorization') && businessType == 'DIRECT' && tenderPriceCurrencys == 'USD' && clientType == '其他') {
        params.dictGroup = 'BDUQ';

      }
      else if ((applyType == 'BIDDING'|| applyType == 'bidding_authorization') && businessType == 'DISTRIBUTOR' && tenderPriceCurrencys == 'CNY' && clientType == '其他') {
        params.dictGroup = 'BDisCQ';

      }
      else if ((applyType == 'BIDDING'|| applyType == 'bidding_authorization') && businessType == 'DISTRIBUTOR' && tenderPriceCurrencys == 'USD' && clientType == '其他') {
        params.dictGroup = 'BDisUQ';

      }
      else if (applyType == 'STOCK' && businessType == 'DISTRIBUTOR' && tenderPriceCurrencys == 'CNY') {
        params.dictGroup = 'SDisC';

      }
      else if (applyType == 'STOCK' && businessType == 'DISTRIBUTOR' && tenderPriceCurrencys == 'USD') {
        params.dictGroup = 'SDisU';
      }else if (
        clientType == "集团"
      ) {
        params.dictGroup = "COPGROUP";
      }
    }

    if (params.dictGroup != '') {
      this.http.post(`/act/ecom/dictData/queryGroupDictData`, params).subscribe((rest => {
        if (rest.code === '0000') {
          this.infor.paymentList = rest.data;
          if (this.infor.paymentProvision == '0' || this.infor.paymentProvision == '1') {
            let selectId = this.infor.paymentList.find(val => val.remark == this.infor.paymentProvision);
            this.infor.paymentProvision = selectId.dictId
          }
          let selectId = this.infor.paymentList.find(val => val.dictId == this.infor.paymentProvision);
          if (selectId) {
            this.paymentOff = selectId.remark == '1' ? true : false
          }
          else {
            this.paymentOff = false;
            this.infor.paymentProvision = "";
          }
        }
      }), (error => {
        this.message.create("error", "请求异常");
      }));
    }
    else {
      this.infor.paymentList = null;
    }
  }
  /**
  * @param   data 回显数据
  * @param   fileList 回显数组
  */
  viewData(data, fileList, name?: any) {
    const bidWinningNotice = this.dataBase[data];
    if (bidWinningNotice != "" && bidWinningNotice != undefined && bidWinningNotice != null) {

      this[fileList] = [];
      let obj = { uid: "", name: "", fileId: "" }
      obj.uid = this.dataBase[data];
      obj.fileId = this.dataBase[data];
      obj.name = name ? name : "下载文件"
      this[fileList].push(obj);
    }
  }
  /**
  * filist 在线显示的文件 file上传的文件 fileId绑定的上传文件的id
  */
  public upload(fileList, file, fileId) {

    this[fileList] = [];
    const type = getType(file);
    this[fileList].push(file);
    const formData = new FormData();
    // tslint:disable-next-line:no-shadowed-variable
    this[fileList].forEach((file: any) => {
      formData.append('file', file);
      formData.append('fileType', type);
      formData.append('filename', file.name);
    });
    this.load = true;
    const url = '/act/system/upload';
    this.http.posts(url, formData).subscribe((res => {
      if (res.code === '0000') {
        this.load = false;
        this[fileList][0].fileId = res.data;
        this.dataBase[fileId] = res.data;
        this.message.create('success', res.msg);
      } else {
        this.message.create('error', res.msg);
      }
    }), (error => {
      this.load = false;
      this[fileList] = [];
      this.message.create("error", "上传失败请重新上传!")
    }));
  }
  //上传附件
  public enclosurforeUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    this.dataBase.fileName = file.name;
    this.upload('enclosurFileList', file, 'enclosure');
    return false;
  }
  // 上传文件下载
  public dwonLoad = (file: UploadFile): void => {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf('#');
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${file.fileId}`;
    window.open(url, '_blank');
  }
  //招标文件的编辑类型
  setType() {
    if (this.infor.entryMode == 'STOCK' && (this.infor.userTeme == 'BV' || this.infor.userTeme == 'DXR')) {
      this.demandLetter = "要货函";
    }
    else {
      if (this.infor.hospitalNature == '民营医院') {
        this.demandLetter = "场地勘验报告";
      }
      else {
        if (this.infor.tenderNo != '其他类型') {
          this.demandLetter = "要货函";
        }
        else {
          this.demandLetter = "场地勘验报告";
        }
      }
    }
  }
  //删除附件
  nzRemovenclosur = (file: UploadFile): any => {
    this.dataBase.enclosure = "";
    return true;
  }
  // 文件下载
  public fileDwon(id) {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf('#');
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${id}`;
    window.open(url, '_blank');
  }
  init() {
    this.validateForm = this.fb.group({
      afterSales: new FormControl({ value: 'Nancy', disabled: this.disas || this.flag == 1 }),
      afterSalesRemarks: new FormControl({ value: 'Nancy', disabled: this.disa }), //是否售后文本框
      freeText: new FormControl({ value: 'Nancy', disabled: this.disas || this.flag == 1 }),
      afterSalesCheckFlag: new FormControl({ value: 'Nancy', disabled: this.disa || this.flag == 1 }),
      confirmationFileCheckFlag: new FormControl({ value: 'Nancy', disabled: this.disa || this.flag == 1 }),
      mrShieldingCompanyCheckFlag: new FormControl({ value: 'Nancy', disabled: this.disa || this.flag == 1 }),
      performanceBondCheckFlag: new FormControl({ value: 'Nancy', disabled: this.disa || this.flag == 1 }),
      amountDifferenceCheckFlag: new FormControl({ value: 'Nancy', disabled: this.disa || this.flag == 1 }),
      bidWinningNoticeCheckFlag: new FormControl({ value: 'Nancy', disabled: this.disa || this.flag == 1 }),
      siteReportCheckFlag: new FormControl({ value: 'Nancy', disabled: this.disa || this.flag == 1 }),
      projectSolutionsCheckFlag: new FormControl({ value: 'Nancy', disabled: this.disa || this.flag == 1 }),
      biddingDocumentsCheckFlag: new FormControl({ value: 'Nancy', disabled: this.disa || this.flag == 1 }),
      tenderDocumentsCheckFlag: new FormControl({ value: 'Nancy', disabled: this.disa || this.flag == 1 }),
      endUserContractCheckFlag: new FormControl({ value: 'Nancy', disabled: this.disa || this.flag == 1 }),
      projectAnalysisTableCheckFlag: new FormControl({ value: 'Nancy', disabled: this.disa || this.flag == 1 }),
      paymentProvisionCheckFlag: new FormControl({ value: 'Nancy', disabled: this.disa || this.flag == 1 }),
      shipmentDeliveryCheckFlag: new FormControl({ value: 'Nancy', disabled: this.disa || this.flag == 1 }),
      installationWarrantyCheckFlag: new FormControl({ value: 'Nancy', disabled: this.disa || this.flag == 1 }),
      sitePreparationCheckFlag: new FormControl({ value: 'Nancy', disabled: this.disa || this.flag == 1 }),
      otherCheckFlag: new FormControl({ value: 'Nancy', disabled: this.disa || this.flag == 1 }),
      supportFileMissingCheckFlag: new FormControl({ value: 'Nancy', disabled: this.disa || this.flag == 1 }),
      paymentProvision: new FormControl({ value: 'Nancy', disabled: this.disas }),//合同概要表和进单装备表的基础验证差别
      shipmentDelivery: new FormControl({ value: 'Nancy', disabled: this.disas }),
      installationWarranty: new FormControl({ value: 'Nancy', disabled: this.disas },),
      amountDifference: new FormControl({ value: 'Nancy', disabled: this.disas }),
      train: new FormControl({ value: 'Nancy', disabled: this.disas },),
      sitePreparation: new FormControl({ value: 'Nancy', disabled: this.disas }),
      performanceBond: new FormControl({ value: 'Nancy', disabled: this.disas }),
      supportFileMissing: new FormControl({ value: 'Nancy', disabled: this.disas }),
      supportFileMissingRemarks: new FormControl({ value: 'Nancy', disabled: this.disas }),
      punishment: new FormControl({ value: 'Nancy', disabled: this.disas }),
      other: new FormControl({ value: 'Nancy', disabled: this.disas }, null),
      other1: new FormControl({ value: 'Nancy', disabled: this.disas }, null),
      other2: new FormControl({ value: 'Nancy', disabled: this.disas }, null),
      other3: new FormControl({ value: 'Nancy', disabled: this.disas }, null),
      other4: new FormControl({ value: 'Nancy', disabled: this.disas }, null),
      other5: new FormControl({ value: 'Nancy', disabled: this.disas }, null),
      other6: new FormControl({ value: 'Nancy', disabled: this.disas }, null),
      other7: new FormControl({ value: 'Nancy', disabled: this.disas }, null),
      paymentProvisionRemarks: new FormControl({ value: 'Nancy', disabled: this.disas },),
      shipmentDeliveryRemarks: new FormControl({ value: '', disabled: this.disas },),
      installationWarrantyRemarks: new FormControl({ value: 'Nancy', disabled: this.disas },),
      amountDifferenceRemarks: new FormControl({ value: 'Nancy', disabled: this.disas },),
      sitePreparationRemarks: new FormControl({ value: 'Nancy', disabled: this.disas },),
      performanceBondRemarks: new FormControl({ value: 'Nancy', disabled: this.disas },),
      otherRemarks: new FormControl({ value: 'Nancy', disabled: this.disas },),
      contractPrice: new FormControl({ value: 'Nancy', disabled: this.disas },),
      productModel: new FormControl({ value: 'Nancy', disabled: this.disas },),
      nmpaName: new FormControl({ value: 'Nancy', disabled: this.disas },),
      installationWarrantyRadio: new FormControl({ value: 'Nancy', disabled: this.disas }),
    });
    this.validateForms = this.fb.group({
      customerRequestLetter: new FormControl({ value: '', disabled: this.disa || this.flag == 1, }, Validators.required),
      contractVersion: new FormControl({ value: '', disabled: this.disa || this.flag == 1 }, Validators.required),
      isOCAP: new FormControl({ value: '', disabled: this.disa || this.flag == 1 },),
      remarks: new FormControl({ value: '', disabled: this.disa || this.flag == 1 },),
    })
  }
  getDataBase() {   //来至于合同概要表信息
    // 获取mainid
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const status = this.activatedRouter.queryParams['_value'].state;
    const url = `/act/preparation/queryContractSummary?mainId=${mainId}`;
    // 获取基础信息数据
    return new Promise((resolve, reject) => {
      this.http.post(url).subscribe(res => {

        if (res.data) {
          this.infor = Object.assign(this.infor, res.data);
          this.infor.detail = {
            id: '',
            flag: '',
            status: '',
          }
          this.infor.detail.id = mainId;
          this.infor.detail.status = status;
          this.infor.userTeme = this.infor.cteam;
          this.setBaseInfor();
          this.setColSpanOfConfirmTable();
          this.setType();
          resolve(res.data)
        } else {
          this.message.create('error', '获取数据失败');
        }
      });
    })
  }
  public setColSpanOfConfirmTable(): void {
    this.colSpanOfConfirmTable = 1
    if (this.infor.sampleAuditFlag == '1') {
      this.colSpanOfConfirmTable++
    }
  }

  setBaseInfor()  //设置合同概要表其它信息
  {
    if (this.infor.businessModel != 'DIRECT') {
      if (this.infor.tenderNo != '其他类型') {
        this.sampleRow = 4
      }
      else {
        this.sampleRow = 2;
      }
    }
    else {
      if (this.infor.tenderNo != '其他类型') {
        this.sampleRow = 2;
      }
      else {
        this.sampleRow = 1;
      }
    }
    if (this.infor.detail.status && this.infor.detail.status !== 'DOACS' || this.showChek) {
      if (this.infor.other === undefined) {
        this.infor.other = 'false,false,false,false,false,false,false';
      }
      if (!this.infor.other1) {
        this.infor.other1 = false;
      }
      if (!this.infor.other2) {
        this.infor.other2 = false;
      }
      if (!this.infor.other3) {
        this.infor.other3 = false;
      }
      if (!this.infor.other4) {
        this.infor.other4 = false;
      }
      if (!this.infor.other5) {
        this.infor.other5 = false;
      }
      if (!this.infor.other6) {
        this.infor.other6 = false;
      }
      if (!this.infor.other7) {
        this.infor.other7 = false;
      }
      const arr = this.infor.other.split(',');
      arr.map((item, index) => {
        if (item === 'true') {
          arr[index] = true;
        }
        if (item === 'false') {
          arr[index] = false;
        }
      });
      this.otherFile = arr.some(vals => vals == true) //控制备注、复制按钮的显示与否;
      this.infor.other1 = arr[0];
      this.infor.other2 = arr[1];
      this.infor.other3 = arr[2];
      this.infor.other4 = arr[3];
      this.infor.other5 = arr[4];
      this.infor.other6 = arr[5];
      this.infor.other7 = arr[6];
    }
  }
  //项目模版
  public generateAnalysisTemplate(code) {

  }

  // 飞利浦金融方案
  public getfinancialList() {
    const params = {
      dictGroup: 'OABC',
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
      if (rest.code === '0000') {
        this.financialList = rest.data;
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }
  cheakData(param) {
    if (param == 'REJECTED') {
      this.validateForms.get('remarks')!.setValidators(Validators.required);
      this.validateForms.get('remarks')!.markAsDirty();
      this.validateForms.get('customerRequestLetter')!.clearValidators();
      this.validateForms.get('customerRequestLetter')!.markAsPristine();
      this.validateForms.get('contractVersion')!.clearValidators();
      this.validateForms.get('contractVersion')!.markAsPristine();
    }
    else {
      this.validateForms.get('remarks')!.clearValidators();
      this.validateForms.get('remarks')!.markAsPristine();
      this.validateForms.get('customerRequestLetter')!.setValidators(Validators.required);
      this.validateForms.get('customerRequestLetter')!.markAsDirty();
      this.validateForms.get('contractVersion')!.setValidators(Validators.required);
      this.validateForms.get('contractVersion')!.markAsDirty();
    }
    this.validateForms.get('remarks')!.updateValueAndValidity();
    this.validateForms.get('customerRequestLetter')!.updateValueAndValidity();
    this.validateForms.get('contractVersion')!.updateValueAndValidity();
  }
  //表单验证
  checkFormData = () => {
    for (const i in this.validateForms.controls) {
      this.validateForms.controls[i].markAsDirty();
      this.validateForms.controls[i].updateValueAndValidity();
    }
    return this.validateForms.valid;
  };

  /*投标申请表链接眼*/
  getWinUrl() {
    const url = '/act/preparation/getMainId';
    let par = {
      jdChildMainId: this.mainId
    };
    this.http.post(url, par).subscribe(e => {
      if (e.data) {
        this.mainid_winList = e.data;
      }
    });
  }
  toWin(item) {
    if (item.taskStatus && item.taskStatus === 'YZBQRDBCWJ') {
      window.open(location.origin + environment.base_href + '/#/' + 'bidding/support-up?id=' + codeString(item.zbMainId) + '&flag=1' + '&status=' + item.taskStatus);
    } else {
      window.open(location.origin + environment.base_href + '/#/' + 'bidding/winning?id=' + codeString(item.zbMainId) + '&flag=1' + '&status=' + item.taskStatus);
    }
  }

}
