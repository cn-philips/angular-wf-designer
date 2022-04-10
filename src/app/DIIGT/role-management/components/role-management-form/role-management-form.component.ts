import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { roleUsersData } from "../role-management-form-user-table/role-management-form-user-table.component";
import {RegionUserTableComponent} from '../../../region-management/components/region-user-table/region-user-table.component';
export enum FORM_ACTION_TYPE {
  EDIT = "EDIT",
  CREATE = "CREATE",
  CHECK = "CHECK",
}
@Component({
  selector: "app-role-management-form",
  templateUrl: "./role-management-form.component.html",
  styleUrls: ["./role-management-form.component.scss"],
})
export class RoleManagementFormComponent implements OnInit {
  regionForm!: FormGroup;
  @Input() type: FORM_ACTION_TYPE = FORM_ACTION_TYPE.CREATE;
  @Input() id: string = "";
  levelOptions: any[] = [];
  groupOptions: any[] = [];
  bigAreaOptions: any[] = [];
  smallAreaOptions: any[] = [];
  roleUsersData:roleUsersData[]=[];
  constructor(private fb: FormBuilder) {
    this.regionForm = this.fb.group({
      level: [null, [Validators.required]],
      group: [null, [Validators.required]],
      bigArea: [null, [Validators.required]],
      smallArea: [null, [Validators.required]],
      province: [null, [Validators.required]],
    });
  }

  async initLevels() {
    return new Promise((res, rej) => {
      this.levelOptions = [
        { label: "L0", value: "L0" },
        { label: "L1", value: "L1" },
        { label: "L2", value: "L2" },
        { label: "L3", value: "L3" },
        { label: "L4", value: "L4" },
      ];
      res(true);
    });
  }
  async initGroups() {
    return new Promise((res, rej) => {
      this.groupOptions = [
        { label: "--", value: "--" },
        { label: "China", value: "China" },
        { label: "PD&IGT (Public)", value: "PD&IGT (Public)" },
        { label: "Private", value: "Private" },
        { label: "CT VAD", value: "CT VAD" },
        { label: "DXR", value: "DXR" },
        { label: "Primary Business", value: "Primary Business" },
        { label: "IGT-MOS(BV)", value: "IGT-MOS(BV)" },
        { label: "RadOnc", value: "RadOnc" },
        { label: "NB", value: "NB" },
        { label: "Solution", value: "Solution" },
      ];
      res(true);
    });
  }
  async initBigAreas() {
    return new Promise((res, rej) => {
      this.bigAreaOptions = [
        { label: "--", value: "--" },
        { label: "North", value: "North" },
        { label: "East", value: "East" },
        { label: "South", value: "South" },
        { label: "West", value: "West" },
        { label: "GBA", value: "GBA" },
        { label: "whole Seller （F30）", value: "whole Seller （F30）" },
        { label: "NB-North&West1", value: "NB-North&West1" },
        { label: "NB-North&West2", value: "NB-North&West2" },
        { label: "NB-East & South", value: "NB-East & South" },
      ];
      res(true);
    });
  }
  async initSmallAreas() {
    return new Promise((res, rej) => {
      this.smallAreaOptions = [
        { label: "--", value: "--" },
        { label: "BJ&TJ", value: "BJ&TJ" },
        { label: "HEB", value: "HEB" },
        { label: "HEN", value: "HEN" },
        { label: "SX", value: "SX" },
        { label: "NMG", value: "NMG" },
        { label: "HLJ&JL", value: "HLJ&JL" },
        { label: "LN", value: "LN" },
        { label: "AH", value: "AH" },
        { label: "JS", value: "JS" },
        { label: "SH", value: "SH" },
        { label: "HUB", value: "HUB" },
        { label: "FJ", value: "FJ" },
        { label: "SD", value: "SD" },
        { label: "ZJ", value: "ZJ" },
        { label: "GD", value: "GD" },
        { label: "HUN", value: "HUN" },
        { label: "JX", value: "JX" },
        { label: "HAN&GX", value: "HAN&GX" },
        { label: "SZ", value: "SZ" },
        { label: "CZ", value: "CZ" },
        { label: "YG", value: "YG" },
        { label: "Shaanxi", value: "Shaanxi" },
        { label: "GNQ", value: "GNQ" },
        { label: "XJ", value: "XJ" },
        { label: "CQ", value: "CQ" },
        { label: "HK", value: "HK" },
        { label: "North", value: "North" },
        { label: "East1", value: "East1" },
        { label: "East2", value: "East2" },
        { label: "South", value: "South" },
        { label: "SouthWest", value: "SouthWest" },
        { label: "NorthWest", value: "NorthWest" },
        { label: "East", value: "East" },
        { label: "West", value: "West" },
        { label: "whole Seller （F30）", value: "whole Seller （F30）" },
        { label: "East 1", value: "East 1" },
        { label: "East 2", value: "East 2" },
      ];
      res(true);
    });
  }
  // async initProvince(){
  //   return new Promise((res,rej)=>{
  //     this.levelOptions=[{
  //       label:'',
  //       value:''
  //     }]
  //     res(true)
  //   })
  // }

  async ngOnInit() {
    await this.initLevels();
    await this.initGroups();
    await this.initBigAreas();
    await this.initSmallAreas();
    // await this.initProvince()
  }
  async fetchRegionDetail(rid) {
    this.resetRoleForm();
    this.regionForm.setValue({
      level:
        this.levelOptions[Math.floor(this.levelOptions.length * Math.random())]
          .value,
      group:
        this.groupOptions[Math.floor(this.groupOptions.length * Math.random())]
          .value,
      bigArea:
        this.bigAreaOptions[
          Math.floor(this.bigAreaOptions.length * Math.random())
        ].value,
      smallArea:
        this.smallAreaOptions[
          Math.floor(this.smallAreaOptions.length * Math.random())
        ].value,
      province: "",
    });
  }
  async fetchUserTable(rid){
    // API Here
    this.roleUsersData=[
    {
      id:1,
      dataSource: "COS",
      modality: "PD&IGT(excl.)",
      bmc: "IGT-S",
      team: "Finance",
      email: "wei.zhang@philips.com",
      role:null,
      name:null,
      lineManager:null,
      userNumber: null,
      cluster: null
    },
  ]
  }
  async resetRoleForm() {
    this.regionForm.reset({
      level: null,
      group: null,
      bigArea: null,
      smallArea: null,
      province: null,
    });
    this.roleUsersData=[]
  }

  async ngOnChanges() {
    if (this.id && this.type === FORM_ACTION_TYPE.EDIT) {
      // init Edit Form Data
      await this.fetchRegionDetail(this.id);
      await this.fetchUserTable(this.id)
    } else {
      this.resetRoleForm();
    }
  }
}
