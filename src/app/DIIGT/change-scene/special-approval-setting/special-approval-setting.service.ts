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
  minWarrantyMonths?: number;
  minWarrantyMonthsComparator?: string;
  maxWarrantyMonths?: number;
  maxWarrantyMonthsComparator?: string;
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

  approveProcNodesMap: { [key: string]: [] } = {}

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

  async getApproveProcNodeList(procId) {
    if (this.approveProcNodesMap[procId]) {
      return this.approveProcNodesMap[procId]
    }
    const uri = `/act/specialapprove/process/${procId}/preview`
    const res = await this.http.post(uri).toPromise();
    const data = formatResponse(res)
    this.approveProcNodesMap[procId] = data
    return data
  }

  // 添加业务流程
  async addBusinessProc(proc) {
    const uri = `/act/specialapprove/condition`
    const res = await this.http.post(uri, proc).toPromise();
    return formatResponse(res)
  }

  // 更新业务流程
  async updateBusinessProc(proc) {
    const uri = `/act/specialapprove/condition`
    const res = await this.http.put(uri, proc).toPromise();
    return formatResponse(res)
  }

  // 删除业务流程
  async deleteBusinessProc(procId) {
    const uri = `/act/specialapprove/condition/${procId}`
    const res = await this.http.delete(uri).toPromise();
    return formatResponse(res)
  }

  // 禁用业务流程
  async disableBusinessProc(procId) {
    const uri = `/act/specialapprove/condition/${procId}/disable`
    const res = await this.http.post(uri).toPromise();
    return formatResponse(res)
  }

  // 启用业务流程
  async enableBusinessProc(procId) {
    const uri = `/act/specialapprove/condition/${procId}/enable`
    const res = await this.http.post(uri).toPromise();
    return formatResponse(res)
  }
}