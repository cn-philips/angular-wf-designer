import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import {
  CURRENCIES,
  BUSINESS_MODEL_DIRECT,
} from "../../../bidding-v3.constants";
import { BiddingV3Service } from "../../../bidding-v3.service";
import { NzMessageService, NzModalService } from "ng-zorro-antd";
import { RouterExtendService } from "@app/modern-themes/services/router-extend.service";
import { EXCLUDE_REFERENCE_NO } from '../../../bidding-v3.util'

@Component({
  selector: "bidding-v3-bidding-record",
  templateUrl: "./bidding-record.component.html",
  styleUrls: ["./bidding-record.component.scss"],
})
export class BiddingRecordComponent implements OnChanges {
  BUSINESS_MODEL_DIRECT = BUSINESS_MODEL_DIRECT;

  remarkMsgVisible = false;

  @Input() taskId;
  @Input() biddingForm: FormGroup
  @Input() disabled = false;

  @Input() biddingFilling: FormGroup;

  @Input() applyDetail = {
    id: null,
    applyId: null,
    dataSource: null,
    marketBundles: [],
    biddingType: null,
    customerType: null,
    businessModel: null,
    endUserContractFiles: null,
    winningNoticeFiles: null,
    tenderAndOtherCommitmentFiles: null,
    participationTenderLetterFiles: null,
    siteSurveyReportFiles: null,
    projectSolutionSupportReportFiles: null,
    biddingAwardPrice: null,
    biddingAwardCurrency: null,
    biddingAwardDate: null,
    lackingInfo: null,
    specialProject: null,
    biddingAwardCompany: null,
    distributorDdpDate: null,
    specialApprovalItems: null,
    referenceId: null,
    fullDocumentFields: null
  };
  @Input() ddpDateExpired = false;

  @Output() activeTab = new EventEmitter<string>()

  get spItemsVisible(): boolean {
    return !EXCLUDE_REFERENCE_NO.includes(this.applyDetail.referenceId)
  }

  get endUserContractFilesLabel(): string {
    return this.applyDetail.biddingType === "其他类型"
      ? "最终用户合同"
      : "中标通知书";
  }

  get winningNoticeFilesVisible(): boolean {
    return this.applyDetail.biddingType !== "其他类型";
  }

  get siteSurveyReportFilesLabel(): string {
    const { biddingType, customerType } = this.applyDetail;
    if (customerType !== "公立医院") {
      return "场地勘验报告";
    } else if (biddingType !== "其他类型") {
      return "要货函";
    } else {
      return "场地勘验报告";
    }
  }

  get approvedForm(): FormGroup {
    return this.biddingFilling.get("approvedForm") as FormGroup;
  }

  get specialApprovalItems(): FormArray {
    return this.approvedForm.get("specialApprovalItems") as FormArray;
  }

  get failureForm(): FormGroup {
    return this.biddingFilling.get("failureForm") as FormGroup;
  }

  selectOption = {
    currency: CURRENCIES,
  };

  get marketBundles(): FormArray {
    return this.biddingFilling
      .get("approvedForm")
      .get("marketBundles") as FormArray;
  }
  constructor(
    private message: NzMessageService,
    public biddingV3Service: BiddingV3Service,
    private router: Router,
    private routerExtend: RouterExtendService,
    private modalService: NzModalService,
    private fb: FormBuilder
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.applyDetail) {
      const { previousValue, currentValue } = changes.applyDetail;
      if ((!previousValue || !previousValue.id) && currentValue.id) {
        this.init();
      }
    }
  }

  createSpItemGroup() {
    return this.fb.group({
      // id: [null],
      // biddingApplyId: [null],
      specialApprovalProgramId: [null],
      name: [null],
      description: [null],
      roleList: [null],
      comment: [null],
      attachments: [null],
      status: [null],
      removed: [false],
      nonRequiredFields: [null],
    });
  }

  init() {
    this.initBiddingFilling();
    if (!this.disabled) {
      this.biddingFilling.patchValue({
        action: "approved",
      });
      this.disableAwardPrice();
    }

    this.initSpecialApprovalItems();
  }

  mergeSpecialApprovalItems(sourceItems, targetItems) {
    // 找出可用的列表
    const validSourceItems = sourceItems
      .filter(
        ({ comment, attachments, status }) =>
          status === 1 && (!!comment || (Array.isArray(attachments) && attachments.length > 0))
      )
      .sort((left, right) => left.name.localeCompare(right.name));
    const validTargetItems = targetItems
      .filter(({ enabled }) => enabled)
      .sort((left, right) => left.name.localeCompare(right.name));
    const sourceItemsMap = new Map();
    validSourceItems.forEach((item) => {
      sourceItemsMap.set(item.specialApprovalProgramId, item);
    });

    const targetItemsSet = new Set(
      validTargetItems.map(
        ({ specialApprovalProgramId }) => specialApprovalProgramId
      )
    );
    validTargetItems.forEach((item) => {
      const { specialApprovalProgramId, name, description, roleList, nonRequiredFields } = item;
      const specialApprovalItem = this.createSpItemGroup();
      const sourceItem = sourceItemsMap.get(specialApprovalProgramId);
      specialApprovalItem.patchValue({
        specialApprovalProgramId,
        name,
        description,
        roleList,
        nonRequiredFields,
        status: sourceItem ? sourceItem.status : null,
        comment: sourceItem ? sourceItem.comment : null,
        attachments: sourceItem ? sourceItem.attachments : null,
      });
      this.specialApprovalItems.push(specialApprovalItem);
    });

    validSourceItems.forEach((item) => {
      const {
        specialApprovalProgramId,
        name,
        description,
        roleList,
        comment,
        attachments,
        nonRequiredFields,
      } = item;
      if (!targetItemsSet.has(specialApprovalProgramId)) {
        const specialApprovalItem = this.createSpItemGroup();
        specialApprovalItem.patchValue({
          specialApprovalProgramId,
          name,
          description,
          roleList,
          status: 0,
          comment,
          attachments,
          nonRequiredFields,
          removed: true,
        });
        specialApprovalItem.disable();
        this.specialApprovalItems.push(specialApprovalItem);
      }
    });
  }

  async initSpecialApprovalItems() {
    if (!this.disabled) {
      const {
        data: { rows },
      } = await this.biddingV3Service.getSpItems();
      const sourceItems = this.applyDetail.specialApprovalItems || []
      const targetItems = rows.map((item) => ({ ...item, specialApprovalProgramId: item.id }))
      this.mergeSpecialApprovalItems(sourceItems, targetItems)
    } else if (this.applyDetail.specialApprovalItems) {
      this.applyDetail.specialApprovalItems
        .sort((left, right) => left.name.localeCompare(right.name))
        .forEach((item) => {
          const {
            specialApprovalProgramId,
            name,
            description,
            roleList,
            comment,
            status,
            attachments,
            nonRequiredFields,
          } = item;
          const specialApprovalItem = this.createSpItemGroup();
          specialApprovalItem.patchValue({
            specialApprovalProgramId,
            name,
            description,
            roleList,
            status,
            comment,
            attachments,
            nonRequiredFields,
          });
          specialApprovalItem.disable();
          this.specialApprovalItems.push(specialApprovalItem);
        });
    }
  }

  endUserContractFilesRequired = true
  participationTenderLetterFilesRequired = false
  siteSurveyReportFilesRequired = true
  fullDocumentFieldsRequired = false

  handleSpItemStatusChange(item: FormGroup) {
    // item.patchValue({
    //   comment: null,
    //   attachments: null,
    // })
    const spItems = this.specialApprovalItems.getRawValue().filter(({ status, nonRequiredFields }) => status === 1 && nonRequiredFields)
    const fieldSet = new Set()
    spItems.forEach(({ nonRequiredFields }: { nonRequiredFields: string }) => {
      nonRequiredFields.split(',').forEach((field) => {
        fieldSet.add(field)
      })
    })
    const endUserContractFiles = this.approvedForm.get('endUserContractFiles')
    if (fieldSet.has('endUserContractFiles')) {
      this.endUserContractFilesRequired = false
      endUserContractFiles.clearValidators()
      endUserContractFiles.updateValueAndValidity()
    } else {
      this.endUserContractFilesRequired = true
      endUserContractFiles.setValidators([Validators.required])
    }

    const siteSurveyReportFiles = this.approvedForm.get('siteSurveyReportFiles')
    if (fieldSet.has('siteSurveyReportFiles')) {
      this.siteSurveyReportFilesRequired = false
      siteSurveyReportFiles.clearValidators()
      siteSurveyReportFiles.updateValueAndValidity()
    } else {
      this.siteSurveyReportFilesRequired = true
      siteSurveyReportFiles.setValidators([Validators.required])
    }


    if (this.applyDetail.businessModel === BUSINESS_MODEL_DIRECT) {
      const participationTenderLetterFiles = this.approvedForm.get('participationTenderLetterFiles')
      if (fieldSet.has('participationTenderLetterFiles')) {
        this.participationTenderLetterFilesRequired = false
        participationTenderLetterFiles.clearValidators()
        participationTenderLetterFiles.updateValueAndValidity()
      } else {
        this.participationTenderLetterFilesRequired = true
        participationTenderLetterFiles.setValidators([Validators.required])
      }

      const fullDocumentFields = this.approvedForm.get('fullDocumentFields')
      if (fieldSet.has('fullDocumentFields')) {
        this.fullDocumentFieldsRequired = false
        fullDocumentFields.clearValidators()
        fullDocumentFields.updateValueAndValidity()
      } else {
        this.fullDocumentFieldsRequired = true
        fullDocumentFields.setValidators([Validators.required])
      }
    }

  }

  initBiddingFilling() {
    const {
      endUserContractFiles,
      winningNoticeFiles,
      tenderAndOtherCommitmentFiles,
      participationTenderLetterFiles,
      siteSurveyReportFiles,
      projectSolutionSupportReportFiles,
      fullDocumentFields,
      biddingAwardPrice,
      biddingAwardCurrency,
      biddingAwardDate,
      lackingInfo,
      specialProject,
      biddingAwardCompany,
      businessModel,
    } = this.applyDetail;
    // 根据中标价格(biddingAwardDate)字段是否有值来判断, 有值: 已中标, 无值: 未中标
    const isBidSuccess = !!biddingAwardDate;
    this.biddingFilling.patchValue({
      action: isBidSuccess ? "approved" : "failure",
    });
    if (isBidSuccess) {
      this.biddingFilling.patchValue({
        action: "approved",
        approvedForm: {
          endUserContractFiles,
          winningNoticeFiles,
          tenderAndOtherCommitmentFiles,
          participationTenderLetterFiles,
          siteSurveyReportFiles,
          projectSolutionSupportReportFiles,
          fullDocumentFields,
          biddingAwardPrice,
          biddingAwardCurrency,
          biddingAwardDate,
          lackingInfo,
          specialProject,
        },
      });
    } else {
      this.biddingFilling.patchValue({
        action: "failure",
        failureForm: {
          biddingAwardPrice,
          biddingAwardCurrency,
          biddingAwardCompany,
        },
      });
    }

    if (businessModel === BUSINESS_MODEL_DIRECT) {
      this.approvedForm
        .get("participationTenderLetterFiles")
        .setValidators([Validators.required]);

      this.approvedForm
        .get("fullDocumentFields")
        .setValidators([Validators.required]);
    }
    if (this.disabled) {
      this.biddingFilling.disable();
    }
  }

  disableAwardPrice() {
    this.marketBundles.controls.forEach((marketBundle: FormGroup) => {
      const products = marketBundle.get("products") as FormArray;
      products.controls.forEach((product: FormGroup) => {
        if (
          this.disabled ||
          (!this.disabled && !product.get("awardOrNot").value)
        ) {
          product.get("awardPrice").disable();
          product.get("awardCurrency").disable();
        }
      });
    });
  }

  onToggleProduct(product: FormGroup, isChecked) {
    const awardPrice = product.get("awardPrice");
    const awardCurrency = product.get("awardCurrency");
    awardPrice.setValue(null);
    awardCurrency.setValue(null);
    if (isChecked) {
      awardPrice.enable();
      awardCurrency.enable();
    } else {
      awardPrice.disable();
      awardCurrency.disable();
    }
  }

  // 退回至投标申请表
  onReject() {
    this.remarkMsgVisible = false;
    const { id, applyId } = this.applyDetail;
    const { processComments } = this.biddingFilling.getRawValue();
    if (!processComments || !processComments.trim()) {
      this.message.warning("请填写退回理由");
      this.remarkMsgVisible = true;
      return;
    }
    const data: any = {
      action: "rejected",
      businessModel: this.applyDetail.businessModel,
      processInstanceTaskId: this.taskId,
      id,
      applyId,
    };

    this.biddingV3Service.setPageLoading(true);
    this.biddingV3Service.approve(data).subscribe(
      ({ code, msg, data }) => {
        if (code === "0000") {
          this.message.success("退回成功!");
          // this.router.navigate(["/ecos/my-todo"]);
          this.routerExtend.back();
        } else {
          this.message.error(msg || data);
        }
        this.biddingV3Service.setPageLoading(false);
      },
      ({ message }) => {
        this.message.error(message);
        this.biddingV3Service.setPageLoading(false);
      }
    );
  }

  onSubmit(data) {
    this.biddingV3Service.setPageLoading(true);
    this.biddingV3Service.approve(data).subscribe(
      ({ code, msg, data }) => {
        if (code === "0000") {
          this.message.success("提交成功!");
          // this.router.navigate(["/ecos/my-todo"]);
          this.routerExtend.back();
        } else {
          this.message.error(msg || data);
        }
        this.biddingV3Service.setPageLoading(false);
      },
      ({ message }) => {
        this.message.error(message);
        this.biddingV3Service.setPageLoading(false);
      }
    );
  }

  // 提交中标信息
  handleSubmitBiddingInfo() {
    this.remarkMsgVisible = false;
    const { action, processComments, approvedForm, failureForm } =
      this.biddingFilling.getRawValue();
    this.biddingFilling.get("action").markAsDirty();
    this.biddingFilling.get("action").updateValueAndValidity();
    if (!action) {
      this.message.error("请按要求填写表单信息");
      return;
    }
    const { id, applyId, marketBundles, businessModel } = this.applyDetail;
    const data: any = {
      action,
      businessModel: this.applyDetail.businessModel,
      processInstanceTaskId: this.taskId,
      id,
      processComments,
      applyId,
    };
    if (action === "approved") {
      const approvedFormGroup = this.biddingFilling.get(
        "approvedForm"
      ) as FormGroup;
      for (let i in approvedFormGroup.controls) {
        approvedFormGroup.controls[i].markAsDirty();
        approvedFormGroup.controls[i].updateValueAndValidity();
      }

      (approvedFormGroup.get("marketBundles") as FormArray).controls.forEach(
        (marketBundle) => {
          (marketBundle.get("products") as FormArray).controls.forEach(
            (product) => {
              product.get("awardPrice").markAsDirty();
              product.get("awardPrice").updateValueAndValidity();
            }
          );
        }
      );

      if (businessModel !== BUSINESS_MODEL_DIRECT) {
        const subTiers = this.biddingForm.get('supplementInfo').get('dealerInfo').get('subTiers') as FormArray
        if (subTiers.invalid) {
          this.modalService.error({
            nzTitle: '提示',
            nzContent: '经销商黑名单校验不通过，请上传必要的支持文件和备注后，再作提交'
          }).afterClose.subscribe(() => {
            this.activeTab.emit('supplement-info')
            setTimeout(() => {
              document.querySelector('.dealer-info').scrollIntoView()
            }, 0);
          })
          return
        }
        data.subTiers = subTiers.getRawValue()
      }

      if (approvedFormGroup.invalid) {
        this.message.error("请按要求填写表单信息");
        return;
      }
      approvedForm.specialApprovalItems = approvedForm.specialApprovalItems.filter(({ removed }) => !removed)
      Object.assign(data, approvedForm);
      const { marketBundles: biddingMarketBundles } = approvedForm;
      const marketBundleMap = new Map();
      biddingMarketBundles.forEach(({ products }) => {
        products.forEach(({ id, awardOrNot, awardPrice, awardCurrency }) => {
          marketBundleMap.set(id, {
            awardOrNot: awardOrNot ? 1 : 0,
            awardPrice,
            awardCurrency,
          });
        });
      });
      data.marketBundles = marketBundles.map((marketBundle) => ({
        ...marketBundle,
        ...marketBundleMap.get(marketBundle.id),
      }));
    } else if (action === "failure") {
      const failureFormGroup = this.biddingFilling.get(
        "failureForm"
      ) as FormGroup;
      for (let i in failureFormGroup.controls) {
        failureFormGroup.controls[i].markAsDirty();
        failureFormGroup.controls[i].updateValueAndValidity();
      }
      if (failureFormGroup.invalid) {
        this.message.error("请按要求填写表单信息");
        return;
      }
      Object.assign(data, failureForm);
    }

    if (this.ddpDateExpired) {
      this.modalService.confirm({
        nzTitle: "<h4>提醒</h4>",
        nzContent: `经销商DDP有效日期为${this.applyDetail.distributorDdpDate}，当前已过有效期，是否确认提交？`,
        nzOnOk: () => {
          this.onSubmit(data);
        },
      });
    } else {
      this.onSubmit(data);
    }
  }
}
