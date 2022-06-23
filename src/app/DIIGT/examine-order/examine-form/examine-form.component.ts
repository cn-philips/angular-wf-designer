import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable, Observer } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from '../../../services';
import { ToastrService } from 'ngx-toastr';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
import { decodeString, getType,standardTime,isadopt,formatDatesNow } from '../../../../assets/js/tools';
import { ServesiceService } from '../../preOrder/servesice.service';


@Component({
  selector: 'app-examine-form-igt',
  templateUrl: './examine-form.component.html',
  styleUrls: ['./examine-form.component.scss'],
})
export class ExamineFormIGTComponent implements OnInit {
  @Input() dataBase: any = {
    productList: [], // 产品列表
    detail: {
      id: decodeString(this.activatedRouter.queryParams['_value'].id),
      flag: this.activatedRouter.queryParams['_value'].flag,
      status: this.activatedRouter.queryParams['_value'].status,
      taskID: this.activatedRouter.queryParams['_value'].taskID,
    },
  };
  @ViewChild('child') child;
  @Input() disa = false;
  public isVisibleDate:any=false; //ddp有效期
  public isVisibleDateIepool:any=false; //贸易公司ddp有效期
  public isShowDate:any=false;
  public isShowDates:any=false;
  public textLen: any = 255;
  public isAgres: any = false;
  public cannel = false;
  public disaBtn =false;
  value: string;
  selectedValue = null;
  validateForm: FormGroup;
  dateFormat = 'yyyy/MM/dd';
  load: any = false;
  roleCode: any;
  public fileFileList = []; //
  params:any= {
    check: 0, // 1 通过， 0 拒绝
    file:"", // 上传附件
    id: '',
    remark: '', // 备注
    createTime: '',
    createUser: '',
    isDeleted: 0,
    preparationId: '',
    status: 0,
    updateTime: '',
    updateUser: '',
    paymentProvisionRadio: '0',
    taskID: '',
    reason: "",
    mainId:"",
  };
  public DfbshObj = {
    paymentProvision: '待C&C Leader审核',
    installationWarranty: '待S&SD Marketing Leader审核',
    shipmentDelivery: '待CFC Distributor leader审核',
    amountDifference: '待OIT committee审核',
    sitePreparation: '待CFC PM Leader审核',
    performanceBond: '待Cluster BP审核',
  };
  //弹窗的数据
  public showData = {
    refuseReason: "",
    remarks: "",
    file: "",
    title: "",
    code: "",
  }
  //临时存一上数据
  public fileName:any;
  date = null; // new Date();
  dateRange = []; // [ new Date(), addDays(new Date(), 3) ];
  isEnglish = false;

  controlArray: any[] = [];
  isCollapse = false;
  public withdraw: any = false;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private toastrService: ToastrService,
    private message: NzMessageService,
    public activatedRouter: ActivatedRoute,
    private nzMessageService: NzMessageService,
    private ServesiceService: ServesiceService,
  ) {
  }
  /**
   * filist 在线显示的文件 file上传的文件 fileId绑定的上传文件的id
   */
  public upload(fileList, file, fileId) {
    this[fileList] = [];
    const type = getType(file);
    this[fileList].push(file);
    const formData = new FormData();
    this.fileName=file.name;
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
        this.params.file = res.data;
        this.message.create('success', res.msg);
      } else {
        this.message.create('error', res.msg);
      }
    }), (error => {
      this.load = false;
      this[fileList] = [];
      this.message.create("error", "上传失败请重新上传");
    }));
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
  // 上传——履约保函
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

  onChange(result: Date): void {
    console.log('Selected Time: ', result);
  }

  searchForm(): void {
    console.log('searchForm');
  }

  updateConfirmValidator(): void {
    /** wait for refresh value */
    Promise.resolve().then(() => this.validateForm.controls.checkPassword.updateValueAndValidity());
  }

  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.validateForm.controls.password.value) {
      return { confirm: true, error: true };
    }
    return {};
  }

  getCaptcha(e: MouseEvent): void {
    e.preventDefault();
  }
  ngOnChanges()
  {
    if(this.dataBase.hospitalNature)
    {
       //改单中的合同概要表和正常的合同概要表
       if(this.dataBase.hsId!=null&&this.dataBase.hsId!=undefined&&this.dataBase.hsId!="")
       {
          this.getCheckhsId()
       }
       else
       {
         this.getCheck();
       }
      const ASYNS = async () => {

        if(this.dataBase.businessModel=='DISTRIBUTOR')
        {
          await  this.getdistributorDate();
        }
        if(this.dataBase.invoiceInformation === 'USD')
        {
          await  this.getIepoolDate();
        }
       if(this.isVisibleDate==true||this.isVisibleDateIepool==true)
       {
          this.disaBtn=true;

       }
      }
      ASYNS()
    }
  }
  //改单中的检查是否可以撤回进单
  getCheckhsId()
  {
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const url = `/act/preparation/checkCance?mainId=${mainId}`;
    return new Promise((reslove, reject) => {
      this.http.get(url).subscribe(res => {
        if (res.code == '0000') {
          this.withdraw = res.data;
          reslove(res.data);
        }
      });
    });
  }
  ngOnInit(): void {
    this.roleCode = localStorage.getItem("roleCode");
    this.dataBase.detail.taskID = this.activatedRouter.queryParams['_value'].taskID;
    this.params.taskID = this.activatedRouter.queryParams['_value'].taskID;
    this.disa = this.dataBase.detail.flag === '1' ? true : false;

    this.validateForm = this.fb.group({
      // file: [null],
      // remark: [null],
      // paymentProvisionRadio: [null, [Validators.required]],
      // taskID: [null],
      file: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      remark: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      paymentProvisionRadio: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      taskID: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
    });
    //DFBSH这种状态设置为必填项
    if (this.dataBase.detail.status === 'DFBSH' && this.dataBase.detail.taskID === 'paymentProvision') {
      this.validateForm.get('paymentProvisionRadio')!.setValidators(Validators.required);
      this.validateForm.get('paymentProvisionRadio')!.markAsDirty();
    }
    this.validateForm.get('paymentProvisionRadio')!.updateValueAndValidity();
   //this.getCheck();
  }

  confirmApproval(value: any, check: number) {
    this.submitForm(value, check);
  }

  cancelAction(): void {
    this.nzMessageService.info('Cancel this operation');
  }
  //取消
  sumbitBack() {
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const processInstanceTaskId=this.activatedRouter.queryParams['_value'].processInstanceTaskId;
    let url = `/act/preparation/childOaTermination`;
    const params = {
      mainId: mainId,
      remark: this.params.remark, // 备注
      processInstanceTaskId:processInstanceTaskId
    }
    this.validateForm.get('remark')!.setValidators(Validators.required);
    this.validateForm.get('remark')!.markAsDirty();
    this.validateForm.get('remark')!.updateValueAndValidity();
    this.cannel = true;
    if (!this.validateForm.valid) {
      return;
    }
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
      this.validateForm.controls[key].updateValueAndValidity();
    }

    if (!this.validateForm.valid) {
      this.nzMessageService.warning('缺少必填字段');
      return false;
    }
    this.load = true;
    this.http.post(url, params).subscribe((res => {
      this.load = false;
      if (res.code == '0000') {
        this.router.navigate(['/igt/my-task']);
        this.message.create("success", res);
      }
      else{
        this.message.create('error', res.msg);
        this.load = false;
      }
    }), (error) => {
      this.load = false;
      this.message.create("error", "请求异常!");
    })
  }
  //检查是否可以撤回
  getCheck() {
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const url = `/act/preparation/checkCanBeTerminated/${mainId}`
    this.http.get(url).subscribe(res => {
      if (res.code == '0000') {
        this.withdraw = res.data;
      }
    })
  }
  //是否显示提示文字
  isshowOrder()
  {
    if((this.dataBase.detail.status=='cancel_oa_leader_approval'||this.dataBase.detail.status=='cancel_sales_approval')&&!this.withdraw)
    {
     return true
    }
    else{
      false
    }
  }
  submitForm = (value: any, check: number) => {
    // $event.preventDefault();
    const status = this.activatedRouter.queryParams['_value'].status;
    const processInstanceTaskId=this.activatedRouter.queryParams['_value'].processInstanceTaskId;
    let url = '';

    switch (status) {
      // 销售部门一级审核
      case 'DXSBMSH': url = '/act/ecom/order/application/checkSale';
        break;
      // 销售 二级部门审核
      case 'DXSBM2JSH': url = '/act/preparation/secondaryDepartmentAudit';
        break;
      // 待非标审核
      case 'DFBSH': url = '/act/preparation/secondaryAudit';
        break;
      // 特批文件进单初审（特批进单审核）
      case 'DTPJDSH': url = '/act/preparation/specialFileReview';
        break;
      // 特批文件进单二审
      case 'b2': url = '/act/preparation/specialFileReview';
        break;
      // 特批文件进单三审
      case 'b3': url = '/act/preparation/specialFileReview';
        break;
      // 进单确认（部门审核）
      case 'DOAJDQR': url = '/act/preparation/childOrderCheck';
        break;
      // OA审核
      case 'DHTOASH': url = '/act/preparation/childOaReview';
        break;
      //待OA Leader审核,待sale leader审核
      case 'cancel_oa_leader_approval':
      case 'cancel_sales_approval':
      case 'reject_sales_approval':
      case 'close_dm_approval':
      case 'close_oa_leader_approval':
      case 'reject_oa_leader_approval':
      url = `/act/preparation/fallback`;
        break;
    }
    let params = {
      check: check, // 1 通过， 0 拒绝
      file: this.params.file.toString(), // 上传附件
      mainId: decodeString(this.activatedRouter.queryParams['_value'].id),
      remark: this.params.remark, // 备注
      taskID: this.activatedRouter.queryParams['_value'].taskID,
      tenderNo: this.dataBase.tenderNo, //招标编号
      hospitalNature: this.dataBase.hospitalNature, //医院性质
      entryMode: this.dataBase.entryMode,
      workStatus: status,//
      processInstanceTaskId:processInstanceTaskId,
      foreignTradeCompany:this.dataBase.foreignTradeCompany,
      foreignTradeCompanyAddress:this.dataBase.foreignTradeCompanyAddress,
      foreignTradeCompanyContacts:this.dataBase.foreignTradeCompanyContacts,
      contractDdpStatus:this.dataBase.contractDdpStatus,
      poolEndDate:this.dataBase.poolEndDate,
      importAgreementSignName:this.dataBase.importAgreementSignName,
      importAgreementSignPost:this.dataBase.importAgreementSignPost,
      foreignTradeCompanyPhone:this.dataBase.foreignTradeCompanyPhone,
      foreignTradeCompanyEmail:this.dataBase.foreignTradeCompanyEmail
    };
    this.cannel = false;
    if (check == 0) {
      this.validateForm.get('remark')!.setValidators(Validators.required);
      this.validateForm.get('remark')!.markAsDirty();
      this.validateForm.get('remark')!.updateValueAndValidity();
      if (!this.validateForm.valid) {
        return;
      }
    }
    else {
      this.validateForm.get('remark')!.clearValidators();
      this.validateForm.get('remark')!.markAsPristine();
      this.validateForm.get('remark')!.updateValueAndValidity();
    }
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
      this.validateForm.controls[key].updateValueAndValidity();
    }
    console.log('value', value);
    console.log(this.validateForm.valid);
    if (!this.validateForm.valid) {
      this.nzMessageService.warning('缺少必填字段');
      return false;
    }
    if (status === 'DXSBM2JSH' || status === 'DFBSH') {
      delete params.check;
      delete params.mainId;
      params = Object.assign(params, {
        paymentProvision: this.dataBase.paymentProvision,
        shipmentDelivery: this.dataBase.shipmentDelivery,
        remark: this.params.remark,
        status: check,
        file: this.params.file.toString(), // 上传附件
        installationWarranty: this.dataBase.installationWarranty,
        installationWarrantyRadio: this.dataBase.installationWarrantyRadio,
        paymentProvisionRadio: this.params.paymentProvisionRadio,
        preparationId: decodeString(this.activatedRouter.queryParams['_value'].id),
        supportFileMissing: this.dataBase.supportFileMissing,
        amountDifference: this.dataBase.amountDifference,
        sitePreparation: this.dataBase.sitePreparation,
        performanceBond: this.dataBase.performanceBond,
        taskId: this.dataBase.detail.taskID,
        processInstanceTaskId:processInstanceTaskId
      });
    }
    if (status === 'DHTOASH')  //oa审核的时候的提交参数
    {

      if (check == 1) {

        if(this.dataBase.isPrebookApply=='0')
        {
          this.dataBase.prebookReferenceId="";
          this.dataBase.prebookProductId="";
          this.dataBase.prebookMainId="";
        }
        //装运方式清空选项
        if (this.dataBase.shipmentDelivery == '0') {
          this.dataBase.shipmentDeliveryRemarks = "";
          this.dataBase.shipmentDeliveryFileName = "";

        }
        //安装，验收及保修
        if (this.dataBase.installationWarranty == '0') {
          this.dataBase.installationWarrantyRemarks = "";
          this.dataBase.installationWarrantyFileName = "";

        }
        //场地准备
        if (this.dataBase.sitePreparation == '0') {
          this.dataBase.sitePreparationRemarks = "";
          this.dataBase.sitePreparationFileName = "";
        }
        //履约保函
        if (this.dataBase.performanceBond == '0') {
          this.dataBase.performanceBondRemarks = "";
          this.dataBase.performanceBondFileName = "";

        }
        //是否有售后限价
        if (this.dataBase.afterSales == '0') {
          this.dataBase.afterSalesRemarks = "";
          this.dataBase.afterSalesFileName = "";

        }
        //直投订单合同金额和中标金额有价差
        if (this.dataBase.amountDifference == '0') {
          this.dataBase.amountDifferenceRemarks = "";
          this.dataBase.amountDifferenceFileName = "";

        }
        //支持文件缺失需特批进单
        if (this.dataBase.supportFileMissing == '0') {
          this.dataBase.supportFileMissingRemarks = "";
          this.dataBase.supportFileMissingFileName = "";
        }
        //清空其他文件
        let otherArr = this.dataBase.other.split(',');
        let otherFile = otherArr.some(res => res === 'true') //控制备注、复制按钮的显示与否;
        if (!otherFile) {
          this.dataBase.otherRemarks = "";
          this.dataBase.otherFilName = "";
          this.dataBase.freeText = "";
          this.dataBase.otherFilNameFileList = "";
        }
      }

      params = Object.assign(params, {
        paymentProvision: this.dataBase.paymentProvision, //付款条款
        paymentProvisionFileName: this.dataBase.paymentProvisionFileName,
        paymentProvisionRemarks: this.dataBase.paymentProvisionRemarks,
        performanceBond: this.dataBase.performanceBond,//履约保函
        performanceBondFileName: this.dataBase.performanceBondFileName,
        performanceBondRemarks: this.dataBase.performanceBondRemarks,
        shipmentDelivery: this.dataBase.shipmentDelivery,//装运及交货
        shipmentDeliveryFileName: this.dataBase.shipmentDeliveryFileName,
        shipmentDeliveryRemarks: this.dataBase.shipmentDeliveryRemarks,
        installationWarranty: this.dataBase.installationWarranty, //安装，验收及保修
        installationWarrantyFileName: this.dataBase.installationWarrantyFileName,
        installationWarrantyRemarks: this.dataBase.installationWarrantyRemarks,
        installationWarrantyRadio: this.dataBase.installationWarrantyRadio,
        amountDifference: this.dataBase.amountDifference,//直投订单合同金额和中标金额有价差
        amountDifferenceFileName: this.dataBase.amountDifferenceFileName,
        amountDifferenceRemarks: this.dataBase.amountDifferenceRemarks,
        sitePreparation: this.dataBase.sitePreparation, //场地准备
        sitePreparationFileName: this.dataBase.sitePreparationFileName,
        sitePreparationRemarks: this.dataBase.sitePreparationRemarks,

        supportFileMissing: this.dataBase.supportFileMissing,//支持文件缺失
        supportFileMissingFileName: this.dataBase.supportFileMissingFileName,
        supportFileMissingRemarks: this.dataBase.supportFileMissingRemarks,

        other1: this.dataBase.other1, //other
        other2: this.dataBase.other2,
        other3: this.dataBase.other3,
        other4: this.dataBase.other4,
        other5: this.dataBase.other5,
        other6: this.dataBase.other6,
        other7: this.dataBase.other7,
        other: this.dataBase.other,
        otherFilName: this.dataBase.otherFilName,
        otherRemarks: this.dataBase.otherRemarks,
        afterSales: this.dataBase.afterSales, //是否有售后限价
        afterSalesFileName: this.dataBase.afterSalesFileName,
        afterSalesRemarks: this.dataBase.afterSalesRemarks,
        processInstanceTaskId:processInstanceTaskId,
        isPrebookApply:this.dataBase.isPrebookApply,
        prebookReferenceId:this.dataBase.prebookReferenceId,
        prebookProductId:this.dataBase.prebookProductId,
        prebookMainId:this.dataBase.prebookMainId,
      });
    }

    // 进单确认处理信息
    if (status === 'DOAJDQR') {
      if (this.dataBase.sofonFile) {
        params = Object.assign(params, {
          sofonFile: this.dataBase.sofonFile
        });
      } else {
        this.nzMessageService.warning('请上传sofon文件');
        return false;
      }
    }

    const ASYNS = async () => {

        if(check==1)
        {
         if(this.dataBase.businessModel=='DISTRIBUTOR')
         {
           let distributorDate= await this.getdistributorDate();
           if(this.dataBase.ddpStatus !== '通过')
           {
             this.isShowDate=true;
             return false;
           }
         }
         if(this.dataBase.invoiceInformation === 'USD')
         {
           let iepoolDate=await this.getIepoolDate();
           if(this.dataBase.invoiceInformation === 'USD' && this.dataBase.contractDdpStatus !== '通过')
           {
             this.isShowDates=true;
             return;
           }
         }

        }
      this.load = true;
      this.http.post(url, params).subscribe((rest => {
        if (rest.code === '0000') {
          console.log(rest.data);
          this.message.create('success', `${rest.msg}`);
          // setTimeout(() => {
          this.router.navigate(['/igt/my-task']);
          this.load = false;
          // }, 3000);
        }
        else {
          this.load = false;
          this.message.create('error', `${rest.msg}`);
          return;
        }
      }), (error => {
        this.load = false;
        this.message.create("error", "请求异常!")
      }));
    }
  ASYNS()
  }
  // 上一步
  prevStep() {
  }
  // 清空表单选项
  resetForm() {
    this.validateForm.reset();
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
  //弹出退回合同概要表
  backContract() {
    this.isAgres = true;
    let obj = {
      title: "Return to Contract Summary 退回合同概要表",
      code: "backContract",
      refuseReason: null,
      remarks:this.params.remark,
      file:this.params.file,
      fileName:this.fileName
    }
    this.ServesiceService.confirmTime.emit(obj);
  }
  //弹出关闭合同概要表
  closeContract() {
    this.isAgres = true;
    let obj = {
      title: "关闭合同概要表",
      code: "colseContract",
      refuseReason: null,
      remarks:this.params.remark,
      file:this.params.file,
      fileName:this.fileName
    }
    this.ServesiceService.confirmTime.emit(obj);
  }
  //弹出退回进单准备表
  backOrder() {
    this.isAgres = true;
    let obj = {
      title: "取消进单准备表",
      code: "cancelReceipt",
      refuseReason: null,
      remarks:this.params.remark,
      file:this.params.file,
      fileName:this.fileName
    }
    this.ServesiceService.confirmTime.emit(obj);
  }
  //确定
  isAgregentOk() {
    const status = this.activatedRouter.queryParams['_value'].status;
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const processInstanceTaskId=this.activatedRouter.queryParams['_value'].processInstanceTaskId;
    const cheakData = this.child.checkFormData();
    if (!cheakData) {
      this.message.create('error', `有必填项没有填写`);
      return;
    }

    const code = this.child.infor.code;
    switch (code) {
      case "colseContract":
        this.params.check = 4;
        break
      case "cancelReceipt":
        this.params.check = 3;
        break;
      case "backContract":
        this.params.check=0;
        break;
    }
    this.params.remark = this.child.infor.remarks;
    this.params.file = this.child.infor.file;
    this.params.reason = this.child.infor.refuseReason;
    this.params.mainId=mainId;
    this.params.processInstanceTaskId=processInstanceTaskId;
    let url
    switch(status)
    {
       case 'DOAJDQR': url = '/act/preparation/childOrderCheck';
       break;
       case 'DHTOASH':url='/act/preparation/childOaReview';
       break;
    }
    this.load = true;
    this.http.post(url, this.params).subscribe((rest => {
      if (rest.code === '0000') {
        this.load = false;
        this.message.create('success', rest.msg);
        this.router.navigate(['/igt/my-task']);
        this.child.infor.file = "";
        this.child.infor.refuseReason = null;
        this.child.validateForm.reset();
        this.isAgres = false;
      }
      else{
        this.message.create('error', rest.msg);
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "请求异常")
    }));

  }
  //取消
  isAgreCancels() {
    this.isAgres = false;
  }

  //取消
  isshowDateCancel()
  {
    this.isShowDate=false;
  }
  //取消
  isshowDateCancels()
  {
    this.isShowDates=false;
  }
    //提交效验经销商日期
    getdistributorDate()
    {
      let param={
        pageNo: 1,
        pageSize: 5,
        agreementNo:"", //协议号
        dealerCode:"", //经销code
        dealerName:this.dataBase.distributor, //经销商名称
        selectName:"", //当前选中
      }
        let url=`/act/preparation/getDealersOnlyWithRegFlag`
        return new Promise((resolve, reject) => {
        this.http.post(url,param).subscribe((res=>{

            if(res.code=='0000'&&res.data)
            {
              let data=res.data.rows;
              if(data.length>0)
              {
                let time=standardTime(data[0].ddpValidUntil);
                this.dataBase.ddpStatus =isadopt(time);
                this.dataBase.contractEndDate=formatDatesNow(time);
                if(this.dataBase.ddpStatus!='通过')
                {
                  this.isVisibleDate=true;
                }
              }
              resolve(data)
            }
          }),(error)=>{
            this.message.create("error","请求失败!");

          })
        })
    }
    //提交获取外贸易
    getIepoolDate()
    {
      let param={
        corporateName:this.dataBase.foreignTradeCompany,
      }
      let url=`/act/preparation/getIePool`
      return new Promise((resolve, reject) => {
      this.http.post(url,param).subscribe((res=>{
          if(res.code=='0000'&&res.data)
          {
            let {data}=res;
            if(data.length>0)
            {
              let time=standardTime(data[0].ddpValidUntil);
              this.dataBase.poolEndDate=formatDatesNow(time);
              this.dataBase.contractDdpStatus =isadopt(time);
              if(this.dataBase.contractDdpStatus!='通过')
              {
                this.isVisibleDateIepool=true;
              }
            }
            resolve(data)
          }
        }),(error)=>{
          this.message.create("error","请求失败!");
        })
      })
    }

}
