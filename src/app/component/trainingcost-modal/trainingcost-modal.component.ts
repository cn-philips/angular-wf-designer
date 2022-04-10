import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService, NgxDatatableService, ApprovalService, UtilityService } from '../../services';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-trainingcost-modal',
  templateUrl: './trainingcost-modal.component.html',
  styleUrls: ['./trainingcost-modal.component.scss']
})
export class TrainingcostModalComponent implements OnInit {

  params: any;

  title: string = '';

  pageType: string = ''; // '1': 选择课程必选培训费, '2': 添加课程可选培训费，'3': 

  isProcessing: boolean = false;

  prefix: string = '';

  currencyType: string = '';

  trainingcostOther: any;

  trainingcostList: any[];

  selectedTrainingcost: any =  null;
  
  countObj: any = {val: 1};

  vendorInfo: any;

  trainingcostSample: any;

  formatNumber: any; 
    
  constructor(public activeModal: NgbActiveModal,
    private http: HttpService,
    private ngxDatatableService: NgxDatatableService,
    private approvalService: ApprovalService,
    private toastrService: ToastrService,
    private utilityService: UtilityService) {
      this.formatNumber = this.utilityService.formatPositiveIntNumber;
    }

  ngOnInit() {

    console.log('==> params:', this.params);
    if (this.pageType === '1') {//修改课程培训 必选
      this.currencyType = this.params['currencyType'];
      this.trainingcostList = this.params['groupTrainingList'];
    } else if (this.pageType === '2') {//添加课程培训 可选
      this.currencyType = this.params['currencyType'];
      this.trainingcostList = this.params['groupTrainingList'];
    } else if (this.pageType === '3') { //添加其他培训费
      this.currencyType = this.params['currencyType'];
      this.prefix = this.params['currencyType'] === 'usd' ? '$' : '￥';
      this.trainingcostOther = {count: 1, name: '', amount: 0};
    } else if (this.pageType === '4') {
      this.prefix = this.params['currencyType'] === 'usd' ? '$' : '￥';
      this.trainingcostSample = this.params['trainingcostSample'];
      let vendorId = this.params['vendorId'];
      if(vendorId) {
        let distributorIdParam = vendorId.toUpperCase();
        this.http.post('/act/masterdata/queryJsonByCondition/distributor_eligibility', {
          status: '1',
          'Distributor_ID': distributorIdParam
        }).subscribe(res => {
          if('0000' == res['code']) {
            let vendorList = JSON.parse(res.data);
            if(vendorList.length > 0) {
              this.vendorInfo = vendorList.reduce((a,b) => {
                return (a['Level'] || '') > (b['Level'] || '') ? a:b;
              });
            }
            console.log('vendorList', vendorList);
            console.log('vendorInfo', this.vendorInfo);
          }
        });
      }

    } else if (this.pageType === '5') {
      this.prefix = this.params['currencyType'] === 'usd' ? '$' : '￥';
    }

    console.log('pageType', this.pageType);
  }


  //set the table column and cell style according to your requirement
  getCellClass = this.ngxDatatableService.getCellClass;
  getHeaderClass = this.ngxDatatableService.getHeaderClass

  closeModal() {
    this.activeModal.close('simple');
  }

  closeModalAlt() {
    this.activeModal.close('not simple');
  }

  finishTrainingcostGroupMust(e) {
    if (e) {
      e.preventDefault();
    }

    if (!this.selectedTrainingcost) {
      this.toastrService.warning('请选择培训种类！');
      return;
    }

    this.activeModal.close(this.selectedTrainingcost);
  }

  finishTrainingcostGroupOpt(e) {
    if (e) {
      e.preventDefault();
    }

    if (!this.selectedTrainingcost) {
      this.toastrService.warning('请选择培训种类！');
      return;
    }

    this.selectedTrainingcost['count'] = this.countObj['val'] || 1;
    this.activeModal.close(this.selectedTrainingcost);
  }

  finishOther(e) {
    if(e) {
      e.preventDefault();
    }

    if(!this.trainingcostOther['name'] || this.trainingcostOther['name'].trim() === '') {
      this.toastrService.warning('请填写培训种类！');
      return;
    }

    if (!Number(this.trainingcostOther['amount']) && 0 !== this.trainingcostOther['amount']) {
      this.toastrService.warning('请填写培训费金额！');
      return;
    }

    this.trainingcostOther['name'] = this.trainingcostOther['name'].trim();
    this.activeModal.close(this.trainingcostOther);
  }

}
