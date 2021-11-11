import { Component, OnInit } from '@angular/core';
import {HttpService} from '../services';

@Component({
  selector: 'app-roles-group',
  templateUrl: './roles-group.component.html',
  styleUrls: ['./roles-group.component.scss']
})
export class RolesGroupComponent implements OnInit {

  roleOfData: any[] = [];
  roleList: any[] = [];
  refRoleListItem: any[] = [];

  constructor(private http: HttpService,) { }

  ngOnInit() {
    this.http.get(`/act/group/list`).subscribe(res => {
      if (res.code == '0000') {
       this.roleOfData = res.data;
       for (let i = 0; i < this.roleOfData.length; i++) {
         this.refRoleListItem = this.roleOfData[i].roleList.map(item => {
           return item.name;
         });
         this.roleList.push(this.refRoleListItem);
       }
       console.log(this.roleList);
      } 
    });
  }



}
