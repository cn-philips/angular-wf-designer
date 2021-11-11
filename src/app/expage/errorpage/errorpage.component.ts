import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-errorpage',
  templateUrl: './errorpage.component.html',
  styleUrls: ['./errorpage.component.scss']
})

export class ErrorpageComponent implements OnInit {

  code:string = '404';
  msg: string = "Oops! We can't seem to find the page you are looking for.";
  constructor(private activatedRoute: ActivatedRoute, private router: Router) {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      this.code = queryParams['code'] || this.code;
      this.msg = queryParams['msg'] || this.msg;
    });
  }

  ngOnInit() {
  }

  backToHome() {
    this.router.navigate(['/'])
  }

}
