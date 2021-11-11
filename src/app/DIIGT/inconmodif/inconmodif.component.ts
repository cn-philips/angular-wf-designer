import { Component, OnInit } from '@angular/core';
import {decodeString, getType,formatDatesNow} from '../../../assets/js/tools';
import {HttpService} from '../../services';
import {NzMessageService, UploadFile} from 'ng-zorro-antd';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup,FormControl,Validators} from '@angular/forms';

@Component({
  selector: 'app-inconmodif',
  templateUrl: './inconmodif.component.html',
  styleUrls: ['./inconmodif.component.scss']
})
export class InconmodifComponent implements OnInit {
  flag:any;
  disa:any=false; //控制子禁用
  public textLen=255;
  public dataBase: any = {
    productList: [], // 产品列表
    detail: {
      id: '',
      flag: '',
      status: '',
    },
  };
  public load: any = false;
  public fileFileList = []; //
  activedId:any="pending-tab";
  params = {
    mainId: '',
    check: 0, // 1 通过， 0 拒绝
    file: [], // 上传附件
    id: '',
    remarks:"", // 备注
    createTime: '',
    createUser: '',
    isDeleted: 0,
    fileUpload:"", //文件上传id
    preparationId: '',
    status: 0,
    updateTime: '',
    updateUser: '',
  };
  validateForm: FormGroup;
  constructor(private http: HttpService,
              private message: NzMessageService,
              public activatedRouter: ActivatedRoute,
              private fb: FormBuilder,
              private router: Router) {
    this.dataBase.detail = {
      id: decodeString(this.activatedRouter.queryParams['_value'].id),
      flag: this.activatedRouter.queryParams['_value'].flag,
      status: this.activatedRouter.queryParams['_value'].status,
    };
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
        this.params[fileId] = res.data;
        this.message.create('success', '操作成功');
      } else {
        this.message.create('error', res.msg);
      }
    }),(error=>{
      this.load=false;
      this[fileList] = [];
      this.message.create("error","文件上传失败请重新上传!");
    }));
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
  // 上传——履约保函
  public fileBeforeUpload = (file: UploadFile): boolean => {
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
    this.upload('fileFileList', file, 'fileUpload');
    return false;
  }
  public myskip(val): void { // 外部触发tab选项卡的事件
    this.activedId = val;
  }
  tabclick(val) //tab选项卡的点击事件
  {
    this.activedId=val.nextId;
  }
  /**
   * data 回显数据  fileList回显数组
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
  ngOnInit() {
    this.flag = this.activatedRouter.queryParams['_value'].flag;
    this.disa=this.flag=='1'?true:false;//代码与已办;
    this.validateForm = this.fb.group({
      file: [null],
      remarks:new FormControl({ value:'', disabled:this.disa}, Validators.required)
    });

    // 获取mainId
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const parm = {
      // mainId: mainId
    };
    const url = '/act/preparation/queryContractSummary' + '?mainId=' + mainId;
    // 获取基础数据
    this.http.post(url).subscribe(rest => {
      if (rest.code === '0000') {
        if (rest.data) {
          this.dataBase=rest.data;          
          this.params.remarks=this.dataBase.remarks?this.dataBase.remarks:"";
          this.params.fileUpload=this.dataBase.fileUpload?this.dataBase.fileUpload:"";
          if (this.dataBase.sameFlag != null) {
            this.dataBase.sameFlag = this.dataBase.sameFlag.toString();
          }
          this.dataBase.referenceId=rest.data.referenceId;
          this.dataBase.detail = {
            id: decodeString(this.activatedRouter.queryParams['_value'].id),
            flag: this.activatedRouter.queryParams['_value'].flag,
            status: this.activatedRouter.queryParams['_value'].status,
          };          
          // this.dataBase.paymentProvision=this.dataBase.preparationProductList[0].paymentProvision;
          // this.dataBase.paymentProvisionRemarks=this.dataBase.preparationProductList[0].paymentProvisionRemarks;
          // this.dataBase.installationWarranty=this.dataBase.preparationProductList[0].installationWarranty;
          // this.dataBase.installationWarrantyRemarks=this.dataBase.preparationProductList[0].installationWarrantyRemarks;
          // this.dataBase.amountDifference=this.dataBase.preparationProductList[0].amountDifference;
          // this.dataBase.amountDifferenceRemarks=this.dataBase.preparationProductList[0].amountDifferenceRemarks;
          // this.dataBase.sitePreparation=this.dataBase.preparationProductList[0].sitePreparation;
          // this.dataBase.sitePreparationRemarks=this.dataBase.preparationProductList[0].sitePreparationRemarks;
          // this.dataBase.performanceBond=this.dataBase.preparationProductList[0].performanceBond;
          // this.dataBase.performanceBondRemarks=this.dataBase.preparationProductList[0].performanceBondRemarks;
          // this.dataBase.otherRemarks=this.dataBase.preparationProductList[0].otherRemarks;
          // this.dataBase.shipmentDelivery=this.dataBase.preparationProductList[0].shipmentDelivery;
          // this.dataBase.shipmentDeliveryRemarks=this.dataBase.preparationProductList[0].shipmentDeliveryRemarks;
          //  this.dataBase.other=this.dataBase.preparationProductList[0].other;
          //  this.dataBase.paymentProvisionFileName=this.dataBase.preparationProductList[0].paymentProvisionFileName;
          //  this.dataBase.paymentProvisionFileName=this.dataBase.preparationProductList[0].paymentProvisionFileName;
          //  this.dataBase.shipmentDeliveryFileName=this.dataBase.preparationProductList[0].shipmentDeliveryFileName;
          //  this.dataBase.installationWarrantyFileName=this.dataBase.preparationProductList[0].installationWarrantyFileName;
          //  this.dataBase.amountDifferenceFileName=this.dataBase.preparationProductList[0].amountDifferenceFileName;
          //  this.dataBase.sitePreparationFileName=this.dataBase.preparationProductList[0].sitePreparationFileName;
          //  this.dataBase.otherFilName=this.dataBase.preparationProductList[0].otherFilName;
          this.viewData("fileUpload","fileFileList")
        } else {
          this.message.create('error', '获取数据失败');
        }
      }
    });
  }
  updateDataBase(value: any) {
    console.log('value', value);
    console.log('this.dataBase', this.dataBase);
    // values.forEach()
    // this.dataBase = {};
  }

  // 提交数据
  save(e) {
   
    const url = '/act/preparation/updateContractSummary';
    // 获取mainId
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    this.params.mainId = mainId;
    this.params.check = e;
    // file转字符串
    // @ts-ignore
    // this.params.file = this.params.file.toString();
    this.params.fileUpload=this.params.fileUpload;
    if(e==1)
    {
      
      this.validateForm.controls['remarks'].markAsDirty();
      this.validateForm.controls['remarks'].updateValueAndValidity();
      if(this.dataBase.detail.status=='DHTGYBTX')
      {
        if(!this.validateForm.valid)
        {
          this.myskip("examine-tab");
          this.message.create("error","请填写备注!");
         return;
        }
        if(this.dataBase.other7==true)
        {
           if(this.dataBase.freeText==""||this.dataBase.freeText==null||this.dataBase.freeText==undefined)
           {
             this.message.create("error","请填写其他");
             this.myskip("pending-tab");
             return
           }
        }
      }
      //提示勾选其它条款"进出口公司不在IE pool"
      if(this.dataBase.invoiceInformation=='USD')
      {
        if(this.dataBase.contractBuyer2!=this.dataBase.foreignTradeCompany&&!this.dataBase.other1)
        {
          this.message.create('error', '外贸公司不在IE Pool！请重新从IE Pool选择外贸公司，或勾选"其它条款：进出口公司选择不在IE Pool"');
          return;
        }
        if(this.dataBase.tenderingCompany.replace(/\s+/g,"")==this.dataBase.foreignTradeCompany.replace(/\s+/g,""))
        {
          this.message.create('error', '外贸公司不能等于投标公司,请重新选择!');
                return;
        }         
      }
       if(this.dataBase.supportFileMissing=='0'&&this.dataBase.sampleAuditFlag=='1')
       {
         if((this.dataBase.biddingDocuments==''||this.dataBase.biddingDocuments==undefined||this.dataBase.biddingDocuments==null)&&this.dataBase.tenderNo!='其他类型')
         {
           this.message.create("error","请上传投标文件");
           return
         }
         if((this.dataBase.tenderDocuments==''||this.dataBase.tenderDocuments==undefined||this.dataBase.tenderDocuments==null)&&this.dataBase.tenderNo!='其他类型')
         {
          this.message.create("error","请上传招标文件");
          return
         }
         if(this.dataBase.endUserContract==''||this.dataBase.endUserContract==undefined||this.dataBase.endUserContract==null)
         {
          this.message.create("error","请上传最终用户合同");
          return
         }
         if((this.dataBase.projectAnalysisTable==''||this.dataBase.projectAnalysisTable==undefined||this.dataBase.projectAnalysisTable==null)&&this.dataBase.businessModel=='DISTRIBUTOR')
         {
          this.message.create("error","请上传项目分析表");
          return
         }
       }
       if(this.dataBase.confirmationFileFlags)
       {
          if(this.dataBase.confirmationFile==""||this.dataBase.confirmationFile==null)
          {
            this.message.create("error","请上传IGT第三方显示器吊塔确认文件");
            return
          }
       }
       if(this.dataBase.mrShieldingCompanyFlags)
       {
          if(this.dataBase.mrShieldingCompany==""||this.dataBase.mrShieldingCompany==null)
          {
            this.message.create("error","请上传磁屏蔽公司确认文件");
            return
          }
       }
    }
   // this.dataBase.contractEndDate=formatDatesNow(this.dataBase.contractEndDate);
   // this.dataBase.poolEndDate=formatDatesNow(this.dataBase.poolEndDate);
    //合并基础信息和审核的参数    
    let parm=Object.assign(this.dataBase, this.params);      
    this.load=true;    
    this.http.post(url,parm).subscribe((rest => {
      if (rest.code === '0000') {
        this.load=false;
        this.message.create('success', '操作成功');
          this.router.navigate(['/igt/my-task']);
      }
    }),(error=>{
      this.load=false;
      this.message.create("error","请求异常")
    }));
  }

}
