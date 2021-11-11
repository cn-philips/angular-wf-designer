import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {DatatableComponent} from '@swimlane/ngx-datatable';
import {AppService} from '../app.service';
import {HttpClient} from '@angular/common/http';
import {FileService, HttpService, NgxDatatableService} from '../services';
import {PlatformLocation} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {saveAs} from 'file-saver';

@Component({
  selector: 'template-maintenance',
  templateUrl: './template-maintenance.component.html',
  styleUrls: [
    './template-maintenance.component.scss'
  ],
  encapsulation: ViewEncapsulation.None
})
export class TemplateMaintenanceComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  isContent: boolean = false;
  selectTemplate: {
    name?: string;
    title?: string;
    fileContent?: string;
    fileType?: string;
    id?: number;
  } = {};
  currentFileUpload: File;
  loadingIndicator = true;
  temp = [];
  rows = [];
  selected = [];
  mblxSelected: string = '';
  comment: string = '';
  baseBackPath = '';
  mainFunctionUrl = '';
  hasStatus = false;
  //set the table column and cell style according to your requirement
  getCellClass = this.ngxDatatableService.getCellClass;
  getHeaderClass = this.ngxDatatableService.getHeaderClass;

  constructor(private appService: AppService,
              private http: HttpService,
              private httpClient: HttpClient,
              private platformLocation: PlatformLocation,
              private ngxDatatableService: NgxDatatableService,
              private aRoute: ActivatedRoute,
              private toastrService: ToastrService,
              private fileService: FileService) {
    this.aRoute.queryParams.subscribe(params => {
      this.mainFunctionUrl = '/act' + params.url;
      this.mblxSelected = this.mainFunctionUrl.split('/').pop();
      this.updateRowList();
    });
    this.updateRowList();
    this.baseBackPath = (this.platformLocation as any).location.origin + '/act';
  }

  updateRowList() {
    this.fetch((data) => {
      this.temp = [...data];
      this.rows = data;
      setTimeout(() => {
        this.loadingIndicator = false;
      }, 1500);
    });
  }

  fetch(cb) {
    this.http.get(this.mainFunctionUrl).subscribe(res => {
      // console.log(res);
      if ('0000' == res.code) {
        const data = res.data == null ? [] : res.data;
        cb(data);
      }
    });
  }

  onSelect({selected}) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  ngOnInit() {
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.temp.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });

    // update the rows
    this.rows = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  selectFile(event) {
    this.currentFileUpload = event.target.files[0];
  }

  uploadTMTemplateFile() {
    const type = this.mblxSelected;
    if (this.isContent) {
      const {name} = this.selectTemplate;
      if (!name) {
        this.toastrService.error('模板名称不能为空');
      }
      const template = {
        ...this.selectTemplate,
        fileType: 'CONTENT',
        comment: this.comment,
        type
      };
      this.pushTemplateContentToDb(template);
    } else {
      if (this.currentFileUpload == null) {
        this.toastrService.warning('请选择上传文件');
        return;
      }
      this.pushTemplateFileToStorage(this.currentFileUpload, type, this.comment);
      this.currentFileUpload = undefined;
      this.comment = '';
      (<HTMLInputElement>document.getElementById('tm-upload-input')).value = '';
    }
  }

  pushTemplateContentToDb(template: any) {
    this.http.post('/act/template/save', template).subscribe(res => {
      if ('0000' == res.code) {
        this.toastrService.success('保存成功！');
        this.updateRowList();
        this.selectTemplate = {};
        this.comment = "";
      } else {
        this.toastrService.error(res.msg);
      }
    });
  }


  pushTemplateFileToStorage(file: File, type: string, comment: string): void {
    this.fileService.uploadFile(`/act/template/upload/${type == 'mail' ? 'CONTENT' : 'REFERENCE'}`, {
        file,
        location: type,
        comment,
        owner: localStorage.getItem('ng_philips_code1')
      },
      res => {
        this.toastrService.success('上传成功');
        this.updateRowList();
      },
      res => {
        this.toastrService.error(res.msg);
      }
    );
  }

  delTemplate(event) {
    const url = '/act/template/delete';
    const data = event;
    this.http.post(url, data).subscribe(res => {
      if ('0000' == res.code) {
        this.toastrService.success('删除成功');
        this.updateRowList();
      } else {
        this.toastrService.error(res.msg);
      }
    });
  }

  editTemplateContent(data) {
    this.selectTemplate = data;
    this.isContent = true;
    this.comment = data.comment;
    this.http.get(`/act/template/content/${data.id}`).subscribe(res => {
      if (res.code === '0000') {
        this.selectTemplate.fileContent = res.data;
      } else {
        this.toastrService.error(res.msg);
      }
    });
  }

  downloadFile({id, name}) {
    let uri = '/act/template/download/' + id;
    this.http.get(uri).subscribe(res => {
      if (res.code === '0000') {
        let arr = this.fileService.base64ToArrayBuffer(res.data);
        let blob = new Blob([arr]);
        saveAs(blob, name);
      } else {
        this.toastrService.error(res.msg);
      }
    });
  }
}
