import { Component, OnInit, Input, Output, EventEmitter,ViewChild,ChangeDetectorRef } from "@angular/core";
import { FormArray, FormGroup, FormBuilder, Validators } from "@angular/forms";
import { OrderV3Service } from "../../order-v3.service";
import { haveRolesArr, stringIndexof } from '@core/util/tools';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpService } from "@core/services/http.service";
import { saveAs } from 'file-saver';
@Component({
  selector: "pre-product-table",
  templateUrl: "./pre-product-table.component.html",
  styleUrls: ["./pre-product-table.component.scss"],
})

export class PreProductTableComponent implements OnInit {
  constructor(private fb: FormBuilder,
             private service: OrderV3Service, 
             private activatedRouter: ActivatedRoute,
             private http: HttpService,
             public changeDetectorRef: ChangeDetectorRef) {

    // this.service.productReceive.subscribe((val) => {      
    //   const ASYNS = async () => { 

    //     if (this.status == "ecos_oit_deal_resubmit" ||this.status=="ecos_oit_deal_sales"|| this.status == "ecos_oit_deal_submit"||this.status == "ecos_status_draft"||this.status == ""||this.status ==undefined) {
    //     //this.departMent()        
    //     const baseInfoFrom=val.get("baseInfoFrom") as FormGroup
    //     const dealerFrom = val.get("dealerFrom") as FormGroup;
    //     const businessModel=baseInfoFrom.getRawValue().businessModel
    //     const dealercode = dealerFrom.getRawValue().dealerCode;  
    //     if(businessModel=='DISTRIBUTOR')
    //     {

    //       if(typeof dealercode=="string"&&dealercode != undefined && dealercode != null && dealercode != ""){            
    //        const dealerCodeList = await this.service.dealAgreement(dealercode);          
    //        this.dealerCodeList=dealerCodeList.map((item) => ({ ...item, label:item.agreementNo,value: item.agreementNo}))
    //       } 

    //     } 
    //   }       
    //   };
    //   ASYNS();
    // });
  }
  @ViewChild('selectNmpa') selectNmpa;
  @Input() baseInform: FormGroup;
  @Input() productGroup: FormGroup;
  @Input() index: any;
  @Input() editable: any = true;
  @Input() editPreTable: any = true;
  @Input() isContract: any = false;
  @Output() selecthost = new EventEmitter();
  dealerCodeList: any;

  public prodIndex: any;
  public user: any;
  public isVisib = false;
  public isStandard = false;
  public status;
  public departmentList: any = []
  public departmentListFirst: any = [];
  public departmentListSecond: any = [];
  public optionInfo: any = [];
  public productInfo: any = [];
  public flag: any;
  // 价格查看权限
  public price_permission: boolean = false;
  ngOnInit() {
    this.init();
  }
  ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();
  }
  ngOnChanges() {
  }
  init() {
    this.status = this.activatedRouter.queryParams["value"].taskStatus;
    const arr = JSON.parse(localStorage.getItem('permissions'));
    if (arr) {
      this.price_permission = haveRolesArr(arr.price);
    }
    this.flag = this.activatedRouter.queryParams["value"].flag;
  }
  async departMent() {
    //科室列表
    if (this.departmentList.length == 0) {
      const departmentListFirst = await this.service.departmentItemList()
      this.departmentList = departmentListFirst.data;
      this.departmentListFirst = this.departmentList.map(item => {
        let obj = {
          department: item.department,
          departmentLable: item.department
        }
        return obj
      })
      if (this.departmentListFirst.length > 0) {
        this.marketBundleInfo.controls.forEach((items, index) => {
          const group = this.marketBundleInfo.at(index) as FormGroup
          const firstLevelDepartment = group.getRawValue().firstLevelDepartment;
          const select = this.departmentList.find(items => items.department == firstLevelDepartment);
          if (select) {
            const group = this.marketBundleInfo.at(index) as FormGroup;
            group.patchValue({
              departmentListSecond: select.children
            })
          }
        })
      }
    }
  }

  get baseInfoFromData(): FormGroup {
    return this.baseInform.get("baseInfoFrom") as FormGroup;
  }
  get marketBundleInfo(): FormArray {
    return this.productGroup.get("marketBundleInfo") as FormArray;
  }
  get orderBaseinfo(): FormGroup {
    if (this.isContract) {
      return this.productGroup.get('baseInfoFrom') as FormGroup;
    }
    else {
      return this.productGroup.get('orderBaseinfo') as FormGroup;
    }
  }
  get orderSalesinfo(): FormGroup {
    if (!this.isContract) {
      return this.productGroup.get('orderSalesinfo') as FormGroup;
    }
  }
  usRequired() {
    // if(this.orderBaseinfo.getRawValue().orderModality=='US')
    // {

    //   const group=this.marketBundleInfo.controls.map((val,index)=>{

    //     val.get('firstLevelDepartment').setValidators(Validators.required)
    //     val.get('secondaryDepartment').setValidators(Validators.required)
    //     val.get('firstLevelDepartment').updateValueAndValidity()
    //     val.get('secondaryDepartment').updateValueAndValidity();
    //    }
    //   )
    //   return true;
    // }

  }
  departFirstChange($event, i) {

    if ($event == null || $event == undefined || $event == '') {
      return;
    }
    const group = this.marketBundleInfo.at(i) as FormGroup;
    const { departmentListFirst, departmentList } = group.getRawValue()
    const select = departmentList.find(val => val.department == $event);
    if (select) {

      group.patchValue({
        departmentListSecond: select.children
      })
      const { secondaryDepartment, departmentListSecond } = group.getRawValue();
      let item = departmentListSecond.find(val => val.department == secondaryDepartment);
      if (!item) {
        group.patchValue({
          secondaryDepartment: null,
        })
      }
    }
  }
  cheakOption(i) {
    //打开option
    this.isVisib = true;
    this.prodIndex = i;
    const marketBundleInfo = this.marketBundleInfo.at(i) as FormGroup;
    let optionInfo = marketBundleInfo.getRawValue().optionInfo;
    this.optionInfo = optionInfo;
  }

  cheakProudOption(i) {//打开标准配置

    this.isStandard = true;
    const marketBundleInfo = this.marketBundleInfo.at(i) as FormGroup;
    let productInfo = marketBundleInfo.getRawValue().productInfo;
    this.productInfo = productInfo;
  }
  onStandardHide() {
    this.isStandard = false;
  }
  onHide() {

    this.isVisib = false;
    if (this.flag == 0 && this.status == "ecos_oit_deal_oa") {
      const marketBundleInfo = this.marketBundleInfo.at(this.prodIndex) as FormGroup;
      let medicalDeviceName: any = [];
      let productModel: any = [];
      if (this.optionInfo && this.optionInfo.length) {
        this.optionInfo.map(val => {
          if (val.medicalDeviceName != null && val.medicalDeviceName != undefined && val.medicalDeviceName != "") {
            medicalDeviceName.push(val.medicalDeviceName)
          }
        });
        this.optionInfo.filter(val => {
          if (val.productModel && val.productModel != null && val.productModel != undefined && val.productModel != "") {
            productModel.push(val.productModel)
          }
        }
        );
        medicalDeviceName.length > 0 && (medicalDeviceName = medicalDeviceName.join(","));
        productModel.length > 0 && (productModel = productModel.join(","));
        marketBundleInfo.patchValue({
          medicalDeviceName,
          productModel
        })
      }
    }
  }
  hostName(i) {

    this.user = localStorage.getItem("ecom_ng_philips_code1");
    if (!this.isContract) {
      const filter = /[\u4E00-\u9FA5\uF900-\uFA2D]{1,}/;

      const orderSales = this.orderSalesinfo.getRawValue().orderSales;
      //const noworderSales = filter.test(orderSales) ? stringIndexof(orderSales) : orderSales;
      if (this.editable && orderSales == this.user) {
        const marketBundleInfo = this.marketBundleInfo.at(i) as FormGroup;
        this.marketBundleInfo.controls.map((val, index) => {
          const marketBundleInfos = this.marketBundleInfo.at(index) as FormGroup;
          marketBundleInfos.patchValue({
            primaryOpportunity: 'false',
          });
        });
        marketBundleInfo.patchValue({
          primaryOpportunity: 'true',
        });
      }
    }


    this.selecthost.emit(this.index)
  }
  onDealerAgreementChange(product, agreementno) {
    const { dealerCodeList } = product.getRawValue();
    if (dealerCodeList && dealerCodeList.length > 0) {
      const agreement = dealerCodeList.find(({ value }) => value === agreementno)
      if (agreement) {
        const { currentterritory, currentproduct } = agreement
        product.patchValue({
          authorizedProduct: currentproduct,
          authorizedArea: currentterritory,
        })
      }
      else {
        product.patchValue({
          authorizedProduct: "",
          authorizedArea: "",
        })
      }
    }
    else {
      product.patchValue({
        authorizedProduct: "",
        authorizedArea: "",
      })
    }
  }
  btnshow() {
    const orderModality = this.orderBaseinfo.getRawValue().orderModality;
    if (orderModality == 'PD&IGT') {
      return true;
    }
    else {
      return false;
    }
  }
  fileDown({ fileId, fileName }) {
    let uri = `/act/system/download/${fileId}`;
    this.http.get(uri, {
      responseType: 'blob'
    }).subscribe(data => {
      saveAs(data, fileName);
    });
  }

  onShowSelectNmpaModal(i) {
    this.prodIndex = i;
    const marketBundleInfo = this.marketBundleInfo.at(i) as FormGroup;
    const {marketBundleBmc}=marketBundleInfo.getRawValue()
    const param={
      modalityBmc:marketBundleBmc,
      productModel:"",
      registrationNumber:"",
    }
    this.selectNmpa.show(param, true);
  }
  onNmpaFormSelect(val)
  {
    const marketBundleInfo = this.marketBundleInfo.at(this.prodIndex) as FormGroup;
    marketBundleInfo.patchValue({
      medicalDeviceName:val.medicalDeviceName,
      nmpaNum:val.registrationNumber,
      originCountry:val.countryOfOrigin,
      originCountryEn:val.countryOfOriginEn,
      nmpaValidityDate:val.expiredBy
    })
  }
  onClearNmpa(i)
  {
    const marketBundleInfo = this.marketBundleInfo.at(i) as FormGroup;    
    marketBundleInfo.patchValue({
      nmpaNum:null,
      medicalDeviceName:null,
      originCountry:null,
      originCountryEn:null,
      nmpaValidityDate:null,
    })
  }

}
