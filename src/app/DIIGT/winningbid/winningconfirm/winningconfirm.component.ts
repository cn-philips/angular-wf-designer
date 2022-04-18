import {Component, OnInit, Output, Input, ViewChild, ElementRef} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from '../../../services';
import { ToastrService } from 'ngx-toastr';
import {NzMessageService, NzModalService, UploadFile} from 'ng-zorro-antd';

import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable, Observer } from 'rxjs';
import {
  codeString,
  decodeString, formatDates, getType,NumberThousandth
} from '../../../../assets/js/tools';
import {environment} from '../../../../environments/environment';
import { DISABLED } from '@angular/forms/src/model';

@Component({
  selector: 'app-winningconfirm',
  templateUrl: './winningconfirm.component.html',
  styleUrls: ['./winningconfirm.component.scss']
})
export class WinningconfirmComponent implements OnInit {
  public verifiOff: any = true;
  public showCP: any = false;
  public load2: any = false;
  public bidData: any = [];
  public isSpecial: any = null;
  // 备注提示显示
  rem_mess: any = false;
  return_mess: any = false;
  biddingNoType: any = false;
  biddingNoTypeDemend: any =false;
  public style: any = { width: '100%' };//控制日期控件样式
  isDisable: any = 2;
  status: any; // 状态 YZBQRYBCWJ 补充文件已上传
  showSupplt:any=true; //是否开启结束开关
  selectedValue: any = '';
  checked: any = '';
  public textLen:any=255;//文本输入限制长度
  minitextLen:any=100;//其他备注文本输入限制长度
  load: any = false; //加载

  @Input() isVisibleDate: boolean;
  @Input() contractEndDate: any;
  @Input() fileList: any = {
    bidAnnouncementList: [], // 中标公告文件
    fileSpecialList: [], // 特批文件
    filesupplementList: [], // 补充文件
    filesupplementsList: [], // 补充文件2
    filesupplementssList: [] // 补充文件3
  };
  dataInfor: any = {};
  mainId: any = '';
  fileSpecialList: any = []; // 特批文件
  filesupplementList: any = []; // 补充文件
  filesupplementsList: any = []; // 补充文件2
  filesupplementssList: any = []; // 补充文件3
  isSupp : any = null;
  returnReceipt:any=false; //控制退回招标授权禁用与否
  // 绑定其他复选框
  @Input() othercheck: any = false;

  // 进单url链接
  mainid_winList: any = [];
  @Input() data = {
    remarks: ''
  };
  @Input() dataBase: any = {};
  // 需特批数据
  @Input() odata: any = {
    // 中标通知书
    bidWinningNotice: false,
    // 中标公告
    bidWinningAnnouncement: false,
    // 缺要货函，用场地报告代替
    demandLetter: false,
    // 公立医院，招标编号-其他类型
    otherTypes: false,
    specialApprovalFile: '', // 特批文件
    supplementaryFile: '', // 补充文件
    supplementaryFiles: '', // 补充文件2
    supplementaryFiless: '', // 补充文件3
    bidAnnouncement: '', // 中标公告文件
    // 其他
    other: '',
    remarks: '',
    // 中标公告价格
    bidAnnouncementPrice: '',
    // 中标公告币种
    bidAnnouncementCurrency: null
  };
  // 中标确认信息获取
  infor: any = {};
  validateForm: FormGroup;
  @Input() flag: number = 0;
  ngOnChanges(){
   // this.viewData("specialApprovalFile","fileSpecialList");
   // this.viewData("supplementaryFile","filesupplementList");

   if(this.dataBase.businessType)
   {
    this.returnReceipt=this.dataBase.tenderAuthorization=='nonprivate'?true:false;
   }

  }
  ngOnInit() {

    this.validateForm = this.fb.group({
      remarks: [null, [Validators.required]],
      announcementTime:new FormControl({ value: 'Nancy', disabled: this.flag==1}),
      publicityEndTime:new FormControl({ value: 'Nancy', disabled: this.flag==1}),
      speciallyExaminedTime:new FormControl({ value: 'Nancy', disabled: this.flag==1}),
      biddingNotificationSignTime:new FormControl({ value: 'Nancy', disabled: this.flag==1}),
    });
    this.mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    this.status = this.activatedRouter.queryParams['_value'].status; // 是否有结束按钮
    this.showSupplt = this.status === 'YZBQRDBCWJ' ? true : false; // 结束状态
    this.getData();
    this.getWinUrl();

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
    this.upload('bidAnnouncementList', file, 'bidAnnouncement');
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
    this.upload('filesupplementList', file, 'supplementaryFile');
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
    this.upload('filesupplementsList', file, 'supplementaryFiles');
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
    this.upload('filesupplementssList', file, 'supplementaryFiless');
    return false;
  }
  // 特批文件
  beforeSpecialUpload = (file: UploadFile): boolean => {
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
    this.upload('fileSpecialList', file, 'specialApprovalFile');
    return false;
  }
  //上传文件下载
  dwonLoad = (file: UploadFile): void => {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf("#");
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${file.fileId}`;
    window.open(url, '_blank');
  }
  //文件下载
  fileDwon(id) {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf("#");
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${id}`;
    window.open(url, '_blank');
  }
  /**
   * filist 在线显示的文件 file上传的文件 fileId绑定的上传文件的id
  */
  upload(fileList, file, fileId) {
    this.fileList[fileList] = [];
    let type = getType(file);
    this.fileList[fileList].push(file);
    const formData = new FormData();
    this.fileList[fileList].forEach((file: any) => {
      formData.append('file', file);
      formData.append('fileType', type);
      formData.append('filename', file.name);
    });
    this.load = true;
    const url = "/act/system/upload";
    this.http.posts(url, formData).subscribe((res => {
      if (res.code === "0000") {
        this.load = false;
        this.fileList[fileList][0].fileId = res.data;
        this.odata[fileId] = res.data;
        this.message.create("success", res.msg)
      }
      else {
        this.message.create("error", res.msg)
      }
    }),((error)=>{
      this.load=false;
      this.fileList[fileList] = [];
      this.message.create("error","请求异常！");
    }))
  }
  /**
   * data 回显数据  fileList回显数组
   */
   viewData(data, fileList, name) {

     const bidWinningNotice = this.odata[data];
     if (bidWinningNotice != '' && bidWinningNotice != undefined && bidWinningNotice != null) {
      this.fileList[fileList] = [];
      let obj = { uid: '', name: '', fileId: '' };
      obj.uid = this.odata[data];
      obj.fileId = this.odata[data];
       if (this.odata[name] != null && this.odata[name] !== '') {
         obj.name = this.odata[name];
       } else {
         obj.name = '文件下载';
       }
      this.fileList[fileList].push(obj);
     }
   }
  getData() {
    const parmar = {
      mainId: this.mainId
    };
    const url = '/act/queryBiddingCheck';
    this.http.post(url, parmar).subscribe((res => {
      if (res.data) {
          this.isSupp = res.data.isSupp;
          this.infor = res.data;
          // if (this.flag == 1) {
          this.odata.bidWinningNotice = this.infor.bidWinningNotice;
          this.odata.bidWinningAnnouncement = this.infor.bidWinningAnnouncement;
          this.odata.demandLetter = this.infor.demandLetter;
          this.odata.otherTypes = this.infor.otherTypes;
          this.odata.bidAnnouncementPrice = this.infor.bidAnnouncementPrice;
          this.odata.announcementTime=this.infor.announcementTime; //中标公告发布时间
          this.odata.publicityEndTime=this.infor.publicityEndTime; //公示期结束时间
          this.odata.speciallyExaminedTime=this.infor.speciallyExaminedTime; //特批完成时间
          this.odata.biddingNotificationSignTime=this.infor.biddingNotificationSignTime; //后补中标通知书的签订时间
          if (this.infor && this.infor.bidAnnouncementCurrency) {
            this.odata.bidAnnouncementCurrency = this.infor.bidAnnouncementCurrency;
          }
          if (this.infor.other == null) {
            this.odata.other = '';
          } else {
            this.odata.other = this.infor.other;
          }
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
          if(this.infor.remarks == null){
            this.odata.remarks = ''
          }else{
            this.odata.remarks = this.infor.remarks;
          }
          this.viewData('specialApprovalFile', 'fileSpecialList', 'specialApprovalFileName');
          this.viewData('supplementaryFile', 'filesupplementList', 'supplementaryFileName');
          this.viewData('supplementaryFiles', 'filesupplementsList', 'supplementaryFileNames');
          this.viewData('supplementaryFiless', 'filesupplementssList', 'supplementaryFileNamess');
          this.viewData('bidAnnouncement', 'bidAnnouncementList', 'bidAnnouncementName');
          /*BUG1396眼*/
          // 可以操作清空上一次拒绝记录
          if (this.flag == 0) {
            this.odata.remarks = '';
          }
       // }
      }
    }),((error)=>{
      this.load=false;
      this.message.create("error","请求异常!")
    }));
    const urls = `/act/ecom/bidding/getBudiding?mainId=${this.mainId}`;
    this.http.get(urls).subscribe((res => {
      if (res.data) {
        this.isSpecial = res.data.isSpecial;
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

      }
    }),((error)=>{
      this.message.create("error","请求异常!");
    }))

  }
  submitForm = (check: number, checkLabel: string, done?: number) => {
     this.rem_mess = false;
     this.return_mess = false;
    /*for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
      this.validateForm.controls[key].updateValueAndValidity();
    }*/
    /*点击拒绝*/
    // tslint:disable-next-line:triple-equals
    if (check == 0) {
      /*拒绝备注信息非空验证*/
      if (this.odata.remarks == null || this.odata.remarks === '') {
        this.rem_mess = true;
        // this.message.create('error', '请填写拒绝理由!');
        return;
      }
      // this.validateForm.controls['remarks'].markAsDirty();
      // this.validateForm.controls['remarks'].updateValueAndValidity();
      // if (!this.validateForm.valid) {
      //   return;
      // }
    }
    //
    /*退回至投标申请表*/
    if (check == 2) {
      if (this.odata.remarks == null || this.odata.remarks === '') {
        this.return_mess = true;
        return;
      }
    }
    // 判断remarks是否为null或undefined
    if (this.odata.remarks == null) {
      this.odata.remarks = '';
    }
    let params;
    // 中标确认
    if (check == 1) {
      // 判断是否需特批
      if (this.IsspecialApprovalFile()) {
        // 需要特批 判断特批文件是否为空
        console.log(this.odata.specialApprovalFile);
        if (this.odata.specialApprovalFile === '' || this.odata.specialApprovalFile == null) {
          this.message.create('error', '请上传特批通过支持文件');
          return;
        }

      }
      // 判断其他是否选中
      if (this.othercheck) {
        // 其他选中 判断其他是否为空
        if (this.odata.other === '' || this.odata.other == null) {
          this.message.create('error', '请填写其他信息');
          return;
        }
      }
      params = {
        mainId: decodeString(this.activatedRouter.queryParams['_value'].id),
        check: check,
        // supplementaryFile: value.fileurl,
        remarks: this.odata.remarks,
        bidWinningNotice: this.odata.bidWinningNotice,
        bidWinningAnnouncement: this.odata.bidWinningAnnouncement,
        demandLetter: this.odata.demandLetter,
        otherTypes: this.odata.otherTypes,
        other: this.odata.other,
        specialApprovalFile: this.odata.specialApprovalFile, // 特批文件
        supplementaryFile: this.odata.supplementaryFile, // 补充文件
        supplementaryFiles: this.odata.supplementaryFiles, // 补充文件2
        supplementaryFiless: this.odata.supplementaryFiless, // 补充文件3
        bidAnnouncement: this.odata.bidAnnouncement, // 中标公告文件
        supportFileDone: done,
        bidAnnouncementPrice: this.odata.bidAnnouncementPrice, // 中标公告价格
        bidAnnouncementCurrency: this.odata.bidAnnouncementCurrency, // 中标公告币种
        announcementTime:this.odata.announcementTime, //中标公告发布时间
        publicityEndTime:this.odata.publicityEndTime, //公示期结束时间
        speciallyExaminedTime:this.odata.speciallyExaminedTime, //特批完成时间
        biddingNotificationSignTime:this.odata.biddingNotificationSignTime, //后补中标通知书的签订时间
      };
      this.status !== 'YZBQRDBCWJ' ? this.submitHttp(params,checkLabel) : this.submitOver(params, checkLabel);

    } else {
      params = {
        mainId: decodeString(this.activatedRouter.queryParams['_value'].id),
        check: check,
       // supplementaryFile: value.fileurl,
        specialApprovalFile: this.odata.specialApprovalFile, // 特批文件
        supplementaryFile: this.odata.supplementaryFile, // 补充文件
        supplementaryFiles: this.odata.supplementaryFiles, // 补充文件2
        supplementaryFiless: this.odata.supplementaryFiless, // 补充文件3
        bidAnnouncement: this.odata.bidAnnouncement, // 中标公告文件
        remarks: this.odata.remarks,
        bidAnnouncementPrice: this.odata.bidAnnouncementPrice, // 中标公告价格
        bidAnnouncementCurrency: this.odata.bidAnnouncementCurrency, // 中标公告币种
        announcementTime:this.odata.announcementTime, //中标公告发布时间
        publicityEndTime:this.odata.publicityEndTime, //公示期结束时间
        speciallyExaminedTime:this.odata.speciallyExaminedTime, //特批完成时间
        biddingNotificationSignTime:this.odata.biddingNotificationSignTime, //后补中标通知书的签订时间
      };
      this.submitHttp(params, checkLabel);
    }


  }
  submitOver(params,checkLabel)  //结束状的保存
  {
    this.load=true;
    const processInstanceTaskId = this.activatedRouter.queryParams['_value'].processInstanceTaskId;
    if (processInstanceTaskId != null && processInstanceTaskId !== undefined && processInstanceTaskId !== '') {
      params.processInstanceTaskId = processInstanceTaskId;
    }
    this.http.post(`/act/biddingcheckSupportFileDone`, params).subscribe((rest => {
      this.load=false;
      if (rest.code === '0000') {
        this.message.create('success', `${rest.msg}`);
        setTimeout(() => {
          this.router.navigate(['/igt/my-task']);
        }, 2000);
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    }),(error=>{
       this.load=false;
       this.message.create("error","请求异常！")
    }));

  }
  submitHttp(params,checkLabel)
  {

    this.load=true;
    const processInstanceTaskId = this.activatedRouter.queryParams['_value'].processInstanceTaskId;
    if (processInstanceTaskId != null && processInstanceTaskId !== undefined && processInstanceTaskId !== '') {
      params.processInstanceTaskId = processInstanceTaskId;
    }
    this.http.post(`/act/biddingcheck`, params).subscribe((rest => {
      this.load=true;
      if (rest.code === '0000') {
        this.message.create('success', `${rest.msg}`);
        setTimeout(() => {
          this.router.navigate(['/igt/my-task']);
        }, 2000);
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    }),((error)=>{
      this.load=false;
      this.message.create("error","请求异常！")
    }));
  }

  validateConfirmPassword(): void {
    setTimeout(() => this.validateForm.controls.confirm.updateValueAndValidity());
  }

  userNameAsyncValidator = (control: FormControl) =>
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

  confirmValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.validateForm.controls.password.value) {
      return { confirm: true, error: true };
    }
    return {};
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
  // 判断是否选中其他
  public IsOtherInput () {
    if (this.othercheck) {
      return true;
    }
    return false;
  }
  IsCheck() {
    if (this.odata.other != null && this.odata.other !== '') {
      this.othercheck = true;
      return true;
    }
    return true;
    // else {
    //   this.othercheck = false;
    //   return false;
    // }
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private toastrService: ToastrService,
    private message: NzMessageService,
    public activatedRouter: ActivatedRoute,
    private modalService: NzModalService,
  ) {
    this.validateForm = this.fb.group({
      fileurl: [null],
      remarks: [null],
    });
  }

  /*进单链接眼*/
  getWinUrl() {
    const url = '/act/preparation/getMainId';
    let par = {
      zbMainId: this.mainId
    };
    this.http.post(url, par).subscribe( e => {
      if (e.data) {
        const role=JSON.parse(localStorage.getItem("roles"));
        const roleOff=role.some(val=>val=='Sales Rep/Mgr');
        const user=localStorage.getItem("ng_philips_code1");
        this.mainid_winList = e.data;
        this.mainid_winList.map(vals=>{
          if(roleOff)
          {
            vals.winOff=vals.processOwner==user?true:false
          }
          else
          {
            vals.winOff=true;
          }
        })
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

  /*
  //   * 1.	业务模式=Direct Deal，且“是否投标授权”选“否，民营医院直接进单”，则在“中标备案”页面仅显示“上传场地勘验报告”这个字段和“中标产品信息”
  //   *     false  仅显示“上传场地勘验报告”这个字段和“中标产品信息”
  //   *     true   显示完整的中标备案页面
  //   * */
  isChan2() {
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
    if (this.dataBase && this.dataBase.tenderAuthorization === 'private' && this.dataBase.businessType === 'DIRECT') {
      return false;
    }
    return true;
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


  // 点击其他回调
  public otherChange() {
    if (this.othercheck === false) {
      this.odata.other = '';
    }
  }

  price_value: any = '';
  @ViewChild('price') price: ElementRef;
  /*监听input设置数字*/
  toNumber(e) {
    const reg = /^(0|[1-9][0-9]{0,12})(\.[0-9]{0,2})?$/;
    if ((!isNaN(+e) && reg.test(e)) || e === '') {
      this.price_value = e;
    }
    if (this.price && this.price.nativeElement) {
      this.price.nativeElement.value = this.price_value;
      this.odata.bidAnnouncementPrice = this.price_value;
    }
  }

  public openModal() {
    this.showCP = true;
    this.getCheckData();
  }
  public handleOkWinCheck() {
    this.submitForm(1, '确定');
  }
  public handleCancelWinCheck() {
    this.showCP = false;
  }
  public getCheckData() {
    const url = '/act/getBiddingCheck';
    const data = {
      mainId: this.mainId
    };
    this.load2 = true;
    this.http.post(url, data).subscribe(res => {
      if (res && res.data) {
        this.bidData = res.data;

        // 构建bidData
        this.bidData.map(oppo => {
          oppo.rowspan = 1;
          oppo.isCheak = true;
          oppo.orderByCustomerName = this.dataBase.hospitalName;
          oppo.appPerson = oppo.createUser;
        });

      }
      console.log(this.bidData);
      this.load2 = false;
    }, error => {
      console.log(error);
      this.load2 = false;
    });
  }
  public modelChang() {
    // console.log(this.bidData)
  }

  public selectClick(index, i) {
    let oppResult = false;
    let market = false;
    let hospitat = false; // 客户
    let person = false; // 申请人
    let checkArr = []; // 用于验证的数组
    let search = this.bidData[index].searchResult[i]; // 当前选中search;
    let id = search.id;
    this.bidData.map(res => {
      res.isCheak && checkArr.push(res);
    });
    // 取消其他选中
    for (let i = 0; i < this.bidData.length; i++) {
      if (this.bidData[i]) {
        this.bidData[i].searchResult.map( e => {
          // e.isDisable = false;
          if (id == this.bidData[i].select && i != index) {
            this.bidData[i].select = null;
          }
        });
      }
    }
    search.temUser = true; // 表明当前选中
    this.InitDisableAll();
    const opportunityId = this.bidData[index].opportunityId;
    const opportunityIdNow = search.opportunityId;
    const marketBundleName = this.bidData[index].marketBundleName;
    const marketBundleNameNow = search.marketBundleName;
    const hospitalName = search.hospitalName; // 中标客户;
    let bidApplicant = search.bidApplicant; // 中标申请人
    this.bidData[index].orderByCustomerNameCp = hospitalName;
    this.bidData[index].winPerson = bidApplicant;
    const orderByCustomerName = this.bidData[index].orderByCustomerName; // 投标客户
    let appPerson = this.bidData[index].appPerson; // 投标申请人
    oppResult = opportunityId == opportunityIdNow ? true : false;
    market = marketBundleName == marketBundleNameNow ? true : false;
    // hospitat = orderByCustomerName == hospitalName ? true : false;
    // hospitat = search.hospitalId == search.no ? true : false;
    hospitat = this.dataBase.hospitalId == search.hospitalId ? true : false;
    if (bidApplicant) {
      bidApplicant = bidApplicant.toLowerCase();
    }
    if (appPerson) {
      appPerson = appPerson.toLowerCase();
    }
    person = bidApplicant == appPerson ? true : false;
    if (oppResult && market && hospitat && person) {
      this.bidData[index].checkResult = true;
      this.bidData[index].checkResultReasons = '';
      let check = checkArr.every(x => x.checkResult);  // 验证是否全部通过
      if (check) {
        this.verifiOff = false;
      }
    } else {
      this.bidData[index].checkResult = false;
      this.verifiOff = true;
    }
    if (!oppResult) {
      this.bidData[index].checkResultReasons = 'opportunityId不匹配';
      return;
    }
    if (!market) {
      this.bidData[index].checkResultReasons = 'marketBundleName不匹配';
      return;
    }
    if (!hospitat) {
      this.bidData[index].checkResultReasons = '客户名称不一致';
      return;
    }
    if (!person) {
      this.bidData[index].checkResultReasons = '申请人名称不一致';
      return;
    }

  }

  public selectUnClick(index, i) {
    const search = this.bidData[index].searchResult[i]; // 当前选中search;
    search.temUser = false;
    this.bidData[index].checkResult = false;

    this.InitDisableAll();
    // this.trunResultDisableAll(index, false);
  }
  public CkVerifiOff() {
    if (this.bidData && this.bidData.length > 0) {
      let ck = true;
      for (let i = 0; i < this.bidData.length; i++) {
        if (this.bidData[i].checkResult != true) {
          ck = false;
          break;
        }
      }
      return ck;
    }
    return false;
  }

  public trunResultDisableAll(index, value) {
    if (this.bidData && this.bidData.length > 0 && this.bidData[index]) {
      this.bidData[index].searchResult.map(e => {
        e.isDisable = value;
        if (value == false) {
          e.temUser = value;
        }
      });
    }
  }
  public InitDisableAll() {
    let ckid = [];
    // this.bidData.map(res => {
    //   res.isCheak && checkArr.push(res);
    // });
    // this.bidData[index].searchResult.map(res => {
    //   res.temUser = false;
    // });
    this.bidData.map(res => {
      if (res.searchResult) {
        res.searchResult.map( e => {
          e.isDisable = false;
        });
      }
    });
    // 筛选出选中
    for (let i = 0; i < this.bidData.length; i++) {
      if (this.bidData[i]) {
        this.bidData[i].searchResult.map( e => {
          // e.isDisable = false;
          if (e.temUser) {
            ckid.push(e.id);
            this.trunResultDisableAll(i, true);
          }
        });
      }
    }
    this.bidData.map(res => {
      // res.isCheak && checkArr.push(res);
      // 禁用已选中
      if (res.searchResult) {
        res.searchResult.map( e => {
          if (ckid.indexOf(e.id) != -1) {
            e.isDisable = true;
          }
        });
      }
    });

  }

  // 判断当前列是否已经选中
  public isCkResult(bidData) {
      // const bidData = this.bidData[index];
      if (bidData && bidData.searchResult) {
        // const select = bidData.select;
        // bidData.searchResult.map(e => {
        //   if (e.temUser == true) {
        //     return true;
        //   }
        // });
        for (let i = 0; i < bidData.searchResult.length; i++) {
          if (bidData.searchResult[i].temUser == true) {
            return true;
          }
        }
      }
    return false;
  }

  // 校验必须有结果和选中
  public CkResultTitle(checkResult, searchResult) {
    if (checkResult) {
      return '成功';
    } else {
      if (searchResult && searchResult.length > 0) {
        for (let i = 0; i < searchResult.length; i++) {
          // 查询出结果并且必须选中
          if (searchResult[i].temUser === true) {
            return '失败';
          }
        }
      }
      return '';
    }
  }
  isSubmit(){
    this.ddpJudge(this.dataBase.dealerNo, this.dataBase.agreementAgenName);
  }
  public ddpJudge(leaderNo, leaderName) {
    if (this.flag == 1) {
      return;
    }
    if (this.dataBase.businessType === 'DIRECT') {
      this.submitForm(1, '确定');
      return;
    }
    const url = '/act/ecom/bidding/getDdpDateAndValid?dealerCode=' + leaderNo + '&dealerName=' + leaderName;
    this.http.get(url).subscribe(
      res => {
        if (res.data.isValid != null && res.data.isValid) {
          this.submitForm(1, '确定');
          return;
        } else {
          let alertMsg = '';
          if (res.data.isValid != null) {
            alertMsg = '经销商DDP有效日期为' + res.data.ddpDate + ' ,当前已过有效期，是否确认审批通过？';
          } else {
            alertMsg = res.msg + ' 是否确认审批通过？';
          }
          this.modalService.confirm({
            nzTitle: '<h4>提醒</h4>',
            nzContent: alertMsg,
            nzOnOk: () => {
              this.submitForm(1, '确定');
            }
          });
        }
      }, error => {
        this.message.error('请求失败!');
      }
    );
  }

}
