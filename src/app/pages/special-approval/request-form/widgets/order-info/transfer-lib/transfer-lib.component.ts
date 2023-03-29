import {
  Component,
  OnInit,
  Input,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";

import {
  Hospital,
  SelectHospitalComponent,
} from "../../select-hospital/select-hospital.component";
import {
  Reference,
  SelectReferenceComponent,
} from "../../select-reference/select-reference.component";
import { SpecialApprovalService } from "../../../../special-approval.service";
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from "@angular/animations";
import {
  APPLY_TYPE,
  BUSINESS_MODEL,
  BG_LIST,
  ORDER_TYPES,
  BUSINESS_MODEL_LIST,
  CURRENCIES,
  EXCHANGE_IMPORT_ROLES,
  EXCHANGE_EXPORT_ROLES,
} from "../../../../special-approval.constants";
import { debounceTime, map, switchMap } from "rxjs/operators";
import { BehaviorSubject, Observable } from "rxjs";
import { HttpService } from "@core/services/http.service";
import { NzMessageService } from "ng-zorro-antd";

/*
 * @description: 获取当前账户邮箱
 * */
function getLoginUserCode1() {
  return localStorage.getItem("ecom_ng_philips_code1");
}

interface Sales {
  email: string;
  name: string;
}

@Component({
  selector: "special-approval-transfer-lib-info",
  templateUrl: "./transfer-lib.component.html",
  styleUrls: ["./transfer-lib.component.scss"],
  animations: [
    trigger("openClose", [
      state(
        "close",
        style({
          display: "none",
          opacity: 0,
        })
      ),
      state(
        "open",
        style({
          opacity: 1,
        })
      ),
      transition("close => open", animate("200ms ease-in")),
      transition("open => close", animate("200ms ease-out")),
    ]),
  ],
})
export class TransferLibComponent implements OnInit, OnChanges {
  constructor(
    protected spService: SpecialApprovalService,
    private http: HttpService,
    private message: NzMessageService
  ) {}

  @ViewChild("selectHospital") selectHospital: SelectHospitalComponent;
  @ViewChild("selectReference") selectReference: SelectReferenceComponent;

  @Input() formValues: FormGroup;
  @Input() exchangeInfo: FormGroup;
  @Input() baseInfo: FormGroup;
  @Input() editable = true;
  @Input() applyType: string;
  @Input() applyItem: string;
  @Input() bmcs = [];
  @Input() showFeedbackTab = false;
  @Input() applicantEmail;

  APPLY_TYPE = APPLY_TYPE;
  searchChange$ = new BehaviorSubject("");
  showDealerArea: Array<boolean> = [false, false]; //是否展示经销商名称字段
  currentImportIndex: number = 0; //当前导入数据的tab(转出项目/转入项目)
  isShowMoney = {
    0: true,
    1: true,
  };

  salesApprovalSecondOrder = [];

  selectOptions = {
    orderTypes: ORDER_TYPES,
    bgList: BG_LIST,
    bigArea0: [],
    bigArea1: [],
    businessModels: BUSINESS_MODEL_LIST,
    currencies: CURRENCIES,
    exchangeImportRoles: EXCHANGE_IMPORT_ROLES(),
    exchangeExportRoles: EXCHANGE_EXPORT_ROLES(),
  };

  salesList1: Sales[] = [
    {
      name: localStorage.getItem("ng_philips_username"),
      email: localStorage.getItem("ecom_ng_philips_code1"),
    },
  ];
  salesList0: Sales[] = [];
  isSearchLoading: boolean = false;

  isExpand: boolean = true; // 控制元素展开收起

  getbigAreas(index) {
    const cycleGroup = this.orders.at(index).get("cycleGroup") as FormControl;
    const cycleGroupBigAreaMap = this.spService.cycleGroupBigAreaMap;
    if (cycleGroup && cycleGroupBigAreaMap[cycleGroup.value]) {
      return cycleGroupBigAreaMap[cycleGroup.value];
    } else {
      return [];
    }
  }

  /*
   * 获取产品线列表
   * */
  get bmcList() {
    const bg = this.orders.at(0).get("bg") as FormControl;
    return this.spService.bmcList.filter((bmc) => bmc.bg === bg.value);
  }

  get omList() {
    const bg = this.orders.at(0).get("bg").value
    return (this.spService.omUserMap[bg] || []).map(({ name, email }) => ({
      label: `${name}(${email})`,
      value: email
    }))
  }

  /*
   * @description 选择业务模式触发
   * */
  onBusinessModelChange(businessModel, index) {
    this.showDealerArea[index] =
      businessModel === BUSINESS_MODEL.DISTRIBUTOR_DEAL;
  }

  onCalcProjectName(index) {
    const { hospitalName, productType, bg } = this.orders.at(index).value;
    if (bg === "PD&IGT") {
      return;
    }
    const res = [];
    if (hospitalName) {
      res.push(hospitalName);
    }

    if (productType) {
      res.push(productType);
    }
    this.formValues.patchValue({
      projectName: res.join("-"),
    });
  }

  onBigAreaChange(bigArea, index) {
    this.currentImportIndex = index;
    if (index === 0) {
      this.selectOptions.bigArea0 = this.getbigAreas(0);
    }
    if (index === 1) {
      this.selectOptions.bigArea1 = this.getbigAreas(1);
    }
  }

  onShowSelectHospitalModal(index) {
    this.currentImportIndex = index;
    this.selectHospital.showModal();
  }

  onSelectHospital(hospital: Hospital) {
    const { no, customerName } = hospital;
    this.orders.at(this.currentImportIndex).patchValue({
      hospitalNo: no,
      hospitalName: customerName,
    });
    this.onCalcProjectName(0);
  }

  onClearHospital(index) {
    this.orders.at(index).patchValue({
      hospitalNo: null,
      hospitalName: null,
    });
  }

  onShowReferenceModal(index, needCreateUser = true) {
    this.currentImportIndex = index;
    const transIndex = index === 0;
    this.selectReference.showModal(needCreateUser, transIndex);
  }
  onHideReferenceModal() {
    this.selectReference.onHideModal();
  }

  onSelectReference(reference: Reference) {
    const {
      referenceId,
      cosMainId,
      orderType,
      projectName,
      productModel,
      sap,
      team,
      region,
      bmc,
      businessModel,
      distributor,
      dealerCode,
      endUser,
      endUserId,
      contractPrice,
      invoiceInformation,
      createUser,
      logistician,
      marketBundleQuantity,
    } = reference;
    if (this.currentImportIndex === 0) {
      this.salesList0 = [];
      this.salesList0.push({
        name: createUser,
        email: createUser,
      });
    }
    if (distributor) {
      this.showDealerArea[this.currentImportIndex] = true;
    }
    if (this.currentImportIndex === 0) {
      this.checkMoney(0);
      // this.checkMoney(1);
      this.referenceImport0 = true;
    } else {
      // this.checkMoney(0);
      this.checkMoney(1);
      this.referenceImport1 = true;
    }
    switch (this.currentImportIndex) {
      case 0:
        if (
          this.orders.at(1).get("bmc").value &&
          this.orders.at(1).get("bmc").value !== bmc
        ) {
          this.message.error("bmc不一致,请重新选择");
          return;
        }
        // this.isShowMoney[0] = false
        break;
      case 1:
        if (
          this.orders.at(0).get("bmc").value &&
          this.orders.at(0).get("bmc").value !== bmc
        ) {
          this.message.error("bmc不一致,请重新选择");
          return;
        }
        // this.isShowMoney[1] = false
        break;
    }

    this.disableField(this.currentImportIndex);
    this.checkMoney(this.currentImportIndex);
    this.orders.at(this.currentImportIndex).patchValue({
      orderType,
      referenceId,
      cosMainId,
      projectName,
      productType: productModel,
      sapOrderNo: sap,
      cycleGroup: team,
      bigArea: region,
      bmc,
      businessModel: businessModel ? businessModel.toLowerCase() : null,
      dealerName: distributor,
      dealerCode,
      hospitalName: endUser,
      hospitalNo: endUserId,
      orderAmount: contractPrice,
      currency: invoiceInformation,
      products: [
        {
          id: Date.now(),
          productType: productModel,
          wbs: "",
          itemNo: "",
          quantity: marketBundleQuantity,
        },
      ],
      om: logistician,
      saleEmail: createUser,
    });
  }

  ngOnInit(): void {
    if (this.editable && this.orders.at(0).value.saleEmail) {
      this.salesList0.push({
        name: this.orders.at(0).value.saleEmail,
        email: this.orders.at(0).value.saleEmail,
      });
    }
    if (this.editable && this.orders.at(0).value.bigArea) {
      this.onBigAreaChange(this.orders.at(0).value.cycleGroup, 0);
    }
    if (this.editable && this.orders.at(1).value.bigArea) {
      this.onBigAreaChange(this.orders.at(1).value.cycleGroup, 1);
    }

    this.exchangeMapping(this.exchangeInfo.value.exchangeMethod);
    this.exchangeInfo.get("exchangeMethod").valueChanges.subscribe((next) => {
      this.exchangeMapping(next);
    });
    if (this.editable) {
      if (this.orders.at(0).get("saleEmail")) {
        this.getOrderList(0);
      }
      // 自动带入销售和leader邮箱
      this.setLeaderEmailList(1);
      this.setLeaderEmailList(0);
      this.orders.at(1).patchValue({
        saleEmail: getLoginUserCode1(),
        approvalConfigSecond: this.baseInfo.getRawValue().systemRegion,
      });
      this.getLeaderEmail(
        1,
        getLoginUserCode1(),
        this.baseInfo.getRawValue().systemRegion
      );
      this.orders.at(1).get("saleEmail").disable();
      const valueChangedSubscribeList = ["hospitalName", "productType"];
      this.orders.controls.forEach((item, index) => {
        valueChangedSubscribeList.forEach((item) => {
          this.orders
            .at(index)
            .get(item)
            .valueChanges.subscribe(() => {
              this.onCalcProjectName(index);
            });
        });
      });
    } else if (!this.editable) {
      this.checkMoney(0);
      this.checkMoney(1);
    }

    /*
     * @description 请求销售邮箱api？ copy过来，等待配置到api service中去
     * */
    const getSaleList = (keyword: string) => {
      if (!keyword) {
        this.isSearchLoading = false;
        return [];
      }
      let data = this.http
        .get(
          `/act/role/getUsersByRoleAndEmail?role=` +
            "Sales Rep/Mgr" +
            "&email=" +
            keyword
        )
        .pipe(map((res: any) => res.data as Sales[]));
      return data;
    };

    const optionList$: Observable<Sales[]> = this.searchChange$
      .asObservable()
      .pipe(debounceTime(500))
      .pipe(switchMap(getSaleList));
    optionList$.subscribe((data) => {
      this.salesList0 = data;
      this.isSearchLoading = false;
    });
    // 放前面会影响数据填充
    if (this.editable) {
      // this.setLeaderEmailList(0)
      // this.setLeaderEmailList(1)
      if (this.orders.at(0).get("referenceId").value) {
        this.referenceImport0 = true;
        this.disableField(0);
        this.checkMoney(0);
      }
      if (this.orders.at(1).get("referenceId").value) {
        this.referenceImport1 = true;
        this.disableField(1);
        this.checkMoney(1);
      }
    }
    const item = this.baseInfo.get("applyItem").value;
    switch (item) {
      case "sp_transferlib_apply_item_1":
        this.exchangeInfo.patchValue({
          exchangeType: "within ORU",
        });
        break;
      case "sp_transferlib_apply_item_2":
        this.exchangeInfo.patchValue({
          exchangeType: "HK90-CN90",
        });
        break;
      case "sp_transferlib_apply_item_3":
        this.exchangeInfo.patchValue({
          exchangeType: "CN90-HK90",
        });
        break;
    }
  }

  districtList: any = [[], []]; // District Leader邮箱
  productSalesList: any = [[], []]; // Product Sales Manager 邮箱
  salesLeaderList: any = [[], []]; // Sales Leader邮箱

  /*
   * @description 邮箱变化
   * */
  async salesChange(index, value) {
    if (value === null) {
      this.clearAreaInform(index);
      this.clearLeaderInform(index);
    } else {
      if (index == 0) {
        this.orders.at(0).patchValue({
          approvalConfigSecond: null,
        });
      }
      await this.getOrderList(index);
      // console.log(this.orders.get(index));
    }
  }
  clearAreaInform(index) {
    if (this.orders.at(index).get("approvalConfigSecond").value){
      this.orders.at(index).patchValue({
        approvalConfigSecond: null,
      });
    }
  }
  clearLeaderInform(index) {
    this.orders.at(index).patchValue({
      districtLeader: null,
      salesLeader: null,
      // productSalesMgr: null,
    });
  }
  async getLeaderEmail(index, email, config: any) {
    let selected = this.salesApprovalSecondOrder.find(
      (i) => i.value === config
    );
    let selectedData = {
      team: null,
      modality: null,
      cycleGroup: null,
      bigArea: null,
      smallArea: null,
    };
    if (selected) {
      selectedData = selected.data;
    }
    const currBmc = this.orders.at(index).get("bmc").value;
    this.orders.controls.forEach((value, groupIndex) => {
      if (index === groupIndex) {
        value.patchValue({
          districtLeader: null,
          salesLeader: null,
          productSalesMgr: null,
        });
      }
    });
    console.log("this.baseInfo", this.baseInfo);
    let district = {
      initiatorEmail: email,
      initiatorRole: "Sales Rep/Mgr",
      approverRole: "District Leader",
      initiatorTeam: null,
      initiatorModality: null,
      initiatorCycleGroup: null,
      initiatorBigArea: null,
      initiatorSmallArea: null,
    };
    let sales = {
      initiatorEmail: email,
      initiatorRole: "Sales Rep/Mgr",
      approverRole: "Sales Leader",
      initiatorTeam: null,
      initiatorModality: null,
      initiatorCycleGroup: null,
      initiatorBigArea: null,
      initiatorSmallArea: null,
    };
    if (index === 0) {
      district = {
        initiatorEmail: email,
        initiatorRole: "Sales Rep/Mgr",
        approverRole: "District Leader",
        initiatorTeam: selectedData.team,
        initiatorModality: selectedData.modality,
        initiatorCycleGroup: selectedData.cycleGroup,
        initiatorBigArea: selectedData.bigArea,
        initiatorSmallArea: selectedData.smallArea,
      };
      sales = {
        initiatorEmail: email,
        initiatorRole: "Sales Rep/Mgr",
        approverRole: "Sales Leader",
        initiatorTeam: selectedData.team,
        initiatorModality: selectedData.modality,
        initiatorCycleGroup: selectedData.cycleGroup,
        initiatorBigArea: selectedData.bigArea,
        initiatorSmallArea: selectedData.smallArea,
      };
    } else {
      district = {
        initiatorEmail: email,
        initiatorRole: "Sales Rep/Mgr",
        approverRole: "District Leader",
        initiatorTeam: this.baseInfo.get("team").value,
        initiatorModality: this.baseInfo.get("bg").value,
        initiatorCycleGroup: this.baseInfo.get("cycleGroup").value,
        initiatorBigArea: this.baseInfo.get("bigArea").value,
        initiatorSmallArea: this.baseInfo.get("smallArea").value,
      };
      sales = {
        initiatorEmail: email,
        initiatorRole: "Sales Rep/Mgr",
        approverRole: "Sales Leader",
        initiatorTeam: this.baseInfo.get("team").value,
        initiatorModality: this.baseInfo.get("bg").value,
        initiatorCycleGroup: this.baseInfo.get("cycleGroup").value,
        initiatorBigArea: this.baseInfo.get("bigArea").value,
        initiatorSmallArea: this.baseInfo.get("smallArea").value,
      };
    }

    console.log("district", district);

    let productManager = {
      initiatorEmail: email,
      initiatorRole: "Sales Rep/Mgr",
      approverRole: "Product Sales Manager",
      productBmc: currBmc,
      initiatorTeam: null,
      initiatorModality: null,
      initiatorCycleGroup: null,
      initiatorBigArea: null,
      initiatorSmallArea: null,
      // initiatorTeam: this.baseInfo.get("team").value,
      // initiatorModality: this.baseInfo.get("bg").value,
      // initiatorCycleGroup: this.baseInfo.get("cycleGroup").value,
      // initiatorBigArea: this.baseInfo.get("bigArea").value,
      // initiatorSmallArea: this.baseInfo.get("smallArea").value,
    };
    console.log("sales", sales);
    switch (index) {
      case 0:
        const districtLeader = await this.spService.getCustomizeEmail(district);
        const salesLeader = await this.spService.getCustomizeEmail(sales);
        this.orders.at(0).patchValue({
          districtLeader: districtLeader[0].approverEmail,
          salesLeader: salesLeader[0].approverEmail,
        });
        if (currBmc) {
          const productSalesMgr = await this.spService.getCustomizeEmail({
            initiatorEmail: email,
            initiatorRole: "Sales Rep/Mgr",
            approverRole: "Product Sales Manager",
            productBmc: currBmc,
            initiatorTeam: selectedData.team,
            initiatorModality: selectedData.modality,
            initiatorCycleGroup: selectedData.cycleGroup,
            initiatorBigArea: selectedData.bigArea,
            initiatorSmallArea: selectedData.smallArea,
            // initiatorTeam: this.baseInfo.get("team").value,
            // initiatorModality: this.baseInfo.get("bg").value,
            // initiatorCycleGroup: this.baseInfo.get("cycleGroup").value,
            // initiatorBigArea: this.baseInfo.get("bigArea").value,
            // initiatorSmallArea: this.baseInfo.get("smallArea").value,
          });
          if (productSalesMgr.length == 0) {
            this.message.warning(
              "未找到转出项目BMC对应的Product Sales Manager,请手动填写"
            );
          } else if (productSalesMgr.length > 0) {
            this.orders.at(0).patchValue({
              productSalesMgr: productSalesMgr[0].approverEmail
                ? productSalesMgr[0].approverEmail
                : null,
            });
          }
        }
        break;
      case 1:
        const districtLeader1 = await this.spService.getCustomizeEmail(
          district
        );
        const salesLeader1 = await this.spService.getCustomizeEmail(sales);
        this.orders.at(1).patchValue({
          districtLeader: districtLeader1[0].approverEmail,
          salesLeader: salesLeader1[0].approverEmail,
        });
        if (currBmc) {
          const productSalesMgr1 = await this.spService.getCustomizeEmail({
            initiatorEmail: email,
            initiatorRole: "Sales Rep/Mgr",
            approverRole: "Product Sales Manager",
            productBmc: currBmc,
            initiatorTeam: this.baseInfo.get("team").value,
            initiatorModality: this.baseInfo.get("bg").value,
            initiatorCycleGroup: this.baseInfo.get("cycleGroup").value,
            initiatorBigArea: this.baseInfo.get("bigArea").value,
            initiatorSmallArea: this.baseInfo.get("smallArea").value,
          });
          if (productSalesMgr1.length == 0) {
            this.message.warning(
              "未找到转入项目BMC对应的Product Sales Manager,请手动填写"
            );
          } else if (productSalesMgr1.length > 0) {
            this.orders.at(1).patchValue({
              productSalesMgr: productSalesMgr1[0].approverEmail,
            });
          }
        }
        break;
    }
  }

  async getPSMLeader(index) {
    const config = this.orders.at(index).get("approvalConfigSecond").value;
    const currBmc = this.orders.at(index).get("bmc").value;
    const email = this.orders.at(index).get("saleEmail").value;
    if (!email) {
      return;
    }
    this.orders.controls.forEach((value, groupIndex) => {
      if (index === groupIndex) {
        value.patchValue({
          productSalesMgr: null,
        });
      }
    });
    console.log("config", config);
      let selectedData = {
      team: null,
      modality: null,
      cycleGroup: null,
      bigArea: null,
      smallArea: null,
    };
  let selected = this.salesApprovalSecondOrder.find(
      (i) => i.value === config
    );
    if (selected) {
      selectedData = selected.data;
    }
    let productManager = {
      initiatorEmail: email,
      initiatorRole: "Sales Rep/Mgr",
      approverRole: "Product Sales Manager",
      productBmc: currBmc,
      initiatorTeam:
        index === 1 ? this.baseInfo.get("team").value : selectedData.team,
      initiatorModality:
        index === 1 ? this.baseInfo.get("bg").value : selectedData.modality,
      initiatorCycleGroup:
        index === 1 ? this.baseInfo.get("cycleGroup").value : selectedData.cycleGroup,
      initiatorBigArea:
        index === 1 ? this.baseInfo.get("bigArea").value : selectedData.bigArea,
      initiatorSmallArea:
        index === 1 ? this.baseInfo.get("smallArea").value : selectedData.smallArea,
    };
    // productManager.initiatorTeam = config.team;
    // productManager.initiatorModality = config.modality;
    // productManager.initiatorCycleGroup = config.cycleGroup;
    // productManager.initiatorBigArea = config.bigArea;
    // productManager.initiatorSmallArea = config.smallArea;
    // productManager.productBmc = currBmc;

    switch (index) {
      case 0:
        const productSalesMgr = await this.spService.getCustomizeEmail(
          productManager
        );
        if (productSalesMgr.length == 0) {
          this.message.warning(
            "未找到转出项目BMC对应的Product Sales Manager,请手动填写"
          );
        } else if (productSalesMgr.length > 0) {
          this.orders.at(0).patchValue({
            productSalesMgr: productSalesMgr[0].approverEmail
              ? productSalesMgr[0].approverEmail
              : null,
          });
        }
        break;
      case 1:
        const productSalesMgr1 = await this.spService.getCustomizeEmail(
          productManager
        );
        if (productSalesMgr1.length == 0) {
          this.message.warning(
            "未找到转入项目BMC对应的Product Sales Manager,请手动填写"
          );
        } else if (productSalesMgr1.length > 0) {
          this.orders.at(1).patchValue({
            productSalesMgr: productSalesMgr1[0].approverEmail,
          });
        }
        break;
    }
  }

  /*
   * @description: 1. 币制的变化，如果转入项目币制变化，则修改成本汇总币制。 2. 币制变化，根据转入转出币制判断换货类型
   * */
  onCurrencyChanged(val, index) {
    if (index === 1) {
      // 转入项目
      this.exchangeInfo.patchValue({
        ...this.exchangeInfo.value,
        currency: val,
      });
    } else {
      // this.orders.at(index).value
    }
    this.onCheckExchangeType();
  }

  /*
   * @description: 判断换货类型
   * */
  onCheckExchangeType() {
    const before = this.exchangeInfo.get("exchangeType").value;
    let exchangeType = "";
    let outputCurrency = this.orders.at(0).get("currency").value;
    let inputCurrency = this.orders.at(1).get("currency").value;
    if (inputCurrency === outputCurrency) {
      exchangeType = "within ORU";
    } else if (inputCurrency === "CNY" && outputCurrency === "USD") {
      exchangeType = "HK90-CN90";
    } else if (inputCurrency === "USD" && outputCurrency === "CNY") {
      exchangeType = "CN90-HK90";
    }
    if (exchangeType) {
      this.exchangeInfo.patchValue({
        ...this.exchangeInfo.value,
        exchangeType,
      });
      this.baseInfo.patchValue({
        applyItem:
          exchangeType === "within ORU"
            ? "sp_transferlib_apply_item_1"
            : exchangeType === "HK90-CN90"
            ? "sp_transferlib_apply_item_2"
            : "sp_transferlib_apply_item_3",
      });
      if (before !== exchangeType) {
        this.message.warning("根据币制已将申请类型转变为：" + exchangeType);
      }
    }
  }

  onBMCChange(index) {
    this.bmcCheck(index);
    this.getPSMLeader(index);
  }

  /*
   * @description 获取email
   * @params {String} approverRole
   * @params {String} productBmc : 只有 Product Sales Manager 邮箱 需要该参数
   * */
  getDistrictList(approverRole, productBmc = undefined, index, config) {
    const regions = config.split("-");
    switch (index) {
      case 0:
        return {
          initiatorEmail: this.orders.at(0).get("saleEmail").value,
          initiatorRole: "Sales Rep/Mgr",
          approverRole,
          productBmc,
          initiatorTeam: regions[0] ? regions[0] : null,
          initiatorModality: regions[1] ? regions[1] : null,
          initiatorCycleGroup: regions[2] ? regions[2] : null,
          initiatorBigArea: regions[3] ? regions[3] : null,
          initiatorSmallArea: regions[4] ? regions[4] : null,
        };
      case 1:
        return {
          initiatorEmail: localStorage.ecom_ng_philips_code1,
          initiatorRole: localStorage.roleCode,
          approverRole,
          productBmc,
          initiatorTeam: regions[0] ? regions[0] : null,
          initiatorModality: regions[1] ? regions[1] : null,
          initiatorCycleGroup: regions[2] ? regions[2] : null,
          initiatorBigArea: regions[3] ? regions[3] : null,
          initiatorSmallArea: regions[4] ? regions[4] : null,
        };
      default:
        return [];
    }
  }
  get orders() {
    return this.formValues.get("orders") as FormArray;
  }

  /*
   * @description: 销售邮箱变化
   * */
  referenceImport0: boolean = false;
  referenceImport1: boolean = false;
  onSearchSales(keyword: string) {
    this.isSearchLoading = true;
    this.searchChange$.next(keyword);
  }

  expand() {
    this.isExpand = !this.isExpand;
  }

  exchangeMapping(value) {
    switch (value) {
      case "互换":
        this.orders.at(0).patchValue({
          exchangeRole: "转出/转入",
        });
        this.orders.at(1).patchValue({
          exchangeRole: "转出/转入",
        });
        break;
      case "单向":
        this.orders.at(0).patchValue({
          exchangeRole: "转出",
        });
        this.orders.at(1).patchValue({
          exchangeRole: "转入",
        });
        break;
    }
  }

  async setLeaderEmailList(index) {
    this.districtList[index] = await this.spService.getUserByRole(
      "District Leader"
    );
    this.salesLeaderList[index] = await this.spService.getUserByRole(
      "Sales Leader"
    );
    this.productSalesList[index] = await this.spService.getUserByRole(
      "Product Sales Manager"
    );
  }

  async checkMoney(index) {
    const code = localStorage.getItem("roleCode");
    const currEmail = getLoginUserCode1() as string;
    const transSale = this.orders.at(index).get("saleEmail").value as string;
    const transDistrict = this.orders.at(index).get("districtLeader")
      .value as string;
    const transSalesLeader = this.orders.at(index).get("salesLeader")
      .value as string;
    if (
      (code === "Sales Rep/Mgr" ||
        code === "District Leader" ||
        code === "Sales Support" ||
        code === "Sales Leader") &&
      currEmail != transSale &&
      currEmail !== transSalesLeader &&
      currEmail !== transDistrict
    ) {
      this.isShowMoney[index] = false;
    } else {
      this.isShowMoney[index] = true;
    }
  }

  disableField(index) {
    let disabledFieldsList = [
      "orderType",
      "productType",
      "bmc",
      "bg",
      "cycleGroup",
      "bigArea",
      "businessModel",
      "hospitalName",
      "hospitalNo",
      "projectName",
      "sapOrderNo",
      "orderAmount",
      "currency",
      "saleEmail",
      "om",
    ];
    if (index === 1) {
      disabledFieldsList = disabledFieldsList.filter(
        (i) => i !== "orderAmount"
      );
    }
    disabledFieldsList.forEach((item) => {
      this.orders.at(index).get(item).disable();
    });
  }

  bmcCheck(index) {
    switch (index) {
      case 0:
        if (
          this.orders.at(1).get("bmc").value &&
          this.orders.at(1).get("bmc").value !==
            this.orders.at(0).get("bmc").value
        ) {
          this.message.error("bmc不一致,请重新选择");
          return true;
        }
        return false;
      case 1:
        if (
          this.orders.at(0).get("bmc").value &&
          this.orders.at(0).get("bmc").value !==
            this.orders.at(1).get("bmc").value
        ) {
          this.message.error("bmc不一致,请重新选择");
          return true;
        }
        return false;
    }
  }

  //监测 @Input值的变化
  ngOnChanges(changes: SimpleChanges): void {
    //是否是反馈信息节点
    if (changes.showFeedbackTab && changes.showFeedbackTab.currentValue) {
      this.orders.at(1).get("actualSaleDate").enable();
      this.orders
        .at(1)
        .get("actualSaleDate")
        .setValidators([Validators.required]);
    }
  }

  async configChange(value: any, index: any, email: any) {
    console.log(`Here:${value},${index},${email}`);
    if (value) {
      this.getLeaderEmail(index, email, value);
    } else {
      this.clearAreaInform(index);
    }
  }

  async getOrderList(index: number) {
    let email = null;
    let list = null;
    switch (index) {
      case 0:
        this.salesApprovalSecondOrder = [];
        email = this.orders.at(0).get("saleEmail").value;
        list = await this.spService.getRolesInfo(email);
        this.salesApprovalSecondOrder = (list.profiles || [])
          .filter(({ role: roleName }) => "Sales Rep/Mgr" === roleName)
          .map((region) => ({
            label: [
              region.funcTeamType == "0" ? region.team : region.serveTeam,
              region.modality,
              region.cycleGroup,
              region.bigArea,
              region.smallArea,
            ]
              .filter((str) => str && str.trim())
              .join("-"),
            value: [
              region.funcTeamType == "0" ? region.team : region.serveTeam,
              region.modality,
              region.cycleGroup,
              region.bigArea,
              region.smallArea,
            ]
              .filter((str) => str && str.trim())
              .join("-"),
            data: {
              team: region.funcTeamType == "0" ? region.team : region.serveTeam,
              modality: region.modality,
              cycleGroup: region.cycleGroup,
              bigArea: region.bigArea,
              smallArea: region.smallArea,
            },
          }));
        break;
      default:
        break;
    }
  }
}
