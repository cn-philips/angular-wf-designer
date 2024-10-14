import { Component, OnInit, ViewChild } from '@angular/core';
import { FileService, HttpService, ServesiceService } from '@core/services';
import { FormBuilder } from '@angular/forms';
import { UploadXHRArgs, NzMessageService } from 'ng-zorro-antd';
import { saveAs } from 'file-saver';

interface CommonResponse {
  code: string;
  data: any;
  msg: string
}

@Component({
  selector: 'register-ICF',
  templateUrl: './register-ICF.component.html',
  styleUrls: ['./register-ICF.component.scss']
})
export class RegisterICFComponent implements OnInit {
  //登记ICF
  @ViewChild('table') table;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private fileService: FileService,
    private message: NzMessageService,
    private servesiceService: ServesiceService
  ) {
  }

  public total = 0;
  public loading = true;
  public load = false
  public tableData = [];
  public isHandle = 0;
  public type = 'third'; // 待登记ICF

  formValues = this.fb.group({
    so: null,
    status: 'picked',
    hasRegistered: 0 //是否登记 true-已登记 false未登记
  })

  public pageParams = {
    pageNo: 1,
    pageSize: 10,
  };

  public registerList = [
    {label: '已抽取', value: 'picked'},
    {label: '未抽取', value: 'unpicked'},
    {label: '全部', value: ''},
  ]

  updateParams() {
    this.pageParams = {
      pageNo: 1,
      pageSize: 10,
    };
    this.getTableData();
    this.table.resetPage();
  }

  // 清空表单选项
  resetForm() {
    this.formValues.reset();
    this.formValues.patchValue({
      ...this.formValues.value,
      status: 'picked',
    })
    this.updateParams()
  }

  updateDataList(pagination: any) {
    if (pagination.reload) {
      this.pageParams = {
        pageNo: 1,
        pageSize: 10,
      };
    }
    this.pageParams['pageNo'] = pagination.pageNo;
    this.pageParams['pageSize'] = pagination.pageSize;
    this.getTableData();
  }

  getLoading(loading: boolean) {
    this.loading = loading;
  }

  ngOnInit() {
    this.getTableData();
  }

  getTableData() {
    this.loading = true;
    this.formValues.patchValue({
      ...this.formValues.value,
      hasRegistered: this.isHandle ? true : false,
      orderByClause: 'createTime desc',
    })

    const params = {
      ...this.formValues.value,
      ...this.pageParams
    }

    this.http.post(`/act/ecos/thirdParty/icf`, params).subscribe((rest => {
      if (rest.code === '0000') {
        this.tableData = rest.data.rows;
        this.total = rest.data.total;
        this.loading = false;
      } else {
        this.message.create('error', `${rest.msg}`);
        this.servesiceService.myFormLoad.emit(false);
      }
    }), (error => {
      this.loading = false;
      this.servesiceService.myFormLoad.emit(false);
      this.message.create("error", "服务器异常")
    }));
  }

  onBeforeUpload = (file) => {
    let type = file.name.split('.').pop();
    if ('xlsx' === type) {
      return true
    }
    this.message.create('warning', `请上传.xlsx格式文件！`);
    return false;
  };

  uploadFile(data) {
    const uri = "/act/ecos/thirdParty/icf/import";
    return this.http.posts(uri, data);
  }

  onUploadFile = (item: UploadXHRArgs) => {
    const formData = new FormData();
    const file = item.file as any;
    formData.append("file", file);

    return this.uploadFile(formData).subscribe(
      (response: CommonResponse) => {
        const { data, code, msg } = response;
        if ("0000" === code) {
          item.onSuccess({ fileId: data }, file, response)
          this.message.create('success', `导入成功！`);
          this.getTableData();
        } else {
          item.onError({}, file);
          this.message.create('error', `${msg}`);
        }
      },
      (err) => {
        this.message.create('error', `${err}`);
        item.onError!(err, item.file!);
      }
    );
  };

  exportFile() {
    this.load = true;
    this.formValues.patchValue({
      ...this.formValues.value,
      hasRegistered: this.isHandle ? true : false,
    })

    const params = {
      ...this.formValues.value,
    }

    this.http.postDownload(`/act/ecos/thirdParty/icf/export`, params).subscribe(
      (rest) => {
        this.fileService.downloadResponse("ICF-", rest);
        this.load = false;
      },
      (error) => {
        this.message.create("error", "请求错误");
        this.load = false;
      }
    );
  }

}
