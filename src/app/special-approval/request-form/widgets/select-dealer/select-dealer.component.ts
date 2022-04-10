import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NzMessageService} from 'ng-zorro-antd';

import { HttpService } from '../../../../services/http.service'

export interface Dealer {
  dealerCode: string;
  dealerName: string;
  registeredAddress: string;
}

const DEFAULT_SEARCH_PARAMS = {
  pageNo: 1,
  pageSize: 5,
  dealerName: null
}

const DEFAULT_TABLE_DATA = {
  totalCount: 0,
  list: []
}

@Component({
  selector: 'app-select-dealer',
  templateUrl: './select-dealer.component.html',
  styleUrls: ['./select-dealer.component.scss']
})
export class SelectDealerComponent implements OnInit {

  visible: boolean = false
  tableLoading: boolean = false
  tableData = DEFAULT_TABLE_DATA
  searchParams = DEFAULT_SEARCH_PARAMS

  allDealerList = []

  @Output() select: EventEmitter<Dealer> = new EventEmitter()

  constructor(private http: HttpService, private message: NzMessageService) { }

  showModal() {
    this.visible = true
    this.getDealerList()
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
    this.tableData.list = this.allDealerList.slice(start, end)
  }

  getDealerList(resetPageNo = false) {
    if (resetPageNo) { this.searchParams.pageNo = 1 }
    this.tableLoading = true
    this.http.post(`/act/preparation/getDealersOnlyWithRegFlag`, this.searchParams)
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

  onSelectDealer(dealer: Dealer) {
    this.select.emit(dealer)
    this.onHideModal()
  }
}
