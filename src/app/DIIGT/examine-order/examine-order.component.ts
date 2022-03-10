import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {AppService} from '../../app.service';
import {HttpService} from '../../services';
import {ToastrService} from 'ngx-toastr';
import {ApprovalMainModalComponent} from '../../approval-main-modal/approval-main-modal.component';
import {NgbModal, ModalDismissReasons, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {NzMessageService} from 'ng-zorro-antd';
import {decodeString} from '../../../assets/js/tools';


@Component({
  selector: 'app-examineOrder',
  templateUrl: './examine-order.component.html',
  styleUrls: ['./examine-order.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ExamineOrderIGTComponent implements OnInit {
  activedId: any = "pending-tab";
  generateContractDraftSwitch = false;
  public title:any; //标题
  public dataBase: any = {
    productList: [], // 产品列表
    detail: {
      id: '',
      flag: '',
      status: '',
      taskID: this.activatedRouter.queryParams['_value'].taskID
    },
    shipmentDeliveryRemarks:"",
  };

  constructor (
    private nzMessageService: NzMessageService,
    private appService: AppService,
    private http: HttpService,
    private toastrService: ToastrService,
    private router: Router,
    private modalService: NgbModal,
    private aRoute: ActivatedRoute,
    private message: NzMessageService,
    public activatedRouter: ActivatedRoute,
  ) {
    this.appService.pageTitle = '主页';
    this.dataBase.detail = {
      id: decodeString(this.activatedRouter.queryParams['_value'].id),
      flag: this.activatedRouter.queryParams['_value'].flag,
      status: this.activatedRouter.queryParams['_value'].status,
      taskID: this.activatedRouter.queryParams['_value'].taskID
    };

    console.log(this.dataBase.detail);

  }
  public myskip(val): void { // 外部触发tab选项卡的事件
    
    this.activedId = val;
  }
  ngOnInit(): void {
    this.getDataBase();
  }
  getDataBase(): void {
    // 获取mainid
    const mainId = decodeString(this.activatedRouter.queryParams['_value'].id);
    const url = `/act/preparation/queryContractSummary?mainId=${mainId}`;
    // 获取基础信息数据
    this.http.post(url).subscribe(res => {
      if (res.data) {
       // this.dataBase = Object.assign(this.dataBase, res.data);
       this.dataBase=res.data;
        if (this.dataBase.sameFlag != null) {
          this.dataBase.sameFlag = this.dataBase.sameFlag.toString();
        }        
       this.dataBase.detail = {
      id: decodeString(this.activatedRouter.queryParams['_value'].id),
      flag: this.activatedRouter.queryParams['_value'].flag,
      status: this.activatedRouter.queryParams['_value'].status,
      taskID: this.activatedRouter.queryParams['_value'].taskID      
    };
    this.title=this.dataBase.detail.status=="DOAJDQR"?"进单确认":"审核合同概要表";
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
        // this.dataBase.performanceBondFileName=this.dataBase.preparationProductList[0].performanceBondFileName;
        // this.dataBase.shipmentDeliveryFileName=this.dataBase.preparationProductList[0].shipmentDeliveryFileName;
        // this.dataBase.installationWarrantyFileName=this.dataBase.preparationProductList[0].installationWarrantyFileName;
        // this.dataBase.amountDifferenceFileName=this.dataBase.preparationProductList[0].amountDifferenceFileName;
        // this.dataBase.sitePreparationFileName=this.dataBase.preparationProductList[0].sitePreparationFileName;
        // this.dataBase.otherFilName=this.dataBase.preparationProductList[0].otherFilName;
      } else {
        this.message.create('error', '获取数据失败');
      }
    });
  }
  updateDataBase(value: any) {
    console.log('value', value);
   // console.log('this.dataBase', this.dataBase);
  //  this.dataBase=Object.assign(this.dataBase,value);
    // values.forEach()
    // this.dataBase = {};
  }

  cancelContract(): void {
  }

  saveContract(): void {
  }

  cancelGenerateContractDraft(): void {
    this.nzMessageService.info('点击取消');
    this.generateContractDraftSwitch = false;
  }

  confirmGenerateContractDraft(): void {
    this.nzMessageService.info('点击确认');
    this.generateContractDraftSwitch = true;
    this.dataBase.productList.map((item, index) => {
      item.showActionsSwitch = false;
    });
  }
  jump(result, url, name) {
    this.router.navigate([result], {
      queryParams: {
        url, name
      }
    });
  }
  updateBase(val)
  {
    console.log(val)
    this.dataBase=Object.assign({},val);
  }


}
