import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NzMessageService} from 'ng-zorro-antd';

import { HttpService } from '@core/services/http.service'

export interface Hospital {
  no: string;
  customerName: string;
}

const DEFAULT_SEARCH_PARAMS = {
  pageNo: 1,
  pageSize: 5,
  customerName: null
}

const DEFAULT_TABLE_DATA = {
  totalCount: 0,
  list: []
}

@Component({
  selector: 'app-select-hospital',
  templateUrl: './select-hospital.component.html',
  styleUrls: ['./select-hospital.component.scss']
})
export class SelectHospitalComponent implements OnInit {

  visible: boolean = false
  tableLoading: boolean = false
  tableData = DEFAULT_TABLE_DATA
  searchParams = DEFAULT_SEARCH_PARAMS

  @Output() select: EventEmitter<Hospital> = new EventEmitter()

  constructor(private http: HttpService, private message: NzMessageService) { }

  ngOnInit(): void { }


  public showModal() {
    this.visible = true
    this.getHospitalList()
  }

  handleRequestError(errMsg = '请求异常') {
    this.message.create("error", errMsg)
    this.tableLoading = false
  }

  getHospitalList(resetPageNo = false) {
    if (resetPageNo) { this.searchParams.pageNo = 1 }
    this.tableLoading = true
    this.http.post(`/act/preparation/getEndUser`, this.searchParams)
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

  onSelectHospital(hospital: Hospital) {
    this.select.emit(hospital)
    this.onHideModal()
  }
}
