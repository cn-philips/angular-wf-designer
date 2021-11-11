import {Component, OnInit, ViewEncapsulation, ViewChild, ViewChildren} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {DatatableComponent} from '@swimlane/ngx-datatable';
import {ApprovalSimpleModalComponent} from '../approval-simple-modal/approval-simple-modal.component';
import {AppService} from '../app.service';
import {HttpService, NgxDatatableService} from '../services';
import {MyApprovalStatePipe} from '../pipes/my-approval-state.pipe';
import {Page} from '../domian';
import {NgbModal, NgbActiveModal, ModalDismissReasons, NgbModalRef, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {ApprovalMainModalComponent} from '../approval-main-modal/approval-main-modal.component';

@Component({
  selector: 'my-approval',
  templateUrl: './my-approval.component.html',
  styleUrls: ['./my-approval.component.scss'],
  providers: [MyApprovalStatePipe],
  encapsulation: ViewEncapsulation.None
})
export class MyApprovalComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChildren('filterInputs') filterInputs;
  @ViewChild('searchForm') searchForm: NgForm;

  loadingIndicator = true;
  rows = [];
  temp = [];
  selected = [];
  columnName = [];
  editing = [];
  tablename: string = '';
  // columnFilterName = ["name","processinstanceid"];
  mainFunctionUrl: string;
  page = new Page();
  processList: [any];

  constructor(private appService: AppService,
              private http: HttpService,
              private ngxDatatableService: NgxDatatableService,
              private router: Router,
              private aRoute: ActivatedRoute,
              private modalService: NgbModal,
              private toastrService: ToastrService,
              private parserFormatter: NgbDateParserFormatter) {
    this.page.pageNumber = 0;
    this.page.pageSize = 15;
    this.page.sortName = 'startDateTime';
    this.page.sortOrder = 'desc';

    this.aRoute.queryParams.subscribe(params => {
      this.mainFunctionUrl = '/act' + params.url;
      this.appService.pageTitle = params.name == null ? '' : params.name;
    });

  }

  ngOnInit() {
    this.http.get('/act' + '/model/listAction').subscribe(res => {
      if ('0000' == res.code) {
        this.processList = res.data;
      }
    });

    this.pageCallback({offset: 0});
  }

  pageCallback(pageInfo: { count?: number, pageSize?: number, limit?: number, offset?: number }) {
    this.page.pageNumber = pageInfo.offset;
    this.reloadTable();
  }

  sortCallback(sortInfo: { sorts: { dir: string, prop: string }[], column: {}, prevValue: string, newValue: string }) {
    // there will always be one "sort" object if "sortType" is set to "single"
    this.page.sortOrder = sortInfo.sorts[0].dir;
    this.page.sortName = sortInfo.sorts[0].prop;
    this.reloadTable();
  }

  reloadTable() {

    // NOTE: those params key values depends on your API!
    const params = {
      'pageSize': this.page.pageSize,
      'pageNumber': this.page.pageNumber,
      'sortName': this.page.sortName,
      'sortOrder': this.page.sortOrder,
      'owner': localStorage.getItem('ng_philips_code1')
    };

    const formData = this.searchForm ? this.searchForm.value : {};

    const {createTimeStart, createTimeEnd, finishedTimeStart, finishedTimeEnd} = formData;

    const formValue = {
      ...params,
      ...formData,
      createTime: {
        start: this.parserFormatter.format(createTimeStart),
        end: this.parserFormatter.format(createTimeEnd)
      },
      endTime: {
        start: this.parserFormatter.format(finishedTimeStart),
        end: this.parserFormatter.format(finishedTimeEnd)
      }
    };
    const uri = this.mainFunctionUrl;
    this.http.post(uri, formValue).subscribe(res => {
      if ('0000' == res.code) {
        const data = res.data['rows'] == null ? [] : res.data['rows'];

        this.rows = [...data];
        this.page.totalElements = res.data['total'];
        setTimeout(() => {
          this.loadingIndicator = false;
        }, 1500);
      }
    });
  }

  //set the table column and cell style according to your requirement
  getCellClass = this.ngxDatatableService.getCellClass;
  getHeaderClass = this.ngxDatatableService.getHeaderClass;

  updateRowList() {
    this.fetch((data) => {
      // console.log(data);
      this.temp = [...data];
      this.rows = [...data];

      // remove 'id' column from table view
      const idx = this.columnName.indexOf('id', 0);
      if (idx > -1) {
        this.columnName.splice(idx, 1);
      }

      setTimeout(() => {
        this.loadingIndicator = false;
      }, 1500);
    });
  }

  //server-paging in this table
  fetch(cb) {
    const uri = this.mainFunctionUrl;
    // this.http.post(uri, {}).subscribe(res =>{ //TODO change to post before 
    this.http.get(uri).subscribe(res => {
      console.log(res);
      if ('0000' == res.code) {

        const data = res.data['rows'] == null ? [] : res.data['rows'];
        // cb(JSON.stringify(data));
        cb(data);
      }
    });
  }

  //filter function
  updateFilterAll(event) {

    let filterRows = this.temp;
    for (let i = 0; i < this.filterInputs.length; i++) {
      this.filterInputs.toArray().forEach(el => {
        const currentFiltername = el.nativeElement.getAttribute('filtername');
        const userInput = el.nativeElement.value.toLowerCase();

        filterRows = filterRows.filter(function (d) {
          return d[currentFiltername].toLowerCase().indexOf(userInput) !== -1 || !userInput;
        });
      });
    }

    // update the rows
    this.rows = filterRows;
    // Whenever the filter changes, always go back to the first page
    if (this.table) {
      this.table.offset = 0;
    }
  }

  //撤销流程
  cancelProcess(row) {
    const {processInstanceId} = row;
    const uri = `/act/task/cancelProcessor/${processInstanceId}`;
    this.http.get(uri).subscribe(res => {
      if ('0000' === res.code) {
        this.toastrService.success('撤销流程成功！');
        this.reloadTable();
      } else {
        this.toastrService.error(res.msg);
      }
    });
  }

  openProcessDetailModal(row) {
    const {processInstanceId} = row;
    console.log('openFinishedModal', processInstanceId);
    const modal: NgbModalRef = this.modalService.open(ApprovalMainModalComponent, {
      size: 'lg',
      windowClass: 'modal-xl',
      backdrop: 'static',
      keyboard: false
    });
    (<ApprovalMainModalComponent>modal.componentInstance).processInstanceId = processInstanceId;
    (<ApprovalMainModalComponent>modal.componentInstance).pageType = 'finishedProcess';
    modal.result.then((result) => {
      console.log(`Closed with: ${result}`);
      if (result == 'passTask' || result == 'goBack') {
        this.pageCallback({offset: 0});
      }
    }, (reason) => {
      console.log(`Dismissed ${this.getDismissReason(reason)}`);
    });
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

  applyFilter() {
    this.page.pageNumber = 0;
    this.reloadTable();
  }

  resetForm() {
    this.searchForm.resetForm();
    this.reloadTable();
  }

}
