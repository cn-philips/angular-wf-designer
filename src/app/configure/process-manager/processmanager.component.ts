import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {HttpService} from '../../services';
import {ToastrService} from 'ngx-toastr';
import {ApprovalMainModalComponent} from '../../approval-main-modal/approval-main-modal.component';
import {ModalDismissReasons, NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';

class ProcessInstanceManager {
  page: {
    pageNumber?: number;
    pageSize?: number;
    total?: number;
  } = {
    pageNumber: 1,
    pageSize: 10,
    total: 0
  };
  loading: boolean = false;
  // 流程实例列表
  processInstanceList: any[] = [];
  searchForm: FormGroup;
  processList: any[] = [];
  selectUserList: any[] = [];
  controlNameList: string[] = [
    'businessName',
    'businessNumber',
    'processName',
    'owner'
  ];

  constructor(private http: HttpService,
              private toastrService: ToastrService,
              private fb: FormBuilder) {
    this.searchForm = this.fb.group({});
    for (let item of this.controlNameList) {
      this.searchForm.addControl(item, new FormControl());
    }
    this.http.get('/act' + '/model/listAction').subscribe(res => {
      if ('0000' == res.code) {
        this.processList = res.data;
      }
    });
    // this.refreshTable(true);
  }

  suspendedSelected = (row) => {
    this.http.get(`/act/suspendProcessInstance/${row.processInstanceId}`).subscribe(res => {
      if (res.code == '0000') {
        this.toastrService.success('暂停成功！');
        this.refreshTable(false);
      } else {
        this.toastrService.error(res.msg);
      }
    });
  }

  runningSelected = (row) => {
    this.http.get(`/act/startProcessInstance/${row.processInstanceId}`).subscribe(res => {
      if (res.code == '0000') {
        this.toastrService.success('运行成功！');
        this.refreshTable(false);
      } else {
        this.toastrService.error(res.msg);
      }
    });

  }

  removeRealTimeReport = (row) => {
    this.http.delete(`/act/report/remove/${row.businessNumber}`).subscribe(res => {
      if (res.code == '0000') {
        this.toastrService.success('移除成功！');
        this.refreshTable(true);
      } else {
        this.toastrService.error(res.msg);
      }
    });

  };


  removeSelected = (row) => {
    this.http.delete(`/act/task/processInstance/${row.processInstanceId}`).subscribe(res => {
      if (res.code == '0000') {
        this.toastrService.success('移除成功！');
        this.refreshTable(true);
      } else {
        this.toastrService.error(res.msg);
      }
    });

  };

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

  onReset($event): void {
    if ($event) {
      $event.preventDefault();
    }
    this.searchForm.reset();
    this.selectUserList = [];
  };

  onSearch($event): void {
    if ($event) {
      $event.preventDefault();
    }
    this.refreshTable(true);
  }


  removeAll = () => {
    this.http.delete(`/act/task/allProcessInstance`).subscribe(res => {
      if (res.code == '0000') {
        this.toastrService.success('移除成功！');
        this.refreshTable(true);
      } else {
        this.toastrService.error(res.msg);
      }
    });
  };

  changeIndex = (pageIndex) => {
    this.page.pageNumber = pageIndex;
    this.refreshTable(false);
  };

  changeSize = (pageSize) => {
    this.page.pageNumber = 1;
    this.page.pageSize = pageSize;
    this.refreshTable(true);
  };

  refreshTable = (cleanpage: boolean) => {
    this.loading = true;
    const formData = this.searchForm ? this.searchForm.getRawValue() : {};
    const {owner, ...another} = formData;
    if (cleanpage) {
      this.page.pageNumber = 1;
    }
    let formValue = {
      ...this.page,
      ...another,
      pageNumber: this.page.pageNumber - 1,
    };
    if (owner && owner.value) {
      formValue['owner'] = owner.value.code;
    }
    if (cleanpage) {
      this.page.pageNumber = 1;
    }
    this.http.post(`/act/task/listAllProcessInstance`, formValue).subscribe(res => {
      if (res.code == '0000') {
        const data = res.data;
        this.page.total = data.total;
        this.processInstanceList = [...data.rows];
      }
      this.loading = false;
    });

  };


}


@Component({
  selector: 'process-manager',
  templateUrl: './processmanager.component.html',
  styleUrls: ['./processmanager.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProcessmanagerComponent implements OnInit {

  processInstanceManager: ProcessInstanceManager = new ProcessInstanceManager(this.http, this.msg, this.fb);

  constructor(private http: HttpService,
              private msg: ToastrService,
              private modalService: NgbModal,
              private fb: FormBuilder) {

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
        this.processInstanceManager.refreshTable(true);
      }
    }, (reason) => {
      console.log(`Dismissed ${this.getDismissReason(reason)}`);
    });
  }


  ngOnInit(): void {
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


}
