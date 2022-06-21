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

  // rdd  机器互换 转库 debook coo-us/cc last by lc 未加
  ngOnInit() {
  }

  public isNotNull() {
    return this.cosMainId && this.cosMainId !== '' && this.orderTypes && this.orderTypes !== '' && this.label && this.label !== '';
  }

  // 跳转
  public async gotoLink() {
    if (this.orderTypes && this.orderTypes !== '' && this.orderTypes.toUpperCase() === 'OIT') {
      // 跳转到合同概要表
      // window.open(location.origin + environment.base_href + '/#/' + 'inconmodif?id=' + codeString(this.cosMainId) + '&flag=1', null, 'noreferrer');
      window.open(location.origin + environment.base_href + '/#/' + 'completeOit?id=' + codeString(this.cosMainId) + '&flag=1' + '&status=OITEND', null, 'noreferrer');
    } else if (this.orderTypes && this.orderTypes !== '') {
      // 跳转到prebook链接
      window.open(location.origin + environment.base_href + '/#/' + 'prebookso?id=' + codeString(this.cosMainId) + '&flag=1&status=prebook_end', null, 'noreferrer');
    }
  }

}
