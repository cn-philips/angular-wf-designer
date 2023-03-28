import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { Component, forwardRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

/**
 * 编辑 正常的下拉框
 *
 * disable 普通的文本框
 * 1. nzValue="jack" nzLabel="Jack"  nzLabel和nzValue不一定一致
 *  一致 直接显示value
 *  不一致
 *      nzValue在option列表里, 显示label
 *      nzValue不在option列表里, 直接显示value
 *
 * 2. 表单组件的封装
 */
interface SelectControlValueAccessor {
  writeValue(obj: any): void;
  registerOnChange(fn: any): void;
  registerOnTouched(fn: any): void;
  setDisabledState(isDisabled: boolean): void;
}

@Component({
  selector: "shared-select",
  templateUrl: "select.component.html",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements OnInit, SelectControlValueAccessor, OnChanges {
  _selected: any;

  @Input() options: any[];
  @Input() placeholder: string;
  @Input() allowClear: boolean;
  @Input() notFoundContent: string;
  @Input() nzDropdownMatchSelectWidth: boolean = true;
  @Input() nzShowSearch = false

  disabled: boolean;

  displayVal: string

  constructor() {}

  ngOnInit() {}

  get selected() {
    return this._selected;
  }

  set selected(value: string) {
    this._selected = value;
    this.onChange(this._selected);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.options) {
      this.setDisplayVal(this.selected)
    }
  }

  onChange = (_: any) => {};
  onTouched = () => {};

  getItem(value, options) {
    if (value && options) {
      const option = options.find((item) => item.value === value);
      if (!option) {
        this.options.push({ value: value, label: value });
      }
    }
  }

  setDisplayVal(value) {
    if (this.options && this.options.length > 0) {
      const item = this.options.find((option) => option.value === value)
      if (item) {
        this.displayVal = item.label
      } else {
        this.displayVal = value
      }
    } else {
      this.displayVal = value
    }
  }

  writeValue(value: any): void {
    if (value !== undefined) {
      this.selected = value;
      this.getItem(this.selected, this.options);
    }
    this.setDisplayVal(value)
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
