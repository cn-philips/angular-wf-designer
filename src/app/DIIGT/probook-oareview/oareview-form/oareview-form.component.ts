import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable, Observer } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from '../../../services';
import { ToastrService } from 'ngx-toastr';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
import { decodeString, getType,upLoadFileNew } from '../../../../assets/js/tools';
import { ServesiceService } from '../../preOrder/servesice.service'

@Component({
  selector: 'app-oareview-form',
  templateUrl: './oareview-form.component.html',
  styleUrls: ['./oareview-form.component.scss']
})
export class OareviewFormComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private toastrService: ToastrService,
    private message: NzMessageService,
    public activatedRouter: ActivatedRoute,
    private nzMessageService: NzMessageService,
    private ServesiceService: ServesiceService,) {

   }
   public fileList:any=[]; //附件文件
   public foreignTradeFileList:any=[]; //外贸公司出口管制
   public draftFileList:any=[]; //备货协议草稿
  public textLen: any = 255;  
  public cannel = false;
  public load=false;
  public status:any=false;
  public flag:any;
  public style: any = { width: '100%' };
  @Input() disa:any= false;
  @Input() dataBase: any = {
    productList: [], // 产品列表
    detail: {
      id: decodeString(this.activatedRouter.queryParams['_value'].id),
      flag: this.activatedRouter.queryParams['_value'].flag,
      status: this.activatedRouter.queryParams['_value'].status,
      taskID: this.activatedRouter.queryParams['_value'].taskID,
    },
  };
  public params:any={
    foreignTradeFile:"", //外贸公司出口管制
    foreignTradeFileName:"",     
    stockAgreementDraftFile:"", //备货协议草稿
    stockAgreementDraftFileName:"",
    readyTime:"",
    remarks:"",
    file:"",
  }
  validateForm: FormGroup;

  ngOnInit() {
    this.validateForm = this.fb.group({
      readyTime:new FormControl({ value: 'Nancy', disabled:true}, null),
      remarks: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
    });
    this.status=this.activatedRouter.queryParams['_value'].status;
    this.flag=this.activatedRouter.queryParams['_value'].flag;
    this.getReadyTime();
    if(this.status!='prebook_oa_approval')
    {
      this.getOafile();
    }    
  }
   //oa文件
   getOafile()
   {
     
     const mainId=decodeString(this.activatedRouter.queryParams['_value'].id);
     let url=`/act/prebook/getExamineByOA?mainId=${mainId}`;
     this.http.get(url).subscribe(res=>{
        this.params.foreignTradeFile=res.data.foreignTradeFile;
        this.params.stockAgreementDraftFile=res.data.stockAgreementDraftFile;
        this.params.foreignTradeFileName=res.data.foreignTradeFileName;
        this.params.stockAgreementDraftFileName=res.data.stockAgreementDraftFileName;
     })
   }
   //查询时间
   getReadyTime()
   {
     const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
     const url=`/act/prebook/getExamineByZPM?mainId=${mainId}`;
     this.http.get(url).subscribe(res=>{      
       this.params.readyTime=res.data.readyTime;
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
    const processInstanceTaskId=this.activatedRouter.queryParams['_value'].processInstanceTaskId;
    this.params.status=check;
    this.params.mainId=mainId;
    this.params.processInstanceTaskId=processInstanceTaskId;
    let url = '';
    switch (status) {
      //状态 
      case 'prebook_oa_approval':  //oa审核
        url = '/act/prebook/examineByOA';
        break;
      case 'prebook_district_leader_approval': //dsi leader审核
      case 'prebook_sales_leader_approval':  //sales leader审核
        url='/act/prebook/examine';  
        break;
    }
    if (check == 0) 
    {
      this.validateForm.get('remarks')!.setValidators(Validators.required);     
      this.validateForm.get('remarks')!.markAsDirty();
      this.validateForm.get('remarks')!.updateValueAndValidity();     
      if (!this.validateForm.valid) {
        return;
      }
    }
    else 
    {

      this.validateForm.get('remarks')!.clearValidators();
      this.validateForm.get('remarks')!.markAsPristine();
      this.validateForm.get('remarks')!.updateValueAndValidity();
     
    }
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
      this.validateForm.controls[key].updateValueAndValidity();
    }
   
    if (!this.validateForm.valid) {
      this.nzMessageService.warning('缺少必填字段');
      return false;
    }
    
    if(status=='prebook_oa_approval'&&check==1)
    {
        
        if(this.params.foreignTradeFile==""||this.params.foreignTradeFile==null||this.params.foreignTradeFile==undefined)
        {
          this.message.create("error","请上传外贸公司出口管制")
          return 
        }
        if(this.params.stockAgreementDraftFile==""||this.params.stockAgreementDraftFile==null||this.params.stockAgreementDraftFile==undefined)
        {
          this.message.create("error","请上传备货协议草稿")
          return 
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
  public foreignTradeFileUpload=(file: UploadFile): boolean => {
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
  //取消
  public cancelContract(): void {
    this.router.navigate(['/igt/my-task']);
  }
   //备货协议草稿
   public draftFileUpload=(file: UploadFile): boolean => {
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
    this.params.file= "";
    return true;
  }

   //删除外贸公司出口管制文件
   nzRemoveforeignTradeFile = (file: UploadFile): any => {
    this.params.foreignTradeFile= "";
    return true;
  }

  //删除备货协议草稿
  nzRemoveDraftFile = (file: UploadFile): any => {
    this.params.stockAgreementDraftFile= "";
    return true;
  }

}
