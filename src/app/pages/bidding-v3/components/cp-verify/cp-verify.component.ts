import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { BiddingV3Service } from '@pages/bidding-v3/bidding-v3.service';

@Component({
  selector: 'bidding-v3-cp-verify',
  templateUrl: './cp-verify.component.html',
  styleUrls: ['./cp-verify.component.scss']
})
export class CpVerifyComponent implements OnInit {
  @Output() verify = new EventEmitter()
  visible = false
  @Input()
  type:string ='BiddingConfirm' // BiddingConfirm 中标确认 , Authorization 授权发放

  tableData = []
  tableLoading = false

  hospitalName
  applicant
  hospitalId

  marketBundleMap = new Map()
  resultSet = new Set()

  constructor(private biddingV3Service: BiddingV3Service) { }

  ngOnInit(): void { }

  getTableData(applyId)  {
    this.tableLoading = true
    this.biddingV3Service.getCPVerifyResult(applyId).subscribe(({ data }) => {
      this.tableData = data.map((item) => ({ ...item, useStatus: 0, temUser: false, select: null, checkResult: '' }))
      this.tableLoading = false
    })
  }

  show({ applyId, applicant, hospitalName, hospitalId }) {
    this.visible = true
    this.hospitalName = hospitalName
    this.hospitalId = hospitalId
    this.applicant = applicant
    this.getTableData(applyId)
  }

  onVerify() {
    this.verify.emit()
    this.visible = false
  }

  okBtnDisabled() {
    let result = false
    this.tableData.forEach(({ checkResult }) => {
      if (checkResult !== true) {
        result = true
      }
    })
    return result
  }

  // 校验当前项
  onVerifyItem(item, result, i, j) {
    const { id } = item
    const resultId = this.marketBundleMap.get(id)
    this.marketBundleMap.set(id, result.marketBundleId)
    if (resultId) {
      this.resultSet.delete(resultId)
    }
    this.resultSet.add(result.marketBundleId)

    result.temUser = true
    item.cpVerifyResults.forEach((item, index) => {
      if (index !== j) {
        item.temUser = false
      }
    })
    // item.select = result.marketBundleId
    const { applicant, hospitalName, hospitalId } = result
    item.orderByCustomerNameCp = hospitalName
    item.winPerson = applicant

    let checkResultReasons = ''
    if (applicant.toLowerCase() !== this.applicant.toLowerCase()) {
      checkResultReasons += '申请人名称不一致;';
    }

    if (hospitalName !== this.hospitalName&&hospitalId !== this.hospitalId) {
      if(hospitalName !== this.hospitalName){
        checkResultReasons += '客户名称不一致;';
      }else{
        checkResultReasons += '客户Id不一致;';
      }
    }

    item.checkResultReasons = checkResultReasons
    if (checkResultReasons !== '') {
      item.checkResult = false
    } else {
      item.checkResult = true
    }
  }

  onSelectChange(i) {

  }

  onCancelVerifyItem(item, result, i, j) {
    item.checkResultReasons = ''
    item.checkResult = ''
    result.temUser = false
    this.resultSet.delete(result.marketBundleId)
  }
}
