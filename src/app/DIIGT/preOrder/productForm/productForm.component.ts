import { Component, OnInit, ViewEncapsulation, Input, Output, ViewChild, EventEmitter,ElementRef} from '@angular/core';

import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import { ServesiceService } from '../servesice.service';
import {decodeString, getType,codeString} from '../../../../assets/js/tools';
import {NzMessageService, UploadFile} from 'ng-zorro-antd';
import {AppService} from '../../../app.service';
import {HttpService} from '../../../services';
import {ToastrService} from 'ngx-toastr';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-preOrderProductForm',
  templateUrl: './productForm.component.html',
  styleUrls: ['./productForm.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PreOrderProductFormComponent implements OnInit {
  @Input() public dataBase: any = {}; //当前进单的数据
  @Input() dataBases:any={} //所有总数据
  @Input() paySwitch: any = true;
  @Input() installSwitch: boolean = false;
  @Output() public copy = new EventEmitter();
  @Input() disa: any = false;
  @Input() sofonoff:any=false;
  @ViewChild('childs') childs;
  @ViewChild('tranfSingle')tranfSingle; //调用Sofon
  public pageParam: any = {    //最终用户的弹出窗口
    total: 0,
    pageNo: 1,
    pageSize: 5,
    dealFormId: "",
    endUserName: "",
    distributor:"",
    marketBundleName:"",
    prebookProductId:"",
    foreignTradeCompany:"",
  }
  public isPrebook:any=false;
  public state:any;
  public magnetic:any=false; //磁共震
  public towerCrane:any=false; //塔吊
  public solutionOff:any=false; //solution显示与否
  public test:any=false;
  //public left:any;
  public sonfonFile:any=[];
  public validateForm: FormGroup;
  public isVisibleSofon = false;
  public fileList = [];
  public textLen=255;
  public textLenone=200;
  public textLentwo=100;
  public tableColOff=false;
  public otherFile=false; //控制其实备注和复制按钮的显示与否
  // upload组件fileList
  public load: any = false;
  public userList:any;
  public paymentOff:any=false;
  public dealList:any=[];
  public dealshow:any={tablehead:[{name:"授权地区",width:"300px"},{name:"授权产品",width:"300px"}],data:[]};
  public isAgre:any=false;
  public contractCancelList=[];
  // public mrShieldingCompanyFileList = []; // 磁共振屏蔽公司
  // public confirmationFileFileList = []; // IGT第三方吊塔确认文件
  // public paymentProvisionFileNameFileList = []; // 付款条件
  // public shipmentDeliveryFileNameFileList = []; // 装运及交货
  // public sitePreparationFileNameFileList = []; // 场地准备
  // public installationWarrantyFileNameFileList = []; // 安装，验收及保修
  // public amountDifferenceFileNameFileList = []; // 直投订单合同金额和中标金额有价差
  // public performanceBondFileNameFileList = []; // 履约保函
  // public supportFileMissingFileNameFileList = []; // 支持文件缺失需特批进单
  // public otherFilNameFileList = []; // 其他条款
  /*是否可以输入*/
  public flag2 = true;
  public checkOptionsOne = [
    { label: 'Apple', value: 'Apple', checked: true },
    { label: 'Pear', value: 'Pear' },
    { label: 'Orange', value: 'Orange' }
  ];


  //跳转到合同概要表
  public gotoWinIncon(item)
  {
    window.open(location.origin + environment.base_href + '/#/' + 'inconmodif?id=' + codeString(item) + '&flag=1');
  }
  //跳转到prebook链接
  public gotoWin(item) {
    console.log(location.origin + environment.base_href + '/#/' + 'prebookso?id=' + codeString(item) + '&flag=1');
    window.open(location.origin + environment.base_href + '/#/' + 'prebookso?id=' + codeString(item) + '&flag=1&status=prebook_end');
  }
  public other = 'false,false,false,false,false,false,false';
  /**
   * filist 在线显示的文件 file上传的文件 fileId绑定的上传文件的id
   */
 //弹出选择prebook号
  public showPrebook()
  {
    if(this.dataBase.productList.length>0)
    {
      this.pageParam.dealformOff=this.dataBases.preBook?true:false;
      let marketBundleName=this.dataBase.productList.find(vals=>vals.checked);
      this.pageParam.dealFormId=this.dataBases.dealFormId;
      this.pageParam.endUserName=this.dataBases.endUser;
      this.pageParam.distributor=this.dataBases.distributor;
      this.pageParam.marketBundleName=marketBundleName.marketBundleName;
      this.pageParam.foreignTradeCompany=this.dataBases.foreignTradeCompany;
      this.pageParam.invoiceInformation=this.dataBases.invoiceInformation;
      this.pageParam.businessModel=this.dataBases.businessModel;
      this.isPrebook=true;
      this.childs.agentInit();
    }
    else
    {
      this.message.create("error","请选择产品")
    }
  }
 //取消prebook号
 public isPrebookCancel()
 {
   this.isPrebook=false;
 }
 //确定选中prebook
 public isPrebookOk()
 {
    this.isPrebook=false;
    let finds=this.childs.selectFind();
    if(finds.length>0)
    {
      this.dataBase.prebookProductId=finds[0].id;
      this.dataBase.prebookReferenceId=finds[0].referenceId;
      this.dataBase.prebookMainId=finds[0].prebookMainId;
      this.ServesiceService.prebook.emit(true);
    }
 }

 //prebookModel选中
 prebookModel(event)
 {
   this.ServesiceService.prebook.emit(true);
 }

 public upload(fileList, file, fileId) {
    this.dataBase[fileList] = [];
    const type = getType(file);
    this.dataBase[fileList].push(file);
    const formData = new FormData();
    // tslint:disable-next-line:no-shadowed-variable
    this.dataBase[fileList].forEach((file: any) => {
      formData.append('file', file);
      formData.append('fileType', type);
      formData.append('filename', file.name);
    });
    this.load = true;
    const url = '/act/system/upload';
    this.http.posts(url, formData).subscribe((res => {
      if (res.code === '0000') {
        this.load = false;
        this.dataBase[fileList][0].fileId = res.data;
        this.dataBase[fileId] = res.data;
        this.message.create('success', res.msg);
      } else {
        this.message.create('error', res.msg);
      }
    }),(error=>{
      this.load=false;
      this.dataBase[fileList] = [];
      this.message.create("error","上传失败请重新上传!")
    }));
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
  //igt选项目框
  changeConfirmationFile()
  {
    if(this.dataBase.confirmationFileFlag=='1')
    {
      this.dataBase.confirmationFile=""
      this.dataBase.confirmationFileFileList=[];
    }
  }
  //删除sofon文件
  nzRemovsofonName=(file:UploadFile):any=>{
    this.dataBase.sofonName="";
    return true;
  }
   //支持文件缺失需特批进单
   nzRemovsupportFileMissing=(file:UploadFile):any=>{
    this.dataBase.supportFileMissingFileName="";
    return true;
  }
  //直投订单合同金额和中标金额有价差
  nzRemovamountDifference=(file:UploadFile):any=>{
    this.dataBase.amountDifferenceFileName="";
    return true;
  }
   //其它
   nzRemovother=(file:UploadFile):any=>{
    this.dataBase.otherFilName="";
    return true;
  }
  //是否售后
  nzRemoveafterSales=(file:UploadFile):any=>{
    this.dataBase.afterSalesFileName="";
    return true;
  }
  //履约保函
  nzRemovperformanceBond=(file:UploadFile):any=>{
    this.dataBase.performanceBondFileName="";
    return true;
  }
  //安装及保修
  nzRemovinstallationWarranty=(file:UploadFile):any=>{
    this.dataBase.installationWarrantyFileName="";
    return true;
  }
  //删除场地报告
  nzRemovsitePreparation=(file:UploadFile):any=>{
    this.dataBase.sitePreparationFileName="";
    return true;
  }
    //删除装运及交货
    nzRemovshipmentDelivery=(file:UploadFile):any=>{
      this.dataBase.shipmentDeliveryFileName="";
      return true;
    }
   //删除付款条款附件
  nzRemovpaymentProvision=(file:UploadFile):any=>{
    this.dataBase.paymentProvisionFileName="";
    return true;
  }
   //删除磁屏蔽
   nzRemovmrShieldingCompany=(file:UploadFile):any=>{
    this.dataBase.mrShieldingCompany="";
    return true;
  }
  //删除塔吊文件
  nzRemovconfirmationFile=(file: UploadFile,): any=>
  {
    this.dataBase.confirmationFile="";
    return true;
  }
   //上传sofon文件
   public sofonNameBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('sofonNameFileList', file, 'sofonName');
    return false;
  }
  // 上传——磁共振屏蔽公司
  public mrShieldingCompanyBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('mrShieldingCompanyFileList', file, 'mrShieldingCompany');
    return false;
  }
  // 上传——IGT第三方吊塔确认文件
  public confirmationFileBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('confirmationFileFileList', file, 'confirmationFile');
    return false;
  }
  // 上传——付款条件
  public paymentProvisionFileNameBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('paymentProvisionFileNameFileList', file, 'paymentProvisionFileName');
    return false;
  }
  // 上传——装运及交货
  public shipmentDeliveryFileNameBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('shipmentDeliveryFileNameFileList', file, 'shipmentDeliveryFileName');
    return false;
  }
  // 上传——场地准备
  public sitePreparationFileNameBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('sitePreparationFileNameFileList', file, 'sitePreparationFileName');
    return false;
  }
  // 上传——安装，验收及保修
  public installationWarrantyFileNameBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('installationWarrantyFileNameFileList', file, 'installationWarrantyFileName');
    return false;
  }
  // 上传——直投订单合同金额和中标金额有价差
  public amountDifferenceFileNameBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('amountDifferenceFileNameFileList', file, 'amountDifferenceFileName');
    return false;
  }
   // 上传——履约保函
   public performanceBondFileNameBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('performanceBondFileNameFileList', file, 'performanceBondFileName');
    return false;
  }
  // 上传是否有售后限价
  public afterSalesFileNameBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('afterSalesFileNameFileList', file, 'afterSalesFileName');
    return false;
  }
  // 上传——支持文件缺失需特批进单
  public supportFileMissingFileNameBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('supportFileMissingFileNameFileList', file, 'supportFileMissingFileName');
    return false;
  }
  // 上传——其他条款
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
    this.upload('otherFilNameFileList', file, 'otherFilName');
    return false;
  }
//支持文件缺失需特批进单向基础信息组件传参数
supportChange(event)
{
  this.ServesiceService.supportFileMissing.emit()
  // if(event=='0')
  // {
  //   this.dataBase.supportFileMissingRemarks="";
  //   this.dataBase.supportFileMissingFileName="";
  //   this.dataBase.supportFileMissingFileNameFileList=[];
  // }
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
    this.otherFile=arr.some(res=>res=="true");
    this.other = arr.toString();
    this.dataBase.other = arr.toString();
  }
  public submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
  }

  public updateConfirmValidator(): void {
    /** wait for refresh value */
    Promise.resolve().then(() => this.validateForm.controls.checkPassword.updateValueAndValidity());
  }

  public confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.validateForm.controls.password.value) {
      return { confirm: true, error: true };
    }
    return {};
  }
  public checkFormData = () => {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    return this.validateForm.valid;
  }
  public getCaptcha(e: MouseEvent): void {
    e.preventDefault();
  }
  public ngAfterViewChecked()
  {

  }
  public ngOnChanges() {
    let that=this;
    this.ServesiceService.host.subscribe(res=>{
      this.getBase();
    })
    //带入sonfon编号

    this.ServesiceService.sofonNosend.subscribe(val=>{

        this.dataBase.sofonNo=val;
    })
    //经销商code
    this.ServesiceService.dealerCode.subscribe(val=>{
         this.dealerCodeList();
    })
    //集采项目
    this.ServesiceService.centralizeds.subscribe(val=>{
       this.dataBase.actualSales="";
    })
    if(this.dataBases.finaSofonQuoation)
    {
      this.dataBase.sofonNo=this.dataBases.finaSofonQuoation;
    }
    if(this.dataBases.businessModel=='DISTRIBUTOR'&&this.dataBases.dealerCode)
    {
      this.dealerCodeList();
    }
    //触发付款条款
    this.ServesiceService.payment.subscribe((res,params)=>{

      this.dataBases.paymentList=res;
      !this.dataBases.paymentList&&(this.dataBase.paymentProvision=null);
      if(this.dataBases.detail.status=='')
      {

        if(this.dataBases.paymentmethod&&this.dataBases.paymentOff&&(this.dataBase.paymentProvision==null||this.dataBase.paymentProvision==""))
        {
          this.dataBase.paymentProvision=this.dataBases.paymentmethods?this.dataBases.paymentmethods:null;
        }
      }
      if(this.dataBase.paymentProvision&&this.dataBases.paymentList)
      {
        if(this.dataBase.paymentProvision=='0'||this.dataBase.paymentProvision=='1')
        {
          let selectId=this.dataBases.paymentList.find(val=>val.remark==this.dataBase.paymentProvision);
          this.dataBase.paymentProvision=selectId.dictId
        }

        let selectId=this.dataBases.paymentList.find(val=>val.dictId==this.dataBase.paymentProvision);

        if(selectId)
        {
          this.paymentOff=selectId.remark=='1'?true:false;
          (this.paymentOff&&this.state==='DOACS'&&this.flag2)&&this.validateForm.controls.paymentProvision.enable();
        }
        else{
          this.paymentOff=false;
          this.dataBase.paymentProvision=null;
          this.dataBase.paymentProvisionRemarks="";
        }
      }
    })
    //付款条款
    if(this.dataBases.paymentList)
    {

      this.dataBase.paymentList=this.dataBases.paymentList;
      if(this.dataBases.detail.status=='')
      {
        if(this.dataBases.paymentmethod&&this.dataBases.paymentOff&&(this.dataBase.paymentProvision==null||this.dataBase.paymentProvision==""))
        {
        this.dataBase.paymentProvision=this.dataBases.paymentmethods?this.dataBases.paymentmethods:null;
        }
      }
      if(this.dataBase.paymentProvision)
      {
        if(this.dataBases.paymentList)
        {
            if(this.dataBase.paymentProvision=='0'||this.dataBase.paymentProvision=='1')
            {
              let selectId=this.dataBases.paymentList.find(val=>val.remark==this.dataBase.paymentProvision);
              this.dataBase.paymentProvision=selectId.dictId;
            }
            let selectId=this.dataBases.paymentList.find(val=>val.dictId==this.dataBase.paymentProvision);
            if(selectId)
            {
              this.paymentOff=selectId.remark=='1'?true:false;
              (this.paymentOff&&this.state==='DOACS'&&this.flag2)&&this.validateForm.controls.paymentProvision.enable();
            }
            else
            {
              this.paymentOff=false;
              this.dataBase.paymentProvision=null;
              this.dataBase.paymentProvisionRemarks="";
            }

        }
      }
    }

    this.getBase();
    this.ServesiceService.bookEventer.subscribe(res => {
      if (!this.dataBase.checked) {
        this.cheakbox();
      }
    });
  }

//支持文件缺失按钮是否禁用问题
  public supportFileMissingFlag()
  {

    const state=this.activatedRouter.queryParams['_value'].state;
    let flag=false;
    if(state==='DOACS')
    {
      if ((this.dataBases.biddingDocuments == '' || this.dataBases.biddingDocuments == null || this.dataBases.biddingDocuments == undefined) && this.dataBases.tenderNo != '其他类型') {
        flag=true;
      }
      if ((this.dataBases.tenderDocuments == '' || this.dataBases.tenderDocuments == null || this.dataBases.tenderDocuments == undefined) && this.dataBases.tenderNo != '其他类型') {
        flag=true;
      }
      if ((this.dataBases.endUserContract == '' || this.dataBases.endUserContract == null || this.dataBases.endUserContract == undefined)&&this.dataBases.businessModel!='DIRECT') {
        flag=true;
      }
      if ((this.dataBases.projectAnalysisTable == '' || this.dataBases.projectAnalysisTable == null || this.dataBases.projectAnalysisTable == undefined) && this.dataBases.businessModel == 'DISTRIBUTOR') {
        flag=true;
      }
     (this.dataBase.supportFileMissing=='1'&&!flag)&&this.validateForm.controls.supportFileMissing.enable();
    }
  }
  //取消弹出窗口
  public isAgreCancel()
  {
    this.isAgre=false;
  }
  // 弹出详情
  public showDiag() {
    this.dealshow.data = [];
    const dealerAgreementNo = this.dataBase.agreementNo;
    this.isAgre = true;
    // 经销商协议号 可以操作查询实时ie pool数据
    if (!this.disa) {
      const select = this.dealList.find(val => dealerAgreementNo === val.agreementNo);
      if (select) {
        const obj = {
          authorizedArea: select.authorizedArea,
          authorizedProduct: select.authorizedProduct
        };
        this.dealshow.data.push(obj);
        this.ServesiceService.dealTable.emit(this.dealshow);
      }
    } else {
      // 经销商协议号 禁用查询数据库保存值
      const obj = {
        authorizedArea: this.dataBase.authorizedArea,
        authorizedProduct: this.dataBase.authorizedProduct
      };
      this.dealshow.data.push(obj);
      this.ServesiceService.dealTable.emit(this.dealshow);
    }
  }

  // agreementNo 经销商协议号 改变保存区域和地址
  // authorizedArea   authorizedProduct
  public agreementNoChange() {
    if (!this.disa) {
      // 经销商协议号 可编辑 存入区域和地址
      if (this.dataBase.agreementNo != null && this.dataBase.agreementNo !== '') {
        const select = this.dealList.find(val => this.dataBase.agreementNo === val.agreementNo);
        if (select) {
          this.dataBase.authorizedArea = select.authorizedArea;
          this.dataBase.authorizedProduct = select.authorizedProduct;
        }
      } else {
        this.dataBase.authorizedArea = null;
        this.dataBase.authorizedProduct = null;
      }
    }
  }

 //合同概要表选择
 public changeContract(event)
 {
  const select=this.contractCancelList.find(val=>val.contractCancelReferenceId==event)
  if(select)
  {
    this.dataBase.contractCancelMainId=select.contractCancelMainId;
    this.dataBase.contractCancelReferenceId=select.contractCancelReferenceId;
    if(this.contractCancelList.length>0)
    {
      this.contractCancelList.map(vals=>{
        (this.dataBase.contractCancelReferenceId==vals.contractCancelReferenceId)&&(vals.disa=true)
      })

    }
  }
  else{
    if(this.contractCancelList.length>0&&event==null)
    {
      this.contractCancelList.map(vals=>{
        (this.dataBase.contractCancelMainId==vals.contractCancelMainId)&&(vals.disa=false)
      })
    }
  }

 }
  //合同概要表ID列表
 public getContractCancel()
 {

   const existsChange=!this.disa;
   let url=`/act/preparation/getContractCancel?existsChange=${existsChange}`;
   this.http.get(url).subscribe(rest => {
      this.contractCancelList=rest.data;
      if(this.contractCancelList.length>0)
      {
        this.contractCancelList.map(vals=>{
          vals.disa=false;
          this.dataBases.productList.map(val=>{
             vals.contractCancelReferenceId==val.contractCancelReferenceId&&(vals.disa=true)
          })
        })
      }
    })
 }
  //经销商协议号列表
  public dealerCodeList()
  {
    let dealerCode=this.dataBases.dealerCode;
    if(dealerCode&&this.dataBases.businessModel=='DISTRIBUTOR')
    {
      let url=`/act/preparation/chooseDealer?dealerCode=${dealerCode}`;
      this.http.get(url).subscribe(rest => {
          this.dealList=rest.data;
          let dealerAgreementNo=this.dataBase.agreementNo;
          let select=this.dealList.find(val=>dealerAgreementNo==val.agreementNo);
          // !select&&(this.dataBase.agreementNo=null);
      })
    }
  }
  //查看是否有三方塔吊和磁共振
  public getBase()
  {

    if(this.dataBase.productList&&this.dataBase.productList.length>0)
      {
        let host=this.dataBase.productList.find(vals=>vals.checked);
        if(host&&host.modalityBmc&&host.modalityBmc.length>0)
        {
          this.magnetic=host.modalityBmc.some(val=>val=="MR")
        }
        else{
          this.magnetic=false;
          this.dataBase.mrShieldingCompany="";
          this.dataBase.mrShieldingCompanyFileList="";
        }
        if(host&&host.modalityBmc&&host.modalityBmc.length>0)
        {
          this.towerCrane=host.modalityBmc.some(val=>val=="IGT-S")
        }
        else
        {
          this.towerCrane=false;
          this.dataBase.confirmationFile="";
          this.dataBase.confirmationFileFileList=[];
        }
        if(host&&host.businessOpportunityHierarchyLink!=null&&host.businessOpportunityHierarchyLink!=""&&host.businessOpportunityHierarchyLink!=undefined)
        {
          this.solutionOff=true;
        }
        else{
          this.solutionOff=false;
          this.dataBase.solutionSales="";
        }
      }
      else
      {
        this.magnetic=false;
        this.towerCrane=false;
        this.solutionOff=false;
        this.dataBase.mrShieldingCompany="";
        this.dataBase.confirmationFile="";
        this.dataBase.confirmationFileFileList=[];
      }
  }
  constructor(
    private fb: FormBuilder,
    public activatedRouter: ActivatedRoute,
    private ServesiceService: ServesiceService,
    private message: NzMessageService,
    private appService: AppService,
    private http: HttpService,
    private toastrService: ToastrService,
    private router: Router,
    private modalService: NgbModal,
    private aRoute: ActivatedRoute,
    private el:ElementRef
  ) {}
  public cheakbox() {
    const cheaks = this.checkFormData();
    this.ServesiceService.recive.emit(cheaks);
  }
  //选择支持条款选择框
  changePayment(params) {
   // this.dataBase.paymentProvision=params

    let applyType = this.dataBases.entryMode;
    let clientType = this.dataBases.hospitalNature;
    let tenderPriceCurrencys = this.dataBases.invoiceInformation;
    let businessType = this.dataBases.businessModel;
    if (applyType == null || applyType == undefined || applyType == '') {
      this.dataBases.paymentList = [];
      this.message.create('error', '请选择进单模式');
      return;
    }
    if (businessType == null || businessType == undefined || businessType == '') {
      this.dataBases.paymentList = [];
      this.message.create('error', '请选择业务模式');
      return;
    }
    if (clientType == null || clientType == undefined || clientType == '') {
      this.dataBases.paymentList = [];
      this.message.create('error','请选择医院类型');
      return;
    }
    if (tenderPriceCurrencys == null || tenderPriceCurrencys == undefined || tenderPriceCurrencys == '') {
      this.dataBases.paymentList = [];
      this.message.create('error', '请选择币种');
      return;
    }
    if(this.dataBases.paymentList&&this.dataBases.paymentList.length>0)
    {
      let selectId=this.dataBases.paymentList.find(val=>val.dictId==this.dataBase.paymentProvision)
      selectId&&(this.paymentOff=selectId.remark=='1'?true:false);
    }
    else{
      this.paymentOff=false;
    }
  }
  public ngOnInit(): void {
    // this.dataBase.other = 'true,false,false,false,false,true,true';
    this.getContractCancel();
    this.userListFun();
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
    console.log('-----', this.dataBase);
    const arr = this.dataBase.other.split(',');
    arr.map((item, index) => {
      if (item === 'true') {
        arr[index] = true;
      }
      if (item === 'false') {
        arr[index] = false;
      }
    });
    this.otherFile=arr.some(res=>res==='true') //控制备注、复制按钮的显示与否;
    this.dataBase.other1 = arr[0];
    this.dataBase.other2 = arr[1];
    this.dataBase.other3 = arr[2];
    this.dataBase.other4 = arr[3];
    this.dataBase.other5 = arr[4];
    this.dataBase.other6 = arr[5];
    this.dataBase.other7 = arr[6];
    const roleCode=localStorage.getItem("roleCode");
    const roles=JSON.parse(localStorage.getItem("roles"));
    //this.installSwitch=roleCode=="OA"?true:false;
    this.installSwitch=roles.some(item=>item=='OA');
    //this.sofonNameOff=roleCode!="Sales Rep/Mgr"?true:false;
    //this.paySwitch=roleCode!="Sales Rep/Mgr"?true:false;
    const flag = this.activatedRouter.queryParams['_value'].flag;
    this.state=this.activatedRouter.queryParams['_value'].state;
    if (flag === '1') {
      this.flag2 = false;
    }
    this.validateForm = this.fb.group({
      contractCancelReferenceId:new FormControl({value:'',disabled: this.disa}),
      switchValid:new FormControl({value:''}),
      prebookReferenceId:new FormControl({value: '',disabled: this.disa},Validators.required),
      isPrebookApply:new FormControl({value: '',disabled: this.disa},Validators.required),
      actualSales:new FormControl({value: '',disabled: this.disa},[Validators.required,this.cheakMail] ),
      agreementNo:new FormControl({value: '',disabled: this.disa},Validators.required),
      solutionSales:new FormControl({value: '', disabled: this.disa}, ),
      afterSales:new FormControl({value: '', disabled: this.disa}, ),
      afterSalesRemarks:new FormControl({value: '', disabled: this.disa}, ),
      sofonNo:new FormControl({ value: '', disabled: this.disa},),
      paymentProvision: new FormControl({ value: '', disabled: this.disa},Validators.required),
     // paymentProvisionRemarks: new FormControl({ value: '', disabled:this.disa},[Validators.required,Validators.minLength(1),Validators.maxLength(255)]),
      paymentProvisionRemarks:new FormControl({ value: '', disabled:this.disa},null),
      paymentProvisionFileName: new FormControl({ value: '', disabled: this.disa}, null),
      paymentProvisionRadio: new FormControl({value: '', disabled: this.disa}, null),
      shipmentDeliveryRemarks: new FormControl({value: '', disabled: this.disa}, null),
      shipmentDeliveryFileName: new FormControl({value: '', disabled: this.disa}, null),
      shipmentDelivery: new FormControl({value: '', disabled: this.disa}, ),
      installationWarranty: new FormControl({value: '', disabled: this.disa}, ),
      installationWarrantyRadio: new FormControl({value: '', disabled: !this.flag2}, null),
      sitePreparation: new FormControl({value: '', disabled: this.disa}, ),
      amountDifference: new FormControl({value: '', disabled: this.disa},),
      performanceBond: new FormControl({value: '', disabled: this.disa},),
      supportFileMissing: new FormControl({value: '', disabled: this.disa},),
      other: new FormControl({value: '', disabled: this.disa}, null),
      otherRemarks: new FormControl({value: '', disabled: this.disa}, null),
      otherCheckbox: new FormControl({value: '', disabled: this.disa}, null),
      otherFilName: new FormControl({value: '', disabled: this.disa}, null),
      mrShieldingCompany: new FormControl({value: '', disabled: this.disa}, null),
      confirmationFile: new FormControl({value: '', disabled: this.disa}, null),
      confirmationFileFlag: new FormControl({value: '', disabled: this.disa},),
      sitePreparationRemarks: new FormControl({value: '', disabled: this.disa}, null),
      sitePreparationFileName: new FormControl({value: '', disabled: this.disa}, null),
      installationWarrantyRemarks: new FormControl({value: '', disabled: this.disa}, null),
      installationWarrantyFileName: new FormControl({value: '', disabled: this.disa}, null),
      amountDifferenceRemarks: new FormControl({value: '', disabled: this.disa}, null),
      amountDifferenceFileName: new FormControl({value: '', disabled: this.disa}, null),
      performanceBondRemarks: new FormControl({value: '', disabled: this.disa}, null),
      performanceBondFileName: new FormControl({value: '', disabled: this.disa}, null),
      supportFileMissingRemarks: new FormControl({value: '', disabled: this.disa}, null),
      supportFileMissingFileName: new FormControl({value: '', disabled: this.disa}, null),
      other1: new FormControl({value: '', disabled: this.disa}, null),
      other2: new FormControl({value: '', disabled: this.disa}, null),
      other3: new FormControl({value: '', disabled: this.disa}, null),
      other4: new FormControl({value: '', disabled: this.disa}, null),
      other5: new FormControl({value: '', disabled: this.disa}, null),
      other6: new FormControl({value: '', disabled: this.disa}, null),
      other7: new FormControl({value: '', disabled: this.disa}, null),
      checkedFile: new FormControl({value: '', disabled: false}, null),
      freeText:new FormControl({value: '', disabled: this.disa}, [Validators.required,Validators.minLength(1),Validators.maxLength(99)]),
    });
    if(this.state==='DOACS'&&this.flag2)
    {

      this.validateForm.controls.paymentProvisionRemarks.enable();
      this.validateForm.controls.shipmentDeliveryRemarks.enable();
      this.validateForm.controls.installationWarrantyRemarks.enable();
      this.validateForm.controls.amountDifferenceRemarks.enable();
      this.validateForm.controls.sitePreparationRemarks.enable();
      this.validateForm.controls.otherRemarks.enable();
      this.validateForm.controls.performanceBondRemarks.enable();
      this.validateForm.controls.supportFileMissingRemarks.enable();
      this.validateForm.controls.afterSalesRemarks.enable();
      this.validateForm.controls.sofonNo.enable();
      this.dataBase.sitePreparation=='1'&&this.validateForm.controls.sitePreparation.enable();
      this.dataBase.performanceBond=='1'&&this.validateForm.controls.performanceBond.enable();
      this.dataBase.shipmentDelivery=='1'&&this.validateForm.controls.shipmentDelivery.enable();
      this.dataBase.installationWarranty=='1'&&this.validateForm.controls.installationWarranty.enable();
      this.dataBase.afterSales=='1'&&this.validateForm.controls.afterSales.enable();
      this.supportFileMissingFlag()
      this.dataBase.amountDifference=='1'&&this.validateForm.controls.amountDifference.enable();
      //this.validateForm.controls.isPrebookApply.enable();
      if(this.dataBase.other7 == true)
      {
       // this.validateForm.controls.other1.enable();
        this.validateForm.controls.other2.enable();
        this.validateForm.controls.other3.enable();
        this.validateForm.controls.other4.enable();
        this.validateForm.controls.other5.enable();
        this.validateForm.controls.other6.enable();
        this.validateForm.controls.other7.enable();
        this.validateForm.controls.freeText.enable();
      }
    }

    if (this.dataBase.productList!=null && this.dataBase.productList != undefined){
      // ============================   产品列表循环
      this.dataBase.productList.forEach(vals => {
        if (vals.configurationFile == null || vals.configurationFile == undefined || vals.configurationFile == ''){
          const confFiles = [];
          vals.sofonName = this.dataBase.sofonName;
          if (vals.simulationIds != '' && vals.simulationIds != undefined && vals.simulationIds != null) {
            // 读取配置文件===========================
            this.http.get(`/act/preparation/getAttachmentFromCP/` + vals.simulationIds + this.configFile_ClassType).subscribe((res2 => {
              for (let i = 0; i < res2.data.length; i++) {
                confFiles[i] = res2.data[i].id;
              }
              if (confFiles != null && confFiles != undefined){
                // 上传并打包配置文件========================
                this.http.post('/act/system/upload/cp', confFiles).subscribe((res3 => {
                  vals.configurationFile = res3.data.FileId;
                  vals.configurationFileList = [{
                    id: '' + res3.data.FileId,
                    preparationProductId: '',
                    preparationId: '',
                    fileId: '',
                    configurationFile: res3.data.FileName
                  }];

                }), error => {

                });
              }
            }), error => {

            });
          }
        }

      });
    }
  }
  //人员名称列表
  public userListFun()
  {
    let url=`/act/preparation/getUsers`
    this.http.post(url,{}).subscribe(rest=>{
         this.userList=rest.data;
    })
  }
  //验证长度
  maxlang(control: FormControl)
  {
    if(control.value)
    {
      let reg =/^\S{1,200}$/; //验证规则
      let valid = reg.test(control.value.replace(/[\u4e00-\u9fa5]{1}/g, 'xx')) //true
      return valid ? null:{langform: true};
    }
  }
   //邮箱的正则表大式
   cheakMail(control: FormControl) {
    if (control.value) {
      const reg=/^([a-zA-Z0-9_\.\-])+\@(philips.com)+$/;
      //const reg=/^[0-9a-zA-Z_\@\.\s\-]*$/g;
      //const reg = /^(?!\@)+(?!\_)+[0-9a-zA-Z_\@\.\s\-]*$/g;
      const valid = reg.test(control.value); // true
      return valid ? null : { mailform: true };
    }
  }
  //弹出sofon框
  // public sofonModel(): void {
  //   const dealFormId=this.dataBases.dealFormId;
  //   if(dealFormId!=""&&dealFormId!=undefined&&dealFormId!=null)
  //   {
  //     this.http.post(`/act/preparation/queryCpReview`,  {
  //       dealFormID: this.dataBase.dealFormId,
  //     }).subscribe(rest => {
  //         this.sonfonFile=rest.data.sonfonFile; //获取sonfonFile列表数据 记得是dataBases
  //         this.isVisibleSofon = true;
  //     })

  //   }
  //   else
  //   {
  //     this.message.create("error",'请先查询dealFormId');
  //   }

  // }
  public handleCancelSofon(): void {
    this.isVisibleSofon = false;
  }
  public handleOkSofon(): void {

    if(this.tranfSingle.checkOptionsOne.length<1)
    {
      this.message.create('warning', '请选择Sofon文件');
      return;
    }
    this.dataBase.sofonName=this.tranfSingle.checkOptionsOne[0].sofonFile;
    this.dataBase.sofonNameurl=this.tranfSingle.checkOptionsOne[0].sofonFileUrl;
    this.tranfSingle.radioValue="1";
    this.tranfSingle.checkOptionsOne=[];
    this.isVisibleSofon = false;
  }
  downSofonName(param):void
  {
    console.log(param);
    window.open(param);
  }
  // 复制
  public CopyAdd(a) {
    // console.log('copy');
    this.copy.emit(a);
  }
  //装运方式
  public shipmentDeliverySelect(event)
  {
    if(event=='0')
    {
      this.dataBase.shipmentDeliveryRemarks="";
      this.dataBase.shipmentDeliveryFileName="";
      this.dataBase.shipmentDeliveryFileNameFileList=[];
    }
  }
  //场地准备
  public sitePreparationSelect(event)
  {
    if(event=='0')
    {
      this.dataBase.sitePreparationRemarks="";
      this.dataBase.sitePreparationFileName="";
      this.dataBase.sitePreparationFileNameFileList=[];
    }
  }
  //安装，验收及保修
  public installationWarrantySelect(event)
  {
    if(event=='0')
    {
      this.dataBase.installationWarrantyRemarks="";
      this.dataBase.installationWarrantyFileName="";
      this.dataBase.installationWarrantyFileNameFileList=[];
    }
  }
  //履约保函
  public performanceBondSelect(event)
  {
    if(event=='0')
    {
      this.dataBase.performanceBondRemarks="";
      this.dataBase.performanceBondFileName="";
      this.dataBase.performanceBondFileNameFileList=[];
    }
  }
  //是否有售后限价
  public afterSalesSelect(event)
  {
    if(event=='0')
    {
      this.dataBase.afterSalesRemarks="";
      this.dataBase.afterSalesFileName="";
      this.dataBase.afterSalesFileNameFileList=[];
    }
  }
  //直投订单合同金额和中标金额有价差
  public amountDifferenceSelect(event)
  {
    if(event=='0')
    {
      this.dataBase.amountDifferenceRemarks="";
      this.dataBase.amountDifferenceFileName="";
      this.dataBase.amountDifferenceFileNameFileList=[];
    }
  }


  // tslint:disable-next-line:variable-name
    public configFile_ClassType: String = '/simulationConf';
  // tslint:disable-next-line:variable-name
    public sofonFile_ClassType: String = '/SofonOAReturnDoc,SofonOAReturnXml';





  public files: any = {
   thelist: []
  };



  getfilelist() {
    const dealFormId = this.dataBases.dealFormId;
    if (dealFormId != '' && dealFormId != undefined && dealFormId != null) {
      this.http.get(`/act/preparation/getAttachmentFromCP/` + dealFormId + this.sofonFile_ClassType).subscribe((res => {
        for (let i = 0; i < res.data.length; i++) {
          this.files.thelist[i] = res.data[i];
        }
      }), error => {

        });
    } else {
      this.message.create('error', '请先查询dealFormId');
    }
  }

  //   sofon文件选择框
  isVisible = false;


  @ViewChild('sofonModal')public sofonModal;

  public uploadZipFileName: String;

  public upmode = true;

  public switchValid = true;

  changeupmode(mode): void{
    this.upmode = !mode;
    this.dataBase.sofonName = '';
    this.dataBase.sofonNames = '';
    this.dataBase.sofonNameFileList = [];
  }



  // 对话框事件方法
  showModal(): void {
    this.isVisible = true;
    this.getfilelist();
  }

  handleOk(): void {
    // 只选一个文件时不打包
    if (this.fileChecked != null && this.fileChecked.length == 1){
      this.http.get('/act/system/upload/cp/' + this.fileChecked[0]).subscribe((res1 => {
        if (res1.code == '0000') {
          this.uploadZipFileName = res1.data.FileName;
          this.dataBase.sofonNames = res1.data.FileName;
          this.dataBase.sofonName = res1.data.FileId;
          this.dataBases.sofonName = res1.data.FileId;
          this.message.create('success', '文件上传成功！');
        }
      }), error => {
        this.message.create('error', '文件上传失败！');
      });

      this.isVisible = false;
    }// 多选文件打包
    else if (this.fileChecked != null && this.fileChecked.length > 1){
      // ======================================  上传sofon文件
      this.http.post('/act/system/upload/cp', this.fileChecked).subscribe((res1 => {
        if (res1.code == '0000') {
          this.uploadZipFileName = res1.data.FileName;
          this.dataBase.sofonNames = res1.data.FileName;
          this.dataBase.sofonName = res1.data.FileId;
          this.dataBases.sofonName = res1.data.FileId;
          this.message.create('success', '文件上传成功！');
        }
      }), error => {
        this.message.create('error', '文件上传失败！');
      });


      this.isVisible = false;
    }else {
     this.message.create('error', '请选择文件！');
    }

  }


  handleCancel(): void {
    this.isVisible = false;
  }

  public fileChecked: String[];//选中的文件数组



  log(value: string[]): void {
    this.fileChecked = value;
  }

}
