import { Component, forwardRef, OnInit, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import * as moment from 'moment'

const DEFAULT_FORMAT = {
  date: 'YYYY-MM-DD',
  month: 'YYYY-MM-01'
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
  @Input() disabledDate:Function = null
  _value = null // model值

  disabled = false

  get nzPlaceHolder() {
    return this.disabled ? '' : this.placeholder
  }

  constructor() { }

  ngOnInit() { }

  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(obj: any): void {
    if (obj) {
      this.modelValue = obj
    } else {
      this.modelValue = null
    }
  }

  get modelValue() {
    return this._value
  }

  set modelValue(value) {
    this._value = this.formatDate(value)
    this.onChange(this._value)
  }

  formatDate(date) {
    const isOADate = new RegExp(/^[0-9]*$/).test(date)
    if (isOADate) {
      const ms = (Number.parseInt(date) - 25569) * 86400000
      date = new Date(ms);
    }
    const formatStr = this.format || DEFAULT_FORMAT[this.mode]
    return date ? moment(date).format(formatStr) : null
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
    if (this._value) {
      this.onChange(this._value)
    }
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled
  }
}
