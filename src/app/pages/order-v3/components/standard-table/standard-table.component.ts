import { Component,OnInit,Input} from '@angular/core';

@Component({
  selector: 'standards-table',
  templateUrl: './standard-table.component.html',
  styleUrls: ['./standard-table.component.scss']
})
export class StandardTableComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  @Input() productInfo
}
