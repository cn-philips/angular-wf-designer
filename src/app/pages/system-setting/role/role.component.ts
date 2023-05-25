import { Component, OnInit } from '@angular/core';
import { Role, User } from '@core/domain';
import { HttpService } from '@core/services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NzMessageService } from 'ng-zorro-antd';
import { PermissionService } from '@app/modern-themes/services/permission.service';
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
  modalListOfGroup: { text: string, value: number }[];
  selectedUser: any;
  referenceUserList: User[];
  userList: User[];

  modalCancel: () => void = () => {
    this.isVisible = false;
  };
  modalOk: () => void = () => {

  };
  searchUser: (keyword: string) => void = (keyword: string): void => {
  };

  addUser: () => void = () => {
    if (!this.selectedUser) {
      return;
    }
    const selectedUser: User = this.selectedUser.value;
    let exist = false;
    this.referenceUserList.forEach(({ id }) => {
      if (id == selectedUser.id) {
        exist = true;
      }
    });
    if (!exist) {
      this.referenceUserList = [selectedUser, ...this.referenceUserList];
      this.selectedUser = undefined;
      this.userList = [];
    }
  };

  removeUser: (user: User) => void = (user: User) => {
    console.log('remove user:', user);
    this.referenceUserList = this.referenceUserList.filter(({ id }) => {
      return user.id != id;
    });
  };
}
@Component({
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})
export class RoleComponent implements OnInit {
  listOfRole: Role[];
  queryParams: QueryParams;
  listOfGroup: { [key: string]: string };
  modalAttribute: ModalAttribute;
  constructor(private http: HttpService,
    private toastrService: ToastrService,
    private message: NzMessageService,
    private fb: FormBuilder,
    public permission:PermissionService) {
    this.listOfRole = [];
    this.queryParams = {
      loading: false,
      total: 0,
      pageNo: 1,
      pageSize: 10,
      queryForm: this.fb.group({
        roleCode: [],
        roleName: [],
        describe: []
      }),
    };
    this.initModalAttribute();
    this.refreshTable();
  }

  syncCPLoading: boolean = false;
  syncCDLoading: boolean = false;
  syncOELoading: boolean = false;

  ngOnInit() {
  }

  initModalAttribute = () => {
    this.modalAttribute = new ModalAttribute();
    this.modalAttribute.referenceUserList = [];
    this.modalAttribute.modalForm = this.fb.group({
      id: [null],
      roleCode: [null, [Validators.required]],
      roleName: [null, [Validators.required]],
      describe: []
    });
    // this.modalAttribute.searchUser = (keyword) => {
    //   keyword && keyword.length >= 3 && this.http.get(`/act/queryUserByKeyword/${keyword}`).subscribe(rest => {
    //     if (rest.code === '0000') {
    //       this.modalAttribute.userList = rest.data.map(item => {
    //         return {
    //           text: item.name,
    //           value: item,
    //         };
    //       });
    //     }
    //   });
    // };
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
      const { id, roleCode, describe, roleName } = this.modalAttribute.modalForm.getRawValue();
      const userList = this.modalAttribute.referenceUserList;
      const saveData = {
        id,
        roleCode,
        describe,
        roleName,
      };
      console.log('saveData', saveData);
      this.http.post(`/act/role/saveOrUpdate`, saveData).subscribe(rest => {
        if (rest.code === '0000') {
          this.message.create('success', rest.msg);
          this.modalAttribute.isVisible = false;
          this.refreshTable();
        } else {
          this.toastrService.error(rest.msg);
        }
      });

    };
  };

  // getRefUserListByRoleId = (data: Role) => {
  //   this.http.get(`/act/listRefUsers/${data.roleCode}`).subscribe(rest => {
  //     if (rest.code === '0000') {
  //       this.modalAttribute.referenceUserList = [...rest.data];
  //     }
  //   });
  // };

  // searchGroup = (keyword) => {
  //   keyword && this.http.get(`/act/group/queryByKeyword/${keyword}`).subscribe(rest => {
  //     if (rest.code === '0000') {
  //       this.listOfGroup = rest.data.map(item => {
  //         return {
  //           text: item.name,
  //           value: item.id,
  //         };
  //       });
  //     }
  //   });
  // };

  // modalSearchGroup = (keyword) => {
  //   keyword && this.http.get(`/act/group/queryByKeyword/${keyword}`).subscribe(rest => {
  //     console.log(rest);
  //     if (rest.code === '0000') {
  //       this.modalAttribute.modalListOfGroup = rest.data.map(item => {
  //         return {
  //           text: item.name,
  //           value: item.id,
  //         };
  //       });
  //     }
  //   });
  // };

  queryForm = () => {
    this.queryParams.pageNo = 1;
    this.refreshTable();
  };

  refreshTable = () => {
    this.queryParams.loading = true;
    let getCode = this.queryParams.queryForm.getRawValue();
    console.log(getCode)
    this.http.post('/act/role/getRole', {
      pageSize: this.queryParams.pageSize,
      pageNo: this.queryParams.pageNo,
      ...this.queryParams.queryForm.getRawValue()
    }).subscribe(rest => {
      if (rest.code === '0000') {
        if (rest.data) {
          const { total, rows } = rest.data;
          this.listOfRole = rows
          this.queryParams.total = total;
        }
      }
      this.queryParams.loading = false;
    });
  };

  resetQueryForm = () => {
    this.queryParams.queryForm.reset();
    this.refreshTable();
  };

  changeIndex = (pageNo) => {
    this.queryParams.pageNo = pageNo;
    this.refreshTable();
  };

  changeSize = (pageSize) => {
    this.queryParams.pageNo = 1;
    this.queryParams.pageSize = pageSize;
    this.refreshTable();
  };

  addRole = () => {
    this.modalAttribute.title = 'Add Roles 新增角色';
    this.modalAttribute.isVisible = true;
    this.modalAttribute.modalForm.reset();
    this.modalAttribute.selectedUser = undefined;
    this.modalAttribute.modalListOfGroup = [];
    this.modalAttribute.referenceUserList = [];
  };

  editRole = (role: Role) => {
    this.modalAttribute.title = '编辑角色';
    this.modalAttribute.isVisible = true;
    //this.getRefUserListByRoleId(role);
    const { roleCode, roleName, describe, id } = role;
    this.modalAttribute.modalForm.reset();
    this.modalAttribute.modalForm.setValue({
      id,
      roleName,
      roleCode,
      describe
    });
  };

  removeRole = (role: Role) => {
    let url = `/act/role/deleteRole?id=${role.id}`;
    this.http.delete(url).subscribe(rest => {
      if (rest.code === '0000') {
        this.message.create('success', rest.msg);
        this.refreshTable();
      } else {
        this.toastrService.error(rest.msg);
      }
    });
  };

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

  syncCDData() {
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


  syncOEData() {
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


}
