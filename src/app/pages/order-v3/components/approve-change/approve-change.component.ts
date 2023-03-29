import { Component, OnInit, Input, ViewChild,EventEmitter,Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute,Router } from '@angular/router';
import { HttpService, ServesiceService } from '@core/services';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
import { OrderV3Service } from "../../order-v3.service";
import { saveAs } from "file-saver";
import { environment } from '@env';


@Component({
  selector: 'approve-change',
  templateUrl: './approve-change.component.html',
  styleUrls: ['./approve-change.component.scss']
})
export class ApproveChangeComponent implements OnInit {

  constructor(private activatedRouter: ActivatedRoute,private serveice: OrderV3Service,private http: HttpService, private message: NzMessageService,) { }
  @Input()formValue:FormGroup;
  ngOnInit() {
    this.init()
  }
  nzAlign = "center";
  public reasonList:any=[];
  public recordData:any=[];
  public procInstId:any;
  public load:any;
  status:any;
  get changOrderFrom():FormGroup
  {
   return this.formValue.get('changOrderFrom') as FormGroup
  }
  get examineFrom():FormGroup
  {
    return this.formValue.get('examineFrom') as FormGroup
  }
  async init()
  {
  
   this.procInstId = this.activatedRouter.queryParams['value'].procInstId;
   const applyId=this.activatedRouter.queryParams['value'].id; 
   this.status=this.activatedRouter.queryParams['value'].taskStatus;
   this.load=true
   let reasonList:any=await this.getResonList()  
   const recordData=await this.serveice.changeOrderHistory(applyId);
   this.recordData=recordData.data;
   const detailData=await this.serveice.changeOrder(applyId);   
   this.reasonList=reasonList.data.rows;
   if(detailData.code=='0000')
   { 
     this.load=false;
     const {changeOrderFile,changeDealForm,applyId,reason,describes,orderChangeId,supportRemark}=detailData.data;
     this.changOrderFrom.patchValue({
      changeOrderFile,
      cancelApplyId:applyId,
      reason,
      describes,
      supportRemark,      
      changeDealForm,
      orderChangeId,
     })
   }
  }
  refuseReasonChang(e)
  {
    
    let select = this.reasonList.find(val => {
      if (val.orderChange == e) {
        return val
      }
    });
    if(select)
    {
      this.changOrderFrom.patchValue({
        orderChangeId:select.id,        
      })
      if(select.changeDealForm!=null&&select.changeDealForm!=undefined&&select.changeDealForm!='')
      {
        this.changOrderFrom.patchValue({
          changeDealForm:select.changeDealForm=='1'?true:false
        })
      }
    }   
  }
 
   //原因下拉框
getResonList() {
    let url = `act/ecom/order/application/getOrderChange`;
   return this.http.post(url, { pageSize: 1000, pageNo: 1, status: 1 }).toPromise()
 }
 gotoOit(item)
 {
  //改单本版跳转  
  window.open(`${location.origin}${environment.base_href}/#/order-v3/oitcomplete?id=${item.applyId}&flag=1&taskStatus=ecos_oit_order_done&processStatus=ecos_oit_order_change_approval&procInstId=${item.procInstId}`);
 } 
 onDownloadFile({ fileId,fileName }) {
  const url = `/act/system/download/${fileId}`;
  this.http
    .get(url, {
      responseType: "blob",
    })
    .subscribe((data) => {
      saveAs(data,fileName);
    });
}

}
