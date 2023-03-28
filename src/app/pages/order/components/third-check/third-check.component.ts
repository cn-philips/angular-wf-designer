import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { decodeString, upLoadFileNew } from '@core/util/tools';
import { HttpService } from '@core/services';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
import { RouterExtendService } from '@app/modern-themes/services/router-extend.service';
@Component({
  selector: "app-thirdcheck",
  templateUrl: "./third-check.component.html",
  styleUrls: ["./third-check.component.scss"],
})
export class ThirdcheckComponent implements OnInit {
  constructor(
    public activatedRouter: ActivatedRoute,
    private router: Router,
    private message: NzMessageService,
    private fb: FormBuilder,
    private http: HttpService,
    private routerExtend: RouterExtendService
  ) {}
  validateForm: FormGroup;
  selectVal: any;
  thirdPartyFile: any;
  thirdPartyFileName: any;
  fileFileList: any = [];
  thirdPartyList: any = [];
  load: any = false;
  ngOnInit() {
    this.validateForm = this.fb.group({
      selectVal: new FormControl({ value: "" }, Validators.required),
    });
    this.getBase();
    this.getEntryModeList();
  }
  getBase() {
    let url = `/act/preparation/getThirdPartAudit`;
    let mainId = decodeString(this.activatedRouter.queryParams["_value"].id);
    const param = {
      mainId: mainId,
    };
    this.http.post(url, param).subscribe((res) => {
      if (res.code === "0000") {
        const { subProStatusThird, thirdPartyFile, thirdPartyFileName } =
          res.data;
        subProStatusThird && (this.selectVal = subProStatusThird);
        if (thirdPartyFile) {
          this.thirdPartyFile = thirdPartyFile;
          this.thirdPartyFileName = thirdPartyFileName;
          this.viewData(
            this.thirdPartyFile,
            "fileFileList",
            this.thirdPartyFileName
          );
        }
      }
    });
  }
  public fileBeforeUpload = (file: UploadFile): boolean => {
    this.load = true;
    const upLoadFileNews = upLoadFileNew.bind(this);
    upLoadFileNews(file).then((vals) => {
      let fileList = [];
      this.load = false;
      this.fileFileList = vals.fileList;
      this.thirdPartyFile = vals.fileId;
    });
    return false;
  };
  /**
   * data 回显数据  fileList回显数组
   */
  viewData(data, fileList, names) {
    const bidWinningNotice = data;
    if (
      bidWinningNotice != "" &&
      bidWinningNotice != undefined &&
      bidWinningNotice != null
    ) {
      this[fileList] = [];
      let obj = { uid: "", name: "", fileId: "" };
      obj.uid = data;
      obj.fileId = data;
      obj.name = names ? names : "文件下载";
      this[fileList].push(obj);
    }
  }
  nzRemoveFile = (file: UploadFile): any => {
    this.thirdPartyFile = "";
    return true;
  };
  // 上传文件下载
  public dwonLoad = (file: UploadFile): void => {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf("#");
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${file.fileId}`;
    window.open(url, "_blank");
  };
  public checkFormData = () => {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    return this.validateForm.valid;
  };
  submit() {
    let mainId = decodeString(this.activatedRouter.queryParams["_value"].id);
    let url = `/act/preparation/thirdPartAudit`;
    const param = {
      mainId: mainId,
      subProStatusThird: this.selectVal,
      thirdPartyFile: this.thirdPartyFile,
    };
    const valid = this.checkFormData();
    if (!valid) {
      return;
    }
    this.load = true;
    this.http.post(url, param).subscribe((res) => {
      if (res.code == "200") {
        this.message.create("success", res.msg);
        this.load = false;
        // this.getBase()
        // this.router.navigate(["/ecos/third-supplement"]);
        window.history.back();
      } else {
        this.message.create("error", res.msg);
      }
    });
  }
  public getEntryModeList() {
    const params = {
      dictGroup: "thirdVerificationSelect",
    };
    this.http
      .get(`/act/ecom/dictData/queryDrop?dictGroup=${params.dictGroup}`)
      .subscribe((rest) => {
        if (rest.code === "0000") {
          this.thirdPartyList = rest.data;
        } else {
          this.message.create("error", `${rest.msg}`);
        }
      });
  }
  // 文件下载
  public fileDwon(id) {
    const urlPath = window.document.location.href;
    const docPath = window.document.location.pathname;
    const index = urlPath.indexOf("#");
    const serverPath = urlPath.substring(0, index);
    const url = `${serverPath}act/system/download/${id}`;
    window.open(url, "_blank");
  }
}
