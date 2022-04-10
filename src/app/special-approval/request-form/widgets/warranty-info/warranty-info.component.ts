import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms'
import * as moment from 'moment'

@Component({
  selector: 'special-approval-warranty-info',
  templateUrl: './warranty-info.component.html',
  styleUrls: ['./warranty-info.component.scss']
})
export class WarrantyInfoComponent {
  constructor() { }

  @Input() formValues: FormGroup
  @Input() editable: boolean
  @Input() minMon: number
  @Input() maxMon: number

  onDateFieldChange() {
    const { expectedStdWarrantyStartdate, stdWarrantyMonths, applyExtWarrantyMonths } = this.formValues.getRawValue()
    
    if (expectedStdWarrantyStartdate && stdWarrantyMonths) {
      this.formValues.patchValue({
        expectedStdWarrantyEnddate: moment(expectedStdWarrantyStartdate).subtract(1, 'days').add(stdWarrantyMonths, 'months').format('YYYY-MM-DD')
      })
      if (applyExtWarrantyMonths) {
        this.formValues.patchValue({
          applyStdWarrantyEnddate: moment(expectedStdWarrantyStartdate).subtract(1, 'days').add(Number(stdWarrantyMonths) + Number(applyExtWarrantyMonths), 'months').format('YYYY-MM-DD')
        })
      }
    }
  }
}
