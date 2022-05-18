import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'special-approval-debook-info',
  templateUrl: './de-book.component.html',
  styleUrls: ['./de-book.component.scss']
})
export class DeBookComponent implements OnInit {


  @Input() editable = true
  @Input() applyType: string

  constructor() { }

  ngOnInit() {
  }

}
