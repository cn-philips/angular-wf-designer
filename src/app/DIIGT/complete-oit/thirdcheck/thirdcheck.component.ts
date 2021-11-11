import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { decodeString, formatDatesNowMth, formatDatesNow } from '../../../../assets/js/tools';
import { HttpService, FileService } from '../../../services';
import { NzMessageService } from 'ng-zorro-antd';
@Component({
  selector: 'app-thirdcheck',
  templateUrl: './thirdcheck.component.html',
  styleUrls: ['./thirdcheck.component.scss']
})
export class ThirdcheckComponent implements OnInit {

  constructor(public activatedRouter: ActivatedRoute, private message: NzMessageService, private router: Router, private fb: FormBuilder, private http: HttpService,) { }
  validateForm: FormGroup;
  selectVal: any;
  ngOnInit() {
    this.validateForm = this.fb.group({
      selectVal: new FormControl({ value: '' }, Validators.required),
    })
    this.getBase();
  }
  getBase()
  {
    
    let url=`/act/preparation/getThirdPartAudit`;
    let mainId = decodeString(this.activatedRouter.queryParams['_value'].id);   
    const param={
      mainId:mainId,      
    } 
    this.http.post(url,param).subscribe(res => {  
      if(res.code==="0000")
      {
         const {subProStatusThird}=res.data;
         subProStatusThird&&(this.selectVal=subProStatusThird);
      }
    })

  }
  submit() {
    let mainId = decodeString(this.activatedRouter.queryParams['_value'].id);    
    let url=`/act/preparation/thirdPartAudit`;
    const param={
      mainId:mainId,
      subProStatusThird:this.selectVal
    }
    this.validateForm.controls['selectVal'].markAsDirty();
    this.validateForm.controls['selectVal'].updateValueAndValidity();
    if(!this.validateForm.valid)
     {
      return;
     }
    this.http.post(url,param).subscribe(res => {      
      if (res.code=="200") {
        this.message.create('success', `提交成功`);
        this.router.navigate(["/igt/my-task"])
      }
      else {
        this.message.create('error', res.msg);
      }
    })
  }

}
