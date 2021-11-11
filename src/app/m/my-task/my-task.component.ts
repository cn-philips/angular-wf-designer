import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../services';
import { ToastService } from 'ng-zorro-antd-mobile';

@Component({
  selector: 'app-my-task',
  templateUrl: './my-task.component.html',
  styleUrls: ['./my-task.component.scss']
})
export class MyTaskComponent implements OnInit {

  pendingTaskCount: number = 0;
  parentUrl="/m"
  constructor(private router: Router, private http: HttpService, private _toast: ToastService) { }

  ngOnInit() {
    this.updatePendingTaskCount()
  }

  jumpToUrl(url) {
    this.router.navigateByUrl(url);
  }

  updatePendingTaskCount() {
    this.http.get('/act/getUserInfo').subscribe(res => {
      if ('0000' === res.code) {
        const owner = res.data['code'];
        const uri = '/act/task/taskList/' + owner;
        let param = {
          "pageNumber": 0,
          "pageSize": 1
        };

        this.http.post(uri, param).subscribe(res => {
          if ('0000' === res.code) {
            this.pendingTaskCount = res.data['total'] || 0;
          } else {
            const toast = ToastService.fail(res['msg'], 3000);
          }
        });
      } else {
        const toast = ToastService.fail(res['msg'], 3000);
      }
    });

  }

}
