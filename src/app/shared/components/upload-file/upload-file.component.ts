import { Component, forwardRef, OnInit, Input } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { UploadFile, UploadXHRArgs, NzModalService } from "ng-zorro-antd";
import { Observable, Observer } from "rxjs";
import { HttpService } from "../../../services/http.service";
import { getType } from "../../../../assets/js/tools";
import { saveAs } from 'file-saver';

interface CommonResponse {
  code: string;
  data: any;
  msg: string;
}

@Component({
  selector: "shared-upload-file",
  templateUrl: "./upload-file.component.html",
  styleUrls: ["./upload-file.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => UploadFileComponent),
    },
  ],
})
export class UploadFileComponent implements OnInit, ControlValueAccessor {
  @Input() limit = 5;

  disabled = false

  fileList = []; // 文件列表

  _value = []; // model值

  onBeforeUpload = (file) => {
    console.log("before upload", file);
    return true;
  };

  uploadFile(data) {
    const uri = "/act/system/upload";
    return this.http.posts(uri, data);
  }

  onUploadFile = (item: UploadXHRArgs) => {
    const formData = new FormData();
    const file = item.file as any;
    formData.append("file", file);
    formData.append("fileType", getType(file));
    formData.append("filename", file.name);

    return this.uploadFile(formData).subscribe(
      (response: CommonResponse) => {
        const { data, code } = response;
        if ("0000" === code) {
          const newFile = { ...file, fileId: data }
          this._value.push(newFile)
          this.onChange(this._value)
          item.onSuccess(newFile, file, response);
        } else {
          item.onError({}, file);
        }
      },
      (err) => {
        item.onError!(err, item.file!);
      }
    );
  };

  writeValue(obj: any): void {
    if (obj) {
      this.fileList = obj.map((file) => ({
        ...file,
        uid: file.fileId,
        name: file.name,
        filename: file.name,
      }));
      this._value = obj;
    }
  }

  onChange: any = () => {};
  onTouch: any = () => {};

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled
  }

  constructor(private modal: NzModalService, private http: HttpService) {}

  ngOnInit() {}

  onRemoveFile = (file: UploadFile) => {
    console.log('removed file', file);
    
    return new Observable((observer: Observer<boolean>) => {
      this.modal.confirm({
        nzTitle: `确定移除文件${file.name}?`,
        nzOnOk: () => {
          const fileList = this._value.filter(
            ({ fileId, uid }) => fileId !== file.uid && uid !== file.uid
          );
          this.onChange(fileList);
          observer.next(true);
        },
        nzOnCancel: () => {
          observer.next(false);
        },
      });
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
