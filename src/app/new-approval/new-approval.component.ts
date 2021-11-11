import { Component, OnInit, ViewEncapsulation, ViewChild, ViewChildren } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ApprovalMainModalComponent } from '../approval-main-modal/approval-main-modal.component';
import { ApprovalSimpleModalComponent } from '../approval-simple-modal/approval-simple-modal.component';
import { AppService } from '../app.service';
import { HttpService, NgxDatatableService } from '../services';
import { NgbModal, NgbActiveModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'new-approval',
  templateUrl: './new-approval.component.html',
  styleUrls: ['./new-approval.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NewApprovalComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChildren('filterInputs') filterInputs;
  @ViewChild('myModal') approvalMainModal: ApprovalMainModalComponent;

  loadingIndicator = true;
  rows = [];
  rowsBak = [];
  temp = [];
  selected = [];
  columnName = [];
  editing = [];
  tablename: string = "";
  columnFilterName = [
    {'key':'name','value':'审批名称'}
  ];
  mainFunctionUrl: string;

  constructor(private appService: AppService,
    private http: HttpService,
    private ngxDatatableService: NgxDatatableService,
    private router: Router,
    private aRoute: ActivatedRoute,
    private modalService: NgbModal) {

      this.aRoute.queryParams.subscribe(params=> {
        // console.log(params.url);
        this.mainFunctionUrl = "/act" + params.url;
        // this.mainFunctionUrl = '/mock' + params.url; //TODO only for mock
        // this.mainFunctionUrl = params.url.replace(/act/g, 'mock'); //TODO only for mock
        // this.tablename = this.mainFunctionUrl.split('/').pop();

        this.appService.pageTitle = params.name == null ? "" : params.name;

        this.updateRowList();
      });
    }

  ngOnInit() {
  }

  //set the table column and cell style according to your requirement
  getCellClass = this.ngxDatatableService.getCellClass;
  getHeaderClass = this.ngxDatatableService.getHeaderClass;

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

      setTimeout(() => { this.loadingIndicator = false; }, 1500);
      // console.log(this.rows);
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

  //filter function
  updateFilterAll(event) {

    let filterRows = this.temp;
    for(let i=0;i<this.filterInputs.length;i++){
      this.filterInputs.toArray().forEach(el => {
        const currentFiltername = el.nativeElement.getAttribute('filtername');
        const userInput = el.nativeElement.value.toLowerCase();

        filterRows = filterRows.filter(function(d) {
          return d[currentFiltername].toLowerCase().indexOf(userInput) !== -1 || !userInput;
        });
      });
    }

    // update the rows
    this.rows = filterRows;
    // Whenever the filter changes, always go back to the first page
    if(this.table){
      this.table.offset = 0;
    }
  }

  //
  // Bootstrap Modals
  //

  open(content, processDefinitionKey, businessName) {
    const modal: NgbModalRef  = this.modalService.open(ApprovalMainModalComponent, {size: 'lg', windowClass: 'modal-xl', backdrop: 'static', keyboard: false});
    (<ApprovalMainModalComponent>modal.componentInstance).processDefinitionKey = processDefinitionKey;
    (<ApprovalMainModalComponent>modal.componentInstance).businessName = businessName;
    (<ApprovalMainModalComponent>modal.componentInstance).pageType = 'new';
    (<ApprovalMainModalComponent>modal.componentInstance).disabled = false;

    modal.result.then((result) => {
      console.log(`Closed with: ${result}`);
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
      return  `with: ${reason}`;
    }
  }

  openSimpleModal(processDefinitionId, processName?) {
    // console.log(processDefinitionId);

    const modal: NgbModalRef  = this.modalService.open(ApprovalSimpleModalComponent, {size: 'lg', windowClass: 'modal-xl', keyboard: false});

    (<ApprovalSimpleModalComponent>modal.componentInstance).processDefinitionId = processDefinitionId;
    (<ApprovalSimpleModalComponent>modal.componentInstance).pageType = 'processDefinitionDiagram';
    if(processName) {
      (<ApprovalSimpleModalComponent>modal.componentInstance).mainModalTitle = processName;
    }

    modal.result.then((result) => {
      console.log(`Closed with: ${result}`);
    }, (reason) => {
      console.log(`Dismissed ${this.getDismissReason(reason)}`);
    });
  }

  //TODO
  applyFilter() {
    // this.page.pageNumber = 0;
    // this.reloadTable();
  }

}
