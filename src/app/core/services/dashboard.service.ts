import { Injectable } from '@angular/core';
import { HttpService } from './http.service';


type Team = {
  modality: string;
  team: string;
}
@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http: HttpService) {
    this.getTeamList()
  }

  teamList: Team[] = []

  getOitSummary(params = {}) {
    const url = `/act/report/orderpreparation/completed`;
    return this.http.post(url, params);
  }

  getOitRealTime(params = {}) {
    const url = `/act/report/orderpreparation/count`;
    return this.http.post(url, params);
  }

  exportLeadTime(params = {}) {
    const url = `/act/report/orderpreparation/leadtime/export`;
    return this.http.postDownload(url, params);
  }
  getTeamList() {
    const url = `/act/preparation/modality/team`;
    this.http.get(url).subscribe(({ data }) => {
      this.teamList = data
    })
  }

  getBMCList() {
    const url = `/act/preparation/bmc`;
    return this.http.get(url);
  }
}
