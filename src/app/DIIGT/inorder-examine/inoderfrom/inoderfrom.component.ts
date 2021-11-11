import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable, Observer } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from '../../../services';
import { ToastrService } from 'ngx-toastr';
import {NzMessageService, UploadFile} from 'ng-zorro-antd';
import {decodeString, getType} from '../../../../assets/js/tools';



@Component({
  selector: 'app-inoderfrom',
  templateUrl: './inoderfrom.component.html',
  styleUrls: ['./inoderfrom.component.scss']
})
export class InoderfromComponent implements OnInit {
  public load: any = false;
  public textLen:any=255;
  public fileFileList = []; //
  flag:any;
  params: any = {
    remark: "",
    file: "",
    mainId: decodeString(this.activatedRouter.queryParams['_value'].id),
    check:0, // 1 通过， 0 拒绝
  }
  validateForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private toastrService: ToastrService,
    private message: NzMessageService,
    public activatedRouter: ActivatedRoute,
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
        this.params.file = res.data;
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
  // 上传文件下载
  public dwonLoad = (file: UploadFile): void => {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf('#');
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${file.fileId}`;
    window.open(url, '_blank');
  }
  // 上传文件
  public fileBeforeUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 20; // 文件大小不超过100M
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

  ngOnInit() {
    this.flag = this.activatedRouter.queryParams['_value'].flag;
    this.validateForm = this.fb.group({
      remark: new FormControl({ value: 'Nancy', disabled:this.flag == 1 }, Validators.required)
    })
  }
  sumbit(parm:number) {
    let url="/act/preparation/orderSummaryReview";
    this.params.check=parm;
    if(parm==0)
    {
      this.validateForm.controls['remark'].markAsDirty();
      this.validateForm.controls['remark'].updateValueAndValidity();
      if(!this.validateForm.valid)
       {
        return;
       }

    }
    this.load=true;
    this.http.post(url,this.params).subscribe((rest => {
      if (rest.code === '0000') {
        this.load=false;
        this.message.create('success', '操作成功');        
          this.router.navigate(['/igt/my-task']);       
      } else {
        this.message.create('error', `${rest.msg}`);
      }

    }),(error=>{
      this.load=false;
      this.message.create("error","请求异常!")
      
    }))
  }

}
