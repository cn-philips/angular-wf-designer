import {Component, OnInit} from '@angular/core';
import {FileService, HttpService} from '../services';
import {ImportFiles} from '../domian/fileUpload';
import {ToastrService} from 'ngx-toastr';






@Component({
  selector: 'admin-tools',
  templateUrl: './admintools.component.html',
  styleUrls:['./admintools.component.scss'],
  providers:[]
})
export class AdmintoolsComponent implements OnInit {

  uploadUserAndRoles: ImportFiles;
  uploadDimensionTree: ImportFiles;
  uploadProcessTemplate: ImportFiles;


  ngOnInit(): void {

  }

  constructor(private http: HttpService,
              private fileService: FileService,
              private msg: ToastrService) {
    this.uploadUserAndRoles = new ImportFiles(fileService, msg, '/act/importUser', 1, '请选择用户角色上传');
    this.uploadDimensionTree = new ImportFiles(fileService, msg, '/act/dimension/importDimension', 1, '请选择维度树上传');
    this.uploadProcessTemplate = new ImportFiles(fileService,msg,'/act/importBPMN/candidate',1,'请选择流程模板上传')
  }


}
