import { Component, OnInit,ViewChild} from '@angular/core';
import { decodeString, formatDatesNow,NumberThousandth} from '../../../assets/js/tools';
import { HttpService } from '../../services';
import { NzMessageService } from 'ng-zorro-antd';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-consign',
  templateUrl: './consign.component.html',
  styleUrls: ['./consign.component.scss']
})
export class ConsignComponent implements OnInit {

  // tab标签
  activedId: any = 'tab3';
  @ViewChild('childbase') public childbase;
  param = {
    mainId: '',
    remark: '',
    file: '',
    check: ''
  };
  public load:any=false;
  public mergeData:any={};
  public fileFileList: any = []; //文件列表
  public productConfFileList: any = []; //
  public file2FileList = []; //
  public file3FileList = []; //
  public params = {
    mainId: '',
    remark: '',
    file: '',
    file2: '',
    file3: '',
    check: '',
    attachmentIds: [],
    salesAgreementNo: '', // 买卖协议号
    importAgreementNo: '', // 进口协议号
    purchaseOrderNumber: '', // 采购订单号
    solution: '', // 是否含有solution
    productConf: '', // 产品配置
    productConfFile: '', // 产品配置文件
    invoiceMailingInformation: '', // 发票邮寄信息
    portShipment: '', // 发货港
    typeShipping: '', // 运输方式
    portDestination: '', // 目的港
    contractDate: null, // 合同确认日期
    isContract: '', // 正式合同已上传
    contractFile: '', // 合同文件
    contractFileNames:"",//
    priceTerms: '', // 价格术语
    tmpList: [], //合同模版
  };
  public dataBase: any = {
    detail: {
      id: '',
      flag: '',
      status: '',
    },
  }
  public signingData: any = {
    productList: [], // 产品列表
    detail: {
      id: '',
      flag: '',
      status: '',
    },
    salesAgreementNo: '', // 买卖协议号
    importAgreementNo: '', // 进口协议号
    purchaseOrderNumber: '', // 采购订单号
    solution: '', // 是否含有solution
    productConf: '', // 产品配置
    productConfFile: '', // 产品配置文件
    invoiceMailingInformation: '', // 发票邮寄信息
    portShipment: '', // 发货港
    typeShipping: '', // 运输方式
    portDestination: '', // 目的港
    contractDate: null, // 合同确认日期
    isContract: '0', // 正式合同已上传
    contractFile: '', // 合同文件
    priceTerms: '', // 价格术语
    fileFileList: [], //文件列表
    tmpList: [],//合同列表
  };

  public osData: any = {};

  constructor(private http: HttpService,
    private message: NzMessageService,
    public activatedRouter: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    // 获取mainId       
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    this.dataBase.detail.flag = this.activatedRouter.queryParams['_value'].flag;
    const parm = {
      // mainId: mainId
    };


    const ASYNS = async () => { 
      var contractData,orderData,signingData,cpData={};
      this.load=true;
      contractData= await this.getContract();
      cpData=await this.getCpdata();
      orderData= await this.getOrderSummary(contractData,cpData);      
      signingData= await this.getDataDetail(); 
      //await this.getBase();
      orderData.distributor=orderData.agent;    
      this.mergeData=Object.assign(contractData,orderData,signingData);       
      console.log(this.dataBase)
      await this.getTemplate();
      await this.getBaseOrder();
     
    }
    ASYNS();
  }
  //合并ordersummary对像
  public getOrderSummary(param,params) {
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    // 获取orderSummary数据
    const url2 = '/act/preparation/queryOrderSummary?mainId=' + mainId;
    return new Promise((resolve, reject) => {
      this.http.get(url2).subscribe((rest => {
        // console.log('ordersum');
        // console.log(rest);        
        if (rest.data) {
          this.osData = rest.data;
          this.osData.entryMode=param.entryMode;
          this.osData.entryMode=param.entryMode //进单模式
          this.osData.region = param.region;//区域
          this.osData.businessModel = param.businessModel; //业务模式
          this.osData.bidWinningNotice = param.bidWinningNotice;//中标通知书
          this.osData.distributor = param.tenderingCompany; //投标公司
          this.osData.endUserContract = param.contractBuyer;//合同买方
          this.osData.ddpStatus = param.ddpStatus //经销商的ddpStatus
          this.osData.endUser = param.endUser; //最终用户
          this.osData.agent = param.distributor//经销商
          this.osData.hospitalNature = param.hospitalNature //医院性质
          this.osData.productModel = param.productModel; //产品型号
          this.osData.nmpaName = param.nmpaName //nmpaName
          this.osData.contractPrice = param.contractPrice //合同价格
          this.osData.paymentProvision = param.paymentProvision //付款条款
          this.osData.referenceId = param.referenceId; //添加referenceId
          this.osData.contractDdpStatus = param.contractDdpStatus; //合同买方的ddpstatus
          this.osData.foreignTradeCompany = param.foreignTradeCompany; //外贸易公司
          this.osData.invoiceInformation = param.invoiceInformation;   //币制
          this.osData.bidWinningPrice=rest.data.bidWinningPrice?rest.data.bidWinningPrice:"";//中标价格
          this.osData.relationshipLink = params.businessOpportunityHierarchyLink // 商机层级关系链接
          this.osData.priceRange = params.samplingInspection // 是否抽样审核
          this.osData.sofonFile = params.sofonFile;
          this.osData.countryOrigin = params.countryOrigin // 原产地
          this.osData.finalSofonQuotation = params.sofonNo //finalSofonQuotation
          this.osData.tradeList =params.cosOppTradeIns!=null&&params.cosOppTradeIns!=""&&params.cosOppTradeIns.length>0?params.cosOppTradeIns:[{name:"",costs1:""}]; // tradeIn
          this.osData.warrantyList=params.cosOppExtendedWarranties!=null&&params.cosOppExtendedWarranties!=""&&params.cosOppExtendedWarranties.length>0?params.cosOppExtendedWarranties:[{posIdName:"",posLocalCtp:""}] // 延长保修
          this.osData.productList = params.cosOppThirdParties!=null&&params.cosOppThirdParties!=""&&params.cosOppThirdParties.length>0?params.cosOppThirdParties:[{thirdPartyName:"",total:""}] // 第三方     
          this.osData.application = params.applications!=null&&params.applications!=""&&params.applications.length>0?params.applications:[{productName:"",localCtp1:""}]
          this.osData.applicationPrice = params.applicationPrice;
          this.osData.applications=params.applications!=null&&params.applications!=""&&params.applications.length>0?params.applications:[{productName:"",localCtp1:""}];     
          if (this.osData.warrantyList && this.osData.warrantyList.length > 0) {
            this.osData.warrantyList.map(res => {
              res.name = res.posIdName;
              res.price = res.posLocalCtp;
              delete res.posIdName;
              delete res.posLocalCtp;
            });
          }
          if (this.osData.productList && this.osData.productList.length > 0) {
            this.osData.productList.map(res => {
              res.name = res.thirdPartyName;
              res.price = res.total?res.total:"";
              delete res.thirdPartyName;
              delete res.total;
            })
          }
          resolve(this.osData)
        }
      }), (error) => {
        this.message.create("error", "请求异常!")
      });
    })
  }
  //合同概要表查询
  public getContract() {
    return new Promise((resolve, reject) => {
      const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
      const url = '/act/preparation/queryContractSummary' + '?mainId=' + mainId;
      // 获取基础数据
      this.http.post(url).subscribe((rest => {        
        if (rest.code === '0000') {
          if (rest.data) {
            //this.dataBase = Object.assign(this.dataBase, rest.data);
            this.dataBase = JSON.parse(JSON.stringify(rest.data)) ;
            this.dataBase.detail={
                id: '',
                flag: '',
                status: '',
              }
            this.dataBase.detail.flag=this.activatedRouter.queryParams['_value'].flag;
            this.dataBase.detail.status=this.activatedRouter.queryParams['_value'].status;
            this.dataBase.sameFlag=this.dataBase.sameFlag.toString();
            resolve(rest.data)
          } else {
            this.message.create('error', '获取数据失败');
          }
        }
      }), (error) => {
        this.message.create("error", "请求异常!");
      });

    })
  }
//查询order suammry基础数据
  getBase() //查询基础数据
  {
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    let url = `/act/preparation/queryInfoForOrderSummary?mainId=${mainId}`;
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe(res => {        
        this.osData.specialApprovalDocuments=res.data.supportFileMissing; //特批文件后补
        this.osData.specialApprovalDocumentsName=res.data.supportFileMissingFileName; //特批文件名称
      })
    })
  }
  //查询order summary的
  getBaseOrder()
  {
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    let url = `/act/preparation/queryInfoForOrderSummary?mainId=${mainId}`;
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe(res => {         
        this.osData.isUsdOrRmb=(res.data.isUsdOrRmb!=null&&res.data.isUsdOrRmb!=""&&res.data.isUsdOrRmb!=undefined)?res.data.isUsdOrRmb:""; 
      })
    })
  }
  //合同模版
  public getTemplate() {      
    const url = `/act/ecom/bidding/getTemplate`;  
    //业务模式DISTRIBUTOR非直投币制等于usd的时候传this.dataBase.sameFlag; 
      
    let additionalCondition=this.dataBase.businessModel=='DISTRIBUTOR'&&this.dataBase.invoiceInformation=='USD'?this.dataBase.sameFlag:null;
    const param = {
      dealModel: this.dataBase.businessModel,
      currencySystem: this.dataBase.invoiceInformation,
      additionalCondition:additionalCondition,
    }
    // const param={
    //   dealModel:"",
    //   currencySystem:"",
    // }
    return new Promise((resolve, reject) => { 
        this.http.post(url, param).subscribe((res => {
          if (res.code == '0000') {

            this.signingData.tmpList = res.data;
            resolve(this.signingData.tmpList)
          }
          else {
            this.message.create("error", res.msg)
          }
        }),
          (error => {
            this.message.create("error", "请求异常!")
          }))
    })
  }
  //查询待合同签署页
  public getDataDetail() {
    
    const url = `/act/preparation/queryContractSigned?mainId=${decodeString(this.activatedRouter.queryParams['_value'].id)}`;
    return new Promise((resolve, reject) => {
    this.http.get(url).subscribe((res => {
          this.load=false;
          if (res.code === '0000') {       
            if (res.data) {
              this.signingData = res.data;
              //this.signingData.fileFileList = [];
              //this.signingData.signingData = [];
              this.signingData.isContract=res.data.isContract!=null?res.data.isContract:'0';       
              // const contractSignedAttachmentDTOList = this.signingData.contractSignedAttachmentDTOList;
              // contractSignedAttachmentDTOList.map(vals => {
              //   let obj = {
              //     uid: '', name: '', fileId: ''
              //   };
              //   obj.uid = vals.attachmentId;
              //   obj.name = vals.attachmentName;
              //   obj.fileId = vals.attachmentId;
              //   this.signingData.fileFileList = this.signingData.fileFileList.concat(obj);
              // });
              resolve(this.signingData)
              if (res.data.productConfFile && res.data.productConfFile !== '' && res.data.productConfFile != null) {
                const obj = {
                  uid: res.data.productConfFile, name: res.data.productConfFile, fileId: res.data.productConfFile
                };
                this.productConfFileList = [];
                this.productConfFileList.push(obj);
              }

            }
            resolve({})
          }
        }),(error)=>{
          this.load=false;
        });
    })
  }
  //来自cp的
  getCpdata() 
  {

    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    let url = `/act/preparation/queryInfoForOrderSummaryFromCP?mainId=${mainId}`
    return new Promise((resolve, reject) => {
        this.http.get(url).subscribe(rest => {
          if(rest.data)
          {
            resolve(rest.data)
          }
        })
      })
  }
  //上一步下一步
  public myskip(val): void {    
    this.activedId = val;
  }

  // 退回、保存、提交
  public save(e: any) {
    // 校验暂时注释
    // for (const key in this.validateForm.controls) {
    //   this.validateForm.controls[key].markAsDirty();
    //   this.validateForm.controls[key].updateValueAndValidity();
    // }
    // if (e === 1 && !this.ckFile()) {
    //   this.message.create('error', `请上传文件!`);
    //   return;
    // }
    //this.childbase.cheakData(e);     
    this.params.check = e;
    if (e == 0) {
      this.childbase.cheakData(e);
      const cheak = this.childbase.checkFormData();
      if (!cheak) {        
        this.myskip('tab3');
        this.message.create("error","请填写退回理由!");
        return;
      }
    }
    if (e == 1) {
      this.childbase.cheakData(e);
      const cheak = this.childbase.checkFormData();
      if (!cheak) {        
        this.myskip('tab3');
        this.message.create("error","有必填项没有填写!");
        return;
      }
    }
    this.params.mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    this.params.remark = this.signingData.remark;
    this.params.salesAgreementNo = this.signingData.salesAgreementNo;
    this.params.importAgreementNo = this.signingData.importAgreementNo;
    this.params.purchaseOrderNumber = this.signingData.purchaseOrderNumber;
    this.params.solution = this.signingData.solution;
    this.params.productConf = this.signingData.productConf;
    this.params.productConfFile = this.signingData.productConfFile;
    this.params.invoiceMailingInformation = this.signingData.invoiceMailingInformation;
    this.params.portShipment = this.signingData.portShipment;
    this.params.typeShipping = this.signingData.typeShipping;
    this.params.portDestination = this.signingData.portDestination;
    if (this.signingData.tmpList.length > 0) {
      this.signingData.tmpList.map(res => {
        let obj = {
          tempaleId: res.id,
        }
        this.params.tmpList.push(obj)
      })
    }

    if (this.signingData.contractDate !== null && this.signingData.contractDate !== undefined && this.signingData.contractDate !== '') {
      this.signingData.contractDate = formatDatesNow(this.signingData.contractDate);
    }
    this.params.contractDate = this.signingData.contractDate;
    this.params.isContract = this.signingData.isContract;
    this.params.priceTerms = this.signingData.priceTerms; 
    this.params.contractFile=this.signingData.contractFile;   
    //const fileFileList = this.signingData.fileFileList;
    // if(this.params.check=='1')
    // {
    //   if(fileFileList.length<1)
    //   {
    //     this.message.create("error","请上传合同文件");
    //     return;
    //   }
    // }
    // this.params.attachmentIds = [];
    // if (fileFileList.length > 0) {
    //   fileFileList.map(res => {
    //     this.params.attachmentIds.push(res.fileId);
    //   });
    // }
    // console.log(this.params); 
    this.load=true;
    const url = '/act/preparation/contractSigned';    
    this.http.post(url, this.params).subscribe((res => {
      if (res.code === '0000') {
        this.load=false;
        this.message.create('success', '操作成功');
        this.router.navigate(['/igt/my-task']);
      }
      else
      {
        this.message.create("error",`${res.msg}`);
      }
    }),(error)=>{
      this.message.create("error","请求异常!")
    });
  }
}
