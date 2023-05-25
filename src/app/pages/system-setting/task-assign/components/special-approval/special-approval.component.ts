import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { DictService, HttpService } from "@core/services";
import { NzMessageService } from "ng-zorro-antd";
import * as moment from "moment";
import {
  APPLY_TYPES,
  BG_LIST,
} from "@pages/special-approval/special-approval.constants";
import { SpecialApprovalService } from "@pages/special-approval/special-approval.service";
import { BehaviorSubject, Observable } from "rxjs";
import { debounceTime, switchMap } from "rxjs/operators";

@Component({
  selector: "task-assign-sp",
  templateUrl: "special-approval.component.html",
  styleUrls: ["special-approval.component.scss"],
})
export class SpecialApprovalComponent implements OnInit {
  isCollapse = true;
  assignDialogVisible = false;
  searchLoading = false;
  searchChange$ = new BehaviorSubject("");

  searchForm: FormGroup = this.fb.group({
    applyType: [null], // 申请类型
    orderBg: [null], // BG
    keyword: [null], // 关键字
    submitStartTime: [null], // 提交开始时间
    submitEndTime: [null], // 提交结束时间
    delegatedUser: [null], // 待办所有人
    delegatedUserStatus: [0], // 待办所有人状态
  });

  pageParams = {
    pageNo: 1,
    pageSize: 10,
  };

  dataTable = {
    list: [],
    total: 0,
    loading: false,
  };

  selectOptions = {
    delegatedUser: [],
    applyType: APPLY_TYPES,
    orderBg: BG_LIST,
  };

  searchString

  checkedRowMap: { [key: string]: boolean } = {};

  constructor(
    private fb: FormBuilder,
    private dictService: DictService,
    private http: HttpService,
    private message: NzMessageService,
    public spService: SpecialApprovalService
  ) {}

  ngOnInit() {
    this.getTableData();

    this.searchChange$
      .asObservable()
      .pipe(debounceTime(500))
      .pipe(
        switchMap((searchString: string) => {
          if (!searchString) {
            return Observable.create();
          }
          this.searchString = searchString
          const url = `/act/ecos/oit/cdUser`;
          return this.http.post(url, {
            email: searchString,
          });
        })
      )
      .subscribe(({ data: { rows } }) => {
        this.selectOptions.delegatedUser = [];
        const emailSet = new Set();
        rows.forEach(({ name, email }) => {
          if (!emailSet.has(email)) {
            emailSet.add(email);
            this.selectOptions.delegatedUser.push({
              label: `${name}(${email})`,
              value: email,
            });
          }
        });
        if (rows.length === 0) {
          this.selectOptions.delegatedUser.push({
            label: this.searchString,
            value: this.searchString,
          });
        }
        this.searchLoading = false;
      });
  }

  handleSearchUser(searchString) {
    if (!searchString) {
      return;
    }
    this.searchLoading = true;
    this.searchChange$.next(searchString);
  }

  allChecked() {
    const { list } = this.dataTable;
    if (Array.isArray(list) && list.length > 0) {
      for (let i = 0; i < list.length; i++) {
        if (!this.checkedRowMap[list[i].id]) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  checkedRows() {
    return this.dataTable.list.filter(({ id }) => this.checkedRowMap[id]);
  }

  handleCheckAll(checked) {
    this.dataTable.list.forEach(({ id }) => {
      this.checkedRowMap[id] = checked;
    });
  }

  disabledStartDate = (startDate: Date) => {
    const { submitEndTime } = this.searchForm.getRawValue();
    if (!startDate || !submitEndTime) {
      return false;
    }
    return startDate.getTime() > submitEndTime.getTime();
  };
  disabledEndDate = (endDate: Date) => {
    const { submitStartTime } = this.searchForm.getRawValue();
    if (!endDate || !submitStartTime) {
      return false;
    }
    return endDate.getTime() <= submitStartTime.getTime();
  };

  handleToggleCollapse() {
    this.isCollapse = !this.isCollapse;
  }

  handlePageSizeChange(pageSize: number) {
    this.pageParams.pageSize = pageSize;
    this.getTableData();
  }

  handleSearch(pageNo = 1) {
    this.pageParams.pageNo = pageNo;
    this.getTableData();
  }

  async getTableData() {
    this.dataTable.loading = true;

    const {
      applyType,
      orderBg,
      keyword,
      submitStartTime,
      submitEndTime,
      delegatedUser,
      delegatedUserStatus,
    } = this.searchForm.getRawValue();
    const params: any = {
      ...this.pageParams,
      orderByClause: "updateTime desc",
    };
    if (submitStartTime) {
      params.submitStartTime = moment(submitStartTime).format("YYYY-MM-DD");
    }

    if (submitEndTime) {
      params.submitEndTime = moment(submitEndTime).format("YYYY-MM-DD");
    }

    keyword && (params.keyword = keyword);
    applyType && (params.applyType = applyType);
    orderBg && (params.orderBg = orderBg);

    if (delegatedUser) {
      params.delegatedUser = delegatedUser;
      params.includeDelegated = 1;
    }

    if (delegatedUserStatus !== null) {
      params.delegatedUserStatus = delegatedUserStatus;
    }

    try {
      const { code, data, msg } = await this.http
        .get(`/act/specialapprove/process/instance/task/todo`, { params })
        .toPromise();
      // success
      if (code === "0000") {
        const { rows, total } = data;
        this.dataTable.list = rows;
        this.dataTable.total = total;
      } else {
        this.message.error(msg);
      }
    } catch ({ message }) {
      this.message.error(message);
    } finally {
      this.dataTable.loading = false;
    }
  }

  handleReset() {
    this.pageParams.pageNo = 1;
    this.searchForm.reset();
    this.searchForm.patchValue({ delegatedUserStatus: 0 });
    this.getTableData();
  }

  handleShowAssignDialog() {
    this.assignDialogVisible = true;
  }

  handleAssignSuccess() {
    this.assignDialogVisible = false;
    this.message.success("转派成功");
    this.getTableData();
  }
}
