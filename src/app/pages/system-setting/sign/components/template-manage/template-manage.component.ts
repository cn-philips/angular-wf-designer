import { Component, EventEmitter, Input, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { HttpService } from "@core/services";
import { NzModalService, NzNotificationService } from "ng-zorro-antd";
@Component({
  selector: "template-manage",
  templateUrl: "./template-manage.component.html",
  styleUrls: ["./template-manage.component.scss"],
})
export class TemplateManageComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private modal: NzModalService,
    private notification: NzNotificationService
  ) {}
  @Input() bestSignTemplateList: any = [];
  public formValues = this.fb.group({
    templateDisplayName: [null],
    templateId: [null],
    templateName: [null],
    templateOrder: [null],
  });

  templateChange: any = new EventEmitter();

  modalFormValues: any = "";

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
  disabled: any = false;
  templateNameDisabled: any = false;
  templateRule: any = "";
  defaultRule: any =
    '[\r\n    {\r\n        "key":"currency",\r\n        "action":"eq", \r\n        "value": "USD",\r\n        "rules":[\r\n            {\r\n                "key":"contractTotalPrice",\r\n                "action":"ge", \r\n                "value": 0\r\n            }\r\n        ]\r\n    },\r\n]';

  ngOnInit() {
    this.init();
  }

  init() {
    this.modalFormValues = this.fb.group({
      templateDisplayName: [{ value: "", disabled: this.disabled }],
      templateId: [
        { value: "", disabled: this.disabled },
        [Validators.required],
      ],
      templateName: [
        { value: "", disabled: this.templateNameDisabled || this.disabled },
      ],
      templateOrder: [{ value: "", disabled: this.disabled }],
      templateRule: [{ value: "", disabled: this.disabled }],
    });
    this.loading = true;
    // this.getBestSignTemplateList();
    this.getTableData();
  }

  // getBestSignTemplateList() {
  //   this.http
  //     .get("/act/contract-sign-template/bestSignTemplateList")
  //     .subscribe((res) => {
  //       const { code, data, msg } = res;
  //       if (code === "0000") {
  //         this.bestSignTemplateList = data;
  //       }
  //     });
  // }

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
      .post("/act/contract-sign-template/query", params)
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

  resetRule(rules) {
    let arr = [];
    if (rules) {
      let ruleArr = JSON.parse(rules);
      arr = this.mergeObjectsByIndex(this.deepInCalc(ruleArr, [], ""));
    }
    return arr;
  }

  deepInCalc(arr: any, lastArr: any, index: any) {
    for (let i = 0; i < arr.length; i++) {
      const el = arr[i];
      let result = this.calculateRule(el.key, el.value, el.action);
      if (index) {
        lastArr.push({
          index,
          result,
        });
      } else {
        lastArr.push({
          index: i,
          result,
        });
      }
      if (el.rules && el.rules.length) {
        this.deepInCalc(el.rules, lastArr, i);
      }
    }
    return lastArr;
  }

  calculateRule(key: any, value: any, operator: any) {
    let operation: any = "",
      currency: any = "",
      str: any = "";
    switch (operator) {
      case "ge":
        operation = "不低于";
        // operation = "大于或等于";
        break;
      case "gt":
        operation = "高于";
        // operation = "大于";
        break;
      case "le":
        operation = "不高于";
        // operation = "小于或等于";
        break;
      case "lt":
        operation = "低于";
        // operation = "小于";
        break;
      case "eq":
        operation = "为";
        // operation = "等于";
        break;
      case "ne":
        operation = "不为";
        break;
      default:
        operation = "";
      // case 'between':
      // case 'notBetween':
      // case 'like':
      // case 'notLike':
    }
    if (key === "currencySystem") {
      if (value === "CNY") {
        currency = "人民币";
      } else if (value === "USD") {
        currency = "美金";
      }
      str = currency;
      // str = `合同为${currency}合同`;
    } else if (key === "totalContractPrice") {
      str = "合同总价" + operation + value;
    }
    return str;
  }

  mergeObjectsByIndex(arr) {
    arr.reverse();
    const result = Object.values(
      arr.reduce((acc, obj) => {
        const { index, result } = obj;

        if (!acc[index]) {
          acc[index] = { index, results: [result] };
        } else {
          acc[index].results.push(result);
        }
        return acc;
      }, {})
    );
    // 按索引升序拼接 result 字段
    return result.map(({ results }: any) => results.join(""));
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
    this.modalFormValues.controls.templateName.disable();
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
            .post("/act/contract-sign-template/delete/" + data.id)
            .subscribe((res) => {
              const { code, data, msg } = res;
              if (code === "0000") {
                resolve("1");
                that.getTableData();
                that.templateChange.emit();
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
      templateType: "CONTRACT",
    };
    if (this.modalId) params.id = this.modalId;
    this.uploadLoading = true;
    if (modalType === "add") {
      this.http
        .post("/act/contract-sign-template/add", params)
        .subscribe((res) => {
          const { code, data, msg } = res;
          this.uploadLoading = false;
          if (code === "0000") {
            this.notification.success("新增成功", "");
            this.templateChange.emit();
            this.modalVisible = false;
            this.resetForm();
          } else {
            this.notification.error(msg, "");
          }
        });
    } else {
      this.http
        .post("/act/contract-sign-template/" + params.id, params)
        .subscribe((res) => {
          const { code, data, msg } = res;
          if (code === "0000") {
            this.notification.success("修改成功", "");
            this.templateChange.emit();
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
    let {
      id,
      templateDisplayName,
      templateId,
      templateName,
      templateOrder,
      templateRule,
    } = data;

    this.modalFormValues.patchValue({
      id,
      templateDisplayName,
      templateId,
      templateName,
      templateOrder,
      templateRule,
    });
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
