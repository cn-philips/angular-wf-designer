import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my',
  templateUrl: './my.component.html',
  styleUrls: ['./my.component.scss']
})
export class MyComponent implements OnInit {

  isPending:boolean = true;
  pendingTaskCount: number = 0;

  constructor() {
  }

  ngOnInit() {
  }

  changeMytaskTab(event) {
    if (event.activeId === 'pending-tab') {
      this.isPending=false;
      return;
    }
    if (event.nextId === 'pending-tab') {
      this.isPending = true;;
      return;
    }
  }

  onPendingTaskEvent (event) {
    this.pendingTaskCount = event || 0;
  }

}
