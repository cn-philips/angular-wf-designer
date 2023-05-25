import { JsonPipe } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { FormGroup, FormArray, FormBuilder } from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';
import { OrderV3Service } from "@pages/order-v3/order-v3.service";
import { disreduce, removeRepeat, floatSub, fomatFloat, floatDivide, returnFloat, NumberThousandth } from '@core/util/tools'
import * as moment from "moment";
@Component({
  selector: "ecos-contract-sign-info",
  templateUrl: "./contract-sign-info.component.html",
  styleUrls: ["./contract-sign-info.component.scss"],
})
export class ContractSignInfoComponent implements OnInit {
  @Input() formValue: FormGroup;

  @Input() bg: string;

  @Input() flag: any;

  @Input() needFileType: any; //// 待补充文件类型 'contract'-待上传正本合同 ，'oit'-OIT文件待补充

  transportModeList = [
    { label: "海运或空运", value: "By sea or by air" },
    { label: "陆运", value: "Truck" },
    { label: "空运", value: "By air" },
  ];
  pdfSRC: any;
  isPdf: any = false;
  title: any;
  templateList = [];
 @Input() applySignatureBtn: boolean = false;
 @Input() approvalSigatureBtn:boolean=false;
 @Input() signaturePageOff:boolean=false;
  get foreignFrom(): FormGroup {
    return this.formValue.get("foreignFrom") as FormGroup;
  }
  get orderInfo(): FormGroup {
    return this.formValue.get("orderInfo") as FormGroup;
  }
  get contractSignForm(): FormGroup {
    return this.formValue.get("contractSignForm") as FormGroup;
  }
  get baseInfoFromData(): FormGroup {
    return this.formValue.get("baseInfoFrom") as FormGroup;
  }
  get signFileForm(): FormGroup {
    return this.formValue.get("signFileForm") as FormGroup;
  }
  get priceApprovalData(): FormGroup {
    return this.formValue.get("priceApproval") as FormGroup;
  }
  get dealerFrom(): FormGroup {
    return this.formValue.get("dealerFrom") as FormGroup;
  }
  get accountFrom(): FormGroup {
    return this.formValue.get("accountFrom") as FormGroup;
  }
  get endUserFrom(): FormGroup {
    return this.formValue.get("endUserFrom") as FormGroup;
  }
  get marketBundleInfo(): FormArray {
    return this.formValue.get("marketBundleInfo") as FormArray;
  }
  get biddingId() {
    const { biddingApplyList } = this.baseInfoFromData.getRawValue()
    if (biddingApplyList && biddingApplyList.length > 0) {
      return biddingApplyList[0].id
    } else {
      return ""
    }
  }



  constructor(private fb: FormBuilder) { }
  contractTemplate(item) {
    //打开合同模版  

    this.title = item.templateName;
    let magnet;
    let tableParams: any;
    let totalPrice: any = "";
    const today = new Date();
    let marketBundleAmount; //数量
    let medicalDeviceName; //npmaNum;
    let countryOrigin; //原产地;countryOrigin
    let contractPrice; //单价
    let dealerAgreementNo: any = [];
    const {
      salesAgreementNo,
      importAgreementNo,
      purchaseOrderNumber,
      contractBuyerSignatory,
      contractBuyerSignatoryPosition,
      importAgreementSignName,
      importAgreementSignPosition,
      priceTerms,
      addressee,
      addresseeTel,
      portDestination,
      portDestinationEn,
      registrationAddress,
      transportMode,
      accountName,
      bankName,
      accountNo,
      purchaseOrderSignatory,
      purchaseOrderSignatoryPosition,
      invoiceMailingInformation,
      accountPhoneFax,
      taxNum,
    } = this.contractSignForm.getRawValue();

    const {//recipientPhone,
      // accountName,
      // bankName,
      // accountNo,
      // accountPhoneFax,
      // recipient,
      // taxNum,
      // invoicesDeliverAddress
    } = this.accountFrom.getRawValue(); //开票信息的电话
    const { orderModality, businessModel } = this.baseInfoFromData.getRawValue();
    // console.log("this.contractSignForm.getRawValue();",this.contractSignForm.getRawValue());
    const { dealerName, dealerPhone, dealerAddress, dealerContact, dealerCode } =
      this.dealerFrom.getRawValue();
    const marketBundleInfo = this.marketBundleInfo.getRawValue();

    let productModelLst = [];
    marketBundleInfo.map((val) => {
      if (
        val.productModel != "" && val.productModel != null &&
        val.productModel != undefined && (val.primaryOpportunity == 'true' || val.primaryOpportunity == true)
      ) {
        productModelLst.push(val.productModel);
      }
    })
    let productModel = productModelLst.join(",");

    marketBundleInfo.map(items => {

      if (orderModality == 'PD&IGT') {
        if (items.primaryOpportunity == 'true' || items.primaryOpportunity == true) {
          marketBundleAmount = items.marketBundleAmount;
          countryOrigin = items.originCountry;
          medicalDeviceName = items.medicalDeviceName;
          magnet = items.marketBundleBmc == 'MR' ? "磁体" : "";
        }
      }
      if (items.primaryOpportunity == 'true' || items.primaryOpportunity == true) {
        if (items.newDealerAgreementNo != null && items.newDealerAgreementNo != undefined && items.newDealerAgreementNo != "") {
          dealerAgreementNo.push(items.newDealerAgreementNo)
        }
        else if (items.dtcDealerAgreementNo != null && items.dtcDealerAgreementNo != undefined && items.dtcDealerAgreementNo != null) {
          dealerAgreementNo.push(items.dtcDealerAgreementNo)
        }
      }
    })
    dealerAgreementNo = Array.from(new Set(dealerAgreementNo)).join(",");
    //const orderSignName = this.dealerFrom.getRawValue().purchaseOrderSignatory;
    //const orderSignPost = this.dealerFrom.getRawValue().purchaseOrderSignatoryPosition;

    const { endUser, endUserAddress, endUserPhone, endUserContact, endUserId } =
      this.endUserFrom.getRawValue();
    const { tenderNum, biddingCompany, dealFormId, orderSales } =
      this.baseInfoFromData.getRawValue();
    let requiredArrivalDate = this.baseInfoFromData.getRawValue().requiredArrivalDate;
    let estimateInstallationDate = this.baseInfoFromData.getRawValue().estimateInstallationDate;
    const { foreignTradeCorpName, foreignTradeCorpAddress } =
      this.foreignFrom.getRawValue();

    const { totalContractPrice, dealPriceCny, dealPriceUsd, currencySystem} = this.priceApprovalData.getRawValue();


    estimateInstallationDate = estimateInstallationDate ? moment(estimateInstallationDate).format(
      "YYYY年MM月DD日"
    ) : null;
    requiredArrivalDate = requiredArrivalDate ? moment(requiredArrivalDate).format("YYYY年MM月DD日") : null;

    if (orderModality == "US" || orderModality == "CC") {
      const tableParamsParam: any = this.generateTableParams(item, marketBundleInfo, totalContractPrice, priceTerms);
      if (tableParamsParam) {
        totalPrice = tableParamsParam.totalPrice
        tableParams = tableParamsParam.tabList;
      }
      else {
        tableParams = null;
      }
    }
    else {
      contractPrice = floatDivide(totalContractPrice, marketBundleAmount);
      contractPrice = fomatFloat(contractPrice, 2);
      totalPrice = totalContractPrice;
      tableParams = null;
    }

    const params = {
      templateCode: item.code,
      dateYear: "", //投标开标的年
      dateMonth: "", //投标开标的月
      dateDay: "", //投标开标的日
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
      dealFormId: dealFormId,
      orderSales: orderSales,
      endUserId: endUserId ? endUserId : null,
      biddingId: this.biddingId,
      purchaseOrderNumber: purchaseOrderNumber, //采购订单号
      distributor: businessModel != "DIRECT" ? dealerName : "", //经销商名称
      distributorAddress: businessModel != "DIRECT" ? dealerAddress : "", //经销商地址
      addressee: addressee, //开票信息的收件人
      orderSignName: purchaseOrderSignatory, //经销商采购订单签署人
      orderSignPost: purchaseOrderSignatoryPosition, //经销商采购订单签署人职务
      addresseeTel: addresseeTel, //开票信息的电话
      invoiceMailingInformation: invoiceMailingInformation, //发票邮寄地址
      tableParamsList: tableParams ? JSON.stringify(tableParams) : null,
      endUser: endUser,
      dealerCode: businessModel != "DIRECT" ? (dealerCode ? dealerCode : null) : null,
      estimateInstallationDate: estimateInstallationDate, //预计到货日期
      requiredArrivalDate: requiredArrivalDate, //要求到货日期
      tenderNo: tenderNum,
      productModel: productModel, //产品型号
      importAgreementNo: importAgreementNo, //进口协议号
      foreignTradeCompany: foreignTradeCorpName, //外贸公司
      foreignTradeCompanyAddress: foreignTradeCorpAddress, //外贸公司地址
      accountName: accountName, //开户行名称
      accountAddress: registrationAddress, //注册地址
      telTax: accountPhoneFax, //电话
      bankName: bankName, //开户行
      accountNo: accountNo, //账号
      taxNumber: taxNum, //税号
      endUserAddress: endUserAddress, //最终用户地址
      endUserAddressCn: endUserAddress, //最终用户地址
      distributorPhone: dealerPhone, //经销商电话
      portDestination: portDestination, //目地港中文
      portShipment: portDestinationEn, //目地港英文
      typeShipping: transportMode, //运输方式
      importAgreementSignPost: importAgreementSignPosition, //进口协议签署人职务
      importAgreementSignName: importAgreementSignName, //进口协议签署人
      salesAgreementNo: salesAgreementNo, //买卖协议号
      contractSignatory: contractBuyerSignatory, //合同签署人
      contractSignatoryPost: contractBuyerSignatoryPosition, //合同签署人职务
      endUserContacts: endUserContact, //最终用户联系人
      endUserPhone: endUserPhone, //最终用户联系电话
      biddingName: biddingCompany, //投标公司
      priceTerms: priceTerms, //价格术语
      marketBundleAmount: marketBundleAmount ? marketBundleAmount : "",
      countryOrigin: countryOrigin ? countryOrigin : "",
      nmpaName: medicalDeviceName ? medicalDeviceName : "",
      salesLeaderPost: "salesLeader", //职位
      salesLeaderPosition: "salesLeader",//职位
      totalContractPrice: totalContractPrice ? NumberThousandth(fomatFloat(totalContractPrice, 2)) : "", //进单单位合同价
      totalPrice: totalPrice ? totalPrice : "", //表格总价
      contractPrice: contractPrice ? NumberThousandth(fomatFloat(contractPrice, 2)) : "",//单价  
      dealerAgreementNo: businessModel != "DIRECT" ? dealerAgreementNo : "", //经销商协议号
      magnet,   //是否显示表格中的磁体
      dealFormPrice: currencySystem === 'CNY'?(dealPriceCny?dealPriceCny:""):(currencySystem === 'USD'?(dealPriceUsd?dealPriceUsd:""):""), //dealForm总价     
      //biddingAgency: //招标机构
      //totalPriceNumber: 9012392, // 表格总金额（阿拉伯数字）
    };
    // for (let key in params) {
    //   if (!!!params[key]) {
    //     // delete params[key];
    //     params[key] = "";
    //   }
    // }
    this.pdfSRC = params;
    this.isPdf = true;
  }
  /**
   * 
   * @param item  合同模版的code US or CC
   * @param marketBundleInfo   产品信息 
   * @param totalContractPrice  进单单位合同价
   * @priceTerms priceTerms 价格术语
   * @returns 
   */
  generateTableParams(item: any, marketBundleInfo: any, totalContractPrice: any, priceTerms) {

    let totalPrice: any = 0;
    const codeList = [
      "EcosUS01", "EcosUS02", "EcosUS03", "EcosUS04", "EcosUS05", "EcosUS06",
      "EcosS1007_P202303", "EcosS1008_P202303", "EcosS2002_P202303",
    ];
    const codeColSix = [ "EcosUS03", "EcosUS04", "EcosUS05" ];
    const usIncludeMsg = ["EcosS1007_P202303"]
    const ccTempCodeList = ["EcosCC01", "EcosCC02", "EcosS1003_P202303"];
    const ccCodeFive = ["EcosS1003_P202303"];

    //US生成表格
    if (codeList.includes(item.code)) {
      const codeListIndex = [{ code: "EcosUS01", tableIndex: 1 },
      { code: "EcosUS02", tableIndex: 1 },
      { code: "EcosUS03", tableIndex: 0 },
      { code: "EcosUS04", tableIndex: 1 },
      { code: "EcosUS05", tableIndex: 1 },
      { code: "EcosUS06", tableIndex: 1 },
      { code: "EcosS1007_P202303", tableIndex: 1 },
      { code: "EcosS1008_P202303", tableIndex: 1 },
      { code: "EcosS2002_P202303", tableIndex: 5 },
      ]
      let resultData = {
        totalPrice: "",
        tabList: [],
      };
      const tab = codeListIndex.find(val => val.code == item.code)
      let result = [{
        index: tab.tableIndex,
        dataList: []
      }]
      marketBundleInfo.map((items, index) => {
        if (items.primaryOpportunity == 'true' || items.primaryOpportunity == true) {
          let unitPrice: any = floatDivide(totalContractPrice, items.marketBundleAmount)
          unitPrice = NumberThousandth(fomatFloat(unitPrice, 2))
          let arr = [{ cellName: index + 1 },
          { cellName: items.medicalDeviceName + " \n产品型号:" + items.productModel + (usIncludeMsg.includes(item.code)? " \n含相关的：以附件一配置清单为准":"") },
          { cellName: items.marketBundleAmount },
          { cellName: (items.originCountry ? items.originCountry : "") + " +Philips" },
          ];

          if (codeColSix.includes(item.code)) {
            const arrCol = [{ cellName: unitPrice },
            { cellName: NumberThousandth(fomatFloat(totalContractPrice,2)) },]
            arr = [...arr, ...arrCol]
          }
          else {
            const arrCol = [{ cellName: priceTerms ? priceTerms : "" },
            { cellName: unitPrice },
            { cellName: NumberThousandth(fomatFloat(totalContractPrice,2)) },]
            arr = [...arr, ...arrCol]
          }
          result[0].dataList.push(arr)
          totalPrice += totalContractPrice
        }
      })
      resultData.totalPrice = totalPrice;
      resultData.tabList = result;
      return resultData;

    } else if (ccTempCodeList.includes(item.code)) {
      //CC生成表格
      const codeIndexList = [{ code: "EcosCC01", tableIndex: 1 },
      { code: "EcosCC02", tableIndex: 1 },
      { code: "EcosS1003_P202303", tableIndex: 1 },
      ]
      let resultData = {
        totalPrice: "",
        tabList: [],
      };
      const tab = codeIndexList.find(val => val.code == item.code)
      let result = [{
        index: tab.tableIndex,
        dataList: []
      }]
      marketBundleInfo.map((items, index) => {
        //只有医疗器械名称，原产国，数量
        if (items.primaryOpportunity == 'true' || items.primaryOpportunity == true) {
          let arr = [{ cellName: index + 1 },
          { cellName: items.medicalDeviceName },
          ];

          if(ccCodeFive.includes(item.code)){
            const arrCol = [
              { cellName: items.marketBundleAmount },
              { cellName: "" },
              { cellName: "" },
            ]
            arr = [...arr, ...arrCol]
          } else {
            const arrCol = [
              { cellName: (items.originCountry ? items.originCountry : "") + " +Philips" },
              { cellName: items.marketBundleAmount },
              { cellName: "" },
              { cellName: "" },
            ]
            arr = [...arr, ...arrCol]
          }
          result[0].dataList.push(arr)
        }
      })
      resultData.totalPrice = totalPrice;
      resultData.tabList = result;
      return resultData;

    } else {
      return null;
    }
  }
  ngOnInit() {
    this.init()
  }
  init() {
    // const zslSignSupplement = this.activatedRouter.queryParams['value'].zslSignSupplement;
    // const roleList = JSON.parse(localStorage.getItem("roles"));
    // const applySignatureBtn = roleList.includes("OA"); //如果是oa可以发起签名申请
    // if (applySignatureBtn && zslSignSupplement == '1') {
    //   this.applySignatureBtn = true;
    // }
    if (this.needFileType == "contract") {
      this.signFileForm.get("contractFile").enable();
      let contractUploaded = this.signFileForm.get("contractUploaded").value;
      if (contractUploaded == "0") {
        this.signFileForm.get("contractUploaded").enable();
      } else {
        this.signFileForm.get("contractUploaded").disable();
      }
    } else if (this.needFileType == "third") {
      this.signFileForm.get("contractFile").disable();
      this.signFileForm.get("contractUploaded").disable();
      this.signFileForm.get("contractConfirmedDate").disable();
    } else {
      if (this.flag === "0") {
        this.signFileForm.get("contractUploaded").enable();
        this.signFileForm.get("contractFile").enable();
        this.signFileForm.get("contractConfirmedDate").enable();
      } else {
        this.signFileForm.get("contractFile").disable();
        this.signFileForm.get("contractUploaded").disable();
        this.signFileForm.get("contractConfirmedDate").disable();
      }
    }
  }
  public isPdfCancel() {
    this.isPdf = false;
  }

  handleFileSigned({ signedFileId, unsignedFileId }) {
    const signedFileRelationList = this.signFileForm.get('signedFileRelationList') as FormArray
    const signedFileRelation = this.fb.group({
      signedFileId, unsignedFileId
    })
    signedFileRelationList.push(signedFileRelation)
    console.log('add', this.signFileForm.getRawValue());
  }

  handleFileDeleted({ signedFileId }) {
    const signedFileRelationList = this.signFileForm.get('signedFileRelationList') as FormArray
    const index = signedFileRelationList.getRawValue().findIndex((item) => item.signedFileId === signedFileId)
    if (index > -1) { signedFileRelationList.removeAt(index) }
    console.log('delete', this.signFileForm.getRawValue());
  }

  handleSourceFileDeleted(sourceFileId) {
    const signedFileRelationList = this.signFileForm.get('signedFileRelationList') as FormArray
    const index = signedFileRelationList.getRawValue().findIndex((item) => item.unsignedFileId === sourceFileId)
    if (index > -1) { signedFileRelationList.removeAt(index) }
    console.log('delete', this.signFileForm.getRawValue());
  }
}
