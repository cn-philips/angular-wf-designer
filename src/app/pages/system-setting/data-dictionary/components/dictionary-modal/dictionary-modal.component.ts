import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PermissionService } from '@app/modern-themes/services/permission.service';
import { HttpService } from '@core/services';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'data-dictionary-modal',
  templateUrl: './dictionary-modal.component.html',
  styleUrls: ['./dictionary-modal.component.scss']
})
export class DictionaryModalComponent implements OnInit {
  public validateForm: FormGroup;
  @Input() public isVisible: false;
  @Input() public formData = {
    dictGroup: undefined,
    dictKey: undefined,
    dictLabel: undefined,
    dictSort: undefined,
    dictValue: undefined,
    isDefault: undefined,
    status: undefined,
    remark: undefined
  };
  @Input() public isCreate = true;
  @Output() public passModelSwitch = new EventEmitter<any>();
  @Output() public reloadTable = new EventEmitter<any>();

  public dictGrouplList = [
    {
      label: '部门',
      value: '部门',
    },
  ];

  public dictSortlList = [
    {
      label: '升序',
      value: 1,
    },
    {
      label: '降序',
      value: 0,
    },
  ];

  public isDefaultlList = [
    {
      label: '是',
      value: 'Y',
    },
    {
      label: '否',
      value: 'N',
    },
  ];

  public isDeletedlList = [
    {
      label: '是',
      value: '1',
    },
    {
      label: '否',
      value: '0',
    },
  ];

  public statusList = [
    {
      label: '正常',
      value: '1',
    },
    {
      label: '停用',
      value: '0',
    },
  ];

  handleOk(): void {
    this.passModelSwitch.emit(false);
  }

  handleCancel(): void {
    this.passModelSwitch.emit(false);
  }

  public submitForm = (value: any) => {
    const url = this.isCreate === true ? `/act/ecom/dictData/addDictData` : `/act/ecom/dictData/updateDictData`;
    // console.log(this.isCreate);
    // console.log(url);
    // return false;
    // 数据字典增加
    // 数据字典更新 updateDictData
    this.http.post(url, value).subscribe(rest => {
      if (rest.code === '0000') {
        // 提交成功清空数据
        this.validateForm.reset();
        this.passModelSwitch.emit(false);
        this.reloadTable.emit(true);
        this.message.create('success', `${rest.msg}`);
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }

  public checkForm = (value: any) => {
    // $event.preventDefault();
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    console.log('value', value);
    console.log(this.validateForm.valid);
    if (!this.validateForm.valid) {
      this.nzMessageService.warning('缺少必填字段');
      return false;
    }
    if (this.isCreate) {
      // 数据字典key校验
      this.http.get(`/act/ecom/dictData/checkDictData?dictKey=${value.dictKey}`).subscribe(rest => {
        if (rest.code === '0000' && rest.data === 1) {
          console.log('------', rest);
          console.log('------', this.isCreate);
          this.submitForm(value);
        } else {
          this.message.create('error', '字典Key"' + value.dictKey + '"已存在');
        }
      });
    } else {
      this.submitForm(value);
    }
  }

  updateConfirmValidator(): void {
    /** wait for refresh value */
    Promise.resolve().then(() => this.validateForm.controls.checkPassword.updateValueAndValidity());
  }

  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.validateForm.controls.password.value) {
      return { confirm: true, error: true };
    }
    return {};
  };

  getCaptcha(e: MouseEvent): void {
    e.preventDefault();
  }

  constructor(
    private fb: FormBuilder,
    private nzMessageService: NzMessageService,
    private http: HttpService,
    private message: NzMessageService,
    private permission:PermissionService
  ) {
    console.log('this.isCreate', this.isCreate);
    if (this.isCreate) {
      // this.validateForm.reset();
    }
  }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      dictGroup: [null, [Validators.required]],
      dictKey: [null, [Validators.required]],
      dictLabel: [null, [Validators.required]],
      dictSort: [null, [Validators.required]],
      dictValue: [null, [Validators.required]],
      isDefault: [null,],
      // isDeleted: [null, [Validators.required]],
      remark: [null],
      status: [null, [Validators.required]],
    });
  }

}
