import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { HttpService } from "@core/services";
import { SpecialApprovalItemService } from "./special-approval-item.service";
import { NzMessageService } from "ng-zorro-antd";

enum FORM_TYPE {
  EDIT,
  NEW,
}

@Component({
  selector: "special-approval-item",
  templateUrl: "special-approval-item.component.html",
  styleUrls: ["./special-approval-item.component.scss"],
})
export class SpecialApprovalItemComponent implements OnInit {
  queryParams = {
    pageNo: 1,
    pageSize: 10,
  };

  tableData = {
    loading: false,
    total: 1,
    list: [],
  };

  formType: FORM_TYPE;
  FORM_TYPE = FORM_TYPE;
  formVisible = false;
  submitBtnLoading = false;

  formValues: FormGroup = this.fb.group({
    id: [null],
    name: [null, [Validators.required]],
    description: [null, [Validators.required]],
    roleList: [null, [Validators.required]],
    enabled: [true],
    nonRequiredFields: [''],
  });

  selectOptions = {
    roleList: [],
  };

  spItems = [
    { label: '最终用户合同/中标通知书', value: 'endUserContractFiles' },
    { label: '参与投标声明函', value: 'participationTenderLetterFiles' },
    { label: '场地勘验报告/要货函', value: 'siteSurveyReportFiles' },
    { label: '全套投标文件', value: 'fullDocumentFields' },
  ]

  get nonRequiredFields() {
    return this.formValues.get('nonRequiredFields') as FormControl
  }

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private spItemService: SpecialApprovalItemService,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    this.initRoleList();
    this.getTableData();
  }

  initRoleList() {
    const url = "/act/role/getRole";
    this.http
      .post(url, { pageNo: 1, pageSize: 999 })
      .subscribe(({ data: { rows } }) => {
        this.selectOptions.roleList = rows.map(({ roleCode, roleName }) => ({
          label: roleName,
          value: roleCode,
        }));
      });
  }

  spItemsChecked(value) {
    const nonRequiredFields = this.formValues.get('nonRequiredFields').value as string || ''
    return nonRequiredFields.includes(value)
  }

  handleSpItemsChange(val: string[]) {
    const nonRequiredFields = this.nonRequiredFields.value as string || ''
    if (nonRequiredFields.includes('winningNoticeFiles')) {
      val.push('winningNoticeFiles')
    }
    this.formValues.patchValue({
      nonRequiredFields: val.join(',')
    })
  }

  handleWinningNoticeFilesChange(checked: boolean) {
    const nonRequiredFieldsSet = new Set((this.nonRequiredFields.value as string || '').split(','))
    if (checked) {
      nonRequiredFieldsSet.add('winningNoticeFiles')
    } else {
      nonRequiredFieldsSet.delete('winningNoticeFiles')
    }
    this.formValues.patchValue({
      nonRequiredFields: Array.from(nonRequiredFieldsSet).join(',')
    })
  }

  async handleDeleteItem(item) {
    try {
      this.tableData.loading = true;
      await this.spItemService.deleteItem(item.id);
      this.message.success("删除成功");
      this.getTableData();
    } catch ({ message }) {
      this.message.error(message);
    } finally {
      this.tableData.loading = false;
    }
  }

  async handleToggleItemStatus({ id, name, description, enabled, roleList }) {
    try {
      this.tableData.loading = true;
      await this.spItemService.updateItem({
        id,
        name,
        description,
        enabled: enabled ? 1 : 0,
        roleList,
      });
      this.message.success("修改成功");
    } catch ({ message }) {
      this.message.error(message);
    } finally {
      this.tableData.loading = false;
    }
  }

  handlePageIndexChange(pageIndex) {
    this.queryParams.pageNo = pageIndex;
    this.getTableData();
  }

  handlePageSizeChange(pageSize) {
    this.queryParams.pageSize = pageSize;
    this.getTableData();
  }

  async getTableData() {
    try {
      this.tableData.loading = true;
      const { rows, total } = await this.spItemService.getItems(
        this.queryParams
      );
      this.tableData.list = rows;
      this.tableData.total = total;
    } catch ({ message }) {
    } finally {
      this.tableData.loading = false;
    }
  }

  resetForm() {
    this.formValues.reset();
    this.formValues.patchValue({
      enabled: true,
    });
  }

  handleShowAddForm() {
    this.formType = FORM_TYPE.NEW;
    this.resetForm();
    this.formVisible = true;
  }

  handleShowEditForm({ id, name, description, roleList, enabled, nonRequiredFields }) {
    this.formType = FORM_TYPE.EDIT;
    this.formValues.patchValue({
      id,
      name,
      description,
      roleList: typeof roleList === 'string' ? roleList.split(",") : [],
      nonRequiredFields,
      enabled: enabled === true || enabled === 1 ? true : false,
    });
    this.formVisible = true;
  }

  async handleSubmitForm() {
    // 校验表单
    for (let i in this.formValues.controls) {
      this.formValues.controls[i].markAsDirty();
      this.formValues.controls[i].updateValueAndValidity();
    }

    if (this.formValues.invalid) {
      this.message.error("请按要求填写表单信息");
      return;
    }

    const formValues = this.formValues.getRawValue();
    const data = {
      ...formValues,
      roleList: formValues.roleList.join(","),
      enabled: formValues.enabled ? 1 : 0,
    };
    const request =
      this.formType === FORM_TYPE.NEW
        ? this.spItemService.addItem(data)
        : this.spItemService.updateItem(data);

    try {
      this.submitBtnLoading = true;
      await request;
      this.formVisible = false;
      this.message.success(
        this.formType === FORM_TYPE.NEW ? `新增成功` : "修改成功"
      );
      this.getTableData();
    } catch ({ message }) {
      this.message.error(message);
    } finally {
      this.submitBtnLoading = false;
    }
  }
}
