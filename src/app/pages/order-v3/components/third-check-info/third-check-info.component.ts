import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// import { decodeString, upLoadFileNew } from '@core/util/tools';
import { HttpService } from '@core/services';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
@Component({
  selector: 'ecos-thirdcheck-info',
  templateUrl: './third-check-info.component.html',
  styleUrls: ['./third-check-info.component.scss']
})
export class ThirdCheckInfoComponent implements OnInit {

  constructor(public activatedRouter: ActivatedRoute, private message: NzMessageService, private fb: FormBuilder, private http: HttpService) { }
  @Input() formValue:FormGroup;
  thirdPartyList: any = [];
  load: any = false;

  get thirdCheckFormData(): FormGroup {
    return this.formValue.get('thirdCheckForm') as FormGroup
  }
  get oaAddInfo():FormGroup{
    return this.formValue.get('oaAddInfo') as FormGroup
  }

  ngOnInit() {
    let productVerification = this.thirdCheckFormData.get('productVerificationInformation').value;
    if(productVerification == '已经交付'){
      this.thirdCheckFormData.get('productVerificationInformation').disable();
    } else {
      this.thirdCheckFormData.get('productVerificationInformation').enable();
    }
    this.getEntryModeList();
  }
  
  public getEntryModeList() {
    const params = {
      dictGroup: 'thirdVerificationSelect',
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
      if (rest.code === '0000') {
        this.thirdPartyList = rest.data;
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }

}
