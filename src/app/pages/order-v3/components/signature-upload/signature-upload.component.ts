import { Component, forwardRef, OnInit, Input, TemplateRef, Output, EventEmitter } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { UploadXHRArgs, NzModalService } from "ng-zorro-antd";
import { HttpService } from "@core/services/http.service";
import { getType } from "@core/util/tools";
import { saveAs } from 'file-saver';
import { NzMessageService } from "ng-zorro-antd";
import { FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from "@angular/forms";

interface CommonResponse {
  code: string;
  data: any;
  msg: string;
}
@Component({
  selector: 'signature-upload',
  templateUrl: './signature-upload.component.html',
  styleUrls: ['./signature-upload.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => SignatureUploadComponent),
    },
  ],
})
export class SignatureUploadComponent implements OnInit {
  @Input() limit = 5;
  @Input() hint: string; // 提示信息
  @Input() type: string | null = 'drag'
  @Input() title: any = "";
  @Output() fileDeleted: EventEmitter<any> = new EventEmitter()

  @Input() disabled = false
  @Input() ifShowPageNavigator=true
  constructor(private modal: NzModalService,
    private http: HttpService,
    private message: NzMessageService,
    private fb: FormBuilder) {

  }
  fileList = []; // 文件列表
  fileFormGroup: FormGroup = this.fb.group({
    fileListFormGroup: this.fb.array([]),
  })
  // 是否显示页面定位输入框
  get showPageNavigator(){
    return this.ifShowPageNavigator;
  }

  get fileListFormGroup() {
    return this.fileFormGroup.get('fileListFormGroup') as FormArray;
  }

  load = false;
  onBeforeUpload = (file) => {
    const fileType = getType(file);
    if (fileType === "pdf") {
      this.load = true;
      return true;
    }
    else{
      this.message.create('error', '上传文件格式错误!');
      this.load = false;
      return false;
    }
  };
  uploadFile(data) {
    const uri = "/act/system/upload";
    return this.http.posts(uri, data);
  }
  createFrom(val) {
    const group = {
      name: [{ value: val.name, disabled: true }],
      status: [{ value: val.status, disabled: true }],
      fileId: [{ value: val.fileId, disabled: true }],
      uid: [{ value: val.uid, disabled: true }],
      attachmentComment: [{ value: val.attachmentComment,disabled:this.disabled}, [this.cheakSo]],
    }
    return this.fb.group({
      ...group,
    });

  }
  cheakSo(control: FormControl) {
    if (control.value) {
      const reg = /^[0-9,]*$/;
      //const reg=/^[0-9a-zA-Z_\@\.\s\-]*$/g;
      //const reg = /^(?!\@)+(?!\_)+[0-9a-zA-Z_\@\.\s\-]*$/g;
      const valid = reg.test(control.value); // true
      return valid ? null : { soform: true };
    }
  }
  clearFormArray = (formArray: FormArray) => {
    //清除fromarray
    while (formArray.length !== 0) {
      formArray.removeAt(0)
    }
  }
  inputBlur(event)
  {
    this.onChange(this.fileListFormGroup)
  }
  onUploadFile = (item: UploadXHRArgs) => {
    const formData = new FormData();
    const file = item.file as any;
    formData.append("file", file);
    formData.append("fileType", getType(file));
    formData.append("filename", file.name);
    const newFile = {
      status: 'uploading',
      name: file.name,
      fileId: Date.now(),
      uid: file.uid,
    }
    this.fileList = [...this.fileList, newFile]

    return this.uploadFile(formData).subscribe(
      (response: CommonResponse) => {
        const { data, code } = response;
        this.clearFormArray(this.fileListFormGroup)
        if ("0000" === code) {
          this.fileList = this.fileList
            .map((file) =>
              file.uid === newFile.uid ? {
                ...file,
                fileId: data,
                status: 'success',
              } : file
            )
          const valid = this.fileList.every(file => file.status == 'success')
          if (valid) {
            this.load = false;
          }
          this.fileList.forEach(item => {
            this.fileListFormGroup.push(this.createFrom(item))
          })
          this.onChange(this.fileListFormGroup)
          //this.onChange(this.fileList)
          item.onSuccess(newFile, file, response);
        } else {
          this.load = false;
          this.fileList = this.fileList = this.fileList.filter(({ status }) => status !== 'uploading');
          this.onChange(this.fileList)
          this.message.create("error", "请求异常");
          item.onError({}, file);
        }
      },
      (err) => {
        this.load = false;
        this.fileList = this.fileList = this.fileList.filter(({ status }) => status !== 'uploading');
        this.onChange(this.fileList)
        this.message.create("error", "请求异常");
        item.onError!(err, item.file!);
      }
    );
  };

  writeValue(obj: any): void {
    if (obj&&obj.length>0) {
      this.clearFormArray(this.fileListFormGroup)
      this.fileList = obj.map((file) => ({
        ...file,
        uid:file.fileId,
        name: file.name || file.fileName,
        filename: file.name,
        status:"success",
        attachmentComment:file.attachmentComment
      }));
      this.fileList.forEach(item => {
        this.fileListFormGroup.push(this.createFrom(item))
      })
    }
  }

  onChange: any = () => { };
  onTouch: any = () => { };

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled
    if(this.disabled)
    {
      this.fileListFormGroup.controls.forEach((item,index)=>{
        const group=this.fileListFormGroup.at(index) as FormGroup
        group.get("attachmentComment").disable()
      })
    }
    else{
      this.fileListFormGroup.controls.forEach((item,index)=>{
        const group=this.fileListFormGroup.at(index) as FormGroup
        group.get("attachmentComment").enable()
      })
    }
  }

  ngOnInit() {
  }

  onRemoveFile = (file) => {
    this.modal.confirm({
      nzTitle: `确定移除文件${file.name}?`,
      nzOnOk: () => {
        this.fileList = this.fileList.filter(({ fileId }) => fileId !== file.fileId);
        this.clearFormArray(this.fileListFormGroup)
        this.fileList.forEach(item => {
          this.fileListFormGroup.push(this.createFrom(item))
        })
        this.fileDeleted.emit(file.fileId)
        //this.onChange(this.fileList);
        this.onChange(this.fileListFormGroup)
      },
    });
  };

  onDownloadFile({ fileId, name }) {
    let uri = `/act/system/download/${fileId}`;
    this.http.get(uri, {
      responseType: 'blob'
    }).subscribe(data => {
      saveAs(data, name);
    });
  }

}
