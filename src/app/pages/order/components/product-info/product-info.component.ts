import { Component, OnInit, ViewEncapsulation, Input, Output, ViewChild, EventEmitter, SimpleChange, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from '@core/services';
import { AppService } from '@app/app.service'
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
import { getuuid, upLoadFileNew, haveRolesArr } from '@core/util/tools';

import { ServesiceService } from '@core/services';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'app-preOrderProductInfo',
  templateUrl: './product-info.component.html',
  styleUrls: ['./product-info.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class PreOrderProductInfoComponent implements OnInit {
  generateContractDraftSwitch = false;
  treeCheakData = []; //树形选中
  isVisibleMarketBundle = false; // 树形框弹出与否
  checked = true;
  bidData = [];
  flag = 1;
  load: any = false;
  public validateForm: FormGroup;
  @ViewChild('tranf') tranf; // 调用树形穿梭框
  @Input() dataBase: any = {} // 父组件传来的值
  @Input() ishow: any = false;
  @Input() paySwitch: false;
  @Input() installSwitch: false;
  @Output() myEvent = new EventEmitter()
  @Input() completed: any = false;
  @Input() public edit = false;
  @Input() disa: any = false;
  @Input() disaend: any = false;
  @Input() sofonoff: any = false;
  // 滚动监听
  public state: any;
  public statusDias: any = false;
  public supportingfileList: any = []; //支持文件
  scoll: any = false;
  isModif: any = false;
  rateList: any = [];
  priceEdit: any = true;
  price_value_list: any = { id: "" };
  pricevaluelist: any = { id: "" };
  public priceValueList: any = {

  };

  // 价格查看权限
  public price_permission: boolean = false;
  listOfSelection = [
    {
      text: 'Select All Row',
      onSelect: () => {
        this.checkAll(true);
      }
    },
    {
      text: 'Select Odd Row',
      onSelect: () => {
        this.listOfDisplayData.forEach((data, index) => (this.mapOfCheckedId[data.id] = index % 2 !== 0));
        this.refreshStatus();
      }
    },
    {
      text: 'Select Even Row',
      onSelect: () => {
        this.listOfDisplayData.forEach((data, index) => (this.mapOfCheckedId[data.id] = index % 2 === 0));
        this.refreshStatus();
      }
    }
  ];
  isAllDisplayDataChecked = false;
  isIndeterminate = false;
  listOfDisplayData: any[] = [];
  dataCurr: any = ""; //当前选中
  mapOfCheckedId: { [key: string]: boolean } = {};
  public productExpertList: any;

  //付款条款文件上传
  public supportingfileupload = (file: UploadFile): boolean => {
    const upLoadFileNews = upLoadFileNew.bind(this);
    upLoadFileNews(file).then((val => {
      this.supportingfileList = val.fileList;
      this.dataBase.supportingFile = val.fileId;
    }), (error) => {
      this.dataBase.supportingFile = "";
      this.supportingfileList = [];
    });
    return false;
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
  ngOnChanges(changes: SimpleChange): void {

    this.dataBase.detail.status = this.activatedRouter.queryParams['_value'].state ? this.activatedRouter.queryParams['_value'].state : "";
    this.dataBase.taxrate = this.dataBase.taxrate ? this.dataBase.taxrate : "0.13";
    this.isModif = this.completed;
    this.ServesiceService.host.emit(this.dataBase)
    if (changes['dataBase']) {
      this.tranf.reset()
      this.dataBase.productList.map((item, index) => {
        this.initChecked(index)
      })
      const roles = JSON.parse(localStorage.getItem("roles"));
      this.dataBase.tableColOff = roles.some(val => (val == 'OA' || val == 'OA Leader' || val == 'CFC Leader' || val == 'ZPM' || val == 'PM Leader' || val == 'PM Leader_change' || val == 'Distributor leader' || val == 'ZSL' || val == 'COP Operation' || val == 'Finance: C&C Leader' || val == 'Cluster BP' || val == 'OM' || val == 'Sales Leader' || val == 'C&C Leader'))
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
    //this.dataBase=Object.assign({},this.dataBase);
  }
  ngOnInit(): void {
    this.flag = this.activatedRouter.queryParams['_value'].flag;
    this.state = this.activatedRouter.queryParams['_value'].state;
    if (this.flag == 1 && !this.state) {
      this.statusDias = true;
    }
    const roles = JSON.parse(localStorage.getItem("roles"));
    if (this.flag != 0) {
      this.dataBase.productList = [];
    }
    this.validateForm = this.fb.group({
      totalPrice: new FormControl({ value: '', disabled: false }),
      totalContractPrice: new FormControl({ value: '', disabled: false }),
      taxrate: new FormControl({ value: '', disabled: this.disa }),
      isVerify: new FormControl({ value: '', disabled: this.disa }),
    })
    this.getproductExpertList();
    const arr = JSON.parse(localStorage.getItem('permissions'));
    if (arr) {
      this.price_permission = haveRolesArr(arr.price);
    }
  }

  nzRemoveFile = (file: UploadFile): any => {
    //删除支持文件
    this.dataBase.supportingFile = "";
    return true;
  }
  ngAfterViewInit(): void {
    const _this = this;
    const src = fromEvent(window, 'scroll').subscribe((event) => {
      let t;
      if (document.documentElement && document.documentElement.scrollTop) {
        t = document.documentElement.scrollTop;
      } else if (document.body) {
        t = document.body.scrollTop;
      }
      if (t > 270) {
        _this.scoll = true;
      } else {
        _this.scoll = false;
      }
    });
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
    // let totalContractPriceadd=data.totalContractPrices+1;
    // let totalContractPricereduce=data.totalContractPrices-1;
    // if(data.totalContractPrice>totalContractPriceadd||data.totalContractPrice<totalContractPricereduce)
    // {
    //   this.message.create("error","修改合同价不能大于原有价格的正负1")
    //   data.totalContractPrice=data.totalContractPrices;
    //   this.el.nativeElement.querySelector(id2).value=data.totalContractPrices;
    //   return false;
    // }
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
    const marketBundleName = this.dataBase.productList[i].productList[index].marketBundleName;
    this.getPrebook(marketBundleName, i);
    this.ServesiceService.host.emit();
  }
  addEntryUnit(type: string): void {
    const len = this.dataBase.productList.length;
    const obj = {
      id: getuuid(),
      priceDifferent: "0",
      modelNumber: "",
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
      isPrebookApply: '0',//prebook申请号
      prebookReferenceId: "", //prebook编号
      prebookProductId: "", //prebook产品id
      actualSales: "",//实际销售
    };
    this.dataBase.productList.push(obj);
    this.dataBase.productList.map((res, index) => {
      res.modelNumber = `进单单位${index + 1}`;
      res.sofonNo = this.dataBase.finaSofonQuoation
    })
    this.message.create(type, `添加进单单位${len + 1}，请在列表末尾查看`);
  }
  //是否下级
  isVerifyChange(event) {
    this.dataBase.isVerify = event;
    this.dataBase.productList.map(vals => {
      vals.priceDifferent = event ? '1' : '0';
    })
  }
  //下一步
  next() {
    this.myEvent.emit("complete-record"); //传参给父组件;
  }
  //上一步
  pre() {
    this.myEvent.emit("pending-tab"); //传参给父组件;
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
          if (vals.id == host.id) {
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
        arr[0].checked = true;
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
    let productList = this.dataBase.productList[this.dataCurr].productList;

    let select = productList.find(val => val.checked);
    this.getPrebook(select.marketBundleName, this.dataCurr)
    this.GetPrice(this.dataBase.productList[this.dataCurr])
    //this.getRebetPrice(this.dataBase.productList)
    this.isVisibleMarketBundle = false;
    this.ServesiceService.host.emit()
  }

  //查询prebook
  getPrebook(name, curr) {

    //prebook列表
    const pageParam: any = {
      total: 0,
      pageNo: 1,
      pageSize: 5,
      marketBundleName: name,
      distribtuor: "",
      dealFormId: this.dataBase.dealFormId,
      endUserName: this.dataBase.endUser,
      foreignTradeCompany: "",
      invoiceInformation: this.dataBase.invoiceInformation,
      businessModel: this.dataBase.businessModel
    }
    this.load = true

    this.http.post(`/act/prebook/queryPreBookApply`, pageParam).subscribe((rest => {
      if (rest.code === '0000') {
        this.load = false;
        let rows = rest.data.rows;
        let productList = this.dataBase.productList[curr];
        if (rows.length > 0) {
          let select = productList.productList.find(val => val.checked);
          if (select.simulationIds == rows[0].simulationId) {
            productList.prebookProductId = rows[0].id;
            productList.prebookReferenceId = rows[0].referenceId;
            productList.prebookMainId = rows[0].prebookMainId;
            productList.isPrebookApply = "1";
            this.ServesiceService.prebook.emit(true);
          }
          // let select=this.dataBase.productList[0].find(val=>val.prebookReferenceId==rows[0].referenceId)
          // if(!select)
          // {
          //   productList.prebookProductId=rows[0].id;
          //   productList.prebookReferenceId=rows[0].referenceId;
          //   productList.prebookMainId=rows[0].prebookMainId;
          //   productList.isPrebookApply="1";
          //   this.ServesiceService.prebook.emit(true);
          // }
        }
        else {
          productList.prebookProductId = "";
          productList.prebookReferenceId = "";
          productList.prebookMainId = "";
          productList.isPrebookApply = "0";
          this.ServesiceService.prebook.emit(true);
        }
      }
      else {
        this.load = false;
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "请求异常")
    }));
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

      //this.orderSummary();
      //this.getRebetPrice(this.dataBase.productList)
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
    //this.getRebetPrice(this.dataBase.productList)
    this.ServesiceService.host.emit()//触发子组件的判断是否有igt或者磁共振
    let productListNow = this.dataBase.productList[index];
    let select = productListNow.productList.find(val => val.checked);
    if (select) {
      this.getPrebook(select.marketBundleName, index)
    }
    else {
      productListNow.prebookProductId = "";
      productListNow.prebookReferenceId = "";
      productListNow.prebookMainId = "";
      productListNow.isPrebookApply = "0";
      this.ServesiceService.prebook.emit(true);
    }

  }
  initChecked(index) {
    !this.dataBase.productList[index].productList.some(res => res.checked == true)
      && this.dataBase.productList[index].productList[0]
      && (this.dataBase.productList[index].productList[0].checked = true);
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
      // let arr = [];
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
                // arr.push(items);
              }
              else {
                item.id = vals.id;
                item.key = vals.id;
                item.label = vals.marketBundleName;
                item.value = vals.id;
                item.checked = false;
                // arr.push(items);
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

      // 添加 productExpert
      let productExperts = this.dataBase.dataList.map(({ productExpert }) => (productExpert));
      if (productExperts && productExperts.length > 0) {
        productExperts = Array.from(new Set(productExperts));
        productExperts.forEach(item => {
          //不存在
          if (!this.productExpertList.includes(item)) {
            this.productExpertList.push(item);
          }
        })
      }
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
  toggleShowActions(val, i): void {
    this.dataBase.productList[i].showActionsSwitch = !this.dataBase.productList[i].showActionsSwitch;
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
    this.ServesiceService.prebook.emit(true);
    this.ServesiceService.host.emit()
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
  cancelContract(): void {
  }

  saveContract(): void {
  }

  cancelGenerateContractDraft(): void {
    this.nzMessageService.info('点击取消');
    this.generateContractDraftSwitch = false;
  }

  confirmGenerateContractDraft(): void {
    this.nzMessageService.info('点击确认');
    this.generateContractDraftSwitch = true;
    this.dataBase.productList.map((item, index) => {
      item.showActionsSwitch = false;
    });
  }

  submitContract(): void {
  }

  jump(result, url, name) {
    this.router.navigate([result], {
      queryParams: {
        url, name
      }
    });
  }

  constructor(
    private fb: FormBuilder,
    private appService: AppService,
    private http: HttpService,
    private router: Router,
    private nzMessageService: NzMessageService,
    private message: NzMessageService,
    public activatedRouter: ActivatedRoute,
    private ServesiceService: ServesiceService,
    private el: ElementRef
  ) {
    this.appService.pageTitle = '主页';
  }


  public Copy(object): void {
    if (this.dataBase.productList.length > 1) {
      for (let listlength = 0; listlength < this.dataBase.productList.length; listlength++) {
        for (let i = 0; i < object.key.length; i++) {
          this.dataBase.productList[listlength][object.key[i]] = object.val[i];
        }
      }
    }
    if (this.dataBase.productList.length > 1) {
      this.message.create('success', '复制成功');
      this.dataBase.paymentOff = false; //用于非标条款的复制按钮不被初始值覆盖
      this.ServesiceService.payment.emit(this.dataBase.paymentList)
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
  // 价格求和
  // GetPriceSum(itemData) {
  //   let sum = 0;
  //   if (itemData && itemData.productList) {
  //     itemData.productList.map(e => {
  //       itemData.totalPrice += parseInt(e.approvalPrice);
  //     });
  //   }

  // }

  //查询全部产品专家列表
  async getproductExpertList() {
    let url = `/act/preparation/getAllProductExpert`;
    await this.http.get(url).subscribe((rest => {
      if (rest.code == '0000' && rest.data) {
        this.productExpertList = rest.data;
        this.setUndefindProductExpert();
      }
    }), (error) => {
      this.message.create("error", "请求失败!");
    })
  }

  // 设置未定义的产品专家
  public setUndefindProductExpert() {
    if (this.dataBase) {
      if (this.dataBase.productList.length > 0) {
        //判断产品专家是否存在
        let productExperts = [];
        for (let i = 0; i < this.dataBase.productList.length; i++) {
          for (let j = 0; j < this.dataBase.productList[i].productList.length; j++) {
            let productExpert = this.dataBase.productList[i].productList[j].productExpert;
            if (productExpert != null && productExpert != "" && productExpert != undefined) {
              productExperts.push(productExpert);
            }
          }
        }
        if (productExperts && productExperts.length > 0) {
          productExperts = Array.from(new Set(productExperts));
          productExperts.forEach(item => {
            //不存在
            if (!this.productExpertList.includes(item)) {
              this.productExpertList.push(item);
            }
          })
        }
      }
    }
  }
}
