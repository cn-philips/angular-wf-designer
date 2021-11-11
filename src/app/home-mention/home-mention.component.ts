import { Component, OnInit } from '@angular/core';
import { HttpService} from '../services';
import {NzMessageService} from 'ng-zorro-antd';

@Component({
  selector: 'app-home-mention',
  templateUrl: './home-mention.component.html',
  styleUrls: ['./home-mention.component.scss']
})
export class HomeMentionComponent implements OnInit {

  constructor(private http: HttpService, private nzMessageService: NzMessageService) { }

  ngOnInit() {
  }

  inputValue: string;

  editHomeMention(){
   this.inputValue && this.http.post(`/act/home/updateNotes`,this.inputValue).subscribe(res => {
      console.log("res");
      if (res.code == '0000') {
        this.nzMessageService.success('修改成功！');
      } else {
        this.nzMessageService.error('修改失败！');
      }
    });
  }
}
