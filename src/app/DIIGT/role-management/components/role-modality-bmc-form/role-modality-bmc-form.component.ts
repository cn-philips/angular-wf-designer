import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpService} from '../../../../services';

@Component({
  selector: "app-role-modality-bmc-form",
  templateUrl: "./role-modality-bmc-form.component.html",
  styleUrls: ["./role-modality-bmc-form.component.scss"],
})
export class RoleModalityBMCFormComponent implements OnInit {
  validateForm!: FormGroup;
  @Input() readonly: boolean = false;
  @Input() user: any = null;
  @Output() userChange = new EventEmitter<object>();
  @Input() userRole: any = null;
  @Input() islook: boolean = false;
  roleOptions: any[] = [];
  teamOptions: any[] = [];
  modalityOptions: any[] = [];
  bmcOptions: any[] = [];
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
  ) {
    this.validateForm = this.fb.group({
      role: [{value: null, disabled: true}],
      team: [null],
      modality: [null],
      bmc: [null],
      cluster: [null],
    });
  }
  initRoleOptions() {
    const url = 'act/ecom/homepage/getRole';
    this.http.get(url).subscribe(res =>{
      for (let i = 0; i < res.data.length; i++) {
       this.roleOptions.push({label: res.data[i], value: res.data[i]});
      }
    },error => {

    })
  }
  initTeamOptions() {
    return new Promise((res, rej) => {
      this.http.get('act/ecom/dictData/queryDrop?dictGroup=area_team').subscribe(response =>{
        for (let i = 0; i < response.data.length; i++) {
          this.teamOptions.push({ label: response.data[i].label, value: response.data[i].label });
        }
        console.log(this.teamOptions);
      });

      res(true);
    });
  }
  initModalityOptions() {
    return new Promise((res, rej) => {
      this.http.get('act/ecom/dictData/queryDrop?dictGroup=area_modality').subscribe(response =>{
        for (let i = 0; i < response.data.length; i++) {
          this.modalityOptions.push({ label: response.data[i].label, value: response.data[i].label });
        }
      });
      res(true);
    });
  }
  initBMCOptions() {
    return new Promise((res, rej) => {
      this.http.get('act/ecom/dictData/queryDrop?dictGroup=area_bmc').subscribe(response =>{
        for (let i = 0; i < response.data.length; i++) {
          this.bmcOptions.push({ label: response.data[i].label, value: response.data[i].label });
        }
      });
      res(true);
    });
  }

  async ngOnInit() {
    this.initRoleOptions();
    this.initTeamOptions();
    this.initModalityOptions();
    this.initBMCOptions();
    if (this.user) {
      this.setUserDetail(this.user);
    } else {
      this.clearUserDetail();
    }
    this.validateForm.statusChanges.subscribe(res =>{
      if (res == 'VALID'){
        this.validateForm.value
      }
    })
  }

  async setUserDetail(user) {
    console.log('12312312');
    console.log(user);
    console.log(this.userRole);
    this.validateForm.setValue({
      role: this.userRole,
      team: user.team,
      modality: user.modality,
      bmc: user.bmc,
      cluster: user.cluster == undefined ? null : user.cluster,
})

  console.log(this.validateForm.value);
  }
  clearUserDetail() {
    this.validateForm.reset({
      role: null,
      team: null,
      modality: null,
      bmc: null,
    });
  }
  async ngOnChanges() {
      this.setUserDetail(this.user);
  }
}
