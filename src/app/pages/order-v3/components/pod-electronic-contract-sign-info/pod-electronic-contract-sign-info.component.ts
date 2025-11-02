import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { RouterExtendService } from "@app/modern-themes/services/router-extend.service";
import { HttpService } from "@core/services";
import { saveAs } from "file-saver";
import * as moment from "moment";
import {
  NzMessageService,
  NzModalService,
  NzNotificationService,
} from "ng-zorro-antd";
import { OrderV3Service } from "../../order-v3.service";
@Component({
  selector: "ecos-pod-electronic-contract-sign-info",
  templateUrl: "./pod-electronic-contract-sign-info.component.html",
  styleUrls: ["./pod-electronic-contract-sign-info.component.scss"],
})
// interface SimpleChanges {
//   __index(propName: string): SimpleChange
// }
export class PodElectronicContractSignInfoComponent implements OnInit {
  constructor(
    private router: Router,
    private routerExt: RouterExtendService,
    private ownHttp: HttpService,
    private activatedRoute: ActivatedRoute,
    private http: OrderV3Service,
    private message: NzMessageService,
    private modal: NzModalService,
    private changeDetectorRef: ChangeDetectorRef,
    private notification: NzNotificationService
  ) {}
  signDataSource: any = [];
  templateList: any = [];
  relatedSPCancelOrderList: any = [];
  relatedContractSummaryList: any = [];
  @Input() from: String = "CONTRACT";
  @Input() contractId: String = "";
  @Input() info: any = {};
  @Input() contractSignFileList: any = [];
  // 已签署的合同正本文件
  @Input() contractSignedFilesList: any = [];
  @Output() refreshDetail: EventEmitter<any> = new EventEmitter();
  private contractType = "POD";
  roleMapping = {
    ZoneSalesLeader: "ZSL",
    Philips: "Philips",
    FinanceBP: "Finance BP Service",
    SealAdmin: "Philips",
    "Sales Leader": "ZSL",
    LegalPerson: "法人",
    法人: "法人",
    Dealer: "经销商公章",
    DealerRepresentative: "经销商签字人",
    ForeignTradeCorp: "外贸公司",
    ForeignTradeCorpRepresentative: "外贸公司签字人",
  };

  signSpinning: any = false;
  historyList: any = [];
  firstAccount: any = true;
  firstInfo: any = true;
  isMobile: any = true;

  modalType: any = "";
  modalTitle: any = "";
  modalVisible: any = false;
  reasonText: any = "";
  modalIndex: any = -1;
  modalId: any = "";
  modalRole: any = "";

  uploadType: any = "";
  uploadIndex: any = -1;
  flowId: any = "";
  fileId: any = "";
  cancelDisable: any = false;
  cancelOptions: any = [];
  cancelBackup: any = "";

  uploadVisible: any = false;
  uploadLoading: any = false;
  dealerName: any = "";
  dealerBestSignAccount: any = "";
  dealerAccountSuggestList: any = [];
  freightForwarderList:any=[];
  freightForwarderBestSignAccountSuggestListTemp:any = {};
  freightForwarderRepresentativeAccountSuggestListTemp:any = {};
  freightForwarderBestSignAccountSuggestList:any = {};
  freightForwarderRepresentativeAccountSuggestList:any = {};

  dealerRepresentativeBestSignAccount: any = "";
  dealerRepresentativeAccountSuggestList: any = [];
  dealerCheckStatus: any = "";

  freightForwarderName:any = ''
  freightForwarderBestSignAccount:any = ''
  freightForwarderRepresentativeBestSignAccount:any = ''
  freightForwarderRepresentativePos:any = ''
  freightForwarderRepresentativeName:any = ''
  ETADate:any = null

  PMSuggestList: any = [];
  pm:any = ''

  get showWarning(){
    return (this.contractSignedFilesList&&this.contractSignedFilesList.length>0)||(this.signDataSource.length>0&&this.signDataSource.some((item:any)=>['COMPLETE','SEND','CREATED'].includes(item.status)))
  }
  get getDealerOrForeignInfo() {
    if (Object.keys(this.info).length > 0 && this.info.contractInfo) {
      let {
        dealerName,
        dealerBestSignSignerAccount,
      } = this.info.contractInfo;
      return {
        dealerName: dealerName,
        dealerBestSignAccount: dealerBestSignSignerAccount,
        dealerRepresentativeBestSignAccount: dealerBestSignSignerAccount,
      };
    } else {
      return null;
    }
  }

  get allDisable() {
    // let info = this.info,
    //   sign = this.route.snapshot.params["sign"],
    //   from = this.from,
    //   userrole = JSON.parse(localStorage.getItem("roles")),
    //   result = true;
    // if (sign && sign === 1) {
    //   result = false;
    // } else {
    //   if (Object.keys(info).length > 0) {
    //     // 合同>= 401  投标内容 321， 投标报名 311
    //     if (from === "CONTRACT") {
    //       if (userrole.indexOf("OA") > -1 && contractStage >= 401) {
    //         result = false;
    //       }
    //     }
    //     // else {
    //     //   contractStage = info.biddingFunnelVo.currentStage;
    //     //   if (userrole.indexOf("OA") > -1) {
    //     //     if (from === "BIDDING" && contractStage >= 311) {
    //     //       result = false;
    //     //     }
    //     //     if (from === "CONTENT" && contractStage >= 321) {
    //     //       result = false;
    //     //     }
    //     //   }
    //     // }
    //   }
    // }.relatedContractSummaryList
    // return result
    return false;
  }
  get isCanLoad() {
    let templateList = this.templateList,
      contractId = this.contractId;
    return templateList.length > 0 && contractId;
  }
  get historyId() {
    let from = this.from,
      info = this.info;

    if (from === "BIDDING") {
      // return this.route.params["id"];
    } else if (from === "CONTENT") {
      if (Object.keys(info).length > 0) {
        // return info.biddingContentVo.id;
      }
    } else if (from === "CONTRACT") {
      return this.contractId;
    }
  }
  get orderModality() {
    let info = this.info;
    if (info && Object.keys(info).length > 0 && info.contractInfo) {
      return info.contractInfo.orderModality;
    } else {
      return "";
    }
  }

  get createSignVisible() {
    const userrole = JSON.parse(localStorage.getItem("roles"));
    if (userrole.indexOf("OA") > -1) {
      return true;
    }
    return false;
  }

  fileList: any = [];

  backupZslNotSignedFile: any = [];

  // get contractCurrency() {
  //   let info = this.info;
  //   if (info && Object.keys(info).length > 0 && info.contractInfo) {
  //     return info.contractInfo.currencySystem;
  //   } else {
  //     return "";
  //   }
  // }

  isAllDisplayDataChecked = false;
  isOperating = false;
  isIndeterminate = false;
  listOfDisplayData: any = [];
  mapOfCheckedId: { [key: string]: boolean } = {};
  numberOfChecked = 0;

  async checkCompanyByBestSign(name: any) {
    const params = {
      corpName: name,
    };
    let result: any = "";
    let status: any = "";
    let statusString: any = "";
    const res = await this.http.checkDealer(params);
    const { code, data } = res;
    if (code === "0000") {
      const { authStatus, satisfactoryAuth } = data;
      // satisfactoryAuth 是否满足开发者配置的实名要求
      if (!satisfactoryAuth) {
        status = "不通过";
        // statusString = "未满足开发者配置的实名要求";
        statusString = "当前公司未完成上上签的实名认证";
      }
      // authStatus
      // 0:未认证 （包含未去实名、实名被全部驳回的认证不通过）
      // 1:认证中 （包含审核中、意愿性认证中）
      // 2:已认证 ； -1:未获取实名授权
      if (authStatus !== 2) {
        status = "不通过";
        statusString = "当前公司未完成上上签的实名认证";
      }
      result = statusString;
    }
    return result;
  }

  currentPageDataChange($event: any): void {
    this.listOfDisplayData = $event;
    this.listOfDisplayData.forEach((item: any) => {
      if (this.mapOfCheckedId[item.id] === undefined) {
        this.mapOfCheckedId[item.id] = false;
      }
    })
    this.refreshStatus();
  }
  onSingleCheck(id: string): void {
    // 只允许单选
    console.log('this.mapOfCheckedId1',this.mapOfCheckedId)
    Object.keys(this.mapOfCheckedId).forEach(key => {
      this.mapOfCheckedId[key] = (key == id);
    });
    console.log('this.mapOfCheckedId2',this.mapOfCheckedId)
    this.refreshStatus();
  }
  refreshStatus(): void {
    let listOfDisplayData = this.listOfDisplayData;
    let mapOfCheckedId = this.mapOfCheckedId;
    let isAllDisplayDataChecked = listOfDisplayData
      .filter((item: any) => !item.disabled)
      .every((item: any) => mapOfCheckedId[item.id]);
    let isIndeterminate =
      listOfDisplayData
        .filter((item: any) => !item.disabled)
        .some((item: any) => mapOfCheckedId[item.id]) &&
      !isAllDisplayDataChecked;
    this.isAllDisplayDataChecked = isAllDisplayDataChecked;
    this.isIndeterminate = isIndeterminate;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayData
      .filter((item) => !item.disabled)
      .forEach((item) => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  myMoment(time: any) {
    return moment(time).format("YYYY-MM-DD HH:mm");
  }

  ngOnInit() {
    this.init();
  }
  timer: any = null;
  timer1: any = null;
  timer2: any = null;
  init() {
    let clientWidth = document.body.clientWidth;
    if (clientWidth < 768) {
      this.isMobile = true;
    }
    this.signSpinning = true;
    // ["ecos_oit_order_sign", "ecos_oit_order_upload", "ecos_oit_order_done"]
    let oitcomplete = ["ecos_oit_order_sign", "ecos_oit_order_upload"];
    let taskStatus = this.activatedRoute.queryParams["value"].taskStatus;
    if (!oitcomplete.includes(taskStatus)) {
      this.cancelDisable = true;
    }

    this.timer1 = setInterval(() => {
      if (this.getDealerOrForeignInfo) {
        clearInterval(this.timer1);
        this.timer1 = null;
        let {
          dealerName,
          dealerBestSignAccount,
          dealerRepresentativeBestSignAccount,
        } = this.getDealerOrForeignInfo;
        this.dealerName = dealerName;
        this.dealerBestSignAccount = dealerBestSignAccount;
        this.dealerRepresentativeBestSignAccount =
          dealerRepresentativeBestSignAccount;
        this.getSuggestList();
        this.checkDealerOrForeigner();
        this.getList();
      }
    }, 1000);

    this.getFlowTemplateList();

    // this.getDealerAccount();
    // this.getForeignTradeCorpAccount();
    this.getCancelOrderList();
    this.getContractSummaryList();
    this.getPODContractPmList();
  }
  public formatPMSuggestFn = (item)=>`${item.approverEmail}(${item.approverName})`
  async getPODContractPmList(){
    let applyId = this.activatedRoute.queryParams["value"].id;

    this.ownHttp.post("/act/contractSign/pod/pm/"+applyId).subscribe((res) => {
      const { code, data, msg } = res;
      if (code === "0000") {
        console.log('PMSuggestList',data)
        this.PMSuggestList = data;
      }
    })
  }
  async checkDealerOrForeigner() {
    if (this.dealerName) {
      const result = await this.checkCompanyByBestSign(this.dealerName);
      this.dealerCheckStatus = result;
    }
  }

  getSuggestList() {
    this.ownHttp.post("/act/contractSign/dealerInfo").subscribe((res) => {
      console.log(res);
      const { code, data, msg } = res;
      if (code === "0000") {
        let list = data;
        let dealerAccountSuggestList = list.filter((item) => {
          return (
            item.dealerType === "DEALER" &&
            item.dealerName === this.dealerName &&
            item.signatoryType === "SEAL"
          );
        });
        // if
        let dealerRepresentativeAccountSuggestList = list.filter((item) => {
          return (
            item.dealerType === "DEALER" &&
            item.dealerName === this.dealerName &&
            item.signatoryType === "SIGN"
          );
        });
        this.dealerAccountSuggestList = dealerAccountSuggestList;
        this.dealerRepresentativeAccountSuggestList = dealerRepresentativeAccountSuggestList;

        let freightForwarderList = list.filter((item) => {
          return (
            item.dealerType === "FREIGHT_FORWARDER"
          );
        });
        console.log('freightForwarderList',freightForwarderList)
        this.freightForwarderList = Array.from(new Set(freightForwarderList.map(item=>item.dealerName))).map(i=>({value:i}));

        console.log('this.freightForwarderList ',this.freightForwarderList )
        this.freightForwarderBestSignAccountSuggestListTemp = {}
        freightForwarderList.filter((item) => {
          return (
            item.signatoryType === "SEAL"
          );
        }).forEach((item)=>{
          if(!this.freightForwarderBestSignAccountSuggestListTemp[item.dealerName]){
            this.freightForwarderBestSignAccountSuggestListTemp[item.dealerName] = []
          }
          this.freightForwarderBestSignAccountSuggestListTemp[item.dealerName].push(item)
        });
        // .filter((item) => item.dealerName === account)
        this.freightForwarderRepresentativeAccountSuggestListTemp = {};
        freightForwarderList.filter((item) => {
          return (
            item.signatoryType === "SIGN"
          );
        }).forEach((item)=>{
          if(!this.freightForwarderRepresentativeAccountSuggestListTemp[item.dealerName]){
            this.freightForwarderRepresentativeAccountSuggestListTemp[item.dealerName] = []
          }
          this.freightForwarderRepresentativeAccountSuggestListTemp[item.dealerName].push(item)
        });
      }
    });
  }

  getList() {
    let num = 0;
    this.getContractSignList();
    this.timer = setInterval(() => {
      if (this.isCanLoad) {
        clearInterval(this.timer);
        this.timer = null;
        this.getContractSignList();
      } else {
        if (num >= 20) {
          clearInterval(this.timer);
          this.timer = null;
        }
      }
    }, 1000);
  }

  async getCancelOrderList() {
    let contractId = this.contractId;
    const res = await this.http.getRelatedSPCancelOrder(contractId);
    const { code, data } = res;
    if (code === "0000") {
      this.relatedSPCancelOrderList = data;
    }
  }

  async getContractSummaryList() {
    let contractId = this.contractId;
    const res = await this.http.getRelatedContractSummary(contractId);
    const { code, data } = res;
    if (code === "0000") {
      this.relatedContractSummaryList = data;
    }
  }

  judgeStatus(data: any) {
    const userrole = JSON.parse(localStorage.getItem("roles")),
      userIds = JSON.parse(localStorage.getItem("roleAgents")),
      contractId = this.contractId,
      from = this.from,
      dataList = data;
    const dealerName = this.dealerName,
      dealerBestSignAccount = this.dealerBestSignAccount,
      dealerRepresentativeBestSignAccount =
        this.dealerRepresentativeBestSignAccount
    if (dataList.length > 0) {
      for (let index = 0; index < dataList.length; index++) {
        const el = dataList[index];
        const status = el.status,
          currentAssigneeUserId = el.currentAssigneeUserId,
          currentUserName = el.currentUserName,
          relatedOrderSummaries = el.relatedOrderSummaries,
          agreements = el.agreements,
          businessId = el.businessId,
          currentUserRole = el.currentUserRole;
        el.selectedItems = [];
        if (currentUserRole) {
          let mapRole = this.roleMapping[currentUserRole];
          el.currentUserShowName = mapRole ? mapRole : currentUserRole;
        } else {
          el.currentUserShowName = "";
        }
        var applicantIdStr = el.applicantId||""
        var applicantIds = applicantIdStr.split(";")
        var isApplicant = applicantIds.some(applicant => userIds.includes(applicant))
        if (
          businessId !== contractId ||
          ((status === "DRAFT" || status === "CREATED") && !isApplicant)
        ) {
          el.allDisable = true;
        }

        if (relatedOrderSummaries && relatedOrderSummaries.length > 0) {
          // 如果有relatedOrderSummaries，则要转换成数组回显到select
          let relatedOrderSummaryIds = relatedOrderSummaries.map(
            (item: any) => {
              return item.applyId;
            }
          );
          el.relatedOrderSummaryIdsArray = relatedOrderSummaryIds;
        } else {
          el.relatedOrderSummaryIdsArray = [];
        }

        el.dealerName = el.dealerName ? el.dealerName : dealerName;
        el.dealerBestSignAccount = el.dealerBestSignAccount
          ? el.dealerBestSignAccount
          : dealerBestSignAccount;
        el.dealerRepresentativeBestSignAccount =
          el.dealerRepresentativeBestSignAccount
            ? el.dealerRepresentativeBestSignAccount
            : dealerRepresentativeBestSignAccount;

        if (agreements && agreements.length > 0) {
          // 如果有agreementApplyId，则要转换成数组回显到select
          let agreementApplyId = agreements.map((item: any) => {
            return item.id;
          });
          el.agreementApplyIdArray = agreementApplyId;
        } else {
          el.agreementApplyIdArray = [];
        }

        let templateList = this.templateList;
        if (templateList.length > 0) {
          let arr = [];
          // for (let i = 0; i < templateList.length; i++) {
          //   const element = templateList[i];
          //   let result = false;
          //   if (element.templateRule) {
          //     result = this.validDefaultSelect(element, el.currency);
          //   }
          //   if (result) {
          //     arr.push(element);
          //   }
          // }
          if (arr.length > 0) {
            el.lastTemplateList = arr;
          } else {
            el.lastTemplateList = templateList;
          }
          let templateInfo: any = {};
          if (el.templateId) {
            // 已经有 templateId 了
            templateInfo = el.lastTemplateList.find(
              (item: any) => item.templateId === el.templateId
            );
          } else {
            // 没有 templateId，就更新第一个模板
            let disArr = [];
            for (let i = 0; i < el.lastTemplateList.length; i++) {
              const displayName = el.lastTemplateList[i].templateDisplayName;
              if (displayName.indexOf("经销商签章") > -1) {
                disArr.push({
                  dealerIndex: displayName.indexOf("经销商签章"),
                  ...el.lastTemplateList[i],
                });
              }
            }

            if (disArr.length > 0) {
              disArr.sort((a, b) => a.dealerIndex - b.dealerIndex);
              templateInfo = disArr[0];
            } else {
              templateInfo = el.lastTemplateList[0];
            }
            let params = {
              id: el.id,
              templateId: templateInfo.templateId,
            };
            this.http.createEditSign(params);
          }
          if (templateInfo) {
            el.signWay = templateInfo.templateId;
            let last = [...templateInfo.documents];
            el.backupDocuments = JSON.parse(JSON.stringify(last));
          }
        }
        // 合同流程里，合同类型默认为“带职位”；Bidding流程里，合同类型默认为“不带职位”
        if (el.contracts.length > 0) {
          let backupDocuments = el.backupDocuments;
          if (from === "CONTRACT" && status === "DRAFT") {
            let emptyArr = [];
            for (let i = 0; i < el.contracts.length; i++) {
              const element = el.contracts[i];
              if (element.documentId) {
                el.selectedItems.push(element.documentId);
              } else {
                let remainDocuments = [];
                if (backupDocuments.length > 0) {
                  remainDocuments = backupDocuments.filter(
                    (o: any) => !el.selectedItems.includes(o.documentId)
                  );
                }
                if (remainDocuments.length > 0) {
                  emptyArr.push(1);
                  el.selectedItems.push(remainDocuments[0].documentId);
                  element.documentId = remainDocuments[0].documentId;
                  element.documentName = remainDocuments[0].documentName;
                }
              }
            }
            // 判断这个empty里有没有值，如果有，这需要调用接口，没有就不用调接口
            if (emptyArr.length > 0) {
              let params = {
                id: el.id,
                contracts: el.contracts,
              };
              this.http.createEditSign(params);
            }
          } else {
            for (let i = 0; i < el.contracts.length; i++) {
              const element = el.contracts[i];
              if (element.documentId) {
                el.selectedItems.push(element.documentId);
              } else {
                element.documentId = "";
              }
              if (!element.documentName) {
                element.documentName = "";
              }
            }
          }
          // 设置disabled
          if (el.backupDocuments && el.backupDocuments.length > 0) {
            for (let i = 0; i < el.backupDocuments.length; i++) {
              const element = el.backupDocuments[i];
              if (el.selectedItems.includes(element.documentId)) {
                element.disabled = true;
              }
            }
          }
        }

        let defaultdocuments = [];
        if (from !== "CONTRACT") {
          defaultdocuments = [
            {
              documentId: "",
              documentName: "默认模板(不带职位)",
            },
          ];
          el.backupDocuments = JSON.parse(
            JSON.stringify([...defaultdocuments, ...el.backupDocuments])
          );
        }

        // 双签
        // 根据各种状态和字段，判断按钮的显示隐藏和状态文字
        if (status === "DRAFT") {
          // 此时是草稿状态，需要显示上传文件按钮，上传支持文件按钮，删除流程按钮，删除文件按钮，发起签章按钮
          el.showfile = 1; //上传按钮
          el.showsupport = 1; //上传支持文件按钮
          el.showdelflow = 1; //删除流程按钮
          el.showdelfile = 1; //删除文件按钮
          el.showsend = 1; //发起签章按钮
          el.statusTxt = "起草中";
        } else if (status === "CREATED") {
          // 处于上上签的草稿状态，允许重复发起签章，但不允许上传文件和删除文件了
          el.showsend = 1; //发起签章按钮
          el.statusTxt = "发起签章中";
        } else if (status === "SENT") {
          let str = currentUserName ? "(" + currentUserName + ")" : "";
          el.statusTxt = el.currentUserShowName + str + "签署中";
          if (
            currentAssigneeUserId &&
            // gladys.gao@philips.com;joe.du@philips.com;michelle.j.shen@philips.com
            currentAssigneeUserId.indexOf(userIds) > -1
          ) {
            el.showsignbutton = 1;
            el.showbpavid = 1;
          }
          if (isApplicant) {
            el.showback = 1;
          }
        } else if (status === "IN_INVALIDING") {
          let str = currentUserName ? "(" + currentUserName + ")" : "";
          el.statusTxt = el.currentUserShowName + str + "确认作废中";
          if (
            currentAssigneeUserId &&
            currentAssigneeUserId.indexOf(userIds) > -1
          ) {
            el.showcancelbutton = 1;
          }
        }
        if (status === "REJECT") {
          el.statusTxt = "已拒签";
        } else if (status === "COMPLETE") {
          el.statusTxt = "已完成";
          if (isApplicant) {
            el.showcancel = 1; //作废按钮
          }
        } else if (status === "REVOKE_CANCEL") {
          el.statusTxt = "已撤回";
        } else if (status === "OVERDUE") {
          el.statusTxt = "逾期未签";
        } else if (status === "IN_SEND_APPROVAL") {
          el.statusTxt = "发送前审批中";
        } else if (status === "SEND_APPROVAL_NOT_PASSED") {
          el.statusTxt = "审批被驳回";
        } else if (status === "INVALID") {
          el.statusTxt = "已作废";
        }
      }
    }
    return dataList;
  }

  convertStatusText(val: any) {
    if (!!!val) return "";
    const dic = {
      DRAFT: "起草中",
      CREATED: "发起签章中",
      SENT: "签署中",
      REJECT: "已拒签",
      REVOKE_CANCEL: "已撤回",
      IN_INVALIDING: "作废中",
      COMPLETE: "已完成",
      INVALID: "已作废",
    };
    return dic[val] || val;
  }

  convertSignStatusText(val: any, contractType: any,isAutoSigned: boolean) {
    if (!!!val) return "";
    const dicGroup = {
      NORMAL: {
        NOT_START: "未开始",
        REJECT: "已拒签",
        BEING_CARRIED: "签署中",
        COMPLETE: "已签署",
        REVOKE_CANCEL: "撤回",
        CANCEL: "取消",
        INVALIDING: "发起作废申明",
        NOTIFICATION: "发送提醒邮件",
      },
      INVALID: {
        NOT_START: "未开始",
        REJECT: "拒绝作废",
        BEING_CARRIED: "签署作废申明中",
        COMPLETE: "已签署作废申明",
      },
    };
    if(isAutoSigned && dicGroup[contractType][val] =='已签署'){
      return '已自动签署';
    }
    return dicGroup[contractType][val] || val;
  }

  roleDisplayNameFilter(val: any) {
    if (!!!val) return "";
    const dic = this.roleMapping;
    return dic[val] || val;
  }

  timelineDot(action: any) {
    const arr = [
      "COMPLETE",
      "NOT_START",
      "REVOKE_CANCEL",
      "CANCEL",
      "INVALIDING",
    ];
    return !arr.includes(action);
  }

  async getHistory() {
    let from = this.from,
      historyId = this.historyId;
    let res: any = {};
    switch (from) {
      // 投标报名
      case "BIDDING":
        res = await this.http.approvalSignUp({ biddingEnrollId: historyId });
        break;
      case "CONTENT":
        // Bindding 内容
        res = await this.http.approvalContent({ biddingContentId: historyId });
        break;
      case "CONTRACT":
        // 价格审批
        res = await this.http.historyContract({ contractId: historyId });
        break;
    }
    const { code, data } = res;
    if (code === "0000") {
      this.historyList = data;
    }
  }

  // currencyChange(value: any, index: any) {
  //   let templateList = this.templateList;
  //   let signDataSource = this.signDataSource;
  //   let currency = signDataSource[index].currency;
  //   let arr = [];
  //   let lastArr = [];
  //   if (arr.length > 0) {
  //     lastArr = arr;
  //   } else {
  //     lastArr = templateList;
  //   }
  //   let disArr = [],
  //     templateInfo: any = {};
  //   for (let i = 0; i < lastArr.length; i++) {
  //     const displayName = lastArr[i].templateDisplayName;
  //     if (displayName.indexOf("经销商签章") > -1) {
  //       disArr.push({
  //         dealerIndex: displayName.indexOf("经销商签章"),
  //         ...lastArr[i],
  //       });
  //     }
  //   }

  //   disArr.sort((a, b) => a.dealerIndex - b.dealerIndex);
  //   templateInfo = disArr[0];

  //   this.signDataSource[index].lastTemplateList = lastArr;
  //   this.signDataSource[index].signWay = templateInfo.templateId;
  //   this.changeDetectorRef.markForCheck();
  //   this.changeDetectorRef.detectChanges();
  //   let params = {
  //     id: signDataSource[index].id,
  //     currency,
  //     templateId: templateInfo.templateId,
  //   };
  //   this.http.createEditSign(params);
  // }

  templateChange(value: any, index: any) {
    const templateId = value;
    const from = this.from;
    const item = this.signDataSource[index];
    let templateList = this.templateList;
    let templateInfo = templateList.find(
      (item) => item.templateId === templateId
    );
    let contracts = item.contracts;
    let params: any = {
      id: item.id,
      templateId: templateId,
    };
    if (contracts.length > 0) {
      for (let i = 0; i < contracts.length; i++) {
        const element = contracts[i];
        element.documentId = null;
        element.documentName = null;
      }
      this.signDataSource[index].contracts = contracts;
      params.contracts = this.signDataSource[index].contracts;
    }
    let defaultdocuments = [];
    if (from !== "CONTRACT") {
      defaultdocuments = [
        {
          documentId: "",
          documentName: "默认模板(不带职位)",
        },
      ];
    }
    let last = [...defaultdocuments, ...templateInfo.documents];
    this.signDataSource[index].selectedItems = [];
    this.signDataSource[index].backupDocuments = JSON.parse(
      JSON.stringify(last)
    );
    // 如果只有一个合同，就默认选中“默认模板”
    if(contracts.length===1&& last.length>0){
      this.signDataSource[index].selectedItems.push(last[0].documentId);
      this.signDataSource[index].contracts[0].documentId = last[0].documentId;
      this.signDataSource[index].contracts[0].documentName = last[0].documentName;
    }
    this.changeDetectorRef.markForCheck();
    this.changeDetectorRef.detectChanges();
    this.http.createEditSign(params);
  }

  documentsChange(documentId: any, indx: any, index: any) {
    let item = this.signDataSource[indx];
    let oldId = this.signDataSource[indx].contracts[index].documentId;
    let backupDocuments = item.backupDocuments;
    let selectedItems = item.selectedItems;
    let documentName = null;
    if(!!!documentId){
      // 清除
      documentName = null;
      documentId = null;
      if(selectedItems[index])selectedItems[index] = null;
    }else{
      // 勾选
      let i = backupDocuments.findIndex(
        (item: any) => item.documentId === documentId
      );
      documentName = backupDocuments[i].documentName;
    }
    if (oldId) {
      let i = selectedItems.findIndex((item: any) => item === oldId);
      selectedItems.splice(i, 1);
    }
    if (documentId) selectedItems.push(documentId);
    backupDocuments.map(i=>i.disabled=false)
    for (let i = 0; i < backupDocuments.length; i++) {
      const element = backupDocuments[i];
      if (selectedItems.includes(element.documentId)) {
        element.disabled = true;
      }
    }
    console.log('backupDocuments',backupDocuments)
    this.signDataSource[indx].selectedItems = selectedItems;
    this.signDataSource[indx].backupDocuments = backupDocuments;
    this.signDataSource[indx].contracts[index].documentId = documentId;
    this.signDataSource[indx].contracts[index].documentName = documentName;
    this.changeDetectorRef.markForCheck();
    this.changeDetectorRef.detectChanges();

    if (!oldId && !documentId) return;
    setTimeout(() => {
      let params = {
        id: item.id,
        contracts: this.signDataSource[indx].contracts,
      };
      this.http.createEditSign(params);
    }, 100);
  }

  async summaryChange($event: any, index: any) {
    const item = this.signDataSource[index];
    let params = {
      id: item.id,
      ifRelatedOrderSummary: $event,
      relatedOrderSummaryIds: "",
    };
    this.signDataSource[index].relatedOrderSummaryIdsArray = [];
    await this.http.createEditSign(params);
    await this.getContractSignList();
  }

  async summarySelectChange($event: any, index: any) {
    const item = this.signDataSource[index];
    let params = {
      id: item.id,
      ifRelatedOrderSummary: true,
      relatedOrderSummaryIds: $event.join(","),
    };
    this.signDataSource[index].relatedOrderSummaryIdsArray = $event;
    await this.http.createEditSign(params);
    await this.getContractSignList();
  }

  async getAcount(type: any) {
    this.firstAccount = false;
    if (this.from !== "CONTRACT") return;
    let params = {};
    if (type === "dealerName") {
      params = {
        dealerName: this.dealerName,
      };
      const res = await this.http.getDealerAcount(params);
      const { code, data } = res;
      if (code === "0000") {
        this.dealerBestSignAccount = data.dealerAccount
          ? data.dealerAccount
          : "";
        this.dealerRepresentativeBestSignAccount = data.dealerContactorAccount
          ? data.dealerContactorAccount
          : "";
      }
    } else {
      console.log('getAccount')
    }
  }
  /**
   * 获取签章模板列表
   */
  async getFlowTemplateList() {
    let type = "";
    if (this.from === "CONTRACT") {
      type = "CONTRACT";
    } else if (this.from === "CONTENT") {
      type = "CONTENT";
    } else {
      type = "BIDDING";
    }
    let contractId = this.contractId;
    const res = await this.http.getFlowTemplate(type, contractId, this.contractType);
    const { code, data } = res;
    if (code === "0000") {
      console.log('this.contractType',this.contractType)
      console.log('template data',data)
      this.templateList = data;
      if (data.length <= 0) {
        this.signSpinning = false;
      }
    }
  }
  /**
   * 获取签章流程列表
   */
  async getContractSignList() {
    if (!this.contractId) return false;
    let from = this.from;
    const res = await this.http.getContractSignList(from, this.contractType, this.contractId);
    const { code, data, msg } = res;
    if (code === "0000") {
      let lastData = this.judgeStatus(data);
      this.signDataSource = lastData;
      this.signSpinning = false;
    } else {
      this.notification.error(msg, "");
    }
  }

  async getFlowInfo(id: any, index: any) {
    this.signSpinning = true;
    const res = await this.http.getFlowInfo(this.from, id);
    const { code, data, msg } = res;
    if (code === "0000") {
      let resetData = this.judgeStatus([data]);
      this.signDataSource[index] = resetData[0];
      this.signSpinning = false;
    } else {
      this.notification.error(msg, "");
    }
  }

  /**
   * 创建签章流程
   */
  async createSignProcess() {
    if(this.showWarning){
      this.modal.error({
        nzTitle: '提示',
        nzContent: '此申请中已经存在已签署正本合同或在途签署申请，请确认是否需要新增签章流程！',
        nzOnOk: async ()=>{
          await this.doCreateSignProcess()
          return true
        },
        nzOkText:"确定",
        nzCancelText:"取消"
      })
    }else{
      await this.doCreateSignProcess()
    }
  }
  async doCreateSignProcess() {
    let dealerBestSignAccount = this.dealerBestSignAccount,
      dealerRepresentativeBestSignAccount =
        this.dealerRepresentativeBestSignAccount,
        freightForwarderName = this.freightForwarderName,
        freightForwarderBestSignAccount = this.freightForwarderBestSignAccount,
        freightForwarderRepresentativeBestSignAccount = this.freightForwarderRepresentativeBestSignAccount,
        freightForwarderRepresentativePos = this.freightForwarderRepresentativePos,
        freightForwarderRepresentativeName = this.freightForwarderRepresentativeName,
        ETADate = this.ETADate,
        pm = this.pm;
    let from = this.from;
    // if (!dealerAccount) {
    //   return this.notification.error("请输入或选择经销商账号(邮箱)", "");
    // }
    // if (!dealerRepresentativeName) {
    //   return this.notification.error("请输入经销商签字人姓名", "");
    // }
    // if (!dealerRepresentativeBestSignAccount) {
    //   return this.notification.error("请输入或选择经销商签字人账号(邮箱)", "");
    // }
    let params = {
      businessId: this.contractId,
      businessType: from,
      dealerName: this.dealerName,
      dealerBestSignAccount: dealerBestSignAccount,
      dealerRepresentativeBestSignAccount,
      freightForwarderName,
      freightForwarderBestSignAccount,
      freightForwarderRepresentativeBestSignAccount,
      freightForwarderRepresentativePos,
      freightForwarderRepresentativeName,
      ETADate,
      pm,
      // currency: this.contractCurrency === "CNY" ? "CNY" : "USD",
      modality: this.orderModality,
      isCancelAgreement: false,
      ifRelatedOrderSummary: false,
      agreementApplyId: "",
      relatedOrderSummaryIds: "",
      contractType: this.contractType,
    };
    const res = await this.http.createEditSign(params);
    const { code, data } = res;
    // this.spinning = false
    if (code === "0000") {
      this.getContractSignList();
      this.notification.success("创建签章流程成功", "");
    }
  }

  /**
   * 删除签章流程
   */
  async signDel(index: any, id: any) {
    const that = this;
    this.modal.confirm({
      nzTitle: "确认删除签章流程吗？",
      nzOkText: "确定",
      nzCancelText: "取消",
      nzStyle: { top: "150px" },
      nzOnOk: () =>
        new Promise((resolve, reject) => {
          that.signSpinning = true;
          that.http.deleteContractSign(id).then((res) => {
            const { code, data } = res;
            that.signSpinning = false;
            if (code === "0000") {
              resolve("1");
              that.getContractSignList();
              that.notification.success("提示", "删除签章流程成功！");
            } else {
              reject();
            }
          });
        }).catch(() => console.log("Oops errors!")),
    });
  }

  async dealerAccountChange(type: string, account: any, id: any) {
    let params = {
      id,
    };
    params[type] = account;
    await this.http.createEditSign(params);
  }
  async freightForwarderChange(account: any, id: any) {
    let params = {
      id,
      freightForwarderName: account,
    };
    await this.http.createEditSign(params);
  }
  async freightForwarderBestSignChange(account: any, id: any) {
    let params = {
      id,
      freightForwarderBestSignAccount: account,
    };
    await this.http.createEditSign(params);
  }
  async freightForwarderRepresentativeSignChange(account: any, id: any) {
    let params = {
      id,
      freightForwarderRepresentativeBestSignAccount: account,
    };
    await this.http.createEditSign(params);
  }
  /**
   * 发起签章
   */
  async signSign(index: any, id: any) {
    let item = this.signDataSource[index];
    // let contractCurrency = this.contractCurrency;
    let contracts = item.contracts||[],
      isCancelAgreement = item.isCancelAgreement,
      agreements = item.agreements||[],
      ifRelatedOrderSummary = item.ifRelatedOrderSummary,
      relatedOrderSummaries = item.relatedOrderSummaries||[];
    if (contracts.length <= 0) {
      return this.notification.error("请选择需要签署的文件", "");
    }
    console.log(`signSign - item:${item} - contracts :${contracts}`);
    if (isCancelAgreement && agreements.length <= 0) {
      return this.notification.error(
        "请选择取消/赔偿协议，如果不选择协议，请选择否",
        ""
      );
    }

    if (ifRelatedOrderSummary && relatedOrderSummaries.length <= 0) {
      return this.notification.error(
        "请选择关联合同概要表，若不选择关联合同概要表，请选择否",
        ""
      );
    }

    // if (!dealerBestSignAccount) {
    //   return this.notification.error("请输入或选择经销商盖章人账号(邮箱)", "");
    // }
    // if (!dealerRepresentativeBestSignAccount) {
    //   return this.notification.error("请输入或选择经销商签字人账号(邮箱)", "");
    // }

    this.signSpinning = true;
    // 发起签章
    let sendParams = {
      id,
      callback: window.location.href,
    };
    const res = await this.http.sendContractToBestSign(sendParams);
    const { code, data, msg } = res;
    this.signSpinning = false;
    if (code === "0000") {
      window.location.href = data.url + "&sign=1";
    } else {
      this.notification.error(msg, "");
    }
  }

  /**
   * 签署合同
   */
  async signAdminSign(index: any, from: any, id: any) {
    const that = this;
    this.modal.confirm({
      nzTitle: "确认签章吗？",
      nzOkText: "确定",
      nzCancelText: "取消",
      nzOnOk: () =>
        new Promise((resolve, reject) => {
          that.signSpinning = true;
          that.http.signFlow(id, from).then((res) => {
            const { code, data, msg } = res;
            if (code === "0000") {
              resolve("1");
              that.notification.success("提示", "签署成功");
              setTimeout(() => {
                that.refreshFlowInfo(id, index);
              }, 1500);
            } else {
              reject();
              this.notification.error(msg, "");
              that.signSpinning = false;
            }
          });
        }).catch(() => console.log("Oops errors!")),
    });
  }

  /**
   * 作废签章确认
   */
  async signAdminConfirm(index, from, id) {
    const that = this;
    this.modal.confirm({
      nzTitle: "确认作废签章流程吗？",
      nzOkText: "确定",
      nzCancelText: "取消",
      nzOnOk: () =>
        new Promise((resolve, reject) => {
          that.signSpinning = true;
          that.http.confirmCancel(id, from).then((res) => {
            const { code, data, msg } = res;

            if (code === "0000") {
              resolve("1");
              that.notification.success("提示", `${from}已确认作废`);
              that.refreshFlowInfo(id, index);
            } else {
              reject();
              this.notification.error(msg, "");
              that.signSpinning = false;
            }
          });
        }).catch(() => console.log("Oops errors!")),
    });
  }

  /**
   * 撤回签章
   */
  async signBack(index: any, id: any) {
    this.modalType = "signBack";
    this.modalTitle = "请输入撤回理由";
    this.modalVisible = true;
    this.reasonText = "";
    this.modalIndex = index;
    this.modalId = id;
  }

  /**
   * 驳回签章
   */
  signVoid(index: any, id: any, currentUserRole: any) {
    this.modalType = "signVoid";
    this.modalTitle = "请输入驳回原因";
    this.modalVisible = true;
    this.reasonText = "";
    this.modalIndex = index;
    this.modalId = id;
    this.modalRole = currentUserRole;
  }

  /**
   * 作废签章
   */
  async signCancel(index: any, id: any) {
    this.modalType = "signCancel";
    this.modalTitle = "确认作废";
    this.modalVisible = true;
    this.reasonText = "";
    this.modalIndex = index;
    this.modalId = id;
    this.reasonLabel = "";
    this.cancelBackup = "";
    let cancelOptions = this.cancelOptions;
    if (cancelOptions.length > 0) {
      this.modalVisible = true;
    } else {
      this.signSpinning = true;
      this.ownHttp
        .get(
          `/act/ecom/dictData/queryDrop?dictGroup=BESTSIGN_REJECT_REASON_GROUP`
        )
        .subscribe((res) => {
          this.signSpinning = false;
          if (res.code === "0000") {
            this.cancelOptions = res.data;
            setTimeout(() => {
              this.modalVisible = true;
            }, 0);
          } else {
            this.notification.error(res.msg, "");
          }
        });
    }

    // this.modalRole = currentUserRole;
    // const that = this;
    // this.modal.confirm({
    //   nzTitle: "确认作废签章流程吗？",
    //   nzOkText: "确定",
    //   nzCancelText: "取消",
    //   nzOnOk: () =>
    //     new Promise((resolve, reject) => {
    // that.http.contractSignOperation(id, 2, "").then((res) => {
    //   const { code, data, msg } = res;
    //   that.signSpinning = false;
    //   if (code === "0000") {
    //     resolve("1");
    //     that.notification.success("提示", "已发起作废流程");
    //     that.refreshFlowInfo(id, index);
    //   } else {
    //     reject();
    //     this.notification.error(msg, "");
    //     that.signSpinning = false;
    //   }
    // });
    //     }).catch(() => console.log("Oops errors!")),
    // });
  }

  reasonLabel: any = "";

  handleModalOk() {
    const that = this;
    const index = this.modalIndex,
      id = this.modalId,
      reasonText = this.reasonText,
      modalType = this.modalType,
      modalRole = this.modalRole;
    // if (!reasonText) {
    //   return this.notification.error("请选择或填写原因")
    // }
    if (modalType === "signBack") {
      if (reasonText) {
        this.signSpinning = true;
        this.uploadLoading = true;
        this.http
          .contractSignOperation(id, 4, reasonText)
          .then((res) => {
            const { code, data, msg } = res;
            this.signSpinning = false;
            this.uploadLoading = false;
            if (code === "0000") {
              that.notification.success("撤回成功", "");
              that.modalVisible = false;
              setTimeout(() => {
                that.refreshFlowInfo(id, index);
              }, 1500);
            } else {
              this.notification.error(msg, "");
              that.signSpinning = false;
            }
          })
          .catch((res) => {
            this.signSpinning = false;
            this.uploadLoading = false;
          });
      } else {
        this.message.error("请输入撤回理由");
      }
    } else if (modalType === "signVoid") {
      if (reasonText) {
        this.signSpinning = true;
        this.uploadLoading = true;
        this.http
          .voidFlow(id, reasonText, modalRole)
          .then((res) => {
            const { code, data, msg } = res;
            this.signSpinning = false;
            this.uploadLoading = false;
            if (code === "0000") {
              this.notification.success("发送成功", "");
              this.modalVisible = false;
              this.refreshFlowInfo(id, index);
            } else {
              this.notification.error(msg, "");
            }
          })
          .catch((res) => {
            this.signSpinning = false;
            this.uploadLoading = false;
          });
      } else {
        this.message.error("请输入驳回原因");
      }
    } else if (modalType === "signCancel") {
      let reasonLabel = this.reasonLabel;
      let cancelBackup = this.cancelBackup;
      let reason = "";
      if (reasonLabel === "best_sign_reject_reason_other") {
        if (!cancelBackup) {
          return this.message.error("请输入作废理由");
        }
        reason = cancelBackup;
      } else {
        reason = reasonText;
      }
      this.signSpinning = true;
      this.uploadLoading = true;
      this.http
        .contractSignOperation(id, 2, reason)
        .then((res) => {
          const { code, data, msg } = res;
          this.signSpinning = false;
          this.uploadLoading = false;
          if (code === "0000") {
            this.notification.success("提示", "已发起作废流程");
            this.modalVisible = false;
            this.refreshFlowInfo(id, index);
          } else {
            this.notification.error(msg, "");
          }
        })
        .catch((res) => {
          this.signSpinning = false;
          this.uploadLoading = false;
        });
    }
  }

  reasonChange($event) {
    let reason = this.cancelOptions.find((item) => {
      return item.code === $event;
    }).label;
    this.reasonText = reason;
  }

  delContract(record: any, index: any, flowId: any) {
    const id = record.id;
    const that = this;
    this.modal.confirm({
      nzTitle: "确认删除该合同吗？",
      nzOkText: "确定",
      nzCancelText: "取消",
      nzOnOk: () =>
        new Promise((resolve, reject) => {
          that.signSpinning = true;
          that.http.delContractFile(id).then((res) => {
            const { code, data, msg } = res;
            if (code === "0000") {
              resolve("1");
              that.notification.success("删除成功", "");
              that.getFlowInfo(flowId, index);
            } else {
              reject();
              this.notification.error(msg, "");
              that.signSpinning = false;
            }
          });
        }).catch(() => console.log("Oops errors!")),
    });
  }

  /**
   * 下载签章前的原始合同
   */
  signDownloadAll(flowId: any) {
    this.http
      .downloadAllContractsFromBestSign(flowId)
      .then((response) => {
        let bstr = window.atob(response.data.data);
        let n = bstr.length;
        let u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: `application/zip` });
        const fileURL = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = fileURL;
        link.setAttribute("download", response.data.fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.notification.success("下载签署件成功", "");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  /**
   * 下载签章后的合同
   */
  signDown(record: any) {
    this.http
      .downloadContractFromBestSign(record.id)
      .then((response) => {
        let bstr = window.atob(response.data.data);
        let n = bstr.length;
        let u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        let blob = new Blob([u8arr], { type: `application/pdf` });
        const fileURL = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = fileURL;
        link.setAttribute("download", response.data.fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.notification.success("下载成功", "");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  signInvalidDown(flowId: any) {
    this.http
      .downloadInvalidContractFromBestSign(flowId)
      .then((response) => {
        let bstr = window.atob(response.data.data);
        let n = bstr.length;
        let u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        let blob = new Blob([u8arr], { type: `application/pdf` });
        const fileURL = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = fileURL;
        link.setAttribute("download", response.data.fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.notification.success("下载成功", "");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  clickset(type: any, index: any, flowId: any, id: any) {
    this.uploadType = type;
    this.uploadIndex = index;
    this.flowId = flowId;
    this.fileId = id;
  }

  /**
   * 选择文件后上传
   */
  beforeUpload = (file: any) => {
    const formData = new FormData();
    let uploadType = this.uploadType,
      flowId = this.flowId,
      fileId = this.fileId,
      uploadIndex = this.uploadIndex;
    // 正常的文件上传
    formData.append("file", file);
    this.signSpinning = true;
    if (uploadType === "contract") {
      this.http.uploadContractFile(formData, flowId).then((res) => {
        const { code, data, msg } = res;
        if (code === "0000") {
          this.notification.success("上传成功", "");
          this.getFlowInfo(flowId, uploadIndex);
        } else {
          this.notification.error(msg, "");
        }
      });
    } else if (uploadType === "support") {
      this.http.uploadSupportFile(formData, fileId).then((res) => {
        const { code, data, msg } = res;
        if (code === "0000") {
          this.notification.success("上传成功", "");
          this.getFlowInfo(flowId, uploadIndex);
        } else {
          this.notification.error(msg, "");
        }
      });
    }
    return false;
  };

  downloadFile(data: any, type: any) {
    let url = "",
      fileName = "";
    if (type === "modal") {
      url = `/act/system/download/${data.fileId}`;
    } else {
      url = `/act${data.fileUrl}`;
    }
    fileName = data.fileName;
    this.ownHttp
      .get(url, {
        responseType: "blob",
      })
      .subscribe((data) => {
        saveAs(data, fileName);
      });
    // let a = document.createElement("a");
    // a.setAttribute("href", url);
    // a.setAttribute("download", url);
    // document.body.appendChild(a);
    // a.click();
    // document.body.removeChild(a);
  }

  getDotColor(action: any) {
    let set = {
      NOT_START: "#A3A3A3",
      REJECT: "red",
      BEING_CARRIED: "#ff9100",
      COMPLETE: "#1677FF",
      CANCEL: "#bdbdbd",
    };
    return set[action];
  }

  validDefaultSelect(item: any, currency: any) {
    let result = [];
    let ruleArr = item.templateRule ? JSON.parse(item.templateRule) : [];
    let totalPrice = parseFloat(this.info.contractInfo.totalContractPrice);
    if (ruleArr.length > 0) {
      result = this.deepInCalc(ruleArr, currency, totalPrice, []);
    }
    return result.length > 0;
  }

  deepInCalc(arr: any, currency: any, totalPrice: any, lastArr: any) {
    for (let i = 0; i < arr.length; i++) {
      const el = arr[i];
      let flag = false;
      if (el.key === "currency") {
        flag = this.calculateRule(currency, el.value, el.action);
      } else if (el.key === "contractTotalPrice") {
        flag = this.calculateRule(totalPrice, el.value, el.action);
      }
      if (flag) {
        if (el.rules && el.rules.length) {
          this.deepInCalc(el.rules, currency, totalPrice, lastArr);
        } else {
          lastArr.push(el);
        }
      }
    }
    return lastArr;
  }

  calculateRule(val1: any, val2: any, operator: any) {
    switch (operator) {
      case "ge":
        return val1 >= val2;
      case "gt":
        return val1 > val2;
      case "le":
        return val1 <= val2;
      case "lt":
        return val1 < val2;
      case "eq":
        return val1 == val2;
      case "ne":
        return val1 != val2;
      default:
        return true;
      // case 'between':
      // case 'notBetween':
      // case 'like':
      // case 'notLike':
    }
  }

  pushData(arr: any, type: any) {
    let result = [];
    if (arr && arr.length > 0) {
      for (let i = 0; i < arr.length; i++) {
        const el = arr[i];
        result.push({
          id: el.id,
          fileId: el.fileId,
          fileName: el.fileName,
          fileUrl: el.filePath,
          fileType: type,
        });
      }
    }
    return result;
  }

  // resetFileList() {
  //   let info = this.info,
  //     from = this.from;
  //   this.firstInfo = false;
  //   if (from === "BIDDING") {
  //     let supportFileList = info.supportFileList;
  //     let arr = this.pushData(supportFileList, "招标支持文件");
  //     this.fileList = [...arr];
  //   } else if (from === "CONTENT") {
  //     // 招标文件
  //     let inviteBiddingFileList = info.inviteBiddingFileList,
  //       enterBiddingFileList = info.enterBiddingFileList,
  //       cpFileList = info.cpFileList,
  //       otherFileList = info.otherFileList;
  //     let arr = this.pushData(inviteBiddingFileList, "招标文件");
  //     let arr1 = this.pushData(enterBiddingFileList, "投标文件");
  //     let arr2 = this.pushData(cpFileList, "CP文件");
  //     let arr3 = this.pushData(otherFileList, "其他文件");
  //     this.fileList = [...arr, ...arr1, ...arr2, ...arr3];
  //   } else if (from === "CONTRACT") {
  //     // let contractFileList = info.contractSignInfo.contractFile,
  //     let zslNotSignedFile = info.contractSignInfo.zslNotSignedFile;
  //     // priceViewerFileList = info.priceViewerFileList,
  //     // otherFiles = info.orderSummaryInfo.otherInfo,
  //     // sofonFiles = info.orderSummaryInfo.sofonFile;
  //     // let arr = this.pushData(contractFileList, "合同文件");
  //     let arr1 = this.pushData(zslNotSignedFile, "未签署合同文件");
  //     // let arr2 = this.pushData(priceViewerFileList, "合同审核附件");
  //     // let arr3 = this.pushData(otherFiles, " 进单附件");
  //     // let arr4 = this.pushData(sofonFiles, "Sofon附件");
  //     this.fileList = [...arr1];
  //   }
  // }

  handleMenuClick(data: any, index: any, flowId: any) {
    if (data.el.id === "choosefile1") {
      this.handleChooseFile(index, flowId);
    }
  }

  handleChooseFile(index: any, flowId: any) {
    let contractSignFileList = this.contractSignFileList;
    if (contractSignFileList.length <= 0) {
      return this.notification.error(
        "没有待签章的合同文件",
        "请上传合同文件并点击保存后再选择合同文件"
      );
    }
    this.uploadIndex = index;
    this.flowId = flowId;
    this.mapOfCheckedId = {};
    this.uploadVisible = true;
  }

  handleOk() {
    const mapOfCheckedId = this.mapOfCheckedId,
      flowId = this.flowId,
      contractSignFileList = this.contractSignFileList,
      selectedRowKeys = [],
      uploadIndex = this.uploadIndex;
    let lastList = contractSignFileList.filter(
      (item) => mapOfCheckedId[item.id]
    );
    for (let i = 0; i < lastList.length; i++) {
      const el = lastList[i];
      let name = el.fileName;
      let extension = name.substring(name.lastIndexOf(".") + 1);
      if (extension != "pdf") {
        return this.notification.error(
          "暂时无法使用其他文件，请选择pdf文件",
          ""
        );
      }
    }

    for (let i = 0; i < lastList.length; i++) {
      const el = lastList[i];
      selectedRowKeys.push(el.fileId);
    }
    this.uploadLoading = true;
    this.http.SaveFilesToFlow(flowId, selectedRowKeys).then((res) => {
      const { code, data, msg } = res;
      if (code === "0000") {
        this.uploadVisible = false;
        this.uploadLoading = false;
        this.getFlowInfo(flowId, uploadIndex);
      } else {
        this.uploadLoading = false;
        this.notification.error(msg ? msg : data, "");
      }
    });
  }

  refreshFlowInfo(flowId: any, index: any) {
    this.signSpinning = true;
    this.http.refreshFlowFromBestSign(flowId).then((res) => {
      const { code, data, msg } = res;
      if (code === "0000") {
        this.getFlowInfo(flowId, index);
      } else {
        this.signSpinning = false;
        this.notification.error(msg ? msg : data, "");
      }
    });
  }

  signSyncContract(flowId: any) {
    this.signSpinning = true;
    this.http.syncToContractFile(flowId).then((res) => {
      const { code, data, msg } = res;
      this.signSpinning = false;
      if (code === "0000") {
        this.refreshDetail.emit();
        this.firstInfo = true;
        this.notification.success(
          "同步成功",
          "数据已同步，需要刷新页面，请耐心等待"
        );
      } else {
        this.notification.error(msg ? msg : data, "");
      }
    });
  }

  goJump(item: any, type: any) {
    console.log(item);
    if (type === "agreements") {
      this.router.navigate(["/special-approval/request", item.id]);
    } else {
      let data = item.applyDto;
      const url = "/order-v3/contractSignDetail";
      this.routerExt.navigateWithNewWindow([url], {
        queryParams: {
          id: data.id,
          needFileType: "contract",
          processInstanceTaskId: data.processInstanceTaskId,
          taskStatus: data.taskStatus,
          procInstId: data.procInstId,
          flag: 1,
          // zslSignSupplement: this.formData.zslSignSupplement,
          signatureStatus: "signatureStatus",
          sign: 1,
        },
      });
    }
  }
}
