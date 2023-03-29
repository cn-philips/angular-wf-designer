import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable, Observer } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from '@core/services';
import { ToastrService } from 'ngx-toastr';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
import { decodeString, getType, standardTime, isadopt, formatDatesNow } from '@core/util/tools';
import { RouterExtendService } from '@app/modern-themes/services/router-extend.service';



@Component({
  selector: "app-inoderfrom",
  templateUrl: "./inoderfrom.component.html",
  styleUrls: ["./inoderfrom.component.scss"],
})
export class InoderfromComponent implements OnInit {
  public load: any = false;
  public textLen: any = 255;
  public fileFileList = []; //

  flag: any;
  public isShowDate: any = false;
  public isShowDates: any = false;
  params: any = {
    remark: "",
    file: "",
    mainId: decodeString(this.activatedRouter.queryParams["_value"].id),
    check: 0, // 1 通过， 0 拒绝
  };
  public isVisibleDateIepool: any = false;
  public isVisibleDate: any = false;
  @Input() dataBase: any = {
    productList: [], // 产品列表
    detail: {
      id: decodeString(this.activatedRouter.queryParams["_value"].id),
      flag: this.activatedRouter.queryParams["_value"].flag,
      status: this.activatedRouter.queryParams["_value"].status,
      taskID: this.activatedRouter.queryParams["_value"].taskID,
    },
  };
  validateForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private toastrService: ToastrService,
    private message: NzMessageService,
    public activatedRouter: ActivatedRoute,
    private routerExtend: RouterExtendService
  ) {}
  ngOnChanges() {
    if (this.dataBase.hospitalNature) {
      const ASYNS = async () => {
        if (this.dataBase.businessModel == "DISTRIBUTOR") {
          await this.getdistributorDate();
        }
        if (this.dataBase.invoiceInformation === "USD") {
          await this.getIepoolDate();
        }
      };
      ASYNS();
    }
  }
  //取消
  isshowDateCancel() {
    this.isShowDate = false;
  }
  //取消
  isshowDateCancels() {
    this.isShowDates = false;
  }
  /**
   * filist 在线显示的文件 file上传的文件 fileId绑定的上传文件的id
   */
  public upload(fileList, file, fileId) {
    this[fileList] = [];
    const type = getType(file);
    this[fileList].push(file);
    const formData = new FormData();
    // tslint:disable-next-line:no-shadowed-variable
    this[fileList].forEach((file: any) => {
      formData.append("file", file);
      formData.append("fileType", type);
      formData.append("filename", file.name);
    });
    this.load = true;
    const url = "/act/system/upload";
    this.http.posts(url, formData).subscribe(
      (res) => {
        if (res.code === "0000") {
          this.load = false;
          this[fileList][0].fileId = res.data;
          this.params.file = res.data;
          this.message.create("success", res.msg);
        } else {
          this.message.create("error", res.msg);
          this.load = false;
        }
      },
      (error) => {
        this.load = false;
        this[fileList] = [];
        this.message.create("error", "上传失败请重新上传!");
      }
    );
  }

  // 上传文件下载
  public dwonLoad = (file: UploadFile): void => {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf("#");
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${file.fileId}`;
    window.open(url, "_blank");
  };
  // 上传文件
  public fileBeforeUpload = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 20; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType === "exe" || fileType === "bat") {
      this.message.create("error", "上传文件格式错误!");
      return false;
    }
    if (!isLt2M) {
      this.message.create("error", "文件大小不超过100M");
      return false;
    }
    this.upload("fileFileList", file, "file");
    return false;
  };

  ngOnInit() {
    this.flag = this.activatedRouter.queryParams["_value"].flag;
    this.validateForm = this.fb.group({
      remark: new FormControl(
        { value: "Nancy", disabled: this.flag == 1 },
        Validators.required
      ),
    });
  }

  sumbit(parm: number) {
    let url = "/act/preparation/orderSummaryReview";
    const processInstanceTaskId =
      this.activatedRouter.queryParams["_value"].processInstanceTaskId;
    this.params.check = parm;
    this.params.processInstanceTaskId = processInstanceTaskId;
    if (parm == 0) {
      this.validateForm.controls["remark"].markAsDirty();
      this.validateForm.controls["remark"].updateValueAndValidity();
      if (!this.validateForm.valid) {
        return;
      }
    }
    const ASYNS = async () => {
      this.load = true;
      if (this.dataBase.businessModel == "DISTRIBUTOR") {
        let distributorDate = await this.getdistributorDate();
        if (
          this.dataBase.businessModel === "DISTRIBUTOR" &&
          this.dataBase.ddpStatus !== "通过"
        ) {
          this.isShowDate = true;
          this.load = false;
          return;
        }
      }
      if (this.dataBase.invoiceInformation === "USD") {
        let iepoolDate = await this.getIepoolDate();
        if (
          this.dataBase.invoiceInformation === "USD" &&
          this.dataBase.contractDdpStatus !== "通过"
        ) {
          this.isShowDates = true;
          this.load = false;
          return;
        }
      }

      this.http.post(url, this.params).subscribe(
        (rest) => {
          if (rest.code === "0000") {
            this.load = false;
            this.message.create("success", `${rest.msg}`);
            // this.router.navigate(['/ecos/my-done']);
            this.routerExtend.back();
          } else {
            this.message.create("error", `${rest.msg}`);
            this.load = false;
          }
        },
        (error) => {
          this.load = false;
          this.message.create("error", "请求异常!");
        }
      );
    };
    ASYNS();
  }
  //提交效验经销商日期
  getdistributorDate() {
    let param = {
      pageNo: 1,
      pageSize: 5,
      agreementNo: "", //协议号
      dealerCode: "", //经销code
      dealerName: this.dataBase.agent, //经销商名称
      selectName: "", //当前选中
    };
    let url = `/act/preparation/getDealersOnlyWithRegFlag`;
    return new Promise((resolve, reject) => {
      this.http.post(url, param).subscribe(
        (res) => {
          if (res.code == "0000" && res.data) {
            let data = res.data.rows;
            if (data.length > 0) {
              let time = standardTime(data[0].ddpValidUntil);
              this.dataBase.ddpStatus = isadopt(time);
              this.dataBase.contractEndDate = formatDatesNow(time);
              if (this.dataBase.ddpStatus != "通过") {
                this.isVisibleDate = true;
              }
            }
            resolve(data);
          }
        },
        (error) => {
          this.message.create("error", "请求失败!");
        }
      );
    });
  }
  //提交获取外贸易
  getIepoolDate() {
    let param = {
      corporateName: this.dataBase.foreignTradeCompany,
    };
    let url = `/act/preparation/getIePool`;
    return new Promise((resolve, reject) => {
      this.http.post(url, param).subscribe(
        (res) => {
          if (res.code == "0000" && res.data) {
            let { data } = res;
            if (data.length > 0) {
              let time = standardTime(data[0].ddpValidUntil);
              this.dataBase.poolEndDate = formatDatesNow(time);
              this.dataBase.contractDdpStatus = isadopt(time);
              if (this.dataBase.contractDdpStatus != "通过") {
                this.isVisibleDateIepool = true;
              }
            }
            resolve(data);
          }
        },
        (error) => {
          this.message.create("error", "请求失败!");
        }
      );
    });
  }
}
