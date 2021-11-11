import { Component, OnInit, Input, ViewChild } from '@angular/core';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { QuotationMainComponent } from '../quotation/quotation-main/quotation-main.component';


@Component({
  selector: 'approval-simple-modal',
  templateUrl: './approval-simple-modal.component.html',
  styleUrls: ['./approval-simple-modal.component.scss']
})
export class ApprovalSimpleModalComponent implements OnInit {

  @Input() title = `Information`;

  @ViewChild('quotationMain') quotationMain: QuotationMainComponent;


  mainModalTitle: string = '信息';
  processDefinitionId: string = '';
  processInstanceId: string = '';
  pageType: string = '';
  buttonType: string = 'simple';
  paramsToPass: Object= {};
  myResult: any;
  disabled: false;

  constructor(public activeModal: NgbActiveModal
    ) { }

  ngOnInit() {
    if(this.pageType == 'processDefinitionDiagram') {
      this.buttonType = 'simple';
      this.paramsToPass['processDefinitionId'] = this.processDefinitionId;
    } else if (this.pageType == 'processInstanceDiagram') {
      this.mainModalTitle = '审批进度'
      this.buttonType = 'simple';
      this.paramsToPass['processInstanceId'] = this.processInstanceId;
    } else if(this.pageType == 'quotation') {
      this.mainModalTitle = '报价单信息';
      this.buttonType = 'quotation';
      this.disabled = this.paramsToPass['disabled'];
    } else if(this.pageType == 'quotationSimplePdf') {
      this.buttonType = 'simple';
    } else if (this.pageType == 'quotationTemplatePreview') {
      this.mainModalTitle = '报价单模板预览';
      this.buttonType = 'simple';
    } else if (this.pageType == 'sofonPdfPreview') {
      this.mainModalTitle = 'SOFON文件预览';
      this.buttonType = 'simple';
    }
  }

  closeModal() {
    this.activeModal.close('simple'); 
  }

  updateQData(event){
    this.myResult = event;
    // console.log('updateQData', this.myResult);
  }

  saveAndClose(event){
    if(this.quotationMain && 'close' != event){
      
      //N选M的校验
      let result = this.quotationMain.validateQuotationOption();
      if(!result) {
        return;
      }

      this.quotationMain.updateTotal('callback');
      return;
    }
    console.log('saveAndClose', this.myResult);
    this.activeModal.close(this.myResult);
  }

}
