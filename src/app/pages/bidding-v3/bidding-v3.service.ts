// http请求
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common'

import { HttpService } from '@core/services'
import { Subject } from 'rxjs';

const BASE_URL = `/act/ecos/bidding/apply`

@Injectable()
export class BiddingV3Service {
  pageLoading$ = new Subject<boolean>()

  constructor(
    private http: HttpService,
    private router: Router,
    private location: Location,
  ) { }

  setPageLoading(loading) {
    this.pageLoading$.next(loading)
  }

  goTodoPage() {
    this.router.navigate(["/ecos/my-todo"]);
  }

  goBack() {
    this.location.back()
  }

  detail(applyId) {
    const url = `/act/ecos/bidding/apply/${applyId}`;
    return this.http.get(url)
  }

  // 提交申请
  submit(data) {
    const url = `/act/ecos/bidding/apply/submit`
    return this.http.post(url, data)
  }

  // 保存草稿
  save(data) {
    const url = BASE_URL + '/save'
    return this.http.post(url, data)
  }

  // 审批操作
  approve(data) {
    const url = `act/ecos/bidding/apply/approval`;
    return this.http.post(url, data)
  }

  // 获取经销商协议列表
  getAgreementList(data) {
    const url = `/act/ecosdealer/findDealerAgreementsByPage`
    return this.http.post(url, { ...data, pageNo: 1, pageSize: 99, })
  }

  // 查询非标审批人, 投标保证金/技术条款
  findApprover(data) {
    const url = '/act/ecos/bidding/apply/findApprover'
    return this.http.post(url, data)
  }

  // 查询经销商
  searchDealer(dealerName) {
    const url = '/act/ecosdealer/findDealersByPage'
    return this.http.post(url, { pageNo: 1, pageSize: 10, dealerName })
  }

  // 获取cp校验结果
  getCPVerifyResult(applyId) {
    const url = `/act/ecos/bidding/apply/verify?applyId=${applyId}`
    return this.http.get(url)
  }

  submitSupplementFile(data) {
    const url = `/act/ecos/bidding/apply/supplement`
    return this.http.post(url, data)
  }

  getCcOptions({ productId, internal = 0 }) {
    const data = {
      pageNo: 1,
      pageSize: 999,
      productId,
      internal,
    }
    const url = `/act/ecos/bidding/apply/options`
    return this.http.post(url, data)
  }

  getPaymentList(data) {
    const url = `/act/ecos/payment/findArray`
    return this.http.post(url, data)
  }

  //bidding 取消项目Check
  biddingCancelCheck(applyId){
    const url = `/act/ecos/bidding/apply/${applyId}/cancelCheck`;
    return this.http.get(url);
  }

  //bidding 取消项目
  biddingCancel(data){
    const url = `/act/ecos/bidding/apply/cancel`;
    return this.http.post(url, data);
  }

  // 删除草稿
  deleteDraft(applyId) {
    const url = `/act/ecos/bidding/apply/${applyId}`
    return this.http.delete(url)
  }

  checkDdpStatus(name) {
    const url = `/act/ecom/bidding/getDdpDateAndValid?dealerName=${name}`
    return this.http.get(url)
  }

  commercialProducts(oppIds) {
    const url = `/act/ecos/bidding/apply/opportunity/productName`
    return this.http.post(url, oppIds)
  }

  // 获取特批会签事项列表
  getSpItems() {
    const url = `/act/ecos/spproject?pageNo=1&pageSize=999`
    return this.http.get(url).toPromise()
  }
}