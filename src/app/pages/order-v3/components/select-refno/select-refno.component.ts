import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NzMessageService} from 'ng-zorro-antd';

import { HttpService } from '@core/services/http.service'

interface SearchParams {
  pageNo?: number;
  pageSize?: number
  applicant?: string;
  marketBundleName?:string;
  marketBundleAmount?:string;
}
interface TableData {
  loading: boolean;
  rows:[];
  total: number;
}

const DEFAULT_SEARCH_PARAMS: SearchParams = {
  pageNo: 1,
  pageSize:10, 
  applicant: null,
  marketBundleName:null,
  marketBundleAmount:null,
}

const DEFAULT_TABLE_DATA: TableData = {
  total: 0,
  rows: [],
  loading: false,
}

@Component({
  selector: 'select-refno',
  styleUrls: ["./select-refno.component.scss"],
  templateUrl:'./select-refno.component.html',
})
export class SelectRefnoComponent implements OnInit {
  
  @Output() select: EventEmitter<any> = new EventEmitter()
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
      this.http.post('/act/ecos/oit/findCancelContract', this.searchParams)
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
  
    onSelect(dealer) {
      this.select.emit(dealer)
      this.onHide()
    }
}