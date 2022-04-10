import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { AppService } from '../../app.service';
import { HttpService, NgxDatatableService } from '../../services';

@Component({
  selector: 'app-personnelmanagements',
  templateUrl: './personnelmanagements.component.html',
  styleUrls: ['./personnelmanagements.component.scss']
})
export class PersonnelmanagementsComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('codeInput') codeInput;
  @ViewChild('nameInput') nameInput;
  @ViewChild('emailInput') emailInput;
  @ViewChild('sapCodeInput') sapCodeInput;
  loadingIndicator = true;
  rows = [];
  rowsBak = [];
  temp = [];
  selected = [];
  columnName = [];
  editing = [];
  tablename: string = "";
  hasStatus: boolean = false;
  mainFunctionUrl: string;
  constructor(private appService: AppService, 
    private http: HttpService,
    private ngxDatatableService: NgxDatatableService,
    private router: Router,
    private aRoute: ActivatedRoute) {
    this.appService.pageTitle = 'Personal Info';

    this.aRoute.queryParams.subscribe(params=> {
      // console.log(params.url);
      this.mainFunctionUrl = '/act' + params.url;
      // this.tablename = this.mainFunctionUrl.split('/').pop();

      this.updateRowList();
    });
  }
  //set the table column and cell style according to your requirement
  getCellClass = this.ngxDatatableService.getCellClass;
  getHeaderClass = this.ngxDatatableService.getHeaderClass;
  ngOnInit() {
  }

  updateRowList() {
    this.fetch((data) => {
      // console.log(data);
      this.temp=[...data];
      this.rows=[...data];

      // remove 'id' column from table view
      const idx = this.columnName.indexOf('id', 0);
      if (idx > -1) {
        this.columnName.splice(idx, 1);
      }

      //set 'status' column to the last position
      if(this.hasStatus) {
        const statusIdx = this.columnName.indexOf('status',0);
        this.columnName.push(this.columnName.splice(statusIdx, 1)[0]);
      }

      setTimeout(() => { this.loadingIndicator = false; }, 1500);
    });
  }

  
  fetch(cb) {
    const uri = this.mainFunctionUrl;
    this.http.get(uri).subscribe(res =>{
    // console.log(res);
    if('0000' == res.code) {
      const data = res.data==null?[]:res.data;
      // cb(JSON.stringify(data));
      cb(data);
    }
  });
  }

  
  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }
  ngAfterViewInit() {
    setTimeout(() => {
      // For performance reasons resize charts on delayed resize event
      // this.layoutService.on('resize.dashboard-1', resizeCharts);
    });
  }

  updateFilter(event) {
    const code = this.codeInput.nativeElement.value.toLowerCase();
    const name = this.nameInput.nativeElement.value.toLowerCase();
    const email = this.emailInput.nativeElement.value.toLowerCase();
    const sapCode = this.sapCodeInput.nativeElement.value.toLowerCase();

    // filter our data
    const temp = this.temp.filter(function(d) {
      return d.code.toLowerCase().indexOf(code) !== -1 || !code;
    }).filter(function(d) {
      return d.name.toLowerCase().indexOf(name) !== -1 || !name;
    }).filter(function(d) {
      return d.email.toLowerCase().indexOf(email) !== -1 || !email;
    }).filter(function (d) {
      return d.sapCode && d.sapCode.toLowerCase().indexOf(sapCode) !== -1 || !sapCode;
    });

    // update the rows
    this.rows = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

}
