import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {DatatableComponent} from '@swimlane/ngx-datatable';
import {ApprovalMainModalComponent} from '../approval-main-modal/approval-main-modal.component';
import {AppService} from '../app.service';
import {HttpService, NgxDatatableService, GlobalService, ApprovalService} from '../services';
import {Page} from '../domian';
import {IsCompletedPipe} from '../pipes/is-completed.pipe';
import {ModalDismissReasons, NgbDateParserFormatter, NgbModal, NgbModalRef,} from '@ng-bootstrap/ng-bootstrap';
import { ApprovalSimpleModalComponent } from '../approval-simple-modal/approval-simple-modal.component';
import { SmallSimpleModalComponent } from '../component/small-simple-modal/small-simple-modal.component';
import { ToastrService } from 'ngx-toastr'

@Component({
  selector: 'my-task-complete',
  templateUrl: './my-task-complete.component.html',
  styleUrls: ['./my-task-complete.component.scss'],
  providers: [IsCompletedPipe],
  encapsulation: ViewEncapsulation.None
})
export class MyTaskCompleteComponent implements OnInit {
  @ViewChild(DatatableComponent) tableComplete: DatatableComponent;
  @ViewChild('searchForm') searchForm: NgForm;

  loadingIndicator = true;
  rows = [];
  temp = [];
  selected = [];
  editing = [];
  tablename: string = '';
  mainFunctionUrl: string;
  page = new Page();
  processList: [];
  batchFlag: boolean = false; //Finance Controller flag

  selectUserList: any[] = [];
  //set the table column and cell style according to your requirement
  getCellClass = this.ngxDatatableService.getCellClass;
  getRejectCellClass = this.ngxDatatableService.getRejectCellClass;
  getHeaderClass = this.ngxDatatableService.getHeaderClass;

  constructor(private appService: AppService,
              private http: HttpService,
              private ngxDatatableService: NgxDatatableService,
              private router: Router,
              private aRoute: ActivatedRoute,
              private modalService: NgbModal,
              private parserFormatter: NgbDateParserFormatter,
              private globalService: GlobalService,
              private approvalService: ApprovalService,
              private toastrService: ToastrService) {

    this.page.pageNumber = 0;
    this.page.pageSize = 15;
    this.page.sortName = 'createTime';
    this.page.sortOrder = 'desc';

    this.aRoute.queryParams.subscribe(params => {
      this.mainFunctionUrl = '/act' + params.url + localStorage.getItem('ng_philips_code1');
      this.appService.pageTitle = params.name == null ? '' : params.name;
    });

  }

  searchUser = (keyword) => {
    keyword && keyword.length >= 2 && this.http.get(`/act/queryUserByKeyword/${keyword}`).subscribe(rest => {
      if (rest.code === '0000') {
        this.selectUserList = rest.data.map(item => {
          return {
            text: item.name,
            value: item,
          };
        });
      }
    });
  };

  async ngOnInit() {
    this.http.get('/act' + '/model/listAction').subscribe(res => {
      if ('0000' == res.code) {
        this.processList = res.data;
      }
    });

    let groups = await this.globalService.getGroupsAsync();
    console.log('groups', groups);
    if (groups.length > 0 && (groups.indexOf('FINANCE_CONTROLLER') > -1 || groups.indexOf('FINANCE_BP') > -1 || groups.indexOf('PRODUCT_MARKETING_MANAGER') > -1 || groups.indexOf('PRODUCT_MARKETING_LEADER') > -1 || groups.indexOf('GM') > -1)) {
      this.page.pageNumber = 15;
      this.batchFlag = true;
    }

    this.page.pageNumber = 0; //初始化时第一页
    this.reloadTable('init');
  }

  pageCallback(pageInfo: { count?: number, pageSize?: number, limit?: number, offset?: number }) {
    this.page.pageNumber = pageInfo.offset;
    this.reloadTable('page');
  }

  reloadTable(flag?: string) {

    const params = {
      'complete': true,
      'pageSize': this.page.pageSize,
      'pageNumber': this.page.pageNumber,
      'sortName': this.page.sortName,
      'sortOrder': this.page.sortOrder
    };

    const formData = this.searchForm ? this.searchForm.value : {};

    const {createTimeStart, createTimeEnd, finishedTimeStart, finishedTimeEnd, ...rest} = formData;
    const {owner, ...another} = rest;

    let formValue = {
      ...params,
      ...another,
      createTime: {
        start: this.parserFormatter.format(createTimeStart),
        end: this.parserFormatter.format(createTimeEnd)
      },
      endTime: {
        start: this.parserFormatter.format(finishedTimeStart),
        end: this.parserFormatter.format(finishedTimeEnd)
      }
    };
    console.log('==> another:', another);
    console.log('==> owner:', owner);
    if (owner && owner.value) {
      console.log('==> owner code:', owner.value.code);
      formValue['owner'] = owner.value.code;
    }
    console.log('==> formValue:', formValue);
    const uri = this.mainFunctionUrl;
    this.http.post(uri, formValue).subscribe(res => {
      if ('0000' == res.code) {
        const data = res.data['rows'] == null ? [] : res.data['rows'];
        if ('page' === flag && data.length == 0 && this.page.pageNumber != 0) {
          this.page.pageNumber = 0;
          this.reloadTable();
          return;
          ;
        }
        this.rows = [...data];
        this.page.totalElements = res.data['total'];
        setTimeout(() => {
          this.loadingIndicator = false;
        }, 1500);
      }
    });
  }

  open(content, row) {
    const modal: NgbModalRef = this.modalService.open(ApprovalMainModalComponent, {
      size: 'lg',
      windowClass: 'modal-xl',
      backdrop: 'static',
      keyboard: false
    });
    (<ApprovalMainModalComponent>modal.componentInstance).activitiTask = row;
    (<ApprovalMainModalComponent>modal.componentInstance).pageType = 'mytask';
    (<ApprovalMainModalComponent>modal.componentInstance).disabled = true;
    (<ApprovalMainModalComponent>modal.componentInstance).processInstanceId = row.processInstanceId;
    modal.result.then((result) => {
      console.log(`Closed with: ${result}`);
      if (result == 'passTask' || result == 'goBack') {
        this.pageCallback({offset: 0});
      }
    }, (reason) => {
      console.log(`Dismissed ${this.getDismissReason(reason)}`);
    });
  }

  //TODO
  applyFilter() {
    this.page.pageNumber = 0;
    this.reloadTable();
  }

  resetForm() {
    this.searchForm.resetForm();
    this.selectUserList = [];
    this.reloadTable();
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  //P2 added
  async viewTaskFile(content, row) {
    console.log('==> task row:', row);

    const uri = '/act/home/sofonPDFReview/' + row.id;
    const res = await this.http.get(uri).toPromise();
    if ('0000' === res['code']) {
      console.log('==> sofonPDFReview:', res);
      const modal: NgbModalRef = this.modalService.open(ApprovalSimpleModalComponent, {
        size: 'lg',
        windowClass: 'quotation-modal',
        backdropClass: 'quotation-backdrop',
        backdrop: 'static',
        keyboard: false
      });

      (<ApprovalSimpleModalComponent>modal.componentInstance).pageType = 'sofonPdfPreview';
      (<ApprovalSimpleModalComponent>modal.componentInstance).paramsToPass = res.data;
    } else {
      console.log('==> sofonPDFReview:', res);
      this.toastrService.warning('无法预览SOFON文件，请进入订单详情页查看。')
    }
  }

  async viewTotalSum(event, row) {
    let result = await this.approvalService.getFormData(row);
    if (result && (result['commercialquotationadd'] || result['quotationadd'])) {
      let obj = undefined;
      if (result['commercialquotationadd']) {//通用订单时
        obj = {
          type: '1',
          obj: JSON.parse(result['commercialquotationadd'])
        };
      } else {//特价订单时
        obj = {
          type: '0',
          obj: JSON.parse(result['quotationadd'])
        };
      }

      let sumDetail = this.approvalService.getTotalAndCTP(obj)
      console.log('==> sumDetail:', sumDetail);

      let modalSize: 'lg' | 'sm' = 'sm';
      if (sumDetail['type'] && sumDetail['type'] === '0') {
        modalSize = 'lg';
      }


      const modal: NgbModalRef = this.modalService.open(SmallSimpleModalComponent, {
        size: modalSize,
        // backdrop: 'static',
        backdrop: true,
        keyboard: false
      });
      (<SmallSimpleModalComponent>modal.componentInstance).pageType = 'totalAndCtp';
      (<SmallSimpleModalComponent>modal.componentInstance).title = '查看价格';
      (<SmallSimpleModalComponent>modal.componentInstance).params = sumDetail;

      modal.result.then((result) => {
        if ('simple' == result) {
          console.log('modal simply closed');
        }
      }, (reason) => {
        console.log(`Dismissed ${this.getDismissReason(reason)}`);
      });
    } else {
      this.toastrService.error('未找到价格信息，请进入订单详细页查看。');
      console.log(result);
    }
  }


}
