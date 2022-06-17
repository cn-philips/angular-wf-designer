import {Component, Input, OnInit} from '@angular/core';
import {environment} from '../../../../../environments/environment';
import {codeString} from '../../../../../assets/js/tools';

@Component({
  selector: 'app-reference-link',
  templateUrl: './reference-link.component.html',
  styleUrls: ['./reference-link.component.scss']
})
export class ReferenceLinkComponent implements OnInit {

  @Input() public cosMainId: any = null; // 跳转mainId
  @Input() public orderTypes: any = null; // 订单类型
  @Input() public label: any = null; // 展示参数

  constructor() { }

  ngOnInit() {
  }

  public isNotNull() {
    return this.cosMainId && this.cosMainId !== '' && this.orderTypes && this.orderTypes !== '' && this.label && this.label !== '';
  }

  // 跳转
  public gotoLink() {
    if (this.orderTypes && this.orderTypes !== '' && this.orderTypes.toUpperCase() === 'OIT') {
      // 跳转到合同概要表
      window.open(location.origin + environment.base_href + '/#/' + 'inconmodif?id=' + codeString(this.cosMainId) + '&flag=1');
    } else if (this.orderTypes && this.orderTypes !== '') {
      // 跳转到prebook链接
      window.open(location.origin + environment.base_href + '/#/' + 'prebookso?id=' + codeString(this.cosMainId) + '&flag=1&status=prebook_end');
    }
  }

}
