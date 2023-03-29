import { Component, OnInit, Input, ViewChild } from '@angular/core';
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

  validateForm: FormGroup;
  @ViewChild('child') child;
  public load: any = false;
  @Input() infor: any = {
    refuseReason: "",
    remarks: "",
    file: "",

  };
  public titleName: any;
  ngOnChanges() {
    this.ServesiceService.confirmTime.subscribe(val => {
      this.titleName = val.title;
      this.infor = { ...val };
      this.fileFileList = [];
      this.viewData("file", "fileFileList", this.infor.fileName)
      switch (val.code) {
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
    })
  }

  ngOnInit() {
    this.validateForm = this.fb.group({
      refuseReason: new FormControl({ value: 'Nancy', }, Validators.required),
      remarks: new FormControl({ value: 'Nancy', }),
    })
  }
  public textLen: any = 255;
  public fileFileList: any = [];
  public reasonList: any = [{ value: "dealfromId丢失!", label: "dealfromId丢失!" }, { value: "选择失败!", label: "选择失败!" }]
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
  /**
    * @param   data 回显数据
    * @param   fileList 回显数组
    */
  viewData(data, fileList, name?: any) {
    const bidWinningNotice = this.infor[data];
    if (bidWinningNotice != "" && bidWinningNotice != undefined && bidWinningNotice != null) {

      this[fileList] = [];
      let obj = { uid: "", name: "", fileId: "" }
      obj.uid = this.infor[data];
      obj.fileId = this.infor[data];
      obj.name = name ? name : "下载文件"
      this[fileList].push(obj);
    }
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
}
