
import { decodeString, formatDatesNow } from '../../../assets/js/tools';
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
} from '../preOrder/servesice.service';

@Component({
  selector: 'app-preordermodif',
  templateUrl: './preordermodif.component.html',
  styleUrls: ['./preordermodif.component.scss']
})

export class PreordermodifComponent implements OnInit {
  @ViewChild('childbase') childbase;
  @ViewChild('remarks') remarks;
  public edit: any = false;
  constructor(
    public activatedRouter: ActivatedRoute,
    private message: NzMessageService,
    private nzMessageService: NzMessageService,
    private appService: AppService,
    private http: HttpService,
    private toastrService: ToastrService,
    private router: Router,
    private modalService: NgbModal,
    private aRoute: ActivatedRoute,
    private ServesiceService: ServesiceService,
  ) { }

  public dataBase: any = {
    entryMode: 'n-stock',
    productList: [], // 产品列表
    detail: {
      id: '',
      flag: '0',
      status: '',
    },
    dataList: []
  };
  disa: any = false;
  count: any;
  load = false;
  bidData = [];
  verifiData = [];
  public activedId: any = "pending-tab";
  public verifiOff = true; //效验按钮禁用与否
  public completed: boolean = false;//判读是保存 false,拒绝的true;
  isVisibleWinCheck: any = false;// 中标校验弹出框
  tableLoad: any = false; //中标效验转圈s
  ngOnChanges() {
    this.dataBase = Object.assign({}, this.dataBase);
  }
  ngOnInit() {
    this.edit = this.activatedRouter.queryParams['_value'].edit;
    const ASYNS = async () => {
      const rezult = await this.getBase();
      await this.getMarks();
      if (rezult) {
        await this.getProudcut();
      }
    }
    ASYNS()
  }
  updateData(val) {
    this.dataBase = Object.assign({}, val)
  }
  myVerifi(val) //验证按钮是否可以点击
  {
    this.verifiOff = val;
  }
  getBase() //基础信息
  {
    // 获取mainid
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const flag = this.activatedRouter.queryParams['_value'].flag;
    const status = this.activatedRouter.queryParams['_value'].status;
    const url = `/act/ecom/order/application/getPerOrder?mainId=${mainId}`;
    this.disa = flag === '1' ? true : false;
    // 获取基础信息数据
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe(res => {
        if (res.data) {
          this.dataBase = res.data;
          // console.log('res.data',res.data) 
          this.dataBase.detail = {
            id: '',
            flag: '',
            status: '',
          };
          if (this.dataBase.sameFlag != null) {
            this.dataBase.sameFlag = this.dataBase.sameFlag.toString();
          }
          this.dataBase.detail.id = mainId;
          this.dataBase.detail.flag = flag;
          this.dataBase.detail.status = status ? status : '';
          this.dataBase.productList = this.dataBase.productList ? this.dataBase.productList : [];
          this.dataBase.dataList = [];
          let firstArr = [];//前端排序
          const productList = this.dataBase.productList;
          if (productList.length > 0) {
            productList.map(res => {
              if (res.productList && res.productList.length > 0) {
                res.productList.map((val, index) => {
                  if (val.checked) {
                    firstArr = val;
                    res.productList.splice(index, 1);
                  }
                  val.modalityBmc = val.modalityBmcs ? val.modalityBmcs : []; //modalityBmc用于判定是否显示磁共振和三方塔吊;
                  val.id = val.simulationId;
                });
                if (firstArr) {
                  res.productList.unshift(firstArr)
                }
              }
            });
          }
          const dealFormId = this.dataBase.dealFormId;
          if (dealFormId != null && dealFormId != undefined && dealFormId !== '') {
            resolve(true);
          }
          else {
            resolve(false);
          }

          // 将读取的文件便利到对应的变量    *** 上传控件要显示已上传的文件  （可编辑）
          // filetake2(字符串) 读取的文件变量
          // filetake(数组) 要将filetake2的值赋给filetake

          // filetake 和 filetake2 值对应，顺序不变
          const filetake = [
            'mrShieldingCompanyFileList', // 磁共振屏蔽公司
            'confirmationFileFileList', // IGT第三方吊塔确认文件
            'paymentProvisionFileNameFileList', // 付款条件
            'shipmentDeliveryFileNameFileList', // 装运及交货
            'sitePreparationFileNameFileList', // 场地准备
            'installationWarrantyFileNameFileList', // 安装，验收及保修
            'amountDifferenceFileNameFileList', // 直投订单合同金额和中标金额有价差
            'performanceBondFileNameFileList', // 履约保函
            'supportFileMissingFileNameFileList', // 支持文件缺失需特批进单
            'otherFilNameFileList' // 其他条款
          ];
          const filetake2 = [
            { id: 'mrShieldingCompany', name: "mrShieldingCompanyNames" }, // 磁共振屏蔽公司
            { id: 'confirmationFile', name: "confirmationFileNames" }, // IGT第三方吊塔确认文件
            { id: 'paymentProvisionFileName', name: "paymentProvisionFileNames" }, // 付款条件
            { id: 'shipmentDeliveryFileName', name: "shipmentDeliveryFileNames" }, // 装运及交货
            { id: 'sitePreparationFileName', name: "sitePreparationFileNames" }, // 场地准备
            { id: 'installationWarrantyFileName', name: "installationWarrantyFileNames" }, // 安装，验收及保修
            { id: 'amountDifferenceFileName', name: "amountDifferenceFileNames" }, // 直投订单合同金额和中标金额有价差
            { id: 'performanceBondFileName', name: "performanceBondFileNames" }, // 履约保函
            { id: 'supportFileMissingFileName', name: "supportFileMissingFileNames" }, // 支持文件缺失需特批进单
            { id: 'otherFilName', name: "otherFilNames" } // 其他条款
          ];
          for (let j = 0; j < filetake.length; j++) {
            this.takeFile(filetake[j], filetake2[j]);
          }
          // console.log('kkk');
          // console.log(this.dataBase); 
        } else {
          this.message.create('error', '获取数据失败');
        }
      })
    })

  }
  getMarks() {
    const param = {
      mainBusinessID: decodeString(this.activatedRouter.queryParams['_value'].id),
    };
    this.load = true
    this.http.post(`/act/process/getProcessWorkHisInfo`, param).subscribe((rest => {
      if (rest.code === '0000') {
        this.load = false;
        if (rest.data.length > 1) {
          this.completed = true;
        }
      } else {
        this.load = false;
        this.message.create('error', `${rest.msg}`);
      }
    }), (error) => {
      this.load = false;
      this.message.create("error", "请求异常!")
    });
  }
  //获取产品信息
  getProudcut() {
    // /act/preparation/queryMarketBundle
    const url = `/act/preparation/queryMarketBundle?dealFormID=${this.dataBase.dealFormId}`;
    this.http.get(url).subscribe(res => {
      if (res.code == '0000') {
        this.dataBase.count = 0;
        let { children } = res.data;
        children.map(vals => {
          vals.title = vals.simulationId;
          vals.key = vals.id;
          vals.level = 1;
          vals.children.map(val => {
            this.dataBase.count++;
            val.title = val.marketBundleName;
            val.key = val.id;
            val.level = 2;
            val.children.map(item => {
              item.title = item.productName;
              item.key = item.id;
              item.level = 3;
              item.disableCheckbox = true; //第三层禁用
              item.isLeaf = true; //叶子节点
            })
          });
        });
        this.dataBase.dataList = children;
        // console.log('this.dataBase.dataList',this.dataBase.dataList,children)
      }
    });
  }
  saveContract(): void {
    // 招标授权表单提交或者保存
    this.dataBase.status = 0;
    this.dataBase.mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
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
    this.http.post(`/act/preparation/saveAndSubmit`, this.dataBase).subscribe(rest => {
      if (rest.code === '0000') {
        this.message.create('success', `${rest.msg}`);
        this.router.navigate(["/igt/my-task"]);
        this.load = false;
      } else {
        this.message.create('error', `${rest.msg}`);
        this.load = false;
      }
    });
  }

  public winningBid(): void {
    // 判断每个进单单位里是否有mk
    const arr = [];
    let sampleAuditFlagArr = false;
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
    // 如果是被拒绝的待提交就要验证备注
    if (this.completed === true) {
      let cheakRemarks = this.remarks.checkFormData();
      if (!cheakRemarks) {
        this.myskip('complete-remarks');
        this.message.create('error', '备注信息没有填写');
        return;
      }
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
         this.message.create('error', '外贸公司不能等于投标公司,请重新选择!');
              return;
       }
     }
    /**
     * 有多个进单单位，只要有一个进单单位中“支持文件缺失需特批进单”=否
     * 抽样审核订单支持文件”里面的4个文件在"是否抽样审核=是"的时候是必填的
     */

    sampleAuditFlagArr = this.dataBase.productList.every(vals => vals.supportFileMissing == '1');
    if (this.dataBase.sampleAuditFlag == '1' && !sampleAuditFlagArr) {
      if ((this.dataBase.biddingDocuments == '' || this.dataBase.biddingDocuments == null || this.dataBase.biddingDocuments == undefined) && this.dataBase.tenderNo != '其他类型') {
        this.myskip('pending-tab');
        this.message.create("error", "请上传投标文件")
        return
      }
      if ((this.dataBase.tenderDocuments == '' || this.dataBase.tenderDocuments == null || this.dataBase.tenderDocuments == undefined) && this.dataBase.tenderNo != '其他类型') {
        this.myskip('pending-tab');
        this.message.create("error", "请上传招标文件")
        return
      }
      if (this.dataBase.endUserContract == '' || this.dataBase.endUserContract == null || this.dataBase.endUserContract == undefined) {
        this.myskip('pending-tab');
        this.message.create("error", "请上传最终用户合同")
        return
      }
      if ((this.dataBase.projectAnalysisTable == '' || this.dataBase.projectAnalysisTable == null || this.dataBase.projectAnalysisTable == undefined) && this.dataBase.businessModel == 'DISTRIBUTOR') {
        this.myskip('pending-tab');
        this.message.create("error", "请上传项目分析表")
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
        'checkResultReasons': ''  // 校验失败原因
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
        objs.simulationIds = val.simulationIds;
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
           // vals.winningByCustomerName = res.data[index].orderByApplicant;
           // vals.winPerson = res.data[index].winningByApplicant;
            vals.searchResult = [...res.data[index].searchResult];
          });
          arr.map(res => {
            arrIscheak.map(vals => {
              if (res.key == vals.key) {
               // vals.winningByCustomerName = vals.orderByApplicant;
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
              vals.isDisable = false; //是否禁用
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


  tabclick(val) //tab选项卡的点击事件
  {
    this.activedId = val.nextId;
  }
  public myskip(val): void { //外部触发tab选项卡的事件

    this.activedId = val;
  }
  handleOkWinCheck(): void {
    // 添加mk数量
    let mklength = 0;
    let sampleAuditFlagArr = false;
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
        if (host && host.modalityBmc) {
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
    sampleAuditFlagArr = this.dataBase.productList.every(vals => vals.supportFileMissing == '1');
    if (this.dataBase.sampleAuditFlag == '1' && !sampleAuditFlagArr) {
      if ((this.dataBase.biddingDocuments == '' || this.dataBase.biddingDocuments == null || this.dataBase.biddingDocuments == undefined) && this.dataBase.tenderNo != '其他类型') {
        this.myskip('pending-tab');
        this.message.create("error", "请上传投标文件")
        return
      }
      if ((this.dataBase.tenderDocuments == '' || this.dataBase.tenderDocuments == null || this.dataBase.tenderDocuments == undefined) && this.dataBase.tenderNo != '其他类型') {
        this.myskip('pending-tab');
        this.message.create("error", "请上传招标文件")
        return
      }
      if (this.dataBase.endUserContract == '' || this.dataBase.endUserContract == null || this.dataBase.endUserContract == undefined) {
        this.myskip('pending-tab');
        this.message.create("error", "请上传最终用户合同")
        return
      }
      if ((this.dataBase.projectAnalysisTable == '' || this.dataBase.projectAnalysisTable == null || this.dataBase.projectAnalysisTable == undefined) && this.dataBase.businessModel == 'DISTRIBUTOR') {
        this.myskip('pending-tab');
        this.message.create("error", "请上传项目分析表")
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
    let cheakItem = [...this.verifiData];
    let cheakbox = cheakItem.every((vals) => vals === true) //字段是否填写完成
    this.isVisibleWinCheck = false;
    let url = "/act/preparation/saveAndSubmit";
    this.dataBase.status = 1;
    this.dataBase.mainId = decodeString(this.dataBase.detail.id);
    // if(!cheakbox)
    // {
    //   this.message.create('warning','产品信息有必填项没有填写！')
    //   return;
    // }
    let cheakData = this.childbase.checkFormData();
    if (!cheakData) {
      this.myskip('pending-tab');
      this.message.create('error', `基础信息有必填项没有填写`);
      return;
    }
    // 如果是被拒绝的待提交就要验证备注
    if (this.completed === true) {
      let cheakRemarks = this.remarks.checkFormData();
      if (!cheakRemarks) {
        this.myskip('complete-remarks');
        this.message.create('error', '备注信息没有填写');
        return;
      }
    }
    if ((this.dataBase.businessModel === 'DISTRIBUTOR' && this.dataBase.ddpStatus !== '通过') || (this.dataBase.invoiceInformation === 'USD' && this.dataBase.contractDdpStatus !== '通过')) {
      this.message.create('warning', 'DDP-Status状态未通过');
      this.myskip('pending-tab');
      return;
    }

    //this.dataBase.dealFormId = this.dataBase.dealFormID;
    //delete this.dataBase.dealFormID;
    const dealFormId = this.dataBase.dealFormId
    if (dealFormId == undefined || dealFormId == null && dealFormId == "") {
      this.message.create('error', "请填写dealFormId");
      return;
    }
    // let bmcIsDisbleArr=[]; //所有进单位磁共震文件是否必填的验证
    //let igtIsDisble=[];   //所有进单位塔吊文件是否必填的验证
    //let host;
    this.dataBase.productList.map(res => {
      res.productList.map(vals => {
        delete vals.children;
        delete vals.marketBundle;
      });
      // fix issue: not need to transform this value to JSON format
      /*if (res.other && res.other.length > 0) {
        res.other = JSON.stringify(res.other);
        // res.other = '';
      }*/
    });
    // this.dataBase.contractEndDate =formatDatesNow(this.dataBase.contractEndDate);
    // this.dataBase.poolEndDate=formatDatesNow(this.dataBase.contractEndDate);
    this.load = true;
    this.http.post(url, this.dataBase).subscribe((rest => {
      if (rest.code === '0000') {
        this.message.create('success', `${rest.msg}`);
        this.load = false;
        this.router.navigate(["/igt/my-task"])
      }
      else if(rest.code == '9999')
      {
        this.message.create('error', `此 Deal Form ID 已提交进单`);
        this.load = false;
        return;
      } 
      else {
        this.message.create('error', `${rest.msg}`);
        this.load = false;
      }
    }), (error) => {
      this.load = false;
      this.message.create('error', `请求异常！`);
    });


  }

  handleCancelWinCheck(): void {
    this.isVisibleWinCheck = false;
    this.verifiOff = true;
  }

  // 处理文件 将读取的文件显示在页面上
  // 将字符文件变量 便利成数组对象
  takeFile(filename, filename2) {
    // console.log('处理文件变量');    
    for (let i = 0; i < this.dataBase.productList.length; i++) {
      // this.dataBase.productList[i].paymentProvisionFileNameFileList = [];
      // this.dataBase.productList[i].paymentProvisionFileNameFileList.push(this.dataBase.productList[i].paymentProvisionFileName);
      // this.dataBase.productList[i].paymentProvisionFileName = this.dataBase.productList[i].paymentProvisionFileName;
      if (!this.dataBase.productList[i].productList) {
        this.dataBase.productList[i].productList = [];
      }
      if (this.dataBase.productList[i][filename2.id] && this.dataBase.productList[i][filename2.id] !== '' && this.dataBase.productList[i][filename2.id] != undefined) {
        this.dataBase.productList[i][filename] = [];
        const obj = { uid: '', name: '', fileId: '' };
        obj.uid = this.dataBase.productList[i][filename2.id];
        obj.fileId = this.dataBase.productList[i][filename2.id];
        obj.name = this.dataBase.productList[i][filename2.name];
        this.dataBase.productList[i][filename].push(obj);
      }
    }
    // console.log('处理完成');
    // console.log(this.dataBase);
  }
}
