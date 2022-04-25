import { Component, Input } from '@angular/core'
import { FormGroup, Validators } from '@angular/forms'
import { UploadXHRArgs, UploadFile, NzModalService } from 'ng-zorro-antd'

import {APPLY_TYPE, APPLY_TYPE_MAP, EXCHANGE_TYPE_LIST, EXCHANGE_METHODS_LIST} from '../../../special-approval.constants'
import { SpecialApprovalService } from '../../../special-approval.service'
import { getType } from '../../../../../assets/js/tools'
import { Observable, Observer } from 'rxjs'

interface CommonResponse {
  code: string;
  data: any;
  msg: string
}

@Component({
  selector: 'special-approval-exchange-info',
  templateUrl: './exchange-info.component.html',
  styleUrls: ['./exchange-info.component.scss']
})
export class ExchangeInfoComponent {
  @Input() formValues: FormGroup
  @Input() supportFileList: UploadFile[] = []
  @Input() editable: boolean
  @Input() executed:number = null

  APPLY_TYPE = APPLY_TYPE


  // 表单下拉框选项集合
  SELECT_OPTION_LIST = {
    exchangeOptions: EXCHANGE_TYPE_LIST,
    exchangeMethodOptions: EXCHANGE_METHODS_LIST,
  }

  constructor(private spService: SpecialApprovalService, private modal: NzModalService) {}

  get applyType() {
    return this.formValues.get('applyType').value as string
  }

  get applyItem() {
    return this.formValues.get('applyItem').value
  }

  get applyItems() {
    return APPLY_TYPE_MAP[this.applyType] ? APPLY_TYPE_MAP[this.applyType].items : []
  }

  onApplyItemChange(applyItem) {
    if (this.applyType === APPLY_TYPE.EXT_WARRANTY && applyItem == 'sp_warranty_apply_item_5') {
      this.formValues.controls.applyItemDesc.setValidators([Validators.required])
    } else {
      this.formValues.controls.applyItemDesc.clearValidators()
    }
  }

}
