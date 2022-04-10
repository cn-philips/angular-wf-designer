import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms'
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';

import { HttpService } from '../../../../services/http.service'

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

  fetchUserUrl = '/act/role/getUsersByEmail'
  searchChange$ = new BehaviorSubject('');
  isSearchLoading = false

  constructor(private http: HttpService) { }

  selectOptions = {
    ccTypes: [
      { label: '每个审批节点', value: 'all' },
      { label: '最终节点-通过及拒绝', value: 'lastnode' },
      { label: '最终节点通过', value: 'lastapproved' }
    ]
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
