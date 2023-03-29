import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { HttpService } from '@core/services';
import { NzMessageService } from 'ng-zorro-antd';

interface SortInfo {
  direction?: string;
  field?: string;
}

interface SearchParams {
  marketBundleName?:string;
  modalityBmc?:string;
  productModel?:string;
  registrationNumber?:string;
  pageNo?: number;
  pageSize?: number;
}

interface User {
  name: string;
  email: string;
}

interface TableData {
  loading: boolean;
  rows: User[];
  total: number;
}

const DEFAULT_SEARCH_PARAMS: SearchParams = {
  pageNo: 1,
  pageSize: 10,
  modalityBmc: null,
  productModel:null,
  registrationNumber:null,
}

const DEFAULT_TABLE_DATA: TableData = {
  total: 0,
  rows: [],
  loading: false,
}

@Component({
  selector: 'prebook-v3-select-nmpa',
  styleUrls: ["./select-nmpa.component.scss"],
  templateUrl: 'select-nmpa.component.html',
})

export class SelectNmpaComponent implements OnInit {

  @Output() select: EventEmitter<User> = new EventEmitter()
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
    this.http.post('/act/ecos/oit/nmpa', this.searchParams)
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

  onSelect(user: User) {
    this.select.emit(user)
    this.onHide()
  }
}