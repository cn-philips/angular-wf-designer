import { Injectable } from '@angular/core';

import { HttpService } from '../../../services/http.service'
import { BusinessProc, ApproveProc } from './special-approval-setting.d'

function formatResponse(res) {
  if ('0000' === res['code']) {
    return res.data
  } else {
    throw new Error(res.msg) 
  }
}

@Injectable({
  providedIn: 'root'
})
export class SpecialApprovalSettingService {
  allBusinessProList: BusinessProc[] = []
  allApproveProList: ApproveProc[] = []

  allSystemRoleList: string[] = []

  approveProcNodesMap: { [key: string]: [] } = {}

  constructor(private http: HttpService) {}

  // 获取业务流程列表
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

  // 获取审批流程列表
  async getAllApproveProcList(renew = false) {
    if (renew || this.allBusinessProList.length === 0) {
      const uri = `/act/specialapprove/process?pageSize=999&orderByClause=code asc`
      const res = await this.http.get(uri).toPromise();
      const data = formatResponse(res).rows
      this.allApproveProList = data
      return data
    } else {
      return this.allApproveProList
    }
  }

  // 获取审批流程节点列表
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

  // 添加审批流程
  async addApproveProc(proc: ApproveProc) {
    const uri = `/act/specialapprove/process`
    const res = await this.http.post(uri, proc).toPromise();
    return formatResponse(res)
  }

  // 修改审批流程
  async updateApproveProc(proc: ApproveProc) {
    const uri = `/act/specialapprove/process`
    const res = await this.http.put(uri, proc).toPromise();
    return formatResponse(res)
  }

  // 获取审批流程详情
  async getApproveProcDetail(procId) {
    const uri = `/act/specialapprove/process/${procId}`
    const res = await this.http.get(uri).toPromise();
    return formatResponse(res)
  }

  // 启用审批流程
  async enableApproveProc(procId) {
    const uri = `/act/specialapprove/process/${procId}/enable`
    const res = await this.http.post(uri).toPromise();
    return formatResponse(res)
  }

  // 禁用审批流程
  async disableApproveProc(procId) {
    const uri = `/act/specialapprove/process/${procId}/disable`
    const res = await this.http.post(uri).toPromise();
    return formatResponse(res)
  }

  // 删除审批流程
  async deleteApproveProc(procId) {
    const uri = `/act/specialapprove/process/${procId}`
    const res = await this.http.delete(uri).toPromise();
    return formatResponse(res)
  }

  // 克隆审批流程
  async cloneApproveProc(procId) {
    const uri = `/act/specialapprove/process/${procId}/copy`
    const res = await this.http.post(uri).toPromise();
    return formatResponse(res)
  }

  // 获取所有系统角色
  async getAllSystemRoleList() {
    if (this.allSystemRoleList.length > 0) {
      return this.allSystemRoleList
    }
    const uri = `/act/role/getRole`
    const res = await this.http.post(uri, {
      pageNo: 1,
      pageSize: 999
    }).toPromise()
    const data = formatResponse(res)
    return data.rows
  }
}