import { Component, OnInit,Input,Output,ViewChild,EventEmitter} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {NzMessageService, UploadFile} from 'ng-zorro-antd';
import {AppService} from '../../../app.service';
import {HttpService} from '../../../services';
import {ToastrService} from 'ngx-toastr';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {decodeString, formatDatesNow, getType} from '../../../../assets/js/tools';
@Component({
  selector: 'app-oitcomplete',
  templateUrl: './oitcomplete.component.html',
  styleUrls: ['./oitcomplete.component.scss']
})

export class OitcompleteComponent implements OnInit {
  public value = '';
  public data: any = {};
  public flag: any;
  public style:any={width:'100%'};
  // 产品信息
  @Input() public oitInfor: any = {};
  @Input() public disa: any = false;
  public realTimeOff=false;
  public status:any;
  @Input() public dataBase: any = {};
  public validateForm: FormGroup;
  public load: any = false;
  public fileFileList = []; //凭证文件
  public exportControlList=[]; //进出口管制
  public otherList=[]; //其它文件
  public textLenone=255; //文字长度
  public fileNameObj = {
    bidWinningNotice: '中标通知书',
    siteReport: '场地报告',
    projectSolutions: '项目解决方案售前支持报告(仅针对含solution项目)',
    tenderDocuments: '招标文件',
    biddingDocuments: '投标文件',
    endUserContract: '最终用户合同',
    dealerProfitAnalysis: '经销商利润分析表',
    projectAnalysisTable: '项目分析表 附件上传',
  };
  constructor(
    public activatedRouter: ActivatedRoute,
    private fb: FormBuilder,
    private nzMessageService: NzMessageService,
    private appService: AppService,
    private http: HttpService,
    private toastrService: ToastrService,
    private router: Router,
    private modalService: NgbModal,
    private aRoute: ActivatedRoute,
    private message: NzMessageService,
  ) {}

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
        this.oitInfor[fileId] = res.data;
        this.message.create('success', '操作成功');
      } else {
        this.message.create('error', res.msg);
      }
    }),(error=>{
      this.load = false;
      this[fileList] = [];
      this.message.create('error','上传失败请重新上传!');
    }));
  }
   //删除出口凭证
   nzRemoveFile= (file: UploadFile): any => {
    this.oitInfor.file = "";
    return true;
  }
   //删除其它
   nzRemoveOther= (file: UploadFile): any => {
    this.oitInfor.other = "";
    return true;
  }
  //删除进出口
  nzRemoveExportControl= (file: UploadFile): any => {
    this.oitInfor.exportControl = "";
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
  // 上传文件下载
  public dwonLoad = (file: UploadFile): void => {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf('#');
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${file.fileId}`;
    window.open(url, '_blank');
  }
  //其它文件
  public otherBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('otherList', file, 'other');
    return false;
  }
  //进出口管制文件
  public exportControlBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('exportControlList', file, 'exportControl');
    return false;
  }
  // 上传进出口凭证
  public fileBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('fileFileList', file, 'file');
    return false;
  }
  ngOnChanges()
  {
    this.viewData("file","fileFileList",this.oitInfor.fileNames);
    this.viewData("other","otherList",this.oitInfor.otherNames);
    this.viewData("exportControl","exportControlList",this.oitInfor.exportControlNames);
  }
  ngOnInit() {
    this.flag = this.activatedRouter.queryParams['_value'].flag;
    this.realTimeOff=this.activatedRouter.queryParams['_value'].param=='realTime'?true:false;
    this.status=this.activatedRouter.queryParams['_value'].status;
    this.validateForm = this.fb.group({
      remark: new FormControl({ value:'', disabled:this.status!='DOITWJSC'||this.flag == 1}, Validators.required),
      specialApprovalSupporting:new FormControl({ value:'', disabled: this.flag == 1||this.disa}),
      specialSupportCompleted:new FormControl({ value:'', disabled: this.flag == 1||this.disa}),
      specialSupportName:new FormControl({ value:'', disabled: this.flag == 1||this.disa}),
      productVerification:new FormControl({ value:'', disabled: this.flag == 1||this.disa}),
      logistician:new FormControl({ value:'', disabled:this.status!='DOITWJSC'||this.flag == 1},Validators.required),
      logisticsTime:new FormControl({ value:'',disabled:this.status!='DOITWJSC'||this.flag == 1},Validators.required),
      supportFileMissingFileName: new FormControl({value: '',disabled:this.status!='DOITWJSC'||this.flag == 1}),
    });
   // this.getUser()
  }

   /**
   * data 回显数据  fileList回显数组
   */
    viewData(data,fileList,names)
    {

      const bidWinningNotice=this.oitInfor[data];
      if(bidWinningNotice!=""&&bidWinningNotice!=undefined&&bidWinningNotice!=null)
      {

        this[fileList]= [];
        let obj = { uid: "", name: "", fileId: "" }
        obj.uid = this.oitInfor[data];
        obj.fileId =this.oitInfor[data];
        obj.name = names?names:"文件下载";
        this[fileList].push(obj);
      }

    }
  cheakData(param)
  {

    if(param==0)
    {
      this.validateForm.get('logistician')!.clearValidators();
      this.validateForm.get('logistician')!.markAsPristine();
      this.validateForm.get('logisticsTime')!.clearValidators();
      this.validateForm.get('logisticsTime')!.markAsPristine();
      this.validateForm.get('remark')!.setValidators(Validators.required);
      this.validateForm.get('remark')!.markAsDirty();
    }
    else if(param==1)
    {
      this.validateForm.get('logistician')!.setValidators(Validators.required);
      this.validateForm.get('logistician')!.markAsDirty();
      this.validateForm.get('logisticsTime')!.setValidators(Validators.required);
      this.validateForm.get('logisticsTime')!.markAsDirty();
      this.validateForm.get('remark')!.clearValidators();
      this.validateForm.get('remark')!.markAsPristine();
    }
    this.validateForm.get('logistician')!.updateValueAndValidity();
    this.validateForm.get('logisticsTime')!.updateValueAndValidity();
    this.validateForm.get('remark')!.updateValueAndValidity();
  }
  checkFormData = () => {

    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    return this.validateForm.valid;
  };
}
