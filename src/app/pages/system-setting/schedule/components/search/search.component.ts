import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import {DictService, HttpService } from '@core/services';
import * as moment from 'moment'
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'schedule-search',
  templateUrl: 'search.component.html',
  styleUrls: ['search.component.scss']
})

export class ScheduleSearchComponent implements OnInit {

  @Output() public search = new EventEmitter<any>();
  @Output() public setLoading = new EventEmitter<boolean>();

  @Input() formData: [];
  @Input() total: 0;
  @Input() loading: any = false;
  @Input() flag: any;
  
  public controlArray: any[] = [];
  public isCollapse = false;
 
  constructor(private fb: FormBuilder,
    private http: HttpService,
    private message: NzMessageService,
    private dictService: DictService) {
  }

  public formValues = this.fb.group({
    referenceNo: [null], //任务编号
    taskType: [null], // 任务类型
    taskName: [null], //任务名称
    isEnabled: [null], //任务状态

  })
  
  taskTypeList = [
    { code: 'email', label: '发送邮件' },
    { code: 'script', label: '执行脚本' },
  ];

  enabledList = [
    { code: true, label: '启用' },
    { code: false, label: '禁用' },
  ];

  ngOnInit() {
    
  }

  submitForm ($event: any, value: any) {
    $event.preventDefault();
    this.loading = true;
    this.setLoading.emit(this.loading);
    this.search.emit(value);
  }

  // 清空表单选项
  resetForm() {
    this.formValues.reset();
    this.loading = true;
    this.setLoading.emit(this.loading);
    this.search.emit({});
  }

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
    this.controlArray.forEach((c, index) => {
      c.show = this.isCollapse ? index < 6 : true;
    });
  }

}
