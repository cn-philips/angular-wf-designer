import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LicenseTypePipe } from '../../pipes/license-type.pipe';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { HttpService, NgxDatatableService, FileService } from '../../services';
import {ToastrService} from 'ngx-toastr';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-contract-export-modal',
  templateUrl: './contract-export-modal.component.html',
  styleUrls: ['./contract-export-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ContractExportModalComponent implements OnInit {

  processInstanceId: string = '';
  contractTempList: any = [];

  constructor(public activeModal: NgbActiveModal,
    private http: HttpService,
    private ngxDatatableService: NgxDatatableService,
    public toastrService: ToastrService,
    private fileService: FileService) {
    }


  ngOnInit() {
    this.initContractTempList();
  }

  initContractTempList() {
    let uri = '/act/contractOutput/getTempName';
    this.http.get(uri).subscribe(res => {
      console.log('initContractTempList', res);

      if('0000' === res.code) {
        let items = res.data;

        var tmp = [];
        for(let key in items) {
          let fileName = this.fileService.splitFileName(items[key] || '');
          tmp.push({id: key, name: fileName});
        }
        setTimeout(() => {
            this.contractTempList = [...tmp];
          }, 1000);
        this.contractTempList = [...tmp];

        // if(items && items.length > 0) {
        //   let tmp = [];
        //   for(let item of items) {
        //     tmp.push({
        //       id: '',
        //       name: item.toString()
        //     });
        //   }
        //   setTimeout(() => {
        //     this.contractTempList = [...tmp];
        //   }, 1000);
        //   // this.contractTempList = [...tmp];
        // }
      } else {
        this.toastrService.error(res.msg);
      }
    });


  }

  //TODO 待后台接口完成联调
  exportContract(event) {
    // console.log(this.processInstanceId);
    // let id = row['id'];
    // let id = "e4a03405-aa6c-4ad9-b641-0bac9e463cd9";
    // let name = 'tee.txt';
    // console.log(event);
    // return;
    let uri = `/act/contractOutput/generateContract/${this.processInstanceId}/${event.id}`;
    let params = {};

    this.http.post(uri, params).subscribe(res => {
      if (res.code === '0000') {
        let arr = this.fileService.base64ToArrayBuffer(res.data);
        let blob = new Blob([arr]);
        saveAs(blob, event.name + '.doc');
      } else {
        this.toastrService.error(res.msg);
      }
    });
  }


  closeModal() {
    this.activeModal.close('simple');
  }
}
