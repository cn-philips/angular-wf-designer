import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { HttpService } from "@core/services";
import { NzMessageService } from "ng-zorro-antd";

interface SortInfo {
  direction?: string;
  field?: string;
}

interface SearchParams {
  model?: string; // 型号
  bmc?: string; // BMC
  modality?: string;
  pageNo?: number;
  pageSize?: number;
}

interface Product {
  model: string; // 型号
  bmc: string; // BMC
  modality: string;
}

interface TableData {
  loading: boolean;
  rows: Product[];
  total: number;
}

const DEFAULT_SEARCH_PARAMS: SearchParams = {
  model: "",
  bmc: "",
  modality: "",
  pageNo: 1,
  pageSize: 10,
};

const DEFAULT_TABLE_DATA: TableData = {
  total: 0,
  rows: [],
  loading: false,
};

@Component({
  selector: "select-imported-product",
  templateUrl: "select-imported-product.component.html",
})
export class SelectImportedProductComponent implements OnInit {
  @Output() select: EventEmitter<any> = new EventEmitter();

  @Input() modality: string;
  visible: boolean = false;
  tableData = DEFAULT_TABLE_DATA;
  searchParams = DEFAULT_SEARCH_PARAMS;

  constructor(private http: HttpService, private message: NzMessageService) {}

  ngOnInit(): void {}

  handleRequestError(errMsg = "请求异常") {
    this.message.create("error", errMsg);
    this.tableData.loading = false;
  }
  index: number;
  /**
   *
   * @param resetPageNo 是否重置分页数据
   */
  getTableData(resetPageNo = false) {
    if (resetPageNo) {
      this.searchParams.pageNo = 1;
    }
    this.tableData.loading = true;
    let total  = 100;

    this.http
    .post("/act/spImportedEquipment/getImportedEquipmentDict", {
      ...this.searchParams,
      modality : this.modality
    })
    .subscribe(({ code, data }) => {
      if (code === "0000") {
        const { rows, total } = data;
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
  show(searchParams: SearchParams = {}, loadData = false, index = -1) {
    this.index = index;
    this.searchParams = {
      ...this.searchParams,
      ...searchParams,
      modality: this.modality,
    };
    this.visible = true;
    if (loadData) {
      this.getTableData();
    }
  }

  onHide() {
    this.visible = false;
    this.index = -1;
    // 重置数据
    this.searchParams = DEFAULT_SEARCH_PARAMS;
    this.tableData = DEFAULT_TABLE_DATA;
  }

  onSelect(p: Product) {
    this.select.emit({...p, index:this.index});
    this.onHide();
  }
}
