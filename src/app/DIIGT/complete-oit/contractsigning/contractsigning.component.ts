import {Component, Input, OnInit} from '@angular/core';
import {decodeString, getType,upLoadFiles} from '../../../../assets/js/tools';
import {HttpService} from '../../../services';
import {NzMessageService, UploadFile} from 'ng-zorro-antd';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-contractsigning',
  templateUrl: './contractsigning.component.html',
  styleUrls: ['./contractsigning.component.scss']
})
export class ContractsigningComponent implements OnInit {

  public dataBase: any = {};
  public validateForm: FormGroup;
  public flag: any;
  constructor(private message: NzMessageService,private fb: FormBuilder,private http: HttpService,public activatedRouter: ActivatedRoute) { }
  fileFileList:any=[];
  ngOnInit() {
     this.getDataDetail();
    this.flag = this.activatedRouter.queryParams['_value'].flag;
    this.validateForm = this.fb.group({
      remark: new FormControl({ value: 'Nancy', disabled: true }),
      file: new FormControl({ value: 'Nancy' }, Validators.required),
      file2: new FormControl({ value: 'Nancy' }, Validators.required),
      file3: new FormControl({ value: 'Nancy' }, Validators.required),


      salesAgreementNo: new FormControl({ value: 'Nancy' , disabled: true }, Validators.required), // 买卖协议号
      importAgreementNo: new FormControl({ value: 'Nancy' , disabled: true }, Validators.required), // 进口协议号
      purchaseOrderNumber: new FormControl({ value: 'Nancy' , disabled: true }, Validators.required), // 采购订单号
      priceTerms: new FormControl({ value: 'Nancy' , disabled: true }, Validators.required), // 价格术语
      solution: new FormControl({ value: 'Nancy' , disabled: true }, Validators.required), // 是否含有solution
      productConf: new FormControl({ value: 'Nancy' , disabled: true }, Validators.required), // 产品配置
      invoiceMailingInformation: new FormControl({ value: 'Nancy' , disabled: true }, Validators.required), // 发票邮寄信息
      portShipment: new FormControl({ value: 'Nancy' , disabled: true }, Validators.required), // 发货港
      typeShipping: new FormControl({ value: 'Nancy' , disabled: true }, Validators.required), // 运输方式
      portDestination: new FormControl({ value: 'Nancy' , disabled: true }, Validators.required), // 目的港
      contractDate: [null, [Validators.required]], // 合同确认日期
      isContract: new FormControl({ value: 'Nancy' , disabled: true }, Validators.required), // 正式合同已上传
    });
  }
  // 文件下载
  public fileDwon(id) {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf('#');
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${id}`;
    window.open(url, '_blank');
  }
  public getDataDetail() {
    const url = `/act/preparation/queryContractSigned?mainId=${decodeString(this.activatedRouter.queryParams['_value'].id)}`;
    this.http.get(url).subscribe( res => {
      if (res.code === '0000') {
        if (res.data) {
          Object.assign(this.dataBase, res.data);
         const {contractSignedAttachmentDTOList}=res.data;
         contractSignedAttachmentDTOList.map(vals=>{
               let obj={
                uid: "", name: "", fileId: ""
               }
               obj.uid=vals.attachmentId;
               obj.name=vals.attachmentName;
               obj.fileId=vals.attachmentId;
              this.fileFileList=this.fileFileList.concat(obj)
         })
        }
      }
      else{
        this.message.create('error', res.msg);
      }
    });
  }

  // 上传——file
  public fileBeforeUpload = (file: UploadFile,fileList: UploadFile[]): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);

    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    let upLoadFilesNow=upLoadFiles.bind(this);
    upLoadFilesNow('fileFileList',file,'attachmentIds','params');
    return false;
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

}
