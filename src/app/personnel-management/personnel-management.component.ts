import {Component, OnInit} from '@angular/core';
import {Personals} from '../domian/roleInfo';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpService} from '../services';
import {NzMessageService} from 'ng-zorro-antd';
import {ToastrService} from 'ngx-toastr';

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

class QueryParams {
  loading: boolean;
  queryForm: FormGroup;
}

@Component({
  selector: 'app-personnel-management',
  templateUrl: './personnel-management.component.html',
  styleUrls: ['./personnel-management.component.scss']
})

export class PersonnelManagementComponent implements OnInit {
  modalAttribute: ModalAttribute;
  listOfData: any[] = [];
  filterData: any[] = [];
  queryParams: QueryParams;

  constructor(private http: HttpService, private toastrService: ToastrService, private fb: FormBuilder, private nzMessageService: NzMessageService) {

    this.queryAllUsers();

    this.initModalAttribute();

    this.queryParams = {
      loading: false,
      queryForm: this.fb.group({
        code: [],
        name: [],
        email: [],
        sapCode: []
      }),
    };

  }

  queryAllUsers() {
    this.http.get(`/act/queryAllUser`).subscribe(res => {
      if (res.code == '0000') {
        console.log('queryAllUsers', res.data);
        this.listOfData = [...res.data];
        this.filterData = [...res.data];
      } else {
        this.nzMessageService.error('加载数据失败！');
      }
    });
  }

  ngOnInit(): void {
  }

  initModalAttribute = () => {
    this.modalAttribute = new ModalAttribute();
    this.modalAttribute.modalForm = this.fb.group({
      id: [null],
      code: [null, [Validators.required]],
      name: [null, [Validators.required]],
      email: [null, [Validators.required]],
      phone: [null],
      sapCode: [null],
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
      const {code, name, email, phone, id, sapCode} = this.modalAttribute.modalForm.getRawValue();
      console.log(this.modalAttribute.modalForm.getRawValue());
      const saveData = {
        id,
        code,
        name,
        email,
        phone,
        sapCode
      };
      this.http.post(`/act/saveUser`, saveData).subscribe(rest => {
        if (rest.code === '0000') {
          this.toastrService.success('保存成功！');
          this.modalAttribute.isVisible = false;
          this.refreshTable();
        } else {
          this.toastrService.error(rest.msg);
        }
      });

    };
  };

  editPersonals = (personal: Personals) => {
    this.modalAttribute.title = '人员编辑';
    this.modalAttribute.isVisible = true;
    const {code, id, name, email, phone, sapCode} = personal;
    this.modalAttribute.modalForm.reset();
    this.modalAttribute.modalForm.setValue({
      id,
      code,
      name,
      phone: personal.phone || '',
      email,
      sapCode: personal.sapCode || ''
    });
    // if (personal.phone == undefined) {
    //   this.modalAttribute.modalForm.setValue({
    //     id,
    //     code,
    //     name,
    //     phone: '',
    //     email
    //   });
    // } else {
    //   this.modalAttribute.modalForm.setValue({
    //     id,
    //     code,
    //     name,
    //     email,
    //     phone
    //   });
    // }
  };

  disabledPersonals = (personal: Personals) => {
    this.http.get(`/act/disableUser/${personal.id}`).subscribe(rest => {
      if (rest.code === '0000') {
        this.toastrService.success('操作成功！');
        this.refreshTable();
      } else {
        this.toastrService.error(rest.msg);
      }
    });
  };

  enablePersonals = (personal: Personals) => {
    this.http.get(`/act/enableUser/${personal.id}`).subscribe(rest => {
      if (rest.code === '0000') {
        this.toastrService.success('操作成功！');
        this.refreshTable();
      } else {
        this.toastrService.error(rest.msg);
      }
    });
  };

  refreshTable = () => {
    this.queryAllUsers();
  };

  addPersonal = () => {
    this.modalAttribute.title = '新增人员';
    this.modalAttribute.isVisible = true;
    this.modalAttribute.modalForm.reset();
  };
  
  //server-paging in this table
  fetch(cb) {
    this.http.get(`/act/queryAllUser`).subscribe(res => {
      if (res.code == '0000') {
        const data = res.data;
        cb(data);
      }        
    });
  }
  
  updateRowList() {
    this.fetch((data) => {
      // console.log(data);
      this.listOfData = [...data];
    });
  }

  queryForm = () => {

    let queryData = this.queryParams.queryForm.getRawValue();
    let queryCode = queryData.code;
    let queryName = queryData.name;
    let queryEmail = queryData.email;
    let querySapCode = queryData.sapCode;

    if ((queryCode == null || queryCode == '') && (queryName == null || queryName == '') && (queryEmail == null || queryEmail == '') && (querySapCode == null || querySapCode == '')) {
      this.refreshTable();
    }

    let code = this.queryParams.queryForm.getRawValue().code;
    let name = this.queryParams.queryForm.getRawValue().name;
    let email = this.queryParams.queryForm.getRawValue().email;
    let sapCode = this.queryParams.queryForm.getRawValue().sapCode;

    code = code ? code.toLocaleLowerCase().trim() : null;
    name = name ? name.toLocaleLowerCase().trim() : null;
    email = email ? email.toLocaleLowerCase().trim() : null;
    sapCode = sapCode ? sapCode.toLocaleLowerCase().trim() : null;
    
    console.log('before filter', this.filterData);
    const filterFormData = this.filterData.filter(function (d) {
      return d.code.toLocaleLowerCase().indexOf(code) !== -1 || !code;
    }).filter(function (d) {
      return d.name.toLocaleLowerCase().indexOf(name) !== -1 || !name;
    }).filter(function (d) {
      return d.email.toLocaleLowerCase().indexOf(email) !== -1 || !email;
    }).filter(function (d) {
      return d.sapCode && d.sapCode.toLowerCase().indexOf(sapCode) !== -1 || !sapCode;
    });

    console.log(filterFormData);

    // update the rows
    this.listOfData = filterFormData;

  };

  resetQueryForm = () => {
    this.queryParams.queryForm.reset();
    this.refreshTable();
  };

}
