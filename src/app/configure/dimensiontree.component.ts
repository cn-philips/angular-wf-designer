import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, FormBuilder, Validators} from '@angular/forms';
import {DimensionTree} from '../domian/dimensionTree';
import {HttpService} from '../services';
import {ToastrService} from 'ngx-toastr';

class ModalAttribute {
  validateForm: FormGroup;
  isVisible: boolean = false;
  title: string = '';
  listOfRoles: Array<{ value: number; text: string }> = [];
  modalCancel: Function = () => {
    this.isVisible = false;
  };
  modalOk: Function;
  searchRole: Function;
}


@Component({
  selector: 'dimension-tree',
  templateUrl: './dimensiontree.component.html',
  styleUrls: ['./dimensiontree.component.scss']
})
export class DimensiontreeComponent implements OnInit {

  modalAttribute: ModalAttribute;

  selectedDimensionType: string;

  dimensionTypeList: string[];

  mapOfExpandedData: { [key: string]: DimensionTree[] } = {};

  dimensionTreeList: DimensionTree[];

  dimensionLoading: boolean = false;

  ngOnInit(): void {

  }

  constructor(private http: HttpService,
              private toastrService: ToastrService,
              private fb: FormBuilder) {
    this.loadDimension();
    this.dimensionTypeList = [];
    this.dimensionTreeList = [];
    this.modalAttribute = new ModalAttribute();
    this.modalAttribute.searchRole = (keyword: string): void => {
      keyword && http.get(`/act/role/queryRoleByKeyword/${keyword}`).subscribe(res => {
        this.modalAttribute.listOfRoles = res.data.map(role => {
          return {
            value: role,
            text: role.name,
          };
        });
      });
    };
    this.modalAttribute.validateForm = this.fb.group({
      dimensionType: [null, [Validators.required]],
      dimensionCode: [null, [Validators.required]],
      dimensionName: [null],
      role: [null, [Validators.required]]
    });
  }

  changeDimensionType = (value) => {
    //deep copy dimensionListByType
    this.dimensionLoading = true;
    this.http.get(`/act/dimension/queryDimensionTreeByType/${value}`).subscribe(res => {
      if ('0000' == res.code) {
        this.refreshDimensionTree(res.data as any[]);
      } else {
        this.toastrService.error(res.msg, res.code);
      }
      this.dimensionLoading = false;
    });
  };

  refreshDimensionTree = (response: any[]) => {
    let rootDimensionTree = {
      children: []
    };
    let result: DimensionTree[] = response.map(item => {
      return {...item, parentId: item.parent};
    });
    this.generateDimensionTree(result, null, rootDimensionTree);
    this.dimensionTreeList = rootDimensionTree.children;
    this.dimensionTreeList.forEach(item => {
      const expandedKeys = this.getExpandedIdList(this.mapOfExpandedData[item.key]);
      this.mapOfExpandedData[item.key] = this.convertTreeToList(item, expandedKeys);
    });

  };

  getExpandedIdList = (expandedList: DimensionTree[]): string[] => {
    let expandedKeys: string[] = [];
    expandedList && expandedList.forEach(item => {
      if (item.expand) {
        expandedKeys.push(item.key);
      }
    });
    return expandedKeys;
  };


  loadDimension = () => {
    this.http.get('/act/dimension/queryAllDimensionType').subscribe(res => {
      if ('0000' == res.code) {
        this.dimensionTypeList = res.data;
      } else {
        this.toastrService.error(res.msg, res.code);
      }
    });

  };

  generateDimensionTree = (dimensionTreeList: DimensionTree[], _parentId: number, tree: object) => {
    const childList = dimensionTreeList.filter(({parentId}) => parentId === _parentId || (!_parentId && !parentId));
    if (childList.length > 0) {
      let copyChildList: DimensionTree[] = [];
      for (let index in childList) {
        const dimensionTreeItem = childList[index];
        const key = tree['key'] ? dimensionTreeItem.id + '_' + tree['key'] : dimensionTreeItem.id + '';
        let dimensionTreeItemCopy = {...dimensionTreeItem, key};
        this.generateDimensionTree(dimensionTreeList, dimensionTreeItem['id'], dimensionTreeItemCopy);
        copyChildList.push(dimensionTreeItemCopy);
      }
      tree['children'] = copyChildList;
    }
  };

  collapse(array: DimensionTree[], data: DimensionTree, $event: boolean): void {
    // console.log('collapse:mapOfExpandedData', this.mapOfExpandedData, ',event:', $event);
    if ($event === false) {
      if (data.children) {
        data.children.forEach(d => {
          const target = array.find(a => a.key === d.key)!;
          target.expand = false;
          this.collapse(array, target, false);
        });
      } else {
        return;
      }
    }
  }

  convertTreeToList(root: any, expandKeys: string[]): DimensionTree[] {
    const stack: any[] = [];
    const array: any[] = [];
    const hashMap = {};
    stack.push({...root, level: 0, expand: expandKeys.indexOf(root.key) >= 0});
    while (stack.length !== 0) {
      const node = stack.pop();
      this.visitNode(node, hashMap, array);
      if (node.children) {
        for (let i = node.children.length - 1; i >= 0; i--) {
          stack.push({...node.children[i], level: node.level + 1, expand: expandKeys.indexOf(node.children[i].key) >= 0, parent: node});
        }
      }
    }
    return array;
  }

  visitNode(node: DimensionTree, hashMap: { [key: string]: any }, array: DimensionTree[]): void {
    if (!hashMap[node.key]) {
      hashMap[node.key] = true;
      array.push(node);
    }
  }

  //删除表单数据
  remove = (item: DimensionTree) => {
    this.http.delete(`/act/dimension/removeNode/${item.id}`).subscribe(
      res => {
        if ('0000' == res.code) {
          this.refreshDimensionTree(res.data as any[]);
          this.modalAttribute.isVisible = false;
          this.loadDimension();
          this.toastrService.success('操作成功!');
        } else {
          this.toastrService.error(res.msg, res.code);
        }
      }
    );
  };

  //插入维度树数据
  insert = (parentItem: DimensionTree) => {
    this.resetForm();
    this.setForm({
      dimensionType: this.selectedDimensionType,
      dimensionCode: [],
      dimensionName: [],
      role: []
    });
    this.modalAttribute.title = '插入子节点到维度树';
    this.modalAttribute.isVisible = true;
    this.modalAttribute.modalOk = () => {
      if (!this.checkFormData()) {
        return;
      }
      //插入的child
      const formData = this.getFormData();
      this.http.post('/act/dimension/insertNewNode', {...formData, parent: parentItem.id, roleId: formData.role.id}).subscribe(
        res => {
          if ('0000' == res.code) {
            parentItem.expand = true;
            this.refreshDimensionTree(res.data as any[]);
            this.modalAttribute.isVisible = false;
          } else {
            this.toastrService.error(res.msg, res.code);
          }
        }
      );

    };
  };

  expandedAllParent = (expandedDataList: DimensionTree[], expandedElement: DimensionTree) => {
    expandedElement.expand = true;
    if (!!expandedElement.parent) {
      for (let index in expandedDataList) {
        let parentExpanded = expandedDataList[index];
        if (expandedDataList[index].id === expandedElement.parent.id) {
          this.expandedAllParent(expandedDataList, parentExpanded);
        }
      }
    }
  };


  //编辑维度树数据
  edit = (item: DimensionTree) => {
    this.resetForm();
    this.setForm(item);
    this.modalAttribute.title = '编辑维度树节点';
    this.modalAttribute.isVisible = true;
    this.modalAttribute.modalOk = () => {
      if (!this.checkFormData()) {
        return;
      }
      //插入的child
      const formData = this.getFormData();
      const parent = item.parent ? (item.parent.id ? item.parent.id : item.parent) : item.parent;
      this.http.post('/act/dimension/update', {...item, ...formData, parent: parent, roleId: formData.role.id}).subscribe(
        res => {
          if ('0000' === res.code) {
            this.refreshDimensionTree(res.data as any[]);
            this.modalAttribute.isVisible = false;
          } else {
            this.toastrService.error(res.msg, res.code);
          }
        }
      );
    };
  };

  //创建维度树
  createTreeRoot = () => {
    this.resetForm();
    this.modalAttribute.title = '创建维度树根节点';
    this.modalAttribute.validateForm.setControl('dimensionType', new FormControl({
      value: this.selectedDimensionType,
      disabled: false
    }, Validators.required));
    this.modalAttribute.isVisible = true;
    this.modalAttribute.modalOk = () => {
      if (!this.checkFormData()) {
        return;
      }
      const formData = this.getFormData();
      this.http.post('/act/dimension/insertNewNode', {...formData, parent: null, roleId: formData.role.id}).subscribe(
        res => {
          if ('0000' == res.code) {
            this.refreshDimensionTree(res.data as any[]);
            if (this.dimensionTypeList.indexOf(formData.dimensionType) < 0) {
              this.dimensionTypeList = [...this.dimensionTypeList, formData.dimensionType];
            }
            this.selectedDimensionType = formData.dimensionType;
            this.modalAttribute.isVisible = false;
          } else {
            this.toastrService.error(res.msg, res.code);
          }
        }
      );
    };
  };

  getFormData = (): DimensionTree => {
    const dimensionTree: DimensionTree = this.modalAttribute.validateForm.getRawValue();
    return dimensionTree;
  };

  checkFormData = () => {
    for (const i in this.modalAttribute.validateForm.controls) {
      this.modalAttribute.validateForm.controls[i].markAsDirty();
      this.modalAttribute.validateForm.controls[i].updateValueAndValidity();
    }
    return this.modalAttribute.validateForm.valid;
  };

  setForm = (item: any): void => {
    const {dimensionType, dimensionCode, dimensionName, role} = item;
    this.modalAttribute.validateForm.setValue({
      dimensionType,
      dimensionCode,
      dimensionName,
      role
    });
    if (role) {
      this.modalAttribute.listOfRoles = [
        {
          value: role,
          text: role.name
        }
      ];
    }
  };

  resetForm = (): void => {
    this.modalAttribute.validateForm.setControl('dimensionType', new FormControl({value: null, disabled: true}));
    this.modalAttribute.validateForm.reset();
    this.modalAttribute.listOfRoles = [];
  };

  findTargetDimensionElementByKey = (dimensionList: DimensionTree[], key: string) => {
    for (let index = 0; index < dimensionList.length; index++) {
      let dimensionElement = dimensionList[index];
      if (dimensionElement.key === key) {
        return dimensionElement;
      }
      return this.findTargetDimensionElementByKey(dimensionElement.children, key);
    }
    return null;
  };


}
