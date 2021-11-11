import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NzMessageService, UploadFile} from 'ng-zorro-antd';
import {decodeString, formatDatesNow,formatDates, getType, upLoadFiles} from '../../../../assets/js/tools';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpService} from '../../../services';
import {ToastrService} from 'ngx-toastr';


@Component({
  selector: 'app-consign-consign',
  templateUrl: './consign-consign.component.html',
  styleUrls: ['./consign-consign.component.scss']
})
export class ConsignConsignComponent implements OnInit {
  @Input() public disa:any=false;  
  @Input() public dataBase: any = {};
  @Input() public infor:any={};
  @Input() public mergeData:any={};  
  public disas:any=false; //控制上传合同和正式合同是否已传的
  public disad:any=false;//控制上传合同和正式合同是否已传的
  public businessType:any;
  public validateForm: FormGroup;
  public textLen:any=255;
  public load: any = false;
  public sale:any;
  public date:any;
  public biddingAgency:any;
  public fileFileList:any=[]; //
  public productConfFileList:any=[]; //
  public file2FileList = []; //
  public file3FileList = []; //
  public user;
  public state:any; //当前路由状态
  fileArr:any=[];
  pdfSRC: any;
  public isPdf:any=false; //打开pdf查看器
  // 提交参数
  public flag: any=0;
  public params = {
    mainId: '',
    isContract:"",
    contractFile:"",
  };
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private toastrService: ToastrService,
    private message: NzMessageService,
    public activatedRouter: ActivatedRoute,
  ) {}

  ngOnInit() { 
      
    this.flag = this.activatedRouter.queryParams['_value'].flag;    
    this.state=this.activatedRouter.queryParams['_value'].status; 
    this.sale=this.activatedRouter.queryParams['_value'].sale;
    this.params.mainId = decodeString(this.activatedRouter.queryParams['_value'].id);  
      
    const ASYNS = async () => {
      const params:any=await this.getWinUrl();    
      if(params.length>0)
      {
        let obj:any=await this.getData(params[0].zbMainId);        
        this.biddingAgency=obj.biddinOrgName;
        this.date=obj.openBiddingDate;
        this.businessType=obj.businessType;
      }
      
    };
    ASYNS()
    this.flag==1&&(this.disa=true);
        
    this.validateForm = this.fb.group({
      remark: new FormControl({ value: 'Nancy',disabled:this.disa}),
      file: new FormControl({ value: 'Nancy',disabled:this.disa}),
      file2: new FormControl({ value: 'Nancy',disabled:this.disa}),
      file3: new FormControl({ value: 'Nancy',disabled:this.disa}),
      salesAgreementNo: new FormControl({ value: 'Nancy',disabled:this.disa}), // 买卖协议号
      importAgreementNo: new FormControl({ value: 'Nancy',disabled:this.disa}), // 进口协议号
      purchaseOrderNumber: new FormControl({ value: 'Nancy',disabled:this.disa}), // 采购订单号
      priceTerms: new FormControl({ value: 'Nancy',disabled:this.disa}), // 价格术语
      solution: new FormControl({ value: 'Nancy',disabled:this.disa},Validators.required), // 是否含有solution
      productConf: new FormControl({ value: 'Nancy',disabled:this.disa}), // 产品配置
      invoiceMailingInformation: new FormControl({ value: 'Nancy',disabled:this.disa}), // 发票邮寄信息
      portShipment: new FormControl({ value: 'Nancy',disabled:this.disa}), // 发货港
      typeShipping: new FormControl({ value: 'Nancy',disabled:this.disa}), // 运输方式
      portDestination: new FormControl({ value: 'Nancy',disabled:this.disa}), // 目的港
      contractDate: new FormControl({ value: 'Nancy',disabled:this.disa},Validators.required), // 合同确认日期
      isContract: new FormControl({ value: 'Nancy'}), // 正式合同已上传
    });
    this.getTableData()  
  }
// 审批记录
  getTableData() {
    return new Promise((resolve, reject) => {
    const params = {
      mainBusinessID: decodeString(this.activatedRouter.queryParams['_value'].id),
    };
    this.http.post(`/act/process/getProcessWorkHisInfo`, params).subscribe(rest => {
      if (rest.code === '0000') {
        let listOfData =  rest.data.reverse();
        this.user=localStorage.getItem("ng_philips_code1");
        let owner=listOfData.find(vals=>vals.name=='ORDERCG');        
        this.disas=owner.assignee==this.user?false:true;              
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
    })
  }

  // 文件非空验证
  public ckFile() {
    if (this.fileFileList.length==0) {
      return false;
    }
    return true;
  }
  //文件上传接口
  uploads(fileList, file, fileId,dataBase)
  {
    this[dataBase][fileList] = [];
    const type = getType(file);
    this[dataBase][fileList].push(file);
    const formData = new FormData();
    // tslint:disable-next-line:no-shadowed-variable
    this[dataBase][fileList].forEach((file: any) => {
      formData.append('file', file);
      formData.append('fileType', type);
      formData.append('filename', file.name);
    });

    this.load = true;
    const url = '/act/system/upload';
    this.http.posts(url, formData).subscribe((res => {
      if (res.code === '0000') {
        this.load = false;
        this[dataBase][fileList][0].fileId = res.data;
        this[dataBase].contractDate=formatDates(new Date())
        //this.dataBase[fileId] = res.data;
        this.message.create('success', '操作成功');
      } else {
        this.message.create('error', res.msg);
      }
    }),(error=>{
      this.message.create("error","上传失败")
    }));
  }
  //更新
  public updata() {
    this.params.mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    this.params.isContract=this.dataBase.isContract;
    this.params.contractFile=this.dataBase.contractFile;
    const url = '/act/preparation/editFile';
    if(this.params.contractFile!=null&&this.params.contractFile!=undefined&&this.params.contractFile!="")
    {
      this.http.post(url, this.params).subscribe( res => {
        if (res.code === '0000') {
          this.message.create('success', '操作成功');
        }
        const url = `/act/preparation/queryContractSigned?mainId=${this.params.mainId}`
        this.http.get(url).subscribe((rest => {
           if(rest.data.isContract=='1')
           {
             this.disad=true;
           }
        }))
      });
    }
    else
    {
       this.message.create("error","请上传文件");
    }
    
  }
  /**
   * filist 在线显示的文件 file上传的文件 fileId绑定的上传文件的id
   */
  public upload(fileList, file, fileId) {
    this[fileList] = [];
    const type = getType(file);
    this[fileList].push(file);
    const formData = new FormData();
    // tslint:disable-next-line:no-shadowed-variable
    this[fileList].forEach((file: any) => {
      formData.append('file', file);
      formData.append('fileType', type);
      formData.append('filename', file.name);
    });

    this.load = true;
    const url = '/act/system/upload';

    this.http.posts(url, formData).subscribe((res => {
      if (res.code === '0000') {
        this.load = false;
        this[fileList][0].fileId = res.data;
        this.dataBase[fileId] = res.data;
        this.message.create('success', '操作成功');
      } else {
        this.message.create('error', res.msg);
      }
    }),(error=>{
      this.load = false;
      this[fileList] = [];
      this.message.create("error","上传失败")
    }));
  }
   //删除合同文件
   nzRemovcontractFile=(file:UploadFile):any=>{
    this.dataBase.contractFile="";
    return true;
  }

   //删除配置文件
   nzRemovsitePreparation=(file:UploadFile):any=>{
    this.dataBase.productConfFile="";
    return true;
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
  // 上传——file
  public fileBeforeUpload = (file: UploadFile,fileList: UploadFile[]): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);

    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
   // let upLoadFilesNow=upLoadFiles.bind(this)
   // upLoadFilesNow('fileFileList',file,'attachmentIds',"dataBase");
   //this.uploads('fileFileList',file,'attachmentIds',"dataBase")
     this.upload('fileFileList',file,"contractFile");
    return false;
  }
  // 上传——file2    产品配置文件
  public file2BeforeUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    this.upload('productConfFileList', file, 'productConfFile');
    return false;
  }
  //备注必填项验证
  cheakData(param)
  {
    if(param==0)
    {
      this.validateForm.get('remark')!.setValidators(Validators.required);
      this.validateForm.get('remark')!.markAsDirty();
      this.validateForm.get('contractDate')!.clearValidators();
      this.validateForm.get('contractDate')!.markAsPristine(); 
      this.validateForm.get('solution')!.clearValidators();
      this.validateForm.get('solution')!.markAsPristine(); 
      this.validateForm.get('portDestination')!.clearValidators();
      this.validateForm.get('portDestination')!.markAsPristine(); 
      this.validateForm.get('typeShipping')!.clearValidators();
      this.validateForm.get('typeShipping')!.markAsPristine(); 
      this.validateForm.get('portShipment')!.clearValidators();
      this.validateForm.get('portShipment')!.markAsPristine(); 
      this.validateForm.get('importAgreementNo')!.clearValidators();
      this.validateForm.get('importAgreementNo')!.markAsPristine();  
      this.validateForm.get('priceTerms')!.clearValidators();
      this.validateForm.get('priceTerms')!.markAsPristine(); 
      this.validateForm.get('purchaseOrderNumber')!.clearValidators();
      this.validateForm.get('purchaseOrderNumber')!.markAsPristine();
      this.validateForm.get('salesAgreementNo')!.clearValidators();
      this.validateForm.get('salesAgreementNo')!.markAsPristine();
      this.validateForm.get('invoiceMailingInformation')!.clearValidators();
      this.validateForm.get('invoiceMailingInformation')!.markAsPristine();  
    }
    else
    { 
      this.validateForm.get('remark')!.clearValidators();
      this.validateForm.get('remark')!.markAsPristine(); 
      this.validateForm.get('contractDate')!.setValidators(Validators.required);
      this.validateForm.get('contractDate')!.markAsDirty(); 
      this.validateForm.get('solution')!.setValidators(Validators.required);
      this.validateForm.get('solution')!.markAsDirty();    
    }
    if(param==1)
    {
      
      if(this.mergeData.businessModel=='DIRECT')
      {
        this.validateForm.get('salesAgreementNo')!.setValidators(Validators.required);
        this.validateForm.get('salesAgreementNo')!.markAsDirty();        
        this.validateForm.get('purchaseOrderNumber')!.clearValidators();
        this.validateForm.get('purchaseOrderNumber')!.markAsPristine();
      }
      else
      {
        this.validateForm.get('salesAgreementNo')!.clearValidators();
        this.validateForm.get('salesAgreementNo')!.markAsPristine();
        this.validateForm.get('purchaseOrderNumber')!.setValidators(Validators.required);
        this.validateForm.get('purchaseOrderNumber')!.markAsDirty(); 
      }
      if(this.mergeData.invoiceInformation=='USD')
      {
        
        this.validateForm.get('portDestination')!.setValidators(Validators.required);
        this.validateForm.get('portDestination')!.markAsDirty();
        this.validateForm.get('typeShipping')!.setValidators(Validators.required);
        this.validateForm.get('typeShipping')!.markAsDirty();
        this.validateForm.get('portShipment')!.setValidators(Validators.required);
        this.validateForm.get('portShipment')!.markAsDirty();
        this.validateForm.get('importAgreementNo')!.setValidators(Validators.required);
        this.validateForm.get('importAgreementNo')!.markAsDirty();
        this.validateForm.get('priceTerms')!.setValidators(Validators.required);
        this.validateForm.get('priceTerms')!.markAsDirty();
        this.validateForm.get('invoiceMailingInformation')!.clearValidators();
        this.validateForm.get('invoiceMailingInformation')!.markAsPristine();       
      }
      else{
        this.validateForm.get('portDestination')!.clearValidators();
        this.validateForm.get('portDestination')!.markAsPristine(); 
        this.validateForm.get('typeShipping')!.clearValidators();
        this.validateForm.get('typeShipping')!.markAsPristine(); 
        this.validateForm.get('portShipment')!.clearValidators();
        this.validateForm.get('portShipment')!.markAsPristine(); 
        this.validateForm.get('importAgreementNo')!.clearValidators();
        this.validateForm.get('importAgreementNo')!.markAsPristine();  
        this.validateForm.get('priceTerms')!.clearValidators();
        this.validateForm.get('priceTerms')!.markAsPristine();         
        this.validateForm.get('invoiceMailingInformation')!.setValidators(Validators.required);
        this.validateForm.get('invoiceMailingInformation')!.markAsDirty();
      }
    }      
    this.validateForm.get('contractDate')!.updateValueAndValidity();
    this.validateForm.get('solution')!.updateValueAndValidity();
    this.validateForm.get('invoiceMailingInformation')!.updateValueAndValidity();
    this.validateForm.get('priceTerms')!.updateValueAndValidity();
    this.validateForm.get('importAgreementNo')!.updateValueAndValidity();
    this.validateForm.get('portShipment')!.updateValueAndValidity();
    this.validateForm.get('typeShipping')!.updateValueAndValidity();
    this.validateForm.get('portDestination')!.updateValueAndValidity();
    this.validateForm.get('purchaseOrderNumber')!.updateValueAndValidity();
    this.validateForm.get('salesAgreementNo')!.updateValueAndValidity();
    this.validateForm.get('remark')!.updateValueAndValidity();
    
  }
  checkFormData = () => {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    return this.validateForm.valid;
  };
  ngOnChanges() {
    this.viewData("productConfFile","productConfFileList",this.dataBase.productConfFileNames); 
    this.viewData("contractFile","fileFileList",this.dataBase.contractFileNames);      
    let state=this.activatedRouter.queryParams['_value'].status;
    this.dataBase.remark=this.dataBase.remark?this.dataBase.remark:"";
    if(this.dataBase.isContract=='1'&&state!='DHTQS')
    {
      this.disad=true;
    }    
  }  
/**
   * @param   data 回显数据
   * @param   fileList 回显数组
   */
 viewData(data, fileList,name?:any) {

  const bidWinningNotice = this.dataBase[data];
  if (bidWinningNotice != "" && bidWinningNotice != undefined && bidWinningNotice != null) {

    this[fileList] = [];
    let obj = { uid: "", name: "", fileId: "" }
    obj.uid = this.dataBase[data];
    obj.fileId = this.dataBase[data];
    obj.name =name?name:"文件下载";
    this[fileList].push(obj);
  }
}
  // 打开pdf查看器
  public isPdfCancel() {
    this.isPdf=false;
  }
  public tenderDeclarationLetter3(code) {
    // CYTBSMH  YCV-M2O-001a1参与投标声明函05271625    
    const today = new Date();
    var dateYear="",dateMonth="",dateDay="";
    if(this.date!=""&&this.date!=null&&this.date!=undefined)
    {
      let  nowDate=formatDatesNow(this.date).split("-");
         dateYear=nowDate[0];
         dateMonth=nowDate[1];
         dateDay=nowDate[2]; 
    }

    const params = {
      templateCode: code,
      projectLeader: this.mergeData.biddingManager?this.mergeData.biddingManager:"",
      IDnumber: '',
      mainId:this.params.mainId,
      businessType:this.businessType?this.businessType:"", //招标业务模式
      contractPrice:this.mergeData.contractPrice?this.mergeData.contractPrice:"",//进单单位合同价
     // marketBundleName:this.mergeData.productModel?this.mergeData.productModel:"",//产品型号
      productModel:this.mergeData.productModel?this.mergeData.productModel:"",//产品型号
      biddingName: this.mergeData.tenderingCompany?this.mergeData.tenderingCompany:"",
      biddingAgency:this.biddingAgency?this.biddingAgency:"",//招标机构
      biddingNo: this.mergeData.tenderNo?this.mergeData.tenderNo:"", 
      hospitalNature:this.mergeData.hospitalNature,//医院性质     
      salesAgreementNo: this.dataBase.salesAgreementNo?this.dataBase.salesAgreementNo:"", // 买卖协议号
      importAgreementNo: this.dataBase.importAgreementNo?this.dataBase.importAgreementNo:"", // 进口协议号
      purchaseOrderNumber: this.dataBase.purchaseOrderNumber?this.dataBase.purchaseOrderNumber:"", // 采购订单号
      solution: this.dataBase.solution?this.dataBase.solution:"", // 是否含有solution
      productConf: this.dataBase.productConf?this.dataBase.productConf:"", // 产品配置
      productConfFile: this.dataBase.file2?this.dataBase.file2:"", // 产品配置文件
      invoiceMailingInformation: this.dataBase.invoiceMailingInformation?this.dataBase.invoiceMailingInformation:"", // 发票邮寄信息
      portShipment: this.dataBase.portShipment?this.dataBase.portShipment:"", //目的港英文名称
      typeShipping: this.dataBase.typeShipping?this.dataBase.typeShipping:"", // 运输方式
      portDestination: this.dataBase.portDestination?this.dataBase.portDestination:"", // 目的港
      // contractDate: formatDatesNow(this.dataBase.contractDate), // 合同确认日期
      isContract: '******', // 正式合同已上传
      contractFile: '******', // 合同文件      
      priceTerms: this.dataBase.priceTerms?this.dataBase.priceTerms:"", // 价格术语
      tenderNo: this.mergeData.tenderNo?this.mergeData.tenderNo:"",//招标编号 
      dealFormId:this.mergeData.dealFormId, //dealfromid
      distributor:this.mergeData.distributor?this.mergeData.distributor:"", //经销商
      orderSignNam:this.mergeData.orderSignName?this.mergeData.orderSignName:"",//采购订单签署人
      orderSignPost:this.mergeData.orderSignPost?this.mergeData.orderSignPost:"",//采购订单签署人职务
      distributorAddress:this.mergeData.distributorAddress?this.mergeData.distributorAddress:"", //经销商地址
      distributorContacts:this.mergeData.distributorContacts?this.mergeData.distributorContacts:"",//经销商联系人
      distributorPhone:this.mergeData.distributorPhone?this.mergeData.distributorPhone:"",//经销商电话

      contractBuyer:this.mergeData.contractBuyer?this.mergeData.contractBuyer:"", //合同买方
      contractBuyerAddress:this.mergeData.contractBuyerAddress?this.mergeData.contractBuyerAddress:"", //合同买方地址
      contractSignatory:this.mergeData.contractSignatory?this.mergeData.contractSignatory:"", //合同签署人
      contractSignatoryPost:this.mergeData.contractSignatoryPost?this.mergeData.contractSignatoryPost:"",//合同签署人职务

      foreignTradeCompany:this.mergeData.foreignTradeCompany?this.mergeData.foreignTradeCompany:"", //外贸公司
      foreignTradeCompanyAddress:this.mergeData.foreignTradeCompanyAddress?this.mergeData.foreignTradeCompanyAddress:"",//外贸公司地址
      foreignTradeCompanyContacts:this.mergeData.foreignTradeCompanyContacts?this.mergeData.foreignTradeCompanyContacts:"",//外贸公司联系人
      foreignTradeCompanyPhone:this.mergeData.foreignTradeCompanyPhone?this.mergeData.foreignTradeCompanyPhone:"",//外贸公司电话
      foreignTradeCompanyEmail:this.mergeData.foreignTradeCompanyEmail?this.mergeData.foreignTradeCompanyEmail:"",//外贸公司邮箱
      importAgreementSignName:this.mergeData.importAgreementSignName?this.mergeData.importAgreementSignName:"",//进口协议签署人
      importAgreementSignPost:this.mergeData.importAgreementSignPost?this.mergeData.importAgreementSignPost:"",//进口协议签署人职务

      endUser: this.mergeData.endUser?this.mergeData.endUser:"", //最终用户
      endUserContacts:this.mergeData.endUserContacts?this.mergeData.endUserContacts:"",//最终用户联系人
      endUserAddress:this.mergeData.endUserAddress?this.mergeData.endUserAddress:"", //最终用户地址
      endUserPhone:this.mergeData.endUserPhone?this.mergeData.endUserPhone:"",//最终用户电话
      endUserEmail:this.mergeData.endUserEmail?this.mergeData.endUserEmail:"",//最终用户邮箱

      billingInfor:this.mergeData.billingInfor?this.mergeData.billingInfor:"",//开票信息
      invoiceInformation:this.mergeData.invoiceInformation?this.mergeData.invoiceInformation:"",//币制
      
      contractBuyerContacts: this.mergeData.contractBuyerContacts?this.mergeData.contractBuyerContacts:"",
      salesLeader: this.mergeData.salesLeader?this.mergeData.salesLeader:"",
      ContractBuyerPosition: this.mergeData.ContractBuyerPosition?this.mergeData.ContractBuyerPosition:"",

      emailSale: this.sale?this.sale:"", //传的销售
      nmpaName:this.mergeData.nmpaName?this.mergeData.nmpaName:"", //nmpaName
      sampleAuditFlag:this.mergeData.sampleAuditFlag?this.mergeData.sampleAuditFlag:"", //是否抽样审核
      
     
      countryOrigin:this.mergeData.countryOrigin?this.mergeData.countryOrigin:"",//原产地

      dateYear:dateYear,
      dateMonth:dateMonth,
      dateDay:dateDay,
      date: today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate(),
      data1: today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate(),
    };
    
    this.pdfSRC=params;
    this.isPdf=true;   
  }
 /*投标申请表链接眼*/
 getWinUrl() {
  const url = '/act/preparation/getMainId';
  let par = {
    jdChildMainId: this.params.mainId
  };
  return new Promise((resolve, reject) => {
  this.http.post(url, par).subscribe( e => {    
    if (e.data) {
      resolve(e.data)
    }
  });
})
}
//获取数据
getData(param) {
  let url = `/act/ecom/tender/application/getTenderApplicationDto?mainId=${param}`;
  return new Promise((resolve, reject) => {
  this.http.get(url).subscribe(res => {
       if(res.data)
       {
         resolve(res.data)
       }  
    });
  })
}



}
