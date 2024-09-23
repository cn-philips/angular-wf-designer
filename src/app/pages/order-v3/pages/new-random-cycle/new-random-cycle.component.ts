import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { OrderV3Service } from "../../order-v3.service";
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  FormArray,
  Validators,
} from "@angular/forms";
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import * as moment from 'moment'
import { HttpService } from '@core/services';
import { RouterExtendService } from "@app/modern-themes/services/router-extend.service";
@Component({
  selector: "new-random-cycle",
  templateUrl: "./new-random-cycle.component.html",
  styleUrls: ["./new-random-cycle.component.scss"],
})
export class NewRandomCycleComponent implements OnInit {
  constructor(private serveice: OrderV3Service,
    private activatedRouter: ActivatedRoute,
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router,
    private modalService: NzModalService,
    private http: HttpService,
    private routerExtend: RouterExtendService,
  ) { }

  public listOfData: any[] = [];
  isVisible = false;
  addVisible = false
  isConfirmLoading = false;
  dealerInfos: any[] = []
  
  ngOnInit() {
    for (let i = 0; i < 9; i++) {
      this.listOfData.push({
        a: 'John Brown',
        b: i + 1,
        c: 'Lake Park',
        d: 'C',
        e: 2035,
        f: 'Lake Street 42',
        g: 'SoftLake Co',
        h: 'M',
        i: 'M',
        j: 'M',
        k: 'M'
      });
    }
    for (let i = 0; i < 2; i++) {
      this.dealerInfos.push({
        CPdealFormId: 'John Brown',
        dealerName: i + 1,
        email1: 'Lake Park',
        salesEmail: 'C',
        dmEmail: 2035
      });
    }
  }

  showAddModal() {
    this.addVisible = true;
 
  }

  handleAddCancel() {
    this.addVisible = false;
  }

  showModal() {
    console.log("dealerInfos",this.dealerInfos);
    this.isVisible = true;
 
  }

  handleOk() {
    this.isConfirmLoading = true;
    setTimeout(() => {
      this.isVisible = false;
      this.isConfirmLoading = false;
    }, 3000);
  }

  handleCancel() {
    console.log('Button cancel clicked!');
    this.isVisible = false;
  }



}