import { Component, OnInit, Input, ViewChild,EventEmitter,Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpService, ServesiceService } from '@core/services';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
import { upLoadFileNew } from '@core/util/tools';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})

export class ConfirmComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private message: NzMessageService,
    public activatedRouter: ActivatedRoute,
    private ServesiceService: ServesiceService
  ) { }

  @Output() select: EventEmitter<any> = new EventEmitter()
  
  isAgres:any=false;
  @ViewChild('child') child;
  public load: any = true;
  @Input() remarkFrom:FormGroup;
  show(val)
  {
    this.isAgres=true;
    switch (val){
      case "cancelReceipt": //取消进单准备表
        this.getResonList('cancelSubProcess');
        break;
      case "colseContract":  //关闭合同概要表
        this.getResonList('closeSubProcess');
        break;
      case "backContract": //退回合同概要表
        this.getResonList('rejectSubProcess');
        break
    }
  }
  public titleName: any;
  ngOnChanges() {
    // this.ServesiceService.confirmTime.subscribe(val => {
    //   this.titleName = val.title;
    //   this.fileFileList = [];     
    //   switch (val.code) {
    //     case "cancelReceipt": //取消进单准备表
    //       this.getResonList('cancelSubProcess');
    //       break;
    //     case "colseContract":  //关闭合同概要表
    //       this.getResonList('closeSubProcess');
    //       break;
    //     case "backContract": //退回合同概要表
    //       this.getResonList('rejectSubProcess');
    //       break
    //   }
    // })
  }

  ngOnInit() {   
  }
  public textLen: any = 255;
  public fileFileList: any = [];
  public reasonList: any = []




  //验证必填项
  public checkFormData = () => {
    for (const i in this.remarkFrom.controls) {
      this.remarkFrom.controls[i].markAsDirty();
      this.remarkFrom.controls[i].updateValueAndValidity();
    }
    return this.remarkFrom.valid;
  }
  //原因下拉框
  public getResonList(param) {
    // 进单准备表-选择经销商
    let url = `/act/ecom/dictData/queryDrop?dictGroup=PROCESS_STATUS&listClass=${param}`;
    this.load = true;  
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe((rest => {
        if (rest.code === '0000') {
          this.reasonList = rest.data;
          resolve(rest.data);
          this.load = false;
        }
        else {
          this.message.create('error', `${rest.msg}`);
          this.load = false;
        }
      }), (error => {
        this.message.create("error", "请求异常");
        this.load = false;
      }));
    })
  }
  //取消
  isAgreCancels()
  {
    this.isAgres=false;
  }
  //确定
  isAgregentOk()
  { 
    const valid=this.checkFormData();
    if(valid)
    {
      this.isAgres=false;
      this.select.emit(this.remarkFrom)
    }   
  }
}
