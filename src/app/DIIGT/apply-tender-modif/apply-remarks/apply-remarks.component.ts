import { Component, OnInit,Input,Output,EventEmitter} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NzMessageService,UploadFile} from 'ng-zorro-antd';
import { HttpService } from '../../../services';
import { formatDates, formatDate, decodeString,getType} from '../../../../assets/js/tools';
@Component({
  selector: 'app-apply-remarks',
  templateUrl: './apply-remarks.component.html',
  styleUrls: ['./apply-remarks.component.scss']
})
export class ApplyRemarksComponent implements OnInit {

  constructor(private fb: FormBuilder,private http: HttpService,private message: NzMessageService,public activatedRouter: ActivatedRoute,) { }
  @Input() isDisable:any=false;
  @Input() dataBase:any;
  @Output() myEvent = new EventEmitter()
  flag:any="0"
  fileList:any=[]//文件上传
  load:any=false;
  public textLen:any=255;//文本输入限制长度
  ngOnChanges()
  {
    this.viewData("file","fileList");
  }
  ngOnInit() {
    this.viewData("file","fileList");
    this.flag=this.activatedRouter.queryParams['_value'].flag;
    this.validateForm = this.fb.group({
      remarks: new FormControl({ value: 'Nancy', disabled:this.flag==1}, Validators.required),
    });
  }
  /**
   * data 回显数据  fileList回显数组
   */
   viewData(data,fileList)
   {
     const bidWinningNotice=this.dataBase[data];
     if(bidWinningNotice!=""&&bidWinningNotice!=undefined&&bidWinningNotice!=null)
     {

      this[fileList]= [];
      let obj = { uid: "", name: "", fileId: "" }
      obj.uid = this.dataBase[data];
      obj.fileId =this.dataBase[data];
      obj.name = "文件下载";
      this[fileList].push(obj);
     }

   }
  prev(){
    this.myEvent.emit("complete-record"); //传参给父组件;
  }
  checkFormData = () => {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    return this.validateForm.valid;
  };
  //项目解决方案售前支持报告
beforeUpload=(file: UploadFile): boolean => {
  const isLt2M = file.size / 1024 / 1024 < 100; //文件大小不超过100M
  const fileType = getType(file);
  if (fileType === "exe" || fileType === "bat") {
    this.message.create("error", "上传文件格式错误!");
    return false;
  }
  if (!isLt2M) {
    this.message.create("error", "文件大小不超过100M");
    return false;
  }
  this.upload("fileList",file,"file")
  return false;
}
// 文件删除回调
  public removeFile = (file: UploadFile): boolean => {
    this.dataBase.fileId = '';
    return true;
    // console.log(e);
  }
//上传文件下载
dwonLoad = (file: UploadFile): void => {
  const urlPath = window.document.location.href;
  const docPath = window.document.location.pathname;
  const index = urlPath.indexOf("#");
  const serverPath = urlPath.substring(0, index);
  const url = `${serverPath}act/system/download/${file.fileId}`;
  window.open(url, '_blank');
};
  //文件下载
  fileDwon(id)
  {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf("#");
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${id}`;
    window.open(url, '_blank');
  }
    /**
     * filist 在线显示的文件 file上传的文件 fileId绑定的上传文件的id
    */
     upload(fileList, file, fileId) {

      this[fileList] = [];
      let type = getType(file);
      this[fileList].push(file);
      const formData = new FormData();
      this[fileList].forEach((file: any) => {
        formData.append('file', file);
        formData.append('fileType', type);
        formData.append('filename', file.name);
      });
      this.load = true;
      const url = "/act/system/upload";
      this.http.posts(url, formData).subscribe((res => {
        if (res.code === "0000") {
          this.load = false;
          this[fileList][0].fileId = res.data;
          this.dataBase[fileId] = res.data;
          this.message.create("success", res.msg)
        }
        else {
          this.message.create("error", res.msg)
        }
      }),(error)=>{
        this.load=false;
        this[fileList] = [];
        this.message.create("error","上传失败请重新上传!");
      })
    }

  validateForm: FormGroup;

}
