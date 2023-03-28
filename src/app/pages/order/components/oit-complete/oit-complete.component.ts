import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
import { HttpService } from '@core/services';

import { differenceInCalendarDays } from 'date-fns';
import { decodeString, formatDatesNow, formatDatesNowMth, getType, upLoadFiles, viewDatas, codeString } from '@core/util/tools';
import { environment } from '@env';

@Component({
  selector: 'app-oitcomplete',
  templateUrl: './oit-complete.component.html',
  styleUrls: ['./oit-complete.component.scss']
})

export class OitCompleteComponent implements OnInit {
  public value = '';
  public disas: any = true;
  public data: any = {};
  public flag: any;
  public recordData: any = [];
  public style: any = { width: '100%' };
  // 产品信息
  @Input() public oitInfor: any = {};
  @Input() public disa: any = false;
  public realTimeOff = false;
  public status: any;//当前路由状态
  @Input() public dataBase: any = {};
  @Input() public dataBaseOrderSummary: any = {}; // orderSummary数据
  @Output() myUpdata = new EventEmitter()
  public validateForm: FormGroup;
  public load: any = false;
  public rebookFlag: any = true;
  public debookFlag: any = true;
  public isCancelFlag: any = true;
  public debookFlags: any = false;
  public rebookFlags: any = false;
  public fileFileList = []; //凭证文件
  public exportControlList = []; //进出口管制
  public otherList = []; //其它文件
  public supportFileList = []; //支持文件
  public textLenone = 255; //文字长度
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
    private http: HttpService,
    private message: NzMessageService,
  ) {

  }
  //oit完成查询接口
  public getFormDetails(id) {
    return new Promise((reslove, reject) => {
      this.http.get(`/act/preparation/oitCheck?mainId=${id}`).subscribe(res => {

        if (res.code === '0000') {

          this.oitInfor.logisticsTime = res.data.logisticsTime;
          reslove(res.data)
        } else {
          this.message.create('error', res.msg);
        }
      });
    })
  }

  // 审批记录
  getTableData() {
    return new Promise((resolve, reject) => {
      const params = {
        mainBusinessID: decodeString(this.activatedRouter.queryParams['_value'].id),
      };
      this.http.post(`/act/process/getProcessWorkHisInfo`, params).subscribe(rest => {
        if (rest.code === '0000') {
          let listOfData = rest.data.reverse();
          let roleList = JSON.parse(localStorage.getItem("roles"));
          let roleOff = roleList.some(val => val == 'OA' || val == 'OA Leader');
          if (roleOff) {
            // let user = localStorage.getItem("roleAgents");
            // let owner=listOfData.filter(vals=>user.indexOf(vals.assignee)>-1);
            this.disas = (this.status != 'change_oit_approval' && this.status != 'change_oit' && (this.flag == 0 || (this.flag == 1 && this.status != 'DOITWJSC'))) ? false : true;
          }

          if (!this.disas) {
            if (this.oitInfor.supportFile) {

              this.debookFlag = true;
              this.rebookFlag = true;
              this.isCancelFlag = true;
              this.validateForm.controls.deBookDate.disable();
              this.validateForm.controls.reBookDate.disable();
              // this.validateForm.controls.logistician.disable();
            }
            else {
              this.rebookFlag = false;
              this.debookFlag = false;
              this.isCancelFlag = false;
              this.validateForm.controls.logistician.enable();
              if (this.oitInfor.deBook == '1') {
                this.debookFlags = true;
                this.debookFlag = true;
                this.validateForm.controls.deBookDate.disable();
              }
              else {
                this.validateForm.controls.deBookDate.enable();
              }
              if (this.oitInfor.reBook == '1') {
                this.rebookFlag = true;
                this.validateForm.controls.reBookDate.disable();
              }
              else {
                this.validateForm.controls.reBookDate.enable();
              }
            }
          }
          else {
            this.rebookFlag = true;
            this.debookFlag = true;
            this.isCancelFlag = true;
            this.validateForm.controls.logistician.disable();
          }
        } else {
          this.message.create('error', `${rest.msg}`);
        }
      });
    })
  }
  //单选框
  isCancelChange(e) {
    if (e == '1') {
      this.rebookFlag = true;
      this.debookFlag = true;
      this.validateForm.controls.deBookDate.disable();
      this.validateForm.controls.reBookDate.disable();
    }
    else {
      this.rebookFlag = false;
      this.debookFlag = false;
      this.validateForm.controls.deBookDate.enable();
      this.validateForm.controls.reBookDate.enable();
    }
  }
  //更新附件的方法
  updata() {
    this.oitInfor.mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    this.oitInfor.logisticsTime && (this.oitInfor.logisticsTime = formatDatesNowMth(this.oitInfor.logisticsTime))
    if (this.oitInfor.isCancel == '1') {

      if (this.oitInfor.supportFile == '' || this.oitInfor.supportFile == undefined || this.oitInfor.supportFile == null) {
        this.message.create("error", "请上传支持文件");
        return
      }
      let cancelTime = new Date();
      this.oitInfor.cancelTime = formatDatesNow(cancelTime);
    }
    else {
      this.oitInfor.supportFile = "";
      this.oitInfor.cancelTime = null;
    }
    let url = "/act/preparation/oitUploadDeBook";
    if (this.oitInfor.deBook == '1') {
      if (this.oitInfor.deBookDate == '' || this.oitInfor.deBookDate == undefined || this.oitInfor.deBookDate == null) {
        this.message.create("error", "De-book日期");
        return
      }
    }
    if (this.oitInfor.reBook == '1') {
      if (this.oitInfor.reBookDate == '' || this.oitInfor.reBookDate == undefined || this.oitInfor.reBookDate == null) {
        this.message.create("error", "re-book日期");
        return
      }
    }
    // 提交下拉人员
    if (this.oitInfor.logistician) {
      this.oitInfor.expertList = [];
      const usrArr = this.oitInfor.oMlist.find(res => this.oitInfor.logistician == res.email);
      let obj 
      if(usrArr)
      {
         obj = {
          name: usrArr.name,
          userId: usrArr.id,
          email: usrArr.email
        };
      }
      else{
        obj={
          name:"",
          userId:"",
          email:this.oitInfor.logistician
        }
      }
      
      
      this.oitInfor.expertList.push(obj);
    }
    this.load = true;
    this.http.post(url, this.oitInfor).subscribe((res => {
      this.load = false;
      if (res.code == '0000') {
        this.message.create('success', res.msg);
        this.myUpdata.emit()
      }
      else {
        this.message.create('error', res.msg);
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "请求异常!");
    }));
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
        this.oitInfor[fileId] = res.data;
        this.message.create('success', res.msg);
      } else {
        this.message.create('error', res.msg);
      }
    }), (error => {
      this.load = false;
      this[fileList] = [];
      this.message.create('error', '上传失败请重新上传!');
    }));
  }
  //删除出口凭证
  nzRemoveFile = (file: UploadFile): any => {
    this.oitInfor.file = "";
    return true;
  }
  //删除支持文件
  nzRemoveSupportFile = (file: UploadFile): any => {
    this.oitInfor.supportFile = "";
    return true;
  }
  //删除其它
  nzRemoveOther = (file: UploadFile): any => {
    this.otherList.map((vals, index) => {
      vals.fileId == file.fileId && this.otherList.splice(index, 1);
      this.oitInfor.otherList
    })
    this.oitInfor.otherFiles = [...this.otherList];
    return true;
  }
  //删除进出口
  nzRemoveExportControl = (file: UploadFile): any => {
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
  //支持文件
  public supportFileUpload = (file: UploadFile): boolean => {
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
    this.upload('supportFileList', file, 'supportFile');
    return false;
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
    // this.upload('otherList', file, 'other');
    let upLoadFilesNow = upLoadFiles.bind(this)
    upLoadFilesNow('otherList', file).then(vals => {
      let fileList = [];
      vals.map(val => {
        let obj = {
          fileId: val.fileId
        }
        fileList.push(obj)
      })
      this.oitInfor.otherFiles = [...fileList];
    })
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
    this.oitInfor.fileName = file.name;
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
  ngOnChanges() {
    this.viewData("file", "fileFileList", this.oitInfor.fileNames);
    const viewData = viewDatas.bind(this)
    this.otherList = viewData(this.otherList, this.oitInfor.otherFiles); 
    this.oitInfor.otherFiles = [...this.otherList]
    this.viewData("exportControl", "exportControlList", this.oitInfor.exportControlNames);
    if (this.oitInfor.logistician) {
      this.getTableData();
    }
    if (this.dataBase) {
      if (this.dataBase.hsId) {
        this.validateForm.controls.logisticsTime.disable();
        this.getFormDetails(this.dataBase.hsId);
      }
    }
  }
  ngOnInit() {
    this.flag = this.activatedRouter.queryParams['_value'].flag;
    this.realTimeOff = this.activatedRouter.queryParams['_value'].param == 'realTime' ? true : false;
    this.status = this.activatedRouter.queryParams['_value'].status;
    this.validateForm = this.fb.group({
      remark: new FormControl({ value: '', disabled: this.status != 'DOITWJSC' || this.flag == 1 }),
      specialApprovalSupporting: new FormControl({ value: '', disabled: this.flag == 1 || this.disa }),
      specialSupportCompleted: new FormControl({ value: '', disabled: this.flag == 1 || this.disa }),
      specialSupportName: new FormControl({ value: '', disabled: this.flag == 1 || this.disa }),
      productVerification: new FormControl({ value: '', disabled: this.flag == 1 || this.disa }),
      logistician: new FormControl({ value: '', disabled: this.status != 'DOITWJSC' || this.flag == 1 }, Validators.required),
      logisticsTime: new FormControl({ value: '', disabled: this.status != 'DOITWJSC' || this.flag == 1 }, Validators.required),
      supportFileMissingFileName: new FormControl({ value: '', disabled: this.status != 'DOITWJSC' || this.flag == 1 }),
      deBook: new FormControl({ value: '', disabled: false }),
      deBookDate: new FormControl({ value: '', disabled: this.status != 'DOITWJSC' || this.flag == 1 }),
      reBook: new FormControl({ value: '', disabled: this.status != 'DOITWJSC' || this.flag == 1 }),
      reBookDate: new FormControl({ value: '', disabled: this.status != 'DOITWJSC' || this.flag == 1 }),
      cancelTime: new FormControl({ value: '', disabled: true })
    });
    this.getTableData();

  }
  public gotoOit(item) {
    window.open(location.origin + environment.base_href + '/#/' + 'pre-order/complete-oit?id=' + codeString(item.lastMainId) + '&flag=1' + '&status=OITEND');
  }

  /**
  * data 回显数据  fileList回显数组
  */
  viewData(data, fileList, names) {

    const bidWinningNotice = this.oitInfor[data];
    if (bidWinningNotice != "" && bidWinningNotice != undefined && bidWinningNotice != null) {

      this[fileList] = [];
      let obj = { uid: "", name: "", fileId: "" }
      obj.uid = this.oitInfor[data];
      obj.fileId = this.oitInfor[data];
      obj.name = names ? names : "文件下载";
      this[fileList].push(obj);
    }

  }
  cheakData(param) {

    if (param == 0) {
      this.validateForm.get('logistician')!.clearValidators();
      this.validateForm.get('logistician')!.markAsPristine();
      this.validateForm.get('logisticsTime')!.clearValidators();
      this.validateForm.get('logisticsTime')!.markAsPristine();
      this.validateForm.get('remark')!.setValidators(Validators.required);
      this.validateForm.get('remark')!.markAsDirty();
    }
    else if (param == 1) {
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
  //限制今天之前的日期不能选中
  disabledDate = (current: Date): boolean => {
    // let nonDate=new Date(this.oitInfor.deBookDate)
    // let year=nonDate.getFullYear();
    // let months=nonDate.getMonth()+2;
    // let newDate=`${year}-${months}`;
    return differenceInCalendarDays(current, this.oitInfor.deBookDate) < 0
  };

  @Input() paymentProvision = [];
  // OIT完成凭证文件字段 按 付款方式 判断必填
  public requiredByPaymentProvision() {
    if (this.dataBaseOrderSummary && this.dataBaseOrderSummary.paymentProvision && this.paymentProvision.indexOf(this.dataBaseOrderSummary.paymentProvision) !== -1) {
      // 必填
      return true;
    }
    return false;
  }

  // 判断字段是否存在数组内
  public arrIndexOfStr(arr: [], key: string, value: string) {
    if (arr) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i][key] === value) {
          return true;
        }
      }
    }
    return false;
  }
}
