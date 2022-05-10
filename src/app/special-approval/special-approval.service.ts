import { Injectable } from '@angular/core';
import { HttpService } from '../services/http.service'
import { Subject } from 'rxjs'
import { APPLY_TYPE_MAP, PROCESS_STATUS, NODE_ACTION, PROCESS_STATUS_MAP, STAND_WARRANTY_MONTH } from './special-approval.constants'
import { DictService } from '../services/dict.service';

function getLoginUserCode1() {
  return localStorage.getItem("ng_philips_code1");
}

function formatResponse(res) {
  if ("0000" === res["code"]) {
    return res.data;
  } else {
    throw new Error(res.msg);
  }
}

interface User {
  name: string;
  email: string;
}

let omUsers: User[] = [];

@Injectable({
  providedIn: "root",
})
export class SpecialApprovalService {
  private spTaskCount = new Subject<number>();
  private spDraftCount = new Subject<number>();
  spTaskCountChange$ = this.spTaskCount.asObservable();
  spDraftCountChange$ = this.spDraftCount.asObservable();

  bmcClusterBgs = [];

  cycleGroupBigAreaMap = {};

  constructor(private http: HttpService, private dictService: DictService) {
    this.initCycleGroupBigArea();
    this.initBmcClusterBg();
  }

  initCycleGroupBigArea() {
    const uri = `/act/specialapprove/salesregion`;
    this.http
      .get(uri, {
        params: {
          pageNo: 1,
          pageSize: 999,
        },
      })
      .subscribe((res) => {
        if ("0000" == res.code) {
          const cycleGroupBigAreas = res.data.rows;
          this.cycleGroupBigAreaMap = cycleGroupBigAreas.reduce(
            (calc, { team, region }) => {
              const bigAreas = calc[team] || [];
              calc[team] = [...bigAreas, { label: region, value: region }];
              return calc;
            },
            {}
          );
        }
      });
  }

  get cycleGroups() {
    return Object.keys(this.cycleGroupBigAreaMap).map((cycleGroup) => ({
      label: cycleGroup,
      value: cycleGroup,
    }));
  }

  get bmcList() {
    return this.bmcClusterBgs.map(({ bmc, cluster, bg }) => ({
      label: bmc,
      value: bmc,
      cluster,
      bg,
    }));
  }

  initBmcClusterBg() {
    const uri = `/act/specialapprove/bmcclusterbg?pageSize=999`;
    this.http.get(uri).subscribe((res) => {
      if ("0000" == res.code) {
        this.bmcClusterBgs = res.data.rows;
      }
    });
  }

  changeSpTaskCount(taskCount) {
    this.spTaskCount.next(taskCount);
  }

  changeSpDraftCount(draftCount) {
    this.spDraftCount.next(draftCount);
  }

  getApplyItems(applyType) {
    if (!APPLY_TYPE_MAP[applyType]) {
      return [];
    }
    const { dictGroup } = APPLY_TYPE_MAP[applyType];
    const applyItems = this.dictService
      .getDictListByGroupName(dictGroup)
      .map(({ code, label }) => ({ label, value: code }));
    return applyItems;
  }

  get usProductList() {
    return this.dictService
      .getDictListByGroupName("us_product_list")
      .map(({ tag, label }) => ({ label: tag, value: label }));
  }

  get standWarrantyMonth() {
    const warrantyMonth: { [key: string]: number } = {}
    const warrantyMonths = this.dictService.getDictListByGroupName('default_warranty_month')
    warrantyMonths.forEach(({ code, label }) => {
      if (STAND_WARRANTY_MONTH[code]) {
        warrantyMonth[STAND_WARRANTY_MONTH[code]] = Number(label)
      }
    })
    return warrantyMonth
  }

  // 获取用户可以使用的申请模板
  async getTemplateList() {
    const uri = "/act/specialapprove/condition/template";
    const res = await this.http.post(uri).toPromise();
    return formatResponse(res);
  }

  // 我的申请列表
  async getRequestList(params) {
    const uri = "/act/specialapprove/apply";
    const res = await this.http
      .get(uri, {
        params: {
          ...params,
          applicant: getLoginUserCode1(),
          processStatusNotIn: PROCESS_STATUS.DRAFT,
          orderByClause: "createTime desc",
        },
      })
      .toPromise();
    return formatResponse(res);
  }

  // 我的申请-统计
  async getRequestCount() {
    const uri = "/act/specialapprove/apply/statusCount";
    const res = await this.http
      .get(uri, {
        params: { applicant: getLoginUserCode1() },
      })
      .toPromise();
    return formatResponse(res);
  }

  // 获取我的草稿列表
  async getDraftList(params) {
    const uri = "/act/specialapprove/apply";
    const res = await this.http
      .get(uri, {
        params: {
          ...params,
          applicant: getLoginUserCode1(),
          processStatus: PROCESS_STATUS.DRAFT,
          orderByClause: "createTime desc",
        },
      })
      .toPromise();
    const data = formatResponse(res);
    this.changeSpDraftCount(data.total);
    return data;
  }

  // 获取我的待办列表
  async getWaitingApproveList(params) {
    const uri = "/act/specialapprove/process/instance/task/todo";
    const res = await this.http
      .get(uri, {
        params: {
          ...params,
          delegatedUser: getLoginUserCode1(),
          includeDelegated: 1,
          orderByClause: "createTime desc",
        },
      })
      .toPromise();
    const data = formatResponse(res);
    this.changeSpTaskCount(data.total);
    return data;
  }

  // 获取我的已办列表
  async getApprovedList(params) {
    const uri = "/act/specialapprove/process/instance/task/approved";
    const res = await this.http
      .get(uri, {
        params: {
          ...params,
          approveUser: getLoginUserCode1(),
          orderByClause: "createTime desc",
        },
      })
      .toPromise();
    return formatResponse(res);
  }

  // 获取我可查看列表
  async getViewList(params) {
    const uri = "/act/specialapprove/apply/viewable";
    const res = await this.http
      .get(uri, {
        params: {
          ...params,
          orderByClause: "createTime desc",
        },
      })
      .toPromise();
    return formatResponse(res);
  }

  // 上传文件
  uploadFile(data) {
    const uri = "/act/system/upload";
    return this.http.posts(uri, data);
  }

  // 提交之前的校验, 根据表单获取预设审批人列表
  async submitCheckRequest(data) {
    const uri = `/act/specialapprove/apply/submit/check`;
    const res = await this.http.post(uri, data).toPromise();
    return formatResponse(res);
  }

  // 提交申请
  async submitRequest(data) {
    const uri = `/act/specialapprove/apply/submit`;
    const res = await this.http.post(uri, data).toPromise();
    return formatResponse(res);
  }

  // 保存草稿
  async saveRequest(data) {
    const uri = `/act/specialapprove/apply`;
    const res = await this.http.post(uri, data).toPromise();
    return formatResponse(res);
  }

  // 获取审批统计数据
  async getApproveCount() {
    const uri = `/act/specialapprove/process/instance/task/statusCount`;
    const res = await this.http
      .post(uri, { approveUser: getLoginUserCode1() })
      .toPromise();
    return formatResponse(res);
  }

  // 获取申请详情
  async getRequestDetail(requestId) {
    const uri = `/act/specialapprove/apply/${requestId}`;
    const res = await this.http.get(uri).toPromise();
    return formatResponse(res);
  }

  // 取消申请, 已拒绝, 已撤回 -> 已关闭
  async cancelRequest(requestId) {
    const uri = `/act/specialapprove/apply/${requestId}/cancel`;
    const res = await this.http.post(uri).toPromise();
    return formatResponse(res);
  }

  // 审批
  async approveRequest(data) {
    const uri = `/act/specialapprove/apply/approve`;
    const res = await this.http.post(uri, data).toPromise();
    return formatResponse(res);
  }

  // 撤回申请
  async withdrawRequest(requestId) {
    const uri = `/act/specialapprove/apply/${requestId}/withdraw`;
    const res = await this.http.post(uri).toPromise();
    return formatResponse(res);
  }

  // 删除申请, 只适用于草稿状态的申请
  async deleteRequest(requestId) {
    const uri = `/act/specialapprove/apply/${requestId}`;
    const res = await this.http.delete(uri).toPromise();
    return formatResponse(res);
  }

  async getOMUsers() {
    const uri = `/act/role/getUsersByRole?role=OM`;
    const res = await this.http.get(uri).toPromise();
    const data = formatResponse(res);
    omUsers = data;
    return data;
  }

  async getReferenceList(params, needCreateUser = true) {
    console.log(needCreateUser);
    const uri = `/act/specialapprove/oit/oitInformation`;
    const res = await this.http
      .post(uri, {
        ...params,
        createUser: needCreateUser ? getLoginUserCode1() : undefined,
      })
      .toPromise();
    return formatResponse(res);
  }

  async getUserByRole(role) {
    const uri = `/act/role/getUsersByRole?role=` + role;
    const res = await this.http.get(uri).toPromise();
    return formatResponse(res);
  }
  /*
   * @description: 获取Product Sales Manager 邮箱
   * @params {String} initiatorEmail
   * @params {String} initiatorRole
   * @params {String} approverRole
   * @params {String} productBmc
   * */
  async getCustomizeEmail(params) {
    const uri = `/act/ecom/homepage/queryApprover`;
    const res = await this.http.post(uri, params).toPromise();
    return formatResponse(res);
  }

  formatRequestStatus(processStatus, nodeAction, status) {
    if (status == 0) {
      return "已取消";
    }
    if (
      nodeAction === NODE_ACTION.FEEDBACK &&
      processStatus === PROCESS_STATUS.START
    ) {
      return "待反馈";
    }
    return PROCESS_STATUS_MAP[processStatus];
  }

  formatApplyType(type) {
    return APPLY_TYPE_MAP[type] ? APPLY_TYPE_MAP[type].label : "";
  }

  //获取订单状态
  async getOrderStatusList() {
    const uri = `/act/ecom/dictData/queryDrop?dictGroup=sp_apply_lc_order_status`;
    const res = await this.http.get(uri).toPromise();
    const data = formatResponse(res);
    return data;
  }

  // 获取外贸公司
  async getIePoolList() {
    const uri = "/act/preparation/chooseIePool";
    const res = await this.http.get(uri).toPromise();
    const data = formatResponse(res);
    return data;
  }

  // 获取支付方式
  async getPaymentList() {
    const uri = "/act/ecom/dictData/queryDrop?dictGroup=sp_apply_lc_pay";
    const res = await this.http.get(uri).toPromise();
    const data = formatResponse(res);
    return data;
  }

  // 获取支修改条目原因列表
  async getModifyEntryList() {
    const uri = "/act/ecom/dictData/queryDrop?dictGroup=sp_apply_lc_modify";
    const res = await this.http.get(uri).toPromise();
    const data = formatResponse(res);
    return data;
  }

  //获取取消原因列表
  async getCancelReason() {
    const uri = "/act/ecom/dictData/queryDrop?dictGroup=sp_apply_lc_cancel";
    const res = await this.http.get(uri).toPromise();
    const data = formatResponse(res);
    return data;
  }

  //获取角色所属bg列表
  async getRoleBg() {
    const uri =
      "/act/role/getUsersByEmail?email=" + localStorage.ng_philips_code1;
    const res = await this.http.get(uri).toPromise();
    const data = formatResponse(res);
    return data;
  }

  //获取报表查看权限
  async getReportPermission(params) {
    const uri = "/act/specialapprove/report/applyTypes";
    const res = await this.http.post(uri, params).toPromise();
    const data = formatResponse(res);
    return data;
  }
}
