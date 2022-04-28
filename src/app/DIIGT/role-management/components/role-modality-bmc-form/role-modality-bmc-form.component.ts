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

  bmcMapping = [
    {
      bmc: 'AMI',
      cluster: 'PD',
      modality: 'PD&IGT'
    },
    {
      bmc: 'CT',
      cluster: 'PD',
      modality: 'PD&IGT'
    },
    {
      bmc: 'DXR',
      cluster: 'PD',
      modality: 'PD&IGT'
    },
    {
      bmc: 'EDI-CI',
      cluster: 'PD',
      modality: 'PD&IGT'
    },
    {
      bmc: 'EDI-ICAP',
      cluster: 'PD',
      modality: 'PD&IGT'
    },
    {
      bmc: 'IGT-S',
      cluster: 'IGT',
      modality: 'PD&IGT'
    },
    {
      bmc: 'MR',
      cluster: 'PD',
      modality: 'PD&IGT'
    },
    {
      bmc: 'PDS-RadOnc',
      cluster: 'PD',
      modality: 'PD&IGT'
    },
    {
      bmc: 'Professional Service',
      cluster: 'S&SD',
      modality: 'S&SD'
    },
    {
      bmc: 'PDS-DCP',
      cluster: 'PD',
      modality: 'PD&IGT'
    },
    {
      bmc: 'US',
      cluster: 'PD',
      modality: 'US'
    },
    {
      bmc: 'HPM',
      cluster: 'CC',
      modality: 'CC'
    },
    {
      bmc: 'VAD',
      cluster: 'CC',
      modality: 'CC'
    },
    {
      bmc: 'DFM',
      cluster: 'CC',
      modality: 'CC'
    },
    {
      bmc: 'DECG',
      cluster: 'CC',
      modality: 'CC'
    },
    {
      bmc: 'AED',
      cluster: 'CC',
      modality: 'CC'
    },
    {
      bmc: 'All',
      cluster: 'PD&IGT',
      modality: 'PD&IGT'
    },
    {
      bmc: 'All',
      cluster: 'CC',
      modality: 'CC'
    },

  ]
  isAll: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
  ) {
    this.validateForm = this.fb.group({
      role: [{value: null, disabled: true}],
      team: [null, [Validators.required]],
      bmc: [null, [Validators.required]],
      modality: [null, [Validators.required]],
      cluster: [{value: null, disabled: true}],
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
  }

  async setUserDetail(user) {
    this.validateForm.setValue({
      role: this.userRole,
      team: user.team,
      modality: user.modality,
      bmc: user.bmc,
      cluster: user.cluster == undefined ? null : user.cluster,
})
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

  // 根据bmc和modality对应cluster
  async BMCChanges(value: string){
    const modality = this.validateForm.get('modality').value;
    this.mappingCluster(value, modality)
  }
  // 根据bmc和modality对应cluster
  async ModalityChanges(value: string) {
    const bmc = this.validateForm.get('bmc').value;
    this.mappingCluster(bmc, value);
  }

  mappingCluster(bmc: string, modality: string){
  if (bmc != null && modality != null) {
      this.validateForm.patchValue({ // 先清除现有cluster再按规则进行对应
        cluster: null
      })
      const map = this.bmcMapping.find(val => val.bmc === bmc && val.modality === modality);
      if (map !== undefined){
        this.validateForm.patchValue({
          cluster: map.cluster
        })
      }
    }
  }

}
