import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-funnel-info',
  templateUrl: './funnel-info.component.html',
  styleUrls: ['./funnel-info.component.scss']
})
export class FunnelInfoComponent implements OnInit {

  @Input()
  funnelId: string;

  @Input()
  funnel: any[] = [];

  @Input()
  isActive: boolean = true;


  firstFunnel: any = {};
  
  isMultiFunnel: boolean = false;
  
  constructor() {
    }

  ngOnInit() {
    // this.funnel = [];
    console.log('funnel info component, funnels => ', this.funnel);
    this.isMultiFunnel = false;
    this.firstFunnel = {};

    this.isMultiFunnel = this.funnel.length > 1;
    this.firstFunnel = this.funnel[0] || {};
  }


}
