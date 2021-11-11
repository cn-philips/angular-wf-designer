import { Component, OnInit, ViewEncapsulation, Input, Output, ViewChild, EventEmitter,ElementRef} from '@angular/core';

import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import { ServesiceService } from '../servesice.service';
import {decodeString, getType} from '../../../../assets/js/tools';
import {NzMessageService, UploadFile} from 'ng-zorro-antd';
import {AppService} from '../../../app.service';
import {HttpService} from '../../../services';
import {ToastrService} from 'ngx-toastr';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

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
  @ViewChild('tranfSingle')tranfSingle; //调用Sofon
  public state:any;
  public magnetic:any=false; //磁共震
  public towerCrane:any=false; //塔吊
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
  public other = 'false,false,false,false,false,false,false';
  /**
   * filist 在线显示的文件 file上传的文件 fileId绑定的上传文件的id
   */
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
        this.message.create('success', '操作成功');
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
//
supportChange()
{
  this.ServesiceService.supportFileMissing.emit()
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
    
    // let dom = this.el.nativeElement.querySelectorAll('.down');
    // let doms=this.el.nativeElement.querySelectorAll('.negatives'); 
    // this.left=dom[0].offsetWidth;   
  }
  public ngOnChanges() { 
    let that=this;
   
    this.ServesiceService.host.subscribe(res=>{ 
      // if(this.dataBase.productList&&this.dataBase.productList.length>0)
      // {
      //   let host=this.dataBase.productList.find(vals=>vals.checked);
      //   if(host&&host.modalityBmc&&host.modalityBmc.length>0)
      //   {
      //     this.magnetic=host.modalityBmc.some(val=>val=="MR") 
      //   }
      //   else{
      //     this.magnetic=false;
      //   }
      //   if(host&&host.modalityBmc&&host.modalityBmc.length>0)
      //   {
      //     this.towerCrane=host.modalityBmc.some(val=>val=="IGT-S") 
      //   }
      //   else
      //   {
      //     this.towerCrane=false;
      //   }  
      // }
      // else
      // {
      //   this.magnetic=false;
      //   this.towerCrane=false;
      // }
      // that.test=true; 
      this.getBase();
    })  
    this.getBase();
    this.ServesiceService.bookEventer.subscribe(res => {
      if (!this.dataBase.checked) {
        this.cheakbox();
      }
    });
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
      }
      else
      {
        this.magnetic=false;
        this.towerCrane=false;
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
  public ngOnInit(): void {
    // this.dataBase.other = 'true,false,false,false,false,true,true';   
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
      sofonNo:new FormControl({ value: '', disabled: this.disa},),
      paymentProvision: new FormControl({ value: '', disabled: this.disa},),
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
      this.validateForm.controls.sofonNo.enable();
    }

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
}
