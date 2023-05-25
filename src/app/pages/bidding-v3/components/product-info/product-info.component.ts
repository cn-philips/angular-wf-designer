import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { BiddingV3Service } from '@pages/bidding-v3/bidding-v3.service';
import { BUSINESS_MODEL_DIRECT } from "../../bidding-v3.constants";
import { AddProductComponent } from '../add-product/add-product.component';
import { ClipboardService } from 'ngx-clipboard'
import { NzMessageService } from 'ng-zorro-antd'
import { Subject } from 'rxjs';

@Component({
  selector: 'bidding-v3-product-info',
  templateUrl: './product-info.component.html',
  styleUrls: ['./product-info.component.scss']
})
export class ProductInfoComponent implements OnInit {

  
  @Input() showReopenButton = false
  @Input() agreementList = []
  @Input() biddingForm: FormGroup
  @Input() disabled = false
  @Input() editable = false // 商务专员审核时, 可以修改产品型号和医疗器械名称
  @Input() subTierSubject: Subject<{ type: string, data: any }>

  @Output() showImportOpp = new EventEmitter()
  @Output() agreementChange = new EventEmitter()
  @Output() reopenForm = new EventEmitter()

  @ViewChild('addProduct') addProduct: AddProductComponent

  activeProduct: FormGroup

  optionVisible = false

  ccOptions = {
    loading: false,
    data: []
  }

  BUSINESS_MODEL_DIRECT = BUSINESS_MODEL_DIRECT

  get marketBundles(): FormArray {
    return this.biddingForm ? this.biddingForm.get('marketBundles') as FormArray : null
  }

  get dataSource(): string {
    return this.biddingForm ? this.biddingForm.get('dataSource').value : null
  }

  get businessModel() {
    return this.biddingForm.get('basicInfo').get('baseInfo').get('businessModel').value
  }

  get latestAgreementList() {
    return this.agreementList.filter(({ isDtc}) => !isDtc)
  }

  constructor(
    private biddingV3Service: BiddingV3Service,
    private clipboardService: ClipboardService,
    private message: NzMessageService,
  ) { }

  ngOnInit(): void {}

  getTitle(product: FormGroup) {
    const { opportunityId, dealFormId } = product.getRawValue()
    const oppId = `<span>Opportunity ID : ${opportunityId || '无商机Opportunity'}</span>`
    const dealId = `<span>Deal Form ID : ${dealFormId}</span>`
    return this.dataSource == 'CP Deal Form' ? oppId + dealId : oppId
  }

  showImportOppDialog() {
    this.showImportOpp.emit()
  }

  checkEmpty() {
    if (this.marketBundles.length === 0) {
      this.biddingForm.patchValue({
        dataSource: null,
        accountName: null,
      })
      const basicInfo = this.biddingForm.get('basicInfo') as FormGroup
      const baseInfo = basicInfo.get('baseInfo') as FormGroup
      baseInfo.patchValue({
        biddingProgramName: null,
        businessModel: null,
        biddingType: null,
        biddingNumber: null,
        biddingOrgName: null,
        biddingOpenDate: null
      })
      const finalUser = basicInfo.get('finalUser') as FormGroup
      finalUser.patchValue({
        hospitalName: null,
        customerCode: null,
        customerType: null,
        groupPurchaseCompany: null,
        customerCategory: null,
        customerProvince: null,
      })
    }
  }

  onCopyText($event: Event, text) {
    $event.stopPropagation()
    console.log($event, text);
    this.clipboardService.copyFromContent(text)
    this.message.success('Copied')
  }

  onDeleteOpportunity(index, marketBundle) {
    this.subTierSubject.next({ type: 'delete', data: marketBundle.get('opportunityId').value })
    this.marketBundles.removeAt(index)
    this.checkEmpty()
  }

  onDeleteProduct(marketBundle, marketBundleIndex, productIndex) {
    const products = marketBundle.get('products') as FormArray
    products.removeAt(productIndex)
    console.log({ marketBundle, marketBundleIndex, productIndex });
    if (products.length === 0) {
      this.subTierSubject.next({ type: 'delete', data: marketBundle.get('opportunityId').value })
      this.marketBundles.removeAt(marketBundleIndex)
    }
    this.checkEmpty()
  }

  onDealerAgreementChange(product, agreementNo) {
    const agreement = this.agreementList.find(({ value }) => value === agreementNo)
    if (agreement) {
      const { currentproduct, currentterritory } = agreement
      product.patchValue({
        authorizedProduct: currentproduct,
        authorizedArea: currentterritory,
      })
    }
    this.agreementChange.emit()
  }

  showCcOptions(product: FormGroup) {
    this.activeProduct = product
    const options = product.get('options').value
    if (options && options.length > 0) {
      this.getCcOptions(options[0])
      this.optionVisible = true
    }
  }

  getCcOptions({ cpProductId, id }) {
    this.ccOptions.data = []
    this.ccOptions.loading = true
    const data = {
      productId: id || cpProductId,
      internal: id ? 1: 0
    }
    this.biddingV3Service.getCcOptions(data).subscribe(({ data }) => {
      const { rows } = data
      this.ccOptions.data = rows
      this.ccOptions.loading = false
    })
  }

  onToggleCcOptionTab(data) {
    this.getCcOptions(data)
  }

  onReopenForm() {
    this.reopenForm.emit()
  }

  onShowAddProduct(marketBundle: FormGroup) {
    this.addProduct.show(this.biddingForm, marketBundle)
  }
}
