import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { FormGroup } from '@angular/forms'
import {UploadXHRArgs, UploadFile, NzModalService, NzMessageService} from 'ng-zorro-antd';

import { APPLY_TYPE } from '../../../special-approval.constants'
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
export class BasicInfoComponent implements OnInit {
  @Input() formValues: FormGroup
  @Input() supportFileList: UploadFile[] = []
  @Input() editable: boolean
  @Input() executed:number = null
  @Input() saleRegions = []

  @Output() itemChange: EventEmitter<string> = new EventEmitter<string>()

  APPLY_TYPE = APPLY_TYPE

  constructor(private spService: SpecialApprovalService, private modal: NzModalService, private message: NzMessageService) {}

  ngOnInit(): void {}

  onSelectSystemRegion(region) {
    if (!region) { return }
    const systemRegion = this.saleRegions.find(systemRegion => systemRegion.value === region)
    if (systemRegion) {
      const { modality, cycleGroup, bigArea, smallArea } = systemRegion
      this.formValues.patchValue({
        bg: modality,
        cycleGroup,
        bigArea,
        smallArea
      })
    }
  }

  get applyType() {
    return this.formValues.get('applyType').value as string
  }

  get applyItem() {
    return this.formValues.get('applyItem').value
  }

  get applyItems() {
    return this.spService.getApplyItems(this.applyType)
  }

  get showApplyItemDesc(): boolean {
    return (this.applyType === APPLY_TYPE.EXT_WARRANTY && this.applyItem == 'sp_warranty_apply_item_5') ||
      (this.applyType === APPLY_TYPE.LC_AMENDMENT && this.applyItem == 'sp_lcamendment_apply_item_5') ||
      (this.applyType === APPLY_TYPE.NONE_DIRECT_ORDER&& this.applyItem == 'sp_nonedirectorder_apply_item_2')
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
    if (this.formValues.getRawValue().applyFileIds.length >= 5) {
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

  applyItemChange(val: string) {
    this.itemChange.emit(val);
  }
}
