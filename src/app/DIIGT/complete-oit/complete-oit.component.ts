import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService, FileService } from '../../services';
import { decodeString, formatDatesNowMth, formatDatesNow } from '../../../assets/js/tools';
import { Router, ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-complete-oit',
  templateUrl: './complete-oit.component.html',
  styleUrls: ['./complete-oit.component.scss']
})
export class CompleteOitComponent implements OnInit {
  @ViewChild('childbase') public childbase;
  activedId: any = "pending-tab";
  thirdOff: any = false; //第三方自采核查是否显示;
  realTimeOff: any = false; //realTimeoff是否显示;
  disa:any=false //是否禁用子菜单
  mergeData:any={} //合并后的数据
  flag: any;
  load:any=false; //加载
  infor: any = {   //合同概要表数据
    productList: [], // 产品列表
    detail: {
      id: '',
      flag: '',
      status: 'examine',
    },
  };
  signingData: any = {
    fileFileList: [] //上传的文件
  } //合同签署页
  dataBase: any = {   //orderSummary数据
  }
  oitData: any = {
    mainId: "",
    remark: "", //备注
    supportFileMissingFileName: "",//特批支持文件名称
    specialApprovalSupporting: "0",//需要后补特批支持文件
    specialSupportCompleted: "0",//特批支持文件已补齐
    productVerification: "0",//是否经销商第三方产品核查
    //specialSupportName: "",//特批支持文件名称
    logistician: "", //物流人员id
    oMlist:[],//下拉列表
    expertList:[], //选中的人员
    name:"",//物流人员姓名
    email:"",//物流人员邮件
    logisticsTime:formatDatesNowMth(new Date),//日期选择
    file: "",//进出口凭证
    other:"", //其它
    exportControl:"",//进出口管制
    check: 0, //1同意 0拒绝
  };
  isDisable:any=false;
  constructor(
    private http: HttpService,
    private router: Router,
    public activatedRouter: ActivatedRoute,
    private message: NzMessageService,
  ) { }
  public ngOnInit() {      
    this.init();
    const ASYNS = async () => { 
     this.load=true;    
     const  detailData=await this.getDataDetail();       
     const contractData=await this.getDataBase();
     const cpData=await this.getCpdata();
     const orderData:any=await this.getOrderSummary(contractData,cpData);
     await this.getBaseOrder();
     orderData.distributor=orderData.agent;   
     this.mergeData=Object.assign(detailData,orderData,contractData);
     const getTemplates=await this.getTemplate();
     const getFormDetailsd= await this.getFormDetails();      
     const getUsers=this.getUser();
    }
    ASYNS()
  }
  init() {

    const param = this.activatedRouter.queryParams['_value'].param;
    this.flag = this.activatedRouter.queryParams['_value'].flag;
    switch (param) {
      case "third":
        this.thirdOff = true;
        this.disa=true
        break;
      case "realTime":
        this.realTimeOff = true; 
        this.disa=true;       
        break;
      default:
        this.thirdOff = false;
        this.realTimeOff = false;
        this.disa=false;

    }

  }
  getDataBase() {   //来至于合同概要表信息
    // 获取mainid
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const url = `/act/preparation/queryContractSummary?mainId=${mainId}`;
    // 获取基础信息数据
    return new Promise((resolve, reject) => {
      this.http.post(url, {}).subscribe(res => {
        if (res.data) {
          this.infor = res.data;
          this.infor.sameFlag=this.infor.sameFlag.toString();
          this.infor.detail = {
            id: '',
            flag: '',
            status: '',
          }
          this.infor.detail.flag = this.activatedRouter.queryParams['_value'].flag;
          this.infor.detail.status=this.activatedRouter.queryParams['_value'].status;
          this.infor.referenceId=res.data.referenceId;
          this.oitData.productVerification = this.dataBase.dealerAudit;
          resolve(res.data)
          //this.oitData.productVerification = this.dataBase.dealerAudit ? '1' : '0';
        } else {
          this.message.create('error', '获取数据失败');
        }
      });
    })
  }
  getOrderSummary(param,params) {
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    let url = `/act/preparation/queryOrderSummary?mainId=${mainId}`;
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe(res => {
        if (res.data) {
          this.dataBase = res.data
          this.dataBase.customerRequestLetter = formatDatesNow(this.dataBase.customerRequestLetter);
          this.dataBase.contractConfirmationDate = formatDatesNow(this.dataBase.contractConfirmationDate);
          resolve(res.data);
          this.dataBase.entryMode = param.entryMode //进单模式
          this.dataBase.region = param.region;//区域
          this.dataBase.businessModel = param.businessModel; //业务模式
          this.dataBase.bidWinningNotice = param.bidWinningNotice;//中标通知书
          this.dataBase.distributor = param.tenderingCompany; //投标公司
          this.dataBase.endUserContract = param.contractBuyer;//合同买方
          this.dataBase.ddpStatus = param.ddpStatus //经销商的ddpStatus
          this.dataBase.endUser = param.endUser; //最终用户
          this.dataBase.agent = param.distributor//经销商
          this.dataBase.hospitalNature = param.hospitalNature //医院性质
          this.dataBase.productModel = param.productModel; //产品型号
          this.dataBase.nmpaName = param.nmpaName //nmpaName
          this.dataBase.contractPrice = param.contractPrice //合同价格
          this.dataBase.paymentProvision = param.paymentProvision //付款条款
          this.dataBase.referenceId = param.referenceId; //添加referenceId
          this.dataBase.contractDdpStatus = param.contractDdpStatus; //合同买方的ddpstatus
          this.dataBase.foreignTradeCompany = param.foreignTradeCompany; //外贸易公司
          this.dataBase.invoiceInformation = param.invoiceInformation;   //币制
          this.dataBase.bidWinningPrice=res.data.bidWinningPrice?res.data.bidWinningPrice:"";//中标价格
          this.dataBase.relationshipLink = params.businessOpportunityHierarchyLink // 商机层级关系链接
          this.dataBase.priceRange = params.samplingInspection // 是否抽样审核
          this.dataBase.sofonFile = params.sofonFile;
          this.dataBase.countryOrigin = params.countryOrigin // 原产地
          this.dataBase.finalSofonQuotation = params.sofonNo //finalSofonQuotation
          this.dataBase.tradeList =params.cosOppTradeIns!=null&&params.cosOppTradeIns!=""&&params.cosOppTradeIns.length>0?params.cosOppTradeIns:[{name:"",costs1:""}]; // tradeIn
          this.dataBase.warrantyList = params.cosOppExtendedWarranties!=null&&params.cosOppExtendedWarranties!=""&&params.cosOppExtendedWarranties.length>0?params.cosOppExtendedWarranties:[{posIdName:"",posLocalCtp:""}] // 延长保修
          this.dataBase.productList = params.cosOppThirdParties!=null&&params.cosOppThirdParties!=""&&params.cosOppThirdParties.length>0?params.cosOppThirdParties:[{thirdPartyName:"",total:""}] // 第三方       
          this.dataBase.application = params.applications!=null&&params.applications!=""&&params.applications.length>0?params.applications:[{productName:"",localCtp1:""}];
          this.dataBase.applicationPrice = params.applicationPrice;
          this.dataBase.applications=params.applications!=null&&params.applications!=""&&params.applications.length>0?params.applications:[{productName:"",localCtp1:""}]      
          if (this.dataBase.warrantyList && this.dataBase.warrantyList.length > 0) {
            this.dataBase.warrantyList.map(res => {
              res.name = res.posIdName;
              res.price = res.posLocalCtp;
              delete res.posIdName;
              delete res.posLocalCtp;
            });
          }
          if (this.dataBase.productList && this.dataBase.productList.length > 0) {
            this.dataBase.productList.map(res => {
              res.name = res.thirdPartyName;
              res.price = res.total?res.total:"";
              delete res.thirdPartyName;
              delete res.total;
            })
          }
        }
        else {
          this.message.create('error', '获取数据失败');
        }
      })
    })
  }
  //来自cp的
  getCpdata() 
  {

    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    let url = `/act/preparation/queryInfoForOrderSummaryFromCP?mainId=${mainId}`
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe(rest => {
        if (rest.data) {
          resolve(rest.data)
        }
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
        this.dataBase.isUsdOrRmb=(res.data.isUsdOrRmb!=null&&res.data.isUsdOrRmb!=""&&res.data.isUsdOrRmb!=undefined)?res.data.isUsdOrRmb:"";  
        resolve(res);     
      })
    })
  }
  public myskip(val): void { //外部触发tab选项卡的事件
    this.activedId = val;
  }
  tabclick(val) //tab选项卡的点击事件
  {
    this.activedId = val.nextId;
  }
  public getFormDetails() {    
     
    return new Promise((reslove, reject) => {
      this.http.get(`/act/preparation/oitCheck?mainId=` + decodeString(this.activatedRouter.queryParams['_value'].id)).subscribe(res => {
      
        if (res.code === '0000') { 
          this.oitData = res.data;
          this.oitData.exportControl=this.oitData.exportControl?this.oitData.exportControl:"";
          this.oitData.other=this.oitData.other?this.oitData.other:"";
          this.oitData.expertList=this.oitData.expertList?this.oitData.expertList:[];
          !this.oitData.logisticsTime&&(this.oitData.logisticsTime=formatDatesNowMth(new Date()))
          this.oitData.specialApprovalSupporting=this.oitData.specialApprovalSupporting!=null?this.oitData.specialApprovalSupporting:"0";
          this.oitData.remark=this.oitData.remark!=null?this.oitData.remark:"";
          reslove(res.data)
        } else {
          this.message.create('error', res.msg);
        }
      });
    })

  }

    //获取人员下拉列表
    getUser()
    {
        
        let marinId = decodeString(this.activatedRouter.queryParams['_value'].id);
        let url=`/act/preparation/getOitExpert?mainId=${marinId}`;
        return new Promise((reslove, reject) => {
          this.http.get(url).subscribe((res=>{ 
            this.load=false;
            if(res.code=="0000")
            {
              this.oitData.oMlist=res.data;
              if(this.oitData.oMlist.length==1)
              {
                  this.oitData.logistician=this.oitData.oMlist[0].email;
              }              
              reslove(res.data)
            }
            else
            {
              this.message.create("error",res.msg)
            }
          }),(error=>{
            this.load=false;
            this.message.create("error","请求异常")
          }))
        })
    }
  //合同修改
  public getTemplate() {    
    const url = `/act/ecom/bidding/getTemplate`;       
    let additionalCondition=this.infor.businessModel=='DISTRIBUTOR'&&this.infor.invoiceInformation=='USD'?this.infor.sameFlag:null;
    const param = {
      dealModel: this.infor.businessModel,
      currencySystem: this.infor.invoiceInformation,
      additionalCondition:additionalCondition,
    }
    return new Promise((resolve, reject) => {
        this.http.post(url, param).subscribe((res => {
          if (res.code == '0000') {

            this.signingData.tmpList = res.data;
          }
          else {
            this.message.create("error", res.msg)
          }
          resolve(this.signingData);
        }),
          (error => {
            this.message.create("error", "请求异常!")
          }))
    })
  }
  //合同签署页
  public getDataDetail() {    
    const url = `/act/preparation/queryContractSigned?mainId=${decodeString(this.activatedRouter.queryParams['_value'].id)}`;
    return new Promise((resolve, reject) => {
        this.http.get(url).subscribe(res => {
          if (res.code === '0000') {
            if (res.data) {
              this.signingData = res.data;
              this.signingData.fileFileList=[];
              this.signingData.isContract=res.data.isContract!=null?res.data.isContract:'0'; 
              const { contractSignedAttachmentDTOList } = res.data;
              contractSignedAttachmentDTOList.map(vals => {
                let obj = {
                  uid: "", name: "", fileId: ""
                }
                obj.uid = vals.attachmentId;
                obj.name = vals.attachmentName;
                obj.fileId = vals.attachmentId;
                this.signingData.fileFileList = this.signingData.fileFileList.concat(obj);
              })
              resolve(this.signingData)
            }
          }
        });
    })
  }

  
  submit(number: number, flag?: any) {
    this.oitData.check = number;
    this.oitData.mainId = decodeString(this.activatedRouter.queryParams['_value'].id);        
    this.oitData.logisticsTime&&(this.oitData.logisticsTime = formatDatesNowMth(this.oitData.logisticsTime))    
    let url = "/act/preparation/oitUpload";
    if (number == 0) {
      this.childbase.cheakData(number);
      const cheak = this.childbase.checkFormData();
      if (!cheak) {
        this.message.create("error","请填写退回理由");
        this.myskip("complete-padd");
        return;
      }
    }
    if (number == 1) {
      this.childbase.cheakData(number);
      const cheak = this.childbase.checkFormData();
      if (!cheak) {
        this.myskip("complete-padd");
        return;
      }
      
      if (this.oitData.exportControl == "" || this.oitData.exportControl == null || this.oitData.exportControl == null) {
        this.myskip("complete-padd");
        this.message.create("error", "请上传出口管制文件");
        return;
      }
    }    
    //提交下拉人员
    if(this.oitData.logistician) 
    {
      let usrArr=this.oitData.oMlist.find(res=>this.oitData.logistician==res.email);
      let obj={
        name:usrArr.name,
        userId:usrArr.id,
        email:usrArr.email
      }
      this.oitData.expertList.push(obj);        
    } 
    this.load=true;   
    this.http.post(url, this.oitData).subscribe((res => {
      this.load=false;
      if (res.code == '0000') {
        this.message.create('success', `操作成功`);
        this.router.navigate(['/igt/my-task']);
      }
      else {
        this.message.create('error', res.msg);
      }
    }),(error=>{
      this.load=false;
      this.message.create("error","请求异常!");
    }));
  }


}
