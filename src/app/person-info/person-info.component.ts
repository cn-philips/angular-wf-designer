import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services';
import { User } from '../domian/user';

@Component({
  selector: 'person-info',
  templateUrl: './person-info.component.html',
  styleUrls: ['./person-info.component.scss']
})
export class PersonInfoComponent implements OnInit {

  user: User;

  constructor(private http: HttpService) {
    const code1 = localStorage.getItem('ng_philips_code1');
    this.http.get('/act/queryUser?code1='+code1).subscribe(res =>{
      if('0000' == res.code) {
        this.user = res.data;
        console.log(this.user)
      }
    });
  }

  ngOnInit() {
  }

}
