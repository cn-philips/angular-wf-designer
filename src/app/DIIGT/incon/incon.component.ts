import { Component, OnInit } from '@angular/core';
import {AppService} from '../../app.service';
import {HttpService} from '../../services';
import {ToastrService} from 'ngx-toastr';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NzMessageService} from 'ng-zorro-antd';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-incon',
  templateUrl: './incon.component.html',
  styleUrls: ['./incon.component.scss']
})
export class InconComponent implements OnInit {
  validateForm: FormGroup;
  public dataBase: any = {
    productList: [], // 产品列表
    detail: {
      id: '',
      flag: '',
      status: '',
    },
  };

  constructor(
    private appService: AppService,
    private http: HttpService,
    private toastrService: ToastrService,
    private router: Router,
    private modalService: NgbModal,
    private aRoute: ActivatedRoute,
    private message: NzMessageService,
    private fb: FormBuilder,
    private nzMessageService: NzMessageService,
  ) {
    this.validateForm = this.fb.group({
      accountName: [],
      ddpStatus: [],
      channelBpCnName: [],
      contactsName: [],
      contactsPhone: [],
      currencyType: [],
      customerAddr: [],
      customerType: [],
      isSamplingInspection: [],
      samplingInspectionReason: [],
      tenderDocumentNo: [],
      tenderName: [],
      agentCnName: [],
      selectedDistributor: [],
      selectedAgentCnName: [],
      dealFormID: [],
      businessModel: [],
      region: [],
      bidWinningNotice: [[]],
      distributorAddress: [],
      distributorContacts: [],
      distributorPhone: [],
      distributorEmail: [],
      orderSignName: [],
      orderSignPost: [],
      contractDdpStatus: [],
      contractBuyerAddress: [],
      contractBuyerContacts: [],
      contractBuyerPhone: [],
      contractBuyerEmail: [],
      importAgreementSignName: [],
      importAgreementSignPost: [],
      endUserEmail: [],
      invoiceInformation: [],
    });
  }

  ngOnInit() {
  }



  cancelContract(): void {
  }

  saveContract(): void {
    // 招标授权表单提交或者保存
    // this.http.post(`/act//preparation/saveAndSubmit`, this.dataBase).subscribe(rest => {
    //   if (rest.code === '0000') {
    //     console.log(rest.data);
    //     this.message.create('success', `${rest.msg}`);
    //   } else {
    //     this.message.create('error', `${rest.msg}`);
    //   }
    // });
  }

  cancelGenerateContractDraft(): void {
    // this.nzMessageService.info('点击取消');
  }

  confirmGenerateContractDraft(): void {
  //  this.nzMessageService.info('点击确认');
  }

}
