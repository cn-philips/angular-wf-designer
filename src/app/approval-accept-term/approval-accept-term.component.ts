import { Component, OnInit, Input, ViewChildren, QueryList } from '@angular/core';
import { AcceptTermService, GlobalService } from '../services';
import {NgModel} from '@angular/forms';

@Component({
  selector: 'app-approval-accept-term',
  templateUrl: './approval-accept-term.component.html',
  styleUrls: ['./approval-accept-term.component.scss']
})
export class ApprovalAcceptTermComponent implements OnInit {

  showFlag:boolean = false;

  acceptTerms: any[];

  @Input()
  isHidden: boolean = true;

  @Input()
  disabled: boolean = false;

  realAcceptTerms: any[];

  @ViewChildren('ckb') ckbElements;
  @ViewChildren('ckbControl', { read: NgModel }) ckbInputs: QueryList<NgModel>;

  constructor(private acceptTermService: AcceptTermService, private globalService: GlobalService) { }

  ngOnInit() {
    this.acceptTermService.accpetTerms.subscribe(res => {
      if(res && res.length > 0) {
        this.acceptTerms = res;
        this.acceptTerms.forEach(item=> {
          item.accept = item.accept ? 1: 0;
        })
      } else {
        this.acceptTerms = undefined;
      }
    });

    this.acceptTermService.accpetTermsHidden.subscribe(res => {
      console.log('accept hiden change, res =>', res);
      this.isHidden = res;
    });
  }



  ckbChange(e) {
    this.realAcceptTerms = [];
    if(this.ckbElements.length > 0 ) {
      this.ckbElements.toArray().forEach(el=> {
        this.realAcceptTerms.push({
          'accept': el.nativeElement.checked ? 1 : 0,
          'term': el.nativeElement.value
          });
      });
    }
    if(this.realAcceptTerms && this.realAcceptTerms.length > 0) {
      this.acceptTermService.emitAcceptTermChanged(this.realAcceptTerms);
    }
  }

  changeItemAccept(item:any) {
    item['accept'] = !item['accept'] ? 0 : 1;
  }

  validateAcceptTerm() {
    if(!this.disabled) {
      this.globalService.theValidator =  '1';
      this.ckbInputs.forEach(item => {
        // console.log('accept term ckb value', item.value);
        item.control.markAsTouched();
        if(false == item.value) {
          console.log('accept-term validation fails');
          this.globalService.theValidator = '0';
        }
      });
    }
  }

}
