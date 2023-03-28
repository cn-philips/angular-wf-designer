import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable({
  providedIn: 'root',
})
export class AcceptTermService {
  acceptTermChanged: Subject<any[]> = new Subject<any[]>();

  accpetTerms: Subject<any[]> = new Subject<any[]>();

  accpetTermsHidden: Subject<boolean> = new Subject<boolean>();

  constructor() {}

  emitAcceptTermChanged(data: any[]) {
    this.acceptTermChanged.next(data);
  }

  acceptTermsChange(data: any[]) {
    this.accpetTerms.next(data);
  }

  acceptTermsHiddenChange(data: boolean) {
    this.accpetTermsHidden.next(data);
  }
}
