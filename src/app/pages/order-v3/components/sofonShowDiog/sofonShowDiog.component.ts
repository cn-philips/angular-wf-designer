import { Component, forwardRef, OnInit, Input, TemplateRef } from "@angular/core";
import { ControlValueAccessor, FormArray,FormGroup,NG_VALUE_ACCESSOR } from "@angular/forms";
import { UploadXHRArgs, NzModalService } from "ng-zorro-antd";
import { HttpService } from "@core/services/http.service";
import { getType } from "@core/util/tools";
import { saveAs } from 'file-saver';
import { OrderV3Service } from "../../order-v3.service";

interface CommonResponse {
  code: string;
  data: any;
  msg: string;
}

@Component({
  selector: "sofon-upload-file",
  templateUrl: "./sofonShowDiog.component.html",
  styleUrls: ["./sofonShowDiog.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => SofonFileComponent),
    },
  ],
})
export class SofonFileComponent implements OnInit, ControlValueAccessor {
  @Input() limit = 5;
  @Input() hint: string; // 提示信息
  @Input() type: string | null = 'drag'
  @Input() title:any="";

  @Input()disabled = false;
  @Input()index:any;
  @Input()orderInfo:FormArray;
 
  

  fileList = []; // 文件列表
  sofonList:any; //sofon文件列表
  sofonLoad:any=false;
  isAgres:any=false;  
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
          this.fileList = this.fileList
            .map((file) => 
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

  writeValue(obj: any): void {
    setTimeout(() => {
      if (obj) {
        this.fileList = obj.map((file) => ({
          ...file,
          name: file.name || file.fileName,
          filename: file.name,
          status:"success",
        }));
      }
    },200);
    
  }

  onChange: any = () => {};
  onTouch: any = () => {};

  registerOnChange(fn: any): void {
    setTimeout(() => {
      this.onChange = fn;
    },200);
    
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled
  }

  constructor(private modal: NzModalService, private http: HttpService,private service:OrderV3Service) {}

  ngOnInit() {}

  onRemoveFile = (file) => {
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
  selectSofon()
  {
    this.isAgres=true;
    const orderBaseinfo=this.orderInfo.at(this.index).get('orderBaseinfo') as FormGroup;
    const {cpDealOrderId}=orderBaseinfo.getRawValue();
    const param={
      dataId:cpDealOrderId,
      typeList:['SOFONFinal','OTHERSOFONDraft']
    }
    this.sofonLoad=true;
    this.service.selectSofonFlie(param).subscribe(res=>{     
      if(res.code=='0000')
      {
        this.sofonLoad=false;
        const soFonData=res.data.map(val=>({
          id:val.id,
          name:val.docName,
          checked:false,
          disabled:false,
        }))       
        this.sofonList=soFonData;        
      }
    })
    
  }
  isAgreCancels()
  {
    setTimeout(() => {
      this.isAgres=false;
    });
    
  }
  isAgregentOk()
  {
    this.sofonLoad=true;
    this.isAgres=true;
    let soFonDatas=this.sofonList.filter(val=>val.checked).map(vals=>vals.id).join(",");     
    this.service.sonFonUpload(soFonDatas).subscribe(vals=>{
      
      if(vals.code=="0000")
      {
        
        this.sofonLoad=false;
        this.fileList=vals.data.map(val=>({
            ...val,
            name:val.FileName,
            fileName:val.FileName,
            fileId:val.FileId
          }))
            this.isAgres=false;
            this.onChange(this.fileList)
      }      
     })
    
  }
}
