import { Component, OnInit, Input, ViewChild, SimpleChange, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '@core/services';

import { NzMessageService } from 'ng-zorro-antd';
import { getuuid, codeString } from '@core/util/tools';
import { ServesiceService } from '@core/services';
import { environment } from '@env';

@Component({
  selector: 'app-preproduct-info',
  templateUrl: './preproduct-info.component.html',
  styleUrls: ['./preproduct-info.component.scss']
})
export class PreproductInfoComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private message: NzMessageService,
    public activatedRouter: ActivatedRoute,
    private ServesiceService: ServesiceService,
    private el: ElementRef
  ) { }
  generateContractDraftSwitch = false;
  treeCheakData = []; //树形选中
  isVisibleMarketBundle = false; // 树形框弹出与否
  checked = true;
  bidData = [];
  flag = 1;
  public validateForm: FormGroup;
  @ViewChild('tranf') tranf; // 调用树形穿梭框
  @Input() dataBase: any = {} // 父组件传来的值
  @Input() public disa = false;
  @Input() ishow: any = false;
  @Input() disaend: any = false;

  // 滚动监听
  dataCurr: any = ""; //当前选中
  scoll: any = false;
  isModif: any = false;
  rateList: any = [];
  priceEdit: any = true;
  price_value_list: any = { id: "" };
  pricevaluelist: any = { id: "" };
  listOfDisplayData: any[] = [];
  isIndeterminate = false;
  isAllDisplayDataChecked = false;
  mapOfCheckedId: { [key: string]: boolean } = {};
  public priceValueList: any = {

  };
  ngOnInit() {
    this.flag = this.activatedRouter.queryParams['_value'].flag;
    const roles = JSON.parse(localStorage.getItem("roles"));
    if (this.flag != 0) {
      this.dataBase.productList = [];
    }
    this.validateForm = this.fb.group({
      totalPrice: new FormControl({ value: '', disabled: false }),
      totalContractPrice: new FormControl({ value: '', disabled: false }),
      taxrate: new FormControl({ value: '', disabled: this.disa }),
    });
  }
  ngOnChanges(changes: SimpleChange): void {
    this.dataBase.detail.status = this.activatedRouter.queryParams['_value'].state ? this.activatedRouter.queryParams['_value'].state : "";
    this.dataBase.taxrate = this.dataBase.taxrate ? this.dataBase.taxrate : "0.13";
    this.ServesiceService.host.emit(this.dataBase)
    if (changes['dataBase']) {
      this.tranf.reset()
      this.dataBase.productList.map((item, index) => {
        this.initChecked(index)
      })
      const roles = JSON.parse(localStorage.getItem("roles"));
      // this.dataBase.tableColOff = roles.some(val => (val == 'OA' || val == 'OA Leader' || val == 'CFC Leader' || val == 'ZPM' || val == 'PM Leader' || val == 'PM Leader_change' || val == 'Distributor leader' || val == 'ZSL' || val == 'COP Operation' || val == 'Finance: C&C Leader' || val == 'Cluster BP' || val == 'OM' || val == 'Sales Leader' || val == 'C&C Leader'))
      this.dataBase.tableColOff = false;
      if (this.dataBase.detail.status == 'DOACS' && this.dataBase.tableColOff) {
        this.priceEdit = false;
      }
    }

    if (this.dataBase) {
      if (this.dataBase.productList.length > 0) {
        this.dataBase.productList.map(val => {
          if ((this.dataBase.financialProgramme == '2' || this.dataBase.financialProgramme == '1') && this.dataBase.financialProgrammeCost != 0.0000) {
            val.inputoff = true;
          }
          else {
            val.inputoff = false;
            !this.disaend && (val.totalContractPrice = parseInt(val.totalContractPrice));
            val.totalContractPrice && (val.totalContractPrices = val.totalContractPrice);
          }
        })
      }
    }

  }

  //状态
  TaskAsUrl(task) {
    switch (task) {
      case 'DOACS':
        return 'pre-order/audit';
        break;
      case 'DTJ':
        return 'preordermodifs';
        break;
      case 'YZBQR':
        return 'bidding/winning';
        break;
      case 'DSWZYQR':
        return 'bidding/winning';
        break;
      case 'YZBQRDBCWJ':
        return 'bidding/support-up';
        break;
      case 'DSWYSH': case 'XSBMDMSH': case 'XSBMZSLSH': case '2JSH':
        return 'bidding/tender-review';
        break;
      case 'DSWZYSQ':
        return 'bidding/emp';
        break;
      case 'DZLCSH': case 'JDEND':
        return 'pre-order/view-subp';
        break;
      case 'DOITWJSC': case 'OITEND': case 'DBCWJSC':
        return 'pre-order/complete-oit';
        break;
      case 'OITENDDBCWJSC':
        return 'pre-order/supp-file';
        break;
      case 'DODSH':
        return 'pre-order/in-order-exam';
        break;
      case 'DXSBMSH': case 'DXSBM2JSH': case 'DOAJDQR': case 'DHTOASH': case 'DFBSH': case 'DTPJDSH':
        return 'pre-order/examine-order';
        break;
      case 'DHTGYBTX': case 'XJDHTGYBTX':
        return 'pre-order/in-con-modif';
        break;
      case 'DHTQS':
        return 'pre-order/con-sign';
        break;
      case 'DTXHT':
        return 'pre-order/in-order';
        break;
      case 'DBCWJSC':
        return 'pre-order/supp-file';
        break;
      case 'WZB': case '2CKB':
        return 'bidding/bid';
        break;
      case 'DCDSH': case 'DOACS':
        return 'pre-order/audit';
        break;
    }
    return '';
  }
  //跳转
  toWin(item) {
    const url = this.TaskAsUrl(item.taskStatus);
    const id = item.mainId;
    if (item.taskStatus === 'DTJ') {
      window.open(location.origin + environment.base_href + '/#/' + url + '?id=' + codeString(id) + '&flag=1');
    } else {
      window.open(location.origin + environment.base_href + '/#/' + url + '?id=' + codeString(id) + '&flag=1' + '&state=' + item.taskStatus + '&status=' + item.taskStatus);
    }
  }
  // 文件下载
  public fileDwon(id) {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf('#');
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${id}`;
    window.open(url, '_blank');
  }
  //监听价格变化
  toNumber(e, data, id, index) {
    //this.dataBase.productList[index].totalContractPrice = this.dataBase.productList[index].totalContractPrice.toString().replace(/\D/g, '');
    let reg;
    reg = /^(0|[1-9][0-9]{0,12})?$/; //只能输入正数和0;
    if (reg.test(e) || e === '') {
      this.pricevaluelist[id] = e;
    }
    const id2 = '#' + id;
    this.el.nativeElement.querySelector(id2).value = this.pricevaluelist[id] != undefined ? this.pricevaluelist[id] : "";
    data.totalContractPrice = this.pricevaluelist[id] != undefined ? this.pricevaluelist[id] : "";

  }
  toNumberPrice(e, data, id) {
    // const reg = /^(0|(\-)?[0-9]{0,12})(\.[0-9]{0,2})?$/; //可以输入负数
    //const reg = /^(0|[1-9][0-9]{0,12})(\.[0-9]{0,2})?$/;
    let reg;
    let financialProgrammeCost = this.dataBase.financialProgrammeCost;
    if (Number(financialProgrammeCost) > 0) {
      reg = /^(0|[1-9][0-9]{0,12})(\.[0-9]{0,2})?$/; //只能输入正数和0;
    }
    else {
      reg = /^((\-)[0-9]{0,12})(\.[0-9]{0,2})?$/; //只能输入输入
    }
    if (reg.test(e) || e === '') {
      this.price_value_list[id] = e;
    }
    const id2 = '#' + id;
    this.el.nativeElement.querySelector(id2).value = this.price_value_list[id] != undefined ? this.price_value_list[id] : "";
    data.financialPrice = this.price_value_list[id] != undefined ? this.price_value_list[id] : "";
    if (data.financialPrice == undefined || data.financialPrice == '' || data.financialPrice == null || data.financialPrice == '-') {
      data.inputoff = true;
    }
    else {
      data.inputoff = false;
    }
    // e = this.price_value_list[id];
    // console.log(data.financialPrice);
  }
  modelChange(index)  //进单单位选中
  {
    this.dataBase.productList[index].checked = !this.dataBase.productList[index].checked;

  }
  agentChange(i, index) //产品的选中
  {
    this.dataBase.productList[i].productList.map(res => {
      res.checked = false;

    })
    this.dataBase.productList[i].productList[index].checked = true;
    this.ServesiceService.netPrice.emit(true);
  }

  currentPageDataChange($event: Array<{ id: number; name: string; age: number; address: string }>): void {
    this.listOfDisplayData = $event;
    this.refreshStatus();
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayData.every(item => this.mapOfCheckedId[item.id]);
    this.isIndeterminate =
      this.listOfDisplayData.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayData.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  addEntryUnit(type: string): void {
    const len = this.dataBase.productList.length;
    const obj = {
      id: getuuid(),
      modelNumber: "",
      modelNumber1: "",
      financialPrice: "",
      totalPrice: '',
      totalContractPrice: '',
      showActionsSwitch: false,
      checked: false,
      sofonName: "", //sofon文件
      sofonNameurl: "", //sofon链接
      sofonNo: "",//sofonno
      mrShieldingCompany: "", //磁共振屏蔽公司
      confirmationFileFlag: '1', //IGT第三方吊塔确认文
      confirmationFile: "", //IGT第三方吊塔文件上传
      paymentProvision: "",//付款条件
      paymentProvisionRemarks: "", //付款备注
      paymentProvisionFileName: "", //付款文件
      installationWarrantyRadio: "0",//是否下一级审核
      performanceBond: "0",//履约保函
      performanceBondRemarks: "",//履约保函付件
      performanceBondFileName: "", //履约保函文件
      shipmentDelivery: "0", //装运及交货
      shipmentDeliveryRemarks: "", //装运及交货备注
      shipmentDeliveryFileName: "", //装运及交货文件
      installationWarranty: "0", //安装及保修
      installationWarrantyRemarks: "",//安装及备注
      installationWarrantyFileName: "",//安装文件上传
      solutionSales: "",//solutionSales
      amountDifference: "0",//订单合同及差价
      paymentProvisionRadio: "1",//下一级是否审核
      amountDifferenceRemarks: "",//订单合同及差价备注
      amountDifferenceFileName: "",//订单合同及差价上传
      afterSales: "0",//是否售后
      afterSalesRemarks: "",//是否售后备注
      afterSalesFileName: "",//是否售后上传的文件
      train: "0",//培训
      sitePreparation: "0", //场地准备
      sitePreparationRemarks: "",//场地准备备注
      sitePreparationFileName: "",//场地准上传
      punishment: "0", //票据及违约责任
      otherRemarks: "",//其它备注
      freeText: "",//freeText
      other: 'false,false,false,false,false,false,false', // 其它
      other1: false,
      other2: false,
      other3: false,
      other4: false,
      other5: false,
      other6: false,
      other7: false,
      otherFilName: "", //其它文件上传
      supportFileMissing: "0", //文件缺失
      supportFileMissingRemarks: "",//文件缺失备注
      supportFileMissingFileName: "",//文件缺失附件
      productList: [
      ],
      sofonNameFileList: [],//sofon文件
      mrShieldingCompanyFileList: [], // 磁共振屏蔽公司
      confirmationFileFileList: [], // IGT第三方吊塔确认文件
      paymentProvisionFileNameFileList: [], // 付款条件
      shipmentDeliveryFileNameFileList: [], // 装运及交货
      sitePreparationFileNameFileList: [], // 场地准备
      installationWarrantyFileNameFileList: [], // 安装，验收及保修
      amountDifferenceFileNameFileList: [], // 直投订单合同金额和中标金额有价差
      performanceBondFileNameFileList: [], // 履约保函
      afterSalesFileNameFileList: [],//是否售后
      supportFileMissingFileNameFileList: [], // 支持文件缺失需特批进单
      otherFilNameFileList: [], // 其他条款
      agreementNo: "", //经销商协议号
      actualSales: "",//实际销售
    };
    this.dataBase.productList.push(obj);
    this.dataBase.productList.map((res, index) => {
      res.modelNumber = `进单单位${index + 1}`;
      res.modelNumber1 = `Order${index + 1}`;
      console.log('-------------------------------------------------------');
      console.log(res.modelNumber);
      console.log(res.modelNumber1);
    })
    this.message.create(type, `添加进单单位${len + 1}，请在列表末尾查看`);
  }
  //树形选择框确认
  handleOkMarketBundle(): void {
    let arr = this.tranf.getValue();
    this.tranf.rightBox.cancelACheck()
    var diffArr = []
    this.dataBase.productList.map((item, i) => {
      if (i !== this.dataCurr) {
        diffArr = diffArr.concat(this.dataBase.productList[i].productList.map(product => product.id))
      }
    })
    arr = arr.filter(node => !diffArr.includes(node.id))
    // End Diff
    arr = this.disreduce(arr, "id");
    arr.map(res => {      
      if (res.bmc == 'AMI' || res.bmc == 'CT' || res.bmc == 'DXR' || res.bmc == 'MR' || res.bmc == 'IGT-S'||res.bmc=='PDS-RadOnc') {
        res.disabled = false;
      }
      else {
        res.disabled = true;
      }
      res.productList = res.children;
      if (res.productList && res.productList.length > 0) {
        res.productList.map(vals => {
          vals.productModel = vals.productName;
        })
      }
    })
    let product = this.dataBase.productList[this.dataCurr].productList;
    //清除重复主机
    if (product && product.length > 0) {
      const masthost = product.some((val) => val.checked);
      if (masthost) {
        let host = product.find((val) => val.checked == true);
        arr.map(vals => {
          if ((vals.id == host.id) && !vals.disabled) {
            vals.checked = true;
          }
          else {
            vals.checked = false;
          }

        })
      }
    }
    else {
      if (arr && arr.length > 0) {
        arr.map(vals => {
          vals.checked = false;
        })
        let select = arr.find(val => !val.disabled)
        if (select) {
          arr.map(vals => {
            if (vals.id == select.id) {
              vals.checked = true;
            }
          })
        }

      }
    }
    this.dataBase.productList[this.dataCurr].productList = [...arr];
    this.dataBase.productList[this.dataCurr].productList.map(res => {
      res.simulationIds = res.simulationIdS;
      if (res.configurationFiles) {
        res.configurationFileList = [...res.configurationFiles];
        delete res.configurationFiles;
      }
    })
    this.GetPrice(this.dataBase.productList[this.dataCurr])
    this.isVisibleMarketBundle = false;
    this.ServesiceService.host.emit()

    //带入cq里边的配置文件
    this.dataBase.productList.map(val => {
      val.productList.map(vals => {
        const confFiles = [];
        if (vals.simulationIds != null && vals.simulationIds != undefined && vals.simulationIds != null) {
          const url = `/act/preparation/getAttachmentFromCP/${vals.simulationIds}/simulationConf`
          this.http.get(url).subscribe(res => {
            for (let i = 0; i < res.data.length; i++) {
              confFiles[i] = res.data[i].id;
            }
            if (confFiles != null && confFiles != undefined) {
              // 上传并打包配置文件========================
              this.http.post('/act/system/upload/cp', confFiles).subscribe((res3 => {
                vals.configurationFile = res3.data.FileId;
                vals.configurationFileList = [{
                  id: '' + res3.data.FileId,
                  preparationProductId: '',
                  preparationId: '',
                  fileId: '',
                  configurationFile: res3.data.FileName
                }];

              }), error => {

              });
            }
          })

        }
      })
    })
  }
  //清除子产品
  myskip(value) {
    if (this.dataBase.productList.length > 0) {
      this.dataBase.productList.map((res, index) => {
        if (res.productList.length > 0) {
          let Difference = [...res.productList].filter(x => [...value].every(y => y.id !== x.id));
          res.productList = Difference;
        }
      })
      this.dataBase.productList.map(res => {
        this.GetPrice(res)
      })
    }
  }
  //树形选择框取消
  handleCancelMarketBundle(): void {
    this.isVisibleMarketBundle = false;
    this.tranf.revert()
    this.dataBase.productList.map((node, index) => {
      this.dataBase.productList[index].productList && this.GetPrice(this.dataBase.productList[index])
    })
  }
  //删除产品
  delMarket(index, i) {
    this.tranf.getValue().map((vals, j) => {
      vals.id == this.dataBase.productList[index].productList[i].id && this.tranf.transSpecificNodeToLeft(vals);
    });
    this.dataBase.productList[index].productList.splice(i, 1);
    this.dataBase.productList[index].productList = [...this.dataBase.productList[index].productList];
    const productList = this.dataBase.productList[index].productList;
    if (productList.length > 0) {
      this.initChecked(index)
    }
    this.GetPrice(this.dataBase.productList[index])
  }

  addMarketBundle(index): void {

    if (this.dataBase.invoiceInformation == 'CNY') {
      if (this.dataBase.taxrate == '' || this.dataBase.taxrate == undefined || this.dataBase.taxrate == null) {
        this.message.create("error", "请先选择税率");
        return
      }
    }
    const dealFormId = this.dataBase.dealFormId;
    if (this.dataBase.dataList.length > 0 && dealFormId != '' && dealFormId != null && dealFormId != undefined) {
      this.isVisibleMarketBundle = true;
      this.dataCurr = index;
      let productList = this.dataBase.productList;
      if (productList.length > 0) {
        productList.map((res, i) => {
          if (res.productList.length > 0) {
            res.productList.map(vals => {
              const item = { ...vals }
              if (vals.simulationId) {
                item.id = vals.simulationId;
                item.key = vals.simulationId;
                item.label = vals.marketBundleName;
                item.value = vals.simulationId;
                item.checked = false;
              }
              else {
                item.id = vals.id;
                item.key = vals.id;
                item.label = vals.marketBundleName;
                item.value = vals.id;
                item.checked = false;
              }
              if (i !== index) {
                this.tranf.disableNode(item)
              } else {
                this.tranf.enableNode(item)
              }
            })
          }
        })
      }
      this.tranf.init()
    }
    else {
      this.message.create("warning", "请先查询Deal Form ID")
    }
  }
  /**
 * arrays数组，parm以那个值为去重参数
 */
  disreduce(arrays, parm) //除去重复的元素
  {

    var obj = {};
    arrays = arrays.reduce(function (item, next) {
      obj[next[parm]] ? '' : obj[next[parm]] = true && item.push(next);
      return item;
    }, []);
    return arrays
  }
  //删除进单单位
  deleteEntryUnit(): void {
    let productList = this.dataBase.productList;
    if (productList.length == 0) {
      this.message.create("warning", "没有可以删除单位");
      return
    }
    let cheakd = productList.some(res => res.checked)
    if (cheakd) {
      let difarr = [];
      let index = productList.findIndex(res => res.checked)
      this.tranf.transSpecificNodesToLeft(this.dataBase.productList[index].productList)
      let Difference = [...this.tranf.checkOptionsOne].filter(x => [...difarr].every(y => y.id !== x.id));
      this.tranf.checkOptionsOne = Difference;
      this.dataBase.productList = [...this.dataBase.productList.filter(res => res.checked == false)]
      this.dataBase.productList = Object.assign([], this.dataBase.productList);
      if (this.dataBase.productList.length > 0) {
        this.dataBase.productList.map((res, index) => {
          res.modelNumber = `进单单位${index + 1}`;
          res.modelNumber1 = `Order${index + 1}`;
          console.log('-------------------------------------------------------');
          console.log(res.modelNumber);
          console.log(res.modelNumber1);
        })
      }
      if (this.dataBase.financialProgramme == 0 || this.dataBase.financialProgrammeCost == 0.0000 || this.dataBase.financialProgrammeCost == null || this.dataBase.financialProgrammeCost == '') {
        this.orderSummary()
      }
      //this.getRebetPrice(this.dataBase.productList)
    }
    else {
      this.message.create("warning", "至少选择一个进单单位");
    }
    this.ServesiceService.host.emit()
  }
  initChecked(index) {
    !this.dataBase.productList[index].productList.some(res => res.checked == true)
      && (this.dataBase.productList[index].productList[0] && !this.dataBase.productList[index].productList[0].disabled)
      && (this.dataBase.productList[index].productList[0].checked = true);
  }
  toggleShowActions(val, i): void {
    this.dataBase.productList[i].showActionsSwitch = !this.dataBase.productList[i].showActionsSwitch;
  }
  //trade in和 rebet总价
  getRebetPrice(param) {
    let arr = [];
    if (param.length > 0) {
      param.map(res => {
        if (res.productList.length > 0) {
          res.productList.map(val => {
            arr.push(val.simulationIds);
          })
        }
      })
    }
    const url = `/act/preparation/getCost`;
    this.http.post(url, arr).subscribe(res => {
      this.dataBase.rebateCost = res.data.rebateCost;
      this.dataBase.tradeInCost = res.data.tradeInCost;
    })
  }
  //税率切换
  changeTaxrate(event) {

    this.dataBase.taxrate = event;
    if (this.dataBase.invoiceInformation == "CNY") {
      if (this.dataBase.financialProgramme == 0 || this.dataBase.financialProgrammeCost == 0.0000 || this.dataBase.financialProgrammeCost == null || this.dataBase.financialProgrammeCost == '') {
        this.orderSummary()
      }
    }
  }
  // 获取中标价格
  GetPrice(simulationList) {
    const url = '/act/preparation/queryAuditNetPrice';
    let arr = [];
    if (this.dataBase.invoiceInformation == 'CNY') {
      if (this.dataBase.taxrate == '' || this.dataBase.taxrate == undefined || this.dataBase.taxrate == null) {
        this.message.create("error", "请先选择税率");
        return
      }
    }
    if (simulationList.productList && simulationList.productList.length > 0) {
      simulationList.productList.map(item => {
        arr.push(item.dealFormMarketBundleId);
      })
    }
    if (arr.length > 0) {
      this.http.post(url, {
        invoiceInformation: this.dataBase.invoiceInformation,
        mbIds: arr,
        code: null,
      }).subscribe(res => {
        if (res.code == "0000") {
          // simulationList.totalPrice = res.data.totalNetPrice.toFixed(4);
          simulationList.totalPrice = this.returnFloat(Number(res.data.totalNetPrice.toString().match(/^\d+(?:\.\d{0,4})?/)), 4)  //保留4位小数
          // simulationList.totalContractPrice = Math.floor(res.data.totalContractPrice);
          this.ServesiceService.netPrice.emit(true);
          let list = res.data.list;
          list.map(item => {
            if (simulationList && simulationList.productList.length > 0) {
              simulationList.productList.map(val => {
                item.dealFormMarketBundleId == val.dealFormMarketBundleId && (val.approvalPrice = Math.round(item.auditNetPrice * 10000) / 10000);
              })
            }

          })
          if (this.dataBase.financialProgramme == 0 || this.dataBase.financialProgrammeCost == '0.0000' || this.dataBase.financialProgrammeCost == null || this.dataBase.financialProgrammeCost == '') {
            this.orderSummary()
          } else {
            this.orderSummayFinancial();
          }
        }
        else {
          this.message.create("error", res.msg)
        }
      })
    }
    else {
      simulationList.totalPrice = "";
      simulationList.totalContractPrice = "";
      //  this.dataBase.financialProgramme=='0'?this.orderSummary():this.orderSummayFinancial();
    }

  }
  //判断是否是数字
  myIsNaN(value) {
    return typeof value === 'number' && !isNaN(value);
  }
  //计算进单单位合同价
  orderCount(param) {
    if (this.dataBase.invoiceInformation == 'CNY') {
      if (param.financialPrice != "" && param.financialPrice != null && param.financialPrice != undefined && param.financialPrice != "-") {
        let isNaNs = this.myIsNaN(param.financialPrice);
        if (!isNaNs) {
          let taxrate = parseFloat(this.dataBase.taxrate);
          let totalContractPrice = ((param.totalPrice * 100 + param.financialPrice * 100) / 100) + ((param.totalPrice * 100 + param.financialPrice * 100) / 100 * taxrate);
          param.totalContractPrice = Math.round(totalContractPrice);
          param.totalContractPrices = Math.round(totalContractPrice);
        }
      }
      else {
        param.totalContractPrice = "";
        param.totalContractPrices = "";
      }
    }
    else {
      if (param.financialPrice != "" && param.financialPrice != null && param.financialPrice != undefined && param.financialPrice != "-") {
        let isNaNs = this.myIsNaN(param.financialPrice);
        if (!isNaNs) {
          let totalContractPrice = (param.totalPrice * 100 + param.financialPrice * 100) / 100
          param.totalContractPrice = Math.round(totalContractPrice);
          param.totalContractPrices = Math.round(totalContractPrice);
        }
      }
      else {
        param.totalContractPrice = "";
        param.totalContractPrices = "";
      }
    }
    //this.orderSummayFinancial();
  }
  //1计算e-com 总价 有金融方案的时候
  orderSummayFinancial() {

    if (this.dataBase.productList.length > 1) {
      let summay = 0;
      this.dataBase.productList.map((a) => {
        // return (a.totalPrice * 100 + b.totalPrice * 100) / 100
        // summay = summay + a.totalContractPrice;
        //const financialPrice=a.financialPrice?a.financialPrice:0;
        //let count=(a.totalPrice * 100+financialPrice*100)/100
        summay = (summay * 100 + a.totalPrice * 100) / 100;
      })
      let entryUnitPrice = (summay * 100 + this.dataBase.financialProgrammeCost * 100) / 100;
      this.dataBase.entryUnitPrice = this.returnFloat(Number(entryUnitPrice.toString().match(/^\d+(?:\.\d{0,4})?/)), 4)
      // this.dataBase.entryUnitPrice = Math.round(this.dataBase.entryUnitPrice * 1000) / 1000; //保留4位小数
      if (this.dataBase.entryUnitPrice == 0) {
        this.dataBase.entryUnitPrice = "";
      }
    }
    else if (this.dataBase.productList.length == 1) {
      if (this.dataBase.productList[0].totalPrice) {
        let summay = (this.dataBase.productList[0].totalPrice * 100 + this.dataBase.financialProgrammeCost * 100) / 100;
        this.dataBase.entryUnitPrice = this.returnFloat(Number(summay.toString().match(/^\d+(?:\.\d{0,4})?/)), 4)   //保留4位小数
      }
      if (this.dataBase.entryUnitPrice == 0) {
        this.dataBase.entryUnitPrice = "";
      }
    }
    else {
      this.dataBase.entryUnitPrice = "";
    }
  }
  //1计算e-com 总价 没有金融方案的时候
  orderSummary() {
    if (this.dataBase.productList.length > 1) {
      let summay = 0;
      this.dataBase.productList.map((a) => {
        // return (a.totalPrice * 100 + b.totalPrice * 100) / 100
        // summay = summay + a.totalContractPrice;
        summay = (summay * 100 + a.totalPrice * 100) / 100;
        if (this.dataBase.invoiceInformation == "CNY") {
          let taxrate = 1 + parseFloat(this.dataBase.taxrate);
          let totalPrice = a.totalPrice * taxrate;
          a.totalContractPrice = Math.round(totalPrice);
          a.totalContractPrices = Math.round(totalPrice);
        }
        else {
          a.totalContractPrice = Math.round(a.totalPrice);
          a.totalContractPrices = Math.round(a.totalPrice);
        }

      })
      this.dataBase.entryUnitPrice = this.returnFloat(Number(summay.toString().match(/^\d+(?:\.\d{0,4})?/)), 4)
      // this.dataBase.entryUnitPrice = Math.round(this.dataBase.entryUnitPrice * 1000) / 1000; //保留4位小数
      if (this.dataBase.entryUnitPrice == 0) {
        this.dataBase.entryUnitPrice = "";
      }
    }
    else if (this.dataBase.productList.length == 1) {
      if (this.dataBase.productList[0].totalPrice) {
        this.dataBase.entryUnitPrice = this.returnFloat(Number(this.dataBase.productList[0].totalPrice.toString().match(/^\d+(?:\.\d{0,4})?/)), 4)   //保留4位小数
        if (this.dataBase.invoiceInformation == "CNY") {
          let taxrate = 1 + parseFloat(this.dataBase.taxrate);
          let totalPrice = this.dataBase.productList[0].totalPrice * taxrate;
          this.dataBase.productList[0].totalContractPrice = Math.round(totalPrice);
          this.dataBase.productList[0].totalContractPrices = Math.round(totalPrice);
        }
        else {
          this.dataBase.productList[0].totalContractPrice = Math.round(this.dataBase.productList[0].totalPrice);
          this.dataBase.productList[0].totalContractPrices = Math.round(this.dataBase.productList[0].totalPrice);
        }
      }
      else {
        this.dataBase.entryUnitPrice = "";
      }
      if (this.dataBase.entryUnitPrice == 0) {
        this.dataBase.entryUnitPrice = "";
      }
    }
    else {
      this.dataBase.entryUnitPrice = "";
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
    } else {//如果没有小数点
      if (b == -1) {
        a = a + ".";
        for (i = 1; i <= num; i++) {
          a = a + "0";
        }
      } else {//有小数点，超出位数自动截取，否则补0
        a = a.substring(0, b + num + 1);
        for (i = c; i <= b + num; i++) {
          a = a + "0";
        }
      }
    }
    return a;
  }

}
