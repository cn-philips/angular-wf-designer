import { Component, Input, OnInit } from '@angular/core';
import { NgxDatatableService } from '@core/services';
@Component({
  selector: 'app-bid-index',
  templateUrl: './bid-index.component.html',
  styleUrls: ['./bid-index.component.scss']
})
export class BidIndexComponent implements OnInit {

  @Input() infor: any;

  constructor(private ngxDatatableService: NgxDatatableService) { }
  ngOnChanges() {
    console.log(this.infor)
    this.infor = Object.assign({}, this.infor);
  }
  ngOnInit() {
    this.infor = Object.assign({}, this.infor);
  }
  getCellClass = this.ngxDatatableService.getCellClass;
  getHeaderClass = this.ngxDatatableService.getHeaderClass;



  loadingIndicator = false;
  selected = [];


  /*展开*/
  openchen(e, index, cd) {
    const dom = e.target;
    //table-ch-add
    const chen = cd;
    if (dom.getAttribute('data-i') == '0') {
      dom.setAttribute('data-i', '1');
      dom.innerText = '隐藏子产品';
      chen.classList.add('table-ch-add');
    } else {
      dom.setAttribute('data-i', '0');
      dom.innerText = '显示子产品';
      chen.classList.remove('table-ch-add');
    }
  }

}
