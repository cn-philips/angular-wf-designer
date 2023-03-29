import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NzMessageService} from 'ng-zorro-antd';

import { HttpService } from '@core/services/http.service'

interface SearchParams {
  agreementNo?: string;
  dealerCode?: string;
  dealerName?: string;
  dealerOldCode?: string;
  dealerStatus?: string;
  exclMdtbgname?: string[];
  invalid?: boolean;
  pageNo?: number;
  pageSize?: number;
  status?: string;
}

export interface Dealer {
  registeredAddress?: string
  agreementaddress?: string
  blockDate?: string
  companylegalrep?: string
  crmcode?: string
  dealeradmincellphone?: string
  dealercode?: string
  dealernameen?: string
  dealeroldcode?: string
  mailingaddress?: string
  mdtdealerddpexpiredate?: string
  mdtdealerddpstatus?: string
  mdtdealername?: string
  mdtdealerstatus?: string
  regaddress?: string
  reminderMessage?: string
  sapcode?: string
  unblockDate?: string
}

interface TableData {
  loading: boolean;
  rows: Dealer[];
  total: number;
}

const DEFAULT_SEARCH_PARAMS: SearchParams = {
  pageNo: 1,
  pageSize: 10,
  dealerName: null
}

const DEFAULT_TABLE_DATA: TableData = {
  total: 0,
  rows: [],
  loading: false,
}

@Component({
  selector: 'shared-select-dealer',
  templateUrl: './select-dealer.component.html',
})
export class SelectDealerComponent implements OnInit {
  
  @Output() select: EventEmitter<Dealer> = new EventEmitter()
  visible: boolean = false
  tableData = DEFAULT_TABLE_DATA
  searchParams = DEFAULT_SEARCH_PARAMS

  constructor(private http: HttpService, private message: NzMessageService) { }

  ngOnInit(): void {}

  handleRequestError(errMsg = '请求异常') {
    this.message.create("error", errMsg)
    this.tableData.loading = false
  }
  
   /**
   * 
   * @param resetPageNo 是否重置分页数据
   */
    getTableData(resetPageNo = false) {
      if (resetPageNo) { this.searchParams.pageNo = 1 }
      this.tableData.loading = true
      this.http.post('/act/ecosdealer/findDealersByPage', this.searchParams)
        .subscribe(({ code, data }) => {
          if (code === '0000') {
            const { rows, total } = data
            this.tableData = { total, rows, loading: false }
          } else {
            this.handleRequestError()
          }
        })
    }
  
    /**
     * 
     * @param searchParams 默认的查询参数
     * @param loadData 是否首次加载数据
     */
    show(searchParams: SearchParams = {}, loadData = false) {
      this.searchParams = {
        ...this.searchParams,
        ...searchParams
      }
      this.visible = true
      if (loadData) {
        this.getTableData()
      }
    }
  
    onHide() {
      this.visible = false
      // 重置数据
      this.searchParams = DEFAULT_SEARCH_PARAMS
      this.tableData = DEFAULT_TABLE_DATA
    }
  
    onSelect(dealer: Dealer) {
      this.select.emit(dealer)
      this.onHide()
    }
}
