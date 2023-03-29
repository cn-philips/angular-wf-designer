import {
  Component,
  forwardRef,
  OnInit,
  Input,
  TemplateRef,
} from "@angular/core";
import {
  ControlValueAccessor,
  FormArray,
  FormGroup,
  NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { UploadXHRArgs, NzModalService } from "ng-zorro-antd";
import { HttpService } from "@core/services/http.service";
import { getType } from "@core/util/tools";
import { saveAs } from "file-saver";
import { PrebookV3Service } from "../../prebook-v3.service";

interface CommonResponse {
  code: string;
  data: any;
  msg: string;
}

@Component({
  selector: "sofon-file-upload",
  templateUrl: "./sofon-file-upload.component.html",
  styleUrls: ["./sofon-file-upload.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => SofonFileUploadComponent),
    },
  ],
})
export class SofonFileUploadComponent implements OnInit, ControlValueAccessor {
  @Input() orderInfo: Array<any>
  @Input() disabled = false;

  fileList = []; // 文件列表
  sofonList = []; //sofon文件列表
  sofonLoad = false;
  isAgres = false;
  onBeforeUpload = (file) => {
    console.log("before upload", file);
    return true;
  };

  writeValue(obj: any): void {
    setTimeout(() => {
      if (obj) {
        this.fileList = obj.map((file) => ({
          ...file,
          name: file.name || file.fileName,
          filename: file.name,
        }));
      }
    }, 200);
  }

  onChange: any = () => {};
  onTouch: any = () => {};

  registerOnChange(fn: any): void {
    setTimeout(() => {
      this.onChange = fn;
    }, 200);
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  constructor(
    private modal: NzModalService,
    private http: HttpService,
    private service: PrebookV3Service
  ) {}

  ngOnInit() {}

  onRemoveFile = (file) => {
    this.modal.confirm({
      nzTitle: `确定移除文件${file.name}?`,
      nzOnOk: () => {
        this.fileList = this.fileList.filter(
          ({ fileId }) => fileId !== file.fileId
        );
        this.onChange(this.fileList);
      },
    });
  };

  onDownloadFile({ fileId, name }) {
    let uri = `/act/system/download/${fileId}`;
    this.http
      .get(uri, {
        responseType: "blob",
      })
      .subscribe((data) => {
        saveAs(data, name);
      });
  }

  getSofoFileList() {
    this.sofonLoad = true;
    const requests = []
    this.orderInfo.forEach(({ cpDealOrderId, isDeleted }) => {
      if (isDeleted === 0) {
        const param = {
          dataId: cpDealOrderId,
          typeList: ["SOFONFinal", "OTHERSOFONDraft"],
        };
        requests.push(this.service.selectSofonFlie(param).toPromise())
      }
    })

    Promise.all(requests).then(resArray => {
      resArray.forEach(({ data }) => {
        const sofonData = data.map((val) => ({
          id: val.id,
          name: val.docName,
          checked: false,
        }));
        this.sofonList.push(...sofonData);
      })
      this.sofonLoad = false
    })
  }

  selectSofon() {
    this.isAgres = true;
    if (this.sofonList.length === 0) {
      this.getSofoFileList()
    }
  }
  isAgreCancels() {
    setTimeout(() => {
      this.isAgres = false;
    });
  }
  isAgregentOk() {
    this.sofonLoad = true;
    this.isAgres = true;
    let soFonDatas = this.sofonList
      .filter((val) => val.checked)
      .map((vals) => vals.id)
      .join(",");
    this.service.sonFonUpload(soFonDatas).subscribe((vals) => {
      if (vals.code == "0000") {
        this.sofonLoad = false;
        this.fileList = vals.data.map((val) => ({
          ...val,
          name: val.FileName,
          fileName: val.FileName,
          fileId: val.FileId,
        }));
        this.isAgres = false;
        this.onChange(this.fileList);
      }
    });
  }
}
