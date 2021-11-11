import { Component, OnInit, EventEmitter, OnDestroy } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators/takeUntil';
import { startWith } from 'rxjs/operators/startWith';
import { debounceTime, distinctUntilChanged, map, switchMap, tap, filter } from 'rxjs/operators';
import { Observable, of, concat } from 'rxjs';
import { HttpService } from '../../services';
import 'url-search-params-polyfill';

@Component({
  selector: 'app-dmsngselect',
  templateUrl: './dmsngselect.component.html',
  styleUrls: ['./dmsngselect.component.scss']
})
export class DmsngselectComponent extends FieldType implements OnDestroy {

  myLabel: string;
  onDestroy$ = new Subject<void>();
  // search$ = new EventEmitter();
  search$ = new Subject<string>();
  options$;
  optionsLoading = false;
  imeFlag: boolean = true;


  constructor(private http: HttpService) {
    super();
  }

  ngOnInit() {
    this.myLabel = this.field.templateOptions.label;

    this.loadOptions();
  }

  ngOnDestroy() {
    this.onDestroy$.complete();
  }

  private loadOptions() {
    this.options$ = concat(
      of([]), // default items, empty
      this.search$.pipe(
        debounceTime(500),
        filter(term => this.imeFlag && term && term.length > 1),
        distinctUntilChanged(),
        tap(() => this.optionsLoading = true),
        switchMap(term => this.getDmsCompanyFromApi(term).pipe(
          tap(() => this.optionsLoading = false)
        ))
      )
    );
  }

  private getDmsCompanyFromApi(term: string = null): Observable<any[]> {
    let subj = new Subject<any[]>();
    if (term && '' != term) {
      let params: URLSearchParams = new URLSearchParams();
      params.set('Province', '');
      params.set('City', '');
      params.set('Country', '');
      params.set('ProType', '');
      params.set('ReturnCount', '15');
      params.set('CustomerName', term);

      let uri = '/act/dms/api/QueryCustomer?' + params.toString();
      this.http.get(uri).subscribe(res => {
        console.log('getDmsCompanyFromApi-res', res);
        subj.next(res['Object']);
      });
      return subj.asObservable();
    }
    return of([]);
  }

  changeImeFlag(event) {
    this.imeFlag = event == '0' ? false : true;
  }

}
