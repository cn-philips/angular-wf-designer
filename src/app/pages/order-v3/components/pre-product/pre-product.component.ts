import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ChangeDetectorRef,
} from "@angular/core";
import {
  FormGroup,
  Validator,
  FormBuilder,
  FormArray,
  Validators,
  FormControl,
  ValidationErrors,
} from "@angular/forms";
import { OrderV3Service } from "../../order-v3.service";
import { Router, ActivatedRoute } from "@angular/router";
import {
  stringIndexof,
  haveRolesArr,
  isadopt,
  standardTime,
  floatMultiply,
  fomatFloat,
  disreduce,
  removeRepeat,
  floatSub,
  returnFloat,
  floatDivide,
  floatAdd,
} from "@core/util/tools";
import { NzMessageService } from "ng-zorro-antd";
import { areaList } from "@core/util/areajson";
import { environment } from "@env";
import { HttpService } from "@core/services";
@Component({
  selector: "pre-product",
  templateUrl: "./pre-product.component.html",
  styleUrls: ["./pre-product.component.scss"],
})
export class PreProductComponent implements OnInit {
  constructor(
    private service: OrderV3Service,
    private fb: FormBuilder,
    private message: NzMessageService,
    private activatedRouter: ActivatedRoute,
    private router: Router,
    public changeDetectorRef: ChangeDetectorRef,
    private http: HttpService
  ) {
    this.service.productReceive.subscribe((vals) => {
      this.status = this.activatedRouter.queryParams["value"].taskStatus;
      if (
        this.orderInfo &&
        this.orderInfo.controls &&
        this.orderInfo.controls.length > 0
      ) {
        this.orderInfo.controls.forEach((val, index) => {
          const orderBaseinfo = this.orderInfo
            .at(index)
            .get("orderBaseinfo") as FormGroup;
          const mainTrems = this.orderInfo
            .at(index)
            .get("mainTrems") as FormGroup;
          const otherTerms = this.orderInfo
            .at(index)
            .get("otherTerms") as FormGroup;
          const speciallyTerms = this.orderInfo
            .at(index)
            .get("speciallyTerms") as FormGroup;
          const orderSalesinfo = this.orderInfo
            .at(index)
            .get("orderSalesinfo") as FormGroup;
          const productModelInfo = this.orderInfo
            .at(index)
            .get("productModelInfo") as FormGroup;
          const accountFrom = this.orderInfo
            .at(index)
            .get("accountFrom") as FormGroup;
          const foreignInfo = this.orderInfo
            .at(index)
            .get("foreignInfo") as FormGroup;
          const endUserinfo = this.orderInfo
            .at(index)
            .get("endUserinfo") as FormGroup;
          mainTrems.disable();
          otherTerms.disable();
          speciallyTerms.disable();
          orderBaseinfo.disable();


          const {
            orderSalesModality,
            orderOa,
            orderOaAgent,
            actualSalesEmail,
            actualSalesName,
            orderSalesProvince,
          } = orderSalesinfo.getRawValue();
          const {
            biddingType,
            approvalAreaConfiguration,
            centralizedPurchasing,
            dealFormSalesCity,
            dealFormSalesPerformanceProvince,
            dealFormSalesModality,
            dealFormSalesBigArea,
            dealFormSalesSmallArea,
            dealFormSalesProvince,
            businessModel,
            dealFormSalesTeam,
          } = this.baseInfoFrom.getRawValue(); //招标类型
          const hospitalType = this.endUserFrom.getRawValue().hospitalType; //医院性质
          const orderModality = orderBaseinfo.getRawValue().orderModality;
          const ordercentralizedPurchasing =
            orderBaseinfo.getRawValue().centralizedPurchasing;
          const supportFileMissing =
            speciallyTerms.getRawValue().supportFileMissing;
          const { isload, modality, cycleGroup, bigArea, smallArea } =
            this.formValue.getRawValue();

          const cpDealOrderId = orderBaseinfo.getRawValue().cpDealOrderId;
          orderBaseinfo.patchValue({
            centralizedPurchasing: centralizedPurchasing,
          });


          if (
            orderSalesProvince != null &&
            orderSalesProvince != undefined &&
            orderSalesProvince != ""
          ) {
            this.selectCity(orderSalesProvince, index, false);
          }
          if (
            (this.status == undefined ||
              this.status == "" ||
              this.status == "ecos_oit_deal_submit" ||
              this.status == "ecos_oit_deal_resubmit" ||
              this.status == "ecos_status_draft") &&
            (this.flag == "0" || this.flag == undefined)
          ) {
            if (
              centralizedPurchasing == "0" &&
              orderModality == dealFormSalesModality &&
              isload
            ) {
              orderSalesinfo.patchValue({
                orderSales: this.user,
                orderSalesName: this.userName,
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
                orderSalesModel: `${this.userName}(${this.user})`,
              });
            } else if (
              centralizedPurchasing == "0" &&
              orderModality == dealFormSalesModality
            ) {
              orderSalesinfo.patchValue({
                orderDisbled: true,
              });
            } else if (
              (centralizedPurchasing == "1" ||
                (centralizedPurchasing == "0" &&
                  orderModality != dealFormSalesModality)) &&
              isload &&
              cpDealOrderId
            ) {
              // 防止id清除
              let orderId = orderSalesinfo.getRawValue().id
              orderSalesinfo.reset();
              // 重新赋值id
              if(orderId){
                orderSalesinfo.patchValue({
                  id: orderId,
                })
              }

              orderSalesinfo.patchValue({
                orderDisbled: false,
                isDisabled: true,
                isDisabledMain: true,
                orderSalesModel: "",
              });
              // 集采项目时，获取order owner
              this.service.getOrderOwner(cpDealOrderId).then((res) => {
                if ((res.code = "0000")) {
                  if (res.data) {
                    var sales = res.data.email.toString();
                    var user = this.user.toString();
                    const isSame =
                      sales.length == user.length &&
                      sales.toLowerCase() == user.toLowerCase();
                    orderSalesinfo.patchValue({
                      orderSales: res.data.email,
                      orderSalesName: res.data.name,
                      orderSalesModel: `${res.data.name}(${res.data.email})`,
                      isDisabled: isSame ? false : true,
                      isDisabledMain: isSame ? false : true,
                    });
                    // 如果相同的用户，则需要将approvalAreaConfiguration赋值，并且必填
                    if(isSame){
                      orderSalesinfo.get('orderApprovalAreaConfiguration').enable();
                      orderSalesinfo.patchValue({
                        orderApprovalAreaConfiguration: approvalAreaConfiguration,
                        orderSalesModality: dealFormSalesModality,
                        orderSalesBigArea: dealFormSalesBigArea,
                        orderSalesSmallArea: dealFormSalesSmallArea,
                        orderSalesCycleGroup: cycleGroup,
                        orderSalesTeam: dealFormSalesTeam,
                        orderSalesProvince: dealFormSalesProvince,
                        orderSalesPerformanceProvince: dealFormSalesPerformanceProvince,
                        orderSalesCity: dealFormSalesCity,
                      })
                    }
                  }
                } else {
                  this.message.error(res.msg);
                }
              });
            } else {
              orderSalesinfo.patchValue({
                orderDisbled: false,
              });
            }
          }


          this.actualSalesSetValidators(index); //集采实际销售
          this.isSupportbidding(index);
          /*
           * 三种Modality类型是否支持文件缺失进单
           */
          const { sampleCheck } = this.priceApproval.getRawValue();


          if (
            (orderModality == "US" || orderModality == "CC") &&
            supportFileMissing == "0"
          ) {
            if (sampleCheck == "1") {
              speciallyTerms
                .get("endUserContract")
                .setValidators(Validators.required);
            } else {
              speciallyTerms.get("endUserContract").clearValidators();
            }

            if (businessModel == "DIRECT" && sampleCheck == "1") {
              speciallyTerms
                .get("biddingFile")
                .setValidators(Validators.required);
              speciallyTerms
                .get("tenderFile")
                .setValidators(Validators.required);
            } else {
              speciallyTerms.get("biddingFile").clearValidators();
              speciallyTerms.get("tenderFile").clearValidators();
            }
            if (hospitalType == "公立医院" && sampleCheck == "1") {
              speciallyTerms
                .get("bidWinningFile")
                .setValidators(Validators.required);
            } else {
              speciallyTerms.get("bidWinningFile").clearValidators();
            }
            speciallyTerms.get("biddingFile")!.updateValueAndValidity();
            speciallyTerms.get("tenderFile")!.updateValueAndValidity();
            speciallyTerms.get("endUserContract").updateValueAndValidity();
            speciallyTerms.get("bidWinningFile").updateValueAndValidity();
          } else if (orderModality == "PD&IGT" && supportFileMissing == "0") {
            if (businessModel == "DISTRIBUTOR" && sampleCheck == "1") {
              speciallyTerms
                .get("projectAnalysisTable")
                .setValidators(Validators.required);
            } else {
              speciallyTerms.get("projectAnalysisTable").clearValidators();
            }
            if (
              (biddingType == "国内公开标" || biddingType == "国际公开标") &&
              sampleCheck == "1"
            ) {
              //speciallyTerms.get("biddingFile").setValidators(Validators.required);
              speciallyTerms
                .get("tenderFile")
                .setValidators(Validators.required);

              if (businessModel == "DISTRIBUTOR") {
                speciallyTerms
                  .get("endUserContract")
                  .setValidators(Validators.required);
              } else {
                speciallyTerms.get("endUserContract").clearValidators();
              }
            } else {
              speciallyTerms.get("biddingFile").clearValidators();
              speciallyTerms.get("tenderFile").clearValidators();

              speciallyTerms.get("endUserContract").clearValidators();
            }
          }


          let { orderSales, orderSalesName } = orderSalesinfo.getRawValue();
          if (
            orderSales != "" &&
            orderSales != null &&
            orderSales != undefined
          ) {
            this.isDisable(orderSales, index);
            // const filter = /[\u4E00-\u9FA5\uF900-\uFA2D]{1,}/;
            // const noworderSales = filter.test(orderSales) ? stringIndexof(orderSales) : orderSales
            // orderSalesinfo.patchValue({
            //   orderSales: `${orderSalesName}(${noworderSales})`
            // })
          }
          if (this.status == "ecos_oit_deal_oa" && this.flag == "0") {
            //如果是oa节点，判断某些按钮是否可用
            if (orderOa == this.user || orderOaAgent == this.user) {
              setTimeout(() => {
                orderSalesinfo.patchValue({
                  prebookDisabled: false,
                });
                orderBaseinfo.patchValue({
                  switchValid: false,
                  contractCancelDisabled: false,
                });
                this.switchValids = Array.from({
                  length: this.orderInfo.length,
                }).map((i) => false);
              }, 200);

              //代理人可编辑产品信息
              let marketBundleInfo = this.orderInfo
                .at(index)
                .get("marketBundleInfo") as FormArray;
              marketBundleInfo.controls.forEach((itl, i) => {
                marketBundleInfo.at(i).get("productModel").enable();
                marketBundleInfo.at(i).get("medicalDeviceName").enable();
                marketBundleInfo.at(i).get("nmpaNum").enable();
                marketBundleInfo.at(i).get("nmpaValidityDate").enable();
                if ("CC" !== orderModality) {
                  marketBundleInfo
                    .at(i)
                    .get("productModel")
                    .setValidators([Validators.required]);
                  marketBundleInfo
                    .at(i)
                    .get("medicalDeviceName")
                    .setValidators([Validators.required]);
                  marketBundleInfo
                    .at(i)
                    .get("nmpaNum")
                    .setValidators([Validators.required]);
                  marketBundleInfo
                    .at(i)
                    .get("nmpaValidityDate")
                    .setValidators([Validators.required]);
                }
              });

              const financialSolutionDisabled =
                orderBaseinfo.getRawValue().financialSolutionDisabled;
              const { currencySystem } = orderBaseinfo.getRawValue();
              if (!financialSolutionDisabled) {
                orderBaseinfo.get("financialSolutionCnyNet").enable();
                orderBaseinfo.get("financialSolutionUsd").enable();
                orderBaseinfo.get("creditCnyNet").enable();
                orderBaseinfo.get("creditUsd").enable();
                orderBaseinfo.get("paymentNetCny").enable();
                orderBaseinfo.get("paymentUsd").enable();
                if (currencySystem == "CNY") {
                  orderBaseinfo
                    .get("financialSolutionCnyNet")
                    .setValidators([Validators.required]);
                  orderBaseinfo.get("financialSolutionUsd").clearValidators();
                } else {
                  orderBaseinfo
                    .get("financialSolutionUsd")
                    .setValidators([Validators.required]);
                  orderBaseinfo
                    .get("financialSolutionCnyNet")
                    .clearValidators();
                }
              } else {
                orderBaseinfo.get("creditCnyNet").disable();
                orderBaseinfo.get("financialSolutionCnyNet").disable();
                orderBaseinfo.get("paymentNetCny").disable();
              }
              productModelInfo.get("orderProductModel").enable();
              orderBaseinfo
                .get("sofonFile")
                .setValidators([Validators.required]);
              orderBaseinfo
                .get("sofonNum")
                .setValidators([Validators.required]);
              orderBaseinfo.patchValue({
                sofonNumRequired: true,
                optionDisabled: false,
              });
              orderBaseinfo.controls.sofonNum.enable();
              this.foreignInfoDDpstatus(index); //验证ddpstatus是否过期
              const { performanceBond, afterSalePrice, qualityGuarantee } =
                mainTrems.getRawValue();
              foreignInfo.controls.foreignTradeCorpSapCode.enable();
              endUserinfo.controls.endUserSapCode.enable();
              accountFrom.enable();
              orderBaseinfo.controls.sofonFile.enable();
              orderBaseinfo.controls.dealerSapCode.enable();
              orderSalesinfo.controls.orderSalesSapCode.enable();

              if (orderModality == "US") {
                const { businessModel } = this.baseInfoFrom.getRawValue();
                if (businessModel == "DISTRIBUTOR") {
                  orderBaseinfo
                    .get("dealerSapCode")
                    .setValidators(Validators.required);
                  orderBaseinfo.get("dealerSapCode").markAsDirty();
                }
                orderSalesinfo
                  .get("orderSalesSapCode")
                  .setValidators(Validators.required);
                orderSalesinfo.get("orderSalesSapCode").markAsDirty();
                orderSalesinfo.patchValue({
                  orderSalesSapCodeRequired: true,
                });
                orderBaseinfo.patchValue({
                  dealerSapCodeRequired: true,
                });
              } else {
                orderSalesinfo.get("orderSalesSapCode").clearValidators();
                orderBaseinfo.get("dealerSapCode").clearValidators();
                orderSalesinfo.patchValue({
                  orderSalesSapCodeRequired: false,
                });
                orderBaseinfo.patchValue({
                  dealerSapCodeRequired: false,
                });
              }
              orderSalesinfo.get("orderSalesSapCode").updateValueAndValidity();
              mainTrems.controls.paymentProvisionFile.enable();
              mainTrems.controls.paymentProvisionRemarks.enable();

              mainTrems.controls.performanceBondFile.enable();
              mainTrems.controls.performanceBondRemarks.enable();

              mainTrems.controls.afterSalePriceFile.enable();
              mainTrems.controls.afterSalePriceRemarks.enable();

              mainTrems.controls.qualityGuaranteeRemarks.enable();
              mainTrems.controls.qualityGuaranteeFile.enable();

              if (performanceBond == "1") {
                mainTrems
                  .get("performanceBondRemarks")
                  .setValidators(Validators.required);
                mainTrems
                  .get("performanceBondRemarks")
                  .updateValueAndValidity();
              }
              if (afterSalePrice == "1") {
                mainTrems
                  .get("afterSalePriceRemarks")
                  .setValidators(Validators.required);
                mainTrems.get("afterSalePriceRemarks").updateValueAndValidity();
              }
              if (qualityGuarantee == "1") {
                mainTrems
                  .get("qualityGuaranteeRemarks")
                  .setValidators(Validators.required);
                mainTrems
                  .get("qualityGuaranteeRemarks")
                  .updateValueAndValidity();
              }

              otherTerms.controls.shipmentDeliveryFile.enable();
              otherTerms.controls.shipmentDeliveryRemarks.enable();

              otherTerms.controls.sitePreparationFile.enable();
              otherTerms.controls.sitePreparationRemarks.enable();

              otherTerms.controls.installationWarrantyRemarks.enable();
              otherTerms.controls.installationWarrantyFile.enable();
              otherTerms.controls.installationWarrantySecondaryApproval.enable();

              otherTerms.controls.otherRemarks.enable();
              otherTerms.controls.otherTermsFile.enable();
              otherTerms.controls.otherLabel.enable();

              const {
                shipmentDelivery,
                installationWarranty,
                sitePreparation,
                otherTrain,
                otherFine,
                otherIp,
                otherContractTemplate,
                otherOcap,
                other,
              } = otherTerms.getRawValue();

              if (shipmentDelivery == "1") {
                otherTerms
                  .get("shipmentDeliveryRemarks")
                  .setValidators(Validators.required);
                otherTerms
                  .get("shipmentDeliveryRemarks")
                  .updateValueAndValidity();
              }
              if (installationWarranty == "1") {
                otherTerms
                  .get("installationWarrantyRemarks")
                  .setValidators(Validators.required);
                otherTerms
                  .get("installationWarrantyRemarks")
                  .updateValueAndValidity();
              }
              if (sitePreparation == "1") {
                otherTerms
                  .get("sitePreparationRemarks")
                  .setValidators(Validators.required);
                otherTerms
                  .get("sitePreparationRemarks")
                  .updateValueAndValidity();
              }
              if (
                otherTrain == true ||
                otherFine == true ||
                otherIp == true ||
                otherContractTemplate == true ||
                otherOcap == true ||
                other == true
              ) {
                otherTerms
                  .get("otherRemarks")
                  .setValidators(Validators.required);
                otherTerms.get("otherRemarks").updateValueAndValidity();
              }

              speciallyTerms.controls.supportFileMissingFile.enable();
              speciallyTerms.controls.supportFileMissingRemarks.enable();

              speciallyTerms.controls.amountDifferenceFile.enable();
              speciallyTerms.controls.amountDifferenceRemarks.enable();

              const { supportFileMissing, amountDifference } =
                speciallyTerms.getRawValue();
              if (supportFileMissing == "1") {
                speciallyTerms
                  .get("supportFileMissingRemarks")
                  .setValidators(Validators.required);
                speciallyTerms
                  .get("supportFileMissingRemarks")
                  .updateValueAndValidity();
              }
              if (amountDifference == "1") {
                speciallyTerms
                  .get("amountDifferenceRemarks")
                  .setValidators(Validators.required);
                speciallyTerms
                  .get("amountDifferenceRemarks")
                  .updateValueAndValidity();
              }
            } else {
              orderBaseinfo.patchValue({
                optionDisabled: true,
                sofonNumRequired: false,
              });
              orderBaseinfo.get("sofonFile").clearValidators();
              orderBaseinfo.get("sofonNum").clearValidators();
              orderBaseinfo.controls.sofonFile.disable();
              orderBaseinfo.controls.sofonNum.disable();
              mainTrems.controls.paymentProvisionFile.disable();
              mainTrems.controls.performanceBondFile.disable();
              mainTrems.controls.afterSalePriceFile.disable();

              mainTrems.controls.qualityGuaranteeRemarks.disable();
              mainTrems.controls.qualityGuaranteeFile.disable();

              otherTerms.controls.shipmentDeliveryFile.disable();
              otherTerms.controls.sitePreparationFile.disable();
              otherTerms.controls.installationWarrantyFile.disable();
              otherTerms.controls.otherTermsFile.disable();
              speciallyTerms.controls.supportFileMissingFile.disable();
              speciallyTerms.controls.biddingFile.disable();
              speciallyTerms.controls.tenderFile.disable();
              speciallyTerms.controls.endUserContract.disable();
              speciallyTerms.controls.projectAnalysisTable.disable();
              speciallyTerms.controls.amountDifferenceFile.disable();
              orderBaseinfo.controls.cpclFile.disable();
              orderBaseinfo.controls.otherSupportFile.disable();
              orderBaseinfo.controls.dealerRequestLetterFile.disable();
            }
            orderBaseinfo.get("sofonFile").updateValueAndValidity();
          }
          if (this.flag == "1") {
            orderSalesinfo.patchValue({
              isDisabled: true,
              contractCancelDisabled: true,
              isDisabledMain: true,
            });
          }


          this.showMagneticResonanceShieldingFileHost(index);

          this.showigtThirdPartyFileHost(index);

          this.ifrequiredshow(index);

          this.ifInstallDate(index);

          this.isshowActualSalesName(index);

        });
      }

      let allSwitchValid = this.orderInfo.controls.map((i) =>
        i.get("switchValid")
      );
      this.switchValids =
        allSwitchValid.length > 0
          ? allSwitchValid
          : Array.from({ length: this.orderInfo.length }).map((i) => true);

      this.setActualHospital();
    });
  }
  public price_permission: boolean = false;
  public financialError: boolean = false;
  status: any;
  public pdfSRC: any;
  public isPdf: any = false;
  userName: any;
  saleRegions: any = [];
  salesList: any = [];
  cityList: any = [];
  switchValid: any = true;
  switchValids: any[] = [];
  modalityInfo: any;
  @Input() editable: any = true;
  @Input() editPreTable: any = true;
  flag: any;
  @ViewChild("selectUser") selectUser;
  @ViewChild("selectActualUser") selectActualUser;
  @ViewChild("selectSoluUser") selectSoluUser;
  @ViewChild("selectForign") selectForign;
  @ViewChild("selectHospital") selectHospital;
  @ViewChild("selectPreBook") selectPreBook;
  @ViewChild("selectRefno") selectRefno;
  @Input() formValue: FormGroup;

  public index = 0;
  public user;

  ngOnInit() {
    this.init();
  }
  ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();
  }
  ngOnChanges(): void {}
  init() {
    this.initSaleRegions("Sales Rep/Mgr");
    this.user = localStorage.getItem("ecom_ng_philips_code1");
    this.userName = localStorage.getItem("ng_philips_username");
    const taskStatus = this.activatedRouter.queryParams["value"].taskStatus;
    this.status = taskStatus ? taskStatus : "";
    this.flag = this.activatedRouter.queryParams["value"].flag;
    if (this.flag == "1") {
      this.editable = false;
      this.editPreTable = false;
    }
    const arr = JSON.parse(localStorage.getItem("permissions"));
    if (arr) {
      this.price_permission = haveRolesArr(arr.price);
    }
  }
  get orderInfo(): FormArray {
    if (this.formValue) {
      return this.formValue.get("orderInfo") as FormArray;
    }
  }
  get baseInfoFrom(): FormGroup {
    return this.formValue.get("baseInfoFrom") as FormGroup;
  }
  get endUserFrom(): FormGroup {
    return this.formValue.get("endUserFrom") as FormGroup;
  }
  get priceApproval(): FormGroup {
    return this.formValue.get("priceApproval") as FormGroup;
  }
  get dealerFrom(): FormGroup {
    return this.formValue.get("dealerFrom") as FormGroup;
  }
  get orderBaseinfo(): FormGroup {
    return this.formValue.get("orderBaseinfo") as FormGroup;
  }
  get foreignFrom(): FormGroup {
    return this.formValue.get("foreignFrom") as FormGroup;
  }

  handleSwitch(index, $event) {
    console.log($event, index);
    // this.orderInfo.at(index).get('orderBaseinfo').patchValue({
    //   switchValid:$event
    // })
  }

  performanceBondModelChanges(event, i) {
    this.performanceBondChange(
      "performanceBond",
      i,
      "mainTrems",
      "performanceBondRemarks"
    );
    const mainTrems = this.orderInfo.at(i).get("mainTrems") as FormGroup;

    if (event == 1) {
      setTimeout(() => {
        mainTrems.patchValue({ performanceBondisRequired: true });
      });
    } else {
      setTimeout(() => {
        mainTrems.patchValue({ performanceBondisRequired: false });
      });
    }
  }
  foreignInfoDDpstatus(i) {
    //验证ddp是否过期
    const foreignInfo = this.orderInfo.at(i).get("foreignInfo") as FormGroup;
    const { orderSameForeignTradeCorp, foreignTradeCorpDdpValidityDate } =
      foreignInfo.getRawValue();
    if (orderSameForeignTradeCorp == "0") {
      foreignInfo.get("foreignTradeCorpDdpStatus").enable();
      foreignInfo
        .get("foreignTradeCorpDdpStatus")
        .setValidators([this.dDpstatusvalid, Validators.required]);
      let ddpValidUntil, ddpStatus;
      if (foreignTradeCorpDdpValidityDate) {
        ddpValidUntil = standardTime(foreignTradeCorpDdpValidityDate);
        ddpStatus = isadopt(ddpValidUntil);
        foreignInfo.patchValue({
          foreignTradeCorpDdpValidityDate: foreignTradeCorpDdpValidityDate,
          foreignTradeCorpDdpStatus: ddpStatus ? ddpStatus : "不通过",
        });
      }
    }
  }
  qualityGuaranteeModelChanges(event, i) {
    this.performanceBondChange(
      "qualityGuarantee",
      i,
      "mainTrems",
      "qualityGuaranteeRemarks"
    );
    const mainTrems = this.orderInfo.at(i).get("mainTrems") as FormGroup;
    if (event == 1) {
      mainTrems.patchValue({ qualityGuaranteeRequired: true });
    } else {
      mainTrems.patchValue({ qualityGuaranteeRequired: false });
    }
  }
  afterSalePriceModelChanges(event, i) {
    this.performanceBondChange(
      "afterSalePrice",
      i,
      "mainTrems",
      "afterSalePriceRemarks"
    );
    const mainTrems = this.orderInfo.at(i).get("mainTrems") as FormGroup;
    if (event == 1) {
      mainTrems.patchValue({ afterSalePriceRequired: true });
    } else {
      mainTrems.patchValue({ afterSalePriceRequired: false });
    }
  }
  shipmentDeliveryModelChanges(event, i) {
    this.performanceBondChange(
      "shipmentDelivery",
      i,
      "otherTerms",
      "shipmentDeliveryRemarks"
    );
    const otherTerms = this.orderInfo.at(i).get("otherTerms") as FormGroup;

    if (event == 1) {
      otherTerms.patchValue({ shipmentDeliveryRequired: true });
    } else {
      otherTerms.patchValue({ shipmentDeliveryRequired: false });
    }
  }
  sitePreparationModelChanges(event, i) {
    this.performanceBondChange(
      "sitePreparation",
      i,
      "otherTerms",
      "sitePreparationRemarks"
    );
    const otherTerms = this.orderInfo.at(i).get("otherTerms") as FormGroup;
    if (event == 1) {
      otherTerms.patchValue({ sitePreparationRequired: true });
    } else {
      otherTerms.patchValue({ sitePreparationRequired: false });
    }
  }
  installationWarrantyModelChanges(event, i) {
    this.performanceBondChange(
      "installationWarranty",
      i,
      "otherTerms",
      "installationWarrantyRemarks"
    );
    const otherTerms = this.orderInfo.at(i).get("otherTerms") as FormGroup;
    if (event == 1) {
      otherTerms.patchValue({ installationWarrantyRequired: true });
    } else {
      otherTerms.patchValue({ installationWarrantyRequired: false });
    }
  }
  amountDifferenceModelChanges(event, i) {
    this.performanceBondChange(
      "amountDifference",
      i,
      "speciallyTerms",
      "amountDifferenceRemarks"
    );
    const speciallyTerms = this.orderInfo
      .at(i)
      .get("speciallyTerms") as FormGroup;
    if (event == 1) {
      speciallyTerms.patchValue({ amountDifferenceRequired: true });
    } else {
      speciallyTerms.patchValue({ amountDifferenceRequired: false });
    }
  }

  creditShow(i) {
    //远期信息凭证显示与否
    const mainTrems = this.orderInfo.at(i).get("mainTrems") as FormGroup;
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const { paymentProvision } = mainTrems.getRawValue();
    const { currencySystem } = orderBaseinfo.getRawValue();
    if (paymentProvision == "远期信用证（请在备注处注明信用证期限及开证行）") {
      if (currencySystem == "CNY") {
        orderBaseinfo.get("creditCnyNet").setValidators([Validators.required]);
        orderBaseinfo.get("creditUsd").clearValidators();
        orderBaseinfo.get("creditUsd").updateValueAndValidity();
        orderBaseinfo.get("creditCnyNet").updateValueAndValidity();
      } else {
        orderBaseinfo.get("creditUsd").setValidators([Validators.required]);
        orderBaseinfo.get("creditCnyNet").clearValidators();
        orderBaseinfo.get("creditCnyNet").updateValueAndValidity();
        orderBaseinfo.get("creditUsd").updateValueAndValidity();
      }
      return true;
    } else {
      orderBaseinfo.get("creditCnyNet").clearValidators();
      orderBaseinfo.get("creditCnyNet").updateValueAndValidity();
      return false;
    }
  }
  paymentShow(i) {
    //其他付款方式显示与否
    const mainTrems = this.orderInfo.at(i).get("mainTrems") as FormGroup;
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const { currencySystem } = orderBaseinfo.getRawValue();
    const { paymentProvision } = mainTrems.getRawValue();
    if (paymentProvision == "其他（请在备注处描述实际付款方式）") {
      if (currencySystem == "CNY") {
        orderBaseinfo.get("paymentNetCny").setValidators([Validators.required]);
        orderBaseinfo.get("paymentUsd").clearValidators();
        orderBaseinfo.get("paymentNetCny").updateValueAndValidity();
        orderBaseinfo.get("paymentUsd").updateValueAndValidity();
      } else {
        orderBaseinfo.get("paymentUsd").setValidators([Validators.required]);
        orderBaseinfo.get("paymentUsd").updateValueAndValidity();
        orderBaseinfo.get("paymentNetCny").clearValidators();
        orderBaseinfo.get("paymentNetCny").updateValueAndValidity();
      }
      return true;
    } else {
      orderBaseinfo.get("paymentNetCny").clearValidators();
      orderBaseinfo.get("paymentNetCny").updateValueAndValidity();
      return false;
    }
  }
  selectCity(param, i, flag: any = true) {
    const orderSalesinfo = this.orderInfo
      .at(i)
      .get("orderSalesinfo") as FormGroup;
    const { orderSalesProvince } = orderSalesinfo.getRawValue();
    if (flag) {
      orderSalesinfo.patchValue({
        orderSalesCity: null,
      });
    }
    this.service.provinceLists.forEach((val) => {
      if (val.value == orderSalesProvince) {
        orderSalesinfo.patchValue({
          cityList: val.children.map((a) => ({
            value: a.value,
          })),
        });
      }
    });
  }
  supportChang(i) {
    //是否支持文件确失进单
    this.isSupportbidding(i);
    const speciallyTerms = this.orderInfo
      .at(i)
      .get("speciallyTerms") as FormGroup;
    const { supportFileMissing } = speciallyTerms.getRawValue();
    if (supportFileMissing == "1") {
      speciallyTerms
        .get("supportFileMissingRemarks")
        .setValidators(Validators.required);
      speciallyTerms.get("supportFileMissingRemarks").markAsDirty();
    } else {
      speciallyTerms.get("supportFileMissingRemarks").clearValidators();
    }
    speciallyTerms.get("supportFileMissingRemarks").updateValueAndValidity();
  }
  isshowActualSalesName(i) {
    //实际销售是否显示，是否必填
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const orderSalesinfo = this.orderInfo
      .at(i)
      .get("orderSalesinfo") as FormGroup;
    const { centralizedPurchasing } = orderBaseinfo.getRawValue();
    if (centralizedPurchasing == "1") {
      // orderSalesinfo.patchValue({
      //   actualSalesRequired:true,
      // })
      return true;
    } else {
      // orderSalesinfo.patchValue({
      //   actualSalesRequired:false,
      // })
      return false;
    }
  }
  isShowmainClause(i) {
    //是否显示 主要合同条款
    const oitMode = this.baseInfoFrom.getRawValue().oitMode;
    const sampleCheck = this.priceApproval.getRawValue().sampleCheck;
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const orderModality = orderBaseinfo.getRawValue().orderModality;
    if (orderModality == "PD&IGT") {
      if (oitMode == "BIDDING" || (sampleCheck == "1" && oitMode == "STOCK")) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }
  isDiffer(i) {
    //直接合同有价差
    const { oitMode, businessModel } = this.baseInfoFrom.getRawValue();
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const orderModality = orderBaseinfo.getRawValue().orderModality;
    if (orderModality == "PD&IGT") {
      if (oitMode == "BIDDING" && businessModel == "DIRECT") {
        return true;
      } else {
        return false;
      }
    } else {
      if (businessModel == "DIRECT") {
        return true;
      } else {
        return false;
      }
    }
  }
  isSupportbidding(i) {
    //是否支持文件缺失进单
    const speciallyTerms = this.orderInfo
      .at(i)
      .get("speciallyTerms") as FormGroup;
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const orderModality = orderBaseinfo.getRawValue().orderModality;
    const supportFileMissing = speciallyTerms.getRawValue().supportFileMissing;
    if (supportFileMissing == "1") {
      speciallyTerms.get("biddingFile").clearValidators();
      speciallyTerms.get("tenderFile").clearValidators();
      speciallyTerms.get("bidWinningFile").clearValidators();
      speciallyTerms.get("endUserContract").clearValidators();
      speciallyTerms.get("projectAnalysisTable").clearValidators();
      speciallyTerms.patchValue({
        isUsRequired: false,
      });
    } else {
      const biddingType = this.baseInfoFrom.getRawValue().biddingType; //招标类型
      const hospitalType = this.endUserFrom.getRawValue().hospitalType; //医院性质
      const orderModality = orderBaseinfo.getRawValue().orderModality;
      const businessModel = this.baseInfoFrom.getRawValue().businessModel;
      const { sampleCheck } = this.priceApproval.getRawValue();
      if (orderModality == "US" || orderModality == "CC") {
        if (businessModel == "DIRECT" && sampleCheck == "1") {
          speciallyTerms.get("biddingFile").setValidators(Validators.required);
          speciallyTerms.get("tenderFile").setValidators(Validators.required);
        }
        if (hospitalType == "公立医院") {
          speciallyTerms
            .get("bidWinningFile")
            .setValidators(Validators.required);
        }
        if (sampleCheck == "1") {
          speciallyTerms
            .get("endUserContract")
            .setValidators(Validators.required);
        } else {
          speciallyTerms.get("endUserContract").clearValidators();
        }
      } else if (orderModality == "PD&IGT") {
        if (businessModel == "DISTRIBUTOR" && sampleCheck == "1") {
          speciallyTerms
            .get("projectAnalysisTable")
            .setValidators(Validators.required);
        }
        if (
          (biddingType == "国内公开标" || biddingType == "国际公开标") &&
          sampleCheck == "1"
        ) {
          // speciallyTerms.get("biddingFile").setValidators(Validators.required);
          speciallyTerms.get("tenderFile").setValidators(Validators.required);

          if (businessModel == "DISTRIBUTOR") {
            speciallyTerms
              .get("endUserContract")
              .setValidators(Validators.required);
          } else {
            speciallyTerms.get("endUserContract").clearValidators();
          }
        }
      }
      speciallyTerms.patchValue({
        isUsRequired: true,
      });
    }
    speciallyTerms.get("biddingFile").updateValueAndValidity();
    speciallyTerms.get("tenderFile").updateValueAndValidity();
    speciallyTerms.get("bidWinningFile").updateValueAndValidity();
    speciallyTerms.get("endUserContract").updateValueAndValidity();
    speciallyTerms.get("projectAnalysisTable").updateValueAndValidity();
    this.service.supportFileChangAction(this.formValue);
  }
  onShowSoluActualModal(i) {
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const value = orderBaseinfo.getRawValue().orderModality;
    this.selectSoluUser.show({ modality: value, role: "Sales Rep/Mgr" }, true);
    this.index = i;
  }
  onShowSelectPersonModal(i) {
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const value = orderBaseinfo.getRawValue().orderModality;
    this.selectUser.show({ modality: value, role: "Sales Rep/Mgr" }, true);
    this.index = i;
  }
  onShowSelectActualModal(i) {
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const value = orderBaseinfo.getRawValue().orderModality;
    this.selectActualUser.show(
      { modality: value, role: "Sales Rep/Mgr" },
      true
    );
    this.index = i;
  }
  onClearOrder(i) {
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const orderSalesinfo = this.orderInfo.at(i).get("orderSalesinfo");
    const endUserinfo = this.orderInfo.at(i).get("endUserinfo") as FormGroup;
    const foreignInfo = this.orderInfo.at(i).get("foreignInfo") as FormGroup;
    const mainTrems = this.orderInfo.at(i).get("mainTrems") as FormGroup;
    const otherTerms = this.orderInfo.at(i).get("otherTerms") as FormGroup;
    const speciallyTerms = this.orderInfo
      .at(i)
      .get("speciallyTerms") as FormGroup;

    // 根据是否有ActualHospital ID和是否为集采项目确定是否要清除 与"基础信息"相同 标识
    debugger;
    const actualHospitalId = orderBaseinfo.getRawValue().actualHospitalId;
    if (
      (!!actualHospitalId ||
        this.status == "ecos_oit_deal_sales" ||
        this.status == "ecos_oit_deal_resubmit" ||
        this.status == "" ||
        this.status == undefined ||
        this.status == "ecos_status_draft") &&
      this.baseInfoFrom.getRawValue().centralizedPurchasing == "1"
    ) {
      // 保持原样
    } else {
      endUserinfo.reset();
      endUserinfo.patchValue({
        orderSameEndUser: "1",
      });
    }

    const {
      orderName,
      orderModality,
      cpDealOrderId,
      marketBundleId,
      totalContractPrice,
      sofonNum,
      sofonFile,
      currencySystem,
    } = orderBaseinfo.getRawValue();
    orderSalesinfo.reset();
    orderBaseinfo.reset();
    const { centralizedPurchasing } = this.baseInfoFrom.getRawValue(); //基础信息是否集采
    orderSalesinfo.patchValue({
      isDisabled: "true",
      isDisabledMain: "true",
      orderSalesModel: "",
    });
    orderBaseinfo.patchValue({
      orderName,
      centralizedPurchasing: centralizedPurchasing,
      igtThirdPartySingle: "0",
      orderModality: orderModality,
      cpDealOrderId,
      marketBundleId,
      totalContractPrice,
      sofonNum,
      sofonFile,
      currencySystem,
      contractCancelDisabled: true,
    });

    foreignInfo.reset();
    const { paymentProvisionList } = mainTrems.getRawValue();
    mainTrems.reset();

    foreignInfo.patchValue({
      orderSameForeignTradeCorp: "1",
    });
    mainTrems.patchValue({
      paymentProvision: "",
      performanceBond: "0",
      afterSalePrice: "0",
      paymentProvisionList,
    });
    otherTerms.reset();
    otherTerms.patchValue({
      shipmentDelivery: "0",
      sitePreparation: "0",
      installationWarranty: "0",
      installationWarrantySecondaryApproval: "0",
    });
    speciallyTerms.patchValue({
      supportFileMissing: "0",
      amountDifference: "0",
    });
    this.isDisable("", this.index);
  }
  onClearActualOrder(i) {
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderSalesinfo") as FormGroup;
    orderBaseinfo.patchValue({
      actualSalesEmail: null,
      actualSalesName: null,
      actualSalesNameModel: "",
    });
  }
  onClearsoluOrder(i) {
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    orderBaseinfo.patchValue({
      solutionSalesEmail: null,
      solutionSalesName: null,
      solutionSalesNameModel: "",
    });
  }
  onSelectuser(val) {
    const orderSalesinfo = this.orderInfo
      .at(this.index)
      .get("orderSalesinfo") as FormGroup;
    const orderBaseinfo = this.orderInfo
      .at(this.index)
      .get("orderBaseinfo") as FormGroup;
    const { dealFormSalesModality } = this.baseInfoFrom.getRawValue();
    const { orderModality } = orderBaseinfo.getRawValue();
    const { approvalAreaConfiguration } = this.baseInfoFrom.getRawValue();
    if (approvalAreaConfiguration) {
      orderSalesinfo.reset();
      const orderApprovalAreaConfiguration = [
        val.team,
        val.modality,
        val.cycleGroup,
        val.bigArea,
        val.smallArea,
      ]
        .filter((str) => str && str.trim())
        .join("-");
      const parm: any = {
        orderSales: val.email,
        orderSalesName: val.name,
        orderSalesModel: `${val.name}(${val.email})`,
        orderSalesModality: val.modality,
        orderSalesTeam: val.team,
        orderSalesBigArea: val.bigArea,
        orderSalesSmallArea: val.smallArea,
        orderSalesCycleGroup: val.cycleGroup,
        orderSalesProvince: val.province,
        isDisabled: this.user != val.email ? true : false,
        isDisabledMain: this.user != val.email ? true : false,
      };
      if (
        dealFormSalesModality == orderModality &&
        this.user == val.email &&
        this.flag != "1"
      ) {
        parm.orderApprovalAreaConfiguration = orderApprovalAreaConfiguration;
      }
      orderSalesinfo.patchValue(parm);
      this.isDisable(val.email, this.index);
      this.selectCity(val.province, this.index, false);
      this.showMagneticResonanceShieldingFileHost(this.index);
      this.showigtThirdPartyFileHost(this.index);
      this.actualSalesSetValidators(this.index);
    } else {
      this.message.error("请在基础信息选择审批区域配置");
    }
  }
  changeOter(index) {
    const otherTerms = this.orderInfo.at(index).get("otherTerms") as FormGroup;
    if (otherTerms.getRawValue().other == true) {
      otherTerms.get("otherLabel").setValidators(Validators.required);
      otherTerms.get("otherLabel").markAsDirty();
      otherTerms.get("otherLabel").updateValueAndValidity();
      return true;
    } else {
      otherTerms.get("otherLabel").clearValidators();
      otherTerms.get("otherLabel").markAsDirty();
      otherTerms.get("otherLabel").updateValueAndValidity();
      return false;
    }
  }
  /**
   *
   * @param param 当前人员
   * @param index 当前order index
   * @configOff 是否加载deal层级参数

   */
  isDisable(param, index, configOff: any = false) {
    //验证当前登录人与sale deal是否相同，禁用与否
    // const filter = /[\u4E00-\u9FA5\uF900-\uFA2D]{1,}/;
    // filter.test(param) && (param = stringIndexof(param));
    const orderBaseinfo = this.orderInfo
      .at(index)
      .get("orderBaseinfo") as FormGroup;
    const orderSalesinfo = this.orderInfo
      .at(index)
      .get("orderSalesinfo") as FormGroup;
    const mainTrems = this.orderInfo.at(index).get("mainTrems") as FormGroup;
    const otherTerms = this.orderInfo.at(index).get("otherTerms") as FormGroup;
    const speciallyTerms = this.orderInfo
      .at(index)
      .get("speciallyTerms") as FormGroup;
    const accountFrom = this.orderInfo
      .at(index)
      .get("accountFrom") as FormGroup;
    const productModelInfo = this.orderInfo
      .at(index)
      .get("productModelInfo") as FormGroup;

    if (this.status != "ecos_oit_deal_oa" && this.flag != "1") {
      orderSalesinfo.patchValue({
        isDisabled: this.user != param ? true : false,
        isDisabledMain: this.user != param ? true : false,
        prebookDisabled: this.user != param ? true : false,
      });
    }

    if (
      this.user == param &&
      (this.status == "ecos_oit_deal_sales" ||
        this.status == "ecos_oit_deal_resubmit" ||
        this.status == "" ||
        this.status == undefined ||
        this.status == "ecos_status_draft") &&
      this.flag != "1"
    ) {
      const { isload, modality, cycleGroup, bigArea, smallArea } =
        this.formValue.getRawValue();
      const {
        approvalAreaConfiguration,
        centralizedPurchasing,
        dealFormSalesCity,
        dealFormSalesPerformanceProvince,
        dealFormSalesModality,
        dealFormSalesBigArea,
        dealFormSalesSmallArea,
        dealFormSalesProvince,
        dealFormSalesTeam,
      } = this.baseInfoFrom.getRawValue(); //招标类型
      const { currencySystem } = this.priceApproval.getRawValue();
      orderBaseinfo.patchValue({
        contractCancelDisabled: false,
      });
      const foreignInfo = this.orderInfo
        .at(index)
        .get("foreignInfo") as FormGroup;
      let orderCurrencySystem = orderBaseinfo.getRawValue().currencySystem;
      if (orderCurrencySystem == "USD" && currencySystem == "CNY") {
        foreignInfo.patchValue({
          orderSameForeignTradeCorp: "0",
        });
        orderSalesinfo.patchValue({
          isDisabledForeign: true,
        });
      }

      // const {prebookQuantity,orderModality}=orderBaseinfo.getRawValue();
      // if(orderModality=='PD&IGT')
      // {
      //   if(prebookQuantity>0)
      //   {
      //     orderBaseinfo.get('prebookReferenceId').setValidators(Validators.required);
      //   }
      // }

      if (
        (this.status == undefined ||
          this.status == "" ||
          this.status == "ecos_oit_deal_submit" ||
          this.status == "ecos_oit_deal_resubmit" ||
          this.status == "ecos_status_draft") &&
        (this.flag == "0" || this.flag == undefined)
      ) {
        if (centralizedPurchasing == "1") {
          // orderSalesinfo.patchValue({
          //   orderSalesProvince: dealFormSalesProvince,
          //   orderSalesPerformanceProvince: dealFormSalesPerformanceProvince,
          //  orderSalesCity: dealFormSalesCity,
          // })
          orderSalesinfo.get("orderSalesPerformanceProvince").enable();
          orderSalesinfo.get("orderSalesCity").enable();
          orderSalesinfo.get("orderSalesProvince").enable();
        }
      }
      let marketBundleInfo = this.orderInfo
        .at(index)
        .get("marketBundleInfo") as FormArray;
      marketBundleInfo.controls.forEach((itl, i) => {
        marketBundleInfo.at(i).enable();
        marketBundleInfo.at(i).get("productModel").disable();
        marketBundleInfo.at(i).get("medicalDeviceName").disable();
        marketBundleInfo.at(i).get("nmpaNum").disable();
        marketBundleInfo.at(i).get("nmpaValidityDate").disable();
      });
      const { orderSameForeignTradeCorp, foreignTradeCorpDdpValidityDate } =
        foreignInfo.getRawValue();
      this.foreignInfoDDpstatus(index); //验证ddpstatus是否过期
      productModelInfo.get("orderProductModel").enable();
      orderSalesinfo.get("ka").enable();
      orderSalesinfo.get("actualSalesEmail").enable();
      orderSalesinfo.get("orderSalesSapCode").enable();
      //orderBaseinfo.get("centralizedPurchasing").enable();
      orderBaseinfo.get("contractCancelReferenceId").enable();
      orderBaseinfo.get("contractCancelSo").enable();
      orderBaseinfo.get("dealerSapCode").enable();
      orderBaseinfo.get("requiredArrivalDate").enable();
      orderBaseinfo.get("estimateInstallationDate").enable();
      //orderBaseinfo.get("actuallyDeliveryAddress").enable();
      orderBaseinfo.get("solutionSalesEmail").enable();
      orderBaseinfo.get("includeSolution").enable();
      orderBaseinfo.get("dealerRequestLetterFile").enable();
      orderBaseinfo.get("cpclFile").enable();
      orderBaseinfo.get("otherSupportFile").enable();
      orderBaseinfo.get("magneticResonanceShieldingFile").enable();
      orderBaseinfo.get("igtThirdPartySingle").enable();
      orderBaseinfo.get("igtThirdPartyFile").enable();
      orderBaseinfo.get("prebookReferenceId").enable();

      mainTrems.enable();
      otherTerms.enable();
      accountFrom.enable();
      speciallyTerms.enable();
    } else {
      orderSalesinfo.get("ka").disable();
      orderSalesinfo.get("actualSalesEmail").disable();
      orderSalesinfo.get("orderSalesSapCode").disable();
      orderBaseinfo.get("contractCancelReferenceId").disable();
      orderBaseinfo.get("contractCancelSo").disable();
      orderBaseinfo.get("dealerSapCode").disable();
      orderBaseinfo.get("requiredArrivalDate").disable();
      orderBaseinfo.get("estimateInstallationDate").disable();
      // orderBaseinfo.get("actuallyDeliveryAddress").disable();
      orderBaseinfo.get("solutionSalesEmail").disable();
      orderBaseinfo.get("includeSolution").disable();
      orderBaseinfo.get("dealerRequestLetterFile").disable();
      orderBaseinfo.get("cpclFile").disable();
      orderBaseinfo.get("otherSupportFile").disable();
      orderBaseinfo.get("magneticResonanceShieldingFile").disable();
      orderBaseinfo.get("igtThirdPartySingle").disable();
      orderBaseinfo.get("igtThirdPartyFile").disable();
      orderBaseinfo.get("prebookReferenceId").disable();
      mainTrems.disable();
      otherTerms.disable();
      speciallyTerms.disable();
      accountFrom.disable();
    }

    const { centralizedPurchasing } = this.baseInfoFrom.getRawValue();
    const endUserinfo = this.orderInfo
      .at(index)
      .get("endUserinfo") as FormGroup;
    const orderSameEndUser = endUserinfo.getRawValue().orderSameEndUser;
    if (
      this.user == param &&
      this.status == "ecos_oit_deal_sales" &&
      this.flag != "1"
    ) {
      //销售填写节点
      orderSalesinfo.get("orderApprovalAreaConfiguration").enable();
      orderSalesinfo.get("orderSalesPerformanceProvince").enable();
      orderSalesinfo.get("orderSalesCity").enable();
      orderSalesinfo.get("orderSalesProvince").enable();
      productModelInfo.get("orderProductModel").enable();
      orderBaseinfo.patchValue({
        contractCancelDisabled: false,
      });
    }
    // 如果选择用户与当前Deal Sales一致，则开放填选
    if (
      this.user == param &&
      (this.status == undefined ||
        this.status == "" ||
        this.status == "ecos_oit_deal_sales" ||
        this.status == "ecos_oit_deal_submit" ||
        this.status == "ecos_oit_deal_resubmit" ||
        this.status == "ecos_status_draft") &&
      (this.flag == "0" || this.flag == undefined) &&
      centralizedPurchasing == "1"
    ) {
      endUserinfo.get("endUserAddress").enable();
      endUserinfo.get("endUserPhone").enable();
      endUserinfo.get("endUserEmail").enable();
      endUserinfo.get("endUserContact").enable();
      endUserinfo.get("endUserActuallyDeliveryAddress").enable();
    } else {
      endUserinfo.get("endUserAddress").disable();
      endUserinfo.get("endUserPhone").disable();
      endUserinfo.get("endUserEmail").disable();
      endUserinfo.get("endUserContact").disable();
      endUserinfo.get("endUserActuallyDeliveryAddress").disable();
    }
  }
  isCurrentUserEditable() {
    const orderSalesinfo = this.orderInfo
      .at(this.index)
      .get("orderSalesinfo") as FormGroup;
    return this.user === orderSalesinfo.getRawValue().orderSales;
  }
  onSelectActualuser(val) {
    const orderBaseinfo = this.orderInfo
      .at(this.index)
      .get("orderSalesinfo") as FormGroup;
    orderBaseinfo.patchValue({
      actualSalesEmail: val.email,
      actualSalesName: val.name,
      actualSalesNameModel: `${val.name}(${val.email})`,
    });
  }
  onSelectSoluuser(val) {
    const orderBaseinfo = this.orderInfo
      .at(this.index)
      .get("orderBaseinfo") as FormGroup;
    orderBaseinfo.patchValue({
      solutionSalesEmail: val.email,
      solutionSalesName: val.name,
      solutionSalesNameModel: `${val.name}(${val.email})`,
    });
  }
  onShowSelectPrebookModal(i) {
    //弹出prebook弹窗口
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const marketBundleInfo = this.orderInfo
      .at(i)
      .get("marketBundleInfo") as FormArray;
    const marketBundleInfoArr = marketBundleInfo.getRawValue();
    const marketBundleHost = marketBundleInfoArr.filter(
      (val) =>
        val.primaryOpportunity == "true" || val.primaryOpportunity == true
    );
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
    this.index = i;
  }
  onPrebookselect(val) {
    const orderBaseinfo = this.orderInfo
      .at(this.index)
      .get("orderBaseinfo") as FormGroup;
    orderBaseinfo.patchValue({
      prebookReferenceId: val.referenceId,
      prebookApplyId: val.applyId,
      prebookOrderId: val.orderId,
      prebookStatus: val.processStatus,
      prebookSo: val.so,
    });
  }
  onClearPrebook(i) {
    //清除prebook
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    orderBaseinfo.patchValue({
      prebookApplyId: "",
      prebookReferenceId: "",
      prebookMainId: "",
      prebookOrderId: "",
      prebookStatus: "",
      prebookSo: "",
    });
  }

  checkFormData() {
    //order 状态更新
    for (const i in this.orderInfo.controls) {
      this.orderInfo.controls[i].markAsDirty();
      this.orderInfo.controls[i].updateValueAndValidity();
      const orderSalesinfo = this.orderInfo.controls[i].get(
        "orderSalesinfo"
      ) as FormGroup;
      const speciallyTerms = this.orderInfo.controls[i].get(
        "speciallyTerms"
      ) as FormGroup;
      const foreignInfo = this.orderInfo.controls[i].get(
        "foreignInfo"
      ) as FormGroup;
      const endUserinfo = this.orderInfo.controls[i].get(
        "endUserinfo"
      ) as FormGroup;
      const orderBaseinfo = this.orderInfo.controls[i].get(
        "orderBaseinfo"
      ) as FormGroup;
      const mainTrems = this.orderInfo.controls[i].get(
        "mainTrems"
      ) as FormGroup;
      const otherTerms = this.orderInfo.controls[i].get(
        "otherTerms"
      ) as FormGroup;
      const marketBundleInfo = this.orderInfo.controls[i].get(
        "marketBundleInfo"
      ) as FormArray;
      const accountFrom = this.orderInfo.controls[i].get(
        "accountFrom"
      ) as FormGroup;
      marketBundleInfo.controls.forEach((val, index) => {
        const group = val as FormGroup;
        this.updataControls(group);
      });
      this.updataControls(orderSalesinfo);
      this.updataControls(orderBaseinfo);
      this.updataControls(speciallyTerms);
      this.updataControls(foreignInfo);
      this.updataControls(endUserinfo);
      this.updataControls(mainTrems);
      this.updataControls(otherTerms);
      this.updataControls(accountFrom);
      //orderSalesinfo.valid
    }
    return this.orderInfo.valid;
  }
  updataControls(param: FormGroup) {
    for (const j in param.controls) {
      param.controls[j].markAsDirty();
      param.controls[j].updateValueAndValidity();
    }
  }
  upDataAndValidity(param: FormGroup) {
    //更新状态不弹出提示
    for (const j in param.controls) {
      param.controls[j].updateValueAndValidity();
    }
  }
  initSaleRegions(role) {
    const regions = (JSON.parse(window.localStorage.getItem("profiles")) || [])
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
    this.saleRegions = disreduce(regions, "label");
  }

  filterSaleRegion(i) {
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const { orderModality } = orderBaseinfo.getRawValue();
    return this.saleRegions.filter((item) => item.modality === orderModality);
  }

  selectConfig(systemRegion, i) {
    if (!systemRegion) {
      return;
    }

    const region = this.saleRegions.find(
      (region) => systemRegion === region.value
    );
    const { team, modality, cycleGroup, bigArea, smallArea, province } = region;
    const orderSalesinfo = this.orderInfo
      .at(i)
      .get("orderSalesinfo") as FormGroup;
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const { orderModality } = orderBaseinfo.getRawValue();
    const orderSaleData = orderSalesinfo.getRawValue();
    if (orderModality == modality) {
      orderSalesinfo.patchValue({
        orderSalesModality: modality,
        orderSalesCycleGroup: cycleGroup,
        orderSalesBigArea: bigArea,
        orderSalesSmallArea: smallArea,
        orderSalesTeam: team,
        orderSalesProvince: province,
      });
      this.selectCity(province, i, false);
    } else {
      // setTimeout(() => {
      //   orderSalesinfo.patchValue({
      //     orderApprovalAreaConfiguration:null,
      //     })
      //      this.message.error("Modality不匹配请重新选择区域配置!")
      //      return
      // },10);
      this.message.error("Modality不匹配请重新选择区域配置!");
    }
  }
  onshowForeignCompanyDialog(i) {
    this.index = i;
    this.selectForign.show({}, true);
  }
  onForignselect(val) {
    const foreignInfo = this.orderInfo
      .at(this.index)
      .get("foreignInfo") as FormGroup;
    foreignInfo.reset();
    foreignInfo.patchValue({
      orderSameForeignTradeCorp: "0",
      foreignTradeCorpSameDealer: false,
      companyNotInIePool: false,
    });
    let ddpValidUntil, ddpStatus;
    if (val.ddpValidUntil) {
      ddpValidUntil = standardTime(val.ddpValidUntil);
      ddpStatus = isadopt(ddpValidUntil);
    }
    foreignInfo.patchValue({
      foreignTradeCorpName: val.corporateName,
      foreignTradeCorpAddress: val.corporateAddress,
      foreignTradeCorpDdpValidityDate: val.ddpValidUntil,
      foreignTradeCorpDdpStatus: ddpStatus ? ddpStatus : "不通过",
    });
    foreignInfo.get("foreignTradeCorpDdpValidityDate").disable();
  }
  onClearForeignCompany(i) {
    var foreignInfo = this.orderInfo.at(i).get("foreignInfo") as FormGroup;
    this.isAutoChange = true;
    foreignInfo.reset();
    foreignInfo.patchValue({
      orderSameForeignTradeCorp: "0",
      foreignTradeCorpSameDealer: false,
      companyNotInIePool: false,

      foreignTradeCorpSapCode: null,
      foreignTradeCorpDdpStatus: null,
      foreignTradeCorpDdpValidityDate: null,
      foreignTradeCorpTaxNum: null,
      foreignTradeCorpAddress: null,
      foreignTradeCorpName: null,
      foreignTradeCorpPhone: null,
      foreignTradeCorpContact: null,
      foreignTradeCorpEmail: null,
      importAgreementSignName: null,
      importAgreementSignPosition: null,
    });
  }
  onShowSelectHospitalModal(i) {
    this.selectHospital.show({}, true);
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const orderModality = orderBaseinfo.getRawValue().orderModality;
    this.modalityInfo = [orderModality];
    this.index = i;
  }
  onClearHospital(i) {
    const endUserinfo = this.orderInfo
      .at(this.index)
      .get("endUserinfo") as FormGroup;
    endUserinfo.reset();
    endUserinfo.patchValue({
      orderSameEndUser: "0",
    });
  }
  onHospitalselect(val) {
    //最终用户
    this.handleHospitalSelected(this.index, val);
    this.service.paymentAction(this.formValue);
  }
  handleHospitalSelected(index, val) {
    const endUserinfo = this.orderInfo
      .at(index)
      .get("endUserinfo") as FormGroup;
    endUserinfo.patchValue({
      endUser: val.customerName,
      endUserAddress: val.address,
      endUserActuallyDeliveryAddress: "",
      hospitalType: val.customerType,
      endUserPhone: val.contactPhone,
      endUserContact: val.customerContact,
      endUserId: val.no,
      segment: val.category,
      usHta:
        val.category != "" &&
        val.category != null &&
        val.category.indexOf("US:HTA") != -1
          ? "是"
          : "否",
    });
  }
  isEnduser(index) {
    //最终用户显示不显示必填
    const endUserinfo = this.orderInfo
      .at(index)
      .get("endUserinfo") as FormGroup;
    const orderBaseinfo = this.orderInfo
      .at(index)
      .get("orderBaseinfo") as FormGroup;
    const { oitMode } = this.baseInfoFrom.getRawValue();
    const { orderModality } = orderBaseinfo.getRawValue();
    const { orderSameEndUser } = endUserinfo.getRawValue();
    let result = false;
    if (
      (orderSameEndUser == "0" &&
        oitMode == "BIDDING" &&
        orderModality == "PD&IGT") ||
      (orderSameEndUser == "0" && orderModality == "US")
    ) {
      endUserinfo.get("endUser").setValidators(Validators.required);
      //endUserinfo.get('endUserTaxNum').setValidators(Validators.required)
      endUserinfo.get("endUserAddress").setValidators(Validators.required);
      endUserinfo.get("endUserPhone").setValidators(Validators.required);
      //endUserinfo.get('endUserEmail').setValidators(Validators.required)
      endUserinfo.get("endUserContact").setValidators(Validators.required);
      endUserinfo.get("endUserActuallyDeliveryAddress").setValidators(Validators.required);
      endUserinfo.get("endUser").updateValueAndValidity();
      endUserinfo.get("endUserTaxNum").updateValueAndValidity();
      endUserinfo.get("endUserAddress").updateValueAndValidity();
      endUserinfo.get("endUserPhone").updateValueAndValidity();
      endUserinfo.get("endUserEmail").updateValueAndValidity();
      endUserinfo.get("endUserContact").updateValueAndValidity();
      endUserinfo.get("endUserActuallyDeliveryAddress").updateValueAndValidity();
      result = true;
      //  如果是集采还未开始，则不校验
      // if (
      //   (this.status == undefined ||
      //     this.status == "" ||
      //     this.status == "ecos_status_draft" ||
      //     this.status == "ecos_oit_deal_resubmit") &&
      //   (this.flag == "0" || this.flag == undefined) &&
      //   this.baseInfoFrom.getRawValue().centralizedPurchasing == "1"
      // ) {
      //   endUserinfo.get("endUser").clearValidators();
      //   endUserinfo.get("endUserTaxNum").clearValidators();
      //   endUserinfo.get("endUserAddress").clearValidators();
      //   endUserinfo.get("endUserPhone").clearValidators();
      //   endUserinfo.get("endUserEmail").clearValidators();
      //   endUserinfo.get("endUserContact").clearValidators();
      //   endUserinfo.get("endUserActuallyDeliveryAddress").clearValidators();

      //   endUserinfo.get("endUser").updateValueAndValidity();
      //   endUserinfo.get("endUserTaxNum").updateValueAndValidity();
      //   endUserinfo.get("endUserAddress").updateValueAndValidity();
      //   endUserinfo.get("endUserPhone").updateValueAndValidity();
      //   endUserinfo.get("endUserEmail").updateValueAndValidity();
      //   endUserinfo.get("endUserContact").updateValueAndValidity();
      //   endUserinfo
      //     .get("endUserActuallyDeliveryAddress")
      //     .updateValueAndValidity();
      //   result = false;
      // }

      return result;
    } else {
      if (orderSameEndUser == "1") {
        endUserinfo.get("segment").clearValidators();
        endUserinfo.get("segment").updateValueAndValidity();
      }
      endUserinfo.get("endUser").clearValidators();
      endUserinfo.get("endUserTaxNum").clearValidators();
      endUserinfo.get("endUserAddress").clearValidators();
      endUserinfo.get("endUserPhone").clearValidators();
      endUserinfo.get("endUserEmail").clearValidators();
      endUserinfo.get("endUserContact").clearValidators();
      endUserinfo.get("endUserActuallyDeliveryAddress").clearValidators();

      endUserinfo.get("endUser").updateValueAndValidity();
      endUserinfo.get("endUserTaxNum").updateValueAndValidity();
      endUserinfo.get("endUserAddress").updateValueAndValidity();
      endUserinfo.get("endUserPhone").updateValueAndValidity();
      endUserinfo.get("endUserEmail").updateValueAndValidity();
      endUserinfo.get("endUserContact").updateValueAndValidity();
      endUserinfo
        .get("endUserActuallyDeliveryAddress")
        .updateValueAndValidity();
      return false;
    }
  }
  isEndUserSimilar(index) {
    const {
      endUser,
      endUserId,
      endUserSapCode,
      endUserTaxNum,
      hospitalType,
      endUserActuallyDeliveryAddress,
      segment,
      endUserAddress,
      endUserPhone,
      endUserEmail,
      endUserContact,
      usHta,
    } = this.endUserFrom.getRawValue();
    const endUserinfo = this.orderInfo
      .at(index)
      .get("endUserinfo") as FormGroup;
    const { orderSameEndUser } = endUserinfo.getRawValue();
    const orderSalesinfo = this.orderInfo
      .at(index)
      .get("orderSalesinfo") as FormGroup;
    let orderSales = orderSalesinfo.getRawValue().orderSales;
    const { centralizedPurchasing } = this.baseInfoFrom.getRawValue();
    //const filter = /[\u4E00-\u9FA5\uF900-\uFA2D]{1,}/;
    //filter.test(orderSales) && (orderSales = stringIndexof(orderSales));
    this.isEnduser(index);
    if (orderSameEndUser == "1") {
      endUserinfo.patchValue({
        endUser,
        endUserId,
        endUserSapCode,
        endUserTaxNum,
        hospitalType,
        segment,
        endUserAddress,
        endUserPhone,
        endUserEmail,
        endUserContact,
        usHta,
      });
    } else if (orderSameEndUser == "0" && orderSales == this.user) {
      endUserinfo.get("endUserAddress").enable();
      endUserinfo.get("endUserPhone").enable();
      endUserinfo.get("endUserEmail").enable();
      endUserinfo.get("endUserContact").enable();
      endUserinfo.get("endUserActuallyDeliveryAddress").enable();
      if (centralizedPurchasing !== "1") {
        endUserinfo.patchValue({
          endUser: "",
          endUserId: "",
          endUserSapCode: "",
          endUserTaxNum: "",
          hospitalType: "",
          segment: "",
          endUserAddress: "",
          endUserPhone: "",
          endUserEmail: "",
          endUserContact: "",
          usHta: "",
        });
      }
    }
  }
  dDpstatusvalid(control: FormGroup) {
    const sample = control.value;
    return sample != "通过" ? { sampleCheck: true } : null;
  }
  isForeginSimilar(index) {
    //外贸公司与基础信息是否相同的必填字段验证

    const foreignInfo = this.orderInfo
      .at(index)
      .get("foreignInfo") as FormGroup;
    const orderSalesinfo = this.orderInfo
      .at(index)
      .get("orderSalesinfo") as FormGroup;
    const {
      foreignTradeCorpSameDealer,
      foreignTradeCorpSapCode,
      foreignTradeCorpDdpStatus,
      foreignTradeCorpDdpValidityDate,
      foreignTradeCorpTaxNum,
      foreignTradeCorpAddress,
      companyNotInIePool,
      foreignTradeCorpName,
      foreignTradeCorpPhone,
      foreignTradeCorpContact,
      foreignTradeCorpEmail,
      importAgreementSignName,
      importAgreementSignPosition,
    } = this.foreignFrom.getRawValue();
    let orderSales = orderSalesinfo.getRawValue().orderSales;
    //const filter = /[\u4E00-\u9FA5\uF900-\uFA2D]{1,}/;
    //filter.test(orderSales) && (orderSales = stringIndexof(orderSales));
    const { orderSameForeignTradeCorp } = foreignInfo.getRawValue();
    if (
      orderSameForeignTradeCorp == "0" &&
      this.flag != "1" &&
      orderSales == this.user
    ) {
      foreignInfo.get("foreignTradeCorpName").enable();
      foreignInfo.get("foreignTradeCorpSameDealer").enable();
      foreignInfo.get("foreignTradeCorpSapCode").enable();
      foreignInfo.get("foreignTradeCorpTaxNum").enable();
      foreignInfo.get("foreignTradeCorpAddress").enable();
      foreignInfo.get("foreignTradeCorpPhone").enable();
      foreignInfo.get("foreignTradeCorpContact").enable();
      foreignInfo.get("foreignTradeCorpEmail").enable();
      foreignInfo.get("importAgreementSignName").enable();
      foreignInfo.get("importAgreementSignPosition").enable();
      foreignInfo.get("foreignTradeCorpDdpStatus").enable();
      foreignInfo
        .get("foreignTradeCorpName")
        .setValidators(Validators.required);
      foreignInfo
        .get("foreignTradeCorpDdpStatus")
        .setValidators([this.dDpstatusvalid, Validators.required]);
      // foreignInfo.get('foreignTradeCorpDdpStatus').markAsDirty();
      // foreignInfo.get('foreignTradeCorpSapCode').setValidators(Validators.required);
      foreignInfo
        .get("foreignTradeCorpTaxNum")
        .setValidators(Validators.required);
      foreignInfo
        .get("foreignTradeCorpAddress")
        .setValidators(Validators.required);
      foreignInfo
        .get("foreignTradeCorpContact")
        .setValidators(Validators.required);
      foreignInfo
        .get("foreignTradeCorpEmail")
        .setValidators(Validators.required);
      foreignInfo
        .get("importAgreementSignName")
        .setValidators(Validators.required);
      foreignInfo
        .get("importAgreementSignPosition")
        .setValidators(Validators.required);
      foreignInfo
        .get("foreignTradeCorpPhone")
        .setValidators(Validators.required);
      foreignInfo
        .get("foreignTradeCorpDdpValidityDate")
        .setValidators(Validators.required);
      foreignInfo.patchValue({
        foreignTradeCorpSameDealer: foreignTradeCorpSameDealer,
        foreignTradeCorpSapCode: foreignTradeCorpSapCode,
        foreignTradeCorpDdpStatus: foreignTradeCorpDdpStatus,
        foreignTradeCorpDdpValidityDate: foreignTradeCorpDdpValidityDate,
        foreignTradeCorpTaxNum: foreignTradeCorpTaxNum,
        foreignTradeCorpAddress: foreignTradeCorpAddress,
        companyNotInIePool: companyNotInIePool,
        foreignTradeCorpName: foreignTradeCorpName,
        foreignTradeCorpPhone: foreignTradeCorpPhone,
        foreignTradeCorpContact: foreignTradeCorpContact,
        foreignTradeCorpEmail: foreignTradeCorpEmail,
        importAgreementSignName: importAgreementSignName,
        importAgreementSignPosition: importAgreementSignPosition,
      });
    } else {
      foreignInfo.patchValue({
        foreignTradeCorpSameDealer: foreignTradeCorpSameDealer,
        foreignTradeCorpSapCode: foreignTradeCorpSapCode,
        foreignTradeCorpDdpStatus: foreignTradeCorpDdpStatus,
        foreignTradeCorpDdpValidityDate: foreignTradeCorpDdpValidityDate,
        foreignTradeCorpTaxNum: foreignTradeCorpTaxNum,
        foreignTradeCorpAddress: foreignTradeCorpAddress,
        companyNotInIePool: companyNotInIePool,
        foreignTradeCorpName: foreignTradeCorpName,
        foreignTradeCorpPhone: foreignTradeCorpPhone,
        foreignTradeCorpContact: foreignTradeCorpContact,
        foreignTradeCorpEmail: foreignTradeCorpEmail,
        importAgreementSignName: importAgreementSignName,
        importAgreementSignPosition: importAgreementSignPosition,
      });
      foreignInfo.get("foreignTradeCorpName").clearValidators();
      foreignInfo.get("foreignTradeCorpSapCode").clearValidators();
      foreignInfo.get("foreignTradeCorpTaxNum").clearValidators();
      foreignInfo.get("foreignTradeCorpAddress").clearValidators();
      foreignInfo.get("foreignTradeCorpContact").clearValidators();
      foreignInfo.get("foreignTradeCorpEmail").clearValidators();
      foreignInfo.get("importAgreementSignName").clearValidators();
      foreignInfo.get("importAgreementSignPosition").clearValidators();
      foreignInfo.get("foreignTradeCorpDdpValidityDate").clearValidators();
      foreignInfo.get("foreignTradeCorpPhone").clearValidators();
      foreignInfo.get("foreignTradeCorpDdpStatus").clearValidators();
    }

    foreignInfo.get("foreignTradeCorpName").updateValueAndValidity();
    foreignInfo.get("foreignTradeCorpSapCode").updateValueAndValidity();
    foreignInfo.get("foreignTradeCorpTaxNum").updateValueAndValidity();
    foreignInfo.get("foreignTradeCorpAddress").updateValueAndValidity();
    foreignInfo.get("foreignTradeCorpContact").clearValidators();
    foreignInfo.get("foreignTradeCorpEmail").updateValueAndValidity();
    foreignInfo.get("importAgreementSignName").updateValueAndValidity();
    foreignInfo.get("importAgreementSignPosition").updateValueAndValidity();
    foreignInfo.get("foreignTradeCorpDdpValidityDate").updateValueAndValidity();
    foreignInfo.get("foreignTradeCorpPhone").updateValueAndValidity();
    foreignInfo.get("foreignTradeCorpDdpStatus").updateValueAndValidity();
  }
  // showMagnetic(i) {
  //   //磁屏蔽公司必填
  //   return this.showHost(i, 'MR', 'magneticResonanceShieldingFile');
  // }
  // showIgts(i) {
  //   //igt必填项
  //   return this.showHost(i, "IGT-S", 'igtThirdPartyFile');
  // }
  showMagneticResonanceShieldingFileHost(i) {
    const marketBundleInfo = this.orderInfo
      .at(i)
      .get("marketBundleInfo") as FormArray;
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const marketBundleInfoData = marketBundleInfo.getRawValue();
    const orderModality = orderBaseinfo.getRawValue().orderModality;

    if (
      orderModality == "PD&IGT" &&
      marketBundleInfoData &&
      marketBundleInfoData.length > 0
    ) {
      const host = marketBundleInfoData.find(
        (val) => val.primaryOpportunity == "true"
      );
      if (host && host.marketBundleBmc == "MR") {
        orderBaseinfo
          .get("magneticResonanceShieldingFile")
          .setValidators(Validators.required);
        orderBaseinfo.patchValue({
          magneticResonanceShieldingShow: true,
        });
      } else {
        orderBaseinfo.get("magneticResonanceShieldingFile").clearValidators();
        orderBaseinfo.patchValue({
          magneticResonanceShieldingShow: false,
        });
      }
      orderBaseinfo
        .get("magneticResonanceShieldingFile")
        .updateValueAndValidity();
    }
  }
  showigtThirdPartyFileHost(i) {
    const marketBundleInfo = this.orderInfo
      .at(i)
      .get("marketBundleInfo") as FormArray;
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const marketBundleInfoData = marketBundleInfo.getRawValue();
    const orderModality = orderBaseinfo.getRawValue().orderModality;
    if (
      orderModality == "PD&IGT" &&
      marketBundleInfoData &&
      marketBundleInfoData.length > 0
    ) {
      const host = marketBundleInfoData.find(
        (val) => val.primaryOpportunity == "true"
      );
      if (
        host &&
        (host.marketBundleBmc == "IGT-S" || host.marketBundleBmc == "IGT-MoS")
      ) {
        orderBaseinfo.patchValue({
          igtThirdPartyFileShow: true,
        });
      } else {
        orderBaseinfo.patchValue({
          igtThirdPartyFileShow: false,
        });
      }
      orderBaseinfo.get("igtThirdPartyFile").updateValueAndValidity();
    }
  }
  igtChang(i) {
    //igt选择是，否 是为必填项
    const marketBundleInfo = this.orderInfo
      .at(i)
      .get("marketBundleInfo") as FormArray;
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const marketBundleInfoData = marketBundleInfo.getRawValue();
    const { orderModality, igtThirdPartySingle } = orderBaseinfo.getRawValue();
    if (orderModality == "PD&IGT") {
      if (igtThirdPartySingle == "1") {
        orderBaseinfo
          .get("igtThirdPartyFile")
          .setValidators(Validators.required);
      } else {
        orderBaseinfo.patchValue({
          igtThirdPartyFile: [],
        });
        orderBaseinfo.get("igtThirdPartyFile").clearValidators();
      }
      orderBaseinfo.get("igtThirdPartyFile").updateValueAndValidity();
    }
  }
  selecthost(i) {
    this.showMagneticResonanceShieldingFileHost(i);
    this.showigtThirdPartyFileHost(i);
  }
  actualSalesSetValidators(i) {
    //是否集采项目

    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const orderSalesinfo = this.orderInfo
      .at(i)
      .get("orderSalesinfo") as FormGroup;
    const ordercentralizedPurchasing =
      orderBaseinfo.getRawValue().centralizedPurchasing;

    const { orderSales } = orderSalesinfo.getRawValue();
    var sales = orderSales ? orderSales.toString() : "";
    var user = this.user.toString();
    const isSame =
      sales.length == user.length && sales.toLowerCase() == user.toLowerCase();
    if (ordercentralizedPurchasing == "1" && isSame) {
      orderSalesinfo.get("actualSalesEmail").setValidators(Validators.required);
      orderSalesinfo.get("actualSalesEmail").markAsDirty();
      orderSalesinfo.get("actualSalesEmail").updateValueAndValidity();
    } else {
      orderSalesinfo.get("actualSalesEmail").clearValidators();
      orderSalesinfo.get("actualSalesEmail").markAsDirty();
      orderSalesinfo.get("actualSalesEmail").updateValueAndValidity();
    }
  }
  centralizedPurchasingChange($event, i) {
    //判断切换是否集采项目
    this.actualSalesSetValidators(i);
  }
  isSolutionSale(i) {
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const marketBundleInfo = this.orderInfo
      .at(i)
      .get("marketBundleInfo") as FormArray;
    const modality = orderBaseinfo.getRawValue().orderModality;
    const marketBundleInfos = marketBundleInfo.getRawValue();
    const host = marketBundleInfos.find(
      (val) => val.primaryOpportunity == "true"
    );
    if (modality == "PD&IGT" && host && host.businessOpportunityHierarchyLink) {
      return true;
    } else {
      return false;
    }
  }
  isSolution(i) {
    //是否包含Solution
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const marketBundleInfo = this.orderInfo
      .at(i)
      .get("marketBundleInfo") as FormArray;
    const modality = orderBaseinfo.getRawValue().orderModality;
    const marketBundleInfos = marketBundleInfo.getRawValue();
    if (modality == "US") {
      orderBaseinfo.get("includeSolution").setValidators(Validators.required);
      orderBaseinfo.get("includeSolution").updateValueAndValidity();
      return true;
    } else {
      orderBaseinfo.get("includeSolution").clearValidators();
      orderBaseinfo.get("includeSolution").updateValueAndValidity();
      return false;
    }
  }
  ifInstallDate(i) {
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const modality = orderBaseinfo.getRawValue().orderModality;
    this.ifrequiredFile(i);
    if (modality == "US" || modality == "CC") {
      orderBaseinfo.patchValue({
        estimateInstallationRequired: true,
      });
    } else {
      orderBaseinfo.patchValue({
        estimateInstallationRequired: false,
      });
    }
  }
  ifrequiredFile(i) {
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const modality = orderBaseinfo.getRawValue().orderModality;
    if (modality == "US") {
      orderBaseinfo
        .get("dealerRequestLetterFile")
        .setValidators(Validators.required);
      orderBaseinfo.get("cpclFile").setValidators(Validators.required);
      orderBaseinfo.patchValue({
        dealerRequestLetterRequired: true,
      });
    } else {
      orderBaseinfo.get("dealerRequestLetterFile").clearValidators();
      orderBaseinfo.get("cpclFile").clearValidators();
      orderBaseinfo.patchValue({
        dealerRequestLetterRequired: false,
      });
    }
    orderBaseinfo.get("dealerRequestLetterFile").updateValueAndValidity();
    orderBaseinfo.get("cpclFile").updateValueAndValidity();
  }
  ifrequiredshow(i) {
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const modality = orderBaseinfo.getRawValue().orderModality;

    if (modality == "US" || modality == "CC") {
      orderBaseinfo.patchValue({
        requiredArrivalDateRequired: true,
      });
    } else {
      orderBaseinfo.patchValue({
        requiredArrivalDateRequired: false,
      });
    }
  }
  ifrequiredDate(i) {
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const modality = orderBaseinfo.getRawValue().orderModality;
    if (modality == "US") {
      orderBaseinfo
        .get("requiredArrivalDate")
        .setValidators(Validators.required);
      orderBaseinfo
        .get("estimateInstallationDate")
        .setValidators(Validators.required);
      orderBaseinfo.get("requiredArrivalDate").updateValueAndValidity();
      orderBaseinfo.get("estimateInstallationDate").updateValueAndValidity();
      return true;
    } else {
      orderBaseinfo.get("requiredArrivalDate").clearValidators();
      orderBaseinfo.get("estimateInstallationDate").clearValidators();
      orderBaseinfo.get("requiredArrivalDate").updateValueAndValidity();
      orderBaseinfo.get("estimateInstallationDate").updateValueAndValidity();
      return false;
    }
  }
  // isReferenceSo(i) {
  //   //是否显示ReferenceSo
  //   const orderBaseinfo = this.orderInfo.at(i).get("orderBaseinfo") as FormGroup;
  //   const modality = orderBaseinfo.getRawValue().orderModality;
  //   if (modality == 'US' || modality == 'CC') {
  //     return true;
  //   }
  //   else {
  //     return false;
  //   }
  // }
  /**
   * @event 当前值，
   * @i 当前index
   * @order 当前group
   * @item 必填字段
   */
  performanceBondChange(event, i, order, item) {
    //主要条款和其它条款必填验证
    const mainTrems = this.orderInfo.at(i).get(order) as FormGroup;
    const standard = mainTrems.getRawValue()[event];
    if (standard == 1) {
      mainTrems.get(item).setValidators(Validators.required);
      mainTrems.get(item).markAsDirty();
      mainTrems.get(item).updateValueAndValidity();
      //return true
    } else {
      mainTrems.get(item).clearValidators();
      mainTrems.get(item).updateValueAndValidity();
      //return false;
    }
  }
  changPaymentProvision(event, i) {
    const mainTrems = this.orderInfo.at(i).get("mainTrems") as FormGroup;
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const { paymentProvision } = mainTrems.getRawValue();
    const {
      paymentCnyCp,
      paymentNetCnyCp,
      paymentUsdCp,
      creditCnyCp,
      creditCnyNetCp,
      creditUsdCp,
    } = orderBaseinfo.getRawValue();
    if (paymentProvision == "远期信用证（请在备注处注明信用证期限及开证行）") {
      orderBaseinfo.patchValue({
        paymentCny: 0,
        paymentNetCny: 0,
        paymentUsd: 0,
      });
    } else {
      orderBaseinfo.patchValue({
        paymentCny: paymentCnyCp,
        paymentNetCny: paymentNetCnyCp,
        paymentUsd: paymentUsdCp,
      });
    }
    if (paymentProvision == "其他（请在备注处描述实际付款方式）") {
      orderBaseinfo.patchValue({
        creditCny: 0,
        creditCnyNet: 0,
        creditUsd: 0,
      });
    } else {
      orderBaseinfo.patchValue({
        creditCny: creditCnyCp,
        creditCnyNet: creditCnyNetCp,
        creditUsd: creditUsdCp,
      });
    }
    if (
      paymentProvision != "其他（请在备注处描述实际付款方式）" &&
      paymentProvision != "远期信用证（请在备注处注明信用证期限及开证行）"
    ) {
      orderBaseinfo.patchValue({
        creditCny: 0,
        creditCnyNet: 0,
        creditUsd: 0,
        paymentCny: 0,
        paymentNetCny: 0,
        paymentUsd: 0,
      });
    }
    this.orderPriceCountCnyOther(i);
  }

  provisionChang(i) {
    //付款条款
    const mainTrems = this.orderInfo.at(i).get("mainTrems") as FormGroup;
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const {
      paymentCnyCp,
      paymentNetCnyCp,
      paymentUsdCp,
      creditCnyCp,
      creditCnyNetCp,
      creditUsdCp,
    } = orderBaseinfo.getRawValue();
    mainTrems.get("paymentProvision").setValidators([Validators.required]);
    mainTrems.get("paymentProvision").markAsDirty();
    mainTrems.get("paymentProvision").updateValueAndValidity();
    const { paymentProvision } = mainTrems.getRawValue();
    if (paymentProvision == "其他（请在备注处描述实际付款方式）") {
      mainTrems
        .get("paymentProvisionRemarks")
        .setValidators(Validators.required);
      mainTrems.get("paymentProvisionRemarks").markAsDirty();
      mainTrems.get("paymentProvisionRemarks").updateValueAndValidity();
    } else {
      mainTrems.get("paymentProvisionRemarks").clearValidators();
    }
    mainTrems.get("paymentProvisionRemarks").updateValueAndValidity();

    return true;
  }
  isOtherTrain(i) {
    //其他条款是否必填*
    const otherTerms = this.orderInfo.at(i).get("otherTerms") as FormGroup;
    const {
      otherTrain,
      otherFine,
      otherIp,
      otherContractTemplate,
      otherOcap,
      other,
    } = otherTerms.getRawValue();
    if (
      otherTrain == true ||
      otherFine == true ||
      otherIp == true ||
      otherContractTemplate == true ||
      otherOcap == true ||
      other == true
    ) {
      otherTerms.get("otherRemarks").setValidators(Validators.required);
      otherTerms.get("otherRemarks").markAsDirty();
      otherTerms.get("otherRemarks").updateValueAndValidity();
      return true;
    } else {
      otherTerms.get("otherRemarks").clearValidators();
      otherTerms.get("otherRemarks").updateValueAndValidity();
      return false;
    }
  }
  projectAnaly() {
    //项目分析表的显示与否
    const biddingType = this.baseInfoFrom.getRawValue().biddingType; //招标类型
    if (this.baseInfoFrom.getRawValue().businessModel == "DISTRIBUTOR") {
      return true;
    } else {
      return false;
    }
  }

  foreignSample(event, i) {
    //外贸公司与经销商相同

    const foreignFrom = this.orderInfo.at(i).get("foreignInfo") as FormGroup;
    if (event === null || event === undefined || event === "") {
      return;
    }
    if (event == true) {
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
      } = this.dealerFrom.getRawValue();
      foreignFrom.patchValue({
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
      });
      foreignFrom.get("foreignTradeCorpSapCode").disable();
      foreignFrom.get("foreignTradeCorpDdpValidityDate").disable();
      foreignFrom.get("foreignTradeCorpTaxNum").disable();
      const foreignTradeCorpName = foreignFrom.getRawValue();
      const select = this.service.iepoolLists.find(
        (val) => val.corporateName == foreignTradeCorpName
      );
      foreignFrom.patchValue({
        companyNotInIePool: select ? false : true,
      });
    } else {
      foreignFrom.get("foreignTradeCorpSapCode").enable();
      foreignFrom.get("foreignTradeCorpDdpValidityDate").enable();
      foreignFrom.get("foreignTradeCorpTaxNum").enable();
    }
  }
  foreignKeyup(val, i) {
    //外贸公司输入值
    const foreignFrom = this.orderInfo.at(i).get("foreignInfo") as FormGroup;
    const { foreignTradeCorpName } = foreignFrom.getRawValue();
    const select = this.service.iepoolLists.find(
      (vals) => vals.corporateName == foreignTradeCorpName
    );
    if (select) {
      this.onForignselect(select);
      foreignFrom.patchValue({
        companyNotInIePool: false,
      });
    } else {
      foreignFrom.patchValue({
        companyNotInIePool: true,
      });
    }
    if (select && this.flag != 1) {
      foreignFrom.get("foreignTradeCorpDdpValidityDate").disable();
      foreignFrom.get("foreignTradeCorpSapCode").disable();
    } else {
      foreignFrom.get("foreignTradeCorpDdpValidityDate").enable();
      foreignFrom.get("foreignTradeCorpSapCode").enable();
    }
  }

  isAutoChange = false;
  changForeignDate(val, i) {
    if (!this.isAutoChange) {
      //日期选择
      const foreignFrom = this.orderInfo.at(i).get("foreignInfo") as FormGroup;
      if (
        this.status == null ||
        this.status == undefined ||
        this.status == "" ||
        this.status == "ecos_oit_deal_resubmit" ||
        this.status == "ecos_oit_deal_submit" ||
        this.status == "ecos_status_draft" ||
        this.status == "ecos_oit_order_submit" ||
        this.status == "ecos_oit_order_resubmit" ||
        this.status == "ecos_oit_deal_sales"
      ) {
        if (val === undefined || val === "") {
          return;
        }

        let date, ddpStatus;
        if (val) {
          date = standardTime(val);
          ddpStatus = isadopt(date);
        }
        foreignFrom.patchValue({
          foreignTradeCorpDdpStatus: ddpStatus,
        });
        const { foreignTradeCorpName } = foreignFrom.getRawValue();
        var select = false;
        if (val) {
          select = this.service.iepoolLists.find(
            (val) => val.corporateName == foreignTradeCorpName
          );
        }
        !select && this.flag != 1
          ? foreignFrom.get("foreignTradeCorpDdpValidityDate").enable()
          : foreignFrom.get("foreignTradeCorpDdpValidityDate").disable();
      }
    }
    this.isAutoChange = false;
  }
  foreignformShow(i) {
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const orderSalesinfo = this.orderInfo
      .at(i)
      .get("orderSalesinfo") as FormGroup;
    const foreignFrom = this.orderInfo.at(i).get("foreignInfo") as FormGroup;
    const { orderSales } = orderSalesinfo.getRawValue();
    if (orderBaseinfo.getRawValue().currencySystem == "USD") {
      const { foreignTradeCorpSameDealer } = foreignFrom.getRawValue();
      if (
        foreignTradeCorpSameDealer == true &&
        this.user == orderSales &&
        (this.status == "ecos_oit_deal_sales" ||
          this.status == "ecos_oit_deal_resubmit" ||
          this.status == "" ||
          this.status == undefined ||
          this.status == "ecos_status_draft") &&
        this.flag != "1"
      ) {
        foreignFrom.get("foreignTradeCorpSapCode").disable();
        foreignFrom.get("foreignTradeCorpDdpValidityDate").disable();
        foreignFrom.get("foreignTradeCorpTaxNum").disable();
      }
      // else{
      //   this.foreignFrom.get("foreignTradeCorpSapCode").enable();
      //   this.foreignFrom.get("foreignTradeCorpDdpValidityDate").enable();
      //   this.foreignFrom.get("foreignTradeCorpTaxNum").enable();
      // }
      return true;
    } else {
      return false;
    }
  }
  showVatInfo(i) {
    //开票信息显示与否
    const { currencySystem } = this.priceApproval.getRawValue();
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const orderCurrencySystem = orderBaseinfo.getRawValue().currencySystem;
    if (currencySystem == "USD" && orderCurrencySystem == "CNY") {
      return true;
    } else {
      return false;
    }
  }
  isVatInfo(i) {
    //开票信息是否必填
    const { currencySystem } = this.priceApproval.getRawValue();
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const accountFrom = this.orderInfo.at(i).get("accountFrom") as FormGroup;
    const orderCurrencySystem = orderBaseinfo.getRawValue().currencySystem;
    const orderModality = orderBaseinfo.getRawValue().orderModality;
    if (
      currencySystem == "USD" &&
      orderCurrencySystem == "CNY" &&
      orderModality == "PD&IGT"
    ) {
      accountFrom.get("accountName").setValidators(Validators.required);
      accountFrom.get("bankName").setValidators(Validators.required);
      accountFrom.get("accountNo").setValidators(Validators.required);
      accountFrom.get("registrationAddress").setValidators(Validators.required);
      accountFrom.get("accountPhoneFax").setValidators(Validators.required);
      accountFrom.get("recipient").setValidators(Validators.required);
      accountFrom.get("recipientPhone").setValidators(Validators.required);
      accountFrom.get("taxNum").setValidators(Validators.required);
      accountFrom
        .get("invoicesDeliverAddress")
        .setValidators(Validators.required);
      accountFrom.get("accountName").updateValueAndValidity();
      accountFrom.get("bankName").updateValueAndValidity();
      accountFrom.get("accountNo").updateValueAndValidity();
      accountFrom.get("registrationAddress").updateValueAndValidity();
      accountFrom.get("accountPhoneFax").updateValueAndValidity();
      accountFrom.get("recipient").updateValueAndValidity();
      accountFrom.get("recipientPhone").updateValueAndValidity();
      accountFrom.get("taxNum").updateValueAndValidity();
      accountFrom.get("invoicesDeliverAddress").updateValueAndValidity();
      return true;
    } else {
      accountFrom.get("accountName").clearValidators();
      accountFrom.get("bankName").clearValidators();
      accountFrom.get("accountNo").clearValidators();
      accountFrom.get("registrationAddress").clearValidators();
      accountFrom.get("accountPhoneFax").clearValidators();
      accountFrom.get("recipient").clearValidators();
      accountFrom.get("recipientPhone").clearValidators();
      accountFrom.get("taxNum").clearValidators();
      accountFrom.get("invoicesDeliverAddress").clearValidators();
      accountFrom.get("accountName").updateValueAndValidity();
      accountFrom.get("bankName").updateValueAndValidity();
      accountFrom.get("accountNo").updateValueAndValidity();
      accountFrom.get("registrationAddress").updateValueAndValidity();
      accountFrom.get("accountPhoneFax").updateValueAndValidity();
      accountFrom.get("recipient").updateValueAndValidity();
      accountFrom.get("recipientPhone").updateValueAndValidity();
      accountFrom.get("taxNum").updateValueAndValidity();
      accountFrom.get("invoicesDeliverAddress").updateValueAndValidity();
      return false;
    }
  }
  generateAnalysisTemplate(code, i) {
    //打开项目分析表

    let orderInfo = this.orderInfo.getRawValue();
    let MarketBundleImges = "";
    let marketProduct = [];
    let cpOrderConfigId: any = [];
    let cpProductId: any = [];
    const {
      tenderNum,
      biddingCompany,
      dealFormId,
      estimBiddingPrice,
      biddingApplyList,
      dealerProfit,
      biddingCurrency,
      profitNetRate,
      profitGrossRate,
      profitGross,
    } = this.baseInfoFrom.getRawValue();
    /**
     * profitNetRate 经销商净利润,
     * dealerProfit 经销商净利润率,
     * profitGrossRate 经销商毛利率
     * profitGross 经销商毛利润,
     * 更改为cp带入，不再在此计算
     */
    const { endUser } = this.endUserFrom.getRawValue();
    const {
      currencySystem,
      dealPriceCny,
      dealPriceUsd,
      equipmentPriceCny,
      equipmentPriceUsd,
      dealerSelfPurchasePriceCny,
      dealerSelfPurchasePriceUsd,
    } = this.priceApproval.getRawValue();

    /** //改为cp带入，此处计算过程注销
    const equipmentPrice = currencySystem == 'CNY' ? equipmentPriceCny : equipmentPriceUsd;
    const dealerSelfPurchase = currencySystem == 'CNY' ? dealerSelfPurchasePriceCny : dealerSelfPurchasePriceUsd;

    let agentGrossProfitMargin: any;
    let agentGrossProfit: any = floatSub(equipmentPrice, estimBiddingPrice); //毛利润
    agentGrossProfit = Number(agentGrossProfit).toFixed(2);
    agentGrossProfit = returnFloat(agentGrossProfit, 2)
    let agentProfit: any = floatSub(agentGrossProfit, dealerSelfPurchase); //净利润
    agentProfit = Number(agentProfit).toFixed(2);
    agentProfit = returnFloat(agentProfit, 2)
    agentProfit = returnFloat(agentProfit, 2)
    let agentNetInterestRate: any;
    const isNullList = [0, '0', null, undefined, ""];
    if (!isNullList.includes(estimBiddingPrice)) {
      agentGrossProfitMargin = floatDivide(agentGrossProfit, estimBiddingPrice); //毛利率
      agentGrossProfitMargin = returnFloat(agentGrossProfitMargin, 2)
      agentGrossProfitMargin = `${agentGrossProfitMargin}%`;

      agentNetInterestRate = floatDivide(agentProfit, estimBiddingPrice); //净利润率
      agentNetInterestRate = returnFloat(agentNetInterestRate, 2)
      agentNetInterestRate = `${agentNetInterestRate}%`;
    }
    else {
      agentGrossProfitMargin = 0
      agentGrossProfitMargin = returnFloat(agentGrossProfitMargin, 2);
      agentGrossProfitMargin = `${agentGrossProfitMargin}%`;
      agentNetInterestRate = 0; //净利润率
      agentNetInterestRate = returnFloat(agentNetInterestRate, 2)
      agentNetInterestRate = `${agentNetInterestRate}%`;
    }
    */

    const isNullList = [0, "0", null, undefined, ""];
    let agentGrossProfit: any = !isNullList.includes(profitGross)
      ? Number(profitGross).toFixed(2)
      : 0; //经销商毛利润
    agentGrossProfit = returnFloat(agentGrossProfit, 2);

    let agentGrossProfitMargin: any; //经销商毛利率
    agentGrossProfitMargin = returnFloat(
      !isNullList.includes(profitGrossRate)
        ? Number(profitGrossRate * 100).toFixed(2)
        : 0,
      2
    );
    agentGrossProfitMargin = `${agentGrossProfitMargin}%`;

    let agentProfit: any = !isNullList.includes(profitNetRate)
      ? Number(profitNetRate).toFixed(2)
      : 0; //经销商净利润
    agentProfit = returnFloat(agentProfit, 2);

    let agentNetInterestRate: any; //经销商净利润率
    agentNetInterestRate = returnFloat(
      !isNullList.includes(dealerProfit)
        ? Number(dealerProfit * 100).toFixed(2)
        : 0,
      2
    );
    agentNetInterestRate = `${agentNetInterestRate}%`;

    orderInfo.map((val) => {
      let arr = val.marketBundleInfo.map((vals) => {
        cpOrderConfigId.push(vals.cpOrderConfigId);
        cpProductId.push(vals.cpProductId);
        return `${vals.marketBundleName}${vals.marketBundleAmount}套`;
      });
      marketProduct = [...marketProduct, ...arr];
    });
    marketProduct = removeRepeat(marketProduct);
    MarketBundleImges = marketProduct.join("、");
    cpOrderConfigId = cpOrderConfigId.join(",");
    cpProductId = cpProductId.join(",");
    const today = new Date();
    const params = {
      templateCode: code,
      dateYear: today.getFullYear(),
      dateMonth: today.getMonth() + 1,
      dateDay: today.getDate(),
      date:
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate(),
      data1:
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate(),
      endUser: endUser,
      MarketBundleImges: MarketBundleImges,
      tenderNo: tenderNum,
      tenderingCompany: biddingCompany,
      agentGrossProfit: agentGrossProfit,
      agentGrossProfitMargin: agentGrossProfitMargin,
      agentProfit: agentProfit,
      agentNetInterestRate: agentNetInterestRate,
      currencySystem,
      dealFormId: dealFormId,
      estimatedTenderPrice: estimBiddingPrice,
      equipmentTotal: currencySystem == "CNY" ? dealPriceCny : dealPriceUsd,
      cpOrderConfigId, //markbundelInfo,
      cpProductId,
      biddingId:
        biddingApplyList && biddingApplyList.length > 0
          ? biddingApplyList[0].id
          : "", //显示项目名称
    };
    this.pdfSRC = params;
    this.isPdf = true;
  }

  public isPdfCancel() {
    this.isPdf = false;
  }

  onShowSelectRefModal(i) {
    //原合同概要表id
    const orderSalesinfo = this.orderInfo
      .at(i)
      .get("orderSalesinfo") as FormGroup;
    let orderSales = orderSalesinfo.getRawValue().orderSales;
    //const filter = /[\u4E00-\u9FA5\uF900-\uFA2D]{1,}/;
    //filter.test(orderSales) && (orderSales = stringIndexof(orderSales));
    this.selectRefno.show({ applicant: orderSales }, true);
    this.index = i;
  }

  onRefnoselect(val) {
    const orderBaseinfo = this.orderInfo
      .at(this.index)
      .get("orderBaseinfo") as FormGroup;
    orderBaseinfo.patchValue({
      contractCancelReferenceId: val.referenceId,
      contractCancelApplyId: val.id,
      contractCancelSoNo: val.so,
    });
  }
  specialShow(i) {
    const { sampleCheck } = this.priceApproval.getRawValue();
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const { orderModality } = orderBaseinfo.getRawValue();
    const { oitMode, businessModel } = this.baseInfoFrom.getRawValue();
    if (
      sampleCheck == "1" ||
      (orderModality == "PD&IGT" &&
        businessModel == "DIRECT" &&
        oitMode == "BIDDING") ||
      (orderModality == "US" && businessModel == "DIRECT") ||
      (orderModality == "CC" && businessModel == "DIRECT")
    ) {
      return true;
    } else {
      return false;
    }
  }
  openGuidanceDocument() {
    const templateUrl = `${environment.base_href}/assets/template/guideDocument.pdf`;
    window.open(templateUrl);
  }
  includeSolutionChange(event, i) {
    const marketBundleInfo = this.orderInfo
      .at(i)
      .get("marketBundleInfo") as FormArray;
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const { orderModality, includeSolution } = orderBaseinfo.getRawValue();
    if (orderModality == "US") {
      if (includeSolution == "1") {
        orderBaseinfo.patchValue({
          businessOpportunityRequired: true,
        });
        marketBundleInfo.controls.forEach((val, index) => {
          const group = marketBundleInfo.at(index) as FormGroup;
          group
            .get("businessOpportunityHierarchyLink")
            .setValidators(Validators.required);
          group
            .get("businessOpportunityHierarchyLink")
            .updateValueAndValidity();
          group.patchValue({
            businessOpportunityHierarchyTitle: "如果没有,可填写N/A",
          });
        });
      } else {
        orderBaseinfo.patchValue({
          businessOpportunityRequired: false,
        });
        marketBundleInfo.controls.forEach((val, index) => {
          const group = marketBundleInfo.at(index) as FormGroup;
          group.get("businessOpportunityHierarchyLink").clearValidators();
          group
            .get("businessOpportunityHierarchyLink")
            .updateValueAndValidity();
          group.patchValue({
            businessOpportunityHierarchyTitle: "",
          });
        });
      }
    }
  }
  segmentNzRequired(i) {
    const endUserinfo = this.orderInfo.at(i).get("endUserinfo") as FormGroup;
    const orderSalesinfo = this.orderInfo
      .at(i)
      .get("orderSalesinfo") as FormGroup;
    const { orderSales } = orderSalesinfo.getRawValue();
    const { orderSameEndUser, hospitalType } = endUserinfo.getRawValue();
    if (
      orderSameEndUser == "0" &&
      orderSales == this.user &&
      this.flag != "1"
    ) {
      if (hospitalType == "公立医院" || hospitalType == "民营医院") {
        endUserinfo.get("segment").enable();
        endUserinfo.get("segment").setValidators(Validators.required);
        endUserinfo.get("segment").markAsDirty();
        this.endUserFrom.get("segment").updateValueAndValidity();
        return true;
      } else {
        endUserinfo.get("segment").clearValidators();
        endUserinfo.get("segment").updateValueAndValidity();
        return false;
      }
    }
  }
  // financialCompleted(control: FormControl) {//金融方案价格是否等于总价
  //   if (control.value) {
  //     const { financialSolutionCnyNet } = this.priceApproval.getRawValue();
  //     const summaryList = this.orderInfo.controls.map((item, index) => {
  //       const orderBaseinfo = this.orderInfo.at(index).get("orderBaseinfo") as FormGroup;
  //       return orderBaseinfo.getRawValue().financialSolutionCnyNet
  //     })
  //     const totalAmount = summaryList.reduce((a, b) =>floatAdd(Number(a),Number(b)));
  //     console.log("deal:"+financialSolutionCnyNet)
  //     console.log(totalAmount)
  //     let diff: any = floatSub(totalAmount, financialSolutionCnyNet);
  //     diff = Math.abs(diff)
  //     console.log(diff)
  //     const valid = diff > 1 ? false : true
  //     return !valid ? { financialform: true } : null
  //   }
  // }

  isRequireorderSalesPerformanceProvince(i) {
    const orderSalesinfo = this.orderInfo
      .at(i)
      .get("orderSalesinfo") as FormGroup;
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const { orderModality } = orderBaseinfo.getRawValue();
    if (
      orderModality == "US" &&
      !orderSalesinfo.get("orderSalesPerformanceProvince").disabled
    ) {
      orderSalesinfo
        .get("orderSalesPerformanceProvince")
        .setValidators(Validators.required);
      orderSalesinfo
        .get("orderSalesPerformanceProvince")
        .updateValueAndValidity();
      return true;
    } else {
      orderSalesinfo.get("orderSalesPerformanceProvince").clearValidators();
      orderSalesinfo
        .get("orderSalesPerformanceProvince")
        .updateValueAndValidity();
      return false;
    }
  }
  orderPriceCountCny(i) {
    //金融方案的计算
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const {
      orderPriceCny,
      orderPriceCnyNet,
      orderPriceUsd,

      financialSolutionCnyNet,
      financialSolutionCnyNetCp,
      financialSolutionUsd,
      financialSolutionUsdCp,

      creditUsd,
      creditUsdCp,
      creditCnyNet,
      creditCnyNetCp,

      paymentUsd,
      paymentUsdCp,
      paymentNetCny,
      paymentNetCnyCp,
      currencySystem,
    } = orderBaseinfo.getRawValue();

    if (currencySystem == "CNY") {
      const param = {
        index: i,
        financialSolution: financialSolutionCnyNet,
        financialSolutionCp: financialSolutionCnyNetCp,
        credit: creditCnyNet,
        creditCp: creditCnyNetCp,
        payment: paymentNetCny,
        paymentCp: paymentNetCnyCp,
        orderPrice: orderPriceCnyNet,
        value: "financialSolutionCnyNet",
        currencySystem,
      };
      this.financialError = this.computContralDiff(param);
    } else if (currencySystem == "USD") {
      const param = {
        index: i,
        financialSolution: financialSolutionUsd,
        financialSolutionCp: financialSolutionUsdCp,
        credit: creditUsd,
        creditCp: creditUsdCp,
        payment: paymentUsd,
        paymentCp: paymentUsdCp,
        orderPrice: orderPriceUsd,
        value: "financialSolutionUsd",
        currencySystem,
      };
      this.financialError = this.computContralDiff(param);
    }
  }

  orderPriceCountCnyOther(i) {
    const orderBaseinfo = this.orderInfo
      .at(i)
      .get("orderBaseinfo") as FormGroup;
    const {
      orderPriceCny,
      orderPriceCnyNet,
      orderPriceUsd,

      financialSolutionCnyNet,
      financialSolutionCnyNetCp,
      financialSolutionUsd,
      financialSolutionUsdCp,

      creditUsd,
      creditUsdCp,
      creditCnyNet,
      creditCnyNetCp,

      paymentUsd,
      paymentUsdCp,
      paymentNetCny,
      paymentNetCnyCp,
      currencySystem,
    } = orderBaseinfo.getRawValue();

    if (currencySystem == "CNY") {
      const param = {
        index: i,
        financialSolution: financialSolutionCnyNet,
        financialSolutionCp: financialSolutionCnyNetCp,
        credit: creditCnyNet,
        creditCp: creditCnyNetCp,
        payment: paymentNetCny,
        paymentCp: paymentNetCnyCp,
        orderPrice: orderPriceCnyNet,
        value: "financialSolutionCnyNet",
        currencySystem,
      };
      this.computContral(param);
    } else if (currencySystem == "USD") {
      const param = {
        index: i,
        financialSolution: financialSolutionUsd,
        financialSolutionCp: financialSolutionUsdCp,
        credit: creditUsd,
        creditCp: creditUsdCp,
        payment: paymentUsd,
        paymentCp: paymentUsdCp,
        orderPrice: orderPriceUsd,
        value: "financialSolutionUsd",
        currencySystem,
      };
      this.computContral(param);
    }
  }
  /**
   *
   * @param param
   * parm.index
   * parm.financialSolution  金融方案价格
   * parm.financialSolutionCp  金融方案CP价格
   * parm.credit   远期信用方案
   * parm.creditCp  远期信用方案CP价格
   * parm.payment   其他付款方式
   * parm.paymentCp  其他付款方式CP价格
   * parm.orderPrice  进单单位合同价原cp
   */

  computContral(param) {
    let summary: any = 0;
    const orderBaseinfo = this.orderInfo
      .at(param.index)
      .get("orderBaseinfo") as FormGroup;
    const financialSolutionCnyNow = -floatSub(
      Number(param.financialSolution),
      Number(param.financialSolutionCp)
    );
    const creditCnyNow = floatSub(Number(param.credit), Number(param.creditCp));
    const paymentNetCnyNow = floatSub(
      Number(param.payment),
      Number(param.paymentCp)
    );
    if (param.currencySystem == "USD") {
      summary = floatAdd(param.orderPrice, financialSolutionCnyNow);
      summary = floatAdd(summary, creditCnyNow);
      summary = floatAdd(summary, paymentNetCnyNow);
      orderBaseinfo.patchValue({
        totalContractPrice: summary,
      });
    } else {
      summary = floatAdd(param.orderPrice, financialSolutionCnyNow);
      summary = floatAdd(summary, creditCnyNow);
      summary = floatAdd(summary, paymentNetCnyNow);
      summary = floatMultiply(summary, 1.13);
      summary = fomatFloat(summary, 2);
      orderBaseinfo.patchValue({
        totalContractPrice: summary,
      });
    }
  }
  /**
   *
   * @param param
   * parm.index
   * parm.financialSolution  金融方案价格
   * parm.financialSolutionCp  金融方案CP价格
   * parm.credit   远期信用方案
   * parm.creditCp  远期信用方案CP价格
   * parm.payment   其他付款方式
   * parm.paymentCp  其他付款方式CP价格
   * parm.orderPrice  进单单位合同价原cp
   */

  computContralDiff(param) {
    this.computContral(param);
    const dealFinancialSolutionCnyNet =
      this.priceApproval.getRawValue()[param.value];
    const financialSolutionCountList = this.orderInfo.controls.map(
      (item, index) => {
        const orderBaseinfo = this.orderInfo
          .at(index)
          .get("orderBaseinfo") as FormGroup;
        const financialSolutionCnyNet =
          orderBaseinfo.getRawValue()[param.value];
        return financialSolutionCnyNet;
      }
    );
    const totalAmount = financialSolutionCountList.reduce((a, b) =>
      floatAdd(Number(a), Number(b))
    );
    let diff: any = floatSub(totalAmount, Number(dealFinancialSolutionCnyNet));
    diff = Math.abs(diff);
    const financialError = diff > 1 ? true : false;
    return financialError;
  }
  /**
   *  自动填充实际医院信息
   */
  setActualHospital() {
    const { centralizedPurchasing } = this.baseInfoFrom.getRawValue();
    if (
      (this.status == undefined ||
        this.status == "" ||
        this.status == "ecos_oit_deal_sales" ||
        this.status == "ecos_oit_deal_submit" ||
        this.status == "ecos_oit_deal_resubmit" ||
        this.status == "ecos_status_draft") &&
      (this.flag == "0" || this.flag == undefined) &&
      centralizedPurchasing == "1"
    ) {
      // Order是否有值
      let promiseArr = [];
      this.orderInfo.controls.forEach((order, index) => {
        const orderBaseinfo = this.orderInfo
          .at(index)
          .get("orderBaseinfo") as FormGroup;
        const orderSalesinfo = this.orderInfo
          .at(index)
          .get("orderSalesinfo") as FormGroup;
        const endUserinfo = this.orderInfo
          .at(index)
          .get("endUserinfo") as FormGroup;
        const actualHospitalId = orderBaseinfo.getRawValue().actualHospitalId;
        const orderModality = orderBaseinfo.getRawValue().orderModality;
        const orderSameEndUser = endUserinfo.getRawValue().orderSameEndUser;
        const endUser = endUserinfo.getRawValue().endUser;
        let orderSales = orderSalesinfo.getRawValue().orderSales;
        // endUser未设置的情况才填充
        if (!!!endUser) {
          // 实际落地医院有值得情况
          if (!!actualHospitalId) {
            endUserinfo.patchValue({
              orderSameEndUser: "0",
            });
            let orderModalityList = [orderModality].filter(i=>i)
            if(orderModalityList.length===0){
              orderModalityList = ["PD&IGT"]
            }
            promiseArr[index] = this.http
              .post("/act/ecoscdcustomer/findByPage", {
                no: actualHospitalId,
                modality: orderModalityList,
              })
              .toPromise();
          } else {
            endUserinfo.reset();
            endUserinfo.patchValue({
              orderSameEndUser: "1",
            });
            const {
              endUser,
              endUserId,
              endUserSapCode,
              endUserTaxNum,
              hospitalType,
              endUserActuallyDeliveryAddress,
              segment,
              endUserAddress,
              endUserPhone,
              endUserEmail,
              endUserContact,
              usHta,
            } = this.endUserFrom.getRawValue();
            endUserinfo.patchValue({
              endUser,
              endUserId,
              endUserSapCode,
              endUserTaxNum,
              hospitalType,
              segment,
              endUserAddress,
              endUserPhone,
              endUserEmail,
              endUserContact,
              usHta,
            });
          }
        }

        // 如果不相等，则启用手动填写
        if (orderSameEndUser == "0" && orderSales == this.user) {
          endUserinfo.get("endUserAddress").enable();
          endUserinfo.get("endUserPhone").enable();
          endUserinfo.get("endUserEmail").enable();
          endUserinfo.get("endUserContact").enable();
          endUserinfo.get("endUserActuallyDeliveryAddress").enable();
        } else {
          endUserinfo.get("endUserAddress").disable();
          endUserinfo.get("endUserPhone").disable();
          endUserinfo.get("endUserEmail").disable();
          endUserinfo.get("endUserContact").disable();
          endUserinfo.get("endUserActuallyDeliveryAddress").disable();
        }
      });

      Promise.all(promiseArr)
        .then((resultArr) => {
          console.log("resultArr", resultArr);
          resultArr.map(({ code = null, data = null }, index) => {
            if (code === "0000") {
              const { rows } = data;
              if (rows.length > 0) {
                const hospitalInfo = rows.map((row) => {
                  if (row.category && row.category.split(";").length === 1) {
                    row.category = row.category.split(":")[1];
                  }
                  return row;
                })[0];
                this.handleHospitalSelected(index, hospitalInfo);
              }
            }
          });
        })
        .then(() => {
          this.service.paymentAction(this.formValue);
        });
    }
  }
}
