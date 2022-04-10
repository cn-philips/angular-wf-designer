import {Component, OnInit, Output, Input} from '@angular/core';
import {FileService, HttpService} from '../../../services';
import {NzMessageService, NzModalService, UploadFile} from 'ng-zorro-antd';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {formatDate, cheakDate, decodeString, getType} from '../../../../assets/js/tools';

export interface labarrd {
  nonStandardTerms?: number; // 包含非标准条款
  logisticsTermsApproval?: number; // 物流审批条款
  remarks?: string; // 备注
  approvalAfterSales?: number; // 售后维修条款审批
  approvalBidSecurity?: number; // 保证金
  paymentMethod?: number; // 付款方式
  technicalTerms?: number; // 技术条框
  provisionsInvolved?: number; // 涉及法律条款说明
  status?: number; // 0拒绝 1通过
  mainId?: string; // id
  taskId?: any;
  progress?: any;
  file?: any;
  bmclist?: any;
  approvallist?: any;
  processInstanceTaskId?: any;
}

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})

export class ReviewComponent implements OnInit {

  constructor(
    private http: HttpService,
    private message: NzMessageService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: NzModalService,
  ) {
  }
  @Input() public contractEndDate: any;
  @Input() isVisibleDate: boolean;
  @Input() public take: boolean = false;
  @Input() public urls: any = '';
  @Input() dataBase: any = {};
  @Input() labarr: any = {};
  public textLen: any = 255;
  public mainId: any = '';
  public flag: number = 0; //待办已办
  public taskId: any = '';
  public status: any = ''; //状态码
  load: any = false;
  @Input() fileList: any = {
    fileList: []
  }; // 审批文件
  validateForm: FormGroup;

  ngOnInit() {
    this.init();
  }

  labarrs: labarrd = {};
  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return {required: true};
    } else if (control.value !== this.validateForm.controls.password.value) {
      return {confirm: true, error: true};
    }
    return {};
  };
  //上传审批文件
  beforeApprovalUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; //文件大小不超过100M
    const fileType = getType(file);
    if (fileType === 'exe' || fileType === 'bat') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '文件大小不超过100M');
      return false;
    }
    this.upload('fileList', file, 'file');
    return false;
  };
  //上传文件下载
  dwonLoad = (file: UploadFile): void => {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf('#');
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${file.fileId}`;
    window.open(url, '_blank');
  };

  //上传的附件回显
  viewData(data, fileList, name) {
    const bidWinningNotice = this.dataBase[data];
    if (bidWinningNotice != '' && bidWinningNotice != undefined && bidWinningNotice != null) {

      this.fileList[fileList] = [];
      let obj = {uid: '', name: '', fileId: ''};
      obj.uid = this.dataBase[data];
      obj.fileId = this.dataBase[data];
      if (this.dataBase[name] != null && this.dataBase[name] !== '') {
        obj.name = this.dataBase[name];
      } else {
        obj.name = '文件下载';
      }
      this.fileList[fileList].push(obj);
    }

  }

  // 文件下载
  fileDwon(id) {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf('#');
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${id}`;
    window.open(url, '_blank');
  }

  /**
   * filist 在线显示的文件 file上传的文件 fileId绑定的上传文件的id
   */
  upload(fileList, file, fileId) {
    this.fileList[fileList] = [];
    let type = getType(file);
    this.fileList[fileList].push(file);
    const formData = new FormData();
    this.fileList[fileList].forEach((file: any) => {
      formData.append('file', file);
      formData.append('fileType', type);
      formData.append('filename', file.name);
    });
    this.load = true;
    const url = '/act/system/upload';
    this.http.posts(url, formData).subscribe((res => {
      if (res.code === '0000') {
        this.load = false;
        this.fileList[fileList][0].fileId = res.data;
        this.labarr[fileId] = res.data;
        this.message.create('success', res.msg);
      } else {
        this.message.create('error', res.msg);
      }
    }), (error) => {
      this.fileList[fileList] = [];
      this.load = false;
      this.message.create('error', '上传失败请重新上传!');
    });
  }

  init() {
    this.mainId = decodeString(this.activeRoute.queryParams['_value'].id);
    this.flag = this.activeRoute.queryParams['_value'].flag;
    this.status = this.activeRoute.queryParams['_value'].status;
    this.taskId = this.activeRoute.queryParams['_value'].taskid;
    this.validateForm = this.fb.group({
      remarks: [null, [Validators.required]]
    });
    if (this.take) {  // 部门审批需要回显示数据、传员审批不用调此接口
      const url = `/act/ecom/tender/application/getTenderApp?mainId=${this.mainId}`;
      this.http.get(url).subscribe(res => {
        if (res.data) {
          this.dataBase.BMClist = res.data.bmclist;
          this.dataBase.approvallist2 = res.data.approvallist;
          this.labarr.approvalAfterSales = res.data.approvalAfterSales == 1 ? true : false;
          this.labarr.nonStandardTerms = res.data.nonStandardTerms == 1 ? true : false;
          this.labarr.logisticsTermsApproval = res.data.logisticsTermsApproval == 1 ? true : false;
          this.labarr.approvalBidSecurity = res.data.approvalBidSecurity == 1 ? true : false;
          this.labarr.paymentMethod = res.data.paymentMethod == 1 ? true : false;
          this.labarr.technicalTerms = res.data.technicalTerms == 1 ? true : false;
          this.labarr.provisionsInvolved = res.data.provisionsInvolved == 1 ? true : false;
          this.labarr.file = this.flag == 1 ? res.data.file : ''; //只有在代办的里边显示文件，已办不显示
          this.labarr.remarks = this.flag == 1 ? res.data.remarks : ''; //只在代办里边显示备注，已办不显示备注
          this.isVisibleDate = this.dataBase.isVisibleDate;
        } else {
          this.labarr.approvalAfterSales = false;
          this.labarr.nonStandardTerms = false;
          this.labarr.logisticsTermsApproval = false;
          this.labarr.approvalBidSecurity = false;
          this.labarr.paymentMethod = false;
          this.labarr.technicalTerms = false;
          this.labarr.provisionsInvolved = false;
        }
      });
    }
  }

  submit() //通过
  {

    this.labarrs.bmclist = [];
    if (this.labarr.technicalTerms) {
      this.labarrs.bmclist = this.dataBase.BMClist;
      // 便利bmclist 添加 email
      if (this.labarrs.bmclist) {
        for (let i = 0; i < this.labarrs.bmclist.length; i++) {
          const bmc = this.labarrs.bmclist[i].bmc;
          // 循环 BMCExpert 里对应 bmclist bmc 那一项
          if (this.dataBase.BMCExpert[bmc]) {
            for (let j = 0; j < this.dataBase.BMCExpert[bmc].length; j++) {
              // 找到选中name中对应的那一项，将email获取到
              if (this.labarrs.bmclist[i].name === this.dataBase.BMCExpert[bmc][j].name) {
                this.labarrs.bmclist[i].email = this.dataBase.BMCExpert[bmc][j].email;
              }
              if (this.labarrs.bmclist[i].name == null) {
                this.labarrs.bmclist[i].email = '';
              }
            }
          }
        }
      }
      // 判断非空
      for (let c = 0; c < this.labarrs.bmclist.length; c++) {
        if ((this.labarrs.bmclist[c].email === '' || this.labarrs.bmclist[c].email == null) && !this.take) {
          this.message.create('error', '请选择审批人');
          return;
        }
      }
    }
    let appexpert = [];
    // let appexpertemail = [];
    this.labarrs.approvallist = [];
    console.log(this.labarrs);
    if (this.labarr.approvalBidSecurity && this.dataBase.AppExpert) {
      this.dataBase.AppExpert.map(e => {
        // if (appexpertemail.indexOf(e.email) == -1) {
        appexpert.push({
          bmc: e.bmc,
          name: e.name,
          email: e.email
        });
        // appexpertemail.push(e.email);
        // }
      });
      this.labarrs.approvallist = appexpert;
    }


    this.labarrs.status = 1;
    this.labarrs.mainId = this.mainId;
    this.labarrs.nonStandardTerms = this.labarr.nonStandardTerms == true ? 1 : 0;
    this.labarrs.logisticsTermsApproval = this.labarr.logisticsTermsApproval == true ? 1 : 0;
    this.labarrs.approvalAfterSales = this.labarr.approvalAfterSales == true ? 1 : 0;
    this.labarrs.approvalBidSecurity = this.labarr.approvalBidSecurity == true ? 1 : 0;
    this.labarrs.paymentMethod = this.labarr.paymentMethod == true ? 1 : 0;
    this.labarrs.provisionsInvolved = this.labarr.provisionsInvolved == true ? 1 : 0;
    this.labarrs.technicalTerms = this.labarr.technicalTerms == true ? 1 : 0;
    this.labarrs.remarks = this.labarr.remarks;
    this.labarrs.file = this.labarr.file;
    let y = this.labarrs;
    if (y.nonStandardTerms == 1 && y.logisticsTermsApproval == 0 && y.approvalAfterSales == 0 && y.approvalBidSecurity == 0 && y.paymentMethod == 0 && y.technicalTerms == 0 && y.provisionsInvolved == 0) {
      this.message.create('error', '请选择一项');
      return;
    }
    this.labarrs.progress = this.status === '2JSH' ? '2' : '1'; // 一级部门审批or二级部门审批
    const url = this.urls;
    this.status === '2JSH' && (this.labarrs.taskId = this.taskId); // 二级部门审批需要传taskId

    const processInstanceTaskId = this.activeRoute.queryParams['_value'].processInstanceTaskId;
    if (processInstanceTaskId != null && processInstanceTaskId !== undefined && processInstanceTaskId !== '') {
      this.labarrs.processInstanceTaskId = processInstanceTaskId;
    }
    this.http.post(url, this.labarrs).subscribe((res => {
      if (res.code == '0000') {
        this.message.create('success', res.msg);
        this.router.navigate(['/igt/my-task']);
      } else {
        this.message.create('error', res.msg);
      }
    }), (error) => {
      this.message.create('error', '请求异常');
    });

  }

  refuse() // 拒绝
  {

    this.labarrs.bmclist = [];
    if (this.labarr.technicalTerms) {
      this.labarrs.bmclist = this.dataBase.BMClist;

      // 便利bmclist 添加 email
      if (this.labarrs.bmclist) {
        for (let i = 0; i < this.labarrs.bmclist.length; i++) {
          const bmc = this.labarrs.bmclist[i].bmc;
          // 循环 BMCExpert 里对应 bmclist bmc 那一项
          if (this.dataBase.BMCExpert[bmc]) {
            for (let j = 0; j < this.dataBase.BMCExpert[bmc].length; j++) {
              // 找到选中name中对应的那一项，将email获取到
              if (this.labarrs.bmclist[i].name === this.dataBase.BMCExpert[bmc][j].name) {
                this.labarrs.bmclist[i].email = this.dataBase.BMCExpert[bmc][j].email;
              }
              if (this.labarrs.bmclist[i].name == null) {
                this.labarrs.bmclist[i].email = '';
              }
            }
          }
        }
      }
      // 判断非空
      for (let c = 0; c < this.labarrs.bmclist.length; c++) {
        if ((this.labarrs.bmclist[c].email === '' || this.labarrs.bmclist[c].email == null) && !this.take) {
          this.message.create('error', '请选择审批人');
          return;
        }
      }
    }
    let appexpert = [];
    // let appexpertemail = [];
    this.labarrs.approvallist = [];
    console.log(this.labarrs);
    if (this.labarr.approvalBidSecurity && this.dataBase.AppExpert) {
      this.dataBase.AppExpert.map(e => {
        // if (appexpertemail.indexOf(e.email) == -1) {
        appexpert.push({
          bmc: e.bmc,
          name: e.name,
          email: e.email
        });
        // appexpertemail.push(e.email);
        // }
      });
      this.labarrs.approvallist = appexpert;
    }


    this.labarrs.status = 0;
    this.validateForm.controls['remarks'].markAsDirty();
    this.validateForm.controls['remarks'].updateValueAndValidity();
    if (!this.validateForm.valid) {
      return;
    }
    this.labarrs.mainId = this.mainId;
    this.labarrs.nonStandardTerms = this.labarr.nonStandardTerms == true ? 1 : 0;
    this.labarrs.logisticsTermsApproval = this.labarr.logisticsTermsApproval == true ? 1 : 0;
    this.labarrs.approvalAfterSales = this.labarr.approvalAfterSales == true ? 1 : 0;
    this.labarrs.approvalBidSecurity = this.labarr.approvalBidSecurity == true ? 1 : 0;
    this.labarrs.paymentMethod = this.labarr.paymentMethod == true ? 1 : 0;
    this.labarrs.provisionsInvolved = this.labarr.provisionsInvolved == true ? 1 : 0;
    this.labarrs.technicalTerms = this.labarr.technicalTerms == true ? 1 : 0;
    this.labarrs.remarks = this.labarr.remarks;
    this.labarrs.file = this.labarr.file;
    this.labarrs.progress = this.status === '2JSH' ? '2' : '1'; // 一级部门审批or二级部门审批
    const url = this.urls;
    this.status === '2JSH' && (this.labarrs.taskId = this.taskId); // 二级部门审批需要传taskId

    const processInstanceTaskId = this.activeRoute.queryParams['_value'].processInstanceTaskId;
    if (processInstanceTaskId != null && processInstanceTaskId !== undefined && processInstanceTaskId !== '') {
      this.labarrs.processInstanceTaskId = processInstanceTaskId;
    }
    this.http.post(url, this.labarrs).subscribe((res => {
      if (res.code === '0000') {
        this.message.create('success', res.msg);
        this.router.navigate(['/igt/my-task']);
      } else {
        this.message.create('error', res.msg);
      }
    }), (error: Error) => {
      this.message.create('error', '请求异常!');
    });
  }

  // 下拉框监听
  public ngModelChang(e) {
    console.log(e);
  }

  // 数组排序
  public arrSort(arr) {
    if (arr) {
      arr.sort(function (a, b) {
        if (a.bmc < b.bmc) {
          return -1;
        }
        if (a.bmc > b.bmc) {
          return 1;
        }
        return 0;
      });
    }
    return arr;
  }

  public isSubmit() {
    this.ddpJudge(this.dataBase.dealerNo, this.dataBase.agreementAgenName);
  }

  public ddpJudge(leaderNo, leaderName) {
    if (this.flag === 1) {
      return;
    }
    if (this.dataBase.businessType === 'DIRECT') {
      console.log('--------------------------------------------------');
      this.submit();
      return;
    }
    const url = '/act/ecom/bidding/getDdpDateAndValid?dealerCode=' + leaderNo + '&dealerName=' + leaderName;
    this.http.get(url).subscribe(
      res => {
        if (res.data.isValid) {
          this.submit();
          this.isVisibleDate = false;
          return;
        } else {
          this.modalService.confirm({
            nzTitle: '<h4>提醒</h4>',
            nzContent: '经销商DDP有效日期为' + res.data.ddpDate + ' ,当前已过有效期，是否确认审批通过？',
            nzOnOk: () => {
              this.submit();
            }
          });
        }
      }, error => {
        this.message.error('请求失败!');
      }
    );
  }

}
