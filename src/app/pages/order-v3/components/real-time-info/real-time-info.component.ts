import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { decodeString, getType } from '@core/util/tools';
import { HttpService } from '@core/services';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
import { saveAs } from 'file-saver';
@Component({
  selector: 'ecos-real-time-info',
  templateUrl: './real-time-info.component.html',
  styleUrls: ['./real-time-info.component.scss']
})

export class RealTimeInfoComponent implements OnInit {

  constructor(public activatedRouter: ActivatedRoute, private router: Router, private fb: FormBuilder, private message: NzMessageService, private http: HttpService) { }
  @Input() formValue: FormGroup;
  @Input() bg: string = 'PDIGT';

  public textLens = 255;
  public textLen = 100;
  public load = false;
  // public soNo: any;
  parm: any = {
    soRemark: "",
    soNo: ""
  }

  get soNoCheckFormData(): FormGroup {
    return this.formValue.get('soNoCheckForm') as FormGroup
  }

  get baseInfoFrom(): FormGroup{
    return this.formValue.get('baseInfoFrom') as FormGroup;
  }

  get marketBundleInfo():FormArray
  {
    return this.formValue.get("marketBundleInfo") as FormArray;
  }

  ngOnInit() {
    // this.getSo();
    this.parm = {
      soRemark: this.soNoCheckFormData.get('soRemark').value ? this.soNoCheckFormData.get('soRemark').value : "",
      soNo: this.soNoCheckFormData.get('soNo').value ? this.soNoCheckFormData.get('soNo').value : ""
    }   
  }
  fileDown({fileId,fileName})
  {
    let uri = `/act/system/download/${fileId}`;
    this.http.get(uri, {
      responseType: 'blob'
    }).subscribe(data => {
      saveAs(data, fileName);
    });
  }

  ngOnChanges(){
    
    const roleList = JSON.parse(localStorage.getItem("roles"));
    const needFileType = this.activatedRouter.queryParams['value'].needFileType;
    const needFileTypeShowOff =roleList.includes("OM")

    if(needFileType=='om')
    {
       this.soNoCheckFormData.enable()
    }
    else{
     this.soNoCheckFormData.disable()
    }
    this.marketBundleInfo.controls.forEach((item, index) =>{
      const marketBundle = this.marketBundleInfo.at(index) as FormGroup;
      if(needFileType=='om')
      {
        marketBundle.get('wbsNo').enable();
      }
      else{
        marketBundle.get('wbsNo').disable();
      }      
    })
  }


  //getso
  // getSo() {
  //   let mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
  //   const url = `/act/prebook/getPreBookSoByOrderId?mainId=${mainId}`;
  //   this.http.get(url).subscribe((res => {
  //     if (res.code === '0000' && res.data) {
  //       if (res.data) {
  //         this.soNo = res.data.so;
  //       }
  //     }
  //     else {
  //       // this.message.create("error",res.msg)
  //     }
  //   }), (error) => {
  //     this.message.create("error", "请求异常");
  //   })
  // }
  cheakSo(control: FormControl) {
    if (control.value) {
      const reg = /^([\d;\s]{0,1000}$)$/;
      //const reg=/^[0-9a-zA-Z_\@\.\s\-]*$/g;
      //const reg = /^(?!\@)+(?!\_)+[0-9a-zA-Z_\@\.\s\-]*$/g;
      const valid = reg.test(control.value); // true
      return valid ? null : { soform: true };
    }
  }

}
