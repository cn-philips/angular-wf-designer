import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-IGTMyTask',
  templateUrl: './MyTask.component.html',
  styleUrls: ['./MyTask.component.scss']
})
export class IGTMyTaskComponent implements OnInit {
  tabIndex = 0;
  constructor() {
  }

  ngOnInit() {
    this.myskip();
    console.log('ngOnInit' + this.tabIndex);
  }

  public myskip(): void { //外部触发tab选项卡的事件
    if (JSON.parse(localStorage.getItem('currentTab')) === 'myToDoTask') {
      this.tabIndex = 0;
    } else if (JSON.parse(localStorage.getItem('currentTab')) === 'myDoneTask') {
      this.tabIndex = 1;
    } else {
      this.tabIndex = 0;
    }
    console.log('myskip' + this.tabIndex);
  }

  chooseTab(value) {
    console.log('chooseTab' + this.tabIndex);
    if (value.index === 0) {
      this.tabIndex = value.index;
      window.localStorage.setItem('currentTab', JSON.stringify('myToDoTask'));
    } else if (value.index === 1) {
      this.tabIndex = value.index;
      window.localStorage.setItem('currentTab', JSON.stringify('myDoneTask'));
    }
  }
}
