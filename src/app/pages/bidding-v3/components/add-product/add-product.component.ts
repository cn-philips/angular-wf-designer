import { Component, Input, OnInit, Output } from "@angular/core";
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";
import { HttpService } from "@core/services";
import { EventEmitter } from "events";

@Component({
  selector: "bidding-v3-add-product",
  templateUrl: "./add-product.component.html",
  styleUrls: ["./add-product.component.scss"],
})
export class AddProductComponent implements OnInit {
  @Output() confirm = new EventEmitter();

  visible = false;

  tableData = [];
  tableLoading = false;

  marketBundle: FormGroup;

  businessModel;

  marketBundleIdSet = new Set();

  constructor(private http: HttpService, private fb: FormBuilder) {}

  ngOnInit() {}

  getTableData(url, params) {
    this.tableLoading = true;
    this.http.post(url, params).subscribe(({ data: { rows } }) => {
      this.tableData = rows.filter(
        (item) => item.businessModel === this.businessModel
      );

      this.tableLoading = false;
    });
  }

  initMarketBundleIdSet(marketBundle: FormGroup) {
    this.marketBundleIdSet = new Set();
    const products = marketBundle.get("products").value;
    products.forEach(({ marketBundleId }) =>
      this.marketBundleIdSet.add(marketBundleId)
    );
  }

  show(biddingForm: FormGroup, marketBundle: FormGroup) {
    this.tableData = [];
    this.initMarketBundleIdSet(marketBundle);
    this.visible = true;
    const {
      dataSource,
      accountName,
      basicInfo: {
        baseInfo: { businessModel },
      },
    } = biddingForm.getRawValue();
    const { opportunityId, dealFormId } = marketBundle.getRawValue();
    this.businessModel = businessModel;
    this.marketBundle = marketBundle;
    let url = null;
    let params = null;
    if (dataSource === "CP Deal Form") {
      url = `/act/ecos/bidding/apply/opportunity/dealForm`;
      params = {
        opportunityId,
        dealFormId,
        accountName,
      };
    } else {
      url = `/act/ecos/bidding/apply/opportunity/simulation`;
      params = {
        opportunityId,
        accountName,
      };
    }
    this.getTableData(url, params);
  }

  createMarketBundleProduct({
    modality,
    bmc,
    productModel,
    medicalDeviceName,
    marketBundleId,
    marketBundleName,
    marketBundleQuantity,
    dtcDealerAgreement,
    products,
    simulationId,
    configName,
  }) {
    const marketBudleProductGroup = this.fb.group({
      simulationId: [simulationId],
      modality: [modality], // Modality
      bmc: [bmc], // 产品线
      configName: [configName],
      productModel: [productModel], // 产品型号
      medicalDeviceName: [medicalDeviceName], // 医疗器械名称
      marketBundleId: [marketBundleId], // Market Bundle Id
      marketBundleName: [marketBundleName], // Market Bundle Name
      quantity: [marketBundleQuantity], // 台数
      dtcDealerAgreement: [dtcDealerAgreement], // DTC经销商协议
      latestDealerAgreement: [null], // 最新经销商协议
      authorizedProduct: [null], // 授权产品
      authorizedArea: [null], // 授权区域
      options: this.fb.array([]), // CC Option列表
    });

    const marketBudleProductOptionsArray = marketBudleProductGroup.get(
      "options"
    ) as FormArray;
    if (products && products.length > 0) {
      products.forEach(({ id: cpProductId, productName }) => {
        const marketBudleProductOptionGroup = this.fb.group({
          productName: [productName],
          id: [null],
          cpProductId: [cpProductId],
          biddingMarketBundleId: [null],
        });
        marketBudleProductOptionGroup.patchValue({ cpProductId, productName });
        marketBudleProductOptionsArray.push(marketBudleProductOptionGroup);
      });
    }

    return marketBudleProductGroup;
  }

  onAddProduct(item) {
    this.marketBundleIdSet.add(item.marketBundleId);
    const marketBundleProduct = this.createMarketBundleProduct(item);
    const products = this.marketBundle.get("products") as FormArray;
    products.push(marketBundleProduct);
  }

  onDeleteProduct({ marketBundleId }) {
    this.marketBundleIdSet.delete(marketBundleId);
    const products = this.marketBundle.get("products") as FormArray;
    const index = products.value.findIndex(
      (item) => item.marketBundleId === marketBundleId
    );
    products.removeAt(index);
  }

  onHide() {
    this.visible = false;
  }
}
