import { Component, OnInit, NgModule, Input, Output, ViewChild } from '@angular/core';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { FileService, HttpService } from '../../services';
import { NzMessageService } from 'ng-zorro-antd';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { formatDatesNow, cheakDate } from '../../../assets/js/tools';
import { TimeFormatePipe } from '../../pipes/time-formate.pipe';
@Component({
  selector: 'app-apply-tender',
  templateUrl: './apply-tender.component.html',
  styleUrls: ['./apply-tender.component.scss'],
  providers: [NgbTabset]
})

export class ApplyTenderComponent implements OnInit {
  @ViewChild('childbase') childbase;
  @ViewChild('supplement') supplement;
  @ViewChild('product') product;
  public arr: any = {
    tabList: [],
    crmData: [],
    firstopp: false,
    //全局选中Opp
    CkOppo: {},
  };
  public file_arr: any = {
    fileList: [], // 上传招标文件列表
    fileSealList: [], // 上传盖章后的文件列表
    fileAgentList: [], // 协议代理商出具投标委托函
  };

  public paramsCP = {
    pageNo: 1,
    pageSize: 10,
    total: 0
  };
  public paramsCRM = {
    pageNo: 1,
    pageSize: 10,
    total: 0
  };

  processList: any = [{ name: "默认cp或者CRM链接带入" }, { name: "Distribute Deal" }, { name: "Direct Deal" },];
  public test: string = "";
  public activedId: any = "pending-tab";
  public load: boolean = false; // 加载转圈
  public dataBase: any = {
    applyType: null, // 招标授权模式
    baseDataFrom: '', // 当前数据来源
    referenceId: '', // Reference_id;
    dealFormId: '', // dealFormId,
    biddingName: '', // 招标项目
    biddinOrgName: '', // 招标机构
    businessType: null, // 业务模式，
    biddingNo: '', // 招标编号，
    openBiddingDate: '', // 开标日期，
    biddingComId: '', // 开标公司
    biddingComRegAddress: '', // 投标公司注册地址
    biddingValidDay: 90, // 投标有效期
    purchaseGroup: '', // 采购集团名称
    secondaryAgentBidding: '', // 是否二级代理商
    biddingComRegCode: '中国', // 投标公司注册所在地
    hospitalName: '', // 医院名称
    hospitalProvinceCode: '', // 省份
    clientType: '', // 客户类型
    biddingManager: '', // 投标负责人
    biddingManagerTitle: '', // 投标负责人职务
    status: 0, // 0保存 1提交
    fileId: '', // 上传文件Id
    tenderDeclarationLetter: '', // 在线提交参与投标声明函
    logisticsDescription: '', // 物流条款说明
    afterSalesInstructions: '', // 售后维修条款说明
    tenderPriceCurrencys: null, // 预计投标价格币种
    bidPriceCurrency: null, // 预计投标价格币种
    performanceBondsCurrency: null, // 预计投标价格币种
    tenderPriceCurrency: '', // 预计投标价格金额
    percentageTotalPrice: '', // 总价百分比
    totalPrice: '', // 总金额
    marginLevel: '', // 合同保证金比例
    paymentDescription: '', // 付款方式说明
    paymentDescriptions: '', // 付款方式说明长文本框
    technicalTerms: '', // 技术条款说明
    legalProvisions: '', // 涉及法律条款说明
    tenderAuthorization: 'nonprivate', // 是否需要投标授权
    agentBidding: 'agency', // 是否为二级代理商投标
    biddingDdpState: '3', // 投标公司DDP状态,
    biddingNames: '', // 投标公司名称
    agreementAgenName: '', // 协议代理商名称
    tenderApplicationLetter: '12', // 打印投标申请函
    tenderEntrustmentLetter: '12', // 打印投标委托函
    agreementAgentTenderEntrustmentLetter: '', // 协议代理商出具投标委托函,
    productInformations: [],
    sealedFileId: '', // 盖章后的投标申请函
    contractorTenderEntrustmentFileId: '', // 盖章后的投标申请函
    businessOpportunityHierarchyLink: '', // 商家层级链接
    paymentList: [], // 支付方式说明列表
    change: false, // 控制清除与否
    logisticsTermsExplain: '', // 物流条款说明
    performanceBonds: '', // 履约保证金金额
    bidType: null, // 招标类型
    distributorAgreement: [],
    distributorType: '年度协议'
  };

  //产品信息
  public productData: any = [];

  // 所有经销商
  public selAgent_all: any = [];
  constructor(
    private http: HttpService,
    private message: NzMessageService,
    private router: Router,
    private fb: FormBuilder,
  ) { }
  validateForm: FormGroup;
  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.validateForm.controls.password.value) {
      return { confirm: true, error: true };
    }
    return {};
  };
  ngOnChanges() {


  }
  ngDoCheck() {

  }
  ngOnInit() {
    this.validateForm = this.fb.group({
      test: [null, [Validators.required]],
    });
    this.getAllselAgent();
  }
  public getAllselAgent() {
    const url = `/act/ecom/bidding/selAgent`;
    const data = {
      pageNo: 1,
      pageSize: 0x7fffffff
    };
    this.http.post(url, data).subscribe(res => {
      if (res && res.data) {
        this.selAgent_all = res.data.rows;
      }
    }, error => {

    });
  }
  public disableValidateForm(val) {
    this.childbase.DisableValidateForm();
  }
  upData(val) {
    this.productData = Object.assign([], val);
  }
  public myskip(val): void { //外部触发tab选项卡的事件
    this.activedId = val;
  }
  public addProduct(val) {
    this.product.getProductInsert(val.opportunityId, val.dealFormId, val.CpOrCrm);
  }
  tabclick(val) //tab选项卡的点击事件
  {
    this.activedId = val.nextId;
  }
  public save(): void {
    let url = '/act/ecom/tender/application/saveAndSubmit';
    this.dataBase.status = 0;
    let productInformations = JSON.parse(JSON.stringify(this.productData));
    productInformations.map(res => {
      delete res.listOfMapData;
    })

    this.dataBase.productInformations = JSON.parse(JSON.stringify(productInformations));
    if (this.dataBase.openBiddingDate !== null && this.dataBase.openBiddingDate !== undefined && this.dataBase.openBiddingDate !== "") {
      this.dataBase.openBiddingDate = formatDatesNow(this.dataBase.openBiddingDate);
    }
    // 暂时前端添加限制
    if (this.dataBase.productInformations.length < 1) { // 判断是否选择了Opportunity
      this.myskip('complete-tab');
      this.message.create('error', `请添加Opportunity`);
      return;
    }
    // 将crm accountid 存入
    if (this.dataBase.baseDataFrom === 'CRM') {
      if (this.dataBase.productInformations && this.dataBase.productInformations.length > 0) {
        for (let i = 0; i < this.dataBase.productInformations.length; i++) {
          if (this.dataBase.productInformations[i].productInformations && this.dataBase.productInformations[i].productInformations.length > 0) {
            for (let j = 0; j < this.dataBase.productInformations[i].productInformations.length; j++) {
              this.dataBase.productInformations[i].productInformations[j].accountId = this.dataBase.accountId;
            }
          }
        }
      }
    }
    this.load = true;
    this.http.post(url, this.dataBase).subscribe((res => {
      if (res.code == '0000') {
        this.message.create('success', `保存成功`);
        this.router.navigate(["/igt/my-task"])
        this.load = false;
      }
      else {
        this.message.create('error', res.msg);
        this.load = false;
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "服务器异常！")
    }));
  }
  public submit(): void {
    let url = '/act/ecom/tender/application/saveAndSubmit';
    this.dataBase.status = 1;
    const cheakbase = this.childbase.checkFormData(); // 基础信息验证
    const cheaksuppl = this.supplement.checkFormData(); // 补充信息的验证
    let productInformations = JSON.parse(JSON.stringify(this.productData));
    productInformations.map(res => {
      delete res.listOfMapData;
    });
    if (productInformations && productInformations.length) {
      productInformations.map(vals => {
        if (vals.productInformations && vals.productInformations.length > 0) {
          vals.productInformations.map(item => {
            item.checked = false;
          })
        }
      })
    }
    this.dataBase.productInformations = JSON.parse(JSON.stringify(productInformations));

    // 选择否不验证
    if (!cheaksuppl) {
      this.myskip('complete-pad');
      this.message.create('error', `有必填项没有填写`);
      return;
    }

    if (this.dataBase.businessType === 'DISTRIBUTOR' && this.dataBase.biddingDdpState === '未通过') {
      this.message.create('error', '投标公司DDP状态未通过');
      return;
    }
    if (this.dataBase.businessType === 'DISTRIBUTOR' && this.dataBase.agreementDealerDdpState === '未通过') {
      this.message.create('error', '协议经销商DDP状态未通过');
      return;
    }

    if (this.dataBase.tenderAuthorization === 'nonprivate' && this.dataBase.businessType === 'DIRECT') {
      // 投标保证金验证
      // percentageTotalPrice totalPrice
      const percentageTotalPrice = this.dataBase.percentageTotalPrice;
      const totalPrice = this.dataBase.totalPrice;
      if ((percentageTotalPrice == null || percentageTotalPrice === '') && (totalPrice == null || totalPrice === '')) {
        this.message.create('error', `投标保证金请至少填写一项`);
        return;
      }
      // 履约保证金
      // marginLevel performanceBonds
      const marginLevel = this.dataBase.marginLevel;
      const performanceBonds = this.dataBase.performanceBonds;
      if ((marginLevel == null || marginLevel === '') && (performanceBonds == null || performanceBonds === '')) {
        this.message.create('error', `履约保证金请至少填写一项`);
        return;
      }
    }
    if (this.dataBase.businessType === 'DIRECT') {
      // 验证 投标保证金 履约保证金 小于 预计投标价格
      const totalPrice = parseFloat(this.dataBase.totalPrice);
      const performanceBonds = parseFloat(this.dataBase.performanceBonds);
      let tenderPriceCurrency = parseFloat(this.dataBase.tenderPriceCurrency);
      if (isNaN(tenderPriceCurrency)) {
        tenderPriceCurrency = 0;
      }
      if ((totalPrice != null && !isNaN(totalPrice) && totalPrice > tenderPriceCurrency) ||
        (performanceBonds != null && !isNaN(performanceBonds) && performanceBonds > tenderPriceCurrency)) {
        this.message.create('error', `投标保证金和履约保证金要不大于预计投标价格`);
        return;
      }
    }
    // 验证 协议代理商出具投标委托函
    if (this.dataBase.agentBidding === 'agency' && this.dataBase.tenderAuthorization === 'nonprivate' && this.dataBase.businessType === 'DISTRIBUTOR') {
      if (this.dataBase.contractorTenderEntrustmentFileId == null || this.dataBase.contractorTenderEntrustmentFileId === '') {
        this.message.create('error', `请上传协议代理商出具投标委托函`);
        return;
      }
    }
    // 验证 招标文件
    if (this.dataBase.businessType === 'DIRECT' && this.dataBase.tenderAuthorization === 'nonprivate') {
      if (this.dataBase.fileId == null || this.dataBase.fileId === '') {
        this.message.create('error', `请上传招标文件`);
        return;
      }
    }

    if (!cheakbase) {
      this.myskip('pending-tab');
      this.message.create('error', `有必填项没有填写`);
      return;
    }
    // this.dataBase.tenderAuthorization === 'nonprivate'

    if (this.dataBase.productInformations.length < 1) { // 判断是否选择了Opportunity
      this.myskip('complete-tab');
      this.message.create('error', `没有选择Opportunity`);
      return;
    }

    const prodcutLenth = this.dataBase.productInformations.every(res => res.productInformations.length > 0); // 判断是否选择了产品
    if (!prodcutLenth) {
      this.myskip('complete-tab');
      this.message.create('error', `有Opportunity没有选择产品`);
      return;
    }
    this.dataBase.productInformations.map(res => { // 产品绑定上opportunityid
      res.productInformations.map(vals => {
        vals.opportunityId = res.opportunityId;
        vals.referenceId = this.dataBase.referenceId;
        vals.modalityBmc && (vals.bmc = vals.modalityBmc);
        if (vals.productInformations && vals.productInformations.length > 0) {
          vals.productInformations.map(valss => {
            valss.bmc = valss.modalityBmc;
          });
        }
      });
    });
    // this.dataBase.tenderAuthorization === 'nonprivate'
    // 选择否不验证
    if (this.dataBase.businessType === 'DISTRIBUTOR' && this.dataBase.tenderAuthorization === 'nonprivate') {
      const sealedFileId = this.dataBase.sealedFileId;
      if (sealedFileId === '' || sealedFileId == null || sealedFileId == undefined) {
        this.myskip('complete-pad');
        this.message.create('error', `请上传投标申请函`);
        return;
      }
    }

    // 将crm accountid 存入
    if (this.dataBase.baseDataFrom === 'CRM') {
      if (this.dataBase.productInformations && this.dataBase.productInformations.length > 0) {
        for (let i = 0; i < this.dataBase.productInformations.length; i++) {
          if (this.dataBase.productInformations[i].productInformations && this.dataBase.productInformations[i].productInformations.length > 0) {
            for (let j = 0; j < this.dataBase.productInformations[i].productInformations.length; j++) {
              this.dataBase.productInformations[i].productInformations[j].accountId = this.dataBase.accountId;
            }
          }
        }
      }
    }

    // if (cheakbase&&cheaksuppl)
    // {
    //   console.log('通过');
    this.dataBase.openBiddingDate = formatDatesNow(this.dataBase.openBiddingDate);
    this.load = true;
    console.log(this.dataBase);
    // return;
    this.http.post(url, this.dataBase).subscribe((res => {
      if (res.code == '9999') {
        this.message.create('error', `此 Opportunity ID 和 Deal Form ID 已提交投标`);
        this.load = false;
        return;
      }
      if (res.code == '0000') {
        this.message.create('success', `提交成功`);
        this.router.navigate(['/igt/my-task']);
        this.load = false;
      } else {
        this.message.create('error', res.msg);
        this.load = false;
      }
    }), (error => {
      this.load = false;
      this.message.create('error', '服务器出错请联系管理员');
    }));
    // }
    // else
    // {
    //   this.message.create('error', `有必填项没有填写`);
    // }
  }
}
