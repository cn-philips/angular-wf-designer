import { Component, OnInit } from '@angular/core';
import {FieldType} from '@ngx-formly/core';

@Component({
  selector: 'app-quotation-hidden',
  templateUrl: './quotation-hidden.component.html',
  styleUrls: ['./quotation-hidden.component.scss']
})
export class QuotationHiddenComponent extends FieldType implements OnInit {

  constructor() {
    super();
  }

  ngOnInit() {
  }

}
