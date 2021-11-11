import {Component, EventEmitter, forwardRef, Input, OnInit, Output} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {HttpService} from '../../services';
import {BehaviorSubject, Observable} from 'rxjs';
import {debounceTime, map, switchMap, filter} from 'rxjs/operators';

@Component({
  selector: 'sys-user-select',
  templateUrl: './sys-user-select.component.html',
  styleUrls: ['./sys-user-select.component.less'],
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SysUserSelectComponent), multi: true},
  ]
})
export class SysUserSelectComponent implements OnInit, ControlValueAccessor {

  @Input()
  disabled: boolean;

  @Output()
  selectUser = new EventEmitter();

  @Output()
  selectObject = new EventEmitter();

  @Input()
  _value: any;

  @Input()
  customerStyle: string;

  @Input()
  autoEmit: boolean = false;

  @Input()
  placeholder: string = '';

  @Input()
  userList: any[] = [];
  loading: boolean = false;
  searchChange$ = new BehaviorSubject('');
  defaultSize: number = 10;
  initFlag: boolean = false;

  constructor(
    private http: HttpService
  ) {
  }

  get selectedOption(): any {
    return this._value;
  }

  @Input()
  set selectedOption(val: any) {
    if (val !== this._value) {
      this._value = val;
      this.onChange(val);
    }
  }

  onChange = (value: any) => {
  };

  onTouched = (value: any) => {
  };

  writeValue(value: any) {// userid is number
    if ('string' === typeof value) {
      value = Number(value) || undefined;
    }
    this._value = value;
  }

  updateChanges() {
    this.onChange(this._value);
  }

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  ngOnInit() {
    const uri = '/act/queryUserByKeyword/';
    this.initFlag = true;
    const getSysUserList = (keyword: string) =>
      this.http
        .get(uri + keyword)
        .pipe(map((res: any) => res.data));

    const optionList$: Observable<string[]> = this.searchChange$
      .asObservable()
      .pipe(debounceTime(500), filter((term) => { 
        if(!term || term.length <=1) {
          this.userList = [];
          this.loading = false;
        }
        return term && term.length > 1
        }))
      .pipe(switchMap(getSysUserList));
    optionList$.subscribe(data => {
      this.userList = data ||  [];
      this.loading = false;

      // if (this.autoEmit && this._value) {
      //   this.modelChange(this._value);
      // }
    });
  }

  onSearch(value: string): void {
    this.loading = true;
    this.searchChange$.next(value);
  }

  modelChange(event) {
    if (event) {
      const user = this.userList.find((item) => {
        return item.id === event;
      });
      this.selectObject.emit(user);
      this.selectUser.emit(event);
      return;
    }
    for (const o of this.userList) {
      if (o.userId === event) {
        this.selectUser.emit(o);
        break;
      }
    }
  }

  getAdvQuery(initFlag: boolean) {
    let result;
    if (initFlag && this._value) {
      result = {
        'userid': this._value
      };
    }
    this.initFlag = false;
    return result;
  }

}
