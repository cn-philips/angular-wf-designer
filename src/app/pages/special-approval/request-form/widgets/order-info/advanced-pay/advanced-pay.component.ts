import { Component, Input, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DictService } from "@core/services";
import { SelectDealFormComponent } from "@pages/prebook-v3/components";
import { SpecialApprovalService } from "@pages/special-approval/special-approval.service";
import { NzMessageService, NzModalService } from "ng-zorro-antd";
import { DealForm, SelectDealformComponent } from "../../select-dealform/select-dealform.component";
import { Subscription } from "rxjs";

@Component({
  selector: 'special-approval-advanced-pay',
  templateUrl: './advanced-pay.component.html',
  styleUrls: ['./advanced-pay.component.scss']
})

export class AdvancedPayComponent implements OnInit, OnDestroy {

  @ViewChild('selectDealFormDialog') selectDealFormDialog: SelectDealformComponent
  @Input() editable = true;
  @Input() formValues: FormGroup;
  @Input() baseInfo: FormGroup;

  // 订阅管理
  private systemRegionSubscription: Subscription;
  private ratioAsContractedSubscription: Subscription;
  private dealPriceAsContractedSubscription: Subscription;
  private currencySubscription: Subscription;
  // 新增：实际OIT字段的订阅
  private actualRatioSubscription: Subscription;
  private actualDealPriceSubscription: Subscription;

  // 模拟订单数据
  orderList = [
    { refNo: 'Ref No 1', bmc: 'BMC1', productName: 'Product Name 1', so: 'SO#1' },
    { refNo: 'Ref No 2', bmc: 'BMC2', productName: 'Product Name 2', so: 'SO#2' },
    { refNo: 'Ref No 3', bmc: 'BMC3', productName: 'Product Name 3', so: 'SO#3' }
  ];

  // 付款计划数据
  paymentPlanList = [
    {
      amount: 3000.00,
      ratio: 3,
      executionDate: new Date('2025-09-03'),
      policyExecutionDate: new Date('2025-09-11'),
      fileName: null,
      file: null
    },
    {
      amount: 2000.00,
      ratio: 2,
      executionDate: new Date('2025-09-11'),
      policyExecutionDate: new Date('2025-09-18'),
      fileName: null,
      file: null
    }
  ];

  // 事前审批文件列表
  approvalFileList = [];

  ngOnInit(): void {
    // 初始化表单数据
    this.initFormData();

    // 监听申请详情tab中的系统区域变化
    this.subscribeToSystemRegionChanges();

    // 监听财务信息字段变化，实现自动计算
    this.subscribeToFinanceFieldChanges();
  }

  constructor(
    private fb: FormBuilder,
    public spService: SpecialApprovalService,
    private modal: NzModalService,
    private message: NzMessageService,
    private dictService: DictService
  ) {}

  get financeInfoForm(): FormGroup {
    return this.formValues.get('financeInfo') as FormGroup
  }

  get gapPaymentPlanInfoForm(): FormArray {
    return this.formValues.get('gapPaymentPlan') as FormArray
  }

  get orderInfoArray(): FormArray {
    return this.formValues.get('orderInfo') as FormArray;
  }

  // 自定义验证器：验证OIT比率不超过100%
  private oitRatioValidator = (control: any) => {
    if (!control.value) return null;
    const ratio = Number(control.value);
    if (isNaN(ratio)) return null;
    if (ratio > 100) {
      return { maxRatio: true };
    }
    return null;
  }

  // 自定义验证器：验证OIT金额不超过基础金额
  private oitAmountValidator = (control: any) => {
    if (!control.value) return null;
    const amount = Number(control.value);
    if (isNaN(amount)) return null;

    const basePrice = this.getBasePriceForCalculation();
    if (basePrice && amount > basePrice) {
      return { maxAmount: true };
    }
    return null;
  }

  // 自定义验证器：验证实际OIT比率不超过100%
  private actualOitRatioValidator = (control: any) => {
    if (!control.value) return null;
    const ratio = Number(control.value);
    if (isNaN(ratio)) return null;
    if (ratio > 100) {
      return { maxRatio: true };
    }
    return null;
  }

  // 自定义验证器：验证实际OIT金额不超过基础金额
  private actualOitAmountValidator = (control: any) => {
    if (!control.value) return null;
    const amount = Number(control.value);
    if (isNaN(amount)) return null;

    const basePrice = this.getBasePriceForCalculation();
    if (basePrice && amount > basePrice) {
      return { maxAmount: true };
    }
    return null;
  }  // 初始化表单数据
  initFormData() {
    // 初始化时同步系统区域值
    this.syncSystemRegion();

    // 初始计算差额字段
    this.calculateGapRatio();
    this.calculateGapPrice();
  }

  // 同步系统区域值
  syncSystemRegion() {
    if (this.baseInfo && this.baseInfo.get('systemRegion') && this.formValues.get('systemRegion')) {
      const systemRegionValue = this.baseInfo.get('systemRegion').value;
      if (systemRegionValue) {
        this.formValues.patchValue({
          systemRegion: systemRegionValue
        });
      }
    }
  }

  // 监听申请详情tab中的系统区域变化
  subscribeToSystemRegionChanges() {
    if (this.baseInfo && this.baseInfo.get('systemRegion')) {
      this.systemRegionSubscription = this.baseInfo.get('systemRegion').valueChanges.subscribe(systemRegion => {
        if (systemRegion && this.formValues.get('systemRegion')) {
          // 同步系统区域到订单信息的区域字段
          this.formValues.patchValue({
            systemRegion: systemRegion
          });
        }
      });
    }
  }

  // 监听财务信息字段变化，实现自动计算
  subscribeToFinanceFieldChanges() {
    if (!this.financeInfoForm || !this.editable) {
      return;
    }

    // 添加验证器到表单控件
    this.addValidatorsToFinanceFields();

    // 先清理现有订阅
    this.unsubscribeFinanceFields();

    // 监听货币类型变化，当货币变化时重新计算
    const currencyControl = this.financeInfoForm.get('currency');
    if (currencyControl) {
      this.currencySubscription = currencyControl.valueChanges.subscribe(currency => {
        // 当货币变化时，如果已有比率值，重新计算金额
        const ratioControl = this.financeInfoForm.get('ratioAsContracted');
        if (ratioControl && ratioControl.value !== null && ratioControl.value !== undefined && ratioControl.value !== '') {
          this.calculateOitAmountFromRatio(Number(ratioControl.value));
        }

        // 重新计算实际OIT字段
        const actualRatioControl = this.financeInfoForm.get('actualRatio');
        if (actualRatioControl && actualRatioControl.value !== null && actualRatioControl.value !== undefined && actualRatioControl.value !== '') {
          this.calculateActualOitAmountFromRatio(Number(actualRatioControl.value));
        }

        // 重新计算差额字段
        this.calculateGapRatio();
        this.calculateGapPrice();
      });
    }    // 监听 合同约定的OIT支付比率 变化
    const ratioAsContractedControl = this.financeInfoForm.get('ratioAsContracted');
    if (ratioAsContractedControl) {
      this.ratioAsContractedSubscription = ratioAsContractedControl.valueChanges.subscribe(ratio => {
        if (ratio !== null && ratio !== undefined && ratio !== '') {
          this.calculateOitAmountFromRatio(Number(ratio));
        }
        // 计算差额比例
        this.calculateGapRatio();
      });
    }

    // 监听 合同约定的OIT金额 变化
    const dealPriceAsContractedControl = this.financeInfoForm.get('dealPriceAsContracted');
    if (dealPriceAsContractedControl) {
      this.dealPriceAsContractedSubscription = dealPriceAsContractedControl.valueChanges.subscribe(amount => {
        if (amount !== null && amount !== undefined && amount !== '') {
          this.calculateOitRatioFromAmount(Number(amount));
        }
        // 计算差额含税金额
        this.calculateGapPrice();
        // 计算差额比例（因为金额变化可能影响比例）
        this.calculateGapRatio();
      });
    }

    // 监听 实际OIT支付比率 变化
    const actualRatioControl = this.financeInfoForm.get('actualRatio');
    if (actualRatioControl) {
      this.actualRatioSubscription = actualRatioControl.valueChanges.subscribe(ratio => {
        if (ratio !== null && ratio !== undefined && ratio !== '') {
          this.calculateActualOitAmountFromRatio(Number(ratio));
        }
        // 计算差额比例
        this.calculateGapRatio();
      });
    }

    // 监听 实际OIT支付金额 变化
    const actualDealPriceControl = this.financeInfoForm.get('actualDealPrice');
    if (actualDealPriceControl) {
      this.actualDealPriceSubscription = actualDealPriceControl.valueChanges.subscribe(amount => {
        if (amount !== null && amount !== undefined && amount !== '') {
          this.calculateActualOitRatioFromAmount(Number(amount));
        }
        // 计算差额含税金额
        this.calculateGapPrice();
        // 计算差额比例（因为金额变化可能影响比例）
        this.calculateGapRatio();
      });
    }
  }

  // 添加验证器到财务字段
  private addValidatorsToFinanceFields() {
    const ratioControl = this.financeInfoForm.get('ratioAsContracted');
    const actualRatioControl = this.financeInfoForm.get('actualRatio');

    if (ratioControl) {
      const currentValidators = ratioControl.validator ? [ratioControl.validator] : [];
      ratioControl.setValidators([...currentValidators, this.oitRatioValidator]);
      ratioControl.updateValueAndValidity({ emitEvent: false });
    }

    if (actualRatioControl) {
      const currentValidators = actualRatioControl.validator ? [actualRatioControl.validator] : [];
      actualRatioControl.setValidators([...currentValidators, this.actualOitRatioValidator]);
      actualRatioControl.updateValueAndValidity({ emitEvent: false });
    }

    // 暂时不在表单初始化时添加金额验证器，避免循环依赖
    // 将在用户输入时通过其他方式验证
  }

  // 清理财务字段订阅
  unsubscribeFinanceFields() {
    if (this.ratioAsContractedSubscription) {
      this.ratioAsContractedSubscription.unsubscribe();
    }
    if (this.dealPriceAsContractedSubscription) {
      this.dealPriceAsContractedSubscription.unsubscribe();
    }
    if (this.currencySubscription) {
      this.currencySubscription.unsubscribe();
    }
    if (this.actualRatioSubscription) {
      this.actualRatioSubscription.unsubscribe();
    }
    if (this.actualDealPriceSubscription) {
      this.actualDealPriceSubscription.unsubscribe();
    }
  }

  // 根据币种获取基础金额字段
  getBasePriceForCalculation(): number | null {
    const currencyControl = this.financeInfoForm.get('currency');
    const currency = currencyControl ? currencyControl.value : 'CNY';

    let basePriceControl;
    if (currency === 'USD') {
      basePriceControl = this.financeInfoForm.get('dealPriceUsd');
    } else {
      // 默认使用CNY，包括currency为CNY或其他情况
      basePriceControl = this.financeInfoForm.get('dealPriceCny');
    }

    const basePrice = basePriceControl ? basePriceControl.value : null;
    return (basePrice && !isNaN(basePrice)) ? Number(basePrice) : null;
  }

  // 根据比率计算OIT金额
  calculateOitAmountFromRatio(ratio: number) {
    const basePrice = this.getBasePriceForCalculation();
    if (basePrice && !isNaN(ratio)) {
      // 验证比率不大于100%
      if (ratio > 100) {
        this.message.warning('合同约定的OIT支付比率不能大于100%');
        // 重置比率为100%
        const ratioControl = this.financeInfoForm.get('ratioAsContracted');
        if (ratioControl) {
          ratioControl.setValue(100, { emitEvent: false });
        }
        ratio = 100;
      }

      const calculatedAmount = (basePrice * ratio / 100);

      // 验证金额不超过DealForm含税总金额
      if (calculatedAmount > basePrice) {
        this.message.warning('合同约定的OIT金额不能超过DealForm含税总金额');
        // 重新计算符合限制的金额
        const maxAmount = basePrice;

        // 暂时移除金额字段监听，避免循环触发
        if (this.dealPriceAsContractedSubscription) {
          this.dealPriceAsContractedSubscription.unsubscribe();
        }

        this.financeInfoForm.patchValue({
          dealPriceAsContracted: maxAmount.toFixed(2)
        }, { emitEvent: false });

        // 重新订阅金额字段
        this.subscribeToDealPriceAsContracted();
        return;
      }

      // 暂时移除金额字段监听，避免循环触发
      if (this.dealPriceAsContractedSubscription) {
        this.dealPriceAsContractedSubscription.unsubscribe();
      }

      this.financeInfoForm.patchValue({
        dealPriceAsContracted: calculatedAmount.toFixed(2)
      }, { emitEvent: false });

      // 重新订阅金额字段
      this.subscribeToDealPriceAsContracted();
    }
  }

  // 根据金额计算OIT比率
  calculateOitRatioFromAmount(amount: number) {
    const basePrice = this.getBasePriceForCalculation();
    if (basePrice && !isNaN(amount)) {
      // 验证金额不超过DealForm含税总金额
      if (amount > basePrice) {
        this.message.warning('合同约定的OIT金额不能超过DealForm含税总金额');
        // 重置金额为最大允许值
        const dealPriceAsContractedControl = this.financeInfoForm.get('dealPriceAsContracted');
        if (dealPriceAsContractedControl) {
          dealPriceAsContractedControl.setValue(basePrice.toFixed(2), { emitEvent: false });
        }
        amount = basePrice;
      }

      const calculatedRatio = (amount / basePrice * 100);

      // 验证比率不大于100%
      if (calculatedRatio > 100) {
        this.message.warning('合同约定的OIT支付比率不能大于100%');
        // 重新计算符合限制的比率
        const maxRatio = 100;

        // 暂时移除比率字段监听，避免循环触发
        if (this.ratioAsContractedSubscription) {
          this.ratioAsContractedSubscription.unsubscribe();
        }

        this.financeInfoForm.patchValue({
          ratioAsContracted: maxRatio.toFixed(2)
        }, { emitEvent: false });

        // 重新订阅比率字段
        this.subscribeToRatioAsContracted();
        return;
      }

      // 暂时移除比率字段监听，避免循环触发
      if (this.ratioAsContractedSubscription) {
        this.ratioAsContractedSubscription.unsubscribe();
      }

      this.financeInfoForm.patchValue({
        ratioAsContracted: calculatedRatio.toFixed(2)
      }, { emitEvent: false });

      // 重新订阅比率字段
      this.subscribeToRatioAsContracted();
    }
  }

  // 根据实际OIT支付比率计算实际OIT支付金额
  calculateActualOitAmountFromRatio(ratio: number) {
    const basePrice = this.getBasePriceForCalculation();
    if (basePrice && !isNaN(ratio)) {
      // 验证比率不大于100%
      if (ratio > 100) {
        this.message.warning('实际OIT支付比率不能大于100%');
        // 重置比率为100%
        const ratioControl = this.financeInfoForm.get('actualRatio');
        if (ratioControl) {
          ratioControl.setValue(100, { emitEvent: false });
        }
        ratio = 100;
      }

      const calculatedAmount = (basePrice * ratio / 100);

      // 验证金额不超过DealForm含税总金额
      if (calculatedAmount > basePrice) {
        this.message.warning('实际OIT支付金额不能超过DealForm含税总金额');
        // 重新计算符合限制的金额
        const maxAmount = basePrice;

        // 暂时移除金额字段监听，避免循环触发
        if (this.actualDealPriceSubscription) {
          this.actualDealPriceSubscription.unsubscribe();
        }

        this.financeInfoForm.patchValue({
          actualDealPrice: maxAmount.toFixed(2)
        }, { emitEvent: false });

        // 重新订阅金额字段
        this.subscribeToActualDealPrice();
        return;
      }

      // 暂时移除金额字段监听，避免循环触发
      if (this.actualDealPriceSubscription) {
        this.actualDealPriceSubscription.unsubscribe();
      }

      this.financeInfoForm.patchValue({
        actualDealPrice: calculatedAmount.toFixed(2)
      }, { emitEvent: false });

      // 重新订阅金额字段
      this.subscribeToActualDealPrice();
    }
  }

  // 根据实际OIT支付金额计算实际OIT支付比率
  calculateActualOitRatioFromAmount(amount: number) {
    const basePrice = this.getBasePriceForCalculation();
    if (basePrice && !isNaN(amount)) {
      // 验证金额不超过DealForm含税总金额
      if (amount > basePrice) {
        this.message.warning('实际OIT支付金额不能超过DealForm含税总金额');
        // 重置金额为最大允许值
        const actualDealPriceControl = this.financeInfoForm.get('actualDealPrice');
        if (actualDealPriceControl) {
          actualDealPriceControl.setValue(basePrice.toFixed(2), { emitEvent: false });
        }
        amount = basePrice;
      }

      const calculatedRatio = (amount / basePrice * 100);

      // 验证比率不大于100%
      if (calculatedRatio > 100) {
        this.message.warning('实际OIT支付比率不能大于100%');
        // 重新计算符合限制的比率
        const maxRatio = 100;

        // 暂时移除比率字段监听，避免循环触发
        if (this.actualRatioSubscription) {
          this.actualRatioSubscription.unsubscribe();
        }

        this.financeInfoForm.patchValue({
          actualRatio: maxRatio.toFixed(2)
        }, { emitEvent: false });

        // 重新订阅比率字段
        this.subscribeToActualRatio();
        return;
      }

      // 暂时移除比率字段监听，避免循环触发
      if (this.actualRatioSubscription) {
        this.actualRatioSubscription.unsubscribe();
      }

      this.financeInfoForm.patchValue({
        actualRatio: calculatedRatio.toFixed(2)
      }, { emitEvent: false });

      // 重新订阅比率字段
      this.subscribeToActualRatio();
    }
  }

  // 计算差额比例：合同约定的OIT支付比率 - 实际OIT支付比率
  calculateGapRatio() {
    const ratioAsContractedControl = this.financeInfoForm.get('ratioAsContracted');
    const actualRatioControl = this.financeInfoForm.get('actualRatio');
    const gapRadioControl = this.financeInfoForm.get('gapRadio');

    if (ratioAsContractedControl && actualRatioControl && gapRadioControl) {
      const ratioAsContracted = ratioAsContractedControl.value;
      const actualRatio = actualRatioControl.value;

      // 只要合同约定比例或实际比例任一有值就计算差额
      const hasContractedRatio = ratioAsContracted !== null && ratioAsContracted !== undefined && ratioAsContracted !== '';
      const hasActualRatio = actualRatio !== null && actualRatio !== undefined && actualRatio !== '';

      if (hasContractedRatio || hasActualRatio) {
        const contractedValue = hasContractedRatio ? Number(ratioAsContracted) : 0;
        const actualValue = hasActualRatio ? Number(actualRatio) : 0;
        const gapRatio = contractedValue - actualValue;

        gapRadioControl.setValue(gapRatio.toFixed(2), { emitEvent: false });
      } else {
        // 两个字段都为空时，清空差额字段
        gapRadioControl.setValue('', { emitEvent: false });
      }
    }
  }

  // 计算差额含税金额：合同约定的OIT金额 - 实际OIT支付金额
  calculateGapPrice() {
    const dealPriceAsContractedControl = this.financeInfoForm.get('dealPriceAsContracted');
    const actualDealPriceControl = this.financeInfoForm.get('actualDealPrice');
    const gapPriceControl = this.financeInfoForm.get('gapPrice');

    if (dealPriceAsContractedControl && actualDealPriceControl && gapPriceControl) {
      const dealPriceAsContracted = dealPriceAsContractedControl.value;
      const actualDealPrice = actualDealPriceControl.value;

      // 只要合同约定金额或实际金额任一有值就计算差额
      const hasContractedPrice = dealPriceAsContracted !== null && dealPriceAsContracted !== undefined && dealPriceAsContracted !== '';
      const hasActualPrice = actualDealPrice !== null && actualDealPrice !== undefined && actualDealPrice !== '';

      if (hasContractedPrice || hasActualPrice) {
        const contractedValue = hasContractedPrice ? Number(dealPriceAsContracted) : 0;
        const actualValue = hasActualPrice ? Number(actualDealPrice) : 0;
        const gapPrice = contractedValue - actualValue;

        gapPriceControl.setValue(gapPrice.toFixed(2), { emitEvent: false });
      } else {
        // 两个字段都为空时，清空差额字段
        gapPriceControl.setValue('', { emitEvent: false });
      }
    }
  }

  // 重新订阅比率字段
  subscribeToRatioAsContracted() {
    const ratioAsContractedControl = this.financeInfoForm.get('ratioAsContracted');
    if (ratioAsContractedControl) {
      this.ratioAsContractedSubscription = ratioAsContractedControl.valueChanges.subscribe(ratio => {
        if (ratio !== null && ratio !== undefined && ratio !== '') {
          this.calculateOitAmountFromRatio(Number(ratio));
        }
        // 计算差额比例
        this.calculateGapRatio();
      });
    }
  }

  // 重新订阅金额字段
  subscribeToDealPriceAsContracted() {
    const dealPriceAsContractedControl = this.financeInfoForm.get('dealPriceAsContracted');
    if (dealPriceAsContractedControl) {
      this.dealPriceAsContractedSubscription = dealPriceAsContractedControl.valueChanges.subscribe(amount => {
        if (amount !== null && amount !== undefined && amount !== '') {
          this.calculateOitRatioFromAmount(Number(amount));
        }
        // 计算差额含税金额
        this.calculateGapPrice();
        // 计算差额比例（因为金额变化可能影响比例）
        this.calculateGapRatio();
      });
    }
  }

  // 重新订阅实际OIT支付比率字段
  subscribeToActualRatio() {
    const actualRatioControl = this.financeInfoForm.get('actualRatio');
    if (actualRatioControl) {
      this.actualRatioSubscription = actualRatioControl.valueChanges.subscribe(ratio => {
        if (ratio !== null && ratio !== undefined && ratio !== '') {
          this.calculateActualOitAmountFromRatio(Number(ratio));
        }
        // 计算差额比例
        this.calculateGapRatio();
      });
    }
  }

  // 重新订阅实际OIT支付金额字段
  subscribeToActualDealPrice() {
    const actualDealPriceControl = this.financeInfoForm.get('actualDealPrice');
    if (actualDealPriceControl) {
      this.actualDealPriceSubscription = actualDealPriceControl.valueChanges.subscribe(amount => {
        if (amount !== null && amount !== undefined && amount !== '') {
          this.calculateActualOitRatioFromAmount(Number(amount));
        }
        // 计算差额含税金额
        this.calculateGapPrice();
        // 计算差额比例（因为金额变化可能影响比例）
        this.calculateGapRatio();
      });
    }
  }

  ngOnDestroy(): void {
    // 取消订阅，避免内存泄漏
    if (this.systemRegionSubscription) {
      this.systemRegionSubscription.unsubscribe();
    }
    this.unsubscribeFinanceFields();
  }

  // 添加付款计划到FormArray
  addPaymentPlan() {
    const newPlanGroup = this.fb.group({
      sequenceNo: [this.gapPaymentPlanInfoForm.length + 1],
      paymentDate: [null, [Validators.required]],
      paymentRatio: [null, [Validators.required]],
      paymentAmount: [null, [Validators.required]],
      actualPaymentDate: [null],
      actualPaymentFiles: [[]]
    });

    this.gapPaymentPlanInfoForm.push(newPlanGroup);
  }

  // 文件上传处理
  onFileChange(event: any, index: number) {
    const file = event.target.files[0];
    if (file && this.gapPaymentPlanInfoForm.at(index)) {
      const fileArray = this.gapPaymentPlanInfoForm.at(index).get('actualPaymentFiles');
      if (fileArray) {
        fileArray.setValue([file]);
        this.message.success('文件上传成功');
      }
    }
  }

  // 删除付款计划从FormArray
  removePaymentPlan(index: number) {
    if (this.gapPaymentPlanInfoForm.length > 1) {
      this.gapPaymentPlanInfoForm.removeAt(index);
      // 重新编号
      this.gapPaymentPlanInfoForm.controls.forEach((control, i) => {
        control.get('sequenceNo').setValue(i + 1);
      });
    } else {
      this.message.warning('至少保留一条付款计划');
    }
  }

  onShowSelectDealFormModal(){
    this.selectDealFormDialog.showModal();
  }
  onSelectDealForm(dealForm: DealForm) {
    console.log('Selected DealForm:', dealForm);
    this.formValues.patchValue({
      dealformId: dealForm.dealFormId,
      dealerName: dealForm.dealerName,
      hospitalName: dealForm.hospitalName || '',
      businessModel: dealForm.businessType || '',
      sales: dealForm.sales || ''
    });

    this.financeInfoForm.patchValue({
      currency: dealForm.currency || 'CNY',
      dealPriceCnyNet: dealForm.dealPriceCnyNet,
      dealPriceCny: dealForm.dealPriceCny,
      dealPriceUsd: dealForm.dealPriceUsd
    })

    // 重新建立财务字段监听，确保使用新的基础数据进行计算
    setTimeout(() => {
      this.subscribeToFinanceFieldChanges();
    }, 100);

    console.log(this.formValues.value);
  }
}
