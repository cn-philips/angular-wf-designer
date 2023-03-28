import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { HttpService } from '@core/services';
import { NzMessageService } from 'ng-zorro-antd';

interface SortInfo {
  direction?: string;
  field?: string;
}

interface SearchParams {
  area?: string; // 区域
  blockDate?: string;
  corporateAddress?: string; // 中文地址
  corporateAddressEn?: string; // 英文地址
  corporateName?: string; // 外贸公司名称
  corporateNameEn?: string; // 英文名称
  creditRating?: string; // 进出口信用等级
  ddpStatus?: string; // DDP Status
  ddpValidUntil?: string; // DDP有效期截止日期
  pageNo?: number;
  pageSize?: number;
  province?: string; // 省份
  reminderMessage?: string;
  serialNumber?: number; // 编号
  sortInfos?: SortInfo[];
  status?: number;
  unblockDate?: string;
}

interface Company {
  corporateName: string;
  corporateAddress: string;
  serialNumber?: string; // 编号
}

interface TableData {
  loading: boolean;
  rows: Company[];
  total: number;
}

const DEFAULT_SEARCH_PARAMS: SearchParams = {
  pageNo: 1,
  pageSize: 10,
  corporateName: null,
}

const DEFAULT_TABLE_DATA: TableData = {
  total: 0,
  rows: [],
  loading: false,
}

@Component({
  selector: 'shared-select-foreign-company',
  templateUrl: 'select-foreign-company.component.html'
})

export class SelectForignCompanyComponent implements OnInit {

  @Output() select: EventEmitter<Company> = new EventEmitter()
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
    this.http.post('/act/ecosiepool/findByPage', this.searchParams)
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

  onSelect(company: Company) {
    this.select.emit(company)
    this.onHide()
  }
}