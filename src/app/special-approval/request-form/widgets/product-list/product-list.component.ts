import { Component, OnInit, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
import * as moment from "moment";

import {
  US_PRODUCT_LIST,
  STAND_WARRANTY_MONTH,
} from "../../../special-approval.constants";

interface Product {
  productType: string; // 产品型号
  wbsNo: string; // WBS
  itemNo: string; // Item
  quantity: string; // 数量
  equipmentSn: string; // 设备SN
  expectedStdWarrantyStartdate: string; // 预计标准保修开始日期
  stdWarrantyMonths: string; // 标准保修月数
  expectedStdWarrantyEnddate: string; // 预计标准保修结束日期
  applyExtWarrantyMonths: string; // 申请延保月数
  applyStdWarrantyEnddate: string; // 申请标准保修结束日期
}

@Component({
  selector: "special-approval-product-list",
  templateUrl: "./product-list.component.html",
  styleUrls: ["./product-list.component.scss"],
})
export class ProductListComponent implements OnInit {
  @Input() orderInfo: FormGroup;
  @Input() editable: boolean;
  @Input() isWarranty: boolean;

  selectOptions = {
    usProductList: US_PRODUCT_LIST,
  };

  constructor() {}

  get products(): FormGroup {
    return this.orderInfo.get("products") as FormGroup;
  }

  get bg(): string {
    return this.orderInfo.get("bg").value as string;
  }

  ngOnInit(): void {}

  onAddProduct() {
    this.products.patchValue([
      ...this.products.value,
      {
        id: Date.now(),
        productType: null,
        wbs: "",
        itemNo: "",
        quantity: "",
        warranty: { stdWarrantyMonths: STAND_WARRANTY_MONTH[this.bg] },
      },
    ]);
  }

  onDeleteProduct(id) {
    const products = this.products.value.filter((product) => product.id !== id);
    this.products.patchValue(products);
    this.onProductChange();
  }

  onProductChange() {
    const productTypes = this.products.value
      .filter(({ productType }) => productType && productType.trim())
      .map(({ productType }) => productType);
    this.orderInfo.patchValue({
      productType: productTypes.join(","),
    });
  }

  /**
   *  计算申请延保月数 整数部分+小数部分
   *  整数部分: 申请保修结束日期和合同保修结束日期间整月差
   *  小数部分: 申请保修结束日期和按整月差计算的申请保修结束日期天数差/申请保修结束日期当月天数
   */
  onCalcWarrantyMonth(product) {
    const {
      warranty: { expectedStdWarrantyEnddate, applyStdWarrantyEnddate },
    } = product;
    if (expectedStdWarrantyEnddate && applyStdWarrantyEnddate) {
      const startDate = moment(expectedStdWarrantyEnddate);
      const startDateMon = Number(startDate.format('MM'))
      const startDateYear = Number(startDate.format('YYYY'))
      const endDate = moment(applyStdWarrantyEnddate);
      const endDateMon = Number(endDate.format('MM'))
      const endDateYear = Number(endDate.format('YYYY'))
      const years = endDateYear - startDateYear;
      const months = endDateMon - startDateMon;
      // 整数部分
      const integerPart = years * 12 + months;
      // 小数部分
      const startDateDay = Number(startDate.format("DD"));
      const startDateMonthDays = Number(startDate.endOf("month").format("DD"));
      const isStartDateLastDay = startDateDay === startDateMonthDays;
      const endDateDay = Number(endDate.format("DD"));
      const endDateMonthDays = Number(endDate.endOf("month").format("DD"));
      const decimalPart = Number(
        (endDateDay -
          (isStartDateLastDay || startDateDay > endDateMonthDays
            ? endDateMonthDays
            : startDateDay)) /
          endDateMonthDays
      ).toFixed(2);
      product.warranty.applyExtWarrantyMonths = Number(
        integerPart + parseFloat(decimalPart)
      ).toFixed(2);
    }
  }

  onStdWarrantyStartDateChange(product) {
    // 计算合同保修结束日期
    const {
      warranty: { expectedStdWarrantyStartdate, stdWarrantyMonths },
    } = product;
    product.warranty.expectedStdWarrantyEnddate = moment(expectedStdWarrantyStartdate)
      .subtract(1, "days")
      .add(stdWarrantyMonths, "months")
      .format("YYYY-MM-DD");
    this.onCalcWarrantyMonth(product);
  }
}
