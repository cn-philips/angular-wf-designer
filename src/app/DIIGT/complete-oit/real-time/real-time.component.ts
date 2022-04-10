import { Component, OnInit,Input} from '@angular/core';
import {Router,ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { decodeString, formatDatesNowMth, formatDatesNow,getType} from '../../../../assets/js/tools';
import { HttpService, FileService } from '../../../services';
import { NzMessageService,UploadFile} from 'ng-zorro-antd';
@Component({
  selector: 'app-real-time',
  templateUrl: './real-time.component.html',
  styleUrls: ['./real-time.component.scss']
})

export class RealTimeComponent implements OnInit {

  constructor(public activatedRouter: ActivatedRoute,private router: Router,private fb: FormBuilder,private message: NzMessageService,private http: HttpService,) { }
  validateForm: FormGroup;
  public textLens=255;
  public textLen=100;
  public fileFileList=[];
  public load=false;
  @Input() public dataBase:any={}
public soNo:any;
 param:any={  
  id:"",
  spa:"",
  remark:"",
  file:"",
  fileNames:""
 };
 ngOnChanges()
 {
  this.dataBase.isPrebook=this.dataBase.isPrebookApply!=null?this.dataBase.isPrebookApply.toString():'0';
  this.dataBase.isPrebook!=null&&this.getSo();
 }
  ngOnInit() {
    const flag = this.activatedRouter.queryParams['_value'].flag;
    this.validateForm = this.fb.group({
      remark: new FormControl({ value:''},null),
      spa:new FormControl({ value:''},[Validators.required,this.cheakSo]),
    })
    this.getBase();
    this.getSo();
  }
  getBase()
  {
    let url=`/act/preparation/getOitRealTime`;
    let mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const param={
      mainId:mainId,
    }
    this.http.post(url, param).subscribe(res => {      
      if (res.code === '0000' && res.data) {
        const {subProStatusTime} = res.data;
        if (res.data) {
          this.param.remark = res.data.remark;
          this.param.spa=res.data.subProStatusTime;
          this.param.id=res.data.id;
          this.param.file=res.data.file?res.data.file:"";
          this.param.fileNames=res.data.fileNames?res.data.fileNames:"";          
          this.viewData("file", "fileFileList", this.param.fileNames);
        }
      }
      else{
         //this.message.create("error",res.msg)
      }
    })

  }
  //getso
  getSo()
  {
    let mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const url=`/act/prebook/getPreBookSoByOrderId?mainId=${mainId}`;
    this.http.get(url).subscribe((res => {      
      if (res.code === '0000' && res.data) {        
        if (res.data) {
          this.soNo=res.data.so;
        }
      }
      else{
        // this.message.create("error",res.msg)
      }
    }),(error)=>{
          this.message.create("error","请求异常");
    })
  }
  cheakSo(control: FormControl) {
    if (control.value) {
      const reg = /^([\d;\s]{0,1000}$)$/;
      //const reg=/^[0-9a-zA-Z_\@\.\s\-]*$/g;
      //const reg = /^(?!\@)+(?!\_)+[0-9a-zA-Z_\@\.\s\-]*$/g;
      const valid = reg.test(control.value); // true
      return valid ? null : { soform: true };
    }
  }
    //附件上传
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
    nzRemoveFile=(file: UploadFile): any => {
      this.param.file="";      
      return true;
    } 
  /**
   * @param   data 回显数据
   * @param   fileList 回显数组
   */
   viewData(data, fileList, name?: any) {
     
    const bidWinningNotice = this.param[data];
    if (bidWinningNotice != "" && bidWinningNotice != undefined && bidWinningNotice != null) {

      this[fileList] = [];
      let obj = { uid: "", name: "", fileId: "" }
      obj.uid = this.param[data];
      obj.fileId = this.param[data];
      obj.name = name ? name : "下载文件"
      this[fileList].push(obj);
    }
  }   
  /**
   * filist 在线显示的文件 file上传的文件 fileId绑定的上传文件的id
   */
   public upload(fileList, file, fileId) {
    this[fileList] = [];
    const type = getType(file);
    this[fileList].push(file);
    const formData = new FormData();    
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
        this.param[fileId] = res.data;
        this.message.create('success',res.msg);
      } else {
        this.message.create('error', res.msg);
      }
    }),(error=>{
      this.load=false;
      this[fileList] = [];
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
  submit() {
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const {spa}=this.validateForm.getRawValue()
    // let url = `/act/preparation/oitRealTime?mainId=${mainId}&subProStatusTime=${spa}`;
    let url = '/act/preparation/oitRealTime';
    const param = {
      id:this.param.id,
      mainId: mainId,
      subProStatusTime: spa,
      remark: this.param.remark,
      file:this.param.file,
    }
    this.validateForm.controls['spa'].markAsDirty();
    this.validateForm.controls['spa'].updateValueAndValidity();
    if(!this.validateForm.valid)
     {
      return;
     }
     this.load=true;
    this.http.post(url, param).subscribe((res => {
      if (res.code=="200") {
        this.message.create('success',res.msg);
        this.router.navigate(["/igt/my-task"])
      }
      else {
        this.message.create('error', res.msg);
      }
     this.load=false;
    }),(error)=>{
      this.load=false;
      this.message.create("error","请求异常");
    })
  }

}
