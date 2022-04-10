import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpService} from '../../services';
import {NzMessageService, UploadFile} from 'ng-zorro-antd';
import {codeString, decodeString, getType,chNumber,NumberThousandth} from '../../../assets/js/tools';
import {FormControl, Validators} from '@angular/forms';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-support-file-up',
  templateUrl: './support-file-up.component.html',
  styleUrls: ['./support-file-up.component.scss']
})
export class SupportFileUpComponent implements OnInit {

  public showoff: any = false;
  public rem_mess: any = false;
  public take: any = true;
  public remarks: any = '';

  flags:any;
  load: any = false; // 加载
  mainId: any = '';
  isDisable: any = 2;
  // 进单url链接
  mainid_winList: any = [];
  // 基础信息
  public dataBase: any = {};
  // 中标确认信息获取
  infor: any = {};
  odata: any = {
    // 中标通知书
    bidWinningNotice: false,
    // 中标公告
    bidWinningAnnouncement: false,
    // 缺要货函，用场地报告代替
    demandLetter: false,
    // 公立医院，招标编号-其他类型
    otherTypes: false,
    // 其他
    other: ''
  };
  // 获取产品数据
  dataInfor: any = {};

  data = {
    remarks: ''
  };
  isSupp : any = '0';

  // 绑定其他复选框
  othercheck: any = false;
  /*
  * true 招标编号不等于其他类型
  * false 招标编号等于其他类型
  * */
  biddingNoType: boolean = false;
  biddingNoTypeDemend: boolean = false;

  fileNoticeList : any = []; // 中标通知书
  fileAnnouncementList : any = []; // 中标公告
  filecommitmentList : any = []; // 投标及其他承诺文件
  filedemandLetterList : any = []; // 要货函或者场地勘验报告
  fileStatementList : any = []; // 参与投标声明函
  fileSupportList : any = []; // 项目解决方案售前支持报告
  filesupplementList: any = []; // 补充文件
  filesupplementsList: any = []; // 补充文件2
  filesupplementssList: any = []; // 补充文件3
  fileSpecialList: any = []; // 特批支持文件
  bidAnnouncementList: any =  []; // 中标公告文件

  public bidding_flag: any = false;
  public isBidding: any = false;
  public isAauthorization: any = false;
  public style: any = { width: '100%' };//控制日期控件样式
  constructor(
    private router: Router,
    private http: HttpService,
    public activatedRouter: ActivatedRoute,
    private message: NzMessageService,
  ) {
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    this.mainId = mainId;
    this.flag = this.activatedRouter.queryParams['_value'].flag;
    const url = `/act/ecom/tender/application/getTenderApplicationDto?mainId=${mainId}`;
    this.http.get(url).subscribe(res => {
      console.log(res);
      if (res.code === '0000') {
        this.dataBase = res.data;
        // this.inItData();
        if(this.dataBase.tenderPriceCurrency != null && this.dataBase.tenderPriceCurrency != ''){
          this.dataBase.tenderPriceCurrency=chNumber(this.dataBase.tenderPriceCurrency);
          this.dataBase.tenderPriceCurrency=NumberThousandth(this.dataBase.tenderPriceCurrency);
         }
         if (this.dataBase && this.dataBase.totalPrice!=''&&this.dataBase.totalPrice!=null) {
          this.dataBase.totalPrice = chNumber(this.dataBase.totalPrice);
           this.dataBase.totalPrice = NumberThousandth(this.dataBase.totalPrice);
         }
         if (this.dataBase && this.dataBase.performanceBonds!=''&&this.dataBase.performanceBonds!=null) {
          this.dataBase.performanceBonds = chNumber(this.dataBase.performanceBonds);
          this.dataBase.performanceBonds = NumberThousandth(this.dataBase.performanceBonds);
         }
        // 招标类型
        if (this.dataBase) {
          if (this.dataBase.biddingNo === '其他类型') {
            this.biddingNoType = false;
          } else {
            this.biddingNoType = true;
          }
          if (this.dataBase.clientType === '民营医院') {
            this.biddingNoTypeDemend = false;
          } else {
            if (this.dataBase.biddingNo === '其他类型') {
              this.biddingNoTypeDemend = false;
            } else {
              this.biddingNoTypeDemend = true;
            }
          }
        }
      }
    });
  }
  public flag: any = 0;
  ngOnInit() {
    this.flags = this.activatedRouter.queryParams['_value'].flag;
    this.getData();
    this.getWinUrl();
    this.getBiddingFlag();
  }

  // 获取流程是否可以终止
  public getBiddingFlag() {
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const url = '/act/ecom/tender/application/getBiddingFlag?mainId=' + mainId;
    this.http.get(url).subscribe(res => {
      if (res && res.data) {
        if (res.data.biddingFlag == true || res.data.biddingFlag === 'true') {
          this.bidding_flag = true;
        }
        // true 被进单使用过
        if (res.data.isBidding == true || res.data.isBidding === 'true') {
          this.isBidding = true;
        }
        if (res.data.isAauthorization == true || res.data.isAauthorization === 'true') {
          this.isAauthorization = true;
        }
      }
    });
  }
  // 流程终止
  public biddingBreak() {
    if (!this.take) {
      return;
    }
    this.take = false;
    if (this.remarks === '' || this.remarks == null) {
      this.rem_mess = true;
      this.take = true;
      return;
    }
    this.rem_mess = false;
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const data = {
      mainId: mainId,
      cancleReason: this.remarks
    };
    const url = '/act/ecom/tender/application/biddingTermination';
    this.http.post(url, data).subscribe(res => {
      this.message.create('success', `操作成功`);
      this.router.navigate(['/igt/my-task']);
      this.showoff = false;
      this.take = true;
    }, error => {
      this.message.create('error', `错误`);
      this.take = true;
    });
  }

  // 文件下载
  fileDwon(id) {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf('#');
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${id}`;
    window.open(url, '_blank');
  }

  // 判断是否选中其他
  public IsOtherInput () {
    if (this.othercheck || (this.odata.other != null && this.odata.other !== '')) {
      return true;
    }
    return false;
  }

  isChan2() {
    if (this.dataBase && this.dataBase.tenderAuthorization === 'private' && this.dataBase.businessType === 'DIRECT') {
      return false;
    }
    return true;
  }

  public openBiddingBreak() {
    if (this.isBidding) {
      this.message.create('error', `当前投标授权项目已发起进单，不可取消！如需取消，请先取消所有相关进单项目。`);
      return;
    }
    if (this.isAauthorization) {
      this.message.create('error', `当前是否需要投标授权为是，不可取消！`);
      return;
    }
    this.showoff = true;
  }
  public handleCancel() {
    this.showoff = false;
    this.rem_mess = false;
  }

  /**
   * data 回显数据  fileList回显数组
   */
  viewData(data, fileList, name) {
    const bidWinningNotice = this.dataInfor[data];
    if (bidWinningNotice != '' && bidWinningNotice != undefined && bidWinningNotice != null) {

      this[fileList] = [];
      let obj = { uid: '', name: '', fileId: '' };
      obj.uid = this.dataInfor[data];
      obj.fileId = this.dataInfor[data];
      if (this.dataInfor[name] != null && this.dataInfor[name] !== '') {
        obj.name = this.dataInfor[name];
      } else {
        obj.name = '文件下载';
      }
      this[fileList].push(obj);
    }

  }
  /**
   * data 回显数据  中标确认需特批
   */
  viewData2(data, fileList, name) {
    const bidWinningNotice = this.infor[data];
    if (bidWinningNotice != '' && bidWinningNotice != undefined && bidWinningNotice != null) {

      this[fileList] = [];
      let obj = { uid: '', name: '', fileId: '' };
      obj.uid = this.infor[data];
      obj.fileId = this.infor[data];
      if (this.infor[name] != null && this.infor[name] !== '') {
        obj.name = this.infor[name];
      } else {
        obj.name = '文件下载';
      }
      this[fileList].push(obj);
    }

  }

  getData() {
    const parmar = {
      mainId: this.mainId
    };
    const url = '/act/queryBiddingCheck';
    this.http.post(url, parmar).subscribe((res => {
      if (res.data) {
        this.infor = res.data;
        this.isSupp = res.data.isSupp;
        if (this.isSupp == null || this.isSupp === '') {
          this.isSupp = '0';
        }
        // if (this.flag == 1) {
        this.odata.bidWinningNotice = this.infor.bidWinningNotice;
        this.odata.bidWinningAnnouncement = this.infor.bidWinningAnnouncement;
        this.odata.demandLetter = this.infor.demandLetter;
        this.odata.otherTypes = this.infor.otherTypes;
        this.odata.other = this.infor.other;
        this.odata.specialApprovalFile = this.infor.specialApprovalFile;
        this.odata.supplementaryFile = this.infor.supplementaryFile;
        this.odata.supplementaryFiles = this.infor.supplementaryFiles;
        this.odata.supplementaryFiless = this.infor.supplementaryFiless;
        this.odata.bidAnnouncement = this.infor.bidAnnouncement;
        this.odata.specialApprovalFileName = this.infor.specialApprovalFileName;
        this.odata.supplementaryFileName = this.infor.supplementaryFileName;
        this.odata.supplementaryFileNames = this.infor.supplementaryFileNames;
        this.odata.supplementaryFileNamess = this.infor.supplementaryFileNamess;
        this.odata.bidAnnouncementName = this.infor.bidAnnouncementName;
        this.odata.announcementTime=this.infor.announcementTime; //中标公告发布时间
        this.odata.publicityEndTime=this.infor.publicityEndTime; //公示期结束时间
        this.odata.speciallyExaminedTime=this.infor.speciallyExaminedTime; //特批完成时间
        this.odata.biddingNotificationSignTime=this.infor.biddingNotificationSignTime; //后补中标通知书的签订时间
        this.odata.remarks = this.infor.remarks;
        this.odata.bidAnnouncementPrice = NumberThousandth(this.infor.bidAnnouncementPrice);
        this.odata.bidAnnouncementCurrency = this.infor.bidAnnouncementCurrency;
        if (this.odata.other) {
          this.othercheck = true;
        }
        this.viewData2('specialApprovalFile', 'fileSpecialList', 'specialApprovalFileName');
        this.viewData2('supplementaryFile', 'filesupplementList', 'supplementaryFileName');
        this.viewData2('supplementaryFiles', 'filesupplementsList', 'supplementaryFileNames');
        this.viewData2('supplementaryFiless', 'filesupplementssList', 'supplementaryFileNamess');
        this.viewData2('bidAnnouncement', 'bidAnnouncementList', 'bidAnnouncementName');
        // }
      }
    }), ((error) => {
      this.load = false;
      this.message.create('error', '请求异常!');
    }));
    const urls = `/act/ecom/bidding/getBudiding?mainId=${this.mainId}`;
    this.http.get(urls).subscribe((res => {
      if (res.data) {
        if (res.data.biddingPrice) {
          // 价格保留两位小数
          res.data.biddingPrice = this.chNumber(res.data.biddingPrice);
          res.data.biddingPrice = NumberThousandth(res.data.biddingPrice);
        }
        if (res.data.biddingProductlist) {
          for (let p1 = 0; p1 < res.data.biddingProductlist.length; p1 ++) {
            if (res.data.biddingProductlist[p1].biddingProductlist) {
              for (let p2 = 0; p2 < res.data.biddingProductlist[p1].biddingProductlist.length; p2++) {
                if (res.data.biddingProductlist[p1].biddingProductlist[p2].biddingPrice) {
                  res.data.biddingProductlist[p1].biddingProductlist[p2].biddingPrice = this.chNumber(res.data.biddingProductlist[p1].biddingProductlist[p2].biddingPrice);
                  res.data.biddingProductlist[p1].biddingProductlist[p2].biddingPrice = NumberThousandth(res.data.biddingProductlist[p1].biddingProductlist[p2].biddingPrice);
                }
              }
            }
          }
        }
        this.dataInfor = res.data;
        this.inItData();
      }
    }), ((error) => {
      this.message.create('error', '请求异常!');
    }));

  }

  submitForm = (e) => {
    const par = {
      demandLetter: this.dataInfor.demandLetter,
      bidWinningNotice: this.dataInfor.bidWinningNotice,
      bidWinningAnnouncement: this.dataInfor.bidWinningAnnouncement,
      supplementaryFile: this.odata.supplementaryFile,
      supplementaryFiles: this.odata.supplementaryFiles,
      supplementaryFiless: this.odata.supplementaryFiless,
      isSupp: this.isSupp,
      check: e,
      mainId: this.mainId,
      processInstanceTaskId: null
    };
    if (e == 1) {
      /*非空验证*/
      // 缺失中标通知书
      if (this.odata.bidWinningNotice == true || this.odata.bidWinningNotice === 'true') {
        if (par.bidWinningNotice === '' || par.bidWinningNotice == null) {
          this.message.create('error', '请上传中标通知书!');
          return;
        }
      }
      // 缺失中标公告
      if (this.odata.bidWinningAnnouncement == true || this.odata.bidWinningAnnouncement === 'true') {
        if (par.bidWinningAnnouncement === '' || par.bidWinningAnnouncement == null) {
          this.message.create('error', '请上传中标公告!');
          return;
        }
      }

      // 缺要货函，用场地报告代替
      if (this.odata.demandLetter == true || this.odata.demandLetter === 'true') {
        if (par.demandLetter === '' || par.demandLetter == null) {
          this.message.create('error', '请上传要货函或场地报告!');
          return;
        }
      }

      // 其他
      if (this.othercheck == true || this.othercheck === 'true') {
        if ((par.supplementaryFile === '' || par.supplementaryFile == null) && (par.supplementaryFiles === '' || par.supplementaryFiles == null) && (par.supplementaryFiless === '' || par.supplementaryFiless == null)) {
          this.message.create('error', '请上传补充文件!');
          return;
        }
      }
    }

    const processInstanceTaskId = this.activatedRouter.queryParams['_value'].processInstanceTaskId;
    if (processInstanceTaskId != null && processInstanceTaskId !== undefined && processInstanceTaskId !== '') {
      par.processInstanceTaskId = processInstanceTaskId;
    }
    this.http.post('/act/biddingcheckSupportFileDone', par).subscribe(e => {
      this.message.create('success', e.msg);
      this.router.navigate(['/igt/my-task']);
    }, error => {
      this.message.create('error', `错误`);
    });
  }

  // 初始化
  inItData() {


    let disa = this.isDisable == 2 || this.isDisable == 3 ? true : false;
    if (this.dataInfor.biddingProductlist && this.dataInfor.biddingProductlist.length > 0) {
      this.viewData('bidWinningNotice', 'fileNoticeList', 'bidWinningNoticeName');
      this.viewData('bidWinningAnnouncement', 'fileAnnouncementList', 'bidWinningAnnouncementName');
      this.viewData('commitmentDocument', 'filecommitmentList', 'commitmentDocumentName');
      this.viewData('demandLetter', 'filedemandLetterList', 'demandLetterName');
      this.viewData('statement', 'fileStatementList', 'statementName');
      this.viewData('support', 'fileSupportList', 'supportName');
      this.dataInfor.biddingProductlist.map(res => {
        res.productInformations && (res.biddingProductlist = [...res.productInformations]);
        delete res.productInformations;
        res.biddingProductlist.map(vals => {
          vals.marketBundleName =! vals.marketBundleName ? vals.productType : vals.marketBundleName;
          // this.validateForm.addControl(
          //   vals.id,
          //   new FormControl({value: 'Nancy', disabled:disa}, Validators.required)
          // );
          vals.biddingPrice = vals.biddingPrice ? vals.biddingPrice.toString() : '';
          vals.checked = (vals.checked != undefined || vals.checked != null) ? vals.checked : false;
          vals.productInformations && (vals.biddingProductlist = [...vals.productInformations]);
          delete vals.productInformations;
        });
      });
    }

  }

  // 判断是否需要特批
  public IsspecialApprovalFile () {
    if (this.flag == 1) {
      return false;
    }
    if (this.odata.bidWinningNotice || this.odata.bidWinningAnnouncement || this.odata.demandLetter || this.odata.otherTypes || this.odata.other) {
      return true;
    }
    return false;
  }

  // 上传文件下载
  dwonLoad = (file: UploadFile): void => {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf('#');
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${file.fileId}`;
    window.open(url, '_blank');
  }
  // 项目解决方案售前支持报告
  beforeSupportUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; //文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    this.upload('fileSupportList', file, 'support');
    return false;
  }
  // 文件删除回调
  public beforeSupportDel = (file: UploadFile): boolean => {
    this.dataInfor.support = '';
    return true;
  }

// 参与投标函
  beforeStatementUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; //文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    this.upload('fileStatementList', file, 'statement');
    return false;
  }
  // 文件删除回调
  public beforeStatementDel = (file: UploadFile): boolean => {
    this.dataInfor.statement = '';
    return true;
  }
  // 要货函或场地勘验报告
  beforeDemandLetterUpload = (file: UploadFile): boolean => {
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
    this.upload('filedemandLetterList', file, 'demandLetter');
    return false;
  }
  // 文件删除回调
  public beforeDemandLetterDel = (file: UploadFile): boolean => {
    this.dataInfor.demandLetter = '';
    return true;
  }
  // 投标及其他承诺文件
  beforecommitmentUpload = (file: UploadFile): boolean => {
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
    this.upload('filecommitmentList', file, 'commitmentDocument');
    return false;
  }
  // 文件删除回调
  public beforecommitmentDel = (file: UploadFile): boolean => {
    this.dataInfor.commitmentDocument = '';
    return true;
  }

  // 中标公告
  beforeAnnouncementUpload = (file: UploadFile): boolean => {
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
    this.upload('fileAnnouncementList', file, 'bidWinningAnnouncement');
    return false;
  }
  // 文件删除回调
  public beforeAnnouncementDel = (file: UploadFile): boolean => {
    this.dataInfor.bidWinningAnnouncement = '';
    return true;
  }
  // 中标通知书
  beforeNoticeUpload = (file: UploadFile): boolean => {
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
    this.upload('fileNoticeList', file, 'bidWinningNotice');
    return false;
  }
  // 文件删除回调
  public nzRemovNotice = (file: UploadFile): boolean => {
    this.dataInfor.bidWinningNotice = '';
    return true;
  }

  // 中标公告文件
  bidAnnouncementUpload = (file: UploadFile): boolean => {
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
    this.upload2('bidAnnouncementList', file, 'bidAnnouncement');
    return false;
  }

  // 补充文件
  beforeSupplementUpload = (file: UploadFile): boolean => {
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
    this.upload2('filesupplementList', file, 'supplementaryFile');
    return false;
  }

  // 补充文件2
  beforeSupplementsUpload = (file: UploadFile): boolean => {
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
    this.upload2('filesupplementsList', file, 'supplementaryFiles');
    return false;
  }
  // 补充文件3
  beforeSupplementssUpload = (file: UploadFile): boolean => {
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
    this.upload2('filesupplementssList', file, 'supplementaryFiless');
    return false;
  }

  // 文件删除回调
  public beforeSupplementRemo = (file: UploadFile): boolean => {
    this.odata.supplementaryFile = '';
    return true;
  }
  // 文件删除回调 补充文件2
  public beforeSupplementsRemo = (file: UploadFile): boolean => {
    this.odata.supplementaryFiles = '';
    return true;
  }
  // 文件删除回调 补充文件3
  public beforeSupplementssRemo = (file: UploadFile): boolean => {
    this.odata.supplementaryFiless = '';
    return true;
  }

  /**
   * filist 在线显示的文件 file上传的文件 fileId绑定的上传文件的id
   */
  upload(fileList, file, fileId) {

    this[fileList] = [];
    let type = getType(file);
    this[fileList].push(file);
    const formData = new FormData();
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
        this.dataInfor[fileId] = res.data;
        this.message.create('success', res.msg);
      }
      else {
        this.message.create('error', res.msg);
      }
    }),(error=>{
      this.load = false;
      this[fileList] = [];
      this.message.create('error',"上传失败请重新上传!");
    }));
  }
  upload2(fileList, file, fileId) {
    this[fileList] = [];
    // let type = file.name.split('.');
    let type = getType(file);
    this[fileList].push(file);
    const formData = new FormData();
    this[fileList].forEach((file: any) => {
      formData.append('file', file);
      formData.append('fileType', type);
      formData.append('filename', file.name);
    });
    this.load = true;
    const url = '/act/system/upload';
    this.http.posts(url, formData).subscribe(res => {
      if (res.code === '0000') {
        this.load = false;
        this[fileList][0].fileId = res.data;
        this.odata[fileId] = res.data;
        this.message.create('success', res.msg);
      }
      else {
        this.message.create('error', res.msg);
      }
    });
  }
  // 根据缺失选择 上传文件是否显示
  showFile(e) {
    if (this.flags == 1) {
      return false;
    }
    if (this.odata[e] === 'true' || this.odata[e] === true) {
      return true;
    }
    return false;
  }
  // 根据缺失选择 下载文件是否显示
  showFileDown(e) {
    if (this.flags == 1) {
      return true;
    } else {
      if (this.odata[e] === 'true' || this.odata[e] === true) {
        return false;
      }
    }
    return true;
  }

  AllCheck(e) {
    if (e) {
      for (let i = 0; i < e.length; i ++) {
        if (e[i].checked == false || e[i].checked === 'false') {
          return false;
        }
      }
      return true;
    }
    return false;
  }
  CheckAll(eve, e) {
    if (e) {
      e.map( item => {
        item.checked = eve;
      });
    }
  }

  // 截取数字保留两位小数
  chNumber(e) {
    if (e) {
      e = e.toString();
      let i = e.indexOf('.');
      if (i != -1 && i + 2 <= e.length) {
        return e.substring(0, i + 3);
      }
      return e;
    }
    return e;
  }


  /*进单链接眼*/
  getWinUrl() {
    const url = '/act/preparation/getMainId';
    let par = {
      zbMainId: this.mainId
    };
    this.http.post(url, par).subscribe( e => {
      if (e.data) {
        this.mainid_winList = e.data;
      }
    });
  }
  toWin(item) {
    const url = this.TaskAsUrl(item.taskStatus);
    const id = item.jdChildMainId ? item.jdChildMainId : item.jdMainId;
    if (item.taskStatus === 'DTJ') {
      window.open(location.origin + environment.base_href + '/#/' + url + '?id=' + codeString(id) + '&flag=1');
    } else {
      window.open(location.origin + environment.base_href + '/#/' + url + '?id=' + codeString(id) + '&flag=1' + '&state=' + item.taskStatus);
    }
  }

  TaskAsUrl(task) {
    switch (task) {
      case 'DOACS':
        return 'preorderaudit';
        break;
      case 'DTJ':
        return 'preordermodifs';
        break;
      case 'YZBQR':
        return 'winning';
        break;
      case 'DSWZYQR':
        return 'winning';
        break;
      case 'YZBQRDBCWJ':
        return 'support-up';
        break;
      case 'DSWYSH':  case 'XSBMDMSH':  case 'XSBMZSLSH':  case '2JSH':
        return 'tenderreview';
        break;
      case 'DSWZYSQ':
        return 'emp';
        break;
      case 'DZLCSH':  case 'JDEND':
        return 'viewsubp';
        break;
      case 'DOITWJSC':  case 'OITEND':  case 'DBCWJSC':
        return 'completeOit';
        break;
      case 'OITENDDBCWJSC':
        return 'suppfile';
        break;
      case 'DODSH':
        return 'inorderexam';
        break;
      case 'DXSBMSH':  case 'DXSBM2JSH':  case 'DOAJDQR':  case 'DHTOASH':  case 'DFBSH':  case 'DTPJDSH':
        return 'igt/examine-order';
        break;
      case 'DHTGYBTX':  case 'XJDHTGYBTX':
        return 'inconmodif';
        break;
      case 'DHTQS':
        return 'consign';
        break;
      case 'DTXHT':
        return 'inorder';
        break;
      case 'DBCWJSC':
        return 'suppfile';
        break;
      case 'WZB':  case '2CKB':
        return 'bid';
        break;
      case 'DCDSH':  case 'DOACS':
        return 'preorderaudit';
        break;
    }
    return '';
  }

  CkUrlLength() {
    if (this.mainid_winList && this.mainid_winList.length > 0) {
      for (let i = 0; i < this.mainid_winList.length; i++) {
        /* 判断子流程和主流程是否都为空 */
        if (this.mainid_winList[i].jdChildMainId || this.mainid_winList[i].jdMainId) {
          return true;
        }
      }
    }
    return false;
  }

}
