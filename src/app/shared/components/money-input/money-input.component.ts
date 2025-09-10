import { Component, Input, Output, EventEmitter, forwardRef, OnInit, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'money-input',
  templateUrl: './money-input.component.html',
  styleUrls: ['./money-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MoneyInputComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MoneyInputComponent),
      multi: true
    }
  ]
})
export class MoneyInputComponent implements ControlValueAccessor, Validator, OnInit, OnDestroy {
  @Input() placeholder: string = '';
  @Input() readonly: boolean = false;
  @Input() disabled: boolean = false;
  @Input() min: number | null = null;
  @Input() max: number | null = null;
  @Input() precision: number = 2; // 小数位数，默认2位
  @Input() showThousandsSeparator: boolean = true; // 是否显示千分位
  @Input() prefix: string = ''; // 前缀，如 ¥
  @Input() suffix: string = ''; // 后缀

  @Output() blur = new EventEmitter<FocusEvent>();
  @Output() focus = new EventEmitter<FocusEvent>();

  // 显示值（带千分位）
  displayValue: string = '';
  // 实际数字值
  private _value: number | null = null;
  // 是否获得焦点
  private _focused: boolean = false;

  // ControlValueAccessor 回调
  private onChange = (value: number | null) => {};
  private onTouched = () => {};

  ngOnInit() {
    this.updateDisplayValue();
  }

  ngOnDestroy() {}

  // ControlValueAccessor 实现
  writeValue(value: number | null): void {
    this._value = value;
    this.updateDisplayValue();
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Validator 实现
  validate(control: AbstractControl): ValidationErrors | null {
    if (this._value === null || this._value === undefined) {
      return null;
    }

    const errors: ValidationErrors = {};

    // 最小值验证
    if (this.min !== null && this._value < this.min) {
      errors['min'] = { min: this.min, actual: this._value };
    }

    // 最大值验证
    if (this.max !== null && this._value > this.max) {
      errors['max'] = { max: this.max, actual: this._value };
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  // 输入事件处理
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    let inputValue = target.value;

    // 只保留数字和小数点
    inputValue = inputValue.replace(/[^\d.]/g, '');

    // 确保只有一个小数点
    const parts = inputValue.split('.');
    if (parts.length > 2) {
      inputValue = parts[0] + '.' + parts.slice(1).join('');
    }

    // 限制小数位数
    if (parts.length === 2 && parts[1].length > this.precision) {
      inputValue = parts[0] + '.' + parts[1].substring(0, this.precision);
    }

    // 更新显示值（在获得焦点时保持纯数字格式）
    this.displayValue = inputValue;

    // 转换为数字
    const numValue = inputValue === '' ? null : parseFloat(inputValue);

    if (this._value !== numValue) {
      this._value = numValue;
      this.onChange(numValue);
    }
  }

  // 获得焦点事件
  onFocus(event: FocusEvent): void {
    this._focused = true;

    // 获得焦点时显示纯数字（无千分位）
    if (this._value !== null && this._value !== undefined && !isNaN(this._value)) {
      this.displayValue = this._value.toString();
    } else {
      this.displayValue = '';
    }

    this.focus.emit(event);
  }

  // 失去焦点事件
  onBlur(event: FocusEvent): void {
    this._focused = false;
    this.onTouched();
    this.updateDisplayValue();
    this.blur.emit(event);
  }

  // 更新显示值
  private updateDisplayValue(): void {
    if (this._value === null || this._value === undefined || isNaN(this._value)) {
      this.displayValue = '';
      return;
    }

    if (this._focused) {
      // 获得焦点时显示纯数字
      this.displayValue = this._value.toString();
      return;
    }

    // 失去焦点时显示格式化的值
    let formattedValue = this._value.toFixed(this.precision);

    if (this.showThousandsSeparator) {
      // 添加千分位分隔符
      const parts = formattedValue.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      formattedValue = parts.join('.');
    }

    this.displayValue = formattedValue;
  }

  // 键盘事件处理
  onKeyDown(event: KeyboardEvent): void {
    if (this.readonly || this.disabled) {
      event.preventDefault();
      return;
    }

    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];

    // 允许 Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) {
      return;
    }

    // 允许的特殊键
    if (allowedKeys.includes(event.key)) {
      return;
    }

    // 允许数字键
    if (event.key >= '0' && event.key <= '9') {
      return;
    }

    // 允许小数点（但要检查是否已存在）
    if (event.key === '.' || event.key === '。') {
      const target = event.target as HTMLInputElement;
      if (target.value.includes('.')) {
        event.preventDefault(); // 已存在小数点，不允许再输入
      }
      return;
    }

    // 其他键一律阻止
    event.preventDefault();
  }

  // 粘贴事件处理
  onPaste(event: ClipboardEvent): void {
    if (this.readonly || this.disabled) {
      event.preventDefault();
      return;
    }

    event.preventDefault();

    const pastedData = event.clipboardData.getData('text') || '';
    const cleanedData = pastedData.replace(/[^\d.]/g, '');

    // 检查是否是有效的数字
    if (cleanedData && !isNaN(parseFloat(cleanedData))) {
      const target = event.target as HTMLInputElement;
      target.value = cleanedData;

      // 触发 input 事件
      const inputEvent = new Event('input', { bubbles: true });
      target.dispatchEvent(inputEvent);
    }
  }
}
