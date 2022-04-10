import {Component, Input, OnInit} from '@angular/core';
import { TooltipService } from '../../services';

@Component({
  selector: 'custom-tooltip',
  template: `
    <span style="color: inherit; vertical-align: text-bottom;" [hidden]="hiddenFlag">
      <i nz-icon nz-tooltip nzNoAnimation [nzTitle]="title" [nzMouseEnterDelay]="0.8"
        nzPlacement="right" nzType="question-circle" nzTheme="outline"></i>
    </span>
  `,
})
export class CustomTooltipComponent implements OnInit {


  @Input()
  dynamic: boolean = false;

  @Input()
  tipKey: string;

  @Input()
  info: string;

  hiddenFlag: boolean = true;
  title: string = '';


  constructor(private tooltipService: TooltipService) {
  }

  ngOnInit() {
    console.log('info ', this.info);
    
    if (this.dynamic && this.info) {
      this.title = this.tooltipService.getTooltipJson(this.info);
      if('' != this.title) {
        this.hiddenFlag = false;
      }
    } else {
      if(this.info && '' != this.info) {
        this.hiddenFlag = false;
        this.title = this.info;
      }
    }

  }

}
