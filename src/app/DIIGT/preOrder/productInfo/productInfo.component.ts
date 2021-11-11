import { Component, OnInit, ViewEncapsulation, Input, Output, ViewChild, EventEmitter, SimpleChange,ElementRef} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../app.service';
import { HttpService } from '../../../services';
import { ToastrService } from 'ngx-toastr';
import { ApprovalMainModalComponent } from '../../../approval-main-modal/approval-main-modal.component';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NzMessageService } from 'ng-zorro-antd';
import { getuuid, disreduce } from "../../../../assets/js/tools"
import { JsonPipe } from '@angular/common';
import { load } from '@angular/core/src/render3';
import { disableDebugTools } from '@angular/platform-browser';
import { ServesiceService } from '../servesice.service';
import { fromEvent } from 'rxjs';
import { ConfirmationPopoverWindowOptions } from 'angular-confirmation-popover/confirmation-popover-window-options.provider';

@Component({
  selector: 'app-preOrderProductInfo',
  templateUrl: './productInfo.component.html',
  styleUrls: ['./productInfo.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class PreOrderProductInfoComponent implements OnInit {

  generateContractDraftSwitch = false;
  treeCheakData = []; //树形选中
  isVisibleMarketBundle = false; // 树形框弹出与否
  checked = true;
  bidData = [];
  flag = 1; 
  public validateForm: FormGroup;
  @ViewChild('tranf') tranf; // 调用树形穿梭框
  @Input() dataBase: any ={} // 父组件传来的值
  @Input() ishow: any = false;
  @Input() paySwitch: false;
  @Input() installSwitch: false;
  @Output() myEvent = new EventEmitter()
  @Input() completed: any = false;
  @Input() public edit = false;
  @Input() disa: any = false;
  @Input() sofonoff: any = false;
  // 滚动监听
  scoll: any = false;
  isModif: any = false;
  rateList: any = [];
  priceEdit:any=true;
  public priceValueList:any={
   
  };
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
  //点击事件修改价格
  keyupDown()
  {
    
      this.orderSummary();
  }
 
  ngOnChanges(changes:SimpleChange): void {
    
    this.dataBase.detail.status=this.activatedRouter.queryParams['_value'].state?this.activatedRouter.queryParams['_value'].state:"";
    this.dataBase.taxrate=this.dataBase.taxrate?this.dataBase.taxrate:"0.13";
    this.isModif = this.completed;
    this.ServesiceService.host.emit(this.dataBase)
    if(changes['dataBase']){ 
      this.tranf.reset()  
      this.dataBase.productList.map((item,index)=>{
        this.initChecked(index) 
      })
    const roles=JSON.parse(localStorage.getItem("roles"));    
    this.dataBase.tableColOff=roles.some(val=>(val=='OA'||val=='OA Leader'||val=='CFC Leader'||val=='ZPM'||val=='PM Leader'||val=='PM Leader_change'||val=='Distributor leader'||val=='ZSL'||val=='COP Operation'||val=='Finance: C&C Leader'||val=='Cluster BP'||val=='OM'||val=='Sales Leader'||val=='C&C Leader'))
    if(this.dataBase.detail.status=='DOACS'&&this.dataBase.tableColOff)
    {
     this.priceEdit=false;
    }   
  } 
    //this.dataBase=Object.assign({},this.dataBase);
  }
  ngOnInit(): void {
    this.flag = this.activatedRouter.queryParams['_value'].flag;
    
    const roles=JSON.parse(localStorage.getItem("roles"));   
    this.getRateList();
    if (this.flag != 0) {
      this.dataBase.productList = [];
    }
    this.validateForm = this.fb.group({
      totalPrice: new FormControl({ value: '', disabled: false }),
      totalContractPrice: new FormControl({ value: '', disabled: false }),
      taxrate: new FormControl({ value: '', disabled: this.disa }),
    })
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
  //税率列表
  public getRateList() {
    const params = {
      dictGroup: 'exchange_rate',
      listClass: 'rmb',      
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
      if (rest.code === '0000') {
        this.rateList = rest.data;
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
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
    this.ServesiceService.host.emit();
  }
  addEntryUnit(type: string): void {
    const len = this.dataBase.productList.length;
    const obj = {
      id: getuuid(),
      modelNumber: "",
      totalPrice: '',
      totalContractPrice: '',
      showActionsSwitch: false,
      checked: false,
      sofonName: "", //sofon文件
      sofonNameurl: "", //sofon链接
      sofonNo:"",//sofonno
      mrShieldingCompany: "", //磁共振屏蔽公司
      confirmationFileFlag: '1', //IGT第三方吊塔确认文
      confirmationFile: "", //IGT第三方吊塔文件上传
      paymentProvision: "0",//付款条件
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
      amountDifference: "0",//订单合同及差价
      paymentProvisionRadio: "1",//下一级是否审核
      amountDifferenceRemarks: "",//订单合同及差价备注
      amountDifferenceFileName: "",//订单合同及差价上传
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
      supportFileMissingFileNameFileList: [], // 支持文件缺失需特批进单
      otherFilNameFileList: [], // 其他条款
    };
    this.dataBase.productList.push(obj);
    this.dataBase.productList.map((res, index) => {
      res.modelNumber = `进单单位${index + 1}`;
    })
    this.message.create(type, `添加进单单位${len + 1}，请在列表末尾查看`);
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
  
   
    // arr.map(vals=>{
    //   vals.checked=false;
    // })
    // console.log('handleOkMarketBundle.arr',arr)
    // if (arr.length < 1) {
    //   this.message.create('warning', '没有选择产品,请选中产品点击>向右移动产品！');
    //   return
    // }

    // Diff
    var diffArr = []
    this.dataBase.productList.map((item,i)=>{
      if(i !== this.dataCurr){
        diffArr = diffArr.concat(this.dataBase.productList[i].productList.map(product=>product.id))
      }
    })
    arr = arr.filter(node=>!diffArr.includes(node.id))
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
    let product=this.dataBase.productList[this.dataCurr].productList;
    //清除重复主机
    if(product&&product.length>0)
    {
      const masthost=product.some((val)=>val.checked);      
      if(masthost)
      {
        let host=product.find((val)=>val.checked==true);
        arr.map(vals=>{
          if(vals.id==host.id)
          {
            vals.checked=true;
          }
          else
          {
            vals.checked=false;
          }
        
        })
      } 
    }
    else
    {
      if(arr&&arr.length>0)
      {
        arr.map(vals=>{
          vals.checked=false;
        })
        arr[0].checked=true;
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
    //this.getRebetPrice(this.dataBase.productList)
    this.isVisibleMarketBundle = false;   
    this.ServesiceService.host.emit() 
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
      this.orderSummary(); 
      //this.getRebetPrice(this.dataBase.productList)
    } 
  }
  //树形选择框取消
  handleCancelMarketBundle(): void {
    this.isVisibleMarketBundle = false;
    this.tranf.revert() 
    this.dataBase.productList.map((node, index) => {
      this.dataBase.productList[index].productList&&this.GetPrice(this.dataBase.productList[index])
    })    
    //this.tranf.checkOptionsOne=[];    
    // this.treeCheakData =  this.tranf.getValue();
   // this.getRebetPrice(this.dataBase.productList)
  }
  //删除产品
  delMarket(index, i) {
    // const product = this.dataBase.productList;
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
  }
  initChecked(index){
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
        productList.map((res,i )=> {
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
              // debugger
              // console.log(i,index,productList,productList[i])
              if(i!==index){
                this.tranf.disableNode(item)
              }else{
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
      this.orderSummary() 
      //this.getRebetPrice(this.dataBase.productList)
    }
    else {
      this.message.create("warning", "至少选择一个进单单位");
    }
    this.ServesiceService.host.emit()

  }
   //监听价格变化
  toNumber(e, data, id,index) {
    // console.log(data);
   
     //const id2 = '#' + id;
    //console.log(this.el.nativeElement.querySelector(id2).value)
    this.dataBase.productList[index].totalContractPrice=this.dataBase.productList[index].totalContractPrice.toString().replace(/\D/g,'');
    
    //const reg = /^(0|[1-9][0-9]{0,17})?$/;
    // if ((!isNaN(+e) && reg.test(e)) || e === '') {
    //     this.priceValueList[id] = e;
    // }
    
    // data = this.priceValueList[id];
    //  e = this.priceValueList[id];
    //  console.log(data);    
  }
  //trade in和 rebet总价
  getRebetPrice(param)
  {
    let arr=[];
    if(param.length>0)
    {
      param.map(res=>{
        if(res.productList.length>0)
        {
          res.productList.map(val=>{            
            arr.push(val.simulationIds);
          })
        }
      })
    }
    const url=`/act/preparation/getCost`;
    this.http.post(url,arr).subscribe(res=>{
      this.dataBase.rebateCost=res.data.rebateCost;
      this.dataBase.tradeInCost=res.data.tradeInCost;      
    })
  }
//小数后自动补零
 returnFloat(value:any,num){  
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
        code:this.dataBase.invoiceInformation=='CNY'? this.dataBase.taxrate:null
      }).subscribe(res => {
        if (res.code == "0000") {
          // simulationList.totalPrice = res.data.totalNetPrice.toFixed(4);
          simulationList.totalPrice = this.returnFloat(Number(res.data.totalNetPrice.toString().match(/^\d+(?:\.\d{0,4})?/)),4)  //保留4位小数 
          simulationList.totalContractPrice = Math.floor(res.data.totalContractPrice);
          let { list } = res.data;
          list.map(item => {
            simulationList.productList.map(val => {
              item.dealFormMarketBundleId == val.dealFormMarketBundleId && (val.approvalPrice = Math.round(item.auditNetPrice * 10000) / 10000);
            })
          })
          this.orderSummary();
        }
        else {
          this.message.create("error", res.msg)
        }
      })
    }
    else {
      simulationList.totalPrice = "";
      simulationList.totalContractPrice = "";
      this.orderSummary()
    }

  }

  //计算进单单位order summay
  orderSummary() {    
    if (this.dataBase.productList.length > 1) {
      let summay = 0;
      this.dataBase.productList.map((a) => {
        // return (a.totalPrice * 100 + b.totalPrice * 100) / 100
       // summay = summay + a.totalContractPrice;
       summay=(summay*100+a.totalPrice * 100)/100;
      })
      this.dataBase.entryUnitPrice = summay.toFixed(4);
     // this.dataBase.entryUnitPrice = Math.round(this.dataBase.entryUnitPrice * 1000) / 1000; //保留4位小数
      if (this.dataBase.entryUnitPrice == 0) {
        this.dataBase.entryUnitPrice = "";
      }
    }
    else if (this.dataBase.productList.length == 1) {
     // this.dataBase.entryUnitPrice = this.dataBase.productList[0].totalContractPrice;
      this.dataBase.entryUnitPrice=this.returnFloat(Number(this.dataBase.productList[0].totalPrice.toString().match(/^\d+(?:\.\d{0,4})?/)),4)   //保留4位小数
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
    private toastrService: ToastrService,
    private router: Router,
    private modalService: NgbModal,
    private nzMessageService: NzMessageService,
    private message: NzMessageService,
    private aRoute: ActivatedRoute,
    public activatedRouter: ActivatedRoute,
    private ServesiceService: ServesiceService,
    private el:ElementRef
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

    console.log(this.dataBase.productList)
    if (this.dataBase.productList.length > 1) {
      this.message.create('success', '复制成功');
    }
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
}
