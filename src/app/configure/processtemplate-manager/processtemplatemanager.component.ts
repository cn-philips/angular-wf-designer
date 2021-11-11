import {Component, OnInit} from '@angular/core';
import {FileService, HttpService} from '../../services';
import {ToastrService} from 'ngx-toastr';
import {ImportFiles} from '../../domian/fileUpload';


class ProcessTemplateManager {
  processTemplateList: any[] = [];
  uploadProcessTemplate: ImportFiles;

  constructor(private http: HttpService,
              private fileService: FileService,
              private toastrService: ToastrService,
              uploadURL: string) {
    this.refreshTable();
    this.uploadProcessTemplate = new ImportFiles(fileService, toastrService, uploadURL, 1, '选择流程模版');
    this.uploadProcessTemplate.successCallBack = this.refreshTable;
  }

  removeLastVersion = (row) => {
    this.http.delete(`/act/model/${row.id}`).subscribe(rest => {
      if (rest.code == '0000') {
        this.toastrService.success('删除成功');
        this.refreshTable();
      } else {
        this.toastrService.error(rest.msg);
      }
    });
  };
  private refreshTable = () => {
    this.http.get(`/act/model/list`).subscribe(rest => {
      if (rest.code == '0000') {
        this.processTemplateList = rest.data;
      }
    });
  };


}


@Component({
  selector: 'processtemplate-manager',
  templateUrl: './processtemplatemanager.component.html',
  styleUrls:['./processtemplatemanager.component.scss']
})
export class ProcesstemplatemanagerComponent implements OnInit {

  processTemplateManager: ProcessTemplateManager = new ProcessTemplateManager(this.http, this.fileService, this.msg, '/act/importBPMN/candidate');

  constructor(private http: HttpService,
              private msg: ToastrService,
              private fileService: FileService) {

  }

  ngOnInit(): void {
  }


}
