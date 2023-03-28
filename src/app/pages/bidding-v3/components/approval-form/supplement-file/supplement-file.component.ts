import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BiddingV3Service } from '../../../bidding-v3.service';
import { NzMessageService } from 'ng-zorro-antd';
import { CURRENCIES } from '../../../bidding-v3.constants';
import { RouterExtendService } from '@app/modern-themes/services/router-extend.service';

@Component({
  selector: 'bidding-v3-supplement-file',
  templateUrl: './supplement-file.component.html',
  styleUrls: ['./supplement-file.component.scss']
})
export class SupplementFileComponent implements OnChanges {
  @Input() supplementFile: FormGroup
  @Input() disabled: boolean
  @Input() applyDetail = {
    id: null,
    applyId: null,
    biddingType: null,
    businessModel: null,
    customerType: null,
    lackingAwardNotice: null,
    lackingWinningNotice: null,
    lackingGoodsLetter: null,
    lackingOther: null,
    endUserContractFiles: null,
    winningNoticeFiles: null,
    siteSurveyReportFiles: null,
    confirmSupplementFiles: null,
  }

  selectOption = {
    currency: CURRENCIES,
  };

  get endUserContractFilesLabel(): string {
    return this.applyDetail.biddingType === '其他类型' ? '最终用户合同' : '中标通知书'
  }

  get winningNoticeFilesVisible(): boolean {
    return this.applyDetail.biddingType !== '其他类型'
  }

  get siteSurveyReportFilesLabel(): string {
    const { biddingType, customerType } = this.applyDetail
    if (customerType !== '公立医院') {
      return '场地勘验报告'
    } else if (biddingType !== '其他类型') {
      return '要货函'
    } else {
      return '场地勘验报告'
    }
  }

  constructor(
    public biddingV3Service: BiddingV3Service,
    private message: NzMessageService,
    private router: Router,
    private routerExtend: RouterExtendService


  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.applyDetail) {
      const { previousValue, currentValue } = changes.applyDetail
      if ((!previousValue || !previousValue.id) && currentValue.id) {
        this.initSupplementFile()
      }

      if (this.disabled) {
        this.supplementFile.disable()
      }
    }
  }

  onLackingFilesAddedChange() {
    for (let i in this.supplementFile.controls) {
      this.supplementFile.controls[i].markAsPristine()
    }
  }

  initSupplementFile() {
    const {
      lackingAwardNotice, lackingWinningNotice, lackingGoodsLetter, lackingOther,
      endUserContractFiles, winningNoticeFiles, siteSurveyReportFiles, confirmSupplementFiles,
      biddingAnnouncePrice, biddingAnnounceCurrency, biddingAnnounceDate, endTimeDate,
      specialApprovalDate, biddingNoticeSignDate, lackingFilesAdded,
    } = this.applyDetail as any
    this.supplementFile.patchValue({
      endUserContractFiles, winningNoticeFiles, siteSurveyReportFiles, confirmSupplementFiles
    })
    if (lackingAwardNotice === 1) {
      this.supplementFile.get('endUserContractFiles').setValidators([Validators.required])
    } else {
      this.supplementFile.get('endUserContractFiles').disable()
    }
    if (lackingWinningNotice === 1) {
      this.supplementFile.get('winningNoticeFiles').setValidators([Validators.required])
    } else {
      this.supplementFile.get('winningNoticeFiles').disable()
    }
    if (lackingGoodsLetter === 1) {
      this.supplementFile.get('siteSurveyReportFiles').setValidators([Validators.required])
    } else {
      this.supplementFile.get('siteSurveyReportFiles').disable()
    }
    if (lackingOther === 1) {
      this.supplementFile.get('confirmSupplementFiles').setValidators([Validators.required])
    } else {
      this.supplementFile.get('confirmSupplementFiles').disable()
    }
    this.supplementFile.patchValue({
      biddingAnnouncePrice,
      biddingAnnounceCurrency,
      biddingAnnounceDate,
      endTimeDate,
      specialApprovalDate,
      biddingNoticeSignDate,
      lackingFilesAdded,
    })

    this.supplementFile.get('specialApprovalDate').disable()
  }

  onSubmitSupplementFile() {
    const { lackingFilesAdded } = this.supplementFile.getRawValue()
    if (lackingFilesAdded === 1) {
      for (let i in this.supplementFile.controls) {
        this.supplementFile.controls[i].markAsDirty()
        this.supplementFile.controls[i].updateValueAndValidity()
      }
      if (this.supplementFile.invalid) {
        this.message.error('请按要求填写表单信息')
        return
      }
    }

    const { id, applyId } = this.applyDetail
    const data = {
      ...this.supplementFile.getRawValue(),
      id,
      applyId,
    }
    this.biddingV3Service.setPageLoading(true)
    this.biddingV3Service.submitSupplementFile(data).subscribe(({ code }) => {
      if (code === '0000') {
        this.message.success("提交成功!");
        // this.router.navigate(["/ecos/winningbid-supplement"]);
        this.routerExtend.back();
      } else {
        this.message.error("提交失败!");
      }
      this.biddingV3Service.setPageLoading(false)
    }, () => {
      this.message.error("提交失败!");
      this.biddingV3Service.setPageLoading(false)
    })
  }
}
