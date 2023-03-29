import { Component, forwardRef, OnInit, Input, TemplateRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { UploadXHRArgs, NzModalService } from "ng-zorro-antd";
import { HttpService } from "@core/services/http.service";
import { getType } from "@core/util/tools";
import { saveAs } from 'file-saver';
import { NzMessageService, UploadFile } from "ng-zorro-antd";

interface CommonResponse {
  code: string;
  data: any;
  msg: string;
}

@Component({
  selector: 'shared-upload-fileImage',
  templateUrl: './upload-file-img.component.html',
  styleUrls: ['./upload-file-img.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => UploadFileImgComponent),
    },
  ],
})
export class UploadFileImgComponent implements OnInit {
  @Input() limit = 5;
  @Input() hint: string; // 提示信息
  @Input() type: string | null = 'drag'
  @Input() title: any = "";
  @Input() disabled = false
  previewImage: string | undefined = '';
  previewVisible = false;
  fileList = []; // 文件列表

  load = false;

  constructor(private modal: NzModalService, private http: HttpService, private message: NzMessageService,) { 

  }

  ngOnInit() {
  }

  onBeforeUpload = (file) => {  
    const fileType = getType(file);     
    if (fileType === "jpeg" || fileType === "png"|| fileType === "jpg") {
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

  onUploadFile = (item: UploadXHRArgs) => {
    const formData = new FormData();
    const file = item.file as any;
    const maxLimit = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    if (!maxLimit) {
      this.message.create('error', '文件大小不超过100M');
      this.load=false;
      return false;
    }
    
    
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

            this.onChange(this.fileList)
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
    
    if (obj) {
      this.fileList = obj.map((file) => ({
        ...file,
        name: file.name || file.fileName,
        filename: file.name,
        url:file.url,
        uid:file.fileId,
        status:"success"
      }));
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
  }
  
  handlePreview = (file: UploadFile) => {
    this.previewImage = file.url || file.thumbUrl;
    this.previewVisible = true;
  };
  onRemoveFile = (file: UploadFile): any => {
    this.fileList = this.fileList.filter(({ uid }) => uid !== file.uid);
    this.onChange(this.fileList);
    return true
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
