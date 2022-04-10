import {Component, OnInit} from '@angular/core';
import {Role, Groups} from '../../domian/roleInfo';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Group} from '../../domian/groupInfo';
import {HttpService} from '../../services';
import {NzMessageService} from 'ng-zorro-antd';
import {ToastrService} from 'ngx-toastr';

class ModalAttribute {
  modalForm: FormGroup;
  isVisible: boolean = false;
  title: string = '';
  modalListOfGroup: { text: string, value: Group }[];

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
  selector: 'app-group-management',
  templateUrl: './group-management.component.html',
  styleUrls: ['./group-management.component.scss']
})
export class GroupManagementComponents implements OnInit {

  modalAttribute: ModalAttribute;
  listOfData: any[] = [];
  filterData: any[] = [];
  queryParams: QueryParams;
  roleList: any[] = [];
  listOfSelectedValue: Role[] = [];
  listOfOption: Array<{ label: string; value: Role }> = [];

  constructor(private http: HttpService, private toastrService: ToastrService, private fb: FormBuilder, private nzMessageService: NzMessageService) {

    this.queryAllUserGroups();

    this.initModalAttribute();

    this.queryParams = {
      loading: false,
      queryForm: this.fb.group({
        code: [],
        name: [],
        roleList: []
      }),
    };

  }

  // ngOnInit(): void {}

  queryAllUserGroups() {
    this.http.get(`/act/group/list`).subscribe(res => {
      if (res.code == '0000') {
        this.listOfData = [...res.data];
        this.filterData = [...res.data];
      } else {
        this.nzMessageService.error('加载数据失败！');
      }
    });
  }

  getNameList(item) {
    return item['roleList'] || [];
  }

  refreshTable = () => {
    this.queryAllUserGroups();
  };

  initModalAttribute = () => {
    this.modalAttribute = new ModalAttribute();
    this.modalAttribute.modalForm = this.fb.group({
      id: [null],
      code: [null, [Validators.required]],
      name: [null, [Validators.required]],
      roleList: [null]
    });
    this.modalAttribute.modalOk = () => {
      const checkFormData = () => {
        for (const i in this.modalAttribute.modalForm.controls) {
          this.modalAttribute.modalForm.controls[i].markAsDirty();
          this.modalAttribute.modalForm.controls[i].updateValueAndValidity();
        }
        const valid = this.modalAttribute.modalForm.valid;
        console.log('--------------->', valid);
        return valid;
      };
      if (!checkFormData()) {
        return;
      }      
      const {id, code, name, roleList} = this.modalAttribute.modalForm.getRawValue();
      
      const saveData = {
        id,
        code,
        name,
        roleList
      };
      this.http.post(`/act/group/save`, saveData).subscribe(rest => {
        if (rest.code === '0000') {
          this.toastrService.success('保存成功！');
          this.modalAttribute.isVisible = false;
          this.refreshTable();
        } else {
          this.toastrService.error('保存失败！');
        }
      });
    };
  };

  editGroups = (groups: Groups) => {
    this.modalAttribute.title = '角色组编辑';
    this.modalAttribute.isVisible = true;
    const {code, id, name, roleList} = groups;
    this.modalAttribute.modalForm.reset();
    this.modalAttribute.modalForm.setValue({
      id,
      code,
      name,
      roleList
    });

    this.listOfSelectedValue = [...roleList];
    this.listOfOption = this.listOfSelectedValue.map(item => {
      return {
        label: item.name,
        value: item
      };
    });

  };

  removeGroups = (groups: Groups) => {
    this.http.delete(`act/group/remove/${groups.id}`).subscribe(rest => {
      if (rest.code === '0000') {
        this.toastrService.success('移除成功！');
        this.refreshTable();
      } else {
        this.toastrService.error(rest.msg);
      }
    });
  };

  addGroups = () => {
    this.modalAttribute.title = '新增人员';
    this.modalAttribute.isVisible = true;
    this.modalAttribute.modalForm.reset();
  };

  queryForm = () => {
    let queryData = this.queryParams.queryForm.getRawValue();
    let queryCode = queryData.code;
    let queryName = queryData.name;

    if ((queryCode == null || queryCode == '') && (queryName == null || queryName == '')) {
      this.refreshTable();
    }

    const code = this.queryParams.queryForm.getRawValue().code;
    const name = this.queryParams.queryForm.getRawValue().name;

    console.log(code);
    console.log(name);
    console.log(this.listOfData);

    // filter our data
    const filterFormData = this.filterData.filter(function (d) {
      return d.code.indexOf(code) !== -1 || !code;
    }).filter(function (d) {
      return d.name.indexOf(name) !== -1 || !name;
    });

    console.log(filterFormData);

    // update the rows
    this.listOfData = [...filterFormData];

  };

  resetQueryForm = () => {
    this.queryParams.queryForm.reset();
    this.refreshTable();
  };

  modalSearchRole = (keyword) => {
    keyword && this.http.get(`/act/role/queryRoleByKeyword/${keyword}`).subscribe(rest => {
      if (rest.code === '0000') {
        let options: any = {};
        rest.data.forEach(item => {
          options[item.id] = item;
        });
        this.listOfSelectedValue.forEach(item => {
          options[item.id] = item;
        });
        let selectOptions = [];
        for (let key in options) {
          const value = options[key];
          selectOptions.push({
            label: value.name,
            value
          });
        }
        this.listOfOption = [...selectOptions];
      }
    });
    if (!keyword) {
      this.listOfOption = this.listOfSelectedValue.map(item => {
        return {
          label: item.name,
          value: item
        };
      });
    }
  };

  ngOnInit(): void {

  }

}
