import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { HttpService } from "@core/services";
import { NzMessageService } from "ng-zorro-antd";

interface SortInfo {
  direction?: string;
  field?: string;
}

interface SearchParams {
  address?: string; // MaxLength:500, 地址
  auditStatus?: string;
  category?: string; // 类别
  city?: string; // 城市
  contactPhone?: string; // 联系电话
  country?: string; // 国家
  crmCode?: string; // CRM编码
  customerContact?: string; // 客户联系人
  customerNameLike?: string; // 客户名称
  customerType?: string; // 客户类型
  enName?: string; // 英文名称
  groupName?: string; // 集团名称
  nameUsedBefore?: string; // 曾用名
  no?: string; // 编号
  orderByClause?: string;
  pageNo?: number;
  pageSize?: number;
  postcode?: string; // 邮编
  province?: string; // 省份
  provinceName?: string; // 省名称
  sortInfos?: SortInfo[];
  status?: number; // 状态
}

interface Hospital {
  customerNameLike: string;
  address: string;
  no?: string; // 编号
  customerType?: string; // 客户类型
}

interface TableData {
  loading: boolean;
  rows: Hospital[];
  total: number;
}

const DEFAULT_SEARCH_PARAMS: SearchParams = {
  pageNo: 1,
  pageSize: 10,
  customerNameLike: null,
};

const DEFAULT_TABLE_DATA: TableData = {
  total: 0,
  rows: [],
  loading: false,
};

@Component({
  selector: "shared-select-hospital",
  templateUrl: "select-hospital.component.html",
})
export class SelectHospitalComponent implements OnInit {
  @Output() select: EventEmitter<Hospital> = new EventEmitter();
  visible: boolean = false;
  tableData = DEFAULT_TABLE_DATA;
  searchParams = DEFAULT_SEARCH_PARAMS;

  constructor(private http: HttpService, private message: NzMessageService) {}

  ngOnInit(): void {}

  @Input()
  modality: String[] = ["PD&IGT"];
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
      .post("/act/ecoscdcustomer/findByPage", {
        ...this.searchParams,
        modality: this.modality.filter(i=>i),
      })
      .subscribe(({ code, data }) => {
        if (code === "0000") {
          const { rows, total } = data;
          rows.map((row) => {
            if (row.category&&row.category.split(";").length === 1) {
              row.category = row.category.split(":")[1];
            }
          });
          this.tableData = { total, rows, loading: false };
        } else {
          this.handleRequestError();
        }
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

  onSelect(hospital: Hospital) {
    this.select.emit(hospital);
    this.onHide();
  }
}
