import {Component, OnInit, NgModule, Input, ViewChild, EventEmitter, Output, ChangeDetectorRef, ElementRef,} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FileService, HttpService } from '../../../services';
import {
  codeString,
  decodeString,
  getType,
  NumberThousandth
} from '../../../../assets/js/tools';
import { NzMessageService, NzModalService, UploadFile } from 'ng-zorro-antd';
import {
  ServesiceService,
} from '../servesice.service';

@Component({
  selector: 'app-supplement',
  templateUrl: './supplement.html',
  styleUrls: ['./supplement.scss', '../apply-tender.component.scss']
})
@NgModule({

})
export class SupplementComponent implements OnInit {
  validateForm: FormGroup;
  @ViewChild('child1') child1
  @ViewChild('child2') child2
  @Input() isDisable: any = false;
  @Input() isModif: any = false;
  @Input() dataBase: any = {};
  @Input() completed: any = false;
  @Input() productData:any;
  @Output() myEvent = new EventEmitter(); //类以vue的emit方法
  @ViewChild('price1') price1: ElementRef;
  @ViewChild('price2') price2: ElementRef;
  @ViewChild('price3') price3: ElementRef;
  @ViewChild('num1') num1: ElementRef;
  @ViewChild('num2') num2: ElementRef;
  @Input() file_arr: any = {
    fileList: [], // 上传招标文件列表
    fileSealList: [], // 上传盖章后的文件列表
    fileAgentList: [], // 协议代理商出具投标委托函
  };

  // 记录历史ddp选择状态
  ddp_history: any = {};
  // 记录历史mess_ddp选择状态
  mess_ddp_history: any = {};
  price1_value: any = '';
  price2_value: any = '';
  price3_value: any = '';
  price4_value: any = '';
  price5_value: any = '';

  redstar:any = false;
  mess_ddp: any = false;
  public agreementAgenNameAddr: any = ''; // 协议经销商名称地址

  public agentDatas:any=[]; //代理商数据
  constructor(
    public activatedRouter: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: NzModalService,
    private nzMessageService: NzMessageService,
    private router: Router,
    private http: HttpService,
    private message: NzMessageService,
    private changeDetectorRef: ChangeDetectorRef,
    public ServesiceService:ServesiceService
  ) {

   }
  ngOnChanges() {
    this.getBusinessModelList();
    this.getLogisticsTermsExplainList();
    this.paymentMethod();
    //清空数据
    this.ServesiceService.bookEventer.subscribe(res => {

       if(res)
       {
         const param={
          total: 0,
          pageNo: 1,
          pageSize: 5,
          dealerName: this.dataBase.biddingNames
        }
        const url = `/act/ecom/bidding/selAgent`;
        if(this.dataBase.biddingNames!=this.dataBase.agreementAgenName)
        {
          this.dataBase.biddingDdpState = '非飞利浦授权二级经销商';
          this.mess_ddp = false;
        }
        else{
          this.http.post(url, param).subscribe((rest => {
            if (rest.data && rest.data.rows && rest.data.rows.length > 0) {
              if (rest.data.rows[0].ddpStatus === '通过') {
                this.dataBase.biddingDdpState = rest.data.rows[0].ddpStatus;
              } else {
                this.dataBase.biddingDdpState = '未通过';
              }
              if (rest.data.rows[0].ddpStatus == null || rest.data.rows[0].ddpStatus === '') {
                this.mess_ddp = true;
                this.mess_ddp_history[res.data.rows[0].dealerName] = true;
              } else {
                this.mess_ddp = false;
              }
            }
            else{
              this.dataBase.biddingDdpState = '未通过';
              this.mess_ddp = true;
              this.mess_ddp_history[res.data.rows[0].dealerName] = true;
            }
          }));
        }

       }
       else{
        this.dataBase.biddingDdpState = '未通过';
        this.mess_ddp = true;
       }
    });
    this.isModif = this.completed;
    const sealedFileId=this.dataBase.sealedFileId;
    const contractorTenderEntrustmentFileId=this.dataBase.contractorTenderEntrustmentFileId;
    const fileId=this.dataBase.fileId;
    // this.dataBase=Object.assign({},this.dataBase);
    if (contractorTenderEntrustmentFileId != '' && contractorTenderEntrustmentFileId != undefined && contractorTenderEntrustmentFileId != null) {
      this.file_arr.fileAgentList = [];
      let obj = { uid: '', name: '', fileId: '' };
      obj.uid = this.dataBase.contractorTenderEntrustmentFileId;
      obj.fileId = this.dataBase.contractorTenderEntrustmentFileId;
      obj.name = this.dataBase.contractorTenderEntrustmentFileName;
      this.file_arr.fileAgentList.push(obj);
    }
    if(sealedFileId != '' && sealedFileId != undefined && sealedFileId != null) {
      this.file_arr.fileSealList = [];
      let obj = { uid: '', name: '', fileId: '' };
      obj.uid = this.dataBase.sealedFileId;
      obj.fileId = this.dataBase.sealedFileId;
      obj.name = this.dataBase.sealedFileName;
      this.file_arr.fileSealList.push(obj);
    }
    if (fileId != '' && fileId != undefined && fileId != null) {
      this.file_arr.fileList = [];
      let obj = { uid: '', name: '', fileId: '' };
      obj.uid = this.dataBase.fileId;
      obj.fileId = this.dataBase.fileId;
      obj.name = this.dataBase.fileName;
      this.file_arr.fileList.push(obj);
    }
    if (this.dataBase && this.dataBase.tenderPriceCurrency) {
     // this.dataBase.tenderPriceCurrency = this.chNumber(this.dataBase.tenderPriceCurrency);
     // this.dataBase.tenderPriceCurrency=NumberThousandth(this.dataBase.tenderPriceCurrency);
    }
    if (this.dataBase && this.dataBase.totalPrice) {
      //this.dataBase.totalPrice = this.chNumber(this.dataBase.totalPrice);
    }
    if (this.dataBase && this.dataBase.performanceBonds) {
     //this.dataBase.performanceBonds = this.chNumber(this.dataBase.performanceBonds);
    }
  }
//代理商参数
public params:any={
    dealerName:"",
    pageNo:1,
    pageSize:5,
    total:0,
}



  //标题信息
  nzTitle()
  {
    if(this.dataBase.businessType=="DISTRIBUTOR")
    {
      return "补充信息 Distributor Deal";
    }
    else if(this.dataBase.businessType=="DIRECT")
    {
     return "补充信息 Direct Deal";
    }
    else
    {
      return "补充信息";
    }
  }
  //取消pdf查看器
  isPdfCancel()
  {
    this.isPdf=false;
  }
  public tenderDeclarationLetter(code) {
    // CYTBSMH  YCV-M2O-001a1参与投标声明函05271625
    const today = new Date();
    const params: any = {};
      params.templateCode = code;
      params.projectLeader = this.dataBase.biddingManager;
      params.biddingName = this.dataBase.biddingNames;
      params.date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      params.dateYear = today.getFullYear();
      params.dateMonth = (today.getMonth() + 1);
      params.dateDay = today.getDate();

    // this.router.navigate(['/igt/pdfpreview'], {
    //   skipLocationChange: true,
    //   queryParams: params,
    // });
    //this.pdfSRC="https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf";
    Object.assign(params, this.dataBase);

    if (params.biddingName) {
      params.biddingName = params.biddingName.replace(/\+/g, '%2B');
    }
    if (params.biddingProName) {
      params.biddingProName = params.biddingProName.replace(/\+/g, '%2B');
    }
    if (params.biddingProName) {
      params.biddingN = params.biddingProName.replace(/\+/g, '%2B');
    }
    params.dataList = '';
    params.paymentList = '';
    params.productInformations = '';
    params.paymentDescription = '';
    params.region = '';
    params.BMClist = '';
    params.BMCExpert = '';
    params.AppExpert = '';
    this.pdfSRC=params;
    this.isPdf=true;

  }
  public authorizationApplicationLetter(code) {
    console.log(this.dataBase);
    console.log(this.productData);
    // ZZSSQH  YCV-M2O-001a2授权申请函05271717
    const today = new Date();
    const params: any = { };
    params.templateCode = code;
    params.agreementAgentName = this.dataBase.agreementAgenName;
    params.tenderNo = this.dataBase.biddingNo;
    params.biddingProName = this.dataBase.biddingName;
    params.HospitalName = this.dataBase.hospitalName;
    params.biddingManagerAndTitle = this.dataBase.biddingManager + ' ' + this.dataBase.biddingManagerTitle;
    params.opportunityDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

    let opportunityURL = '';
    params.opportunityDate = '';
    let data = null;
    let i2 = 0;
    if (this.productData) {
      this.productData.map(pro => {
        if (i2 == 0) {
          opportunityURL += pro.opportunityId;
          if (pro.createdDate) {
            data = new Date(pro.createdDate);
            params.opportunityDate += data.getFullYear() + '-' + (data.getMonth() + 1) + '-' + data.getDate();
          }
          i2++;
        } else {
          opportunityURL += ' %7C ' + pro.opportunityId;
          data = new Date(pro.createdDate);
          if (pro.createdDate) {
            params.opportunityDate += ' %7C ' + data.getFullYear() + '-' + (data.getMonth() + 1) + '-' + data.getDate();
          }
        }
      });
    }
    let i = 0;
    let productMo = '';
    console.log(this.productData);
    //productModel   dataList children
    if (this.productData) {
      this.productData.map(datalist => {
        if ( datalist.productInformations) {
          datalist.productInformations.map(pro => {
            if (pro.productModel) {
              if (i == 0) {
                productMo += pro.productModel;
                i++;
              } else {
                productMo += ' %7C ' + pro.productModel;
              }
            }
          });
        }
      });
    }
    this.dataBase.productModel = productMo;
    this.dataBase.agreementAgentName = this.dataBase.agreementAgenName;
    this.dataBase.biddingN = this.dataBase.biddingName;
    Object.assign(params, this.dataBase);
    if (params.phone == null) {
      params.phone = '';
    }
    if (params.city == null) {
      params.city = '';
    }
    // params.biddingName = encodeURIComponent(this.dataBase.biddingNames);
    // params.biddingProName = encodeURIComponent(this.dataBase.biddingNames);
    // params.biddingN = encodeURIComponent(this.dataBase.biddingNames);
    if (params.biddingName) {
      params.biddingName = params.biddingName.replace(/\+/g, '%2B');
    }
    if (params.biddingProName) {
      params.biddingProName = params.biddingProName.replace(/\+/g, '%2B');
    }
    if (params.biddingProName) {
      params.biddingN = params.biddingProName.replace(/\+/g, '%2B');
    }
    params.opportunityURL = opportunityURL;
    params.dataList = '';
    // debugger;
    if (this.dataBase.openBiddingDate) {
      let biddingDate = new Date(this.dataBase.openBiddingDate);
      params.biddingDate = biddingDate.getFullYear() + '-' + (biddingDate.getMonth() + 1) + '-' + biddingDate.getDate(); // biddingValidDay
      // @ts-ignore
      // let biddingDate2 = new Date((biddingDate / 1000 + (86400 * parseInt(this.dataBase.biddingValidDay))) * 1000);
      biddingDate.setDate(biddingDate.getDate() + parseInt(this.dataBase.biddingValidDay));
      params.biddingDates = biddingDate.getFullYear() + '-' + (biddingDate.getMonth() + 1) + '-' + biddingDate.getDate(); // biddingValidDay
    } else {
      params.biddingDate = '';
      params.biddingDates = '';
    }
    // this.router.navigate(['/igt/pdfpreview'], {
    //   skipLocationChange: true,
    //   queryParams: params,
    // });
    params.paymentList = '';
    params.productInformations = '';
    params.paymentDescription = '';
    params.region = '';
    params.BMClist = '';
    params.BMCExpert = '';
    params.AppExpert = '';
    this.pdfSRC = params;
    this.isPdf = true;
  }
  public joinPdfUrl(code) {

    // TBWT YCV-M2O-001a3投标委托函（飞利浦）（二级经销商）
    // XSJLTBWT YCV-M2O-001a4销售经理投标委托函
    // TBWT2  YCV-M2O-001a7投标委托函（不出具授权）（二级经销商）
    let arrRrt="";
    let productInformations=this.dataBase;
    if(productInformations&&productInformations.productInformations&&productInformations.productInformations.length>0)
    {
      this.productData=productInformations.productInformations;
    }
    if(this.productData&&this.productData.length>0)
    {
      let arr=[];
      this.productData.map(res=>{
        res.productInformations.map(val=>{
          arr.push(val.productModel)
        })
      })
     arrRrt=arr.join(",")
    }
    const today = new Date();
    const params: any = {};
      params.templateCode = code;
      params.agreementAgenName = this.dataBase.agreementAgenName;
      params.productModel = arrRrt; // productModel
      params.region = this.dataBase.biddingComRegCode;
      params.biddingName = this.dataBase.biddingNames;
      params.tenderNo = this.dataBase.biddingNo;
      params.biddingProName = this.dataBase.biddingName;
      params.dateYear = today.getFullYear();
      params.dateMonth = today.getMonth() + 1;
      params.dateDay = today.getDate();

    // this.router.navigate(['/igt/pdfpreview'], {
    //   skipLocationChange: true,
    //   queryParams: params,
    // });

    console.log(this.dataBase);
    Object.assign(params, this.dataBase);
    if (params.biddingName) {
      params.biddingName = params.biddingName.replace(/\+/g, '%2B');
    }
    if (params.biddingProName) {
      params.biddingProName = params.biddingProName.replace(/\+/g, '%2B');
    }
    if (params.biddingProName) {
      params.biddingN = params.biddingProName.replace(/\+/g, '%2B');
    }
    // productModel为空 给空字符串
    if (params.productModels == null || params.productModels === '') {
      params.productModels = '';
      params.region = '';
    }
    params.dataList = '';
    params.paymentList = '';
    params.productInformations = '';
    params.paymentDescription = '';
    params.region = '';
    params.BMClist = '';
    params.BMCExpert = '';
    params.AppExpert = '';
    this.pdfSRC = params;
    this.isPdf = true;
  }

  ngOnInit() {

    let flag = this.activatedRouter.queryParams['_value'].flag;
    if (flag != undefined && flag != null && flag != '') {
      this.flag = flag;
    }
    else {
      this.flag = 0;
    }
    this.addIsdisble=this.isDisable;
    this.validateForm = this.fb.group({
      businessType: new FormControl({ value: '' }, Validators.required),
      biddingNames:new FormControl({ value: '', disabled: this.isDisable }, Validators.required),
      tenderAuthorization: new FormControl({ value: ''}, Validators.required),
      biddingComRegAddress: new FormControl({ value: '', disabled: true}, Validators.required),
      biddingComRegCode: new FormControl({ value: '', disabled: this.isDisable}, Validators.required),
      agentBidding: new FormControl({ value: '' }, Validators.required),
      biddingDdpState: new FormControl({ value: '', disabled: true}, Validators.required),
      agreementAgenName: new FormControl({ value: '' }, Validators.required),

      logisticsDescription: new FormControl({ value: '', disabled: this.isDisable }, Validators.required),
      afterSalesInstructions: new FormControl({ value: '', disabled: this.isDisable }, Validators.required),
      tenderPriceCurrencys: new FormControl({ value: '', disabled: this.isDisable }, Validators.required),
      tenderPriceCurrency: new FormControl({ value: '', disabled: this.isDisable }, Validators.required),

      percentageTotalPrice: new FormControl({ value: '', disabled: this.isDisable }, null),
      totalPrice: new FormControl({ value: '', disabled: this.isDisable }, null),
      marginLevel: new FormControl({ value: '', disabled: this.isDisable }, null),
      paymentDescription: new FormControl({ value: '', disabled: this.isDisable }, Validators.required),
      paymentDescriptions: new FormControl({ value: '', disabled: this.isDisable }, Validators.required),
      technicalTerms: new FormControl({ value: '', disabled: this.isDisable }, Validators.required),
      legalProvisions: new FormControl({ value: '', disabled: this.isDisable }, Validators.required),
      logisticsTermsExplain: new FormControl({ value: '', disabled: this.isDisable }, Validators.required),
      performanceBonds: new FormControl({ value: '', disabled: this.isDisable }, null),


    });
    this.dataBase.biddingComRegCode = '中国';

  }
  load: any = false;
  addIsdisble:any=true; //控制投标公司地址是否禁用
  // fileList: any = []; //上传招标文件列表
  // fileSealList: any = []; //上传盖章后的文件列表
  // fileAgentList: any = []; //协议代理商出具投标委托函
  flag: any;
  isReadonly: any = false;
  isFlags: any = false;
  pdfSRC: any; //pdf传参
  selectCompy: any = "1"; //投资公司选择
  public radioValues: any = 1;
  public selectedValue: any = 1;
  public isBid: boolean = false; //投标弹出选择代理商;
  public isAgre: boolean = false; //协议商弹出框;
  public isFilloff: boolean = false;  //支持信息
  public isFilloffs: boolean = false; //中标信息
  public stockCode: any = 1; // 业务模型选中值;
  public description: any = ""; //付款方式说明文本框;
  public isPdf:any=false; //打开pdf查看器
  processList: any = [{ name: "中国", value: "中国" },
  { name: "中国香港", value: "中国香港" }];
  public empowerList: any = [];
  logisticsList: any = [];
  public company: any = {
    "nameEn": "",
    "nameCn": "",
  }//代理商
  public agreement: any = {
    "nameEn": "",
    "nameCn": "",
  }; //协议商
  //public models: boolean = true; //是否显示
  public adopt: any = '1';
  public stats: any = [
    { name: '通过', value: '通过' },
    { name: '未通过', value: '未通过' },
    { name: '非飞利浦授权二级经销商', value: '非飞利浦授权二级经销商' }];
  // 业务模式
  public getBusinessModelList () {
    const params = {
      dictGroup: 'BUSINESS_MODEL',
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
      if (rest.code === '0000') {
        this.empowerList = rest.data;
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }
  // 物流条款
  public getLogisticsTermsExplainList () {
    const params = {
      dictGroup: 'WLTKSM',
    };
    this.http.get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`).subscribe(rest => {
      if (rest.code === '0000') {
        this.logisticsList = rest.data;
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }
  // 协议代理商出具投标委托函非二级代理商投标模式无需上传
  beforeAgentUpload = (file: UploadFile): boolean => {
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
    this.upload('fileAgentList', file, 'contractorTenderEntrustmentFileId');
    return false;
  }
  // 协议代理商出具投标委托函 删除回调
  public removeAgentFile = (file: UploadFile): boolean => {
    this.dataBase.contractorTenderEntrustmentFileId = '';
    return true;
  }


  // 上传盖章后的投标申请函
  beforeSealUpload = (file: UploadFile): boolean => {
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
    this.upload('fileSealList', file, 'sealedFileId');
    return false;
  }

  // 盖章后的投标申请函 删除回调
  public removeSealFile = (file: UploadFile): boolean => {
    this.dataBase.sealedFileId = '';
    return true;
  }

  // 招标文件上传
  beforeUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 <100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    this.upload('fileList', file, 'fileId');
    return false;
  }
  // 招标文件删除回调
  public removeFile = (file: UploadFile): boolean => {
    this.dataBase.fileId = '';
    return true;
    // console.log(e);
  }
  /**
   * filist 在线显示的文件 file上传的文件 fileId绑定的上传文件的id
  */
  upload(fileList, file, fileId) {
    this.file_arr[fileList] = [];
    let type = getType(file);
    this.file_arr[fileList].push(file);
    const formData = new FormData();
    this.file_arr[fileList].forEach((file: any) => {
      formData.append('file', file);
      formData.append('fileType', type);
      formData.append('filename', file.name);
    });
    this.load = true;
    const url = "/act/system/upload";
    this.http.posts(url, formData).subscribe((res => {
      if (res.code === "0000") {
        this.load = false;
        this.file_arr[fileList][0].fileId = res.data;
        this.dataBase[fileId] = res.data;
        this.message.create("success", res.msg)
      }
      else {
        this.message.create("error", res.msg)
      }
    }),(error)=>{
      this.load=false;
      this.file_arr[fileList] = [];
      this.message.create("error","上传失败请重新上传!");
    })
  }
  //文件下载
  fileDwon(id)
  {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf("#");
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${id}`;
    window.open(url, '_blank');
  }
 //上传文件下载
  dwonLoad = (file: UploadFile): void => {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf("#");
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${file.fileId}`;
    window.open(url, '_blank');
  };
  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.validateForm.controls.password.value) {
      return { confirm: true, error: true };
    }
    return {};
  };
  checkFormData = () => {

    for (const i in this.validateForm.controls) {
      if (!this.validateForm.controls[i].valid) {
        console.log(i);
      }
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    return this.validateForm.valid;
  }
  changModels() { // 是不否选择二级代理商
   // this.dataBase.biddingDdpState = this.dataBase.agentBidding == "agency" ? '3' : '1';
   // console.log(this.dataBase.agentBidding)
   const agentBidding = this.dataBase.agentBidding;
   if (agentBidding === 'nonagency') {
    this.validateForm.controls.biddingNames.disable();
    this.validateForm.controls.agreementAgenName.disable();
    // this.validateForm.controls.biddingComRegAddress.disable();
     if (this.dataBase.biddingComRegAddress == null || this.dataBase.biddingComRegAddress === '') {
       this.validateForm.controls.biddingComRegAddress.enable();
     } else {
       // this.validateForm.controls.biddingComRegAddress.disable();
     }

    // this.dataBase.agreementAgenName = this.dataBase.biddingNames;
     this.dataBase.biddingComRegAddress = this.agreementAgenNameAddr;
     this.dataBase.biddingNames = this.dataBase.agreementAgenName;

     if (this.ddp_history[this.dataBase.agreementAgenName] != null) {
       this.dataBase.biddingDdpState = this.ddp_history[this.dataBase.agreementAgenName];
       this.mess_ddp = this.mess_ddp_history[this.dataBase.agreementAgenName] == true ? true : false;
     } else if (this.dataBase.agreementAgenName == null || this.dataBase.agreementAgenName === '') {
       this.dataBase.biddingDdpState = null;
     } else {
       // 查询投标公司ddp状态是否通过
       const d = {
         total: 0,
         pageNo: 1,
         pageSize: 5,
         dealerName: this.dataBase.agreementAgenName
       };
       this.getSelAgent(d);
     }
   } else if (agentBidding === 'agency') {
    this.validateForm.controls.biddingNames.enable();
    this.validateForm.controls.agreementAgenName.disable();
    this.validateForm.controls.biddingComRegAddress.enable();
    this.dataBase.biddingDdpState = '非飞利浦授权二级经销商';
    this.mess_ddp = false;
   }
  }
  // 选择支付提示框
  changePayment() {
    let applyType = this.dataBase.applyType;
    let clientType = this.dataBase.clientType;
    let tenderPriceCurrencys = this.dataBase.tenderPriceCurrencys;
    let businessType = this.dataBase.businessType;
    if (applyType == null || applyType == undefined || applyType == '') {
      this.dataBase.paymentDescription = '';
      this.dataBase.paymentList = [];
      this.message.create('error', '请选择招标授权模式');
      return;
    }
    if (clientType == null || clientType == undefined || clientType == '') {
      this.dataBase.paymentDescription = '';
      this.dataBase.paymentList = [];
      this.message.create('error', '请选择客户类型');
      return;
    }
    if (tenderPriceCurrencys == null || tenderPriceCurrencys == undefined || tenderPriceCurrencys == '') {
      this.dataBase.paymentDescription = '';
      this.dataBase.paymentList = [];
      this.message.create('error', '请选择币种');
      return;
    }
    if (businessType == null || businessType == undefined || businessType == '') {
      this.dataBase.paymentDescription = '';
      this.dataBase.paymentList = [];
      this.message.create('error', '请选择业务模式');
      return;
    }
  }
  selectName(param) {
    if (this.dataBase.biddingNames == '飞利浦（中国）投资有限公司') {
      this.dataBase.biddingComRegCode = '中国';
      this.dataBase.biddingComRegAddress = '上海市静安区灵石路718号A1幢';
    } else if (this.dataBase.biddingNames == '飞利浦电子香港有限公司') {
      this.dataBase.biddingComRegCode = '中国香港';
      this.dataBase.biddingComRegAddress = '香港新界沙田香港科學園科技大道東5號5E大樓3樓';
    } else {
      this.dataBase.biddingComRegCode = null;
      this.dataBase.biddingComRegAddress = '';
    }
  }
  prev()//上一步
  {
    this.myEvent.emit("complete-tab"); //传参给父组件;
  }
  next() //下一步
  {
    this.myEvent.emit("complete-record");
  }
  selectChange()  // 业务模式下拉框
  {
    // for (const i in this.validateForm.controls) {
    //   this.validateForm.controls[i].markAsPristine();
    // }

    if (this.dataBase.businessType == 'DISTRIBUTOR') {
    //  this.dataBase.tenderAuthorization='nonprivate';
      //是否二级代理商是的时候不禁用.否的时候禁用
      this.validateForm.controls.biddingComRegCode.enable();
      if(this.dataBase.agentBidding=='agency')
      {
        this.validateForm.controls.biddingComRegCode.enable();
        this.validateForm.controls.biddingComRegAddress.enable();
      }
      else if(this.dataBase.agentBidding=='nonagency')
      {
        // this.validateForm.controls.biddingComRegCode.disable();
        // this.validateForm.controls.biddingComRegAddress.disable();
        if (this.dataBase.biddingComRegAddress == null || this.dataBase.biddingComRegAddress === '') {
          this.validateForm.controls.biddingComRegAddress.enable();
        } else {
          // this.validateForm.controls.biddingComRegAddress.disable();
        }
      }
      this.validateForm.get('agreementAgenName')!.setValidators(Validators.required);
      //this.validateForm.get('agreementAgenName')!.markAsDirty();

      // 是否需要投标授权 选"是"的时候   验证一下字段
      if (this.dataBase.tenderAuthorization === 'nonprivate') {
        this.validateForm.get('biddingDdpState')!.setValidators(Validators.required);
      //  this.validateForm.get('biddingDdpState')!.markAsDirty();
        this.validateForm.get('agentBidding')!.setValidators(Validators.required);
       // this.validateForm.get('agentBidding')!.markAsDirty();
        this.validateForm.get('biddingNames')!.setValidators(Validators.required);
       // this.validateForm.get('biddingNames')!.markAsDirty();
        this.validateForm.get('biddingComRegAddress')!.setValidators(Validators.required);
       // this.validateForm.get('biddingComRegAddress')!.markAsDirty();
        this.validateForm.get('biddingComRegCode')!.setValidators(Validators.required);
       // this.validateForm.get('biddingComRegCode')!.markAsDirty();
        //  清空字段验证
        this.validateForm.get('logisticsDescription')!.clearValidators(); // logisticsDescription 物流条款说明
        this.validateForm.get('logisticsDescription')!.markAsPristine();
        this.validateForm.get('logisticsTermsExplain')!.clearValidators(); // logisticsTermsExplain 物流条款说明2
        this.validateForm.get('logisticsTermsExplain')!.markAsPristine();
        this.validateForm.get('afterSalesInstructions')!.clearValidators(); // afterSalesInstructions 售后维修条款说明
        this.validateForm.get('afterSalesInstructions')!.markAsPristine();
        this.validateForm.get('tenderPriceCurrencys')!.clearValidators(); // tenderPriceCurrencys 投标保证金及履约保证金额说明
        this.validateForm.get('tenderPriceCurrencys')!.markAsPristine();
        this.validateForm.get('tenderPriceCurrency')!.clearValidators(); // tenderPriceCurrency
        this.validateForm.get('tenderPriceCurrency')!.markAsPristine();

        // this.validateForm.get('percentageTotalPrice')!.clearValidators(); // percentageTotalPrice
        // this.validateForm.get('percentageTotalPrice')!.markAsPristine();
        // this.validateForm.get('totalPrice')!.clearValidators(); // totalPrice
        // this.validateForm.get('totalPrice')!.markAsPristine();
        // this.validateForm.get('marginLevel')!.clearValidators(); // marginLevel
        // this.validateForm.get('marginLevel')!.markAsPristine();
        this.validateForm.get('paymentDescription')!.clearValidators(); // paymentDescription
        this.validateForm.get('paymentDescription')!.markAsPristine();
        this.validateForm.get('paymentDescriptions')!.clearValidators(); // paymentDescriptions
        this.validateForm.get('paymentDescriptions')!.markAsPristine();
        this.validateForm.get('technicalTerms')!.clearValidators(); // technicalTerms
        this.validateForm.get('technicalTerms')!.markAsPristine();
        this.validateForm.get('legalProvisions')!.clearValidators(); // legalProvisions
        this.validateForm.get('legalProvisions')!.markAsPristine();
        this.redstar = false;
      }
      else
      {
        this.validateForm.get('biddingDdpState')!.clearValidators();
        this.validateForm.get('biddingDdpState')!.markAsPristine();
        // this.validateForm.get('agreementAgenName')!.clearValidators();
        // this.validateForm.get('agreementAgenName')!.markAsPristine();
        this.validateForm.get('agentBidding')!.clearValidators();
        this.validateForm.get('agentBidding')!.markAsPristine();
        this.validateForm.get('biddingNames')!.clearValidators();
        this.validateForm.get('biddingNames')!.markAsPristine();
        this.validateForm.get('biddingComRegAddress')!.clearValidators();
        this.validateForm.get('biddingComRegAddress')!.markAsPristine();
        this.validateForm.get('biddingComRegCode')!.clearValidators();
        this.validateForm.get('biddingComRegCode')!.markAsPristine();

      }
      this.validateForm.get('biddingDdpState')!.updateValueAndValidity(); //ddp状态
        this.validateForm.get('agreementAgenName')!.updateValueAndValidity(); //代理商名称
        this.validateForm.get('agentBidding')!.updateValueAndValidity();    //是否二级代理商
        this.validateForm.get('biddingNames')!.updateValueAndValidity();  //投标公司名称
        this.validateForm.get('biddingComRegAddress')!.updateValueAndValidity(); //投标公司名称地址
        this.validateForm.get('biddingComRegCode')!.updateValueAndValidity(); //投标公司所在地
        this.validateForm.get('logisticsDescription')!.updateValueAndValidity(); // logisticsDescription 物流条款说明
      this.validateForm.get('logisticsTermsExplain')!.updateValueAndValidity(); // logisticsTermsExplain 物流条款说明2
        this.validateForm.get('afterSalesInstructions')!.updateValueAndValidity(); // afterSalesInstructions 售后维修条款说明
        this.validateForm.get('tenderPriceCurrencys')!.updateValueAndValidity(); // tenderPriceCurrencys 投标保证金及履约保证金额说明
        this.validateForm.get('tenderPriceCurrency')!.updateValueAndValidity(); // tenderPriceCurrency
        // this.validateForm.get('percentageTotalPrice')!.updateValueAndValidity(); // percentageTotalPrice
        // this.validateForm.get('totalPrice')!.updateValueAndValidity(); // totalPrice
        // this.validateForm.get('marginLevel')!.updateValueAndValidity(); // marginLevel
        this.validateForm.get('paymentDescription')!.updateValueAndValidity(); // paymentDescription
        this.validateForm.get('paymentDescriptions')!.updateValueAndValidity(); // paymentDescriptions
        this.validateForm.get('technicalTerms')!.updateValueAndValidity(); // technicalTerms
        this.validateForm.get('legalProvisions')!.updateValueAndValidity(); // legalProvisions
        //区别是基础和补充页传的改变
        if(this.dataBase.change)
        {
          this.dataBase.biddingNames="";
          // this.dataBase.biddingComRegAddress="";
          // this.dataBase.biddingComRegCode="";
        }
      this.dataBase.change=true;
      this.addIsdisble=false;
      this.paymentMethod();

      this.dataBase.biddingComRegCode = '中国';
    }
    else {
      // 是否需要投标授权 选"是"的时候   验证一下字段
      //是否二级代理商是的时候不禁用.否的时候禁用
      // this.dataBase.tenderAuthorization='private';
      this.validateForm.controls.biddingComRegCode.disable();
      // this.validateForm.controls.biddingComRegAddress.disable();
      this.validateForm.controls.biddingNames.enable();
      this.validateForm.get('agreementAgenName')!.clearValidators();
      this.validateForm.get('agreementAgenName')!.markAsPristine();
      this.validateForm.get('biddingDdpState')!.clearValidators();
      this.validateForm.get('biddingDdpState')!.markAsPristine();
      if (this.dataBase.tenderAuthorization === 'nonprivate') {
        this.validateForm.get('biddingNames')!.setValidators(Validators.required);
      //  this.validateForm.get('biddingNames')!.markAsDirty();
        this.validateForm.get('biddingComRegAddress')!.setValidators(Validators.required);
       // this.validateForm.get('biddingComRegAddress')!.markAsDirty();
        this.validateForm.get('biddingComRegCode')!.setValidators(Validators.required);
       // this.validateForm.get('biddingComRegCode')!.markAsDirty();
         //
         this.validateForm.get('logisticsDescription')!.setValidators(Validators.required); // logisticsDescription 物流条款说明
        this.validateForm.get('logisticsTermsExplain')!.setValidators(Validators.required); // logisticsTermsExplain 物流条款说明2
         this.validateForm.get('afterSalesInstructions')!.setValidators(Validators.required); // afterSalesInstructions 售后维修条款说明
         this.validateForm.get('tenderPriceCurrencys')!.setValidators(Validators.required); // tenderPriceCurrencys 投标保证金及履约保证金额说明
         this.validateForm.get('tenderPriceCurrency')!.setValidators(Validators.required); // tenderPriceCurrency

         // this.validateForm.get('percentageTotalPrice')!.setValidators(Validators.required);// percentageTotalPrice
         // this.validateForm.get('totalPrice')!.setValidators(Validators.required);// totalPrice
         // this.validateForm.get('marginLevel')!.setValidators(Validators.required);// marginLevel
         this.validateForm.get('paymentDescription')!.setValidators(Validators.required);// paymentDescription 付款方式说明
         this.validateForm.get('paymentDescriptions')!.setValidators(Validators.required);// paymentDescriptions 付款方式说明备注
         this.validateForm.get('technicalTerms')!.setValidators(Validators.required);// technicalTerms 技术条款说明
         this.validateForm.get('legalProvisions')!.setValidators(Validators.required);// legalProvisions 涉及法律条款说明
         this.redstar = true;
      }
      else
      {
        this.validateForm.get('agentBidding')!.clearValidators();
        this.validateForm.get('agentBidding')!.markAsPristine();
        this.validateForm.get('biddingNames')!.clearValidators();
        this.validateForm.get('biddingNames')!.markAsPristine();
        this.validateForm.get('biddingComRegAddress')!.clearValidators();
        this.validateForm.get('biddingComRegAddress')!.markAsPristine();
        this.validateForm.get('biddingComRegCode')!.clearValidators();
        this.validateForm.get('biddingComRegCode')!.markAsPristine();

         //  清空字段验证
         this.validateForm.get('logisticsDescription')!.clearValidators(); // logisticsDescription 物流条款说明
         this.validateForm.get('logisticsDescription')!.markAsPristine();
        this.validateForm.get('logisticsTermsExplain')!.clearValidators(); // logisticsTermsExplain 物流条款说明
        this.validateForm.get('logisticsTermsExplain')!.markAsPristine();
         this.validateForm.get('afterSalesInstructions')!.clearValidators(); // afterSalesInstructions 售后维修条款说明
         this.validateForm.get('afterSalesInstructions')!.markAsPristine();
         this.validateForm.get('tenderPriceCurrencys')!.clearValidators(); // tenderPriceCurrencys 投标保证金及履约保证金额说明
         this.validateForm.get('tenderPriceCurrencys')!.markAsPristine();
         this.validateForm.get('tenderPriceCurrency')!.clearValidators(); // tenderPriceCurrency
         this.validateForm.get('tenderPriceCurrency')!.markAsPristine();

         // this.validateForm.get('percentageTotalPrice')!.clearValidators(); // percentageTotalPrice
         // this.validateForm.get('percentageTotalPrice')!.markAsPristine();
         // this.validateForm.get('totalPrice')!.clearValidators(); // totalPrice
         // this.validateForm.get('totalPrice')!.markAsPristine();
         // this.validateForm.get('marginLevel')!.clearValidators(); // marginLevel
         // this.validateForm.get('marginLevel')!.markAsPristine();
         this.validateForm.get('paymentDescription')!.clearValidators(); // paymentDescription
         this.validateForm.get('paymentDescription')!.markAsPristine();
         this.validateForm.get('paymentDescriptions')!.clearValidators(); // paymentDescriptions
         this.validateForm.get('paymentDescriptions')!.markAsPristine();
         this.validateForm.get('technicalTerms')!.clearValidators(); // technicalTerms
         this.validateForm.get('technicalTerms')!.markAsPristine();
         this.validateForm.get('legalProvisions')!.clearValidators(); // legalProvisions
         this.validateForm.get('legalProvisions')!.markAsPristine();
         this.redstar = false;
      }
      this.validateForm.get('biddingDdpState')!.updateValueAndValidity(); //ddp状态
        this.validateForm.get('agreementAgenName')!.updateValueAndValidity(); //代理商名称
        this.validateForm.get('agentBidding')!.updateValueAndValidity();    //是否二级代理商
        this.validateForm.get('biddingNames')!.updateValueAndValidity();  //投标公司名称
        this.validateForm.get('biddingComRegAddress')!.updateValueAndValidity(); //投标公司名称地址
        this.validateForm.get('biddingComRegCode')!.updateValueAndValidity(); //投标公司所在地
        this.validateForm.get('logisticsDescription')!.updateValueAndValidity(); // logisticsDescription 物流条款说明
      this.validateForm.get('logisticsTermsExplain')!.updateValueAndValidity(); // logisticsTermsExplain 物流条款说明2
        this.validateForm.get('afterSalesInstructions')!.updateValueAndValidity(); // afterSalesInstructions 售后维修条款说明
        this.validateForm.get('tenderPriceCurrencys')!.updateValueAndValidity(); // tenderPriceCurrencys 投标保证金及履约保证金额说明
        this.validateForm.get('tenderPriceCurrency')!.updateValueAndValidity(); // tenderPriceCurrency
        // this.validateForm.get('percentageTotalPrice')!.updateValueAndValidity(); // percentageTotalPrice
        // this.validateForm.get('totalPrice')!.updateValueAndValidity(); // totalPrice
        // this.validateForm.get('marginLevel')!.updateValueAndValidity(); // marginLevel
        this.validateForm.get('paymentDescription')!.updateValueAndValidity(); // paymentDescription
        this.validateForm.get('paymentDescriptions')!.updateValueAndValidity(); // paymentDescriptions
        this.validateForm.get('technicalTerms')!.updateValueAndValidity(); // technicalTerms
        this.validateForm.get('legalProvisions')!.updateValueAndValidity(); // legalProvisions
      //区别是基础和补充页传的改变
      if(this.dataBase.change)
      {
        this.dataBase.biddingNames=null;
        // this.dataBase.biddingComRegAddress="";
        // this.dataBase.biddingComRegCode=null;
      }
      this.dataBase.change=true;
      this.addIsdisble=true;
      this.paymentMethod();
    }
    // 是否需要投标授权 选"是"的时候   验证一下字段
    // if (this.dataBase.tenderAuthorization === 'nonprivate') {
    //   this.validateForm.get('biddingDdpState')!.updateValueAndValidity();
    //   this.validateForm.get('agreementAgenName')!.updateValueAndValidity();
    // }
    // this.validateForm.get('agentBidding')!.updateValueAndValidity();


  }
  // 是否需要投标授权 改变监听
  changeRad (param) {
    // for (const i in this.validateForm.controls) {
    //   this.validateForm.controls[i].markAsPristine();
    // }
    if(this.dataBase.businessType=='DISTRIBUTOR')
    {
            // 是否需要投标授权 选"是"的时候   验证一下字段
        if (this.dataBase.tenderAuthorization === 'nonprivate')
        {
          this.validateForm.get('biddingDdpState')!.setValidators(Validators.required);
        //  this.validateForm.get('biddingDdpState')!.markAsDirty();
          this.validateForm.get('agreementAgenName')!.setValidators(Validators.required);
         // this.validateForm.get('agreementAgenName')!.markAsDirty();
          this.validateForm.get('agentBidding')!.setValidators(Validators.required);
         // this.validateForm.get('agentBidding')!.markAsDirty();
          this.validateForm.get('biddingNames')!.setValidators(Validators.required);
         // this.validateForm.get('biddingNames')!.markAsDirty();
          this.validateForm.get('biddingComRegAddress')!.setValidators(Validators.required);
         // this.validateForm.get('biddingComRegAddress')!.markAsDirty();
          this.validateForm.get('biddingComRegCode')!.setValidators(Validators.required);
        //  this.validateForm.get('biddingComRegCode')!.markAsDirty();
            //  清空字段验证
            this.validateForm.get('logisticsDescription')!.clearValidators(); // logisticsDescription 物流条款说明
            this.validateForm.get('logisticsDescription')!.markAsPristine();
          this.validateForm.get('logisticsTermsExplain')!.clearValidators(); // logisticsTermsExplain 物流条款说明2
          this.validateForm.get('logisticsTermsExplain')!.markAsPristine();
            this.validateForm.get('afterSalesInstructions')!.clearValidators(); // afterSalesInstructions 售后维修条款说明
            this.validateForm.get('afterSalesInstructions')!.markAsPristine();
            this.validateForm.get('tenderPriceCurrencys')!.clearValidators(); // tenderPriceCurrencys 投标保证金及履约保证金额说明
            this.validateForm.get('tenderPriceCurrencys')!.markAsPristine();
            this.validateForm.get('tenderPriceCurrency')!.clearValidators(); // tenderPriceCurrency
            this.validateForm.get('tenderPriceCurrency')!.markAsPristine();

            // this.validateForm.get('percentageTotalPrice')!.clearValidators(); // percentageTotalPrice
            // this.validateForm.get('percentageTotalPrice')!.markAsPristine();
            // this.validateForm.get('totalPrice')!.clearValidators(); // totalPrice
            // this.validateForm.get('totalPrice')!.markAsPristine();
            // this.validateForm.get('marginLevel')!.clearValidators(); // marginLevel
            // this.validateForm.get('marginLevel')!.markAsPristine();
            this.validateForm.get('paymentDescription')!.clearValidators(); // paymentDescription
            this.validateForm.get('paymentDescription')!.markAsPristine();
            this.validateForm.get('paymentDescriptions')!.clearValidators(); // paymentDescriptions
            this.validateForm.get('paymentDescriptions')!.markAsPristine();
            this.validateForm.get('technicalTerms')!.clearValidators(); // technicalTerms
            this.validateForm.get('technicalTerms')!.markAsPristine();
            this.validateForm.get('legalProvisions')!.clearValidators(); // legalProvisions
            this.validateForm.get('legalProvisions')!.markAsPristine();
            this.redstar = false;

        }
        else
        {
          this.validateForm.get('biddingDdpState')!.clearValidators();
          this.validateForm.get('biddingDdpState')!.markAsPristine();
          // this.validateForm.get('agreementAgenName')!.clearValidators();
          // this.validateForm.get('agreementAgenName')!.markAsPristine();
          this.validateForm.get('agentBidding')!.clearValidators();
          this.validateForm.get('agentBidding')!.markAsPristine();
          this.validateForm.get('biddingNames')!.clearValidators();
          this.validateForm.get('biddingNames')!.markAsPristine();
          this.validateForm.get('biddingComRegAddress')!.clearValidators();
          this.validateForm.get('biddingComRegAddress')!.markAsPristine();
          this.validateForm.get('biddingComRegCode')!.clearValidators();
          this.validateForm.get('biddingComRegCode')!.markAsPristine();
          //  清空字段验证
        this.validateForm.get('logisticsDescription')!.clearValidators(); // logisticsDescription 物流条款说明
        this.validateForm.get('logisticsDescription')!.markAsPristine();
          this.validateForm.get('logisticsTermsExplain')!.clearValidators(); // logisticsTermsExplain 物流条款说明
          this.validateForm.get('logisticsTermsExplain')!.markAsPristine();
        this.validateForm.get('afterSalesInstructions')!.clearValidators(); // afterSalesInstructions 售后维修条款说明
        this.validateForm.get('afterSalesInstructions')!.markAsPristine();
        this.validateForm.get('tenderPriceCurrencys')!.clearValidators(); // tenderPriceCurrencys 投标保证金及履约保证金额说明
        this.validateForm.get('tenderPriceCurrencys')!.markAsPristine();
        this.validateForm.get('tenderPriceCurrency')!.clearValidators(); // tenderPriceCurrency
        this.validateForm.get('tenderPriceCurrency')!.markAsPristine();

        // this.validateForm.get('percentageTotalPrice')!.clearValidators(); // percentageTotalPrice
        // this.validateForm.get('percentageTotalPrice')!.markAsPristine();
        // this.validateForm.get('totalPrice')!.clearValidators(); // totalPrice
        // this.validateForm.get('totalPrice')!.markAsPristine();
        // this.validateForm.get('marginLevel')!.clearValidators(); // marginLevel
        // this.validateForm.get('marginLevel')!.markAsPristine();
        this.validateForm.get('paymentDescription')!.clearValidators(); // paymentDescription
        this.validateForm.get('paymentDescription')!.markAsPristine();
        this.validateForm.get('paymentDescriptions')!.clearValidators(); // paymentDescriptions
        this.validateForm.get('paymentDescriptions')!.markAsPristine();
        this.validateForm.get('technicalTerms')!.clearValidators(); // technicalTerms
        this.validateForm.get('technicalTerms')!.markAsPristine();
        this.validateForm.get('legalProvisions')!.clearValidators(); // legalProvisions
        this.validateForm.get('legalProvisions')!.markAsPristine();
        this.redstar = false;

        }
        this.validateForm.get('biddingDdpState')!.updateValueAndValidity(); //ddp状态
        this.validateForm.get('agreementAgenName')!.updateValueAndValidity(); //代理商名称
        this.validateForm.get('agentBidding')!.updateValueAndValidity();    //是否二级代理商
        this.validateForm.get('biddingNames')!.updateValueAndValidity();  //投标公司名称
        this.validateForm.get('biddingComRegAddress')!.updateValueAndValidity(); //投标公司名称地址
        this.validateForm.get('biddingComRegCode')!.updateValueAndValidity(); //投标公司所在地
        this.validateForm.get('logisticsDescription')!.updateValueAndValidity(); // logisticsDescription 物流条款说明
      this.validateForm.get('logisticsTermsExplain')!.updateValueAndValidity(); // logisticsTermsExplain 物流条款说明2
        this.validateForm.get('afterSalesInstructions')!.updateValueAndValidity(); // afterSalesInstructions 售后维修条款说明
        this.validateForm.get('tenderPriceCurrencys')!.updateValueAndValidity(); // tenderPriceCurrencys 投标保证金及履约保证金额说明
        this.validateForm.get('tenderPriceCurrency')!.updateValueAndValidity(); // tenderPriceCurrency
        // this.validateForm.get('percentageTotalPrice')!.updateValueAndValidity(); // percentageTotalPrice
        // this.validateForm.get('totalPrice')!.updateValueAndValidity(); // totalPrice
        // this.validateForm.get('marginLevel')!.updateValueAndValidity(); // marginLevel
        this.validateForm.get('paymentDescription')!.updateValueAndValidity(); // paymentDescription
        this.validateForm.get('paymentDescriptions')!.updateValueAndValidity(); // paymentDescriptions
        this.validateForm.get('technicalTerms')!.updateValueAndValidity(); // technicalTerms
        this.validateForm.get('legalProvisions')!.updateValueAndValidity(); // legalProvisions
   }
   else
   {
     this.validateForm.get('agreementAgenName')!.clearValidators();
     this.validateForm.get('agreementAgenName')!.markAsPristine();
     this.validateForm.get('biddingDdpState')!.clearValidators();
     this.validateForm.get('biddingDdpState')!.markAsPristine();
      if (this.dataBase.tenderAuthorization === 'nonprivate') {
        this.validateForm.get('biddingNames')!.setValidators(Validators.required);
        //this.validateForm.get('biddingNames')!.markAsDirty();
        this.validateForm.get('biddingComRegAddress')!.setValidators(Validators.required);
        //this.validateForm.get('biddingComRegAddress')!.markAsDirty();
        this.validateForm.get('biddingComRegCode')!.setValidators(Validators.required);
        //this.validateForm.get('biddingComRegCode')!.markAsDirty();

        //
        this.validateForm.get('logisticsDescription')!.setValidators(Validators.required); // logisticsDescription 物流条款说明
        this.validateForm.get('logisticsTermsExplain')!.setValidators(Validators.required); // logisticsTermsExplain 物流条款说明2
        this.validateForm.get('afterSalesInstructions')!.setValidators(Validators.required); // afterSalesInstructions 售后维修条款说明
        this.validateForm.get('tenderPriceCurrencys')!.setValidators(Validators.required); // tenderPriceCurrencys 投标保证金及履约保证金额说明
        this.validateForm.get('tenderPriceCurrency')!.setValidators(Validators.required); // tenderPriceCurrency

        // this.validateForm.get('percentageTotalPrice')!.setValidators(Validators.required);// percentageTotalPrice
        // this.validateForm.get('totalPrice')!.setValidators(Validators.required);// totalPrice
        // this.validateForm.get('marginLevel')!.setValidators(Validators.required);// marginLevel
        this.validateForm.get('paymentDescription')!.setValidators(Validators.required);// paymentDescription 付款方式说明
        this.validateForm.get('paymentDescriptions')!.setValidators(Validators.required);// paymentDescriptions 付款方式说明备注
        this.validateForm.get('technicalTerms')!.setValidators(Validators.required);// technicalTerms 技术条款说明
        this.validateForm.get('legalProvisions')!.setValidators(Validators.required);// legalProvisions 涉及法律条款说明
        this.redstar = true;
      }
      else
      {
        // this.validateForm.get('agreementAgenName')!.clearValidators();
        // this.validateForm.get('agreementAgenName')!.markAsPristine();
        this.validateForm.get('agentBidding')!.clearValidators();
        this.validateForm.get('agentBidding')!.markAsPristine();
        this.validateForm.get('biddingNames')!.clearValidators();
        this.validateForm.get('biddingNames')!.markAsPristine();
        this.validateForm.get('biddingComRegAddress')!.clearValidators();
        this.validateForm.get('biddingComRegAddress')!.markAsPristine();
        this.validateForm.get('biddingComRegCode')!.clearValidators();
        this.validateForm.get('biddingComRegCode')!.markAsPristine();


        //  清空字段验证
        this.validateForm.get('logisticsDescription')!.clearValidators(); // logisticsDescription 物流条款说明
        this.validateForm.get('logisticsDescription')!.markAsPristine();
        this.validateForm.get('logisticsTermsExplain')!.clearValidators(); // logisticsTermsExplain 物流条款说明
        this.validateForm.get('logisticsTermsExplain')!.markAsPristine();
        this.validateForm.get('afterSalesInstructions')!.clearValidators(); // afterSalesInstructions 售后维修条款说明
        this.validateForm.get('afterSalesInstructions')!.markAsPristine();
        this.validateForm.get('tenderPriceCurrencys')!.clearValidators(); // tenderPriceCurrencys 投标保证金及履约保证金额说明
        this.validateForm.get('tenderPriceCurrencys')!.markAsPristine();
        this.validateForm.get('tenderPriceCurrency')!.clearValidators(); // tenderPriceCurrency
        this.validateForm.get('tenderPriceCurrency')!.markAsPristine();

        // this.validateForm.get('percentageTotalPrice')!.clearValidators(); // percentageTotalPrice
        // this.validateForm.get('percentageTotalPrice')!.markAsPristine();
        // this.validateForm.get('totalPrice')!.clearValidators(); // totalPrice
        // this.validateForm.get('totalPrice')!.markAsPristine();
        // this.validateForm.get('marginLevel')!.clearValidators(); // marginLevel
        // this.validateForm.get('marginLevel')!.markAsPristine();
        this.validateForm.get('paymentDescription')!.clearValidators(); // paymentDescription
        this.validateForm.get('paymentDescription')!.markAsPristine();
        this.validateForm.get('paymentDescriptions')!.clearValidators(); // paymentDescriptions
        this.validateForm.get('paymentDescriptions')!.markAsPristine();
        this.validateForm.get('technicalTerms')!.clearValidators(); // technicalTerms
        this.validateForm.get('technicalTerms')!.markAsPristine();
        this.validateForm.get('legalProvisions')!.clearValidators(); // legalProvisions
        this.validateForm.get('legalProvisions')!.markAsPristine();
        this.redstar = false;
      }
        this.validateForm.get('biddingDdpState')!.updateValueAndValidity(); //ddp状态
        this.validateForm.get('agreementAgenName')!.updateValueAndValidity(); //代理商名称
        this.validateForm.get('agentBidding')!.updateValueAndValidity();    //是否二级代理商
        this.validateForm.get('biddingNames')!.updateValueAndValidity();  //投标公司名称
        this.validateForm.get('biddingComRegAddress')!.updateValueAndValidity(); //投标公司名称地址
        this.validateForm.get('biddingComRegCode')!.updateValueAndValidity(); //投标公司所在地
        this.validateForm.get('logisticsDescription')!.updateValueAndValidity(); // logisticsDescription 物流条款说明
     this.validateForm.get('logisticsTermsExplain')!.updateValueAndValidity(); // logisticsTermsExplain 物流条款说明
        this.validateForm.get('afterSalesInstructions')!.updateValueAndValidity(); // afterSalesInstructions 售后维修条款说明
        this.validateForm.get('tenderPriceCurrencys')!.updateValueAndValidity(); // tenderPriceCurrencys 投标保证金及履约保证金额说明
        this.validateForm.get('tenderPriceCurrency')!.updateValueAndValidity(); // tenderPriceCurrency
        // this.validateForm.get('percentageTotalPrice')!.updateValueAndValidity(); // percentageTotalPrice
        // this.validateForm.get('totalPrice')!.updateValueAndValidity(); // totalPrice
        // this.validateForm.get('marginLevel')!.updateValueAndValidity(); // marginLevel
        this.validateForm.get('paymentDescription')!.updateValueAndValidity(); // paymentDescription
        this.validateForm.get('paymentDescriptions')!.updateValueAndValidity(); // paymentDescriptions
        this.validateForm.get('technicalTerms')!.updateValueAndValidity(); // technicalTerms
        this.validateForm.get('legalProvisions')!.updateValueAndValidity(); // legalProvisions
   }
  }
  //弹出协议商选择弹出框
  showAgre() {
    this.isAgre = true;
  }
  //取消弹窗
  isAgreCancel() {
    this.isAgre = false;
  }
  //选择代理商确定
  isAgregentOk() {

    console.log(1);
    let arr = this.child2.selectFind();
    //this.agreement.nameEn = arr[0].nameEn;
    // this.dataBase.agreementAgenName = arr[0].dealerName;

    this.dataBase.agreementAgenName = arr[0].dealerName;
    if (this.dataBase.agentBidding === 'nonagency') {
      this.dataBase.biddingNames = arr[0].dealerName;
    }
    if (arr[0].ddpStatus === '通过' && this.dataBase && this.dataBase.agentBidding === 'nonagency') {
      this.dataBase.biddingDdpState = arr[0].ddpStatus;
    } else if ( arr[0].ddpStatus !== '通过' && this.dataBase && this.dataBase.agentBidding === 'nonagency') {
      this.dataBase.biddingDdpState = '未通过';
    }
    if (arr[0].ddpStatus == null || arr[0].ddpStatus === '') {
      this.mess_ddp = true;
      this.mess_ddp_history[arr[0].dealerName] = true;
    } else {
      this.mess_ddp = false;
      this.mess_ddp_history[arr[0].dealerName] = false;
    }
    if (this.dataBase.agentBidding !== 'agency') {
      this.dataBase.biddingComRegAddress = arr[0].registeredAddress;
      if (this.dataBase.biddingComRegAddress == null || this.dataBase.biddingComRegAddress === '') {
        this.validateForm.controls.biddingComRegAddress.enable();
      } else {
        // this.validateForm.controls.biddingComRegAddress.disable();
      }
    } else {
      this.agreementAgenNameAddr = arr[0].registeredAddress;
      if (this.dataBase.biddingComRegAddress == null || this.dataBase.biddingComRegAddress === '') {
        this.validateForm.controls.biddingComRegAddress.enable();
      } else {
        // this.validateForm.controls.biddingComRegAddress.disable();
      }
    }
    // this.dataBase.biddingComRegCode=arr[0].registeredAddress;

    // 记录ddp历史状态
    this.ddp_history[arr[0].dealerName] = arr[0].ddpStatus === '通过' ? '通过' : '未通过';


    this.isBid = false;
    this.isAgre = false;

    if (arr[0].authorizedProduct == null) {
      this.dataBase.productModels = '';
    } else {
      this.dataBase.productModels = arr[0].authorizedProduct;
    }
    if (arr[0].authorizedArea == null) {
      this.dataBase.region = '';
    } else {
      this.dataBase.region = arr[0].authorizedArea;
    }

    // this.getSelAgent({
    //   total: 0,
    //   pageNo: 1,
    //   pageSize: 5,
    //   dealerName: this.dataBase.agreementAgenName
    // });
  }



  //弹出投标选择代理商
  showAgent() {
    this.isBid = true;
    this.params=Object(this.params);
  }
  //取消弹窗
  isBidCancel() {
    this.isBid = false;
  }
  //选择代理商确定
  isBidagentOk() {
    let arr = this.child1.selectFind();
    //this.company.nameEn = arr[0].nameEn;
    //this.company.nameCn = arr[0].nameCn;
    this.dataBase.biddingNames = arr[0].dealerName;
    // if (arr[0].ddpStatus === '通过' && this.dataBase && this.dataBase.agentBidding === 'nonagency') {
    //   this.dataBase.biddingDdpState = arr[0].ddpStatus;
    // } else if ( arr[0].ddpStatus !== '通过' && this.dataBase && this.dataBase.agentBidding === 'nonagency') {
    //   this.dataBase.biddingDdpState = '未通过';
    // }
    // if (arr[0].ddpStatus == null || arr[0].ddpStatus === '') {
    //   this.mess_ddp = true;
    //   this.mess_ddp_history[arr[0].dealerName] = true;
    // } else {
    //   this.mess_ddp = false;
    //   this.mess_ddp_history[arr[0].dealerName] = false;
    // }
    const agentBidding=this.dataBase.agentBidding;
    agentBidding==='nonagency'&&(this.dataBase.agreementAgenName=this.dataBase.biddingNames);
    this.dataBase.biddingComRegAddress = arr[0].registeredAddress;
    if (this.dataBase.biddingComRegAddress == null || this.dataBase.biddingComRegAddress === '') {
      this.validateForm.controls.biddingComRegAddress.enable();
    } else {
      // this.validateForm.controls.biddingComRegAddress.disable();
    }
    // this.dataBase.biddingComRegCode=arr[0].registeredAddress;

    // 记录ddp历史状态
    // this.ddp_history[arr[0].dealerName] = arr[0].ddpStatus === '通过' ? '通过' : '未通过';

    this.isBid = false;
  }
  //填写中标信息
  showFills() {
    this.isFilloffs = true;
  }
  fillCancels() {
    this.isFilloffs = false;
  }
  fillOks() {
    this.isFilloffs = false;
  }

  //填写支持信息弹出窗口
  showFill() {
    this.isFilloff = true;
  }
  fillCancel() {
    this.isFilloff = false;
  }
  fillOk() {
    this.isFilloff = false;
  }
  //币制选择
  selectTenderPrice(param)
  {
    this.dataBase.tenderPriceCurrencys=param;
    this.paymentMethod();
  }

  //支付方式的组合模式
public paymentMethod(){
  const params = {
    dictGroup:'',
  };
  let applyType=this.dataBase.applyType;
  let clientType=this.dataBase.clientType;
  let tenderPriceCurrencys=this.dataBase.tenderPriceCurrencys;
  let businessType=this.dataBase.businessType;
  if(applyType&&clientType&&tenderPriceCurrencys&&businessType)
  {
      if(applyType=='BIDDING'&&businessType=='DIRECT'&&tenderPriceCurrencys=='CNY'&&clientType=='公立医院')
      {
           params.dictGroup='BDCG';
           //this.dataBase.paymentDescription="";
      }
      else if(applyType=='BIDDING'&&businessType=='DIRECT'&&tenderPriceCurrencys=='USD'&&clientType=='公立医院')
      {
        params.dictGroup='BDUM';
        //this.dataBase.paymentDescription="";
      }
      else if(applyType=='BIDDING'&&businessType=='DIRECT'&&tenderPriceCurrencys=='CNY'&&clientType=='民营医院')
      {
        params.dictGroup='BDCM';
        //this.dataBase.paymentDescription="";
      }
      else if(applyType=='BIDDING'&&businessType=='DIRECT'&&tenderPriceCurrencys=='USD'&&clientType=='民营医院')
      {
        params.dictGroup='BDUG';
        //this.dataBase.paymentDescription="";
      }
      else if(applyType=='BIDDING'&&businessType=='DISTRIBUTOR'&&tenderPriceCurrencys=='USD'&&clientType=='民营医院')
      {
        params.dictGroup='BDisUM';
        //this.dataBase.paymentDescription="";
      }
      else if(applyType=='BIDDING'&&businessType=='DISTRIBUTOR'&&tenderPriceCurrencys=='CNY'&&clientType=='民营医院')
      {
        params.dictGroup='BDisCM';
        //this.dataBase.paymentDescription="";
      }
      else if(applyType=='BIDDING'&&businessType=='DISTRIBUTOR'&&tenderPriceCurrencys=='USD'&&clientType=='公立医院')
      {
        params.dictGroup='BDisUG';
        //this.dataBase.paymentDescription="";
      }
      else if(applyType=='BIDDING'&&businessType=='DISTRIBUTOR'&&tenderPriceCurrencys=='CNY'&&clientType=='公立医院')
      {
        params.dictGroup='BDisCG';
        //this.dataBase.paymentDescription="";
      }
      else if(applyType=='BIDDING'&&businessType=='DIRECT'&&tenderPriceCurrencys=='CNY'&&clientType=='其他')
      {
        params.dictGroup='BDCQ';
        //this.dataBase.paymentDescription="";
      }
      else if(applyType=='BIDDING'&&businessType=='DIRECT'&&tenderPriceCurrencys=='USD'&&clientType=='其他')
      {
        params.dictGroup='BDUQ';
        //this.dataBase.paymentDescription="";
      }
      else if(applyType=='BIDDING'&&businessType=='DISTRIBUTOR'&&tenderPriceCurrencys=='CNY'&&clientType=='其他')
      {
        params.dictGroup='BDisCQ';
        //this.dataBase.paymentDescription="";
      }
      else if(applyType=='BIDDING'&&businessType=='DISTRIBUTOR'&&tenderPriceCurrencys=='USD'&&clientType=='其他')
      {
        params.dictGroup='BDisUQ';
        //this.dataBase.paymentDescription="";
      }
  }
  if(params.dictGroup!='')
  {
    this.http.post(`/act/ecom/dictData/queryGroupDictData`,params).subscribe(rest => {
      if (rest.code === '0000') {
         this.dataBase.paymentList=rest.data;
         let result=this.dataBase.paymentList.find(val=>val.dictValue==this.dataBase.paymentDescription);
         if(!result)
         {
           this.dataBase.paymentDescriptions=this.dataBase.paymentDescription;
           // this.dataBase.paymentDescription="其他";
         }
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }
}

// 物流条款说明监听
changLogisticsTermsExplain() {
    if (this.dataBase.logisticsTermsExplain === 'WLTKSMBZ') {
      this.dataBase.logisticsDescription = '收到信用证/货款90天内装运';
      this.isReadonly = true;
      this.isFlags = false;
    } else {
      if (this.dataBase.logisticsDescription != ''){
        if (this.dataBase.logisticsDescription === '收到信用证/货款90天内装运'){
          this.isFlags = true;
        }
      }
      this.isReadonly = false;
    }
}
//监听物流条款说明，非标准条款时输入的内容是否和标准条款的一致
changeLogisticsDescription(){
  if (this.dataBase.logisticsTermsExplain != 'WLTKSMBZ') {
    if (this.dataBase.logisticsDescription === '收到信用证/货款90天内装运'){
      this.isFlags = true;
    } else{
      this.isFlags = false;
    }
  }
}
// 获取模板参数
  getSelAgent (data) {
    const url = `/act/ecom/bidding/selAgent`;
    this.http.post(url, data).subscribe((res => {
          if (res.data && res.data.rows && res.data.rows.length > 0) {
            // this.dataBase.biddingComRegAddress = res.data.rows[0].registeredAddress; //投标公司地址
            // this.dataBase.biddingComRegCode = res.data.rows[0].registeredAddress; //投标公司所在地
            if (res.data.rows[0].authorizedProduct == null) {
              this.dataBase.productModels = '';
            } else {
              this.dataBase.productModels = res.data.rows[0].authorizedProduct;
            }
            if (res.data.rows[0].authorizedArea == null) {
              this.dataBase.region = '';
            } else {
              this.dataBase.region = res.data.rows[0].authorizedArea;
            }

            if (res.data.rows[0].ddpStatus === '通过' && this.dataBase && this.dataBase.agentBidding === 'nonagency') {
              this.dataBase.biddingDdpState = res.data.rows[0].ddpStatus;
              // 记录ddp历史状态
              this.ddp_history[res.data.rows[0].dealerName] = '通过';
            } else if (res.data.rows[0].ddpStatus !== '通过' && this.dataBase && this.dataBase.agentBidding === 'nonagency'){
              // 记录ddp历史状态
              this.dataBase.biddingDdpState = '未通过';
              this.ddp_history[res.data.rows[0].dealerName] = '未通过';
            }
            if (res.data.rows[0].ddpStatus == null || res.data.rows[0].ddpStatus === '') {
              this.mess_ddp = true;
              this.mess_ddp_history[res.data.rows[0].dealerName] = true;
            } else {
              this.mess_ddp = false;
            }
          } else {
            // 没有查到数据
            this.mess_ddp = true;
            this.dataBase.biddingDdpState = '未通过';
            // 记录ddp历史状态
            this.ddp_history[data.dealerName] = '未通过';
            this.mess_ddp_history[data.dealerName] = true;
          }
      }),
      ((error) => {
        // this.message.create("error", "请求异常!")
      }));
  }

  /*监听input设置数字*/
  toNumber(e) {
    const reg = /^(0|[1-9][0-9]{0,12})(\.[0-9]{0,2})?$/;
    if ((!isNaN(+e) && reg.test(e)) || e === '') {
        this.price1_value = e;
    }
    if (this.price1 && this.price1.nativeElement) {
      this.price1.nativeElement.value = this.price1_value;
      this.dataBase.tenderPriceCurrency = this.price1_value;
    }
  }
  toNumber2(e) {
    const reg = /^(0|[1-9][0-9]{0,12})(\.[0-9]{0,2})?$/;
    const fe = parseFloat(e);
    if ((!isNaN(+e) && reg.test(e)) || e === '') {
        this.price2_value = e;
    }
    if (this.price2 && this.price2.nativeElement) {
      this.price2.nativeElement.value = this.price2_value;
      this.dataBase.totalPrice = this.price2_value;
    }

    // this.updateTitle();
  }
  toNumber3(e) {
    const reg = /^(0|[1-9][0-9]{0,12})(\.[0-9]{0,2})?$/;
    const fe = parseFloat(e);
    if ((!isNaN(+e) && reg.test(e)) || e === '') {
        this.price3_value = e;
    }
    if (this.price3 && this.price3.nativeElement) {
      this.price3.nativeElement.value = this.price3_value;
      this.dataBase.performanceBonds = this.price3_value;
    }
    // this.updateTitle();
  }
  toNumber4(e) {
    const reg = /^(0|[1-9]\d?|100)(\.[0-9]{0,1})?$/;
    const fe = parseFloat(e);
    if ((!isNaN(+e) && reg.test(e)) || e === '' || e == null) {
      if (fe <= 100 || e === '' || e == null) {
        this.price4_value = e;
      }
    }
    if (this.num1 && this.num1.nativeElement) {
      this.num1.nativeElement.value = this.price4_value;
      this.dataBase.percentageTotalPrice = this.price4_value;
    }
    // this.updateTitle();
  }
  toNumber5(e) {
    const reg = /^(0|[1-9]\d?|100)(\.[0-9]{0,1})?$/;
    const fe = parseFloat(e);
    if ((!isNaN(+e) && reg.test(e)) || e === '' || e == null) {
      if (fe <= 100 || e === '' || e == null) {
        this.price5_value = e;
      }
    }
    if (this.num2 && this.num2.nativeElement) {
      this.num2.nativeElement.value = this.price5_value;
      this.dataBase.marginLevel = this.price5_value;
    }
    // this.updateTitle();
  }

  /*转换*/
  TrunBiddingDdpState(e) {
    for (let i = 0; i < this.stats.length; i++) {
      if (this.stats[i].value == e) {
        return this.stats[i].name;
      }
    }
    return '';
  }

  // 截取数字保留两位小数
  chNumber(e) {
    if (e) {
      e = e.toString();
      let i = e.indexOf('.');
      if (i != -1 && i + 2 <= e.length) {
        return e.substring(0, i + 3);
      }
      if (i == -1 && e && e.length > 0) {
        return e + '.00';
      }
      return e;
    }
    return e;
  }

}
