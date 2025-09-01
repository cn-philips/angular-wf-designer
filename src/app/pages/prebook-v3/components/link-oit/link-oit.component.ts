import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { NzMessageService } from "ng-zorro-antd";
import { HttpService } from "@core/services/http.service";

interface SearchParams {
  marketBundleAmount: number;
  marketBundleName: string;
  opportunityId?: string;
}
interface TableData {
  loading: boolean;
  rows: any[];
  total: number;
}

const DEFAULT_SEARCH_PARAMS: SearchParams = {
  marketBundleAmount: null,
  marketBundleName: null,
  opportunityId: null,
};

const DEFAULT_TABLE_DATA: TableData = {
  total: 0,
  rows: [],
  loading: false,
};

@Component({
  selector: 'prebook-v3-link-oit',
  templateUrl: './link-oit.component.html',
  styleUrls: ['./link-oit.component.scss']
})

export class LinkOitComponent implements OnInit {
  visible = false
  tableData = DEFAULT_TABLE_DATA;
  searchParams = DEFAULT_SEARCH_PARAMS;

  @Output() select: EventEmitter<any> = new EventEmitter();


  constructor(private http: HttpService, private message: NzMessageService) {}

  ngOnInit() { }

  handleRequestError(errMsg = "请求异常") {
    this.message.create("error", errMsg);
    this.tableData.loading = false;
  }

  getTableData() {
    const { marketBundleAmount, marketBundleName, opportunityId } = this.searchParams
    const url =
      `/act/ecos/prebook/order/oit/matchedOrders?marketBundleAmount=${marketBundleAmount}&marketBundleName=${marketBundleName}&opportunityId=${opportunityId}`
    this.tableData.loading = true;
    this.http
      .get(url)
      .subscribe(({ code, data }) => {
        if (code === "0000") {
          this.tableData.rows = data
          this.tableData.loading = false
        } else {
          this.handleRequestError();
        }
      });
  }
  getTableDataByList(params){
    const url =
      `/act/ecos/prebook/order/oit/matchedOrders4Us`
    this.tableData.loading = true;
    this.http
      .post(url,params)
      .subscribe(({ code, data }) => {
        if (code === "0000") {

          this.tableData.rows = data
          // this.tableData.rows = result
          this.tableData.loading = false
        } else {
          this.handleRequestError();
        }
      });
  }

  show(params) {
    this.visible = true
    this.searchParams = params
    this.getTableData()
  }
  showByList(params) {
    this.visible = true
    this.searchParams = params
    this.getTableDataByList(params)
  }

  onHide() {
    this.visible = false;
    this.searchParams = DEFAULT_SEARCH_PARAMS;
    this.tableData = DEFAULT_TABLE_DATA;
  }

  onSelect(oitOrder) {
    this.select.emit(oitOrder)
    this.onHide()
  }
}
