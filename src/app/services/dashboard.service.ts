import { Injectable } from '@angular/core'
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpService) { }

  getOitSummary(params = {}) {
    const url = `/act/report/orderpreparation/completed`
    return this.http.post(url, params)
  }

  getOitRealTime(params = {}) {
    const url = `/act/report/orderpreparation/count`
    return this.http.post(url, params)
  }

  exportLeadTime(params = {}) {
    const url = `/act/report/orderpreparation/leadtime/export`
    return this.http.postDownload(url, params)
  }
  getTeamList() {
    const url = `/act/preparation/team`
    return this.http.get(url)
  }

  getBMCList() {
    const url = `/act/preparation/bmc`
    return this.http.get(url)
  }
}