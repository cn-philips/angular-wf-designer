import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '@core/services';

interface mapping {
  bg: string,
  bmc: string,
  cluster: string
}
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

  // 对应关系映射
  bmcMapping: mapping[] = []

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
  ) {
    this.validateForm = this.fb.group({
      role: [{ value: null, disabled: true }],
      team: [null, [Validators.required]],
      bmc: [null, [Validators.required]],
      modality: [null, [Validators.required]],
      cluster: [{ value: null, disabled: true }],
      funcTeamType: [null, [Validators.required]],
      bmcMags: [],
      serveTeams: [],
    });

  }

  get magList() {
    return this.validateForm.get('bmcMags');
  }

  get serveTeamList() {
    return this.validateForm.get('serveTeams');
  }

  get funcTeamType() {
    return this.validateForm.get("funcTeamType").value;
  }

  initRoleOptions() {
    const url = 'act/ecom/homepage/getRole';
    this.http.get(url).subscribe(res => {
      for (let i = 0; i < res.data.length; i++) {
        this.roleOptions.push({ label: res.data[i], value: res.data[i] });
      }
    }, error => {

    })
  }
  initTeamOptions() {
    return new Promise((res, rej) => {
      this.http.get('act/ecom/dictData/queryDrop?dictGroup=area_team').subscribe(response => {
        for (let i = 0; i < response.data.length; i++) {
          this.teamOptions.push({ label: response.data[i].label, value: response.data[i].label });
        }
      });

      res(true);
    });
  }
  // initModalityOptions() {
  //   return new Promise((res, rej) => {
  //     this.http.get('act/ecom/dictData/queryDrop?dictGroup=area_modality').subscribe(response =>{
  //       for (let i = 0; i < response.data.length; i++) {
  //         this.modalityOptions.push({ label: response.data[i].label, value: response.data[i].label });
  //       }
  //     });
  //     res(true);
  //   });
  // }
  async initBMCOptions() {
    const uri = `/act/specialapprove/bmcclusterbg?pageSize=999`;
    this.http.get(uri).subscribe((res) => {
      this.bmcMapping = res.data.rows;

      let bgs = [];
      for (let i = 0; i < this.bmcMapping.length; i++) {
        bgs[i] = this.bmcMapping[i].bg
      }

      let bg = Array.from(new Set(bgs))

      for (let i = 0; i < bg.length; i++) {
        this.modalityOptions.push({ label: bg[i], value: bg[i] })
      }
    });
    // return new Promise((res, rej) => {
    //   this.http.get('act/ecom/dictData/queryDrop?dictGroup=area_bmc').subscribe(response =>{
    //     for (let i = 0; i < response.data.length; i++) {
    //       this.bmcOptions.push({ label: response.data[i].label, value: response.data[i].label });
    //     }
    //   });
    //   res(true);
    // });
  }

  async ngOnInit() {

    this.initRoleOptions();
    this.initTeamOptions();
    // this.initModalityOptions();
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
      funcTeamType: user.funcTeamType,
      bmcMags: user.bmcMags,
      serveTeams: user.serveTeams,
    })
  }
  clearUserDetail() {
    this.validateForm.reset({
      role: null,
      team: null,
      modality: null,
      bmc: null,
      funcTeamType: null,
      bmcMags: [],
      serveTeams: [],
    });
  }
  async ngOnChanges() {
    this.setUserDetail(this.user);
  }

  // 根据bmc和modality对应cluster
  async BMCChanges(value: string) {
    const modality = this.validateForm.get('modality').value;
    this.mappingCluster(value, modality)
  }
  // 根据bmc和modality对应cluster
  async ModalityChanges(value: string) {
    this.validateForm.patchValue({
      bmc: null,
      cluster: null
    })
    this.getBMCList(value)
  }

  mappingCluster(bmc: string, modality: string) {
    if (bmc != null && modality != null) {
      this.validateForm.patchValue({ // 先清除现有cluster再按规则进行对应
        cluster: null
      })

      if (bmc === 'All') {
        this.validateForm.patchValue({
          cluster: modality
        })
        return
      }

      const map = this.bmcMapping.find(val => val.bmc === bmc && val.bg === modality);
      if (map !== undefined) {
        this.validateForm.patchValue({
          cluster: map.cluster
        })
      }
    }
  }

  getBMCList(bg) {
    const list = this.bmcMapping.filter(value => value.bg === bg)
    if (bg === 'CC') {
      this.bmcOptions = [{
        label: 'All',
        value: 'All',
      }];
      list.map(value => {
        this.bmcOptions.push({ label: value.bmc, value: value.bmc })
      })
    } else {
      this.bmcOptions = [];
      list.map(value => {
        this.bmcOptions.push({ label: value.bmc, value: value.bmc })
      })
    }
  }

  onAdd1() {
    this.magList.patchValue([...this.magList.value,{
      dictValue: null,
      mag: null,
    }])
  }

  onDeleteProduct1(item) {
    const mags = this.magList.value.filter((val) => val !== item);
    this.magList.patchValue(mags);
  }

  onAdd2() {
    this.serveTeamList.patchValue([...this.serveTeamList.value,{
      dictValue: null,
    }])
  }

  onDeleteProduct2(item) {
    const serveTeams =  this.serveTeamList.value.filter((val) => val !== item);
    this.serveTeamList.patchValue(serveTeams);
  }

  funcTeamTypeChange(){
    //清空serve Team
    this.serveTeamList.patchValue([]);
  }
}
