import { Component, OnInit,Input,ChangeDetectorRef} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { HttpService } from '../../services';
import {NzMessageService, UploadFile} from 'ng-zorro-antd';
import {environment} from '../../../environments/environment';
import {codeString, decodeString} from '../../../assets/js/tools';
import { ServesiceService } from '../preOrder/servesice.service';
import {ActivatedRoute} from '@angular/router';
@Component({
  selector: 'app-inorder-in',
  templateUrl: './inorder-in.component.html',
  styleUrls: ['./inorder-in.component.scss']
})
export class InorderInComponent implements OnInit {

  constructor(private activatedRouter: ActivatedRoute, private fb: FormBuilder,private cd: ChangeDetectorRef,private http: HttpService,private message: NzMessageService, private ServesiceService: ServesiceService,) { }
  validateForm:FormGroup;
  public redFlagList:any;
  public redFlagListPool:any;
  public foreignTradeOffPrebook:any=false;
  public distributorOffPrebook:any=false;
  public distributorOff:any=false;
  public foreignTradeOff:any=false; //外贸公司是否在iepool
  mainid_winList: any = [];
  public financialList: any = []; //金融方案下拉列表
  public financiaWidth: any = "14";
  mainId: any = '';
  public businessModelList = []; //业务模式的下拉框
  public entryModeList = []; //进单模式列表
  public style: any = { width: '100%' };//控制日期控件样式
  public disa:any=false;//
  public dealList:any=[];//经销商协议号列表
  public isAgres:any=false; //经销商协议号弹窗口控制
  public dealshow:any={tablehead:[{name:"授权地区",width:"300px"},{name:"授权产品",width:"300px"}],data:[]};
  public contractCancelList=[]; //原合同概要表列表
  @Input() dataBase:any={

  };


  //合同概要表ID列表
 public getContractCancel()
 {
  const existsChange=!this.disa;
   let url=`/act/preparation/getContractCancel?existsChange=${existsChange}`;
   this.http.get(url).subscribe(rest => {
      this.contractCancelList=rest.data;
    })
 }
 //跳转到合同概要表
public gotoWinIncon(item)
{
  window.open(location.origin + environment.base_href + '/#/' + 'inconmodif?id=' + codeString(item) + '&flag=1');
}
 //合同概要表选择
 public changeContract(event)
 {
  const select=this.contractCancelList.find(val=>val.contractCancelReferenceId==event)
  if(select)
  {
    this.dataBase.contractCancelMainId=select.contractCancelMainId;
  }
 }
  ngOnInit() {
    this.mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const state=this.activatedRouter.queryParams['_value'].state;
    this.validateForm = this.fb.group({
      selectedDistributor:[],
      selectedDistributors:[],
      name:[],
      age:[],
    })
    this.getBusinessModelList();
    this.getEntryModeList();
    this.getfinancialList();
    this.paymentMethod();
    this.getContractCancel();

    this.disa=state=='DTXHT'?false:true
   // this.getWinUrl();
  }
  //跳转到prebook链接
  public gotoWin(item) {
    console.log(location.origin + environment.base_href + '/#/' + 'prebookso?id=' + codeString(item) + '&flag=1');
    window.open(location.origin + environment.base_href + '/#/' + 'prebookso?id=' + codeString(item) + '&flag=1&status=prebook_end');
  }
  //经销用户列表
  distributorLoad(val) {
    let  params:any={
      pageNo: 1,
      pageSize: 5,
      dealerName:val, //经销商名称
     }
    return new Promise((resolve, reject) => {
      this.http.post(`/act/preparation/getDealersOnlyWithRegFlag`,params).subscribe((rest => {
        if (rest.code === '0000') {
          let select=rest.data.rows;
          this.distributorOff=select.length>0?false:true;
          if(select.length>0)
          {
            this.redFlagList=select[0].reminderMessage!=null?select[0].reminderMessage:"";
          }
          resolve(rest.data)
        }
      }), (error => {
        this.message.create("error", "请求异常")
      }));
   })
  }
  public getDistributorList() {
    // 进单准备表-选择经销商
    this.http.get(`/act/preparation/chooseDistributor`).subscribe((rest => {
      if (rest.code === '0000') {

        let distributorList = rest.data;
         let select=distributorList.find(vals=>vals.dealerName==this.dataBase.agent);
         if(select&&select.reminderMessage)
         {
           this.redFlagList=select.reminderMessage;
         }
         else{
          this.redFlagList="";
         }
      } else {
        // this.message.create('error', `${rest.msg}`);
      }
    }), (error => {
      this.message.create("error", "请求异常")
    }));
  }
  public getPoolList() {
    // 进单准备表-IE Pool选择
    this.http.get(`/act/preparation/chooseIePool`).subscribe((rest => {
      if (rest.code === '0000') {
        let poolList = rest.data;
        if (this.dataBase.invoiceInformation == 'USD') {
          const foreignTradeCompany = this.dataBase.foreignTradeCompany ? this.dataBase.foreignTradeCompany.replace(/\s+/g, "") : "";
          const distributors = this.dataBase.distributor ? this.dataBase.distributor.replace(/\s+/g, "") : "";
          let select= poolList.find(vals=>vals.corporateName.replace(/\s+/g, "")==foreignTradeCompany);
          if (this.dataBase.foreignTradeCompany) {
            this.foreignTradeOff = foreignTradeCompany != distributors ? (select ? false : true) : false;
          }
          else {
            this.foreignTradeOff = false;
          }
          if(select&&select.reminderMessage)
          {
            this.redFlagListPool=select.reminderMessage;
          }
          else{
            this.redFlagListPool="";
          }
        }
      } else {
        //this.message.create('error', `${rest.msg}`);
      }
    }), (error => {
      this.message.create("error", "请求异常")
    }));
  }

   //付款条款列表的组合模式
   public paymentMethod() {
    const params = {
      dictGroup: '',
    };
    let applyTypeoff=false;
    applyTypeoff=this.dataBase.entryMode=='BIDDING'||this.dataBase.entryMode=='STOCK'?true:false;
    let applyType = this.dataBase.entryMode;
    let clientType = this.dataBase.hospitalNature;
    let tenderPriceCurrencys = this.dataBase.invoiceInformation;
    let businessType = this.dataBase.businessModel;
    if (applyTypeoff && clientType && tenderPriceCurrencys && businessType) {
      if (applyType == "BIDDING" && businessType == "DIRECT" && tenderPriceCurrencys == "CNY" && clientType == "公立医院") {
        params.dictGroup = 'BDCG';
        // this.dataBase.paymentDescription="";
      }
      else if (applyType == 'BIDDING' && businessType == 'DIRECT' && tenderPriceCurrencys == 'USD' && clientType == '公立医院') {
        params.dictGroup = 'BDUG';
        // this.dataBase.paymentDescription="";
      }
      else if (applyType == 'BIDDING' && businessType == 'DIRECT' && tenderPriceCurrencys == 'CNY' && clientType == '民营医院') {
        params.dictGroup = 'BDCM';
        // this.dataBase.paymentDescription="";
      }
      else if (applyType == 'BIDDING' && businessType == 'DIRECT' && tenderPriceCurrencys == 'USD' && clientType == '民营医院') {
        params.dictGroup = 'BDUM';
        // this.dataBase.paymentDescription="";
      }
      else if (applyType == 'BIDDING' && businessType == 'DISTRIBUTOR' && tenderPriceCurrencys == 'USD' && clientType == '民营医院') {
        params.dictGroup = 'BDisUM';
        // this.dataBase.paymentDescription="";
      }
      else if (applyType == 'BIDDING' && businessType == 'DISTRIBUTOR' && tenderPriceCurrencys == 'CNY' && clientType == '民营医院') {
        params.dictGroup = 'BDisCM';
        // this.dataBase.paymentDescription="";
      }
      else if (applyType == 'BIDDING' && businessType == 'DISTRIBUTOR' && tenderPriceCurrencys == 'USD' && clientType == '公立医院') {
        params.dictGroup = 'BDisUG';
        // this.dataBase.paymentDescription="";
      }
      else if (applyType == 'BIDDING' && businessType == 'DISTRIBUTOR' && tenderPriceCurrencys == 'CNY' && clientType == '公立医院') {
        params.dictGroup = 'BDisCG';
        // this.dataBase.paymentDescription="";
      }
      else if(applyType == 'BIDDING' && businessType == 'DIRECT' && tenderPriceCurrencys == 'CNY' && clientType == '其他') {
        params.dictGroup = 'BDCQ';
        // this.dataBase.paymentDescription="";
      }
      else if (applyType == 'BIDDING' && businessType == 'DIRECT' && tenderPriceCurrencys == 'USD' && clientType == '其他') {
        params.dictGroup = 'BDUQ';
        // this.dataBase.paymentDescription="";
      }
      else if (applyType == 'BIDDING' && businessType == 'DISTRIBUTOR' && tenderPriceCurrencys == 'CNY' && clientType == '其他') {
        params.dictGroup = 'BDisCQ';
        // this.dataBase.paymentDescription="";
      }
      else if(applyType == 'BIDDING' && businessType == 'DISTRIBUTOR' && tenderPriceCurrencys == 'USD' && clientType == '其他') {
        params.dictGroup = 'BDisUQ';
        // this.dataBase.paymentDescription="";
      }
      else if(applyType == 'STOCK' && businessType == 'DISTRIBUTOR' && tenderPriceCurrencys == 'CNY') {
        params.dictGroup = 'SDisC';
        // this.dataBase.paymentDescription="";
      }
      else if(applyType == 'STOCK' && businessType == 'DISTRIBUTOR' && tenderPriceCurrencys == 'USD') {
        params.dictGroup = 'SDisU';
        // this.dataBase.paymentDescription="";
      }
    }

    if (params.dictGroup != '') {
      this.http.post(`/act/ecom/dictData/queryGroupDictData`, params).subscribe((rest => {
        if (rest.code === '0000') {
            this.dataBase.paymentList = rest.data;
            if(this.dataBase.paymentProvision=='0'||this.dataBase.paymentProvision=='1')
            {
              let selectId=this.dataBase.paymentList.find(val=>val.remark==this.dataBase.paymentProvision);
              this.dataBase.paymentProvision=selectId.dictId
            }
            let paymentmethod= this.dataBase.paymentList.find(val=>val.dictLabel==this.dataBase.paymentProvision);
            if(paymentmethod)
            {
              this.dataBase.paymentmethods=paymentmethod.dictId;
            }
            else{
            let select=this.dataBase.paymentList.find(val=>val.dictLabel=='其他');
            this.dataBase.paymentmethods=select.dictId;
            }
        }
      }),(error=>{
        this.message.create("error","请求异常");
      }));
    }
    else{
      this.dataBase.paymentList=null;

    }
  }

  ngOnChanges()
  {
    this.mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    if(this.dataBase)
    {

      this.dataBase.lateDayOff=false;
      this.dataBase.lateDateOff=false;
      this.dataBase.ddpStatus = this.isadopt(this.dataBase.contractEndDate,1);
      this.dataBase.contractDdpStatus = this.isadopt(this.dataBase.poolEndDate,2); //外贸易公司
     // this.getDistributorList();
     let distributor=this.dataBase.agent.replace(/\s+/g, "")
     this.distributorLoad(distributor)
     this.getPoolList();
     this.paymentMethod();
     if(this.dataBase.prebookMainId)
     {
      this.getBasePrebook(this.dataBase.prebookMainId);
     }


      if(this.dataBase.entryMode&&this.dataBase.entryMode == 'BIDDING')
      {
        this.getWinUrl();
      }
      this.dealerCodeList();
    }
  }
 //判断外贸易公司是否在prebook
  getBasePrebook(mainId) {
    const url = `/act/prebook/getPreBookInformation?mainId=${mainId}`;
    // 获取基础信息数据
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe(res => {

        if (res.code === '0000') {
          if (res.data) {

            if (this.dataBase.isPrebookApply == '1') {
              const foreignTradeCompany = this.dataBase.foreignTradeCompany;
              const foreignTradeCompanyprebook = res.data.foreignTradeCompany;
              this.foreignTradeOffPrebook = foreignTradeCompany == foreignTradeCompanyprebook ? false : true;
              const distributor = this.dataBase.agent;
              const distributorPrebook = res.data.distributor;
              this.distributorOffPrebook = distributor == distributorPrebook ? false : true;
            }
          }
        }
      });
    })
  }
 //判断ddpstatus是否通过
 isadopt(param,number) {
  if (param) {
    let endDates = new Date(param);
    let year = endDates.getFullYear();
    let month = endDates.getMonth()+1;
    let day = endDates.getDate();
    let overdue=`${year}-${month}-${day}`;
    let overDate=new Date(overdue).setHours(0, 0, 0, 0);
    let endDate = new Date(overDate).getTime();
    let nowDate = new Date(new Date().setHours(0, 0, 0, 0)).getTime()
    let iRemain:any= (endDate - nowDate) / 1000;
    iRemain = iRemain / 86400;
    iRemain= parseInt(iRemain) + 1;
    number==1&&(this.dataBase.lateDayOff = iRemain <= 7 ? true : false);
    number==2&&(this.dataBase.lateDateOff = iRemain <= 7 ? true : false);
    number==1&&(this.dataBase.laterDay=iRemain);
    number==2&&(this.dataBase.lateDays=iRemain);
    if (iRemain >=1)
    {
      return "通过";
    }
    else
    {
      return "不通过";
    }
  }
  else{
    return "不通过"
  }
}

//经销商协议号列表
public dealerCodeList()
{
  let dealerCode=this.dataBase.dealerCode;
  if(dealerCode&&this.dataBase.businessModel=='DISTRIBUTOR')
  {
    let url=`/act/preparation/chooseDealer?dealerCode=${dealerCode}`;
    this.http.get(url).subscribe(rest => {
        this.dealList=rest.data;
        let dealerAgreementNo=this.dataBase.agreementNo;
        let select=this.dealList.find(val=>dealerAgreementNo==val.agreementNo);
        !select&&(this.dataBase.agreementNo=null);
    })
  }
}

  //没有文件的显示
  nodata(param)
  {
    if(param==null||param=='')
    {
      return true;
    }
    else
    {
      return false;
    }
  }
  // 进单模式
public getEntryModeList() {
  const params = {
    dictGroup: 'ENTRY_MODEL',
  };
  this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
    if (rest.code === '0000') {
      this.entryModeList = rest.data;
    } else {
      this.message.create('error', `${rest.msg}`);
    }
  });
}
  // 业务模式
  public getBusinessModelList () {
    const params = {
      dictGroup: 'BUSINESS_MODEL',
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe((rest => {
      if (rest.code === '0000') {
        this.businessModelList = rest.data;
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    }),(error)=>{
      this.message.create("error","请求异常！")
    });
  }

    // 飞利浦金融方案
    public getfinancialList() {
      const params = {
        dictGroup: 'OABC',
      };
      this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
        if (rest.code === '0000') {
          this.financialList = rest.data;
        } else {
          this.message.create('error', `${rest.msg}`);
        }
      });
    }
      //金融方案
  selectFinacial() {
    if (this.dataBase.financialProgramme == "2") {
      this.financiaWidth = "7"
    }
    else {
      this.financiaWidth = "14"
    }
    if (this.financialList.length > 0) {
      let select = this.financialList.find(val => val.code == this.dataBase.financialProgramme);
      this.dataBase.financialProgrammeTitle = select ? select.label : "无";
    }
    else {
      this.dataBase.financialProgrammeTitle = "无";
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
    // 上传文件下载
    public dwonLoad = (file: UploadFile): void => {
      const urlPath = window.document.location.href;
      const docPath = window.document.location.pathname;
      const index = urlPath.indexOf('#');
      const serverPath = urlPath.substring(0, index);
      const url = `${serverPath}act/system/download/${file.fileId}`;
      window.open(url, '_blank');
    }
  /**
   * @param   data 回显数据
   * @param   fileList 回显数组
   */
   viewData(data,fileList)
   {

     const bidWinningNotice=this.dataBase[data];
     if(bidWinningNotice!=""&&bidWinningNotice!=undefined&&bidWinningNotice!=null)
     {

       this[fileList]= [];
       let obj = { uid: "", name: "", fileId: "" }
       obj.uid = this.dataBase[data];
       obj.fileId =this.dataBase[data];
       obj.name = "文件下载";
       this[fileList].push(obj);
     }
   }

  /*投标申请表链接眼*/
  getWinUrl() {
    const url = '/act/preparation/getMainId';
    let par = {
      jdChildMainId: this.mainId
    };
    this.http.post(url, par).subscribe( e => {
      if (e.data) {
        this.mainid_winList = e.data;
      }
    });
  }
  toWin(item) {
    if (item.taskStatus && item.taskStatus === 'YZBQRDBCWJ') {
      window.open(location.origin + environment.base_href + '/#/' + 'support-up?id=' + codeString(item.zbMainId) + '&flag=1' + '&status=' + item.taskStatus);
    } else {
      window.open(location.origin + environment.base_href + '/#/' + 'winning?id=' + codeString(item.zbMainId) + '&flag=1' + '&status=' + item.taskStatus);
    }
  }

  // 查看最终用户编号
  public showDiag() {
    this.dealshow.data = [];
    const dealerAgreementNo = this.dataBase.agreementNo;
    this.isAgres = true;
    // const select = this.dealList.find(val => dealerAgreementNo === val.agreementNo);
    // if (select) {
    //   const obj = {
    //     authorizedArea: select.authorizedArea,
    //     authorizedProduct: select.authorizedProduct
    //   };
    //   this.dealshow.data.push(obj);
    //   this.ServesiceService.dealTable.emit(this.dealshow);
    // }
    if (this.dataBase && this.dataBase.preparationProductCompany) {
      // 经销商协议号 禁用查询数据库保存值
      const obj = {
        authorizedArea: this.dataBase.preparationProductCompany.authorizedArea,
        authorizedProduct: this.dataBase.preparationProductCompany.authorizedProduct
      };
      this.dealshow.data.push(obj);
      this.ServesiceService.dealTable.emit(this.dealshow);
    }

  }
  // 取消弹出窗口
  public isAgreCancels() {
    this.isAgres = false;
  }

}
