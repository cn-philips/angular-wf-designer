import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges
} from "@angular/core";
import { Router } from "@angular/router";
import { DictService, HttpService } from "@core/services";
import { codeString } from "assets/js/tools";
import { NzMessageService, NzModalService } from "ng-zorro-antd";

@Component({
  selector: "cos-waite-me-supplement-list",
  templateUrl: "list.component.html",
  styleUrls: ["list.component.scss"],
})
export class WaiteMeSupplementListComponent implements OnInit {
  @Input() tableData = [];
  @Input() total = 0;
  @Input() loading: any = false;
  @Input() type: any;
  @Input() flag: any;
  @Input() isHandle = 0;
  @Input() isThirdParty = false;

  @Output() pageChange = new EventEmitter<any>();
  @Output() setLoading = new EventEmitter<boolean>();

  public receiver = null;
  public receiverList = [];
  public subAssignLoading: any = false;
  public assignShowoff = false;
  public role = null;
  public continue = false;
  mapOfCheckedId: { [key: string]: boolean } = {};
  pageParams = {
    pageNo: 1,
    pageSize: 10,
  };
  public roleList = [
    { name: "OA", value: "OA" },
  ];
  public openCheckbox = false;

  public userList = [];
  public entryModeList = [];

  constructor(
    private router: Router,
    private message: NzMessageService,
    private dictService: DictService,
    private http: HttpService,
    private modalService: NzModalService
  ) {}

  public get isLegancy(): Boolean {
    return [2,3].includes(this.isHandle)
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
    let applyType = data.applyType;
    let orderType = ["OIT_MAIN", "OIT_SUB"];
    let biddingType = ["BIDDING"];

    if (orderType.includes(applyType)) {
      const url = "/order-v3/oitcomplete";
      this.router.navigate([url], {
        queryParams: {
          id: data.id,
          needFileType: this.type,
          processInstanceTaskId: data.processInstanceTaskId,
          taskStatus: data.taskStatus,
          procInstId: data.procInstId,
          isHandle: this.isHandle
        },
      });
    } else if (biddingType.includes(applyType)) {
      this.router.navigate(["/bidding-v3", data.id], {
        queryParams: {
          processInstanceTaskId: data.processInstanceTaskId,
          procInstId: data.procInstId,
          processStatus: data.processStatus,
          taskStatus: data.taskStatus,
          fromSupplement: true,
          isHandle: this.isHandle
        },
      });
      return;
    } else if (applyType === 'PREBOOK') {
      this.router.navigate(["/prebook-v3", data.id], {
        queryParams: {
          processInstanceTaskId: data.processInstanceTaskId,
          processStatus: data.processStatus,
          taskStatus: data.taskStatus,
          fromSupplement: this.isHandle,
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
    this.dictService.dictData('ENTRY_MODEL').subscribe((dictData) => {
      this.entryModeList = dictData.map(({ code, label }) => ({ code, label }))
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
  //待oit文件上传 SO# 第三方自采
  goCompleteOit(item, param) {
    // if(this.isThirdParty)
    // isLegancy
    let params = {
      id: codeString(item.id),
      flag:  this.flag,
      status: item.taskStatus,
      param: param,
      sale: item.applicant,
      processInstanceTaskId: item.processInstanceTaskId,
      procInstId: item.procInstId,
    }
    if (this.isThirdParty) {
      params['isThirdParty'] = this.isThirdParty
      if (this.isLegancy) {
        params['isLegancy'] = this.isLegancy
      }
    }

    this.router.navigate(["/pre-order/complete-oit"], {
      skipLocationChange: false,
      queryParams: params,
    });
  }

  //待oit文件上传
  goCompleteOitFile(item) {
      this.router.navigate(["/pre-order/supp-file"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: this.isHandle,
        status: item.taskStatus,
        sale: item.applicant,
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
        flag: this.flag,
        status: item.taskStatus,
        sale: item.applicant,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }
  //中标确认文件待补充
  goToSupportUp(item) {
    this.router.navigate(["/bidding/support-up"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: this.isHandle===0 ? this.flag : 1,
        status: item.taskStatus,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }

  // 合同签署
  goConsign(item) {
    this.router.navigate(["/pre-order/con-sign"], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(item.id),
        flag: this.flag,
        status: item.taskStatus,
        sale: item.applicant,
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
        flag: this.flag,
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
        flag: this.flag,
        status: item.taskStatus,
        processInstanceTaskId: item.processInstanceTaskId,
        procInstId: item.procInstId,
      },
    });
  }

  public isOA = false;
  public isBidding = false;
  public isWinConfirm = false;
  // 判断角色下拉框显示
  public ckRole(e) {
    if (e) {
      if (
        this.isOA &&
        (e.toLowerCase() === "oa" || e.toLowerCase() === "oa leader")
      ) {
        return true;
      }
      if (this.isBidding && e.toLowerCase() === "bidding") {
        return true;
      }
      if (this.isWinConfirm && e.toLowerCase() === "win confirm") {
        return true;
      }
    }
  }

  public cancelModeal() {
    this.assignShowoff = false;
  }
  public openAssignShowoff() {
    this.receiver = null;
    this.role = null;
    this.assignShowoff = true;
  }

  public subAssign() {
    const arr = [];
    //获取选中的任务数据
    const checkedList = Object.keys(this.mapOfCheckedId);
    const selectedList = checkedList.filter((value) => {
      return this.mapOfCheckedId[value] == true;
    });
    let dataList = [];
    selectedList.forEach((value) => {
      let list = this.tableData
        .filter((item) => {
          return item.id === value;
        })
        .map(({ id, procPhase, processInstanceTaskId, procInstId }) => ({
          id,
          procPhase,
          processInstanceTaskId,
          procInstId,
        }));
      if (list.length > 0) {
        dataList.push(list[0]);
      }
    });

    // 获取选中记录id
    if (dataList && dataList.length > 0) {
      dataList.forEach((item) => {
        arr.push({
          mainId: item.id,
          role: this.role,
          receiver: this.receiver,
          flag: this.continue ? 1 : 0,
          procTaskId:item.processInstanceTaskId
        });
      });
      if (!(arr && arr.length > 0)) {
        this.message.create("error", "未选择项目");
        return;
      }
      if (this.role == null || this.role === "") {
        this.message.create("error", "请选择角色");
        return;
      }
      if (this.receiver == null || this.receiver === "") {
        this.message.create("error", "请选择接收人");
        return;
      }
      if (this.continue) {
        this.modalService.confirm({
          nzTitle: "请确认",
          nzContent: "是否确定持续将任务转派给接收人?",
          nzOkText: "确定",
          nzCancelText: "取消",
          nzOnOk: () => {
            if (this.subAssignLoading) {
              return;
            }
            this.subAssignLoading = true;
            const url = "/act/ecom/homepage/transferOrderRecord";
            this.http.post(url, arr).subscribe(
              (e) => {
                this.subAssignLoading = false;
                this.assignShowoff = false;
                if (e && e.code === "0000") {
                  this.message.create("success", e.msg);
                  setTimeout(() => {
                    // 刷新当前页面
                    this.router
                      .navigateByUrl("", { skipLocationChange: true })
                      .then(() => {
                        this.router.navigate(["/ecos/my-todo"]);
                      });
                  }, 1000);
                } else {
                  // this.load = false;
                  this.message.create("error", e.msg);
                }
              },
              (error) => {
                this.subAssignLoading = false;
                this.message.create("error", "请求失败");
              }
            );
          },
        });
      } else {
        const url = "/act/ecom/homepage/transferOrderRecord";
        if (this.subAssignLoading) {
          return;
        }
        this.subAssignLoading = true;
        this.http.post(url, arr).subscribe(
          (e) => {
            this.subAssignLoading = false;
            this.assignShowoff = false;
            if (e && e.code === "0000") {
              this.message.create("success", e.msg);
              setTimeout(() => {
                // 刷新当前页面
                this.router
                  .navigateByUrl("", { skipLocationChange: true })
                  .then(() => {
                    this.router.navigate(["/ecos/my-todo"]);
                  });
              }, 1000);
            } else {
              this.subAssignLoading = false;
              this.assignShowoff = false;
              this.message.create("error", e.msg);
            }
          },
          (error) => {
            this.subAssignLoading = false;
            this.message.create("error", "请求失败");
          }
        );
      }
    } else {
      this.message.create("error", "未选择项目");
      this.subAssignLoading = false;
      setTimeout(() => {
        // 刷新当前页面
        this.router.navigateByUrl("", { skipLocationChange: true }).then(() => {
          this.router.navigate(["/ecos/my-todo"]);
        });
      }, 1000);
    }
  }

  public roleChange() {
    this.receiver = null;
  }

  public AllCheck(e) {
    const dataList = this.tableData;
    if (dataList) {
      for (let i = 0; i < dataList.length; i++) {
        if (!this.mapOfCheckedId[i]) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  public CheckAll(value: boolean) {
    if (this.tableData) {
      this.tableData.forEach((item) => (this.mapOfCheckedId[item.id] = value));
    }
  }
}
