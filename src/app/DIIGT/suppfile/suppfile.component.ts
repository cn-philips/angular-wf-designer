import { Component, OnInit } from '@angular/core';
import {decodeString, formatDatesNowMth, formatDatesNow,standardTime} from '../../../assets/js/tools';
import {HttpService} from '../../services';
import {NzMessageService} from 'ng-zorro-antd';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-suppfile',
  templateUrl: './suppfile.component.html',
  styleUrls: ['./suppfile.component.scss']
})
export class SuppfileComponent implements OnInit {
  public defect=[
    {name:"招标文件",show:false},
    {name:"投标文件",show:false},
    {name:"最终用户合同",show:false},
    {name:"项目分析表",show:false},
  ]
  public param:any={
    mainId:"",
    status:"0",
    specialSupportCompleted:""
  };
  disa:any=false //是否禁用子菜单
  mergeData:any={} //合并后的数据
  activedId: any = "pending-tab";
  signingData: any = {
    fileFileList: [] //上传的文件
  }
  public dataBase: any = {
    productList: [], // 产品列表
    detail: {
      id: '',
      flag: '',
      status: '',
    },
  };
  infor: any = {   //合同概要表数据
    productList: [], // 产品列表
    detail: {
      id: '',
      flag: '',
      status: 'examine',
    },
  };
  oitData:any={
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
    file: "",
    check: 0, //1同意 0拒绝
    isCancel:"0", //是否取消
    cancelTime:'', //取消时间
    supportFile:'', //支持文件
    deBook: "0",
    deBookDate: "",
    reBook: "0",
    reBookDate: "",
  };
  public osData: any = {};

  constructor(private http: HttpService,
              private message: NzMessageService,
              public activatedRouter: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    const ASYNS = async () => {

     const  detailData=await this.getDataDetail();
     const contractData=await this.getDataBase();
     const cpData=await this.getCpdata();
     const orderData:any=await this.getOrderSummary(contractData,cpData);
     this.mergeData=Object.assign(detailData,orderData,contractData);
     const getTemplates=await this.getTemplate();
     const getFormDetailsd= await this.getFormDetails();
     await this.getBaseOrder();
     const getUsers=this.getUser();
    }
    ASYNS()

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
          this.dataBase.poolEndDate=standardTime(param.poolEndDate);//外贸易公司日期
          this.dataBase.contractEndDate=standardTime(param.contractEndDate);//经销商日期
          this.dataBase.entryMode = param.entryMode //进单模式
          this.dataBase.team=param.team;//team
          this.dataBase.region = param.region;//大区域
          this.dataBase.smallArea = param.smallArea;//小区域
          this.dataBase.endUserId=param.endUserId; //最终用户id
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
          this.dataBase.dealFormId =param.dealFormId;//dealFromid
          this.dataBase.contractDdpStatus = param.contractDdpStatus; //合同买方的ddpstatus
          this.dataBase.foreignTradeCompany = param.foreignTradeCompany; //外贸易公司
          this.dataBase.invoiceInformation = param.invoiceInformation;   //币制
          this.dataBase.bidWinningPrice=res.data.bidWinningPrice?res.data.bidWinningPrice:"";//中标价格
          this.dataBase.relationshipLink = params.businessOpportunityHierarchyLink // 商机层级关系链接
          this.dataBase.priceRange = params.samplingInspection // 是否抽样审核
          this.dataBase.sofonFile = params.sofonFile;
          this.dataBase.countryOrigin = params.countryOrigin // 原产地中文
          this.dataBase.countryOriginEn = params.countryOriginEn?params.countryOriginEn:""; // 原产地英文

          this.dataBase.medicalDeviceName=params.medicalDeviceName;//医疗器械名称
          this.dataBase.nmpaRegistrationExpried=params.nmpaRegistrationExpried;//NMPA证有效期截止日期
          this.dataBase.financialProgramme=params.financialProgramme; //金融方案价格
          this.dataBase.financialProgrammeTxt=params.financialProgrammeTxt; //金融方案文本框的值
          this.dataBase.tradeInCost=params.tradeInCost;//tradeIn总额
          this.dataBase.financialProgrammeCost=params.financialProgrammeCost; //金融方案总金额
          this.dataBase.agreementNo=param.agreementNo; //经销商协议号;
          this.dataBase.dealerCode=param.dealerCode; //经销商code;
          this.dataBase.centralized=param.centralized; //集采
          this.dataBase.actualSales=param.actualSales; //实际销售人
          // this.dataBase.finalSofonQuotation = params.sofonNo //finalSofonQuotation
          this.dataBase.tradeList = params.cosOppTradeIns!=null&&params.cosOppTradeIns!=""&&params.cosOppTradeIns.length>0?params.cosOppTradeIns:[{name:"",costs1:""}]; // tradeIn
          this.dataBase.warrantyList =params.cosOppExtendedWarranties!=null&&params.cosOppExtendedWarranties!=""&&params.cosOppExtendedWarranties.length>0?params.cosOppExtendedWarranties:[] // 延长保修
          this.dataBase.otherList=params.otherList!=null&&params.otherList!=""&&params.otherList.length>0?params.otherList:[] //其他预留
          this.dataBase.productList = params.cosOppThirdParties!=null&&params.cosOppThirdParties!=""&&params.cosOppThirdParties.length>0?params.cosOppThirdParties:[{thirdPartyName:"",total:""}] // 第三方
          this.dataBase.application = params.applications!=null&&params.applications!=""&&params.applications.length>0?params.applications:[{productName:"",localCtp1:""}];
          this.dataBase.applicationPrice = params.applicationPrice;
          this.dataBase.applications=params.applications!=null&&params.applications!=""&&params.applications.length>0?params.applications:[{productName:"",localCtp1:""}]

          this.dataBase.isPrebookApply=param.isPrebookApply!=null?param.isPrebookApply.toString():"0"; //是否关联prebook
          this.dataBase.contractCancelReferenceId= param.contractCancelReferenceId;
          this.dataBase.contractCancelMainId= param.contractCancelMainId;
          this.dataBase.prebookReferenceId=param.prebookReferenceId; //prebookid
          this.dataBase.prebookProductId=param.prebookProductId; //prebookProductId
          this.dataBase.prebookMainId=param.prebookMainId; //prebookMainId
          this.infor.isPrebookApply=this.infor.isPrebookApply.toString();
          this.dataBase.isPrebookApply=this.infor.isPrebookApply;

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
          this.oitData.deBook = this.oitData.deBook ? this.oitData.deBook : "0";
          this.oitData.reBook = this.oitData.reBook ? this.oitData.reBook : "0";
          this.oitData.isCancel=this.oitData.isCancel?this.oitData.isCancel:"0";
          this.oitData.expertList=this.oitData.expertList?this.oitData.expertList:[];
          !this.oitData.logisticsTime&&(this.oitData.logisticsTime=formatDatesNowMth(new Date()))
          this.oitData.specialApprovalSupporting=this.oitData.specialApprovalSupporting!=null?this.oitData.specialApprovalSupporting:"0";
          this.oitData.specialSupportCompleted=this.oitData.specialSupportCompleted!=null?this.oitData.specialSupportCompleted:"0";
          reslove(res.data)
          let specialApprovalDocumentsName=this.oitData.supportFileMissingFileName;
         if(specialApprovalDocumentsName!=null&&specialApprovalDocumentsName!=undefined&&specialApprovalDocumentsName!="")
         {
          specialApprovalDocumentsName=specialApprovalDocumentsName.split(",");
          this.defect.map(vals=>{

            specialApprovalDocumentsName.map(item=>{
                vals.name==item&&(vals.show=true);
            })
          })
         }
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
            if(res.code=="0000")
            {
              this.oitData.oMlist=res.data;
              reslove(res.data)
            }
            else
            {
              this.message.create("error",res.msg)
            }
          }),(error=>{
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


  save (params) {
    this.param.status=params;
    this.param.specialSupportCompleted=this.oitData.specialSupportCompleted;
    const processInstanceTaskId=this.activatedRouter.queryParams['_value'].processInstanceTaskId;
    if(params==1)
    {

      if((this.infor.tenderDocuments==""||this.infor.tenderDocuments==undefined||this.infor.tenderDocuments==null)&&this.infor.tenderNo!='其他类型')
      {
        this.message.create("error","请上传招标文件");
         return;
      }
      if((this.infor.biddingDocuments==""||this.infor.biddingDocuments==undefined||this.infor.biddingDocuments==null)&&this.infor.tenderNo!='其他类型')
      {
        this.message.create("error","请上传投标文件");
         return;
      }
      if((this.infor.endUserContract==""||this.infor.endUserContract==undefined||this.infor.endUserContract==null)&&this.infor.businessModel=='DISTRIBUTOR')
      {
        this.message.create("error","请上传最终用户合同");
         return;
      }
      if((this.infor.projectAnalysisTable==""||this.infor.projectAnalysisTable==undefined||this.infor.projectAnalysisTable==null)&&this.infor.businessModel=='DISTRIBUTOR')
      {
        this.message.create("error","请上传项目分析表");
         return;
      }
      if(this.oitData.specialSupportCompleted==0)
      {
        this.message.create("error","特批支持文件已补齐请选择是")
        return;
      }
    }
    const url='/act/preparation/supplementaryFileUpload';
    this.param.mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    this.param.processInstanceTaskId=processInstanceTaskId;
    this.http.post(url, Object.assign(this.infor,this.param)).subscribe((res => {
        if (res.code === '0000') {
          this.message.create('success', `${res.msg}`);
          if (params === '1' || params === 1 ) {
            this.router.navigate(['/igt/my-task']);
          }
        }
      }),(error=>{
        this.message.create("error","请求异常!");
      }));
    }



  toReturn() {
    window.history.back();
  }

  cancelFn() {
    this.router.navigate(['/igt/my-task']);
  }
}
