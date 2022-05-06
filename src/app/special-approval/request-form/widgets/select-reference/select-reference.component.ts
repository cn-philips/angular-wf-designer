import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NzMessageService} from 'ng-zorro-antd';

import { SpecialApprovalService } from '../../../special-approval.service'
import { DEFAULT_ERROR_MESSAGE, BUSINESS_MODEL_MAP } from '../../../special-approval.constants'

export interface Reference {
  referenceId: string;
  orderType: string;
  projectName: string;
  productModel: string;
  sap: string;
  team: string;
  region: string;
  bmc: string;
  businessModel: string;
  distributor: string;
  dealerCode: string;
  endUser: string;
  endUserId: string;
  contractPrice: string;
  invoiceInformation: string;
  createUser: string; //添加crateuser用于转库判断是否展示金额
  logistician: string; // 对应OM
}

const DEFAULT_SEARCH_PARAMS = {
  pageNo: 1,
  pageSize: 5,
  orderType: null,
  sap: null,
  referenceId: null,
  endUser: null,
  distributor: null,
}

const DEFAULT_TABLE_DATA = {
  totalCount: 0,
  list: []
}

@Component({
  selector: 'app-select-reference',
  templateUrl: './select-reference.component.html',
  styleUrls: ['./select-reference.component.scss']
})
export class SelectReferenceComponent implements OnInit {

  visible: boolean = false
  tableLoading: boolean = false
  tableData = DEFAULT_TABLE_DATA
  searchParams = DEFAULT_SEARCH_PARAMS
  businessModelMap = BUSINESS_MODEL_MAP

  orderTypes = [
    { label: 'OIT', value: 'OIT' },
    { label: 'Pre-Book', value: '	Pre-Book' }
  ]

  @Output() select: EventEmitter<Reference> = new EventEmitter()

  constructor(private spService: SpecialApprovalService, private message: NzMessageService) { }

  ngOnInit(): void { }


  public showModal(needCreateUser = true) {
    this.visible = true
    this.getReferenceList(false, needCreateUser)
  }

  async getReferenceList(resetPageNo = false, needCreateUser = true) {
    if (resetPageNo) { this.searchParams.pageNo = 1 }
    this.tableLoading = true
    try {
      const { rows, total } = await this.spService.getReferenceList(this.searchParams, needCreateUser)
      this.tableData.totalCount = total
      this.tableData.list = rows || []
    } catch ({ message }) {
      this.message.error(DEFAULT_ERROR_MESSAGE)
      console.error(`reference列表加载失败, ${message}`);
    } finally {
      this.tableLoading = false
    }
  }

  onHideModal() {
    this.visible = false
    this.searchParams = DEFAULT_SEARCH_PARAMS
    this.tableData = DEFAULT_TABLE_DATA
  }

  onSelectReference(reference: Reference) {
    this.select.emit(reference)
    this.onHideModal()
  }
}
