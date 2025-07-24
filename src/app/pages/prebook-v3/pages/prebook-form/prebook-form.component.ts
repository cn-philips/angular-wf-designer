import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { FormArray } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { PrebookV3Service } from "@pages/prebook-v3/prebook-v3.service";
import { prebookForm, createOrder, initBasicInfo, validateForm, getFormData } from "@pages/prebook-v3/prebook-v3.utils"
import { NzMessageService, NzModalService } from "ng-zorro-antd";
import { BUSINESS_MODEL_DIRECT } from '@pages/bidding-v3/bidding-v3.constants'
import { ProgressTabsComponent } from "@app/modern-themes/components/progress-tabs/progress-tabs.component";
import { RouterExtendService } from "@app/modern-themes/services/router-extend.service";
import { Subject } from "rxjs";

@Component({
  templateUrl: "./prebook-form.component.html",
  styleUrls: ["./prebook-form.component.scss"],
})
export class PrebookFormComponent implements OnInit {
  subTierSubject = new Subject()

  activedTabId = "basic-info";
  activeTabIndex = 0;
  tabNames = ["basic-info", "product-info"]
  pageLoading = false;
  prebookForm = prebookForm()

  BUSINESS_MODEL_DIRECT = BUSINESS_MODEL_DIRECT

  dealerAgreementList = []

  originData = {
    applyId: null,
    prebook: { id: null }
  }

  fromTask

  public taskStatus: any = '';

  @ViewChild("tabs") tabs: ProgressTabsComponent;

  get orderInfo(): FormArray {
    return this.prebookForm.get('orderInfo') as FormArray
  }
  get allSelectedOrderIsInSameModality(): boolean {
    return this.orderInfo.controls.filter((order) => order.enabled&&!order.get('isDeleted').value).map(order=>order.get('orderModality').value).length === 1;
  }
  constructor(
    private activatedRoute: ActivatedRoute,
    private message: NzMessageService,
    private router: Router,
    private prebookV3Service: PrebookV3Service,
    private routerExtend: RouterExtendService,
    private modalService: NzModalService,
  ) {}

  ngOnInit() {
    const { queryParams: { id, taskStatus } } = this.activatedRoute.snapshot
    this.taskStatus = taskStatus;
    if (id) {
      this.getApplyDetail(id)
    }
  }

  getApplyDetail(applyId) {
    this.pageLoading = true
    this.prebookV3Service.detail(applyId).subscribe(({ data }) => {
      this.originData = data
      initBasicInfo(this.prebookForm, data, this.subTierSubject)
      // initOrderInfo(this.prebookForm, data)
      this.setOrderInfo(data.prebook.orderInfo)
      this.pageLoading = false
    })
  }

  onClickTab({ nextTab, activeIndex }) {
    this.activedTabId = nextTab;
    this.activeTabIndex = activeIndex;
  }

  clearOrderInfo() {
    while (this.orderInfo.length !== 0) {
      this.orderInfo.removeAt(0)
    }
  }

  setOrderInfo(orderInfo, calcSofoNo = false) {
    this.clearOrderInfo()
    if (Array.isArray(orderInfo)) {
      orderInfo.forEach((item) => {
        const order = createOrder(item)
        this.orderInfo.push(order)

        order.disable()
        order.get('isDeleted').enable()

        this.prebookV3Service.checkOrder(item.id, item.cpDealOrderId).subscribe(({ data }) => {
          if (!data) {
            order.patchValue({ isUsed: true })
          }
        })
      })

      if (calcSofoNo) {
        const sofonNo = Array.from(new Set(orderInfo.map(({ sofonNum }) => sofonNum).filter((sofonNum) => sofonNum))).join(';')
        this.prebookForm.patchValue({
          sofonNo
        })
      }
    }
  }

  async handleDealerChange(dealerCode) {
    const dealerAgreementList = await this.prebookV3Service.getDealerAgreementList(dealerCode)
    this.dealerAgreementList = dealerAgreementList.map((item) => ({ ...item, label:item.agreementNo,value: item.agreementNo}))
  }

  public handleToggleTab(val): void {
    if (typeof val === "number") {
      const tabName = this.tabNames[val];
      this.activedTabId = tabName;
      this.activeTabIndex = val;
    } else if (typeof val === "string") {
      const index = this.tabNames.findIndex((tabName) => tabName === val);
      if (index >= 0) {
        this.activedTabId = this.tabNames[index];
        this.activeTabIndex = index;
      }
    }
  }

  goPreStep() {
    this.handleToggleTab(this.activeTabIndex - 1);
  }

  goNextStep() {
    this.handleToggleTab(this.activeTabIndex + 1);
  }

  onSave() {
    this.pageLoading = true;
    const data = getFormData(this.prebookForm, this.originData)
    console.log(data);

    this.prebookV3Service.save(data).subscribe(({ code, msg }) => {
      if (code === '0000') {
        this.message.success("保存成功");
        // this.router.navigate(["/ecos/my-draft"]);
        this.routerExtend.back();
      } else {
        this.message.error(msg);
      }
      this.pageLoading = false;
    }, ({ message }) => {
      this.message.error(message);
      this.pageLoading = false;
    });
  }

  onSubmit() {
    const data = getFormData(this.prebookForm, this.originData)

    if (!data.dealFormId) {
      this.message.error('请先导入Deal Form信息')
      return
    }
    const valid = validateForm(this.prebookForm, this.tabs)

    if (data.prebook.businessModel !== BUSINESS_MODEL_DIRECT) {
      const subTierInfo = this.prebookForm.get('basicInfo').get('dealerInfo').get('subTierInfo') as FormArray
      if (subTierInfo.invalid) {
        this.modalService.error({
          nzTitle: '提示',
          nzContent: '经销商黑名单校验不通过，请上传必要的支持文件和备注后，再作提交'
        }).afterClose.subscribe(() => {
          this.handleToggleTab('basic-info')
          setTimeout(() => {
            document.querySelector('.dealer-info').scrollIntoView()
          }, 0);
        })
      }
    }

    if (!valid) {
      this.message.error('请按要求填写表单信息')
      return
    }
    this.pageLoading = true;
    this.prebookV3Service.submit(data).subscribe(({ code, msg }) => {
      if (code === '0000') {
        this.message.success("提交成功");
        // this.router.navigate(["/ecos/my-started"]);
        this.routerExtend.back();
      } else {
        this.message.error(msg);
      }
      this.pageLoading = false;
    }, ({ message }) => {
      this.message.error(message);
      this.pageLoading = false;
    });
  }

  //删除草稿
  deleteDraft() {
    this.pageLoading = true;
    const  { prebook }:any = this.originData;
    const { id } = prebook;
    this.prebookV3Service.deleteDraft(id).subscribe(({ code, msg }) => {
      if( code === '0000' ){
        this.message.create('success', '操作成功!');
        // this.router.navigate(['/ecos/my-draft']);
        this.routerExtend.back();
      } else {
        this.message.create('error', msg);
        return;
      }
      this.pageLoading = false;
    }, error => {
      this.message.create('error', `错误`);
      this.pageLoading = false;
    });
  }

  onCancel() {
    // this.router.navigate(["/ecos/my-started"]);
    this.routerExtend.back();
  }
}
