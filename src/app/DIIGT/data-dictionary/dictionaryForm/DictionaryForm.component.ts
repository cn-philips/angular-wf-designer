import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable, Observer } from 'rxjs';
import {Router, ActivatedRoute} from '@angular/router';
import {HttpService} from '../../../services';
import {ToastrService} from 'ngx-toastr';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'igt-DictionaryForm',
  templateUrl: './DictionaryForm.component.html',
  styleUrls: ['./DictionaryForm.component.scss']
})
export class DictionaryFormComponent implements OnInit {
  @Output() passFormValues = new EventEmitter<any>();
  @Output() passModelSwitch = new EventEmitter<any>();
  @Output() passIsCreate = new EventEmitter<any>();
  value: string;
  selectedValue = null;
  validateForm: FormGroup;
  dateFormat = 'yyyy/MM/dd';

  date = null; // new Date();
  dateRange = []; // [ new Date(), addDays(new Date(), 3) ];
  isEnglish = false;

  controlArray: any[] = [];

  public dictGrouplList = [];

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

  onChange(result: Date): void {
    console.log('Selected Time: ', result);
  }

  searchForm(): void {
    console.log('searchForm');
  }

  openModel(e: MouseEvent): void {
    e.preventDefault();
    this.passModelSwitch.emit(true);
    this.passIsCreate.emit(true);
  }

  projectReport(e: MouseEvent): void {
    e.preventDefault();
    console.log('projectReport');
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
    private router: Router,
    private http: HttpService,
    private toastrService: ToastrService,
    private message: NzMessageService,
  ) {
    this.getGroupList();
  }

  public getGroupList() {
    // 数据字典查询
    this.http.post(`/act/ecom/dictData/queryGroupDictData`, {
      dictGroup: '',
      // status: 0,
      dictKey: '',
    }).subscribe(rest => {
      if (rest.code === '0000') {
        this.dictGrouplList = rest.data;
      } else {
        this.message.create('error', `${rest.msg}`);
      }
    });
  }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      dictGroup:  [null],
      status: [null],
    });
  }

  submitForm = ($event: any, value: any) => {
    $event.preventDefault();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
      this.validateForm.controls[key].updateValueAndValidity();
    }
    this.passFormValues.emit(value);
  }
  // 清空表单选项
  resetForm () {
    this.validateForm.reset();
    // this.passFormValues.emit({});
  }

  validateConfirmPassword(): void {
    setTimeout(() => this.validateForm.controls.confirm.updateValueAndValidity());
  }

  userNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      setTimeout(() => {
        if (control.value === 'JasonWood') {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      }, 1000);
    });

  confirmValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.validateForm.controls.password.value) {
      return { confirm: true, error: true };
    }
    return {};
  };

}
