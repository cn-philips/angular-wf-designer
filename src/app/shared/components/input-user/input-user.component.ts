import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, FormBuilder, NG_VALUE_ACCESSOR } from '@angular/forms';
import { User } from '@core/domain';
import { HttpService } from '@core/services';
import { NzMessageService } from 'ng-zorro-antd';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';

export enum SELECT_MODE {
  NULTIPLE = 'multiple',
  DEFAULT = 'default'
}

@Component({
  selector: 'shared-input-user',
  templateUrl: './input-user.component.html',
  styleUrls: ['./input-user.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputUserComponent),
      multi: true,
    }
  ]
})
export class InputUserComponent implements ControlValueAccessor, OnInit {
  searchChange$ = new BehaviorSubject("");
  isSearchLoading = false;
  userList: User[] = [];
  fetchUserUrl = "/act/role/getUsersByEmail";
  selectedUsers: User[] = [];
  @Input() mode: SELECT_MODE = SELECT_MODE.DEFAULT;
  @Output() onChange = new EventEmitter();
  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private http: HttpService
  ) { }

  writeValue(obj: any): void {
    console.log('writeValue',obj);
    if (obj) {
      this.selectedUsers = obj;
      this.loadExistUser(obj);
    } else {
      this.selectedUsers = [];
    }
  }
  loadExistUser(emails: String[]) {
    if(emails.length === 0) return;
    let promiseArr = emails.map(email=>this.http
      .get(`${this.fetchUserUrl}`, {
        params: { email },
      })
      .pipe(map((res: any) => res.data as User[]))
      .pipe(
        map((users) =>
          users.map((user) => ({
            ...user,
            displayName: `${user.name}(${user.email})`,
          }))
        )
      ).toPromise())
      Promise.all(promiseArr).then((arr)=>{
        let result = arr.reduce((acc,cur)=>{
          acc.push(...cur);
          return acc;
        },[])
        this.userList=result;
      })
  }
  registerOnTouched(fn: any): void {
    this.onChange.subscribe(fn);
  }
  registerOnChange(fn: any): void {
    this.onChange.subscribe(fn);
  }
  setDisabledState?(isDisabled: boolean): void {
    throw new Error('Method not implemented.');
  }
  onModelChange(value: any): void {
    // console.log('onModelChange',value);
    this.selectedUsers = value;
    this.onChange.emit(value);
  }
  async ngOnInit() {
    this.bindUserSearchChange();
  }
  bindUserSearchChange() {
    const optionList$: Observable<User[]> = this.searchChange$
      .asObservable()
      .pipe(debounceTime(500))
      .pipe(switchMap(this.getUserList));
    optionList$.subscribe((data) => {
      this.userList = data;
      this.isSearchLoading = false;
    });
  }
  // 模糊查询用户
  onSearchUser(keyword: string) {
    this.isSearchLoading = true;
    this.searchChange$.next(keyword);
  }
  getUserList = (keyword: string) => {
    if (!keyword) {
      this.isSearchLoading = false;
      this.userList = []
      return [];
    }
    return this.http
      .get(`${this.fetchUserUrl}`, {
        params: { email: keyword },
      })
      .pipe(map((res: any) => res.data as User[]))
      .pipe(
        map((users) =>
          users.map((user) => ({
            ...user,
            displayName: `${user.name}(${user.email})`,
          }))
        )
      );
  };
}
