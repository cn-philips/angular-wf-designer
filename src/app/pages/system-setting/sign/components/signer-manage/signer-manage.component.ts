import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { HttpService } from "@core/services";
import { NzModalService, NzNotificationService } from "ng-zorro-antd";
@Component({
  selector: "signer-manage",
  templateUrl: "./signer-manage.component.html",
  styleUrls: ["./signer-manage.component.scss"],
})
export class SignerManageComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private modal: NzModalService,
    private notification: NzNotificationService
  ) {}
  @Input() bestSignTemplateList: any = [];
  public formValues = this.fb.group({
    nodeName: [null],
    roleName: [null],
    currency: [null],
  });

  modalFormValues: any = "";
  disabled: any = false;
  templateNameDisabled: any = false;
  nodes: any = [];

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
  allRoles: any = [];
  ngOnInit() {
    this.init();
  }

  init() {
    this.loading = true;
    this.modalFormValues = this.fb.group({
      nodeName: [{ value: "", disabled: this.disabled }, [Validators.required]],
      positionName: [
        { value: "", disabled: this.disabled },
        [Validators.required],
      ],
      roleName: [{ value: "", disabled: this.disabled }, [Validators.required]],
      currency: [{ value: "", disabled: this.disabled }, [Validators.required]],
      templateId: [
        { value: "", disabled: this.disabled },
        [Validators.required],
      ],
      modality: [{ value: "", disabled: this.disabled }],
    });
    this.getAllRoles();
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

    this.http.post("/act/signer-config/query", params).subscribe((res) => {
      console.log(res);
      const { code, data, msg } = res;
      if (code === "0000") {
        this.tableData = data.rows;
        this.total = data.total;
        this.loading = false;
      }
    });
  }

  getAllRoles() {
    this.http.get("/act//signer-config/roles").subscribe((res) => {
      console.log(res);
      const { code, data, msg } = res;
      if (code === "0000") {
        this.allRoles = data;
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
    this.modalId = data.id;
    this.getNodes(data.templateId);
    this.modalFormValues.patchValue(data);
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
            .post("/act/signer-config/delete/" + data.id)
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
    };
    this.uploadLoading = true;
    if (this.modalId) params.id = this.modalId;
    if (modalType === "add") {
      this.http.post("/act/signer-config/add", params).subscribe((res) => {
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
        .post("/act/signer-config/" + params.id, params)
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

  templateChange(templateId: any) {
    this.getNodes(templateId);
  }

  getNodes(templateId: any) {
    this.http.get(`/act/signer-config/${templateId}/nodes`).subscribe((res) => {
      const { code, data, msg } = res;
      if (code === "0000") {
        this.nodes = data;
      }
    });
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
}
