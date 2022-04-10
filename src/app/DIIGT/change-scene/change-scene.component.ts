import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder,FormControl,FormGroup, Validators } from '@angular/forms';
import {FileService, HttpService} from '../../services';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import {NzMessageService, UploadFile} from 'ng-zorro-antd';
import {decodeString, codeString, formatDatesNow, getType} from '../../../assets/js/tools';
import {TimeFormatePipeNow} from '../../pipes/tiem-formatenow.pipe';
class QueryParams {
  loading: boolean;
  total: number;
  pageNo: number;
  pageSize: number;
  queryForm: FormGroup;
}
class ModalAttribute {
  modalForm: FormGroup;
  isVisible: boolean = false;
  title: string = '';
  modalCancel: () => void = () => {
    this.isVisible = false;
  };
  modalOk: () => void = () => {
  };
}
@Component({
  selector: 'app-change-scene',
  templateUrl: './change-scene.component.html',
  styleUrls: ['./change-scene.component.scss']
})

export class ChangeSceneComponent implements OnInit {
  constructor(
    private nzMessageService: NzMessageService,
    private http: HttpService,
    private toastrService: ToastrService,
    private router: Router,
    private modalService: NgbModal,
    private aRoute: ActivatedRoute,
    private message: NzMessageService,
    private fb: FormBuilder,
    public activatedRouter: ActivatedRoute,
    public fileservice:FileService
    ){
    this.getRoleList()
    this.queryParams = {
      loading: false,
      total: 0,
      pageNo: 1,
      pageSize:10,
      queryForm: this.fb.group({
        roleCode: [],
        roleName: [],
        describe: []
      }),
    };
      this.initModalAttribute();
      this.refreshTable()
     }
  public activedId: any = 'complete-tab';
  queryParams:QueryParams;
  modalAttribute:ModalAttribute;
  syncCPLoading: boolean = false;
  syncCDLoading: boolean = false;
  syncOELoading: boolean = false;

  listData:any=[]
  load:any=false;
  roleList:Array<{id:string,roleName:string}>[];

  /*项目所有人变更逻辑*/

  // 短期角色代理
  public paramsShort = {
    pageNo: 1,
    pageSize: 10,
    total: 0
  };
  public tabListShort = {
  };
  public loadingShort = false;

  public subDateOnwer = [];

  // 项目所有人变更
  public paramsOnwer = {
    pageNo: 1,
    pageSize: 10,
    total: 0
  };
  public loadingOnwer = false;

  public radioValue = 'NMPA'; //默认导入文件按钮
  public fileNmpaList: any = [];//存放导入文件

  public nmpaDownloadStatus = 'download';
  public MBnmpaDownloadStatus = 'download';
  public RedFlagDownloadStatus = 'download';
  public ChapterDownloadStatus = 'download';
  public IePoolDownloadStatus = 'download';

  ngOnInit() {
    this.getTabListShortData();
    const activedId = this.activatedRouter.queryParams['_value'].activedId;
    if (activedId != null && activedId !== '' && activedId != undefined) {
      this.activedId = activedId;
      console.log(this.activedId);
    }
  }
  public tabclick(val) {
    this.activedId = val.nextId;
  }
  initModalAttribute = () => {
    this.modalAttribute = new ModalAttribute();
    this.modalAttribute.modalForm = this.fb.group({
      id: [null],
      orderChange: [null, [Validators.required]],
      describes:[null, [Validators.required]],
      approver:[null, [Validators.required]],
      status:new FormControl({ value:false}),
      changeDealForm:['0'],
    });

    this.modalAttribute.modalOk = () => {
      const checkFormData = () => {
        for (const i in this.modalAttribute.modalForm.controls) {
          this.modalAttribute.modalForm.controls[i].markAsDirty();
          this.modalAttribute.modalForm.controls[i].updateValueAndValidity();
        }
        return this.modalAttribute.modalForm.valid;
      };
      if (!checkFormData()) {
        return;
      }
      //const { id, roleCode, describe, roleName } = this.modalAttribute.modalForm.getRawValue();
      const obj=this.modalAttribute.modalForm.getRawValue();
      obj.status=obj.status==true?1:0;
      obj.approver=obj.approver.join(",");
      const saveData = obj;
      this.http.post(`act/ecom/order/application/saveAndSubmit`, saveData).subscribe(rest => {
        if (rest.code === '0000') {
          this.message.create('success', rest.msg);
          this.modalAttribute.isVisible = false;
          this.refreshTable();
        } else {
          this.message.create('error',rest.msg);
        }
      });
    };
  };
  getRoleList()
  {
    let url=`/act/role/getRole`;
    this.http.post(url, {
      pageSize:1000,
      pageNo:1,
    }).subscribe(vals=>{
      let rows=vals.data.rows;
      rows=rows.filter(val=>
        {
         if(val.roleCode!='Sales Rep/Mgr'&&val.roleCode!='SYSTEMADMIN'&&val.roleCode!='Admin')
         {
            return val;
         }
        })
      this.roleList=rows;
    })
  }
  syncCPData() {
    this.syncCPLoading = true;
    this.http.get(`/act/sync/cp`).subscribe(rest => {
      if (rest.code === '0000') {
        this.syncCPLoading = false;
        this.message.create('success', rest.msg);
      } else {
        this.syncCPLoading = false;
        this.message.create('error', `Failure, ${rest.msg}`);
      }
    });
  }

  syncCDData () {
    this.syncCDLoading = true;
    this.http.get(`/act/sync/cd`).subscribe(rest => {
      if (rest.code === '0000') {
        this.syncCDLoading = false;
        this.message.create('success', rest.msg);
      } else {
        this.syncCDLoading = false;
        this.message.create('error', `Failure, ${rest.msg}`);
      }
    });
  }

  syncOEData () {
    this.syncOELoading = true;
    this.http.get(`/act/sync/oe`).subscribe(rest => {
      if (rest.code === '0000') {
        this.syncOELoading = false;
        this.message.create('success', rest.msg);
      } else {
        this.syncOELoading = false;
        this.message.create('error', `Failure, ${rest.msg}`);
      }
    });
  }
  removeOrder= (item) => {
    let url=`/act/ecom/order/application/deleteOrderChange?id=${item.id}`;
    this.http.delete(url).subscribe(rest => {
      if (rest.code === '0000') {
        this.message.create('success', rest.msg);
        this.refreshTable();
      } else {
        this.toastrService.error(rest.msg);
      }
    });
  };
  addScene()
  {
    this.modalAttribute.title = 'New Config 新建配置';
    this.modalAttribute.isVisible = true;
    this.modalAttribute.modalForm.reset();
    let changeDealForm="0";
    this.modalAttribute.modalForm.setValue({
      id:"",
      orderChange:"",
      describes:"",
      approver:[],
      status:false,
      changeDealForm:'0'
    });

  }
  editScene(item)
  {
    this.modalAttribute.title = 'Edit Configuration 编辑配置';
    this.modalAttribute.isVisible = true;
    (item.approver.constructor===String)&&(item.approver=item.approver.split(","));
    const {id,orderChange,describes,approver,status,changeDealForm}=item;
    this.modalAttribute.modalForm.reset();
    this.modalAttribute.modalForm.setValue({
      id,
      orderChange,
      describes,
      approver,
      status,
      changeDealForm:changeDealForm!=null?changeDealForm:'0'
    });
  }
  changeIndex = (pageNo) => {
    this.queryParams.pageNo = pageNo;
    this.refreshTable();
  };

  changeSize = (pageSize) => {
    this.queryParams.pageNo = 1;
    this.queryParams.pageSize = pageSize;
    this.refreshTable();
  };
  refreshTable = () => {
    this.queryParams.loading = true;
    this.http.post('act/ecom/order/application/getOrderChange', {
      pageSize: this.queryParams.pageSize,
      pageNo: this.queryParams.pageNo,
    }).subscribe((rest => {
      if (rest.code === '0000') {
           if(rest.data)
           {
            this.listData=[...rest.data.rows];
            this.queryParams.total=rest.data.total;
           }
      }
      else{
        this.message.create('error', rest.msg);
      }
      this.queryParams.loading = false;
    }),(error)=>{
      this.queryParams.loading=false;
      this.message.create("error","请求异常!");
    });
  };

  clickSwitch=(item)=>
  {
    const obj=item;
    obj.status=obj.status==true?1:0;
    const {id,status,orderChange,describes,approver,changeDealForm}=obj;
    const saveData = {id,status,orderChange,describes,approver,changeDealForm};
    this.http.post(`act/ecom/order/application/saveAndSubmit`,saveData).subscribe((rest => {
      if (rest.code === '0000') {
        this.message.create('success', rest.msg);
        //this.refreshTable();
        this.load=false;
      } else {
        this.message.create("error",rest.msg);
      }
    }),(error)=>{
      this.message.create("error","请求异常");
      this.load=false;
    });
  }

  // 项目所有人变更
  public sub_Onwer() {
    this.getTabListShortData();
  }

  public getTabListShortData() {
    this.loadingOnwer = true;
    const url = '/act/ecom/homepage/getMyEntrust';
    let pardate = {
      startTime: null,
      endTime: null
    };
    if (this.subDateOnwer[0]) {
      pardate.startTime = this.subDateOnwer[0];
    }
    if (this.subDateOnwer[1]) {
      pardate.endTime = this.subDateOnwer[1];
    }
    const par = Object.assign(this.paramsOnwer, pardate);
    this.http.post(url, par).subscribe(res => {
      if (res.data) {
        this.tabListShort = res.data.rows;
        this.paramsOnwer.total = res.data.total;
      }
      this.loadingOnwer = false;
    }, error => {
      this.loadingOnwer = false;
    });
  }
  public changePageIndexOnwer(e) {
    this.paramsOnwer.pageNo = e;
  }
  public changePageSizeOnwer(e) {
    this.paramsOnwer.pageSize = e;
  }
  // 查看跳转
  public toEntrust(id) {
    this.router.navigate(['/changeonwer'], {
      skipLocationChange: false,
      queryParams: {
        id: codeString(id),
        flag: 1
      },
    });
  }


  /**
   * 导出NMPA数据
   * */
  public ExportNMPAData() {
    this.nmpaDownloadStatus = 'loading';
    const url = `/act/sync/export/NMPAdata`;
    this.http.postDownload(url).subscribe(rest => {
      this.fileservice.downloadResponse('NMPA', rest);
      this.nmpaDownloadStatus = 'download';
    });
  }

  /**
   *导入NMPA数据 自定义过滤器 限制导入文件为xlsx xls
   * */
    // tslint:disable-next-line:variable-name
  public ImportNMPAData  = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType !== 'xlsx' && fileType !== 'xls') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '上传数据大小过不超过100M');
      return false;
    }
    let url = '/act/sync/import/NMPAdata';
    this.upload('fileUploadList', file, url);//上传参数
    return false;
  }


  /**
   * 导出MBNMPA数据
   * */
  public ExportMBNMPAData() {
    this.MBnmpaDownloadStatus = 'loading';
    const url = `/act/sync/export/MBNMPAdata`;
    this.http.postDownload(url).subscribe(rest => {
      this.fileservice.downloadResponse('MBNMPA', rest);
      this.MBnmpaDownloadStatus = 'download';
    });
  }


  /**
   *导入MBNMPA数据
   * */
    // tslint:disable-next-line:variable-name
  public ImportMBNMPAData  = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType !== 'xlsx' && fileType !== 'xls') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '上传数据大小过不超过100M');
      return false;
    }
    let url = `/act/sync/import/MBNMPAdata`;
    this.upload('fileUploadList', file, url);//上传参数
    return false;
  }


  /**
   * 导出RedFlag数据
   * */
  public ExportRedFlagData() {
    this.RedFlagDownloadStatus = 'loading';
    const url = `/act/sync/export/redFlagdata`;
    this.http.postDownload(url).subscribe(rest => {
      this.fileservice.downloadResponse('RedFlag', rest);
      this.RedFlagDownloadStatus = 'download';
    });
  }

  /**
   * 导入RedFlag数据
   * */
    // tslint:disable-next-line:variable-name
  public ImportRedFlagData = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType !== 'xlsx' && fileType !== 'xls') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '上传数据大小过不超过100M');
      return false;
    }
    let  url = `/act/sync/import/redFlag`;
    this.upload('fileUploadList', file, url);//上传参数
    return false;
  }

  /**
   * 导出ChapterType数据
   * */
  public ExportChapterTypeData() {
    this.ChapterDownloadStatus = 'loading';
    const url = `/act/sync/export/chapterData`;
    this.http.postDownload(url).subscribe(rest => {
      this.fileservice.downloadResponse('ChapterType', rest);
      this.ChapterDownloadStatus = 'download';
    });
  }

  /**
   * 导入ChapterType数据
   * */
    // tslint:disable-next-line:variable-name
  public ImportChapterTypeData = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType !== 'xlsx' && fileType !== 'xls') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '上传数据大小过不超过100M');
      return false;
    }
    let url = `/act/sync/import/chapterData`;
    this.upload('fileUploadList', file, url);//上传参数
    return false;
  }

  /**
   * 导出IePoolData数据
   * */
  public ExportIePoolData() {
    this.IePoolDownloadStatus = 'loading';
    const url = `/act/ecom/homepage/export/IePoolData`;
    this.http.postDownload(url).subscribe(rest => {
      this.fileservice.downloadResponse('IEPoolData', rest);
      this.IePoolDownloadStatus = 'download';
    });
  }

  /**
   * 导入IePoolData数据
   * */
    // tslint:disable-next-line:variable-name
  public ImportIePoolData = (file: UploadFile): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 100; // 文件大小不超过100M
    const fileType = getType(file);
    if (fileType !== 'xlsx' && fileType !== 'xls') {
      this.message.create('error', '上传文件格式错误!');
      return false;
    }
    if (!isLt2M) {
      this.message.create('error', '上传数据大小过不超过100M');
      return false;
    }
    const url = `/act/sync/import/IePoolData`;
    this.upload('fileUploadList', file, url);//上传参数
    return false;
  }



 /**
  * 基础数据维护公共文件上传
  * **/
  public upload(fileList, file, url) {
    this[fileList] = [];
    let type = getType(file);
    this[fileList].push(file);
    const formData = new FormData();
    this[fileList].forEach((file: any) => {
      formData.append('file', file);
      formData.append('fileType', type);
      formData.append('filename', file.name);
    });
    this.load = true;
    this.http.posts(url, formData).subscribe((res => {
      if (res.code === "0000") {
        this.load = false;//遮罩层取消
        this[fileList][0].fileId = res.data;
        this.message.create("success", res.msg)
      }else if(res.code==="9000"){
        this.load = false;//遮罩层取消
        this[fileList][0].fileId = res.data;
        this.message.create("error",'数据有误，请检查后再导入');
      }
      else {
        this.message.create("error",res.msg);
      }
    }),(error=>{
      this.load = false;
      this[fileList] = [];
      this.message.create('error', '上传失败请重新上传!');
    }));
  }
}

