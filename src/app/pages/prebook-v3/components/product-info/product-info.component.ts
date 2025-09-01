import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormGroup, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { PrebookV3Service } from '@pages/prebook-v3/prebook-v3.service';
import { NzMessageService } from 'ng-zorro-antd'
import { LinkOitComponent } from '../link-oit/link-oit.component';
import { validBmcList } from '@pages/prebook-v3/prebook-v3.utils'
import { SelectNmpaComponent } from '../select-nmpa/select-nmpa.component';

@Component({
  selector: 'prebook-v3-product-info',
  templateUrl: './product-info.component.html',
  styleUrls: ['./product-info.component.scss']
})

export class ProductInfoComponent implements OnInit {

  activeOrder: FormGroup

  @Input() prebookForm: FormGroup
  @Input() showLinkBtn = true
  @Input() dealerAgreementList = []
  @Input() showSOField: boolean
  @Input() isOAPorcessNode = false // 是不是OA处理的节点, 如果是, 可以编辑NMPA信息
  @Input() isOMFillSO = false

  @ViewChild('linkOit') linkOit: LinkOitComponent
  @ViewChild('selectNmpa') selectNmpa: SelectNmpaComponent;


  get orderInfo(): FormArray {
    return this.prebookForm.get('orderInfo') as FormArray
  }

  get businessModel(): string {
    return this.prebookForm.get('basicInfo').get('baseInfo').get('businessModel').value
  }

  constructor(
    private message: NzMessageService,
    private prebookV3Service: PrebookV3Service,
  ) { }

  ngOnInit() {
    this.setValidator4WbsNo();
  }

  setValidator4WbsNo(){
    if(this.isOMFillSO){
      this.orderInfo.controls.forEach(order => {
        if(this.isUsOrder(order as FormGroup)){
          const marketBundleInfo = order.get('marketBundleInfo') as FormArray
          marketBundleInfo.controls.forEach(bundle => {
            bundle.get('wbsNo').enable()
            bundle.get('wbsNo').setValidators([Validators.required, Validators.maxLength(100)])
            bundle.get('wbsNo').markAsDirty()
            bundle.get('wbsNo').updateValueAndValidity()
          })
        }
      });
    }
  }

  orderTitle(index, order: FormGroup) {
    return `进单单位${index+1}-${order.get('orderModality').value}`
  }

  isPDIGTOrder(order: FormGroup) {
    return order.get('orderModality').value == 'PD&IGT'
  }
  isUsOrder(order: FormGroup) {
    return order.get('orderModality').value == 'US'
  }

  hasValidMarketBundle(order: FormGroup) {
    let result = false
    const marketBundleInfo = order.get('marketBundleInfo') as FormArray
    marketBundleInfo.getRawValue().forEach(({ marketBundleBmc }) => {
      if (validBmcList.includes(marketBundleBmc)) {
        result = true
      }
    })
    return result
  }

  onDealerAgreementChange(marketBundle, agreementNo) {
    const agreement = this.dealerAgreementList.find(({ value }) => value === agreementNo)
    if (agreement) {
      const { authorizedArea, authorizedProduct } = agreement
      marketBundle.patchValue({
        authorizedProduct: authorizedArea,
        authorizedArea: authorizedProduct,
      })
    } else {
      marketBundle.patchValue({
        authorizedProduct: null,
        authorizedArea: null,
      })
    }
  }

  checkHasLinkedOitOrder(order: FormGroup, primaryOpp) {
    order.patchValue({ hasLinkedOitOrder: 0 })
    this.prebookV3Service.linkedOitOrders(primaryOpp).subscribe(({ data }) => {
      if (data && data.length > 0) {
        order.patchValue({ hasLinkedOitOrder: 1 })
      } else {
        order.patchValue({ hasLinkedOitOrder: 2 })
      }
    })
  }
  checkHasLinkedOitOrder4UsOrder(order: FormGroup,allMarketBundleInfo:Array<any>) {
    order.patchValue({ hasLinkedOitOrder: 0 })
    this.prebookV3Service.linkedOitOrders4UsOrder(allMarketBundleInfo).subscribe(({ data }) => {
      if (data && data.length > 0) {
        order.patchValue({ hasLinkedOitOrder: 1 })
      } else {
        order.patchValue({ hasLinkedOitOrder: 2 })
      }
    })
  }

  onIsDeletedChange(order: FormGroup, value) {
    if (!this.showLinkBtn) { return }
    order.patchValue({ hasLinkedOitOrder: 0 })
    const marketBundleInfo = order.get('marketBundleInfo') as FormArray
    if (value === 0) { // 选中作为Pre-book申请的order
      if (order.get('isDeleted').enabled) {
        marketBundleInfo.controls.forEach((marketBundle) => {
          const { marketBundleBmc } = marketBundle.value
          if (validBmcList.includes(marketBundleBmc)) {
            marketBundle.enable()
          }
        })
      }

      if(this.isUsOrder(order)) {
        const marketBundleInfo = order.get('marketBundleInfo') as FormArray
        this.checkHasLinkedOitOrder4UsOrder(order, marketBundleInfo.getRawValue())
      }else{
        const primaryOpp = this.getPrimaryOpp(order)
        if (primaryOpp) {
          this.checkHasLinkedOitOrder(order, primaryOpp)
        }
      }
    } else {
      order.patchValue({
        oitOrderId: null,
        oitReferenceId: null,
        oitOrderProcessStatus: null,
        oitOrderSo: null
      })
      marketBundleInfo.disable()
      // 清除主机标识
      marketBundleInfo.controls.forEach((item: FormGroup) => {
        item.patchValue({
          primaryOpportunity: false
        })
      })
    }
  }

  // 检查有没有选中的主机
  getPrimaryOpp(order: FormGroup) {
    const marketBundleInfo = order.get('marketBundleInfo') as FormArray
    let primaryOpp
    marketBundleInfo.getRawValue().forEach((item) => {
      const { primaryOpportunity } = item
      if (primaryOpportunity === 'true') {
        primaryOpp = item
      }
    })
    return primaryOpp
  }

  onShowLinkOit(order) {
    this.activeOrder = order
    if(this.isUsOrder(order)) {
      const marketBundleInfo = order.get('marketBundleInfo') as FormArray
      this.linkOit.showByList(marketBundleInfo.getRawValue())
    }else{
      const primaryOpp = this.getPrimaryOpp(order)
      if (!primaryOpp) {
        this.message.warning('请先选择主机')
        return
      }
      const { marketBundleName, marketBundleAmount, opportunityId } = primaryOpp
      this.linkOit.show({
        marketBundleName, marketBundleAmount, opportunityId
      })
    }
  }

  // 设置主机
  onSetPrimaryOpp(order: FormGroup, marketBundle: FormGroup, $event) {
    if (!this.showLinkBtn || marketBundle.disabled) { return }
    if ($event === 'true') {
      order.patchValue({
        oitOrderId: null,
        oitReferenceId: null,
        oitOrderProcessStatus: null,
        oitOrderSo: null
      })
      this.checkHasLinkedOitOrder(order, marketBundle.getRawValue())
      const marketBundleInfo = order.get('marketBundleInfo') as FormArray
      marketBundleInfo.controls.forEach(item => {
        if (item !== marketBundle) {
          item.patchValue({
            primaryOpportunity: false
          })
        }
      })
    }
  }

  onSelectLinkOit(order) {
    const { oitApplyId, orderId, orderSo, orderProcessStatus, referenceId, oitContractSummaryApplyId, oitProcInstId } = order
    this.activeOrder && this.activeOrder.patchValue({
      oitApplyId,
      oitContractSummaryApplyId,
      oitOrderId: orderId,
      oitReferenceId: referenceId,
      oitOrderProcessStatus: orderProcessStatus,
      oitOrderSo: orderSo,
      hasLinkedOitOrder: 0,
      oitProcInstId,
    })
  }

  goOitPage(order: FormGroup) {
    const { oitApplyId, oitOrderProcessStatus, oitProcInstId, oitContractSummaryApplyId } = order.getRawValue()
    let url = "";
    let orderExamine = [
      "ecos_oit_deal_countersign",
      "ecos_oit_deal_sales",
      "ecos_oit_deal_sub_process",
      "ecos_oit_deal_done",
      "ecos_oit_deal_canceled",
    ];
    let orderOa = ["ecos_oit_deal_oa"];
    let orderv3 = [
      "ecos_oit_deal_resubmit",
      "ecos_oit_deal_submit",
      "ecos_status_draft",
    ];
    let contract = ["ecos_oit_order_submit", "ecos_oit_order_resubmit"];
    let contractExamine = [
      "ecos_oit_order_oa",
      "ecos_oit_order_dm",
      "ecos_oit_order_zsl",
      "ecos_oit_order_install_terms",
      "ecos_oit_order_logistics_terms",
      "ecos_oit_order_nstd_countersign",
      "ecos_oit_order_site_terms",
      "ecos_oit_order_install_sup",
      "ecos_oit_order_sp_cop_leader",
      "ecos_oit_order_sp_cluster_bp",
      "ecos_oit_order_sp_countersign",
      "ecos_oit_order_sp_cfc_leader",
      "ecos_oit_order_payment_terms",
      "ecos_oit_order_payment_sup",
      "ecos_oit_order_rm",
      "ecos_oit_order_cancel_oa",
      "ecos_oit_order_cancel_dm",
      "ecos_oit_order_canceled",
    ];
    let ordersummary = [
      "ecos_oit_order_os_input",
      "ecos_oit_order_os_finance",
      "ecos_oit_order_os_finance_bp",
    ];
    let contractSign = ["ecos_oit_order_sign"];
    let oitcomplete = [
      "ecos_oit_order_upload",
      "ecos_oit_order_done",
      "ecos_oit_order_change_approval",
      "ecos_oit_order_change_submit",
      "ecos_oit_order_change_resubmit",
      "ecos_oit_order_change_first_approval",
      "ecos_oit_order_change_second_approval",
    ];
    if (orderExamine.includes(oitOrderProcessStatus)) {
      url = "/order-v3/orderExamine";
    } else if (orderOa.includes(oitOrderProcessStatus)) {
      url = "/order-v3/orderOa";
    } else if (orderv3.includes(oitOrderProcessStatus)) {
      url = "/order-v3";
    } else if (contract.includes(oitOrderProcessStatus)) {
      url = "/order-v3/contract";
    } else if (contractExamine.includes(oitOrderProcessStatus)) {
      url = "/order-v3/contractExamine";
    } else if (ordersummary.includes(oitOrderProcessStatus)) {
      url = "/order-v3/ordersummary";
    } else if (contractSign.includes(oitOrderProcessStatus)) {
      url = "/order-v3/contractSign";
    } else if (oitcomplete.includes(oitOrderProcessStatus)) {
      url = "/order-v3/oitcomplete";
    }
    const { origin, pathname } = location
    const fullUrl = origin + pathname + '#' + url + `?id=${oitContractSummaryApplyId || oitApplyId}&processStatus=${oitOrderProcessStatus}&taskStatus=${oitOrderProcessStatus}&procInstId=${oitProcInstId}&flag=1`
    window.open(fullUrl, '_blank')
  }

  activeMarketBundle: FormGroup

  onShowSelectNmpaModal(marketBundle: FormGroup) {
    this.activeMarketBundle = marketBundle
    const { productModel, marketBundleBmc } = marketBundle.getRawValue()
    this.selectNmpa.show({
      productModel,
      modalityBmc: marketBundleBmc
    }, true)
  }

  onNmpaFormSelect({ medicalDeviceName, registrationNumber, expiredBy }) {
    this.activeMarketBundle.patchValue({
      nmpaNum: registrationNumber,
      medicalDeviceName,
      nmpaValidityDate: expiredBy,
    })
  }
}
