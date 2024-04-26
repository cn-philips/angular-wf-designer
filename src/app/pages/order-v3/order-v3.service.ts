// http请求
import { Injectable, EventEmitter } from "@angular/core";
import { Subject, BehaviorSubject } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";
import { HttpService } from "@core/services";
import { areaList } from "@core/util/areajson";
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

  private paymentData=new Subject<any>();
  paymentDataReceive = this.paymentData.asObservable();
  paymentAction(name:any)
  {
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
  ddpStatusDmsDealer() {
    //deal From查询
    const url = `/act/ecom/dictData/queryDrop/?dictGroup=ddpStatusDmsDealer`;
    this.http.get(url).subscribe((res) => {
      this.ddpStatusDmsDealerList = formatResponse(res);
    });
  }
  async dealAgreement(dealerCode) {
    const params={
      dealerCode:dealerCode,
      pageSize:1000
    }
    const url = `/act/ecosdealer/findDealerAgreementsByPage`;
    const res = await this.http.post(url,params).toPromise();
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
  cpDocumentsConfig(param)
  {
    return this.http.post(`/act/system/upload/cp/documents/`,param)
  }
  // selectNmpa(param)
  // {
  //   //查询nmpa
  //   return this.http.post("/act/ecos/oit/nmpa",param)
  // }
 getDdpDateAndValid(param)
  {
    //检查经销商ddp是否有效
    const url=`/act/ecom/bidding/getDdpDateAndValid?dealerName=${param}`
    return this.http.get(url).toPromise()
  }
  findDealersByPageValid(param)
  {
    //查询经销商
    const  url=`/act/ecosdealer/findDealersByPage`
    return this.http.post(url,param).toPromise();
  }
  findEcosiepool(param)
  {
    //外贸易公司查询
    const url=`/act/ecosiepool/findByPage`;
    return this.http.post(url,param).toPromise();
  }
  getMessageGroup()
  {
    //改单ddp过期提示
    const params = {
      dictGroup: 'MessageGroup',
    };
    const url=`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`;
    return this.http.get(url);
  }
  signatureSubmit(zslParam)
  { //水印提交和保存
    const url=`/act/ecos/signature/submit`;
    return this.http.post(url,zslParam)
  }
  getImage()
  {
    //查询图片地址
    const url="/act/ecos/signature/find/image";
    return this.http.get(url).toPromise()
  }
  getCpDealOrderId(orderId)
  {
    //查询CpDealOrderId
    const url=`/act/ecos/oit/preparation/orderId/${orderId}`;
    return this.http.get(url);
  }
  getBiddingIsSpecial(biddingId)
  { //查询bidding是否是特批事项
    const url=`/act/ecos/oit/biddingIsSpecial?biddingId=${biddingId}`;
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

}
