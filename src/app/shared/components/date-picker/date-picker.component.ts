import { Component, forwardRef, OnInit, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import * as moment from 'moment'

const DEFAULT_FORMAT = {
  date: 'YYYY-MM-DD',
  month: 'YYYY-MM-DD'
}

@Component({
  selector: 'shared-date-picker',
  templateUrl: 'date-picker.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => DatePickerComponent),
    },
  ],
})
export class DatePickerComponent implements OnInit, ControlValueAccessor {
  @Input() placeholder = '请选择'
  @Input() format = null
  @Input() mode = 'date'

  _value = null // model值
  date = null // 组件值

  disabled = false

  get nzPlaceHolder() {
    return this.disabled ? '' : this.placeholder
  }

  constructor() { }

  ngOnInit() { }

  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(obj: any): void {
    this.date = obj
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled
  }

  onDateChange(date) {
    const formatStr = this.format || DEFAULT_FORMAT[this.mode]
    const _value = date ? moment(date).format(formatStr) : null
    this.onChange(_value)
  }
}