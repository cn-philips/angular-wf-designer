import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: 'shared-radio',
  templateUrl: './radio.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => RadioComponent),
    },
  ],
})
export class RadioComponent implements OnInit, ControlValueAccessor {

  @Input() label: string

  @Input() trueValue = true
  @Input() falseValue = false

  disabled: boolean
  _value = null // form model值

  constructor() { }

  ngOnInit() { }

  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(obj: any): void {
    this.modelValue = (obj === this.trueValue)
  }

  get modelValue() {
    return this._value === this.trueValue
  }

  set modelValue(value) {
    this._value = value ? this.trueValue : this.falseValue
    this.onChange(this._value)
  }
 
  registerOnChange(fn: any): void {
    this.onChange = fn;
    if (this._value !== null) {
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