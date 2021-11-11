import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { LicenseTypePipe } from '../../pipes/license-type.pipe';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import {HttpService, NgxDatatableService} from '../../services';


@Component({
  selector: 'quotation-license-modal',
  templateUrl: './quotation-license-modal.component.html',
  styleUrls: ['./quotation-license-modal.component.scss'],
  providers: [LicenseTypePipe],
  encapsulation: ViewEncapsulation.None
})
export class QuotationLicenseModalComponent implements OnInit {


  licenseType: string;
  pageMainObject: any;
  licenseList = [];
  areaAuthorityList = [];
  constructor(public activeModal: NgbActiveModal,
    private http: HttpService,
    private ngxDatatableService: NgxDatatableService ) { }

  ngOnInit() {
    console.log(this.licenseType);

    this.licenseList = [];
    if(this.pageMainObject && this.pageMainObject['LicenseList'] && this.pageMainObject['LicenseList'].length > 0) {
      this.licenseList = this.pageMainObject['LicenseList'];
      setTimeout(() => {
        this.licenseList = [...this.licenseList];
      }, 50)
    }

    this.areaAuthorityList = [];
    if(this.pageMainObject && this.pageMainObject['AuthorityAreaList'] && this.pageMainObject['AuthorityAreaList'].length > 0) {
      this.areaAuthorityList = this.pageMainObject['AuthorityAreaList'];
      for(let i=0;i<this.areaAuthorityList.length;i++) {
        let ProductSeriesDetail = '';
        if(this.areaAuthorityList[i]['ProductSeries']){
          for(let j=0;j<this.areaAuthorityList[i]['ProductSeries'].length;j++) {
            ProductSeriesDetail  += this.areaAuthorityList[i]['ProductSeries'][j]['ProductSeriesNameCN'] + '; ';
          }
          this.areaAuthorityList[i]['ProductSeriesDetail'] = ProductSeriesDetail.substring(0, ProductSeriesDetail.length-2);
        }
      }
      setTimeout(() => {
        this.areaAuthorityList = [...this.areaAuthorityList];
      }, 50)
    }

    console.log(this.pageMainObject);
  }

  //set the table column and cell style according to your requirement
  getCellClass = this.ngxDatatableService.getCellClass;
  getHeaderClass = this.ngxDatatableService.getHeaderClass

  closeModal() {
    this.activeModal.close('simple'); 
  }
}
