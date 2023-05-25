import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '@core/services';
import { NzMessageService } from 'ng-zorro-antd';
import { Subject, Subscription } from 'rxjs';
import { environment } from '@env';

@Component({
  selector: 'shared-dealer-table',
  templateUrl: 'dealer-table.component.html',
  styleUrls: ['./dealer-table.component.scss']
})
export class DealerTableComponent implements OnInit, OnDestroy {

  @Input() formGroup: FormGroup
  @Input() arrayName = 'subTiers'
  @Input() subTierSubject: Subject<{ type: string, data: any, disabled?: boolean }>
  
  subscriber: Subscription


  get subTiers(): FormArray {
    return this.formGroup.get(this.arrayName) as FormArray
  }

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private message: NzMessageService,
  ) { }

  ngOnInit() {
    this.subscriber = this.subTierSubject.subscribe(({ type, data, disabled }) => {
      if (type === 'add') {
        this.add(data, disabled)
      } else if (type === 'delete') {
        this.delete(data)
      }
    })
  }

  ngOnDestroy(): void {
    this.reset()
    if (this.subscriber) {
      this.subscriber.unsubscribe()
    }
  }

  getSupportFile(dealer: FormGroup) {
    return JSON.parse(dealer.get('supportFile').value)
  }

  createOpportunity() {
    const group = this.fb.group({
      crmOpId: [null],
      dealerSubTiers: this.fb.array([])
    })
    return group
  }

  createDealerSubTier() {
    return this.fb.group({
      id: [null],
      crmOpId: [null],
      simulationOpportunityId: [null],
      level: [null],
      name: [null],
      code: [null],
      isBlackList: [null],
      isOverLimit: [null],
      isWhiteList: [null],
      isDMSBlackList: [0], // 是否在DMS黑名单
      remark: [null],
      supportFile: [null],
      specialRemark: [null, [Validators.required]],
      dealerSubSpecialFile: [null, [Validators.required]],
    })
  }

  reset() {
    while (this.subTiers.length > 0) {
      this.subTiers.removeAt(0)
    }
  }

  delete(crmOpId) {
    const index = this.subTiers.getRawValue().findIndex((item) => item.crmOpId === crmOpId)
    this.subTiers.removeAt(index)
  }

  addItem({ crmOpId, dealerSubTiers }, disabled) {
    if (!crmOpId || !Array.isArray(dealerSubTiers)) {
      return
    }
    let opp
    const oppIndex = this.subTiers.getRawValue().findIndex((item) => item.crmOpId === crmOpId)
    if (oppIndex !== -1) {
      opp = this.subTiers.at(oppIndex)
    } else {
      opp = this.createOpportunity()
    }
    
    opp.patchValue({
      crmOpId
    })
    const dealerSubTiersArray = opp.get('dealerSubTiers') as FormArray
    dealerSubTiers.sort((left, right) => 
      left.level === right.level ?
        left.name.localeCompare(right.name) :
        left.level - right.level
    ).forEach((dealer) => {
      const isDealerExist = dealerSubTiersArray.getRawValue().findIndex((item) => dealer.name ? dealer.name === item.name : (dealer.cftId || dealer.code) === item.code)
      if (isDealerExist === -1) {
        const dealerGroup = this.createDealerSubTier()
        dealerGroup.patchValue({
          code: dealer.cftId,
          ...dealer,
          isDMSBlackList: (dealer.cftId || dealer.code || dealer.name) ? 0 : -1 // 如果经销商信息都为空, 直线显示否
        })
        if (disabled) {
          dealerGroup.disable()
        }
        dealerSubTiersArray.push(dealerGroup)
      }
    })
    if (oppIndex === -1) {
      this.subTiers.push(opp)
    }
    for (let i in dealerSubTiersArray.controls) {
      const group = (dealerSubTiersArray.controls[i] as FormGroup).controls
      for (let j in group) {
        group[j].markAsDirty()
        group[j].updateValueAndValidity()
      }
    }
    this.getDMSStatus({ crmOpId, dealerSubTiers })
  }

  add(data, disabled) {
    if (!data) { return }
     if (Array.isArray(data)) {
      data.forEach(item => {
        this.addItem(item, disabled)
      })
    } else {
      this.addItem(data, disabled)
    }
  }

  getDMSStatus({ crmOpId, dealerSubTiers }) {
    const url = '/act/ecosdealer/findDealerBlack'
    const data = dealerSubTiers.filter(({ cftId, name, code }) => cftId || name || code).map(({ cftId, name, code }) => ({ dealerCode: code || cftId, dealerName: name }))
    if (data.length === 0) {
      return
    }
    this.http
      .post(url, data)
      .subscribe(({ code, data }) => {
        const oppIndex = this.subTiers.getRawValue().findIndex((item) => item.crmOpId === crmOpId)
        const opp = this.subTiers.at(oppIndex)
        const dealerSubTiers = opp.get('dealerSubTiers') as FormArray
        if (code === '0000') {
          data.forEach(({ dealerName, dealerCode, blackList }) => {
            const dealerIndex = dealerSubTiers.getRawValue().findIndex(({ code, name }) => dealerName ? dealerName === name : dealerCode === code)
            const dealerSubTier = dealerSubTiers.at(dealerIndex)
            dealerSubTier.patchValue({
              isDMSBlackList: blackList ? 1 : -1
            })
            // 只有DMS结果是是
            if (!blackList) {
              dealerSubTier.get('specialRemark').clearValidators()
              dealerSubTier.get('dealerSubSpecialFile').clearValidators()
              dealerSubTier.get('specialRemark').markAsDirty()
              dealerSubTier.get('specialRemark').updateValueAndValidity()
              dealerSubTier.get('dealerSubSpecialFile').markAsDirty()
              dealerSubTier.get('dealerSubSpecialFile').updateValueAndValidity()
            }
          })
        }
      })
  }

  tableLoading = false
  // 从DMS接口下载文件
  onDownloadFile({ id }) {
    // 先校验
    const url = `/act/ecosdealer/verifyDmsFile/${id}`
    this.tableLoading = true
    this.http.get(url).subscribe(({ code, data }) => {
      if (code === '0000' && data) {
        window.open(`${environment.dmsDownloadUrl}/${id}`)
      } else {
        this.message.error('文件不存在')
      }
      this.tableLoading = false
    })
  }
}