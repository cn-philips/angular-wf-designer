import { Component, Input, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl } from "@angular/forms";
import { DictService } from "@core/services";
import { SelectDealFormComponent } from "@pages/prebook-v3/components";
import { SpecialApprovalService } from "@pages/special-approval/special-approval.service";
import { NzMessageService, NzModalService } from "ng-zorro-antd";
import { DealForm, SelectDealformComponent } from "../../select-dealform/select-dealform.component";
import { Subscription } from "rxjs";
import { PROCESS_STATUS } from "@pages/special-approval/special-approval.constants";
import { APPROVE_NODE_ACTION } from "@pages/special-approval/special-approval-setting.constants";

@Component({
  selector: 'special-approval-advanced-pay',
  templateUrl: './advanced-pay.component.html',
  styleUrls: ['./advanced-pay.component.scss']
})

export class AdvancedPayComponent implements OnInit, OnDestroy {

  @ViewChild('selectDealFormDialog') selectDealFormDialog: SelectDealformComponent
  @Input() editable = false;
  @Input() formValues: FormGroup;
  @Input() baseInfo: FormGroup;
  @Input() processStatus; // 用于判断当前申请的流程状态
  @Input() isApplicant; // 是否是申请人
  @Input() requestId: string; // 用于判断是否是从草稿进入的申请
  @Input() nodeAction: string; // 节点动作
  @Input() nodeCode:string
  @Input() currentTask:any
  @Input() nodeInfoList:any[]
  @Input() isCurrentUserApprover:boolean

  // 订阅管理
  private systemRegionSubscription: Subscription;
  private ratioAsContractedSubscription: Subscription;
  private dealPriceAsContractedSubscription: Subscription;
  private currencySubscription: Subscription;
  // 新增：实际OIT字段的订阅
  private actualRatioSubscription: Subscription;
  private actualDealPriceSubscription: Subscription;

  // 数据初始化标志
  private isDataInitialized = false;

  // 事前审批文件列表
  approvalFileList = [];

  ngOnInit(): void {
    // 初始化表单数据（异步）
    this.initFormData();

    // 监听申请详情tab中的系统区域变化
    this.subscribeToSystemRegionChanges();

    // 监听财务信息字段变化，实现自动计算
    this.subscribeToFinanceFieldChanges();

    // 使用setTimeout确保FormArray已经初始化
    setTimeout(() => {
      this.initializePaymentPlanValidation();
    }, 0);
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

  get orderList() {
    return this.orderInfoArray.getRawValue();
  }

  // trackBy函数用于优化ngFor性能和变更检测
  trackByIndex(index: number, item: any): number {
    return index;
  }

  // 判断是否应该禁用导入按钮（如果是从草稿进入的申请）
  get shouldDisableImportButton(): boolean {
    return !this.isNewForm ;
  }
  // && !(this.isApplicant && [PROCESS_STATUS.DRAFT,PROCESS_STATUS.REJECTED,PROCESS_STATUS.WITHDRAW].includes(this.processStatus.trim()))

  get isNewForm(): boolean {
    return !(this.requestId && this.requestId.trim());
  }
  public get isOaFeedbackNode(): boolean {
    let taskName = this.currentTask? this.currentTask.taskName:null
    let node = this.nodeInfoList.filter(item=>item.code===taskName) || []
    let currentNodeApprovers =node&&node.length>0 ? node[0].approverList : [];
    let isOANode = currentNodeApprovers.filter(item=>item.role.toLowerCase() === 'oa') .length > 0 || false;
    return this.isCurrentUserApprover && this.processStatus== PROCESS_STATUS.START && this.nodeAction === APPROVE_NODE_ACTION.FEEDBACK && isOANode;
  }
  public get isCCFeedbackNode(): boolean {
    let taskName = this.currentTask? this.currentTask.taskName:null
    let node = this.nodeInfoList.filter(item=>item.code===taskName) || []
    let currentNodeApprovers =node&&node.length>0 ? node[0].approverList : [];
    let isCCNode = currentNodeApprovers.filter(item=>item.role.toLowerCase() === 'C&C Leader'.toLowerCase()) .length > 0 || false;
    return this.isCurrentUserApprover && this.processStatus== PROCESS_STATUS.START && this.nodeAction === APPROVE_NODE_ACTION.APPROVE && isCCNode;
  }
  async confirmAndSave(index: number){
    let id ;
    let plan = this.gapPaymentPlanInfoForm.at(index);
    if(plan.get('id')){
      id = this.gapPaymentPlanInfoForm.at(index).get('id').value;
    }
    if(!id){
      this.message.error('当前记录没有ID，无法保存。请联系管理员。');
      return;
    }
    if(null == plan.get('actualPaymentDate').value){
      this.message.error('实际付款日期不能为空。');
      return;
    }
    let result = await this.spService.savePaymentPlanInfo({...plan.value,actualPaymentFiles: JSON.stringify(plan.get('actualPaymentFiles').value)||[]});
    if(result){
      this.gapPaymentPlanInfoForm.at(index).get('saved').patchValue(true);
      this.gapPaymentPlanInfoForm.at(index).get('actualPaymentDate').disable();
      this.gapPaymentPlanInfoForm.at(index).get('actualPaymentFiles').disable();
      this.gapPaymentPlanInfoForm.at(index).get('actualPaymentComments').disable();
      this.message.success('保存成功，并已通知相关人员。');
    }else{
      this.message.error('保存失败，请稍后重试或联系管理员。');
    }
  }

  initData(data: any) {
    console.log('advanced-pay initData', data);
    const {oitAdvancedPayInfos} = data
    console.log('oitAdvancedPayInfos:', oitAdvancedPayInfos);

    if(oitAdvancedPayInfos.financeInfo){
      let approvalFiles = oitAdvancedPayInfos.financeInfo.approvalFiles || '[]'
      if(typeof approvalFiles === 'string'){
        approvalFiles = JSON.parse(approvalFiles)
      }
      oitAdvancedPayInfos.financeInfo.approvalFiles = approvalFiles
      if(oitAdvancedPayInfos.gapPaymentPlan){
        // 先清空现有的gapPaymentPlan FormArray
        while(this.gapPaymentPlanInfoForm.length > 0) {
          this.gapPaymentPlanInfoForm.removeAt(0);
        }

        oitAdvancedPayInfos.gapPaymentPlan.forEach((plan, index) => {
          plan.actualPaymentFiles = JSON.parse(plan.actualPaymentFiles||'[]')

          // 确保actualPaymentComments是字符串类型
          if (plan.actualPaymentComments === null || plan.actualPaymentComments === undefined) {
            plan.actualPaymentComments = '';
          }

          // 处理日期格式，确保ng-zorro能正确解析
          if (plan.paymentDate && typeof plan.paymentDate === 'string') {
            const date = new Date(plan.paymentDate);
            // 只有当日期有效时才赋值，否则保持null
            plan.paymentDate = isNaN(date.getTime()) ? null : date;
          } else if (plan.paymentDate && !(plan.paymentDate instanceof Date)) {
            // 如果不是字符串也不是Date对象，设为null
            plan.paymentDate = null;
          }

          if (plan.actualPaymentDate && typeof plan.actualPaymentDate === 'string') {
            const date = new Date(plan.actualPaymentDate);
            // 只有当日期有效时才赋值，否则保持null
            plan.actualPaymentDate = isNaN(date.getTime()) ? null : date;
          } else if (plan.actualPaymentDate && !(plan.actualPaymentDate instanceof Date)) {
            // 如果不是字符串也不是Date对象，设为null
            plan.actualPaymentDate = null;
          }

          // 为每个付款计划创建FormGroup并添加到FormArray
          const planFormGroup = this.fb.group({
            id: [plan.id || null],
            sequenceNo: [plan.sequenceNo || index + 1],
            paymentDate: [plan.paymentDate, [Validators.required]],
            paymentRatio: [plan.paymentRatio, [Validators.required, this.singleRatioValidator, this.gapPaymentRatioSumValidator]],
            paymentAmount: [plan.paymentAmount, [Validators.required, this.singleAmountValidator, this.gapPaymentAmountSumValidator]],
            actualPaymentDate: [plan.actualPaymentDate],
            actualPaymentFiles: [plan.actualPaymentFiles || []],
            actualPaymentComments: [plan.actualPaymentComments || ''],
            saved: [plan.saved || false],
          });

          // 如果是可编辑状态（创建/编辑），禁用实际付款相关字段
          planFormGroup.get('sequenceNo').disable();
          planFormGroup.get('paymentDate').disable();
          planFormGroup.get('paymentRatio').disable();
          planFormGroup.get('paymentAmount').disable();
          planFormGroup.get('actualPaymentDate').disable();
          planFormGroup.get('actualPaymentFiles').disable();
          planFormGroup.get('actualPaymentComments').disable();
          if(this.editable){
            planFormGroup.get('paymentDate').enable();
            planFormGroup.get('paymentRatio').enable();
            planFormGroup.get('paymentAmount').enable();
          }

          if(this.isOaFeedbackNode && !planFormGroup.get('saved').value){
            planFormGroup.get('actualPaymentDate').enable();
            planFormGroup.get('actualPaymentFiles').enable();
            planFormGroup.get('actualPaymentComments').enable();
          }
          this.gapPaymentPlanInfoForm.push(planFormGroup);
        });

        if(this.isCCFeedbackNode){
          this.financeInfoForm.get('ratioAsContracted').enable();
          this.financeInfoForm.get('dealPriceAsContracted').enable();
          this.financeInfoForm.get('actualRatio').enable();
          this.financeInfoForm.get('actualDealPrice').enable();
          for (let i = 0; i < this.gapPaymentPlanInfoForm.length; i++) {
            this.gapPaymentPlanInfoForm.at(i).get('paymentRatio').enable();
            this.gapPaymentPlanInfoForm.at(i).get('paymentAmount').enable();
            this.gapPaymentPlanInfoForm.at(i).get('paymentDate').enable();
          }
        }
        // 为所有付款计划设置监听
        for (let i = 0; i < this.gapPaymentPlanInfoForm.length; i++) {
          this.subscribeToPaymentPlanChanges(i);
        }
      }
    }

    // 设置其他字段值（排除gapPaymentPlan，因为已经手动处理）
    const { gapPaymentPlan, ...otherFields } = oitAdvancedPayInfos;
    this.formValues.patchValue(otherFields);


    const {orderInfo} = oitAdvancedPayInfos
    this.initOitAdvancedPayOrder(orderInfo)


    // 如果是可编辑状态（创建/编辑），禁用差额付款计划中的实际付款相关字段
    if (this.editable) {
      this.disableActualPaymentFields();
    }

    if(this.isOaFeedbackNode){
      this.initApprovalForm()
    }

    // 标记数据已初始化
    this.isDataInitialized = true;
  }
  private initApprovalForm(){
    this.orderInfoArray.controls.forEach(orderControl => {
      orderControl.get('so').enable()
    })


    this.gapPaymentPlanInfoForm.controls.forEach((control) => {
      if(control.get('saved').value){
        control.get('actualPaymentDate').disable();
        control.get('actualPaymentFiles').disable();
        control.get('actualPaymentComments').disable();
      }
    });
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

  // 自定义验证器：验证实际OIT比率不大于合同约定的OIT比率
  private actualOitRatioMaxValidator = (control: any) => {
    if (!control.value) return null;
    const actualRatio = Number(control.value);
    if (isNaN(actualRatio)) return null;

    // 获取合同约定的OIT比率
    const contractedRatioControl = this.financeInfoForm ? this.financeInfoForm.get('ratioAsContracted') : null;
    const contractedRatio = contractedRatioControl ? contractedRatioControl.value : null;

    if (contractedRatio && !isNaN(Number(contractedRatio))) {
      const maxRatio = Number(contractedRatio);
      if (actualRatio > maxRatio) {
        return { actualRatioExceedsContracted: { current: actualRatio, max: maxRatio } };
      }
    }
    return null;
  }

  private async loadOrderByDealFormId(dealFormId: string) {
    return this.spService.queryOitOrderByDealFormId(dealFormId)
  }

  private async initOitAdvancedPayOrder(data: any[]) {
    console.log('initOitAdvancedPayOrder', data);
      // 先清空现有的orderInfoArray
      while(this.orderInfoArray.length > 0) {
        this.orderInfoArray.removeAt(0);
      }
      // 如果有订单数据则动态添加FormGroup
      if(data && data.length > 0) {
        data.forEach(orderData => {
          const orderFormGroup = this.fb.group({
            id: [orderData.id || null],
            applyId: [orderData.applyId || null],
            orderId: [orderData.orderId || null],
            referenceId: [orderData.referenceId || null],
            bmc: [orderData.bmc || null],
            productModel: [orderData.productModel || null],
            so: [{value:orderData.so || null,disabled:!this.editable}]
          });
          this.orderInfoArray.push(orderFormGroup);
          // orderFormGroup.get('so').setValidators
        });

        console.log('initOitAdvancedPayOrder - orderInfoArray length after initialization:', this.orderInfoArray.length);
        console.log('initOitAdvancedPayOrder - orderInfoArray controls:', this.orderInfoArray.controls);
      }
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
  }

  // 自定义验证器：验证实际OIT金额不大于合同约定的OIT金额
  private actualOitAmountMaxValidator = (control: any) => {
    if (!control.value) return null;
    const actualAmount = Number(control.value);
    if (isNaN(actualAmount)) return null;

    // 获取合同约定的OIT金额
    const contractedAmountControl = this.financeInfoForm ? this.financeInfoForm.get('dealPriceAsContracted') : null;
    const contractedAmount = contractedAmountControl ? contractedAmountControl.value : null;

    if (contractedAmount && !isNaN(Number(contractedAmount))) {
      const maxAmount = Number(contractedAmount);
      if (actualAmount > maxAmount) {
        return { actualAmountExceedsContracted: { current: actualAmount, max: maxAmount } };
      }
    }
    return null;
  }

  // 单个比率验证器（包含动态最大值限制）
  private singleRatioValidator = (control: AbstractControl) => {
    const value = control.value;
    if (!value || isNaN(Number(value))) return null;

    const numValue = Number(value);

    // 基本验证：不能大于100%
    if (numValue > 100) {
      return { maxRatio: { current: value, max: 100 } };
    }

    // 动态验证：不能大于当前项允许的最大值
    if (this.gapPaymentPlanInfoForm) {
      // 找到当前控件在FormArray中的索引
      const planIndex = this.gapPaymentPlanInfoForm.controls.findIndex(planControl =>
        planControl.get('paymentRatio') === control
      );

      if (planIndex >= 0) {
        const maxAllowed = this.getMaxAllowedRatio(planIndex);
        if (numValue > maxAllowed) {
          return { maxRatioExceeded: { current: value, max: maxAllowed.toFixed(2) } };
        }
      }
    }

    return null;
  }

  // 单个金额验证器（包含动态最大值限制）
  private singleAmountValidator = (control: AbstractControl) => {
    const value = control.value;
    if (!value || isNaN(Number(value))) return null;

    const numValue = Number(value);

    // 基本验证：不能为负数
    if (numValue < 0) {
      return { minAmount: { current: value, min: 0 } };
    }

    // 动态验证：不能大于当前项允许的最大值
    if (this.gapPaymentPlanInfoForm) {
      // 找到当前控件在FormArray中的索引
      const planIndex = this.gapPaymentPlanInfoForm.controls.findIndex(planControl =>
        planControl.get('paymentAmount') === control
      );

      if (planIndex >= 0) {
        const maxAllowed = this.getMaxAllowedAmount(planIndex);
        if (numValue > maxAllowed) {
          return { maxAmountExceeded: { current: value, max: maxAllowed.toFixed(2) } };
        }
      }
    }

    return null;
  }

  // 差额付款计划比率总和验证器（用于单个控件）
  private gapPaymentRatioSumValidator = (control: AbstractControl) => {
    // 使用箭头函数确保this上下文正确
    if (!this.gapPaymentPlanInfoForm || !this.financeInfoForm) return null;

    // 获取所有付款计划的比率总和
    const totalRatio = this.gapPaymentPlanInfoForm.controls.reduce((sum, planControl) => {
      const ratioControl = planControl.get('paymentRatio');
      const ratio = ratioControl ? ratioControl.value : null;
      return sum + (ratio && !isNaN(Number(ratio)) ? Number(ratio) : 0);
    }, 0);

    // 验证比率总和不大于100%
    if (totalRatio > 100) {
      return { ratioSumExceeded: { current: totalRatio.toFixed(2), max: '100.00' } };
    }

    // 验证比率总和不大于差额比例的绝对值
    const gapRadioControl = this.financeInfoForm.get('gapRadio');
    const gapRatio = gapRadioControl ? gapRadioControl.value : null;
    const maxRatio = gapRatio && !isNaN(Number(gapRatio)) ? Math.abs(Number(gapRatio)) : 0;

    if (maxRatio > 0 && totalRatio > maxRatio) {
      return { ratioSumExceeded: { current: totalRatio.toFixed(2), max: maxRatio.toFixed(2) } };
    }

    // 提交时验证：比率总和必须等于差额比例（允许小的误差）
    if (maxRatio > 0) {
      const tolerance = 0.01; // 允许0.01%的误差
      const shortfall = maxRatio - totalRatio;

      if (shortfall > tolerance) {
        return { ratioSumShortfall: { current: totalRatio.toFixed(2), required: maxRatio.toFixed(2), shortfall: shortfall.toFixed(2) } };
      }
    }

    return null;
  }

  // 差额付款计划金额总和验证器
  private gapPaymentAmountSumValidator = (control: AbstractControl) => {
    if (!this.gapPaymentPlanInfoForm || !this.financeInfoForm) return null;

    const totalAmount = this.gapPaymentPlanInfoForm.controls.reduce((sum, planControl) => {
      const amountControl = planControl.get('paymentAmount');
      const amount = amountControl ? amountControl.value : null;
      return sum + (amount && !isNaN(Number(amount)) ? Number(amount) : 0);
    }, 0);

    const gapPriceControl = this.financeInfoForm.get('gapPrice');
    const gapPrice = gapPriceControl ? gapPriceControl.value : null;
    const maxAmount = gapPrice && !isNaN(Number(gapPrice)) ? Math.abs(Number(gapPrice)) : 0;

    if (maxAmount > 0 && totalAmount > maxAmount) {
      return { amountSumExceeded: { current: totalAmount.toFixed(2), max: maxAmount.toFixed(2) } };
    }

    // 提交时验证：金额总和必须等于差额含税金额（允许小的误差）
    if (maxAmount > 0) {
      const tolerance = 0.01; // 允许0.01的误差
      const shortfall = maxAmount - totalAmount;

      if (shortfall > tolerance) {
        return { amountSumShortfall: { current: totalAmount.toFixed(2), required: maxAmount.toFixed(2), shortfall: shortfall.toFixed(2) } };
      }
    }

    return null;
  }

  // 初始化表单数据
  async initFormData() {
    // 初始化时同步系统区域值
    this.syncSystemRegion();

    // 初始计算差额字段
    this.calculateGapRatio();
    this.calculateGapPrice();

    // 为已有的付款计划项添加日期验证器和监听器
    this.initExistingPaymentPlans();
  }

  // 为已有的付款计划项初始化验证器和监听器
  initExistingPaymentPlans() {
    if (this.gapPaymentPlanInfoForm && this.gapPaymentPlanInfoForm.controls.length > 0) {
      this.gapPaymentPlanInfoForm.controls.forEach((control, index) => {
        // 设置监听器
        this.subscribeToPaymentPlanChanges(index);
      });
    }
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

        // 重新验证实际OIT比率字段
        const actualRatioControl = this.financeInfoForm.get('actualRatio');
        if (actualRatioControl) {
          actualRatioControl.updateValueAndValidity({ emitEvent: false });
        }

        // 计算差额比例
        this.calculateGapRatio();
        // 计算差额含税金额
        this.calculateGapPrice();
      });
    }

    // 监听 合同约定的OIT金额 变化
    const dealPriceAsContractedControl = this.financeInfoForm.get('dealPriceAsContracted');
    if (dealPriceAsContractedControl) {
      this.dealPriceAsContractedSubscription = dealPriceAsContractedControl.valueChanges.subscribe(amount => {
        if (amount !== null && amount !== undefined && amount !== '') {
          this.calculateOitRatioFromAmount(Number(amount));
        }

        // 重新验证实际OIT金额字段
        const actualAmountControl = this.financeInfoForm.get('actualDealPrice');
        if (actualAmountControl) {
          actualAmountControl.updateValueAndValidity({ emitEvent: false });
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
        // 计算差额含税金额
        this.calculateGapPrice();
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
    const actualAmountControl = this.financeInfoForm.get('actualDealPrice');

    if (ratioControl) {
      const currentValidators = ratioControl.validator ? [ratioControl.validator] : [];
      ratioControl.setValidators([...currentValidators, this.oitRatioValidator]);
      ratioControl.updateValueAndValidity({ emitEvent: false });
    }

    if (actualRatioControl) {
      const currentValidators = actualRatioControl.validator ? [actualRatioControl.validator] : [];
      actualRatioControl.setValidators([
        ...currentValidators,
        this.actualOitRatioValidator,
        this.actualOitRatioMaxValidator
      ]);
      actualRatioControl.updateValueAndValidity({ emitEvent: false });
    }

    if (actualAmountControl) {
      const currentValidators = actualAmountControl.validator ? [actualAmountControl.validator] : [];
      actualAmountControl.setValidators([
        ...currentValidators,
        this.actualOitAmountValidator,
        this.actualOitAmountMaxValidator
      ]);
      actualAmountControl.updateValueAndValidity({ emitEvent: false });
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
        // 只在数据初始化完成后显示警告
        if (this.isDataInitialized) {
          this.message.warning('合同约定的OIT支付比率不能大于100%');
        }
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
        // 只在数据初始化完成后显示警告
        if (this.isDataInitialized) {
          this.message.warning('合同约定的OIT金额不能超过DealForm含税总金额');
        }
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
        // 只在数据初始化完成后显示警告
        if (this.isDataInitialized) {
          this.message.warning('合同约定的OIT金额不能超过DealForm含税总金额');
        }
        // 重置金额为最大允许值
        const dealPriceAsContractedControl = this.financeInfoForm.get('dealPriceAsContracted');
        if (dealPriceAsContractedControl) {
          dealPriceAsContractedControl.setValue(basePrice, { emitEvent: false });
        }
        amount = basePrice;
      }

      const calculatedRatio = (amount / basePrice * 100);

      // 验证比率不大于100%
      if (calculatedRatio > 100) {
        // 只在数据初始化完成后显示警告
        if (this.isDataInitialized) {
          this.message.warning('合同约定的OIT支付比率不能大于100%');
        }
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
        // 只在数据初始化完成后显示警告
        if (this.isDataInitialized) {
          this.message.warning('实际OIT支付比率不能大于100%');
        }
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
        // 只在数据初始化完成后显示警告
        if (this.isDataInitialized) {
          this.message.warning('实际OIT支付金额不能超过DealForm含税总金额');
        }
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
        // 只在数据初始化完成后显示警告
        if (this.isDataInitialized) {
          this.message.warning('实际OIT支付金额不能超过DealForm含税总金额');
        }
        // 重置金额为最大允许值
        const actualDealPriceControl = this.financeInfoForm.get('actualDealPrice');
        if (actualDealPriceControl) {
          actualDealPriceControl.setValue(basePrice, { emitEvent: false });
        }
        amount = basePrice;
      }

      const calculatedRatio = (amount / basePrice * 100);

      // 验证比率不大于100%
      if (calculatedRatio > 100) {
        // 只在数据初始化完成后显示警告
        if (this.isDataInitialized) {
          this.message.warning('实际OIT支付比率不能大于100%');
        }
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

        gapRadioControl.setValue(gapRatio, { emitEvent: false });
      } else {
        // 两个字段都为空时，清空差额字段
        gapRadioControl.setValue(null, { emitEvent: false });
      }

      // 重新验证付款计划
      this.validateAllPaymentPlans();
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

        // 设置数字值而不是字符串值，让money-input组件处理格式化
        gapPriceControl.setValue(gapPrice, { emitEvent: false });
      } else {
        // 两个字段都为空时，清空差额字段
        gapPriceControl.setValue(null, { emitEvent: false });
      }

      // 重新验证付款计划
      this.validateAllPaymentPlans();
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
      paymentRatio: [null, [Validators.required, this.singleRatioValidator, this.gapPaymentRatioSumValidator]],
      paymentAmount: [null, [Validators.required, this.singleAmountValidator, this.gapPaymentAmountSumValidator]],
      actualPaymentDate: [null],
      actualPaymentFiles: [[]],
      actualPaymentComments: [''],
      saved: [false],
    });

    // 如果是可编辑状态（创建/编辑），禁用实际付款相关字段
    if (this.editable) {
      newPlanGroup.get('actualPaymentDate').disable();
      newPlanGroup.get('actualPaymentFiles').disable();
      newPlanGroup.get('actualPaymentComments').disable();
    }

    this.gapPaymentPlanInfoForm.push(newPlanGroup);

    // 为新添加的计划项设置验证监听
    this.subscribeToPaymentPlanChanges(this.gapPaymentPlanInfoForm.length - 1);
  }

  // 禁用所有差额付款计划中的实际付款相关字段
  private disableActualPaymentFields() {
    this.gapPaymentPlanInfoForm.controls.forEach((control) => {
      control.get('actualPaymentDate').disable();
      control.get('actualPaymentFiles').disable();
      control.get('actualPaymentComments').disable();
    });
  }

  // 删除付款计划从FormArray
  async removePaymentPlan(index: number) {
    if (this.gapPaymentPlanInfoForm.length > 1) {
      let id ;
      if(this.gapPaymentPlanInfoForm.at(index).get('id')){
        id = this.gapPaymentPlanInfoForm.at(index).get('id').value;
      }

      let applyId = this.formValues.get('applyId').value
      console.log('removePaymentPlan -> ', {applyId, id})
      if(!!id){
        await this.spService.removeOitAdvancedPayPlan(applyId,id)
        this.message.success('删除成功！');
      }
      this.gapPaymentPlanInfoForm.removeAt(index);
      // 重新编号
      this.gapPaymentPlanInfoForm.controls.forEach((control, i) => {
        control.get('sequenceNo').setValue(i + 1);
      });
      // 重新验证所有计划项
      this.validateAllPaymentPlans();
    } else {
      this.message.warning('至少保留一条付款计划');
    }
  }

  // 订阅单个付款计划项的变化
  subscribeToPaymentPlanChanges(index: number) {
    const planControl = this.gapPaymentPlanInfoForm.at(index);
    if (!planControl) return;

    // 监听比率变化
    const ratioControl = planControl.get('paymentRatio');
    if (ratioControl) {
      ratioControl.valueChanges.subscribe(ratio => {
        if (ratio !== null && ratio !== undefined && ratio !== '' && !isNaN(Number(ratio))) {
          // 自动计算对应的金额
          this.calculatePaymentAmountFromRatio(index, Number(ratio));
        }
        // 重新验证所有付款计划
        this.validateAllPaymentPlans();
      });
    }

    // 监听金额变化
    const amountControl = planControl.get('paymentAmount');
    if (amountControl) {
      amountControl.valueChanges.subscribe(amount => {
        if (amount !== null && amount !== undefined && amount !== '' && !isNaN(Number(amount))) {
          // 自动计算对应的比率
          this.calculatePaymentRatioFromAmount(index, Number(amount));
        }
        // 重新验证所有付款计划
        this.validateAllPaymentPlans();
      });
    }
  }

  // 验证所有付款计划项
  validateAllPaymentPlans() {
    if (!this.gapPaymentPlanInfoForm) return;

    this.gapPaymentPlanInfoForm.controls.forEach(control => {
      const ratioControl = control.get('paymentRatio');
      const amountControl = control.get('paymentAmount');

      if (ratioControl) {
        ratioControl.updateValueAndValidity({ emitEvent: false });
      }
      if (amountControl) {
        amountControl.updateValueAndValidity({ emitEvent: false });
      }
    });
  }

  // 计算差额付款金额（基于比率）
  calculatePaymentAmountFromRatio(planIndex: number, ratio: number) {
    if (!this.financeInfoForm || !this.gapPaymentPlanInfoForm) return;

    const planControl = this.gapPaymentPlanInfoForm.at(planIndex);
    if (!planControl) return;

    // 获取差额含税金额
    const gapPriceControl = this.financeInfoForm.get('gapPrice');
    const gapPrice = gapPriceControl ? gapPriceControl.value : null;

    if (gapPrice && !isNaN(Number(gapPrice))) {
      const baseAmount = Math.abs(Number(gapPrice));
      const calculatedAmount = (baseAmount * ratio) / 100;

      // 更新金额字段，不触发事件以避免循环
      const amountControl = planControl.get('paymentAmount');
      if (amountControl) {
        amountControl.setValue(calculatedAmount, { emitEvent: false });
      }
    }
  }

  // 计算差额付款比率（基于金额）
  calculatePaymentRatioFromAmount(planIndex: number, amount: number) {
    if (!this.financeInfoForm || !this.gapPaymentPlanInfoForm) return;

    const planControl = this.gapPaymentPlanInfoForm.at(planIndex);
    if (!planControl) return;

    // 获取差额含税金额
    const gapPriceControl = this.financeInfoForm.get('gapPrice');
    const gapPrice = gapPriceControl ? gapPriceControl.value : null;

    if (gapPrice && !isNaN(Number(gapPrice)) && Number(gapPrice) !== 0) {
      const baseAmount = Math.abs(Number(gapPrice));
      const calculatedRatio = (Math.abs(amount) / baseAmount) * 100;

      // 更新比率字段，不触发事件以避免循环
      const ratioControl = planControl.get('paymentRatio');
      if (ratioControl) {
        ratioControl.setValue(calculatedRatio, { emitEvent: false });
      }
    }
  }

  // 获取单个付款计划的最大允许比率
  getMaxAllowedRatio(planIndex: number): number {
    if (!this.gapPaymentPlanInfoForm || !this.financeInfoForm) return 0;

    // 获取差额比例
    const gapRadioControl = this.financeInfoForm.get('gapRadio');
    const gapRatio = gapRadioControl ? gapRadioControl.value : null;
    const maxTotalRatio = gapRatio && !isNaN(Number(gapRatio)) ? Math.abs(Number(gapRatio)) : 0;

    // 计算其他付款计划已使用的比率总和
    const usedRatio = this.gapPaymentPlanInfoForm.controls.reduce((sum, control, index) => {
      if (index === planIndex) return sum; // 排除当前项
      const ratioControl = control.get('paymentRatio');
      const ratio = ratioControl ? ratioControl.value : null;
      return sum + (ratio && !isNaN(Number(ratio)) ? Number(ratio) : 0);
    }, 0);

    // 返回剩余可用的最大比率（差额比例 - 其他计划已使用的比率）
    return Math.max(0, maxTotalRatio - usedRatio);
  }

  // 获取单个付款计划的最大允许金额
  getMaxAllowedAmount(planIndex: number): number {
    if (!this.financeInfoForm || !this.gapPaymentPlanInfoForm) return 0;

    // 获取差额含税金额
    const gapPriceControl = this.financeInfoForm.get('gapPrice');
    const gapPrice = gapPriceControl ? gapPriceControl.value : null;
    const maxGapAmount = gapPrice && !isNaN(Number(gapPrice)) ? Math.abs(Number(gapPrice)) : 0;

    // 计算其他付款计划已使用的金额总和
    const usedAmount = this.gapPaymentPlanInfoForm.controls.reduce((sum, control, index) => {
      if (index === planIndex) return sum; // 排除当前项
      const amountControl = control.get('paymentAmount');
      const amount = amountControl ? amountControl.value : null;
      return sum + (amount && !isNaN(Number(amount)) ? Number(amount) : 0);
    }, 0);

    // 返回剩余可用的最大金额
    return maxGapAmount - usedAmount;
  }

  // 获取比率字段的placeholder文本
  getPaymentRatioPlaceholder(planIndex: number): string {
    if (!this.gapPaymentPlanInfoForm || !this.financeInfoForm) return '';

    // 获取差额比例
    const gapRadioControl = this.financeInfoForm.get('gapRadio');
    const gapRatio = gapRadioControl ? gapRadioControl.value : null;
    const maxTotalRatio = gapRatio && !isNaN(Number(gapRatio)) ? Math.abs(Number(gapRatio)) : 0;

    // 计算其他付款计划已使用的比率
    const usedRatio = this.gapPaymentPlanInfoForm.controls.reduce((sum, control, index) => {
      if (index === planIndex) return sum; // 排除当前项
      const ratioControl = control.get('paymentRatio');
      const ratio = ratioControl ? ratioControl.value : null;
      return sum + (ratio && !isNaN(Number(ratio)) ? Number(ratio) : 0);
    }, 0);

    // 计算剩余比率（差额比例 - 其他计划已使用的比率）
    const remainingRatio = Math.max(0, maxTotalRatio - usedRatio);

    return `剩余：${remainingRatio.toFixed(2)}%`;
  }

  // 获取金额字段的placeholder文本
  getPaymentAmountPlaceholder(planIndex: number): string {
    if (!this.financeInfoForm || !this.gapPaymentPlanInfoForm) return '';

    // 获取差额含税金额
    const gapPriceControl = this.financeInfoForm.get('gapPrice');
    const gapPrice = gapPriceControl ? gapPriceControl.value : null;
    const totalGapAmount = gapPrice && !isNaN(Number(gapPrice)) ? Math.abs(Number(gapPrice)) : 0;

    // 计算其他付款计划已使用的金额
    const usedAmount = this.gapPaymentPlanInfoForm.controls.reduce((sum, control, index) => {
      if (index === planIndex) return sum; // 排除当前项
      const amountControl = control.get('paymentAmount');
      const amount = amountControl ? amountControl.value : null;
      return sum + (amount && !isNaN(Number(amount)) ? Number(amount) : 0);
    }, 0);

    const remainingAmount = totalGapAmount - usedAmount;
    return `剩余：${remainingAmount.toFixed(2)}`;
  }

  // 获取付款日期的禁用日期函数
  getDisabledDate = (planIndex: number) => {
    return (current: Date): boolean => {
      if (!current || !this.gapPaymentPlanInfoForm) {
        return false;
      }

      // 如果是第一个计划项，不禁用任何日期
      if (planIndex <= 0) {
        return false;
      }

      // 获取上一个计划项的日期
      const previousPlanControl = this.gapPaymentPlanInfoForm.at(planIndex - 1);
      const previousDateControl = previousPlanControl ? previousPlanControl.get('paymentDate') : null;
      const previousDate = previousDateControl ? previousDateControl.value : null;

      if (previousDate) {
        const prevDate = new Date(previousDate);
        if (!isNaN(prevDate.getTime())) {
          // 禁用早于或等于上一个计划日期的所有日期
          return current.getTime() <= prevDate.getTime();
        }
      }

      return false;
    };
  }
  debugValidationStatus() {
    if (!this.gapPaymentPlanInfoForm) {
      console.log('gapPaymentPlanInfoForm is null');
      return;
    }

    console.log('Payment plan validation status:');
    console.log('Gap ratio:', this.financeInfoForm.get('gapRadio') ? this.financeInfoForm.get('gapRadio').value : 'N/A');
    console.log('Gap price:', this.financeInfoForm.get('gapPrice') ? this.financeInfoForm.get('gapPrice').value : 'N/A');

    this.gapPaymentPlanInfoForm.controls.forEach((control, index) => {
      const ratioControl = control.get('paymentRatio');
      const amountControl = control.get('paymentAmount');

      console.log(`Plan ${index + 1}:`);
      console.log('  Ratio:', ratioControl ? ratioControl.value : null, 'Valid:', ratioControl ? ratioControl.valid : null, 'Errors:', ratioControl ? ratioControl.errors : null);
      console.log('  Amount:', amountControl ? amountControl.value : null, 'Valid:', amountControl ? amountControl.valid : null, 'Errors:', amountControl ? amountControl.errors : null);
      console.log('  Max allowed ratio:', this.getMaxAllowedRatio(index));
      console.log('  Max allowed amount:', this.getMaxAllowedAmount(index));
    });
  }

  // 初始化付款计划验证
  initializePaymentPlanValidation() {
    if (!this.gapPaymentPlanInfoForm) return;

    // 如果没有付款计划项，添加一个默认项
    if (this.gapPaymentPlanInfoForm.length === 0) {
      this.addPaymentPlan();
      return;
    }

    // 为现有的付款计划项添加验证器和监听
    for (let i = 0; i < this.gapPaymentPlanInfoForm.length; i++) {
      const planControl = this.gapPaymentPlanInfoForm.at(i);
      if (planControl) {
        // 为比率字段添加验证器
        const ratioControl = planControl.get('paymentRatio');
        if (ratioControl) {
          ratioControl.setValidators([Validators.required, this.singleRatioValidator, this.gapPaymentRatioSumValidator]);
          ratioControl.updateValueAndValidity();
        }

        // 为金额字段添加验证器
        const amountControl = planControl.get('paymentAmount');
        if (amountControl) {
          amountControl.setValidators([Validators.required, this.singleAmountValidator, this.gapPaymentAmountSumValidator]);
          amountControl.updateValueAndValidity();
        }

        // 设置监听
        this.subscribeToPaymentPlanChanges(i);
      }
    }
  }

  onShowSelectDealFormModal(){
    this.selectDealFormDialog.showModal();
  }

  // 更新SO号码（仅更新临时值）
  // 已删除updateSoValue方法，现在使用标准FormControl绑定

  // 验证SO字段格式（在失去焦点时调用）
  validateSoField(index: number, event: any) {
    const value = (event.target as HTMLInputElement).value;
    const control = this.orderInfoArray.at(index).get('so');

    // 验证只包含数字和分号
    const isValid = /^[0-9;]*$/.test(value);

    if (isValid) {
      // 清除错误状态
      control.setErrors(null);
    } else {
      // 设置错误状态
      control.setErrors({ invalidSo: true });
    }

    control.markAsTouched();
  }

  // 获取SO字段的验证错误状态
  getSoValidationError(index: number): boolean {
    const control = this.orderInfoArray.at(index).get('so');
    return !!(control && control.errors && control.touched);
  }

  async onSelectDealForm(dealForm: DealForm) {
    console.log('Selected DealForm:', dealForm);
    this.formValues.patchValue({
      dealformId: dealForm.dealFormId,
      dealerName: dealForm.dealerName,
      hospitalName: dealForm.hospitalName || '',
      businessModel: dealForm.businessType || '',
      sales: dealForm.sales || ''
    });
    let dealPriceCnyNet = dealForm.dealPriceCnyNet || 0;
    let dealPriceCny = dealForm.dealPriceCny || 0;
    let dealPriceUsd = dealForm.dealPriceUsd || 0;
    this.financeInfoForm.patchValue({
      currency: dealForm.currency || 'CNY',
      dealPriceCnyNet: dealPriceCnyNet,
      dealPriceCny: dealPriceCny,
      dealPriceUsd: dealPriceUsd
    })
    let res =  await this.loadOrderByDealFormId(dealForm.dealFormId);

    // 先清空现有的orderInfoArray
    while(this.orderInfoArray.length > 0) {
      this.orderInfoArray.removeAt(0);
    }

    // 如果有订单数据则动态添加FormGroup
    if(res && res.length > 0) {
      res.forEach(orderData => {
        const orderFormGroup = this.fb.group({
          id: [orderData.id || null],
          applyId: [orderData.applyId || null],
          orderId: [orderData.orderId || null],
          referenceId: [orderData.referenceId || null],
          bmc: [orderData.bmc || null],
          productModel: [orderData.productModel || null],
          so: [orderData.so || null],
        });
        this.orderInfoArray.push(orderFormGroup);
      });
    }

    console.log('Loaded orders for DealForm:', res);
    console.log('OrderInfoArray controls length after loading:', this.orderInfoArray.controls.length);
    console.log('OrderInfoArray controls:', this.orderInfoArray.controls);

    // 重新建立财务字段监听，确保使用新的基础数据进行计算
    setTimeout(() => {
      this.subscribeToFinanceFieldChanges();
    }, 100);

    console.log(this.formValues.value);
  }

  /**
   * 保存时的验证：只验证Deal Form No是否为空
   */
  validateForSave(): { isValid: boolean; errorMessage?: string } {
    const dealformId = this.formValues.get('dealformId').value;

    if (!dealformId || dealformId.trim() === '') {
      return {
        isValid: false,
        errorMessage: 'Deal Form 不能为空，请先导入Deal Form'
      };
    }

    return { isValid: true };
  }

  /**
   * 提交时的验证：验证所有必填项
   */
  validateForSubmit(): { isValid: boolean; errorMessage?: string } {
    // 首先检查Deal Form No
    const saveValidation = this.validateForSave();
    if (!saveValidation.isValid) {
      return saveValidation;
    }

    // 验证财务信息必填项
    const financeValidation = this.validateFinanceInfo();
    if (!financeValidation.isValid) {
      return financeValidation;
    }

    // 验证付款计划
    const paymentPlanValidation = this.validatePaymentPlans();
    if (!paymentPlanValidation.isValid) {
      return paymentPlanValidation;
    }

    return { isValid: true };
  }

  /**
   * 验证财务信息必填项
   */
  private validateFinanceInfo(): { isValid: boolean; errorMessage?: string } {
    const financeInfo = this.financeInfoForm.value;

    // 验证合同约定的OIT支付比率
    if (!financeInfo.ratioAsContracted || financeInfo.ratioAsContracted <= 0) {
      return {
        isValid: false,
        errorMessage: '合同约定的OIT支付比率不能为空且必须大于0'
      };
    }

    // 验证合同约定的OIT金额
    if (!financeInfo.dealPriceAsContracted || financeInfo.dealPriceAsContracted <= 0) {
      return {
        isValid: false,
        errorMessage: '合同约定的OIT金额不能为空且必须大于0'
      };
    }

    // 验证实际OIT支付比率
    if (!financeInfo.actualRatio || financeInfo.actualRatio <= 0) {
      return {
        isValid: false,
        errorMessage: '实际OIT支付比率不能为空且必须大于0'
      };
    }

    // 验证实际OIT支付金额
    if (!financeInfo.actualDealPrice || financeInfo.actualDealPrice <= 0) {
      return {
        isValid: false,
        errorMessage: '实际OIT支付金额不能为空且必须大于0'
      };
    }

    // 验证审批文件
    if (!financeInfo.approvalFiles || financeInfo.approvalFiles.length === 0) {
      return {
        isValid: false,
        errorMessage: '请上传实际OIT支付的"事前审批邮件或证明文件"'
      };
    }

    return { isValid: true };
  }

  /**
   * 验证付款计划
   */
  private validatePaymentPlans(): { isValid: boolean; errorMessage?: string } {
    const paymentPlans = this.gapPaymentPlanInfoForm.value;

    if (!paymentPlans || paymentPlans.length === 0) {
      return {
        isValid: false,
        errorMessage: '至少需要添加一条差额付款计划'
      };
    }

    // 获取差额比例和差额含税金额用于总和验证
    const gapRatio = this.financeInfoForm.get('gapRadio').value;
    const gapPrice = this.financeInfoForm.get('gapPrice').value;

    let totalPaymentRatio = 0;
    let totalPaymentAmount = 0;

    for (let i = 0; i < paymentPlans.length; i++) {
      const plan = paymentPlans[i];

      // 验证差额付款比率
      if (!plan.paymentRatio || plan.paymentRatio <= 0) {
        return {
          isValid: false,
          errorMessage: `第${i + 1}期付款计划的差额付款比率不能为空且必须大于0`
        };
      }

      // 验证差额付款金额
      if (!plan.paymentAmount || plan.paymentAmount <= 0) {
        return {
          isValid: false,
          errorMessage: `第${i + 1}期付款计划的差额付款金额不能为空且必须大于0`
        };
      }

      // 验证承诺付款时间
      if (!plan.paymentDate) {
        return {
          isValid: false,
          errorMessage: `第${i + 1}期付款计划的承诺付款时间不能为空`
        };
      }

      // 累计比率和金额
      totalPaymentRatio += Number(plan.paymentRatio);
      totalPaymentAmount += Number(plan.paymentAmount);
    }

    // 验证差额付款比率总和是否等于差额比例
    if (gapRatio !== null && gapRatio !== undefined && gapRatio !== '') {
      const expectedRatio = Math.abs(Number(gapRatio));
      const tolerance = 0.01; // 允许0.01%的误差

      if (Math.abs(totalPaymentRatio - expectedRatio) > tolerance) {
        return {
          isValid: false,
          errorMessage: `差额付款比率总和(${totalPaymentRatio.toFixed(2)}%)必须等于差额比例(${expectedRatio.toFixed(2)}%)`
        };
      }
    }

    // 验证差额付款金额总和是否等于差额含税金额
    if (gapPrice !== null && gapPrice !== undefined && gapPrice !== '') {
      const expectedAmount = Math.abs(Number(gapPrice));
      const tolerance = 0.01; // 允许0.01的误差

      if (Math.abs(totalPaymentAmount - expectedAmount) > tolerance) {
        return {
          isValid: false,
          errorMessage: `差额付款金额总和(${totalPaymentAmount.toFixed(2)})必须等于差额含税金额(${expectedAmount.toFixed(2)})`
        };
      }
    }

    return { isValid: true };
  }
}
