import { Component, OnInit, ViewChild } from '@angular/core';
import { decodeString, getType, formatDatesNow } from '../../../assets/js/tools';
import { HttpService } from '../../services';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ServesiceService } from '../preOrder/servesice.service';

@Component({
  selector: 'app-inconmodif',
  templateUrl: './inconmodif.component.html',
  styleUrls: ['./inconmodif.component.scss']
})
export class InconmodifComponent implements OnInit {
  @ViewChild('child') child;
  @ViewChild('childbase') public childbase;
  public withdraw: any = false; //判断是否可以使用退回进单;
  //弹窗的数据
  public showData = {
    refuseReason: "",
    remarks: "",
    file: "",
    title: "",
    code: "",
  }
  flag: any;
  disa: any = false; //控制子禁用
  public textLen = 255;
  public isAgres: any = false;
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
  activedId: any = "pending-tab";
  params = {
    mainId: '',
    check: 0, // 1 通过， 0 拒绝
    file: [], // 上传附件
    id: '',
    remarks: "", // 备注
    createTime: '',
    createUser: '',
    isDeleted: 0,
    fileUpload: "", //文件上传id
    preparationId: '',
    status: 0,
    updateTime: '',
    updateUser: '',
    reason: "", //拒绝原因
  };
  validateForm: FormGroup;
  constructor(private http: HttpService,
    private message: NzMessageService,
    public activatedRouter: ActivatedRoute,
    private fb: FormBuilder,
    private ServesiceService: ServesiceService,
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
    }), (error => {
      this.load = false;
      this[fileList] = [];
      this.message.create("error", "文件上传失败请重新上传!");
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
    this.activedId = val.nextId;
  }
  /**
   * data 回显数据  fileList回显数组
   */
  viewData(data, fileList) {
    const bidWinningNotice = this.dataBase[data];
    if (bidWinningNotice != "" && bidWinningNotice != undefined && bidWinningNotice != null) {
      this[fileList] = [];
      let obj = { uid: "", name: "", fileId: "" }
      obj.uid = this.dataBase[data];
      obj.fileId = this.dataBase[data];
      obj.name = "文件下载";
      this[fileList].push(obj);
    }

  }

  //文件下载
  fileDwon(id) {

    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf("#");
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${id}`;
    window.open(url, '_blank');
  }
  ngOnInit() {
    this.flag = this.activatedRouter.queryParams['_value'].flag;
    this.disa = this.flag == '1' ? true : false;//代码与已办;
    this.validateForm = this.fb.group({
      file: [null],
      remarks: new FormControl({ value: '', disabled: this.disa }, Validators.required)
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

          this.dataBase = rest.data;
          this.params.remarks = this.dataBase.remarks ? this.dataBase.remarks : "";
          this.params.fileUpload = this.dataBase.fileUpload ? this.dataBase.fileUpload : "";
          if (this.dataBase.sameFlag != null) {
            this.dataBase.sameFlag = this.dataBase.sameFlag.toString();
          }
          this.dataBase.referenceId = rest.data.referenceId;
          this.dataBase.detail = {
            id: decodeString(this.activatedRouter.queryParams['_value'].id),
            flag: this.activatedRouter.queryParams['_value'].flag,
            status: this.activatedRouter.queryParams['_value'].status,
          };
          this.viewData("fileUpload", "fileFileList")
        } else {
          this.message.create('error', '获取数据失败');
        }
      }
    });
    this.getCheck();
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
    this.params.fileUpload = this.params.fileUpload;
    if (e == 1) {

      const cheakData = this.childbase.checkFormData();
      if (!cheakData) {
        this.myskip('pending-tab');
        this.message.create('error', `基础信息有必填项没有填写`);
        return;
      }
      this.validateForm.controls['remarks'].markAsDirty();
      this.validateForm.controls['remarks'].updateValueAndValidity();
      if (this.dataBase.detail.status == 'DHTGYBTX') {
        if (!this.validateForm.valid) {
          this.myskip("examine-tab");
          this.message.create("error", "请填写备注!");
          return;
        }
      }
      if (this.dataBase.other7 == true) {
        if (this.dataBase.freeText == "" || this.dataBase.freeText == null || this.dataBase.freeText == undefined) {
          this.message.create("error", "请填写其他");
          this.myskip("pending-tab");
          return
        }
      }
      if (this.dataBase.afterSales == '1') {
        if (this.dataBase.afterSalesFileName == "" || this.dataBase.afterSalesFileName == null || this.dataBase.afterSalesFileName == undefined) {
          this.message.create("error", "请上传售后限价文件");
          this.myskip("pending-tab");
          return
        }
      }
      //提示勾选其它条款"进出口公司不在IE pool"
      const foreignTradeCompanys = this.dataBase.foreignTradeCompany ? this.dataBase.foreignTradeCompany.replace(/\s+/g, "") : "";
      const distributors = this.dataBase.distributor ? this.dataBase.distributor.replace(/\s+/g, "") : "";
      if (this.dataBase.invoiceInformation == 'USD' && this.dataBase.entryMode == 'BIDDING' && foreignTradeCompanys != distributors) {
        if (this.dataBase.contractBuyer2 != this.dataBase.foreignTradeCompany && !this.dataBase.other1) {
          this.message.create('error', '外贸公司不在IE Pool！请重新从IE Pool选择外贸公司，或勾选"其它条款：进出口公司选择不在IE Pool"');
          return;
        }
      }
      /** 
       * //bidding模式的时候，招标文件审核里边几个文件为必填字段 bidding模式必填暂时删除
       * stock模式的时候，看team是否保函VAD,DXR,BV
      */
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
          if (this.dataBase.entryMode == 'STOCK' && (this.dataBase.userTeme == 'BV' || this.dataBase.userTeme == 'DXR')) {
            demandLetter = "要货函";
          }
          else {
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
      // if (this.dataBase.entryMode == 'BIDDING') {
      //   if (this.dataBase.bidWinningNotice == '' || this.dataBase.bidWinningNotice == null || this.dataBase.bidWinningNotice == undefined) {
      //     let title = this.dataBase.tenderNo != '其他类型' ? '中标通知书' : '最终用户合同'
      //     this.myskip('pending-tab');
      //     this.message.create("error", `请上传${title}`)
      //     return
      //   }
      //   if (this.dataBase.siteReport == '' || this.dataBase.siteReport == null || this.dataBase.siteReport == undefined) {
      //     let demandLetter;
      //     if (this.dataBase.hospitalNature == '民营医院') {
      //       demandLetter = "场地勘验报告";
      //     }
      //     else {
      //       if (this.dataBase.tenderNo != '其它类型') {
      //         demandLetter = "要货函";
      //       }
      //       else {
      //         demandLetter = "场地勘验报告";
      //       }
      //     }
      //     this.myskip('pending-tab');
      //     this.message.create("error", `请上传${demandLetter}`)
      //     return
      //   }
      //   if (this.dataBase.projectSolutions == '' || this.dataBase.projectSolutions == null || this.dataBase.projectSolutions == undefined) {
      //     this.myskip('pending-tab');
      //     this.message.create("error", `请上传项目解决方案售前支持报告`);
      //   }
      // }
      //投标公司不能等于外贸公司
      if (this.dataBase.invoiceInformation == 'USD' && this.dataBase.businessModel == 'DISTRIBUTOR') {
        const tenderingCompany = this.dataBase.tenderingCompany ? this.dataBase.tenderingCompany.replace(/\s+/g, "") : "";
        const foreignTradeCompany = this.dataBase.foreignTradeCompany ? this.dataBase.foreignTradeCompany.replace(/\s+/g, "") : "";
        const distributor = this.dataBase.distributor ? this.dataBase.distributor.replace(/\s+/g, "") : "";
        if (distributor != tenderingCompany) {
          if (tenderingCompany == foreignTradeCompany) {
            this.message.create('error', '外贸公司不能等于投标公司,请重新选择外贸公司!');
            return;
          }
        }
      }
      if (this.dataBase.supportFileMissing == '0' && this.dataBase.sampleAuditFlag == '1') {
        if ((this.dataBase.biddingDocuments == '' || this.dataBase.biddingDocuments == undefined || this.dataBase.biddingDocuments == null) && this.dataBase.tenderNo != '其他类型') {
          this.message.create("error", "请上传投标文件");
          return
        }
        if ((this.dataBase.tenderDocuments == '' || this.dataBase.tenderDocuments == undefined || this.dataBase.tenderDocuments == null) && this.dataBase.tenderNo != '其他类型') {
          this.message.create("error", "请上传招标文件");
          return
        }
        if ((this.dataBase.endUserContract == '' || this.dataBase.endUserContract == undefined || this.dataBase.endUserContract == null) && this.dataBase.businessModel != 'DIRECT') {
          this.message.create("error", "请上传最终用户合同");
          return
        }
        if ((this.dataBase.projectAnalysisTable == '' || this.dataBase.projectAnalysisTable == undefined || this.dataBase.projectAnalysisTable == null) && this.dataBase.businessModel == 'DISTRIBUTOR') {
          this.message.create("error", "请上传项目分析表");
          return
        }
      }
      if (this.dataBase.confirmationFileFlags) {
        if (this.dataBase.confirmationFile == "" || this.dataBase.confirmationFile == null) {
          this.message.create("error", "请上传IGT第三方显示器吊塔确认文件");
          return
        }
      }
      if (this.dataBase.mrShieldingCompanyFlags) {
        if (this.dataBase.mrShieldingCompany == "" || this.dataBase.mrShieldingCompany == null) {
          this.message.create("error", "请上传磁屏蔽公司确认文件");
          return
        }
      }
    }

    //装运方式清空选项
    if (this.dataBase.shipmentDelivery == '0') {
      this.dataBase.shipmentDeliveryRemarks = "";
      this.dataBase.shipmentDeliveryFileName = "";
      this.childbase.shipmentDeliveryList = [];
    }
    //安装，验收及保修
    if (this.dataBase.installationWarranty == '0') {
      this.dataBase.installationWarrantyRemarks = "";
      this.dataBase.installationWarrantyFileName = "";
      this.childbase.installationWarrantyList = [];
    }
    //场地准备
    if (this.dataBase.sitePreparation == '0') {
      this.dataBase.sitePreparationRemarks = "";
      this.dataBase.sitePreparationFileName = "";
    }
    //履约保函
    if (this.dataBase.performanceBond == '0') {
      this.dataBase.performanceBondRemarks = "";
      this.dataBase.performanceBondFileName = "";
      this.childbase.performanceBondList = [];
    }
    //是否有售后限价
    if (this.dataBase.afterSales == '0') {
      this.dataBase.afterSalesRemarks = "";
      this.dataBase.afterSalesFileName = "";
      this.childbase.afterSalesList = [];
    }
    //直投订单合同金额和中标金额有价差
    if (this.dataBase.amountDifference == '0') {
      this.dataBase.amountDifferenceRemarks = "";
      this.dataBase.amountDifferenceFileName = "";
      this.childbase.amountDifferenceList = [];
    }
    //支持文件缺失需特批进单
    if (this.dataBase.supportFileMissing == '0') {
      this.dataBase.supportFileMissingRemarks = "";
      this.dataBase.supportFileMissingFileName = "";
      this.childbase.supportFileMissingList = [];
    }
    //清空其他文件
    let otherArr = this.dataBase.other.split(',');
    let otherFile = otherArr.some(res => res === 'true') //控制备注、复制按钮的显示与否;
    if (!otherFile) {
      this.dataBase.otherRemarks = "";
      this.dataBase.otherFilName = "";
      this.dataBase.freeText = "";
      this.dataBase.otherFilNameFileList = "";
    }
    // this.dataBase.contractEndDate=formatDatesNow(this.dataBase.contractEndDate);
    // this.dataBase.poolEndDate=formatDatesNow(this.dataBase.poolEndDate);
    //合并基础信息和审核的参数     
    let parm = Object.assign(this.dataBase, this.params);
    this.load = true;
    this.http.post(url, parm).subscribe((rest => {
      if (rest.code === '0000') {
        this.load = false;
        this.message.create('success', '操作成功');
        this.router.navigate(['/igt/my-task']);
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "请求异常")
    }));
  }
  //弹出退回进单准备表
  backOrder() {
    this.isAgres = true;
    let obj = {
      title: "取消进单准备表",
      code: "cancelReceipt",
      refuseReason: null,
      remarks: "",
      file: "",
    }
    this.ServesiceService.confirmTime.emit(obj);
  }

  //确定
  isAgregentOk() {
    const cheakData = this.child.checkFormData();
    if (!cheakData) {
      this.message.create('error', `有必填项没有填写`);
      return;
    }
    const url = '/act/preparation/updateContractSummary';
    // 获取mainId
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    this.params.mainId = mainId;
    this.params.check = 2; //退回进单准备表状态
    this.params.reason=this.child.infor.refuseReason;
    this.params.fileUpload=this.child.infor.file;
    this.params.remarks=this.child.infor.remarks;
    let parm = Object.assign(this.dataBase, this.params);
    this.load = true;
    this.http.post(url, parm).subscribe((rest => {
      if (rest.code === '0000') {
        this.load = false;
        this.message.create('success', '操作成功');
        this.router.navigate(['/igt/my-task']);
        this.child.infor.file = "";
        this.child.infor.refuseReason = null;
        this.child.validateForm.reset();
        this.isAgres = false;
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "请求异常")
    }));
  }
  //取消
  isAgreCancels() {
    this.isAgres = false;
  }

  //检查是否可以撤回
  getCheck() {
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const url = `/act/preparation/checkCanBeTerminated/${mainId}`
    this.http.get(url).subscribe(res => {
      if (res.code == '0000') {
        this.withdraw = res.data;
      }
    })
  }

}
