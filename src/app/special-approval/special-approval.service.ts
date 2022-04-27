import { Injectable } from '@angular/core';
import { HttpService } from '../services/http.service'
import { Subject } from 'rxjs'

function getLoginUserCode1() {
  return localStorage.getItem('ng_philips_code1')
}

const statusMap = {
  START: '待审批',
  APPROVED: '已完成',
  REJECTED: '已退回',
  WITHDRAW: '已撤回',
  CANCELLED: '已取消',
}

const applyTypeMap = {
  production: '特批开始生产',
  delivery: '特批发货',
  warranty: '延长保修',
  installcost: '额外安装费用及其他',
}

function formatResponse(res) {
  if ('0000' === res['code']) {
    return res.data
  } else {
    throw new Error(res.msg) 
  }
}

interface User {
  name: string;
  email: string;
}

let omUsers: User[] = []

@Injectable({
  providedIn: 'root'
})
export class SpecialApprovalService {
  private spTaskCount = new Subject<number>();
  private spDraftCount = new Subject<number>();
  spTaskCountChange$ = this.spTaskCount.asObservable()
  spDraftCountChange$ = this.spDraftCount.asObservable()

  constructor(private http: HttpService) {}

  changeSpTaskCount(taskCount) {
    this.spTaskCount.next(taskCount)
  }

  changeSpDraftCount(draftCount) {
    this.spDraftCount.next(draftCount)
  }

  // 获取用户可以使用的申请模板
  async getTemplateList() {
    const uri = '/act/specialapprove/condition/template';
    const res = await this.http.post(uri).toPromise();
    return formatResponse(res)
  }

  // 我的申请列表
  async getRequestList(params) {
    const uri = '/act/specialapprove/apply';
    const res = await this.http.get(uri, {
      params: {
        ...params,
        applicant: getLoginUserCode1(),
        processStatusNotIn: 'DRAFT',
        orderByClause: 'createTime desc',
      }
    }).toPromise();
    return formatResponse(res)
  }
 
  // 我的申请-统计
  async getRequestCount() {
    const uri = '/act/specialapprove/apply/statusCount';
    const res = await this.http.get(uri, {
      params: { applicant: getLoginUserCode1() }
    }).toPromise();
    return formatResponse(res)
  }

  // 获取我的草稿列表
  async getDraftList(params) {
    const uri = '/act/specialapprove/apply';
    const res = await this.http.get(uri, {
      params: {
        ...params,
        applicant: getLoginUserCode1(),
        processStatus: 'DRAFT',
        orderByClause: 'createTime desc',
      }
    }).toPromise();
    const data = formatResponse(res)
    this.changeSpDraftCount(data.total)
    return data
  }

  // 获取我的待办列表
  async getWaitingApproveList(params) {
    const uri = '/act/specialapprove/process/instance/task/todo';
    const res = await this.http.get(uri, {
      params: {
        ...params,
        owner: getLoginUserCode1(),
        orderByClause: 'createTime desc',
      },
    }).toPromise();
    const data = formatResponse(res)
    this.changeSpTaskCount(data.total)
    return data
  }

  // 获取我的已办列表
  async getApprovedList(params) {
    const uri = '/act/specialapprove/process/instance/task/approved';
    const res = await this.http.get(uri, {
      params: {
        ...params,
        approveUser: getLoginUserCode1(),
        orderByClause: 'createTime desc',
      },
    }).toPromise();
    return formatResponse(res)
  }

  // 获取我可查看列表
  async getViewList(params) {
    const uri = '/act/specialapprove/apply/viewable';
    const res = await this.http.get(uri, {
      params: {
        ...params,
        orderByClause: 'createTime desc',
      }
    }).toPromise();
    return formatResponse(res)
  }

  // 上传文件
  uploadFile(data) {
    const uri = '/act/system/upload';
    return this.http.posts(uri, data);
  }

  // 提交申请
  async submitRequest(data) {
    const uri = `/act/specialapprove/apply/submit`
    const res = await this.http.post(uri, data).toPromise();
    return formatResponse(res)
  }

  // 保存草稿
  async saveRequest(data) {
    const uri = `/act/specialapprove/apply`
    const res = await this.http.post(uri, data).toPromise();
    return formatResponse(res)
  }

  // 获取审批统计数据
  async getApproveCount() {
    const uri = `/act/specialapprove/process/instance/task/statusCount`
    const res = await this.http.post(uri, { approveUser: getLoginUserCode1() }).toPromise();
    return formatResponse(res)
  }
  
  // 获取申请详情
  async getRequestDetail(requestId) {
    const uri = `/act/specialapprove/apply/${requestId}`
    const res = await this.http.get(uri).toPromise();
    return formatResponse(res)
  }

  // 取消申请, 已拒绝, 已撤回 -> 已关闭
  async cancelRequest(requestId) {
    const uri = `/act/specialapprove/apply/${requestId}/cancel`
    const res = await this.http.post(uri).toPromise();
    return formatResponse(res)
  }

  // 审批
  async approveRequest(data) {
    const uri = `/act/specialapprove/apply/approve`
    const res = await this.http.post(uri, data).toPromise();
    return formatResponse(res)
  }

  // 撤回申请
  async withdrawRequest(requestId) {
    const uri = `/act/specialapprove/apply/${requestId}/withdraw`
    const res = await this.http.post(uri).toPromise();
    return formatResponse(res)
  }

  // 删除申请, 只适用于草稿状态的申请
  async deleteRequest(requestId) {
    const uri = `/act/specialapprove/apply/${requestId}`
    const res = await this.http.delete(uri).toPromise();
    return formatResponse(res)
  }

  async getOMUsers() {
    if (omUsers.length > 0) {
      return omUsers
    }
    const uri = `/act/role/getUsersByRole?role=OM`
    const res = await this.http.get(uri).toPromise();
    const data = formatResponse(res)
    omUsers = data
    return data
  }

  async getReferenceList(params) {
    const uri = `/act/specialapprove/oit/oitInformation`
    const res = await this.http.post(uri, {
      ...params,
      createUser: getLoginUserCode1()
    }).toPromise();
    return formatResponse(res)
  }

  formatRequestStatus(processStatus, nodeAction, status) {
    if (status == 0) { return '已取消' }
    if (nodeAction === 'feedback' && processStatus === 'START') { return '待反馈' }
    return statusMap[processStatus]
  }

  formatApplyType(type) {
    return applyTypeMap[type]
  }
}