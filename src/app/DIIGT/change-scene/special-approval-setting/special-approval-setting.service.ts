import { Injectable } from '@angular/core';

import { HttpService } from '../../../services/http.service'

function formatResponse(res) {
  if ('0000' === res['code']) {
    return res.data
  } else {
    throw new Error(res.msg) 
  }
}

export interface BusinessProc {
  id: string;
  bg: string;
  applyType: string;
  applyItem: string;
  status: string;
  processId: string;
}

export interface ApproveProc {
  id: string;
  code: string;
  name: string;
  remark: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class SpecialApprovalSettingService {
  allBusinessProList: BusinessProc[] = []
  allApproveProList: ApproveProc[] = []

  constructor(private http: HttpService) {}

  async getAllBusinessProcList(renew = false) {
    if (renew || this.allBusinessProList.length === 0) {
      const uri = `/act/specialapprove/condition?pageSize=999`
      const res = await this.http.get(uri).toPromise();
      const data = formatResponse(res).rows
      this.allBusinessProList = data
      return data
    } else {
      return this.allBusinessProList
    }
  }

  async getAllApproveProcList(renew = false) {
    if (renew || this.allBusinessProList.length === 0) {
      const uri = `/act/specialapprove/process?pageSize=999`
      const res = await this.http.get(uri).toPromise();
      const data = formatResponse(res).rows
      this.allApproveProList = data
      return data
    } else {
      return this.allApproveProList
    }
  }
}