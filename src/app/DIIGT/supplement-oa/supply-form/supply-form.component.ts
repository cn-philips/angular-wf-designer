import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable, Observer } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from '../../../services';
import { ToastrService } from 'ngx-toastr';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
import { decodeString, getType, upLoadFileNew } from '../../../../assets/js/tools';
import { ServesiceService } from '../../preOrder/servesice.service'

@Component({
  selector: 'app-supply-form',
  templateUrl: './supply-form.component.html',
  styleUrls: ['./supply-form.component.scss']
})
export class SupplyFormComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private toastrService: ToastrService,
    private message: NzMessageService,
    public activatedRouter: ActivatedRoute,
    private nzMessageService: NzMessageService,
    private ServesiceService: ServesiceService,) {

  }

  public fileList: any = []; //附件文件
  public foreignTradeFileList: any = []; //外贸公司出口管制
  public draftFileList: any = []; //备货协议草稿
  public originalFileList: any = []; //备货协议正本
  public sofonFileList: any = []; //sonfonfile
  public paymentFileList: any = []; //付款凭证
  public oMlist: any = [{ email: "www@philips.com", name: "张三" }, { email: "888@philips.com", name: "李四" }]; //oMlist 访问数据结构
  public textLen: any = 255;
  public textLens:any=200;
  public cannel = false;
  public load = false;
  public style: any = { width: '100%' };
  @Input() disa: any = false;
  @Input() dataBase: any = {
    productList: [], // 产品列表
    detail: {
      id: decodeString(this.activatedRouter.queryParams['_value'].id),
      flag: this.activatedRouter.queryParams['_value'].flag,
      status: this.activatedRouter.queryParams['_value'].status,
      taskID: this.activatedRouter.queryParams['_value'].taskID,
    },
  };
  public fileChecked: String[];//选中的文件数组
  //   sofon文件选择框
  public isVisible = false;
  public upmode=true;
  public switchValid = true;
  public params: any = {
    foreignTradeFile: "", //外贸公司出口管制
    stockAgreementDraftFile: "", //备货协议草稿
    stockAgreementFile: "", //备货协议正本
    sofonFile: "", //sofonfile
    paymentVoucherFile: "", //付款条款凭证paymentVoucherFile
    readyTime: "",
    remarks: "",
    file:"",
    logisticsSpecialist:"",//物流专员信息logisticsSpecialist
    sofonNo:"", //sofonNo
  }
  public files: any = {
    thelist: []
   };
  validateForm: FormGroup;
  ngOnChanges()
  {

    if(this.dataBase.hospitalNature)
    {
        if(this.params.sofonNo==""||this.params.sofonNo==null||this.params.sofonNo==undefined)
        {
           this.params.sofonNo=this.dataBase.productList[0].sofonNo;
        }
    }
  }
  ngOnInit() {
    this.validateForm = this.fb.group({
      readyTime: new FormControl({ value: 'Nancy', disabled: true }, null),
      remarks: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      logisticsSpecialist: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      sofonNo: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
      switchValid:[null],
    });
    this.getReadyTime();
    this.getOafile();
    this.getUser();
  }
  log(value: string[]): void {
    this.fileChecked = value;
  }
  handleOk(): void {
    // 只选一个文件时不打包
    if (this.fileChecked != null && this.fileChecked.length == 1){
      this.http.get('/act/system/upload/cp/' + this.fileChecked[0]).subscribe((res1 => {
        if (res1.code == '0000') {
          this.params.sofonFileName = res1.data.FileName;
          this.params.sofonFile = res1.data.FileId;
          this.message.create('success', res1.msg);
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
          this.params.sofonFileName = res1.data.FileName;
          this.params.sofonFile = res1.data.FileId;
          this.message.create('success', res1.msg);
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
    // 对话框事件方法
    showModal(): void {
      this.isVisible = true;
      this.getfilelist();
    }

    getfilelist() {
      const dealFormId = this.dataBase.dealFormId;
      if (dealFormId != '' && dealFormId != undefined && dealFormId != null) {
        let url=`/act/preparation/getAttachmentFromCP/${dealFormId}/SofonOAReturnDoc,SofonOAReturnXml`
        this.http.get(url).subscribe((res => {
          for (let i = 0; i < res.data.length; i++) {
            this.files.thelist[i] = res.data[i];
          }
        }), error => {

          });
      } else {
        this.message.create('error', '请先查询dealFormId');
      }
    }
  //切换
  changeupmode(mode): void{
    this.params.sofonFile='';
    this.params.sofonFileName='';
    this.sofonFileList=[];
    this.upmode = !mode;
  }
  //查询时间
  getReadyTime() {
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const url = `/act/prebook/getExamineByZPM?mainId=${mainId}`;
    this.http.get(url).subscribe(res => {
      this.params.readyTime = res.data.readyTime;
    })
  }
  //oa文件
  getOafile() {
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    let url = `/act/prebook/getExamineByOA?mainId=${mainId}`;
    this.http.get(url).subscribe(res => {
      this.params.foreignTradeFile = res.data.foreignTradeFile;
      this.params.stockAgreementDraftFile = res.data.stockAgreementDraftFile;
      this.params.foreignTradeFileName = res.data.foreignTradeFileName;
      this.params.stockAgreementDraftFileName = res.data.stockAgreementDraftFileName;

      this.viewData("foreignTradeFile","foreignTradeFileList",this.params.foreignTradeFileName);
      this.viewData("stockAgreementDraftFile","draftFileList",this.params.stockAgreementDraftFileName);
      this.BringOMLogisticianIsNull();
    })
  }
  // logisticsSpecialist 为空时第一次填写，默认带入节点审批OM
  public BringOMLogisticianIsNull() {
    if (this.params && this.params.logisticsSpecialist != null && this.params.logisticsSpecialist !== '') {
      return;
    }
    let marinId = decodeString(this.activatedRouter.queryParams['_value'].id);
    let url = `/act/preparation/getOitExpert?mainId=${marinId}`;
    this.http.get(url).subscribe(res => {
      if (res && res.data && res.data[0]) {
        this.params.logisticsSpecialist = res.data[0].email;
      }
    });
  }
//取消
public cancelContract(): void {
  this.router.navigate(['/igt/my-task']);
}
   /**
   * @param   data 回显数据
   * @param   fileList 回显数组
   */
    viewData(data, fileList, name?: any) {
      const bidWinningNotice = this.params[data];
      if (bidWinningNotice != "" && bidWinningNotice != undefined && bidWinningNotice != null) {

        this[fileList] = [];
        let obj = { uid: "", name: "", fileId: "" }
        obj.uid = this.params[data];
        obj.fileId = this.params[data];
        obj.name = name ? name : "下载文件"
        this[fileList].push(obj);
      }
    }

      //获取人员下拉列表
  getUser() {
    let marinId = decodeString(this.activatedRouter.queryParams['_value'].id);
    // let url = `/act/preparation/getOitExpert?mainId=${marinId}`;
    let url = '/act/role/getUsersByRole?role=OM';
    return new Promise((reslove, reject) => {
      this.http.get(url).subscribe((res => {
        this.load = false;
        if (res.code == "0000") {
          this.oMlist = res.data;
          // if (this.oMlist.length == 1) {
          //   this.params.logisticsSpecialist = this.oMlist[0].email;
          // }
          reslove(res.data)
        }
        else {
          this.message.create("error", res.msg)
        }
      }), (error => {
        this.load = false;
        this.message.create("error", "请求异常")
      }))
    })
  }

  cancelAction(): void {
    this.message.info('Cancel this operation');
  }
  confirmApproval(value: any, check: number) {
    this.submitForm(value, check);
  }
  submitForm = (value: any, check: number) => {
    const status = this.activatedRouter.queryParams['_value'].status;
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const processInstanceTaskId = this.activatedRouter.queryParams['_value'].processInstanceTaskId;
    this.params.status = check;
    this.params.mainId = mainId;
    this.params.processInstanceTaskId = processInstanceTaskId;
    let url = '/act/prebook/examineByOASupp';
    if (check == 0) {
      this.validateForm.get('remarks')!.setValidators(Validators.required);
      this.validateForm.get('logisticsSpecialist')!.clearValidators();
      this.validateForm.get('sofonNo')!.clearValidators();
      this.validateForm.get('remarks')!.markAsDirty();
      this.validateForm.get('remarks')!.updateValueAndValidity();
      this.validateForm.get('sofonNo')!.updateValueAndValidity();
      this.validateForm.get('logisticsSpecialist')!.updateValueAndValidity();
      if (!this.validateForm.valid) {
        return;
      }
    }
    else {
      this.validateForm.get('logisticsSpecialist')!.setValidators(Validators.required);
      this.validateForm.get('sofonNo')!.setValidators(Validators.required);
      this.validateForm.get('logisticsSpecialist')!.setValidators(Validators.required);
      this.validateForm.get('remarks')!.clearValidators();
      this.validateForm.get('remarks')!.markAsPristine();
      this.validateForm.get('remarks')!.updateValueAndValidity();
      for (const key in this.validateForm.controls) {
        this.validateForm.controls[key].markAsDirty();
        this.validateForm.controls[key].updateValueAndValidity();
      }
      if (!this.validateForm.valid) {
        this.nzMessageService.warning('缺少必填字段');
        return false;
      }
      if (this.params.foreignTradeFile == "" || this.params.foreignTradeFile == undefined || this.params.foreignTradeFile == null) {
        this.message.create("error", "请上传外贸公司出口管制");
        return false;
      }
      if (this.params.stockAgreementDraftFile == "" || this.params.stockAgreementDraftFile == undefined || this.params.stockAgreementDraftFile == null) {
        this.message.create("error", "请上传备货协议草稿");
        return false;
      }
      if (this.params.stockAgreementFile == "" || this.params.stockAgreementFile == undefined || this.params.stockAgreementFile == null) {
        this.message.create("error", "请上传备货协议正本");
        return false;
      }
      if (this.params.sofonFile == "" || this.params.sofonFile == undefined || this.params.sofonFile == null) {
        this.message.create("error", "请上传sofon文件");
        return false;
      }
      if (this.params.paymentVoucherFile == "" || this.params.paymentVoucherFile == undefined || this.params.paymentVoucherFile == null) {
        this.message.create("error", "请上传付款凭证");
        return false;
      }
    }
    this.load = true;
    this.http.post(url, this.params).subscribe((rest => {
      if (rest.code === '0000') {
        console.log(rest.data);
        this.message.create('success', `${rest.msg}`);
        this.router.navigate(['/igt/my-task']);
        this.load = false;
      } else {
        this.load = false;
        this.message.create('error', `${rest.msg}`);
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "请求异常!")
    }));
  }
  //支持文件上传
  public fileBeforeUpload = (file: UploadFile): boolean => {
    const upLoadFileNews = upLoadFileNew.bind(this);
    upLoadFileNews(file).then((val => {
      this.fileList = val.fileList;
      this.params.file = val.fileId;
    }), (error) => {
      this.params.file = "";
      this.fileList = [];
    });
    return false;
  }
  //进出口管制文件
  public exportFileUpload = (file: UploadFile): boolean => {
    const upLoadFileNews = upLoadFileNew.bind(this);
    upLoadFileNews(file).then((val => {
      this.foreignTradeFileList = val.fileList;
      this.params.foreignTradeFile = val.fileId;
    }), (error) => {
      this.params.foreignTradeFile = "";
      this.foreignTradeFileList = [];
    });
    return false;
  }

  //备货协议草稿
  public draftFileUpload = (file: UploadFile): boolean => {
    const upLoadFileNews = upLoadFileNew.bind(this);
    upLoadFileNews(file).then((val => {
      this.draftFileList = val.fileList;
      this.params.stockAgreementDraftFile = val.fileId;
    }), (error) => {
      this.params.stockAgreementDraftFile = "";
      this.draftFileList = [];
    });
    return false;
  }
  //备货协议正本
  public originalFileUpload = (file: UploadFile): boolean => {
    const upLoadFileNews = upLoadFileNew.bind(this);
    upLoadFileNews(file).then((val => {
      this.originalFileList = val.fileList;
      this.params.stockAgreementFile = val.fileId;
    }), (error) => {
      this.params.stockAgreementFile = "";
      this.originalFileList = [];
    });
    return false;
  }
  //sonfonfile文件上传
  public sonfonFileUpload = (file: UploadFile): boolean => {
    const upLoadFileNews = upLoadFileNew.bind(this);
    upLoadFileNews(file).then((val => {
      this.sofonFileList = val.fileList;
      this.params.sofonFile = val.fileId;
    }), (error) => {
      this.params.sofonFile = "";
      this.sofonFileList = [];
    });
    return false;
  }
  //付款凭证
  public paymentFileUpload = (file: UploadFile): boolean => {
    const upLoadFileNews = upLoadFileNew.bind(this);
    upLoadFileNews(file).then((val => {
      this.paymentFileList = val.fileList;
      this.params.paymentVoucherFile = val.fileId;
    }), (error) => {
      this.params.paymentVoucherFile = "";
      this.paymentFileList = [];
    });
    return false;
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

  // 文件下载
  public fileDwon(id) {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf('#');
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${id}`;
    window.open(url, '_blank');
  }
  //删除文件上传按钮
  nzRemovefile = (file: UploadFile): any => {
    this.params.file = "";
    return true;
  }

  //删除外贸公司出口管制文件
  nzRemoveExportFile = (file: UploadFile): any => {
    this.params.foreignTradeFile = "";
    return true;
  }

  //删除备货协议草稿
  nzRemoveDraftFile = (file: UploadFile): any => {
    this.params.stockAgreementDraftFile = "";
    return true;
  }
  //删除备货协议正本
  nzRemoveOriginalFile = (file: UploadFile): any => {
    this.params.stockAgreementFile = "";
    return true;
  }
  //删除备货协议正本
  nzRemoveSofonFile = (file: UploadFile): any => {
    this.params.sofonFile = "";
    return true;
  }
  //删除付款凭证
  nzRemovePaymentFile = (file: UploadFile): any => {
    this.params.paymentVoucherFile = "";
    return true;
  }

}
