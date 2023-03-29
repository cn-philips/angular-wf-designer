import { Component, OnInit,Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'option-table',
  templateUrl: './option-table.component.html',
  styleUrls: ['./option-table.component.scss']
})
export class OptionTableComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  @Input() optionInfo;
  @Input() orderBaseinfo;
  get orderBaseinfoData()
  {
    return this.orderBaseinfo as FormGroup
  }
  clearDeviceName(data)
  {
    data.medicalDeviceName=""
  }
  clearProductModelName(data)
  {
    data.productModel="";
  }
}
