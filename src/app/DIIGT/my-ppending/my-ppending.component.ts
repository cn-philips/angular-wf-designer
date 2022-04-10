import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Page} from '../../domian';
import {HttpService, NgxDatatableService} from '../../services';


@Component({
  selector: 'app-my-ppending',
  templateUrl: './my-ppending.component.html',
  styleUrls: ['./my-ppending.component.scss']
})
export class MyPpendingComponent implements OnInit {


  @Output()
  pendingTaskEvent = new EventEmitter();

  getCellClass = this.ngxDatatableService.getCellClass;
  getRejectCellClass = this.ngxDatatableService.getRejectCellClass;
  getHeaderClass = this.ngxDatatableService.getHeaderClass;

  loadingIndicator = true;
  rows = [{businessNumber: '123'}];
  temp = [];
  selected = [];
  editing = [];
  tablename: string = '';
  mainFunctionUrl: string;
  page = new Page();
  processList: [];
  selectUserList: any[] = [];
  batchFlag: boolean = true; //Finance Controller flag


  constructor(private http: HttpService,
              private ngxDatatableService: NgxDatatableService) {
    this.page.pageNumber = 0;
    this.page.pageSize = 15;
    this.page.sortName = 'createTime';
    this.page.sortOrder = 'desc';

  }

  ngOnInit() {
  }

  onSelect({ selected }) {
    // console.log('Select Event', selected, this.selected);
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }
  pageCallback(pageInfo: { count?: number, pageSize?: number, limit?: number, offset?: number }) {
    this.page.pageNumber = pageInfo.offset;
    // this.reloadTable('page');
  }

  sortCallback(sortInfo: { sorts: { dir: string, prop: string }[], column: {}, prevValue: string, newValue: string }) {
    // there will always be one "sort" object if "sortType" is set to "single"
    this.page.sortOrder = sortInfo.sorts[0].dir;
    this.page.sortName = sortInfo.sorts[0].prop;
    // this.reloadTable();
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
  }

  displayCheck(row) {
    return row.name !== 'Ethel Price';
  }

}
