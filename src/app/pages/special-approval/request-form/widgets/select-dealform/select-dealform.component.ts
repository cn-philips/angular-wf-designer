import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NzMessageService} from 'ng-zorro-antd';

import { HttpService } from '@core/services/http.service'

export interface DealForm {
  dealFormId: string;
  dealerName: string;
  hospitalName?: string;
  businessType?: string;
  sales?: string;
  currency?: string;
  dealPriceCnyNet?: number;
  dealPriceCny?: number;
  dealPriceUsd?: number;
}

const DEFAULT_SEARCH_PARAMS = {
  pageNo: 1,
  pageSize: 5,
  dealerName: null,
  dealFormId: null,
  hospitalName: null
}

const DEFAULT_TABLE_DATA = {
  totalCount: 0,
  list: []
}

@Component({
  selector: 'app-select-dealform',
  templateUrl: './select-dealform.component.html',
  styleUrls: ['./select-dealform.component.scss']
})
export class SelectDealformComponent implements OnInit {

  visible: boolean = false
  tableLoading: boolean = false
  tableData = DEFAULT_TABLE_DATA
  searchParams = DEFAULT_SEARCH_PARAMS

  allDealList = []

  @Output() select: EventEmitter<DealForm> = new EventEmitter()

  constructor(private http: HttpService, private message: NzMessageService) { }

  showModal() {
    this.visible = true
    this.getDealFormList()
  }

  ngOnInit(): void {}

  handleRequestError(errMsg = '请求异常') {
    this.message.create("error", errMsg)
    this.tableLoading = false
  }

  getPagedDealerList() {
    const { pageNo, pageSize } = this.searchParams
    const start = (pageNo - 1) * pageSize
    const end = start + pageSize
    this.tableData.list = this.allDealList.slice(start, end)
  }

  getDealFormList(resetPageNo = false) {
    if (resetPageNo) { this.searchParams.pageNo = 1 }
    this.tableLoading = true
    this.http.post(`/act/spAdvancedPay/getDealform4OitAdvancedPay`, this.searchParams)
      .subscribe(({ code, data }) => {
        if (code === '0000') {
          const { rows, total } = data
          this.tableData.totalCount = total
          this.tableData.list = rows
          this.tableLoading = false
        } else {
          this.handleRequestError()
        }
      }),
      () => this.handleRequestError()
  }

  onHideModal() {
    this.visible = false
    this.searchParams = DEFAULT_SEARCH_PARAMS
    this.tableData = DEFAULT_TABLE_DATA
  }

  onSelectDealform(dealer: DealForm) {
    this.select.emit(dealer)
    this.onHideModal()
  }
}
