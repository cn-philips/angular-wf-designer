import {Component, OnInit} from '@angular/core';
import {Role} from '../domian/roleInfo';
import {HttpService} from '../services';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {User} from '../domian/userInfo';
import {ToastrService} from 'ngx-toastr';

class QueryParams {
  loading: boolean;
  total: number;
  pageIndex: number;
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
    this.referenceUserList.forEach(({id}) => {
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
    this.referenceUserList = this.referenceUserList.filter(({id}) => {
      return user.id != id;
    });
  };
}

@Component({
  selector: 'role-list',
  templateUrl: './rolelist.component.html',
  styleUrls: ['./rolelist.component.scss']
})
export class RolelistComponent implements OnInit {

  listOfRole: Role[];
  queryParams: QueryParams;
  listOfGroup: { [key: string]: string };
  modalAttribute: ModalAttribute;

  constructor(private http: HttpService,
              private toastrService: ToastrService,
              private fb: FormBuilder) {
    this.listOfRole = [];
    this.queryParams = {
      loading: false,
      total: 0,
      pageIndex: 1,
      pageSize: 20,
      queryForm: this.fb.group({
        roleCode: [],
        roleName: [],
        group: []
      }),
    };
  //  this.initModalAttribute();
    //this.refreshTable();
  }

  ngOnInit(): void {

  }

  // initModalAttribute = () => {
  //   this.modalAttribute = new ModalAttribute();
  //   this.modalAttribute.referenceUserList = [];
  //   this.modalAttribute.modalForm = this.fb.group({
  //     id: [null],
  //     group: [null, [Validators.required]],
  //     roleCode: [null, [Validators.required]],
  //     name: [null, [Validators.required]],
  //     description: []
  //   });
  //   this.modalAttribute.searchUser = (keyword) => {
  //     keyword && keyword.length >= 3 && this.http.get(`/act/queryUserByKeyword/${keyword}`).subscribe(rest => {
  //       if (rest.code === '0000') {
  //         this.modalAttribute.userList = rest.data.map(item => {
  //           return {
  //             text: item.name,
  //             value: item,
  //           };
  //         });
  //       }
  //     });
  //   };
  //   this.modalAttribute.modalOk = () => {
  //     const checkFormData = () => {
  //       for (const i in this.modalAttribute.modalForm.controls) {
  //         this.modalAttribute.modalForm.controls[i].markAsDirty();
  //         this.modalAttribute.modalForm.controls[i].updateValueAndValidity();
  //       }
  //       return this.modalAttribute.modalForm.valid;
  //     };

  //     if (!checkFormData()) {
  //       return;
  //     }
  //     const {id, roleCode, description, group, name} = this.modalAttribute.modalForm.getRawValue();
  //     console.log('this.modalAttribute.modalOk', group);
  //     const userList = this.modalAttribute.referenceUserList;
  //     const refUserIds = userList.map(item => {
  //       return item.id;
  //     });
  //     const saveData = {
  //       id,
  //       roleCode,
  //       description,
  //       groupId: group,
  //       name,
  //       refUserIds
  //     };
  //     console.log('saveData', saveData);
  //     this.http.post(`/act/role/save`, saveData).subscribe(rest => {
  //       if (rest.code === '0000') {
  //         this.toastrService.success('保存成功！');
  //         this.modalAttribute.isVisible = false;
  //         this.refreshTable();
  //       } else {
  //         this.toastrService.error(rest.msg);
  //       }
  //     });

  //   };
  // };

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

  // queryForm = () => {
  //   this.queryParams.pageIndex = 1;
  //   this.refreshTable();
  // };

  // refreshTable = () => {
  //   this.queryParams.loading = true;
  //   this.http.post('/act/role/query', {
  //     pageSize: this.queryParams.pageSize,
  //     pageIndex: this.queryParams.pageIndex,
  //     ...this.queryParams.queryForm.getRawValue()
  //   }).subscribe(rest => {
  //     if (rest.code === '0000') {
  //       const {total, rows} = rest.data;
  //       this.listOfRole = [...rows];
  //       this.queryParams.total = total;
  //     }
  //     this.queryParams.loading = false;
  //   });
  // };

  // resetQueryForm = () => {
  //   this.queryParams.queryForm.reset();
  //   this.refreshTable();
  // };

  // changeIndex = (pageIndex) => {
  //   this.queryParams.pageIndex = pageIndex;
  //   this.refreshTable();
  // };

  // changeSize = (pageSize) => {
  //   this.queryParams.pageIndex = 1;
  //   this.queryParams.pageSize = pageSize;
  //   this.refreshTable();
  // };

  // addRole = () => {
  //   this.modalAttribute.title = '新增角色';
  //   this.modalAttribute.isVisible = true;
  //   this.modalAttribute.modalForm.reset();
  //   this.modalAttribute.selectedUser = undefined;
  //   this.modalAttribute.modalListOfGroup = [];
  //   this.modalAttribute.referenceUserList = [];
  // };

  // editRole = (role: Role) => {
  //   this.modalAttribute.title = '编辑角色';
  //   this.modalAttribute.isVisible = true;
  //   this.getRefUserListByRoleId(role);
  //   const {roleCode, name, group, description, id} = role;
  //   this.modalAttribute.modalForm.reset();
  //   const selectGroup =
  //     {
  //       text: group.name,
  //       value: group.id
  //     };
  //   this.modalAttribute.modalListOfGroup = [selectGroup];
  //   this.modalAttribute.modalForm.setValue({
  //     id,
  //     name,
  //     roleCode,
  //     group: group.id,
  //     description
  //   });
  // };

  // removeRole = (role: Role) => {
  //   this.http.delete(`/act/role/remove/${role.id}`).subscribe(rest => {
  //     if (rest.code === '0000') {
  //       this.toastrService.success('移除成功！');
  //       this.refreshTable();
  //     } else {
  //       this.toastrService.error(rest.msg);
  //     }
  //   });
  // };


};
