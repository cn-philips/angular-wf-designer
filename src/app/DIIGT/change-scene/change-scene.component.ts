import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder,FormControl,FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NzMessageService} from 'ng-zorro-antd';
import { decodeString, codeString, formatDatesNow } from '../../../assets/js/tools';
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
    public activatedRouter: ActivatedRoute
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
      status:new FormControl({ value:false})
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
          this.message.create('success', `操作成功`);
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
        this.message.create('success', `Success!`);
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
        this.message.create('success', `Success!`);
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
        this.message.create('success', `Success!`);
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
        this.message.create('success', `移除成功`);
        this.refreshTable();
      } else {
        this.toastrService.error(rest.msg);
      }
    });
  };
  addScene()
  {
    this.modalAttribute.title = '新建配置';
    this.modalAttribute.isVisible = true;
    this.modalAttribute.modalForm.reset();
  }
  editScene(item)
  {
    this.modalAttribute.title = '编辑配置';
    this.modalAttribute.isVisible = true;
    (item.approver.constructor===String)&&(item.approver=item.approver.split(","));
    const {id,orderChange,describes,approver,status}=item;
    this.modalAttribute.modalForm.reset();
    this.modalAttribute.modalForm.setValue({
      id,
      orderChange,
      describes,
      approver,
      status,
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
    const {id,status,orderChange,describes,approver}=obj;
    const saveData = {id,status,orderChange,describes,approver};
    this.http.post(`act/ecom/order/application/saveAndSubmit`,saveData).subscribe((rest => {
      if (rest.code === '0000') {
        this.message.create('success', `操作成功`);
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

}
