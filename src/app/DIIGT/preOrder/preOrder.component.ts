import {Component, OnInit, ViewEncapsulation, ViewChild, Input} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../app.service';
import { HttpService } from '../../services';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NzMessageService} from 'ng-zorro-antd';
import {
  cheakbox,
  ServesiceService,
} from './servesice.service';
import { decodeString, codeString, formatDatesNow,standardTime} from '../../../assets/js/tools';
import {type} from 'os';
import {Debug} from 'ng2-img-cropper/src/exif';

@Component({
  selector: 'app-preOrder',
  templateUrl: './preOrder.component.html',
  styleUrls: ['./preOrder.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class PreOrderComponent implements OnInit {
  @ViewChild('childbase') public childbase;
  public generateContractDraftSwitch = false;
  public nzLoading:any=false;
  public isShowDate:any=false;
  public isShowDates:any=false;
  public load = false;
  public bidData = [];
  public activedId: any = 'pending-tab';
  public verifiData = [];
  public verifiOff = true; //效验按钮禁用与否
  constructor(
    private nzMessageService: NzMessageService,
    private appService: AppService,
    private http: HttpService,
    private toastrService: ToastrService,
    private router: Router,
    private modalService: NgbModal,
    private aRoute: ActivatedRoute,
    private message: NzMessageService,
    private ServesiceService: ServesiceService,
  ) {
    this.appService.pageTitle = '主页';
    this.ServesiceService.recive.subscribe(res => {
      this.verifiData.push(res);
    });
  }
  public isSubmit:any=false; //确定是否可以提交
  public isVisibleWinCheck = false;  // 中标校验弹出框
  public isVisiblePrebook=false; //流转中的prebook
  tableLoad: any = false; //中标效验转圈s
  //public count: any; // 统计markband个数
  public paySwitch = true;
  public installSwitch = true;
  public dataBase: any = {
    productList: [], // 产品列表
    referenceId: '',
    detail: {
      id: '',
      flag: '0',
      status: '',
    },
    dataList: [],
    count: 0,
    sameFlag: "0",
  };
  //如果有在途的但依然提交
  handleApply()
  {
    this.isVisiblePrebook=false;
    this.isSubmit=true;
    this.handleOkWinCheck();
  }
  //判读prebook是否在途取消提交
  handleCancelPrebook()
  {
    this.isVisiblePrebook=false;
    this.load=false;
  }
  public tabclick(val) {
    this.activedId = val.nextId;
  }

  public ngOnInit(): void {

  }
  updateData(val) {
    this.dataBase = Object.assign({}, val)
  }
  myVerifi(val) //验证按钮是否可以点击
  {
    this.verifiOff = val;
  }
  public myskip(val): void { // 外部触发tab选项卡的事件
    this.activedId = val;
  }

  public updateDataBase(value: any) {
    // console.log('value', value);
    // console.log('this.dataBase', this.dataBase);
    //this.dataBase=value;
    // values.forEach()
    // this.dataBase = {};
  }

  public cancelContract(): void {
    this.router.navigate(['/igt/my-task']);
  }

  public saveContract(): void {
    // 招标授权表单提交或者保存
    this.dataBase.status = 0;
    //清除第三层checked
    const productList = this.dataBase.productList;
    if (productList.length > 0) {
      this.dataBase.productList.map(res => {
        res.checked = false;
        if (res.productList.length > 0) {
          res.productList.map(val => {
            val.modalityBmcs = val.modalityBmc ? val.modalityBmc : val.modalityBmcs;
            val.referenceId = "";
            if (val.productList && val.productList.length > 0) {
              val.productList.map(vals => {
                vals.checked = "";
              })
            }
          })
        }
      })
    }
    this.dataBase.biddingPrice=this.dataBase.biddingPrice?this.dataBase.biddingPrice:"0";
    this.load = true;
    this.http.post(`/act/preparation/saveAndSubmit`, this.dataBase).subscribe((rest => {
      if (rest.code === '0000') {
        this.message.create('success', `${rest.msg}`);
        this.load = false;
        /*this.router.navigate(['/igt/my-task']);*/
        if(rest.data)
        {
          this.dataBase.id=rest.data.mainId;
          this.dataBase.mainId=rest.data.mainId;
          this.dataBase.processInstanceTaskId=rest.data.processInstanceTaskId
        }
      }
      else {
        this.message.create('error', `${rest.msg}`);
        this.load = false;
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "服务器请异常！");
    }));
  }

  public winningBid(): void {
    // 判断每个进单单位里是否有mk

    const arr = [];
    let sampleAuditFlagArr = false;
    // 添加mk数量
    let mklength = 0;
    let productList = this.dataBase.productList;
    let checkPd = productList.some((vals) => vals.productList.length < 1);
    if (checkPd) {
      this.message.create('warning', '有进单单位没有添加产品!');
      return;
    }
    const dealFormId = this.dataBase.dealFormId;
    if (dealFormId == '' || dealFormId == undefined || dealFormId == null) {
      this.message.create('warning', '请填写dealFormId');
      return;
    }
    const cheakData = this.childbase.checkFormData();
    if (!cheakData) {
      this.myskip('pending-tab');
      this.message.create('error', `基础信息有必填项没有填写`);
      this.myVerifi(true);
      return;
    }
    if ((this.dataBase.businessModel === 'DISTRIBUTOR' && this.dataBase.ddpStatus !== '通过') || (this.dataBase.invoiceInformation === 'USD' && this.dataBase.contractDdpStatus !== '通过')) {
      this.message.create('warning', 'DDP-Status状态未通过');
      this.myskip('pending-tab');
      this.myVerifi(true);
      return;
    }
    // 判断是否添加进单单位
    if (!(this.dataBase.productList && this.dataBase.productList.length > 0)) {
      this.message.create('error', '请添加进单单位');
      return;
    } else {
      // 判断每个进单单位里是否有mk
      for (let i = 0; i < this.dataBase.productList.length; i++) {
        // 判断当  IGT第三方吊塔确认文件 为需要时  文件不能为空
        const fi = this.dataBase.productList[i].confirmationFile;
        let host = this.dataBase.productList[i].productList.find(val => val.checked);
        //是否有磁共震或者塔吊的验证
        if (host.modalityBmc) {
          let bmcIsDisble = host.modalityBmc.some(vals => vals == "MR");
          let bmcIgtDisble = host.modalityBmc.some(vals => vals == "IGT-S");
          if (bmcIsDisble) {
            let mrShielding = this.dataBase.productList[i].mrShieldingCompany;
            if (mrShielding == null || mrShielding == "" || mrShielding == undefined) {
              this.message.create("error", "请上传磁屏蔽公司确认文件");
              return
            }
          }
          if (bmcIgtDisble) {
            if (this.dataBase.productList[i].confirmationFileFlag === '0' && (fi == null || fi === '')) {
              this.message.create('error', '请上传IGT第三方显示器吊塔确认文件');
              return;
            }
          }
        }

        //判断产品专家是否为必填项
        for(let j=0;j<this.dataBase.productList[i].productList.length;j++){
          let productExpert = this.dataBase.productList[i].productList[j].productExpert;
          if(productExpert == null || productExpert == "" || productExpert==undefined){
            this.message.create('error', '请填写产品专家');
            return;
          }
        }

        //prebook申请号是否已经填写
        let productList = this.dataBase.productList[i]
        if(productList.isPrebookApply=='1')
        {
           if(productList.prebookReferenceId==""||productList.prebookReferenceId==undefined||productList.prebookReferenceId==null)
           {
              this.message.create('error', '请填写Prebook申请号');
              return;
           }
        }
        //判断freeText是否必填
        if (productList.other7 && (productList.freeText == null || productList.freeText == '' || productList.freeText == undefined)) {
          this.message.create('error', '请填写其他');
          return;
        }
        //判断是否售后文件上传
        if(productList.afterSales==1&&(productList.afterSalesFileName==null||productList.afterSalesFileName==''||productList.afterSalesFileName==undefined))
        {
          this.message.create('error', '请上传售后限价支持文件!');
          return;
        }
        //提示勾选其它条款"进出口公司不在IE pool"
        const foreignTradeCompanys=this.dataBase.foreignTradeCompany?this.dataBase.foreignTradeCompany.replace(/\s+/g,""):"";
        const distributors=this.dataBase.distributor?this.dataBase.distributor.replace(/\s+/g,""):"";
        if (this.dataBase.invoiceInformation == 'USD' && this.dataBase.entryMode == 'BIDDING'&&foreignTradeCompanys!=distributors) {
          if (this.dataBase.contractBuyer2 != this.dataBase.foreignTradeCompany && !productList.other1) {
            this.message.create('error', '外贸公司不在IE Pool！请重新从IE Pool选择外贸公司，或勾选"其它条款：进出口公司选择不在IE Pool"');
            return;
          }
        }
       //业务模式为DISTRIBUTOR协议号必填
        if(this.dataBase.businessModel == 'DISTRIBUTOR')
        {
          if(productList.agreementNo==''||productList.agreementNo==undefined||productList.agreementNo==null)
          {
            this.message.create('error','请选择经销商协议号');
            return;
          }
        }
        //实际销售人
        if(this.dataBase.entryMode=='BIDDING'&&this.dataBase.centralized)
        {
          const reg=/^([a-zA-Z0-9_\.\-])+\@(philips.com)+$/;
          const valid = reg.test(productList.actualSales); // true
          if(productList.actualSales==''||productList.actualSales==undefined||productList.actualSales==null)
          {
            this.message.create('error','请填写实际销售');
            return;
          }
          if(!valid)
          {
            this.message.create('error','实际销售请填写成邮箱格式');
            return;
          }
        }
        //提示付款条款
        if(productList.paymentProvision==''||productList.paymentProvision==undefined||productList.paymentProvision==null)
        {
          this.message.create('error','请选择付款条款');
          return;
        }
        // *******************
        if (!(this.dataBase.productList[i].productList.length > 0)) {
          // 判断是否添加mk
          this.message.create('error', '请添加Market Bundle');
          return;
        } else {
          mklength += this.dataBase.productList[i].productList.length;
        }

        /*非标条款备注验证*/
        // 付款条款
        if (['36b88bf6-1864-11ec-9074-54ee75a9b10b',
          '36b893db-1864-11ec-9074-54ee75a9b10b',
          '36b8a2c0-1864-11ec-9074-54ee75a9b10b',
          '36b8a667-1864-11ec-9074-54ee75a9b10b',
          '36b8ae94-1864-11ec-9074-54ee75a9b10b',
          '36b8b294-1864-11ec-9074-54ee75a9b10b',
          '36b8b475-1864-11ec-9074-54ee75a9b10b',
          '36b8b558-1864-11ec-9074-54ee75a9b10b',
          '36b9b838-1864-11ec-9074-54ee75a9b10b',
          '36b9bba4-1864-11ec-9074-54ee75a9b10b',
          '36b9bf46-1864-11ec-9074-54ee75a9b10b',
          '36b9c46d-1864-11ec-9074-54ee75a9b10b',
          '36b9c198-1864-11ec-9074-54ee75a9b10b',
          '36b9c34f-1864-11ec-9074-54ee75a9b10b'].indexOf(productList.paymentProvision) !== -1) {
          // 付款条款选择“其他”时，备注不能为空
          if (this.isEmpty(productList.paymentProvisionRemarks)) {
            this.message.create('error', '请填写付款条款备注');
            return;
          }
        }

        // 装运及交货
        if (productList.shipmentDelivery === '1' || productList.shipmentDelivery === 1) {
          // 装运及交货选择“非标准条款”时，备注不能为空
          if (this.isEmpty(productList.shipmentDeliveryRemarks)) {
            this.message.create('error', '请填写装运及交货备注');
            return;
          }
        }

        // 场地准备
        if (productList.sitePreparation === '1' || productList.sitePreparation === 1) {
          // 场地准备选择“非标准条款”时，备注不能为空
          if (this.isEmpty(productList.sitePreparationRemarks)) {
            this.message.create('error', '请填写场地准备备注');
            return;
          }
        }

        // 安装，验收及保修
        if (productList.installationWarranty === '1' || productList.installationWarranty === 1) {
          // 安装，验收及保修选择“非标准条款”时，备注不能为空
          if (this.isEmpty(productList.installationWarrantyRemarks)) {
            this.message.create('error', '请填写安装，验收及保修备注');
            return;
          }
        }

        // 履约保函
        if (productList.performanceBond === '1' || productList.performanceBond === 1) {
          // 履约保函选择“需要”时，备注不能为空
          if (this.isEmpty(productList.performanceBondRemarks)) {
            this.message.create('error', '请填写履约保函备注');
            return;
          }
        }

        /*特批条款备注验证*/
        // 直投订单合同金额和中标金额有价差
        if (productList.amountDifference === '1' || productList.amountDifference === 1) {
          // 直投订单合同金额和中标金额有价差选择“是”时，备注不能为空
          if (this.isEmpty(productList.amountDifferenceRemarks)) {
            this.message.create('error', '请填写直投订单合同金额和中标金额有价差备注');
            return;
          }
        }

        // 支持文件缺失需特批进单
        if (productList.supportFileMissing === '1' || productList.supportFileMissing === 1) {
          // 支持文件缺失需特批进单选择“是”时，备注不能为空
          if (this.isEmpty(productList.supportFileMissingRemarks)) {
            this.message.create('error', '请填写支持文件缺失需特批进单备注');
            return;
          }
        }

      }
    }
    //投标公司不能等于外贸公司
    if(this.dataBase.invoiceInformation=='USD'&&this.dataBase.businessModel=='DISTRIBUTOR')
    {
       const tenderingCompany=this.dataBase.tenderingCompany?this.dataBase.tenderingCompany.replace(/\s+/g,""):"";
       const foreignTradeCompany=this.dataBase.foreignTradeCompany?this.dataBase.foreignTradeCompany.replace(/\s+/g,""):"";
       const distributor=this.dataBase.distributor?this.dataBase.distributor.replace(/\s+/g,""):"";
       if(distributor!=tenderingCompany)
       {
          if(tenderingCompany==foreignTradeCompany)
          {
            this.message.create('error', '外贸公司不能等于投标公司,请重新选择外贸公司!');
                return;
          }
       }
    }
    /**
     * 有多个进单单位，只要有一个进单单位中“支持文件缺失需特批进单”=否
     * 抽样审核订单支持文件”里面的4个文件在"是否抽样审核=是"的时候是必填的
     * bidding模式的时候 招标文件审核几个文件为必填字段
     * stock模式的时候，看team是否保函VAD,DXR,BV
     * DIRECT模式的时候，不用上传最终用户合同
     */


    sampleAuditFlagArr = this.dataBase.productList.every(vals => vals.supportFileMissing == '1');
    if (this.dataBase.entryMode == 'STOCK') {
      const teamList = JSON.parse(window.localStorage.getItem("profiles"));
      const teamRole = teamList.find(val => val.role == "Sales Rep/Mgr");
      const userTeam = teamRole.team;
      const userTeamOne = this.dataBase.userTeme == 'VAD' || this.dataBase.userTeme == 'CT VAD' || this.dataBase.userTeme == 'CTVAD';
      const userTeamTwo = this.dataBase.userTeme == 'VAD' || this.dataBase.userTeme == 'BV' || this.dataBase.userTeme == 'DXR' || this.dataBase.userTeme == 'CT VAD' || this.dataBase.userTeme == 'CTVAD';
      if ((this.dataBase.bidWinningNotice == '' || this.dataBase.bidWinningNotice == null || this.dataBase.bidWinningNotice == undefined) && userTeamOne) {
        let title = this.dataBase.tenderNo != '其他类型' ? '中标通知书' : '最终用户合同'
        this.myskip('pending-tab');
        this.message.create("error", `请上传${title}`)
        return

      }
      if ((this.dataBase.siteReport == '' || this.dataBase.siteReport == null || this.dataBase.siteReport == undefined) && userTeamTwo) {
        let demandLetter;
        if(this.dataBase.entryMode == 'STOCK'&&(this.dataBase.userTeme=='BV'||this.dataBase.userTeme=='DXR'))
        {
          demandLetter = "要货函";
        }
        else{
          if (this.dataBase.hospitalNature == '民营医院') {
            demandLetter = "场地勘验报告";
          }
          else {
            if (this.dataBase.tenderNo != '其他类型') {
              demandLetter = "要货函";
            }
            else {
              demandLetter = "场地勘验报告";
            }
          }
        }
        this.myskip('pending-tab');
        this.message.create("error", `请上传${demandLetter}`)
        return
      }
    }

    if (this.dataBase.sampleAuditFlag == '1' && !sampleAuditFlagArr) {
      if ((this.dataBase.biddingDocuments == '' || this.dataBase.biddingDocuments == null || this.dataBase.biddingDocuments == undefined) && this.dataBase.tenderNo != '其他类型') {
        this.myskip('pending-tab');
        this.message.create("error", "请上传投标文件")
        return
      }
      if ((this.dataBase.tenderDocuments == '' || this.dataBase.tenderDocuments == null || this.dataBase.tenderDocuments == undefined) && this.dataBase.tenderNo != '其他类型') {
        this.myskip('pending-tab');
        this.message.create("error", "请上传招标文件")
        return
      }
      if ((this.dataBase.endUserContract == '' || this.dataBase.endUserContract == null || this.dataBase.endUserContract == undefined)&&this.dataBase.businessModel!='DIRECT') {
        this.myskip('pending-tab');
        this.message.create("error", "请上传最终用户合同")
        return
      }
      if ((this.dataBase.projectAnalysisTable == '' || this.dataBase.projectAnalysisTable == null || this.dataBase.projectAnalysisTable == undefined) && this.dataBase.businessModel == 'DISTRIBUTOR') {
        this.myskip('pending-tab');
        this.message.create("error", "请上传项目分析表")
        return
      }
    }
    // mk数量
    const listlength = this.dataBase.dataList.length;
    // 判断mk是否分配完
    if (listlength !== mklength) {
      this.message.create('warning', '请先分配完Market Bundle');
      return;
    }

    let marketBundLen = []; //marketBund长度 为验证是否分配完marketBundLen长度;
    this.dataBase.productList.map(res => {
      const obj = {
        'centralized':"",
        'key': '',
        'modelNumber': '', // 进单单位名称
        'opportunityId': '',
        'dealFormMarketBundleId': '',
        'distributor': "",// 进单经销商
        'agreementAgenName': "", //投标经销商
        'simulationId': "",
        'marketBundleName': '',  // marketBundleName
        'productList': [], // 子产品名称
        'orderByCustomerName': '',  // 进单客户名称
        'orderByApplicant': '',      // 进单客户id
        'winningByCustomerName': '', // 中标客户名称
        'winningByApplicant': '',    // 中标客户id
        'tenderingCompany': '', //进单投标公司
        'biddingName': '', //中标投标公司
        'tenderNo': '', //招标编号
        'biddingNo': '',//biddingNo
        'businessModel': '', //业务模式
        'rowspan': '',
        'productName': '', // 子产品名称
        'appPerson': '', // 进单申请人
        'winPerson': '', // 中标申请人
        'isCheak': false,
        "showCheak": false, //预计投标价格和中标价格单元格的显示
        "estimatedBidPrice": "", //预计投标价
        "biddingPrice": "",//中标价格
        'select': '',
        "invoiceInformation": "", //cp币制
        "currency": "",//中标币制
        'searchResult': [
        ],
        'checkResult': '', // 校验结果
        'checkResultReasons': []  // 校验失败原因
      };
      obj.centralized = this.dataBase.centralized
      obj.modelNumber = res.modelNumber;
      obj.appPerson = localStorage.getItem('ng_philips_code1');
      obj.distributor = this.dataBase.distributor;
      obj.orderByCustomerName = this.dataBase.endUser;
      obj.tenderingCompany = this.dataBase.tenderingCompany;
      obj.tenderNo = this.dataBase.tenderNo;
      obj.businessModel = this.dataBase.businessModel;
      obj.estimatedBidPrice = this.dataBase.estimatedBidPrice;
      obj.invoiceInformation = this.dataBase.invoiceInformation;
      res.productList.map(val => {

        marketBundLen.push(val);
        const objs = JSON.parse(JSON.stringify(obj));
        objs.key = val.id;
        objs.accountId = this.dataBase.endUserId;
        objs.number=val.marketBundleQuantity;
        objs.opportunityId = val.opportunityId;
        objs.dealFormMarketBundleId = val.dealFormMarketBundleId;
        objs.simulationIds = val.simulationIdS;
        objs.marketBundleName = val.marketBundleName;
        objs.productList = val.productList && val.productList.length > 0 ? [...val.productList] : []
        objs.checked = val.checked; //主机效验
        if (val.productList && val.productList.length > 0) {
          val.productList.map((vals, index) => {
            const objss = JSON.parse(JSON.stringify(objs));
            objss.productName = vals.productName;
            objss.isCheak = index == 0 ? true : false;
            arr.push(objss);
          });
        }
        else {
          const objss = JSON.parse(JSON.stringify(objs));
          objss.productName = "";
          objss.isCheak = true;
          arr.push(objss);
        }

      });
    });
    let arrIscheak = [];
    arr.map(res => {
      // res.isCheak && arrIscheak.push(res)   //全部效验
      if (res.isCheak && res.checked)  //主机效验
      {
        arrIscheak.push(res)
      }
    })
    if (arrIscheak.length > 0 && marketBundLen.length == this.dataBase.count) {
      this.isVisibleWinCheck = true;
      const url = `/act/ecom/order/application/getBiddingVeri`;
      this.tableLoad = true;
      this.http.post(url, arrIscheak).subscribe((res => {

        if (res.code === '0000') {
          this.tableLoad = false;
          if (res.data.length > 0) {
            this.dataBase.biddingPrice = res.data[0].biddingPrice ? res.data[0].biddingPrice : 0;
            this.dataBase.biddingPrices = res.data[0].biddingPrices;
          }
          arrIscheak.map((vals, index) => {
            //vals.winningByCustomerName = res.data[index].orderByApplicant;
            //vals.winPerson = res.data[index].winningByApplicant;
            if (res.data.length > 0) {
              vals.biddingPrice = res.data[index].biddingPrice;       //中标价格
              vals.currency = res.data[index].biddingPrices; //中标币制
              vals.searchResult = [...res.data[index].searchResult];
            }
          });
          arr.map(res => {
            arrIscheak.map(vals => {
              if (res.key == vals.key) {
                //  vals.winningByCustomerName = vals.orderByApplicant;
                //  vals.winPerson = vals.winningByApplicant;
                vals.searchResult = [...vals.searchResult];
              }
            })
          })
          //this.bidData = [...arr]; //全部效验
          this.bidData = [...arrIscheak];  //主机效验
          this.bidData.map((item, index) => {    //添加临时占用
            let len = this.bidData.length;
            item.rowspan = len > 0 ? len : 1;
            item.showCheak = index == 0 ? true : false;
            item.searchResult.map(vals => {
              vals.temUser = false;   //已经选中
              vals.isDisable = vals.useStatus == '0' ? false : true; //是否禁用
            })
          })
        }
      }), (error => {
        this.message.create("error", "请求异常")
      }));
    } else {
      this.message.create('warning', '请先分配完Market Bundle');
    }
  }


  public handleOkWinCheck(): void {
    // 添加mk数量

    let mklength = 0;
    let sampleAuditFlagArr = false;
    this.verifiData = [];

    this.ServesiceService.bookEventer.emit(true);
    const cheakItem = [...this.verifiData];
    const cheakbox = cheakItem.every((vals) => vals === true); // 字段是否填写完成
    // 判断是否添加进单单位
    if (!(this.dataBase.productList && this.dataBase.productList.length > 0)) {
      this.message.create('error', '请添加进单单位');
      return;
    } else {
      // 判断每个进单单位里是否有mk
      for (let i = 0; i < this.dataBase.productList.length; i++) {
        // 判断当  IGT第三方吊塔确认文件 为需要时  文件不能为空
        const fi = this.dataBase.productList[i].confirmationFile;
        let host = this.dataBase.productList[i].productList.find(val => val.checked);
        //是否有磁共震或者塔吊的验证
        if (host && host.modalityBmc) {
          let bmcIsDisble = host.modalityBmc.some(vals => vals == "MR");
          let bmcIgtDisble = host.modalityBmc.some(vals => vals == "IGT-S");
          if (bmcIsDisble) {
            let mrShielding = this.dataBase.productList[i].mrShieldingCompany;
            if (mrShielding == null || mrShielding == "" || mrShielding == undefined) {
              this.message.create("error", "请上传磁屏蔽公司确认文件");
              return;
            }
          }
          if (bmcIgtDisble) {
            if (this.dataBase.productList[i].confirmationFileFlag === '0' && (fi == null || fi === '')) {
              this.message.create('error', '请上传IGT第三方显示器吊塔确认文件');
              return;
            }
          }
        }

        //判断产品专家是否为必填项
        for(let j=0;j<this.dataBase.productList[i].productList.length;j++){
          let productExpert = this.dataBase.productList[i].productList[j].productExpert;
          if(productExpert == null || productExpert == "" || productExpert==undefined){
            this.message.create('error', '请填写产品专家');
            return;
          }
        }

          //prebook申请号是否已经填写
          let productList = this.dataBase.productList[i];
          if(this.dataBase.finaSofonQuoation)
          {
            productList.sofonNo=this.dataBase.finaSofonQuoation;
          }
          if(productList.isPrebookApply=='1')
          {
              if(productList.prebookReferenceId==""||productList.prebookReferenceId==undefined||productList.prebookReferenceId==null)
              {
                this.message.create('error', '请填写Prebook申请号');
                return;
              }
          }
        //判断freeText是否必填
        if (productList.other7 && (productList.freeText == null || productList.freeText == '' || productList.freeText == null)) {
          this.message.create('error', '请填写其他');
          return;
        }
         //判断是否售后文件上传
        if(productList.afterSales==1&&(productList.afterSalesFileName==null||productList.afterSalesFileName==''||productList.afterSalesFileName==undefined))
        {
          this.message.create('error', '请上传售后限价支持文件!');
          return;
        }
        //prebook信息是否清空
        if(productList.isPrebookApply=='0')
        {
          productList.prebookProductId="";
          productList.prebookReferenceId="";
          productList.prebookMainId="";
        }
        //提示勾选其它条款"进出口公司不在IE pool"
        const foreignTradeCompanys=this.dataBase.foreignTradeCompany?this.dataBase.foreignTradeCompany.replace(/\s+/g,""):"";
        const distributors=this.dataBase.distributor?this.dataBase.distributor.replace(/\s+/g,""):"";
        if (this.dataBase.invoiceInformation == 'USD' && this.dataBase.entryMode == 'BIDDING'&&foreignTradeCompanys!=distributors) {
          if (this.dataBase.contractBuyer2 != this.dataBase.foreignTradeCompany && !productList.other1) {
            this.message.create('error', '外贸公司不在IE Pool！请重新从IE Pool选择外贸公司，或勾选"其它条款：进出口公司选择不在IE Pool"');
            return;
          }
        }
        //业务模式为DISTRIBUTOR协议号必填
        if(this.dataBase.businessModel == 'DISTRIBUTOR')
        {
          if(productList.agreementNo==''||productList.agreementNo==undefined||productList.agreementNo==null)
          {
            this.message.create('error','请选择经销商协议号');
            return;
          }
        }
        //实际销售人
        if(this.dataBase.entryMode=='BIDDING'&&this.dataBase.centralized)
        {
          const reg=/^([a-zA-Z0-9_\.\-])+\@(philips.com)+$/;
          const valid = reg.test(productList.actualSales); // true
          if(productList.actualSales==''||productList.actualSales==undefined||productList.actualSales==null)
          {
            this.message.create('error','请填写实际销售');
            return;
          }
          if(!valid)
          {
            this.message.create('error','实际销售请填写成邮箱格式');
            return;
          }
        }
        //提示付款条款
        if(productList.paymentProvision==''||productList.paymentProvision==undefined||productList.paymentProvision==null)
        {
          this.message.create('error','请选择付款条款');
          return;
        }
        // *******************
        if (!(this.dataBase.productList[i].productList.length > 0)) {
          // 判断是否添加mk
          this.message.create('error', '请添加Market Bundle');
          return;
        } else {
          mklength += this.dataBase.productList[i].productList.length;
        }

        /*非标条款备注验证*/
        // 付款条款
        if (['36b88bf6-1864-11ec-9074-54ee75a9b10b',
          '36b893db-1864-11ec-9074-54ee75a9b10b',
          '36b8a2c0-1864-11ec-9074-54ee75a9b10b',
          '36b8a667-1864-11ec-9074-54ee75a9b10b',
          '36b8ae94-1864-11ec-9074-54ee75a9b10b',
          '36b8b294-1864-11ec-9074-54ee75a9b10b',
          '36b8b475-1864-11ec-9074-54ee75a9b10b',
          '36b8b558-1864-11ec-9074-54ee75a9b10b',
          '36b9b838-1864-11ec-9074-54ee75a9b10b',
          '36b9bba4-1864-11ec-9074-54ee75a9b10b',
          '36b9bf46-1864-11ec-9074-54ee75a9b10b',
          '36b9c46d-1864-11ec-9074-54ee75a9b10b',
          '36b9c198-1864-11ec-9074-54ee75a9b10b',
          '36b9c34f-1864-11ec-9074-54ee75a9b10b'].indexOf(productList.paymentProvision) !== -1) {
          // 付款条款选择“其他”时，备注不能为空
          if (this.isEmpty(productList.paymentProvisionRemarks)) {
            this.message.create('error', '请填写付款条款备注');
            return;
          }
        }

        // 装运及交货
        if (productList.shipmentDelivery === '1' || productList.shipmentDelivery === 1) {
          // 装运及交货选择“非标准条款”时，备注不能为空
          if (this.isEmpty(productList.shipmentDeliveryRemarks)) {
            this.message.create('error', '请填写装运及交货备注');
            return;
          }
        }

        // 场地准备
        if (productList.sitePreparation === '1' || productList.sitePreparation === 1) {
          // 场地准备选择“非标准条款”时，备注不能为空
          if (this.isEmpty(productList.sitePreparationRemarks)) {
            this.message.create('error', '请填写场地准备备注');
            return;
          }
        }

        // 安装，验收及保修
        if (productList.installationWarranty === '1' || productList.installationWarranty === 1) {
          // 安装，验收及保修选择“非标准条款”时，备注不能为空
          if (this.isEmpty(productList.installationWarrantyRemarks)) {
            this.message.create('error', '请填写安装，验收及保修备注');
            return;
          }
        }

        // 履约保函
        if (productList.performanceBond === '1' || productList.performanceBond === 1) {
          // 履约保函选择“需要”时，备注不能为空
          if (this.isEmpty(productList.performanceBondRemarks)) {
            this.message.create('error', '请填写履约保函备注');
            return;
          }
        }

        /*特批条款备注验证*/
        // 直投订单合同金额和中标金额有价差
        if (productList.amountDifference === '1' || productList.amountDifference === 1) {
          // 直投订单合同金额和中标金额有价差选择“是”时，备注不能为空
          if (this.isEmpty(productList.amountDifferenceRemarks)) {
            this.message.create('error', '请填写直投订单合同金额和中标金额有价差备注');
            return;
          }
        }

        // 支持文件缺失需特批进单
        if (productList.supportFileMissing === '1' || productList.supportFileMissing === 1) {
          // 支持文件缺失需特批进单选择“是”时，备注不能为空
          if (this.isEmpty(productList.supportFileMissingRemarks)) {
            this.message.create('error', '请填写支持文件缺失需特批进单备注');
            return;
          }
        }

        //装运方式清空选项
        if(productList.shipmentDelivery=='0')
        {
          productList.shipmentDeliveryRemarks="";
          productList.shipmentDeliveryFileName="";
          productList.shipmentDeliveryFileNameFileList=[];
        }
        //场地准备
        if(productList.sitePreparation=='0')
        {
          productList.sitePreparationRemarks="";
          productList.sitePreparationFileName="";
          productList.sitePreparationFileNameFileList=[];
        }
        //安装与验收
        if(productList.installationWarranty=='0')
        {
          productList.installationWarrantyRemarks="";
          productList.installationWarrantyFileName="";
          productList.installationWarrantyFileNameFileList=[];
        }
         //履约保函
         if(productList.performanceBond=='0')
         {
          productList.performanceBondRemarks="";
          productList.performanceBondFileName="";
          productList.performanceBondFileNameFileList=[];
         }
         //是否有售后限价
         if(productList.afterSales=='0')
         {
          productList.afterSalesRemarks="";
          productList.afterSalesFileName="";
          productList.afterSalesFileNameFileList=[];
         }
         //直投订单合同金额和中标金额有价差
         if(productList.amountDifference=='0')
         {
          productList.amountDifferenceRemarks="";
          productList.amountDifferenceFileName="";
          productList.amountDifferenceFileNameFileList=[];
         }
         //支持文件缺失进单
         if(productList.supportFileMissing=='0')
         {
          productList.supportFileMissingRemarks="";
          productList.supportFileMissingFileName="";
          productList.supportFileMissingFileNameFileList=[];
         }
         let otherArr=productList.other.split(',');
         let otherFile=otherArr.some(res=>res==='true') //控制备注、复制按钮的显示与否;
         if(!otherFile)
         {
          productList.otherRemarks="";
          productList.otherFilName="";
          productList.freeText="";
          productList.otherFilNameFileList="";
         }
      }

    }
    //投标公司不能等于外贸公司
    if(this.dataBase.invoiceInformation=='USD'&&this.dataBase.businessModel=='DISTRIBUTOR')
    {
       const tenderingCompany=this.dataBase.tenderingCompany?this.dataBase.tenderingCompany.replace(/\s+/g,""):"";
       const foreignTradeCompany=this.dataBase.foreignTradeCompany?this.dataBase.foreignTradeCompany.replace(/\s+/g,""):"";
       const distributor=this.dataBase.distributor?this.dataBase.distributor.replace(/\s+/g,""):"";
       if(distributor!=tenderingCompany)
       {
          if(tenderingCompany==foreignTradeCompany)
          {
            this.message.create('error', '外贸公司不能等于投标公司,请重新选择外贸公司!');
                return;
          }
       }
    }
     /**
      * 进单有prebook必须至少关联一个prebook
      */

      if(this.dataBase.preBook)
      {
        if(this.dataBase.isPrebookApply=='0')
        {
          this.message.create("error","请关联prebook");
          return;
        }
      }

    /**
     * 有多个进单单位，只要有一个进单单位中“支持文件缺失需特批进单”=否
     * 抽样审核订单支持文件”里面的4个文件在"是否抽样审核=是"的时候是必填的
     * bidding模式的时候，招标文件审核里边几个文件为必填字段
     * stock模式的时候，看team是否保函VAD,DXR,BV
     * DIRECT模式的时候，不用上传最终用户合同
     */

    sampleAuditFlagArr = this.dataBase.productList.every(vals => vals.supportFileMissing == '1');
    if (this.dataBase.entryMode == 'STOCK') {
      const teamList = JSON.parse(window.localStorage.getItem("profiles"));
      const teamRole = teamList.find(val => val.role == "Sales Rep/Mgr");
      const userTeam = teamRole.team;
      const userTeamOne = this.dataBase.userTeme == 'VAD' || this.dataBase.userTeme == 'CT VAD' || this.dataBase.userTeme == 'CTVAD';
      const userTeamTwo = this.dataBase.userTeme == 'VAD' || this.dataBase.userTeme == 'BV' || this.dataBase.userTeme == 'DXR' || this.dataBase.userTeme == 'CT VAD' || this.dataBase.userTeme == 'CTVAD';

      if ((this.dataBase.bidWinningNotice == '' || this.dataBase.bidWinningNotice == null || this.dataBase.bidWinningNotice == undefined) && userTeamOne) {
        let title = this.dataBase.tenderNo != '其他类型' ? '中标通知书' : '最终用户合同'
        this.myskip('pending-tab');
        this.message.create("error", `请上传${title}`)
        return

      }
      if ((this.dataBase.siteReport == '' || this.dataBase.siteReport == null || this.dataBase.siteReport == undefined) && userTeamTwo) {
        let demandLetter;
        if(this.dataBase.entryMode == 'STOCK'&&(this.dataBase.userTeme=='BV'||this.dataBase.userTeme=='DXR'))
        {
          demandLetter = "要货函";
        }
        else{
          if (this.dataBase.hospitalNature == '民营医院') {
            demandLetter = "场地勘验报告";
          }
          else {
            if (this.dataBase.tenderNo != '其他类型') {
              demandLetter = "要货函";
            }
            else {
              demandLetter = "场地勘验报告";
            }
          }
        }
        this.myskip('pending-tab');
        this.message.create("error", `请上传${demandLetter}`)
        return

      }
    }

    if (this.dataBase.sampleAuditFlag == '1' && !sampleAuditFlagArr) {
      if ((this.dataBase.biddingDocuments == '' || this.dataBase.biddingDocuments == null || this.dataBase.biddingDocuments == undefined) && this.dataBase.tenderNo != '其他类型') {
        this.myskip('pending-tab');
        this.message.create("error", "请上传投标文件")
        return
      }
      if ((this.dataBase.tenderDocuments == '' || this.dataBase.tenderDocuments == null || this.dataBase.tenderDocuments == undefined) && this.dataBase.tenderNo != '其他类型') {
        this.myskip('pending-tab');
        this.message.create("error", "请上传招标文件")
        return
      }
      if ((this.dataBase.endUserContract == '' || this.dataBase.endUserContract == null || this.dataBase.endUserContract == undefined)&&this.dataBase.businessModel!='DIRECT') {
        this.myskip('pending-tab');
        this.message.create("error", "请上传最终用户合同")
        return
      }
      if ((this.dataBase.projectAnalysisTable == '' || this.dataBase.projectAnalysisTable == null || this.dataBase.projectAnalysisTable == undefined) && this.dataBase.businessModel == 'DISTRIBUTOR') {
        this.myskip('pending-tab');
        this.message.create("error", "请上传项目分析表")
        return
      }
    }
    // mk数量
    const listlength = this.dataBase.dataList.length;
    // 判断mk是否分配完
    if (listlength !== mklength) {
      this.message.create('warning', '请先分配完Market Bundle');
      return;
    }
    let nowprodcut = []; //把筛选出中标效验的产品
    this.bidData.map(res => {
      res.isCheak && nowprodcut.push(res);
    })
    this.dataBase.productList.map(res => { //中标效验成功的referenceId,productionInformId 赋值给对应的产品
      res.checked = false;
      res.productList.map(vals => {
        vals.configurationFileList = vals.configurationFiles ? vals.configurationFiles : [];
        vals.promotions = vals.promotions ? vals.promotions : "";
        vals.rebates = vals.rebates ? vals.rebates : "";
        if (vals.productList && vals.productList.length > 0) {
          vals.productList.map(val => {
            val.checked = "";
          })
        }
        if (nowprodcut.length > 0) {
          nowprodcut.map(val => {
            if (vals.id == val.key) {
              vals.referenceId = val.referenceId;
              vals.productionInformId = val.productionInformId;
            }
          })
        }
      })
    })


    this.isVisibleWinCheck = false;
    const url = '/act/preparation/saveAndSubmit';
    this.dataBase.status = 1;
    const cheakData = this.childbase.checkFormData();
    if (!cheakData) {
      this.myskip('pending-tab');
      this.message.create('error', `基础信息有必填项没有填写`);
      this.myVerifi(true);
      return;
    }

    const dealFormId = this.dataBase.dealFormId;
    if (dealFormId == undefined || dealFormId == null && dealFormId == "") {
      this.message.create('error', "请填写dealFormId");
      return;
    }

    this.dataBase.productList.map((res, index) => {
      res.productList.map(vals => {
        vals.modalityBmcs = vals.modalityBmc
        delete vals.children;
        delete vals.marketBundle;
      });
    });

    const ASYNS = async () => {
      this.nzLoading=true;
      this.load=true;
      if(this.dataBase.businessModel=='DISTRIBUTOR')
      {

          let distributorDate= await this.getdistributorDate();
          if (this.dataBase.businessModel === 'DISTRIBUTOR' && this.dataBase.ddpStatus !== '通过') {
          //  this.message.create('warning', 'DDP-Status状态未通过');
            this.isShowDate=true;
            this.myskip('pending-tab');
            this.myVerifi(true);
            this.nzLoading=false;
            this.load=false;
            return;
          }
       }
       if(this.dataBase.invoiceInformation === 'USD')
       {

          let iepoolDate=await this.getIepoolDate();
          if(this.dataBase.invoiceInformation === 'USD' && this.dataBase.contractDdpStatus !== '通过')
          {
          //  this.message.create('warning', 'DDP-Status状态未通过');
            this.isShowDates=true;
            this.myskip('pending-tab');
            this.myVerifi(true);
            this.nzLoading=false;
            this.load=false;
            return;
          }
       }
      let applying:any=await this.getPrebook(this.dataBase.dealFormId);
      if(applying.length>0&&applying[0].taskStatus!="prebook_end"&&!this.isSubmit)
      {
           this.isVisiblePrebook=true;
           this.load=false;
           this.nzLoading=false;
           return;
      }
      if(this.dataBase.invoiceInformation=='USD'&&this.dataBase.isPrebookApply=='1')
      {
        if(this.dataBase.foreignTradeCompany!=this.dataBase.preBook.foreignTradeCompany)
        {
          this.message.create("warning","外贸公司修改后slot可能被取消，请考虑后提交")
        }
      }
      if(this.dataBase.businessModel=='DIRECT'&&this.dataBase.invoiceInformation=='CNY'&&this.dataBase.isPrebookApply=='1')
      {
        if(this.dataBase.distributor!=this.dataBase.preBook.distributor)
        {
          this.message.create("warning","经销商数据和Pre-book申请记录不一致")
        }
      }

      this.http.post(url, this.dataBase).subscribe((rest => {
        if (rest.code === '0000') {
          this.message.create('success', `${rest.msg}`);
          this.load = false;
          this.router.navigate(['/igt/my-task']);
        }
        else{
          this.message.create('error', `${rest.msg}`);
          this.load = false;
        }
      }), (error => {
        this.load = false;
        this.message.create("error", "服务器异常！");
        this.isSubmit=false;
      }));
    }
    ASYNS();
  }

  public handleCancelWinCheck(): void {
    this.isVisibleWinCheck = false;
    this.verifiOff = true;
  }
  public cancelGenerateContractDraft(): void {
    this.nzMessageService.info('点击取消');
    this.generateContractDraftSwitch = false;
  }

  public confirmGenerateContractDraft(): void {
    this.nzMessageService.info('点击确认');
    this.generateContractDraftSwitch = true;
    this.dataBase.productList.map((item, index) => {
      item.showActionsSwitch = false;
    });
  }
  public jump(result, url, name) {
    this.router.navigate([result], {
      queryParams: {
        url, name
      }
    });
  }
    //根据dealFromId查询新的数据
    public getPrebook(id)
    {
      let url=`/act/prebook/queryPreBook?dealFormId=${id}`
      return new Promise((resolve, reject) => {
      this.http.get(url).subscribe((res=>{
          if(res.code=='0000'&&res.data)
          {
            let {data}=res;
            if(data.length>0)
            {
              let preBook=data.find(val=>val.taskStatus=="prebook_end");
              this.dataBase.preBook={...preBook};
            }
            this.nzLoading=false;
            resolve(data);

          }
        }),(error)=>{
          this.message.create("error","请求失败!");
          this.nzLoading=false;
        })
      })
    }
    //提交效验经销商日期
    getdistributorDate()
    {
      let param = {
        pageNo: 1,
        pageSize: 5,
        agreementNo: "", //协议号
        dealerCode: "", //经销code
        dealerName: this.dataBase.distributor, //经销商名称
        selectName: "", //当前选中
      }
      let url = `/act/preparation/getDealersOnlyWithRegFlag`
      return new Promise((resolve, reject) => {
        this.http.post(url, param).subscribe((res => {
          if (res.code == '0000' && res.data) {
            let data = res.data.rows;
            if (data.length > 0) {
              let time = standardTime(data[0].ddpValidUntil);
              this.dataBase.contractEndDate = formatDatesNow(time);
              this.dataBase.ddpStatus = this.isadopt(time);
            }
            resolve(data)
          }
        }), (error) => {
          this.message.create("error", "请求失败!");
          this.nzLoading = false;
        })
      })
    }
    //提交获取外贸易
    getIepoolDate()
    {
      let param={
        corporateName:this.dataBase.foreignTradeCompany,
      }
      let url=`/act/preparation/getIePool`
      return new Promise((resolve, reject) => {
      this.http.post(url,param).subscribe((res=>{
          if(res.code=='0000'&&res.data)
          {

            let {data}=res;
            if(data.length>0)
            {
              let time=standardTime(data[0].ddpValidUntil);
              this.dataBase.poolEndDate=formatDatesNow(time);
              this.dataBase.contractDdpStatus =this.isadopt(time);
            }

            resolve(data)
          }
        }),(error)=>{
          this.message.create("error","请求失败!");
          this.nzLoading=false;
        })
      })
    }
    public isadopt(param)
    {
      if (param) {
        let endDates = new Date(param);
        let year = endDates.getFullYear();
        let month = endDates.getMonth() + 1;
        let day = endDates.getDate();
        let overdue = `${year}-${month}-${day}`;
        let overDate = new Date(overdue).setHours(0, 0, 0, 0);
        let endDate = new Date(overDate).getTime();
        let nowDate = new Date(new Date().setHours(0, 0, 0, 0)).getTime()
        let iRemain: any = (endDate - nowDate) / 1000;
        iRemain = iRemain / 86400;
        iRemain = parseInt(iRemain) + 1;
        if (iRemain >= 1) {
          return "通过";
        }
        else {
          return "不通过";
        }
      }
      else {
        return null
      }
    }
    //取消
  isshowDateCancel()
  {
    this.isShowDate=false;
  }
  //取消
  isshowDateCancels()
  {
    this.isShowDates=false;
  }
  public isEmpty(e) {
    return e === '' || e === null || e === undefined;
  }
}
