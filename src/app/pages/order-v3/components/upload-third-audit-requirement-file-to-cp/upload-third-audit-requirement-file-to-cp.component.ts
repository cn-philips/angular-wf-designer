import { Component, forwardRef, OnInit, Input, TemplateRef, Output, EventEmitter } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { UploadXHRArgs, NzModalService } from "ng-zorro-antd";
import { HttpService } from "@core/services/http.service";
import { saveAs } from 'file-saver';
import { NzMessageService } from "ng-zorro-antd";


interface CommonResponse {
  code: string;
  data: any;
  msg: string;
}

@Component({
  selector: "upload-third-audit-requirement-file-to-cp",
  templateUrl: "./upload-third-audit-requirement-file-to-cp.component.html",
  styleUrls: ["./upload-third-audit-requirement-file-to-cp.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => UploadThirdAuditFileToCpComponent),
    },
  ],
})
export class  UploadThirdAuditFileToCpComponent implements OnInit, ControlValueAccessor {
  @Input() limit = 5;
  @Input() hint: string; // 提示信息
  @Input() type: string | null = 'drag'
  @Input() applyId: string = ""
  @Input() title:any="";
  @Input() cpDealId: string = ""

  @Input()disabled = false
  @Output() fileChanged = new EventEmitter();

  fileList = []; // 文件列表

  load=false;
  onBeforeUpload = (file) => {
    console.log("before upload", file);
    this.load=true;
    return true;
  };

  uploadFile(data) {
    const uri = `/act/ecos/thirdParty/auditReport/upload/auditRequirement/${this.applyId}`;
    return this.http.posts(uri, data);
  }

  onUploadFile = (item: UploadXHRArgs) => {
    const formData = new FormData();
    const file = item.file as any;
    formData.append("file", file);
    const newFile = {
      status: 'uploading',
      name: file.name,
      fileId: Date.now(),
      uid:file.uid,
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
                ...data,
                status: 'success',
              } : file
            )
          const valid=this.fileList.every(file=>file.status=='success')
          if(valid)
          {
            this.load=false;
          }
          this.onChange(this.fileList)
          item.onSuccess(newFile, file, response);
          this.handleSave()
        } else {
          this.load=false;
          this.fileList=this.fileList = this.fileList.filter(({ status }) => status !=='uploading');
          this.onChange(this.fileList)
          this.handleSave()
          this.message.create("error","请求异常");
          item.onError({}, file);
        }
      },
      (err) => {
        this.load=false;
        this.fileList=this.fileList = this.fileList.filter(({ status }) => status !=='uploading');
        this.onChange(this.fileList)
        this.handleSave()
        this.message.create("error","请求异常");
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
        status:"success",
      }));
    }
  }

  onChange: any = () => {};
  onTouch: any = () => {};
  handleSave = () => {
    this.fileChanged.emit(null);
  };

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled
  }

  constructor(private modal: NzModalService, private http: HttpService,private message: NzMessageService,) {}

  ngOnInit() {}

  onRemoveFile = (file) => {
    this.modal.confirm({
      nzTitle: `确定移除文件${file.name}?`,
      nzOnOk: () => {
        this.http.posts(`/act/ecos/thirdParty/auditReport/delete/${file.fileId}`).subscribe(
          (response: CommonResponse) => {
            const { data, code } = response;
            if ("0000" === code) {
              this.fileList = this.fileList.filter(({ fileId }) => fileId !== file.fileId);
              this.onChange(this.fileList);
              this.handleSave()
              this.load=false;
            } else {
              this.load=false;
              this.message.create("error","请求异常");
            }
          },
          (err) => {
            this.load=false;
            this.message.create("error","请求异常");

          })
      },
    });
  };

  onDownloadFile(file) {
    const { fileId, fileName,filePath } = file
    if(filePath){
      window.open(filePath);
    }else{
      let uri = `${filePath}`;
      this.http.get(uri, {
        responseType: 'blob'
      }).subscribe(data => {
        saveAs(data, fileName);
      });
    }
  }
}
