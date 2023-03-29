import { Component, OnInit, Input, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators} from '@angular/forms'
import {UploadXHRArgs, UploadFile, NzModalService, NzMessageService} from 'ng-zorro-antd';

import { Hospital, SelectHospitalComponent, } from '../../select-hospital/select-hospital.component'
import { Dealer, SelectDealerComponent } from '../../select-dealer/select-dealer.component'
import { Reference, SelectReferenceComponent } from '../../select-reference/select-reference.component'
import { SpecialApprovalService } from '../../../../special-approval.service'
import { getType } from '../../../../../../../assets/js/tools'
import { Observable, Observer } from 'rxjs'
import { DictService } from "@core/services/dict.service";

import {
  APPLY_TYPE,
  BUSINESS_MODEL,
  BG_LIST,
  ORDER_TYPES,
  BUSINESS_MODEL_LIST,
  CURRENCIES,
} from '../../../../special-approval.constants'

interface CommonResponse {
  code: string;
  data: any;
  msg: string
}

@Component({
  selector: 'special-approval-cancel-order-info',
  templateUrl: './cancel-order.component.html',
  styleUrls: ['./cancel-order.component.scss']
})
export class CancelOrderComponent implements OnInit, OnChanges {
  constructor(public spService: SpecialApprovalService, private modal: NzModalService, private message: NzMessageService, private dictService: DictService) {}


  @ViewChild('selectHospital') selectHospital: SelectHospitalComponent

  @ViewChild('selectDealer') selectDealer: SelectDealerComponent

  @ViewChild('selectReference') selectReference: SelectReferenceComponent

  @Input() formValues: FormGroup
  @Input() editable = true
  @Input() baseInfo: FormGroup
  @Input() cancelOrderFileList: UploadFile[] = [];

  @Input() isSupplementNode = false
  @Input() applicantEmail

  cancelContractLink: any = {};

  APPLY_TYPE = APPLY_TYPE

  selectOptions = {
    orderTypes: ORDER_TYPES,
    bgList: BG_LIST,
    businessModels: BUSINESS_MODEL_LIST,
    currencies: CURRENCIES,
  }

  get bigAreas() {
    const cycleGroup = this.formValues.get('cycleGroup') as FormControl
    const cycleGroupBigAreaMap = this.spService.cycleGroupBigAreaMap
    if (cycleGroup && cycleGroupBigAreaMap[cycleGroup.value]) {
      return cycleGroupBigAreaMap[cycleGroup.value]
    } else {
      return []
    }
  }

  get bmcList() {
    const bg = this.formValues.get('bg') as FormControl
    return this.spService.bmcList.filter((bmc) => bmc.bg === bg.value)
  }

  get showDealerArea(): boolean {
    const businessModel = this.formValues.get('businessModel') as FormControl
    if (businessModel && businessModel.value === BUSINESS_MODEL.DISTRIBUTOR_DEAL) {
      return true
    } else {
      return false
    }
  }

  get omList() {
    const bg =  this.formValues.get('bg').value
    return (this.spService.omUserMap[bg] || []).map(({ name, email }) => ({
      label: `${name}(${email})`,
      value: email
    }))
  }

  get orderInfoStatus(): FormGroup { return this.formValues.get('orderInfoStatus') as FormGroup }


  onProductTypeChange(value) {
    console.log('产品型号');
    console.log(value);
  }

  onCalcProjectName() {
    const { hospitalName, productType, bg } = this.formValues.getRawValue()
    if (bg === 'PD&IGT') {
      return
    }
    const res = []
    if (hospitalName) {
      res.push(hospitalName)
    }

    if (productType) {
      res.push(productType)
    }
    this.formValues.patchValue({
      projectName: res.join('-')
    })
  }

  onCycleGroupChange() {
    this.formValues.patchValue({ bigArea: null })
  }

  onShowSelectHospitalModal() {
    this.selectHospital.showModal()
  }

  onSelectHospital(hospital: Hospital) {
    const { no, customerName } = hospital
    this.formValues.patchValue({
      hospitalNo: no,
      hospitalName: customerName,
    })
    this.onCalcProjectName()
  }

  onClearHospital() {
    this.formValues.patchValue({
      hospitalNo: null,
      hospitalName: null,
    })
  }

  onShowSelectDealerModal() {
    this.selectDealer.showModal()
  }

  onSelectDealer(dealer: Dealer) {
    const { dealerCode, dealerName } = dealer
    this.formValues.patchValue({
      dealerCode: dealerCode,
      dealerName: dealerName,
    })
  }

  onClearDealer() {
    this.formValues.patchValue({
      dealerCode: null,
      dealerName: null,
    })
  }

  onShowReferenceModal() {
    this.selectReference.showModal()
  }

  onSelectReference(reference: Reference) {
    const {
      referenceId,
      cosMainId,
      orderType,
      projectName,
      productModel,
      sap,
      team,
      region,
      bmc,
      businessModel,
      distributor,
      dealerCode,
      endUser,
      endUserId,
      contractPrice,
      invoiceInformation,
      logistician,
      deBook,
      reBook,
      logisticsTime,
    } = reference;
    let isDeBook = deBook =='1' && reBook != '1' ? deBook : '0';
    this.formValues.patchValue({
      orderType,
      referenceId,
      cosMainId,
      projectName,
      productType: productModel,
      sapOrderNo: sap,
      cycleGroup: team,
      bigArea: region,
      bmc,
      businessModel: businessModel ? businessModel.toLowerCase() : null,
      dealerName: distributor,
      dealerCode,
      hospitalName: endUser,
      hospitalNo: endUserId,
      orderAmount: contractPrice,
      currency: invoiceInformation,
      om: logistician,
      orderDate: logisticsTime,
      deBook: isDeBook,
    });
  }

  ngOnInit(): void {
    if (this.editable) {
      this.formValues.get('hospitalName').valueChanges.subscribe(() => {
        this.onCalcProjectName()
      })

      this.formValues.get('productType').valueChanges.subscribe(() => {
        this.onCalcProjectName()
      })
    }

  }

  //监测 @Input值的变化
  ngOnChanges(changes: SimpleChanges): void {
    //是否是补充信息节点
    if (changes.isSupplementNode && changes.isSupplementNode.currentValue) {
      this.formValues.controls.orderInfoStatus.enable();
      this.initCancelContractLink();
      this.orderInfoStatus.get('startProduction').setValidators(Validators.required); //是否开始生产
      this.orderInfoStatus.get('shipped').setValidators(Validators.required); // 是否已发货
      this.orderInfoStatus.get('thirdPartyProcurement').setValidators(Validators.required); // 是否有第三方采购
      this.orderInfoStatus.get('seenSite').setValidators(Validators.required); // 是否看过场地
      this.orderInfoStatus.get('advanceChargeStatus').setValidators(Validators.required); // 预付款状
    } 
  }

  //上传附件
  onUploadFile = (item: UploadXHRArgs) => {
    const formData = new FormData()
    const file = item.file as any
    formData.append('file', file)
    formData.append('fileType', getType(file))
    formData.append('filename', file.name)

    return this.spService.uploadFile(formData).subscribe(
      (response: CommonResponse) => {
        const { data, code } = response
        if ('0000' === code) {
          const curFileIds = this.orderInfoStatus.get('attachment').value as String[]
          this.orderInfoStatus.patchValue({ attachment: curFileIds.concat(data)})
          item.onSuccess({ fileId: data }, file, response)
        } else {
          item.onError({}, file)
        }
      },
      err => {
        item.onError!(err, item.file!)
      }
    )
  }

  // 上传之前的校验(文件类型, 文件大小), 校验不通过, return false, 会阻止自动上传
  onBeforeUpload = (file) => {
    if (this.orderInfoStatus.getRawValue().attachment.length >= 5) {
      this.message.error('最多上传5个文件');
      return false;
    }
    console.log('before upload', file);
    return true;
  }

  onRemoveFile = (file: UploadFile) => {
    const { response, name } = file
    return new Observable((observer: Observer<boolean>) => {
      this.modal.confirm({
        nzTitle: `确定移除文件${name}?`,
        nzOnOk: () => {
          const curFileIds = this.orderInfoStatus.get('attachment').value as String[]
          this.orderInfoStatus.patchValue({ attachment: curFileIds.filter((fileId) => fileId !== response.fileId) })
          observer.next(true)
        },
        nzOnCancel: () => {
          observer.next(false)
        }
      })
    })
  }


  //取消合同模板地址
  initCancelContractLink() {
    const list = this.dictService.getDictListByGroupName("sp_contract_apply_item")
    .map(({ tag, label }) => ({ label: tag, value: label }));
    if (list.length > 0) {
      this.cancelContractLink = list[0];
    }
  }

  //打开url
  openLink(url) {
    if(url != "" && url != null && url != undefined){
      window.open(url, "_blank");
    }
  }

}
