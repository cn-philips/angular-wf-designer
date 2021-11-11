import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DatatableComponent} from '@swimlane/ngx-datatable';
import {AppService} from '../app.service';
import {FileService, HttpService, NgxDatatableService} from '../services';
import {HttpClient, HttpRequest, HttpResponse} from '@angular/common/http';
import {PlatformLocation} from '@angular/common';
import {HospitalTypePipe} from '../pipes/hospital-type.pipe';
import {ToastrService} from 'ngx-toastr';
import {saveAs} from 'file-saver';
import {ApprovalSimpleModalComponent} from '../approval-simple-modal/approval-simple-modal.component';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {UploadFile, UploadFilter} from 'ng-zorro-antd';

@Component({
  selector: 'quotation-management',
  templateUrl: './quotation-management.component.html',
  styleUrls: ['./quotation-management.component.scss'],
  providers: [HospitalTypePipe],
  encapsulation: ViewEncapsulation.None
})
export class QuotationManagementComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;

  // currentFileUpload: File;
  loadingIndicator = true;
  // rowsBak = [];
  temp = [];
  rows = [];
  selected = [];
  // mblxList: Observable<TblDict[]>;
  baseBackPath = '';
  mainFunctionUrl = '';
  // hasStatus = false;
  filterF1: string = '';
  filterF2: string = '';
  filterF3: string = '';
  filterF4: number = -1;
  filterF5: string = '';

  // clinicProductMap: object = {};
  // clinicList = new Set([]);
  // productList = [];
  // selectClinicValue = '';
  // selectProductValue = '';
  //set the table column and cell style according to your requirement
  getCellClass = this.ngxDatatableService.getCellClass;
  getHeaderClass = this.ngxDatatableService.getHeaderClass;

  uploading = false;
  fileList: UploadFile[] = [];
  error: string;
  filters: UploadFilter[] = [
    {
      name: 'type',
      fn: (fileList: UploadFile[]) => {
        const filterFiles = fileList.filter(w => ~['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].indexOf(w.type));
        if (filterFiles.length !== fileList.length) {
          this.toastrService.error(`上传的文件中格式不正确，只支持 xlsx 格式`);
          return filterFiles;
        }
        return fileList;
      }
    }
  ];

  constructor(private appService: AppService,
              private http: HttpService,
              private httpClient: HttpClient,
              private platformLocation: PlatformLocation,
              private ngxDatatableService: NgxDatatableService,
              private aRoute: ActivatedRoute,
              private toastrService: ToastrService,
              private fileService: FileService,
              private modalService: NgbModal) {
    this.aRoute.queryParams.subscribe(params => {
      this.mainFunctionUrl = '/act' + params.url;
      this.updateRowList();
    });
    this.baseBackPath = (this.platformLocation as any).location.origin + '/act';
  }

  ngOnInit() {
    // const uri = '/act/masterdata/queryList/productclass';
    // this.http.get(uri).subscribe(res => {
    //   if ('0000' == res.code) {
    //     let result = {};
    //     let clinicSet = new Set();
    //     const list = res.data;
    //     console.log(list);
    //     list.forEach((item, index) => {
    //       if (index > 1) {
    //         const clinic = item[1];
    //         const product = item[2];
    //         clinicSet.add(clinic);
    //         !result[clinic] ? result[clinic] = new Set([product]) : result[clinic].add(product);
    //       }
    //     });
    //     this.clinicList = clinicSet;
    //     this.clinicProductMap = result;
    //   } else {
    //     this.toastrService.error(res.msg);
    //   }
    // });
  }

  updateRowList(filter?: boolean) {
    this.loadingIndicator = true;
    this.fetch((data) => {
      // cache data list
      this.temp = [...data];

      // push inital complete list
      this.rows = data;
      // console.log(this.rows);

      setTimeout(() => {
        if(filter) {
          this.updateFilter();
        }
        this.loadingIndicator = false;
      }, 1500);
    });
  }

  fetch(cb) {
    this.http.get(this.mainFunctionUrl).subscribe(res => {
      // console.log(res);
      if ('0000' == res.code) {
        const data = res.data == null ? [] : res.data;
        cb(data);
      }
    });
  }

  onSelect({selected}) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  // selectFile(event) {
  //   this.currentFileUpload = event.target.files[0];
  // }

  updateFilter(event?) {
    const clinic = this.filterF1.toLowerCase();
    const product = this.filterF2.toLowerCase();
    const quotation = this.filterF3.toLowerCase();
    const latest: number = this.filterF4;
    const fileName = this.filterF5.toLowerCase();
    const temp = this.temp.filter(function (d) {
      return latest == -1 || (d.latest.toString() === 'true' && latest == 0) || (d.latest.toString() === 'false' && latest == 1);
    }).filter(function (d) {
      return d.clinicalId.toLowerCase().indexOf(clinic) !== -1 || !clinic;
    }).filter(function (d) {
      return d.productId.toLowerCase().indexOf(product) !== -1 || !product;
    }).filter(function (d) {
      return (d.orgFileName && d.orgFileName.toLowerCase().indexOf(fileName) !== -1) || !fileName;
    }).filter(function (d) {
      return d.quotation.toLowerCase().indexOf(quotation) !== -1 || (d.quotationName && d.quotationName.toLowerCase().indexOf(quotation) !== -1) || !quotation;
    });

    // update the rows
    this.rows = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  download(fileId: string) {
    let uri = `/act/file/download/${fileId}`;
    this.http.get(uri).subscribe(res => {
      if (res.code === '0000') {
        let {data, name} = res.data;
        let arr = this.fileService.base64ToArrayBuffer(data);
        let blob = new Blob([arr]);
        saveAs(blob, name);
      } else {
        this.toastrService.error(res.msg);
      }
    });
  }

  quotationTemplatePreview(quotationId) {
    if (!quotationId) {
      return;
    }

    const modal: NgbModalRef = this.modalService.open(ApprovalSimpleModalComponent, {
      size: 'lg',
      windowClass: 'quotation-modal',
      backdropClass: 'quotation-backdrop',
      backdrop: 'static',
      keyboard: false
    });

    (<ApprovalSimpleModalComponent>modal.componentInstance).pageType = 'quotationTemplatePreview';
    (<ApprovalSimpleModalComponent>modal.componentInstance).paramsToPass = {quotationId: quotationId};
  }


  beforeUpload = (file: UploadFile): boolean => {
    this.fileList = this.fileList.concat(file);
    return false;
  };


  cleanFiles(): void {
    this.error = null;
    this.fileList = [];
  }

  handleUpload(): void {
    this.error = null;
    const formData = new FormData();
    // tslint:disable-next-line:no-any
    this.fileList.forEach((file: any) => {
      formData.append(file.name, file);
    });
    this.uploading = true;
    // You can use any AJAX library you like
    const req = new HttpRequest('POST', this.fileService.getFullHref('/act/quotation/upload'), formData, {
      reportProgress: true,
      responseType: 'text'
    });
    this.httpClient.request(req).subscribe(event => {
      if (event instanceof HttpResponse) {
        console.log('uploading ends');
        const res = JSON.parse(event.body.toString());
        if ('0000' == res.code) {
          this.toastrService.success('上传成功');
          this.updateRowList(true);
          this.cleanFiles();
          this.uploading = false;
          this.fileList = [];
        } else {
          this.toastrService.error('上传失败！');
          this.error = res.msg;
          this.uploading = false;
        }
      }
    });
  }

}
