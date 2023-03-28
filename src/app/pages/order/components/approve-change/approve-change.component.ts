import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '@core/services';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
import { decodeString, codeString, upLoadFileNew } from '@core/util/tools';
import { environment } from '@env';
import { RouterExtendService } from '@app/modern-themes/services/router-extend.service';
class ChangeDetails {
  modalForm: FormGroup;
}
class ChangeExamine {
  examineForm: FormGroup;
}

@Component({
  selector: 'app-approve-change',
  templateUrl: './approve-change.component.html',
  styleUrls: ['./approve-change.component.scss']
})
export class ApproveChangeComponent implements OnInit {

  constructor(private nzMessageService: NzMessageService,
    private http: HttpService,
    private router: Router,
    private aRoute: ActivatedRoute,
    private message: NzMessageService,
    public activatedRouter: ActivatedRoute,
    private routerExtend:RouterExtendService,
    private fb: FormBuilder) {
    this.flag = this.aRoute.queryParams['_value'].flag;
    this.status = this.aRoute.queryParams['_value'].status;
    this.initChangeExamine();

  }

  ngOnInit() {
    this.initChangeDetails();
    this.getDetail();
    this.getRecordData();
    this.getOrderContractId();
  }
  load: any = false;
  status: any;
  flag: any
  textLen: any = 255;
  //改单记录数据
  recordData: any = [{ version: "1.0", ReferenceID: "123456", chagetype: "", remark: "", changeFile: "", dealFrom: "2112313", status: "已批准", stateDate: "2017-08-08", approval: "2017-08-09" }]
  //改单详情
  public changeParam: any = {
    changeReason: "",
    remark: "",
    file: "",
    fileNames: "",
    changeDealForm: false,
    reason:"",
  }
  //审核表单
  public examineParam: any = {
    remark: "",
    file: "",
  };
  //合同概要表关联
  public relation: any = {
    preparationId: "",
    contractId: "",
    PreparationReferenceId: "",
    ContractReferenceId: "",
  };
  public fileFileList: any = [];
  public supportFileList: any = [];
  examineForm: any;
  @Input() public disa: any = false;
  @Input() public dataBase: any;
  public changeDetails: ChangeDetails;
  public changeExamine: ChangeExamine;
  public cannel: any = false;
  public reasonList: any = [{ value: "dealfromId丢失!", label: "dealfromId丢失!" }, { value: "选择失败!", label: "选择失败!" }];
  public gotoWinInconMain(item) {
    window.open(location.origin + environment.base_href + '/#/' + 'pre-order/view-subp?id=' + codeString(item) + '&flag=1');
  }
  //跳转到合同概要表
  public gotoWinIncon(item) {
    window.open(location.origin + environment.base_href + '/#/' + '/pre-order/in-con-modif?id=' + codeString(item) + '&flag=1');
  }
  //合同概要表关联
  getOrderContractId() {
    let mainids = this.activatedRouter.queryParams['_value'].mainId
    let id = this.activatedRouter.queryParams['_value'].id
    const mainId = mainids ? decodeString(mainids) : decodeString(id);
    let url = `/act/preparation/getOrderContractId?mainId=${mainId}`;
    this.http.get(url).subscribe((rest => {
      if (rest.code == "0000") {
        if (rest.data) {
          this.relation.preparationId = rest.data.preparationId;
          this.relation.contractId = rest.data.contractId;
          this.relation.preparationReferenceId = rest.data.preparationReferenceId;
          this.relation.contractReferenceId = rest.data.contractReferenceId;
        }
      }
      else {
        this.message.create('error', rest.msg);
      }
    }), (error) => {
      this.message.create("error", "请求异常!");
    })
  }
  //改单记录
  getRecordData() {
    let mainids = this.activatedRouter.queryParams['_value'].mainId
    let id = this.activatedRouter.queryParams['_value'].id
    const mainId = mainids ? decodeString(mainids) : decodeString(id);
    let url = `/act/preparation/getChangeRecord?mainId=${mainId}`;
    this.http.get(url).subscribe((rest => {
      if (rest.code === '0000') {
        let { data } = rest;
        let index = data[0].refId.indexOf("(");
        let nowRefId = data[0].refId.substr(0, index);
        let obj = {
          lastMainId: data[0].hmainId,
          nmainId: data[0].hmainId,
          refId: nowRefId,
          orderChange: "",
          remark: "",
          fileNames: "",
          file: "",
          status: "",
          createTime: "",
        }
        this.recordData = [...rest.data];
        this.recordData.unshift(obj);
      }
      else {
        this.message.create('error', rest.msg);
      }
    }), (error) => {
      this.message.create("error", "请求异常!");
    });
  }
  //改单详情
  getDetail() {
    let mainids = this.activatedRouter.queryParams['_value'].mainId
    let id = this.activatedRouter.queryParams['_value'].id
    const mainId = mainids ? decodeString(mainids) : decodeString(id);
    let url = `/act/preparation/changeRecords?mainId=${mainId}`
    this.http.get(url).subscribe((rest => {
      if (rest.code === '0000') {
        this.changeParam.changeReason = rest.data.check;
        this.changeParam.remark = rest.data.remark;
        this.changeParam.file = rest.data.file;
        this.changeParam.fileNames = rest.data.fileNames;
        this.changeParam.changeDealForm = rest.data.changeDealForm;
        this.changeParam.reason=rest.data.reason;
        this.changeParam.file && this.viewData();
      }
      else {
        this.message.create('error', rest.msg);
      }
    }), (error) => {
      this.message.create("error", "请求异常!");
    });
  }
  initChangeDetails = () => {
    this.changeDetails = new ChangeDetails();
    const disable = (this.status == 'change_oit_approval' || this.flag == 1 || this.dataBase.hsId) ? true : false
    this.changeDetails.modalForm = this.fb.group({
      changeReason: new FormControl({ value: '', disabled: disable }, null),
      remark: new FormControl({ value: '', disabled: disable }, null),
      file: [null],
      changeDealForm: new FormControl({ value: '', disabled: disable }),
      reason:[{value:"",disabled:true}]
    });
  }
  initChangeExamine = () => {
    const disable = this.flag == 1 ? true : false
    this.examineForm = this.fb.group({
      remark: new FormControl({ value: '', disabled: disable }, [Validators.required]),
      file: [null],
    });
    this.getOrderChang();
  }
  getOrderChang = () => {
    this.http.post('act/ecom/order/application/getOrderChange', {
      pageSize: 1000,
      pageNo: 1,
      status: 1,
    }).subscribe((rest => {
      if (rest.code === '0000') {
        if (rest.data) {
          this.reasonList = [...rest.data.rows];
        }
      } else {
        this.message.create('error', rest.msg);
      }
    }), (error) => {
      this.message.create("error", "请求异常!");
    });
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
  // 文件下载
  public fileDwon(id) {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf('#');
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${id}`;
    window.open(url, '_blank');
  }
  //发起进单的支持文件上传
  public supportBeforeUpload = (file: UploadFile): boolean => {
    const upLoadFileNews = upLoadFileNew.bind(this);
    upLoadFileNews(file).then((val => {
      this.supportFileList = val.fileList;
      this.changeParam.file = val.fileId;
    }), (error) => {
      this.changeParam.file = "";
      this.supportFileList = [];
    });
    return false;
  }
  //审核的文件上传
  public fileBeforeUpload = (file: UploadFile): boolean => {
    const upLoadFileNews = upLoadFileNew.bind(this);
    upLoadFileNews(file).then((val => {
      this.fileFileList = val.fileList;
      this.examineParam.file = val.fileId;
    }), (error) => {
      this.examineParam.file = "";
      this.fileFileList = [];
    });
    return false;
  }
  //执行通过
  confirmApproval(check) {
    this.sumbit(check)
  }

  //发起改单
  changeOrder(check: any) {

    const mainId = decodeString(this.activatedRouter.queryParams['_value'].mainId);
    if (check == 1) {
      this.cannel = false;
      this.changeDetails.modalForm.get('remark')!.setValidators(Validators.required);
      this.changeDetails.modalForm.get('remark')!.markAsDirty();
      this.changeDetails.modalForm.get('changeReason')!.setValidators(Validators.required);
      this.changeDetails.modalForm.get('changeReason')!.markAsDirty();
    }
    else {
      this.cannel = true;
      this.changeDetails.modalForm.get('changeReason')!.clearValidators();
      this.changeDetails.modalForm.get('changeReason')!.markAsDirty();
      this.changeDetails.modalForm.get('remark')!.setValidators(Validators.required);
      this.changeDetails.modalForm.get('remark')!.markAsDirty();
    }
    this.changeDetails.modalForm.get('remark')!.updateValueAndValidity();
    this.changeDetails.modalForm.get('changeReason')!.updateValueAndValidity();
    for (const i in this.changeDetails.modalForm.controls) {
      this.changeDetails.modalForm.controls[i].markAsDirty();
      this.changeDetails.modalForm.controls[i].updateValueAndValidity();
    }
    if (!this.changeDetails.modalForm.valid) {
      this.message.create("error", "有必填项没有填写!")
      return
    }
    let param: any = {
      mainId: mainId,
      check: this.changeParam.changeReason,
      file: this.changeParam.file,
      remark: this.changeParam.remark,
      checks: check,
    }
    this.load = true;
    const processInstanceTaskId = this.activatedRouter.queryParams['_value'].processInstanceTaskId;
    param.processInstanceTaskId = processInstanceTaskId;
    const url = `/act/preparation/checkchangeRecord`;
    this.http.post(url, param).subscribe((rest => {
      if (rest.code === '0000') {
        this.load = false;
        this.message.create('success', rest.msg);
        this.routerExtend.back()
      }
      else {
        this.message.create('error', rest.msg);
      }
    }), (error => {
      this.load = false;
      this.message.create("error", "请求异常")
    }));
  }
  //删除支持文件
  nzRemoveSupport() {
    this.changeParam.file = "";
    return true;
  }
  //删除审核文件
  nzRemoveFile() {
    this.examineParam.file = "";
    return true;
  }
  //取消进单
  cancelAction() {
    this.nzMessageService.info('Cancel this operation');
  }
  sumbit(check) {

    if (check == 0) {
      this.examineForm.get('remark')!.setValidators(Validators.required);
      this.examineForm.get('remark')!.markAsDirty();
      this.examineForm.get('remark')!.updateValueAndValidity();
      if (!this.examineForm.valid) {
        return;
      }
    }
    else {
      this.examineForm.get('remark')!.clearValidators();
      this.examineForm.get('remark')!.markAsPristine();
      this.examineForm.get('remark')!.updateValueAndValidity();
    }
    for (const i in this.examineForm.controls) {
      this.examineForm.controls[i].markAsDirty();
      this.examineForm.controls[i].updateValueAndValidity();
    }
    let url = `/act/preparation/checkchangeOitApproval`;
    this.examineParam.mainId = decodeString(this.activatedRouter.queryParams['_value'].mainId);
    const processInstanceTaskId = this.activatedRouter.queryParams['_value'].processInstanceTaskId;
    this.examineParam.processInstanceTaskId = processInstanceTaskId;
    this.examineParam.checks = check;
    if (!this.examineForm.valid) {
      this.message.create("error", "请填写拒绝理由!");
      return;
    }
    this.load = true
    this.http.post(url, this.examineParam).subscribe((res => {
      this.load = false;
      if (res.code == '0000') {
        this.message.create('success', res.msg);
        // this.router.navigate(['/ecos/my-done']);
        this.routerExtend.back();
      }
    }), (error) => {
      this.load = false;
      this.message.create('error', '请求异常!');
    })
  }
  public gotoOit(item) {

    if (this.status == 'change_oit' || this.status == 'change_oit_approval') {
      let id = codeString(item.lastMainId);
      let url = `${location.origin}${environment.base_href}/#/pre-order/complete-oit?id=${id}&flag=1&status=OITEND`;

      window.open(url);
    }
    else {
      let id = codeString(item.nmainId);
      let url = "";
      switch (item.taskStatus) {
        case "XJDHTGYBTX":
        case "DHTGYBTX":
          url = `${location.origin}${environment.base_href}/#/pre-order/in-con-modif?id=${id}&flag=1&status=${item.taskStatus}`
          break;
        case "DHTOASH":
          url = `${location.origin}${environment.base_href}/#/pre-order/examine-order?id=${id}&flag=1&status=${item.taskStatus}`
          break;
        case "DOAJDQR":
          url = `${location.origin}${environment.base_href}/#/pre-order/examine-order?id=${id}&flag=1&status=${item.taskStatus}`
          break;
        case "DTXHT":
          url = `${location.origin}${environment.base_href}/#/pre-order/in-order?id=${id}&flag=1&status=${item.taskStatus}`
          break;
        case "DHTQS":
          url = `${location.origin}${environment.base_href}/#/pre-order/con-sign?id=${id}&flag=1&status=${item.taskStatus}`
          break;
        case "DOITWJSC":
        case "OITEND":
          url = `${location.origin}${environment.base_href}/#/pre-order/complete-oit?id=${id}&flag=1&status=${item.taskStatus}`;
          break;
        case "DBCWJSC":
        case "OITENDDBCWJSC":
          url = `${location.origin}${environment.base_href}/#/pre-order/supp-file?id=${id}&flag=1&status=${item.taskStatus}`;
          break;
        default:
          url = `${location.origin}${environment.base_href}/#/pre-order/complete-oit?id=${id}&flag=1&status=OITEND`;
      }
      window.open(url);
    }
  }
  /**
* @param   data 回显数据
* @param   fileList 回显数组
*/
  viewData() {

    const bidWinningNotice = this.changeParam.file;
    if (bidWinningNotice != "" && bidWinningNotice != undefined && bidWinningNotice != null) {

      this.supportFileList = [];
      let obj = { uid: "", name: "", fileId: "" }
      obj.uid = this.changeParam.file;
      obj.fileId = this.changeParam.file;
      obj.name = this.changeParam.fileNames;
      this.supportFileList.push(obj);
    }
  }
}
