import { Component, OnInit, Input } from "@angular/core";
import { NzMessageService, UploadXHRArgs, NzModalService } from "ng-zorro-antd";
import { UploadFile } from "ng-zorro-antd";
import { Observable, Observer } from "rxjs";
import { HttpService } from "@core/services/http.service";
import { getType } from "../../../../assets/js/tools";
import { saveAs } from 'file-saver';

interface CommonResponse {
  code: string;
  data: any;
  msg: string;
}

@Component({
  selector: "app-signature",
  templateUrl: "./signature.component.html",
  styleUrls: ["./signature.component.scss"],
})
export class SignatureComponent implements OnInit {
  @Input() limit = 3;
  loading = false;
  // signatureUrl?: string = "assets/image/signature.png";
  signatureUrl: string | undefined = '';
  public fileList = []; // 文件列表

  constructor(private msg: NzMessageService,private modal: NzModalService, private http: HttpService) {}
  ngOnInit(): void {}

  beforeUpload = (
    file: any
  ): Observable<boolean> =>
    new Observable((observer: Observer<boolean>) => {
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        this.msg.error("You can only upload JPG file!");
        observer.complete();
        return;
      }
      const isLt2M = file.size! / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.msg.error("Image must smaller than 2MB!");
        observer.complete();
        return;
      }
      observer.next(isJpgOrPng && isLt2M);
      observer.complete();
    });

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
    const newFile = {
      status: 'uploading',
      name: file.name,
      fileId: Date.now(),
    }
    this.fileList = [...this.fileList, newFile]

    return this.uploadFile(formData).subscribe(
      (response: CommonResponse) => {
        const { data, code } = response;
        if ("0000" === code) {
          this.fileList = this.fileList.map((file) => 
              file.fileId === newFile.fileId ? {
                ...file,
                fileId: data,
                status: 'success',
              } : file
            )
          this.onChange(this.fileList)
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

  showUploadList = {
    showPreviewIcon: true,
    showRemoveIcon: true,
    showDownloadIcon: true,
    hidePreviewIconInNonImage: true
  };
  onChange: any = () => {};
  previewVisible = false;

  handlePreview = (file: any) => {
    this.signatureUrl = file.url || file.thumbUrl;
    this.previewVisible = true;
  };

  onRemoveFile = (file: any) => {
    console.log("fileList",this.fileList);
    this.modal.confirm({
      nzTitle: `确定移除文件${file.name}?`,
      nzOnOk: () => {
        this.fileList = this.fileList.filter(({ fileId }) => fileId !== file.fileId);
        this.onChange(this.fileList);
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
