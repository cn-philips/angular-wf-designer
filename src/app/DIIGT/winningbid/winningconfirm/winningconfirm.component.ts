import { Component, OnInit, Output, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from '../../../services';
import { ToastrService } from 'ngx-toastr';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';

import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable, Observer } from 'rxjs';
import {
  codeString,
  decodeString, formatDates, getType,NumberThousandth
} from '../../../../assets/js/tools';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-winningconfirm',
  templateUrl: './winningconfirm.component.html',
  styleUrls: ['./winningconfirm.component.scss']
})
export class WinningconfirmComponent implements OnInit {
  // 备注提示显示
  rem_mess: any = false;
  return_mess: any = false;
  biddingNoType: any = false;
  biddingNoTypeDemend: any =false;
  isDisable: any = 2;
  status: any; // 状态 YZBQRYBCWJ 补充文件已上传
  showSupplt:any=true; //是否开启结束开关
  selectedValue: any = '';
  checked: any = '';
  public textLen:any=255;//文本输入限制长度
  minitextLen:any=100;//其他备注文本输入限制长度
  load: any = false; //加载
  @Input() fileList: any = {
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
    // 其他
    other: '',
    remarks: ''
  };
  // 中标确认信息获取
  infor: any = {};
  validateForm: FormGroup;
  @Input() flag: number = 0;
  ngOnChanges(){
   // this.viewData("specialApprovalFile","fileSpecialList");
   // this.viewData("supplementaryFile","filesupplementList");
  }
  ngOnInit() {
    this.validateForm = this.fb.group({
      remarks: [null, [Validators.required]]
    });
    this.mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    this.status = this.activatedRouter.queryParams['_value'].status; // 是否有结束按钮
    this.showSupplt = this.status === 'YZBQRDBCWJ' ? true : false; // 结束状态
    this.getData();
    this.getWinUrl();

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
          if(this.infor.other == null){
            this.odata.other = ''
          }else{
            this.odata.other = this.infor.other;
          }
          this.odata.specialApprovalFile = this.infor.specialApprovalFile;
          this.odata.supplementaryFile = this.infor.supplementaryFile;
          this.odata.supplementaryFiles = this.infor.supplementaryFiles;
          this.odata.supplementaryFiless = this.infor.supplementaryFiless;
          this.odata.specialApprovalFileName = this.infor.specialApprovalFileName;
          this.odata.supplementaryFileName = this.infor.supplementaryFileName;
          this.odata.supplementaryFileNames = this.infor.supplementaryFileNames;
          this.odata.supplementaryFileNamess = this.infor.supplementaryFileNamess;
          if(this.infor.remarks == null){
            this.odata.remarks = ''
          }else{
            this.odata.remarks = this.infor.remarks;
          }
          this.viewData('specialApprovalFile', 'fileSpecialList', 'specialApprovalFileName');
          this.viewData('supplementaryFile', 'filesupplementList', 'supplementaryFileName');
          this.viewData('supplementaryFiles', 'filesupplementsList', 'supplementaryFileNames');
          this.viewData('supplementaryFiless', 'filesupplementssList', 'supplementaryFileNamess');
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
  submitForm = ($event: any, value: any, check: number, checkLabel: string,done?:number) => {
     this.rem_mess = false;
     this.return_mess =false;
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
    //判断remarks是否为null或undefined
    if(this.odata.remarks == null){
      this.odata.remarks = ''
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
        //supplementaryFile: value.fileurl,
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
        supportFileDone:done,
      };
      this.status!=='YZBQRDBCWJ'?this.submitHttp(params,checkLabel):this.submitOver(params,checkLabel);

    } else {
      params = {
        mainId: decodeString(this.activatedRouter.queryParams['_value'].id),
        check: check,
       // supplementaryFile: value.fileurl,
        specialApprovalFile: this.odata.specialApprovalFile, // 特批文件
        supplementaryFile: this.odata.supplementaryFile, // 补充文件
        supplementaryFiles: this.odata.supplementaryFiles, // 补充文件2
        supplementaryFiless: this.odata.supplementaryFiless, // 补充文件3
        remarks: this.odata.remarks,
      };
      this.submitHttp(params,checkLabel)
    }


  }
  submitOver(params,checkLabel)  //结束状的保存
  {
    this.load=true;
    this.http.post(`/act/biddingcheckSupportFileDone`, params).subscribe((rest => {
      this.load=false;
      if (rest.code === '0000') {
        this.message.create('success', `${checkLabel}操作，执行${rest.msg}`);
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
    this.http.post(`/act/biddingcheck`, params).subscribe((rest => {
      this.load=true;
      if (rest.code === '0000') {
        this.message.create('success', `${checkLabel}操作，执行${rest.msg}`);
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
        this.mainid_winList = e.data;
      }
    });
  }
  toWin(item) {
    const url = this.TaskAsUrl(item.taskStatus);
    const id = item.jdChildMainId ? item.jdChildMainId : item.jdMainId;
    window.open(location.origin + environment.base_href + '/#/' + url + '?id=' + codeString(id) + '&flag=1' + '&state=' + item.taskStatus);
  }

  TaskAsUrl(task) {
    switch (task) {
      case 'DOACS':
        return 'preorderaudit';
        break;
      case 'DTJ':
        return 'applytendermodif';
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

}
