import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-preOrderSofonTransfer',
  templateUrl: './sofonTransfer.component.html',
  styleUrls: ['./sofonTransfer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PreOrderSofonTransferComponent implements OnInit {
  list: Array<{ key: string; title: string; description: string; direction: string; icon: string }> = [];
  selectedValue = null;

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    const ret: Array<{ key: string; title: string; description: string; direction: string; icon: string }> = [];
    for (let i = 0; i < 20; i++) {
      ret.push({
        key: i.toString(),
        title: `content${i + 1}`,
        description: `description of content${i + 1}`,
        direction: Math.random() * 2 > 1 ? 'right' : '',
        icon: `frown-o`
      });
    }
    this.list = ret;
  }

  select(ret: {}): void {
    console.log('nzSelectChange', ret);
  }

  change(ret: {}): void {
    console.log('nzChange', ret);
  }

  constructor(public msg: NzMessageService) {}
}
