import { Injectable } from '@angular/core';
import { HttpService } from '@core/services';
import { Subject } from 'rxjs';

function formatResponse(res) {
  if ("0000" === res["code"]) {
    return res.data;
  } else {
    throw new Error(res.msg);
  }
}

@Injectable()
export class PrebookV3Service {
  pageLoading$ = new Subject<boolean>()
  iePoolList = []

  omList = []

  constructor(
    private http: HttpService
  ) {
    this.getIePoolList()
    this.getOMList()
  }

  async getDealerAgreementList(dealerCode) {
    const url = `/act/preparation/chooseDealer?dealerCode=${dealerCode}`
    const res = await this.http.get(url).toPromise();
    const data = formatResponse(res);
    return data;
  }

  getOMList() {
    return new Promise((resolve) => {
      if (this.omList.length > 0) {
        resolve(this.omList)
      } else {
        const url = `/act/role/getUsersByRoleAndModality?role=OM&modality=PD%26IGT`;
        this.http.get(url).subscribe(res => {
          this.omList = res.data
          resolve(res.data)
        })
      }
    })
  }

  getIePoolList() {
    //外贸公司接口
    const url = '/act/ecosiepool/findByPage';
    const param = {
      corporateName: null,
      pageNo: 1,
      pageSize:1000
    }
    this.http.post(url,param).subscribe(res => {
      this.iePoolList = formatResponse(res).rows;
    })
  }

  // 保存草稿
  save(data) {
    const url = `/act/ecos/prebook/apply`
    return this.http.post(url, data)
  }

  // 删除草稿
  deleteDraft(prebookId) {
    const url = `/act/ecos/prebook/${prebookId}`
    return this.http.delete(url)
  }

  // 提交审批
  submit(data) {
    const url = `/act/ecos/prebook/apply/submit`
    return this.http.post(url, data)
  }

  // 详情
  detail(applyId) {
    const url = `/act/ecos/prebook/apply/todo/${applyId}`
    return this.http.get(url)
  }

  // 审核
  approve(data) {
    const url = `/act/ecos/prebook/apply/approval`
    return this.http.post(url, data)
  }

  // 检查当前order是否被使用
  checkOrder(orderId, cpDealOrderId) {
    const url = `/act/ecos/prebook/order/check`
    return this.http.post(url, {
      id: orderId,
      cpDealOrderId
    })
  }

  linkedOitOrders({ marketBundleAmount, marketBundleName, opportunityId }) {
    const url = `/act/ecos/prebook/order/oit/matchedOrders?marketBundleAmount=${marketBundleAmount}&marketBundleName=${marketBundleName}&opportunityId=${opportunityId}`
    return this.http.get(url)
  }
  linkedOitOrders4UsOrder(primaryOpp) {
    const url = `/act/ecos/prebook/order/oit/matchedOrders4Us`
    return this.http.post(url, primaryOpp)
  }

  selectSofonFlie(param) {
    //查询sofon文件列表
    const url = `/act/ecos/oit/cpDocument`;
    return this.http.post(url, param);
  }

  sonFonUpload(param) {
    //上传sofon文件
    const url = `/act/system/upload/cp/document/${param}`;
    return this.http.get(url);
  }

  findUser(param) {
    const url = `/act/ecoscdcustomer/findCdUsers`
    return this.http.post(url, param)
  }
}
