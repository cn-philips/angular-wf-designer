import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {AppService} from '../app.service';
import {HttpService} from '../services';
import {ToastrService} from 'ngx-toastr';
import {ApprovalMainModalComponent} from '../approval-main-modal/approval-main-modal.component';
import {NgbModal, ModalDismissReasons, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {

  notes: string;
  myTask: any = {total: 0, rows: []};
  myAccept: any = {total: 0, rows: []};
  myDraft: any = {total: 0, rows: []};
  myStart: any = {total: 0, rows: []};
  newApprovalList: any = [];
  showNewAppBtn: boolean = false;


  constructor(private appService: AppService,
              private http: HttpService,
              private toastrService: ToastrService,
              private router: Router,
              private modalService: NgbModal,
              private aRoute: ActivatedRoute) {
    this.appService.pageTitle = '主页';
  }

  ngOnInit(): void {
    this.aRoute.queryParams.subscribe(async params => {
      // console.log('home-url', params);
    });
    const newApprovalUri = '/act/model/list';
    let applyBtnParamMap = {
      'key1':'/model/list'
    }
    this.showNewAppBtn = false;
    this.http.post('/act/relation/isAuthorized', applyBtnParamMap).subscribe(res=> {
      if('0000'===res.code) {
        if(res.data['key1'] && 'true' === res.data['key1']) {
          this.showNewAppBtn = true;
          this.http.get(newApprovalUri).subscribe(res => {
            if ('0000' == res.code) {

              this.newApprovalList = res.data;
              console.log(res.data);
            }
          });
        }
      }
    });

    this.updateHomePageLists();
  }

  jump(result, url, name) {
    this.router.navigate([result], {
      queryParams: {
        url, name
      }
    });
  }

  openNewApprovalModal(content, processDefinitionKey, businessName) {
    const modal: NgbModalRef = this.modalService.open(ApprovalMainModalComponent, {
      size: 'lg',
      windowClass: 'modal-xl',
      backdrop: 'static',
      keyboard: false
    });
    (<ApprovalMainModalComponent>modal.componentInstance).processDefinitionKey = processDefinitionKey;
    (<ApprovalMainModalComponent>modal.componentInstance).businessName = businessName;
    (<ApprovalMainModalComponent>modal.componentInstance).pageType = 'new';
    (<ApprovalMainModalComponent>modal.componentInstance).disabled = false;

    modal.result.then((result) => {
      console.log(`Closed with: ${result}`);
      if (result == 'startProcess' || result == 'savedAndCancel') {
        this.updateHomePageLists()
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

  updateHomePageLists(){
    const uri = '/act/home/taskSum/' + localStorage.getItem('ng_philips_code1');
    this.http.get(uri).subscribe(res => {
      if ('0000' == res.code) {
        const { taskPageResult, acceptTaskPageResult, simpleProcessPageResult, tblDraftPageResult, notes } = res.data;
        this.myTask = taskPageResult ? taskPageResult : { total: 0, rows: [] };
        this.myAccept = acceptTaskPageResult ? acceptTaskPageResult : { total: 0, rows: [] };
        this.myStart = simpleProcessPageResult ? simpleProcessPageResult : { total: 0, rows: [] };
        this.myDraft = tblDraftPageResult ? tblDraftPageResult : { total: 0, rows: [] };
        this.notes = notes;
      } else {
        // this.toastrService.error(res.msg);
      }
    });
  }

}
