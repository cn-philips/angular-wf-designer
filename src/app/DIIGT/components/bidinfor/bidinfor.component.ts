import {Component, OnInit, Input, Output, ViewChild, AfterViewInit, EventEmitter, ElementRef} from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { HttpService } from '../../../services';
import { NzMessageService,UploadFile} from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
import { formatDates, formatDate, decodeString,getType} from '../../../../assets/js/tools';

@Component({
  selector: 'app-bidinfor',
  templateUrl: './bidinfor.component.html',
  styleUrls: ['./bidinfor.component.scss']
})
export class BidinforComponent implements OnInit {
  /*
  * !(isDisable==2||isDisable==3)   可以编辑
  * (isDisable==2||isDisable==3)    不可编辑
  * isDisable 1 显示上传按钮 2显示下载，3下载和上传同时显示
  * */

  @ViewChild('price') price: ElementRef;

  checkAll: any = false;
  price_value: any = '';
  price_value_list: any = {};
  /*父控件请求是否完成*/
  isResp : any = false;

  @Input() isDisable: any = 1;
  // 父控件data数据 提交的数据
  @Input() data: any;
  // true禁用 url为1禁用
  @Input() flag: boolean = false;
  // 基础信息数据
  @Input() infor: any;
  constructor(private http: HttpService, private message: NzMessageService, private activeRoute: ActivatedRoute, private fb: FormBuilder, private el:ElementRef) {
  }

  /*
  * 只读
  * 读取产品信息便利OpportunityId集合
  * */
  OpportunityId: any = [];
  flags: any; // 判断是已办还是代办
  mainid: any = '';
  load:any = false; // load加载
  fileNoticeList: any = []; // 中标通知书
  fileAnnouncementList: any = []; // 中标公告
  filecommitmentList: any = []; // 投标及其他承诺文件
  filedemandLetterList: any = []; // 要货函或者场地勘验报告
  fileStatementList: any = []; // 参与投标声明函
  fileSupportList: any = []; // 项目解决方案售前支持报告

  /*
  * true 招标编号不等于其他类型
  * false 招标编号等于其他类型
  * */
  biddingNoType: boolean = false;
  /*
  * 要货函的判定方式
  * */
  biddingNoTypeDemend: boolean = false;
  /*
  * true Direct Deal
  * false Distributor Deal
  * */
  yewumoshi: boolean = true;

  /*
  * 验证
  * */
  validateForm: FormGroup;

  /*
  * 选择的产品
  * */
  list: any = [];
  /*
  * 选中的id
  * */
  ckMkId: any = [];

  /*
  * 产品选择数据
  * */
  ckbox: any = [];
  ngOnChanges() {
    setTimeout(() => {
      this.inItData();
    }, 1000);
  }
// 项目解决方案售前支持报告
  beforeSupportUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 <100; //文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    this.upload('fileSupportList', file, 'support', 'supportName');
    return false;
  }
  // 文件删除回调
  public beforeSupportDel = (file: UploadFile): boolean => {
    this.data.support = '';
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
    this.upload('fileStatementList', file, 'statement', 'statementName');
    return false;
  }
  // 文件删除回调
  public beforeStatementDel = (file: UploadFile): boolean => {
    this.data.statement = '';
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
    this.upload('filedemandLetterList', file, 'demandLetter', 'demandLetterName');
    return false;
  }
  // 文件删除回调
  public beforeDemandLetterDel = (file: UploadFile): boolean => {
    this.data.demandLetter = '';
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
    this.upload('filecommitmentList', file, 'commitmentDocument', 'commitmentDocumentName');
    return false;
  }
  // 文件删除回调
  public beforecommitmentDel = (file: UploadFile): boolean => {
    this.data.commitmentDocument = '';
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
    this.upload('fileAnnouncementList', file, 'bidWinningAnnouncement', 'bidWinningAnnouncementName');
    return false;
  }
  // 文件删除回调
  public beforeAnnouncementDel = (file: UploadFile): boolean => {
    this.data.bidWinningAnnouncement = '';
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
    this.upload('fileNoticeList', file, 'bidWinningNotice', 'bidWinningNoticeName');
    return false;
  }
  // 文件删除回调
  public nzRemovNotice = (file: UploadFile): boolean => {
    this.data.bidWinningNotice = '';
    return true;
  }
// //中标通知书文件删除
//   nzRemovNotice=(file: UploadFile,): any=>{
//     this.data.bidWinningNotice="";
//     return true;
//   }
//上传文件下载
  dwonLoad = (file: UploadFile): void => {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf("#");
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${file.fileId}`;
    window.open(url, '_blank');
  };
  //文件下载
  fileDwon(id)
  {
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
  upload(fileList, file, fileId, fileName) {

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
    const url = "/act/system/upload";
    this.http.posts(url, formData).subscribe((res => {
      if (res.code === "0000") {
        this.load = false;
        this[fileList][0].fileId = res.data;
        this.data[fileId] = res.data;
        this.data[fileName] = file.name;
        this.message.create("success", res.msg)
      }
      else {
        this.message.create("error", res.msg)
      }
    }),(error=>{
      this.load = false;
      this[fileList] = [];
      this.message.create('error','上传失败请重新上传!');
    }));
  }
  ngOnInit() {
    this.flags=this.activeRoute.queryParams['_value'].flag;
    /*
    * 验证
    * */
    this.validateForm = this.fb.group({
      time: [null, [Validators.required]],
      price: [null, [Validators.required]],
      opp: [null, [Validators.required]],
      pricetype: [null, [Validators.required]],
      isSpecial: [null, [Validators.required]],
      // bidWinningNotice:[null,[Validators.required]]
    });
    // this.inItData();
  }
  checkFormData = (e) => {
    // for (const i in this.validateForm.controls) {
    this.validateForm.controls[e].markAsDirty();
    this.validateForm.controls[e].updateValueAndValidity();
    // }
    return this.validateForm.valid;
  }
  /**
   * data 回显数据  fileList回显数组
   */
  viewData(data, fileList, name) {
    const bidWinningNotice = this.data[data];
    if (bidWinningNotice != '' && bidWinningNotice != undefined && bidWinningNotice != null) {

      this[fileList] = [];
      let obj = { uid: '', name: '', fileId: '' };
      obj.uid = this.data[data];
      obj.fileId = this.data[data];
      if (this.data[name] != null && this.data[name] !== '') {
        obj.name = this.data[name];
      } else {
        obj.name = '文件下载';
      }
      this[fileList].push(obj);
    }

  }
  //初始化
  inItData()
  {

    // 招标类型
    if(this.infor)
    {
      if (this.infor.biddingNo === '其他类型') {
        this.biddingNoType = false;
      } else {
        this.biddingNoType = true;
      }
      if (this.infor.clientType === '民营医院') {
        this.biddingNoTypeDemend = false;
      } else {
        if (this.infor.biddingNo === '其他类型') {
          this.biddingNoTypeDemend = false;
        } else {
          this.biddingNoTypeDemend = true;
        }
      }
    }

    this.viewData('bidWinningNotice', 'fileNoticeList', 'bidWinningNoticeName');
    this.viewData('bidWinningAnnouncement', 'fileAnnouncementList', 'bidWinningAnnouncementName');
    this.viewData('commitmentDocument', 'filecommitmentList', 'commitmentDocumentName');
    this.viewData('demandLetter', 'filedemandLetterList', 'demandLetterName');
    this.viewData('statement', 'fileStatementList', 'statementName');
    this.viewData('support', 'fileSupportList', 'supportName');
    let disa = this.isDisable == 2 || this.isDisable == 3 ? true : false;
    if (this.data.biddingProductlist && this.data.biddingProductlist.length > 0) {

      if (this.data.biddingProductlist) {
        this.data.biddingProductlist.map(res => {
          res.productInformations && (res.biddingProductlist = [...res.productInformations]);
          delete res.productInformations;
          if (res.biddingProductlist) {
            res.biddingProductlist.map(vals => {
              vals.marketBundleName = !vals.marketBundleName ? vals.productType : vals.marketBundleName;
              this.validateForm.addControl(
                vals.id,
                new FormControl({value: 'Nancy', disabled: disa}, Validators.required)
              );
              vals.biddingPrice = vals.biddingPrice ? vals.biddingPrice.toString() : '';
              vals.checked = (vals.checked != undefined || vals.checked != null) ? vals.checked : false;
              vals.productInformations && (vals.biddingProductlist = [...vals.productInformations]);
              delete vals.productInformations;
            });
          }
        });
      }
    }

  }
  /*
  //   * 1.	业务模式=Direct Deal，且“是否投标授权”选“否，民营医院直接进单”，则在“中标备案”页面仅显示“上传场地勘验报告”这个字段和“中标产品信息”
  //   *     false  仅显示“上传场地勘验报告”这个字段和“中标产品信息”
  //   *     true   显示完整的中标备案页面
  //   * */
  isChan2() {
    if (this.infor && this.infor.tenderAuthorization === 'private' && this.infor.businessType === 'DIRECT') {
      return false;
    }
    return true;
  }

  /*
  * 便利产品的opportunityId
  * 将产品分类
  * */
  InitOpportunityId() {
    const arr = [];
    if (this.data && this.data.biddingProductlist) {
      for (let i = 0; i < this.data.biddingProductlist.length; i++) {
        // 在记录重复数组中判断是否存在
        if (arr.indexOf(this.data.biddingProductlist[i].opportunityId) === -1) {
          arr.push(this.data.biddingProductlist[i].opportunityId);
        }
      }
      arr.sort();
      this.OpportunityId = arr;
    }
  }

  /*监听input设置数字*/
  toNumber(e) {
    const reg = /^(0|[1-9][0-9]{0,12})(\.[0-9]{0,2})?$/;
    if ((!isNaN(+e) && reg.test(e)) || e === '') {
        this.price_value = e;
    }
    if (this.price && this.price.nativeElement) {
      this.price.nativeElement.value = this.price_value;
      this.data.biddingPrice = this.price_value;
    }
  }

  toNumber2(e, data, id) {
    const reg = /^(0|[1-9][0-9]{0,12})(\.[0-9]{0,2})?$/;
    if ((!isNaN(+e) && reg.test(e)) || e === '') {
        this.price_value_list[id] = e;
    }
    const id2 = '#' + id;
    this.el.nativeElement.querySelector(id2).value = this.price_value_list[id];
    data = this.price_value_list[id];
    // e = this.price_value_list[id];
    // console.log(e);
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


}
