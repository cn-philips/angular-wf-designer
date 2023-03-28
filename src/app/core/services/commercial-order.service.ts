import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommercialOrderService {
  isOrderTypeCompleted: boolean = false;
  isOrderTypeCompletedChange: Subject<boolean> = new Subject<boolean>();

  orderType: string;
  orderTypeChange: Subject<string> = new Subject<string>();

  specialOrderData: string;
  specialOrderDataChange: Subject<string> = new Subject<string>();

  constructor() {
    this.isOrderTypeCompletedChange.subscribe((value) => {
      this.isOrderTypeCompleted = value;
    });

    this.specialOrderDataChange.subscribe((value) => {
      this.specialOrderData = value;
    });

    this.orderTypeChange.subscribe((value) => {
      this.orderType = value;
    });
  }

  changeIsOrderTypeCompleted(flag: boolean) {
    this.isOrderTypeCompletedChange.next(flag);
  }

  changeOrderType(flag: string) {
    this.orderTypeChange.next(flag);
  }

  changeSpecialOrderData(draftData: string) {
    this.specialOrderDataChange.next(draftData);
  }
}
