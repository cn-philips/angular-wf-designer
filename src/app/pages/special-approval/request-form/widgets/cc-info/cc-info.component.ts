import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms'
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';

import { HttpService } from '@core/services/http.service'
import { CC_TYPES, APPLY_TYPE } from '../../../special-approval.constants'

interface User {
  id: number;
  code: string;
  email: string;
  name: string;
  displayName: string;
}

@Component({
  selector: 'special-approval-cc-info',
  templateUrl: './cc-info.component.html',
  styleUrls: ['./cc-info.component.scss']
})
export class CcInfoComponent implements OnInit {
  @Input() formValues: FormGroup
  @Input() userList: User[] = []
  @Input() editable: boolean
  @Input() applyType: string

  APPLY_TYPE = APPLY_TYPE

  fetchUserUrl = '/act/role/getUsersByEmail'
  searchChange$ = new BehaviorSubject('');
  isSearchLoading = false

  constructor(private http: HttpService) { }

  selectOptions = {
    ccTypes: CC_TYPES
  }

  get ccWarningMessage(): { show: boolean, message?: string } {
    const data = {
      show: false,
      message: ''
    }
    if (
      this.applyType === APPLY_TYPE.PRODUCTION ||
      this.applyType === APPLY_TYPE.TRANSFER_LIB || this.applyType === APPLY_TYPE.SPECIAL_DELIVERY
    ) {
      data.show = true
      data.message = '请务必抄送本订单OM，PM'
    } else if (this.applyType === APPLY_TYPE.LOGISTICSCOST) {
      data.show = true
      data.message = '请务必抄送本订单OM'
    }
    return data
  }

  ngOnInit(): void {
    const getUserList = (keyword: string) => {
      if (!keyword) {
        this.isSearchLoading = false;
        return []
      }
      return this.http.get(`${this.fetchUserUrl}`, {
        params: { email: keyword }
      })
        .pipe(map((res: any) => res.data as User[]))
        .pipe(
          map((users) => users.map((user) => ({ ...user, displayName: `${user.name}(${user.email})` })))
        );
    }

    const optionList$: Observable<User[]> = this.searchChange$
      .asObservable()
      .pipe(debounceTime(500))
      .pipe(switchMap(getUserList));
    optionList$.subscribe(data => {
      this.userList = data;
      this.isSearchLoading = false;
    });
  }

  onSearchUser(keyword: string) {
    this.isSearchLoading = true
    this.searchChange$.next(keyword)
  }
}
