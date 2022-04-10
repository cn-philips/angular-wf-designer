import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FORM_ACTION_TYPE} from '../role-management-form/role-management-form.component';
import {HttpService} from '../../../../services';
import {NzMessageService} from 'ng-zorro-antd';

@Component({
  selector: "app-user-basic-info-form",
  templateUrl: "./user-basic-info-form.component.html",
  styleUrls: ["./user-basic-info-form.component.scss"],
})
export class UserBasicInfoFormComponent implements OnInit {
  validateForm!: FormGroup;
  @Input() user: any = null;
  @Output() userChange = new EventEmitter<object>();
  @Input() readonly: boolean = false;
  @Input() formType: FORM_ACTION_TYPE;
  @Input() islook: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private nzMessageService: NzMessageService,
    private message: NzMessageService,
    ) {
    const philips = new RegExp('[a-zA-Z0-9-_.]{2,}@philips.com');
    const email = Validators.pattern(philips);
    this.validateForm = this.fb.group({
      id: [null],
      name: [null],
      email: [null, [email]],
      lineManager: [null, [email]],
    });
  }
  spin: boolean = false;
  setUserInform() {
    // Modify here
    this.validateForm.setValue({
      id: this.user.userNumber == undefined? null : this.user.userNumber,
      name:  this.user.name,
      email: this.user.email,
      lineManager:  this.user.lineManager,
    });
    // End Modify here
  }
  ngOnInit() {

  }
  ngOnChanges(){
    if(this.user){
      this.setUserInform();
    }
  }
  checkuser(){
    this.spin = true;
    let email = this.validateForm.controls['email'].value;
    if (this.formType == FORM_ACTION_TYPE.CREATE){
      const url = '/act/ecom/homepage/checkUserInfo?email=' + email;
      this.http.get(url).subscribe(res=>{
          if (res.msg == '此用户存在'){
            console.log(res.data);
            this.validateForm.setValue({
              id: res.data.userNumber,
              name:  res.data.name,
              email: res.data.email,
              lineManager:  res.data.lineManager,
            });
          }
        if (res.msg == '此用户不存在'){
          console.log(res.data);
          this.validateForm.setValue({
            id: null,
            name:  null,
            email: email,
            lineManager:  null,
          });
        }
        this.spin = false;
      },error => {
        this.spin = false;
      })
    }
    this.spin = false;
  }
}
