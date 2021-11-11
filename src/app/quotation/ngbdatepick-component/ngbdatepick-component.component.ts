import { Component, OnInit } from '@angular/core';
import {FieldType} from '@ngx-formly/core';

@Component({
  selector: 'ngbdatepick-component',
  templateUrl: './ngbdatepick-component.component.html',
  styleUrls: ['./ngbdatepick-component.component.scss']
})
export class NgbdatepickComponentComponent extends FieldType implements OnInit {

  myLabel: string;
  constructor() {
    super();
    
  }

  ngOnInit() {
    console.log('datepicker init', this.formControl);
    console.log('datepicker init', this.field);

    this.myLabel = this.field.templateOptions.label;
  }

}
