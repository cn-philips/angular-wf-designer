import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { LicenseTypePipe } from '../../pipes/license-type.pipe';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import {HttpService, NgxDatatableService, ApprovalService} from '../../services';
import {ToastrService} from 'ngx-toastr';
import { SelectMultipleControlValueAccessor } from '@angular/forms';


@Component({
  selector: 'small-simple-modal',
  templateUrl: './small-simple-modal.component.html',
  styleUrls: ['./small-simple-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SmallSimpleModalComponent implements OnInit {

  params: any;

  title: string = '信息';

  pageType: string = '';

  isProcessing: boolean = false;

  tags: any[];
  inputValue = '';
  inputVisible = false;
  @ViewChild('inputElement') inputElement: ElementRef;

  constructor(public activeModal: NgbActiveModal,
    private http: HttpService,
    private ngxDatatableService: NgxDatatableService,
    private approvalService: ApprovalService,
    private toastrService: ToastrService) { }

  ngOnInit() {

    console.log('==> params:', this.params);
    if (this.pageType === 'totalAndCtp') {
      //no action
    } else if (this.pageType === 'batchApproval') {

    } else if (this.pageType === "pricingLabel") {
      console.log('pricing Label modal init');
      this.tags = this.params['tags'] || [];
    } else if (this.pageType === "omLabel") {
      console.log('om Label modal init');
      this.tags = this.params['tags'] || [];
    }
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

  passBatchTask(event) {
    if(event) {
      event.preventDefault();
    }
    this.isProcessing = true;


    const params = this.approvalService.approvalParams;
    console.log('==> passBatchTask params:', params);

    if (!params || !params['taskInput_comment'] || '' === params['taskInput_comment']) {
      this.toastrService.error('审批意见未填写！');
      this.isProcessing = false;
      return;
    } else if (!params['taskInput_result'] || '' === params['taskInput_result']) {
      this.toastrService.error('审批操作未选择！');
      this.isProcessing = false;
      return;
    }

    const uri = '/act/task/batchCompleteTask';
    console.log('==> batchCompleteTask params:', params);
    this.http.post(uri, params).subscribe(res => {
      console.log('==> batchCompleteTask res:', res);
      if('0000' === res.code) {
        this.toastrService.success('操作成功！');
        this.isProcessing = false;
        this.closeModalAlt();
      } else {
        this.toastrService.error(res.msg);
        this.isProcessing= false;
      }
    });
  }

  // pricingLabel/omLabel related start
  handleClose(removedTag: {}): void {
    this.tags = this.tags.filter(tag => tag !== removedTag);
  }

  showInput(): void {
    this.inputVisible = true;
    setTimeout(() => {
      this.inputElement.nativeElement.focus();
    }, 10);
  }

  handleInputConfirm(): void {
    if (this.inputValue && this.tags.indexOf(this.inputValue) === -1) {
      this.tags = [...this.tags, this.inputValue];
    }
    this.inputValue = '';
    this.inputVisible = false;
  }

  saveLabel() {
    this.activeModal.close(this.tags);
  }
  // pricingLabel/omLabel related end

}
