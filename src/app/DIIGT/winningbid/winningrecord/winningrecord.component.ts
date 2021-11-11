import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-winningrecord',
  templateUrl: './winningrecord.component.html',
  styleUrls: ['./winningrecord.component.scss']
})
export class WinningrecordComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  public checked:any=1;
  public selectedValue:any="";
}
