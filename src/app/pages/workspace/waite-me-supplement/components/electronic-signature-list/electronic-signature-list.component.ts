import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { Router } from "@angular/router";
import { DictService, HttpService } from "@core/services";
import { NzMessageService, NzModalService } from "ng-zorro-antd";

@Component({
  selector: "electronic-signature-list",
  templateUrl: "./electronic-signature-list.component.html",
  styleUrls: ["./electronic-signature-list.component.scss"],
})
export class ElectronicSignatureListComponent implements OnInit {
  @Input() tableData = [];
  @Input() total = 0;
  @Input() loading: any = false;
  @Input() type: any;
  @Input() formData: any;
  @Input() from: any;

  @Output() pageChange = new EventEmitter<any>();
  @Output() setLoading = new EventEmitter<boolean>();
  pageParams = {
    pageNo: 1,
    pageSize: 10,
  };
  public batchload: any = false;
  mapOfCheckedId: { [key: string]: boolean } = {};

  public entryModeList = [];

  public templateMap = new Map<string, string>();

  public rejectModalVisible = false;
  public rejectSubmitLoading = false;

  public rejectForm = this.fb.group({
    flowId: [null],
    role: [null],
    reason: [null],
  });

  constructor(
    private http: HttpService,
    private router: Router,
    private fb: FormBuilder,
    private message: NzMessageService,
    private modal: NzModalService,
    private dictService: DictService
  ) {}

  convertRole(val: any) {
    const dic = {
      Philips: "Philips",
      SealAdmin: "Philips",
      Dealer: "经销商公章",
      DealerRepresentative: "经销商签字人",
      ForeignTradeCorp: "外贸公司",
      ForeignTradeCorpRepresentative: "外贸公司签字人",
    };
    return dic[val] || val;
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

  initTemplateMap() {
    this.http
      .get(`/act/contractSign/template/CONTRACT`)
      .subscribe(({ data: templateList }) => {
        for (const { templateId, templateDisplayName } of templateList) {
          this.templateMap.set(templateId, templateDisplayName);
        }
      });
  }

  handleDownloadFile(data: any) {
    // console.log(data);
    // const url = `/act${fileUrl}`;
    // this.http
    //   .get(url, {
    //     responseType: "blob",
    //   })
    //   .subscribe((data) => {
    //     saveAs(data, fileName);
    //   });
    const url = "/act/contractSign/download/" + data.id;
    this.http.get(url).subscribe((res) => {
      let bstr = window.atob(res.data.data);
      let n = bstr.length;
      let u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      let blob = new Blob([u8arr], { type: `application/pdf` });
      const fileURL = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", res.data.fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // this.notification.success("下载成功", "");
    });
  }

  // 批量签署合同
  handleBatchSignContract() {
    // 找出所有勾选的合同
    const waitingSignContractList = this.tableData.filter(
      ({ flowId }) => this.mapOfCheckedId[flowId]
    );
    if (waitingSignContractList.length === 0) {
      return this.message.error("请勾选要签署的合同");
    }
    let number = 0;
    this.modal.confirm({
      nzTitle: "确认批量签署？",
      nzOkText: "确定",
      nzCancelText: "取消",
      nzStyle: { top: "150px" },
      nzOnOk: async () => {
        this.setLoading.emit(true);
        for (const {
          flowId,
          contractSignFlowVo: { currentUserRole, status },
        } of waitingSignContractList) {
          if (status === "SENT") {
            number++;
            this.handleSignContract(flowId, currentUserRole).subscribe(
              ({ code, msg }) => {
                number--;
                if (code === "0000") {
                  if (number <= 0) {
                    this.message.success(`${flowId}签署成功`);
                    this.pageChange.emit(this.pageParams);
                  }
                } else {
                  this.message.error(`${flowId}签署失败, ${msg}`);
                }
                if (number <= 0) {
                  this.loading = false;
                  this.setLoading.emit(this.loading);
                }
              },
              (error) => {
                number--;
                this.message.error(error);
                this.loading = false;
                this.setLoading.emit(this.loading);
              }
            );
          } else if (status === "IN_INVALIDING") {
            number++;
            this.handleConfirmCancel(flowId, currentUserRole).subscribe(
              ({ code, msg }) => {
                number--;
                if (code === "0000") {
                  if (number <= 0) {
                    this.message.success(`${flowId}签署成功`);
                    this.pageChange.emit(this.pageParams);
                  }
                } else {
                  this.message.error(`${flowId}签署失败, ${msg}`);
                }
                if (number <= 0) {
                  this.loading = false;
                  this.setLoading.emit(this.loading);
                }
              },
              (error) => {
                number--;
                this.message.error(error);
                this.loading = false;
                this.setLoading.emit(this.loading);
              }
            );
          }
        }
      },
    });
  }

  handleSingleSignContract({
    flowId,
    contractSignFlowVo: { currentUserRole },
  }) {
    this.modal.confirm({
      nzTitle: "确认签署？",
      nzOkText: "确定",
      nzCancelText: "取消",
      nzStyle: { top: "150px" },
      nzOnOk: async () => {
        this.loading = true;
        this.setLoading.emit(this.loading);
        this.handleSignContract(flowId, currentUserRole).subscribe(
          ({ code, msg }) => {
            if (code === "0000") {
              this.message.success(`签署成功`);
              this.pageChange.emit(this.pageParams);
            } else {
              this.message.error(msg);
            }
            this.loading = false;
            this.setLoading.emit(this.loading);
          },
          (error) => {
            this.message.error(error);
            this.loading = false;
            this.setLoading.emit(this.loading);
          }
        );
      },
    });
  }

  handleConfirmCancel(flowId: any, roleName: any) {
    const url = `/act/contractSign/flow/${flowId}/${roleName}/confirmCancel`;
    return this.http.post(url);
  }

  handleSignContract(flowId, roleName) {
    const url = `act/contractSign/${flowId}/${roleName}/sign`;
    return this.http.post(url);
  }

  handleCancel({ flowId, contractSignFlowVo: { currentUserRole } }) {
    this.modal.confirm({
      nzTitle: "确认作废？",
      nzOkText: "确定",
      nzCancelText: "取消",
      nzStyle: { top: "150px" },
      nzOnOk: async () => {
        this.loading = true;
        this.setLoading.emit(this.loading);
        this.handleConfirmCancel(flowId, currentUserRole).subscribe(
          ({ code, msg }) => {
            if (code === "0000") {
              this.message.success(`作废成功`);
              this.pageChange.emit(this.pageParams);
            } else {
              this.message.error(msg);
            }
            this.loading = false;
            this.setLoading.emit(this.loading);
          },
          (error) => {
            this.message.error(error);
            this.loading = false;
            this.setLoading.emit(this.loading);
          }
        );
      },
    });
  }

  handleShowRejectModal({ flowId, contractSignFlowVo: { currentUserRole } }) {
    this.rejectForm.patchValue({
      flowId,
      role: currentUserRole,
      reason: "",
    });
    this.rejectModalVisible = true;
  }
  handleSubmitReject() {
    const { flowId, role, reason } = this.rejectForm.getRawValue();
    const url = `act/contractSign/rejectNotification/${flowId}`;
    this.rejectSubmitLoading = true;
    this.http.post(url, { role, reason }).subscribe(
      ({ code, msg }) => {
        if (code === "0000") {
          this.message.success(`驳回成功`);
          this.pageChange.emit(this.pageParams);
        } else {
          this.message.error(msg);
        }
        this.rejectSubmitLoading = false;
      },
      (error) => {
        this.message.error(error);
        this.rejectSubmitLoading = false;
      }
    );
  }

  ngOnInit() {
    this.initTemplateMap();
    this.getEntryModeList();
  }

  //重置分页
  resetPage() {
    this.pageParams = {
      pageNo: 1,
      pageSize: 10,
    };
  }

  goDetail(data: any, flag: any) {
    const url = "/order-v3/contractSignDetail";
    this.router.navigate([url], {
      queryParams: {
        id: data.id,
        needFileType: this.type,
        processInstanceTaskId: data.processInstanceTaskId,
        taskStatus: data.taskStatus,
        procInstId: data.procInstId,
        flag: 1,
        zslSignSupplement: this.formData.zslSignSupplement,
        signatureStatus: "signatureStatus",
        sign: 1,
      },
    });
    // if (flag) {
    //   const url = "/order-v3/contractSignDetail";
    //   this.router.navigate([url], {
    //     queryParams: {
    //       id: data.id,
    //       needFileType: this.type,
    //       processInstanceTaskId: data.processInstanceTaskId,
    //       taskStatus: data.taskStatus,
    //       procInstId: data.procInstId,
    //       flag: 1,
    //       zslSignSupplement: this.formData.zslSignSupplement,
    //       signatureStatus: "signatureStatus",
    //       sign: 1,
    //     },
    //   });
    // } else {
    //   const url = "/order-v3/contractSign";
    //   this.router.navigate([url], {
    //     queryParams: {
    //       id: data.id,
    //       needFileType: this.type,
    //       processInstanceTaskId: data.processInstanceTaskId,
    //       taskStatus: data.taskStatus,
    //       procInstId: data.procInstId,
    //       flag: 1,
    //       zslSignSupplement: this.formData.zslSignSupplement,
    //       signatureStatus: "signatureStatus",
    //     },
    //   });
    // }
  }

  // 进单模式
  public getEntryModeList() {
    this.dictService.dictData("ENTRY_MODEL").subscribe((dictData) => {
      this.entryModeList = dictData.map(({ code, label }) => ({ code, label }));
    });
  }

  ProOitModeType(e: any) {
    for (let i = 0; i < this.entryModeList.length; i++) {
      if (this.entryModeList[i].code === e) {
        return this.entryModeList[i].label;
      }
    }
    return e;
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

  public CheckAll(value: boolean) {
    if (this.tableData) {
      this.tableData.forEach(
        (item) => (this.mapOfCheckedId[item.flowId] = value)
      );
    }
  }

  public AllCheck(e) {
    const dataList = this.tableData;
    if (dataList) {
      for (let i = 0; i < dataList.length; i++) {
        if (!this.mapOfCheckedId[dataList[i].flowId]) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
}
