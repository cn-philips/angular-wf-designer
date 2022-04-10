import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bid-supp',
  templateUrl: './bid-supp.component.html',
  styleUrls: ['./bid-supp.component.scss']
})
export class BidSuppComponent implements OnInit {

  model = 0;

  // 是否投标授权
  isbid = '1';
  // 是否二级代理商
  isagen = '1';

  constructor() { }

  ngOnInit() {
  }

}
