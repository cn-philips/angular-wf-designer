import { Component, OnInit, ViewEncapsulation, ViewChild, ViewChildren } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ApprovalMainModalComponent } from '../approval-main-modal/approval-main-modal.component';
import { AppService } from '../app.service';
import { HttpService, NgxDatatableService } from '../services';
import { NgbModal, NgbActiveModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'my-draft',
  templateUrl: './my-draft.component.html',
  styleUrls: ['./my-draft.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MyDraftComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChildren('filterInputs') filterInputs;
  @ViewChild('myModal') approvalMainModal: ApprovalMainModalComponent;

  loadingIndicator = true;
  rows = [];
  temp = [];
  selected = [];
  editing = [];
  tablename: string = "";
  columnFilterName = [
    {'key':'businessName','value':'最终用户名称'},
    {'key':'name','value':'审批名称'}

  ];
  mainFunctionUrl: string;
  newApprovalList: any = [];
  showNewAppBtn: boolean = false;

  constructor(private appService: AppService,
    private http: HttpService,
    private ngxDatatableService: NgxDatatableService,
    private router: Router,
    private aRoute: ActivatedRoute,
    private modalService: NgbModal,
    public toastrService: ToastrService) {

      this.aRoute.queryParams.subscribe(params=> {
        this.mainFunctionUrl = "/act" + params.url + '/' + localStorage.getItem('ng_philips_code1');
        this.appService.pageTitle = params.name == null ? "" : params.name;
        this.updateRowList();
      });

  }

  ngOnInit() {
    const newApprovalUri = '/act/model/list';
    const applyBtnParamMap = {
      'key1': '/model/list'
    }
    this.showNewAppBtn = false;
    this.http.post('/act/relation/isAuthorized', applyBtnParamMap).subscribe(res => {
      if ('0000' === res.code) {
        if (res.data['key1'] && 'true' === res.data['key1']) {
          this.showNewAppBtn = true;
          this.http.get(newApprovalUri).subscribe(res => {
            if ('0000' == res.code) {

              this.newApprovalList = res.data;
            }
          });
        }
      }
    });
  }

  getCellClass = this.ngxDatatableService.getCellClass;
  getHeaderClass = this.ngxDatatableService.getHeaderClass;

  updateRowList() {
    this.fetch((data) => {
      let dataFixed = [];
      for(let i=0;i<data.length;i++){
        if(true != data[i]['submit']) {
          dataFixed.push(data[i]);
        }
      }

      this.temp=[...dataFixed];
      this.rows=[...dataFixed];

      setTimeout(() => { this.loadingIndicator = false; }, 1500);
    });
  }

  fetch(cb) {
    const uri = this.mainFunctionUrl;
    this.http.post(uri, {}).subscribe(res =>{
    if('0000' == res.code) {
      const data = res.data==null?[]:res.data;
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
        const userInput = el.nativeElement.value ? el.nativeElement.value.toLowerCase() : undefined;
        filterRows = filterRows.filter(function(d) {
          return d[currentFiltername] && d[currentFiltername].toLowerCase().indexOf(userInput) !== -1 || !userInput;
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

  delDraft(row){
    console.log('delDraft...');
    console.log(row);
    console.log(JSON.stringify(row));

    if(row.id){
      const uri = '/act' + '/draft/' + row.id;
      this.http.delete(uri).subscribe(res =>{
        // console.log(res);
        if('0000' == res['code']) {
          // const data = res.data==null?[]:res.data;
          this.toastrService.success(res['msg']);
          this.updateRowList();
        }
        });
    }

  }

  open(draftId, draftName) {
    const modal: NgbModalRef  = this.modalService.open(ApprovalMainModalComponent, {size: 'lg', windowClass: 'modal-xl', backdrop: 'static', keyboard: false});

    (<ApprovalMainModalComponent>modal.componentInstance).draftId = draftId;
    (<ApprovalMainModalComponent>modal.componentInstance).businessName = draftName.replace('草稿','');
    (<ApprovalMainModalComponent>modal.componentInstance).pageType = 'draft';

    modal.result.then((result) => {
      console.log(`Closed with: ${result}`);
      if('startProcess' == result) {
        this.updateRowList();
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
      return  `with: ${reason}`;
    }
  }

  openNewApprovalModal(content, processDefinitionKey, businessName) {
    const modal: NgbModalRef = this.modalService.open(ApprovalMainModalComponent, { size: 'lg', windowClass: 'modal-xl', backdrop: 'static', keyboard: false });
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

}
