import { Component, EventEmitter, ChangeDetectorRef, Input, OnInit, Output, ViewEncapsulation,SimpleChange} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable, Observer } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../app.service';
import { HttpService } from '../../../services';
import { ToastrService } from 'ngx-toastr';
import { ApprovalMainModalComponent } from '../../../approval-main-modal/approval-main-modal.component';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
import { timeStamp } from 'console';
import { getType, upLoadFile, checkPhone, decodeString } from '../../../../assets/js/tools';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { environment } from '../../../../environments/environment';
import {
  codeString,
} from '../../../../assets/js/tools';
import { ServesiceService } from '../servesice.service';
@Component({
  selector: 'app-preOrderBaseInfo',
  templateUrl: './baseInfo.component.html',
  styleUrls: ['./baseInfo.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PreOrderBaseInfoComponent implements OnInit {
  mainid_winList: any = [];
  mainId: any = '';
  /*
  * true禁用
  * */
  public bidwinningNotice="中标通知书/最终用户合同";
  public demandLetter="场地勘验报告/要货函";
  public otherFile = false; //控制其实备注和复制按钮的显示与否
  public oaDisa = false; //控制div还是长文本框的显示
  public style: any = { width: '100%' };//控制日期控件样式
  public financiaWidth: any = "14";
  @Input() public disa = false;
  // 是否为合同概要表
  @Input() public conTable = false;
  /*
  * 是否显示 合同条款确认
  * */
  @Input() public showChek = false;
  @Input() public edit = false;
  @Input() public defect = [
    { name: "招标文件", show: false },
    { name: "投标文件", show: false },
    { name: "最终用户合同", show: false },
    { name: "项目分析表", show: false },
  ]

  public isPdf: any = false; //打开pdf查看器
  pdfSRC: any;
  @Input() public dataBase: any = {
    productList: [], // 产品列表
    detail: {
      id: '',
      flag:'0',
      status: '',
    },
    // projectAnalysisTable: [], // 盖章后的项目分析表/上传
  };
  public taskId: any; //获取当前节点的taskid
  dealFormIdinput: any = '';
  // dealform展示列表
  dealformlist: any = [
    // {dealformid: 1, dealformname: '44'},
    // {dealformid: 2, dealformname: '33'}
  ];
  radioValue: any = '';
  // 选中dealform
  ckdealformlist: any = {};

  // 查询框加载
  deal_load: any = false;

  box: any = false;

  @Output() myVerifi = new EventEmitter();
  @Output() public myEvent = new EventEmitter();
  @Output() public updateDataBaseInfo = new EventEmitter<any>();
  @Output() public updateData = new EventEmitter<any>();
  @Output() public updateBase = new EventEmitter<any>();
  public currId: any;
  public entryMode: any;
  public rowspans: any = 2;
  public sampleRow: any = 4;
  public modelTalbe: any = false;
  public load: any = false;
  public selectedValue = '';
  public validateForm: FormGroup;
  public dateFormat = 'yyyy/MM/dd';
  public financialList: any = []; //下拉列表
  public dealFormId = '';
  public distributorList = [];
  public poolList = [];
  public projectAnalysisTableFileList = []; // 盖章后的项目分析表/上传
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
  public mrShieldingCompanyList = [];//磁共振屏蔽公司
  public confirmationFileFileList = [];//IGT第三方吊塔确认文件
  public tenderDocumentsList = [];//招标文件
  public fileList = [
    // {
    //   uid: 1,
    //   name: 'xxx.png',
    //   status: 'done',
    //   response: 'Server Error 500', // custom error message to show
    //   url: 'http://www.baidu.com/xxx.png'
    // },
  ];

  public condition = false;

  public value: string;

  public alignType = 'center';
  public colSpanOfConfirmTable = 1;//合同条款确认 部分竖跨表格拦数
  public isVisibleCPResult = false;
  public entryModeList = [];
  public businessModelList = [];
  public listOfData = [];
  public other = 'false,false,false,false,false,false,false';
  constructor(
    private appService: AppService,
    private http: HttpService,
    private toastrService: ToastrService,
    private router: Router,
    private modalService: NgbModal,
    private aRoute: ActivatedRoute,
    private message: NzMessageService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    public activatedRouter: ActivatedRoute,
    private ServesiceService: ServesiceService,
  ) {
    this.mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    this.appService.pageTitle = '主页';
    this.getDistributorList();   
    this.getPoolList();
    this.ServesiceService.supportFileMissing.subscribe(res=>{ 
      if(this.dataBase&&this.dataBase.productList.length>0)
      {
        const miss=this.dataBase.productList.every(vals=>vals.supportFileMissing=='1')
        this.dataBase.supportFileMissing=miss?'1':'0';
      }  
    })
  }

  // 打开pdf查看器
  public isPdfCancel() {
    this.isPdf = false;
  }
  public changeOthers(value: boolean, num: number): void {
    const arr = this.other.split(',');
    arr.map((item, index) => {
      if (item === 'true') {
        arr[index] = String(true);
      }
      if (item === 'false') {
        arr[index] = String(false);
      }
    });

    arr[num] = String(value);
    this.other = arr.toString();
    this.dataBase.other = arr.toString();
    this.otherFile = arr.some(res => res === 'true') //控制备注、复制按钮的显示与否;
  }


  //非标提示"审核按钮"
  Tips() {

    if (this.taskId == 'paymentProvision' && this.dataBase.paymentProvision == '1' && this.dataBase.detail.flag == '0') {
      return true;
    }
    else if (this.taskId == 'performanceBond' && this.dataBase.performanceBond == '1' && this.dataBase.detail.flag == '0') {
      return true;
    }
    else if (this.taskId == 'sitePreparation' && this.dataBase.sitePreparation == '1' && this.dataBase.detail.flag == '0') {
      return true;
    }
    else if (this.taskId == 'installationWarranty' && this.dataBase.installationWarranty == '1' && this.dataBase.detail.flag == '0') {
      return true;
    }
    else if (this.taskId == 'shipmentDelivery' && this.dataBase.shipmentDelivery == '1' && this.dataBase.detail.flag == '0') {
      return true;
    }
    else {
      return false;
    }

  }
  //特批提示"审核按钮"
  Tipsecond() {
    if (((this.taskId == 'TPWJJDCS' || this.taskId == 'TPWJJDSH' || this.taskId == 'TPWJJDZS') && this.dataBase.supportFileMissing == 1) || ((this.taskId == 'TPWJJDCS' || this.taskId == 'TPWJJDSH' || this.taskId == 'TPWJJDZS') && this.dataBase.amountDifference == 1) && this.dataBase.detail.flag == '0') {
      return true;
    }
    else {
      return false;
    }
  }
   //金融方案
   selectFinacial() {
   
    if (this.dataBase.financialProgramme == "2") {
      this.financiaWidth = "7"
    }
    else {
      this.financiaWidth = "14"
    }
    if(this.financialList.length>0)
    {
      let select=this.financialList.find(val=>val.code==this.dataBase.financialProgramme);
      select&&(this.dataBase.financialProgrammeTitle=select.label)    
    }
  }
  public generateAnalysisTemplate(code) {
    const today = new Date();
    const params = {
      templateCode: code,
      dateYear: today.getFullYear(),
      dateMonth: (today.getMonth() + 1),
      dateDay: today.getDate(),
      date: today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate(),
      data1: today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate(),
      endUser: this.dataBase.endUser ? this.dataBase.endUser : "",
      tenderNo: this.dataBase.tenderNo ? this.dataBase.tenderNo : "",
      tenderingCompany: this.dataBase.tenderingCompany ? this.dataBase.tenderingCompany : "",
      dealFormId: this.dataBase.dealFormId
    };
    this.pdfSRC = params;
    if (this.dataBase.dealFormId == "" || this.dataBase.dealFormId == null || this.dataBase.dealFormId == undefined) {
      this.message.create("error", "请先查询dealFormId")
      return
    }
    if (this.dataBase.tenderNo == "" || this.dataBase.tenderNo == undefined || this.dataBase.tenderNo == null) {
      this.message.create("error", "招标编号为空");
      return
    }
    if (this.dataBase.tenderingCompany == "" || this.dataBase.tenderingCompany == undefined || this.dataBase.tenderingCompany == null) {
      this.message.create("warning", "投标公司为空");

    }
    this.isPdf = true;

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
    // var urlPath = window.document.location.href;
    // var docPath = window.document.location.pathname;
    // var index = urlPath.indexOf('#');
    // var serverPath = urlPath.substring(0, index);
    // // pdfPreview
    // const url = `${serverPath}act/system/upload`;    
    // let xhr=new XMLHttpRequest();
    // let upload=xhr.upload;
    // upload.onprogress=function(ev)
    // {
      
    //   console.log('总进度:'+ev.total,"当前进度:"+ev.loaded)
    // }
    // xhr.open("post",url,true);
    // xhr.send(formData);
    //   xhr.onload=()=> {
    //     alert("上传完成!");
    //     this.load=false;
    // };
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
  //表格行
  public setColSpanOfConfirmTable(database?: any): void {
    try {
      this.colSpanOfConfirmTable = 1
      let NewDatabase = database ? database : this.dataBase;
      if (NewDatabase.sampleAuditFlag && NewDatabase.sampleAuditFlag.toString() == '1') {
        this.colSpanOfConfirmTable++
      }
    } catch (e) { }
    this.selectModelFile();
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
  // 上传文件下载
  public dwonLoad = (file: UploadFile): void => {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf('#');
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${file.fileId}`;
    window.open(url, '_blank');
  }
  //其它附件上传
  public otherFilNameBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('otherFilNameList', file, 'otherFilName');
    return false;
  }
  //支持文件缺失需特批进单
  public supportFileMissingBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('supportFileMissingList', file, 'supportFileMissingFileName');
    return false;
  }
  //履约保函
  public performanceBondBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('performanceBondList', file, 'performanceBondFileName');
    return false;
  }

  //场地准备
  public sitePreparationBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('sitePreparatList', file, 'sitePreparationFileName');
    return false;
  }
  //直投订单合同金额和中标金额有价差
  public amountDifferenceBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('amountDifferenceList', file, 'amountDifferenceFileName');
    return false;
  }
  //安装及验收保修文件
  public installationWarrantyBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('installationWarrantyList', file, 'installationWarrantyFileName');
    return false;
  }
  //装运及交货上传
  public shipmentDeliveryBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('shipmentDeliveryList', file, 'shipmentDeliveryFileName');
    return false;
  }
  //付款条款文件上传
  public paymentProvisionBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('paymentProvisionFileNameList', file, 'paymentProvisionFileName');
    return false;
  }
  // 上传盖章后的投标申请函
  public projectAnalysisTableBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('projectAnalysisTableFileList', file, 'projectAnalysisTable');
    return false;
  }
  //上传中标通知书
  public bidWinningNoticeBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('bidWinningNoticeFileList', file, 'bidWinningNotice');
    return false;
  }
  //上传场地报告/要货函
  public siteReportNoticeBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('siteReportFileList', file, 'siteReport');
    return false;
  }
  //上传项目解决方案售前支持报告
  public projectSolutionsBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('projectSolutionsFileList', file, 'projectSolutions');
    return false;
  }
  //磁共振文件上传
  public mrShieldingCompanyUpload = (file: UploadFile): boolean => {
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
    const upLoadFiles = upLoadFile.bind(this);
    upLoadFiles('mrShieldingCompanyList', file, 'mrShieldingCompany');
    return false;
  }
  //IGT塔吊上传
  public confirmationFileUpload = (file: UploadFile): boolean => {
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
    const upLoadFiles = upLoadFile.bind(this);
    upLoadFiles('confirmationFileFileList', file, 'confirmationFile');
    return false;
  }
  //投标文件上传
  public tenderDocumentsBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('tenderDocumentsList', file, 'tenderDocuments');
    return false;
  }
  //招标文件上传
  public biddingDocumentsBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('biddingDocumentsFileList', file, 'biddingDocuments');
    return false;
  }
  //最终用户上传
  public endUserContractBeforeUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 <100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    this.upload('endUserContractFileList', file, 'endUserContract');
    return false;
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

  //获取产品信息
  getProduct(e) {
    const url = `/act/preparation/queryMarketBundle?dealFormID=` + e;
    const params = {
      dealFormID: e,
    };
    if (params.dealFormID !== "" && params.dealFormID !== null && params.dealFormID !== undefined) {
      return new Promise((resolve, reject) => {
        this.http.get(url).subscribe((res => {
          if (res.code == '0000') {
            resolve(true);
            // this.dataBase.dataList=res.data.children;
            let { children } = res.data;
            this.dataBase.productList = [];
            this.dataBase.count = 0;
            this.myVerifi.emit(true);
            // simulation id
            //let simulationIdSList = [];
            children.map(vals => {
              vals.title = vals.simulationId;
              vals.key = vals.id;
              vals.level = 1;
              vals.children.map(val => {
                this.dataBase.count++;
                val.title = val.marketBundleName;
                val.key = val.id;
                val.level = 2;
                // simulationIdSList.push(val.dealFormMarketBundleId);
                // simulationIdSList.push(val.simulationIdS);
                val.children.map(item => {
                  item.title = item.productName;
                  item.key = item.id;
                  item.level = 3;
                  item.disableCheckbox = true; //第三层禁用
                  item.isLeaf = true;
                });
              });
            });
            this.dataBase.dataList = children;
            //this.GetPrice(simulationIdSList, this.dataBase.dataList);
            // this.dataBase=Object.assign({},this.dataBase)
            this.updateData.emit(this.dataBase);
            this.isVisibleCPResult = false;
          }
          else {
            this.message.create("error", res.msg);
          }
        }), (error => {
          this.message.create("error", "请求异常")
        }));
      })
    }
    else {
      this.message.create("error", "请填写dealFormId");
    }

  }
  public getCPDetails() {
    // 进单准备表-查询CP审核结果
    return new Promise((resolve, reject) => {
      this.http.post(`/act/preparation/queryCpReview`, {
        dealFormID: this.dataBase.dealFormId,
      }).subscribe(rest => {
        if (rest.code === '0000') {
          resolve(true)
          let { cosOppDealForm } = rest.data;
          const { dealer } = rest.data;
          if (cosOppDealForm != null && cosOppDealForm != undefined && cosOppDealForm != "") {
            this.dataBase.businessModel = cosOppDealForm.businessModel; //业务模式;
            this.dataBase.region = cosOppDealForm.region + '/' + cosOppDealForm.residentialQuarters; //区域
            this.dataBase.tenderNo = cosOppDealForm.tenderNo;//招标编号
            this.dataBase.tenderingCompany = cosOppDealForm.biddingCompanyName; //投标公司
            this.dataBase.distributor = cosOppDealForm.dealerName; //经销商
            if (dealer) {
              this.dataBase.ddpStatus = dealer.ddpStatus //ddp状态
              this.dataBase.distributorAddress = dealer.registeredAddress; //经销商地址
              this.dataBase.distributorPhone = dealer.dealerTelephone; //经销商电话
              this.dataBase.distributorEmail = dealer.dealerEmail; //邮箱地址
              this.dataBase.billingInfor = dealer.vatBillingInfo; //开票信息
            }
            this.dataBase.contractBuyerAddress = cosOppDealForm.registeredAddress; //合同买方地址
            this.dataBase.contractBuyerEmail = cosOppDealForm.dealerEmail; //合同邮箱
            this.dataBase.endUser = cosOppDealForm.hospitalName; //最终用户
            this.dataBase.hospitalNature = cosOppDealForm.customerType; //医院性质
            this.dataBase.endUserAddress = cosOppDealForm.endUserAddress; //最终用户地址
            this.dataBase.endUserPhone = cosOppDealForm.endUserPhone; //最终用户电话
            this.dataBase.invoiceInformation = cosOppDealForm.currencySystem //币制
            this.dataBase.sampleAuditFlag = cosOppDealForm.samplingInspection //是否抽样审核
            this.dataBase.sonfonFile = rest.data.sonfonFile;
            //this.dataBase = Object.assign(this.dataBase, rest.data);
            if (this.dataBase.businessModel === 'DIRECT' && this.dataBase.invoiceInformation == 'CNY') {
              this.dataBase.contractBuyer = this.dataBase.endUser;
              this.dataBase.contractBuyerAddress = this.dataBase.endUserAddress;
              this.dataBase.contractBuyerContacts = this.dataBase.endUserContacts;
              this.dataBase.contractBuyerPhone = this.dataBase.endUserPhone;
              this.dataBase.contractBuyerEmail = this.dataBase.endUserEmail;
              this.validateForm.controls.contractBuyer1.disable();
              this.validateForm.controls.contractBuyer2.disable();
            }
            else if (this.dataBase.businessModel === 'DISTRIBUTOR' && this.dataBase.invoiceInformation == 'CNY') {
              this.dataBase.contractBuyer = this.dataBase.distributor;
              this.dataBase.contractBuyerAddress = this.dataBase.distributorAddress;
              this.dataBase.contractBuyerContacts = this.dataBase.distributorContacts;
              this.dataBase.contractBuyerPhone = this.dataBase.distributorPhone;
              this.dataBase.contractBuyerEmail = this.dataBase.distributorEmail;
              this.validateForm.controls.contractBuyer1.disable();
              this.validateForm.controls.contractBuyer2.disable();
            }
            this.updateData.emit(this.dataBase)
            this.setColSpanOfConfirmTable();
          }
          else {
            this.message.create("warning", "没有数据")
          }
        } else {
          this.message.create('error', `${rest.msg}`);
        }
      });
    });
  }
  //币值的选择
  selectInvoice($event) {
    this.ifForeignTradeCompany();
    if (this.dataBase.invoiceInformation == 'CNY') {
      this.validateForm.controls.contractBuyer1.disable();
      this.validateForm.controls.contractBuyer2.disable();
    }
    else {
      this.validateForm.controls.contractBuyer1.enable();
      this.validateForm.controls.contractBuyer2.enable();
    }
  }
  //外贸公司联动
  foreignup()
  { 
    const contractBuyer2=this.poolList.find(val=>val.corporateName.replace(/\s+/g,"")==this.dataBase.foreignTradeCompany.replace(/\s+/g,""))
    if(!contractBuyer2)
    {
      this.dataBase.contractBuyer2=null;  
      this.validateForm.controls.contractBuyer2.clearAsyncValidators(); 
      if((this.dataBase.detail.status==''||this.dataBase.detail.status=='XJDHTGYBTX'||this.dataBase.detail.status=='DHTGYBTX')&&this.dataBase.detail.flag=='0')
      {     
         this.validateForm.controls.contractDdpStatus.enable();
         this.validateForm.controls.poolEndDate.enable();  
      }      
    }
    else
    {
      this.dataBase.contractBuyer2=this.dataBase.foreignTradeCompany;
      this.dataBase.poolEndDate=contractBuyer2.ddpValidUntil;
      this.dataBase.contractDdpStatus= contractBuyer2.ddpStatus;      
      this.validateForm.controls.contractDdpStatus.disable();
      this.validateForm.controls.poolEndDate.disable();
        
    }    
  }
  //选择经销商1
  public changeDistributor(value) {
    
    this.dataBase.distributor1 = value;
    this.dataBase.distributorAddress = ""; //清除经销商地址;
    this.dataBase.distributorContacts = ""; //经销商联系人;
    this.dataBase.distributorPhone = ""; //经销商电话;
    this.dataBase.distributorEmail = "";//经销商邮箱
    this.dataBase.contractEndDate=""; 
    this.dataBase.distributor = this.dataBase.distributor1;
    if (this.distributorList && this.distributorList.length > 0) {
      let select = this.distributorList.find((val) => value == val.dealerName);
      if (select) {
        this.dataBase.distributorEmail = select.dealerEmail;
        this.dataBase.distributorPhone = select.dealerTelephone;
        this.dataBase.distributorAddress = select.registeredAddress;
        this.dataBase.ddpStatus = select.ddpStatus;
        this.dataBase.contractEndDate=select.ddpValidUntil;
      }
    }
    this.cd.detectChanges();
    if (this.dataBase.businessModel === 'DISTRIBUTOR' && this.dataBase.invoiceInformation === 'CNY') {
      this.dataBase.contractBuyer = this.dataBase.distributor;
      this.dataBase.contractBuyerAddress = this.dataBase.distributorAddress;
      this.dataBase.contractBuyerContacts = this.dataBase.distributorContacts;
      this.dataBase.contractBuyerPhone = this.dataBase.distributorPhone;
      this.dataBase.contractBuyerEmail = this.dataBase.distributorEmail;
      this.validateForm.controls.contractBuyer1.disable();
      this.validateForm.controls.contractBuyer2.disable();
    }
  }
  //选择经销商1
  // public changeAgentCnName1(value) {
  //   this.dataBase.contractBuyer1 = value;
  //   this.dataBase.contractBuyer = this.dataBase.contractBuyer1;
  //   if (this.distributorList && this.distributorList.length > 0) {
  //     let select = this.distributorList.find((val) => value == val.dealerName);
  //     this.dataBase.contractBuyerEmail = select.dealerEmail;
  //     this.dataBase.contractBuyerPhone = select.dealerTelephone;
  //     this.dataBase.contractBuyerAddress = select.registeredAddress;
  //     this.dataBase.contractDdpStatus = select.ddpStatus;
  //   }
  // }
  //选择iepool
  public changeAgentCnName() {
    // this.dataBase.contractBuyer2 = value?value:"";  
      
    this.dataBase.foreignTradeCompany = "";
    this.dataBase.foreignTradeCompanyAddress = "";
    this.dataBase.foreignTradeCompanyContacts = "";
    this.dataBase.foreignTradeCompanyPhone = "";
    this.dataBase.foreignTradeCompanyEmail = "";
    this.dataBase.poolEndDate="";
    // this.dataBase.contractBuyer = this.dataBase.contractBuyer2;
    this.dataBase.foreignTradeCompany = this.dataBase.contractBuyer2;
    if (this.poolList && this.poolList.length > 0) {
      let select = this.poolList.find((val) => this.dataBase.contractBuyer2 == val.corporateName);
      // this.dataBase.contractBuyerAddress = select.corporateAddress;
      this.dataBase.foreignTradeCompanyAddress = select && select.corporateAddress ? select.corporateAddress : "";
      this.dataBase.contractDdpStatus = select && select.ddpStatus ? select.ddpStatus : "";
      this.dataBase.poolEndDate = select && select.ddpValidUntil ? select.ddpValidUntil :"";
      this.foreignup();//是否禁用ddp-status
    }
  }
  public getDistributorList() {
    // 进单准备表-选择经销商
    this.http.get(`/act/preparation/chooseDistributor`).subscribe((rest => {
      if (rest.code === '0000') {
        this.distributorList = rest.data;
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    }), (error => {
      this.message.create("error", "请求异常")
    }));
  }
  public getPoolList() {
    // 进单准备表-IE Pool选择
    this.http.get(`/act/preparation/chooseIePool`).subscribe((rest => {
      if (rest.code === '0000') {        
        this.poolList = rest.data;
        if(this.dataBase.invoiceInformation=='USD')
        {
          const contractBuyer2=this.poolList.find(val=>val.corporateName==this.dataBase.foreignTradeCompany);          
          contractBuyer2&&(this.dataBase.contractBuyer2=contractBuyer2.corporateName);          
          this.foreignup();               
        } 
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    }), (error => {
      this.message.create("error", "请求异常")
    }));
  }
  public checkFormData = () => {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    return this.validateForm.valid;
  }
  // 业务模式
  public ngModelChang(state) {
    
    this.selectModelFile();
    this.ifBusinessModel();
    if (state === 'DIRECT') {
      this.dataBase.contractBuyer = this.dataBase.endUser;
      this.dataBase.contractBuyerAddress = this.dataBase.endUserAddress;
      this.dataBase.contractBuyerContacts = this.dataBase.endUserContacts;
      this.dataBase.contractBuyerPhone = this.dataBase.endUserPhone;
      this.dataBase.contractBuyerEmail = this.dataBase.endUserEmail;
    }
    if (state === 'DIRECT' && this.dataBase.invoiceInformation === 'CNY') {
      // this.dataBase.contractBuyer = this.dataBase.endUser;
      // this.dataBase.contractBuyerAddress = this.dataBase.endUserAddress;
      // this.dataBase.contractBuyerContacts = this.dataBase.endUserContacts;
      // this.dataBase.contractBuyerPhone = this.dataBase.endUserPhone;
      // this.dataBase.contractBuyerEmail = this.dataBase.endUserEmail;
      this.validateForm.controls.contractBuyer1.disable();
      this.validateForm.controls.contractBuyer2.disable();
    } else if (state === 'DISTRIBUTOR' && this.dataBase.invoiceInformation === 'CNY') {
      this.dataBase.contractBuyer = this.dataBase.distributor;
      this.dataBase.contractBuyerAddress = this.dataBase.distributorAddress;
      this.dataBase.contractBuyerContacts = this.dataBase.distributorContacts;
      this.dataBase.contractBuyerPhone = this.dataBase.distributorPhone;
      this.dataBase.contractBuyerEmail = this.dataBase.distributorEmail;
      this.validateForm.controls.contractBuyer1.disable();
      this.validateForm.controls.contractBuyer2.disable();
    }
  }
  // 进单模式
  public getEntryModeList() {
    const params = {
      dictGroup: 'ENTRY_MODEL',
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
      if (rest.code === '0000') {
        this.entryModeList = rest.data;
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }
  // 业务模式
  public getBusinessModelList() {
    const params = {
      dictGroup: 'BUSINESS_MODEL',
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
      if (rest.code === '0000') {
        this.businessModelList = rest.data;
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }

  // 进单模式
  public changeEntryMode(state: any, value: any) {    
    this.entryMode = this.dataBase.entryMode;
    this.selectModelFile();
    this.ifBusinessModel();
    if (state === 'STOCK') {
      /*业务模式 插眼*/

      /* 业务模式为stock时 以下字段为非必选项目 */
      // 投标公司               tenderingCompany
      // 招标编号               tenderNo
      // 进口协议签署人职务      importAgreementSignPost
      // 最终用户                endUser
      // 医院性质                hospitalNature
      // 最终用户地址            endUserAddress
      // 最终用户联系人           endUserContacts
      // 最终用户电话             endUserPhone
      /*end*/
      this.validateForm.get('tenderingCompany')!.clearValidators();
      this.validateForm.get('tenderingCompany')!.markAsPristine();
      this.validateForm.get('tenderNo')!.clearValidators();
      this.validateForm.get('tenderNo')!.markAsPristine();
      this.validateForm.get('endUser')!.clearValidators();
      this.validateForm.get('endUser')!.markAsPristine();
      this.validateForm.get('hospitalNature')!.clearValidators();
      this.validateForm.get('hospitalNature')!.markAsPristine();
      this.validateForm.get('endUserAddress')!.clearValidators();
      this.validateForm.get('endUserAddress')!.markAsPristine();
      this.validateForm.get('endUserContacts')!.clearValidators();
      this.validateForm.get('endUserContacts')!.markAsPristine();
      this.validateForm.get('endUserPhone')!.clearValidators();
      this.validateForm.get('endUserPhone')!.markAsPristine();
      this.validateForm.get('endUserPhone')!.setValidators([this.checkPhone]);
      this.validateForm.get('importAgreementSignPost')!.clearValidators();
      this.validateForm.get('importAgreementSignPost')!.markAsPristine();
      this.validateForm.get('endUserEmail')!.clearValidators();
      this.validateForm.get('endUserEmail')!.markAsPristine();
      this.validateForm.get('endUserEmail')!.setValidators([this.cheakMail]);
     ;      
    } else {
      this.validateForm.get('tenderingCompany')!.setValidators(Validators.required);
      // this.validateForm.get('tenderingCompany')!.markAsDirty();
      this.validateForm.get('tenderNo')!.setValidators(Validators.required);
      // this.validateForm.get('tenderNo')!.markAsDirty();
      this.validateForm.get('endUser')!.setValidators(Validators.required);
      // this.validateForm.get('endUser')!.markAsDirty();
      this.validateForm.get('hospitalNature')!.setValidators(Validators.required);
      // this.validateForm.get('hospitalNature')!.markAsDirty();
      this.validateForm.get('endUserAddress')!.setValidators(Validators.required);
      // this.validateForm.get('endUserAddress')!.markAsDirty();
      this.validateForm.get('endUserContacts')!.setValidators(Validators.required);
      // this.validateForm.get('endUserContacts')!.markAsDirty();
      this.validateForm.get('endUserPhone')!.setValidators([Validators.required,this.checkPhone]);
      // this.validateForm.get('endUserPhone')!.markAsDirty();
      this.validateForm.get('importAgreementSignPost')!.setValidators(Validators.required);
      // this.validateForm.get('importAgreementSignPost')!.markAsDirty();
      this.validateForm.get('endUserEmail')!.setValidators([Validators.required,this.cheakMail]);
    }
    this.validateForm.get('tenderingCompany')!.updateValueAndValidity();
    this.validateForm.get('tenderNo')!.updateValueAndValidity();
    this.validateForm.get('endUser')!.updateValueAndValidity();
    this.validateForm.get('hospitalNature')!.updateValueAndValidity();
    this.validateForm.get('endUserAddress')!.updateValueAndValidity();
    this.validateForm.get('endUserContacts')!.updateValueAndValidity();
    this.validateForm.get('endUserPhone')!.updateValueAndValidity();
    this.validateForm.get('importAgreementSignPost')!.updateValueAndValidity();
    this.validateForm.get('endUserEmail')!.updateValueAndValidity();    
    this.updateDataBaseInfo.emit(value);
  }
  ngAfterViewInit() {
    this.cd.detectChanges();
  }
  ngOnChanges(changes:SimpleChange) {
    
    console.log(this.dataBase.detail.flag)
    if(this.dataBase.invoiceInformation=='USD')
    {
      this.getPoolList();
    }
    this.setType();
    if (this.dataBase) {
      if (this.dataBase.entryMode && this.dataBase.entryMode == 'BIDDING') {
        this.getWinUrl();
      } 
    }
    if (this.dataBase.financialProgramme == "2") {
      this.financiaWidth = "7"
    }
    else {
      this.financiaWidth = "14"
    }   
    this.viewData("bidWinningNotice", "bidWinningNoticeFileList", this.dataBase.bidWinningNoticeNames);
    this.viewData("siteReport", "siteReportFileList", this.dataBase.siteReportNames);
    this.viewData("projectSolutions", "projectSolutionsFileList", this.dataBase.projectSolutionsNames);
    this.viewData("biddingDocuments", "biddingDocumentsFileList", this.dataBase.biddingDocumentsNames);
    this.viewData("endUserContract", "endUserContractFileList", this.dataBase.endUserContractNames);
    this.viewData("paymentProvisionFileName", "paymentProvisionFileNameList", this.dataBase.paymentProvisionFileNames);
    this.viewData("shipmentDeliveryFileName", "shipmentDeliveryList", this.dataBase.shipmentDeliveryFileNames);
    this.viewData("installationWarrantyFileName", "installationWarrantyList", this.dataBase.installationWarrantyFileNames);
    this.viewData("amountDifferenceFileName", "amountDifferenceList", this.dataBase.amountDifferenceFileNames);
    this.viewData("sitePreparationFileName", "sitePreparatList", this.dataBase.sitePreparationFileNames);
    this.viewData("performanceBondFileName", "performanceBondList", this.dataBase.performanceBondFileNames);
    this.viewData("supportFileMissingFileName", "supportFileMissingList", this.dataBase.supportFileMissingFileNames);
    this.viewData("otherFilName", "otherFilNameList", this.dataBase.otherFilNames);
    this.viewData("projectAnalysisTable", "projectAnalysisTableFileList", this.dataBase.projectAnalysisTableNames);
    this.viewData("tenderDocuments", "tenderDocumentsList", this.dataBase.tenderDocumentsNames);
    this.viewData("confirmationFile", "confirmationFileFileList", this.dataBase.confirmationFileNames);
    this.viewData("mrShieldingCompany", "mrShieldingCompanyList", this.dataBase.mrShieldingCompanyNames);
    this.setColSpanOfConfirmTable();    
    this.setBaseInfor();
  }
  //招标编号
  keyupNo()
  {
   this.setType();
   this.selectModelFile();
  }
//招标文件的编辑类型
  setType()
  {
    if(this.dataBase.hospitalNature=='民营医院')
    {
      this.demandLetter="场地勘验报告";
    }
    else{
      if(this.dataBase.tenderNo!='其它类型')
      {
        this.demandLetter="要货函";
      }
      else{
        this.demandLetter="场地勘验报告";
      }
    }
  }
  //项目分析表
  nzRemovprojectAnalysisTable = (file: UploadFile): any => {
    this.dataBase.projectAnalysisTable = "";
    return true;
  }
  //最终用户合同
  nzRemovendUserContract = (file: UploadFile): any => {
    this.dataBase.endUserContract = "";
    return true;
  }
  //投标文件
  nzRemovtenderDocuments = (file: UploadFile): any => {
    this.dataBase.tenderDocuments = "";
    return true;
  }
  //招标文件
  nzRemovbiddingDocuments = (file: UploadFile): any => {
    this.dataBase.biddingDocuments = "";
    return true;
  }
  //项目解决方案售前支持报告
  nzRemovprojectSolutions = (file: UploadFile): any => {
    this.dataBase.projectSolutions = "";
    return true;
  }
  //场地报告要货函
  nzRemovsiteReport = (file: UploadFile): any => {
    this.dataBase.siteReport = "";
    return true;
  }
  //中标通知书
  nzRemovbidWinningNotice = (file: UploadFile): any => {
    this.dataBase.bidWinningNotice = "";
    return true;
  }
  //支持文件缺失需特批进单
  nzRemovsupportFileMissing = (file: UploadFile): any => {
    this.dataBase.supportFileMissingFileName = "";
    return true;
  }
  //直投订单合同金额和中标金额有价差
  nzRemovamountDifference = (file: UploadFile): any => {
    this.dataBase.amountDifferenceFileName = "";
    return true;
  }
  //其它
  nzRemovother = (file: UploadFile): any => {
    this.dataBase.otherFilName = "";
    return true;
  }
  //履约保函
  nzRemovperformanceBond = (file: UploadFile): any => {
    this.dataBase.performanceBondFileName = "";
    return true;
  }
  //安装及保修
  nzRemovinstallationWarranty = (file: UploadFile): any => {
    this.dataBase.installationWarrantyFileName = "";
    return true;
  }
  //删除场地报告
  nzRemovsitePreparation = (file: UploadFile): any => {
    this.dataBase.sitePreparationFileName = "";
    return true;
  }
  //删除装运及交货
  nzRemovshipmentDelivery = (file: UploadFile): any => {
    this.dataBase.shipmentDeliveryFileName = "";
    return true;
  }
  //删除付款条款附件
  nzRemovpaymentProvision = (file: UploadFile): any => {
    this.dataBase.paymentProvisionFileName = "";
    return true;
  }
  //删除磁屏蔽
  nzRemovmrShieldingCompany = (file: UploadFile): any => {
    this.dataBase.mrShieldingCompany = "";
    return true;
  }
  //删除塔吊文件
  nzRemovconfirmationFile = (file: UploadFile,): any => {
    this.dataBase.confirmationFile = "";
    return true;
  }
  //直投或非直投的需要上传和显示的文件
  selectModelFile()
  {
    if (this.dataBase.detail.status == "" || this.dataBase.detail.status == "DHTGYBTX"||this.dataBase.detail.status == "XJDHTGYBTX"||this.dataBase.detail.status == "DBCWJSC") {
      this.rowspans = 2;
      this.modelTalbe = true;
      if(this.dataBase.businessModel!='DIRECT')
      {
        this.sampleRow = 5;
      }
      else{
        if(this.dataBase.tenderNo!='其他类型')
        {
          this.sampleRow = 3;
        }
        else{
          this.sampleRow = 1;
        }
        
      }
      
    }
    else {
      this.rowspans = 1;
      this.modelTalbe = false;
      if(this.dataBase.businessModel!='DIRECT')
      {
        this.sampleRow = 4;
      }
      else{
        if(this.dataBase.tenderNo!='其他类型')
        {
          this.sampleRow = 3;
        }
        else{
          this.sampleRow = 1;
        }
        
      }
    }
  }
  
  setBaseInfor()  //设置合同概要表其它信息
  {
    if (this.dataBase.detail.status && this.dataBase.detail.status !== 'DOACS' || this.showChek) {
      if (this.dataBase.other === undefined) {
        this.dataBase.other = 'false,false,false,false,false,false,false';
      }
      if (!this.dataBase.other1) {
        this.dataBase.other1 = false;
      }
      if (!this.dataBase.other2) {
        this.dataBase.other2 = false;
      }
      if (!this.dataBase.other3) {
        this.dataBase.other3 = false;
      }
      if (!this.dataBase.other4) {
        this.dataBase.other4 = false;
      }
      if (!this.dataBase.other5) {
        this.dataBase.other5 = false;
      }
      if (!this.dataBase.other6) {
        this.dataBase.other6 = false;
      }
      if (!this.dataBase.other7) {
        this.dataBase.other7 = false;
      }
      const arr = this.dataBase.other.split(',');
      arr.map((item, index) => {
        if (item === 'true') {
          arr[index] = true;
        }
        if (item === 'false') {
          arr[index] = false;
        }
      });
      this.otherFile = arr.some(res => res === 'true') //控制备注、复制按钮的显示与否;
      this.dataBase.other1 = arr[0];
      this.dataBase.other2 = arr[1];
      this.dataBase.other3 = arr[2];
      this.dataBase.other4 = arr[3];
      this.dataBase.other5 = arr[4];
      this.dataBase.other6 = arr[5];
      this.dataBase.other7 = arr[6];
    }
  }
  public ngOnInit(): void {


    this.getEntryModeList();
    this.getBusinessModelList();
    this.getfinancialList();
    this.oaDisa = this.disa;

    this.taskId = this.activatedRouter.queryParams['_value'].taskID;
    this.validateForm = this.fb.group({
      freeText: new FormControl({ value: 'Nancy', disabled: this.disa }),
      contractEndDate: new FormControl({ value: 'Nancy', disabled:true}, Validators.required), //经销商ddp结束日期
      poolEndDate: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required), //外贸公司ddp结束日期
      financialProgrammeCost:new FormControl({ value: 'Nancy', disabled:true}), //金融金额
      financialProgramme: new FormControl({ value: 'Nancy', disabled:true}), //金融方案  
      financialProgrammeTxt:new FormControl({ value: 'Nancy', disabled:true}), //金融文本框
      tradeInCost:new FormControl({ value: 'Nancy', disabled:true}), //tradeIn金额
      rebateCost:new FormControl({ value: 'Nancy', disabled:true}),//rebate金额
      ddpStatus: new FormControl({ value: 'Nancy', disabled:true}, Validators.required),
      billingInfor: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      contractBuyer: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      contractBuyer1: new FormControl({ value: 'Nancy', disabled: this.disa }),
      contractBuyer2: new FormControl({ value: 'Nancy', disabled: this.disa }),
      businessModel: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      region: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      distributorAddress: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      distributorContacts: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      distributorPhone: new FormControl({ value:'', disabled: this.disa },[Validators.required,this.checkPhone]),
      distributorEmail: new FormControl({ value: 'Nancy', disabled: this.disa }, [Validators.required,this.cheakMail]),
      orderSignName: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      orderSignPost: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      contractDdpStatus: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      contractBuyerAddress: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      contractBuyerContacts: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      contractBuyerPhone: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      contractBuyerEmail: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      importAgreementSignName: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      importAgreementSignPost: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      endUserEmail: new FormControl({ value: 'Nancy', disabled: this.disa }, [Validators.required,this.cheakMail]),
      endUser: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      endUserContacts: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      endUserPhone: new FormControl({ value: 'Nancy', disabled: this.disa }, [Validators.required]),
      endUserAddress: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      sampleAuditFlag: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      hospitalNature: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      invoiceInformation: new FormControl({ value: 'Nancy', disabled: true }, Validators.required),
      distributor: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      distributor1: new FormControl({ value: 'Nancy', disabled: this.disa }),
      tenderingCompany: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      tenderNo: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      entryMode: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      paymentProvision: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),//合同概要表和进单装备表的基础验证差别
      shipmentDelivery: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      installationWarranty: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      // installationWarrantyRadio: new FormControl({value: 'Nancy', disabled: this.disa}, null), // 下一级是否审核
      amountDifference: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      train: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      sitePreparation: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      performanceBond: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      supportFileMissing: new FormControl({ value: 'Nancy', disabled: this.disa },),
      supportFileMissingRemarks: new FormControl({ value: 'Nancy', disabled: this.disa },),
      punishment: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      other: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      other1: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      other2: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      other3: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      other4: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      other5: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      other6: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      other7: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      paymentProvisionRemarks: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      shipmentDeliveryRemarks: new FormControl({ value: '', disabled: this.disa }, Validators.required),
      installationWarrantyRemarks: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      amountDifferenceRemarks: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      sitePreparationRemarks: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      performanceBondRemarks: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      otherRemarks: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required),
      contractPrice: new FormControl({ value: 'Nancy', disabled:true}, Validators.required),
      productModel: new FormControl({ value: 'Nancy', disabled:true}, Validators.required),
      nmpaName: new FormControl({ value: 'Nancy', disabled:true}, Validators.required),
      installationWarrantyRadio: new FormControl({ value: 'Nancy', disabled: this.disa || this.dataBase.detail.status == 'DHTGYBTX'||this.dataBase.detail.status == 'XJDHTGYBTX' }, Validators.required),

      foreignTradeCompany: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required), // 外贸公司
      foreignTradeCompanyAddress: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required), // 外贸地址
      foreignTradeCompanyContacts: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required), // 外贸联系人
      foreignTradeCompanyPhone: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required), // 外贸公司电话
      foreignTradeCompanyEmail: new FormControl({ value: 'Nancy', disabled: this.disa }, [Validators.required,this.cheakMail]), // 外贸公司邮箱
      sameFlag: new FormControl({ value: 'Nancy', disabled: this.disa }, null), // 外贸公司是否与经销商相同
      contractSignatory: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required), // 合同签署人
      contractSignatoryPost: new FormControl({ value: 'Nancy', disabled: this.disa }, Validators.required), // 合同签署人职务
    });
    //this.dataBase.sameFlag = '0';
    if (this.dataBase.detail.status === '' || this.showChek === false) {
      this.validateForm.get('paymentProvision')!.clearValidators();
      // this.validateForm.get('paymentProvision')!.markAsPristine();
      this.validateForm.get('installationWarrantyRadio')!.clearValidators();
      // this.validateForm.get('installationWarrantyRadio')!.markAsPristine();
      this.validateForm.get('shipmentDelivery')!.clearValidators();
      // this.validateForm.get('shipmentDelivery')!.markAsPristine();
      this.validateForm.get('installationWarranty')!.clearValidators();
      // this.validateForm.get('installationWarranty')!.markAsPristine();
      this.validateForm.get('amountDifference')!.clearValidators();
      // this.validateForm.get('amountDifference')!.markAsPristine();
      this.validateForm.get('train')!.clearValidators();
      // this.validateForm.get('train')!.markAsPristine();
      this.validateForm.get('sitePreparation')!.clearValidators();
      // this.validateForm.get('sitePreparation')!.markAsPristine();
      this.validateForm.get('performanceBond')!.clearValidators();
      // this.validateForm.get('performanceBond')!.markAsPristine();
      this.validateForm.get('punishment')!.clearValidators();
      // this.validateForm.get('punishment')!.markAsPristine();
      this.validateForm.get('other')!.clearValidators();
      // this.validateForm.get('other')!.markAsPristine();
      this.validateForm.get('paymentProvisionRemarks')!.clearValidators();
      // this.validateForm.get('paymentProvisionRemarks')!.markAsPristine();
      this.validateForm.get('shipmentDeliveryRemarks')!.clearValidators();
      // this.validateForm.get('shipmentDeliveryRemarks')!.markAsPristine();
      this.validateForm.get('installationWarrantyRemarks')!.clearValidators();
      // this.validateForm.get('installationWarrantyRemarks')!.markAsPristine();
      this.validateForm.get('amountDifferenceRemarks')!.clearValidators();
      // this.validateForm.get('amountDifferenceRemarks')!.markAsPristine();
      this.validateForm.get('sitePreparationRemarks')!.clearValidators();
      // this.validateForm.get('sitePreparationRemarks')!.markAsPristine();
      this.validateForm.get('performanceBondRemarks')!.clearValidators();
      // this.validateForm.get('performanceBondRemarks')!.markAsPristine();
      this.validateForm.get('otherRemarks')!.clearValidators();
      // this.validateForm.get('otherRemarks')!.markAsPristine();
      this.validateForm.get('contractPrice')!.clearValidators();
      // this.validateForm.get('contractPrice')!.markAsPristine();
      this.validateForm.get('productModel')!.clearValidators();
      // this.validateForm.get('productModel')!.markAsPristine();
      this.validateForm.get('nmpaName')!.clearValidators();
      // this.validateForm.get('nmpaName')!.markAsPristine();
    }
    this.validateForm.get('installationWarrantyRadio')!.updateValueAndValidity();
    this.validateForm.get('paymentProvision')!.updateValueAndValidity();
    this.validateForm.get('shipmentDelivery')!.updateValueAndValidity();
    this.validateForm.get('installationWarranty')!.updateValueAndValidity();
    this.validateForm.get('amountDifference')!.updateValueAndValidity();
    this.validateForm.get('train')!.updateValueAndValidity();
    this.validateForm.get('sitePreparation')!.updateValueAndValidity();
    this.validateForm.get('performanceBond')!.updateValueAndValidity();
    this.validateForm.get('punishment')!.updateValueAndValidity();
    this.validateForm.get('other')!.updateValueAndValidity();
    this.validateForm.get('paymentProvisionRemarks')!.updateValueAndValidity();
    this.validateForm.get('shipmentDeliveryRemarks')!.updateValueAndValidity();
    // this.validateForm.get('installationWarrantyRemarks')!.markAsPristine();
    // this.validateForm.get('amountDifferenceRemarks')!.markAsPristine();
    // this.validateForm.get('sitePreparationRemarks')!.markAsPristine();
    // this.validateForm.get('performanceBondRemarks')!.markAsPristine();
    // this.validateForm.get('otherRemarks')!.markAsPristine();
    // this.validateForm.get('contractPrice')!.markAsPristine();
    // this.validateForm.get('productModel')!.markAsPristine();
    // this.validateForm.get('nmpaName')!.markAsPristine();
    const status = this.dataBase.detail.status; 
    const flag=this.dataBase.detail.flag;
    this.setType();
    if(status=='XJDHTGYBTX'||status=='DHTGYBTX')
    {
      this.validateForm.controls.tenderNo.disable();
      this.validateForm.controls.businessModel.disable(); 
      this.validateForm.controls.region.disable();
      this.validateForm.controls.tenderingCompany.disable();
      this.validateForm.controls.entryMode.disable();
    }
    if (status === 'DHTOASH'&&flag=='0')  //如果是oa审核节点放开备注的禁用
    {
      this.validateForm.controls.paymentProvisionRemarks.enable();
      this.validateForm.controls.shipmentDeliveryRemarks.enable();
      this.validateForm.controls.installationWarrantyRemarks.enable();
      this.validateForm.controls.amountDifferenceRemarks.enable();
      this.validateForm.controls.sitePreparationRemarks.enable();
      this.validateForm.controls.otherRemarks.enable();
      this.validateForm.controls.performanceBondRemarks.enable();
      this.validateForm.controls.supportFileMissingRemarks.enable();
      this.validateForm.controls.installationWarrantyRadio.enable();
      this.oaDisa = false;
    }
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
  public searchCPResult(): void {
    // 清空
    this.dealFormIdinput = '';
    this.dealformlist = [];
    //this.ckdealformlist = {};
    this.box = false;
    this.isVisibleCPResult = true;
  }


  // 电话号码正则表达式的验证
  checkPhone(control: FormControl) {
    if (control.value) {
      //const reg = /^1[3|4|5|7|8][0-9]{9}$/; // 验证规则
      // const reg = /^([\d\+\-\*\/x]\d{0,15}$)*$/
      //const reg=/^([\d +()-\s]{0,20}$)$/;
      const reg=/^([\d +()-\s]{0,1000}$)$/;
      const phoneNum = '15507621999'; // 手机号码
      const valid = reg.test(control.value); // true
      return valid ? null : { phoneform: true };
    }
  }
  //邮箱的正则表大式
  cheakMail(control: FormControl)
  {
    if (control.value) {
      //const reg=/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/; 
      //const reg=/^[0-9a-zA-Z_\@\.\s\-]*$/g;  
      const reg=/^(?!\@)+(?!\_)+[0-9a-zA-Z_\@\.\s\-]*$/g; 
      const valid = reg.test(control.value); // true
      return valid ? null : { mailform: true };
    }    
  }
  // public handleOkCPResult(): void {

  //   // 清空原有数据
  //   // this.validateForm.reset();

  //   const ASYNS = async () => {
  //     let dealFormId = this.dataBase.dealFormId;
  //     if (dealFormId != null && dealFormId != undefined && dealFormId != "") {
  //       let getcp = await this.getCPDetails();
  //       await this.getProduct(dealFormId);
  //     }
  //     else {
  //       this.message.create("warning", "请输入dealFormId")
  //     }
  //   }
  //   ASYNS()
  // }
  public clearFrom() {

    this.dataBase = {
      productList: [], // 产品列表
      detail: {
        id: '',
        flag: '0',
        status: '',
      },
      dataList: [],
      count: 0,
      sameFlag: "0",
    };
    this.dataBase.siteReport = "";
    this.dataBase.confirmationFile = "";
    this.dataBase.mrShieldingCompany = "";
    this.dataBase.paymentProvisionFileName = "";
    this.dataBase.shipmentDeliveryFileName = "";
    this.dataBase.sitePreparationFileName = "";
    this.dataBase.installationWarrantyFileName = "";
    this.dataBase.performanceBondFileName = "";
    this.dataBase.amountDifferenceFileName = "";
    this.dataBase.supportFileMissingFileName = "";
    this.dataBase.bidWinningNotice = "";
    this.dataBase.projectSolutions = "";
    this.dataBase.tenderDocuments = "";
    this.dataBase.endUserContract = "";
    this.dataBase.projectAnalysisTable = "";
    this.dataBase.otherFilName = "";
    this.siteReportFileList = [];
    this.projectAnalysisTableFileList = [];
    this.confirmationFileFileList = [];
    this.paymentProvisionFileNameList = [];
    this.projectSolutionsFileList = [];
    this.biddingDocumentsFileList = [];
    this.endUserContractFileList = [];
    this.paymentProvisionFileNameList = [];
    this.shipmentDeliveryList = [];
    this.installationWarrantyList = [];
    this.amountDifferenceList = [];
    this.sitePreparatList = [];
    this.performanceBondList = [];
    this.supportFileMissingList = [];
    this.otherFilNameList = [];
    this.mrShieldingCompanyList = [];
    this.tenderDocumentsList = [];
    this.dataBase.tableColOff=false;
    this.dataBase.financialProgramme=""; 
  }
  public handleOkCPResult2() {
    if (this.dealformlist.length < 1) {
      this.message.create('error', '请先点击查询');
      return;
    } 
    if (!this.ckdealformlist.radio) {
      this.message.create('error', '未选择Deal Form ID');
      return;
    }
    this.validateForm.reset();
    this.clearFrom();
    
    this.dataBase.dealFormId = this.ckdealformlist.dealFormId;
    // for (const key in this.validateForm.controls) {
    //   this.validateForm.controls[key].markAsPristine()
    //   this.validateForm.controls[key].updateValueAndValidity()
    // }
    if (this.ckdealformlist) {
      setTimeout(() => {
        this.dataBase.entryMode = this.entryMode ? this.entryMode : "";
        this.dataBase.entryUnitPrice = "";//所有进单单总价;
        this.dataBase.dealContractPrice = this.ckdealformlist.dealPrice; //deal总价
        this.dataBase.businessModel = this.ckdealformlist.businessModel; //业务模式;
        this.dataBase.region = this.ckdealformlist.region + '/' + this.ckdealformlist.residentialQuarters; //区域
        this.dataBase.tenderNo = this.ckdealformlist.tenderNo;//招标编号
        this.dataBase.tenderingCompany = this.ckdealformlist.biddingCompanyName; //投标公司
        this.dataBase.distributor = this.ckdealformlist.dealerName; //经销商
        this.dataBase.ddpStatus = this.ckdealformlist.ddpStatus //ddp状态 经销商
        this.dataBase.distributorAddress = this.ckdealformlist.registeredAddress; //经销商地址
        this.dataBase.distributorPhone = this.ckdealformlist.dealerTelephone; //经销商电话
        this.dataBase.distributorEmail = this.ckdealformlist.dealerEmail; //邮箱地址
        this.dataBase.billingInfor = this.ckdealformlist.vatBillingInfo; //开票信息
        this.dataBase.contractDdpStatus = this.ckdealformlist.ddpStatus1; //外贸公司的ddp状态
        this.dataBase.contractBuyerAddress = this.ckdealformlist.registeredAddress; //合同买方地址
        this.dataBase.contractBuyerEmail = this.ckdealformlist.dealerEmail; //合同邮箱
        this.dataBase.endUser = this.ckdealformlist.hospitalName; //最终用户
        this.dataBase.hospitalNature = this.ckdealformlist.customerType; //医院性质
        this.dataBase.endUserAddress = this.ckdealformlist.endUserAddress; //最终用户地址
        this.dataBase.endUserPhone = this.ckdealformlist.endUserPhone; //最终用户电话
        this.dataBase.invoiceInformation = this.ckdealformlist.currencySystem //币制
        this.dataBase.sampleAuditFlag = this.ckdealformlist.samplingInspection //是否抽样审核
        this.dataBase.foreignTradeCompany = this.ckdealformlist.foreignCompanyName.replace(/\s+/g,""); //外贸公司
        this.dataBase.foreignTradeCompanyAddress = this.ckdealformlist.foreignTradeCompanyAddress //外贸公司
        this.dataBase.foreignTradeCompanyContacts = this.ckdealformlist.foreignCompanyContact; //外贸公司联系人
        this.dataBase.foreignTradeCompanyPhone = this.ckdealformlist.foreignCompanyContactInformation //外贸公司电话
        this.dataBase.sonfonFile = this.ckdealformlist.sonfonFile;
        this.dataBase.financialProgramme=this.ckdealformlist.financialSchemeId!=""?this.ckdealformlist.financialSchemeId:'0'; //金融方案
        this.dataBase.financialProgrammeTxt=this.ckdealformlist.otherFinancialSolutions;//金融方案文本框
        this.dataBase.financialProgrammeCost=this.ckdealformlist.financialProgrammePrice;//金融方案总价格
        this.dataBase.rebateCost=this.ckdealformlist.rebateCost; //rebate金额
        this.dataBase.tradeInCost=this.ckdealformlist.tradeInCost; //tradeIn金额
        //financialProgrammeCost
        this.dataBase.contractEndDate=this.ckdealformlist.ddpValidUntil;
        this.dataBase.poolEndDate= this.ckdealformlist.ddpValidUntil1;
      }, 0); 
      if(this.dataBase.invoiceInformation=='USD')
      {
        const contractBuyer2=this.poolList.find(val=>val.corporateName==this.dataBase.foreignTradeCompany);
        contractBuyer2&&(this.dataBase.contractBuyer2=contractBuyer2.corporateName);
        this.foreignup();
      }      
      //this.dataBase = Object.assign(this.dataBase, rest.data);
      if (this.dataBase.businessModel === 'DIRECT' && this.dataBase.invoiceInformation == 'CNY') {
        this.dataBase.contractBuyer = this.dataBase.endUser;
        this.dataBase.contractBuyerAddress = this.dataBase.endUserAddress;
        this.dataBase.contractBuyerContacts = this.dataBase.endUserContacts;
        this.dataBase.contractBuyerPhone = this.dataBase.endUserPhone;
        this.dataBase.contractBuyerEmail = this.dataBase.endUserEmail;
        this.validateForm.controls.contractBuyer1.disable();
        this.validateForm.controls.contractBuyer2.disable();
      } else if (this.dataBase.businessModel === 'DISTRIBUTOR' && this.dataBase.invoiceInformation == 'CNY') {
        this.dataBase.contractBuyer = this.dataBase.distributor;
        this.dataBase.contractBuyerAddress = this.dataBase.distributorAddress;
        this.dataBase.contractBuyerContacts = this.dataBase.distributorContacts;
        this.dataBase.contractBuyerPhone = this.dataBase.distributorPhone;
        this.dataBase.contractBuyerEmail = this.dataBase.distributorEmail;
        this.validateForm.controls.contractBuyer1.disable();
        this.validateForm.controls.contractBuyer2.disable();
      }
      // this.updateData.emit(this.dataBase);
      this.setColSpanOfConfirmTable();
      this.ngModelChang(this.dataBase.businessModel);
    }
    this.getProduct(this.ckdealformlist.dealFormId);
  }

  public changeDealFormID(): void {
    this.updateDataBaseInfo.emit(this.dataBase);
  }

  public handleCancelCPResult(): void {
    this.isVisibleCPResult = false;
  }

  public jump(result, url, name) {
    this.router.navigate([result], {
      queryParams: {
        url, name
      }
    });
  }
  public next() {
    this.myEvent.emit('complete-tab'); // 传参给父组件;
  }
  public submitForm = ($event: any, value: any) => {
    $event.preventDefault();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
      this.validateForm.controls[key].updateValueAndValidity();
    }
    this.updateDataBaseInfo.emit(value);
  }

  public resetForm(e: MouseEvent): void {
    e.preventDefault();
    this.validateForm.reset();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsPristine();
      this.validateForm.controls[key].updateValueAndValidity();
    }
  }

  public validateConfirmPassword(): void {
    setTimeout(() => this.validateForm.controls.confirm.updateValueAndValidity());
  }
  public userNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      setTimeout(() => {
        if (control.value === 'JasonWood') {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      }, 1000);
    })

  public confirmValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.validateForm.controls.password.value) {
      return { confirm: true, error: true };
    }
    return {};
  }


  // 判断业务模式 移除指定控制器
  ifBusinessModel() {
    /*业务模式为 Direct Deal  删除经销商*/
    if (this.dataBase && this.dataBase.businessModel === 'DIRECT') {
      this.validateForm.get('distributor')!.clearValidators(); // 经销商
      this.validateForm.get('ddpStatus')!.clearValidators(); // DDP-Status

      this.validateForm.get('poolEndDate')!.clearValidators(); //外贸公司DDP-Status截止日期
      this.validateForm.get('distributorAddress')!.clearValidators(); // 经销商地址
      this.validateForm.get('distributorContacts')!.clearValidators(); // 经销商联系人
      this.validateForm.get('distributorPhone')!.clearValidators(); // 经销商电话
      this.validateForm.get('distributorEmail')!.clearValidators(); // 经销商邮箱
      this.validateForm.get('orderSignName')!.clearValidators(); // 采购订单签署人
      this.validateForm.get('orderSignPost')!.clearValidators(); // 采购订单签署人职务
      /*添加合同买方*/

      this.validateForm.get('contractBuyer')!.setValidators(Validators.required); // 合同买方
      this.validateForm.get('contractBuyerAddress')!.setValidators(Validators.required); // 合同买方地址
      this.validateForm.get('contractSignatory')!.setValidators(Validators.required); // 合同签署人
      this.validateForm.get('contractSignatoryPost')!.setValidators(Validators.required); // 采购订单签署人职务

    } else {
      /*业务模式为 DISTRIBUTOR  添加经销商*/
      this.validateForm.get('distributor')!.setValidators(Validators.required);
      this.validateForm.get('ddpStatus')!.setValidators(Validators.required);
      this.validateForm.get('contractEndDate')!.setValidators(Validators.required);
      this.validateForm.get('poolEndDate')!.setValidators(Validators.required);
      this.validateForm.get('distributorAddress')!.setValidators(Validators.required);
      this.validateForm.get('distributorContacts')!.setValidators(Validators.required);
      this.validateForm.get('distributorPhone')!.setValidators([Validators.required,this.checkPhone]);
      this.validateForm.get('distributorEmail')!.setValidators([Validators.required,this.cheakMail]);
      this.validateForm.get('orderSignName')!.setValidators(Validators.required);
      this.validateForm.get('orderSignPost')!.setValidators(Validators.required);
      /*删除合同买方*/

      this.validateForm.get('contractBuyer')!.clearValidators(); // 合同买方
      this.validateForm.get('contractBuyerAddress')!.clearValidators(); // 合同买方地址
      this.validateForm.get('contractSignatory')!.clearValidators(); // 合同签署人
      this.validateForm.get('contractSignatoryPost')!.clearValidators(); // 采购订单签署人职务
    }
    if (this.dataBase && this.dataBase.businessModel === 'DIRECT' && this.dataBase.invoiceInformation === 'USD') {
      this.validateForm.get('contractEndDate')!.clearValidators(); //经销商DDP-Status截止日期
      this.validateForm.get('poolEndDate')!.setValidators(Validators.required);
    }
    else if (this.dataBase && this.dataBase.businessModel === 'DIRECT' && this.dataBase.invoiceInformation === 'CNY') {
      this.validateForm.get('contractEndDate')!.clearValidators();
      this.validateForm.get('poolEndDate')!.clearValidators();
    }
    else if (this.dataBase && this.dataBase.businessModel === 'DISTRIBUTOR' && this.dataBase.invoiceInformation === 'USD') {
      this.validateForm.get('contractEndDate')!.setValidators(Validators.required);
      this.validateForm.get('poolEndDate')!.setValidators(Validators.required);
    }
    else if (this.dataBase && this.dataBase.businessModel === 'DISTRIBUTOR' && this.dataBase.invoiceInformation === 'CNY') {
      this.validateForm.get('contractEndDate')!.setValidators(Validators.required);
      this.validateForm.get('poolEndDate')!.clearValidators();
    }
    this.validateForm.get('poolEndDate')!.updateValueAndValidity();
    this.validateForm.get('contractEndDate')!.updateValueAndValidity();
  }

  // 判断业务模式和币制
  ifInvoiceInformation() {
    /*业务模式为 Direct Deal*/
    if (this.dataBase && this.dataBase.businessModel === 'DIRECT') {
      if (this.dataBase && this.dataBase.invoiceInformation === 'CNY') {
        /*人民币*/
      } else if (this.dataBase && this.dataBase.invoiceInformation === 'USD') {
        /*美元*/
      }
    } else if (this.dataBase && this.dataBase.businessModel === 'DISTRIBUTOR') {
      /*业务模式为 Distributor Deal*/
      /*人民币*/
      if (this.dataBase && this.dataBase.invoiceInformation === 'CNY') {

      } else if (this.dataBase && this.dataBase.invoiceInformation === 'USD') {
        /*美元*/

      }
    }
  }
  ifForeignTradeCompany() {
    /* 币制 为 人民币 */
    /* 外贸公司不显示 */
    if (this.dataBase && this.dataBase.invoiceInformation === 'CNY') {
      /* 删除外贸公司验证 */
      this.validateForm.get('poolEndDate')!.clearValidators(); // 外贸公司
      this.validateForm.get('foreignTradeCompany')!.clearValidators(); // 外贸公司
      this.validateForm.get('foreignTradeCompanyAddress')!.clearValidators(); // 外贸公司地址
      this.validateForm.get('foreignTradeCompanyContacts')!.clearValidators(); // 外贸公司联系人
      this.validateForm.get('foreignTradeCompanyPhone')!.clearValidators(); // 外贸公司电话
      this.validateForm.get('foreignTradeCompanyEmail')!.clearValidators(); // 外贸公司邮箱
      this.validateForm.get('importAgreementSignName')!.clearValidators(); // 合同签署人
      this.validateForm.get('importAgreementSignPost')!.clearValidators(); // 合同签署人职务
      this.validateForm.get('contractDdpStatus')!.clearValidators(); // DDP-Status //contractDdpStatus
      this.validateForm.get('billingInfor')!.setValidators(Validators.required);
      return false;
    } else {
      /* 添加外贸公司验证 */
      this.validateForm.get('foreignTradeCompany')!.setValidators(Validators.required); // 外贸公司
      this.validateForm.get('foreignTradeCompanyAddress')!.setValidators(Validators.required); // 外贸公司地址
      this.validateForm.get('foreignTradeCompanyContacts')!.setValidators(Validators.required); // 外贸公司联系人
      this.validateForm.get('foreignTradeCompanyPhone')!.setValidators([Validators.required,this.checkPhone]); // 外贸公司电话
      this.validateForm.get('foreignTradeCompanyEmail')!.setValidators([Validators.required,this.cheakMail]); // 外贸公司邮箱
      this.validateForm.get('importAgreementSignName')!.setValidators(Validators.required); // 合同签署人
      this.validateForm.get('importAgreementSignPost')!.setValidators(Validators.required); // 合同签署人职务
      this.validateForm.get('contractDdpStatus')!.setValidators(Validators.required); // DDP-Status
      this.validateForm.get('billingInfor')!.clearValidators();
    }
    if (this.dataBase.entryMode == 'STOCK') {
      this.validateForm.get('importAgreementSignPost')!.clearValidators(); // 合同签署人职务
    }
    this.validateForm.get('poolEndDate')!.updateValueAndValidity();
    this.validateForm.get('foreignTradeCompany')!.updateValueAndValidity();
    this.validateForm.get('foreignTradeCompanyAddress')!.updateValueAndValidity(); // 外贸公司地址
    this.validateForm.get('foreignTradeCompanyContacts')!.updateValueAndValidity();
    this.validateForm.get('foreignTradeCompanyPhone')!.updateValueAndValidity();
    this.validateForm.get('foreignTradeCompanyEmail')!.updateValueAndValidity();
    this.validateForm.get('importAgreementSignName')!.updateValueAndValidity();
    this.validateForm.get('importAgreementSignPost')!.updateValueAndValidity();
    this.validateForm.get('contractDdpStatus')!.updateValueAndValidity();
    this.validateForm.get('billingInfor')!.updateValueAndValidity();
    return true;
  }

  // 外贸公司是否与经销商相同
  ChangForeign() {
    if (this.dataBase.sameFlag === '1') {
      // 将经销商信息赋值给外贸公司
      this.dataBase.foreignTradeCompany = this.dataBase.distributor;
      this.dataBase.contractDdpStatus = this.dataBase.ddpStatus;
      this.dataBase.poolEndDate=this.dataBase.contractEndDate;
      this.dataBase.foreignTradeCompanyAddress = this.dataBase.distributorAddress;
      this.dataBase.foreignTradeCompanyContacts = this.dataBase.distributorContacts;
      this.dataBase.foreignTradeCompanyPhone = this.dataBase.distributorPhone;
      this.dataBase.foreignTradeCompanyEmail = this.dataBase.distributorEmail;
      this.dataBase.importAgreementSignName = this.dataBase.orderSignName;
      this.dataBase.importAgreementSignPost = this.dataBase.orderSignPost;
      this.foreignup()
    }
  }

  // 选中dealform
  changDealForm(index, data) {

    this.dealformlist.map(res => {
      res.radio = false;
    });
    data.radio = true;
    this.currId = data.id;
    this.ckdealformlist = data;
    // console.log(this.ckdealformlist);

  }

  // 查询
  GetDealList() {
    this.deal_load = true;
    this.box = true;
    this.http.get(`/act/preparation/queryCp?dealFormId=` + this.dealFormIdinput).subscribe(e => {
      this.deal_load = false;
      if (e.data) {
        this.dealformlist = e.data;
        if (this.dealformlist.length > 0) {
          this.dealformlist.map(vals => {
            vals.isDisable = false;
          })
          this.dealformlist.find(vals => {
            if (vals.id == this.currId) {
              vals.radio = true;
              //  vals.isDisable=true;
            }
          })
          if (this.dealformlist.length == 1) {
            this.ckdealformlist = this.dealformlist[0];
            this.ckdealformlist.radio = true;
          }
        }
        //if (e.data.length === 0) {
        // this.message.create('warning', 'dealFormId不存在');
        //}
      }
    }, error => {
      this.deal_load = false;
    });
  }
  // 获取中标价格
  // GetPrice(simulationList, datalist) {
  //   console.log(simulationList);
  //   console.log(datalist);
  //   const url = '/act/preparation/queryAuditNetPrice';
  //   this.http.post(url, {
  //     mbIds: simulationList
  //   }).subscribe(e => {
  //      debugger
  //     let pricelist = [];
  //     if (e.data && e.data.list) {
  //       pricelist = e.data.list;
  //     }
  //     if (datalist) {
  //       datalist.map( va => {
  //         va.children.map( val => {
  //           val.approvalPrice = '0';
  //         });
  //       });
  //     }
  //     // pricelist = [{dealFormMarketBundleId: '223' , auditNetPrice: '554'},
  //     //   {dealFormMarketBundleId: '224' , auditNetPrice: '113'}];
  //     if (datalist) {
  //       datalist.map( va => {
  //         va.children.map( val => {
  //           pricelist.map( price => {
  //             if (val.simulationIdS === price.dealFormMarketBundleId) {
  //               val.approvalPrice = price.auditNetPrice;
  //             }
  //           });
  //         });
  //       });
  //     }
  //     // console.log(datalist);

  //   });
  // }
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
      window.open(location.origin + environment.base_href + '/#/' + 'support-up?id=' + codeString(item.zbMainId) + '&flag=1' + '&status=' + item.taskStatus);
    } else {
      window.open(location.origin + environment.base_href + '/#/' + 'winning?id=' + codeString(item.zbMainId) + '&flag=1' + '&status=' + item.taskStatus);
    }
  }


}
