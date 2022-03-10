import { Component, OnInit,Output,Input,EventEmitter} from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FileService, HttpService } from '../../../services';
import {NzMessageService, UploadFile} from 'ng-zorro-antd';
import {decodeString, getType} from '../../../../assets/js/tools';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { debug } from 'console';

@Component({
  selector: 'app-auditrecord',
  templateUrl: './auditrecord.component.html',
  styleUrls: ['./auditrecord.component.scss']
})
export class AuditrecordComponent implements OnInit {
  // DHTOASH 待OA审核
  // DCDSH 待场地审核
  public textLen=255;
  status: any;
  remark: any="";
  file: any;
  flag: any = 0;
  Colo: any = false;
  load:any=false;
  title:any; //标题
  validateForm: FormGroup;
  @Input() dataBase:any;
  @Output() myEvent = new EventEmitter();
  public fileFileList = []; //
  // tslint:disable-next-line:max-line-length
  constructor(
    private activeRoute: ActivatedRoute,
    private http: HttpService,
    private message: NzMessageService,
    private fb: FormBuilder,
    private router: Router,
    private nzMessageService: NzMessageService,
  ) {}
  ngOnChanges()
  {
    const roles=JSON.parse(localStorage.getItem("roles"));
    this.dataBase.tableColOff=roles.some(val=>(val=='OA'||val=='OA Leader'||val=='CFC Leader'||val=='ZPM'||val=='PM Leader'||val=='PM Leader_change'||val=='Distributor leader'||val=='ZSL'||val=='COP Operation'||val=='Finance: C&C Leader'||val=='Cluster BP'||val=='OM'||val=='Sales Leader'||val=='C&C Leader'))
  }

  ngOnInit() {
    this.flag = this.activeRoute.queryParams['_value'].flag;
    this.title=this.activeRoute.queryParams['_value'].state=="DOACS"?"审核进单准备表":"审核合同概要表"
    this.validateForm = this.fb.group({
      remark: new FormControl({ value:'', disabled: this.flag == 1 }, Validators.required)
    })
  }

  /**
   *提示内容是否显示
   */
  public tipsfun()
  {
    if(this.dataBase.sampleAuditFlag==1&&this.dataBase.entryMode=='BIDDING'&&this.dataBase.isSame=='1'&&this.dataBase.tableColOff)
    {
      return true;
    }
    else
    {
      return false;
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
        this.file = res.data;
        this.message.create('success', res.msg);
      } else {
        this.message.create('error', res.msg);
      }
    }),(error=>{
      this.load=false;
      this[fileList] = [];
      this.message.create("error","请求异常!")
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
    this.upload('fileFileList', file, 'file');
    return false;
  }
  checkFormData = () => {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    return this.validateForm.valid;
  }
  // 1通过 0拒绝
  public adopt (e) {
    this.status = this.activeRoute.queryParams['_value'].state;
    const id = decodeString(this.activeRoute.queryParams['_value'].id);
    if (e === 0) {
      this.validateForm.controls['remark'].markAsDirty();
      this.validateForm.controls['remark'].updateValueAndValidity();
      if (!this.validateForm.valid) {
        return;
      }
    }
    this.submit(e, id);
  }
  pre() {
    this.myEvent.emit("complete-tab");
  }
  public cancelAction(): void {
    this.nzMessageService.info('Cancel this operation');
  }
  public submit(e, id) {
    let url = '';
    if (this.status === 'DOACS') {
      // 待OA审核
      url = '/act/preparation/oaReview';
    } else if (this.status === 'DCDSH') {
      // 待场地审核
      url = '/act/ecom/order/application/checkSiteReport';
    }
    const parm = {
      mainId: id,
      check: e,
      remark: '',
      file: '',
      tenderNo:this.dataBase.tenderNo,
      hospitalNature:this.dataBase.hospitalNature,
      installationWarrantyRadios:[], //进单单位是否下一级审核
      productList:[]  //进单单位修改备注
    };
    if(this.dataBase.productList&&this.dataBase.productList.length>0)
    {
      if(e==1)
      {
        let summary=0;
        for (let i = 0; i < this.dataBase.productList.length; i++) {
          const sofonName=this.dataBase.productList[i].sofonName;
          const sofonNo=this.dataBase.productList[i].sofonNo;
          const other7=this.dataBase.productList[i].other7;
          const freeText=this.dataBase.productList[i].freeText;
          const afterSales=this.dataBase.productList[i].afterSales;
          const afterSalesFileName=this.dataBase.productList[i].afterSalesFileName;
          if(afterSales=='1')
          {
            if (afterSalesFileName == "" || afterSalesFileName == null || afterSalesFileName == undefined) {
              this.message.create("error", "请上传售后支持文件!");
              return
            }
          }
          if (other7 == true) {
            if (freeText == "" || freeText == null || freeText == undefined) {
              this.message.create("error", "请填写其他!");
              return
            }
          }
          const totalContractPrice=this.dataBase.productList[i].totalContractPrice;
          if (sofonName == null || sofonName == "" || sofonName == undefined) {
            this.message.create("error", "请上传Sofon文件");
            this.myEvent.emit("complete-tab");
            return
          }
          if((this.dataBase.financialProgramme=='1'||this.dataBase.financialProgramme=='2')&&this.dataBase.financialProgrammeCost!=0.0000)
          {
            const financialPrice=this.dataBase.productList[i].financialPrice;
            if (financialPrice == null || financialPrice == "" || financialPrice == undefined) {
              this.message.create("error", "请填写金融方案价格");
              this.myEvent.emit("complete-tab");
              return
            }
          }
          if (totalContractPrice == null || totalContractPrice == "" || totalContractPrice == undefined) {
            this.message.create("error", "请填写进单单位合同价");
            this.myEvent.emit("complete-tab");
            return
          }
          if (sofonNo == null || sofonNo == "" || sofonNo == undefined) {
            this.message.create("error", "请填写Sofon No");
            this.myEvent.emit("complete-tab");
            return
          }

          summary = (summary * 100 + this.dataBase.productList[i].financialPrice * 100) / 100;
        }
        let diffs=Math.abs((this.dataBase.financialProgrammeCost*100-summary*100)/100); //金融方案总价和明细价格对比
        let difference=Math.abs((this.dataBase.entryUnitPrice*100-this.dataBase.dealContractPrice*100)/100); //Deal Form总价和E-COM总价对比

        if(difference>1)
        {
          setTimeout(()=>{
            this.message.create("error", "Deal Form总价和E-COM总价价差不能>1");
          },1000)
          //return
        }
        if(diffs>1)
        {
          this.message.create("error", "金融方案价格合和金融方案总价价差不能>1");
          return
        }

        if(this.dataBase.invoiceInformation=='CNY')
        {
          let taxrate=parseFloat(this.dataBase.taxrate);
          let dealContractPrice=this.dataBase.dealContractPrice*(1+taxrate);
          let len=this.dataBase.productList.length;
          let dealContractPriceadd=Number(dealContractPrice)+len
          let dealContractPricereduce=Number(dealContractPrice)-len;
          let summay = 0;
          this.dataBase.productList.map((a)=>{
            summay = (summay * 100 + a.totalContractPrice*100) / 100;
          })
          if(summay>dealContractPriceadd||summay<dealContractPricereduce)
          {
               this.message.create("error",`进单单位合同总价与Deal Form总价价差不能>${len}`);
               return false;
          }
        }
        else
        {
          let dealContractPrice=this.dataBase.dealContractPrice;
          let len=this.dataBase.productList.length;
          let dealContractPriceadd=Number(dealContractPrice)+len
          let dealContractPricereduce=Number(dealContractPrice)-len;
          let summay = 0;
          this.dataBase.productList.map((a)=>{
            summay = (summay * 100 + a.totalContractPrice*100) / 100;

          })
          if(summay>dealContractPriceadd||summay<dealContractPricereduce)
          {
               this.message.create("error",`进单单位合同总价与Deal Form总价价差不能>${len}`);
               return false;
          }

        }


      }
      this.dataBase.productList.map(res=>{
        let obj={
          id:res.id,
          installationWarrantyRadio:res.installationWarrantyRadio?res.installationWarrantyRadio:"",
        }
        parm.installationWarrantyRadios.push(obj);
         //装运方式清空选项
         if(res.shipmentDelivery=='0')
         {
          res.shipmentDeliveryRemarks="";
          res.shipmentDeliveryFileName="";
          res.shipmentDeliveryFileNameFileList=[];
         }
         //场地准备
         if(res.sitePreparation=='0')
         {
          res.sitePreparationRemarks="";
          res.sitePreparationFileName="";
          res.sitePreparationFileNameFileList=[];
         }
         //安装与验收
         if(res.installationWarranty=='0')
         {
          res.installationWarrantyRemarks="";
          res.installationWarrantyFileName="";
          res.installationWarrantyFileNameFileList=[];
         }
          //履约保函
          if(res.performanceBond=='0')
          {
            res.performanceBondRemarks="";
            res.performanceBondFileName="";
            res.performanceBondFileNameFileList=[];
          }
          //是否有售后限价
          if(res.afterSales=='0')
          {
            res.afterSalesRemarks="";
            res.afterSalesFileName="";
            res.afterSalesFileNameFileList=[];
          }
          //直投订单合同金额和中标金额有价差
          if(res.amountDifference=='0')
          {
            res.amountDifferenceRemarks="";
            res.amountDifferenceFileName="";
            res.amountDifferenceFileNameFileList=[];
          }
          //支持文件缺失进单
          if(res.supportFileMissing=='0')
          {
            res.supportFileMissingRemarks="";
            res.supportFileMissingFileName="";
            res.supportFileMissingFileNameFileList=[];
          }
          let otherArr=res.other.split(',');
          let otherFile=otherArr.some(res=>res==='true') //控制备注、复制按钮的显示与否;
          if(!otherFile)
          {
            res.otherRemarks="";
            res.otherFilName="";
            res.freeText="";
            res.otherFilNameFileList="";
          }
      })
      parm.productList = this.dataBase.productList;
    }
    parm.remark = this.remark;
    parm.file = this.file;
    this.load = true;
    this.http.post(url, parm).subscribe((res => {
      if (res.code === '0000') {
        this.message.create('success', `提交成功`);
        this.router.navigate(['/igt/my-task']);
        this.load = false;
      } else {
        this.message.create('error', res.msg);
        this.load = false;
      }
    }),(error=>{
      this.message.create("error",'服务器异常请联系管理员')
      this.load=false;
    }));
  }

}
