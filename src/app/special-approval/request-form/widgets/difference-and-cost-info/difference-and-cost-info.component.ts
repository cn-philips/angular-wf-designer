import { Component, Input } from '@angular/core'
import { FormGroup, Validators } from '@angular/forms'
import { UploadFile, NzModalService } from 'ng-zorro-antd'

import {APPLY_TYPE} from '../../../special-approval.constants'
import { SpecialApprovalService } from '../../../special-approval.service'


@Component({
  selector: 'special-approval-difference-and-cost-info',
  templateUrl: './difference-and-cost-info.component.html',
  styleUrls: ['./difference-and-cost-info-component.scss']
})
export class DifferenceAndCostInfoComponent {
  @Input() formValues: FormGroup
  @Input() exchangeInfo: FormGroup
  @Input() supportFileList: UploadFile[] = []
  @Input() editable: boolean
  @Input() executed:number = null

  APPLY_TYPE = APPLY_TYPE

  constructor(private spService: SpecialApprovalService, private modal: NzModalService) {}

  ngOnInit(): void {
  }
  /*
  * description: 获取表格数据
  * */
  get orders() {
    return this.formValues.get("orderDifferences") as FormGroup;
  }


  /*
  * @description: cost发生变化
  * */
  onCostChanged() {
    let cost = 0
    this.orders.value.forEach(item => {
      cost += item.cost
    })
    this.exchangeInfo.patchValue({
      ...this.exchangeInfo,
      cost
    })
  }
  /*
  * @description: 添加差异及成本分析
  * */
  onAddAnalysis() {
    this.orders.patchValue([
      ...this.orders.value,
      {
        configDetail: null,
        transferOut: null,
        transferIn: null,
        handlePlan: null,
        cost: null,
      },
    ]);
  }

  /*
  * @description: 删除一行数据
  * @params orderAnalysis { object }
  * */
  onDeleteProduct(orderAnalysis) {
    const orderAnalyses = this.orders.value.filter((curOrderAnalysis) => curOrderAnalysis !== orderAnalysis);
    this.orders.patchValue(orderAnalyses);
  }

}
