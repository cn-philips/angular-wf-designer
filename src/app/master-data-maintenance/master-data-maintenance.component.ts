import { Component, OnInit, ViewEncapsulation, ViewChild, ViewChildren } from '@angular/core';
import {PlatformLocation } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { MdmUploadService } from './mdm-upload.service';
import { AppService } from '../app.service';
import { HttpResponse } from '@angular/common/http';
import { HttpService, NgxDatatableService,FileService } from '../services';
import { Observable } from 'rxjs';
import { trigger } from '@angular/animations';
import { ToastrService } from 'ngx-toastr';
import { saveAs } from 'file-saver';

@Component({
  selector: 'master-data-maintenance',
  templateUrl: './master-data-maintenance.component.html',
  styleUrls: [
    './master-data-maintenance.component.scss'
  ],
  encapsulation: ViewEncapsulation.None
})
export class MasterDataMaintenanceComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('uploadErrorFile') uploadErrorFile; 
  @ViewChildren('filterInputs') filterInputs;

  loadingIndicator = true;
  rows = [];
  rowsBak = [];
  temp = [];
  selected = [];
  columnName = [];
  columnFilterName = [];
  editing = [];
  searchList = [];
  tablename: string = '';
  hasStatus: boolean = false;
  mainFunctionUrl: string;
  ruleFileNotUploaded: boolean = true;
  baseBackUrl = (this.platformLocation as any).location.origin + '/act';
  filterKey: string = 'name';
  currentFileUpload: File;

  constructor(private appService: AppService, 
    private mdmUploadService: MdmUploadService, 
    private http: HttpService,
    private ngxDatatableService: NgxDatatableService,
    private router: Router,
    private aRoute: ActivatedRoute,
    private platformLocation: PlatformLocation,
    public toastrService: ToastrService,
    private fileService: FileService
    ) {
    this.appService.pageTitle = 'Master Data Maintenance';

    this.aRoute.queryParams.subscribe(params=> {
      // console.log(params);
      this.mainFunctionUrl = '/act' + params.url;
      this.tablename = this.mainFunctionUrl.split('/').pop();

      this.updateRowList();
    });
  }

  //set the table column and cell style according to your requirement
  getCellClass = this.ngxDatatableService.getCellClass;
  getHeaderClass = this.ngxDatatableService.getHeaderClass;

  updateRowList() {
    this.fetch((data) => {
      // cache data list
      this.temp = [...data];

      // generate inital complete list
      if(this.temp.length == 0){ 
        //TODO package below condition 
        this.rows = [...data];
        this.columnName = [];
        this.columnFilterName = [];
        this.hasStatus = false;
      } else if(this.temp.length > 0) {
        this.columnName = this.temp[0];
        //check if colums contain 'status' 
        for(let i=0;i<this.columnName.length;i++){
          this.hasStatus = false;
          if(this.columnName[i] == "status"){
            this.hasStatus = true;
            break;
          }
        }
      }

      if(this.temp.length > 1) {
        this.columnFilterName = this.temp[1];
        // console.log(this.columnFilterName == []);
        // console.log(this.columnFilterName.length == 0);
        // console.log("Filter List ->" + this.columnFilterName);
      }

      if(this.temp.length > 2) {
        let obj = new Map<string,string>();
        this.rows = [];
        for(let i=2;i<this.temp.length;i++) {
          let datatemp = '';
          for(let j=0;j<this.columnName.length;j++){
            obj.set(this.columnName[j],this.temp[i][j])
          }
          let temp = obj.keys;

          //convert map<string,string> to json string
          datatemp = JSON.stringify(Array.from(
            obj.entries()
          )
            .reduce((o, [key, value]) => {
              o[key] = value;

              return o;
            }, {}));

          this.rows.push(JSON.parse(datatemp));
        }
        this.rowsBak = [...this.rows];
      }

      //remove 'id' column from table view
      const idx = this.columnName.indexOf('id', 0);
      if (idx > -1) {
        this.columnName.splice(idx, 1);
      }

      //set 'status' column to the last position
      if(this.hasStatus) {
        const statusIdx = this.columnName.indexOf('status',0);
        this.columnName.push(this.columnName.splice(statusIdx, 1)[0]);
      }

      //define filter by ... key
      let hasName = false;
      for(let columnStr of this.columnName) {
        if('name' == columnStr) {
          hasName = true;
          break;
        }
      }
      this.filterKey = hasName ? 'name' : this.columnName[0];

      setTimeout(() => { this.loadingIndicator = false; }, 1500);
    });
  }

  fetch(cb) {
    const uri = this.mainFunctionUrl;
    this.http.get(uri).subscribe(res =>{
    console.log(res);
    if('0000' == res.code) {
      const data = res.data==null?[]:res.data;
      cb(data);
      this.ruleFileNotUploaded = false;
    } if('0016' == res.code){
      cb([]);
      this.ruleFileNotUploaded = true;
    }
  });
  }

  toEditMasterData(colName,val){
    console.log(colName);
    console.log(val);
    const url = "/act/masterdata/query?tableName=" + this.tablename + "&columnName="+ colName + "&data=" + val;   
    this.http.get(url).subscribe(res =>{
      if('0000' == res.code) {
        this.router.navigate(['master-data-maintenance/edit'],{
          queryParams: {
            tablename: this.tablename,
            pks: res.data[0],
            labels: res.data[1],
            values: res.data[2]
          }
        })
      }
    });
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    // filter fixed rows data
    const key = this.filterKey;
    const rowsBak = this.rowsBak.filter(function(d) {
      return d[key].toLowerCase().indexOf(val) !== -1 || !val;
    });

    // update the rows
    this.rows = rowsBak;
    // Whenever the filter changes, always go back to the first page
    if(this.table){
      this.table.offset = 0;
    }
  }

  //dynamic filter function
  updateFilterAll(event) {

    let filterRows = this.rowsBak;
    for(let i=0;i<this.filterInputs.length;i++){
      this.filterInputs.toArray().forEach(el => {
        const currentFiltername = el.nativeElement.getAttribute('filtername');
        const userInput = el.nativeElement.value.toLowerCase();

        filterRows = filterRows.filter(function(d) {
          return d[currentFiltername].toLowerCase().indexOf(userInput) !== -1 || !userInput;
        });
      });
    }

    // update the rows
    this.rows = filterRows;
    // Whenever the filter changes, always go back to the first page
    if(this.table){
      this.table.offset = 0;
    }
  }

  triggerStatus(event) {
    // console.log(this.selected);
    let data = {};
    if(this.selected.length > 0) {
      data["tableName"] = this.tablename;
      data["status"] = event;
      let ids = [];
      // console.log(this.selected[0].id);
      for(let i=0;i<this.selected.length;i++){
        ids.push(this.selected[i].id);
      }
      data["data"] = ids;
      console.log(data);

      let url = "/act/masterdata/updateStatus?"; 
      url += Object.keys(data).map(function(k) {
            return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
          }).join('&');
  
      this.http.get(url).subscribe(res =>{
        if('0000' == res.code) {
          console.log("updateStatus success");
          this.toastrService.success('status更新成功');
          for(let i=0;i<ids.length;i++){
            let idVal = ids[i];
            this.rows.filter(function(d){
              if(d.id == idVal){
                d.status = event;
              }
            });
          }
          this.rows = [...this.rows];
        }
      });
    }
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  updateValue(event, cell, rowIndex) {
    console.log('inline editing rowIndex', rowIndex)
    this.editing[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
    console.log('UPDATED!', this.rows[rowIndex][cell]);
  }

  ngOnInit() {
  }

  selectFile(event) {
    this.currentFileUpload = event.target.files[0];
  }

  selectFile2(event) {
    this.currentFileUpload = event.target.files[0];
  }

  uploadMDMTemplateFile(){
    if(this.currentFileUpload == null) {
      this.toastrService.warning('请选择上传文件');
      return;
    }
    console.log("uploading starts");
    this.mdmUploadService.pushRuleFileToStorage(this.currentFileUpload).subscribe(event => {
      if (event instanceof HttpResponse) {
        console.log("uploading ends");
        const res = JSON.parse(event.body.toString());
        if('0008' == res.code){
          this.toastrService.warning(res.msg);
        } else if('0009'== res.code){
          this.toastrService.success('上传成功');
          this.updateRowList();
        } else {
          this.toastrService.error(res.msg);
          this.updateRowList();
        }
      }
    });
    this.currentFileUpload = undefined;
    (<HTMLInputElement>document.getElementById("mdm-upload-rule-file-input")).value='';
  }

  uploadMDMDataFile(){
    let correctFileName = this.tablename + '.xlsx';
    if(this.currentFileUpload == null) {
      this.toastrService.warning('请选择上传文件');
      return;
    } else if(this.currentFileUpload.name != correctFileName) {
      this.toastrService.warning('请上传 ' + correctFileName + ' 文件');
      return;
    }
    console.log("uploading starts");
    this.mdmUploadService.pushMasterDataFileToStorage(this.currentFileUpload).subscribe(event => {
      if (event instanceof HttpResponse) {
        console.log("uploading ends");
        const res = JSON.parse(event.body.toString());
        console.log(res);
        if('0008' == res.code){
          this.toastrService.warning(res.msg);
        } else if('0009'== res.code){
          this.updateRowList();
          if (this.table) {
            this.table.offset = 0; //go back to the first page
          }
          if(res.data == null) {
            this.toastrService.success('上传成功');
          }else if(res.data != null) {
            this.toastrService.error('上传的数据文件中存在错误，请检查 error.txt');
            // console.log(res.data);
            //download the error info txt file when uploading data
            const errorInfoFileUrl = this.baseBackUrl + res.data;
            // this.uploadErrorFile.nativeElement.href=errorInfoFileUrl;
            // this.uploadErrorFile.nativeElement.click();
            // this.uploadErrorFile.nativeElement.href='';
            let arr = this.fileService.base64ToArrayBuffer(res.data);
            let blob = new Blob([arr]);
            saveAs(blob, 'error.txt');
          }
        }else {
          this.toastrService.error(res.msg, res.code);
        }
      }
    });
    this.currentFileUpload = undefined;
    (<HTMLInputElement>document.getElementById("mdm-upload-data-file-input")).value='';
  }

}
