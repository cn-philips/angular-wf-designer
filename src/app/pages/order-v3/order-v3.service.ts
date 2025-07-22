// http请求
import { EventEmitter, Injectable } from "@angular/core";
import { HttpService } from "@core/services";
import { areaList } from "@core/util/areajson";
import { Subject } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";
function formatResponse(res) {
  if ("0000" === res["code"]) {
    return res.data;
  } else {
    throw new Error(res.msg);
  }
}

@Injectable()
export class OrderV3Service {
  constructor(private http: HttpService) {
    this.orderEntryMode();
    this.ddpStatusDmsDealer();
    this.provinceList = areaList;
    this.getfinancialList();
    this.paymentList = [];
    this.ecosIepool();
  }
  orderModeList: any = [];
  ddpStatusDmsDealerList: any = [];
  financialList: any = [];
  paymentList: any = [];
  provinceList: any;
  iepoolList: any;

  private paymentData = new Subject<any>();
  paymentDataReceive = this.paymentData.asObservable();
  paymentAction(name: any) {
    this.paymentData.next(name);
  }

  private productData = new Subject<any>();
  productReceive = this.productData.asObservable();

  productAction(name: any) {
    this.productData.next(name);
  }
  private baseDictionaryData = new Subject<any>();
  baseDictionaryReceive = this.baseDictionaryData.asObservable();

  baseDictionaryAction(name: any) {
    this.baseDictionaryData.next(name);
  }
  productTable: any = new EventEmitter();

  private pageLoad = new Subject<any>();
  pageLoadReceiv = this.pageLoad.asObservable();
  pageLoadAction(name: any) {
    this.pageLoad.next(name);
  }
  private tenderNumDelive = new EventEmitter();
  tenderNumkeyup = this.tenderNumDelive.asObservable();
  tenderNumDeliveAction(name: any) {
    this.tenderNumDelive.next(name);
  }
  //支持文件是否缺失进单
  private supportFileChangData = new Subject<any>();
  supportFileChangReceive = this.supportFileChangData.asObservable();
  supportFileChangAction(name: any) {
    this.supportFileChangData.next(name);
  }
  get paymentLists() {
    return this.paymentList;
  }
  get provinceLists() {
    return this.provinceList;
  }

  get orderModeLists() {
    return this.orderModeList;
  }
  get financialLists() {
    return this.financialList;
  }
  get iepoolLists() {
    return this.iepoolList;
  }
  set paymentLists(val) {
    this.paymentList = [];
  }

  orderEntryMode() {
    //进单模式
    const url = `/act/ecom/dictData/queryDrop?dictGroup=ENTRY_MODEL`;
    return this.http.get(url).toPromise();
  }
  async cpDealFormInfo(val) {
    //deal From查询
    const url = `/act/ecos/oit/cpDealFormInfo/${val}`;
    const res = await this.http.get(url).toPromise();
    return res;
  }

  checkDealer(params: any) {
    //校验经销商状态
    const url = `/act/dealers-status/checkDealerStatus`;
    return this.http.post(url, params).toPromise();
  }

  ddpStatusDmsDealer() {
    //deal From查询
    const url = `/act/ecom/dictData/queryDrop/?dictGroup=ddpStatusDmsDealer`;
    this.http.get(url).subscribe((res) => {
      this.ddpStatusDmsDealerList = formatResponse(res);
    });
  }
  async dealAgreement(dealerCode) {
    const params = {
      dealerCode: dealerCode,
      pageSize: 1000,
    };
    const url = `/act/ecosdealer/findDealerAgreementsByPage`;
    const res = await this.http.post(url, params).toPromise();
    const data = formatResponse(res);
    return data;
  }
  queryOrder(id) {
    //查询进单
    const url = `/act/ecos/oit/preparation/applyId/${id}`;
    return this.http.get(url).toPromise();
  }
  orderSubmit(param) {
    //进单提交
    //apply_submit,提交
    //apply_save,保存
    const url = `/act/ecos/oit/submit`;
    return this.http.post(url, param).toPromise();
  }
  orderApproval(param) {
    //进单审核
    const url = `/act/ecos/oit/preparation/approval`;
    return this.http.post(url, param).toPromise();
  }
  orderSave(param) {
    //进单保存
    const url = `/act/ecos/oit/preparation/save`;
    return this.http.post(url, param).toPromise();
  }
  contractApproval(param) {
    //合同概要表审核
    const url = `/act/ecos/oit/contract/approval`;
    return this.http.post(url, param).toPromise();
  }
  contractSave(param) {
    //合同概要表保存
    const url = `/act/ecos/oit/contract/save`;
    return this.http.post(url, param).toPromise();
  }

  queryStatus() {
    //流程状态
    const url = `/act/ecom/dictData/queryDrop?dictGroup=NODE_ECOS`;
    this.http.get(url).subscribe((res) => {
      console.log(res.data);
    });
  }
  queryContact(id) {
    //查询合同概要表，ordersummary,oit完成，合同签署
    const url = `/act/ecos/oit/contract/applyId/${id}`;
    return this.http.get(url).toPromise();
  }
  getfinancialList() {
    //金融方案列表
    this.http
      .get(`/act/ecom/dictData/queryDrop?dictGroup=OABC`)
      .subscribe((rest) => {
        if (rest.code === "0000") {
          this.financialList = rest.data;
        }
      });
  }
  biddingVerification(param) {
    //bidding模式进单中标效验
    const url = "/act/ecos/oit/verification";
    return this.http.post(url, param).toPromise();
  }
  async paymentMethod(param) {
    this.paymentList = [];
    // const url = `/act/ecom/dictData/queryGroupDictData`;
    // this.http.post(url, param).subscribe(res => {
    //   this.paymentList = formatResponse(res);
    // })
    const url = `/act/ecos/payment/find`;
    return this.http.post(url, param).toPromise();
  }

  ecosIepool() {
    //外贸公司接口
    const url = "/act/ecosiepool/findByPage";
    const param = {
      corporateName: null,
      pageNo: 1,
      pageSize: 1000,
    };
    this.http.post(url, param).subscribe((res) => {
      this.iepoolList = formatResponse(res).rows;
    });
  }

  departmentItemList() {
    //科室下拉列表
    const url = "/act/ecos/oit/department";
    return this.http.get(url).pipe(distinctUntilChanged()).toPromise();
  }
  isChangOrder(param) {
    //是否可以发起改
    const url = `/act/ecos/oit/changeOrder/canBeChange/${param}`;
    return this.http.get(url).toPromise();
  }

  getUserInfo(email) {
    const url = "/act/role/getUsersByEmail?email=" + email;
    return this.http.get(url).toPromise();
  }

  async changeOrderHistory(applyId) {
    //改单历史
    const url = `/act/ecos/oit/changeOrder/changeOrderHistory/${applyId}`;
    return this.http.get(url).toPromise();
  }

  async changeOrder(applyId) {
    //查询改记录
    const url = `/act/ecos/oit/changeOrder/applyId/${applyId}`;
    return this.http.get(url).toPromise();
  }
  changeOrderApproval(param) {
    //改单审批
    const url = `/act/ecos/oit/changeOrder/approval`;
    return this.http.post(url, param);
  }
  changeOrderMenu(applyId) {
    //合同概要表中是否可以取消改单
    const url = `/act/ecos/oit/changeOrder/inChangeOrder/${applyId}`;
    return this.http.get(url);
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
  searchPrebook(param) {
    //查询prebook
    return this.http.post("/act/ecos/oit/findPrebookOrder", param);
  }
  searchPrebookByMarketBundle(param) {
    //查询prebook
    return this.http.post("/act/ecos/oit/findPrebookOrderByMarketBundleList", param);
  }
  deletOrder(param) {
    //删除进单
    return this.http.get(`/act/ecos/oit/deleteDraft/${param}`);
  }
  getContractTemplate({
    code,
    templateName,
    modality,
    currency,
    businessModel,
    dealerName,
    foreignTradeCorpName,
  }: any) {
    // 获取合同模板
    return this.http.post(`/act/ecos/oit/contractTemplate`, {
      code,
      templateName,
      modality,
      currency,
      businessModel,
      dealerName,
      foreignTradeCorpName,
    });
  }
  cpDocumentsConfig(param) {
    return this.http.post(`/act/system/upload/cp/documents/`, param);
  }
  // selectNmpa(param)
  // {
  //   //查询nmpa
  //   return this.http.post("/act/ecos/oit/nmpa",param)
  // }
  getDdpDateAndValid(param) {
    //检查经销商ddp是否有效
    const url = `/act/ecom/bidding/getDdpDateAndValid?dealerName=${param}`;
    return this.http.get(url).toPromise();
  }
  findDealersByPageValid(param) {
    //查询经销商
    const url = `/act/ecosdealer/findDealersByPage`;
    return this.http.post(url, param).toPromise();
  }
  findEcosiepool(param)
  {
    //外贸易公司查询
    const url = `/act/ecosiepool/findByPage`;
    return this.http.post(url, param).toPromise();
  }
  getMessageGroup() {
    //改单ddp过期提示
    const params = {
      dictGroup: "MessageGroup",
    };
    const url = `/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`;
    return this.http.get(url);
  }
  signatureSubmit(zslParam) {
    //水印提交和保存
    const url = `/act/ecos/signature/submit`;
    return this.http.post(url, zslParam);
  }
  getImage() {
    //查询图片地址
    const url = "/act/ecos/signature/find/image";
    return this.http.get(url).toPromise();
  }
  getCpDealOrderId(orderId) {
    //查询CpDealOrderId
    const url = `/act/ecos/oit/preparation/orderId/${orderId}`;
    return this.http.get(url);
  }
  getBiddingIsSpecial(biddingId) {
    //查询bidding是否是特批事项
    const url = `/act/ecos/oit/biddingIsSpecial?biddingId=${biddingId}`;
    return this.http.get(url);
  }

  getOrderOwner(orderId){
    //查询集采项目时的Order Owner
    const url = `/act/ecos/oit/getOrderOwner?OrderId=${orderId}`;
    return this.http.get(url).toPromise();
  }

  checkContractSignatory(params){
    const url=`/act/ecos/signature/checkContractSignatory`;
    return this.http.post(url,params)
  }

  // ===================================电子签章模块接口========================================

  // 上传合同文件
  uploadContractFile(params: any, flowId: any) {
    const url = "/act/contractSign/uploadContractFile/" + flowId;
    return this.http.posts(url, params).toPromise();
  }

  // 上传合同支持文件
  uploadSupportFile(params: any, fileId: any) {
    const url = "/act/contractSign/uploadSupportFiles/" + fileId;
    return this.http.posts(url, params).toPromise();
  }

  // 新建，修改流程
  createEditSign(params: any) {
    const url = "/act/contractSign/flow";
    return this.http.post(url, params).toPromise();
  }

  // 删除电子签章流程
  deleteContractSign(params: any) {
    const url = "/act/contractSign/flow/" + params;
    return this.http.delete(url).toPromise();
  }

  // 获取电子签章流程列表
  getContractSignList(from: any, params: any) {
    const url = `/act/contractSign/${from}/${params}`;
    return this.http.get(url).toPromise();
  }

  // 获取电子签章流程详情
  getContractSignDetail(params: any) {
    const url = `/act/contractSign/flow/${params}`;
    return this.http.get(url).toPromise();
  }

  // 将Flow下的所有合同发送到上上签进行签署
  sendContractToBestSign(params: any) {
    const url = `/act/contractSign/flow/send/${params.id}`;
    return this.http.post(url, params).toPromise();
  }

  // 删除合同文件
  delContractFile(params: any) {
    const url = `/act/contractSign/${params}`;
    return this.http.delete(url).toPromise();
  }

  confirmCancel(flowId: any, roleName: any) {
    const url = `/act/contractSign/flow/${flowId}/${roleName}/confirmCancel`;
    return this.http.post(url).toPromise();
  }

  // 对Flow进行操作
  // type: 1 审批 post，2 作废 delete，3 驳回 delete，4 撤回 delete
  contractSignOperation(flowId: any, type: any, reason: any) {
    let method = "delete",
      str = "";
    if (type === 1) {
      method = "post";
      str = "/approval";
    } else if (type === 2) {
      method = "post";
      str = "/cancel";
    } else if (type === 3) {
      str = "/reject";
    } else if (type === 4) {
      method = "post";
      str = "/withdraw";
    }

    let url = "/act/contractSign/flow/" + flowId + str;
    if (method === "delete") {
      url = url + "?reason=" + reason;
      return this.http.delete(url).toPromise();
    } else if (method === "post") {
      let params: any = {};
      if (type === 2) {
        params.invalidReason = reason;
      } else {
        params.reason = reason;
      }
      return this.http.post(url, params).toPromise();
    }
  }

  // 获取上上签的dealerAcount 信息
  getDealerAcount(params: any) {
    const url = `/act/contractSign/dealerAccount`;
    return this.http.post(url, params).toPromise();
  }

  // 获取上上签的外贸公司 信息
  getForeignTradeCorpAccount(params: any) {
    const url = `/act/contractSign/foreignCorpAccount`;
    return this.http.post(url, params).toPromise();
  }

  // 获取单个流的数据
  getFlowInfo(businessType: any, flowId: any) {
    const url = `/act/contractSign/flow/${businessType}/${flowId}`;
    return this.http.get(url).toPromise();
  }

  refreshFlowFromBestSign(flowId: any) {
    const url = `/act/contractSign/syncFlowContracts/${flowId}`;
    return this.http.get(url).toPromise();
  }

  // 获取合同模板
  getFlowTemplate(templateType: any, contractId: any) {
    const url = `/act/contractSign/template/${templateType}/${contractId}`;
    // const url = `/act/contractSign/template/${templateType}`;
    return this.http.get(url).toPromise();
  }

  // 合同签署
  signFlow(flowId: any, roleName: any) {
    const url = `/act/contractSign/${flowId}/${roleName}/sign`;
    return this.http.post(url).toPromise();
  }

  // contract审批历史
  historyContract(params: any) {
    const url = "/act/approval/history/contract";
    return this.http.post(url, params).toPromise();
  }

  // 投标审批历史
  approvalSignUp(params: any) {
    const url = "/act/approval/history/bidding/signup";
    return this.http.post(url, params).toPromise();
  }

  // 内容审批历史
  approvalContent(params: any) {
    const url = "/act/approval/history/bidding/content";
    return this.http.post(url, params).toPromise();
  }

  downloadContractFromBestSign(subContractId: any) {
    const url = "/act/contractSign/download/" + subContractId;
    return this.http.get(url).toPromise();
  }

  downloadAllContractsFromBestSign(flowId: any) {
    const url = "/act/contractSign/downloadAll/" + flowId;
    return this.http.get(url).toPromise();
  }

  downloadInvalidContractFromBestSign(flowId: any) {
    const url = "/act/contractSign/download/invalid/" + flowId;
    return this.http.get(url).toPromise();
  }

  voidFlow(flowId: any, reason: any, role: any) {
    const url = "/act/contractSign/rejectNotification/" + flowId;
    return this.http
      .post(url, {
        reason,
        role,
      })
      .toPromise();
  }

  SaveFilesToFlow(flowId: any, ids: any) {
    const url = "/act/contractSign/uploadContractFileFromForm/" + flowId;
    return this.http
      .post(url, {
        ids,
      })
      .toPromise();
  }

  syncToContractFile(flowId: any) {
    const url = "act/contractSign/syncToContract/" + flowId;
    return this.http.post(url).toPromise();
  }

  getRelatedSPCancelOrder(flowId: any) {
    const url = "/act/contractSign/getRelatedSPCancelOrder/" + flowId;
    return this.http.get(url).toPromise();
  }

  getRelatedContractSummary(flowId: any) {
    const url = "/act/contractSign/getRelatedContractSummary/" + flowId;
    return this.http.get(url).toPromise();
  }

  ifRaisedFlow(applyId: any) {
    const url = "/act/contractSign/ifRaisedFlow/" + applyId;
    return this.http.get(url).toPromise();
  }

  // ===================================电子签章模块接口========================================
}
