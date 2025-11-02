import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { HttpService } from "@core/services";
import { NzModalService, NzNotificationService } from "ng-zorro-antd";
import { environment } from '@env';
@Component({
  selector: "dealer-manage",
  templateUrl: "./dealer-manage.component.html",
  styleUrls: ["./dealer-manage.component.scss"],
})
export class DealerManageComponent implements OnInit {
  constructor(
    private ownHttp: HttpClient,
    private fb: FormBuilder,
    private http: HttpService,
    private modal: NzModalService,
    private notification: NzNotificationService
  ) {}

  base_href = environment.base_href;
  queryType: any = "todo";
  public formValues = this.fb.group({
    dealerBestSignAccount: [null],
    signatoryType: [null],
    dealerContractorName: [null],
    dealerName: [null],
    dealerType: [null],
  });
  modalFormValues: any = "";
  disabled: any = false;
  templateNameDisabled: any = false;

  isCollapse: any = false;
  tableData: any = [];
  pageParams: any = {
    pageNum: 1,
    pageSize: 10,
  };
  total: any = 0;
  loading: any = false;
  uploadLoading: any = false;
  modalVisible: any = false;
  title: any = "";
  modalType: any = "";
  modalId: any = "";
  posMap: any = {
    DEALER: "经销商职位",
    FOREIGN_TRADE_COMPANY: "外贸公司职位",
    FREIGHT_FORWARDER: "货运代理公司职位",
  };
  cropMap: any = {
    DEALER: "经销商",
    FOREIGN_TRADE_COMPANY: "外贸公司",
    FREIGHT_FORWARDER: "货运代理公司",
  };
  ngOnInit() {
    this.init();
  }

  init() {
    this.loading = true;
    this.modalFormValues = this.fb.group({
      dealerName: [
        { value: "", disabled: this.disabled },
        [Validators.required],
      ],
      dealerBestSignAccount: [
        { value: "", disabled: this.disabled },
        [Validators.required],
      ],
      dealerContractorName: [
        { value: "", disabled: this.disabled },
      ],
      signatoryType: [
        { value: "", disabled: this.disabled },
        [Validators.required],
      ],
      dealerType: [
        { value: "", disabled: this.disabled },
        [Validators.required],
      ],
    });
    this.getTableData();
  }

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  changePageIndex(pageNo: any) {
    if (pageNo == 0) {
      pageNo = 1;
    }
    this.pageParams.pageNum = pageNo;
    this.loading = true;
    this.getTableData();
  }

  getTableData() {
    // 待我补充
    let formValues = this.formValues.getRawValue();
    const params = {
      ...formValues,
      ...this.pageParams,
    };

    this.http
      .post("/act/contract-sign-dealer/query", params)
      .subscribe((res) => {
        console.log(res);
        const { code, data, msg } = res;
        if (code === "0000") {
          this.tableData = data.rows;
          this.total = data.total;
          this.loading = false;
        }
      });
  }

  handleAdd() {
    this.title = "新增模板";
    this.modalType = "add";
    this.modalVisible = true;
  }

  handleEdit(data: any) {
    this.title = "编辑模板";
    this.modalType = "edit";
    this.modalFormValues.patchValue(data);
    this.modalId = data.id;
    this.modalVisible = true;
  }

  handleDel(data: any) {
    const that = this;
    this.modal.confirm({
      nzTitle: "确认删除吗？",
      nzOkText: "确定",
      nzCancelText: "取消",
      nzOnOk: () =>
        new Promise((resolve, reject) => {
          that.http
            .post("/act/contract-sign-dealer/delete/" + data.id)
            .subscribe((res) => {
              const { code, data, msg } = res;
              if (code === "0000") {
                resolve("1");
                that.getTableData();
                that.notification.success("删除成功", "");
              } else {
                reject();
                that.notification.success(msg, "");
              }
            });
        }).catch(() => console.log("Oops errors!")),
    });
  }

  handleOk() {
    for (const i in this.modalFormValues.controls) {
      this.modalFormValues.controls[i].markAsDirty();
      this.modalFormValues.controls[i].updateValueAndValidity();
    }
    if (!this.modalFormValues.valid) {
      return this.notification.error("请填写完整信息", "");
    }
    let modalType = this.modalType;
    let fields = this.modalFormValues.getRawValue();
    let params = {
      ...fields,
      dealerPosition:this.posMap[fields.dealerType]
    };
    if (this.modalId) params.id = this.modalId;
    this.uploadLoading = true;
    if (modalType === "add") {
      this.http
        .post("/act/contract-sign-dealer/add", params)
        .subscribe((res) => {
          const { code, data, msg } = res;
          this.uploadLoading = false;
          if (code === "0000") {
            this.notification.success("新增成功", "");
            this.modalVisible = false;
            this.resetForm();
          } else {
            this.notification.error(msg, "");
          }
        });
    } else {
      this.http
        .post("/act/contract-sign-dealer/" + params.id, params)
        .subscribe((res) => {
          const { code, data, msg } = res;
          if (code === "0000") {
            this.notification.success("修改成功", "");
            this.modalVisible = false;
            this.resetForm();
          } else {
            this.notification.error(msg, "");
          }
        });
    }
  }

  handleDetail(data: any) {
    this.title = "查看模板";
    this.modalType = "view";

    this.modalFormValues.patchValue(data);
    this.modalFormValues.disable();
    this.disabled = true;
    this.modalVisible = true;
  }

  handleModalHide() {
    this.disabled = false;
    this.templateNameDisabled = false;
    this.uploadLoading = false;
    this.modalId = "";
    this.modalFormValues.reset("");
  }

  submitForm() {
    this.pageParams = {
      pageNum: 1,
      pageSize: 10,
    };
    this.getTableData();
  }

  resetForm() {
    this.formValues.reset();
    this.pageParams = {
      pageNum: 1,
      pageSize: 10,
    };
    this.getTableData();
  }

  handleAsync() {
    this.http.posts("/act/dealers-status/syncDealerStatus").subscribe((res) => {
      const { code, data, msg } = res;
      if (code === "0000") {
        this.notification.success("同步成功", "");
        this.resetForm();
      } else {
        this.notification.error(msg, "");
      }
    });
  }

  // 导出
  handleExport() {
    this.ownHttp
      .post(this.base_href+"/act/contract-sign-dealer/export", {}, { responseType: "blob" })
      .subscribe((res) => {
        console.log(res);
        const blob = new Blob([res], {
          type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`,
        });
        console.log(blob);
        const fileURL = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = fileURL;
        link.setAttribute("download", "dealer-template-list");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.notification.success("导出成功", "");
      });
  }

  // 导入
  beforeUpload = (file: any) => {
    const formData = new FormData();
    // 正常的文件上传
    formData.append("file", file);
    // /act/contract-sign-dealer/
    this.http
      .posts("/act/contract-sign-dealer/import", formData)
      .subscribe((res) => {
        const { code, data, msg } = res;
        if (code === "0000") {
          this.notification.success("导入成功", "");
          this.resetForm();
        } else {
          this.notification.error(msg, "");
        }
      });
    return false;
  };
}
