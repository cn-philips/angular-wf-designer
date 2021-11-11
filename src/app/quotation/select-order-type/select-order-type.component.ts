import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { SelectOrderTypeModel } from './select-order-type.model';
import { Observable } from 'rxjs/Observable'; 
import { CommercialOrderService, HttpService } from '../../services';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'select-order-type',
  templateUrl: './select-order-type.component.html',
  styleUrls: ['./select-order-type.component.scss']
})
export class SelectOrderTypeComponent extends FieldType implements OnInit {

  selectOrderType: SelectOrderTypeModel = new SelectOrderTypeModel();
  isCompleted: boolean = false;
  specialOrderSelects: any[] =[];

  constructor(
    private commercialOrderService: CommercialOrderService,
    private http: HttpService,
    private toastrService:ToastrService) {

    super();
    this.selectOrderType.orderType='0';
    this.selectOrderType.specialOrderId='';
  }

  ngOnInit() {

    if (this.formControl.value) {
      const values = JSON.parse(this.formControl.value);

      this.selectOrderType = {
        ...this.selectOrderType,
        ...values
      };
    }
    this.isCompleted = this.selectOrderType.isCompleted ? this.selectOrderType.isCompleted : false;
    // this.commercialOrderService.changeIsOrderTypeCompleted(this.isCompleted);
    if(this.isCompleted){
      // this.orderNext();
      this.commercialOrderService.changeIsOrderTypeCompleted(this.selectOrderType.isCompleted);
      // this.commercialOrderService.changeOrderType(this.selectOrderType.orderType);
    } else {
      this.initSpecialOrderSelects();
    }
  }

  changeCkb(event) {
    // console.log(event.checked);
    if (event.checked) {
      this.selectOrderType.orderType = '1';
    } else {
      this.selectOrderType.orderType = '0';
      this.selectOrderType.specialOrderId = '';
      this.selectOrderType.specialOrderDispalyName = '';
    }
    this.elementsChanged();
  }

  changeSpecialOrderSelect(event){
    // console.log(event);
    if(event) {
      this.selectOrderType.specialOrderId = event['processInstanceId'] ? event['processInstanceId'] : ''; // TODO 'id' mod for dev
    } else {
      this.selectOrderType.specialOrderId = '';
      this.selectOrderType.specialOrderDispalyName = '';
    }
    this.elementsChanged();
  }

  async orderNext() {

    const orderTypeArray = ['0','1'];
    if(!this.selectOrderType.orderType || (orderTypeArray.indexOf(this.selectOrderType.orderType) == -1)) {
      console.log('something wrong with orderType!');
      return;
    }

    if ('1' == this.selectOrderType.orderType && (!this.selectOrderType.specialOrderId || '' == this.selectOrderType.specialOrderId)) {
      this.toastrService.warning('请选择特价进单！');
      return;
    }

    //TODO for more detail design
    if ('1' == this.selectOrderType.orderType) {
      let res =  await this.getSpecialOrderData(this.selectOrderType.specialOrderId);
      if ('0000' != res['code']) {
        this.toastrService.error(res['msg']);
        this.toastrService.error('未查询到该特价订单信息，请联系管理员。')
        return;
      }
      let draftData = res['data']['taskFormComponentList']['globalVariables']['draftData'];
      this.commercialOrderService.changeSpecialOrderData(draftData);
    }
    if (this.formState['selectordertype']) {
      this.formState['selectordertype']['isCompleted'] = true;
    }
    this.selectOrderType.isCompleted = true;
    this.isCompleted = this.selectOrderType.isCompleted;
    this.commercialOrderService.changeIsOrderTypeCompleted(this.selectOrderType.isCompleted);
    this.commercialOrderService.changeOrderType(this.selectOrderType.orderType);
    
    this.elementsChanged();
  }  

  async getSpecialOrderData (processInstanceId: string) {
    const uri = `/act/task/genericFinishedProcessMainForm/${processInstanceId}/finished` ;
    let res = await this.http.get(uri).toPromise();

    return res;
  }
  elementsChanged() {
    const quotationInputValue = JSON.stringify(this.selectOrderType);
    // console.log('elementsChanged', this.selectOrderType);
    this.formControl.setValue(quotationInputValue);
    // console.log(this.formControl.value);
  }

  initSpecialOrderSelects() {
    let owner = localStorage.getItem('ng_philips_code1');
    let states = 'finished';
    // let states = 'running'; //for dev
    let procdefKey = 'SpecialPriceApproval_WF';
    let params = {
      owner: owner,
      states: states,
      procdefKey: procdefKey
    };

    let uri = '/act/task/listProcessInstanceID'
    this.http.post(uri, params).subscribe(res=>{
      console.log('initSpecialOrderSelects',res);
      if('0000' == res.code) {
        let result = res.data || [];
        for(let item of result) {
          item['label'] = item['processInstanceId'] + '(' + item['businessName'] + ')';
          item['labelNew'] = item['businessNumber'] + '(' + item['businessName'] + ')';
        }
        this.specialOrderSelects = [...result];
      }
    });

  }
}
