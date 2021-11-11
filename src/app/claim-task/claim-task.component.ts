import {Component, OnInit, ViewChild, ViewChildren, Pipe, PipeTransform} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {DatatableComponent} from '@swimlane/ngx-datatable';
import {AppService} from '../app.service';
import {HttpService, NgxDatatableService} from '../services';
import {Page} from '../domian';
import {ToastrService} from 'ngx-toastr';
import {
  NgbModal,
  NgbDateStruct,
  NgbDateParserFormatter
} from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-claim-task',
  templateUrl: './claim-task.component.html',
  styleUrls: ['./claim-task.component.scss'],
})
export class ClaimTaskComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('searchForm') searchForm: NgForm;

  loadingIndicator = true;
  rows = [];
  selected = [];
  page = new Page();
  filterTaskName: string;
  mainFunctionUrl: string;
  filterCreateTimeStart: NgbDateStruct;
  filterCreateTimeEnd: NgbDateStruct;
  getCellClass = this.ngxDatatableService.getCellClass;
  getHeaderClass = this.ngxDatatableService.getHeaderClass;
  processList: [];


  constructor(private appService: AppService,
              private http: HttpService,
              private ngxDatatableService: NgxDatatableService,
              private router: Router,
              private aRoute: ActivatedRoute,
              private modalService: NgbModal,
              private parserFormatter: NgbDateParserFormatter,
              public toastrService: ToastrService) {
    this.page.pageNumber = 0;
    this.page.pageSize = 15;
    this.page.sortName = 'createTime';
    this.page.sortOrder = 'desc';
    this.aRoute.queryParams.subscribe(params => {
      this.mainFunctionUrl = '/act' + params.url + localStorage.getItem('ng_philips_code1');
      this.appService.pageTitle = params.name == null ? '' : params.name;
    });
  }

  ngOnInit() {
    this.pageCallback({offset: 0});
    this.http.get('/act' + '/model/listAction').subscribe(res => {
      if ('0000' == res.code) {
        this.processList = res.data;
      }
    });
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
    const params = {
      'pageSize': this.page.pageSize,
      'pageNumber': this.page.pageNumber,
      'sortName': this.page.sortName,
      'sortOrder': this.page.sortOrder
    };

    const formData = this.searchForm ? this.searchForm.value : {};

    const {createTimeStart, createTimeEnd} = formData;

    const formValue = {
      ...params,
      ...formData,
      createTime: {
        start: this.parserFormatter.format(createTimeStart),
        end: this.parserFormatter.format(createTimeEnd)
      }
    };

    const uri = this.mainFunctionUrl;
    this.http.post(uri, formValue).subscribe(res => { //TODO only for dev, need to change to post method
      if ('0000' == res.code) {
        const data = res.data['rows'] == null ? [] : res.data['rows'];
        this.rows = [...data];
        this.page.totalElements = res.data['total'];
        setTimeout(() => {
          this.loadingIndicator = false;
        }, 1500);
      }
    });
  };

  claim(content, row) {
    const uri = '/act/task/claimTask/' + row.id + '/' + localStorage.getItem('ng_philips_code1');
    console.log('接收任务 row object->' + JSON.stringify(row));
    this.http.post(uri).subscribe(res => { //TODO only for dev, need to change to post method
      console.log(res);
      if ('0000' == res.code) {
        setTimeout(() => {
          this.loadingIndicator = false;
          this.toastrService.success(res['msg']);
          this.reloadTable();
        }, 1500);
      } else {
        this.toastrService.error(res['msg']);
      }
    });

  }

  applyFilter() {
    this.page.pageNumber = 0;
    this.reloadTable();
  }

  resetForm(){
    this.searchForm.resetForm();
    this.reloadTable();
  }

}
