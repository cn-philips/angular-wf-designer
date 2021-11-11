import {Component, OnInit, ViewChild, ViewChildren, ViewEncapsulation} from '@angular/core';
import {DatatableComponent} from '@swimlane/ngx-datatable';
import {NgForm} from '@angular/forms';
import {Page} from '../domian';
import {AppService} from '../app.service';
import {HttpService, NgxDatatableService, ReportExportService} from '../services';
import {ActivatedRoute, Router} from '@angular/router';
import {ModalDismissReasons, NgbDateParserFormatter, NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {ApprovalMainModalComponent} from '../approval-main-modal/approval-main-modal.component';

@Component({
  selector: 'oa-bwsfile',
  templateUrl: './oa-bwsfile.component.html',
  styleUrls: ['./oa-bwsfile.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OaBwsfileComponent implements OnInit {

  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChildren('filterInputs') filterInputs;
  @ViewChild('searchForm') searchForm: NgForm;

  loadingIndicator = true;
  selected = [];
  rows = [];
  temp = [];
  editing = [];
  tablename: string = '';
  page = new Page();
  bigAreaList: any[] = []; // P2 added
  smallAreaList: any[] = []; // P2 added

  constructor(private appService: AppService,
              private http: HttpService,
              private ngxDatatableService: NgxDatatableService,
              private router: Router,
              private aRoute: ActivatedRoute,
              private modalService: NgbModal,
              private toastrService: ToastrService,
              private parserFormatter: NgbDateParserFormatter,
              private reportService: ReportExportService) {
    this.page.pageNumber = 0;
    this.page.pageSize = 15;
    this.page.sortName = 'startDateTime';
    this.page.sortOrder = 'desc';

    this.aRoute.queryParams.subscribe(params => {
      this.appService.pageTitle = params.name == null ? '' : params.name;
    });

  }

  ngOnInit() {
    this.pageCallback({offset: 0});

    this.getBigSmallAreaList('bigArea');
    this.getBigSmallAreaList('smallArea');
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
      'sortOrder': this.page.sortOrder
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

    // console.log('formValue', formValue);
    // return;
    this.http.post('/act/oabws/query', formValue).subscribe(res => {
      if ('0000' == res.code) {
        const data = res.data['rows'] == null ? [] : res.data['rows'];
        this.rows = [...data];
        this.page.totalElements = res.data['total'];
        console.log('rows', this.rows);
        setTimeout(() => {
          this.loadingIndicator = false;
        }, 1500);
      }
    });
  }

  getCellClass = this.ngxDatatableService.getCellClass;
  getHeaderClass = this.ngxDatatableService.getHeaderClass;

  openProcessDetailModal(row) {
    const {processInstanceId} = row;
    const modal: NgbModalRef = this.modalService.open(ApprovalMainModalComponent, {
      size: 'lg',
      windowClass: 'modal-xl',
      backdrop: 'static',
      keyboard: false
    });
    (<ApprovalMainModalComponent>modal.componentInstance).processInstanceId = processInstanceId;
    (<ApprovalMainModalComponent>modal.componentInstance).pageType = 'OAFile';
    modal.result.then((result) => {
      console.log(`Closed with: ${result}`);
      if (result == 'passTask' || result == 'goBack' || result == 'saveWBS') {
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

  resetForm(){
    this.searchForm.resetForm();
    this.reloadTable();
  }

  //DM小区；RSM大区
  getBigSmallAreaList(flag?: string) {
    let keyWord = 'smallArea' == flag ? 'DM' : 'RSM';
    const uri = '/act/dimension/queryDimensionTreeByGroupCodeAndType';
    const params = {
      type: "Region",
      groupCode: keyWord,
      keyword: ''
    }
    this.http.post(uri, params).subscribe(res => {
      if ('0000' == res.code) {
        console.log(flag, res.data);
        let data = res.data;
        if ('RSM' === keyWord) {
          this.bigAreaList = [...data];
        }
        if ('DM' === keyWord) {
          this.smallAreaList = [...data];
        }
      } else {
        this.toastrService.error(res.msg);
      }
    });
  }

  //todo need optimized
  exportWBS() {
    this.page.pageNumber = 0;
    this.page.pageSize = 1000;
    const params = {
      'pageSize': this.page.pageSize,
      'pageNumber': this.page.pageNumber,
      'sortName': this.page.sortName,
      'sortOrder': this.page.sortOrder
    };

    const formData = this.searchForm ? this.searchForm.value : {};

    const { createTimeStart, createTimeEnd, finishedTimeStart, finishedTimeEnd } = formData;

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

    this.http.post('/act/oabws/query', formValue).subscribe(res => {
      if ('0000' == res.code) {
        const data = res.data['rows'] == null ? [] : res.data['rows'];
        this.rows = [...data];
        this.page.totalElements = res.data['total'];
        console.log('rows', this.rows);
        setTimeout(() => {
          this.loadingIndicator = false;
        }, 1500);


        this.reportService.exportAsExcelFileFromWBS(this.rows, 'Sheet');
      }
    });
  }

}
