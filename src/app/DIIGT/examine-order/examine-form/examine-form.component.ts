import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable, Observer } from 'rxjs';
import {Router, ActivatedRoute} from '@angular/router';
import {HttpService} from '../../../services';
import {ToastrService} from 'ngx-toastr';
import {NzMessageService, UploadFile} from 'ng-zorro-antd';
import {decodeString, getType} from '../../../../assets/js/tools';

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
  @Input() disa = false;
  public textLen:any=255;
  public cannel=false;
  value: string;
  selectedValue = null;
  validateForm: FormGroup;
  dateFormat = 'yyyy/MM/dd';
  load: any = false;
  roleCode:any;
  public fileFileList = []; //
  params = {
    check: 0, // 1 通过， 0 拒绝
    file: [], // 上传附件
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
  };
  public DfbshObj = {
    paymentProvision: '待C&C Leader审核',
    installationWarranty: '待S&SD Marketing Leader审核',
    shipmentDelivery: '待CFC Distributor leader审核',
    amountDifference: '待OIT committee审核',
    sitePreparation: '待CFC PM Leader审核',
    performanceBond: '待Cluster BP审核',
  };

  date = null; // new Date();
  dateRange = []; // [ new Date(), addDays(new Date(), 3) ];
  isEnglish = false;

  controlArray: any[] = [];
  isCollapse = false;
  public withdraw:any=false;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private toastrService: ToastrService,
    private message: NzMessageService,
    public activatedRouter: ActivatedRoute,
    private nzMessageService: NzMessageService,
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
    }),(error=>{
      this.load=false;
      this[fileList] = [];
      this.message.create("error","上传失败请重新上传");
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

  ngOnInit(): void {
    this.roleCode=localStorage.getItem("roleCode");
    this.dataBase.detail.taskID = this.activatedRouter.queryParams['_value'].taskID;    
    this.params.taskID = this.activatedRouter.queryParams['_value'].taskID;
    this.disa = this.dataBase.detail.flag==='1'? true : false;

    this.validateForm = this.fb.group({
      // file: [null],
      // remark: [null],
      // paymentProvisionRadio: [null, [Validators.required]],
      // taskID: [null],
      file: new FormControl({ value: 'Nancy', disabled: this.disa },null),
      remark: new FormControl({ value: 'Nancy', disabled: this.disa},null),
      paymentProvisionRadio: new FormControl({ value: 'Nancy', disabled: this.disa },null),
      taskID: new FormControl({ value: 'Nancy', disabled: this.disa },null),
    });
    //DFBSH这种状态设置为必填项
    if (this.dataBase.detail.status === 'DFBSH' && this.dataBase.detail.taskID === 'paymentProvision') {
      this.validateForm.get('paymentProvisionRadio')!.setValidators(Validators.required);
      this.validateForm.get('paymentProvisionRadio')!.markAsDirty();
    }
    this.validateForm.get('paymentProvisionRadio')!.updateValueAndValidity();
    this.getCheck();
  }
  
  confirmApproval (value: any, check: number) {
    this.submitForm(value, check);
  }

  cancelAction(): void {
    this.nzMessageService.info('Cancel this operation');
  }
  //取消
  sumbitBack()
  {
    const  mainId=decodeString(this.activatedRouter.queryParams['_value'].id);
    let url=`/act/preparation/childOaTermination`;
    const params={
      mainId:mainId,
      remark:this.params.remark, // 备注
    }
    this.validateForm.get('remark')!.setValidators(Validators.required);
    this.validateForm.get('remark')!.markAsDirty();
    this.validateForm.get('remark')!.updateValueAndValidity();
    this.cannel=true;
     if(!this.validateForm.valid)
     {
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
    this.load=true;
    this.http.post(url,params).subscribe((res=>{
      this.load=false;
      if(res.code=='0000')
      {
        this.router.navigate(['/igt/my-task']);      
        this.message.create("success","请求成功!");
      }
    }),(error)=>{
      this.load=false;
      this.message.create("error","请求异常!");
    })
  }
  //检查是否可以撤回
  getCheck()
  {
   const  mainId=decodeString(this.activatedRouter.queryParams['_value'].id);
   const url=`/act/preparation/checkCanBeTerminated/${mainId}`
   this.http.get(url).subscribe(res=>{ 
        if(res.code=='0000')
        {
          this.withdraw=res.data;
        }
   })
  }
  submitForm = (value: any, check: number) => {
    // $event.preventDefault();
    const status = this.activatedRouter.queryParams['_value'].status;
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
    }
    let params = {
      check: check, // 1 通过， 0 拒绝
      file: this.params.file.toString(), // 上传附件
      mainId: decodeString(this.activatedRouter.queryParams['_value'].id),
      remark: this.params.remark, // 备注
      taskID:this.activatedRouter.queryParams['_value'].taskID,
      tenderNo:this.dataBase.tenderNo, //招标编号
      hospitalNature:this.dataBase.hospitalNature, //医院性质
      entryMode:this.dataBase.entryMode
    };
    this.cannel=false;
    if(check==0)
    {
      this.validateForm.get('remark')!.setValidators(Validators.required);
      this.validateForm.get('remark')!.markAsDirty();
      this.validateForm.get('remark')!.updateValueAndValidity();
      if(!this.validateForm.valid)
       {
        return;
       }
    }
    else{
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
      });
    }
    if(status==='DHTOASH')  //oa审核的时候的提交参数
    {
      params = Object.assign(params, {
        performanceBondRemarks:this.dataBase.performanceBondRemarks,
        shipmentDeliveryRemarks:this.dataBase.shipmentDeliveryRemarks,
        installationWarrantyRemarks:this.dataBase.installationWarrantyRemarks,
        amountDifferenceRemarks:this.dataBase.amountDifferenceRemarks,
        sitePreparationRemarks:this.dataBase.sitePreparationRemarks,
        paymentProvisionRemarks:this.dataBase.paymentProvisionRemarks,
        supportFileMissingRemarks:this.dataBase.supportFileMissingRemarks,
        otherRemarks:this.dataBase.otherRemarks,
        installationWarrantyRadio: this.dataBase.installationWarrantyRadio,
      });
    }
    this.load=true;
    this.http.post(url, params).subscribe((rest => {
      if (rest.code === '0000') {
        console.log(rest.data);
        this.message.create('success', `${rest.msg}`);
        // setTimeout(() => {
          this.router.navigate(['/igt/my-task']);
          this.load=false;
       // }, 3000);
      } else {
        this.load=false;
        this.message.create('error', `${rest.msg}`);
      }
    }),(error=>{
      this.load=false;
      this.message.create("error","请求异常!")
    }));
  }
  // 上一步
  prevStep () {
  }
  // 清空表单选项
  resetForm () {
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

}
