import {Injectable} from '@angular/core';
import {HttpService} from './http.service';
import {HttpClient, HttpRequest, HttpResponse, HttpEventType } from '@angular/common/http';
import {environment} from '../../environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import ttJson from '../../assets/json/quotation-tips.json';

// @Injectable()
@Injectable({
  providedIn: 'root'
})
export class TooltipService {
  base_href = environment.base_href;
  progress: number = 0;
  progressSubject = new Subject();
  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  // ngUnsubscribe: Subject<void> = new Subject<void>();

  private tooltipJson: any = ttJson;


  constructor(private http: HttpService, private httpClient: HttpClient) {
  }

  getTooltipJson(key?: string) {
    if(key) {
      return this.tooltipJson[key] ? this.tooltipJson[key] : '';
    } else {
      return this.tooltipJson || {};
    }
  }


}
