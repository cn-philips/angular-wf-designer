import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { NzMessageService} from 'ng-zorro-antd';

import { SpecialApprovalService } from '../../../special-approval.service'
import { DEFAULT_ERROR_MESSAGE, BUSINESS_MODEL_MAP, ORDER_TYPES } from '../../../special-approval.constants'

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
  marketBundleQuantity: string; // 产品数量
  deBook: string;
  reBook: string;
  logisticsTime: null;
  cosMainId: string;
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
  orderTypes = ORDER_TYPES

  @Output() select: EventEmitter<Reference> = new EventEmitter()
  @Output() cancelModal: EventEmitter<any> = new EventEmitter()

  @Input() isMultipleSelect: boolean = false;
  @Input() defaultOrderType: string;
  @Output() selectMultiple: EventEmitter<Reference[]> = new EventEmitter()

  selectReferenceList: Reference[] = [];

  constructor(private spService: SpecialApprovalService, private message: NzMessageService) { }
  needCreateUser: boolean
  moneyHide: boolean
  ngOnInit(): void {
    this.onHideModal();
    this.searchParams =  {
      pageNo: 1,
      pageSize: 5,
      orderType: this.defaultOrderType ? this.defaultOrderType : null,
      sap: null,
      referenceId: null,
      endUser: null,
      distributor: null,
    }
  }

  //默认所有导入数据隐藏金额 moneyHide=true（false: 显示）
  public showModal(needCreateUser = true, moneyHide: boolean = true) {
    this.visible = true
    this.moneyHide = moneyHide
    this.needCreateUser = needCreateUser
    this.getReferenceList(false)
  }

  async getReferenceList(resetPageNo = false) {
    if (resetPageNo) { this.searchParams.pageNo = 1 }
    this.tableLoading = true
    try {
      const { rows, total } = await this.spService.getReferenceList(this.searchParams, this.needCreateUser)
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
    this.searchParams =  {
      pageNo: 1,
      pageSize: 5,
      orderType: this.defaultOrderType ? this.defaultOrderType : null,
      sap: null,
      referenceId: null,
      endUser: null,
      distributor: null,
    }
    this.tableData = {
      totalCount: 0,
      list: []
    }
    this.visible = false
  }

  onSelectReference(reference: Reference) {
    this.select.emit(reference)
    this.onHideModal()
  }

  onSelectMultipleReference() {
    this.selectMultiple.emit(this.selectReferenceList)
    this.selectReferenceList = []
    this.onHideModal()
  }

  refreshStatus(status, reference): void {
    if(status){
      this.selectReferenceList.push(reference);
    } else if(!status) {
      this.selectReferenceList = this.selectReferenceList.filter(val => reference !== val)
    }
  }

}
