import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { DictService, HttpService } from "@core/services";
import { NzMessageService } from "ng-zorro-antd";
import { BG_LIST } from "@pages/special-approval/special-approval.constants";
import { BehaviorSubject, Observable } from "rxjs";
import { debounceTime, switchMap } from "rxjs/operators";

@Component({
  selector: "task-assign-oit",
  templateUrl: "oit.component.html",
  styleUrls: ["oit.component.scss"],
})
export class OitComponent implements OnInit {
  isCollapse = true;
  assignDialogVisible = false;
  searchLoading = false;
  searchChange$ = new BehaviorSubject("");

  searchForm: FormGroup = this.fb.group({
    referenceId: [null], // Reference No
    hospitalName: [null], // 医院
    applicant: [null], // 销售邮箱
    opportunityId: [null], // Opportunity ID
    so: [null], // SO#/合同订单号
    oitMode: [null], // 进单模式
    dealFormId: [null], //deal Form Id
    bmc: [null], // BMC
    productModel: [null], // 产品型号
    dealerName: [null], // 经销商名称
    bigArea: [null], // 大区
    biddingNumber: [null], // 招标编号
    bidderName: [null], // 投标公司
    smallArea: [null], // 小区
    authorizationRequired: [null], // 是否授权 1是 0否
    businessModel: [null], //业务模式
    team: [null], // team
    modality: [null], // modality
    submitStartTime: [null], // 提交开始时间
    submitEndTime: [null], // 提交结束时间
    oitStartMonth: [null], // Oit开始月份
    oitEndMonth: [null], // Oit结束月份
    taskAssignee: [null], // 待办所有人
    taskAssigneeStatus: [0], // 待办所有人状态
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
    taskAssignee: [],
    oitMode: [],
    bmc: [],
    bigArea: [],
    businessModel: [],
    team: [],
    modality: BG_LIST,
  };

  checkedRowMap: { [key: string]: boolean } = {};

  constructor(
    private fb: FormBuilder,
    private dictService: DictService,
    private http: HttpService,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    this.initSelectOptions();
    this.getTableData();

    this.searchChange$
      .asObservable()
      .pipe(debounceTime(500))
      .pipe(
        switchMap((searchString: string) => {
          if (!searchString) {
            return Observable.create();
          }
          const params: any = {
            email: searchString,
          };
          const url = `/act/ecos/oit/cdUser`;
          return this.http.post(url, params);
        })
      )
      .subscribe(({ data: { rows } }) => {
        this.selectOptions.taskAssignee = [];
        const emailSet = new Set();
        rows.forEach(({ name, email }) => {
          if (!emailSet.has(email)) {
            emailSet.add(email);
            this.selectOptions.taskAssignee.push({
              label: `${name}(${email})`,
              value: email,
            });
          }
        });
        this.searchLoading = false;
      });
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

  transformOitMode(oitMode) {
    const item = this.selectOptions.oitMode.find(
      ({ code }) => code === oitMode
    );
    return item ? item.label : "";
  }

  handleCheckAll(checked) {
    this.dataTable.list.forEach(({ id }) => {
      this.checkedRowMap[id] = checked;
    });
  }

  handleSearchUser(searchString) {
    if (!searchString) {
      return;
    }
    this.searchLoading = true;
    this.searchChange$.next(searchString);
  }


  initSelectOptions() {
    this.dictService
      .dictDatas([
        "ENTRY_MODEL",
        "bmc",
        "region",
        "BUSINESS_MODEL",
        "ECOS_TEAMS",
      ])
      .subscribe(([oitMode, bmc, bigArea, businessModel, team]) => {
        this.selectOptions.oitMode = oitMode;
        this.selectOptions.bmc = bmc.sort((a, b) =>
          a.label.localeCompare(b.label)
        );
        this.selectOptions.bigArea = bigArea.sort((a, b) =>
          a.label.localeCompare(b.label)
        );
        this.selectOptions.businessModel = businessModel;
        this.selectOptions.team = team.sort((a, b) =>
          a.label.localeCompare(b.label)
        );
      });
  }

  disabledStartDate = (startDate: Date) => {
    const { submitEndTime } = this.searchForm.getRawValue();
    if (!startDate || !submitEndTime) {
      return false;
    }
    return startDate.getTime() >= submitEndTime.getTime();
  };
  disabledEndDate = (endDate: Date) => {
    const { submitStartTime } = this.searchForm.getRawValue();
    if (!endDate || !submitStartTime) {
      return false;
    }
    return endDate.getTime() <= submitStartTime.getTime();
  };

  disabledStartMonth = (startMonth: Date): boolean => {
    const { oitEndMonth } = this.searchForm.getRawValue();
    if (!startMonth || !oitEndMonth) {
      return false;
    }
    return startMonth.getTime() >= oitEndMonth.getTime();
  };
  disabledEndMonth = (endMonth: Date): boolean => {
    const { oitStartMonth } = this.searchForm.getRawValue();
    if (!endMonth || !oitStartMonth) {
      return false;
    }
    return endMonth.getTime() <= oitStartMonth.getTime();
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
    const params = {
      ...this.searchForm.getRawValue(),
      ...this.pageParams,
      orderByClause: "updateTime desc",
    };
    try {
      const { code, data, msg } = await this.http
        .post(`/act/ecos/apply/task/todo`, params)
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
