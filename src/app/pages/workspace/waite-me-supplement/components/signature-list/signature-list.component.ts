import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { Router } from "@angular/router";
import { DictService, HttpService } from "@core/services";
import { codeString } from "assets/js/tools";
import { NzMessageService } from "ng-zorro-antd";
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { WorkspaceListService } from '../../../services/workspace-list.service'

@Component({
  selector: 'signature-list',
  templateUrl: './signature-list.component.html',
  styleUrls: ['./signature-list.component.scss']
})
export class SignatureListComponent implements OnInit {
  @Input() tableData = [];
  @Input() total = 0;
  @Input() loading: any = false;
  @Input() type: any;
  @Input() flag: any;
  @Input() isHandle = 0;
  @Input() formData: any;

  @Output() pageChange = new EventEmitter<any>();
  @Output() setLoading = new EventEmitter<boolean>();
  @Output() setWatermark=new EventEmitter<boolean>();
  @Output() setAuthorizationMail=new EventEmitter<boolean>();
  pageParams = {
    pageNo: 1,
    pageSize: 10,
  };
  public batchload: any = false;
  public userList = [];
  public entryModeList = [];
  public roleList:any;
  public openCheckbox=true;
  public roleBatch:boolean=false;
  public salesSupport:boolean=false;
  mapOfCheckedId: { [key: string]: boolean } = {};
  public batchShow = false;
  public batchCanForm = this.fb.group({
    zslAdminEmail: [{ value: null, disabled:false}, [Validators.required]], //Reference No    
  });
  public saleLeadShow:boolean=false;
  public saleSupportShow:boolean=false;
  public adminMailShow:boolean=false;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private message: NzMessageService,
    private service: WorkspaceListService,
    private dictService: DictService,) {
  }

  ngOnInit() {
    this.getEntryModeList();
    this.roleList=JSON.parse(localStorage.getItem("roles"));     
    this.roleBatch=this.roleList.includes("Contract Signatory");
    this.salesSupport =this.roleList.includes('Sales Support')
  }

  //重置分页
  resetPage() {
    this.pageParams = {
      pageNo: 1,
      pageSize: 10,
    };
  }

 async operate(data: any) {
  if(this.roleBatch&&this.formData.zslSignSupplement==2)
   {
    this.loading=true;
    const res=await this.service.getImage();
    this.loading=false;       
    if(res.code=='0000'&&res.data.length>0)
    {
     this.goDeatail(data)
    }
    else{
      this.saleLeadShow=true;
    }
   }
  // else if(this.salesSupport&&this.formData.zslSignSupplement==3)
  // {
  //   this.loading=true;
  //   const res=await this.service.getImage();
  //   this.loading=false;    
  //   if(res.code=='0000'&&res.data.length>0)
  //   {
  //    this.goDeatail(data)
  //   }
  //   else
  //   {
  //     this.saleSupportShow=true;
  //   }
  // } 
  else{
    this.goDeatail(data)
   }
  }
  goDeatail(data: any)
  {
    const url = "/order-v3/contractSign";
    this.router.navigate([url], {
      queryParams: {
        id: data.id,
        needFileType: this.type,
        processInstanceTaskId: data.processInstanceTaskId,
        taskStatus: data.taskStatus,
        procInstId: data.procInstId,
        flag: 1,
        zslSignSupplement: this.formData.zslSignSupplement,
        signatureStatus: "signatureStatus",
      },
    });
  }

  changePageIndex(pageNo: number) {
    if (pageNo == 0) {
      pageNo = 1;
    }
    this.pageParams.pageNo = pageNo;
    this.loading = true;
    this.setLoading.emit(this.loading);
    this.pageChange.emit(this.pageParams);
  }

  changePageSize(pageSize: number) {
    // console.log('pageSize', pageSize);
    this.pageParams.pageSize = pageSize;
    this.loading = true;
    this.setLoading.emit(this.loading);
    this.pageChange.emit(this.pageParams);
  }
  //翻译进单模式
  ProOitModeType(e: any) {
    for (let i = 0; i < this.entryModeList.length; i++) {
      if (this.entryModeList[i].code === e) {
        return this.entryModeList[i].label;
      }
    }
    return e;
  }
  // 进单模式
  public getEntryModeList() {
    this.dictService.dictData('ENTRY_MODEL').subscribe((dictData) => {
      this.entryModeList = dictData.map(({ code, label }) => ({ code, label }))
    });
  }

  public CheckAll(value: boolean) {
    if (this.tableData) {
      this.tableData.forEach((item) => (this.mapOfCheckedId[item.id] = value));
    }
  }

  public AllCheck(e) {
    const dataList = this.tableData;    
    if (dataList) {
      for (let i = 0; i < dataList.length; i++) {
        if (!this.mapOfCheckedId[i]) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
 async openSelectUser() {
    this.loading=true;    
    const res=await this.service.getImage();      
    if(res.code!='0000'||res.data.length==0)
    {
      this.batchload = false;
      this.batchShow = false;
      this.saleLeadShow=true;
      this.loading=false;
      return      
    }
   const zsladminList=await this.service.getZsladmin()   
    if(zsladminList.code=='0000')
    {   this.loading=false;
      
        if(zsladminList.data)
        {
          const { data } = zsladminList
          this.userList = data;                
          if(this.userList.length>0)
          {
          this.batchShow = true;          
           return
          }
          else{
            this.adminMailShow=true;
            this.loading=false;
            return
          }
        }
        else{
          this.adminMailShow=true;
          this.loading=false;
          return
        }
    }
    else{
      this.adminMailShow=true;
      this.loading=false;
    }    
  }

  batchCancels() {
    this.batchShow = false;
  }
 async batchOk() {
    let applyIdList:any = Object.keys(this.mapOfCheckedId);
    applyIdList = applyIdList.filter((value) => {
      return this.mapOfCheckedId[value] == true;
    });   
    if (applyIdList.length >0) {
      const valid=this.checkFormValid(this.batchCanForm)
      if(!valid)
      {
        this.message.create("error","有必填项没有填写")
        return 
      }
      const { zslAdminEmail } = this.batchCanForm.getRawValue();
      const batchParam = {
        applyIdList,
        zslAdminEmail,
        zslSignSupplement: 3,
      }      
      this.batchload = true;
      this.service.summitZsladmin(batchParam).subscribe(res => {
        if (res.code=='0000') {
          this.batchload = false;
          this.loading = true;
          this.setLoading.emit(this.loading);
          this.pageChange.emit(this.pageParams);
          this.message.create("success", res.msg);
          this.batchShow = false;
        }
        else{
          this.message.create("error", res.msg);
          this.batchShow = false;
        }
      })
    }
    else{
      this.message.create("error","至少选择一项");
    }

  }

  checkFormValid(paramForm)
  { 
    //表单验证
    for (const i in paramForm.controls) {
      paramForm.controls[i].markAsDirty();
      paramForm.controls[i].updateValueAndValidity();
    }
    return paramForm.valid;  
  }
  tipsCancels()
  {
    this.saleLeadShow=false;
  }
  tipsOk()
  {
    this.saleLeadShow=false; 
    this.setWatermark.emit(true)
  }
  supportCancels()
  {
    this.saleSupportShow=false;
  }
  adminMailCancels()
  {
    this.adminMailShow=false;
  }
  adminMailOk()
  {
    this.adminMailShow=false;
    this.setAuthorizationMail.emit(true);
  }
  
}
