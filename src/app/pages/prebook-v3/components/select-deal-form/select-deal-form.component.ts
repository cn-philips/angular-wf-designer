import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { NzMessageService } from "ng-zorro-antd";

import { HttpService } from "@core/services/http.service";
import { ActivatedRoute } from "@angular/router";

interface SearchParams {
  pageNo?: number;
  pageSize?: number;
  dealFormId?: string;
  id?: string;
  repeatCheck?: boolean;
}
interface TableData {
  loading: boolean;
  rows: [];
  total: number;
}

const DEFAULT_SEARCH_PARAMS: SearchParams = {
  pageNo: 1,
  pageSize: 10,
  dealFormId: null,
  id: null,
  repeatCheck: false,
};

const DEFAULT_TABLE_DATA: TableData = {
  total: 0,
  rows: [],
  loading: false,
};

@Component({
  selector: "prebook-v3-select-deal-form",
  styleUrls: ["./select-deal-form.component.scss"],
  templateUrl: "./select-deal-form.component.html",
})
export class SelectDealFormComponent implements OnInit {
  @Output() select: EventEmitter<any> = new EventEmitter();
  visible: boolean = false;
  tableData = DEFAULT_TABLE_DATA;
  searchParams = DEFAULT_SEARCH_PARAMS;

  constructor(
    private http: HttpService,
    private message: NzMessageService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // 主页导入
    this.handleImport();
  }

  handleRequestError(errMsg = "请求异常") {
    this.message.create("error", errMsg);
    this.tableData.loading = false;
  }

  /**
   *
   * @param resetPageNo 是否重置分页数据
   */
  getTableData(resetPageNo = false) {
    if (resetPageNo) {
      this.searchParams.pageNo = 1;
    }
    this.tableData.loading = true;
    this.http
      .post("/act/ecos/oit/cpDealForm", this.searchParams)
      .subscribe(({ code, data }) => {
        if (code === "0000") {
          if (data) {
            const { rows, total } = data;
            this.tableData = { total, rows, loading: false };
          } else {
            this.tableData = { total: 0, rows: [], loading: false };
          }
        } else {
          this.handleRequestError();
        }
      });
  }

  getDealFormInfo(dealFormId) {
    this.tableData.loading = true;
    const url = `/act/ecos/oit/cpDealFormInfoPrebook/${dealFormId}`;
    this.http.get(url).subscribe(({ code, data, msg }) => {
      if (code === "0000") {
        this.select.emit(data);
        this.onHide();
      } else {
        this.message.error(msg)
      }
      this.tableData.loading = false;
    });
  }

  /**
   *
   * @param searchParams 默认的查询参数
   * @param loadData 是否首次加载数据
   */
  show(searchParams: SearchParams = {}, loadData = false) {
    this.searchParams = {
      ...this.searchParams,
      ...searchParams,
    };
    this.visible = true;
    if (loadData) {
      this.getTableData();
    }
  }

  onHide() {
    this.visible = false;
    // 重置数据
    this.searchParams = DEFAULT_SEARCH_PARAMS;
    this.tableData = DEFAULT_TABLE_DATA;
  }

  onSelect(dealer) {
    this.getDealFormInfo(dealer.dealFormId);
  }

  // 处理首页导入的操作
  public handleImport() {
    this.activatedRoute.queryParams.subscribe((queryParams) => {
      let dealFormId = queryParams["_DEALFORMID"];
      if (dealFormId) {
        this.handleImportByDealFormId(dealFormId);
      }
    });
  }
  handleImportByDealFormId(dealFormId) {
    dealFormId = dealFormId.toString().trim();
    this.onSelect({ dealFormId });
  }
}
