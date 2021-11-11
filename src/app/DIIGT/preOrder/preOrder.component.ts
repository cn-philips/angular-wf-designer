import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../app.service';
import { HttpService } from '../../services';
import { ToastrService } from 'ngx-toastr';
import { ApprovalMainModalComponent } from '../../approval-main-modal/approval-main-modal.component';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NzMessageService } from 'ng-zorro-antd';
import {
  cheakbox,
  ServesiceService,
} from './servesice.service';
import { decodeString, codeString,formatDatesNow} from '../../../assets/js/tools';

@Component({
  selector: 'app-preOrder',
  templateUrl: './preOrder.component.html',
  styleUrls: ['./preOrder.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class PreOrderComponent implements OnInit {
  @ViewChild('childbase') public childbase;
  public generateContractDraftSwitch = false;
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
  public isVisibleWinCheck = false;  // 中标校验弹出框
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
    sameFlag:"0",
  };

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
  }

  public saveContract(): void {
    // 招标授权表单提交或者保存
    this.dataBase.status = 0;
    //清除第三层checked
    const productList = this.dataBase.productList;
    if (productList.length > 0) {
      this.dataBase.productList.map(res => {
        res.checked=false;
        if (res.productList.length > 0) {
          res.productList.map(val => {
            val.modalityBmcs = val.modalityBmc ? val.modalityBmc : val.modalityBmcs;
            val.referenceId="";
            if (val.productList && val.productList.length > 0) {
              val.productList.map(vals => {
                vals.checked = "";
              })
            }
          })
        }
      })
    }
    this.load = true;
    this.http.post(`/act/preparation/saveAndSubmit`, this.dataBase).subscribe((rest => {
      if (rest.code === '0000') {
        this.message.create('success', `${rest.msg}`);
        this.router.navigate(['/igt/my-task']);
        this.load = false;
      }else if (rest.code == '9999') {
        this.message.create('error', `此 Deal Form ID 已提交进单`);
        this.load = false;
        return;
      }
      else{
        this.message.create('error', `请求失败`);
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
    let sampleAuditFlagArr=false;
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
        //判断freeText是否必填
        let productList = this.dataBase.productList[i]
        if (productList.other7 && (productList.freeText == null || productList.freeText == '' || productList.freeText == null)) {
          this.message.create('error', '请填写其他');
          return;
        }
         //提示勾选其它条款"进出口公司不在IE pool"
         if(this.dataBase.invoiceInformation=='USD')
         {
           if(this.dataBase.contractBuyer2!=this.dataBase.foreignTradeCompany&&!productList.other1)
           {
             this.message.create('error', '外贸公司不在IE Pool！请重新从IE Pool选择外贸公司，或勾选"其它条款：进出口公司选择不在IE Pool"');
             return;
           }         
         }

        // *******************
        if (!(this.dataBase.productList[i].productList.length > 0)) {
          // 判断是否添加mk
          this.message.create('error', '请添加Market Bundle');
          return;
        } else {
          mklength += this.dataBase.productList[i].productList.length;
        }
      }
    }
    //投标公司不能等于外贸公司
    if(this.dataBase.invoiceInformation=='USD')
    {
      if(this.dataBase.tenderingCompany.replace(/\s+/g,"")==this.dataBase.foreignTradeCompany.replace(/\s+/g,""))
      {
        this.message.create('error', '外贸公司不能等于投标公司,请重新选择外贸公司!');
             return;
      }
    }
    /**
     * 有多个进单单位，只要有一个进单单位中“支持文件缺失需特批进单”=否
     * 抽样审核订单支持文件”里面的4个文件在"是否抽样审核=是"的时候是必填的
     */   
      
     sampleAuditFlagArr=this.dataBase.productList.every(vals=>vals.supportFileMissing=='1');
     if(this.dataBase.sampleAuditFlag=='1'&&!sampleAuditFlagArr)
     {
      if((this.dataBase.biddingDocuments==''||this.dataBase.biddingDocuments==null||this.dataBase.biddingDocuments==undefined)&&this.dataBase.tenderNo!='其他类型')
        {
          this.myskip('pending-tab');
          this.message.create("error","请上传投标文件") 
          return
        }
        if((this.dataBase.tenderDocuments==''||this.dataBase.tenderDocuments==null||this.dataBase.tenderDocuments==undefined)&&this.dataBase.tenderNo!='其他类型')
        {
          this.myskip('pending-tab');
          this.message.create("error","请上传招标文件") 
          return
        }
        if(this.dataBase.endUserContract==''||this.dataBase.endUserContract==null||this.dataBase.endUserContract==undefined)
        {
          this.myskip('pending-tab');
          this.message.create("error","请上传最终用户合同") 
          return
        }
        if((this.dataBase.projectAnalysisTable==''||this.dataBase.projectAnalysisTable==null||this.dataBase.projectAnalysisTable==undefined)&&this.dataBase.businessModel=='DISTRIBUTOR')
        {
          this.myskip('pending-tab');
          this.message.create("error","请上传项目分析表") 
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
        'key': '',
        'modelNumber': '', // 进单单位名称
        'opportunityId': '',
        'dealFormMarketBundleId': '',
        'distributor':"",// 进单经销商
        'agreementAgenName':"", //投标经销商 
        'simulationId': "",
        'marketBundleName': '',  // marketBundleName
        'productList': [], // 子产品名称
        'orderByCustomerName': '',  // 进单客户名称
        'orderByApplicant': '',      // 进单客户id
        'winningByCustomerName': '', // 中标客户名称
        'winningByApplicant': '',    // 中标客户id
        'tenderingCompany':'', //进单投标公司
        'biddingName':'', //中标投标公司
        'tenderNo':'', //招标编号
        'biddingNo':'',//biddingNo
        'businessModel':'', //业务模式
        'rowspan':'',
        'productName': '', // 子产品名称
        'appPerson': '', // 进单申请人
        'winPerson': '', // 中标申请人
        'isCheak': false,
        'select': '',
        'searchResult': [
        ],
        'checkResult': '', // 校验结果
        'checkResultReasons':[]  // 校验失败原因
      };
      obj.modelNumber = res.modelNumber;
      obj.appPerson = localStorage.getItem('ng_philips_code1');
      obj.distributor=this.dataBase.distributor;      
      obj.orderByCustomerName = this.dataBase.endUser;
      obj.tenderingCompany=this.dataBase.tenderingCompany;
      obj.tenderNo=this.dataBase.tenderNo;
      obj.businessModel=this.dataBase.businessModel;
      res.productList.map(val => {
        marketBundLen.push(val);        
        const objs = JSON.parse(JSON.stringify(obj));
        objs.key = val.id;
        objs.accountId = val.accountId;
        objs.opportunityId = val.opportunityId;
        objs.dealFormMarketBundleId = val.dealFormMarketBundleId;        
        objs.simulationIds = val.simulationIdS;
        objs.marketBundleName = val.marketBundleName;
        objs.productList = val.productList && val.productList.length > 0 ? [...val.productList] : []
        objs.checked=val.checked; //主机效验
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
       if(res.isCheak&&res.checked)  //主机效验
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
          arrIscheak.map((vals, index) => {
           //vals.winningByCustomerName = res.data[index].orderByApplicant;
           //vals.winPerson = res.data[index].winningByApplicant;
            vals.searchResult = [...res.data[index].searchResult];
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
          this.bidData.map(item => {    //添加临时占用
            let len = item.productList.length;
            item.rowspan = len > 0 ? len : 1;
            item.searchResult.map(vals => {                            
              vals.temUser = false;   //已经选中              
              vals.isDisable =vals.useStatus=='0'?false:true; //是否禁用
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
    let sampleAuditFlagArr=false;
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
        if (host&&host.modalityBmc) {
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
        //判断freeText是否必填
        let productList = this.dataBase.productList[i]
        if (productList.other7 && (productList.freeText == null || productList.freeText == '' || productList.freeText == null)) {
          this.message.create('error', '请填写其他');
          return;
        }
        //提示勾选其它条款"进出口公司不在IE pool"
        if(this.dataBase.invoiceInformation=='USD')
        {
          if(this.dataBase.contractBuyer2!=this.dataBase.foreignTradeCompany&&!productList.other1)
          {
            this.message.create('error', '外贸公司不在IE Pool！请重新从IE Pool选择外贸公司，或勾选"其它条款：进出口公司选择不在IE Pool"');
            return;
          }         
        }
        // *******************
        if (!(this.dataBase.productList[i].productList.length > 0)) {
          // 判断是否添加mk
          this.message.create('error', '请添加Market Bundle');
          return;
        } else {
          mklength += this.dataBase.productList[i].productList.length;
        }
      }
    }
    //投标公司不能等于外贸公司
    if(this.dataBase.invoiceInformation=='USD')
    {
      if(this.dataBase.tenderingCompany.replace(/\s+/g,"")==this.dataBase.foreignTradeCompany.replace(/\s+/g,""))
      {
        this.message.create('error', '外贸公司不能等于投标公司,请重新选择!');
             return;
      }
    }
    /**
     * 有多个进单单位，只要有一个进单单位中“支持文件缺失需特批进单”=否
     * 抽样审核订单支持文件”里面的4个文件在"是否抽样审核=是"的时候是必填的
     */ 
        
    sampleAuditFlagArr=this.dataBase.productList.every(vals=>vals.supportFileMissing=='1');
    if(this.dataBase.sampleAuditFlag=='1'&&!sampleAuditFlagArr)
    {
      if((this.dataBase.biddingDocuments==''||this.dataBase.biddingDocuments==null||this.dataBase.biddingDocuments==undefined)&&this.dataBase.tenderNo!='其他类型')
      {
        this.myskip('pending-tab');
        this.message.create("error","请上传投标文件") 
        return
      }
      if((this.dataBase.tenderDocuments==''||this.dataBase.tenderDocuments==null||this.dataBase.tenderDocuments==undefined)&&this.dataBase.tenderNo!='其他类型')
      {
        this.myskip('pending-tab');
        this.message.create("error","请上传招标文件") 
        return
      }
      if(this.dataBase.endUserContract==''||this.dataBase.endUserContract==null||this.dataBase.endUserContract==undefined)
      {
        this.myskip('pending-tab');
        this.message.create("error","请上传最终用户合同") 
        return
      }
      if((this.dataBase.projectAnalysisTable==''||this.dataBase.projectAnalysisTable==null||this.dataBase.projectAnalysisTable==undefined)&&this.dataBase.businessModel=='DISTRIBUTOR')
      {
        this.myskip('pending-tab');
        this.message.create("error","请上传项目分析表") 
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
      res.checked=false;
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
    
    this.verifiData = [];
    this.ServesiceService.bookEventer.emit();
    const cheakItem = [...this.verifiData];
    const cheakbox = cheakItem.every((vals) => vals === true); // 字段是否填写完成
    this.isVisibleWinCheck = false;
    const url = '/act/preparation/saveAndSubmit';
    this.dataBase.status = 1;
    // if (!cheakbox) {
    //   this.message.create('warning','产品信息有必填项没有填写！')
    //   return;
    // }
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

    //this.dataBase.dealFormId = this.dataBase.dealFormID;
    // delete this.dataBase.dealFormID;
    const dealFormId = this.dataBase.dealFormId;
    if (dealFormId == undefined || dealFormId == null && dealFormId == "") {
      this.message.create('error', "请填写dealFormId");
      return;
    }
    //let bmcIsDisbleArr=[]; //所有进单位磁共震文件是否必填的验证
    // let igtIsDisble=[];   //所有进单位塔吊文件是否必填的验证
    // let host;      
    this.dataBase.productList.map((res, index) => {
      res.productList.map(vals => {
        vals.modalityBmcs = vals.modalityBmc
        delete vals.children;
        delete vals.marketBundle;
      });
    }); 
   // this.dataBase.contractEndDate =formatDatesNow(this.dataBase.contractEndDate);
   // this.dataBase.poolEndDate=formatDatesNow(this.dataBase.contractEndDate); 
        
    this.load = true;
    this.http.post(url, this.dataBase).subscribe((rest => {
      if (rest.code === '0000') {
        this.message.create('success', `${rest.msg}`);
        this.load = false;
        this.router.navigate(['/igt/my-task']);
      } else {
        this.message.create('error', `${rest.msg}`);
        this.load = false;
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "服务器异常！");
    }));
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

}
