import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable, Observer } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from '../../../services';
import { ToastrService } from 'ngx-toastr';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
import { decodeString, getType, upLoadFileNew } from '../../../../assets/js/tools';
import { ServesiceService } from '../../preOrder/servesice.service';

@Component({
  selector: 'app-confirm-version',
  templateUrl: './confirm-version.component.html',
  styleUrls: ['./confirm-version.component.scss']
})
export class ConfirmVersionComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private toastrService: ToastrService,
    private message: NzMessageService,
    public activatedRouter: ActivatedRoute,
    private ServesiceService: ServesiceService,
    private nzMessageService: NzMessageService,) { }
  validateForm: FormGroup;
  @ViewChild('child') child;
  public load: any = false;
  @Input() infor: any = {
    refuseReason: "",
    remarks: "",
    file: "",
  };
  public textLen: any = 255;
  public fileFileList: any = [];
  public reasonList: any = [{ value: "dealfromId丢失!", label: "dealfromId丢失!" }, { value: "选择失败!", label: "选择失败!" }]
  ngOnChanges() {
    this.ServesiceService.confirmTime.subscribe(val => {            
      this.infor = { ...val };
      this.fileFileList = [];
      switch (val.code) {
        case "change": //取消进单准备表
          this.getResonList();
          break;
        default:
        this.reasonList=[{ value: "dealfromId丢失!", label: "dealfromId丢失!" }, { value: "选择失败!", label: "选择失败!" }];
      }
    })
  }
  ngOnInit() {
    this.validateForm = this.fb.group({
      refuseReason: new FormControl({ value: 'Nancy', }, Validators.required),
      remarks: new FormControl({ value: 'Nancy',},Validators.required),
    })
  }
  public fileBeforeUpload = (file: UploadFile): boolean => {
    const upLoadFileNews = upLoadFileNew.bind(this);
    upLoadFileNews(file).then((val => {
      this.fileFileList = val.fileList;
      this.infor.file = val.fileId;
    }), (error) => {

      this.infor.file = "";
      this.fileFileList = [];
    });
    return false;
  }
  //删除文件
  nzRemovmr = (file: UploadFile): any => {
    this.infor.file = "";
    return true;
  }
  // 上传文件下载
  public dwonLoad = (file: UploadFile): void => {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf('#');
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${file.fileId}`;
    window.open(url, '_blank');
  }
  //验证必填项
  public checkFormData = () => {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    return this.validateForm.valid;
  }
  //原因下拉框
  public getResonList() {
    //改单类型    
    let url = `act/ecom/order/application/getOrderChange`;
    this.load = true;
    return new Promise((resolve, reject) => {
      this.http.post(url,{pageSize:1000,pageNo:1,status:1}).subscribe((rest => {
        
        if (rest.code === '0000') {
          this.reasonList = rest.data.rows;
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
}
