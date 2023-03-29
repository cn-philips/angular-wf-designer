import {Component, OnInit, Input, ViewChild, Output, EventEmitter,ChangeDetectorRef} from '@angular/core';
import { FormArray, FormGroup, Validators } from '@angular/forms';
import{OrderV3Service}from'../../order-v3.service'
import { differenceInCalendarDays } from 'date-fns';
import { saveAs } from 'file-saver';
import {HttpService} from '@core/services';
import { Router, ActivatedRoute } from '@angular/router';
import { forEach } from '@angular/router/src/utils/collection';


@Component({
  selector: 'oit-form-group',
  templateUrl: './oit-form-group.component.html',
  styleUrls: ['./oit-form-group.component.scss']
})
export class OitFormGroupComponent implements OnInit {

  constructor(public service:OrderV3Service,
              private http: HttpService,
              public changeDetectorRef: ChangeDetectorRef,
              private activatedRouter: ActivatedRoute)
              {

              }

  @Input() omDisabled: boolean
  @Input() formValue:FormGroup
  @Input() editCurr:true;
  @Input() needFileType: any //待补充文件类型 'contract'-待上传正本合同 ，'oit'-OIT文件待补充 'om'
  @ViewChild('selectMail') selectMail
  @ViewChild('oitMoney') oitMoney

  @Output() updatePage = new EventEmitter<string>();
  status
  supportFileList: any = [];
  needFileTypeShowOff:any=false;
  disabledDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, this.deBookInform.getRawValue().deBookDate) < 0;
  }
  financialSchemeOff:any;
  get remarkFrom():FormGroup
  {
    return this.formValue.get("remarkFrom") as FormGroup;
  }
  get oitInform():FormGroup
  {
   return this.formValue.get('oitInform') as FormGroup;
  }
  get baseInfoFrom():FormGroup
  {
    return this.formValue.get('baseInfoFrom') as FormGroup;
  }
  get priceApproval():FormGroup
  {
    return this.formValue.get('priceApproval') as FormGroup;
  }
  get financialInform():FormGroup
  {
    return this.formValue.get('financialInform') as FormGroup;
  }
  get deBookInform():FormGroup
  {
    return this.formValue.get("deBookInform") as FormGroup;
  }
  get supportingListform():FormGroup
  {
    return this.formValue.get("supportingListform") as FormGroup;
  }
  get signFileForm():FormGroup{
    return this.formValue.get("signFileForm") as FormGroup;
  }
  get baseInfoTable(): FormGroup {
    return this.formValue.get("baseInfoTable") as FormGroup;
  }
  get marketBundleInfo(): FormArray {
    return this.formValue.get("marketBundleInfo") as FormArray;
  }
  ngOnChanges()
  {
    
    // if (this.deBookInform.getRawValue().deBookDate) {
    //   this.deBookInform.get('deBook').disable()
    //   this.deBookInform.get('deBookDate').disable()
    // }
    // if (this.deBookInform.getRawValue().reBookDate) {
    //   this.deBookInform.get('reBook').disable()
    //   this.deBookInform.get('reBookDate').disable()
    // }
    // if (this.deBookInform.getRawValue().cancel == '1') {
    //   this.deBookInform.disable();     
    // }
    
  }
  ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();
  }
  ngOnInit() {
    //缺失文件是否补充完整校验  isOA   isOM
    const roleList = JSON.parse(localStorage.getItem("roles"));   
    var roles = [];
    const permissions = JSON.parse(localStorage.getItem('permissionsV3')).oit_complated_supplement;
    roles = Array.from(new Set(permissions.map(val => val.fieRoles)));
    roles.forEach(val => {
      if(val && roleList.includes(val)) {
        this.needFileTypeShowOff=true;
      } 
    })

    if(this.needFileType == 'oit'){
      let oaSupplementFile = this.oitInform.get('oaSupplementFile').value;
      if(oaSupplementFile == '' || oaSupplementFile == null || oaSupplementFile == undefined){
        this.oitInform.controls.oaSupplementFile.setValidators([Validators.required]);
      }
      if (oaSupplementFile == '1'){
        this.oitInform.get('oaSupplementFile').disable();
      } else {
        this.oitInform.get('oaSupplementFile').enable();
      }
      this.oitInform.controls.oaSupplementFile.updateValueAndValidity();
      this.oitInform.get('oitInformationFile').disable()
      this.oitInform.get('remark').disable()
      this.oitInform.get('speciallySupportingFileName').disable()
    }
    this.FinancialChange(this.financialInform.getRawValue().financialSchemeName)
    this.onAddSupportFile()
    if (this.baseInfoFrom.getRawValue().dealFormSalesModality === 'PD&IGT') {
      this.oitMoney.toggle()
    }
    this.status = this.activatedRouter.queryParams['value'].taskStatus;
   const flag = this.activatedRouter.queryParams['value'].taskStatus;
    if (this.status == 'ecos_oit_order_upload' && flag == '0') {
      const searchParams = {
        pageNo: 1,
        pageSize: 5,
        role: 'OM',
        modality: this.baseInfoFrom.getRawValue().orderSalesModality
      }
      this.http.post('/act/ecos/oit/cdUser', searchParams)
        .subscribe(({ code, data }) => {
          if (code === '0000') {
            const { rows, total } = data
            this.onSelectOmEmail(rows[0])
          }
        })
    }
  }

  onClearsoluOrder()
  {
    this.oitInform.patchValue({
      omEmail:null
    })
  }
  onShowEmailModal(modality)
  {
     this.selectMail.show({role:'OM',modality: modality},true)
  }
  onSelectOmEmail(val)
  {
    this.oitInform.patchValue({
      omName:`${val.name}(${val.email})`,
      omEmail: val.email,
    })

  }

  clickUpdate() {
    this.updatePage.emit('apply_save')
  }


  isThirdShow() {
    const businessModel = this.baseInfoFrom.getRawValue().businessModel
    const modality = this.baseInfoFrom.getRawValue().dealFormSalesModality
    const oitMode = this.baseInfoFrom.getRawValue().oitMode
    const sampleCheck = this.priceApproval.getRawValue().sampleCheck
    if (businessModel === 'DISTRIBUTOR' && (modality === 'PD&IGT' ? oitMode === 'BIDDING' : true) && sampleCheck === '1') {
      return true
    } else {
      return false
    }
  }

  reBookChange(val) {     
    if (val == '1') {
      this.deBookInform.get('reBookDate').setValidators([Validators.required])
    }
    if (val == '0') {
      this.deBookInform.get('reBookDate').clearValidators()
    }
    if (val == null) {
      this.deBookInform.get('reBookDate').clearValidators()
    }
    this.deBookInform.get('reBookDate').updateValueAndValidity();
  }

  deBookChange(val) {
    if (val == '1') {
      this.deBookInform.get('deBookDate').setValidators([Validators.required])
    }
    if (val == '0') {
      this.deBookInform.get('deBookDate').clearValidators();
      this.deBookInform.get('reBookDate').clearValidators();
      this.deBookInform.patchValue({
        reBook:'0',
      })
    }
    if (val == null) {
      this.deBookInform.get('deBookDate').clearValidators()
    }
    this.deBookInform.get('deBookDate').updateValueAndValidity();
  }

  cancelChange(val: any) {
    if (val == '1') {
      this.deBookInform.get('cancelTime').setValidators([Validators.required])
      this.deBookInform.get('cancelFile').setValidators([Validators.required])
    }
    if (val == '0') {
      this.deBookInform.get('cancelTime').clearValidators()
      this.deBookInform.get('cancelFile').clearValidators()
    }
    if(val==null)
    {
      this.deBookInform.get('cancelTime').clearValidators()
      this.deBookInform.get('cancelFile').clearValidators()
    }
    this.deBookInform.get('cancelTime').updateValueAndValidity()
    this.deBookInform.get('cancelFile').updateValueAndValidity()
  }

  FinancialChange(val: any) {
    if(val)
    {
      if (val == 'OABC_OTHER') {
        this.financialInform.get('financialSchemeOtherRemark').setValidators([Validators.required])
       }else {
         this.financialInform.get('financialSchemeOtherRemark').clearValidators()
       }
       this.deBookInform.get('financialSchemeOtherRemark').updateValueAndValidity()
    }
  }

  onAddSupportFile() {  
    
    let contractFile = this.signFileForm.getRawValue().contractFile
    let exportControlFile  = this.oitInform.getRawValue().exportControlFile
    let credentialFile  = this.oitInform.getRawValue().credentialFile
    let otherFile  = this.oitInform.getRawValue().otherFile
    let requestLetter = this.baseInfoFrom.getRawValue().orderModality === 'PD&IGT'? this.baseInfoTable.getRawValue().requestLetter: this.baseInfoTable.getRawValue().dealerRequestLetterFile
    let sofonFile = this.priceApproval.getRawValue().sofonFile
    let cpclFile = this.baseInfoTable.getRawValue().cpclFile
   
    const {marketBundleInfo}=this.baseInfoFrom.getRawValue();
    let configFile:any=[];
    if(marketBundleInfo.length>0)
    {
      marketBundleInfo.map(val=>{
        if(val.configFile&&val.configFile.length>0)
        {
          val.configFile.map(vals=>{
            configFile.push(vals)
          })
        }  
      })
    }
    else
    {
      configFile=null
    }
     
    this.supportFileList = [
      {
        fileName: '合同文件',
        file: contractFile,
      },
      {
        fileName: '出口管制文件',
        file: exportControlFile,
      },
      {
        fileName: '付款凭证',
        file: credentialFile
      },
      {
        fileName: 'SOFON文件',
        file: sofonFile
      },
      {
        fileName: '盖章配置',
        file:configFile
      },
      {
        fileName: 'CPCL文件',
        file: cpclFile
      },
      {
        fileName: '要货函',
        file: requestLetter
      },
      {
        fileName: '其他文件',
        file: otherFile
      },
    ]
  }
   
  financialSchemeChange(event)
  {
    //选择是否需要使用金融方案
    if(event=='1')
    {
      this.financialSchemeOff=true;
      this.financialInform.get("financialSchemeName").setValidators([Validators.required]);
      this.financialInform.get("financialSchemeName").updateValueAndValidity();
    }
    else
    {
      this.financialInform.get("financialSchemeName").clearValidators();
      this.financialInform.get("financialSchemeName").updateValueAndValidity();
      this.financialSchemeOff=false;
    }
  }
  onDownloadFile({ fileId, fileName }) {
    let uri = `/act/system/download/${fileId}`;
    this.http.get(uri, {
      responseType: 'blob'
    }).subscribe(data => {
      saveAs(data, fileName);
    });
  }

  downloadZipFile() {
    let fileList = []
    for (let i = 0; i < this.supportFileList.length; i++) {
      if (this.supportFileList[i].file && this.supportFileList[i].file.length > 0){
        for (let j = 0; j < this.supportFileList[i].file.length; j++) {
         fileList.push(this.supportFileList[i].file[j].fileId)
        }
      }
    }
    const ids = fileList.join(',')
    let uri = `/act/system/download/zip/${ids}`;
    this.http.get(uri, {
      responseType: 'blob'
    }).subscribe(data => {
      saveAs(data, this.baseInfoFrom.getRawValue().referenceId);
    });
  }
  onblurRemark()
  {
    const {remark}=this.oitInform.getRawValue();
    this.remarkFrom.patchValue({
      comments:remark,
    })
  }
}
