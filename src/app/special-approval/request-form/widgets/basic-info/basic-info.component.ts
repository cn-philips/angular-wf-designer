import { Component, Input } from '@angular/core'
import { FormGroup, Validators } from '@angular/forms'
import { UploadXHRArgs, UploadFile, NzModalService } from 'ng-zorro-antd'

import { APPLY_TYPE, APPLY_TYPE_MAP } from '../../../special-approval.constants'
import { SpecialApprovalService } from '../../../special-approval.service'
import { getType } from '../../../../../assets/js/tools'
import { Observable, Observer } from 'rxjs'

interface CommonResponse {
  code: string;
  data: any;
  msg: string
}

@Component({
  selector: 'special-approval-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.scss']
})
export class BasicInfoComponent {
  @Input() formValues: FormGroup
  @Input() supportFileList: UploadFile[] = []
  @Input() editable: boolean
  @Input() executed:number = null


  tempData = [
    {label: '物流运输-特别仓储,物流费用', value: 'sp_logisticscost_apply_item_1'}
  ]

  APPLY_TYPE = APPLY_TYPE

  applyTypeMap = APPLY_TYPE_MAP

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
          const curFileIds = this.formValues.get('applyFileIds').value as String[]
          this.formValues.patchValue({ applyFileIds: curFileIds.concat(data) })
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
    console.log('before upload', file);
    return true
  }

  onRemoveFile = (file: UploadFile) => {
    const { response, name } = file
    return new Observable((observer: Observer<boolean>) => {
      this.modal.confirm({
        nzTitle: `确定移除文件${name}?`,
        nzOnOk: () => {
          const curFileIds = this.formValues.get('applyFileIds').value as String[]
          this.formValues.patchValue({ applyFileIds: curFileIds.filter((fileId) => fileId !== response.fileId) })
          observer.next(true)
        },
        nzOnCancel: () => {
          observer.next(false)
        }
      })
    })
  }
}
