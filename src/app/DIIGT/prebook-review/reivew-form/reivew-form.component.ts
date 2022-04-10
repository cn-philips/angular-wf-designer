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
  selector: 'app-reivew-form',
  templateUrl: './reivew-form.component.html',
  styleUrls: ['./reivew-form.component.scss']
})
export class ReivewFormComponent implements OnInit {
  
  constructor(private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private toastrService: ToastrService,
    private message: NzMessageService,
    public activatedRouter: ActivatedRoute,
    private nzMessageService: NzMessageService,
    private ServesiceService: ServesiceService,) 
    {

    }
  public style: any = { width: '100%' };
  public status:any
  public fileList:any=[];  
  public textLen: any = 255;  
  public cannel = false;
  public load=false;
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
    readyTime:"",
    remarks:"",
    file:"",
  }
  validateForm: FormGroup;
  ngOnInit() {
    this.status=this.activatedRouter.queryParams['_value'].status;    
    this.status=='prebook_dsi_approval'&&this.getReadyTime();
    this.validateForm = this.fb.group({
      readyTime:new FormControl({ value: 'Nancy', disabled: this.disa||this.status=='prebook_dsi_approval'}, null),
      remarks: new FormControl({ value: 'Nancy', disabled: this.disa }, null),
    });
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
  //取消
  public cancelContract(): void {
    this.router.navigate(['/igt/my-task']);
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
    this.params.mainId=mainId;
    this.params.status=check;
    this.params.processInstanceTaskId=processInstanceTaskId;
    let url = '/act/prebook/examineByZPM'; 
    switch(status)
    {
      case "prebook_zpm_approval":
        url='/act/prebook/examineByZPM'
        break
      case "prebook_dsi_approval":
        url='/act/prebook/examine'
        break 
    }  
    if (check == 0) 
    {
      this.validateForm.get('remarks')!.setValidators(Validators.required);
      this.validateForm.get('readyTime')!.clearValidators();
      this.validateForm.get('remarks')!.markAsDirty();
      this.validateForm.get('remarks')!.updateValueAndValidity();
      this.validateForm.get('readyTime')!.updateValueAndValidity();
      if (!this.validateForm.valid) {
        return;
      }
    }
    else 
    {
      this.validateForm.get('readyTime')!.setValidators(Validators.required);
      this.validateForm.get('remarks')!.clearValidators();
      this.validateForm.get('remarks')!.markAsPristine();
      this.validateForm.get('remarks')!.updateValueAndValidity();
      this.validateForm.get('readyTime')!.updateValueAndValidity();
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
    this.http.post(url, this.params).subscribe((rest => {
      if (rest.code === '0000') {        
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
}
