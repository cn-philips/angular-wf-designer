import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpService } from "@core/services";
import { areaList } from "@core/util/areajson";
import {
  disreduce,
  haveRolesArr,
  isadopt,
  standardTime,
} from "@core/util/tools";
import { environment } from "@env";
import { NzMessageService } from "ng-zorro-antd";
import { Subject } from "rxjs";
import { OrderV3Service } from "../../order-v3.service";
import { compareIgnoreSensitiveCase } from "@app/utils/StringUtils";

@Component({
  selector: "pre-base-info-from",
  templateUrl: "./pre-base-info-from.component.html",
  styleUrls: ["./pre-base-info-from.component.scss"],
})
export class PreBaseInfoFromComponent implements OnInit {
  constructor(
    private serveic: OrderV3Service,
    private activatedRouter: ActivatedRoute,
    private router: Router,
    private message: NzMessageService,
    private http: HttpService,
    public changeDetectorRef: ChangeDetectorRef
  ) {
    this.serveic.productReceive.subscribe((val) => {
      this.iscontractBuyer();
      this.ifForeignTradeCompany();
      this.isdealValidator();
      this.isaccountFrom();
      const {
        dealFormSalesProvince,
        businessModel,
        orderSalesProvince,
        dealFormSalesModality,
      } = this.baseInfoFrom.getRawValue();
      if (this.isContract) {
        this.paymentMethods();
        this.selectCity(orderSalesProvince);
      } else {
        this.selectCity(dealFormSalesProvince);
      }
      this.orderEntryMode(businessModel); //获取进单模式
    });
    this.serveic.paymentDataReceive.subscribe((val) => {
      this.paymentMethods();
    });
  }
  flag: any;
  orderModeList: any;
  orderModeLists: any;
  provinceList: any = [];
  cityList: any = [];
  StockOff: any = true;
  status: any = null; //流程状态
  dealIsDisabled: boolean = false; //经销商是否禁用
  isFirstLoad = false;
  prebookDisabled: any = true; //prebook按钮是不禁用
  paymentTerm: any;
  modalityInfo: any;
  dealerCheckStatus: any = "";
  foreignerCheckStatus: any = "";
  biddingList = [
    {
      value: "飞利浦（中国）投资有限公司",
      label: "飞利浦（中国）投资有限公司",
    },
    {
      value: "飞利浦电子香港有限公司",
      label: "飞利浦电子香港有限公司",
    },
  ];
  bidTypeModeList: any = [
    { code: "国内公开标", label: "国内公开标" },
    { code: "国际公开标", label: "国际公开标" },
    { code: "其他类型", label: "其他类型" },
  ];
  public style: any = { width: "100%" }; //控制日期控件样式
  public price_permission: boolean = false;
  @Input() editBase: boolean = true;
  @Input() formValue: FormGroup;
  @Input() editable: boolean = true;
  @Input() editPreTable: boolean = true;
  @Input() changeItem: boolean = false;
  @Input() subTierSubject: Subject<{
    type: string;
    data?: any;
    disabled?: boolean;
  }>;
  @Output() addProduct = new EventEmitter();

  @ViewChild("selectSoluUser") selectSoluUser;
  @ViewChild("selectActualUser") selectActualUser;
  @ViewChild("selectDealer") selectDealer;
  @ViewChild("selectHospital") selectHospital;
  @ViewChild("selectForign") selectForign;
  @ViewChild("selectDeal") selectDeal;
  @ViewChild("selectPreBook") selectPreBook;
  @ViewChild("selectRefno") selectRefno;

  @Input() isContract: any = false;
  ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();
  }
  ngOnInit() {
    this.init();

    // 主页导入
    this.handleImport();
  }
  public ddpStatusDmsDealer;
  public saleRegions;
  public needFileType;
  public isEqual: any = null;

  get orderInfo(): FormArray {
    return this.formValue.get("orderInfo") as FormArray;
  }
  get baseInfoFrom(): FormGroup {
    return this.formValue.get("baseInfoFrom") as FormGroup;
  }
  get dealerFrom(): FormGroup {
    return this.formValue.get("dealerFrom") as FormGroup;
  }
  get accountFrom(): FormGroup {
    return this.formValue.get("accountFrom") as FormGroup;
  }
  get contractBuyerFrom(): FormGroup {
    return this.formValue.get("contractBuyerFrom") as FormGroup;
  }
  get foreignFrom(): FormGroup {
    return this.formValue.get("foreignFrom") as FormGroup;
  }
  get endUserFrom(): FormGroup {
    return this.formValue.get("endUserFrom") as FormGroup;
  }
  get priceApproval(): FormGroup {
    return this.formValue.get("priceApproval") as FormGroup;
  }
  get marketBundleInfo(): FormArray {
    return this.formValue.get("marketBundleInfo") as FormArray;
  }
  get baseInfoTable(): FormGroup {
    return this.formValue.get("baseInfoTable") as FormGroup;
  }
  get dealerSales() {
    const { dealFormSales, dealFormSalesName } =
      this.baseInfoFrom.getRawValue();
    if (dealFormSales) {
      return `${dealFormSalesName}(${dealFormSales})`;
    }
  }
  get orderSalesModel() {
    const { orderSales, orderSalesName } = this.baseInfoFrom.getRawValue();
    if (orderSales) {
      return `${orderSalesName}(${orderSales})`;
    } else {
      return "";
    }
  }

  get iSusHta() {
    const { segment } = this.endUserFrom.getRawValue();
    if (segment) {
      if (segment.indexOf("US:HTA") != -1) {
        return "是";
      } else {
        return "否";
      }
    }
  }
  get businessModelName() {
    const { businessModel } = this.baseInfoFrom.getRawValue();
    if (businessModel == "DIRECT") {
      return "Direct Deal";
    } else if (businessModel == "DISTRIBUTOR") {
      return "Distributor Deal";
    }
  }
  get financialSolutionNameModel() {
    const { financialSolutionName, financialSolutionOther } =
      this.priceApproval.getRawValue();
    if (financialSolutionName == "其他") {
      return `${financialSolutionName}(${financialSolutionOther})`;
    } else {
      return financialSolutionName;
    }
  }

  get dealerNameBestSign() {
    const { dealerName } = this.dealerFrom.getRawValue();
    return dealerName;
  }

  get foreignTradeCorpNameBestSign() {
    const { foreignTradeCorpName } = this.foreignFrom.getRawValue();
    return foreignTradeCorpName;
  }
  timer: any = null;
  timer1: any = null;
  init() {
    this.status = this.activatedRouter.queryParams["value"].taskStatus;
    this.flag = this.activatedRouter.queryParams["value"].flag;
    this.needFileType = this.activatedRouter.queryParams["value"].needFileType;
    if (
      (this.status == "ecos_oit_order_upload" && this.flag == "0") ||
      this.needFileType == "om"
    ) {
      this.prebookDisabled = false;
    }
    this.initSaleRegions("Sales Rep/Mgr");
    this.provinceList = areaList.map((val) => ({
      code: val.code,
      value: val.value,
    }));
    this.checkDealerByBestSign();
    this.checkForeignerByBestSign();

    // this.baseInfoFrom
    //   .get("dealFormSalesProvince")
    //   .valueChanges.pipe()
    //   .subscribe((prev) => {

    //     if(!prev)
    //     {
    //       return;
    //     }
    //     const { dealFormSalesProvince, oldSalesProvince, dealFormSalesModality } = this.baseInfoFrom.getRawValue();
    //     this.selectCity(prev);
    //     const isFirstLoad = this.formValue.getRawValue().isFirstLoad;
    //     if (oldSalesProvince != prev && isFirstLoad) {
    //       this.baseInfoFrom.patchValue({
    //         dealFormSalesCity: null,
    //       });
    //     }
    //     this.selectConfigProvince()
    //     this.formValue.patchValue({
    //       isload: true,
    //       isFirstLoad: true,
    //     });
    //   });

    // this.baseInfoFrom
    //   .get("orderSalesProvince")
    //   .valueChanges.pipe()
    //   .subscribe((prev) => {
    //     if(!prev)
    //     {
    //       return;
    //     }
    //     const oldSalesProvince =
    //       this.baseInfoFrom.getRawValue().oldSalesProvince;
    //     this.selectCity(prev);
    //     const isFirstLoad = this.formValue.getRawValue().isFirstLoad;
    //     if (oldSalesProvince != prev && isFirstLoad) {
    //       this.baseInfoFrom.patchValue({
    //         dealFormSalesCity: null,
    //       });
    //     }
    //     this.formValue.patchValue({
    //       isFirstLoad: true,
    //     });

    //   });

    this.serveic.orderEntryMode().then((res) => {
      if (res.code == "0000") {
        this.orderModeList = res.data;
        if (res.data && res.data.length > 0) {
          this.orderModeLists = JSON.parse(JSON.stringify(res.data));
        }
      }
    });
    const arr = JSON.parse(localStorage.getItem("permissions"));
    if (arr) {
      this.price_permission = haveRolesArr(arr.price);
    }
  }

  checkDealerByBestSign() {
    let num = 0;
    this.timer = setInterval(async () => {
      num++;
      if (this.dealerNameBestSign) {
        const result = await this.checkCompanyByBestSign(
          this.dealerNameBestSign
        );
        this.dealerCheckStatus = result;
        clearInterval(this.timer);
        this.timer = null;
      } else {
        if (num > 10) {
          clearInterval(this.timer);
          this.timer = null;
        }
      }
    }, 1000);
  }

  checkForeignerByBestSign() {
    let num = 0;
    this.timer1 = setInterval(async () => {
      num++;
      if (
        this.priceApproval.getRawValue().currencySystem == "USD" &&
        this.foreignTradeCorpNameBestSign
      ) {
        const result = await this.checkCompanyByBestSign(
          this.foreignTradeCorpNameBestSign
        );
        this.foreignerCheckStatus = result;
        clearInterval(this.timer1);
        this.timer1 = null;
      } else {
        if (num > 10) {
          clearInterval(this.timer);
          this.timer = null;
        }
      }
    }, 1000);
  }

  isRequireorderSalesPerformanceProvince() {
    if (!this.isContract) {
      const { dealFormSalesModality } = this.baseInfoFrom.getRawValue();
      if (dealFormSalesModality == "US") {
        this.baseInfoFrom
          .get("dealFormSalesPerformanceProvince")
          .setValidators(Validators.required);
        this.baseInfoFrom
          .get("dealFormSalesPerformanceProvince")
          .updateValueAndValidity();
        return true;
      } else {
        this.baseInfoFrom
          .get("dealFormSalesPerformanceProvince")
          .clearValidators();
        this.baseInfoFrom
          .get("dealFormSalesPerformanceProvince")
          .updateValueAndValidity();
        return false;
      }
    } else {
      const { orderSalesModality } = this.baseInfoFrom.getRawValue();
      if (orderSalesModality == "US") {
        this.baseInfoFrom
          .get("orderSalesPerformanceProvince")
          .setValidators(Validators.required);
        this.baseInfoFrom
          .get("orderSalesPerformanceProvince")
          .updateValueAndValidity();
        return true;
      } else {
        this.baseInfoFrom
          .get("orderSalesPerformanceProvince")
          .clearValidators();
        this.baseInfoFrom
          .get("orderSalesPerformanceProvince")
          .updateValueAndValidity();
        return false;
      }
    }
  }
  changeOrderSalesProvince(prev) {
    if (!prev) {
      return;
    }
    const oldSalesProvince = this.baseInfoFrom.getRawValue().oldSalesProvince;
    this.selectCity(prev);
    const isFirstLoad = this.formValue.getRawValue().isFirstLoad;
    if (oldSalesProvince != prev && isFirstLoad) {
      this.baseInfoFrom.patchValue({
        orderSalesCity: null,
      });
    }
    this.formValue.patchValue({
      isFirstLoad: true,
    });
  }
  changeSalesProvince(prev) {
    if (!prev) {
      return;
    }
    const { dealFormSalesProvince, oldSalesProvince, dealFormSalesModality } =
      this.baseInfoFrom.getRawValue();
    this.selectCity(prev);
    const isFirstLoad = this.formValue.getRawValue().isFirstLoad;
    if (oldSalesProvince != prev && isFirstLoad) {
      this.baseInfoFrom.patchValue({
        dealFormSalesCity: null,
      });
    }
    this.selectConfigProvince();
    this.formValue.patchValue({
      isload: true,
      isFirstLoad: true,
    });
  }
  selectConfigProvince() {
    const {
      dealFormSalesProvince,
      oldSalesProvince,
      dealFormSalesModality,
      centralizedPurchasing,
    } = this.baseInfoFrom.getRawValue();
    const user = localStorage.getItem("ecom_ng_philips_code1");
    if (this.orderInfo && this.orderInfo.length > 0) {
      this.orderInfo.controls.forEach((val, index) => {
        const orderSalesinfo = this.orderInfo
          .at(index)
          .get("orderSalesinfo") as FormGroup;
        const orderBaseinfo = this.orderInfo
          .at(index)
          .get("orderBaseinfo") as FormGroup;
        const { orderModality } = orderBaseinfo.getRawValue();
        const { orderSales } = orderSalesinfo.getRawValue();
        if (dealFormSalesModality == orderModality && compareIgnoreSensitiveCase(user , orderSales) && centralizedPurchasing == '0') {
          orderSalesinfo.patchValue({
            orderSalesProvince: dealFormSalesProvince,
            orderSalesCity: null,
            cityList: this.cityList,
          });
        }
      });
    }
  }
  selectConfigCity(dealFormSalesCity, orderCity) {
    const { dealFormSalesModality } = this.baseInfoFrom.getRawValue();
    const value = this.baseInfoFrom.getRawValue()[dealFormSalesCity];
    const user = localStorage.getItem("ecom_ng_philips_code1");
    this.orderInfo.controls.forEach((val, index) => {
      const orderSalesinfo = this.orderInfo
        .at(index)
        .get("orderSalesinfo") as FormGroup;
      const orderBaseinfo = this.orderInfo
        .at(index)
        .get("orderBaseinfo") as FormGroup;
      const { orderModality } = orderBaseinfo.getRawValue();
      const { orderSales } = orderSalesinfo.getRawValue();
      if (dealFormSalesModality == orderModality && user == orderSales) {
        const obj: any = {};
        obj[orderCity] = value;
        if (orderCity == "orderSalesCity") {
          const { cityList } = orderSalesinfo.getRawValue();
          if (cityList && cityList.length > 0) {
            const city = cityList.find((val) => val.value == value);
            city && orderSalesinfo.patchValue({ orderSalesCity: value });
          } else {
            orderSalesinfo.patchValue({ orderSalesCity: value });
          }
        } else {
          orderSalesinfo.patchValue(obj);
        }
      }
    });
  }
  selectConfigapprovalAreaConfiguration() {
    const {
      dealFormSalesModality,
      dealFormSalesBigArea,
      dealFormSalesSmallArea,
      dealFormSalesProvince,
      cycleGroup,
      dealFormSalesTeam,
      dealFormSalesPerformanceProvince,
      approvalAreaConfiguration,
      centralizedPurchasing,
    } = this.baseInfoFrom.getRawValue();
    const { dealFormSalesCity } = this.baseInfoFrom.getRawValue();
    const user = localStorage.getItem("ecom_ng_philips_code1");
    const userName = localStorage.getItem("ng_philips_username");
    if (centralizedPurchasing == "0") {
      this.orderInfo.controls.forEach((val, index) => {
        const orderSalesinfo = this.orderInfo
          .at(index)
          .get("orderSalesinfo") as FormGroup;
        const orderBaseinfo = this.orderInfo
          .at(index)
          .get("orderBaseinfo") as FormGroup;
        const { orderModality } = orderBaseinfo.getRawValue();
        const { orderSales } = orderSalesinfo.getRawValue();
        if (dealFormSalesModality == orderModality) {
          const param = {
            orderSales: user,
            orderSalesName: userName,
            orderSalesModel: `${userName}(${user})`,
            orderSalesModality: dealFormSalesModality,
            orderSalesBigArea: dealFormSalesBigArea,
            orderSalesSmallArea: dealFormSalesSmallArea,
            orderSalesCycleGroup: cycleGroup,
            orderSalesTeam: dealFormSalesTeam,
            orderSalesProvince: dealFormSalesProvince,
            orderSalesPerformanceProvince: dealFormSalesPerformanceProvince,
            orderApprovalAreaConfiguration: approvalAreaConfiguration,
            orderSalesCity: dealFormSalesCity,
            orderDisbled: true,
          };
          orderSalesinfo.patchValue(param);
        }
      });
    }
  }
  isOitMode() {
    let modality;
    if (this.isContract) {
      modality = this.baseInfoFrom.getRawValue().orderSalesModality;
    } else {
      modality = this.baseInfoFrom.getRawValue().dealFormSalesModality;
    }
    if (modality == "PD&IGT") {
      this.baseInfoFrom.get("oitMode").setValidators(Validators.required);
      this.baseInfoFrom.get("oitMode").updateValueAndValidity();
      return true;
    } else {
      this.baseInfoFrom.get("oitMode")!.clearValidators();
      this.baseInfoFrom.get("oitMode").updateValueAndValidity();
      return false;
    }
  }
  isInvoicing() {
    //开票信息显示是否必填
    const currencySystem = this.priceApproval.getRawValue().currencySystem;
    const modality = this.baseInfoFrom.getRawValue().dealFormSalesModality;
    if (currencySystem == "CNY" && modality == "PD&IGT") {
      return true;
    } else {
      return false;
    }
  }

  isaccountFrom() {
    //开票信息是不是必填
    const currencySystem = this.priceApproval.getRawValue().currencySystem;
    const modality = this.baseInfoFrom.getRawValue().dealFormSalesModality;
    if (currencySystem == "CNY" && modality == "PD&IGT") {
      this.accountFrom.get("accountName").setValidators(Validators.required);
      this.accountFrom.get("bankName").setValidators(Validators.required);
      this.accountFrom.get("accountNo").setValidators(Validators.required);
      this.accountFrom
        .get("registrationAddress")
        .setValidators(Validators.required);
      this.accountFrom
        .get("accountPhoneFax")
        .setValidators(Validators.required);
      this.accountFrom.get("recipient").setValidators(Validators.required);
      this.accountFrom.get("recipientPhone").setValidators(Validators.required);
      this.accountFrom
        .get("invoicesDeliverAddress")
        .setValidators(Validators.required);
      this.accountFrom.get("taxNum").setValidators(Validators.required);
    } else {
      this.accountFrom.get("accountName")!.clearValidators();
      this.accountFrom.get("bankName")!.clearValidators();
      this.accountFrom.get("accountNo")!.clearValidators();
      this.accountFrom.get("registrationAddress")!.clearValidators();
      this.accountFrom.get("accountPhoneFax")!.clearValidators();
      this.accountFrom.get("recipient")!.clearValidators();
      this.accountFrom.get("recipientPhone")!.clearValidators();
      this.accountFrom.get("invoicesDeliverAddress")!.clearValidators();
      this.accountFrom.get("taxNum")!.clearValidators();
    }
    this.accountFrom.get("accountName")!.updateValueAndValidity();
    this.accountFrom.get("bankName")!.updateValueAndValidity();
    this.accountFrom.get("accountNo")!.updateValueAndValidity();
    this.accountFrom.get("registrationAddress")!.updateValueAndValidity();
    this.accountFrom.get("accountPhoneFax")!.updateValueAndValidity();
    this.accountFrom.get("recipient")!.updateValueAndValidity();
    this.accountFrom.get("recipientPhone")!.updateValueAndValidity();
    this.accountFrom.get("invoicesDeliverAddress")!.updateValueAndValidity();
    this.accountFrom.get("taxNum")!.updateValueAndValidity();
  }
  ifForeignTradeCompany() {
    const currencySystem = this.priceApproval.getRawValue().currencySystem;
    if (currencySystem != "USD") {
      this.foreignFrom.get("foreignTradeCorpSapCode")!.clearValidators();
      this.foreignFrom.get("foreignTradeCorpDdpStatus")!.clearValidators();
      this.foreignFrom
        .get("foreignTradeCorpDdpValidityDate")!
        .clearValidators();
      this.foreignFrom.get("foreignTradeCorpTaxNum")!.clearValidators();
      this.foreignFrom.get("foreignTradeCorpAddress")!.clearValidators();
      this.foreignFrom.get("foreignTradeCorpName")!.clearValidators();
      this.foreignFrom.get("foreignTradeCorpPhone")!.clearValidators();
      this.foreignFrom.get("foreignTradeCorpContact")!.clearValidators();
      this.foreignFrom.get("foreignTradeCorpEmail")!.clearValidators();
      this.foreignFrom.get("importAgreementSignName")!.clearValidators();
      this.foreignFrom.get("importAgreementSignPosition")!.clearValidators();
      this.foreignFrom.get("foreignBestSignSignerAccount")!.clearValidators();
    } else {
      this.foreignFrom
        .get("foreignTradeCorpDdpStatus")!
        .setValidators([Validators.required, this.foreignDDpstatus]);
      this.foreignFrom
        .get("foreignTradeCorpDdpValidityDate")!
        .setValidators(Validators.required);
      this.foreignFrom
        .get("foreignTradeCorpTaxNum")!
        .setValidators(Validators.required);
      this.foreignFrom
        .get("foreignTradeCorpAddress")!
        .setValidators(Validators.required);
      this.foreignFrom
        .get("foreignTradeCorpName")!
        .setValidators(Validators.required);
      this.foreignFrom
        .get("foreignTradeCorpPhone")!
        .setValidators(Validators.required);
      this.foreignFrom
        .get("foreignTradeCorpContact")!
        .setValidators(Validators.required);
      this.foreignFrom
        .get("importAgreementSignName")!
        .setValidators(Validators.required);
      this.foreignFrom
        .get("importAgreementSignPosition")!
        .setValidators(Validators.required);
      this.foreignFrom
        .get("foreignTradeCorpEmail")!
        .setValidators(Validators.required);
      this.foreignFrom
        .get("foreignBestSignSignerAccount")!
        .setValidators(Validators.required);
    }
    this.foreignFrom.get("foreignTradeCorpSapCode")!.updateValueAndValidity();
    this.foreignFrom.get("foreignTradeCorpDdpStatus")!.updateValueAndValidity();
    this.foreignFrom
      .get("foreignTradeCorpDdpValidityDate")!
      .updateValueAndValidity();
    this.foreignFrom.get("foreignTradeCorpTaxNum")!.updateValueAndValidity();
    this.foreignFrom.get("foreignTradeCorpAddress")!.updateValueAndValidity();
    this.foreignFrom.get("foreignTradeCorpName")!.updateValueAndValidity();
    this.foreignFrom.get("foreignTradeCorpPhone")!.updateValueAndValidity();
    this.foreignFrom.get("foreignTradeCorpContact")!.updateValueAndValidity();
    this.foreignFrom.get("importAgreementSignName")!.updateValueAndValidity();
    this.foreignFrom
      .get("importAgreementSignPosition")!
      .updateValueAndValidity();
    this.foreignFrom.get("foreignTradeCorpEmail")!.updateValueAndValidity();
    this.foreignFrom
      .get("foreignBestSignSignerAccount")!
      .updateValueAndValidity();
  }
  isdealValidator() {
    //经销商的验证
    const businessModel = this.baseInfoFrom.getRawValue().businessModel;
    this.dealerFrom
      .get("dealerBestSignSignerAccount")
      .setValidators(Validators.required);
    if (businessModel == "DISTRIBUTOR") {
      this.dealerFrom.get("dealerName").setValidators(Validators.required);
      //this.dealerFrom.get("dealerSapCode").setValidators(Validators.required);
      this.dealerFrom.get("dealerContact").setValidators(Validators.required);
      this.dealerFrom.get("dealerPhone").setValidators(Validators.required);
      this.dealerFrom.get("dealerEmail").setValidators(Validators.required);
      this.dealerFrom.get("dealerAddress").setValidators(Validators.required);
      //this.dealerFrom.get("dealerTaxNum").setValidators(Validators.required);
      this.dealerFrom
        .get("dealerBestSignSignerAccount")!
        .setValidators(Validators.required);
      this.dealerFrom
        .get("purchaseOrderSignatory")
        .setValidators(Validators.required);
      this.dealerFrom
        .get("purchaseOrderSignatoryPosition")
        .setValidators(Validators.required);
    } else {
      this.dealerFrom.get("dealerName")!.clearValidators();
      this.dealerFrom.get("dealerSapCode")!.clearValidators();
      this.dealerFrom.get("dealerContact")!.clearValidators();
      this.dealerFrom.get("dealerPhone")!.clearValidators();
      this.dealerFrom.get("dealerEmail")!.clearValidators();
      this.dealerFrom.get("dealerAddress")!.clearValidators();
      this.dealerFrom.get("dealerTaxNum")!.clearValidators();
      this.dealerFrom.get("dealerBestSignSignerAccount")!.clearValidators();
      this.dealerFrom.get("purchaseOrderSignatory")!.clearValidators();
      this.dealerFrom.get("purchaseOrderSignatoryPosition")!.clearValidators();
    }
    this.dealerFrom.get("dealerName")!.updateValueAndValidity();
    this.dealerFrom.get("dealerSapCode")!.updateValueAndValidity();
    this.dealerFrom.get("dealerContact")!.updateValueAndValidity();
    this.dealerFrom.get("dealerPhone")!.updateValueAndValidity();
    this.dealerFrom.get("dealerEmail")!.updateValueAndValidity();
    this.dealerFrom.get("dealerAddress")!.updateValueAndValidity();
    this.dealerFrom.get("dealerTaxNum")!.updateValueAndValidity();
    this.dealerFrom.get("purchaseOrderSignatory")!.updateValueAndValidity();
    this.dealerFrom
      .get("purchaseOrderSignatoryPosition")!
      .updateValueAndValidity();
  }
  iscontractBuyer() {
    const businessModel = this.baseInfoFrom.getRawValue().businessModel;
    if (businessModel != "DIRECT") {
      this.contractBuyerFrom.get("contractBuyer")!.clearValidators();
      this.contractBuyerFrom.get("contractBuyerSapCode")!.clearValidators();
      this.contractBuyerFrom.get("contractBuyerTaxNum")!.clearValidators();
      this.contractBuyerFrom.get("contractBuyerAddress")!.clearValidators();
      this.contractBuyerFrom.get("contractBuyerPhone")!.clearValidators();
      this.contractBuyerFrom.get("contractBuyerContact")!.clearValidators();
      this.contractBuyerFrom.get("contractBuyerEmail")!.clearValidators();
      this.contractBuyerFrom.get("contractBuyerSignatory")!.clearValidators();
      this.contractBuyerFrom
        .get("contractBuyerSignatoryPosition")!
        .clearValidators();
    } else {
      this.contractBuyerFrom
        .get("contractBuyer")!
        .setValidators(Validators.required);
      this.contractBuyerFrom
        .get("contractBuyerSapCode")!
        .setValidators(Validators.required);
      this.contractBuyerFrom
        .get("contractBuyerTaxNum")!
        .setValidators(Validators.required);
      this.contractBuyerFrom
        .get("contractBuyerAddress")!
        .setValidators(Validators.required);
      this.contractBuyerFrom
        .get("contractBuyerPhone")!
        .setValidators(Validators.required);
      this.contractBuyerFrom
        .get("contractBuyerContact")!
        .setValidators(Validators.required);
      this.contractBuyerFrom
        .get("contractBuyerEmail")!
        .setValidators(Validators.required);
      this.contractBuyerFrom
        .get("contractBuyerSignatory")!
        .setValidators(Validators.required);
      this.contractBuyerFrom
        .get("contractBuyerSignatoryPosition")!
        .setValidators(Validators.required);
    }
    this.contractBuyerFrom.get("contractBuyer")!.updateValueAndValidity();
    this.contractBuyerFrom
      .get("contractBuyerSapCode")!
      .updateValueAndValidity();
    this.contractBuyerFrom.get("contractBuyerTaxNum")!.updateValueAndValidity();
    this.contractBuyerFrom
      .get("contractBuyerAddress")!
      .updateValueAndValidity();
    this.contractBuyerFrom.get("contractBuyerPhone")!.updateValueAndValidity();
    this.contractBuyerFrom
      .get("contractBuyerContact")!
      .updateValueAndValidity();
    this.contractBuyerFrom.get("contractBuyerEmail")!.updateValueAndValidity();
    this.contractBuyerFrom
      .get("contractBuyerSignatory")!
      .updateValueAndValidity();
    this.contractBuyerFrom
      .get("contractBuyerSignatoryPosition")!
      .updateValueAndValidity();
  }

  onClearForeignCompany() {
    this.foreignFrom.reset();
    this.foreignFrom.patchValue({
      foreignTradeCorpSameDealer: false,
      companyNotInIePool: false,
    });
  }
  onshowForeignCompanyDialog() {
    this.selectForign.show({}, true);
  }
  async onForignselect(val) {
    this.foreignFrom.reset();
    this.foreignFrom.patchValue({
      foreignTradeCorpSameDealer: false,
      companyNotInIePool: false,
    });
    let ddpValidUntil, ddpStatus;
    if (val.ddpValidUntil) {
      ddpValidUntil = standardTime(val.ddpValidUntil);
      ddpStatus = isadopt(ddpValidUntil);
    }
    const result = await this.checkCompanyByBestSign(val.corporateName);
    this.foreignerCheckStatus = result;
    this.foreignFrom.patchValue({
      foreignTradeCorpName: val.corporateName,
      foreignTradeCorpAddress: val.corporateAddress,
      foreignTradeCorpDdpValidityDate: val.ddpValidUntil,
      foreignTradeCorpDdpStatus: ddpStatus ? ddpStatus : "不通过",
      foreignBestSignSignerAccount: "",
    });
    this.foreignFrom.get("foreignTradeCorpDdpValidityDate").disable();
  }
  onShowSelectDealerModal() {
    this.selectDealer.show({ invalid: true }, true);
  }
  onShowSelectHospitalModal() {
    if (!this.iscontractBuyer) {
      const orderSalesModality =
        this.baseInfoFrom.getRawValue().dealFormSalesModality;
      this.modalityInfo = [orderSalesModality];
      this.selectHospital.show({}, true);
    } else {
      const orderSalesModality = this.baseInfoFrom.getRawValue().orderModality;
      this.modalityInfo = [orderSalesModality];
      this.selectHospital.show({}, true);
    }
  }
  onHospitalselect(val) {
    //最终用户
    this.endUserFrom.patchValue({
      endUser: val.customerName,
      endUserAddress: val.address,
      endUserActuallyDeliveryAddress: "",
      hospitalType: val.customerType,
      endUserPhone: val.contactPhone,
      endUserContact: val.customerContact,
      endUserId: val.no,
      segment: val.category,
      dealerBestSignSignerAccount: "",
    });
    //最终用户回显
  }
  onClearHospital() {
    this.endUserFrom.reset();
  }
  async onDealSelect(val) {
    //经销商选择回显
    let mdtdealerddpexpiredate, dealerDdpStatus;
    if (val.mdtdealerddpexpiredate) {
      mdtdealerddpexpiredate = standardTime(val.mdtdealerddpexpiredate);
      dealerDdpStatus = isadopt(mdtdealerddpexpiredate);
    }
    const result = await this.checkCompanyByBestSign(val.mdtdealername);
    this.dealerCheckStatus = result;
    this.dealerFrom.patchValue({
      dealerName: val.mdtdealername,
      dealerPhone: val.dealeradmincellphone,
      dealercode: val.dealercode,
      dealerEmail: val.mailingaddress,
      dealerAddress: val.agreementaddress,
      dealerContact: val.companylegalrep,
      dealerDdpValidityDate: val.mdtdealerddpexpiredate,
      dealerSapCode: val.sapcode,
      dealerDdpStatus: dealerDdpStatus,
      dealerTaxNum: val.socialcreditcode,
      dealerBestSignSignerAccount: "",
    });
    this.importDealInform(val.sapcode);

    if (val.dealercode) {
      this.serveic.dealAgreement(val.dealercode).then((deals) => {
        if (!this.isContract) {
          const rows = disreduce(deals.rows, "agreementno");
          const dealerCodeList = rows.map((item) => ({
            ...item,
            label: item.agreementno,
            value: item.agreementno,
          }));
          this.orderInfo.controls.forEach((val, index) => {
            let marketBundleInfo = this.orderInfo
              .at(index)
              .get("marketBundleInfo") as FormArray;
            marketBundleInfo.controls.forEach((vals, i) => {
              let group = marketBundleInfo.at(i) as FormGroup;
              group.patchValue({
                dealerCodeList: dealerCodeList,
              });
            });
          });
        }
      });
    }
  }
  selectCity(param) {
    this.baseInfoFrom.patchValue({
      oldSalesProvince: param,
    });
    areaList.forEach((val) => {
      if (val.value == param) {
        this.cityList = val.children.map((a) => ({
          value: a.value,
        }));
      }
    });
  }
  async selectDealFrom() {
    this.selectDeal.show(
      { id: this.baseInfoFrom.getRawValue().dealFormId },
      true
    );
  }

  //基本信息
  checkbaseInfoFromData = () => {
    for (const i in this.baseInfoFrom.controls) {
      this.baseInfoFrom.controls[i].markAsDirty();
      this.baseInfoFrom.controls[i].updateValueAndValidity();
    }
    return this.baseInfoFrom.valid;
  };
  //经销商
  checkdealerFromFromData = () => {
    for (const i in this.dealerFrom.controls) {
      this.dealerFrom.controls[i].markAsDirty();
      this.dealerFrom.controls[i].updateValueAndValidity();
    }
    return this.dealerFrom.valid;
  };
  //账号管理
  checkaccountFromFromData = () => {
    for (const i in this.accountFrom.controls) {
      this.accountFrom.controls[i].markAsDirty();
      this.accountFrom.controls[i].updateValueAndValidity();
    }
    return this.accountFrom.valid;
  };
  //合同买方
  checkContractBuyerFromFromData = () => {
    for (const i in this.contractBuyerFrom.controls) {
      this.contractBuyerFrom.controls[i].markAsDirty();
      this.contractBuyerFrom.controls[i].updateValueAndValidity();
    }
    return this.contractBuyerFrom.valid;
  };
  //外贸易公司
  checkforeignFromFromData = () => {
    for (const i in this.foreignFrom.controls) {
      this.foreignFrom.controls[i].markAsDirty();
      this.foreignFrom.controls[i].updateValueAndValidity();
    }
    return this.foreignFrom.valid;
  };
  //最终用户
  checkendUserFromFromData = () => {
    for (const i in this.endUserFrom.controls) {
      this.endUserFrom.controls[i].markAsDirty();
      this.endUserFrom.controls[i].updateValueAndValidity();
    }
    return this.endUserFrom.valid;
  };
  //价格审批
  checkpriceApprovalFromData = () => {
    for (const i in this.priceApproval.controls) {
      this.priceApproval.controls[i].markAsDirty();
      this.priceApproval.controls[i].updateValueAndValidity();
    }
    return this.priceApproval.valid;
  };
  approvalArea() {
    //审批区域是列表还是文本框展示
    if (
      (this.status == undefined ||
        this.status == "" ||
        this.status == "ecos_status_draft" ||
        this.status == "ecos_oit_deal_resubmit") &&
      (this.flag == "0" || this.flag == undefined)
    ) {
      return true;
    } else {
      return false;
    }
  }
  initSaleRegions(role) {
    if (
      this.status === null ||
      this.status === undefined ||
      this.status === "" ||
      this.status === "ecos_oit_order_submit" ||
      this.status === "ecos_oit_order_resubmit" ||
      this.status === "ecos_status_draft" ||
      this.status === "ecos_oit_deal_resubmit"
    ) {
      const regions = (
        JSON.parse(window.localStorage.getItem("profiles")) || []
      )
        .filter(({ role: roleName }) => (role && role === roleName) || !role)
        .map((region) => ({
          ...region,
          label: [
            region.team,
            region.modality,
            region.cycleGroup,
            region.bigArea,
            region.smallArea,
          ]
            .filter((str) => str && str.trim())
            .join("-"),
          value: [
            region.team,
            region.modality,
            region.cycleGroup,
            region.bigArea,
            region.smallArea,
          ]
            .filter((str) => str && str.trim())
            .join("-"),
        }));
      this.saleRegions = regions;
      this.saleRegions = disreduce(regions, "label");
      if (this.saleRegions.length == 1) {
        const {
          team,
          modality,
          cycleGroup,
          bigArea,
          smallArea,
          province,
          cluster,
          bmc,
          role,
        } = regions[0];
        this.baseInfoFrom.patchValue({
          approvalAreaConfiguration: regions[0].value,
        });
        this.formValue.patchValue({
          team,
          modality,
          cycleGroup,
          bigArea,
          smallArea,
          province,
          role,
          cluster,
          bmc,
        });
        this.baseInfoFrom.patchValue({
          dealFormSalesModality: modality,
          dealFormSalesTeam: team,
          dealFormSalesBigArea: bigArea,
          dealFormSalesCycleGroup: cycleGroup,
          dealFormSalesSmallArea: smallArea,
          // dealFormSalesProvince: province
        });
        this.selectCity(province);
      }
    }
  }
  biddingType(type) {
    this.serveic.tenderNumDeliveAction(type);
    this.serveic.supportFileChangAction(this.formValue);
    const { biddingType } = this.baseInfoFrom.getRawValue();
    if (type === "其他类型") {
      this.baseInfoFrom.patchValue({
        tenderNum: "其他类型",
      });
    }
    // if (!type) {
    //   this.baseInfoFrom.patchValue({
    //     biddingType: this.bidTypeModeList[0].code,
    //   });
    // }
  }
  endUserRquired() {
    //最终用户是否必填
    const { dealFormSalesModality, oitMode } = this.baseInfoFrom.getRawValue();
    let result = false;
    if (
      (dealFormSalesModality == "PD&IGT" && oitMode == "STOCK") ||
      dealFormSalesModality == "CC"
    ) {
      this.endUserFrom.get("endUserTaxNum").clearValidators();
      this.endUserFrom.get("endUserAddress").clearValidators();
      this.endUserFrom.get("endUserPhone").clearValidators();
      this.endUserFrom.get("endUserEmail").clearValidators();
      this.endUserFrom.get("endUserContact").clearValidators();
      this.endUserFrom.get("endUserActuallyDeliveryAddress").clearValidators();
      result = false;
    } else {
      //this.endUserFrom.get("endUserTaxNum").setValidators(Validators.required);
      this.endUserFrom.get("endUserAddress").setValidators(Validators.required);
      this.endUserFrom.get("endUserPhone").setValidators(Validators.required);
      //this.endUserFrom.get("endUserEmail").setValidators(Validators.required);
      this.endUserFrom.get("endUserContact").setValidators(Validators.required);
      this.endUserFrom
        .get("endUserActuallyDeliveryAddress")
        .setValidators(Validators.required);

      result = true;
    }
    this.endUserFrom.get("endUserTaxNum").updateValueAndValidity();
    this.endUserFrom.get("endUserPhone").updateValueAndValidity();
    this.endUserFrom.get("endUserAddress").updateValueAndValidity();
    this.endUserFrom.get("endUserEmail").updateValueAndValidity();
    this.endUserFrom.get("endUserContact").updateValueAndValidity();
    this.endUserFrom
      .get("endUserActuallyDeliveryAddress")
      .updateValueAndValidity();
    return result;
  }
  selectConfig(systemRegion) {
    if (!systemRegion) {
      return;
    }
    if (this.saleRegions && this.saleRegions.length > 0) {
      const region = this.saleRegions.find(
        (region) => systemRegion === region.value
      );
      const {
        team,
        modality,
        cycleGroup,
        bigArea,
        smallArea,
        province,
        role,
        cluster,
        bmc,
      } = region;
      this.formValue.patchValue({
        team,
        modality,
        cycleGroup,
        bigArea,
        smallArea,
        province,
        role,
        cluster,
        bmc,
      });
      this.baseInfoFrom.patchValue({
        dealFormSalesModality: modality,
        dealFormSalesTeam: team,
        dealFormSalesBigArea: bigArea,
        dealFormSalesSmallArea: smallArea,
        dealFormSalesCycleGroup: cycleGroup,
        // dealFormSalesProvince: province
      });

      if (modality == "PD&IGT") {
        this.baseInfoFrom.get("oitMode").setValidators(Validators.required);
      } else {
        this.baseInfoFrom.get("oitMode")!.clearValidators();
      }
      this.paymentMethods();
      this.baseInfoFrom.get("oitMode").updateValueAndValidity();

      if (!this.isContract) {
        this.formValue.patchValue({
          isload: true,
        });
        //this.selectConfigapprovalAreaConfiguration()
        this.serveic.productAction(this.formValue);
      }
    }
  }
  onClearDealer() {
    this.dealerFrom.reset();
  }
  async onDealFormSelect(val) {
    const {
      applyId,
      team,
      modality,
      cycleGroup,
      bigArea,
      smallArea,
      province,
      cluster,
      bmc,
      role,
    } = this.formValue.getRawValue();
    const { id } = this.baseInfoFrom.getRawValue();
    this.formValue.reset();
    this.formValue.patchValue({
      applyId: applyId,
      team,
      province,
      role,
      cluster,
      bmc,
      cycleGroup,
      bigArea,
      smallArea,
      modality,
    });
    this.baseInfoFrom.patchValue({
      prebookApply: "0",
      centralizedPurchasing: "0",
      id: id,
      approvalAreaConfiguration:
        this.saleRegions && this.saleRegions.length == 1
          ? this.saleRegions[0].value
          : null,
      dealFormSalesModality:
        this.saleRegions && this.saleRegions.length == 1
          ? this.saleRegions[0].modality
          : null,
      dealFormSalesTeam:
        this.saleRegions && this.saleRegions.length == 1
          ? this.saleRegions[0].team
          : null,
      dealFormSalesBigArea:
        this.saleRegions && this.saleRegions.length == 1
          ? this.saleRegions[0].bigArea
          : null,
      dealFormSalesCycleGroup:
        this.saleRegions && this.saleRegions.length == 1
          ? this.saleRegions[0].cycleGroup
          : null,
      dealFormSalesSmallArea:
        this.saleRegions && this.saleRegions.length == 1
          ? this.saleRegions[0].smallArea
          : null,
    });
    const { approvalAreaConfiguration } = this.baseInfoFrom.getRawValue();
    this.priceApproval.patchValue({
      sampleCheck: "0",
    });
    this.serveic.pageLoadAction(true);

    const dealData = await this.serveic.cpDealFormInfo(val.dealFormId);

    if (dealData.code == "0000") {
      const {
        biddingCompany,
        tenderNum,
        businessModel,
        centralizedPurchasing,
        centralizedOrNot,
        currencySystem,
        dealFormId,
        dealFormSalesBigArea,
        dealFormSalesEmail,
        dealFormSalesModality,
        dealFormSalesProvince,
        dealFormSalesSmallArea,
        dealFormSalesTeam,
        dealFormStatus,
        dealerSapCode,
        dealerDMSData,
        cdCustomerData,
        endUserAddress,
        endUserContact,
        endUserPhone,
        endUserSapCode,
        endUserTaxNum,
        foreignTradeCorpContact,
        foreignTradeCorpName,
        hospitalId,
        hospitalName,
        hospitalSegment,
        hospitalType,
        financialSolutionName,
        financialSolutionCny,
        financialSolutionCnyNet,
        financialSolutionUsd,
        financialSolutionOther,
        samplingAudit,
        otherPaymentCnyNet,
        otherPaymentCny,
        otherPaymentUsd,
        payment,
        paymentTerm,
        foreignTradeCorpContactWay,
        estimBiddingPrice,
        vatRate,
        dealPriceCny,
        dealPriceCnyNet,
        dealPriceUsd,
        equipmentPriceNetCny,
        equipmentPriceCny,
        equipmentPriceUsd,
        dealerSelfPurchasePriceNetCny,
        dealerSelfPurchasePriceCny,
        dealerSelfPurchasePriceUsd,
        endUserEmail,
        tradeInCny,
        tradeInCnyNet,
        installationAddress,
        tradeInUsd,
        rebateCny,
        segment,
        rebateCnyNet,
        rebateUsd,
        orderInfo,
        socialcreditcode,
        dealFormSalesName,
        financialSolution,
        lendingBankCompany,
        profitNetRate,
        profitGrossRate,
        profitGross,
        dealerProfit,
        biddingCurrency,
        subTierInfo,
      } = dealData.data;

      this.paymentTerm = paymentTerm;
      let modalityList = orderInfo.map((val) => val.orderModality);
      modalityList = Array.from(new Set(modalityList));
      if (!this.isContract) {
        this.dealIsDisabled = modalityList.includes("PD&IGT") ? true : false;
        this.baseInfoFrom.patchValue({
          dealIsDisabled: this.dealIsDisabled,
        });
      }
      modalityList = modalityList.join("+");
      this.orderEntryMode(businessModel); //获取进单模式
      // let centralized = (centralizedPurchasing != null && centralizedPurchasing != "") ? centralizedPurchasing.toString() : '0';
      let centralized =
        centralizedOrNot != null && centralizedOrNot != ""
          ? centralizedOrNot
            ? "1"
            : "0"
          : "0";
      this.baseInfoFrom.patchValue({
        biddingCompany,
        tenderNum,
        dealFormId,
        //dealFormSalesProvince,
        dealFormSalesPerformanceProvince: dealFormSalesProvince,
        dealFormModality: modalityList,
        foreignTradeCorpPhone: foreignTradeCorpContactWay,
        centralizedPurchasing: centralized,
        //centralizedPurchasing:'0',
        businessModel,
        estimBiddingPrice:
          estimBiddingPrice != null && estimBiddingPrice != ""
            ? estimBiddingPrice
            : 0,
        //estimBiddingPrice:2000.56666,
        dealFormSales: dealFormSalesEmail.toLowerCase(),
        dealFormSalesName,
        profitNetRate,
        profitGrossRate,
        profitGross,
        dealerProfit,
        biddingCurrency,
      });
      if (dealerDMSData) {
        let mdtdealerddpexpiredate, dealerDdpStatus;
        if (dealerDMSData.mdtdealerddpexpiredate) {
          mdtdealerddpexpiredate = standardTime(
            dealerDMSData.mdtdealerddpexpiredate
          );
          dealerDdpStatus = isadopt(mdtdealerddpexpiredate);
        }
        if (dealerDMSData.mdtdealername) {
          const result = await this.checkCompanyByBestSign(
            dealerDMSData.mdtdealername
          );
          this.dealerCheckStatus = result;
        }

        this.dealerFrom.patchValue({
          dealerName: dealerDMSData.mdtdealername,
          dealerDdpStatus: dealerDdpStatus ? dealerDdpStatus : "不通过",
          dealerSapCode: dealerDMSData.sapcode,
          dealerCode: dealerDMSData.dealercode
            ? dealerDMSData.dealercode
            : dealerDMSData.dealeroldcodet,
          dealerTaxNum: dealerDMSData.socialcreditcode,
          dealerDdpValidityDate: dealerDMSData.mdtdealerddpexpiredate,
          dealerContact: dealerDMSData.companylegalrep,
          dealerAddress: dealerDMSData.regaddress,
          dealerPhone: dealerDMSData.dealeradmincellphone,
          dealerEmail: dealerDMSData.mailingaddress,
          dealerBestSignSignerAccount: "",
        });
      }
      if (cdCustomerData) {
        this.endUserFrom.patchValue({
          endUserAddress: cdCustomerData.address
            ? cdCustomerData.address
            : endUserAddress,
          endUserContact: cdCustomerData.customerContact
            ? cdCustomerData.customerContact
            : endUserContact,
          endUserPhone: cdCustomerData.contactPhone
            ? cdCustomerData.contactPhone
            : endUserPhone,
          endUserId: hospitalId,
          endUserTaxNum, //带入cp
          endUserEmail,
          segment,
          endUserSapCode,
          endUserActuallyDeliveryAddress: installationAddress,
          hospitalType: cdCustomerData.customerType
            ? cdCustomerData.customerType
            : hospitalType,
          endUser: cdCustomerData.customerName
            ? cdCustomerData.customerName
            : hospitalName,
          dealerBestSignSignerAccount: "",
        });
      } else {
        this.endUserFrom.patchValue({
          endUserAddress,
          endUserContact,
          endUserPhone,
          endUserId: hospitalId,
          endUserTaxNum, //带入cp
          endUserEmail,
          segment,
          endUserSapCode,
          endUserActuallyDeliveryAddress: installationAddress,
          hospitalType,
          endUser: hospitalName,
          dealerBestSignSignerAccount: "",
        });
      }

      if (currencySystem === "USD" && foreignTradeCorpName) {
        const result1 = await this.checkCompanyByBestSign(foreignTradeCorpName);
        this.foreignerCheckStatus = result1;
      }
      this.foreignFrom.patchValue({
        foreignTradeCorpContact,
        foreignTradeCorpName,
      });
      this.priceApproval.patchValue({
        financialSolutionOther,
        financialSolution:
          financialSolution != null && financialSolution != ""
            ? financialSolution.toString()
            : "0",
        lendingBankCompany: lendingBankCompany,
        financialSolutionName:
          financialSolutionName && financialSolutionName != "null"
            ? financialSolutionName
            : "",
        currencySystem,
        otherPaymentCnyNet:
          otherPaymentCnyNet != null && otherPaymentCnyNet != ""
            ? otherPaymentCnyNet
            : 0,
        otherPaymentCny:
          otherPaymentCny != null && otherPaymentCny != ""
            ? otherPaymentCny
            : 0,
        otherPaymentUsd:
          otherPaymentUsd != null && otherPaymentUsd != ""
            ? otherPaymentUsd
            : 0,
        financialSolutionCny:
          financialSolutionCnyNet != null && financialSolutionCnyNet != ""
            ? financialSolutionCnyNet
            : 0,
        financialSolutionCnyNet:
          financialSolutionCnyNet != null && financialSolutionCnyNet != ""
            ? financialSolutionCnyNet
            : 0,
        financialSolutionUsd:
          financialSolutionUsd != null && financialSolutionUsd != ""
            ? financialSolutionUsd
            : 0,
        dealPriceCny:
          equipmentPriceCny != null && equipmentPriceCny != ""
            ? equipmentPriceCny
            : 0,
        dealPriceCnyNet:
          equipmentPriceNetCny != null && equipmentPriceNetCny != ""
            ? equipmentPriceNetCny
            : 0,
        dealPriceUsd:
          equipmentPriceUsd != null && equipmentPriceUsd != ""
            ? equipmentPriceUsd
            : 0,
        equipmentPriceNetCny:
          equipmentPriceNetCny != null && equipmentPriceNetCny != ""
            ? equipmentPriceNetCny
            : 0,
        equipmentPriceCny:
          equipmentPriceCny != null && equipmentPriceCny != ""
            ? equipmentPriceCny
            : 0,
        //equipmentPriceCny:4000.23,
        equipmentPriceUsd:
          equipmentPriceUsd != null && equipmentPriceUsd != ""
            ? equipmentPriceUsd
            : 0,
        dealerSelfPurchasePriceNetCny:
          dealerSelfPurchasePriceNetCny != null &&
          dealerSelfPurchasePriceNetCny != ""
            ? dealerSelfPurchasePriceNetCny
            : 0,
        dealerSelfPurchasePriceCny:
          dealerSelfPurchasePriceCny != null && dealerSelfPurchasePriceCny != ""
            ? dealerSelfPurchasePriceCny
            : 0,
        //dealerSelfPurchasePriceCny:1000.231,
        dealerSelfPurchasePriceUsd:
          dealerSelfPurchasePriceUsd != null && dealerSelfPurchasePriceUsd != ""
            ? dealerSelfPurchasePriceUsd
            : 0,
        vatRate,
        sampleCheck: samplingAudit ? samplingAudit.toString() : "0",
        //sampleCheck: '0',
        tradeInTotal:
          currencySystem == "USD"
            ? tradeInUsd != null && tradeInUsd != ""
              ? tradeInUsd
              : 0
            : tradeInCnyNet != null && tradeInCnyNet != ""
            ? tradeInCnyNet
            : 0,
        rebateTotal:
          currencySystem == "USD"
            ? rebateUsd != null && rebateUsd != ""
              ? rebateUsd
              : 0
            : rebateCnyNet != null
            ? rebateCnyNet
            : 0,
      });

      if (businessModel == "DIRECT") {
        this.contractBuyerFrom.patchValue({
          contractBuyer: hospitalName,
          contractBuyerAddress: endUserAddress,
          contractBuyerPhone: endUserPhone,
          contractBuyerContact: endUserContact,
          contractBuyerSapCode: endUserSapCode,
          contractBuyerTaxNum: endUserTaxNum,
          contractBuyerEmail: endUserEmail,
        });
      } else {
        setTimeout(() => {
          this.subTierSubject.next({ type: "add", data: subTierInfo });
        }, 0);
        this.checkBiddingEqualDealer();
      }
      const { oitMode } = this.baseInfoFrom.getRawValue();
      const StockOff =
        (oitMode == "BIDDING" && hospitalName == "Stock") ||
        oitMode == "STOCK" ||
        (centralized == "1" ? false : true);
      this.formValue.patchValue({
        StockOff: StockOff,
      });
      this.addProduct.emit(orderInfo);
      if (
        dealerDMSData &&
        this.orderInfo &&
        this.orderInfo.controls &&
        this.orderInfo.controls.length > 0
      ) {
        this.orderInfo.controls.forEach((val, index) => {
          const orderBaseinfo = this.orderInfo
            .at(index)
            .get("orderBaseinfo") as FormGroup;
          orderBaseinfo.patchValue({
            dealerSapCode: dealerDMSData.sapcode,
          });
        });
      }
      if (dealerDMSData) {
        this.importDealInform(dealerDMSData.sapcode);
      }
      this.changeDetectorRef.detectChanges();
      this.paymentMethods();
      this.atIniepoole();
      this.serveic.productAction(this.formValue);
    } else {
      this.message.error(dealData.msg);
      this.serveic.pageLoadAction(false);
    }
  }

  async checkCompanyByBestSign(name: any) {
    const params = {
      corpName: name,
    };
    let result: any = "";
    let status: any = "";
    let statusString: any = "";
    const res = await this.serveic.checkDealer(params);
    const { code, data } = res;
    if (code === "0000") {
      const { authStatus, satisfactoryAuth } = data;
      // const { authStatus, satisfactoryAuth } = data;
      // satisfactoryAuth 是否满足开发者配置的实名要求
      if (!satisfactoryAuth) {
        status = "不通过";
        // statusString = "未满足开发者配置的实名要求";
        statusString = "当前公司未完成上上签的实名认证";
      }
      // authStatus
      // 0:未认证 （包含未去实名、实名被全部驳回的认证不通过）
      // 1:认证中 （包含审核中、意愿性认证中）
      // 2:已认证 ； -1:未获取实名授权
      // if (authStatus !== 2) {
      //   status = "不通过";
      //   statusString = "当前公司未完成上上签的实名认证";
      // }

      // result = {
      //   status,
      //   statusString,
      // };
      result = statusString;
    }
    return result;
  }
  biddingCompanyChange() {
    const biddingCompany = this.baseInfoFrom.get("biddingCompany").value;
    if (biddingCompany && biddingCompany != "") {
      this.checkBiddingEqualDealer();
    }
  }
  //判断投标公司是否和经销商相同
  checkBiddingEqualDealer() {
    const biddingCompany = this.baseInfoFrom.get("biddingCompany").value;
    const { dealerName, subTierInfo } = this.dealerFrom.getRawValue();
    if (
      biddingCompany &&
      biddingCompany != "" &&
      dealerName &&
      subTierInfo &&
      subTierInfo.length > 0
    ) {
      var dealerCompanyList = [dealerName];
      subTierInfo.filter((item) => {
        if (item.dealerSubTiers && item.dealerSubTiers.length > 0) {
          dealerCompanyList = [
            ...dealerCompanyList,
            ...item.dealerSubTiers.map((val) => val.name),
          ];
        }
      });
      dealerCompanyList = Array.from(new Set(dealerCompanyList));
      if (dealerCompanyList.includes(biddingCompany)) {
        this.isEqual = 1;
      } else {
        this.isEqual = 0;
      }
    }
  }
  importDealInform(param) {
    //导入经销商code
    if (
      this.orderInfo &&
      this.orderInfo.controls &&
      this.orderInfo.controls.length > 0
    ) {
      this.orderInfo.controls.forEach((val, index) => {
        const orderBaseinfo = this.orderInfo
          .at(index)
          .get("orderBaseinfo") as FormGroup;
        orderBaseinfo.patchValue({
          dealerSapCode: param,
        });
      });
    }
  }
  orderEntryMode(param) {
    //进单模式
    if (param == "DIRECT") {
      if (this.orderModeList && this.orderModeList.length > 0) {
        this.orderModeList.map((val, index) => {
          val.code == "STOCK" && this.orderModeList.splice(index, 1);
        });
      }
    } else {
      if (this.orderModeLists && this.orderModeLists.length > 0) {
        this.orderModeList = JSON.parse(JSON.stringify(this.orderModeLists));
      }
    }
  }
  centralizedChange(event) {
    //是否集采项目
    // this.addProduct.emit(orderInfo)
    this.formValue.patchValue({
      isload: true,
    });
    this.serveic.productAction(this.formValue);
  }
  selectPerformanceProvince(event) {
    //选择业绩
    this.formValue.patchValue({
      isload: true,
    });
    //this.serveic.productAction(this.formValue);
    const { centralizedPurchasing } = this.baseInfoFrom.getRawValue();
    if (!this.isContract && centralizedPurchasing == "0") {
      this.selectConfigCity(
        "dealFormSalesPerformanceProvince",
        "orderSalesPerformanceProvince"
      );
    }
  }
  selectSaleCity(event) {
    //选择城市
    if (!event) {
      return;
    }
    this.formValue.patchValue({
      isload: true,
    });
    const { centralizedPurchasing } = this.baseInfoFrom.getRawValue();
    if (!this.isContract && centralizedPurchasing == "0") {
      //this.serveic.productAction(this.formValue);
      this.selectConfigCity("dealFormSalesCity", "orderSalesCity");
    }
  }
  // 处理首页导入的操作
  public handleImport() {
    this.activatedRouter.queryParams.subscribe((queryParams) => {
      let dealFormId = queryParams["_DEALFORMID"];
      if (dealFormId) {
        this.handleImportByDealFormId(dealFormId);
      }
    });
  }
  handleImportByDealFormId(dealFormId) {
    dealFormId = dealFormId.toString().trim();
    this.onDealFormSelect({ dealFormId });
  }
  paymentMethods() {
    //支持方式
    const { dealFormSalesModality, businessModel, oitMode, orderModality } =
      this.baseInfoFrom.getRawValue();
    const { hospitalType } = this.endUserFrom.getRawValue();
    const { currencySystem } = this.priceApproval.getRawValue();
    const params = {
      modality: "",
      businessModel: businessModel,
      oitMode,
      hospitalType: hospitalType != "集团" ? hospitalType : "",
      currency: currencySystem,
    };
    if (
      this.status == "ecos_oit_order_submit" ||
      this.status == "ecos_oit_order_resubmit" ||
      this.status == "ecos_oit_deal_resubmit" ||
      this.status == undefined ||
      this.status == "ecos_oit_deal_submit" ||
      this.status == "ecos_status_draft" ||
      this.status == ""
    ) {
      if (!this.isContract) {
        if (
          this.orderInfo &&
          this.orderInfo.controls &&
          this.orderInfo.controls.length > 0
        ) {
          this.orderInfo.controls.map((vals, index) => {
            const mainTrems = this.orderInfo
              .at(index)
              .get("mainTrems") as FormGroup;
            const orderBaseinfo = this.orderInfo
              .at(index)
              .get("orderBaseinfo") as FormGroup;
            const endUserinfo = this.orderInfo
              .at(index)
              .get("endUserinfo") as FormGroup;
            const { orderModality, currencySystem } =
              orderBaseinfo.getRawValue();
            params.modality = orderModality;
            params.currency = currencySystem;
            const { orderSameEndUser } = endUserinfo.getRawValue();
            const orderHospitalType = endUserinfo.getRawValue().hospitalType;
            if (orderSameEndUser == "0" && orderHospitalType) {
              params.hospitalType =
                orderHospitalType != "集团" ? orderHospitalType : "";
            }
            this.serveic.paymentMethod(params).then((paymentData) => {
              if (paymentData.code == "0000") {
                let { data } = paymentData;
                if (data && data.length > 0) {
                  const { paymentProvision } = mainTrems.getRawValue();
                  //const payMentList = data.map((item) => ({ ...item, label: item.payment, value: item.payment }))
                  const payMentList = data;
                  mainTrems.patchValue({
                    paymentProvisionList: payMentList,
                  });
                  if (!paymentProvision) {
                    let paymentTermValue = "";
                    if (
                      this.paymentTerm != "" &&
                      this.paymentTerm != undefined &&
                      this.paymentTerm != null
                    ) {
                      paymentTermValue = payMentList.find((val) => {
                        if (
                          val.payment.replace(/\s*/g, "") ==
                          this.paymentTerm.replace(/\s*/g, "")
                        ) {
                          return val;
                        }
                      });
                    } else {
                      paymentTermValue = null;
                    }
                    if (paymentTermValue) {
                      mainTrems.patchValue({
                        paymentProvision: this.paymentTerm,
                      });
                    } else {
                      mainTrems.patchValue({
                        paymentProvision: null,
                      });
                    }
                  } else {
                    const paymentProvisionobj = payMentList.find((val) => {
                      if (
                        val.payment.replace(/\s*/g, "") ==
                        paymentProvision.replace(/\s*/g, "")
                      ) {
                        return val;
                      }
                    });
                    if (!paymentProvisionobj) {
                      mainTrems.patchValue({
                        paymentProvision: null,
                      });
                    } else {
                      mainTrems.patchValue({
                        paymentProvision: paymentProvisionobj.payment,
                      });
                    }
                  }
                }
              }
            });
          });
        }
      } else {
        params.modality = orderModality;
        this.serveic.paymentMethod(params).then((paymentData) => {
          if (paymentData.code == "0000") {
            let { data } = paymentData;
            if (data && data.length > 0) {
              this.serveic.paymentList = data;
            }
          }
        });
      }
    }
  }
  async foreignSample(event) {
    //外贸公司与经销商相同
    if (event === null || event === undefined || event === "") {
      return;
    }
    if (event === true) {
      const {
        dealerName,
        dealerSapCode,
        dealerDdpValidityDate,
        dealerContact,
        dealerPhone,
        dealerEmail,
        dealerAddress,
        dealerDdpStatus,
        dealerTaxNum,
        purchaseOrderSignatory,
        purchaseOrderSignatoryPosition,
        dealerBestSignSignerAccount,
      } = this.dealerFrom.getRawValue();
      const result = await this.checkCompanyByBestSign(dealerName);
      this.foreignerCheckStatus = result;
      this.foreignFrom.patchValue({
        foreignTradeCorpName: dealerName,
        foreignTradeCorpSapCode: dealerSapCode,
        foreignTradeCorpDdpValidityDate: dealerDdpValidityDate,
        foreignTradeCorpTaxNum: dealerTaxNum,
        foreignTradeCorpAddress: dealerAddress,
        foreignTradeCorpPhone: dealerPhone,
        foreignTradeCorpContact: dealerContact,
        foreignTradeCorpEmail: dealerEmail,
        importAgreementSignName: purchaseOrderSignatory,
        importAgreementSignPosition: purchaseOrderSignatoryPosition,
        foreignTradeCorpDdpStatus: dealerDdpStatus,
        foreignBestSignSignerAccount: dealerBestSignSignerAccount,
      });
      this.foreignFrom.get("foreignTradeCorpSapCode").disable();
      this.foreignFrom.get("foreignTradeCorpDdpValidityDate").disable();
      this.foreignFrom.get("foreignTradeCorpTaxNum").disable();
      this.foreignFrom.get("foreignBestSignSignerAccount").disable();
      const { foreignTradeCorpName } = this.foreignFrom.getRawValue();
      const select = this.serveic.iepoolLists.find(
        (val) => val.corporateName == foreignTradeCorpName
      );
      this.foreignFrom.patchValue({
        companyNotInIePool: select ? false : true,
      });
    } else {
      this.foreignFrom.get("foreignTradeCorpSapCode").enable();
      this.foreignFrom.get("foreignTradeCorpDdpValidityDate").enable();
      this.foreignFrom.get("foreignTradeCorpTaxNum").enable();
      this.foreignFrom.get("foreignBestSignSignerAccount").enable();
    }
  }
  changOitmode() {
    this.paymentMethods();
    const { oitMode, centralizedPurchasing } = this.baseInfoFrom.getRawValue();
    const { endUser } = this.endUserFrom.getRawValue();
    const StockOff =
      (oitMode == "BIDDING" && endUser == "Stock") ||
      oitMode == "STOCK" ||
      centralizedPurchasing == "1"
        ? false
        : true;
    this.formValue.patchValue({
      StockOff: StockOff,
    });
  }
  foreignKeyup(val) {
    //外贸公司输入值
    const { foreignTradeCorpName } = this.foreignFrom.getRawValue();
    if (this.serveic.iepoolLists && this.serveic.iepoolLists.length > 0) {
      const select = this.serveic.iepoolLists.find(
        (vals) => vals.corporateName == foreignTradeCorpName
      );
      if (select) {
        this.onForignselect(select);
        this.foreignFrom.patchValue({
          companyNotInIePool: false,
        });
      } else {
        this.foreignFrom.patchValue({
          companyNotInIePool: true,
        });
      }
      if (!select && this.flag != 1) {
        this.foreignFrom.get("foreignTradeCorpDdpValidityDate").enable();
        this.foreignFrom.get("foreignTradeCorpSapCode").enable();
      } else {
        this.foreignFrom.get("foreignTradeCorpDdpValidityDate").disable();
        this.foreignFrom.get("foreignTradeCorpSapCode").disable();
      }
    }
  }
  changForeignDate(val) {
    //日期选择
    if (
      this.status === null ||
      this.status === undefined ||
      this.status === "" ||
      this.status === "ecos_oit_deal_resubmit" ||
      this.status === "ecos_oit_deal_submit" ||
      this.status === "ecos_status_draft" ||
      this.status === "ecos_oit_order_submit" ||
      this.status === "ecos_oit_order_resubmit"
    ) {
      if (val === undefined || val === "") {
        return;
      }

      let date, ddpStatus;
      if (val) {
        date = standardTime(val);
        ddpStatus = isadopt(date);
      }
      this.foreignFrom.patchValue({
        foreignTradeCorpDdpStatus: ddpStatus ? ddpStatus : "不通过",
      });
      const { foreignTradeCorpName } = this.foreignFrom.getRawValue();
      if (this.serveic.iepoolLists && this.serveic.iepoolLists.length > 0) {
        const select = this.serveic.iepoolLists.find(
          (val) => val.corporateName == foreignTradeCorpName
        );
        !select && this.flag != 1
          ? this.foreignFrom.get("foreignTradeCorpDdpValidityDate").enable()
          : this.foreignFrom.get("foreignTradeCorpDdpValidityDate").disable();
      }
    }
  }
  atIniepoole() {
    //是否在iepoole里边
    const { foreignTradeCorpName } = this.foreignFrom.getRawValue();
    if (this.serveic.iepoolLists && this.serveic.iepoolLists.length > 0) {
      const select = this.serveic.iepoolLists.find(
        (val) => val.corporateName == foreignTradeCorpName
      );
      !select && this.flag != 1
        ? this.foreignFrom.get("foreignTradeCorpDdpValidityDate").enable()
        : this.foreignFrom.get("foreignTradeCorpDdpValidityDate").disable();
      this.foreignFrom.patchValue({
        companyNotInIePool: select ? false : true,
      });
      if (select) {
        this.onForignselect(select);
      }
    }
  }
  foreignDDpstatus(control: FormControl) {
    if (control.value) {
      const valid = control.value != "通过" ? false : true;
      return valid ? null : { foreignform: true };
    }
  }
  isRequiredModality() {
    const { dealFormSalesModality, oitMode } = this.baseInfoFrom.getRawValue();
    if (dealFormSalesModality == "PD&IGT" && oitMode == "BIDDING") {
      this.baseInfoFrom.get("tenderNum").setValidators(Validators.required);
      this.baseInfoFrom.get("biddingType").setValidators(Validators.required);
      this.baseInfoFrom
        .get("biddingCompany")
        .setValidators(Validators.required);
      this.baseInfoFrom.get("tenderNum").updateValueAndValidity();
      this.baseInfoFrom.get("biddingType").updateValueAndValidity();
      this.baseInfoFrom.get("biddingCompany").updateValueAndValidity();
      return true;
    } else {
      this.baseInfoFrom.get("tenderNum").clearValidators();
      this.baseInfoFrom.get("biddingType").clearValidators();
      this.baseInfoFrom.get("biddingCompany").clearValidators();
      this.baseInfoFrom.get("tenderNum").updateValueAndValidity();
      this.baseInfoFrom.get("biddingType").updateValueAndValidity();
      this.baseInfoFrom.get("biddingCompany").updateValueAndValidity();
      return false;
    }
  }
  foreignformShow() {
    if (this.priceApproval.getRawValue().currencySystem == "USD") {
      return true;
    } else {
      return false;
    }
  }
  isRequiredArrivalDate() {
    //客户要货函货日期和预计安装日期是显示
    if (this.isContract) {
      const { dealFormSalesModality, orderModality, oitMode } =
        this.baseInfoFrom.getRawValue();
      if (orderModality == "US" || orderModality == "CC") {
        return true;
      } else {
        return false;
      }
    }
  }
  isEstimateInstallationDate() {
    //客户要货函货日期和预计安装日期是否必填
    if (this.isContract) {
      const { dealFormSalesModality, orderModality, oitMode } =
        this.baseInfoFrom.getRawValue();
      if (orderModality == "US") {
        this.baseInfoFrom
          .get("requiredArrivalDate")
          .setValidators(Validators.required);
        this.baseInfoFrom
          .get("estimateInstallationDate")
          .setValidators(Validators.required);
        this.baseInfoFrom
          .get("estimateInstallationDate")
          .updateValueAndValidity();
        this.baseInfoFrom.get("requiredArrivalDate").updateValueAndValidity();
      } else {
        this.baseInfoFrom.get("estimateInstallationDate").clearValidators();
        this.baseInfoFrom
          .get("estimateInstallationDate")
          .updateValueAndValidity();
        this.baseInfoFrom.get("requiredArrivalDate").clearValidators();
        this.baseInfoFrom.get("requiredArrivalDate").updateValueAndValidity();
      }
    }
  }
  onShowSelectPrebookModal() {
    const { orderModality } =  this.baseInfoFrom.getRawValue();
    //弹出prebook弹窗口
    const marketBundleInfoArr = this.marketBundleInfo.getRawValue();
    const marketBundleHost = marketBundleInfoArr.filter(
      (val) =>
        val.primaryOpportunity == "true" || val.primaryOpportunity == true
    );
    if("US" === orderModality){
      this.selectPreBook.showByList(
        {
          pageNo: 1,
          pageSize: 10,
          marketBundleList: marketBundleInfoArr,
        },
        true
      );
    }else{
      const opportunityId = marketBundleHost[0].opportunityId;
      const marketBundleName = marketBundleHost[0].marketBundleName;
      const marketBundleAmount = marketBundleHost[0].marketBundleAmount;
      this.selectPreBook.show(
        {
          opportunityId: opportunityId,
          marketBundleName: marketBundleName,
          marketBundleAmount: marketBundleAmount,
        },
        true
      );
    }
  }
  onPrebookselect(val) {
    this.baseInfoFrom.patchValue({
      prebookReferenceId: val.referenceId,
      prebookApplyId: val.applyId,
      prebookOrderId: val.orderId,
      prebookStatus: val.processStatus,
      prebookSo: val.so,
    });
  }
  onClearPrebook() {
    //清除prebook
    this.baseInfoFrom.patchValue({
      prebookApplyId: "",
      prebookReferenceId: "",
      prebookOrderId: "",
      prebookStatus: "",
      prebookSo: "",
      prebookQuantity: "",
    });
  }
  preBookTitleHave() {
    if (
      (this.status == "ecos_oit_order_upload" || this.needFileType == "om") &&
      this.baseInfoFrom.getRawValue().prebookQuantity > 1
    ) {
      return true;
    } else {
      return false;
    }
  }
  preBookTitleNothing() {
    if (
      (this.status == "ecos_oit_order_upload" || this.needFileType == "om") &&
      this.baseInfoFrom.getRawValue().prebookQuantity == 0 &&
      !this.baseInfoFrom.getRawValue().prebookReferenceId
    ) {
      return true;
    } else {
      return false;
    }
  }
  toWinbidding(item) {
    const url = `${location.origin}${environment.base_href}/#/bidding-v3/${item.id}?procInstId=${item.procInstId}&processStatus=${item.processStatus}&taskStatus=${item.processStatus}`;
    window.open(url);
  }
  onClearsoluOrder() {
    this.baseInfoFrom.patchValue({
      solutionSalesEmail: "",
      solutionSalesName: "",
      solutionSalesNameModel: "",
    });
  }
  onSelectSoluuser(val) {
    this.baseInfoFrom.patchValue({
      solutionSalesEmail: val.email,
      solutionSalesName: val.name,
      solutionSalesNameModel: `${val.name}(${val.email})`,
    });
  }

  onClearActualOrder() {
    this.baseInfoFrom.patchValue({
      actualSalesEmail: "",
      actualSalesName: "",
      actualSalesNameModel: "",
    });
    this.baseInfoFrom.get("actualSalesEmail").markAsDirty();
  }
  onShowSoluActualModal(i) {
    const { orderModality } = this.baseInfoFrom.getRawValue();
    this.selectSoluUser.show(
      { modality: orderModality, role: "Sales Rep/Mgr" },
      true
    );
  }

  onSelectActualuser(val) {
    this.baseInfoFrom.patchValue({
      actualSalesEmail: val.email,
      actualSalesName: val.name,
      actualSalesNameModel: `${val.name}(${val.email})`,
    });
  }

  onShowSelectActualModal(i) {
    const { orderModality } = this.baseInfoFrom.getRawValue();
    this.selectActualUser.show(
      { modality: orderModality, role: "Sales Rep/Mgr" },
      true
    );
  }

  onShowSelectRefModal(i) {
    //原合同概要表id
    const { orderSales } = this.baseInfoFrom.getRawValue();
    this.selectRefno.show({ applicant: orderSales }, true);
  }
  onRefnoselect(val) {
    this.baseInfoFrom.patchValue({
      contractCancelReferenceId: val.referenceId,
      contractCancelApplyId: val.id,
      contractCancelSoNo: val.so,
    });
  }
  isshowActualSalesName() {
    if (this.isContract) {
      const { orderModality, centralizedPurchasing } =
        this.baseInfoFrom.getRawValue();
      if (centralizedPurchasing == "1") {
        this.baseInfoFrom
          .get("actualSalesEmail")
          .setValidators(Validators.required);
        this.baseInfoFrom.get("actualSalesEmail").updateValueAndValidity();
        return true;
      } else {
        this.baseInfoFrom.get("actualSalesEmail").clearValidators();
        this.baseInfoFrom.get("actualSalesEmail").updateValueAndValidity();
        return false;
      }
    }
  }
  isSolutionSale() {
    if (this.isContract) {
      const { orderModality } = this.baseInfoFrom.getRawValue();
      const marketBundleInfos = this.marketBundleInfo.getRawValue();
      const host = marketBundleInfos.find(
        (val) => val.primaryOpportunity == "true"
      );
      if (
        orderModality == "PD&IGT" &&
        host &&
        host.businessOpportunityHierarchyLink
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  segmentNzRequired() {
    //segment是否必填
    const { hospitalType } = this.endUserFrom.getRawValue();
    if (hospitalType == "公立医院" || hospitalType == "民营医院") {
      this.endUserFrom.get("segment").setValidators(Validators.required);
      this.endUserFrom.get("segment").markAsDirty();
      this.endUserFrom.get("segment").updateValueAndValidity();
      return true;
    } else {
      this.endUserFrom.get("segment").clearValidators();
      this.endUserFrom.get("segment").updateValueAndValidity();
      return false;
    }
  }
}
