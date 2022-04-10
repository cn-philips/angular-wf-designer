import { Inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';   
import { Router } from '@angular/router';
import {
  HttpHeaders,
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SimpleAuthService {

  baseUrl: string; //基础接口url
  constructor(private http: HttpClient, private router: Router) {
  }


}
