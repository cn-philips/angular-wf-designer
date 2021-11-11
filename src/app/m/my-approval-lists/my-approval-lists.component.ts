import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {HttpService} from '../../services';
import { ToastService } from 'ng-zorro-antd-mobile';
@Component({
  selector: 'app-my-approval-lists',
  templateUrl: './my-approval-lists.component.html',
  styleUrls: ['./my-approval-lists.component.scss']
})
export class MyApprovalListsComponent implements OnInit {

  pendingApprovalCount: number = 0;
  parentUrl="/m";
  constructor(private router: Router, private http: HttpService, private _toast: ToastService) { }

  ngOnInit() {
    this.updatePendingApprovalCount();
  }

  jumpToUrl(url) {
    this.router.navigateByUrl(url);
  }

  updatePendingApprovalCount() {
    this.http.get('/act/getUserInfo').subscribe(res => {
      if('0000'=== res.code) {
        const owner = res.data['code'];
        let param = {
          owner : owner,
          pageNumber: 0,
          pageSize: 1,
          states: 'unfinished'
        };

        localStorage.setItem('ng_philips_code1',owner);

        this.http.post('/act/task/listAllProcessInstance', param).subscribe(res => {
          if('0000' === res.code) {
            this.pendingApprovalCount = res.data['total'] || 0;
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
