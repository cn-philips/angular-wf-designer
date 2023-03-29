import { Component, EventEmitter, Input, OnInit, Output, SimpleChange, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
import {
  decodeString,
  standardTime,
  upLoadFileNew,
} from '@core/util/tools';
import { ServesiceService, HttpService } from '@core/services';
import { differenceInCalendarDays } from 'date-fns';
@Component({
  selector: "app-prebase-info",
  templateUrl: "./prebase-info.component.html",
  styleUrls: ["./prebase-info.component.scss"],
})
export class PrebaseInfoComponent implements OnInit {
  @ViewChild("childbase") public childbase;
  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    public activatedRouter: ActivatedRoute,
    private http: HttpService,
    private el: ElementRef,
    private ServesiceService: ServesiceService
  ) {
    //this.getDistributorList();
    this.getRateList();
    this.getPoolList();
    this.getPrebookReason();
  }
  ngOnChanges(changes: SimpleChange) {
    //回显产品里边信息
    this.ServesiceService.netPrice.subscribe((res) => {
      this.dataBase.preBookNumbers = [];
      if (this.dataBase.productList.length > 0) {
        let summay = 0;
        this.dataBase.productList.map((a) => {
          summay = (summay * 100 + a.totalPrice * 100) / 100;
          a.productList.map((val) => {
            if (val.checked) {
              let obj = {
                modelNumber: val.modelNumber,
                marketBundleQuantity: val.marketBundleQuantity,
              };
              this.dataBase.preBookNumbers.push(obj);
            }
          });
        });
        this.dataBase.netPrice = this.returnFloat(
          Number(summay.toString().match(/^\d+(?:\.\d{0,4})?/)),
          4
        );
      }
    });
    if (this.dataBase) {
      if (this.dataBase.invoiceInformation == "USD") {
        this.dataBase.ddpStatus = this.isadopt(
          this.dataBase.contractEndDate,
          1
        );
        this.dataBase.contractDdpStatus = this.isadopt(
          this.dataBase.poolEndDate,
          2
        );
      }
      if (this.dataBase.hospitalNature) {
        this.load = true;
        const flag = this.dataBase.detail.flag;
        const status = this.dataBase.detail.status;
        const ASYNS = async () => {
          let getPool = await this.getPoolList();
          if (this.dataBase.distributor) {
            let distributor = this.dataBase.distributor
              ? this.dataBase.distributor.replace(/\s+/g, "")
              : "";
            let getDistributor = await this.distributorLoad(distributor);
          }
          // let getDistributor = await this.getDistributorList();
          let getRateLists = await this.getRateList();
          this.dataBase.afterSales =
            this.dataBase.afterSales != null ? this.dataBase.afterSales : "0";
          this.load = false;
          await this.GetDealLists(this.dataBase.dealFormId);
          const mainId = decodeString(
            this.activatedRouter.queryParams["_value"].id
          );
          // if(mainId)
          // {
          //   this.getPreBookOit(mainId)
          // }
          this.ifBusinessModel();
        };
        ASYNS();
        if (this.dataBase.cteam) {
          this.dataBase.userTeme = this.dataBase.cteam;
        } else {
          let teamList = JSON.parse(window.localStorage.getItem("profiles"));
          let teamRole = teamList.find((val) => val.role == "Sales Rep/Mgr");
          teamRole && (this.dataBase.userTeme = teamRole.team);
        }
        this.StockOff =
          (this.dataBase.entryMode == "BIDDING" &&
            this.dataBase.endUsers == "Stock") ||
          this.dataBase.entryMode == "STOCK"
            ? false
            : true;

        if (this.dataBase.businessModel == "DISTRIBUTOR" && this.conTable) {
          this.dealerCodeList();
        }
        this.entryMode = this.dataBase.entryMode;
      }
    }
    if (this.dataBase && this.dataBase.entryMode) {
      if (this.dataBase.entryMode === "STOCK") {
        /*业务模式 插眼*/

        /* 业务模式为stock时 以下字段为非必选项目 */
        // 投标公司               tenderingCompany
        // 招标编号               tenderNo
        // 进口协议签署人职务      importAgreementSignPost
        // 最终用户                endUser
        // 医院性质                hospitalNature
        // 最终用户地址            endUserAddress
        // 最终用户联系人           endUserContacts
        // 最终用户电话             endUserPhone
        /*end*/
        this.validateForm.get("tenderingCompany")!.clearValidators();
        this.validateForm.get("tenderingCompany")!.markAsPristine();
        this.validateForm.get("tenderNo")!.clearValidators();
        this.validateForm.get("tenderNo")!.markAsPristine();
        this.validateForm.get("endUser")!.clearValidators();
        this.validateForm.get("endUser")!.markAsPristine();
        this.validateForm.get("hospitalNature")!.clearValidators();
        this.validateForm.get("hospitalNature")!.markAsPristine();
        this.validateForm.get("endUserAddress")!.clearValidators();
        this.validateForm.get("endUserAddress")!.markAsPristine();
        this.validateForm.get("endUserContacts")!.clearValidators();
        this.validateForm.get("endUserContacts")!.markAsPristine();
        this.validateForm.get("endUserPhone")!.clearValidators();
        this.validateForm.get("endUserPhone")!.markAsPristine();
        this.validateForm.get("endUserPhone")!.setValidators([this.checkPhone]);
        this.validateForm.get("importAgreementSignPost")!.clearValidators();
        this.validateForm.get("importAgreementSignPost")!.markAsPristine();
        this.validateForm.get("endUserEmail")!.clearValidators();
        this.validateForm.get("endUserEmail")!.markAsPristine();
        this.validateForm.get("endUserEmail")!.setValidators([this.cheakMail]);
      } else {
        this.validateForm
          .get("tenderingCompany")!
          .setValidators(Validators.required);
        // this.validateForm.get('tenderingCompany')!.markAsDirty();
        this.validateForm.get("tenderNo")!.setValidators(Validators.required);
        // this.validateForm.get('tenderNo')!.markAsDirty();
        this.validateForm.get("endUser")!.setValidators(Validators.required);
        // this.validateForm.get('endUser')!.markAsDirty();
        this.validateForm
          .get("hospitalNature")!
          .setValidators(Validators.required);
        // this.validateForm.get('hospitalNature')!.markAsDirty();
        this.validateForm
          .get("endUserAddress")!
          .setValidators(Validators.required);
        // this.validateForm.get('endUserAddress')!.markAsDirty();
        this.validateForm
          .get("endUserContacts")!
          .setValidators(Validators.required);
        // this.validateForm.get('endUserContacts')!.markAsDirty();
        this.validateForm
          .get("endUserPhone")!
          .setValidators([Validators.required, this.checkPhone]);
        // this.validateForm.get('endUserPhone')!.markAsDirty();
        this.validateForm
          .get("importAgreementSignPost")!
          .setValidators(Validators.required);
        // this.validateForm.get('importAgreementSignPost')!.markAsDirty();
        this.validateForm
          .get("endUserEmail")!
          .setValidators([Validators.required, this.cheakMail]);
      }
      this.validateForm.get("tenderingCompany")!.updateValueAndValidity();
      this.validateForm.get("tenderNo")!.updateValueAndValidity();
      this.validateForm.get("endUser")!.updateValueAndValidity();
      this.validateForm.get("hospitalNature")!.updateValueAndValidity();
      this.validateForm.get("endUserAddress")!.updateValueAndValidity();
      this.validateForm.get("endUserContacts")!.updateValueAndValidity();
      this.validateForm.get("endUserPhone")!.updateValueAndValidity();
      this.validateForm
        .get("importAgreementSignPost")!
        .updateValueAndValidity();
      this.validateForm.get("endUserEmail")!.updateValueAndValidity();
    }
    if (this.dataBase && this.dataBase.financialProgramme == "2") {
      this.financiaWidth = "7";
    } else {
      this.financiaWidth = "14";
    }

    this.viewData(
      "supportFile",
      "supportFileNameList",
      this.dataBase.supportFileName
    );
  }
  ngOnInit() {
    this.getEntryModeList();
    this.getBusinessModelList();
    this.getfinancialList();
    this.validateForm = this.fb.group({
      agreementNo: new FormControl({ value: "Nancy", disabled: this.disa }),
      afterSales: new FormControl({ value: "Nancy", disabled: this.disa }), //是否售后
      afterSalesRemarks: new FormControl({
        value: "Nancy",
        disabled: this.disa,
      }), //是否售后文本框
      freeText: new FormControl({ value: "Nancy", disabled: this.disa }),
      contractEndDate: new FormControl(
        { value: "Nancy", disabled: true },
        Validators.required
      ), //经销商ddp结束日期
      poolEndDate: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ), //外贸公司ddp结束日期
      financialProgrammeCost: new FormControl({
        value: "Nancy",
        disabled: true,
      }), //金融金额
      financialProgramme: new FormControl({ value: "Nancy", disabled: true }), //金融方案
      financialProgrammeTxt: new FormControl({
        value: "Nancy",
        disabled: true,
      }), //金融文本框
      tradeInCost: new FormControl({ value: "Nancy", disabled: true }), //tradeIn金额
      rebateCost: new FormControl({ value: "Nancy", disabled: true }), //rebate金额
      ddpStatus: new FormControl(
        { value: "Nancy", disabled: true },
        Validators.required
      ),
      billingInfor: new FormControl({ value: "Nancy", disabled: this.disa }),
      contractBuyer: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ),
      contractBuyer2: new FormControl({ value: "Nancy", disabled: this.disa }),
      businessModel: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ),
      team: new FormControl(
        { value: "Nancy", disabled: true },
        Validators.required
      ), //team
      region: new FormControl(
        { value: "Nancy", disabled: true },
        Validators.required
      ), //大区
      smallArea: new FormControl(
        { value: "Nancy", disabled: true },
        Validators.required
      ), //小区
      distributorAddress: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ),
      distributorContacts: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ),
      distributorPhone: new FormControl({ value: "", disabled: this.disa }, [
        Validators.required,
        this.checkPhone,
      ]),
      distributorEmail: new FormControl(
        { value: "Nancy", disabled: this.disa },
        [Validators.required, this.cheakMail]
      ),
      orderSignName: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ),
      orderSignPost: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ),
      contractDdpStatus: new FormControl(
        { value: "Nancy", disabled: true },
        Validators.required
      ),
      contractBuyerAddress: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ),
      contractBuyerContacts: new FormControl(
        { value: "Nancy", disabled: this.disa },
        null
      ),
      contractBuyerPhone: new FormControl(
        { value: "Nancy", disabled: this.disa },
        null
      ),
      contractBuyerEmail: new FormControl(
        { value: "Nancy", disabled: this.disa },
        null
      ),
      importAgreementSignName: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ),
      importAgreementSignPost: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ),
      endUserId: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ),
      endUserEmail: new FormControl({ value: "Nancy", disabled: this.disa }, [
        this.cheakMail,
      ]),
      endUser: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ),
      endUserContacts: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ),
      endUserPhone: new FormControl({ value: "Nancy", disabled: this.disa }, [
        Validators.required,
      ]),
      endUserAddress: new FormControl({ value: "Nancy", disabled: this.disa }),
      sampleAuditFlag: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ),
      hospitalNature: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ),
      invoiceInformation: new FormControl(
        { value: "Nancy", disabled: true },
        Validators.required
      ),
      distributor: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ),
      distributor1: new FormControl({ value: "Nancy", disabled: this.disa }),
      tenderingCompany: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ),
      tenderNo: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ),
      entryMode: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ),

      foreignTradeCompany: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ), // 外贸公司
      foreignTradeCompanyAddress: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ), // 外贸地址
      foreignTradeCompanyContacts: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ), // 外贸联系人
      foreignTradeCompanyPhone: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ), // 外贸公司电话
      foreignTradeCompanyEmail: new FormControl(
        { value: "Nancy", disabled: this.disa },
        [Validators.required, this.cheakMail]
      ), // 外贸公司邮箱
      sameFlag: new FormControl({ value: "Nancy", disabled: this.disa }, null), // 外贸公司是否与经销商相同
      contractSignatory: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ), // 合同签署人
      contractSignatoryPost: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ), // 合同签署人职务
      dealFormId: new FormControl(
        { value: "Nancy", disabled: true },
        Validators.required
      ), //dealFormId
      dealContractPrice: new FormControl(
        { value: "Nancy", disabled: true },
        Validators.required
      ), //dealForm总价
      netPrice: new FormControl(
        { value: "Nancy", disabled: true },
        Validators.required
      ), //netPrice价格
      preReason: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ), //prebook原因
      preDescription: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ), //详细说明
      oitMonthEstimate: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ), //oit预计月份
      shippingType: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ), //运输方式
      arrivalDate: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ), //客户要求时间
      ifcMonth: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ), //预计ICF月份
      isPenalty: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ), //延迟缴罚款
      downpaymentDate: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ), //头期支付日期
      balancePaymentDate: new FormControl(
        { value: "Nancy", disabled: this.disa },
        Validators.required
      ), //尾款支持日期
    });
    const roles = JSON.parse(localStorage.getItem("roles"));
    this.dataBase.tableColOffs = roles.some(
      (val) =>
        val == "OA" ||
        val == "OA Leader" ||
        val == "CFC Leader" ||
        val == "ZPM" ||
        val == "PM Leader" ||
        val == "PM Leader_change" ||
        val == "Distributor leader" ||
        val == "ZSL" ||
        val == "COP Operation" ||
        val == "Finance: C&C Leader" ||
        val == "Cluster BP" ||
        val == "OM" ||
        val == "Sales Leader" ||
        val == "C&C Leader"
    );
    this.handleImport()
  }
  @Input() public dataBase: any = {
    productList: [], // 产品列表
    detail: {
      id: "",
      flag: "0",
      status: "",
    },
  };
  public pageParam: any = {
    //最终用户的弹出窗口
    total: 0,
    pageNo: 1,
    pageSize: 5,
    customerName: "",
    endUserId: "",
  };
  public pageParamdis: any = {
    total: 0,
    pageNo: 1,
    pageSize: 5,
    agreementNo: "", //协议号
    dealerCode: "", //经销code
    dealerName: "", //经销商名称
    selectName: "", //当前选中
  };
  @Input() public conTable = false;
  @Input() public disa = false;
  @Output() public updateData = new EventEmitter<any>();
  @Output() public importing = new EventEmitter<any>();
  @ViewChild("child") child;
  @ViewChild("childDis") childDis;
  public distrbutorOff: any = false;
  public dealshow: any = {
    tablehead: [
      { name: "授权地区", width: "300px" },
      { name: "授权产品", width: "300px" },
    ],
    data: [],
  };
  public isAgre: any = false; //最终用户弹出窗口控制
  public isAgres: any = false; //经销商协议号弹窗口控制
  public supportFileNameList = []; //支持文件
  public prebookReasonList = [];
  public entryModeList = [];
  public entryModeLists = []; //零时存一下
  public entryMode: any;
  public dealList: any = []; //经销商协议号列表
  public load: any = false;
  public pricevalue: any = { id: "" };
  public today = new Date();
  public StockOff: any = true; //最终用户安扭是否禁用
  public box: any = false;
  public dealFormIdinput: any = "";
  public dealformlist: any = [];
  public isVisibleCPResult = false;
  public ckdealformlist: any = {};
  public redFlagListPool: any; //控制redflag的外贸公司内容
  public validateForm: FormGroup;
  public lateDayOff: any = false; //控制经销商过期显示
  public lateDateOff: any = false; //控制外贸公司过期显示
  public laterDay: any; //经销商
  public lateDays: any; //外贸
  public distributorList = [];
  public poolList = [];
  public style: any = { width: "100%" }; //控制日期控件样式
  public distributorOff: any = false; //经销商是否在经销商列表
  public foreignTradeOff: any = false; //外贸公司是否在iepool
  public financiaWidth: any = "14";
  public financialList: any = []; //下拉列表
  public businessModelList = [];
  public currId: any;
  public redFlagList: any; //控制redflag的经销商内容
  public oitList: any = [];
  deal_load: any = false; // 查询框加载
  //支持文件上传
  //状态
  // TaskAsUrl(task) {
  //   switch (task) {
  //     case 'DOACS':
  //       return 'pre-order/audit';
  //       break;
  //     case 'DTJ':
  //       return 'pre-order/modifs';
  //       break;
  //     case 'YZBQR':
  //       return 'winning';
  //       break;
  //     case 'DSWZYQR':
  //       return 'winning';
  //       break;
  //     case 'YZBQRDBCWJ':
  //       return 'support-up';
  //       break;
  //     case 'DSWYSH':  case 'XSBMDMSH':  case 'XSBMZSLSH':  case '2JSH':
  //       return 'tenderreview';
  //       break;
  //     case 'DSWZYSQ':
  //       return 'emp';
  //       break;
  //     case 'DZLCSH':  case 'JDEND':
  //       return 'pre-order/view-subp';
  //       break;
  //     case 'DOITWJSC':  case 'OITEND':  case 'DBCWJSC':
  //       return 'pre-order/complete-oit';
  //       break;
  //     case 'OITENDDBCWJSC':
  //       return 'pre-order/supp-file';
  //       break;
  //     case 'DODSH':
  //       return 'pre-order/in-order-exam';
  //       break;
  //     case 'DXSBMSH':  case 'DXSBM2JSH':  case 'DOAJDQR':  case 'DHTOASH':  case 'DFBSH':  case 'DTPJDSH':
  //       return 'pre-order/examine-order';
  //       break;
  //     case 'DHTGYBTX':  case 'XJDHTGYBTX':
  //       return 'pre-order/in-con-modif';
  //       break;
  //     case 'DHTQS':
  //       return 'pre-order/con-sign';
  //       break;
  //     case 'DTXHT':
  //       return 'pre-order/in-order';
  //       break;
  //     case 'DBCWJSC':
  //       return 'pre-order/supp-file';
  //       break;
  //     case 'WZB':  case '2CKB':
  //       return 'bid';
  //       break;
  //     case 'DCDSH':  case 'DOACS':
  //       return 'pre-order/audit';
  //       break;
  //   }
  //   return '';
  // }
  // //prebook关联的oit文件
  // getPreBookOit(id)
  // {
  //   let url=`/act/prebook/getPreBookOit?mainId=${id}`
  //   return new Promise((resolve, reject) => {
  //     this.http.get(url).subscribe((rest => {
  //       if (rest.code === '0000'&&rest.data) {
  //          this.oitList=rest.data;
  //       }
  //     }), (error => {
  //       this.message.create("error", "请求异常")
  //     }));
  //   })
  // }
  // //跳转
  // toWin(item) {
  //   const url = this.TaskAsUrl(item.taskStatus);
  //   const id = item.mainId;
  //   if (item.taskStatus === 'DTJ') {
  //     window.open(location.origin + environment.base_href + '/#/' + url + '?id=' + codeString(id) + '&flag=1');
  //   } else {
  //     window.open(location.origin + environment.base_href + '/#/' + url + '?id=' + codeString(id) + '&flag=1' + '&state=' + item.taskStatus+'&status=' + item.taskStatus);
  //   }
  // }
  //经销用户列表
  distributorLoad(val) {
    let params: any = {
      pageNo: 1,
      pageSize: 5,
      dealerName: val, //经销商名称
    };
    return new Promise((resolve, reject) => {
      this.http
        .post(`/act/preparation/getDealersOnlyWithRegFlag`, params)
        .subscribe(
          (rest) => {
            if (rest.code === "0000") {
              let select = rest.data.rows;
              this.distributorOff = select.length > 0 ? false : true;
              if (select.length > 0) {
                this.redFlagList =
                  select[0].reminderMessage != null
                    ? select[0].reminderMessage
                    : "";
              }
              resolve(rest.data);
            }
          },
          (error) => {
            this.message.create("error", "请求异常");
          }
        );
    });
  }
  //失去焦点
  distributoBlur() {
    const ASYNS = async () => {
      let distributor = this.dataBase.distributor
        ? this.dataBase.distributor.replace(/\s+/g, "")
        : "";
      let select: any = await this.distributorLoad(distributor);
    };
    ASYNS();
  }

  //弹出经销商
  showDistributor() {
    this.distrbutorOff = true;
    this.childDis.pageParam.selectName = this.dataBase.distributor;
    this.childDis.agentInit();
  }
  //经销商取消按钮
  isDistributorCancel() {
    this.distrbutorOff = false;
  }
  //经销商确定按钮
  isDistributorOk() {
    this.distrbutorOff = false;
    this.dataBase.distributorAddress = ""; //清除经销商地址;
    this.dataBase.distributorContacts = ""; //经销商联系人;
    this.dataBase.distributorPhone = ""; //经销商电话;
    this.dataBase.distributorEmail = ""; //经销商邮箱
    this.dataBase.contractEndDate = "";
    let arr = this.childDis.selectFind();
    this.dataBase.distributor = arr[0].dealerName;
    this.dataBase.contractEndDate = standardTime(arr[0].ddpValidUntil);
    this.dataBase.ddpStatus = this.isadopt(this.dataBase.contractEndDate, 1);
    this.dataBase.distributorAddress = arr[0].registeredAddress;
    this.dataBase.distributorContacts = arr[0].conscientiousName;
    this.dataBase.distributorEmail = arr[0].dealerEmail;
    this.dataBase.distributorPhone = arr[0].dealerTelephone;
    this.redFlagList =
      arr[0].reminderMessage != null ? arr[0].reminderMessage : "";
    this.dataBase.dealerCode = arr[0].dealerCode;
    this.distributorLoad(this.dataBase.distributor);
    // this.ServesiceService.dealerCode.emit(this.dataBase.dealerCode);
    this.dealerCodeList();
  }
  public supportFileBeforeUpload = (file: UploadFile): boolean => {
    const upLoadFileNews = upLoadFileNew.bind(this);
    upLoadFileNews(file).then(
      (val) => {
        this.supportFileNameList = val.fileList;
        this.dataBase.supportFile = val.fileId;
      },
      (error) => {
        this.dataBase.supportFile = "";
        this.supportFileNameList = [];
      }
    );
    return false;
  };
  public checkFormData = () => {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    return this.validateForm.valid;
  };
  //删除支持文件
  nzRemovsupport = (file: UploadFile): any => {
    this.dataBase.supportFile = "";
    return true;
  };
  // 上传文件下载
  public dwonLoad = (file: UploadFile): void => {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf("#");
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${file.fileId}`;
    window.open(url, "_blank");
  };
  // 电话号码正则表达式的验证
  checkPhone(control: FormControl) {
    if (control.value) {
      const reg = /^([\d +()-\s]{0,1000}$)$/;
      const valid = reg.test(control.value); // true
      return valid ? null : { phoneform: true };
    }
  }
  //邮箱的正则表大式
  cheakMail(control: FormControl) {
    if (control.value) {
      const reg = /^(?!\@)+(?!\_)+[0-9a-zA-Z_\@\.\s\-]*$/g;
      const valid = reg.test(control.value); // true
      return valid ? null : { mailform: true };
    }
  }
  //邮箱的正则表大式
  cheakMailPhilips(control: FormControl) {
    if (control.value) {
      const reg = /^([a-zA-Z0-9_\.\-])+\@(philips.com)+$/;
      //const reg=/^[0-9a-zA-Z_\@\.\s\-]*$/g;
      //const reg = /^(?!\@)+(?!\_)+[0-9a-zA-Z_\@\.\s\-]*$/g;
      const valid = reg.test(control.value); // true
      return valid ? null : { mailform: true };
    }
  }
  taxNumberCheck(control: FormControl) {
    if (control.value) {
      const reg = /^([\da-zA-z]{0,18}$)$/;
      const valid = reg.test(control.value); // true
      return valid ? null : { taxform: true };
    }
  }
  //小数后自动补零
  returnFloat(value: any, num) {
    var a, b, c, i;
    a = value.toString();
    b = a.indexOf(".");
    c = a.length;
    if (num == 0) {
      if (b != -1) {
        a = a.substring(0, b);
      }
    } else {
      //如果没有小数点
      if (b == -1) {
        a = a + ".";
        for (i = 1; i <= num; i++) {
          a = a + "0";
        }
      } else {
        //有小数点，超出位数自动截取，否则补0
        a = a.substring(0, b + num + 1);
        for (i = c; i <= b + num; i++) {
          a = a + "0";
        }
      }
    }
    return a;
  }
  public searchCPResult(): void {
    // 清空
    this.dealFormIdinput = "";
    this.dealformlist = [];
    this.box = false;
    this.isVisibleCPResult = true;
  }
  public handleCancelCPResult(): void {
    this.isVisibleCPResult = false;
  }
  public handleOkCPResult2() {
    if (this.dealformlist.length < 1) {
      this.message.create("error", "请先点击查询");
      return;
    }
    if (!this.ckdealformlist.radio) {
      this.message.create("error", "未选择Deal Form ID");
      return;
    }
    this.validateForm.reset();
    this.clearFrom();

    this.dataBase.dealFormId = this.ckdealformlist.dealFormId;
    if (this.ckdealformlist) {
      setTimeout(() => {
        this.dataBase.entryUnitPrice = ""; //所有进单单总价;
        this.dataBase.dealContractPrice = this.ckdealformlist.dealPrice; //deal总价
        this.dataBase.businessModel = this.ckdealformlist.businessModel; //业务模式;
        this.dataBase.estimatedBidPrice = this.ckdealformlist
          .estimatedTenderPrice
          ? this.ckdealformlist.estimatedTenderPrice
          : 0; //预计投标价格
        this.dataBase.region = this.ckdealformlist.region; //大区域
        this.dataBase.smallArea = this.ckdealformlist.residentialQuarters; //小区域
        this.dataBase.team = this.ckdealformlist.team; //team
        this.dataBase.tenderNo = this.ckdealformlist.tenderNo; //招标编号
        this.dataBase.tenderingCompany = this.ckdealformlist.biddingCompanyName; //投标公司
        this.dataBase.distributor = this.ckdealformlist.dealerName; //经销商
        this.dataBase.dealerCode = this.ckdealformlist.dealerId; //经销商code
        if (this.dataBase.businessModel != "DIRECT") {
          if (this.dataBase.distributor) {
            let distributor = this.dataBase.distributor
              ? this.dataBase.distributor.replace(/\s+/g, "")
              : "";
            this.distributorLoad(distributor);
          }
        }
        this.dataBase.distributorAddress =
          this.ckdealformlist.registeredAddress; //经销商地址
        this.dataBase.distributorPhone = this.ckdealformlist.dealerTelephone; //经销商电话
        this.dataBase.distributorEmail = this.ckdealformlist.dealerEmail; //邮箱地址
        this.dataBase.billingInfor = this.ckdealformlist.vatBillingInfo; //开票信息
        this.dataBase.contractBuyerAddress =
          this.ckdealformlist.registeredAddress; //合同买方地址
        this.dataBase.contractBuyerEmail = this.ckdealformlist.dealerEmail; //合同邮箱
        this.dataBase.endUser = this.ckdealformlist.hospitalName; //最终用户
        this.dataBase.endUsers = this.ckdealformlist.hospitalNames; //最终用户
        this.dataBase.endUserId = this.ckdealformlist.hospitalId; //用户id
        this.pageParam.endUserId = this.ckdealformlist.hospitalId; //弹窗口的选中的值
        this.dataBase.hospitalNature = this.ckdealformlist.customerType; //医院性质
        this.dataBase.endUserAddress = this.ckdealformlist.endUserAddress; //最终用户地址
        this.dataBase.endUserPhone = this.ckdealformlist.endUserPhone; //最终用户电话
        this.dataBase.invoiceInformation = this.ckdealformlist.currencySystem; //币制
        this.dataBase.sampleAuditFlag = this.ckdealformlist.samplingInspection; //是否抽样审核
        this.dataBase.foreignTradeCompany = this.ckdealformlist
          .foreignCompanyName
          ? this.ckdealformlist.foreignCompanyName.replace(/\s+/g, "")
          : ""; //外贸公司

        this.dataBase.foreignTradeCompanyAddress =
          this.ckdealformlist.foreignTradeCompanyAddress; //外贸公司
        this.dataBase.foreignTradeCompanyContacts =
          this.ckdealformlist.foreignCompanyContact; //外贸公司联系人
        let foreignCompanyContactInformation =
          this.ckdealformlist.foreignCompanyContactInformation;
        this.dataBase.finaSofonQuoation = this.ckdealformlist.finaSofonQuoation; //sonfon编号
        if (foreignCompanyContactInformation) {
          if (
            foreignCompanyContactInformation.indexOf(" ") == -1 ||
            foreignCompanyContactInformation.indexOf("-") == -1 ||
            foreignCompanyContactInformation.indexOf("(") == -1 ||
            foreignCompanyContactInformation.indexOf(")") == -1
          ) {
            this.dataBase.foreignTradeCompanyPhone = parseInt(
              this.ckdealformlist.foreignCompanyContactInformation
            ).toString(); //外贸公司电话
          } else {
            this.dataBase.foreignTradeCompanyPhone =
              foreignCompanyContactInformation;
          }
        } else {
          this.dataBase.foreignTradeCompanyPhone =
            foreignCompanyContactInformation;
        }
        this.dataBase.sonfonFile = this.ckdealformlist.sonfonFile;
        this.dataBase.financialProgramme =
          this.ckdealformlist.financialSchemeId != "" &&
          this.ckdealformlist.financialSchemeId != null
            ? this.ckdealformlist.financialSchemeId
            : "0"; //金融方案
        this.dataBase.financialProgrammeTxt =
          this.ckdealformlist.otherFinancialSolutions; //金融方案文本框
        this.dataBase.financialProgrammeCost =
          this.ckdealformlist.financialProgrammePrice; //金融方案总价格
        this.dataBase.rebateCost = this.ckdealformlist.rebateCost; //rebate金额
        this.dataBase.tradeInCost = this.ckdealformlist.tradeInCost; //tradeIn金额
        this.dataBase.taxrate = this.ckdealformlist.vatRate; //税率
        this.getRateList();
        this.dataBase.paymentmethod =
          this.ckdealformlist.paymentMethodDescription; //支付方式
        this.dataBase.contractEndDate = standardTime(
          this.ckdealformlist.ddpValidUntil
        );
        this.dataBase.ddpStatus = this.isadopt(
          this.dataBase.contractEndDate,
          1
        );
        this.dataBase.poolEndDate = standardTime(
          this.ckdealformlist.ddpValidUntil1
        );
        this.dataBase.contractDdpStatus = this.isadopt(
          this.dataBase.poolEndDate,
          2
        );
        if (this.dataBase.invoiceInformation == "USD") {
          const contractBuyer2 = this.poolList.find(
            (val) => val.corporateName == this.dataBase.foreignTradeCompany
          );
          contractBuyer2 &&
            (this.dataBase.contractBuyer2 = contractBuyer2.corporateName);
          this.foreignup();
        }
        this.entryModeList = JSON.parse(JSON.stringify(this.entryModeLists));
        if (this.dataBase.businessModel == "DIRECT") {
          this.dataBase.entryMode = null;
        }
        this.StockOff =
          (this.dataBase.entryMode == "BIDDING" &&
            this.dataBase.endUsers == "Stock") ||
          this.dataBase.entryMode == "STOCK"
            ? false
            : true;
        if (this.dataBase.businessModel === "DIRECT") {
          this.dataBase.contractBuyer = this.dataBase.endUser;
          this.dataBase.contractBuyerAddress = this.dataBase.endUserAddress;
          this.dataBase.contractBuyerContacts = this.dataBase.endUserContacts;
          this.dataBase.contractBuyerPhone = this.dataBase.endUserPhone;
          this.dataBase.contractBuyerEmail = this.dataBase.endUserEmail;
          this.validateForm.controls.contractBuyer2.disable();
        } else if (
          this.dataBase.businessModel === "DISTRIBUTOR" &&
          this.dataBase.invoiceInformation == "CNY"
        ) {
          this.validateForm.controls.contractBuyer2.disable();
        }
        this.dealerCodeList();
      }, 0);
      this.ngModelChang();
    }
    this.getProduct(this.ckdealformlist.dealFormId);
  }

  //经销商协议号列表
  public dealerCodeList() {
    let dealerCode = this.dataBase.dealerCode;
    if (dealerCode && this.dataBase.businessModel == "DISTRIBUTOR") {
      let url = `/act/preparation/chooseDealer?dealerCode=${dealerCode}`;
      this.http.get(url).subscribe((rest) => {
        this.dealList = rest.data;
        let dealerAgreementNo = this.dataBase.agreementNo;
        let select = this.dealList.find(
          (val) => dealerAgreementNo == val.agreementNo
        );
        // !select && (this.dataBase.agreementNo = null);
      });
    }
  }
  //查询dealfromid
  GetDealLists(param) {
    return new Promise((resolve, reject) => {
      this.http
        .get(`/act/prebook/queryCpPreBook?dealFormId=` + param)
        .subscribe((e) => {
          resolve(e.data[0]);
          if (e.data && e.data.length > 0) {
            this.currId = e.data[0].id;
          }
        });
    });
  }
  //选择iepool
  public changeAgentCnName() {
    this.getPoolList();
    this.dataBase.foreignTradeCompany = this.dataBase.contractBuyer2
      ? this.dataBase.contractBuyer2
      : this.dataBase.foreignTradeCompany;
    if (this.poolList && this.poolList.length > 0) {
      let select = this.poolList.find(
        (val) => this.dataBase.contractBuyer2 == val.corporateName
      );
      if (select) {
        this.dataBase.contractDdpStatus = this.isadopt(
          this.dataBase.poolEndDate,
          2
        );
        this.dataBase.foreignTradeCompanyAddress = "";
        this.dataBase.foreignTradeCompanyContacts = "";
        this.dataBase.foreignTradeCompanyPhone = "";
        this.dataBase.foreignTradeCompanyEmail = "";
        this.dataBase.poolEndDate = "";
      }
      this.dataBase.foreignTradeCompanyAddress =
        select && select.corporateAddress ? select.corporateAddress : "";
      this.dataBase.poolEndDate =
        select && select.ddpValidUntil
          ? standardTime(select.ddpValidUntil)
          : "";
      this.foreignup(); //是否禁用ddp-status
    }
  }

  // 查询
  GetDealList() {
    this.deal_load = true;
    this.box = true;
    this.http
      .get(`/act/prebook/queryCpPreBook?dealFormId=` + this.dealFormIdinput)
      .subscribe(
        (e) => {
          this.deal_load = false;
          if (e.data) {
            this.dealformlist = e.data;
            if (this.dealformlist.length > 0) {
              this.dealformlist.find((vals) => {
                if (vals.id == this.currId) {
                  vals.radio = true;
                  //  vals.isDisable=true;
                }
              });
              if (this.dealformlist.length == 1) {
                this.ckdealformlist = this.dealformlist[0];
                this.ckdealformlist.radio = true;
              }
            }
          }
        },
        (error) => {
          this.deal_load = false;
        }
      );
  }
  // 选中dealform
  changDealForm(index, data) {
    this.dealformlist.map((res) => {
      res.radio = false;
    });
    data.radio = true;
    this.currId = data.id;
    this.ckdealformlist = data;
  }
  //税率列表
  public getRateList() {
    const params = {
      dictGroup: "tax_rate",
      listClass: "rmb",
    };
    return new Promise((resolve, reject) => {
      this.http
        .get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`)
        .subscribe((rest) => {
          if (rest.code === "0000") {
            this.dataBase.rateList = rest.data;
            resolve(rest.data);
            if (this.dataBase.taxrate) {
              let select = this.dataBase.rateList.find(
                (val) => val.label == this.dataBase.taxrate
              );
              !select &&
                this.dataBase.rateList.push({ label: this.dataBase.taxrate });
            }
          } else {
            this.message.create("error", `${rest.msg}`);
          }
        });
    });
  }

  //preboo原因
  public getPrebookReason() {
    const params = {
      dictGroup: "preReason",
    };
    return new Promise((resolve, reject) => {
      this.http
        .get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`)
        .subscribe((rest) => {
          if (rest.code === "0000") {
            this.prebookReasonList = rest.data;
          } else {
            this.message.create("error", `${rest.msg}`);
          }
        });
    });
  }
  //获取产品信息
  getProduct(e) {
    const url = `/act/preparation/queryMarketBundle?dealFormID=` + e;
    const params = {
      dealFormID: e,
    };
    if (
      params.dealFormID !== "" &&
      params.dealFormID !== null &&
      params.dealFormID !== undefined
    ) {
      return new Promise((resolve, reject) => {
        this.http.get(url).subscribe(
          (res) => {
            if (res.code == "0000") {
              resolve(true);
              let { children } = res.data;
              this.dataBase.productList = [];
              this.dataBase.count = 0;
              children.map((vals) => {
                vals.title = vals.simulationId;
                vals.key = vals.id;
                vals.level = 1;
                vals.children.map((val) => {
                  this.dataBase.count++;
                  val.title = val.marketBundleName;
                  val.key = val.id;
                  val.level = 2;
                  val.children.map((item) => {
                    item.title = item.productName;
                    item.key = item.id;
                    item.level = 3;
                    item.disableCheckbox = true; //第三层禁用
                    item.isLeaf = true;
                  });
                });
              });
              this.dataBase.dataList = children;
              this.updateData.emit(this.dataBase);
              this.isVisibleCPResult = false;
            } else {
              this.message.create("error", res.msg);
            }
          },
          (error) => {
            this.message.create("error", "请求异常");
          }
        );
      });
    } else {
      this.message.create("error", "请填写dealFormId");
    }
  }
  //判断ddpstatus是否通过
  isadopt(param, number) {
    if (param) {
      let endDates = new Date(param);
      let year = endDates.getFullYear();
      let month = endDates.getMonth() + 1;
      let day = endDates.getDate();
      let overdue = `${year}/${month}/${day}`;
      let overDate = new Date(overdue).setHours(0, 0, 0, 0);
      let endDate = new Date(overDate).getTime();
      let nowDate = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
      let iRemain: any = (endDate - nowDate) / 1000;
      iRemain = iRemain / 86400;
      iRemain = parseInt(iRemain) + 1;
      number == 1 && (this.lateDayOff = iRemain <= 7 ? true : false);
      number == 2 && (this.lateDateOff = iRemain <= 7 ? true : false);
      number == 1 && (this.laterDay = iRemain);
      number == 2 && (this.lateDays = iRemain);
      if (iRemain >= 1) {
        return "通过";
      } else {
        return "不通过";
      }
    } else {
      return null;
    }
  }
  //外贸公司联动
  foreignup() {
    const foreignTradeCompany = this.dataBase.foreignTradeCompany
      ? this.dataBase.foreignTradeCompany.replace(/\s+/g, "")
      : "";
    const distributors = this.dataBase.distributor
      ? this.dataBase.distributor.replace(/\s+/g, "")
      : "";
    const contractBuyer2 = this.poolList.find(
      (val) => val.corporateName.replace(/\s+/g, "") == foreignTradeCompany
    );
    let select = this.poolList.find(
      (vals) => vals.corporateName.replace(/\s+/g, "") == foreignTradeCompany
    );
    this.foreignTradeOff =
      foreignTradeCompany != distributors ? (select ? false : true) : false;
    if (!contractBuyer2) {
      this.dataBase.contractBuyer2 = null;
      this.validateForm.controls.contractBuyer2.clearAsyncValidators();
      if (
        (this.dataBase.detail.status == "" ||
          this.dataBase.detail.status == "XJDHTGYBTX" ||
          this.dataBase.detail.status == "DHTGYBTX") &&
        this.dataBase.detail.flag == "0"
      ) {
        this.validateForm.controls.poolEndDate.enable();
      }
    } else {
      this.dataBase.contractBuyer2 = contractBuyer2.corporateName;
      this.dataBase.poolEndDate = standardTime(contractBuyer2.ddpValidUntil);
      this.dataBase.contractDdpStatus = this.isadopt(
        this.dataBase.poolEndDate,
        2
      );
      this.validateForm.controls.poolEndDate.disable();
    }
  }
  // 业务模式
  public ngModelChang() {
    this.ifBusinessModel();

    if (
      this.dataBase.businessModel === "DIRECT" &&
      this.dataBase.entryMode == "STOCK"
    ) {
      this.dataBase.entryMode = null;
    }
    if (this.dataBase.businessModel === "DIRECT") {
      this.dataBase.contractBuyer = this.dataBase.endUser;
      this.dataBase.contractBuyerAddress = this.dataBase.endUserAddress;
      this.dataBase.contractBuyerContacts = this.dataBase.endUserContacts;
      this.dataBase.contractBuyerPhone = this.dataBase.endUserPhone;
      this.dataBase.contractBuyerEmail = this.dataBase.endUserEmail;
    }
    if (
      this.dataBase.businessModel === "DIRECT" &&
      this.dataBase.invoiceInformation === "CNY"
    ) {
      this.validateForm.controls.contractBuyer2.disable();
    } else if (
      this.dataBase.businessModel === "DISTRIBUTOR" &&
      this.dataBase.invoiceInformation === "CNY"
    ) {
      this.validateForm.controls.contractBuyer2.disable();
    } else if (this.dataBase.businessModel === "DISTRIBUTOR") {
      this.entryModeList = JSON.parse(JSON.stringify(this.entryModeLists));
    }
  }
  // 判断业务模式 移除指定控制器
  ifBusinessModel() {
    /*业务模式为 Direct Deal  删除经销商*/
    if (this.dataBase && this.dataBase.businessModel === "DIRECT") {
      this.validateForm.get("distributor")!.clearValidators(); // 经销商
      this.validateForm.get("ddpStatus")!.clearValidators(); // DDP-Status

      this.validateForm.get("poolEndDate")!.clearValidators(); //外贸公司DDP-Status截止日期
      this.validateForm.get("distributorAddress")!.clearValidators(); // 经销商地址
      this.validateForm.get("distributorContacts")!.clearValidators(); // 经销商联系人
      this.validateForm.get("distributorPhone")!.clearValidators(); // 经销商电话
      this.validateForm.get("distributorEmail")!.clearValidators(); // 经销商邮箱
      this.validateForm.get("orderSignName")!.clearValidators(); // 采购订单签署人
      this.validateForm.get("orderSignPost")!.clearValidators(); // 采购订单签署人职务
      /*添加合同买方*/
      this.validateForm
        .get("contractBuyer")!
        .setValidators(Validators.required); // 合同买方
      this.validateForm
        .get("contractBuyerAddress")!
        .setValidators(Validators.required); // 合同买方地址
      this.validateForm
        .get("contractSignatory")!
        .setValidators(Validators.required); // 合同签署人
      this.validateForm
        .get("contractSignatoryPost")!
        .setValidators(Validators.required); // 采购订单签署人职务

      this.validateForm.get("isPenalty")!.setValidators(Validators.required); //是否有晚交罚款
      this.validateForm.get("balancePaymentDate")!.clearValidators(); //尾款日期
      this.validateForm.get("downpaymentDate")!.clearValidators(); //头款日期
      this.validateForm.get("agreementNo")!.clearValidators(); //经销商协议号
    } else {
      /*业务模式为 DISTRIBUTOR  添加经销商*/
      this.validateForm.get("isPenalty")!.clearValidators(); //是否有晚交罚款
      this.validateForm
        .get("balancePaymentDate")!
        .setValidators(Validators.required); //尾款日期
      this.validateForm
        .get("downpaymentDate")!
        .setValidators(Validators.required); //头款日期
      this.validateForm.get("distributor")!.setValidators(Validators.required);
      this.validateForm.get("ddpStatus")!.setValidators(Validators.required);
      this.validateForm
        .get("contractEndDate")!
        .setValidators(Validators.required);
      this.validateForm.get("poolEndDate")!.setValidators(Validators.required);
      this.validateForm
        .get("distributorAddress")!
        .setValidators(Validators.required);
      this.validateForm
        .get("distributorContacts")!
        .setValidators(Validators.required);
      this.validateForm
        .get("distributorPhone")!
        .setValidators([Validators.required, this.checkPhone]);
      this.validateForm
        .get("distributorEmail")!
        .setValidators([Validators.required, this.cheakMail]);
      this.validateForm
        .get("orderSignName")!
        .setValidators(Validators.required);
      this.validateForm
        .get("orderSignPost")!
        .setValidators(Validators.required);

      this.validateForm.get("contractBuyer")!.clearValidators(); // 合同买方
      this.validateForm.get("contractBuyerAddress")!.clearValidators(); // 合同买方地址
      this.validateForm.get("contractSignatory")!.clearValidators(); // 合同签署人
      this.validateForm.get("contractSignatoryPost")!.clearValidators(); // 采购订单签署人职务
      this.validateForm.get("agreementNo")!.setValidators(Validators.required); //经销商协议号
    }
    if (
      this.dataBase &&
      this.dataBase.businessModel === "DIRECT" &&
      this.dataBase.invoiceInformation === "USD"
    ) {
      this.validateForm.get("contractEndDate")!.clearValidators(); //经销商DDP-Status截止日期
      this.validateForm.get("poolEndDate")!.setValidators(Validators.required);
    } else if (
      this.dataBase &&
      this.dataBase.businessModel === "DIRECT" &&
      this.dataBase.invoiceInformation === "CNY"
    ) {
      this.validateForm.get("contractEndDate")!.clearValidators();
      this.validateForm.get("poolEndDate")!.clearValidators();
    } else if (
      this.dataBase &&
      this.dataBase.businessModel === "DISTRIBUTOR" &&
      this.dataBase.invoiceInformation === "USD"
    ) {
      this.validateForm
        .get("contractEndDate")!
        .setValidators(Validators.required);
      this.validateForm.get("poolEndDate")!.setValidators(Validators.required);
    } else if (
      this.dataBase &&
      this.dataBase.businessModel === "DISTRIBUTOR" &&
      this.dataBase.invoiceInformation === "CNY"
    ) {
      this.validateForm
        .get("contractEndDate")!
        .setValidators(Validators.required);
      this.validateForm.get("poolEndDate")!.clearValidators();
    }
    this.validateForm.get("poolEndDate")!.updateValueAndValidity();
    this.validateForm.get("contractEndDate")!.updateValueAndValidity();
    this.validateForm.get("agreementNo")!.updateValueAndValidity();
    this.validateForm.get("isPenalty")!.updateValueAndValidity();
    this.validateForm.get("downpaymentDate")!.updateValueAndValidity();
    this.validateForm.get("balancePaymentDate")!.updateValueAndValidity();
  }
  public clearFrom() {
    this.dataBase.productList = [];
    this.dataBase.detail = {
      id: "",
      flag: "0",
      status: "",
    };
    this.dataBase.dataList = [];
    this.dataBase.count = 0;
    this.dataBase.sameFlag = "0";
    this.dataBase.siteReport = "";
    this.dataBase.confirmationFile = "";
    this.dataBase.mrShieldingCompany = "";
    this.dataBase.paymentProvisionFileName = "";
    this.dataBase.shipmentDeliveryFileName = "";
    this.dataBase.sitePreparationFileName = "";
    this.dataBase.installationWarrantyFileName = "";
    this.dataBase.performanceBondFileName = "";
    this.dataBase.amountDifferenceFileName = "";
    this.dataBase.supportFileMissingFileName = "";
    this.dataBase.bidWinningNotice = "";
    this.dataBase.projectSolutions = "";
    this.dataBase.tenderDocuments = "";
    this.dataBase.endUserContract = "";
    this.dataBase.projectAnalysisTable = "";
    this.dataBase.otherFilName = "";
    this.dataBase.tableColOff = false;
    this.dataBase.financialProgramme = "";
    this.dataBase.supportFile = "";
    this.supportFileNameList = [];
  }
  ifForeignTradeCompany() {
    /* 币制 为 人民币 */
    /* 外贸公司不显示 */
    if (this.dataBase && this.dataBase.invoiceInformation === "CNY") {
      /* 删除外贸公司验证 */
      this.validateForm.get("poolEndDate")!.clearValidators(); // 外贸公司
      this.validateForm.get("foreignTradeCompany")!.clearValidators(); // 外贸公司
      this.validateForm.get("foreignTradeCompanyAddress")!.clearValidators(); // 外贸公司地址
      this.validateForm.get("foreignTradeCompanyContacts")!.clearValidators(); // 外贸公司联系人
      this.validateForm.get("foreignTradeCompanyPhone")!.clearValidators(); // 外贸公司电话
      this.validateForm.get("foreignTradeCompanyEmail")!.clearValidators(); // 外贸公司邮箱
      this.validateForm.get("importAgreementSignName")!.clearValidators(); // 合同签署人
      this.validateForm.get("importAgreementSignPost")!.clearValidators(); // 合同签署人职务
      this.validateForm.get("contractDdpStatus")!.clearValidators(); // DDP-Status //contractDdpStatus

      return false;
    } else {
      /* 添加外贸公司验证 */
      this.validateForm
        .get("foreignTradeCompany")!
        .setValidators(Validators.required); // 外贸公司
      this.validateForm
        .get("foreignTradeCompanyAddress")!
        .setValidators(Validators.required); // 外贸公司地址
      this.validateForm
        .get("foreignTradeCompanyContacts")!
        .setValidators(Validators.required); // 外贸公司联系人
      this.validateForm
        .get("foreignTradeCompanyPhone")!
        .setValidators([Validators.required, this.checkPhone]); // 外贸公司电话
      this.validateForm
        .get("foreignTradeCompanyEmail")!
        .setValidators([Validators.required, this.cheakMail]); // 外贸公司邮箱
      this.validateForm
        .get("importAgreementSignName")!
        .setValidators(Validators.required); // 合同签署人
      this.validateForm
        .get("importAgreementSignPost")!
        .setValidators(Validators.required); // 合同签署人职务
      this.validateForm
        .get("contractDdpStatus")!
        .setValidators(Validators.required); // DDP-Status
    }
    if (this.dataBase.entryMode == "STOCK") {
      this.validateForm.get("importAgreementSignPost")!.clearValidators(); // 合同签署人职务
    }
    this.validateForm.get("poolEndDate")!.updateValueAndValidity();
    this.validateForm.get("foreignTradeCompany")!.updateValueAndValidity();
    this.validateForm
      .get("foreignTradeCompanyAddress")!
      .updateValueAndValidity(); // 外贸公司地址
    this.validateForm
      .get("foreignTradeCompanyContacts")!
      .updateValueAndValidity();
    this.validateForm.get("foreignTradeCompanyPhone")!.updateValueAndValidity();
    this.validateForm.get("foreignTradeCompanyEmail")!.updateValueAndValidity();
    this.validateForm.get("importAgreementSignName")!.updateValueAndValidity();
    this.validateForm.get("importAgreementSignPost")!.updateValueAndValidity();
    this.validateForm.get("contractDdpStatus")!.updateValueAndValidity();

    this.validateForm.get("netPrice")!.updateValueAndValidity();
    this.validateForm.get("dealContractPrice")!.updateValueAndValidity();
    return true;
  }
  // 外贸公司是否与经销商相同
  ChangForeign() {
    if (this.dataBase.sameFlag === "1") {
      // 将经销商信息赋值给外贸公司
      this.getPoolList();
      this.dataBase.foreignTradeCompany = this.dataBase.distributor;
      this.dataBase.contractDdpStatus = this.dataBase.ddpStatus;
      this.dataBase.poolEndDate = this.dataBase.contractEndDate;
      this.dataBase.foreignTradeCompanyAddress =
        this.dataBase.distributorAddress;
      this.dataBase.foreignTradeCompanyContacts =
        this.dataBase.distributorContacts;
      this.dataBase.foreignTradeCompanyPhone = this.dataBase.distributorPhone;
      this.dataBase.foreignTradeCompanyEmail = this.dataBase.distributorEmail;
      this.dataBase.importAgreementSignName = this.dataBase.orderSignName;
      this.dataBase.importAgreementSignPost = this.dataBase.orderSignPost;
      this.foreignup();
    }
  }
  //金融方案
  selectFinacial() {
    if (this.dataBase.financialProgramme == "2") {
      this.financiaWidth = "7";
    } else {
      this.financiaWidth = "14";
    }
    if (this.financialList.length > 0) {
      let select = this.financialList.find(
        (val) => val.code == this.dataBase.financialProgramme
      );
      this.dataBase.financialProgrammeTitle = select ? select.label : "无";
    } else {
      this.dataBase.financialProgrammeTitle = "无";
    }
  }
  // 飞利浦金融方案
  public getfinancialList() {
    const params = {
      dictGroup: "OABC",
    };
    this.http
      .get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`)
      .subscribe((rest) => {
        if (rest.code === "0000") {
          this.financialList = rest.data;
        } else {
          this.message.create("error", `${rest.msg}`);
        }
      });
  }
  //币值的选择
  selectInvoice($event) {
    this.ifForeignTradeCompany();
    if (this.dataBase.invoiceInformation == "CNY") {
      this.validateForm.controls.contractBuyer2.disable();
    } else {
      this.validateForm.controls.contractBuyer2.enable();
    }
  }
  // 进单模式
  public getEntryModeList() {
    const params = {
      dictGroup: "ENTRY_MODEL",
    };
    this.http
      .get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`)
      .subscribe((rest) => {
        if (rest.code === "0000") {
          this.entryModeList = rest.data;
          this.entryModeLists = JSON.parse(JSON.stringify(this.entryModeList));
        } else {
          this.message.create("error", `${rest.msg}`);
        }
      });
  }

  //打开最终用户选择弹出窗口
  showAgent() {
    this.isAgre = true;
    this.child.pageParam.endUserId = this.dataBase.endUserId;
    this.child.agentInit();
  }
  //取消弹窗
  isAgreCancel() {
    this.isAgre = false;
  }
  //最终用户选择确定
  isAgregentOk() {
    this.isAgre = false;
    let arr = this.child.selectFind();
    this.dataBase.endUser = arr[0].customerName;
    this.dataBase.hospitalNature = arr[0].customerType;
    this.dataBase.endUserAddress = arr[0].address;
    this.dataBase.endUserId = arr[0].no;
    this.pageParam.endUserId = arr[0].no;
  }
  //查看最终用户编号
  showDiag() {
    this.dealshow.data = [];
    let dealerAgreementNo = this.dataBase.agreementNo;
    this.isAgres = true;
    let select = this.dealList.find(
      (val) => dealerAgreementNo == val.agreementNo
    );
    if (select) {
      let obj = {
        authorizedArea: select.authorizedArea,
        authorizedProduct: select.authorizedProduct,
      };
      this.dealshow.data.push(obj);
      this.ServesiceService.dealTable.emit(this.dealshow);
    }
  }
  //取消弹出窗口
  public isAgreCancels() {
    this.isAgres = false;
  }
  // 业务模式
  public getBusinessModelList() {
    const params = {
      dictGroup: "BUSINESS_MODEL",
    };
    this.http
      .get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`)
      .subscribe((rest) => {
        if (rest.code === "0000") {
          this.businessModelList = rest.data;
        } else {
          this.message.create("error", `${rest.msg}`);
        }
      });
  }
  keyTaxNumber(e, params) {
    if (e) {
      if (/^[\d\s]*$/.test(e)) {
        if (/\S{5}/.test(e)) {
          this.pricevalue.id = e.replace(/\s/g, "").replace(/(.{4})/g, "$1 ");
        } else {
          this.pricevalue.id = e;
        }
      }
      this.el.nativeElement.querySelector("#tax").value = this.pricevalue.id;
      params = this.pricevalue.id;
    }
    ///\S{5}/.test(params) && $this.val(v.replace(/\s/g, '').replace(/(.{4})/g, "$1 "));
  }
  //限制今天之前的日期不能选中
  disabledDate = (current: Date): boolean =>
    differenceInCalendarDays(current, this.today) < 0;
  changeDate(val) {
    this.dataBase.contractDdpStatus = this.isadopt(val, 2);
  }
  // 进单准备表-IE Pool选择
  public getPoolList() {
    return new Promise((resolve, reject) => {
      this.http.get(`/act/preparation/chooseIePool`).subscribe(
        (rest) => {
          if (rest.code === "0000") {
            this.poolList = rest.data;
            if (this.dataBase.invoiceInformation == "USD") {
              const foreignTradeCompany = this.dataBase.foreignTradeCompany
                ? this.dataBase.foreignTradeCompany.replace(/\s+/g, "")
                : "";
              const distributors = this.dataBase.distributor
                ? this.dataBase.distributor.replace(/\s+/g, "")
                : "";
              let select = this.poolList.find(
                (vals) =>
                  vals.corporateName.replace(/\s+/g, "") == foreignTradeCompany
              );
              if (this.dataBase.foreignTradeCompany) {
                this.foreignTradeOff =
                  foreignTradeCompany != distributors
                    ? select
                      ? false
                      : true
                    : false;
              } else {
                this.foreignTradeOff = false;
              }
              if (select && select.reminderMessage) {
                this.redFlagListPool = select.reminderMessage;
              } else {
                this.redFlagListPool = "";
              }
              const contractBuyer2 = this.poolList.find(
                (val) => val.corporateName == this.dataBase.foreignTradeCompany
              );
              contractBuyer2 &&
                (this.dataBase.contractBuyer2 = contractBuyer2.corporateName);
              this.foreignup();
            }
          } else {
            //this.message.create('error', `${rest.msg}`);
          }
          resolve(rest.data);
        },
        (error) => {
          this.message.create("error", "请求异常");
        }
      );
    });
  }
  //选择经销商1
  public changeDistributor() {
    const ASYNS = async () => {
      this.dataBase.distributor = this.dataBase.distributor1;
      if (this.distributorList && this.distributorList.length > 0) {
        let select = this.distributorList.find(
          (val) => this.dataBase.distributor1 == val.dealerName
        );
        if (select) {
          this.dataBase.dealerCode = select.dealerCode;
          this.dataBase.distributorAddress = ""; //清除经销商地址;
          this.dataBase.distributorContacts = ""; //经销商联系人;
          this.dataBase.distributorPhone = ""; //经销商电话;
          this.dataBase.distributorEmail = ""; //经销商邮箱
          this.dataBase.contractEndDate = "";
          this.dataBase.distributorEmail = select.dealerEmail;
          this.dataBase.distributorPhone = select.dealerTelephone;
          this.dataBase.distributorAddress = select.registeredAddress;
          this.dataBase.contractEndDate = standardTime(select.ddpValidUntil);
          this.dataBase.ddpStatus = this.isadopt(
            this.dataBase.contractEndDate,
            1
          );
        }
      }
      if (
        this.dataBase.businessModel === "DISTRIBUTOR" &&
        this.dataBase.invoiceInformation === "CNY"
      ) {
        this.validateForm.controls.contractBuyer2.disable();
      }
      await this.dealerCodeList();
    };
    ASYNS();
  }
  // 进单模式
  public changeEntryMode(value: any) {
    if (this.dataBase.businessModel == "DIRECT") {
      this.entryModeList.map((val, index) => {
        val.code == "STOCK" && this.entryModeList.splice(index, 1);
      });
      //this.el.nativeElement.querySelector('#entryMode').value = "BIDDING";
    } else {
      this.entryModeList = JSON.parse(JSON.stringify(this.entryModeLists));
    }

    this.entryMode = this.dataBase.entryMode;
    this.StockOff =
      (this.dataBase.entryMode == "BIDDING" &&
        this.dataBase.endUsers == "Stock") ||
      this.dataBase.entryMode == "STOCK"
        ? false
        : true;

    this.ifBusinessModel();
    if (this.dataBase.entryMode === "STOCK") {
      /*业务模式 插眼*/

      /* 业务模式为stock时 以下字段为非必选项目 */
      // 投标公司               tenderingCompany
      // 招标编号               tenderNo
      // 进口协议签署人职务      importAgreementSignPost
      // 最终用户                endUser
      // 医院性质                hospitalNature
      // 最终用户地址            endUserAddress
      // 最终用户联系人           endUserContacts
      // 最终用户电话             endUserPhone
      /*end*/
      this.validateForm.get("tenderingCompany")!.clearValidators();
      this.validateForm.get("tenderingCompany")!.markAsPristine();
      this.validateForm.get("tenderNo")!.clearValidators();
      this.validateForm.get("tenderNo")!.markAsPristine();
      this.validateForm.get("endUser")!.clearValidators();
      this.validateForm.get("endUser")!.markAsPristine();
      this.validateForm.get("hospitalNature")!.clearValidators();
      this.validateForm.get("hospitalNature")!.markAsPristine();
      this.validateForm.get("endUserAddress")!.clearValidators();
      this.validateForm.get("endUserAddress")!.markAsPristine();
      this.validateForm.get("endUserContacts")!.clearValidators();
      this.validateForm.get("endUserContacts")!.markAsPristine();
      this.validateForm.get("endUserPhone")!.clearValidators();
      this.validateForm.get("endUserPhone")!.markAsPristine();
      this.validateForm.get("endUserPhone")!.setValidators([this.checkPhone]);
      this.validateForm.get("importAgreementSignPost")!.clearValidators();
      this.validateForm.get("importAgreementSignPost")!.markAsPristine();
      this.validateForm.get("endUserEmail")!.clearValidators();
      this.validateForm.get("endUserEmail")!.markAsPristine();
      this.validateForm.get("endUserEmail")!.setValidators([this.cheakMail]);
    } else {
      this.validateForm
        .get("tenderingCompany")!
        .setValidators(Validators.required);
      // this.validateForm.get('tenderingCompany')!.markAsDirty();
      this.validateForm.get("tenderNo")!.setValidators(Validators.required);
      // this.validateForm.get('tenderNo')!.markAsDirty();
      this.validateForm.get("endUser")!.setValidators(Validators.required);
      // this.validateForm.get('endUser')!.markAsDirty();
      this.validateForm
        .get("hospitalNature")!
        .setValidators(Validators.required);
      // this.validateForm.get('hospitalNature')!.markAsDirty();
      this.validateForm
        .get("endUserAddress")!
        .setValidators(Validators.required);
      // this.validateForm.get('endUserAddress')!.markAsDirty();
      this.validateForm
        .get("endUserContacts")!
        .setValidators(Validators.required);
      // this.validateForm.get('endUserContacts')!.markAsDirty();
      this.validateForm
        .get("endUserPhone")!
        .setValidators([Validators.required, this.checkPhone]);
      // this.validateForm.get('endUserPhone')!.markAsDirty();
      this.validateForm
        .get("importAgreementSignPost")!
        .setValidators(Validators.required);
      // this.validateForm.get('importAgreementSignPost')!.markAsDirty();
      this.validateForm
        .get("endUserEmail")!
        .setValidators([Validators.required, this.cheakMail]);
    }
    this.validateForm.get("tenderingCompany")!.updateValueAndValidity();
    this.validateForm.get("tenderNo")!.updateValueAndValidity();
    this.validateForm.get("endUser")!.updateValueAndValidity();
    this.validateForm.get("hospitalNature")!.updateValueAndValidity();
    this.validateForm.get("endUserAddress")!.updateValueAndValidity();
    this.validateForm.get("endUserContacts")!.updateValueAndValidity();
    this.validateForm.get("endUserPhone")!.updateValueAndValidity();
    this.validateForm.get("importAgreementSignPost")!.updateValueAndValidity();
    this.validateForm.get("endUserEmail")!.updateValueAndValidity();
  }
  // 文件下载
  public fileDwon(id) {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf("#");
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${id}`;
    window.open(url, "_blank");
  }
  /**
   * @param   data 回显数据
   * @param   fileList 回显数组
   */
  viewData(data, fileList, name?: any) {
    const bidWinningNotice = this.dataBase[data];
    if (
      bidWinningNotice != "" &&
      bidWinningNotice != undefined &&
      bidWinningNotice != null
    ) {
      this[fileList] = [];
      let obj = { uid: "", name: "", fileId: "" };
      obj.uid = this.dataBase[data];
      obj.fileId = this.dataBase[data];
      obj.name = name ? name : "下载文件";
      this[fileList].push(obj);
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
    this.importing.emit(true);
    this.http
      .get(`/act/prebook/queryCpPreBook?dealFormId=` + dealFormId)
      .subscribe(
        (e) => {
          if (e.data) {
            this.dealformlist = e.data;
            this.dealformlist.find((vals) => {
              if (vals.id == this.currId) {
                vals.radio = true;
              }
            });
            if (this.dealformlist.length == 1) {
              this.ckdealformlist = this.dealformlist[0];
              this.ckdealformlist.radio = true;
              this.handleOkCPResult2();
            } else if (this.dealformlist.length > 1) {
              let confirmedItem = this.dealformlist.find(
                (i) => i.id === dealFormId
              );
              if (confirmedItem) {
                confirmedItem.radio = true;
                this.ckdealformlist = confirmedItem;
              } else {
                this.message.create("error", "未找到，导入失败！");
              }
            } else {
              this.message.create("error", "未找到，导入失败！");
            }
          } else {
            this.message.create("error", "查询异常，导入失败！");
          }
          this.importing.emit(false);
        },
        (error) => {
          this.importing.emit(false);
        },
        () => {
          this.importing.emit(false);
        }
      );
  }
}
