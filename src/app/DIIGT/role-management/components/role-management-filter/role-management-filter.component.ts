import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzTreeNode } from "ng-zorro-antd";

interface params {
  role:any,
  team:any,
  isRequestor:boolean,
  isApprover:boolean
}
@Component({
  selector: "app-role-management-filter",
  templateUrl: "./role-management-filter.component.html",
  styleUrls: ["./role-management-filter.component.scss"],
})
export class RoleManagementFilterComponent implements OnInit {
  validateForm!: FormGroup;
  @Input() isDeleteable:boolean=false 
  @Input() isEditable:boolean=false 
  @Input() roleNode:NzTreeNode;
  constructor(private fb: FormBuilder) {
    this.validateForm = this.fb.group({
      role: [null, [Validators.required]],
      team: [null, [Validators.required]],
      isRequestor: [true, [Validators.required]],
      isApprover: [true, [Validators.required]],
    });
  }
  // Team选项
  teamOptions: any[] = [];
  /**
   * 初始化Team选项
   *
   * @return {*} 
   * @memberof RoleManagementFilterComponent
   */
  async initTeamsOptions() { 
    return new Promise<void>((res, rej) => {
      // Fetch Data From API
      setTimeout(() => { 
        this.teamOptions = this.teamOptions.concat([
          { label: "North", value: "North" },
          { label: "East", value: "East" },
          { label: "South", value: "South" },
          { label: "West", value: "West" },
          { label: "Private", value: "Private" },
          { label: "NB", value: "NB" },
          { label: "Primary Business", value: "Primary Business" },
          { label: "CT VAD", value: "CT VAD" },
          { label: "DXR", value: "DXR" },
          { label: "GBA", value: "GBA" },
          { label: "BV", value: "BV" },
          { label: "RadOnc", value: "RadOnc" },
          { label: "COP", value: "COP" },
          { label: "CFC", value: "CFC" },
          { label: "Solution", value: "Solution" },
          { label: "Marketing", value: "Marketing" },
          { label: "National", value: "National" },
          { label: "Finance", value: "Finance" },
          { label: "Legal", value: "Legal" },
          { label: "S&SD", value: "S&SD" },
          { label: "GBS", value: "GBS" },
        ]);
        res()
      }, 1000);
    });
  }
  async getRoleDetailById(id):Promise<any>{
    // Fetch Role Detail From API Here
    return new Promise((res,rej)=>{
      let [min,max] = [
        Math.ceil(Math.random()*this.teamOptions.length),
        Math.ceil(Math.random()*this.teamOptions.length)
      ].sort((pre,next)=>pre-next) 
      let mockTeam=this.teamOptions.slice(min,max-min).map(i=>i.value) 
      res({
        role:null,
        team:mockTeam,
        isApprover:Math.random()*100%2===0,
        isRequestor:Math.random()*100%2===0
      })
    })
  }
  ngOnInit(): void {
    this.initTeamsOptions() 
  }
  async ngOnChanges(changes: SimpleChanges) {
    if(!changes.firstChange&&changes.roleNode.currentValue&&changes.roleNode.currentValue.origin){
      const {title,key} = changes.roleNode.currentValue.origin
      let roleData = await this.getRoleDetailById(key)
      this.validateForm.setValue(
        {
          role:roleData.role||title,
          team:roleData.team,
          isApprover:roleData.isApprover,
          isRequestor:roleData.isRequestor
        }
      )
    } 
  }
}
