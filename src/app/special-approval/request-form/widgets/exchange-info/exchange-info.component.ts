import { Component, Input } from '@angular/core'
import { FormGroup, Validators } from '@angular/forms'
import { UploadFile, NzModalService } from 'ng-zorro-antd'

import {APPLY_TYPE, APPLY_TYPE_MAP, EXCHANGE_TYPE_LIST, EXCHANGE_METHODS_LIST} from '../../../special-approval.constants'
import { SpecialApprovalService } from '../../../special-approval.service'


@Component({
  selector: 'special-approval-exchange-info',
  templateUrl: './exchange-info.component.html',
  styleUrls: ['./exchange-info.component.scss']
})
export class ExchangeInfoComponent {
  @Input() formValues: FormGroup
  @Input() supportFileList: UploadFile[] = []
  @Input() editable: boolean
  @Input() executed: number = null

  APPLY_TYPE = APPLY_TYPE


  // 表单下拉框选项集合
  SELECT_OPTION_LIST = {
    exchangeOptions: EXCHANGE_TYPE_LIST(),
    exchangeMethodOptions: EXCHANGE_METHODS_LIST()
  }

  constructor(private spService: SpecialApprovalService, private modal: NzModalService) {
  }

  /*
  * @description: 换货方式变化
  * */
  onExchangeMethodChanged(exchangeMethod) {

  }

  /*
  * @description: 换货类型改变触发,修改换货方式下拉框展示内容
  * @params {String} exchangeTye
  * */
  onExchangeTypeChanged(exchangeType) {
    this.SELECT_OPTION_LIST.exchangeMethodOptions.forEach((item, index) => {
      let ORUType = this.SELECT_OPTION_LIST.exchangeOptions.find(uroItem => uroItem.value === exchangeType) //within oru下拉对象
      if (ORUType && ORUType.label !== 'within ORU') {
        if (item.label === '互换') {
          this.SELECT_OPTION_LIST.exchangeMethodOptions[index] = Object.assign({}, {...item, disabled: true});
          //判断值是否时disabled的值，如果是，则清空
          if (this.formValues.value.exchangeMethod === item.value) {
            this.formValues.patchValue({
              exchangeMethod: null
            })
          }
        }
        else {
          this.SELECT_OPTION_LIST.exchangeMethodOptions[index] = Object.assign({}, {...item, disabled: false})
        }
      } else {
        this.SELECT_OPTION_LIST.exchangeMethodOptions[index] = Object.assign({}, {...item, disabled: false})
      }
    })
    console.log(this.SELECT_OPTION_LIST.exchangeMethodOptions)
  }

}
