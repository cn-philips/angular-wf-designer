import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { Router } from "@angular/router";
import { RouterExtendService } from "@app/modern-themes/services/router-extend.service";
import { DictService, HttpService, ServesiceService } from "@core/services";
import { codeString } from "assets/js/tools";
import { NzMessageService } from "ng-zorro-antd";

@Component({
  selector: "cos-my-started-list",
  templateUrl: "list.component.html",
  styleUrls: ["list.component.scss"],
})
export class MyStartedListComponent implements OnInit {
  @Input() tableData: [];
  @Input() total: 0;
  @Input() loading: any = false;
  @Input() flag;

  @Output() pageChange = new EventEmitter<any>();
  @Output() setLoading = new EventEmitter<boolean>();

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
    private dictService: DictService
  ) {}

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
      this.router.navigate([url], {
        queryParams: {
          id: data.id,
          flag: this.flag,
          processInstanceTaskId: data.processInstanceTaskId,
          taskStatus: data.taskStatus,
          procInstId: data.procInstId,
          processStatus: data.processStatus,
          allowChangOrder: true,
        },
      });
    } else if (biddingType.includes(applyType)) {
      this.router.navigate(["/bidding-v3", data.id], {
        queryParams: {
          processInstanceTaskId: data.processInstanceTaskId,
          procInstId: data.procInstId,
          processStatus: data.processStatus,
          taskStatus: data.taskStatus,
        },
      });
      return;
    } else if (applyType === 'PREBOOK') {
      this.router.navigate(["/prebook-v3", data.id], {
        queryParams: {
          processStatus: data.processStatus,
          taskStatus: data.taskStatus,
          procInstId: data.procInstId
        },
      });
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
    this.router.navigate(["/pre-order/audit"], {
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
      this.router.navigate(["/bidding/apply-tender-modif"], {
        skipLocationChange: false,
        queryParams: {
          id: codeString(item.id),
          flag: item.operation ? this.flag : 1,
          processInstanceTaskId: item.processInstanceTaskId,
          procInstId: item.procInstId,
        },
      });
    } else {
      this.router.navigate(["/pre-order/modifs"], {
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
      this.router.navigate(["/bidding/bid"], {
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
      this.router.navigate(["/bidding/bid"], {
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
      this.router.navigate(["/bidding/bid"], {
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
      this.router.navigate(["/bidding/bid"], {
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
    this.router.navigate(["/bidding/winning"], {
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
    this.router.navigate(["/bidding/winning"], {
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
    this.router.navigate(["/bidding/support-up"], {
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
      this.router.navigate(["/bidding/tender-review"], {
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
      this.router.navigate(["/bidding/tender-review-sale"], {
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
    this.router.navigate(["/bidding/emp"], {
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
              this.router.navigate(["/ecos/my-done"]);
            });
        }, 1000);
      } else {
        this.message.create("error", `${rest.msg}`);
      }
    });
  }

  // 合同子流程查看
  goUn(item) {
    this.router.navigate(["/pre-order/view-subp"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: "1",
        procInstId: item.procInstId,
      },
    });
  }
  //待oit完成
  goCompleteOit(item, param) {    
    this.router.navigate(["/pre-order/complete-oit"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: item.operation ? this.flag : 1,
        status: item.taskStatus,
        param: param,
        sale: item.applicant,
        processInstanceTaskId: item.processInstanceTaskId,
        allowChangOrder: true,
      },
    });
  }
  //待oit文件上传
  goCompleteOitFile(item) {
    this.router.navigate(["/pre-order/supp-file"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: item.operation ? this.flag : 1,
        status: item.taskStatus,
        sale: item.applicant,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
        allowChangOrder: true,
      },
    });
  }

  //审核 order summary
  goExaminesummary(item) {
    this.router.navigate(["/pre-order/in-order-exam"], {
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
    this.router.navigate(["/bidding/emp"], {
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
      this.router.navigate(["/pre-order/examine-order"], {
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
      this.router.navigate(["/pre-order/examine-order"], {
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
    this.router.navigate(["/pre-order/examine-order"], {
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
    this.router.navigate(["/pre-order/in-con-modif"], {
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

  // 待补充文件上传
  goSuppfile(item) {
    this.router.navigate(["/pre-order/supp-file"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: item.operation ? this.flag : 1,
        status: item.taskStatus,
        sale: item.applicant,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
        allowChangOrder: true,
      },
    });
  }

  // 合同签署
  goConsign(item) {
    this.router.navigate(["/pre-order/con-sign"], {
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
    this.router.navigate(["/pre-order/in-order"], {
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

  //审核改单
  goChangeApproval(item, param) {
    this.router.navigate(["/pre-order/complete-oit"], {
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
    this.router.navigate(["/pre-book"], {
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
    this.router.navigate(["/pre-book/review"], {
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
    this.router.navigate(["/pre-book/oa-review"], {
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
    this.router.navigate(["/pre-book/prebook-so"], {
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

  //preboo-om回填
  getPrebookom(item) {
    this.router.navigate(["/pre-book/prebook-so"], {
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
    this.router.navigate(["/pre-book/supplement-oa"], {
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

  /*********** 一期跳转操作 End  *********/
}
