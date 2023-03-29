import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { Router } from "@angular/router";
import { RouterExtendService } from "@app/modern-themes/services/router-extend.service";
import {
  FileService,
  HttpService,
  UtilityService,
  DictService,
} from "@core/services";
import { codeString } from "assets/js/tools";
import { NzMessageService } from "ng-zorro-antd";

export interface TreeNodeInterface {
  key: string;
  taskStatus: string;
  referenceId: string;
  applicant: string;
  opportunityId: string;
  marketBundleName: string;
  bidderName: string;
  hospitalName: string;
  dealerName: string;
  businessModel: string;
  oitMode: string;
  productVerification: string;
  applyType: string;
  id: string;
  processInstanceTaskId: string;
  procInstId: string;
  processStatus: string;

  level: number;
  expand: boolean;
  isCheck: null;
  children?: TreeNodeInterface[];
}

@Component({
  selector: "cos-my-view-list",
  templateUrl: "list.component.html",
  styleUrls: ["list.component.scss"],
})
export class myViewListComponent implements OnInit {
  @Input() tableData: [];
  @Input() total: 0;
  @Input() loading: any = false;
  @Input() flag: any;

  @Input() isTask = false;
  @Input() isFirstLoad: boolean = false;

  @Output() pageChange = new EventEmitter<any>();
  @Output() setLoading = new EventEmitter<boolean>();

  mapOfExpandedData: { [key: string]: TreeNodeInterface[] } = {};

  pageParams = {
    pageNo: 1,
    pageSize: 10,
  };

  userList = [];
  public entryModeList = [];

  constructor(
    private router: Router,
    private routerExt: RouterExtendService,
    private http: HttpService,
    private message: NzMessageService,
    private changeDetectorRef: ChangeDetectorRef,
    private fileService: FileService,
    public utils: UtilityService,
    private dictService: DictService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["tableData"]) {
      this.tableData = changes["tableData"].currentValue;
      this.tableData.forEach((item) => {
        this.mapOfExpandedData[item["key"]] = this.convertTreeToList(item);
      });
    }
  }

  collapse(
    array: TreeNodeInterface[],
    data: TreeNodeInterface,
    $event: boolean
  ): void {
    if ($event === false) {
      if (data.children) {
        data.children.forEach((d) => {
          const target = array.find((a) => a.key === d.key)!;
          target.expand = false;
          this.collapse(array, target, false);
        });
      } else {
        return;
      }
    }
  }

  convertTreeToList(root: object): TreeNodeInterface[] {
    const stack: any[] = [];
    const array: any[] = [];
    const hashMap = {};
    stack.push({ ...root, level: 0, expand: true });

    while (stack.length !== 0) {
      const node = stack.pop();
      this.visitNode(node, hashMap, array);
      if (node.children) {
        for (let i = node.children.length - 1; i >= 0; i--) {
          stack.push({
            ...node.children[i],
            level: node.level + 1,
            expand: true,
            parent: node,
          });
        }
      }
    }

    return array;
  }

  visitNode(
    node: TreeNodeInterface,
    hashMap: { [key: string]: any },
    array: TreeNodeInterface[]
  ): void {
    if (!hashMap[node.key]) {
      hashMap[node.key] = true;
      array.push(node);
    }
  }

  ngOnInit() {
    // this.getTableData()
    this.getEntryModeList();
  }

  //重置分页
  resetPage() {
    this.pageParams = {
      pageNo: 1,
      pageSize: 10,
    };
  }

  operate(data: any) {
    data.taskStatus = data.taskStatus ? data.taskStatus : data.processStatus;
    let applyType = data.applyType;
    let orderType = ["OIT_MAIN", "OIT_SUB"];
    let biddingType = ["BIDDING"];

    if (orderType.includes(applyType)) {
      let url = "";
      let orderExamine = [
        "ecos_oit_deal_countersign",
        "ecos_oit_deal_sales",
        "ecos_oit_deal_sub_process",
        "ecos_oit_deal_done",
        "ecos_oit_deal_canceled",
      ];
      let orderOa = ["ecos_oit_deal_oa"];
      let orderv3 = [
        "ecos_oit_deal_resubmit",
        "ecos_oit_deal_submit",
        "ecos_status_draft",
      ];
      let contract = ["ecos_oit_order_submit", "ecos_oit_order_resubmit"];
      let contractExamine = [
        "ecos_oit_order_oa",
        "ecos_oit_order_dm",
        "ecos_oit_order_zsl",
        "ecos_oit_order_install_terms",
        "ecos_oit_order_logistics_terms",
        "ecos_oit_order_nstd_countersign",
        "ecos_oit_order_site_terms",
        "ecos_oit_order_install_sup",
        "ecos_oit_order_sp_cop_leader",
        "ecos_oit_order_sp_cluster_bp",
        "ecos_oit_order_sp_countersign",
        "ecos_oit_order_sp_cfc_leader",
        "ecos_oit_order_payment_terms",
        "ecos_oit_order_payment_sup",
        "ecos_oit_order_rm",
        "ecos_oit_order_cancel_oa",
        "ecos_oit_order_cancel_dm",
        "ecos_oit_order_canceled",
      ];
      let ordersummary = [
        "ecos_oit_order_os_input",
        "ecos_oit_order_os_finance",
        "ecos_oit_order_os_finance_bp",
      ];
      let contractSign = ["ecos_oit_order_sign"];
      let oitcomplete = [
        "ecos_oit_order_upload",
        "ecos_oit_order_done",
        "ecos_oit_order_change_approval",
        "ecos_oit_order_change_submit",
        "ecos_oit_order_change_resubmit",
        "ecos_oit_order_change_first_approval",
        "ecos_oit_order_change_second_approval",
      ];
      if (orderExamine.includes(data.taskStatus)) {
        url = "/order-v3/orderExamine";
      } else if (orderOa.includes(data.taskStatus)) {
        url = "/order-v3/orderOa";
      } else if (orderv3.includes(data.taskStatus)) {
        url = "/order-v3";
      } else if (contract.includes(data.taskStatus)) {
        url = "/order-v3/contract";
      } else if (contractExamine.includes(data.taskStatus)) {
        url = "/order-v3/contractExamine";
      } else if (ordersummary.includes(data.taskStatus)) {
        url = "/order-v3/ordersummary";
      } else if (contractSign.includes(data.taskStatus)) {
        url = "/order-v3/contractSign";
      } else if (oitcomplete.includes(data.taskStatus)) {
        url = "/order-v3/oitcomplete";
      }
      this.routerExt.navigateWithNewWindow([url], {
        queryParams: {
          id: data.id,
          flag: this.flag,
          processInstanceTaskId: data.processInstanceTaskId,
          taskStatus: data.taskStatus,
          procInstId: data.procInstId,
          processStatus: data.processStatus,
        },
      });
    } else if (biddingType.includes(applyType)) {
      if (data.processStatus === "ecos_status_draft") {
        this.routerExt.navigateWithNewWindow(["/bidding-v3"], {
          queryParams: {
            id: data.id,
            referenceId: data.referenceId,
            taskStatus: data.taskStatus,
          },
        });
      } else {
        this.routerExt.navigateWithNewWindow(["/bidding-v3", data.id], {
          queryParams: {
            referenceId: data.referenceId,
            processInstanceTaskId: data.processInstanceTaskId,
            procInstId: data.procInstId,
            processStatus: data.processStatus,
            taskStatus: data.taskStatus,
            fromTask: this.isTask,
          },
        });
      }
      return;
    } else if (applyType === 'PREBOOK') {
      if (data.processStatus === "ecos_status_draft") {
        this.routerExt.navigateWithNewWindow(["/prebook-v3"], {
          queryParams: {
            id: data.id,
            referenceId: data.referenceId,
            taskStatus: data.taskStatus,
          },
        });
      } else {
        this.routerExt.navigateWithNewWindow(["/prebook-v3", data.id], {
          queryParams: {
            processStatus: data.processStatus,
            taskStatus: data.taskStatus,
            procInstId: data.procInstId,
            processInstanceTaskId: data.processInstanceTaskId,
            fromTask: this.isTask
          },
        });
      }
    } else {
      this.message.create("error", "不支持的申请类型:" + applyType);
    }
  }

  changePageIndex(pageNo: number) {
    if (pageNo == 0) {
      pageNo = 1;
    }
    this.pageParams.pageNo = pageNo;
    this.loading = true;
    this.setLoading.emit(this.loading);
    this.pageChange.emit(this.pageParams);
  }

  changePageSize(pageSize: number) {
    // console.log('pageSize', pageSize);
    this.pageParams.pageSize = pageSize;
    this.loading = true;
    this.setLoading.emit(this.loading);
    this.pageChange.emit(this.pageParams);
  }

  // 进单模式
  public getEntryModeList() {
    this.dictService.dictData("ENTRY_MODEL").subscribe((dictData) => {
      this.entryModeList = dictData.map(({ code, label }) => ({ code, label }));
    });
  }

  //翻译进单模式
  ProOitModeType(e: any) {
    for (let i = 0; i < this.entryModeList.length; i++) {
      if (this.entryModeList[i].code === e) {
        return this.entryModeList[i].label;
      }
    }
    return e;
  }

  /*********** 一期跳转操作 Start  *********/
  // 进单oa and 场地审核
  goToPreorderaudit(item) {
    this.routerExt.navigateWithNewWindow(["/pre-order/audit"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: item.operation ? this.flag : 1,
        status: item.taskStatus,
        state: item.taskStatus,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }
  goToApplyTenderModif(item) {
    if (item.applyType === "ZBSQ") {
      this.routerExt.navigateWithNewWindow(["/bidding/apply-tender-modif"], {
        skipLocationChange: false,
        queryParams: {
          id: codeString(item.id),
          flag: item.operation ? this.flag : 1,
          processInstanceTaskId: item.processInstanceTaskId,
          procInstId: item.procInstId,
        },
      });
    } else {
      this.routerExt.navigateWithNewWindow(["/pre-order/modifs"], {
        skipLocationChange: false,
        queryParams: {
          id: codeString(item.id),
          flag: item.operation ? this.flag : 1,
          edit: true,
          processInstanceTaskId: item.processInstanceTaskId,
          procInstId: item.procInstId,
        },
      });
    }
  }

  goToBid(item) {
    if (item.taskStatus == "2CKBZZ") {
      this.routerExt.navigateWithNewWindow(["/bidding/bid"], {
        skipLocationChange: false,
        queryParams: {
          id: codeString(item.id),
          flag: 1,
          status: item.taskStatus,
          processInstanceTaskId: item.processInstanceTaskId,
          procInstId: item.procInstId,
        },
      });
    } else {
      this.routerExt.navigateWithNewWindow(["/bidding/bid"], {
        skipLocationChange: false,
        queryParams: {
          id: codeString(item.id),
          flag: item.operation ? this.flag : 1,
          status: item.taskStatus,
          processInstanceTaskId: item.processInstanceTaskId,
          procInstId: item.procInstId,
        },
      });
    }
  }

  goToBid2(item) {
    if (item.taskStatus == "2CKBZZ") {
      this.routerExt.navigateWithNewWindow(["/bidding/bid"], {
        skipLocationChange: false,
        queryParams: {
          id: codeString(item.id),
          flag: 1,
          status: item.taskStatus,
          processInstanceTaskId: item.processInstanceTaskId,
          procInstId: item.procInstId,
        },
      });
    } else {
      this.routerExt.navigateWithNewWindow(["/bidding/bid"], {
        skipLocationChange: false,
        queryParams: {
          id: codeString(item.id),
          flag: 1,
          status: item.taskStatus,
          processInstanceTaskId: item.processInstanceTaskId,
          procInstId: item.procInstId,
        },
      });
    }
  }

  goToWinningBid2(item) {
    this.routerExt.navigateWithNewWindow(["/bidding/winning"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: 1,
        status: item.taskStatus,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }

  goToWinningBid(item) {
    this.routerExt.navigateWithNewWindow(["/bidding/winning"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: item.operation ? this.flag : 1,
        status: item.taskStatus,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }

  goToSupportUp(item) {
    this.routerExt.navigateWithNewWindow(["/bidding/support-up"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: item.operation ? this.flag : 1,
        status: item.taskStatus,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }

  goTenderreview(item) {
    if (item.taskStatus === "DSWYSH") {
      this.routerExt.navigateWithNewWindow(["/bidding/tender-review"], {
        skipLocationChange: false,
        queryParams: {
          id: codeString(item.id),
          status: item.taskStatus,
          flag: item.operation ? this.flag : 1,
          processInstanceTaskId: item.processInstanceTaskId,
          procInstId: item.procInstId,
        },
      });
    } else {
      this.routerExt.navigateWithNewWindow(["/bidding/tender-review-sale"], {
        skipLocationChange: false,
        queryParams: {
          id: codeString(item.id),
          status: item.taskStatus,
          flag: item.operation ? this.flag : 1,
          taskid: item.depName,
          processInstanceTaskId: item.processInstanceTaskId,
          procInstId: item.procInstId,
        },
      });
    }
  }

  goEmp(item) {
    this.routerExt.navigateWithNewWindow(["/bidding/emp"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: item.operation ? this.flag : 1,
        sale: item.applicant,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }

  cancelSecondBid(): void {
    this.message.info("Cancel this operation");
  }

  cancelBidding(): void {
    this.message.info("Cancel this operation");
  }

  confirmSecondBid(item, operation) {
    this.goBidding(item, operation);
  }

  confirmBidding(item, operation) {
    this.goBidding(item, operation);
  }

  // 二次开标
  goBidding(item, operation) {
    const params = {
      mainID: codeString(item.id),
      operation: operation,
      processInstanceTaskId: item.processInstanceTaskId,
      procInstId: item.procInstId,
    };
    this.http.post(`/act/ecom/bidding/gobidding`, params).subscribe((rest) => {
      if (rest.code === "0000") {
        this.message.create("success", `${rest.msg}`);
        setTimeout(() => {
          // 刷新当前页面
          this.router
            .navigateByUrl("", { skipLocationChange: true })
            .then(() => {
              this.routerExt.navigateWithNewWindow(["/ecos/my-done"]);
            });
        }, 1000);
      } else {
        this.message.create("error", `${rest.msg}`);
      }
    });
  }

  // 合同子流程查看
  goUn(item) {
    this.routerExt.navigateWithNewWindow(["/pre-order/view-subp"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: "1",
        procInstId: item.procInstId,
      },
    });
  }
  //待oit文件上传
  goCompleteOit(item, param) {
    this.routerExt.navigateWithNewWindow(["/pre-order/complete-oit"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: item.operation ? this.flag : 1,
        status: item.taskStatus,
        param: param,
        sale: item.applicant,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }
  //待oit文件上传
  goCompleteOitFile(item) {
    this.routerExt.navigateWithNewWindow(["/pre-order/supp-file"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: item.operation ? this.flag : 1,
        status: item.taskStatus,
        sale: item.applicant,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }
  //审核 order summary
  goExaminesummary(item) {
    this.routerExt.navigateWithNewWindow(["/pre-order/in-order-exam"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: item.operation ? this.flag : 1,
        status: item.taskStatus,
        state: item.taskStatus,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }

  // 授权发放只读
  goEmp2(item) {
    this.routerExt.navigateWithNewWindow(["/bidding/emp"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: 1,
        sale: item.applicant,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }

  // 待销售部门审核
  // 待填写合同
  // 待非标审核DFBSH, taskID === paymentProvision,显示installationWarranty下的"下一级是否审核"
  goExamineOrder(item) {
    if (item.taskStatus === "DFBSH") {
      this.routerExt.navigateWithNewWindow(["/pre-order/examine-order"], {
        skipLocationChange: false,
        queryParams: {
          id: codeString(item.id),
          flag: item.operation ? this.flag : 1,
          status: item.taskStatus,
          taskID: item.depName,
          processInstanceTaskId: item.processInstanceTaskId,
          procInstId: item.procInstId,
        },
      });
    } else {
      this.routerExt.navigateWithNewWindow(["/pre-order/examine-order"], {
        skipLocationChange: false,
        queryParams: {
          id: codeString(item.id),
          flag: item.operation ? this.flag : 1,
          status: item.taskStatus,
          taskID: item.depName,
          processInstanceTaskId: item.processInstanceTaskId,
          procInstId: item.procInstId,
        },
      });
    }
  }

  //取消进单或者关闭合同概要表
  goExamineOrderEnd(item) {
    this.routerExt.navigateWithNewWindow(["/pre-order/examine-order"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: "1",
        status: item.taskStatus,
        taskID: item.depName,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }

  // 修改合同概要表
  goInconmodif(item) {
    this.routerExt.navigateWithNewWindow(["/pre-order/in-con-modif"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: item.operation ? this.flag : 1,
        status: item.taskStatus,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }

  // 合同签署
  goConsign(item) {
    this.routerExt.navigateWithNewWindow(["/pre-order/con-sign"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: item.operation ? this.flag : 1,
        status: item.taskStatus,
        sale: item.applicant,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }
  //填写 odersummary
  goOrdersummary(item) {
    this.routerExt.navigateWithNewWindow(["/pre-order/in-order"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: item.operation ? this.flag : 1,
        status: item.taskStatus,
        state: item.taskStatus,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }

  // 待补充文件上传
  goSuppfile(item) {
    this.routerExt.navigateWithNewWindow(["/pre-order/supp-file"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: item.operation ? this.flag : 1,
        status: item.taskStatus,
        sale: item.applicant,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }

  //审核改单
  goChangeApproval(item, param) {
    this.routerExt.navigateWithNewWindow(["/pre-order/complete-oit"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.lastMainId),
        mainId: codeString(item.id),
        flag: item.operation ? this.flag : 1,
        status: item.taskStatus,
        param: param,
        sale: item.applicant,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }

  //发起prebook
  getPrebook(item) {
    this.routerExt.navigateWithNewWindow(["/pre-book"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: item.operation ? this.flag : 1,
        status: item.taskStatus,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }
  //prebookzpm和dsi审核
  getPrebookzmp(item) {
    this.routerExt.navigateWithNewWindow(["/pre-book/review"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: item.operation ? this.flag : 1,
        status: item.taskStatus,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }

  //PREBOOK-OA审核,District Leader审核,Sales Leader审核
  getPrebookOA(item) {
    this.routerExt.navigateWithNewWindow(["/pre-book/oa-review"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: item.operation ? this.flag : 1,
        status: item.taskStatus,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }

  //preboo-om回填
  getPrebookom(item) {
    this.routerExt.navigateWithNewWindow(["/pre-book/prebook-so"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: item.operation ? this.flag : 1,
        status: item.taskStatus,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }

  //prebook-oa补充文件上传
  getPrebookSupplement(item) {
    this.routerExt.navigateWithNewWindow(["/pre-book/supplement-oa"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: item.operation ? this.flag : 1,
        status: item.taskStatus,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }

  //prebook中止
  getPrebookend(item) {
    this.routerExt.navigateWithNewWindow(["/pre-book/prebook-so"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: 1,
        status: item.taskStatus,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }

  /*********** 一期跳转操作 End  *********/
}
