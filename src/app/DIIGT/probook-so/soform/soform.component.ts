import { Component, OnInit,Input } from '@angular/core';
import {Router,ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { decodeString, formatDatesNowMth, formatDatesNow,getType,upLoadFileNew} from '../../../../assets/js/tools';
import { HttpService, FileService } from '../../../services';
import { NzMessageService,UploadFile} from 'ng-zorro-antd';
@Component({
  selector: 'app-soform',
  templateUrl: './soform.component.html',
  styleUrls: ['./soform.component.scss']
})
export class SoformComponent implements OnInit {

  constructor(public activatedRouter: ActivatedRoute,private router: Router,private fb: FormBuilder,private message: NzMessageService,private http: HttpService,) { }
  validateForm: FormGroup;
  public textLens=255;
  public textLen=100;
  public fileFileList=[];
  public load=false;
  public nzShowUploadList={
    showPreviewIcon:true,
    showRemoveIcon:false, 
  }
  @Input() disa: any = false;
  public oMlist: any;
  public flag;
 param:any={
  id:"",
  so:"",
  remark:"",
  file:"",
  fileName:"",
  readyTime:"",
  sofonNo:"",
  logisticsSpecialist:"",
  foreignTradeFile:"",  //出口管制
  stockAgreementDraftFile:"", //备货协议草稿
  stockAgreementFile:"", //备货协议正本
  sofonFile:"",//sofon文件
  paymentVoucherFile:"", //付款凭证
 };
 public style: any = { width: '100%' };
  ngOnInit() {
    const flag = this.activatedRouter.queryParams['_value'].flag;
    this.flag=flag;
    this.validateForm = this.fb.group({
      logisticsSpecialist:new FormControl({ value:'',disabled:true},null),
      sofonNo:new FormControl({ value:'',disabled:true},null),
      readyTime:new FormControl({ value:'',disabled:true},null),
      remarks: new FormControl({ value:'',disabled:this.disa},null),
      so:new FormControl({ value:'',disabled:this.disa},[Validators.required,this.cheakSo]),
    })
    this.nzShowUploadList.showRemoveIcon=!this.disa?true:false;    
    let status = this.activatedRouter.queryParams['_value'].status;
    status=='prebook_end'&&this.getBase();
    this.getUser();
    this.getReadyTime();
    this.getOafile();
  }

   //oa文件
   getOafile()
   {
     
     const mainId=decodeString(this.activatedRouter.queryParams['_value'].id);
     let url=`/act/prebook/getExamineByOA?mainId=${mainId}`;
     this.http.get(url).subscribe(res=>{       
        this.param.foreignTradeFile=res.data.foreignTradeFile;
        this.param.stockAgreementDraftFile=res.data.stockAgreementDraftFile;
        this.param.foreignTradeFileName=res.data.foreignTradeFileName;
        this.param.stockAgreementDraftFileName=res.data.stockAgreementDraftFileName;
        this.param.logisticsSpecialist=res.data.logisticsSpecialist;
        this.param.sofonNo=res.data.sofonNo;
        this.param.paymentVoucherFile=res.data.paymentVoucherFile;
        this.param.paymentVoucherFileName=res.data.paymentVoucherFileName;
        this.param.sofonFile=res.data.sofonFile;
        this.param.sofonFileName=res.data.sofonFileName;
        this.param.stockAgreementFile=res.data.stockAgreementFile;
        this.param.stockAgreementFileName=res.data.stockAgreementFileName;
        
     })
   }

   //查询时间
   getReadyTime() {
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const url = `/act/prebook/getExamineByZPM?mainId=${mainId}`;
    this.http.get(url).subscribe(res => {
      this.param.readyTime = res.data.readyTime;
    })
  }
    //获取人员下拉列表
    getUser() {
      let marinId = decodeString(this.activatedRouter.queryParams['_value'].id);
      let url = `/act/preparation/getOitExpert?mainId=${marinId}`;
      return new Promise((reslove, reject) => {
        this.http.get(url).subscribe((res => {
          this.load = false;
          if (res.code == "0000") {
            this.oMlist = res.data;
            if (this.oMlist.length == 1) {
              this.param.logisticsSpecialist = this.oMlist[0].email;
            }
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
//取消
public cancelContract(): void {
  this.router.navigate(['/igt/my-task']);
}
  getBase()
  {
    
    let mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    let url=`/act/prebook/getExamineBySo?mainId=${mainId}`;
    this.http.get(url).subscribe(res => {            
      if (res.code === '0000' && res.data) {               
        if (res.data) {
          
          this.param.remarks = res.data.remarks;
          this.param.so=res.data.so;          
          this.param.file=res.data.file?res.data.file:"";
          this.param.fileName=res.data.fileName?res.data.fileName:"";          
          this.viewData("file", "fileFileList", this.param.fileName);
        }
      }
      else{
        // this.message.create("error",res.msg)
      }
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
      const upLoadFileNews = upLoadFileNew.bind(this);
      upLoadFileNews(file).then((val => {
        this.fileFileList = val.fileList;
        this.param.file = val.fileId;
      }), (error) => {
        this.param.file = "";
        this.fileFileList = [];
      });
      return false;   
    }
    nzRemoveFile=(file: UploadFile): any => {
      this.param.file="";      
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
  submit() {
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const processInstanceTaskId=this.activatedRouter.queryParams['_value'].processInstanceTaskId;
    const {so}=this.validateForm.getRawValue()
    // let url = `/act/preparation/oitRealTime?mainId=${mainId}&subProStatusTime=${spa}`;
    let url = '/act/prebook/examineBySo';
    const param = {
      status:'1',
      id:this.param.id,
      mainId: mainId,
      so: so,
      remarks: this.param.remarks,
      file:this.param.file,
      processInstanceTaskId:processInstanceTaskId
    }
    this.validateForm.controls['so'].markAsDirty();
    this.validateForm.controls['so'].updateValueAndValidity();
    if(!this.validateForm.valid)
    {
       return;
    }     
    this.http.post(url, param).subscribe(res => {
      if (res.code=="0000") {
        this.message.create('success', res.msg);
        this.router.navigate(["/igt/my-task"]);        
      }
      else {
        this.message.create('error', res.msg);
      }
    })
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

}
